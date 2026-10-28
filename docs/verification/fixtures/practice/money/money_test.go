package money

import "testing"

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
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.in.String(); got != tt.want {
				t.Errorf("String() = %q, want %q", got, tt.want)
			}
		})
	}
}

// Money implements fmt.Stringer, so %v and Println use String.
func TestStringer(t *testing.T) {
	var _ interface{ String() string } = Money{}
}
