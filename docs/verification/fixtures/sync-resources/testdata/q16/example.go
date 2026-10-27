package checkout

import (
	"context"
	"golang.org/x/sync/errgroup"
)

func Process(ctx context.Context, check, load, save func(context.Context) error) error {
	g, ctx := errgroup.WithContext(ctx)
	g.Go(func() error { return check(ctx) })
	g.Go(func() error { return load(ctx) })
	if err := g.Wait(); err != nil {
		return err
	}
	return save(ctx)
}
