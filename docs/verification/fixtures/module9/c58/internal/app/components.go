package app

// Stand-ins for the real packages of a ledger service: a PostgreSQL pool, a store,
// a client of an external risk API, the transfer use case and the HTTP transport.
// They keep the example self-contained; the composition root is in app.go.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

// db stands in for *sql.DB or *pgxpool.Pool.
type db struct {
	mu        sync.Mutex
	transfers int64
}

func openDB(dsn string) (*db, error) {
	if !strings.HasPrefix(dsn, "mem://") {
		return nil, fmt.Errorf("unsupported DSN %q", dsn)
	}
	return &db{}, nil
}

func (d *db) Close() error { return nil }

type store struct{ db *db }

// newStore is where a real store prepares its statements, so it takes ctx and can fail.
func newStore(ctx context.Context, d *db) (*store, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	return &store{db: d}, nil
}

func (s *store) SaveTransfer(ctx context.Context, from, to string, amount int64) (int64, error) {
	if err := ctx.Err(); err != nil {
		return 0, err
	}
	s.db.mu.Lock()
	defer s.db.mu.Unlock()
	s.db.transfers++
	return s.db.transfers, nil
}

// Close is where a real store closes its prepared statements.
func (s *store) Close() error { return nil }

type riskClient struct {
	baseURL string
	http    *http.Client
}

func newRiskClient(baseURL string) (*riskClient, error) {
	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}
	if u.Scheme == "" || u.Host == "" {
		return nil, fmt.Errorf("URL %q needs a scheme and a host", baseURL)
	}
	return &riskClient{baseURL: strings.TrimSuffix(baseURL, "/"), http: &http.Client{Timeout: 2 * time.Second}}, nil
}

// Allow asks the risk service whether the account may send amount minor units.
func (c *riskClient) Allow(ctx context.Context, account string, amount int64) (bool, error) {
	q := url.Values{"account": {account}, "amount": {strconv.FormatInt(amount, 10)}}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/allow?"+q.Encode(), nil)
	if err != nil {
		return false, err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body) // drain, so the connection can be reused
	switch resp.StatusCode {
	case http.StatusOK:
		return true, nil
	case http.StatusForbidden:
		return false, nil
	default:
		return false, fmt.Errorf("risk service: status %d", resp.StatusCode)
	}
}

func (c *riskClient) Close() error {
	c.http.CloseIdleConnections()
	return nil
}

var errDenied = errors.New("transfer denied by the risk check")

type transferService struct {
	store *store
	risk  *riskClient
}

func newTransferService(st *store, risk *riskClient) *transferService {
	return &transferService{store: st, risk: risk}
}

func (s *transferService) Transfer(ctx context.Context, from, to string, amount int64) (int64, error) {
	ok, err := s.risk.Allow(ctx, from, amount)
	if err != nil {
		return 0, fmt.Errorf("risk check: %w", err)
	}
	if !ok {
		return 0, errDenied
	}
	return s.store.SaveTransfer(ctx, from, to, amount)
}

func newHandler(svc *transferService, log *slog.Logger) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /transfers", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			From   string `json:"from"`
			To     string `json:"to"`
			Amount int64  `json:"amount"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Amount <= 0 {
			http.Error(w, "invalid transfer", http.StatusBadRequest)
			return
		}
		id, err := svc.Transfer(r.Context(), req.From, req.To, req.Amount)
		switch {
		case errors.Is(err, errDenied):
			http.Error(w, "transfer denied", http.StatusUnprocessableEntity)
			return
		case err != nil:
			log.Error("transfer failed", "err", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]int64{"id": id})
	})
	return mux
}
