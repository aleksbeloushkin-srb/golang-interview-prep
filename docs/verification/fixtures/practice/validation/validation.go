// Package validation is the reference solution for practice task W1-3.
package validation

import (
	"fmt"
	"strings"
)

// ValidationError is a typed error: it carries data the caller can read with errors.As.
type ValidationError struct {
	Field  string
	Reason string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("invalid %s: %s", e.Field, e.Reason)
}

type User struct {
	Email string
	Age   int
}

// Validate returns a *ValidationError for the first invalid field.
// It returns a plain nil when the user is valid — never a nil *ValidationError,
// which would make a non-nil error interface.
func Validate(u User) error {
	if !strings.Contains(u.Email, "@") {
		return &ValidationError{Field: "email", Reason: "must contain @"}
	}
	if u.Age < 18 {
		return &ValidationError{Field: "age", Reason: "must be at least 18"}
	}
	return nil
}

// Register adds context with %w, so callers can still reach the ValidationError.
func Register(u User) error {
	if err := Validate(u); err != nil {
		return fmt.Errorf("register %q: %w", u.Email, err)
	}
	return nil
}
