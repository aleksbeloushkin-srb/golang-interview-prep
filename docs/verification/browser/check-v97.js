// v97: fixes from the v96 review (Codex, docs/reviews/2026-11-22-v96/): no horizontal scroll at a 200% root font on 390 px
// for every practicum guide, the plan of week 3 and the new pages (V96-1); LC 268 may move to the week's reserve; q57
// is labelled as a diagnostic question before the guide on shifts.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  for (const route of ["#/practice/week3-reviews", "#/practice/go-bits", "#/practice/go-testing", "#/practice/go-types", "#/practice/go-prep", "#/practice/p-perm", "#/practice/p-allocate", "#/plan/w3", "#/cards/c73"]) {
    await p.goto(base + route); await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
      document.querySelectorAll("details").forEach(d => { d.open = true; });
      return new Promise(done => requestAnimationFrame(() => done({ sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth })));
    });
    ok(`200% font, 390 px: ${route} has no horizontal scroll`, r.sw <= r.vw, JSON.stringify(r));
    await p.evaluate(() => { document.documentElement.style.fontSize = ""; });
  }
  await p.goto(base + "#/plan/w3"); await p.waitForSelector("#plan-task-w3-wed-6");
  const texts = await p.evaluate(() => ({
    wed: document.querySelector("li:has(#plan-task-w3-wed-6)").innerText,
    mon: document.querySelector("li:has(#plan-task-w3-mon-5)").innerText
  }));
  ok("LC 268 may move to the reserve of the week", /в резерв недели/.test(texts.wed) && /LeetCode 136/.test(texts.wed), texts.wed.slice(0, 160));
  ok("q57 is a diagnostic question before the guide", /для диагностики/.test(texts.mon), texts.mon.slice(0, 160));
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
