package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var once sync.Once
	var base int
	results := make([]int, 2)
	for i := range results {
		wg.Go(func() {
			once.Do(func() { base = 42 })
			results[i] = base
		})
	}
	wg.Wait()
	fmt.Println(results) // [42 42]
}
