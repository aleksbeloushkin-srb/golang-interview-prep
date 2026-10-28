// Package safecache is the reference solution for practice task W3-5.
package safecache

import (
	"maps"
	"slices"
	"sync"
)

// Item is a cached value. Its slices are mutable, so the cache copies them
// on the way in and on the way out: callers never share memory with the cache.
type Item struct {
	Value []byte
	Tags  []string
}

func (it Item) clone() Item {
	return Item{Value: slices.Clone(it.Value), Tags: slices.Clone(it.Tags)}
}

// Cache is safe for concurrent use.
//
// Invariant, kept under one lock: bytes == sum of len(Value) over all items.
type Cache struct {
	mu    sync.RWMutex
	items map[string]Item
	bytes int
}

func New() *Cache {
	return &Cache{items: make(map[string]Item)}
}

func (c *Cache) Set(key string, it Item) {
	it = it.clone() // copy before taking the lock: the caller may change its slices later
	c.mu.Lock()
	defer c.mu.Unlock()
	if old, ok := c.items[key]; ok {
		c.bytes -= len(old.Value)
	}
	c.items[key] = it
	c.bytes += len(it.Value)
}

func (c *Cache) Get(key string) (Item, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	it, ok := c.items[key]
	if !ok {
		return Item{}, false
	}
	return it.clone(), true
}

func (c *Cache) Delete(key string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	old, ok := c.items[key]
	if !ok {
		return false
	}
	delete(c.items, key)
	c.bytes -= len(old.Value)
	return true
}

func (c *Cache) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.items)
}

// Bytes returns the total length of all values.
func (c *Cache) Bytes() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.bytes
}

// Snapshot returns a deep copy of all items.
func (c *Cache) Snapshot() map[string]Item {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make(map[string]Item, len(c.items))
	for k, it := range maps.All(c.items) {
		out[k] = it.clone()
	}
	return out
}
