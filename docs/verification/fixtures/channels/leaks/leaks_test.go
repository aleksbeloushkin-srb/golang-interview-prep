//go:build go1.25 && leakdemo

package leaks

import (
	"context"
	"testing"
	"testing/synctest"
	"time"

	"go.uber.org/goleak"
)

func runBoss(t *testing.T, buffer int) {
	synctest.Test(t, func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		in, out := make(chan int), make(chan int)
		go func() {
			defer close(in)
			for i := range 100 {
				select {
				case in <- i:
				case <-ctx.Done():
					return
				}
			}
		}()
		ProcessParallel(ctx, in, out, 5, buffer, time.Second)
		for range out {
		}
		time.Sleep(10 * time.Second) // let every sleeping goroutine finish
	})
}

// K2.6 control check: the "solution without leaks" leaks; buffer 1 fixes it.
func TestLeakBossUnbuffered(t *testing.T) { runBoss(t, 0) }
func TestFixedBossBuffered(t *testing.T)  { runBoss(t, 1) }

// K2.7: one leak, three detectors. Each TestLeak* must fail.
func TestLeakFirstSynctest(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		FirstLeaky(func() int { return 1 }, func() int { time.Sleep(time.Second); return 2 })
		time.Sleep(2 * time.Second)
	})
}

func TestLeakFirstGoleak(t *testing.T) {
	defer goleak.VerifyNone(t)
	FirstLeaky(func() int { return 1 }, func() int { time.Sleep(10 * time.Millisecond); return 2 })
}

// -race sees no data race here: a leak is not a race.
func TestRaceSilentOnLeak(t *testing.T) {
	FirstLeaky(func() int { return 1 }, func() int { return 2 })
}

// K3.7: or-done with a send outside select leaks once the reader cancels and leaves.
func TestLeakOrDoneNoSelect(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		in := make(chan int, 1)
		in <- 1
		OrDoneNoSelect(ctx, in)
		synctest.Wait() // it took the value and waits to send it
		cancel()
	})
}

// K2.6 variation: goleak right after a run where processData cannot be
// cancelled reports goroutines that are still sleeping — not a leak, they
// would finish within 9 s.
func TestLeakGoleakFalsePositive(t *testing.T) {
	defer goleak.VerifyNone(t)
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()
	in, out := make(chan int), make(chan int)
	go func() {
		defer close(in)
		for i := range 100 {
			select {
			case in <- i:
			case <-ctx.Done():
				return
			}
		}
	}()
	ProcessParallel(ctx, in, out, 5, 1, 900*time.Millisecond) // sleeps up to 8.1 s, buffer 1: no leak
	for range out {
	}
}
