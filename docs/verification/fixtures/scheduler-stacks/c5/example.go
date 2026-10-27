package main

import "fmt"

func descend(depth int, value *int) int {
	var frame [1024]byte
	frame[0] = byte(depth)
	if depth == 0 {
		*value = 42
		return 0
	}
	sum := descend(depth-1, value)
	return sum + int(frame[0]) // Keep frame data live across the call.
}

func main() {
	value := 0
	sum := descend(64, &value)
	fmt.Println(value, sum) // 42 2080; not a measurement of stack addresses.
}
