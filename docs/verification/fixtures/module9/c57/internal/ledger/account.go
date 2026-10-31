// Package ledger is the domain: accounts and the rules for money.
// It imports nothing from the rest of the service.
package ledger

import "errors"

var (
	ErrAccountNotFound   = errors.New("account not found")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

// Account holds its balance in minor units (cents).
type Account struct {
	ID      string
	Balance int64
}

func (a *Account) Withdraw(amount int64) error {
	if amount > a.Balance {
		return ErrInsufficientFunds
	}
	a.Balance -= amount
	return nil
}

func (a *Account) Deposit(amount int64) { a.Balance += amount }
