const { chromium } = require("playwright");
(async () => {
  const base = "http://127.0.0.1:8765/";
  const b = await chromium.launch();
  const res = []; const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"} ${n} ${x}`);
  const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(base + "#/simulators/sim2"); await p.waitForTimeout(300);
  const sim2 = await p.evaluate(() => SIMULATORS.findIndex(s => s.id === "sim2"));
  const state = () => p.evaluate(() => {
    const desc = document.getElementById("sim2-desc"), reveal = document.querySelector("#sim2-board .board-reveal");
    return { descVisible: desc.checkVisibility(), inReveal: Boolean(desc.closest(".board-reveal")),
      revealOpen: reveal ? reveal.open : null, prompt: (document.querySelector("#sim2-board .board-predict") || {}).textContent || "",
      lanesVisible: [...document.querySelectorAll("#sim2-board .board-lane")].filter(l => l.checkVisibility()).length,
      descText: desc.textContent };
  });
  await p.evaluate(i => renderSimStep(i, 4), sim2);
  let s = await state();
  ok("step 5: prompt shown first", s.prompt.includes("Сначала предскажи сам") && s.prompt.includes("Which G runs on P2 right away"));
  ok("step 5: explanation and board hidden until reveal", !s.descVisible && s.inReveal && s.revealOpen === false && s.lanesVisible === 0);
  await p.click("#sim2-board .board-reveal > summary");
  s = await state();
  ok("step 5: reveal shows explanation and board", s.descVisible && s.lanesVisible > 0 && s.descText.startsWith("Продолжение шага 4"));
  await p.click('#sim2 [data-step-direction="1"]'); await p.waitForTimeout(100);
  s = await state();
  ok("step 6 (no predict): explanation back in place and visible", s.descVisible && !s.inReveal && s.revealOpen === null && s.descText.startsWith("Новый сценарий: G1 входит"));
  await p.evaluate(i => renderSimStep(i, 2), sim2);
  s = await state();
  ok("step 3: hidden again on another predict step", !s.descVisible && s.inReveal && s.descText.startsWith("Продолжение шага 2"));
  await p.evaluate(i => renderSimStep(i, 0), sim2);
  s = await state();
  ok("step 1: normal layout", s.descVisible && !s.inReveal);
  const counts = await p.evaluate(() => SIMULATORS.map(x => `${x.id}:${x.steps.filter(st => st.predict).length}`).join(" "));
  ok("predict steps per simulator", counts === "sim1:3 sim2:6 sim3:4 sim4:4 sim5:2 sim6:4 sim7:1 sim8:3 sim9:3 sim10:3 sim11:2 sim12:0", counts);
  ok("no console errors", errors.length === 0, errors.join(" | "));
  console.log(res.join("\n")); console.log(`${res.filter(r => r.startsWith("PASS")).length}/${res.length} passed`);
  await b.close();
})();
