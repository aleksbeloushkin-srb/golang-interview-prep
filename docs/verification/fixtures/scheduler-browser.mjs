import { writeFileSync } from 'node:fs';

const options = { url: 'http://127.0.0.1:8000/', cdp: 'http://127.0.0.1:9228', output: null };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  if (!Object.hasOwn(options, key) || !args[i + 1]) throw Error('Usage: node docs/verification/fixtures/scheduler-browser.mjs [--url URL] [--cdp URL] [--output FILE]');
  options[key] = args[i + 1];
}
const started = performance.now(), checks = [], errors = [], consoleErrors = [], consoleWarnings = [];
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
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'warning') consoleWarnings.push(message.params);
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
  const ids=await evaluate('CARDS.map(c=>c.id)');
  const changed=['c1','c3','c4','c5','c7','c8','c9','c10','c11'];
  const sims=await evaluate('SIMULATORS.map(s=>({id:s.id,count:s.steps.length}))');
  for(const id of ids){
    if(changed.includes(id)) await route('cards/'+id);
    else await evaluate("document.querySelector('button[onclick=\"nextCard()\"]').click()");
    await ready(`getFilteredCards()[state.index].id==='${id}'`);
    await check(id+' hidden before attempt',"!document.getElementById('card-answer-box').classList.contains('visible')");
    await evaluate("document.getElementById('reveal-btn').focus()");await pressEnter();
    await check(id+' keyboard reveal',"state.revealed && getComputedStyle(document.activeElement).outlineStyle!=='none'");
    await check(id+' bilingual explanation',`document.getElementById('card-short-en').textContent===CARDS.find(c=>c.id==='${id}').shortEN && document.getElementById('card-translation').textContent.includes(CARDS.find(c=>c.id==='${id}').shortRU)`);
    await check(id+' source links',`document.querySelectorAll('#card-references a').length===CARDS.find(c=>c.id==='${id}').sources.length`);
    await evaluate("document.querySelector('#card-practice > details > summary').focus()");await pressEnter();
    await check(id+' prompt before solution',"document.querySelector('#card-practice > details').open && !document.querySelector('#card-practice .practice-solution').open");
    await evaluate("document.querySelector('#card-practice .practice-solution > summary').focus()");await pressEnter();
    await check(id+' solution opens',"document.querySelector('#card-practice .practice-solution').open");
    for(const quizId of await evaluate(`QUIZ_QUESTIONS.filter(q=>(q.cardIds||[]).includes('${id}')).map(q=>q.id)`)){
      await check(id+' quiz backlink '+quizId,`!!document.querySelector('#card-sim-link a[href="#/quiz/${quizId}"]')`);
    }
  }
  for(const id of await evaluate('QUIZ_QUESTIONS.map(q=>q.id)')){
    await route('quiz/'+id);
    await check(id+' hidden before answer',`document.getElementById('${id}-result').classList.contains('hidden')`);
    const n=await evaluate(`QUIZ_QUESTIONS.find(q=>q.id==='${id}').options.length`);
    for(let i=0;i<n;i++){
      await evaluate(`document.querySelectorAll('input[name=${id}]')[${i}].click()`);
      await check(id+' option '+i,`document.getElementById('${id}-title-res').textContent.includes(QUIZ_QUESTIONS.find(q=>q.id==='${id}').correct===${i}?'Верно':'правильный')`);
    }
    await check(id+' bilingual result',`document.getElementById('${id}-exp-en').textContent===QUIZ_QUESTIONS.find(q=>q.id==='${id}').speechEN && document.getElementById('${id}-exp-ru').textContent===QUIZ_QUESTIONS.find(q=>q.id==='${id}').explanationRU`);
    for(const card of await evaluate(`QUIZ_QUESTIONS.find(q=>q.id==='${id}').cardIds||[]`)){
      await check(id+' card link '+card,`!!document.querySelector('#${id}-result a[href="#/cards/${card}"]')`);
    }
  }
  for(const [q,c] of [['q1','c3'],['q15','c1'],['q17','c8'],['q16','c10']]){
    await route('quiz/'+q);await evaluate(`document.querySelector('#${q}-result a[href="#/cards/${c}"]').click()`);await ready(`getFilteredCards()[state.index].id==='${c}'`);await evaluate('toggleAnswer()');
    await evaluate(`document.querySelector('#card-sim-link a[href="#/quiz/${q}"]').click()`);await ready(`location.hash==='#/quiz/${q}'`);checks.push(q+' new bidirectional route '+c);
  }
  await route('simulators');
  for(const s of sims){
    for(let i=0;i<s.count;i++){
      await evaluate(`document.querySelectorAll('#${s.id}-steps .step-pill')[${i}].click()`);
      await check(s.id+' step '+i+' content',`document.getElementById('${s.id}-desc').textContent===SIMULATORS.find(s=>s.id==='${s.id}').steps[${i}].desc && document.getElementById('${s.id}-recall').textContent.includes(SIMULATORS.find(s=>s.id==='${s.id}').steps[${i}].descEN)`);
      await check(s.id+' step '+i+' hidden solution',`![...document.querySelectorAll('#${s.id}-recall details')].some(d=>d.open)`);
      await evaluate(`document.querySelector('#${s.id}-recall .step-recall summary').focus()`);await pressEnter();
      await check(s.id+' step '+i+' keyboard solution',`document.querySelector('#${s.id}-recall .step-recall details').open`);
    }
    await check(s.id+' end disabled',`document.querySelector('#${s.id} [data-step-direction="1"]').disabled`);
    await evaluate(`document.querySelector('#${s.id} [data-step-direction="-1"]').focus()`);await pressEnter();
    await check(s.id+' previous and focus',`Number(document.getElementById('${s.id}').dataset.step)===${s.count-2} && document.activeElement.id==='${s.id}-status' && getComputedStyle(document.activeElement).outlineStyle!=='none'`);
  }
  for(const width of [320,390,430,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await route('cards/c1');
    for(const id of ids){if(id!=='c1') await evaluate("document.querySelector('button[onclick=\"nextCard()\"]').click()");await ready(`getFilteredCards()[state.index].id==='${id}'`);await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");await check(id+' expanded '+width,'document.documentElement.scrollWidth<=innerWidth');}
    await route('quiz');await evaluate("document.querySelectorAll('#view-quiz details').forEach(d=>d.open=true)");await check('all answered quiz expanded '+width,'document.documentElement.scrollWidth<=innerWidth');
    await route('simulators');
    for(const s of sims)for(let i=0;i<s.count;i++){
      await evaluate(`document.querySelectorAll('#${s.id}-steps .step-pill')[${i}].click();document.querySelectorAll('#${s.id} details').forEach(d=>d.open=true)`);
      await check(s.id+' step '+i+' expanded '+width,'document.documentElement.scrollWidth<=innerWidth');
    }
    await route('wiki');await evaluate("document.querySelectorAll('#view-wiki details').forEach(d=>d.open=true)");await check('wiki expanded '+width,'document.documentElement.scrollWidth<=innerWidth');
    await route('cheatsheet');await check('cheatsheet '+width,'document.documentElement.scrollWidth<=innerWidth');
    if([390,1440].includes(width)){
      for(const [id,index] of [['sim1',4],['sim2',4],['sim2',5]]){
        await route('simulators');await evaluate(`document.querySelectorAll('#${id}-steps .step-pill')[${index}].click();document.getElementById('${id}-desc').scrollIntoView();window.scrollBy(0,-60)`);
        const shot=await call('Page.captureScreenshot',{format:'png'});writeFileSync(`/private/tmp/scheduler-${id}-${index}-${width}.png`,Buffer.from(shot.data,'base64'));
      }
      await route('cards/c10');await ready("getFilteredCards()[state.index].id==='c10'");await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true);document.getElementById('card-short-en').scrollIntoView();window.scrollBy(0,-60)");await ready("getComputedStyle(document.getElementById('card-answer-box')).opacity==='1'");
      const shot=await call('Page.captureScreenshot',{format:'png'});writeFileSync(`/private/tmp/scheduler-c10-${width}.png`,Buffer.from(shot.data,'base64'));
    }
  }
  await call('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});
  for(const routeName of [...changed.map(id=>'cards/'+id),'simulators','cheatsheet']){
    await route(routeName);
    if(routeName.startsWith('cards')){await ready(`getFilteredCards()[state.index].id==='${routeName.split('/')[1]}'`);await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");}
    const selector=routeName.startsWith('cards')?'#view-cards, #view-cards *':routeName==='simulators'?'#view-simulators, #view-simulators *':'#view-cheatsheet, #view-cheatsheet *';
    const doubled=async()=>{await evaluate(`window.restoreSizes=[...document.querySelectorAll(${JSON.stringify(selector)})].map(el=>({el,old:el.style.fontSize,size:parseFloat(getComputedStyle(el).fontSize)}));window.restoreSizes.forEach(({el,size})=>el.style.fontSize=(size*2)+'px')`);};
    const restore=async()=>{await evaluate('window.restoreSizes.forEach(({el,old})=>el.style.fontSize=old)');};
    if(routeName==='simulators'){
      for(const s of sims.slice(0,2))for(let i=0;i<s.count;i++){
        await evaluate(`document.querySelectorAll('#${s.id}-steps .step-pill')[${i}].click();document.querySelectorAll('#${s.id} details').forEach(d=>d.open=true)`);await doubled();
        await check(s.id+' step '+i+' doubled actual text','document.documentElement.scrollWidth<=innerWidth');await restore();
      }
    }else{await doubled();await check(routeName+' doubled actual text','document.documentElement.scrollWidth<=innerWidth');await restore();}
  }
  if (errors.length || consoleErrors.length) throw Error('Browser exceptions or console errors');
} catch (error) {
  errors.push({ message: error.message }); process.exitCode = 1;
} finally {
  try { if (contextId) await call('Target.disposeBrowserContext', { browserContextId: contextId }, true); }
  catch (error) { errors.push({ cleanup: error.message }); process.exitCode = 1; }
  ws.close();
}
const report = { ok: !errors.length && !consoleErrors.length, url: options.url, checks, errors, consoleErrors, consoleWarnings, durationMs: Math.round(performance.now() - started), scope: 'Final corpus UI review: 38 cards, 22 quiz with every option, all 40 diagram steps, backlinks, keyboard, four widths. Doubled text for nine changed cards, fourteen changed steps and cheatsheet. Not a proof of Go semantics, timing, accessibility on every device or learning efficacy.' };
if (options.output) writeFileSync(options.output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
