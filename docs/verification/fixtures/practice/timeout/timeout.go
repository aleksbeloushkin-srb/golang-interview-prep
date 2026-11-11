// Package timeout is the reference solution for practice task W6-3:
// wait for a function's result at most a given time, without leaking it.
package timeout

import (
	"context"
	"time"
)

// Call runs f and waits at most d for its result. f receives a context with
// that deadline, cancelled when Call returns, so a cooperative f can stop
// early. After the deadline Call returns the zero value and
// context.DeadlineExceeded; if the parent ctx is done first, its error.
// Call does not wait for an f that ignores its context.
func Call[T any](ctx context.Context, d time.Duration, f func(context.Context) (T, error)) (T, error) {
	ctx, cancel := context.WithTimeout(ctx, d)
	defer cancel()
	type result struct {
		v   T
		err error
	}
	// Buffer 1: a late f can still send its result and exit after Call has returned.
	res := make(chan result, 1)
	go func() {
		v, err := f(ctx)
		res <- result{v, err}
	}()
	select {
	case r := <-res:
		return r.v, r.err
	case <-ctx.Done():
		var zero T
		return zero, ctx.Err()
	}
}
