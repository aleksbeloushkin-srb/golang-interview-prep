// v86: трек «Каналы и context» (#/practice/track-channels): блоки, каты, чужой код, переход на кату и блок;
// отметки только в плане — ✓ на треке из go_prep_plan_v1; план недель 5–13: «Пт» с LeetCode в неделях 6–9, каты
// субботы, «Готово, когда» из трека, ссылки на блоки, часы недели; практикум: новые задачи W6-3, W7-4, W10-1 и блок
// «Вариация» у W4-1; испорченное хранилище плана; «Назад». Скриншоты трека — если передана папка.
const { chromium } = require("playwright");
const shots = process.argv[2];
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(`${w}: ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w}: ${m.text()}`); });
    const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

    // Трек целиком.
    await p.goto(`${base}#/practice/track-channels`); await p.waitForSelector("#practice-title");
    const t = await p.evaluate(() => ({
      title: document.getElementById("practice-title").textContent, doc: document.title, focus: document.activeElement.id,
      toc: [...document.querySelectorAll(".practice-guide-toc a")].map(a => a.getAttribute("href")),
      blocks: [...document.querySelectorAll(".practice-track .practice-guide-section")].map(s => s.id),
      steps: [...document.querySelectorAll(".track-step")].map(li => li.id),
      done: document.querySelectorAll(".track-step.is-done").length,
      everyDoneWhen: [...document.querySelectorAll(".track-step")].every(li => /Готово, когда:/.test(li.textContent)),
      reviews: document.querySelectorAll(".track-review").length,
      reviewsClosed: [...document.querySelectorAll(".track-review")].every(d => !d.open),
      externalSafe: [...document.querySelectorAll(".practice-track a[target=_blank]")].every(a => a.href.startsWith("https://") && /noopener/.test(a.rel)),
      inlineCode: document.querySelectorAll(".track-step code").length,
      summary: document.querySelector(".practice-track .accent-text").textContent
    }));
    ok(`${w}: track title, tab title, focus`, t.title === "Трек: каналы и context" && t.doc === "Трек: каналы и context — Практикум" && t.focus === "practice-title", JSON.stringify([t.title, t.doc, t.focus]));
    ok(`${w}: five blocks with toc`, t.blocks.join() === "guide-k1,guide-k2,guide-k3,guide-k4,guide-k5" && t.toc.join() === ["k1", "k2", "k3", "k4", "k5"].map(id => `#/practice/track-channels/${id}`).join(), t.toc.join());
    ok(`${w}: 28 steps, each with «Готово, когда», inline code rendered`, t.steps.length === 28 && t.steps[0] === "track-k1-1" && t.steps.includes("track-k5-1") && t.everyDoneWhen && t.inlineCode > 40, `${t.steps.length} ${t.inlineCode}`);
    ok(`${w}: no marks yet; summary counts plan days`, t.done === 0 && /Шагов: 28; в днях плана — 14, из них отмечено 0/.test(t.summary), t.summary);
    ok(`${w}: four review fragments, closed; external links https + noopener`, t.reviews === 4 && t.reviewsClosed && t.externalSafe, JSON.stringify([t.reviews, t.reviewsClosed, t.externalSafe]));
    ok(`${w}: track no overflow`, (await overflow()) <= 0, await overflow());
    if (shots && w !== 320) await p.screenshot({ path: `${shots}/v86-track-${w}.png` });

    // Чужой код: ответ — после своего разбора.
    await p.click("#track-k3-7 .track-review > summary");
    const r = await p.evaluate(() => { const d = document.querySelector("#track-k3-7 .track-review"); return { code: /out <- v/.test(d.querySelector("pre").textContent), answerClosed: !d.querySelector(".practice-reference").open }; });
    ok(`${w}: review shows code, answer stays closed`, r.code && r.answerClosed, JSON.stringify(r));
    ok(`${w}: open review no overflow`, (await overflow()) <= 0, await overflow());

    // Переход на кату и на блок: фокус, заголовок под шапкой.
    for (const [hash, id] of [["k2-6", "track-k2-6-title"], ["k3", "guide-k3-title"]]) {
      await p.evaluate(h => { location.hash = `#/practice/track-channels/${h}`; }, hash); await p.waitForTimeout(300);
      const pos = await p.evaluate(target => { const h = document.querySelector("header").getBoundingClientRect(); const r = document.getElementById(target).getBoundingClientRect(); return { focus: document.activeElement.id, top: Math.round(r.top), header: Math.max(0, Math.round(h.bottom)) }; }, id);
      ok(`${w}: #/practice/track-channels/${hash} focuses and shows the heading below the header`, pos.focus === id && pos.top >= pos.header && pos.top < 300, JSON.stringify(pos));
    }

    // Отметка в плане → ✓ на треке.
    await p.evaluate(() => localStorage.setItem("go_prep_plan_v1", JSON.stringify({ schema: 1, start: "2026-10-12", done: { "w6-sat-4": true, "w10-sat-2": true } })));
    await p.goto(`${base}#/practice/track-channels`); await p.waitForSelector("#practice-title");
    const m = await p.evaluate(() => ({
      done: [...document.querySelectorAll(".track-step.is-done")].map(li => li.id),
      k25: document.querySelector("#track-k2-5 .track-when").textContent,
      summary: document.querySelector(".practice-track .accent-text").textContent
    }));
    ok(`${w}: plan marks show on the track (w6-sat-4 → К2.5, w10-sat-2 → К3.3, К3.7)`, m.done.join() === "track-k2-5,track-k3-3,track-k3-7" && /W6 · Сб ✓/.test(m.k25) && /отмечено 3/.test(m.summary), JSON.stringify(m));

    // Испорченное хранилище плана: трек рисуется без отметок.
    await p.evaluate(() => localStorage.setItem("go_prep_plan_v1", "{broken"));
    await p.goto(`${base}#/practice/track-channels/k1`); await p.waitForSelector("#practice-title");
    ok(`${w}: corrupt plan storage — track still renders, no marks`, (await p.$$(".track-step")).length === 28 && (await p.$$(".track-step.is-done")).length === 0);
    await p.evaluate(() => localStorage.removeItem("go_prep_plan_v1"));

    // План: неделя 6 — пятница с LeetCode, суббота с катами.
    await p.goto(`${base}#/plan/w6`); await p.waitForSelector("#plan-week-title");
    const w5 = await p.evaluate(() => {
      const heads = [...document.querySelectorAll("h3")].map(h => h.textContent);
      const fri = heads.find(h => /^Пт ·/.test(h)) || "";
      const friSection = document.getElementById("plan-w6-fri");
      const sat = document.getElementById("plan-task-w6-sat-4").closest("li");
      return {
        fri, friLc: !!friSection && !!friSection.querySelector("#plan-task-w6-sat-3") && !document.getElementById("plan-w6-sat").querySelector("#plan-task-w6-sat-3"),
        order: heads.filter(h => /^(Пн|Вт|Ср|Чт|Пт|Сб|Вс) ·/.test(h)).map(h => h.slice(0, 2)).join(),
        kataLink: !!sat.querySelector('a[href="#/practice/track-channels/k2-5"]'), practiceLink: !!sat.querySelector('a[href="#/practice/p-timeout"]'),
        accept: sat.querySelector(".plan-accept").textContent, acceptCode: sat.querySelectorAll(".plan-accept code").length,
        hours: document.querySelector(".plan-week .muted-text").textContent,
        reserve: [...document.querySelectorAll(".plan-week .muted-text")].map(e => e.textContent).find(x => /Бюджет/.test(x)) || "",
        materials: [...document.querySelectorAll(".plan-materials-group h4")].map(h => h.textContent).join()
      };
    });
    ok(`${w}: w5 has Friday 45 min with LC 215 (same task ID)`, / 45 мин/.test(w5.fri) && w5.friLc && w5.order === "Пн,Вт,Ср,Чт,Пт,Сб", JSON.stringify([w5.fri, w5.order]));
    ok(`${w}: w5 Saturday kata task links the kata and the practice`, w5.kataLink && w5.practiceLink, "");
    ok(`${w}: «Готово, когда» of a kata task comes from the track, with code`, /close\(done\)/.test(w5.accept) && w5.acceptCode >= 3, w5.accept);
    ok(`${w}: week hours from day minutes; reserve is Sunday only`, /~10 ч 45 мин/.test(w5.hours) && /~10 ч 45 мин/.test(w5.reserve) && /в резерв \(Вс\)/.test(w5.reserve), JSON.stringify([w5.hours, w5.reserve]));
    ok(`${w}: materials of the week have a «Ката» group`, /Ката \(2\)/.test(w5.materials), w5.materials);
    ok(`${w}: plan no overflow`, (await overflow()) <= 0, await overflow());

    // Недели без пятницы: резерв по-прежнему «Пт/Вс».
    await p.goto(`${base}#/plan/w4`); await p.waitForSelector("#plan-week-title");
    ok(`${w}: weeks without a Friday keep reserve Пт/Вс`, /в резерв \(Пт\/Вс\)/.test(await p.evaluate(() => document.querySelector(".plan-week").textContent)));

    // Неделя 5: «финальный босс» и ссылки на блоки 1–2; переход по ссылке на кату и «Назад».
    await p.goto(`${base}#/plan/w5/sat`); await p.waitForSelector("#plan-week-title");
    const w4 = await p.evaluate(() => { const li = document.getElementById("plan-task-w5-sat-5").closest("li"); return { text: li.textContent, hrefs: [...li.querySelectorAll("a")].map(a => a.getAttribute("href")) }; });
    ok(`${w}: w5-sat-5 is the final boss, links K2.6 and blocks 1–2`, /финальный босс/.test(w4.text) && ["k2-6", "k1", "k2"].every(id => w4.hrefs.includes(`#/practice/track-channels/${id}`)), w4.hrefs.join());
    await p.click('#plan-task-w5-sat-5 ~ * a[href="#/practice/track-channels/k2-6"], li:has(#plan-task-w5-sat-5) a[href="#/practice/track-channels/k2-6"]');
    await p.waitForTimeout(300);
    ok(`${w}: kata link opens the step`, (await p.evaluate(() => [location.hash, document.activeElement.id].join())) === "#/practice/track-channels/k2-6,track-k2-6-title");
    await p.goBack(); await p.waitForTimeout(300);
    ok(`${w}: Back returns to the plan day`, /^#\/plan\/w5/.test(await p.evaluate(() => location.hash)) && !!(await p.$("#plan-task-w5-sat-5")));

    // Недели 10 и 13.
    await p.goto(`${base}#/plan/w10/sat`); await p.waitForSelector("#plan-week-title");
    const w9 = await p.evaluate(() => [...document.getElementById("plan-task-w10-sat-2").closest("li").querySelectorAll("a")].map(a => a.getAttribute("href")));
    ok(`${w}: w10-sat-2 reviews K3.3 and K3.7 with the practice`, ["#/practice/track-channels/k3-3", "#/practice/track-channels/k3-7", "#/practice/p-tee"].every(h => w9.includes(h)), w9.join());
    await p.goto(`${base}#/plan/w13/sat`); await p.waitForSelector("#plan-week-title");
    ok(`${w}: w13-sat-2 is the timed run`, !!(await p.$('li:has(#plan-task-w13-sat-2) a[href="#/practice/track-channels/k5-1"]')));

    // Практикум: оглавление, новые задачи, «Вариация».
    await p.goto(`${base}#/practice`); await p.waitForSelector("#practice-title");
    const idx = await p.evaluate(() => ({ track: !!document.querySelector('#view-practice a.btn[href="#/practice/track-channels"]'), weeks: [...document.querySelectorAll(".practice-week h3")].map(h => h.textContent).join(), tasks: document.querySelectorAll(".practice-index-item").length }));
    ok(`${w}: practice index: track button, 26 tasks, week 10`, idx.track && idx.tasks === 26 && /Неделя 10/.test(idx.weeks), JSON.stringify(idx));
    for (const [id, code] of [["p-timeout", "W6-3"], ["p-fanout", "W7-4"], ["p-tee", "W10-1"]]) {
      await p.goto(`${base}#/practice/${id}`); await p.waitForSelector("#practice-title");
      const task = await p.evaluate(() => ({ title: document.getElementById("practice-title").textContent, variation: [...document.querySelectorAll(".track-variation a")].map(a => a.getAttribute("href")), plan: [...document.querySelectorAll(".practice-section a")].some(a => /^#\/plan\//.test(a.getAttribute("href"))) }));
      ok(`${w}: ${id} page (${code}) with plan day and kata variation`, task.title.startsWith(`${code}.`) && task.variation.length >= 1 && task.plan, JSON.stringify(task));
      ok(`${w}: ${id} no overflow`, (await overflow()) <= 0, await overflow());
    }
    await p.goto(`${base}#/practice/p-workerpool`); await p.waitForSelector("#practice-title");
    const v = await p.evaluate(() => { const box = document.querySelector(".track-variation"); return box ? { href: box.querySelector("a").getAttribute("href"), text: box.textContent } : null; });
    ok(`${w}: W4-1 shows K3.5 as a variation from the track`, v && v.href === "#/practice/track-channels/k3-5" && /все три проходят тесты W4-1/.test(v.text), JSON.stringify(v));
    if (shots && w !== 320) await p.screenshot({ path: `${shots}/v86-practice-${w}.png` });
    await ctx.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
