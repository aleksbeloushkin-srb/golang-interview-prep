// Package httperr is the reference solution for practice task W5-2: domain
// errors become HTTP responses in one place, without leaking internals.
package httperr

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
)

// Domain errors. In the project they live in the ledger package, which does
// not import net/http; the mapping below is the only place that knows both.
var (
	ErrNotFound          = errors.New("account not found")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

type ValidationError struct{ Field, Reason string }

func (e *ValidationError) Error() string { return "invalid " + e.Field + ": " + e.Reason }

// Ledger is the domain operation the handler calls.
type Ledger interface {
	Transfer(ctx context.Context, from, to string, amount int64) error
}

// Status maps an error to an HTTP status code. Insufficient funds is 409
// Conflict: the request is valid but conflicts with the current balance.
func Status(err error) int {
	var ve *ValidationError
	switch {
	case errors.As(err, &ve):
		return http.StatusBadRequest
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, ErrInsufficientFunds):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// Write sends err as JSON. Client errors say what was wrong; a 500 says
// nothing about the cause, and only a 500 is logged, once, with the details.
func Write(w http.ResponseWriter, log *slog.Logger, err error) {
	status := Status(err)
	body := map[string]string{"error": http.StatusText(status)}
	var ve *ValidationError
	switch {
	case errors.As(err, &ve):
		body = map[string]string{"error": ve.Reason, "field": ve.Field}
	case status == http.StatusNotFound:
		body["error"] = ErrNotFound.Error()
	case status == http.StatusConflict:
		body["error"] = ErrInsufficientFunds.Error()
	default:
		log.Error("request failed", "err", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}

// TransferHandler handles POST /transfers {"from","to","amount"}.
func TransferHandler(l Ledger, log *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			From   string `json:"from"`
			To     string `json:"to"`
			Amount int64  `json:"amount"`
		}
		dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
		// One JSON object and nothing after it: "{...} garbage" or a second object is a bad request.
		if err := dec.Decode(&in); err != nil || dec.Decode(&struct{}{}) != io.EOF {
			Write(w, log, &ValidationError{Field: "body", Reason: "must be JSON like {\"from\", \"to\", \"amount\"}"})
			return
		}
		if in.Amount <= 0 {
			Write(w, log, &ValidationError{Field: "amount", Reason: "must be positive"})
			return
		}
		if err := l.Transfer(r.Context(), in.From, in.To, in.Amount); err != nil {
			Write(w, log, err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}
}
