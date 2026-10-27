package batch

import "sync"

func ProcessBatch(items []int) []int {
	var results []int
	var wg sync.WaitGroup
	for _, item := range items {
		wg.Add(1)
		go func(v int) {
			defer wg.Done()
			results = append(results, v*2)
		}(item)
	}
	wg.Wait()
	return results
}
