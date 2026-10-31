// Browser checks for the quiz "answer first" mode.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); let fails = 0, n = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };
  for (const [w, zoom] of [[1280, 1], [390, 1], [320, 2]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => m.type() === "error" && errors.push(m.text()));
    const tag = `${w}${zoom !== 1 ? "×" + zoom : ""}`;
    await p.goto(base + "#/quiz/q12"); await p.waitForTimeout(400);
    if (zoom !== 1) await p.addStyleTag({ content: `html { font-size: ${zoom * 100}% !important; }` });

    // Default (nothing saved): answer first — options hidden, own-answer box shown.
    let r = await p.evaluate(() => ({ checked: document.getElementById("quiz-answer-first").checked, options: document.querySelector("#q12-options input").checkVisibility(), own: document.getElementById("q12-own").checkVisibility() }));
    ok(`${tag}: default is answer-first`, r.checked && !r.options && r.own, JSON.stringify(r));
    // Turning it off shows options; the choice is remembered over the default.
    await p.uncheck("#quiz-answer-first");
    r = await p.evaluate(() => ({ options: document.querySelector("#q12-options input").checkVisibility(), own: document.getElementById("q12-own").checkVisibility(), saved: localStorage.getItem("go_prep_quiz_answer_first_v1") }));
    ok(`${tag}: off shows options and is saved`, r.options && !r.own && r.saved === "0", JSON.stringify(r));
    await p.reload(); await p.waitForTimeout(300);
    r = await p.evaluate(() => document.getElementById("quiz-answer-first").checked);
    ok(`${tag}: off survives a reload`, r === false);

    // Turn on with the keyboard-accessible checkbox.
    await p.check("#quiz-answer-first");
    r = await p.evaluate(() => ({ options: document.querySelector("#q12-options input").checkVisibility(), own: document.getElementById("q12-own").checkVisibility(), label: document.querySelector('label[for="q12-own"]').textContent.length > 0, count: document.querySelectorAll(".quiz-own").length, total: QUIZ_QUESTIONS.length }));
    ok(`${tag}: mode on hides options and shows labelled answer box in every task`, !r.options && r.own && r.label && r.count === r.total, JSON.stringify(r));

    // Reveal with an empty answer is refused, focus goes to the textarea.
    await p.click('#q12 .quiz-own button');
    r = await p.evaluate(() => ({ status: document.getElementById("q12-own-status").textContent, focus: document.activeElement.id, options: document.querySelector("#q12-options input").checkVisibility() }));
    ok(`${tag}: empty answer keeps options hidden`, /Сначала запиши/.test(r.status) && r.focus === "q12-own" && !r.options, JSON.stringify(r));

    // Write an answer, reveal, choose, see explanation.
    await p.fill("#q12-own", "wg passed by value; pass *sync.WaitGroup");
    await p.click('#q12 .quiz-own button');
    r = await p.evaluate(() => ({ options: document.querySelector("#q12-options input").checkVisibility(), focus: document.activeElement.name, other: document.querySelector("#q15-options input").checkVisibility() }));
    ok(`${tag}: reveal opens only this task's options and focuses the first`, r.options && r.focus === "q12" && !r.other, JSON.stringify(r));
    const correct = await p.evaluate(() => QUIZ_QUESTIONS.find(q => q.id === "q12").correct);
    await p.check(`input[name="q12"][value="${correct}"]`);
    r = await p.evaluate(() => ({ result: !document.getElementById("q12-result").classList.contains("hidden"), own: document.getElementById("q12-own").value }));
    ok(`${tag}: answer reveals explanation and keeps own text`, r.result && r.own.startsWith("wg passed"), JSON.stringify(r));

    // No overflow with the mode on.
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(`${tag}: no overflow`, ov <= 0, ov);

    // Mode survives a reload; turning it off shows options again.
    await p.reload(); await p.waitForTimeout(400);
    r = await p.evaluate(() => ({ checked: document.getElementById("quiz-answer-first").checked, options: document.querySelector("#q15-options input").checkVisibility() }));
    ok(`${tag}: mode remembered after reload`, r.checked && !r.options, JSON.stringify(r));
    await p.uncheck("#quiz-answer-first");
    r = await p.evaluate(() => document.querySelector("#q15-options input").checkVisibility());
    ok(`${tag}: mode off shows options`, r);
    ok(`${tag}: no console errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  // Storage that throws: the page still works, mode just isn't remembered.
  const ctx = await b.newContext();
  await ctx.addInitScript(() => {
    const thrower = () => { throw new Error("blocked"); };
    Object.defineProperty(window, "localStorage", { get: thrower });
  });
  const p = await ctx.newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(base + "#/quiz"); await p.waitForTimeout(400);
  const def = await p.evaluate(() => document.getElementById("quiz-answer-first").checked && !document.querySelector("#q1-options input").checkVisibility());
  ok("blocked storage: default is answer-first", def);
  await p.uncheck("#quiz-answer-first");
  const shown = await p.evaluate(() => document.querySelector("#q1-options input").checkVisibility());
  ok("blocked storage: mode still toggles", shown);
  ok("blocked storage: no quiz-mode errors", !errors.some(e => /QUIZ_MODE|quiz/i.test(e)), errors.join(" | "));
  await b.close(); console.log(`${n - fails}/${n} passed`);
})();
