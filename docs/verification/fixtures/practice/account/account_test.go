package account

import (
	"errors"
	"strings"
	"testing"
)

func TestDepositWithdraw(t *testing.T) {
	a := &Account{ID: "A"}
	if err := a.Deposit(1000); err != nil {
		t.Fatal(err)
	}
	if err := a.Withdraw(300); err != nil {
		t.Fatal(err)
	}
	if got := a.Balance(); got != 700 {
		t.Fatalf("Balance() = %d, want 700", got)
	}
}

func TestInvalidAmounts(t *testing.T) {
	a := &Account{ID: "A"}
	for _, amount := range []int64{0, -5} {
		if err := a.Deposit(amount); err == nil {
			t.Errorf("Deposit(%d) succeeded, want an error", amount)
		}
		if err := a.Withdraw(amount); err == nil {
			t.Errorf("Withdraw(%d) succeeded, want an error", amount)
		}
	}
}

func TestInsufficientFundsIsWrapped(t *testing.T) {
	a := &Account{ID: "A"}
	a.Deposit(100)
	err := a.Withdraw(500)
	if !errors.Is(err, ErrInsufficientFunds) {
		t.Fatalf("errors.Is(%v, ErrInsufficientFunds) = false", err)
	}
	if err == ErrInsufficientFunds {
		t.Fatal("the error has no context; wrap it with %w and add the amount and account")
	}
	if !strings.Contains(err.Error(), "500") {
		t.Fatalf("error %q does not mention the amount", err)
	}
	if a.Balance() != 100 {
		t.Fatalf("a failed withdrawal changed the balance to %d", a.Balance())
	}
}

func TestTwoLevelsOfWrapping(t *testing.T) {
	from, to := &Account{ID: "A"}, &Account{ID: "B"}
	from.Deposit(100)
	err := Transfer(from, to, 500)
	if !errors.Is(err, ErrInsufficientFunds) {
		t.Fatalf("errors.Is through two levels = false for %v", err)
	}
	if !strings.HasPrefix(err.Error(), "transfer A→B: withdraw 500 from A") {
		t.Fatalf("unexpected message %q", err)
	}
	if from.Balance() != 100 || to.Balance() != 0 {
		t.Fatalf("balances changed: %d and %d", from.Balance(), to.Balance())
	}
}
