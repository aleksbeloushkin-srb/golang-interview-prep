package taskqueue

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"testing"
	"time"
)

type settlement struct {
	op       string // complete, retry or bury
	id       int64
	runAfter time.Time
	cause    string
}

// fakeStore hands out prepared batches and records how tasks were settled.
type fakeStore struct {
	mu        sync.Mutex
	batches   [][]Task // returned by successive claims, then empty batches
	claims    int
	claimed   chan int // receives the claim number, if set
	settled   []settlement
	settleErr error
}

func (s *fakeStore) Claim(_ context.Context, _ time.Time, limit int, _ time.Duration) ([]Task, error) {
	s.mu.Lock()
	s.claims++
	n := s.claims
	var batch []Task
	if len(s.batches) > 0 {
		batch, s.batches = s.batches[0], s.batches[1:]
	}
	s.mu.Unlock()
	if len(batch) > limit {
		return nil, fmt.Errorf("batch of %d over limit %d", len(batch), limit)
	}
	if s.claimed != nil {
		s.claimed <- n
	}
	return batch, nil
}

func (s *fakeStore) record(st settlement) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.settled = append(s.settled, st)
	return s.settleErr
}

func (s *fakeStore) Complete(_ context.Context, t Task) error {
	return s.record(settlement{op: "complete", id: t.ID})
}

func (s *fakeStore) Retry(_ context.Context, t Task, runAfter time.Time, cause string) error {
	return s.record(settlement{op: "retry", id: t.ID, runAfter: runAfter, cause: cause})
}

func (s *fakeStore) Bury(_ context.Context, t Task, cause string) error {
	return s.record(settlement{op: "bury", id: t.ID, cause: cause})
}

func (s *fakeStore) snapshot() (int, []settlement) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.claims, append([]settlement(nil), s.settled...)
}

var t0 = time.Date(2030, 1, 2, 3, 4, 5, 0, time.UTC)

// maxJitter makes Backoff deterministic: the random half is at its top.
func maxJitter(n int64) int64 { return n - 1 }

func testConfig() Config {
	return Config{
		Batch:       2,
		Poll:        time.Hour, // never fires in a test: claims are driven by batches and wake
		Lease:       30 * time.Second,
		TaskTimeout: 10 * time.Second,
		MaxAttempts: 5,
		Backoff:     Backoff{Base: time.Second, Max: time.Minute, Rand: maxJitter},
	}
}

type syncBuffer struct {
	mu sync.Mutex
	b  bytes.Buffer
}

func (b *syncBuffer) Write(p []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.b.Write(p)
}

func (b *syncBuffer) String() string {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.b.String()
}

func newTestWorker(t *testing.T, store Store, handle Handler, wake <-chan struct{}) (*Worker, *syncBuffer) {
	t.Helper()
	logs := &syncBuffer{}
	w, err := NewWorker(store, handle, func() time.Time { return t0 }, wake, testConfig(), slog.New(slog.NewTextHandler(logs, nil)))
	if err != nil {
		t.Fatal(err)
	}
	return w, logs
}

func TestProcessSettlesByOutcome(t *testing.T) {
	boom := errors.New("gateway unavailable")
	tests := []struct {
		name     string
		attempts int
		handle   Handler
		want     settlement
	}{
		{"success completes", 0, func(context.Context, Task) error { return nil },
			settlement{op: "complete", id: 1}},
		{"first failure retries after Base", 0, func(context.Context, Task) error { return boom },
			settlement{op: "retry", id: 1, runAfter: t0.Add(time.Second), cause: boom.Error()}},
		{"third failure retries after 4 x Base", 2, func(context.Context, Task) error { return boom },
			settlement{op: "retry", id: 1, runAfter: t0.Add(4 * time.Second), cause: boom.Error()}},
		{"last attempt goes dead", 4, func(context.Context, Task) error { return boom },
			settlement{op: "bury", id: 1, cause: boom.Error()}},
		{"permanent error goes dead at once", 0, func(context.Context, Task) error { return fmt.Errorf("bad payload: %w", ErrPermanent) },
			settlement{op: "bury", id: 1, cause: "bad payload: taskqueue: permanent failure"}},
		{"panic is a failed run", 0, func(context.Context, Task) error { panic("nil map") },
			settlement{op: "retry", id: 1, runAfter: t0.Add(time.Second), cause: "task 1 panicked: nil map"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := &fakeStore{}
			w, _ := newTestWorker(t, store, tt.handle, nil)
			w.Process(context.Background(), Task{ID: 1, Kind: "notify", Attempts: tt.attempts, LeaseUntil: t0.Add(30 * time.Second)})
			_, got := store.snapshot()
			if len(got) != 1 || got[0] != tt.want {
				t.Fatalf("settled %+v, want [%+v]", got, tt.want)
			}
		})
	}
}

func TestBackoffDelay(t *testing.T) {
	b := Backoff{Base: time.Second, Max: 8 * time.Second}
	tests := []struct {
		retry    int
		min, max time.Duration
	}{
		{1, 500 * time.Millisecond, time.Second},
		{2, time.Second, 2 * time.Second},
		{4, 4 * time.Second, 8 * time.Second},
		{30, 4 * time.Second, 8 * time.Second}, // capped at Max, no overflow
	}
	for _, tt := range tests {
		lo, hi := b, b
		lo.Rand = func(int64) int64 { return 0 }
		hi.Rand = maxJitter
		if got := lo.Delay(tt.retry); got != tt.min {
			t.Errorf("retry %d: lowest delay %v, want %v", tt.retry, got, tt.min)
		}
		if got := hi.Delay(tt.retry); got != tt.max {
			t.Errorf("retry %d: highest delay %v, want %v", tt.retry, got, tt.max)
		}
		for range 100 {
			if got := b.Delay(tt.retry); got < tt.min || got > tt.max {
				t.Fatalf("retry %d: delay %v outside [%v, %v]", tt.retry, got, tt.min, tt.max)
			}
		}
	}
}

func TestLostLeaseDropsOutcome(t *testing.T) {
	store := &fakeStore{settleErr: ErrLeaseLost}
	w, logs := newTestWorker(t, store, func(context.Context, Task) error { return nil }, nil)
	w.Process(context.Background(), Task{ID: 7})
	_, got := store.snapshot()
	if len(got) != 1 || got[0].op != "complete" {
		t.Fatalf("settled %+v, want one complete and nothing after it", got)
	}
	if !strings.Contains(logs.String(), "lease lost") {
		t.Fatalf("log %q does not report the lost lease", logs.String())
	}
}

func TestShutdownLetsRunningTaskFinish(t *testing.T) {
	store := &fakeStore{batches: [][]Task{{{ID: 1}}}}
	started, release := make(chan struct{}), make(chan struct{})
	handlerErr := make(chan error, 1)
	w, _ := newTestWorker(t, store, func(ctx context.Context, _ Task) error {
		close(started)
		<-release
		deadline, ok := ctx.Deadline()
		switch {
		case ctx.Err() != nil:
			handlerErr <- fmt.Errorf("handler context cancelled by shutdown: %w", ctx.Err())
		case !ok || time.Until(deadline) > testConfig().TaskTimeout:
			handlerErr <- errors.New("handler context has no TaskTimeout deadline")
		default:
			handlerErr <- nil
		}
		return nil
	}, nil)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- w.Run(ctx) }()
	<-started
	cancel()
	close(release)

	if err := <-handlerErr; err != nil {
		t.Fatal(err)
	}
	if err := <-done; !errors.Is(err, context.Canceled) {
		t.Fatalf("Run returned %v, want context.Canceled", err)
	}
	if _, got := store.snapshot(); len(got) != 1 || got[0].op != "complete" {
		t.Fatalf("settled %+v: Run must return only after the batch is settled", got)
	}
}

func TestFullBatchIsFollowedByClaim(t *testing.T) {
	store := &fakeStore{
		batches: [][]Task{{{ID: 1}, {ID: 2}}, {{ID: 3}}},
		claimed: make(chan int, 10),
	}
	w, _ := newTestWorker(t, store, func(context.Context, Task) error { return nil }, nil)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- w.Run(ctx) }()

	<-store.claimed // a full batch of 2
	<-store.claimed // claimed again at once, without waiting for the hour-long poll
	cancel()
	<-done

	claims, got := store.snapshot()
	if claims != 2 || len(got) != 3 {
		t.Fatalf("claims=%d settled=%+v, want 2 claims and 3 completed tasks", claims, got)
	}
}

func TestWakeStartsClaim(t *testing.T) {
	store := &fakeStore{claimed: make(chan int, 10)}
	wake := make(chan struct{}, 1)
	w, _ := newTestWorker(t, store, func(context.Context, Task) error { return nil }, wake)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- w.Run(ctx) }()

	<-store.claimed // the first claim finds nothing; the worker now waits
	wake <- struct{}{}
	if n := <-store.claimed; n != 2 {
		t.Fatalf("claim number %d after wake, want 2", n)
	}
	cancel()
	<-done
}

func TestNewWorkerRejectsTimeoutNotBelowLease(t *testing.T) {
	cfg := testConfig()
	cfg.TaskTimeout = cfg.Lease
	if _, err := NewWorker(&fakeStore{}, nil, time.Now, nil, cfg, slog.Default()); err == nil {
		t.Fatal("TaskTimeout equal to Lease must be rejected: the lease could pass to another worker mid-run")
	}
}
