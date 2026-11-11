// v93: остаток ревью v88 и мелочи надёжности.
// R8 — вход в План с клавиатуры переносит фокус на заголовок недели, ссылка на день — на заголовок дня;
//      галочка и перерисовка фокус не трогают, при открытии страницы без дня фокус не перехватывается.
// Статус карточки — итог дня: «не ответил», затем «сам» в один день — «На повторении», как в расписании;
//      старая запись с таким расхождением показывается так же и попадает в «На повторение».
// Тренажёр проговора и практикум — браузер не дал записать: результат и отметка держатся на странице, уходят на сервер
//      со следующей синхронизацией и записываются повтором; сообщение говорит, что происходит, и меняется после записи.
// Холодный старт раннера — 503 от /runs: «Сервер проверки просыпается, повторяю через 20 с», один повтор, кнопка доступна.
// gaps недель — без устаревших пунктов.
// Cognito и API подменены через page.route (как в check-v92.js), отказ хранилища — подменой Storage.prototype.setItem,
// время повтора после 503 — page.clock.
const { chromium } = require("playwright");
const site = "http://127.0.0.1:8765/";
const synced = "http://127.0.0.1:8767/";
const AUTH = "https://golang-interview-prep.auth.eu-north-1.amazoncognito.com";
const API = "https://gp33wjlm10.execute-api.eu-north-1.amazonaws.com";

function jwt(claims) {
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.sig`;
}

const PASSED = { taskId: "p-money", passed: true, tests: [{ name: "TestString", passed: true }], race: false, timedOut: false, output: "", millis: 1234 };

// runs — ответы /runs по очереди (число — статус без тела, объект — 200 с этим телом); последний повторяется.
async function mockBackend(ctx, runs) {
  const calls = { put: [], runs: [] };
  const server = { progress: null, version: 0 };
  await ctx.route(`${AUTH}/oauth2/authorize**`, async route => {
    const u = new URL(route.request().url());
    const back = new URL(u.searchParams.get("redirect_uri"));
    back.searchParams.set("code", "code-123");
    back.searchParams.set("state", u.searchParams.get("state"));
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await ctx.route(`${AUTH}/oauth2/token`, route => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ access_token: "access-1", id_token: jwt({ email: "tester@example.com" }), refresh_token: "r", expires_in: 3600 }) }));
  await ctx.route(`${API}/**`, async route => {
    const req = route.request();
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type", "access-control-allow-methods": "GET,PUT,POST" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const path = new URL(req.url()).pathname;
    if (path === "/runs" && req.method() === "POST") {
      calls.runs.push(JSON.parse(req.postData()));
      const next = runs.length > 1 ? runs.shift() : runs[0];
      if (typeof next === "number") return route.fulfill({ status: next, headers: cors, contentType: "application/json", body: '{"message":"Service Unavailable"}' });
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(next) });
    }
    if (path !== "/progress") return route.fulfill({ status: 404, headers: cors, body: "{}" });
    if (req.method() === "GET") return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(server) });
    const body = JSON.parse(req.postData());
    calls.put.push(body);
    if (body.version !== server.version) return route.fulfill({ status: 409, headers: cors, body: '{"error":"conflict"}' });
    server.progress = body.progress;
    server.version++;
    return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ version: server.version, updatedAt: new Date().toISOString() }) });
  });
  return calls;
}

const failWrites = () => {
  window.__realSetItem = window.__realSetItem || Storage.prototype.setItem;
  Storage.prototype.setItem = function () { throw new DOMException("quota test", "QuotaExceededError"); };
};
const restoreWrites = () => { if (window.__realSetItem) Storage.prototype.setItem = window.__realSetItem; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const short = s => `${s.slice(8, 10)}.${s.slice(5, 7)}`;

(async () => {
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const run = async (name, ctx, body) => {
    try { await body(); } catch (e) { ok(`${name}: scenario ran to the end`, false, e.message.split("\n")[0]); } finally { await ctx.close(); }
  };
  const watch = (p, tag) => {
    p.on("pageerror", e => errors.push(`${tag}: ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${tag}: ${m.text()}`); });
  };
  const active = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName) : ""; });
  const overflow = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const signIn = async (p, route) => {
    await p.goto(`${synced}${route}`); await p.waitForSelector("#account .account-signin");
    await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await p.reload(); await p.waitForSelector("#account .account-signin");
    await p.click("#account .account-signin");
    await p.waitForSelector("#account .account-chip", { timeout: 8000 });
    await p.waitForFunction(() => authState.sync.phase === "ready", null, { timeout: 8000 });
  };
  const checkButton = p => p.locator(".practice-section .btn", { hasText: "Проверить на сервере" });
  const statusText = p => p.evaluate(() => document.getElementById("practice-solution-p-money").closest(".practice-section").querySelector("p.practice-copy-status").textContent);

  // --- R8: фокус при входе в План и на день.
  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    await run(`R8 ${w}`, ctx, async () => {
      const p = await ctx.newPage(); watch(p, `R8 ${w}`);
      await p.clock.setFixedTime(new Date("2026-11-11T19:00:00+01:00")); // среда недели 1 при старте 09.11
      await p.goto(`${site}#/plan`); await p.waitForSelector("#plan-week-title");
      ok(`${w}: opening the page on the plan does not move focus`, await active(p) === "BODY", await active(p));
      await p.evaluate(() => { location.hash = "#/cards"; }); await p.waitForFunction(() => document.activeElement && document.activeElement.id === "card-q-en");
      const tab = w > 640 ? '.nav-tabs a[data-route="plan"]' : '.bottom-nav a[data-route="plan"]';
      await p.focus(tab); await p.keyboard.press("Enter");
      await p.waitForFunction(() => !document.getElementById("view-plan").classList.contains("hidden"));
      ok(`${w}: Enter on «План» moves focus to the week heading`, await active(p) === "plan-week-title", await active(p));
      ok(`${w}: the heading is the plan's, title says so`, /^Неделя 1\./.test(await p.textContent("#plan-week-title")) && /^План 14 недель/.test(await p.title()));
      // Галочка с клавиатуры: фокус остаётся на ней.
      await p.evaluate(() => localStorage.removeItem("go_prep_plan_v1"));
      await p.focus("#plan-task-w1-wed-1"); await p.keyboard.press("Space");
      ok(`${w}: a tick keeps focus on the checkbox`, await active(p) === "plan-task-w1-wed-1" && await p.isChecked("#plan-task-w1-wed-1"), await active(p));
      // Перерисовка (вход, выход, смена даты) фокус на заголовок не переносит.
      await p.evaluate(() => document.dispatchEvent(new CustomEvent("auth-changed")));
      ok(`${w}: a re-render does not move focus to a heading`, !/^plan-w|^plan-week-title$/.test(await active(p)), await active(p));
      // Из другого раздела по ссылке на день — заголовок дня.
      await p.evaluate(() => { location.hash = "#/quiz"; }); await p.waitForFunction(() => document.activeElement && document.activeElement.id === "quiz-title");
      await p.evaluate(() => scrollTo(0, 1500));
      await p.evaluate(() => { location.hash = "#/plan/w1/wed"; });
      await p.waitForFunction(() => !document.getElementById("view-plan").classList.contains("hidden"));
      ok(`${w}: a link to a day from another section focuses the day heading`, await active(p) === "plan-w1-wed-title", await active(p));
      // Заголовок дня виден: не под закреплённой шапкой (раздел перед этим прокручен вниз).
      const dayOnScreen = async how => {
        await p.waitForTimeout(150); // renderPlan прокручивает к дню через 60 мс
        const r = await p.evaluate(() => {
          const top = document.getElementById("plan-w1-wed-title").getBoundingClientRect().top;
          const head = document.querySelector("header");
          const cover = getComputedStyle(head).position === "sticky" ? head.getBoundingClientRect().bottom : 0;
          return { top: Math.round(top), cover: Math.round(cover), h: innerHeight };
        });
        ok(`${w}: ${how} — the focused day heading is on screen, not under the sticky header`, r.top >= r.cover && r.top < r.h, JSON.stringify(r));
      };
      await dayOnScreen("from another section");
      // Внутри плана: «К задачам дня» с другой недели — заголовок дня; чип недели — заголовок недели.
      await p.evaluate(() => { location.hash = "#/plan/w2"; }); await p.waitForFunction(() => /^Неделя 2\./.test(document.getElementById("plan-week-title").textContent));
      ok(`${w}: switching week still focuses the week heading`, await active(p) === "plan-week-title", await active(p));
      await p.focus("#plan-today a"); await p.keyboard.press("Enter");
      await p.waitForFunction(() => location.hash === "#/plan/w1/wed" && document.getElementById("plan-w1-wed-title"));
      ok(`${w}: «К задачам дня» focuses the day heading`, await active(p) === "plan-w1-wed-title", await active(p));
      await dayOnScreen("«К задачам дня»");
      // Назад в карточки — как раньше.
      await p.evaluate(() => { location.hash = "#/cards"; });
      await p.waitForFunction(() => document.activeElement && document.activeElement.id === "card-q-en");
      ok(`${w}: back to cards — the question is focused`, true);
      ok(`${w}: no horizontal overflow`, await overflow(p) <= 0, await overflow(p));
    });
  }

  // --- Статус карточки — итог дня.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await run("status", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "status");
      await p.goto(`${site}#/cards/c33`); await p.waitForSelector("#reveal-btn");
      await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await p.reload(); await p.waitForFunction(() => state.shownCard === "c33");
      const grade = async (id, result) => {
        await p.evaluate(h => { location.hash = h; }, `#/cards/${id}`);
        await p.waitForFunction(id => state.shownCard === id, id);
        await p.click("#reveal-btn");
        await p.click(`[data-result="${result}"]`);
        await p.evaluate(h => { location.hash = h; }, `#/cards/${id}`);
        await p.waitForFunction(id => state.shownCard === id, id);
      };
      const d = new Date();
      const today = iso(d), tomorrow = iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
      await grade("c33", "none");
      await grade("c33", "self");
      const pill = await p.evaluate(() => ({ text: document.getElementById("card-status").textContent, cls: document.getElementById("card-status").className, stored: JSON.parse(localStorage.getItem("go_prep_progress_v2")).c33 }));
      ok("«не ответил», then «сам» the same day: the card says «На повторении» and the miss", pill.text === `На повторении · ${short(today)}: не ответил · следующая проверка ${short(tomorrow)}` && /status-review/.test(pill.cls), JSON.stringify(pill));
      ok("the stored mark is «review», the same as after a merge", pill.stored === "review", pill.stored);
      ok("progress counter: no card answered on its own", /ответил сам на последней проверке — 0 из/.test(await p.textContent("#progress-text")), await p.textContent("#progress-text"));
      // Запись, сделанная до исправления: отметка «сам», а день кончился промахом.
      await p.evaluate(today => {
        localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c34: "mastered" }));
        localStorage.setItem("go_prep_attempts_v1", JSON.stringify({ c34: [{ d: today, r: "none" }, { d: today, r: "self" }] }));
        location.hash = "#/cards/c34";
      }, today);
      await p.reload(); await p.waitForFunction(() => state.shownCard === "c34");
      ok("an old record with that mismatch shows «На повторении» too", /^На повторении · /.test(await p.textContent("#card-status")), await p.textContent("#card-status"));
      const inReview = await p.evaluate(() => { setFilter("review"); return getFilteredCards().map(c => c.id); });
      ok("…and is in «На повторение» today", inReview.includes("c34"), inReview.join(","));
    });
  }

  // --- Тренажёр проговора и практикум, когда браузер не даёт записать.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
    const calls = await mockBackend(ctx, [PASSED]);
    await run("unsaved talk and practice", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "unsaved");
      await signIn(p, "#/plan/w1/mon");
      await p.evaluate(failWrites);
      await p.click(".talk-open");
      for (let i = 0; i < 4 && !(await p.locator("#talk-summary").count()); i++) await p.click(".talk-rate-said");
      await p.waitForSelector("#talk-summary");
      const note = await p.evaluate(() => { const n = document.getElementById("talk-save-note"); return n ? n.textContent : ""; });
      ok("talk: the summary says the result is kept on the page and retried", /пока он есть только на этой странице/.test(note) && /каждые 5 секунд/.test(note), note);
      ok("talk: nothing written yet", await p.evaluate(() => localStorage.getItem("go_prep_talk_v1")) === null);
      ok("talk: no horizontal overflow in the dialog at 390", await p.locator("dialog.talk-sheet").evaluate(d => d.scrollWidth - d.clientWidth) <= 0);
      const putTalk = () => calls.put.find(x => x.progress.go_prep_talk_v1 && /lc49/.test(x.progress.go_prep_talk_v1));
      for (let i = 0; i < 40 && !putTalk(); i++) await p.waitForTimeout(250);
      ok("talk: the next sync sends the unsaved result to the server", Boolean(putTalk()), calls.put.length);
      await p.evaluate(restoreWrites);
      await p.waitForFunction(() => /^Результат сохранён/.test(document.getElementById("talk-save-note").textContent), null, { timeout: 8000 });
      ok("talk: the retry writes it and the summary says so", await p.evaluate(() => (JSON.parse(localStorage.getItem("go_prep_talk_v1")) || { results: {} }).results.lc49.length === 1));
      await p.keyboard.press("Escape");
      ok("talk: the line under the button shows it", /^Последний раз /.test(await p.textContent('[data-talk-last="lc49"]')));

      await p.evaluate(failWrites);
      await p.evaluate(() => { location.hash = "#/practice/p-money"; });
      await p.waitForSelector("#practice-solution-p-money");
      await p.fill("#practice-solution-p-money", "package money // good");
      await checkButton(p).click();
      await p.waitForFunction(() => /Все тесты прошли/.test(document.querySelector(".practice-check-result").innerText), null, { timeout: 5000 });
      const st = await statusText(p);
      ok("practice: solved, the message says the mark waits on the page and is retried", /браузер не дал сохранить отметку/.test(st) && /каждые 5 секунд/.test(st), st);
      ok("practice: nothing written yet", await p.evaluate(() => localStorage.getItem("go_prep_practice_v1")) === null);
      const putSolved = () => calls.put.find(x => x.progress.go_prep_practice_v1 && /p-money/.test(x.progress.go_prep_practice_v1));
      for (let i = 0; i < 40 && !putSolved(); i++) await p.waitForTimeout(250);
      ok("practice: the next sync sends the unsaved mark to the server", Boolean(putSolved()), calls.put.length);
      ok("practice: no horizontal overflow at 390", await overflow(p) <= 0, await overflow(p));
      await p.evaluate(restoreWrites);
      await p.waitForFunction(() => document.getElementById("practice-solution-p-money").closest(".practice-section").querySelector("p.practice-copy-status").textContent === "Задача отмечена как решённая.", null, { timeout: 8000 });
      ok("practice: the retry writes it and the message becomes the usual one", await p.evaluate(() => Boolean((JSON.parse(localStorage.getItem("go_prep_practice_v1")) || {})["p-money"])));
      await p.evaluate(() => { location.hash = "#/practice"; });
      await p.waitForSelector(".practice-index-item");
      ok("practice: ✅ on the index", await p.evaluate(() => /^✅ W1-1\./.test([...document.querySelectorAll(".practice-index-item strong")].find(s => s.textContent.includes("W1-1")).textContent)));
    });
  }

  // --- 503 от /runs: раннер просыпается.
  const wake = async (name, w, runs, body) => {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    const calls = await mockBackend(ctx, runs);
    await run(name, ctx, async () => {
      const p = await ctx.newPage(); watch(p, name);
      await p.clock.install();
      await signIn(p, "#/practice/p-money");
      await p.waitForSelector("#practice-solution-p-money");
      await p.fill("#practice-solution-p-money", "package money // good");
      await checkButton(p).click();
      await p.waitForFunction(() => /Сервер проверки просыпается/.test(document.getElementById("practice-solution-p-money").closest(".practice-section").querySelector("p.practice-copy-status").textContent), null, { timeout: 5000 });
      await body(p, calls);
    });
  };
  await wake("503 then 200", 390, [503, PASSED], async (p, calls) => {
    ok("503: the message is clear", await statusText(p) === "Сервер проверки просыпается, повторяю через 20 с.", await statusText(p));
    ok("503: the button stays available while waiting", await checkButton(p).isEnabled());
    ok("503: one request so far", calls.runs.length === 1, calls.runs.length);
    ok("503: no horizontal overflow at 390", await overflow(p) <= 0, await overflow(p));
    await p.clock.fastForward(19000);
    ok("503: no retry before 20 s", calls.runs.length === 1, calls.runs.length);
    await p.clock.fastForward(1000);
    await p.waitForFunction(() => /Все тесты прошли/.test(document.querySelector(".practice-check-result").innerText), null, { timeout: 5000 });
    ok("503: one automatic retry, the result is shown", calls.runs.length === 2 && calls.runs[1].code === "package money // good", calls.runs.length);
    ok("503: after the retry — solved, the button is available", await statusText(p) === "Задача отмечена как решённая." && await checkButton(p).isEnabled(), await statusText(p));
    await p.clock.fastForward(60000);
    ok("503: no more requests", calls.runs.length === 2, calls.runs.length);
  });
  await wake("503 twice", 1280, [503], async (p, calls) => {
    await p.clock.fastForward(20000);
    await p.waitForFunction(() => /не проснулся/.test(document.getElementById("practice-solution-p-money").closest(".practice-section").querySelector("p.practice-copy-status").textContent), null, { timeout: 5000 });
    const st = await statusText(p);
    ok("503 twice: the message says what to do", st === "Не получилось проверить: сервер проверки так и не проснулся; подожди минуту и нажми «Проверить на сервере» ещё раз.", st);
    ok("503 twice: the button is available", await checkButton(p).isEnabled());
    await p.clock.fastForward(60000);
    ok("503 twice: exactly one automatic retry", calls.runs.length === 2, calls.runs.length);
  });
  await wake("503, then a click while waiting", 1280, [503, PASSED], async (p, calls) => {
    await checkButton(p).click();
    await p.waitForFunction(() => /Все тесты прошли/.test(document.querySelector(".practice-check-result").innerText), null, { timeout: 5000 });
    ok("click while waiting: checks at once", calls.runs.length === 2, calls.runs.length);
    await p.clock.fastForward(25000);
    ok("click while waiting: the pending retry is dropped", calls.runs.length === 2, calls.runs.length);
  });

  // --- gaps недель: устаревших пунктов нет, действующие на месте.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await run("gaps", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "gaps");
      await p.goto(`${site}#/plan/w1`); await p.waitForSelector("#plan-week-title");
      const gaps = async week => {
        await p.evaluate(h => { location.hash = h; }, `#/plan/${week}`);
        await p.waitForFunction(n => document.getElementById("plan-week-title").textContent.startsWith(`Неделя ${n}.`), week.slice(1));
        return p.evaluate(() => {
          const head = [...document.querySelectorAll("#view-plan .plan-block h3")].find(h => h.textContent === "Чего для этой недели пока нет на сайте");
          return head ? [...head.parentElement.querySelectorAll("li")].map(li => li.textContent) : [];
        });
      };
      const stale = { w3: /не вводится/, w6: /pgx/, w8: /c38 про synctest|Нет материалов по тестированию на Go/, w10: /только выбор варианта|^Нет режима code review: показать фрагмент/, w12: /event-driven архитектуре/ };
      for (const [week, re] of Object.entries(stale)) {
        const list = await gaps(week);
        ok(`${week}: no outdated gap`, list.length > 0 && !list.some(g => re.test(g)), JSON.stringify(list));
      }
      ok("w5: the trace gap is still listed", (await gaps("w5")).some(g => /go tool trace/.test(g)));
      ok("w14: the interview journal gap is still listed", (await gaps("w14")).some(g => /журнала реальных интервью/.test(g)));
      ok("w4: no gaps block", (await gaps("w4")).length === 0);
    });
  }

  ok("no console errors", errors.length === 0, errors.slice(0, 5).join(" | "));
  await b.close();
  res.forEach(r => console.log(r));
  const failed = res.filter(r => r.startsWith("FAIL")).length;
  console.log(`${res.length - failed}/${res.length} passed`);
  process.exit(failed ? 1 : 0);
})();
