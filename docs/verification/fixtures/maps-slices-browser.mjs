import { writeFileSync } from 'node:fs';

const options = { url: 'http://127.0.0.1:8000/', cdp: 'http://127.0.0.1:9228', output: null };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  if (!Object.hasOwn(options, key) || !args[i + 1]) throw Error('Usage: node docs/verification/fixtures/maps-slices-browser.mjs [--url URL] [--cdp URL] [--output FILE]');
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
  async function key(key,code,vk){await call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:vk,text:key==='Enter'?'\r':key===' '?' ':''});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk});}
  for(const id of ['c29','c30','c31','c32']){
    await route('cards/'+id); await ready(`getFilteredCards()[state.index].id==='${id}'`);
    await check(id+' answer initially hidden',"!document.getElementById('card-answer-box').classList.contains('visible')");
    await evaluate("document.getElementById('reveal-btn').focus()"); await key('Enter','Enter',13);
    await check(id+' keyboard reveal',"document.getElementById('card-answer-box').classList.contains('visible')");
    await check(id+' EN and code',`document.getElementById('card-short-en').textContent===CARDS.find(c=>c.id==='${id}').shortEN && document.getElementById('card-code').textContent===CARDS.find(c=>c.id==='${id}').code`);
    await check(id+' RU and sources',`document.getElementById('card-translation').textContent.includes(CARDS.find(c=>c.id==='${id}').shortRU) && document.querySelectorAll('#card-references a').length===CARDS.find(c=>c.id==='${id}').sources.length`);
    await check(id+' practice hidden',"!document.querySelector('#card-practice > details').open && !document.querySelector('#card-practice .practice-solution').open");
    await evaluate("document.querySelector('#card-practice > details > summary').focus()"); await key('Enter','Enter',13);
    await check(id+' prompt opens before solution',"document.querySelector('#card-practice > details').open && !document.querySelector('#card-practice .practice-solution').open");
    await evaluate("document.querySelector('#card-practice .practice-solution > summary').focus()"); await key('Enter','Enter',13);
    await check(id+' solution keyboard reveal',"document.querySelector('#card-practice .practice-solution').open");
    await check(id+' visible focus',"getComputedStyle(document.activeElement).outlineStyle!=='none'");
    if(id!=='c29'){
      await evaluate("document.querySelector('#card-sim-link a[href=\"#/simulators/sim7\"]').click()"); await ready("location.hash==='#/simulators/sim7'");
      await evaluate("document.querySelector('#sim7 a[href=\"#/cards/c31\"]').click()"); await ready("getFilteredCards()[state.index].id==='c31'");
      checks.push(id+' diagram and return link');
    }
  }
  await route('quiz/q6');
  await check('q6 answer initially hidden',"document.getElementById('q6-result').classList.contains('hidden')");
  for(let i=0;i<6;i++){
    await evaluate(`document.querySelectorAll('input[name=q6]')[${i}].click()`);
    await check('q6 choice '+i,`document.getElementById('q6-title-res').textContent.includes(${i===2?"'Верно'":"'правильный'"})`);
  }
  await evaluate("document.querySelectorAll('input[name=q6]')[2].focus()");await key(' ','Space',32);
  await check('q6 keyboard answer',"document.getElementById('q6-title-res').textContent.includes('Верно')");
  await check('q6 bilingual explanation',"document.getElementById('q6-exp-ru').textContent===QUIZ_QUESTIONS.find(q=>q.id==='q6').explanationRU && document.getElementById('q6-exp-en').textContent===QUIZ_QUESTIONS.find(q=>q.id==='q6').speechEN");
  await evaluate("document.querySelector('#q6-result details summary').focus()");await key('Enter','Enter',13);
  await check('q6 fixed code',"document.querySelector('#q6-result details').open && document.querySelector('#q6-result details pre').textContent===QUIZ_QUESTIONS.find(q=>q.id==='q6').correctedCode");
  for(const [quiz,ids] of [['q6',['c29','c25']],['q4',['c29']]])for(const id of ids){
    await route('quiz/'+quiz);
    await evaluate(`document.querySelectorAll('input[name=${quiz}]')[QUIZ_QUESTIONS.find(q=>q.id==='${quiz}').correct].click()`);
    await evaluate(`document.querySelector('#${quiz}-result a[href="#/cards/${id}"]').click()`);await ready(`getFilteredCards()[state.index].id==='${id}'`);
    await evaluate('toggleAnswer()');
    await evaluate(`document.querySelector('#card-sim-link a[href="#/quiz/${quiz}"]').click()`);await ready(`location.hash==='#/quiz/${quiz}'`);checks.push(quiz+' bidirectional '+id);
  }
  await route('simulators/sim7');
  for(let step=0;step<5;step++){
    await evaluate(`document.querySelectorAll('#sim7-steps button')[${step}].click()`);
    await check('sim7 step '+step+' content',`document.getElementById('sim7-desc').textContent===SIMULATORS[6].steps[${step}].desc && document.getElementById('sim7-recall').textContent.includes(SIMULATORS[6].steps[${step}].descEN)`);
    await check('sim7 step '+step+' hidden answer',"!document.querySelector('#sim7-recall .step-recall details').open");
    await evaluate("document.querySelector('#sim7-recall .step-recall summary').focus()");await key('Enter','Enter',13);
    await check('sim7 step '+step+' recall',`document.querySelector('#sim7-recall .step-recall details').open && document.getElementById('sim7-recall').textContent.includes(SIMULATORS[6].steps[${step}].check.answerRU)`);
    await check('sim7 step '+step+' states',`document.querySelector('#sim7 [data-step-direction="-1"]').disabled===${step===0} && document.querySelector('#sim7 [data-step-direction="1"]').disabled===${step===4} && document.querySelectorAll('#sim7-steps [aria-pressed="true"]').length===1`);
  }
  await evaluate("document.querySelector('#sim7 [data-step-direction=\"-1\"]').focus()");await key('Enter','Enter',13);
  await check('sim7 previous step and focus',"document.getElementById('sim7').dataset.step==='3' && document.activeElement.id==='sim7-status'");
  await evaluate("document.querySelector('#sim7 [data-step-direction=\"1\"]').click()");await check('sim7 next step',"document.getElementById('sim7').dataset.step==='4'");
  for(const width of [320,390,430,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const id of ['c29','c30','c31','c32']){
      await route('cards/'+id);await ready(`getFilteredCards()[state.index].id==='${id}'`);
      await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");
      await check(id+' expanded layout '+width,'document.documentElement.scrollWidth<=innerWidth');
      if(id==='c29' && width===390){await evaluate("document.getElementById('card-code').scrollIntoView();window.scrollBy(0,-100)");const shot=await call('Page.captureScreenshot',{format:'png'});writeFileSync('/private/tmp/maps-card-390.png',Buffer.from(shot.data,'base64'));}
    }
    await route('quiz/q6');await evaluate("document.querySelectorAll('#q6-result details').forEach(d=>d.open=true)");
    await check('q6 expanded layout '+width,'document.documentElement.scrollWidth<=innerWidth');
    await route('simulators/sim7');
    for(let step=0;step<5;step++){
      await evaluate(`renderSimStep(6,${step});document.querySelectorAll('#sim7 details').forEach(d=>d.open=true)`);
      await check('sim7 step '+step+' layout '+width,'document.documentElement.scrollWidth<=innerWidth');
      if(step===2 && [390,1440].includes(width)){
        await evaluate("document.getElementById('sim7-grid').scrollIntoView();window.scrollBy(0,-90)");
        const shot=await call('Page.captureScreenshot',{format:'png'});writeFileSync(`/private/tmp/maps-diagram-${width}.png`,Buffer.from(shot.data,'base64'));
      }
    }
    await route('wiki');await evaluate("document.querySelectorAll('#view-wiki details').forEach(d=>d.open=true)");
    await check('wiki expanded layout '+width,'document.documentElement.scrollWidth<=innerWidth');
    await route('cheatsheet');await check('map cheatsheet layout '+width,'document.documentElement.scrollWidth<=innerWidth');
  }
  await call('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});
  await evaluate("document.documentElement.style.fontSize='200%'");
  for(const id of ['c29','c30','c31','c32']){
    await route('cards/'+id);await ready(`getFilteredCards()[state.index].id==='${id}'`);await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");
    await check(id+' text 200%', 'document.documentElement.scrollWidth<=innerWidth');
  }
  await route('simulators/sim7');
  for(let step=0;step<5;step++){
    await evaluate(`renderSimStep(6,${step});document.querySelectorAll('#sim7 details').forEach(d=>d.open=true)`);
    await check('sim7 '+step+' text 200%', 'document.documentElement.scrollWidth<=innerWidth');
  }
  await route('quiz/q6');await check('q6 text 200%', 'document.documentElement.scrollWidth<=innerWidth');
  await route('cheatsheet');await check('map cheatsheet text 200%', 'document.documentElement.scrollWidth<=innerWidth');
  await evaluate("document.documentElement.style.fontSize=''");
  async function enlarge(selector) {
    await evaluate(`window._fontRestore = [...document.querySelectorAll(${JSON.stringify(selector)})].map(el=>({el,old:el.style.fontSize,size:parseFloat(getComputedStyle(el).fontSize)}));window._fontRestore.forEach(({el,size})=>el.style.fontSize=(size*2)+'px')`);
  }
  async function restoreFonts(){await evaluate("window._fontRestore.forEach(({el,old})=>el.style.fontSize=old)");}
  for(const id of ['c29','c30','c31','c32']) {
    await route('cards/'+id);await ready(`getFilteredCards()[state.index].id==='${id}'`);
    await evaluate("toggleAnswer();document.querySelectorAll('#card-answer-box details').forEach(d=>d.open=true)");
    await enlarge('#view-cards, #view-cards *');
    await check(id+' actual font sizes doubled','document.documentElement.scrollWidth<=innerWidth');await restoreFonts();
  }
  await route('simulators/sim7');
  for(let step=0;step<5;step++){
    await evaluate(`renderSimStep(6,${step});document.querySelectorAll('#sim7 details').forEach(d=>d.open=true)`);
    await enlarge('#sim7, #sim7 *');
    await check('sim7 '+step+' actual font sizes doubled','document.documentElement.scrollWidth<=innerWidth');await restoreFonts();
  }
  await route('quiz/q6');await enlarge('#q6, #q6 *');
  await check('q6 actual font sizes doubled','document.documentElement.scrollWidth<=innerWidth');await restoreFonts();

  if (errors.length || consoleErrors.length) throw Error('Browser exceptions or console errors');
} catch (error) {
  errors.push({ message: error.message }); process.exitCode = 1;
} finally {
  try { if (contextId) await call('Target.disposeBrowserContext', { browserContextId: contextId }, true); }
  catch (error) { errors.push({ cleanup: error.message }); process.exitCode = 1; }
  ws.close();
}
const report = { ok: !errors.length && !consoleErrors.length, url: options.url, checks, errors, consoleErrors, durationMs: Math.round(performance.now() - started), scope: 'Targeted c29-c32, q6, q4 link, five sim7 steps; EN/RU, keyboard, links, widths and 200% text. Not broad shared-UI regression.' };
if (options.output) writeFileSync(options.output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
