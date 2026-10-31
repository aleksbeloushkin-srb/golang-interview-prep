const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const w of [320, 340, 360, 375, 390, 1280]) for (const reveal of [false, true]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    await p.goto("http://127.0.0.1:8765/#/cards/c34"); await p.waitForTimeout(250);
    if (reveal) { await p.click("#reveal-btn"); await p.waitForTimeout(150); }
    const r = await p.$$eval(".card-navigation button", bs => bs.map(b => {
      const label = b.querySelector(".nav-label"); const t = b.innerText.replace(/\n/g, "⏎");
      const broken = label && getComputedStyle(label).display !== "none" && label.getClientRects().length > 1 && /[А-я]⏎[А-я]/.test(t);
      return { t, broken };
    }));
    const any = r.some(x => x.broken); if (any) bad++;
    console.log(w, reveal ? "open" : "closed", r.map(x => x.t).join(" | "), any ? "BROKEN WORD" : "");
    await p.close();
  }
  await b.close(); console.log(bad ? "FAIL" : "PASS no words broken");
})();
