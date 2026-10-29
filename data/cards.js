const CARDS = [
  // ==========================================
  // МОДУЛЬ 1: ГОРУТИНЫ, СТЕК И РЕГИСТРЫ CPU (Q1 - Q6)
  // ==========================================
  {
    "id": "c1",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim1",
    "qEN": "What is a goroutine, and how does it differ from an OS thread?",
    "qRU": "Что такое горутина и чем она отличается от потока ОС?",
    "shortEN": "A goroutine is a function running concurrently, scheduled by the Go runtime instead of the OS. The runtime multiplexes many goroutines onto a few OS threads (M:N), and switching between them needs no system call. A goroutine starts with a 2 KiB stack that grows on demand, while a thread usually reserves megabytes. The go statement returns nothing, no ID and no handle, so every goroutine needs an owner and a way to finish.",
    "anchorsEN": [
      "go f() → no ID, no handle",
      "M:N: many Gs on a few threads",
      "2 KiB stack → grows on demand",
      "user-space switch, no syscall"
    ],
    "jvmEN": "Unlike a Java platform thread, a goroutine is not an OS thread and there is no Thread object to join or interrupt. Like a Java virtual thread, it blocks like ordinary code; unlike a Kotlin coroutine, it needs no suspend functions; and unlike both, the runtime can preempt it in the middle of a loop.",
    "detailsEN": [
      "Concurrency does not require simultaneous execution. GOMAXPROCS limits how many OS threads can execute user Go code at once; it is not the total number of goroutines or threads.",
      "A new goroutine gets the minimum stack, 2 KiB on Linux/amd64; a reused one may start larger, sized from the average stack use the GC observed. A goroutine also has a descriptor (runtime.g) and can keep heap objects alive, so count × 2 KiB is not a memory estimate.",
      "A thread’s reserved stack, its committed memory and RSS are different numbers. Switch costs depend on the machine and the workload: measure them instead of quoting nanoseconds.",
      "The go statement returns nothing: no ID, no handle, no result. Wait for completion with a WaitGroup, an errgroup or a channel, and give each goroutine an owner and a way to finish. The runtime numbers goroutines internally (the number shows in stack traces), but the language deliberately does not expose it. Returning from main does not wait for other goroutines."
    ],
    "practicalRU": "На сервере отдельно ограничивай выполняемую работу и очередь запросов. Припаркованная горутина не расходует CPU на само ожидание, но её стек и достижимые данные запроса продолжают занимать память.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tfmt.Println(\"work finished\")\n\t\tclose(done)\n\t}()\n\t<-done // Wait for completion; a Sleep would not establish this ordering.\n}",
    "shortRU": "Горутина — это функция, которая выполняется конкурентно и которую планирует рантайм Go, а не ОС. Рантайм распределяет много горутин по нескольким потокам ОС (M:N), и переключение между ними не требует системного вызова. Горутина стартует со стеком 2 КиБ, который растёт по мере надобности, а поток обычно резервирует мегабайты. Оператор go ничего не возвращает — ни ID, ни дескриптора, — поэтому у каждой горутины должен быть владелец и путь завершения.",
    "jvmRU": "В отличие от платформенного потока Java, горутина — не поток ОС, и у неё нет объекта Thread, который можно join или interrupt. Как виртуальный поток Java, она блокируется как обычный код; в отличие от корутины Kotlin, ей не нужны suspend-функции; а в отличие от обоих, рантайм может вытеснить её посреди цикла.",
    "detailsRU": [
      "Конкурентность не требует одновременного исполнения. GOMAXPROCS ограничивает число потоков ОС, одновременно исполняющих пользовательский Go-код; это не общее число горутин или потоков.",
      "Новая горутина получает минимальный стек — 2 КиБ на Linux/amd64; переиспользованная может начать с большего, по среднему использованию стека, которое видел GC. Кроме того, у горутины есть дескриптор (runtime.g), а её ссылки удерживают объекты кучи, поэтому число горутин × 2 КиБ — не оценка памяти.",
      "Резерв адресного пространства под стек потока, выделенная физическая память и RSS — разные величины. Цена переключения зависит от машины и нагрузки: её измеряют, а не заучивают в наносекундах.",
      "Оператор go ничего не возвращает: ни ID, ни дескриптора, ни результата. Дождаться горутину можно через WaitGroup, errgroup или канал; у каждой горутины должен быть владелец и путь завершения. Внутренний номер у горутины есть (виден в трассах стека), но язык намеренно его не отдаёт. Возврат из main не ждёт остальные горутины."
    ],
    "versionNote": "Семантика go применима к 1.17/1.25/1.26. Размеры и распределение стеков — детали runtime; источники реализации здесь Go 1.26.1.",
    "sources": [
      {
        "title": "Go specification: go statements",
        "url": "https://go.dev/ref/spec#Go_statements"
      },
      {
        "title": "go1.26.1: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      },
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.26.1: runtime/debug.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/debug.go"
      },
      {
        "title": "Go FAQ: Why is there no goroutine ID?",
        "url": "https://go.dev/doc/faq#no_goroutine_id"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "One hundred thousand goroutines are waiting on channels. What do you need besides that count to estimate memory use?",
      "promptRU": "Сто тысяч горутин ждут на каналах. Что нужно знать кроме этого числа, чтобы оценить память?",
      "pointsEN": [
        "Allocated stacks, descriptors, retained data and other runtime/process memory; the count alone does not determine RSS.",
        "Waiting does not imply leaking. Check ownership, a reachable completion path and whether the population keeps growing."
      ],
      "pointsRU": [
        "Выделенные стеки, дескрипторы, удерживаемые данные и остальная память рантайма и процесса; одно число не определяет RSS.",
        "Ожидание само по себе не означает утечку. Проверь владельца, достижимый путь завершения и рост числа горутин."
      ],
      "followUpEN": "What changes if each waiter retains a 1 MiB request body?",
      "followUpRU": "Что изменится, если каждый ожидающий удерживает тело запроса размером 1 МиБ?"
    }
  },
  {
    "id": "c2",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "Can a program have a race condition without a data race?",
    "qRU": "Может ли в программе быть логическая гонка без гонки данных?",
    "shortEN": "Yes: a program can be free of data races and still have a race condition. A data race is unsynchronized access to the same memory with at least one write; a race condition is a logic bug that depends on timing. If each read and write is locked separately, “check the balance, then withdraw” can still let two withdrawals pass. The fix is one lock around both the check and the action.",
    "anchorsEN": [
      "data race = no sync + one write",
      "race condition = timing-dependent logic",
      "check-then-act → one critical section",
      "-race finds data races, not logic bugs"
    ],
    "jvmEN": "Same as in Java: synchronized getters and setters make each call safe but not a check-then-act sequence. You need one lock around both steps, or a compare-and-set loop, just like with AtomicLong.",
    "shortRU": "Да: в программе может не быть гонок данных и всё же быть логическая гонка. Гонка данных — несинхронизированный доступ к одной памяти, когда хотя бы одна операция пишет; логическая гонка — ошибка, зависящая от порядка событий. Если каждое чтение и запись защищены отдельно, «проверить баланс, потом списать» всё равно может пропустить два списания. Исправление — одна блокировка и на проверку, и на действие.",
    "jvmRU": "Так же, как в Java: synchronized-геттеры и сеттеры делают безопасным каждый вызов, но не пару «проверить и изменить». Нужна одна блокировка на оба шага или цикл compare-and-set, как с AtomicLong.",
    "detailsEN": [
      "Synchronization must protect the invariant, not just each field access. A balance check and the matching withdrawal must form one operation; a suitable atomic compare-and-swap loop is another possible design.",
      "The race detector observes executed, instrumented paths. A clean go test -race run is useful evidence, not a proof that every possible execution is safe; it does not diagnose all logical races.",
      "An invalid-memory-address panic does not by itself prove a data race. The runtime detects some conflicting map operations, but its map checks are not a substitute for synchronization or the race detector."
    ],
    "detailsRU": [
      "Синхронизация должна защищать инвариант, а не только отдельные обращения к полю. Проверка баланса и соответствующее списание должны быть одной операцией; подходящий цикл compare-and-swap — другой возможный вариант.",
      "Детектор гонок наблюдает выполненные инструментированные пути. Успешный go test -race полезен, но не доказывает безопасность всех возможных исполнений и не выявляет все логические гонки.",
      "Panic с invalid memory address сам по себе не доказывает гонку данных. Рантайм обнаруживает некоторые конфликтующие операции с map, но его проверки не заменяют синхронизацию и детектор гонок."
    ],
    "practicalRU": "При ревью спроси: «Какое условие должно оставаться истинным между проверкой и изменением?» Затем проверь, что одна блокировка или другая согласованная операция охватывает весь этот участок. Для теста логической гонки можно явно организовать порядок событий через каналы, не полагаясь на Sleep.",
    "versionNote": "Различие гонки данных и логической гонки применимо к Go 1.17, 1.25 и 1.26. Возможности -race зависят также от платформы и реально выполненных путей.",
    "sources": [
      {
        "title": "Go memory model",
        "url": "https://go.dev/ref/mem"
      },
      {
        "title": "Go race detector",
        "url": "https://go.dev/doc/articles/race_detector"
      }
    ],
    "practice": {
      "kind": "Объясни причину",
      "promptEN": "Two calls to Spend read balance=100 under a mutex, unlock, and each later writes 20 under the same mutex. Both report a successful withdrawal of 80. Is this a data race? What went wrong?",
      "promptRU": "Два вызова Spend читают balance=100 под мьютексом, отпускают его и позже каждый записывает 20 под тем же мьютексом. Оба сообщают об успешном списании 80. Это гонка данных? В чём ошибка?",
      "pointsEN": [
        "If every access uses the same mutex, there is no data race on balance in this scenario.",
        "The check and update are separated: both withdrawals succeed although only one can be afforded.",
        "Protect the whole check-and-update operation. A clean race-detector result does not establish that invariant."
      ],
      "pointsRU": [
        "Если каждое обращение использует один и тот же мьютекс, в этом сценарии нет гонки данных на balance.",
        "Проверка и изменение разделены: оба списания успешны, хотя денег достаточно только на одно.",
        "Защити всю проверку вместе с изменением. Успешный запуск детектора гонок не доказывает этот инвариант."
      ],
      "followUpEN": "How would you force that ordering in a test without Sleep?",
      "followUpRU": "Как организовать именно такой порядок в тесте без Sleep?"
    },
    "code": "// Pseudocode: Get and Set each lock internally.\n// The whole check-and-set is still not atomic.\nif cache.Get(key) == nil {\n    cache.Set(key, value)\n}\n// Design one operation, e.g. LoadOrStore, around the required invariant.",
    "quizIds": [
      "q12",
      "q13"
    ]
  },
  {
    "id": "c3",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim1",
    "qEN": "What happens when Go starts a goroutine?",
    "qRU": "Что происходит при запуске горутины?",
    "shortEN": "go f(x) evaluates f and x in the calling goroutine, and the call itself runs in a new goroutine. On the system stack g0, newproc reuses a dead G or allocates one with a 2 KiB stack, points g.sched at f and pushes goexit as a fake return address. Then it puts the G into runnext of the current P and wakes an idle P: the goroutine is runnable, not yet running.",
    "anchorsEN": [
      "arguments evaluated in the caller",
      "newproc on g0 → reuse or 2 KiB",
      "g.sched → f; goexit on the stack",
      "runnext + wakep → runnable ≠ running"
    ],
    "jvmEN": "Unlike new Thread(r).start() in Java, there is no object to keep: go returns nothing. The arguments are copied at the go statement, but a closure, unlike a Java lambda that captures effectively final values, captures the variables themselves.",
    "detailsEN": [
      "newproc uses the system stack g0. newproc1 obtains a dead G from gfget or creates one; stack allocation or reuse depends on the available G and the current stack policy. Reuse is not a promise of zero allocations. A newly created G gets the minimum stack (2 KiB on Linux); since Go 1.19 a reused G can instead get a starting size based on average stack usage recalculated at each GC (GODEBUG adaptivestackstart, on by default).",
      "The runtime initializes the saved SP and PC, keeps the closure in g.sched.ctxt and, on amd64, pushes goexit onto the new stack as the return address. These are data for a future execution, not the CPU registers of an already running goroutine.",
      "newproc requests runnext placement with runqput(..., true), but runtime conditions can choose an ordinary queue. A scheduler later transitions the G from runnable to running. The language promises neither immediate execution nor FIFO launch order.",
      "The runtime has internal goroutine IDs, but the language exposes no goroutine handle, public current-ID API or operation to kill another goroutine. Use explicit request IDs, cancellation and completion signals; do not parse stack dumps as an identity API."
    ],
    "practicalRU": "Передавай значения явно, если работнику нужен снимок состояния. Замыкание, которое позже читает изменяемое общее состояние, имеет другую семантику и может создать гонку.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvalues := make(chan int)\n\tn := 1\n\tgo func(value int) { values <- value }(n)\n\tn = 2\n\tfmt.Println(<-values, n) // 1 2; no timing assumption.\n}",
    "shortRU": "go f(x) вычисляет f и x в вызывающей горутине, а сам вызов выполняет новая горутина. На системном стеке g0 newproc берёт завершившуюся G или создаёт новую со стеком 2 КиБ, направляет g.sched на f и кладёт goexit как поддельный адрес возврата. Затем ставит G в runnext текущего P и будит простаивающий P: горутина готова к запуску, но ещё не выполняется.",
    "jvmRU": "В отличие от new Thread(r).start() в Java, хранить нечего: go ничего не возвращает. Аргументы копируются в момент оператора go, а замыкание, в отличие от лямбды Java с effectively final значениями, захватывает сами переменные.",
    "detailsRU": [
      "newproc использует системный стек g0. newproc1 получает завершённую G через gfget или создаёт новую; выделение либо переиспользование стека зависит от найденной G и текущей политики. Переиспользование не обещает ноль выделений. Новая структура G получает минимальный стек (2 КиБ в Linux); с Go 1.19 переиспользуемая G может получить стартовый размер по среднему использованию стека, которое пересчитывается на каждом GC (GODEBUG adaptivestackstart, включён по умолчанию).",
      "Рантайм инициализирует сохранённые SP и PC, кладёт замыкание в g.sched.ctxt, а на amd64 записывает goexit на новый стек как адрес возврата. Это данные будущего исполнения, а не регистры CPU уже работающей горутины.",
      "newproc запрашивает размещение в runnext через runqput(..., true), но условия рантайма могут привести к обычной очереди. Позже планировщик переводит G из runnable в running. Язык не обещает немедленного исполнения или порядка запуска FIFO.",
      "У рантайма есть внутренние ID горутин, но язык не предоставляет дескриптор горутины, публичный API текущего ID или операцию убийства другой горутины. Используй явные ID запросов, отмену и сигналы завершения; разбор stack dump не заменяет API идентификации."
    ],
    "versionNote": "Порядок вычисления go — гарантия языка во всех рассматриваемых версиях. newproc1/gfget/runnext — Go 1.26.1; сигнатуры внутренних функций не являются API. В Go 1.17 нет современной startingStackSize-политики.",
    "sources": [
      {
        "title": "Go specification: go statements",
        "url": "https://go.dev/ref/spec#Go_statements"
      },
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.26.1: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      },
      {
        "title": "go1.17: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/proc.go"
      },
      {
        "title": "Go 1.19 Release Notes: runtime",
        "url": "https://go.dev/doc/go1.19#runtime"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "Why does this program send 1 even if the worker starts after n becomes 2?",
      "promptRU": "Почему программа отправляет 1, даже если работник запустился после присваивания n = 2?",
      "pointsEN": [
        "The argument n is evaluated by the caller before the new goroutine executes the function body.",
        "The worker receives its own int parameter. The receive also keeps main alive until the value is delivered."
      ],
      "pointsRU": [
        "Аргумент n вычисляется вызывающей горутиной до исполнения тела новой горутиной.",
        "Работник получает собственный параметр int. Приём также удерживает main до передачи значения."
      ],
      "followUpEN": "What if the worker instead closes over n and reads it without synchronization?",
      "followUpRU": "Что будет, если работник захватит n замыканием и прочитает без синхронизации?"
    }
  },
  {
    "id": "c4",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim1",
    "qEN": "Where is a goroutine stack allocated, and what does StackInuse measure?",
    "qRU": "Где выделяется стек горутины и что измеряет StackInuse?",
    "shortEN": "A goroutine stack lives in memory the runtime takes from its heap pages, but a separate stack allocator manages it, not mallocgc and the GC sweep. Small stacks come from per-P stack caches and per-size free lists; large ones get their own spans; when a stack grows, the runtime copies it to a bigger block, so it can move. MemStats.StackInuse counts bytes in those stack spans, not the bytes your local variables use right now.",
    "anchorsEN": [
      "stackalloc, not mallocgc",
      "per-P stack cache → free lists → own span",
      "grows by copying, can move",
      "StackInuse = stack spans, not locals"
    ],
    "jvmEN": "In Java a platform thread’s stack is native memory with a fixed maximum set by -Xss, and it never moves. A goroutine stack starts tiny, grows and moves, which is why a Go program can afford hundreds of thousands of goroutines.",
    "detailsEN": [
      "Small stacks come from per-P caches and per-size free lists; larger stacks use dedicated spans. Saying “the stack is in the heap” hides the difference from ordinary heap-object allocation through mallocgc.",
      "On amd64, RSP points into the currently active stack. The saved g.sched.sp is a resume position, while g.stack.lo/hi describe the allocated region. A register contains an address, not the stack itself.",
      "Unused stack spans can return to the heap. Shrinking a stack, freeing a span and returning physical pages to the OS are different events; none promises an immediate matching RSS drop.",
      "StackSys includes stack memory obtained for the runtime, including some OS-thread stacks, but it does not account for every C stack. ReadMemStats gives process-wide runtime counters, not a per-goroutine allocation report."
    ],
    "practicalRU": "Сравнивай динамику на характерной нагрузке, а в профиле горутин ищи владельцев и места ожидания. Разность двух снимков нельзя называть универсальной ценой одной горутины.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\nfunc main() {\n\tvar stats runtime.MemStats\n\truntime.ReadMemStats(&stats)\n\t// Values depend on the process and workload; these are not RSS or live frames.\n\tfmt.Println(\"stack spans:\", stats.StackInuse, \"bytes\")\n\tfmt.Println(\"goroutines:\", runtime.NumGoroutine())\n}",
    "shortRU": "Стек горутины лежит в памяти, которую рантайм берёт из страниц кучи, но управляет им отдельный аллокатор стеков, а не mallocgc и sweep сборщика. Малые стеки берутся из кешей стеков на P и списков свободных стеков по размерам, большие получают свои спаны; при росте рантайм копирует стек в больший блок, поэтому стек может переехать. MemStats.StackInuse считает байты в этих спанах стеков, а не то, сколько сейчас занимают локальные переменные.",
    "jvmRU": "В Java стек платформенного потока — нативная память с фиксированным максимумом из -Xss, и он никогда не переезжает. Стек горутины начинается маленьким, растёт и переезжает — поэтому программа на Go может позволить себе сотни тысяч горутин.",
    "detailsRU": [
      "Небольшие стеки берутся из кешей P и списков свободных стеков по размерам; более крупные получают отдельные спаны. Фраза «стек лежит в куче» скрывает отличие от выделения обычного объекта через mallocgc.",
      "На amd64 RSP указывает внутрь активного стека. Сохранённый g.sched.sp задаёт позицию продолжения, а g.stack.lo/hi описывают выделенную область. В регистре хранится адрес, а не сам стек.",
      "Неиспользуемые спаны стеков могут вернуться в кучу. Уменьшение стека, освобождение спана и возврат физических страниц ОС — разные события; ни одно не обещает немедленного соответствующего падения RSS.",
      "StackSys включает полученную рантаймом память стеков, в том числе некоторые стеки потоков ОС, но не учитывает каждый стек C. ReadMemStats выдаёт общие счётчики рантайма, а не отчёт о выделениях отдельной горутины."
    ],
    "versionNote": "Поля MemStats — публичная документация; устройство stack spans и кешей проверено по Go 1.26.1. Счётчики не эквивалентны RSS ни в Go 1.17, ни в 1.25/1.26.",
    "sources": [
      {
        "title": "go1.26.1: runtime/mstats.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mstats.go"
      },
      {
        "title": "go1.26.1: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      },
      {
        "title": "go1.26.1: runtime/runtime2.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/runtime2.go"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "StackInuse is unchanged after a function returns. What can explain that, and what would actually indicate a leak?",
      "promptRU": "StackInuse не изменился после возврата из функции. Чем это можно объяснить и что на самом деле указывало бы на утечку?",
      "pointsEN": [
        "The goroutine may retain allocated stack capacity, and the runtime can cache stack storage; an unchanged value alone proves no leak.",
        "Inspect repeated growth, ownership and reachability. Stack capacity, live frames and RSS answer different questions."
      ],
      "pointsRU": [
        "У горутины может сохраниться ёмкость стека, а рантайм может кешировать память стеков; неизменное значение само по себе утечку не доказывает.",
        "Проверь повторяющийся рост, владение и достижимость. Ёмкость стека, живые кадры и RSS отвечают на разные вопросы."
      ],
      "followUpEN": "Which additional evidence would distinguish retained capacity from unbounded live goroutines?",
      "followUpRU": "Какие дополнительные данные отличат сохранённую ёмкость от неограниченного роста числа живых горутин?"
    }
  },
  {
    "id": "c5",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim1",
    "qEN": "How does a goroutine stack grow, and why do pointers remain valid?",
    "qRU": "Как растёт стек горутины и почему указатели остаются корректными?",
    "shortEN": "When a function’s frame does not fit, its prologue calls morestack, and newstack allocates a stack twice as big, copies the frames and fixes the pointers into the old stack using the compiler’s stack maps. Pointers stay valid because user heap objects and globals never point into a stack; besides the frames, the runtime fixes only its own records, such as channel wait records and defer records. Beyond 1 GB on 64-bit systems, the program dies with a fatal stack overflow.",
    "anchorsEN": [
      "prologue: SP vs stackguard0",
      "morestack → newstack → copy ×2",
      "stack maps fix the frames",
      "+ runtime records: sudog, defer, panic"
    ],
    "jvmEN": "A Java platform thread stack cannot grow past -Xss: deep recursion ends with StackOverflowError, 1 MiB by default on 64-bit Linux. In Go the same recursion keeps working, because the stack doubles by copying, until the 1 GB limit, and then the program dies instead of throwing an error you can catch.",
    "detailsEN": [
      "Stack checks lead through morestack/newstack on the growth path. Not every function has the same prologue: small leaf functions and nosplit code have special rules. A tripped guard can also request preemption, not just allocation.",
      "For normal growth, Go 1.26.1 starts with twice the old size and can double again until the needed frame fits. copystack relocates active frames and uses pointer maps to fix references; channel-related references require coordinated updates too.",
      "Shrinking is a separate operation at safe points. The GC can halve a stack when usage including a safety allowance is below one quarter, subject to minimum size and safety checks. Returning from a call does not itself guarantee shrinking.",
      "The default per-goroutine growth limit is 1 GB on 64-bit systems and 250 MB on 32-bit systems; because sizes double, the largest stack under the 64-bit default is 512 MiB; debug.SetMaxStack changes the limit for future growth. Exceeding it crashes the program. A uintptr is an integer, not a GC-tracked pointer you may keep across arbitrary operations."
    ],
    "practicalRU": "Используй обычные указатели и ограничивай глубину рекурсии. Если в профиле заметно копирование стеков, сначала изучи глубину вызовов и крупные кадры; worker pool не является универсальным лечением роста стека.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc descend(depth int, value *int) int {\n\tvar frame [1024]byte\n\tframe[0] = byte(depth)\n\tif depth == 0 {\n\t\t*value = 42\n\t\treturn 0\n\t}\n\tsum := descend(depth-1, value)\n\treturn sum + int(frame[0]) // Keep frame data live across the call.\n}\n\nfunc main() {\n\tvalue := 0\n\tsum := descend(64, &value)\n\tfmt.Println(value, sum) // 42 2080; not a measurement of stack addresses.\n}",
    "shortRU": "Когда кадр функции не помещается, её пролог вызывает morestack, а newstack выделяет стек вдвое больше, копирует кадры и исправляет указатели на старый стек по картам стека от компилятора. Указатели остаются верными, потому что объекты кучи из пользовательского кода и глобальные переменные никогда не указывают в стек; кроме кадров рантайм исправляет лишь свои записи — например, записи ожидания каналов и записи defer. За пределом 1 ГБ на 64-битных системах программа погибает с фатальной ошибкой stack overflow.",
    "jvmRU": "Стек платформенного потока Java не растёт дальше -Xss: глубокая рекурсия заканчивается StackOverflowError, по умолчанию на 1 МиБ на 64-битном Linux. В Go та же рекурсия продолжает работать — стек удваивается копированием — до предела в 1 ГБ, а потом программа погибает, а не бросает ошибку, которую можно поймать.",
    "detailsRU": [
      "Путь роста проходит через morestack/newstack. Не у каждой функции одинаковый пролог: у небольших листовых функций и nosplit-кода особые правила. Срабатывание guard может также означать запрос вытеснения, а не только выделение памяти.",
      "Для обычного роста Go 1.26.1 начинает с удвоенного размера и при необходимости удваивает снова, чтобы вместить нужный кадр. copystack переносит активные кадры и исправляет ссылки по картам указателей; ссылки, связанные с каналами, тоже требуют согласованного обновления.",
      "Уменьшение — отдельная операция в безопасных точках. GC может уменьшить стек вдвое, если использование с защитным запасом меньше четверти, с учётом минимального размера и проверок безопасности. Сам возврат из вызова не гарантирует уменьшения.",
      "Стандартный предел роста одной горутины — 1 ГБ на 64-битных системах и 250 МБ на 32-битных; так как размер удваивается, наибольший стек при 64-битном пределе — 512 МиБ; debug.SetMaxStack меняет предел будущего роста. Превышение аварийно завершает программу. uintptr — целое число, а не отслеживаемый GC указатель, который можно сохранять через произвольные операции."
    ],
    "versionNote": "Копируемые стеки есть в 1.17/1.25/1.26. Конкретные пороги, карты и алгоритм описаны по Go 1.26.1; тест результата не доказывает конкретный момент перемещения стека.",
    "sources": [
      {
        "title": "go1.26.1: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      },
      {
        "title": "go1.26.1: runtime/debug/garbage.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/debug/garbage.go"
      },
      {
        "title": "unsafe.Pointer: conversion rules",
        "url": "https://pkg.go.dev/unsafe#Pointer"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "A pointer refers to a caller’s local variable while deeper calls grow the stack. Who keeps that pointer valid, and what must application code avoid?",
      "promptRU": "Указатель ссылается на локальную переменную вызывающего, пока вложенные вызовы наращивают стек. Кто сохраняет корректность этого указателя и чего должен избегать код приложения?",
      "pointsEN": [
        "The runtime and compiler: they preserve ordinary Go pointer semantics, including during stack relocation.",
        "Do not replace the pointer with a stored uintptr and assume the same safety. Do not infer physical placement from correct output alone."
      ],
      "pointsRU": [
        "Рантайм и компилятор: они сохраняют семантику обычных Go-указателей, в том числе при переносе стека.",
        "Нельзя заменить указатель сохранённым uintptr и рассчитывать на ту же безопасность. По одному правильному результату нельзя установить физическое размещение."
      ],
      "followUpEN": "If recursion is unbounded, does automatic growth make the algorithm safe?",
      "followUpRU": "Если рекурсия не ограничена, делает ли автоматический рост алгоритм безопасным?"
    }
  },
  {
    "id": "c6",
    "mod": "m1",
    "modName": "1. Goroutines & Stack",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim1",
    "qEN": "What must the runtime restore to resume a goroutine?",
    "qRU": "Что runtime восстанавливает, чтобы продолжить выполнение горутины?",
    "shortEN": "Three things: which goroutine is current, where its stack is, and where to continue. On amd64 gogo writes the G into thread-local storage and R14, restores RSP and BP, and jumps to the saved PC; these values plus the closure context are kept in g.sched, a gobuf. Switching goes through g0, the system stack of each thread: mcall saves the running goroutine and calls the scheduler on g0, and gogo loads the next one.",
    "anchorsEN": [
      "who: R14 = current G",
      "which stack: RSP",
      "where to continue: saved PC → JMP",
      "g.sched; mcall → g0 → gogo"
    ],
    "jvmEN": "A Java platform thread switch is done by the kernel; a goroutine switch is a user-space jump that saves a few values in g.sched, with no system call. That is why blocking a goroutine on a channel is cheap.",
    "shortRU": "Три вещи: какая горутина текущая, где её стек и откуда продолжить. На amd64 gogo записывает G в локальное хранилище потока и в R14, восстанавливает RSP и BP и прыгает на сохранённый PC; эти значения вместе с контекстом замыкания хранятся в g.sched (структура gobuf). Переключение идёт через g0 — системный стек каждого потока: mcall сохраняет текущую горутину и вызывает планировщик на g0, а gogo загружает следующую.",
    "jvmRU": "Переключение платформенных потоков Java делает ядро; переключение горутин — прыжок в пространстве пользователя, который сохраняет несколько значений в g.sched, без системного вызова. Поэтому заблокировать горутину на канале дёшево.",
    "detailsEN": [
      "A register is a small CPU storage location used during execution. RSP is an address, not the stack itself; R14 is a pointer to Go runtime metadata, not the whole goroutine. RIP changes as instructions and control transfers execute.",
      "Each M has a g0 used for system-stack work. On amd64, gogo installs the current G, restores SP, BP and closure context, clears selected saved fields, and jumps to the saved PC. It is not a fixed four-instruction operation.",
      "mcall saves the caller’s continuation and switches to g0 to call a runtime function. g.sched is saved continuation state, not a dump of every CPU register. Switching goroutines is distinct from an OS thread context switch. So few saved values are enough because a voluntary switch happens at a call, where Go’s ABI keeps nothing in callee-saved registers; asynchronous preemption first saves every register on the goroutine’s stack.",
      "Register names and conventions are architecture-dependent. This diagram uses amd64; on arm64 Go uses R28 for the current G. Neither the g0 stack nor every goroutine stack has one universally fixed size."
    ],
    "detailsRU": [
      "Регистр — небольшое хранилище процессора, используемое при выполнении. RSP содержит адрес, а не сам стек; R14 — указатель на данные runtime, а не всю горутину. RIP меняется при выполнении инструкций и переходов.",
      "У каждого M есть g0 для работы на системном стеке. На amd64 gogo устанавливает текущую G, восстанавливает SP, BP и контекст замыкания, очищает часть сохранённых полей и переходит к сохранённому PC. Это не операция ровно из четырёх инструкций.",
      "mcall сохраняет место продолжения вызывающей стороны и переключается на g0 для вызова функции runtime. g.sched — сохранённое состояние продолжения, а не снимок всех регистров CPU. Переключение горутин отличается от переключения потоков ОС. Немногих сохранённых значений хватает, потому что добровольное переключение происходит на вызове, где ABI Go ничего не держит в регистрах, сохраняемых вызываемой функцией; при асинхронном вытеснении все регистры сначала сохраняются на стеке горутины.",
      "Имена регистров и соглашения зависят от архитектуры. Эта схема — про amd64; на arm64 Go использует R28 для текущей G. Размер стека g0 и каждой пользовательской горутины не является одной универсальной константой."
    ],
    "practicalRU": "Опора для памяти: «кто выполняется — где стек — откуда продолжить». Для amd64 это R14, RSP и сохранённый PC с переходом в RIP. По одному кадру systemstack или mcall нельзя установить причину сбоя: нужен стек вызовов и контекст.",
    "versionNote": "Схема runtime/ABI для Go 1.26.1, amd64; сравнение роли текущей G на arm64. ABIInternal может меняться. Условные адреса и сокращённые действия не являются готовым ассемблером или обещанием времени переключения.",
    "sources": [
      {
        "title": "Go 1.26.1: internal ABI",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/abi-internal.md"
      },
      {
        "title": "Go 1.26.1: gogo / mcall on amd64",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/asm_amd64.s"
      },
      {
        "title": "Go 1.26.1: scheduler",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      }
    ],
    "practice": {
      "kind": "Объясни без ассемблера",
      "promptEN": "The scheduler selects another goroutine. Why is changing only the instruction address insufficient?",
      "promptRU": "Планировщик выбрал другую горутину. Почему недостаточно поменять только адрес инструкции?",
      "pointsEN": [
        "The code must use the selected goroutine’s stack and continuation state.",
        "Go must also know which G is current; on this amd64 path that includes R14.",
        "The actual runtime restores more state than these three memory cues describe."
      ],
      "pointsRU": [
        "Код должен использовать стек и сохранённое состояние выбранной горутины.",
        "Go также должен знать текущую G; в этом amd64-пути для неё используется R14.",
        "Реальный runtime восстанавливает больше состояния, чем описывают три опорных вопроса."
      ],
      "followUpEN": "Is the numeric value in RSP the size of the stack, or an address within it?",
      "followUpRU": "Число в RSP — размер стека или адрес внутри него?"
    },
    "code": "// Conceptual amd64 continuation, not executable assembly.\ncurrentG = saved.g\nstackPointer = saved.sp\nframePointer = saved.bp\nclosureContext = saved.ctxt\njumpTo(saved.pc)\n// The real runtime also updates TLS and clears selected saved fields."
  },

  // ==========================================
  // МОДУЛЬ 2: ПЛАНИРОВЩИК GMP, ВЫТЕСНЕНИЕ И WORK STEALING (Q7 - Q12)
  // ==========================================
  {
    "id": "c7",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim2",
    "qEN": "How do G, M and P relate to GOMAXPROCS?",
    "qRU": "Как G, M и P связаны с GOMAXPROCS?",
    "shortEN": "GOMAXPROCS is the number of Ps, and a P is the right to run Go code. A goroutine (G) runs on an OS thread (M) only while that thread holds a P, so at most GOMAXPROCS goroutines execute Go code at the same moment. Threads can outnumber Ps, for example when they are blocked in system calls or cgo. Since Go 1.25 the default on Linux also respects the container’s CPU limit.",
    "anchorsEN": [
      "G goroutine · M thread · P right to run Go",
      "GOMAXPROCS = number of Ps",
      "threads > Ps: syscalls, cgo",
      "Go 1.25+: container CPU limit"
    ],
    "jvmEN": "Unlike a Java thread-pool size, GOMAXPROCS limits neither the number of goroutines nor the number of threads; it limits parallel Go execution. It is closer to the parallelism of the ForkJoinPool that carries Java virtual threads.",
    "detailsEN": [
      "A P is a runtime object, not a physical CPU or a permanently pinned core. The OS schedules Ms on available CPUs. In the phrase “M:N scheduling”, M and N are generic counts, not the runtime type names.",
      "Each P has a local runnable queue and a separate runnext slot. The global run queue, polling, timers and work stealing help distribute work. More runnable goroutines do not automatically create more parallel Go execution.",
      "Go 1.25 introduced container-aware GOMAXPROCS defaults and periodic updates. On Linux the policy considers CPU affinity and cgroup quota as well as logical CPUs. Explicit environment or runtime.GOMAXPROCS settings disable automatic updates; compatibility settings and the module language version matter.",
      "GOMAXPROCS is not an application concurrency limit. Database pools, remote-service limits and request backpressure need their own budgets. With GOMAXPROCS=1, interleavings and data races are still possible."
    ],
    "practicalRU": "Начни со стандартной настройки рантайма, наблюдай throttling и задержки и подбирай значение на реальной нагрузке. Число 2 или количество CPU хоста не является универсальным рецептом для контейнера.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\nfunc main() {\n\t// A non-positive argument queries the setting without changing it.\n\tfmt.Println(\"parallel Go execution limit:\", runtime.GOMAXPROCS(0))\n\t// This is not the number of threads or an external-service concurrency limit.\n}",
    "shortRU": "GOMAXPROCS — это число P, а P — право исполнять Go-код. Горутина (G) работает на потоке ОС (M), только пока этот поток держит P, поэтому одновременно Go-код исполняют не больше GOMAXPROCS горутин. Потоков может быть больше, чем P: например, когда они заблокированы в системных вызовах или в cgo. С Go 1.25 значение по умолчанию на Linux учитывает и лимит CPU контейнера.",
    "jvmRU": "В отличие от размера пула потоков в Java, GOMAXPROCS не ограничивает ни число горутин, ни число потоков — только параллельное исполнение Go-кода. Это ближе к параллелизму ForkJoinPool, на котором работают виртуальные потоки Java.",
    "detailsRU": [
      "P — объект рантайма, а не физический CPU или навсегда закреплённое ядро. ОС распределяет M по доступным CPU. В выражении «планирование M:N» буквы M и N обозначают количества, а не имена типов рантайма.",
      "У каждого P есть локальная очередь готовых горутин и отдельный слот runnext. Глобальная очередь, опрос событий, таймеры и перехват работы помогают распределять нагрузку. Больше готовых горутин не означает больше параллельно исполняемого Go-кода.",
      "Go 1.25 ввёл учитывающий контейнеры GOMAXPROCS по умолчанию и периодические обновления. На Linux политика учитывает CPU affinity, квоту cgroup и логические CPU. Явная настройка через окружение или runtime.GOMAXPROCS отключает автообновления; важны настройки совместимости и версия языка модуля.",
      "GOMAXPROCS не ограничивает конкурентность приложения. Пулу БД, обращениям к внешнему сервису и приёму запросов нужны свои бюджеты. При GOMAXPROCS=1 всё ещё возможны чередование операций и гонки данных."
    ],
    "versionNote": "В 1.17 стандартный runtime не имел современной container-aware политики. В 1.25 она появилась; 1.26 сохраняет этот API. Для совместимого поведения старых модулей см. containermaxprocs/updatemaxprocs в документации runtime.",
    "sources": [
      {
        "title": "go1.26.1: runtime/HACKING.md",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/HACKING.md"
      },
      {
        "title": "go1.26.1: runtime/debug.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/debug.go"
      },
      {
        "title": "go1.25.0: runtime/debug.go",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/debug.go"
      },
      {
        "title": "Go 1.25: runtime",
        "url": "https://go.dev/doc/go1.25#runtime"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "GOMAXPROCS is 2 and the process has 30 threads. Is that necessarily a bug?",
      "promptRU": "GOMAXPROCS равен 2, а у процесса 30 потоков. Это обязательно ошибка?",
      "pointsEN": [
        "No. Two Ps bound parallel execution of user Go code, not all OS threads. Inspect syscall/cgo activity and thread ownership.",
        "CPU-bound work in foreign C code is not capped in the same way by GOMAXPROCS. Apply a separate concurrency limit when needed."
      ],
      "pointsRU": [
        "Нет. Два P ограничивают параллельное исполнение пользовательского Go-кода, а не все потоки ОС. Изучи syscall/cgo и назначение потоков.",
        "Вычисления во внешнем C-коде не ограничиваются GOMAXPROCS тем же способом. При необходимости задавай отдельный предел конкурентности."
      ],
      "followUpEN": "Would setting GOMAXPROCS to 1 make an unprotected shared map safe?",
      "followUpRU": "Станет ли общая map без синхронизации безопасной при GOMAXPROCS=1?"
    }
  },
  {
    "id": "c8",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim2",
    "qEN": "How does Go preempt a CPU-bound goroutine?",
    "qRU": "Как Go вытесняет горутину, занятую вычислениями?",
    "shortEN": "The sysmon thread notices a goroutine that has run for about 10 ms and asks it to yield. Cooperatively, it sets the goroutine’s stack guard, so the next function call that checks the stack enters the scheduler. Asynchronously, since Go 1.14, it sends SIGURG to the thread, and the handler makes the goroutine call asyncPreempt if it is at a safe point, so even a tight loop without calls can be preempted.",
    "anchorsEN": [
      "sysmon: running ≥ ~10 ms",
      "stack guard → next call → scheduler",
      "SIGURG → asyncPreempt (Go 1.14+)",
      "switch only at a safe point"
    ],
    "jvmEN": "Java virtual threads are not time-sliced: a CPU-bound virtual thread keeps its carrier thread until it blocks. Go preempts goroutines, so one busy loop cannot starve the others on its P.",
    "detailsEN": [
      "sysmon/retake uses a 10 ms threshold while observing an unchanged scheduling tick. This is not a strict CPU quantum, a guaranteed latency bound or a statement that sysmon wakes exactly every 10 ms. runnext goroutines can share a tick.",
      "The cooperative path sets the goroutine’s stack guard to stackPreempt; the next function prologue check then enters newstack, which can switch to the scheduler instead of growing the stack (see C5). A loop that makes no calls with a stack check never reaches it, which is why the asynchronous path exists. On supported Unix paths, SIGURG is used to interrupt a thread. The handler checks whether the interrupted code is at an asynchronous safe point and can arrange a call to asyncPreempt after resuming. That path saves registers and enters the scheduler; the signal handler does not simply schedule arbitrary Go code. Since Go 1.14 Unix programs receive more signals, so slow system calls made directly through syscall or golang.org/x/sys/unix can fail with EINTR more often and should be retried.",
      "If the point is unsafe, preemption must wait or retry. runtime code, foreign C execution and platform mechanisms have different constraints. Preemption is only a request, and preempting a goroutine neither cancels its operation nor releases its locks.",
      "runtime.Gosched yields voluntarily but creates no application-level ordering guarantee. Use channels, locks or other synchronization for ordering, and check cancellation explicitly in long-running application loops."
    ],
    "practicalRU": "В длительном вычислении проверяй ctx.Done на подходящей границе работы. Справедливость планировщика и скорость реакции вашего протокола отмены — разные вопросы.",
    "code": "package main\n\nimport (\n\t\"context\"\n\t\"fmt\"\n)\n\nfunc sum(ctx context.Context, n int) (int, error) {\n\ttotal := 0\n\tfor i := 0; i < n; i++ {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn 0, ctx.Err()\n\t\tdefault:\n\t\t}\n\t\ttotal += i\n\t}\n\treturn total, nil\n}\n\nfunc main() {\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\t_, err := sum(ctx, 100)\n\tfmt.Println(err) // context canceled; the application checks the signal.\n}",
    "shortRU": "Поток sysmon замечает горутину, которая работает около 10 мс, и просит её уступить. Кооперативно: ставит ей границу стека так, что следующий вызов функции с проверкой стека уходит в планировщик. Асинхронно, с Go 1.14: шлёт потоку SIGURG, и обработчик заставляет горутину вызвать asyncPreempt, если она в безопасной точке, поэтому вытеснить можно даже плотный цикл без вызовов.",
    "jvmRU": "Виртуальные потоки Java не вытесняются по времени: виртуальный поток, занятый вычислениями, держит поток-носитель, пока не заблокируется. Go вытесняет горутины, поэтому один занятый цикл не оставит без процессора остальные на своём P.",
    "detailsRU": [
      "sysmon/retake использует порог 10 мс при наблюдении неизменного тика планировщика. Это не строгий квант CPU, не гарантия задержки и не утверждение, что sysmon просыпается ровно каждые 10 мс. Горутины runnext могут разделять один тик.",
      "Кооперативный путь ставит в stack guard горутины значение stackPreempt; следующая проверка в прологе функции входит в newstack, который может переключиться на планировщик вместо роста стека (см. C5). Цикл без вызовов с проверкой стека до неё не доходит, поэтому и нужен асинхронный путь. В поддерживаемых Unix-путях для прерывания потока используется SIGURG. Обработчик проверяет асинхронную безопасную точку и может подготовить вызов asyncPreempt после возобновления. Этот путь сохраняет регистры и входит в планировщик; обработчик сигнала не начинает просто исполнять произвольный Go-код. С Go 1.14 Unix-программы получают больше сигналов, поэтому медленные системные вызовы напрямую через syscall или golang.org/x/sys/unix чаще завершаются с EINTR и их нужно повторять.",
      "Если точка небезопасна, вытеснение ждёт или повторяется. У кода рантайма, внешнего C-кода и механизмов платформы разные ограничения. Вытеснение — только запрос: оно не отменяет операцию горутины и не освобождает её блокировки.",
      "runtime.Gosched добровольно уступает исполнение, но не создаёт гарантию порядка событий приложения. Для порядка нужны каналы, блокировки или другая синхронизация, а в длительных циклах приложения отмену нужно проверять явно."
    ],
    "versionNote": "Асинхронное вытеснение появилось в Go 1.14, то есть уже есть в 1.17; поддержка зависит от платформы. Порог и описанный Unix-путь проверены по Go 1.26.1, не являются гарантией языка.",
    "sources": [
      {
        "title": "Go 1.14: runtime",
        "url": "https://go.dev/doc/go1.14#runtime"
      },
      {
        "title": "go1.26.1: runtime/preempt.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/preempt.go"
      },
      {
        "title": "go1.26.1: runtime/signal_unix.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/signal_unix.go"
      },
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "A loop has run for 12 ms. Can you promise that another goroutine has already run, or that cancellation has been observed?",
      "promptRU": "Цикл исполнялся 12 мс. Можно ли обещать, что другая горутина уже получила CPU или отмена уже замечена?",
      "pointsEN": [
        "Neither follows from the elapsed time. Preemption is best effort and depends on safe points and scheduling.",
        "The application must check cancellation; yielding or preemption alone does not terminate its loop."
      ],
      "pointsRU": [
        "Ни то ни другое не следует из прошедшего времени. Вытеснение зависит от безопасных точек и планирования и не имеет такой гарантии.",
        "Приложение само должно проверять отмену; уступка CPU или вытеснение не завершает его цикл."
      ],
      "followUpEN": "Where would you place cancellation checks if one unit of work takes a second?",
      "followUpRU": "Где поставить проверки отмены, если одна единица работы занимает секунду?"
    }
  },
  {
    "id": "c9",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim2",
    "qEN": "How does the scheduler find work and steal from another P?",
    "qRU": "Как планировщик находит работу и забирает её у другого P?",
    "shortEN": "The scheduler looks for work roughly in this order: the P’s runnext and local queue, the global queue, the network poller, then stealing from other Ps. Every 61st tick it first takes one goroutine from the global queue, so global work does not starve. A thief takes half of the victim’s local queue from the head, and a P whose queue is empty takes a batch of up to 128 from the global queue.",
    "anchorsEN": [
      "runnext → runq → global → netpoll → steal",
      "every 61st tick: 1 G from global",
      "steal half, from the head",
      "global batch ≤ 128, fair share"
    ],
    "jvmEN": "Like Java’s ForkJoinPool, each P has its own queue and idle workers steal. Unlike ForkJoinPool, which by default takes its own tasks LIFO, a P runs its local queue FIFO, and only the one-slot runnext acts as a LIFO shortcut.",
    "detailsEN": [
      "In Go 1.26.1, findRunnable handles special work such as GC coordination and timers before parts of ordinary queue selection. The simplified sequence “global, local, poll, steal” is not a complete priority contract.",
      "Every 61st tick (schedtick % 61 == 0), if the global queue is not empty, findRunnable takes exactly one G from it (globrunqget) before the local queue. When the local queue is empty, it takes a batch instead (globrunqgetbatch): at most half the local queue’s capacity (256 / 2 = 128) and at most the global size / GOMAXPROCS + 1; it runs the first and puts the rest into the local queue. A tick is not a millisecond: the runnext path inherits the time slice without incrementing schedtick.",
      "runqgrab takes ceil(n/2) entries from the head of a victim’s ordinary local queue, using CAS to claim them. Concurrent changes can cause retries. runqsteal returns one of the batch for execution and queues the rest; stealing runnext is a separate possibility when allowed. Only runnable goroutines move; a running one is never stolen.",
      "For a stable victim queue [A,B,C,D,E], head on the left, the batch is [A,B,C]. runqsteal returns C and queues A,B on the thief; D,E remain on the victim. This is a source-level example under stated assumptions, not a prediction of application output."
    ],
    "practicalRU": "Используй schedtrace для общего снимка и execution trace для временной картины. Один снимок неравных очередей сам по себе не доказывает проблему cgo, безопасной точки или планировщика.",
    "code": "// Source-level model, NOT executable Go and NOT a scheduling guarantee.\n// Assumptions: no concurrent queue changes; ordinary queue, head at left.\n// Before: victim [A B C D E], thief []\n// Grab:   n=5 -> n-n/2=3 -> [A B C]\n// After:  victim [D E], thief [A B], returned for execution: C\n// runnext, timers, concurrent retries and other scheduler work are omitted.",
    "shortRU": "Планировщик ищет работу примерно в таком порядке: runnext и локальная очередь своего P, глобальная очередь, netpoller, затем перехват у других P. На каждом 61-м тике он сначала берёт одну горутину из глобальной очереди, чтобы глобальная работа не голодала. При перехвате забирается половина локальной очереди жертвы с головы, а P с пустой очередью берёт из глобальной пачку до 128 горутин.",
    "jvmRU": "Как в ForkJoinPool в Java, у каждого P своя очередь, а свободные воркеры перехватывают работу. В отличие от ForkJoinPool, который по умолчанию берёт свои задачи по LIFO, P исполняет локальную очередь по FIFO, и только слот runnext работает как LIFO-ярлык.",
    "detailsRU": [
      "В Go 1.26.1 findRunnable обрабатывает специальную работу, например координацию GC и таймеры, до части обычного выбора очередей. Упрощённая последовательность «общая, локальная, сеть, кража» не является полным контрактом приоритетов.",
      "На каждом 61-м тике (schedtick % 61 == 0), если глобальная очередь не пуста, findRunnable берёт из неё ровно одну G (globrunqget) раньше локальной очереди. Когда локальная очередь пуста, берётся пачка (globrunqgetbatch): не больше половины ёмкости локальной очереди (256 / 2 = 128) и не больше «размер глобальной / GOMAXPROCS + 1»; первую G он исполняет, остальные кладёт в локальную очередь. Тик — не миллисекунда: путь через runnext наследует квант и не увеличивает schedtick.",
      "runqgrab берёт ceil(n/2) элементов с головы обычной локальной очереди жертвы и закрепляет их через CAS. Конкурентные изменения могут вызвать повтор. runqsteal возвращает один элемент пачки для исполнения, остальные ставит в очередь; перехват runnext — отдельная возможность, когда она разрешена. Перемещаются только готовые горутины; исполняющуюся не перехватить.",
      "Для неизменной очереди жертвы [A,B,C,D,E] с головой слева пачка равна [A,B,C]. runqsteal возвращает C, а A,B ставит в очередь забирающего P; D,E остаются у жертвы. Это пример по исходникам при заданных условиях, а не предсказание вывода приложения."
    ],
    "versionNote": "Конкретный путь описан по 1.26.1 и сопоставлен с 1.25.0. В Go 1.17 имя findrunnable было со строчной r, а проверка %61 находилась в schedule. Не переносить расположение функций между версиями механически.",
    "sources": [
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.25.0: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/proc.go"
      },
      {
        "title": "go1.17: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/proc.go"
      },
      {
        "title": "runtime: GODEBUG diagnostics",
        "url": "https://pkg.go.dev/runtime#hdr-Environment_Variables"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "A victim queue contains five runnable goroutines. Does “steal half” mean two, and are they taken from the tail?",
      "promptRU": "В очереди жертвы пять готовых горутин. Значит ли «забрать половину» взять две, и берутся ли они с хвоста?",
      "pointsEN": [
        "Under the illustrated stable-queue path, it takes three from the head: n - n/2 with integer division.",
        "The thief returns one for immediate execution and places the other two in its queue. Concurrent mutation can change the attempt."
      ],
      "pointsRU": [
        "В показанном пути неизменной очереди берутся три с головы: n - n/2 при целочисленном делении.",
        "Забирающий P возвращает одну для исполнения и ставит две в свою очередь. Конкурентное изменение может повлиять на попытку."
      ],
      "followUpEN": "What changes if the ordinary queue is empty but runnext is occupied?",
      "followUpRU": "Что меняется, если обычная очередь пуста, но runnext занят?"
    }
  },
  {
    "id": "c10",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim2",
    "qEN": "How do network polling, blocking syscalls and cgo affect G, M and P?",
    "qRU": "Как ожидание сети, блокирующий syscall и cgo влияют на G, M и P?",
    "shortEN": "Network waits free the thread, while blocking system calls and cgo hold it, so the runtime moves the P to another thread. A read that would block parks the goroutine in the netpoller, and no thread waits per socket. During a long system call or cgo call, sysmon soon takes the P away and, if there is work, gives it to another thread. When the call returns, the goroutine needs a P again and waits as runnable if none is free.",
    "anchorsEN": [
      "network wait → netpoller, thread free",
      "syscall / cgo → thread stays busy",
      "sysmon hands the P to another M",
      "return needs a P again"
    ],
    "jvmEN": "This is the same idea as a Java virtual thread unmounting on blocking I/O. But where a virtual thread pins its carrier during a native call, Go detaches the P from the blocked thread, so the other goroutines keep running.",
    "detailsEN": [
      "On the standard Unix pollable-socket path, a read that would block waits through the runtime netpoller. There is no dedicated blocked OS thread per waiting socket. This is not a promise about every net.Conn implementation, every file or every platform.",
      "In Go 1.25, ordinary entersyscall detaches M from P and puts P in _Psyscall. The runtime can retake it; a quick return may reclaim it. entersyscallblock explicitly hands off P for a known blocking call. Handoff is not guaranteed at the instant every syscall starts.",
      "In Go 1.26.1, ordinary entersyscall can keep M and P attached while G is in _Gsyscall; _Psyscall is now the unused slot _Psyscall_unused. Retaking uses setBlockOnExitSyscall to hold the G state, validate the links, detach P and then permit return to proceed. Known-blocking and GC paths can give up P sooner.",
      "A returning call needs a P before normal user Go execution resumes. If none is available, the goroutine can become runnable and wait. cgo can occupy threads even while computing rather than waiting; GOMAXPROCS does not cap that foreign CPU work.",
      "A new thread is not necessarily created for each call: idle threads may be reused. Still, unbounded blocking calls can exhaust resources or hit the runtime thread limit (initially 10,000, configurable with debug.SetMaxThreads). Limit operations at their owner, not by assuming a fixed goroutine-to-thread ratio."
    ],
    "practicalRU": "Пример ограничивает вызовы, допущенные через один общий лимитер. Отмена может остановить ожидание допуска; после старта сам callback должен поддерживать отмену. Контекст не прерывает произвольный C-код принудительно.",
    "code": "package admission\n\nimport \"context\"\n\n// Share one Limit across callers. It bounds admitted work, not OS threads.\ntype Limit chan struct{}\n\nfunc (limit Limit) Do(ctx context.Context, work func(context.Context) error) error {\n\tif err := ctx.Err(); err != nil {\n\t\treturn err\n\t}\n\tselect {\n\tcase limit <- struct{}{}:\n\t\tdefer func() { <-limit }()\n\tcase <-ctx.Done():\n\t\treturn ctx.Err()\n\t}\n\tif err := ctx.Err(); err != nil {\n\t\treturn err\n\t}\n\t// Cancellation can race with this call; work must also cooperate.\n\treturn work(ctx)\n}\n\n// Construct with make(Limit, 32); keep it shared and never close it.",
    "shortRU": "Ожидание сети освобождает поток, а блокирующие системные вызовы и cgo его держат, поэтому рантайм передаёт P другому потоку. Чтение, которое заблокировалось бы, паркует горутину в netpoller, и отдельного потока на сокет нет. Во время долгого системного вызова или вызова cgo sysmon вскоре забирает P и, если есть работа, отдаёт его другому потоку. Когда вызов возвращается, горутине снова нужен P; если свободного нет, она ждёт как готовая к запуску.",
    "jvmRU": "Та же идея, что у виртуального потока Java, который отсоединяется от носителя на блокирующем вводе-выводе. Но там, где виртуальный поток в нативном вызове закрепляет за собой поток-носитель (pinning), Go отцепляет P от заблокированного потока, и остальные горутины продолжают работать.",
    "detailsRU": [
      "В стандартном Unix-пути поллируемого сокета чтение, которое заблокировалось бы, ожидает через netpoller рантайма. Отдельный заблокированный поток на каждый ожидающий сокет не нужен. Это не обещание для каждой реализации net.Conn, каждого файла или каждой платформы.",
      "В Go 1.25 обычный entersyscall отсоединяет M от P и переводит P в _Psyscall. Рантайм может забрать P, а быстрый возврат — вернуть его. entersyscallblock явно передаёт P для заведомо блокирующего вызова. Передача не гарантирована в момент начала любого syscall.",
      "В Go 1.26.1 обычный entersyscall может оставить M и P связанными, пока G находится в _Gsyscall; прежний _Psyscall стал неиспользуемым слотом _Psyscall_unused. При изъятии setBlockOnExitSyscall удерживает состояние G, проверяет связи, отсоединяет P и затем разрешает продолжение возврата. Заведомо блокирующий путь и GC могут отдать P раньше.",
      "После возврата нужен P, прежде чем продолжится обычный пользовательский Go-код. Если P нет, горутина может стать runnable и ждать. cgo может занимать потоки даже вычислениями, а не ожиданием; GOMAXPROCS не ограничивает такую работу внешнего кода.",
      "Для каждого вызова необязательно создаётся новый поток: свободные могут переиспользоваться. Но неограниченные блокирующие вызовы способны исчерпать ресурсы или предел потоков рантайма (изначально 10 000, настраивается debug.SetMaxThreads). Ограничивай операции у их владельца, не предполагая фиксированного отношения горутин к потокам."
    ],
    "versionNote": "Существенная граница 1.25 → 1.26: _Psyscall больше не действующее состояние P. Старый путь 1.17/1.25 нельзя выдавать за схему 1.26.1. RawSyscall и особые runtime-пути здесь не моделируются.",
    "sources": [
      {
        "title": "go1.25.0: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/proc.go"
      },
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.26.1: runtime/runtime2.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/runtime2.go"
      },
      {
        "title": "go1.26.1: internal/poll/fd_unix.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/poll/fd_unix.go"
      },
      {
        "title": "go1.26.1: runtime/cgocall.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/cgocall.go"
      },
      {
        "title": "go1.26.1: runtime/debug/garbage.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/debug/garbage.go"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "A syscall returns after its P was taken, and no P is free. Can the same M immediately continue user Go code?",
      "promptRU": "Syscall вернулся после изъятия P, а свободных P нет. Может ли тот же M сразу продолжить пользовательский Go-код?",
      "pointsEN": [
        "No: a P is required. The G can be queued while the M stops; resumption need not use the same M.",
        "Distinguish a blocked OS thread from a parked G in a pollable network wait. Do not label the Go 1.26 path _Psyscall."
      ],
      "pointsRU": [
        "Нет: нужен P. G может попасть в очередь, пока M остановится; продолжение необязательно будет на том же M.",
        "Различай заблокированный поток ОС и припаркованную G при поллируемом ожидании сети. Не подписывай путь Go 1.26 как _Psyscall."
      ],
      "followUpEN": "Does a 32-slot limiter guarantee that the process has at most 32 OS threads?",
      "followUpRU": "Гарантирует ли лимитер на 32 слота не более 32 потоков ОС во всём процессе?"
    }
  },
  {
    "id": "c11",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim1",
    "qEN": "What is P.runnext, and how does it interact with fairness?",
    "qRU": "Что такое P.runnext и как он связан со справедливостью?",
    "shortEN": "runnext is a one-slot “run me next” spot in front of each P’s local queue. When a goroutine wakes another, for example by sending to it on a channel, or starts one with go, that goroutine goes into runnext and runs next instead of waiting in a queue of up to 256; the previous occupant moves to the tail. It inherits the current time slice, so the pair shares one 10 ms slice, and sysmon preempts it like a single long-running goroutine.",
    "anchorsEN": [
      "one slot in front of the runq",
      "woken or new G runs next, old one → tail",
      "lower latency for send-and-wait pairs",
      "shared 10 ms slice → sysmon preempts"
    ],
    "detailsEN": [
      "With next=true, runqput can replace the current slot using CAS and move the previous occupant to the ordinary queue; queue overflow has its own path. Calling this a one-element LIFO stack hides the displacement into another queue.",
      "runqget checks runnext before the ordinary local queue and reports inheritTime=true for that path. execute then does not increment schedtick. This local preference does not override all other scheduler work or guarantee immediate execution after go or a channel operation.",
      "A chain of goroutines can keep replacing runnext while sharing a tick. sysmon preemption helps prevent monopolizing a P. The slot’s capacity of one is not by itself a fairness proof; the runtime disables this optimization without sysmon and can randomize its use in some builds.",
      "Goroutines that hand work to each other often keep running on the same core with warm caches; that is a tendency, not a guarantee. Correct synchronization must work whether or not runnext is used and even if the goroutine moves to another P."
    ],
    "practicalRU": "Объясняй через «один предпочтительный кандидат, остальные остаются в очереди». Не оправдывай передачу данных без синхронизации предполагаемым порядком runnext.",
    "code": "// Source-level model, NOT executable Go. No concurrent queue changes.\n// Before: runnext=A, ordinary queue=[X Y]\n// runqput(P, B, true), assuming runnext is enabled and the queue has room:\n// After:  runnext=B, ordinary queue=[X Y A]\n// runqget(P) can return B with inheritTime=true.\n// This is a local queue rule, not an application execution-order guarantee.",
    "shortRU": "runnext — слот на одну горутину «запусти меня следующей» перед локальной очередью каждого P. Когда горутина будит другую, например отправкой в канал, или запускает новую через go, та попадает в runnext и запускается следующей, а не ждёт в очереди, где может быть до 256 горутин; прежняя горутина из слота уходит в хвост. Она наследует текущий квант, поэтому пара делит один квант в 10 мс, и sysmon вытесняет её, как одну долго работающую горутину.",
    "detailsRU": [
      "При next=true runqput может заменить содержимое слота через CAS и перенести прежнего кандидата в обычную очередь; при переполнении есть отдельный путь. Название «LIFO-стек из одного элемента» скрывает перенос в другую очередь.",
      "runqget проверяет runnext раньше обычной локальной очереди и возвращает inheritTime=true для этого пути. execute тогда не увеличивает schedtick. Локальный приоритет не отменяет остальную работу планировщика и не гарантирует немедленный запуск после go или операции с каналом.",
      "Цепочка горутин может снова и снова заменять runnext, разделяя один тик. Вытеснение через sysmon помогает не монополизировать P. Ёмкость в один элемент сама по себе не доказывает справедливость; рантайм отключает оптимизацию без sysmon и может рандомизировать её использование в некоторых сборках.",
      "Горутины, которые передают друг другу работу, часто продолжают исполняться на том же ядре с прогретым кешем; это тенденция, а не гарантия. Корректная синхронизация должна работать и без runnext, и при переходе горутины на другой P."
    ],
    "versionNote": "Описаны runqput/runqget/execute/retake Go 1.26.1; соответствующие механизмы есть и в 1.25.0. Это внутреннее планирование, а не контракт языка или точная модель кешей CPU.",
    "sources": [
      {
        "title": "go1.26.1: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.25.0: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/proc.go"
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "A occupies runnext and B replaces it. Is A lost? Does B necessarily receive a fresh full time slice?",
      "promptRU": "В runnext находится A, затем его заменяет B. Теряется ли A? Обязательно ли B получает новый полный квант?",
      "pointsEN": [
        "A is displaced into ordinary queue handling; it is not discarded.",
        "The runnext path can inherit the current time slice. Preemption is needed to keep chains from monopolizing execution."
      ],
      "pointsRU": [
        "A переходит в обработку обычной очереди, а не исчезает.",
        "Путь runnext может наследовать текущий квант. Вытеснение нужно, чтобы цепочка не монополизировала исполнение."
      ],
      "followUpEN": "Why does a one-slot capacity fail to prove fairness for a ping-pong chain?",
      "followUpRU": "Почему ёмкость в один слот не доказывает справедливость для цепочки ping-pong?"
    }
  },
  {
    "id": "c12",
    "mod": "m2",
    "modName": "2. GMP Scheduler",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How would you find and prevent a goroutine leak?",
    "qRU": "Как найти утечку горутин и обеспечить их завершение?",
    "shortEN": "I find a leak by watching which stack group keeps growing in the goroutine profile, and prevent it by giving every goroutine an owner and a stop signal. A goroutine leaks when it outlives its work and can never finish, usually blocked on a channel, a lock or I/O without a timeout. /debug/pprof/goroutine?debug=1 groups identical stacks with counts, and in tests go.uber.org/goleak fails the test if goroutines are left behind.",
    "anchorsEN": [
      "leak = outlives its work, can’t finish",
      "stuck on send, receive, lock, I/O",
      "goroutine profile: a growing group",
      "owner + stop signal + bound"
    ],
    "jvmEN": "In Java a stuck platform thread shows up in a thread dump under its name. Goroutines have IDs in dumps but no names and no public ID API, so you find a leak by grouping identical stacks, or by pprof labels, and watching which group grows.",
    "shortRU": "Утечку я нахожу по группе стеков, которая всё растёт в профиле горутин, а предотвращаю тем, что у каждой горутины есть владелец и сигнал остановки. Горутина утекает, когда переживает свою работу и уже не может завершиться — обычно заблокирована на канале, блокировке или вводе-выводе без таймаута. /debug/pprof/goroutine?debug=1 группирует одинаковые стеки со счётчиками, а в тестах go.uber.org/goleak роняет тест, если остались горутины.",
    "jvmRU": "В Java зависший платформенный поток виден в дампе потоков под своим именем. У горутин в дампах есть номера, но нет имён и публичного API для ID, поэтому утечку находят, группируя одинаковые стеки или по меткам pprof, и следят, какая группа растёт.",
    "detailsEN": [
      "A common case is one result sent after the caller has left. A one-element buffer lets that single send finish; it does not stop the RPC or make repeated sends safe. Bound concurrency and give long-running work a shutdown path.",
      "A running or blocked goroutine can keep reachable objects alive. Losing the caller's channel variable does not collect the goroutine. A deliberately long-lived service goroutine is not a leak merely because it waits.",
      "Compare goroutine profiles over time and after load subsides. debug=1 gives grouped text stacks; debug=2 gives a stack dump with goroutine states. A stack shows where work is waiting, not by itself why it cannot finish. Go 1.26 adds an experimental goroutineleak profile (GOEXPERIMENT=goroutineleakprofile, also /debug/pprof/goroutineleak): the GC finds goroutines blocked on a channel or lock that no runnable goroutine can reach, so they can never wake up; Go 1.27 enables it by default."
    ],
    "detailsRU": [
      "Частый случай — отправка единственного результата после ухода вызывающей стороны. Буфер на один элемент позволяет именно этой отправке завершиться; он не останавливает RPC и не делает безопасными повторные отправки. Ограничивай параллелизм и предусматривай остановку длительной работы.",
      "Работающая или заблокированная горутина может удерживать достижимые объекты. Потеря переменной канала у вызывающего кода не уничтожает горутину. Долгоживущая служебная горутина не становится утечкой только потому, что ждёт.",
      "Сравнивай профили горутин во времени и после снижения нагрузки. debug=1 даёт сгруппированные текстовые стеки, debug=2 — дамп со состояниями горутин. Стек показывает место ожидания, но сам по себе не объясняет, почему работа не завершится. В Go 1.26 появился экспериментальный профиль goroutineleak (GOEXPERIMENT=goroutineleakprofile, также /debug/pprof/goroutineleak): GC находит горутины, заблокированные на канале или блокировке, до которых не может дотянуться ни одна работающая горутина, — значит, они не проснутся никогда; в Go 1.27 он включён по умолчанию."
    ],
    "practicalRU": "Начни с повторяющихся стеков и проверь владельца каждой горутины: кто прекращает отправку, кто закрывает очередь и кто дожидается завершения. Проверку остановки строй на наблюдаемом завершении работы; один таймаут запроса не означает, что дочерняя работа уже закончилась.",
    "versionNote": "В Go 1.25 доступны обычные goroutine-профили. В Go 1.26 профиль goroutineleak включается экспериментом GOEXPERIMENT=goroutineleakprofile; это дополнительная диагностика, не гарантия обнаружения всех утечек. В Go 1.27 профиль goroutineleak доступен без эксперимента (runtime/pprof, /debug/pprof/goroutineleak); он находит горутины, заблокированные на примитивах, недостижимых из работающих горутин, и может пропустить утечки через глобальные переменные.",
    "sources": [
      {
        "title": "Go: pipelines and cancellation",
        "url": "https://go.dev/blog/pipelines"
      },
      {
        "title": "pprof formats — Go 1.26.1",
        "url": "https://pkg.go.dev/runtime/pprof@go1.26.1#Profile.WriteTo"
      },
      {
        "title": "Go 1.26 release notes",
        "url": "https://go.dev/doc/go1.26"
      }
    ],
    "practice": {
      "kind": "Проверь исправление",
      "promptEN": "The result channel now has capacity 1, but the RPC ignores context and never returns. Has the leak been fixed? Explain the remaining lifetime problem.",
      "promptRU": "У канала результата теперь ёмкость 1, но RPC игнорирует context и никогда не возвращается. Исправлена ли утечка? Объясни оставшуюся проблему времени жизни.",
      "pointsEN": [
        "The goroutine has not reached the send: it is still inside the RPC.",
        "Buffering solves only the final send when there is exactly one result; it cannot cancel the RPC.",
        "Use an operation that supports cancellation or deadlines, define ownership and shutdown, and bound concurrency. Returning from the caller does not prove the worker has stopped."
      ],
      "pointsRU": [
        "Горутина ещё не дошла до отправки: она остаётся внутри RPC.",
        "Буфер решает только финальную отправку единственного результата; отменить RPC он не может.",
        "Нужна операция с отменой или ограничением времени, понятный владелец, остановка и ограниченный параллелизм. Возврат вызывающей функции не доказывает завершения воркера."
      ],
      "followUpEN": "What changes if the worker sends two results into a buffer of size 1?",
      "followUpRU": "Что изменится, если воркер отправляет два результата в буфер размера 1?"
    },
    "code": "// Function fragment; import \"context\". work must observe ctx cancellation.\nfunc Await(ctx context.Context, work func(context.Context) error) error {\n\tresult := make(chan error, 1)\n\tgo func() {\n\t\tresult <- work(ctx) // Exactly one send; it can finish without a receiver.\n\t}()\n\tselect {\n\tcase err := <-result:\n\t\treturn err\n\tcase <-ctx.Done():\n\t\treturn ctx.Err() // Does not wait for work to stop.\n\t}\n}",
    "quizIds": [
      "q10",
      "q16"
    ]
  },

  // ==========================================
  // МОДУЛЬ 3: КАНАЛЫ (HCHAN), SELECT, CAS И SYNC (Q13 - Q22)
  // ==========================================
  {
    "id": "c13",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "simId": "sim3",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "qEN": "What does a channel buffer change, and what does it not change?",
    "qRU": "Что меняет буфер канала, а что остаётся прежним?",
    "shortEN": "A buffer lets the sender go ahead without a receiver for up to cap values: an unbuffered send waits until a receiver takes the value, while a buffered send completes as soon as there is a free slot. It does not change two things: a full buffer still blocks the sender, so a slow consumer still slows the producer, and a send copies only the value, so a pointer or a slice still shares its data.",
    "anchorsEN": [
      "unbuffered = rendezvous",
      "buffered = up to cap without a receiver",
      "full buffer still blocks → backpressure",
      "copies the value, not what it points to"
    ],
    "jvmEN": "An unbuffered channel is like Java’s SynchronousQueue and a buffered one like an ArrayBlockingQueue with put and take. What Java queues lack is close, to signal the end of the stream, and select, to wait on several channels at once.",
    "shortRU": "Буфер позволяет отправителю идти дальше без получателя — до cap значений: небуферизованная отправка ждёт, пока получатель заберёт значение, а буферизованная завершается, как только есть свободная ячейка. Двух вещей он не меняет: полный буфер всё так же блокирует отправителя, поэтому медленный потребитель по-прежнему тормозит производителя, а отправка копирует только значение, поэтому указатель или срез по-прежнему делят данные.",
    "jvmRU": "Небуферизованный канал похож на SynchronousQueue в Java, буферизованный — на ArrayBlockingQueue с put и take. Чего у очередей Java нет — это close, чтобы сообщить о конце потока, и select, чтобы ждать сразу на нескольких каналах.",
    "detailsEN": [
      "For an open channel, a waiting receiver can take a value directly, even if the channel has buffer capacity. Otherwise, a sender uses a free buffer slot or waits. With select and default, an operation that cannot proceed can be skipped instead of waiting.",
      "A send copies the element value. A slice value still refers to its backing array, and a pointer still refers to the same object. Copy the data or agree on ownership and synchronization before either side mutates shared data.",
      "In makechan, the limit below 64 KiB is on one element, not the total buffer. For a nonzero buffer of pointer-free elements, the runtime allocates hchan and buffer together; pointer-containing elements use a separately allocated buffer. This layout is not a language guarantee.",
      "Choose capacity from the amount of work allowed in flight. A larger buffer may absorb a burst, but cannot fix a permanently slower consumer. Measure throughput, waiting and retained memory for the actual workload."
    ],
    "detailsRU": [
      "Для открытого канала ожидающий получатель может получить значение напрямую, даже если канал имеет буфер. Иначе отправитель использует свободную ячейку или ждёт. В select с default неготовую операцию можно пропустить вместо ожидания.",
      "Отправка копирует значение элемента. Значение среза продолжает ссылаться на исходный массив, а указатель — на тот же объект. До изменения общих данных нужна копия либо договорённость о владении и синхронизации.",
      "В makechan ограничение меньше 64 КиБ относится к одному элементу, а не ко всему буферу. Ненулевой буфер элементов без указателей выделяется вместе с hchan; для элементов с указателями буфер выделяется отдельно. Такое размещение не гарантировано языком.",
      "Выбирай ёмкость по допустимому объёму незавершённой работы. Большой буфер может поглотить всплеск, но не исправит постоянно более медленного потребителя. Измеряй пропускную способность, ожидание и удерживаемую память на своей нагрузке."
    ],
    "practicalRU": "Опора для памяти: «получатель → место → ожидание» для отправки в открытый канал. Отдельный вопрос: что именно копируется? Применение: q15 проверяет ожидание, q21 — общие данные после передачи среза.",
    "versionNote": "Контракт передачи значений применим к Go 1.17/1.25/1.26. Внутренние ветки makechan и chansend сверены по Go 1.25.0 и 1.26.1; устройство памяти и производительность не являются контрактом языка.",
    "sources": [
      {
        "title": "Go specification: channel types",
        "url": "https://go.dev/ref/spec#Channel_types"
      },
      {
        "title": "Go memory model: channels",
        "url": "https://go.dev/ref/mem#chan"
      },
      {
        "title": "chan.go — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/chan.go"
      },
      {
        "title": "chan.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "practice": {
      "kind": "Предскажи ожидание",
      "promptEN": "A channel has capacity 2 and no receiver. Two sends completed. Can a third send complete? What changes if you add a default case?",
      "promptRU": "Ёмкость канала — 2, получателя нет. Две отправки завершились. Завершится ли третья? Что изменит default?",
      "pointsEN": [
        "The third ordinary send waits because the buffer is full.",
        "In a select with default, default runs if the send cannot proceed.",
        "A larger buffer postpones this point; it does not create a consumer."
      ],
      "pointsRU": [
        "Третья обычная отправка ждёт: буфер полон.",
        "В select с default выполнится default, если отправка не готова.",
        "Больший буфер отодвигает этот момент, но не создаёт потребителя."
      ],
      "followUpEN": "What if a receiver drains one value? Explain which operation can now proceed.",
      "followUpRU": "Что изменится, если получатель прочитает одно значение? Какая операция сможет продолжиться?"
    },
    "code": "// Function fragment. No receiver is needed for these two sends.\nfunc BufferFull() bool {\n\tch := make(chan int, 2)\n\tch <- 10\n\tch <- 20\n\tselect {\n\tcase ch <- 30:\n\t\treturn false\n\tdefault:\n\t\treturn true\n\t}\n}"
  },

  {
    "id": "c14",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do nil, open, and closed channels behave?",
    "qRU": "Чем отличаются операции с nil-каналом, открытым и закрытым каналом?",
    "shortEN": "A nil channel blocks forever, an open channel waits for a partner or for buffer space, and a closed channel never blocks a receive. A closed channel first returns the remaining buffered values, then the zero value with ok=false. Three things panic: a send on a closed channel, closing it twice, and closing nil. In select, a nil case is never chosen, which is how you switch a case off.",
    "anchorsEN": [
      "nil: blocks forever, close panics",
      "open: waits for a partner or space",
      "closed: drain, then zero with ok=false",
      "send on closed / close twice → panic"
    ],
    "jvmEN": "A Java BlockingQueue has no closed state, so the end of a stream is signalled with a poison pill or an interrupt. In Go, close is that signal, and a range loop over the channel stops by itself.",
    "shortRU": "nil-канал блокирует навсегда, открытый ждёт партнёра или места в буфере, а закрытый никогда не блокирует чтение. Закрытый канал сначала отдаёт оставшиеся в буфере значения, затем нулевое значение с ok=false. Паникуют три вещи: отправка в закрытый канал, повторный close и close nil-канала. В select ветка с nil-каналом никогда не выбирается — так ветку выключают.",
    "jvmRU": "У BlockingQueue в Java нет закрытого состояния, поэтому конец потока сообщают «ядовитым» элементом или прерыванием. В Go этот сигнал — close, и цикл range по каналу останавливается сам.",
    "detailsEN": [
      "For an open unbuffered channel, send and receive rendezvous. For an open buffered channel, send waits when it is full and receive waits when it is empty. A nil-channel case cannot proceed in select, so another case or default can still run.",
      "After close, buffered values are received with ok=true. Only after the buffer is drained does receive return the zero value with ok=false. Closing does not discard buffered data.",
      "Closing makes waiting goroutines eligible to proceed; it does not guarantee when each will run. The owner coordinating all sends should close the channel only after no more sends can occur.",
      "A closed input stays ready. In a select loop, handle ok=false by stopping or setting that input variable to nil. The loop also needs a defined exit when all inputs are disabled."
    ],
    "detailsRU": [
      "В открытом небуферизованном канале отправка и чтение встречаются друг с другом. В буферизованном отправка ждёт при полном буфере, чтение — при пустом. Ветка select с nil-каналом не готова, но другие ветки или default могут выполниться.",
      "После close значения из буфера приходят с ok=true. Только после опустошения буфера чтение возвращает нулевое значение и ok=false. Закрытие не выбрасывает накопленные данные.",
      "Закрытие позволяет ожидающим горутинам продолжить работу, но не гарантирует момент запуска каждой из них. Закрывать канал должен владелец, координирующий всех отправителей, когда новых отправок уже не будет.",
      "Закрытый вход остаётся готовым. В цикле select при ok=false нужно завершиться или присвоить этой переменной канала nil. Для случая, когда отключены все входы, также нужен определённый выход из цикла."
    ],
    "practicalRU": "Для сигнала завершения удобно закрытие done-канала, но отдельно дождись остановки воркеров, если следующий шаг зависит от неё. Для потока значений всегда различай «пришёл ноль» и «поток закончился» через второй результат чтения.",
    "versionNote": "Контракты каналов в этой карточке применимы к Go 1.17, 1.25 и 1.26. Порядок запуска горутин не является частью этих гарантий.",
    "sources": [
      {
        "title": "Go specification: receive",
        "url": "https://go.dev/ref/spec#Receive_operator"
      },
      {
        "title": "Go specification: close",
        "url": "https://go.dev/ref/spec#Close"
      },
      {
        "title": "Go memory model: channels",
        "url": "https://go.dev/ref/mem#chan"
      }
    ],
    "practice": {
      "kind": "Предскажи результат",
      "promptEN": "Without running this code, predict both receives. Explain why a zero value alone cannot indicate that the stream ended.",
      "promptRU": "Не запуская код, предскажи оба чтения. Объясни, почему одного нулевого значения недостаточно для определения конца потока.",
      "code": "ch := make(chan int, 1)\nch <- 0\nclose(ch)\nfirst, firstOK := <-ch\nsecond, secondOK := <-ch",
      "pointsEN": [
        "first=0 and firstOK=true: this zero was a real buffered value.",
        "second=0 and secondOK=false: the closed channel has now been drained.",
        "Closing preserves buffered values. The second receive result distinguishes data from the end of the stream."
      ],
      "pointsRU": [
        "first=0 и firstOK=true: этот ноль был настоящим значением в буфере.",
        "second=0 и secondOK=false: закрытый канал уже опустошён.",
        "Закрытие сохраняет данные буфера. Второй результат чтения отличает данные от конца потока."
      ],
      "followUpEN": "What happens if you send another value after close?",
      "followUpRU": "Что произойдёт при отправке ещё одного значения после close?"
    },
    "code": "// Function fragment. Both inputs must eventually close, or add cancellation.\nfunc Drain(a, b <-chan int, consume func(int)) {\n\tfor a != nil || b != nil {\n\t\tselect {\n\t\tcase v, ok := <-a:\n\t\t\tif !ok {\n\t\t\t\ta = nil\n\t\t\t\tcontinue\n\t\t\t}\n\t\t\tconsume(v)\n\t\tcase v, ok := <-b:\n\t\t\tif !ok {\n\t\t\t\tb = nil\n\t\t\t\tcontinue\n\t\t\t}\n\t\t\tconsume(v)\n\t\t}\n\t}\n}"
  },
  {
    "id": "c15",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "Channels or a mutex — who owns the data, and what must happen together?",
    "qRU": "Канал или мьютекс: кто владеет данными и какие действия должны выполняться вместе?",
    "shortEN": "Use a channel to hand over ownership of data or to signal an event, and a mutex to protect shared state with an invariant. Channels fit pipelines, worker pools and shutdown signals; a mutex fits a cache or a balance, where the check and the update must happen together under one lock. A send copies only the value, so after sending a pointer the sender must stop touching that data.",
    "anchorsEN": [
      "channel = hand off ownership, signal",
      "mutex = protect an invariant",
      "check + update under one lock",
      "a sent pointer still shares data"
    ],
    "jvmEN": "Java makes the same split: synchronized or ReentrantLock for shared state, a BlockingQueue for handoff. The differences are that sync.Mutex is not reentrant, and channels add close and select, which BlockingQueue lacks.",
    "detailsEN": [
      "A channel send copies its value. A pointer or slice can still refer to shared mutable memory. For an ownership-transfer protocol, the sender stops accessing that memory after handing it over, or both sides synchronize access. The compiler does not enforce this protocol.",
      "A mutex should cover the whole operation: check balance AND withdraw, or look up AND install a missing entry. Locking each field access separately can avoid a data race yet leave a logic race. All accesses to protected mutable state must follow the same protocol.",
      "RWMutex allows concurrent readers, but RLock does not permit writes. A pending writer can block new readers; there is no atomic read-to-write upgrade. Extra bookkeeping can outweigh parallelism for short reads: RWMutex is not automatically faster than Mutex.",
      "Channels compose with select for cancellation and communication. Mutex.Lock has no context parameter and cannot be a select case. An atomic operation covers its specified value, not an arbitrary multi-field invariant; an actor also needs bounded queues and an exit path."
    ],
    "practicalRU": "Начни с инварианта: баланс не должен стать отрицательным. Проверку и изменение держи под одним lock. Универсальной цены в наносекундах и замедления актора в 10 раз нет: измеряй свою нагрузку. Возвращай снимки, а не доступ к изменяемому состоянию после unlock.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tmu      sync.Mutex\n\tbalance int\n}\n\nfunc (a *Account) Withdraw(n int) bool {\n\ta.mu.Lock()\n\tdefer a.mu.Unlock()\n\tif n <= 0 || a.balance < n {\n\t\treturn false\n\t}\n\ta.balance -= n\n\treturn true\n}\nfunc main() {\n\ta := Account{balance: 10}\n\tfmt.Println(a.Withdraw(7), a.Withdraw(7)) // true false\n}",
    "shortRU": "Канал — чтобы передать владение данными или сообщить о событии, мьютекс — чтобы защитить общее состояние с инвариантом. Каналы подходят для конвейеров, пулов воркеров и сигналов остановки; мьютекс — для кеша или баланса, где проверка и изменение должны идти вместе под одной блокировкой. Отправка копирует только значение, поэтому, отправив указатель, отправитель не должен больше трогать эти данные.",
    "jvmRU": "В Java то же разделение: synchronized или ReentrantLock для общего состояния, BlockingQueue для передачи. Разница в том, что sync.Mutex не реентерабелен, а у каналов есть close и select, которых нет у BlockingQueue.",
    "detailsRU": [
      "Отправка в канал копирует значение. Указатель или срез всё ещё может ссылаться на общую изменяемую память. В протоколе передачи владения отправитель прекращает обращаться к ней после передачи либо обе стороны синхронизируют доступ. Компилятор этот протокол не обеспечивает.",
      "Мьютекс должен охватывать целую операцию: проверить баланс И списать, найти И установить отсутствующий элемент. Отдельные блокировки вокруг каждого обращения могут убрать data race, но оставить логическую гонку. Все обращения к защищённому изменяемому состоянию следуют одному протоколу.",
      "RWMutex допускает параллельных читателей, но RLock не разрешает запись. Ожидающий писатель может задержать новых читателей; атомарного повышения read-lock до write-lock нет. Для короткого чтения дополнительные расходы могут перевесить параллелизм: RWMutex не всегда быстрее Mutex.",
      "Каналы сочетаются с select для отмены и обмена. Mutex.Lock не принимает context и не может быть веткой select. Атомарная операция защищает указанное значение, а не произвольный инвариант нескольких полей; актору тоже нужны ограничение очереди и путь завершения."
    ],
    "versionNote": "Контракты Mutex/RWMutex и передачи значений применимы к Go 1.17, 1.25 и 1.26. Производительность зависит от нагрузки и реализации; фиксированных коэффициентов здесь нет.",
    "sources": [
      {
        "title": "Mutex contract — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/mutex.go"
      },
      {
        "title": "RWMutex — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/rwmutex.go"
      },
      {
        "title": "Go memory model — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_mem.html"
      }
    ],
    "quizIds": [
      "q8",
      "q12",
      "q13"
    ],
    "practice": {
      "kind": "Инвариант → граница операции",
      "promptEN": "What breaks if the balance check runs before Lock? Does sending *Account through a channel fix it?",
      "promptRU": "Что сломается, если проверять баланс до Lock? Исправит ли это отправка *Account через канал?",
      "pointsEN": [
        "Two withdrawals can both pass a stale check.",
        "A channel only transfers the pointer value; exclusive access needs an ownership protocol.",
        "Keep check and update together; return a copied result."
      ],
      "pointsRU": [
        "Два списания могут пройти проверку устаревшего баланса.",
        "Канал передаст значение указателя; исключительный доступ требует протокола владения.",
        "Держи проверку и изменение вместе; возвращай копию результата."
      ],
      "followUpEN": "If each worker owns a distinct result index, do they still need one shared mutex? State the assumptions.",
      "followUpRU": "Если каждый worker владеет своим индексом результата, нужен ли общий мьютекс? Назови условия."
    }
  },
  {
    "id": "c16",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "simId": "sim3",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "qEN": "Why does a channel wait queue contain sudog records instead of just goroutines?",
    "qRU": "Зачем очереди канала содержат записи sudog, а не только горутины?",
    "shortEN": "Because one goroutine can wait on several channels at once: in a blocked select it has one sudog in the wait queue of every channel. A sudog records one waiting operation: the goroutine, the channel, and where the value comes from or goes to, so the partner can copy it directly. When one case wins, the losing sudogs are dequeued, and all of them go back to a per-P cache.",
    "anchorsEN": [
      "one goroutine, many waits → sudog",
      "sudog: g + channel + elem pointer",
      "hchan: lock, ring buffer, recvq, sendq",
      "select: one sudog per case"
    ],
    "jvmEN": "A Java thread blocked on a lock or a queue waits in one place at a time. Go needs a separate record per wait because select lets one goroutine sit in several channel queues at once.",
    "shortRU": "Потому что одна горутина может ждать сразу на нескольких каналах: в заблокированном select у неё по sudog в очереди ожидания каждого канала. sudog описывает одну ждущую операцию: горутину, канал и откуда взять или куда положить значение, чтобы партнёр мог скопировать его напрямую. Когда одна ветка выигрывает, проигравшие sudog убираются из очередей, и все они возвращаются в кеш на P.",
    "jvmRU": "Поток Java, заблокированный на блокировке или очереди, ждёт в одном месте. Go нужна отдельная запись на каждое ожидание, потому что select позволяет одной горутине стоять сразу в нескольких очередях каналов.",
    "detailsEN": [
      "hchan contains buffer capacity and occupancy, send/receive indices, wait queues, closed state, type information and an internal runtime lock. The lock implementation depends on the platform; it is not a universal synonym for futex.",
      "A channel value refers to the same channel when copied or passed to a function. The runtime represents it with a pointer, typically 8 bytes on a 64-bit target. The Go API does not expose hchan fields.",
      "A waiting sudog links the goroutine, the channel and the send/receive storage when needed. A blocking select registers its participating non-nil channel cases; it does not create a new goroutine for each case.",
      "In an ordinary blocked receive, a sender removes the waiter from recvq, transfers the value and makes the receiver runnable. The receiver releases its sudog after it resumes. An allocation profile alone does not prove why many waiters were needed."
    ],
    "detailsRU": [
      "В hchan находятся ёмкость и заполнение буфера, индексы отправки/чтения, очереди, состояние закрытия, информация о типе и внутренний runtime lock. Реализация блокировки зависит от платформы; она не всегда равнозначна futex.",
      "Копирование значения канала или передача в функцию сохраняет ссылку на тот же канал. В рантайме это указатель, обычно 8 байт на 64-битной платформе. Поля hchan не являются частью Go API.",
      "Запись sudog связывает горутину, канал и при необходимости место отправляемого/получаемого значения. Блокирующий select регистрирует участвующие ветки с ненулевыми каналами, а не создаёт новую горутину для каждой ветки.",
      "При обычном заблокированном чтении отправитель извлекает ожидающего из recvq, передаёт значение и делает получателя готовым к запуску. Получатель освобождает свой sudog после продолжения работы. Один профиль аллокаций не объясняет, почему понадобилось много ожидающих."
    ],
    "practicalRU": "Опора для памяти: канал — состояние, sudog — заявка на операцию, G — исполнитель. Нарисуй одну G с тремя заявками в разных очередях. Затем объясни, почему выбранная ветка select должна снять остальные заявки.",
    "versionNote": "hchan/sudog — детали runtime, сверенные для Go 1.25.0/1.26.1. Размер указателя зависит от архитектуры. Показанный псевдокод не является полным layout или публичным API.",
    "sources": [
      {
        "title": "chan.go — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/chan.go"
      },
      {
        "title": "chan.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "practice": {
      "kind": "Нарисуй связи",
      "promptEN": "One goroutine blocks in a select receiving from three distinct non-nil channels. With no default and no ready case, how many goroutines and waiting records does this need?",
      "promptRU": "Одна горутина блокируется в select с чтением из трёх разных ненулевых каналов. Нет default и готовых веток. Сколько здесь горутин и записей ожидания?",
      "pointsEN": [
        "There is still one waiting goroutine, not three.",
        "The general select path registers one sudog for each of the three participating cases.",
        "One case wins; the runtime removes the remaining registrations before returning from select."
      ],
      "pointsRU": [
        "Ожидающая горутина по-прежнему одна.",
        "Общий путь select регистрирует по sudog для каждой из трёх участвующих веток.",
        "Выигрывает одна ветка; остальные регистрации снимаются до возврата из select."
      ],
      "followUpEN": "What changes if one of those channel variables is nil?",
      "followUpRU": "Что изменится, если одна переменная канала равна nil?"
    },
    "code": "// Pseudocode: relationships, not the actual runtime layout.\nchannel: buffer + sendq + recvq + closed + lock\nwaiter:  goroutine + channel + element storage\n\nG1 -> waiter A -> channel A.recvq\nG1 -> waiter B -> channel B.recvq\nG1 -> waiter C -> channel C.recvq"
  },

  {
    "id": "c17",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "simId": "sim3",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "qEN": "How does a channel safely hand a value to a waiting receiver?",
    "qRU": "Как канал безопасно передаёт значение ожидающему получателю?",
    "shortEN": "Under the channel lock, the sender takes the receiver’s sudog from recvq and copies the value straight into the receiver’s destination, usually on its stack, with sendDirect, bypassing the buffer. Then it unlocks and calls goready, which puts the receiver into runnext: runnable, not yet running. It is safe because the receiver parked with activeStackChans set: whoever moves its stack must first take the same channel locks, so the copy and a stack move cannot overlap.",
    "anchorsEN": [
      "lock → take the sudog from recvq",
      "sendDirect: copy into the receiver’s destination",
      "unlock → goready → runnext",
      "activeStackChans: a stack move takes the chan locks"
    ],
    "jvmEN": "Java’s SynchronousQueue hands over an object reference through the heap. A Go channel copies the value itself, even a whole struct, straight into the receiver’s variable.",
    "shortRU": "Под блокировкой канала отправитель забирает sudog получателя из recvq и через sendDirect копирует значение прямо в место назначения получателя, обычно на его стеке, минуя буфер. Затем отпускает блокировку и вызывает goready, которая ставит получателя в runnext: готов к запуску, но ещё не выполняется. Это безопасно, потому что получатель запарковался с флагом activeStackChans: кто переносит его стек, должен сначала взять те же блокировки каналов, поэтому копирование и перенос стека не пересекаются.",
    "jvmRU": "SynchronousQueue в Java передаёт ссылку на объект через кучу. Канал Go копирует само значение — даже целую структуру — прямо в переменную получателя.",
    "detailsEN": [
      "For an open channel, chansend first checks for a waiting receiver under the lock. It can bypass the buffer and copy to the receive destination with sendDirect. The source may be on the stack or heap; a discarded receive needs no destination copy.",
      "When a receive must wait, it registers a sudog and sets parkingOnChan before gopark. On the system-stack parking path, chanparkcommit sets activeStackChans, clears parkingOnChan and then unlocks the channel.",
      "activeStackChans does not pin the stack. It makes the stack copier lock every channel the goroutine waits on before moving the stack, and sudog pointers are fixed on every stack copy. sendDirect uses a type-aware barrier for pointer transfers and avoids preemption between reading the destination pointer and using it. The mirror case: on an unbuffered channel, a receiver copies from a waiting sender with recvDirect; on a full buffered channel, it takes the head slot and moves the waiting sender’s value into the freed slot, which keeps FIFO order.",
      "After the copy, the sender unlocks before goready. The receiving goroutine later resumes, clears its waiting state and releases its sudog. Neither immediate execution nor a particular CPU cache state is promised."
    ],
    "detailsRU": [
      "Для открытого канала chansend сначала проверяет ожидающего получателя под блокировкой. Значение может пройти мимо буфера к месту результата через sendDirect. Источник может быть на стеке или в куче; при отбрасывании результата копия в место назначения не нужна.",
      "Если чтению нужно ждать, оно регистрирует sudog и устанавливает parkingOnChan перед gopark. На пути парковки через системный стек chanparkcommit устанавливает activeStackChans, снимает parkingOnChan и затем отпускает блокировку.",
      "activeStackChans не закрепляет стек. Он заставляет копировщик стека перед переносом заблокировать все каналы, на которых ждёт горутина, а указатели sudog исправляются при каждом копировании стека. sendDirect использует барьер с учётом типа для переноса указателей и исключает вытеснение между чтением адреса назначения и его использованием. Зеркальный случай: на небуферизованном канале получатель копирует значение ждущего отправителя через recvDirect; на полном буферизованном — забирает голову буфера и переносит значение ждущего отправителя в освободившуюся ячейку, что сохраняет порядок FIFO.",
      "После копирования отправитель отпускает блокировку перед goready. Позже получатель продолжает работу, очищает состояние ожидания и освобождает sudog. Немедленное выполнение и определённое состояние кеша CPU не гарантированы."
    ],
    "practicalRU": "Опора для памяти: «значение передано → запуск разрешён → код продолжился». В диаграмме это отдельные состояния. При передаче больших структур измеряй стоимость копирования; переход на указатель требует явного владения данными и может изменить нагрузку на GC.",
    "versionNote": "Учебный путь обычной блокирующей операции без select/таймеров; runtime Go 1.25.0 и 1.26.1. Имена внутренних полей и доступ к ним могут меняться. Диаграмма показывает один допустимый порядок, а не гарантированный график планировщика.",
    "sources": [
      {
        "title": "chan.go — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/chan.go"
      },
      {
        "title": "chan.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      },
      {
        "title": "stack.go — Go 1.26.1: syncadjustsudogs/copystack",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      },
      {
        "title": "proc.go — Go 1.26.1: park_m",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      }
    ],
    "practice": {
      "kind": "Раздели события",
      "promptEN": "A sender has copied 42 into a waiting receiver’s destination and called goready. Has the receiver already executed the statement after its receive?",
      "promptRU": "Отправитель скопировал 42 в место результата ожидающего получателя и вызвал goready. Выполнил ли получатель следующую после чтения строку?",
      "pointsEN": [
        "Not necessarily: becoming runnable only makes execution possible.",
        "The scheduler must run the receiver before that goroutine can continue.",
        "The receiver releases its waiting record when it resumes, not merely when the sender dequeues it."
      ],
      "pointsRU": [
        "Не обязательно: готовность лишь делает выполнение возможным.",
        "Чтобы горутина продолжилась, планировщик должен её запустить.",
        "Получатель освобождает запись ожидания после продолжения, а не просто при извлечении записи отправителем."
      ],
      "followUpEN": "How could the sender wait until processing is finished, not merely until the value is received?",
      "followUpRU": "Как отправителю дождаться завершения обработки, а не только получения значения?"
    },
    "code": "// Pseudocode: ordinary send to a waiting receiver.\nlock(channel)\nwaiter = dequeue(receiverQueue)\ncopyValueToReceiver(waiter, value)\nunlock(channel)\nmakeRunnable(waiter.goroutine)\n// Later, when scheduled: receiver resumes and releases waiter."
  },

  {
    "id": "c18",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim4",
    "qEN": "How does select choose a case, and can cancellation take priority?",
    "qRU": "Как select выбирает готовую ветку и можно ли дать отмене приоритет?",
    "shortEN": "select runs one ready case, chosen at random among the ready ones, so the order in the source gives no priority. A default case runs only when nothing is ready, so a select with default never blocks, and a nil channel case is never ready. To prefer cancellation, check ctx.Err(), or do a non-blocking select on ctx.Done(), before the main select: that narrows the window, but it is not a strict priority.",
    "anchorsEN": [
      "random among ready → no priority",
      "default → never blocks",
      "nil channel case = switched off",
      "check ctx first: narrower, not strict"
    ],
    "jvmEN": "Java has no direct equivalent: the closest are CompletableFuture.anyOf or a NIO Selector for sockets. In Go select works on any channels, including timers and ctx.Done().",
    "shortRU": "select выполняет одну готовую ветку, выбранную случайно среди готовых, поэтому порядок в исходнике приоритета не даёт. default выполняется, только когда не готово ничего, поэтому select с default никогда не блокирует, а ветка с nil-каналом никогда не готова. Чтобы отдать предпочтение отмене, проверь ctx.Err() или сделай неблокирующий select по ctx.Done() до основного select: это сужает окно, но строгого приоритета не даёт.",
    "jvmRU": "Прямого аналога в Java нет: ближе всего CompletableFuture.anyOf или Selector из NIO для сокетов. В Go select работает с любыми каналами, включая таймеры и ctx.Done().",
    "detailsEN": [
      "Channel operands and send values are evaluated once, in source order, before choosing a case. Receive-assignment destinations are evaluated only if that receive is selected, after the communication. Even a nil-channel case can have operand side effects.",
      "A preliminary cancellation check stops work if cancellation is already visible there. Cancellation can occur between that check and the next select, where a ready job can still be chosen. This is not a strict priority guarantee.",
      "Random choice does not guarantee a maximum waiting time. Check the receive ok value when the jobs channel can close, and pass context to work that supports cancellation.",
      "An empty select blocks forever; a default-only select runs its body. Receiving from a closed, drained channel is ready and returns the zero value with ok=false. Sending to a closed channel panics if that case is selected; default does not protect it."
    ],
    "detailsRU": [
      "Выражения каналов и отправляемых значений вычисляются один раз, в порядке исходника, до выбора ветки. Левая часть присваивания при чтении вычисляется только после выбора и выполнения этого чтения. Даже у ветки с nil-каналом возможны побочные эффекты вычисления операндов.",
      "Предварительная проверка останавливает работу, если отмена уже видна в этот момент. Отмена может произойти между проверкой и следующим select: тогда готовая задача всё ещё может быть выбрана. Строгого приоритета здесь нет.",
      "Случайный выбор не гарантирует максимальное время ожидания. Проверяй ok при чтении закрываемой очереди и передавай context в работу, которая умеет обрабатывать отмену.",
      "Пустой select блокируется навсегда; select только с default выполняет его тело. Чтение из закрытого опустошённого канала готово: нулевое значение и ok=false. Отправка в закрытый канал паникует при выборе этой ветки; default от этого не защищает."
    ],
    "practicalRU": "Если воркер продолжает брать задания после отмены, проверь момент выбора задачи и поддержку context внутри самой операции. Предварительная проверка уменьшает нежелательную работу, но не делает проверку и получение задачи атомарными. Для строгой границы приёма задач потребуется отдельный протокол синхронизации.",
    "versionNote": "Гарантии select одинаковы для Go 1.17, 1.25 и 1.26. Для фрагмента ниже нужен импорт пакета context; handle должен поддерживать отмену.",
    "sources": [
      {
        "title": "Go specification: select",
        "url": "https://go.dev/ref/spec#Select_statements"
      },
      {
        "title": "context.Context",
        "url": "https://pkg.go.dev/context@go1.26.1#Context"
      }
    ],
    "practice": {
      "kind": "Измени условие",
      "promptEN": "A cancellation pre-check finds no cancellation. Before the next select, the context is cancelled and a job becomes ready. Can the job case still run? Explain the limit of the pre-check.",
      "promptRU": "Предварительная проверка не обнаружила отмену. Перед следующим select контекст отменяется и появляется готовая задача. Может ли выполниться ветка задачи? Объясни ограничение проверки.",
      "pointsEN": [
        "Yes. Both cases can be ready when the second select chooses an operation.",
        "Source order does not give cancellation priority, and the two checks are not one atomic operation.",
        "The handler must also observe cancellation. A strict admission boundary needs an explicit synchronization protocol."
      ],
      "pointsRU": [
        "Да. В момент выбора во втором select обе ветки могут быть готовы.",
        "Порядок веток не даёт отмене приоритет, а две проверки не образуют одну атомарную операцию.",
        "Обработчик также должен поддерживать отмену. Для строгой границы приёма задач нужен явный протокол синхронизации."
      ],
      "followUpEN": "What if cancellation is already visible at the first pre-check?",
      "followUpRU": "Что изменится, если отмена уже видна при первой проверке?"
    },
    "code": "// Function fragment; import \"context\". Cancellation is cooperative.\nfunc Run(ctx context.Context, jobs <-chan int, handle func(context.Context, int) error) error {\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tdefault:\n\t\t}\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase job, ok := <-jobs:\n\t\t\tif !ok {\n\t\t\t\treturn nil\n\t\t\t}\n\t\t\tif err := handle(ctx, job); err != nil {\n\t\t\t\treturn err\n\t\t\t}\n\t\t}\n\t}\n}"
  },
  {
    "id": "c19",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim4",
    "qEN": "Does every select call selectgo, and how does the general path work?",
    "qRU": "Каждый ли select вызывает selectgo и как устроен общий путь?",
    "shortEN": "No. The compiler rewrites simple forms: select {} blocks forever, a select with only default just runs it, one case becomes a plain channel operation, and one case plus default becomes a non-blocking selectnbsend or selectnbrecv. Only two or more channel cases call runtime.selectgo: it locks the channels in address order, polls them in random order and, if nothing is ready, parks on all of them until a winner’s CAS on selectDone wakes it.",
    "anchorsEN": [
      "select {} → block; 1 case → plain op",
      "1 case + default → selectnb*",
      "≥ 2 → selectgo: lock by address, random poll",
      "park on all; CAS on selectDone wins"
    ],
    "shortRU": "Нет. Компилятор переписывает простые формы: select {} блокирует навсегда, select только с default просто выполняет его, одна ветка становится обычной операцией с каналом, а одна ветка плюс default — неблокирующими selectnbsend или selectnbrecv. Только две и больше ветки с каналами вызывают runtime.selectgo: он блокирует каналы в порядке адресов, опрашивает их в случайном порядке и, если ничего не готово, паркуется на всех, пока победитель CAS по selectDone его не разбудит.",
    "detailsEN": [
      "With one operation plus default, selectnbsend returns whether the send was selected; selectnbrecv returns both selected and received (the Go ok value). A closed, drained receive has selected=true and received=false. With multiple operations plus default, selectgo still runs, with block=false: it polls but does not register waiters or park when nothing is ready.",
      "sellock locks each distinct channel in address order. Pass 1 polls for ready operations. If none is ready and blocking is allowed, pass 2 enqueues sudogs while those same locks are still held.",
      "gopark with selparkcommit releases the channel locks as the goroutine parks. A matching operation claims a select waiter with selectDone.CompareAndSwap(0, 1); losing operations skip that waiter.",
      "After resuming, selectgo calls sellock again. Pass 3 removes remaining registrations and releases the sudogs; selunlock releases the locks. In this ordinary blocking path there are two acquisitions of the channel set, not three.",
      "The compiler places sends first and receives from the end of its case array, then maps the chosen internal index back to the source case. Nil channel values are excluded from runtime polling; they do not change the source-level case count used for lowering."
    ],
    "detailsRU": [
      "Для одной операции с default selectnbsend сообщает, выбрана ли отправка; selectnbrecv возвращает selected и received (значение Go-переменной ok). У закрытого пустого канала selected=true, received=false. При нескольких операциях с default selectgo всё равно вызывается с block=false: опрашивает каналы, но при отсутствии готовых операций не регистрирует ожидание и не паркует горутину.",
      "sellock захватывает каждый уникальный канал по порядку адресов. Первый проход проверяет готовность. Если готовых операций нет и разрешено ждать, второй проход добавляет sudog под теми же блокировками.",
      "gopark с selparkcommit отпускает блокировки при парковке. Подходящая операция забирает ожидающего участника select через selectDone.CompareAndSwap(0, 1); проигравшая операция пропускает его.",
      "После возобновления selectgo снова вызывает sellock. Третий проход удаляет оставшиеся регистрации и освобождает sudog, затем selunlock отпускает блокировки. В обычном блокирующем пути набор каналов захватывается дважды, а не трижды.",
      "Компилятор размещает отправки с начала массива, чтения — с конца, затем переводит выбранный внутренний индекс обратно в ветку исходника. Nil-каналы исключаются из опроса в runtime; их значения не меняют число веток, по которому компилятор выбрал путь."
    ],
    "practicalRU": "Если selectgo заметен в CPU-профиле, сначала проверь частоту вызовов, число каналов и конкуренцию за них. Объединение событий в один канал меняет устройство программы и само по себе не обещает ускорения: сравни варианты на одинаковой нагрузке.",
    "versionNote": "Схема lowering сверена по исходникам Go 1.17, 1.25.0 и 1.26.1; walk/select.go в 1.25.0 и 1.26.1 совпадает. Листинги примеров получены только Go 1.26.1 darwin/arm64. Имена функций и массивы — детали реализации, не контракт языка.",
    "sources": [
      {
        "title": "Go specification: select",
        "url": "https://go.dev/ref/spec#Select_statements"
      },
      {
        "title": "Compiler select lowering — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/walk/select.go"
      },
      {
        "title": "Compiler lowering — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/cmd/compile/internal/walk/select.go"
      },
      {
        "title": "Compiler lowering — Go 1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/cmd/compile/internal/walk/select.go"
      },
      {
        "title": "selectgo — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/select.go"
      },
      {
        "title": "Channel helpers — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "practice": {
      "kind": "Сравни механизмы",
      "promptEN": "Why not use the same randomized order both for checking readiness and for locking channels? Explain the purpose of each order without naming runtime functions first.",
      "promptRU": "Почему бы не использовать один случайный порядок и для проверки готовности, и для блокировки каналов? Сначала объясни назначение порядков без названий функций runtime.",
      "pointsEN": [
        "The poll order avoids always favoring the first ready source case; it does not guarantee a bounded waiting time.",
        "A consistent lock order prevents two selects from locking the same channels in opposite order and waiting on each other.",
        "These are different problems. In the ordinary blocking path, poll and registration share one lock acquisition; cleanup requires another."
      ],
      "pointsRU": [
        "Порядок опроса не отдаёт постоянное предпочтение первой готовой ветке в коде; ограниченного времени ожидания он не гарантирует.",
        "Согласованный порядок блокировок не даёт двум select захватить общие каналы в противоположном порядке и ждать друг друга.",
        "Это разные задачи. В обычном блокирующем пути опрос и регистрация используют один захват блокировок, очистка — ещё один."
      ],
      "followUpEN": "How does selectDone stop two channel operations from claiming the same waiting select?",
      "followUpRU": "Как selectDone не даёт двум операциям забрать один ожидающий select?"
    },
    "code": "// Simplified excerpt from runtime.waitq.dequeue; not standalone Go.\nif sgp.isSelect && !sgp.g.selectDone.CompareAndSwap(0, 1) {\n    continue // Another operation has already claimed this select waiter.\n}"
  },
  {
    "id": "c20",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim5",
    "qEN": "What does compare-and-swap do, and why is a separate check and store different?",
    "qRU": "Что делает compare-and-swap и чем отличается от отдельной проверки и записи?",
    "shortEN": "Compare-and-swap stores a new value only if the current one still equals the expected value, doing the compare and the store as one atomic step, and reports whether it succeeded. A separate Load and Store leave a gap: two goroutines can both read 0 and both write 1, each believing it won. With CAS exactly one wins, and the loser sees false and retries or gives up. It covers one variable, so a multi-field invariant still needs a mutex.",
    "anchorsEN": [
      "store only if still equal",
      "compare + store = one atomic step",
      "true / false → who won",
      "one variable; several fields → mutex"
    ],
    "jvmEN": "This is AtomicInteger.compareAndSet in Java and atomic.Int32.CompareAndSwap in Go. Go atomics are always sequentially consistent, like Java volatile; Go has no weaker modes such as lazySet or getAcquire.",
    "shortRU": "Compare-and-swap записывает новое значение, только если текущее всё ещё равно ожидаемому, — сравнение и запись одним атомарным шагом — и сообщает, удалось ли. Отдельные Load и Store оставляют щель: две горутины могут обе прочитать 0 и обе записать 1, и каждая решит, что выиграла. С CAS побеждает ровно одна, а проигравшая видит false и повторяет или сдаётся. CAS охватывает одну переменную, поэтому инварианту из нескольких полей всё равно нужен мьютекс.",
    "jvmRU": "Это AtomicInteger.compareAndSet в Java и atomic.Int32.CompareAndSwap в Go. Атомики Go всегда последовательно согласованы, как volatile в Java; более слабых режимов вроде lazySet или getAcquire в Go нет.",
    "detailsEN": [
      "Think of three inputs: the location, expected old value and proposed new value. If state starts at 0 and two goroutines each try CAS(0, 1), only one can succeed as long as nothing resets state. A failure does not wait or retry by itself.",
      "Separate atomic Load and Store calls do not make a combined check-and-update atomic. Both callers can load 0 before either stores 1. CAS closes this gap for the one value it operates on; it does not make an entire multi-field algorithm atomic.",
      "Go atomics behave as if in a sequentially consistent order. On amd64 it compiles to LOCK CMPXCHG; arm64 has LSE and load/store-exclusive paths. Cache coherence is part of the hardware implementation, not a promise of one latency, one cache-line size or identical instructions on every CPU.",
      "CAS compares the current value, not its history: A → B → A can still match A. A state/version design needs its own correctness argument. Start with a mutex for compound invariants unless an atomic design has a concrete benefit."
    ],
    "detailsRU": [
      "Запомни три входа: место в памяти, ожидаемое старое значение, предлагаемое новое. Если state сначала 0 и две горутины пробуют CAS(0, 1), успешной будет только одна, пока никто не сбрасывает state. Неудачный CAS сам не ждёт и не повторяется.",
      "Отдельные атомарные Load и Store не делают всю проверку с изменением атомарной. Оба участника могут прочитать 0 до первой записи 1. CAS закрывает этот промежуток для одного значения, но не превращает весь алгоритм с несколькими полями в атомарный.",
      "Атомики Go ведут себя как операции в едином последовательном порядке. На amd64 это LOCK CMPXCHG; у arm64 есть пути LSE и exclusive load/store. Когерентность кешей относится к аппаратной реализации, а не к гарантии одной задержки, размера cache line или инструкции для всех CPU.",
      "CAS сравнивает текущее значение, а не историю: после A → B → A сравнение с A может пройти. Для схемы с версией состояния всё равно нужно обоснование корректности. Для составного инварианта начни с мьютекса, если у атомарной схемы нет конкретной пользы."
    ],
    "practicalRU": "Опора для памяти: «ожидаю 0 → предлагаю 1 → получилось?» Для false sharing отдельно проверь, делят ли часто изменяемые независимые данные одну cache line. Соседние поля не всегда попадают в одну линию; padding увеличивает расстояние, но сам по себе не гарантирует выравнивания объекта. Измеряй эффект на целевой архитектуре.",
    "versionNote": "Пример с atomic.Int32 требует Go 1.19+, подходит для 1.25/1.26. В Go 1.17 используй var state int32 и atomic.CompareAndSwapInt32(&state, 0, 1), а для конкурентного чтения — atomic.LoadInt32. Ассемблерные детали сверены по Go 1.26.1 отдельно для amd64 и arm64.",
    "sources": [
      {
        "title": "sync/atomic — Go 1.26.1",
        "url": "https://pkg.go.dev/sync/atomic@go1.26.1"
      },
      {
        "title": "CAS amd64 — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/atomic/atomic_amd64.s"
      },
      {
        "title": "CAS arm64 — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/atomic/atomic_arm64.s"
      },
      {
        "title": "Typed atomics: Go 1.19",
        "url": "https://go.dev/doc/go1.19"
      }
    ],
    "practice": {
      "kind": "Предскажи победителя",
      "promptEN": "Two goroutines call state.CompareAndSwap(0, 1) once. state starts at 0 and nobody resets it. What outcomes are possible?",
      "promptRU": "Две горутины по одному разу вызывают state.CompareAndSwap(0, 1). Изначально state=0, сброса нет. Какие результаты возможны?",
      "pointsEN": [
        "Exactly one call returns true and the other returns false.",
        "Which goroutine succeeds is unspecified. The final state is 1.",
        "Separate Load and Store calls can let both goroutines believe they won; each atomic call alone is not enough."
      ],
      "pointsRU": [
        "Ровно один вызов вернёт true, другой — false.",
        "Какая горутина победит, не определено. Итоговое значение — 1.",
        "Отдельные Load и Store могут дать обоим участникам считать себя победителями; атомарности каждого отдельного вызова недостаточно."
      ],
      "followUpEN": "What changes if a third goroutine can reset state to 0 between the attempts?",
      "followUpRU": "Что изменится, если третья горутина может вернуть state в 0 между попытками?"
    },
    "code": "// Function fragment; import \"sync/atomic\". Go 1.19+.\nfunc Claim(state *atomic.Int32) bool {\n\treturn state.CompareAndSwap(0, 1)\n}\n// false means the expected value did not match. No automatic retry.\n// Use atomic access consistently for concurrent access to state."
  },

  {
    "id": "c21",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "How does a mutex acquire, wait and hand off — and what does 1 ms really mean?",
    "qRU": "Как Mutex захватывается, ждёт и передаёт владение — и что на самом деле означает 1 мс?",
    "shortEN": "Lock is one CAS on the fast path, then a brief spin, then sleep on a semaphore; 1 ms is the threshold for switching modes, not a timeout. Unlock wakes one waiter, but in normal mode it competes with newcomers that are already running, and often loses. If a woken waiter loses again after waiting more than 1 ms, it switches the mutex to starvation mode, and Unlock then hands ownership directly to the waiter at the front.",
    "anchorsEN": [
      "fast path: one CAS 0 → locked",
      "spin briefly, then sleep on sema",
      "normal mode: woken waiter competes",
      "woken, lost, waited > 1 ms → starvation"
    ],
    "jvmEN": "Unlike ReentrantLock, sync.Mutex is not reentrant: locking it twice in one goroutine deadlocks, and it has no owner, so another goroutine may unlock it. Normal mode behaves like a non-fair ReentrantLock, and starvation mode like a fair one.",
    "detailsEN": [
      "The zero value is ready to use. Do not copy a Mutex after first use. Unlock synchronizes before a later successful Lock; a failed TryLock establishes no synchronization and gives no permission to read protected fields.",
      "The public API does not associate a Mutex with a particular goroutine: one goroutine may lock and another unlock under a valid protocol. There is no recursive-lock exception. If the current owner calls Lock again and nobody can unlock, it waits on itself.",
      "In Go 1.25.0/1.26.1, the internal mutex has an int32 state and uint32 semaphore. State includes locked/woken/starving flags and a waiter count. This layout and the CAS fast path are implementation details, not portable timing or size promises.",
      "Spinning eligibility uses runtime heuristics: limited attempts, CPU/P availability and an empty local run queue. It does not inspect an owner goroutine and prove that owner is running. If spinning is unsuitable or unsuccessful, the goroutine can park.",
      "Normal mode: wake a waiter → it competes with arrivals → it may wait again. In the slow path, prolonged waiting beyond the 1 ms threshold can switch the mutex to starvation mode while it is still locked. Unlock then hands ownership to the front waiter. The mode can end when the last waiter runs or its wait was short; none of this bounds scheduling or lock-hold time."
    ],
    "practicalRU": "Ищи конкуренцию через mutex- и block-профили, затем сокращай критические секции или меняй владение. SetMutexProfileFraction(5) задаёт в среднем одно из пяти событий конкуренции за mutex, а не каждый пятый Lock. Профиль показывает конкуренцию, но не доказывает, что сбой вызван starvation mode.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar mu sync.Mutex\n\tmu.Lock()\n\tfmt.Println(mu.TryLock()) // false: already locked\n\tmu.Unlock()\n\tif mu.TryLock() {\n\t\tfmt.Println(\"acquired\")\n\t\tmu.Unlock()\n\t}\n}",
    "shortRU": "Lock — один CAS на быстром пути, затем короткий спин, затем сон на семафоре; 1 мс — порог смены режима, а не таймаут. Unlock будит одного ждущего, но в нормальном режиме он соревнуется с уже работающими новичками и часто проигрывает. Если разбуженный ждущий снова проиграл, прождав больше 1 мс, он переводит мьютекс в режим голодания, и тогда Unlock передаёт владение прямо ждущему в голове очереди.",
    "jvmRU": "В отличие от ReentrantLock, sync.Mutex не реентерабелен: повторный Lock в той же горутине — deadlock, и владельца у него нет, поэтому отпустить его может другая горутина. Нормальный режим ведёт себя как нечестный ReentrantLock, режим голодания — как честный.",
    "detailsRU": [
      "Нулевое значение готово к работе. После первого использования Mutex нельзя копировать. Unlock синхронизируется с последующим успешным Lock; неуспешный TryLock не создаёт синхронизации и не разрешает читать защищённые поля.",
      "API не привязывает Mutex к определённой горутине: при корректном протоколе одна может захватить его, а другая освободить. Исключения для рекурсивного захвата нет. Если владелец снова вызывает Lock и освободить мьютекс некому, он ждёт самого себя.",
      "В Go 1.25.0/1.26.1 внутренний mutex содержит int32 state и uint32 sema. В state находятся флаги locked/woken/starving и число ожидающих. Эта раскладка и CAS на быстром пути — детали реализации, а не переносимая гарантия размера или времени.",
      "Допуск к spinning основан на эвристиках: ограничении попыток, доступности CPU/P и пустой локальной очереди. Рантайм не проверяет горутину-владельца, чтобы доказать, что она сейчас выполняется. Когда spinning не подходит или не помог, горутина может парковаться.",
      "Обычный режим: разбудили ожидающего → он соревнуется с новыми → может снова ждать. В медленном пути ожидание дольше порога 1 мс может включить starvation mode, пока mutex ещё захвачен. Unlock передаёт владение первому ожидающему. Режим может закончиться у последнего ожидающего или после короткого ожидания; это не ограничивает задержки планировщика и время удержания lock."
    ],
    "versionNote": "TryLock появился в Go 1.18; пример не подходит для 1.17. CAS/режимы сверены по Go 1.25.0 и 1.26.1: существенной смены описанного алгоритма нет. Порог 1 мс не является обещанием API.",
    "sources": [
      {
        "title": "Mutex contract — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/mutex.go"
      },
      {
        "title": "Mutex implementation — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/sync/mutex.go"
      },
      {
        "title": "Mutex implementation — go1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/internal/sync/mutex.go"
      },
      {
        "title": "Spinning heuristics — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "Profiling API — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mprof.go"
      }
    ],
    "quizIds": [
      "q8",
      "q13"
    ],
    "practice": {
      "kind": "CAS → ожидание → владение",
      "promptEN": "A goroutine waited 2 ms. Must it hold the mutex now? Can a failed TryLock justify reading the balance?",
      "promptRU": "Горутина ждала 2 мс. Обязана ли она уже получить Mutex? Разрешает ли неуспешный TryLock прочитать баланс?",
      "pointsEN": [
        "No: 1 ms is a slow-path policy threshold, not a deadline.",
        "Waking in normal mode is not ownership; in starvation mode handoff favors the queued waiter.",
        "Failed TryLock provides neither mutual exclusion nor a synchronizes-before edge."
      ],
      "pointsRU": [
        "Нет: 1 мс — порог политики медленного пути, не дедлайн.",
        "Пробуждение в normal mode ещё не владение; starvation handoff отдаёт преимущество ожидающему.",
        "Неуспешный TryLock не даёт ни взаимного исключения, ни отношения synchronizes-before."
      ],
      "followUpEN": "Sketch the dependency cycle in q8. Why does adding another P not remove it?",
      "followUpRU": "Нарисуй цикл ожидания в q8. Почему ещё один P его не устраняет?"
    }
  },
  {
    "id": "c22",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?",
    "qRU": "WaitGroup, Once и Context: кто ждёт, публикует инициализацию и просит отмену?",
    "shortEN": "WaitGroup waits for a counted group of goroutines to finish, Once runs an initialization exactly once while other callers wait, and Context carries cancellation, deadlines and request values down to the work. They do not replace each other: WaitGroup does not cancel, Context does not wait, and Once does not retry a failed initialization. A typical handler uses all three: Once for a shared client, the request’s Context, and a WaitGroup or errgroup for its workers.",
    "anchorsEN": [
      "WaitGroup: wait for N to finish",
      "Once: run once, others wait",
      "Context: cancel, deadline, values",
      "none replaces another"
    ],
    "jvmEN": "WaitGroup is like a reusable CountDownLatch whose count you can raise with Add; Once is like a lazy holder or double-checked initialization; Context is like an explicit, passed-along version of thread interruption with a deadline. Go passes Context as the first argument instead of keeping it in a ThreadLocal.",
    "detailsEN": [
      "WaitGroup: register an initial task before Wait can observe a zero counter. With Add/Done, normally call Add before starting the goroutine. Do not copy after first use; reuse for a new batch only after all previous Wait calls returned. Wait publishes completed work to its waiter, but it does not protect concurrent writes between workers.",
      "WaitGroup.Go was added in Go 1.25. It registers and starts a task; call wg.Go(f), not go wg.Go(f). The function must not panic. Go 1.26.1 re-panics without Done for a recovered non-nil panic, whereas 1.25.0 used defer Done. This prevents Wait from letting main exit before that panic finishes; it does not make panicking callbacks supported.",
      "Implementation history: Go 1.17 used three uint32 words to obtain an aligned 64-bit state plus a semaphore. Go 1.25/1.26 use atomic.Uint64: high 32 bits count tasks; the low part contains a synctest flag and 31 waiter bits. Memorize the contract first, not a permanent two-counter layout.",
      "Once.Do publishes initialization only after f finishes. A CAS that marks done before f runs would let losing callers return too early. Recursive Do on the same Once deadlocks. If f panics, Once considers that invocation complete: later Do calls do not retry f. Once itself must not be copied after use.",
      "Cancellation is a request: work must observe Done or use a context-aware API, and its owner still waits for completion where needed. Call the CancelFunc to release associated resources. Context methods are safe for concurrent use; mutable objects stored in values are not automatically protected.",
      "WithoutCancel (Go 1.21+) keeps value lookup but removes the parent deadline, cancellation and cause: Done is nil. Add an explicit timeout if using it. This is suitable only for intentionally detached, owned best-effort work; it neither guarantees delivery nor connects the task to service shutdown. Mandatory audit needs a durable handoff or completion before success."
    ],
    "practicalRU": "Задай три вопроса: кто регистрирует задачу и ждёт её, кто публикует инициализированное состояние, кто отменяет? Фоновая работа требует решения о жизненном цикле. Таймаут и отдельная горутина не заменяют надёжную очередь.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tvar once sync.Once\n\tvar base int\n\tresults := make([]int, 2)\n\tfor i := range results {\n\t\twg.Go(func() {\n\t\t\tonce.Do(func() { base = 42 })\n\t\t\tresults[i] = base\n\t\t})\n\t}\n\twg.Wait()\n\tfmt.Println(results) // [42 42]\n}",
    "shortRU": "WaitGroup ждёт завершения посчитанной группы горутин, Once выполняет инициализацию ровно один раз, пока остальные вызывающие ждут, а Context несёт отмену, дедлайны и значения запроса до самой работы. Друг друга они не заменяют: WaitGroup не отменяет, Context не ждёт, Once не повторяет неудавшуюся инициализацию. Обычный обработчик использует все три: Once — для общего клиента, Context — из запроса, WaitGroup или errgroup — для своих воркеров.",
    "jvmRU": "WaitGroup похож на CountDownLatch, который можно переиспользовать и счётчик которого увеличивают через Add; Once — на ленивый holder или double-checked инициализацию; Context — на явную, передаваемую по цепочке версию прерывания потока с дедлайном. Go передаёт Context первым аргументом, а не хранит его в ThreadLocal.",
    "detailsRU": [
      "WaitGroup: зарегистрируй первую задачу до того, как Wait сможет увидеть нулевой счётчик. С Add/Done обычно вызывай Add до запуска горутины. После первого использования нельзя копировать; новую группу задач начинай только после возврата всех предыдущих Wait. Wait делает завершённую работу видимой ожидающему, но не защищает записи workers друг от друга.",
      "WaitGroup.Go добавлен в Go 1.25. Он регистрирует и запускает задачу: вызывай wg.Go(f), а не go wg.Go(f). Функция не должна паниковать. Go 1.26.1 повторяет перехваченный ненулевой panic без Done, тогда как 1.25.0 использовал defer Done. Это не даёт Wait выпустить main до завершения такого panic; паника callback всё равно нарушает контракт.",
      "История реализации: Go 1.17 использовал три слова uint32 для выровненного 64-битного состояния и семафора. В Go 1.25/1.26 используется atomic.Uint64: старшие 32 бита — задачи, младшая часть — флаг synctest и 31 бит ожидающих. Сначала запоминай контракт, а не вечную раскладку из двух счётчиков.",
      "Once.Do публикует инициализацию только после завершения f. CAS с установкой done до вызова f позволил бы проигравшим вернуться слишком рано. Рекурсивный Do того же Once блокируется навсегда. После panic в f Once считает вызов выполненным: следующие Do не повторят f. Once после использования тоже нельзя копировать.",
      "Отмена — просьба: работа должна проверять Done или использовать API с поддержкой контекста, а владелец при необходимости отдельно ждёт завершения. Вызывай CancelFunc для освобождения связанных ресурсов. Методы Context безопасны при параллельных вызовах; изменяемые объекты в values автоматически не защищаются.",
      "WithoutCancel (Go 1.21+) сохраняет поиск values, но убирает дедлайн, отмену и cause родителя: Done равен nil. При использовании добавь явный таймаут. Это только для осознанно отделённой best-effort работы с владельцем; доставки и остановки вместе с сервисом он не обеспечивает. Обязательному аудиту нужна надёжная передача или завершение до ответа об успехе."
    ],
    "versionNote": "Пример: Go 1.25+ (WaitGroup.Go); отдельная переменная каждой итерации при := — семантика модулей Go 1.22+. Для Go 1.17: Add до go, defer Done и явная передача i аргументом. WithoutCancel — 1.21+. Различие panic-пути проверено по тегам 1.25.0 и 1.26.1.",
    "sources": [
      {
        "title": "WaitGroup — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/waitgroup.go"
      },
      {
        "title": "WaitGroup — go1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/sync/waitgroup.go"
      },
      {
        "title": "WaitGroup — go1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/sync/waitgroup.go"
      },
      {
        "title": "Once — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/once.go"
      },
      {
        "title": "Context — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/context/context.go"
      }
    ],
    "quizIds": [
      "q7",
      "q10",
      "q12",
      "q16",
      "q19"
    ],
    "practice": {
      "kind": "Зарегистрировать → выполнить → дождаться",
      "promptEN": "Why is the example race-free? Would WaitGroup alone make results = append(results, base) safe? What happens if Once initialization panics?",
      "promptRU": "Почему пример без гонок? Сделает ли один WaitGroup безопасным results = append(results, base)? Что будет после panic в инициализации Once?",
      "pointsEN": [
        "Once publishes base before each Do returns. Each task owns a distinct result index; Wait precedes reading results.",
        "Shared append is still a race between workers; Wait only joins them.",
        "Once.Do does not retry after a panic. WaitGroup.Go callbacks must not panic."
      ],
      "pointsRU": [
        "Once публикует base до возврата каждого Do. Каждая задача владеет отдельным индексом; чтение results идёт после Wait.",
        "Общий append всё ещё создаёт гонку workers; Wait лишь ждёт их.",
        "Once.Do не повторяет f после panic. Callback WaitGroup.Go не должен паниковать."
      ],
      "followUpEN": "After cancel(), can the caller assume all workers stopped? Describe the missing join.",
      "followUpRU": "Можно ли после cancel() считать всех workers остановленными? Опиши недостающее ожидание."
    }
  },

  // ==========================================
  // МОДУЛЬ 4: ПАМЯТЬ, АЛЛОКАТОР И СБОРЩИК МУСОРА (Q23 - Q28)
  // ==========================================
  {
    "id": "c23",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim6",
    "qEN": "How do stack and heap allocation differ, and how do you compare their cost?",
    "qRU": "Чем отличаются выделения на стеке и в куче и как сравнивать их стоимость?",
    "shortEN": "A stack allocation is part of the function’s frame: nearly free, and gone when the function returns. A heap allocation goes through the runtime allocator, mallocgc; every heap byte brings the next GC cycle closer, and each cycle costs more the more data stays live. The compiler chooses through escape analysis. To compare, measure: -benchmem shows allocations per operation, -gcflags=-m shows what escapes, and -m=2 shows why.",
    "anchorsEN": [
      "stack: part of the frame, gone on return",
      "heap: allocator + GC cycles sooner",
      "escape analysis decides",
      "-benchmem; -m what, -m=2 why"
    ],
    "jvmEN": "The JVM has a similar optimisation, escape analysis with scalar replacement in the JIT, but it happens at run time and only after warm-up. In Go the compiler decides at build time, and -gcflags=-m shows the decision.",
    "detailsEN": [
      "The language guarantees that a referenced value remains valid, not a storage location. Stack frames hold local state; Go may grow and move a goroutine stack. Values may also stay in registers or be optimized away.",
      "Stack allocation is not universally one instruction or zero GC work: frame setup, initialization and stack growth have costs, and stack pointers are scanned as GC roots. Heap objects need allocation and later reclamation; pointer-free objects avoid scanning their contents, not all GC work.",
      "Value versus pointer is first an API and ownership decision. Copies can cost time; pointers can introduce sharing, indirection and longer lifetimes. Neither is always faster. Inlining and escape analysis can remove an apparent allocation at a call site.",
      "Use compiler diagnostics (-gcflags=\"-m=2\") to understand placement, and benchmarks with -benchmem plus profiles to assess impact. Disabling inlining is a comparison experiment, not a faithful production benchmark."
    ],
    "practicalRU": "Сначала выбери корректное владение данными, затем сравни эквивалентные вызовы под рабочей версией компилятора. Не добавляй глобальный указатель только ради того, чтобы benchmark «не исчез»: это само меняет время жизни объекта. Сохраняй наблюдаемый результат так, чтобы не навязать лишний escape. Опора: «владение → размещение → измерение».",
    "code": "package example\n\ntype User struct{ ID int }\n\nfunc NewUserValue(id int) User { return User{ID: id} }\nfunc NewUser(id int) *User     { return &User{ID: id} }\n\nfunc ReadID(id int) int { return NewUser(id).ID }\n\n// Compare the optimized ReadID caller, not just NewUser in isolation.",
    "shortRU": "Выделение на стеке — часть кадра функции: почти бесплатно и исчезает при возврате. Выделение в куче идёт через аллокатор рантайма, mallocgc; каждый байт в куче приближает следующий цикл GC, а каждый цикл тем дороже, чем больше живых данных. Выбирает компилятор через escape analysis. Сравнивают замером: -benchmem показывает выделения на операцию, -gcflags=-m — что убегает, а -m=2 — почему.",
    "jvmRU": "В JVM есть похожая оптимизация — escape analysis со scalar replacement в JIT, но она работает во время выполнения и только после прогрева. В Go решает компилятор при сборке, и -gcflags=-m показывает это решение.",
    "detailsRU": [
      "Язык гарантирует пригодность значения, пока на него есть ссылки, а не место хранения. Кадр стека содержит локальное состояние; стек горутины может расти и перемещаться. Значения могут остаться в регистрах или вообще исчезнуть после оптимизации.",
      "Стек — не всегда одна инструкция и не нулевая работа GC: есть подготовка кадра, инициализация, рост стека; указатели в стеке сканируются как корни. Объекты кучи нужно выделять и позже освобождать; отсутствие указателей исключает обход их содержимого, но не всю работу GC.",
      "Значение или указатель — сначала решение об API и владении. Копирование стоит времени; указатели могут добавлять общее состояние, косвенный доступ и удержание данных. Ни один способ не всегда быстрее. Inlining и escape analysis способны убрать кажущееся выделение в месте вызова.",
      "Диагностика компилятора (-gcflags=\"-m=2\") объясняет размещение, а benchmark с -benchmem и профили показывают последствия. Выключение inlining — сравнительный эксперимент, а не точная модель production-сборки."
    ],
    "versionNote": "Общее различие применимо к Go 1.17/1.25/1.26. Конкретное размещение зависит от версии компилятора, флагов и места вызова. Код — компилируемый пакет с двумя API; он не обещает фиксированных наносекунд или allocs/op.",
    "sources": [
      {
        "title": "Go FAQ: stack or heap",
        "url": "https://go.dev/doc/faq#stack_or_heap"
      },
      {
        "title": "Escape analysis invariants — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/escape/escape.go"
      },
      {
        "title": "GC guide: allocation costs and profiling",
        "url": "https://go.dev/doc/gc-guide"
      }
    ],
    "practice": {
      "kind": "Сравни одинаковую работу",
      "promptEN": "Both constructors below are immediately used only to read ID. Does NewUser necessarily allocate on the heap, and is copying always faster?",
      "promptRU": "Оба конструктора ниже сразу используются только для чтения ID. Обязан ли NewUser выделить объект в куче и всегда ли копирование быстрее?",
      "pointsEN": [
        "No: an inlined caller may avoid the allocation.",
        "An escaping stored pointer changes the lifetime and can change placement.",
        "Compare equivalent ownership and observable results, then measure."
      ],
      "pointsRU": [
        "Нет: после inlining вызывающий код может обойтись без аллокации.",
        "Сохранённый наружу указатель меняет время жизни и может изменить размещение.",
        "Сравни одинаковое владение и наблюдаемый результат, затем измеряй."
      ],
      "followUpEN": "What changes if the caller saves the returned pointer globally?",
      "followUpRU": "Что изменится, если вызывающий код сохранит указатель глобально?"
    }
  },
  {
    "id": "c24",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim6",
    "qEN": "How does escape analysis choose storage, and how do you verify a particular allocation?",
    "qRU": "Как escape analysis определяет размещение и как проверить конкретное выделение памяти?",
    "shortEN": "The compiler checks whether a value can outlive its function or be reached from the heap; if so, the value goes to the heap, otherwise it stays on the stack. Typical reasons: returning a pointer to a local, storing it in a global or a heap object, capturing it in a goroutine’s closure, or a size that is too big or unknown. Inlining often removes an escape, so check with go build -gcflags=-m=2, which prints the reason.",
    "anchorsEN": [
      "outlives the function → heap",
      "return &x, global, goroutine closure, big size",
      "inlining can remove the escape",
      "-gcflags=-m=2 prints the reason"
    ],
    "jvmEN": "In Java every object goes to the heap unless the JIT proves otherwise. In Go values live on the stack by default and move to the heap only when the compiler cannot prove that the stack is safe.",
    "detailsEN": [
      "Passing a pointer down is safe for stack storage only if the callee does not retain it beyond that lifetime. Conversely, returning &x from a small helper need not allocate at an inlined call site that consumes x locally. SaveGlobal below deliberately retains a pointer.",
      "Interfaces and closures do not automatically allocate. What matters is whether the concrete operation is known, whether captured data is retained, and what the compiler can prove. A goroutine may extend captured data lifetime, but this is not a rule that every closure goes to the heap.",
      "Dynamic make is version-sensitive. Go 1.25 already has a conditional stack-buffer path for non-escaping slices; Go 1.26 release notes describe further cases. A small runtime capacity can use a stack buffer, while a larger capacity falls back to the heap. Escape of the slice can still require heap storage.",
      "There is no universal 64 KiB rule. In Go 1.26.1 the defaults distinguish explicit stack variables (128 KiB) and implicit allocations (64 KiB); alignment, total-frame constraints and flags also matter. These are implementation limits, not language guarantees.",
      "Inspect the actual caller with go build -gcflags=\"-m=2\", then benchmark with -benchmem and profile. A message about the helper body does not by itself describe an inlined copy. If replacing make with a fixed array, validate bounds and preserve ownership; returning its slice can move the array to the heap."
    ],
    "practicalRU": "В примере ReadLocal использует результат сразу, SaveGlobal передаёт адрес функции, которая удерживает его. Sum проверяет диапазон n и реально читает заполненные байты, поэтому пример не сводится к неиспользуемому buf. Проверяй и маленькие, и большие размеры: «не убегает» у динамического make не означает «никогда не выделяет в куче».",
    "code": "package example\n\nvar Saved *int\n\nfunc makeInt(v int) *int  { return &v }\nfunc retain(p *int)       { Saved = p }\nfunc ReadLocal(v int) int { return *makeInt(v) }\nfunc SaveGlobal(v int)    { retain(&v) }\n\nfunc Sum(n int) (int, bool) {\n\tif n < 0 || n > 1024 {\n\t\treturn 0, false\n\t}\n\tbuf := make([]byte, n)\n\tfor i := range buf {\n\t\tbuf[i] = byte(i)\n\t}\n\tsum := 0\n\tfor _, v := range buf {\n\t\tsum += int(v)\n\t}\n\treturn sum, true\n}",
    "shortRU": "Компилятор проверяет, может ли значение пережить свою функцию или стать доступным из кучи; если да — значение уходит в кучу, иначе остаётся на стеке. Типичные причины: вернуть указатель на локальную переменную, сохранить его в глобальной переменной или объекте кучи, захватить в замыкании горутины, слишком большой или неизвестный размер. Встраивание часто убирает убегание, поэтому проверяй через go build -gcflags=-m=2 — он печатает причину.",
    "jvmRU": "В Java каждый объект попадает в кучу, если JIT не докажет обратное. В Go значения по умолчанию живут на стеке и уходят в кучу, только когда компилятор не может доказать, что стек безопасен.",
    "detailsRU": [
      "Передача указателя вниз совместима со стеком лишь если вызываемая функция не сохраняет его дольше нужного времени жизни. И наоборот, return &x из небольшого помощника не обязательно выделяет память в куче в месте встроенного вызова с локальным использованием. Ниже SaveGlobal намеренно сохраняет указатель.",
      "Интерфейс и замыкание не означают автоматическую аллокацию. Важны известность конкретной операции, удержание захваченных данных и то, что может доказать компилятор. Горутина способна продлить время жизни захваченного значения, но не каждое замыкание обязано жить в куче.",
      "Динамический make зависит от версии. В Go 1.25 уже есть условный путь со стековым буфером для неубегающего среза; release notes Go 1.26 описывают дополнительные случаи. Небольшая динамическая capacity может использовать стек, большая — кучу. Если срез уходит наружу, хранение в куче всё ещё может понадобиться.",
      "Универсального правила 64 KiB нет. В Go 1.26.1 по умолчанию различаются явные переменные стека (128 KiB) и неявные выделения (64 KiB); влияют также выравнивание, ограничения всего кадра и флаги. Это пределы реализации, а не гарантии языка.",
      "Проверяй реальное место вызова через go build -gcflags=\"-m=2\", затем benchmark с -benchmem и профиль. Сообщение о теле помощника не описывает автоматически его встроенную копию. Заменяя make фиксированным массивом, проверяй границы и владение: возврат среза может перенести массив в кучу."
    ],
    "versionNote": "В исходнике Go 1.17 неконстантный размер в HeapAllocReason исключает стековый make. В тегах 1.25.0 и 1.26.1 проверенный escape/utils.go одинаков и уже содержит гибридный путь; walkMakeSlice проверяет размер во время выполнения. Это не утверждение, что все оптимизации 1.25 и 1.26 одинаковы. Старые toolchain не запускались. Пакет примера использует синтаксис, совместимый с 1.17.",
    "sources": [
      {
        "title": "Escape analysis invariants — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/escape/escape.go"
      },
      {
        "title": "Heap allocation constraints — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/escape/utils.go"
      },
      {
        "title": "Stack limits — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ir/cfg.go"
      },
      {
        "title": "Dynamic make — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/cmd/compile/internal/walk/builtin.go"
      },
      {
        "title": "Go 1.26 compiler changes",
        "url": "https://go.dev/doc/go1.26#compiler"
      },
      {
        "title": "Escape analysis — Go 1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/cmd/compile/internal/escape/escape.go"
      }
    ],
    "practice": {
      "kind": "Проследи время жизни",
      "promptEN": "ReadLocal uses a returned pointer immediately, while SaveGlobal passes a pointer down to retain. Which call actually requires long-lived storage? Can Sum with n=8 and n=1024 have different allocation counts?",
      "promptRU": "ReadLocal сразу использует возвращённый указатель, а SaveGlobal передаёт указатель вниз в retain. Где действительно нужно длительное хранение? Может ли число аллокаций Sum различаться для n=8 и n=1024?",
      "pointsEN": [
        "SaveGlobal retains a pointer beyond the call; call direction is not the criterion.",
        "Inlining may eliminate the local helper allocation.",
        "A conditional stack path can handle the small slice and fall back to the heap for the larger one."
      ],
      "pointsRU": [
        "SaveGlobal сохраняет указатель за пределами вызова; направление вызова не является критерием.",
        "Inlining может устранить локальное выделение помощника.",
        "Условный стековый путь может обслужить маленький срез и перейти к куче для большого."
      ],
      "followUpEN": "What changes if Sum returns its slice instead of an integer?",
      "followUpRU": "Что изменится, если Sum вернёт срез вместо числа?"
    }
  },
  {
    "id": "c25",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim6",
    "qEN": "How do mcache, mcentral, mheap and scan/noscan fit together?",
    "qRU": "Как связаны mcache, mcentral, mheap и разделение scan/noscan?",
    "shortEN": "They are the allocator’s levels, from fast to slow. Each P has an mcache with one cached span per size class, separately for scan and noscan, so a small allocation usually takes the next free slot without locks. A full span is replaced from the shared mcentral of that class, mcentral takes pages from mheap, and mheap asks the OS; objects over 32 KiB go straight to mheap. The GC never looks inside noscan objects, though it still frees them.",
    "anchorsEN": [
      "mcache per P: span per class × scan/noscan",
      "mcentral per class: shared refill",
      "mheap: 8 KiB pages ← OS; > 32 KiB direct",
      "noscan: GC skips the contents"
    ],
    "jvmEN": "This is similar to TLABs in the JVM: each thread allocates from its own buffer without locks. The difference is that the JVM bumps a pointer in a contiguous buffer and compacts later, while Go hands out fixed-size slots from spans and never moves objects.",
    "detailsEN": [
      "A runtime heap page is 8 KiB, independent of the OS page size. An mspan describes a contiguous run of one or more pages. A small-object span holds equal-sized slots; size classes round requests up, so object size and span size are different.",
      "mcache is owned by a P, not a goroutine. A free slot in its cached span can be allocated without a lock. Refill may need sweeping and shared structures; mcentral manages partial/full, swept/unswept span sets, not one simple spinlock per size. mheap supplies page runs. An allocation can also incur zeroing and GC assist costs.",
      "Eligible pointer-free objects smaller than 16 bytes may share a 16-byte tiny block. Small size classes extend to 32 KiB, but payload routing must include metadata: the generic mallocgc path uses size ≤ 32768−8. Larger requests use the large-object path. These are version-specific details, not public API boundaries.",
      "scan/noscan depends on whether the allocated object contains GC pointers. The bytes behind a []byte or string contain no pointers; the slice/string descriptor does contain a data pointer. A []string backing array contains string descriptors and therefore pointers. In the code, Blob is pointer-free but Holder is not.",
      "noscan means no pointer traversal inside that object. The GC still marks its reachability, accounts for it and can reclaim it when unreachable. Compact data and numeric offsets can reduce scanning, but do not make total GC time O(1) or zero; serialization, metadata, retained capacity and lifetime still matter."
    ],
    "practicalRU": "Сравни alloc_space, inuse_space и метрики /gc/scan/heap:bytes и /gc/scan/stack:bytes при одинаковой нагрузке. Разделяй объём выделений, удержание и объём сканируемой памяти. Массив байтов может почти не добавлять pointer scanning и одновременно удерживать много RAM. Нельзя считать разные размеры/схемы хранения честным сравнением только по паузе одного GC. Опора: «размер ячейки → откуда берётся span → есть ли внутри ссылки».",
    "code": "package example\n\ntype Blob [64]byte // The payload has no pointers.\n\ntype Holder struct {\n\tBytes []byte // The descriptor points to a backing array.\n\tText  string // The descriptor points to string bytes.\n}\n\n// A []Holder backing array contains pointers.\n// A []Blob backing array does not; neither is exempt from GC.",
    "shortRU": "Это уровни аллокатора — от быстрого к медленному. У каждого P есть mcache с одним спаном на каждый класс размера, отдельно для scan и noscan, поэтому малое выделение обычно берёт следующую свободную ячейку без блокировок. Заполненный спан заменяется из общего mcentral этого класса, mcentral берёт страницы у mheap, а mheap просит память у ОС; объекты больше 32 КиБ идут сразу в mheap. Внутрь noscan-объектов GC не заглядывает, хотя освобождает их.",
    "jvmRU": "Это похоже на TLAB в JVM: каждый поток выделяет из своего буфера без блокировок. Разница в том, что JVM сдвигает указатель в непрерывном буфере и потом уплотняет, а Go раздаёт ячейки фиксированного размера из спанов и никогда не перемещает объекты.",
    "detailsRU": [
      "Страница кучи рантайма — 8 KiB, независимо от размера страницы ОС. mspan описывает непрерывную область из одной или нескольких страниц. Span небольших объектов содержит ячейки одинакового размера; классы округляют запрос вверх, поэтому размер объекта и span — разные величины.",
      "mcache принадлежит P, а не горутине. Свободную ячейку его кешированного span можно выделить без блокировки. Пополнение может потребовать sweep и общие структуры; mcentral управляет наборами partial/full и swept/unswept, а не одним простым spinlock на размер. mheap выдаёт области страниц. Возможны также расходы на обнуление и помощь GC.",
      "Подходящие объекты без указателей размером менее 16 байт могут делить блок 16 байт. Классы небольших объектов доходят до 32 KiB, но при выборе пути нужно учитывать метаданные: общий путь mallocgc использует size ≤ 32768−8. Более крупный запрос идёт по пути large object. Это детали версии, а не публичные границы API.",
      "scan/noscan определяется указателями GC внутри выделенного объекта. Байты за []byte или string указателей не содержат, но дескриптор среза/строки содержит указатель на данные. Массив под []string содержит дескрипторы строк, значит, и указатели. В коде Blob не содержит указателей, а Holder содержит.",
      "noscan означает отсутствие обхода указателей внутри объекта. GC всё ещё отмечает его достижимость, учитывает память и может освободить её, когда объект недостижим. Компактные данные и числовые смещения сокращают сканирование, но не делают весь GC O(1) или нулевым: остаются сериализация, метаданные, удержанная capacity и время жизни."
    ],
    "versionNote": "Числа и внутренние пути приведены для Go 1.26.1 обычной сборки; инструментация и специальные пути могут отличаться. В проверенном mcentral Go 1.25.0 уже есть наборы partial/full с состоянием sweep. Стековые оптимизации компилятора и аллокатор кучи — разные уровни; noscan не отменяет достижимость. Пример — компилируемые объявления типов, не тест производительности.",
    "sources": [
      {
        "title": "Heap allocator — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/malloc.go"
      },
      {
        "title": "Size classes — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/gc/sizeclasses.go"
      },
      {
        "title": "mcache — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mcache.go"
      },
      {
        "title": "mcentral — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/mcentral.go"
      },
      {
        "title": "GC marking, including noscan — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcmark.go"
      },
      {
        "title": "Runtime scan metrics — Go 1.26.1",
        "url": "https://pkg.go.dev/runtime/metrics@go1.26.1"
      },
      {
        "title": "GC guide: allocation costs and profiling",
        "url": "https://go.dev/doc/gc-guide"
      }
    ],
    "practice": {
      "kind": "Отдели данные от дескриптора",
      "promptEN": "A heap-allocated Holder refers to a large []byte and a string. Which objects contain pointers? Does noscan mean the backing bytes cannot be collected?",
      "promptRU": "Holder в куче ссылается на большой []byte и строку. Какие объекты содержат указатели? Означает ли noscan, что лежащие за ними байты нельзя собрать?",
      "pointsEN": [
        "Holder contains data pointers in its slice and string descriptors.",
        "The referenced byte storage has no pointers to traverse.",
        "Reachability still matters: bytes remain while referenced and can be collected once unreachable."
      ],
      "pointsRU": [
        "Holder содержит указатели на данные в дескрипторах среза и строки.",
        "В самих байтах нет указателей для обхода.",
        "Достижимость остаётся важной: байты удерживаются ссылками и могут быть собраны, когда становятся недостижимыми."
      ],
      "followUpEN": "What changes if []byte is replaced with []string?",
      "followUpRU": "Что изменится, если вместо []byte использовать []string?"
    }
  },
  {
    "id": "c26",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim6",
    "qEN": "How does Go's GC decide what to keep, and what happens during a collection?",
    "qRU": "Как GC в Go решает, что сохранить, и из каких этапов состоит сборка?",
    "shortEN": "It keeps everything reachable from the roots, mainly goroutine stacks and globals, and frees the rest; since it traces instead of counting references, unreachable cycles are freed too. A cycle has a short stop-the-world pause that turns on the write barrier, concurrent marking, a second short pause, and background sweeping. Grey objects are found but not yet scanned, black ones are done, and what stays white is garbage. The collector neither moves objects nor has generations.",
    "anchorsEN": [
      "reachable from roots: stacks, globals",
      "STW → concurrent mark → STW → sweep",
      "white / grey / black",
      "non-moving, non-generational"
    ],
    "jvmEN": "Unlike G1, HotSpot’s default collector, Go’s GC has no young generation, and unlike any HotSpot collector it never moves objects, so there is no compaction. The trade-off is that Go relies on escape analysis to keep short-lived values off the heap in the first place.",
    "detailsEN": [
      "Roots include live pointers in goroutine stacks, globals and runtime structures outside the heap. A reachable object stays alive even if the application no longer needs it. A cycle with no path from any root can be collected: this is tracing, not reference counting.",
      "In the teaching model, white means not yet marked, grey means marked with outgoing pointers still to scan, and black means scanned. Colours describe work, not fields in each object. Root jobs and heap scanning can interleave; scanning a stack temporarily stops that goroutine.",
      "First, STW finishes any pending sweep and prepares marking, including enabling the write barrier. Concurrent marking then traces roots and heap pointers; allocating goroutines may assist. Objects allocated during marking are treated as black. Termination must account for outstanding root jobs and buffered work, not just one empty queue.",
      "A second STW transition finishes marking and prepares sweeping. Sweep reclaims unmarked slots in the background and on allocation paths. Scavenging returns unused physical memory to the OS separately; freeing an object does not promise an immediate RSS drop.",
      "Pauses have no fixed duration guarantee. Cost depends on live data, pointer layout, roots, allocation rate and workload. Green Tea improves marking/scanning locality and CPU scalability; it does not turn this into a moving or generational collector."
    ],
    "practicalRU": "На интервью начни с «GC сохраняет достижимое», затем назови фазы. В примере глобальный root удерживает цикл из двух узлов: после GC чтение даёт 42. После удаления последнего пути от корней цикл можно собрать, но точный момент освобождения и падение RSS не обещаем. Для удержания памяти ищи путь от корня: глобальный кеш, живую горутину, срез. Опора: «нашли → просмотрели → освободили»; отдельно объясни, почему кольцо ссылок само себя не удерживает.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\nvar root *Node\n\nfunc makeCycle() {\n\ta, b := &Node{Value: 7}, &Node{Value: 42}\n\ta.Next, b.Next = b, a\n\troot = a\n}\n\nfunc main() {\n\tmakeCycle()\n\truntime.GC()\n\tfmt.Println(root.Next.Value) // 42: reachable through a global\n\troot = nil\n\truntime.GC() // The cycle is now collectible; no RSS promise.\n}",
    "shortRU": "Он оставляет всё, что достижимо от корней — в основном стеков горутин и глобальных переменных, — и освобождает остальное; раз он трассирует, а не считает ссылки, недостижимые циклы тоже освобождаются. Цикл: короткая пауза stop-the-world включает барьер записи, конкурентная разметка, вторая короткая пауза и фоновый sweep. Серые объекты найдены, но не просмотрены, чёрные просмотрены, а оставшиеся белыми — мусор. Объекты сборщик не перемещает и на поколения не делит.",
    "jvmRU": "В отличие от G1, сборщика HotSpot по умолчанию, у GC Go нет молодого поколения, а в отличие от любого сборщика HotSpot он никогда не перемещает объекты, поэтому уплотнения нет. Цена — Go полагается на escape analysis, чтобы короткоживущие значения вообще не попадали в кучу.",
    "detailsRU": [
      "Корни включают живые указатели в стеках горутин, глобальных переменных и структурах runtime вне кучи. Достижимый объект удерживается, даже если приложению он уже не нужен. Цикл без пути от корней можно собрать: это обход графа, а не подсчёт ссылок.",
      "В учебной модели белый означает «ещё не отмечен», серый — «отмечен, исходящие указатели ещё нужно просмотреть», чёрный — «просмотрен». Цвета описывают работу, а не поля каждого объекта. Обработка корней и объектов кучи может чередоваться; при сканировании стека соответствующая горутина временно останавливается.",
      "Сначала STW завершает оставшийся sweep и подготавливает разметку, включая барьер записи. Затем конкурентная разметка обходит корни и указатели кучи; выделяющие память горутины могут помогать. Объекты, выделенные во время marking, считаются чёрными. Для завершения нужно учесть задания корней и буферизованную работу, а не только одну пустую очередь.",
      "Второй переход STW завершает разметку и подготавливает очистку. Sweep освобождает неотмеченные ячейки фоново и на путях аллокации. Scavenger отдельно возвращает неиспользуемую физическую память ОС; освобождение объекта не обещает немедленного снижения RSS.",
      "Фиксированная длительность пауз не гарантируется. Стоимость зависит от живых данных, расположения указателей, корней, скорости аллокаций и нагрузки. Green Tea улучшает локальность разметки/сканирования и масштабирование по CPU; сборщик не становится перемещающим или поколенческим."
    ],
    "versionNote": "Модель проверена по runtime Go 1.26.1, не является гарантией спецификации. В Go 1.17 уже есть конкурентный mark-and-sweep и hybrid barrier. Green Tea: эксперимент GOEXPERIMENT=greenteagc в 1.25, по умолчанию в 1.26. Цвета остаются полезной моделью, но не точным описанием очередей новой реализации.",
    "sources": [
      {
        "title": "GC phases and roots — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go"
      },
      {
        "title": "Go GC guide: reachability and costs",
        "url": "https://go.dev/doc/gc-guide"
      },
      {
        "title": "Green Tea design",
        "url": "https://go.dev/blog/greenteagc"
      },
      {
        "title": "Go 1.26: Green Tea enabled by default",
        "url": "https://go.dev/doc/go1.26#runtime"
      },
      {
        "title": "Historical GC — Go 1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/mgc.go"
      }
    ],
    "practice": {
      "kind": "Найди путь от корня",
      "promptEN": "Two heap nodes point to each other. A global cache points to one of them. Can GC reclaim the cycle? What changes when you clear the cache entry and no other root reaches either node?",
      "promptRU": "Два узла в куче ссылаются друг на друга. Глобальный кеш ссылается на один из них. Может ли GC собрать цикл? Что изменится, если удалить запись кеша и других путей от корней нет?",
      "pointsEN": [
        "The cache keeps both nodes reachable.",
        "Without a path from a root, the cycle can be collected; a reference count is not required.",
        "Collection does not guarantee an immediate drop in process RSS."
      ],
      "pointsRU": [
        "Кеш сохраняет достижимость обоих узлов.",
        "Без пути от корня цикл можно собрать; подсчёт ссылок не нужен.",
        "Сборка не гарантирует немедленного падения RSS процесса."
      ],
      "followUpEN": "During concurrent marking, is an empty local work queue enough to declare marking finished?",
      "followUpRU": "Достаточно ли пустой локальной очереди, чтобы объявить конкурентную разметку законченной?"
    }
  },
  {
    "id": "c27",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim6",
    "qEN": "How do GC phases, mark assists, GOGC and GOMEMLIMIT affect memory and latency?",
    "qRU": "Как фазы GC, mark assist, GOGC и GOMEMLIMIT влияют на память и задержки?",
    "shortEN": "GOGC and GOMEMLIMIT trade memory for GC CPU, and latency comes mostly from mark assists, where goroutines that allocate during marking do GC work themselves. GOGC sets how much the heap may grow between cycles: at 100, the goal is the live heap plus (live heap + roots), roughly double. GOMEMLIMIT is a soft limit: near it the GC runs more often, but it is no OOM guard, because live data cannot be collected and GC CPU is capped at about 50%, so memory may overshoot.",
    "anchorsEN": [
      "GOGC: growth per cycle (100 ≈ ×2)",
      "goal = live + (live + roots) × GOGC/100",
      "GOMEMLIMIT: soft; GC ≤ ~50% CPU",
      "latency: assists more than pauses"
    ],
    "jvmEN": "Go has no -Xmx: by default the heap simply grows as needed, and GOMEMLIMIT acts as a soft version of it. There is no catchable OutOfMemoryError either: when memory really runs out, the runtime aborts or the OS kills the process.",
    "detailsEN": [
      "A useful four-stage model is mark setup during STW, concurrent marking, mark termination during STW, then concurrent sweeping. Sweep termination precedes setup. Sweeping reclaims dead slots; returning pages to the OS is separate scavenger work. No fixed pause duration is guaranteed.",
      "Mark assists make allocating goroutines contribute tracing work according to allocation debt. This can add request latency. In Go 1.26.1 the background marking target is about 25% of GOMAXPROCS CPU capacity during marking, not a cap on all GC CPU usage.",
      "For estimates, heap goal = live heap + (live heap + roots) × GOGC / 100. With 100 MiB live and 20 MiB roots, GOGC=100 gives 220 MiB, not 200 MiB. The trigger is earlier than the goal; minimums, pacing and the memory limit affect the actual target.",
      "GOMEMLIMIT accounts for runtime memory as MemStats.Sys − MemStats.HeapReleased. This includes more than the heap but excludes C allocations, manually mmap-ed memory and the executable. It is neither process RSS nor a container limit. The runtime adjusts GC and memory release; it may exceed the budget to preserve progress.",
      "If reachable data cannot fit, collecting more often cannot remove it. Leave measured headroom for memory outside Go and workload spikes. Even with GOGC=off, a finite memory limit can drive GC. A lower limit can increase collection work rather than solve a leak."
    ],
    "practicalRU": "Сначала сравни память runtime, RSS/память контейнера, живую кучу, скорость аллокаций и GC CPU. Затем найди удержание данных и горячие выделения через профили и trace. Для контейнера 4 GiB значение 3600 MiB может быть лишь стартовой гипотезой после оценки резерва; оно не гарантирует отсутствие OOM. Снижай ненужные выделения и ограничивай кеши/конкурентность. sync.Pool рассматривай только для измеренного переиспользования: он не задаёт предел памяти и не гарантирует сохранение объектов. Опора для памяти: «цель — когда начать — что учитывает бюджет».",
    "code": "// Conceptual estimates, not executable Go or an exact pacer trace.\nheapGoal ≈ liveHeap + (liveHeap + roots) * GOGC / 100\n100 MiB + (100 MiB + 20 MiB) * 100 / 100 = 220 MiB\n// Marking starts before the goal; the limit may lower the goal.\nruntimeMemory = MemStats.Sys - MemStats.HeapReleased\n// runtimeMemory != process RSS != container memory usage",
    "shortRU": "GOGC и GOMEMLIMIT меняют память на CPU для GC, а задержки в основном дают mark assist — горутины, которые выделяют память во время разметки, сами делают работу GC. GOGC задаёт, насколько куча может вырасти между циклами: при 100 цель — «живая куча + (живая куча + корни)», то есть примерно вдвое. GOMEMLIMIT — мягкий лимит: рядом с ним GC работает чаще, но от OOM он не защищает: живые данные не собрать, а CPU для GC ограничен примерно 50%, поэтому память может выйти за лимит.",
    "jvmRU": "В Go нет -Xmx: по умолчанию куча просто растёт по мере надобности, а GOMEMLIMIT — его мягкий вариант. Нет и OutOfMemoryError, который можно поймать: когда память действительно кончается, рантайм аварийно завершается или процесс убивает ОС.",
    "detailsRU": [
      "Полезная модель из четырёх этапов: подготовка разметки в STW, конкурентная разметка, завершение разметки в STW и конкурентная очистка. Перед подготовкой завершается предыдущая очистка. Sweep освобождает мёртвые ячейки; возврат страниц ОС — отдельная работа scavenger. Фиксированная длительность паузы не гарантируется.",
      "Mark assist заставляет выделяющую память горутину выполнить часть обхода соразмерно долгу за аллокации. Это может увеличить задержку запроса. В Go 1.26.1 цель фоновой разметки — около 25% CPU-мощности GOMAXPROCS во время marking, а не предел всех затрат GC.",
      "Для оценки: цель кучи = живая куча + (живая куча + корни) × GOGC / 100. При 100 MiB живых данных, 20 MiB корней и GOGC=100 получится 220 MiB, а не 200 MiB. Запуск происходит раньше достижения цели; минимумы, pacer и лимит памяти влияют на фактическую цель.",
      "GOMEMLIMIT учитывает память runtime как MemStats.Sys − MemStats.HeapReleased. Это больше, чем одна куча, но сюда не входят C-аллокации, ручной mmap и исполняемый файл. Это не RSS процесса и не лимит контейнера. Runtime регулирует GC и возврат памяти, но может превысить бюджет ради продолжения работы.",
      "Если достижимые данные не помещаются, более частый GC не сможет их удалить. Нужен измеренный запас для памяти вне Go и всплесков нагрузки. Даже при GOGC=off конечный лимит памяти может запускать GC. Снижение лимита способно увеличить работу сборщика вместо устранения утечки."
    ],
    "versionNote": "Go 1.17: в формуле ещё нет учёта корней, GOMEMLIMIT отсутствует. Корни включены с 1.18, мягкий лимит — с 1.19. В 1.25 Green Tea экспериментальный; в 1.26 включён по умолчанию и меняет организацию marking/scanning, но не превращает GOMEMLIMIT в жёсткий предел. Детали pacer проверены по Go 1.26.1; формула — учебная оценка, не точная трасса runtime.",
    "sources": [
      {
        "title": "Go GC guide: goals, memory limit and diagnostics",
        "url": "https://go.dev/doc/gc-guide"
      },
      {
        "title": "debug.SetMemoryLimit — Go 1.26.1",
        "url": "https://pkg.go.dev/runtime/debug@go1.26.1#SetMemoryLimit"
      },
      {
        "title": "GC phases — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go"
      },
      {
        "title": "GC pacer — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go"
      },
      {
        "title": "Go 1.18: roots in GC pacing",
        "url": "https://go.dev/doc/go1.18#runtime"
      },
      {
        "title": "Go 1.26: Green Tea default, previously experimental in 1.25",
        "url": "https://go.dev/doc/go1.26#runtime"
      },
      {
        "title": "sync.Pool contract — Go 1.26.1",
        "url": "https://pkg.go.dev/sync@go1.26.1#Pool"
      }
    ],
    "practice": {
      "kind": "Раздели цель и лимит",
      "promptEN": "A service has 100 MiB of live heap and 20 MiB of roots. With GOGC=100, is 220 MiB the point where GC must start? Will a 4 GiB GOMEMLIMIT protect a 4 GiB container when a C library allocates another 1 GiB?",
      "promptRU": "У сервиса 100 MiB живой кучи и 20 MiB корней. При GOGC=100 обязан ли GC начаться ровно на 220 MiB? Защитит ли GOMEMLIMIT=4GiB контейнер 4 GiB, если C-библиотека выделяет ещё 1 GiB?",
      "pointsEN": [
        "220 MiB is the simplified heap goal, not the start trigger.",
        "C memory is outside the runtime budget; equal limits leave no allowance for it.",
        "Choose headroom from measurements and reduce live data or workload if it cannot fit."
      ],
      "pointsRU": [
        "220 MiB — упрощённая цель кучи, а не порог запуска.",
        "Память C не входит в бюджет runtime; равные лимиты не оставляют для неё запаса.",
        "Резерв выбирают по измерениям; если живые данные не помещаются, нужно уменьшить их или нагрузку."
      ],
      "followUpEN": "If GOGC is off but GOMEMLIMIT is finite, can automatic collection still happen?",
      "followUpRU": "Если GOGC выключен, но GOMEMLIMIT конечен, возможна ли автоматическая сборка?"
    }
  },
  {
    "id": "c28",
    "mod": "m4",
    "modName": "4. Memory, Allocator & GC",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim6",
    "qEN": "What does Go's hybrid write barrier protect, and which pointer writes need it?",
    "qRU": "Что защищает гибридный барьер записи Go и при каких записях указателей он нужен?",
    "shortEN": "It protects concurrent marking: while the GC marks, the program keeps changing pointers, and the barrier stops it from hiding a reachable object. Go’s hybrid barrier shades the old target of a pointer write and, while the current stack is grey, the new one. Thanks to that, writes to a goroutine’s own stack need no barrier, and each stack is scanned only once, with no rescan at the end. It is not a lock and does not fix data races.",
    "anchorsEN": [
      "shade(*slot): old target (Yuasa)",
      "shade(ptr) while stack grey (Dijkstra)",
      "new objects born black",
      "stack scanned once → no STW rescan"
    ],
    "jvmEN": "Java’s G1 uses a snapshot-at-the-beginning barrier, which matches only the deletion half of Go’s; it needs no insertion half because it scans thread stacks in a stop-the-world pause, while Go scans stacks concurrently. G1 also needs card marking because it is generational and moves objects; Go’s collector does neither.",
    "detailsEN": [
      "Imagine A is already scanned, B is not yet scanned, and B points to an unmarked C. Moving that link from B to A could make a plain concurrent traversal miss C. The barrier records pointer changes so C remains protected even if the collector has passed A and has not reached B.",
      "The hybrid combines deletion shading of the old target with insertion shading of the new target. In the theoretical algorithm, insertion shading is needed while the current stack is grey. The Go 1.26.1 implementation does not test that stack colour for each store: compiler-generated code records relevant old/new pointers in a write-barrier buffer. Safe cases can be eliminated; shading is not necessarily an immediate scan.",
      "This is not heap-only: storing heap pointers into globals also needs protection. The compiler omits barriers for writes it proves target the current stack frame. A store through a pointer passed to a callee may still get a barrier because that pointer could target the heap. Even writing nil may need the deletion part.",
      "The hybrid design removed the need for an end-of-mark STW rescan of stacks in Go 1.8. Ordinary stack scanning still happens, once per cycle, and objects allocated during marking are born black. Barriers are enabled for marking; phase transitions still need STW. Do not confuse this GC mechanism with atomic operations, locks or a CPU memory fence.",
      "Go 1.26.1 uses a non-generational, non-compacting heap collector: it does not divide collection by object age or relocate live heap objects to pack them together. Goroutine stacks can move. Escape analysis and size classes reduce some costs, but do not prove generations unnecessary or fragmentation impossible."
    ],
    "practicalRU": "Проговори по схеме: «A уже прошли, B ещё нет; переносим B → C в A → C; C нельзя потерять». В Go-коде барьер вставляет компилятор — вручную вызывать runtime не нужно. Пример требует разных ненулевых a и b и исключительного доступа к обоим узлам. Для совместного доступа нужна своя синхронизация. sync.Pool используй после измерений: Get не обязан вернуть прежний объект, содержимое может исчезнуть в любой момент; ускорение в 5–10 раз и переиспользование на том же P не гарантируются.",
    "code": "package example\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\n// Move requires distinct, non-nil nodes and exclusive access.\nfunc Move(a, b *Node) {\n\ta.Next = b.Next\n\tb.Next = nil // Deleting a pointer can also need a GC barrier.\n}\n\n// Compiler-generated barriers protect GC, not concurrent callers.\n// White/grey/black states are a teaching model, not observable here.",
    "shortRU": "Он защищает конкурентную разметку: пока GC размечает, программа меняет указатели, и барьер не даёт ей спрятать достижимый объект. Гибридный барьер Go красит старую цель записи указателя и, пока стек текущей горутины серый, новую. Благодаря этому записи в собственный стек горутины барьера не требуют, а каждый стек сканируется один раз, без повторного сканирования в конце. Это не блокировка, и data race он не исправляет.",
    "jvmRU": "G1 в Java использует барьер snapshot-at-the-beginning — он совпадает только с deletion-половиной барьера Go; insertion-половина G1 не нужна, потому что стеки потоков он сканирует в паузе stop-the-world, а Go сканирует стеки конкурентно. Ещё G1 нужен card marking, потому что он поколенческий и перемещает объекты; сборщик Go не делает ни того, ни другого.",
    "detailsRU": [
      "Представь: A уже просмотрен, B ещё нет, а B ссылается на неотмеченный C. Если перенести эту связь из B в A, простой конкурентный обход может пропустить C. Барьер учитывает изменения указателей и защищает C, даже если сборщик уже прошёл A, но ещё не дошёл до B.",
      "Гибрид сочетает deletion shading старой цели и insertion shading новой. В теоретическом алгоритме новая цель требует shading, пока текущий стек серый. Реализация Go 1.26.1 не проверяет цвет стека при каждой записи: сгенерированный компилятором код заносит нужные старые/новые указатели в буфер барьера. Доказанно безопасные случаи можно исключить; shading не означает немедленный обход объекта.",
      "Это не только куча: запись указателя на объект кучи в глобальную переменную тоже требует защиты. Компилятор убирает барьер, когда доказал запись в текущий кадр стека. Запись через переданный вызываемой функции указатель может получить барьер: такой указатель мог бы вести в кучу. Даже запись nil может требовать deletion-части.",
      "Гибридная схема убрала необходимость повторного сканирования стеков в конце marking во время STW в Go 1.8. Обычное сканирование стеков осталось — один раз за цикл, а объекты, созданные во время разметки, сразу чёрные. Барьеры включены для marking; переходы фаз всё ещё требуют STW. Не путай этот механизм GC с атомиками, блокировками или барьером памяти CPU.",
      "В Go 1.26.1 сборщик кучи непоколенческий и без compaction: он не разделяет сборки по возрасту объектов и не перемещает живые объекты кучи для уплотнения. Стеки горутин могут переезжать. Escape analysis и классы размеров снижают часть затрат, но не доказывают ненужность поколений или невозможность фрагментации."
    ],
    "versionNote": "Hybrid barrier — с Go 1.8, поэтому уже присутствует в 1.17. Компилятор и буферизация проверены по Go 1.26.1. Green Tea был экспериментальным в 1.25 и стал стандартным в 1.26; это изменение организации разметки, а не замена барьера блокировкой приложения.",
    "sources": [
      {
        "title": "Hybrid write barrier, stack/global writes — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mbarrier.go"
      },
      {
        "title": "Compiler: barrier insertion and elimination — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssa/writebarrier.go"
      },
      {
        "title": "Write-barrier buffering — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mwbbuf.go"
      },
      {
        "title": "Go 1.8: eliminate STW stack rescanning",
        "url": "https://go.dev/doc/go1.8#runtime"
      },
      {
        "title": "Collector properties — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go"
      },
      {
        "title": "sync.Pool contract — Go 1.26.1",
        "url": "https://pkg.go.dev/sync@go1.26.1#Pool"
      }
    ],
    "practice": {
      "kind": "Объясни потерянную связь",
      "promptEN": "A is black, B is grey, C is white, and B.Next points to C. The program executes Move(A, B). Why could a traversal without a barrier miss C? Does the GC barrier make concurrent calls to Move safe?",
      "promptRU": "A чёрный, B серый, C белый; B.Next указывает на C. Программа выполняет Move(A, B). Почему обход без барьера мог бы пропустить C? Делает ли GC-барьер конкурентные вызовы Move безопасными?",
      "pointsEN": [
        "The collector has passed A; when it later scans B, B.Next is nil.",
        "Recording the inserted and deleted pointers prevents C from being hidden.",
        "The barrier protects GC reachability, not application access; concurrent mutation still needs synchronization."
      ],
      "pointsRU": [
        "Сборщик уже прошёл A; когда он дойдёт до B, B.Next будет nil.",
        "Учёт вставленного и удалённого указателей не даёт скрыть C.",
        "Барьер защищает достижимость для GC, а доступ приложения требует собственной синхронизации."
      ],
      "followUpEN": "Why can storing nil or storing a pointer into a global still require a barrier?",
      "followUpRU": "Почему запись nil или указателя в глобальную переменную тоже может потребовать барьера?"
    }
  },
// ==========================================
  // МОДУЛЬ 5: МАПЫ (SWISSTABLES), ИНТЕРФЕЙСЫ, DEFER И GO 1.24–1.25+ (Q29 - Q38)
  // ==========================================
  {
    "id": "c29",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "What do a slice and a string refer to, and when does append allocate a new backing array?",
    "qRU": "На что ссылаются срез и строка и когда append выделяет новый базовый массив?",
    "shortEN": "A slice is a small header, a pointer, a length and a capacity, that views an underlying array; a string is a pointer and a length over immutable bytes. Copying either one copies only the header, so two slices can share elements. append writes in place while len < cap and allocates a new, bigger array when capacity runs out: about double for small slices, moving towards 1.25× for large ones.",
    "anchorsEN": [
      "slice = ptr + len + cap; string = ptr + len",
      "copy = new header, shared array",
      "len < cap → in place, else new array",
      "growth: ×2 small → ×1.25 large"
    ],
    "jvmEN": "A slice is closer to a view of an ArrayList than to a Java array: two slices can share one array, and append may or may not create a new one, so always use the slice that append returns. Go strings are immutable bytes, usually UTF-8, not UTF-16 chars as in Java.",
    "detailsEN": [
      "In the standard 64-bit runtime layout, a slice has a data pointer, len and cap (three words, usually 24 bytes); a string has a data pointer and byte length (two words, usually 16 bytes). These are not portable language constants. len(string) counts bytes, not Unicode code points.",
      "Assigning b := a copies the slice descriptor. Index writes can affect both views. append returns an updated descriptor: it does not change the len stored in a different slice variable. Draw the descriptors separately from their shared array.",
      "a[:len(a):len(a)] restricts the capacity of that view. Appending at least one element must then use a new array, but index writes before that append still share storage. make plus copy creates independent element storage; pointers or nested slices inside the elements can still share their targets.",
      "In Go 1.25 and 1.26 growslice, a request larger than twice the old capacity uses the requested length as a starting capacity. Otherwise small capacities below 256 double; larger ones use a smooth transition towards 1.25×. Allocation rounding can change the final cap. Go 1.17 used a threshold of 1024 and a different transition. None of these formulas is a language guarantee."
    ],
    "practicalRU": "Опора для памяти: len — что видно; cap — место для append; copy — отдельное хранилище элементов. На интервью сначала предскажи общие записи, затем обсуждай формулу роста. Если итоговый размер известен, можно заранее выделить место; число аллокаций измеряй, а не угадывай по cap.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ta := make([]int, 2, 4)\n\ta[0], a[1] = 1, 2\n\tlimited := a[:len(a):len(a)]\n\tlimited[0] = 9\n\tgrown := append(limited, 3)\n\tgrown[0] = 7\n\tindependent := make([]int, len(a))\n\tcopy(independent, a)\n\tindependent[1] = 8\n\tfmt.Println(a, grown, independent)\n}",
    "shortRU": "Срез — небольшой заголовок из указателя, длины и ёмкости, который смотрит на массив; строка — указатель и длина над неизменяемыми байтами. Копирование любого из них копирует только заголовок, поэтому два среза могут делить элементы. append пишет на месте, пока len < cap, а когда ёмкость кончается, выделяет новый, больший массив: примерно вдвое для малых срезов и ближе к 1,25 раза для больших.",
    "jvmRU": "Срез ближе к представлению над ArrayList, чем к массиву Java: два среза могут делить один массив, а append может создать новый, а может и нет, поэтому всегда используй срез, который вернул append. Строки Go — неизменяемые байты, обычно UTF-8, а не символы UTF-16, как в Java.",
    "detailsRU": [
      "В стандартной реализации на 64-битной платформе у среза указатель, len и cap (три машинных слова, обычно 24 байта); у строки указатель и длина в байтах (два слова, обычно 16 байт). Это не переносимые константы языка. len(string) считает байты, а не Unicode-кодовые точки.",
      "Присваивание b := a копирует дескриптор среза. Запись по индексу может быть видна через оба среза. append возвращает обновлённый дескриптор: len другой переменной он не меняет. Рисуй дескрипторы отдельно от общего массива.",
      "a[:len(a):len(a)] ограничивает capacity этого представления. Добавление хотя бы одного элемента потребует нового массива, но запись по индексу до append всё ещё затрагивает общие данные. make плюс copy отделяет хранилище элементов; указатели или вложенные срезы внутри элементов могут по-прежнему разделять свои данные.",
      "В growslice Go 1.25 и 1.26 запрос больше удвоенной старой capacity берёт требуемую длину как начальную capacity. Иначе capacity меньше 256 удваивается, а для больших применяется плавный переход к 1.25×. Округление аллокатора может изменить итоговый cap. В Go 1.17 порог был 1024, переход — другим. Ни одна из этих формул не является гарантией языка."
    ],
    "versionNote": "Семантика примера одинакова в Go 1.17, 1.25 и 1.26. Рост capacity сверён отдельно по go1.17, go1.25.0 и go1.26.1; точный cap после роста не входит в контракт.",
    "sources": [
      {
        "title": "Go 1.26.1 language specification",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Go 1.17: growslice",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/slice.go"
      },
      {
        "title": "Go 1.25.0: nextslicecap / growslice",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/slice.go"
      },
      {
        "title": "Go 1.26.1: nextslicecap / growslice",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/slice.go"
      }
    ],
    "practice": {
      "kind": "Предскажи → нарисуй → объясни",
      "promptEN": "Before running the example, predict all three slices. Which write is visible through a, and which two are isolated?",
      "promptRU": "До запуска предскажи три среза. Какая запись видна через a, а какие две отделены?",
      "pointsEN": [
        "The output is [9 2] [7 2 3] [9 8].",
        "The full slice expression alone still shares storage, so limited[0] changes a[0].",
        "The append exceeds the limited capacity; make plus copy also creates independent element storage."
      ],
      "pointsRU": [
        "Вывод: [9 2] [7 2 3] [9 8].",
        "Полное выражение среза само по себе сохраняет общий массив, поэтому limited[0] меняет a[0].",
        "append превышает ограниченную capacity; make плюс copy тоже создаёт отдельное хранилище элементов."
      ],
      "followUpEN": "Replace []int with []*int. Does copying the slice also copy the pointed-to integers?",
      "followUpRU": "Замени []int на []*int. Копируются ли вместе со срезом числа, на которые указывают элементы?"
    },
    "quizIds": [
      "q12"
    ]
  },
  {
    "id": "c30",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim7",
    "qEN": "How did classic Go maps use buckets and incremental growth before Swiss Tables?",
    "qRU": "Как классические map до Swiss Tables использовали бакеты и постепенное расширение?",
    "shortEN": "Before Go 1.24 a map was an array of 2^B buckets, each holding eight keys and values plus eight tophash bytes, with overflow buckets chained when a bucket filled up. The low bits of the hash chose the bucket, and the top byte filtered candidates before the keys were compared. When the average load passed 6.5 per bucket, the map doubled, and the copying, called evacuation, was spread over later writes instead of done at once.",
    "anchorsEN": [
      "2^B buckets × 8 slots + overflow chain",
      "low bits → bucket; tophash → filter",
      "load > 6.5 → double",
      "evacuation spread over writes"
    ],
    "jvmEN": "Java’s HashMap also uses buckets, but each bucket is a linked list that becomes a tree after eight entries, and resizing copies everything at once. Go’s old map kept eight entries per bucket inline and grew incrementally.",
    "detailsEN": [
      "In the Go 1.17 implementation, low hash bits select one of 2^B primary buckets. Each bucket has eight tophash bytes, grouped keys and values, and an overflow link. Occupied tophash values encode the high hash byte, adjusted to avoid reserved states; a match still needs key equality.",
      "The growth test combines a load threshold of about 6.5 entries per primary bucket with a minimum-entry condition. Too much load doubles the primary bucket count. Too many overflow buckets without excess load instead triggers same-size growth to reorganize chains.",
      "While growing, oldbuckets retains the old storage. growWork evacuates the relevant old bucket and may advance another. Each evacuation includes its overflow chain, and allocating the new bucket array also costs work. Incremental does not mean every mutation has a fixed time bound.",
      "A map index is not addressable under the language rules, so &m[k] is invalid in both old and new maps. For map[K]Struct, read a value, modify the copy, then assign it back. map[K]*Struct allows pointed-to mutation, but shared access still requires synchronization."
    ],
    "practicalRU": "Опора: загрузка → больше бакетов; overflow → возможно прежний размер. Отделяй историческую реализацию от контракта языка. На обычном интервью сначала объясни обновление значения map, затем детали эвакуации.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\n\nfunc main() {\n\tm := map[string]Counter{\"go\": {N: 1}}\n\tv := m[\"go\"]\n\tv.N++\n\tfmt.Println(m[\"go\"].N)\n\tm[\"go\"] = v\n\tfmt.Println(m[\"go\"].N)\n}",
    "shortRU": "До Go 1.24 map была массивом из 2^B бакетов, в каждом — восемь ключей и значений и восемь байтов tophash; когда бакет заполнялся, к нему цеплялись overflow-бакеты. Младшие биты хеша выбирали бакет, а старший байт отсеивал кандидатов до сравнения ключей. Когда средняя загрузка превышала 6,5 на бакет, map удваивалась, а копирование — эвакуация — растягивалось на последующие записи, а не делалось сразу.",
    "jvmRU": "HashMap в Java тоже использует бакеты, но каждый бакет — связный список, который после восьми записей превращается в дерево, а при расширении всё копируется сразу. Старая map в Go хранила восемь записей прямо в бакете и росла постепенно.",
    "detailsRU": [
      "В реализации Go 1.17 младшие биты хеша выбирают один из 2^B основных бакетов. В каждом — восемь байтов tophash, сгруппированные ключи и значения и ссылка overflow. Занятые tophash кодируют старший байт хеша с поправкой на зарезервированные состояния; после совпадения всё равно сравниваются ключи.",
      "Условие роста сочетает порог около 6.5 элементов на основной бакет с проверкой минимального числа элементов. Избыточная загрузка удваивает число основных бакетов. Если велико только число overflow-бакетов, выполняется перестройка прежнего размера для переупаковки цепочек.",
      "Во время роста oldbuckets удерживает старое хранилище. growWork эвакуирует нужный старый бакет и может продвинуть ещё один. Эвакуация включает overflow-цепочку; выделение нового массива бакетов тоже требует работы. Постепенность не означает фиксированного времени каждой операции.",
      "По правилам языка индекс map не является адресуемым, поэтому &m[k] недопустимо и в старых, и в новых map. Для map[K]Struct нужно прочитать значение, изменить копию и записать её обратно. map[K]*Struct позволяет менять объект по указателю, но совместный доступ всё равно требует синхронизации."
    ],
    "versionNote": "Историческое устройство сверено по Go 1.17. Swiss Tables стали стандартом в Go 1.24. В Go 1.25 ещё есть экспериментальный переключатель SwissMap; в Go 1.26 он удалён, поэтому noswissmap нельзя предлагать как универсальный способ отката.",
    "sources": [
      {
        "title": "Go 1.26.1 language specification",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Classic map — Go 1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/map.go"
      },
      {
        "title": "Experiments — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/internal/goexperiment/flags.go"
      },
      {
        "title": "Experiments — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/goexperiment/flags.go"
      }
    ],
    "practice": {
      "kind": "Два похожих случая",
      "promptEN": "Predict the two printed values. Then explain why excessive load and excessive overflow do not always lead to the same growth operation.",
      "promptRU": "Предскажи два числа. Затем объясни, почему высокая загрузка и избыток overflow не всегда приводят к одинаковому росту.",
      "pointsEN": [
        "The example prints 1, then 2: v is a copied struct until it is stored back.",
        "Excess load grows the bucket count; excess overflow alone can rebuild at the same size.",
        "Map index addressability is a language rule, not a property to infer from a runtime version."
      ],
      "pointsRU": [
        "Пример печатает 1, затем 2: v — копия структуры до записи обратно.",
        "Избыточная загрузка увеличивает число бакетов; избыток только overflow допускает перестройку прежнего размера.",
        "Адресуемость индекса map задаётся языком, а не выводится из версии рантайма."
      ],
      "followUpEN": "What changes if the map stores *Counter? Which synchronization question remains?",
      "followUpRU": "Что изменится, если map хранит *Counter? Какой вопрос синхронизации останется?"
    }
  },
  {
    "id": "c31",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim7",
    "qEN": "How do Swiss Tables find a key and grow a Go map?",
    "qRU": "Как Swiss Tables находят ключ и расширяют map в Go?",
    "shortEN": "A Swiss-table map stores entries in groups of eight slots, each group with eight control bytes. The hash is split: the low 7 bits, H2, are a fingerprint kept in a control byte, and the rest, H1, chooses the group where probing starts. A lookup compares H2 with all eight control bytes at once, checks only the matching keys, and stops at a group that has an empty slot. Growth is per table: a table doubles up to 1024 slots and then splits.",
    "anchorsEN": [
      "group = 8 slots + 8 control bytes",
      "H1 → group, H2 → fingerprint",
      "match 8 bytes at once, compare candidates",
      "table doubles to 1024, then splits"
    ],
    "jvmEN": "Unlike Java’s HashMap with chained buckets, Swiss Tables use open addressing: there are no linked nodes, entries live in flat groups, so a lookup touches fewer cache lines. Growth also rehashes one table, not the whole map.",
    "detailsEN": [
      "Each group has eight control bytes and eight key/value slots. H2 uses the low seven hash bits; H1 uses the remaining bits for probing. On a 64-bit hash this is a 57/7 split, not a rule for every target. Occupied bytes hold H2, 0x80 means empty and 0xFE means deleted. The keys and values do not have to fit in one cache line.",
      "Metadata matching produces candidate slots, not a final answer. The portable SWAR implementation uses several arithmetic/bitwise operations and may include extra candidates; amd64 has a SIMD intrinsic. Actual key equality decides the match. Hashing, candidate loops and possible later groups still cost work.",
      "After checking candidates in a group, an empty slot ends an unsuccessful search. A deleted marker cannot end it: a key may have been placed farther along the probe sequence. Go uses quadratic group probing, not a linked overflow chain or a simple linear scan of groups.",
      "The single-group small-map representation can hold all eight entries. Tables generally reserve space with a 7/8 load limit, including tombstone accounting. A table grows by doubling up to 1024 slots; beyond that it splits. Directory growth can also be necessary. The bound is on one table, not on the entire map or the latency of an insertion.",
      "Both Go 1.25.0 and 1.26.1 can prune unneeded tombstones before growing, without moving live entries. This is best effort and does not shrink allocated table storage. Measure performance on the actual workload; neither a universal speedup percentage nor a p99 guarantee follows from the design."
    ],
    "practicalRU": "Цепочка для воспроизведения: отпечаток → сравнить ключ → остановиться или продолжить. Проговори её и объясни, почему совпадения H2 недостаточно и чем deleted отличается от empty. В sim7 есть разбор условной группы.",
    "code": "// Teaching trace, not executable Go or actual hashes.\n// Search key: \"go\", chosen H2: 0x2A\n// slot:    0      1       2       3      4      5      6      7\n// ctrl:   2A     19      2A      80     11     80     80     80\n// key:   \"rust\" \"c\"     \"go\"   empty  \"js\"  empty  empty  empty\n// 1. Fingerprints select candidate slots 0 and 2.\n// 2. \"rust\" != \"go\"; \"go\" == \"go\": return slot 2's value.\n// 3. Only if no candidate key matched would empty stop this search.",
    "shortRU": "Map на Swiss Tables хранит записи группами по восемь слотов, у каждой группы восемь управляющих байтов. Хеш делится: младшие 7 бит, H2, — отпечаток в управляющем байте, а остальные, H1, выбирают группу, с которой начинается пробирование. Поиск сравнивает H2 со всеми восемью управляющими байтами сразу, проверяет только совпавшие ключи и останавливается на группе, где есть пустой слот. Рост идёт по таблицам: таблица удваивается до 1024 слотов, а потом делится.",
    "jvmRU": "В отличие от HashMap в Java с цепочками в бакетах, Swiss Tables используют открытую адресацию: связанных узлов нет, записи лежат в плоских группах, поэтому поиск задевает меньше строк кеша. И при росте перехешируется одна таблица, а не вся map.",
    "detailsRU": [
      "В группе восемь управляющих байтов и восемь слотов ключ/значение. H2 — младшие семь бит хеша, H1 — оставшиеся биты для пробирования. Для 64-битного хеша это разбиение 57/7, но не правило для всех платформ. Занятый байт хранит H2, 0x80 означает empty, 0xFE — deleted. Ключи и значения не обязаны помещаться в одну кеш-линию.",
      "Сопоставление метаданных даёт слоты-кандидаты, а не окончательный ответ. Переносимая SWAR-реализация использует несколько арифметических и побитовых операций и может дать лишних кандидатов; на amd64 есть SIMD-интринсик. Решает сравнение самих ключей. Хеширование, цикл по кандидатам и следующие группы тоже требуют работы.",
      "После проверки кандидатов empty в группе завершает неуспешный поиск. Метка deleted его не завершает: искомый ключ мог разместиться дальше по последовательности проб. В Go применяется квадратичное пробирование групп, а не overflow-цепочка и не простой линейный обход групп.",
      "Малая map в представлении одной группы может хранить все восемь элементов. Для таблиц обычно действует порог 7/8 с учётом tombstones. Таблица удваивается до 1024 слотов, после чего делится; при этом может понадобиться рост директории. Ограничен размер одной таблицы, а не всей map и не время вставки.",
      "В Go 1.25.0 и 1.26.1 ненужные tombstones могут очищаться перед ростом без перемещения живых элементов. Это попытка освободить слоты, а не сжать выделенное хранилище таблицы. Производительность измеряй на своей нагрузке: из устройства не следует универсальный процент ускорения или гарантия p99."
    ],
    "versionNote": "Swiss Tables — стандартная map с Go 1.24. Детали здесь сверены для Go 1.25.0 и 1.26.1. pruneTombstones есть в обеих версиях; не следует приписывать его появление Go 1.26. Числа слотов и алгоритмы относятся к реализации.",
    "sources": [
      {
        "title": "Go 1.26.1 language specification",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Go 1.25.0: table growth, deletion, pruning",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/internal/runtime/maps/table.go"
      },
      {
        "title": "Go 1.26.1: table growth, deletion, pruning",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/table.go"
      },
      {
        "title": "Go 1.26.1: directory and Clear",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/map.go"
      },
      {
        "title": "Go 1.26.1: control-byte matching",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/group.go"
      }
    ],
    "practice": {
      "kind": "Проследи поиск без подсказки",
      "promptEN": "In the trace, can the lookup stop at empty before checking slot 2? If no key matched, what would change if every empty byte became deleted?",
      "promptRU": "Можно ли в схеме остановиться на empty до проверки слота 2? Если ключ не совпал, что изменится при замене всех empty на deleted?",
      "pointsEN": [
        "Check candidate keys first; the matching key at slot 2 wins even though the group also contains empty slots.",
        "Without a matching key, empty ends the search. Deleted does not: continue probing.",
        "H2 is a filter. Matching seven bits does not establish key equality."
      ],
      "pointsRU": [
        "Сначала сравни ключи кандидатов; ключ в слоте 2 найден, хотя в группе есть empty.",
        "Если ключ не найден, empty завершает поиск. Deleted — нет: нужно продолжить пробирование.",
        "H2 — фильтр. Совпадение семи бит не доказывает равенства ключей."
      ],
      "followUpEN": "Does a limit of 1024 slots per table mean a map can contain only 1024 keys or that every insert has constant latency?",
      "followUpRU": "Означает ли лимит 1024 слота на таблицу, что в map максимум 1024 ключа или что каждая вставка имеет постоянную задержку?"
    },
    "quizIds": [
      "q13"
    ]
  },
  {
    "id": "c32",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim7",
    "qEN": "What do delete and clear release, and what can you rely on during map iteration?",
    "qRU": "Что освобождают delete и clear и на что можно рассчитывать при обходе map?",
    "shortEN": "delete removes one entry and clear removes them all, so their keys and values can be collected if nothing else refers to them, but neither shrinks the map’s table: that memory stays until the whole map is dropped. To give it back after a spike, copy the live entries into a new map. Iteration order is unspecified and starts at a random place; an entry deleted before it is reached is not visited, and one added during iteration may or may not be.",
    "anchorsEN": [
      "delete / clear free entries, not the table",
      "rebuild the map to shrink it",
      "order unspecified, random start",
      "added during range: maybe visited"
    ],
    "jvmEN": "Like Java’s HashMap, a Go map never shrinks its table on remove or clear. Unlike HashMap, changing a Go map while ranging over it is allowed: there is no ConcurrentModificationException, only the unspecified visiting of new entries.",
    "detailsEN": [
      "Separate three layers: entries, table storage, and process RSS. In Go 1.25/1.26, delete and clear can remove references to payloads while keeping table capacity. Payloads are collectible only if no other references retain them; GC and returning memory to the OS are separate events.",
      "In Swiss tables, deleting from a group with an empty slot can leave empty; otherwise a deleted marker preserves the probe path. Tombstones can be reused or pruned during insertion in Go 1.25 and 1.26, and clear resets them. None of these operations promises table shrinking.",
      "Rebuilding a map can reduce retained table storage after a measured spike. The old map becomes collectible only after all references to it disappear. Copying entries is shallow: pointer values and nested slices may still share payloads. Coordinate replacement with readers and writers; do not rebuild periodically without evidence.",
      "The language does not specify map iteration order; two iterations can still happen to produce the same order. Deleting an entry not yet reached prevents it from being produced. An entry added during iteration may be visited or skipped. Nil maps have zero iterations; sort collected keys when a stable order is required."
    ],
    "practicalRU": "Опора: delete убирает запись; clear очищает общую map; присваивание меняет одну переменную. Перед выводом об утечке спроси, кто ещё держит ссылку. Отработай различие на примере и сравни с удержанием массива в q4.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tm := map[string]int{\"go\": 1}\n\talias := m\n\tm = make(map[string]int)\n\tfmt.Println(len(m), len(alias))\n\tclear(alias)\n\tfmt.Println(len(m), len(alias))\n}",
    "shortRU": "delete удаляет одну запись, clear — все, поэтому их ключи и значения можно собрать, если на них больше никто не ссылается, но ни то ни другое не уменьшает таблицу map: эта память остаётся, пока не отпустят всю map. Чтобы вернуть её после всплеска, скопируй живые записи в новую map. Порядок обхода не задан и начинается со случайного места; запись, удалённая до того, как до неё дошли, не встретится, а добавленная во время обхода — может встретиться, а может нет.",
    "jvmRU": "Как HashMap в Java, map в Go не уменьшает таблицу при удалении или clear. В отличие от HashMap, менять map в Go во время range можно: ConcurrentModificationException нет, есть только неопределённость, встретятся ли новые записи.",
    "detailsRU": [
      "Разделяй три уровня: записи, хранилище таблицы и RSS процесса. В Go 1.25/1.26 delete и clear могут убрать ссылки на данные, сохранив вместимость таблицы. Данные доступны для GC, только если их не удерживают другие ссылки; сборка и возврат памяти ОС — отдельные события.",
      "В Swiss Tables удаление из группы с пустым слотом может оставить empty; иначе deleted сохраняет путь поиска. В Go 1.25 и 1.26 tombstones могут переиспользоваться или очищаться при вставке, а clear их сбрасывает. Ни одна из этих операций не обещает сжатия таблицы.",
      "Перестройка map может уменьшить удерживаемое хранилище после измеренного пика. Старая map доступна для GC, только когда исчезнут все ссылки на неё. Копирование записей поверхностное: значения-указатели и вложенные срезы могут разделять данные. Замена должна быть согласована с читателями и писателями; без измерений не нужна периодическая перестройка.",
      "Язык не задаёт порядок обхода map; два обхода при этом могут случайно дать одинаковый порядок. Удалённая до посещения запись не будет выдана. Добавленная во время обхода запись может попасть в результат или быть пропущена. Nil-map даёт ноль итераций; для стабильного порядка собери и отсортируй ключи."
    ],
    "versionNote": "clear появился в Go 1.21; пример запускается в Go 1.25/1.26. В Go 1.17 для обычных строковых ключей можно удалять их циклом. Это не полная замена clear для ключей NaN: NaN не равен самому себе, поэтому delete по такому ключу его не находит.",
    "sources": [
      {
        "title": "Go 1.26.1 language specification",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Go 1.25.0: table growth, deletion, pruning",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/internal/runtime/maps/table.go"
      },
      {
        "title": "Go 1.26.1: table growth, deletion, pruning",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/table.go"
      },
      {
        "title": "Go 1.26.1: directory and Clear",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/map.go"
      },
      {
        "title": "Go 1.26.1: control-byte matching",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/group.go"
      }
    ],
    "practice": {
      "kind": "Кто ещё держит данные?",
      "promptEN": "Predict both output lines. Would m = nil also empty alias? What if alias still contains a pointer to a large object?",
      "promptRU": "Предскажи обе строки вывода. Очистит ли m = nil также alias? Что если alias всё ещё содержит указатель на большой объект?",
      "pointsEN": [
        "The output is 0 1, then 0 0: reassignment and clearing have different effects.",
        "Setting m to nil does not mutate the map retained by alias.",
        "An entry reachable through alias can retain its payload; clearing it only helps when no other reference retains that payload."
      ],
      "pointsRU": [
        "Вывод: 0 1, затем 0 0: замена переменной и очистка действуют по-разному.",
        "Присваивание m = nil не изменяет map, на которую ссылается alias.",
        "Достижимая через alias запись может удерживать данные; её очистка поможет, только если данные не удерживаются другой ссылкой."
      ],
      "followUpEN": "Why can delete(m, math.NaN()) fail to remove a NaN key while clear(m) still empties the map?",
      "followUpRU": "Почему delete(m, math.NaN()) может не удалить ключ NaN, а clear(m) всё равно очищает map?"
    }
  },
  {
    "id": "c33",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What does an interface value contain, and why can a typed nil make an interface non-nil?",
    "qRU": "Что хранит значение интерфейса и почему типизированный nil может дать ненулевой интерфейс?",
    "shortEN": "An interface value is two words: a pointer to type information, an itab for interfaces with methods, and a pointer to the data. It equals nil only when both are nil. So if a function returns a nil *MyError as error, the interface holds the type *MyError and a nil pointer, and err != nil is true. Return a literal nil for the no-error case, not a typed nil pointer.",
    "anchorsEN": [
      "interface = (type / itab, data)",
      "nil only if both are nil",
      "typed nil *T → non-nil interface",
      "return plain nil for success"
    ],
    "jvmEN": "Java has no such trap: a reference is either null or points to an object. In Go an interface carries its dynamic type separately from the value, so “a nil pointer of type T” and “no value at all” are different.",
    "detailsEN": [
      "For a basic interface used as a value type, assignment requires the concrete type to implement its methods. A type assertion x.(T) asks about the stored dynamic type; the comma-ok form reports failure without panicking. A successful assertion can still return a nil pointer.",
      "In the runtime, an empty interface has a type pointer and a data word; an interface with methods has an itab pointer and a data word. An itab pairs the interface and concrete type with method entry points. This is normally two machine words, or 16 bytes on a 64-bit target, not a portable language constant.",
      "The dynamic itab cache has a common lookup path without locking, but inserting a missing entry takes a lock. Describing the entire cache as lock-free is inaccurate. The compiler can also provide tables statically.",
      "Boxing, allocation and dispatch cost depend on the value, escape analysis, inlining and devirtualization. An interface call need not remain indirect after optimization. Neither an allocation for every conversion nor a blanket zero-allocation promise is correct.",
      "Interface equality can panic when equal dynamic types are not comparable, such as []int. Comparing that interface to nil is still valid. Typed nil, an incomparable dynamic value, and an ordinary nil interface are three different cases."
    ],
    "practicalRU": "Опора: «какой тип внутри → какое значение → что именно сравниваем». При успехе функции, возвращающей error, возвращай nil явно. Для производительности сначала измерь конкретный вызов, а не размер заголовка.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvar p *int\n\tvar x any = p\n\tfmt.Println(x == nil, p == nil)\n\tv, ok := x.(*int)\n\tfmt.Println(ok, v == nil)\n}",
    "shortRU": "Значение интерфейса — два слова: указатель на информацию о типе (для интерфейсов с методами — itab) и указатель на данные. Оно равно nil, только когда nil оба. Поэтому если функция возвращает nil *MyError как error, интерфейс хранит тип *MyError и nil-указатель, и err != nil истинно. Для случая «ошибки нет» возвращай литерал nil, а не типизированный nil-указатель.",
    "jvmRU": "В Java такой ловушки нет: ссылка либо null, либо указывает на объект. В Go интерфейс хранит динамический тип отдельно от значения, поэтому «nil-указатель типа T» и «никакого значения» — разные вещи.",
    "detailsRU": [
      "При присваивании в базовый интерфейс, используемый как тип значения, конкретный тип должен реализовать его методы. Утверждение x.(T) проверяет сохранённый динамический тип; форма comma-ok сообщает о неуспехе без panic. Успешное утверждение типа при этом может вернуть nil-указатель.",
      "В рантайме у пустого интерфейса указатель на тип и слово данных; у интерфейса с методами — указатель на itab и слово данных. Itab связывает интерфейс, конкретный тип и адреса методов. Обычно это два машинных слова, то есть 16 байт на 64-битной платформе, но не переносимая константа языка.",
      "У динамического кеша itab обычный путь поиска обходится без блокировки, но добавление отсутствующей записи берёт lock. Называть весь кеш lock-free неточно. Компилятор также может подготовить таблицы статически.",
      "Упаковка, аллокации и цена вызова зависят от значения, escape analysis, инлайнинга и девиртуализации. Вызов интерфейсного метода после оптимизации не обязан оставаться косвенным. Неверны и «каждое преобразование выделяет память», и универсальное обещание нулевых аллокаций.",
      "Сравнение интерфейсов может вызвать panic, если одинаковые динамические типы несравнимы, например []int. Сравнить такой интерфейс с nil всё ещё допустимо. Типизированный nil, несравнимое динамическое значение и обычный nil-интерфейс — три разных случая."
    ],
    "versionNote": "Правила nil и сравнения применимы к Go 1.17, 1.25 и 1.26. any — псевдоним interface{} с Go 1.18; для 1.17 замените any на interface{}. Внутренние eface/iface/getitab сверены по Go 1.26.1, не являются публичным API.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Interface layouts",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/runtime2.go"
      },
      {
        "title": "getitab and conversion paths",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/iface.go"
      }
    ],
    "practice": {
      "kind": "Тип → значение → сравнение",
      "promptEN": "Predict both lines. Can ok be true while v is nil? What changes if x contains []int{1}?",
      "promptRU": "Предскажи обе строки. Может ли ok быть true при v == nil? Что изменится, если x содержит []int{1}?",
      "pointsEN": [
        "The output is false true, then true true.",
        "The assertion succeeds because the dynamic type is *int; the pointer value is nil.",
        "An interface containing a slice is not nil. Comparing it with itself panics because slices are not comparable."
      ],
      "pointsRU": [
        "Вывод: false true, затем true true.",
        "Утверждение успешно: динамический тип — *int, а значение указателя — nil.",
        "Интерфейс со срезом не равен nil. Сравнение его с самим собой вызывает panic, потому что срезы несравнимы."
      ],
      "followUpEN": "Would a nil receiver always panic when its method is called? Explain what the method body does.",
      "followUpRU": "Всегда ли вызов метода с nil-ресивером вызывает panic? Объясни роль тела метода."
    }
  },
  {
    "id": "c34",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do method sets differ from the shorthand used to call pointer methods?",
    "qRU": "Чем набор методов типа отличается от сокращённой записи вызова pointer-метода?",
    "shortEN": "The method set of T contains only methods with a value receiver; the method set of *T contains both value-receiver and pointer-receiver methods. That decides which interfaces a type satisfies: if Set has a pointer receiver, *Counter implements Setter and Counter does not. Calling c.Set() on an addressable variable works only because Go rewrites it to (&c).Set(); a map element or a function result is not addressable, so there it fails.",
    "anchorsEN": [
      "T: value-receiver methods",
      "*T: value + pointer methods",
      "interfaces use method sets",
      "c.Set() = (&c).Set() only if addressable"
    ],
    "jvmEN": "Java has no value receivers: every method sees the object through a reference. In Go, choosing a value or a pointer receiver decides both whether the method can change the receiver and which interfaces the type satisfies.",
    "detailsEN": [
      "Interface satisfaction uses method sets, not call-site convenience. If Set is declared on *Counter, *Counter implements a Setter interface and Counter does not. Store &c when pointer methods are required; a heap-versus-stack decision is irrelevant to this rule.",
      "For an addressable c, c.Set(2) is shorthand for (&c).Set(2). This is a method-call rule. Map indexes and temporary results are not automatically made addressable, so the same shorthand is not always available.",
      "A value receiver copies the receiver value; a pointer receiver receives a pointer. Copying a struct with slices, maps or pointers is shallow, so a value receiver does not guarantee isolation from the original data.",
      "For map[K]Counter, read a value, modify the copy and store it back. Alternatively store *Counter when shared mutable identity is intended. Neither choice makes concurrent access safe by itself. Embedded methods follow additional promotion rules; start with the simple T/*T distinction."
    ],
    "practicalRU": "Два отдельных вопроса: «можно вызвать здесь?» и «реализует ли тип интерфейс?». Не объясняй второй автоматическим взятием адреса из первого. Карту методов восстанови на бумаге: T → value; *T → value + pointer.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\ntype Setter interface{ Set(int) }\n\nfunc (c *Counter) Set(n int) { c.N = n }\n\nvar _ Setter = (*Counter)(nil)\n\nfunc main() {\n\tc := Counter{N: 1}\n\tc.Set(2)\n\tvar s Setter = &c\n\ts.Set(3)\n\tfmt.Println(c.N)\n}",
    "shortRU": "Набор методов T содержит только методы с получателем-значением; набор методов *T — и методы со значением, и методы с указателем. От этого зависит, какие интерфейсы тип реализует: если у Set получатель-указатель, Setter реализует *Counter, а Counter — нет. Вызов c.Set() на адресуемой переменной работает только потому, что Go переписывает его в (&c).Set(); элемент map или результат функции не адресуемы, и там это не сработает.",
    "jvmRU": "В Java получателей-значений нет: каждый метод видит объект через ссылку. В Go выбор между значением и указателем в получателе решает и то, может ли метод менять получателя, и то, какие интерфейсы реализует тип.",
    "detailsRU": [
      "Реализация интерфейса проверяется по набору методов, а не по удобству записи вызова. Если Set объявлен у *Counter, интерфейс Setter реализует *Counter, но не Counter. Когда нужны pointer-методы, сохраняй &c; решение стек/куча к этому правилу не относится.",
      "Для адресуемой c вызов c.Set(2) сокращает (&c).Set(2). Это правило вызова метода. Индексы map и временные результаты не становятся адресуемыми автоматически, поэтому такая запись доступна не везде.",
      "Value-ресивер копирует значение ресивера; pointer-ресивер получает указатель. Копия структуры со срезами, map или указателями поверхностная, поэтому value-ресивер не гарантирует изоляции от исходных данных.",
      "Для map[K]Counter нужно прочитать значение, изменить копию и сохранить обратно. Можно хранить *Counter, если нужна общая изменяемая сущность. Ни один вариант сам по себе не делает конкурентный доступ безопасным. У встроенных методов есть дополнительные правила продвижения; начни с простого различия T/*T."
    ],
    "versionNote": "Правила набора методов и адресуемости здесь одинаковы в Go 1.17, 1.25 и 1.26. Пример не зависит от конкретного размещения объекта или формата itab.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      }
    ],
    "practice": {
      "kind": "Раздели два правила",
      "promptEN": "Why does c.Set(2) compile while var s Setter = c does not? Would m[0].Set(2) work for map[int]Counter?",
      "promptRU": "Почему c.Set(2) компилируется, а var s Setter = c — нет? Сработает ли m[0].Set(2) для map[int]Counter?",
      "pointsEN": [
        "c is addressable, so the method call can take its address.",
        "Counter lacks Set in its method set; *Counter implements Setter.",
        "A map index is not addressable. Modify a copy and write it back, or use pointer values deliberately."
      ],
      "pointsRU": [
        "c адресуема, поэтому при вызове можно взять её адрес.",
        "У Counter нет Set в наборе методов; Setter реализует *Counter.",
        "Индекс map неадресуем. Измени копию и запиши обратно либо осознанно храни указатели."
      ],
      "followUpEN": "Does copying a struct with a []byte field also copy the bytes?",
      "followUpRU": "Копирует ли value-ресивер байты поля []byte вместе со структурой?"
    }
  },
  {
    "id": "c35",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "When do deferred calls run, and where can recover stop a panic?",
    "qRU": "Когда выполняются отложенные вызовы и где recover может остановить panic?",
    "shortEN": "defer evaluates the function and its arguments right away and runs the call when the surrounding function returns or panics, in last-in, first-out order. Deferred calls run after the return values are set, so a deferred closure can still change a named result. recover stops a panic only when called directly in a deferred function of the panicking goroutine; a panic in another goroutine crashes the program.",
    "anchorsEN": [
      "args evaluated at defer, call at exit",
      "LIFO, after results are set",
      "named result can still change",
      "recover: directly in defer, same goroutine"
    ],
    "jvmEN": "defer is like finally or try-with-resources, but it is per function, not per block, so a defer inside a loop runs only when the function returns. recover is like catch, but it works only in a deferred function and only for its own goroutine; an uncaught panic in any goroutine kills the whole process.",
    "detailsEN": [
      "Passing x as an argument to a deferred call saves its current value. A deferred closure can instead read or modify an outer variable later. Named result parameters are variables, so a deferred closure can change the result after return expressions have been evaluated and assigned.",
      "Deferred calls belong to the function invocation, not to an iteration of a loop. For per-item resources, use a helper function with its own defer or explicitly release each resource. The immediate problem is lifetime, even if a particular compiler avoids an allocation.",
      "Recovery stops the panic only within the goroutine that is unwinding. The recovering function returns after its deferred calls; execution does not resume at the panicking statement. An ordinary helper called by a deferred function cannot recover on that deferred function’s behalf.",
      "The compiler may use open-coded defers or runtime defer records on the stack or heap. Go 1.26.1 considers the number of defers, escape information, return sites, instrumentation and build options. A short function is not an unconditional promise of open coding, zero allocations or nanosecond overhead.",
      "An unrecovered panic terminates the program. os.Exit skips deferred calls; fatal runtime failures are not ordinary recoverable panics. For expected failures, return errors. Recovering at a deliberate boundary must not silently turn failure into success."
    ],
    "practicalRU": "Опора: «сейчас сохранить аргументы → при return присвоить результат → выполнить defer в обратном порядке → вернуть результат». Сначала объясни эту цепочку без регистров; машинный код проверяй только для конкретной сборки.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc f() (n int) {\n\tn = 1\n\tdefer fmt.Println(\"arg\", n)\n\tdefer func() {\n\t\tn++\n\t\tfmt.Println(\"closure\", n)\n\t}()\n\treturn 2\n}\n\nfunc main() { fmt.Println(\"result\", f()) }",
    "shortRU": "defer сразу вычисляет функцию и её аргументы, а вызов выполняет, когда окружающая функция возвращается или паникует, в порядке «последний пришёл — первый ушёл». Отложенные вызовы идут после того, как заданы результаты, поэтому отложенное замыкание ещё может изменить именованный результат. recover останавливает панику, только если вызван напрямую в отложенной функции той горутины, которая паникует; паника в другой горутине роняет программу.",
    "jvmRU": "defer похож на finally или try-with-resources, но действует на функцию, а не на блок, поэтому defer внутри цикла выполнится только при выходе из функции. recover похож на catch, но работает только в отложенной функции и только для своей горутины; непойманная паника в любой горутине убивает весь процесс.",
    "detailsRU": [
      "Передача x аргументом отложенного вызова сохраняет его текущее значение. Отложенное замыкание может вместо этого позже читать или менять внешнюю переменную. Именованные результаты — переменные, поэтому замыкание может изменить результат после вычисления и присваивания выражений return.",
      "Отложенный вызов относится к вызову функции, а не к итерации цикла. Для ресурса на одну итерацию используй вспомогательную функцию со своим defer или явное освобождение. Первая проблема — время жизни, даже если компилятор избежал аллокации.",
      "Recover останавливает panic только в раскручиваемой горутине. Восстановившаяся функция возвращается после своих defer; выполнение не продолжается со строки panic. Обычный helper, вызванный отложенной функцией, не может выполнить recover вместо неё.",
      "Компилятор может использовать open-coded defer либо записи runtime на стеке или в куче. Go 1.26.1 учитывает число defer, escape-информацию, точки возврата, инструментирование и настройки сборки. Короткая функция не даёт безусловной гарантии open coding, нулевых аллокаций или наносекундной стоимости.",
      "Неперехваченный panic завершает программу. os.Exit пропускает defer; фатальные ошибки runtime не являются обычными перехватываемыми panic. Ожидаемые ошибки возвращай через error. Recover на выбранной границе не должен молча превращать ошибку в успех."
    ],
    "versionNote": "Основная семантика defer/recover одинакова в Go 1.17, 1.25 и 1.26. В Go 1.21+ при эффективном panicnil=0 вызов panic(nil) даёт ненулевой *runtime.PanicNilError в recover; panicnil=1 сохраняет историческое поведение. Эффективный default зависит также от языковой версии главного модуля. Здесь примеры используют ненулевой panic. Критерии open coding сверены по Go 1.26.1.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Compiler defer selection",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/walk/stmt.go"
      },
      {
        "title": "Additional open-defer conditions",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssagen/ssa.go"
      },
      {
        "title": "Panic and recovery",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/panic.go"
      }
    ],
    "practice": {
      "kind": "Восстанови порядок",
      "promptEN": "Predict all three output lines. Which defer uses a saved argument and which observes the named result after return 2?",
      "promptRU": "Предскажи три строки. Какой defer использует сохранённый аргумент, а какой видит именованный результат после return 2?",
      "pointsEN": [
        "return assigns n=2 before deferred calls.",
        "The last registered closure increments n to 3 and prints closure 3.",
        "The earlier call prints arg 1; main then prints result 3."
      ],
      "pointsRU": [
        "return присваивает n=2 до отложенных вызовов.",
        "Последнее зарегистрированное замыкание увеличивает n до 3 и печатает closure 3.",
        "Ранее зарегистрированный вызов печатает arg 1; затем main печатает result 3."
      ],
      "followUpEN": "If the deferred closure instead accepted n as an int argument, would incrementing that parameter change the result?",
      "followUpRU": "Если замыкание принимает n аргументом типа int, изменит ли увеличение этого параметра возвращаемый результат?"
    },
    "quizIds": [
      "q19"
    ]
  },
  {
    "id": "c36",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "When should you use weak pointers, unique handles and runtime cleanups?",
    "qRU": "Когда нужны weak-указатели, unique handles и runtime cleanups?",
    "shortEN": "weak.Pointer lets you look at an object without keeping it alive, for caches; unique.Make returns one canonical handle per distinct value, so equal values compare as cheaply as pointers; runtime.AddCleanup runs a function some time after an object becomes unreachable. They came in Go 1.23 and 1.24 and solve different problems. None of them replaces an explicit Close: a cleanup may run late or never, for example at exit.",
    "anchorsEN": [
      "weak.Pointer: observe, don’t keep alive",
      "unique.Make: one handle per value",
      "AddCleanup: after unreachable, maybe never",
      "explicit Close still required"
    ],
    "jvmEN": "These map onto Java’s WeakReference, String.intern generalised to any comparable value, and Cleaner. As with Cleaner, a Go cleanup is a safety net, not a substitute for closing resources.",
    "detailsEN": [
      "After the target becomes unreachable, weak.Pointer.Value may return nil; it is not guaranteed eventually to do so. Read Value once and keep the returned strong pointer while using it. runtime.KeepAlive can extend reachability through the last operation that needs the object; it is not a lock.",
      "unique.Make was introduced in Go 1.23. Handles canonicalize comparable values and make repeated equality checks cheap; Make still performs work and may allocate. Handle.Value returns a shallow copy. This is not a claim that the package uses the built-in Swiss map or that every workload becomes faster.",
      "weak and AddCleanup arrived in Go 1.24. AddCleanup’s callback and argument must not retain the target, directly or indirectly. Passing the target itself as arg panics. Go 1.26.1 also checks direct closure captures and pointer arguments into the target allocation; Go 1.25 lacks those extra checks. These are not general graph checks: indirect retention can still prevent cleanup. Automatic cache-key removal remains application work.",
      "Cleanups can become eligible for unreachable cycles and multiple cleanups may attach to one allocation. They have no specified order, may run concurrently, and are not guaranteed before program exit or for every allocation. SetFinalizer still exists; AddCleanup does not promise immediate memory release or solve every retention cycle.",
      "Use explicit Close or another ownership protocol for scarce resources. A cleanup is a fallback; explicit release and callbacks must coordinate to avoid double release and races. Cleanup.Stop prevents a not-yet-queued cleanup but does not wait for an already running one. To guarantee cancellation, keep the target reachable across Stop. Tiny/zero-size allocations and object reachability need care."
    ],
    "practicalRU": "Три вопроса: «наблюдать без удержания?» → weak; «сравнивать повторяющиеся значения?» → unique; «запасное освобождение после потери владельца?» → cleanup. Не строй тест на предположении, что один runtime.GC() обязательно вызовет callback.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n\t\"unique\"\n\t\"weak\"\n)\n\nfunc main() {\n\tobj := &struct{ Value int }{Value: 42}\n\tw := weak.Make(obj)\n\tgot := w.Value()\n\tfmt.Println(got == obj)\n\truntime.KeepAlive(obj)\n\ta := unique.Make(\"go\")\n\tb := unique.Make(string([]byte{'g', 'o'}))\n\tfmt.Println(a == b)\n}",
    "shortRU": "weak.Pointer позволяет смотреть на объект, не удерживая его, — для кешей; unique.Make возвращает один канонический дескриптор на каждое различное значение, поэтому равные значения сравниваются так же дёшево, как указатели; runtime.AddCleanup запускает функцию через какое-то время после того, как объект стал недостижим. Они появились в Go 1.23 и 1.24 и решают разные задачи. Ни один не заменяет явный Close: очистка может выполниться поздно или никогда, например при выходе.",
    "jvmRU": "Это аналоги WeakReference, String.intern для любого сравнимого значения и Cleaner из Java. Как и Cleaner, очистка в Go — страховка, а не замена закрытию ресурсов.",
    "detailsRU": [
      "После недостижимости объекта weak.Pointer.Value может вернуть nil; гарантии, что это когда-нибудь произойдёт, нет. Прочитай Value один раз и держи полученный сильный указатель, пока используешь объект. runtime.KeepAlive продлевает достижимость до последней нужной операции, но не является блокировкой.",
      "unique.Make появился в Go 1.23. Handles канонизируют сравнимые значения и удешевляют повторные сравнения; сам Make выполняет работу и может выделять память. Handle.Value возвращает поверхностную копию. Это не утверждение об использовании обычной Swiss map или ускорении любой нагрузки.",
      "weak и AddCleanup появились в Go 1.24. Callback и аргумент AddCleanup не должны прямо или косвенно удерживать целевой объект. Передача самого объекта как arg вызывает panic. Go 1.26.1 дополнительно проверяет прямой захват замыканием и аргумент-указатель внутрь целевой аллокации; в Go 1.25 этих дополнительных проверок нет. Это не полный анализ графа: косвенное удержание всё ещё может помешать cleanup. Удаление ключей кеша остаётся задачей приложения.",
      "Cleanups могут стать доступными для запуска для недостижимых циклов; к одной аллокации можно привязать несколько. Порядок не задан, выполнение может быть конкурентным, запуск до выхода программы и для каждой аллокации не гарантирован. SetFinalizer сохраняется; AddCleanup не обещает немедленного освобождения памяти и не устраняет любое циклическое удержание.",
      "Для дефицитных ресурсов используй явный Close или другой протокол владения. Cleanup — запасной путь; явное освобождение и callbacks должны координироваться против двойного освобождения и гонок. Cleanup.Stop предотвращает ещё не поставленный в очередь cleanup, но не ждёт уже выполняющийся. Для гарантированной отмены цель должна оставаться достижимой на протяжении Stop. Нужно учитывать tiny/zero-size аллокации и достижимость."
    ],
    "versionNote": "unique — Go 1.23; weak и AddCleanup — Go 1.24. Пример требует Go 1.24+. Контракт владения общий для Go 1.25/1.26; в 1.26.1 проверены дополнительные runtime-проверки прямого самозахвата cleanup. Не переносим дату появления самих API на 1.26. В Go 1.17 этих API нет.",
    "sources": [
      {
        "title": "API additions — Go 1.23",
        "url": "https://github.com/golang/go/blob/go1.23.0/api/go1.23.txt"
      },
      {
        "title": "API additions — Go 1.24",
        "url": "https://github.com/golang/go/blob/go1.24.0/api/go1.24.txt"
      },
      {
        "title": "weak.Pointer contract",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/weak/pointer.go"
      },
      {
        "title": "unique.Handle and Make",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/unique/handle.go"
      },
      {
        "title": "AddCleanup and Cleanup.Stop",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mcleanup.go"
      },
      {
        "title": "Cleanup contract — Go 1.25",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/mcleanup.go"
      }
    ],
    "practice": {
      "kind": "Выбери механизм и проверь владение",
      "promptEN": "A cache stores weak pointers. Does a dead target automatically remove its key? What if the cleanup closure captures the target?",
      "promptRU": "Кеш хранит weak-указатели. Исчезает ли ключ автоматически после потери объекта? Что если cleanup-замыкание захватывает сам объект?",
      "pointsEN": [
        "The map entry remains until application code removes or replaces it.",
        "A retaining closure is invalid: Go 1.26.1 can reject a direct capture; indirect retention can still keep the target reachable.",
        "Use one Value result while accessing the object; never require an exact GC cycle or cleanup deadline."
      ],
      "pointsRU": [
        "Запись map сохраняется, пока код приложения не удалит или не заменит её.",
        "Удерживающее цель замыкание недопустимо: Go 1.26.1 может отвергнуть прямой захват, а косвенный всё ещё может сохранять достижимость.",
        "Используй один результат Value при доступе к объекту; не требуй точного цикла GC или срока cleanup."
      ],
      "followUpEN": "Why is an explicit Close still needed when a cleanup exists?",
      "followUpRU": "Почему при наличии cleanup всё равно нужен явный Close?"
    }
  },
  {
    "id": "c37",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "deep",
    "levelLabel": "🔴 Deep Dive + Prod Cases",
    "simId": "sim1",
    "qEN": "How do push iterators differ from iter.Pull, and when must you call stop?",
    "qRU": "Чем push-итераторы отличаются от iter.Pull и когда нужно вызывать stop?",
    "shortEN": "A push iterator, iter.Seq, is a function that calls yield for each value; range over it passes the loop body as yield, and when the loop breaks, yield returns false and the iterator must stop. iter.Pull turns it into a pair of functions, next and stop, for when you need values one at a time, for example to merge two sequences. If you quit before next reports the end, call stop, usually with defer, so the iterator can clean up.",
    "anchorsEN": [
      "iter.Seq: the iterator calls yield",
      "break → yield returns false → stop",
      "iter.Pull → next, stop",
      "defer stop() if you quit early"
    ],
    "jvmEN": "A push iterator is like Iterable.forEach with a way to break out, and iter.Pull gives you a Java-style Iterator, with hasNext and next folded into one next. stop plays the role of closing a Stream that holds resources.",
    "detailsEN": [
      "iter.Seq[V] is func(yield func(V) bool). A range-over-function loop supplies the loop body as yield; break makes yield return false. The iterator must return instead of calling yield again. The push form does not itself promise zero allocations or a new goroutine.",
      "Pull returns next() (V, bool) and stop(). After exhaustion or stop, next keeps returning the zero value and false. Calling stop repeatedly is allowed. Deferring stop immediately after Pull covers early return, break and panic in the consumer.",
      "Do not call next or stop simultaneously from multiple goroutines. A sequence may also have a single-use contract; the type alone does not guarantee replayability. Panics in the iterator are propagated through next or stop.",
      "Go 1.26.1 implements Pull using an internal coroutine handoff between goroutines. This is a runtime optimization, not a public coroutine API or a fixed nanosecond guarantee. Iterator code may block or run other code; do not infer permanent thread affinity or universal allocation counts from the fast handoff path."
    ],
    "practicalRU": "Опора: push → «получаю через yield»; pull → «запрашиваю next»; ранний выход → stop. На интервью сначала объясни владение завершением, затем внутренний coro. Схема sim1 даёт общий контекст горутин, а не точную трассу iter.Pull.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"iter\"\n)\n\nfunc Backward(s []int) iter.Seq[int] {\n\treturn func(yield func(int) bool) {\n\t\tfor i := len(s) - 1; i >= 0; i-- {\n\t\t\tif !yield(s[i]) {\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}\n}\n\nfunc main() {\n\tnext, stop := iter.Pull(Backward([]int{1, 2, 3}))\n\tdefer stop()\n\tv, ok := next()\n\tfmt.Println(v, ok)\n\tstop()\n\tv, ok = next()\n\tfmt.Println(v, ok)\n}",
    "shortRU": "Push-итератор, iter.Seq, — функция, которая вызывает yield для каждого значения; range по нему передаёт тело цикла как yield, а когда цикл прерывается, yield возвращает false, и итератор должен остановиться. iter.Pull превращает его в пару функций next и stop — когда значения нужны по одному, например чтобы слить две последовательности. Если бросаешь раньше, чем next сообщит о конце, вызови stop, обычно через defer, чтобы итератор мог освободить ресурсы.",
    "jvmRU": "Push-итератор похож на Iterable.forEach с возможностью выйти, а iter.Pull даёт Iterator в стиле Java, где hasNext и next слиты в одну next. stop играет роль закрытия Stream, который держит ресурсы.",
    "detailsRU": [
      "iter.Seq[V] — это func(yield func(V) bool). Цикл range по функции передаёт своё тело как yield; break приводит к false из yield. Итератор должен вернуться, а не вызывать yield снова. Push-форма сама по себе не обещает нулевых аллокаций или создания новой горутины.",
      "Pull возвращает next() (V, bool) и stop(). После конца или stop функция next продолжает возвращать нулевое значение и false. Повторный stop допустим. Сразу отложенный stop покрывает ранний return, break и panic у потребителя.",
      "Нельзя одновременно вызывать next или stop из нескольких горутин. Последовательность может иметь контракт одноразового использования; один тип не гарантирует повторяемость. Panic внутри итератора передаётся через next или stop.",
      "Go 1.26.1 реализует Pull через внутреннюю передачу управления между горутинами. Это оптимизация runtime, а не публичный API корутин или гарантия наносекунд. Код итератора может блокироваться и вызывать другой код; из быстрого пути нельзя выводить постоянную привязку к потоку или универсальное число аллокаций."
    ],
    "versionNote": "iter и range-over-function доступны с Go 1.23; пример применим к Go 1.25/1.26. В Go 1.17 можно писать обычный цикл или свой callback, но пакета iter и такого range ещё нет. Детали coro проверены по Go 1.26.1.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "API additions — Go 1.23",
        "url": "https://github.com/golang/go/blob/go1.23.0/api/go1.23.txt"
      },
      {
        "title": "iter.Pull contract and implementation",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/iter/iter.go"
      },
      {
        "title": "Internal coroutine handoff",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/coro.go"
      }
    ],
    "practice": {
      "kind": "Кто завершает итератор?",
      "promptEN": "Predict the output. Why does the deferred second call to stop remain valid? How would you check that an iterator’s defer ran on early stop?",
      "promptRU": "Предскажи вывод. Почему второй, отложенный stop допустим? Как проверить выполнение defer итератора при раннем stop?",
      "pointsEN": [
        "The output is 3 true, then 0 false.",
        "stop is idempotent under the API contract; after stop, next reports completion.",
        "Use an iterator with a deferred completion marker, consume one value, call stop and check the marker. Do not infer completion from a sleep."
      ],
      "pointsRU": [
        "Вывод: 3 true, затем 0 false.",
        "По контракту повторный stop допустим; после stop функция next сообщает о завершении.",
        "Используй итератор с отложенной отметкой завершения, прочитай одно значение, вызови stop и проверь отметку. Sleep не доказывает завершение."
      ],
      "followUpEN": "Does a reusable iterator type guarantee that a particular sequence can be traversed twice?",
      "followUpRU": "Гарантирует ли тип итератора, что конкретную последовательность можно пройти дважды?"
    }
  },
  {
    "id": "c38",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim2",
    "qEN": "What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?",
    "qRU": "Что именно гарантируют GOMAXPROCS с учётом контейнера, synctest и FlightRecorder?",
    "shortEN": "All three came with Go 1.25. GOMAXPROCS now defaults to the container’s CPU limit on Linux and follows changes to it, unless you set it explicitly. testing/synctest runs a test in a bubble with fake time that jumps forward when every goroutine in the bubble is blocked, so tests with timeouts run instantly and deterministically. trace.FlightRecorder keeps the last few seconds of execution trace in memory, so you can save it when something goes wrong.",
    "anchorsEN": [
      "GOMAXPROCS follows the cgroup CPU limit",
      "an explicit setting disables updates",
      "synctest: fake time jumps when all blocked",
      "FlightRecorder: rolling trace, save on demand"
    ],
    "jvmEN": "The JVM has been container-aware since Java 10, and Java Flight Recorder is the closest analogue to FlightRecorder. synctest has no direct Java equivalent; the nearest is injecting a fake Clock into the code under test.",
    "detailsEN": [
      "Default GOMAXPROCS considers logical CPUs, process affinity and, on Linux, cgroup CPU bandwidth quota. Quota is CPU limit, not CPU request or the number of OS threads. Fractional quota rounds up; the runtime normally keeps at least 2 unless CPU count or affinity is below 2. Defaults and periodic updates depend on GODEBUG and the main module’s language version.",
      "A positive GOMAXPROCS environment value or a GOMAXPROCS(n>0) call selects a manual setting and disables automatic updates. GOMAXPROCS(0) only queries. SetDefaultGOMAXPROCS restores the runtime default and automatic behavior while still respecting GODEBUG. Updating the toolchain alone does not necessarily change an older module’s defaults.",
      "synctest.Test runs a self-contained bubble with fake time. Time advances when all its goroutines are durably blocked; Wait waits for the other goroutines to reach that state. Bubble channels, timers and supported waits matter. Mutex/RWMutex locking, real I/O and syscalls are not durable blocking under this contract. Synctest does not prove correctness or remove every source of flakiness.",
      "FlightRecorder must be started, checked for errors and eventually stopped. WriteTo snapshots recorded trace data and can fail; only one WriteTo may run at a time. Serialize application snapshot requests or handle that error. Tracing overhead depends on workload, so measure it.",
      "MinAge is a retention target rather than “exactly the last N seconds”. MaxBytes takes precedence, is a sizing hint and does not strictly cap snapshot size or total memory overhead. New recordings cannot contain history from before Start. Handle writer/close errors and avoid uncontrolled repeated dumps."
    ],
    "practicalRU": "Не учи три API одной фразой. Спроси отдельно: «кто выбирает параллелизм?», «почему движется тестовое время?», «какую историю успели записать?». Пример проверяет дедлайн искусственным временем; это не ожидание реальной секунды.",
    "code": "package apis\n\nimport (\n\t\"context\"\n\t\"testing\"\n\t\"testing/synctest\"\n\t\"time\"\n)\n\nfunc TestDeadline(t *testing.T) {\n\tsynctest.Test(t, func(t *testing.T) {\n\t\tctx, cancel := context.WithTimeout(context.Background(), time.Second)\n\t\tdefer cancel()\n\t\tif ctx.Err() != nil {\n\t\t\tt.Fatal(\"deadline fired early\")\n\t\t}\n\t\ttime.Sleep(time.Second)\n\t\tsynctest.Wait()\n\t\tif ctx.Err() != context.DeadlineExceeded {\n\t\t\tt.Fatalf(\"got %v\", ctx.Err())\n\t\t}\n\t})\n}",
    "shortRU": "Все три появились в Go 1.25. GOMAXPROCS по умолчанию теперь берётся из лимита CPU контейнера на Linux и следует за его изменениями, если не задать его явно. testing/synctest запускает тест в «пузыре» с поддельным временем, которое прыгает вперёд, когда все горутины пузыря заблокированы, поэтому тесты с таймаутами проходят мгновенно и детерминированно. trace.FlightRecorder держит в памяти трассу последних секунд, и её можно сохранить, когда что-то пошло не так.",
    "jvmRU": "JVM учитывает контейнер с Java 10, а ближайший аналог FlightRecorder — Java Flight Recorder. Прямого аналога synctest в Java нет; ближе всего — подставить поддельный Clock в тестируемый код.",
    "detailsRU": [
      "GOMAXPROCS по умолчанию учитывает логические CPU, affinity процесса и, в Linux, cgroup CPU bandwidth quota. Квота — CPU limit, а не CPU request и не число потоков ОС. Дробная квота округляется вверх; рантайм обычно сохраняет минимум 2, кроме случая, когда число CPU или доступность по affinity меньше 2. Начальные значения и автообновления зависят от GODEBUG и языковой версии главного модуля.",
      "Положительный GOMAXPROCS в окружении или вызов GOMAXPROCS(n>0) задаёт ручное значение и отключает автообновления. GOMAXPROCS(0) только читает настройку. SetDefaultGOMAXPROCS возвращает выбор runtime и автоматическое поведение, продолжая учитывать GODEBUG. Одно обновление toolchain не обязательно меняет defaults старого модуля.",
      "synctest.Test запускает изолированный bubble с искусственным временем. Время движется, когда все его горутины устойчиво заблокированы; Wait ждёт такого состояния у остальных горутин. Важны каналы bubble, таймеры и поддерживаемые ожидания. Mutex/RWMutex, настоящее I/O и системные вызовы не считаются durable blocking по этому контракту. Synctest не доказывает корректность и не убирает любую нестабильность.",
      "FlightRecorder нужно запустить, обработать ошибки и в конце остановить. WriteTo делает снимок trace и может завершиться ошибкой; одновременно допустим только один WriteTo. Сериализуй запросы снимка в приложении либо обрабатывай эту ошибку. Накладные расходы tracing зависят от нагрузки и требуют измерения.",
      "MinAge — ориентир хранения, а не «ровно последние N секунд». MaxBytes имеет приоритет, служит ориентиром размера и не задаёт жёсткий предел размера снимка или всей дополнительной памяти. Запись не содержит историю до Start. Обрабатывай ошибки записи/закрытия и не допускай неконтролируемых повторных дампов."
    ],
    "versionNote": "Стабильный synctest, FlightRecorder и SetDefaultGOMAXPROCS — Go 1.25; пример сохраняется как *_test.go и запускается go test. В Go 1.26 эти API продолжают действовать, это не их первое появление. Для языковой версии главного модуля ≤1.24 containermaxprocs/updatemaxprocs по умолчанию выключены; проверь go.mod и GODEBUG. Linux-cgroup поведение не воспроизводится на macOS.",
    "sources": [
      {
        "title": "API additions — Go 1.25",
        "url": "https://github.com/golang/go/blob/go1.25.0/api/go1.25.txt"
      },
      {
        "title": "GOMAXPROCS defaults — Go 1.25",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/debug.go"
      },
      {
        "title": "GOMAXPROCS defaults — Go 1.26",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/debug.go"
      },
      {
        "title": "Durable blocking and fake time",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/testing/synctest/synctest.go"
      },
      {
        "title": "Flight recorder contract",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/trace/flightrecorder.go"
      },
      {
        "title": "Flight recorder — Go 1.25",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/runtime/trace/flightrecorder.go"
      }
    ],
    "practice": {
      "kind": "Проверь условия обещания",
      "promptEN": "A service sets GOMAXPROCS=1. Will a quota change automatically raise it? Does MinAge=5s guarantee exactly five seconds in every trace snapshot?",
      "promptRU": "Сервис задаёт GOMAXPROCS=1. Поднимет ли его изменение квоты автоматически? Гарантирует ли MinAge=5s ровно пять секунд в каждом снимке?",
      "pointsEN": [
        "Explicit GOMAXPROCS disables automatic updates; restoring defaults requires deliberate action.",
        "No exact window is guaranteed: size constraints, recording age and runtime behavior matter.",
        "A blocked Mutex alone does not make a synctest goroutine durably blocked."
      ],
      "pointsRU": [
        "Явный GOMAXPROCS отключает автообновления; возвращение defaults требует явного действия.",
        "Точное окно не гарантируется: важны ограничения размера, возраст записи и поведение runtime.",
        "Ожидание Mutex само по себе не делает горутину synctest устойчиво заблокированной."
      ],
      "followUpEN": "Why should a container default calculation be verified on Linux instead of inferred from a macOS test?",
      "followUpRU": "Почему выбор default для контейнера нужно проверять в Linux, а не выводить из теста на macOS?"
    }
  },
  // ==========================================
  // МОДУЛЬ 6: ИДИОМЫ GO — ОШИБКИ, ТИПЫ, СТРОКИ, GENERICS, МОДУЛИ, ТЕСТЫ (C39 - C44)
  // ==========================================
  {
    "id": "c39",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you add context to an error, and when do you use errors.Is, errors.As and errors.Join?",
    "qRU": "Как добавить к ошибке контекст и когда нужны errors.Is, errors.As и errors.Join?",
    "shortEN": "Wrap with fmt.Errorf and %w: it adds context and keeps the original error in the chain. errors.Is checks whether a specific error value, usually a sentinel like io.EOF, is anywhere in the chain; errors.As finds the first error of a given type so you can read its fields. errors.Join (Go 1.20) combines several errors into one that Is and As can still search.",
    "anchorsEN": [
      "fmt.Errorf with %w: wrap, keep the chain",
      "errors.Is: a value (sentinel)",
      "errors.As: a type, read its fields",
      "errors.Join: several, still searchable"
    ],
    "jvmEN": "Unlike Java exceptions, Go errors are ordinary return values: no stack unwinding and no checked exceptions. Wrapping with %w is like passing a cause to an exception’s constructor, errors.Is is like comparing the cause, and errors.As is like catching by type.",
    "shortRU": "Оборачивай через fmt.Errorf с %w: контекст добавляется, а исходная ошибка остаётся в цепочке. errors.Is проверяет, есть ли в цепочке конкретное значение — обычно sentinel вроде io.EOF; errors.As находит первую ошибку нужного типа и даёт прочитать её поля. errors.Join (Go 1.20) объединяет несколько ошибок в одну, внутри которой Is и As тоже ищут.",
    "jvmRU": "В отличие от исключений Java, ошибки Go — обычные возвращаемые значения: без раскрутки стека и без checked-исключений. Обёртка через %w похожа на передачу cause в конструктор исключения, errors.Is — на сравнение причины, а errors.As — на catch по типу.",
    "detailsEN": [
      "Sentinel or typed? A sentinel (var ErrNotFound = errors.New(\"not found\")) names a condition the caller branches on. A typed error, a struct that implements error, carries data such as a field name or a status code. Compare with errors.Is and errors.As rather than == or a type assertion, because those see only the outermost error.",
      "%w versus %v: with %w the new error has an Unwrap method that returns the original, so Is and As can reach it. With %v the original is only formatted into the text; the chain is cut and errors.Is returns false. Wrapping makes the inner error part of your API, so wrap on purpose.",
      "Add context once per layer, as \"operation subject: cause\" (\"load user 7: …\"). Handle an error once: log it or return it, not both, otherwise one failure is reported several times.",
      "errors.Join returns nil when every argument is nil; otherwise its message joins the messages with newlines and its Unwrap returns []error. errors.Is and errors.As search every branch, but errors.Unwrap returns nil for it, because errors.Unwrap only calls an Unwrap() error method. fmt.Errorf with several %w verbs (Go 1.20) builds the same kind of multi-error."
    ],
    "detailsRU": [
      "Sentinel или тип? Sentinel (var ErrNotFound = errors.New(\"not found\")) называет условие, по которому вызывающий ветвится. Ошибка-тип — структура, реализующая error, — несёт данные: имя поля, код статуса. Сравнивай через errors.Is и errors.As, а не через == или приведение типа: они видят только внешнюю ошибку.",
      "%w или %v: с %w у новой ошибки есть метод Unwrap, возвращающий исходную, и Is с As до неё доходят. С %v исходная ошибка только подставляется в текст; цепочка обрывается, и errors.Is возвращает false. Обёртка делает внутреннюю ошибку частью твоего API — оборачивай осознанно.",
      "Добавляй контекст один раз на уровень, в виде «операция объект: причина» («load user 7: …»). Обрабатывай ошибку один раз: либо логируй, либо возвращай, иначе один сбой попадёт в лог несколько раз.",
      "errors.Join возвращает nil, если все аргументы nil; иначе сообщения соединяются переводом строки, а Unwrap возвращает []error. errors.Is и errors.As ищут во всех ветках, но errors.Unwrap для неё возвращает nil: он вызывает только метод Unwrap() error. fmt.Errorf с несколькими %w (Go 1.20) создаёт такую же составную ошибку."
    ],
    "practicalRU": "Порядок мысли: кто будет проверять эту ошибку и что ему нужно — условие или данные? Условие — sentinel и errors.Is, данные — тип и errors.As. Контекст — через %w, не %v. Логируй там, где ошибку обрабатывают, а не на каждом уровне.",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"io/fs\"\n\t\"os\"\n)\n\nvar ErrNotFound = errors.New(\"not found\")\n\ntype QueryError struct {\n\tQuery string\n\tErr   error\n}\n\nfunc (e *QueryError) Error() string { return e.Query + \": \" + e.Err.Error() }\nfunc (e *QueryError) Unwrap() error { return e.Err }\n\nfunc main() {\n\terr := fmt.Errorf(\"load user 7: %w\", &QueryError{Query: \"SELECT\", Err: ErrNotFound})\n\tfmt.Println(err)\n\tfmt.Println(errors.Is(err, ErrNotFound))\n\tvar qe *QueryError\n\tfmt.Println(errors.As(err, &qe), qe.Query)\n\n\t_, err = os.Open(\"/no/such/file\")\n\tfmt.Println(errors.Is(err, fs.ErrNotExist))\n\n\tfmt.Printf(\"%q\\n\", errors.Join(errors.New(\"a\"), errors.New(\"b\")).Error())\n}",
    "versionNote": "errors.Is, errors.As, Unwrap и %w — с Go 1.13; errors.Join и несколько %w в одном fmt.Errorf — с Go 1.20. Пример выполнен Go 1.24.7.",
    "sources": [
      {
        "title": "Package errors",
        "url": "https://pkg.go.dev/errors"
      },
      {
        "title": "Working with Errors in Go 1.13",
        "url": "https://go.dev/blog/go1.13-errors"
      },
      {
        "title": "Go 1.20 release notes: wrapping multiple errors",
        "url": "https://go.dev/doc/go1.20#errors"
      }
    ],
    "practice": {
      "kind": "Измени одну букву",
      "promptEN": "A function returns fmt.Errorf(\"find user 7: %v\", ErrNotFound). What does errors.Is(err, ErrNotFound) return, and what single change fixes it? When would you return a typed error instead?",
      "promptRU": "Функция возвращает fmt.Errorf(\"find user 7: %v\", ErrNotFound). Что вернёт errors.Is(err, ErrNotFound) и какое одно изменение это исправит? Когда лучше вернуть ошибку-тип?",
      "pointsEN": [
        "false: %v puts the text in the message but cuts the chain.",
        "Replace %v with %w; then Unwrap returns ErrNotFound and errors.Is finds it.",
        "Return a typed error when the caller needs data, such as a field or a code, and read it with errors.As."
      ],
      "pointsRU": [
        "false: %v вставляет текст в сообщение, но обрывает цепочку.",
        "Заменить %v на %w; тогда Unwrap вернёт ErrNotFound и errors.Is его найдёт.",
        "Ошибку-тип возвращай, когда вызывающему нужны данные — поле или код; читай их через errors.As."
      ],
      "followUpEN": "For err := errors.Join(errA, errB), what do errors.Is(err, errB) and errors.Unwrap(err) return?",
      "followUpRU": "Для err := errors.Join(errA, errB): что вернут errors.Is(err, errB) и errors.Unwrap(err)?"
    }
  },
  {
    "id": "c40",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "What is the zero value of each kind of type, and which nil values are safe to use?",
    "qRU": "Какое нулевое значение у каждого вида типов и какими nil-значениями можно безопасно пользоваться?",
    "shortEN": "Every variable starts at its type's zero value: 0, false, \"\", nil for pointers, slices, maps, channels, functions and interfaces, and a struct of zero fields. A nil slice behaves like an empty one for len, range and append; a nil map can be read, but writing to it panics; a nil channel blocks forever. Good Go types make the zero value useful, like sync.Mutex and strings.Builder.",
    "anchorsEN": [
      "every type has a zero value",
      "nil slice = empty for len, range, append",
      "nil map: read ok, write panics",
      "make the zero value useful"
    ],
    "jvmEN": "In Java a reference field starts as null; in Go a variable is always usable at its zero value: an empty string, not null, and a ready Mutex or Builder. There are no nullable types as in Kotlin; nil exists only for pointers, slices, maps, channels, functions and interfaces.",
    "shortRU": "Любая переменная начинается с нулевого значения своего типа: 0, false, \"\", nil у указателей, срезов, map, каналов, функций и интерфейсов, структура из нулевых полей. Nil-срез ведёт себя как пустой для len, range и append; nil map можно читать, но запись вызывает panic; nil-канал блокирует навсегда. Хорошие типы в Go делают нулевое значение полезным, как sync.Mutex и strings.Builder.",
    "jvmRU": "В Java поле-ссылка начинается с null; в Go переменная всегда пригодна в нулевом значении: пустая строка, а не null, готовые Mutex или Builder. Nullable-типов, как в Kotlin, нет; nil бывает только у указателей, срезов, map, каналов, функций и интерфейсов.",
    "detailsEN": [
      "Reading is safe for nil collections: len and range work on nil slices and maps, and indexing a nil map returns the zero value. Writing differs: append to a nil slice allocates, but assignment to a nil map panics with \"assignment to entry in nil map\". Create a map with make or a literal before writing.",
      "Calling a method on a nil pointer is legal; it panics only if the method dereferences the receiver. A nil pointer stored in an interface makes the interface non-nil (see C33).",
      "Comparability: a struct is comparable only if all its fields are, and only comparable types can be map keys. Slice, map and func fields make a struct non-comparable; arrays such as [2]int are comparable. A map[any]int accepts a []int key at compile time but panics at run time: hash of unhashable type.",
      "Design for a useful zero value: var mu sync.Mutex is unlocked, var sb strings.Builder and var buf bytes.Buffer are empty and ready, var wg sync.WaitGroup is ready. Unlike Kotlin, Go has no nullable types: a nil map or pointer is an ordinary value, and the compiler does not force a check."
    ],
    "detailsRU": [
      "Читать nil-коллекции безопасно: len и range работают с nil-срезом и nil map, а индекс nil map возвращает нулевое значение. Запись различается: append к nil-срезу выделяет память, а присваивание в nil map вызывает panic «assignment to entry in nil map». Перед записью создай map через make или литерал.",
      "Вызвать метод у nil-указателя можно; panic будет, только если метод разыменует ресивер. Nil-указатель внутри интерфейса делает интерфейс не-nil (см. C33).",
      "Сравнимость: структура сравнима, только если сравнимы все её поля, и ключом map может быть только сравнимый тип. Поля-срезы, map и функции делают структуру несравнимой; массивы вроде [2]int сравнимы. map[any]int примет ключ []int при компиляции, но при выполнении будет panic: hash of unhashable type.",
      "Проектируй полезное нулевое значение: var mu sync.Mutex не заблокирован, var sb strings.Builder и var buf bytes.Buffer пусты и готовы, var wg sync.WaitGroup готов. В отличие от Kotlin, в Go нет nullable-типов: nil map или указатель — обычное значение, и компилятор не заставляет его проверять."
    ],
    "practicalRU": "Для Kotlin-разработчика: nil встроен в указатели, срезы, map, каналы, функции и интерфейсы, а проверки компилятор не требует. Запомни таблицу «читать можно, писать нельзя» для map и «nil-канал блокирует навсегда» (C14).",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"strings\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar (\n\t\ti  int\n\t\ts  string\n\t\tp  *int\n\t\tsl []int\n\t\tm  map[string]int\n\t\tch chan int\n\t\te  error\n\t)\n\tfmt.Println(i, s == \"\", p == nil, sl == nil, len(sl), m == nil, m[\"k\"], ch == nil, e == nil)\n\n\tsl = append(sl, 1) // append to a nil slice allocates\n\tvar sb strings.Builder\n\tsb.WriteString(\"ok\") // the zero Builder is ready to use\n\tvar mu sync.Mutex\n\tmu.Lock() // the zero Mutex is unlocked\n\tmu.Unlock()\n\tfmt.Println(sl, sb.String())\n\t// m[\"k\"] = 1 would panic: assignment to entry in nil map\n}",
    "versionNote": "Правила нулевых значений и сравнимости не менялись с Go 1.0. Пример выполнен Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: the zero value",
        "url": "https://go.dev/ref/spec#The_zero_value"
      },
      {
        "title": "Go specification: map types",
        "url": "https://go.dev/ref/spec#Map_types"
      },
      {
        "title": "Go specification: comparison operators",
        "url": "https://go.dev/ref/spec#Comparison_operators"
      },
      {
        "title": "Effective Go: allocation with new (useful zero values)",
        "url": "https://go.dev/doc/effective_go#allocation_new"
      }
    ],
    "practice": {
      "kind": "Читать или писать",
      "promptEN": "var m map[string]int; var s []int; var ch chan int. Which of m[\"a\"], m[\"a\"] = 1, append(s, 1), len(ch) and ch <- 1 work, panic or block?",
      "promptRU": "var m map[string]int; var s []int; var ch chan int. Что из m[\"a\"], m[\"a\"] = 1, append(s, 1), len(ch) и ch <- 1 работает, вызывает panic или блокирует?",
      "pointsEN": [
        "m[\"a\"] returns 0; m[\"a\"] = 1 panics: assignment to entry in nil map.",
        "append(s, 1) allocates a new array; len(ch) is 0.",
        "ch <- 1 blocks forever; in a select, a case on a nil channel is never chosen."
      ],
      "pointsRU": [
        "m[\"a\"] возвращает 0; m[\"a\"] = 1 — panic: assignment to entry in nil map.",
        "append(s, 1) выделяет новый массив; len(ch) равен 0.",
        "ch <- 1 блокирует навсегда; в select ветка с nil-каналом никогда не выбирается."
      ],
      "followUpEN": "Why is map[[]int]bool a compile error, while a []int key in map[any]int is a run-time panic?",
      "followUpRU": "Почему map[[]int]bool — ошибка компиляции, а ключ []int в map[any]int — panic при выполнении?"
    }
  },
  {
    "id": "c41",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "What do len, indexing and range return for a Go string, and when do you need []rune?",
    "qRU": "Что возвращают len, индекс и range для строки Go и когда нужен []rune?",
    "shortEN": "A string is an immutable sequence of bytes, usually UTF-8. len(s) counts bytes, s[i] is a byte, and range over a string decodes UTF-8, giving each rune with its starting byte index. Convert to []rune when you need characters by position, and build strings in a loop with strings.Builder.",
    "anchorsEN": [
      "string = immutable bytes, usually UTF-8",
      "len = bytes; s[i] = a byte",
      "range → runes with byte index",
      "[]rune by position; Builder in loops"
    ],
    "jvmEN": "Java strings are UTF-16: length() counts UTF-16 units and charAt returns a char. A Go string is bytes: len counts bytes, and only range or []rune works in Unicode code points.",
    "shortRU": "Строка — неизменяемая последовательность байтов, обычно в UTF-8. len(s) считает байты, s[i] — байт, а range по строке декодирует UTF-8 и выдаёт руну с индексом её первого байта. []rune нужен, когда символы требуются по позиции; строку в цикле собирай через strings.Builder.",
    "jvmRU": "Строки Java — в UTF-16: length() считает единицы UTF-16, а charAt возвращает char. Строка Go — это байты: len считает байты, и только range или []rune работают с кодовыми точками Unicode.",
    "detailsEN": [
      "\"héllo, 世界\" has 9 runes but 14 bytes: é takes 2 bytes and each of 世 and 界 takes 3. utf8.RuneCountInString counts runes without allocating; []rune(s) allocates a new slice.",
      "range yields the starting byte index of each rune, so indexes jump: 0, 1, 3 for \"hé世\". An invalid byte comes out as U+FFFD, one byte at a time. Slicing s[i:j] works on bytes and can cut a rune in half.",
      "Conversions copy: []byte(s) and string(b) create new memory, although the compiler avoids some copies, for example in a lookup m[string(b)]. A substring shares the original's memory, so a small substring can keep a large string alive; strings.Clone (Go 1.20) makes an independent copy.",
      "s += x in a loop copies the growing string each time; strings.Builder grows one buffer and is the idiomatic choice. rune is an alias for int32 and byte for uint8. What a user sees as one character can be several runes: é may also be e plus a combining accent."
    ],
    "detailsRU": [
      "В \"héllo, 世界\" 9 рун, но 14 байт: é занимает 2 байта, 世 и 界 — по 3. utf8.RuneCountInString считает руны без выделения памяти; []rune(s) создаёт новый срез.",
      "range выдаёт индекс первого байта каждой руны, поэтому индексы прыгают: 0, 1, 3 для \"hé世\". Некорректный байт превращается в U+FFFD, по одному на байт. Срез s[i:j] работает с байтами и может разрезать руну пополам.",
      "Преобразования копируют: []byte(s) и string(b) создают новую память, хотя компилятор избегает части копий — например, при поиске m[string(b)]. Подстрока разделяет память с исходной строкой, поэтому маленькая подстрока может удерживать большую строку; strings.Clone (Go 1.20) делает независимую копию.",
      "s += x в цикле каждый раз копирует растущую строку; strings.Builder наращивает один буфер — это идиоматичный выбор. rune — псевдоним int32, byte — uint8. То, что пользователь видит как один символ, может быть несколькими рунами: é бывает ещё и e плюс комбинируемое ударение."
    ],
    "practicalRU": "Три вопроса на интервью: что вернёт len, что вернёт s[i] и какие индексы даёт range. Ответ «байты, байт, начало руны» — верный.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"strings\"\n\t\"unicode/utf8\"\n)\n\nfunc main() {\n\ts := \"héllo, 世界\"\n\tfmt.Println(len(s), utf8.RuneCountInString(s))\n\tfmt.Println(s[1], s[1:3])\n\tfor i, r := range \"hé世\" {\n\t\tfmt.Print(i, \":\", string(r), \" \")\n\t}\n\tfmt.Println()\n\trunes := []rune(s)\n\tfmt.Println(string(runes[1]), len(runes))\n\n\tb := []byte(\"go\") // a copy: strings are immutable\n\tb[0] = 'G'\n\tfmt.Println(string(b))\n\n\tvar sb strings.Builder\n\tfor range 3 {\n\t\tsb.WriteString(\"ab\")\n\t}\n\tfmt.Println(sb.String())\n}",
    "versionNote": "Семантика строк и range по строке не менялась; strings.Clone — Go 1.20; range по целому числу в примере — Go 1.22. Пример выполнен Go 1.24.7.",
    "sources": [
      {
        "title": "Strings, bytes, runes and characters in Go",
        "url": "https://go.dev/blog/strings"
      },
      {
        "title": "Go specification: for statements with range clause",
        "url": "https://go.dev/ref/spec#For_range"
      },
      {
        "title": "Package unicode/utf8",
        "url": "https://pkg.go.dev/unicode/utf8"
      },
      {
        "title": "strings.Builder",
        "url": "https://pkg.go.dev/strings#Builder"
      }
    ],
    "practice": {
      "kind": "Посчитай байты",
      "promptEN": "For s := \"héllo\": what are len(s), s[1] and len([]rune(s))? How would you reverse s without breaking é?",
      "promptRU": "Для s := \"héllo\": чему равны len(s), s[1] и len([]rune(s))? Как развернуть s, не сломав é?",
      "pointsEN": [
        "len(s) is 6 bytes; s[1] is 195 (0xC3), the first byte of é; there are 5 runes.",
        "Reverse the []rune slice, not the bytes, and convert back with string(runes).",
        "A decomposed é (e plus a combining accent) still breaks: that needs normalization or a grapheme library."
      ],
      "pointsRU": [
        "len(s) — 6 байт; s[1] — 195 (0xC3), первый байт é; рун пять.",
        "Разворачивать срез []rune, а не байты, и собрать обратно через string(runes).",
        "Разложенное é (e плюс комбинируемое ударение) всё равно сломается: нужна нормализация или библиотека для графем."
      ],
      "followUpEN": "Why can a 10-byte substring keep a 1 GB string in memory, and how do you avoid it?",
      "followUpRU": "Почему подстрока из 10 байт может удерживать в памяти строку в 1 ГБ и как этого избежать?"
    }
  },
  {
    "id": "c42",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "When do you choose generics, and when an interface?",
    "qRU": "Когда выбирать generics, а когда интерфейс?",
    "shortEN": "Use type parameters when the same algorithm works on many types and the caller's type should come back out, as in Map, Max or Set[T comparable]. Use an interface when different types behave differently behind the same methods and the implementation is chosen at run time, as with io.Reader or a Shape. If one concrete type is enough, use that.",
    "anchorsEN": [
      "type parameters: same algorithm, caller’s type back",
      "interface: different behaviour at run time",
      "constraint = what the code needs",
      "one concrete type is enough? use it"
    ],
    "jvmEN": "Go generics look like Java generics but are not erased: the compiler generates code per GC shape, so a []int stays a slice of ints, not a list of boxed Integers. And interfaces are satisfied implicitly, without an implements clause.",
    "shortRU": "Параметры типа — когда один и тот же алгоритм работает для многих типов и вызывающий должен получить свой тип обратно: Map, Max, Set[T comparable]. Интерфейс — когда разные типы ведут себя по-разному за одними методами, а реализация выбирается во время выполнения: io.Reader, Shape. Если хватает одного конкретного типа — используй его.",
    "jvmRU": "Дженерики Go похожи на дженерики Java, но не стираются: компилятор генерирует код на каждую GC-форму, поэтому []int остаётся срезом int, а не списком упакованных Integer. А интерфейсы реализуются неявно, без implements.",
    "detailsEN": [
      "A constraint says what the algorithm needs: any for nothing, comparable for == and map keys, cmp.Ordered for < (Go 1.21), and unions such as ~int | ~float64 for arithmetic. The tilde admits defined types like type Celsius float64.",
      "A generic function returns the caller's type: Max([]Celsius) returns Celsius with no type assertion. An interface version would take []any or a wrapper type and force assertions.",
      "An interface holds values of different dynamic types in one slice, like []Shape{Rect{}, Circle{}}; a generic []T holds one type per instantiation. Interfaces are also how you replace a dependency with a fake in tests.",
      "Cost: interface calls are dynamic, and the gc compiler implements generics with GC-shape stenciling and dictionaries, so generic code is not automatically faster — measure. Go 1.27 adds generic methods (a method may have its own type parameters); interface methods still cannot."
    ],
    "detailsRU": [
      "Ограничение говорит, что нужно алгоритму: any — ничего, comparable — == и ключи map, cmp.Ordered — < (Go 1.21), объединения вроде ~int | ~float64 — арифметика. Тильда допускает определённые типы вроде type Celsius float64.",
      "Обобщённая функция возвращает тип вызывающего: Max([]Celsius) вернёт Celsius без приведения. Вариант через интерфейс принимал бы []any или тип-обёртку и требовал приведений.",
      "Интерфейс хранит значения разных динамических типов в одном срезе, как []Shape{Rect{}, Circle{}}; обобщённый []T хранит один тип на каждую конкретизацию. Через интерфейсы же подменяют зависимости в тестах.",
      "Стоимость: вызовы через интерфейс динамические, а компилятор gc реализует generics через GC-shape stenciling со словарями, поэтому обобщённый код не обязательно быстрее — измеряй. В Go 1.27 появились generic-методы (у метода свои параметры типа); у методов интерфейса их по-прежнему нет."
    ],
    "practicalRU": "Правило: та же логика для разных типов — generics; разное поведение за одним методом — интерфейс. Начинай с конкретного типа и обобщай, когда появился второй вызывающий с другим типом.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"math\"\n)\n\n// Generics: one algorithm, many types known at compile time.\ntype Number interface{ ~int | ~int64 | ~float64 }\n\nfunc Sum[T Number](xs []T) T {\n\tvar s T\n\tfor _, x := range xs {\n\t\ts += x\n\t}\n\treturn s\n}\n\ntype Celsius float64 // ~float64 lets defined types in\n\n// Interfaces: different behaviour behind one method set, chosen at run time.\ntype Shape interface{ Area() float64 }\n\ntype Rect struct{ W, H float64 }\n\nfunc (r Rect) Area() float64 { return r.W * r.H }\n\ntype Circle struct{ R float64 }\n\nfunc (c Circle) Area() float64 { return math.Pi * c.R * c.R }\n\nfunc TotalArea(shapes []Shape) float64 {\n\ttotal := 0.0\n\tfor _, s := range shapes {\n\t\ttotal += s.Area()\n\t}\n\treturn total\n}\n\nfunc main() {\n\tfmt.Println(Sum([]int{1, 2, 3}), Sum([]Celsius{1.5, 2}))\n\tfmt.Printf(\"%.2f\\n\", TotalArea([]Shape{Rect{2, 3}, Circle{1}}))\n}",
    "versionNote": "Параметры типа — Go 1.18; cmp.Ordered и встроенные min и max — Go 1.21; generic-методы — Go 1.27. Пример выполнен Go 1.24.7.",
    "sources": [
      {
        "title": "Tutorial: Getting started with generics",
        "url": "https://go.dev/doc/tutorial/generics"
      },
      {
        "title": "When To Use Generics",
        "url": "https://go.dev/blog/when-generics"
      },
      {
        "title": "Go specification: type constraints",
        "url": "https://go.dev/ref/spec#Type_constraints"
      },
      {
        "title": "Go 1.27 release notes",
        "url": "https://go.dev/doc/go1.27"
      }
    ],
    "practice": {
      "kind": "Выбери подход",
      "promptEN": "You need (a) the largest value of a []float64 or a []Celsius, and (b) the total area of a list that mixes rectangles and circles. Which is generic, which is an interface, and why?",
      "promptRU": "Нужно (а) найти наибольшее значение в []float64 или []Celsius и (б) посчитать общую площадь списка, где вперемешку прямоугольники и круги. Что из этого generics, а что интерфейс, и почему?",
      "pointsEN": [
        "(a) Generic Max[T cmp.Ordered]: the same algorithm, and the caller gets Celsius back.",
        "(b) An interface Shape with Area(): different behaviour per type, mixed in one slice.",
        "A Max over []any would need type switches and give up compile-time checks."
      ],
      "pointsRU": [
        "(а) Обобщённый Max[T cmp.Ordered]: тот же алгоритм, и вызывающий получает Celsius обратно.",
        "(б) Интерфейс Shape с Area(): своё поведение у каждого типа, все в одном срезе.",
        "Max по []any потребовал бы switch по типам и отказа от проверок компилятора."
      ],
      "followUpEN": "Why must T be comparable in Set[T], and can a struct with a slice field be a set element?",
      "followUpRU": "Почему в Set[T] тип T должен быть comparable и может ли элементом быть структура с полем-срезом?"
    }
  },
  {
    "id": "c43",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "What is the difference between a module and a package, and what does an internal directory enforce?",
    "qRU": "Чем модуль отличается от пакета и что гарантирует каталог internal?",
    "shortEN": "A package is one directory of .go files compiled together; its import path is the module path plus the directory. A module is a versioned set of packages with a go.mod that declares the module path, the Go version and the dependencies. A package under internal/ can be imported only by code in the tree rooted at the parent of internal, and the go command enforces it.",
    "anchorsEN": [
      "package = one directory",
      "module = versioned packages + go.mod",
      "import path = module path + directory",
      "internal/: only the parent’s tree"
    ],
    "jvmEN": "A module is like a Maven artifact with its own coordinates and versions, a package is like a Java package but tied to one directory, and internal/ gives the compiler-enforced boundary that Java gets from JPMS exports.",
    "shortRU": "Пакет — один каталог .go-файлов, которые компилируются вместе; его путь импорта — путь модуля плюс каталог. Модуль — набор пакетов с версией и файлом go.mod, где указаны путь модуля, версия Go и зависимости. Пакет внутри internal/ может импортировать только код из дерева, корень которого — родитель internal; это проверяет команда go.",
    "jvmRU": "Модуль похож на артефакт Maven со своими координатами и версиями, пакет — на пакет Java, но привязан к одному каталогу, а internal/ даёт проверяемую компилятором границу, которую в Java дают exports в JPMS.",
    "detailsEN": [
      "go.mod records the module path, the go directive (the minimum language version, which also selects semantics such as per-iteration loop variables), an optional toolchain line (Go 1.21+), and require lines; go.sum stores checksums. go mod tidy adds missing requirements and removes unused ones.",
      "Visibility is per package: identifiers that start with an upper-case letter are exported. internal/ adds a second boundary: a/b/internal/c can be imported from a/b and below, and from nowhere else — not from another module, and not from a/x.",
      "A common layout is cmd/<binary>/main.go for executables and internal/ for code others should not import. It is a convention, not a standard; a small service can be one main package. Avoid catch-all package names like util or common.",
      "Minimal version selection: a build uses, for each module, the highest of the minimum versions its dependents require, not the newest release. A major version 2 or higher changes the import path (example.com/m/v2)."
    ],
    "detailsRU": [
      "go.mod хранит путь модуля, директиву go (минимальная версия языка, которая заодно выбирает семантику — например, переменную цикла на каждую итерацию), необязательную строку toolchain (Go 1.21+) и строки require; go.sum хранит контрольные суммы. go mod tidy добавляет недостающие зависимости и удаляет лишние.",
      "Видимость — на уровне пакета: идентификаторы с заглавной буквы экспортируются. internal/ добавляет вторую границу: a/b/internal/c можно импортировать из a/b и ниже и больше ниоткуда — ни из другого модуля, ни из a/x.",
      "Частая раскладка — cmd/<binary>/main.go для исполняемых файлов и internal/ для кода, который другим импортировать не нужно. Это соглашение, а не стандарт; небольшой сервис может быть одним пакетом main. Избегай пакетов-свалок вроде util или common.",
      "Минимальный выбор версий: для каждого модуля сборка берёт наибольшую из минимальных версий, которые требуют зависимые, а не самый свежий выпуск. Мажорная версия 2 и выше меняет путь импорта (example.com/m/v2)."
    ],
    "practicalRU": "Сравнение с Kotlin и Gradle: модуль Go ближе к артефакту с версией, пакет — к package. Видимость только «экспортировано или нет» плюс internal/; protected нет.",
    "code": "myapp/\n├── go.mod                   // module github.com/me/myapp\n├── cmd/myapp/main.go        // package main\n└── internal/store/store.go  // importable only from github.com/me/myapp/...\n\n$ go mod init github.com/me/myapp\n$ go get golang.org/x/sync@latest\n$ go mod tidy\n$ go build ./... && go test ./...",
    "versionNote": "Модули по умолчанию — с Go 1.16; строка toolchain — с Go 1.21; директива go задаёт семантику языка (например, переменные цикла — с 1.22). Правило internal действует для любых путей импорта.",
    "sources": [
      {
        "title": "Go Modules Reference",
        "url": "https://go.dev/ref/mod"
      },
      {
        "title": "Organizing a Go module",
        "url": "https://go.dev/doc/modules/layout"
      },
      {
        "title": "cmd/go: internal directories",
        "url": "https://pkg.go.dev/cmd/go#hdr-Internal_Directories"
      }
    ],
    "practice": {
      "kind": "Найди границу",
      "promptEN": "Module github.com/me/shop has the package internal/pay. Can github.com/me/shop/cmd/api import it? Can a package in another module, github.com/me/tools? Where would you put code meant to be shared with other modules?",
      "promptRU": "В модуле github.com/me/shop есть пакет internal/pay. Может ли его импортировать github.com/me/shop/cmd/api? А пакет другого модуля github.com/me/tools? Куда положить код, которым нужно делиться с другими модулями?",
      "pointsEN": [
        "cmd/api can: it is inside the tree rooted at shop, the parent of internal.",
        "github.com/me/tools cannot: the go command rejects the import.",
        "Shared code goes in a non-internal package with a stable API, versioned with the module."
      ],
      "pointsRU": [
        "cmd/api может: он внутри дерева с корнем shop — родителем internal.",
        "github.com/me/tools не может: команда go отклонит импорт.",
        "Общий код — в пакет вне internal со стабильным API и версией модуля."
      ],
      "followUpEN": "What else does the go directive in go.mod change, besides the minimum version?",
      "followUpRU": "Что ещё меняет директива go в go.mod, кроме минимальной версии?"
    }
  },
  {
    "id": "c44",
    "mod": "m6",
    "modName": "6. Go Idioms: Errors, Types, Strings, Tests",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you write a table-driven test, and what do t.Run, t.Helper, t.Parallel and t.Cleanup change?",
    "qRU": "Как написать табличный тест и что меняют t.Run, t.Helper, t.Parallel и t.Cleanup?",
    "shortEN": "A table-driven test lists named cases in a slice of structs and runs each with t.Run, so failures name the case and -run can select one. t.Helper marks a helper so failures point at the caller's line. t.Parallel lets subtests run concurrently after the parent's function returns, so give them only per-case data and register shared teardown with t.Cleanup, not defer.",
    "anchorsEN": [
      "cases in a slice, t.Run for each",
      "t.Helper → the caller’s line",
      "t.Parallel waits for the parent",
      "t.Cleanup, not defer"
    ],
    "jvmEN": "Table-driven tests play the role of JUnit 5 @ParameterizedTest, t.Run is like a dynamic or nested test, and t.Cleanup is like @AfterEach registered from inside the test. The standard library has no assertion library: you compare and call t.Errorf.",
    "shortRU": "Табличный тест перечисляет именованные случаи в срезе структур и запускает каждый через t.Run: в ошибке видно имя случая, а -run выбирает один. t.Helper помечает вспомогательную функцию, и ошибка указывает на строку вызывающего. t.Parallel запускает подтесты параллельно после возврата из функции родителя, поэтому им нужны только свои данные, а общий teardown регистрируют через t.Cleanup, а не defer.",
    "jvmRU": "Табличные тесты играют роль @ParameterizedTest из JUnit 5, t.Run похож на динамический или вложенный тест, а t.Cleanup — на @AfterEach, зарегистрированный изнутри теста. Библиотеки assert в стандартной библиотеке нет: сравниваешь сам и вызываешь t.Errorf.",
    "detailsEN": [
      "t.Run(name, f) creates a subtest; go test -run 'TestAbs/negative' runs one case. t.Errorf records a failure and continues; t.Fatalf stops the test, and it must be called from the test's goroutine, not from goroutines the test starts.",
      "t.Parallel pauses the subtest until its parent's function returns, then runs it with the other parallel subtests. A defer in the parent therefore runs before them; t.Cleanup runs after the test and all its subtests finish.",
      "Since Go 1.22 each loop iteration has its own tt, so capturing it in a parallel subtest is safe; with an older go directive, copy it (tt := tt). Parallel subtests must not share mutable data without synchronization; go test -race reports the data races that actually happen during the run.",
      "Useful flags: -run, -count=1 (no cached result), -race, -cover and -coverprofile, -shuffle=on to catch order dependence, -parallel to cap concurrency, -v to see subtests. testing/synctest (Go 1.25) tests code with time and goroutines without sleeping."
    ],
    "detailsRU": [
      "t.Run(name, f) создаёт подтест; go test -run 'TestAbs/negative' запускает один случай. t.Errorf фиксирует ошибку и продолжает; t.Fatalf останавливает тест, и вызывать его можно только из горутины теста, а не из горутин, которые тест запустил.",
      "t.Parallel ставит подтест на паузу до возврата из функции родителя и затем выполняет его вместе с другими параллельными подтестами. Поэтому defer родителя срабатывает раньше них, а t.Cleanup — после завершения теста и всех его подтестов.",
      "С Go 1.22 у каждой итерации цикла своя tt, и захват её параллельным подтестом безопасен; при более старой директиве go нужна копия (tt := tt). Параллельные подтесты не должны делить изменяемые данные без синхронизации; go test -race сообщает о гонках, которые действительно случились во время запуска.",
      "Полезные флаги: -run, -count=1 (без кеша), -race, -cover и -coverprofile, -shuffle=on — найти зависимость от порядка, -parallel — ограничить параллельность, -v — увидеть подтесты. testing/synctest (Go 1.25) проверяет код со временем и горутинами без sleep."
    ],
    "practicalRU": "Шаблон держи в пальцах: срез структур с полем name, цикл, t.Run, внутри — проверка через helper с t.Helper. Общий ресурс закрывай через t.Cleanup.",
    "code": "package abs\n\nimport \"testing\"\n\nfunc Abs(n int) int {\n\tif n < 0 {\n\t\treturn -n\n\t}\n\treturn n\n}\n\nfunc assertEqual(t *testing.T, got, want int) {\n\tt.Helper() // a failure is reported at the caller's line\n\tif got != want {\n\t\tt.Errorf(\"got %d, want %d\", got, want)\n\t}\n}\n\nfunc TestAbs(t *testing.T) {\n\ttests := []struct {\n\t\tname     string\n\t\tin, want int\n\t}{\n\t\t{\"positive\", 3, 3},\n\t\t{\"negative\", -3, 3},\n\t\t{\"zero\", 0, 0},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tt.Parallel() // each subtest reads only its own tt (per-iteration variable, Go 1.22+)\n\t\t\tassertEqual(t, Abs(tt.in), tt.want)\n\t\t})\n\t}\n}",
    "versionNote": "t.Cleanup — Go 1.14; -shuffle — Go 1.17; переменная цикла на итерацию — Go 1.22 (по директиве go в go.mod); testing/synctest — Go 1.25. Пример выполнен Go 1.24.7 с -race.",
    "sources": [
      {
        "title": "Package testing",
        "url": "https://pkg.go.dev/testing"
      },
      {
        "title": "Go wiki: TableDrivenTests",
        "url": "https://go.dev/wiki/TableDrivenTests"
      },
      {
        "title": "Using Subtests and Sub-benchmarks",
        "url": "https://go.dev/blog/subtests"
      }
    ],
    "practice": {
      "kind": "Найди порядок",
      "promptEN": "A test opens a database, defers db.Close(), and runs two subtests that call t.Parallel() and query the database. Why do they see a closed database, and what is the fix?",
      "promptRU": "Тест открывает базу, делает defer db.Close() и запускает два подтеста с t.Parallel(), которые обращаются к базе. Почему они видят закрытую базу и как это исправить?",
      "pointsEN": [
        "Parallel subtests pause until the parent's function returns.",
        "The parent's defer runs at that moment, before the subtests continue.",
        "Register the teardown with t.Cleanup(db.Close): it runs after all subtests finish."
      ],
      "pointsRU": [
        "Параллельные подтесты ждут, пока функция родителя вернётся.",
        "Defer родителя срабатывает именно в этот момент — до продолжения подтестов.",
        "Регистрировать закрытие через t.Cleanup(db.Close): оно выполнится после всех подтестов."
      ],
      "followUpEN": "Why must t.Fatal not be called from a goroutine started by the test?",
      "followUpRU": "Почему t.Fatal нельзя вызывать из горутины, которую запустил тест?"
    }
  },
  // ==========================================
  // МОДУЛЬ 7: СЕРВИС НА GO — HTTP, ОШИБКИ, SQL, ЛОГИ (C45 - C48)
  // ==========================================
  {
    "id": "c45",
    "mod": "m7",
    "modName": "7. Go Service: HTTP, Errors, SQL, Logs",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim10",
    "qEN": "What happens to a request inside net/http, and which deadlines should a Go HTTP server set?",
    "qRU": "Что происходит с запросом внутри net/http и какие дедлайны должен задавать HTTP-сервер на Go?",
    "shortEN": "The server accepts a connection and serves it in its own goroutine; for each request the mux picks a handler by method and path, and the handler runs in that goroutine. r.Context() is cancelled when the client disconnects or when ServeHTTP returns, so pass it to every database or HTTP call. Set ReadHeaderTimeout and IdleTimeout on http.Server, and usually ReadTimeout and WriteTimeout too; the zero value means no limit.",
    "anchorsEN": [
      "a goroutine per connection",
      "mux: method + path → handler",
      "r.Context() cancelled on disconnect",
      "set ReadHeaderTimeout, IdleTimeout"
    ],
    "jvmEN": "It resembles a servlet container that runs each request on a thread, but Go uses a cheap goroutine per connection, and cancellation is explicit through r.Context() instead of an interrupted thread or a broken stream.",
    "shortRU": "Сервер принимает соединение и обслуживает его в отдельной горутине; для каждого запроса mux выбирает handler по методу и пути, и handler выполняется в этой горутине. r.Context() отменяется, когда клиент отключился или ServeHTTP вернулся, поэтому его передают в каждый запрос к базе или другому сервису. В http.Server задают ReadHeaderTimeout и IdleTimeout, обычно также ReadTimeout и WriteTimeout; нулевое значение — без ограничения.",
    "jvmRU": "Похоже на контейнер сервлетов, где каждый запрос идёт в потоке, но Go использует дешёвую горутину на соединение, а отмена явная — через r.Context(), а не через прерванный поток или оборванный поток данных.",
    "detailsEN": [
      "One goroutine per connection, not per request: with keep-alive, one connection carries requests one after another (HTTP/1.1), and the same goroutine serves them. A panic in a handler is recovered by the server for that connection only; a panic in a goroutine the handler starts crashes the process.",
      "Routing since Go 1.22: patterns like \"GET /accounts/{id}\" match method and path, r.PathValue(\"id\") reads the wildcard, the more specific pattern wins (/accounts/new over /accounts/{id}), and a path that matches with the wrong method gets 405 with an Allow header.",
      "Context: work started for the request must stop when r.Context() is done. Work that must outlive the response needs its own context, for example context.WithoutCancel (Go 1.21) plus a timeout, and an owner that waits for it on shutdown.",
      "Timeouts: ReadHeaderTimeout protects against slow clients that never finish headers (Slowloris); ReadTimeout covers reading the whole request, WriteTimeout the time until the response is written, IdleTimeout the wait between keep-alive requests. http.TimeoutHandler or a context deadline limits one handler; Shutdown(ctx) drains in-flight requests."
    ],
    "detailsRU": [
      "Горутина на соединение, а не на запрос: с keep-alive одно соединение несёт запросы один за другим (HTTP/1.1), и их обслуживает та же горутина. Panic в handler сервер перехватывает только для этого соединения; panic в горутине, которую handler запустил, роняет процесс.",
      "Маршрутизация с Go 1.22: шаблоны вида \"GET /accounts/{id}\" учитывают метод и путь, r.PathValue(\"id\") читает подстановку, побеждает более конкретный шаблон (/accounts/new раньше /accounts/{id}), а путь, совпавший с другим методом, получает 405 с заголовком Allow.",
      "Контекст: работа, начатая ради запроса, должна остановиться, когда r.Context() завершён. Работе, которая должна пережить ответ, нужен свой контекст — например, context.WithoutCancel (Go 1.21) с таймаутом — и владелец, который дождётся её при остановке.",
      "Таймауты: ReadHeaderTimeout защищает от клиентов, которые никак не дошлют заголовки (Slowloris); ReadTimeout покрывает чтение всего запроса, WriteTimeout — время до записи ответа, IdleTimeout — ожидание следующего запроса keep-alive. http.TimeoutHandler или дедлайн контекста ограничивает один handler; Shutdown(ctx) дожидается запросов в полёте."
    ],
    "practicalRU": "На интервью: «горутина на соединение, контекст запроса отменяется при уходе клиента, у сервера четыре таймаута, нулевые — значит без ограничения». И пример, что handler делает с r.Context().",
    "code": "package main\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"time\"\n)\n\nfunc main() {\n\thandlerErr := make(chan error, 1)\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /report\", func(w http.ResponseWriter, r *http.Request) {\n\t\tselect {\n\t\tcase <-time.After(2 * time.Second): // slow work, e.g. a DB query with r.Context()\n\t\t\tfmt.Fprint(w, \"done\")\n\t\tcase <-r.Context().Done(): // the client went away: stop working\n\t\t\thandlerErr <- r.Context().Err()\n\t\t}\n\t})\n\tsrv := httptest.NewUnstartedServer(mux)\n\t// In production: always set server timeouts.\n\tsrv.Config.ReadHeaderTimeout = 5 * time.Second\n\tsrv.Config.IdleTimeout = 60 * time.Second\n\tsrv.Start()\n\tdefer srv.Close()\n\n\tclient := &http.Client{Timeout: 100 * time.Millisecond}\n\t_, err := client.Get(srv.URL + \"/report\")\n\tfmt.Println(\"client timed out:\", err != nil)\n\terr = <-handlerErr\n\tfmt.Println(\"handler saw:\", err, errors.Is(err, context.Canceled))\n}",
    "versionNote": "Шаблоны маршрутов с методом и {id}, r.PathValue и автоматический 405 — Go 1.22; context.WithoutCancel — Go 1.21; ReadHeaderTimeout — Go 1.8. Пример выполнен Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "net/http: Server",
        "url": "https://pkg.go.dev/net/http#Server"
      },
      {
        "title": "Routing Enhancements for Go 1.22",
        "url": "https://go.dev/blog/routing-enhancements"
      },
      {
        "title": "net/http: Request.Context",
        "url": "https://pkg.go.dev/net/http#Request.Context"
      }
    ],
    "practice": {
      "kind": "Найди, что остановится",
      "promptEN": "A handler calls db.QueryContext(r.Context(), …) and the client closes the browser tab after one second. What happens to the query, and what changes if the handler used context.Background() instead?",
      "promptRU": "Handler вызывает db.QueryContext(r.Context(), …), а клиент через секунду закрывает вкладку. Что будет с запросом к базе и что изменится, если handler передал context.Background()?",
      "pointsEN": [
        "The server notices the closed connection and cancels r.Context(); the driver stops the query and returns context.Canceled.",
        "With context.Background() the query runs to the end and holds a pool connection for nothing.",
        "Either way the response is lost; the point is not wasting the database."
      ],
      "pointsRU": [
        "Сервер замечает закрытое соединение и отменяет r.Context(); драйвер останавливает запрос и возвращает context.Canceled.",
        "С context.Background() запрос доработает до конца и зря держит соединение из пула.",
        "Ответ потерян в обоих случаях; смысл в том, чтобы не нагружать базу впустую."
      ],
      "followUpEN": "Why does http.ListenAndServe(\":8080\", mux) in production deserve a review comment?",
      "followUpRU": "Почему http.ListenAndServe(\":8080\", mux) в продакшене заслуживает комментария на review?"
    }
  },
  {
    "id": "c46",
    "mod": "m7",
    "modName": "7. Go Service: HTTP, Errors, SQL, Logs",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you turn domain errors into HTTP status codes without leaking internals?",
    "qRU": "Как превращать ошибки домена в HTTP-коды, не выдавая наружу внутренние детали?",
    "shortEN": "Keep HTTP out of the domain: the ledger package returns sentinels and typed errors, and one function at the HTTP boundary maps them with errors.Is and errors.As — validation to 400 with the field, not found to 404, a business rule such as insufficient funds to 409 or 422. Everything else is 500 with a generic body, and the real error goes to the log, once.",
    "anchorsEN": [
      "domain returns sentinels and typed errors",
      "one mapping function at the HTTP edge",
      "400 + field · 404 · 409/422 · 500",
      "500: generic body, log once"
    ],
    "jvmEN": "It is the same idea as a Spring @ControllerAdvice that maps exception types to status codes, but in Go it is one explicit function that checks the error with errors.Is and errors.As.",
    "shortRU": "HTTP не должен проникать в домен: пакет ledger возвращает sentinel-ошибки и ошибки-типы, а одна функция на границе HTTP переводит их через errors.Is и errors.As — валидация в 400 с полем, «не найдено» в 404, бизнес-правило вроде нехватки средств в 409 или 422. Всё остальное — 500 с общим текстом, а настоящая ошибка — в лог, один раз.",
    "jvmRU": "Та же идея, что @ControllerAdvice в Spring, который сопоставляет типы исключений и коды статуса, но в Go это одна явная функция, которая проверяет ошибку через errors.Is и errors.As.",
    "detailsEN": [
      "Why one function: every handler answers the same error the same way, and adding a new domain error touches one place. Handlers end with writeError(w, err) and return.",
      "Use errors.As with a pointer target when Error has a pointer receiver: var ve *ValidationError. A value target such as var ve ValidationError makes errors.As panic at run time, and go vet reports it.",
      "Choose and document the code for business rules: 409 Conflict says the request conflicts with the current state, 422 Unprocessable Content says it is well-formed but cannot be applied; teams pick one and write down why.",
      "The 500 body says nothing about the cause: no SQL, no stack traces, no hostnames. Log the error with the request id where it is handled. RFC 9457 problem details (application/problem+json) is a standard shape for error bodies."
    ],
    "detailsRU": [
      "Почему одна функция: каждый handler отвечает на одну и ту же ошибку одинаково, а новая ошибка домена добавляется в одном месте. Handler заканчивается writeError(w, err) и return.",
      "errors.As — с указателем, если Error объявлен на указателе: var ve *ValidationError. Цель-значение вроде var ve ValidationError вызывает panic во время выполнения, и go vet об этом предупреждает.",
      "Код для бизнес-правил выбирают и записывают: 409 Conflict — запрос конфликтует с текущим состоянием, 422 Unprocessable Content — запрос корректен, но применить его нельзя; команда выбирает одно и пишет почему.",
      "Тело ответа 500 ничего не говорит о причине: ни SQL, ни стека, ни имён хостов. Ошибку логируют с request id там, где её обрабатывают. RFC 9457 problem details (application/problem+json) — стандартная форма тела ошибки."
    ],
    "practicalRU": "Это продолжение W1-3 (ValidationError): там errors.As доставал поле, здесь то же поле уходит в ответ 400. Отдельный вопрос интервью — «почему не 200 с {success: false}».",
    "code": "package main\n\nimport (\n\t\"encoding/json\"\n\t\"errors\"\n\t\"fmt\"\n\t\"log/slog\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"os\"\n)\n\n// Domain errors: the ledger package knows nothing about HTTP.\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\ntype ValidationError struct{ Field, Reason string }\n\nfunc (e *ValidationError) Error() string { return \"invalid \" + e.Field + \": \" + e.Reason }\n\n// writeError is the one place that maps domain errors to HTTP.\nfunc writeError(w http.ResponseWriter, log *slog.Logger, err error) {\n\tstatus, body := http.StatusInternalServerError, map[string]string{\"error\": \"internal error\"}\n\tvar ve *ValidationError\n\tswitch {\n\tcase errors.As(err, &ve):\n\t\tstatus, body = http.StatusBadRequest, map[string]string{\"error\": ve.Reason, \"field\": ve.Field}\n\tcase errors.Is(err, ErrNotFound):\n\t\tstatus, body = http.StatusNotFound, map[string]string{\"error\": \"account not found\"}\n\tcase errors.Is(err, ErrInsufficientFunds):\n\t\tstatus, body = http.StatusConflict, map[string]string{\"error\": \"insufficient funds\"}\n\tdefault:\n\t\tlog.Error(\"unexpected error\", \"err\", err) // details go to the log, not to the client\n\t}\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(body)\n}\n\nfunc main() {\n\tlog := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {\n\t\tif a.Key == slog.TimeKey {\n\t\t\treturn slog.Attr{}\n\t\t}\n\t\treturn a\n\t}}))\n\tfor _, err := range []error{\n\t\tfmt.Errorf(\"create: %w\", &ValidationError{\"owner\", \"must not be empty\"}),\n\t\tfmt.Errorf(\"transfer: %w\", ErrNotFound),\n\t\tfmt.Errorf(\"transfer: %w\", ErrInsufficientFunds),\n\t\terrors.New(\"pq: connection refused\"),\n\t} {\n\t\trec := httptest.NewRecorder()\n\t\twriteError(rec, log, err)\n\t\tfmt.Print(rec.Code, \" \", rec.Body.String())\n\t}\n}",
    "versionNote": "errors.Is и errors.As — Go 1.13; log/slog — Go 1.21. Пример выполнен Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "Package errors",
        "url": "https://pkg.go.dev/errors"
      },
      {
        "title": "RFC 9457: Problem Details for HTTP APIs",
        "url": "https://www.rfc-editor.org/rfc/rfc9457"
      },
      {
        "title": "RFC 9110: HTTP Semantics, status codes",
        "url": "https://www.rfc-editor.org/rfc/rfc9110#name-status-codes"
      }
    ],
    "practice": {
      "kind": "Раздай коды",
      "promptEN": "Map these to status codes and say what the client sees: a missing owner name, a transfer from an unknown account, a transfer larger than the balance, and \"pq: connection refused\".",
      "promptRU": "Какие коды получат и что увидит клиент: пустое имя владельца, перевод с несуществующего счёта, перевод больше баланса и «pq: connection refused»?",
      "pointsEN": [
        "400 with the field name; 404 for the unknown account.",
        "409 or 422 for insufficient funds — one choice, documented.",
        "500 with a generic message; the driver error only in the log."
      ],
      "pointsRU": [
        "400 с именем поля; 404 для несуществующего счёта.",
        "409 или 422 для нехватки средств — один выбор, записанный.",
        "500 с общим текстом; ошибка драйвера — только в логе."
      ],
      "followUpEN": "Where is the error logged, and why not in the repository layer as well?",
      "followUpRU": "Где логируется ошибка и почему не ещё и в слое репозитория?"
    }
  },
  {
    "id": "c47",
    "mod": "m7",
    "modName": "7. Go Service: HTTP, Errors, SQL, Logs",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What is *sql.DB, and how do you keep connections and transactions from leaking?",
    "qRU": "Что такое *sql.DB и как не допустить утечки соединений и транзакций?",
    "shortEN": "*sql.DB is a pool of connections, safe for concurrent use: open it once at startup and set limits. Every Rows holds a connection until it is closed, so defer rows.Close() right after the query and check rows.Err() after the loop. A transaction pins one connection: begin it with the request context, defer tx.Rollback(), run every statement on tx, and Commit at the end.",
    "anchorsEN": [
      "*sql.DB = a pool: open once, set limits",
      "defer rows.Close(); check rows.Err()",
      "tx: defer Rollback, statements on tx",
      "context on every call"
    ],
    "jvmEN": "*sql.DB is the pooled DataSource, like HikariCP behind JDBC, not a single Connection. Without try-with-resources, Go relies on defer rows.Close() and defer tx.Rollback() to give the connection back.",
    "shortRU": "*sql.DB — пул соединений, безопасный для одновременного использования: открыть один раз при старте и задать лимиты. Каждый Rows держит соединение, пока его не закроют, поэтому defer rows.Close() — сразу после запроса, а rows.Err() — после цикла. Транзакция занимает одно соединение: начать её с контекстом запроса, сделать defer tx.Rollback(), выполнять все запросы через tx и в конце Commit.",
    "jvmRU": "*sql.DB — это пул, как HikariCP за JDBC, а не одно Connection. Без try-with-resources Go полагается на defer rows.Close() и defer tx.Rollback(), чтобы вернуть соединение.",
    "detailsEN": [
      "Limits: SetMaxOpenConns caps connections, so a request waits for a free one instead of overloading the database; SetMaxIdleConns keeps some open for reuse; SetConnMaxLifetime and SetConnMaxIdleTime retire old connections. Without a cap, a traffic spike opens as many connections as there are goroutines.",
      "Leaks: an unclosed Rows or a transaction that is never committed or rolled back keeps its connection busy. With a cap of 25, 25 leaks block every next query until its context ends.",
      "defer tx.Rollback() is safe after Commit: it returns sql.ErrTxDone and does nothing. A statement on db instead of tx inside the transaction runs on another connection and outside the transaction.",
      "rows.Next() returns false both at the end and on an error in the middle; only rows.Err() tells them apart. With pgx you use pgxpool.Pool the same way: one per process, contexts on every call."
    ],
    "detailsRU": [
      "Лимиты: SetMaxOpenConns ограничивает число соединений, и запрос ждёт свободного вместо перегрузки базы; SetMaxIdleConns держит часть открытыми для повторного использования; SetConnMaxLifetime и SetConnMaxIdleTime закрывают старые. Без лимита всплеск трафика откроет столько соединений, сколько горутин.",
      "Утечки: незакрытый Rows или транзакция без Commit и Rollback держат своё соединение занятым. При лимите 25 двадцать пять утечек блокируют каждый следующий запрос, пока не истечёт его контекст.",
      "defer tx.Rollback() безопасен после Commit: вернёт sql.ErrTxDone и ничего не сделает. Запрос через db вместо tx внутри транзакции идёт по другому соединению и вне транзакции.",
      "rows.Next() возвращает false и в конце, и при ошибке посередине; различает их только rows.Err(). С pgx так же работают с pgxpool.Pool: один на процесс, контекст в каждом вызове."
    ],
    "practicalRU": "Пара к q18 и q19: там ловушки, здесь шаблон, который их исключает. В проекте недели 5 — тот же шаблон для перевода между счетами.",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver\n// (for PostgreSQL: github.com/jackc/pgx/v5/stdlib).\npackage store\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"fmt\"\n\t\"time\"\n)\n\nfunc Open(dsn string) (*sql.DB, error) {\n\tdb, err := sql.Open(\"pgx\", dsn) // a pool, not one connection; create it once\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdb.SetMaxOpenConns(10)\n\tdb.SetMaxIdleConns(10)\n\tdb.SetConnMaxLifetime(30 * time.Minute)\n\treturn db, nil\n}\n\n// Transfer is one transaction: both updates or neither.\nfunc Transfer(ctx context.Context, db *sql.DB, from, to string, amount int64) error {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn fmt.Errorf(\"begin: %w\", err)\n\t}\n\tdefer tx.Rollback() // no-op after a successful Commit (returns sql.ErrTxDone)\n\n\tif _, err := tx.ExecContext(ctx, `UPDATE accounts SET balance = balance - $1 WHERE id = $2`, amount, from); err != nil {\n\t\treturn fmt.Errorf(\"debit %s: %w\", from, err)\n\t}\n\tif _, err := tx.ExecContext(ctx, `UPDATE accounts SET balance = balance + $1 WHERE id = $2`, amount, to); err != nil {\n\t\treturn fmt.Errorf(\"credit %s: %w\", to, err)\n\t}\n\treturn tx.Commit()\n}\n\n// Balances reads every row and always gives the connection back to the pool.\nfunc Balances(ctx context.Context, db *sql.DB) (map[string]int64, error) {\n\trows, err := db.QueryContext(ctx, `SELECT id, balance FROM accounts`)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer rows.Close() // also on early return: otherwise the connection stays busy\n\n\tout := map[string]int64{}\n\tfor rows.Next() {\n\t\tvar id string\n\t\tvar balance int64\n\t\tif err := rows.Scan(&id, &balance); err != nil {\n\t\t\treturn nil, err\n\t\t}\n\t\tout[id] = balance\n\t}\n\treturn out, rows.Err() // an error in the middle of the iteration ends Next with false\n}",
    "versionNote": "BeginTx и *Context-методы — Go 1.8; SetConnMaxIdleTime — Go 1.15. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3); для запуска нужен драйвер.",
    "sources": [
      {
        "title": "Package database/sql",
        "url": "https://pkg.go.dev/database/sql"
      },
      {
        "title": "Go: Managing connections",
        "url": "https://go.dev/doc/database/manage-connections"
      },
      {
        "title": "Go: Executing transactions",
        "url": "https://go.dev/doc/database/execute-transactions"
      }
    ],
    "practice": {
      "kind": "Найди утечку",
      "promptEN": "A function queries rows, and returns early inside the loop when Scan fails, without defer rows.Close(). The pool has SetMaxOpenConns(5). What do users see after five such failures?",
      "promptRU": "Функция читает строки и при ошибке Scan выходит прямо из цикла, без defer rows.Close(). У пула SetMaxOpenConns(5). Что увидят пользователи после пяти таких ошибок?",
      "pointsEN": [
        "Each early return leaves its Rows open, holding a connection.",
        "After five, every new query waits for a free connection until its context deadline.",
        "Fix: defer rows.Close() right after the error check of the query, and check rows.Err()."
      ],
      "pointsRU": [
        "Каждый ранний выход оставляет Rows открытым, и он держит соединение.",
        "После пяти любой новый запрос ждёт свободного соединения до дедлайна своего контекста.",
        "Исправление: defer rows.Close() сразу после проверки ошибки запроса и проверка rows.Err()."
      ],
      "followUpEN": "Why must every statement inside a transaction go through tx and not db?",
      "followUpRU": "Почему каждый запрос внутри транзакции должен идти через tx, а не через db?"
    }
  },
  {
    "id": "c48",
    "mod": "m7",
    "modName": "7. Go Service: HTTP, Errors, SQL, Logs",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you log with log/slog in a service, and how do you keep secrets out of logs?",
    "qRU": "Как логировать через log/slog в сервисе и как не допустить секретов в логах?",
    "shortEN": "Create one slog.Logger with a JSON handler and a level at startup, add request-scoped attributes such as request_id with With in a middleware, and pass that logger through the request context. Log key-value attributes, not formatted strings. Give sensitive types a LogValue method so they log only safe fields, and log each error once, where it is handled.",
    "anchorsEN": [
      "one slog.Logger: JSON handler, level",
      "With(request_id) in middleware",
      "key-value attributes, not format strings",
      "LogValue redacts; log errors once"
    ],
    "jvmEN": "slog plays the role of SLF4J with structured arguments, but there is no MDC: goroutines move between threads, so request attributes travel in a logger passed through the context instead of a ThreadLocal.",
    "shortRU": "При старте создают один slog.Logger с JSON-обработчиком и уровнем, в middleware добавляют атрибуты запроса вроде request_id через With и передают этот логгер через контекст запроса. Логируют пары ключ-значение, а не отформатированные строки. Чувствительным типам дают метод LogValue, чтобы в лог попадали только безопасные поля, а каждую ошибку логируют один раз — там, где её обрабатывают.",
    "jvmRU": "slog играет роль SLF4J со структурными аргументами, но MDC нет: горутины переходят между потоками, поэтому атрибуты запроса едут в логгере, который передают через контекст, а не в ThreadLocal.",
    "detailsEN": [
      "Handlers: slog.NewJSONHandler for machines, slog.NewTextHandler for local reading; HandlerOptions sets the Level and can rewrite attributes with ReplaceAttr. slog.SetDefault also routes the old log package through it.",
      "logger.With(\"request_id\", id) returns a logger that adds the attribute to every record; middleware creates it once per request. Context propagation is a convention: a small helper stores and reads the logger under a private context key.",
      "slog logs a struct's fields as they are, so a struct with a Password field leaks it. A LogValue() slog.Value method replaces the value at log time; that is the place for redaction.",
      "Levels are for operators: Debug for detail you switch on temporarily, Info for normal events, Warn for something odd but handled, Error for a failure someone should look at. Use LogAttrs or typed attributes on hot paths to avoid allocations."
    ],
    "detailsRU": [
      "Обработчики: slog.NewJSONHandler — для машин, slog.NewTextHandler — для чтения глазами; HandlerOptions задаёт Level и может переписывать атрибуты через ReplaceAttr. slog.SetDefault заодно направляет через него старый пакет log.",
      "logger.With(\"request_id\", id) возвращает логгер, который добавляет атрибут к каждой записи; middleware создаёт его один раз на запрос. Передача через контекст — соглашение: маленький helper кладёт и достаёт логгер по закрытому ключу контекста.",
      "slog пишет поля структуры как есть, поэтому структура с полем Password его выдаст. Метод LogValue() slog.Value подменяет значение в момент записи — это и есть место для маскирования.",
      "Уровни — для эксплуатации: Debug — подробности, которые включают на время, Info — обычные события, Warn — странное, но обработанное, Error — сбой, на который кто-то должен посмотреть. На горячих путях — LogAttrs или типизированные атрибуты, чтобы не выделять память."
    ],
    "practicalRU": "Для Kotlin-разработчика: slog — это SLF4J + MDC в одном, но MDC явный: логгер с атрибутами передаётся через контекст, а не через thread-local.",
    "code": "package main\n\nimport (\n\t\"context\"\n\t\"log/slog\"\n\t\"os\"\n)\n\ntype Login struct{ User, Password string }\n\n// LogValue decides what a Login looks like in logs: never the password.\nfunc (l Login) LogValue() slog.Value {\n\treturn slog.GroupValue(slog.String(\"user\", l.User))\n}\n\ntype ctxKey struct{}\n\nfunc withLogger(ctx context.Context, l *slog.Logger) context.Context {\n\treturn context.WithValue(ctx, ctxKey{}, l)\n}\n\nfunc logger(ctx context.Context) *slog.Logger {\n\tif l, ok := ctx.Value(ctxKey{}).(*slog.Logger); ok {\n\t\treturn l\n\t}\n\treturn slog.Default()\n}\n\nfunc main() {\n\tbase := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{\n\t\tLevel: slog.LevelInfo,\n\t\tReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {\n\t\t\tif a.Key == slog.TimeKey {\n\t\t\t\treturn slog.Attr{} // stable output for the example\n\t\t\t}\n\t\t\treturn a\n\t\t},\n\t}))\n\t// Middleware: one logger per request with its id; handlers take it from the context.\n\tctx := withLogger(context.Background(), base.With(\"request_id\", \"r-42\"))\n\n\tlogger(ctx).Debug(\"not printed: below the level\")\n\tlogger(ctx).Info(\"login\", \"input\", Login{User: \"aleks\", Password: \"hunter2\"})\n\tlogger(ctx).Error(\"transfer failed\", \"err\", \"insufficient funds\", \"amount_minor\", 1250)\n}",
    "versionNote": "log/slog — Go 1.21 (LogValuer там же). Пример выполнен Go 1.24.7 и 1.27.3; время из вывода убрано через ReplaceAttr, чтобы вывод был стабильным.",
    "sources": [
      {
        "title": "Package log/slog",
        "url": "https://pkg.go.dev/log/slog"
      },
      {
        "title": "Structured Logging with slog",
        "url": "https://go.dev/blog/slog"
      }
    ],
    "practice": {
      "kind": "Убери секрет",
      "promptEN": "log.Info(\"login\", \"input\", req) prints the whole request struct, including Password. Give two fixes and say which one survives a new field being added to the struct later.",
      "promptRU": "log.Info(\"login\", \"input\", req) печатает всю структуру запроса, включая Password. Предложи два исправления и скажи, какое переживёт новое поле, добавленное в структуру позже.",
      "pointsEN": [
        "Log only the safe fields at the call site: \"user\", req.User.",
        "Or add a LogValue method to the type that returns only safe fields.",
        "LogValue is the safer default: it applies everywhere the type is logged, and a new field is hidden until someone adds it on purpose."
      ],
      "pointsRU": [
        "Логировать только безопасные поля в месте вызова: \"user\", req.User.",
        "Или добавить типу метод LogValue, возвращающий только безопасные поля.",
        "LogValue надёжнее: действует везде, где логируют этот тип, а новое поле скрыто, пока его не добавят осознанно."
      ],
      "followUpEN": "Why is logging an error and returning it at every layer a problem?",
      "followUpRU": "Почему плохо и логировать, и возвращать ошибку на каждом уровне?"
    }
  }
];
