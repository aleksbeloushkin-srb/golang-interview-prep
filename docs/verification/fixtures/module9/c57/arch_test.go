package arch_test

import (
	"go/parser"
	"go/token"
	"io/fs"
	"path"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"testing"
)

const module = "example.com/m9/c57/"

// allowed lists, for each package, the packages of this module it may import.
// Dependencies point inward: transport -> use case -> domain; adapters -> domain.
var allowed = map[string][]string{
	"internal/ledger":       {},
	"internal/transfer":     {"internal/ledger"},
	"internal/store/memory": {"internal/ledger"},
	"internal/httpapi":      {"internal/ledger", "internal/transfer"},
	"cmd/ledger":            {"internal/httpapi", "internal/store/memory", "internal/transfer"},
}

// moduleImports returns the module-local imports of every non-test file, by package directory.
func moduleImports(t *testing.T) map[string][]string {
	t.Helper()
	fset := token.NewFileSet()
	imports := map[string][]string{}
	for _, root := range []string{"cmd", "internal"} {
		err := filepath.WalkDir(root, func(p string, d fs.DirEntry, err error) error {
			if err != nil || d.IsDir() || !strings.HasSuffix(p, ".go") || strings.HasSuffix(p, "_test.go") {
				return err
			}
			f, err := parser.ParseFile(fset, p, nil, parser.ImportsOnly)
			if err != nil {
				return err
			}
			pkg := filepath.ToSlash(filepath.Dir(p))
			deps := imports[pkg]
			for _, spec := range f.Imports {
				ip, err := strconv.Unquote(spec.Path.Value)
				if err != nil {
					return err
				}
				if rel, ok := strings.CutPrefix(ip, module); ok {
					deps = append(deps, rel)
				}
			}
			imports[pkg] = deps // a package with no module imports still gets a key
			return nil
		})
		if err != nil {
			t.Fatal(err)
		}
	}
	return imports
}

func violations(imports, allowed map[string][]string) []string {
	var out []string
	for pkg, deps := range imports {
		ok, known := allowed[pkg]
		if !known {
			out = append(out, pkg+": no rule; add it to allowed")
			continue
		}
		for _, dep := range deps {
			if !slices.Contains(ok, dep) {
				out = append(out, pkg+" must not import "+path.Join(module, dep))
			}
		}
	}
	slices.Sort(out)
	return slices.Compact(out)
}

func TestDependenciesPointInward(t *testing.T) {
	for _, v := range violations(moduleImports(t), allowed) {
		t.Error(v)
	}
}

func TestViolationIsReported(t *testing.T) {
	imports := map[string][]string{"internal/ledger": {"internal/httpapi"}}
	got := violations(imports, allowed)
	want := []string{"internal/ledger must not import example.com/m9/c57/internal/httpapi"}
	if !slices.Equal(got, want) {
		t.Fatalf("violations = %q, want %q", got, want)
	}
}
