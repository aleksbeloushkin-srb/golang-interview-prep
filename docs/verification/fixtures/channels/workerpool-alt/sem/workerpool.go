// Package workerpool solves practice task W4-1 with a semaphore instead of a
// fixed pool (K3.5): a goroutine per job, a slot taken before go.
package workerpool

import (
	"context"
	"sync"
)

func Process[J, R any](ctx context.Context, workers int, jobs <-chan J, fn func(context.Context, J) R) <-chan R {
	workers = max(workers, 1)
	results := make(chan R)
	sem := make(chan struct{}, workers)
	go func() {
		var wg sync.WaitGroup
		defer func() {
			wg.Wait()
			close(results)
		}()
		for {
			var job J
			select {
			case <-ctx.Done():
				return
			case j, ok := <-jobs:
				if !ok {
					return
				}
				job = j
			}
			// The slot is taken before go: at most workers goroutines exist at once.
			select {
			case sem <- struct{}{}:
			case <-ctx.Done():
				return
			}
			wg.Add(1)
			go func() {
				defer func() { <-sem; wg.Done() }()
				r := fn(ctx, job)
				select {
				case results <- r:
				case <-ctx.Done():
				}
			}()
		}
	}()
	return results
}
