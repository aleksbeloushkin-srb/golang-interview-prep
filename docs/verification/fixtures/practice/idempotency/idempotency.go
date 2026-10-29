// Package idempotency is the reference solution for practice task W6-2: an
// Idempotency-Key store and an HTTP handler that runs a transfer at most once per key.
package idempotency

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sync"
)

var (
	ErrKeyReused         = errors.New("idempotency key reused with a different request")
	ErrInProgress        = errors.New("a request with this idempotency key is still in progress")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

// Response is what the handler sent for a key; a repeat gets exactly the same.
type Response struct {
	Status int
	Body   []byte
}

type entry struct {
	fingerprint [32]byte
	done        bool
	resp        Response
}

// Store remembers, for each key, the request fingerprint and the response.
type Store struct {
	mu   sync.Mutex
	keys map[string]*entry
}

func NewStore() *Store { return &Store{keys: make(map[string]*entry)} }

// Do runs fn at most once per key. The key is claimed atomically, under the same lock
// as the lookup, so two concurrent calls cannot both decide that the key is new.
func (s *Store) Do(key string, fingerprint [32]byte, fn func() (Response, error)) (Response, error) {
	s.mu.Lock()
	if e, ok := s.keys[key]; ok {
		defer s.mu.Unlock()
		switch {
		case e.fingerprint != fingerprint:
			return Response{}, ErrKeyReused
		case !e.done:
			return Response{}, ErrInProgress
		default:
			return e.resp, nil
		}
	}
	e := &entry{fingerprint: fingerprint}
	s.keys[key] = e
	s.mu.Unlock()

	resp, err := fn() // never under the lock: fn is slow, and other keys must not wait for it

	s.mu.Lock()
	defer s.mu.Unlock()
	if err != nil {
		delete(s.keys, key) // nothing to replay: release the key so that a retry runs fn again
		return Response{}, err
	}
	e.resp, e.done = resp, true
	return resp, nil
}

// Transferer moves money; it is the ledger of week 5 reduced to one method.
type Transferer interface {
	Transfer(ctx context.Context, from, to string, amount int64) error
}

type transferRequest struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Amount int64  `json:"amount"`
}

func jsonResponse(status int, v any) Response {
	body, _ := json.Marshal(v)
	return Response{Status: status, Body: body}
}

func write(w http.ResponseWriter, r Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(r.Status)
	w.Write(r.Body)
}

// Handler serves POST /transfers with an Idempotency-Key header.
func Handler(store *Store, ledger Transferer) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("Idempotency-Key")
		if key == "" {
			write(w, jsonResponse(http.StatusBadRequest, map[string]string{"error": "Idempotency-Key header is required"}))
			return
		}
		var req transferRequest
		dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
		dec.DisallowUnknownFields()
		// One JSON object and nothing after it: "{...} garbage" or a second object is invalid too.
		// Checked before Do, so a bad request neither runs the transfer nor uses up the key.
		if err := dec.Decode(&req); err != nil || dec.Decode(&struct{}{}) != io.EOF {
			write(w, jsonResponse(http.StatusBadRequest, map[string]string{"error": "invalid JSON body"}))
			return
		}
		// Fingerprint of the decoded request, not of the raw bytes: the same JSON with
		// other spacing or field order is the same request.
		canonical, _ := json.Marshal(req)
		fingerprint := sha256.Sum256(canonical)

		resp, err := store.Do(key, fingerprint, func() (Response, error) {
			err := ledger.Transfer(r.Context(), req.From, req.To, req.Amount)
			switch {
			case err == nil:
				return jsonResponse(http.StatusCreated, map[string]string{"status": "done"}), nil
			case errors.Is(err, ErrInsufficientFunds):
				// A business outcome: stored, so a repeat gets the same answer.
				return jsonResponse(http.StatusConflict, map[string]string{"error": "insufficient funds"}), nil
			default:
				return Response{}, err // an infrastructure failure: not stored
			}
		})
		switch {
		case errors.Is(err, ErrKeyReused):
			write(w, jsonResponse(http.StatusUnprocessableEntity, map[string]string{"error": ErrKeyReused.Error()}))
		case errors.Is(err, ErrInProgress):
			w.Header().Set("Retry-After", "1")
			write(w, jsonResponse(http.StatusConflict, map[string]string{"error": ErrInProgress.Error()}))
		case err != nil:
			write(w, jsonResponse(http.StatusInternalServerError, map[string]string{"error": http.StatusText(http.StatusInternalServerError)}))
		default:
			write(w, resp)
		}
	})
}
