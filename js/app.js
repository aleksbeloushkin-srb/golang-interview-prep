let state = {
  filter: "all",
  level: "all",
  search: "",
  index: 0,
  revealed: false,
  progress: JSON.parse(localStorage.getItem("go_prep_progress_v2") || "{}")
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

// Автоматическая привязка карточек к 6 диаграммам
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
  localStorage.setItem("go_prep_progress_v2", JSON.stringify(state.progress));
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
  state.progress = {};
  saveProgress();
  renderCard();
}

/* --- ФИЛЬТРАЦИЯ И РЕНДЕР КАРТОЧЕК --- */
function getFilteredCards() {
  if (typeof CARDS === "undefined") return [];
  return CARDS.filter(c => {
    if (state.filter === "review" && state.progress[c.id] !== "review") return false;
    if (state.filter !== "all" && state.filter !== "review" && c.mod !== state.filter) return false;
    if (state.level !== "all" && (c.level || "senior") !== state.level) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = (c.qEN + " " + c.qRU + " " + c.shortEN + " " + (c.practicalRU || "") + " " + c.code).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function updateFilterButtonsUI() {
  document.querySelectorAll("#module-filter-row .chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === state.filter);
  });
  document.querySelectorAll("#level-filter-row .level-chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.level === state.level);
  });
}

function renderCard() {
  updateFilterButtonsUI();
  const list = getFilteredCards();
  const ansBox = document.getElementById("card-answer-box");
  if (!ansBox) return;

  if (list.length === 0) {
    document.getElementById("card-module").textContent = "ПУСТО";
    document.getElementById("card-level").textContent = "0 карточек";
    document.getElementById("card-level").className = "level-badge";
    document.getElementById("card-counter").textContent = "0 из 0";
    document.getElementById("card-q-en").textContent = "Нет карточек по выбранному сочетанию фильтров";
    document.getElementById("card-q-ru").textContent = "Нажми «Все (28)» или переключи уровень сложности выше.";
    ansBox.classList.remove("visible");
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

  const st = state.progress[card.id] || "unseen";
  const pill = document.getElementById("card-status");
  pill.className = "status-pill " + (st === "mastered" ? "status-mastered" : st === "review" ? "status-review" : "status-unseen");
  pill.textContent = st === "mastered" ? "Изучено ✓" : st === "review" ? "На повторении" : "Новая";

  if (state.revealed) {
    ansBox.classList.add("visible");
    document.getElementById("reveal-btn").textContent = "Скрыть ответ (Space)";
  } else {
    ansBox.classList.remove("visible");
    document.getElementById("reveal-btn").textContent = "Показать ответ (Space)";
  }
}

function toggleAnswer() {
  state.revealed = !state.revealed;
  renderCard();
}

function nextCard() {
  state.index++;
  state.revealed = false;
  renderCard();
}

function prevCard() {
  state.index--;
  state.revealed = false;
  renderCard();
}

function markCard(status) {
  const list = getFilteredCards();
  if (!list.length) return;
  const card = list[state.index];
  state.progress[card.id] = status;
  saveProgress();
  nextCard();
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
  if (state.filter === "review" && getFilteredCards().length === 0) {
    state.filter = "all";
  }
  renderCard();
}

function onSearchInput() {
  state.search = document.getElementById("search-input").value.trim();
  state.index = 0;
  renderCard();
}

/* --- УНИВЕРСАЛЬНЫЙ ДВИЖОК ВСЕХ 6 СИМУЛЯТОРОВ --- */
function initSimulators() {
  const container = document.getElementById("simulators-list");
  if (!container || typeof SIMULATORS === "undefined") return;
  container.innerHTML = "";

  SIMULATORS.forEach((sim, simIdx) => {
    const card = document.createElement("div");
    card.className = "sim-card";
    card.id = sim.id;

    const stepsHtml = sim.steps
      .map((st, idx) => `<button type="button" class="step-pill ${idx === 0 ? "active" : ""}" onclick="renderSimStep(${simIdx}, ${idx})">${escapeHtml(st.title)}</button>`)
      .join("");

    card.innerHTML = `
      <div class="sim-header">
        <div>
          <h3>${escapeHtml(sim.title)}</h3>
          <p class="muted-text">${escapeHtml(sim.subtitle)}</p>
        </div>
        <a href="#/cards/${sim.cardId}" class="btn btn-sm">${escapeHtml(sim.cardLabel)}</a>
      </div>
      <div class="sim-steps" id="${sim.id}-steps">${stepsHtml}</div>
      <div id="${sim.id}-desc" class="short-answer"></div>
      <div class="sim-grid" id="${sim.id}-grid"></div>
    `;
    container.appendChild(card);
    renderSimStep(simIdx, 0);
  });
}

function renderSimStep(simIdx, stepIdx) {
  const sim = SIMULATORS[simIdx];
  const step = sim.steps[stepIdx];

  document.querySelectorAll(`#${sim.id}-steps .step-pill`).forEach((btn, i) => {
    btn.classList.toggle("active", i === stepIdx);
  });

  document.getElementById(`${sim.id}-desc`).textContent = step.desc;

  const grid = document.getElementById(`${sim.id}-grid`);
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
        ? `<div class="practical-box"><strong>🛠️ 3. Практика в продакшене:</strong> ${escapeHtml(c.practicalRU)}</div>`
        : "";

      item.innerHTML = `
        <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
          <span>${escapeHtml(c.qEN)}</span>
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
            <span class="level-badge level-${lvl}">${escapeHtml(lvlLabel)}</span>
            <span class="module-tag">${escapeHtml(c.modName)}</span>
          </div>
        </div>
        <div class="accordion-body">
          <p class="muted-text" style="margin-bottom:10px;">${escapeHtml(c.qRU)}</p>
          <div class="short-answer"><strong>1. Base Answer (EN):</strong> ${escapeHtml(c.shortEN)}</div>
          <strong>2. Under the Hood Details (EN):</strong>
          <ul class="details-list">${c.detailsEN.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          ${pracHtml}
          <pre class="code-block">${escapeHtml(c.code)}</pre>
          <div class="btn-group" style="margin-top: 12px;">
            <a href="#/cards/${c.id}" class="btn btn-sm">Открыть в тренажёре (${c.id.toUpperCase()}) →</a>
            ${simBtn}
          </div>
        </div>
      `;
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
        <p style="margin-top:8px; font-size:0.92rem;"><strong>🇷🇺 Разбор под капотом:</strong> <span id="${q.id}-exp-ru"></span></p>
        <p style="margin-top:8px; font-size:0.92rem; color:#cbd5e1;"><strong>🇬🇧 How to answer in English:</strong> <span id="${q.id}-exp-en"></span></p>
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

  const validRoutes = ["cards", "simulators", "wiki", "cheatsheet", "quiz"];
  const activeRoute = validRoutes.includes(route) ? route : "cards";

  document.querySelectorAll(".route-view").forEach(sec => {
    sec.classList.toggle("hidden", sec.id !== `view-${activeRoute}`);
  });

  document.querySelectorAll(".nav-tabs .tab-btn").forEach(link => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });

  if (activeRoute === "cards" && param) {
    state.filter = "all";
    state.level = "all";
    const idx = CARDS.findIndex(c => c.id === param);
    if (idx !== -1) {
      state.index = idx;
      state.revealed = true;
      renderCard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (activeRoute === "simulators" && param) {
    const targetSim = document.getElementById(param);
    if (targetSim) {
      setTimeout(() => targetSim.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }
}

function syncDynamicCounters() {
  if (typeof CARDS === "undefined") return;
  const total = CARDS.length;
  const baseCnt = CARDS.filter(c => c.level === "base").length;
  const senCnt = CARDS.filter(c => c.level === "senior").length;
  const deepCnt = CARDS.filter(c => c.level === "deep").length;

  const tabCards = document.querySelector('.tab-btn[data-route="cards"]');
  if (tabCards) tabCards.textContent = `1. Карточки (${total})`;

  const tabSims = document.querySelector('.tab-btn[data-route="simulators"]');
  if (tabSims && typeof SIMULATORS !== "undefined") {
    tabSims.textContent = `2. Диаграммы (${SIMULATORS.length})`;
  }

  const btnAllMod = document.querySelector('#module-filter-row .chip[data-filter="all"]');
  if (btnAllMod) btnAllMod.textContent = `Все (${total})`;

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
  if (document.activeElement.tagName === "INPUT") return;
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
  syncDynamicCounters();
  updateProgressBar();
  renderCard();
  initSimulators();
  initWikiAndCheatsheet();
  initQuiz();
  handleRoute();
});
