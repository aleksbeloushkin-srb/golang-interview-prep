package taskqueue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Schema is the task table. A row in the done state keeps its dedup key, so
// the deduplication window is as long as done rows are kept.
const Schema = `
CREATE TABLE tasks (
    id          bigserial   PRIMARY KEY,
    kind        text        NOT NULL,
    dedup_key   text        NOT NULL,
    payload     jsonb       NOT NULL DEFAULT '{}',
    state       text        NOT NULL DEFAULT 'ready' CHECK (state IN ('ready', 'done', 'dead')),
    attempts    int         NOT NULL DEFAULT 0,
    run_after   timestamptz NOT NULL,
    lease_until timestamptz,
    last_error  text,
    UNIQUE (kind, dedup_key)
);
-- Matches the claim: only ready tasks, in run_after order.
CREATE INDEX tasks_due ON tasks (run_after, id) WHERE state = 'ready';`

// The claim runs as one autocommit statement: the row locks last only for
// it, and the lease left in lease_until keeps other workers away afterwards.
// MATERIALIZED computes the locked batch once for the UPDATE.
const claimSQL = `
WITH batch AS MATERIALIZED (
    SELECT id FROM tasks
    WHERE state = 'ready' AND run_after <= $1
      AND (lease_until IS NULL OR lease_until <= $1)
    ORDER BY run_after, id
    LIMIT $3
    FOR UPDATE SKIP LOCKED
)
UPDATE tasks t SET lease_until = $2
FROM batch WHERE t.id = batch.id
RETURNING t.id, t.kind, t.payload, t.attempts, t.lease_until`

const (
	completeSQL = `UPDATE tasks SET state = 'done', lease_until = NULL
WHERE id = $1 AND lease_until = $2 AND state = 'ready'`

	retrySQL = `UPDATE tasks
SET attempts = attempts + 1, run_after = $3, last_error = $4, lease_until = NULL
WHERE id = $1 AND lease_until = $2 AND state = 'ready'`

	burySQL = `UPDATE tasks
SET state = 'dead', attempts = attempts + 1, last_error = $3, lease_until = NULL
WHERE id = $1 AND lease_until = $2 AND state = 'ready'`

	enqueueSQL = `INSERT INTO tasks (kind, dedup_key, payload, run_after)
VALUES ($1, $2, $3, $4)
ON CONFLICT (kind, dedup_key) DO NOTHING`

	enqueueLeasedSQL = `INSERT INTO tasks (kind, dedup_key, payload, run_after, lease_until)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (kind, dedup_key) DO NOTHING
RETURNING id, kind, payload, attempts, lease_until`
)

// Querier is satisfied by *pgxpool.Pool, *pgx.Conn and pgx.Tx.
type Querier interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
}

// Spec describes a task to enqueue. (Kind, DedupKey) is unique.
type Spec struct {
	Kind     string
	DedupKey string
	Payload  json.RawMessage
	RunAfter time.Time
}

// Enqueue inserts a task in the caller's transaction tx, so the task commits
// or rolls back together with the business row. A duplicate key is ignored
// and reported as false; unlike a caught unique violation, ON CONFLICT DO
// NOTHING leaves the transaction usable.
func Enqueue(ctx context.Context, tx Querier, s Spec) (bool, error) {
	tag, err := tx.Exec(ctx, enqueueSQL, s.Kind, s.DedupKey, s.Payload, s.RunAfter)
	if err != nil {
		return false, fmt.Errorf("enqueue %s: %w", s.Kind, err)
	}
	return tag.RowsAffected() == 1, nil
}

// EnqueueLeased is the fast path. It inserts the task already leased to the
// caller until now+lease, so pollers skip it, and returns it; after commit
// the caller runs it at once with Worker.Process. If the process dies first,
// the lease expires and a poller takes the task.
func EnqueueLeased(ctx context.Context, tx Querier, s Spec, now time.Time, lease time.Duration) (Task, bool, error) {
	rows, err := tx.Query(ctx, enqueueLeasedSQL, s.Kind, s.DedupKey, s.Payload, now, now.Add(lease))
	if err != nil {
		return Task{}, false, fmt.Errorf("enqueue %s: %w", s.Kind, err)
	}
	tasks, err := pgx.CollectRows(rows, pgx.RowToStructByPos[Task])
	if err != nil {
		return Task{}, false, fmt.Errorf("enqueue %s: %w", s.Kind, err)
	}
	if len(tasks) == 0 {
		return Task{}, false, nil // a duplicate: the existing task runs instead
	}
	return tasks[0], true, nil
}

// PG is the Store over PostgreSQL. Its statements run on db, normally the
// pool, each as its own short transaction.
type PG struct{ db Querier }

// NewPG returns the store.
func NewPG(db Querier) *PG { return &PG{db: db} }

// Claim leases up to limit due tasks until now+lease. Concurrent claimers
// skip each other's locked rows instead of waiting, so two workers never
// get the same task. now comes from the caller's clock, which makes lease
// expiry testable; instance clocks must agree well within one lease.
func (q *PG) Claim(ctx context.Context, now time.Time, limit int, lease time.Duration) ([]Task, error) {
	rows, err := q.db.Query(ctx, claimSQL, now, now.Add(lease), limit)
	if err != nil {
		return nil, fmt.Errorf("claim tasks: %w", err)
	}
	tasks, err := pgx.CollectRows(rows, pgx.RowToStructByPos[Task])
	if err != nil {
		return nil, fmt.Errorf("claim tasks: %w", err)
	}
	return tasks, nil
}

// Complete marks the task done.
func (q *PG) Complete(ctx context.Context, t Task) error {
	return q.settle(ctx, t, completeSQL)
}

// Retry counts a failed run and schedules the next one at runAfter.
func (q *PG) Retry(ctx context.Context, t Task, runAfter time.Time, cause string) error {
	return q.settle(ctx, t, retrySQL, runAfter, cause)
}

// Bury moves the task to the dead state; it is never claimed again.
func (q *PG) Bury(ctx context.Context, t Task, cause string) error {
	return q.settle(ctx, t, burySQL, cause)
}

func (q *PG) settle(ctx context.Context, t Task, sql string, args ...any) error {
	tag, err := q.db.Exec(ctx, sql, append([]any{t.ID, t.LeaseUntil}, args...)...)
	if err != nil {
		return fmt.Errorf("settle task %d: %w", t.ID, err)
	}
	if tag.RowsAffected() == 0 {
		return ErrLeaseLost
	}
	return nil
}
