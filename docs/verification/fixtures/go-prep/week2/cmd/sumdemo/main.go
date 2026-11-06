// Command sumdemo вызывает asm.Add и asm.Sum: на нём смотрят objdump и встраивание.
package main

import (
	"fmt"
	"os"

	"github.com/you/go-prep/week2/asm"
)

func main() {
	n := len(os.Args)
	fmt.Println(asm.Add(n, 40), asm.Sum([]int{n, 2, 3}))
}
