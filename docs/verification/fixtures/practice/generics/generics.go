// Package generics is the reference solution for practice tasks W2-2 and W2-3.
package generics

import "cmp"

// Map, Filter and Reduce work for any element types; the compiler checks them.

func Map[T, U any](xs []T, f func(T) U) []U {
	out := make([]U, 0, len(xs))
	for _, x := range xs {
		out = append(out, f(x))
	}
	return out
}

func Filter[T any](xs []T, keep func(T) bool) []T {
	var out []T
	for _, x := range xs {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func Reduce[T, A any](xs []T, init A, f func(A, T) A) A {
	acc := init
	for _, x := range xs {
		acc = f(acc, x)
	}
	return acc
}

// Set needs comparable elements because they become map keys.
type Set[T comparable] struct {
	m map[T]struct{}
}

func NewSet[T comparable](items ...T) *Set[T] {
	s := &Set[T]{m: make(map[T]struct{}, len(items))}
	for _, it := range items {
		s.Add(it)
	}
	return s
}

func (s *Set[T]) Add(v T)      { s.m[v] = struct{}{} }
func (s *Set[T]) Has(v T) bool { _, ok := s.m[v]; return ok }
func (s *Set[T]) Len() int     { return len(s.m) }
func (s *Set[T]) Remove(v T)   { delete(s.m, v) }
func (s *Set[T]) Each(f func(T)) {
	for v := range s.m {
		f(v)
	}
}

// W2-3: the same "maximum" two ways.

// Max works on any ordered type: same algorithm, different types.
func Max[T cmp.Ordered](xs []T) (T, bool) {
	var zero T
	if len(xs) == 0 {
		return zero, false
	}
	m := xs[0]
	for _, x := range xs[1:] {
		m = max(m, x)
	}
	return m, true
}

// Ranker is the interface way: each type decides what "better" means.
type Ranker interface {
	Score() int
}

// Best works with values of different types in one slice, chosen at run time.
func Best(xs []Ranker) (Ranker, bool) {
	if len(xs) == 0 {
		return nil, false
	}
	b := xs[0]
	for _, x := range xs[1:] {
		if x.Score() > b.Score() {
			b = x
		}
	}
	return b, true
}
