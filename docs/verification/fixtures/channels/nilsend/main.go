// Command nilsend sends to a nil channel. It compiles and passes go vet;
// the runtime reports a deadlock because no other goroutine can run.
package main

func main() {
	var ch chan int
	ch <- 1
}
