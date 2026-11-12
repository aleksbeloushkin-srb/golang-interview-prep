package calc

// Clamp возвращает x, прижатое к отрезку [lo, hi]; ожидается lo <= hi.
func Clamp(x, lo, hi int) int {
	return min(max(x, lo), hi)
}
