// Раздел #/plan: программа на 13 недель с отметками выполнения.
// Данные — data/plan.js (PLAN). Прогресс хранится отдельно от карточек
// под ключом go_prep_plan_v1 и не влияет на go_prep_progress_v2.

const PLAN_STORAGE_KEY = "go_prep_plan_v1";
const PLAN_DAY_KEYS = { "Пн": "mon", "Вт": "tue", "Ср": "wed", "Чт": "thu", "Пт": "fri", "Сб": "sat", "Вс": "sun" };
const PLAN_DAY_OFFSETS = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

const planState = {
  saved: null,
  storageMessage: "",
  startNote: "",
  renderedDay: "",
  drafts: {} // черновики ответов predict: живут до перезагрузки страницы, не сохраняются
};

// Строгая проверка: 2026-02-31 не нормализуется в март, а отклоняется.
function planIsValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function planToIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Неделя плана начинается в понедельник: другой день переносится на понедельник той же недели.
function planMondayOf(value) {
  const date = planParseDate(value);
  const shift = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - shift);
  return planToIsoDate(date);
}

function planParseDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function planFormatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function planAllTaskIds() {
  const ids = new Set();
  PLAN.weeks.forEach(week => week.days.forEach(day => day.tasks.forEach(task => ids.add(task.id))));
  return ids;
}

function planLoad() {
  const fallback = { schema: 1, start: PLAN.defaultStart, done: {} };
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid plan progress");
    const known = planAllTaskIds();
    const done = {};
    if (parsed.done && typeof parsed.done === "object") {
      for (const [id, value] of Object.entries(parsed.done)) {
        if (known.has(id) && value === true) done[id] = true;
      }
    }
    return { schema: 1, start: planIsValidDate(parsed.start) ? planMondayOf(parsed.start) : PLAN.defaultStart, done };
  } catch {
    planState.storageMessage = "Не удалось прочитать отметки плана. Можно продолжать, но новые отметки могут не сохраниться.";
    return fallback;
  }
}

function planSave() {
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planState.saved));
    planState.storageMessage = "";
  } catch {
    planState.storageMessage = "Браузер не разрешил сохранение: отметки плана останутся только на этой открытой странице.";
  }
}

// Номер текущей недели (1…13) и ключ дня; null, если программа ещё не началась.
function planToday() {
  const start = planParseDate(planState.saved.start);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today - start) / 86400000);
  if (diffDays < 0) return { before: true, daysLeft: -diffDays };
  const weekNumber = Math.floor(diffDays / 7) + 1;
  const dayKey = Object.keys(PLAN_DAY_OFFSETS).find(key => PLAN_DAY_OFFSETS[key] === diffDays % 7);
  if (weekNumber > PLAN.weeks.length) return { after: true };
  return { weekNumber, dayKey };
}

function planWeekDates(index) {
  const start = planParseDate(planState.saved.start);
  const from = new Date(start);
  from.setDate(start.getDate() + index * 7);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return { from, to };
}

function planDayDate(index, dayKey) {
  const { from } = planWeekDates(index);
  const date = new Date(from);
  date.setDate(from.getDate() + PLAN_DAY_OFFSETS[dayKey]);
  return date;
}

// Прогресс считается по обязательным задачам; «по желанию» — отдельно и не мешает закрыть неделю.
function planCounts(tasks) {
  const required = tasks.filter(task => !task.optional);
  const optional = tasks.filter(task => task.optional);
  const isDone = task => Boolean(planState.saved.done[task.id]);
  return {
    done: required.filter(isDone).length, total: required.length,
    optionalDone: optional.filter(isDone).length, optionalTotal: optional.length
  };
}

function planWeekCounts(week) {
  return planCounts(week.days.flatMap(day => day.tasks));
}

/* --- Построение DOM без innerHTML: весь текст передаётся через textContent --- */
function planEl(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of [].concat(children || [])) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function planSiteItem(id) {
  if (id.startsWith("sim")) {
    const sim = SIMULATORS.find(s => s.id === id);
    return sim ? { href: `#/simulators/${id}`, label: `${id.toUpperCase()} · ${sim.title}`, kind: "Диаграмма" } : null;
  }
  if (id.startsWith("c")) {
    const card = CARDS.find(c => c.id === id);
    return card ? { href: `#/cards/${id}`, label: `${id.toUpperCase()} · ${card.qEN.replace(/^Q\d+:\s*/, "")}`, kind: "Карточка", level: card.level, reviewed: Boolean(card.sources && card.sources.length) } : null;
  }
  if (id.startsWith("q")) {
    const quiz = QUIZ_QUESTIONS.find(q => q.id === id);
    return quiz ? { href: `#/quiz/${id}`, label: `${id.toUpperCase()} · ${quiz.title.replace(/^Задача \d+:\s*/, "")}`, kind: "Quiz", reviewed: Boolean(quiz.sources && quiz.sources.length) } : null;
  }
  return null;
}

// Официальная документация и сами сервисы; остальное помечается как вторичный материал.
const PLAN_PRIMARY_HOSTS = ["go.dev", "pkg.go.dev", "grpc.io", "opentelemetry.io", "golang.testcontainers.org",
  "google.github.io", "www.postgresql.org", "kafka.apache.org", "leetcode.com", "www.pramp.com", "interviewing.io"];

// Пометки у ссылки на материал сайта: глубина и статус редакции.
function planItemBadges(item) {
  return [
    item.level === "deep" ? planEl("span", { className: "plan-optional", text: "Deep Dive" }) : null,
    item.reviewed === false ? planEl("span", { className: "plan-unreviewed", text: "на редакции" }) : null
  ];
}

function planIsSecondary(url) {
  try {
    return !PLAN_PRIMARY_HOSTS.includes(new URL(url).hostname);
  } catch {
    return true;
  }
}

function planLeetcodeUrl(number) {
  return `https://leetcode.com/problems/${PLAN.leetcodeIndex[number].slug}/`;
}

function planTalkBlock(key) {
  const talk = PLAN.talks[key];
  if (!talk) return null;
  const body = planEl("div", { className: "plan-talk-body", lang: "en" });
  if (talk.dialog) {
    talk.dialog.forEach(([who, line]) => {
      body.append(planEl("p", { className: who === "You" ? "plan-dialog-you" : "plan-dialog-them" }, [
        planEl("strong", { text: `${who}: ` }), line
      ]));
    });
  }
  const steps = [
    ["Clarify", talk.clarify], ["Approach", talk.approach], ["Complexity", talk.complexity],
    ["Edge cases & tests", talk.edge], ["Follow-up", talk.followUp]
  ];
  steps.forEach(([label, text]) => {
    if (text) body.append(planEl("p", {}, [planEl("strong", { text: `${label}: ` }), text]));
  });
  if (talk.lines) body.append(planEl("ul", { className: "details-list" }, talk.lines.map(line => planEl("li", { text: line }))));
  return planEl("details", { className: "translated-answer plan-talk" }, [
    planEl("summary", { text: `Проговор: ${talk.title}` }),
    planEl("p", { className: "muted-text", lang: "ru", text: "Сначала скажи своё решение вслух, потом сверяйся. Не заучивать — опираться на скелет. Это редакционный набросок: проверку по рубрике он ещё не проходил." }),
    body
  ]);
}

function planTaskItem(task, week) {
  const inputId = `plan-task-${task.id}`;
  const checkbox = planEl("input", { type: "checkbox", id: inputId });
  checkbox.checked = Boolean(planState.saved.done[task.id]);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) planState.saved.done[task.id] = true;
    else delete planState.saved.done[task.id];
    planSave();
    planUpdateCounters(week);
  });

  const extras = [];
  if (task.optional) extras.push(planEl("span", { className: "plan-optional", text: "по желанию" }));

  const linkNodes = (task.links || []).map(planSiteItem).filter(Boolean).map(item =>
    planEl("span", { className: "plan-link" }, [planEl("a", { href: item.href }, item.label), ...planItemBadges(item)]));
  const refNodes = (task.refs || []).map(ref => planEl("a", { href: ref.u, target: "_blank", rel: "noopener noreferrer" },
    planIsSecondary(ref.u) ? [`${ref.t} ↗ `, planEl("span", { className: "plan-secondary", text: "вторичный" })] : `${ref.t} ↗`));
  let lcNode = null;
  if (task.lc && PLAN.leetcodeIndex[task.lc]) {
    const lc = PLAN.leetcodeIndex[task.lc];
    lcNode = planEl("details", { className: "plan-hint" }, [
      planEl("summary", { text: `Подсказка: идея LC ${task.lc} (открыть после своей попытки)` }),
      planEl("p", { lang: "en", text: `${lc.pattern}. ${lc.key}` })
    ]);
    refNodes.unshift(planEl("a", { href: planLeetcodeUrl(task.lc), target: "_blank", rel: "noopener noreferrer" }, `LeetCode ${task.lc}. ${lc.title} ↗`));
  }

  const links = [...linkNodes, ...refNodes];
  return planEl("li", { className: `plan-task${task.optional ? " is-optional" : ""}` }, [
    planEl("div", { className: "plan-task-row" }, [
      checkbox,
      planEl("label", { for: inputId, text: task.text }),
      ...extras
    ]),
    links.length ? planEl("nav", { className: "related-links plan-links", "aria-label": "Материалы к задаче" }, links) : null,
    lcNode,
    task.talk ? planTalkBlock(task.talk) : null
  ]);
}

function planDraftArea(id) {
  const area = planEl("textarea", { id, rows: "2", className: "plan-answer" });
  area.value = planState.drafts[id] || "";
  area.addEventListener("input", () => { planState.drafts[id] = area.value; });
  return area;
}

function planPredictBlock() {
  if (!PLAN.predict || !PLAN.predict.length) return null;
  const items = PLAN.predict.map(item => {
    const answerId = `plan-predict-${item.id}`;
    return planEl("li", { className: "plan-predict" }, [
      planEl("pre", { className: "code-block", text: item.code }),
      planEl("label", { for: answerId, text: "Твой ответ (что выведет и почему, по-английски)" }),
      planDraftArea(answerId),
      planEl("details", { className: "translated-answer" }, [
        planEl("summary", { text: "Сверить" }),
        planEl("p", {}, [planEl("strong", { text: "Вывод: " }), planEl("code", { text: item.output })]),
        planEl("p", { lang: "en", text: item.why }),
        item.whyRU ? planEl("p", { lang: "ru", text: item.whyRU }) : null,
        item.version ? planEl("p", { className: "muted-text", text: `Версия: ${item.version}.` }) : null
      ])
    ]);
  });
  return planEl("section", { className: "plan-block", "aria-labelledby": "plan-predict-title" }, [
    planEl("h3", { id: "plan-predict-title", text: "«Что выведет код»: 10 задач" }),
    planEl("p", { className: "muted-text", text: "Фрагменты кода: для запуска добавь package main, import \"fmt\" и func main. Ответ не проверяется автоматически и не сохраняется после перезагрузки. Сначала напиши или скажи вслух, потом сверь вывод и объяснение." }),
    planEl("ol", { className: "plan-predict-list" }, items)
  ]);
}

function planSiteMaterials(week) {
  const ids = [];
  week.days.forEach(day => day.tasks.forEach(task => (task.links || []).forEach(id => {
    if (!ids.includes(id)) ids.push(id);
  })));
  if (!ids.length) return null;
  const groups = { "Карточка": [], "Quiz": [], "Диаграмма": [] };
  ids.map(planSiteItem).filter(Boolean).forEach(item => groups[item.kind].push(item));
  const lists = Object.entries(groups).filter(([, items]) => items.length).map(([kind, items]) =>
    planEl("div", { className: "plan-materials-group" }, [
      planEl("h4", { text: `${kind} (${items.length})` }),
      planEl("ul", {}, items.map(item => planEl("li", {}, [
        planEl("a", { href: item.href, text: item.label }),
        ...planItemBadges(item)
      ])))
    ]));
  return planEl("section", { className: "plan-block" }, [
    planEl("h3", { text: "Материал сайта на эту неделю" }),
    planEl("p", { className: "muted-text", text: "«На редакции» — материал ещё не прошёл полную проверку источников и двуязычную редакцию. Сверяй с документацией и не заучивай как эталон." }),
    ...lists
  ]);
}

function planListBlock(title, items, lang) {
  if (!items || !items.length) return null;
  return planEl("section", { className: "plan-block" }, [
    planEl("h3", { text: title }),
    planEl("ul", { className: "details-list", lang: lang || null }, items.map(text => planEl("li", { text })))
  ]);
}

function planTalkRules() {
  return planEl("details", { className: "practice-box plan-rules" }, [
    planEl("summary", { text: "Как проговаривать задачи по-английски: 4 шага" }),
    planEl("ol", { className: "details-list" }, PLAN.talkSteps.map(step =>
      planEl("li", {}, [planEl("strong", { text: `${step.en}` }), ` — ${step.ru}. `, planEl("em", { lang: "en", text: step.phrase })]))),
    planEl("p", { text: "Если завис:" }),
    planEl("ul", { className: "details-list", lang: "en" }, PLAN.stuckPhrases.map(text => planEl("li", { text }))),
    planEl("p", { className: "muted-text", text: "Одну задачу в день записывай на телефон и переслушивай: где запнулся, где перешёл на русский." })
  ]);
}

function planUpdateCounters(week) {
  const { done, total, optionalDone, optionalTotal } = planCounts(PLAN.weeks.flatMap(w => w.days.flatMap(d => d.tasks)));
  const overall = document.getElementById("plan-overall");
  if (overall) overall.textContent = `Обязательных выполнено ${done} из ${total} (${Math.round((done / total) * 100)}%) · по желанию ${optionalDone} из ${optionalTotal}`;
  const fill = document.getElementById("plan-overall-fill");
  if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;
  PLAN.weeks.forEach(w => {
    const counts = planWeekCounts(w);
    const chip = document.querySelector(`[data-plan-week="${w.id}"] .plan-chip-count`);
    if (chip) chip.textContent = `${counts.done}/${counts.total}`;
  });
  if (week) {
    const counts = planWeekCounts(week);
    const weekCount = document.getElementById("plan-week-count");
    if (weekCount) weekCount.textContent = `${counts.done} из ${counts.total} обязательных задач недели${counts.optionalTotal ? ` · по желанию ${counts.optionalDone} из ${counts.optionalTotal}` : ""}`;
  }
  const banner = document.getElementById("plan-today");
  if (banner) banner.replaceWith(planTodayBanner(planToday()));
  const notice = document.getElementById("plan-storage-notice");
  if (notice) {
    notice.textContent = planState.storageMessage;
    notice.classList.toggle("hidden", !planState.storageMessage);
  }
}

function planTodayBanner(today) {
  if (today.before) return planEl("p", { id: "plan-today", className: "plan-today", role: "status", text: `Программа начнётся через ${today.daysLeft} дн.` });
  if (today.after) return planEl("p", { id: "plan-today", className: "plan-today", role: "status", text: "13 недель позади. Дальше — журнал интервью и повторение слабых тем." });
  const week = PLAN.weeks[today.weekNumber - 1];
  const day = week.days.find(d => PLAN_DAY_KEYS[d.label] === today.dayKey);
  if (!day) {
    const counts = planWeekCounts(week);
    return planEl("p", { id: "plan-today", className: "plan-today", role: "status" }, [
      `Сегодня — неделя ${today.weekNumber}, резервный день. Невыполненных обязательных задач недели: ${counts.total - counts.done}. `,
      planEl("a", { href: `#/plan/${week.id}`, text: "Открыть неделю →" })
    ]);
  }
  const counts = planCounts(day.tasks);
  return planEl("p", { id: "plan-today", className: "plan-today", role: "status" }, [
    `Сегодня — неделя ${today.weekNumber}, ${day.label}: ${day.minutes} мин, осталось ${counts.total - counts.done} из ${counts.total} обязательных. `,
    planEl("a", { href: `#/plan/${week.id}/${today.dayKey}`, text: "К задачам дня →" })
  ]);
}

function planControls() {
  const startInput = planEl("input", { type: "date", id: "plan-start", value: planState.saved.start });
  startInput.addEventListener("change", () => {
    if (!planIsValidDate(startInput.value)) {
      planState.startNote = "Такой даты нет в календаре. Дата старта не изменена.";
      planRerender();
      return;
    }
    const monday = planMondayOf(startInput.value);
    planState.startNote = monday === startInput.value ? "" :
      `Неделя плана начинается в понедельник: старт перенесён на ${planFormatDate(planParseDate(monday))}.${monday.slice(0, 4)}.`;
    planState.saved.start = monday;
    planSave();
    planRerender();
  });

  const exportButton = planEl("button", { type: "button", className: "btn btn-sm", text: "Скачать отметки плана" });
  exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ key: PLAN_STORAGE_KEY, revision: PLAN.revision, ...planState.saved }, null, 2)], { type: "application/json" });
    const link = planEl("a", { href: URL.createObjectURL(blob), download: "go-prep-plan-progress.json" });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  const importInput = planEl("input", { type: "file", id: "plan-import", accept: "application/json,.json", className: "plan-file" });
  importInput.addEventListener("change", async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const isPlanExport = parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.key === PLAN_STORAGE_KEY
        && parsed.done && typeof parsed.done === "object" && !Array.isArray(parsed.done);
      if (!isPlanExport) {
        window.alert("Это не файл отметок плана. Нужен JSON, сохранённый кнопкой «Скачать отметки плана». Текущие отметки не изменены.");
        return;
      }
      if (parsed.schema !== 1) {
        window.alert("Файл сохранён в неподдерживаемом формате отметок плана. Текущие отметки не изменены.");
        return;
      }
      const known = planAllTaskIds();
      const done = {};
      Object.entries(parsed.done).forEach(([id, value]) => { if (known.has(id) && value === true) done[id] = true; });
      const skipped = Object.keys(parsed.done).length - Object.keys(done).length;
      const revisionNote = parsed.revision && parsed.revision !== PLAN.revision ? ` Файл от другой версии плана (${parsed.revision}).` : "";
      const message = `Заменить отметки плана? Сейчас отмечено задач: ${Object.keys(planState.saved.done).length}, после импорта: ${Object.keys(done).length}.`
        + (skipped ? ` Пропущено записей, которых нет в этой версии плана: ${skipped}.` : "") + revisionNote;
      if (!window.confirm(message)) return;
      planState.saved = { schema: 1, start: planIsValidDate(parsed.start) ? planMondayOf(parsed.start) : planState.saved.start, done };
      planSave();
      planRerender();
    } catch {
      window.alert("Не удалось прочитать файл: нужен JSON, сохранённый кнопкой «Скачать отметки».");
    } finally {
      importInput.value = "";
    }
  });

  const resetButton = planEl("button", { type: "button", className: "btn btn-sm", text: "Сбросить отметки плана" });
  resetButton.addEventListener("click", () => {
    if (!window.confirm("Удалить все отметки плана? Отметки карточек не затрагиваются.")) return;
    planState.saved.done = {};
    planSave();
    planRerender();
  });

  return planEl("details", { className: "study-settings plan-settings" }, [
    planEl("summary", { text: "Настройки плана" }),
    planEl("div", { className: "plan-settings-row" }, [
      planEl("label", { for: "plan-start", text: "Дата старта (понедельник недели 1)" }), startInput
    ]),
    planState.startNote ? planEl("p", { className: "plan-start-note", role: "status", text: planState.startNote }) : null,
    planEl("p", { className: "muted-text", text: "Файл содержит только отметки плана; отметки карточек в него не входят." }),
    planEl("div", { className: "plan-settings-row" }, [
      exportButton,
      importInput, planEl("label", { for: "plan-import", className: "btn btn-sm", text: "Загрузить отметки" }),
      resetButton
    ])
  ]);
}

function renderPlan(weekId, dayKey) {
  const root = document.getElementById("view-plan");
  if (!root || typeof PLAN === "undefined") return;
  if (!planState.saved) planState.saved = planLoad();

  const today = planToday();
  planState.renderedDay = `${planState.saved.start}|${today.weekNumber || ""}|${today.dayKey || ""}`;
  const currentId = today.weekNumber ? PLAN.weeks[today.weekNumber - 1].id : PLAN.weeks[0].id;
  const index = Math.max(0, PLAN.weeks.findIndex(w => w.id === (weekId || currentId)));
  const week = PLAN.weeks[index];
  const phase = PLAN.phases.find(p => p.weeks.includes(index + 1));
  const { from, to } = planWeekDates(index);

  const chips = planEl("nav", { className: "plan-weeks", "aria-label": "Недели программы" }, PLAN.weeks.map((w, i) => {
    const counts = planWeekCounts(w);
    const isCurrent = today.weekNumber === i + 1;
    return planEl("a", {
      href: `#/plan/${w.id}`,
      className: `chip plan-chip${w.id === week.id ? " active" : ""}${isCurrent ? " is-current" : ""}`,
      "data-plan-week": w.id,
      "aria-current": w.id === week.id ? "page" : null,
      title: w.title
    }, [`${i + 1}`, planEl("span", { className: "plan-chip-count", text: `${counts.done}/${counts.total}` })]);
  }));

  const days = week.days.map(day => {
    const key = PLAN_DAY_KEYS[day.label];
    const isToday = today.weekNumber === index + 1 && today.dayKey === key;
    return planEl("section", { className: `plan-day${isToday ? " is-today" : ""}`, id: `plan-${week.id}-${key}`, "aria-labelledby": `plan-${week.id}-${key}-title` }, [
      planEl("h3", { id: `plan-${week.id}-${key}-title`, text: `${day.label} · ${planFormatDate(planDayDate(index, key))} · ${day.minutes} мин${isToday ? " · сегодня" : ""}` }),
      planEl("ul", { className: "plan-tasks" }, day.tasks.map(task => planTaskItem(task, week)))
    ]);
  });

  const leetcodeList = week.leetcode && week.leetcode.length ? planEl("section", { className: "plan-block" }, [
    planEl("h3", { text: "LeetCode недели" }),
    planEl("ul", { className: "details-list" }, week.leetcode.map(n => planEl("li", {}, [
      planEl("a", { href: planLeetcodeUrl(n), target: "_blank", rel: "noopener noreferrer", text: `${n}. ${PLAN.leetcodeIndex[n].title} ↗` }),
      ` — ${PLAN.leetcodeIndex[n].pattern}`
    ])))
  ]) : null;

  root.replaceChildren(
    planEl("p", { id: "plan-storage-notice", className: "storage-notice hidden", role: "status" }),
    planEl("div", { className: "toolbar plan-toolbar" }, [
      planEl("div", { className: "progress-row" }, [
        planEl("div", {}, [planEl("strong", { text: "План: " }), planEl("span", { id: "plan-overall", className: "accent-text" })]),
        planEl("div", { className: "progress-bar-wrap" }, planEl("div", { id: "plan-overall-fill", className: "progress-bar-fill" }))
      ]),
      planTodayBanner(today),
      planEl("p", { className: "muted-text", text: "Галочка значит «сделано по плану», а не «вспомнил без подсказки». Проверка памяти — в карточках и quiz." }),
      chips,
      planControls()
    ]),
    planEl("article", { className: "sim-card plan-week" }, [
      planEl("p", { className: "muted-text", text: `${phase ? phase.title : ""} · ${planFormatDate(from)}–${planFormatDate(to)} · ~${PLAN.hoursPerWeek} ч` }),
      planEl("h2", { id: "plan-week-title", tabindex: "-1", text: `Неделя ${index + 1}. ${week.title}` }),
      planEl("p", {}, [planEl("strong", { text: "Цель: " }), week.goal]),
      planEl("p", {}, [planEl("strong", { text: "Готово, когда: " }), week.done]),
      planEl("p", { id: "plan-week-count", className: "accent-text" }),
      planEl("p", { className: "muted-text", text: `Бюджет ~${PLAN.hoursPerWeek} ч — ориентир, а не обещание. Не укладываешься — переноси в резерв (Пт/Вс); сначала обязательные задачи, «по желанию» — если осталось время.` }),
      planTalkRules(),
      ...days,
      week.id === "w2" ? planPredictBlock() : null,
      leetcodeList,
      planListBlock("Проговорить по-английски", week.english, "en"),
      planListBlock("Самопроверка недели", week.selfCheck),
      planSiteMaterials(week),
      planListBlock("Чего для этой недели пока нет на сайте", week.gaps),
      planEl("nav", { className: "btn-group plan-pager", "aria-label": "Соседние недели" }, [
        index > 0 ? planEl("a", { href: `#/plan/${PLAN.weeks[index - 1].id}`, className: "btn", text: "← Предыдущая неделя" }) : null,
        index < PLAN.weeks.length - 1 ? planEl("a", { href: `#/plan/${PLAN.weeks[index + 1].id}`, className: "btn", text: "Следующая неделя →" }) : null
      ])
    ])
  );
  planUpdateCounters(week);

  if (dayKey) {
    const target = document.getElementById(`plan-${week.id}-${dayKey}`);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "auto", block: "start" }), 60);
  }
}

// Неделя и день из адреса (#/plan/w3/mon); null — показать текущую неделю.
function planRouteFromHash() {
  const parts = (window.location.hash || "").replace(/^#\//, "").split("/");
  if (parts[0] !== "plan") return null;
  return {
    weekId: PLAN.weeks.some(w => w.id === parts[1]) ? parts[1] : null,
    dayKey: Object.prototype.hasOwnProperty.call(PLAN_DAY_OFFSETS, parts[2]) ? parts[2] : null
  };
}

// Перерисовка после изменения настроек: показанная неделя остаётся той, что в адресе.
function planRerender() {
  const route = planRouteFromHash() || { weekId: null, dayKey: null };
  renderPlan(route.weekId, null);
}

function handlePlanRoute() {
  const route = planRouteFromHash();
  if (!route) return;
  const { weekId, dayKey } = route;
  const previousWeek = document.getElementById("plan-week-title");
  const switchingWeek = previousWeek && weekId && !previousWeek.textContent.startsWith(`Неделя ${PLAN.weeks.findIndex(w => w.id === weekId) + 1}.`);
  renderPlan(weekId, dayKey);
  document.title = "План 13 недель — Go Runtime Interview Wiki";
  if (switchingWeek && !dayKey) {
    const heading = document.getElementById("plan-week-title");
    if (heading) heading.focus({ preventScroll: false });
  }
}

// Если вкладка была открыта через полночь, при возврате пересчитать «Сегодня» и подсветку дня.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !planState.saved || !planRouteFromHash()) return;
  const today = planToday();
  const dayStamp = `${planState.saved.start}|${today.weekNumber || ""}|${today.dayKey || ""}`;
  if (dayStamp !== planState.renderedDay) planRerender();
});

window.addEventListener("hashchange", handlePlanRoute);
document.addEventListener("DOMContentLoaded", handlePlanRoute);
