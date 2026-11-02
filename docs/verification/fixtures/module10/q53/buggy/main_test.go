package main

import (
	"maps"
	"os"
	"strings"
	"testing"

	"example.com/m10/q53/internal/run"
)

func TestMain(m *testing.M) {
	run.Child(main)
	os.Exit(m.Run())
}

// maps.Clone keeps nil, so the write into the clone of nil Params panics
// after the first line.
func TestSecondErrorPanics(t *testing.T) {
	r := run.Main(t)
	if want := "map[limit:1000 request_id:r-1]\n"; r.Stdout != want {
		t.Fatalf("stdout %q, want %q", r.Stdout, want)
	}
	if !strings.HasPrefix(r.Stderr, "panic: assignment to entry in nil map\n") || r.ExitCode != 2 {
		t.Fatalf("exit %d, stderr %q; want the nil map panic", r.ExitCode, r.Stderr)
	}
}

func TestCloneKeepsNilAndTheSharedErrorIntact(t *testing.T) {
	if maps.Clone(ErrInsufficientFunds.Params) != nil {
		t.Fatal("maps.Clone(nil) returned a non-nil map")
	}
	limit := &AppError{Code: "limit_exceeded", Params: map[string]string{"limit": "1000"}}
	logParams(limit, "r-1")
	if len(limit.Params) != 1 {
		t.Fatalf("limit.Params = %v, want it unchanged", limit.Params)
	}
}
