// Package perm is the reference solution for practice task W3-1.
package perm

import (
	"errors"
	"fmt"
)

// Perm is a set of access rights, one bit per right, as in chmod: r = 4, w = 2, x = 1.
type Perm uint8

const (
	Exec  Perm = 1 << iota // 001
	Write                  // 010
	Read                   // 100
)

// ErrBadPerm is wrapped by Parse when the text is not three characters of the form "rwx" with '-' for a missing right.
var ErrBadPerm = errors.New("bad permission string")

// order is the print order of the rights: "rwx".
var order = [3]struct {
	p Perm
	c byte
}{{Read, 'r'}, {Write, 'w'}, {Exec, 'x'}}

// Has reports whether p has every right in q.
func (p Perm) Has(q Perm) bool { return p&q == q }

// Add returns p with the rights of q.
func (p Perm) Add(q Perm) Perm { return p | q }

// Remove returns p without the rights of q; a right that p does not have stays absent.
func (p Perm) Remove(q Perm) Perm { return p &^ q }

// Toggle returns p with the rights of q flipped.
func (p Perm) Toggle(q Perm) Perm { return p ^ q }

// String prints the rights as "rwx" with '-' for a missing one: Read|Exec → "r-x". Other bits are not printed.
func (p Perm) String() string {
	b := []byte("---")
	for i, o := range order {
		if p.Has(o.p) {
			b[i] = o.c
		}
	}
	return string(b)
}

// Parse reads the text String prints: "r-x" → Read|Exec.
func Parse(s string) (Perm, error) {
	if len(s) != 3 {
		return 0, fmt.Errorf("parse %q: %w", s, ErrBadPerm)
	}
	var p Perm
	for i, o := range order {
		switch s[i] {
		case o.c:
			p |= o.p
		case '-':
		default:
			return 0, fmt.Errorf("parse %q: position %d: %w", s, i, ErrBadPerm)
		}
	}
	return p, nil
}
