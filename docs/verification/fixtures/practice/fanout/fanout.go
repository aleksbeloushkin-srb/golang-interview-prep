// Package fanout is the reference solution for practice task W7-4:
// route values to N outputs by key, like messages to Kafka partitions.
package fanout

import (
	"context"
	"hash/fnv"
)

// Route sends each value from in to one of n outputs (n < 1 means 1), chosen
// by its key: values with the same key always go to the same output, in the
// order they arrived. One goroutine routes, so a slow reader of one output
// holds back all of them. Every output is closed after in is closed or ctx is
// done. Route never closes in: it belongs to its sender.
func Route[T any](ctx context.Context, in <-chan T, n int, key func(T) string) []<-chan T {
	n = max(n, 1)
	outs := make([]chan T, n)
	result := make([]<-chan T, n)
	for i := range outs {
		outs[i] = make(chan T)
		result[i] = outs[i]
	}
	go func() {
		defer func() {
			for _, out := range outs {
				close(out)
			}
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case v, ok := <-in:
				if !ok {
					return
				}
				select {
				case outs[partition(key(v), n)] <- v:
				case <-ctx.Done():
					return
				}
			}
		}
	}()
	return result
}

// partition maps a key to an output index; the same key always gives the same index.
func partition(key string, n int) int {
	h := fnv.New32a()
	h.Write([]byte(key))
	return int(h.Sum32() % uint32(n))
}
