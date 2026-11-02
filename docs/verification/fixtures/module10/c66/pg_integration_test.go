//go:build integration

package taskqueue

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"os"
	"slices"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
)

// pool is shared; each test truncates the table, so tests do not run in parallel.
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
	if _, err := pool.Exec(ctx, Schema); err != nil {
		fmt.Fprintln(os.Stderr, "schema:", err)
		return 1
	}
	return m.Run()
}

func reset(t *testing.T) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), `TRUNCATE tasks RESTART IDENTITY`); err != nil {
		t.Fatal(err)
	}
}

func enqueue(t *testing.T, keys ...string) {
	t.Helper()
	for _, k := range keys {
		if _, err := Enqueue(context.Background(), pool, Spec{Kind: "notify", DedupKey: k, Payload: json.RawMessage(`{"k":"` + k + `"}`), RunAfter: t0}); err != nil {
			t.Fatal(err)
		}
	}
}

func ids(tasks []Task) []int64 {
	out := make([]int64, 0, len(tasks))
	for _, t := range tasks {
		out = append(out, t.ID)
	}
	slices.Sort(out)
	return out
}

func TestClaimSkipsRowsLockedByAnotherClaim(t *testing.T) {
	reset(t)
	ctx := context.Background()
	enqueue(t, "a", "b", "c", "d")

	// Worker A claims inside a transaction it has not committed yet, so its
	// row locks are still held.
	txA, err := pool.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = txA.Rollback(ctx) }()
	a, err := NewPG(txA).Claim(ctx, t0, 2, time.Minute)
	if err != nil {
		t.Fatal(err)
	}

	// Plain FOR UPDATE waits behind worker A.
	bounded, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
	defer cancel()
	_, err = pool.Exec(bounded, `SELECT id FROM tasks ORDER BY id LIMIT 4 FOR UPDATE`)
	if err == nil {
		t.Fatal("FOR UPDATE without SKIP LOCKED did not wait for the locked rows")
	}

	// SKIP LOCKED takes the free rows at once.
	bounded, cancel = context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	b, err := NewPG(pool).Claim(bounded, t0, 4, time.Minute)
	if err != nil {
		t.Fatalf("claim next to a locked batch: %v", err)
	}
	if got := ids(a); !slices.Equal(got, []int64{1, 2}) {
		t.Fatalf("worker A got %v, want [1 2]", got)
	}
	if got := ids(b); !slices.Equal(got, []int64{3, 4}) {
		t.Fatalf("worker B got %v, want [3 4]: locked rows must be skipped", got)
	}
}

func TestLeaseHidesTaskAndFencesStaleWorker(t *testing.T) {
	reset(t)
	ctx := context.Background()
	q := NewPG(pool)
	enqueue(t, "a")

	first, err := q.Claim(ctx, t0, 10, 30*time.Second)
	if err != nil || len(first) != 1 {
		t.Fatalf("first claim: %v %v", first, err)
	}
	if again, _ := q.Claim(ctx, t0.Add(10*time.Second), 10, 30*time.Second); len(again) != 0 {
		t.Fatalf("task claimed again within its lease: %v", again)
	}
	// The first worker hung; its lease expires and another worker takes over.
	second, err := q.Claim(ctx, t0.Add(30*time.Second), 10, 30*time.Second)
	if err != nil || len(second) != 1 || second[0].Attempts != 0 {
		t.Fatalf("claim after the lease: %v %v", second, err)
	}
	if err := q.Complete(ctx, first[0]); !errors.Is(err, ErrLeaseLost) {
		t.Fatalf("stale worker settled with %v, want ErrLeaseLost", err)
	}
	if err := q.Complete(ctx, second[0]); err != nil {
		t.Fatalf("current owner: %v", err)
	}
	if left, _ := q.Claim(ctx, t0.Add(time.Hour), 10, time.Minute); len(left) != 0 {
		t.Fatalf("a done task was claimed: %v", left)
	}
}

func TestRetryMovesRunAfterAndBuryIsFinal(t *testing.T) {
	reset(t)
	ctx := context.Background()
	q := NewPG(pool)
	enqueue(t, "a")

	c, _ := q.Claim(ctx, t0, 1, time.Minute)
	if err := q.Retry(ctx, c[0], t0.Add(time.Minute), "timeout"); err != nil {
		t.Fatal(err)
	}
	if early, _ := q.Claim(ctx, t0.Add(30*time.Second), 1, time.Minute); len(early) != 0 {
		t.Fatalf("claimed before run_after: %v", early)
	}
	c, _ = q.Claim(ctx, t0.Add(time.Minute), 1, time.Minute)
	if len(c) != 1 || c[0].Attempts != 1 {
		t.Fatalf("claim at run_after: %+v", c)
	}
	if err := q.Bury(ctx, c[0], "timeout"); err != nil {
		t.Fatal(err)
	}
	if late, _ := q.Claim(ctx, t0.Add(24*time.Hour), 1, time.Minute); len(late) != 0 {
		t.Fatalf("a dead task was claimed: %v", late)
	}
	var state string
	var attempts int
	if err := pool.QueryRow(ctx, `SELECT state, attempts FROM tasks`).Scan(&state, &attempts); err != nil {
		t.Fatal(err)
	}
	if state != "dead" || attempts != 2 {
		t.Fatalf("state=%s attempts=%d, want dead and 2", state, attempts)
	}
}

func TestDuplicateEnqueueKeepsTransactionUsable(t *testing.T) {
	reset(t)
	ctx := context.Background()
	tx, err := pool.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	s := Spec{Kind: "notify", DedupKey: "payment-1", Payload: json.RawMessage(`{}`), RunAfter: t0}
	first, err1 := Enqueue(ctx, tx, s)
	second, err2 := Enqueue(ctx, tx, s)
	if !first || second || err1 != nil || err2 != nil {
		t.Fatalf("enqueue twice: %v %v, %v %v; want true then false, no errors", first, err1, second, err2)
	}
	if _, err := tx.Exec(ctx, `SELECT 1`); err != nil {
		t.Fatalf("transaction broken after ON CONFLICT DO NOTHING: %v", err)
	}
	if err := tx.Commit(ctx); err != nil {
		t.Fatal(err)
	}

	// Catching the unique violation instead aborts the transaction.
	tx2, err := pool.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = tx2.Rollback(ctx) }()
	_, err = tx2.Exec(ctx, `INSERT INTO tasks (kind, dedup_key, run_after) VALUES ('notify', 'payment-1', now())`)
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		t.Fatalf("plain insert of a duplicate: %v, want unique_violation 23505", err)
	}
	_, err = tx2.Exec(ctx, `SELECT 1`)
	if !errors.As(err, &pgErr) || pgErr.Code != "25P02" {
		t.Fatalf("next statement: %v, want in_failed_sql_transaction 25P02", err)
	}
}

func TestLeasedInsertRunsAfterCommitAndSurvivesCrash(t *testing.T) {
	reset(t)
	ctx := context.Background()
	q := NewPG(pool)
	lease := 30 * time.Second

	tx, err := pool.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	fast, ok, err := EnqueueLeased(ctx, tx, Spec{Kind: "notify", DedupKey: "fast", Payload: json.RawMessage(`{}`)}, t0, lease)
	if err != nil || !ok {
		t.Fatalf("leased insert: %v %v", ok, err)
	}
	crashed, _, err := EnqueueLeased(ctx, tx, Spec{Kind: "notify", DedupKey: "crashed", Payload: json.RawMessage(`{}`)}, t0, lease)
	if err != nil {
		t.Fatal(err)
	}
	if err := tx.Commit(ctx); err != nil {
		t.Fatal(err)
	}
	if polled, _ := q.Claim(ctx, t0, 10, lease); len(polled) != 0 {
		t.Fatalf("pollers took leased tasks: %v", polled)
	}

	// After commit the fast task runs at once in this process.
	w, err := NewWorker(q, func(context.Context, Task) error { return nil }, func() time.Time { return t0 }, nil, testConfig(), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	w.Process(ctx, fast)

	// The other process died before running its task: a poller gets it once
	// the lease ends.
	polled, err := q.Claim(ctx, t0.Add(lease), 10, lease)
	if err != nil || len(polled) != 1 || polled[0].ID != crashed.ID {
		t.Fatalf("after the lease: %+v %v, want only task %d", polled, err, crashed.ID)
	}
}

func TestWorkerRetriesAgainstPostgres(t *testing.T) {
	reset(t)
	ctx := context.Background()
	enqueue(t, "a")
	now := t0
	calls := 0
	w, err := NewWorker(NewPG(pool), func(_ context.Context, task Task) error {
		calls++
		if calls == 1 {
			return errors.New("gateway timeout")
		}
		if string(task.Payload) != `{"k": "a"}` {
			return fmt.Errorf("payload %s", task.Payload)
		}
		return nil
	}, func() time.Time { return now }, nil, testConfig(), slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatal(err)
	}
	if n, err := w.RunOnce(ctx); n != 1 || err != nil {
		t.Fatalf("first run: %d %v", n, err)
	}
	if n, _ := w.RunOnce(ctx); n != 0 {
		t.Fatal("the failed task came back before its backoff")
	}
	now = t0.Add(time.Second) // testConfig backoff for the first retry
	if n, err := w.RunOnce(ctx); n != 1 || err != nil {
		t.Fatalf("retry: %d %v", n, err)
	}
	var state string
	if err := pool.QueryRow(ctx, `SELECT state FROM tasks`).Scan(&state); err != nil || state != "done" {
		t.Fatalf("state %q %v, want done", state, err)
	}
}
