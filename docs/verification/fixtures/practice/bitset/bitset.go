// Package bitset is the reference solution for practice task W3-2.
package bitset

import (
	"fmt"
	"math/bits"
)

// Set is a set of non-negative integers, one bit per number: i is bit i&63 of word i>>6.
// The zero value is an empty set, ready to use.
type Set struct {
	words []uint64
}

// Add puts i into the set; a negative i panics, like an index out of range.
func (s *Set) Add(i int) {
	if i < 0 {
		panic(fmt.Sprintf("bitset: negative element %d", i))
	}
	w := i >> 6
	for len(s.words) <= w {
		s.words = append(s.words, 0)
	}
	s.words[w] |= 1 << (i & 63)
}

// Has reports whether i is in the set; a negative i or one beyond the last word is simply absent.
func (s *Set) Has(i int) bool {
	if i < 0 || i>>6 >= len(s.words) {
		return false
	}
	return s.words[i>>6]&(1<<(i&63)) != 0
}

// Remove takes i out of the set; an absent, negative or too large i is left alone, without a panic.
func (s *Set) Remove(i int) {
	if i < 0 || i>>6 >= len(s.words) {
		return
	}
	s.words[i>>6] &^= 1 << (i & 63)
}

// Len returns the number of elements.
func (s *Set) Len() int {
	n := 0
	for _, w := range s.words {
		n += bits.OnesCount64(w)
	}
	return n
}

// Union adds every element of t to s; t does not change.
func (s *Set) Union(t *Set) {
	for len(s.words) < len(t.words) {
		s.words = append(s.words, 0)
	}
	for i, w := range t.words {
		s.words[i] |= w
	}
}

// Elems returns the elements in ascending order.
func (s *Set) Elems() []int {
	var out []int
	for wi, w := range s.words {
		for w != 0 {
			out = append(out, wi<<6+bits.TrailingZeros64(w))
			w &= w - 1 // clear the lowest set bit
		}
	}
	return out
}
