package accountsapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

// memStore is a small fake: enough for the handlers, no database.
type memStore struct {
	mu   sync.Mutex
	next int
	byID map[string]Account
}

func (m *memStore) Create(owner string) Account {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.byID == nil {
		m.byID = map[string]Account{}
	}
	m.next++
	a := Account{ID: fmt.Sprint(m.next), Owner: owner}
	m.byID[a.ID] = a
	return a
}

func (m *memStore) Get(id string) (Account, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	a, ok := m.byID[id]
	return a, ok
}

func do(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))
	return rec
}

func decode(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	// Result().Header is what was sent: headers set after WriteHeader are not in it.
	if ct := rec.Result().Header.Get("Content-Type"); ct != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", ct)
	}
	var v map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &v); err != nil {
		t.Fatalf("body is not JSON: %q", rec.Body.String())
	}
	return v
}

func TestCreateAndGet(t *testing.T) {
	h := NewHandler(&memStore{})
	rec := do(t, h, "POST", "/accounts", `{"owner":"alice"}`)
	if rec.Code != http.StatusCreated {
		t.Fatalf("POST /accounts = %d, want 201", rec.Code)
	}
	created := decode(t, rec)
	if created["owner"] != "alice" || created["id"] == "" || created["balance"] != 0.0 {
		t.Fatalf("created = %v", created)
	}
	if loc := rec.Result().Header.Get("Location"); loc != "/accounts/"+created["id"].(string) {
		t.Fatalf("Location = %q", loc)
	}
	rec = do(t, h, "GET", "/accounts/"+created["id"].(string), "")
	if rec.Code != http.StatusOK || decode(t, rec)["owner"] != "alice" {
		t.Fatalf("GET = %d %s", rec.Code, rec.Body)
	}
}

func TestNotFound(t *testing.T) {
	rec := do(t, NewHandler(&memStore{}), "GET", "/accounts/999", "")
	if rec.Code != http.StatusNotFound || decode(t, rec)["error"] == nil {
		t.Fatalf("got %d %s, want 404 with a JSON error", rec.Code, rec.Body)
	}
}

func TestWrongMethodIs405(t *testing.T) {
	h := NewHandler(&memStore{})
	rec := do(t, h, "DELETE", "/accounts/1", "")
	if rec.Code != http.StatusMethodNotAllowed || !strings.Contains(rec.Result().Header.Get("Allow"), "GET") {
		t.Fatalf("DELETE /accounts/1 = %d Allow=%q, want 405 with Allow: GET", rec.Code, rec.Header().Get("Allow"))
	}
	if rec := do(t, h, "GET", "/accounts", ""); rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET /accounts = %d, want 405", rec.Code)
	}
}

func TestBadInput(t *testing.T) {
	h := NewHandler(&memStore{})
	for name, body := range map[string]string{
		"not JSON":      `owner=alice`,
		"empty owner":   `{"owner":"  "}`,
		"unknown field": `{"owner":"alice","balance":1000000}`,
		"empty body":    ``,
		"trailing data": `{"owner":"alice"} garbage`,
		"two objects":   `{"owner":"alice"}{"owner":"bob"}`,
	} {
		rec := do(t, h, "POST", "/accounts", body)
		if rec.Code != http.StatusBadRequest || decode(t, rec)["error"] == nil {
			t.Errorf("%s: got %d %s, want 400 with a JSON error", name, rec.Code, rec.Body)
		}
	}
	if rec := do(t, h, "POST", "/accounts", "{\"owner\":\"alice\"}\n"); rec.Code != http.StatusCreated {
		t.Errorf("trailing whitespace: got %d, want 201", rec.Code)
	}
	if rec := do(t, h, "POST", "/accounts", `{"owner":""}`); decode(t, rec)["field"] != "owner" {
		t.Fatalf("an empty owner should name the field: %s", rec.Body)
	}
}

func TestBodyIsLimited(t *testing.T) {
	big := `{"owner":"` + strings.Repeat("a", 2<<20) + `"}`
	if rec := do(t, NewHandler(&memStore{}), "POST", "/accounts", big); rec.Code != http.StatusBadRequest {
		t.Fatalf("a 2 MB body got %d, want 400", rec.Code)
	}
}
