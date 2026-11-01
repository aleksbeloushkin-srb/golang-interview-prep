// Package fakedb is a tiny database/sql driver for the q48 tests. The DSN is
// the number of rows a query returns, IDs 1, 2, 3…; with the suffix "+err"
// Next fails with ErrReset after those rows, as when the connection breaks
// mid-result, and with "+badconn" it fails with driver.ErrBadConn.
package fakedb

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"io"
	"strconv"
	"strings"
	"sync/atomic"
)

// Name is the driver name for sql.Open.
const Name = "q48fake"

// ErrReset is what Next returns when the result breaks off.
var ErrReset = errors.New("read tcp 10.0.0.5:51234->10.0.0.9:5432: connection reset by peer")

var (
	// Queries counts the queries the driver has started.
	Queries atomic.Int64
	// FailQueries makes that many next queries fail with driver.ErrBadConn
	// before they start, as with a pooled connection the server has closed.
	FailQueries atomic.Int64
)

func init() { sql.Register(Name, drv{}) }

type drv struct{}

func (drv) Open(dsn string) (driver.Conn, error) {
	count, suffix, _ := strings.Cut(dsn, "+")
	n, err := strconv.Atoi(count)
	if err != nil {
		return nil, err
	}
	c := &conn{rows: n}
	switch suffix {
	case "err":
		c.fail = ErrReset
	case "badconn":
		c.fail = driver.ErrBadConn
	}
	return c, nil
}

type conn struct {
	rows int
	fail error // returned by Next after the rows; nil means io.EOF
}

// QueryContext makes database/sql skip Prepare for queries.
func (c *conn) QueryContext(context.Context, string, []driver.NamedValue) (driver.Rows, error) {
	if FailQueries.Add(-1) >= 0 {
		return nil, driver.ErrBadConn
	}
	FailQueries.Store(0)
	Queries.Add(1)
	return &rows{left: c.rows, fail: c.fail}, nil
}

func (c *conn) Prepare(string) (driver.Stmt, error) {
	return nil, errors.New("fakedb: Prepare is not supported")
}
func (c *conn) Close() error { return nil }
func (c *conn) Begin() (driver.Tx, error) {
	return nil, errors.New("fakedb: transactions are not supported")
}

type rows struct {
	id   int64
	left int
	fail error
}

func (r *rows) Columns() []string { return []string{"id"} }
func (r *rows) Close() error      { return nil }

func (r *rows) Next(dest []driver.Value) error {
	if r.left == 0 {
		if r.fail != nil {
			return r.fail
		}
		return io.EOF
	}
	r.left--
	r.id++
	dest[0] = r.id
	return nil
}
