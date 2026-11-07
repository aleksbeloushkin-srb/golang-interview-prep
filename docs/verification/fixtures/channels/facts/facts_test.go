// Package facts checks claims of the channels track that hold on Go 1.24+.
package facts

import (
	"context"
	"sync/atomic"
	"testing"
	"time"
)

// K2.2: ctx.Done() is closed and wakes every waiter; Timer.C delivers one value to one waiter.
func TestTimerWakesOneDoneWakesAll(t *testing.T) {
	timer := time.NewTimer(10 * time.Millisecond)
	defer timer.Stop()
	var woke atomic.Int32
	for range 5 {
		go func() {
			<-timer.C
			woke.Add(1)
		}()
	}
	time.Sleep(200 * time.Millisecond)
	if got := woke.Load(); got != 1 {
		t.Fatalf("Timer.C woke %d of 5 goroutines, want 1", got)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Millisecond)
	defer cancel()
	var done atomic.Int32
	for range 5 {
		go func() {
			<-ctx.Done()
			done.Add(1)
		}()
	}
	time.Sleep(200 * time.Millisecond)
	if got := done.Load(); got != 5 {
		t.Fatalf("ctx.Done() woke %d of 5 goroutines, want 5", got)
	}
}

// K2.4: an empty `case <-ctx.Done():` without return does not stop the writer.
func TestEmptyDoneCaseKeepsWriting(t *testing.T) {
	const n = 1_000_000
	write := func(ctx context.Context, out chan<- int, stopOnDone bool) int {
		sent := 0
		for i := range n {
			select {
			case out <- i:
			case <-ctx.Done():
				if stopOnDone {
					return sent
				}
			}
			sent++
		}
		return sent
	}
	for _, stop := range []bool{false, true} {
		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		iterations := write(ctx, make(chan int), stop) // nobody reads
		if !stop && iterations != n {
			t.Fatalf("without return: %d iterations, want all %d", iterations, n)
		}
		if stop && iterations != 0 {
			t.Fatalf("with return: %d iterations, want 0", iterations)
		}
	}
}

// K1.1 variation: after close a buffered channel first yields what is left, then zero, false.
func TestBufferedCloseDrainsFirst(t *testing.T) {
	ch := make(chan int, 2)
	ch <- 1
	ch <- 2
	close(ch)
	for _, want := range []int{1, 2} {
		if v, ok := <-ch; v != want || !ok {
			t.Fatalf("got %d, %v; want %d, true", v, ok, want)
		}
	}
	if v, ok := <-ch; v != 0 || ok {
		t.Fatalf("got %d, %v; want 0, false", v, ok)
	}
}

// K2.1: with two ready cases select picks either one.
func TestSelectPicksBothReadyCases(t *testing.T) {
	seen := map[string]int{}
	a, b := make(chan int, 1), make(chan int, 1)
	for range 1000 {
		a <- 1
		b <- 1
		select {
		case <-a:
			seen["a"]++
			<-b
		case <-b:
			seen["b"]++
			<-a
		}
	}
	if seen["a"] == 0 || seen["b"] == 0 {
		t.Fatalf("over 1000 runs: %v; want both cases", seen)
	}
}
