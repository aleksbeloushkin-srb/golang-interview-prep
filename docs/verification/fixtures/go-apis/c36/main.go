package main

import (
	"fmt"
	"runtime"
	"unique"
	"weak"
)

func main() {
	obj := &struct{ Value int }{Value: 42}
	w := weak.Make(obj)
	got := w.Value()
	fmt.Println(got == obj)
	runtime.KeepAlive(obj)
	a := unique.Make("go")
	b := unique.Make(string([]byte{'g', 'o'}))
	fmt.Println(a == b)
}
