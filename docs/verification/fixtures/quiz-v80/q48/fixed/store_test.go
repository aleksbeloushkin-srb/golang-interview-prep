package store

import (
	"context"
	"database/sql"
	"errors"
	"slices"
	"strings"
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

func TestBrokenResultIsAnError(t *testing.T) {
	db := open(t, "2+err")
	ids, err := PaymentIDs(context.Background(), db, "m-1")
	if !errors.Is(err, fakedb.ErrReset) {
		t.Fatalf("err = %v, want one that wraps fakedb.ErrReset", err)
	}
	if !strings.Contains(err.Error(), "m-1") {
		t.Fatalf("err = %q, want the merchant in the context", err)
	}
	if ids != nil {
		t.Fatalf("ids = %v, want nil: no partial list next to an error", ids)
	}
	if n := db.Stats().InUse; n != 0 {
		t.Fatalf("%d connections in use after return, want 0", n)
	}
}

func TestCompleteAndEmptyResults(t *testing.T) {
	for _, tc := range []struct {
		dsn  string
		want []int64
	}{
		{"3", []int64{1, 2, 3}},
		{"0", nil},
	} {
		ids, err := PaymentIDs(context.Background(), open(t, tc.dsn), "m-1")
		if err != nil || !slices.Equal(ids, tc.want) {
			t.Fatalf("dsn %s: got %v, %v; want %v, nil", tc.dsn, ids, err, tc.want)
		}
	}
}
