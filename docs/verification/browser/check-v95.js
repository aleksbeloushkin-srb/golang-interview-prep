// v95: fixes from the v94 review (Codex, docs/reviews/2026-11-17-v94/) — a rating in «На повторение» goes to the card
// that was shown (V94-1), the 21st answer of a day keeps its worst result (V89-1), the «do not close the page» note
// of the talk trainer and the practicum goes away when sync saves the result (V94-3). Ports 8765 and 8767.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(base + "#/cards/c33"); await p.waitForFunction(() => state.shownCard === "c33");

  // Two cards answered wrong on 01.11, both due: the filter «На повторение» shows c33, c34.
  const setup = index => p.evaluate(i => {
    localStorage.clear();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ c33: "review", c34: "review" }));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ c33: [{ d: "2026-11-01", r: "none" }], c34: [{ d: "2026-11-01", r: "none" }] }));
    state.progress = loadProgress();
    state.filter = "review"; state.level = "all"; state.search = ""; state.index = i; state.revealed = true; renderCard();
    return { shown: state.shownCard, list: getFilteredCards().map(c => c.id) };
  }, index);
  const after = () => p.evaluate(() => ({
    shown: state.shownCard, list: getFilteredCards().map(c => c.id), progress: { ...state.progress },
    c33: (loadAttempts().c33 || []).length, c34: (loadAttempts().c34 || []).length
  }));

  let before = await setup(0);
  ok("review filter shows c33 and c34", before.list.join() === "c33,c34" && before.shown === "c33", JSON.stringify(before));
  await p.click('[data-result="self"]');
  let a = await after();
  ok("«Сам» on the first card rates c33, not c34", a.progress.c33 === "mastered" && a.progress.c34 === "review" && a.c33 === 2 && a.c34 === 1, JSON.stringify(a));
  ok("c34 is shown next", a.shown === "c34" && a.list.join() === "c34", JSON.stringify(a));

  before = await setup(1);
  const last = await p.evaluate(() => { try { gradeCard("self"); return null; } catch (e) { return e.message; } });
  a = await after();
  ok("«Сам» on the last card does not throw", last === null, last);
  ok("the last card c34 gets the rating", a.progress.c34 === "mastered" && a.progress.c33 === "review" && a.c34 === 2 && a.c33 === 1, JSON.stringify(a));

  await setup(0);
  await p.click('[data-result="none"]');
  a = await after();
  ok("«Не ответил» keeps c33 in the filter and moves on to c34", a.progress.c33 === "review" && a.shown === "c34" && a.list.join() === "c33,c34", JSON.stringify(a));

  // The only card in the filter: the rating is saved and nothing throws.
  const single = await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ c33: "review" }));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ c33: [{ d: "2026-11-01", r: "none" }] }));
    state.progress = loadProgress(); state.filter = "review"; state.index = 0; state.revealed = true; renderCard();
    let thrown = null;
    try { gradeCard("anchors"); gradeCard("self"); } catch (e) { thrown = e.message; }
    return { thrown, progress: { ...state.progress }, n: loadAttempts().c33.length };
  });
  ok("the only card: two ratings in a row, no error", single.thrown === null && single.n === 2, JSON.stringify(single));

  // V89-1: «не ответил» and 20 «сам» on one day — the day stays «не ответил», the check is tomorrow.
  const limit = await p.evaluate(() => {
    localStorage.clear(); state.progress = {};
    recordAttempt("c33", "none");
    for (let i = 0; i < 20; i++) recordAttempt("c33", "self");
    return { n: loadAttempts().c33.length, status: attemptStatus(loadAttempts().c33), due: cardSchedule("c33").due, tomorrow: reviewAddDays(reviewToday(), 1) };
  });
  ok("21 answers of a day: 20 kept, the day stays «не ответил», due tomorrow",
    limit.n === 20 && limit.status === "review" && limit.due === limit.tomorrow, JSON.stringify(limit));

  // V94-3: a talk result that the browser refused to save; sync («Объединить») writes it — the note says saved.
  await p.goto(base + "#/plan/w1"); await p.waitForSelector("#plan-task-w1-mon-3");
  await p.evaluate(() => {
    localStorage.clear();
    talkOpen("lc49", null);
    window.__realSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (this === localStorage) throw Error("quota"); return __realSet.call(this, k, v); };
    while (talkState.index < talkState.steps.length) talkRate("said");
    Storage.prototype.setItem = __realSet;
    apiFetch = async () => ({ ok: true, status: 200, json: async () => ({ version: 8 }) });
  });
  const talkBefore = await p.evaluate(() => ({ pending: talkStore.pending, note: !!document.querySelector("#talk-save-note[data-pending]") }));
  ok("talk: the note first asks to keep the page open", talkBefore.pending && talkBefore.note, JSON.stringify(talkBefore));
  await p.evaluate(() => syncMerge({ version: 7, progress: {} }));
  await p.waitForTimeout(300);
  const talkAfter = await p.evaluate(() => ({
    pending: talkStore.pending, notePending: !!document.querySelector("#talk-save-note[data-pending]"),
    note: document.getElementById("talk-save-note").textContent === TALK_SAVED, stored: !!JSON.parse(localStorage.getItem(TALK_STORAGE_KEY) || "{}").results?.lc49
  }));
  ok("talk: after sync the result is stored and the note says saved", !talkAfter.pending && !talkAfter.notePending && talkAfter.note && talkAfter.stored, JSON.stringify(talkAfter));
  await p.keyboard.press("Escape");

  // Same for the practicum: a solved task whose mark the browser refused to save.
  // With js/config.js (port 8767) the task page has the server check; the token is faked, the API is stubbed.
  await p.goto("http://127.0.0.1:8767/#/practice/p-account"); await p.waitForSelector("#practice-solution-p-account");
  await p.evaluate(() => {
    localStorage.clear();
    authState.accessToken = "check-v95";
    window.__realSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (this === localStorage && k === PRACTICE_SOLVED_KEY) throw Error("quota"); return __realSet.call(this, k, v); };
    apiFetch = async path => path === "/runs"
      ? { ok: true, status: 200, json: async () => ({ passed: true, output: "PASS" }) }
      : { ok: true, status: 200, json: async () => ({ version: 8 }) };
    document.getElementById("practice-solution-p-account").value = "package account";
    [...document.querySelectorAll("#view-practice button")].find(b => /Войти и проверить|Проверить на сервере/.test(b.textContent)).click();
  });
  await p.waitForFunction(() => !!document.querySelector("[data-solved-pending]"));
  await p.evaluate(() => { Storage.prototype.setItem = __realSet; return syncMerge({ version: 7, progress: {} }); });
  await p.waitForTimeout(300);
  const practice = await p.evaluate(() => ({
    pending: practiceSolvedStore.pending, notePending: !!document.querySelector("[data-solved-pending]"),
    stored: !!JSON.parse(localStorage.getItem(PRACTICE_SOLVED_KEY) || "{}")["p-account"]
  }));
  ok("practicum: after sync the mark is stored and the note no longer asks to stay", !practice.pending && !practice.notePending && practice.stored, JSON.stringify(practice));

  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
