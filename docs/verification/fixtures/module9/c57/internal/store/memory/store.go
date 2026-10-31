// Package memory is an in-memory account store for tests and local runs.
// A PostgreSQL adapter implements the same method with one transaction.
package memory

import (
	"context"
	"fmt"
	"sync"

	"example.com/m9/c57/internal/ledger"
)

type Store struct {
	mu       sync.Mutex
	accounts map[string]ledger.Account
}

func New(accounts ...ledger.Account) *Store {
	s := &Store{accounts: make(map[string]ledger.Account, len(accounts))}
	for _, a := range accounts {
		s.accounts[a.ID] = a
	}
	return s
}

// Update changes copies of both accounts and saves them only if fn succeeds,
// so a failed transfer leaves both balances as they were.
func (s *Store) Update(ctx context.Context, fromID, toID string, fn func(from, to *ledger.Account) error) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	from, ok := s.accounts[fromID]
	if !ok {
		return fmt.Errorf("account %q: %w", fromID, ledger.ErrAccountNotFound)
	}
	to, ok := s.accounts[toID]
	if !ok {
		return fmt.Errorf("account %q: %w", toID, ledger.ErrAccountNotFound)
	}
	if err := fn(&from, &to); err != nil {
		return err
	}
	s.accounts[fromID], s.accounts[toID] = from, to
	return nil
}

func (s *Store) Get(ctx context.Context, id string) (ledger.Account, error) {
	if err := ctx.Err(); err != nil {
		return ledger.Account{}, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	a, ok := s.accounts[id]
	if !ok {
		return ledger.Account{}, fmt.Errorf("account %q: %w", id, ledger.ErrAccountNotFound)
	}
	return a, nil
}
