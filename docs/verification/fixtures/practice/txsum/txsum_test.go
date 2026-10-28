package txsum

import (
	"bytes"
	"errors"
	"strings"
	"testing"
)

func TestParseAmount(t *testing.T) {
	tests := []struct {
		in      string
		want    int64
		wantErr bool
	}{
		{"12.50", 1250, false},
		{"12.5", 1250, false},
		{"12", 1200, false},
		{"0.05", 5, false},
		{"-3.10", -310, false},
		{"1.234", 0, true},
		{"abc", 0, true},
		{"", 0, true},
		{"1.", 0, true},
		{".5", 0, true},
		{"1.-5", 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, err := ParseAmount(tt.in)
			if (err != nil) != tt.wantErr || got != tt.want {
				t.Fatalf("ParseAmount(%q) = %d, %v; want %d, error %v", tt.in, got, err, tt.want, tt.wantErr)
			}
			if err != nil && !errors.Is(err, ErrAmount) {
				t.Fatalf("error %v does not wrap ErrAmount", err)
			}
		})
	}
}

const input = `account,amount,currency
alice,10.00,EUR
bob,5,USD
alice,2.50,EUR
carol,7.00
dave,ten,EUR
erin,1.00,GBP

alice,-0.50,EUR
`

func TestSumCollectsAllErrors(t *testing.T) {
	totals, errs := Sum(strings.NewReader(input))
	if got := totals[Key{"alice", "EUR"}]; got != 1200 {
		t.Errorf("alice EUR = %d, want 1200", got)
	}
	if got := totals[Key{"bob", "USD"}]; got != 500 {
		t.Errorf("bob USD = %d, want 500", got)
	}
	if len(totals) != 2 {
		t.Errorf("got %d totals, want 2: bad lines must be skipped", len(totals))
	}
	want := []struct {
		line  int
		cause error
	}{{5, ErrColumns}, {6, ErrAmount}, {7, ErrCurrency}}
	if len(errs) != len(want) {
		t.Fatalf("got %d errors %v, want %d", len(errs), errs, len(want))
	}
	for i, w := range want {
		var le *LineError
		if !errors.As(errs[i], &le) || le.Line != w.line {
			t.Errorf("error %d = %v, want a *LineError for line %d", i, errs[i], w.line)
		}
		if !errors.Is(errs[i], w.cause) {
			t.Errorf("error %d = %v, want cause %v", i, errs[i], w.cause)
		}
	}
}

func TestRun(t *testing.T) {
	var out, errOut bytes.Buffer
	if code := Run(strings.NewReader(input), &out, &errOut); code != 1 {
		t.Fatalf("exit code %d, want 1 with bad lines", code)
	}
	if want := "alice EUR 12.00\nbob USD 5.00\n"; out.String() != want {
		t.Fatalf("stdout %q, want %q", out.String(), want)
	}
	if lines := strings.Count(errOut.String(), "\n"); lines != 3 {
		t.Fatalf("stderr has %d lines, want 3:\n%s", lines, errOut.String())
	}

	out.Reset()
	errOut.Reset()
	if code := Run(strings.NewReader("zed,-1.50,RSD\n"), &out, &errOut); code != 0 {
		t.Fatalf("exit code %d for valid input, want 0; stderr: %s", code, errOut.String())
	}
	if out.String() != "zed RSD -1.50\n" {
		t.Fatalf("stdout %q", out.String())
	}
}
