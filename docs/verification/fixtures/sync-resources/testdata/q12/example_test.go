package batch

import "testing"

func TestIntentionalSharedAppendRace(t *testing.T) { ProcessBatch(make([]int, 256)) }
