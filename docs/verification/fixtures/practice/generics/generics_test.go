package generics

import (
	"slices"
	"strconv"
	"testing"
)

func TestMapFilterReduce(t *testing.T) {
	nums := []int{1, 2, 3, 4, 5}
	strs := Map(nums, strconv.Itoa)
	if !slices.Equal(strs, []string{"1", "2", "3", "4", "5"}) {
		t.Fatalf("Map = %v", strs)
	}
	even := Filter(nums, func(n int) bool { return n%2 == 0 })
	if !slices.Equal(even, []int{2, 4}) {
		t.Fatalf("Filter = %v", even)
	}
	sum := Reduce(nums, 0, func(acc, n int) int { return acc + n })
	if sum != 15 {
		t.Fatalf("Reduce = %d", sum)
	}
	joined := Reduce(strs, "", func(acc, s string) string { return acc + s })
	if joined != "12345" {
		t.Fatalf("Reduce to string = %q", joined)
	}
}

func TestEmptyInputs(t *testing.T) {
	if got := Map([]int(nil), strconv.Itoa); len(got) != 0 {
		t.Fatalf("Map(nil) = %v", got)
	}
	if got := Filter([]int(nil), func(int) bool { return true }); len(got) != 0 {
		t.Fatalf("Filter(nil) = %v", got)
	}
	if got := Reduce([]int(nil), 7, func(a, n int) int { return a + n }); got != 7 {
		t.Fatalf("Reduce(nil) = %d, want the initial value", got)
	}
}

func TestSet(t *testing.T) {
	s := NewSet("go", "kotlin", "go")
	if s.Len() != 2 || !s.Has("go") || s.Has("java") {
		t.Fatalf("unexpected set state: len %d", s.Len())
	}
	s.Remove("go")
	if s.Has("go") || s.Len() != 1 {
		t.Fatal("Remove did not remove")
	}
	type point struct{ X, Y int } // comparable struct: fine as a key
	ps := NewSet(point{1, 2}, point{1, 2})
	if ps.Len() != 1 {
		t.Fatalf("equal structs counted twice: %d", ps.Len())
	}
}

type player struct {
	name  string
	score int
}

func (p player) Score() int { return p.score }

type team []player

func (t team) Score() int {
	total := 0
	for _, p := range t {
		total += p.score
	}
	return total
}

func TestMaxAndBest(t *testing.T) {
	if m, ok := Max([]float64{1.5, -2, 9.25}); !ok || m != 9.25 {
		t.Fatalf("Max = %v, %v", m, ok)
	}
	if m, ok := Max([]string{"b", "c", "a"}); !ok || m != "c" {
		t.Fatalf("Max strings = %v, %v", m, ok)
	}
	if _, ok := Max([]int{}); ok {
		t.Fatal("Max of empty slice reported ok")
	}
	// Different concrete types in one slice: only the interface version can do this.
	b, ok := Best([]Ranker{player{"ann", 7}, team{{"bob", 3}, {"cy", 5}}, player{"dan", 2}})
	if !ok || b.Score() != 8 {
		t.Fatalf("Best = %v, %v", b, ok)
	}
}
