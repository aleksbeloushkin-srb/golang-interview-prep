package main

type Counter struct{ N int }
type Setter interface{ Set(int) }

func (c *Counter) Set(n int) { c.N = n }

var _ Setter = Counter{}

func main() {}
