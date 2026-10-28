const PROGRESS_KEY = "go_prep_progress_v2";
let storageMessage = "";

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      throw new Error("Invalid progress format");
    }
    const progress = {};
    for (const card of CARDS) {
      if (saved[card.id] === "mastered" || saved[card.id] === "review") {
        progress[card.id] = saved[card.id];
      }
    }
    return progress;
  } catch {
    storageMessage = "Не удалось прочитать сохранённый прогресс. Можно заниматься, но проверь сохранение перед закрытием страницы.";
    return {};
  }
}

function showStorageMessage() {
  const notice = document.getElementById("storage-notice");
  notice.textContent = storageMessage;
  notice.classList.toggle("hidden", !storageMessage);
}

let state = {
  filter: "all",
  level: "all",
  search: "",
  index: 0,
  revealed: false,
  progress: loadProgress()
};

// Безопасное экранирование символов <, >, & чтобы код с каналами (<-ch) и циклами (i < 3) не ломал HTML!
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function russianExplanationHtml(card) {
  if (!card.shortRU) return "";
  return `<details class="translated-answer" lang="ru">
    <summary>Объяснение на русском</summary>
    <p>${escapeHtml(card.shortRU)}</p>
    <ul class="details-list">${(card.detailsRU || []).map(text => `<li>${escapeHtml(text)}</li>`).join("")}</ul>
  </details>`;
}

function referencesHtml(item) {
  const sources = (item.sources || []).filter(source => source.url.startsWith("https://"));
  if (!item.versionNote && !sources.length) return "";
  return `<aside class="content-references" aria-label="Версии и источники">
    ${item.versionNote ? `<p>${escapeHtml(item.versionNote)}</p>` : ""}
    ${sources.length ? `<ul>${sources.map(source => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a></li>`).join("")}</ul>` : ""}
  </aside>`;
}

function practiceHtml(card) {
  const exercise = card.practice;
  if (!exercise) return "";
  return `<details class="practice-box">
    <summary>${escapeHtml(exercise.kind)} · практика без вариантов ответа</summary>
    <p class="muted-text">Сначала ответь вслух или на бумаге. Затем сравни рассуждение с разбором. Точного совпадения слов не требуется.</p>
    <p lang="en">${escapeHtml(exercise.promptEN)}</p>
    <details class="translated-answer"><summary>Задание на русском</summary><p lang="ru">${escapeHtml(exercise.promptRU)}</p></details>
    ${exercise.code ? `<pre class="code-block">${escapeHtml(exercise.code)}</pre>` : ""}
    <details class="practice-solution">
      <summary>Сверить рассуждение</summary>
      <ul class="details-list" lang="en">${exercise.pointsEN.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      <details class="translated-answer"><summary>Разбор на русском</summary><ul class="details-list" lang="ru">${exercise.pointsRU.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul></details>
      <p lang="en"><strong>Follow-up:</strong> ${escapeHtml(exercise.followUpEN)}</p>
      <p lang="ru">${escapeHtml(exercise.followUpRU)}</p>
      <p class="muted-text">Если упустил причину или условие, отметь тему «Нужно повторить». Это самопроверка, не автоматическая оценка ответа.</p>
    </details>
  </details>`;
}

function relatedQuizHtml(cardId) {
  const questions = QUIZ_QUESTIONS.filter(q => (q.cardIds || []).includes(cardId));
  if (!questions.length) return "";
  return `<nav class="related-links" aria-label="Задачи по теме">${questions.map(q => `<a href="#/quiz/${q.id}">${escapeHtml(q.title)}</a>`).join("")}</nav>`;
}

// Links between cards and diagrams.
const CARD_TO_SIM = {
  c1: "sim1", c3: "sim1", c4: "sim1", c5: "sim1", c6: "sim1",
  c7: "sim2", c8: "sim2", c9: "sim2", c10: "sim2", c11: "sim1",
  c13: "sim3", c16: "sim3", c17: "sim3",
  c18: "sim4", c19: "sim4",
  c20: "sim5", c21: "sim5",
  c23: "sim6", c24: "sim6", c25: "sim6", c26: "sim6", c27: "sim6", c28: "sim6",
  c30: "sim7", c31: "sim7", c32: "sim7", c37: "sim1", c38: "sim2"
};

function getCardSimId(card) {
  return CARD_TO_SIM[card.id] || card.simId || null;
}

/* --- СОХРАНЕНИЕ ПРОГРЕССА --- */
function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
    storageMessage = "";
  } catch {
    storageMessage = "Прогресс обновлён только на этой странице: браузер не разрешил сохранение. Не закрывай её, если хочешь сохранить текущие отметки.";
  }
  showStorageMessage();
  updateProgressBar();
}

function updateProgressBar() {
  if (typeof CARDS === "undefined") return;
  const mastered = CARDS.filter(c => state.progress[c.id] === "mastered").length;
  const pct = Math.round((mastered / CARDS.length) * 100);
  const txt = document.getElementById("progress-text");
  const fill = document.getElementById("progress-fill");
  if (txt) txt.textContent = `${mastered} / ${CARDS.length} изучено (${pct}%)`;
  if (fill) fill.style.width = `${pct}%`;
}

function resetProgress() {
  if (!window.confirm("Удалить все сохранённые отметки карточек? Это действие нельзя отменить.")) return;
  state.progress = {};
  state.index = 0;
  state.revealed = false;
  saveProgress();
  renderCard();
}

/* --- ФИЛЬТРАЦИЯ И РЕНДЕР КАРТОЧЕК --- */
function getFilteredCards() {
  if (typeof CARDS === "undefined") return [];
  return CARDS.filter(c => {
    if (state.filter === "review" && state.progress[c.id] !== "review") return false;
    if (state.filter === "practice" && !c.practice) return false;
    if (!["all", "review", "practice"].includes(state.filter) && c.mod !== state.filter) return false;
    if (state.level !== "all" && (c.level || "senior") !== state.level) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = (c.qEN + " " + c.qRU + " " + c.shortEN + " " + (c.practicalRU || "") + " " + c.detailsEN.join(" ") + " " + (c.shortRU || "") + " " + (c.detailsRU || []).join(" ") + " " + c.code).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function updateFilterButtonsUI() {
  document.querySelectorAll("#module-filter-row .chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === state.filter);
    btn.setAttribute("aria-pressed", String(btn.dataset.filter === state.filter));
  });
  document.querySelectorAll("#level-filter-row .level-chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.level === state.level);
    btn.setAttribute("aria-pressed", String(btn.dataset.level === state.level));
  });
}

function renderCard() {
  updateFilterButtonsUI();
  const list = getFilteredCards();
  const ansBox = document.getElementById("card-answer-box");
  if (!ansBox) return;

  document.querySelectorAll("#card-controls button").forEach(button => {
    button.disabled = !list.length || (button.dataset.grade !== undefined && !state.revealed);
  });
  const revealButton = document.getElementById("reveal-btn");
  revealButton.setAttribute("aria-expanded", String(!!list.length && state.revealed));
  revealButton.textContent = state.revealed && list.length ? "Скрыть ответ" : "Показать ответ";
  if (list.length === 0) {
    document.getElementById("card-module").textContent = "ПУСТО";
    document.getElementById("card-level").textContent = "0 карточек";
    document.getElementById("card-level").className = "level-badge";
    document.getElementById("card-counter").textContent = "0 из 0";
    document.getElementById("card-q-en").textContent = "Нет карточек по выбранному сочетанию фильтров";
    document.getElementById("card-q-ru").textContent = state.filter === "review" ? "В этой подборке нет карточек на повторение. Можно выбрать другой уровень или открыть все карточки." : "Измени поиск, модуль или уровень в разделе «Настроить подборку».";
    ansBox.classList.remove("visible");
    document.getElementById("card-status").textContent = "";
    document.getElementById("card-practice").innerHTML = "";
    return;
  }

  if (state.index >= list.length) state.index = 0;
  if (state.index < 0) state.index = list.length - 1;

  const card = list[state.index];
  document.getElementById("card-module").textContent = card.modName;

  const lvl = card.level || "senior";
  const lvlLabel = card.levelLabel || "🟡 Senior";
  const lvlEl = document.getElementById("card-level");
  lvlEl.textContent = lvlLabel;
  lvlEl.className = "level-badge level-" + lvl;

  document.getElementById("card-counter").textContent = `Карточка ${state.index + 1} из ${list.length} (${card.id.toUpperCase()})`;
  document.getElementById("card-q-en").textContent = card.qEN;
  document.getElementById("card-q-ru").textContent = card.qRU;
  document.getElementById("card-short-en").textContent = card.shortEN;
  document.getElementById("card-translation").innerHTML = russianExplanationHtml(card);
  document.getElementById("card-references").innerHTML = referencesHtml(card);
  document.getElementById("card-practice").innerHTML = practiceHtml(card);

  const ul = document.getElementById("card-details-en");
  ul.innerHTML = "";
  card.detailsEN.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });

  const pracWrap = document.getElementById("card-practical-wrap");
  if (card.practicalRU) {
    pracWrap.classList.remove("hidden");
    document.getElementById("card-practical-ru").textContent = card.practicalRU;
  } else {
    pracWrap.classList.add("hidden");
  }

  document.getElementById("card-code").textContent = card.code;

  const targetSim = getCardSimId(card);
  const simLinkWrap = document.getElementById("card-sim-link");
  if (targetSim) {
    simLinkWrap.innerHTML = `<a href="#/simulators/${targetSim}" class="btn btn-sm">🔬 Открыть интерактивную диаграмму (${targetSim.toUpperCase()}) →</a>`;
  } else {
    simLinkWrap.innerHTML = "";
  }
  simLinkWrap.insertAdjacentHTML("beforeend", relatedQuizHtml(card.id));

  const st = state.progress[card.id] || "unseen";
  const pill = document.getElementById("card-status");
  pill.className = "status-pill " + (st === "mastered" ? "status-mastered" : st === "review" ? "status-review" : "status-unseen");
  pill.textContent = st === "mastered" ? "Изучено ✓" : st === "review" ? "На повторении" : "Новая";

  ansBox.classList.toggle("visible", state.revealed);
}

function toggleAnswer() {
  if (!getFilteredCards().length) return;
  state.revealed = !state.revealed;
  renderCard();
  if (window.matchMedia("(max-width: 640px)").matches) {
    if (state.revealed) document.getElementById("card-answer-box").scrollIntoView({ block: "start" });
    else returnToQuestion();
  }
}

function returnToQuestion() {
  const question = document.getElementById("card-stage");
  if (question.getBoundingClientRect().top < 0) question.scrollIntoView({ block: "start" });
}

function nextCard() {
  state.index++;
  state.revealed = false;
  renderCard();
  returnToQuestion();
}

function prevCard() {
  state.index--;
  state.revealed = false;
  renderCard();
  returnToQuestion();
}

function markCard(status) {
  const list = getFilteredCards();
  if (!list.length || !state.revealed || !["mastered", "review"].includes(status)) return;
  const card = list[state.index];
  state.progress[card.id] = status;
  saveProgress();
  // Removing the current item already shifts the next item into its place.
  if (getFilteredCards().some(c => c.id === card.id)) state.index++;
  state.revealed = false;
  renderCard();
  returnToQuestion();
}

function setFilter(f) {
  state.filter = f;
  state.index = 0;
  state.revealed = false;
  renderCard();
}

function setLevel(lvl) {
  state.level = lvl;
  state.index = 0;
  state.revealed = false;
  renderCard();
}

function onSearchInput() {
  state.search = document.getElementById("search-input").value.trim();
  state.index = 0;
  state.revealed = false;
  renderCard();
}

/* --- SIMULATORS --- */
function initSimulators() {
  const container = document.getElementById("simulators-list");
  if (!container || typeof SIMULATORS === "undefined") return;
  container.innerHTML = "";

  SIMULATORS.forEach((sim, simIdx) => {
    const card = document.createElement("div");
    card.className = "sim-card";
    card.id = sim.id;

    const stepsHtml = sim.steps
      .map((st, idx) => `<button type="button" class="step-pill ${idx === 0 ? "active" : ""}" aria-label="${escapeHtml(st.title)}" onclick="renderSimStep(${simIdx}, ${idx})"><span class="step-num">${idx + 1}</span><span class="step-title">${escapeHtml(st.title.replace(/^\d+\.\s*/, ""))}</span></button>`)
      .join("");

    card.innerHTML = `
      <div class="sim-header">
        <div>
          <h3>${escapeHtml(sim.title)}</h3>
          <p class="muted-text">${escapeHtml(sim.subtitle)}</p>
        </div>
        <a href="#/cards/${sim.cardId}" class="btn btn-sm">${escapeHtml(sim.cardLabel)}</a>
      </div>
      ${sim.learningHint ? `<p class="learning-hint">${escapeHtml(sim.learningHint)}</p>` : ""}
      <div class="sim-steps" id="${sim.id}-steps">${stepsHtml}</div>
      <p id="${sim.id}-status" class="muted-text sim-step-start" tabindex="-1" aria-live="polite"></p>
      <div id="${sim.id}-desc" class="short-answer"></div>
      <div id="${sim.id}-board"></div>
      <div id="${sim.id}-scene"></div>
      <details class="sim-table hidden" id="${sim.id}-table"><summary>Подробности шага: таблица</summary></details>
      <div class="sim-grid" id="${sim.id}-grid"></div>
      <div id="${sim.id}-recall"></div>
      <div class="sim-navigation">
        <button type="button" class="btn btn-sm" data-step-direction="-1">← Шаг назад</button>
        <button type="button" class="btn btn-sm" data-step-direction="1">Следующий шаг →</button>
      </div>
      ${referencesHtml(sim)}
    `;
    container.appendChild(card);
    card.querySelector(".sim-steps").addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = Number(card.dataset.step) + (event.key === "ArrowRight" ? 1 : -1);
      renderSimStep(simIdx, next);
      const pill = card.querySelectorAll(".step-pill")[Number(card.dataset.step)];
      if (pill) pill.focus();
    });
    card.querySelectorAll("[data-step-direction]").forEach(button => {
      button.addEventListener("click", () => {
        const next = Number(card.dataset.step) + Number(button.dataset.stepDirection);
        renderSimStep(simIdx, next);
        const status = document.getElementById(`${sim.id}-status`);
        status.focus({ preventScroll: true });
        status.scrollIntoView({ behavior: "auto", block: "start" });
      });
    });
    renderSimStep(simIdx, 0);
  });
}

function renderSimStep(simIdx, stepIdx) {
  const sim = SIMULATORS[simIdx];
  if (!sim || stepIdx < 0 || stepIdx >= sim.steps.length) return;
  const step = sim.steps[stepIdx];
  const card = document.getElementById(sim.id);
  card.dataset.step = stepIdx;
  card.querySelector('[data-step-direction="-1"]').disabled = stepIdx === 0;
  card.querySelector('[data-step-direction="1"]').disabled = stepIdx === sim.steps.length - 1;

  document.querySelectorAll(`#${sim.id}-steps .step-pill`).forEach((btn, i) => {
    btn.classList.toggle("active", i === stepIdx);
    btn.setAttribute("aria-pressed", String(i === stepIdx));
  });

  document.getElementById(`${sim.id}-status`).textContent = `Шаг ${stepIdx + 1} из ${sim.steps.length}: ${step.title.replace(/^\d+\.\s*/, "")}`;
  // На шаге с predict объяснение и схема скрыты, пока ученик не ответит сам. Описание возвращается
  // на обычное место перед перерисовкой, иначе оно исчезло бы вместе со старым содержимым схемы.
  const descEl = document.getElementById(`${sim.id}-desc`);
  const boardEl = document.getElementById(`${sim.id}-board`);
  if (descEl.nextElementSibling !== boardEl) boardEl.before(descEl);
  descEl.textContent = step.desc;
  boardEl.innerHTML = step.board ? boardHtml(step.board, sim.boardLegend) : "";
  if (step.predict && step.board) {
    boardEl.innerHTML = `<div class="board-predict">
        <h4>Сначала предскажи сам</h4>
        <p lang="en">${escapeHtml(step.predict.promptEN)}</p><p lang="ru">${escapeHtml(step.predict.promptRU)}</p>
      </div>
      <details class="board-reveal"><summary>Показать ответ: объяснение и схема</summary><div class="board-reveal-body">${boardEl.innerHTML}</div></details>`;
    boardEl.querySelector(".board-reveal-body").prepend(descEl);
  }
  document.getElementById(`${sim.id}-scene`).innerHTML = step.scene ? `
    <div class="channel-scene" aria-label="Состояние участников передачи">
      <div class="channel-part channel-sender"><h4>Отправитель G2</h4><p>${escapeHtml(step.scene.sender)}</p></div>
      <div class="channel-part channel-state"><h4>Канал ch</h4><p>${escapeHtml(step.scene.channel)}</p></div>
      <div class="channel-part channel-receiver"><h4>Получатель G1</h4><p>${escapeHtml(step.scene.receiver)}</p></div>
    </div><p class="channel-transfer">${escapeHtml(step.scene.transfer)}</p>` : step.routes ? `
    <ol class="select-paths" aria-label="Пути компиляции select">
      ${step.routes.map(route => `<li class="select-path">
        <code>${escapeHtml(route.form)}</code><span class="select-path-arrow" aria-hidden="true">→</span>
        <div><strong>${escapeHtml(route.target)}</strong><p>${escapeHtml(route.note)}</p></div>
      </li>`).join("")}
    </ol>` : "";
  document.getElementById(`${sim.id}-recall`).innerHTML = `
    ${step.descEN ? `<details class="translated-answer"><summary>Explain this step in English</summary><p lang="en">${escapeHtml(step.descEN)}</p></details>` : ""}
    ${step.check ? `<div class="step-recall">
      <h4>Проверь себя перед следующим шагом</h4>
      <p lang="en">${escapeHtml(step.check.promptEN)}</p><p lang="ru">${escapeHtml(step.check.promptRU)}</p>
      <details class="translated-answer"><summary>Сверить объяснение</summary>
        <p lang="en">${escapeHtml(step.check.answerEN)}</p><p lang="ru">${escapeHtml(step.check.answerRU)}</p>
      </details>
    </div>` : ""}`;

  const grid = document.getElementById(`${sim.id}-grid`);
  // Если у шага есть схема, таблица дублирует её и сворачивается; без схемы таблица остаётся основной.
  const table = document.getElementById(`${sim.id}-table`);
  table.classList.toggle("hidden", !step.board);
  if (step.board && grid.parentElement !== table) table.append(grid);
  if (!step.board && grid.parentElement === table) table.after(grid);
  grid.innerHTML = step.boxes
    .map(box => `
      <div class="sim-box">
        <h4>${escapeHtml(box.title)}</h4>
        ${box.rows
          .map(r => `
            <div class="reg-row ${r.hl ? "reg-highlight" : ""}">
              <span>${escapeHtml(r.k)}</span>
              <strong>${escapeHtml(r.v)}</strong>
            </div>
          `)
          .join("")}
      </div>
    `)
    .join("");
}

/* --- Схема-доска: дорожки P/очередей, фишки G и «Что изменилось» ---
   Данные: board = [{ caption?, lanes: [{ kind, title, tag?, state?, slots: [{ label, items, queue? }], note? }],
   hl?: [id], list?: { title, items, ordered? } }]. Элемент: "G1" или { g: "G1", flag: "..." }.
   Изменения выделяются рамкой и словом «изменилось», не только цветом. */
function boardChipHtml(item, hl) {
  const g = typeof item === "string" ? item : item.g;
  const flag = typeof item === "string" ? "" : item.flag;
  const changed = hl.includes(g);
  return `<li class="g-chip${changed ? " is-changed" : ""}"><span class="g-id">${escapeHtml(g)}</span>${flag ? `<span class="g-flag">${escapeHtml(flag)}</span>` : ""}${changed ? `<span class="g-changed">изменилось</span>` : ""}</li>`;
}

function boardLaneHtml(lane, hl) {
  const slots = (lane.slots || []).map(slot => {
    const items = slot.items || [];
    const list = items.length
      ? `<${slot.queue ? "ol" : "ul"} class="board-items${slot.queue ? " is-queue" : ""}">${items.map(item => boardChipHtml(item, hl)).join("")}</${slot.queue ? "ol" : "ul"}>`
      : `<span class="board-empty">пусто</span>`;
    return `<div class="board-slot"><span class="board-slot-label">${escapeHtml(slot.label)}</span>${list}</div>`;
  }).join("");
  const label = [lane.title, lane.tag, lane.state].filter(Boolean).join(", ");
  return `<section class="board-lane lane-${escapeHtml(lane.kind || "other")}" aria-label="${escapeHtml(label)}">
    <div class="board-lane-head"><strong>${escapeHtml(lane.title)}</strong>${lane.tag ? `<span class="board-tag">${escapeHtml(lane.tag)}</span>` : ""}${lane.state ? `<code class="board-state">${escapeHtml(lane.state)}</code>` : ""}</div>
    ${slots}
    ${lane.note ? `<p class="board-note">${escapeHtml(lane.note)}</p>` : ""}
  </section>`;
}

function boardHtml(board, legend) {
  const panels = Array.isArray(board) ? board : [board];
  return `<div class="board-wrap">
    ${legend ? `<p class="board-legend">${escapeHtml(legend)}</p>` : ""}
    <div class="board-panels${panels.length > 1 ? " is-compare" : ""}">
      ${panels.map(panel => {
        const hl = panel.hl || [];
        const list = panel.list && panel.list.items && panel.list.items.length ? `<div class="board-changes">
          <h4>${escapeHtml(panel.list.title || "Что изменилось")}</h4>
          <${panel.list.ordered ? "ol" : "ul"}>${panel.list.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</${panel.list.ordered ? "ol" : "ul"}>
        </div>` : "";
        return `<figure class="board-panel">
          ${panel.caption ? `<figcaption class="board-caption">${escapeHtml(panel.caption)}</figcaption>` : ""}
          <div class="board-lanes">${(panel.lanes || []).map(lane => boardLaneHtml(lane, hl)).join("")}</div>
          ${list}
        </figure>`;
      }).join("")}
    </div>
  </div>`;
}

/* --- БАЗА ЗНАНИЙ (WIKI) И ТАБЛИЦА-ШПАРГАЛКА --- */
function initWikiAndCheatsheet() {
  const wrap = document.getElementById("accordion-container");
  if (wrap && typeof CARDS !== "undefined") {
    wrap.innerHTML = "";
    CARDS.forEach(c => {
      const item = document.createElement("div");
      item.className = "accordion-item open";
      const targetSim = getCardSimId(c);
      const simBtn = targetSim ? `<a href="#/simulators/${targetSim}" class="btn btn-sm">🔬 Диаграмма (${targetSim.toUpperCase()}) →</a>` : "";
      const lvl = c.level || "senior";
      const lvlLabel = c.levelLabel || "🟡 Senior";
      const pracHtml = c.practicalRU
        ? `<div class="practical-box"><strong>Где это пригодится:</strong> ${escapeHtml(c.practicalRU)}</div>`
        : "";

      item.innerHTML = `
        <button type="button" class="accordion-header" aria-expanded="true" aria-controls="wiki-${c.id}">
          <span>${escapeHtml(c.qEN)}</span>
          <span class="accordion-badges">
            <span class="level-badge level-${lvl}">${escapeHtml(lvlLabel)}</span>
            <span class="module-tag">${escapeHtml(c.modName)}</span>
          </span>
        </button>
        <div class="accordion-body" id="wiki-${c.id}">
          <p class="muted-text" style="margin-bottom:10px;">${escapeHtml(c.qRU)}</p>
          <div class="short-answer" lang="en"><strong lang="ru">Коротко по-английски:</strong> ${escapeHtml(c.shortEN)}</div>
          ${russianExplanationHtml(c)}
          <strong>Как это работает (EN):</strong>
          <ul class="details-list">${c.detailsEN.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          ${pracHtml}
          ${referencesHtml(c)}
          <pre class="code-block">${escapeHtml(c.code)}</pre>
          ${relatedQuizHtml(c.id)}
          <div class="btn-group" style="margin-top: 12px;">
            <a href="#/cards/${c.id}" class="btn btn-sm">Открыть в тренажёре (${c.id.toUpperCase()}) →</a>
            ${simBtn}
          </div>
        </div>
      `;
      item.querySelector(".accordion-header").addEventListener("click", event => {
        const open = item.classList.toggle("open");
        event.currentTarget.setAttribute("aria-expanded", String(open));
      });
      wrap.appendChild(item);
    });
  }

  const tbody = document.getElementById("cheatsheet-tbody");
  if (tbody && typeof CHEATSHEET_ROWS !== "undefined") {
    tbody.innerHTML = "";
    CHEATSHEET_ROWS.forEach(r => {
      const tr = document.createElement("tr");
      const simLink = r.simId ? `<a href="#/simulators/${r.simId}" class="btn btn-sm">Диаграмма</a>` : "";
      tr.innerHTML = `
        <td><strong>${r.topic}</strong></td>
        <td>${r.how}</td>
        <td>${r.markers}</td>
        <td>
          <div class="btn-group">
            <a href="#/cards/${r.cardId}" class="btn btn-sm">Карточка</a>
            ${simLink}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function toggleAllAccordions(open) {
  document.querySelectorAll(".accordion-item").forEach(el => {
    el.classList.toggle("open", open);
    el.querySelector(".accordion-header").setAttribute("aria-expanded", String(open));
  });
}

/* --- РЕНДЕР ИНТЕРАКТИВНОГО QUIZ (ЗАДАЧИ С ПОДВОХОМ) --- */
function initQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container || typeof QUIZ_QUESTIONS === "undefined") return;
  container.innerHTML = "";

  QUIZ_QUESTIONS.forEach(q => {
    const card = document.createElement("div");
    card.className = "sim-card";
    card.id = q.id;
    card.style.marginBottom = "20px";

    const optionsHtml = q.options
      .map((opt, oIdx) => `
        <label style="display:block; padding:10px 14px; background:var(--bg); border:1px solid var(--border); border-radius:8px; margin-bottom:8px; cursor:pointer; font-size:0.9rem;">
          <input type="radio" name="${q.id}" value="${oIdx}" style="margin-right:8px;" onchange="checkQuizAnswer('${q.id}', ${oIdx}, ${q.correct})">
          <span>${escapeHtml(opt)}</span>
        </label>
      `)
      .join("");

    card.innerHTML = `
      <h3 style="margin-bottom:8px; color:var(--accent);">${escapeHtml(q.title)}</h3>
      <p style="font-weight:600; margin-bottom:6px;">🇷🇺 ${escapeHtml(q.ru)}</p>
      <p class="muted-text" style="font-style:italic; margin-bottom:12px;">🇬🇧 ${escapeHtml(q.en)}</p>
      <pre class="code-block">${escapeHtml(q.code)}</pre>
      <div style="margin: 16px 0;">${optionsHtml}</div>
      <div id="${q.id}-result" class="hidden" style="margin-top:12px; padding:14px; border-radius:8px; background:rgba(56,189,248,0.1); border-left:4px solid var(--accent);">
        <strong id="${q.id}-title-res"></strong>
        <p style="margin-top:8px; font-size:0.92rem;"><strong>🇷🇺 Почему так:</strong> <span id="${q.id}-exp-ru"></span></p>
        <p style="margin-top:8px; font-size:0.92rem; color:#cbd5e1;"><strong>🇬🇧 How to answer in English:</strong> <span id="${q.id}-exp-en" lang="en"></span></p>
        ${q.correctedCode ? `<details class="translated-answer"><summary>Исправленный пример</summary><pre class="code-block">${escapeHtml(q.correctedCode)}</pre></details>` : ""}
        ${referencesHtml(q)}
        ${(q.cardIds || []).length ? `<nav class="related-links" aria-label="Разобрать тему">${q.cardIds.map(id => `<a href="#/cards/${escapeHtml(id)}">Карточка ${escapeHtml(id.toUpperCase())} →</a>`).join("")}</nav>` : ""}
      </div>
    `;
    container.appendChild(card);
  });
}

function checkQuizAnswer(qId, selectedIdx, correctIdx) {
  if (typeof QUIZ_QUESTIONS === "undefined") return;
  const q = QUIZ_QUESTIONS.find(x => x.id === qId);
  if (!q) return;

  const resBox = document.getElementById(`${qId}-result`);
  const titleRes = document.getElementById(`${qId}-title-res`);
  const expRu = document.getElementById(`${qId}-exp-ru`);
  const expEn = document.getElementById(`${qId}-exp-en`);

  resBox.classList.remove("hidden");
  const isCorrect = selectedIdx === correctIdx;

  if (isCorrect) {
    titleRes.textContent = "✅ Верно! Отличный ответ.";
    resBox.style.borderColor = "#22c55e";
    resBox.style.background = "rgba(34, 197, 94, 0.12)";
  } else {
    titleRes.textContent = `❌ Не совсем так (правильный вариант — №${correctIdx + 1}). Посмотри разбор:`;
    resBox.style.borderColor = "#ef4444";
    resBox.style.background = "rgba(239, 68, 68, 0.12)";
  }

  expRu.textContent = q.explanationRU;
  expEn.textContent = q.speechEN;
}

/* --- HASH ROUTER (НАВИГАЦИЯ И ПРЯМЫЕ ССЫЛКИ) --- */
function handleRoute() {
  const hash = window.location.hash || "#/cards";
  const parts = hash.replace(/^#\//, "").split("/");
  const route = parts[0] || "cards";
  const param = parts[1] || null;

  const validRoutes = ["plan", "cards", "simulators", "wiki", "cheatsheet", "quiz"];
  const activeRoute = validRoutes.includes(route) ? route : "cards";

  document.querySelectorAll(".route-view").forEach(sec => {
    sec.classList.toggle("hidden", sec.id !== `view-${activeRoute}`);
  });

  document.querySelectorAll(".nav-tabs .tab-btn").forEach(link => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
    if (link.dataset.route === activeRoute) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (activeRoute === "cards" && param) {
    state.filter = "all";
    state.level = "all";
    state.search = "";
    document.getElementById("search-input").value = "";
    const idx = CARDS.findIndex(c => c.id === param);
    if (idx !== -1) {
      state.index = idx;
      state.revealed = false;
      renderCard();
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  if (activeRoute === "simulators" && param) {
    const targetSim = document.getElementById(param);
    if (targetSim) {
      setTimeout(() => targetSim.scrollIntoView({ behavior: "auto", block: "start" }), 60);
    }
  }
  if (activeRoute === "quiz" && param) {
    const question = QUIZ_QUESTIONS.find(q => q.id === param);
    if (question) document.getElementById(question.id).scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function syncDynamicCounters() {
  if (typeof CARDS === "undefined") return;
  const total = CARDS.length;
  document.getElementById("wiki-title").textContent = `База знаний: ${total} тем`;
  const baseCnt = CARDS.filter(c => c.level === "base").length;
  const senCnt = CARDS.filter(c => c.level === "senior").length;
  const deepCnt = CARDS.filter(c => c.level === "deep").length;

  const tabCards = document.querySelector('.tab-btn[data-route="cards"]');
  if (tabCards) tabCards.textContent = `1. Карточки (${total})`;

  const tabSims = document.querySelector('.tab-btn[data-route="simulators"]');
  if (tabSims && typeof SIMULATORS !== "undefined") {
    tabSims.textContent = `2. Диаграммы (${SIMULATORS.length})`;
  }

  const tabQuiz = document.querySelector('.tab-btn[data-route="quiz"]');
  if (tabQuiz && typeof QUIZ_QUESTIONS !== "undefined") {
    tabQuiz.textContent = `5. 🧠 Code Traps Quiz (${QUIZ_QUESTIONS.length})`;
  }

  const btnAllMod = document.querySelector('#module-filter-row .chip[data-filter="all"]');
  if (btnAllMod) btnAllMod.textContent = `Все (${total})`;
  const practiceButton = document.querySelector('[data-filter="practice"]');
  if (practiceButton) practiceButton.textContent = `С практикой (${CARDS.filter(c => c.practice).length})`;

  const btnAllLvl = document.querySelector('#level-filter-row .level-chip[data-level="all"]');
  if (btnAllLvl) btnAllLvl.textContent = `Все уровни (${total})`;
  const btnBase = document.querySelector('#level-filter-row .level-chip[data-level="base"]');
  if (btnBase) btnBase.textContent = `🟢 Base (${baseCnt})`;
  const btnSen = document.querySelector('#level-filter-row .level-chip[data-level="senior"]');
  if (btnSen) btnSen.textContent = `🟡 Senior (${senCnt})`;
  const btnDeep = document.querySelector('#level-filter-row .level-chip[data-level="deep"]');
  if (btnDeep) btnDeep.textContent = `🔴 Deep Dive (${deepCnt})`;
}

/* --- ГОРЯЧИЕ КЛАВИШИ --- */
window.addEventListener("keydown", e => {
  if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest("input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable=false]), [role=button]")) return;
  const isCardsView = !document.getElementById("view-cards").classList.contains("hidden");
  if (!isCardsView) return;

  if (e.code === "Space") {
    e.preventDefault();
    toggleAnswer();
  }
  if (e.code === "ArrowRight") nextCard();
  if (e.code === "ArrowLeft") prevCard();
  if (e.key === "1") markCard("mastered");
  if (e.key === "2") markCard("review");
});

window.addEventListener("hashchange", handleRoute);

document.addEventListener("DOMContentLoaded", () => {
  showStorageMessage();
  syncDynamicCounters();
  updateProgressBar();
  renderCard();
  initSimulators();
  initWikiAndCheatsheet();
  initQuiz();
  handleRoute();
});
