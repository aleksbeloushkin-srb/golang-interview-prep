// Command accounts is a small REST API on the standard ServeMux (Go 1.22
// patterns) with a middleware chain: request id → logging → recover.
package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
	"time"
)

// routes registers handlers by method and path; balances are in minor units.
func routes(balances map[string]int64) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		balance, ok := balances[id]
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "account not found"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"id": id, "balance": balance})
	})
	return mux
}

// withMiddleware lists the layers outermost first. Rate limiting and auth
// would follow recoverer.
func withMiddleware(h http.Handler, log *slog.Logger) http.Handler {
	return chain(h, requestID, logging(log), recoverer(log))
}

// chain wraps h so that the first middleware listed is the outermost.
func chain(h http.Handler, mws ...func(http.Handler) http.Handler) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

type requestIDKey struct{}

// requestID puts an id into the context for inner layers and into the response for the client.
func requestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := rand.Text()
		w.Header().Set("X-Request-ID", id)
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), requestIDKey{}, id)))
	})
}

func requestIDFrom(ctx context.Context) string {
	id, _ := ctx.Value(requestIDKey{}).(string)
	return id
}

// logging writes one line per request with the status the inner layers produced.
func logging(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(sw, r)
			log.Info("request", "method", r.Method, "path", r.URL.Path, "status", sw.status,
				"request_id", requestIDFrom(r.Context()), "duration", time.Since(start))
		})
	}
}

type statusWriter struct {
	http.ResponseWriter
	status int
	wrote  bool
}

func (s *statusWriter) WriteHeader(code int) {
	if !s.wrote {
		s.status, s.wrote = code, true
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusWriter) Write(b []byte) (int, error) {
	s.wrote = true
	return s.ResponseWriter.Write(b)
}

// Unwrap lets http.ResponseController reach the original writer.
func (s *statusWriter) Unwrap() http.ResponseWriter { return s.ResponseWriter }

// recoverer turns a panic into a 500 with the request id. Without it, net/http
// logs the panic and drops the connection (HTTP/2: the stream) with no response.
func recoverer(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				v := recover()
				if v == nil {
					return
				}
				if v == http.ErrAbortHandler {
					panic(v) // the handler asked net/http to abort the response
				}
				id := requestIDFrom(r.Context())
				log.Error("panic", "request_id", id, "panic", v, "stack", string(debug.Stack()))
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error", "request_id": id})
			}()
			next.ServeHTTP(w, r)
		})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stderr, nil))
	srv := &http.Server{
		Addr:              "127.0.0.1:8080",
		Handler:           withMiddleware(routes(map[string]int64{"42": 1050}), log),
		ReadHeaderTimeout: 5 * time.Second,
	}
	if err := srv.ListenAndServe(); err != nil {
		log.Error("server stopped", "err", err)
		os.Exit(1)
	}
}
