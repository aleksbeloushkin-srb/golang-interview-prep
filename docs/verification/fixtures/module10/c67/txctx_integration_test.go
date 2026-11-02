//go:build integration

package txctx

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"slices"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
)

var pool *pgxpool.Pool

func TestMain(m *testing.M) { os.Exit(runTests(m)) }

func runTests(m *testing.M) int {
	ctx := context.Background()
	ctr, err := tcpostgres.Run(ctx, "postgres:16-alpine", tcpostgres.BasicWaitStrategies())
	if err != nil {
		fmt.Fprintln(os.Stderr, "start postgres:", err)
		return 1
	}
	defer func() { _ = testcontainers.TerminateContainer(ctr) }()
	dsn, err := ctr.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		fmt.Fprintln(os.Stderr, "dsn:", err)
		return 1
	}
	if pool, err = pgxpool.New(ctx, dsn); err != nil {
		fmt.Fprintln(os.Stderr, "pool:", err)
		return 1
	}
	defer pool.Close()
	if _, err := pool.Exec(ctx, `CREATE TABLE entries (id int PRIMARY KEY); CREATE TABLE docs (body jsonb)`); err != nil {
		fmt.Fprintln(os.Stderr, "schema:", err)
		return 1
	}
	return m.Run()
}

func reset(t *testing.T) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), `TRUNCATE entries`); err != nil {
		t.Fatal(err)
	}
}

func count(t *testing.T) int {
	t.Helper()
	var n int
	if err := pool.QueryRow(context.Background(), `SELECT count(*) FROM entries`).Scan(&n); err != nil {
		t.Fatal(err)
	}
	return n
}

func insert(m *Manager, id int) func(context.Context) error {
	return func(ctx context.Context) error {
		_, err := m.DB(ctx).Exec(ctx, `INSERT INTO entries VALUES ($1)`, id)
		return err
	}
}

func TestTwoRepositoriesCommitTogetherOrNotAtAll(t *testing.T) {
	reset(t)
	m := New(pool)
	ctx := context.Background()
	var seen []int
	err := m.Run(ctx, func(ctx context.Context) error {
		if err := insert(m, 1)(ctx); err != nil {
			return err
		}
		AfterCommit(ctx, func(context.Context) { seen = append(seen, count(t)) })
		return insert(m, 2)(ctx)
	})
	if err != nil || !slices.Equal(seen, []int{2}) {
		t.Fatalf("err %v, hook saw %v rows; want both rows visible to the hook", err, seen)
	}

	err = m.Run(ctx, func(ctx context.Context) error {
		if err := insert(m, 3)(ctx); err != nil {
			return err
		}
		return insert(m, 1)(ctx) // duplicate key
	})
	if err == nil || count(t) != 2 {
		t.Fatalf("err %v, rows %d; want an error and row 3 rolled back", err, count(t))
	}
}

func TestSwallowedInnerErrorStillAbortsJoinedTransaction(t *testing.T) {
	reset(t)
	m := New(pool)
	err := m.Run(context.Background(), func(ctx context.Context) error {
		_ = m.Run(ctx, insert(m, 1))
		_ = m.Run(ctx, insert(m, 1)) // fails; the caller ignores it and goes on
		return nil
	})
	if !errors.Is(err, pgx.ErrTxCommitRollback) || count(t) != 0 {
		t.Fatalf("err %v, rows %d; want ErrTxCommitRollback and nothing committed", err, count(t))
	}
}

func TestSavepointRollsBackOnlyInnerPart(t *testing.T) {
	reset(t)
	m := New(pool)
	err := m.Run(context.Background(), func(ctx context.Context) error {
		if err := insert(m, 1)(ctx); err != nil {
			return err
		}
		sp, err := stateFrom(ctx).tx.Begin(ctx) // SAVEPOINT
		if err != nil {
			return err
		}
		if _, err := sp.Exec(ctx, `INSERT INTO entries VALUES (1)`); err == nil {
			return errors.New("duplicate accepted")
		}
		if err := sp.Rollback(ctx); err != nil { // ROLLBACK TO SAVEPOINT
			return err
		}
		return insert(m, 2)(ctx)
	})
	if err != nil || count(t) != 2 {
		t.Fatalf("err %v, rows %d; want 2 rows after the savepoint rollback", err, count(t))
	}
}

func TestGoroutineWithTxContextOutlivesTransaction(t *testing.T) {
	m := New(pool)
	var leaked context.Context
	if err := m.Run(context.Background(), func(ctx context.Context) error {
		leaked = ctx // as if a goroutine started here ran later
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	_, err := m.DB(leaked).Exec(leaked, `SELECT 1`)
	if !errors.Is(err, pgx.ErrTxClosed) {
		t.Fatalf("err %v, want ErrTxClosed", err)
	}
}

func tryXactLock(t *testing.T, key string) bool {
	t.Helper()
	var ok bool
	if err := pool.QueryRow(context.Background(), `SELECT pg_try_advisory_xact_lock($1)`, lockID(key)).Scan(&ok); err != nil {
		t.Fatal(err)
	}
	return ok
}

func TestXactLockIsReleasedAtCommit(t *testing.T) {
	m := New(pool)
	err := m.Run(context.Background(), func(ctx context.Context) error {
		if err := LockKey(ctx, "account:42"); err != nil {
			return err
		}
		if tryXactLock(t, "account:42") {
			return errors.New("another session took a held lock")
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if !tryXactLock(t, "account:42") {
		t.Fatal("the transaction lock outlived COMMIT")
	}
}

func TestSessionLockSurvivesCommit(t *testing.T) {
	ctx := context.Background()
	holder, err := pool.Acquire(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer holder.Release()
	other, err := pool.Acquire(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer other.Release()

	try := func(c *pgxpool.Conn) bool {
		var ok bool
		if err := c.QueryRow(ctx, `SELECT pg_try_advisory_lock(42)`).Scan(&ok); err != nil {
			t.Fatal(err)
		}
		return ok
	}
	tx, err := holder.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tx.Exec(ctx, `SELECT pg_advisory_lock(42)`); err != nil {
		t.Fatal(err)
	}
	if err := tx.Commit(ctx); err != nil {
		t.Fatal(err)
	}
	if try(other) {
		t.Fatal("another connection got a session lock that should have survived COMMIT")
	}
	if !try(holder) {
		t.Fatal("the holding session must get its own lock again")
	}
	// Taken twice, so it is released only by the second unlock.
	for range 2 {
		if _, err := holder.Exec(ctx, `SELECT pg_advisory_unlock(42)`); err != nil {
			t.Fatal(err)
		}
	}
	if !try(other) {
		t.Fatal("the lock is still held after two unlocks")
	}
	if _, err := other.Exec(ctx, `SELECT pg_advisory_unlock(42)`); err != nil {
		t.Fatal(err)
	}
}

// preparedAfterRun runs one transaction on a single-connection pool and
// counts the named prepared statements left in that server session.
func preparedAfterRun(t *testing.T, txPooler bool, id int) int {
	t.Helper()
	ctx := context.Background()
	cfg, err := PoolConfig(pool.Config().ConnString(), txPooler)
	if err != nil {
		t.Fatal(err)
	}
	cfg.MaxConns = 1 // the count below must run in the same session
	p, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer p.Close()
	m := New(p)
	if err := m.Run(ctx, insert(m, id)); err != nil {
		t.Fatal(err)
	}
	var prepared int
	if err := p.QueryRow(ctx, `SELECT count(*) FROM pg_prepared_statements`).Scan(&prepared); err != nil {
		t.Fatal(err)
	}
	return prepared
}

func TestExecModeLeavesNoPreparedStatements(t *testing.T) {
	reset(t)
	if n := preparedAfterRun(t, false, 1); n == 0 {
		t.Fatal("default mode: want named prepared statements cached in the session")
	}
	if n := preparedAfterRun(t, true, 2); n != 0 {
		t.Fatalf("exec mode: %d named prepared statements, want 0", n)
	}
	if count(t) != 2 {
		t.Fatalf("rows %d, want 2", count(t))
	}
}

// Exec and simple protocol modes take the parameter type from the Go value,
// so []byte goes as bytea and jsonb rejects it; the default mode learns the
// column type when it prepares the statement.
func TestBytesIntoJSONBDependOnExecMode(t *testing.T) {
	ctx := context.Background()
	doc := `{"amount_minor":1500}`
	for _, tt := range []struct {
		mode   pgx.QueryExecMode
		name   string
		arg    any
		wantOK bool
	}{
		{pgx.QueryExecModeCacheStatement, "[]byte", []byte(doc), true},
		{pgx.QueryExecModeExec, "[]byte", []byte(doc), false},
		{pgx.QueryExecModeSimpleProtocol, "[]byte", []byte(doc), false},
		{pgx.QueryExecModeExec, "json.RawMessage", json.RawMessage(doc), true},
		{pgx.QueryExecModeExec, "string", doc, true},
		{pgx.QueryExecModeSimpleProtocol, "json.RawMessage", json.RawMessage(doc), true},
		{pgx.QueryExecModeSimpleProtocol, "string", doc, true},
	} {
		t.Run(fmt.Sprintf("%v %s", tt.mode, tt.name), func(t *testing.T) {
			_, err := pool.Exec(ctx, `INSERT INTO docs (body) VALUES ($1)`, tt.mode, tt.arg)
			var pgErr *pgconn.PgError
			switch {
			case tt.wantOK && err != nil:
				t.Fatalf("err %v, want the insert to pass", err)
			case !tt.wantOK && (!errors.As(err, &pgErr) || pgErr.Code != "22P02"):
				t.Fatalf("err %v, want 22P02 invalid_text_representation", err)
			}
		})
	}
}
