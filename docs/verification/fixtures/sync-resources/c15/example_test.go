package main

import (
	"sync"
	"sync/atomic"
	"testing"
)

func TestWithdrawInvariant(t *testing.T) {
	a := Account{balance: 10}
	var successes atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 64; i++ {
		wg.Go(func() {
			if a.Withdraw(7) {
				successes.Add(1)
			}
		})
	}
	wg.Wait()
	if successes.Load() != 1 || a.balance != 3 {
		t.Fatalf("successes=%d balance=%d", successes.Load(), a.balance)
	}
	if a.Withdraw(0) || a.Withdraw(-1) {
		t.Fatal("accepted nonpositive withdrawal")
	}
}
