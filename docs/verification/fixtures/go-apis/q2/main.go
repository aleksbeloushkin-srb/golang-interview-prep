package main

import "fmt"

type MyError struct{}

func (*MyError) Error() string { return "boom" }

func returnsError() error {
	var p *MyError
	return p
}

func main() { fmt.Println(returnsError() == nil) }
