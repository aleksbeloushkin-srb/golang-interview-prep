package squares

import "sync"

// Squares returns n*n for every n, computed by three workers.
func Squares(nums []int) []int {
	jobs := make(chan int)
	out := make(chan int)
	var wg sync.WaitGroup
	for range 3 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer close(out)
			for n := range jobs {
				out <- n * n
			}
		}()
	}
	go func() {
		defer close(jobs)
		for _, n := range nums {
			jobs <- n
		}
	}()

	var res []int
	for v := range out {
		res = append(res, v)
	}
	return res
}
