package main

import "fmt"

func main() {
	values := make(chan int)
	n := 1
	go func(value int) { values <- value }(n)
	n = 2
	fmt.Println(<-values, n) // 1 2; no timing assumption.
}
