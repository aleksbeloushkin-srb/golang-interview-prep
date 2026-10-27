package main

import "fmt"

func main() {
	done := make(chan struct{})
	go func() {
		fmt.Println("work finished")
		close(done)
	}()
	<-done // Wait for completion; a Sleep would not establish this ordering.
}
