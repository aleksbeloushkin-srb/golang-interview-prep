package transfer_test

import (
	"context"
	"errors"
	"sync"
	"testing"

	"example.com/m9/c57/internal/ledger"
	"example.com/m9/c57/internal/store/memory"
	"example.com/m9/c57/internal/transfer"
)

// The in-memory adapter stands in for the database: same port, no PostgreSQL.
func newService() (*transfer.Service, *memory.Store) {
	store := memory.New(
		ledger.Account{ID: "alice", Balance: 1000},
		ledger.Account{ID: "bob", Balance: 0},
	)
	return transfer.NewService(store), store
}

func balance(t *testing.T, store *memory.Store, id string) int64 {
	t.Helper()
	a, err := store.Get(context.Background(), id)
	if err != nil {
		t.Fatal(err)
	}
	return a.Balance
}

func TestTransfer(t *testing.T) {
	tests := []struct {
		name             string
		from, to         string
		amount           int64
		wantErr          error
		wantAlice, wantB int64
	}{
		{name: "moves money", from: "alice", to: "bob", amount: 300, wantAlice: 700, wantB: 300},
		{name: "whole balance", from: "alice", to: "bob", amount: 1000, wantAlice: 0, wantB: 1000},
		{name: "insufficient funds", from: "alice", to: "bob", amount: 1001, wantErr: ledger.ErrInsufficientFunds, wantAlice: 1000},
		{name: "unknown account", from: "alice", to: "carol", amount: 1, wantErr: ledger.ErrAccountNotFound, wantAlice: 1000},
		{name: "zero amount", from: "alice", to: "bob", amount: 0, wantErr: transfer.ErrInvalidAmount, wantAlice: 1000},
		{name: "negative amount", from: "alice", to: "bob", amount: -5, wantErr: transfer.ErrInvalidAmount, wantAlice: 1000},
		{name: "same account", from: "alice", to: "alice", amount: 1, wantErr: transfer.ErrSameAccount, wantAlice: 1000},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc, store := newService()
			err := svc.Transfer(context.Background(), tt.from, tt.to, tt.amount)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Transfer() error = %v, want %v", err, tt.wantErr)
			}
			if got := balance(t, store, "alice"); got != tt.wantAlice {
				t.Errorf("alice = %d, want %d", got, tt.wantAlice)
			}
			if got := balance(t, store, "bob"); got != tt.wantB {
				t.Errorf("bob = %d, want %d", got, tt.wantB)
			}
		})
	}
}

func TestTransferCancelledContext(t *testing.T) {
	svc, store := newService()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := svc.Transfer(ctx, "alice", "bob", 10); !errors.Is(err, context.Canceled) {
		t.Fatalf("Transfer() error = %v, want context.Canceled", err)
	}
	if got := balance(t, store, "alice"); got != 1000 {
		t.Errorf("alice = %d, want 1000", got)
	}
}

func TestConcurrentTransfersKeepTheTotal(t *testing.T) {
	svc, store := newService()
	var wg sync.WaitGroup
	errs := make(chan error, 50)
	for range 50 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			errs <- svc.Transfer(context.Background(), "alice", "bob", 10)
		}()
	}
	wg.Wait()
	close(errs)
	for err := range errs {
		if err != nil {
			t.Fatal(err)
		}
	}
	if a, b := balance(t, store, "alice"), balance(t, store, "bob"); a != 500 || b != 500 {
		t.Fatalf("alice = %d, bob = %d, want 500 and 500", a, b)
	}
}
