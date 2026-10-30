// Программа подготовки к офферу Senior Go в EU-компании: 13 недель, ~10 ч в неделю.
// Источник данных для раздела #/plan. ID недель и задач стабильны: от них зависит
// сохранённый прогресс (ключ go_prep_plan_v1). Новые задачи добавлять с новыми ID,
// не переиспользовать старые.
// Ссылки на материалы сайта: "c12" — карточка, "q9" — задача quiz, "sim3" — диаграмма.
// Пометка optional: true — глубокий runtime, полезен, но не нужен для прохождения EU-интервью.

const PLAN = {
  revision: "2026-10-29e",
  defaultStart: "2026-10-12",
  hoursPerWeek: 10,
  target: "Senior Backend Engineer (Go) · EU-компании с офисом в Сербии или remote CET",

  phases: [
    { id: "go", title: "Go: язык и конкурентность", weeks: [1, 2, 3, 4] },
    { id: "project", title: "Проект-портфолио: ledger-сервис", weeks: [5, 6, 7, 8] },
    { id: "interview", title: "Собеседования и рынок", weeks: [9, 10, 11, 12, 13] }
  ],

  talkSteps: [
    { id: "clarify", en: "Clarify", ru: "Уточнить условие и входные данные", phrase: "Before I start, let me clarify a few things." },
    { id: "approach", en: "Approach", ru: "Идея решения до кода: brute force, затем лучше", phrase: "The brute-force approach would be… We can do better with…" },
    { id: "complexity", en: "Complexity", ru: "Время и память", phrase: "This runs in O(n) time and O(n) extra space." },
    { id: "edge", en: "Edge cases & tests", ru: "Что проверить, как тест", phrase: "Edge cases: an empty input, a single element… I'd turn these into a table-driven test." }
  ],

  stuckPhrases: [
    "Let me think out loud for a second.",
    "I'm not sure yet, but my first idea is…",
    "Let me step back and reconsider.",
    "Can I assume…? If not, I'd handle it by…"
  ],

  weeks: [
    // ───────────────────────────── НЕДЕЛЯ 1 ─────────────────────────────
    {
      id: "w1",
      title: "Идиомы Go I: типы, интерфейсы, ошибки",
      goal: "Писать простой Go без подглядывания и объяснять по-английски, чем Go отличается от Kotlin в типах, ошибках и интерфейсах.",
      done: "Решены LC 49, 347, 238 и задачи W1-1…W1-6; самопроверка недели проговорена вслух по-английски без подсказок.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w1-mon-1", text: "Tour of Go: Basics — packages, variables, functions, flow control, defer", refs: [{ t: "Tour of Go", u: "https://go.dev/tour/" }] },
            { id: "w1-mon-2", text: "Завести репозиторий go-prep, go mod init, папка week1" },
            { id: "w1-mon-3", text: "LeetCode 49. Group Anagrams + проговор", lc: 49, talk: "lc49" }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w1-tue-1", text: "Tour: pointers, structs, arrays, slices, maps, function values, closures" },
            { id: "w1-tue-2", text: "Go by Example от Values до Closures — набрать руками, не копировать", refs: [{ t: "Go by Example", u: "https://gobyexample.com/" }] },
            { id: "w1-tue-3", text: "W1-1 Money: тип в минорных единицах (int64) + валюта, метод String() → «12.50 EUR». Проговор", links: ["p-money"], talk: "w1-1" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w1-wed-1", text: "Tour: methods, interfaces, type assertions, type switches, Stringer, errors", links: ["c39"] },
            { id: "w1-wed-2", text: "Сайт: интерфейсы и receivers — только короткий ответ и «как работает»", links: ["c34", "c33", "q2", "q28"] },
            { id: "w1-wed-3", text: "W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is) и W1-3 ValidationError (errors.As)", links: ["p-account", "p-validation", "c39", "q29"], talk: "w1-2" },
            { id: "w1-wed-4", text: "LeetCode 347. Top K Frequent Elements + проговор (записать на телефон)", lc: 347, talk: "lc347" }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w1-thu-1", text: "Ошибки глубже: errors.New, fmt.Errorf(\"…: %w\"), errors.Is/As, sentinel vs typed", links: ["c39", "q29", "q30", "q20"], refs: [{ t: "Go blog: Working with Errors in Go 1.13", u: "https://go.dev/blog/go1.13-errors" }, { t: "package errors", u: "https://pkg.go.dev/errors" }] },
            { id: "w1-thu-2", text: "defer / panic / recover: карточка, ловушки q3 и q5 из quiz и их варианты q31 и q32 — сначала ответить без вариантов", links: ["c35", "q3", "q5", "q31", "q32"] },
            { id: "w1-thu-3", text: "Дополнительно: 100 Go Mistakes — разделы Functions and Methods, Error Management", optional: true, refs: [{ t: "100go.co", u: "https://100go.co/" }] },
            { id: "w1-thu-4", text: "W1-4 порядок defer и W1-5 SafeDiv (recover → error). Проговор W1-3, W1-5", links: ["p-deferpanic"], talk: "w1-5" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w1-sat-1", text: "W1-6 Method sets: почему значение T не реализует интерфейс с pointer-методом", links: ["c34", "q28"], talk: "w1-6" },
            { id: "w1-sat-2", text: "Шпаргалка Go vs Kotlin своими словами: nil/zero values, ошибки, struct vs data class, embedding, interfaces, видимость", links: ["c40", "q33", "q34"] },
            { id: "w1-sat-3", text: "LeetCode 238. Product of Array Except Self + проговор (записать)", lc: 238, talk: "lc238" },
            { id: "w1-sat-4", text: "Прочитать по ролям диалог Two Sum, затем решить LC 1 и повторить диалог своими словами", lc: 1, talk: "lc1" },
            { id: "w1-sat-5", text: "Повторный проговор LC 49 и LC 347 без подсказок" },
            { id: "w1-sat-6", text: "Самопроверка недели вслух по-английски (ниже)" }
          ]
        }
      ],
      leetcode: [1, 49, 347, 238, 20],
      english: [
        "How does error handling in Go differ from exceptions in Kotlin or Java?",
        "What is a zero value and why does it matter?",
        "When do you use a pointer receiver?",
        "Why can a nil pointer returned as an error be non-nil?",
        "Tell me about yourself — version 0, 60–90 seconds."
      ],
      selfCheck: [
        "Zero values у int, string, *T, []T, map[K]V, chan T, error?",
        "Чем errors.Is отличается от errors.As?",
        "Когда метод объявлять на pointer receiver?",
        "Почему nil-указатель, возвращённый как error, даёт err != nil?",
        "Порядок отложенных вызовов и когда вычисляются их аргументы?"
      ],
      gaps: [
        "Нет карточки «embedding против наследования» для JVM-разработчика (ошибки, %w/Is/As и пакеты уже есть в карточках).",
        "Нет режима проговора задач (Clarify → Approach → Complexity → Edge) с таймером и самооценкой."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 2 ─────────────────────────────
    {
      id: "w2",
      title: "Идиомы Go II: slice, map, строки, generics, тесты",
      goal: "Уверенно отвечать на «что выведет код» про slice и map, писать table-driven тесты и простой generic-код, объясняя всё вслух.",
      done: "10 задач «что выведет код» из плана и q1 решены с объяснением; CLI txsum покрыт тестами; LC 3, 15, 739 проговорены.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w2-mon-1", text: "Slice изнутри: header (ptr, len, cap), рост при append, общий backing array, copy, s[a:b:c]", links: ["c29"], refs: [{ t: "Go Slices: usage and internals", u: "https://go.dev/blog/slices-intro" }, { t: "The mechanics of append", u: "https://go.dev/blog/slices" }] },
            { id: "w2-mon-2", text: "Ловушки aliasing и удержания памяти — сначала ответ без вариантов", links: ["q6", "q4"] },
            { id: "w2-mon-3", text: "LeetCode 3. Longest Substring Without Repeating Characters + проговор", lc: 3, talk: "lc3" }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w2-tue-1", text: "Map по спецификации: порядок обхода не задан, запись в nil map — panic, адрес элемента взять нельзя, ключ должен быть сравнимым; map не потокобезопасна. Отдельно: после delete map не уменьшает свою таблицу, но удалённые значения сама больше не удерживает", links: ["c32", "c40", "q33"], refs: [{ t: "Spec: Map types", u: "https://go.dev/ref/spec#Map_types" }, { t: "Go maps in action", u: "https://go.dev/blog/maps" }] },
            { id: "w2-tue-2", text: "По желанию: SwissTable в Go 1.24+ — достаточно уметь сказать одну фразу, что изменилось", links: ["c30", "c31", "sim7"], optional: true },
            { id: "w2-tue-3", text: "Строки: string vs []byte vs []rune, UTF-8, strings.Builder. Дополнительно: 100 Go Mistakes — Data Types, Strings, Control Structures", links: ["c41"], refs: [{ t: "Strings, bytes, runes and characters in Go", u: "https://go.dev/blog/strings" }, { t: "100go.co", u: "https://100go.co/" }] },
            { id: "w2-tue-4", text: "W2-1 Remove(s, i) в двух версиях + тест, показывающий порчу исходного slice. Проговор (записать)", links: ["p-removeslice"], talk: "w2-1" },
            { id: "w2-tue-5", text: "Битовые операции (≈30 мин): диаграмма 9 — &, |, ^, &^, сдвиги, маски степени двойки, приоритет & и ==; ответы вслух до раскрытия", links: ["sim9"], optional: true }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w2-wed-1", text: "Generics: type parameters, any, comparable, constraints с ~, cmp.Ordered; в Go 1.27 — generic-методы (у метода свои параметры типа; у методов интерфейса — нет, и generic-метод не может реализовать метод интерфейса)", links: ["c42", "p-generics"], refs: [{ t: "Tutorial: Getting started with generics", u: "https://go.dev/doc/tutorial/generics" }] },
            { id: "w2-wed-2", text: "W2-2 Map/Filter/Reduce и Set[T comparable]; W2-3 та же функция через интерфейс — сравнить", links: ["p-generics", "c42"], talk: "w2-3" },
            { id: "w2-wed-3", text: "LeetCode 15. 3Sum + проговор", lc: 15, talk: "lc15" }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w2-thu-1", text: "Модули, пакеты, internal/, раскладка cmd/ + internal/", links: ["c43"] },
            { id: "w2-thu-2", text: "Тесты: table-driven, t.Run, t.Helper, t.Parallel, go test -cover, golangci-lint. Learn Go with Tests: 2–3 главы", links: ["c44", "q35"], refs: [{ t: "package testing", u: "https://pkg.go.dev/testing" }, { t: "Learn Go with Tests", u: "https://quii.gitbook.io/learn-go-with-tests" }] },
            { id: "w2-thu-3", text: "Покрыть тестами W1-2 и W2-2", links: ["p-account", "p-generics"] },
            { id: "w2-thu-4", text: "Проговор «что выведет код» P1–P5: по одной английской фразе-объяснению", talk: "p1-p10" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w2-sat-1", text: "«Что выведет код»: P1–P10 из плана и замыкание в цикле — сначала ответ, потом сверка", links: ["q1"] },
            { id: "w2-sat-7", text: "Дополнительно: задачи из банков вопросов собеседований (вторичный материал, ответы сверять с документацией)", optional: true, refs: [{ t: "39 вопросов (Нияз)", u: "https://t.me/niyaz_golang/758" }, { t: "ТОП-12 Ozon", u: "https://t.me/niyaz_golang/672" }] },
            { id: "w2-sat-2", text: "W2-4 CLI txsum: CSV account,amount,currency → балансы; ошибки строк собирать; table-driven тесты парсера", links: ["p-txsum"], talk: "w2-4" },
            { id: "w2-sat-3", text: "LeetCode 739. Daily Temperatures + проговор (записать)", lc: 739, talk: "lc739" },
            { id: "w2-sat-4", text: "Дополнительно: LC 56 Merge Intervals и LC 146 LRU Cache", lc: 146, talk: "lc146", optional: true },
            { id: "w2-sat-5", text: "Дополнительно: вопросы интервьюера Senior Go с Хабра про slice, map, каналы, ошибки — ответить, потом сверить с документацией", optional: true, refs: [{ t: "Habr: «Коллеги, вы меня огорчаете»", u: "https://habr.com/ru/articles/521582" }] },
            { id: "w2-sat-6", text: "Контрольная точка: квиз по идиомам — q1–q6 в режиме «сначала ответ без вариантов». q1, q2, q3, q6 — те же ловушки, что P9, P6, P5 и P1–P2 из первой задачи дня, но в виде рабочего кода: проверка, что понял, а не запомнил ответ; q4 и q5 — новые", links: ["q1", "q2", "q3", "q4", "q5", "q6"] }
          ]
        }
      ],
      leetcode: [3, 15, 739, 56, 146],
      english: [
        "How does append work and when does it reallocate?",
        "Are Go maps safe for concurrent use?",
        "When would you use generics, and when would you avoid them?",
        "How do you structure tests in Go?",
        "Tell me about yourself — version 1, with one concrete story and a number."
      ],
      selfCheck: [
        "Что происходит при append, когда len == cap? И когда len < cap?",
        "Почему нельзя написать &m[\"k\"]?",
        "Три способа безопасно использовать map из нескольких горутин?",
        "Чем []byte(s) отличается от []rune(s), что возвращает len(s)?",
        "Как выглядит table-driven тест и зачем t.Helper()?"
      ],
      gaps: [
        "В quiz «Сначала свой ответ» вывод проговаривается, но не вводится и не сверяется автоматически.",
        "Нет материала про -race в CI (generics и тесты уже есть в карточках и практикуме)."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 3 ─────────────────────────────
    {
      id: "w3",
      title: "Конкурентность I: горутины, каналы, select, sync",
      goal: "Писать worker pool, pipeline и fan-in без гонок и утечек и объяснять по-английски, кто владеет горутиной и кто закрывает канал.",
      done: "W3-1…W3-5 работают под go test -race; на каждый ответ «кто закрывает канал и как горутина завершится» есть одно предложение.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w3-mon-1", text: "Горутины, WaitGroup; горутина vs поток ОС; data race vs race condition", links: ["c1", "c2"], refs: [{ t: "The Go Memory Model", u: "https://go.dev/ref/mem" }, { t: "Data Race Detector", u: "https://go.dev/doc/articles/race_detector" }] },
            { id: "w3-mon-2", text: "Go blog: Pipelines and cancellation", refs: [{ t: "go.dev/blog/pipelines", u: "https://go.dev/blog/pipelines" }] },
            { id: "w3-mon-3", text: "LeetCode 155. Min Stack + проговор", lc: 155 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w3-tue-1", text: "Каналы: буфер что меняет и чего не меняет; nil/open/closed; диаграмма передачи значения", links: ["c13", "c14", "sim3"] },
            { id: "w3-tue-2", text: "W3-1 Worker pool: N воркеров, канал задач, канал результатов, отправитель закрывает канал после всех отправок. Проговор", talk: "w3-1", links: ["p-workerpool", "c12", "q15"] },
            { id: "w3-tue-3", text: "W3-2 Pipeline generator → square → sink с остановкой через context", links: ["p-pipeline"] }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w3-wed-1", text: "select: выбор ветки, default, отмена — только Base-уровень; задача с запасной веткой — сначала ответ без вариантов", links: ["c18", "q22"] },
            { id: "w3-wed-2", text: "W3-3 Fan-in merge нескольких каналов с WaitGroup и закрытием выхода", links: ["p-fanin"] },
            { id: "w3-wed-3", text: "Code review без вариантов: на вкладке quiz включить «Сначала свой ответ», записать баг и исправление, потом открыть варианты и разбор", links: ["q12", "q15", "q21"] },
            { id: "w3-wed-4", text: "LeetCode 567. Permutation in String + проговор (записать)", lc: 567 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w3-thu-1", text: "sync: Mutex, RWMutex, Once, WaitGroup, atomic; channel vs mutex; CAS — диаграммы 5 (CAS) и 8 (Mutex) с ответами вслух", links: ["c15", "c20", "c21", "c22", "sim5", "sim8"] },
            { id: "w3-thu-2", text: "W3-4 Счётчик тремя способами (Mutex, atomic, канал) + бенчмарк. W3-5 SafeCache на map + RWMutex", talk: "w3-4", links: ["p-counter", "p-safecache"] },
            { id: "w3-thu-3", text: "Ловушки sync: копия WaitGroup, повторный Lock, double-checked locking, указатель из защищённой map", links: ["q7", "q8", "q13", "q14"] }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w3-sat-1", text: "Прогнать W3-1…W3-5 под go test -race; для каждой горутины записать владельца и путь завершения", links: ["p-workerpool", "p-pipeline", "p-fanin", "p-counter", "p-safecache"] },
            { id: "w3-sat-2", text: "Дополнительно: 100 Go Mistakes — Concurrency Foundations", optional: true, refs: [{ t: "100go.co", u: "https://100go.co/" }] },
            { id: "w3-sat-3", text: "LeetCode 150. Evaluate Reverse Polish Notation + проговор", lc: 150 },
            { id: "w3-sat-4", text: "Проговор worker pool и «channel vs mutex» по-английски, записать", talk: "w3-1" },
            { id: "w3-sat-5", text: "Самопроверка недели вслух" }
          ]
        }
      ],
      leetcode: [155, 567, 150],
      english: [
        "How does a goroutine differ from an OS thread?",
        "Can a program have a race condition without a data race?",
        "What does a channel buffer change, and what does it not change?",
        "Who should close a channel, and why?",
        "When would you choose a mutex over a channel?"
      ],
      selfCheck: [
        "Что произойдёт при чтении/записи/закрытии nil, открытого и закрытого канала?",
        "Почему закрывает канал отправитель, а не получатель?",
        "Как ограничить число одновременно работающих горутин?",
        "Чем atomic не заменяет mutex для составного инварианта?",
        "Как бы ты проверил отсутствие гонок в CI?"
      ],
      gaps: []
    },

    // ───────────────────────────── НЕДЕЛЯ 4 ─────────────────────────────
    {
      id: "w4",
      title: "Конкурентность II и минимум рантайма",
      goal: "Писать за 20–30 минут отменяемые конкурентные решения (errgroup, rate limit, graceful shutdown) и на базовом уровне объяснять GMP, GC и escape analysis.",
      done: "6 эталонных решений пишутся за 20–30 мин; найдена утечка горутины через pprof; пройдены контрольный квиз и виртуальный live coding.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w4-mon-1", text: "context: отмена, таймауты, WithoutCancel; передача ctx в I/O", links: ["c22", "q9", "q10"], refs: [{ t: "package context", u: "https://pkg.go.dev/context" }] },
            { id: "w4-mon-2", text: "W4-1 ParallelFetch: errgroup.WithContext + SetLimit, первая ошибка отменяет остальных", talk: "w4-1", links: ["p-parallelfetch", "q16"], refs: [{ t: "errgroup", u: "https://pkg.go.dev/golang.org/x/sync/errgroup" }] },
            { id: "w4-mon-3", text: "LeetCode 200. Number of Islands + проговор", lc: 200 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w4-tue-1", text: "select-паттерны и ловушки: errgroup после Wait, eager evaluation, time.After в цикле", links: ["q16", "q17", "q11"] },
            { id: "w4-tue-2", text: "W4-2 Rate limiter token bucket; сравнить с golang.org/x/time/rate. Проговор", links: ["p-ratelimit"], talk: "w4-2", refs: [{ t: "x/time/rate", u: "https://pkg.go.dev/golang.org/x/time/rate" }] }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w4-wed-1", text: "Утечки горутин: как найти и предотвратить", links: ["p-leak", "c12"] },
            { id: "w4-wed-2", text: "W4-3 Graceful shutdown HTTP-сервера: signal.NotifyContext, Shutdown с таймаутом, дренаж фоновых воркеров", talk: "w4-3", links: ["p-shutdown", "c22"], refs: [{ t: "http.Server.Shutdown", u: "https://pkg.go.dev/net/http#Server.Shutdown" }, { t: "signal.NotifyContext", u: "https://pkg.go.dev/os/signal#NotifyContext" }] },
            { id: "w4-wed-3", text: "W4-4 Написать утечку намеренно и найти её goroutine-профилем pprof", links: ["p-leak"] },
            { id: "w4-wed-4", text: "LeetCode 102. Binary Tree Level Order Traversal + проговор", lc: 102 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w4-thu-1", text: "Минимум рантайма для интервью: GMP и GOMAXPROCS, вытеснение, netpoller — короткие ответы; диаграмма 2 до шага 10 «ответ за минуту»", links: ["c7", "sim2", "c8", "c10"] },
            { id: "w4-thu-2", text: "Память: стек vs куча, escape analysis, GC на высоком уровне, GOGC/GOMEMLIMIT", links: ["p-escape", "c23", "c24", "c26", "c27", "sim6"], refs: [{ t: "A Guide to the Go Garbage Collector", u: "https://go.dev/doc/gc-guide" }] },
            { id: "w4-thu-3", text: "W4-5 Escape analysis: go build -gcflags=-m для трёх функций, объяснить каждую строку вывода", links: ["p-escape"] },
            { id: "w4-thu-4", text: "По желанию, Deep Dive: стек и регистры, work stealing, runnext, устройство каналов и selectgo, аллокатор, write barrier, weak/unique, итераторы", links: ["c3", "c4", "c5", "c6", "c9", "c11", "c16", "c17", "c19", "c25", "c28", "c36", "c37", "sim1", "sim4"], optional: true }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w4-sat-1", text: "W4-6 Бенчмарк + CPU-профиль на txsum: go test -bench, pprof top/list", links: ["p-profile"], refs: [{ t: "Go Diagnostics", u: "https://go.dev/doc/diagnostics" }] },
            { id: "w4-sat-2", text: "Новое в 1.25+: container-aware GOMAXPROCS, testing/synctest — одна фраза на каждое", links: ["c38"] },
            { id: "w4-sat-3", text: "LeetCode 98. Validate Binary Search Tree + проговор", lc: 98 },
            { id: "w4-sat-4", text: "Контрольная точка: квиз по конкурентности в режиме «сначала ответ без вариантов»", links: ["q5", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q21", "q22"] },
            { id: "w4-sat-5", text: "Виртуальный live coding (Claude как интервьюер): одна задача на конкурентность, проговор по-английски, разбор" }
          ]
        }
      ],
      leetcode: [200, 102, 98],
      english: [
        "How do you cancel a group of goroutines when one of them fails?",
        "How would you implement a rate limiter in a single instance, and across many instances?",
        "How would you find and prevent a goroutine leak?",
        "Explain the GMP model in 30 seconds.",
        "Why might a variable escape to the heap, and how do you check it?"
      ],
      selfCheck: [
        "Что гарантирует и чего не гарантирует отмена context для уже запущенной работы?",
        "Чем errgroup.WithContext отличается от WaitGroup?",
        "Порядок действий при graceful shutdown сервиса с фоновыми воркерами?",
        "Что ограничивает GOMAXPROCS и почему потоков ОС может быть больше?",
        "Что задаёт GOGC и чего не гарантирует GOMEMLIMIT?"
      ],
      gaps: [
        "Deep Dive-карточки не помечены как «не обязательно для EU-интервью» — легко потратить на них время недель 3–4.",
        "Нет задачи на чтение trace-вывода (go tool trace); профиль pprof разбирается в «Бенчмарк и профиль» и «Утечка горутин»."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 5 ─────────────────────────────
    {
      id: "w5",
      title: "Проект I: каркас ledger-сервиса",
      goal: "Сервис счетов и переводов работает end-to-end: REST, PostgreSQL через pgx, миграции, структурные логи, Docker Compose.",
      done: "Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w5-mon-1", text: "ADR-001 (EN): scope — счета, переводы, балансы, double-entry; что вне scope" },
            { id: "w5-mon-2", text: "Раскладка: cmd/ledger, internal/http, internal/ledger, internal/store; Money в int64 минорных единицах" },
            { id: "w5-mon-3", text: "LeetCode 230. Kth Smallest Element in a BST + проговор", lc: 230 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w5-tue-1", text: "HTTP на net/http с шаблонами маршрутов Go 1.22+: POST /accounts, POST /transfers, GET /accounts/{id}; JSON — в Go 1.27 encoding/json работает поверх json/v2 (строже к невалидному UTF-8 и повторяющимся именам в v2)", links: ["p-accountsapi", "c45", "sim10", "q36", "q37"], refs: [{ t: "Routing enhancements (Go 1.22)", u: "https://go.dev/blog/routing-enhancements" }] },
            { id: "w5-tue-2", text: "Валидация входа и ошибки → HTTP-коды через errors.As (из W1-3)", links: ["p-httperr", "c46", "q39"] }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w5-wed-1", text: "PostgreSQL через pgx/v5 и pgxpool; миграции (goose или golang-migrate)", refs: [{ t: "pgx", u: "https://pkg.go.dev/github.com/jackc/pgx/v5" }] },
            { id: "w5-wed-2", text: "Управление ресурсами SQL: defer Rollback, rows.Close, rows.Err, пул соединений", links: ["c47", "q18", "q19"] },
            { id: "w5-wed-3", text: "LeetCode 236. Lowest Common Ancestor of a Binary Tree + проговор", lc: 236 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w5-thu-1", text: "log/slog в JSON, request id в контексте; конфиг из переменных окружения", links: ["c48", "q38"], refs: [{ t: "log/slog", u: "https://pkg.go.dev/log/slog" }] },
            { id: "w5-thu-2", text: "Docker Compose: postgres + сервис; healthcheck" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w5-sat-1", text: "Перевод end-to-end: создание счетов, перевод, проверка балансов через curl" },
            { id: "w5-sat-2", text: "Проговор по-английски: «Walk me through your project structure and why»", talk: "proj-structure" },
            { id: "w5-sat-3", text: "LeetCode 215. Kth Largest Element in an Array (heap) + проговор", lc: 215 }
          ]
        }
      ],
      leetcode: [230, 236, 215],
      english: [
        "Walk me through the structure of your service.",
        "Why int64 minor units instead of float64 for money?",
        "How do you map domain errors to HTTP status codes?"
      ],
      selfCheck: [
        "Где в коде граница транзакции и кто её открывает?",
        "Что будет с соединением, если забыть rows.Close?",
        "Почему бизнес-логика не зависит от net/http?"
      ],
      gaps: [
        "Нет материалов по pgx и конфигурации сервиса (net/http, database/sql и slog уже есть в карточках).",
        "Нет шаблона ADR и примеров «как рассказать про проект» по-английски."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 6 ─────────────────────────────
    {
      id: "w6",
      title: "Проект II: транзакции, идемпотентность, outbox → Kafka",
      goal: "Повтор перевода безопасен, события доходят до Kafka через outbox, инвариант суммы балансов держится под конкурентной нагрузкой.",
      done: "Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w6-mon-1", text: "Уровни изоляции PostgreSQL; перевод в одной транзакции: SELECT … FOR UPDATE в стабильном порядке ID против дедлока", links: ["c49", "c50", "p-transfers"], refs: [{ t: "PostgreSQL: Transaction Isolation", u: "https://www.postgresql.org/docs/current/transaction-iso.html" }] },
            { id: "w6-mon-2", text: "LeetCode 973. K Closest Points to Origin + проговор", lc: 973 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w6-tue-1", text: "Идемпотентность: таблица ключей с UNIQUE и сохранённым ответом; другой payload с тем же ключом → ошибка", links: ["c51", "p-idempotency"], talk: "idem" },
            { id: "w6-tue-2", text: "Гонка двух одинаковых запросов: атомарная вставка ключа, а не «проверить, потом вставить»", links: ["q40", "p-idempotency", "c2"] }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w6-wed-1", text: "Transactional outbox: запись события в той же транзакции, что и перевод", links: ["c52", "q42", "p-outbox"], talk: "outbox" },
            { id: "w6-wed-2", text: "Relay-воркер публикует в Kafka (at-least-once): владелец горутины, остановка, ретраи", links: ["p-outbox", "c52", "c12", "c22"] },
            { id: "w6-wed-3", text: "LeetCode 621. Task Scheduler + проговор", lc: 621 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w6-thu-1", text: "Consumer с идемпотентной обработкой; consumer groups, партиции, порядок по ключу", links: ["c53", "q43", "p-outbox"], refs: [{ t: "Apache Kafka documentation", u: "https://kafka.apache.org/documentation/" }] },
            { id: "w6-thu-2", text: "Docker Compose: добавить Kafka" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w6-sat-1", text: "Конкурентный тест: 100 параллельных переводов, инвариант суммы, go test -race", links: ["p-transfers", "q41", "c50"] },
            { id: "w6-sat-2", text: "Проговор: «How do you avoid double spending?» и «Why outbox instead of publishing after commit?»", links: ["c51", "c52"], talk: "outbox" },
            { id: "w6-sat-3", text: "LeetCode 435. Non-overlapping Intervals + проговор", lc: 435 },
            { id: "w6-sat-4", text: "Индексы PostgreSQL (≈45 мин): B-tree и составной индекс, EXPLAIN ANALYZE на запросе истории переводов счёта; найти и убрать N+1", links: ["c54"], refs: [{ t: "PostgreSQL: Indexes", u: "https://www.postgresql.org/docs/current/indexes.html" }, { t: "PostgreSQL: Using EXPLAIN", u: "https://www.postgresql.org/docs/current/using-explain.html" }] }
          ]
        }
      ],
      leetcode: [973, 621, 435],
      english: [
        "How do you make a payment API idempotent?",
        "Why use a transactional outbox?",
        "What delivery guarantee does your consumer have, and how do you handle duplicates?",
        "How do you prevent deadlocks when two transfers lock the same accounts?"
      ],
      selfCheck: [
        "Что произойдёт, если процесс упадёт между commit и публикацией в Kafka без outbox?",
        "Почему exactly-once на уровне бизнес-эффекта достигается идемпотентностью потребителя?",
        "Какой уровень изоляции выбран для перевода и почему?"
      ],
      gaps: [
        "Нет диаграммы «перевод → outbox → Kafka → потребитель»: путь события пока только в карточках c52, c53 и задаче W6-3.",
        "Практикум недели работает в памяти; PostgreSQL и Kafka в Docker Compose проверяются только в своём проекте."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 7 ─────────────────────────────
    {
      id: "w7",
      title: "Проект III: gRPC, тесты, бенчмарки",
      goal: "У сервиса есть gRPC API, интеграционные тесты на настоящих PostgreSQL и Kafka, бенчмарк горячего пути.",
      done: "Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w7-mon-1", text: "proto + генерация (buf или protoc); gRPC Transfer и GetBalance", refs: [{ t: "gRPC Go quick start", u: "https://grpc.io/docs/languages/go/quickstart/" }] },
            { id: "w7-mon-2", text: "LeetCode 133. Clone Graph + проговор", lc: 133 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w7-tue-1", text: "Interceptors: логирование, дедлайн, перевод ошибок в gRPC-статусы" },
            { id: "w7-tue-2", text: "Проговор: «REST vs gRPC — when would you choose which?»", talk: "grpc-rest" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w7-wed-1", text: "Unit-тесты: table-driven, фейки на границах, без sleep для синхронизации" },
            { id: "w7-wed-2", text: "testing/synctest для кода со временем (Go 1.25)", links: ["c38"], refs: [{ t: "testing/synctest", u: "https://pkg.go.dev/testing/synctest" }] },
            { id: "w7-wed-3", text: "LeetCode 207. Course Schedule + проговор", lc: 207 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w7-thu-1", text: "Интеграционные тесты: testcontainers-go для PostgreSQL и Kafka", refs: [{ t: "testcontainers-go", u: "https://golang.testcontainers.org/" }] },
            { id: "w7-thu-2", text: "golangci-lint и go test -race в CI" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w7-sat-1", text: "Бенчмарк горячего пути + allocs/op; если есть аллокации — escape analysis", links: ["c24"] },
            { id: "w7-sat-2", text: "Покрытие: где тестов нет намеренно и почему (записать в README)" },
            { id: "w7-sat-3", text: "LeetCode 994. Rotting Oranges + проговор", lc: 994 }
          ]
        }
      ],
      leetcode: [133, 207, 994],
      english: [
        "REST vs gRPC — when would you choose which?",
        "How do you test code that talks to a database?",
        "How do you test time-dependent concurrent code without sleeps?"
      ],
      selfCheck: [
        "Что тестируется unit-тестом, а что только интеграционным?",
        "Как дедлайн клиента gRPC доходит до запроса в PostgreSQL?",
        "Что показал бенчмарк и какой вывод ты из него сделал?"
      ],
      gaps: [
        "Нет материалов по тестированию на Go и testcontainers.",
        "Карточка c38 про synctest — единственная точка про тестирование конкурентного кода."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 8 ─────────────────────────────
    {
      id: "w8",
      title: "Проект IV: production-readiness, CV",
      goal: "Репозиторий можно показать работодателю: наблюдаемость, CI, README с решениями; есть черновик CV на английском.",
      done: "Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w8-mon-1", text: "OpenTelemetry: трассы и метрики для HTTP/gRPC; /healthz и /readyz", refs: [{ t: "OpenTelemetry Go", u: "https://opentelemetry.io/docs/languages/go/" }] },
            { id: "w8-mon-2", text: "LeetCode 210. Course Schedule II + проговор", lc: 210 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w8-tue-1", text: "Graceful shutdown всего сервиса: HTTP, gRPC, relay-воркер, consumer (из W4-3)" },
            { id: "w8-tue-2", text: "GitHub Actions: lint, test -race, build Docker-образа" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w8-wed-1", text: "README: схема архитектуры, как запустить, 3–5 ADR, компромиссы и что бы сделал дальше" },
            { id: "w8-wed-2", text: "LeetCode 684. Redundant Connection (union-find) + проговор", lc: 684 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w8-thu-1", text: "Черновик CV на английском: «Senior backend engineer, Go + Kotlin, fintech»; проект — отдельной строкой со стеком" },
            { id: "w8-thu-2", text: "Проверить карьерные страницы целевых компаний: открытые вакансии, требования к локации" },
            { id: "w8-thu-3", text: "Ключевые слова из 5 целевых вакансий в CV (≈20 мин): стек, домен, уровень — только то, что реально делал; так CV проходит автоматический отбор (ATS)" },
            { id: "w8-thu-4", text: "«Tell me about yourself» v1 (≈15 мин): 60–90 секунд по-английски — кто ты, чем силён, почему Go и эта компания; записать", optional: true }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w8-sat-1", text: "Виртуальный Craft Deep-Dive (Claude как интервьюер): 30 минут вопросов по проекту на английском", talk: "deep-dive" },
            { id: "w8-sat-2", text: "LeetCode 743. Network Delay Time (Dijkstra) + проговор", lc: 743 },
            { id: "w8-sat-3", text: "Записать 3 вопроса, на которых запнулся, и дописать ответы в README/заметки" },
            { id: "w8-sat-4", text: "Kubernetes-минимум для Go-сервиса (≈60 мин): Deployment и Service; liveness/readiness на /healthz и /readyz; requests/limits и как лимит CPU задаёт GOMAXPROCS (Go 1.25+); SIGTERM → graceful shutdown в terminationGracePeriodSeconds", links: ["c7", "sim2"], refs: [{ t: "Kubernetes: Pod lifecycle и завершение", u: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" }, { t: "Kubernetes: liveness/readiness/startup probes", u: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/" }, { t: "Kubernetes: requests и limits", u: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" }] }
          ]
        }
      ],
      leetcode: [210, 684, 743],
      english: [
        "What was the hardest design decision in this project, and what would you change?",
        "How would you observe this service in production?",
        "What are the failure modes of your service?"
      ],
      selfCheck: [
        "Какие сигналы скажут, что сервис деградирует?",
        "Что произойдёт при SIGTERM во время перевода?",
        "Какие 3 компромисса ты сознательно принял?"
      ],
      gaps: [
        "Нет тренажёра Craft Deep-Dive: вопросы интервьюера по собственному проекту с follow-up."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 9 ─────────────────────────────
    {
      id: "w9",
      title: "Take-home, code review, первая волна откликов",
      goal: "Сделать take-home в формате EU-компаний и уверенно ревьюить чужой Go-код за 40 минут.",
      done: "Второе портфолио-репо (API-клиент) с тестами и README; чек-лист ревьюера; 3 разобранных чужих PR; 5–10 откликов волны 1.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w9-mon-1", text: "Take-home, часть 1 (≈90 мин): Go-клиент к REST API (create/fetch/delete, ошибки, ретраи, контекст) в формате задания Form3. Общий таймбокс 5–6 ч" },
            { id: "w9-mon-2", text: "Дополнительно: LeetCode 70. Climbing Stairs + проговор", lc: 70, optional: true }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w9-tue-1", text: "Take-home, часть 2 (≈90 мин): тесты, README с решениями, без лишних зависимостей" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w9-wed-1", text: "Code review (≈80 мин): 2 чужих Go-PR по 40 минут, комментарии письменно на английском", refs: [{ t: "Google: code review practices", u: "https://google.github.io/eng-practices/review/" }, { t: "Go Code Review Comments", u: "https://go.dev/wiki/CodeReviewComments" }] },
            { id: "w9-wed-2", text: "Дополнительно: LeetCode 198. House Robber + проговор", lc: 198, optional: true }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w9-thu-1", text: "Code review по quiz сайта (≈45 мин): прочитать код задачи и написать комментарии ревьюера до вариантов ответа", links: ["q4", "q10", "q12", "q18", "q19", "q20"] },
            { id: "w9-thu-2", text: "Собрать чек-лист ревьюера Go (≈45 мин): ошибки, контекст, горутины, ресурсы, тесты, API" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w9-sat-1", text: "Take-home, финал (≈150 мин): самоаудит по чек-листу, доработка" },
            { id: "w9-sat-2", text: "Ещё 1 чужой PR в формате 40 минут" },
            { id: "w9-sat-3", text: "Отклики волны 1 (≈30 мин): Luxoft, ZeptoLab и похожие — 5–10" },
            { id: "w9-sat-4", text: "Дополнительно: LeetCode 322. Coin Change + проговор (или перенести в резерв)", lc: 322, optional: true },
            { id: "w9-sat-5", text: "Таблица воронки (≈15 мин): отклик → ответ → скрининг → техинтервью → оффер; раз в неделю смотреть, где теряешься: мало ответов — менять CV и позиционирование, а не только число откликов" }
          ]
        }
      ],
      leetcode: [70, 198, 322],
      english: [
        "Walk me through the decisions in your take-home.",
        "What would you change if you had another day?",
        "How do you give code review feedback that is direct but not harsh?"
      ],
      selfCheck: [
        "Какие 5 пунктов ты проверяешь в любом Go-PR первым делом?",
        "Как ты поступаешь, если в take-home что-то неоднозначно?"
      ],
      gaps: [
        "Нет режима code review: показать фрагмент, дать написать комментарии, затем сравнить с эталонным списком замечаний.",
        "Quiz сейчас только выбор варианта, а не самостоятельный поиск дефекта."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 10 ─────────────────────────────
    {
      id: "w10",
      title: "System Design I",
      goal: "По шаблону за 40 минут вести дизайн вслух на английском и в каждом дизайне объяснять, почему Go.",
      done: "3 дизайна проговорены и записаны; вторая волна откликов отправлена до праздников.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w10-mon-1", text: "Шаблон ответа: requirements → API → data model → high-level → deep dive → bottlenecks → trade-offs", talk: "sd-template" },
            { id: "w10-mon-2", text: "LeetCode 300. Longest Increasing Subsequence + проговор", lc: 300 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w10-tue-1", text: "Дизайн 1: Rate limiter на 100K RPS (один инстанс → распределённый)", refs: [{ t: "Rate limiter 100K RPS (itvector)", u: "https://itvector.io/articles/rate-limiter-100k-rps" }] }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w10-wed-1", text: "Дизайн 2: Payments / ledger — на основе своего проекта (идемпотентность, outbox, сверка)" },
            { id: "w10-wed-2", text: "LeetCode 139. Word Break + проговор", lc: 139 }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w10-thu-1", text: "Дизайн 3: Notification service (каналы доставки, ретраи, дедупликация, приоритеты)" },
            { id: "w10-thu-2", text: "Отклики волны 2 до праздников: Topi, Bolt, Zendesk" },
            { id: "w10-thu-3", text: "Рефералы: 3 контакта в целевых компаниях через LinkedIn и сообщества — коротко, с конкретной вакансией", optional: true }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w10-sat-1", text: "Виртуальный System Design (Claude как интервьюер) по одному из трёх дизайнов, 45 минут" },
            { id: "w10-sat-2", text: "Переслушать запись: где не назвал компромисс или не спросил требования" },
            { id: "w10-sat-3", text: "LeetCode 62. Unique Paths + проговор", lc: 62 }
          ]
        }
      ],
      leetcode: [300, 139, 62],
      english: [
        "Before I start, can I clarify the functional and non-functional requirements?",
        "Let me start with a simple design and then scale it.",
        "The main trade-off here is consistency versus availability…",
        "Why would Go be a good fit for this service?"
      ],
      selfCheck: [
        "Какие 3 вопроса по требованиям ты задаёшь всегда?",
        "Где в твоём дизайне единая точка отказа?",
        "Как бы ты оценил нагрузку на хранилище по числу запросов?"
      ],
      gaps: [
        "На сайте нет раздела System Design: шаблон, разобранные дизайны, вопросы интервьюера.",
        "Нет связки «механизм Go → архитектурное решение» (например, горутины и netpoller → почему Go для I/O-bound сервиса)."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 11 ─────────────────────────────
    {
      id: "w11",
      title: "System Design II: event-driven и предметные дизайны",
      goal: "Уверенно вести дизайн event-driven систем и предметные задачи целевых компаний.",
      done: "Ещё 3 дизайна проговорены; на вопрос про exactly-once есть точный ответ без мифов.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w11-mon-1", text: "Event-driven: Kafka (партиции, порядок, consumer groups), outbox, sagas, ретраи и DLQ", talk: "outbox" },
            { id: "w11-mon-2", text: "LeetCode 33. Search in Rotated Sorted Array + проговор", lc: 33 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w11-tue-1", text: "Дизайн 4: Dispatch / delivery (назначение курьеров, гео-данные) — под Delivery Hero и Wolt" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w11-wed-1", text: "Дизайн 5: Inventory с резервированием (Quick Commerce): гонки за остаток, TTL резерва" }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w11-thu-1", text: "Дизайн 6: Multi-tenant SaaS (тикеты, как Zendesk): изоляция арендаторов, шардирование, noisy neighbour" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w11-sat-1", text: "Повторить один дизайн с нуля за 40 минут и записать" },
            { id: "w11-sat-2", text: "2 повторные задачи LeetCode из слабых тем с проговором" },
            { id: "w11-sat-3", text: "Проговор «Kafka vs RabbitMQ: when would you choose which?» — журнал с партициями и хранением против брокера очередей с маршрутизацией и подтверждениями", optional: true, refs: [{ t: "Apache Kafka: документация", u: "https://kafka.apache.org/documentation/" }, { t: "RabbitMQ: queues", u: "https://www.rabbitmq.com/docs/queues" }] }
          ]
        }
      ],
      leetcode: [33],
      english: [
        "How do you guarantee ordering for events of the same account?",
        "What does exactly-once really mean in Kafka-based systems?",
        "How would you isolate tenants in a shared database?"
      ],
      selfCheck: [
        "Saga: оркестрация или хореография — когда что?",
        "Что делать с сообщением, которое стабильно падает в обработке?",
        "Как избежать overselling при параллельных резервах?"
      ],
      gaps: [
        "Нет материалов по event-driven архитектуре и предметным дизайнам целевых компаний."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 12 ─────────────────────────────
    {
      id: "w12",
      title: "Behavioral, легенда, CV",
      goal: "8 STAR-историй и рассказ о себе звучат естественно по-английски; CV и LinkedIn готовы.",
      done: "Истории записаны и проговорены; финальные CV и LinkedIn; список вопросов к компании.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w12-mon-1", text: "STAR-истории 1–4: инцидент в проде, конфликт/несогласие, ownership, неопределённость", talk: "star" },
            { id: "w12-mon-2", text: "LeetCode 981. Time Based Key-Value Store + проговор", lc: 981 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w12-tue-1", text: "STAR-истории 5–8: менторство, дедлайн, кросс-командная работа, ошибка и вывод", talk: "star" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w12-wed-1", text: "«Why Go / why move from JVM?» и «Tell me about yourself» v2", talk: "why-go" },
            { id: "w12-wed-2", text: "Deep-dive по финтех-опыту без NDA-деталей: что можно говорить, что обобщить" }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w12-thu-1", text: "Финал CV и LinkedIn; позиционирование «Go + Kotlin backend, fintech»" },
            { id: "w12-thu-2", text: "Вопросы к компании: команда, on-call, процесс релизов, рост" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w12-sat-1", text: "Прогон всех историй вслух с записью, сократить каждую до 2 минут" },
            { id: "w12-sat-2", text: "2 повторные задачи LeetCode из слабых тем" }
          ]
        }
      ],
      leetcode: [981],
      english: [
        "Tell me about a production incident you handled.",
        "Tell me about a time you disagreed with a technical decision.",
        "Why are you moving to Go?",
        "What would you do differently in your last project?"
      ],
      selfCheck: [
        "В каждой истории есть число или измеримый результат?",
        "Видна ли в истории твоя роль, а не только команды?",
        "Хватает ли 2 минут на историю?"
      ],
      gaps: [
        "Нет банка behavioral-вопросов с шаблоном STAR и тренировкой ответа вслух."
      ]
    },

    // ───────────────────────────── НЕДЕЛЯ 13 ─────────────────────────────
    {
      id: "w13",
      title: "Моки и пик откликов",
      goal: "Пройти полный цикл интервью в тренировочном режиме и выйти на реальные собеседования.",
      done: "3 мока пройдены; назначены реальные собеседования; после каждого интервью вопросы занесены в журнал.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            { id: "w13-mon-1", text: "Мок 1: live coding (Pramp, interviewing.io или знакомые)", refs: [{ t: "Pramp", u: "https://www.pramp.com/" }, { t: "interviewing.io", u: "https://interviewing.io/" }] },
            { id: "w13-mon-2", text: "LeetCode 1396. Design Underground System + проговор", lc: 1396 }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            { id: "w13-tue-1", text: "Мок 2: System Design" }
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            { id: "w13-wed-1", text: "Полный виртуальный собес по плану Delivery Hero: coding + design + hiring manager + bar raiser" }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            { id: "w13-thu-1", text: "Мок 3: behavioral + Craft Deep-Dive" },
            { id: "w13-thu-2", text: "Отклики волны 3: Delivery Hero, Wolt (с релокацией)" }
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            { id: "w13-sat-1", text: "Журнал интервью: после каждого реального собеса записать вопросы и где запнулся; добавить их на сайт" },
            { id: "w13-sat-2", text: "Вилки и переговоры: подготовить диапазон и ответ на вопрос о зарплатных ожиданиях" },
            { id: "w13-sat-3", text: "2 задачи LeetCode на время (45 минут, вслух)" }
          ]
        }
      ],
      leetcode: [1396],
      english: [
        "What are your salary expectations?",
        "Do you have any questions for us?",
        "Is there anything you would like to add?"
      ],
      selfCheck: [
        "Какие темы чаще всего вызывали заминку на моках?",
        "Что из этого вернуть в повторение на следующей неделе?"
      ],
      gaps: [
        "Нет журнала реальных интервью, связанного с повторением тем на сайте."
      ]
    }
  ],

  // ─────────────────────────── LEETCODE ───────────────────────────
  // key — короткая идея решения на английском, раскрывается по запросу (сначала попытаться самому).
  leetcodeIndex: {
    1: { title: "Two Sum", slug: "two-sum", pattern: "Hash map", key: "Single pass: check the complement before inserting the current value." },
    3: { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", pattern: "Sliding window", key: "Keep the last index of each character; move the left edge past a repeat." },
    15: { title: "3Sum", slug: "3sum", pattern: "Two pointers", key: "Sort, fix one element, two pointers on the rest, skip equal neighbours." },
    20: { title: "Valid Parentheses", slug: "valid-parentheses", pattern: "Stack", key: "Push openers, match closers against the top, stack must end empty." },
    33: { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", pattern: "Binary search", key: "At each step one half is sorted; check whether the target lies in it." },
    49: { title: "Group Anagrams", slug: "group-anagrams", pattern: "Hash map", key: "A [26]int count array is comparable, so it can be a map key directly." },
    56: { title: "Merge Intervals", slug: "merge-intervals", pattern: "Intervals", key: "Sort by start; extend the last merged interval or append a new one." },
    62: { title: "Unique Paths", slug: "unique-paths", pattern: "DP", key: "Each cell is the sum of the cell above and the cell to the left; one row is enough." },
    70: { title: "Climbing Stairs", slug: "climbing-stairs", pattern: "DP", key: "Fibonacci with two variables." },
    98: { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", pattern: "Tree DFS", key: "Pass down the allowed (low, high) range, not just compare with the parent." },
    102: { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", pattern: "BFS", key: "Queue; process exactly len(queue) nodes per level." },
    133: { title: "Clone Graph", slug: "clone-graph", pattern: "Graph DFS/BFS", key: "Map from original node to its clone prevents infinite loops." },
    139: { title: "Word Break", slug: "word-break", pattern: "DP", key: "dp[i] is true if some dp[j] is true and s[j:i] is in the dictionary." },
    146: { title: "LRU Cache", slug: "lru-cache", pattern: "Design: map + list", key: "Map to list elements plus a doubly linked list for recency; container/list in Go." },
    150: { title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", pattern: "Stack", key: "Push numbers; on an operator pop two, mind the operand order." },
    155: { title: "Min Stack", slug: "min-stack", pattern: "Stack", key: "Store the current minimum alongside each pushed value." },
    198: { title: "House Robber", slug: "house-robber", pattern: "DP", key: "best(i) = max(best(i-1), best(i-2) + nums[i]) with two variables." },
    200: { title: "Number of Islands", slug: "number-of-islands", pattern: "Grid DFS/BFS", key: "Scan the grid; on land, flood-fill and count one island." },
    207: { title: "Course Schedule", slug: "course-schedule", pattern: "Topological sort", key: "Kahn's algorithm: process nodes with zero in-degree; a cycle leaves some unprocessed." },
    210: { title: "Course Schedule II", slug: "course-schedule-ii", pattern: "Topological sort", key: "Same as 207, but record the processing order." },
    215: { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", pattern: "Heap", key: "Min-heap of size k with container/heap; or quickselect on average O(n)." },
    230: { title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", pattern: "Tree DFS", key: "In-order traversal visits values in sorted order; stop at the k-th." },
    236: { title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", pattern: "Tree DFS", key: "If p and q are found in different subtrees, the current node is the answer." },
    238: { title: "Product of Array Except Self", slug: "product-of-array-except-self", pattern: "Prefix/suffix", key: "Prefix products left to right, then multiply by a running suffix product." },
    300: { title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", pattern: "DP / binary search", key: "Patience sorting: tails array plus binary search gives O(n log n)." },
    322: { title: "Coin Change", slug: "coin-change", pattern: "DP", key: "dp[amount] = 1 + min over coins of dp[amount - coin]." },
    347: { title: "Top K Frequent Elements", slug: "top-k-frequent-elements", pattern: "Hash map + buckets", key: "Count, then bucket by frequency and walk from the highest bucket." },
    435: { title: "Non-overlapping Intervals", slug: "non-overlapping-intervals", pattern: "Greedy intervals", key: "Sort by end; keep an interval if it starts after the last kept end." },
    567: { title: "Permutation in String", slug: "permutation-in-string", pattern: "Sliding window", key: "Fixed-size window with letter counts; compare count arrays." },
    621: { title: "Task Scheduler", slug: "task-scheduler", pattern: "Greedy / heap", key: "The most frequent task defines the frame: (maxCount-1)*(n+1) + number of tasks with maxCount." },
    684: { title: "Redundant Connection", slug: "redundant-connection", pattern: "Union-find", key: "The first edge whose endpoints are already connected is the answer." },
    739: { title: "Daily Temperatures", slug: "daily-temperatures", pattern: "Monotonic stack", key: "Stack of indices with decreasing temperatures; pop when today is warmer." },
    743: { title: "Network Delay Time", slug: "network-delay-time", pattern: "Dijkstra", key: "Dijkstra with container/heap; answer is the max distance if all nodes are reached." },
    973: { title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", pattern: "Heap", key: "Max-heap of size k on squared distance, no square root needed." },
    981: { title: "Time Based Key-Value Store", slug: "time-based-key-value-store", pattern: "Map + binary search", key: "Per key, a slice of (timestamp, value) in increasing order; binary search for get." },
    994: { title: "Rotting Oranges", slug: "rotting-oranges", pattern: "Multi-source BFS", key: "Start BFS from all rotten oranges at once; count minutes by levels." },
    1396: { title: "Design Underground System", slug: "design-underground-system", pattern: "Design: maps", key: "One map for active check-ins, one for (from, to) → total time and count." }
  },

  // ─────────────────────────── ПРОГОВОР ───────────────────────────
  // Опорные английские тексты. Не заучивать: смотреть на скелет, говорить своими словами.
  talks: {
    lc1: {
      title: "LC 1. Two Sum — полный диалог с интервьюером",
      dialog: [
        ["Interviewer", "Given an array of integers and a target, return the indices of two numbers that add up to the target."],
        ["You", "Before I start, a few questions. Is there always exactly one solution? Can I use the same element twice? Can the numbers be negative?"],
        ["Interviewer", "Exactly one solution, no reuse, and yes, negatives are possible."],
        ["You", "The brute-force approach checks every pair, which is O(n²). We can do better with a hash map from value to index. For each number I compute the complement and check whether I've already seen it. If yes, I return both indices; if not, I store the current number."],
        ["You", "I check the complement first and only then insert the current value. That ordering is what prevents using the same element twice."],
        ["Interviewer", "What's the complexity?"],
        ["You", "O(n) time, since map lookups are O(1) on average, and O(n) extra space."],
        ["Interviewer", "How would you test it?"],
        ["You", "Small example: [2, 7, 11, 15] with target 9 returns [0, 1]. In a table-driven test I'd add negative numbers, duplicates like [3, 3] with target 6, and the pair at the very end."],
        ["Interviewer", "What if the array were sorted?"],
        ["You", "Then two pointers, one at each end, give O(1) extra space: move the left pointer if the sum is too small, the right one if too large."]
      ]
    },
    lc49: {
      title: "LC 49. Group Anagrams",
      clarify: "Are the strings lowercase English letters only? Does the output order matter?",
      approach: "Anagrams share the same letter counts, so I build a key per word and group words in a map from key to list. In Go a [26]int array is comparable, so I can use it directly as a map key — no string building needed.",
      complexity: "O(n · k) time, where k is the average word length, and O(n · k) space.",
      edge: "An empty string is a valid group of its own; a single word gives one group."
    },
    lc347: {
      title: "LC 347. Top K Frequent Elements",
      clarify: "Is k always valid? If two numbers have the same frequency, does the order matter?",
      approach: "First count frequencies in a map. Then bucket sort: a slice of buckets indexed by frequency, which is at most n. Walk the buckets from the highest frequency and collect k numbers. A min-heap of size k is the alternative.",
      complexity: "Buckets give O(n) time and O(n) space; the heap is O(n log k).",
      edge: "k equals the number of unique elements; all elements are the same."
    },
    lc238: {
      title: "LC 238. Product of Array Except Self",
      clarify: "Division isn't allowed, right? Can there be zeros?",
      approach: "Two passes. Left to right I store the product of everything before each index. Right to left I keep a running suffix product and multiply it in. Zeros are handled naturally because I never divide.",
      complexity: "O(n) time, O(1) extra space besides the output.",
      edge: "One zero; two zeros, where every result is zero; negative numbers."
    },
    lc3: {
      title: "LC 3. Longest Substring Without Repeating Characters",
      clarify: "Is the input ASCII, or should I handle Unicode runes? In Go that matters because indexing a string works on bytes.",
      approach: "Sliding window. I keep the last index of each character. When I see a repeat inside the window, I move the left edge just past its previous position, and update the best length at each step.",
      complexity: "O(n) time; space is O(min(n, alphabet size)).",
      edge: "An empty string; all characters the same; the whole string unique."
    },
    lc15: {
      title: "LC 15. 3Sum",
      clarify: "Should I return unique triplets only? Does the order matter?",
      approach: "Sort the array. Fix the first element, then run two pointers on the rest: if the sum is too small move left forward, if too large move right back. Skip equal neighbours to avoid duplicate triplets.",
      complexity: "O(n²) time; sorting is O(n log n) and doesn't change that. O(1) extra space besides the output.",
      edge: "Fewer than three elements; all zeros; many duplicates."
    },
    lc739: {
      title: "LC 739. Daily Temperatures",
      clarify: "Should days with no warmer day get 0?",
      approach: "A monotonic stack of indices with decreasing temperatures. For each day, while today is warmer than the day on top of the stack, I pop it and record the distance. Then I push today.",
      complexity: "Each index is pushed and popped once, so O(n) time and O(n) space.",
      edge: "Strictly decreasing temperatures, where every answer is zero; equal temperatures."
    },
    lc146: {
      title: "LC 146. LRU Cache",
      clarify: "Should Get and Put both be O(1)? On Put with an existing key, do I update it and mark it as most recent?",
      approach: "A hash map plus a doubly linked list. The map gives O(1) access to the node; the list keeps the usage order, most recent at the front. Get moves the node to the front; Put inserts or updates at the front and evicts the tail when over capacity. In Go, container/list gives me the list, so the map holds *list.Element.",
      complexity: "O(1) for both operations; O(capacity) space.",
      edge: "Capacity 1; Put on an existing key; Get on a missing key returns -1.",
      followUp: "How would you make it thread-safe? — A sync.Mutex. Even Get mutates the list, so an RWMutex doesn't help much. Under high contention I'd shard the cache by key hash."
    },
    "w1-1": {
      title: "W1-1. Money",
      approach: "I store money as int64 minor units, so 12.50 EUR is 1250, because float64 can't represent decimal amounts exactly and rounding errors are unacceptable in payments. String() formats units and cents with the currency code.",
      edge: "Negative amounts, zero, amounts below one euro like 0.05."
    },
    "w1-2": {
      title: "W1-2. Account и W1-3. ValidationError",
      approach: "Withdraw needs a pointer receiver because it mutates the balance. On insufficient funds I return a sentinel error wrapped with context using %w, so the caller can still check it with errors.Is. ValidationError is a struct that carries the field name; errors.As walks the wrapped chain and extracts it, so the handler can return a 400 with the exact field.",
      edge: "errors.Is compares against a specific value; errors.As matches by type and gives me the value."
    },
    "w1-5": {
      title: "W1-5. SafeDiv",
      approach: "A deferred function calls recover; if a panic happened, it converts it into an error through a named return value.",
      edge: "In Go panic is for programmer bugs, not control flow. I'd normally check for zero up front; recover belongs at boundaries like HTTP middleware, so one bad request doesn't crash the server."
    },
    "w1-6": {
      title: "W1-6. Method sets",
      approach: "The method set of T contains only value-receiver methods; the method set of *T contains both. So if Notify has a pointer receiver, only *Service satisfies Notifier, and passing a Service value fails at compile time.",
      edge: "The rule itself comes from the spec. The rationale: an interface holds a copy of the value, so a pointer method called through it would change that copy, not the caller's variable."
    },
    "w2-1": {
      title: "W2-1. Remove",
      approach: "The order-preserving version is append(s[:i], s[i+1:]...). The catch is that it writes into the same backing array, so the caller's original slice changes too. The fast version swaps in the last element: O(1), but it loses the order.",
      edge: "slices.Delete also modifies the shared backing array, and since Go 1.22 it zeroes the vacated tail elements. If the caller still needs the original, I make an independent copy first, for example with slices.Clone."
    },
    "w2-3": {
      title: "W2-3. Generics vs interfaces",
      approach: "I use generics when the logic is identical for every type, like Map or a Set. I use an interface when each type behaves differently. Rule of thumb: write the concrete version first and generalize when a second use case appears."
    },
    "w2-4": {
      title: "W2-4. txsum CLI",
      approach: "I read the CSV with encoding/csv, parse each row into a transaction and aggregate balances in a map keyed by account and currency, using int64 minor units. Bad rows don't stop the run: I collect them with line numbers and report at the end, with a non-zero exit code if any failed.",
      edge: "Table-driven test for the row parser: valid row, missing column, non-numeric amount, unknown currency."
    },
    "p1-p10": {
      title: "«Что выведет код»: как объяснять",
      lines: [
        "P1 slice append into shared array — t has capacity 3, so append writes into the shared backing array and overwrites s[2].",
        "P3 nil map — reading returns the zero value, but writing panics: assignment to entry in nil map.",
        "P4 defer order — deferred calls run in LIFO order, and their arguments are evaluated when defer executes.",
        "P5 named result — return 1 assigns to the named result first, then the deferred function increments it.",
        "P6 typed nil — the interface holds the type *E with a nil value, so the interface itself isn't nil.",
        "P9 loop variable — since Go 1.22 a variable declared by the loop (:=) is new in each iteration; before 1.22, or with for i = range over an existing variable, all closures share one."
      ]
    },
    "w3-1": {
      title: "W3-1. Worker pool",
      clarify: "How many workers? Do results need to keep the input order? What happens if one job fails?",
      approach: "I start N workers that range over a jobs channel and send to a results channel. The producer closes jobs after the last send; a separate goroutine waits on a WaitGroup for all workers and then closes results, so the consumer's range loop ends. Every goroutine has an owner and a clear exit: the channel closing or ctx.Done().",
      complexity: "Concurrency is bounded by N, so memory and connections stay predictable under load.",
      edge: "Zero jobs; cancellation in the middle; a slow consumer — that's backpressure, the workers block on send instead of buffering unboundedly."
    },
    "w3-4": {
      title: "W3-4. Mutex vs atomic vs channel",
      approach: "For a single counter an atomic operation is usually the simplest fit; whether it is faster depends on contention, so I'd compare with a benchmark rather than assume. A mutex is right when the invariant spans several fields. A channel fits when I'm transferring ownership of data or coordinating work, not just protecting a variable.",
      edge: "An atomic protects one value; it doesn't make a check-then-act sequence on two values safe."
    },
    "w4-1": {
      title: "W4-1. ParallelFetch with errgroup",
      clarify: "Should one failure cancel the rest? Is there a limit on concurrent requests?",
      approach: "errgroup.WithContext gives me a context that is cancelled on the first error. SetLimit bounds concurrency. Each fetch uses the group's context, so the other requests stop early. Wait returns the first error.",
      edge: "The derived context is cancelled after Wait returns, so it must not be used for work after Wait."
    },
    "w4-2": {
      title: "W4-2. Rate limiter",
      approach: "For a single instance, a token bucket: tokens refill at a fixed rate up to a burst size; a request takes a token or is rejected or waits. In Go I'd use golang.org/x/time/rate rather than hand-roll it. Across many instances the state must be shared — for example Redis with an atomic script — or each instance gets a share of the global limit.",
      edge: "Burst behaviour; clock skew between instances; what the client sees on rejection — 429 with Retry-After."
    },
    "w4-3": {
      title: "W4-3. Graceful shutdown",
      approach: "signal.NotifyContext gives me a context cancelled on SIGTERM. I stop accepting new requests with server.Shutdown and a timeout, cancel background workers through their context, and wait for them with a WaitGroup or errgroup before closing the database pool.",
      edge: "Shutdown order matters: stop intake first, drain in-flight work, then close dependencies. Kubernetes gives a grace period, so the timeout must fit inside it."
    },
    "proj-structure": {
      title: "Рассказ о структуре проекта",
      approach: "cmd/ledger holds the wiring: config, logger, database pool and servers. internal/ledger is the domain — accounts, transfers and the rules — with no dependency on HTTP or SQL. internal/store implements persistence with pgx, and internal/http and internal/grpc are thin adapters. That keeps the domain testable with simple fakes."
    },
    idem: {
      title: "Идемпотентность платежей",
      clarify: "Single process or several instances? How long do we keep keys? What if the same key comes with a different payload?",
      approach: "The client sends an idempotency key. In the same transaction as the transfer I insert the key with a unique constraint and store the response. A retry with the same key returns the stored response; the same key with a different payload is rejected as a client error.",
      edge: "Two identical requests arriving at once: the unique constraint makes one insert win, so check-then-insert races are avoided."
    },
    outbox: {
      title: "Transactional outbox",
      approach: "Publishing to Kafka after the commit can fail, and then the event is lost. With an outbox I write the event to a table in the same transaction as the business change. A relay publishes pending rows and marks them sent. Delivery becomes at-least-once, so consumers must be idempotent.",
      edge: "Ordering per account: use the account ID as the Kafka key so its events land in one partition. That alone is not enough: the relay must publish rows in order, and producer retries must not reorder messages (idempotent producer). Each of these needs its own check."
    },
    "grpc-rest": {
      title: "REST vs gRPC",
      approach: "gRPC suits internal service-to-service calls: a typed contract, code generation, HTTP/2 streaming and deadlines that propagate. REST with JSON is better for public APIs and browsers, where tooling and readability matter more than efficiency."
    },
    "deep-dive": {
      title: "Craft Deep-Dive по проекту",
      lines: [
        "Start with the problem and constraints, then the design, then one decision you'd change.",
        "For each decision: the options, why this one, what it costs.",
        "Be honest about limits: what isn't tested, what wouldn't scale and why."
      ]
    },
    "sd-template": {
      title: "Шаблон System Design",
      lines: [
        "Requirements: functional, then non-functional — scale, latency, consistency.",
        "API: main endpoints or events.",
        "Data model: entities, keys, where the data lives.",
        "High-level design: components and data flow.",
        "Deep dive: the one or two hardest parts.",
        "Bottlenecks and failures: what breaks first and how we notice.",
        "Trade-offs: what we chose and what we gave up."
      ]
    },
    star: {
      title: "STAR",
      lines: [
        "Situation — one or two sentences of context.",
        "Task — what you were responsible for.",
        "Action — what you did, in first person, with technical detail.",
        "Result — a number or a concrete outcome, plus what you learned."
      ]
    },
    "why-go": {
      title: "Why Go",
      approach: "I've built payment systems on the JVM for years. I'm moving to Go because I value its simplicity and explicitness — errors as values, a small language, fast builds — and its concurrency model fits I/O-heavy backend services. Many fintech and platform teams in Europe build in Go, and I've been practicing on a ledger service with the same problems I solve at work."
    }
  },

  // ─────────────── КРИТЕРИИ ПРИЁМКИ НЕДЕЛЬ 1–5 ───────────────
  // accept — что сделать самостоятельно и на каком изменённом условии проверить перенос.
  // exercise — упражнение, которого на сайте пока нет (план наполнения), если оно нужно.
  // Задачи LeetCode без своей записи используют lcAccept.
  lcAccept: "Решено самостоятельно за 30 минут вслух по 4 шагам; названа сложность; подсказка открыта только после попытки; follow-up или изменённое условие объяснено словами.",

  acceptance: {
    "w1-mon-1": { accept: "Пройдены разделы Basics; без подсказки объясняешь var и := и порядок вызова defer на примере из трёх строк." },
    "w1-mon-2": { accept: "Репозиторий с go.mod; go vet ./... и go test ./... проходят на пакете с одним тестом." },
    "w1-tue-1": { accept: "Пройдены pointers…closures; без подсказки предсказываешь, что выведет замыкание после изменения захваченной переменной." },
    "w1-tue-2": { accept: "Примеры набраны и запускаются; по каждому — одна фраза, что он показывает." },
    "w1-tue-3": { accept: "Тесты: 1250 → «12.50 EUR», 5 → «0.05 EUR», ноль и отрицательная сумма; одна фраза по-английски, почему не float64. Изменённое условие: валюта без дробной части или с тремя знаками." },
    "w1-wed-1": { accept: "Без подсказки: type switch по ошибке и Stringer на своём типе; для обёрнутых ошибок — errors.As, а не type switch." },
    "w1-wed-2": { accept: "c33 и c34: ответ вслух по-английски до раскрытия, затем сверка; практика карточек выполнена. q2 и q28 (T и *T: какое присваивание интерфейсу скомпилируется) — ответ до вариантов." },
    "w1-wed-3": { accept: "Тесты: после обёртки %w errors.Is находит ErrInsufficientFunds; errors.As достаёт ValidationError с полем Field. Изменённое условие: два уровня обёртки." },
    "w1-thu-1": { accept: "Без подсказки по-английски: чем Is отличается от As, когда sentinel, когда typed error; q29 (%w → %v) и q30 (errors.Join, Go 1.20) объяснены до вариантов." },
    "w1-thu-2": { accept: "q3, q5, q31, q32: ответ до вариантов совпал с разбором по причине; объяснение по-английски; названо, чем q31 (безымянный результат) отличается от q3, а q32 (recover в своей горутине) — от q5." },
    "w1-thu-4": { accept: "Порядок трёх defer предсказан до запуска; SafeDiv возвращает ошибку при делении на ноль без паники наружу. Изменённое условие: panic во вложенной функции." },
    "w1-sat-1": { accept: "Без подсказки: почему var _ Notifier = Service{} не компилируется, а &Service{} — да; правило по спецификации и его мотивация." },
    "w1-sat-2": { accept: "Таблица своими словами; к каждой строке — пример кода, который ведёт себя иначе, чем в Kotlin. c40 — ответ до раскрытия; q33 (ключ map) и q34 (встраивание) — до вариантов." },
    "w1-sat-4": { accept: "Диалог Two Sum повторён своими словами за 5 минут без текста; follow-up про отсортированный массив отвечен." },
    "w1-sat-5": { accept: "Обе задачи проговорены без подсказок, по 5 минут; запись сделана." },
    "w1-sat-6": { accept: "Все вопросы самопроверки — ответ по-английски без подсказки; ошибочные отмечены для повтора." },

    "w2-mon-1": { accept: "c29: ответ до раскрытия; объяснено, зачем ограничивать cap в s[a:b:c]. Изменённое условие: append после s[:1:1]. P1, P2 и P10 из блока «Что выведет код» (ниже на этой странице) решены до сверки." },
    "w2-mon-2": { accept: "q4 и q6: дефект найден до вариантов. q6 — исправление копией или ограничением cap; q4 — только копией: ограничение cap большой массив не освобождает." },
    "w2-tue-1": { accept: "Без подсказки: правила map из спецификации и отличие «таблица не уменьшается» от «удалённые значения map не удерживает»; P3 (ниже на этой странице) решена; q33 — до вариантов." },
    "w2-tue-3": { accept: "P8 решена до сверки; c41 — ответ до раскрытия; по-английски: что возвращают len(s), s[i] и range по строке." },
    "w2-tue-4": { accept: "Тест показывает порчу исходного slice наивной версией и независимость версии с копией; объяснено поведение slices.Delete с Go 1.22." },
    "w2-wed-1": { accept: "Свой Set[T comparable] компилируется; объяснено, почему ключ map должен быть сравнимым." },
    "w2-wed-2": { accept: "Map/Filter/Reduce с тестами; абзац «generic или интерфейс» с одним контрпримером; практика c42 выполнена." },
    "w2-thu-1": { accept: "c43: ответ до раскрытия; объяснено, что даёт internal/ и чем пакет отличается от модуля; раскладка cmd/internal — вариант, не стандарт." },
    "w2-thu-2": { accept: "Table-driven тест с t.Run и t.Helper; один параллельный тест на изолированных данных; go test -race проходит; q35 (t.Parallel и defer) — до вариантов, исправление через t.Cleanup." },
    "w2-thu-3": { accept: "Тесты W1-2 и W2-2 покрывают ошибки и граничные случаи, а не только успешный путь." },
    "w2-thu-4": { accept: "P1–P5: вывод назван до сверки, объяснение — одна фраза по-английски." },
    "w2-sat-1": { accept: "10 задач и q1: вывод до сверки; для P9 объяснена зависимость от версии языка в go.mod." },
    "w2-sat-2": { accept: "Тесты: валидная строка, пропущенная колонка, нечисловая сумма, неизвестная валюта; ненулевой код выхода при ошибочных строках." },
    "w2-sat-6": { accept: "q1–q6: ответ до вариантов, причина названа верно не меньше чем в 5 из 6; ошибки — в повтор." },

    "w3-mon-1": { accept: "c1 и c2: ответ по-английски до раскрытия; практика c2 выполнена. Изменённое условие: свой пример логической гонки без data race." },
    "w3-mon-2": { accept: "Пересказана схема отмены пайплайна: кто сигнализирует остановку и как каждая стадия завершается." },
    "w3-tue-1": { accept: "Таблица nil/open/closed для отправки, приёма и close — по памяти; шаги sim3 предсказаны до переключения." },
    "w3-tue-2": { accept: "Тесты: не больше N одновременных задач, все результаты получены, отмена в середине завершает всех воркеров, медленный потребитель не ведёт к неограниченной памяти; -race чистый." },
    "w3-tue-3": { accept: "Тест: отмена или ранний выход потребителя останавливает все стадии; зависших горутин нет." },
    "w3-wed-1": { accept: "c18 и q22: ответ до вариантов; объяснено, почему проверка ctx перед select не даёт строгого приоритета отмены." },
    "w3-wed-2": { accept: "Выход закрывается после закрытия всех входов; отмена прерывает работу; тест на пустой набор входов." },
    "w3-wed-3": { accept: "q12, q15, q21 в режиме «Сначала свой ответ» (вкладка quiz): дефект и исправление записаны до вариантов и совпали с разбором по причине." },
    "w3-thu-1": { accept: "c15, c20, c21, c22: ответы до раскрытия; объяснено, почему atomic не защищает составной инвариант." },
    "w3-thu-2": { accept: "Счётчик тремя способами даёт один результат под -race; SafeCache не отдаёт наружу ссылку на защищённые данные; вывод бенчмарка без «всегда быстрее»." },
    "w3-thu-3": { accept: "q7, q8, q13, q14: дефект до вариантов; исправленный код объяснён." },
    "w3-sat-1": { accept: "Для каждой горутины W3-1…W3-5 записаны владелец и условие завершения; все тесты под -race проходят." },
    "w3-sat-4": { accept: "Запись 3–5 минут: worker pool по 4 шагам и выбор mutex или channel на примере." },
    "w3-sat-5": { accept: "Вопросы самопроверки — по-английски без подсказки." },

    "w4-mon-1": { accept: "c22, q9, q10: ответ до раскрытия; объяснено, что отмена контекста не останавливает код, который ctx не проверяет." },
    "w4-mon-2": { accept: "Тесты: первая ошибка отменяет остальные; SetLimit соблюдается; к возврату все запущенные операции завершены; контекст группы не используется после Wait." },
    "w4-tue-1": { accept: "q16, q17, q11: ответ до вариантов; для q11 названо, что изменилось в Go 1.23 и почему важна версия в go.mod." },
    "w4-tue-2": { accept: "Тесты: отказ сверх лимита, burst, восстановление после паузы; отличие от x/time/rate описано." },
    "w4-wed-1": { accept: "c12: ответ и практика без подсказки. Изменённое условие: утечка при уходе потребителя." },
    "w4-wed-2": { accept: "Тест: новые запросы не принимаются, работа в полёте завершается, зависимости закрываются после воркеров; таймаут соблюдается." },
    "w4-wed-3": { accept: "Утечка воспроизведена и найдена в goroutine-профиле; исправление подтверждено тестом завершения своих горутин, а не числом NumGoroutine." },
    "w4-thu-1": { accept: "c7, c8, c10: ответ по-английски за 30 секунд без деталей реализации; шаги sim2 предсказаны до переключения; ответ за минуту по шагу 10 — вслух, без подсказки, в его порядке; пять частых вопросов шага 11 — ответ до раскрытия." },
    "w4-thu-2": { accept: "c23, c24, c26, c27: ответы до раскрытия; объяснено, почему GOMEMLIMIT не гарантирует отсутствие OOM." },
    "w4-thu-3": { accept: "Для трёх функций объяснена каждая строка вывода -gcflags=-m; одна функция изменена так, чтобы переменная осталась на стеке, и это проверено повторно." },
    "w4-sat-1": { accept: "Профиль снят; гипотеза проверена изменением и повторным бенчмарком; вывод без обещаний конкретной скорости." },
    "w4-sat-2": { accept: "c38: по одной фразе про GOMAXPROCS в контейнерах (Linux, Go 1.25) и про synctest, с версиями." },
    "w4-sat-4": { accept: "Все 14 задач: ответ до вариантов; результат первой попытки записан; ошибки — в повтор." },
    "w4-sat-5": { accept: "Задача решена вслух за 40 минут; получен разбор; три слабых места записаны." },

    "w5-mon-1": { accept: "ADR на английском: контекст, решение, альтернативы, последствия; что в scope и вне его." },
    "w5-mon-2": { accept: "Пакет ledger не импортирует net/http и драйвер БД; Money в int64 покрыт тестами." },
    "w5-tue-1": { accept: "Три маршрута работают; тесты через httptest на успешный ответ, 404 и 405. c45 и диаграмма 10 — ответ до раскрытия; q36 и q37 — до вариантов." },
    "w5-tue-2": { accept: "Ошибка валидации → 400 с полем; нехватка средств → выбранный код с записанным обоснованием; неизвестная ошибка → 500 без деталей наружу; тест на каждый случай. c46 — ответ до раскрытия; q39 — до вариантов." },
    "w5-wed-1": { accept: "Миграции применяются на чистой БД; у пула заданы лимиты и таймаут подключения." },
    "w5-wed-2": { accept: "q18 и q19: ответ до вариантов; в коде проверяются rows.Close и rows.Err, Rollback безопасен после Commit; тест на ошибку посреди итерации. c47 — ответ до раскрытия." },
    "w5-thu-1": { accept: "JSON-логи с request id; секреты не логируются; конфиг из окружения с понятной ошибкой при отсутствии значения. c48 — ответ до раскрытия; q38 — до вариантов." },
    "w5-thu-2": { accept: "docker compose up поднимает сервис после healthcheck БД." },
    "w5-sat-1": { accept: "Сценарий end-to-end и тесты отказов: нехватка средств, несуществующий счёт, повтор запроса; сумма балансов сходится." },
    "w5-sat-2": { accept: "Запись 3 минуты по-английски: структура, одно решение и его цена, что бы изменил." },

    "w6-mon-1": { accept: "Перевод — одна транзакция: обе строки блокируются SELECT … FOR UPDATE по возрастанию ID, баланс проверяется под блокировкой, 40001 и 40P01 повторяются с BEGIN. c49 и c50 — ответ до раскрытия; W6-1 проходит go test -race." },
    "w6-tue-1": { accept: "Таблица idempotency_keys: ключ с UNIQUE, отпечаток запроса, сохранённые статус и тело; повтор возвращает сохранённый ответ, другой payload с тем же ключом — 422. c51 — ответ до раскрытия; W6-2 проходит go test -race." },
    "w6-tue-2": { accept: "Тест: два одинаковых запроса одновременно — один перевод. Ключ занимается INSERT … ON CONFLICT DO NOTHING в транзакции перевода; объяснено, почему -race молчит при «проверить, потом вставить». q40 — до вариантов." },
    "w6-wed-1": { accept: "Событие пишется в outbox в той же транзакции, что и перевод; при откате нет ни перевода, ни события. c52 — ответ до раскрытия; q42 — до вариантов." },
    "w6-wed-2": { accept: "Relay — одна горутина с владельцем: останавливается по ctx, после ошибки повторяет то же событие, отправленным помечает только после подтверждения; при остановке сервиса её дожидаются. W6-3 проходит go test -race." },
    "w6-thu-1": { accept: "Потребитель фиксирует offset после обработки; ID события и результат — в одной транзакции; дубликат не меняет данные (тест); ключ сообщения — ID счёта. c53 — ответ до раскрытия; q43 — до вариантов." },
    "w6-thu-2": { accept: "docker compose up поднимает Kafka и сервис; relay публикует событие перевода, потребитель его читает." },
    "w6-sat-1": { accept: "100 параллельных переводов: сумма балансов неизменна, отрицательных балансов нет, -race чистый, встречные переводы не дают дедлока. q41 — до вариантов." },
    "w6-sat-2": { accept: "Две записи по 2 минуты по-английски: идемпотентность (ключ, отпечаток, атомарный захват) и outbox (двойная запись, at-least-once, дедупликация)." },
    "w6-sat-4": { accept: "Для запроса истории счёта — EXPLAIN ANALYZE до и после составного индекса (account_id, created_at); найден и убран N+1. c54 — ответ до раскрытия." }
  },

  // ─────────────── ОБРАЗЦЫ ОТВЕТОВ НА АНГЛИЙСКОМ (НЕДЕЛИ 1–3, 5–6) ───────────────
  // hook — одна строка для запоминания; en — короткий ответ для интервью.
  // Открывать после своей попытки вслух; сверять смысл, а не заучивать дословно.
  modelAnswers: {
    "w6-mon-1": {
      hook: "Read Committed + FOR UPDATE in ID order; retry 40001 and 40P01 from BEGIN.",
      en: "PostgreSQL defaults to Read Committed, where each statement sees its own snapshot. For a transfer I open one transaction, lock both account rows with SELECT FOR UPDATE in ascending ID order, check the balance under the lock and update both rows. A stable lock order means opposite transfers cannot deadlock. Repeatable Read or Serializable would also work, but then I must retry the whole transaction on serialization failures, SQLSTATE 40001; deadlocks, 40P01, are retried too."
    },
    "w6-tue-1": {
      hook: "Key + request fingerprint + stored response; same key, other body → 422.",
      en: "A client may retry a payment, so it sends an Idempotency-Key that makes the retry safe. I store the key in a table with a unique constraint, together with a hash of the request and the response I returned. A repeat with the same key and the same request gets the stored response, and no money moves again. The same key with a different body is rejected with 422. Business outcomes like insufficient funds are stored too; infrastructure failures are rolled back, so the client can retry."
    },
    "w6-tue-2": {
      hook: "Claim the key atomically: INSERT … ON CONFLICT DO NOTHING in the transfer's transaction.",
      en: "Check-then-insert fails under concurrency: both requests check, find nothing and both transfer. There is no data race, so the race detector stays silent. I claim the key with INSERT ON CONFLICT DO NOTHING on a unique column, in the same transaction as the transfer. A concurrent duplicate blocks on the unique index until the first transaction ends; in Read Committed it then sees the conflict and returns the stored response, or claims the key if the first one rolled back."
    },
    "w6-wed-1": {
      hook: "Event row in the same transaction; a relay publishes; at-least-once.",
      en: "Publishing after commit is a dual write: if the process dies between the commit and the send, the event is lost, and sending first can announce a transfer that then rolls back. So I insert the event into an outbox table in the same transaction as the transfer: either both are committed or neither is. A relay publishes the rows later, so delivery is at-least-once, and consumers must deduplicate."
    },
    "w6-wed-2": {
      hook: "One owned goroutine: poll, publish in order, mark after the ack, stop on ctx.",
      en: "The relay moves events from the outbox table to Kafka; it is one goroutine started and stopped by main. It polls unsent rows in ID order, publishes each with the account ID as the key, and marks a row sent only after the broker acknowledged it. On an error it stops the batch and retries the same row after a pause, which keeps per-account order. It returns when its context is cancelled, and shutdown waits for it. A lost acknowledgement means a duplicate, which the consumer handles."
    },
    "w6-thu-1": {
      hook: "Commit the offset after the effect; dedupe by event ID; order per partition.",
      en: "My consumer is at-least-once: it commits the offset only after the effect is committed in the database. A crash or a rebalance in between replays messages, so the handler stores the event ID in the same transaction as the effect and skips IDs it has seen. Ordering is per partition: events are keyed by account ID and the producer hashes the key, so one account's events stay in one partition, and within a group each partition is read by one consumer at a time."
    },
    "w6-sat-1": {
      hook: "Per-account locks in ID order; check under the lock; 100 goroutines under -race.",
      en: "Each account has its own lock, and a transfer takes both locks in ascending ID order, so opposite transfers cannot deadlock. The balance is checked under the locks, so two transfers cannot spend the same money. The test starts a hundred goroutines doing random transfers under the race detector, checks that the total never changes and that no balance goes negative, and fails by timeout if something hangs."
    },
    "w6-sat-4": {
      hook: "EXPLAIN ANALYZE; composite index (account_id, created_at); N+1 → one query.",
      en: "I run EXPLAIN ANALYZE on the real query: it shows the plan with actual times and row counts. For an account's history, newest first, a sequential scan over all transfers points to a missing index, so I add a B-tree index on account_id and created_at, and the plan becomes an index scan without a sort. N+1 is one query per row of a list; I replace it with a join or one query with id = ANY of an array."
    },
    "w5-tue-1": {
      hook: "One goroutine per connection; r.Context() ends when the client leaves or the handler returns; four timeouts, zero means none.",
      en: "net/http serves each connection in its own goroutine and runs the handler there; Go 1.22 patterns match method and path, give 405 with Allow, and r.PathValue reads the id. I pass r.Context() to every downstream call, because it is cancelled when the client disconnects and after the handler returns. On http.Server I set ReadHeaderTimeout and IdleTimeout, usually ReadTimeout and WriteTimeout, since zero means no limit. Tests go through httptest against the real handler."
    },
    "w5-tue-2": {
      hook: "Domain errors in, status codes out — in one function; 500 hides the cause and logs it once.",
      en: "The domain returns sentinel and typed errors and doesn't import net/http. One function at the HTTP boundary maps them with errors.Is and errors.As, so wrapped errors still match: validation to 400 with the field, not found to 404, insufficient funds to 409. Anything else is a 500 with a generic body, and the real error is logged once with the request id. errors.As needs a pointer to the type that implements error."
    },
    "w5-wed-2": {
      hook: "*sql.DB is a pool: defer rows.Close, check rows.Err, defer tx.Rollback, everything on tx.",
      en: "*sql.DB is a connection pool, not one connection: I get it once from sql.Open, with limits on open and idle connections. Every Rows holds a connection until it is closed, so after checking the query error I defer rows.Close() and check rows.Err() after the loop. A transaction pins one connection: I begin it with the request context, defer Rollback, which is a no-op after Commit, and run every statement on tx, not on db."
    },
    "w5-thu-1": {
      hook: "One JSON logger, request_id via With in middleware, LogValue for secrets, log errors once.",
      en: "I create one slog logger with a JSON handler at startup, and a middleware adds request_id with With and puts that logger into the request context. I log key-value attributes, not formatted strings. Types with secrets get a LogValue method, so passwords and tokens never reach the log, and each error is logged once, where it is handled."
    },
    "w1-mon-1": {
      hook: "var x T gives the zero value; := declares and infers; defer runs LIFO.",
      en: "Go has two ways to declare a variable: var x T declares one with its zero value and also works at package level. x := expr is a short declaration inside a function: it infers the type and must declare at least one new variable on the left. Deferred calls run when the surrounding function returns, last in, first out, and their arguments are evaluated when the defer statement runs."
    },
    "w1-tue-1": {
      hook: "A closure captures the variable, not a copy of its value.",
      en: "A closure captures a variable, not a copy of its value. So if closures created in a loop all print the same final value, they share one variable, and a later change is visible inside each of them. Since Go 1.22, in modules declaring go 1.22 or later, a variable declared by the loop, as in for i := range, is new in each iteration, so those closures no longer share it. A variable declared before the loop and assigned with for i = range is still one variable shared by all iterations."
    },
    "w1-tue-3": {
      hook: "Money is integer minor units plus a currency, never float64.",
      en: "I store money as int64 minor units with a currency code, so 12.50 EUR is 1250. float64 cannot represent most decimal fractions exactly, and rounding errors accumulate in sums. String() splits major and minor units: 1250 becomes \"12.50 EUR\" and 5 becomes \"0.05 EUR\". I format the absolute value and prepend the sign, so -5 is \"-0.05 EUR\". The number of minor digits belongs to the currency: JPY has none and some currencies have three, so I don't hard-code 100."
    },
    "w1-wed-1": {
      hook: "A type switch branches on the dynamic type inside an interface.",
      en: "A type switch branches on the dynamic type stored in an interface: switch v := x.(type) runs the first case whose type matches it; in a case listing exactly one type, v already has that type, otherwise v keeps the type of x. Stringer is the fmt interface with String() string; fmt uses it for %v and %s, which is how a type controls its printed form."
    },
    "w1-wed-2": {
      hook: "Interface = type + value; nil only if both are nil. Service has value methods, *Service has both.",
      en: "A typed nil inside an interface is not really nil: returning a nil *MyErr as error gives the caller a non-nil error, because an interface value holds a dynamic type and a value and is nil only when both are nil. Service's method set has only its value-receiver methods; *Service's has both. So if Notify has a pointer receiver, *Service implements the interface and Service does not. Calling v.Notify() on a Service variable is only shorthand for (&v).Notify(); an element of map[K]Service or a function result of type Service cannot be called that way, while an element of map[K]*Service or a result of type *Service can."
    },
    "w1-wed-3": {
      hook: "Wrap with %w; Is compares, As extracts.",
      en: "I wrap errors with fmt.Errorf(\"withdraw: %w\", err) to add context while keeping the cause. errors.Is walks the chain and compares with a sentinel such as ErrInsufficientFunds; errors.As finds the first error of the target type, such as *ValidationError, and lets me read its fields. A test should check both after one and after two levels of wrapping."
    },
    "w1-thu-1": {
      hook: "Sentinel for a condition, typed error for data; %v breaks the chain.",
      en: "I use a sentinel error when callers only branch on a fixed condition, and a typed error when they need details such as the invalid field. With %w the cause stays in the chain; with %v it becomes plain text, so errors.Is and errors.As stop matching. errors.Join, since Go 1.20, combines several errors, and Is and As check each of them."
    },
    "w1-thu-2": {
      hook: "Defer arguments are evaluated immediately; deferred closures can change named results.",
      en: "defer schedules cleanup for when the function returns; deferred calls run in last-in-first-out order, but their arguments are evaluated when the defer statement executes. A deferred closure can read and change named results after the return statement has set them; with unnamed results it cannot change the returned value."
    },
    "w1-thu-4": {
      hook: "recover works only in a deferred call of the panicking goroutine.",
      en: "A panic unwinds the stack and runs deferred calls, and recover stops it only when it is called directly by a deferred function in the goroutine that is panicking. SafeDiv defers a function that recovers and turns the panic into an error by assigning to the named err result. A panic in another goroutine is not caught here and crashes the program unless that goroutine recovers it. For expected failures I return errors; panic is for programmer errors."
    },
    "w1-sat-1": {
      hook: "Service lacks pointer-receiver methods in its method set; &Service{} has them.",
      en: "It comes down to method sets: var _ Notifier = Service{} fails to compile when Notify has a pointer receiver, because the method set of Service does not include it; &Service{} works. The rule comes from the spec. The usual motivation: an interface stores a copy, and that copy is not addressable, so a pointer method would have nothing to point to and could not modify the caller's value."
    },
    "w1-sat-2": {
      hook: "var x T is ready: 0, \"\", false or nil; nil map writes panic, nil channels block.",
      en: "Every declared variable starts at its zero value: var n int is 0, var s string is \"\", var ok bool is false, and a pointer, slice, map, channel, func or interface declared without a value is nil; struct fields are zeroed too. A nil slice works with len, append and range. Reading a nil map returns the zero value, but m[k] = v panics. Sending to or receiving from a nil channel blocks forever. Map keys must be comparable, so slices, maps and functions cannot be keys."
    },

    "w2-mon-1": {
      hook: "A slice is pointer, len, cap over a shared array.",
      en: "A slice is only a view onto an underlying array: a descriptor with a pointer, a length and a capacity. So s[1:3] copies no elements, and because re-slicing shares the array, a write through one slice is visible through the other. append writes in place when the resulting length fits in the capacity and otherwise allocates a new array and copies. s[a:b:c] limits capacity to c-a; s[a:b:b] leaves no spare capacity, so appending to it must copy into a new array and cannot overwrite s[b:]; copy or slices.Clone gives an independent slice."
    },
    "w2-mon-2": {
      hook: "Aliasing: limit cap or copy. Retention: only a copy frees the array.",
      en: "Both traps come from slices sharing one array. The first is aliasing: two appends to the same slice with spare capacity write into the same slot, so the second overwrites the first; limit the capacity with a[:len(a):len(a)] so append must allocate, or copy. The second is retention: a 16-byte slice keeps the whole 100 MiB array reachable, and only a copy, such as bytes.Clone or make plus copy, lets the array be collected."
    },
    "w2-tue-1": {
      hook: "Map order is unspecified; reading nil is fine, writing nil panics.",
      en: "A Go map is a built-in hash table with a few rules worth knowing. Iteration order is not specified, so code must not depend on it. Reading a missing key returns the zero value; v, ok tells absence from a stored zero. A nil map can be read but not written. Map elements are not addressable, so m[k].f = 1 does not compile for struct values. Any concurrent access where at least one goroutine writes needs synchronization; the runtime may detect it and stop with a fatal error. Deleting entries does not shrink the table, but deleted values are no longer kept reachable."
    },
    "w2-tue-3": {
      hook: "len counts bytes; range decodes runes.",
      en: "Strings are bytes, not characters: len(\"héllo\") is 6, not 5, because a string is an immutable sequence of bytes, usually UTF-8, and é takes two of them. len(s) counts bytes and s[i] returns a byte, not a character. range over a string decodes runes and gives the byte offset of each. To count runes (code points) I use utf8.RuneCountInString, and I convert to []rune only when I really need to index by code point."
    },
    "w2-tue-4": {
      hook: "Removing in place changes the caller's array; copy first for independence.",
      en: "Removing in place changes the caller's data: append(s[:i], s[i+1:]...) shifts elements inside the shared array, so the caller's slice sees the change. slices.Delete also modifies the array and, since Go 1.22, zeroes the elements after the new length. If the caller's data must stay intact, I copy first with slices.Clone or build a new slice."
    },
    "w2-wed-1": {
      hook: "Set[T comparable] because map keys must be comparable.",
      en: "Generics let one type work for many element types: a generic Set[T comparable] is a map[T]struct{} with Add, Has and Len. The comparable constraint is required because only comparable types can be map keys. The empty struct value takes no space, so the map stores only keys."
    },
    "w2-wed-2": {
      hook: "Generics for same algorithm over types; interfaces for different behaviour.",
      en: "Generics and interfaces both let code work with many types, but differently. I use generics when the algorithm is the same for many types and the caller needs the concrete type back, as in Map, Filter or Reduce. I use an interface when behaviour differs per type and callers depend on methods, for example different storage backends. I don't add type parameters just to avoid writing a small function twice."
    },
    "w2-thu-1": {
      hook: "Module = versioned set of packages; internal/ limits importers.",
      en: "A module is the unit of versioning and a package the unit of compilation: go.mod declares the module path, such as module example.com/shop, and a package is one directory compiled together. Code under internal/ can be imported only by packages in the tree rooted at the parent of that internal directory. cmd/ for binaries and internal/ for private code is a common layout, not a language rule."
    },
    "w2-thu-2": {
      hook: "Named cases with t.Run; t.Helper fixes line numbers; t.Parallel only with isolated data.",
      en: "A table-driven test is the usual Go way to check many inputs with one test function: it lists named cases and runs each in t.Run, so a failure shows the case name and one case can be run with -run. t.Helper marks a helper so failures point to the caller's line. t.Parallel runs a test alongside others, so I use it only when cases don't share mutable data. CI runs go test -race."
    },
    "w2-sat-2": {
      hook: "Validate each line, report all errors, exit non-zero on failure.",
      en: "txsum is a small CLI that totals transactions from a CSV file: it reads the lines, validates every field and sums amounts per account and currency in minor units. Invalid lines are reported with their line numbers instead of stopping at the first one, and the program exits with a non-zero code if any line failed. Tests cover a valid line, a missing column, a non-numeric amount and an unknown currency."
    },

    "w3-mon-1": {
      hook: "Data race: unsynchronized access with a write. Race condition: timing-dependent logic.",
      en: "A goroutine is a function running concurrently under the Go runtime: go f() starts one, scheduled onto OS threads, with a small growable stack, so a program can have many. A data race is two goroutines accessing the same memory concurrently, at least one writing, without synchronization; the race detector reports it when it happens in a run. A race condition is a logic bug whose result depends on timing. It can exist without a data race, for example a check and an update done in two separate critical sections."
    },
    "w3-tue-1": {
      hook: "nil blocks; closed: send panics, receive drains then returns zero, false.",
      en: "A channel's state decides whether an operation blocks, returns at once or panics. Sending to or receiving from a nil channel blocks forever. Sending on a closed channel panics; receiving from a closed channel returns the remaining buffered values, then the zero value with ok false. Closing a nil or an already closed channel panics. So the side that owns sending closes the channel, once, after the last send."
    },
    "w3-tue-2": {
      hook: "Producer closes jobs; WaitGroup closes results; every blocking step watches ctx.",
      en: "A worker pool bounds concurrency: N workers read from a jobs channel and write to a results channel. The producer closes jobs after the last send. A separate goroutine waits for all workers with a WaitGroup and then closes results, so the consumer's range ends. Every send and receive also selects on ctx.Done, so cancelling ctx releases every goroutine; a consumer that stops early must cancel."
    },
    "w3-tue-3": {
      hook: "Each stage owns and closes its output; every send selects on ctx.Done.",
      en: "In a pipeline, each stage reads from its input, writes to an output it owns and closes that output when the input is exhausted. Every send selects on ctx.Done, so if the consumer stops early and cancels, all stages return and no goroutine stays blocked. A test cancels in the middle and checks that every stage has exited."
    },
    "w3-wed-1": {
      hook: "Random among ready cases; checking ctx first is not priority.",
      en: "select waits for one of several channel operations; if several are ready, it picks one pseudo-randomly. default makes it non-blocking. Checking ctx.Err() before the select doesn't give cancellation priority, because once inside, a ready data case can still win. The channel operands and send values are evaluated once, before a case is chosen."
    },
    "w3-wed-2": {
      hook: "One forwarder per input; close output after all forwarders finish.",
      en: "Fan-in starts one goroutine per input that forwards values to a shared output. A WaitGroup tracks the forwarders, and one goroutine closes the output after all of them return. Each forward selects on ctx.Done, so cancellation stops everything, and an empty list of inputs closes the output immediately."
    },
    "w3-thu-1": {
      hook: "Atomics protect one variable; invariants across fields need a mutex.",
      en: "Atomics protect one variable, not an invariant: atomic.AddInt64 makes one operation on one variable indivisible, but moving money between two accounts touches two balances, and two separate atomic adds cannot keep their total constant. One balance can be updated with a CompareAndSwap loop; a multi-value invariant usually needs one Mutex around the whole check and update. RWMutex can help when reads dominate, but it is not automatically faster. A Mutex must not be copied after first use."
    },
    "w3-mon-2": {
      hook: "Close outputs when done; a done channel or ctx stops every stage.",
      en: "A pipeline is a chain of stages linked by channels: in gen → square → print, gen only sends, print only receives, and each middle stage is a goroutine that receives from upstream, processes the value and sends it downstream. A stage closes its output when it has sent everything. If the consumer stops early, upstream stages would block forever, so every send also listens to a done channel or ctx.Done, and cancelling it releases all of them."
    },
    "w3-thu-3": {
      hook: "One WaitGroup by pointer; no re-lock; recheck under Lock; copy, don't leak pointers.",
      en: "Calling Done on a copy of a WaitGroup leaves the original counter unchanged, so Wait blocks; pass *WaitGroup, or use wg.Go in Go 1.25+. Locking a Mutex again from the code that already holds it deadlocks, because Go mutexes are not reentrant. A check under RLock is stale after RUnlock, so check-then-insert must recheck under Lock; that is a logic race even without a data race. Returning a pointer from a protected map lets callers read or change the value after unlock, so I copy the value while holding the lock."
    },
    "w3-sat-1": {
      hook: "For every goroutine: who starts it, who stops it, how it ends.",
      en: "For each goroutine I can name its owner and its exit path: it returns when its input channel is closed, when ctx is cancelled, or when its single task is done, and someone waits for it with a WaitGroup or errgroup. If I can't name the exit path, the goroutine can leak. go test -race finds data races in the paths the tests run, not deadlocks or logic errors."
    },
    "w3-sat-4": {
      hook: "Channels transfer ownership; mutexes protect shared state.",
      en: "I use channels when work or data moves between goroutines, so ownership passes with the value, as in a worker pool. I use a mutex when several goroutines read and update the same state in place, such as a cache or a counter. The choice is about clarity of ownership; I measure before claiming either is faster."
    },
    "w3-thu-2": {
      hook: "Same result three ways; choose by clarity and measured contention; never leak internal state.",
      en: "A counter with a Mutex, with atomic.Int64 and with a single owner goroutine gives the same result under -race; I choose by clarity and measured contention, not by a general rule. A cache guarded by RWMutex must not return its internal map or slices, because callers would then change shared data outside the lock; it returns copies instead."
    }
  },

  // ─────────────────────── «ЧТО ВЫВЕДЕТ КОД» ───────────────────────
  // Для недели 2. Фрагменты: для запуска нужны package main, import "fmt" и func main (у P5/P6 main уже есть).
  // output — вывод на Go 1.22+ с версией языка модуля ≥ 1.22; why/whyRU — объяснение EN/RU; version — где вывод зависит от версии.
  predict: [
    { id: "p1", code: "s := []int{1, 2, 3}\nt := s[:2]\nt = append(t, 99)\nfmt.Println(s)", output: "[1 2 99]", why: "t has capacity 3, so append writes into the shared backing array and overwrites s[2].", whyRU: "У t ёмкость 3, поэтому append пишет в общий массив и перезаписывает s[2]." },
    { id: "p2", code: "s := make([]int, 0, 1)\na := append(s, 1)\nb := append(s, 2)\nfmt.Println(a[0], b[0])", output: "2 2", why: "Both appends reuse the same array of capacity 1, so the second write overwrites the first.", whyRU: "Оба append используют один массив ёмкостью 1; вторая запись перезаписывает первую." },
    { id: "p3", code: "var m map[string]int\nfmt.Println(m[\"x\"], len(m))\nm[\"x\"] = 1", output: "0 0, then panic", why: "Reading a nil map returns the zero value, but writing to it panics: assignment to entry in nil map.", whyRU: "Чтение из nil map возвращает нулевое значение, а запись вызывает panic: assignment to entry in nil map." },
    { id: "p4", code: "for i := 0; i < 3; i++ {\n    defer fmt.Print(i)\n}", output: "210", why: "Deferred calls run in LIFO order, and their arguments are evaluated when defer executes.", whyRU: "Отложенные вызовы выполняются в обратном порядке, а их аргументы вычисляются в момент выполнения defer." },
    { id: "p5", code: "func f() (x int) {\n    defer func() { x++ }()\n    return 1\n}\n\nfunc main() {\n    fmt.Println(f())\n}", output: "2", why: "return 1 assigns to the named result x first, then the deferred function increments it.", whyRU: "return 1 сначала присваивает значение именованному результату x, затем отложенная функция его увеличивает." },
    { id: "p6", code: "type E struct{}\n\nfunc (*E) Error() string { return \"e\" }\n\nfunc g() error {\n    var p *E\n    return p\n}\n\nfunc main() {\n    fmt.Println(g() == nil)\n}", output: "false", why: "The interface holds the type *E with a nil value, so the interface itself isn't nil.", whyRU: "В интерфейсе лежит тип *E с нулевым указателем, поэтому сам интерфейс не равен nil." },
    { id: "p7", code: "type P struct{ v int }\nps := []P{{1}, {2}}\nfor _, p := range ps {\n    p.v = 10\n}\nfmt.Println(ps)", output: "[{1} {2}]", why: "The range variable is a copy of each element; to modify the slice, use the index.", whyRU: "Переменная range — копия элемента; чтобы изменить срез, нужно обращаться по индексу." },
    { id: "p8", code: "s := \"héllo\"\nfmt.Println(len(s), s[1], len([]rune(s)))", output: "6 195 5", why: "len counts bytes; the precomposed é (U+00E9) takes two bytes in UTF-8, s[1] is its first byte 0xC3 = 195; there are five runes.", whyRU: "len считает байты; é (готовый, предкомпонованный символ U+00E9) занимает в UTF-8 два байта, s[1] — первый из них, 0xC3 = 195; рун пять." },
    { id: "p9", code: "var fs []func()\nfor i := 0; i < 3; i++ {\n    fs = append(fs, func() { fmt.Print(i) })\n}\nfor _, f := range fs {\n    f()\n}", output: "012", why: "Since Go 1.22 each loop iteration has its own variable. With language version below 1.22 in go.mod (or -lang=go1.21) all closures share one variable and print 333.", whyRU: "С Go 1.22 у каждой итерации своя переменная. Если версия языка в go.mod ниже 1.22 (или сборка с -gcflags=-lang=go1.21), все замыкания разделяют одну переменную и печатают 333.", version: "Зависит от версии языка модуля, а не только от установленного toolchain" },
    { id: "p10", code: "a := [3]int{1, 2, 3}\nb := a\nb[0] = 100\nfmt.Println(a[0])", output: "1", why: "Arrays are values in Go, so assignment copies the whole array, unlike a slice.", whyRU: "Массивы в Go — значения: присваивание копирует весь массив, в отличие от среза." }
  ]
};
