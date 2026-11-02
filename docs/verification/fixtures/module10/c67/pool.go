package txctx

import (
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PoolConfig parses dsn for pgxpool. By default pgx prepares each statement
// once per connection and caches it by name. Behind a pooler in transaction
// mode the next transaction may land on another server connection, where
// that named statement does not exist. QueryExecModeExec sends every query
// with the unnamed statement in one round trip, so nothing outlives the
// transaction. The same is set in the DSN: default_query_exec_mode=exec.
// Parameter types then come from the Go values: []byte goes as bytea, so
// JSON for a jsonb column is passed as a string or json.RawMessage.
func PoolConfig(dsn string, txPooler bool) (*pgxpool.Config, error) {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	if txPooler {
		cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeExec
	}
	return cfg, nil
}
