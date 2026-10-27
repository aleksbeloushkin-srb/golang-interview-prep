package main

import "testing"

func TestCallerValueSurvivesNestedCalls(t *testing.T) {
	for _, depth := range []int{0, 1, 64, 256} {
		value := -1
		got := descend(depth, &value)
		want := 0
		for n := 1; n <= depth; n++ {
			want += int(byte(n))
		}
		if value != 42 || got != want {
			t.Fatalf("depth %d: value=%d sum=%d, want 42 and %d", depth, value, got, want)
		}
	}
}
