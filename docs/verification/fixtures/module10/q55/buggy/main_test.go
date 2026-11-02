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

// LogValue is in the method set of *Token only, so the Token value is
// logged as a plain string.
func TestTokenLeaks(t *testing.T) {
	r := run.Main(t)
	if want := "level=INFO msg=auth user=aleks token=tok-8f3a91\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}

func TestOnlyThePointerIsALogValuer(t *testing.T) {
	tok := Token("x")
	if _, ok := any(tok).(slog.LogValuer); ok {
		t.Fatal("Token implements slog.LogValuer")
	}
	if _, ok := any(&tok).(slog.LogValuer); !ok {
		t.Fatal("*Token does not implement slog.LogValuer")
	}
}
