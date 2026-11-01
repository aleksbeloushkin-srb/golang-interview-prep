// v80: c65 (встраивание против наследования) и q52, «Шаг коротко» на 18 шагах (на шагах с predict — только после
// раскрытия), значок Δ и рамка изменённой дорожки, кнопки c47/c50/c59/c62/c63 на шаги диаграмм, строка 21 шпаргалки,
// у недели 1 нет блока «Чего нет».
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w}: ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w}: ${m.text()}`); });
    const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

    // c65: вопрос, короткий ответ, код, JVM, источники; q52 и q34 в связанных quiz.
    await p.goto(`${base}#/cards/c65`); await p.waitForTimeout(400);
    const card = await p.evaluate(() => ({
      q: document.getElementById("card-q-en")?.textContent || document.querySelector("#view-cards h2")?.textContent || "",
      code: document.getElementById("card-code").textContent,
      links: [...document.querySelectorAll("#card-sim-link a")].map(a => a.getAttribute("href"))
    }));
    ok(`${w}: c65 renders with code`, /Premium/.test(card.code) && /Charge\(p, 1000\)/.test(card.code), card.q.slice(0, 60));
    ok(`${w}: c65 links q34 and q52`, card.links.some(h => /q34/.test(h)) && card.links.some(h => /q52/.test(h)), card.links.join(" "));
    ok(`${w}: c65 no horizontal overflow`, (await overflow()) <= 0);
    await p.goto(`${base}#/quiz/q52`); await p.waitForTimeout(400);
    ok(`${w}: q52 opens`, await p.evaluate(() => /SMS|Notifier/.test(document.body.innerText)));

    // Кнопки карточек на шаги диаграмм.
    for (const [id, sim, step] of [["c47", "sim10", 4], ["c50", "sim11", 5], ["c59", "sim10", 7], ["c62", "sim12", 4], ["c63", "sim3", 8]]) {
      await p.goto(`${base}#/cards/${id}`); await p.waitForTimeout(250);
      ok(`${w}: ${id} → ${sim} step ${step}`, !!(await p.$(`#card-sim-link a[href="#/simulators/${sim}/${step}"]`)));
    }

    // «Шаг коротко»: на обычном шаге видно сразу, на шаге с predict — только после раскрытия.
    await p.goto(`${base}#/simulators/sim3/2`); await p.waitForTimeout(400);
    const plain = await p.evaluate(() => { const f = document.querySelector("#sim3-board .board-formula"); return f && f.checkVisibility() ? f.textContent : null; });
    ok(`${w}: sim3 step 2 formula visible`, plain && /^Шаг коротко: gopark → park_m/.test(plain), plain);
    await p.goto(`${base}#/simulators/sim3/3`); await p.waitForTimeout(400);
    const hidden = await p.evaluate(() => { const f = document.querySelector("#sim3-board .board-formula"); return f ? !f.checkVisibility() : "none"; });
    ok(`${w}: sim3 step 3 formula hidden before reveal`, hidden === true, String(hidden));
    await p.evaluate(() => { document.querySelector("#sim3-board .board-reveal").open = true; });
    ok(`${w}: sim3 step 3 formula after reveal`, await p.evaluate(() => document.querySelector("#sim3-board .board-formula").checkVisibility()));
    ok(`${w}: formula steps no overflow`, (await overflow()) <= 0);

    // Δ на изменённой фишке, слово для читалки, рамка дорожки; особая подпись sim9 остаётся словом.
    await p.goto(`${base}#/simulators/sim3/2`); await p.waitForTimeout(400);
    const delta = await p.evaluate(() => {
      const chip = document.querySelector("#sim3-board .g-chip.is-changed");
      const lanes = [...document.querySelectorAll("#sim3-board .board-lane")];
      return { mark: chip?.querySelector(".g-delta")?.textContent, hidden: chip?.querySelector(".visually-hidden")?.textContent,
        aria: chip?.querySelector(".g-delta")?.getAttribute("aria-hidden"), outlined: lanes.filter(l => l.classList.contains("has-change")).length, lanes: lanes.length };
    });
    ok(`${w}: Δ badge with hidden word`, delta.mark === "Δ" && delta.hidden === "изменилось" && delta.aria === "true", JSON.stringify(delta));
    ok(`${w}: only changed lanes outlined`, delta.outlined > 0 && delta.outlined < delta.lanes, JSON.stringify(delta));
    await p.goto(`${base}#/simulators/sim9`); await p.waitForTimeout(300);
    const labels = await p.evaluate(() => { const out = []; for (let i = 0; i < 8; i++) { document.querySelectorAll("#sim9-board .g-changed").forEach(e => out.push(e.textContent)); document.querySelector("#sim9-next")?.click(); } return out; });
    ok(`${w}: sim9 custom label stays a word`, labels.length === 0 || labels.every(t => t !== "Δ"), labels.slice(0, 3).join(","));

    // Шпаргалка: 21 строка, строка 21 ведёт на c59.
    await p.goto(`${base}#/cheatsheet`); await p.waitForTimeout(400);
    const row = await p.evaluate(() => { const rows = [...document.querySelectorAll("#cheatsheet-tbody tr")]; const r = rows[20]; return { n: rows.length, text: r ? r.innerText : "", link: r ? [...r.querySelectorAll("a")].map(a => a.getAttribute("href")).join(" ") : "" }; });
    ok(`${w}: cheat sheet row 21`, row.n === 21 && /Архитектура Go-сервиса/.test(row.text) && /c59/.test(row.link), `${row.n} ${row.link}`);
    ok(`${w}: cheat sheet no overflow`, (await overflow()) <= 0);

    // Неделя 1: блока «Чего для этой недели пока нет на сайте» больше нет.
    await p.goto(`${base}#/plan/w1`); await p.waitForSelector("#plan-week-title");
    ok(`${w}: week 1 has no gaps block`, !(await p.evaluate(() => /Чего для этой недели пока нет на сайте/.test(document.getElementById("view-plan").innerText))));
    await p.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
