// Package workerpool is the reference solution for practice task W3-1.
package workerpool

import (
	"context"
	"sync"
)

// Process runs fn for every job from jobs using at most workers goroutines
// and sends each result to the returned channel.
//
// Contract:
//   - workers < 1 is treated as 1;
//   - Process closes the returned channel after all workers have stopped;
//   - workers stop when jobs is closed and drained, or when ctx is done;
//   - while nobody reads the results, workers block instead of piling up results;
//   - the caller owns jobs and closes it; Process never closes jobs.
func Process[J, R any](ctx context.Context, workers int, jobs <-chan J, fn func(context.Context, J) R) <-chan R {
	if workers < 1 {
		workers = 1
	}
	results := make(chan R)
	var wg sync.WaitGroup
	wg.Add(workers)
	for range workers {
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-jobs:
					if !ok {
						return
					}
					r := fn(ctx, job)
					select {
					case results <- r:
					case <-ctx.Done():
						return
					}
				}
			}
		}()
	}
	// Only Process sends to results, so only Process closes it: after the last worker exits.
	go func() {
		wg.Wait()
		close(results)
	}()
	return results
}
