// Acceptance criteria rendering for weeks 1–5 and regression of other routes.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const results = []; const ok = (n, c, x = "") => results.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(base + "#/plan/w1"); await p.waitForSelector("#plan-week-title");

  const expect = await p.evaluate(() => PLAN.weeks.slice(0, 5).map(w => {
    const tasks = w.days.flatMap(d => d.tasks);
    return { id: w.id,
      withAccept: tasks.filter(t => PLAN.acceptance[t.id] || t.lc).length,
      withGap: tasks.filter(t => PLAN.acceptance[t.id] && PLAN.acceptance[t.id].exercise).length,
      requiredWithout: tasks.filter(t => !t.optional && !PLAN.acceptance[t.id] && !t.lc).map(t => t.id) };
  }));
  for (const w of expect) {
    await p.goto(base + `#/plan/${w.id}`); await p.waitForTimeout(150);
    const accepts = await p.locator(".plan-accept").count();
    const gaps = await p.locator(".plan-gap").count();
    ok(`${w.id}: criterion rendered for every task with one`, accepts === w.withAccept, `${accepts}/${w.withAccept}`);
    ok(`${w.id}: missing-exercise notes rendered`, gaps === w.withGap, `${gaps}/${w.withGap}`);
    ok(`${w.id}: every required task has a criterion`, w.requiredWithout.length === 0, w.requiredWithout.join(","));
  }
  await p.goto(base + "#/plan/w1"); await p.waitForTimeout(150);
  const tue3 = await p.locator(".plan-task:has(#plan-task-w1-tue-3) .plan-accept").textContent();
  ok("w1-tue-3 shows its own criterion", tue3.startsWith("Готово, когда:") && tue3.includes("12.50 EUR"), tue3.slice(0, 60));
  const lcText = await p.locator(".plan-task:has(#plan-task-w1-mon-3) .plan-accept").textContent();
  ok("LeetCode task without entry uses shared criterion", lcText.includes("за 30 минут вслух"), lcText.slice(0, 60));
  ok("criterion sits before the hint", await p.evaluate(() => {
    const li = document.querySelector("#plan-task-w1-mon-3").closest("li");
    const a = li.querySelector(".plan-accept"), h = li.querySelector(".plan-hint");
    return Boolean(a && h && (a.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING));
  }));
  ok("week 7+ has no week-specific criteria", await p.evaluate(() => Object.keys(PLAN.acceptance).every(id => /^w[1-6]-/.test(id))));

  // Criterion text is inserted as text, not markup.
  const injected = await p.evaluate(() => {
    PLAN.acceptance["w1-mon-1"] = { accept: "<img src=x onerror=window.__x=1>", exercise: "<b>bold</b>" };
    renderPlan("w1"); const li = document.querySelector("#plan-task-w1-mon-1").closest("li");
    return { imgs: li.querySelectorAll(".plan-accept img, .plan-accept b").length, text: li.querySelector(".plan-accept").textContent };
  });
  ok("criterion text is not parsed as HTML", injected.imgs === 0 && injected.text.includes("<img"), JSON.stringify(injected).slice(0, 80));
  await p.reload(); await p.waitForSelector("#plan-week-title");

  // Optional secondary-source tasks do not count toward required totals.
  await p.goto(base + "#/plan/w1"); await p.waitForTimeout(150);
  ok("100 Go Mistakes in week 1 is optional", await p.locator(".plan-task.is-optional:has(#plan-task-w1-thu-3)").count() === 1);
  await p.goto(base + "#/plan/w3"); await p.waitForTimeout(150);
  ok("100 Go Mistakes in week 3 is optional", await p.locator(".plan-task.is-optional:has(#plan-task-w3-sat-2)").count() === 1);

  // Progress compatibility: a mark saved under v21 data for a task that became optional still loads.
  await p.evaluate(() => localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-10-12", done: { "w1-thu-3": true, "w3-sat-2": true } })));
  await p.reload(); await p.waitForSelector("#plan-week-title");
  await p.goto(base + "#/plan/w3"); await p.waitForTimeout(150);
  ok("saved mark on now-optional task is kept", await p.isChecked("#plan-task-w3-sat-2"));

  // Other routes still render.
  for (const [hash, sel] of [["#/cards/c1", "#view-cards"], ["#/quiz/q22", "#view-quiz"], ["#/simulators/sim2", "#view-simulators"], ["#/cheatsheet", "#view-cheatsheet"], ["#/wiki", "#view-wiki"]]) {
    await p.goto(base + hash); await p.waitForTimeout(200);
    ok(`route ${hash} visible`, await p.isVisible(sel));
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(results.join("\n"));
  console.log(`${results.filter(r => r.startsWith("PASS")).length}/${results.length} passed`);
  await b.close();
})();
