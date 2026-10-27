package mapslices

import (
	"math"
	"reflect"
	"testing"
)

func TestCapacityLimitAndShallowCopy(t *testing.T) {
	a := make([]int, 2, 4)
	a[0], a[1] = 1, 2
	limited := a[:len(a):len(a)]
	limited[0] = 9
	if a[0] != 9 {
		t.Fatal("capacity limit unexpectedly isolated index writes")
	}
	grown := append(limited, 3)
	grown[0] = 7
	if a[0] != 9 || !reflect.DeepEqual(grown, []int{7, 2, 3}) {
		t.Fatal(a, grown)
	}
	if len(a) != 2 || cap(a) != 4 {
		t.Fatal("append changed another descriptor")
	}
	n := 1
	ptrs := []*int{&n}
	copied := make([]*int, len(ptrs))
	copy(copied, ptrs)
	*copied[0] = 2
	if *ptrs[0] != 2 {
		t.Fatal("shallow copy should share pointee")
	}
	copied[0] = nil
	if ptrs[0] == nil {
		t.Fatal("element storage should be independent")
	}
}

func TestAppendSharedAndIsolated(t *testing.T) {
	for _, limit := range []bool{false, true} {
		a := make([]int, 2, 4)
		if limit {
			a = a[:len(a):len(a)]
		}
		b, c := append(a, 3), append(a, 4)
		want := 4
		if limit {
			want = 3
		}
		if b[2] != want || c[2] != 4 {
			t.Fatalf("limit=%v: %v %v", limit, b, c)
		}
	}
}

func TestMapAliasesAndShallowRebuild(t *testing.T) {
	n := 1
	old := map[string]*int{"go": &n}
	alias := old
	fresh := make(map[string]*int, len(old))
	for k, v := range old {
		fresh[k] = v
	}
	*fresh["go"] = 2
	if *alias["go"] != 2 {
		t.Fatal("rebuild should share pointed-to values")
	}
	old = nil
	if len(alias) != 1 {
		t.Fatal("reassignment mutated alias")
	}
	delete(fresh, "go")
	if len(alias) != 1 {
		t.Fatal("distinct maps should have independent entries")
	}
	clear(alias)
	if len(alias) != 0 || n != 2 {
		t.Fatal("clear must empty map, not modify pointee")
	}
	var empty map[string]int
	clear(empty)
	delete(empty, "absent")
	count := 0
	for range empty {
		count++
	}
	if count != 0 || empty != nil {
		t.Fatal("nil map behavior")
	}
}

func TestNaNDeleteVersusClear(t *testing.T) {
	nan := math.NaN()
	m := map[float64]int{nan: 1}
	delete(m, nan)
	for k := range m {
		delete(m, k)
	}
	if len(m) != 1 {
		t.Fatal("NaN is unequal to itself; delete cannot find it")
	}
	clear(m)
	if len(m) != 0 {
		t.Fatal("clear must remove NaN entries too")
	}
}

func TestDeleteUnvisitedDuringRange(t *testing.T) {
	m := map[int]int{1: 1, 2: 2, 3: 3}
	visited := 0
	for k := range m {
		visited++
		for other := range m {
			if other != k {
				delete(m, other)
			}
		}
	}
	if visited != 1 || len(m) != 1 {
		t.Fatal("deleted unvisited entries were yielded", visited, m)
	}
}
