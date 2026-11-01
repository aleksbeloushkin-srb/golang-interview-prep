package store

import (
	"context"
	"database/sql"
	"slices"
	"testing"

	"example.com/rvquiz/q48/fakedb"
)

func open(t *testing.T, dsn string) *sql.DB {
	t.Helper()
	db, err := sql.Open(fakedb.Name, dsn)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// The bug: the connection breaks after two of the merchant's rows, and the
// caller gets those two rows with a nil error, as if the list were complete.
func TestBrokenResultLooksComplete(t *testing.T) {
	db := open(t, "2+err")
	ids, err := PaymentIDs(context.Background(), db, "m-1")
	if err != nil {
		t.Fatalf("err = %v, want nil: the buggy version never reads rows.Err()", err)
	}
	if !slices.Equal(ids, []int64{1, 2}) {
		t.Fatalf("ids = %v, want the partial [1 2]", ids)
	}
	// The connection is back in the pool: the leak here is data, not a connection.
	if n := db.Stats().InUse; n != 0 {
		t.Fatalf("%d connections in use after return, want 0", n)
	}
}

func TestCompleteResult(t *testing.T) {
	ids, err := PaymentIDs(context.Background(), open(t, "3"), "m-1")
	if err != nil || !slices.Equal(ids, []int64{1, 2, 3}) {
		t.Fatalf("got %v, %v; want [1 2 3], nil", ids, err)
	}
}
