package escape

import (
	"slices"
	"testing"
)

// Package-level sinks keep results alive, so the compiler cannot drop the calls.
var (
	sinkPtr   *Point
	sinkPoint Point
	sinkInt   int
	sinkBytes []byte
)

func TestResults(t *testing.T) {
	if p := NewPoint(1, 2); *p != (Point{1, 2}) {
		t.Fatalf("NewPoint = %v", *p)
	}
	if p := MakePoint(3, 4); p != (Point{3, 4}) {
		t.Fatalf("MakePoint = %v", p)
	}
	xs := make([]int, 100)
	for i := range xs {
		xs[i] = 1
	}
	if got := SumFirst(xs); got != 64 {
		t.Fatalf("SumFirst(100 ones) = %d, want 64", got)
	}
	if got := SumFirst([]int{1, 2, 3}); got != 6 {
		t.Fatalf("SumFirst([1 2 3]) = %d, want 6", got)
	}
	if got := string(AppendID([]byte("user "), 4096)); got != "user id-4096" {
		t.Fatalf("AppendID = %q", got)
	}
}

// testing.AllocsPerRun counts heap allocations per call: the observable side
// of escape analysis. Compare with go build -gcflags=-m.
func TestAllocations(t *testing.T) {
	xs := slices.Repeat([]int{1}, 50)
	dst := make([]byte, 0, 64)
	tests := []struct {
		name string
		f    func()
		want float64
	}{
		{"NewPoint: the value outlives the call", func() { sinkPtr = NewPoint(1, 2) }, 1},
		{"MakePoint: returned by value", func() { sinkPoint = MakePoint(1, 2) }, 0},
		{"SumFirst: constant-size buffer", func() { sinkInt = SumFirst(xs) }, 0},
		{"AppendID: into a buffer with room", func() { sinkBytes = AppendID(dst[:0], 123456) }, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := testing.AllocsPerRun(100, tt.f); got != tt.want {
				t.Fatalf("%v allocations per call, want %v", got, tt.want)
			}
		})
	}
}
