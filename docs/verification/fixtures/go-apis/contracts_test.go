package apis

import (
	"bytes"
	"errors"
	"io"
	"iter"
	"runtime"
	"runtime/trace"
	"testing"
	"time"
	"unique"
	"weak"
)

func panics(f func()) (yes bool) {
	defer func() { yes = recover() != nil }()
	f()
	return false
}

func TestInterfaceValues(t *testing.T) {
	var p *int
	var x any = p
	if x == nil {
		t.Fatal("typed nil lost its type")
	}
	if v, ok := x.(*int); !ok || v != nil {
		t.Fatal(v, ok)
	}
	if _, ok := x.(int); ok {
		t.Fatal("wrong assertion succeeded")
	}
	var slice any = []int{1}
	if slice == nil || !panics(func() { _ = slice == slice }) {
		t.Fatal("incomparable dynamic value")
	}
}

func namedResult(copyArgument bool) (n int) {
	if copyArgument {
		defer func(v int) { v++ }(n)
	} else {
		defer func() { n++ }()
	}
	return 0
}

func indirectRecover() any { return recover() }
func TestDeferAndRecovery(t *testing.T) {
	if namedResult(false) != 1 || namedResult(true) != 0 {
		t.Fatal("result mutation")
	}
	var order []int
	func() {
		for i := 0; i < 3; i++ {
			defer func(v int) { order = append(order, v) }(i)
		}
	}()
	if len(order) != 3 || order[0] != 2 || order[1] != 1 || order[2] != 0 {
		t.Fatal(order)
	}
	var got any
	func() { defer func() { got = recover() }(); panic("direct") }()
	if got != "direct" {
		t.Fatal(got)
	}
	var indirect any
	if !panics(func() { defer func() { indirect = indirectRecover() }(); panic("indirect") }) || indirect != nil {
		t.Fatal("helper unexpectedly recovered")
	}
}

func TestWeakUniqueAndCleanupOwnership(t *testing.T) {
	obj := &struct {
		Value int
		Pad   [32]byte
	}{Value: 42}
	w := weak.Make(obj)
	got := w.Value()
	if got != obj {
		t.Fatal("live target")
	}
	runtime.KeepAlive(obj)
	if weak.Make[int](nil).Value() != nil {
		t.Fatal("nil weak pointer")
	}
	if unique.Make("go") != unique.Make(string([]byte{'g', 'o'})) {
		t.Fatal("equal values differ")
	}
	if unique.Make("go") == unique.Make("rust") {
		t.Fatal("unequal values match")
	}
	if !panics(func() {
		runtime.AddCleanup(obj, func(_ *struct {
			Value int
			Pad   [32]byte
		}) {
		}, obj)
	}) {
		t.Fatal("direct self-retention must panic")
	}
	// Do not test eventual cleanup or nil-after-one-GC: neither is guaranteed.
}

func TestPullEarlyStopAndPanic(t *testing.T) {
	ended := false
	seq := func(yield func(int) bool) {
		defer func() { ended = true }()
		for i := 1; i <= 3; i++ {
			if !yield(i) {
				return
			}
		}
	}
	next, stop := iter.Pull(seq)
	defer stop()
	if v, ok := next(); v != 1 || !ok {
		t.Fatal(v, ok)
	}
	if ended {
		t.Fatal("iterator ended before stop")
	}
	stop()
	if !ended {
		t.Fatal("iterator defer not run")
	}
	stop()
	if v, ok := next(); v != 0 || ok {
		t.Fatal(v, ok)
	}
	nextP, stopP := iter.Pull(func(func(int) bool) { panic("iterator") })
	defer stopP()
	if !panics(func() { nextP() }) {
		t.Fatal("iterator panic was not propagated")
	}
}

type failingWriter struct{ err error }

func (w failingWriter) Write([]byte) (int, error) { return 0, w.err }

func TestFlightRecorderLifecycleAndWriterError(t *testing.T) {
	fr := trace.NewFlightRecorder(trace.FlightRecorderConfig{MinAge: time.Second, MaxBytes: 1 << 20})
	if _, err := fr.WriteTo(io.Discard); err == nil {
		t.Fatal("inactive recorder should fail")
	}
	if err := fr.Start(); err != nil {
		t.Fatal(err)
	}
	defer fr.Stop()
	if err := fr.Start(); err == nil {
		t.Fatal("duplicate Start should fail")
	}
	var buf bytes.Buffer
	n, err := fr.WriteTo(&buf)
	if err != nil || n == 0 || int64(buf.Len()) != n {
		t.Fatal(n, err)
	}
	want := errors.New("writer failed")
	if _, err := fr.WriteTo(failingWriter{want}); !errors.Is(err, want) {
		t.Fatal(err)
	}
	fr.Stop()
	if fr.Enabled() {
		t.Fatal("recorder still enabled")
	}
	if _, err := fr.WriteTo(io.Discard); err == nil {
		t.Fatal("stopped recorder should fail")
	}
}

// These additional implementation guards are verified on Go 1.26.1.
func TestCleanupDirectRetentionGuardsGo126(t *testing.T) {
	type target struct {
		Value int
		Pad   [32]byte
	}
	obj := &target{Value: 1}
	if !panics(func() { runtime.AddCleanup(obj, func(_ int) { obj.Value++ }, 0) }) {
		t.Fatal("direct closure capture was not rejected")
	}
	other := &target{Value: 2}
	if !panics(func() { runtime.AddCleanup(other, func(_ *byte) {}, &other.Pad[0]) }) {
		t.Fatal("interior pointer argument was not rejected")
	}
	runtime.KeepAlive(obj)
	runtime.KeepAlive(other)
}
