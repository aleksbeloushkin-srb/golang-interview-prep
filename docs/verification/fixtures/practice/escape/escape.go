// Package escape is the reference solution for practice task W4-5:
// read `go build -gcflags=-m` output and keep values on the stack.
package escape

import "strconv"

type Point struct{ X, Y int }

// NewPoint returns a pointer to a local variable. The variable outlives the
// call, so the compiler moves it to the heap: "moved to heap: p".
func NewPoint(x, y int) *Point {
	p := Point{X: x, Y: y}
	return &p
}

// MakePoint returns a copy. Nothing outlives the call: no allocation.
func MakePoint(x, y int) Point {
	return Point{X: x, Y: y}
}

// SumFirst adds up to the first 64 values. The scratch buffer has a constant
// size and never leaves the function, so it stays on the stack.
func SumFirst(xs []int) int {
	var buf [64]int
	n := copy(buf[:], xs)
	total := 0
	for _, v := range buf[:n] {
		total += v
	}
	return total
}

// AppendID appends "id-<n>" to dst. strconv.AppendInt writes digits straight
// into dst; fmt.Sprintf would box n in an interface and build a new string.
func AppendID(dst []byte, n int) []byte {
	dst = append(dst, "id-"...)
	return strconv.AppendInt(dst, int64(n), 10)
}
