package store

import (
	"context"
	"database/sql"
	"fmt"
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
	// Next returns false at the end and on an error; only Err tells them apart.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("payment ids of %s: %w", merchant, err)
	}
	return ids, nil
}
