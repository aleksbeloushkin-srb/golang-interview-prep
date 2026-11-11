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
  // Очередь повторения и «Продолжить занятие» (часы зафиксированы на 5 ноября 2026).
  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage(); watch(p, `session ${w}`);
    await p.clock.setFixedTime(new Date("2026-11-05T12:00:00+01:00"));
    await p.goto(`${base}#/cards/c1`); await p.waitForTimeout(300);
    await p.evaluate(() => {
      localStorage.clear(); sessionStorage.clear();
      localStorage.setItem("go_prep_progress_v2", JSON.stringify({ c1: "review", c2: "mastered", c3: "mastered" }));
      localStorage.setItem("go_prep_attempts_v1", JSON.stringify({
        c1: [{ d: "2026-11-01", r: "none" }],                                  // проверка 02.11 — просрочена
        c2: [{ d: "2026-11-04", r: "self" }],                                  // проверка 08.11
        c3: [{ d: "2026-10-01", r: "self" }, { d: "2026-10-20", r: "self" }]   // 20.10 + 8 = 28.10 — просрочена
      }));
      localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-11-02", done: {} })); // неделя 1
    });
    await p.reload(); await p.waitForTimeout(400);
    const bar = await p.textContent("#progress-text");
    ok(`${w}: progress says answered on last check and due count`, new RegExp(`ответил сам на последней проверке — 2 из ${await p.evaluate(() => CARDS.length)}`).test(bar) && /к повторению: 2/.test(bar), bar);
    await p.evaluate(() => { location.hash = "#/cards/c2"; }); await p.waitForTimeout(250);
    const pill = await p.textContent("#card-status");
    ok(`${w}: status shows next check`, pill === "Ответил сам ✓ · 04.11: сам · следующая проверка 08.11", pill);
    await p.evaluate(() => setFilter("review")); await p.waitForTimeout(200);
    const reviewIds = await p.evaluate(() => getFilteredCards().map(c => c.id));
    ok(`${w}: review filter = marked + due`, reviewIds.join() === "c1,c3", reviewIds.join());
    const label = await p.textContent("#view-cards [data-review-start]");
    ok(`${w}: start button counts due and new`, /^▶ Занятие до 10 карточек: к повторению 2, новых на неделе \d+$/.test(label), label);
    await p.click("#view-cards [data-review-start]"); await p.waitForTimeout(300);
    const s1 = await p.evaluate(() => ({ filter: state.filter, ids: getFilteredCards().map(c => c.id), shown: state.shownCard, focus: document.activeElement.id }));
    ok(`${w}: session starts with the most overdue, then week 1 cards`, s1.filter === "session" && s1.ids[0] === "c3" && s1.ids[1] === "c1" && s1.ids.length <= 10 && s1.ids.includes("c34") && s1.shown === "c3" && s1.focus === "card-q-en", JSON.stringify(s1));
    await p.evaluate(() => { state.revealed = true; gradeCard("self"); }); await p.waitForTimeout(200);
    ok(`${w}: graded card leaves the session`, await p.evaluate(() => state.shownCard === "c1" && !getFilteredCards().some(c => c.id === "c3")));
    await p.reload(); await p.waitForTimeout(400);
    const s2 = await p.evaluate(() => ({ filter: state.filter, shown: state.shownCard, label: document.querySelector("#view-cards [data-review-start]").textContent, left: getFilteredCards().length }));
    ok(`${w}: session survives reload`, s2.filter === "session" && s2.shown === "c1" && s2.label === `▶ Продолжить занятие: осталось ${s2.left}`, JSON.stringify(s2));
    // c3: «сам» третий раз подряд → проверка через 16 дней.
    ok(`${w}: c3 next check after third self`, await p.evaluate(() => cardSchedule("c3").due === "2026-11-21"));
    // Оценить всё — конец занятия.
    await p.evaluate(() => { while (getFilteredCards().length) { state.revealed = true; gradeCard("anchors"); } }); await p.waitForTimeout(200);
    const end = await p.evaluate(() => ({ title: document.getElementById("card-q-en").textContent, hint: document.getElementById("card-q-ru").textContent }));
    ok(`${w}: session end message`, /^Занятие закончено: \d+ из \d+$/.test(end.title) && /Следующая проверка — 07\.11/.test(end.hint), JSON.stringify(end));
    // С плана — кнопка ведёт в карточки.
    await p.goto(`${base}#/plan/w1`); await p.waitForSelector("#plan-week-title");
    await p.click("#view-plan [data-review-start]"); await p.waitForTimeout(400);
    ok(`${w}: plan button opens the session in cards`, await p.evaluate(() => location.hash.startsWith("#/cards") && state.filter === "session"));
    ok(`${w}: session not synced`, await p.evaluate(() => typeof syncSnapshot !== "function" || !("go_prep_session_v1" in (syncSnapshot() || {}))));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no overflow`, ov <= 0, ov);
    await ctx.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
