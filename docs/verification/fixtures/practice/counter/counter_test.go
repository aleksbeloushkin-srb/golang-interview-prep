package counter

import (
	"runtime"
	"sync"
	"testing"
	"time"
)

var impls = []struct {
	name string
	new  func() Counter
}{
	{"mutex", NewMutexCounter},
	{"atomic", NewAtomicCounter},
	{"channel", NewChanCounter},
}

func TestConcurrentInc(t *testing.T) {
	const goroutines, perG = 50, 1000
	for _, impl := range impls {
		t.Run(impl.name, func(t *testing.T) {
			c := impl.new()
			defer c.Close()
			var wg sync.WaitGroup
			wg.Add(goroutines)
			for range goroutines {
				go func() {
					defer wg.Done()
					for range perG {
						c.Inc()
					}
				}()
			}
			wg.Wait()
			if got := c.Value(); got != goroutines*perG {
				t.Fatalf("Value() = %d, want %d", got, goroutines*perG)
			}
		})
	}
}

func TestCloseStopsOwnerGoroutine(t *testing.T) {
	before := runtime.NumGoroutine()
	c := NewChanCounter()
	c.Inc()
	if got := c.Value(); got != 1 {
		t.Fatalf("Value() = %d, want 1", got)
	}
	c.Close()
	deadline := time.Now().Add(2 * time.Second)
	for runtime.NumGoroutine() > before {
		if time.Now().After(deadline) {
			t.Fatal("owner goroutine is still running after Close")
		}
		time.Sleep(time.Millisecond)
	}
}

// Compare on your machine, with different -cpu values. The numbers depend on
// the CPU count and contention; they do not prove that one way is always faster.
func BenchmarkInc(b *testing.B) {
	for _, impl := range impls {
		b.Run(impl.name, func(b *testing.B) {
			c := impl.new()
			defer c.Close()
			b.RunParallel(func(pb *testing.PB) {
				for pb.Next() {
					c.Inc()
				}
			})
		})
	}
}
