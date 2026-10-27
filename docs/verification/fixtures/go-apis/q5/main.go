package main

import "fmt"

func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("main recovered:", r)
		}
	}()
	ch := make(chan int)
	close(ch)
	done := make(chan struct{})
	go func() {
		ch <- 42
		close(done)
	}()
	<-done
}
