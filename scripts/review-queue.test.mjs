// node --test scripts/review-queue.test.mjs — сохранённое занятие (js/review-queue.js) при сбросе карточек:
// хранилище не дало удалить — старое занятие не показывается, удаление повторяется, новое занятие его заменяет.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SESSION = 'go_prep_session_v1';
const source = fs.readFileSync(new URL('../js/review-queue.js', import.meta.url), 'utf8');

function setup(session) {
  const data = new Map(session ? [[SESSION, JSON.stringify(session)]] : []);
  const env = { blocked: false };
  const refuse = () => { if (env.blocked) throw new Error('SecurityError'); };
  const ctx = {
    localStorage: {
      getItem: k => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => { refuse(); data.set(k, String(v)); },
      removeItem: k => { refuse(); data.delete(k); }
    },
    CARDS: [{ id: 'c33' }, { id: 'c34' }, { id: 'c35' }]
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return { ctx, data, env };
}

const old = { ids: ['c33', 'c34'], done: [], created: '2026-11-11' };

test('reset could not remove the saved session: it is hidden until removal succeeds', () => {
  const t = setup(old);
  t.env.blocked = true;
  assert.equal(t.ctx.reviewForgetSession(), false);
  assert.equal(t.ctx.reviewLoadSession(), null, 'the old session is not offered while removal waits');
  assert.equal(t.data.has(SESSION), true);
  assert.equal(t.ctx.reviewForgetSession(), false, 'still blocked');
  t.env.blocked = false;
  assert.equal(t.ctx.reviewForgetSession(), true);
  assert.equal(t.data.has(SESSION), false);
  assert.equal(t.ctx.reviewLoadSession(), null);
});

test('a new session written over the stale one ends the wait: it is shown, no removal is pending', () => {
  const t = setup(old);
  t.env.blocked = true;
  t.ctx.reviewForgetSession();
  t.env.blocked = false;
  const fresh = { ids: ['c35'], done: [], created: '2026-11-12' };
  t.ctx.reviewSaveSession(fresh);
  assert.deepEqual(JSON.parse(JSON.stringify(t.ctx.reviewLoadSession())), fresh);
  assert.equal(vm.runInContext('reviewStaleSession', t.ctx), false);
});

// Статус на карточке и в подборке «На повторение» — итог последнего учебного дня истории, как у расписания и слияния.
const merge = fs.readFileSync(new URL('../js/progress-merge.js', import.meta.url), 'utf8');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const short = s => `${s.slice(8, 10)}.${s.slice(5, 7)}`;

function setupStatus(progress, attempts) {
  const ctx = {
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    CARDS: [{ id: 'c33' }, { id: 'c34' }, { id: 'c35' }],
    ATTEMPT_LABELS: { self: 'сам', anchors: 'с опорой', none: 'не ответил' },
    state: { progress },
    loadAttempts: () => JSON.parse(JSON.stringify(attempts))
  };
  vm.createContext(ctx);
  vm.runInContext(merge, ctx);
  vm.runInContext(source, ctx);
  return ctx;
}

test('«не ответил», then «сам» on the same day: the card is under review, as its schedule says', () => {
  const now = new Date();
  const today = iso(now);
  const tomorrow = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  // gradeCard before v93 stored «mastered» after the second answer.
  const ctx = setupStatus({ c33: 'mastered' }, { c33: [{ d: today, r: 'none' }, { d: today, r: 'self' }] });
  assert.equal(ctx.reviewStatusText({ id: 'c33' }), `На повторении · ${short(today)}: не ответил · следующая проверка ${short(tomorrow)}`);
  assert.equal(ctx.cardStatus('c33'), 'review');
  assert.equal(ctx.reviewCounts().self, 0);
});

test('status follows the last day, not the stored mark; a mark without history keeps the old rule', () => {
  const ctx = setupStatus({ c33: 'review', c35: 'mastered' }, { c33: [{ d: '2026-11-09', r: 'none' }, { d: '2026-11-10', r: 'self' }] });
  assert.equal(ctx.reviewStatusText({ id: 'c33' }), 'Ответил сам ✓ · 10.11: сам · следующая проверка 14.11');
  assert.equal(ctx.cardStatus('c33'), 'mastered');
  assert.equal(ctx.cardStatus('c34'), 'unseen');
  assert.equal(ctx.cardStatus('c35'), 'mastered');
  assert.equal(ctx.reviewStatusText({ id: 'c34' }), 'Новая');
  assert.match(ctx.reviewStatusText({ id: 'c35' }), /^Ответил сам ✓ · пора повторить$/);
});
