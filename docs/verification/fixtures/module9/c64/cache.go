// Package cache shows golang.org/x/sync/singleflight filling a gap in the
// standard library: concurrent cache misses for one key cause one load.
package cache

import (
	"context"
	"fmt"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

type LoadFunc func(ctx context.Context, key string) (int64, error)

// Cache keeps loaded values in memory. It never evicts: in a service that
// job goes to a library such as ristretto or to Redis.
type Cache struct {
	load    LoadFunc
	timeout time.Duration
	group   singleflight.Group

	mu    sync.Mutex
	items map[string]int64
}

func New(load LoadFunc, timeout time.Duration) *Cache {
	return &Cache{load: load, timeout: timeout, items: make(map[string]int64)}
}

// Get returns the cached value or loads it. Concurrent misses for one key
// share one load; a caller whose ctx ends stops waiting, and the load goes on.
func (c *Cache) Get(ctx context.Context, key string) (int64, error) {
	if v, ok := c.cached(key); ok {
		return v, nil
	}
	ch := c.group.DoChan(key, func() (any, error) {
		if v, ok := c.cached(key); ok { // a load that has just finished stored it
			return v, nil
		}
		// The load is shared, so one caller leaving must not cancel it for the rest.
		lctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), c.timeout)
		defer cancel()
		v, err := c.load(lctx, key)
		if err != nil {
			return nil, err // the current waiters get it; nothing is cached
		}
		c.mu.Lock()
		c.items[key] = v
		c.mu.Unlock()
		return v, nil
	})
	select {
	case r := <-ch:
		if r.Err != nil {
			return 0, fmt.Errorf("load %q: %w", key, r.Err)
		}
		return r.Val.(int64), nil
	case <-ctx.Done():
		return 0, ctx.Err() // ch has a buffer of one, so the load never blocks on us
	}
}

func (c *Cache) cached(key string) (int64, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	v, ok := c.items[key]
	return v, ok
}
