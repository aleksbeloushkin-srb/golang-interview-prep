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

function practiceSection(title, children) {
  return practiceEl("section", { className: "practice-section" }, [practiceEl("h3", { text: title }), ...children]);
}

function renderPracticeIndex(view) {
  const byWeek = {};
  PRACTICE.forEach(task => (byWeek[task.week] = byWeek[task.week] || []).push(task));
  view.replaceChildren(
    practiceEl("div", { className: "section-top" }, [
      practiceEl("h2", { id: "practice-title", tabindex: "-1", text: "Практикум: пишешь код — тесты проверяют" }),
      practiceEl("p", { className: "muted-text", text: "Код пишется у себя в редакторе. Скачай заготовку и тесты, запусти go test -race. Порядок: своя попытка → подсказки → эталон и ответ на английском. Отметка «сделано» — в плане, у задачи дня." })
    ]),
    ...Object.entries(byWeek).map(([week, tasks]) => practiceEl("section", { className: "practice-week" }, [
      practiceEl("h3", { text: `Неделя ${week}` }),
      practiceEl("ul", { className: "practice-index" }, tasks.map(task => practiceEl("li", { className: "practice-index-item" }, [
        practiceEl("a", { href: `#/practice/${task.id}`, className: "practice-index-link" }, [
          practiceEl("strong", { text: `${task.code}. ${task.title}` }),
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
      ` · Неделя ${task.week} · ${task.code}`
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
      practiceEl("p", { className: "muted-text", text: "Нужен Go 1.22 или новее; -race работает там, где включён cgo (обычно так и есть). Код и тесты проверены Go 1.24.7 с -race." })
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
    practiceSection("Подсказки — по одной", task.hints.map((hint, i) => practiceEl("details", { className: "practice-hint" }, [
      practiceEl("summary", { text: `Подсказка ${i + 1}` }),
      practiceEl("p", { text: hint })
    ]))),
    practiceSection("После своей попытки", [
      practiceEl("details", { className: "practice-talk" }, [
        practiceEl("summary", { text: "Объяснение на английском за минуту" }),
        practiceEl("p", { lang: "en", text: task.talkEN })
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
    document.title = "Практикум — Go Runtime Interview Wiki";
  }
  // Новый экран: фокус на заголовок, чтобы читалка и клавиатура начинали с него.
  const heading = document.getElementById("practice-title");
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
}

window.addEventListener("hashchange", handlePracticeRoute);
document.addEventListener("DOMContentLoaded", handlePracticeRoute);
