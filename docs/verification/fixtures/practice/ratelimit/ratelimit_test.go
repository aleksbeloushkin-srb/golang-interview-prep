package ratelimit

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// fakeClock is moved by hand, so Allow tests do not depend on real time.
type fakeClock struct {
	mu sync.Mutex
	t  time.Time
}

func (c *fakeClock) Now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.t
}

func (c *fakeClock) Advance(d time.Duration) {
	c.mu.Lock()
	c.t = c.t.Add(d)
	c.mu.Unlock()
}

func newFake(rate float64, burst int) (*Limiter, *fakeClock) {
	clock := &fakeClock{t: time.Unix(1_700_000_000, 0)}
	return NewWithClock(rate, burst, clock.Now), clock
}

func allowN(l *Limiter, n int) int {
	ok := 0
	for range n {
		if l.Allow() {
			ok++
		}
	}
	return ok
}

func TestBurstThenDeny(t *testing.T) {
	l, _ := newFake(10, 3)
	if got := allowN(l, 5); got != 3 {
		t.Fatalf("allowed %d of 5 at once, want burst 3", got)
	}
}

func TestRefillAtRate(t *testing.T) {
	l, clock := newFake(10, 3) // one token every 100 ms
	allowN(l, 3)
	clock.Advance(99 * time.Millisecond)
	if l.Allow() {
		t.Fatal("allowed before a whole token was earned")
	}
	clock.Advance(time.Millisecond)
	if !l.Allow() {
		t.Fatal("denied after 100 ms at 10 tokens per second")
	}
	if l.Allow() {
		t.Fatal("allowed a second event with one earned token")
	}
}

func TestLongPauseCapsAtBurst(t *testing.T) {
	l, clock := newFake(10, 3)
	allowN(l, 3)
	clock.Advance(time.Hour)
	if got := allowN(l, 10); got != 3 {
		t.Fatalf("allowed %d after a long pause, want burst 3", got)
	}
}

func TestConcurrentAllowNeverExceedsBurst(t *testing.T) {
	l, _ := newFake(1, 50) // the clock does not move: only the initial 50 tokens exist
	var allowed atomic.Int32
	var wg sync.WaitGroup
	for range 20 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for range 100 {
				if l.Allow() {
					allowed.Add(1)
				}
			}
		}()
	}
	wg.Wait()
	if got := allowed.Load(); got != 50 {
		t.Fatalf("allowed %d events, want exactly 50", got)
	}
}

func TestWaitGetsTokens(t *testing.T) {
	l := New(200, 1) // real clock: a token every 5 ms
	start := time.Now()
	for range 3 {
		if err := l.Wait(context.Background()); err != nil {
			t.Fatal(err)
		}
	}
	// The first token is there at once; the next two need about 10 ms in total.
	if elapsed := time.Since(start); elapsed < 8*time.Millisecond {
		t.Fatalf("3 waits took %v; the limiter did not wait for tokens", elapsed)
	}
}

func TestWaitHonoursCancel(t *testing.T) {
	l := New(0.001, 1) // the next token is ~17 minutes away
	l.Allow()
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()
	done := make(chan error, 1)
	go func() { done <- l.Wait(ctx) }()
	select {
	case err := <-done:
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Fatalf("got %v, want context.DeadlineExceeded", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Wait ignored the context deadline")
	}
}
