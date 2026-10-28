// Package deferpanic is the reference solution for practice tasks W1-4 and W1-5.
package deferpanic

import "fmt"

// DeferOrder records the order in which three deferred calls run.
// Deferred calls run last-in, first-out, so the result is [3 2 1].
func DeferOrder() (order []int) {
	for i := 1; i <= 3; i++ {
		defer func() { order = append(order, i) }() // Go 1.22+: each iteration has its own i
	}
	return nil
}

// SafeDiv returns a / b, turning a panic into an error. The deferred function
// can set err because err is a named result.
func SafeDiv(a, b int) (q int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("safediv %d/%d: %v", a, b, r)
		}
	}()
	return divide(a, b), nil
}

// divide panics on b == 0: the runtime raises "integer divide by zero".
func divide(a, b int) int { return a / b }
