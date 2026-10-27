package checkout

import (
	"context"
	"golang.org/x/sync/errgroup"
)

func Process(ctx context.Context, check, load, save func(context.Context) error) error {
	g, gCtx := errgroup.WithContext(ctx)
	g.Go(func() error { return check(gCtx) })
	g.Go(func() error { return load(gCtx) })
	if err := g.Wait(); err != nil {
		return err
	}
	return save(ctx)
}
