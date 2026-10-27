package main

import "fmt"

func main() {
	a := make([]int, 2, 4)
	a[0], a[1] = 1, 2
	limited := a[:len(a):len(a)]
	limited[0] = 9
	grown := append(limited, 3)
	grown[0] = 7
	independent := make([]int, len(a))
	copy(independent, a)
	independent[1] = 8
	fmt.Println(a, grown, independent)
}
