// v91: the program has 14 weeks — week 1 is stretched over two. Plan and calendar show 14 weeks; weeks 1 and 2 follow
// the approved layout; routes #/plan/w1…w14 match «Неделя N»; marks of Mon/Tue of week 1 survive a reload, and an old
// progress record keeps them; links from weeks 1–2 to practice and guides; the track leads to the right days;
// 1280/390/320 without overflow and console errors. Optional argument: a folder for screenshots of weeks 1 and 2.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
const out = process.argv[2];

// Days and task IDs by the layout approved on 11.11 (V91-TASK); v94 adds w1-sat-11 (tests) before w1-sat-8.
const LAYOUT = {
  w1: [["Пн", ["w1-mon-1", "w1-mon-2", "w1-mon-3"]], ["Вт", ["w1-tue-1", "w1-tue-2", "w1-tue-3"]], ["Ср", ["w1-wed-1", "w1-wed-2"]], ["Чт", ["w1-wed-3"]],
    ["Сб", ["w1-sat-1", "w1-sat-11", "w1-sat-8", "w1-sat-9", "w1-sat-4", "w1-sat-5", "w1-sat-10"]]],
  w2: [["Пн", ["w2-mon-1", "w2-mon-2"]], ["Вт", ["w2-tue-1", "w2-tue-2", "w2-tue-3"]], ["Ср", ["w2-wed-1", "w2-wed-2", "w2-wed-3", "w2-wed-4"]], ["Чт", ["w2-thu-1"]],
    ["Сб", ["w2-sat-1", "w2-sat-2", "w2-sat-3", "w2-sat-4", "w2-sat-5"]]]
};

(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });
    await p.clock.setFixedTime(new Date("2026-11-11T19:00:00+01:00")); // Wednesday of week 1 with the default start 09.11

    // An old progress record (v90): Mon and Tue of week 1 done, Account done on Wednesday, one mark far ahead.
    await p.goto(base + "#/plan"); await p.waitForSelector("#plan-week-title");
    const old = ["w1-mon-1", "w1-mon-2", "w1-mon-3", "w1-tue-1", "w1-tue-2", "w1-tue-3", "w1-wed-3"];
    await p.evaluate(ids => localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-11-09", done: Object.fromEntries([...ids, "w13-sat-3"].map(id => [id, true])) })), old);
    await p.reload(); await p.waitForSelector("#plan-week-title");

    const top = await p.evaluate(() => ({
      chips: [...document.querySelectorAll(".plan-chip")].map(a => a.getAttribute("href")),
      options: [...document.querySelectorAll("#plan-current-week option")].filter(o => o.value).map(o => o.textContent),
      title: document.getElementById("plan-week-title").textContent,
      today: document.getElementById("plan-today").textContent,
      docTitle: document.title,
      status: document.querySelector(".plan-calendar-status").textContent,
      overall: document.getElementById("plan-overall").textContent
    }));
    ok(`${w}: 14 week chips w1…w14`, top.chips.join() === Array.from({ length: 14 }, (_, i) => `#/plan/w${i + 1}`).join(), top.chips.length);
    ok(`${w}: calendar offers 14 weeks`, top.options.length === 14 && top.options[13].startsWith("14. "), top.options.length);
    ok(`${w}: today is week 1, Wednesday`, top.title.startsWith("Неделя 1. Идиомы Go I: типы, методы, интерфейсы") && /неделя 1, Ср: 90 мин/.test(top.today) && /сейчас неделя 1/.test(top.status), `${top.title} | ${top.today.trim()}`);
    ok(`${w}: tab title says 14 weeks`, top.docTitle === "План 14 недель — Go Interview Prep", top.docTitle);

    // Old marks: all kept on their tasks; Account (w1-wed-3) is on Thursday now; a mark of a renamed ID is not shown.
    const marks = await p.evaluate(ids => ({
      checked: ids.filter(id => document.getElementById(`plan-task-${id}`)?.checked),
      accountDay: document.getElementById("plan-task-w1-wed-3")?.closest("section.plan-day")?.id,
      chip: document.querySelector('[data-plan-week="w1"] .plan-chip-count').textContent
    }), old);
    ok(`${w}: Mon, Tue and Account marks kept from the old record`, marks.checked.join() === old.join(), marks.checked.join());
    ok(`${w}: Account (w1-wed-3) sits on Thursday`, marks.accountDay === "plan-w1-thu", marks.accountDay);
    ok(`${w}: week 1 chip counts 7 of 16`, marks.chip === "7/16", marks.chip);

    // A new mark on Monday survives a reload.
    await p.uncheck("#plan-task-w1-mon-1"); await p.check("#plan-task-w1-mon-1");
    await p.reload(); await p.waitForSelector("#plan-week-title");
    ok(`${w}: w1-mon-1 mark is there after reload`, await p.isChecked("#plan-task-w1-mon-1"));

    // Weeks 1 and 2 by the layout: days, tasks, minutes and budget.
    for (const [weekId, days] of Object.entries(LAYOUT)) {
      await p.goto(`${base}#/plan/${weekId}`); await p.waitForSelector("#plan-week-title");
      const got = await p.evaluate(() => ({
        days: [...document.querySelectorAll("section.plan-day")].map(s => [s.querySelector("h3").textContent.split(" · ")[0], [...s.querySelectorAll('input[id^="plan-task-"]')].map(i => i.id.slice(10))]),
        minutes: [...document.querySelectorAll("section.plan-day h3")].map(h => (h.textContent.match(/(\d+) мин/) || [])[1]),
        hours: document.querySelector(".plan-week > p.muted-text").textContent,
        optional: [...document.querySelectorAll("li.plan-task.is-optional input")].map(i => i.id.slice(10)),
        accepts: [...document.querySelectorAll("li.plan-task")].filter(li => !li.classList.contains("is-optional")).every(li => li.querySelector(".plan-accept")),
        overflow: document.documentElement.scrollWidth - innerWidth
      }));
      ok(`${w}: ${weekId} days and tasks by the layout`, JSON.stringify(got.days) === JSON.stringify(days), JSON.stringify(got.days));
      ok(`${w}: ${weekId} weekdays 90 min, Saturday 240, ~10 ч`, got.minutes.join() === "90,90,90,90,240" && /~10 ч/.test(got.hours), `${got.minutes} ${got.hours}`);
      ok(`${w}: ${weekId} every required task has «Готово, когда»`, got.accepts);
      ok(`${w}: ${weekId} optional tasks`, got.optional.join() === (weekId === "w2" ? "w2-tue-3" : ""), got.optional.join());
      ok(`${w}: ${weekId} no horizontal overflow`, got.overflow <= 0, got.overflow);
      if (out && w !== 320) await p.screenshot({ path: `${out}/v91-${weekId}-${w}.png`, fullPage: true });
    }

    // Links from weeks 1–2: practice, guides, the moved model answer, the predict block stays with slices in week 3.
    await p.goto(`${base}#/plan/w1`); await p.waitForSelector("#plan-week-title");
    const w1 = await p.evaluate(() => ({
      practice: [...new Set([...document.querySelectorAll('.plan-day a[href^="#/practice/p-"]')].map(a => a.getAttribute("href")))],
      guides: [...new Set([...document.querySelectorAll('.plan-day a[href^="#/practice/go-"]')].map(a => a.getAttribute("href")))],
      method: document.querySelector("li:has(#plan-task-w1-sat-1) label").textContent,
      selfModel: !!document.querySelector("li:has(#plan-task-w1-sat-10) .plan-model"),
      thuModel: !!document.querySelector("li:has(#plan-task-w1-wed-3) .plan-model"),
      leetcode: [...document.querySelectorAll(".plan-block h3")].some(h => h.textContent === "LeetCode недели") && [...document.querySelectorAll(".plan-block li a")].filter(a => /leetcode\.com/.test(a.href)).map(a => a.textContent.split(".")[0]).join()
    }));
    ok(`${w}: week 1 links Money and Account, not ValidationError or SafeDiv`, w1.practice.join() === "#/practice/p-money,#/practice/p-account", w1.practice.join());
    ok(`${w}: week 1 links the go-prep and go-types guides`, ["#/practice/go-prep", "#/practice/go-types"].every(h => w1.guides.includes(h)), w1.guides.join());
    ok(`${w}: method sets is W1-3, self-check has a model answer, Account has none`, w1.method.startsWith("W1-3 Method sets") && w1.selfModel && !w1.thuModel, w1.method);
    ok(`${w}: LeetCode of week 1 — 1 and 49`, w1.leetcode === "1,49", w1.leetcode);
    await p.goto(`${base}#/plan/w2`); await p.waitForSelector("#plan-week-title");
    const w2 = await p.evaluate(() => ({
      title: document.getElementById("plan-week-title").textContent,
      practice: [...new Set([...document.querySelectorAll('.plan-day a[href^="#/practice/p-"]')].map(a => a.getAttribute("href")))],
      validation: document.querySelector("li:has(#plan-task-w2-mon-2) .plan-model")?.textContent || "",
      talk: document.querySelector("li:has(#plan-task-w2-mon-2) .plan-talk summary")?.textContent || "",
      predict: document.querySelectorAll(".plan-predict").length,
      lc: ["w2-wed-1", "w2-sat-2"].map(id => document.getElementById(`plan-task-${id}`)?.closest("li").classList.contains("is-optional"))
    }));
    ok(`${w}: week 2 title`, w2.title === "Неделя 2. Идиомы Go I: ошибки, defer и panic, повторение", w2.title);
    ok(`${w}: week 2 links ValidationError, defer and SafeDiv, the variations`, ["p-validation", "p-deferpanic", "p-account"].every(id => w2.practice.includes(`#/practice/${id}`)), w2.practice.join());
    ok(`${w}: W2-1 has the Is/As model answer and its own talk`, /Wrap with %w; Is compares, As extracts\./.test(w2.validation) && /W2-1\. ValidationError/.test(w2.talk), w2.talk);
    ok(`${w}: LC 347 and 238 are required in week 2`, w2.lc.join() === "false,false", w2.lc.join());
    ok(`${w}: no predict block in week 2`, w2.predict === 0);
    await p.goto(`${base}#/plan/w3`); await p.waitForSelector("#plan-week-title");
    ok(`${w}: predict block in week 3 (slice and map)`, await p.locator(".plan-predict").count() === 10);

    // Every route #/plan/wN shows «Неделя N.» and its dates.
    const titles = [];
    for (let n = 1; n <= 14; n++) {
      await p.goto(`${base}#/plan/w${n}`); await p.waitForTimeout(80);
      titles.push(await p.evaluate(() => document.getElementById("plan-week-title").textContent));
    }
    ok(`${w}: routes w1…w14 match «Неделя N»`, titles.every((t, i) => t.startsWith(`Неделя ${i + 1}. `)), titles.map(t => t.slice(0, 10)).join("|"));
    ok(`${w}: week 14 is the mocks, 08.02–14.02`, titles[13].includes("Моки и пик откликов") && await p.evaluate(() => /08\.02–14\.02/.test(document.querySelector(".plan-week > p.muted-text").textContent)));

    // Practice: criteria labelled by the new day; codes and the go-prep tree follow the weeks.
    await p.goto(`${base}#/practice/p-validation`); await p.waitForSelector("#practice-title");
    const pv = await p.evaluate(() => ({ text: document.getElementById("view-practice").innerText, hrefs: [...document.querySelectorAll('#view-practice a[href^="#/plan/"]')].map(a => a.getAttribute("href")) }));
    ok(`${w}: W2-1 ValidationError leads to Mon and Wed of week 2`, /W2-1/.test(pv.text) && ["#/plan/w2/mon", "#/plan/w2/wed"].every(h => pv.hrefs.includes(h)) && /mkdir -p week2\/validation/.test(pv.text), pv.hrefs.join());
    await p.goto(`${base}#/practice/p-account`); await p.waitForSelector("#practice-title");
    ok(`${w}: W1-2 Account leads to Thursday of week 1`, await p.evaluate(() => [...document.querySelectorAll('#view-practice a[href^="#/plan/"]')].some(a => a.getAttribute("href") === "#/plan/w1/thu" && /W1 · Чт · w1-wed-3/.test(a.textContent))));
    await p.goto(`${base}#/practice/go-prep/layout`); await p.waitForSelector("#practice-title");
    const tree = await p.evaluate(() => [...document.querySelectorAll("#view-practice pre")].map(pre => pre.textContent).find(t => t.startsWith("go-prep/")) || "");
    ok(`${w}: go-prep tree: week2 holds validation and deferpanic, week3 the assembler drill`, /week2\/\n│   ├── validation\/\s+← W2-1\n│   └── deferpanic\/\s+← W2-2, W2-3/.test(tree) && /week3\/\n│   ├── asm\//.test(tree) && /└── week10\//.test(tree), tree.split("\n").slice(5, 14).join(" | "));

    // The track leads to the right days.
    await p.goto(`${base}#/practice/track-channels`); await p.waitForSelector("#practice-title");
    const when = await p.evaluate(() => Object.fromEntries(["k2-5", "k2-6", "k3-3", "k5-1", "k1-2"].map(id => [id, [...document.querySelectorAll(`#track-${id} .track-when a`)].map(a => a.getAttribute("href")).join() || document.querySelector(`#track-${id} .track-when`)?.textContent.trim()])));
    ok(`${w}: track katas link their plan days`, when["k2-5"] === "#/plan/w6/sat" && when["k2-6"] === "#/plan/w5/sat" && when["k3-3"] === "#/plan/w10/sat" && when["k5-1"] === "#/plan/w13/sat", JSON.stringify(when));
    ok(`${w}: reserve katas name week 5`, /резерв недели 5/.test(when["k1-2"]), when["k1-2"]);
    ok(`${w}: no horizontal overflow on the track`, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
    await ctx.close();
  }

  // Calendar around the program: Monday of week 2 and after the end.
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  const p = await ctx.newPage();
  p.on("pageerror", e => errors.push(`cal ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`cal ${m.text()}`); });
  await p.clock.setFixedTime(new Date("2026-11-16T09:00:00+01:00"));
  await p.goto(base + "#/plan"); await p.waitForSelector("#plan-week-title");
  ok("Mon 16.11 is week 2, Monday", /неделя 2, Пн/.test(await p.textContent("#plan-today")) && (await p.textContent("#plan-week-title")).startsWith("Неделя 2."), (await p.textContent("#plan-today")).trim());
  await p.clock.setFixedTime(new Date("2027-02-20T09:00:00+01:00"));
  await p.reload(); await p.waitForSelector("#plan-week-title");
  ok("after week 14 the plan says 14 weeks are behind", /^14 недель позади/.test(await p.textContent("#plan-today")) && /14 недель позади/.test(await p.textContent(".plan-calendar-status")), (await p.textContent("#plan-today")).trim());
  await ctx.close();

  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.join("\n"));
  console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
