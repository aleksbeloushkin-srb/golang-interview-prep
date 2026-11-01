// Тренажёр проговора (js/talk-trainer.js): кнопка под задачей плана, шаги с таймером, эталон, самооценка,
// итог и сохранение в go_prep_talk_v1; без входа (порт 8767 с бэкендом) результат не сохраняется.
// Запуск: serve.py 8765 --no-backend и serve.py 8767, затем node docs/verification/browser/check-talk.js
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(`${w}: ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w}: ${m.text()}`); });
    await p.clock.install({ time: new Date("2026-11-02T10:00:00+01:00") });
    await p.goto("http://127.0.0.1:8765/#/plan/w1/mon"); await p.waitForSelector("#plan-week-title");
    await p.clock.pauseAt(new Date("2026-11-02T10:01:00+01:00")); // время идёт только по runFor
    await p.evaluate(() => localStorage.removeItem("go_prep_talk_v1"));
    const btn = p.locator('.talk-open').first();
    ok(`${w}: trainer button under a talk task`, await btn.count() > 0 && /Проговорить с таймером/.test(await btn.innerText()));
    const count = await p.evaluate(() => document.querySelectorAll(".talk-open").length);
    await btn.click();
    const dlg = p.locator("dialog.talk-sheet");
    ok(`${w}: dialog opens modal`, await dlg.evaluate(d => d.open && d.matches(":modal")));
    ok(`${w}: focus on step name`, await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("talk-step-name") && document.activeElement.textContent === "Clarify"));
    const prog = await p.textContent(".talk-progress");
    ok(`${w}: progress shows step and timers`, /Шаг 1 из 4/.test(prog) && /на шаге 0:00 из 0:30/.test(prog) && /всего 0:00/.test(prog), prog);
    ok(`${w}: model hidden before reveal`, await p.locator("#talk-model").isHidden());
    await p.click("text=Показать эталон");
    ok(`${w}: model shown after reveal`, await p.locator("#talk-model").isVisible() && (await p.getAttribute('[aria-controls="talk-model"]', "aria-expanded")) === "true");
    await p.clock.runFor(35000);
    const over = await p.textContent(".talk-step-time");
    ok(`${w}: over target is said in words`, /сверх ориентира на 0:05/.test(over) && await p.locator(".talk-step-time.is-over").count() === 1, over);
    // Пауза останавливает отсчёт.
    await p.click(".talk-body >> text=Пауза");
    await p.clock.runFor(20000);
    ok(`${w}: pause stops the step timer`, /на шаге 0:35/.test(await p.textContent(".talk-step-time")), await p.textContent(".talk-step-time"));
    await p.click(".talk-body >> text=Продолжить");
    await p.click(".talk-rate-said");
    ok(`${w}: next step after rating`, /Шаг 2 из 4/.test(await p.textContent(".talk-progress")) && (await p.textContent(".talk-step-name")) === "Approach");
    await p.clock.runFor(60000); await p.click(".talk-rate-partial");
    await p.clock.runFor(20000); await p.click(".talk-rate-missed");
    await p.clock.runFor(40000); await p.click(".talk-rate-said");
    const sum = await p.textContent("#talk-summary");
    ok(`${w}: summary total and target`, /^Итог: 2:35 при ориентире 3:15$/.test(sum), sum);
    const weak = await p.textContent(".talk-weak");
    ok(`${w}: weak steps listed`, /Повторить: Approach, Complexity/.test(weak), weak);
    ok(`${w}: focus on summary`, await p.evaluate(() => document.activeElement && document.activeElement.id === "talk-summary"));
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem("go_prep_talk_v1")));
    const a = stored && stored.results && stored.results.lc49 && stored.results.lc49[0];
    ok(`${w}: attempt saved`, a && a.total === 155 && a.steps.map(s => s.rate).join() === "said,partial,missed,said" && a.steps[0].sec === 35, JSON.stringify(stored));
    const ovf = await dlg.evaluate(d => d.scrollWidth - d.clientWidth);
    ok(`${w}: no horizontal overflow in dialog`, ovf <= 0, ovf);
    await p.keyboard.press("Escape");
    ok(`${w}: Escape closes and returns focus`, await p.evaluate(() => !document.querySelector("dialog.talk-sheet").open && document.activeElement && document.activeElement.classList.contains("talk-open")));
    const last = await p.textContent('[data-talk-last="lc49"]');
    ok(`${w}: last attempt shown next to the button`, /Последний раз 02\.11: 2:35, повторить — Approach, Complexity\./.test(last), last);
    // После перезагрузки строка остаётся; испорченное хранилище не ломает план.
    await p.reload(); await p.waitForSelector("#plan-week-title");
    ok(`${w}: last attempt survives reload`, /2:35/.test(await p.textContent('[data-talk-last="lc49"]')));
    await p.evaluate(() => localStorage.setItem("go_prep_talk_v1", "{bad json"));
    await p.reload(); await p.waitForSelector("#plan-week-title");
    ok(`${w}: bad storage ignored`, (await p.locator(".talk-open").count()) === count && (await p.textContent('[data-talk-last="lc49"]')) === "");
    const pageOvf = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no page overflow`, pageOvf <= 0, pageOvf);
    await ctx.close();
  }
  // Задачи без полного проговора (меньше трёх шагов) кнопку не получают; все кнопки — у задач с talk.
  {
    const p = await b.newPage();
    await p.goto("http://127.0.0.1:8765/#/plan/w1/sat"); await p.waitForSelector("#plan-week-title");
    const info = await p.evaluate(() => ({
      buttons: document.querySelectorAll(".talk-open").length,
      eligible: PLAN.weeks.flatMap(w => w.days.flatMap(d => d.tasks)).filter(t => t.talk && talkHasTrainer(t.talk)).length,
      noTrainer: Object.keys(PLAN.talks).filter(k => !talkHasTrainer(k)),
      consistent: Object.keys(PLAN.talks).every(k => talkHasTrainer(k) === (PLAN.talkSteps.filter(s => PLAN.talks[k][s.id]).length >= 3))
    }));
    ok("trainer only for talks with 3+ steps", info.consistent, JSON.stringify(info));
    ok("week 1 Saturday shows trainer buttons", info.buttons >= 1, JSON.stringify(info));
    await p.close();
  }
  // С бэкендом и без входа: тренировка работает, результат не сохраняется, есть кнопка входа.
  {
    const p = await b.newPage();
    p.on("pageerror", e => errors.push(`8767: ${e.message}`));
    await p.goto("http://127.0.0.1:8767/#/plan/w1/mon"); await p.waitForSelector("#plan-week-title");
    await p.evaluate(() => localStorage.removeItem("go_prep_talk_v1"));
    await p.locator(".talk-open").first().click();
    for (let i = 0; i < 4; i++) await p.click(".talk-rate-said");
    ok("signed out: not saved, sign-in offered", await p.evaluate(() => localStorage.getItem("go_prep_talk_v1") === null) && await p.locator("text=Войти, чтобы сохранять").isVisible());
    await p.click("text=Войти, чтобы сохранять");
    ok("signed out: sign-in notice shown", await p.locator("#signin-notice").isVisible());
    await p.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
