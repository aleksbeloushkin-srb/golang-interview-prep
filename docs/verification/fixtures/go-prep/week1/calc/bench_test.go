package calc

import "testing"

func BenchmarkDiv(b *testing.B) {
	for b.Loop() {
		Div(1_000_003, 7)
	}
}
