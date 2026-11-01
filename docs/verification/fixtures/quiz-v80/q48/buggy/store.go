package store

import (
	"context"
	"database/sql"
)

// PaymentIDs returns the IDs of a merchant's payments.
func PaymentIDs(ctx context.Context, db *sql.DB, merchant string) ([]int64, error) {
	rows, err := db.QueryContext(ctx,
		`SELECT id FROM payments WHERE merchant = $1 ORDER BY id`, merchant)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}
