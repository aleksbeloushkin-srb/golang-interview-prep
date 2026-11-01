package notify

import (
	"context"
	"io"
	"math/rand/v2"
	"net/http"
	"net/http/httptest"
	"sync"
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

// within fails instead of hanging when f blocks.
func within(t *testing.T, what string, f func()) {
	t.Helper()
	done := make(chan struct{})
	go func() { f(); close(done) }()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatalf("%s blocked", what)
	}
}

func TestHappyPath(t *testing.T) {
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
	h.Notify("p1", "paid")
	if got := <-body; got != "paid" {
		t.Fatalf("body %q, want paid", got)
	}
	waitUntil(t, "the waiter to be removed", func() bool { return waiting(h, "p1") == 0 })
}

// The handler that has left: Notify's send lands in the buffer and returns.
func TestNotifyDoesNotWaitForAWaiterThatLeft(t *testing.T) {
	h := NewHub()
	_, cancel := h.Register("p1")
	within(t, "Notify", func() { h.Notify("p1", "paid") })
	within(t, "cancel", cancel)
	within(t, "a new Register", func() { h.Register("p2") })
	if gstate.Has("(*Hub).Notify(", "chan send") {
		t.Fatal("a Notify goroutine is still parked on a send")
	}
}

// A waiter that registered but has not reached its select yet (for example, it
// is still reading the current state) still gets the status.
func TestStatusSentBeforeTheWaiterListensIsKept(t *testing.T) {
	h := NewHub()
	updates, cancel := h.Register("p1")
	defer cancel()
	h.Notify("p1", "paid")
	select {
	case s := <-updates:
		if s != "paid" {
			t.Fatalf("got %q, want paid", s)
		}
	default:
		t.Fatal("the status was lost")
	}
}

// Many requests that listen, leave at a random moment, or race with Notify:
// nothing blocks, and every listener that stayed gets the status.
func TestManyWaitersSomeLeave(t *testing.T) {
	h := NewHub()
	const n = 200
	var wg sync.WaitGroup
	start := make(chan struct{})
	for range n {
		updates, cancel := h.Register("p1")
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer cancel()
			<-start
			if rand.IntN(2) == 0 {
				return // the client left: cancel runs at once
			}
			ctx, stop := context.WithTimeout(context.Background(), 5*time.Second)
			defer stop()
			select {
			case s := <-updates:
				if s != "paid" {
					t.Errorf("got %q, want paid", s)
				}
			case <-ctx.Done():
				t.Error("a listening waiter never got the status")
			}
		}()
	}
	close(start)
	within(t, "Notify", func() { h.Notify("p1", "paid") })
	within(t, "all handlers", wg.Wait)
	if n := waiting(h, "p1"); n != 0 {
		t.Fatalf("%d waiters left in the hub, want 0", n)
	}
}
