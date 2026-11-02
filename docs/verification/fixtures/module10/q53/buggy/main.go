package main

import (
	"fmt"
	"maps"
)

// AppError is a domain error with parameters for the log and the response.
type AppError struct {
	Code   string
	Params map[string]string
}

func (e *AppError) Error() string { return e.Code }

// ErrInsufficientFunds is a shared error value without parameters.
var ErrInsufficientFunds = &AppError{Code: "insufficient_funds"}

// logParams copies the error's parameters, so the shared error stays
// unchanged, and adds the request ID.
func logParams(err *AppError, requestID string) map[string]string {
	params := maps.Clone(err.Params)
	params["request_id"] = requestID
	return params
}

func main() {
	limit := &AppError{Code: "limit_exceeded", Params: map[string]string{"limit": "1000"}}
	fmt.Println(logParams(limit, "r-1"))
	fmt.Println(logParams(ErrInsufficientFunds, "r-2"))
}
