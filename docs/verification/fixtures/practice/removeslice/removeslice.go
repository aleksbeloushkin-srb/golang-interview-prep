// Package removeslice is the reference solution for practice task W2-1.
package removeslice

// RemoveInPlace removes s[i] by shifting the tail left inside the same backing
// array. It is cheap, but the caller's slice changes: its elements move and its
// last element is left as a duplicate.
func RemoveInPlace(s []int, i int) []int {
	return append(s[:i], s[i+1:]...)
}

// RemoveCopy returns a new slice without s[i] and leaves s untouched.
func RemoveCopy(s []int, i int) []int {
	out := make([]int, 0, len(s)-1)
	out = append(out, s[:i]...)
	return append(out, s[i+1:]...)
}
