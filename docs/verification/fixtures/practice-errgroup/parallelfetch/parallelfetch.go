// Package parallelfetch is the reference solution for practice task W4-1.
package parallelfetch

import (
	"context"
	"fmt"

	"golang.org/x/sync/errgroup"
)

// Fetch calls fetch for every URL, with at most limit calls running at a time
// (limit < 1 means 1), and returns the bodies in the order of urls.
//
// The first error cancels the context passed to the other calls, no new calls
// start after it, and Fetch returns that error only after every started call
// has returned.
func Fetch(ctx context.Context, urls []string, limit int, fetch func(context.Context, string) (string, error)) ([]string, error) {
	if limit < 1 {
		limit = 1
	}
	g, gctx := errgroup.WithContext(ctx)
	g.SetLimit(limit)
	bodies := make([]string, len(urls))
	for i, url := range urls {
		if gctx.Err() != nil {
			break // a call already failed or ctx is done: do not start more
		}
		g.Go(func() error { // blocks while limit calls are running
			if err := gctx.Err(); err != nil {
				return err // the group failed while this call waited for a free slot
			}
			body, err := fetch(gctx, url)
			if err != nil {
				return fmt.Errorf("fetch %s: %w", url, err)
			}
			bodies[i] = body // each goroutine writes only its own index
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		return nil, err
	}
	if err := ctx.Err(); err != nil {
		return nil, err // cancelled before every URL was started
	}
	return bodies, nil
}
