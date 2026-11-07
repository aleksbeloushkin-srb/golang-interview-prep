package review

import (
	"context"
	"slices"
	"sync"
	"testing"
	"time"
)

func source(n int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for i := range n {
			ch <- i
		}
	}()
	return ch
}

// TeeShadow: the copy lives one inner iteration, so `out1 = nil` is lost and
// the same output can get a value twice while the other one misses it.
func TestTeeShadowDuplicates(t *testing.T) {
	broken := 0
	for range 100 {
		a, b := TeeShadow(context.Background(), source(20))
		var gotA, gotB []int
		var wg sync.WaitGroup
		wg.Add(2)
		go func() { defer wg.Done(); gotA = collect(a) }()
		go func() {
			defer wg.Done()
			for v := range b {
				time.Sleep(100 * time.Microsecond) // a slower reader
				gotB = append(gotB, v)
			}
		}()
		wg.Wait()
		want := collect(source(20))
		if !slices.Equal(gotA, want) || !slices.Equal(gotB, want) {
			broken++
		}
	}
	if broken == 0 {
		t.Fatal("TeeShadow delivered every value once to both outputs in 100 runs")
	}
	t.Logf("TeeShadow broke %d of 100 runs", broken)
}

// TeeFast: several goroutines wait to send to one output, so the order is lost.
func TestTeeFastLosesOrder(t *testing.T) {
	outOfOrder := 0
	for range 200 {
		outs := TeeFast(source(20), 2)
		var wg sync.WaitGroup
		got := make([][]int, 2)
		for i, out := range outs {
			wg.Add(1)
			go func() {
				defer wg.Done()
				for v := range out {
					got[i] = append(got[i], v)
				}
			}()
		}
		wg.Wait()
		for _, g := range got {
			if !slices.IsSorted(g) {
				outOfOrder++
			}
		}
	}
	if outOfOrder == 0 {
		t.Fatal("TeeFast kept the order of 400 outputs")
	}
	t.Logf("TeeFast: %d of 400 outputs out of order", outOfOrder)
}

func collect(ch <-chan int) []int {
	var got []int
	for v := range ch {
		got = append(got, v)
	}
	return got
}
