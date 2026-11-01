package squares

import (
	"slices"
	"testing"
)

func TestAllSquares(t *testing.T) {
	got := Squares([]int{1, 2, 3, 4, 5, 6})
	slices.Sort(got) // three workers: the order is not defined
	if want := []int{1, 4, 9, 16, 25, 36}; !slices.Equal(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestEmptyInput(t *testing.T) {
	if got := Squares(nil); len(got) != 0 {
		t.Fatalf("got %v, want none", got)
	}
}

func TestManyNumbers(t *testing.T) {
	nums := make([]int, 1000)
	for i := range nums {
		nums[i] = i
	}
	got := Squares(nums)
	if len(got) != len(nums) {
		t.Fatalf("got %d results, want %d", len(got), len(nums))
	}
}
