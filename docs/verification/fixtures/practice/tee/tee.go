// Package tee is the reference solution for practice task W9-1:
// or-done and tee, both stopping on cancellation without leaks.
package tee

import (
	"context"
	"sync"
)

// OrDone forwards values from in until in is closed or ctx is done, and closes
// the returned channel in both cases. A reader can then range over the result
// without its own select on ctx.Done(). OrDone never closes in.
func OrDone[T any](ctx context.Context, in <-chan T) <-chan T {
	out := make(chan T)
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
				// The send waits for a reader, so it needs its own exit on cancellation.
				select {
				case out <- v:
				case <-ctx.Done():
					return
				}
			}
		}
	}()
	return out
}

// Tee copies every value from in to n outputs (n < 1 means 1). The next value
// is read only after the current one has reached every output: a slow reader
// holds back the others, and each output keeps the input order. All outputs
// are closed after in is closed or ctx is done. Tee never closes in.
func Tee[T any](ctx context.Context, in <-chan T, n int) []<-chan T {
	n = max(n, 1)
	outs := make([]chan T, n)
	result := make([]<-chan T, n)
	for i := range outs {
		outs[i] = make(chan T)
		result[i] = outs[i]
	}
	go func() {
		defer func() {
			for _, out := range outs {
				close(out)
			}
		}()
		for v := range OrDone(ctx, in) {
			// One goroutine per output, joined before the next value: the outputs
			// are served in any order, but none gets two values ahead of another.
			var wg sync.WaitGroup
			for _, out := range outs {
				wg.Add(1)
				go func() {
					defer wg.Done()
					select {
					case out <- v:
					case <-ctx.Done():
					}
				}()
			}
			wg.Wait()
		}
	}()
	return result
}
