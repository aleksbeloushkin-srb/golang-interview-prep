package review

import (
	"errors"
	"fmt"
	"testing"
)

func TestWithdrawChangesBalance(t *testing.T) {
	w := &Wallet{ID: "A", Balance: 100}
	if err := w.Withdraw(30); err != nil {
		t.Fatal(err)
	}
	if w.Balance != 70 {
		t.Fatalf("after Withdraw(30) Balance = %v, want 70", w.Balance)
	}
}

func TestWithdrawErrorWraps(t *testing.T) {
	w := &Wallet{ID: "A", Balance: 10}
	if err := w.Withdraw(30); !errors.Is(err, ErrInsufficient) {
		t.Fatalf("errors.Is(%v, ErrInsufficient) = false", err)
	}
}

func TestIsInsufficientAfterWrapping(t *testing.T) {
	err := fmt.Errorf("transfer A→B: %w", ErrInsufficient)
	if !IsInsufficient(err) {
		t.Fatalf("IsInsufficient(%v) = false", err)
	}
}

func TestPut(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("Put panicked: %v", r)
		}
	}()
	NewStore().Put(&Wallet{ID: "A"})
}

func TestGetFound(t *testing.T) {
	s := &Store{wallets: map[string]*Wallet{"A": {ID: "A"}}}
	w, err := s.Get("A")
	if err != nil || w == nil {
		t.Fatalf("Get(A) = %v, %v, want the wallet and a nil error", w, err)
	}
}

func TestSafeRecovers(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("the panic escaped Safe: %v", r)
		}
	}()
	if err := Safe(func() { panic("boom") }); err == nil {
		t.Fatal("Safe returned nil after a panic")
	}
}
