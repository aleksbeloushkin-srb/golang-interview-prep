// Package gstate lets tests wait until a goroutine is parked in a given state,
// read from the goroutine profile (the data of /debug/pprof/goroutine?debug=2).
package gstate

import (
	"bytes"
	"runtime/pprof"
	"strings"
	"testing"
	"time"
)

// WaitFor waits until some goroutine whose stack contains frame is parked in
// state, such as "chan send" or "sync.Mutex.Lock".
func WaitFor(t *testing.T, frame, state string) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !Has(frame, state) {
		if time.Now().After(deadline) {
			t.Fatalf("no goroutine in %s is parked in [%s]:\n%s", frame, state, dump())
		}
		time.Sleep(time.Millisecond)
	}
}

// Has reports whether some goroutine whose stack contains frame is parked in state.
func Has(frame, state string) bool {
	for _, g := range strings.Split(dump(), "\n\n") {
		header, stack, _ := strings.Cut(g, "\n")
		if strings.Contains(header, "["+state) && strings.Contains(stack, frame) {
			return true
		}
	}
	return false
}

func dump() string {
	var b bytes.Buffer
	pprof.Lookup("goroutine").WriteTo(&b, 2)
	return b.String()
}
