// v83: заголовок вкладки и фокус при смене раздела; видимый фокус опор после H; подборка карточек после
// перезагрузки; две вкладки не стирают отметки друг друга (карточки и план).
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  const watch = (p, tag) => { p.on("pageerror", e => errors.push(`${tag}: ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${tag}: ${m.text()}`); }); };

  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage(); watch(p, w);
    await p.goto(`${base}#/cards/c1`); await p.waitForTimeout(400);
    ok(`${w}: cards title`, (await p.title()) === "Карточки — Go Interview Prep", await p.title());
    for (const [hash, title, focusId] of [["#/quiz", "Quiz — Go Interview Prep", "quiz-title"], ["#/simulators", "Диаграммы — Go Interview Prep", "sim-view-title"],
      ["#/cheatsheet", "Шпаргалка — Go Interview Prep", "cheatsheet-title"], ["#/wiki", "База знаний — Go Interview Prep", "wiki-title"], ["#/cards/c2", "Карточки — Go Interview Prep", "card-q-en"]]) {
      await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(300);
      const st = await p.evaluate(() => ({ title: document.title, focus: document.activeElement && document.activeElement.id }));
      ok(`${w}: ${hash} title and focus`, st.title === title && st.focus === focusId, JSON.stringify(st));
    }
    // Диаграмма по ссылке — фокус на её заголовок.
    await p.evaluate(() => { location.hash = "#/quiz"; }); await p.waitForTimeout(250);
    await p.evaluate(() => { location.hash = "#/simulators/sim3"; }); await p.waitForTimeout(400);
    ok(`${w}: deep link focuses the diagram title`, await p.evaluate(() => document.activeElement && document.activeElement.closest("#sim3") !== null && document.activeElement.tagName === "H3"));
    // Внутри раздела фокус не прыгает.
    await p.evaluate(() => { location.hash = "#/cards/c3"; }); await p.waitForTimeout(300);
    const focused = await p.evaluate(() => { const btn = [...document.querySelectorAll("#card-controls button")].find(x => x.checkVisibility()); btn.focus(); btn.dataset.probe = "1"; return document.activeElement === btn; });
    await p.evaluate(() => { location.hash = "#/cards/c4"; }); await p.waitForTimeout(300);
    ok(`${w}: card to card keeps focus`, focused && await p.evaluate(() => document.activeElement && document.activeElement.dataset.probe === "1"));
    // Опоры по H: фокус виден.
    await p.evaluate(() => document.activeElement.blur());
    await p.keyboard.press("h"); await p.waitForTimeout(200);
    const anchors = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { cls: a.className, outline: cs.outlineStyle, width: cs.outlineWidth }; });
    ok(`${w}: H shows a visible focus ring on anchors`, /card-anchors/.test(anchors.cls) && anchors.outline === "solid" && anchors.width !== "0px", JSON.stringify(anchors));
    // Подборка переживает перезагрузку.
    await p.evaluate(() => { setFilter("m3"); setLevel("senior"); }); await p.waitForTimeout(200);
    await p.reload(); await p.waitForTimeout(500);
    const view = await p.evaluate(() => ({ filter: state.filter, level: state.level, chip: document.querySelector('[data-filter="m3"]').getAttribute("aria-pressed"), mod: CARDS.find(c => c.id === state.shownCard)?.mod }));
    ok(`${w}: filter and level survive reload`, view.filter === "m3" && view.level === "senior" && view.chip === "true" && view.mod === "m3", JSON.stringify(view));
    await p.evaluate(() => { setFilter("all"); setLevel("all"); });
    await ctx.close();
  }

  // Две вкладки: обе стартуют с одного снимка, отмечают разное — сохраняется всё.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const a = await ctx.newPage(); watch(a, "tabA");
    await a.goto(`${base}#/cards/c1`); await a.waitForTimeout(400);
    await a.evaluate(() => { localStorage.removeItem("go_prep_progress_v2"); localStorage.removeItem("go_prep_plan_v1"); localStorage.removeItem("go_prep_attempts_v1"); });
    await a.reload(); await a.waitForTimeout(400);
    const bt = await ctx.newPage(); watch(bt, "tabB");
    await bt.goto(`${base}#/cards/c2`); await bt.waitForTimeout(400);
    await a.evaluate(() => { state.revealed = true; gradeCard("self"); });
    await bt.waitForTimeout(200);
    ok("tab B saw tab A's mark", await bt.evaluate(() => state.progress.c1 === "mastered"));
    await bt.evaluate(() => { location.hash = "#/cards/c2"; });
    await bt.waitForTimeout(200);
    await bt.evaluate(() => { state.revealed = true; gradeCard("anchors"); });
    const stored = await a.evaluate(() => JSON.parse(localStorage.getItem("go_prep_progress_v2")));
    ok("both card marks kept", stored.c1 === "mastered" && stored.c2 === "review", JSON.stringify(stored));
    ok("tab A progress bar updated", await a.evaluate(() => state.progress.c2 === "review"));
    // План: B открыт со старым снимком, A отмечает задачу, B — другую.
    await a.goto(`${base}#/plan/w1/mon`); await a.waitForSelector("#plan-week-title");
    await bt.goto(`${base}#/plan/w1/mon`); await bt.waitForSelector("#plan-week-title");
    await a.check("#plan-task-w1-mon-1"); await bt.waitForTimeout(200);
    ok("tab B shows tab A's plan tick", await bt.isChecked("#plan-task-w1-mon-1"));
    await bt.check("#plan-task-w1-mon-2");
    const plan = await a.evaluate(() => JSON.parse(localStorage.getItem("go_prep_plan_v1")).done);
    ok("both plan ticks kept", plan["w1-mon-1"] === true && plan["w1-mon-2"] === true, JSON.stringify(plan));
    await ctx.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
