//go:build unix && !go1.26

package ctxsvc

import (
	"context"
	"testing"
)

// Before Go 1.26 NotifyContext cancels without a cause.
func TestNotifyContextCauseIsCanceled(t *testing.T) {
	_, cause := signalCause(t)
	if cause != context.Canceled {
		t.Fatalf("Cause = %v, want context.Canceled", cause)
	}
}
