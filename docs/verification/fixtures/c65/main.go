package main

import "fmt"

// Account plays the base class: Charge calls Fee, hoping a "subclass" overrides it.
// Amounts are in minor units (cents).
type Account struct{}

func (Account) Fee() int64 { return 100 }

func (a Account) Charge(amount int64) int64 { return amount + a.Fee() }

// Premium embeds Account and declares its own Fee.
type Premium struct{ Account }

func (Premium) Fee() int64 { return 0 }

// The fix: pass the varying step in; a call through an interface is dynamic.
type FeePolicy interface{ Fee() int64 }

func Charge(fees FeePolicy, amount int64) int64 { return amount + fees.Fee() }

func main() {
	p := Premium{}
	fmt.Println(p.Fee())         // 0: Premium.Fee hides Account.Fee
	fmt.Println(p.Charge(1000))  // 1100: runs p.Account.Charge, where a.Fee() is Account.Fee
	fmt.Println(Charge(p, 1000)) // 1000: the interface call reaches Premium.Fee
	// var a Account = p         // compile error: Premium is not an Account
}
