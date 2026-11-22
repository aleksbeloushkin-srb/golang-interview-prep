package bitset

import (
	"slices"
	"testing"
)

func TestZeroValueIsEmpty(t *testing.T) {
	var s Set
	if s.Len() != 0 || s.Has(0) || len(s.Elems()) != 0 {
		t.Fatalf("zero Set: Len=%d Has(0)=%v Elems=%v, want an empty set", s.Len(), s.Has(0), s.Elems())
	}
}

func TestAddHas(t *testing.T) {
	var s Set
	in := []int{0, 1, 31, 32, 63, 64, 65, 127, 128, 1000}
	for _, i := range in {
		s.Add(i)
	}
	for _, i := range in {
		if !s.Has(i) {
			t.Errorf("Has(%d) = false after Add(%d)", i, i)
		}
	}
	for _, i := range []int{2, 30, 33, 62, 66, 126, 129, 999, 1001, 5000, -1} {
		if s.Has(i) {
			t.Errorf("Has(%d) = true, it was never added", i)
		}
	}
	if got := s.Len(); got != len(in) {
		t.Errorf("Len() = %d, want %d", got, len(in))
	}
}

func TestAddTwice(t *testing.T) {
	var s Set
	s.Add(70)
	s.Add(70)
	if s.Len() != 1 || !s.Has(70) {
		t.Fatalf("after Add(70) twice: Len=%d Has(70)=%v, want 1 and true", s.Len(), s.Has(70))
	}
}

func TestRemove(t *testing.T) {
	var s Set
	for _, i := range []int{3, 64, 200} {
		s.Add(i)
	}
	s.Remove(64)
	s.Remove(5)    // absent: must stay absent
	s.Remove(9000) // beyond the last word
	s.Remove(-3)
	if got, want := s.Elems(), []int{3, 200}; !slices.Equal(got, want) {
		t.Fatalf("Elems() = %v, want %v", got, want)
	}
	if s.Has(5) {
		t.Error("Remove(5) of an absent element added it")
	}
}

func TestElemsAscending(t *testing.T) {
	var s Set
	for _, i := range []int{130, 5, 64, 0, 63, 129} {
		s.Add(i)
	}
	if got, want := s.Elems(), []int{0, 5, 63, 64, 129, 130}; !slices.Equal(got, want) {
		t.Fatalf("Elems() = %v, want %v", got, want)
	}
}

func TestUnion(t *testing.T) {
	var a, b Set
	a.Add(1)
	a.Add(70)
	b.Add(70)
	b.Add(300) // b is longer than a
	a.Union(&b)
	if got, want := a.Elems(), []int{1, 70, 300}; !slices.Equal(got, want) {
		t.Fatalf("after Union: Elems() = %v, want %v", got, want)
	}
	if got, want := b.Elems(), []int{70, 300}; !slices.Equal(got, want) {
		t.Fatalf("Union changed its argument: Elems() = %v, want %v", got, want)
	}
	a.Add(301)
	if b.Has(301) {
		t.Fatal("a and b share words after Union")
	}
}

func TestAddNegativePanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("Add(-1) did not panic")
		}
	}()
	var s Set
	s.Add(-1)
}
