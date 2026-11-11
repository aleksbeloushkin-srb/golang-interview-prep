// node --test scripts/pending-store.test.mjs — несохранённые правки поверх свежего снимка (js/pending-store.js):
// так их держат отметки карточек, попытки (app.js) и отметки плана (plan-view.js), когда браузер не даёт записать.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/pending-store.js', import.meta.url), 'utf8');
const KEY = 'go_prep_plan_v1';

// Хранилище, которое можно «переполнить», и таймеры, которые запускает сам тест.
function setup(initial) {
  const data = new Map(initial ? [[KEY, JSON.stringify(initial)]] : []);
  const timers = new Map();
  let nextId = 1;
  const env = { full: false, retries: 0 };
  const ctx = {
    localStorage: {
      getItem: key => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => {
        if (env.full) throw new Error('QuotaExceededError');
        data.set(key, String(value));
      },
      removeItem: key => data.delete(key)
    },
    setTimeout: (fn, ms) => { timers.set(nextId, { fn, ms }); return nextId++; },
    clearTimeout: id => timers.delete(id)
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  const read = () => JSON.parse(data.get(KEY) || '{"done":{}}');
  const store = ctx.pendingStore(KEY, read, () => { env.retries++; store.write(store.read()); });
  const fire = () => { const all = [...timers.entries()]; timers.clear(); all.forEach(([, t]) => t.fn()); };
  return { store, data, timers, env, fire, ctx, stored: () => JSON.parse(data.get(KEY) || 'null') };
}

const tick = (id, on) => saved => { if (on) saved.done[id] = true; else delete saved.done[id]; };

test('a failed write keeps every edit: the next tick does not wipe the previous one, unticking counts too', () => {
  const t = setup({ done: { m2: true } });
  t.env.full = true;
  t.store.change(tick('m1', true));
  t.store.change(tick('m3', true));
  const now = t.store.change(tick('m2', false));
  assert.deepEqual(Object.keys(now.done).sort(), ['m1', 'm3']);
  assert.deepEqual(Object.keys(t.store.read().done).sort(), ['m1', 'm3']);
  assert.deepEqual(t.stored(), { done: { m2: true } });
  assert.equal(t.store.pending, true);
  assert.equal(t.timers.size, 1, 'one retry timer, not one per edit');
  assert.equal([...t.timers.values()][0].ms, 5000);
});

test('another tab writes while edits wait: both survive', () => {
  const t = setup({ done: {} });
  t.env.full = true;
  t.store.change(tick('m1', true));
  t.data.set(KEY, JSON.stringify({ done: { other: true } })); // другая вкладка записала до переполнения
  assert.deepEqual(Object.keys(t.store.read().done).sort(), ['m1', 'other']);
});

test('writing works again: the retry stores everything, edits are dropped, no new timer', () => {
  const t = setup({ done: { m2: true } });
  t.env.full = true;
  t.store.change(tick('m1', true));
  t.fire();
  assert.equal(t.env.retries, 1);
  assert.equal(t.timers.size, 1, 'still full — retry scheduled again');
  t.env.full = false;
  t.fire();
  assert.deepEqual(t.stored(), { done: { m1: true, m2: true } });
  assert.equal(t.store.pending, false);
  assert.equal(t.timers.size, 0);
  // Записанное больше не накладывается второй раз: снятие в другой вкладке остаётся снятием.
  t.data.set(KEY, JSON.stringify({ done: { m2: true } }));
  assert.deepEqual(t.store.read(), { done: { m2: true } });
});

test('a successful write needs no retry and keeps nothing in memory', () => {
  const t = setup(null);
  t.store.change(tick('m1', true));
  assert.deepEqual(t.stored(), { done: { m1: true } });
  assert.equal(t.store.pending, false);
  assert.equal(t.timers.size, 0);
});

test('reset as an edit: with a full storage the cleared state holds and is written on recovery', () => {
  const t = setup({ done: { m1: true, m2: true } });
  t.env.full = true;
  const clear = saved => Object.keys(saved.done).forEach(id => delete saved.done[id]);
  t.store.change(clear);
  t.store.change(tick('m5', true));
  assert.deepEqual(t.store.read(), { done: { m5: true } });
  t.env.full = false;
  t.fire();
  assert.deepEqual(t.stored(), { done: { m5: true } });
});

test('forget drops unsaved edits and the pending retry', () => {
  const t = setup({ done: { m2: true } });
  t.env.full = true;
  t.store.change(tick('m1', true));
  t.store.forget();
  assert.equal(t.store.pending, false);
  assert.equal(t.timers.size, 0);
  assert.deepEqual(t.store.read(), { done: { m2: true } });
});

// Синхронизация (auth.js) берёт несохранённое всех хранилищ и снимает правки, когда записала итог сама.
test('unsaved edits of every store are visible as one snapshot; forgetting a key drops only its edits', () => {
  const t = setup({ done: { m2: true } });
  assert.deepEqual(JSON.parse(JSON.stringify(t.ctx.pendingSnapshot())), {});
  t.env.full = true;
  t.store.change(tick('m1', true));
  const snapshot = t.ctx.pendingSnapshot();
  assert.deepEqual(Object.keys(snapshot), [KEY]);
  assert.deepEqual(JSON.parse(snapshot[KEY]), { done: { m2: true, m1: true } });
  t.ctx.pendingForget('go_prep_other_v1'); // ключ без хранилища — ничего не делает
  assert.equal(t.store.pending, true);
  t.ctx.pendingForget(KEY);
  assert.equal(t.store.pending, false);
  assert.equal(t.timers.size, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(t.ctx.pendingSnapshot())), {});
});
