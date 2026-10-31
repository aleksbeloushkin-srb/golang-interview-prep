package chanpatterns

import (
	"context"
	"net/http"
	"net/http/httptest"
	"runtime"
	"slices"
	"testing"
	"time"
)

func TestSignalsMergeWithoutConsumer(t *testing.T) {
	l := NewLatest(0)
	for i := 1; i <= 1000; i++ {
		l.Set(i) // must not block: nobody is receiving yet
	}
	select {
	case <-l.Changed():
	default:
		t.Fatal("no signal pending after 1000 changes")
	}
	if got := l.Get(); got != 1000 {
		t.Fatalf("Get() = %d, want 1000", got)
	}
	select {
	case <-l.Changed():
		t.Fatal("1000 changes left more than one signal")
	default:
	}
}

func TestConsumerSeesLatestState(t *testing.T) {
	const n = 10_000
	l := NewLatest(0)
	type result struct{ wakeups, last int }
	done := make(chan result, 1)
	go func() {
		wakeups, last := 0, 0
		for range l.Changed() { // Changed is never closed: the consumer returns on the final state
			wakeups++
			v := l.Get()
			if v < last {
				t.Errorf("state went back from %d to %d", last, v)
			}
			last = v
			if v == n {
				done <- result{wakeups, last}
				return
			}
		}
	}()
	for i := 1; i <= n; i++ {
		l.Set(i)
	}
	select {
	case r := <-done:
		if r.wakeups < 1 || r.wakeups > n {
			t.Fatalf("wakeups = %d, want 1..%d", r.wakeups, n)
		}
		t.Logf("%d changes, %d wakeups", n, r.wakeups)
	case <-time.After(5 * time.Second):
		t.Fatal("consumer never saw the final state")
	}
}

func TestLimitRejectsExtraRequest(t *testing.T) {
	const n = 3
	entered := make(chan struct{}, n+1)
	release := make(chan struct{})
	h := Limit(n, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		entered <- struct{}{}
		<-release
		w.WriteHeader(http.StatusOK)
	}))
	serve := func() *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
		return rec
	}

	codes := make(chan int, n)
	for range n {
		go func() { codes <- serve().Code }()
	}
	for range n {
		<-entered // all n slots are taken
	}
	rec := serve() // returns at once, without waiting for a slot
	if rec.Code != http.StatusTooManyRequests || rec.Header().Get("Retry-After") == "" {
		t.Fatalf("request n+1: code %d, Retry-After %q; want 429 with Retry-After", rec.Code, rec.Header().Get("Retry-After"))
	}

	close(release)
	for range n {
		if c := <-codes; c != http.StatusOK {
			t.Fatalf("admitted request: code %d, want 200", c)
		}
	}
	if c := serve().Code; c != http.StatusOK {
		t.Fatalf("after release: code %d, want 200: slots were not returned", c)
	}
}

func TestPipelineCompletes(t *testing.T) {
	ctx := context.Background()
	out := Map(ctx, Map(ctx, Emit(ctx, []int{1, 2, 3}), func(v int) int { return v * 10 }),
		func(v int) int { return v + 1 })
	var got []int
	for v := range out { // ends only if every stage closed its output
		got = append(got, v)
	}
	if want := []int{11, 21, 31}; !slices.Equal(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestPipelineCancelLeavesNoGoroutines(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	items := make([]int, 1000)
	out := Map(ctx, Map(ctx, Emit(ctx, items), func(v int) int { return v + 1 }),
		func(v int) int { return v * 2 })
	<-out
	<-out
	cancel() // the consumer leaves and never reads out again
	waitGoroutines(t, before)
	select {
	case _, ok := <-out:
		if ok {
			t.Fatal("value received after every stage has exited")
		}
	default:
		t.Fatal("last stage exited without closing its output")
	}
}

// waitGoroutines is a small goleak: it yields until the count drops back,
// and on failure prints the stacks of what is left.
func waitGoroutines(t *testing.T, want int) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for runtime.NumGoroutine() > want {
		if time.Now().After(deadline) {
			buf := make([]byte, 1<<16)
			t.Fatalf("%d goroutines left, want %d:\n%s", runtime.NumGoroutine(), want, buf[:runtime.Stack(buf, true)])
		}
		runtime.Gosched()
	}
}
