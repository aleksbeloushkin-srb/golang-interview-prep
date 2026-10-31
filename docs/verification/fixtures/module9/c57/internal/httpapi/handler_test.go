package httpapi_test

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"example.com/m9/c57/internal/httpapi"
	"example.com/m9/c57/internal/ledger"
	"example.com/m9/c57/internal/store/memory"
	"example.com/m9/c57/internal/transfer"
)

func TestTransferStatusCodes(t *testing.T) {
	tests := []struct {
		name string
		body string
		want int
	}{
		{name: "ok", body: `{"from":"alice","to":"bob","amount":300}`, want: http.StatusNoContent},
		{name: "invalid JSON", body: `{"from":`, want: http.StatusBadRequest},
		{name: "invalid amount", body: `{"from":"alice","to":"bob","amount":0}`, want: http.StatusBadRequest},
		{name: "unknown account", body: `{"from":"alice","to":"carol","amount":1}`, want: http.StatusNotFound},
		{name: "insufficient funds", body: `{"from":"alice","to":"bob","amount":5000}`, want: http.StatusConflict},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := memory.New(ledger.Account{ID: "alice", Balance: 1000}, ledger.Account{ID: "bob"})
			h := httpapi.NewHandler(transfer.NewService(store), slog.New(slog.NewTextHandler(io.Discard, nil)))
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/transfers", strings.NewReader(tt.body)))
			if rec.Code != tt.want {
				t.Fatalf("status = %d, want %d; body %q", rec.Code, tt.want, rec.Body.String())
			}
		})
	}
}
