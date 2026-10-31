// Command service shows the order in which a whole Go service stops:
// not ready → drain HTTP → stop the worker → close resources in reverse → exit code.
package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"

	"golang.org/x/sync/errgroup"
)

// Service is what run serves and owns.
type Service struct {
	Handler http.Handler                    // business routes; run adds GET /readyz
	Work    func(ctx context.Context) error // one round of the background worker
	Tick    time.Duration                   // how often Work runs
	// Resources in the order main opened them: telemetry, the DB pool, clients.
	// run closes them in reverse, so logs and traces are flushed last.
	Resources  []io.Closer
	DrainDelay time.Duration // time for load balancers to stop sending requests
	Timeout    time.Duration // budget for requests in flight
	Log        *slog.Logger
}

// run serves until ctx is done or a part fails, then stops in order.
// Its error decides the exit code.
func run(ctx context.Context, ln net.Listener, s Service) error {
	var ready atomic.Bool
	ready.Store(true)
	mux := http.NewServeMux()
	mux.Handle("/", s.Handler)
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		if !ready.Load() {
			http.Error(w, "shutting down", http.StatusServiceUnavailable)
			return
		}
		io.WriteString(w, "ok")
	})
	// No BaseContext: requests get context.Background, so SIGTERM does not cancel them.
	// Server timeouts (c45) stay below Timeout, so a slow client cannot hold the drain.
	srv := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
	}

	// The worker stops after HTTP has drained: a request in flight may still need it.
	workCtx, stopWork := context.WithCancel(context.WithoutCancel(ctx))
	defer stopWork()

	g, gctx := errgroup.WithContext(ctx)
	g.Go(func() error {
		if err := srv.Serve(ln); !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("serve: %w", err)
		}
		return nil
	})
	g.Go(func() error {
		t := time.NewTicker(s.Tick)
		defer t.Stop()
		for {
			select {
			case <-workCtx.Done():
				s.Log.Info("worker stopped")
				return nil
			case <-t.C:
				if err := s.Work(workCtx); err != nil && workCtx.Err() == nil {
					return fmt.Errorf("worker: %w", err)
				}
			}
		}
	})
	g.Go(func() error {
		<-gctx.Done() // a signal, or another member of the group failed
		defer stopWork()
		ready.Store(false)
		s.Log.Info("not ready", "cause", context.Cause(gctx))
		time.Sleep(s.DrainDelay) // a pause for load balancers, not a way to wait for our goroutines

		sctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), s.Timeout)
		defer cancel()
		if err := srv.Shutdown(sctx); err != nil {
			srv.Close() // out of time: drop the connections that are left
			return fmt.Errorf("http shutdown: %w", err)
		}
		s.Log.Info("http drained")
		return nil
	})

	errs := []error{g.Wait()} // every member has returned: nothing uses the resources now
	for i := len(s.Resources) - 1; i >= 0; i-- {
		errs = append(errs, s.Resources[i].Close())
	}
	return errors.Join(errs...)
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	go func() {
		<-ctx.Done()
		stop() // restore the default handling: a second signal kills the process
	}()
	log := slog.New(slog.NewJSONHandler(os.Stderr, nil))
	ln, err := net.Listen("tcp", ":8080")
	if err == nil {
		log.Info("listening", "addr", ln.Addr().String())
		err = run(ctx, ln, Service{
			Handler: http.NotFoundHandler(),                     // the real routes
			Work:    func(context.Context) error { return nil }, // e.g. one outbox relay round
			Tick:    time.Second,
			// Resources: the trace exporter, the DB pool and clients, in the order main opened them.
			DrainDelay: 5 * time.Second,
			Timeout:    20 * time.Second, // 5 s + 20 s fit into the default 30 s grace period
			Log:        log,
		})
	}
	stop()
	if err != nil {
		log.Error("service stopped", "err", err)
		os.Exit(1) // the platform and alerts must see a failure, not a clean stop
	}
}
