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

// With go 1.23 or later in go.mod the timer channel is synchronous: len and
// cap are always 0, so the check never sees the fired timer.
func TestLenOfTimerChannelIsZero(t *testing.T) {
	r := run.Main(t)
	if want := "len: 0 cap: 0\nkeep collecting\n"; r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}
