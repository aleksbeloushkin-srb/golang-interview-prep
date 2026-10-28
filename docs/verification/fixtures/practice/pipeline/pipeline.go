// Package pipeline is the reference solution for practice task W3-2.
package pipeline

import "context"

// Generate sends nums one by one on the returned channel.
// It closes the channel after the last value or as soon as ctx is done.
func Generate(ctx context.Context, nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, n := range nums {
			select {
			case out <- n:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}

// Square sends n*n for every n received from in.
// It closes its output when in is closed or ctx is done, even if in is never closed.
func Square(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for {
			select {
			case <-ctx.Done():
				return
			case n, ok := <-in:
				if !ok {
					return
				}
				select {
				case out <- n * n:
				case <-ctx.Done():
					return
				}
			}
		}
	}()
	return out
}

// Sum adds up every value from in until in is closed.
// If ctx is done, it returns 0 and ctx.Err(), even when in has closed too:
// upstream stages close their outputs on cancellation as well.
func Sum(ctx context.Context, in <-chan int) (int, error) {
	total := 0
	for {
		select {
		case <-ctx.Done():
			return 0, ctx.Err()
		case n, ok := <-in:
			if !ok {
				// A closed input may be the result of the same cancellation.
				if err := ctx.Err(); err != nil {
					return 0, err
				}
				return total, nil
			}
			total += n
		}
	}
}
