// v96: the new week 3 «Биты и закрепление» — plan, two guides, three practice tasks, card c73 with audio, q56–q58;
// weeks 3–14 moved to 4–15 (slice and map with «Что выведет код» are week 4 now); 15 weeks in the plan.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });

    await p.goto(base + "#/plan/w3"); await p.waitForSelector("#plan-task-w3-mon-4");
    const week = await p.evaluate(() => ({
      title: document.getElementById("plan-week-title").textContent,
      chips: document.querySelectorAll(".plan-chip").length,
      days: [...document.querySelectorAll("section.plan-day")].map(s => [s.querySelector("h3").textContent.split(" · ")[0], [...s.querySelectorAll('input[id^="plan-task-"]')].map(i => i.id.slice(10))]),
      minutes: [...document.querySelectorAll("section.plan-day h3")].map(h => (h.textContent.match(/(\d+) мин/) || [])[1]).join(),
      optional: [...document.querySelectorAll("li.plan-task.is-optional input")].map(i => i.id.slice(10)),
      accepts: [...document.querySelectorAll("li.plan-task")].filter(li => !li.classList.contains("is-optional")).every(li => li.querySelector(".plan-accept")),
      practice: [...new Set([...document.querySelectorAll('.plan-day a[href^="#/practice/p-"]')].map(a => a.getAttribute("href")))],
      guides: [...new Set([...document.querySelectorAll('.plan-day a[href^="#/practice/go-bits"], .plan-day a[href^="#/practice/week3-reviews"]')].map(a => a.getAttribute("href")))],
      models: document.querySelectorAll(".plan-model").length,
      tts: document.querySelectorAll(".plan-model .tts-play").length,
      talks: document.querySelectorAll(".plan-talk").length,
      self: document.querySelectorAll(".plan-selfcheck li, .plan-block li").length,
      predict: document.querySelectorAll(".plan-predict").length,
      overflow: document.documentElement.scrollWidth - innerWidth
    }));
    ok(`${w}: week 3 title`, /Биты и закрепление/.test(week.title), week.title);
    ok(`${w}: 15 weeks in the plan`, week.chips === 15, week.chips);
    ok(`${w}: days Пн Вт Ср Чт Сб, 90/90/90/90/240`, week.days.map(d => d[0]).join() === "Пн,Вт,Ср,Чт,Сб" && week.minutes === "90,90,90,90,240", JSON.stringify(week.days.map(d => d[0])) + week.minutes);
    ok(`${w}: w3-tue-5 (diagram 9) is in Tuesday and required`, week.days[1][1].includes("w3-tue-5") && !week.optional.includes("w3-tue-5"), JSON.stringify(week.days[1]));
    ok(`${w}: only LC 371 is optional`, week.optional.join() === "w3-sat-12", week.optional.join());
    ok(`${w}: every required task has «Готово, когда»`, week.accepts);
    ok(`${w}: practice W3-1…W3-3 and the W1 tasks linked`, ["#/practice/p-perm", "#/practice/p-bitset", "#/practice/p-allocate", "#/practice/p-money", "#/practice/p-account"].every(h => week.practice.includes(h)), JSON.stringify(week.practice));
    ok(`${w}: guides linked`, ["#/practice/go-bits", "#/practice/go-bits/shifts", "#/practice/go-bits/masks", "#/practice/go-bits/tricks", "#/practice/week3-reviews/code", "#/practice/week3-reviews/reference"].every(h => week.guides.includes(h)), JSON.stringify(week.guides));
    ok(`${w}: three model answers, each with 🔊`, week.models === 3 && week.tts === 3, `${week.models}/${week.tts}`);
    ok(`${w}: talk trainer at six tasks`, week.talks === 6, week.talks);
    ok(`${w}: no predict block in week 3`, week.predict === 0, week.predict);
    ok(`${w}: no horizontal overflow on week 3`, week.overflow <= 0, week.overflow);

    await p.goto(base + "#/plan/w4"); await p.waitForTimeout(300);
    const w4 = await p.evaluate(() => ({ title: document.getElementById("plan-week-title").textContent, predict: document.querySelectorAll(".plan-predict").length, removeslice: !!document.querySelector('a[href="#/practice/p-removeslice"]') }));
    ok(`${w}: week 4 is slice, map, strings, generics — with «Что выведет код»`, /slice, map/.test(w4.title) && w4.predict === 10 && w4.removeslice, JSON.stringify(w4));

    for (const [id, sections, files, steps] of [["go-bits", 10, 2, 2], ["week3-reviews", 3, 2, 6]]) {
      await p.goto(base + `#/practice/${id}`); await p.waitForSelector("#practice-title");
      const g = await p.evaluate(() => ({
        sections: document.querySelectorAll(".practice-guide-section").length,
        files: document.querySelectorAll(".practice-guide-file h4").length,
        steps: document.querySelectorAll(".practice-guide-steps > li").length,
        module: [...document.querySelectorAll(".practice-guide-section pre")].every(pre => !pre.textContent.includes("github.com/you/")),
        overflow: document.documentElement.scrollWidth - innerWidth
      }));
      ok(`${w}: ${id}: ${sections} sections, ${files} files, ${steps} steps`, g.sections === sections && g.files === files && g.steps === steps, JSON.stringify(g));
      ok(`${w}: ${id}: no horizontal overflow`, g.overflow <= 0, g.overflow);
    }
    await p.goto(base + "#/practice/go-bits/masks"); await p.waitForTimeout(300);
    ok(`${w}: section link focuses «Маски»`, await p.evaluate(() => document.activeElement && document.activeElement.id === "guide-masks-title"));
    const masks = await p.evaluate(() => document.getElementById("guide-masks").innerText);
    ok(`${w}: masks show the signed field with and without the mask`, masks.includes("1111_1011 = −5") && masks.includes("0000_1011 = 11: по маске"), masks.slice(0, 200));

    await p.goto(base + "#/practice"); await p.waitForTimeout(300);
    const index = await p.evaluate(() => document.getElementById("view-practice").innerText);
    ok(`${w}: practicum lists W3-1, W3-2, W3-3`, ["W3-1", "W3-2", "W3-3"].every(c => index.includes(c)) && index.includes("W4-1"), "");
    await p.goto(base + "#/practice/p-perm"); await p.waitForSelector("#practice-title");
    const perm = await p.evaluate(() => ({ title: document.getElementById("practice-title").textContent, tts: document.querySelectorAll(".tts-play").length, plan: [...document.querySelectorAll('a[href^="#/plan/"]')].map(a => a.getAttribute("href")) }));
    ok(`${w}: W3-1 page: title, 🔊 on the talk, link to week 3`, perm.title.startsWith("W3-1.") && perm.tts >= 1 && perm.plan.some(h => h.startsWith("#/plan/w3")), JSON.stringify(perm));

    await p.goto(base + "#/cards/c73"); await p.waitForTimeout(300);
    const card = await p.evaluate(() => ({ q: document.getElementById("card-q-en")?.textContent || "", short: document.querySelectorAll("#card-short-tts .tts-play").length, jvm: document.querySelectorAll("#card-jvm .tts-play").length }));
    ok(`${w}: c73 shows with 🔊 for the short answer and the Java comparison`, /bitwise operators/.test(card.q) && card.short === 1 && card.jvm === 1, JSON.stringify(card));
    await p.goto(base + "#/quiz/q58"); await p.waitForTimeout(300);
    ok(`${w}: q58 opens`, await p.evaluate(() => document.body.innerText.includes("Задача 58")));
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
