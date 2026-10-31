// v78: module 9 cards c57–c64 (render, answer, code, practice, overflow), the m9 filter chip, plan links from weeks 4–10, knowledge base.
// Optional argument: a folder for screenshots of c57 and c62 at 1280 and 390.
const { chromium } = require("playwright");
const shots = process.argv[2];
const IDS = ["c57", "c58", "c59", "c60", "c61", "c62", "c63", "c64"];
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  const cards = await (async () => {
    const p = await b.newPage(); await p.goto(base); await p.waitForTimeout(300);
    const r = await p.evaluate(ids => ids.map(id => { const c = CARDS.find(x => x.id === id); return c && { id, q: c.qEN, short: c.shortEN.slice(0, 40), mod: c.mod }; }), IDS);
    await p.close(); return r;
  })();
  ok("all module 9 cards exist in m9", cards.every(c => c && c.mod === "m9"), JSON.stringify(cards.map(c => c && c.id)));
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });
    for (const c of cards) {
      await p.goto(`${base}#/cards/${c.id}`); await p.waitForTimeout(250);
      const q = await p.$eval("#card-q-en", e => e.textContent.trim());
      ok(`${w}: ${c.id} question shown`, q === c.q, q.slice(0, 50));
      await p.click("#reveal-btn"); await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({
        short: document.getElementById("card-short-en").textContent.trim(),
        code: document.getElementById("card-code").textContent,
        practice: document.getElementById("card-practice").textContent.trim().length,
        refs: document.querySelectorAll("#card-references a[href^='https://']").length,
        overflow: document.documentElement.scrollWidth - innerWidth,
      }));
      ok(`${w}: ${c.id} answer revealed`, r.short.startsWith(c.short), r.short.slice(0, 40));
      ok(`${w}: ${c.id} code, practice and sources rendered`, r.code.length > 50 && r.practice > 50 && r.refs >= 2, `code=${r.code.length} practice=${r.practice} refs=${r.refs}`);
      ok(`${w}: ${c.id} no horizontal overflow`, r.overflow <= 0, r.overflow);
      if (shots && w !== 320 && (c.id === "c57" || c.id === "c62")) await p.screenshot({ path: `${shots}/${c.id}-${w}.png`, fullPage: true });
    }
    // The m9 chip filters the deck to the eight cards.
    await p.goto(`${base}#/cards`); await p.waitForTimeout(250);
    await p.$eval('#module-filter-row .chip[data-filter="m9"]', el => el.click()); await p.waitForTimeout(250);
    const counter = await p.$eval("#card-counter", e => e.textContent);
    const pressed = await p.$eval('#module-filter-row .chip[data-filter="m9"]', e => e.getAttribute("aria-pressed"));
    ok(`${w}: m9 chip shows 8 cards`, / из 8 /.test(counter + " ") && pressed === "true", counter);
    // Plan days link to the new cards.
    for (const [day, hrefs] of [["w5/mon", ["#/cards/c57", "#/cards/c58"]], ["w5/tue", ["#/cards/c60", "#/cards/c45"]], ["w7/mon", ["#/cards/c61"]], ["w8/tue", ["#/cards/c59", "#/cards/c63"]], ["w10/wed", ["#/cards/c62"]]]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      const r = await p.evaluate(h => ({ missing: h.filter(x => !document.querySelector(`a[href="${x}"]`)), gaps: document.querySelectorAll(".plan-gap").length }), hrefs);
      ok(`${w}: plan ${day} links and no gaps`, !r.missing.length && r.gaps === 0, JSON.stringify(r));
    }
    // Knowledge base lists every module 9 card.
    await p.goto(base + "#/wiki"); await p.waitForTimeout(400);
    const missing = await p.evaluate(ids => ids.filter(id => !document.querySelector(`#view-wiki a[href="#/cards/${id}"]`)), IDS);
    ok(`${w}: knowledge base links all module 9 cards`, missing.length === 0, missing.join(","));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no horizontal overflow on knowledge base`, ov <= 0, ov);
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
