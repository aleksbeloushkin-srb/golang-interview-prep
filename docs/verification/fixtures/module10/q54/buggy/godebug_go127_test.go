//go:build go1.27

package main

import (
	"strings"
	"testing"

	"example.com/m10/q54/internal/run"
)

// Go 1.27 removed asynctimerchan: the old value stops the program at start.
func TestAsyncTimerChanIsRemoved(t *testing.T) {
	r := run.Main(t, "GODEBUG=asynctimerchan=1")
	const want = `fatal error: removed GODEBUG "asynctimerchan" set to old value "1"`
	if r.ExitCode != 2 || r.Stdout != "" || !strings.HasPrefix(r.Stderr, want) {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}
