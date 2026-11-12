package calc

import (
	"errors"
	"testing"
)

func TestDiv(t *testing.T) {
	tests := []struct {
		name    string
		a, b    int
		want    int
		wantErr error
	}{
		{name: "exact", a: 10, b: 2, want: 5},
		{name: "drops the fraction", a: 7, b: 2, want: 3},
		{name: "negative rounds toward zero", a: -7, b: 2, want: -3},
		{name: "by zero", a: 1, b: 0, wantErr: ErrDivByZero},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Div(tt.a, tt.b)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Div(%d, %d) error = %v, want %v", tt.a, tt.b, err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("Div(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}
