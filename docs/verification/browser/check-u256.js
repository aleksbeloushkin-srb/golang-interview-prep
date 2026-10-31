// U2 (anchors reset on card change), U5 (compact sticky at large text), U6 (URL follows the card).
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
let pass = 0, fail = 0;
const ok = (cond, name, extra = "") => { if (cond) { pass++; console.log("PASS", name, extra); } else { fail++; console.log("FAIL", name, extra); } };

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const page = async (vp, opts = {}) => {
    const p = await b.newPage({ viewport: vp });
    p.on("pageerror", e => errors.push(String(e)));
    p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    if (opts.text) await p.addInitScript(t => { document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = `html { font-size: ${t}% !important; }`; document.head.append(s); }); }, opts.text);
    return p;
  };
  const counter = p => p.$eval("#card-counter", e => e.textContent);
  const anchorsOpen = p => p.$$eval("#card-anchors .card-anchors", n => n.length > 0);

  // --- U2 ---
  {
    const p = await page({ width: 1280, height: 900 });
    await p.goto(base + "#/cards/c1"); await p.waitForTimeout(300);
    await p.keyboard.press("h"); await p.waitForTimeout(100);
    ok(await anchorsOpen(p), "U2 H opens anchors");
    await p.click("#reveal-btn"); await p.click("#reveal-btn"); await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(100);
    ok(await anchorsOpen(p), "U2 closing the answer keeps anchors (same attempt)");
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(100);
    ok(!(await anchorsOpen(p)), "U2 next card: anchors hidden");
    await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(100);
    ok((await counter(p)).includes("C1") && !(await anchorsOpen(p)), "U2 back to C1: new attempt, anchors hidden", await counter(p));
    await p.keyboard.press("h"); await p.click(".nav-tabs [data-route=plan]"); await p.waitForTimeout(200);
    await p.goBack(); await p.waitForTimeout(300);
    ok((await counter(p)).includes("C1") && !(await anchorsOpen(p)), "U2 returning via Back: anchors hidden");
    await p.close();
  }

  // --- U6 ---
  {
    const p = await page({ width: 1280, height: 900 });
    await p.goto(base + "#/cards/c1"); await p.waitForTimeout(300);
    const len0 = await p.evaluate(() => history.length);
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(100);
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(100);
    const shown = (await counter(p)).match(/\((C\d+)\)/)[1].toLowerCase();
    ok(await p.evaluate(() => location.hash) === `#/cards/${shown}`, "U6 hash follows Next", shown);
    ok(await p.evaluate(() => history.length) === len0, "U6 Next replaces the history entry");
    await p.reload(); await p.waitForTimeout(400);
    ok((await counter(p)).includes(`(${shown.toUpperCase()})`), "U6 reload shows the same card", await counter(p));
    // Filter: pick the module of the shown card, move inside it, go to the plan and back.
    const mod = await p.evaluate(id => CARDS.find(c => c.id === id).mod, shown);
    await p.evaluate(m => setFilter(m), mod); await p.waitForTimeout(100);
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(100);
    const inFilter = (await counter(p)).match(/\((C\d+)\)/)[1].toLowerCase();
    const total = (await counter(p)).match(/из (\d+)/)[1];
    ok(await p.evaluate(() => location.hash) === `#/cards/${inFilter}`, "U6 hash follows the card inside a filter", inFilter);
    await p.click(".nav-tabs [data-route=plan]"); await p.waitForTimeout(200);
    await p.goBack(); await p.waitForTimeout(300);
    ok((await counter(p)).includes(`(${inFilter.toUpperCase()})`) && (await counter(p)).includes(`из ${total}`), "U6 Back returns to the card and keeps the filter", await counter(p));
    // A link to a card outside the filter resets the selection.
    const outside = await p.evaluate(m => CARDS.find(c => c.mod !== m).id, mod);
    await p.evaluate(id => { location.hash = `#/cards/${id}`; }, outside); await p.waitForTimeout(300);
    ok((await counter(p)).includes(`(${outside.toUpperCase()})`) && (await counter(p)).includes(`из ${await p.evaluate(() => CARDS.length)}`), "U6 link outside the filter opens it among all cards", await counter(p));
    // Empty selection: the address has no card.
    await p.evaluate(() => { const i = document.getElementById("search-input"); i.value = "zzzz-no-such"; i.dispatchEvent(new Event("input", { bubbles: true })); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => location.hash) === "#/cards", "U6 empty selection → #/cards", await p.evaluate(() => location.hash));
    await p.close();
  }
  {
    // Landing without a hash and the bottom tab re-tap on the phone.
    const p = await page({ width: 390, height: 844 });
    await p.goto(base); await p.waitForTimeout(400);
    ok(/^#\/cards\/c\d+$/.test(await p.evaluate(() => location.hash)), "U6 landing gets the card in the address", await p.evaluate(() => location.hash));
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(100);
    const before = await p.evaluate(() => location.hash);
    await p.evaluate(() => window.scrollTo(0, 400));
    await p.click(".bottom-nav a.bottom-tab[href='#/cards']"); await p.waitForTimeout(200);
    ok(await p.evaluate(() => location.hash) === before && await p.evaluate(() => scrollY) === 0, "U6 re-tapping Cards keeps the card and scrolls to top");
    await p.close();
  }

  // --- U5 ---
  const room = p => p.evaluate(() => innerHeight - document.querySelector(".bottom-nav").getBoundingClientRect().height);
  const stickyHeight = p => p.evaluate(() => {
    const c = document.getElementById("card-controls");
    const el = c.classList.contains("controls-compact") ? c.querySelector(".card-navigation") : c;
    return el.getBoundingClientRect().height;
  });
  for (const [w, h] of [[320, 568], [390, 844]]) for (const text of [100, 200]) {
    const p = await page({ width: w, height: h }, { text });
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(400);
    await p.click("#reveal-btn"); await p.waitForTimeout(200);
    // Scroll into the middle of the answer and check what the sticky part covers.
    await p.evaluate(() => { const a = document.getElementById("card-answer-box").getBoundingClientRect(); window.scrollBy(0, a.top + a.height / 2 - innerHeight / 2); });
    await p.waitForTimeout(100);
    const r = await room(p), sh = await stickyHeight(p);
    const compact = await p.$eval("#card-controls", e => e.classList.contains("controls-compact"));
    ok(sh <= r * 0.3 + 1, `U5 ${w}px text ${text}%: sticky part ≤ 30% of the screen`, `${Math.round(sh)}/${Math.round(r)} compact=${compact}`);
    const navBottom = await p.$eval(compact ? "#card-controls .card-navigation" : "#card-controls", e => Math.round(e.getBoundingClientRect().bottom));
    ok(Math.abs(navBottom - r) <= 2, `U5 ${w}px text ${text}%: action row sits at the bottom edge`, `${navBottom} vs ${Math.round(r)}`);
    if (compact) {
      const order = await p.evaluate(() => {
        const a = document.getElementById("card-answer-box").getBoundingClientRect().bottom + scrollY;
        const g = document.querySelector(".card-grades").getBoundingClientRect().top + scrollY;
        return { a, g, pos: getComputedStyle(document.querySelector(".card-grades")).position };
      });
      ok(order.g >= order.a && order.pos === "static", `U5 ${w}px text ${text}%: grades in the flow after the answer`);
      // Grading still works: scroll to the end and click.
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(100);
      ok(await p.$eval(".card-grades button", b => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }), `U5 ${w}px text ${text}%: grade buttons reachable at the end`);
    }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 0, `U5 ${w}px text ${text}%: no horizontal overflow`, String(overflow));
    await p.close();
  }
  {
    const p = await page({ width: 390, height: 844 });
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(300);
    await p.click("#reveal-btn"); await p.waitForTimeout(150);
    ok(!(await p.$eval("#card-controls", e => e.classList.contains("controls-compact"))), "U5 390px normal text: whole panel stays sticky (as before)");
    await p.setViewportSize({ width: 390, height: 500 }); await p.waitForTimeout(200);
    ok(await p.$eval("#card-controls", e => e.classList.contains("controls-compact")), "U5 resize to a low screen → compact");
    await p.close();
    const d = await page({ width: 1280, height: 900 });
    await d.goto(base + "#/cards/c39"); await d.waitForTimeout(300); await d.click("#reveal-btn");
    ok(!(await d.$eval("#card-controls", e => e.classList.contains("controls-compact"))), "U5 desktop: never compact");
    await d.close();
  }

  {
    // The compact row keeps the accessible names of the arrows.
    const p = await page({ width: 320, height: 568 }, { text: 200 });
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(300); await p.click("#reveal-btn"); await p.waitForTimeout(150);
    const names = await p.$$eval("#card-controls .card-navigation button", bs => bs.map(b => b.getAttribute("aria-label") || b.textContent.trim()));
    ok(names[0] === "Назад" && names[2] === "Далее", "U5 compact arrows keep names Назад/Далее", names.join(" | "));
    await p.close();
  }
  ok(errors.length === 0, "no JS errors", errors.join(" | "));
  await b.close();
  console.log(`${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})();
