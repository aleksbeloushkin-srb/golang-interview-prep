import { writeFileSync } from 'node:fs';

const options = { url: 'http://127.0.0.1:8000/', cdp: 'http://127.0.0.1:9228', output: null };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  if (!Object.hasOwn(options, key) || !args[i + 1]) throw Error('Usage: node docs/verification/fixtures/sync-resources-browser.mjs [--url URL] [--cdp URL] [--output FILE]');
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
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  async function pressEnter(){await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});}
  const ids=['c15','c21','c22'];
  for(const id of ids){
    await route('cards/'+id);await ready(`getFilteredCards()[state.index].id==='${id}'`);
    await check(id+' hidden before attempt',"!document.getElementById('card-answer-box').classList.contains('visible')");
    await evaluate("document.getElementById('reveal-btn').focus()");await pressEnter();
    await check(id+' keyboard reveal',"state.revealed && getComputedStyle(document.activeElement).outlineStyle!=='none'");
    await check(id+' bilingual text and code',`document.getElementById('card-short-en').textContent===CARDS.find(c=>c.id==='${id}').shortEN && document.getElementById('card-translation').textContent.includes(CARDS.find(c=>c.id==='${id}').shortRU) && document.getElementById('card-code').textContent===CARDS.find(c=>c.id==='${id}').code`);
    await check(id+' sources',`document.querySelectorAll('#card-references a').length===CARDS.find(c=>c.id==='${id}').sources.length`);
    await evaluate("document.querySelector('#card-practice > details > summary').focus()");await pressEnter();
    await check(id+' prompt before solution',"document.querySelector('#card-practice > details').open && !document.querySelector('#card-practice .practice-solution').open");
    await evaluate("document.querySelector('#card-practice .practice-solution > summary').focus()");await pressEnter();
    await check(id+' solution opens',"document.querySelector('#card-practice .practice-solution').open");
  }
  for(const id of ['q7','q8','q10','q12','q13','q16','q19']){
    await route('quiz/'+id);await check(id+' initially hidden',`document.getElementById('${id}-result').classList.contains('hidden')`);
    for(let i=0;i<6;i++){
      await evaluate(`document.querySelectorAll('input[name=${id}]')[${i}].click()`);
      await check(id+' option '+i,`document.getElementById('${id}-title-res').textContent.includes(QUIZ_QUESTIONS.find(q=>q.id==='${id}').correct===${i}?'Верно':'правильный')`);
    }
    await check(id+' EN RU explanations',`document.getElementById('${id}-exp-en').textContent===QUIZ_QUESTIONS.find(q=>q.id==='${id}').speechEN && document.getElementById('${id}-exp-ru').textContent===QUIZ_QUESTIONS.find(q=>q.id==='${id}').explanationRU`);
    if(true){
      await evaluate(`document.querySelector('#${id}-result details summary').focus()`);await pressEnter();
      await check(id+' corrected code opens',`document.querySelector('#${id}-result details').open && document.querySelector('#${id}-result details pre').textContent===QUIZ_QUESTIONS.find(q=>q.id==='${id}').correctedCode`);
    }
    for(const card of await evaluate(`QUIZ_QUESTIONS.find(q=>q.id==='${id}').cardIds`)){
      await evaluate(`document.querySelector('#${id}-result a[href="#/cards/${card}"]').click()`);await ready(`getFilteredCards()[state.index].id==='${card}'`);await evaluate('toggleAnswer()');
      await evaluate(`document.querySelector('#card-sim-link a[href="#/quiz/${id}"]').click()`);await ready(`location.hash==='#/quiz/${id}'`);checks.push(id+' linked both ways '+card);
    }
  }
  for(const width of [320,390,430,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const id of ids){await route('cards/'+id);await ready(`getFilteredCards()[state.index].id==='${id}'`);await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");await check(id+' expanded '+width,'document.documentElement.scrollWidth<=innerWidth');}
    for(const id of ['q7','q8','q10','q12','q13','q16','q19']){await route('quiz/'+id);await evaluate(`document.querySelectorAll('#${id} details').forEach(d=>d.open=true)`);await check(id+' expanded '+width,'document.documentElement.scrollWidth<=innerWidth');}
    await route('wiki');await evaluate("document.querySelectorAll('#view-wiki details').forEach(d=>d.open=true)");await check('wiki expanded '+width,'document.documentElement.scrollWidth<=innerWidth');
    await route('cheatsheet');await check('cheatsheet '+width,'document.documentElement.scrollWidth<=innerWidth');
    if([390,1440].includes(width)){
      await route('cards/c22');await ready("getFilteredCards()[state.index].id==='c22'");await evaluate("toggleAnswer();document.getElementById('card-code').scrollIntoView();window.scrollBy(0,-130)");
      await ready("getComputedStyle(document.getElementById('card-answer-box')).opacity==='1'");
      const shot=await call('Page.captureScreenshot',{format:'png'});writeFileSync(`/private/tmp/sync-card-${width}.png`,Buffer.from(shot.data,'base64'));
      await route('quiz/q19');await evaluate("document.getElementById('q19-result').scrollIntoView();window.scrollBy(0,-130)");
      const quizShot=await call('Page.captureScreenshot',{format:'png'});writeFileSync(`/private/tmp/sync-quiz-${width}.png`,Buffer.from(quizShot.data,'base64'));
    }
  }
  await call('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});
  for(const routeName of [...ids.map(id=>'cards/'+id),'quiz/q7','quiz/q8','quiz/q10','quiz/q12','quiz/q13','quiz/q16','quiz/q19','cheatsheet']){
    await route(routeName);
    if(routeName.startsWith('cards')){await ready(`getFilteredCards()[state.index].id==='${routeName.split('/')[1]}'`);await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");}
    const selector=routeName.startsWith('cards')?'#view-cards, #view-cards *':routeName.startsWith('quiz')?'#'+routeName.split('/')[1]+', #'+routeName.split('/')[1]+' *':'#view-cheatsheet, #view-cheatsheet *';
    await evaluate(`window.restoreSizes=[...document.querySelectorAll(${JSON.stringify(selector)})].map(el=>({el,old:el.style.fontSize,size:parseFloat(getComputedStyle(el).fontSize)}));window.restoreSizes.forEach(({el,size})=>el.style.fontSize=(size*2)+'px')`);
    await check(routeName+' doubled actual text','document.documentElement.scrollWidth<=innerWidth');
    await evaluate('window.restoreSizes.forEach(({el,old})=>el.style.fontSize=old)');
  }
  if (errors.length || consoleErrors.length) throw Error('Browser exceptions or console errors');
} catch (error) {
  errors.push({ message: error.message }); process.exitCode = 1;
} finally {
  try { if (contextId) await call('Target.disposeBrowserContext', { browserContextId: contextId }, true); }
  catch (error) { errors.push({ cleanup: error.message }); process.exitCode = 1; }
  ws.close();
}
const report = { ok: !errors.length && !consoleErrors.length, url: options.url, checks, errors, consoleErrors, durationMs: Math.round(performance.now() - started), scope: 'Targeted c15/c21/c22 and q7/q8/q10/q12/q13/q16/q19, backlinks, wiki and unchanged cheatsheet layout; four widths and actual font-size doubling. Not full scheduler/diagram review.' };
if (options.output) writeFileSync(options.output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
