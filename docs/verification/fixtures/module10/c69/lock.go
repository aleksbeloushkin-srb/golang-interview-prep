// Package lock is a lease lock on a key-value store such as Redis: a random
// token proves ownership, the lock expires after a TTL, and every acquisition
// gets a fencing token that the protected resource checks.
package lock

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"sync"
	"time"
)

var (
	ErrNotAcquired = errors.New("lock is held by another owner")
	ErrNotHeld     = errors.New("lock is not held: it expired or another owner took it")
	ErrStaleFence  = errors.New("stale fencing token")
)

// Store is the part of Redis that a lock needs.
type Store interface {
	// SetNX stores token under key for ttl if the key is absent or expired.
	// On success it returns the key's fencing token, which grows with every
	// successful SetNX.
	SetNX(ctx context.Context, key, token string, ttl time.Duration) (fence int64, ok bool, err error)
	// CompareAndDelete deletes key only if it still holds token.
	CompareAndDelete(ctx context.Context, key, token string) (bool, error)
}

// AcquireScript is SetNX for Redis. KEYS[1] is the lock, KEYS[2] its fence
// counter; ARGV[1] is the token, ARGV[2] the TTL in milliseconds. One script
// sets the lock and increments the counter together. In Redis Cluster both
// keys need one hash tag, for example {order:42} and {order:42}:fence.
const AcquireScript = `
if redis.call("SET", KEYS[1], ARGV[1], "NX", "PX", ARGV[2]) then
  return redis.call("INCR", KEYS[2])
end
return 0`

// ReleaseScript is CompareAndDelete for Redis. Redis runs a script without
// other commands in between, so no one can take the lock between the GET and
// the DEL. A plain DEL would remove a lock that another owner took after ours
// expired.
const ReleaseScript = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0`

// Lock is one acquisition of a key.
type Lock struct {
	store Store
	key   string
	token string
	fence int64
}

// Acquire takes the lock on key for ttl or returns ErrNotAcquired.
func Acquire(ctx context.Context, s Store, key string, ttl time.Duration) (*Lock, error) {
	token := rand.Text() // 128 random bits: no other owner has the same token
	fence, ok, err := s.SetNX(ctx, key, token, ttl)
	if err != nil {
		return nil, fmt.Errorf("acquire %s: %w", key, err)
	}
	if !ok {
		return nil, ErrNotAcquired
	}
	return &Lock{store: s, key: key, token: token, fence: fence}, nil
}

// Fence returns the fencing token to send with every write under this lock.
func (l *Lock) Fence() int64 { return l.fence }

// Release deletes the lock if it is still ours. Pass a fresh short context,
// not the work context: if that one has expired, nothing is sent and the
// key stays until its TTL ends.
func (l *Lock) Release(ctx context.Context) error {
	ok, err := l.store.CompareAndDelete(ctx, l.key, l.token)
	if err != nil {
		return fmt.Errorf("release %s: %w", l.key, err)
	}
	if !ok {
		return ErrNotHeld
	}
	return nil
}

// MemStore is an in-memory Store. now is injected so that tests move time
// instead of sleeping.
type MemStore struct {
	now func() time.Time

	mu     sync.Mutex
	locks  map[string]held
	fences map[string]int64
}

type held struct {
	token string
	until time.Time
}

func NewMemStore(now func() time.Time) *MemStore {
	return &MemStore{now: now, locks: make(map[string]held), fences: make(map[string]int64)}
}

func (m *MemStore) SetNX(ctx context.Context, key, token string, ttl time.Duration) (int64, bool, error) {
	if err := ctx.Err(); err != nil {
		return 0, false, err // like a network client: a dead context sends nothing
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	now := m.now()
	if h, ok := m.locks[key]; ok && now.Before(h.until) {
		return 0, false, nil
	}
	m.locks[key] = held{token: token, until: now.Add(ttl)}
	m.fences[key]++
	return m.fences[key], true, nil
}

func (m *MemStore) CompareAndDelete(ctx context.Context, key, token string) (bool, error) {
	if err := ctx.Err(); err != nil {
		return false, err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	h, ok := m.locks[key]
	if !ok || h.token != token || !m.now().Before(h.until) {
		return false, nil // an expired key is gone in Redis too
	}
	delete(m.locks, key)
	return true, nil
}

// Storage stands for the resource the lock protects. It keeps the highest
// fence it has accepted and rejects older ones, as in SQL:
//
//	UPDATE reports SET body = $2, fence = $3 WHERE id = $1 AND fence <= $3
type Storage struct {
	mu    sync.Mutex
	fence int64
	body  string
}

func (s *Storage) Write(fence int64, body string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if fence < s.fence {
		return fmt.Errorf("write with fence %d after %d: %w", fence, s.fence, ErrStaleFence)
	}
	s.fence, s.body = fence, body
	return nil
}

func (s *Storage) Body() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.body
}
