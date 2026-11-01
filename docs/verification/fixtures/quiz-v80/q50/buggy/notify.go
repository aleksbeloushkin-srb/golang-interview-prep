package notify

import (
	"io"
	"net/http"
	"sync"
	"time"
)

// Hub wakes long-polling requests when a payment changes status.
type Hub struct {
	mu      sync.Mutex
	waiters map[string]map[chan string]struct{}
}

func NewHub() *Hub { return &Hub{waiters: make(map[string]map[chan string]struct{})} }

// Register adds a waiter for payment id; cancel removes it.
func (h *Hub) Register(id string) (<-chan string, func()) {
	ch := make(chan string)
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.waiters[id] == nil {
		h.waiters[id] = make(map[chan string]struct{})
	}
	h.waiters[id][ch] = struct{}{}
	return ch, func() {
		h.mu.Lock()
		defer h.mu.Unlock()
		delete(h.waiters[id], ch)
		if len(h.waiters[id]) == 0 {
			delete(h.waiters, id)
		}
	}
}

// Notify is called by the poller goroutine when payment id changes status.
func (h *Hub) Notify(id, status string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.waiters[id] {
		ch <- status
	}
	delete(h.waiters, id) // every waiter got its status
}

// Wait serves GET /payments/{id}/wait.
func (h *Hub) Wait(w http.ResponseWriter, r *http.Request) {
	updates, cancel := h.Register(r.PathValue("id"))
	defer cancel()
	select {
	case status := <-updates:
		io.WriteString(w, status)
	case <-time.After(25 * time.Second):
		w.WriteHeader(http.StatusNoContent) // the client asks again
	case <-r.Context().Done():
	}
}
