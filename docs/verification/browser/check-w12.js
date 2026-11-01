// Browser checks for weeks 1–2: cards c39–c44 (m6), quiz q28–q35, plan links and gaps.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };
  for (const w of [320, 390, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    // These checks click quiz options: run the quiz in the classic mode (answer-first is the default now).
    await ctx.addInitScript(() => { if (localStorage.getItem("go_prep_quiz_answer_first_v1") === null) localStorage.setItem("go_prep_quiz_answer_first_v1", "0"); });
    const p = await ctx.newPage();
    const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => m.type() === "error" && errors.push(m.text()));

    // Cards: module 6 filter and each new card.
    await p.goto(base + "#/cards"); await p.waitForTimeout(400);
    await p.evaluate(() => setFilter('m6')); await p.waitForTimeout(200);
    const m6 = await p.evaluate(() => ({ module: document.getElementById("card-module").textContent, chip: document.querySelector('[data-filter="m6"]').textContent, count: CARDS.filter(c => c.mod === "m6").length }));
    ok(`${w}: m6 filter shows module 6`, m6.module.startsWith("6.") && m6.chip.includes(`(${m6.count})`) && m6.count === 7, JSON.stringify(m6)); // c65 joined m6 in v80
    for (const id of ["c39", "c40", "c41", "c42", "c43", "c44"]) {
      await p.goto(base + "#/cards/" + id); await p.waitForTimeout(200);
      const r = await p.evaluate(id => {
        const c = CARDS.find(x => x.id === id);
        const t = document.body.innerText;
        return { q: t.includes(c.qEN) || t.includes(c.qRU), mod: document.getElementById("card-module").textContent === c.modName, overflow: document.documentElement.scrollWidth - window.innerWidth };
      }, id);
      ok(`${w}: card ${id} rendered`, r.q && r.mod, JSON.stringify(r));
      ok(`${w}: card ${id} no overflow`, r.overflow <= 0, r.overflow);
    }

    // Quiz: tab count and each new task, answer reveal for one.
    await p.goto(base + "#/quiz"); await p.waitForTimeout(300);
    const tab = await p.textContent('[data-route="quiz"]');
    ok(`${w}: quiz tab count`, /\b52$/.test(tab.trim()), tab);
    for (const id of ["q28", "q29", "q30", "q31", "q32", "q33", "q34", "q35"]) {
      await p.goto(base + "#/quiz/" + id); await p.waitForTimeout(250);
      const r = await p.evaluate(id => {
        const q = QUIZ_QUESTIONS.find(x => x.id === id);
        const t = document.body.innerText;
        return { title: t.includes(q.title), code: t.includes(q.code.split("\n")[0]), radios: document.querySelectorAll(`input[name="${id}"]`).length, overflow: document.documentElement.scrollWidth - window.innerWidth };
      }, id);
      ok(`${w}: quiz ${id} rendered with 6 options`, r.title && r.code && r.radios === 6, JSON.stringify(r));
      ok(`${w}: quiz ${id} no overflow`, r.overflow <= 0, r.overflow);
    }
    await p.goto(base + "#/quiz/q35"); await p.waitForTimeout(250);
    await p.click('input[name="q35"][value="1"]'); await p.waitForTimeout(200);
    const reveal = await p.evaluate(() => document.body.innerText.includes("t.Cleanup(db.Close)") || [...document.querySelectorAll("details summary")].some(s => s.textContent.includes("Исправленный")));
    ok(`${w}: q35 answer reveals the corrected example`, reveal);

    // Plan: weeks 1–2 link the new content and no longer list gaps.
    for (const [day, hrefs] of [["w1/tue", ["#/practice/p-money"]], ["w1/wed", ["#/practice/p-account", "#/practice/p-validation", "#/quiz/q28", "#/quiz/q29", "#/cards/c39"]], ["w1/thu", ["#/practice/p-deferpanic", "#/quiz/q31", "#/quiz/q32", "#/quiz/q30"]], ["w1/sat", ["#/cards/c40", "#/quiz/q33", "#/quiz/q34"]], ["w2/tue", ["#/practice/p-removeslice", "#/cards/c41"]], ["w2/wed", ["#/practice/p-generics", "#/cards/c42"]], ["w2/thu", ["#/cards/c43", "#/cards/c44", "#/quiz/q35"]], ["w2/sat", ["#/practice/p-txsum"]]]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      const r = await p.evaluate(hrefs => ({ missing: hrefs.filter(h => !document.querySelector(`a[href="${h}"]`)), gaps: document.querySelectorAll(".plan-gap").length, overflow: document.documentElement.scrollWidth - window.innerWidth }), hrefs);
      ok(`${w}: plan ${day} links new content`, r.missing.length === 0, r.missing.join(","));
      ok(`${w}: plan ${day} has no gaps`, r.gaps === 0, r.gaps);
      ok(`${w}: plan ${day} no overflow`, r.overflow <= 0, r.overflow);
    }
    const allGaps = await p.evaluate(() => Object.entries(PLAN.acceptance).filter(([k, v]) => /^w[12]-/.test(k) && v.exercise).map(([k]) => k));
    ok(`${w}: no exercise gaps left in weeks 1–2`, allGaps.length === 0, allGaps.join(","));

    // Wiki shows all cards.
    await p.goto(base + "#/wiki"); await p.waitForTimeout(400);
    const wiki = await p.evaluate(() => CARDS.every(c => document.body.innerText.includes(c.qEN) || document.body.innerText.includes(c.qRU)));
    ok(`${w}: wiki lists every card`, wiki);
    ok(`${w}: no console errors`, errors.length === 0, errors.join(" | "));
  }
  await b.close(); console.log(`${n - fails}/${n} passed`);
})();
