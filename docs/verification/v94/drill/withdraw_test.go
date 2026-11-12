package account

import (
	"errors"
	"testing"
)

// newAccount — хелпер: счёт A с начальным балансом; падение покажет строку вызова.
func newAccount(t *testing.T, balance int64) *Account {
	t.Helper()
	a := &Account{ID: "A"}
	if err := a.Deposit(balance); err != nil {
		t.Fatalf("Deposit(%d): %v", balance, err)
	}
	return a
}

func TestWithdraw(t *testing.T) {
	tests := []struct {
		name        string
		balance     int64
		amount      int64
		wantErr     error
		wantBalance int64
	}{
		{name: "part of the balance", balance: 100, amount: 30, wantBalance: 70},
		{name: "whole balance", balance: 100, amount: 100, wantBalance: 0},
		{name: "one more than the balance", balance: 100, amount: 101, wantErr: ErrInsufficientFunds, wantBalance: 100},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := newAccount(t, tt.balance)
			err := a.Withdraw(tt.amount)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Withdraw(%d) with balance %d: error = %v, want %v", tt.amount, tt.balance, err, tt.wantErr)
			}
			if got := a.Balance(); got != tt.wantBalance {
				t.Errorf("balance after Withdraw(%d) = %d, want %d", tt.amount, got, tt.wantBalance)
			}
		})
	}
}
