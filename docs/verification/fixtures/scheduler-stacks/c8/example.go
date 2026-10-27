package main

import (
	"context"
	"fmt"
)

func sum(ctx context.Context, n int) (int, error) {
	total := 0
	for i := 0; i < n; i++ {
		select {
		case <-ctx.Done():
			return 0, ctx.Err()
		default:
		}
		total += i
	}
	return total, nil
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err := sum(ctx, 100)
	fmt.Println(err) // context canceled; the application checks the signal.
}
