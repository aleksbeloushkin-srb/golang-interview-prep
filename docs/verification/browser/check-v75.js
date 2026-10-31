// v75: card→diagram links from simId only, back-links on every diagram, cheat sheet rows 13–17.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await p.goto("http://127.0.0.1:8765/#/simulators"); await p.waitForTimeout(600);
    const sims = await p.evaluate(() => SIMULATORS.map(s => {
      const el = document.getElementById(s.id);
      const links = [...el.querySelectorAll(".diagram-cards a")].map(a => a.getAttribute("href").replace("#/cards/", ""));
      const expect = CARDS.filter(c => c.simId === s.id || c.id === s.cardId).map(c => c.id);
      return { id: s.id, links, expect };
    }));
    for (const s of sims) ok(`${w}: ${s.id} lists its cards`, s.links.length > 0 && JSON.stringify(s.links) === JSON.stringify(s.expect), s.links.join(","));
    ok(`${w}: sim9 reachable from a card list`, sims.find(s => s.id === "sim9").links.includes("c31"));
    // Card → diagram button for cards formerly only in CARD_TO_SIM.
    for (const [id, sim] of [["c21", "sim8"], ["c1", "sim1"], ["c45", "sim10"], ["c15", "sim12"]]) {
      await p.goto(`http://127.0.0.1:8765/#/cards/${id}`); await p.waitForTimeout(300);
      const hrefs = await p.evaluate(() => [...document.querySelectorAll("a")].map(a => a.getAttribute("href")));
      ok(`${w}: ${id} links to ${sim}`, hrefs.includes(`#/simulators/${sim}`));
    }
    await p.goto("http://127.0.0.1:8765/#/cheatsheet"); await p.waitForTimeout(400);
    const rows = await p.evaluate(() => [...document.querySelectorAll("#cheatsheet-tbody tr")].map(tr => ({ t: tr.querySelector("td").innerText, sim: tr.querySelector('a[href^="#/simulators/"]')?.getAttribute("href") || "", txt: tr.innerText })));
    ok(`${w}: cheat sheet has 17 rows`, rows.length === 17, rows.length);
    for (const [n, sim] of [[13, "sim8"], [14, "sim9"], [15, "sim10"], [16, "sim11"], [17, "sim12"]]) ok(`${w}: row ${n} → ${sim}`, rows[n - 1].sim === `#/simulators/${sim}` && !/&amp;|<code>/.test(rows[n - 1].txt), rows[n - 1].t);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no horizontal overflow on cheat sheet`, ov <= 0, ov);
    await p.goto("http://127.0.0.1:8765/#/simulators/sim9"); await p.waitForTimeout(400);
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
