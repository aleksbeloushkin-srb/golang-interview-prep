package poll

import (
	"context"
	"errors"
	"slices"
	"sort"
	"testing"
	"time"
)

// memStore stands in for the task table.
type memStore struct {
	rows map[string]Task
}

func newStore() *memStore { return &memStore{rows: make(map[string]Task)} }

// add enqueues t unless a task with the same ID exists, like ON CONFLICT DO NOTHING.
func (s *memStore) add(t Task) bool {
	if _, ok := s.rows[t.ID]; ok {
		return false
	}
	t.State, t.RunAfter = Pending, t.CreatedAt
	s.rows[t.ID] = t
	return true
}

func (s *memStore) Due(_ context.Context, now time.Time, limit int) ([]Task, error) {
	var due []Task
	for _, t := range s.rows {
		if t.State == Pending && !t.RunAfter.After(now) {
			due = append(due, t)
		}
	}
	sort.Slice(due, func(i, j int) bool { return due[i].RunAfter.Before(due[j].RunAfter) })
	return due[:min(limit, len(due))], nil
}

func (s *memStore) Save(_ context.Context, t Task) error {
	s.rows[t.ID] = t
	return nil
}

// next returns the earliest RunAfter among pending tasks.
func (s *memStore) next() (time.Time, bool) {
	var at time.Time
	found := false
	for _, t := range s.rows {
		if t.State == Pending && (!found || t.RunAfter.Before(at)) {
			at, found = t.RunAfter, true
		}
	}
	return at, found
}

// provider answers from a script; the last answer repeats.
type provider struct {
	answers []answer
	calls   int
}

type answer struct {
	status string
	final  bool
	err    error
}

func (p *provider) Status(context.Context, string) (string, bool, error) {
	a := p.answers[min(p.calls, len(p.answers)-1)]
	p.calls++
	return a.status, a.final, a.err
}

var (
	t0       = time.Date(2026, 11, 2, 12, 0, 0, 0, time.UTC)
	schedule = Schedule{Base: time.Second, Max: 8 * time.Second, Deadline: 20 * time.Second}
	pending  = answer{status: "processing"}
)

// drive jumps the clock to each next run, as a ticker would, and returns the
// run times as offsets from t0. It stops after steps runs, or when no task is
// pending if steps is 0.
func drive(t *testing.T, store *memStore, r *Runner, steps int) []time.Duration {
	t.Helper()
	var runs []time.Duration
	for steps == 0 || len(runs) < steps {
		at, ok := store.next()
		if !ok {
			break
		}
		r.Now = func() time.Time { return at }
		n, err := r.RunDue(context.Background())
		if err != nil || n != 1 {
			t.Fatalf("RunDue at %v: n=%d err=%v", at.Sub(t0), n, err)
		}
		runs = append(runs, at.Sub(t0))
	}
	return runs
}

func secs(s ...int) []time.Duration {
	out := make([]time.Duration, len(s))
	for i, v := range s {
		out[i] = time.Duration(v) * time.Second
	}
	return out
}

func TestScheduleDelay(t *testing.T) {
	var got []time.Duration
	for run := 1; run <= 6; run++ {
		got = append(got, schedule.Delay(run))
	}
	if want := secs(1, 2, 4, 8, 8, 8); !slices.Equal(got, want) {
		t.Fatalf("delays = %v, want %v", got, want)
	}
}

func TestPollUntilFinal(t *testing.T) {
	store := newStore()
	store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0})
	if store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0}) {
		t.Fatal("second enqueue of the same poll must be a no-op")
	}
	p := &provider{answers: []answer{pending, pending, pending, {status: "succeeded", final: true}}}
	runs := drive(t, store, &Runner{Store: store, Provider: p, Schedule: schedule}, 0)

	if want := secs(0, 1, 3, 7); !slices.Equal(runs, want) {
		t.Fatalf("runs at %v, want %v", runs, want)
	}
	got := store.rows["poll:pay-42"]
	if got.State != Done || got.Status != "succeeded" || got.Attempt != 4 || p.calls != 4 {
		t.Fatalf("task = %+v, provider calls = %d", got, p.calls)
	}
}

func TestPollGivesUpAtDeadline(t *testing.T) {
	store := newStore()
	store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0})
	p := &provider{answers: []answer{pending}}
	runs := drive(t, store, &Runner{Store: store, Provider: p, Schedule: schedule}, 0)

	// After the run at 15 s the next turn would be 23 s, past the 20 s deadline.
	if want := secs(0, 1, 3, 7, 15); !slices.Equal(runs, want) {
		t.Fatalf("runs at %v, want %v", runs, want)
	}
	got := store.rows["poll:pay-42"]
	if got.State != Dead || got.Status != "processing" || p.calls != 5 {
		t.Fatalf("task = %+v, provider calls = %d", got, p.calls)
	}
}

func TestFailedCallIsRetriedLikePending(t *testing.T) {
	store := newStore()
	store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0})
	p := &provider{answers: []answer{{err: errors.New("provider: 503")}, {status: "failed", final: true}}}
	runs := drive(t, store, &Runner{Store: store, Provider: p, Schedule: schedule}, 0)

	if want := secs(0, 1); !slices.Equal(runs, want) {
		t.Fatalf("runs at %v, want %v", runs, want)
	}
	if got := store.rows["poll:pay-42"]; got.State != Done || got.Status != "failed" {
		t.Fatalf("task = %+v", got)
	}
}

// A new process picks up from the row: the schedule continues as if nothing
// had happened, because nothing was waiting in memory.
func TestRestartContinuesFromRow(t *testing.T) {
	store := newStore()
	store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0})
	p := &provider{answers: []answer{pending, pending, pending, {status: "succeeded", final: true}}}
	before := drive(t, store, &Runner{Store: store, Provider: p, Schedule: schedule}, 2)
	// The first process is gone; a new one starts with an empty memory.
	after := drive(t, store, &Runner{Store: store, Provider: p, Schedule: schedule}, 0)

	if runs, want := append(before, after...), secs(0, 1, 3, 7); !slices.Equal(runs, want) {
		t.Fatalf("runs at %v, want %v", runs, want)
	}
	if got := store.rows["poll:pay-42"]; got.State != Done || got.Attempt != 4 {
		t.Fatalf("task = %+v", got)
	}
}

func TestNothingRunsBeforeRunAfter(t *testing.T) {
	store := newStore()
	store.add(Task{ID: "poll:pay-42", PaymentID: "pay-42", CreatedAt: t0})
	p := &provider{answers: []answer{pending}}
	r := &Runner{Store: store, Provider: p, Schedule: schedule, Now: func() time.Time { return t0 }}
	if n, err := r.RunDue(context.Background()); n != 1 || err != nil {
		t.Fatalf("first run: n=%d err=%v", n, err)
	}
	r.Now = func() time.Time { return t0.Add(999 * time.Millisecond) }
	if n, err := r.RunDue(context.Background()); n != 0 || err != nil || p.calls != 1 {
		t.Fatalf("early run: n=%d err=%v calls=%d", n, err, p.calls)
	}
}
