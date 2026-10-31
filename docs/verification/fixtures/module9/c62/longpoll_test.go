package longpoll

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"slices"
	"sync"
	"testing"
	"time"
)

// fakeStore stands in for a replica; reads reports every call so that tests
// know a request has registered and finished its first read.
type fakeStore struct {
	mu     sync.Mutex
	states map[string]State
	calls  [][]string
	err    error
	reads  chan []string
}

func newStore(states map[string]State) *fakeStore {
	return &fakeStore{states: states, reads: make(chan []string, 64)}
}

func (s *fakeStore) States(_ context.Context, ids []string) (map[string]State, error) {
	s.mu.Lock()
	out := make(map[string]State, len(ids))
	for _, id := range ids {
		if st, ok := s.states[id]; ok {
			out[id] = st
		}
	}
	s.calls = append(s.calls, slices.Clone(ids))
	err := s.err
	s.mu.Unlock()
	s.reads <- slices.Clone(ids)
	return out, err
}

func (s *fakeStore) set(id string, st State) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.states[id] = st
}

type env struct {
	store   *fakeStore
	waiters *Waiters
	url     string
	served  chan struct{} // one value per finished handler call
}

func start(t *testing.T, limit int, soft time.Duration) *env {
	t.Helper()
	e := &env{
		store:   newStore(map[string]State{"p1": {Version: 1, Status: "PROCESSING"}}),
		waiters: NewWaiters(limit),
		served:  make(chan struct{}, 16),
	}
	mux := http.NewServeMux()
	h := &Handler{Waiters: e.waiters, Store: e.store, SoftTimeout: soft, Log: slog.New(slog.NewTextHandler(io.Discard, nil))}
	h.Routes(mux)
	served := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mux.ServeHTTP(w, r)
		e.served <- struct{}{}
	})
	srv := httptest.NewUnstartedServer(nil)
	srv.Config = NewServer("", served, soft)
	srv.Start()
	t.Cleanup(srv.Close)
	e.url = srv.URL
	return e
}

type result struct {
	code int
	body waitResponse
	err  error
}

func get(ctx context.Context, url string) result {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return result{err: err}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return result{err: err}
	}
	defer resp.Body.Close()
	r := result{code: resp.StatusCode}
	if resp.StatusCode == http.StatusOK {
		r.err = json.NewDecoder(resp.Body).Decode(&r.body)
	}
	return r
}

func (e *env) wait(ctx context.Context, query string) <-chan result {
	out := make(chan result, 1)
	go func() { out <- get(ctx, e.url+"/payments/p1/wait?"+query) }()
	return out
}

func TestImmediateAnswersAndErrors(t *testing.T) {
	e := start(t, 10, time.Minute)
	tests := []struct {
		name, path string
		code       int
		changed    bool
	}{
		{"already newer", "/payments/p1/wait?seen=0", http.StatusOK, true},
		{"bad seen", "/payments/p1/wait?seen=abc", http.StatusBadRequest, false},
		{"negative seen", "/payments/p1/wait?seen=-1", http.StatusBadRequest, false},
		{"unknown payment", "/payments/nope/wait?seen=0", http.StatusNotFound, false},
		{"wrong method", "", http.StatusMethodNotAllowed, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var r result
			if tt.path == "" {
				resp, err := http.Post(e.url+"/payments/p1/wait?seen=0", "text/plain", nil)
				if err != nil {
					t.Fatal(err)
				}
				resp.Body.Close()
				r = result{code: resp.StatusCode}
			} else {
				r = get(context.Background(), e.url+tt.path)
			}
			<-e.served
			if r.err != nil || r.code != tt.code || r.body.Changed != tt.changed {
				t.Fatalf("got %+v, want code %d changed %v", r, tt.code, tt.changed)
			}
			if n := e.waiters.Len(); n != 0 {
				t.Fatalf("Len = %d after the request, want 0", n)
			}
		})
	}
}

func TestPollWakesOnlyOnNewerVersion(t *testing.T) {
	e := start(t, 10, time.Minute)
	res := e.wait(context.Background(), "seen=1")
	<-e.store.reads // registered and read version 1 == seen

	// A lagging replica still returns version 1: the request keeps waiting.
	if err := Poll(context.Background(), e.waiters, e.store); err != nil {
		t.Fatal(err)
	}
	<-e.store.reads
	if n := e.waiters.Len(); n != 1 {
		t.Fatalf("Len = %d after a stale poll, want 1", n)
	}

	e.store.set("p1", State{Version: 2, Status: "SUCCEEDED"})
	if err := Poll(context.Background(), e.waiters, e.store); err != nil {
		t.Fatal(err)
	}
	<-e.store.reads
	r := <-res
	if r.err != nil || r.code != http.StatusOK || r.body != (waitResponse{Changed: true, Version: 2, Status: "SUCCEEDED"}) {
		t.Fatalf("got %+v", r)
	}
	<-e.served
	if n := e.waiters.Len(); n != 0 {
		t.Fatalf("Len = %d, want 0", n)
	}
}

func TestSoftTimeoutReturnsUnchanged(t *testing.T) {
	e := start(t, 10, 20*time.Millisecond)
	r := <-e.wait(context.Background(), "seen=1")
	if r.err != nil || r.code != http.StatusOK || r.body != (waitResponse{Changed: false}) {
		t.Fatalf("got %+v, want 200 {changed:false}", r)
	}
	<-e.served
	if n := e.waiters.Len(); n != 0 {
		t.Fatalf("Len = %d, want 0", n)
	}
}

func TestLimitReturns429(t *testing.T) {
	e := start(t, 1, time.Minute)
	ctx, cancel := context.WithCancel(context.Background())
	first := e.wait(ctx, "seen=1")
	<-e.store.reads // the first request holds the only slot

	resp, err := http.Get(e.url + "/payments/p1/wait?seen=1")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	<-e.served
	if resp.StatusCode != http.StatusTooManyRequests || resp.Header.Get("Retry-After") != "1" {
		t.Fatalf("second request: %d Retry-After=%q, want 429 and 1", resp.StatusCode, resp.Header.Get("Retry-After"))
	}
	select {
	case <-e.store.reads:
		t.Fatal("a rejected request read the database")
	default:
	}

	cancel()
	if r := <-first; !errors.Is(r.err, context.Canceled) {
		t.Fatalf("first request: %+v, want context.Canceled", r)
	}
	<-e.served
	if n := e.waiters.Len(); n != 0 {
		t.Fatalf("Len = %d after cancel, want 0", n)
	}
}

func TestClientCancelRemovesWaiter(t *testing.T) {
	e := start(t, 10, time.Minute)
	ctx, cancel := context.WithCancel(context.Background())
	res := e.wait(ctx, "seen=1")
	<-e.store.reads
	if n := e.waiters.Len(); n != 1 {
		t.Fatalf("Len = %d while waiting, want 1", n)
	}
	cancel()
	<-res
	<-e.served // the handler returned: no goroutine is left waiting
	if n := e.waiters.Len(); n != 0 || len(e.waiters.IDs()) != 0 {
		t.Fatalf("Len = %d, IDs = %v after the client left", n, e.waiters.IDs())
	}
}

func TestShortWriteTimeoutDropsResponse(t *testing.T) {
	store := newStore(map[string]State{"p1": {Version: 1}})
	mux := http.NewServeMux()
	(&Handler{Waiters: NewWaiters(10), Store: store, SoftTimeout: 200 * time.Millisecond, Log: slog.Default()}).Routes(mux)
	srv := httptest.NewUnstartedServer(mux)
	srv.Config.WriteTimeout = 20 * time.Millisecond // shorter than the soft timeout
	srv.Start()
	defer srv.Close()

	r := get(context.Background(), srv.URL+"/payments/p1/wait?seen=1")
	if r.err == nil {
		t.Fatalf("got %+v, want the server to drop the response", r)
	}
	t.Logf("client error: %v", r.err) // EOF: the connection closes without a response
}

func TestOneQueryForAllWaiters(t *testing.T) {
	w := NewWaiters(10)
	store := newStore(map[string]State{"a": {Version: 5}, "b": {Version: 1}})
	chA1, cancelA1, _ := w.Register("a", 4)
	chA2, cancelA2, _ := w.Register("a", 4)
	chB, cancelB, _ := w.Register("b", 1)
	defer cancelB()

	if err := Poll(context.Background(), w, store); err != nil {
		t.Fatal(err)
	}
	if len(store.calls) != 1 {
		t.Fatalf("store called %d times, want 1", len(store.calls))
	}
	if got := slices.Sorted(slices.Values(store.calls[0])); !slices.Equal(got, []string{"a", "b"}) {
		t.Fatalf("query ids = %v, want [a b]", got)
	}
	if (<-chA1).Version != 5 || (<-chA2).Version != 5 {
		t.Fatal("waiters of a not woken with version 5")
	}
	select {
	case st := <-chB:
		t.Fatalf("b woken with %+v, but its version did not change", st)
	default:
	}
	cancelA1() // already removed by Notify: a second removal is a no-op
	cancelA2()
	if n := w.Len(); n != 1 {
		t.Fatalf("Len = %d, want 1 (only b)", n)
	}
	if _, _, err := NewWaiters(0).Register("a", 0); !errors.Is(err, ErrTooManyWaiters) {
		t.Fatalf("Register over the limit: %v", err)
	}
}

func TestRunPollerWakesAndStops(t *testing.T) {
	w := NewWaiters(10)
	store := newStore(map[string]State{"a": {Version: 1}})
	store.reads = make(chan []string, 1)
	go func() { // RunPoller below may read many times: drain the signals
		for range store.reads {
		}
	}()
	ch, cancel, err := w.Register("a", 1)
	if err != nil {
		t.Fatal(err)
	}
	defer cancel()

	ctx, stop := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		RunPoller(ctx, w, store, time.Millisecond, slog.Default())
		close(done)
	}()
	store.set("a", State{Version: 2})
	if st := <-ch; st.Version != 2 {
		t.Fatalf("woken with %+v", st)
	}
	stop()
	<-done
	close(store.reads)
}
