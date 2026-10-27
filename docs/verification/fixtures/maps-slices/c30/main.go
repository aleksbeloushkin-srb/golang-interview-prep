package main

import "fmt"

type Counter struct{ N int }

func main() {
	m := map[string]Counter{"go": {N: 1}}
	v := m["go"]
	v.N++
	fmt.Println(m["go"].N)
	m["go"] = v
	fmt.Println(m["go"].N)
}
