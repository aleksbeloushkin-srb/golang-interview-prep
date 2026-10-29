// Package accountsapi is the reference solution for practice task W5-1:
// HTTP routes for accounts on the standard ServeMux (Go 1.22+ patterns).
package accountsapi

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

type Account struct {
	ID      string `json:"id"`
	Owner   string `json:"owner"`
	Balance int64  `json:"balance"` // minor units
}

// Store is what the handlers need; the ledger package or a test fake implements it.
type Store interface {
	Create(owner string) Account
	Get(id string) (Account, bool)
}

// maxBody limits request bodies; a client cannot make the server read gigabytes.
const maxBody = 1 << 20

// NewHandler returns the routes:
//
//	POST /accounts        {"owner": "..."} → 201 + Location, the account as JSON
//	GET  /accounts/{id}   → 200 with the account, 404 if unknown
//
// Other methods on these paths get 405 from ServeMux.
func NewHandler(s Store) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /accounts", func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Owner string `json:"owner"`
		}
		dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBody))
		dec.DisallowUnknownFields()
		// One JSON object and nothing after it: "{...} garbage" or a second object is a bad request.
		if err := dec.Decode(&in); err != nil || dec.Decode(&struct{}{}) != io.EOF {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "body must be JSON like {\"owner\": \"...\"}"})
			return
		}
		if strings.TrimSpace(in.Owner) == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "owner must not be empty", "field": "owner"})
			return
		}
		acc := s.Create(in.Owner)
		w.Header().Set("Location", "/accounts/"+acc.ID)
		writeJSON(w, http.StatusCreated, acc)
	})
	mux.HandleFunc("GET /accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		acc, ok := s.Get(r.PathValue("id"))
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "account not found"})
			return
		}
		writeJSON(w, http.StatusOK, acc)
	})
	return mux
}

// writeJSON sets the headers before the status: after WriteHeader they are ignored.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
