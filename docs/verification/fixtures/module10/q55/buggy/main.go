package main

import (
	"log/slog"
	"os"
)

// Token is a bearer token; LogValue keeps it out of the logs.
type Token string

func (t *Token) LogValue() slog.Value { return slog.StringValue("[REDACTED]") }

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
