package pages

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	bad "example.com/go-prep/syncresources/testdata/q19"
	"io"
	"runtime"
	"sync/atomic"
	"testing"
	"time"
)

var errQuery = errors.New("query failed")
var errNext = errors.New("iteration failed")
var errClose = errors.New("close failed")

// Only the driver is controlled. Pooling, Rows, Scan and cancellation are database/sql.
type connector struct {
	mode    string
	queries atomic.Int32
	closes  atomic.Int32
}

func (c *connector) Connect(context.Context) (driver.Conn, error) { return &conn{c}, nil }
func (c *connector) Driver() driver.Driver                        { return drv{c} }

type drv struct{ c *connector }

func (d drv) Open(string) (driver.Conn, error) { return &conn{d.c}, nil }

type conn struct{ c *connector }

func (c *conn) Prepare(string) (driver.Stmt, error) { return nil, errors.New("unexpected Prepare") }
func (c *conn) Begin() (driver.Tx, error)           { return nil, errors.New("unexpected Begin") }
func (c *conn) Close() error                        { return nil }
func (c *conn) QueryContext(ctx context.Context, _ string, _ []driver.NamedValue) (driver.Rows, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	c.c.queries.Add(1)
	if c.c.mode == "query" {
		return nil, errQuery
	}
	return &rows{c: c.c}, nil
}

type rows struct {
	c *connector
	n int
}

func (r *rows) Columns() []string { return []string{"id"} }
func (r *rows) Close() error {
	r.c.closes.Add(1)
	if r.c.mode == "close" || r.c.mode == "scan-close" {
		return errClose
	}
	return nil
}
func (r *rows) Next(dest []driver.Value) error {
	if r.c.mode == "next" {
		return errNext
	}
	if r.n == 2 {
		return io.EOF
	}
	r.n++
	if r.c.mode == "scan" || r.c.mode == "scan-close" {
		dest[0] = "not-an-integer"
	} else {
		dest[0] = int64(r.n)
	}
	return nil
}
func openDB(t *testing.T, mode string, max int) (*sql.DB, *connector) {
	t.Helper()
	c := &connector{mode: mode}
	db := sql.OpenDB(c)
	db.SetMaxOpenConns(max)
	t.Cleanup(func() { db.Close() })
	return db, c
}
func TestPageLifetimeEarlyBreakAndEOF(t *testing.T) {
	for _, stop := range []bool{false, true} {
		name := "EOF"
		if stop {
			name = "early break"
		}
		t.Run(name, func(t *testing.T) {
			db, c := openDB(t, "", 1)
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := VisitPages(ctx, db, func(int64) bool { return stop }); err != nil {
				t.Fatal(err)
			}
			if c.queries.Load() != 100 || c.closes.Load() != 100 || db.Stats().InUse != 0 {
				t.Fatalf("queries=%d closes=%d stats=%+v", c.queries.Load(), c.closes.Load(), db.Stats())
			}
		})
	}
}
func TestPageErrorPaths(t *testing.T) {
	for _, mode := range []string{"query", "next", "scan", "close", "scan-close"} {
		t.Run(mode, func(t *testing.T) {
			db, c := openDB(t, mode, 1)
			err := visitPage(context.Background(), db, 0, func(int64) bool { return true })
			if err == nil {
				t.Fatal("missing error")
			}
			if mode == "query" && !errors.Is(err, errQuery) {
				t.Fatal(err)
			}
			if mode == "next" && !errors.Is(err, errNext) {
				t.Fatal(err)
			}
			if (mode == "close" || mode == "scan-close") && !errors.Is(err, errClose) {
				t.Fatal(err)
			}
			if mode == "scan-close" && len(err.(interface{ Unwrap() []error }).Unwrap()) != 2 {
				t.Fatal("lost scan or close error")
			}
			want := int32(1)
			if mode == "query" {
				want = 0
			}
			if c.closes.Load() != want || db.Stats().InUse != 0 {
				t.Fatalf("closes=%d stats=%+v", c.closes.Load(), db.Stats())
			}
		})
	}
}
func TestOriginalRetainsRowsUntilCancellation(t *testing.T) {
	db, c := openDB(t, "", 2)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	done := make(chan error, 1)
	go func() { done <- bad.VisitPages(ctx, db, func(int64) bool { return true }) }()
	deadline := time.Now().Add(5 * time.Second)
	for db.Stats().WaitCount == 0 {
		if time.Now().After(deadline) {
			t.Fatal("did not reach pool wait")
		}
		runtime.Gosched()
	}
	if c.queries.Load() != 2 || db.Stats().InUse != 2 {
		t.Fatal("expected two retained Rows before third query")
	}
	cancel()
	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatal(err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("cancellation did not unblock pool")
	}
	if db.Stats().InUse != 0 {
		t.Fatal("deferred Rows not released")
	}
}
