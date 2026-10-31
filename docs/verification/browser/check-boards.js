// Scheduler boards (sim1, sim2), compact step pills, keyboard navigation and regression of other simulators.
const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const p = await (await b.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(base + "#/simulators"); await p.waitForTimeout(400);

  const info = await p.evaluate(() => SIMULATORS.map((s, i) => ({ id: s.id, i, steps: s.steps.length, boards: s.steps.map(st => !!st.board) })));
  for (const sim of info) {
    for (let k = 0; k < sim.steps; k++) {
      const r = await p.evaluate(([i, k, id]) => {
        renderSimStep(i, k);
        const step = SIMULATORS[i].steps[k];
        const panels = Array.isArray(step.board) ? step.board : step.board ? [step.board] : [];
        const hl = panels.flatMap(pn => pn.hl || []);
        const root = document.getElementById(`${id}-board`);
        const table = document.getElementById(`${id}-table`);
        const grid = document.getElementById(`${id}-grid`);
        return {
          hasBoard: panels.length > 0,
          panels: root.querySelectorAll(".board-panel").length,
          expectPanels: panels.length,
          lanes: root.querySelectorAll(".board-lane").length,
          expectLanes: panels.reduce((n, pn) => n + (pn.lanes || []).length, 0),
          changed: [...root.querySelectorAll(".g-chip.is-changed .g-id")].map(e => e.textContent),
          expectChanged: panels.flatMap(pn => (pn.lanes || []).flatMap(l => l.slots.flatMap(sl => sl.items)).filter(it => (pn.hl || []).includes(typeof it === "string" ? it : it.g) || (typeof it === "object" && it.hl === true)).map(it => typeof it === "string" ? it : it.g)),
          hl,
          changeLists: root.querySelectorAll(".board-changes li").length,
          expectChanges: panels.reduce((n, pn) => n + ((pn.list && pn.list.items.length) || 0), 0),
          tableHidden: table.classList.contains("hidden"),
          gridInTable: grid.parentElement === table,
          lanesLabelled: [...root.querySelectorAll(".board-lane")].every(l => (l.getAttribute("aria-label") || "").length > 0),
          gridRows: grid.querySelectorAll(".reg-row").length,
          boxRows: (step.boxes || []).reduce((n, bx) => n + bx.rows.length, 0)
        };
      }, [sim.i, k, sim.id]);
      const tag = `${sim.id} step ${k + 1}`;
      if (r.hasBoard) {
        ok(`${tag}: panels and lanes rendered`, r.panels === r.expectPanels && r.lanes === r.expectLanes, `${r.panels}/${r.expectPanels} ${r.lanes}/${r.expectLanes}`);
        ok(`${tag}: highlighted chips match the data`, JSON.stringify([...r.changed].sort()) === JSON.stringify([...r.expectChanged].sort()), `${r.changed.join(",")} vs ${r.expectChanged.join(",")}`);
        ok(`${tag}: changes list rendered`, r.changeLists === r.expectChanges && r.expectChanges > 0, `${r.changeLists}`);
        ok(`${tag}: table collapsed under details (hidden when the step has no table)`, (r.boxRows ? (!r.tableHidden && r.gridInTable) : r.tableHidden) && r.gridRows === r.boxRows);
        ok(`${tag}: lanes labelled`, r.lanesLabelled);
      } else {
        ok(`${tag}: no board, table shown as before`, r.panels === 0 && r.tableHidden && !r.gridInTable && r.gridRows === r.boxRows);
      }
    }
  }

  // Going from a board step back to a non-board simulator keeps tables visible; back-and-forth within sim2.
  const back = await p.evaluate(() => { const i = SIMULATORS.findIndex(s => s.id === "sim2"); renderSimStep(i, 4); renderSimStep(i, 0);
    return document.getElementById("sim2-grid").parentElement.id; });
  ok("sim2 grid stays inside its details when switching steps", back === "sim2-table");

  // Keyboard: arrows on the step list.
  await p.goto(base + "#/simulators/sim2"); await p.waitForTimeout(300);
  await p.evaluate(() => { const i = SIMULATORS.findIndex(s => s.id === "sim2"); renderSimStep(i, 0); });
  await p.focus("#sim2-steps .step-pill >> nth=0");
  await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
  ok("ArrowRight twice → step 3", (await p.textContent("#sim2-status")).startsWith("Шаг 3 из 11"), await p.textContent("#sim2-status"));
  ok("focus follows the active pill", await p.evaluate(() => document.activeElement.classList.contains("active")));
  await p.keyboard.press("ArrowLeft");
  ok("ArrowLeft → step 2", (await p.textContent("#sim2-status")).startsWith("Шаг 2 из 11"));
  ok("pill has full title as accessible name", (await p.getAttribute("#sim2-steps .step-pill >> nth=3", "aria-label")).startsWith("4. Перед перехватом"));

  // c8 EINTR note.
  await p.goto(base + "#/cards/c8"); await p.waitForTimeout(250); await p.click("#reveal-btn");
  await p.evaluate(() => document.querySelectorAll("#view-cards details").forEach(d => d.open = true));
  const c8 = (await p.textContent("#view-cards")).replace(/\s+/g, " ");
  ok("c8 EINTR note EN/RU", c8.includes("fail with EINTR more often") && c8.includes("чаще завершаются с EINTR"));

  // Phone: titles hidden, numbers visible; no overflow anywhere in simulators at several widths.
  for (const [width, zoom] of [[320, 1], [390, 1], [430, 1], [1440, 1], [320, 2], [390, 2]]) {
    const q = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
    await q.goto(base + "#/simulators"); await q.waitForTimeout(300);
    const r = await q.evaluate(z => {
      document.documentElement.style.fontSize = (z * 100) + "%";
      const over = [];
      SIMULATORS.forEach((s, i) => s.steps.forEach((_, k) => { renderSimStep(i, k);
        document.querySelectorAll("#view-simulators details").forEach(d => d.open = true);
        const o = document.documentElement.scrollWidth - document.documentElement.clientWidth; if (o > 0) over.push(`${s.id}:${k + 1}:${o}`); }));
      const title = document.querySelector("#sim2-steps .step-title");
      return { over, titleShown: getComputedStyle(title).display !== "none" };
    }, zoom);
    ok(`no overflow in any simulator step at ${width}px ×${zoom}`, r.over.length === 0, r.over.slice(0, 5).join(" "));
    if (zoom === 1) ok(`step titles ${width <= 640 ? "hidden" : "shown"} at ${width}px`, r.titleShown === (width > 640));
    await q.close();
  }
  ok("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  const fails = res.filter(r => r.startsWith("FAIL"));
  console.log(fails.length ? fails.join("\n") : "(no failures)");
  console.log(`${res.length - fails.length}/${res.length} passed`);
  await b.close();
})();
