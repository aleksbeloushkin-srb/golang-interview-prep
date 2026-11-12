package calc

import (
	"errors"
	"testing"
)

// FuzzDiv проверяет свойство, а не пример: q*b + a%b == a для любых a и b != 0.
func FuzzDiv(f *testing.F) {
	f.Add(7, 2)
	f.Add(-7, 2)
	f.Add(1, 0)
	f.Fuzz(func(t *testing.T, a, b int) {
		q, err := Div(a, b)
		if b == 0 {
			if !errors.Is(err, ErrDivByZero) {
				t.Fatalf("Div(%d, 0) error = %v, want ErrDivByZero", a, err)
			}
			return
		}
		if err != nil || q*b+a%b != a {
			t.Fatalf("Div(%d, %d) = %d, %v", a, b, q, err)
		}
	})
}
