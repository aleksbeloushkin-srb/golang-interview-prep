package main

type Counter struct{ N int }

func (c *Counter) Set(n int) { c.N = n }
func main() {
	m := map[int]Counter{0: {N: 1}}
	m[0].Set(2)
}
