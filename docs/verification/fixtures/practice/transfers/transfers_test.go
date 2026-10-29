package transfers

import (
	"errors"
	"math/rand/v2"
	"sync"
	"testing"
	"time"
)

// finishWithin fails the test instead of hanging when the work deadlocks.
func finishWithin(t *testing.T, d time.Duration, work func()) {
	t.Helper()
	done := make(chan struct{})
	go func() {
		defer close(done)
		work()
	}()
	select {
	case <-done:
	case <-time.After(d):
		t.Fatalf("not finished in %v: a deadlock? (lock order must not depend on the transfer direction)", d)
	}
}

func balance(t *testing.T, l *Ledger, id int64) int64 {
	t.Helper()
	b, err := l.Balance(id)
	if err != nil {
		t.Fatalf("Balance(%d): %v", id, err)
	}
	return b
}

func TestTransferMovesMoney(t *testing.T) {
	l := New(map[int64]int64{1: 100, 2: 50})
	if err := l.Transfer(1, 2, 30); err != nil {
		t.Fatalf("Transfer: %v", err)
	}
	if got := balance(t, l, 1); got != 70 {
		t.Errorf("balance 1 = %d, want 70", got)
	}
	if got := balance(t, l, 2); got != 80 {
		t.Errorf("balance 2 = %d, want 80", got)
	}
	if got := l.Total(); got != 150 {
		t.Errorf("Total = %d, want 150", got)
	}
}

func TestTransferErrors(t *testing.T) {
	l := New(map[int64]int64{1: 100, 2: 50})
	cases := []struct {
		name             string
		from, to, amount int64
		want             error
	}{
		{"zero amount", 1, 2, 0, ErrInvalidAmount},
		{"negative amount", 1, 2, -5, ErrInvalidAmount},
		{"same account", 1, 1, 10, ErrSameAccount},
		{"unknown source", 9, 2, 10, ErrNotFound},
		{"unknown destination", 1, 9, 10, ErrNotFound},
		{"insufficient funds", 2, 1, 51, ErrInsufficientFunds},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var err error
			finishWithin(t, 2*time.Second, func() { err = l.Transfer(tc.from, tc.to, tc.amount) })
			if !errors.Is(err, tc.want) {
				t.Fatalf("Transfer(%d, %d, %d) = %v, want errors.Is %v", tc.from, tc.to, tc.amount, err, tc.want)
			}
		})
	}
	if t.Failed() {
		return // a hung transfer may still hold a lock: reading balances would hang too
	}
	if balance(t, l, 1) != 100 || balance(t, l, 2) != 50 {
		t.Errorf("a failed transfer changed balances: %d, %d", balance(t, l, 1), balance(t, l, 2))
	}
	if _, err := l.Balance(9); !errors.Is(err, ErrNotFound) {
		t.Errorf("Balance(9) = %v, want ErrNotFound", err)
	}
}

// Opposite directions at the same time: with locks taken in request order this deadlocks.
func TestOppositeTransfersDoNotDeadlock(t *testing.T) {
	l := New(map[int64]int64{1: 1000, 2: 1000})
	finishWithin(t, 5*time.Second, func() {
		var wg sync.WaitGroup
		for i := range 100 {
			wg.Add(1)
			go func() {
				defer wg.Done()
				for range 200 {
					if i%2 == 0 {
						_ = l.Transfer(1, 2, 1)
					} else {
						_ = l.Transfer(2, 1, 1)
					}
				}
			}()
		}
		wg.Wait()
	})
	if got := l.Total(); got != 2000 {
		t.Fatalf("Total = %d, want 2000", got)
	}
}

// 100 goroutines transfer random amounts between 10 accounts while another goroutine
// keeps checking the total. The sum never changes and no balance goes below zero.
func TestConcurrentTransfersKeepTheInvariant(t *testing.T) {
	const accounts, opening = 10, 100
	balances := make(map[int64]int64, accounts)
	for id := range int64(accounts) {
		balances[id+1] = opening
	}
	l := New(balances)
	want := int64(accounts * opening)

	stop := make(chan struct{})
	totals := make(chan int64, 1)
	go func() {
		bad := want
		defer func() { totals <- bad }()
		for {
			select {
			case <-stop:
				return
			default:
			}
			if got := l.Total(); got != want {
				bad = got
				return
			}
			for id := range int64(accounts) {
				if b, err := l.Balance(id + 1); err != nil || b < 0 {
					bad = -1
					return
				}
			}
		}
	}()

	var ok, refused int64
	var mu sync.Mutex
	finishWithin(t, 10*time.Second, func() {
		var wg sync.WaitGroup
		for g := range 100 {
			wg.Add(1)
			go func() {
				defer wg.Done()
				r := rand.New(rand.NewPCG(uint64(g), 42))
				for range 100 {
					from, to := r.Int64N(accounts)+1, r.Int64N(accounts)+1
					if from == to {
						continue
					}
					err := l.Transfer(from, to, r.Int64N(60)+1)
					mu.Lock()
					switch {
					case err == nil:
						ok++
					case errors.Is(err, ErrInsufficientFunds):
						refused++
					default:
						mu.Unlock()
						t.Errorf("unexpected error: %v", err)
						return
					}
					mu.Unlock()
				}
			}()
		}
		wg.Wait()
	})
	close(stop)
	if got := <-totals; got != want {
		t.Errorf("Total during the transfers = %d, want %d: Total saw a half-done transfer", got, want)
	}
	if got := l.Total(); got != want {
		t.Errorf("Total after = %d, want %d", got, want)
	}
	for id := range int64(accounts) {
		if b := balance(t, l, id+1); b < 0 {
			t.Errorf("account %d went negative: %d (balance checked before taking the locks?)", id+1, b)
		}
	}
	t.Logf("transfers: %d done, %d refused for insufficient funds", ok, refused)
}

// Many withdrawals race for the same money: exactly as many succeed as the balance allows.
func TestNoOverdraftUnderContention(t *testing.T) {
	for round := range 200 {
		l := New(map[int64]int64{1: 100, 2: 0})
		start := make(chan struct{})
		var wg sync.WaitGroup
		var mu sync.Mutex
		succeeded := 0
		for range 32 {
			wg.Add(1)
			go func() {
				defer wg.Done()
				<-start
				if l.Transfer(1, 2, 10) == nil {
					mu.Lock()
					succeeded++
					mu.Unlock()
				}
			}()
		}
		close(start)
		wg.Wait()
		if b := balance(t, l, 1); succeeded != 10 || b != 0 {
			t.Fatalf("round %d: %d transfers of 10 succeeded from a balance of 100, balance now %d; want 10 and 0", round, succeeded, b)
		}
	}
}
