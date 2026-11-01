package notify

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"example.com/rvquiz/q50/internal/gstate"
)

func waiting(h *Hub, id string) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.waiters[id])
}

func waitUntil(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for %s", what)
		}
		time.Sleep(time.Millisecond)
	}
}

func isClosed(ch <-chan struct{}) bool {
	select {
	case <-ch:
		return true
	default:
		return false
	}
}

// The happy path works with the bug, which is why it survives review:
// while the handler sits in its select, the unbuffered send finds a receiver.
func TestHappyPathWorks(t *testing.T) {
	h := NewHub()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /payments/{id}/wait", h.Wait)
	srv := httptest.NewServer(mux)
	defer srv.Close()

	body := make(chan string, 1)
	go func() {
		resp, err := http.Get(srv.URL + "/payments/p1/wait")
		if err != nil {
			body <- err.Error()
			return
		}
		defer resp.Body.Close()
		b, _ := io.ReadAll(resp.Body)
		body <- string(b)
	}()
	waitUntil(t, "the request to register", func() bool { return waiting(h, "p1") == 1 })
	gstate.WaitFor(t, "(*Hub).Wait(", "select") // the handler is in its select now
	h.Notify("p1", "paid")
	if got := <-body; got != "paid" {
		t.Fatalf("body %q, want paid", got)
	}
}

// The trap: the handler has left its select (timeout or client gone) and is
// about to run its deferred cancel when the poller calls Notify.
func TestNotifyHangsWhenWaiterLeft(t *testing.T) {
	h := NewHub()
	updates, cancel := h.Register("p1") // this handler will never receive again

	notified := make(chan struct{})
	go func() { h.Notify("p1", "paid"); close(notified) }() // the poller
	gstate.WaitFor(t, "(*Hub).Notify(", "chan send")

	cancelled := make(chan struct{})
	go func() { cancel(); close(cancelled) }() // the handler's deferred cancel
	gstate.WaitFor(t, "(*Hub).Register.func1(", "sync.Mutex.Lock")

	registered := make(chan struct{})
	go func() { h.Register("p2"); close(registered) }() // a new request
	gstate.WaitFor(t, "(*Hub).Register(", "sync.Mutex.Lock")

	// A cycle: Notify holds h.mu and waits for a receiver that has left; that
	// receiver's cancel and every new request wait for h.mu.
	if isClosed(notified) || isClosed(cancelled) || isClosed(registered) {
		t.Fatal("something returned; want all three blocked")
	}

	// Only the test can break the cycle: it plays the receiver that never comes
	// in production, so that no goroutine outlives the test.
	<-updates
	<-notified
	<-cancelled
	<-registered
}

// Under -race and with many requests: each one either listens or leaves at
// once. With the bug the leavers hang the poller; this only checks that the
// happy half alone is served, to keep the suite finite.
func TestManyListeningWaiters(t *testing.T) {
	h := NewHub()
	const n = 100
	done := make(chan string, n)
	for range n {
		updates, cancel := h.Register("p1")
		go func() {
			defer cancel()
			ctx, stop := context.WithTimeout(context.Background(), 5*time.Second)
			defer stop()
			select {
			case s := <-updates:
				done <- s
			case <-ctx.Done():
				done <- "timeout"
			}
		}()
	}
	h.Notify("p1", "paid")
	for range n {
		if s := <-done; s != "paid" {
			t.Fatalf("got %q, want paid", s)
		}
	}
}
