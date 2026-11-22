package bitops

import (
	"fmt"
	"math/bits"
)

func Example_binary() {
	x := uint8(0b1011_0110)
	fmt.Println(x, Bin(x))
	fmt.Printf("%08b %x %o\n", x, x, x)
	fmt.Println(Bin(1 << 3))
	// Output:
	// 182 1011_0110
	// 10110110 b6 266
	// 0000_1000
}

func Example_overflow() {
	var u uint8 = 200
	u += 100
	fmt.Println("uint8 200 + 100 =", u)
	var s int8 = 127
	s++
	fmt.Println("int8 127 + 1 =", s)
	m := int8(-1)
	fmt.Println("int8 -1 =", Bin(uint8(m)))
	n := int8(-74)
	fmt.Println("int8 -74 =", Bin(uint8(n)), "= ^74 + 1 =", Bin(^uint8(74)+1))
	// Output:
	// uint8 200 + 100 = 44
	// int8 127 + 1 = -128
	// int8 -1 = 1111_1111
	// int8 -74 = 1011_0110 = ^74 + 1 = 1011_0110
}

func Example_operators() {
	a, b := uint8(0b1100_1010), uint8(0b1010_0110)
	fmt.Println("a      =", Bin(a))
	fmt.Println("b      =", Bin(b))
	fmt.Println("a & b  =", Bin(a&b))
	fmt.Println("a | b  =", Bin(a|b))
	fmt.Println("a ^ b  =", Bin(a^b))
	fmt.Println("a &^ b =", Bin(a&^b))
	fmt.Println("^a     =", Bin(^a))
	// Output:
	// a      = 1100_1010
	// b      = 1010_0110
	// a & b  = 1000_0010
	// a | b  = 1110_1110
	// a ^ b  = 0110_1100
	// a &^ b = 0100_1000
	// ^a     = 0011_0101
}

func Example_shifts() {
	x := uint8(0b0001_0110)
	fmt.Println("x      =", Bin(x), x)
	fmt.Println("x << 1 =", Bin(x<<1), x<<1)
	fmt.Println("x << 4 =", Bin(x<<4), x<<4)
	fmt.Println("x >> 1 =", Bin(x>>1), x>>1)
	fmt.Println("x >> 3 =", Bin(x>>3), x>>3)
	s := int8(-74)
	fmt.Println("s      =", Bin(uint8(s)), s)
	fmt.Println("s >> 1 =", Bin(uint8(s>>1)), s>>1)
	fmt.Println("s >> 4 =", Bin(uint8(s>>4)), s>>4)
	fmt.Println("uint8(s) >> 4 =", Bin(uint8(s)>>4), uint8(s)>>4)
	v := -7
	fmt.Println("-7 >> 1 =", v>>1, "  -7 / 2 =", v/2)
	var k uint = 8
	fmt.Println("x << 8 =", x<<k, "  s >> 8 =", s>>k)
	// Output:
	// x      = 0001_0110 22
	// x << 1 = 0010_1100 44
	// x << 4 = 0110_0000 96
	// x >> 1 = 0000_1011 11
	// x >> 3 = 0000_0010 2
	// s      = 1011_0110 -74
	// s >> 1 = 1101_1011 -37
	// s >> 4 = 1111_1011 -5
	// uint8(s) >> 4 = 0000_1011 11
	// -7 >> 1 = -4   -7 / 2 = -3
	// x << 8 = 0   s >> 8 = -1
}

func Example_masks() {
	x := uint8(0b1011_0110)
	fmt.Println("x                =", Bin(x))
	fmt.Println("Has(x, 2)        =", Has(x, 2))
	fmt.Println("Has(x, 3)        =", Has(x, 3))
	fmt.Println("Set(x, 3)        =", Bin(Set(x, 3)))
	fmt.Println("Clear(x, 2)      =", Bin(Clear(x, 2)))
	fmt.Println("Toggle(x, 0)     =", Bin(Toggle(x, 0)))
	fmt.Println("Field(x, 4, 4)   =", Bin(Field(x, 4, 4)))
	fmt.Println("(x & 0xF0) >> 4  =", Bin((x&0xF0)>>4))
	fmt.Println("SetField(x, 4, 4, 0b0101) =", Bin(SetField(x, 4, 4, 0b0101)))
	s := int8(-74)
	fmt.Println("s >> 4           =", Bin(uint8(s>>4)), s>>4)
	fmt.Println("(s >> 4) & 0x0F  =", Bin(uint8((s>>4)&0x0F)), (s>>4)&0x0F)
	// Output:
	// x                = 1011_0110
	// Has(x, 2)        = true
	// Has(x, 3)        = false
	// Set(x, 3)        = 1011_1110
	// Clear(x, 2)      = 1011_0010
	// Toggle(x, 0)     = 1011_0111
	// Field(x, 4, 4)   = 0000_1011
	// (x & 0xF0) >> 4  = 0000_1011
	// SetField(x, 4, 4, 0b0101) = 0101_0110
	// s >> 4           = 1111_1011 -5
	// (s >> 4) & 0x0F  = 0000_1011 11
}

func Example_tricks() {
	x := uint8(0b1011_0110)
	fmt.Println("x & (x-1) =", Bin(x&(x-1)))
	fmt.Println("x & -x    =", Bin(x&-x))
	fmt.Println("x&1 == 0  =", x&1 == 0)
	isPow2 := func(n uint) bool { return n != 0 && n&(n-1) == 0 }
	fmt.Println("isPow2(64), isPow2(96) =", isPow2(64), isPow2(96))
	single := 0
	for _, v := range []int{4, 1, 2, 1, 2} {
		single ^= v
	}
	fmt.Println("4^1^2^1^2 =", single)
	// Output:
	// x & (x-1) = 1011_0100
	// x & -x    = 0000_0010
	// x&1 == 0  = true
	// isPow2(64), isPow2(96) = true false
	// 4^1^2^1^2 = 4
}

func Example_mathBits() {
	x := uint8(0b1011_0110)
	fmt.Println("OnesCount8     =", bits.OnesCount8(x))
	fmt.Println("LeadingZeros8  =", bits.LeadingZeros8(x))
	fmt.Println("TrailingZeros8 =", bits.TrailingZeros8(x))
	fmt.Println("Len8           =", bits.Len8(x))
	fmt.Println("RotateLeft8(x, 1)  =", Bin(bits.RotateLeft8(x, 1)))
	fmt.Println("RotateLeft8(x, -1) =", Bin(bits.RotateLeft8(x, -1)))
	fmt.Println("Reverse8(x)        =", Bin(bits.Reverse8(x)))
	// Output:
	// OnesCount8     = 5
	// LeadingZeros8  = 0
	// TrailingZeros8 = 1
	// Len8           = 8
	// RotateLeft8(x, 1)  = 0110_1101
	// RotateLeft8(x, -1) = 0101_1011
	// Reverse8(x)        = 0110_1101
}
