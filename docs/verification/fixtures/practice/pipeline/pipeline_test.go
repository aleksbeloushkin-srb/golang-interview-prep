package pipeline

import (
	"context"
	"errors"
	"runtime"
	"testing"
	"time"
)

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

// sumWithin fails instead of hanging when a stage never closes its output.
func sumWithin(t *testing.T, ctx context.Context, in <-chan int) (int, error) {
	t.Helper()
	type result struct {
		total int
		err   error
	}
	done := make(chan result, 1)
	go func() {
		total, err := Sum(ctx, in)
		done <- result{total, err}
	}()
	select {
	case r := <-done:
		return r.total, r.err
	case <-time.After(5 * time.Second):
		t.Fatal("Sum did not return: some stage never closed its output")
		return 0, nil
	}
}

func TestPipelineSum(t *testing.T) {
	ctx := context.Background()
	total, err := sumWithin(t, ctx, Square(ctx, Generate(ctx, 1, 2, 3, 4)))
	if err != nil || total != 30 {
		t.Fatalf("got %d, %v; want 30, nil", total, err)
	}
}

func TestEmptyInput(t *testing.T) {
	ctx := context.Background()
	total, err := sumWithin(t, ctx, Square(ctx, Generate(ctx)))
	if err != nil || total != 0 {
		t.Fatalf("got %d, %v; want 0, nil", total, err)
	}
}

func TestConsumerLeavesEarly(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	nums := make([]int, 10_000)
	for i := range nums {
		nums[i] = i
	}
	squares := Square(ctx, Generate(ctx, nums...))
	for range 3 {
		<-squares
	}
	// An observation window, not synchronization: by now every stage is blocked on
	// its next send, so a send without a select on ctx.Done would never return.
	time.Sleep(20 * time.Millisecond)
	cancel() // the consumer stops reading and says so
	waitUntil(t, "all stages to exit", func() bool { return runtime.NumGoroutine() <= before })
}

func TestSquareStopsWithForeignInput(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	in := make(chan int) // not ours: nobody will ever close it
	out := Square(ctx, in)
	cancel()
	select {
	case _, ok := <-out:
		if ok {
			t.Fatal("unexpected value after cancel")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Square did not close its output after cancel")
	}
	waitUntil(t, "Square to exit", func() bool { return runtime.NumGoroutine() <= before })
}

func TestSumCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	in := make(chan int) // never closed
	if total, err := sumWithin(t, ctx, in); total != 0 || !errors.Is(err, context.Canceled) {
		t.Fatalf("got %d, %v; want 0, context.Canceled", total, err)
	}
}

// Cancellation closes the upstream channels too, so Sum may see a closed input
// and a done context at the same time: it must report the cancellation, never a
// partial total with a nil error.
func TestSumCancelledMidStream(t *testing.T) {
	for range 100 {
		ctx, cancel := context.WithCancel(context.Background())
		in := make(chan int)
		type result struct {
			total int
			err   error
		}
		done := make(chan result, 1)
		go func() {
			total, err := Sum(ctx, in)
			done <- result{total, err}
		}()
		in <- 5
		cancel()
		close(in)
		select {
		case r := <-done:
			if r.total != 0 || !errors.Is(r.err, context.Canceled) {
				t.Fatalf("got %d, %v; want 0, context.Canceled", r.total, r.err)
			}
		case <-time.After(5 * time.Second):
			t.Fatal("Sum did not return")
		}
	}
}
