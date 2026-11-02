// Package callout classifies the outcome of a write sent to a payment
// provider and resends it only when the provider certainly did nothing.
//
// Around Send the service holds no transaction:
//
//	tx1: lock the payment, insert attempt n with key "<payment>:<n>", COMMIT
//	res := policy.Send(ctx, hc, newReq) // deadline shorter than the task lease
//	Executed            → tx2 applies the status if attempt n is still open
//	NotExecuted, !Retry → tx2 fails the payment (an explicit refusal)
//	NotExecuted, Retry  → the task runs again after res.Wait with the same key
//	Ambiguous           → attempt n becomes unknown; reconcile by reference
package callout

import (
	"context"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httptrace"
	"strconv"
	"sync/atomic"
	"time"
)

// Outcome is what we know about a write after one HTTP exchange.
type Outcome int

const (
	// Executed: the provider answered 2xx, the operation happened.
	Executed Outcome = iota + 1
	// NotExecuted: the provider certainly did nothing: it refused, or the
	// request was never written.
	NotExecuted
	// Ambiguous: the operation may have happened.
	Ambiguous
)

func (o Outcome) String() string {
	switch o {
	case Executed:
		return "executed"
	case NotExecuted:
		return "not executed"
	case Ambiguous:
		return "ambiguous"
	}
	return "Outcome(" + strconv.Itoa(int(o)) + ")"
}

// Verdict is the classified result of one exchange.
type Verdict struct {
	Outcome Outcome
	Status  int           // 0 when no response arrived
	Retry   bool          // NotExecuted, and the same request may be sent again
	Wait    time.Duration // the pause before that retry
	Err     error         // the transport error, if any
}

const (
	dialRetryWait     = 200 * time.Millisecond
	defaultRetryAfter = time.Second
	maxBody           = 1 << 20
)

// Classify maps the result of http.Client.Do for a write request. wrote
// reports whether the Transport wrote the request at least once during Do,
// as seen by httptrace.ClientTrace.WroteRequest.
func Classify(resp *http.Response, err error, wrote bool, now time.Time) Verdict {
	if err != nil {
		var op *net.OpError
		if errors.As(err, &op) && op.Op == "dial" && !wrote {
			// No connection and nothing written: resend with the same key.
			return Verdict{Outcome: NotExecuted, Retry: true, Wait: dialRetryWait, Err: err}
		}
		// A timeout, reset or EOF, or a failed redial after the Transport
		// wrote a keyed request on a reused connection: it may have executed.
		return Verdict{Outcome: Ambiguous, Err: err}
	}
	v := Verdict{Status: resp.StatusCode}
	switch code := resp.StatusCode; {
	case code >= 200 && code < 300:
		v.Outcome = Executed
	case code == http.StatusTooManyRequests:
		// Refused before processing; Retry-After says when to come back.
		v.Outcome, v.Retry = NotExecuted, true
		v.Wait = retryAfter(resp.Header.Get("Retry-After"), now)
	case code == http.StatusConflict, code == http.StatusUnprocessableEntity:
		// 409: a request with this key is still running. 422: the key may
		// have been used with another body, and that request may have run.
		v.Outcome = Ambiguous
	case code >= 400 && code < 500:
		// An explicit refusal such as 400 or 402: do not resend.
		v.Outcome = NotExecuted
	default:
		// 5xx and anything unexpected: it may have executed before failing.
		v.Outcome = Ambiguous
	}
	return v
}

// retryAfter parses Retry-After given in seconds or as an HTTP date.
func retryAfter(v string, now time.Time) time.Duration {
	if secs, err := strconv.Atoi(v); err == nil && secs >= 0 {
		return time.Duration(secs) * time.Second
	}
	if t, err := http.ParseTime(v); err == nil {
		return max(t.Sub(now), 0)
	}
	return defaultRetryAfter
}

// Policy resends a write only while the verdict is NotExecuted with Retry.
type Policy struct {
	MaxAttempts int           // sends in total, at least 1
	MaxWait     time.Duration // the longest pause waited in-line
	Sleep       func(ctx context.Context, d time.Duration) error
	Now         func() time.Time
}

// Result is the last verdict, the response body and the number of sends.
type Result struct {
	Verdict
	Body     []byte
	Attempts int
}

// Send builds a request with newReq and sends it until the outcome is final.
// newReq must use the ctx it gets, which carries the trace, and put the same
// Idempotency-Key on every request it builds. A retryable result is returned
// when the attempts run out or the wait does not fit: the caller schedules
// the task after res.Wait.
func (p Policy) Send(ctx context.Context, hc *http.Client, newReq func(context.Context) (*http.Request, error)) Result {
	for attempt := 1; ; attempt++ {
		var wrote atomic.Bool // set from the Transport's write goroutine
		traced := httptrace.WithClientTrace(ctx, &httptrace.ClientTrace{
			WroteRequest: func(httptrace.WroteRequestInfo) { wrote.Store(true) },
		})
		req, err := newReq(traced)
		if err != nil {
			return Result{Verdict: Verdict{Outcome: NotExecuted, Err: err}, Attempts: attempt - 1}
		}
		resp, err := hc.Do(req)
		res := Result{Verdict: Classify(resp, err, wrote.Load(), p.now()), Attempts: attempt}
		if resp != nil {
			body, err := io.ReadAll(io.LimitReader(resp.Body, maxBody))
			resp.Body.Close()
			res.Body = body
			if err != nil && res.Outcome == Executed {
				// The provider acted, but we could not read what it said.
				res.Outcome, res.Err = Ambiguous, err
			}
		}
		if !res.Retry || attempt >= p.MaxAttempts || res.Wait > p.MaxWait || !fits(ctx, res.Wait) {
			return res
		}
		if err := p.sleep(ctx, res.Wait); err != nil {
			return res
		}
	}
}

// fits reports whether waiting d still leaves time before ctx's deadline.
func fits(ctx context.Context, d time.Duration) bool {
	deadline, ok := ctx.Deadline()
	return !ok || time.Until(deadline) > d
}

func (p Policy) now() time.Time {
	if p.Now != nil {
		return p.Now()
	}
	return time.Now()
}

func (p Policy) sleep(ctx context.Context, d time.Duration) error {
	if p.Sleep != nil {
		return p.Sleep(ctx, d)
	}
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-t.C:
		return nil
	}
}
