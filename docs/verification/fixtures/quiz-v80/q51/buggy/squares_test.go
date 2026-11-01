package squares

import (
	"os"
	"testing"

	"example.com/rvquiz/q51/internal/child"
)

func TestMain(m *testing.M) {
	if _, ok := os.LookupEnv(child.Env); ok {
		child.Main(Squares)
	}
	os.Exit(m.Run())
}

const (
	closeClosed = "panic: close of closed channel"
	sendClosed  = "panic: send on closed channel"
)

// Even with no input every worker reaches its deferred close: the second
// close always panics.
func TestEmptyInputPanicsOnSecondClose(t *testing.T) {
	for range 10 {
		r := child.Run(t, "")
		if r.Panic != closeClosed || r.ExitCode == 0 {
			t.Fatalf("exit %d, panic %q, stdout %q; want %q", r.ExitCode, r.Panic, r.Stdout, closeClosed)
		}
	}
}

// With input, whichever comes first crashes the process: a second close, or a
// send by a worker that is still running. Squares may even return first, with
// part of the results.
func TestSixNumbersCrashTheProcess(t *testing.T) {
	const runs = 50
	seen := map[string]int{}
	returned := map[string]int{}
	for range runs {
		r := child.Run(t, "1,2,3,4,5,6")
		if r.ExitCode == 0 || (r.Panic != closeClosed && r.Panic != sendClosed) {
			t.Fatalf("exit %d, panic %q, stdout %q; want a channel panic", r.ExitCode, r.Panic, r.Stdout)
		}
		seen[r.Panic]++
		if r.Stdout != "" {
			returned[r.Stdout]++
		}
	}
	t.Logf("%d runs: panics %v; Squares returned before the crash: %v", runs, seen, returned)
}
