package main

import "fmt"

func main() {
	a := make([]int, 2, 4)
	a[0], a[1] = 1, 2
	b := append(a, 3)
	c := append(a, 4)
	fmt.Println(b[2], c[2])
}
