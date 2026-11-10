package validation

import (
	"errors"
	"fmt"
	"testing"
)

func TestValid(t *testing.T) {
	if err := Register(User{Email: "a@b.c", Age: 30}); err != nil {
		t.Fatalf("got %v, want nil", err)
	}
	// A nil *ValidationError stored in error would not be == nil.
	if err := Validate(User{Email: "a@b.c", Age: 30}); err != nil {
		t.Fatalf("Validate returned a non-nil error %#v for a valid user", err)
	}
}

func TestAsExtractsField(t *testing.T) {
	tests := []struct {
		name  string
		user  User
		field string
	}{
		{"bad email", User{Email: "nope", Age: 30}, "email"},
		{"too young", User{Email: "a@b.c", Age: 12}, "age"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Register(tt.user)
			var ve *ValidationError
			if !errors.As(err, &ve) {
				t.Fatalf("errors.As found no *ValidationError in %v", err)
			}
			if ve.Field != tt.field {
				t.Fatalf("Field = %q, want %q", ve.Field, tt.field)
			}
		})
	}
}

func TestTwoLevelsOfWrapping(t *testing.T) {
	err := Register(User{Email: "nope", Age: 30})
	outer := errors.Join(errors.New("batch item 3"), err) // another layer, Go 1.20+
	var ve *ValidationError
	if !errors.As(outer, &ve) || ve.Field != "email" {
		t.Fatalf("errors.As through two levels failed for %v", outer)
	}
}

func TestErrorMessage(t *testing.T) {
	tests := []struct {
		err  *ValidationError
		want string
	}{
		{&ValidationError{Field: "age", Reason: "must be at least 18"}, "invalid age: must be at least 18"},
		{&ValidationError{Field: "name", Reason: "must not be empty"}, "invalid name: must not be empty"},
	}
	for _, tt := range tests {
		if got := tt.err.Error(); got != tt.want {
			t.Errorf("%+v.Error() = %q, want %q", *tt.err, got, tt.want)
		}
	}
}

// validators are both entry points: every rule holds for Validate and for Register.
var validators = []struct {
	name  string
	check func(User) error
}{
	{"Validate", Validate},
	{"Register", Register},
}

func TestAgeBoundary(t *testing.T) {
	tests := []struct {
		age   int
		valid bool
	}{
		{17, false},
		{18, true},
		{19, true},
	}
	for _, tt := range tests {
		for _, v := range validators {
			t.Run(fmt.Sprintf("%s age %d", v.name, tt.age), func(t *testing.T) {
				u := User{Email: "a@b.c", Age: tt.age}
				err := v.check(u)
				if tt.valid {
					if err != nil {
						t.Fatalf("%s(%+v) = %v (%T), want nil: an age of 18 or more is valid", v.name, u, err, err)
					}
					return
				}
				var ve *ValidationError
				if !errors.As(err, &ve) {
					t.Fatalf("%s(%+v) = %v, want a *ValidationError for the age", v.name, u, err)
				}
				if ve.Field != "age" {
					t.Fatalf("%s(%+v): Field = %q, want \"age\"", v.name, u, ve.Field)
				}
			})
		}
	}
}

func TestFirstInvalidFieldIsEmail(t *testing.T) {
	u := User{Email: "nope", Age: 12} // both fields are invalid
	for _, v := range validators {
		t.Run(v.name, func(t *testing.T) {
			err := v.check(u)
			var ve *ValidationError
			if !errors.As(err, &ve) {
				t.Fatalf("%s(%+v) = %v, want a *ValidationError", v.name, u, err)
			}
			if ve.Field != "email" {
				t.Fatalf("%s(%+v): Field = %q, want \"email\": email is checked before age", v.name, u, ve.Field)
			}
		})
	}
}
