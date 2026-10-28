package httperr

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http/httptest"
	"strings"
	"testing"
)

// fakeLedger returns a prepared error and records the call.
type fakeLedger struct {
	err   error
	calls int
}

func (f *fakeLedger) Transfer(ctx context.Context, from, to string, amount int64) error {
	f.calls++
	return f.err
}

func newLog() (*slog.Logger, *bytes.Buffer) {
	var buf bytes.Buffer
	return slog.New(slog.NewJSONHandler(&buf, nil)), &buf
}

func post(t *testing.T, l Ledger, log *slog.Logger, body string) (int, map[string]string) {
	t.Helper()
	rec := httptest.NewRecorder()
	TransferHandler(l, log).ServeHTTP(rec, httptest.NewRequest("POST", "/transfers", strings.NewReader(body)))
	// Result().Header is what was sent: headers set after WriteHeader are not in it.
	if ct := rec.Result().Header.Get("Content-Type"); ct != "application/json" {
		t.Fatalf("Content-Type = %q", ct)
	}
	var out map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("body is not JSON: %q", rec.Body.String())
	}
	return rec.Code, out
}

func TestStatusMapsWrappedErrors(t *testing.T) {
	for _, tt := range []struct {
		err  error
		want int
	}{
		{fmt.Errorf("transfer: %w", &ValidationError{"amount", "must be positive"}), 400},
		{fmt.Errorf("transfer A→B: %w", ErrNotFound), 404},
		{fmt.Errorf("transfer A→B: %w", ErrInsufficientFunds), 409},
		{errors.Join(errors.New("audit"), fmt.Errorf("debit: %w", ErrInsufficientFunds)), 409},
		{errors.New("pq: connection refused"), 500},
	} {
		if got := Status(tt.err); got != tt.want {
			t.Errorf("Status(%v) = %d, want %d", tt.err, got, tt.want)
		}
	}
}

func TestTransferOK(t *testing.T) {
	log, buf := newLog()
	code, body := post(t, &fakeLedger{}, log, `{"from":"a","to":"b","amount":500}`)
	if code != 200 || body["status"] != "ok" || buf.Len() != 0 {
		t.Fatalf("got %d %v, log %q", code, body, buf)
	}
}

func TestClientErrorsAreExplainedAndNotLogged(t *testing.T) {
	for name, tt := range map[string]struct {
		ledgerErr error
		body      string
		code      int
		field     string
	}{
		"bad JSON":           {nil, `{`, 400, "body"},
		"zero amount":        {nil, `{"from":"a","to":"b","amount":0}`, 400, "amount"},
		"unknown account":    {fmt.Errorf("transfer: %w", ErrNotFound), `{"from":"a","to":"x","amount":5}`, 404, ""},
		"insufficient funds": {fmt.Errorf("transfer: %w", ErrInsufficientFunds), `{"from":"a","to":"b","amount":5}`, 409, ""},
	} {
		log, buf := newLog()
		code, body := post(t, &fakeLedger{err: tt.ledgerErr}, log, tt.body)
		if code != tt.code || body["error"] == "" || body["field"] != tt.field {
			t.Errorf("%s: got %d %v, want %d with field %q", name, code, body, tt.code, tt.field)
		}
		if buf.Len() != 0 {
			t.Errorf("%s: a client error was logged: %s", name, buf)
		}
	}
}

func TestInvalidAmountDoesNotReachTheLedger(t *testing.T) {
	log, _ := newLog()
	l := &fakeLedger{}
	post(t, l, log, `{"from":"a","to":"b","amount":-5}`)
	if l.calls != 0 {
		t.Fatal("the ledger was called with an invalid amount")
	}
}

func TestInternalErrorIsHiddenAndLoggedOnce(t *testing.T) {
	log, buf := newLog()
	code, body := post(t, &fakeLedger{err: errors.New("pq: connection refused to 10.0.3.7")}, log, `{"from":"a","to":"b","amount":5}`)
	if code != 500 {
		t.Fatalf("code = %d, want 500", code)
	}
	if strings.Contains(body["error"], "pq") || strings.Contains(body["error"], "10.0.3.7") {
		t.Fatalf("the 500 body leaks the cause: %v", body)
	}
	if n := strings.Count(buf.String(), "\n"); n != 1 || !strings.Contains(buf.String(), "10.0.3.7") {
		t.Fatalf("want exactly one log record with the cause, got %d:\n%s", n, buf)
	}
}

func TestTransferUsesTheRequestContext(t *testing.T) {
	log, _ := newLog()
	var seen context.Context
	l := ledgerFunc(func(ctx context.Context) error { seen = ctx; return nil })
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/transfers", strings.NewReader(`{"from":"a","to":"b","amount":5}`)).WithContext(ctx)
	TransferHandler(l, log).ServeHTTP(rec, req)
	if seen == nil || seen.Err() == nil {
		t.Fatal("the ledger did not get the request's context")
	}
}

type ledgerFunc func(ctx context.Context) error

func (f ledgerFunc) Transfer(ctx context.Context, from, to string, amount int64) error { return f(ctx) }
