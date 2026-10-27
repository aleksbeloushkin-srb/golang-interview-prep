package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu sync.Mutex
	n  int
}

func (c *Counter) Inc() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++
	return c.n
}
func main() {
	var c Counter
	snapshot := c.Inc()
	fmt.Println(snapshot) // 1; printing is outside the lock
}
