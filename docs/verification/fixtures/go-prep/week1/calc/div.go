package calc

import (
	"errors"
	"fmt"
)

// ErrDivByZero — sentinel: вызывающий проверяет его через errors.Is.
var ErrDivByZero = errors.New("division by zero")

// Div делит a на b с отбрасыванием дробной части к нулю, как оператор / в Go.
func Div(a, b int) (int, error) {
	if b == 0 {
		return 0, fmt.Errorf("div %d by %d: %w", a, b, ErrDivByZero)
	}
	return a / b, nil
}
