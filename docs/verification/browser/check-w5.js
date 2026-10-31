// Week 5 browser checks: cards c45–c48 (m7), quiz q36–q39, practice W5, diagram 10, plan links.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };
  for (const w of [320, 390, 1280]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => m.type() === "error" && errors.push(m.text()));
    await p.goto(base + "#/cards"); await p.waitForTimeout(300);
    await p.evaluate(() => setFilter("m7")); await p.waitForTimeout(150);
    const m7 = await p.evaluate(() => ({ mod: document.getElementById("card-module").textContent, chip: document.querySelector('[data-filter="m7"]').textContent }));
    ok(`${w}: m7 filter`, m7.mod.startsWith("7.") && m7.chip.includes("(4)"), JSON.stringify(m7));
    for (const id of ["c45", "c46", "c47", "c48"]) {
      await p.goto(base + "#/cards/" + id); await p.waitForTimeout(150);
      const r = await p.evaluate(id => { const c = CARDS.find(x => x.id === id); return { q: document.body.innerText.includes(c.qEN) || document.body.innerText.includes(c.qRU), ov: document.documentElement.scrollWidth - innerWidth }; }, id);
      ok(`${w}: card ${id}`, r.q && r.ov <= 0, JSON.stringify(r));
    }
    for (const id of ["q36", "q37", "q38", "q39"]) {
      await p.goto(base + "#/quiz/" + id); await p.waitForTimeout(200);
      const r = await p.evaluate(id => { const q = QUIZ_QUESTIONS.find(x => x.id === id); return { t: document.body.innerText.includes(q.title), radios: document.querySelectorAll(`input[name="${id}"]`).length, ov: document.documentElement.scrollWidth - innerWidth }; }, id);
      ok(`${w}: quiz ${id}`, r.t && r.radios === 6 && r.ov <= 0, JSON.stringify(r));
    }
    await p.goto(base + "#/simulators/sim10"); await p.waitForTimeout(400);
    const idx = await p.evaluate(() => SIMULATORS.findIndex(s => s.id === "sim10"));
    for (let k = 0; k < 8; k++) {
      await p.evaluate(([i, s]) => renderSimStep(i, s), [idx, k]); await p.waitForTimeout(80);
      const r = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, title: document.querySelector("#sim10").innerText.includes("Шаг") }));
      ok(`${w}: sim10 step ${k + 1}`, r.ov <= 0 && r.title, JSON.stringify(r));
    }
    ok(`${w}: sim10 chip in quick jump`, await p.isVisible('a[href="#/simulators/sim10"].chip'));
    for (const [day, hrefs] of [["w5/tue", ["#/practice/p-accountsapi", "#/practice/p-httperr", "#/cards/c45", "#/simulators/sim10", "#/quiz/q36", "#/quiz/q39"]], ["w5/wed", ["#/cards/c47"]], ["w5/thu", ["#/cards/c48", "#/quiz/q38"]]]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      const r = await p.evaluate(h => ({ missing: h.filter(x => !document.querySelector(`a[href="${x}"]`)), gaps: document.querySelectorAll(".plan-gap").length }), hrefs);
      ok(`${w}: plan ${day} links and no gaps`, !r.missing.length && r.gaps === 0, JSON.stringify(r));
    }
    ok(`${w}: no console errors`, errors.length === 0, errors.join(" | "));
  }
  await b.close(); console.log(`${n - fails}/${n} passed`);
})();
