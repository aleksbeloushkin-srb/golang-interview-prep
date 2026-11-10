package money

import (
	"math"
	"testing"
)

func TestString(t *testing.T) {
	tests := []struct {
		name string
		in   Money
		want string
	}{
		{"whole and cents", Money{1250, "EUR"}, "12.50 EUR"},
		{"only cents", Money{5, "EUR"}, "0.05 EUR"},
		{"zero", Money{0, "USD"}, "0.00 USD"},
		{"negative", Money{-1250, "EUR"}, "-12.50 EUR"},
		{"negative below one", Money{-5, "EUR"}, "-0.05 EUR"},
		{"no minor units", Money{1250, "JPY"}, "1250 JPY"},
		{"three decimals", Money{1250, "BHD"}, "1.250 BHD"},
		// 2^53+1 is the smallest positive integer float64 cannot hold: formatting through float64 loses the last cent.
		{"beyond float64 precision", Money{9007199254740993, "EUR"}, "90071992547409.93 EUR"},
		{"beyond float64 precision, no minor units", Money{9007199254740993, "JPY"}, "9007199254740993 JPY"},
		{"largest int64", Money{math.MaxInt64, "EUR"}, "92233720368547758.07 EUR"},
		{"most negative supported", Money{-math.MaxInt64, "BHD"}, "-9223372036854775.807 BHD"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.in.String(); got != tt.want {
				t.Errorf("Money{%d, %q}.String() = %q, want %q", tt.in.Minor, tt.in.Currency, got, tt.want)
			}
		})
	}
}

// Money implements fmt.Stringer, so %v and Println use String.
func TestStringer(t *testing.T) {
	var _ interface{ String() string } = Money{}
}
