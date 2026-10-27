package admission

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
)

func TestBoundAndCompletion(t *testing.T) {
	limit := make(Limit, 2)
	started := make(chan struct{}, 20)
	release := make(chan struct{})
	errs := make(chan error, 20)
	var active int32
	var exceeded int32
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			errs <- limit.Do(context.Background(), func(context.Context) error {
				if atomic.AddInt32(&active, 1) > 2 {
					atomic.StoreInt32(&exceeded, 1)
				}
				started <- struct{}{}
				<-release
				atomic.AddInt32(&active, -1)
				return nil
			})
		}()
	}
	<-started
	<-started
	close(release)
	wg.Wait()
	close(errs)
	for err := range errs {
		if err != nil {
			t.Fatal(err)
		}
	}
	if exceeded != 0 || active != 0 || len(limit) != 0 {
		t.Fatalf("exceeded=%d active=%d retained slots=%d", exceeded, active, len(limit))
	}
}

func TestCancelWhileCapacityIsOccupied(t *testing.T) {
	limit := make(Limit, 1)
	entered := make(chan struct{})
	release := make(chan struct{})
	ownerDone := make(chan error, 1)
	go func() {
		ownerDone <- limit.Do(context.Background(), func(context.Context) error {
			close(entered)
			<-release
			return nil
		})
	}()
	<-entered
	ctx, cancel := context.WithCancel(context.Background())
	waiterDone := make(chan error, 1)
	var called int32
	go func() {
		waiterDone <- limit.Do(ctx, func(context.Context) error {
			atomic.StoreInt32(&called, 1)
			return nil
		})
	}()
	cancel()
	err := <-waiterDone
	close(release)
	ownerErr := <-ownerDone
	if !errors.Is(err, context.Canceled) || called != 0 || ownerErr != nil || len(limit) != 0 {
		t.Fatalf("waiter=%v called=%d owner=%v slots=%d", err, called, ownerErr, len(limit))
	}
}

func TestReleaseOnErrorAndPanic(t *testing.T) {
	limit := make(Limit, 1)
	want := errors.New("operation failed")
	if err := limit.Do(context.Background(), func(context.Context) error { return want }); !errors.Is(err, want) {
		t.Fatal(err)
	}
	func() {
		defer func() {
			if got := recover(); got != "failure" {
				t.Errorf("panic=%v", got)
			}
		}()
		_ = limit.Do(context.Background(), func(context.Context) error { panic("failure") })
	}()
	if len(limit) != 0 {
		t.Fatal("slot retained after failure")
	}
	if err := limit.Do(context.Background(), func(context.Context) error { return nil }); err != nil {
		t.Fatal(err)
	}
}

func TestStartedWorkObservesCancellation(t *testing.T) {
	limit := make(Limit, 1)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	entered := make(chan struct{})
	done := make(chan error, 1)
	go func() {
		done <- limit.Do(ctx, func(ctx context.Context) error {
			close(entered)
			<-ctx.Done()
			return ctx.Err()
		})
	}()
	<-entered
	cancel()
	if err := <-done; !errors.Is(err, context.Canceled) || len(limit) != 0 {
		t.Fatalf("err=%v slots=%d", err, len(limit))
	}
}
