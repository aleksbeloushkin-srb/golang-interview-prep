package cache

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestConcurrentMissesLoadOnce(t *testing.T) {
	const callers = 50
	var calls atomic.Int32
	var ready sync.WaitGroup
	ready.Add(callers)
	c := New(func(ctx context.Context, key string) (int64, error) {
		calls.Add(1)
		ready.Wait() // keep the load running until every caller has started
		return 4200, nil
	}, time.Minute)

	var wg sync.WaitGroup
	wg.Add(callers)
	errs := make(chan error, callers)
	for range callers {
		go func() {
			defer wg.Done()
			ready.Done()
			v, err := c.Get(context.Background(), "fee:EUR")
			if err == nil && v != 4200 {
				err = errors.New("wrong value")
			}
			errs <- err
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		if err != nil {
			t.Fatal(err)
		}
	}
	if n := calls.Load(); n != 1 {
		t.Fatalf("load called %d times for %d concurrent callers, want 1", n, callers)
	}
	if _, err := c.Get(context.Background(), "fee:EUR"); err != nil || calls.Load() != 1 {
		t.Fatalf("second Get: err %v, loads %d; want a cache hit", err, calls.Load())
	}
}

func TestLoadErrorIsNotCached(t *testing.T) {
	errDown := errors.New("database is down")
	var calls atomic.Int32
	c := New(func(ctx context.Context, key string) (int64, error) {
		if calls.Add(1) == 1 {
			return 0, errDown
		}
		return 150, nil
	}, time.Minute)

	if _, err := c.Get(context.Background(), "fee:RSD"); !errors.Is(err, errDown) {
		t.Fatalf("first Get: err %v, want errDown", err)
	}
	v, err := c.Get(context.Background(), "fee:RSD")
	if err != nil || v != 150 || calls.Load() != 2 {
		t.Fatalf("second Get: %d, %v after %d loads; want 150, nil after 2", v, err, calls.Load())
	}
}

func TestCallerLeavesLoadGoesOn(t *testing.T) {
	started := make(chan struct{})
	release := make(chan struct{})
	var calls atomic.Int32
	c := New(func(ctx context.Context, key string) (int64, error) {
		calls.Add(1)
		close(started)
		<-release
		if err := ctx.Err(); err != nil {
			return 0, err // the first caller's cancel reached the shared load
		}
		return 99, nil
	}, time.Minute)

	ctx, cancel := context.WithCancel(context.Background())
	left := make(chan error, 1)
	go func() {
		_, err := c.Get(ctx, "fee:USD")
		left <- err
	}()
	<-started
	cancel()
	if err := <-left; !errors.Is(err, context.Canceled) {
		t.Fatalf("cancelled caller: err %v, want context.Canceled", err)
	}

	close(release)
	v, err := c.Get(context.Background(), "fee:USD") // joins the running load or hits the cache
	if err != nil || v != 99 || calls.Load() != 1 {
		t.Fatalf("next caller: %d, %v after %d loads; want 99, nil after 1", v, err, calls.Load())
	}
}
