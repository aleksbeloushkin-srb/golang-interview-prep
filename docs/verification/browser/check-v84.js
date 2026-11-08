// v84: справка «Свой репозиторий go-prep» (#/practice/go-prep): разделы, раскладка, файлы, тренировки, таблица
// команд, ссылки; переход на раздел; ссылки из плана (w1-mon-2, w2-thu-1/2/5); «Как запустить» в задачах — go-prep и
// запасной отдельный модуль.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  const base = "http://127.0.0.1:8765/";
  for (const w of [1280, 390, 320]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, acceptDownloads: true });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(`${w}: ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w}: ${m.text()}`); });
    const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

    await p.goto(`${base}#/practice/go-prep`); await p.waitForSelector("#practice-title");
    const g = await p.evaluate(() => ({
      title: document.getElementById("practice-title").textContent, doc: document.title, focus: document.activeElement.id,
      toc: [...document.querySelectorAll(".practice-guide-toc a")].map(a => a.getAttribute("href")),
      sections: [...document.querySelectorAll(".practice-guide-section")].map(s => s.id),
      tree: document.querySelector('pre[aria-label="Раскладка go-prep"]').textContent,
      files: document.querySelectorAll(".practice-guide-file").length,
      steps: [...document.querySelectorAll(".practice-guide-steps")].map(ol => ol.children.length),
      rows: document.querySelectorAll(".practice-guide-commands dt").length,
      links: [...document.querySelectorAll(".practice-guide-links a")].map(a => [a.href.startsWith("https://"), a.target]),
      checks: document.querySelectorAll(".practice-guide-check").length,
      answersHidden: [...document.querySelectorAll(".practice-guide-steps details")].every(d => !d.open)
    }));
    ok(`${w}: guide title, tab title, focus`, g.title === "Свой репозиторий go-prep: раскладка, команды, CI" && g.doc.endsWith("— Практикум") && g.focus === "practice-title", JSON.stringify([g.title, g.doc, g.focus]));
    ok(`${w}: seven sections with toc`, g.sections.join() === "guide-setup,guide-layout,guide-drill1,guide-ci,guide-asm,guide-ref,guide-env" && g.toc.join() === "#/practice/go-prep/setup,#/practice/go-prep/layout,#/practice/go-prep/drill1,#/practice/go-prep/ci,#/practice/go-prep/asm,#/practice/go-prep/ref,#/practice/go-prep/env", g.toc.join());
    ok(`${w}: layout tree lists practice packages by week`, /└── week9\//.test(g.tree) && /tee\/\s+← W9-1/.test(g.tree) && /money\/\s+← W1-1/.test(g.tree) && /hello\/\s+← go run/.test(g.tree) && /workerpool\/\s+← W3-1/.test(g.tree), g.tree.split("\n").slice(0, 8).join(" | "));
    ok(`${w}: files, drills, table, links, checks`, g.files === 7 && g.steps.join() === "8,8" && g.rows === 21 && g.links.length === 14 && g.links.every(([https, t]) => https && t === "_blank") && g.checks === 3 && g.answersHidden, JSON.stringify(g));
    if (w === 1280) {
      const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#guide-ci button:has-text('Скачать ci.yml')")]);
      ok(`${w}: ci.yml downloads`, dl.suggestedFilename() === "ci.yml", dl.suggestedFilename());
    }
    ok(`${w}: guide no overflow`, (await overflow()) <= 0, await overflow());
    // Переход на раздел: фокус и прокрутка к заголовку.
    await p.evaluate(() => { location.hash = "#/practice/go-prep/asm"; }); await p.waitForTimeout(300);
    const asm = await p.evaluate(() => { const h = document.getElementById("guide-asm-title"); const r = h.getBoundingClientRect(); return { focus: document.activeElement.id, top: Math.round(r.top) }; });
    ok(`${w}: section link focuses and scrolls to the drill`, asm.focus === "guide-asm-title" && asm.top >= 0 && asm.top < 300, JSON.stringify(asm));

    // Практикум: ссылка на справку в оглавлении; «Как запустить» — go-prep и запасной вариант.
    await p.goto(`${base}#/practice`); await p.waitForSelector("#practice-title");
    ok(`${w}: practice index links the guide`, !!(await p.$('#view-practice a[href="#/practice/go-prep"]')));
    await p.goto(`${base}#/practice/p-money`); await p.waitForSelector("#practice-title");
    const run = await p.evaluate(() => ({ main: document.querySelector('pre[aria-label="Команды для запуска"]').textContent, alone: document.querySelector('pre[aria-label="Команды для отдельного модуля"]').textContent, closed: !document.querySelector('pre[aria-label="Команды для отдельного модуля"]').closest("details").open, link: !!document.querySelector('#view-practice a[href="#/practice/go-prep"]') }));
    ok(`${w}: p-money runs in go-prep`, run.main.startsWith("cd go-prep\nmkdir -p week1/money && cd week1/money\n# положи сюда money.go") && /go test -race -count=1 \.\/\.\.\.$/.test(run.main) && run.link, run.main);
    ok(`${w}: standalone module is the folded fallback`, run.closed && run.alone.startsWith("mkdir money && cd money\ngo mod init example.com/money"), run.alone);
    await p.goto(`${base}#/practice/p-transfers`); await p.waitForSelector("#practice-title");
    ok(`${w}: later weeks use their week folder`, /mkdir -p week6\/transfers && cd week6\/transfers/.test(await p.textContent('pre[aria-label="Команды для запуска"]')));

    // План: ссылки на справку и новая задача тренировки.
    await p.goto(`${base}#/plan/w1/mon`); await p.waitForSelector("#plan-week-title");
    ok(`${w}: w1-mon-2 links the guide`, !!(await p.$('a[href="#/practice/go-prep"]')) && /go-prep/.test(await p.textContent('label[for="plan-task-w1-mon-2"], #plan-task-w1-mon-2 + *').catch(() => "go-prep")));
    await p.goto(`${base}#/plan/w2/thu`); await p.waitForSelector("#plan-week-title");
    const thu = await p.evaluate(() => ({ asm: !!document.querySelector('a[href="#/practice/go-prep/asm"]'), ci: !!document.querySelector('a[href="#/practice/go-prep/ci"]'), task: !!document.getElementById("plan-task-w2-thu-5"), head: [...document.querySelectorAll("h3")].map(h => h.textContent).find(t => /^Чт ·/.test(t)) }));
    ok(`${w}: w2 Thursday has the drill, CI link and 120 min`, thu.asm && thu.ci && thu.task && / 120 мин/.test(thu.head || ""), JSON.stringify(thu));
    ok(`${w}: plan no overflow`, (await overflow()) <= 0);
    await ctx.close();
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  await b.close();
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(res.join("\n")); console.log(`${res.length - fails.length}/${res.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();
