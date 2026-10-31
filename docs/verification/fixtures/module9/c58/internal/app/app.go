// Package app is the composition root: the one place that builds every dependency
// and passes it on explicitly, without a container.
package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
)

type Config struct {
	Addr    string
	DSN     string
	RiskURL string
}

// LoadConfig reads the configuration; main passes os.Getenv, tests pass a map lookup.
func LoadConfig(getenv func(string) string) (Config, error) {
	cfg := Config{
		Addr:    getenv("LEDGER_ADDR"),
		DSN:     getenv("LEDGER_DSN"),
		RiskURL: getenv("LEDGER_RISK_URL"),
	}
	var errs []error
	if cfg.Addr == "" {
		errs = append(errs, errors.New("LEDGER_ADDR is required"))
	}
	if cfg.DSN == "" {
		errs = append(errs, errors.New("LEDGER_DSN is required"))
	}
	if cfg.RiskURL == "" {
		errs = append(errs, errors.New("LEDGER_RISK_URL is required"))
	}
	if len(errs) > 0 {
		return Config{}, errors.Join(errs...)
	}
	return cfg, nil
}

type App struct {
	Handler http.Handler
	cleanup cleanup
}

// New builds the service in dependency order. If a step fails, it closes
// what it has already opened, in reverse order, and returns the error.
func New(ctx context.Context, cfg Config, log *slog.Logger) (_ *App, err error) {
	a := &App{cleanup: cleanup{log: log}}
	defer func() {
		if err != nil {
			err = errors.Join(err, a.cleanup.run())
		}
	}()

	db, err := openDB(cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	a.cleanup.push("db", db.Close)

	st, err := newStore(ctx, db)
	if err != nil {
		return nil, fmt.Errorf("store: %w", err)
	}
	a.cleanup.push("store", st.Close)

	risk, err := newRiskClient(cfg.RiskURL)
	if err != nil {
		return nil, fmt.Errorf("risk client: %w", err)
	}
	a.cleanup.push("risk", risk.Close)

	svc := newTransferService(st, risk)
	a.Handler = newHandler(svc, log)
	return a, nil
}

// Close releases resources in reverse order of creation. A second call does nothing.
func (a *App) Close() error { return a.cleanup.run() }

// cleanup is a stack of close functions: the last resource opened is closed first,
// so nothing is closed while a resource built on top of it still uses it.
type cleanup struct {
	log   *slog.Logger
	steps []cleanupStep
}

type cleanupStep struct {
	name  string
	close func() error
}

func (c *cleanup) push(name string, close func() error) {
	c.steps = append(c.steps, cleanupStep{name: name, close: close})
}

// run closes everything, keeps going after an error and returns all errors joined.
func (c *cleanup) run() error {
	var errs []error
	for i := len(c.steps) - 1; i >= 0; i-- {
		s := c.steps[i]
		if err := s.close(); err != nil {
			errs = append(errs, fmt.Errorf("close %s: %w", s.name, err))
			continue
		}
		c.log.Info("closed", "resource", s.name)
	}
	c.steps = nil
	return errors.Join(errs...)
}
