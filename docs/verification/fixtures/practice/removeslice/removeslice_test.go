package removeslice

import (
	"slices"
	"testing"
)

func TestRemoveInPlaceChangesCallerArray(t *testing.T) {
	orig := []int{1, 2, 3, 4}
	got := RemoveInPlace(orig, 1)
	if !slices.Equal(got, []int{1, 3, 4}) {
		t.Fatalf("got %v, want [1 3 4]", got)
	}
	// Same backing array: the caller's slice now reads 1 3 4 4.
	if !slices.Equal(orig, []int{1, 3, 4, 4}) {
		t.Fatalf("orig = %v, want [1 3 4 4]: in-place removal shifts the shared array", orig)
	}
}

func TestRemoveCopyKeepsCallerArray(t *testing.T) {
	orig := []int{1, 2, 3, 4}
	got := RemoveCopy(orig, 1)
	if !slices.Equal(got, []int{1, 3, 4}) {
		t.Fatalf("got %v, want [1 3 4]", got)
	}
	if !slices.Equal(orig, []int{1, 2, 3, 4}) {
		t.Fatalf("orig changed to %v", orig)
	}
	got[0] = 100
	if orig[0] != 1 {
		t.Fatal("result shares memory with the original")
	}
}

func TestEdges(t *testing.T) {
	for _, remove := range []func([]int, int) []int{RemoveInPlace, RemoveCopy} {
		if got := remove([]int{7}, 0); len(got) != 0 {
			t.Fatalf("removing the only element gave %v", got)
		}
		if got := remove([]int{1, 2, 3}, 2); !slices.Equal(got, []int{1, 2}) {
			t.Fatalf("removing the last element gave %v", got)
		}
	}
}

// slices.Delete (Go 1.21) works in place too; since Go 1.22 it also zeroes the
// elements past the new length, so the stale duplicate is gone.
func TestSlicesDeleteZeroesTail(t *testing.T) {
	orig := []int{1, 2, 3, 4}
	got := slices.Delete(orig, 1, 2)
	if !slices.Equal(got, []int{1, 3, 4}) || !slices.Equal(orig, []int{1, 3, 4, 0}) {
		t.Fatalf("got %v, orig %v; want [1 3 4] and [1 3 4 0]", got, orig)
	}
}
