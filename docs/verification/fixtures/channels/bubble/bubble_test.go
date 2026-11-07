//go:build go1.25

// Package bubble checks timing claims of the channels track in virtual time
// (testing/synctest, Go 1.25+). synctest.Test also fails when a goroutine
// started in the bubble stays blocked forever: that makes it a leak detector.
package bubble

import (
	"context"
	"errors"
	"math/rand/v2"
	"sync"
	"testing"
	"testing/synctest"
	"time"
)

// K1.5: writer → doubler (500 ms per value) → reader takes exactly 5 s for 10 values.
func TestPipelineFiveSeconds(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		writer := func() <-chan int {
			out := make(chan int)
			go func() {
				defer close(out)
				for i := 1; i <= 10; i++ {
					out <- i
				}
			}()
			return out
		}
		double := func(in <-chan int) <-chan int {
			out := make(chan int)
			go func() {
				defer close(out)
				for v := range in {
					time.Sleep(500 * time.Millisecond)
					out <- v * 2
				}
			}()
			return out
		}
		start := time.Now()
		sum := 0
		for v := range double(writer()) {
			sum += v
		}
		if elapsed := time.Since(start); elapsed != 5*time.Second || sum != 110 {
			t.Fatalf("took %v, sum %d; want 5s, 110", elapsed, sum)
		}
	})
}

// K2.2: time.After, Timer and context.WithTimeout leave the select exactly at the deadline.
func TestThreeTimeouts(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		never := make(chan int)
		start := time.Now()
		select {
		case <-never:
		case <-time.After(time.Second):
		}
		timer := time.NewTimer(time.Second)
		defer timer.Stop()
		select {
		case <-never:
		case <-timer.C:
		}
		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		select {
		case <-never:
		case <-ctx.Done():
		}
		if elapsed := time.Since(start); elapsed != 3*time.Second || !errors.Is(ctx.Err(), context.DeadlineExceeded) {
			t.Fatalf("took %v, ctx %v; want 3s, deadline exceeded", elapsed, ctx.Err())
		}
	})
}

// K2.5, version 1: a done channel and time.After stop the waiting, not the work.
func TestCloseDoneWrapperDoesNotStopWork(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var finished time.Duration
		start := time.Now()
		work := func() { time.Sleep(4 * time.Second); finished = time.Since(start) }
		done := make(chan struct{})
		go func() {
			work()
			close(done)
		}()
		select {
		case <-done:
		case <-time.After(3 * time.Second):
		}
		if returned := time.Since(start); returned != 3*time.Second {
			t.Fatalf("wrapper returned after %v, want 3s", returned)
		}
		synctest.Wait() // the work goroutine is still sleeping
		time.Sleep(time.Second)
		synctest.Wait()
		if finished != 4*time.Second {
			t.Fatalf("work finished at %v, want 4s: the wrapper did not interrupt it", finished)
		}
	})
}

// K2.5, version 3: ctx plus a result buffer of 1 — no goroutine outlives the bubble.
func TestCtxWrapperNoLeak(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		call := func(ctx context.Context, d time.Duration, f func() int) (int, error) {
			ctx, cancel := context.WithTimeout(ctx, d)
			defer cancel()
			res := make(chan int, 1)
			go func() { res <- f() }()
			select {
			case v := <-res:
				return v, nil
			case <-ctx.Done():
				return 0, ctx.Err()
			}
		}
		_, err := call(context.Background(), 3*time.Second, func() int { time.Sleep(100 * time.Second); return 1 })
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Fatalf("got %v, want deadline exceeded", err)
		}
		// Virtual time stops once this goroutine returns, so let f finish first:
		// with the buffer its goroutine then sends and exits; without it, it would
		// stay blocked and synctest.Test would fail.
		time.Sleep(100 * time.Second)
	})
}

// K2.6: the compact solution of the "final boss". processData sleeps up to 9 s
// and cannot be cancelled; processParallel returns at once, closes out itself
// and the whole run fits into 5 s.
func processData(v int) int {
	time.Sleep(time.Duration(rand.IntN(10)) * time.Second)
	return v * 2
}

func processParallel(in <-chan int, out chan<- int, numWorkers int) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	var wg sync.WaitGroup
	for range numWorkers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				// Reading in also listens to ctx: a slow sender must not hold the run past 5 s.
				var v int
				select {
				case x, ok := <-in:
					if !ok {
						return
					}
					v = x
				case <-ctx.Done():
					return
				}
				res := make(chan int, 1) // processData cannot be cancelled
				go func() { res <- processData(v) }()
				select {
				case r := <-res:
					select {
					case out <- r:
					case <-ctx.Done():
						return
					}
				case <-ctx.Done():
					return
				}
			}
		}()
	}
	go func() {
		wg.Wait()
		cancel()
		close(out)
	}()
}

// The sender gives three values and then waits a minute before closing in:
// the run must still end at the 5 s deadline.
func TestFinalBossSlowSender(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		in, out := make(chan int), make(chan int)
		go func() {
			defer close(in)
			for i := range 3 {
				in <- i
			}
			time.Sleep(time.Minute)
		}()
		start := time.Now()
		processParallel(in, out, 5)
		for range out {
		}
		if elapsed := time.Since(start); elapsed > 5*time.Second {
			t.Fatalf("took %v, want at most 5s", elapsed)
		}
		time.Sleep(time.Minute) // let the sender and the sleeping work finish
	})
}

func TestFinalBoss(t *testing.T) {
	for run := range 20 {
		synctest.Test(t, func(t *testing.T) {
			in := make(chan int)
			out := make(chan int)
			go func() {
				defer close(in)
				for i := range 100 {
					in <- i
				}
			}()
			start := time.Now()
			processParallel(in, out, 5)
			if since := time.Since(start); since != 0 {
				t.Fatalf("processParallel blocked for %v; it must return at once", since)
			}
			got := 0
			for range out {
				got++
			}
			if elapsed := time.Since(start); elapsed > 5*time.Second {
				t.Fatalf("run %d took %v, want at most 5s", run, elapsed)
			}
			elapsed := time.Since(start)
			// The feeder still waits on `in <- i`: nobody reads in after the deadline.
			for range in {
			}
			// Virtual time stops once this goroutine returns: sleep past the longest
			// processData (9 s) so the sleeping goroutines finish. A goroutine blocked
			// forever would still make synctest.Test fail.
			time.Sleep(10 * time.Second)
			t.Logf("run %d: %d values in %v", run, got, elapsed)
		})
	}
}
