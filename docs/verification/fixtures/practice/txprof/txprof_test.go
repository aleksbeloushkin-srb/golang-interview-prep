package txprof

import (
	"bytes"
	"errors"
	"fmt"
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

// input builds n valid lines for three accounts and two currencies.
func benchInput(n int) string {
	var b strings.Builder
	b.WriteString("account,amount,currency\n")
	accounts := []string{"alice", "bob", "carol"}
	currencies := []string{"EUR", "USD"}
	for i := range n {
		fmt.Fprintf(&b, "%s,%d.%02d,%s\n", accounts[i%3], i%1000, i%100, currencies[i%2])
	}
	return b.String()
}

func TestSumBenchInput(t *testing.T) {
	totals, errs := Sum(strings.NewReader(benchInput(600)))
	if len(errs) != 0 || len(totals) != 6 {
		t.Fatalf("got %d totals and errors %v; want 6 totals, no errors", len(totals), errs)
	}
}

// The goal of W4-6: at most one allocation per valid line (the line's text),
// plus a small constant for the scanner and the map.
func TestAllocsPerLine(t *testing.T) {
	const lines = 1000
	input := benchInput(lines)
	allocs := testing.AllocsPerRun(20, func() {
		Sum(strings.NewReader(input))
	})
	if perLine := allocs / lines; perLine > 1.05 {
		t.Fatalf("%.2f allocations per line (%v per call), want at most about 1", perLine, allocs)
	}
}

// go test -bench=Sum -benchmem -cpuprofile cpu.out -memprofile mem.out
func BenchmarkSum(b *testing.B) {
	input := benchInput(10_000)
	b.SetBytes(int64(len(input)))
	b.ReportAllocs()
	for b.Loop() {
		Sum(strings.NewReader(input))
	}
}
