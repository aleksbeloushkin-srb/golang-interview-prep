// Calendar controls (start this week, shift, current week N, reset) and EN model answers.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  const p = await ctx.newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.clock.setFixedTime(new Date("2026-10-28T19:00:00+01:00")); // Wednesday
  await p.goto(base + "#/plan"); await p.waitForSelector("#plan-week-title");
  const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem("go_prep_plan_v1") || "null"));
  const status = () => p.textContent(".plan-calendar-status");

  const openDates = () => p.evaluate(() => { const d = document.getElementById("plan-dates"); if (d && !d.open) d.querySelector("summary").click(); });
  ok("dates collapsed by default", await p.evaluate(() => !document.getElementById("plan-dates").open));
  ok("today banner before dates and chips", await p.evaluate(() => {
    const t = document.getElementById("plan-today"), d = document.getElementById("plan-dates"), c = document.querySelector(".plan-weeks");
    return Boolean(t.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(t.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
  }));
  ok("today banner on first screen at 390", await p.evaluate(() => document.getElementById("plan-today").getBoundingClientRect().bottom < 700));
  ok("summary shows status", (await status()).includes("изменить"), await status());
  await openDates();
  ok("dates open on click", await p.evaluate(() => document.getElementById("plan-dates").open));
  ok("reset label names the date", await p.locator("text=Сбросить на 12.10").count() === 1);
  ok("default: week 3 on Wed 28.10", (await status()).includes("12.10.2026") && (await status()).includes("сейчас неделя 3"), await status());
  await p.check("#plan-task-w3-mon-1");

  await p.click("text=Я начал на этой неделе"); await p.waitForTimeout(150);
  let s = await saved();
  ok("«Я начал» sets Monday of this week", s.start === "2026-10-26", s.start);
  ok("marks kept after start change", s.done["w3-mon-1"] === true);
  ok("status shows week 1", (await status()).includes("сейчас неделя 1"));
  ok("today banner follows: week 1, Ср", (await p.textContent("#plan-today")).includes("неделя 1, Ср"), (await p.textContent("#plan-today")).trim());
  const note = await p.textContent("#plan-start-note");
  ok("note says previous date", note.includes("было 12.10.2026") && note.includes("Отметки задач не изменились"), note);
  ok("focus moves to the note", await p.evaluate(() => document.activeElement && document.activeElement.id === "plan-start-note"));

  await p.click("text=План на неделю позже →"); await p.waitForTimeout(150);
  s = await saved();
  ok("shift later: start +7, before start", s.start === "2026-11-02" && (await status()).includes("до старта"), `${s.start} ${await status()}`);
  await p.click("text=← План на неделю раньше"); await p.click("text=← План на неделю раньше"); await p.waitForTimeout(150);
  s = await saved();
  ok("shift earlier twice: week 2", s.start === "2026-10-19" && (await status()).includes("сейчас неделя 2"), s.start);

  await p.selectOption("#plan-current-week", "5"); await p.waitForTimeout(150);
  s = await saved();
  ok("«Сейчас я на неделе 5» → start 5 weeks back", s.start === "2026-09-28" && (await status()).includes("сейчас неделя 5"), s.start);
  ok("current chip is week 5", await p.locator('.plan-chip.is-current[data-plan-week="w5"]').count() === 1);

  await p.goto(base + "#/plan/w2"); await p.waitForTimeout(150);
  ok("URL week kept; note cleared after navigation", (await p.textContent("#plan-week-title")).startsWith("Неделя 2.") && await p.locator("#plan-start-note").count() === 0);
  await p.click("text=Сбросить на 12.10"); await p.waitForTimeout(150);
  s = await saved();
  ok("reset returns default start", s.start === "2026-10-12", s.start);
  ok("week from URL stays after reset", (await p.textContent("#plan-week-title")).startsWith("Неделя 2."));
  ok("dates stay open after a change", await p.evaluate(() => document.getElementById("plan-dates").open));
  await p.reload(); await p.waitForSelector("#plan-week-title");
  ok("start persists after reload", (await status()).includes("12.10.2026"));
  ok("dates collapsed again after reload", await p.evaluate(() => !document.getElementById("plan-dates").open));

  // Date input still snaps to Monday.
  await p.click(".plan-settings summary");
  await p.fill("#plan-start", "2026-11-04"); await p.waitForTimeout(150);
  s = await saved();
  ok("date input snaps Wednesday to Monday", s.start === "2026-11-02", s.start);
  ok("date input opens dates block with note", await p.evaluate(() => document.getElementById("plan-dates").open) && (await p.textContent("#plan-start-note")).includes("понедельник"));
  await p.click("text=Сбросить на 12.10"); await p.waitForTimeout(100);

  // Keyboard: buttons and select reachable and labelled.
  ok("select has a label", await p.evaluate(() => Boolean(document.querySelector('label[for="plan-current-week"]'))));
  await p.focus("text=Я начал на этой неделе"); await p.keyboard.press("Enter"); await p.waitForTimeout(150);
  ok("Enter on «Я начал» works", (await saved()).start === "2026-10-26");
  await p.click("text=Сбросить на 12.10"); await p.waitForTimeout(100);

  // Model answers weeks 1–3.
  for (const [week, count] of [["w1", null], ["w2", null], ["w3", null]]) {
    await p.goto(base + `#/plan/${week}`); await p.waitForTimeout(150);
    const expected = await p.evaluate(w => PLAN.weeks.find(x => x.id === w).days.flatMap(d => d.tasks).filter(t => PLAN.modelAnswers[t.id]).length, week);
    const shown = await p.locator(".plan-model").count();
    ok(`${week}: model answers rendered`, shown === expected && shown > 0, `${shown}/${expected}`);
    ok(`${week}: model answers collapsed by default`, await p.locator(".plan-model[open]").count() === 0);
  }
  await p.goto(base + "#/plan/w1"); await p.waitForTimeout(150);
  await p.click(".plan-task:has(#plan-task-w1-wed-3) .plan-model summary");
  const m = await p.textContent(".plan-task:has(#plan-task-w1-wed-3) .plan-model");
  ok("w1-wed-3 answer opens and is English", m.includes("Remember: Wrap with %w; Is compares, As extracts.") && m.includes("errors.As finds"), m.slice(0, 60));
  ok("lang=en on answer", await p.locator('.plan-task:has(#plan-task-w1-wed-3) .plan-model p[lang="en"]').count() === 2);
  await p.goto(base + "#/plan/w4"); await p.waitForTimeout(150);
  ok("week 4 has no model answers yet", await p.locator(".plan-model").count() === 0);

  // Overflow with calendar and open answers.
  for (const [width, zoom] of [[320, 1], [320, 2], [390, 2], [430, 1], [1440, 1]]) {
    const q = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
    const over = [];
    for (const w of ["w1", "w2", "w3"]) {
      await q.goto(base + `#/plan/${w}`); await q.waitForSelector("#plan-week-title");
      await q.evaluate(() => { const d = document.getElementById("plan-dates"); if (!d.open) d.querySelector("summary").click(); });
      await q.click("text=Я начал на этой неделе"); await q.waitForTimeout(100);
      const o = await q.evaluate(z => { document.documentElement.style.fontSize = (z * 100) + "%"; document.querySelectorAll("#view-plan details").forEach(d => d.open = true);
        return document.documentElement.scrollWidth - document.documentElement.clientWidth; }, zoom);
      if (o > 0) over.push(`${w}:${o}`);
    }
    ok(`no overflow ${width}px ×${zoom}`, over.length === 0, over.join(" "));
    await q.close();
  }
  // Read-only (backend configured, signed out): hint next to the calendar, no jump to the top.
  {
    const r = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
    await r.clock.setFixedTime(new Date("2026-10-28T19:00:00+01:00"));
    await r.goto("http://127.0.0.1:8767/#/plan"); await r.waitForSelector("#plan-week-title");
    await r.evaluate(() => { const d = document.getElementById("plan-dates"); d.querySelector("summary").click(); });
    ok("RO: hint shown before any click", (await r.textContent("#plan-dates")).includes("только просмотр"));
    const btn = r.locator("#plan-dates button", { hasText: "Я начал на этой неделе" });
    await r.evaluate(() => window.scrollTo(0, 200));
    const y0 = await r.evaluate(() => scrollY);
    await btn.click(); await r.waitForTimeout(200);
    const y1 = await r.evaluate(() => scrollY);
    const n = await r.textContent("#plan-start-note");
    ok("RO: note says sign-in needed", n.includes("Без входа дата не меняется"), n);
    ok("RO: sign-in button inside note", await r.locator("#plan-start-note button", { hasText: "Войти через Google" }).count() === 1);
    ok("RO: start not saved", await r.evaluate(() => localStorage.getItem("go_prep_plan_v1") === null || JSON.parse(localStorage.getItem("go_prep_plan_v1")).start === "2026-10-12"));
    ok("RO: no jump to top", Math.abs(y1 - y0) < 150 && y1 > 0, `${y0}→${y1}`);
    ok("RO: top notice not used", await r.evaluate(() => document.getElementById("signin-notice").classList.contains("hidden")));
    ok("RO: note visible in viewport", await r.evaluate(() => { const b = document.getElementById("plan-start-note").getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; }));
    await r.click("text=Сбросить на 12.10"); await r.waitForTimeout(150);
    ok("RO: reset also explains", (await r.textContent("#plan-start-note")).includes("Без входа"));
    await r.close();
  }
  ok("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(res.join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
