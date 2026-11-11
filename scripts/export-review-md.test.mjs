// node --test scripts/export-review-md.test.mjs — выгрузка для ревью (scripts/export-review-md.mjs): обычный текст
// с угловыми скобками остаётся как на сайте, HTML снимается только со шпаргалки — её ячейки сайт выводит разметкой.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./export-review-md.mjs', import.meta.url));

function exportMd(...args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-review-'));
  const out = path.join(dir, 'out.md');
  try {
    execFileSync(process.execPath, [script, ...args, `--out=${out}`], { stdio: 'pipe' });
    return fs.readFileSync(out, 'utf8');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('plain text keeps literal angle brackets: c43, p-account, p-validation', () => {
  const md = exportMd('cards', 'practice', '--only=c43,p-account,p-validation');
  assert.match(md, /cmd\/<binary>\/main\.go for executables/);
  assert.match(md, /cmd\/<binary>\/main\.go для исполняемых/);
  assert.match(md, /«withdraw <сумма> from <ID счёта>»/);
  assert.match(md, /«invalid <field>: <reason>»/);
  assert.doesNotMatch(md, /cmd\/\/main\.go|withdraw {2}from|invalid : /);
});

test('the same in diagrams, quiz and card answers: nothing between < and > is dropped', () => {
  const md = exportMd('cards', 'sims', 'quiz', '--only=c42,c57,sim9,q24,q30');
  const ctx = {};
  vm.createContext(ctx);
  for (const f of ['cards', 'simulators', 'quiz']) {
    vm.runInContext(fs.readFileSync(fileURLToPath(new URL(`../data/${f}.js`, import.meta.url)), 'utf8').replace(/^const (\w+) =/mg, 'globalThis.$1 ='), ctx);
  }
  const card = id => ctx.CARDS.find(c => c.id === id);
  const quiz = id => ctx.QUIZ_QUESTIONS.find(q => q.id === id);
  const texts = [card('c42').jvmEN, card('c42').jvmRU, ...card('c57').detailsEN, ctx.SIMULATORS.find(s => s.id === 'sim9').steps[0].desc,
    ...quiz('q24').options, ...quiz('q30').options].filter(t => /<[^>]+>/.test(t));
  assert.ok(texts.length >= 6, `texts with angle brackets: ${texts.length}`);
  for (const text of texts) assert.ok(md.includes(text), `«${text.slice(0, 80)}» is in the export as is`);
});

test('cheat sheet cells are HTML on the site: tags become Markdown, entities become characters', () => {
  const md = exportMd('cheatsheet');
  const table = md.slice(md.indexOf('## Шпаргалка'));
  assert.doesNotMatch(table, /<\/?(code|strong|br|em)\b/);
  assert.doesNotMatch(table, /&(amp|lt|gt);/);
  assert.match(table, /`[^`]+`/);
});
