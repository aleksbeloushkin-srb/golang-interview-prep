package validation

import (
	"errors"
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
