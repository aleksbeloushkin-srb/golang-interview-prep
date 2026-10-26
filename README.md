# ⚡ Go Runtime & Concurrency — Interactive Interview Wiki & Code Review Quiz

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/)
[![Flashcards](https://img.shields.io/badge/Flashcards-38_Q%26A-38bdf8?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards)
[![Simulators](https://img.shields.io/badge/Simulators-7_Interactive-a855f7?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators)
[![Code Review Quiz](https://img.shields.io/badge/Code_Review_Quiz-22_Cases-f59e0b?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-22c55e?style=flat-square)](#)

Интерактивная база знаний, визуальный симулятор рантайма и тренажёр по **Production Code Review** для подготовки к **Middle / Senior / Staff Go Backend** интервью.

Охватывает внутреннее устройство рантайма Go (`src/runtime/`, `asm_amd64.s`) от базовых концепций до уровня архитектора компилятора: планировщик GMP, управление стеками и переключение регистров CPU, каналы (`hchan`/`sudog`), `selectgo`, атомики `CAS` (`MESI`), трёхцветный сборщик мусора, аллокатор памяти, новые мапы на **SwissTables** и новинки **Go 1.24–1.25+**.

---

## 🔗 Быстрые ссылки (Live Demo)

* 🗂 **[1. Тренажёр карточек (38 Q&A Flashcards)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards)** — с фильтрацией по 5 модулям и 3 уровням сложности (`🟢 Base`, `🟡 Senior`, `🔴 Deep Dive`).
* 🔬 **[2. Интерактивные диаграммы рантайма (7 пошаговых симуляторов)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators)** — визуализация регистров CPU, очередей GMP, каналов, `select`, `CAS` и `SwissTables`.
* 📖 **[3. Полная база знаний (Wiki — все 38 тем на одной странице)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/wiki)** — с разбором продакшен-инцидентов (`pprof`, `trace`, `GODEBUG`).
* 📊 **[4. Сводная таблица-шпаргалка (Cheat Sheet)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cheatsheet)** — быстрый повтор ключевых цифр и функций перед собеседованием.
* 🧠 **[5. Code Traps & Production Code Review Quiz (22 задачи)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz)** — поиск скрытых багов, утечек и гонок в боевом коде с ответами на русском и английском.

---

## ✨ Ключевые особенности

* **3-уровневая глубина каждой карточки:**
  1. `Base Interview Answer (EN)` — ёмкий 20-секундный ответ на английском.
  2. `Under the Hood Details (EN)` — низкоуровневая механика рантайма и вырезки из исходников Go (`proc.go`, `chan.go`, `select.go`, `asm_amd64.s`).
  3. `🛠️ Production Debugging (RU)` — как знание этого механизма помогает расследовать реальные проблемы в продакшене (CPU throttling в K8s, утечки горутин, `False Sharing` кэш-линий, `noscan mspan`, `GOMEMLIMIT`).
* **7 интерактивных пошаговых симуляторов (`#/simulators`):**
  * **Sim 1:** Создание, запуск и завершение горутины; роли `R14`, `RSP` и `RIP` на amd64 простыми словами, сохранённое состояние и переход через `gogo`/`mcall`.
  * **Sim 2:** Планировщик GMP, правило 61-го тика, асинхронное вытеснение (`sysmon` + `SIGURG` каждые 10 мс), `Work Stealing` (50% очереди) и `Syscall Handoff` против `netpoller`.
  * **Sim 3:** Пять шагов передачи значения: регистрация ожидания, парковка, копирование, готовность и продолжение. Постоянные обозначения отправителя/канала/получателя и вопросы для самопроверки.
  * **Sim 4:** Восемь шагов `select`: шесть форм компиляции, флаги selected/ok, общий `selectgo`, ожидание и CAS, обратное сопоставление веток, nil/closed и порядок вычисления выражений.
  * **Sim 5:** CAS от смысла «замени, если совпало» до успеха/неуспеха и ролей регистров в конкретном листинге amd64. Различия архитектур и ограничения атомарности.
  * **Sim 6:** Аллокатор памяти (`mcache` / `mcentral` / `mheap`, спаны `scan` vs `noscan`) и учебный граф GC: достижимость, перенос ссылки с защитой `Hybrid Write Barrier`, очистка и мягкий лимит. Все четыре шага содержат EN-пояснение и самопроверку.
  * **Sim 7:** Эволюция `map` в Go: классическая `hmap`/`bmap` против новой **SwissTable (Go 1.24+)** (`ctrl` мета-слово, `H1`/`H2` хеш, `SIMD/SWAR` побитовый поиск за 1 такт и `Extendible Hashing`).
* **22 задачи на Code Review (`#/quiz`):**
  * Каждая задача содержит реальный сниппет кода, **6 сложных вариантов ответа** (с разбором популярных полу-мифов), объяснение корневой причины в рантайме на русском и готовую речь для интервью на английском (`Ready-to-Speak English Answer`).

---

## 📚 Содержание модулей (38 карточек + 22 задачи)

### Модуль 1: Горутины, Стек и Регистры CPU (`Q1 – Q6`)
* Горутина против потока ОС (стек 2 КБ vs 2 МБ, переключение ~15 нс vs ~1–2 мкс).
* `Data Race` против `Race Condition` и устройство детектора гонок (`-race` / ThreadSanitizer).
* Создание горутины (`runtime.newproc`, пул `P.gFree`), отсутствие `Thread ID` и трюк с `runtime.goexit`.
* Физическое размещение стека в куче (`mheap`) и работа регистра `RSP`.
* Динамическое расширение и сжатие стека (`stackguard0`, `morestack`, `copystack`, сдвиг указателей `adjustpointers`).
* Низкоуровневое переключение контекста на системном стеке `g0` (`gobuf`, `runtime.gogo`, `runtime.mcall`).

### Модуль 2: Планировщик GMP, Вытеснение и Work Stealing (`Q7 – Q12`)
* Модель `G-M-P`, роль `GOMAXPROCS` и проблема CFS CPU Throttling в Kubernetes.
* Кооперативное (`stackPreempt`) и асинхронное вытеснение (`sysmon` + сигнал `SIGURG` после 10 мс).
* Поиск работы в `runtime.findrunnable`, правило честности каждого 61-го тика и алгоритм `Work Stealing` (`runqsteal`).
* Сетевой мультиплексор `netpoller` (`epoll`/`kqueue`) против блокирующих системных вызовов и `Cgo` (Handoff `_Psyscall` и лимит 10 000 потоков).
* Зачем процессору `P` нужен одноэлементный приоритетный LIFO-стек `runnext` (горячий L1/L2 кэш ядра).
* Диагностика и предотвращение утечек горутин (`Goroutine Leaks`) через `pprof`.

### Модуль 3: Каналы (`hchan`), `select`, `CAS` и Примитивы синхронизации (`Q13 – Q22`)
* Буферизованные и небуферизованные каналы в памяти, матрица поведения `nil` / `closed` / `open` каналов.
* Архитектурный выбор: Каналы против Мьютексов (`sync.Mutex` / `sync.RWMutex`).
* Внутреннее устройство `runtime.hchan` и роль связующей структуры `runtime.sudog` ($M:N$ ожидание).
* Механика `chansend` / `chanrecv`: `sendDirect` (`memmove` + `typeBitsBulkBarrier` из стека в стек) и защита от гонки в `gopark(chanparkcommit)`.
* Выбор готовых веток и ограничения приоритета отмены в `select` и внутренний цикл `runtime.selectgo` (`pollorder`, `lockorder`, `g.selectDone`).
* Ассемблер `LOCK CMPXCHGL`, протокол `MESI` и проблема `False Sharing` 64-байтных кэш-линий.
* Внутреннее устройство `sync.Mutex` (`Normal` vs `Starvation Mode` 1 мс), `sync.WaitGroup`, `sync.Once` и `context.Context` (`WithoutCancel`).

### Модуль 4: Память, Аллокатор и Сборщик мусора (`Q23 – Q28`)
* Стек против Кучи и статический анализ побега (`Escape Analysis`, `-gcflags="-m"`, *Sharing Down vs. Sharing Up*).
* Иерархия аллокатора памяти Go (`mspan`, `P.mcache`, `mcentral`, `mheap`) и оптимизация кэшей через `noscan` спаны.
* Трёхцветный алгоритм Дейкстры (White / Grey / Black), 4 фазы цикла GC и механизм `Mark Assist`.
* Устройство `Hybrid Write Barrier` (Юаса + Дейкстра) и управление памятью через `GOGC` и `GOMEMLIMIT`.

### Модуль 5: Мапы (`SwissTables`), Слайсы, Интерфейсы, `defer` и Go 1.24–1.25+ (`Q29 – Q38`)
* Устройство срезов и строк, формула плавного роста в `runtime.growslice` (от `2x` к `1.25x` после 256) и округление по классам размеров `mspan`.
* Классическая мапа (`hmap`/`bmap`, `tophash[8]`, инкрементальная эвакуация) против новой **SwissTable в Go 1.24+** (`ctrl` 64-битное слово, `H1`/`H2` хеш, `SIMD/SWAR` параллельный поиск и `Extendible Hashing`).
* Проблема невозврата памяти мапой после `delete`/`clear` и рандомизация итерации.
* Внутреннее устройство интерфейсов (`eface` vs `iface`, таблица `itab`) и правила наборов методов (*Value vs. Pointer Receiver*).
* Эволюция `defer` (`Open-Coded Defers` через битовую маску на стеке), раскрутка стека в `gopanic` и `gorecover`.
* Новинки **Go 1.24–1.25+**: `weak.Pointer`, интернирование через `unique.Make`, `runtime.AddCleanup` (взамен `SetFinalizer`), внутренние корутины итераторов (`runtime.newcoro` / `coroswitch`), нативный cgroup-aware `GOMAXPROCS`, `testing/synctest` и `trace.FlightRecorder`.

---

## 🗂 Структура проекта

Проект построен по модульной схеме без внешних зависимостей и сборщиков (Zero-Build SPA с Hash-роутером):

```text
golang-runtime-prep/
├── index.html          # Каркас приложения и навигация по вкладкам
├── README.md           # Документация репозитория
├── css/
│   └── style.css       # Стили, адаптивная сетка и тёмная тема
├── data/
│   ├── cards.js        # База из 38 карточек Q&A (Base / Senior / Deep Dive + Prod Cases)
│   ├── simulators.js   # Пошаговые состояния для 7 диаграмм и сводной таблицы
│   └── quiz.js         # 22 задачи на Production Code Review (по 6 вариантов ответа)
└── js/
    └── app.js          # Hash-роутер (#/cards, #/simulators, #/wiki, #/quiz), фильтры и localStorage

```

## ⌨️ Горячие клавиши и локальный запуск


В режиме карточек (#/cards) работает быстрое управление с клавиатуры:

* Space (Пробел) — показать / скрыть ответ
* ← / → — предыдущая / следующая карточка
* 1 — отметить «Знаю отлично ✓»
* 2 — отметить «Повторить ещё»

Локальный запуск на macOS / Linux:

```bash
git clone [https://github.com/aleksbeloushkin-srb/golang-runtime-prep.git](https://github.com/aleksbeloushkin-srb/golang-runtime-prep.git)
cd golang-runtime-prep
open index.html
```



## Текущий этап улучшений

**Актуальный остаток и точные списки ID: [CURRENT_STATUS_RU.md](CURRENT_STATUS_RU.md).** После локальной порции 9 остаются 22 карточки и 12 исходных quiz; общий объём сайта — 38 карточек и 22 задачи. Это разные показатели.

Полный аудит исходного состояния и план: [AUDIT_AND_PLAN_RU.md](AUDIT_AND_PLAN_RU.md), реестр Go-материала: [GO_CONTENT_AUDIT_RU.md](GO_CONTENT_AUDIT_RU.md). Выполненные изменения и проверки: [CHANGE_LOG_RU.md](CHANGE_LOG_RU.md). Материал проходит поэтапную редакцию; наличие темы в каталоге выше не означает, что все замечания аудита уже исправлены.

Полные согласованные EN/RU объяснения подготовлены для шестнадцати тем: c2 (гонки), c6 (регистры), c12 (утечки), c13/c14/c16/c17 (каналы), c18/c19 (select), c20 (CAS), c23/c24/c25 (размещение, escape analysis и аллокатор), c26/c28 (достижимость и гибридный барьер), c27 (GC, GOGC и мягкий лимит). В подборке «С практикой» после основного ответа можно раскрыть упражнение: сначала объясни решение своими словами, затем открой «Сверить рассуждение». Русские переводы раскрываются отдельно; ответить для понимания можно по-русски, затем повторить объяснение по-английски. Сайт пока не записывает устные ответы и не оценивает их автоматически. У связанных карточек есть переходы к q1/q11/q14/q15/q17/q18/q21/q22 и обратно. В диаграммах доступны предыдущий/следующий шаг; в обновлённых схемах — EN-пояснения и скрытые ответы для самопроверки.

Основания учебных приёмов и дальнейший план: [LEARNING_DESIGN_RU.md](LEARNING_DESIGN_RU.md). Отчёты браузерных проверок: [опубликованная версия](docs/verification/2026-10-26-live.json) и [локальная порция с упражнениями](docs/verification/2026-10-26-learning.json).

На телефоне фильтры находятся в «Настроить подборку». Сначала ответь самостоятельно, открой объяснение, затем выбери «Нужно повторить» или «Вспомнил». Кнопка «Повторить отмеченные» открывает ручную подборку. Это пока не интервальное расписание: даты следующего повторения появятся отдельным этапом.

Старые отметки `go_prep_progress_v2` сохраняют совместимость. Если браузер запрещает хранение, сайт продолжает работать и сообщает, что новые отметки остаются только на открытой странице. Сброс требует подтверждения. Горячие клавиши не перехватываются при работе с полями, ссылками и кнопками; оценки 1/2 доступны после раскрытия ответа.

Для локальной проверки:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Открыть `http://127.0.0.1:8000`; остановить сервер Ctrl+C после проверки.

Подробный разбор компиляции select, версий и ловушек: [SELECT_COMPILATION_RU.md](SELECT_COMPILATION_RU.md).
Запрос для независимого поиска следующих задач: [TASK_RESEARCH_BRIEF_RU.md](TASK_RESEARCH_BRIEF_RU.md).
