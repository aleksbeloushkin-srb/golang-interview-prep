package safecache

import (
	"fmt"
	"math/rand/v2"
	"sync"
	"testing"
)

func TestGetReturnsCopy(t *testing.T) {
	c := New()
	c.Set("a", Item{Value: []byte("xyz"), Tags: []string{"t1"}})
	it, _ := c.Get("a")
	it.Value[0] = '!'
	it.Tags[0] = "changed"
	again, _ := c.Get("a")
	if string(again.Value) != "xyz" || again.Tags[0] != "t1" {
		t.Fatalf("cache changed through a returned item: %q %v", again.Value, again.Tags)
	}
}

func TestSetCopiesInput(t *testing.T) {
	c := New()
	v := []byte("abc")
	tags := []string{"t1"}
	c.Set("a", Item{Value: v, Tags: tags})
	v[0] = '!'
	tags[0] = "changed"
	it, _ := c.Get("a")
	if string(it.Value) != "abc" || it.Tags[0] != "t1" {
		t.Fatalf("cache changed through the caller's slices: %q %v", it.Value, it.Tags)
	}
}

func TestSnapshotIsIndependent(t *testing.T) {
	c := New()
	c.Set("a", Item{Value: []byte("one"), Tags: []string{"t1"}})
	snap := c.Snapshot()
	snap["a"].Value[0] = '!'
	snap["a"].Tags[0] = "changed"
	delete(snap, "a")
	if it, ok := c.Get("a"); !ok || string(it.Value) != "one" || it.Tags[0] != "t1" {
		t.Fatalf("cache changed through a snapshot: %q %v %v", it.Value, it.Tags, ok)
	}
}

func TestDeleteMissing(t *testing.T) {
	c := New()
	c.Set("a", Item{Value: []byte("1234")})
	if c.Delete("missing") {
		t.Fatal("Delete of a missing key reported true")
	}
	if c.Bytes() != 4 || c.Len() != 1 {
		t.Fatalf("Bytes=%d Len=%d, want 4 and 1", c.Bytes(), c.Len())
	}
}

func TestBytesInvariantUnderConcurrency(t *testing.T) {
	c := New()
	var wg sync.WaitGroup
	for g := range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			r := rand.New(rand.NewPCG(uint64(g), 1))
			for range 2000 {
				key := fmt.Sprint(r.IntN(50))
				switch r.IntN(5) {
				case 0:
					c.Set(key, Item{Value: make([]byte, r.IntN(100))})
				case 1:
					c.Delete(key)
				case 2: // readers must lock too, or -race reports them
					_, _ = c.Len(), c.Bytes()
				case 3:
					for _, it := range c.Snapshot() {
						_ = len(it.Value)
					}
				default:
					if it, ok := c.Get(key); ok && len(it.Value) > 0 {
						it.Value[0] = 1 // must not race with the cache
					}
				}
			}
		}()
	}
	wg.Wait()
	sum := 0
	for _, it := range c.Snapshot() {
		sum += len(it.Value)
	}
	if got := c.Bytes(); got != sum {
		t.Fatalf("Bytes() = %d, but values add up to %d", got, sum)
	}
}
