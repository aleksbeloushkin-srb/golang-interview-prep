package perm

import (
	"errors"
	"strings"
	"testing"
)

func TestValues(t *testing.T) {
	if Exec != 1 || Write != 2 || Read != 4 {
		t.Fatalf("Exec, Write, Read = %d, %d, %d, want 1, 2, 4 as in chmod", Exec, Write, Read)
	}
}

func TestHas(t *testing.T) {
	tests := []struct {
		name string
		p, q Perm
		want bool
	}{
		{"one right that is there", Read | Write, Read, true},
		{"one right that is not", Read | Write, Exec, false},
		{"all of several", Read | Write | Exec, Read | Exec, true},
		{"only some of several", Read, Read | Write, false},
		{"no rights asked", Read, 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.p.Has(tt.q); got != tt.want {
				t.Errorf("Perm(%03b).Has(%03b) = %v, want %v", tt.p, tt.q, got, tt.want)
			}
		})
	}
}

func TestAddRemoveToggle(t *testing.T) {
	tests := []struct {
		name string
		got  Perm
		want Perm
	}{
		{"Add a new right", Read.Add(Write), Read | Write},
		{"Add a right that is there", (Read | Write).Add(Read), Read | Write},
		{"Remove a right that is there", (Read | Write).Remove(Write), Read},
		{"Remove a right that is not there", Read.Remove(Exec), Read},
		{"Remove several", (Read | Write | Exec).Remove(Write | Exec), Read},
		{"Toggle on", Read.Toggle(Exec), Read | Exec},
		{"Toggle off", (Read | Exec).Toggle(Exec), Read},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("got %03b, want %03b", tt.got, tt.want)
			}
		})
	}
}

func TestString(t *testing.T) {
	want := map[Perm]string{0: "---", 1: "--x", 2: "-w-", 3: "-wx", 4: "r--", 5: "r-x", 6: "rw-", 7: "rwx"}
	for p, s := range want {
		if got := p.String(); got != s {
			t.Errorf("Perm(%d).String() = %q, want %q", p, got, s)
		}
	}
	if got := (Read | 0b1000).String(); got != "r--" {
		t.Errorf("unknown bits are not printed: Perm(0b1100).String() = %q, want %q", got, "r--")
	}
}

func TestParse(t *testing.T) {
	for p := Perm(0); p <= 7; p++ {
		got, err := Parse(p.String())
		if err != nil || got != p {
			t.Errorf("Parse(%q) = %03b, %v, want %03b, nil", p.String(), got, err, p)
		}
	}
}

func TestParseErrors(t *testing.T) {
	for _, s := range []string{"", "rw", "rwxr", "wrx", "r-z", "RWX", "x--"} {
		t.Run(s, func(t *testing.T) {
			p, err := Parse(s)
			if !errors.Is(err, ErrBadPerm) {
				t.Fatalf("Parse(%q) = %03b, %v, want an error that wraps ErrBadPerm", s, p, err)
			}
			if !strings.Contains(err.Error(), `"`+s+`"`) {
				t.Errorf("error %q does not quote the input %q", err, s)
			}
		})
	}
}
