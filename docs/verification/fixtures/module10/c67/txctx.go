// Package txctx carries a database transaction in context.Context. A use
// case wraps several repository calls in Manager.Run and never sees SQL
// types; a repository asks Manager.DB(ctx) and runs inside the caller's
// transaction, or on the pool when there is none.
//
// The price is an invisible dependency: a repository method called outside
// Run silently autocommits, and a goroutine started inside Run inherits a
// transaction that will be closed under it. Start such work from AfterCommit.
package txctx

import (
	"context"
	"errors"
	"fmt"
	"hash/fnv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Querier is the part of pgx shared by a pool, a connection and a tx.
type Querier interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

// Pool is what Manager needs; *pgxpool.Pool implements it.
type Pool interface {
	Querier
	Begin(ctx context.Context) (pgx.Tx, error)
}

// ErrNoTx is returned by operations that are only correct inside Run.
var ErrNoTx = errors.New("txctx: no transaction in context")

const rollbackTimeout = 5 * time.Second

// Manager opens transactions and finds the right Querier for a ctx.
type Manager struct{ pool Pool }

// New returns a Manager over pool.
func New(pool Pool) *Manager { return &Manager{pool: pool} }

type txKey struct{}

type txState struct {
	tx    pgx.Tx
	hooks []func(context.Context)
}

func stateFrom(ctx context.Context) *txState {
	st, _ := ctx.Value(txKey{}).(*txState)
	return st
}

// Run executes fn in a transaction. A nested Run joins the outer one, and
// the outermost Run decides: an error or a panic in fn rolls back and drops
// the hooks; otherwise Run commits and then runs the AfterCommit hooks in
// registration order.
func (m *Manager) Run(ctx context.Context, fn func(ctx context.Context) error) (err error) {
	if stateFrom(ctx) != nil {
		return fn(ctx)
	}
	tx, err := m.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("txctx: begin: %w", err)
	}
	committed := false
	defer func() {
		if committed {
			return
		}
		// Also runs on panic, which then goes on up the stack.
		if rbErr := rollback(ctx, tx); rbErr != nil && err != nil {
			err = errors.Join(err, rbErr)
		}
	}()

	st := &txState{tx: tx}
	if err := fn(context.WithValue(ctx, txKey{}, st)); err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		// The server may have committed before the connection broke: the
		// outcome is unknown, and a caller that must know re-reads.
		return fmt.Errorf("txctx: commit: %w", err)
	}
	committed = true

	// Hooks get the caller's values without the transaction and without its
	// cancellation: the data is committed even if the client has gone.
	hookCtx := context.WithoutCancel(ctx)
	for _, hook := range st.hooks {
		hook(hookCtx)
	}
	return nil
}

func rollback(ctx context.Context, tx pgx.Tx) error {
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), rollbackTimeout)
	defer cancel()
	if err := tx.Rollback(ctx); err != nil && !errors.Is(err, pgx.ErrTxClosed) {
		return fmt.Errorf("txctx: rollback: %w", err)
	}
	return nil
}

// DB returns the transaction carried by ctx, or the pool if there is none.
func (m *Manager) DB(ctx context.Context) Querier {
	if st := stateFrom(ctx); st != nil {
		return st.tx
	}
	return m.pool
}

// InTx reports whether ctx carries a transaction. Methods that are only
// correct inside one, such as SELECT … FOR UPDATE, check it and fail loudly.
func InTx(ctx context.Context) bool { return stateFrom(ctx) != nil }

// AfterCommit registers hook to run after the outermost commit; a rollback
// drops it. Without a transaction the hook runs at once, because the write
// before it has already autocommitted. Hooks run synchronously on the
// committing goroutine, so keep them short: signal a worker, record a metric.
// They are lost if the process dies right after the commit, so they do not
// replace an outbox.
func AfterCommit(ctx context.Context, hook func(context.Context)) {
	if st := stateFrom(ctx); st != nil {
		st.hooks = append(st.hooks, hook)
		return
	}
	hook(ctx)
}

// LockKey takes a transaction-level advisory lock on key: concurrent Runs
// that lock the same key wait for each other, and PostgreSQL releases the
// lock by itself at COMMIT or ROLLBACK. In autocommit the lock would be
// released right after its own statement, so LockKey requires a transaction.
func LockKey(ctx context.Context, key string) error {
	st := stateFrom(ctx)
	if st == nil {
		return ErrNoTx
	}
	if _, err := st.tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1)`, lockID(key)); err != nil {
		return fmt.Errorf("txctx: lock %q: %w", key, err)
	}
	return nil
}

// lockID maps a key to the bigint space of advisory locks; the hash is
// computed in Go, so it does not depend on a server function.
func lockID(key string) int64 {
	h := fnv.New64a()
	_, _ = h.Write([]byte(key))
	return int64(h.Sum64())
}
