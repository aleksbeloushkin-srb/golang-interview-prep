// node --test scripts/go-sources.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { definition } from './go-sources.mjs';

const go = `package runtime

const (
\tstackMin = 2048
)

type gobuf struct {
\tsp   uintptr
\tpc   uintptr
}

func (gp *g) ready() {
\tx()
}

func newproc(fn *funcval) {
\ty()
}
`;

test('go: const in a group, type, field, method, func', () => {
  assert.equal(definition(go, 'stackMin'), 'stackMin = 2048');
  assert.match(definition(go, 'gobuf'), /^type gobuf struct \{[\s\S]*\n\}$/);
  assert.equal(definition(go, 'gobuf.pc'), 'pc   uintptr');
  assert.match(definition(go, 'ready'), /^func \(gp \*g\) ready\(\)/);
  assert.match(definition(go, 'newproc', 'src/runtime/proc.go'), /y\(\)\n\}$/);
  assert.equal(definition(go, 'missing'), null);
});

const asm = `TEXT runtime·gogo(SB), NOSPLIT, $0-8
\tJMP\tgogo<>(SB)

TEXT gogo<>(SB), NOSPLIT, $0
\tMOVQ\tDX, R14
\tJMP\tBX

// mcall switches to g0.
TEXT runtime·mcall<ABIInternal>(SB), NOSPLIT, $0-8
\tRET
DATA runtime·x+0(SB)/8, $1
`;

test('asm: all TEXT blocks of a symbol, ABI suffix, stops at the next TEXT/DATA/comment', () => {
  const g = definition(asm, 'gogo', 'src/runtime/asm_amd64.s');
  assert.match(g, /runtime·gogo\(SB\)/);
  assert.match(g, /gogo<>\(SB\)[\s\S]*R14/);
  assert.doesNotMatch(g, /mcall/);
  assert.equal(definition(asm, 'mcall', 'a.s'), 'TEXT runtime·mcall<ABIInternal>(SB), NOSPLIT, $0-8\n\tRET');
  assert.equal(definition(asm, 'morestack', 'a.s'), null);
});

const html = `<h3 id="Go_statements">Go statements</h3>
<p>A go statement starts a goroutine.</p>
<pre>func (p T) Close() error</pre>
<h3 id="Close">Close</h3>
<p>close(ch) records that no more values will be sent.</p>
<h2 id="Packages">Packages</h2>`;

test('html: section by id, not a Go-looking line elsewhere', () => {
  assert.match(definition(html, 'Close', 'doc/go_spec.html'), /^<h3 id="Close">Close<\/h3>\n<p>close\(ch\)[^<]*<\/p>\n$/);
  assert.doesNotMatch(definition(html, 'Go_statements', 'doc/go_spec.html'), /close\(ch\)/);
  assert.equal(definition(html, 'For_clause', 'doc/go_spec.html'), null);
});

const md = `# ABI

## Function call argument and result passing

Arguments go in registers.

### Details

More.
`;

test('md: section under an exact heading', () => {
  assert.equal(definition(md, 'Function call argument and result passing', 'abi-internal.md'),
    '## Function call argument and result passing\n\nArguments go in registers.\n');
  assert.equal(definition(md, 'Function call', 'abi-internal.md'), null);
});
