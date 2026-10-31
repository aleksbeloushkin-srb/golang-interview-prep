// Package longpoll answers "wait until this payment changes" without a database
// query per waiting client: waiting requests register in a shared registry, and
// one poller reads all awaited payments with a single query per tick.
package longpoll

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"sync"
	"time"
)

// State is what the client sees; Version grows on every change.
type State struct {
	Version int64  `json:"version"`
	Status  string `json:"status"`
}

// Store reads several payments in one query, for example
// SELECT id, version, status FROM payments WHERE id = ANY($1).
type Store interface {
	States(ctx context.Context, ids []string) (map[string]State, error)
}

var ErrTooManyWaiters = errors.New("too many waiting requests")

type waiter struct {
	seen int64
	ch   chan State
}

// Waiters is the registry of requests waiting on this pod.
type Waiters struct {
	mu    sync.Mutex
	byID  map[string]map[*waiter]struct{}
	n     int
	limit int
}

func NewWaiters(limit int) *Waiters {
	return &Waiters{byID: make(map[string]map[*waiter]struct{}), limit: limit}
}

// Register adds a request that has already seen version seen of payment id.
// The channel (capacity 1) receives one newer state; cancel removes the
// request and may be called more than once.
func (w *Waiters) Register(id string, seen int64) (<-chan State, func(), error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if w.n >= w.limit {
		return nil, nil, ErrTooManyWaiters
	}
	wt := &waiter{seen: seen, ch: make(chan State, 1)}
	if w.byID[id] == nil {
		w.byID[id] = make(map[*waiter]struct{})
	}
	w.byID[id][wt] = struct{}{}
	w.n++
	return wt.ch, func() { w.remove(id, wt) }, nil
}

func (w *Waiters) remove(id string, wt *waiter) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.removeLocked(id, wt)
}

func (w *Waiters) removeLocked(id string, wt *waiter) {
	set := w.byID[id]
	if _, ok := set[wt]; !ok {
		return
	}
	delete(set, wt)
	if len(set) == 0 {
		delete(w.byID, id)
	}
	w.n--
}

// IDs returns the payments someone is waiting for.
func (w *Waiters) IDs() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	ids := make([]string, 0, len(w.byID))
	for id := range w.byID {
		ids = append(ids, id)
	}
	return ids
}

// Len is the number of waiting requests, for tests and a metric.
func (w *Waiters) Len() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.n
}

// Notify wakes and removes the requests that have not seen st yet. Requests
// that already saw this version, for example from a lagging replica, wait on.
func (w *Waiters) Notify(id string, st State) {
	w.mu.Lock()
	defer w.mu.Unlock()
	for wt := range w.byID[id] {
		if st.Version > wt.seen {
			wt.ch <- st // never blocks: the only send, into an empty buffer of 1
			w.removeLocked(id, wt)
		}
	}
}

// Poll reads every awaited payment with one query and wakes the waiters.
func Poll(ctx context.Context, w *Waiters, store Store) error {
	ids := w.IDs()
	if len(ids) == 0 {
		return nil
	}
	states, err := store.States(ctx, ids)
	if err != nil {
		return err
	}
	for id, st := range states {
		w.Notify(id, st)
	}
	return nil
}

// RunPoller polls every interval until ctx is cancelled; main owns it.
func RunPoller(ctx context.Context, w *Waiters, store Store, every time.Duration, log *slog.Logger) {
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			if err := Poll(ctx, w, store); err != nil && ctx.Err() == nil {
				log.Warn("long-poll query failed", "err", err) // waiters retry on the next tick
			}
		}
	}
}

// Handler serves GET /payments/{id}/wait?seen=N.
type Handler struct {
	Waiters     *Waiters
	Store       Store
	SoftTimeout time.Duration // below the server's WriteTimeout
	Log         *slog.Logger
}

type waitResponse struct {
	Changed bool   `json:"changed"`
	Version int64  `json:"version,omitempty"`
	Status  string `json:"status,omitempty"`
}

func (h *Handler) Routes(mux *http.ServeMux) {
	mux.HandleFunc("GET /payments/{id}/wait", h.wait)
}

func (h *Handler) wait(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	seen, err := strconv.ParseInt(r.URL.Query().Get("seen"), 10, 64)
	if err != nil || seen < 0 {
		http.Error(w, "seen must be a non-negative integer", http.StatusBadRequest)
		return
	}
	// Reject before touching the database when the pod is full.
	updates, cancel, err := h.Waiters.Register(id, seen)
	if err != nil {
		w.Header().Set("Retry-After", "1")
		http.Error(w, err.Error(), http.StatusTooManyRequests)
		return
	}
	defer cancel()

	states, err := h.Store.States(r.Context(), []string{id})
	if err != nil {
		if r.Context().Err() == nil {
			h.Log.Error("read payment", "id", id, "err", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}
	st, ok := states[id]
	if !ok {
		http.NotFound(w, r)
		return
	}
	if st.Version > seen { // already newer: answer at once
		writeJSON(w, waitResponse{Changed: true, Version: st.Version, Status: st.Status})
		return
	}

	timer := time.NewTimer(h.SoftTimeout)
	defer timer.Stop()
	select {
	case st := <-updates:
		writeJSON(w, waitResponse{Changed: true, Version: st.Version, Status: st.Status})
	case <-timer.C:
		writeJSON(w, waitResponse{Changed: false}) // the client asks again
	case <-r.Context().Done():
		// The client went away; the deferred cancel removes the registration.
	}
}

func writeJSON(w http.ResponseWriter, v waitResponse) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// NewServer keeps WriteTimeout above the soft timeout: when WriteTimeout
// expires first, the server cannot write the response and drops it.
func NewServer(addr string, h http.Handler, softTimeout time.Duration) *http.Server {
	return &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      softTimeout + 10*time.Second,
		IdleTimeout:       60 * time.Second,
	}
}
