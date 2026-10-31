// New device: no local progress, the server has some → taken without asking.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8767/";
const AUTH = "https://golang-interview-prep.auth.eu-north-1.amazoncognito.com";
const API = "https://gp33wjlm10.execute-api.eu-north-1.amazonaws.com";
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
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    const server = { progress: { go_prep_progress_v2: JSON.stringify({ c5: "mastered" }), go_prep_plan_v1: JSON.stringify({ done: { "w1-mon-1": true } }) }, version: 3, updatedAt: "2026-10-28T10:00:00Z" };
    const calls = await setup(ctx, server);
    const p = await ctx.newPage();
    const errors = []; p.on("pageerror", e => errors.push(e.message));
    let loads = 0; p.on("load", () => loads++);
    await p.goto(base + "#/cards"); await p.waitForTimeout(300);
    await p.click("#account .account-signin");
    await signedIn(p);
    await p.waitForFunction(() => localStorage.getItem("go_prep_progress_v2"), null, { timeout: 8000 });
    await signedIn(p); await p.waitForTimeout(800);
    const st = await p.evaluate(() => ({ cards: localStorage.getItem("go_prep_progress_v2"), plan: localStorage.getItem("go_prep_plan_v1"),
      choice: !document.getElementById("sync-choice").classList.contains("hidden"), status: (document.querySelector("#account .account-status") || {}).dataset?.kind,
      title: (document.querySelector("#account .account-status") || {}).title || "" }));
    ok(`${w}: server progress taken without the choice panel`, st.cards === server.progress.go_prep_progress_v2 && st.plan === server.progress.go_prep_plan_v1 && !st.choice, JSON.stringify(st));
    ok(`${w}: page reloaded once and nothing pushed over the server`, loads >= 2 && calls.put.length === 0, `loads=${loads} puts=${calls.put.length}`);
    ok(`${w}: status says in sync`, st.status === "ok", JSON.stringify(st));
    ok(`${w}: no page errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n") || "(no failures)");
  console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
