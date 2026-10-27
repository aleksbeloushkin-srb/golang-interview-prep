package main

import "fmt"

func f() (n int) {
	n = 1
	defer fmt.Println("arg", n)
	defer func() {
		n++
		fmt.Println("closure", n)
	}()
	return 2
}

func main() { fmt.Println("result", f()) }
