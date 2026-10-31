package app

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"slices"
	"strconv"
	"strings"
	"testing"
)

// newLog returns a logger and a function that lists the resources it saw closed, in order.
func newLog() (*slog.Logger, func() []string) {
	var buf bytes.Buffer
	log := slog.New(slog.NewTextHandler(&buf, nil))
	return log, func() []string {
		var closed []string
		for _, line := range strings.Split(buf.String(), "\n") {
			if _, name, ok := strings.Cut(line, " msg=closed resource="); ok {
				closed = append(closed, name)
			}
		}
		return closed
	}
}

func TestNewClosesWhatItOpenedOnError(t *testing.T) {
	cancelled, cancel := context.WithCancel(context.Background())
	cancel()
	tests := []struct {
		name       string
		ctx        context.Context
		cfg        Config
		wantErr    string
		wantClosed []string
	}{
		{name: "step 1, db", ctx: context.Background(), cfg: Config{DSN: "postgres://x", RiskURL: "http://risk.local"},
			wantErr: "open db", wantClosed: nil},
		{name: "step 2, store", ctx: cancelled, cfg: Config{DSN: "mem://ledger", RiskURL: "http://risk.local"},
			wantErr: "store", wantClosed: []string{"db"}},
		{name: "step 3, risk client", ctx: context.Background(), cfg: Config{DSN: "mem://ledger", RiskURL: "risk.local"},
			wantErr: "risk client", wantClosed: []string{"store", "db"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			log, closed := newLog()
			a, err := New(tt.ctx, tt.cfg, log)
			if err == nil || !strings.HasPrefix(err.Error(), tt.wantErr+":") {
				t.Fatalf("New() error = %v, want prefix %q", err, tt.wantErr)
			}
			if a != nil {
				t.Fatal("New() returned an App together with an error")
			}
			if got := closed(); !slices.Equal(got, tt.wantClosed) {
				t.Fatalf("closed %q, want %q", got, tt.wantClosed)
			}
		})
	}
}

func TestAppServesAndClosesInReverseOrder(t *testing.T) {
	risk := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if amount, _ := strconv.ParseInt(r.URL.Query().Get("amount"), 10, 64); amount > 1000 {
			w.WriteHeader(http.StatusForbidden)
		}
	}))
	defer risk.Close()

	log, closed := newLog()
	a, err := New(context.Background(), Config{DSN: "mem://ledger", RiskURL: risk.URL}, log)
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		body string
		want int
	}{
		{`{"from":"alice","to":"bob","amount":500}`, http.StatusCreated},
		{`{"from":"alice","to":"bob","amount":5000}`, http.StatusUnprocessableEntity},
		{`{"from":"alice","to":"bob","amount":0}`, http.StatusBadRequest},
	} {
		rec := httptest.NewRecorder()
		a.Handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/transfers", strings.NewReader(tc.body)))
		if rec.Code != tc.want {
			t.Errorf("POST %s: status %d, want %d", tc.body, rec.Code, tc.want)
		}
	}

	if err := a.Close(); err != nil {
		t.Fatal(err)
	}
	if err := a.Close(); err != nil {
		t.Fatalf("second Close() = %v", err)
	}
	want := []string{"risk", "store", "db"}
	if got := closed(); !slices.Equal(got, want) {
		t.Fatalf("closed %q, want %q", got, want)
	}
}

func TestCleanupKeepsClosingAfterAnError(t *testing.T) {
	log, closed := newLog()
	errFlush := errors.New("flush failed")
	var c cleanup
	c.log = log
	c.push("first", func() error { return nil })
	c.push("second", func() error { return errFlush })
	c.push("third", func() error { return nil })

	err := c.run()
	if !errors.Is(err, errFlush) || err.Error() != "close second: flush failed" {
		t.Fatalf("run() = %v, want close second: flush failed", err)
	}
	if got, want := closed(), []string{"third", "first"}; !slices.Equal(got, want) {
		t.Fatalf("closed %q, want %q", got, want)
	}
}

func TestLoadConfig(t *testing.T) {
	env := map[string]string{"LEDGER_ADDR": ":8080", "LEDGER_DSN": "mem://ledger", "LEDGER_RISK_URL": "http://risk.local"}
	cfg, err := LoadConfig(func(k string) string { return env[k] })
	if err != nil {
		t.Fatal(err)
	}
	if want := (Config{Addr: ":8080", DSN: "mem://ledger", RiskURL: "http://risk.local"}); cfg != want {
		t.Fatalf("cfg = %+v, want %+v", cfg, want)
	}

	_, err = LoadConfig(func(k string) string { return map[string]string{"LEDGER_ADDR": ":8080"}[k] })
	if want := "LEDGER_DSN is required\nLEDGER_RISK_URL is required"; err == nil || err.Error() != want {
		t.Fatalf("LoadConfig() error = %v, want %q", err, want)
	}
}
