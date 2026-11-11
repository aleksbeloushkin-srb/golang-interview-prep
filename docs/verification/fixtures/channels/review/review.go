// Package review holds the code the channels track gives for review in week 10.
// Each function is shown on the site exactly as written here and has a bug;
// review_test.go shows the bug.
package review

import (
	"context"
	"errors"
	"math/rand/v2"
	"sync"
	"time"
)

func TeeShadow(ctx context.Context, in <-chan int) (<-chan int, <-chan int) {
	out1, out2 := make(chan int), make(chan int)
	go func() {
		defer close(out1)
		defer close(out2)
		for v := range in {
			for range 2 {
				out1, out2 := out1, out2
				select {
				case <-ctx.Done():
					return
				case out1 <- v:
					out1 = nil
				case out2 <- v:
					out2 = nil
				}
			}
		}
	}()
	return out1, out2
}

func TeeFast(in <-chan int, n int) []chan int {
	outs := make([]chan int, n)
	wgs := make([]sync.WaitGroup, n)
	for i := range outs {
		outs[i] = make(chan int)
	}
	go func() {
		defer func() {
			for i := range outs {
				go func() {
					wgs[i].Wait()
					close(outs[i])
				}()
			}
		}()
		for v := range in {
			for i := range outs {
				wgs[i].Add(1)
				go func() {
					defer wgs[i].Done()
					outs[i] <- v
				}()
			}
		}
	}()
	return outs
}

func OrDone(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for {
			select {
			case <-ctx.Done():
				return
			case v, ok := <-in:
				if !ok {
					return
				}
				out <- v
			}
		}
	}()
	return out
}

var errTimeout = errors.New("timed out")

type outVal struct {
	val int
	err error
}

func processData(ctx context.Context, v int) chan outVal {
	done := make(chan struct{})
	out := make(chan outVal)
	go func() {
		time.Sleep(time.Duration(rand.IntN(10)) * time.Second)
		close(done)
	}()
	go func() {
		select {
		case <-done:
			out <- outVal{val: v * 2}
		case <-ctx.Done():
			out <- outVal{err: errTimeout}
		}
	}()
	return out
}

// worker is the caller of processData in that solution: on timeout it may
// leave through its own ctx.Done() case without reading the result.
func worker(ctx context.Context, in <-chan int, out chan<- int) {
	for {
		select {
		case v, ok := <-in:
			if !ok {
				return
			}
			select {
			case ov := <-processData(ctx, v):
				if ov.err != nil {
					return
				}
				select {
				case out <- ov.val:
				case <-ctx.Done():
					return
				}
			case <-ctx.Done():
				return
			}
		case <-ctx.Done():
			return
		}
	}
}
