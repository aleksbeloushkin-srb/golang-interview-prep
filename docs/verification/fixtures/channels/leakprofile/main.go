// Command leakprofile prints the goroutineleak profile after a leaking scenario.
// The profile is on by default in Go 1.27; Go 1.26 needs
// GOEXPERIMENT=goroutineleakprofile; earlier versions have no such profile.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"runtime"
	"runtime/pprof"
	"strings"
	"time"

	"example.com/channels/leaks"
)

func main() {
	scenario := flag.String("scenario", "boss", "boss, boss-buffered, first or global")
	flag.Parse()
	switch *scenario {
	case "boss", "boss-buffered":
		buffer := 0
		if *scenario == "boss-buffered" {
			buffer = 1
		}
		ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
		in, out := make(chan int), make(chan int)
		go func() {
			defer close(in)
			for i := range 100 {
				select {
				case in <- i:
				case <-ctx.Done():
					return
				}
			}
		}()
		leaks.ProcessParallel(ctx, in, out, 5, buffer, 100*time.Millisecond)
		for range out {
		}
		cancel()
		time.Sleep(1100 * time.Millisecond) // every sleep (up to 900 ms) is over
	case "first":
		leaks.FirstLeaky(func() int { return 1 }, func() int { return 2 }, func() int { return 3 })
		time.Sleep(100 * time.Millisecond)
	case "global":
		leaks.LeakOnGlobal()
		time.Sleep(100 * time.Millisecond)
	}
	p := pprof.Lookup("goroutineleak")
	if p == nil {
		fmt.Printf("%s: no goroutineleak profile in %s; goroutines %d\n", *scenario, runtime.Version(), runtime.NumGoroutine())
		return
	}
	var b strings.Builder
	p.WriteTo(&b, 1)
	first := strings.SplitN(b.String(), "\n", 2)[0]
	fmt.Printf("%s: %s; goroutines %d\n", *scenario, first, runtime.NumGoroutine())
	if strings.Contains(os.Getenv("SHOW"), *scenario) {
		fmt.Print(b.String())
	}
}
