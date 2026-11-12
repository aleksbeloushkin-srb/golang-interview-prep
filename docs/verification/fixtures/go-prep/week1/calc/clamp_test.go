package calc

import "testing"

func TestClamp(t *testing.T) {
	tests := map[string]struct {
		x, lo, hi, want int
	}{
		"inside":        {x: 5, lo: 0, hi: 10, want: 5},
		"below":         {x: -3, lo: 0, hi: 10, want: 0},
		"above":         {x: 42, lo: 0, hi: 10, want: 10},
		"on the edge":   {x: 10, lo: 0, hi: 10, want: 10},
		"empty segment": {x: 7, lo: 3, hi: 3, want: 3},
	}
	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			checkClamp(t, tt.x, tt.lo, tt.hi, tt.want)
		})
	}
}

// checkClamp — хелпер: t.Helper переносит строку падения в место вызова.
func checkClamp(t *testing.T, x, lo, hi, want int) {
	t.Helper()
	if got := Clamp(x, lo, hi); got != want {
		t.Errorf("Clamp(%d, %d, %d) = %d, want %d", x, lo, hi, got, want)
	}
}
