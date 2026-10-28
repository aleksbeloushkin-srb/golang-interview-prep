package parallelfetch

import (
	"context"
	"errors"
	"slices"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

var errBoom = errors.New("boom")

func TestAllSucceedInOrder(t *testing.T) {
	urls := []string{"a", "b", "c", "d", "e"}
	got, err := Fetch(context.Background(), urls, 2, func(_ context.Context, u string) (string, error) {
		return strings.ToUpper(u), nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if want := []string{"A", "B", "C", "D", "E"}; !slices.Equal(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestEmpty(t *testing.T) {
	got, err := Fetch(context.Background(), nil, 3, func(context.Context, string) (string, error) {
		t.Fatal("fetch must not be called")
		return "", nil
	})
	if err != nil || len(got) != 0 {
		t.Fatalf("got %v, %v; want empty, nil", got, err)
	}
}

func TestLimit(t *testing.T) {
	const limit = 3
	var active, peak atomic.Int32
	_, err := Fetch(context.Background(), make([]string, 30), limit, func(context.Context, string) (string, error) {
		cur := active.Add(1)
		for p := peak.Load(); cur > p && !peak.CompareAndSwap(p, cur); p = peak.Load() {
		}
		time.Sleep(time.Millisecond) // keep calls overlapping
		active.Add(-1)
		return "", nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if p := peak.Load(); p > limit {
		t.Fatalf("peak concurrency %d, want at most %d", p, limit)
	}
}

func TestFirstErrorCancelsOthersAndWaitsForThem(t *testing.T) {
	var active atomic.Int32
	urls := []string{"slow1", "slow2", "bad", "slow3"}
	done := make(chan struct{})
	var got []string
	var err error
	go func() {
		defer close(done)
		got, err = Fetch(context.Background(), urls, 4, func(ctx context.Context, u string) (string, error) {
			active.Add(1)
			defer active.Add(-1)
			if u == "bad" {
				return "", errBoom
			}
			<-ctx.Done() // a well-behaved call stops when its context is cancelled
			return "", ctx.Err()
		})
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("Fetch did not return: the error did not cancel the other calls")
	}
	if !errors.Is(err, errBoom) || got != nil {
		t.Fatalf("got %v, %v; want nil and an error wrapping errBoom", got, err)
	}
	if a := active.Load(); a != 0 {
		t.Fatalf("%d calls still running after Fetch returned", a)
	}
}

func TestNoNewCallsAfterError(t *testing.T) {
	var calls atomic.Int32
	urls := []string{"bad", "a", "b", "c", "d"}
	_, err := Fetch(context.Background(), urls, 1, func(_ context.Context, u string) (string, error) {
		calls.Add(1)
		if u == "bad" {
			return "", errBoom
		}
		return u, nil
	})
	if !errors.Is(err, errBoom) {
		t.Fatalf("got %v, want errBoom", err)
	}
	if c := calls.Load(); c != 1 {
		t.Fatalf("%d calls made, want 1: no new calls after the first error", c)
	}
}

func TestParentCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err := Fetch(ctx, []string{"a", "b"}, 2, func(ctx context.Context, u string) (string, error) {
		return u, ctx.Err()
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("got %v, want context.Canceled", err)
	}
}
