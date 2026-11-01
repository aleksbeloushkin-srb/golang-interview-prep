// Package harness runs a package's real main in a child process: the test
// binary re-executes itself with ChildEnv set, and TestMain calls main there.
// Run sends one slow request, delivers SIGTERM while it is in the handler, and
// reports what the client got and how the process ended.
package harness

import (
	"bufio"
	"errors"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"testing"
	"time"
)

// ChildEnv carries the listen address to the child; its presence makes TestMain run main.
const ChildEnv = "Q49_CHILD_ADDR"

type Result struct {
	Status   int
	Body     string
	Err      error  // the client's error when no full response arrived
	Stdout   string // the handler's progress lines: "started", "finished"
	ExitCode int
}

func Run(t *testing.T) Result {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	addr := ln.Addr().String()
	ln.Close()

	cmd := exec.Command(os.Args[0])
	// A -race binary sleeps about a second in os.Exit by default (GORACE
	// atexit_sleep_ms), long enough for the slow request to finish and hide the bug.
	cmd.Env = append(os.Environ(), ChildEnv+"="+addr, "GORACE=atexit_sleep_ms=0")
	cmd.Stderr = os.Stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { cmd.Process.Kill() })
	lines := make(chan string, 16)
	go func() {
		sc := bufio.NewScanner(stdout)
		for sc.Scan() {
			lines <- sc.Text()
		}
		close(lines)
	}()

	waitListening(t, addr)
	type response struct {
		status int
		body   string
		err    error
	}
	got := make(chan response, 1)
	go func() {
		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Get("http://" + addr + "/slow")
		if err != nil {
			got <- response{err: err}
			return
		}
		defer resp.Body.Close()
		b, err := io.ReadAll(resp.Body)
		got <- response{status: resp.StatusCode, body: string(b), err: err}
	}()

	var out []string
	expect := func(want string) {
		for {
			select {
			case line, ok := <-lines:
				if !ok {
					t.Fatalf("child stdout closed before %q; got %q", want, out)
				}
				out = append(out, line)
				if line == want {
					return
				}
			case <-time.After(10 * time.Second):
				t.Fatalf("no %q from the child; got %q", want, out)
			}
		}
	}
	expect("started") // the request is in its handler now
	if err := cmd.Process.Signal(syscall.SIGTERM); err != nil {
		t.Fatal(err)
	}

	var r response
	select {
	case r = <-got:
	case <-time.After(15 * time.Second):
		t.Fatal("the client got neither a response nor an error")
	}
	for line := range lines { // until the child exits and its stdout closes
		out = append(out, line)
	}
	code := 0
	if err := cmd.Wait(); err != nil {
		var exit *exec.ExitError
		if !errors.As(err, &exit) {
			t.Fatal(err)
		}
		code = exit.ExitCode()
	}
	return Result{Status: r.status, Body: r.body, Err: r.err, Stdout: strings.Join(out, "\n"), ExitCode: code}
}

// waitListening polls until the child accepts connections.
func waitListening(t *testing.T, addr string) {
	t.Helper()
	deadline := time.Now().Add(10 * time.Second)
	for {
		c, err := net.Dial("tcp", addr)
		if err == nil {
			c.Close()
			return
		}
		if time.Now().After(deadline) {
			t.Fatalf("child never listened on %s: %v", addr, err)
		}
		time.Sleep(10 * time.Millisecond)
	}
}
