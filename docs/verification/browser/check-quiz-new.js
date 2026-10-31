const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };
  for (const w of [390, 1280]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => m.type() === "error" && errors.push(m.text()));
    await p.goto("http://127.0.0.1:8765/#/quiz"); await p.waitForTimeout(500);
    const tab = await p.textContent('[data-route="quiz"]');
    ok(`${w}: tab count`, /\b47$/.test(tab.trim()), tab);
    for (const id of ["q23", "q24", "q25", "q26", "q27"]) {
      await p.goto(`http://127.0.0.1:8765/#/quiz/${id}`); await p.waitForTimeout(300);
      const r = await p.evaluate(id => {
        const q = QUIZ_QUESTIONS.find(x => x.id === id);
        const text = document.body.innerText;
        return { title: text.includes(q.title), code: text.includes(q.code.split("\n")[0]), overflow: document.documentElement.scrollWidth - window.innerWidth };
      }, id);
      ok(`${w}: ${id} rendered`, r.title && r.code, JSON.stringify(r));
      ok(`${w}: ${id} no overflow`, r.overflow <= 0, r.overflow);
    }
    ok(`${w}: no console errors`, errors.length === 0, errors.join(" | "));
  }
  await b.close(); console.log(`${n - fails}/${n} passed`);
})();
