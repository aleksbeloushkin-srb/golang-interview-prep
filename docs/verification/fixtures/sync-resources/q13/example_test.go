package cache

import (
	"sync"
	"sync/atomic"
	"testing"
)

func TestOneCreationAndSameClient(t *testing.T) {
	var count atomic.Int32
	c := Cache{clients: make(map[string]*Client), newClient: func(s string) *Client { count.Add(1); return &Client{Endpoint: s} }}
	start := make(chan struct{})
	got := make([]*Client, 64)
	var wg sync.WaitGroup
	for i := range got {
		wg.Go(func() { <-start; got[i] = c.Get("endpoint") })
	}
	close(start)
	wg.Wait()
	if count.Load() != 1 {
		t.Fatal(count.Load())
	}
	for _, v := range got {
		if v != got[0] {
			t.Fatal("different client")
		}
	}
}

// This models the stale-check interleaving explicitly; it is not a scheduling claim.
func TestLockedAccessCanStillHaveLogicRace(t *testing.T) {
	var mu sync.RWMutex
	clients := map[string]int{}
	checked := make(chan struct{}, 2)
	release := make(chan struct{})
	var wg sync.WaitGroup
	creations := 0
	for i := 0; i < 2; i++ {
		wg.Go(func() {
			mu.RLock()
			_, ok := clients["key"]
			mu.RUnlock()
			if ok {
				return
			}
			checked <- struct{}{}
			<-release
			mu.Lock()
			defer mu.Unlock()
			creations++
			clients["key"] = creations
		})
	}
	<-checked
	<-checked
	close(release)
	wg.Wait()
	if creations != 2 {
		t.Fatal(creations)
	}
}
