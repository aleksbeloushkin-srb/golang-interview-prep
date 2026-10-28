package workerpool

import (
	"context"
	"runtime"
	"slices"
	"sync/atomic"
	"testing"
	"time"
)

// feed sends 0..n-1 and closes jobs; it stops early when ctx is done.
func feed(ctx context.Context, n int) <-chan int {
	jobs := make(chan int)
	go func() {
		defer close(jobs)
		for i := range n {
			select {
			case jobs <- i:
			case <-ctx.Done():
				return
			}
		}
	}()
	return jobs
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

// collect reads results until the channel is closed; a pool that never closes it fails instead of hanging.
func collect[R any](t *testing.T, results <-chan R) []R {
	t.Helper()
	var got []R
	timeout := time.After(5 * time.Second)
	for {
		select {
		case r, ok := <-results:
			if !ok {
				return got
			}
			got = append(got, r)
		case <-timeout:
			t.Fatalf("results channel is not closed; received %d values", len(got))
		}
	}
}

func TestAllJobsProcessed(t *testing.T) {
	ctx := context.Background()
	got := collect(t, Process(ctx, 4, feed(ctx, 100), func(_ context.Context, n int) int { return n * 2 }))
	slices.Sort(got)
	if len(got) != 100 {
		t.Fatalf("got %d results, want 100", len(got))
	}
	for i, v := range got {
		if v != i*2 {
			t.Fatalf("result %d = %d, want %d", i, v, i*2)
		}
	}
}

func TestNoJobs(t *testing.T) {
	ctx := context.Background()
	if got := collect(t, Process(ctx, 3, feed(ctx, 0), func(_ context.Context, n int) int { return n })); len(got) != 0 {
		t.Fatalf("got %v, want no results", got)
	}
}

func TestWorkersBelowOneMeansOne(t *testing.T) {
	ctx := context.Background()
	if got := collect(t, Process(ctx, 0, feed(ctx, 3), func(_ context.Context, n int) int { return n })); len(got) != 3 {
		t.Fatalf("got %d results, want 3", len(got))
	}
}

func TestAtMostNConcurrentCalls(t *testing.T) {
	const workers = 3
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	var active, peak atomic.Int32
	release := make(chan struct{})
	fn := func(_ context.Context, n int) int {
		cur := active.Add(1)
		for p := peak.Load(); cur > p && !peak.CompareAndSwap(p, cur); p = peak.Load() {
		}
		<-release
		active.Add(-1)
		return n
	}
	results := Process(ctx, workers, feed(ctx, 20), fn)
	waitUntil(t, "all workers busy", func() bool { return active.Load() >= workers })
	// An observation window: a pool without a limit would start more calls here.
	time.Sleep(50 * time.Millisecond)
	close(release)
	if got := collect(t, results); len(got) != 20 {
		t.Fatalf("got %d results, want 20", len(got))
	}
	if p := peak.Load(); p > workers {
		t.Fatalf("peak concurrency %d, want at most %d", p, workers)
	}
}

func TestSlowConsumerBoundsWork(t *testing.T) {
	const workers = 4
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	var calls atomic.Int32
	results := Process(ctx, workers, feed(ctx, 1000), func(_ context.Context, n int) int {
		calls.Add(1)
		return n
	})
	if cap(results) > workers {
		t.Fatalf("results buffer of %d: a slow consumer should make workers wait, not fill a large buffer", cap(results))
	}
	waitUntil(t, "workers started", func() bool { return calls.Load() >= workers })
	// Observation windows: nobody reads results, so the work must stop growing.
	time.Sleep(50 * time.Millisecond)
	first := int(calls.Load())
	time.Sleep(50 * time.Millisecond)
	if again := int(calls.Load()); again != first {
		t.Fatalf("work keeps growing without a reader: %d, then %d jobs processed", first, again)
	}
	// Each blocked worker holds one finished result, plus the buffer, plus at most
	// one value in flight in a forwarding goroutine, if the design has one.
	if limit := workers + cap(results) + 1; first > limit {
		t.Fatalf("%d jobs processed without a reader, want at most %d", first, limit)
	}
	cancel()
	collect(t, results)
}

func TestCancelStopsEverything(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	results := Process(ctx, 4, feed(ctx, 1_000_000), func(_ context.Context, n int) int { return n })
	for range 5 {
		<-results
	}
	cancel()
	collect(t, results)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}

// The consumer cancels and stops reading. A worker blocked on sending its
// result must notice the cancellation, otherwise it leaks.
func TestCancelWithoutReading(t *testing.T) {
	const workers = 3
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	var calls atomic.Int32
	results := Process(ctx, workers, feed(ctx, 1000), func(_ context.Context, n int) int {
		calls.Add(1)
		return n
	})
	waitUntil(t, "every worker to finish a job", func() bool { return calls.Load() >= workers })
	cancel()
	waitUntil(t, "goroutines to exit while nobody reads", func() bool { return runtime.NumGoroutine() <= before })
	collect(t, results) // closed; a buffered design may still hold values
}

// The caller may cancel without ever closing jobs: workers must still stop.
func TestCancelWithOpenJobs(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	jobs := make(chan int) // never closed, nobody sends
	results := Process(ctx, 2, jobs, func(_ context.Context, n int) int { return n })
	cancel()
	collect(t, results)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}
