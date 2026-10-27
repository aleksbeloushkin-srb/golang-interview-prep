package audit

import (
	"context"
	"net/http"
)

// Policy: report success only after send succeeds.
func Handler(send func(context.Context) error) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := send(r.Context()); err != nil {
			http.Error(w, "audit failed", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}
