package pages

import (
	"context"
	"database/sql"
	"errors"
)

func VisitPages(ctx context.Context, db *sql.DB, stop func(int64) bool) error {
	for page := 0; page < 100; page++ {
		if err := visitPage(ctx, db, page, stop); err != nil {
			return err
		}
	}
	return nil
}
func visitPage(ctx context.Context, db *sql.DB, page int, stop func(int64) bool) (err error) {
	rows, err := db.QueryContext(ctx,
		"SELECT id FROM users ORDER BY id LIMIT 100 OFFSET $1", page*100)
	if err != nil {
		return err
	}
	defer func() { err = errors.Join(err, rows.Close()) }()
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return err
		}
		if stop(id) {
			break
		}
	}
	return rows.Err()
}
