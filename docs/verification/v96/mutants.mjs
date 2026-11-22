// v96: the tests of W3-1 perm, W3-2 bitset and W3-3 allocate pass on the reference solution, fail on the starter and
// catch typical wrong solutions (mutants). Each mutant is applied to a copy in a temporary module.
// Usage: GO_BINS=~/sdk/go1.24.7/bin/go,~/sdk/go1.27.3/bin/go node docs/verification/v96/mutants.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const practice = new URL('../fixtures/practice/', import.meta.url).pathname;
const bins = (process.env.GO_BINS || 'go').split(',').map(s => s.trim()).filter(Boolean);

// [task, file, from, to, what it breaks]
const MUTANTS = [
  ['perm', 'perm.go', 'return p&q == q', 'return p&q != 0', 'Has: any right instead of all'],
  ['perm', 'perm.go', 'return p &^ q', 'return p ^ q', 'Remove toggles: adds a right that was absent'],
  ['perm', 'perm.go', '{{Read, \'r\'}, {Write, \'w\'}, {Exec, \'x\'}}', '{{Exec, \'r\'}, {Write, \'w\'}, {Read, \'x\'}}', 'String and Parse: bit order reversed'],
  ['perm', 'perm.go', 'if len(s) != 3 {', 'if len(s) > 3 {', 'Parse: short text accepted'],
  ['perm', 'perm.go', 'return 0, fmt.Errorf("parse %q: position %d: %w", s, i, ErrBadPerm)', 'continue', 'Parse: a wrong character ignored'],
  ['perm', 'perm.go', 'return 0, fmt.Errorf("parse %q: position %d: %w", s, i, ErrBadPerm)', 'return 0, fmt.Errorf("parse %q: position %d: %v", s, i, ErrBadPerm)', 'Parse: %v instead of %w'],
  ['bitset', 'bitset.go', 's.words[w] |= 1 << (i & 63)', 's.words[w] |= 1 << (i & 31)', 'Add: mask 31 instead of 63'],
  ['bitset', 'bitset.go', 's.words[i>>6] &^= 1 << (i & 63)', 's.words[i>>6] ^= 1 << (i & 63)', 'Remove toggles'],
  ['bitset', 'bitset.go', 'n += bits.OnesCount64(w)', 'if w != 0 {\n\t\t\tn++\n\t\t}', 'Len counts words'],
  ['bitset', 'bitset.go', '\tfor len(s.words) < len(t.words) {\n\t\ts.words = append(s.words, 0)\n\t}\n\tfor i, w := range t.words {', '\tfor i, w := range t.words {\n\t\tif i >= len(s.words) {\n\t\t\tbreak\n\t\t}', 'Union drops the elements beyond s'],
  ['bitset', 'bitset.go', 'if i < 0 || i>>6 >= len(s.words) {\n\t\treturn false', 'if i < 0 {\n\t\treturn false', 'Has beyond the last word panics'],
  ['bitset', 'bitset.go', 'out = append(out, wi<<6+bits.TrailingZeros64(w))', 'out = append(out, wi<<5+bits.TrailingZeros64(w))', 'Elems: word index times 32'],
  ['bitset', 'bitset.go', '\tif i < 0 {\n\t\tpanic(fmt.Sprintf("bitset: negative element %d", i))\n\t}\n\tw := i >> 6', '\tif i < 0 {\n\t\treturn\n\t}\n\t_ = fmt.Sprint()\n\tw := i >> 6', 'Add(-1) silently ignored'],
  ['allocate', 'allocate.go', 'if int64(i) < r {', 'if int64(n-1-i) < r {', 'extra units go to the last parts'],
  ['allocate', 'allocate.go', '\tif r < 0 {\n\t\textra, r = -1, -r\n\t}\n', '', 'negative amounts: remainder lost'],
  ['allocate', 'allocate.go', 'q, r := m.Minor/int64(n), m.Minor%int64(n)', 'q, r := int64(float64(m.Minor)/float64(n)), int64(0)', 'float64 division, no remainder'],
  ['allocate', 'allocate.go', 'if n <= 0 {', 'if n < 0 {', 'n = 0 not rejected'],
  ['allocate', 'allocate.go', 'parts[i] = Money{Minor: q, Currency: m.Currency}', 'parts[i] = Money{Minor: q}', 'currency lost'],
];

const run = (go, dir, args) => {
  const r = spawnSync(go, args, { cwd: dir, encoding: 'utf8', env: { ...process.env, GOTOOLCHAIN: 'local', GOFLAGS: '' }, timeout: 120_000 });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` — ${extra.slice(-400)}`}`);

for (const go of bins) {
  const version = run(go, practice, ['version']).out.trim().split(' ')[2];
  const tmp = mkdtempSync(join(tmpdir(), 'v96m-'));
  try {
    writeFileSync(join(tmp, 'go.mod'), 'module example.com/m\n\ngo 1.24\n');
    for (const task of ['perm', 'bitset', 'allocate']) {
      cpSync(join(practice, task), join(tmp, task), { recursive: true });
      let r = run(go, tmp, ['vet', `./${task}`]);
      ok(`${version} ${task}: vet clean`, r.code === 0, r.out);
      r = run(go, tmp, ['test', '-race', '-count=1', `./${task}`]);
      ok(`${version} ${task}: reference passes`, r.code === 0, r.out);
      const sol = join(tmp, task, `${task}.go`);
      const ref = readFileSync(sol, 'utf8');
      copyFileSync(join(tmp, task, 'starter.go.txt'), sol);
      r = run(go, tmp, ['test', '-count=1', `./${task}`]);
      ok(`${version} ${task}: starter fails`, r.code !== 0 && /FAIL/.test(r.out), r.out);
      writeFileSync(sol, ref);
      rmSync(join(tmp, task, 'starter.go.txt'));
    }
    for (const [task, file, from, to, what] of MUTANTS) {
      const path = join(tmp, task, file);
      const ref = readFileSync(path, 'utf8');
      if (ref.split(from).length !== 2) throw Error(`${task} mutant «${what}»: pattern not found exactly once`);
      writeFileSync(path, ref.replace(from, () => to));
      const r = run(go, tmp, ['test', '-count=1', '-timeout=60s', `./${task}`]);
      ok(`${version} ${task}: caught — ${what}`, r.code !== 0 && /FAIL/.test(r.out), r.out);
      writeFileSync(path, ref);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(results.join('\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
