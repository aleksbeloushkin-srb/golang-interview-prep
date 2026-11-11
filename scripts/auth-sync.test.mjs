// node --test scripts/auth-sync.test.mjs — сверка прогресса с сервером (js/auth.js) против того, что видит пользователь:
// несохранённые правки (js/pending-store.js) уходят на сервер, правка во время GET или PUT не теряется,
// страница не перезагружается, пока перезагрузка снесла бы новое. Сеть и хранилище — подделки в памяти.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const PROGRESS = 'go_prep_progress_v2';
const ATTEMPTS = 'go_prep_attempts_v1';
const PLAN = 'go_prep_plan_v1';
const J = JSON.stringify;
const sources = ['js/pending-store.js', 'js/progress-merge.js', 'js/auth.js']
  .map(f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));

// initial — содержимое localStorage; env.full — браузер не даёт записывать и удалять.
function setup(initial = {}) {
  const data = new Map(Object.entries(initial));
  const env = { full: false, reloads: 0, events: [], timers: [], requests: [] };
  const refuse = () => { if (env.full) throw new Error('QuotaExceededError'); };
  const storage = {
    get length() { return data.size; },
    key: i => [...data.keys()][i] ?? null,
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { refuse(); data.set(k, String(v)); },
    removeItem: k => { refuse(); data.delete(k); }
  };
  const session = new Map();
  const ctx = {
    localStorage: storage,
    sessionStorage: { getItem: k => session.get(k) ?? null, setItem: (k, v) => session.set(k, v), removeItem: k => session.delete(k) },
    window: {
      location: { reload: () => { env.reloads++; }, origin: 'http://localhost', pathname: '/', search: '', hash: '' },
      dispatchEvent: e => env.events.push(e)
    },
    document: { addEventListener() {}, getElementById: () => null, querySelector: () => null, documentElement: { dataset: {} }, dispatchEvent() {} },
    StorageEvent: class { constructor(type, init) { Object.assign(this, init, { type }); } },
    setTimeout: (fn, ms) => env.timers.push({ fn, ms }),
    clearTimeout() {}
  };
  vm.createContext(ctx);
  sources.forEach(s => vm.runInContext(s, ctx));
  const auth = vm.runInContext('authState', ctx);
  auth.accessToken = 'test';
  // Хранилища страницы, как в app.js и plan-view.js: правка — поверх свежего снимка, не записалась — ждёт в памяти.
  const read = key => () => JSON.parse(data.get(key) || '{}');
  const stores = Object.fromEntries([PROGRESS, ATTEMPTS, PLAN].map(k => [k, ctx.pendingStore(k, read(k), () => {})]));
  const mark = (id, status) => stores[PROGRESS].change(p => { p[id] = status; });
  const attempt = (id, r) => stores[ATTEMPTS].change(a => { a[id] = [...(a[id] || []), { d: '2026-11-11', r }]; });
  // Ответы сервера по очереди; функция — ответ, который тест отдаст сам (запрос «висит»).
  const replies = [];
  ctx.apiFetch = async (path, options = {}) => {
    env.requests.push({ method: options.method || 'GET', body: options.body && JSON.parse(options.body) });
    const next = replies.shift();
    const body = typeof next === 'function' ? await new Promise(next) : next;
    return { ok: true, status: 200, json: async () => body };
  };
  const stored = key => JSON.parse(data.get(key) || 'null');
  return { ctx, env, data, auth, stores, mark, attempt, replies, stored };
}

const server = (progress, version) => ({ version, progress: Object.fromEntries(Object.entries(progress).map(([k, v]) => [k, J(v)])) });

test('the snapshot for the server includes edits the browser refused to write', () => {
  const t = setup({ [PROGRESS]: J({ c33: 'review' }) });
  t.env.full = true;
  t.mark('c34', 'mastered');
  t.attempt('c34', 'self');
  assert.deepEqual(JSON.parse(t.ctx.syncSnapshot()[PROGRESS]), { c33: 'review', c34: 'mastered' });
  assert.deepEqual(JSON.parse(t.ctx.syncSnapshot()[ATTEMPTS]), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.deepEqual(t.stored(PROGRESS), { c33: 'review' });
});

test('merge right after storage recovers: unsaved edits reach the server and this browser, no reload, no doubled attempt', async () => {
  const t = setup({ [PROGRESS]: J({ c33: 'review' }) });
  t.env.full = true;
  t.mark('c34', 'mastered');
  t.attempt('c34', 'self');
  t.env.full = false; // записывать снова можно, повтор через 5 с ещё не наступил
  t.replies.push({ version: 8 });
  await t.ctx.syncMerge(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  const sent = t.env.requests[0].body;
  assert.equal(sent.version, 7);
  assert.deepEqual(JSON.parse(sent.progress[PROGRESS]), { c39: 'mastered', c33: 'review', c34: 'mastered' });
  assert.deepEqual(JSON.parse(sent.progress[ATTEMPTS]), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(t.env.reloads, 0);
  assert.deepEqual(t.stored(PROGRESS), { c39: 'mastered', c33: 'review', c34: 'mastered' });
  assert.deepEqual(t.stored(ATTEMPTS), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(t.stores[PROGRESS].pending || t.stores[ATTEMPTS].pending, false);
  assert.deepEqual(t.stores[ATTEMPTS].read(), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(t.env.events.at(-1).type, 'storage');
  assert.equal(t.auth.sync.phase, 'ready');
  // Отправлено то же, что записано: следующему тику отправлять нечего.
  await t.ctx.syncTick();
  assert.equal(t.env.requests.length, 1);
});

test('merge while the browser still refuses to write: the server gets everything, nothing is lost here, no reload', async () => {
  const t = setup({ [PROGRESS]: J({ c33: 'review' }), [PLAN]: J({ done: { 'w1-mon-1': true } }) });
  t.env.full = true;
  t.mark('c34', 'mastered');
  t.stores[PLAN].change(p => { p.done['w1-mon-2'] = true; });
  t.replies.push({ version: 8 });
  await t.ctx.syncMerge(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  const sent = t.env.requests[0].body.progress;
  assert.deepEqual(JSON.parse(sent[PROGRESS]), { c39: 'mastered', c33: 'review', c34: 'mastered' });
  assert.deepEqual(JSON.parse(sent[PLAN]).done, { 'w1-mon-1': true, 'w1-mon-2': true });
  assert.equal(t.env.reloads, 0);
  assert.equal(t.stores[PROGRESS].pending && t.stores[PLAN].pending, true);
  assert.deepEqual(t.stores[PROGRESS].read(), { c33: 'review', c34: 'mastered' });
  assert.equal(t.auth.sync.phase, 'start');
  assert.match(t.auth.sync.status, /Не удалось записать прогресс в этот браузер/);
  assert.ok(t.auth.sync.retryTimer, 'a sync retry is scheduled');
});

test('a new device: a mark made while GET is in flight is merged with the server copy, not replaced by it', async () => {
  const t = setup({});
  let answer;
  t.replies.push(resolve => { answer = resolve; }, { version: 8 });
  const started = t.ctx.syncStart();
  await new Promise(r => setImmediate(r));
  t.mark('c34', 'mastered');
  t.attempt('c34', 'self');
  answer(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  await started;
  assert.deepEqual(t.env.requests.map(r => r.method), ['GET', 'PUT']);
  const sent = t.env.requests[1].body;
  assert.equal(sent.version, 7);
  assert.deepEqual(JSON.parse(sent.progress[PROGRESS]), { c39: 'mastered', c34: 'mastered' });
  assert.equal(t.env.reloads, 0);
  assert.deepEqual(t.stored(PROGRESS), { c39: 'mastered', c34: 'mastered' });
  assert.deepEqual(t.stored(ATTEMPTS), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(t.auth.sync.phase, 'ready');
});

test('a device with its own marks: the decision uses what is visible after GET — equal to the server, nothing to ask', async () => {
  const t = setup({ [PROGRESS]: J({ c33: 'review' }) });
  let answer;
  t.replies.push(resolve => { answer = resolve; });
  const started = t.ctx.syncStart();
  await new Promise(r => setImmediate(r));
  t.mark('c39', 'mastered'); // во время GET стало как на сервере
  answer(server({ [PROGRESS]: { c33: 'review', c39: 'mastered' } }, 7));
  await started;
  assert.equal(t.auth.sync.phase, 'ready');
  assert.equal(t.env.requests.length, 1);
  assert.equal(t.env.reloads, 0);
});

test('a mark made during the merge PUT stays here and goes to the server with the next tick', async () => {
  const t = setup({ [PROGRESS]: J({ c33: 'review' }) });
  let answer;
  t.replies.push(resolve => { answer = resolve; }, { version: 9 });
  const merging = t.ctx.syncMerge(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  await new Promise(r => setImmediate(r));
  t.mark('c34', 'mastered');
  t.attempt('c34', 'self');
  answer({ version: 8 });
  await merging;
  assert.equal(t.env.reloads, 0);
  assert.deepEqual(JSON.parse(t.env.requests[0].body.progress[PROGRESS]), { c39: 'mastered', c33: 'review' });
  assert.deepEqual(t.stored(PROGRESS), { c39: 'mastered', c33: 'review', c34: 'mastered' });
  assert.deepEqual(t.stored(ATTEMPTS), { c34: [{ d: '2026-11-11', r: 'self' }] });
  assert.equal(t.auth.sync.phase, 'ready');
  await t.ctx.syncTick();
  const next = t.env.requests[1].body;
  assert.equal(next.version, 8);
  assert.deepEqual(JSON.parse(next.progress[PROGRESS]), { c39: 'mastered', c33: 'review', c34: 'mastered' });
  assert.deepEqual(JSON.parse(next.progress[ATTEMPTS]), { c34: [{ d: '2026-11-11', r: 'self' }] });
});

test('a new device with nothing local takes the server copy and reloads', async () => {
  const t = setup({});
  t.replies.push(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  await t.ctx.syncStart();
  assert.equal(t.env.reloads, 1);
  assert.equal(t.env.requests.length, 1);
  assert.deepEqual(t.stored(PROGRESS), { c39: 'mastered' });
});

test('«Взять с сервера» replaces unsaved edits too, but reloads only after the server copy is written', () => {
  const u = setup({ [PROGRESS]: J({ c33: 'review' }), [PLAN]: J({ done: {} }) });
  u.env.full = true;
  u.mark('c34', 'mastered');
  u.ctx.syncTakeServer(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  assert.equal(u.env.reloads, 0, 'not written — no reload');
  assert.equal(u.stores[PROGRESS].pending, true, 'unsaved edits stay');
  u.env.full = false;
  u.ctx.syncTakeServer(server({ [PROGRESS]: { c39: 'mastered' } }, 7));
  assert.equal(u.env.reloads, 1);
  assert.deepEqual(u.stored(PROGRESS), { c39: 'mastered' });
  assert.equal(u.stored(PLAN), null);
  assert.equal(u.stores[PROGRESS].pending, false);
});
