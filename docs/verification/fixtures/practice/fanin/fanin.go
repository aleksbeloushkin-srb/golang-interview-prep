// Package fanin is the reference solution for practice task W3-3.
package fanin

import (
	"context"
	"sync"
)

// Merge forwards every value from all inputs to the returned channel.
// It closes the output after all inputs are closed, or after ctx is done.
// Merge never closes the inputs: they belong to their senders. A nil input
// never delivers and is never closed, so Merge ignores it.
func Merge[T any](ctx context.Context, inputs ...<-chan T) <-chan T {
	out := make(chan T)
	var wg sync.WaitGroup
	for _, in := range inputs {
		if in == nil {
			continue
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case v, ok := <-in:
					if !ok {
						return
					}
					select {
					case out <- v:
					case <-ctx.Done():
						return
					}
				}
			}
		}()
	}
	// Several goroutines send to out, so none of them may close it: one closer waits for all.
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}
