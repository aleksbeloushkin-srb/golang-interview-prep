package callout

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"slices"
	"strings"
	"sync"
	"syscall"
	"testing"
	"time"
)

// provider is a fake payment provider. It records the Idempotency-Key of
// every POST it receives, then answers with the next behaviour in line; the
// last behaviour repeats.
type provider struct {
	t       *testing.T
	mu      sync.Mutex
	keys    []string
	answers []func(w http.ResponseWriter, r *http.Request)
}

func (p *provider) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Fprint(w, "ok") // a warm-up GET that leaves a keep-alive connection
		return
	}
	if _, err := io.ReadAll(r.Body); err != nil {
		p.t.Errorf("read body: %v", err)
		return
	}
	p.mu.Lock()
	p.keys = append(p.keys, r.Header.Get("Idempotency-Key"))
	answer := p.answers[min(len(p.keys), len(p.answers))-1]
	p.mu.Unlock()
	answer(w, r)
}

func (p *provider) received() []string {
	p.mu.Lock()
	defer p.mu.Unlock()
	return slices.Clone(p.keys)
}

func status(code int, header ...string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, _ *http.Request) {
		for i := 0; i+1 < len(header); i += 2 {
			w.Header().Set(header[i], header[i+1])
		}
		w.WriteHeader(code)
		fmt.Fprint(w, `{"ref":"gw-1","status":"succeeded"}`)
	}
}

// dropConnection closes the TCP connection after the request has been read
// in full: the provider may have executed it, and no response comes back.
func dropConnection(t *testing.T) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, _ *http.Request) {
		conn, _, err := http.NewResponseController(w).Hijack()
		if err != nil {
			t.Errorf("hijack: %v", err)
			return
		}
		conn.Close()
	}
}

func startProvider(t *testing.T, answers ...func(http.ResponseWriter, *http.Request)) (*provider, string) {
	t.Helper()
	p := &provider{t: t, answers: answers}
	srv := httptest.NewServer(p)
	t.Cleanup(srv.Close)
	return p, srv.URL
}

// warmUp leaves one idle keep-alive connection to base in hc's pool.
func warmUp(t *testing.T, hc *http.Client, base string) {
	t.Helper()
	resp, err := hc.Get(base + "/health")
	if err != nil {
		t.Fatal(err)
	}
	io.Copy(io.Discard, resp.Body) // reading to EOF returns the connection to the pool
	resp.Body.Close()
}

func newClient(t *testing.T) *http.Client {
	tr := &http.Transport{}
	t.Cleanup(tr.CloseIdleConnections)
	return &http.Client{Transport: tr}
}

func payment(base, key string) func(context.Context) (*http.Request, error) {
	return func(ctx context.Context) (*http.Request, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, base+"/v1/payments",
			strings.NewReader(`{"reference":"pay-42","amount_minor":1500,"currency":"EUR"}`))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
		if key != "" {
			req.Header.Set("Idempotency-Key", key)
		}
		return req, nil
	}
}

// recordWaits returns a policy whose Sleep records the pauses instead of
// sleeping.
func recordWaits(maxAttempts int, waits *[]time.Duration) Policy {
	return Policy{
		MaxAttempts: maxAttempts,
		MaxWait:     10 * time.Second,
		Sleep: func(_ context.Context, d time.Duration) error {
			*waits = append(*waits, d)
			return nil
		},
	}
}

func TestClassify(t *testing.T) {
	now := time.Date(2026, 11, 2, 12, 0, 0, 0, time.UTC)
	resp := func(code int, retryAfter string) *http.Response {
		h := http.Header{}
		if retryAfter != "" {
			h.Set("Retry-After", retryAfter)
		}
		return &http.Response{StatusCode: code, Header: h}
	}
	refused := &url.Error{Op: "Post", URL: "http://provider", Err: &net.OpError{
		Op: "dial", Net: "tcp", Err: &net.DNSError{Err: "no such host", Name: "provider", IsNotFound: true},
	}}
	tests := []struct {
		name  string
		resp  *http.Response
		err   error
		wrote bool
		want  Outcome
		retry bool
		wait  time.Duration
	}{
		{"201 created", resp(201, ""), nil, true, Executed, false, 0},
		{"429 seconds", resp(429, "3"), nil, true, NotExecuted, true, 3 * time.Second},
		{"429 http date", resp(429, now.Add(30*time.Second).Format(http.TimeFormat)), nil, true, NotExecuted, true, 30 * time.Second},
		{"429 no header", resp(429, ""), nil, true, NotExecuted, true, time.Second},
		{"400 declined", resp(400, ""), nil, true, NotExecuted, false, 0},
		{"402 declined", resp(402, ""), nil, true, NotExecuted, false, 0},
		{"409 key in progress", resp(409, ""), nil, true, Ambiguous, false, 0},
		{"422 key reused with another body", resp(422, ""), nil, true, Ambiguous, false, 0},
		{"500", resp(500, ""), nil, true, Ambiguous, false, 0},
		{"503", resp(503, "5"), nil, true, Ambiguous, false, 0},
		{"dial error, nothing written", nil, refused, false, NotExecuted, true, dialRetryWait},
		{"dial error after a write", nil, refused, true, Ambiguous, false, 0},
		{"deadline", nil, &url.Error{Op: "Post", URL: "http://provider", Err: context.DeadlineExceeded}, true, Ambiguous, false, 0},
		{"unexpected EOF", nil, &url.Error{Op: "Post", URL: "http://provider", Err: io.ErrUnexpectedEOF}, true, Ambiguous, false, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			v := Classify(tt.resp, tt.err, tt.wrote, now)
			if v.Outcome != tt.want || v.Retry != tt.retry || v.Wait != tt.wait {
				t.Fatalf("got %v retry=%v wait=%v, want %v retry=%v wait=%v",
					v.Outcome, v.Retry, v.Wait, tt.want, tt.retry, tt.wait)
			}
		})
	}
}

func TestSendRetries429WithSameKey(t *testing.T) {
	p, base := startProvider(t, status(429, "Retry-After", "2"), status(201))
	var waits []time.Duration
	res := recordWaits(3, &waits).Send(context.Background(), newClient(t), payment(base, "pay-42:1"))

	if res.Outcome != Executed || res.Attempts != 2 {
		t.Fatalf("got %v after %d attempts, want executed after 2", res.Outcome, res.Attempts)
	}
	if !slices.Equal(waits, []time.Duration{2 * time.Second}) {
		t.Fatalf("waits = %v, want [2s] from Retry-After", waits)
	}
	if got := p.received(); !slices.Equal(got, []string{"pay-42:1", "pay-42:1"}) {
		t.Fatalf("provider saw keys %q, want the same key twice", got)
	}
	if !strings.Contains(string(res.Body), `"ref":"gw-1"`) {
		t.Fatalf("body = %s", res.Body)
	}
}

func TestSendLeavesLongRetryAfterToCaller(t *testing.T) {
	t.Run("longer than MaxWait", func(t *testing.T) {
		p, base := startProvider(t, status(429, "Retry-After", "120"))
		var waits []time.Duration
		res := recordWaits(3, &waits).Send(context.Background(), newClient(t), payment(base, "pay-42:1"))
		if res.Outcome != NotExecuted || !res.Retry || res.Wait != 2*time.Minute || res.Attempts != 1 {
			t.Fatalf("got %+v, want not executed, retry after 2m, 1 attempt", res.Verdict)
		}
		if len(waits) != 0 || len(p.received()) != 1 {
			t.Fatalf("waits %v, provider saw %d requests", waits, len(p.received()))
		}
	})
	t.Run("past the caller's deadline", func(t *testing.T) {
		p, base := startProvider(t, status(429, "Retry-After", "5"))
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		var waits []time.Duration
		res := recordWaits(3, &waits).Send(ctx, newClient(t), payment(base, "pay-42:1"))
		if res.Outcome != NotExecuted || res.Wait != 5*time.Second || res.Attempts != 1 {
			t.Fatalf("got %+v after %d attempts", res.Verdict, res.Attempts)
		}
		if len(waits) != 0 || len(p.received()) != 1 {
			t.Fatalf("waits %v, provider saw %d requests", waits, len(p.received()))
		}
	})
}

func TestSendDoesNotRetry5xxOrDecline(t *testing.T) {
	for _, tt := range []struct {
		code int
		want Outcome
	}{
		{http.StatusInternalServerError, Ambiguous},
		{http.StatusBadGateway, Ambiguous},
		{http.StatusUnprocessableEntity, Ambiguous},
		{http.StatusPaymentRequired, NotExecuted},
	} {
		t.Run(http.StatusText(tt.code), func(t *testing.T) {
			p, base := startProvider(t, status(tt.code))
			var waits []time.Duration
			res := recordWaits(3, &waits).Send(context.Background(), newClient(t), payment(base, "pay-42:1"))
			if res.Outcome != tt.want || res.Retry || res.Attempts != 1 || len(p.received()) != 1 {
				t.Fatalf("got %+v after %d attempts, provider saw %d", res.Verdict, res.Attempts, len(p.received()))
			}
		})
	}
}

func TestConnectionDroppedAfterSendIsAmbiguous(t *testing.T) {
	p, base := startProvider(t, dropConnection(t))
	var waits []time.Duration
	res := recordWaits(3, &waits).Send(context.Background(), newClient(t), payment(base, "pay-42:1"))

	if res.Outcome != Ambiguous || res.Attempts != 1 || !errors.Is(res.Err, io.EOF) {
		t.Fatalf("got %v after %d attempts, err %v; want ambiguous, 1, EOF", res.Outcome, res.Attempts, res.Err)
	}
	if got := p.received(); len(got) != 1 {
		t.Fatalf("provider saw %d requests, want 1", len(got))
	}
}

// On a reused keep-alive connection net/http itself resends a request that
// carries an Idempotency-Key, before our code sees any error.
func TestTransportResendsKeyedRequestOnReusedConnection(t *testing.T) {
	for _, tt := range []struct {
		key  string
		want []string
	}{
		{"pay-42:1", []string{"pay-42:1", "pay-42:1"}},
		{"", []string{""}},
	} {
		t.Run(fmt.Sprintf("key %q", tt.key), func(t *testing.T) {
			p, base := startProvider(t, dropConnection(t))
			hc := newClient(t)
			warmUp(t, hc, base)

			var waits []time.Duration
			res := recordWaits(1, &waits).Send(context.Background(), hc, payment(base, tt.key))
			if res.Outcome != Ambiguous || res.Attempts != 1 {
				t.Fatalf("got %v after %d attempts", res.Outcome, res.Attempts)
			}
			if got := p.received(); !slices.Equal(got, tt.want) {
				t.Fatalf("provider saw keys %q, want %q", got, tt.want)
			}
		})
	}
}

// The provider reads a keyed POST, then its host goes away: the reused
// connection breaks, the Transport replays the request on a new connection,
// and that dial is refused. Do returns a dial error although the provider has
// the request; only the trace shows that it was written.
func TestRedialFailureAfterWriteIsAmbiguous(t *testing.T) {
	p := &provider{t: t}
	srv := httptest.NewUnstartedServer(p)
	ln := srv.Listener
	p.answers = []func(http.ResponseWriter, *http.Request){func(w http.ResponseWriter, r *http.Request) {
		ln.Close() // nobody listens any more: the redial is refused
		dropConnection(t)(w, r)
	}}
	srv.Start()
	t.Cleanup(srv.Close)
	hc := newClient(t)
	warmUp(t, hc, srv.URL)

	var waits []time.Duration
	res := recordWaits(3, &waits).Send(context.Background(), hc, payment(srv.URL, "pay-42:1"))
	var op *net.OpError
	if !errors.As(res.Err, &op) || op.Op != "dial" || !errors.Is(res.Err, syscall.ECONNREFUSED) {
		t.Fatalf("err = %v, want a refused dial", res.Err)
	}
	if got := p.received(); !slices.Equal(got, []string{"pay-42:1"}) {
		t.Fatalf("provider saw keys %q, want the keyed request once", got)
	}
	if res.Outcome != Ambiguous || res.Retry || res.Attempts != 1 || len(waits) != 0 {
		t.Fatalf("got %+v after %d attempts, want ambiguous and no retry", res.Verdict, res.Attempts)
	}
	if v := Classify(nil, res.Err, false, time.Now()); v.Outcome != NotExecuted {
		t.Fatalf("without the trace the error alone gives %v, want it to look not executed", v.Outcome)
	}
}

func TestCancelAfterSendIsAmbiguous(t *testing.T) {
	arrived := make(chan struct{})
	p, base := startProvider(t, func(_ http.ResponseWriter, r *http.Request) {
		close(arrived)
		<-r.Context().Done() // the provider is slow; the client gives up first
	})
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go func() {
		<-arrived
		cancel() // a deadline that fires here behaves the same way
	}()
	var waits []time.Duration
	res := recordWaits(3, &waits).Send(ctx, newClient(t), payment(base, "pay-42:1"))

	if res.Outcome != Ambiguous || res.Attempts != 1 || !errors.Is(res.Err, context.Canceled) {
		t.Fatalf("got %v after %d attempts, err %v", res.Outcome, res.Attempts, res.Err)
	}
	if len(p.received()) != 1 {
		t.Fatalf("provider saw %d requests, want 1", len(p.received()))
	}
}

func TestDialRefusedIsRetried(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	base := "http://" + ln.Addr().String()
	ln.Close() // nobody listens: connect fails before a byte is sent

	var waits []time.Duration
	res := recordWaits(3, &waits).Send(context.Background(), newClient(t), payment(base, "pay-42:1"))
	if res.Outcome != NotExecuted || !res.Retry || res.Attempts != 3 {
		t.Fatalf("got %+v after %d attempts", res.Verdict, res.Attempts)
	}
	if !errors.Is(res.Err, syscall.ECONNREFUSED) {
		t.Fatalf("err = %v, want connection refused", res.Err)
	}
	if !slices.Equal(waits, []time.Duration{dialRetryWait, dialRetryWait}) {
		t.Fatalf("waits = %v", waits)
	}
}
