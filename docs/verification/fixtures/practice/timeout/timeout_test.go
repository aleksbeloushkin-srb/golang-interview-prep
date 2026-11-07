package timeout

import (
	"context"
	"errors"
	"runtime"
	"testing"
	"time"
)

func waitUntil(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for: %s", what)
		}
		time.Sleep(time.Millisecond)
	}
}

// callWithin runs Call and fails the test if it does not return within 2 s:
// a Call that waits for f instead of the deadline would otherwise hang.
func callWithin(t *testing.T, ctx context.Context, d time.Duration, f func(context.Context) (int, error)) (int, error) {
	t.Helper()
	type result struct {
		v   int
		err error
	}
	done := make(chan result, 1)
	go func() {
		v, err := Call(ctx, d, f)
		done <- result{v, err}
	}()
	select {
	case r := <-done:
		return r.v, r.err
	case <-time.After(2 * time.Second):
		t.Fatal("Call is still waiting after 2 s: it must return at the deadline or when ctx is done, not wait for f")
		return 0, nil
	}
}

func TestResult(t *testing.T) {
	v, err := Call(context.Background(), time.Second, func(context.Context) (int, error) { return 7, nil })
	if v != 7 || err != nil {
		t.Fatalf("got %d, %v; want 7, nil", v, err)
	}
}

func TestError(t *testing.T) {
	boom := errors.New("boom")
	_, err := Call(context.Background(), time.Second, func(context.Context) (int, error) { return 0, boom })
	if !errors.Is(err, boom) {
		t.Fatalf("got %v, want %v", err, boom)
	}
}

// f ignores its context: Call must stop waiting at the deadline anyway.
func TestTimeout(t *testing.T) {
	release := make(chan struct{})
	defer close(release)
	v, err := callWithin(t, context.Background(), 20*time.Millisecond, func(context.Context) (int, error) {
		<-release
		return 7, nil
	})
	if !errors.Is(err, context.DeadlineExceeded) || v != 0 {
		t.Fatalf("got %d, %v; want 0, context.DeadlineExceeded", v, err)
	}
}

// A late f still finishes after Call has returned. Its goroutine must be able
// to deliver the result and exit; with an unbuffered result channel it would
// block forever.
func TestNoLeakWhenFIsLate(t *testing.T) {
	before := runtime.NumGoroutine()
	release := make(chan struct{})
	finished := make(chan struct{})
	_, err := Call(context.Background(), 10*time.Millisecond, func(context.Context) (int, error) {
		defer close(finished)
		<-release
		return 7, nil
	})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("got %v, want context.DeadlineExceeded", err)
	}
	close(release)
	<-finished
	waitUntil(t, "the goroutine running f to exit", func() bool { return runtime.NumGoroutine() <= before })
}

func TestContextHasDeadline(t *testing.T) {
	_, err := Call(context.Background(), time.Minute, func(ctx context.Context) (int, error) {
		deadline, ok := ctx.Deadline()
		if !ok || time.Until(deadline) > time.Minute {
			t.Errorf("f got deadline %v, %v; want one within a minute", deadline, ok)
		}
		return 0, nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

// Call must cancel f's context when it returns, after success too:
// otherwise the timer and anything started with that context live on.
func TestContextCancelledOnReturn(t *testing.T) {
	var got context.Context
	if _, err := Call(context.Background(), time.Minute, func(ctx context.Context) (int, error) {
		got = ctx
		return 1, nil
	}); err != nil {
		t.Fatal(err)
	}
	if got.Err() == nil {
		t.Fatal("f's context is still live after Call returned")
	}
}

func TestCooperativeFStops(t *testing.T) {
	stopped := make(chan error, 1)
	_, err := Call(context.Background(), 10*time.Millisecond, func(ctx context.Context) (int, error) {
		<-ctx.Done()
		stopped <- ctx.Err()
		return 0, ctx.Err()
	})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("got %v, want context.DeadlineExceeded", err)
	}
	select {
	case cause := <-stopped:
		if !errors.Is(cause, context.DeadlineExceeded) {
			t.Fatalf("f saw %v, want context.DeadlineExceeded", cause)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("f was not told to stop")
	}
}

func TestParentCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	release := make(chan struct{})
	defer close(release)
	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
	}()
	_, err := callWithin(t, ctx, time.Hour, func(context.Context) (int, error) {
		<-release
		return 7, nil
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("got %v, want context.Canceled", err)
	}
}
