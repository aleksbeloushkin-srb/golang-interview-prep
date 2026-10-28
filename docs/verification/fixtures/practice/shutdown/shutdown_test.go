package shutdown

import (
	"context"
	"errors"
	"io"
	"net"
	"net/http"
	"slices"
	"sync"
	"testing"
	"time"
)

// events is a goroutine-safe log of what happened, in order.
type events struct {
	mu   sync.Mutex
	list []string
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

func listen(t *testing.T) net.Listener {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	return ln
}

// start runs app in the background; the returned channel delivers Run's result.
func start(app *App, ctx context.Context, ln net.Listener) <-chan error {
	done := make(chan error, 1)
	go func() { done <- app.Run(ctx, ln) }()
	return done
}

// wait fails instead of hanging when Run does not return.
func wait(t *testing.T, done <-chan error) error {
	t.Helper()
	select {
	case err := <-done:
		return err
	case <-time.After(5 * time.Second):
		t.Fatal("Run did not return")
		return nil
	}
}

// waitRefused waits until the server stops accepting new connections:
// the sign that shutdown has begun.
func waitRefused(t *testing.T, addr string) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for {
		conn, err := net.Dial("tcp", addr)
		if err != nil {
			return
		}
		conn.Close()
		if time.Now().After(deadline) {
			t.Fatal("still accepting new connections after shutdown began")
		}
		time.Sleep(5 * time.Millisecond)
	}
}

func get(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	return string(b), err
}

func TestServesThenStops(t *testing.T) {
	var closes events
	app := &App{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "ok") }),
		Close:   func() error { closes.add("close"); return nil },
		Timeout: 2 * time.Second,
	}
	ln := listen(t)
	ctx, cancel := context.WithCancel(context.Background())
	done := start(app, ctx, ln)
	if body, err := get("http://" + ln.Addr().String()); err != nil || body != "ok" {
		t.Fatalf("GET = %q, %v; want ok", body, err)
	}
	cancel()
	if err := wait(t, done); err != nil {
		t.Fatalf("Run = %v, want nil", err)
	}
	if got := closes.all(); len(got) != 1 {
		t.Fatalf("Close called %d times, want once", len(got))
	}
}

// A request in flight finishes; new connections are refused meanwhile.
func TestInFlightRequestFinishes(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	app := &App{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			close(started)
			<-release
			io.WriteString(w, "done")
		}),
		Timeout: 3 * time.Second,
	}
	ln := listen(t)
	addr := ln.Addr().String()
	ctx, cancel := context.WithCancel(context.Background())
	done := start(app, ctx, ln)

	type reply struct {
		body string
		err  error
	}
	replies := make(chan reply, 1)
	go func() {
		body, err := get("http://" + addr)
		replies <- reply{body, err}
	}()
	<-started
	cancel()
	waitRefused(t, addr)
	select {
	case err := <-done:
		t.Fatalf("Run returned %v while a request was still in flight", err)
	default:
	}

	close(release)
	if r := <-replies; r.err != nil || r.body != "done" {
		t.Fatalf("in-flight request got %q, %v; want done", r.body, r.err)
	}
	if err := wait(t, done); err != nil {
		t.Fatalf("Run = %v, want nil", err)
	}
}

// Order: the request finishes, the worker still takes its job, then the
// worker stops, and the dependency closes last.
func TestShutdownOrder(t *testing.T) {
	var log events
	jobs := make(chan string)
	started, release := make(chan struct{}), make(chan struct{})
	app := &App{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			close(started)
			<-release
			jobs <- "job from request" // a worker must still be there to take it
			log.add("request done")
		}),
		Workers: []func(context.Context){func(ctx context.Context) {
			for {
				select {
				case <-ctx.Done():
					log.add("worker stopped")
					return
				case j := <-jobs:
					log.add("worker did " + j)
				}
			}
		}},
		Close:   func() error { log.add("dependency closed"); return nil },
		Timeout: 3 * time.Second,
	}
	ln := listen(t)
	ctx, cancel := context.WithCancel(context.Background())
	done := start(app, ctx, ln)
	go get("http://" + ln.Addr().String())
	<-started
	cancel()
	waitRefused(t, ln.Addr().String()) // shutdown has begun; the request is still in flight
	close(release)
	if err := wait(t, done); err != nil {
		t.Fatalf("Run = %v, want nil", err)
	}
	got := log.all()
	idx := func(s string) int { return slices.Index(got, s) }
	if idx("worker did job from request") < 0 {
		t.Fatalf("the job from the in-flight request was lost: %v", got)
	}
	if idx("worker stopped") < idx("worker did job from request") {
		t.Fatalf("worker stopped before taking the job: %v", got)
	}
	if got[len(got)-1] != "dependency closed" || idx("dependency closed") != len(got)-1 {
		t.Fatalf("dependency must close last and once: %v", got)
	}
}

// A request that never finishes: Run gives up after Timeout, reports it,
// and still closes the dependency.
func TestTimeout(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	t.Cleanup(func() { close(release) })
	var log events
	app := &App{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			close(started)
			<-release
		}),
		Close:   func() error { log.add("dependency closed"); return nil },
		Timeout: 100 * time.Millisecond,
	}
	ln := listen(t)
	ctx, cancel := context.WithCancel(context.Background())
	done := start(app, ctx, ln)
	go get("http://" + ln.Addr().String())
	<-started
	began := time.Now()
	cancel()
	err := wait(t, done)
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("Run = %v, want an error that wraps context.DeadlineExceeded", err)
	}
	if took := time.Since(began); took > 2*time.Second {
		t.Fatalf("Run took %v with a 100ms timeout", took)
	}
	if got := log.all(); !slices.Equal(got, []string{"dependency closed"}) {
		t.Fatalf("dependency not closed after a timeout: %v", got)
	}
}

// A worker that ignores cancellation also counts against the timeout.
func TestStuckWorker(t *testing.T) {
	release := make(chan struct{})
	t.Cleanup(func() { close(release) })
	app := &App{
		Handler: http.NotFoundHandler(),
		Workers: []func(context.Context){func(context.Context) { <-release }},
		Timeout: 100 * time.Millisecond,
	}
	ctx, cancel := context.WithCancel(context.Background())
	done := start(app, ctx, listen(t))
	cancel()
	if err := wait(t, done); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("Run = %v, want an error that wraps context.DeadlineExceeded", err)
	}
}

// If serving fails, Run reports it and still cleans up.
func TestServeError(t *testing.T) {
	ln := listen(t)
	ln.Close() // Serve fails at once
	var log events
	app := &App{
		Handler: http.NotFoundHandler(),
		Close:   func() error { log.add("dependency closed"); return nil },
		Timeout: time.Second,
	}
	err := wait(t, start(app, context.Background(), ln))
	if err == nil {
		t.Fatal("Run = nil, want the Serve error")
	}
	if got := log.all(); len(got) != 1 {
		t.Fatalf("dependency closed %d times, want once", len(got))
	}
}
