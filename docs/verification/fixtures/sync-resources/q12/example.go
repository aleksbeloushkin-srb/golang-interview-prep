package batch

import "sync"

func ProcessBatch(items []int) []int {
	results := make([]int, len(items))
	var wg sync.WaitGroup
	for i, item := range items {
		wg.Add(1)
		go func(index, v int) {
			defer wg.Done()
			results[index] = v * 2
		}(i, item)
	}
	wg.Wait()
	return results
}
