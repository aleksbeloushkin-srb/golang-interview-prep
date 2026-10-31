// v77: extra diagram links at a step (c20/c21/c31 → sim9), #/simulators/<id>/<step>, cheat sheet rows 18–20, numbered EN answers in sim10/sim11.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const base = "http://127.0.0.1:8765/";
    for (const [id, step] of [["c20", 7], ["c21", 3], ["c31", 4]]) {
      await p.goto(`${base}#/cards/${id}`); await p.waitForTimeout(300);
      const a = await p.$(`#card-sim-link a[href="#/simulators/sim9/${step}"]`);
      ok(`${w}: ${id} has a button to sim9 step ${step}`, !!a && /шаг \d/.test(await a.innerText()), a ? await a.innerText() : "none");
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      ok(`${w}: ${id} no horizontal overflow`, ov <= 0, ov);
    }
    // Click from the card, land on the step, then Back returns to the card.
    await p.goto(`${base}#/cards/c21`); await p.waitForTimeout(300);
    // The button sits in the collapsed «Подробнее» block, like the main diagram button.
    await p.$eval('#card-sim-link a[href="#/simulators/sim9/3"]', a => a.click()); await p.waitForTimeout(500);
    const st = await p.evaluate(() => ({ step: document.getElementById("sim9").dataset.step, active: [...document.querySelectorAll("#sim9-steps .step-pill")].findIndex(x => x.classList.contains("active")), status: document.getElementById("sim9-status").textContent, top: Math.round(document.getElementById("sim9").getBoundingClientRect().top) }));
    ok(`${w}: sim9 opened at step 3`, st.step === "2" && st.active === 2 && /^Шаг 3 из/.test(st.status), JSON.stringify(st));
    ok(`${w}: sim9 scrolled into view`, Math.abs(st.top) < 120, st.top);
    await p.goBack(); await p.waitForTimeout(400);
    ok(`${w}: Back returns to c21`, await p.evaluate(() => location.hash === "#/cards/c21" && !document.getElementById("view-cards").classList.contains("hidden")));
    // An invalid step keeps the current one.
    await p.goto(`${base}#/simulators/sim9`); await p.waitForTimeout(300);
    const before = await p.evaluate(() => document.getElementById("sim9").dataset.step);
    await p.goto(`${base}#/simulators/sim9/99`); await p.waitForTimeout(400);
    ok(`${w}: invalid step ignored`, (await p.evaluate(() => document.getElementById("sim9").dataset.step)) === before, before);
    // Back-links on sim9 name the step.
    const links = await p.evaluate(() => [...document.querySelectorAll("#sim9 .diagram-cards a")].map(a => a.innerText));
    ok(`${w}: sim9 lists C20 (шаг 7), C21 (шаг 3), C31`, links.some(t => t.startsWith("C20 (шаг 7)")) && links.some(t => t.startsWith("C21 (шаг 3)")) && links.some(t => t.startsWith("C31:")), links.join(" | "));
    // Final EN answer is a numbered list in sim10 and sim11.
    for (const [sim, last] of [["sim10", 8], ["sim11", 8]]) {
      await p.goto(`${base}#/simulators/${sim}/${last}`); await p.waitForTimeout(400);
      ok(`${w}: ${sim} final EN answer is numbered`, await p.evaluate(s => !!document.querySelector(`#${s}-board ol`), sim));
    }
    // Cheat sheet rows 18–20.
    await p.goto(`${base}#/cheatsheet`); await p.waitForTimeout(400);
    const rows = await p.evaluate(() => [...document.querySelectorAll("#cheatsheet-tbody tr")].map(tr => ({ t: tr.querySelector("td").innerText, card: tr.querySelector('a[href^="#/cards/"]')?.getAttribute("href") || "", sim: tr.querySelector('a[href^="#/simulators/"]') ? 1 : 0, txt: tr.innerText })));
    for (const [n, card] of [[18, "c39"], [19, "c47"], [20, "c50"]]) {
      const r = rows[n - 1] || {};
      ok(`${w}: row ${n} → ${card}, no diagram, no raw markup`, r.card === `#/cards/${card}` && r.sim === 0 && !/&amp;|<code>/.test(r.txt || ""), r.t);
    }
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${w}: no horizontal overflow on cheat sheet`, ov <= 0, ov);
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
