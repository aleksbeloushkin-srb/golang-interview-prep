package main

import (
	"os"
	"strings"
	"testing"

	"example.com/rvquiz/q49/internal/harness"
)

func TestMain(m *testing.M) {
	if a, ok := os.LookupEnv(harness.ChildEnv); ok {
		addr = a
		main()
		os.Exit(0) // what the runtime does when main returns
	}
	os.Exit(m.Run())
}

// The bug: SIGTERM starts Shutdown, ListenAndServe returns ErrServerClosed at
// once, main returns, and the process exits before the request in flight ends.
func TestMainExitsBeforeShutdownFinishes(t *testing.T) {
	r := harness.Run(t)
	if r.Err == nil {
		t.Fatalf("the request in flight got %d %q; want it cut off", r.Status, r.Body)
	}
	if strings.Contains(r.Stdout, "finished") {
		t.Fatalf("handler finished (stdout %q); want the process gone first", r.Stdout)
	}
	if r.ExitCode != 0 {
		t.Fatalf("exit code %d; the bug exits 0, like a clean stop", r.ExitCode)
	}
	t.Logf("client error: %v; exit code %d", r.Err, r.ExitCode)
}
