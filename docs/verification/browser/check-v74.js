const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await p.goto("http://127.0.0.1:8765/#/plan/w3/thu"); await p.waitForTimeout(500);
    const hrefs = await p.evaluate(() => [...document.querySelectorAll("a")].map(a => a.getAttribute("href")).filter(Boolean));
    for (const h of ["#/cards/c55", "#/cards/c56", "#/simulators/sim11", "#/simulators/sim12", "#/quiz/q44", "#/quiz/q46", "#/quiz/q47"]) ok(`${w}: plan w3 thu links ${h}`, hrefs.some(x => x.startsWith(h)), "");
    for (const id of ["c55", "c56", "c15"]) {
      await p.goto(`http://127.0.0.1:8765/#/cards/${id}`); await p.waitForTimeout(400);
      await p.click("#reveal-btn"); await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({ text: document.body.innerText, tts: document.querySelectorAll(".tts-btn, [data-tts-key]").length, none: document.body.innerText.includes("записи пока нет"), ov: document.documentElement.scrollWidth - innerWidth }));
      ok(`${w}: ${id} answer shown`, r.text.length > 500 && r.ov <= 0, `ov=${r.ov}`);
      ok(`${w}: ${id} has related quiz or diagram`, /Задача 4[4-7]|Диаграмма|SIM1[12]/i.test(r.text), "");
    }
    for (const q of ["q44", "q45", "q46", "q47"]) {
      await p.goto(`http://127.0.0.1:8765/#/quiz/${q}`); await p.waitForTimeout(400);
      const t = await p.evaluate(() => document.body.innerText);
      ok(`${w}: ${q} rendered`, t.includes(`Задача ${q.slice(1)}`), "");
    }
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
