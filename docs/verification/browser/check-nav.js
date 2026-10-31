// Mobile bottom navigation, "Ещё" sheet, keyboard hiding, overlap, desktop tabs.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const page = async (w, h = 780) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 700 })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    return p;
  };
  const visible = (p, sel) => p.evaluate(s => { const el = document.querySelector(s); return !!el && el.checkVisibility(); }, sel);

  for (const w of [390, 360, 320]) {
    const p = await page(w);
    await p.goto(base + "#/cards"); await p.waitForTimeout(300);
    ok(`${w}: bottom nav shown, top tabs hidden`, await visible(p, ".bottom-nav") && !(await visible(p, ".nav-tabs")));
    const tabs = await p.$$eval(".bottom-nav .bottom-tab", els => els.map(e => ({ t: e.textContent.trim(), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })));
    ok(`${w}: four items`, tabs.map(t => t.t).join(",") === "План,Карточки,Диаграммы,Ещё", tabs.map(t => t.t).join(","));
    ok(`${w}: touch targets ≥ 48 px`, tabs.every(t => t.w >= 48 && t.h >= 48), JSON.stringify(tabs.map(t => [t.w, t.h])));
    const clipped = await p.$$eval(".bottom-tab span", els => els.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
    ok(`${w}: labels not cut`, clipped.length === 0, clipped.join(","));
    const header = await p.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().height));
    ok(`${w}: compact header`, header <= 64, `${header}px`);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`${w}: no horizontal scroll`, over <= 0, `${over}`);

    for (const [route, view] of [["plan", "view-plan"], ["simulators", "view-simulators"], ["cards", "view-cards"]]) {
      await p.tap(`.bottom-nav [data-route="${route}"]`); await p.waitForTimeout(150);
      const s = await p.evaluate(([r, v]) => ({ hash: location.hash, cur: document.querySelector(`.bottom-nav [data-route="${r}"]`).getAttribute("aria-current"),
        others: [...document.querySelectorAll(".bottom-nav [aria-current]")].length, shown: !document.getElementById(v).classList.contains("hidden") }), [route, view]);
      ok(`${w}: tap ${route}`, (s.hash === `#/${route}` || (route === "cards" && /^#\/cards\/c\d+$/.test(s.hash))) && s.cur === "page" && s.others === 1 && s.shown, JSON.stringify(s));
    }

    // «Ещё»: открыть, выбрать раздел, подсветка и подпись для читалки
    await p.tap("#more-open"); await p.waitForTimeout(350);
    let st = await p.evaluate(() => ({ open: document.getElementById("more-sheet").open, exp: document.getElementById("more-open").getAttribute("aria-expanded"), focusIn: document.getElementById("more-sheet").contains(document.activeElement) }));
    ok(`${w}: Ещё opens the sheet with focus inside`, st.open && st.exp === "true" && st.focusIn, JSON.stringify(st));
    const sheetFits = await p.evaluate(() => { const r = document.getElementById("more-sheet").getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0; });
    ok(`${w}: sheet fits the screen`, sheetFits);
    await p.tap('.more-sheet [data-route="practice"]'); await p.waitForTimeout(200);
    st = await p.evaluate(() => ({ hash: location.hash, open: document.getElementById("more-sheet").open, active: document.getElementById("more-open").classList.contains("active"),
      label: document.getElementById("more-open").getAttribute("aria-label"), exp: document.getElementById("more-open").getAttribute("aria-expanded"),
      shown: !document.getElementById("view-practice").classList.contains("hidden") }));
    ok(`${w}: Практикум from the sheet`, st.hash === "#/practice" && !st.open && st.active && st.label.includes("Практикум") && st.exp === "false" && st.shown, JSON.stringify(st));
    for (const [r, name] of [["quiz", "Quiz"], ["wiki", "База знаний"], ["cheatsheet", "Шпаргалка"]]) {
      await p.tap("#more-open"); await p.waitForTimeout(100);
      await p.tap(`.more-sheet [data-route="${r}"]`); await p.waitForTimeout(150);
      const s = await p.evaluate(rr => ({ hash: location.hash, label: document.getElementById("more-open").getAttribute("aria-label"), cur: document.querySelector(`.more-sheet [data-route="${rr}"]`).getAttribute("aria-current") }), r);
      ok(`${w}: ${r} from the sheet`, s.hash === `#/${r}` && s.label.includes(name) && s.cur === "page", JSON.stringify(s));
    }
    // Закрытие: Esc (фокус возвращается на «Ещё»), фон, крестик, переход «Назад»
    await p.tap("#more-open"); await p.waitForTimeout(100);
    await p.keyboard.press("Escape"); await p.waitForTimeout(100);
    st = await p.evaluate(() => ({ open: document.getElementById("more-sheet").open, focus: document.activeElement.id }));
    ok(`${w}: Esc closes, focus back on Ещё`, !st.open && st.focus === "more-open", JSON.stringify(st));
    await p.tap("#more-open"); await p.waitForTimeout(100);
    await p.mouse.click(w / 2, 20); await p.waitForTimeout(100);
    ok(`${w}: tap on the dimmed background closes`, !(await p.evaluate(() => document.getElementById("more-sheet").open)));
    await p.tap("#more-open"); await p.waitForTimeout(100);
    await p.tap(".more-sheet-head h2"); await p.waitForTimeout(100);
    ok(`${w}: tap inside the sheet keeps it open`, await p.evaluate(() => document.getElementById("more-sheet").open));
    await p.tap(".more-close"); await p.waitForTimeout(100);
    ok(`${w}: close button closes`, !(await p.evaluate(() => document.getElementById("more-sheet").open)));
    await p.tap('.bottom-nav [data-route="plan"]'); await p.waitForTimeout(100);
    await p.tap("#more-open"); await p.waitForTimeout(100);
    await p.goBack(); await p.waitForTimeout(200);
    st = await p.evaluate(() => ({ open: document.getElementById("more-sheet").open, hash: location.hash }));
    ok(`${w}: Back closes the sheet and goes back`, !st.open && st.hash === "#/cheatsheet", JSON.stringify(st));

    // Повторное касание открытого раздела — к началу страницы
    await p.tap('.bottom-nav [data-route="simulators"]'); await p.waitForTimeout(200);
    await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(100);
    await p.tap('.bottom-nav [data-route="simulators"]'); await p.waitForTimeout(150);
    ok(`${w}: re-tap scrolls to top`, (await p.evaluate(() => scrollY)) === 0 && (await p.evaluate(() => location.hash)) === "#/simulators");

    // Клавиатура: поле ввода прячет панель
    await p.tap('.bottom-nav [data-route="cards"]'); await p.waitForTimeout(150);
    await p.evaluate(() => { const d = document.querySelector("#search-input").closest("details"); if (d) d.open = true; });
    await p.focus("#search-input"); await p.waitForTimeout(50);
    const kb = await p.evaluate(() => ({ cls: document.body.classList.contains("keyboard-open"), nav: document.querySelector(".bottom-nav").checkVisibility() }));
    await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(50);
    const kb2 = await p.evaluate(() => ({ cls: document.body.classList.contains("keyboard-open"), nav: document.querySelector(".bottom-nav").checkVisibility() }));
    ok(`${w}: typing hides the bar, leaving restores it`, kb.cls && !kb.nav && !kb2.cls && kb2.nav, JSON.stringify([kb, kb2]));
    await p.tap("#more-open"); await p.waitForTimeout(150);
    await p.tap('.more-sheet [data-route="quiz"]'); await p.waitForTimeout(150);
    await p.check("#quiz-answer-first"); await p.waitForTimeout(100);
    ok(`${w}: checkbox does not hide the bar`, await visible(p, ".bottom-nav"));
    await p.focus(".quiz-own textarea"); await p.waitForTimeout(50);
    ok(`${w}: quiz textarea hides the bar`, !(await visible(p, ".bottom-nav")));
    await p.evaluate(() => document.activeElement.blur()); await p.uncheck("#quiz-answer-first");

    // Ничего не прячется под панелью: низ каждой страницы и кнопки карточки
    for (const r of ["plan", "practice", "cards", "simulators", "wiki", "cheatsheet", "quiz"]) {
      await p.goto(base + `#/${r}`); await p.waitForTimeout(250);
      const g = await p.evaluate(rr => {
        window.scrollTo(0, document.documentElement.scrollHeight);
        const navTop = document.querySelector(".bottom-nav").getBoundingClientRect().top;
        const view = document.getElementById(`view-${rr}`);
        const items = [...view.querySelectorAll("*")].filter(e => e.checkVisibility() && e.children.length === 0 && e.getBoundingClientRect().height > 0);
        const last = Math.max(...items.map(e => e.getBoundingClientRect().bottom));
        return { last: Math.round(last), navTop: Math.round(navTop) };
      }, r);
      ok(`${w}: ${r} bottom content above the bar`, g.last <= g.navTop, JSON.stringify(g));
    }
    await p.goto(base + "#/cards/c11"); await p.waitForTimeout(250);
    await p.click("#reveal-btn").catch(() => p.keyboard.press("Space")); await p.waitForTimeout(200);
    // Карточка начинается у верха экрана, ответ открыт: кнопки должны стоять над панелью
    await p.evaluate(() => window.scrollTo(0, document.getElementById("card-stage").getBoundingClientRect().top + scrollY + 200)); await p.waitForTimeout(100);
    const cc = await p.evaluate(() => { const c = document.querySelector(".card-controls").getBoundingClientRect(); const n = document.querySelector(".bottom-nav").getBoundingClientRect(); return { cBottom: Math.round(c.bottom), navTop: Math.round(n.top), y: scrollY, body: document.body.className, h: innerHeight, exp: document.getElementById("reveal-btn").getAttribute("aria-expanded") }; });
    ok(`${w}: card buttons stay above the bar`, cc.cBottom <= cc.navTop + 1, JSON.stringify(cc));
    await p.close();
  }

  // Компьютер: прежнее верхнее меню, нижней панели нет, счётчики во вкладках
  const d = await page(1280, 900);
  await d.goto(base + "#/quiz"); await d.waitForTimeout(300);
  const desk = await d.evaluate(() => ({ bottom: document.querySelector(".bottom-nav").checkVisibility(), top: document.querySelector(".nav-tabs").checkVisibility(),
    tabs: [...document.querySelectorAll(".nav-tabs .tab-btn")].map(t => t.textContent.replace(/\s+/g, " ").trim()), cur: document.querySelector('.nav-tabs [aria-current="page"]').dataset.route,
    rows: new Set([...document.querySelectorAll(".nav-tabs .tab-btn")].map(t => Math.round(t.getBoundingClientRect().top))).size }));
  ok("1280: top tabs, no bottom bar", desk.top && !desk.bottom, JSON.stringify(desk));
  ok("1280: tab labels and counts", desk.tabs.join("|") === "План|Карточки 56|Диаграммы 12|Quiz 47|Практикум|База знаний|Шпаргалка", desk.tabs.join("|"));
  ok("1280: tabs fit one row, quiz current", desk.rows === 1 && desk.cur === "quiz", JSON.stringify(desk));
  await d.goto(base + "#/practice"); await d.waitForTimeout(300);
  const focusRing = await d.evaluate(() => { const h = document.getElementById("practice-title"); return { focused: document.activeElement === h, outline: getComputedStyle(h).outlineStyle }; });
  ok("1280: practice title focused without a ring", focusRing.focused && focusRing.outline === "none", JSON.stringify(focusRing));
  await d.close();

  ok("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n") || "(no failures)");
  console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
