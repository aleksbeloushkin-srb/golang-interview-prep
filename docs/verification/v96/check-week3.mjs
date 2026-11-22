// v96: reproduces what the week 3 pages state, on each Go toolchain.
//   GO_BINS=~/sdk/go1.24.7/bin/go,~/sdk/go1.27.3/bin/go node docs/verification/v96/check-week3.mjs
// The guide «Биты в Go»: every bit pattern in a row is printed by the Example of its section; the drill answer for
// x = 0b0110_1001 is what Example_masks prints. Разбор 1: six failing tests with the messages on the page, one fix
// each turns one test green, vet is silent. Quiz q56–q58 and card c73: the programs print what the texts say.
// Facts in the texts: a negative shift count panics, an overflowing constant does not compile.
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { QUIZ, CARD } from './week3-content.mjs';

const root = new URL('../../../', import.meta.url).pathname;
const fixtures = join(root, 'docs/verification/fixtures');
const bins = (process.env.GO_BINS || 'go').split(',').map(s => s.trim()).filter(Boolean);
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` — ${String(extra).slice(-500)}`}`);
const run = (go, dir, args) => {
  const r = spawnSync(go, args, { cwd: dir, encoding: 'utf8', env: { ...process.env, GOTOOLCHAIN: 'local', GOFLAGS: '' }, timeout: 120_000 });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const swap = (file, from, to) => {
  const src = readFileSync(file, 'utf8');
  if (src.split(from).length !== 2) throw Error(`${file}: «${from.slice(0, 60)}» is not there exactly once`);
  writeFileSync(file, src.replace(from, () => to));
};

const ctx = {};
vm.createContext(ctx);
vm.runInContext(`${readFileSync(join(root, 'data/guides.js'), 'utf8')};this.G=GUIDES`, ctx);
const bitsGuide = ctx.G['go-bits'];
const reviews = ctx.G['week3-reviews'];
const EXAMPLE = { binary: 'Example_binary', types: 'Example_overflow', operators: 'Example_operators', shifts: 'Example_shifts', masks: 'Example_masks', tricks: 'Example_tricks', mathbits: 'Example_mathBits' };
const exampleSrc = readFileSync(join(fixtures, 'go-prep/week3/bitops/example_test.go'), 'utf8');
const outputOf = name => {
  const body = exampleSrc.slice(exampleSrc.indexOf(`func ${name}()`));
  const out = body.slice(body.indexOf('// Output:'), body.indexOf('\n}'));
  return out.split('\n').slice(1).map(l => l.replace(/^\s*\/\/ ?/, '')).join('\n');
};

// Rows: every bit pattern is in the Output of the section's Example (the Example itself is checked by go test below).
for (const [section, example] of Object.entries(EXAMPLE)) {
  const out = outputOf(example);
  for (const row of bitsGuide.sections.find(s => s.id === section).rows) {
    for (const pattern of row.what.match(/[01]{4}_[01]{4}/g) || []) ok(`go-bits ${section}: «${row.cmd}» → ${pattern} is printed by ${example}`, out.includes(pattern), out);
  }
}
// Numbers named in the rows, against the Output text.
const NUMBERS = [
  ['types', '44', 'uint8 200 + 100 = 44'], ['types', '−128', 'int8 127 + 1 = -128'],
  ['shifts', '22', 'x      = 0001_0110 22'], ['shifts', '96', 'x << 4 = 0110_0000 96'], ['shifts', '−37', 's >> 1 = 1101_1011 -37'],
  ['shifts', '−5', 's >> 4 = 1111_1011 -5'], ['shifts', '11', 'uint8(s) >> 4 = 0000_1011 11'], ['shifts', '−4 и −3', '-7 >> 1 = -4   -7 / 2 = -3'],
  ['shifts', '0 и −1', 'x << 8 = 0   s >> 8 = -1'], ['masks', '−5', 's >> 4           = 1111_1011 -5'], ['masks', '= 11', '(s >> 4) & 0x0F  = 0000_1011 11'],
  ['mathbits', '5', 'OnesCount8     = 5'], ['mathbits', '0', 'LeadingZeros8  = 0'], ['mathbits', '1', 'TrailingZeros8 = 1'], ['mathbits', '8', 'Len8           = 8'],
  ['tricks', 'true, false', 'isPow2(64), isPow2(96) = true false'], ['tricks', '4', '4^1^2^1^2 = 4']
];
for (const [section, said, printed] of NUMBERS) {
  const rows = bitsGuide.sections.find(s => s.id === section).rows.map(r => r.what).join(' | ');
  ok(`go-bits ${section}: the page says ${said} and ${EXAMPLE[section]} prints «${printed}»`, rows.includes(said) && outputOf(EXAMPLE[section]).includes(printed), rows);
}

for (const go of bins) {
  const version = run(go, root, ['version']).out.trim().split(' ')[2];
  const tmp = mkdtempSync(join(tmpdir(), 'v96c-'));
  try {
    // go-prep with week3/bitops: vet and the Examples.
    const prep = join(tmp, 'go-prep');
    cpSync(join(fixtures, 'go-prep'), prep, { recursive: true });
    let r = run(go, prep, ['vet', './...']);
    ok(`${version}: go-prep vet`, r.code === 0, r.out);
    r = run(go, prep, ['test', '-race', '-count=1', './...']);
    ok(`${version}: go-prep tests and the seven Examples pass`, r.code === 0, r.out);
    r = run(go, prep, ['test', '-count=1', '-v', './week3/bitops']);
    ok(`${version}: seven Examples run`, (r.out.match(/--- PASS: Example_/g) || []).length === 7, r.out);

    // Drill: x = 0b0110_1001 in Example_masks — the answer on the page.
    const ex = join(prep, 'week3/bitops/example_test.go');
    const exSrc = readFileSync(ex, 'utf8');
    swap(ex, 'func Example_masks() {\n\tx := uint8(0b1011_0110)', 'func Example_masks() {\n\tx := uint8(0b0110_1001)');
    r = run(go, prep, ['test', '-count=1', '-run', 'Example_masks', './week3/bitops']);
    const got = r.out.slice(r.out.indexOf('got:'), r.out.indexOf('want:'));
    for (const line of ['Has(x, 2)        = false', 'Has(x, 3)        = true', 'Set(x, 3)        = 0110_1001', 'Clear(x, 2)      = 0110_1001', 'Toggle(x, 0)     = 0110_1000', 'Field(x, 4, 4)   = 0000_0110', '(x & 0xF0) >> 4  = 0000_0110', 'SetField(x, 4, 4, 0b0101) = 0101_1001']) {
      ok(`${version}: drill answer «${line}»`, got.includes(line), got);
    }
    writeFileSync(ex, exSrc);

    // Negative shift count and an overflowing constant.
    const facts = join(tmp, 'facts');
    mkdirSync(join(facts, 'neg'), { recursive: true });
    mkdirSync(join(facts, 'konst'), { recursive: true });
    writeFileSync(join(facts, 'go.mod'), 'module facts\n\ngo 1.24\n');
    writeFileSync(join(facts, 'neg/main.go'), 'package main\n\nimport "fmt"\n\nfunc main() {\n\tn := -1\n\tfmt.Println(1 << n)\n}\n');
    writeFileSync(join(facts, 'konst/main.go'), 'package main\n\nfunc main() {\n\tvar b uint8 = 256\n\t_ = b\n}\n');
    r = run(go, facts, ['run', './neg']);
    ok(`${version}: a negative shift count panics`, r.out.includes('panic: runtime error: negative shift amount'), r.out);
    r = run(go, facts, ['vet', './konst']);
    ok(`${version}: var b uint8 = 256 does not compile (overflows)`, r.code !== 0 && r.out.includes('overflows'), r.out);

    // Разбор 1: the messages on the page, then one fix per step.
    const rev = join(tmp, 'review');
    cpSync(join(fixtures, 'review-week3'), rev, { recursive: true });
    r = run(go, rev, ['vet', './...']);
    ok(`${version}: review: go vet is silent`, r.code === 0, r.out);
    const failing = () => [...run(go, rev, ['test', '-count=1', './...']).out.matchAll(/^--- FAIL: (\S+)/gm)].map(m => m[1]);
    ok(`${version}: review: six tests fail`, failing().length === 6, failing().join());
    const steps = reviews.sections.find(s => s.id === 'code').steps;
    for (const step of steps) {
      const test = /-run (\S+)/.exec(step.cmd)[1];
      r = run(go, rev, ['test', '-count=1', '-run', `^${test}$`, './...']);
      ok(`${version}: review: ${test} prints the line on the page`, r.out.includes(step.expect), r.out);
    }
    const file = join(rev, 'review/review.go');
    const FIXES = [
      ['TestWithdrawChangesBalance', 'func (w Wallet) Withdraw(', 'func (w *Wallet) Withdraw('],
      ['TestWithdrawErrorWraps', '"withdraw %.2f from %s: %v", amount', '"withdraw %.2f from %s: %w", amount'],
      ['TestIsInsufficientAfterWrapping', 'return err == ErrInsufficient', 'return errors.Is(err, ErrInsufficient)'],
      ['TestPut', 'return &Store{}', 'return &Store{wallets: make(map[string]*Wallet)}'],
      ['TestGetFound', '\tvar nf *NotFoundError\n\tw, ok := s.wallets[id]\n\tif !ok {\n\t\tnf = &NotFoundError{ID: id}\n\t}\n\treturn w, nf', '\tw, ok := s.wallets[id]\n\tif !ok {\n\t\treturn nil, &NotFoundError{ID: id}\n\t}\n\treturn w, nil'],
      ['TestSafeRecovers', '\tdefer func() {\n\t\ttoError(&err)\n\t}()', '\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\terr = fmt.Errorf("recovered: %v", r)\n\t\t}\n\t}()']
    ];
    let left = failing();
    for (const [test, from, to] of FIXES) {
      swap(file, from, to);
      const now = failing();
      ok(`${version}: review: the fix for ${test} turns it green and nothing else changes`, !now.includes(test) && now.length === left.length - 1, `${left.join()} → ${now.join()}`);
      left = now;
    }
    r = run(go, rev, ['vet', './...']);
    ok(`${version}: review: all green after six fixes (toError is unused but vet stays silent)`, left.length === 0 && r.code === 0, r.out);
    // The seventh remark: float64 money on the fixed code — 0.30 − 0.10 leaves 0.19999999999999998, and 0.20 is refused.
    writeFileSync(join(rev, 'review/float_test.go'), 'package review\n\nimport (\n\t"errors"\n\t"fmt"\n\t"testing"\n)\n\nfunc TestFloat(t *testing.T) {\n\ta, b := 0.1, 0.2\n\tw := &Wallet{ID: "A", Balance: 0.30}\n\t_ = w.Withdraw(0.10)\n\terr := w.Withdraw(0.20)\n\tt.Logf("SUM %v BAL %v REFUSED %v", a+b, w.Balance, errors.Is(err, ErrInsufficient))\n\t_ = fmt.Sprint()\n}\n');
    r = run(go, rev, ['test', '-count=1', '-v', '-run', 'TestFloat', './...']);
    ok(`${version}: review: float64 — 0.30000000000000004, 0.19999999999999998, 0.20 refused`, r.out.includes('SUM 0.30000000000000004 BAL 0.19999999999999998 REFUSED true'), r.out);
    rmSync(join(rev, 'review/float_test.go'));
    // The shorter fix of step 6: defer toError(&err).
    swap(file, '\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\terr = fmt.Errorf("recovered: %v", r)\n\t\t}\n\t}()', '\tdefer toError(&err)');
    ok(`${version}: review: defer toError(&err) also recovers`, failing().length === 0, failing().join());

    // Quiz and the card: programs print what the texts say.
    const progs = join(tmp, 'progs');
    mkdirSync(progs);
    writeFileSync(join(progs, 'go.mod'), 'module progs\n\ngo 1.24\n');
    const prog = (name, code) => { mkdirSync(join(progs, name)); writeFileSync(join(progs, name, 'main.go'), code + '\n'); return run(go, progs, ['run', `./${name}`]).out.trim(); };
    const EXPECT = { q56: '44', q57: '-4 -3', q58: '-5 11' };
    for (const q of QUIZ) {
      const out = prog(q.id, q.code);
      ok(`${version}: ${q.id} prints ${EXPECT[q.id]}, option ${q.correct}`, out === EXPECT[q.id] && q.options[q.correct].replace(/ —.*/, '') === EXPECT[q.id], out);
    }
    const FIXED = { q56: '200 stock overflow', q57: '-4 -3\n124', q58: '11 11' };
    for (const q of QUIZ) ok(`${version}: ${q.id} corrected code prints ${JSON.stringify(FIXED[q.id])}`, prog(`${q.id}fix`, q.correctedCode) === FIXED[q.id]);
    ok(`${version}: c73 code prints what its comments say`, prog('c73', CARD.code) === 'true false\n100\n-4 4');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// Card length rules: the short answer 70–100 words, the first sentence up to ~20.
const words = s => s.split(/\s+/).filter(Boolean).length;
ok(`c73 shortEN is 70–100 words (${words(CARD.shortEN)})`, words(CARD.shortEN) >= 70 && words(CARD.shortEN) <= 100);
ok(`c73 first sentence ≤ 20 words (${words(CARD.shortEN.split(/(?<=\.)\s/)[0])})`, words(CARD.shortEN.split(/(?<=\.)\s/)[0]) <= 20);

console.log(results.join('\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
