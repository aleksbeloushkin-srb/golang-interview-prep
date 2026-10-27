package apis

import (
	"context"
	"testing"
	"testing/synctest"
	"time"
)

func TestDeadline(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		if ctx.Err() != nil {
			t.Fatal("deadline fired early")
		}
		time.Sleep(time.Second)
		synctest.Wait()
		if ctx.Err() != context.DeadlineExceeded {
			t.Fatalf("got %v", ctx.Err())
		}
	})
}
