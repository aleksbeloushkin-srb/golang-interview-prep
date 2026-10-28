package deferpanic

import (
	"slices"
	"strings"
	"testing"
)

func TestDeferOrder(t *testing.T) {
	if got := DeferOrder(); !slices.Equal(got, []int{3, 2, 1}) {
		t.Fatalf("DeferOrder() = %v, want [3 2 1]", got)
	}
}

func TestSafeDiv(t *testing.T) {
	q, err := SafeDiv(7, 2)
	if err != nil || q != 3 {
		t.Fatalf("SafeDiv(7, 2) = %d, %v; want 3, nil", q, err)
	}
}

func TestSafeDivByZero(t *testing.T) {
	q, err := SafeDiv(1, 0) // must not panic: the test would crash
	if err == nil {
		t.Fatal("got nil error for division by zero")
	}
	if q != 0 {
		t.Fatalf("q = %d, want 0 with an error", q)
	}
	if !strings.Contains(err.Error(), "divide by zero") {
		t.Fatalf("error %q should mention the runtime panic", err)
	}
}
