import { writeFileSync } from 'node:fs';

const options = { url: 'http://127.0.0.1:8000/', cdp: 'http://127.0.0.1:9228', output: null };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  if (!Object.hasOwn(options, key) || !args[i + 1]) throw Error('Usage: node scripts/browser-smoke.mjs [--url URL] [--cdp URL] [--output FILE]');
  options[key] = args[i + 1];
}
const started = performance.now(), checks = [], errors = [], consoleErrors = [];
const version = await fetch(new URL('/json/version', options.cdp), { signal: AbortSignal.timeout(5000) }).then(r => {
  if (!r.ok) throw Error(`CDP HTTP ${r.status}`);
  return r.json();
});
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => { ws.close(); reject(Error('CDP connection timeout')); }, 5000);
  ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
  ws.addEventListener('error', () => { clearTimeout(timer); reject(Error('CDP connection failed')); }, { once: true });
});
let sequence = 0, sessionId, contextId;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id); clearTimeout(request.timer);
    if (message.error) request.reject(Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  } else if (sessionId && message.sessionId === sessionId) {
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params);
  }
});
function call(method, params = {}, browser = false) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 10000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params, ...(!browser && sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function ready(expression) {
  const deadline = performance.now() + 10000;
  while (performance.now() < deadline) {
    if (await evaluate(expression) === true) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw Error(`Readiness timeout: ${expression}`);
}
async function check(name, expression) {
  if (await evaluate(expression) !== true) throw Error(name);
  checks.push(name);
}
async function route(name) {
  await evaluate(`location.hash=${JSON.stringify('#/' + name)}`);
  await ready(`!document.getElementById(${JSON.stringify('view-' + name.split('/')[0])}).classList.contains('hidden')`);
}

try {
  // Disposable browser context keeps the user's progress untouched, including on live Pages.
  contextId = (await call('Target.createBrowserContext', {}, true)).browserContextId;
  const { targetId } = await call('Target.createTarget', { url: 'about:blank', browserContextId: contextId }, true);
  sessionId = (await call('Target.attachToTarget', { targetId, flatten: true }, true)).sessionId;
  await call('Page.enable'); await call('Runtime.enable');
  await call('Page.navigate', { url: options.url });
  await ready("document.readyState==='complete' && typeof CARDS!=='undefined' && !!document.getElementById('card-q-en')");
  for (const name of ['cards', 'simulators', 'wiki', 'cheatsheet', 'quiz']) {
    await route(name);
    await check('route ' + name, `!document.getElementById('view-${name}').classList.contains('hidden')`);
  }
  const cardId = await evaluate('CARDS[0].id');
  await route('cards/' + cardId);
  await ready(`getFilteredCards()[state.index].id===${JSON.stringify(cardId)}`);
  await evaluate("document.getElementById('reveal-btn').focus()");
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await check('keyboard reveals answer', 'state.revealed===true');
  await check('visible focus', "getComputedStyle(document.activeElement).outlineStyle!=='none'");
  await evaluate("markCard('review')");
  const oldOrigin = await evaluate('performance.timeOrigin');
  await call('Page.reload');
  await ready(`performance.timeOrigin!==${oldOrigin} && document.readyState==='complete' && typeof state!=='undefined'`);
  await check('progress survives reload', `state.progress[${JSON.stringify(cardId)}]==='review'`);
  await route('quiz');
  await evaluate('document.querySelectorAll(`input[name=${QUIZ_QUESTIONS[0].id}]`)[QUIZ_QUESTIONS[0].correct].click()');
  await check('quiz answer', "document.getElementById(QUIZ_QUESTIONS[0].id+'-title-res').textContent.includes('Верно')");
  await route('simulators');
  await evaluate('renderSimStep(0,1)');
  await check('diagram step', "document.getElementById(SIMULATORS[0].id+'-desc').textContent===SIMULATORS[0].steps[1].desc");
  await route('cheatsheet');
  await check('cheatsheet rows', "document.querySelectorAll('#cheatsheet-tbody tr').length===CHEATSHEET_ROWS.length && [...CHEATSHEET_ROWS].every(Boolean)");
  for (const width of [320, 390, 430, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const name of ['cards', 'simulators', 'wiki', 'cheatsheet', 'quiz']) {
      await route(name);
      await check(`overflow ${name} ${width}`, 'document.documentElement.scrollWidth<=innerWidth');
    }
  }
  const assets = await evaluate("[location.href.split('#')[0],...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(x=>typeof x==='string'?x:x.src||x.href)");
  for (const url of assets) await check('HTTP 200 ' + url, `fetch(${JSON.stringify(url)},{cache:'no-store',signal:AbortSignal.timeout(5000)}).then(r=>r.status===200)`);
  if (errors.length || consoleErrors.length) throw Error('Browser exceptions or console errors');
} catch (error) {
  errors.push({ message: error.message }); process.exitCode = 1;
} finally {
  try { if (contextId) await call('Target.disposeBrowserContext', { browserContextId: contextId }, true); }
  catch (error) { errors.push({ cleanup: error.message }); process.exitCode = 1; }
  ws.close();
}
const report = { ok: !errors.length && !consoleErrors.length, url: options.url, checks, errors, consoleErrors, durationMs: Math.round(performance.now() - started), scope: 'Shared smoke only. No Go correctness, targeted translation/content checks, visual review or broad regression.' };
if (options.output) writeFileSync(options.output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
