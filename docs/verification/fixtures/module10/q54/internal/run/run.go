// Package run executes a program's main in a child process: a panic ends
// the whole process, and GODEBUG must be set before the runtime starts.
// The test binary re-executes itself with Env set; TestMain calls Child.
package run

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"testing"
)

// Env marks the child process.
const Env = "M10_QUIZ_RUN_MAIN"

// Child runs main and exits when the test binary was started by Main.
func Child(main func()) {
	if os.Getenv(Env) == "1" {
		main()
		os.Exit(0)
	}
}

// Result is what the child printed and how it exited.
type Result struct {
	Stdout, Stderr string
	ExitCode       int
}

// Main runs the program's main in a child process with extra environment
// variables, such as "GODEBUG=asynctimerchan=1".
func Main(t *testing.T, env ...string) Result {
	t.Helper()
	cmd := exec.Command(os.Args[0])
	// A race-enabled child otherwise sleeps about a second in os.Exit.
	cmd.Env = append(os.Environ(), Env+"=1", "GORACE=atexit_sleep_ms=0")
	cmd.Env = append(cmd.Env, env...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout, cmd.Stderr = &stdout, &stderr
	code := 0
	if err := cmd.Run(); err != nil {
		var exit *exec.ExitError
		if !errors.As(err, &exit) {
			t.Fatal(err)
		}
		code = exit.ExitCode()
	}
	return Result{Stdout: stdout.String(), Stderr: stderr.String(), ExitCode: code}
}
