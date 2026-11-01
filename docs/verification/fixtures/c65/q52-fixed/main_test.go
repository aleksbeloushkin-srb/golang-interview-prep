package main

import (
	"io"
	"os"
	"testing"
)

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

func TestOutput(t *testing.T) {
	got := captureStdout(t, main)
	if want := "sms: paid\nemail: paid\n"; got != want {
		t.Fatalf("main printed %q, want %q", got, want)
	}
}
