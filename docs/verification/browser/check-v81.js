// v81: reference project block in the knowledge base (link, reading order, card links) and plan refs to the repo.
const { chromium } = require("playwright");
const REPO = "https://github.com/aleksbeloushkin-srb/go-payments-reference";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });
    await p.goto(base + "#/wiki"); await p.waitForTimeout(400);
    const r = await p.evaluate(repo => {
      const box = document.querySelector("#view-wiki .wiki-project");
      if (!box) return null;
      const link = box.querySelector(`a[href="${repo}"]`);
      return {
        visible: box.offsetParent !== null,
        title: box.querySelector("h3")?.textContent || "",
        external: link ? link.target === "_blank" && /noopener/.test(link.rel) : false,
        cards: [...box.querySelectorAll('a[href^="#/cards/"]')].map(a => a.getAttribute("href")),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    }, REPO);
    ok(`${w}: block shown with title`, !!r && r.visible && /Pinkponies Bank/.test(r.title), r && r.title);
    ok(`${w}: repo link opens in a new tab safely`, !!r && r.external);
    ok(`${w}: reading order links cards`, !!r && ["c57", "c58", "c59", "c60", "c62", "c52", "c63", "c51"].every(id => r.cards.includes(`#/cards/${id}`)), r && r.cards.join(","));
    ok(`${w}: no horizontal overflow`, !!r && r.overflow <= 0, r && r.overflow);
    // A card link from the block opens the card.
    await p.$eval('#view-wiki .wiki-project summary', s => s.click());
    await p.$eval('#view-wiki .wiki-project a[href="#/cards/c62"]', a => a.click()); await p.waitForTimeout(400);
    ok(`${w}: card link opens C62`, await p.evaluate(() => location.hash === "#/cards/c62" && /C62/.test(document.getElementById("card-counter").textContent)));
    for (const day of ["w5/mon", "w5/tue", "w6/wed", "w8/tue", "w10/wed"]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      ok(`${w}: plan ${day} links the repo`, await p.evaluate(repo => !!document.querySelector(`a[href="${repo}"]`), REPO));
    }
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
