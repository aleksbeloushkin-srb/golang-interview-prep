// Browser checks for sign-in, read-only mode, progress sync and the practice
// server check, with Cognito and the API mocked by Playwright routes.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8767/";
const AUTH = "https://golang-interview-prep.auth.eu-north-1.amazoncognito.com";
const API = "https://gp33wjlm10.execute-api.eu-north-1.amazonaws.com";
const CLIENT = "75tg038tu68u3lkmn2jiasjem3";

function jwt(claims) {
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.sig`;
}

async function setup(ctx, server, opts = {}) {
  const calls = { token: [], put: [], runs: [], authorize: [] };
  await ctx.route(`${AUTH}/oauth2/authorize**`, async route => {
    const u = new URL(route.request().url());
    calls.authorize.push(Object.fromEntries(u.searchParams));
    const back = new URL(u.searchParams.get("redirect_uri"));
    if (opts.deny) back.searchParams.set("error", "access_denied");
    else back.searchParams.set("code", "code-123");
    back.searchParams.set("state", u.searchParams.get("state"));
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await ctx.route(`${AUTH}/oauth2/token`, async route => {
    calls.token.push(Object.fromEntries(new URLSearchParams(route.request().postData())));
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ access_token: "access-1", id_token: jwt({ email: "aleks@example.com" }), refresh_token: "r", expires_in: 3600 }) });
  });
  await ctx.route(`${AUTH}/logout**`, route => route.fulfill({ status: 200, contentType: "text/html", body: "logged out" }));
  await ctx.route(`${API}/**`, async route => {
    const req = route.request();
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,content-type", "access-control-allow-methods": "GET,PUT,POST" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const path = new URL(req.url()).pathname;
    if (req.headers()["authorization"] !== "Bearer access-1") return route.fulfill({ status: 401, headers: cors, body: "{}" });
    if (path === "/progress" && req.method() === "GET") return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(server.progress ? server : { progress: null, version: 0 }) });
    if (path === "/progress" && req.method() === "PUT") {
      const body = JSON.parse(req.postData());
      calls.put.push(body);
      if (body.version !== (server.version || 0)) return route.fulfill({ status: 409, headers: cors, body: '{"error":"conflict"}' });
      server.progress = body.progress;
      server.version = (server.version || 0) + 1;
      server.updatedAt = new Date().toISOString();
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ version: server.version, updatedAt: server.updatedAt }) });
    }
    if (path === "/runs") {
      const body = JSON.parse(req.postData());
      calls.runs.push(body);
      const passed = body.code.includes("// good");
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(passed
        ? { taskId: body.taskId, passed: true, tests: [{ name: "TestString", passed: true }], race: false, timedOut: false, output: "", millis: 1234 }
        : { taskId: body.taskId, passed: false, tests: [{ name: "TestString", passed: false, output: "money_test.go:22: String() = \"0.-5 EUR\"" }, { name: "TestStringer", passed: true }], race: true, timedOut: false, output: "WARNING: DATA RACE", millis: 900 }) });
    }
    return route.fulfill({ status: 404, headers: cors, body: "{}" });
  });
  return calls;
}

const signedIn = p => p.waitForSelector("#account .account-avatar", { timeout: 8000 });

(async () => {
  const b = await chromium.launch();
  let n = 0, fails = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };

  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const server = {};
    const calls = await setup(ctx, server);
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    p.on("console", m => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));

    // --- Signed out: read-only.
    await p.goto(base + "#/plan");
    await p.evaluate(() => localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c1: "known" })));
    await p.goto(base + "#/plan/w3/tue");
    await p.waitForTimeout(300);
    ok(`${w}: signed out shows the sign-in button`, await p.isVisible("#account .account-signin"));
    await p.locator(".plan-task input[type=checkbox]").first().click();
    const ro = await p.evaluate(() => ({ checked: document.querySelector(".plan-task input[type=checkbox]").checked, notice: !document.getElementById("signin-notice").classList.contains("hidden"), text: document.getElementById("signin-notice").textContent, plan: localStorage.getItem("go_prep_plan_v1") }));
    ok(`${w}: plan checkbox does not change without sign-in`, !ro.checked && ro.notice && /только на чтение/.test(ro.text) && !(ro.plan || "").includes("w3-mon-1"), JSON.stringify(ro));
    const toast = await p.evaluate(() => { const n = document.getElementById("signin-notice"); const r = n.getBoundingClientRect(); return { fixed: getComputedStyle(n).position === "fixed", inView: r.top >= 0 && r.bottom <= innerHeight, close: Boolean(n.querySelector(".signin-notice-close")) }; });
    ok(`${w}: sign-in notice floats in view with a close button`, toast.fixed && toast.inView && toast.close, JSON.stringify(toast));
    await p.click("#signin-notice .signin-notice-close");
    ok(`${w}: close hides the notice`, await p.evaluate(() => document.getElementById("signin-notice").classList.contains("hidden")));
    await p.goto(base + "#/cards/c1");
    await p.waitForTimeout(300);
    await p.click("#reveal-btn");
    await p.click('[data-grade="mastered"]');
    const card = await p.evaluate(() => ({ progress: localStorage.getItem("go_prep_progress_v2"), hint: !document.getElementById("grade-signin").classList.contains("hidden"), focus: Boolean(document.activeElement && document.activeElement.closest("#grade-signin")) }));
    ok(`${w}: card mark is refused without sign-in, focus on the hint below the grades`, card.progress === JSON.stringify({ c1: "known" }) && card.hint && card.focus, JSON.stringify(card));
    await p.goto(base + "#/practice/p-money");
    await p.waitForTimeout(300);
    ok(`${w}: practice check asks to sign in`, /Войти и проверить/.test(await p.locator(".practice-section .btn").filter({ hasText: /проверить/i }).first().textContent()));

    // --- Sign in: PKCE, back to the route, URL cleaned.
    await p.goto(base + "#/plan/w3/tue");
    await p.waitForTimeout(200);
    await p.click("#account .account-signin");
    await signedIn(p);
    const a = calls.authorize[0] || {};
    ok(`${w}: authorize uses PKCE S256, Google and the page as redirect`, a.code_challenge_method === "S256" && a.code_challenge && a.identity_provider === "Google" && a.redirect_uri === base && a.client_id === CLIENT, JSON.stringify(a));
    const tk = calls.token[0] || {};
    ok(`${w}: token request sends the verifier, not a secret`, tk.grant_type === "authorization_code" && tk.code === "code-123" && tk.code_verifier && tk.code_verifier.length >= 43 && !tk.client_secret, JSON.stringify(tk));
    const after = await p.evaluate(() => ({ url: location.href, email: document.querySelector(".account-email").textContent, pending: sessionStorage.getItem("go_prep_auth_pending_v1"), stored: JSON.stringify(localStorage).includes("access-1") || JSON.stringify(sessionStorage).includes("access-1"), noticeHidden: document.getElementById("signin-notice").classList.contains("hidden") }));
    ok(`${w}: back on the route with a clean URL`, after.url === base + "#/plan/w3/tue", after.url);
    ok(`${w}: email shown, notice hidden, token not in storage`, after.email === "aleks@example.com" && !after.pending && !after.stored && after.noticeHidden, JSON.stringify(after));

    // First sync: the server is empty, so the browser's progress is uploaded.
    await p.waitForFunction(() => /сохранён на сервере/.test(document.getElementById("account-status").title), null, { timeout: 5000 });
    ok(`${w}: first sync uploads local progress, not the sign-in hint`, calls.put.length === 1 && calls.put[0].version === 0 && calls.put[0].progress.go_prep_progress_v2 === JSON.stringify({ c1: "known" }) && !("go_prep_signed_in_v1" in calls.put[0].progress), JSON.stringify(calls.put[0]));

    // Signed in: the plan checkbox works and the change is pushed.
    await p.locator(".plan-task input[type=checkbox]").first().click();
    const planNow = await p.evaluate(() => {
      const id = document.querySelector(".plan-task input[type=checkbox]").id.replace("plan-task-", "");
      return { id, done: JSON.parse(localStorage.getItem("go_prep_plan_v1") || "{}").done || {} };
    });
    ok(`${w}: signed in, the plan checkbox is saved`, planNow.done[planNow.id] === true, JSON.stringify(planNow));
    await p.waitForFunction(() => /Сохранено на сервере/.test(document.getElementById("account-status").title), null, { timeout: 8000 });
    ok(`${w}: the change is pushed with the next version`, calls.put.length === 2 && calls.put[1].version === 1 && "go_prep_plan_v1" in calls.put[1].progress, JSON.stringify(calls.put.map(c => c.version)));

    // Reload: signs in again by itself (no click), twice in a row.
    for (const k of [1, 2]) {
      const before = calls.authorize.length;
      await p.reload();
      await signedIn(p);
      ok(`${w}: reload ${k} signs in again without a click`, calls.authorize.length === before + 1 && p.url() === base + "#/plan/w3/tue", `${calls.authorize.length} ${p.url()}`);
    }

    // Practice: failing then passing check; solved badge.
    await p.evaluate(() => (location.hash = "#/practice/p-money"));
    await p.waitForTimeout(300);
    await p.fill("#practice-solution-p-money", "package money // bad");
    await p.locator(".practice-section .btn", { hasText: "Проверить на сервере" }).click();
    await p.waitForSelector(".practice-check-result li", { timeout: 5000 });
    const bad = await p.evaluate(() => ({ text: document.querySelector(".practice-check-result").innerText, solved: localStorage.getItem("go_prep_practice_v1") }));
    ok(`${w}: failing check lists the failed test and the race`, /Не прошли 1 из 2/.test(bad.text) && /TestString/.test(bad.text) && /гонку данных/.test(bad.text) && !bad.solved, bad.text);
    await p.fill("#practice-solution-p-money", "package money // good");
    await p.locator(".practice-section .btn", { hasText: "Проверить на сервере" }).click();
    await p.waitForFunction(() => /Все тесты прошли/.test(document.querySelector(".practice-check-result").innerText), null, { timeout: 5000 });
    const solved = await p.evaluate(() => JSON.parse(localStorage.getItem("go_prep_practice_v1") || "{}"));
    ok(`${w}: passing check marks the task solved`, Boolean(solved["p-money"]), JSON.stringify(solved));
    await p.evaluate(() => (location.hash = "#/practice"));
    await p.waitForTimeout(200);
    const badge = await p.evaluate(() => [...document.querySelectorAll(".practice-index-item strong")].find(s => s.textContent.includes("W1-1")).textContent);
    ok(`${w}: index shows the solved badge`, badge.startsWith("✅"), badge);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no overflow when signed in`, ov <= 0, ov);

    // Another device saved different progress: the user chooses.
    server.progress = { go_prep_progress_v2: JSON.stringify({ c2: "review" }) };
    server.version = 7;
    server.updatedAt = "2026-10-28T10:00:00Z";
    await p.reload(); // signs in by itself and finds the difference
    await p.waitForSelector("#sync-choice:not(.hidden) button", { timeout: 8000 });
    ok(`${w}: different server progress asks which to keep`, await p.isVisible("#sync-choice button:has-text('Взять с сервера')"));
    await p.click("#sync-choice button:has-text('Взять с сервера')");
    await signedIn(p);
    const taken = await p.evaluate(() => ({ cards: localStorage.getItem("go_prep_progress_v2"), plan: localStorage.getItem("go_prep_plan_v1"), hint: localStorage.getItem("go_prep_signed_in_v1") }));
    ok(`${w}: taking the server progress replaces local keys and keeps the session`, taken.cards === JSON.stringify({ c2: "review" }) && taken.plan === null && taken.hint === "1", JSON.stringify(taken));

    // Sign out: Cognito logout, the hint is gone, the next visit is read-only.
    await p.click("#account .account-signout");
    await p.waitForURL(u => u.toString().startsWith(`${AUTH}/logout`), { timeout: 5000 });
    const lo = new URL(p.url());
    ok(`${w}: sign-out uses Cognito logout`, lo.searchParams.get("client_id") === CLIENT && lo.searchParams.get("logout_uri") === base, p.url());
    const count = calls.authorize.length;
    await p.goto(base + "#/practice/p-money");
    await p.waitForTimeout(500);
    ok(`${w}: after sign-out the site stays signed out`, calls.authorize.length === count && await p.isVisible("#account .account-signin"), `${calls.authorize.length} vs ${count}`);

    // Draft survives the sign-in redirect from the practice page.
    await p.fill("#practice-solution-p-money", "package money // draft");
    await p.locator(".practice-section .btn", { hasText: "Войти и проверить" }).click();
    await signedIn(p);
    ok(`${w}: draft survives the sign-in redirect`, (await p.inputValue("#practice-solution-p-money")) === "package money // draft");
    ok(`${w}: no console errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  // A forged return (wrong state) does not sign in.
  {
    const ctx = await b.newContext();
    const calls = await setup(ctx, {});
    const p = await ctx.newPage();
    await p.goto(base + "?code=evil&state=forged#/cards");
    await p.waitForTimeout(500);
    const forged = await p.evaluate(() => ({ signed: Boolean(document.querySelector(".account-avatar")), url: location.href }));
    ok("forged state is rejected and the code is not exchanged", !forged.signed && calls.token.length === 0 && /^#\/cards(\/c\d+)?$/.test(forged.url.slice(base.length)) && !forged.url.includes("code="), JSON.stringify(forged));
    await ctx.close();
  }

  // The automatic sign-in fails (access denied): no redirect loop, read-only.
  {
    const ctx = await b.newContext();
    const calls = await setup(ctx, {}, { deny: true });
    const p = await ctx.newPage();
    await p.goto(base + "#/plan");
    await p.evaluate(() => localStorage.setItem("go_prep_signed_in_v1", "1"));
    await p.reload();
    await p.waitForTimeout(800);
    await p.reload();
    await p.waitForTimeout(800);
    const st = await p.evaluate(() => ({ signedOut: Boolean(document.querySelector(".account-signin")), hint: localStorage.getItem("go_prep_signed_in_v1") }));
    ok("a denied automatic sign-in does not loop", calls.authorize.length === 1 && st.signedOut && st.hint === null, `${calls.authorize.length} ${JSON.stringify(st)}`);
    await ctx.close();
  }
  await b.close();
  console.log(`${n - fails}/${n} passed`);
})();
