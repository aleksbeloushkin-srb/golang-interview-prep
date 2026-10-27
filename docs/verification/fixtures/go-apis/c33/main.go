package main

import "fmt"

func main() {
	var p *int
	var x any = p
	fmt.Println(x == nil, p == nil)
	v, ok := x.(*int)
	fmt.Println(ok, v == nil)
}
