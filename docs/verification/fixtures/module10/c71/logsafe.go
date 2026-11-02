// Package logsafe keeps secrets out of slog output in one place: sensitive
// values get a type that masks itself, and the handler masks known keys as a
// safety net for values that do not have that type yet.
package logsafe

import (
	"io"
	"log/slog"
	"slices"
	"strings"
)

const mask = "[REDACTED]"

// Secret holds a value that must not reach logs. Code that really needs the
// value converts it with string(s), for example when it fills an outgoing
// request. All methods have value receivers: a method on *Secret is not in
// the method set of Secret, and slog would print a Secret value as is.
type Secret string

// LogValue covers slog.
func (Secret) LogValue() slog.Value { return slog.StringValue(mask) }

// String covers fmt's %v and %s, and errors built with them.
func (Secret) String() string { return mask }

// GoString covers %#v.
func (Secret) GoString() string { return mask }

// MarshalJSON covers a struct logged whole with slog.Any: the JSON handler
// encodes it with encoding/json and never calls LogValue on its fields.
// Wire types keep plain strings and are filled with string(s).
func (Secret) MarshalJSON() ([]byte, error) { return []byte(`"` + mask + `"`), nil }

// sensitiveKeys are matched in lower case.
var sensitiveKeys = map[string]bool{
	"password": true, "token": true, "authorization": true, "cookie": true,
	"otp": true, "pan": true, "card_number": true, "cvv": true,
}

func sensitive(key string) bool { return sensitiveKeys[strings.ToLower(key)] }

// Redact is a ReplaceAttr function. slog calls it for every non-group
// attribute, after LogValue has been resolved, with the names of the open
// groups. A group itself is never passed, so a sensitive group name is
// matched through groups.
func Redact(groups []string, a slog.Attr) slog.Attr {
	if sensitive(a.Key) || slices.ContainsFunc(groups, sensitive) {
		return slog.String(a.Key, mask)
	}
	return a
}

// NewLogger returns a JSON logger that applies Redact to every attribute,
// including those added with With and WithGroup.
func NewLogger(w io.Writer, level slog.Leveler) *slog.Logger {
	return slog.New(slog.NewJSONHandler(w, &slog.HandlerOptions{Level: level, ReplaceAttr: Redact}))
}
