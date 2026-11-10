package account

import (
	"errors"
	"fmt"
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

func TestTransferMovesMoney(t *testing.T) {
	from, to := &Account{ID: "A"}, &Account{ID: "B"}
	from.Deposit(1000)
	to.Deposit(200)
	if err := Transfer(from, to, 300); err != nil {
		t.Fatalf("Transfer(A→B, 300) = %v, want nil", err)
	}
	if total := from.Balance() + to.Balance(); total != 1200 {
		t.Errorf("after the transfer A+B = %d, want 1200: a transfer must not create or lose money", total)
	}
	if from.Balance() != 700 || to.Balance() != 500 {
		t.Errorf("after the transfer A=%d, B=%d, want A=700, B=500", from.Balance(), to.Balance())
	}
}

func TestTransferInvalidAmount(t *testing.T) {
	for _, amount := range []int64{0, -300} {
		t.Run(fmt.Sprintf("amount %d", amount), func(t *testing.T) {
			from, to := &Account{ID: "A"}, &Account{ID: "B"}
			from.Deposit(1000)
			to.Deposit(200)
			err := Transfer(from, to, amount)
			if err == nil {
				t.Errorf("Transfer(A→B, %d) = nil, want an error", amount)
			} else if !strings.HasPrefix(err.Error(), "transfer A→B: ") {
				t.Errorf("Transfer(A→B, %d) error %q, want it to start with \"transfer A→B: \"", amount, err)
			}
			if from.Balance() != 1000 || to.Balance() != 200 {
				t.Errorf("after Transfer(A→B, %d) A=%d, B=%d, want them unchanged: A=1000, B=200", amount, from.Balance(), to.Balance())
			}
		})
	}
}
