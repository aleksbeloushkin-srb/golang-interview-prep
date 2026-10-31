package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"slices"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// events records, in order, what the service logged and which resources closed.
// It is the slog handler of the service under test.
type events struct {
	mu       sync.Mutex
	list     []string
	notReady func() // runs synchronously when the service logs "not ready"
}

func (e *events) add(s string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.list = append(e.list, s)
}

func (e *events) all() []string {
	e.mu.Lock()
	defer e.mu.Unlock()
	return slices.Clone(e.list)
}

func (e *events) Enabled(context.Context, slog.Level) bool { return true }
func (e *events) WithAttrs([]slog.Attr) slog.Handler       { return e }
func (e *events) WithGroup(string) slog.Handler            { return e }
func (e *events) Handle(_ context.Context, r slog.Record) error {
	e.add(r.Message)
	if r.Message == "not ready" && e.notReady != nil {
		e.notReady()
	}
	return nil
}

// resource stands in for a trace exporter, a DB pool or a client.
type resource struct {
	name   string
	log    *events
	closed atomic.Bool
}

func (r *resource) Use() error {
	if r.closed.Load() {
		return fmt.Errorf("%s is closed", r.name)
	}
	return nil
}

func (r *resource) Close() error {
	r.closed.Store(true)
	r.log.add("closed " + r.name)
	return nil
}

// signalListener reports the moment the server closes it: Shutdown has begun.
type signalListener struct {
	net.Listener
	once   sync.Once
	closed chan struct{}
}

func (l *signalListener) Close() error {
	err := l.Listener.Close()
	l.once.Do(func() { close(l.closed) })
	return err
}

func listen(t *testing.T) *signalListener {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	return &signalListener{Listener: ln, closed: make(chan struct{})}
}

var client = &http.Client{Transport: &http.Transport{DisableKeepAlives: true}}

func get(url string) (int, string, error) {
	resp, err := client.Get(url)
	if err != nil {
		return 0, "", err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	return resp.StatusCode, string(b), err
}

func start(ctx context.Context, ln net.Listener, s Service) <-chan error {
	done := make(chan error, 1)
	go func() { done <- run(ctx, ln, s) }()
	return done
}

func wait(t *testing.T, done <-chan error) error {
	t.Helper()
	select {
	case err := <-done:
		return err
	case <-time.After(5 * time.Second):
		t.Fatal("run did not return")
		return nil
	}
}

func newResources(log *events) (tel, pool, cli *resource) {
	return &resource{name: "telemetry", log: log}, &resource{name: "pool", log: log}, &resource{name: "client", log: log}
}

// A request in flight at SIGTERM finishes with the pool still open; the worker
// stops after HTTP and before the pool closes; resources close in reverse.
func TestShutdownOrder(t *testing.T) {
	log := &events{}
	tel, pool, cli := newResources(log)
	started, release := make(chan struct{}), make(chan struct{})
	mux := http.NewServeMux()
	mux.HandleFunc("GET /slow", func(w http.ResponseWriter, r *http.Request) {
		close(started)
		<-release
		if err := pool.Use(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.WriteString(w, "done")
	})
	ln := listen(t)
	base := "http://" + ln.Addr().String()
	readyDuringStop := 0
	log.notReady = func() { readyDuringStop, _, _ = get(base + "/readyz") }

	ctx, cancel := context.WithCancel(context.Background()) // cancel plays SIGTERM
	defer cancel()
	done := start(ctx, ln, Service{
		Handler:    mux,
		Work:       func(context.Context) error { return pool.Use() },
		Tick:       time.Millisecond,
		Resources:  []io.Closer{tel, pool, cli},
		DrainDelay: time.Millisecond,
		Timeout:    5 * time.Second,
		Log:        slog.New(log),
	})
	if code, _, err := get(base + "/readyz"); err != nil || code != http.StatusOK {
		t.Fatalf("readyz before stop = %d, %v; want 200", code, err)
	}

	type reply struct {
		code int
		body string
		err  error
	}
	replies := make(chan reply, 1)
	go func() {
		code, body, err := get(base + "/slow")
		replies <- reply{code, body, err}
	}()
	<-started
	cancel()
	<-ln.closed // Shutdown has begun and the request is still in flight
	if conn, err := net.Dial("tcp", ln.Addr().String()); err == nil {
		conn.Close()
		t.Fatal("new connections are still accepted after Shutdown began")
	}
	close(release)

	if r := <-replies; r.err != nil || r.code != http.StatusOK || r.body != "done" {
		t.Fatalf("request in flight got %d %q, %v; want 200 done", r.code, r.body, r.err)
	}
	if err := wait(t, done); err != nil {
		t.Fatalf("run = %v, want nil", err)
	}
	if readyDuringStop != http.StatusServiceUnavailable {
		t.Fatalf("readyz during stop = %d, want 503", readyDuringStop)
	}
	want := []string{"not ready", "http drained", "worker stopped", "closed client", "closed pool", "closed telemetry"}
	if got := log.all(); !slices.Equal(got, want) {
		t.Fatalf("events = %q\nwant      %q", got, want)
	}
}

// A failed worker stops the whole service, and run reports it for the exit code.
func TestWorkerFailureStopsService(t *testing.T) {
	log := &events{}
	tel, pool, cli := newResources(log)
	errLost := errors.New("connection lost")
	ln := listen(t)
	done := start(context.Background(), ln, Service{
		Handler:   http.NotFoundHandler(),
		Work:      func(context.Context) error { return errLost },
		Tick:      time.Millisecond,
		Resources: []io.Closer{tel, pool, cli},
		Timeout:   5 * time.Second,
		Log:       slog.New(log),
	})
	err := wait(t, done)
	if !errors.Is(err, errLost) {
		t.Fatalf("run = %v, want the worker error", err)
	}
	if conn, err := net.Dial("tcp", ln.Addr().String()); err == nil {
		conn.Close()
		t.Fatal("the server still accepts connections after run returned")
	}
	want := []string{"not ready", "http drained", "closed client", "closed pool", "closed telemetry"}
	if got := log.all(); !slices.Equal(got, want) {
		t.Fatalf("events = %q\nwant      %q", got, want)
	}
}

// A request that never finishes: run gives up after Timeout, still stops the
// worker and closes everything, and reports the deadline.
func TestDrainTimeout(t *testing.T) {
	log := &events{}
	tel, pool, cli := newResources(log)
	started, release := make(chan struct{}), make(chan struct{})
	t.Cleanup(func() { close(release) })
	mux := http.NewServeMux()
	mux.HandleFunc("GET /stuck", func(w http.ResponseWriter, r *http.Request) {
		close(started)
		<-release
	})
	ln := listen(t)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	done := start(ctx, ln, Service{
		Handler:   mux,
		Work:      func(context.Context) error { return pool.Use() },
		Tick:      time.Millisecond,
		Resources: []io.Closer{tel, pool, cli},
		Timeout:   50 * time.Millisecond,
		Log:       slog.New(log),
	})
	go get("http://" + ln.Addr().String() + "/stuck")
	<-started
	cancel()
	if err := wait(t, done); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("run = %v, want an error that wraps context.DeadlineExceeded", err)
	}
	want := []string{"not ready", "worker stopped", "closed client", "closed pool", "closed telemetry"}
	if got := log.all(); !slices.Equal(got, want) {
		t.Fatalf("events = %q\nwant      %q", got, want)
	}
}

// The mistake run avoids: Shutdown with the already cancelled signal context
// returns at once and does not wait for the request in flight.
func TestShutdownWithCancelledContextDoesNotWait(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	t.Cleanup(func() { close(release) })
	srv := &http.Server{Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		close(started)
		<-release
	})}
	ln := listen(t)
	go srv.Serve(ln)
	t.Cleanup(func() { srv.Close() })
	go get("http://" + ln.Addr().String())
	<-started

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // like the context from signal.NotifyContext after SIGTERM
	res := make(chan error, 1)
	go func() { res <- srv.Shutdown(ctx) }()
	select {
	case err := <-res: // returned while the handler is still blocked
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("Shutdown = %v, want context.Canceled", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("Shutdown waited for the request in flight")
	}
}
