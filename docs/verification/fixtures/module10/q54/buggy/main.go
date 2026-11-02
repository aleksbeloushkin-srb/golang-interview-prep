package main

import (
	"fmt"
	"time"
)

func main() {
	flush := time.NewTimer(time.Millisecond) // flush the batch at least every millisecond
	batch := []string{"pay-1", "pay-2"}
	time.Sleep(20 * time.Millisecond) // a slow payment: the flush time is long past

	fmt.Println("len:", len(flush.C), "cap:", cap(flush.C))
	if len(flush.C) > 0 { // "the timer has fired"
		fmt.Println("flush", len(batch))
	} else {
		fmt.Println("keep collecting")
	}
}
