package tee

import (
	"context"
	"runtime"
	"slices"
	"sync"
	"testing"
	"time"
)

func source(n int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for i := range n {
			ch <- i
		}
	}()
	return ch
}

func collect(t *testing.T, out <-chan int) []int {
	t.Helper()
	var got []int
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

// readAll reads every output concurrently until all are closed.
func readAll(t *testing.T, outs []<-chan int) [][]int {
	t.Helper()
	got := make([][]int, len(outs))
	var wg sync.WaitGroup
	for i, out := range outs {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for v := range out {
				got[i] = append(got[i], v)
			}
		}()
	}
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("not every output was closed")
	}
	return got
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

func TestOrDoneForwardsAll(t *testing.T) {
	got := collect(t, OrDone(context.Background(), source(5)))
	if want := []int{0, 1, 2, 3, 4}; !slices.Equal(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestOrDoneCancelWithOpenInput(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	out := OrDone(ctx, make(chan int)) // the input never closes
	cancel()
	collect(t, out)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}

// Nobody reads the result: OrDone took a value and waits to send it.
// The send must also listen to ctx.Done(), otherwise the goroutine leaks.
func TestOrDoneCancelWithoutReading(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	in := make(chan int, 1)
	in <- 1
	out := OrDone(ctx, in)
	waitUntil(t, "OrDone to take a value", func() bool { return len(in) == 0 })
	cancel()
	waitUntil(t, "goroutines to exit while nobody reads", func() bool { return runtime.NumGoroutine() <= before })
	collect(t, out)
}

func TestTeeEveryOutputGetsAllInOrder(t *testing.T) {
	for range 20 {
		got := readAll(t, Tee(context.Background(), source(50), 3))
		want := collect(t, source(50))
		for i, out := range got {
			if !slices.Equal(out, want) {
				t.Fatalf("output %d got %v, want every value once, in order", i, out)
			}
		}
	}
}

func TestTeeNonPositiveN(t *testing.T) {
	got := readAll(t, Tee(context.Background(), source(3), 0))
	if len(got) != 1 || !slices.Equal(got[0], []int{0, 1, 2}) {
		t.Fatalf("got %v, want one output [0 1 2]", got)
	}
}

// Output 1 is not read yet, so output 0 may get the first value but not the
// second: the next value is read only after every output got the current one.
func TestTeeWaitsForSlowestReader(t *testing.T) {
	in := make(chan int, 3)
	in <- 10
	in <- 20
	in <- 30
	close(in)
	outs := Tee(context.Background(), in, 2)
	if v := <-outs[0]; v != 10 {
		t.Fatalf("output 0 got %d first, want 10", v)
	}
	select {
	case v := <-outs[0]:
		t.Fatalf("output 0 got %d before output 1 took 10: outputs must move in step", v)
	case <-time.After(50 * time.Millisecond):
	}
	if v := <-outs[1]; v != 10 {
		t.Fatalf("output 1 got %d first, want 10", v)
	}
	rest := readAll(t, outs)
	if !slices.Equal(rest[0], []int{20, 30}) || !slices.Equal(rest[1], []int{20, 30}) {
		t.Fatalf("rest %v, want [20 30] on both outputs", rest)
	}
}

func TestTeeCancelWithoutReading(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	in := make(chan int, 1)
	in <- 1
	outs := Tee(ctx, in, 3)
	waitUntil(t, "Tee to take a value", func() bool { return len(in) == 0 })
	cancel()
	waitUntil(t, "goroutines to exit while nobody reads", func() bool { return runtime.NumGoroutine() <= before })
	readAll(t, outs)
}

func TestTeeCancelWithOpenInput(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	outs := Tee(ctx, make(chan int), 2) // the input never closes
	cancel()
	readAll(t, outs)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}
