// Package counter is the reference solution for practice task W3-4:
// one counter, three ways to make it safe for concurrent use.
package counter

import (
	"sync"
	"sync/atomic"
)

// Counter is safe for concurrent use. Close releases resources;
// the counter must not be used after Close.
type Counter interface {
	Inc()
	Value() int64
	Close()
}

// MutexCounter guards the value with a mutex.
type MutexCounter struct {
	mu sync.Mutex
	n  int64
}

func NewMutexCounter() Counter { return &MutexCounter{} }

func (c *MutexCounter) Inc() {
	c.mu.Lock()
	c.n++
	c.mu.Unlock()
}

func (c *MutexCounter) Value() int64 {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.n
}

func (c *MutexCounter) Close() {}

// AtomicCounter uses one atomic word: enough when the state is a single number.
type AtomicCounter struct {
	n atomic.Int64
}

func NewAtomicCounter() Counter { return &AtomicCounter{} }

func (c *AtomicCounter) Inc()         { c.n.Add(1) }
func (c *AtomicCounter) Value() int64 { return c.n.Load() }
func (c *AtomicCounter) Close()       {}

// ChanCounter gives the value to one owner goroutine; others talk to it over channels.
type ChanCounter struct {
	inc  chan struct{}
	get  chan chan int64
	done chan struct{}
}

func NewChanCounter() Counter {
	c := &ChanCounter{
		inc:  make(chan struct{}),
		get:  make(chan chan int64),
		done: make(chan struct{}),
	}
	go c.loop()
	return c
}

func (c *ChanCounter) loop() {
	var n int64 // only this goroutine touches n
	for {
		select {
		case <-c.inc:
			n++
		case reply := <-c.get:
			reply <- n
		case <-c.done:
			return
		}
	}
}

// Inc returns after the owner has received the request, so a later Value sees it.
func (c *ChanCounter) Inc() { c.inc <- struct{}{} }

func (c *ChanCounter) Value() int64 {
	reply := make(chan int64)
	c.get <- reply
	return <-reply
}

// Close stops the owner goroutine.
func (c *ChanCounter) Close() { close(c.done) }
