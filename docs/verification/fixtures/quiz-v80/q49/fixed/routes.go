package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

// addr is where main listens; TestMain points it at a free port.
var addr = ":8080"

// routes serves GET /slow: one second of work, with progress lines on stdout
// so that the test can tell when the request started and whether it finished.
func routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /slow", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("started")
		time.Sleep(time.Second) // the request's work, not synchronization
		io.WriteString(w, "done")
		fmt.Println("finished")
	})
	return mux
}
