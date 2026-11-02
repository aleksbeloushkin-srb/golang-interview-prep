// Package taskqueue is a task queue in PostgreSQL. Workers claim due tasks
// with FOR UPDATE SKIP LOCKED, hold them by a lease rather than an open
// transaction, retry failures with backoff and jitter, and move a task to the
// dead state, the dead-letter queue, after MaxAttempts failed runs.
package taskqueue

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math/rand/v2"
	"sync"
	"time"
)

// Task is a claimed task.
type Task struct {
	ID       int64
	Kind     string
	Payload  json.RawMessage
	Attempts int // failed runs so far
	// LeaseUntil is set by the claim. Every settle statement matches on it,
	// so a worker whose lease has passed to another worker cannot overwrite
	// the new owner's result.
	LeaseUntil time.Time
}

// ErrLeaseLost means another worker has claimed the task since.
var ErrLeaseLost = errors.New("taskqueue: lease lost")

// ErrPermanent marks a handler error that no retry can fix; wrap it with %w.
var ErrPermanent = errors.New("taskqueue: permanent failure")

// Store is the task table. PG implements it.
type Store interface {
	Claim(ctx context.Context, now time.Time, limit int, lease time.Duration) ([]Task, error)
	Complete(ctx context.Context, t Task) error
	Retry(ctx context.Context, t Task, runAfter time.Time, cause string) error
	Bury(ctx context.Context, t Task, cause string) error
}

// Handler runs one task. The queue delivers at least once, so a handler must
// be idempotent.
type Handler func(ctx context.Context, t Task) error

// Config tunes a Worker.
type Config struct {
	Batch       int           // tasks per claim, run concurrently
	Poll        time.Duration // wait between claims while the queue is empty
	Lease       time.Duration // how long a claimed task stays hidden from other workers
	TaskTimeout time.Duration // below Lease, so a live worker settles before the lease ends
	MaxAttempts int           // failed runs after which the task is dead
	Backoff     Backoff
}

const settleTimeout = 5 * time.Second

// Worker claims and runs tasks.
type Worker struct {
	store  Store
	handle Handler
	now    func() time.Time
	wake   <-chan struct{}
	cfg    Config
	log    *slog.Logger
}

// NewWorker returns a Worker. wake may be nil; a value on it starts a claim
// at once, for example after a local transaction that enqueued a task commits.
func NewWorker(store Store, handle Handler, now func() time.Time, wake <-chan struct{}, cfg Config, log *slog.Logger) (*Worker, error) {
	switch {
	case cfg.Batch < 1 || cfg.MaxAttempts < 1 || cfg.Poll <= 0:
		return nil, errors.New("taskqueue: Batch, MaxAttempts and Poll must be positive")
	case cfg.TaskTimeout <= 0 || cfg.TaskTimeout >= cfg.Lease:
		return nil, errors.New("taskqueue: TaskTimeout must be positive and shorter than Lease")
	}
	return &Worker{store: store, handle: handle, now: now, wake: wake, cfg: cfg, log: log}, nil
}

// Run claims and runs tasks until ctx is cancelled. After a full batch it
// claims again at once; otherwise it waits for the poll tick or a wake
// signal. Run returns only after the current batch is settled.
func (w *Worker) Run(ctx context.Context) error {
	tick := time.NewTicker(w.cfg.Poll)
	defer tick.Stop()
	for {
		n, err := w.RunOnce(ctx)
		if ctx.Err() != nil {
			return ctx.Err()
		}
		if err != nil {
			w.log.Error("claim tasks", "err", err)
		}
		if err == nil && n == w.cfg.Batch {
			continue // a full batch: more tasks are probably due
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-tick.C:
		case <-w.wake:
		}
	}
}

// RunOnce claims one batch, runs its tasks concurrently and waits until
// every task is settled. It returns the number of tasks claimed.
func (w *Worker) RunOnce(ctx context.Context) (int, error) {
	tasks, err := w.store.Claim(ctx, w.now(), w.cfg.Batch, w.cfg.Lease)
	if err != nil {
		return 0, err
	}
	var wg sync.WaitGroup
	for _, t := range tasks {
		wg.Add(1)
		go func() {
			defer wg.Done()
			w.Process(ctx, t)
		}()
	}
	wg.Wait()
	return len(tasks), nil
}

// Process runs one leased task and records the outcome. RunOnce calls it for
// claimed tasks; the fast path calls it right after commit for a task that
// was inserted already leased (EnqueueLeased).
func (w *Worker) Process(ctx context.Context, t Task) {
	// Shutdown stops claiming but lets a running task finish within
	// TaskTimeout: cutting a handler mid-way turns a clean result into an
	// unknown one.
	hctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), w.cfg.TaskTimeout)
	err := w.run(hctx, t)
	cancel()
	w.settle(ctx, t, err)
}

func (w *Worker) run(ctx context.Context, t Task) (err error) {
	defer func() {
		if p := recover(); p != nil {
			err = fmt.Errorf("task %d panicked: %v", t.ID, p)
		}
	}()
	return w.handle(ctx, t)
}

func (w *Worker) settle(ctx context.Context, t Task, runErr error) {
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), settleTimeout)
	defer cancel()
	var err error
	switch {
	case runErr == nil:
		err = w.store.Complete(ctx, t)
	case errors.Is(runErr, ErrPermanent), t.Attempts+1 >= w.cfg.MaxAttempts:
		err = w.store.Bury(ctx, t, runErr.Error())
		if err == nil {
			// The dead-letter state: alert on it; an operator decides.
			w.log.Error("task is dead", "id", t.ID, "kind", t.Kind, "err", runErr)
		}
	default:
		delay := w.cfg.Backoff.Delay(t.Attempts + 1)
		err = w.store.Retry(ctx, t, w.now().Add(delay), runErr.Error())
	}
	switch {
	case errors.Is(err, ErrLeaseLost):
		w.log.Warn("lease lost, outcome dropped", "id", t.ID)
	case err != nil:
		w.log.Error("settle task; it runs again after the lease", "id", t.ID, "err", err)
	}
}

// Backoff is exponential growth from Base, capped at Max, with equal jitter:
// half of the delay is fixed and half is random, so tasks that failed
// together do not come back as one wave.
type Backoff struct {
	Base, Max time.Duration
	Rand      func(n int64) int64 // returns [0, n); nil means math/rand/v2
}

// Delay returns the wait before the given retry, 1 for the first.
func (b Backoff) Delay(retry int) time.Duration {
	d := b.Base
	for i := 1; i < retry && d < b.Max; i++ {
		d *= 2
	}
	d = min(d, b.Max)
	half := d / 2
	randN := b.Rand
	if randN == nil {
		randN = rand.Int64N
	}
	return half + time.Duration(randN(int64(d-half)+1))
}
