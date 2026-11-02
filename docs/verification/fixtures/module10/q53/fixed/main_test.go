package main

import (
	"os"
	"testing"

	"example.com/m10/q53/internal/run"
)

func TestMain(m *testing.M) {
	run.Child(main)
	os.Exit(m.Run())
}

func TestBothErrorsGetTheRequestID(t *testing.T) {
	r := run.Main(t)
	want := "map[limit:1000 request_id:r-1]\nmap[request_id:r-2]\n"
	if r.Stdout != want || r.ExitCode != 0 {
		t.Fatalf("exit %d, stdout %q, stderr %q; want %q", r.ExitCode, r.Stdout, r.Stderr, want)
	}
}

func TestSharedErrorsStayUnchanged(t *testing.T) {
	limit := &AppError{Code: "limit_exceeded", Params: map[string]string{"limit": "1000"}}
	logParams(limit, "r-1")
	logParams(ErrInsufficientFunds, "r-2")
	if len(limit.Params) != 1 || ErrInsufficientFunds.Params != nil {
		t.Fatalf("limit.Params = %v, ErrInsufficientFunds.Params = %v; want them unchanged",
			limit.Params, ErrInsufficientFunds.Params)
	}
}
