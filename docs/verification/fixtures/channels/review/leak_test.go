//go:build go1.25 && leakdemo

package review

import (
	"context"
	"testing"
	"testing/synctest"
	"time"
)

// OrDone: the send outside select blocks forever once the reader cancels and leaves.
func TestLeakOrDone(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		in := make(chan int, 1)
		in <- 1
		OrDone(ctx, in)
		synctest.Wait()
		cancel()
	})
}

// TeeFast: a reader that leaves early leaves its senders blocked forever.
func TestLeakTeeFastReaderLeaves(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		outs := TeeFast(source(5), 2)
		go func() {
			for range outs[0] {
			}
		}()
		<-outs[1] // the second reader takes one value and leaves
	})
}

// The "solution without leaks": up to one goroutine per worker stays blocked on
// `out <- outVal{err: errTimeout}`.
func TestLeakBossWorker(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		in, out := make(chan int), make(chan int)
		go func() {
			defer close(in)
			for i := range 100 {
				select {
				case in <- i:
				case <-ctx.Done():
					return
				}
			}
		}()
		done := make(chan struct{})
		for range 5 {
			go func() { worker(ctx, in, out); done <- struct{}{} }()
		}
		go func() {
			for range 5 {
				<-done
			}
			close(out)
		}()
		for range out {
		}
		time.Sleep(10 * time.Second)
	})
}
