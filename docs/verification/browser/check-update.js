// New-version banner: shows when index.html on the server has another ?v=, "Позже" waits for the next release.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
let pass = 0, fail = 0;
const ok = (c, n, x = "") => { if (c) { pass++; console.log("PASS", n, x); } else { fail++; console.log("FAIL", n, x); } };
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const open = async (vp, serverVersion) => {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(e.message));
    const calls = { n: 0 };
    let version = serverVersion;
    await p.route(/\?vcheck=\d+$/, async route => {
      calls.n++;
      if (version === "down") return route.fulfill({ status: 503, body: "" });
      const res = await route.fetch({ url: base });
      const html = (await res.text()).replace(/\?v=\d+/g, version ? `?v=${version}` : "$&");
      await route.fulfill({ status: 200, contentType: "text/html", body: html });
    });
    await p.goto(base + "#/cards/c34");
    return { p, ctx, calls, setVersion: v => { version = v; } };
  };
  const shown = p => p.$eval("#update-banner", e => !e.classList.contains("hidden"));

  { // same version → nothing
    const { p, ctx, calls } = await open({ width: 1280, height: 900 }, null);
    await p.waitForTimeout(3600);
    ok(calls.n === 1 && !(await shown(p)), "same version: one check after load, no banner", `calls=${calls.n}`);
    await p.evaluate(() => checkSiteVersion()); await p.waitForTimeout(200);
    ok(calls.n === 1, "second check within 5 minutes is skipped");
    await ctx.close();
  }
  { // new version → banner; Позже; next release → banner again; Обновить reloads
    const { p, ctx, calls, setVersion } = await open({ width: 390, height: 844 }, "999");
    await p.waitForTimeout(3600);
    ok(await shown(p), "server has v999: banner shown");
    const box = await p.$eval("#update-banner", e => { const r = e.getBoundingClientRect(); return { top: r.top, right: r.right, w: innerWidth }; });
    ok(box.top >= 0 && box.right <= box.w, "banner within the screen on a phone", JSON.stringify(box));
    await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(100);
    ok(await p.$eval("#update-banner", e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }), "banner stays visible after scrolling");
    await p.click("#update-later");
    ok(!(await shown(p)), "Позже hides it");
    await p.evaluate(() => checkSiteVersion(true)); await p.waitForTimeout(300);
    ok(!(await shown(p)), "same new version is not shown again after Позже");
    setVersion("1000");
    await p.evaluate(() => checkSiteVersion(true)); await p.waitForTimeout(300);
    ok(await shown(p), "a newer release shows it again");
    const nav = p.waitForNavigation({ timeout: 5000 }).then(() => true, () => false);
    await p.click("#update-reload");
    ok(await nav, "Обновить reloads the page");
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => location.hash) === "#/cards/c34", "reload keeps the card");
    await ctx.close();
  }
  { // server down → silent
    const { p, ctx, calls } = await open({ width: 1280, height: 900 }, "down");
    await p.waitForTimeout(3600);
    ok(calls.n === 1 && !(await shown(p)), "server error: no banner");
    await ctx.close();
  }
  { // returning to the tab triggers the check
    const { p, ctx, calls, setVersion } = await open({ width: 1280, height: 900 }, null);
    await p.waitForTimeout(3600);
    setVersion("2000");
    await p.evaluate(() => { versionCheckedAt = 0; document.dispatchEvent(new Event("visibilitychange")); });
    await p.waitForTimeout(400);
    ok(calls.n === 2 && await shown(p), "visibilitychange → check → banner", `calls=${calls.n}`);
    await ctx.close();
  }
  ok(errors.length === 0, "no JS errors", errors.join(" | "));
  await b.close();
  console.log(`${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
