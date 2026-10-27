package main

import (
	"context"
	"errors"
	"testing"
)

func TestSumAndCancellation(t *testing.T) {
	for _, tc := range []struct{ n, want int }{{0, 0}, {1, 0}, {100, 4950}} {
		got, err := sum(context.Background(), tc.n)
		if err != nil || got != tc.want {
			t.Fatalf("sum(%d)=%d,%v", tc.n, got, err)
		}
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := sum(ctx, 100); !errors.Is(err, context.Canceled) {
		t.Fatalf("canceled computation: %v", err)
	}
}
