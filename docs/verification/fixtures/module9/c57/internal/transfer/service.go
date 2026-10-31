// Package transfer is the use case: it moves money between two accounts.
package transfer

import (
	"context"
	"errors"

	"example.com/m9/c57/internal/ledger"
)

var (
	ErrInvalidAmount = errors.New("amount must be positive")
	ErrSameAccount   = errors.New("cannot transfer to the same account")
)

// AccountStore is the port this use case needs, declared here by its consumer.
// Adapters implement it without importing this package.
type AccountStore interface {
	// Update loads both accounts, calls fn and saves both atomically if fn returns nil.
	Update(ctx context.Context, fromID, toID string, fn func(from, to *ledger.Account) error) error
}

type Service struct {
	accounts AccountStore
}

func NewService(accounts AccountStore) *Service {
	return &Service{accounts: accounts}
}

// Transfer moves amount minor units from one account to another.
func (s *Service) Transfer(ctx context.Context, fromID, toID string, amount int64) error {
	if amount <= 0 {
		return ErrInvalidAmount
	}
	if fromID == toID {
		return ErrSameAccount
	}
	return s.accounts.Update(ctx, fromID, toID, func(from, to *ledger.Account) error {
		if err := from.Withdraw(amount); err != nil {
			return err
		}
		to.Deposit(amount)
		return nil
	})
}
