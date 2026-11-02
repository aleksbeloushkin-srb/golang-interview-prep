// Package poll waits for a payment provider without a workflow engine:
// polling is a delayed retry of the same stored task. Nothing waits in
// memory, so a restart loses nothing; the row says when to ask next.
package poll

import (
	"context"
	"time"
)

// State is the lifecycle of a task row.
type State string

const (
	Pending State = "pending"
	Done    State = "done"
	Dead    State = "dead" // gave up polling: reconciliation takes over
)

// Task is one row of the task table. ID is unique, so a second enqueue of
// the same poll is a no-op:
//
//	INSERT INTO tasks (id, payment_id, run_after) VALUES ($1, $2, now())
//	ON CONFLICT (id) DO NOTHING
type Task struct {
	ID        string // for example "poll:" + payment ID
	PaymentID string
	Attempt   int // runs so far
	CreatedAt time.Time
	RunAfter  time.Time
	State     State
	Status    string // the last status the provider reported
	LastError string
}

// Schedule spaces the runs: Base, 2·Base, 4·Base… capped at Max. A run whose
// next turn would fall past Deadline (counted from CreatedAt) is the last.
type Schedule struct {
	Base, Max, Deadline time.Duration
}

// Delay returns the pause after the given run (1 for the first). Production
// code adds jitter so that tasks that failed together do not return together.
func (s Schedule) Delay(run int) time.Duration {
	d := s.Base
	for i := 1; i < run && d < s.Max; i++ {
		d *= 2
	}
	return min(d, s.Max)
}

// Provider reports the status of a payment at the payment provider.
type Provider interface {
	Status(ctx context.Context, paymentID string) (status string, final bool, err error)
}

// Store is the task table. In PostgreSQL, Due claims rows with
// SELECT … FOR UPDATE SKIP LOCKED and a lease.
type Store interface {
	Due(ctx context.Context, now time.Time, limit int) ([]Task, error)
	Save(ctx context.Context, t Task) error
}

// Runner executes due tasks. A ticker or a cron job calls RunDue.
type Runner struct {
	Store    Store
	Provider Provider
	Schedule Schedule
	Now      func() time.Time
}

// RunDue runs every due task once and saves the outcome. It returns the
// number of tasks it ran.
func (r *Runner) RunDue(ctx context.Context) (int, error) {
	now := r.Now()
	tasks, err := r.Store.Due(ctx, now, 100)
	if err != nil {
		return 0, err
	}
	for i, t := range tasks {
		if err := r.Store.Save(ctx, r.run(ctx, t, now)); err != nil {
			return i, err
		}
	}
	return len(tasks), nil
}

// run asks once. A final status ends the task; anything else, including a
// failed call, schedules the same task again.
func (r *Runner) run(ctx context.Context, t Task, now time.Time) Task {
	t.Attempt++
	status, final, err := r.Provider.Status(ctx, t.PaymentID)
	switch {
	case err != nil:
		t.LastError = err.Error()
	case final:
		t.State, t.Status, t.LastError = Done, status, ""
		return t
	default:
		t.Status, t.LastError = status, ""
	}
	next := now.Add(r.Schedule.Delay(t.Attempt))
	if next.Sub(t.CreatedAt) > r.Schedule.Deadline {
		t.State = Dead
		t.LastError = "no final status before the deadline: reconcile"
		return t
	}
	t.RunAfter = next
	return t
}
