package main

import (
	"fmt"
	"sync"
)

type Account struct {
	mu      sync.Mutex
	balance int
}

func (a *Account) Withdraw(n int) bool {
	a.mu.Lock()
	defer a.mu.Unlock()
	if n <= 0 || a.balance < n {
		return false
	}
	a.balance -= n
	return true
}
func main() {
	a := Account{balance: 10}
	fmt.Println(a.Withdraw(7), a.Withdraw(7)) // true false
}
