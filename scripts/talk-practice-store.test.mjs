// node --test scripts/talk-practice-store.test.mjs — результаты тренажёра проговора (js/talk-trainer.js) и решённые
// задачи практикума (js/practice-view.js), когда браузер не даёт записать: держатся в памяти поверх свежего снимка
// (js/pending-store.js), видны на странице, уходят в синхронизацию (pendingSnapshot) и записываются повтором.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const TALK = 'go_prep_talk_v1';
const SOLVED = 'go_prep_practice_v1';
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const sources = ['data/plan.js', 'data/practice.js', 'js/pending-store.js', 'js/talk-trainer.js', 'js/practice-view.js']
  .map(f => read(f).replace(/^const (PLAN|PRACTICE) =/mg, 'globalThis.$1 ='));

function setup(initial = {}) {
  const data = new Map(Object.entries(initial));
  const env = { full: false, timers: [] };
  const element = () => ({ textContent: '', hidden: false, classList: { add() {}, remove() {}, toggle() {} } });
  const ctx = {
    localStorage: {
      getItem: k => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => { if (env.full) throw new Error('QuotaExceededError'); data.set(k, String(v)); },
      removeItem: k => data.delete(k)
    },
    document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [], createElement: element },
    window: { addEventListener() {} },
    setTimeout: (fn, ms) => { env.timers.push({ fn, ms }); return env.timers.length; },
    clearTimeout() {}
  };
  vm.createContext(ctx);
  sources.forEach(s => vm.runInContext(s, ctx));
  const fire = () => { const due = env.timers.splice(0); due.forEach(t => t.fn()); return due.map(t => t.ms); };
  const stored = k => JSON.parse(data.get(k) || 'null');
  return { ctx, env, data, fire, stored };
}

const attempt = (at, total) => ({ at, total, steps: [{ id: 'clarify', sec: 20, rate: 'said' }, { id: 'approach', sec: 60, rate: 'partial' }, { id: 'edge', sec: 30, rate: 'missed' }] });

test('talk: a result the browser did not write stays on the page, goes to sync and is written by the retry', () => {
  const t = setup({ [TALK]: JSON.stringify({ schema: 1, results: { lc49: [attempt('2026-11-10', 100)] } }) });
  t.env.full = true;
  assert.equal(t.ctx.talkSaveAttempt('lc49', attempt('2026-11-11', 90)), false);
  assert.equal(t.ctx.talkSaveAttempt('lc1', attempt('2026-11-11', 80)), false, 'the next result does not wipe the previous one');
  assert.deepEqual([...t.ctx.talkLoadAll().lc49.map(a => a.total)], [100, 90]);
  assert.equal(t.ctx.talkLastAttempt('lc1').total, 80);
  const unsaved = JSON.parse(t.ctx.pendingSnapshot()[TALK]);
  assert.deepEqual(unsaved.results.lc49.map(a => a.total), [100, 90], 'sync sends the unsaved result');
  assert.equal(t.stored(TALK).results.lc49.length, 1, 'nothing written yet');
  t.env.full = false;
  assert.deepEqual(t.fire(), [5000]);
  assert.deepEqual(t.stored(TALK).results.lc49.map(a => a.total), [100, 90]);
  assert.equal(t.stored(TALK).results.lc1.length, 1);
  assert.deepEqual(Object.keys(t.ctx.pendingSnapshot()), [], 'nothing left to retry');
});

test('talk: another tab writes while a result waits — both survive; sync writes the key — the wait ends', () => {
  const t = setup();
  t.env.full = true;
  t.ctx.talkSaveAttempt('lc49', attempt('2026-11-11', 90));
  t.data.set(TALK, JSON.stringify({ schema: 1, results: { lc1: [attempt('2026-11-11', 70)] } }));
  assert.deepEqual([...Object.keys(t.ctx.talkLoadAll())].sort(), ['lc1', 'lc49']);
  t.ctx.pendingForget(TALK); // auth.js syncWrite: the key was written whole, with the unsaved result in it
  assert.deepEqual(Object.keys(t.ctx.pendingSnapshot()), []);
});

test('practice: a solved task the browser did not write stays solved on the page, goes to sync and is written by the retry', () => {
  const t = setup({ [SOLVED]: JSON.stringify({ 'p-money': { passedAt: '2026-11-10T10:00:00.000Z' } }) });
  t.env.full = true;
  assert.equal(t.ctx.practiceMarkSolved('p-account'), false);
  assert.equal(t.ctx.practiceMarkSolved('p-validation'), false);
  assert.deepEqual([...Object.keys(t.ctx.practiceSolved())].sort(), ['p-account', 'p-money', 'p-validation']);
  assert.deepEqual(Object.keys(JSON.parse(t.ctx.pendingSnapshot()[SOLVED])).sort(), ['p-account', 'p-money', 'p-validation']);
  assert.deepEqual(Object.keys(t.stored(SOLVED)), ['p-money']);
  t.env.full = false;
  assert.deepEqual(t.fire(), [5000]);
  assert.deepEqual(Object.keys(t.stored(SOLVED)).sort(), ['p-account', 'p-money', 'p-validation']);
  assert.equal(t.ctx.practiceMarkSolved('p-txsum'), true, 'a write that succeeds says so');
});

test('practice: broken or foreign stored value does not break the page', () => {
  for (const raw of ['{bad', '[1,2]', '"x"', 'null']) {
    const t = setup({ [SOLVED]: raw });
    assert.deepEqual(JSON.parse(JSON.stringify(t.ctx.practiceSolved())), {}, raw);
    assert.equal(t.ctx.practiceMarkSolved('p-money'), true, raw);
    assert.deepEqual(Object.keys(t.stored(SOLVED)), ['p-money'], raw);
  }
});
