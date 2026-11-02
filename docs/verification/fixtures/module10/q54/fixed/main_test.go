package main

import (
	"os"
	"testing"

	"example.com/m10/q54/internal/run"
)

func TestMain(m *testing.M) {
	run.Child(main)
	os.Exit(m.Run())
}

// A non-blocking receive sees the fired timer with either channel kind.
func TestNonBlockingReceiveSeesTheTimer(t *testing.T) {
	r := run.Main(t)
	if want := "flush 2\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}
