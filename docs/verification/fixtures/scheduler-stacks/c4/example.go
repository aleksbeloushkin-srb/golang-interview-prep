package main

import (
	"fmt"
	"runtime"
)

func main() {
	var stats runtime.MemStats
	runtime.ReadMemStats(&stats)
	// Values depend on the process and workload; these are not RSS or live frames.
	fmt.Println("stack spans:", stats.StackInuse, "bytes")
	fmt.Println("goroutines:", runtime.NumGoroutine())
}
