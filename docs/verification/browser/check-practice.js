// Browser checks for the practice section (#/practice).
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8765/";
(async () => {
  const browser = await chromium.launch();
  let n = 0, fails = 0;
  const ok = (name, cond, info = "") => { n++; if (!cond) { fails++; console.log("FAIL", name, info); } };

  for (const [w, zoom] of [[1280, 1], [390, 1], [320, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, acceptDownloads: true });
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base.replace(/\/$/, "") });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    p.on("console", m => m.type() === "error" && errors.push(m.text()));
    await p.goto(base + "#/practice");
    await p.waitForTimeout(300);
    if (zoom !== 1) await p.addStyleTag({ content: `html { font-size: ${zoom * 100}% !important; }` });
    const tag = `${w}px${zoom !== 1 ? " ×" + zoom : ""}`;

    const index = await p.evaluate(() => ({
      visible: !document.getElementById("view-practice").classList.contains("hidden"),
      items: document.querySelectorAll(".practice-index-item").length,
      total: PRACTICE.length,
      weeks: document.querySelectorAll(".practice-week").length,
      active: document.querySelector('.tab-btn[data-route="practice"]').getAttribute("aria-current"),
      focus: document.activeElement && document.activeElement.id,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    }));
    ok(`${tag}: index visible with all tasks`, index.visible && index.items === index.total && index.total === 23 && index.weeks === 6, JSON.stringify(index));
    ok(`${tag}: tab marked current`, index.active === "page");
    ok(`${tag}: focus on heading`, index.focus === "practice-title", index.focus);
    ok(`${tag}: index no overflow`, index.overflow <= 0, index.overflow);

    for (const id of await p.evaluate(() => PRACTICE.map(t => t.id))) {
      await p.goto(base + "#/practice/" + id);
      await p.waitForTimeout(150);
      const r = await p.evaluate(id => {
        const task = PRACTICE.find(t => t.id === id);
        const codes = [...document.querySelectorAll("pre.practice-code code")].map(c => c.textContent);
        const closed = [...document.querySelectorAll(".practice-hint, .practice-reference, .practice-tests, .practice-talk")].every(d => !d.open);
        const solutionHidden = !document.querySelector(".practice-reference pre").checkVisibility();
        const planLinks = [...document.querySelectorAll(".practice-section a[href^='#/plan/']")].map(a => a.getAttribute("href"));
        return {
          title: document.getElementById("practice-title").textContent === `${task.code}. ${task.title}`,
          starter: codes.includes(task.files.starter.code),
          tests: codes.includes(task.files.tests.code),
          solution: codes.includes(task.files.solution.code),
          hints: document.querySelectorAll(".practice-hint").length === task.hints.length,
          contract: document.querySelectorAll(".practice-contract")[0].children.length === task.contractRU.length,
          closed, solutionHidden, planLinks,
          docTitle: document.title,
          focus: document.activeElement && document.activeElement.id,
          overflow: document.documentElement.scrollWidth - window.innerWidth
        };
      }, id);
      ok(`${tag} ${id}: title, contract, hints`, r.title && r.contract && r.hints, JSON.stringify(r));
      ok(`${tag} ${id}: starter, tests and solution text match data`, r.starter && r.tests && r.solution);
      ok(`${tag} ${id}: hints, tests, talk and solution start closed`, r.closed && r.solutionHidden);
      ok(`${tag} ${id}: plan links resolve to days`, r.planLinks.length > 0 && r.planLinks.every(h => /^#\/plan\/w\d+\/(mon|tue|wed|thu|fri|sat|sun)$/.test(h)), r.planLinks.join(","));
      ok(`${tag} ${id}: focus on heading and page title`, r.focus === "practice-title" && r.docTitle.includes("Практикум"), r.focus + " " + r.docTitle);
      // Open everything to measure the widest state.
      await p.evaluate(() => document.querySelectorAll("details").forEach(d => (d.open = true)));
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(`${tag} ${id}: no page overflow with all details open`, ov <= 0, ov);
    }

    if (w === 1280) {
      await p.goto(base + "#/practice/p-workerpool");
      await p.waitForTimeout(150);
      await p.getByRole("button", { name: "Скопировать заготовку" }).first().click();
      await p.waitForTimeout(100);
      const clip = await p.evaluate(() => navigator.clipboard.readText());
      const starter = await p.evaluate(() => PRACTICE.find(t => t.id === "p-workerpool").files.starter.code + "\n");
      ok("copy button puts the starter on the clipboard", clip === starter);
      const status = await p.textContent(".practice-copy-status");
      ok("copy reports status", /скопировано/.test(status), status);
      const [download] = await Promise.all([
        p.waitForEvent("download"),
        p.getByRole("button", { name: "Скачать workerpool_test.go" }).click()
      ]);
      ok("download button saves the test file", download.suggestedFilename() === "workerpool_test.go", download.suggestedFilename());
      const path = await download.path();
      const content = require("fs").readFileSync(path, "utf8");
      const tests = await p.evaluate(() => PRACTICE.find(t => t.id === "p-workerpool").files.tests.code + "\n");
      ok("downloaded file content", content === tests);

      // Keyboard: pager link reachable and navigates.
      await p.goto(base + "#/practice/p-workerpool");
      await p.waitForTimeout(150);
      await p.click(".practice-pager a:last-child");
      await p.waitForTimeout(150);
      ok("pager goes to the next task", (await p.evaluate(() => location.hash)) === "#/practice/p-pipeline");

      // Plan shows practice links in week 3.
      await p.goto(base + "#/plan/w3/tue");
      await p.waitForTimeout(300);
      const planLink = await p.evaluate(() => [...document.querySelectorAll("a[href='#/practice/p-workerpool']")].map(a => a.textContent));
      ok("plan week 3 links to W3-1", planLink.some(t => t.includes("W3-1")), planLink.join(" | "));
      const gapGone = await p.evaluate(() => !document.body.innerText.includes("Coding-задание workerpool"));
      ok("plan no longer lists W3-1 as missing on the site", gapGone);

      // Extra commands: go get before the tests, profiling after.
      await p.goto(base + "#/practice/p-parallelfetch");
      await p.waitForTimeout(150);
      let runText = await p.textContent('pre[aria-label="Команды для запуска"]');
      ok("parallelfetch run block has go get before the tests", runText.indexOf("go get golang.org/x/sync@v0.18.0") > 0 && runText.indexOf("go get") < runText.indexOf("go test -race"), runText);
      await p.goto(base + "#/practice/p-escape");
      await p.waitForTimeout(150);
      runText = await p.textContent('pre[aria-label="Команды для запуска"]');
      ok("escape run block ends with -gcflags=-m", runText.indexOf("go build -gcflags=-m .") > runText.indexOf("go test -race"), runText);
      await p.goto(base + "#/plan/w4/wed");
      await p.waitForTimeout(300);
      const w4 = await p.evaluate(() => ({ links: ["p-shutdown", "p-leak"].every(id => document.querySelector(`a[href="#/practice/${id}"]`)), gaps: document.querySelectorAll(".plan-gap").length }));
      ok("plan week 4 links shutdown and leak, no gaps", w4.links && w4.gaps === 0, JSON.stringify(w4));

      // Other routes still work.
      for (const route of ["#/cards", "#/simulators/sim3", "#/quiz/q22", "#/plan", "#/wiki", "#/cheatsheet"]) {
        await p.goto(base + route);
        await p.waitForTimeout(150);
        const view = route.split("/")[1];
        const shown = await p.evaluate(v => !document.getElementById("view-" + v).classList.contains("hidden") && document.getElementById("view-practice").classList.contains("hidden"), view);
        ok(`route ${route} still shows its view`, shown);
      }
      // Unknown task id falls back to the index.
      await p.goto(base + "#/practice/p-nope");
      await p.waitForTimeout(150);
      ok("unknown task shows the index", (await p.locator(".practice-index-item").count()) === 23);
    }
    ok(`${tag}: no console errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
  await browser.close();
  console.log(`${n - fails}/${n} passed`);
})();
