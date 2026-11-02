package logsafe

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"testing"
)

type loginRequest struct {
	User     string `json:"user"`
	Password Secret `json:"password"`
}

func decode(t *testing.T, line []byte) map[string]any {
	t.Helper()
	var rec map[string]any
	if err := json.Unmarshal(line, &rec); err != nil {
		t.Fatalf("not JSON: %v: %s", err, line)
	}
	return rec
}

func TestSecretsStayOutOfJSON(t *testing.T) {
	var buf bytes.Buffer
	log := NewLogger(&buf, slog.LevelInfo).With("api_key", Secret("key-1"))

	log.WithGroup("auth").Info("login",
		"session", Secret("sess-2"), // a Secret under an ordinary key
		"token", "tok-3", // a plain string under a sensitive key
		slog.Group("payer", "name", "Aleks", "phone", Secret("+381-4")),
		slog.Group("Authorization", "scheme", "Bearer", "credentials", "cred-5"),
		"req", loginRequest{User: "aleks", Password: "pass-6"},
	)

	out := buf.String()
	for _, s := range []string{"key-1", "sess-2", "tok-3", "+381-4", "cred-5", "pass-6"} {
		if strings.Contains(out, s) {
			t.Errorf("secret %q leaked: %s", s, out)
		}
	}

	rec := decode(t, buf.Bytes())
	auth := rec["auth"].(map[string]any)
	payer := auth["payer"].(map[string]any)
	authz := auth["Authorization"].(map[string]any)
	req := auth["req"].(map[string]any)
	checks := []struct {
		name      string
		got, want any
	}{
		{"api_key", rec["api_key"], mask},
		{"auth.session", auth["session"], mask},
		{"auth.token", auth["token"], mask},
		{"auth.payer.phone", payer["phone"], mask},
		{"auth.payer.name", payer["name"], "Aleks"},
		{"auth.Authorization.credentials", authz["credentials"], mask},
		{"auth.req.password", req["password"], mask},
		{"auth.req.user", req["user"], "aleks"},
	}
	for _, c := range checks {
		if c.got != c.want {
			t.Errorf("%s = %v, want %v", c.name, c.got, c.want)
		}
	}
}

// ReplaceAttr sees only the key "req": a struct logged whole is encoded by
// encoding/json, field by field, after ReplaceAttr has run.
func TestReplaceAttrDoesNotSeeStructFields(t *testing.T) {
	type plainLogin struct{ User, Password string }
	var buf bytes.Buffer
	NewLogger(&buf, slog.LevelInfo).Info("login", "req", plainLogin{User: "aleks", Password: "hunter2"})
	if !strings.Contains(buf.String(), `"Password":"hunter2"`) {
		t.Fatalf("expected the documented leak, got %s", buf.String())
	}
}

type ptrToken string

// LogValue has a pointer receiver: only *ptrToken implements slog.LogValuer.
func (*ptrToken) LogValue() slog.Value { return slog.StringValue(mask) }

func TestPointerReceiverLogValueIsSkippedForValue(t *testing.T) {
	tok := ptrToken("tok-7")
	if _, ok := any(tok).(slog.LogValuer); ok {
		t.Fatal("ptrToken must not implement slog.LogValuer")
	}

	var buf bytes.Buffer
	log := NewLogger(&buf, slog.LevelInfo)
	log.Info("auth", "session", tok)
	log.Info("auth", "session", &tok)

	lines := bytes.Split(bytes.TrimSpace(buf.Bytes()), []byte("\n"))
	if len(lines) != 2 {
		t.Fatalf("want 2 lines, got %q", buf.String())
	}
	if got := decode(t, lines[0])["session"]; got != "tok-7" {
		t.Errorf("value: session = %v, want the raw token (the trap)", got)
	}
	if got := decode(t, lines[1])["session"]; got != mask {
		t.Errorf("pointer: session = %v, want %s", got, mask)
	}
}

// A struct rendered to a string before logging bypasses LogValue and the
// ReplaceAttr key list: only a field's own String or MarshalJSON masks it.
func TestPreRenderedStringBypassesHandler(t *testing.T) {
	type signup struct {
		User     string
		Password Secret
		OTP      string // "otp" is in the key list, but only as an attribute key
	}
	r := signup{User: "aleks", Password: "pass-9", OTP: "otp-10"}
	js, err := json.Marshal(r)
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	log := NewLogger(&buf, slog.LevelInfo)
	log.Info("signup", "req", string(js))
	log.Info("signup", "req", fmt.Sprintf("%+v", r))

	out := buf.String()
	if strings.Contains(out, "pass-9") {
		t.Errorf("a Secret field leaked: %s", out)
	}
	if strings.Count(out, "otp-10") != 2 {
		t.Errorf("want the plain OTP field in both lines (the documented leak), got %s", out)
	}
}

func TestFmtPaths(t *testing.T) {
	s := Secret("pin-8")
	type exported struct{ PIN Secret }
	type unexported struct{ pin Secret }

	masked := []string{
		fmt.Sprintf("%v %s %+v %#v", s, s, s, s),
		fmt.Errorf("check pin %v", s).Error(),
		fmt.Sprintf("%+v", exported{PIN: s}),
	}
	for _, got := range masked {
		if strings.Contains(got, "pin-8") {
			t.Errorf("leaked: %s", got)
		}
	}
	// fmt cannot call String on an unexported field and prints it raw.
	if got := fmt.Sprintf("%+v", unexported{pin: s}); got != "{pin:pin-8}" {
		t.Errorf("unexported field: got %s, want the documented leak {pin:pin-8}", got)
	}
}

func Example() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if len(groups) == 0 && a.Key == slog.TimeKey {
				return slog.Attr{} // stable output for the example
			}
			return Redact(groups, a)
		},
	}))
	log.WithGroup("auth").Info("login",
		"user", "aleks",
		"password", "hunter2",
		slog.Group("card", "pan", "4111111111111111", "last4", "1111"),
		"session", Secret("s-42"),
	)
	// Output:
	// {"level":"INFO","msg":"login","auth":{"user":"aleks","password":"[REDACTED]","card":{"pan":"[REDACTED]","last4":"1111"},"session":"[REDACTED]"}}
}
