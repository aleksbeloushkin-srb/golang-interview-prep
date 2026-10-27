package main

import (
	"fmt"
	"iter"
)

func Backward(s []int) iter.Seq[int] {
	return func(yield func(int) bool) {
		for i := len(s) - 1; i >= 0; i-- {
			if !yield(s[i]) {
				return
			}
		}
	}
}

func main() {
	next, stop := iter.Pull(Backward([]int{1, 2, 3}))
	defer stop()
	v, ok := next()
	fmt.Println(v, ok)
	stop()
	v, ok = next()
	fmt.Println(v, ok)
}
