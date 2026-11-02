// v82: browser tab icon; module 10 cards c66–c72 (render, answer, code, practice, overflow), the m10 filter chip, plan links, quiz q53–q55, c59 version wording, knowledge base.
// Optional argument: a folder for screenshots of c66 and c68 at 1280 and 390.
const { chromium } = require("playwright");
const shots = process.argv[2];
const IDS = ["c66", "c67", "c68", "c69", "c70", "c71", "c72"];
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  const cards = await (async () => {
    const p = await b.newPage(); await p.goto(base); await p.waitForTimeout(300);
    const r = await p.evaluate(ids => ids.map(id => { const c = CARDS.find(x => x.id === id); return c && { id, q: c.qEN, short: c.shortEN.slice(0, 40), mod: c.mod }; }), IDS);
    await p.close(); return r;
  })();
  ok("all module 10 cards exist in m10", cards.every(c => c && c.mod === "m10"), JSON.stringify(cards.map(c => c && c.id)));
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
      if (shots && w !== 320 && (c.id === "c66" || c.id === "c68")) await p.screenshot({ path: `${shots}/${c.id}-${w}.png`, fullPage: true });
    }
    // The m9 chip filters the deck to the eight cards.
    await p.goto(`${base}#/cards`); await p.waitForTimeout(250);
    await p.$eval('#module-filter-row .chip[data-filter="m10"]', el => el.click()); await p.waitForTimeout(250);
    const counter = await p.$eval("#card-counter", e => e.textContent);
    const pressed = await p.$eval('#module-filter-row .chip[data-filter="m10"]', e => e.getAttribute("aria-pressed"));
    ok(`${w}: m10 chip shows 7 cards`, / из 7 /.test(counter + " ") && pressed === "true", counter);
    // Plan days link to the new cards.
    for (const [day, hrefs] of [["w4/mon", ["#/cards/c72"]], ["w5/thu", ["#/cards/c71"]], ["w6/mon", ["#/cards/c67"]], ["w6/tue", ["#/cards/c68"]], ["w6/wed", ["#/cards/c66"]], ["w10/wed", ["#/cards/c68", "#/cards/c70"]], ["w11/mon", ["#/cards/c70"]]]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      const r = await p.evaluate(h => ({ missing: h.filter(x => !document.querySelector(`a[href="${x}"]`)), gaps: document.querySelectorAll(".plan-gap").length }), hrefs);
      ok(`${w}: plan ${day} links and no gaps`, !r.missing.length && r.gaps === 0, JSON.stringify(r));
    }
    // Quiz q53–q55 render and link back to their cards; c59 names Go 1.26 for NotifyContext.
    for (const q of ["q53", "q54", "q55"]) {
      await p.goto(base + "#/quiz/" + q); await p.waitForTimeout(300);
      const r = await p.evaluate(id => { const o = document.getElementById(id + "-options"); return { options: o ? o.querySelectorAll("input").length : 0, overflow: document.documentElement.scrollWidth - innerWidth }; }, q);
      ok(`${w}: ${q} renders with its options`, r.options >= 4, r.options);
      ok(`${w}: ${q} no horizontal overflow`, r.overflow <= 0, r.overflow);
    }
    await p.goto(base + "#/cards/c59"); await p.waitForTimeout(250); await p.click("#reveal-btn"); await p.waitForTimeout(150);
    ok(`${w}: c59 says NotifyContext cause since Go 1.26`, await p.evaluate(() => /since Go 1\.26/.test(document.getElementById("card-details-en").textContent)));
    // Knowledge base lists every module 9 card.
    await p.goto(base + "#/wiki"); await p.waitForTimeout(400);
    const missing = await p.evaluate(ids => ids.filter(id => !document.querySelector(`#view-wiki a[href="#/cards/${id}"]`)), IDS);
    ok(`${w}: knowledge base links all module 10 cards`, missing.length === 0, missing.join(","));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no horizontal overflow on knowledge base`, ov <= 0, ov);
  }
  // Browser tab icon: SVG with PNG fallbacks, all served.
  {
    const p = await (await b.newContext()).newPage();
    await p.goto(base); await p.waitForTimeout(200);
    const links = await p.evaluate(() => [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')].map(l => l.getAttribute("href")));
    ok("favicon links in head", ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"].every(h => links.includes(h)), links.join(","));
    for (const f of ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"]) {
      const r = await p.request.get(base + f);
      ok(`${f} served`, r.status() === 200, r.status());
    }
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
