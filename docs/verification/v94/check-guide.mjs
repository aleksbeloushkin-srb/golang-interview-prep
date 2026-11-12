// v94: reproduces every output quoted on the "Тесты в Go" page (data/guides.js, go-testing) on each Go toolchain.
// Usage: GO_BINS=~/sdk/go1.24.7/bin/go,~/sdk/go1.27.3/bin/go node docs/verification/v94/check-guide.mjs
// Mutations are applied to copies in a temporary directory; the fixtures are not touched.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const here = new URL('.', import.meta.url).pathname;
const fixtures = join(here, '..', 'fixtures');
const bins = (process.env.GO_BINS || 'go').split(',').map(s => s.trim()).filter(Boolean);
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` — ${extra}`}`);

const run = (go, dir, args) => {
  const r = spawnSync(go, args, { cwd: dir, encoding: 'utf8', env: { ...process.env, GOTOOLCHAIN: 'local', GOFLAGS: '' }, timeout: 120_000 });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const mutate = (file, from, to) => {
  const src = readFileSync(file, 'utf8');
  if (src.split(from).length !== 2) throw new Error(`${file}: "${from}" is not there exactly once`);
  writeFileSync(file, src.replace(from, () => to));
};

for (const go of bins) {
  const version = run(go, here, ['version']).out.trim().split(' ')[2];
  const tmp = mkdtempSync(join(tmpdir(), 'v94-'));
  try {
    // The go-prep module with the guide's samples.
    const prep = join(tmp, 'go-prep');
    cpSync(join(fixtures, 'go-prep'), prep, { recursive: true });
    const calc = join(prep, 'week1', 'calc');
    let r = run(go, prep, ['vet', './...']);
    ok(`${version}: go vet ./... is clean`, r.code === 0, r.out);
    r = run(go, prep, ['test', '-race', '-count=1', './...']);
    ok(`${version}: go test -race ./... passes`, r.code === 0, r.out);
    r = run(go, prep, ['test', '-count=1', '-v', '-run', 'TestDiv', './week1/calc']);
    ok(`${version}: subtest names use underscores`, /=== RUN {3}TestDiv\/drops_the_fraction/.test(r.out) && /--- PASS: TestDiv\/by_zero/.test(r.out), r.out);
    r = run(go, prep, ['test', '-count=1', '-v', '-run', 'TestDiv/by_zero', './week1/calc']);
    ok(`${version}: -run selects one subtest`, (r.out.match(/=== RUN/g) || []).length === 2, r.out);
    r = run(go, prep, ['test', '-count=1', '-v', '-run', 'TestDiv/by zero', './week1/calc']);
    ok(`${version}: -run with a space matches the rewritten name`, /--- PASS: TestDiv\/by_zero/.test(r.out) && (r.out.match(/=== RUN/g) || []).length === 2, r.out);
    r = run(go, prep, ['test', '-count=1', '-v', '-run', 'Div', './week1/calc']);
    ok(`${version}: -run Div runs TestDiv, FuzzDiv and ExampleDiv`, ['TestDiv', 'FuzzDiv', 'ExampleDiv'].every(n => r.out.includes(`--- PASS: ${n} `)), r.out);
    r = run(go, prep, ['test', '-count=1', '-v', '-run', 'TestClamp', './week1/calc']);
    ok(`${version}: parallel subtests PAUSE and CONT`, /=== PAUSE TestClamp\/inside/.test(r.out) && /=== CONT {2}TestClamp\//.test(r.out), r.out);
    r = run(go, prep, ['test', '-count=1', '-run', '^$', '-bench', 'Div', '-benchtime', '1000x', '-benchmem', './week1/calc']);
    ok(`${version}: benchmark with b.Loop, no allocations`, /BenchmarkDiv-\d+\s+1000\s+.*\s0 B\/op\s+0 allocs\/op/.test(r.out), r.out);
    r = run(go, prep, ['test', '-run', '^$', '-fuzz', 'FuzzDiv', './...']);
    ok(`${version}: -fuzz refuses several packages`, r.out.includes('cannot use -fuzz flag with multiple packages'), r.out);

    // Section 2, step 3: floor division fails only the negative case.
    const div = join(calc, 'div.go');
    const divSrc = readFileSync(div, 'utf8');
    mutate(div, 'return a / b, nil', 'return int(math.Floor(float64(a) / float64(b))), nil');
    mutate(div, '"fmt"\n', '"fmt"\n\t"math"\n');
    r = run(go, prep, ['test', '-count=1', '-run', 'TestDiv', './week1/calc']);
    ok(`${version}: Floor fails only the negative case`, r.out.includes('div_test.go:27: Div(-7, 2) = -4, want -3') && (r.out.match(/--- FAIL: TestDiv\//g) || []).length === 1, r.out);
    writeFileSync(div, divSrc);

    // Section 5, paragraph 3: Div through float64 without Floor passes the table and the seeds, but is wrong past 2^53.
    mutate(div, 'return a / b, nil', 'return int(float64(a) / float64(b)), nil');
    writeFileSync(join(calc, 'big_test.go'), 'package calc\n\nimport "testing"\n\nfunc TestBig(t *testing.T) {\n\tif q, _ := Div(1<<53+1, 1); q != 1<<53+1 {\n\t\tt.Logf("WRONG %d", q)\n\t}\n}\n');
    r = run(go, prep, ['test', '-count=1', '-v', './week1/calc']);
    ok(`${version}: float64 Div passes the table and seeds, wrong at 2^53+1`, r.code === 0 && r.out.includes('WRONG 9007199254740992'), r.out);
    rmSync(join(calc, 'big_test.go'));
    writeFileSync(div, divSrc);

    // Section 3, step 2: the failure line with and without t.Helper.
    const clampTest = join(calc, 'clamp_test.go');
    const clampSrc = readFileSync(clampTest, 'utf8');
    mutate(clampTest, '{x: 42, lo: 0, hi: 10, want: 10}', '{x: 42, lo: 0, hi: 10, want: 11}');
    r = run(go, prep, ['test', '-count=1', '-run', 'TestClamp', './week1/calc']);
    ok(`${version}: with t.Helper the caller's line`, r.out.includes('clamp_test.go:18: Clamp(42, 0, 10) = 10, want 11'), r.out);
    mutate(clampTest, '\tt.Helper()\n', '');
    r = run(go, prep, ['test', '-count=1', '-run', 'TestClamp', './week1/calc']);
    ok(`${version}: without t.Helper the helper's line`, r.out.includes('clamp_test.go:26: Clamp(42, 0, 10) = 10, want 11'), r.out);
    writeFileSync(clampTest, clampSrc);

    // Section 5: a wrong // Output: fails the example with got/want.
    const example = join(calc, 'example_test.go');
    const exampleSrc = readFileSync(example, 'utf8');
    mutate(example, '// 3 <nil>', '// 3.5 <nil>');
    r = run(go, prep, ['test', '-count=1', '-run', 'ExampleDiv', './week1/calc']);
    ok(`${version}: a wrong Output fails the example`, /--- FAIL: ExampleDiv/.test(r.out) && /got:\n3 <nil>/.test(r.out) && /want:\n3\.5 <nil>/.test(r.out), r.out);
    writeFileSync(example, exampleSrc);

    // Section 5, step 3: the lost divisor sign passes go test, the fuzzer finds it and the input stays as a seed.
    mutate(div, 'return a / b, nil', 'if b < 0 {\n\t\tb = -b\n\t}\n\treturn a / b, nil');
    r = run(go, prep, ['test', '-count=1', './week1/calc']);
    ok(`${version}: lost sign passes plain go test`, r.code === 0, r.out);
    r = run(go, prep, ['test', '-run', '^$', '-fuzz', 'FuzzDiv', '-fuzztime', '30s', './week1/calc']);
    ok(`${version}: the fuzzer finds the lost sign`, /--- FAIL: FuzzDiv/.test(r.out) && r.out.includes('Failing input written to testdata/fuzz/FuzzDiv/'), r.out.slice(-600));
    r = run(go, prep, ['test', '-count=1', './week1/calc']);
    ok(`${version}: the found input fails plain go test`, /--- FAIL: FuzzDiv\/[0-9a-f]{16}/.test(r.out), r.out);
    writeFileSync(div, divSrc);
    r = run(go, prep, ['test', '-count=1', './week1/calc']);
    ok(`${version}: fixed Div passes with the saved input`, r.code === 0, r.out);

    // Section 6: three W1-2 mutants on the practice reference; section 7: TestWithdraw catches all three.
    const acc = join(tmp, 'acc');
    mkdirSync(acc);
    writeFileSync(join(acc, 'go.mod'), 'module example.com/acc\n\ngo 1.24\n');
    const account = join(acc, 'account.go');
    const withdraw = readFileSync(join(here, 'drill', 'withdraw_test.go'), 'utf8');
    cpSync(join(fixtures, 'practice', 'account', 'account.go'), account);
    cpSync(join(fixtures, 'practice', 'account', 'account_test.go'), join(acc, 'account_test.go'));
    const accSrc = readFileSync(account, 'utf8');
    const mutants = {
      m1: ['(balance %d): %w", amount, a.ID, a.balance, ErrInsufficientFunds)', '(balance %d): %v", amount, a.ID, a.balance, ErrInsufficientFunds)'],
      m2: ['func (a *Account) Deposit(', 'func (a Account) Deposit('],
      m3: ['if amount > a.balance {', 'if amount >= a.balance {']
    };
    const failed = out => [...out.matchAll(/^--- FAIL: (\S+)/gm)].map(m => m[1]);
    r = run(go, acc, ['test', '-count=1', '-cover', '.']);
    const cover = (r.out.match(/coverage: ([\d.]+)%/) || [])[1];
    ok(`${version}: reference passes, coverage 88.2%`, r.code === 0 && cover === '88.2', r.out);
    mutate(account, ...mutants.m1);
    r = run(go, acc, ['test', '-count=1', '.']);
    ok(`${version}: mutant 1 fails two tests`, failed(r.out).join() === 'TestInsufficientFundsIsWrapped,TestTwoLevelsOfWrapping' && r.out.includes('account_test.go:40: errors.Is(withdraw 500 from A (balance 100): insufficient funds, ErrInsufficientFunds) = false'), r.out);
    writeFileSync(account, accSrc);
    mutate(account, ...mutants.m2);
    const vet = run(go, acc, ['vet', '.']);
    r = run(go, acc, ['test', '-count=1', '.']);
    ok(`${version}: mutant 2 — vet silent, five tests fail`, vet.code === 0 && failed(r.out).length === 5 && failed(r.out)[0] === 'TestDepositWithdraw' && r.out.includes('account_test.go:16: withdraw 300 from A (balance 0): insufficient funds'), `${vet.out}\n${r.out}`);
    writeFileSync(account, accSrc);
    mutate(account, ...mutants.m3);
    r = run(go, acc, ['test', '-count=1', '-cover', '.']);
    ok(`${version}: mutant 3 survives with the same coverage`, r.code === 0 && (r.out.match(/coverage: ([\d.]+)%/) || [])[1] === cover, r.out);
    writeFileSync(join(acc, 'withdraw_test.go'), withdraw);
    r = run(go, acc, ['test', '-race', '-count=1', '-run', 'TestWithdraw', '.']);
    ok(`${version}: TestWithdraw catches mutant 3`, failed(r.out).join() === 'TestWithdraw' && r.out.includes('--- FAIL: TestWithdraw/whole_balance') && r.out.includes('withdraw_test.go:35: Withdraw(100) with balance 100: error = withdraw 100 from A (balance 100): insufficient funds, want <nil>'), r.out);
    writeFileSync(account, accSrc);
    mutate(account, ...mutants.m1);
    r = run(go, acc, ['test', '-count=1', '-run', 'TestWithdraw', '.']);
    ok(`${version}: TestWithdraw catches mutant 1 in one case`, (r.out.match(/--- FAIL: TestWithdraw\//g) || []).length === 1 && r.out.includes('TestWithdraw/one_more_than_the_balance'), r.out);
    writeFileSync(account, accSrc);
    mutate(account, ...mutants.m2);
    r = run(go, acc, ['test', '-count=1', '-run', 'TestWithdraw', '.']);
    ok(`${version}: TestWithdraw catches mutant 2 in all three cases`, (r.out.match(/--- FAIL: TestWithdraw\//g) || []).length === 3, r.out);
    writeFileSync(account, accSrc);
    r = run(go, acc, ['test', '-race', '-count=1', '.']);
    ok(`${version}: reference passes with TestWithdraw under -race`, r.code === 0, r.out);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

console.log(results.join('\n'));
const failedCount = results.filter(r => r.startsWith('FAIL')).length;
console.log(`${results.length - failedCount}/${results.length} passed`);
process.exit(failedCount ? 1 : 0);
