// Package bitops — примеры справки «Биты в Go»: печать битов и маски на байте.
package bitops

import "fmt"

// Bin печатает байт группами по четыре бита: 182 → "1011_0110".
func Bin(x uint8) string {
	s := fmt.Sprintf("%08b", x)
	return s[:4] + "_" + s[4:]
}

// Has сообщает, стоит ли бит k (биты нумеруются справа, с нуля).
func Has(x uint8, k uint) bool { return x&(1<<k) != 0 }

// Set ставит бит k.
func Set(x uint8, k uint) uint8 { return x | (1 << k) }

// Clear снимает бит k.
func Clear(x uint8, k uint) uint8 { return x &^ (1 << k) }

// Toggle переключает бит k.
func Toggle(x uint8, k uint) uint8 { return x ^ (1 << k) }

// Field вырезает w битов, начиная с бита k: сначала сдвиг, потом маска.
func Field(x uint8, k, w uint) uint8 { return (x >> k) & (1<<w - 1) }

// SetField записывает v в w битов, начиная с бита k; остальные биты не меняются.
func SetField(x uint8, k, w uint, v uint8) uint8 {
	m := uint8(1<<w-1) << k
	return (x &^ m) | ((v << k) & m)
}
