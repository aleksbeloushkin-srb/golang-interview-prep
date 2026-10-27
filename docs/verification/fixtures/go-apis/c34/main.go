package main

import "fmt"

type Counter struct{ N int }
type Setter interface{ Set(int) }

func (c *Counter) Set(n int) { c.N = n }

var _ Setter = (*Counter)(nil)

func main() {
	c := Counter{N: 1}
	c.Set(2)
	var s Setter = &c
	s.Set(3)
	fmt.Println(c.N)
}
