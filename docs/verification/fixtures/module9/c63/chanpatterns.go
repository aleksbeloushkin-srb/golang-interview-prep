// Package chanpatterns shows three channel patterns of a Go service: a signal
// channel that merges changes, a semaphore that rejects at once, and a
// pipeline whose stages close their outputs in a cascade.
package chanpatterns

import (
	"context"
	"net/http"
	"sync"
)

// Latest holds the newest state and wakes one consumer when it changes.
// Changes made before the consumer wakes up merge into one signal.
type Latest[T any] struct {
	mu      sync.Mutex
	v       T
	changed chan struct{} // capacity 1; never closed, the consumer stops by its ctx
}

func NewLatest[T any](v T) *Latest[T] {
	return &Latest[T]{v: v, changed: make(chan struct{}, 1)}
}

// Set stores v first and signals second, so a woken consumer reads v or newer.
func (l *Latest[T]) Set(v T) {
	l.mu.Lock()
	l.v = v
	l.mu.Unlock()
	select {
	case l.changed <- struct{}{}:
	default: // a signal is already pending: the consumer will read v anyway
	}
}

func (l *Latest[T]) Changed() <-chan struct{} { return l.changed }

func (l *Latest[T]) Get() T {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.v
}

// Limit lets at most n requests run next at the same time. Request n+1
// gets 429 at once instead of waiting in a queue it would time out in.
func Limit(n int, next http.Handler) http.Handler {
	slots := make(chan struct{}, n)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case slots <- struct{}{}:
			defer func() { <-slots }()
			next.ServeHTTP(w, r)
		default:
			w.Header().Set("Retry-After", "1")
			http.Error(w, "too many requests", http.StatusTooManyRequests)
		}
	})
}

// Emit sends items in order. Only Emit sends to its output, so only Emit
// closes it: after the last item, or as soon as ctx is cancelled.
func Emit[T any](ctx context.Context, items []T) <-chan T {
	out := make(chan T)
	go func() {
		defer close(out)
		for _, v := range items {
			select {
			case out <- v:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}

// Map sends f(v) for every v from in and closes its output when in is
// closed, so closing cascades down the pipeline. The sender of in must
// close it on cancellation too, as Emit does. The send sits in a select
// with ctx.Done: without it a stage whose consumer has left hangs forever.
func Map[In, Out any](ctx context.Context, in <-chan In, f func(In) Out) <-chan Out {
	out := make(chan Out)
	go func() {
		defer close(out)
		for v := range in {
			select {
			case out <- f(v):
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}
