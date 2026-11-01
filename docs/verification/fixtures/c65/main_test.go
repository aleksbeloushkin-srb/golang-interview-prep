package main

import (
	"io"
	"os"
	"strings"
	"testing"
)

// captureStdout runs f and returns what it printed to os.Stdout.
func captureStdout(t *testing.T, f func()) string {
	t.Helper()
	r, w, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	stdout := os.Stdout
	os.Stdout = w
	defer func() { os.Stdout = stdout }()
	f()
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
	out, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

func TestMainOutput(t *testing.T) {
	got := captureStdout(t, main)
	if want := "0\n1100\n1000\n"; got != want {
		t.Fatalf("main printed %q, want %q", got, want)
	}
}

// The promoted Charge runs with the embedded Account as its receiver,
// so Premium's Fee is never consulted: no virtual dispatch through embedding.
func TestTemplateMethodTrap(t *testing.T) {
	p := Premium{}
	if got := p.Charge(1000); got != 1100 {
		t.Fatalf("p.Charge(1000) = %d, want 1100", got)
	}
	if got := p.Account.Charge(1000); got != p.Charge(1000) {
		t.Fatalf("p.Account.Charge(1000) = %d, want the same as p.Charge(1000)", got)
	}
	if got := p.Account.Fee(); got != 100 {
		t.Fatalf("p.Account.Fee() = %d, want 100: the hidden method stays reachable", got)
	}
}

func TestFixThroughInterface(t *testing.T) {
	if got := Charge(Premium{}, 1000); got != 1000 {
		t.Fatalf("Charge(Premium{}, 1000) = %d, want 1000", got)
	}
	if got := Charge(Account{}, 1000); got != 1100 {
		t.Fatalf("Charge(Account{}, 1000) = %d, want 1100", got)
	}
}

// A Premium is not an Account, but it satisfies an interface through promoted methods.
func TestPromotedMethodSatisfiesInterface(t *testing.T) {
	var v any = Premium{}
	if _, ok := v.(Account); ok {
		t.Fatal("a Premium value must not be an Account")
	}
	if _, ok := v.(interface{ Charge(int64) int64 }); !ok {
		t.Fatal("Premium must have the promoted Charge in its method set")
	}
}

// Nil embedded pointer: a promoted value-receiver method needs *p.Account and panics;
// a pointer-receiver method runs with a nil receiver and panics only when it dereferences it.
type pAccount struct{ ID string }

func (a pAccount) Value() string    { return "value receiver" }
func (a *pAccount) NoDeref() string { return "nil receiver is fine" }
func (a *pAccount) Deref() string   { return a.ID }

type pPremium struct{ *pAccount }

func panics(f func()) (yes bool) {
	defer func() { yes = recover() != nil }()
	f()
	return false
}

func TestNilEmbeddedPointer(t *testing.T) {
	var p pPremium
	if panics(func() { _ = p.NoDeref() }) {
		t.Fatal("a pointer-receiver method that does not dereference must not panic")
	}
	for name, f := range map[string]func(){
		"value-receiver method": func() { _ = p.Value() },
		"dereferencing method":  func() { _ = p.Deref() },
		"promoted field":        func() { _ = p.ID },
	} {
		if !panics(f) {
			t.Fatalf("%s through a nil embedded pointer must panic", name)
		}
	}
}

// Embedded interface: a decorator replaces Read and forwards Close to the wrapped value;
// a partial fake satisfies the interface, but an unimplemented method hits a nil interface.
type countingReader struct {
	io.ReadCloser
	n int
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.ReadCloser.Read(p)
	c.n += n
	return n, err
}

type closeSpy struct {
	io.Reader
	closed bool
}

func (s *closeSpy) Close() error { s.closed = true; return nil }

type store interface {
	Get(id string) string
	Put(id, v string)
}

type fakeStore struct{ store }

func (fakeStore) Get(id string) string { return "v" + id }

func TestEmbeddedInterface(t *testing.T) {
	spy := &closeSpy{Reader: strings.NewReader("hello")}
	var rc io.ReadCloser = &countingReader{ReadCloser: spy}
	b, err := io.ReadAll(rc)
	if err != nil || string(b) != "hello" || rc.(*countingReader).n != 5 {
		t.Fatalf("decorator: got %q, n=%d, err=%v", b, rc.(*countingReader).n, err)
	}
	if err := rc.Close(); err != nil || !spy.closed {
		t.Fatalf("Close must be forwarded to the wrapped value: err=%v closed=%v", err, spy.closed)
	}
	var s store = fakeStore{}
	if got := s.Get("1"); got != "v1" {
		t.Fatalf("Get = %q", got)
	}
	if !panics(func() { s.Put("1", "x") }) {
		t.Fatal("Put through the nil embedded interface must panic")
	}
}

// Shadowing by depth: the outer declaration wins; the embedded one is still reachable.
type logger struct{}

func (logger) Log() string { return "logger" }

type handler struct{ logger }

func (handler) Log() string { return "handler" }

func TestShadowing(t *testing.T) {
	h := handler{}
	if h.Log() != "handler" || h.logger.Log() != "logger" {
		t.Fatalf("got %q and %q", h.Log(), h.logger.Log())
	}
}
