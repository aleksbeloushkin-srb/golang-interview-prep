// Package account is the reference solution for practice task W1-2.
package account

import (
	"errors"
	"fmt"
)

// ErrInsufficientFunds is a sentinel: callers check the condition with errors.Is.
var ErrInsufficientFunds = errors.New("insufficient funds")

// Account balance is in minor units. Methods change the account, so they use a pointer receiver.
type Account struct {
	ID      string
	balance int64
}

func (a *Account) Balance() int64 { return a.balance }

// Deposit adds amount; it must be positive.
func (a *Account) Deposit(amount int64) error {
	if amount <= 0 {
		return fmt.Errorf("deposit %d to %s: amount must be positive", amount, a.ID)
	}
	a.balance += amount
	return nil
}

// Withdraw takes amount if the balance allows it. The error wraps
// ErrInsufficientFunds with %w, so errors.Is still finds it.
func (a *Account) Withdraw(amount int64) error {
	if amount <= 0 {
		return fmt.Errorf("withdraw %d from %s: amount must be positive", amount, a.ID)
	}
	if amount > a.balance {
		return fmt.Errorf("withdraw %d from %s (balance %d): %w", amount, a.ID, a.balance, ErrInsufficientFunds)
	}
	a.balance -= amount
	return nil
}

// Transfer moves amount between accounts and adds a second level of context.
func Transfer(from, to *Account, amount int64) error {
	if err := from.Withdraw(amount); err != nil {
		return fmt.Errorf("transfer %s→%s: %w", from.ID, to.ID, err)
	}
	if err := to.Deposit(amount); err != nil {
		from.balance += amount // undo; a real ledger would use a transaction
		return fmt.Errorf("transfer %s→%s: %w", from.ID, to.ID, err)
	}
	return nil
}
