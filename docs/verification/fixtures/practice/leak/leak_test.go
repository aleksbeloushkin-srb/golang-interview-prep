package leak

import (
	"bytes"
	"context"
	"errors"
	"runtime/pprof"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

// goroutinesIn counts live goroutines whose stack contains fn. It reads the
// goroutine profile — the same data as /debug/pprof/goroutine?debug=2 — so it
// counts only our goroutines, unlike runtime.NumGoroutine, which also counts
// the runtime's, the test framework's and other tests' goroutines.
func goroutinesIn(fn string) int {
	var buf bytes.Buffer
	pprof.Lookup("goroutine").WriteTo(&buf, 2)
	n := 0
	for _, g := range strings.Split(buf.String(), "\n\n") {
		if strings.Contains(g, fn) {
			n++
		}
	}
	return n
}

func waitUntil(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for: %s", what)
		}
		time.Sleep(time.Millisecond)
	}
}

func answer(s string) Backend { return func(context.Context) string { return s } }

// slow ignores ctx: it answers after d no matter what.
func slow(s string, d time.Duration) Backend {
	return func(context.Context) string { time.Sleep(d); return s }
}

// polite answers after d unless ctx is done first; it counts cancellations.
func polite(d time.Duration, cancelled *atomic.Int32) Backend {
	return func(ctx context.Context) string {
		select {
		case <-time.After(d):
			return "slow"
		case <-ctx.Done():
			cancelled.Add(1)
			return "cancelled"
		}
	}
}

// The leak, found the way you would find it in a service: two goroutines per
// call stay blocked on a send in FirstLeaky's closure. They stay leaked for the
// rest of this test binary; that is the point of the demonstration.
func TestFirstLeakyLeaks(t *testing.T) {
	const fn = "leak.FirstLeaky.func"
	before := goroutinesIn(fn)
	got := FirstLeaky(context.Background(), answer("fast"), slow("a", 10*time.Millisecond), slow("b", 10*time.Millisecond))
	if got != "fast" {
		t.Fatalf("got %q, want fast", got)
	}
	waitUntil(t, "the two losers to finish their work", func() bool { return goroutinesIn(fn) == before+2 })
	time.Sleep(50 * time.Millisecond) // an observation window: they never go away
	if n := goroutinesIn(fn); n != before+2 {
		t.Fatalf("%d leaked goroutines, want %d", n-before, 2)
	}
}

func TestFirstReturnsFastestAndLeavesNothing(t *testing.T) {
	const fn = "leak.First.func"
	var cancelled atomic.Int32
	start := time.Now()
	got, err := First(context.Background(), polite(time.Second, &cancelled), answer("fast"), polite(time.Second, &cancelled))
	if err != nil || got != "fast" {
		t.Fatalf("got %q, %v; want fast, nil", got, err)
	}
	waitUntil(t, "slow backends to see the cancellation", func() bool { return cancelled.Load() == 2 })
	waitUntil(t, "First's goroutines to exit", func() bool { return goroutinesIn(fn) == 0 })
	if took := time.Since(start); took > 500*time.Millisecond {
		t.Fatalf("took %v: slow backends were not told to stop", took)
	}
}

// Even a backend that ignores ctx must not leak: its late send has room.
func TestImpoliteBackendDoesNotLeak(t *testing.T) {
	const fn = "leak.First.func"
	got, err := First(context.Background(), answer("fast"), slow("late", 20*time.Millisecond))
	if err != nil || got != "fast" {
		t.Fatalf("got %q, %v; want fast, nil", got, err)
	}
	waitUntil(t, "the late goroutine to send and exit", func() bool { return goroutinesIn(fn) == 0 })
}

func TestParentCancelled(t *testing.T) {
	const fn = "leak.First.func"
	var cancelled atomic.Int32
	ctx, cancel := context.WithCancel(context.Background())
	time.AfterFunc(10*time.Millisecond, cancel)
	_, err := First(ctx, polite(time.Second, &cancelled), polite(time.Second, &cancelled))
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v, want context.Canceled", err)
	}
	waitUntil(t, "First's goroutines to exit", func() bool { return goroutinesIn(fn) == 0 })
}

func TestNoBackends(t *testing.T) {
	if _, err := First(context.Background()); !errors.Is(err, ErrNoBackends) {
		t.Fatalf("err = %v, want ErrNoBackends", err)
	}
}
