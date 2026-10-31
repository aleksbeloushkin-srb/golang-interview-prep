// Card recall flow on all 48 cards: question → anchors (separately) → answer; grades, attempts, layout.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const ids = [...Array.from({ length: 54 }, (_, i) => `c${i + 1}`), "c55", "c56"];
  const FIRST = /^(.+?(?<!\be\.g|\bi\.e)[.!?])\s+(?=\S)/;
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await p.goto(base + "#/cards"); await p.waitForTimeout(300);
    const prompt = await p.textContent(".recall-prompt");
    ok(`${w}: recall prompt asks for the first sentence`, prompt.includes("первую фразу"), prompt);
    const bad = [];
    for (const id of ids) {
      await p.goto(base + `#/cards/${id}`); await p.waitForTimeout(120);
      const before = await p.evaluate(() => ({
        button: Boolean(document.querySelector("#card-anchors .hint-btn")), list: document.querySelectorAll("#card-anchors .anchor-list li").length,
        answer: document.getElementById("card-answer-box").classList.contains("visible"),
        grades: document.querySelector(".card-grades").classList.contains("hidden"), criteria: document.getElementById("grade-criteria").classList.contains("hidden")
      }));
      // Step 2: anchors without the answer (keyboard H on even cards, button on odd ones).
      if (Number(id.slice(1)) % 2) await p.click("#card-anchors .hint-btn"); else { await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press("h"); }
      await p.waitForTimeout(80);
      const anchors = await p.evaluate(id => {
        const card = CARDS.find(c => c.id === id);
        const chips = [...document.querySelectorAll("#card-anchors .anchor-list li")].map(li => li.textContent);
        return { same: JSON.stringify(chips) === JSON.stringify(card.anchorsEN), visible: document.querySelector("#card-anchors .anchor-list").checkVisibility(),
          answer: document.getElementById("card-answer-box").classList.contains("visible") };
      }, id);
      // Step 3: answer.
      await p.click("#reveal-btn"); await p.waitForTimeout(80);
      const r = await p.evaluate(id => {
        const card = CARDS.find(c => c.id === id);
        const jvm = document.querySelector("#card-jvm .jvm-box");
        const more = document.getElementById("card-more");
        const over = [...document.querySelectorAll("#card-answer-box *, #card-anchors *, #card-controls *")].filter(e => e.checkVisibility() && e.getBoundingClientRect().right > innerWidth + 1).length;
        return {
          short: document.getElementById("card-short-en").textContent === card.shortEN,
          first: (document.querySelector("#card-short-en .first-sentence") || {}).textContent,
          jvm: card.jvmEN ? Boolean(jvm) && !jvm.open && jvm.querySelector("p[lang=en]").textContent === card.jvmEN && (!card.jvmRU || jvm.querySelector("p[lang=ru]").textContent === card.jvmRU) : !jvm,
          more: more && !more.open, anchors: document.querySelector("#card-anchors .anchor-list").checkVisibility(),
          grades: !document.querySelector(".card-grades").classList.contains("hidden") && [...document.querySelectorAll(".card-grades button")].every(x => !x.disabled),
          criteria: !document.getElementById("grade-criteria").classList.contains("hidden"), over
        };
      }, id);
      const expectedFirst = (FIRST.exec(await p.evaluate(id => CARDS.find(c => c.id === id).shortEN, id)) || [0, ""])[1];
      // Close the answer: anchors stay for the retelling exercise.
      await p.click("#reveal-btn"); await p.waitForTimeout(60);
      const closed = await p.evaluate(() => ({ anchors: document.querySelector("#card-anchors .anchor-list")?.checkVisibility() || false, answer: document.getElementById("card-answer-box").classList.contains("visible"), grades: document.querySelector(".card-grades").classList.contains("hidden") }));
      const pass = before.button && before.list === 0 && !before.answer && before.grades && before.criteria
        && anchors.same && anchors.visible && !anchors.answer
        && r.short && r.first === expectedFirst && r.jvm && r.more && r.anchors && r.grades && r.criteria && r.over === 0
        && closed.anchors && !closed.answer && closed.grades;
      if (!pass) bad.push(`${id} ${JSON.stringify({ before, anchors, r, closed, expectedFirst: expectedFirst.slice(0, 30) })}`);
    }
    ok(`${w}: all 48 cards — question → anchors → answer, Java and details folded, no overflow`, bad.length === 0, bad.slice(0, 2).join(" || "));
    // Next card hides the anchors again.
    await p.goto(base + "#/cards/c1"); await p.waitForTimeout(150);
    await p.click("#card-anchors .hint-btn"); await p.waitForTimeout(60);
    await p.evaluate(() => nextCard()); await p.waitForTimeout(80);
    ok(`${w}: next card starts with anchors hidden`, await p.evaluate(() => Boolean(document.querySelector("#card-anchors .hint-btn")) && !document.querySelector("#card-anchors .anchor-list")));
    // Wiki shows the same blocks.
    await p.goto(base + "#/wiki"); await p.waitForTimeout(300);
    const wk = await p.evaluate(() => ({ anchors: CARDS.every(c => document.querySelectorAll(`#wiki-${c.id} .anchor-list li`).length === c.anchorsEN.length),
      jvm: CARDS.every(c => !!document.querySelector(`#wiki-${c.id} .jvm-box`) === !!c.jvmEN) }));
    ok(`${w}: wiki shows anchors and Java where present`, wk.anchors && wk.jvm, JSON.stringify(wk));
    // Search finds a card by an anchor word.
    await p.goto(base + "#/cards"); await p.waitForTimeout(200);
    await p.evaluate(() => { const d = document.querySelector("#search-input").closest("details"); if (d) d.open = true; });
    await p.fill("#search-input", "stackalloc"); await p.waitForTimeout(150);
    const found = await p.evaluate(() => document.getElementById("card-counter").textContent);
    ok(`${w}: search by anchor finds c4`, /C4\)/.test(found), found);
    await p.fill("#search-input", "");
    await p.close();
  }

  // Grades: keys 1/2/3, attempt history with date, status pill, progress mapping (no backend → editable).
  {
    const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
    p.on("pageerror", e => errors.push(e.message));
    await p.clock.setFixedTime(new Date("2026-10-29T10:00:00+01:00"));
    await p.goto(base + "#/cards/c1"); await p.waitForTimeout(200);
    await p.keyboard.press("1"); await p.waitForTimeout(60);
    ok("grade keys do nothing before the answer is shown", await p.evaluate(() => localStorage.getItem("go_prep_attempts_v1") === null));
    const grade = async key => { await p.keyboard.press("Space"); await p.waitForTimeout(60); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press(key); await p.waitForTimeout(80); };
    await p.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    await grade("1"); // c1 → self
    await grade("2"); // c2 → anchors
    await grade("3"); // c3 → none
    const st = await p.evaluate(() => ({ a: JSON.parse(localStorage.getItem("go_prep_attempts_v1") || "{}"), prog: state.progress }));
    ok("1 = сам → mastered", st.a.c1 && st.a.c1[0].r === "self" && st.a.c1[0].d === "2026-10-29" && st.prog.c1 === "mastered", JSON.stringify(st.a.c1));
    ok("2 = с опорой → review", st.a.c2 && st.a.c2[0].r === "anchors" && st.prog.c2 === "review", JSON.stringify(st.a.c2));
    ok("3 = не ответил → review", st.a.c3 && st.a.c3[0].r === "none" && st.prog.c3 === "review", JSON.stringify(st.a.c3));
    await p.goto(base + "#/cards/c2"); await p.waitForTimeout(150);
    const pill = await p.textContent("#card-status");
    ok("status pill shows the last attempt with date", pill.includes("На повторении") && pill.includes("29.10: с опорой"), pill);
    await p.evaluate(() => { const a = JSON.parse(localStorage.getItem("go_prep_attempts_v1")); a.c2 = Array.from({ length: 25 }, () => ({ d: "2026-10-01", r: "none" })); localStorage.setItem("go_prep_attempts_v1", JSON.stringify(a)); });
    await p.evaluate(() => { state.revealed = true; renderCard(); gradeCard("self"); });
    const hist = await p.evaluate(() => JSON.parse(localStorage.getItem("go_prep_attempts_v1")).c2);
    ok("history keeps the last 20 attempts", hist.length === 20 && hist[19].r === "self", `${hist.length}`);
    await p.close();
  }

  // Read-only (backend configured, signed out): hint under the grades, no jump, nothing saved.
  {
    const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
    p.on("pageerror", e => errors.push(e.message));
    await p.goto("http://127.0.0.1:8767/#/cards/c5"); await p.waitForTimeout(300);
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    const hint = await p.evaluate(() => { const g = document.getElementById("grade-signin"); return { shown: !g.classList.contains("hidden"), text: g.textContent }; });
    ok("RO: sign-in hint under the grades", hint.shown && hint.text.includes("после входа"), hint.text);
    await p.click('[data-result="self"]'); await p.waitForTimeout(100);
    const ro = await p.evaluate(() => ({ attempts: localStorage.getItem("go_prep_attempts_v1"), prog: state.progress.c5 || null, focus: Boolean(document.activeElement && document.activeElement.closest("#grade-signin")), top: !document.getElementById("signin-notice").classList.contains("hidden") }));
    ok("RO: grade saves nothing and focuses the hint", ro.attempts === null && ro.prog === null && ro.focus && !ro.top, JSON.stringify(ro));
    await p.close();
  }
  ok("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n") || "(no failures)");
  console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
