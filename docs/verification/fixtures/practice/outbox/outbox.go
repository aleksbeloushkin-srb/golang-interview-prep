// Package outbox is the reference solution for practice task W6-3: a transactional
// outbox in memory, a relay that publishes at least once, and an idempotent consumer.
package outbox

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"sync"
	"time"
)

var (
	ErrNotFound          = errors.New("account not found")
	ErrInvalidAmount     = errors.New("amount must be positive")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

// Event is what the relay publishes after a transfer.
type Event struct {
	ID     int64 // outbox row ID: consumers deduplicate by it
	From   int64
	To     int64
	Amount int64
}

type row struct {
	ev   Event
	sent bool
}

// DB is an in-memory database: holding mu is one transaction.
type DB struct {
	mu       sync.Mutex
	balances map[int64]int64
	outbox   []row // in ID order
	nextID   int64
}

func NewDB(balances map[int64]int64) *DB {
	db := &DB{balances: make(map[int64]int64, len(balances))}
	for id, b := range balances {
		db.balances[id] = b
	}
	return db
}

// Transfer moves the money and appends the event to the outbox in one transaction:
// either both happen or neither does.
func (db *DB) Transfer(from, to, amount int64) (Event, error) {
	db.mu.Lock()
	defer db.mu.Unlock()
	if amount <= 0 {
		return Event{}, ErrInvalidAmount
	}
	src, ok := db.balances[from]
	if !ok {
		return Event{}, fmt.Errorf("transfer from %d: %w", from, ErrNotFound)
	}
	if _, ok := db.balances[to]; !ok {
		return Event{}, fmt.Errorf("transfer to %d: %w", to, ErrNotFound)
	}
	if src < amount {
		return Event{}, fmt.Errorf("transfer %d from %d: %w", amount, from, ErrInsufficientFunds)
	}
	db.balances[from] -= amount
	db.balances[to] += amount
	db.nextID++
	ev := Event{ID: db.nextID, From: from, To: to, Amount: amount}
	db.outbox = append(db.outbox, row{ev: ev})
	return ev, nil
}

// Balance returns an account's balance.
func (db *DB) Balance(id int64) int64 {
	db.mu.Lock()
	defer db.mu.Unlock()
	return db.balances[id]
}

// Unsent returns up to limit unsent events in ID order, as a copy.
func (db *DB) Unsent(limit int) []Event {
	db.mu.Lock()
	defer db.mu.Unlock()
	var out []Event
	for _, r := range db.outbox {
		if len(out) == limit {
			break
		}
		if !r.sent {
			out = append(out, r.ev)
		}
	}
	return out
}

// MarkSent marks one event as published.
func (db *DB) MarkSent(id int64) {
	db.mu.Lock()
	defer db.mu.Unlock()
	for i := range db.outbox {
		if db.outbox[i].ev.ID == id {
			db.outbox[i].sent = true
			return
		}
	}
}

// Pending counts events that are not marked sent yet.
func (db *DB) Pending() int {
	db.mu.Lock()
	defer db.mu.Unlock()
	n := 0
	for _, r := range db.outbox {
		if !r.sent {
			n++
		}
	}
	return n
}

// Publisher sends one event to the broker; key selects the partition.
type Publisher interface {
	Publish(ctx context.Context, key string, ev Event) error
}

// Relay publishes outbox events. It runs in one goroutine owned by the caller.
type Relay struct {
	DB       *DB
	Pub      Publisher
	Interval time.Duration // pause between polls; 0 means 10 ms
	Batch    int           // events per poll; 0 means 100
}

// Run publishes unsent events in ID order until ctx is done, then returns ctx.Err().
// An event is marked sent only after Publish succeeded, so delivery is at-least-once:
// a lost acknowledgement makes the relay send the event again.
func (r *Relay) Run(ctx context.Context) error {
	interval, batch := r.Interval, r.Batch
	if interval <= 0 {
		interval = 10 * time.Millisecond
	}
	if batch <= 0 {
		batch = 100
	}
	tick := time.NewTicker(interval)
	defer tick.Stop()
	for {
		r.publishBatch(ctx, batch)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-tick.C:
		}
	}
}

func (r *Relay) publishBatch(ctx context.Context, batch int) {
	// Unsent copies the rows and releases the lock: Publish is a network call, and
	// transfers must not wait for the broker.
	for _, ev := range r.DB.Unsent(batch) {
		if ctx.Err() != nil {
			return
		}
		// The sender's account is the key: its events stay in one partition, in order.
		if err := r.Pub.Publish(ctx, strconv.FormatInt(ev.From, 10), ev); err != nil {
			return // stop the batch to keep the order; this event goes first on the next poll
		}
		r.DB.MarkSent(ev.ID)
	}
}

// Consumer applies each event at most once, by event ID.
type Consumer struct {
	mu   sync.Mutex
	seen map[int64]bool
	sent map[int64]int64 // money sent per account, according to the applied events
}

func NewConsumer() *Consumer {
	return &Consumer{seen: make(map[int64]bool), sent: make(map[int64]int64)}
}

// Handle applies ev unless an event with the same ID was applied before.
// A duplicate is not an error: the consumer just acknowledges it again.
func (c *Consumer) Handle(ev Event) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.seen[ev.ID] {
		return nil
	}
	// In a real service the ID and the effect commit in one database transaction.
	c.seen[ev.ID] = true
	c.sent[ev.From] += ev.Amount
	return nil
}

// Sent returns how much an account sent according to the applied events.
func (c *Consumer) Sent(account int64) int64 {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.sent[account]
}
