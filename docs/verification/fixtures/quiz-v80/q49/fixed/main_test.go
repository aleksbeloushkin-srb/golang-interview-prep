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

// The fix: main waits for Shutdown, so the request in flight gets its response.
func TestMainWaitsForShutdown(t *testing.T) {
	r := harness.Run(t)
	if r.Err != nil || r.Status != 200 || r.Body != "done" {
		t.Fatalf("got %d %q, err %v; want 200 \"done\"", r.Status, r.Body, r.Err)
	}
	if !strings.Contains(r.Stdout, "finished") {
		t.Fatalf("stdout %q: the handler did not finish", r.Stdout)
	}
	if r.ExitCode != 0 {
		t.Fatalf("exit code %d, want 0", r.ExitCode)
	}
}
