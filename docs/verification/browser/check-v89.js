// v89: the Go types guide (comparability and map keys), its links from week 1, the lighter Saturday, the W1-2 contract.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });

    await p.goto(base + "#/practice/go-types"); await p.waitForSelector("#practice-title");
    const g = await p.evaluate(() => ({
      title: document.getElementById("practice-title").textContent,
      sections: [...document.querySelectorAll(".practice-guide-section")].map(s => s.id),
      rows: document.querySelectorAll(".practice-guide-commands dt").length,
      code: [...document.querySelectorAll(".practice-guide-section pre")].some(pre => pre.textContent.includes("map[[26]int][]string")),
      links: [...document.querySelectorAll(".practice-guide-links a")].map(a => [a.href.startsWith("https://"), a.target, /noopener/.test(a.rel)]),
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    ok(`${w}: guide title`, g.title === "Типы Go: что сравнимо и что может быть ключом map", g.title);
    ok(`${w}: five sections`, g.sections.join() === "guide-kinds,guide-keys,guide-runtime,guide-generics,guide-say", g.sections.join());
    ok(`${w}: table, key example, links`, g.rows === 6 && g.code && g.links.length === 6 && g.links.every(([https, t, rel]) => https && t === "_blank" && rel), JSON.stringify(g.links));
    ok(`${w}: no horizontal overflow on the guide`, g.overflow <= 0, g.overflow);

    for (const day of ["w1/tue", "w1/sat"]) {
      await p.goto(base + "#/plan/" + day); await p.waitForTimeout(300);
      ok(`${w}: plan ${day} links the guide`, await p.evaluate(() => !!document.querySelector('a[href="#/practice/go-types"]')));
    }
    const sat = await p.evaluate(() => ["w1-sat-3", "w1-wed-4", "w1-sat-4"].map(id => {
      const box = document.getElementById(`plan-task-${id}`);
      const item = box && box.closest("li.plan-task");
      return item ? item.classList.contains("is-optional") : null;
    }));
    ok(`${w}: Saturday LC 238 and 347 optional, LC 1 required`, sat[0] === true && sat[1] === true && sat[2] === false, JSON.stringify(sat));

    await p.goto(base + "#/practice/p-account"); await p.waitForSelector("#practice-title");
    ok(`${w}: W1-2 contract names a successful transfer`, await p.evaluate(() => document.body.innerText.includes("A=700, B=500")));
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
