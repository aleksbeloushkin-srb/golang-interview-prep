// Package ratelimit is the reference solution for practice task W4-2:
// a token bucket rate limiter.
package ratelimit

import (
	"context"
	"sync"
	"time"
)

// Limiter allows events at rate tokens per second with bursts of up to burst events.
// It starts full. It is safe for concurrent use.
type Limiter struct {
	mu     sync.Mutex
	rate   float64 // tokens added per second
	burst  float64 // bucket capacity
	tokens float64
	last   time.Time
	now    func() time.Time
}

// New returns a limiter that uses the real clock.
func New(rate float64, burst int) *Limiter {
	return NewWithClock(rate, burst, time.Now)
}

// NewWithClock lets tests control time. rate must be > 0 and burst >= 1.
func NewWithClock(rate float64, burst int, now func() time.Time) *Limiter {
	if rate <= 0 || burst < 1 {
		panic("ratelimit: rate must be > 0 and burst >= 1")
	}
	return &Limiter{rate: rate, burst: float64(burst), tokens: float64(burst), last: now(), now: now}
}

// refill adds the tokens earned since the last call. Callers hold mu.
func (l *Limiter) refill() time.Time {
	now := l.now()
	if elapsed := now.Sub(l.last); elapsed > 0 {
		l.tokens = min(l.burst, l.tokens+elapsed.Seconds()*l.rate)
		l.last = now
	}
	return now
}

// Allow reports whether one event may happen now, and takes a token if so.
func (l *Limiter) Allow() bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.refill()
	if l.tokens >= 1 {
		l.tokens--
		return true
	}
	return false
}

// Wait blocks until a token is available or ctx is done.
func (l *Limiter) Wait(ctx context.Context) error {
	for {
		l.mu.Lock()
		l.refill()
		if l.tokens >= 1 {
			l.tokens--
			l.mu.Unlock()
			return nil
		}
		// Time until the next whole token; computed under the lock, slept without it.
		delay := time.Duration((1 - l.tokens) / l.rate * float64(time.Second))
		l.mu.Unlock()

		timer := time.NewTimer(delay)
		select {
		case <-ctx.Done():
			timer.Stop()
			return ctx.Err()
		case <-timer.C:
		}
	}
}
