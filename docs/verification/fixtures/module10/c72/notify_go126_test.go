//go:build unix && go1.26

package ctxsvc

import "testing"

// Since Go 1.26 NotifyContext records the signal as the cause.
func TestNotifyContextCauseNamesTheSignal(t *testing.T) {
	_, cause := signalCause(t)
	if cause == nil || cause.Error() != "user defined signal 1 signal received" {
		t.Fatalf("Cause = %v, want the signal", cause)
	}
}
