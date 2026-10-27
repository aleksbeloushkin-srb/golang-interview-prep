package main

import (
	"fmt"
	"sync"
)

func main() {
	var mu sync.Mutex
	mu.Lock()
	fmt.Println(mu.TryLock()) // false: already locked
	mu.Unlock()
	if mu.TryLock() {
		fmt.Println("acquired")
		mu.Unlock()
	}
}
