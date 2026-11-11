// v92: синхронизация видит то, что видит пользователь.
// V91-1 — «Объединить» сразу после того, как браузер снова дал записывать (до повтора через 5 с): несохранённые отметка
//         карточки, попытка и галочка плана уходят на сервер и остаются здесь, страница не перезагружается; если браузер
//         всё ещё не даёт записать — ничего не теряется, сверка повторяется и снова предлагает выбор.
// V91-2 — отметка во время GET на новом устройстве и отметка во время PUT «Объединить» не теряются, сервер получает их
//         (вторая — следующим тиком), страница не перезагружается.
// V91-3 — «Сбросить отметки», когда браузер не дал удалить: старое занятие не предлагается, после восстановления
//         удалено всё — отметки, попытки и занятие; сообщение уходит, только когда очищено всё.
// Cognito и API подменены через page.route (как в check-auth.js и check-v90.js), отказ хранилища — подменой
// Storage.prototype.setItem / removeItem.
const { chromium } = require("playwright");
const site = "http://127.0.0.1:8765/";
const synced = "http://127.0.0.1:8767/";
const AUTH = "https://golang-interview-prep.auth.eu-north-1.amazoncognito.com";
const API = "https://gp33wjlm10.execute-api.eu-north-1.amazonaws.com";

function jwt(claims) {
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.sig`;
}

// Ответ на запрос можно задержать: hold.GET / hold.PUT — ворота, которые тест откроет сам.
function gate() {
  let open;
  const wait = new Promise(r => { open = r; });
  return { wait, open };
}

async function mockBackend(ctx, server) {
  const calls = { seq: [], put: [], hold: {}, waiting: "" };
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
    const method = req.method();
    if (path !== "/progress" || !["GET", "PUT"].includes(method)) return route.fulfill({ status: 404, headers: cors, body: "{}" });
    calls.seq.push(method);
    const body = method === "PUT" ? JSON.parse(req.postData()) : null;
    if (body) calls.put.push(body);
    const held = calls.hold[method];
    if (held) {
      calls.hold[method] = null;
      calls.waiting = method;
      await held.wait;
      calls.waiting = "";
    }
    if (method === "GET") {
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(server.progress ? server : { progress: null, version: 0 }) });
    }
    if (body.version !== (server.version || 0)) return route.fulfill({ status: 409, headers: cors, body: '{"error":"conflict"}' });
    server.progress = body.progress;
    server.version = (server.version || 0) + 1;
    return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ version: server.version, updatedAt: new Date().toISOString() }) });
  });
  return calls;
}

const failWrites = () => {
  window.__realSetItem = window.__realSetItem || Storage.prototype.setItem;
  Storage.prototype.setItem = function () { throw new DOMException("quota test", "QuotaExceededError"); };
};
const restoreWrites = () => { if (window.__realSetItem) Storage.prototype.setItem = window.__realSetItem; };
const failRemoves = () => {
  window.__realRemoveItem = window.__realRemoveItem || Storage.prototype.removeItem;
  Storage.prototype.removeItem = function () { throw new DOMException("blocked test", "SecurityError"); };
};
const restoreRemoves = () => { if (window.__realRemoveItem) Storage.prototype.removeItem = window.__realRemoveItem; };

const J = JSON.stringify;
const parse = s => JSON.parse(s || "null");

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
  const grade = async (p, id, result) => {
    await p.evaluate(h => { location.hash = h; }, `#/cards/${id}`);
    await p.waitForFunction(id => state.shownCard === id, id);
    await p.click("#reveal-btn");
    await p.click(`[data-result="${result}"]`);
  };
  const statusIs = (p, re, timeout = 8000) => p.waitForFunction(src => new RegExp(src).test(document.getElementById("account-status").title), re.source, { timeout });
  // Вход через подменённый Cognito; local — что лежит в localStorage до входа.
  const signIn = async (p, route, local) => {
    await p.goto(`${synced}${route}`); await p.waitForSelector("#account .account-signin");
    await p.evaluate(local => { localStorage.clear(); sessionStorage.clear(); for (const [k, v] of Object.entries(local)) localStorage.setItem(k, v); }, local);
    await p.reload(); await p.waitForSelector("#account .account-signin");
    await p.click("#account .account-signin");
    await p.waitForSelector("#account .account-chip", { timeout: 8000 });
    await p.evaluate(() => { window.__noReload = true; }); // пропадёт, если страница перезагрузится
  };
  const notReloaded = p => p.evaluate(() => window.__noReload === true);
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // --- V91-1: «Объединить» сразу после восстановления записи, до повтора через 5 с.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const server = { progress: { go_prep_progress_v2: J({ c39: "mastered" }) }, version: 7 };
    const calls = await mockBackend(ctx, server);
    await run("merge pending", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "merge pending");
      await signIn(p, "#/plan/w1/mon", { go_prep_progress_v2: J({ c33: "review" }) });
      await p.waitForSelector("#sync-choice:not(.hidden) button", { timeout: 8000 });
      await p.evaluate(failWrites);
      await p.click("#plan-task-w1-mon-1");
      await grade(p, "c34", "self");
      // Проверка, восстановление записи и «Объединить» — одним заходом: таймер повтора не успеет записать раньше.
      const before = await p.evaluate(() => {
        const pending = [progressStore.pending, attemptsStore.pending, planStore.pending];
        const disk = localStorage.getItem("go_prep_progress_v2");
        Storage.prototype.setItem = window.__realSetItem;
        [...document.querySelectorAll("#sync-choice button")].find(x => /^Объединить/.test(x.textContent)).click();
        return { pending, disk };
      });
      ok("V91-1: before merge — mark, attempt and plan tick wait in memory only", before.pending.join() === "true,true,true" && before.disk === J({ c33: "review" }), JSON.stringify(before));
      await statusIs(p, /Прогресс объединён с сервером/);
      const sent = calls.put[0] ? { progress: parse(calls.put[0].progress.go_prep_progress_v2), attempts: parse(calls.put[0].progress.go_prep_attempts_v1), plan: parse(calls.put[0].progress.go_prep_plan_v1), version: calls.put[0].version } : {};
      ok("V91-1: the merge sends the unsaved mark, attempt and plan tick", sent.version === 7 && J(sent.progress) === J({ c39: "mastered", c33: "review", c34: "mastered" }) && J(sent.attempts) === J({ c34: [{ d: today, r: "self" }] }) && sent.plan && sent.plan.done["w1-mon-1"] === true, JSON.stringify(sent));
      const after = await p.evaluate(() => ({
        progress: JSON.parse(localStorage.getItem("go_prep_progress_v2")), attempts: JSON.parse(localStorage.getItem("go_prep_attempts_v1")), plan: JSON.parse(localStorage.getItem("go_prep_plan_v1")),
        pending: [progressStore.pending, attemptsStore.pending, planStore.pending].join(), noticeHidden: document.getElementById("storage-notice").classList.contains("hidden"),
        shown: state.progress, phase: authState.sync.phase
      }));
      ok("V91-1: no page reload", await notReloaded(p));
      ok("V91-1: this browser keeps both devices, the attempt once, the plan tick", J(after.progress) === J({ c39: "mastered", c33: "review", c34: "mastered" }) && J(after.attempts) === J({ c34: [{ d: today, r: "self" }] }) && after.plan.done["w1-mon-1"] === true && J(after.shown) === J({ c33: "review", c34: "mastered", c39: "mastered" }), JSON.stringify(after));
      ok("V91-1: nothing waits in memory, the notice is gone, sync is ready", after.pending === "false,false,false" && after.noticeHidden && after.phase === "ready", JSON.stringify(after));
      await p.evaluate(() => syncTick());
      ok("V91-1: sent equals written — the next tick sends nothing", calls.put.length === 1 && server.version === 8, calls.seq.join());
      await p.evaluate(() => { location.hash = "#/cards/c39"; }); await p.waitForFunction(() => state.shownCard === "c39");
      ok("V91-1: the server mark shows up without a reload", /^Ответил сам/.test(await p.textContent("#card-status")), await p.textContent("#card-status"));
    });
  }

  // --- V91-1: «Объединить», пока браузер всё ещё не даёт записать: ничего не теряется, сверка повторяется.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const server = { progress: { go_prep_progress_v2: J({ c39: "mastered" }) }, version: 7 };
    const calls = await mockBackend(ctx, server);
    await run("merge still failing", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "merge still failing");
      await signIn(p, "#/cards/c33", { go_prep_progress_v2: J({ c33: "review" }) });
      await p.waitForSelector("#sync-choice:not(.hidden) button", { timeout: 8000 });
      await p.evaluate(failWrites);
      await grade(p, "c34", "self");
      await p.click("#sync-choice button:has-text('Объединить')");
      await statusIs(p, /Не удалось записать прогресс в этот браузер\. Повторю через 5 с/);
      const held = await p.evaluate(() => ({ shown: state.progress, pending: progressStore.pending && attemptsStore.pending, notice: !document.getElementById("storage-notice").classList.contains("hidden"), retry: !document.getElementById("account-retry").hidden }));
      ok("V91-1 (still failing): server got the unsaved mark", calls.put.length === 1 && parse(calls.put[0].progress.go_prep_progress_v2).c34 === "mastered", calls.seq.join());
      ok("V91-1 (still failing): no reload, the mark stays on screen and in memory, notice and «Повторить» shown", await notReloaded(p) && held.shown.c34 === "mastered" && held.pending && held.notice && held.retry, JSON.stringify(held));
      await p.evaluate(restoreWrites);
      // Повтор записи (5 с) сохраняет отметку, повтор сверки (5 с) читает сервер и снова предлагает выбор.
      await p.waitForSelector("#sync-choice:not(.hidden) button", { timeout: 9000 });
      await p.click("#sync-choice button:has-text('Объединить')");
      await statusIs(p, /Прогресс объединён с сервером/);
      const done = await p.evaluate(() => ({ progress: JSON.parse(localStorage.getItem("go_prep_progress_v2")), attempts: JSON.parse(localStorage.getItem("go_prep_attempts_v1")) }));
      ok("V91-1 (still failing): after recovery the second merge keeps everything, still no reload", await notReloaded(p) && J(done.progress) === J({ c39: "mastered", c33: "review", c34: "mastered" }) && done.attempts.c34.length === 1 && calls.seq.join() === "GET,PUT,GET,PUT" && server.version === 9, `${JSON.stringify(done)} ${calls.seq.join()}`);
    });
  }

  // --- V91-2: новое устройство, отметка во время GET.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const server = { progress: { go_prep_progress_v2: J({ c39: "mastered" }) }, version: 7 };
    const calls = await mockBackend(ctx, server);
    const get = gate();
    calls.hold.GET = get;
    await run("mark during GET", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "mark during GET");
      await signIn(p, "#/cards/c34", {});
      await p.waitForFunction(() => authState.sync.phase === "busy");
      ok("V91-2 GET: the first GET is in flight", calls.waiting === "GET", calls.waiting);
      await grade(p, "c34", "self");
      get.open();
      await statusIs(p, /Прогресс объединён с сервером/);
      await p.evaluate(() => { location.hash = "#/cards/c34"; }); await p.waitForFunction(() => state.shownCard === "c34");
      const after = await p.evaluate(() => ({ progress: JSON.parse(localStorage.getItem("go_prep_progress_v2")), attempts: JSON.parse(localStorage.getItem("go_prep_attempts_v1")), choice: document.getElementById("sync-choice").classList.contains("hidden"), pill: document.getElementById("card-status").textContent }));
      ok("V91-2 GET: no reload, the mark is not replaced by the server copy", await notReloaded(p) && J(after.progress) === J({ c39: "mastered", c34: "mastered" }) && J(after.attempts) === J({ c34: [{ d: today, r: "self" }] }) && /^Ответил сам/.test(after.pill), JSON.stringify(after));
      ok("V91-2 GET: merged without a question, the server gets the mark", after.choice && calls.seq.join() === "GET,PUT" && parse(server.progress.go_prep_progress_v2).c34 === "mastered" && parse(server.progress.go_prep_progress_v2).c39 === "mastered", calls.seq.join());
    });
  }

  // --- V91-2: отметка карточки и галочка плана во время PUT «Объединить».
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const server = { progress: { go_prep_progress_v2: J({ c39: "mastered" }) }, version: 7 };
    const calls = await mockBackend(ctx, server);
    await run("mark during PUT", ctx, async () => {
      const p = await ctx.newPage(); watch(p, "mark during PUT");
      await signIn(p, "#/plan/w1/mon", { go_prep_progress_v2: J({ c33: "review" }) });
      await p.waitForSelector("#sync-choice:not(.hidden) button", { timeout: 8000 });
      const put = gate();
      calls.hold.PUT = put;
      await p.click("#sync-choice button:has-text('Объединить')");
      await p.waitForFunction(() => authState.sync.phase === "busy");
      await new Promise(r => { const t = setInterval(() => { if (calls.waiting === "PUT") { clearInterval(t); r(); } }, 20); });
      await p.click("#plan-task-w1-mon-1");
      await grade(p, "c34", "self");
      put.open();
      await statusIs(p, /Прогресс объединён с сервером/);
      const after = await p.evaluate(() => ({ progress: JSON.parse(localStorage.getItem("go_prep_progress_v2")), attempts: JSON.parse(localStorage.getItem("go_prep_attempts_v1")), plan: JSON.parse(localStorage.getItem("go_prep_plan_v1")).done }));
      ok("V91-2 PUT: the merge sent what was there before the edits", J(parse(calls.put[0].progress.go_prep_progress_v2)) === J({ c39: "mastered", c33: "review" }), calls.put[0].progress.go_prep_progress_v2);
      ok("V91-2 PUT: no reload, the edits made during PUT stay over the merge result", await notReloaded(p) && J(after.progress) === J({ c39: "mastered", c33: "review", c34: "mastered" }) && J(after.attempts) === J({ c34: [{ d: today, r: "self" }] }) && after.plan["w1-mon-1"] === true, JSON.stringify(after));
      await p.evaluate(() => syncTick());
      const next = calls.put[1] ? { version: calls.put[1].version, progress: parse(calls.put[1].progress.go_prep_progress_v2), plan: parse(calls.put[1].progress.go_prep_plan_v1) } : null;
      ok("V91-2 PUT: the next tick sends them with the new version", next && next.version === 8 && next.progress.c34 === "mastered" && next.progress.c39 === "mastered" && next.plan.done["w1-mon-1"] === true && server.version === 9, JSON.stringify(next));
    });
  }

  // --- V91-3: сброс, когда браузер не дал удалить; без бэкенда.
  for (const w of [1280, 390]) {
    for (const mode of ["write and remove fail", "only remove fails"]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
      await run(`reset ${w} ${mode}`, ctx, async () => {
        const p = await ctx.newPage(); watch(p, `reset ${w}`);
        await p.goto(`${site}#/cards/c33`); await p.waitForFunction(() => state.shownCard === "c33");
        await p.evaluate(today => {
          localStorage.clear();
          localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c33: "review", c34: "mastered" }));
          localStorage.setItem("go_prep_attempts_v1", JSON.stringify({ c33: [{ d: today, r: "none" }], c34: [{ d: today, r: "self" }] }));
          localStorage.setItem("go_prep_session_v1", JSON.stringify({ ids: ["c33", "c34"], done: [], created: today }));
          localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-11-09", done: { "w1-mon-1": true } }));
        }, today);
        await p.reload(); await p.waitForFunction(() => state.shownCard === "c33");
        const button = () => p.textContent("#view-cards [data-review-start]");
        ok(`${w} ${mode}: setup — a session is saved`, /Продолжить занятие: осталось 2/.test(await button()), await button());
        await p.evaluate(failRemoves);
        if (mode === "write and remove fail") await p.evaluate(failWrites);
        await p.evaluate(() => { document.querySelector("#view-cards details.study-settings").open = true; });
        p.once("dialog", d => d.accept());
        await p.click('#view-cards button[onclick="resetProgress()"]');
        await p.evaluate(() => { location.hash = "#/cards/c33"; }); await p.waitForFunction(() => state.shownCard === "c33");
        const during = await p.evaluate(() => ({
          progress: Object.keys(state.progress).length, attempts: Object.keys(loadAttempts()).length, session: reviewLoadSession(),
          notice: document.getElementById("storage-notice").classList.contains("hidden") ? "" : document.getElementById("storage-notice").textContent,
          pill: document.getElementById("card-status").textContent, disk: localStorage.getItem("go_prep_session_v1") !== null
        }));
        ok(`${w} ${mode}: removal refused — cards look reset, the old session is not offered`, during.progress === 0 && during.attempts === 0 && during.session === null && during.pill === "Новая" && during.disk && !/Продолжить занятие/.test(await button()), JSON.stringify(during) + " | " + await button());
        ok(`${w} ${mode}: the notice stays while something is not cleared`, /не дал сохранить отметки карточек/.test(during.notice), during.notice);
        await p.evaluate(restoreRemoves);
        await p.evaluate(restoreWrites);
        const cleared = await p.waitForFunction(() => {
          const s = localStorage.getItem("go_prep_session_v1");
          const prog = localStorage.getItem("go_prep_progress_v2"), att = localStorage.getItem("go_prep_attempts_v1");
          const empty = v => v === null || v === "{}";
          return s === null && empty(prog) && empty(att) && document.getElementById("storage-notice").classList.contains("hidden");
        }, null, { timeout: 9000 }).then(() => true, () => false);
        ok(`${w} ${mode}: storage works again — marks, attempts and the session are cleared by themselves, then the notice goes`, cleared);
        await p.reload(); await p.waitForFunction(() => state.shownCard === "c33");
        const reloaded = await p.evaluate(() => ({ pill: document.getElementById("card-status").textContent, plan: Object.keys(JSON.parse(localStorage.getItem("go_prep_plan_v1")).done).join() }));
        ok(`${w} ${mode}: after reload no «Продолжить занятие», c33 is new, plan ticks kept`, !/Продолжить занятие/.test(await button()) && reloaded.pill === "Новая" && reloaded.plan === "w1-mon-1", JSON.stringify(reloaded) + " | " + await button());
        ok(`${w}: no horizontal overflow`, (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
      });
    }
  }

  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
