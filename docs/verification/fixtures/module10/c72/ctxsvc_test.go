package ctxsvc

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// The audit write runs after the server has cancelled the request context,
// still sees the request ID, and is not cancelled itself.
func TestAuditOutlivesTheRequest(t *testing.T) {
	d, err := NewDetached(time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	type seen struct {
		rec string
		id  string
		err error
	}
	reqCtx := make(chan context.Context, 1)
	release := make(chan struct{})
	got := make(chan seen, 1)
	h := AuditHandler(d, func(ctx context.Context, rec string) error {
		<-release
		got <- seen{rec, RequestID(ctx), ctx.Err()}
		return nil
	})
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqCtx <- r.Context()
		h(w, r)
	}))
	defer srv.Close()

	req, err := http.NewRequest(http.MethodPost, srv.URL, nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("X-Request-ID", "r-42")
	resp, err := srv.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusAccepted {
		t.Fatalf("status %d, want 202", resp.StatusCode)
	}
	<-(<-reqCtx).Done() // net/http cancels the request context once the handler returns
	close(release)
	if err := d.Wait(); err != nil {
		t.Fatalf("Wait: %v", err)
	}
	s := <-got
	if s.err != nil || s.id != "r-42" || s.rec != "payment accepted, request r-42" {
		t.Fatalf("detached work saw err=%v id=%q rec=%q", s.err, s.id, s.rec)
	}
}

// Without its own timeout detached work would have no bound at all.
func TestDetachedWorkHasItsOwnBound(t *testing.T) {
	d, err := NewDetached(10 * time.Millisecond)
	if err != nil {
		t.Fatal(err)
	}
	d.Go(context.Background(), func(ctx context.Context) error {
		<-ctx.Done() // a stuck dependency
		return fmt.Errorf("audit: %w", ctx.Err())
	})
	err = d.Wait()
	if !errors.Is(err, ErrDetachedTimeout) || !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("Wait = %v, want the cause and DeadlineExceeded", err)
	}
	if want := "detached work timed out: audit: context deadline exceeded"; err.Error() != want {
		t.Fatalf("Wait = %q, want %q", err, want)
	}
}

func TestZeroTimeoutIsAlreadyExpired(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 0)
	defer cancel()
	if !errors.Is(ctx.Err(), context.DeadlineExceeded) {
		t.Fatalf("WithTimeout(ctx, 0).Err() = %v, want DeadlineExceeded at once", ctx.Err())
	}
	if _, err := NewDetached(0); err == nil {
		t.Fatal("NewDetached(0) accepted a zero timeout")
	}
}

// noCancel is the hand-rolled detach: it hides Done and Err but still
// reports the parent's Deadline.
type noCancel struct{ context.Context }

func (noCancel) Done() <-chan struct{} { return nil }
func (noCancel) Err() error            { return nil }

// The request's deadline has passed. Both contexts report Err() == nil, but
// only WithoutCancel drops the deadline; net.Dialer reads Deadline and fails
// on the hand-rolled one. WithTimeout never extends an earlier deadline.
func TestDetachDropsTheRequestDeadline(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer ln.Close()
	parent, cancel := context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
	defer cancel()

	for _, tc := range []struct {
		name     string
		detached context.Context
		wantDial bool
	}{
		{"context.WithoutCancel", context.WithoutCancel(parent), true},
		{"hand-rolled noCancel", noCancel{parent}, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			ctx, cancel := context.WithTimeout(tc.detached, time.Hour)
			defer cancel()
			if ctx.Err() != nil {
				t.Fatalf("Err() = %v, want nil", ctx.Err())
			}
			dl, _ := ctx.Deadline()
			if inFuture := time.Until(dl) > 30*time.Minute; inFuture != tc.wantDial {
				t.Fatalf("deadline %v from now", time.Until(dl).Round(time.Second))
			}
			var dialer net.Dialer
			conn, err := dialer.DialContext(ctx, "tcp", ln.Addr().String())
			if tc.wantDial {
				if err != nil {
					t.Fatalf("dial: %v", err)
				}
				conn.Close()
				return
			}
			var ne net.Error
			if !errors.As(err, &ne) || !ne.Timeout() {
				t.Fatalf("dial = %v, want a timeout", err)
			}
		})
	}
}

func TestReadContextGivesUpOnCancel(t *testing.T) {
	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		_, err := ReadContext(ctx, client, make([]byte, 8)) // nobody writes: Read blocks
		done <- err
	}()
	cancel()
	if err := <-done; !errors.Is(err, context.Canceled) {
		t.Fatalf("ReadContext = %v, want context.Canceled", err)
	}

	// The deadline was reset, so the connection still works.
	wrote := make(chan error, 1)
	go func() {
		_, err := server.Write([]byte("ok"))
		wrote <- err
	}()
	buf := make([]byte, 8)
	n, err := ReadContext(context.Background(), client, buf)
	if err != nil || string(buf[:n]) != "ok" {
		t.Fatalf("ReadContext = %q, %v; want \"ok\"", buf[:n], err)
	}
	if err := <-wrote; err != nil {
		t.Fatal(err)
	}
}
