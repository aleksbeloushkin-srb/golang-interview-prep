package fanout

import (
	"context"
	"fmt"
	"runtime"
	"slices"
	"sync"
	"testing"
	"time"
)

type event struct {
	account string
	seq     int
}

func byAccount(e event) string { return e.account }

func source(events ...event) <-chan event {
	ch := make(chan event)
	go func() {
		defer close(ch)
		for _, e := range events {
			ch <- e
		}
	}()
	return ch
}

// readAll reads every output concurrently until all are closed.
func readAll(t *testing.T, outs []<-chan event) [][]event {
	t.Helper()
	got := make([][]event, len(outs))
	var wg sync.WaitGroup
	for i, out := range outs {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for e := range out {
				got[i] = append(got[i], e)
			}
		}()
	}
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("not every output was closed")
	}
	return got
}

func waitUntil(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for !cond() {
		if time.Now().After(deadline) {
			t.Fatalf("timed out waiting for: %s", what)
		}
		time.Sleep(time.Millisecond)
	}
}

func events(accounts []string, perAccount int) []event {
	var all []event
	for seq := range perAccount {
		for _, a := range accounts {
			all = append(all, event{a, seq})
		}
	}
	return all
}

func TestSameKeySameOutputInOrder(t *testing.T) {
	accounts := []string{"alice", "bob", "carol", "dave", "erin"}
	got := readAll(t, Route(context.Background(), source(events(accounts, 20)...), 3, byAccount))
	if len(got) != 3 {
		t.Fatalf("got %d outputs, want 3", len(got))
	}
	outputOf := map[string]int{}
	total := 0
	for i, out := range got {
		next := map[string]int{}
		for _, e := range out {
			if j, seen := outputOf[e.account]; seen && j != i {
				t.Fatalf("%s went to outputs %d and %d; one key must use one output", e.account, j, i)
			}
			outputOf[e.account] = i
			if e.seq != next[e.account] {
				t.Fatalf("output %d: %s got seq %d, want %d: order inside a key is lost", i, e.account, e.seq, next[e.account])
			}
			next[e.account]++
			total++
		}
	}
	if total != len(accounts)*20 {
		t.Fatalf("delivered %d events, want %d", total, len(accounts)*20)
	}
}

// Routing everything to one output keeps the order trivially; keys must spread.
func TestKeysSpreadOverOutputs(t *testing.T) {
	var accounts []string
	for i := range 100 {
		accounts = append(accounts, fmt.Sprintf("acc-%d", i))
	}
	got := readAll(t, Route(context.Background(), source(events(accounts, 1)...), 4, byAccount))
	used := 0
	for _, out := range got {
		if len(out) > 0 {
			used++
		}
	}
	if used < 2 {
		t.Fatalf("100 keys used %d of 4 outputs; route by key, not to one output", used)
	}
}

func TestNonPositiveN(t *testing.T) {
	for _, n := range []int{0, -3} {
		got := readAll(t, Route(context.Background(), source(event{"a", 0}, event{"b", 0}), n, byAccount))
		if len(got) != 1 || len(got[0]) != 2 {
			t.Fatalf("n=%d: got %v, want one output with 2 events", n, got)
		}
	}
}

func TestEveryOutputClosed(t *testing.T) {
	// One key, eight outputs: seven outputs get nothing, but each must still be closed.
	got := readAll(t, Route(context.Background(), source(events([]string{"only"}, 3)...), 8, byAccount))
	var lens []int
	for _, out := range got {
		lens = append(lens, len(out))
	}
	slices.Sort(lens)
	if want := []int{0, 0, 0, 0, 0, 0, 0, 3}; !slices.Equal(lens, want) {
		t.Fatalf("output sizes %v, want %v", lens, want)
	}
}

func TestCancelWithOpenInput(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	in := make(chan event) // never closed
	outs := Route(ctx, in, 2, byAccount)
	cancel()
	readAll(t, outs)
	waitUntil(t, "goroutines to exit", func() bool { return runtime.NumGoroutine() <= before })
}

// Nobody reads: the router takes one value and waits on its send.
// It must not drain in into buffers or goroutines.
func TestRouterWaitsForReader(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	in := make(chan event, 3)
	for i := range 3 {
		in <- event{"a", i}
	}
	Route(ctx, in, 2, byAccount)
	waitUntil(t, "Route to take a value", func() bool { return len(in) < 3 })
	time.Sleep(50 * time.Millisecond)
	if left := len(in); left != 2 {
		t.Fatalf("%d of 3 values left in in, want 2: Route must wait for the reader, not pile values up", left)
	}
}

// Nobody reads the outputs: a router blocked on a send must notice the cancellation.
func TestCancelWithoutReading(t *testing.T) {
	before := runtime.NumGoroutine()
	ctx, cancel := context.WithCancel(context.Background())
	in := make(chan event, 2)
	in <- event{"a", 0}
	in <- event{"a", 1}
	outs := Route(ctx, in, 2, byAccount)
	waitUntil(t, "Route to take a value", func() bool { return len(in) < 2 })
	cancel()
	waitUntil(t, "goroutines to exit while nobody reads", func() bool { return runtime.NumGoroutine() <= before })
	readAll(t, outs)
}
