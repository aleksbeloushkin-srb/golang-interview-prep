package fanin

import (
	"context"
	"runtime"
	"slices"
	"testing"
	"time"
)

func source(values ...int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for _, v := range values {
			ch <- v
		}
	}()
	return ch
}

func collect[T any](t *testing.T, out <-chan T) []T {
	t.Helper()
	var got []T
	timeout := time.After(5 * time.Second)
	for {
		select {
		case v, ok := <-out:
			if !ok {
				return got
			}
			got = append(got, v)
		case <-timeout:
			t.Fatalf("output is not closed; received %d values", len(got))
		}
	}
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

func TestMergeAll(t *testing.T) {
	ctx := context.Background()
	got := collect(t, Merge(ctx, source(1, 2, 3), source(10, 20), source(100)))
	slices.Sort(got)
	if want := []int{1, 2, 3, 10, 20, 100}; !slices.Equal(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestNoInputs(t *testing.T) {
	if got := collect(t, Merge[int](context.Background())); len(got) != 0 {
		t.Fatalf("got %v, want nothing", got)
	}
}

func TestNilInputIgnored(t *testing.T) {
	var never chan int
	got := collect(t, Merge(context.Background(), never, source(7)))
	if !slices.Equal(got, []int{7}) {
		t.Fatalf("got %v, want [7]", got)
	}
}

func TestOutputClosedOnlyAfterAllInputs(t *testing.T) {
	ctx := context.Background()
	a := make(chan int)
	b := make(chan int)
	out := Merge(ctx, a, b)
	close(a)
	// b is still open, so out must still deliver values from b.
	go func() { b <- 42 }()
	select {
	case v, ok := <-out:
		if !ok || v != 42 {
			t.Fatalf("got %d, %v; want 42, true: output closed too early?", v, ok)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("value from the open input did not arrive")
	}
	close(b)
	if got := collect(t, out); len(got) != 0 {
		t.Fatalf("unexpected values %v", got)
	}
}

func TestCancelWithOpenInputs(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	a := make(chan int) // never closed
	b := make(chan int) // never closed
	out := Merge(ctx, a, b)
	cancel()
	collect(t, out)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}
