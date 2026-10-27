package main

import "fmt"

func main() {
	m := map[string]int{"go": 1}
	alias := m
	m = make(map[string]int)
	fmt.Println(len(m), len(alias))
	clear(alias)
	fmt.Println(len(m), len(alias))
}
