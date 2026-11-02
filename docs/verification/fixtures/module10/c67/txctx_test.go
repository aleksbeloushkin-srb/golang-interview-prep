package txctx

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// fakeTx writes every call into a shared journal. The embedded interface is
// nil: other methods would panic, and Run never calls them.
type fakeTx struct {
	pgx.Tx
	journal   *[]string
	commitErr error
}

func (f *fakeTx) Exec(_ context.Context, sql string, args ...any) (pgconn.CommandTag, error) {
	*f.journal = append(*f.journal, fmt.Sprint("exec ", sql, args))
	return pgconn.CommandTag{}, nil
}

func (f *fakeTx) Commit(context.Context) error {
	*f.journal = append(*f.journal, "commit")
	return f.commitErr
}

func (f *fakeTx) Rollback(context.Context) error {
	*f.journal = append(*f.journal, "rollback")
	return nil
}

type fakePool struct {
	Querier
	journal []string
	tx      *fakeTx
}

func (p *fakePool) Begin(context.Context) (pgx.Tx, error) {
	p.journal = append(p.journal, "begin")
	return p.tx, nil
}

func newFake() (*Manager, *fakePool) {
	p := &fakePool{}
	p.tx = &fakeTx{journal: &p.journal}
	return New(p), p
}

func note(p *fakePool, s string) func(context.Context) {
	return func(context.Context) { p.journal = append(p.journal, s) }
}

type requestIDKey struct{}

func TestRunCommitsThenRunsHooksInOrder(t *testing.T) {
	m, p := newFake()
	ctx := context.WithValue(context.Background(), requestIDKey{}, "req-1")
	var hookCtx context.Context

	err := m.Run(ctx, func(ctx context.Context) error {
		if _, err := m.DB(ctx).Exec(ctx, "UPDATE accounts"); err != nil {
			return err
		}
		AfterCommit(ctx, note(p, "wake relay"))
		AfterCommit(ctx, func(ctx context.Context) {
			hookCtx = ctx
			p.journal = append(p.journal, "metric")
		})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"begin", "exec UPDATE accounts[]", "commit", "wake relay", "metric"}
	if !slices.Equal(p.journal, want) {
		t.Fatalf("journal %q, want %q", p.journal, want)
	}
	if InTx(hookCtx) || hookCtx.Value(requestIDKey{}) != "req-1" {
		t.Fatal("a hook must see the request values but not the finished transaction")
	}
}

func TestErrorRollsBackAndDropsHooks(t *testing.T) {
	m, p := newFake()
	boom := errors.New("insufficient funds")
	err := m.Run(context.Background(), func(ctx context.Context) error {
		AfterCommit(ctx, note(p, "wake relay"))
		return boom
	})
	if !errors.Is(err, boom) {
		t.Fatalf("err %v, want %v", err, boom)
	}
	if want := []string{"begin", "rollback"}; !slices.Equal(p.journal, want) {
		t.Fatalf("journal %q, want %q", p.journal, want)
	}
}

func TestNestedRunJoinsAndItsHookWaitsForOuterCommit(t *testing.T) {
	m, p := newFake()
	err := m.Run(context.Background(), func(ctx context.Context) error {
		if err := m.Run(ctx, func(ctx context.Context) error {
			AfterCommit(ctx, note(p, "inner hook"))
			return nil
		}); err != nil {
			return err
		}
		p.journal = append(p.journal, "outer continues")
		AfterCommit(ctx, note(p, "outer hook"))
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"begin", "outer continues", "commit", "inner hook", "outer hook"}
	if !slices.Equal(p.journal, want) {
		t.Fatalf("journal %q, want %q", p.journal, want)
	}
}

func TestNestedErrorRollsBackWholeUnit(t *testing.T) {
	m, p := newFake()
	boom := errors.New("limit exceeded")
	err := m.Run(context.Background(), func(ctx context.Context) error {
		AfterCommit(ctx, note(p, "wake relay"))
		return m.Run(ctx, func(context.Context) error { return boom })
	})
	if !errors.Is(err, boom) {
		t.Fatalf("err %v, want %v", err, boom)
	}
	if want := []string{"begin", "rollback"}; !slices.Equal(p.journal, want) {
		t.Fatalf("journal %q, want %q", p.journal, want)
	}
}

func TestPanicRollsBackAndPropagates(t *testing.T) {
	m, p := newFake()
	defer func() {
		if recover() == nil {
			t.Fatal("the panic must reach the caller")
		}
		if want := []string{"begin", "rollback"}; !slices.Equal(p.journal, want) {
			t.Fatalf("journal %q, want %q", p.journal, want)
		}
	}()
	_ = m.Run(context.Background(), func(ctx context.Context) error {
		AfterCommit(ctx, note(p, "wake relay"))
		panic("nil map")
	})
}

func TestFailedCommitSkipsHooks(t *testing.T) {
	m, p := newFake()
	p.tx.commitErr = errors.New("connection reset")
	err := m.Run(context.Background(), func(ctx context.Context) error {
		AfterCommit(ctx, note(p, "wake relay"))
		return nil
	})
	if !errors.Is(err, p.tx.commitErr) {
		t.Fatalf("err %v, want the commit error", err)
	}
	if slices.Contains(p.journal, "wake relay") {
		t.Fatalf("journal %q: a hook ran although the commit failed", p.journal)
	}
}

func TestOutsideRun(t *testing.T) {
	m, p := newFake()
	ctx := context.Background()
	if m.DB(ctx) != Querier(p) || InTx(ctx) {
		t.Fatal("outside Run DB must return the pool")
	}
	AfterCommit(ctx, note(p, "wake relay"))
	if !slices.Equal(p.journal, []string{"wake relay"}) {
		t.Fatalf("journal %q: without a transaction the hook runs at once", p.journal)
	}
	if err := LockKey(ctx, "account:42"); !errors.Is(err, ErrNoTx) {
		t.Fatalf("LockKey outside Run: %v, want ErrNoTx", err)
	}
}

func TestLockKeyUsesTransactionLock(t *testing.T) {
	m, p := newFake()
	err := m.Run(context.Background(), func(ctx context.Context) error {
		return LockKey(ctx, "account:42")
	})
	if err != nil {
		t.Fatal(err)
	}
	want := fmt.Sprint("exec SELECT pg_advisory_xact_lock($1)", []any{lockID("account:42")})
	if len(p.journal) != 3 || p.journal[1] != want {
		t.Fatalf("journal %q, want the xact lock between begin and commit", p.journal)
	}
	if lockID("account:42") == lockID("account:43") {
		t.Fatal("different keys must map to different lock IDs")
	}
}

func TestPoolConfigForTransactionPooler(t *testing.T) {
	const dsn = "postgres://app@localhost:6432/bank"
	tests := []struct {
		name     string
		dsn      string
		txPooler bool
		want     pgx.QueryExecMode
	}{
		{"direct: cached prepared statements", dsn, false, pgx.QueryExecModeCacheStatement},
		{"transaction pooler: unnamed statements", dsn, true, pgx.QueryExecModeExec},
		{"set in the DSN", dsn + "?default_query_exec_mode=simple_protocol", false, pgx.QueryExecModeSimpleProtocol},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg, err := PoolConfig(tt.dsn, tt.txPooler)
			if err != nil {
				t.Fatal(err)
			}
			if got := cfg.ConnConfig.DefaultQueryExecMode; got != tt.want {
				t.Fatalf("mode %v, want %v", got, tt.want)
			}
		})
	}
}
