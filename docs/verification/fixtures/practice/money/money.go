// Package money is the reference solution for practice task W1-1.
package money

import "fmt"

// Money is an amount in minor units (cents) plus an ISO currency code.
// Integers keep sums exact; float64 cannot represent 0.10 exactly.
type Money struct {
	Minor    int64
	Currency string
}

// digits is the number of minor-unit digits per currency; unknown codes use 2.
var digits = map[string]int{"JPY": 0, "BHD": 3}

func pow10(n int) int64 {
	p := int64(1)
	for range n {
		p *= 10
	}
	return p
}

// String formats the amount with the currency's number of decimals: 1250 EUR → "12.50 EUR".
func (m Money) String() string {
	d, ok := digits[m.Currency]
	if !ok {
		d = 2
	}
	sign := ""
	v := m.Minor
	if v < 0 {
		sign = "-"
		v = -v // note: math.MinInt64 cannot be negated; amounts here are far smaller
	}
	if d == 0 {
		return fmt.Sprintf("%s%d %s", sign, v, m.Currency)
	}
	unit := pow10(d)
	return fmt.Sprintf("%s%d.%0*d %s", sign, v/unit, d, v%unit, m.Currency)
}
