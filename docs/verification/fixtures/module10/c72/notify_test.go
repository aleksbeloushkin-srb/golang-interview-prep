//go:build unix

package ctxsvc

import (
	"context"
	"errors"
	"os/signal"
	"syscall"
	"testing"
)

// signalCause cancels a NotifyContext with SIGUSR1 and returns Err and Cause.
func signalCause(t *testing.T) (error, error) {
	t.Helper()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGUSR1)
	defer stop()
	if err := syscall.Kill(syscall.Getpid(), syscall.SIGUSR1); err != nil {
		t.Fatal(err)
	}
	<-ctx.Done()
	return ctx.Err(), context.Cause(ctx)
}

func TestNotifyContextErrIsCanceled(t *testing.T) {
	if err, _ := signalCause(t); !errors.Is(err, context.Canceled) {
		t.Fatalf("Err() = %v, want context.Canceled on every version", err)
	}
}
