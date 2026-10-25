let state = {
  filter: "all",
  level: "all",
  search: "",
  index: 0,
  revealed: false,
  progress: JSON.parse(localStorage.getItem("go_prep_progress_v2") || "{}")
};

// Автоматическая привязка всех 28 карточек к 6 диаграммам
const CARD_TO_SIM = {
  c1: "sim1", c3: "sim1", c4: "sim1", c5: "sim1", c6: "sim1",
  c7: "sim2", c8: "sim2", c9: "sim2", c10: "sim2", c11: "sim1",
  c13: "sim3", c16: "sim3", c17: "sim3",
  c18: "sim4", c19: "sim4",
  c20: "sim5", c21: "sim5",
  c23: "sim6", c24: "sim6", c25: "sim6", c26: "sim6", c27: "sim6", c28: "sim6"
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
  const mastered = CARDS.filter(c => state.progress[c.id] === "mastered").length;
  const pct = Math.round((mastered / CARDS.length) * 100);
  document.getElementById("progress-text").textContent = `${mastered} / ${CARDS.length} изучено (${pct}%)`;
  document.getElementById("progress-fill").style.width = `${pct}%`;
}

function resetProgress() {
  state.progress = {};
  saveProgress();
  renderCard();
}

/* --- ФИЛЬТРАЦИЯ И РЕНДЕР КАРТОЧЕК --- */
function getFilteredCards() {
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
  // Если был включён пустой фильтр "На повторение", сбрасываем модуль на "Все", чтобы уровень сразу показал карточки
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
  if (!container) return;
  container.innerHTML = "";

  SIMULATORS.forEach((sim, simIdx) => {
    const card = document.createElement("div");
    card.className = "sim-card";
    card.id = sim.id;

    const stepsHtml = sim.steps
      .map((st, idx) => `<button type="button" class="step-pill ${idx === 0 ? "active" : ""}" onclick="renderSimStep(${simIdx}, ${idx})">${st.title}</button>`)
      .join("");

    card.innerHTML = `
      <div class="sim-header">
        <div>
          <h3>${sim.title}</h3>
          <p class="muted-text">${sim.subtitle}</p>
        </div>
        <a href="#/cards/${sim.cardId}" class="btn btn-sm">${sim.cardLabel}</a>
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
        <h4>${box.title}</h4>
        ${box.rows
          .map(r => `
            <div class="reg-row ${r.hl ? "reg-highlight" : ""}">
              <span>${r.k}</span>
              <strong>${r.v}</strong>
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
  wrap.innerHTML = "";
  CARDS.forEach(c => {
    const item = document.createElement("div");
    item.className = "accordion-item open";
    const targetSim = getCardSimId(c);
    const simBtn = targetSim ? `<a href="#/simulators/${targetSim}" class="btn btn-sm">🔬 Диаграмма (${targetSim.toUpperCase()}) →</a>` : "";
    const lvl = c.level || "senior";
    const lvlLabel = c.levelLabel || "🟡 Senior";
    const pracHtml = c.practicalRU ? `<div class="practical-box"><strong>🛠️ 3. Практика в продакшене:</strong> ${c.practicalRU}</div>` : "";

    item.innerHTML = `
      <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
        <span>${c.qEN}</span>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <span class="level-badge level-${lvl}">${lvlLabel}</span>
          <span class="module-tag">${c.modName}</span>
        </div>
      </div>
      <div class="accordion-body">
        <p class="muted-text" style="margin-bottom:10px;">${c.qRU}</p>
        <div class="short-answer"><strong>1. Base Answer (EN):</strong> ${c.shortEN}</div>
        <strong>2. Under the Hood Details (EN):</strong>
        <ul class="details-list">${c.detailsEN.map(x => `<li>${x}</li>`).join("")}</ul>
        ${pracHtml}
        <pre class="code-block">${c.code}</pre>
        <div class="btn-group" style="margin-top: 12px;">
          <a href="#/cards/${c.id}" class="btn btn-sm">Открыть в тренажёре (${c.id.toUpperCase()}) →</a>
          ${simBtn}
        </div>
      </div>
    `;
    wrap.appendChild(item);
  });

  const tbody = document.getElementById("cheatsheet-tbody");
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

function toggleAllAccordions(open) {
  document.querySelectorAll(".accordion-item").forEach(el => {
    el.classList.toggle("open", open);
  });
}

/* --- HASH ROUTER (НАВИГАЦИЯ И ПРЯМЫЕ ССЫЛКИ) --- */
function handleRoute() {
  const hash = window.location.hash || "#/cards";
  const parts = hash.replace(/^#\//, "").split("/");
  const route = parts[0] || "cards";
  const param = parts[1] || null;

  const validRoutes = ["cards", "simulators", "wiki", "cheatsheet"];
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
  updateProgressBar();
  renderCard();
  initSimulators();
  initWikiAndCheatsheet();
  handleRoute();
});
