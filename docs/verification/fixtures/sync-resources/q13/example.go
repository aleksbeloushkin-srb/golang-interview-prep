package cache

import "sync"

type Client struct{ Endpoint string }
type Cache struct {
	mu        sync.RWMutex
	clients   map[string]*Client   // initialized before use
	newClient func(string) *Client // teaching model: cannot fail
}

func (c *Cache) Get(endpoint string) *Client {
	c.mu.RLock()
	cli, ok := c.clients[endpoint]
	c.mu.RUnlock()
	if ok {
		return cli
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if cli, ok := c.clients[endpoint]; ok {
		return cli
	}
	cli = c.newClient(endpoint)
	c.clients[endpoint] = cli
	return cli
}
