// Package allocate is the reference solution for practice task W3-3.
package allocate

import (
	"errors"
	"fmt"
)

// Money is an amount in minor units plus an ISO currency code, as in W1-1.
type Money struct {
	Minor    int64
	Currency string
}

// ErrBadParts is wrapped by Allocate when n is not positive.
var ErrBadParts = errors.New("number of parts must be positive")

// Allocate splits m into n parts that add up to m exactly. Parts differ by at most one minor unit, and the first
// parts get the extra units: 10.00 EUR into 3 → 3.34, 3.33, 3.33. A negative amount splits the same way with its sign.
func (m Money) Allocate(n int) ([]Money, error) {
	if n <= 0 {
		return nil, fmt.Errorf("allocate %d %s into %d parts: %w", m.Minor, m.Currency, n, ErrBadParts)
	}
	q, r := m.Minor/int64(n), m.Minor%int64(n) // Go truncates toward zero: r has the sign of m.Minor
	extra := int64(1)
	if r < 0 {
		extra, r = -1, -r
	}
	parts := make([]Money, n)
	for i := range parts {
		parts[i] = Money{Minor: q, Currency: m.Currency}
		if int64(i) < r {
			parts[i].Minor += extra
		}
	}
	return parts, nil
}
