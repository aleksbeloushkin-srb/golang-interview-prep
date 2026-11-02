package main

import (
	"fmt"
	"time"
)

func main() {
	flush := time.NewTimer(time.Millisecond) // flush the batch at least every millisecond
	batch := []string{"pay-1", "pay-2"}
	time.Sleep(20 * time.Millisecond) // a slow payment: the flush time is long past

	select {
	case <-flush.C: // the timer has fired: the receive succeeds at once
		fmt.Println("flush", len(batch))
	default:
		fmt.Println("keep collecting")
	}
}
