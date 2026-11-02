package main

import (
	"log/slog"
	"os"
)

// Token is a bearer token. LogValue has a value receiver, so both Token
// and *Token implement slog.LogValuer.
type Token string

func (Token) LogValue() slog.Value { return slog.StringValue("[REDACTED]") }

type AuthRequest struct {
	User  string
	Token Token
}

func main() {
	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				return slog.Attr{} // drop the time so the output is stable
			}
			return a
		},
	}))
	req := AuthRequest{User: "aleks", Token: "tok-8f3a91"}
	log.Info("auth", "user", req.User, "token", req.Token)
}
