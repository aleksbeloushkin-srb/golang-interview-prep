package asm

import "testing"

func TestSum(t *testing.T) {
	if got := Sum([]int{1, 2, 3}); got != 6 {
		t.Fatalf("Sum = %d, want 6", got)
	}
	if got := Add(2, 3); got != 5 {
		t.Fatalf("Add = %d, want 5", got)
	}
}

func BenchmarkSum(b *testing.B) {
	xs := make([]int, 1000)
	for i := range xs {
		xs[i] = i
	}
	for b.Loop() {
		Sum(xs)
	}
}
