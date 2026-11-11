// v90: надёжность прогресса.
// R10 — браузер перестал записывать посреди занятия: три отметки плана и три оценки карточек подряд держатся в памяти,
//       галочки, статусы и счётчики совпадают, после восстановления записи всё сохраняется и сообщение уходит.
// R2  — «Сбросить отметки» начинает карточки с нуля: отметки, история попыток и занятие; отметки плана остаются.
// R1  — сбой GET /progress при входе: повтор с растущей задержкой и кнопка «Повторить», PUT не раньше GET,
//       без параллельных сверок (Cognito и API подменены через page.route, как в check-auth.js).
// Аргумент — папка для скриншотов (необязателен).
const { chromium } = require("playwright");
const site = "http://127.0.0.1:8765/";
const synced = "http://127.0.0.1:8767/";
const AUTH = "https://golang-interview-prep.auth.eu-north-1.amazoncognito.com";
const API = "https://gp33wjlm10.execute-api.eu-north-1.amazonaws.com";
const out = process.argv[2];

function jwt(claims) {
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.sig`;
}

// opts.failGets / opts.failPuts — сколько первых GET / PUT /progress ответят 503. GET отвечает с задержкой,
// чтобы параллельная сверка успела бы начаться, если бы её не запрещал код.
async function mockBackend(ctx, server, opts) {
  const calls = { seq: [], put: [], inflight: 0, maxInflight: 0 };
  await ctx.route(`${AUTH}/oauth2/authorize**`, async route => {
    const u = new URL(route.request().url());
    const back = new URL(u.searchParams.get("redirect_uri"));
    back.searchParams.set("code", "code-123");
    back.searchParams.set("state", u.searchParams.get("state"));
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await ctx.route(`${AUTH}/oauth2/token`, route => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ access_token: "access-1", id_token: jwt({ email: "aleks@example.com" }), refresh_token: "r", expires_in: 3600 }) }));
  await ctx.route(`${API}/**`, async route => {
    const req = route.request();
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type", "access-control-allow-methods": "GET,PUT,POST" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const path = new URL(req.url()).pathname;
    if (path === "/progress" && req.method() === "GET") {
      calls.seq.push("GET");
      calls.inflight++;
      calls.maxInflight = Math.max(calls.maxInflight, calls.inflight);
      await new Promise(r => setTimeout(r, 300));
      calls.inflight--;
      if (opts.failGets > 0) { opts.failGets--; return route.fulfill({ status: 503, headers: cors, body: "{}" }); }
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(server.progress ? server : { progress: null, version: 0 }) });
    }
    if (path === "/progress" && req.method() === "PUT") {
      const body = JSON.parse(req.postData());
      calls.seq.push("PUT");
      calls.put.push(body);
      if (opts.failPuts > 0) { opts.failPuts--; return route.fulfill({ status: 503, headers: cors, body: "{}" }); }
      if (body.version !== (server.version || 0)) return route.fulfill({ status: 409, headers: cors, body: '{"error":"conflict"}' });
      server.progress = body.progress;
      server.version = (server.version || 0) + 1;
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ version: server.version, updatedAt: new Date().toISOString() }) });
    }
    return route.fulfill({ status: 404, headers: cors, body: "{}" });
  });
  return calls;
}

const failWrites = () => {
  window.__realSetItem = window.__realSetItem || Storage.prototype.setItem;
  Storage.prototype.setItem = function () { throw new DOMException("quota test", "QuotaExceededError"); };
};
const restoreWrites = () => { Storage.prototype.setItem = window.__realSetItem; };

(async () => {
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  // Сценарий целиком: исключение (нет элемента, не дождались) — строка FAIL, остальные сценарии идут дальше.
  const run = async (name, ctx, body) => {
    try { await body(); } catch (e) { ok(`${name}: scenario ran to the end`, false, e.message.split("\n")[0]); } finally { await ctx.close(); }
  };
  const watch = (p, tag) => {
    p.on("pageerror", e => errors.push(`${tag}: ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${tag}: ${m.text()}`); });
  };

  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await run(`local ${w}`, ctx, async () => {
      const p = await ctx.newPage(); watch(p, `local ${w}`);
      await p.clock.setFixedTime(new Date("2026-11-10T12:00:00+01:00")); // вторник недели 1
      await p.goto(`${site}#/plan/w1/mon`); await p.waitForSelector("#plan-week-title");
      await p.evaluate(() => {
        localStorage.clear(); sessionStorage.clear();
        localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-11-09", done: { "w1-mon-2": true } }));
      });
      await p.reload(); await p.waitForSelector("#plan-week-title");

      // --- R10, план: запись отказала, отметить mon-1 и mon-3, снять mon-2.
      await p.evaluate(failWrites);
      await p.click("#plan-task-w1-mon-1");
      await p.click("#plan-task-w1-mon-3");
      await p.click("#plan-task-w1-mon-2");
      const plan = await p.evaluate(() => {
        const week = PLAN.weeks[0].days.flatMap(d => d.tasks).filter(t => !t.optional);
        const done = ["w1-mon-1", "w1-mon-3"].filter(id => week.some(t => t.id === id)).length;
        const notice = document.getElementById("plan-storage-notice");
        return {
          memory: Object.keys(planState.saved.done).sort(),
          boxes: ["w1-mon-1", "w1-mon-2", "w1-mon-3"].map(id => document.getElementById(`plan-task-${id}`).checked),
          count: document.getElementById("plan-week-count").textContent, expected: `${done} из ${week.length} обязательных`,
          notice: notice.classList.contains("hidden") ? "" : notice.textContent,
          disk: Object.keys((JSON.parse(localStorage.getItem("go_prep_plan_v1")) || {}).done || {})
        };
      });
      ok(`${w}: plan — three edits kept in memory, ticks match`, plan.memory.join() === "w1-mon-1,w1-mon-3" && plan.boxes.join() === "true,false,true", JSON.stringify(plan));
      ok(`${w}: plan — week counter counts the unsaved ticks`, plan.count.startsWith(plan.expected), `${plan.count} vs ${plan.expected}`);
      ok(`${w}: plan — notice tells what happens`, /не дал сохранить отметки плана/.test(plan.notice) && /каждые 5 секунд/.test(plan.notice) && /не перезагружай/.test(plan.notice), plan.notice);
      ok(`${w}: plan — storage still has the old snapshot`, plan.disk.join() === "w1-mon-2", plan.disk.join());
      await p.evaluate(restoreWrites);
      const planSaved = await p.waitForFunction(() => {
        const d = (JSON.parse(localStorage.getItem("go_prep_plan_v1")) || {}).done || {};
        return d["w1-mon-1"] && d["w1-mon-3"] && !d["w1-mon-2"] && document.getElementById("plan-storage-notice").classList.contains("hidden");
      }, null, { timeout: 9000 }).then(() => true, () => false);
      ok(`${w}: plan — writing works again: everything saved by itself, notice gone`, planSaved);
      await p.reload(); await p.waitForSelector("#plan-week-title");
      ok(`${w}: plan — ticks survive reload`, (await p.evaluate(() => ["w1-mon-1", "w1-mon-2", "w1-mon-3"].map(id => document.getElementById(`plan-task-${id}`).checked).join())) === "true,false,true");

      // --- R10, карточки: c33 сохранена, затем запись отказала; c34 «сам», c35 «с опорой», c36 «не ответил».
      await p.goto(`${site}#/cards/c33`); await p.waitForTimeout(300);
      const grade = async (id, result) => {
        await p.evaluate(h => { location.hash = h; }, `#/cards/${id}`);
        await p.waitForFunction(id => state.shownCard === id, id);
        await p.click("#reveal-btn");
        await p.click(`[data-result="${result}"]`);
      };
      await grade("c33", "self");
      const freshBefore = await p.evaluate(() => reviewCounts().fresh);
      // New cards of the current week (week 1) among the three graded below: c34 (c35 moved to week 2 in v91).
      const weekGraded = await p.evaluate(() => { const ids = new Set(PLAN.weeks[0].days.flatMap(d => d.tasks).flatMap(t => t.links || [])); return ["c34", "c35", "c36"].filter(id => ids.has(id)).length; });
      await p.evaluate(failWrites);
      await grade("c34", "self");
      await grade("c35", "anchors");
      await grade("c36", "none");
      await p.evaluate(() => { location.hash = "#/cards/c36"; });
      await p.waitForFunction(() => state.shownCard === "c36");
      const cards = await p.evaluate(() => ({
        progress: state.progress,
        attempts: Object.fromEntries(Object.entries(loadAttempts()).map(([id, list]) => [id, list.map(a => `${a.d}:${a.r}`).join()])),
        bar: document.getElementById("progress-text").textContent,
        pill: document.getElementById("card-status").textContent,
        button: document.querySelector("#view-cards [data-review-start]").textContent,
        notice: document.getElementById("storage-notice").classList.contains("hidden") ? "" : document.getElementById("storage-notice").textContent,
        disk: [localStorage.getItem("go_prep_progress_v2"), localStorage.getItem("go_prep_attempts_v1")],
        total: CARDS.length
      }));
      ok(`${w}: cards — three unsaved grades kept with statuses`, JSON.stringify(cards.progress) === JSON.stringify({ c33: "mastered", c34: "mastered", c35: "review", c36: "review" }), JSON.stringify(cards.progress));
      ok(`${w}: cards — three unsaved attempts kept`, cards.attempts.c34 === "2026-11-10:self" && cards.attempts.c35 === "2026-11-10:anchors" && cards.attempts.c36 === "2026-11-10:none", JSON.stringify(cards.attempts));
      ok(`${w}: cards — counters see them`, cards.bar.startsWith(`ответил сам на последней проверке — 2 из ${cards.total}`) && /к повторению: 0$/.test(cards.bar) && cards.button.includes(`новых на неделе ${freshBefore - weekGraded}`), `${cards.bar} | ${cards.button} | fresh before ${freshBefore}, graded of the week ${weekGraded}`);
      ok(`${w}: cards — status and schedule of the unsaved grade`, cards.pill === "На повторении · 10.11: не ответил · следующая проверка 11.11", cards.pill);
      ok(`${w}: cards — review filter has the unsaved marks`, (await p.evaluate(() => { setFilter("review"); const ids = getFilteredCards().map(c => c.id).join(); setFilter("all"); return ids; })) === "c35,c36");
      ok(`${w}: cards — notice tells what happens`, /не дал сохранить отметки карточек/.test(cards.notice) && /каждые 5 секунд/.test(cards.notice), cards.notice);
      ok(`${w}: cards — storage still has only c33`, cards.disk[0] === JSON.stringify({ c33: "mastered" }) && Object.keys(JSON.parse(cards.disk[1])).join() === "c33", cards.disk.join(" | "));
      if (out) await p.screenshot({ path: `${out}/v90-unsaved-${w}.png` });
      await p.evaluate(restoreWrites);
      const cardsSaved = await p.waitForFunction(() => {
        const prog = JSON.parse(localStorage.getItem("go_prep_progress_v2") || "{}");
        const att = JSON.parse(localStorage.getItem("go_prep_attempts_v1") || "{}");
        return Object.keys(prog).length === 4 && ["c33", "c34", "c35", "c36"].every(id => att[id] && att[id].length === 1) && document.getElementById("storage-notice").classList.contains("hidden");
      }, null, { timeout: 9000 }).then(() => true, () => false);
      ok(`${w}: cards — writing works again: marks and attempts saved, notice gone`, cardsSaved);
      await p.reload(); await p.waitForTimeout(400);
      ok(`${w}: cards — after reload the same counters`, (await p.textContent("#progress-text")) === cards.bar, await p.textContent("#progress-text"));

      // --- R2: сброс карточек. Занятие начато, отметка плана есть.
      await p.evaluate(() => continueSession()); await p.waitForTimeout(200);
      const before = await p.evaluate(() => ({ filter: state.filter, session: localStorage.getItem("go_prep_session_v1") !== null, bar: document.getElementById("progress-text").textContent }));
      ok(`${w}: reset setup — a session is running`, before.filter === "session" && before.session, JSON.stringify(before));
      await p.evaluate(() => { document.querySelector("#view-cards details.study-settings").open = true; });
      let question = "";
      p.once("dialog", d => { question = d.message(); d.dismiss(); });
      await p.click('#view-cards button[onclick="resetProgress()"]');
      const kept = await p.evaluate(() => ({ p: localStorage.getItem("go_prep_progress_v2"), a: localStorage.getItem("go_prep_attempts_v1"), s: localStorage.getItem("go_prep_session_v1"), bar: document.getElementById("progress-text").textContent }));
      ok(`${w}: reset — the question names marks, history, session and keeps the plan`, /с нуля/.test(question) && /отметки всех карточек/.test(question) && /история ответов/.test(question) && /текущее занятие/.test(question) && /Отметки плана останутся/.test(question), question);
      ok(`${w}: reset — cancel changes nothing`, kept.p && kept.a && kept.s && kept.bar === before.bar, JSON.stringify(kept));
      p.once("dialog", d => d.accept());
      await p.click('#view-cards button[onclick="resetProgress()"]');
      const fresh = await p.evaluate(() => {
        const weekCards = new Set(PLAN.weeks[0].days.flatMap(d => d.tasks).flatMap(t => t.links || []).filter(id => /^c\d+$/.test(id)));
        return {
          disk: ["go_prep_progress_v2", "go_prep_attempts_v1", "go_prep_session_v1"].map(k => localStorage.getItem(k)),
          plan: Object.keys(JSON.parse(localStorage.getItem("go_prep_plan_v1")).done).sort().join(),
          filter: state.filter, progress: Object.keys(state.progress).length, attempts: Object.keys(loadAttempts()).length,
          bar: document.getElementById("progress-text").textContent, button: document.querySelector("#view-cards [data-review-start]").textContent,
          weekCards: weekCards.size, total: CARDS.length
        };
      });
      ok(`${w}: reset — marks, attempts and session removed`, fresh.disk.every(v => v === null) && fresh.progress === 0 && fresh.attempts === 0, JSON.stringify(fresh));
      ok(`${w}: reset — plan ticks untouched`, fresh.plan === "w1-mon-1,w1-mon-3", fresh.plan);
      ok(`${w}: reset — counters, queue and the session button start over`, fresh.bar === `ответил сам на последней проверке — 0 из ${fresh.total} (0%) · к повторению: 0` && fresh.button === `▶ Занятие до 10 карточек: к повторению 0, новых на неделе ${fresh.weekCards}` && fresh.filter === "all", `${fresh.bar} | ${fresh.button} | ${fresh.filter}`);
      await p.evaluate(() => { location.hash = "#/cards/c33"; }); await p.waitForFunction(() => state.shownCard === "c33");
      ok(`${w}: reset — c33 is new again`, (await p.textContent("#card-status")) === "Новая");
      await p.reload(); await p.waitForTimeout(400);
      const reloaded = await p.evaluate(() => ({ bar: document.getElementById("progress-text").textContent, pill: document.getElementById("card-status").textContent, plan: Object.keys(JSON.parse(localStorage.getItem("go_prep_plan_v1")).done).length }));
      ok(`${w}: reset — holds after reload`, reloaded.bar === fresh.bar && reloaded.pill === "Новая" && reloaded.plan === 2, JSON.stringify(reloaded));
      ok(`${w}: no horizontal overflow`, (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    });
  }

  // --- R1: сбой GET /progress при входе. 320 — самая тесная шапка: кнопка не должна закрыть название.
  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const server = {};
    const calls = await mockBackend(ctx, server, { failGets: 2, failPuts: 0 });
    await run(`sync ${w}`, ctx, async () => {
      const p = await ctx.newPage(); watch(p, `sync ${w}`);
      await p.goto(`${synced}#/plan/w1/mon`); await p.waitForSelector("#plan-week-title");
      await p.evaluate(() => { localStorage.clear(); localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c1: "mastered" })); });
      await p.reload(); await p.waitForSelector("#account .account-signin");
      await p.click("#account .account-signin");
      await p.waitForSelector("#account .account-chip", { timeout: 8000 });
      const status = () => p.evaluate(() => ({ title: document.getElementById("account-status").title, kind: document.getElementById("account-status").dataset.kind, retry: !document.getElementById("account-retry").hidden }));
      await p.waitForFunction(() => /Повторю через 5 с/.test(document.getElementById("account-status").title), null, { timeout: 8000 });
      const first = await status();
      ok(`${w}: failed first sync — warning, «Повторить», nothing sent`, first.kind === "warn" && first.retry && /Прогресс не сверен: загрузка: 503/.test(first.title) && calls.put.length === 0, JSON.stringify(first));
      const button = await p.evaluate(() => {
        const r = document.getElementById("account-retry").getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(document.querySelector(".brand"));
        const brandRight = Math.max(...[...range.getClientRects()].map(x => x.right));
        return { w: r.width, h: r.height, name: document.getElementById("account-retry").getAttribute("aria-label"), inView: r.left >= 0 && r.right <= innerWidth,
          clear: brandRight <= document.querySelector(".account-chip").getBoundingClientRect().left, overflow: document.documentElement.scrollWidth - innerWidth };
      });
      ok(`${w}: «Повторить» fits the header and leaves the site name visible`, button.w > 0 && button.h >= 28 && button.name === "Повторить сверку прогресса" && button.inView && button.clear && button.overflow <= 0, JSON.stringify(button));
      if (out) await p.screenshot({ path: `${out}/v90-retry-${w}.png`, clip: { x: 0, y: 0, width: w, height: 120 } });
      // Повтор сам через 5 с — снова сбой, следующая задержка длиннее.
      await p.waitForFunction(() => /Повторю через 15 с/.test(document.getElementById("account-status").title), null, { timeout: 9000 });
      ok(`${w}: automatic retry after 5 s, then a longer delay`, calls.seq.join() === "GET,GET" && calls.put.length === 0, calls.seq.join());
      // Кнопка «Повторить» дважды подряд: одна сверка; GET ответит, и только потом PUT.
      await p.evaluate(() => { const r = document.getElementById("account-retry"); r.focus(); r.click(); r.click(); });
      await p.waitForFunction(() => /сохранён на сервере/.test(document.getElementById("account-status").title), null, { timeout: 8000 });
      const done = await status();
      ok(`${w}: «Повторить» — one sync at a time, PUT only after GET`, calls.seq.join() === "GET,GET,GET,PUT" && calls.maxInflight === 1 && calls.put[0].version === 0 && calls.put[0].progress.go_prep_progress_v2 === JSON.stringify({ c1: "mastered" }), `${calls.seq.join()} max ${calls.maxInflight}`);
      ok(`${w}: synced — no «Повторить», focus moved to «Выйти»`, done.kind === "ok" && !done.retry && await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("account-signout")), JSON.stringify(done));
      // После восстановления отметки снова уходят на сервер.
      await p.click("#plan-task-w1-mon-1");
      const pushed = await p.waitForFunction(() => /Сохранено на сервере/.test(document.getElementById("account-status").title), null, { timeout: 9000 }).then(() => true, () => false);
      ok(`${w}: ticks are pushed again with the next version`, pushed && calls.put.length === 2 && calls.put[1].version === 1 && JSON.parse(calls.put[1].progress.go_prep_plan_v1).done["w1-mon-1"] === true, calls.put.map(x => x.version).join());
    });
  }

  // R1: первая отправка (сервер пуст) отказала — повтор снова начинается с GET.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const server = {};
    const calls = await mockBackend(ctx, server, { failGets: 0, failPuts: 1 });
    await run("sync put", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "sync put");
      await p.goto(`${synced}#/plan/w1/mon`); await p.waitForSelector("#plan-week-title");
      await p.evaluate(() => { localStorage.clear(); localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c2: "review" })); });
      await p.reload(); await p.waitForSelector("#account .account-signin");
      await p.click("#account .account-signin");
      await p.waitForSelector("#account .account-chip", { timeout: 8000 });
      await p.waitForFunction(() => /Не сохранилось: сохранение: 503\. Повторю через 5 с/.test(document.getElementById("account-status").title), null, { timeout: 8000 });
      const saved = await p.waitForFunction(() => /сохранён на сервере/.test(document.getElementById("account-status").title), null, { timeout: 9000 }).then(() => true, () => false);
      ok("failed first upload: retry reads the server again before sending", saved && calls.seq.join() === "GET,PUT,GET,PUT" && server.version === 1, calls.seq.join());
    });
  }

  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
