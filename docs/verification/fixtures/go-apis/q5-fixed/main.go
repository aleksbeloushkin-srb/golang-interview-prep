package main

import "fmt"

func main() {
	ch := make(chan int)
	close(ch)
	done := make(chan struct{})
	go func() {
		defer close(done)
		defer func() {
			if r := recover(); r != nil {
				fmt.Println("sender recovered:", r)
			}
		}()
		ch <- 42
	}()
	<-done
}
