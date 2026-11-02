// Package ctxsvc shows what a service carries in a context and how it
// detaches work from a request: the request ID as a context value,
// WithoutCancel with its own timeout and an owner, and AfterFunc for a call
// that takes no context.
package ctxsvc

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

type requestIDKey struct{}

// WithRequestID returns a ctx that carries the request ID. The key type is
// unexported, so no other package can read or overwrite the value by accident.
func WithRequestID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, requestIDKey{}, id)
}

// RequestID returns the request ID carried by ctx, or "".
func RequestID(ctx context.Context) string {
	id, _ := ctx.Value(requestIDKey{}).(string)
	return id
}

// ErrDetachedTimeout is the cause of a detached context whose time ran out.
var ErrDetachedTimeout = errors.New("detached work timed out")

// Detached runs work that must finish after the response, such as an audit
// record. It owns those goroutines: Wait returns after all of them.
type Detached struct {
	timeout time.Duration
	wg      sync.WaitGroup
	mu      sync.Mutex
	errs    []error
}

// NewDetached rejects a zero timeout: context.WithTimeout(ctx, 0) is already
// expired, so every piece of work would fail at once.
func NewDetached(timeout time.Duration) (*Detached, error) {
	if timeout <= 0 {
		return nil, fmt.Errorf("detached timeout must be positive, got %v", timeout)
	}
	return &Detached{timeout: timeout}, nil
}

// Go runs f on a context that keeps the values of ctx (request ID, trace),
// is not cancelled when ctx is, and ends after the timeout with
// ErrDetachedTimeout as its cause.
func (d *Detached) Go(ctx context.Context, f func(context.Context) error) {
	dctx, cancel := context.WithTimeoutCause(context.WithoutCancel(ctx), d.timeout, ErrDetachedTimeout)
	d.wg.Add(1)
	go func() {
		defer d.wg.Done()
		defer cancel()
		if err := f(dctx); err != nil {
			if dctx.Err() != nil {
				err = fmt.Errorf("%w: %w", context.Cause(dctx), err)
			}
			d.mu.Lock()
			d.errs = append(d.errs, err)
			d.mu.Unlock()
		}
	}()
}

// Wait waits for the detached work and returns its errors joined. The
// service calls it on shutdown, after HTTP has drained and no handler can
// call Go any more.
func (d *Detached) Wait() error {
	d.wg.Wait()
	d.mu.Lock()
	defer d.mu.Unlock()
	return errors.Join(d.errs...)
}

// AuditHandler answers first and writes the audit record afterwards: the
// client leaving does not cancel the write, and the write has its own bound.
func AuditHandler(d *Detached, write func(ctx context.Context, rec string) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := WithRequestID(r.Context(), r.Header.Get("X-Request-ID")) // usually a middleware does this
		w.WriteHeader(http.StatusAccepted)
		d.Go(ctx, func(ctx context.Context) error {
			return write(ctx, "payment accepted, request "+RequestID(ctx))
		})
	}
}

// ReadContext reads from conn, whose Read takes no context, and gives up
// when ctx is done: AfterFunc moves the read deadline to now, which wakes
// the blocked Read.
func ReadContext(ctx context.Context, conn net.Conn, p []byte) (int, error) {
	fired := make(chan struct{})
	stop := context.AfterFunc(ctx, func() {
		conn.SetReadDeadline(time.Now())
		close(fired)
	})
	n, err := conn.Read(p)
	if !stop() {
		// f has already started: wait for it before undoing what it set.
		<-fired
		conn.SetReadDeadline(time.Time{})
		return n, ctx.Err()
	}
	return n, err
}
