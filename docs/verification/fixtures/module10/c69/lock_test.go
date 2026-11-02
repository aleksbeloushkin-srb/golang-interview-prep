package lock

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"
)

// clock is a manual clock: tests advance it instead of sleeping.
type clock struct {
	mu sync.Mutex
	t  time.Time
}

func (c *clock) Now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.t
}

func (c *clock) Advance(d time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.t = c.t.Add(d)
}

func newStore() (*MemStore, *clock) {
	c := &clock{t: time.Date(2026, 11, 2, 12, 0, 0, 0, time.UTC)}
	return NewMemStore(c.Now), c
}

func TestForeignTokenDoesNotRelease(t *testing.T) {
	ctx := context.Background()
	s, _ := newStore()

	a, err := Acquire(ctx, s, "report", 30*time.Second)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Acquire(ctx, s, "report", 30*time.Second); !errors.Is(err, ErrNotAcquired) {
		t.Fatalf("second Acquire: got %v, want ErrNotAcquired", err)
	}

	foreign := &Lock{store: s, key: "report", token: "someone-else"}
	if err := foreign.Release(ctx); !errors.Is(err, ErrNotHeld) {
		t.Fatalf("Release with a foreign token: got %v, want ErrNotHeld", err)
	}
	if _, err := Acquire(ctx, s, "report", 30*time.Second); !errors.Is(err, ErrNotAcquired) {
		t.Fatalf("the foreign Release must not free the lock, got %v", err)
	}

	if err := a.Release(ctx); err != nil {
		t.Fatalf("owner Release: %v", err)
	}
	b, err := Acquire(ctx, s, "report", 30*time.Second)
	if err != nil {
		t.Fatalf("Acquire after Release: %v", err)
	}
	if a.Fence() != 1 || b.Fence() != 2 {
		t.Fatalf("fences = %d, %d; want 1, 2", a.Fence(), b.Fence())
	}
}

// A pauses longer than the TTL, B takes the lock over, then A wakes up.
func TestExpiredLockIsTakenOverAndFenceRejectsOldOwner(t *testing.T) {
	ctx := context.Background()
	s, clk := newStore()
	var storage Storage

	a, err := Acquire(ctx, s, "report", 10*time.Second)
	if err != nil {
		t.Fatal(err)
	}

	clk.Advance(11 * time.Second) // A stands in a GC or network pause

	b, err := Acquire(ctx, s, "report", 10*time.Second)
	if err != nil {
		t.Fatalf("Acquire of an expired lock: %v", err)
	}
	if b.Fence() <= a.Fence() {
		t.Fatalf("fence did not grow: A=%d B=%d", a.Fence(), b.Fence())
	}
	if err := storage.Write(b.Fence(), "from B"); err != nil {
		t.Fatalf("B writes: %v", err)
	}

	// A wakes up and still believes it holds the lock.
	if err := storage.Write(a.Fence(), "from A"); !errors.Is(err, ErrStaleFence) {
		t.Fatalf("A writes with an old fence: got %v, want ErrStaleFence", err)
	}
	if err := a.Release(ctx); !errors.Is(err, ErrNotHeld) {
		t.Fatalf("A releases: got %v, want ErrNotHeld", err)
	}
	if _, err := Acquire(ctx, s, "report", 10*time.Second); !errors.Is(err, ErrNotAcquired) {
		t.Fatalf("A's Release must not free B's lock, got %v", err)
	}
	if got := storage.Body(); got != "from B" {
		t.Fatalf("storage = %q, want %q", got, "from B")
	}
	if err := storage.Write(b.Fence(), "from B again"); err != nil {
		t.Fatalf("the current owner writes again with the same fence: %v", err)
	}
}

func TestReleaseWithExpiredWorkContextKeepsLock(t *testing.T) {
	s, _ := newStore()
	workCtx, cancel := context.WithCancel(context.Background())

	l, err := Acquire(workCtx, s, "report", time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	cancel() // the work hit its timeout

	if err := l.Release(workCtx); !errors.Is(err, context.Canceled) {
		t.Fatalf("Release with the dead work context: got %v, want context.Canceled", err)
	}
	if _, err := Acquire(context.Background(), s, "report", time.Minute); !errors.Is(err, ErrNotAcquired) {
		t.Fatalf("the lock must still be held, got %v", err)
	}

	relCtx, relCancel := context.WithTimeout(context.WithoutCancel(workCtx), time.Second)
	defer relCancel()
	if err := l.Release(relCtx); err != nil {
		t.Fatalf("Release with a fresh context: %v", err)
	}
}

func TestOneWinnerUnderContention(t *testing.T) {
	ctx := context.Background()
	s, _ := newStore()

	const n = 50
	var (
		wg   sync.WaitGroup
		mu   sync.Mutex
		wins int
	)
	start := make(chan struct{})
	for range n {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-start
			_, err := Acquire(ctx, s, "report", time.Minute)
			switch {
			case err == nil:
				mu.Lock()
				wins++
				mu.Unlock()
			case !errors.Is(err, ErrNotAcquired):
				t.Errorf("Acquire: %v", err)
			}
		}()
	}
	close(start)
	wg.Wait()
	if wins != 1 {
		t.Fatalf("winners = %d, want 1", wins)
	}
}
