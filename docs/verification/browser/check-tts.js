// Audio: 🔊 only where a recording matches the text; play/stop, voice switch, L key, plan and practice.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [390, 1280]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage();
    p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const audioReq = [];
    p.on("response", r => { if (r.url().includes("/audio/en/")) audioReq.push(`${r.status()} ${r.url().split("/").pop()}`); });
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(200);
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    ok(`${w}: c39 short has 🔊 and voice switch`, await p.locator("#card-short-tts .tts-play").count() === 1 && (await p.textContent("#card-short-tts .tts-voice")).includes("Michael"));
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(600);
    const playing = await p.evaluate(() => ({ key: ttsState.key, paused: ttsState.audio ? ttsState.audio.paused : null, src: ttsState.audio && ttsState.audio.src, label: document.querySelector("#card-short-tts .tts-play").textContent }));
    ok(`${w}: play starts Michael and shows Стоп`, playing.key === "card:c39:short" && playing.paused === false && /michael/.test(playing.src) && playing.label.includes("Стоп"), JSON.stringify(playing));
    ok(`${w}: mp3 served`, audioReq.some(r => r.startsWith("200") || r.startsWith("206")), audioReq.join(","));
    await p.click("#card-short-tts .tts-voice"); await p.waitForTimeout(400);
    const heart = await p.evaluate(() => ({ src: ttsState.audio && ttsState.audio.src, saved: localStorage.getItem("go_prep_tts_voice_v1"), label: document.querySelector("#card-short-tts .tts-voice").textContent }));
    ok(`${w}: voice switch restarts with Heart and remembers it`, /heart/.test(heart.src) && heart.saved === "heart" && heart.label.includes("Heart"), JSON.stringify(heart));
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(100);
    ok(`${w}: second click stops`, await p.evaluate(() => ttsState.audio === null && document.querySelector("#card-short-tts .tts-play").textContent.includes("Слушать")));
    // Java comparison of c39 has its own recording.
    await p.evaluate(() => { document.querySelector("#card-jvm .jvm-box").open = true; });
    ok(`${w}: Java comparison has 🔊`, await p.locator("#card-jvm .tts-play").count() === 1);
    // L key toggles the short answer.
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    await p.keyboard.press("l"); await p.waitForTimeout(300);
    ok(`${w}: L plays the short answer`, await p.evaluate(() => ttsState.key === "card:c39:short" && !ttsState.audio.paused));
    // Next card stops the sound; a card without a recording has no button.
    await p.goto(base + "#/cards/c3"); await p.waitForTimeout(200);
    ok(`${w}: changing card stops audio`, await p.evaluate(() => ttsState.audio === null));
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    ok(`${w}: c3 (not recorded yet) has no 🔊`, await p.locator("#card-short-tts .tts-play").count() === 0);
    ok(`${w}: c3 says the recording is not there yet`, (await p.textContent("#card-short-tts")).includes("записи пока нет"));
    // Changed text → recording hidden.
    await p.evaluate(() => { CARDS.find(c => c.id === "c39").shortEN += " Changed."; });
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(200);
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    ok(`${w}: stale recording is not offered`, await p.locator("#card-short-tts .tts-play").count() === 0);
    // Plan model answers and practice talk.
    await p.goto(base + "#/plan/w1"); await p.waitForTimeout(300);
    const plan = await p.evaluate(() => ({ models: document.querySelectorAll(".plan-model").length, tts: document.querySelectorAll(".plan-model .tts-play").length }));
    ok(`${w}: week 1 model answers have 🔊`, plan.models === 11 && plan.tts === 11, JSON.stringify(plan));
    await p.goto(base + "#/plan/w2"); await p.waitForTimeout(300);
    ok(`${w}: week 2 model answers have 🔊`, await p.locator(".plan-model .tts-play").count() === await p.locator(".plan-model").count());
    await p.goto(base + "#/plan/w4"); await p.waitForTimeout(300);
    ok(`${w}: week 4 (not recorded) has none`, await p.locator(".plan-model .tts-play").count() === 0);
    await p.goto(base + "#/practice/p-money"); await p.waitForTimeout(300);
    ok(`${w}: practice talk has 🔊`, await p.locator(".practice-talk .tts-play").count() === 1);
    await p.goto(base + "#/wiki"); await p.waitForTimeout(300);
    ok(`${w}: wiki short answers of week 1 have 🔊`, await p.evaluate(() => ["c33", "c34", "c35", "c39", "c40"].every(id => document.querySelector(`#wiki-${id} .short-answer .tts-play`))));
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`${w}: no overflow`, over <= 0, `${over}`);
    await p.close();
  }
  // U4: storage blocked — the voice still switches within the tab.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
    await ctx.addInitScript(() => {
      const deny = () => { throw new DOMException("blocked", "SecurityError"); };
      Storage.prototype.getItem = deny; Storage.prototype.setItem = deny; Storage.prototype.removeItem = deny;
    });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push("U4 " + e.message));
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(300);
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    await p.click("#card-short-tts .tts-voice"); await p.waitForTimeout(100);
    ok("U4: voice switches with storage blocked", (await p.textContent("#card-short-tts .tts-voice")).includes("Heart"));
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(400);
    ok("U4: plays the chosen voice", await p.evaluate(() => /heart/.test(ttsState.audio && ttsState.audio.src)));
    const title = await p.getAttribute("#card-short-tts .tts-voice", "title");
    ok("voice button says the recording restarts", /начнётся сначала/.test(title), title);
    await ctx.close();
  }
  // U3: a recording that fails to load says so and offers a retry.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
    const p = await ctx.newPage();
    await p.route("**/audio/en/**", r => r.abort());
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(300);
    await p.click("#reveal-btn"); await p.waitForTimeout(100);
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(800);
    const err = await p.evaluate(() => ({ label: document.querySelector("#card-short-tts .tts-play").textContent, status: document.querySelector("#card-short-tts .tts-status").textContent, role: document.querySelector("#card-short-tts .tts-status").getAttribute("role") }));
    ok("U3: failed load shows a message and a retry", err.label.includes("Повторить") && err.status.includes("не загрузилась") && err.role === "status", JSON.stringify(err));
    await p.unroute("**/audio/en/**");
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(600);
    const back = await p.evaluate(() => ({ playing: Boolean(ttsState.audio && !ttsState.audio.paused), status: document.querySelector("#card-short-tts .tts-status").textContent }));
    ok("U3: retry plays once the network is back", back.playing && back.status === "", JSON.stringify(back));
    await p.evaluate(() => nextCard()); await p.waitForTimeout(150);
    await p.route("**/audio/en/**", r => r.abort());
    await p.goto(base + "#/cards/c33"); await p.waitForTimeout(200); await p.click("#reveal-btn");
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(600);
    await p.goto(base + "#/cards/c34"); await p.waitForTimeout(200); await p.click("#reveal-btn"); await p.waitForTimeout(100);
    ok("U3: another card does not keep the old error", await p.evaluate(() => document.querySelector("#card-short-tts .tts-status").textContent === "" && document.querySelector("#card-short-tts .tts-play").textContent.includes("Слушать")));
    await ctx.close();
  }
  // U1: an empty search result stops the sound and shows a clean card.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push("U1 " + e.message));
    await p.goto(base + "#/cards/c39"); await p.waitForTimeout(300);
    await p.click("#card-anchors .hint-btn"); await p.click("#reveal-btn"); await p.waitForTimeout(100);
    await p.click("#card-short-tts .tts-play"); await p.waitForTimeout(400);
    await p.evaluate(() => { const d = document.querySelector("#search-input").closest("details"); if (d) d.open = true; });
    await p.fill("#search-input", "zzzz-no-such-card"); await p.waitForTimeout(200);
    const empty = await p.evaluate(() => ({ audio: ttsState.audio === null, anchors: document.getElementById("card-anchors").innerHTML.trim() === "", criteria: document.getElementById("grade-criteria").classList.contains("hidden"), grades: document.querySelector(".card-grades").classList.contains("hidden"), counter: document.getElementById("card-counter").textContent }));
    ok("U1: empty result — no sound, no anchors, no criteria", empty.audio && empty.anchors && empty.criteria && empty.grades && empty.counter.includes("0 из 0"), JSON.stringify(empty));
    await p.fill("#search-input", ""); await p.waitForTimeout(200);
    ok("U1: clearing the search shows a clean question", await p.evaluate(() => Boolean(document.querySelector("#card-anchors .hint-btn")) && !document.getElementById("card-answer-box").classList.contains("visible")));
    await ctx.close();
  }
  // Voice preference is not synced as progress.
  ok("voice key excluded from sync", await (async () => { const p = await b.newPage(); await p.goto("http://127.0.0.1:8767/"); const r = await p.evaluate(() => SYNC_EXCLUDE.has("go_prep_tts_voice_v1")); await p.close(); return r; })());
  ok("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(res.join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
