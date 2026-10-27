package audit

import (
	"context"
	"net/http"
)

func Handler(send func(context.Context) error, report func(error)) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		go func(ctx context.Context) {
			if err := send(ctx); err != nil {
				report(err)
			}
		}(r.Context())
		w.WriteHeader(http.StatusAccepted)
	})
}
