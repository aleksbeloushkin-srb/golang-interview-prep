// Package shutdown is the reference solution for practice task W4-3:
// graceful shutdown of an HTTP server with background workers and a dependency.
package shutdown

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

// App is an HTTP service with background workers and one dependency, such as
// a database, that the handlers and workers use.
type App struct {
	Handler http.Handler
	// Workers run until their context is done; each finishes its current job first.
	Workers []func(ctx context.Context)
	// Close releases the dependency. Run calls it once, last.
	Close func() error
	// Timeout is the budget for the whole shutdown.
	Timeout time.Duration
}

// Run serves HTTP on ln until ctx is done, then shuts down in order:
//  1. stop accepting connections and let in-flight requests finish;
//  2. only then stop the workers, because a request may still hand them work,
//     and wait for them;
//  3. close the dependency last.
//
// In main, ctx comes from signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM).
func (a *App) Run(ctx context.Context, ln net.Listener) error {
	srv := &http.Server{Handler: a.Handler, ReadHeaderTimeout: 5 * time.Second}

	// Workers must outlive ctx until the HTTP side has drained, so their context
	// keeps ctx's values but not its cancellation (Go 1.21+).
	workCtx, stopWorkers := context.WithCancel(context.WithoutCancel(ctx))
	defer stopWorkers()
	var wg sync.WaitGroup
	for _, work := range a.Workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			work(workCtx)
		}()
	}

	serveErr := make(chan error, 1)
	go func() { serveErr <- srv.Serve(ln) }()

	var errs []error
	served := false
	select {
	case <-ctx.Done():
	case err := <-serveErr: // Serve failed before anyone asked to stop
		served = true
		errs = append(errs, fmt.Errorf("serve: %w", err))
	}

	sctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), a.Timeout)
	defer cancel()

	// 1. Close the listener, then wait for in-flight requests to finish.
	if err := srv.Shutdown(sctx); err != nil {
		srv.Close() // out of time: drop the remaining connections
		errs = append(errs, fmt.Errorf("http shutdown: %w", err))
	}
	if !served {
		// Serve returns ErrServerClosed as soon as Shutdown closes the listener.
		if err := <-serveErr; !errors.Is(err, http.ErrServerClosed) {
			errs = append(errs, fmt.Errorf("serve: %w", err))
		}
	}

	// 2. No handler can hand out work any more: stop the workers and wait for them.
	stopWorkers()
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-sctx.Done():
		errs = append(errs, fmt.Errorf("workers: %w", sctx.Err()))
	}

	// 3. The dependency goes last, even after a timeout: the process is exiting.
	if a.Close != nil {
		if err := a.Close(); err != nil {
			errs = append(errs, fmt.Errorf("close: %w", err))
		}
	}
	return errors.Join(errs...)
}
