// Package leaks holds the leaking code the channels track asks to find, next
// to its fix. Tests named TestLeak* must fail; run them only with -tags leakdemo.
package leaks

import (
	"context"
	"errors"
	"math/rand/v2"
	"sync"
	"time"
)

var errTimeout = errors.New("timed out")

type outVal struct {
	val int
	err error
}

// processDataNoLeak follows the "solution without leaks" of the final boss:
// on timeout the second goroutine sends errTimeout to an unbuffered channel.
// A worker that has already left on ctx.Done() never reads it.
func processDataNoLeak(ctx context.Context, v int, buffer int, unit time.Duration) chan outVal {
	done := make(chan struct{})
	out := make(chan outVal, buffer)
	go func() {
		time.Sleep(time.Duration(rand.IntN(10)) * unit)
		close(done)
	}()
	go func() {
		select {
		case <-done:
			out <- outVal{val: v * 2}
		case <-ctx.Done():
			out <- outVal{err: errTimeout}
		}
	}()
	return out
}

// ProcessParallel is the worker pool of that solution; buffer is the capacity
// of processData's result channel: 0 leaks, 1 does not.
func ProcessParallel(ctx context.Context, in <-chan int, out chan<- int, workers, buffer int, unit time.Duration) {
	var wg sync.WaitGroup
	for range workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case v, ok := <-in:
					if !ok {
						return
					}
					select {
					case ov := <-processDataNoLeak(ctx, v, buffer, unit):
						if ov.err != nil {
							return
						}
						select {
						case out <- ov.val:
						case <-ctx.Done():
							return
						}
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
		close(out)
	}()
}

// FirstLeaky returns the first answer; the losers block forever on the unbuffered send.
func FirstLeaky(backends ...func() int) int {
	ch := make(chan int)
	for _, b := range backends {
		go func() { ch <- b() }()
	}
	return <-ch
}

// OrDoneNoSelect forwards like or-done, but its send ignores cancellation.
func OrDoneNoSelect(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for {
			select {
			case <-ctx.Done():
				return
			case v, ok := <-in:
				if !ok {
					return
				}
				out <- v // blocks forever once the reader has gone
			}
		}
	}()
	return out
}

// Stuck is reachable from a global, so the goroutineleak profile cannot prove
// that nobody will ever receive from it.
var Stuck = make(chan int)

func LeakOnGlobal() { go func() { Stuck <- 1 }() }
