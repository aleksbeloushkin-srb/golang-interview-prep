package allocate

import (
	"errors"
	"fmt"
	"math"
	"slices"
	"strings"
	"testing"
)

func minors(parts []Money) []int64 {
	out := make([]int64, len(parts))
	for i, p := range parts {
		out[i] = p.Minor
	}
	return out
}

func TestAllocate(t *testing.T) {
	tests := []struct {
		name  string
		minor int64
		n     int
		want  []int64
	}{
		{"10.00 into 3: the first part gets the extra cent", 1000, 3, []int64{334, 333, 333}},
		{"10.01 into 4", 1001, 4, []int64{251, 250, 250, 250}},
		{"10.01 into 3: two extra cents, first two parts", 1001, 3, []int64{334, 334, 333}},
		{"one part", 1000, 1, []int64{1000}},
		{"fewer cents than parts", 2, 3, []int64{1, 1, 0}},
		{"zero", 0, 3, []int64{0, 0, 0}},
		{"negative, extra cent first", -1000, 3, []int64{-334, -333, -333}},
		{"negative, fewer cents than parts", -2, 3, []int64{-1, -1, 0}},
		{"largest int64 in two", math.MaxInt64, 2, []int64{4611686018427387904, 4611686018427387903}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parts, err := Money{tt.minor, "EUR"}.Allocate(tt.n)
			if err != nil {
				t.Fatalf("Allocate(%d) error = %v", tt.n, err)
			}
			if got := minors(parts); !slices.Equal(got, tt.want) {
				t.Errorf("Money{%d}.Allocate(%d) = %v, want %v", tt.minor, tt.n, got, tt.want)
			}
		})
	}
}

// For many amounts and part counts: the parts add up exactly, differ by at most one, keep the currency.
func TestAllocateInvariants(t *testing.T) {
	for _, minor := range []int64{0, 1, 7, 99, 1000, 123457, -1, -99, -123457, math.MaxInt64, -math.MaxInt64} {
		for n := 1; n <= 12; n++ {
			parts, err := Money{minor, "JPY"}.Allocate(n)
			if err != nil || len(parts) != n {
				t.Fatalf("Allocate(%d) of %d: %d parts, %v", n, minor, len(parts), err)
			}
			var sum int64
			for _, p := range parts {
				sum += p.Minor
				if p.Currency != "JPY" {
					t.Fatalf("part has currency %q, want JPY", p.Currency)
				}
			}
			if sum != minor {
				t.Fatalf("Allocate(%d) of %d: parts %v add up to %d", n, minor, minors(parts), sum)
			}
			lo, hi := slices.Min(minors(parts)), slices.Max(minors(parts))
			if hi-lo > 1 {
				t.Fatalf("Allocate(%d) of %d: parts %v differ by more than one", n, minor, minors(parts))
			}
		}
	}
}

func TestAllocateBadParts(t *testing.T) {
	for _, n := range []int{0, -2} {
		parts, err := Money{1000, "EUR"}.Allocate(n)
		if !errors.Is(err, ErrBadParts) || parts != nil {
			t.Fatalf("Allocate(%d) = %v, %v, want nil and an error that wraps ErrBadParts", n, parts, err)
		}
		if want := fmt.Sprintf("into %d parts", n); !strings.Contains(err.Error(), want) {
			t.Errorf("error %q does not say the number of parts", err)
		}
	}
}
