// node --test scripts/progress-merge.test.mjs — слияние прогресса устройств (js/progress-merge.js)
// и расписание повторения (js/review-queue.js, cardSchedule).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mergeProgressSnapshots, attemptDayResults, attemptStatus } = require('../js/progress-merge.js');
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

test('card status: the last day of the merged history decides, one-sided marks kept', () => {
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

// cardSchedule с подставленными глобалами app.js; итог дня — общий с progress-merge.js, как в index.html
const ctx = { ATTEMPT_LABELS: { self: 'сам', anchors: 'с опорой', none: 'не ответил' }, loadAttempts: () => ({}), state: { progress: {} }, CARDS: [], attemptDayResults };
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

test('schedule: one step per day — four «сам» on one day are one step, not a month', () => {
  const s = sched(Array.from({ length: 4 }, () => ({ d: '2026-11-09', r: 'self' })));
  assert.equal(s.streak, 1);
  assert.equal(s.due, '2026-11-13');
});

test('schedule: the worst rating of a day counts, whatever the order of attempts that day', () => {
  for (const day of [[{ d: '2026-11-09', r: 'none' }, { d: '2026-11-09', r: 'self' }], [{ d: '2026-11-09', r: 'self' }, { d: '2026-11-09', r: 'none' }]]) {
    const s = sched([{ d: '2026-11-05', r: 'self' }, ...day]);
    assert.deepEqual([s.rating, s.streak, s.due], ['none', 0, '2026-11-10']);
  }
  const anchors = sched([{ d: '2026-11-09', r: 'self' }, { d: '2026-11-09', r: 'anchors' }]);
  assert.deepEqual([anchors.rating, anchors.due], ['anchors', '2026-11-11']);
});

test('schedule after a merge does not depend on which side is local', () => {
  const a = { go_prep_attempts_v1: J({ c1: [{ d: '2026-11-09', r: 'none' }] }) };
  const b = { go_prep_attempts_v1: J({ c1: [{ d: '2026-11-09', r: 'self' }] }) };
  const ab = sched(P(mergeProgressSnapshots(a, b), 'go_prep_attempts_v1').c1);
  const ba = sched(P(mergeProgressSnapshots(b, a), 'go_prep_attempts_v1').c1);
  assert.deepEqual([ab.rating, ab.due], ['none', '2026-11-10']);
  assert.deepEqual([ba.rating, ba.due], [ab.rating, ab.due]);
});


// Статус после слияния — тот же итог дня, что у расписания: «сам» за последний день → mastered, иначе review.
const statusOf = list => (sched(list).rating === 'self' ? 'mastered' : 'review');
const snap = (progress, attempts) => ({ go_prep_progress_v2: J(progress), go_prep_attempts_v1: J(attempts) });
const merged = (a, b) => { const out = mergeProgressSnapshots(a, b); return { progress: P(out, 'go_prep_progress_v2'), attempts: P(out, 'go_prep_attempts_v1'), out }; };
const multiset = list => list.map(x => J(x)).sort();

test('merge status: one day «не ответил» here and «сам» there — review in both directions, as the schedule says', () => {
  const here = snap({ c33: 'review' }, { c33: [{ d: '2026-11-09', r: 'none' }] });
  const there = snap({ c33: 'mastered' }, { c33: [{ d: '2026-11-09', r: 'self' }] });
  for (const [a, b] of [[here, there], [there, here]]) {
    const m = merged(a, b);
    assert.equal(m.progress.c33, 'review');
    assert.equal(m.progress.c33, statusOf(m.attempts.c33));
    assert.equal(sched(m.attempts.c33).due, '2026-11-10');
  }
});

test('merge status: the newer side loses when its own last day has a miss', () => {
  // На телефоне 10.11 «не ответил», потом «сам» — статус там «ответил сам», но итог дня — промах.
  const phone = snap({ c1: 'mastered' }, { c1: [{ d: '2026-11-10', r: 'none' }, { d: '2026-11-10', r: 'self' }] });
  const laptop = snap({ c1: 'review' }, { c1: [{ d: '2026-11-09', r: 'anchors' }] });
  assert.equal(merged(phone, laptop).progress.c1, 'review');
  assert.equal(merged(laptop, phone).progress.c1, 'review');
  // «Сам» за последний день — «ответил сам», с какой стороны ни сливай.
  const later = snap({ c1: 'mastered' }, { c1: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(merged(later, laptop).progress.c1, 'mastered');
  assert.equal(merged(laptop, later).progress.c1, 'mastered');
});

test('merge status without history: previous rule — differing marks become review, one-sided stay', () => {
  const m = merged(snap({ c1: 'mastered', c2: 'mastered' }, {}), snap({ c1: 'review', c3: 'review' }, {}));
  assert.deepEqual(m.progress, { c1: 'review', c2: 'mastered', c3: 'review' });
});

test('merge in both directions and repeated merges give the same progress, history and schedule', () => {
  let seed = 7;
  const rand = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const ratings = ['none', 'anchors', 'self'];
  const side = () => {
    const progress = {}, attempts = {};
    for (const id of ['c1', 'c2', 'c3', 'c4']) {
      const list = Array.from({ length: rand(4) }, () => ({ d: `2026-11-0${1 + rand(3)}`, r: ratings[rand(3)] }));
      if (list.length) attempts[id] = list;
      if (list.length || rand(2)) progress[id] = list.length ? (list[list.length - 1].r === 'self' ? 'mastered' : 'review') : ['mastered', 'review'][rand(2)];
    }
    return snap(progress, attempts);
  };
  for (let round = 0; round < 200; round++) {
    const a = side(), b = side();
    const ab = merged(a, b), ba = merged(b, a);
    assert.deepEqual(ba.progress, ab.progress);
    for (const id of new Set([...Object.keys(ab.attempts), ...Object.keys(ba.attempts)])) {
      assert.deepEqual(multiset(ba.attempts[id]), multiset(ab.attempts[id]));
      assert.deepEqual(attemptDayResults(ba.attempts[id]), attemptDayResults(ab.attempts[id]));
    }
    // Расходились — статус равен итогу дня объединённой истории (если она есть).
    const pa = JSON.parse(a.go_prep_progress_v2), pb = JSON.parse(b.go_prep_progress_v2);
    for (const id of Object.keys(ab.progress)) {
      if (id in pa && id in pb && pa[id] !== pb[id] && ab.attempts[id]) assert.equal(ab.progress[id], statusOf(ab.attempts[id]), `${id} round ${round}`);
    }
    // Повторное слияние результата с любой стороной ничего не меняет.
    for (const again of [merged(ab.out, a), merged(ab.out, b), merged(a, ab.out), merged(ab.out, ab.out)]) {
      assert.deepEqual(again.progress, ab.progress);
      for (const id of Object.keys(ab.attempts)) assert.deepEqual(multiset(again.attempts[id]), multiset(ab.attempts[id]));
    }
  }
});

test('day results: worst rating of each day, sorted by day, broken records skipped', () => {
  assert.deepEqual(attemptDayResults([
    { d: '2026-11-09', r: 'self' }, { d: '2026-11-08', r: 'anchors' }, { d: '2026-11-09', r: 'none' },
    { d: '2026-11-10', r: 'toString' }, { d: 'bad', r: 'self' }, null, { r: 'self' }
  ]), [{ day: '2026-11-08', rating: 'anchors' }, { day: '2026-11-09', rating: 'none' }]);
  assert.deepEqual(attemptDayResults(undefined), []);
});

// Обрезка истории до 20 после слияния: порядок внутри дня не зависит от стороны, худшая оценка дня — последней.
test('merge limit: one «не ответил» and twenty «сам» on one day — same status, history and date in both directions', () => {
  const none = snap({ c33: 'review' }, { c33: [{ d: '2026-11-09', r: 'none' }] });
  const selfs = snap({ c33: 'mastered' }, { c33: Array.from({ length: 20 }, () => ({ d: '2026-11-09', r: 'self' })) });
  const ab = merged(none, selfs), ba = merged(selfs, none);
  for (const m of [ab, ba]) {
    assert.equal(m.attempts.c33.length, 20);
    assert.equal(m.progress.c33, 'review');
    assert.deepEqual([sched(m.attempts.c33).rating, sched(m.attempts.c33).due], ['none', '2026-11-10']);
  }
  assert.deepEqual(ba.attempts.c33, ab.attempts.c33);
  assert.deepEqual(ab.attempts.c33.at(-1), { d: '2026-11-09', r: 'none' });
  for (const again of [merged(ab.out, none), merged(selfs, ab.out), merged(ba.out, ab.out)]) {
    assert.deepEqual(again.attempts.c33, ab.attempts.c33);
    assert.equal(again.progress.c33, 'review');
  }
});

test('merge limit: long histories (21+ attempts in the union) — the same list in both directions, repeated merges converge', () => {
  let seed = 11;
  const rand = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const ratings = ['none', 'anchors', 'self'];
  const side = () => {
    const progress = {}, attempts = {};
    for (const id of ['c1', 'c2']) {
      // Последние 20, как у recordAttempt; несколько дней с повторами, чтобы граница обрезки попадала внутрь дня.
      const list = Array.from({ length: 10 + rand(11) }, () => ({ d: `2026-11-0${1 + rand(4)}`, r: ratings[rand(3)] }))
        .sort((x, y) => (x.d < y.d ? -1 : x.d > y.d ? 1 : 0));
      attempts[id] = list;
      progress[id] = list[list.length - 1].r === 'self' ? 'mastered' : 'review';
    }
    return snap(progress, attempts);
  };
  let cut = 0;
  for (let round = 0; round < 200; round++) {
    const a = side(), b = side();
    const ab = merged(a, b), ba = merged(b, a);
    assert.deepEqual(ba.progress, ab.progress, `round ${round}`);
    for (const id of ['c1', 'c2']) {
      if (JSON.parse(a.go_prep_attempts_v1)[id].length + JSON.parse(b.go_prep_attempts_v1)[id].length > 20) cut++;
      assert.deepEqual(ba.attempts[id], ab.attempts[id], `${id} round ${round}`);
      assert.deepEqual(sched(ba.attempts[id]), sched(ab.attempts[id]));
      if (ab.progress[id] !== undefined && JSON.parse(a.go_prep_progress_v2)[id] !== JSON.parse(b.go_prep_progress_v2)[id]) {
        assert.equal(ab.progress[id], statusOf(ab.attempts[id]), `${id} round ${round}`);
      }
    }
    for (const again of [merged(ab.out, a), merged(b, ab.out), merged(ab.out, ba.out)]) {
      assert.deepEqual(again.progress, ab.progress);
      for (const id of ['c1', 'c2']) assert.deepEqual(again.attempts[id], ab.attempts[id], `${id} round ${round} again`);
    }
  }
  assert.ok(cut > 100, `the cap was hit ${cut} times`);
});

test('status from history: the last day decides — «сам» is mastered, a worse answer that day is review, no history is null', () => {
  assert.equal(attemptStatus([{ d: '2026-11-11', r: 'none' }, { d: '2026-11-11', r: 'self' }]), 'review');
  assert.equal(attemptStatus([{ d: '2026-11-11', r: 'self' }, { d: '2026-11-11', r: 'anchors' }]), 'review');
  assert.equal(attemptStatus([{ d: '2026-11-10', r: 'none' }, { d: '2026-11-11', r: 'self' }]), 'mastered');
  assert.equal(attemptStatus([{ d: '2026-11-11', r: 'self' }, { d: '2026-11-10', r: 'none' }]), 'mastered');
  assert.equal(attemptStatus([]), null);
  assert.equal(attemptStatus(undefined), null);
  assert.equal(attemptStatus([{ d: 'bad', r: 'self' }]), null);
  // Слияние берёт тот же итог: одно устройство с промахом и «сам» в один день даёт «на повторении».
  const local = { go_prep_progress_v2: J({ c1: 'mastered' }), go_prep_attempts_v1: J({ c1: [{ d: '2026-11-11', r: 'none' }, { d: '2026-11-11', r: 'self' }] }) };
  const server = { go_prep_progress_v2: J({ c1: 'review' }), go_prep_attempts_v1: J({ c1: [] }) };
  assert.equal(P(mergeProgressSnapshots(local, server), 'go_prep_progress_v2').c1, 'review');
});
