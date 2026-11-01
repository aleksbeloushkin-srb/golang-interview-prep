// Package child runs Squares in a child process, because a panic in a worker
// goroutine cannot be recovered by the test and ends the whole process. The
// test binary re-executes itself with Env set; TestMain calls Main there.
package child

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"testing"
	"time"
)

// Env carries the input to the child: comma-separated numbers, or "" for none.
const Env = "Q51_CHILD_NUMS"

// Main is the child's body: call squares like a long-running service would,
// report the result, and keep running for a while, as a service does.
func Main(squares func([]int) []int) {
	var nums []int
	if s := os.Getenv(Env); s != "" {
		for _, f := range strings.Split(s, ",") {
			n, err := strconv.Atoi(f)
			if err != nil {
				panic(err)
			}
			nums = append(nums, n)
		}
	}
	res := squares(nums)
	fmt.Printf("returned %d of %d\n", len(res), len(nums))
	time.Sleep(3 * time.Second) // the service keeps serving; an observation window
	os.Exit(0)
}

type Result struct {
	ExitCode int
	Stdout   string
	Panic    string // the "panic: …" line from stderr, if any
}

// Run starts the child with nums and waits for it to exit.
func Run(t *testing.T, nums string) Result {
	t.Helper()
	cmd := exec.Command(os.Args[0])
	cmd.Env = append(os.Environ(), Env+"="+nums)
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
	r := Result{ExitCode: code, Stdout: strings.TrimSpace(stdout.String())}
	for _, line := range strings.Split(stderr.String(), "\n") {
		if strings.HasPrefix(line, "panic: ") {
			r.Panic = line
			break
		}
	}
	return r
}
