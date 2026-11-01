package fakedb

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"testing"
)

func countRows(t *testing.T, db *sql.DB) (int, error) {
	t.Helper()
	rows, err := db.QueryContext(context.Background(), "SELECT id FROM payments")
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	n := 0
	for rows.Next() {
		n++
	}
	return n, rows.Err()
}

// Next returns false both at the end and on an error mid-result; only Err
// tells them apart. database/sql does not retry a query whose rows have
// started to arrive, even on driver.ErrBadConn.
func TestNextFalseHidesTheError(t *testing.T) {
	for _, tc := range []struct {
		dsn     string
		wantErr error
	}{
		{"2", nil},
		{"2+err", ErrReset},
		{"2+badconn", driver.ErrBadConn},
	} {
		t.Run(tc.dsn, func(t *testing.T) {
			db, err := sql.Open(Name, tc.dsn)
			if err != nil {
				t.Fatal(err)
			}
			defer db.Close()
			before := Queries.Load()
			n, err := countRows(t, db)
			if n != 2 {
				t.Fatalf("Next returned true %d times, want 2", n)
			}
			if tc.wantErr == nil && err != nil || !errors.Is(err, tc.wantErr) {
				t.Fatalf("rows.Err() = %v, want %v", err, tc.wantErr)
			}
			if q := Queries.Load() - before; q != 1 {
				t.Fatalf("%d queries started, want 1: no retry mid-result", q)
			}
		})
	}
}

// The retry that does exist: driver.ErrBadConn before the query starts makes
// QueryContext try again on another connection.
func TestBadConnBeforeTheQueryIsRetried(t *testing.T) {
	db, err := sql.Open(Name, "3")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	FailQueries.Store(1)
	before := Queries.Load()
	n, err := countRows(t, db)
	if n != 3 || err != nil {
		t.Fatalf("got %d rows, %v; want 3, nil", n, err)
	}
	if q := Queries.Load() - before; q != 1 {
		t.Fatalf("%d queries started, want 1 after the failed attempt", q)
	}
}
