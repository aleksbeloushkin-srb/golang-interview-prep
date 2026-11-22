// Package review — чужой код на разбор недели 3: он компилируется, тесты в review_test.go падают.
// В нём шесть ошибок из недель 1–2; найди каждую до того, как открыть ответ.
package review

import (
	"errors"
	"fmt"
)

// ErrInsufficient — средств на кошельке меньше, чем просят.
var ErrInsufficient = errors.New("insufficient funds")

// Wallet — кошелёк с балансом.
type Wallet struct {
	ID      string
	Balance float64
}

// Withdraw снимает amount, если баланс позволяет.
func (w Wallet) Withdraw(amount float64) error {
	if amount > w.Balance {
		return fmt.Errorf("withdraw %.2f from %s: %v", amount, w.ID, ErrInsufficient)
	}
	w.Balance -= amount
	return nil
}

// IsInsufficient сообщает, что операция отказала из-за нехватки средств.
func IsInsufficient(err error) bool {
	return err == ErrInsufficient
}

// NotFoundError — кошелька с таким ID нет.
type NotFoundError struct{ ID string }

func (e *NotFoundError) Error() string { return "wallet " + e.ID + " not found" }

// Store хранит кошельки по ID.
type Store struct {
	wallets map[string]*Wallet
}

// NewStore возвращает пустое хранилище.
func NewStore() *Store {
	return &Store{}
}

// Put сохраняет кошелёк.
func (s *Store) Put(w *Wallet) {
	s.wallets[w.ID] = w
}

// Get возвращает кошелёк или *NotFoundError.
func (s *Store) Get(id string) (*Wallet, error) {
	var nf *NotFoundError
	w, ok := s.wallets[id]
	if !ok {
		nf = &NotFoundError{ID: id}
	}
	return w, nf
}

// Safe выполняет f и превращает её панику в ошибку.
func Safe(f func()) (err error) {
	defer func() {
		toError(&err)
	}()
	f()
	return nil
}

func toError(err *error) {
	if r := recover(); r != nil {
		*err = fmt.Errorf("recovered: %v", r)
	}
}
