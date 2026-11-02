//go:build !go1.27

package main

import (
	"testing"

	"example.com/m10/q54/internal/run"
)

func TestNonBlockingReceiveWithAsyncTimerChan(t *testing.T) {
	r := run.Main(t, "GODEBUG=asynctimerchan=1")
	if want := "flush 2\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}
