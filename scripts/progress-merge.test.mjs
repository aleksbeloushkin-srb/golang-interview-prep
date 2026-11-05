// node --test scripts/progress-merge.test.mjs — слияние прогресса устройств (js/progress-merge.js)
// и расписание повторения (js/review-queue.js, cardSchedule).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mergeProgressSnapshots } = require('../js/progress-merge.js');
const J = JSON.stringify;
const P = (snap, key) => JSON.parse(snap[key]);

test('attempts: shared history is not doubled, new attempts from both sides kept, sorted by date', () => {
  const shared = [{ d: '2026-11-01', r: 'none' }];
  const local = { go_prep_attempts_v1: J({ c1: [...shared, { d: '2026-11-03', r: 'self' }] }) };
  const server = { go_prep_attempts_v1: J({ c1: [...shared, { d: '2026-11-02', r: 'anchors' }], c2: [{ d: '2026-11-02', r: 'self' }] }) };
  const out = P(mergeProgressSnapshots(local, server), 'go_prep_attempts_v1');
  assert.deepEqual(out.c1.map(a => a.d), ['2026-11-01', '2026-11-02', '2026-11-03']);
  assert.deepEqual(out.c2, [{ d: '2026-11-02', r: 'self' }]);
});

test('attempts: two equal attempts on one side survive, list capped at 20', () => {
  const twice = [{ d: '2026-11-01', r: 'none' }, { d: '2026-11-01', r: 'none' }];
  const out = P(mergeProgressSnapshots({ go_prep_attempts_v1: J({ c1: twice }) }, { go_prep_attempts_v1: J({ c1: [twice[0]] }) }), 'go_prep_attempts_v1');
  assert.equal(out.c1.length, 2);
  const many = Array.from({ length: 25 }, (_, i) => ({ d: `2026-10-${String(i + 1).padStart(2, '0')}`, r: 'self' }));
  const capped = P(mergeProgressSnapshots({ go_prep_attempts_v1: J({ c1: many }) }, { go_prep_attempts_v1: J({ c1: [] }) }), 'go_prep_attempts_v1');
  assert.equal(capped.c1.length, 20);
  assert.equal(capped.c1[19].d, '2026-10-25');
});

test('card status: newer last attempt wins, tie → review, one-sided marks kept', () => {
  const local = {
    go_prep_progress_v2: J({ c1: 'mastered', c2: 'mastered', c3: 'review' }),
    go_prep_attempts_v1: J({ c1: [{ d: '2026-11-05', r: 'self' }], c2: [{ d: '2026-11-01', r: 'self' }] })
  };
  const server = {
    go_prep_progress_v2: J({ c1: 'review', c2: 'review', c4: 'mastered' }),
    go_prep_attempts_v1: J({ c1: [{ d: '2026-11-02', r: 'none' }], c2: [{ d: '2026-11-01', r: 'none' }] })
  };
  assert.deepEqual(P(mergeProgressSnapshots(local, server), 'go_prep_progress_v2'), { c1: 'mastered', c2: 'review', c3: 'review', c4: 'mastered' });
});

test('plan ticks and solved practice are united; plan start stays local', () => {
  const local = { go_prep_plan_v1: J({ schema: 1, start: '2026-10-26', done: { a: true } }), go_prep_practice_v1: J({ p1: { passedAt: '2026-11-01T10:00:00Z' } }) };
  const server = { go_prep_plan_v1: J({ schema: 1, start: '2026-10-19', done: { b: true } }), go_prep_practice_v1: J({ p1: { passedAt: '2026-11-03T10:00:00Z' }, p2: { passedAt: '2026-11-02T10:00:00Z' } }) };
  const out = mergeProgressSnapshots(local, server);
  assert.deepEqual(P(out, 'go_prep_plan_v1'), { schema: 1, start: '2026-10-26', done: { a: true, b: true } });
  assert.deepEqual(Object.keys(P(out, 'go_prep_practice_v1')).sort(), ['p1', 'p2']);
  assert.equal(P(out, 'go_prep_practice_v1').p1.passedAt, '2026-11-03T10:00:00Z');
});

test('talk attempts united by identity, settings stay local, unreadable side yields', () => {
  const t = (at, total) => ({ at, total, steps: [] });
  const local = { go_prep_talk_v1: J({ schema: 1, results: { lc49: [t('2026-11-01', 100)] } }), go_prep_quiz_answer_first_v1: '1', go_prep_x: '{bad' };
  const server = { go_prep_talk_v1: J({ schema: 1, results: { lc49: [t('2026-11-01', 100), t('2026-11-02', 90)] } }), go_prep_quiz_answer_first_v1: '0', go_prep_x: J({ ok: 1 }), go_prep_only_server: '7' };
  const out = mergeProgressSnapshots(local, server);
  assert.equal(P(out, 'go_prep_talk_v1').results.lc49.length, 2);
  assert.equal(out.go_prep_quiz_answer_first_v1, '1');
  assert.deepEqual(P(out, 'go_prep_x'), { ok: 1 });
  assert.equal(out.go_prep_only_server, '7');
});

// cardSchedule с подставленными глобалами app.js
const ctx = { ATTEMPT_LABELS: { self: 'сам', anchors: 'с опорой', none: 'не ответил' }, loadAttempts: () => ({}), state: { progress: {} }, CARDS: [] };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/review-queue.js', import.meta.url), 'utf8'), ctx);
const sched = list => ctx.cardSchedule('c1', { c1: list });

test('schedule: none → +1 day, anchors → +2, self streak → 4, 8, 16, 30, 30', () => {
  assert.equal(sched([{ d: '2026-11-05', r: 'none' }]).due, '2026-11-06');
  assert.equal(sched([{ d: '2026-11-05', r: 'anchors' }]).due, '2026-11-07');
  const selfs = n => Array.from({ length: n }, (_, i) => ({ d: `2026-11-0${i + 1}`, r: 'self' }));
  assert.deepEqual([1, 2, 3, 4, 5].map(n => { const s = sched(selfs(n)); return [s.streak, s.due]; }),
    [[1, '2026-11-05'], [2, '2026-11-10'], [3, '2026-11-19'], [4, '2026-12-04'], [5, '2026-12-05']]);
});

test('schedule: a miss resets the self streak; month end handled; unsorted history sorted', () => {
  const s = sched([{ d: '2026-10-01', r: 'self' }, { d: '2026-10-05', r: 'self' }, { d: '2026-10-29', r: 'none' }, { d: '2026-10-30', r: 'self' }]);
  assert.equal(s.streak, 1);
  assert.equal(s.due, '2026-11-03');
  assert.equal(sched([{ d: '2026-11-05', r: 'self' }, { d: '2026-11-01', r: 'none' }]).rating, 'self');
  assert.equal(ctx.cardSchedule('c1', {}), null);
});
