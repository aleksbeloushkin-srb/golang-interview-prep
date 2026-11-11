// v85: the bank of three services in the knowledge base next to the payment service, and its refs in weeks 11–12 (10–11 before v91).
const { chromium } = require("playwright");
const PAY = "https://github.com/aleksbeloushkin-srb/go-payments-reference";
const BANK = "https://github.com/aleksbeloushkin-srb/pinkponies-bank";
const shots = process.argv[2];
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });
    await p.goto(base + "#/wiki"); await p.waitForTimeout(400);
    const r = await p.evaluate(([pay, bank]) => {
      const box = document.querySelector("#view-wiki .wiki-project");
      const link = box.querySelector(`a[href="${bank}"]`);
      const order = box.querySelectorAll("details")[1];
      return {
        subtitles: [...box.querySelectorAll("h4")].map(h => h.textContent),
        pay: !!box.querySelector(`a[href="${pay}"]`),
        external: link ? link.target === "_blank" && /noopener/.test(link.rel) : false,
        cards: order ? [...order.querySelectorAll('a[href^="#/cards/"]')].map(a => a.getAttribute("href")) : [],
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    }, [PAY, BANK]);
    ok(`${w}: two subprojects`, r.subtitles.join("|") === "Платёжный сервис|Банк из трёх сервисов", r.subtitles.join("|"));
    ok(`${w}: both repo links, the bank one opens in a new tab safely`, r.pay && r.external);
    ok(`${w}: bank reading order links cards`, ["c50", "c61", "c68", "c70", "c52", "c53"].every(id => r.cards.includes(`#/cards/${id}`)), r.cards.join(","));
    ok(`${w}: no horizontal overflow`, r.overflow <= 0, r.overflow);
    await p.$$eval("#view-wiki .wiki-project summary", s => s.forEach(x => x.click())); await p.waitForTimeout(150);
    ok(`${w}: no overflow with both reading orders open`, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
    if (shots) await p.locator("#view-wiki .wiki-project").screenshot({ path: `${shots}/v85-wiki-${w}.png` });
    await p.$eval('#view-wiki .wiki-project details:nth-of-type(2) a[href="#/cards/c53"]', a => a.click()); await p.waitForTimeout(400);
    ok(`${w}: card link opens C53`, await p.evaluate(() => location.hash === "#/cards/c53" && /C53/.test(document.getElementById("card-counter").textContent)));
    for (const [day, want] of [["w11/wed", [PAY, BANK]], ["w11/thu", [BANK]], ["w12/mon", [BANK]], ["w6/mon", [PAY]]]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(250);
      const t = await p.evaluate(want => ({
        missing: want.filter(u => !document.querySelector(`a[href="${u}"]`)),
        oldLabel: document.body.innerText.includes("Эталонный проект: Pinkponies Bank (GitHub)"),
        overflow: document.documentElement.scrollWidth - innerWidth,
      }), want);
      ok(`${w}: plan ${day} links ${want.length} repo(s), new labels, no overflow`, !t.missing.length && !t.oldLabel && t.overflow <= 0, JSON.stringify(t));
    }
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
