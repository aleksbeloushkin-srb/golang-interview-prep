package pages

import (
	"context"
	"database/sql"
)

func VisitPages(ctx context.Context, db *sql.DB, stop func(int64) bool) error {
	for page := 0; page < 100; page++ {
		rows, err := db.QueryContext(ctx,
			"SELECT id FROM users ORDER BY id LIMIT 100 OFFSET $1", page*100)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id int64
			if err := rows.Scan(&id); err != nil {
				return err
			}
			if stop(id) {
				break
			}
		}
		if err := rows.Err(); err != nil {
			return err
		}
	}
	return nil
}
