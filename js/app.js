let state = {
  filter: "all",
  level: "all",
  search: "",
  index: 0,
  revealed: false,
  progress: JSON.parse(localStorage.getItem("go_prep_progress_v2") || "{}")
};

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
    if (state.level !== "all" && c.level !== state.level) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = (c.qEN + " " + c.qRU + " " + c.shortEN + " " + c.practicalRU + " " + c.code).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderCard() {
  const list = getFilteredCards();
  const ansBox = document.getElementById("card-answer-box");

  if (list.length === 0) {
    document.getElementById("card-module").textContent = "ПУСТО";
    document.getElementById("card-level").textContent = "—";
    document.getElementById("card-counter").textContent = "0 из 0";
    document.getElementById("card-q-en").textContent = "Нет карточек по выбранному фильтру";
    document.getElementById("card-q-ru").textContent = "Переключи фильтр модуля/уровня выше или очисти строку поиска.";
    ansBox.classList.remove("visible");
    return;
  }

  if (state.index >= list.length) state.index = 0;
  if (state.index < 0) state.index = list.length - 1;

  const card = list[state.index];
  document.getElementById("card-module").textContent = card.modName;

  const lvlEl = document.getElementById("card-level");
  lvlEl.textContent = card.levelLabel;
  lvlEl.className = "level-badge level-" + card.level;

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

  document.getElementById("card-practical-ru").textContent = card.practicalRU || "";
  document.getElementById("card-code").textContent = card.code;

  const simLinkWrap = document.getElementById("card-sim-link");
  if (card.simId) {
    simLinkWrap.innerHTML = `<a href="#/simulators/${card.simId}" class="btn btn-sm">🔬 Открыть интерактивную диаграмму по этой теме →</a>`;
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
  document.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("active", c.dataset.filter === f);
  });
  renderCard();
}

function setLevel(lvl) {
  state.level = lvl;
  state.index = 0;
  state.revealed = false;
  document.querySelectorAll(".level-chip").forEach(c => {
    c.classList.toggle("active", c.dataset.level === lvl);
  });
  renderCard();
}

function onSearchInput() {
  state.search = document.getElementById("search-input").value.trim();
  state.index = 0;
  renderCard();
}

/* --- ИНТЕРАКТИВНЫЕ СИМУЛЯТОРЫ --- */
function setRow(id, val, highlight) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelector("strong").textContent = val;
  el.classList.toggle("reg-highlight", !!highlight);
}

function renderSim1(idx) {
  document.querySelectorAll("#sim1-steps .step-pill").forEach((b, i) => b.classList.toggle("active", i === idx));
  const d = SIM1_DATA[idx];
  document.getElementById("sim1-desc").textContent = d.desc;
  setRow("s1-r14", d.r14, idx === 3 || idx === 4);
  setRow("s1-rsp", d.rsp, idx === 3 || idx === 4);
  setRow("s1-rip", d.rip, idx === 3);
  setRow("s1-runnext", d.runnext, idx === 2);
  setRow("s1-runq", d.runq, idx === 2);
  setRow("s1-gfree", d.gfree, idx === 0 || idx === 4);
  setRow("s1-gstatus", d.gstatus, true);
  setRow("s1-gobuf", d.gobuf, idx === 1);
  setRow("s1-bottom", d.bottom, idx === 1 || idx === 4);
}

function renderSim2(idx) {
  document.querySelectorAll("#sim2-steps .step-pill").forEach((b, i) => b.classList.toggle("active", i === idx));
  const d = SIM2_DATA[idx];
  document.getElementById("sim2-desc").textContent = d.desc;
  setRow("s2-g1state", d.g1state, true);
  setRow("s2-g1var", d.g1var, idx === 2);
  setRow("s2-seldone", d.seldone, idx === 2);
  setRow("s2-lock", d.lock, idx === 1);
  setRow("s2-recvq", d.recvq, idx === 0);
  setRow("s2-buf", d.buf, false);
  setRow("s2-g2action", d.g2action, idx === 2);
  setRow("s2-copy", d.copy, idx === 2);
  setRow("s2-runnext", d.runnext, idx === 3);
}

function renderSim3(idx) {
  document.querySelectorAll("#sim3-steps .step-pill").forEach((b, i) => b.classList.toggle("active", i === idx));
  const d = SIM3_DATA[idx];
  document.getElementById("sim3-desc").textContent = d.desc;
  setRow("s3-phase", d.phase, true);
  setRow("s3-wb", d.wb, idx === 2);
  setRow("s3-roots", d.roots, idx === 1);
  setRow("s3-white", d.white, idx === 3);
  setRow("s3-grey", d.grey, idx === 1 || idx === 2);
  setRow("s3-black", d.black, idx === 3);
}

function initSimulators() {
  const s1Wrap = document.getElementById("sim1-steps");
  SIM1_DATA.forEach((step, idx) => {
    const b = document.createElement("button");
    b.className = "step-pill" + (idx === 0 ? " active" : "");
    b.textContent = step.title;
    b.onclick = () => renderSim1(idx);
    s1Wrap.appendChild(b);
  });
  renderSim1(0);

  const s2Wrap = document.getElementById("sim2-steps");
  SIM2_DATA.forEach((step, idx) => {
    const b = document.createElement("button");
    b.className = "step-pill" + (idx === 0 ? " active" : "");
    b.textContent = step.title;
    b.onclick = () => renderSim2(idx);
    s2Wrap.appendChild(b);
  });
  renderSim2(0);

  const s3Wrap = document.getElementById("sim3-steps");
  SIM3_DATA.forEach((step, idx) => {
    const b = document.createElement("button");
    b.className = "step-pill" + (idx === 0 ? " active" : "");
    b.textContent = step.title;
    b.onclick = () => renderSim3(idx);
    s3Wrap.appendChild(b);
  });
  renderSim3(0);
}

/* --- БАЗА ЗНАНИЙ (WIKI) И ТАБЛИЦА-ШПАРГАЛКА --- */
function initWikiAndCheatsheet() {
  const wrap = document.getElementById("accordion-container");
  wrap.innerHTML = "";
  CARDS.forEach(c => {
    const item = document.createElement("div");
    item.className = "accordion-item open";
    const simBtn = c.simId ? `<a href="#/simulators/${c.simId}" class="btn btn-sm">Диаграмма →</a>` : "";
    item.innerHTML = `
      <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
        <span>${c.qEN}</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <span class="level-badge level-${c.level}">${c.levelLabel}</span>
          <span class="module-tag">${c.modName}</span>
        </div>
      </div>
      <div class="accordion-body">
        <p class="muted-text" style="margin-bottom:10px;">${c.qRU}</p>
        <div class="short-answer"><strong>1. Base Answer (EN):</strong> ${c.shortEN}</div>
        <strong>2. Under the Hood Details (EN):</strong>
        <ul class="details-list">${c.detailsEN.map(x => `<li>${x}</li>`).join("")}</ul>
        <div class="practical-box"><strong>🛠️ 3. Практика в продакшене:</strong> ${c.practicalRU}</div>
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
    setFilter("all");
    setLevel("all");
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
      setTimeout(() => targetSim.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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
