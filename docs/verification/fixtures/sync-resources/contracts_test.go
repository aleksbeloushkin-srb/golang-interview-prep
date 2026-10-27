package syncresources

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"sync"
	"sync/atomic"
	"testing"
	"testing/synctest"
	"time"

	audit "example.com/go-prep/syncresources/q10"
	batch "example.com/go-prep/syncresources/q12"
	checkout "example.com/go-prep/syncresources/q16"
	badaudit "example.com/go-prep/syncresources/testdata/q10"
	badcheckout "example.com/go-prep/syncresources/testdata/q16"
)

func receive[T any](t *testing.T, ch <-chan T) T {
	t.Helper()
	select {
	case value := <-ch:
		return value
	case <-time.After(5 * time.Second):
		t.Fatal("test synchronization timed out")
		var zero T
		return zero
	}
}

func TestRequestContextAfterHandlerReturns(t *testing.T) {
	observed := make(chan error, 1)
	reported := make(chan error, 1)
	srv := httptest.NewServer(badaudit.Handler(func(ctx context.Context) error {
		<-ctx.Done()
		observed <- ctx.Err()
		return ctx.Err()
	}, func(err error) { reported <- err }))
	defer srv.Close()
	client := srv.Client()
	client.Timeout = 5 * time.Second
	resp, err := client.Get(srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusAccepted {
		t.Fatal(resp.StatusCode)
	}
	if !errors.Is(receive(t, observed), context.Canceled) || !errors.Is(receive(t, reported), context.Canceled) {
		t.Fatal("missing server cancellation")
	}
}

func TestSynchronousAuditPolicy(t *testing.T) {
	for _, fail := range []bool{false, true} {
		t.Run(map[bool]string{false: "success", true: "send failure"}[fail], func(t *testing.T) {
			sentinel := errors.New("delivery failed")
			var called atomic.Bool
			srv := httptest.NewServer(audit.Handler(func(ctx context.Context) error {
				if err := ctx.Err(); err != nil {
					return err
				}
				called.Store(true)
				if fail {
					return sentinel
				}
				return nil
			}))
			defer srv.Close()
			client := srv.Client()
			client.Timeout = 5 * time.Second
			resp, err := client.Get(srv.URL)
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			_, err = io.Copy(io.Discard, resp.Body)
			if err != nil {
				t.Fatal(err)
			}
			want := http.StatusNoContent
			if fail {
				want = http.StatusInternalServerError
			}
			if !called.Load() || resp.StatusCode != want {
				t.Fatalf("called=%v status=%d", called.Load(), resp.StatusCode)
			}
		})
	}
}

func TestIndexedResults(t *testing.T) {
	for _, items := range [][]int{nil, {}, {2, 3, 5}, make([]int, 128)} {
		got := batch.ProcessBatch(items)
		want := make([]int, len(items))
		for i, v := range items {
			want[i] = v * 2
		}
		if !reflect.DeepEqual(got, want) {
			t.Fatalf("got %v want %v", got, want)
		}
	}
}

func TestErrgroupContextBoundaries(t *testing.T) {
	ok := func(context.Context) error { return nil }
	parent := context.Background()
	err := badcheckout.Process(parent, ok, ok, func(ctx context.Context) error { return ctx.Err() })
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("bad example: %v", err)
	}
	called := false
	err = checkout.Process(parent, ok, ok, func(ctx context.Context) error { called = true; return ctx.Err() })
	if err != nil || !called {
		t.Fatalf("fixed: %v called=%v", err, called)
	}
	sentinel := errors.New("check failed")
	joined := make(chan struct{})
	called = false
	err = checkout.Process(parent, func(context.Context) error { return sentinel }, func(ctx context.Context) error { <-ctx.Done(); close(joined); return ctx.Err() }, func(context.Context) error { called = true; return nil })
	if !errors.Is(err, sentinel) || called {
		t.Fatalf("failure: %v save=%v", err, called)
	}
	receive(t, joined)
	canceled, cancel := context.WithCancel(parent)
	cancel()
	err = checkout.Process(canceled, ok, ok, func(ctx context.Context) error { return ctx.Err() })
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("parent cancellation: %v", err)
	}
}

func TestOncePublicationAndNoRetryAfterPanic(t *testing.T) {
	var once sync.Once
	var wg sync.WaitGroup
	var initCount atomic.Int32
	var value int
	results := make([]int, 64)
	for i := range results {
		wg.Go(func() { once.Do(func() { initCount.Add(1); value = 42 }); results[i] = value })
	}
	wg.Wait()
	if initCount.Load() != 1 {
		t.Fatal(initCount.Load())
	}
	for _, v := range results {
		if v != 42 {
			t.Fatal(v)
		}
	}
	var failed sync.Once
	calls := 0
	func() {
		defer func() {
			if recover() == nil {
				t.Error("expected panic")
			}
		}()
		failed.Do(func() { calls++; panic("init") })
	}()
	failed.Do(func() { calls++ })
	if calls != 1 {
		t.Fatal("Once retried failed initialization")
	}
}

func TestWithoutCancelAndExplicitTimeout(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		type key struct{}
		parent, cancel := context.WithTimeout(context.WithValue(context.Background(), key{}, "trace"), 5*time.Second)
		defer cancel()
		detached := context.WithoutCancel(parent)
		if _, ok := detached.Deadline(); ok || detached.Done() != nil {
			t.Fatal("inherited lifetime")
		}
		bounded, stop := context.WithTimeout(detached, time.Second)
		defer stop()
		cancel()
		if bounded.Err() != nil || detached.Err() != nil || context.Cause(detached) != nil || detached.Value(key{}) != "trace" {
			t.Fatal("unexpected detached contract")
		}
		time.Sleep(time.Second)
		synctest.Wait()
		if !errors.Is(bounded.Err(), context.DeadlineExceeded) {
			t.Fatal(bounded.Err())
		}
	})
}
