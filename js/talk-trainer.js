// Тренажёр проговора задачи: шаги PLAN.talkSteps (Clarify → Approach → Complexity → Edge cases)
// с таймером на шаг и на всю задачу, эталоном из PLAN.talks и самооценкой.
// Результаты — в localStorage под go_prep_talk_v1 (синхронизируется вместе с прочим прогрессом go_prep_*).

const TALK_STORAGE_KEY = "go_prep_talk_v1";
const TALK_KEEP = 5; // сколько последних попыток хранить на задачу
// Ориентир по времени на шаг, секунды: на интервью весь проговор до кода — около трёх минут.
const TALK_TARGET_SEC = { clarify: 30, approach: 90, complexity: 30, edge: 45 };
const TALK_RATES = [
  { id: "said", label: "Сказал" },
  { id: "partial", label: "Частично" },
  { id: "missed", label: "Не вспомнил" }
];

const talkState = {
  dialog: null,
  opener: null,
  key: "",
  steps: [],
  index: 0,
  results: [],   // { id, sec, rate } по пройденным шагам
  stepStart: 0,  // Date.now() начала текущего отрезка шага
  stepSpent: 0,  // накопленные мс шага до паузы
  totalSpent: 0, // мс по завершённым шагам
  paused: false,
  revealed: false,
  timer: null
};

function talkStepsFor(talk) {
  if (!talk || typeof PLAN === "undefined" || !Array.isArray(PLAN.talkSteps)) return [];
  return PLAN.talkSteps.filter(step => typeof talk[step.id] === "string" && talk[step.id].trim());
}

// Тренажёр есть у задачи, если в её проговоре хотя бы три шага из четырёх.
function talkHasTrainer(key) {
  return talkStepsFor(PLAN.talks && PLAN.talks[key]).length >= 3;
}

/* --- Хранилище: необязательное и недоверенное --- */
function talkLoadAll() {
  try {
    const raw = localStorage.getItem(TALK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const results = parsed && typeof parsed === "object" && parsed.results;
    if (!results || typeof results !== "object" || Array.isArray(results)) return {};
    const rateIds = new Set(TALK_RATES.map(r => r.id));
    const stepIds = new Set((PLAN.talkSteps || []).map(s => s.id));
    const clean = {};
    for (const [key, list] of Object.entries(results)) {
      if (!PLAN.talks || !PLAN.talks[key] || !Array.isArray(list)) continue;
      const attempts = list.filter(a => a && typeof a.at === "string" && /^\d{4}-\d{2}-\d{2}/.test(a.at) &&
        Number.isInteger(a.total) && a.total >= 0 && Array.isArray(a.steps) &&
        a.steps.every(s => s && stepIds.has(s.id) && Number.isInteger(s.sec) && s.sec >= 0 && rateIds.has(s.rate)));
      if (attempts.length) clean[key] = attempts.slice(-TALK_KEEP);
    }
    return clean;
  } catch {
    return {};
  }
}

function talkSaveAttempt(key, attempt) {
  const all = talkLoadAll();
  all[key] = [...(all[key] || []), attempt].slice(-TALK_KEEP);
  try {
    localStorage.setItem(TALK_STORAGE_KEY, JSON.stringify({ schema: 1, results: all }));
    return true;
  } catch {
    return false;
  }
}

function talkLastAttempt(key) {
  const list = talkLoadAll()[key];
  return list && list.length ? list[list.length - 1] : null;
}

/* --- Форматирование --- */
function talkClock(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function talkStepName(id) {
  const step = (PLAN.talkSteps || []).find(s => s.id === id);
  return step ? step.en : id;
}

function talkRateLabel(id) {
  const rate = TALK_RATES.find(r => r.id === id);
  return rate ? rate.label : id;
}

function talkWeak(attempt) {
  return attempt.steps.filter(s => s.rate !== "said").map(s => talkStepName(s.id));
}

// Короткая строка о последней попытке — рядом с кнопкой тренажёра.
function talkLastSummary(key) {
  const last = talkLastAttempt(key);
  if (!last) return "";
  const weak = talkWeak(last);
  const date = last.at.slice(8, 10) + "." + last.at.slice(5, 7);
  return `Последний раз ${date}: ${talkClock(last.total)}, ${weak.length ? `повторить — ${weak.join(", ")}` : "все шаги сказаны"}.`;
}

/* --- Таймер --- */
function talkStepSec() {
  const running = talkState.paused ? 0 : Date.now() - talkState.stepStart;
  return (talkState.stepSpent + running) / 1000;
}

function talkTick() {
  const dialog = talkState.dialog;
  if (!dialog || !dialog.open || talkState.index >= talkState.steps.length) return;
  const step = talkState.steps[talkState.index];
  const sec = talkStepSec();
  const target = TALK_TARGET_SEC[step.id] || 60;
  const stepNode = dialog.querySelector(".talk-step-time");
  const totalNode = dialog.querySelector(".talk-total-time");
  if (stepNode) {
    const over = sec > target;
    stepNode.textContent = over ? `на шаге ${talkClock(sec)} — сверх ориентира на ${talkClock(sec - target)}` : `на шаге ${talkClock(sec)} из ${talkClock(target)}`;
    stepNode.classList.toggle("is-over", over);
  }
  if (totalNode) totalNode.textContent = `всего ${talkClock(talkState.totalSpent / 1000 + sec)}`;
}

function talkStopTimer() {
  if (talkState.timer) clearInterval(talkState.timer);
  talkState.timer = null;
}

function talkStartTimer() {
  talkStopTimer();
  talkState.timer = setInterval(talkTick, 1000);
}

function talkTogglePause(button) {
  if (talkState.paused) {
    talkState.paused = false;
    talkState.stepStart = Date.now();
  } else {
    talkState.stepSpent += Date.now() - talkState.stepStart;
    talkState.paused = true;
  }
  button.textContent = talkState.paused ? "Продолжить" : "Пауза";
  button.setAttribute("aria-pressed", String(talkState.paused));
  talkTick();
}

/* --- Окно --- */
function talkDialog() {
  if (talkState.dialog) return talkState.dialog;
  const dialog = planEl("dialog", { className: "more-sheet talk-sheet", "aria-labelledby": "talk-title" });
  dialog.addEventListener("close", () => {
    talkStopTimer();
    if (talkState.opener && document.contains(talkState.opener)) talkState.opener.focus();
  });
  document.body.append(dialog);
  talkState.dialog = dialog;
  return dialog;
}

function talkHead(talk) {
  const close = planEl("button", { type: "button", className: "more-close", "aria-label": "Закрыть тренажёр", text: "✕" });
  close.addEventListener("click", () => talkState.dialog.close());
  return planEl("div", { className: "more-sheet-head" }, [
    planEl("h2", { id: "talk-title", text: `Проговор: ${talk.title}` }),
    close
  ]);
}

function talkRenderStep() {
  const dialog = talkState.dialog;
  const talk = PLAN.talks[talkState.key];
  const step = talkState.steps[talkState.index];
  const n = talkState.index + 1;
  const total = talkState.steps.length;
  talkState.revealed = false;

  const model = planEl("p", { className: "talk-model hidden", lang: "en", id: "talk-model", text: talk[step.id] });
  const reveal = planEl("button", { type: "button", className: "btn btn-sm", "aria-expanded": "false", "aria-controls": "talk-model", text: "Показать эталон" });
  reveal.addEventListener("click", () => {
    talkState.revealed = !talkState.revealed;
    model.classList.toggle("hidden", !talkState.revealed);
    reveal.setAttribute("aria-expanded", String(talkState.revealed));
    reveal.textContent = talkState.revealed ? "Скрыть эталон" : "Показать эталон";
  });
  const pause = planEl("button", { type: "button", className: "btn btn-sm", "aria-pressed": "false", text: "Пауза" });
  pause.addEventListener("click", () => talkTogglePause(pause));

  const rates = TALK_RATES.map(rate => {
    const button = planEl("button", { type: "button", className: `btn talk-rate talk-rate-${rate.id}`, text: rate.label });
    button.addEventListener("click", () => talkRate(rate.id));
    return button;
  });

  const body = planEl("div", { className: "more-sheet-body talk-body" }, [
    talkHead(talk),
    planEl("p", { className: "talk-progress" }, [
      planEl("span", { text: `Шаг ${n} из ${total}` }), " · ",
      planEl("span", { className: "talk-step-time" }), " · ",
      planEl("span", { className: "talk-total-time" })
    ]),
    planEl("h3", { className: "talk-step-name", lang: "en", tabindex: "-1", text: step.en }),
    planEl("p", { className: "muted-text", text: `${step.ru}. Скажи вслух по-английски, потом сверь.` }),
    planEl("p", { className: "talk-phrase" }, [planEl("span", { text: "Начни так: " }), planEl("em", { lang: "en", text: step.phrase })]),
    planEl("div", { className: "btn-group" }, [reveal, pause]),
    model,
    planEl("fieldset", { className: "talk-rates" }, [
      planEl("legend", { text: n < total ? "Как получилось? Ответ переведёт на следующий шаг" : "Как получилось? Ответ покажет итог" }),
      planEl("div", { className: "btn-group" }, rates)
    ])
  ]);
  dialog.replaceChildren(body);
  talkTick();
  // Фокус на название шага, а не на оценку: случайный Enter не должен ставить «Сказал».
  if (dialog.open) dialog.querySelector(".talk-step-name").focus();
}

function talkRate(rateId) {
  const step = talkState.steps[talkState.index];
  const sec = Math.round(talkStepSec());
  talkState.results.push({ id: step.id, sec, rate: rateId });
  talkState.totalSpent += sec * 1000;
  talkState.index += 1;
  talkState.stepSpent = 0;
  talkState.paused = false;
  talkState.stepStart = Date.now();
  if (talkState.index < talkState.steps.length) talkRenderStep();
  else talkFinish();
}

function talkFinish() {
  talkStopTimer();
  const key = talkState.key;
  const talk = PLAN.talks[key];
  const attempt = { at: planToIsoDate(new Date()), total: Math.round(talkState.totalSpent / 1000), steps: talkState.results };
  const previous = talkLoadAll()[key] || [];
  const canSave = typeof siteCanEdit !== "function" || siteCanEdit();
  const saved = canSave && talkSaveAttempt(key, attempt);
  const target = talkState.steps.reduce((sum, s) => sum + (TALK_TARGET_SEC[s.id] || 60), 0);
  const weak = talkWeak(attempt);

  const rows = attempt.steps.map(s => {
    const limit = TALK_TARGET_SEC[s.id] || 60;
    const over = s.sec > limit ? ` (сверх ориентира на ${talkClock(s.sec - limit)})` : "";
    return planEl("li", { className: `talk-result talk-result-${s.rate}` }, [
      planEl("strong", { lang: "en", text: talkStepName(s.id) }), ` — ${talkRateLabel(s.rate)}, ${talkClock(s.sec)}${over}`
    ]);
  });
  let saveNote;
  if (saved) saveNote = planEl("p", { className: "muted-text", text: "Результат сохранён: он виден рядом с кнопкой тренажёра." });
  else if (!canSave) {
    const signIn = planEl("button", { type: "button", className: "btn btn-sm", text: "Войти, чтобы сохранять" });
    signIn.addEventListener("click", () => { talkState.dialog.close(); siteNeedSignIn("Чтобы сохранять тренировки проговора"); });
    saveNote = planEl("p", { className: "muted-text" }, ["Без входа результат не сохраняется. ", signIn]);
  } else saveNote = planEl("p", { className: "muted-text", text: "Браузер не дал сохранить результат: он останется только в этом окне." });

  const again = planEl("button", { type: "button", className: "btn btn-primary", text: "Ещё раз" });
  again.addEventListener("click", () => talkOpen(key, talkState.opener));
  const close = planEl("button", { type: "button", className: "btn", text: "Закрыть" });
  close.addEventListener("click", () => talkState.dialog.close());

  const history = previous.slice(-3).reverse().map(a =>
    planEl("li", { text: `${a.at.slice(8, 10)}.${a.at.slice(5, 7)} — ${talkClock(a.total)}, ${talkWeak(a).length ? `повторить: ${talkWeak(a).join(", ")}` : "все шаги сказаны"}` }));

  const body = planEl("div", { className: "more-sheet-body talk-body" }, [
    talkHead(talk),
    planEl("h3", { id: "talk-summary", tabindex: "-1", text: `Итог: ${talkClock(attempt.total)} при ориентире ${talkClock(target)}` }),
    planEl("ul", { className: "details-list talk-results" }, rows),
    planEl("p", { className: "talk-weak" }, [planEl("strong", { text: weak.length ? "Повторить: " : "Все шаги сказаны. " }),
      weak.length ? weak.join(", ") : "Следующий раз — без подсказки «Начни так»."]),
    saveNote,
    history.length ? planEl("details", { className: "translated-answer" }, [
      planEl("summary", { text: "Прошлые попытки" }), planEl("ul", { className: "details-list" }, history)
    ]) : null,
    planEl("div", { className: "btn-group" }, [again, close])
  ]);
  talkState.dialog.replaceChildren(body);
  body.querySelector("#talk-summary").focus();
  // Строка о последней попытке под задачей — обновить без перерисовки плана.
  document.querySelectorAll(`[data-talk-last="${key}"]`).forEach(node => { node.textContent = talkLastSummary(key); });
}

function talkOpen(key, opener) {
  const talk = PLAN.talks && PLAN.talks[key];
  const steps = talkStepsFor(talk);
  if (steps.length < 3) return;
  const dialog = talkDialog();
  Object.assign(talkState, {
    opener: opener || document.activeElement, key, steps, index: 0, results: [],
    stepStart: Date.now(), stepSpent: 0, totalSpent: 0, paused: false
  });
  talkRenderStep();
  if (!dialog.open) {
    dialog.showModal();
    dialog.querySelector(".talk-step-name").focus();
  }
  talkTick();
  talkStartTimer();
}

// Кнопка тренажёра и строка о последней попытке — под задачей плана.
function talkTrainerNode(key) {
  if (!talkHasTrainer(key)) return null;
  const button = planEl("button", { type: "button", className: "btn btn-sm talk-open", text: "🎙 Проговорить с таймером" });
  button.addEventListener("click", () => talkOpen(key, button));
  return planEl("div", { className: "talk-trainer" }, [
    button,
    planEl("span", { className: "muted-text talk-last", "data-talk-last": key, text: talkLastSummary(key) })
  ]);
}
