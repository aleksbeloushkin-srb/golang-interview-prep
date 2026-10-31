const { chromium } = require("playwright");
(async () => {
  const out = process.argv[2]; const base = "http://127.0.0.1:8765/";
  const browser = await chromium.launch();
  const results = []; const ok = (name, cond, extra="") => results.push(`${cond ? "PASS" : "FAIL"} ${name} ${extra}`);
  for (const width of [1440, 390, 320]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.clock.setFixedTime(new Date("2026-10-26T18:00:00+01:00"));
    await page.goto(base + "#/plan");
    await page.waitForSelector("#plan-week-title");
    const title = await page.textContent("#plan-week-title");
    ok(`[${width}] current week is 3`, title.startsWith("Неделя 3."), title);
    const today = await page.textContent(".plan-today");
    ok(`[${width}] today banner`, today.includes("неделя 3, Пн"), today.trim());
    ok(`[${width}] plan section visible`, await page.isVisible("#view-plan") && !(await page.isVisible("#view-cards")));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`[${width}] no page overflow`, overflow <= 0, `overflow=${overflow}`);
    if (width === 1440) {
      await page.check("#plan-task-w3-mon-1");
      await page.reload(); await page.waitForSelector("#plan-week-title");
      ok("checkbox persists after reload", await page.isChecked("#plan-task-w3-mon-1"));
      ok("week chip counter", (await page.textContent('[data-plan-week="w3"] .plan-chip-count')) === "1/17");
      await page.click('[data-plan-week="w2"]'); await page.waitForTimeout(150);
      ok("navigate to week 2", (await page.textContent("#plan-week-title")).startsWith("Неделя 2."));
      ok("week 2 predict block", (await page.locator(".plan-predict").count()) === 10);
      ok("focus moved to heading", await page.evaluate(() => document.activeElement && document.activeElement.id === "plan-week-title"));
      await page.goto(base + "#/plan/w1/sat"); await page.waitForTimeout(200);
      ok("deep link week1 sat", (await page.textContent("#plan-week-title")).startsWith("Неделя 1."));
      await page.click('a[href="#/cards/c34"] >> nth=0'); await page.waitForTimeout(200);
      ok("link to card opens cards view", await page.isVisible("#view-cards") && (await page.textContent("#card-q-en")).includes("method sets"));
      await page.goBack(); await page.waitForTimeout(200);
      ok("back returns to plan", await page.isVisible("#view-plan"));
      for (const r of ["cards", "simulators", "wiki", "cheatsheet", "quiz"]) {
        await page.goto(base + "#/" + r); await page.waitForTimeout(100);
        ok(`route ${r} still works`, await page.isVisible("#view-" + r) && !(await page.isVisible("#view-plan")));
      }
      // corrupted storage
      await page.evaluate(() => localStorage.setItem("go_prep_plan_v1", "{bad json"));
      await page.goto(base + "#/plan/w4"); await page.reload(); await page.waitForSelector("#plan-week-title");
      ok("corrupted storage handled", (await page.textContent("#plan-storage-notice")).includes("Не удалось"));
      await page.goto(base + "#/plan/w3"); await page.waitForTimeout(200);
      if (out) await page.screenshot({ path: `${out}/plan-desktop.png`, fullPage: false });
    } else {
      if (out) await page.screenshot({ path: `${out}/plan-${width}.png`, fullPage: false });
    }
    ok(`[${width}] no JS errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
  await browser.close();
  console.log(results.join("\n"));
})();
