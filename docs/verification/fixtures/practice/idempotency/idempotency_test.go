package idempotency

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// fakeLedger counts calls; err is returned for the next calls until changed.
type fakeLedger struct {
	mu      sync.Mutex
	calls   int
	err     error
	entered chan struct{} // if set, receives once per call before the call waits on release
	release chan struct{} // if set, every call waits for it
	ctxSeen context.Context
}

func (f *fakeLedger) Transfer(ctx context.Context, from, to string, amount int64) error {
	f.mu.Lock()
	f.calls++
	f.ctxSeen = ctx
	err := f.err
	entered, release := f.entered, f.release
	f.mu.Unlock()
	if entered != nil {
		entered <- struct{}{}
	}
	if release != nil {
		<-release
	}
	return err
}

func (f *fakeLedger) Calls() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.calls
}

func post(h http.Handler, key, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/transfers", strings.NewReader(body))
	if key != "" {
		req.Header.Set("Idempotency-Key", key)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

const transfer = `{"from":"A","to":"B","amount":500}`

func TestRepeatReturnsStoredResponseWithoutSecondTransfer(t *testing.T) {
	ledger := &fakeLedger{}
	h := Handler(NewStore(), ledger)
	first := post(h, "k1", transfer)
	if first.Code != http.StatusCreated {
		t.Fatalf("first: status %d %s, want 201", first.Code, first.Body)
	}
	second := post(h, "k1", transfer)
	if second.Code != first.Code || second.Body.String() != first.Body.String() {
		t.Fatalf("repeat: %d %s, want the stored %d %s", second.Code, second.Body, first.Code, first.Body)
	}
	if ledger.Calls() != 1 {
		t.Fatalf("ledger called %d times, want 1: a repeat must not move money again", ledger.Calls())
	}
	if post(h, "k2", transfer).Code != http.StatusCreated || ledger.Calls() != 2 {
		t.Fatalf("a new key must run a new transfer (calls = %d)", ledger.Calls())
	}
}

func TestSameRequestWithOtherFormattingIsARepeat(t *testing.T) {
	ledger := &fakeLedger{}
	h := Handler(NewStore(), ledger)
	post(h, "k", transfer)
	rec := post(h, "k", "{ \"amount\": 500,\n  \"to\": \"B\", \"from\": \"A\" }")
	if rec.Code != http.StatusCreated || ledger.Calls() != 1 {
		t.Fatalf("same fields, other spacing and order: %d %s, calls %d; want the stored 201 and 1 call", rec.Code, rec.Body, ledger.Calls())
	}
}

func TestKeyReusedWithOtherPayloadIs422(t *testing.T) {
	ledger := &fakeLedger{}
	h := Handler(NewStore(), ledger)
	post(h, "k", transfer)
	rec := post(h, "k", `{"from":"A","to":"B","amount":900}`)
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("other amount, same key: %d %s, want 422", rec.Code, rec.Body)
	}
	if ledger.Calls() != 1 {
		t.Fatalf("ledger called %d times, want 1", ledger.Calls())
	}
}

func TestBadRequests(t *testing.T) {
	ledger := &fakeLedger{}
	h := Handler(NewStore(), ledger)
	if rec := post(h, "", transfer); rec.Code != http.StatusBadRequest {
		t.Errorf("no Idempotency-Key: %d, want 400", rec.Code)
	}
	if rec := post(h, "k", `{"from":`); rec.Code != http.StatusBadRequest {
		t.Errorf("broken JSON: %d, want 400", rec.Code)
	}
	if rec := post(h, "k", `{"from":"A","to":"B","amount":5,"admin":true}`); rec.Code != http.StatusBadRequest {
		t.Errorf("unknown field: %d, want 400", rec.Code)
	}
	if ledger.Calls() != 0 {
		t.Fatalf("ledger called %d times for bad requests, want 0", ledger.Calls())
	}
	if rec := post(h, "k", transfer); rec.Code != http.StatusCreated {
		t.Fatalf("a bad request must not use up the key: %d %s", rec.Code, rec.Body)
	}
}

func TestBusinessOutcomeIsStoredInfrastructureFailureIsNot(t *testing.T) {
	ledger := &fakeLedger{err: fmt.Errorf("debit A: %w", ErrInsufficientFunds)}
	h := Handler(NewStore(), ledger)
	first := post(h, "poor", transfer)
	ledger.mu.Lock()
	ledger.err = nil
	ledger.mu.Unlock()
	second := post(h, "poor", transfer)
	if second.Header().Get("Retry-After") != "" {
		t.Errorf("a stored final answer must not carry Retry-After: that header marks \"still in progress\"")
	}
	if first.Code != http.StatusConflict || second.Code != http.StatusConflict || second.Body.String() != first.Body.String() || ledger.Calls() != 1 {
		t.Fatalf("insufficient funds: first %d %s, repeat %d %s, calls %d; want the same stored 409 and 1 call",
			first.Code, first.Body, second.Code, second.Body, ledger.Calls())
	}

	ledger.mu.Lock()
	ledger.err = errors.New("pq: connection refused")
	ledger.mu.Unlock()
	failed := post(h, "flaky", transfer)
	if failed.Code != http.StatusInternalServerError || strings.Contains(failed.Body.String(), "pq:") {
		t.Fatalf("infrastructure failure: %d %s, want 500 without details", failed.Code, failed.Body)
	}
	ledger.mu.Lock()
	ledger.err = nil
	ledger.mu.Unlock()
	retry := post(h, "flaky", transfer)
	if retry.Code != http.StatusCreated || ledger.Calls() != 3 {
		t.Fatalf("retry after a 500: %d %s, calls %d; want 201 and a second attempt", retry.Code, retry.Body, ledger.Calls())
	}
}

func TestLedgerGetsTheRequestContext(t *testing.T) {
	ledger := &fakeLedger{}
	h := Handler(NewStore(), ledger)
	type ctxKey struct{}
	req := httptest.NewRequest(http.MethodPost, "/transfers", strings.NewReader(transfer))
	req = req.WithContext(context.WithValue(req.Context(), ctxKey{}, "request"))
	req.Header.Set("Idempotency-Key", "ctx")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if ledger.ctxSeen == nil || ledger.ctxSeen.Value(ctxKey{}) != "request" {
		t.Fatal("the ledger must get r.Context(), so the transfer stops when the client goes away")
	}
}

// 20 identical requests while the first is still running: exactly one transfer;
// the others get 409 at once, and a later repeat gets the stored 201.
func TestConcurrentDuplicatesTransferOnce(t *testing.T) {
	ledger := &fakeLedger{entered: make(chan struct{}, 1), release: make(chan struct{})}
	h := Handler(NewStore(), ledger)

	firstDone := make(chan *httptest.ResponseRecorder)
	go func() { firstDone <- post(h, "same", transfer) }()
	select {
	case <-ledger.entered:
	case <-time.After(2 * time.Second):
		t.Fatal("the first request never reached the ledger")
	}

	// Another body with the same key is rejected even while the first is still running.
	if rec := post(h, "same", `{"from":"A","to":"B","amount":1}`); rec.Code != http.StatusUnprocessableEntity {
		close(ledger.release)
		t.Fatalf("other body, same key, while in progress: %d %s, want 422 (compare the fingerprint first)", rec.Code, rec.Body)
	}

	var conflicts, others atomic.Int32
	var wg sync.WaitGroup
	for range 19 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			rec := post(h, "same", transfer)
			if rec.Code == http.StatusConflict && rec.Header().Get("Retry-After") != "" {
				conflicts.Add(1)
			} else {
				others.Add(1)
			}
		}()
	}
	waited := make(chan struct{})
	go func() { wg.Wait(); close(waited) }()
	select {
	case <-waited:
	case <-time.After(2 * time.Second):
		close(ledger.release)
		t.Fatal("duplicates waited for the first request instead of answering 409 at once (or fn runs under the lock)")
	}
	close(ledger.release)
	first := <-firstDone

	if first.Code != http.StatusCreated {
		t.Fatalf("first: %d %s, want 201", first.Code, first.Body)
	}
	if conflicts.Load() != 19 || others.Load() != 0 {
		t.Fatalf("while in progress: %d answered 409 with Retry-After, %d otherwise; want 19 and 0", conflicts.Load(), others.Load())
	}
	if ledger.Calls() != 1 {
		t.Fatalf("ledger called %d times, want exactly 1", ledger.Calls())
	}
	if rec := post(h, "same", transfer); rec.Code != http.StatusCreated || rec.Body.String() != first.Body.String() {
		t.Fatalf("repeat after completion: %d %s, want the stored 201", rec.Code, rec.Body)
	}
}

// The same guarantee without HTTP: 50 calls released at once, in 100 rounds,
// run fn once per key (claiming must be part of the same critical section as the lookup).
func TestStoreDoRunsOncePerKey(t *testing.T) {
	s := NewStore()
	fp := sha256.Sum256([]byte("req"))
	for round := range 100 {
		key := fmt.Sprintf("k%d", round)
		var runs atomic.Int32
		start := make(chan struct{})
		var wg sync.WaitGroup
		for range 50 {
			wg.Add(1)
			go func() {
				defer wg.Done()
				<-start
				resp, err := s.Do(key, fp, func() (Response, error) {
					runs.Add(1)
					time.Sleep(time.Millisecond)
					return Response{Status: 201, Body: []byte("ok")}, nil
				})
				if err != nil && !errors.Is(err, ErrInProgress) {
					t.Errorf("Do: %v", err)
				}
				if err == nil && (resp.Status != 201 || string(resp.Body) != "ok") {
					t.Errorf("Do returned %v", resp)
				}
			}()
		}
		close(start)
		wg.Wait()
		if runs.Load() != 1 {
			t.Fatalf("round %d: fn ran %d times for one key, want 1", round, runs.Load())
		}
	}
	if _, err := s.Do("k0", sha256.Sum256([]byte("other")), nil); !errors.Is(err, ErrKeyReused) {
		t.Fatalf("other fingerprint: %v, want ErrKeyReused", err)
	}
}
