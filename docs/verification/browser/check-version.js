const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); let fail = 0;
  for (const [w, h, route] of [[390, 844, "#/cards/c34"], [1280, 800, "#/plan"], [320, 568, "#/practice"]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto("http://127.0.0.1:8765/" + route); await p.waitForTimeout(400);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(150);
    const r = await p.$eval("#site-version", e => { const b = e.getBoundingClientRect(); const nav = document.querySelector(".bottom-nav"); const navTop = nav && getComputedStyle(nav).display !== "none" ? nav.getBoundingClientRect().top : innerHeight; return { text: e.textContent, visible: b.height > 0 && b.bottom <= navTop + 1 && b.top >= 0 }; });
    const good = /^Версия сайта \d+$/.test(r.text) && r.visible; if (!good) fail++;
    console.log(good ? "PASS" : "FAIL", w, route, JSON.stringify(r));
    if (w === 390) if (process.argv[2]) await p.screenshot({ path: process.argv[2] + "/version-390.png" });
    await p.close();
  }
  await b.close(); process.exit(fail ? 1 : 0);
})();
