package calc_test

import (
	"fmt"

	"github.com/you/go-prep/week1/calc"
)

func ExampleDiv() {
	q, err := calc.Div(7, 2)
	fmt.Println(q, err)
	_, err = calc.Div(1, 0)
	fmt.Println(err)
	// Output:
	// 3 <nil>
	// div 1 by 0: division by zero
}
