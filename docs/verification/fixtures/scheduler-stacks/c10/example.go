package admission

import "context"

// Share one Limit across callers. It bounds admitted work, not OS threads.
type Limit chan struct{}

func (limit Limit) Do(ctx context.Context, work func(context.Context) error) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	select {
	case limit <- struct{}{}:
		defer func() { <-limit }()
	case <-ctx.Done():
		return ctx.Err()
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	// Cancellation can race with this call; work must also cooperate.
	return work(ctx)
}

// Construct with make(Limit, 32); keep it shared and never close it.
