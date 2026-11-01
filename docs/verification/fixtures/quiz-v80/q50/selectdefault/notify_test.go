package notify

import "testing"

// The tempting fix, a select with default around an unbuffered send, does not
// hang, but a waiter that registered and has not reached its select yet loses
// the status and would sit until its 25-second timeout.
func TestStatusSentBeforeTheWaiterListensIsLost(t *testing.T) {
	h := NewHub()
	updates, cancel := h.Register("p1")
	defer cancel()
	h.Notify("p1", "paid") // returns at once: nobody was receiving
	select {
	case s := <-updates:
		t.Fatalf("got %q; want the status dropped", s)
	default:
	}
	h.mu.Lock()
	n := len(h.waiters["p1"])
	h.mu.Unlock()
	if n != 0 {
		t.Fatalf("%d waiters still registered; Notify removed them, so nothing will wake them", n)
	}
}
