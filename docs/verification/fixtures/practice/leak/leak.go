// Package leak is the reference solution for practice task W4-4:
// a goroutine leak written on purpose, found with the goroutine profile, and fixed.
package leak

import (
	"context"
	"errors"
)

// Backend answers one query. A well-behaved backend returns early when ctx is done.
type Backend func(ctx context.Context) string

// ErrNoBackends is returned by First when there is nobody to ask.
var ErrNoBackends = errors.New("leak: no backends")

// FirstLeaky returns the first answer — and leaks on purpose: the channel is
// unbuffered and nobody reads after the first answer, so every slower backend's
// goroutine blocks forever on its send. In a goroutine profile they show up as
// "[chan send]" in leak.FirstLeaky.func1, and their number grows with each call.
func FirstLeaky(ctx context.Context, backends ...Backend) string {
	answers := make(chan string)
	for _, b := range backends {
		go func() { answers <- b(ctx) }()
	}
	return <-answers
}

// First returns the first answer without leaking:
//   - the channel has room for every answer, so late goroutines can send and exit;
//   - cancelling the derived ctx on return tells slow backends to stop early;
//   - if the caller's ctx is done first, First returns ctx.Err().
func First(ctx context.Context, backends ...Backend) (string, error) {
	if len(backends) == 0 {
		return "", ErrNoBackends
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	answers := make(chan string, len(backends))
	for _, b := range backends {
		go func() { answers <- b(ctx) }()
	}
	select {
	case a := <-answers:
		return a, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}
