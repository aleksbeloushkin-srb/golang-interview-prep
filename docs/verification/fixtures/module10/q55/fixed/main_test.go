package main

import (
	"log/slog"
	"os"
	"testing"

	"example.com/m10/q55/internal/run"
)

func TestMain(m *testing.M) {
	run.Child(main)
	os.Exit(m.Run())
}

func TestTokenIsRedacted(t *testing.T) {
	r := run.Main(t)
	if want := "level=INFO msg=auth user=aleks token=[REDACTED]\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}

// With a value receiver both the value and the pointer are LogValuers.
func TestValueAndPointerAreLogValuers(t *testing.T) {
	tok := Token("x")
	for _, v := range []any{tok, &tok} {
		if _, ok := v.(slog.LogValuer); !ok {
			t.Fatalf("%T does not implement slog.LogValuer", v)
		}
	}
}
