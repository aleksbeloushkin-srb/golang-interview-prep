// Package httpapi is the transport: it decodes requests, calls the use case
// and maps domain errors to status codes. The JSON shapes live only here.
package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"example.com/m9/c57/internal/ledger"
	"example.com/m9/c57/internal/transfer"
)

type transferRequest struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Amount int64  `json:"amount"`
}

func NewHandler(svc *transfer.Service, log *slog.Logger) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /transfers", func(w http.ResponseWriter, r *http.Request) {
		var req transferRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON body", http.StatusBadRequest)
			return
		}
		if err := svc.Transfer(r.Context(), req.From, req.To, req.Amount); err != nil {
			writeError(w, log, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	return mux
}

func writeError(w http.ResponseWriter, log *slog.Logger, err error) {
	switch {
	case errors.Is(err, transfer.ErrInvalidAmount), errors.Is(err, transfer.ErrSameAccount):
		http.Error(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, ledger.ErrAccountNotFound):
		http.Error(w, "account not found", http.StatusNotFound)
	case errors.Is(err, ledger.ErrInsufficientFunds):
		http.Error(w, "insufficient funds", http.StatusConflict)
	default:
		log.Error("transfer failed", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
}
