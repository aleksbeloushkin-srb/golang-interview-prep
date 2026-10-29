// Package transfers is the reference solution for practice task W6-1: concurrent
// transfers between in-memory accounts, with per-account locks taken in ID order.
package transfers

import (
	"errors"
	"fmt"
	"maps"
	"slices"
	"sync"
)

var (
	ErrNotFound          = errors.New("account not found")
	ErrSameAccount       = errors.New("same account")
	ErrInvalidAmount     = errors.New("amount must be positive")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

type account struct {
	mu      sync.Mutex
	balance int64
}

// Ledger holds the accounts created by New; the set of accounts never changes afterwards,
// so the map itself needs no lock.
type Ledger struct {
	accounts map[int64]*account
	ids      []int64 // ascending: the one lock order for every operation
}

// New creates a ledger with the given opening balances.
func New(balances map[int64]int64) *Ledger {
	l := &Ledger{accounts: make(map[int64]*account, len(balances))}
	for id, b := range balances {
		l.accounts[id] = &account{balance: b}
	}
	l.ids = slices.Sorted(maps.Keys(l.accounts))
	return l
}

// Transfer moves amount from one account to another as one step: no other
// operation sees the money in neither or in both accounts.
func (l *Ledger) Transfer(from, to, amount int64) error {
	if amount <= 0 {
		return ErrInvalidAmount
	}
	if from == to {
		return ErrSameAccount // sync.Mutex is not reentrant: locking it twice would hang
	}
	src, ok := l.accounts[from]
	if !ok {
		return fmt.Errorf("transfer from %d: %w", from, ErrNotFound)
	}
	dst, ok := l.accounts[to]
	if !ok {
		return fmt.Errorf("transfer to %d: %w", to, ErrNotFound)
	}

	// Lock in ascending ID order, whatever the direction: A→B and B→A cannot wait on each other.
	first, second := src, dst
	if to < from {
		first, second = dst, src
	}
	first.mu.Lock()
	defer first.mu.Unlock()
	second.mu.Lock()
	defer second.mu.Unlock()

	// The check happens under both locks, so nobody can spend the same money in between.
	if src.balance < amount {
		return fmt.Errorf("transfer %d from %d: %w", amount, from, ErrInsufficientFunds)
	}
	src.balance -= amount
	dst.balance += amount
	return nil
}

// Balance returns the current balance of one account.
func (l *Ledger) Balance(id int64) (int64, error) {
	a, ok := l.accounts[id]
	if !ok {
		return 0, fmt.Errorf("balance of %d: %w", id, ErrNotFound)
	}
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.balance, nil
}

// Total returns the sum of all balances as one consistent snapshot. It locks every
// account in the same ascending order as Transfer, so it never sees a transfer half done.
func (l *Ledger) Total() int64 {
	var sum int64
	for _, id := range l.ids {
		l.accounts[id].mu.Lock()
	}
	for _, id := range l.ids {
		sum += l.accounts[id].balance
	}
	for _, id := range slices.Backward(l.ids) {
		l.accounts[id].mu.Unlock()
	}
	return sum
}
