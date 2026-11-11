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
