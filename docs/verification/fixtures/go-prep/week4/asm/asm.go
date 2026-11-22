// Package asm — функции, на которых смотрят ассемблер, встраивание и escape analysis.
package asm

// Add складывает два числа: маленькая функция, компилятор её встраивает.
func Add(a, b int) int {
	return a + b
}

// Sum складывает элементы слайса в цикле.
func Sum(xs []int) int {
	total := 0
	for _, x := range xs {
		total += x
	}
	return total
}

// NewCounter возвращает указатель на локальную переменную: она уходит в кучу.
func NewCounter() *int {
	n := 0
	return &n
}
