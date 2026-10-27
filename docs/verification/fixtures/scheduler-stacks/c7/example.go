package main

import (
	"fmt"
	"runtime"
)

func main() {
	// A non-positive argument queries the setting without changing it.
	fmt.Println("parallel Go execution limit:", runtime.GOMAXPROCS(0))
	// This is not the number of threads or an external-service concurrency limit.
}
