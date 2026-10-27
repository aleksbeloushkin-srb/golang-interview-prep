package main

import "fmt"

func returnsError() error { return nil }

func main() { fmt.Println(returnsError() == nil) }
