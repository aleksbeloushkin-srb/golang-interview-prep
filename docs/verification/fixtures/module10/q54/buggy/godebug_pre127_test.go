//go:build !go1.27

package main

import (
	"testing"

	"example.com/m10/q54/internal/run"
)

// Before Go 1.27, asynctimerchan=1 restores the pre-1.23 buffered channel.
func TestAsyncTimerChanRestoresBuffer(t *testing.T) {
	r := run.Main(t, "GODEBUG=asynctimerchan=1")
	if want := "len: 1 cap: 1\nflush 2\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}
