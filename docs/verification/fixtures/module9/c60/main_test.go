package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
)

// requestLines returns the "request" lines that the logging middleware wrote.
func requestLines(t *testing.T, buf *bytes.Buffer) []map[string]any {
	t.Helper()
	var lines []map[string]any
	sc := bufio.NewScanner(buf)
	sc.Buffer(nil, 1<<20)
	for sc.Scan() {
		var m map[string]any
		if err := json.Unmarshal(sc.Bytes(), &m); err != nil {
			t.Fatalf("log line %q: %v", sc.Text(), err)
		}
		if m["msg"] == "request" {
			lines = append(lines, m)
		}
	}
	return lines
}

func serve(h http.Handler, method, target string) *http.Response {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, target, nil))
	return rec.Result()
}

func TestGetAccount(t *testing.T) {
	var buf bytes.Buffer
	h := withMiddleware(routes(map[string]int64{"42": 1050}), slog.New(slog.NewJSONHandler(&buf, nil)))

	resp := serve(h, "GET", "/accounts/42")
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK || strings.TrimSpace(string(body)) != `{"balance":1050,"id":"42"}` {
		t.Fatalf("GET /accounts/42 = %d %s", resp.StatusCode, body)
	}
	if resp.Header.Get("X-Request-ID") == "" {
		t.Fatal("no X-Request-ID in the response")
	}
	if resp := serve(h, "GET", "/accounts/7"); resp.StatusCode != http.StatusNotFound {
		t.Fatalf("GET /accounts/7 = %d, want 404", resp.StatusCode)
	}
}

// A panic becomes a 500 with the request id, and the log line, written
// outside recover, shows that 500 with the same id.
func TestPanicBecomes500WithRequestID(t *testing.T) {
	var buf bytes.Buffer
	mux := routes(nil)
	mux.HandleFunc("GET /boom", func(w http.ResponseWriter, r *http.Request) {
		var m map[string]int
		m["x"] = 1 // assignment to entry in nil map
	})
	h := withMiddleware(mux, slog.New(slog.NewJSONHandler(&buf, nil)))

	resp := serve(h, "GET", "/boom")
	var body map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	id := resp.Header.Get("X-Request-ID")
	if resp.StatusCode != http.StatusInternalServerError || id == "" || body["request_id"] != id {
		t.Fatalf("got %d, X-Request-ID %q, body %v; want 500 with the same request id", resp.StatusCode, id, body)
	}
	lines := requestLines(t, &buf)
	if len(lines) != 1 || lines[0]["status"] != float64(500) || lines[0]["request_id"] != id {
		t.Fatalf("request log = %v; want one line with status 500 and request_id %s", lines, id)
	}
}

// ServeMux answers a wrong method with 405 and Allow; the middleware still logs it.
func TestWrongMethodIs405(t *testing.T) {
	var buf bytes.Buffer
	h := withMiddleware(routes(nil), slog.New(slog.NewJSONHandler(&buf, nil)))

	resp := serve(h, "DELETE", "/accounts/42")
	if resp.StatusCode != http.StatusMethodNotAllowed || resp.Header.Get("Allow") != "GET, HEAD" {
		t.Fatalf("DELETE = %d, Allow %q; want 405, GET, HEAD", resp.StatusCode, resp.Header.Get("Allow"))
	}
	if lines := requestLines(t, &buf); len(lines) != 1 || lines[0]["status"] != float64(405) {
		t.Fatalf("request log = %v; want status 405", lines)
	}
}

func TestChainOrder(t *testing.T) {
	var order []string
	mw := func(name string) func(http.Handler) http.Handler {
		return func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				order = append(order, name)
				next.ServeHTTP(w, r)
			})
		}
	}
	h := chain(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { order = append(order, "handler") }),
		mw("request id"), mw("logging"), mw("recover"))
	serve(h, "GET", "/")
	if want := []string{"request id", "logging", "recover", "handler"}; !slices.Equal(order, want) {
		t.Fatalf("order = %q, want %q", order, want)
	}
}

// A recover that only logs lets the handler return normally: net/http sends an empty 200.
func TestRecoverThatOnlyLogsSendsEmpty200(t *testing.T) {
	logOnly := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() { _ = recover() }()
			next.ServeHTTP(w, r)
		})
	}
	srv := httptest.NewServer(logOnly(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { panic("boom") })))
	defer srv.Close()
	resp, err := srv.Client().Get(srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK || len(body) != 0 {
		t.Fatalf("got %d %q; want an empty 200", resp.StatusCode, body)
	}
}

// Without any recover middleware, net/http recovers the panic itself and
// closes the connection: an HTTP/1.1 client gets EOF, not a response.
func TestNoRecoverClientGetsEOF(t *testing.T) {
	srv := httptest.NewUnstartedServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { panic("boom") }))
	srv.Config.ErrorLog = log.New(io.Discard, "", 0)
	srv.Start()
	defer srv.Close()
	resp, err := srv.Client().Get(srv.URL)
	if err == nil {
		resp.Body.Close()
		t.Fatalf("got status %d, want EOF", resp.StatusCode)
	}
	if !errors.Is(err, io.EOF) {
		t.Fatalf("err = %v, want io.EOF", err)
	}
}
