// v94: the testing guide (table-driven, subtests, drill on W1-2), its links from weeks 1 and 3 and the practicum index, the W1-2 contract.
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const errors = [];
  for (const w of [1280, 390, 320]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => errors.push(`${w} ${e.message}`)); p.on("console", m => { if (m.type() === "error") errors.push(`${w} ${m.text()}`); });

    await p.goto(base + "#/practice/go-testing"); await p.waitForSelector("#practice-title");
    const g = await p.evaluate(() => ({
      title: document.getElementById("practice-title").textContent,
      focus: document.activeElement && document.activeElement.id,
      sections: [...document.querySelectorAll(".practice-guide-section")].map(s => s.id),
      files: [...document.querySelectorAll(".practice-guide-file h4")].map(h => h.textContent),
      steps: [...document.querySelectorAll(".practice-guide-section")].map(s => s.querySelectorAll(".practice-guide-steps > li").length),
      rows: document.querySelectorAll(".practice-guide-commands dt").length,
      table: [...document.querySelectorAll(".practice-guide-section pre")].some(pre => pre.textContent.includes("t.Run(tt.name, func(t *testing.T) {")),
      module: [...document.querySelectorAll(".practice-guide-section pre")].some(pre => pre.textContent.includes("github.com/<ник>/go-prep/week1/calc")),
      links: [...document.querySelectorAll(".practice-guide-links a")].map(a => [a.href.startsWith("https://"), a.target, /noopener/.test(a.rel)]),
      check: document.querySelector("#guide-drill .practice-guide-check")?.textContent || "",
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    ok(`${w}: guide title and focus`, g.title === "Тесты в Go: table-driven, подтесты, тренировка" && g.focus === "practice-title", `${g.title} ${g.focus}`);
    ok(`${w}: eight sections`, g.sections.join() === "guide-basics,guide-table,guide-subtests,guide-helpers,guide-kinds,guide-drill,guide-withdraw,guide-say", g.sections.join());
    ok(`${w}: eight files`, g.files.join() === "div.go,div_test.go,clamp.go,clamp_test.go,example_test.go,bench_test.go,fuzz_test.go,withdraw_test.go", g.files.join());
    ok(`${w}: steps 0/3/2/0/3/4/0/0, ten rows`, g.steps.join() === "0,3,2,0,3,4,0,0" && g.rows === 10, `${g.steps.join()} ${g.rows}`);
    ok(`${w}: table loop, module path placeholder, self-check`, g.table && g.module && g.check.startsWith("Самопроверка."), JSON.stringify([g.table, g.module, g.check.slice(0, 20)]));
    ok(`${w}: eight external links in a new tab`, g.links.length === 8 && g.links.every(([https, t, rel]) => https && t === "_blank" && rel), JSON.stringify(g.links));
    ok(`${w}: no horizontal overflow on the guide`, g.overflow <= 0, g.overflow);

    await p.goto(base + "#/practice/go-testing/drill"); await p.waitForTimeout(300);
    ok(`${w}: section link focuses the drill heading`, await p.evaluate(() => document.activeElement && document.activeElement.id === "guide-drill-title"));

    await p.goto(base + "#/practice"); await p.waitForTimeout(300);
    ok(`${w}: practicum index links the guide`, await p.evaluate(() => !!document.querySelector('#view-practice a.btn[href="#/practice/go-testing"]')));

    await p.goto(base + "#/plan/w1/sat"); await p.waitForTimeout(300);
    const sat = await p.evaluate(() => {
      const item = id => document.getElementById(`plan-task-${id}`)?.closest("li.plan-task");
      const hrefs = id => [...(item(id)?.querySelectorAll("a") || [])].map(a => a.getAttribute("href"));
      const order = [...document.querySelectorAll("li.plan-task input[id^='plan-task-w1-sat']")].map(i => i.id.replace("plan-task-", ""));
      return { exists: !!item("w1-sat-11"), optional: item("w1-sat-11")?.classList.contains("is-optional"), tests: hrefs("w1-sat-11"), money: hrefs("w1-sat-8"), order };
    });
    ok(`${w}: Saturday of week 1 has the required testing task before Money`, sat.exists && sat.optional === false && sat.order.indexOf("w1-sat-11") === sat.order.indexOf("w1-sat-8") - 1, JSON.stringify(sat.order));
    ok(`${w}: testing task links the guide, the drill, W1-2 and c44`, ["#/practice/go-testing", "#/practice/go-testing/drill", "#/practice/p-account", "#/cards/c44"].every(h => sat.tests.includes(h)), JSON.stringify(sat.tests));
    ok(`${w}: Money variation links the table sample`, sat.money.includes("#/practice/go-testing/table"), JSON.stringify(sat.money));

    await p.goto(base + "#/plan/w3/thu"); await p.waitForTimeout(300);
    ok(`${w}: week 3 Thursday links the guide`, await p.evaluate(() => [...(document.getElementById("plan-task-w3-thu-2")?.closest("li.plan-task")?.querySelectorAll("a") || [])].some(a => a.getAttribute("href") === "#/practice/go-testing")));

    await p.goto(base + "#/practice/p-account"); await p.waitForSelector("#practice-title");
    const contract = await p.evaluate(() => [...document.querySelectorAll(".practice-contract")].map(ul => ul.querySelector("li")?.textContent || ""));
    ok(`${w}: W1-2 contract starts with the type shape in RU and EN`, contract.length === 2 && contract[0].includes("ID string") && contract[0].includes("Balance() int64") && contract[1].includes("&Account{ID: \"A\"}"), JSON.stringify(contract));
  }
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.filter(r => r.startsWith("FAIL")).join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
