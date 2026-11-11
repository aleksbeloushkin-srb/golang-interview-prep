// Package workerpool solves practice task W4-1 with errgroup.SetLimit (K3.5).
package workerpool

import (
	"context"

	"golang.org/x/sync/errgroup"
)

func Process[J, R any](ctx context.Context, workers int, jobs <-chan J, fn func(context.Context, J) R) <-chan R {
	results := make(chan R)
	var g errgroup.Group
	g.SetLimit(max(workers, 1))
	go func() {
		defer func() {
			g.Wait()
			close(results)
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case job, ok := <-jobs:
				if !ok {
					return
				}
				// Go blocks while the limit is reached; running tasks free a slot on ctx.Done().
				g.Go(func() error {
					r := fn(ctx, job)
					select {
					case results <- r:
					case <-ctx.Done():
					}
					return nil
				})
			}
		}
	}()
	return results
}
