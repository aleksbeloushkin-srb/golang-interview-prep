package outbox

import (
	"context"
	"errors"
	"strconv"
	"sync"
	"testing"
	"time"
)

// broker is a fake Kafka: every 3rd call fails before storing (the send failed),
// every 5th call stores the event and still returns an error (the acknowledgement was lost).
type broker struct {
	mu    sync.Mutex
	calls int
	log   []Event
	keys  []string
}

var errBroker = errors.New("broker: timeout")

func (b *broker) Publish(ctx context.Context, key string, ev Event) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.calls++
	switch {
	case b.calls%3 == 0:
		return errBroker
	case b.calls%5 == 0:
		b.log = append(b.log, ev)
		b.keys = append(b.keys, key)
		return errBroker
	}
	b.log = append(b.log, ev)
	b.keys = append(b.keys, key)
	return nil
}

func (b *broker) snapshot() ([]Event, []string, int) {
	b.mu.Lock()
	defer b.mu.Unlock()
	return append([]Event(nil), b.log...), append([]string(nil), b.keys...), b.calls
}

func waitFor(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for: %s", what)
		}
		time.Sleep(time.Millisecond)
	}
}

func startRelay(t *testing.T, r *Relay) (stop func() error) {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- r.Run(ctx) }()
	return func() error {
		cancel()
		select {
		case err := <-done:
			return err
		case <-time.After(time.Second):
			t.Fatal("Run did not return within 1s after cancel")
			return nil
		}
	}
}

func TestTransferWritesTheEventInTheSameTransaction(t *testing.T) {
	db := NewDB(map[int64]int64{1: 100, 2: 0})
	ev, err := db.Transfer(1, 2, 30)
	if err != nil {
		t.Fatalf("Transfer: %v", err)
	}
	if ev.ID == 0 || ev.From != 1 || ev.To != 2 || ev.Amount != 30 {
		t.Fatalf("event = %+v", ev)
	}
	if db.Pending() != 1 || db.Balance(1) != 70 || db.Balance(2) != 30 {
		t.Fatalf("pending %d, balances %d/%d; want 1 event, 70/30", db.Pending(), db.Balance(1), db.Balance(2))
	}
	for _, bad := range []struct {
		from, to, amount int64
		want             error
	}{{1, 2, 500, ErrInsufficientFunds}, {1, 9, 5, ErrNotFound}, {1, 2, 0, ErrInvalidAmount}} {
		if _, err := db.Transfer(bad.from, bad.to, bad.amount); !errors.Is(err, bad.want) {
			t.Errorf("Transfer(%d, %d, %d) = %v, want %v", bad.from, bad.to, bad.amount, err, bad.want)
		}
	}
	if db.Pending() != 1 || db.Balance(1) != 70 {
		t.Fatalf("a failed transfer wrote an event or moved money: pending %d, balance %d", db.Pending(), db.Balance(1))
	}
}

// Transfers keep coming while a flaky broker loses sends and acknowledgements.
// Every event reaches the broker, in ID order of first arrival, keyed by the sender;
// duplicates happen, and the idempotent consumer applies each event once.
func TestRelayDeliversAtLeastOnceInOrder(t *testing.T) {
	db := NewDB(map[int64]int64{1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 1000})
	b := &broker{}
	stop := startRelay(t, &Relay{DB: db, Pub: b, Interval: time.Millisecond, Batch: 7})

	var mu sync.Mutex
	var events []Event
	var wg sync.WaitGroup
	for g := range 10 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range 10 {
				from := int64(g%5 + 1)
				to := int64((g+i)%5 + 1)
				if from == to {
					to = from%5 + 1
				}
				ev, err := db.Transfer(from, to, 1)
				if err != nil {
					t.Errorf("Transfer: %v", err)
					return
				}
				mu.Lock()
				events = append(events, ev)
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	waitFor(t, "relay publishes every event", func() bool { return db.Pending() == 0 })
	if err := stop(); !errors.Is(err, context.Canceled) {
		t.Fatalf("Run returned %v, want context.Canceled", err)
	}

	log, keys, _ := b.snapshot()
	first := map[int64]bool{}
	var order []int64
	for i, ev := range log {
		if keys[i] != strconv.FormatInt(ev.From, 10) {
			t.Fatalf("event %d published with key %q, want the sender %d", ev.ID, keys[i], ev.From)
		}
		if !first[ev.ID] {
			first[ev.ID] = true
			order = append(order, ev.ID)
		}
	}
	if len(first) != len(events) {
		t.Fatalf("broker got %d distinct events, want %d: an event was lost (marked sent before Publish succeeded?)", len(first), len(events))
	}
	for i := 1; i < len(order); i++ {
		if order[i] < order[i-1] {
			t.Fatalf("event %d reached the broker before event %d: a failed event must be retried before later ones", order[i], order[i-1])
		}
	}
	if len(log) == len(events) {
		t.Fatalf("no duplicates despite lost acknowledgements: is an event marked sent when Publish returns an error?")
	}

	c := NewConsumer()
	for _, ev := range log {
		if err := c.Handle(ev); err != nil {
			t.Fatalf("Handle: %v", err)
		}
	}
	want := map[int64]int64{}
	for _, ev := range events {
		want[ev.From] += ev.Amount
	}
	for account, sent := range want {
		if got := c.Sent(account); got != sent {
			t.Errorf("consumer: account %d sent %d, want %d (%d messages for %d events: duplicates applied twice?)", account, got, sent, len(log), len(events))
		}
	}
}

// blockingBroker blocks every Publish until the context is cancelled.
type blockingBroker struct {
	mu      sync.Mutex
	calls   int
	started chan struct{}
}

func (b *blockingBroker) Publish(ctx context.Context, key string, ev Event) error {
	b.mu.Lock()
	b.calls++
	b.mu.Unlock()
	select {
	case b.started <- struct{}{}:
	default:
	}
	<-ctx.Done()
	return ctx.Err()
}

// The relay must not hold the database while it waits for the broker, and it must stop on cancel.
func TestSlowBrokerDoesNotBlockTransfersAndRunStops(t *testing.T) {
	db := NewDB(map[int64]int64{1: 100, 2: 0})
	if _, err := db.Transfer(1, 2, 1); err != nil {
		t.Fatal(err)
	}
	b := &blockingBroker{started: make(chan struct{}, 1)}
	stop := startRelay(t, &Relay{DB: db, Pub: b, Interval: time.Millisecond})
	select {
	case <-b.started:
	case <-time.After(2 * time.Second):
		t.Fatal("relay never called Publish")
	}

	done := make(chan error, 1)
	go func() { _, err := db.Transfer(1, 2, 1); done <- err }()
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("Transfer: %v", err)
		}
	case <-time.After(time.Second):
		t.Fatal("Transfer waited for the broker: the relay must not hold the database lock during Publish")
	}

	if err := stop(); !errors.Is(err, context.Canceled) {
		t.Fatalf("Run returned %v, want context.Canceled", err)
	}
	b.mu.Lock()
	calls := b.calls
	b.mu.Unlock()
	time.Sleep(20 * time.Millisecond)
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.calls != calls {
		t.Fatalf("Publish called after Run returned: %d → %d calls", calls, b.calls)
	}
	if db.Pending() != 2 {
		t.Fatalf("pending = %d, want 2: nothing was acknowledged", db.Pending())
	}
}

func TestConsumerIsSafeForConcurrentDuplicates(t *testing.T) {
	c := NewConsumer()
	ev := Event{ID: 7, From: 1, To: 2, Amount: 10}
	var wg sync.WaitGroup
	for range 50 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := c.Handle(ev); err != nil {
				t.Errorf("Handle: %v", err)
			}
		}()
	}
	wg.Wait()
	if got := c.Sent(1); got != 10 {
		t.Fatalf("50 copies of one event: sent = %d, want 10", got)
	}
}
