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
  anchorsFor: null, // id карточки, для которой открыты опоры; на другой карточке они снова скрыты
  shownCard: null, // карточка на экране: другая карточка — новая попытка, опоры снова скрыты
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

// Первая фраза короткого ответа — сам ответ на вопрос; её выделяем: её говорят первой.
// Граница — точка и пробел (числа вроде 1.22 внутри фразы не режутся, «e.g.» и «i.e.» — тоже).
function renderShortAnswer(el, text) {
  const m = /^(.+?(?<!\be\.g|\bi\.e)[.!?])\s+(?=\S)/.exec(text);
  el.replaceChildren();
  if (!m) { el.textContent = text; return; }
  const first = document.createElement("strong");
  first.className = "first-sentence";
  first.textContent = m[1];
  el.append(first, " " + text.slice(m[0].length));
}

// Опоры: 3–4 английских слова, по которым ответ пересказывается своими словами.
function anchorsHtml(card, hint) {
  if (!card.anchorsEN || !card.anchorsEN.length) return "";
  return `<div class="card-anchors">
    <strong>Опоры для пересказа</strong>
    <ul class="anchor-list" lang="en">${card.anchorsEN.map(a => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
    ${hint ? `<p class="muted-text">${escapeHtml(hint)}</p>` : ""}
  </div>`;
}

// На карточке три шага: вопрос → опоры → ответ. Опоры, однажды открытые, остаются и при закрытом ответе.
function cardAnchorsHtml(card) {
  if (!card.anchorsEN || !card.anchorsEN.length) return "";
  if (state.anchorsFor !== card.id) {
    return `<button type="button" class="btn btn-sm hint-btn" onclick="showAnchors()" aria-controls="card-anchors">Показать опоры <span class="kbd">H</span></button>`;
  }
  return anchorsHtml(card, state.revealed
    ? "Закрой ответ и перескажи его по этим словам вслух за 20 секунд."
    : "Перескажи ответ по этим словам вслух, потом открой ответ и сверь.");
}

// L — послушать короткий ответ (только когда он открыт и для него есть запись).
function listenCard() {
  const list = getFilteredCards();
  if (!list.length || !state.revealed || typeof ttsEntry !== "function") return;
  const card = list[state.index];
  if (ttsEntry(`card:${card.id}:short`, card.shortEN)) ttsToggle(`card:${card.id}:short`);
}

function showAnchors() {
  const list = getFilteredCards();
  if (!list.length) return;
  state.anchorsFor = list[state.index].id;
  renderCard();
  // Фокус на опоры: читалка сразу их прочтёт, а клавиатура продолжит с этого места.
  const box = document.querySelector("#card-anchors .card-anchors");
  if (box) {
    box.tabIndex = -1;
    box.focus({ preventScroll: true });
  }
}

// Сравнение с Java и Kotlin: опора на то, что уже знаешь, и готовый ответ на «а как в Java?».
function jvmHtml(card) {
  if (!card.jvmEN) return "";
  return `<details class="jvm-box">
    <summary>Если спросят про Java и Kotlin</summary>
    <p lang="en">${escapeHtml(card.jvmEN)}</p>
    ${typeof ttsControlsHtml === "function" ? ttsControlsHtml(`card:${card.id}:jvm`, card.jvmEN) : ""}
    ${card.jvmRU ? `<details class="translated-answer"><summary>По-русски</summary><p lang="ru">${escapeHtml(card.jvmRU)}</p></details>` : ""}
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
      <p class="muted-text">Если упустил причину или условие, отметь «С опорой» или «Не ответил». Это самопроверка, не автоматическая оценка ответа.</p>
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
  c20: "sim5", c21: "sim8",
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
  if (typeof siteCanEdit === "function" && !siteCanEdit()) {
    siteNeedSignIn("Чтобы сбрасывать отметки");
    return;
  }
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
      const hay = (c.qEN + " " + c.qRU + " " + c.shortEN + " " + (c.anchorsEN || []).join(" ") + " " + (c.jvmEN || "") + " " + (c.practicalRU || "") + " " + c.detailsEN.join(" ") + " " + (c.shortRU || "") + " " + (c.detailsRU || []).join(" ") + " " + c.code).toLowerCase();
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
    // Пустая выдача — чистый экран: ни опор, ни критериев, ни звука прежней карточки.
    if (typeof ttsStop === "function") ttsStop();
    document.getElementById("card-anchors").innerHTML = "";
    document.getElementById("card-short-tts").innerHTML = "";
    document.querySelector("#card-controls .card-grades").classList.add("hidden");
    document.getElementById("grade-criteria").classList.add("hidden");
    document.getElementById("grade-signin").classList.add("hidden");
    state.shownCard = null;
    syncCardUrl(null);
    fitCardControls();
    return;
  }

  if (state.index >= list.length) state.index = 0;
  if (state.index < 0) state.index = list.length - 1;

  const card = list[state.index];
  // Другая карточка (в том числе возврат к прежней) — новая попытка без подсказки.
  // Закрытие ответа на той же карточке опоры не прячет.
  if (state.shownCard !== card.id) {
    state.shownCard = card.id;
    state.anchorsFor = null;
  }
  document.getElementById("card-module").textContent = card.modName;

  const lvl = card.level || "senior";
  const lvlLabel = card.levelLabel || "🟡 Senior";
  const lvlEl = document.getElementById("card-level");
  lvlEl.textContent = lvlLabel;
  lvlEl.className = "level-badge level-" + lvl;

  document.getElementById("card-counter").textContent = `Карточка ${state.index + 1} из ${list.length} (${card.id.toUpperCase()})`;
  document.getElementById("card-q-en").textContent = card.qEN;
  document.getElementById("card-q-ru").textContent = card.qRU;
  renderShortAnswer(document.getElementById("card-short-en"), card.shortEN);
  // Озвучка: запись другой карточки останавливается, кнопка — только если есть запись этого текста.
  if (typeof ttsState !== "undefined" && ttsState.key && !ttsState.key.startsWith(`card:${card.id}:`)) ttsStop();
  document.getElementById("card-short-tts").innerHTML = typeof ttsControlsHtml === "function" ? ttsControlsHtml(`card:${card.id}:short`, card.shortEN) : "";
  document.getElementById("card-anchors").innerHTML = cardAnchorsHtml(card);
  document.getElementById("card-jvm").innerHTML = jvmHtml(card);
  // Новая карточка — подробности снова свёрнуты: на экране только ответ и опоры.
  const more = document.getElementById("card-more");
  if (more && more.dataset.card !== card.id) { more.open = false; more.dataset.card = card.id; }
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
  const last = lastAttempt(card.id);
  pill.textContent = (st === "mastered" ? "Изучено ✓" : st === "review" ? "На повторении" : "Новая") + (last ? ` · ${last}` : "");
  renderGradeSignIn();
  // Оценивать имеет смысл только после сверки с ответом: до этого кнопки и критерии не занимают экран.
  document.querySelector("#card-controls .card-grades").classList.toggle("hidden", !state.revealed);
  document.getElementById("grade-criteria").classList.toggle("hidden", !state.revealed);

  ansBox.classList.toggle("visible", state.revealed);
  syncCardUrl(card.id);
  fitCardControls();
}

// Адрес следует за карточкой: ссылка из адресной строки и перезагрузка открывают ту же карточку.
// «Далее» и «Назад» заменяют адрес, а не добавляют запись в историю: кнопка «Назад» браузера
// возвращает в предыдущий раздел, а не листает карточки по одной.
let routeReady = false; // до первого handleRoute адрес не трогаем: в нём может быть карточка из ссылки

function syncCardUrl(id) {
  if (!routeReady) return;
  const hash = window.location.hash;
  if (hash && !/^#\/cards(\/|$)/.test(hash)) return; // открыт другой раздел
  const want = id ? `#/cards/${id}` : "#/cards";
  if (hash !== want) history.replaceState(history.state, "", want);
}

// Телефон: панель кнопок прилипает к низу экрана. Если вся панель заняла бы больше 30 % высоты
// (крупный текст, низкий экран, открытые оценки), у края остаётся только строка «Назад · Ответ · Далее»,
// а критерии и оценки идут в потоке сразу после ответа.
function fitCardControls() {
  const controls = document.getElementById("card-controls");
  if (!controls) return;
  controls.classList.remove("controls-compact");
  const nav = document.querySelector(".bottom-nav");
  const navHeight = nav && getComputedStyle(nav).display !== "none" ? nav.getBoundingClientRect().height : 0;
  // Высота нижней панели с крупным текстом больше расчётной: отступы берут фактическую.
  if (navHeight) document.documentElement.style.setProperty("--bottom-nav-space", `${navHeight}px`);
  const room = window.innerHeight - navHeight;
  if (getComputedStyle(controls).position !== "sticky") return; // широкий экран: панель и так в потоке
  controls.classList.toggle("controls-compact", controls.getBoundingClientRect().height > room * 0.3);
}

let fitFrame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitCardControls);
});

function toggleAnswer() {
  const list = getFilteredCards();
  if (!list.length) return;
  state.revealed = !state.revealed;
  if (state.revealed) state.anchorsFor = list[state.index].id; // опоры остаются и после закрытия ответа
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
  if (typeof siteCanEdit === "function" && !siteCanEdit()) {
    siteNeedSignIn("Чтобы отмечать карточки");
    return;
  }
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

/* --- САМООЦЕНКА ОТВЕТА: сам / с опорой / не ответил; история попыток с датой --- */
const ATTEMPTS_KEY = "go_prep_attempts_v1";
const ATTEMPT_LABELS = { self: "сам", anchors: "с опорой", none: "не ответил" };

function loadAttempts() {
  try {
    const saved = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function lastAttempt(cardId) {
  const list = loadAttempts()[cardId];
  const a = Array.isArray(list) ? list[list.length - 1] : null;
  if (!a || !ATTEMPT_LABELS[a.r] || typeof a.d !== "string") return "";
  const [, m, d] = a.d.split("-");
  return `${d}.${m}: ${ATTEMPT_LABELS[a.r]}`;
}

function recordAttempt(cardId, result) {
  const all = loadAttempts();
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const list = (Array.isArray(all[cardId]) ? all[cardId] : []).filter(a => a && ATTEMPT_LABELS[a.r]);
  list.push({ d: day, r: result });
  all[cardId] = list.slice(-20); // хватит, чтобы видеть динамику, и запись не растёт без конца
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));
  } catch {
    // Без хранилища отметка в прогрессе всё равно сохраняется на странице (saveProgress сообщит об этом).
  }
}

// «Сам» — изучено; «с опорой» и «не ответил» — на повторение. Отметка прежнего формата не меняется.
function gradeCard(result) {
  if (!ATTEMPT_LABELS[result]) return;
  if (typeof siteCanEdit === "function" && !siteCanEdit()) {
    // Подсказка о входе уже стоит под кнопками: перевести фокус туда, без прыжка в начало страницы.
    const signIn = document.querySelector("#grade-signin button");
    if (signIn) {
      signIn.focus({ preventScroll: true });
      signIn.scrollIntoView({ block: "nearest" });
    } else siteNeedSignIn("Чтобы отмечать карточки");
    return;
  }
  const list = getFilteredCards();
  if (!list.length || !state.revealed) return;
  recordAttempt(list[state.index].id, result);
  markCard(result === "self" ? "mastered" : "review");
}

// Без входа отметки не сохраняются: сказать об этом до нажатия, а не после.
function renderGradeSignIn() {
  const box = document.getElementById("grade-signin");
  if (!box) return;
  const readOnly = typeof siteCanEdit === "function" && !siteCanEdit();
  box.classList.toggle("hidden", !readOnly);
  if (!readOnly || box.childElementCount) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-sm";
  button.textContent = "Войти";
  button.addEventListener("click", () => authSignIn());
  box.append("Отметки сохраняются после входа. ", button);
}
document.addEventListener("auth-changed", () => {
  const box = document.getElementById("grade-signin");
  if (box) box.replaceChildren();
  renderGradeSignIn();
});

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
  table.classList.toggle("hidden", !step.board || !(step.boxes || []).length);
  if (step.board && grid.parentElement !== table) table.append(grid);
  if (!step.board && grid.parentElement === table) table.after(grid);
  grid.innerHTML = (step.boxes || []) // шаг со схемой может обойтись без таблицы
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
// Части фишки разделены пробелами: во flex-контейнере их не видно, а читалка не склеит «G1runnable».
function boardChipHtml(item, hl, hlLabel, hlQuiet) {
  const g = typeof item === "string" ? item : item.g;
  const flag = typeof item === "string" ? "" : item.flag;
  const changed = hl.includes(g) || (typeof item === "object" && item.hl === true);
  return `<li class="g-chip${changed ? " is-changed" : ""}"><span class="g-id">${escapeHtml(g)}</span>${flag ? ` <span class="g-flag">${escapeHtml(flag)}</span>` : ""}${changed && !hlQuiet ? ` <span class="g-changed">${escapeHtml(hlLabel || "изменилось")}</span>` : ""}${changed && hlQuiet ? ` <span class="visually-hidden">выделено</span>` : ""}</li>`;
}

function boardLaneHtml(lane, hl, hlLabel, hlQuiet) {
  const slots = (lane.slots || []).map(slot => {
    const items = slot.items || [];
    const list = items.length
      ? `<${slot.queue ? "ol" : "ul"} class="board-items${slot.queue ? " is-queue" : ""}">${items.map(item => boardChipHtml(item, hl, hlLabel, hlQuiet)).join("")}</${slot.queue ? "ol" : "ul"}>`
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
    ${legend && panels.some(panel => (panel.lanes || []).length) ? `<p class="board-legend">${escapeHtml(legend)}</p>` : ""}
    <div class="board-panels${panels.length > 1 ? " is-compare" : ""}">
      ${panels.map(panel => {
        const hl = panel.hl || [];
        const list = panel.list && panel.list.items && panel.list.items.length ? `<div class="board-changes">
          <h4>${escapeHtml(panel.list.title || "Что изменилось")}</h4>
          <${panel.list.ordered ? "ol" : "ul"}>${panel.list.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</${panel.list.ordered ? "ol" : "ul"}>
        </div>` : "";
        return `<figure class="board-panel">
          ${panel.caption ? `<figcaption class="board-caption">${escapeHtml(panel.caption)}</figcaption>` : ""}
          ${(panel.lanes || []).length ? `<div class="board-lanes">${panel.lanes.map(lane => boardLaneHtml(lane, hl, panel.hlLabel, panel.hlQuiet === true)).join("")}</div>` : ""}
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
          <div class="short-answer" lang="en"><strong lang="ru">Коротко по-английски:</strong> ${escapeHtml(c.shortEN)} ${typeof ttsControlsHtml === "function" ? ttsControlsHtml(`card:${c.id}:short`, c.shortEN) : ""}</div>
          ${anchorsHtml(c)}
          ${jvmHtml(c)}
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
      <div class="quiz-own">
        <label for="${q.id}-own">Твой ответ: что выведет код или в чём дефект и как исправить</label>
        <textarea id="${q.id}-own" rows="3" spellcheck="false"></textarea>
        <button type="button" class="btn btn-sm" aria-controls="${q.id}-options" onclick="revealQuizOptions('${q.id}')">Показать варианты</button>
        <span class="quiz-own-status" id="${q.id}-own-status" role="status"></span>
      </div>
      <div class="quiz-options" id="${q.id}-options" style="margin: 16px 0;">${optionsHtml}</div>
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

// Режим «сначала свой ответ»: варианты скрыты, пока не записан свой ответ.
// Выбор режима — удобство одного браузера; без localStorage режим просто выключен.
const QUIZ_MODE_KEY = "go_prep_quiz_answer_first_v1";

function setQuizAnswerFirst(on) {
  const container = document.getElementById("quiz-container");
  if (container) container.classList.toggle("answer-first", on);
  try {
    localStorage.setItem(QUIZ_MODE_KEY, on ? "1" : "0");
  } catch {
    // Хранилище недоступно: режим работает до перезагрузки.
  }
}

function initQuizMode() {
  const toggle = document.getElementById("quiz-answer-first");
  if (!toggle) return;
  // По умолчанию — сначала свой ответ: так тренируется то, что спросят на интервью. Выбор пользователя сохраняется.
  let on = true;
  try {
    const saved = localStorage.getItem(QUIZ_MODE_KEY);
    if (saved !== null) on = saved === "1";
  } catch {
    on = true;
  }
  toggle.checked = on;
  document.getElementById("quiz-container").classList.toggle("answer-first", on);
  toggle.addEventListener("change", () => setQuizAnswerFirst(toggle.checked));
}

function revealQuizOptions(qId) {
  const own = document.getElementById(`${qId}-own`);
  const status = document.getElementById(`${qId}-own-status`);
  if (!own.value.trim()) {
    status.textContent = "Сначала запиши свой ответ — хотя бы одну фразу.";
    own.focus();
    return;
  }
  status.textContent = "Варианты открыты: сравни со своим ответом.";
  const options = document.getElementById(`${qId}-options`);
  options.classList.add("revealed");
  const first = options.querySelector("input");
  if (first) first.focus();
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
  routeReady = true;
  const hash = window.location.hash || "#/cards";
  const parts = hash.replace(/^#\//, "").split("/");
  const route = parts[0] || "cards";
  const param = parts[1] || null;

  const validRoutes = ["plan", "practice", "cards", "simulators", "wiki", "cheatsheet", "quiz"];
  const activeRoute = validRoutes.includes(route) ? route : "cards";

  document.querySelectorAll(".route-view").forEach(sec => {
    sec.classList.toggle("hidden", sec.id !== `view-${activeRoute}`);
  });

  document.querySelectorAll(".nav-tabs [data-route], .bottom-nav [data-route], .more-sheet [data-route]").forEach(link => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
    if (link.dataset.route === activeRoute) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  markMoreTab(activeRoute);

  if (activeRoute === "cards" && param && CARDS.some(c => c.id === param)) {
    // Карточка из текущей подборки открывается в ней; иначе подборка сбрасывается на все карточки.
    let idx = getFilteredCards().findIndex(c => c.id === param);
    if (idx === -1) {
      state.filter = "all";
      state.level = "all";
      state.search = "";
      document.getElementById("search-input").value = "";
      idx = CARDS.findIndex(c => c.id === param);
    }
    state.index = idx;
    state.revealed = false;
    state.anchorsFor = null; // переход по ссылке — новая попытка
    renderCard();
    window.scrollTo({ top: 0, behavior: "auto" });
  } else if (activeRoute === "cards") {
    renderCard(); // #/cards без номера: показать текущую карточку и вернуть её номер в адрес
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

  const setCount = (name, n) => document.querySelectorAll(`[data-count="${name}"]`).forEach(el => { el.textContent = n; });
  setCount("cards", total);
  if (typeof SIMULATORS !== "undefined") setCount("simulators", SIMULATORS.length);
  if (typeof QUIZ_QUESTIONS !== "undefined") setCount("quiz", QUIZ_QUESTIONS.length);

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
  if (e.key === "h" || e.key === "H" || e.key === "р" || e.key === "Р") showAnchors();
  if (e.key === "l" || e.key === "L" || e.key === "д" || e.key === "Д") listenCard();
  if (e.key === "1") gradeCard("self");
  if (e.key === "2") gradeCard("anchors");
  if (e.key === "3") gradeCard("none");
});

/* --- НИЖНЯЯ ПАНЕЛЬ НА ТЕЛЕФОНЕ: три главных раздела и шторка «Ещё» --- */
const MORE_ROUTES = { quiz: "Quiz", practice: "Практикум", wiki: "База знаний", cheatsheet: "Шпаргалка" };

// Раздел из шторки открыт — «Ещё» подсвечена, а читалка слышит, какой раздел сейчас.
function markMoreTab(route) {
  const more = document.getElementById("more-open");
  if (!more) return;
  more.classList.toggle("active", route in MORE_ROUTES);
  more.setAttribute("aria-label", route in MORE_ROUTES ? `Ещё разделы, открыт: ${MORE_ROUTES[route]}` : "Ещё разделы");
  const sheet = document.getElementById("more-sheet");
  if (sheet && sheet.open) sheet.close(); // переход (в том числе «Назад») закрывает шторку
}

// Поле ввода получает фокус → на телефоне выезжает клавиатура; панель прячется, чтобы не закрывать ввод.
function isTypingTarget(el) {
  if (!el) return false;
  if (el.tagName === "TEXTAREA" || el.isContentEditable) return true;
  return el.tagName === "INPUT" && !["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes(el.type);
}

function initBottomNav() {
  const sheet = document.getElementById("more-sheet");
  const open = document.getElementById("more-open");
  if (!sheet || !open) return;
  open.addEventListener("click", () => {
    sheet.showModal();
    open.setAttribute("aria-expanded", "true");
  });
  sheet.addEventListener("close", () => open.setAttribute("aria-expanded", "false"));
  sheet.querySelector(".more-close").addEventListener("click", () => sheet.close());
  // Касание затемнённого фона попадает в сам dialog: содержимое лежит во внутреннем блоке.
  sheet.addEventListener("click", event => { if (event.target === sheet) sheet.close(); });
  sheet.querySelectorAll("a").forEach(link => link.addEventListener("click", () => sheet.close()));
  // Повторное касание открытого раздела — к началу страницы, как в мобильных приложениях.
  document.querySelectorAll(".bottom-nav a.bottom-tab").forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      const hash = window.location.hash;
      if (hash !== href && !hash.startsWith(href + "/")) return; // #/cards/c5 — тот же раздел, что #/cards
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  });
  document.addEventListener("focusin", event => document.body.classList.toggle("keyboard-open", isTypingTarget(event.target)));
  document.addEventListener("focusout", () => {
    // Фокус ещё не перешёл на новый элемент: проверяем после текущего события.
    setTimeout(() => document.body.classList.toggle("keyboard-open", isTypingTarget(document.activeElement)), 0);
  });
}

window.addEventListener("hashchange", handleRoute);

/* --- НОВАЯ ВЕРСИЯ САЙТА --- */
// Вкладка может неделями висеть со старой копией: ссылки #/… страницу не перезагружают.
// Номер выпуска — ?v= у скриптов в index.html. При возврате на вкладку (не чаще раза в 5 минут)
// сверяем его с index.html на сервере и, если он другой, предлагаем обновить. Сами не перезагружаем:
// можно потерять недописанный ответ.
const SITE_VERSION = (() => {
  const script = document.querySelector('script[src*="js/app.js"]');
  const m = script && /[?&]v=(\d+)/.exec(script.getAttribute("src"));
  return m ? m[1] : null;
})();
const VERSION_CHECK_MS = 5 * 60 * 1000;
let versionCheckedAt = 0;
let versionDismissed = null; // «Позже» — до следующего выпуска не напоминаем

async function checkSiteVersion(force) {
  if (!SITE_VERSION || !window.fetch || window.location.protocol === "file:") return;
  if (!force && Date.now() - versionCheckedAt < VERSION_CHECK_MS) return;
  versionCheckedAt = Date.now();
  try {
    const res = await fetch(`./?vcheck=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return;
    const m = /js\/app\.js\?v=(\d+)/.exec(await res.text());
    if (m && m[1] !== SITE_VERSION && m[1] !== versionDismissed) showUpdateBanner(m[1]);
  } catch { /* нет сети — проверим при следующем возвращении */ }
}

function showUpdateBanner(version) {
  const banner = document.getElementById("update-banner");
  if (!banner) return;
  banner.dataset.version = version;
  banner.classList.remove("hidden");
}

function initUpdateBanner() {
  const label = document.getElementById("site-version");
  if (label && SITE_VERSION) label.textContent = `Версия сайта ${SITE_VERSION}`;
  const banner = document.getElementById("update-banner");
  if (!banner) return;
  document.getElementById("update-reload").addEventListener("click", () => window.location.reload());
  document.getElementById("update-later").addEventListener("click", () => {
    versionDismissed = banner.dataset.version || null;
    banner.classList.add("hidden");
  });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkSiteVersion(); });
  window.addEventListener("focus", () => checkSiteVersion());
  // Страница из кеша «Назад/Вперёд» браузера — проверить сразу.
  window.addEventListener("pageshow", event => { if (event.persisted) checkSiteVersion(true); });
  setInterval(() => { if (document.visibilityState === "visible") checkSiteVersion(); }, 15 * 60 * 1000);
  setTimeout(() => checkSiteVersion(true), 3000); // index.html мог прийти из кеша браузера
}

document.addEventListener("DOMContentLoaded", () => {
  initUpdateBanner();
  showStorageMessage();
  syncDynamicCounters();
  updateProgressBar();
  renderCard();
  initSimulators();
  initWikiAndCheatsheet();
  initQuiz();
  initQuizMode();
  initBottomNav();
  handleRoute();
});
