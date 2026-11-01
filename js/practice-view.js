// Раздел #/practice: задачи практикума с заготовкой, тестами, подсказками и эталоном.
// Данные — data/practice.js (PRACTICE). Отметки выполнения ставятся в плане (#/plan), здесь ничего не хранится.

function practiceEl(tag, attrs, children) {
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

function practiceRouteFromHash() {
  const parts = (window.location.hash || "").replace(/^#\//, "").split("/");
  if (parts[0] !== "practice") return null;
  return { taskId: parts[1] || null };
}

// Ссылка на материал сайта: карточка, задача quiz или диаграмма.
function practiceSiteLink(id) {
  if (id.startsWith("sim") && typeof SIMULATORS !== "undefined") {
    const sim = SIMULATORS.find(s => s.id === id);
    return sim ? { href: `#/simulators/${id}`, label: `${id.toUpperCase()} · ${sim.title}` } : null;
  }
  if (id.startsWith("c") && typeof CARDS !== "undefined") {
    const card = CARDS.find(c => c.id === id);
    return card ? { href: `#/cards/${id}`, label: `${id.toUpperCase()} · ${card.qEN}` } : null;
  }
  if (id.startsWith("q") && typeof QUIZ_QUESTIONS !== "undefined") {
    const quiz = QUIZ_QUESTIONS.find(q => q.id === id);
    return quiz ? { href: `#/quiz/${id}`, label: `${id.toUpperCase()} · ${quiz.title.replace(/^Задача \d+:\s*/, "")}` } : null;
  }
  return null;
}

// Задача плана → ссылка на её день: #/plan/w3/tue.
function practicePlanLink(taskId) {
  if (typeof PLAN === "undefined") return null;
  for (const week of PLAN.weeks) {
    for (const day of week.days) {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        const dayKey = taskId.split("-")[1];
        return { href: `#/plan/${week.id}/${dayKey}`, label: `${week.id.toUpperCase()} · ${day.label} · ${taskId}`, text: task.text };
      }
    }
  }
  return null;
}

function practiceDownload(file) {
  const url = URL.createObjectURL(new Blob([file.code + "\n"], { type: "text/plain" }));
  const link = practiceEl("a", { href: url, download: file.name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function practiceCopy(file, status) {
  try {
    await navigator.clipboard.writeText(file.code + "\n");
    status.textContent = `${file.name}: скопировано`;
  } catch {
    status.textContent = "Не удалось скопировать: выделите код и скопируйте вручную или скачайте файл";
  }
}

function practiceFileActions(file, label) {
  const status = practiceEl("span", { className: "practice-copy-status", role: "status" });
  const copy = practiceEl("button", { type: "button", className: "btn btn-sm", text: `Скопировать ${label}` });
  copy.addEventListener("click", () => practiceCopy(file, status));
  const save = practiceEl("button", { type: "button", className: "btn btn-sm", text: `Скачать ${file.name}` });
  save.addEventListener("click", () => practiceDownload(file));
  return practiceEl("div", { className: "practice-file-actions" }, [copy, save, status]);
}

function practiceCode(code, label) {
  return practiceEl("pre", { className: "code-block practice-code", tabindex: "0", "aria-label": label }, [
    practiceEl("code", { text: code })
  ]);
}

function practiceList(items, attrs) {
  return practiceEl("ul", attrs, items.map(item => practiceEl("li", { text: item })));
}

// Текст с `кодом` в обратных кавычках: нечётные куски — элементы <code>, всё через textContent.
function practiceInlineCode(text) {
  return text.split("`").map((part, i) => (i % 2 ? practiceEl("code", { text: part }) : part)).filter(part => part !== "");
}

// Решённые на сервере задачи: { "p-money": { passedAt } } в localStorage (уходит в синхронизацию).
const PRACTICE_SOLVED_KEY = "go_prep_practice_v1";
const PRACTICE_DRAFT_PREFIX = "go_prep_practice_draft_"; // sessionStorage: переживает переход на вход

function practiceSolved() {
  try {
    const v = JSON.parse(localStorage.getItem(PRACTICE_SOLVED_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function practiceMarkSolved(taskId) {
  try {
    const all = practiceSolved();
    all[taskId] = { passedAt: new Date().toISOString() };
    localStorage.setItem(PRACTICE_SOLVED_KEY, JSON.stringify(all));
  } catch {
    // Без хранилища отметка не сохранится; результат проверки всё равно показан.
  }
}

function practiceDraft(taskId, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(PRACTICE_DRAFT_PREFIX + taskId) || "";
    sessionStorage.setItem(PRACTICE_DRAFT_PREFIX + taskId, value);
  } catch {
    return "";
  }
  return "";
}

// Результат POST /runs: сводка, ошибки сборки, гонка, упавшие тесты с выводом.
function practiceRenderResult(box, res) {
  const tests = res.tests || [];
  const failed = tests.filter(t => !t.passed);
  const summary = res.passed
    ? `✅ Все тесты прошли (${tests.length}) за ${res.millis} мс.`
    : res.timedOut
      ? "⏱ Не уложилось в лимит времени: проверь, нет ли бесконечного цикла или горутины, которую никто не останавливает."
      : res.build
        ? "❌ Не собралось — ошибки компилятора ниже."
        : `❌ Не прошли ${failed.length} из ${tests.length}.`;
  const children = [practiceEl("p", { className: res.passed ? "practice-check-ok" : "practice-check-fail", text: summary })];
  if (res.race) children.push(practiceEl("p", { className: "practice-check-fail", text: "⚠️ Race detector нашёл гонку данных (WARNING: DATA RACE в выводе)." }));
  if (res.build) children.push(practiceCode(res.build, "Ошибки сборки"));
  if (tests.length) {
    children.push(practiceEl("ul", { className: "practice-check-tests" }, tests.map(t => practiceEl("li", {}, [
      `${t.passed ? "✅" : "❌"} ${t.name}`,
      !t.passed && t.output ? practiceEl("details", {}, [practiceEl("summary", { text: "вывод" }), practiceCode(t.output, `Вывод ${t.name}`)]) : null
    ]))));
  }
  if (!res.passed && !tests.length && !res.build && res.output) children.push(practiceCode(res.output.slice(-4000), "Вывод go test"));
  box.replaceChildren(...children);
}

// Обновляет подпись кнопки проверки на открытой странице задачи после входа или выхода.
let practiceCheckRefresh = null;
document.addEventListener("auth-changed", () => practiceCheckRefresh && practiceCheckRefresh());

// «Проверить на сервере»: код уходит в раннер (go test -race в AWS), ответ — по тестам.
function practiceServerCheck(task) {
  const id = `practice-solution-${task.id}`;
  const area = practiceEl("textarea", { id, className: "practice-solution-input", rows: "12", spellcheck: "false" });
  area.value = practiceDraft(task.id);
  area.addEventListener("input", () => practiceDraft(task.id, area.value));
  const status = practiceEl("p", { className: "practice-copy-status", role: "status" });
  const result = practiceEl("div", { className: "practice-check-result", "aria-live": "polite" });
  const button = practiceEl("button", { type: "button", className: "btn" });
  const label = () => (typeof authIsSignedIn === "function" && authIsSignedIn() ? "Проверить на сервере" : "Войти и проверить");
  button.textContent = label();
  practiceCheckRefresh = () => (button.textContent = label());
  button.addEventListener("click", async () => {
    if (typeof apiFetch !== "function") return;
    practiceDraft(task.id, area.value);
    if (!authIsSignedIn()) {
      authSignIn(`#/practice/${task.id}`);
      return;
    }
    if (!area.value.trim()) {
      status.textContent = `Вставь сюда весь файл ${task.files.solution.name}.`;
      area.focus();
      return;
    }
    button.disabled = true;
    status.textContent = "Проверяю: go test -race на сервере, обычно 3–10 секунд…";
    try {
      const resp = await apiFetch("/runs", { method: "POST", body: JSON.stringify({ taskId: task.id, code: area.value }) });
      if (resp.status === 429) throw new Error("слишком часто, подожди несколько секунд");
      if (resp.status >= 500) throw new Error(`сервер ответил ${resp.status}; если это первая проверка за долгое время, повтори — раннер просыпается`);
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.error || `ошибка ${resp.status}`);
      practiceRenderResult(result, body);
      status.textContent = "";
      if (body.passed) {
        practiceMarkSolved(task.id);
        status.textContent = "Задача отмечена как решённая.";
      }
    } catch (e) {
      status.textContent = e instanceof AuthRequiredError ? "Сессия истекла — нажми «Войти и проверить»." : `Не получилось проверить: ${e.message}.`;
      button.textContent = label();
    } finally {
      button.disabled = false;
    }
  });
  return practiceSection("Проверить на сервере", [
    practiceEl("label", { for: id, text: `Твоё решение — весь файл ${task.files.solution.name}` }),
    area,
    practiceEl("p", { className: "practice-file-actions" }, [button]),
    status,
    result,
    practiceEl("p", { className: "muted-text", text: "Код проверяют те же тесты, что выше, с -race, на Go 1.27.3, без доступа в сеть. Нужен вход через Google: проверка привязана к твоему аккаунту." })
  ]);
}

function practiceSection(title, children) {
  return practiceEl("section", { className: "practice-section" }, [practiceEl("h3", { text: title }), ...children]);
}

function renderPracticeIndex(view) {
  const solved = practiceSolved();
  const byWeek = {};
  PRACTICE.forEach(task => (byWeek[task.week] = byWeek[task.week] || []).push(task));
  view.replaceChildren(
    practiceEl("div", { className: "section-top" }, [
      practiceEl("h2", { id: "practice-title", tabindex: "-1", text: "Практикум: пишешь код — тесты проверяют" }),
      practiceEl("p", { className: "muted-text", text: "Код пишется у себя в редакторе. Скачай заготовку и тесты, запусти go test -race — или вставь решение на странице задачи и проверь на сервере. Порядок: своя попытка → подсказки → эталон и ответ на английском. ✅ — задача прошла проверку на сервере; отметка «сделано» — в плане, у задачи дня." })
    ]),
    ...Object.entries(byWeek).map(([week, tasks]) => practiceEl("section", { className: "practice-week" }, [
      practiceEl("h3", { text: `Неделя ${week}` }),
      practiceEl("ul", { className: "practice-index" }, tasks.map(task => practiceEl("li", { className: "practice-index-item" }, [
        practiceEl("a", { href: `#/practice/${task.id}`, className: "practice-index-link" }, [
          practiceEl("strong", { text: `${solved[task.id] ? "✅ " : ""}${task.code}. ${task.title}` }),
          practiceEl("span", { lang: "en", className: "muted-text", text: task.titleEN })
        ]),
        practiceEl("p", { text: task.goalRU })
      ])))
    ]))
  );
}

function renderPracticeTask(view, task) {
  const index = PRACTICE.indexOf(task);
  const accept = typeof PLAN !== "undefined" && PLAN.acceptance ? task.planTasks.map(id => PLAN.acceptance[id] && PLAN.acceptance[id].accept).filter(Boolean) : [];
  const planLinks = task.planTasks.map(practicePlanLink).filter(Boolean);
  const siteLinks = (task.links || []).map(practiceSiteLink).filter(Boolean);
  const pkg = task.files.solution.name.replace(/\.go$/, "");
  // setup — команды до тестов (go get зависимостей), extraRun — после (профили, -gcflags=-m).
  const run = [
    `mkdir ${pkg} && cd ${pkg}`,
    `go mod init example.com/${pkg}`,
    ...(task.setup || []),
    `# положи сюда ${task.files.starter.name} (заготовка) и ${task.files.tests.name} (тесты)`,
    "go test -race -count=1 ./...",
    ...(task.extraRun || [])
  ].join("\n");
  const prev = PRACTICE[index - 1];
  const next = PRACTICE[index + 1];

  view.replaceChildren(practiceEl("article", { className: "practice-task" }, [
    practiceEl("p", { className: "practice-meta" }, [
      practiceEl("a", { href: "#/practice", text: "← Все задачи практикума" }),
      ` · Неделя ${task.week} · ${task.code}`,
      practiceSolved()[task.id] ? " · ✅ решено на сервере" : ""
    ]),
    practiceEl("h2", { id: "practice-title", tabindex: "-1", text: `${task.code}. ${task.title}` }),
    practiceEl("p", { lang: "en", className: "practice-title-en", text: task.titleEN }),
    practiceEl("p", { className: "practice-goal", text: task.goalRU }),
    practiceSection("Контракт", [
      practiceList(task.contractRU, { className: "practice-contract" }),
      practiceEl("details", { className: "translated-answer" }, [
        practiceEl("summary", { text: "Contract in English" }),
        practiceList(task.contractEN, { lang: "en", className: "practice-contract" })
      ])
    ]),
    accept.length ? practiceSection("Готово, когда", accept.map(text => practiceEl("p", { text }))) : null,
    practiceSection("Как запустить", [
      practiceCode(run, "Команды для запуска"),
      practiceEl("p", { className: "muted-text", text: "Нужен Go 1.22 или новее; -race работает там, где включён cgo (обычно так и есть). Код и тесты проверены с -race на Go 1.24.7 и 1.27.3." })
    ]),
    practiceSection(`Заготовка: ${task.files.starter.name}`, [
      practiceFileActions(task.files.starter, "заготовку"),
      practiceCode(task.files.starter.code, `Заготовка ${task.files.starter.name}`)
    ]),
    practiceSection(`Тесты: ${task.files.tests.name}`, [
      practiceFileActions(task.files.tests, "тесты"),
      practiceEl("details", { className: "practice-tests" }, [
        practiceEl("summary", { text: "Показать тесты (лучше сначала прочитать контракт)" }),
        practiceCode(task.files.tests.code, `Тесты ${task.files.tests.name}`)
      ])
    ]),
    Array.isArray(task.invariantsRU) && task.invariantsRU.length ? practiceEl("details", { className: "practice-invariants" }, [
      practiceEl("summary", { text: "3 проверки перед отправкой — открыть, когда решение готово" }),
      practiceEl("ul", { className: "practice-invariants-list" }, task.invariantsRU.map(line => practiceEl("li", {}, practiceInlineCode(line))))
    ]) : null,
    practiceServerCheck(task),
    practiceSection("Подсказки — по одной", task.hints.map((hint, i) => practiceEl("details", { className: "practice-hint" }, [
      practiceEl("summary", { text: `Подсказка ${i + 1}` }),
      practiceEl("p", { text: hint })
    ]))),
    practiceSection("После своей попытки", [
      practiceEl("details", { className: "practice-talk" }, [
        practiceEl("summary", { text: "Объяснение на английском за минуту" }),
        practiceEl("p", { lang: "en", text: task.talkEN }),
        typeof ttsControlsNode === "function" ? ttsControlsNode(`practice:${task.id}:talk`, task.talkEN) : null
      ]),
      practiceEl("details", { className: "practice-reference" }, [
        practiceEl("summary", { text: "Эталонное решение" }),
        practiceFileActions(task.files.solution, "эталон"),
        practiceCode(task.files.solution.code, `Эталон ${task.files.solution.name}`)
      ]),
      practiceEl("h4", { text: "Частые ошибки" }),
      practiceList(task.pitfalls),
      practiceEl("h4", { text: "Измени условие и реши снова" }),
      practiceList(task.followUps),
      task.note ? practiceEl("p", { className: "muted-text", text: task.note }) : null
    ]),
    planLinks.length ? practiceSection("В плане", [practiceEl("ul", {}, planLinks.map(link => practiceEl("li", {}, [
      practiceEl("a", { href: link.href, text: link.label }), ` — ${link.text}`
    ])))]) : null,
    siteLinks.length || (task.refs || []).length ? practiceEl("nav", { className: "related-links", "aria-label": "Материалы к задаче" }, [
      ...siteLinks.map(link => practiceEl("a", { href: link.href, text: link.label })),
      ...(task.refs || []).map(ref => practiceEl("a", { href: ref.u, target: "_blank", rel: "noopener", text: `${ref.t} ↗` }))
    ]) : null,
    practiceEl("nav", { className: "practice-pager", "aria-label": "Соседние задачи" }, [
      prev ? practiceEl("a", { className: "btn", href: `#/practice/${prev.id}`, text: `← ${prev.code}. ${prev.title}` }) : practiceEl("span"),
      next ? practiceEl("a", { className: "btn", href: `#/practice/${next.id}`, text: `${next.code}. ${next.title} →` }) : practiceEl("span")
    ])
  ]));
}

function handlePracticeRoute() {
  const route = practiceRouteFromHash();
  const view = document.getElementById("view-practice");
  if (!route || !view || typeof PRACTICE === "undefined") return;
  const task = route.taskId ? PRACTICE.find(t => t.id === route.taskId) : null;
  if (task) {
    renderPracticeTask(view, task);
    document.title = `${task.code}. ${task.title} — Практикум`;
  } else {
    renderPracticeIndex(view);
    document.title = "Практикум — Go Interview Prep";
  }
  // Новый экран: фокус на заголовок, чтобы читалка и клавиатура начинали с него.
  const heading = document.getElementById("practice-title");
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
}

window.addEventListener("hashchange", handlePracticeRoute);
document.addEventListener("DOMContentLoaded", handlePracticeRoute);
