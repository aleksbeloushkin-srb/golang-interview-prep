package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu sync.Mutex
	n  int
}

func (c *Counter) Inc() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++
	c.Log()
}
func (c *Counter) Log() {
	c.mu.Lock()
	defer c.mu.Unlock()
	fmt.Println(c.n)
}
func main() { var c Counter; c.Inc() }
