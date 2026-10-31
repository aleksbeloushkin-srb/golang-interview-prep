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
    "shortEN": "In Go, concurrent work runs in goroutines, and the Go runtime, not the operating system, schedules them. You start one with go f(), and f then runs concurrently with the caller. The runtime multiplexes many goroutines over a few OS threads and gives each one a small stack, at least 2 KiB at start, that grows on demand, so a program can run hundreds of thousands of them. But the go statement returns nothing, no ID and no handle, so each goroutine needs an owner, a join point where someone waits for it, and a way to finish.",
    "anchorsEN": [
      "the Go runtime schedules goroutines, not the OS",
      "go f() runs f concurrently with the caller",
      "many Gs on few threads; ≥ 2 KiB stack grows",
      "go returns nothing → owner, join point, exit"
    ],
    "jvmEN": "Unlike a Java platform thread, a goroutine is not an OS thread and there is no Thread object to join or interrupt. Like a Java virtual thread, it blocks like ordinary code; unlike a Kotlin coroutine, it needs no suspend functions; and unlike both, the runtime can preempt it in the middle of a loop.",
    "detailsEN": [
      "Concurrency does not require simultaneous execution. GOMAXPROCS limits how many OS threads can execute user Go code at once; it is not the total number of goroutines or threads.",
      "A new goroutine gets the minimum stack, 2 KiB on Linux/amd64; a reused one may start larger, sized from the average stack use the GC observed. A goroutine also has a descriptor (runtime.g) and can keep heap objects alive, so count × 2 KiB is not a memory estimate.",
      "A thread’s reserved stack, its committed memory and RSS are different numbers. Switching goroutines happens in user space, without a system call. Switch costs depend on the machine and the workload: measure them instead of quoting nanoseconds.",
      "The go statement returns nothing: no ID, no handle, no result. Wait for completion with a WaitGroup, an errgroup or a channel, and give each goroutine an owner and a way to finish. That wait — wg.Wait, g.Wait or a receive — is the join point of the fork that go started: without one, main can return before the goroutine even runs. The runtime numbers goroutines internally (the number shows in stack traces), but the language deliberately does not expose it. Returning from main does not wait for other goroutines."
    ],
    "practicalRU": "На сервере отдельно ограничивай выполняемую работу и очередь запросов. Припаркованная горутина не расходует CPU на само ожидание, но её стек и достижимые данные запроса продолжают занимать память.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tfmt.Println(\"work finished\")\n\t\tclose(done)\n\t}()\n\t<-done // Wait for completion; a Sleep would not establish this ordering.\n}",
    "shortRU": "В Go конкурентная работа выполняется в горутинах, и планирует их рантайм Go, а не операционная система. Горутину запускают так: go f(), и дальше f выполняется конкурентно с вызывающим кодом. Рантайм распределяет много горутин по нескольким потокам ОС и даёт каждой маленький стек — от 2 КиБ на старте, — который растёт по мере надобности, поэтому программа может держать сотни тысяч горутин. Но оператор go ничего не возвращает — ни ID, ни дескриптора, — поэтому у каждой горутины должен быть владелец, точка соединения (join point), где её кто-то ждёт, и способ завершиться.",
    "jvmRU": "В отличие от платформенного потока Java, горутина — не поток ОС, и у неё нет объекта Thread, который можно join или interrupt. Как виртуальный поток Java, она блокируется как обычный код; в отличие от корутины Kotlin, ей не нужны suspend-функции; а в отличие от обоих, рантайм может вытеснить её посреди цикла.",
    "detailsRU": [
      "Конкурентность не требует одновременного исполнения. GOMAXPROCS ограничивает число потоков ОС, одновременно исполняющих пользовательский Go-код; это не общее число горутин или потоков.",
      "Новая горутина получает минимальный стек — 2 КиБ на Linux/amd64; переиспользованная может начать с большего, по среднему использованию стека, которое видел GC. Кроме того, у горутины есть дескриптор (runtime.g), а её ссылки удерживают объекты кучи, поэтому число горутин × 2 КиБ — не оценка памяти.",
      "Резерв адресного пространства под стек потока, выделенная физическая память и RSS — разные величины. Переключение горутин идёт в пространстве пользователя, без системного вызова. Цена переключения зависит от машины и нагрузки: её измеряют, а не заучивают в наносекундах.",
      "Оператор go ничего не возвращает: ни ID, ни дескриптора, ни результата. Дождаться горутину можно через WaitGroup, errgroup или канал; у каждой горутины должен быть владелец и путь завершения. Это ожидание — wg.Wait, g.Wait или приём из канала — и есть точка соединения (join point) для разветвления, которое начал go: без неё main может вернуться раньше, чем горутина вообще начнёт работу. Внутренний номер у горутины есть (виден в трассах стека), но язык намеренно его не отдаёт. Возврат из main не ждёт остальные горутины."
    ],
    "versionNote": "Семантика go не менялась. Размеры и распределение стеков — детали runtime; проверено на Go 1.24.7, 1.26.1 и 1.27.3.",
    "sources": [
      {
        "title": "Go specification: go statements",
        "url": "https://go.dev/ref/spec#Go_statements"
      },
      {
        "title": "go1.27.3: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/stack.go"
      },
      {
        "title": "go1.27.3: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/proc.go"
      },
      {
        "title": "go1.27.3: runtime/debug.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/debug.go"
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
    "shortEN": "Yes, for example in a bank app: two withdrawals can both pass the balance check even when every read and write is locked. That is a race condition without a data race. A race condition is a timing-dependent logic bug; a data race is narrower: unsynchronized access to the same memory with at least one write, which -race can detect. Here the check and the withdrawal take the lock separately, a check-then-act, so they must become one atomic step, for example one critical section.",
    "anchorsEN": [
      "two withdrawals pass the check, everything locked",
      "race condition = timing-dependent logic",
      "data race = no sync + a write; -race can detect it",
      "check-then-act → one atomic step"
    ],
    "jvmEN": "Same as in Java: synchronized getters and setters make each call safe but not a check-then-act sequence. You need one lock around both steps, or a compare-and-set loop, just like with AtomicLong.",
    "shortRU": "Да, например в банковском приложении: два списания могут оба пройти проверку баланса, даже когда каждое чтение и запись под блокировкой. Это логическая гонка без гонки данных. Логическая гонка — ошибка, зависящая от порядка событий; гонка данных — понятие уже: несинхронизированный доступ к одной памяти, когда хотя бы одна операция пишет; её может обнаружить -race. Здесь проверка и списание берут блокировку по отдельности — «проверить, потом сделать», — поэтому их нужно сделать одним атомарным шагом, например одной критической секцией.",
    "jvmRU": "Так же, как в Java: synchronized-геттеры и сеттеры делают безопасным каждый вызов, но не пару «проверить и изменить». Нужна одна блокировка на оба шага или цикл compare-and-set, как с AtomicLong.",
    "detailsEN": [
      "Synchronization must protect the invariant, not just each field access. A balance check and the matching withdrawal must form one operation; a suitable atomic compare-and-swap loop is another possible design.",
      "\"Atomic\" always means atomic relative to something. i++ is one statement but three steps: load, add, store. A sync/atomic add is indivisible for that one variable; a mutex makes a whole critical section indivisible for code that takes the same lock; a database transaction makes its writes all-or-nothing, but a check-and-update inside it is indivisible only with SELECT … FOR UPDATE or a guarded UPDATE (c50). Atomic steps do not add up to an atomic whole: the check and the update must sit inside one boundary.",
      "The race detector observes executed, instrumented paths. A clean go test -race run is useful evidence, not a proof that every possible execution is safe; it does not diagnose all logical races.",
      "An invalid-memory-address panic does not by itself prove a data race. The runtime detects some conflicting map operations, but its map checks are not a substitute for synchronization or the race detector."
    ],
    "detailsRU": [
      "Синхронизация должна защищать инвариант, а не только отдельные обращения к полю. Проверка баланса и соответствующее списание должны быть одной операцией; подходящий цикл compare-and-swap — другой возможный вариант.",
      "«Атомарно» всегда значит «атомарно относительно чего-то». i++ — один оператор, но три шага: прочитать, прибавить, записать. Сложение из sync/atomic неделимо для одной переменной; мьютекс делает неделимой целую критическую секцию для кода, который берёт ту же блокировку; транзакция БД делает свои записи «всё или ничего», но проверка и изменение внутри неё неделимы только с SELECT … FOR UPDATE или UPDATE с условием (c50). Из атомарных шагов не складывается атомарное целое: проверка и изменение должны быть внутри одной границы.",
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
    "shortEN": "The go statement only schedules the call: go f(x) evaluates f and x in the calling goroutine and runs the call in a new goroutine. On the system stack, newproc reuses a dead G or allocates one with the minimum stack, 2 KiB on Linux, saves where it should start, and normally puts it into runnext of the current P. That makes it runnable, not running: when it runs is up to the scheduler, so the caller must synchronize to wait for it.",
    "anchorsEN": [
      "arguments evaluated in the caller",
      "newproc on g0 → G + 2 KiB (Linux) → runnext",
      "runnable ≠ running → synchronize"
    ],
    "jvmEN": "Unlike new Thread(r).start() in Java, there is no object to keep: go returns nothing. The arguments are copied at the go statement, but a closure, unlike a Java lambda that captures effectively final values, captures the variables themselves.",
    "detailsEN": [
      "newproc uses the system stack g0. newproc1 obtains a dead G from gfget or creates one; stack allocation or reuse depends on the available G and the current stack policy. Reuse is not a promise of zero allocations. A newly created G gets the minimum stack (2 KiB on Linux); since Go 1.19 a reused G can instead get a starting size based on average stack usage recalculated at each GC (GODEBUG adaptivestackstart, on by default).",
      "The runtime initializes the saved SP and PC, keeps the closure in g.sched.ctxt and, on amd64, pushes goexit onto the new stack as the return address. These are data for a future execution, not the CPU registers of an already running goroutine.",
      "newproc requests runnext placement with runqput(..., true), but runtime conditions can choose an ordinary queue. newproc then calls wakep, so an idle P may pick the goroutine up by stealing. A scheduler later transitions the G from runnable to running. The language promises neither immediate execution nor FIFO launch order.",
      "The runtime has internal goroutine IDs, but the language exposes no goroutine handle, public current-ID API or operation to kill another goroutine. Use explicit request IDs, cancellation and completion signals; do not parse stack dumps as an identity API."
    ],
    "practicalRU": "Передавай значения явно, если работнику нужен снимок состояния. Замыкание, которое позже читает изменяемое общее состояние, имеет другую семантику и может создать гонку.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvalues := make(chan int)\n\tn := 1\n\tgo func(value int) { values <- value }(n)\n\tn = 2\n\tfmt.Println(<-values, n) // 1 2; no timing assumption.\n}",
    "shortRU": "Оператор go только планирует вызов: go f(x) вычисляет f и x в вызывающей горутине, а сам вызов выполняет в новой. На системном стеке newproc берёт завершившуюся G или создаёт новую с минимальным стеком (2 КиБ в Linux), сохраняет, откуда ей стартовать, и обычно ставит её в runnext текущего P. Так она становится готовой к запуску, но не выполняется: когда её запустить, решает планировщик, поэтому чтобы её дождаться, нужна синхронизация.",
    "jvmRU": "В отличие от new Thread(r).start() в Java, хранить нечего: go ничего не возвращает. Аргументы копируются в момент оператора go, а замыкание, в отличие от лямбды Java с effectively final значениями, захватывает сами переменные.",
    "detailsRU": [
      "newproc использует системный стек g0. newproc1 получает завершённую G через gfget или создаёт новую; выделение либо переиспользование стека зависит от найденной G и текущей политики. Переиспользование не обещает ноль выделений. Новая структура G получает минимальный стек (2 КиБ в Linux); с Go 1.19 переиспользуемая G может получить стартовый размер по среднему использованию стека, которое пересчитывается на каждом GC (GODEBUG adaptivestackstart, включён по умолчанию).",
      "Рантайм инициализирует сохранённые SP и PC, кладёт замыкание в g.sched.ctxt, а на amd64 записывает goexit на новый стек как адрес возврата. Это данные будущего исполнения, а не регистры CPU уже работающей горутины.",
      "newproc запрашивает размещение в runnext через runqput(..., true), но условия рантайма могут привести к обычной очереди. Затем newproc вызывает wakep, и простаивающий P может забрать горутину перехватом. Позже планировщик переводит G из runnable в running. Язык не обещает немедленного исполнения или порядка запуска FIFO.",
      "У рантайма есть внутренние ID горутин, но язык не предоставляет дескриптор горутины, публичный API текущего ID или операцию убийства другой горутины. Используй явные ID запросов, отмену и сигналы завершения; разбор stack dump не заменяет API идентификации."
    ],
    "versionNote": "Порядок вычисления go — гарантия языка. newproc1/gfget/runnext — детали runtime, не API; проверено на Go 1.24.7, 1.26.1 и 1.27.3. Адаптивный стартовый стек — с Go 1.19, в Go 1.17 его нет.",
    "sources": [
      {
        "title": "Go specification: go statements",
        "url": "https://go.dev/ref/spec#Go_statements"
      },
      {
        "title": "go1.27.3: runtime/proc.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/proc.go"
      },
      {
        "title": "go1.27.3: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/stack.go"
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
    "shortEN": "Every goroutine has its own stack, and Go manages it itself rather than leaving it to the OS. It lives in memory the runtime takes from its heap pages, but a separate stack allocator manages it, not mallocgc and the GC sweep. Small stacks come from per-P caches and free lists, large ones get their own spans, and a growing stack is copied to a bigger block, so it can move. MemStats.StackInuse therefore counts stack spans, not the bytes your locals use right now.",
    "anchorsEN": [
      "stackalloc, not mallocgc",
      "per-P cache → free lists → own span; can move",
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
    "shortRU": "У каждой горутины свой стек, и Go управляет им сам, а не оставляет это ОС. Он лежит в памяти, которую рантайм берёт из страниц кучи, но управляет им отдельный аллокатор стеков, а не mallocgc и sweep сборщика. Малые стеки берутся из кешей на P и списков свободных стеков, большие получают свои спаны, а растущий стек копируется в больший блок, поэтому может переехать. Поэтому MemStats.StackInuse считает спаны стеков, а не байты, которые сейчас занимают локальные переменные.",
    "jvmRU": "В Java стек платформенного потока — нативная память с фиксированным максимумом из -Xss, и он никогда не переезжает. Стек горутины начинается маленьким, растёт и переезжает — поэтому программа на Go может позволить себе сотни тысяч горутин.",
    "detailsRU": [
      "Небольшие стеки берутся из кешей P и списков свободных стеков по размерам; более крупные получают отдельные спаны. Фраза «стек лежит в куче» скрывает отличие от выделения обычного объекта через mallocgc.",
      "На amd64 RSP указывает внутрь активного стека. Сохранённый g.sched.sp задаёт позицию продолжения, а g.stack.lo/hi описывают выделенную область. В регистре хранится адрес, а не сам стек.",
      "Неиспользуемые спаны стеков могут вернуться в кучу. Уменьшение стека, освобождение спана и возврат физических страниц ОС — разные события; ни одно не обещает немедленного соответствующего падения RSS.",
      "StackSys включает полученную рантаймом память стеков, в том числе некоторые стеки потоков ОС, но не учитывает каждый стек C. ReadMemStats выдаёт общие счётчики рантайма, а не отчёт о выделениях отдельной горутины."
    ],
    "versionNote": "Поля MemStats — публичная документация; устройство stack spans и кешей не менялось, проверено на Go 1.24.7, 1.26.1 и 1.27.3. Счётчики — не RSS.",
    "sources": [
      {
        "title": "go1.27.3: runtime/mstats.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/mstats.go"
      },
      {
        "title": "go1.27.3: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/stack.go"
      },
      {
        "title": "go1.27.3: runtime/runtime2.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/runtime2.go"
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
    "shortEN": "Goroutine stacks start small and grow by copying. When the stack pointer would pass the stack guard, the function prologue calls morestack; the runtime allocates a stack at least twice as big and copies the frames into it. Pointers stay valid because the compiler’s stack maps and the runtime’s own bookkeeping let it fix every pointer into the old stack, and user heap objects never point into a stack. By default, growth stops at 1 GB on 64-bit systems: beyond that the program dies with a fatal stack overflow.",
    "anchorsEN": [
      "prologue: SP vs guard → morestack",
      "copy to ≥ 2×; stack maps fix the pointers",
      "1 GB by default → fatal overflow"
    ],
    "jvmEN": "A Java platform thread stack cannot grow past -Xss: deep recursion ends with StackOverflowError, 1 MiB by default on 64-bit Linux. In Go the same recursion keeps working, because the stack doubles by copying, until the 1 GB limit, and then the program dies instead of throwing an error you can catch.",
    "detailsEN": [
      "Stack checks lead through morestack/newstack on the growth path. Not every function has the same prologue: small leaf functions and nosplit code have special rules. A tripped guard can also request preemption, not just allocation.",
      "For normal growth, newstack starts with twice the old size and can double again until the needed frame fits. copystack relocates active frames and uses pointer maps to fix references; channel-related references require coordinated updates too.",
      "Shrinking is a separate operation at safe points. The GC can halve a stack when usage including a safety allowance is below one quarter, subject to minimum size and safety checks. Returning from a call does not itself guarantee shrinking.",
      "The default per-goroutine growth limit is 1 GB on 64-bit systems and 250 MB on 32-bit systems; because sizes double, the largest stack under the 64-bit default is 512 MiB; debug.SetMaxStack changes the limit for future growth. Exceeding it crashes the program. A uintptr is an integer, not a GC-tracked pointer you may keep across arbitrary operations."
    ],
    "practicalRU": "Используй обычные указатели и ограничивай глубину рекурсии. Если в профиле заметно копирование стеков, сначала изучи глубину вызовов и крупные кадры; worker pool не является универсальным лечением роста стека.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc descend(depth int, value *int) int {\n\tvar frame [1024]byte\n\tframe[0] = byte(depth)\n\tif depth == 0 {\n\t\t*value = 42\n\t\treturn 0\n\t}\n\tsum := descend(depth-1, value)\n\treturn sum + int(frame[0]) // Keep frame data live across the call.\n}\n\nfunc main() {\n\tvalue := 0\n\tsum := descend(64, &value)\n\tfmt.Println(value, sum) // 42 2080; not a measurement of stack addresses.\n}",
    "shortRU": "Стеки горутин начинаются маленькими и растут копированием. Когда указатель стека вот-вот перейдёт границу guard, пролог функции вызывает morestack; рантайм выделяет стек минимум вдвое больше и копирует в него кадры. Указатели остаются корректными, потому что карты стека от компилятора и собственный учёт рантайма позволяют исправить каждый указатель на старый стек, а объекты кучи из пользовательского кода никогда не указывают в стек. По умолчанию рост останавливается на 1 ГБ на 64-битных системах: дальше программа падает с фатальной ошибкой stack overflow.",
    "jvmRU": "Стек платформенного потока Java не растёт дальше -Xss: глубокая рекурсия заканчивается StackOverflowError, по умолчанию на 1 МиБ на 64-битном Linux. В Go та же рекурсия продолжает работать — стек удваивается копированием — до предела в 1 ГБ, а потом программа погибает, а не бросает ошибку, которую можно поймать.",
    "detailsRU": [
      "Путь роста проходит через morestack/newstack. Не у каждой функции одинаковый пролог: у небольших листовых функций и nosplit-кода особые правила. Срабатывание guard может также означать запрос вытеснения, а не только выделение памяти.",
      "Для обычного роста newstack начинает с удвоенного размера и при необходимости удваивает снова, чтобы вместить нужный кадр. copystack переносит активные кадры и исправляет ссылки по картам указателей; ссылки, связанные с каналами, тоже требуют согласованного обновления.",
      "Уменьшение — отдельная операция в безопасных точках. GC может уменьшить стек вдвое, если использование с защитным запасом меньше четверти, с учётом минимального размера и проверок безопасности. Сам возврат из вызова не гарантирует уменьшения.",
      "Стандартный предел роста одной горутины — 1 ГБ на 64-битных системах и 250 МБ на 32-битных; так как размер удваивается, наибольший стек при 64-битном пределе — 512 МиБ; debug.SetMaxStack меняет предел будущего роста. Превышение аварийно завершает программу. uintptr — целое число, а не отслеживаемый GC указатель, который можно сохранять через произвольные операции."
    ],
    "versionNote": "Пороги, удвоение, карты указателей и уменьшение стека не менялись: проверено на Go 1.24.7, 1.26.1 и 1.27.3. Тест результата не доказывает момент перемещения стека.",
    "sources": [
      {
        "title": "go1.27.3: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/stack.go"
      },
      {
        "title": "go1.27.3: runtime/debug/garbage.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/debug/garbage.go"
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
    "shortEN": "Switching goroutines happens in user space and restores only a little state: which goroutine is current, where its stack is, and where to continue. They are saved in g.sched, and on amd64 gogo puts the G into R14, restores RSP and jumps to the saved PC. Every switch goes through g0, the thread’s system stack: mcall saves the running goroutine and calls the scheduler there, and gogo loads the next one.",
    "anchorsEN": [
      "who R14 · stack RSP · where PC",
      "saved in g.sched",
      "mcall → g0 → gogo"
    ],
    "jvmEN": "A Java platform thread switch is done by the kernel; a goroutine switch is a user-space jump that saves a few values in g.sched, with no system call. That is why blocking a goroutine on a channel is cheap.",
    "shortRU": "Переключение горутин идёт в пространстве пользователя и восстанавливает немного состояния: какая горутина текущая, где её стек и откуда продолжить. Они хранятся в g.sched, а на amd64 gogo кладёт G в R14, восстанавливает RSP и прыгает на сохранённый PC. Каждое переключение идёт через g0 — системный стек потока: mcall сохраняет текущую горутину и вызывает там планировщик, а gogo загружает следующую.",
    "jvmRU": "Переключение платформенных потоков Java делает ядро; переключение горутин — прыжок в пространстве пользователя, который сохраняет несколько значений в g.sched, без системного вызова. Поэтому заблокировать горутину на канале дёшево.",
    "detailsEN": [
      "A register is a small CPU storage location used during execution. RSP is an address, not the stack itself; R14 is a pointer to Go runtime metadata, not the whole goroutine. RIP changes as instructions and control transfers execute.",
      "Each M has a g0 used for system-stack work. On amd64, gogo installs the current G, restores SP, BP and closure context, clears selected saved fields, and jumps to the saved PC. It is not a fixed four-instruction operation.",
      "mcall saves the caller’s continuation and switches to g0 to call a runtime function. g.sched is saved continuation state, not a dump of every CPU register. Switching goroutines is distinct from an OS thread context switch. So few saved values are enough because a voluntary switch happens at a call, where Go’s ABI keeps nothing in callee-saved registers; asynchronous preemption first saves every register in memory.",
      "Register names and conventions are architecture-dependent. This diagram uses amd64; on arm64 Go uses R28 for the current G. Neither the g0 stack nor every goroutine stack has one universally fixed size."
    ],
    "detailsRU": [
      "Регистр — небольшое хранилище процессора, используемое при выполнении. RSP содержит адрес, а не сам стек; R14 — указатель на данные runtime, а не всю горутину. RIP меняется при выполнении инструкций и переходов.",
      "У каждого M есть g0 для работы на системном стеке. На amd64 gogo устанавливает текущую G, восстанавливает SP, BP и контекст замыкания, очищает часть сохранённых полей и переходит к сохранённому PC. Это не операция ровно из четырёх инструкций.",
      "mcall сохраняет место продолжения вызывающей стороны и переключается на g0 для вызова функции runtime. g.sched — сохранённое состояние продолжения, а не снимок всех регистров CPU. Переключение горутин отличается от переключения потоков ОС. Немногих сохранённых значений хватает, потому что добровольное переключение происходит на вызове, где ABI Go ничего не держит в регистрах, сохраняемых вызываемой функцией; при асинхронном вытеснении все регистры сначала сохраняются в памяти.",
      "Имена регистров и соглашения зависят от архитектуры. Эта схема — про amd64; на arm64 Go использует R28 для текущей G. Размер стека g0 и каждой пользовательской горутины не является одной универсальной константой."
    ],
    "practicalRU": "Опора для памяти: «кто выполняется — где стек — откуда продолжить». Для amd64 это R14, RSP и сохранённый PC с переходом в RIP. По одному кадру systemstack или mcall нельзя установить причину сбоя: нужен стек вызовов и контекст.",
    "versionNote": "Схема amd64, проверено на Go 1.24.7, 1.26.1 и 1.27.3. Асинхронное вытеснение в Go 1.24 клало все регистры на стек, с Go 1.26 векторные — в g.xRegs. Адреса условные, действия сокращены: это не ассемблер.",
    "sources": [
      {
        "title": "Go 1.27.3: internal ABI",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/cmd/compile/abi-internal.md"
      },
      {
        "title": "Go 1.27.3: gogo / mcall on amd64",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/asm_amd64.s"
      },
      {
        "title": "Go 1.27.3: scheduler",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/proc.go"
      },
      {
        "title": "go1.24.7: runtime/preempt_amd64.s",
        "url": "https://github.com/golang/go/blob/go1.24.7/src/runtime/preempt_amd64.s"
      },
      {
        "title": "go1.27.3: runtime/preempt_xreg.go",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/preempt_xreg.go"
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
    "shortEN": "GOMAXPROCS limits parallel Go code: with GOMAXPROCS=4, at most four goroutines run Go code at the same moment. That is because GOMAXPROCS is the number of Ps, and a P is the right to run Go code. By default it equals the number of logical CPUs the process may use, and in the GMP model a goroutine (G) runs on an OS thread (M) only while that thread holds a P. Threads can still outnumber Ps, because a thread blocked for long in a system call or in cgo can lose its P to another thread.",
    "anchorsEN": [
      "GOMAXPROCS=4 → at most 4 Gs run Go code at once",
      "Ps = logical CPUs by default; GMP: G runs on M only while M holds a P",
      "threads > Ps: a long-blocked M loses its P"
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
    "shortRU": "GOMAXPROCS ограничивает параллельное исполнение Go-кода: при GOMAXPROCS=4 его одновременно исполняют не больше четырёх горутин. Дело в том, что GOMAXPROCS — это число P, а P — право исполнять Go-код. По умолчанию их столько же, сколько логических CPU доступно процессу, а в модели GMP горутина (G) выполняется на потоке ОС (M), только пока этот поток держит P. Потоков всё равно может быть больше, чем P: поток, надолго заблокированный в системном вызове или в cgo, может потерять свой P, и его получит другой поток.",
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
    "shortEN": "Without preemption, a goroutine that never blocks would hog its P and starve the others. So the runtime asks it to yield. The sysmon thread notices a goroutine that has run for about 10 ms and requests preemption. Since Go 1.14 that works even in a tight loop without function calls, because on Unix sysmon sends SIGURG and the handler makes the goroutine call asyncPreempt at a safe point. It is only a request: the switch waits for a safe point, and it neither releases locks nor cancels work.",
    "anchorsEN": [
      "sysmon: running ~10 ms → request",
      "SIGURG → asyncPreempt (Go 1.14+)",
      "only at a safe point; locks stay"
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
    "shortRU": "Без вытеснения горутина, которая никогда не блокируется, держала бы свой P вечно, и остальные голодали бы. Поэтому рантайм просит её уступить. Поток sysmon замечает горутину, которая работает уже около 10 мс, и запрашивает вытеснение. С Go 1.14 это работает даже в плотном цикле без вызовов функций: на Unix sysmon шлёт SIGURG, и обработчик заставляет горутину вызвать asyncPreempt в безопасной точке. Это только запрос: переключение ждёт безопасной точки и не отпускает блокировки и не отменяет работу.",
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
    "shortEN": "Each time a goroutine stops running, the scheduler picks the next one, roughly in this order. It checks the P’s runnext and local queue, then the global queue, the network poller, and only then other Ps. Two rules keep it balanced: every 61st tick a P takes one goroutine from the global queue first, so global work does not starve, and a thief takes half of the victim’s local queue from the head. Only runnable goroutines move; a running one is never stolen.",
    "anchorsEN": [
      "runnext → local → global → netpoll → steal",
      "every 61st tick: one G from global",
      "steal half, from the head"
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
    "shortRU": "Каждый раз, когда горутина перестаёт выполняться, планировщик ищет следующую примерно в таком порядке. Сначала runnext и локальная очередь своего P, потом глобальная очередь, netpoller и только потом другие P. Равновесие держат два правила: на каждом 61-м тике P сначала берёт одну горутину из глобальной очереди, чтобы глобальная работа не голодала, а при перехвате забирается половина локальной очереди жертвы с головы. Перемещаются только готовые горутины; исполняющуюся не перехватить.",
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
    "shortEN": "A goroutine can wait in different ways, and that matters for threads: network waits free the thread, while blocking system calls and cgo hold it. A read that would block parks the goroutine in the netpoller, so no thread waits per socket; during a long system call or cgo call, sysmon takes the thread’s P and, if there is work, gives it to another thread. So Go code keeps running, but a program can end up with many more threads than GOMAXPROCS.",
    "anchorsEN": [
      "network wait → netpoller, thread free",
      "syscall / cgo → sysmon moves the P",
      "threads can exceed GOMAXPROCS"
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
    "shortRU": "Горутина может ждать по-разному, и для потоков это важно: ожидание сети освобождает поток, а блокирующие системные вызовы и cgo его держат. Чтение, которое заблокировалось бы, паркует горутину в netpoller, поэтому отдельного потока на сокет нет; во время долгого системного вызова или вызова cgo sysmon забирает P этого потока и, если есть работа, отдаёт его другому потоку. Поэтому Go-код продолжает работать, но потоков у программы может стать намного больше, чем GOMAXPROCS.",
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
    "shortEN": "Each P has a one-slot fast lane, runnext, in front of its local queue. When a goroutine starts another with go, or wakes one with a channel send, the new one usually lands there instead of at the tail. That cuts latency for send-and-wait pairs, but it is a preference, not a guarantee of who runs next. A goroutine taken from runnext inherits the current time slice, so sysmon can preempt such a pair like one long-running goroutine.",
    "anchorsEN": [
      "go or a channel wake → usually runnext",
      "one slot before the local queue: a preference, not a guarantee",
      "inherits the time slice → sysmon preempts the pair"
    ],
    "detailsEN": [
      "With next=true, runqput can replace the current slot using CAS and move the previous occupant to the ordinary queue; queue overflow has its own path. Calling this a one-element LIFO stack hides the displacement into another queue.",
      "runqget checks runnext before the ordinary local queue and reports inheritTime=true for that path. execute then does not increment schedtick. This local preference does not override all other scheduler work or guarantee immediate execution after go or a channel operation.",
      "A chain of goroutines can keep replacing runnext while sharing a tick. sysmon preemption helps prevent monopolizing a P. The slot’s capacity of one is not by itself a fairness proof; the runtime disables this optimization without sysmon and can randomize its use in some builds.",
      "Goroutines that hand work to each other often keep running on the same core with warm caches; that is a tendency, not a guarantee. Correct synchronization must work whether or not runnext is used and even if the goroutine moves to another P."
    ],
    "practicalRU": "Объясняй через «один предпочтительный кандидат, остальные остаются в очереди». Не оправдывай передачу данных без синхронизации предполагаемым порядком runnext.",
    "code": "// Source-level model, NOT executable Go. No concurrent queue changes.\n// Before: runnext=A, ordinary queue=[X Y]\n// runqput(P, B, true), assuming runnext is enabled and the queue has room:\n// After:  runnext=B, ordinary queue=[X Y A]\n// runqget(P) can return B with inheritTime=true.\n// This is a local queue rule, not an application execution-order guarantee.",
    "shortRU": "У каждого P есть быстрая полоса на одну горутину — runnext, перед локальной очередью. Когда горутина запускает другую через go или будит её отправкой в канал, новая обычно попадает туда, а не в хвост очереди. Это снижает задержку для пар «отправил — ждёт», но это предпочтение, а не гарантия, кто запустится следующим. Горутина, взятая из runnext, наследует текущий квант, поэтому sysmon может вытеснить такую пару как одну долго работающую горутину.",
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
    "shortEN": "A goroutine leak is like a memory leak: a goroutine outlives its work and never finishes. Usually it is stuck on a channel, a lock or I/O with no timeout; the GC never collects it. So every goroutine needs an exit: whoever starts one must be able to stop it. Since Go 1.27, the goroutineleak profile lists goroutines blocked on a channel, mutex or WaitGroup that the GC finds unreachable. Other leaks, for example on I/O, show up as a stack group that keeps growing in the goroutine profile. In tests, go.uber.org/goleak fails the test if goroutines are left behind.",
    "anchorsEN": [
      "like a memory leak: outlives its work, never ends",
      "stuck on a channel, lock or I/O; the GC never collects it",
      "whoever starts it must be able to stop it",
      "Go 1.27 goroutineleak profile; else a growing stack group",
      "goleak in tests"
    ],
    "jvmEN": "In Java a stuck platform thread shows up in a thread dump under its name. Goroutines have IDs in dumps but no names and no public ID API, so you find a leak by grouping identical stacks, or by pprof labels, and watching which group grows.",
    "shortRU": "Утечка горутины похожа на утечку памяти: горутина пережила свою работу и уже не завершится. Обычно она застряла на канале, блокировке или вводе-выводе без таймаута; GC горутины не собирает. Поэтому каждой горутине нужен выход: кто её запустил, тот должен уметь её остановить. Начиная с Go 1.27 профиль goroutineleak показывает горутины, которые ждут недостижимый для GC канал, мьютекс или WaitGroup. Остальные утечки, например на вводе-выводе, видны как группа стеков, которая всё растёт в профиле горутин. В тестах go.uber.org/goleak роняет тест, если остались горутины.",
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
  // МОДУЛЬ 3: КАНАЛЫ (HCHAN), SELECT, CAS И SYNC (Q13 - Q22, C55 - C56)
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
    "shortEN": "A channel buffer is a fixed-size queue between the sending and the receiving goroutines. With a buffer, senders can queue up to cap values and go on without waiting for a receiver; a goroutine sending into an unbuffered channel waits until another goroutine receives the value. A buffer decouples the two sides but does not raise their sustained rate: when it is full, the sending goroutine blocks, so a slow consumer still sets the pace. And a send copies only the value, so a pointer or a slice still shares its data with the receiver.",
    "anchorsEN": [
      "buffered: up to cap values queued, no receiver needed",
      "unbuffered: the sending goroutine waits for a receiver",
      "decouples, doesn't raise the sustained rate: a full buffer blocks the sender",
      "copies the value, not what it points to"
    ],
    "jvmEN": "An unbuffered channel is like Java’s SynchronousQueue and a buffered one like an ArrayBlockingQueue with put and take. What Java queues lack is close, to signal the end of the stream, and select, to wait on several channels at once.",
    "shortRU": "Буфер канала — очередь фиксированного размера между отправляющей и принимающей горутинами. С буфером отправители могут поставить в очередь до cap значений и идти дальше, не дожидаясь получателя; горутина, которая отправляет в небуферизованный канал, ждёт, пока другая горутина примет значение. Буфер развязывает стороны, но не поднимает их устойчивый темп: когда он полон, отправляющая горутина блокируется, поэтому темп всё равно задаёт медленный потребитель. А отправка копирует только значение, поэтому указатель или срез по-прежнему делят данные с получателем.",
    "jvmRU": "Небуферизованный канал похож на SynchronousQueue в Java, буферизованный — на ArrayBlockingQueue с put и take. Чего у очередей Java нет — это close, чтобы сообщить о конце потока, и select, чтобы ждать сразу на нескольких каналах.",
    "detailsEN": [
      "For an open channel, a waiting receiver can take a value directly, even if the channel has buffer capacity. Otherwise, a sender uses a free buffer slot or waits. With select and default, an operation that cannot proceed can be skipped instead of waiting.",
      "A send copies the element value. A slice value still refers to its backing array, and a pointer still refers to the same object. Copy the data or agree on ownership and synchronization before either side mutates shared data.",
      "In makechan, the limit below 64 KiB is on one element, not the total buffer. For a nonzero buffer of pointer-free elements, the runtime allocates hchan and buffer together; pointer-containing elements use a separately allocated buffer. This layout is not a language guarantee.",
      "Choose capacity from the amount of work allowed in flight. Little's law, L = λW, makes this concrete: items in the system equal the arrival rate times the time each one spends there. With a consumer at 100 jobs/s, a full buffer of 10,000 adds about 100 s of waiting per job and nothing to throughput; only a faster slowest stage helps (q45). A buffer pays off for bursts and batching, not for a permanently slower consumer; measure throughput, waiting and retained memory."
    ],
    "detailsRU": [
      "Для открытого канала ожидающий получатель может получить значение напрямую, даже если канал имеет буфер. Иначе отправитель использует свободную ячейку или ждёт. В select с default неготовую операцию можно пропустить вместо ожидания.",
      "Отправка копирует значение элемента. Значение среза продолжает ссылаться на исходный массив, а указатель — на тот же объект. До изменения общих данных нужна копия либо договорённость о владении и синхронизации.",
      "В makechan ограничение меньше 64 КиБ относится к одному элементу, а не ко всему буферу. Ненулевой буфер элементов без указателей выделяется вместе с hchan; для элементов с указателями буфер выделяется отдельно. Такое размещение не гарантировано языком.",
      "Выбирай ёмкость по допустимому объёму незавершённой работы. Закон Литтла, L = λW, делает это наглядным: число элементов в системе равно темпу поступления, умноженному на время, которое каждый в ней проводит. Если потребитель делает 100 задач в секунду, полный буфер на 10 000 добавляет каждой задаче около 100 с ожидания и ничего не добавляет к пропускной способности; помогает только ускорение самой медленной стадии (q45). Буфер окупается на всплесках и при пакетной обработке, а не при постоянно более медленном потребителе; измеряй пропускную способность, ожидание и удерживаемую память."
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
    "code": "// Function fragment. No receiver is needed for these two sends.\nfunc BufferFull() bool {\n\tch := make(chan int, 2)\n\tch <- 10\n\tch <- 20\n\tselect {\n\tcase ch <- 30:\n\t\treturn false\n\tdefault:\n\t\treturn true\n\t}\n}",
    "quizIds": [
      "q45"
    ]
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
    "shortEN": "A channel's state decides whether an operation blocks, returns at once or panics. A send or receive on a nil channel blocks the goroutine forever; on an open channel it waits until a partner or the buffer lets the operation complete; and a receive from a closed channel never blocks. A closed channel first returns the remaining buffered values, then the zero value with ok=false, while a send on it, closing it twice, or closing nil panics. In select a nil case is never chosen, which is how you switch a case off.",
    "anchorsEN": [
      "nil: goroutine blocks forever · open: waits · closed: receive never blocks",
      "closed: drain, then zero with ok=false",
      "send on closed · close twice · close nil → panic"
    ],
    "jvmEN": "A Java BlockingQueue has no closed state, so the end of a stream is signalled with a poison pill or an interrupt. In Go, close is that signal, and a range loop over the channel stops by itself.",
    "shortRU": "От состояния канала зависит, заблокируется операция, вернётся сразу или вызовет панику. Отправка или чтение на nil-канале блокируют горутину навсегда; на открытом канале она ждёт, пока операцию не позволит партнёр или буфер; а чтение из закрытого канала никогда не блокируется. Закрытый канал сначала отдаёт оставшиеся в буфере значения, затем нулевое значение с ok=false, а отправка в него, повторный close или close nil-канала паникуют. В select ветка с nil-каналом никогда не выбирается — так ветку выключают.",
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
    "simId": "sim12",
    "qEN": "Channels or a mutex — who owns the data, and what must happen together?",
    "qRU": "Канал или мьютекс: кто владеет данными и какие действия должны выполняться вместе?",
    "shortEN": "Channels and mutexes coordinate goroutines but answer different questions: who owns the data, and what must change together. Use a channel to hand over ownership or signal an event, for example a producer passing jobs to workers. Use a mutex to protect shared state with an invariant, such as a balance whose check and update need one lock. Channels are not lock-free either: hchan, their runtime struct, has its own lock. The third option, confinement, needs no lock on the data: only one goroutine touches it, or each gets its own copy. A sent pointer is not a copy.",
    "anchorsEN": [
      "channel = hand off ownership, signal (jobs → workers)",
      "mutex = invariant: check + update under one lock",
      "hchan has its own runtime lock: channels are not lock-free",
      "third option: confinement — one goroutine, or its own copy",
      "a sent pointer still shares data"
    ],
    "jvmEN": "Java makes the same split: synchronized or ReentrantLock for shared state, a BlockingQueue for handoff. The differences are that sync.Mutex is not reentrant, and channels add close and select, which BlockingQueue lacks.",
    "detailsEN": [
      "After confinement, four questions in order. Handing data from one goroutine to another, that is ownership? A channel. Guarding a type's internal state? A mutex kept inside the type, never exported. Coordinating several events, cancellation or timeouts? Channels with select. A profiled hot spot? Then a mutex or atomics may win, since a channel takes a lock inside. The Go proverb \"Don't communicate by sharing memory; share memory by communicating\" sets a default, not a ban: Go supports both (sim12).",
      "Confinement: data that only one goroutine can reach needs no lock. It can be by agreement, when one owner goroutine serves requests over a channel, or by scope, when a function creates the data inside its goroutine and exposes only a receive-only <-chan. Copies work the same way if they are deep: a copied struct still shares its slices and maps.",
      "A channel send copies its value. A pointer or slice can still refer to shared mutable memory. For an ownership-transfer protocol, the sender stops accessing that memory after handing it over, or both sides synchronize access. The compiler does not enforce this protocol.",
      "A mutex should cover the whole operation: check balance AND withdraw, or look up AND install a missing entry. Locking each field access separately can avoid a data race yet leave a logic race. All accesses to protected mutable state must follow the same protocol.",
      "RWMutex allows concurrent readers, but RLock does not permit writes. A pending writer can block new readers; there is no atomic read-to-write upgrade. Extra bookkeeping can outweigh parallelism for short reads: RWMutex is not automatically faster than Mutex.",
      "Channels compose with select for cancellation and communication. Mutex.Lock has no context parameter and cannot be a select case. An atomic operation covers its specified value, not an arbitrary multi-field invariant; an actor also needs bounded queues and an exit path."
    ],
    "practicalRU": "Начни с инварианта: баланс не должен стать отрицательным. Проверку и изменение держи под одним lock. Универсальной цены в наносекундах и замедления актора в 10 раз нет: измеряй свою нагрузку. Возвращай снимки, а не доступ к изменяемому состоянию после unlock.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tmu      sync.Mutex\n\tbalance int\n}\n\nfunc (a *Account) Withdraw(n int) bool {\n\ta.mu.Lock()\n\tdefer a.mu.Unlock()\n\tif n <= 0 || a.balance < n {\n\t\treturn false\n\t}\n\ta.balance -= n\n\treturn true\n}\nfunc main() {\n\ta := Account{balance: 10}\n\tfmt.Println(a.Withdraw(7), a.Withdraw(7)) // true false\n}",
    "shortRU": "Каналы и мьютексы координируют горутины, но отвечают на разные вопросы: кто владеет данными и что должно меняться вместе. Канал — чтобы передать владение или сообщить о событии, например когда производитель отдаёт задания воркерам. Мьютекс — чтобы защитить общее состояние с инвариантом, например баланс, проверка и изменение которого требуют одной блокировки. Каналы тоже не обходятся без блокировки: у их структуры в рантайме, hchan, есть своя блокировка. Третий вариант, confinement (изоляция), обходится без блокировки данных: их трогает только одна горутина или каждая получает свою копию. Отправленный указатель — не копия.",
    "jvmRU": "В Java то же разделение: synchronized или ReentrantLock для общего состояния, BlockingQueue для передачи. Разница в том, что sync.Mutex не реентерабелен, а у каналов есть close и select, которых нет у BlockingQueue.",
    "detailsRU": [
      "После confinement — четыре вопроса по порядку. Передаёте данные от одной горутины другой, то есть владение? Канал. Защищаете внутреннее состояние типа? Мьютекс внутри типа, не наружу. Координируете несколько событий, отмену или таймауты? Каналы и select. Горячее место по профилю? Тогда мьютекс или atomic могут выиграть, ведь канал внутри сам берёт блокировку. Пословица Go «Don't communicate by sharing memory; share memory by communicating» задаёт выбор по умолчанию, а не запрет: Go поддерживает оба подхода (sim12).",
      "Confinement (изоляция): данные, до которых может дотянуться только одна горутина, не требуют блокировки. Это бывает по договорённости, когда одна горутина-владелец обслуживает запросы через канал, или по области видимости, когда функция создаёт данные внутри своей горутины и наружу отдаёт только канал для чтения <-chan. Копии работают так же, если они глубокие: скопированная структура по-прежнему делит свои срезы и map.",
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
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 2 и 4: дерево решения и confinement",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
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
    "shortEN": "A channel has two wait queues, one for receivers (recvq) and one for senders (sendq). What stands in them is a sudog: a waiting ticket, one per operation a goroutine waits on. The goroutine itself is not enough: in a select it can wait on several channels at once, so it holds a ticket in each queue. A ticket records the goroutine, the channel and where the value comes from or goes to, so a partner can copy it directly. When one case wins, the other tickets are withdrawn, and all of them return to a per-P cache.",
    "anchorsEN": [
      "two wait queues: recvq, sendq",
      "sudog = a waiting ticket, one per waiting operation",
      "select: one goroutine, a ticket in each queue",
      "ticket = g + channel + where the value is",
      "case wins → others withdrawn → per-P cache"
    ],
    "jvmEN": "A Java thread blocked on a lock or a queue waits in one place at a time. Go needs a separate record per wait because select lets one goroutine sit in several channel queues at once.",
    "shortRU": "У канала две очереди ожидания — для получателей (recvq) и для отправителей (sendq). Стоят в них sudog: талоны ожидания, по одному на каждую операцию, которой ждёт горутина. Самой горутины мало: в select она может ждать сразу на нескольких каналах, поэтому держит талон в каждой очереди. В талоне записано, какая горутина, какой канал и откуда взять или куда положить значение, чтобы партнёр мог скопировать его напрямую. Когда одна ветка срабатывает, остальные талоны снимаются, и все они возвращаются в кеш на P.",
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
    "shortEN": "If a receiver is already waiting, the send skips the buffer. The sending goroutine copies the value straight into the receiver's variable, usually on its stack, under the channel lock. If nobody waits and there is room, the value goes into the buffer, which lives on the heap. With no room, the sender parks: on an unbuffered channel a receiver later copies the value from the sender's stack; on a full buffer it takes the oldest value and moves the sender's into the freed slot. It is safe because a goroutine parked on a channel has activeStackChans set, so moving its stack requires the same channel locks.",
    "anchorsEN": [
      "receiver waiting → straight into its variable (usually its stack)",
      "nobody waits + room → buffer on the heap",
      "no room → sender parks; unbuffered: copy from its stack; full: oldest out, sender's in",
      "activeStackChans: a stack move takes the channel locks"
    ],
    "jvmEN": "Java’s SynchronousQueue hands over an object reference through the heap. A Go channel copies the value itself, even a whole struct, straight into the receiver’s variable.",
    "shortRU": "Если получатель уже ждёт, отправка минует буфер. Отправляющая горутина копирует значение прямо в переменную получателя, обычно на его стеке, под блокировкой канала. Если никто не ждёт и место есть, значение идёт в буфер, который лежит в куче. Если места нет, отправитель паркуется: на небуферизованном канале получатель потом копирует значение с его стека, а на полном буфере забирает самое старое значение и переносит значение отправителя в освободившуюся ячейку. Это безопасно: у горутины, запаркованной на канале, стоит флаг activeStackChans, поэтому перенос её стека требует тех же блокировок каналов.",
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
    "shortEN": "select waits on several channel operations at once and runs one ready case. It is chosen at random among the ready ones, so the order in the source gives no priority. A default case runs only when nothing is ready, and a nil channel case is never ready. To prefer cancellation, check ctx.Err(), or do a non-blocking select on ctx.Done(), before the main select: that narrows the window but is still not a strict priority.",
    "anchorsEN": [
      "random among ready → no priority",
      "default only if nothing is ready",
      "check ctx first: narrower, not strict"
    ],
    "jvmEN": "Java has no direct equivalent: the closest are CompletableFuture.anyOf or a NIO Selector for sockets. In Go select works on any channels, including timers and ctx.Done().",
    "shortRU": "select ждёт сразу нескольких операций с каналами и выполняет одну готовую ветку. Она выбирается случайно среди готовых, поэтому порядок в исходнике приоритета не даёт. default выполняется, только когда не готово ничего, а ветка с nil-каналом никогда не готова. Чтобы отдать предпочтение отмене, проверь ctx.Err() или сделай неблокирующий select по ctx.Done() до основного select: это сужает окно, но строгим приоритетом всё равно не становится.",
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
    "shortEN": "No: the compiler rewrites simple selects, and only two or more channel cases call runtime.selectgo. An empty select blocks forever, one case becomes a plain channel operation, and one case plus default becomes a non-blocking attempt. selectgo locks the channels in address order, polls them in random order and, if nothing is ready and there is no default, parks on all of them until one operation wins a CAS on selectDone.",
    "anchorsEN": [
      "simple forms rewritten; ≥ 2 cases → selectgo",
      "lock by address, poll in random order",
      "no default → park on all; a CAS on selectDone wins"
    ],
    "shortRU": "Нет: компилятор переписывает простые select, и только две и больше ветки с каналами вызывают runtime.selectgo. Пустой select блокирует навсегда, одна ветка становится обычной операцией с каналом, а одна ветка плюс default — неблокирующей попыткой. selectgo блокирует каналы в порядке адресов, опрашивает их в случайном порядке и, если ничего не готово и default нет, паркуется на всех, пока одна операция не выиграет CAS по selectDone.",
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
    "extraSims": [
      {
        "simId": "sim9",
        "step": 7
      }
    ],
    "qEN": "What does compare-and-swap do, and why is a separate check and store different?",
    "qRU": "Что делает compare-and-swap и чем отличается от отдельной проверки и записи?",
    "shortEN": "Compare-and-swap means: \"if x still holds the value I saw, replace it with mine\", and the hardware checks and writes as one indivisible step. In Go it is atomic.CompareAndSwapInt64(&x, old, new), which returns false if x no longer equals old, usually because another goroutine changed it. For an update such as an increment you re-read and retry in a loop; for a one-time claim from 0 to 1, false means another goroutine won. A separate Load and Store leave a gap: two goroutines can both read 0 and both write 1, each believing it won, while with CAS exactly one succeeds. It covers one variable, so an invariant across several fields usually needs a mutex.",
    "anchorsEN": [
      "CAS: x still what I saw → write mine, one indivisible step",
      "false: x ≠ old → increment: re-read, retry; claim 0→1: someone else won",
      "Load + Store: gap, both \"win\"; CAS: exactly one",
      "one variable; multi-field invariant → mutex"
    ],
    "jvmEN": "This is AtomicInteger.compareAndSet in Java and atomic.Int32.CompareAndSwap in Go. Go atomics are always sequentially consistent, like Java volatile; Go has no weaker modes such as lazySet or getAcquire.",
    "shortRU": "Compare-and-swap означает: «если в x всё ещё то значение, которое я видел, замени его моим», и железо проверяет и записывает одним неделимым шагом. В Go это atomic.CompareAndSwapInt64(&x, old, new): он возвращает false, если x уже не равно old — обычно потому, что его изменила другая горутина. Для обновления вроде инкремента значение перечитывают и повторяют в цикле; для однократного захвата с 0 на 1 false значит, что выиграла другая горутина. Отдельные Load и Store оставляют окно: две горутины могут обе прочитать 0 и обе записать 1, и каждая решит, что выиграла, а с CAS успешна ровно одна. CAS охватывает одну переменную, поэтому инварианту из нескольких полей обычно нужен мьютекс.",
    "jvmRU": "Это AtomicInteger.compareAndSet в Java и atomic.Int32.CompareAndSwap в Go. Атомики Go всегда последовательно согласованы, как volatile в Java; более слабых режимов вроде lazySet или getAcquire в Go нет.",
    "detailsEN": [
      "Think of three inputs: the location, expected old value and proposed new value. If state starts at 0 and two goroutines each try CAS(0, 1), only one can succeed as long as nothing resets state. A failure does not wait or retry by itself.",
      "Separate atomic Load and Store calls do not make a combined check-and-update atomic. Both callers can load 0 before either stores 1. CAS closes this gap for the one value it operates on; it does not make an entire multi-field algorithm atomic.",
      "In registers on amd64: a direct call to atomic.CompareAndSwapInt64 is compiled inline as LOCK CMPXCHGQ. The instruction requires the expected old value in AX; the address and the new value sit in registers the compiler picks (the runtime's assembly Cas64, used for indirect calls, puts them in BX and CX). CMPXCHGQ compares AX with the memory word: if they are equal, it writes the new value there and sets the zero flag; if not, it loads the current value into AX and clears the flag. SETEQ turns the flag into the bool result, and LOCK makes the whole read-compare-write indivisible across cores. On arm64 the choice is made at run time: with LSE it is one CASALD instruction; without it, a loop of LDAXR (load-exclusive) and STLXR (store-exclusive), where a value different from old exits at once with false and the store retries if the exclusive reservation was lost, for example because another core wrote nearby.",
      "Go atomics behave as if in a sequentially consistent order. Cache coherence is part of the hardware implementation, not a promise of one latency, one cache-line size or identical instructions on every CPU.",
      "CAS compares the current value, not its history: A → B → A can still match A. A state/version design needs its own correctness argument. Start with a mutex for compound invariants unless an atomic design has a concrete benefit."
    ],
    "detailsRU": [
      "Запомни три входа: место в памяти, ожидаемое старое значение, предлагаемое новое. Если state сначала 0 и две горутины пробуют CAS(0, 1), успешной будет только одна, пока никто не сбрасывает state. Неудачный CAS сам не ждёт и не повторяется.",
      "Отдельные атомарные Load и Store не делают всю проверку с изменением атомарной. Оба участника могут прочитать 0 до первой записи 1. CAS закрывает этот промежуток для одного значения, но не превращает весь алгоритм с несколькими полями в атомарный.",
      "В регистрах на amd64: прямой вызов atomic.CompareAndSwapInt64 компилятор встраивает как LOCK CMPXCHGQ. Инструкции нужно ожидаемое старое значение в AX; адрес и новое значение лежат в регистрах, которые выбирает компилятор (ассемблерная Cas64 рантайма для косвенных вызовов кладёт их в BX и CX). CMPXCHGQ сравнивает AX со словом в памяти: если они равны, записывает туда новое значение и ставит флаг нуля; если нет, загружает текущее значение в AX и сбрасывает флаг. SETEQ превращает флаг в результат bool, а LOCK делает всё чтение-сравнение-запись неделимым для всех ядер. На arm64 выбор делается во время выполнения: с LSE это одна инструкция CASALD; без неё — цикл из LDAXR (exclusive load) и STLXR (exclusive store), где значение, отличное от old, сразу даёт false, а запись повторяется, если exclusive-резервирование потеряно, например потому что другое ядро записало рядом.",
      "Атомики Go ведут себя как операции в едином последовательном порядке. Когерентность кешей относится к аппаратной реализации, а не к гарантии одной задержки, размера cache line или инструкции для всех CPU.",
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
    "simId": "sim8",
    "extraSims": [
      {
        "simId": "sim9",
        "step": 3
      }
    ],
    "qEN": "How does a mutex acquire, wait and hand off — and what does 1 ms really mean?",
    "qRU": "Как Mutex захватывается, ждёт и передаёт владение — и что на самом деле означает 1 мс?",
    "shortEN": "Inside, sync.Mutex is a state word plus a semaphore, and Lock tries three things in turn. First one CAS that flips the word from unlocked to locked; with no contention, that is all. If the mutex is held, the goroutine may spin briefly, betting on a quick release, and then sleeps on the semaphore. Unlock wakes at most one waiter, and in normal mode that waiter competes with newcomers already running and often loses: fast, but unfair. A woken waiter that has waited more than 1 ms and finds the mutex taken again switches it to starvation mode, where Unlock hands ownership straight to the waiter at the front, so 1 ms is a mode threshold, not a timeout.",
    "anchorsEN": [
      "state word + semaphore",
      "Lock: one CAS → brief spin → sleep on the semaphore",
      "normal mode: woken waiter races newcomers, often loses",
      "waited > 1 ms and lost again → starvation mode: direct handoff; not a timeout"
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
    "shortRU": "Внутри sync.Mutex — слово состояния и семафор, и Lock пробует три вещи по очереди. Сначала один CAS, который переводит слово из «свободен» в «занят»; без конкуренции на этом всё. Если мьютекс занят, горутина может недолго покрутиться в спин-цикле в расчёте на быстрое освобождение, а потом засыпает на семафоре. Unlock будит не больше одного ждущего, и в обычном режиме тот соревнуется с уже работающими новичками и часто проигрывает: быстро, но нечестно. Разбуженный ждущий, который ждёт дольше 1 мс и снова застал мьютекс занятым, переводит его в режим голодания, где Unlock передаёт владение прямо первому в очереди, поэтому 1 мс — порог смены режима, а не таймаут.",
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
    "shortEN": "All three coordinate goroutines, but each does one job. WaitGroup waits for a counted group of goroutines to finish, Once runs an initialization exactly once while other callers wait, and Context carries cancellation, deadlines and request values to the work. They do not replace each other: WaitGroup does not cancel, Context does not wait, and Once does not retry a failed initialization. A handler often uses all three.",
    "anchorsEN": [
      "WaitGroup waits · Once initializes · Context cancels",
      "none replaces another",
      "Once does not retry"
    ],
    "jvmEN": "WaitGroup is like a reusable CountDownLatch whose count you can raise with Add; Once is like a lazy holder or double-checked initialization; Context is like an explicit, passed-along version of thread interruption with a deadline. Go passes Context as the first argument instead of keeping it in a ThreadLocal.",
    "detailsEN": [
      "WaitGroup: register an initial task before Wait can observe a zero counter. With Add/Done, normally call Add before starting the goroutine. Do not copy after first use; reuse for a new batch only after all previous Wait calls returned. Wait publishes completed work to its waiter, but it does not protect concurrent writes between workers.",
      "WaitGroup.Go was added in Go 1.25. It registers and starts a task; call wg.Go(f), not go wg.Go(f). The function must not panic. Go 1.26.1 re-panics without Done for a recovered non-nil panic, whereas 1.25.0 used defer Done. This prevents Wait from letting main exit before that panic finishes; it does not make panicking callbacks supported.",
      "Errors from goroutines: a WaitGroup carries no results and no errors. Either send a result struct with a value and an err field back to the caller, which has more context to decide what to do, or use errgroup.WithContext: Wait returns the first non-nil error, and the derived ctx is cancelled so the other goroutines can stop early.",
      "Implementation history: Go 1.17 used three uint32 words to obtain an aligned 64-bit state plus a semaphore. Go 1.25/1.26 use atomic.Uint64: high 32 bits count tasks; the low part contains a synctest flag and 31 waiter bits. Memorize the contract first, not a permanent two-counter layout.",
      "Once.Do publishes initialization only after f finishes. A CAS that marks done before f runs would let losing callers return too early. Recursive Do on the same Once deadlocks. If f panics, Once considers that invocation complete: later Do calls do not retry f. Once itself must not be copied after use.",
      "Cancellation is a request: work must observe Done or use a context-aware API, and its owner still waits for completion where needed. Call the CancelFunc to release associated resources. Context methods are safe for concurrent use; mutable objects stored in values are not automatically protected.",
      "WithoutCancel (Go 1.21+) keeps value lookup but removes the parent deadline, cancellation and cause: Done is nil. Add an explicit timeout if using it. This is suitable only for intentionally detached, owned best-effort work; it neither guarantees delivery nor connects the task to service shutdown. Mandatory audit needs a durable handoff or completion before success."
    ],
    "practicalRU": "Задай три вопроса: кто регистрирует задачу и ждёт её, кто публикует инициализированное состояние, кто отменяет? Фоновая работа требует решения о жизненном цикле. Таймаут и отдельная горутина не заменяют надёжную очередь.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tvar once sync.Once\n\tvar base int\n\tresults := make([]int, 2)\n\tfor i := range results {\n\t\twg.Go(func() {\n\t\t\tonce.Do(func() { base = 42 })\n\t\t\tresults[i] = base\n\t\t})\n\t}\n\twg.Wait()\n\tfmt.Println(results) // [42 42]\n}",
    "shortRU": "Все три координируют горутины, но у каждого своя задача. WaitGroup ждёт завершения посчитанной группы горутин, Once выполняет инициализацию ровно один раз, пока остальные ждут, а Context несёт отмену, дедлайны и значения запроса до самой работы. Друг друга они не заменяют: WaitGroup не отменяет, Context не ждёт, Once не повторяет неудавшуюся инициализацию. Обработчик часто использует все три.",
    "jvmRU": "WaitGroup похож на CountDownLatch, который можно переиспользовать и счётчик которого увеличивают через Add; Once — на ленивый holder или double-checked инициализацию; Context — на явную, передаваемую по цепочке версию прерывания потока с дедлайном. Go передаёт Context первым аргументом, а не хранит его в ThreadLocal.",
    "detailsRU": [
      "WaitGroup: зарегистрируй первую задачу до того, как Wait сможет увидеть нулевой счётчик. С Add/Done обычно вызывай Add до запуска горутины. После первого использования нельзя копировать; новую группу задач начинай только после возврата всех предыдущих Wait. Wait делает завершённую работу видимой ожидающему, но не защищает записи workers друг от друга.",
      "WaitGroup.Go добавлен в Go 1.25. Он регистрирует и запускает задачу: вызывай wg.Go(f), а не go wg.Go(f). Функция не должна паниковать. Go 1.26.1 повторяет перехваченный ненулевой panic без Done, тогда как 1.25.0 использовал defer Done. Это не даёт Wait выпустить main до завершения такого panic; паника callback всё равно нарушает контракт.",
      "Ошибки из горутин: WaitGroup не передаёт ни результатов, ни ошибок. Либо отправляй вызывающему коду структуру с значением и полем err — у него больше контекста, чтобы решить, что делать, — либо бери errgroup.WithContext: Wait возвращает первую ненулевую ошибку, а производный ctx отменяется, чтобы остальные горутины могли остановиться раньше.",
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
      },
      {
        "title": "errgroup.WithContext — golang.org/x/sync",
        "url": "https://pkg.go.dev/golang.org/x/sync/errgroup#WithContext"
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
  {
    "id": "c55",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim11",
    "qEN": "Deadlock, livelock, starvation — how do they differ, and how do you prevent a deadlock?",
    "qRU": "Deadlock, livelock и starvation — чем они отличаются и как не допустить deadlock?",
    "shortEN": "All three are ways concurrent code stops making progress. In a deadlock, goroutines wait for each other in a cycle: G1 holds lock a and waits for b, while G2 holds b and waits for a. It needs four Coffman conditions at once: mutual exclusion, hold and wait, no preemption and circular wait, so breaking any one prevents it; one lock order for everybody breaks the cycle. In a livelock, goroutines stay busy backing off and retrying in step, but nothing gets done. In starvation, the program moves on, but one goroutine rarely gets the resource.",
    "shortRU": "Все три — способы, которыми конкурентный код перестаёт продвигаться. При deadlock горутины ждут друг друга по кругу: G1 держит блокировку a и ждёт b, а G2 держит b и ждёт a. Для него нужны сразу четыре условия Коффмана: взаимное исключение, удержание с ожиданием, отсутствие вытеснения и циклическое ожидание, поэтому достаточно сломать любое; единый порядок блокировок для всех ломает цикл. При livelock горутины заняты — отступают и повторяют попытку в такт, — но работа не делается. При starvation программа идёт дальше, но одна горутина редко получает ресурс.",
    "anchorsEN": [
      "deadlock: a cycle — G1 holds a, waits for b; G2 holds b, waits for a",
      "Coffman: mutual exclusion, hold and wait, no preemption, circular wait — break one",
      "one lock order for everybody → no cycle",
      "livelock: busy retrying in step, no progress",
      "starvation: others progress, one rarely gets the resource"
    ],
    "jvmEN": "The terms are the same as in Java. jstack prints \"Found one Java-level deadlock\" for monitors and ReentrantLocks; Go's runtime reports \"all goroutines are asleep - deadlock!\" only when the whole program is stuck, so in a server you look for the cycle in the goroutine profile. And there is no tryLock with a timeout: sync.Mutex has only TryLock.",
    "jvmRU": "Термины те же, что в Java. jstack печатает «Found one Java-level deadlock» для мониторов и ReentrantLock; рантайм Go сообщает «all goroutines are asleep - deadlock!», только когда встала вся программа, поэтому в сервере цикл ищут в профиле горутин. И tryLock с таймаутом нет: у sync.Mutex есть только TryLock.",
    "detailsEN": [
      "Coffman conditions (1971) in Go terms. Mutual exclusion: a sync.Mutex or a row lock has one owner at a time. Hold and wait: a goroutine keeps lock a while it waits for b. No preemption: nobody can take a lock away; only an Unlock, normally by its holder, releases it. Circular wait: the waits form a cycle. A deadlock needs all four at once.",
      "Prevention breaks one condition. A single global order, such as locking accounts by ascending ID (c50), removes circular wait. TryLock that releases what it holds on failure removes hold and wait (some textbooks call it breaking no preemption), at the risk of livelock. A database that aborts one transaction does not prevent the deadlock: it detects it and recovers by taking the victim's locks away. Holding one lock at a time, briefly and with no calls out (HTTP, channel sends, callbacks) under it, avoids the question.",
      "Detection. The Go runtime prints \"fatal error: all goroutines are asleep - deadlock!\" only when every goroutine is blocked and no timer or network wait can wake one; a server always has such waiters, so it just hangs, and under -race the check does not run at all. In a goroutine dump (/debug/pprof/goroutine?debug=2), look for goroutines in state [sync.Mutex.Lock] on their second lock. A Go mutex records no owner, so the dump shows only where each one waits; who holds which lock you work out from the code. PostgreSQL finds cycles itself and aborts one transaction with 40P01 (c50).",
      "Livelock usually comes from a well-meant fix: both goroutines take their first lock, fail TryLock on the second, release, back off for the same time and try again, in step. They keep retrying with zero throughput, and with a busy spin instead of a sleep the CPU burns too, so it looks alive. Random jitter in the back-off makes them fall out of step; one lock order removes the reason to retry.",
      "Starvation: a greedy goroutine holds a shared lock for its whole batch while a polite one locks only around each small step; both are correct, yet the greedy one does far more work. You see it in per-worker throughput or wait-time metrics, not as a crash, and it applies to any resource: CPU, connections, memory. sync.Mutex itself switches to starvation mode when a woken waiter has waited over 1 ms (c21, sim8)."
    ],
    "detailsRU": [
      "Условия Коффмана (1971) на языке Go. Взаимное исключение: у sync.Mutex или блокировки строки один владелец. Удержание с ожиданием: горутина держит a, пока ждёт b. Нет вытеснения: блокировку нельзя отобрать, её отпускает только Unlock — обычно того, кто её взял. Циклическое ожидание: ожидания замыкаются в круг. Deadlock требует всех четырёх сразу.",
      "Профилактика ломает одно условие. Единый порядок — например, блокировать счета по возрастанию ID (c50) — убирает циклическое ожидание. TryLock, который при неудаче отпускает всё взятое, убирает удержание с ожиданием (в некоторых учебниках это называют нарушением «нет вытеснения»), но грозит livelock. База данных, которая отменяет одну транзакцию, deadlock не предотвращает: она его обнаруживает и выходит из него, отбирая блокировки у жертвы. Одна блокировка за раз, ненадолго и без вызовов наружу под ней (HTTP, отправка в канал, колбэки) снимает вопрос.",
      "Обнаружение. Рантайм Go печатает «fatal error: all goroutines are asleep - deadlock!», только когда заблокированы все горутины и ни таймер, ни ожидание сети не может разбудить ни одну; в сервере такие ожидающие есть всегда, поэтому он просто висит, а под -race эта проверка не срабатывает вовсе. В дампе горутин (/debug/pprof/goroutine?debug=2) ищи горутины в состоянии [sync.Mutex.Lock] на второй блокировке. Мьютекс Go не хранит владельца, поэтому дамп показывает только, где каждая ждёт; кто какую блокировку держит, выясняют по коду. PostgreSQL находит циклы сама и отменяет одну транзакцию с 40P01 (c50).",
      "Livelock обычно рождается из благого намерения: обе горутины берут первую блокировку, получают отказ TryLock на второй, отпускают, ждут одно и то же время и пробуют снова — в такт. Попыток много, пропускная способность нулевая, а если вместо сна крутиться в цикле, ещё и CPU горит, поэтому всё выглядит живым. Случайная добавка к задержке (jitter) выводит их из такта; единый порядок блокировок убирает саму причину повторять.",
      "Starvation: жадная горутина держит общую блокировку всю свою пачку работы, а вежливая берёт её только на каждый маленький шаг; обе корректны, но жадная делает гораздо больше. Видно это по метрикам пропускной способности или ожидания на воркера, а не по падению, и касается любого ресурса: CPU, соединений, памяти. Сам sync.Mutex переходит в режим голодания, когда разбуженный ждущий ждал больше 1 мс (c21, sim8)."
    ],
    "practicalRU": "В сервисе deadlock выглядит не как падение, а как зависшие запросы и растущее число горутин. Сними дамп горутин (/debug/pprof/goroutine?debug=2) и найди пары в состоянии [sync.Mutex.Lock]. Правило для ревью: если код берёт несколько блокировок, у всех путей один порядок; под блокировкой — никаких вызовов наружу (HTTP, Kafka, отправка в канал без select с ctx). Livelock и starvation ищи по метрикам: повторных попыток много, а пропускная способность падает; один воркер или одна очередь обслуживается заметно реже других.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tID      int\n\tmu      sync.Mutex\n\tBalance int\n}\n\n// transfer locks both accounts in ascending ID order, so two\n// opposite transfers can never wait for each other in a cycle.\nfunc transfer(from, to *Account, amount int) {\n\tif from == to {\n\t\treturn // sync.Mutex is not reentrant\n\t}\n\tfirst, second := from, to\n\tif to.ID < from.ID {\n\t\tfirst, second = to, from\n\t}\n\tfirst.mu.Lock()\n\tdefer first.mu.Unlock()\n\tsecond.mu.Lock()\n\tdefer second.mu.Unlock()\n\tfrom.Balance -= amount\n\tto.Balance += amount\n}\n\nfunc main() {\n\ta := &Account{ID: 1, Balance: 100}\n\tb := &Account{ID: 2, Balance: 100}\n\tvar wg sync.WaitGroup\n\tfor range 1000 {\n\t\twg.Add(2)\n\t\tgo func() { defer wg.Done(); transfer(a, b, 1) }()\n\t\tgo func() { defer wg.Done(); transfer(b, a, 1) }()\n\t}\n\twg.Wait()\n\tfmt.Println(a.Balance, b.Balance) // 100 100\n}",
    "versionNote": "Определения не зависят от версии. Пример выполнен на Go 1.24.7 и 1.27.3, в том числе с -race; for range по числу требует Go 1.22+. Состояние [sync.Mutex.Lock] в дампе и условие сообщения «all goroutines are asleep - deadlock!» (runtime.checkdead) сверены с исходниками Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "Deadlock and the Coffman conditions — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Deadlock_(computer_science)"
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 1: deadlock, livelock, starvation",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
      },
      {
        "title": "runtime.checkdead — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/runtime/proc.go#L6418"
      },
      {
        "title": "sync.Mutex — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#Mutex"
      }
    ],
    "quizIds": [
      "q44",
      "q41",
      "q8"
    ],
    "practice": {
      "kind": "Найди цикл",
      "promptEN": "Two handlers share two mutexes: CreateOrder locks users, then orders; CancelOrder locks orders, then users. What can happen under load, how do you prove it, and how do you fix it?",
      "promptRU": "Два обработчика делят два мьютекса: CreateOrder берёт users, потом orders, а CancelOrder — orders, потом users. Что может случиться под нагрузкой, как это доказать и как исправить?",
      "pointsEN": [
        "Deadlock: each handler holds one mutex and waits for the other — circular wait; requests hang, the process does not crash.",
        "Proof: a goroutine dump shows both stuck in [sync.Mutex.Lock] on their second lock; Go mutexes record no owner, so the code shows that each holds the lock the other wants.",
        "Fix: one lock order on every path (users, then orders) or one mutex for both; TryLock with back-off needs jitter, or it can livelock."
      ],
      "pointsRU": [
        "Deadlock: каждый обработчик держит один мьютекс и ждёт другой — циклическое ожидание; запросы висят, процесс не падает.",
        "Доказательство: в дампе горутин обе стоят в [sync.Mutex.Lock] на второй блокировке; владельца мьютекс Go не хранит, поэтому то, что каждая держит нужную другой, видно по коду.",
        "Исправление: один порядок на всех путях (сначала users, потом orders) или один мьютекс на оба; TryLock с отступом требует jitter, иначе возможен livelock."
      ],
      "followUpEN": "Why doesn't the Go runtime print \"all goroutines are asleep\" here, while the same bug in a small main does, unless it runs under -race?",
      "followUpRU": "Почему рантайм Go здесь не печатает «all goroutines are asleep», а тот же баг в маленьком main печатает — если не запускать его под -race?"
    }
  },
  {
    "id": "c56",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What is sync.Cond for, and why must Wait sit in a loop?",
    "qRU": "Зачем нужен sync.Cond и почему Wait вызывают в цикле?",
    "shortEN": "sync.Cond lets goroutines sleep until shared state changes, for example workers waiting until a queue has an item. It pairs a lock, c.L, with a list of waiting goroutines. A goroutine locks c.L and checks the condition; if it is false, Wait unlocks, sleeps and locks again before returning. The goroutine that changes the state calls Signal to wake one waiter or Broadcast to wake all. Wait sits in a for loop, because another goroutine may change the state before the woken one gets the lock. Cond has no select and no timeout, so for a simple signal use a channel.",
    "shortRU": "sync.Cond позволяет горутинам спать, пока не изменится общее состояние, — например, воркерам ждать, пока в очереди появится элемент. Он связывает блокировку c.L со списком ждущих горутин. Горутина берёт c.L и проверяет условие; если оно ложно, Wait отпускает блокировку, засыпает и перед возвратом снова её берёт. Горутина, которая меняет состояние, вызывает Signal, чтобы разбудить одного ждущего, или Broadcast — чтобы всех. Wait вызывают в цикле for, потому что, пока разбуженная горутина ждёт блокировку, другая может снова изменить состояние. В select Cond не участвует и таймаута у него нет, поэтому для простого сигнала берут канал.",
    "anchorsEN": [
      "Cond = lock c.L + list of waiters: sleep until the state changes",
      "Wait: unlock → sleep → lock again",
      "Signal wakes one, Broadcast wakes all",
      "for !ready { c.Wait() }: the state may change before you get the lock",
      "no select, no timeout → for a simple signal, a channel"
    ],
    "jvmEN": "sync.Cond is Java's Condition from lock.newCondition(), or wait and notify on a monitor: Wait is await, Signal is signal, Broadcast is signalAll, and the while loop is the same rule. Unlike Java, Wait has no spurious wakeups, no timed version and no interruption.",
    "jvmRU": "sync.Cond — это Condition из lock.newCondition() в Java или wait/notify на мониторе: Wait — await, Signal — signal, Broadcast — signalAll, и правило цикла while то же. В отличие от Java, у Wait нет ложных пробуждений, версии с таймаутом и прерывания.",
    "detailsEN": [
      "Wait requires c.L to be held. It first puts the goroutine on the wait list, then unlocks c.L and parks; after a Signal or Broadcast it locks c.L again before returning. Because it registers before unlocking, a Signal sent right after the unlock is not lost.",
      "Signal and Broadcast do not require the lock, but changing the condition does: change the state under c.L, then signal. Cond keeps no memory of events: a Signal with no waiters does nothing. That is why a waiter checks the state, not whether a signal arrived.",
      "Signal when exactly one waiter can use the change, such as one new item. Broadcast when the change matters to every waiter, such as close or shutdown, or when waiters wait for different things: with one Cond for both \"not empty\" and \"not full\", Signal can wake a goroutine that cannot proceed while the right one keeps sleeping.",
      "Limits: Wait is not a select case and takes no context. For cancellation, set a closed flag under the lock and Broadcast; context.AfterFunc (Go 1.21) can run it when ctx is done, but the callback must lock c.L before Broadcast, or the wakeup can be lost, as the example in the context package shows. Do not copy a Cond after first use; go vet reports copies.",
      "Channels cover most cases: closing a channel is a one-time Broadcast, and a send is a Signal that carries a value. Cond fits when many goroutines wait on state that keeps changing — a bounded queue, a resource pool, a batch becoming ready — and that state already lives under a mutex. The sync documentation itself recommends channels for simple cases."
    ],
    "detailsRU": [
      "Wait вызывают, держа c.L. Сначала он ставит горутину в список ждущих, потом отпускает c.L и паркует её; после Signal или Broadcast он снова берёт c.L и только тогда возвращается. Раз регистрация идёт до разблокировки, Signal, отправленный сразу после неё, не теряется.",
      "Signal и Broadcast не требуют блокировки, а изменение условия требует: меняй состояние под c.L, потом сигналь. Cond не помнит событий: Signal без ждущих ничего не делает. Поэтому ждущий проверяет состояние, а не то, пришёл ли сигнал.",
      "Signal — когда изменением может воспользоваться ровно один ждущий, например один новый элемент. Broadcast — когда изменение важно всем: закрытие, остановка, или когда ждущие ждут разного: с одним Cond на «не пусто» и «не полно» Signal может разбудить горутину, которая не может продолжить, а нужная так и спит.",
      "Ограничения: Wait не бывает веткой select и не принимает context. Для отмены ставь флаг closed под блокировкой и вызывай Broadcast; context.AfterFunc (Go 1.21) может сделать это, когда ctx отменён, но колбэк должен взять c.L перед Broadcast, иначе пробуждение может потеряться, — так и сделано в примере пакета context. Cond нельзя копировать после первого использования; go vet находит копии.",
      "Каналы покрывают большинство случаев: закрытие канала — одноразовый Broadcast, а отправка — Signal со значением. Cond уместен, когда много горутин ждут состояния, которое меняется снова и снова, — ограниченная очередь, пул ресурсов, готовность пачки, — и это состояние уже живёт под мьютексом. Документация sync сама советует каналы для простых случаев."
    ],
    "practicalRU": "Шаблон: c.L.Lock(); for !условие { c.Wait() }; работа; c.L.Unlock(). Состояние меняй под той же блокировкой и только потом зови Signal или Broadcast. Прежде чем брать Cond, проверь, не хватит ли канала: закрытие канала — одноразовый Broadcast, отправка — Signal со значением. Остановку делай флагом closed и Broadcast, иначе ждущие горутины утекут.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Queue struct {\n\tmu    sync.Mutex\n\tcond  *sync.Cond\n\titems []int\n}\n\nfunc NewQueue() *Queue {\n\tq := &Queue{}\n\tq.cond = sync.NewCond(&q.mu)\n\treturn q\n}\n\nfunc (q *Queue) Put(v int) {\n\tq.mu.Lock()\n\tq.items = append(q.items, v)\n\tq.mu.Unlock()\n\tq.cond.Signal() // one new item: wake one waiter\n}\n\nfunc (q *Queue) Get() int {\n\tq.mu.Lock()\n\tdefer q.mu.Unlock()\n\tfor len(q.items) == 0 { // a loop, not an if\n\t\tq.cond.Wait() // unlocks, sleeps, locks again\n\t}\n\tv := q.items[0]\n\tq.items = q.items[1:]\n\treturn v\n}\n\nfunc main() {\n\tq := NewQueue()\n\tsums := make([]int, 3)\n\tvar wg sync.WaitGroup\n\tfor i := range 3 {\n\t\twg.Add(1)\n\t\tgo func() { defer wg.Done(); sums[i] = q.Get() + q.Get() }()\n\t}\n\tfor v := 1; v <= 6; v++ {\n\t\tq.Put(v)\n\t}\n\twg.Wait()\n\tfmt.Println(sums[0] + sums[1] + sums[2]) // 21\n}",
    "versionNote": "sync.Cond по смыслу не менялся с Go 1.0; context.AfterFunc — с Go 1.21. Пример выполнен на Go 1.24.7 и 1.27.3, в том числе с -race и go vet; for range по числу требует Go 1.22+.",
    "sources": [
      {
        "title": "sync.Cond — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#Cond"
      },
      {
        "title": "sync/cond.go — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/sync/cond.go"
      },
      {
        "title": "context: ExampleAfterFunc_cond — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/context/example_test.go#L127"
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 3: Cond",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
      }
    ],
    "quizIds": [
      "q46",
      "q47"
    ],
    "practice": {
      "kind": "Код-ревью Cond",
      "promptEN": "In a teammate's queue, Get waits with if len(q.items) == 0 { q.cond.Wait() }, and Close sets closed and calls Signal. What breaks with two consumers?",
      "promptRU": "В очереди коллеги Get ждёт так: if len(q.items) == 0 { q.cond.Wait() }, а Close ставит closed и вызывает Signal. Что сломается при двух потребителях?",
      "pointsEN": [
        "if instead of for: a woken consumer may find the queue empty again and read items[0], which panics.",
        "Close with Signal wakes only one waiter; the other sleeps forever, a goroutine leak. Close needs Broadcast.",
        "Fix: for len(q.items) == 0 && !q.closed { q.cond.Wait() }, then return false when the queue is empty and closed."
      ],
      "pointsRU": [
        "if вместо for: разбуженный потребитель может снова найти очередь пустой и прочитать items[0] — паника.",
        "Close с Signal будит только одного ждущего; второй спит вечно — утечка горутины. Close нужен Broadcast.",
        "Исправление: for len(q.items) == 0 && !q.closed { q.cond.Wait() }, потом вернуть false, если очередь пуста и закрыта."
      ],
      "followUpEN": "How would you write this queue with a channel, and what would you gain or lose?",
      "followUpRU": "Как написать эту очередь на канале и что при этом выигрывается и теряется?"
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
    "shortEN": "The stack is each goroutine's own memory for function calls. Values that stay local to a call live in its frame and disappear when the function returns, so allocating there is nearly free. The heap is shared memory for values that must outlive the call or be reachable from elsewhere; the runtime allocator hands it out, and the GC later frees what is no longer used. That is the fundamental difference: the stack cleans up after itself, the heap needs the GC, and every heap allocation brings the next GC cycle closer. Returning a pointer to a local usually moves it to the heap. Measure: -gcflags=-m shows what escapes, and -benchmem counts real allocations.",
    "anchorsEN": [
      "stack: per goroutine, frame dies at return, nearly free",
      "heap: shared, outlives the call, freed by the GC",
      "stack cleans itself up; heap needs GC → next cycle sooner",
      "returned pointer → usually heap",
      "-gcflags=-m: escapes; -benchmem: real allocations"
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
    "shortRU": "Стек — собственная память каждой горутины для вызовов функций. Значения, которые остаются внутри вызова, лежат в его кадре и исчезают при возврате из функции, поэтому выделение там почти бесплатно. Куча — общая память для значений, которые должны пережить вызов или быть доступны откуда-то ещё; её раздаёт аллокатор рантайма, а то, что больше не нужно, потом освобождает GC. В этом принципиальная разница: стек убирает за собой сам, куче нужен GC, и каждое выделение в куче приближает следующий цикл GC. Если вернуть указатель на локальное значение, оно обычно уходит в кучу. Меряют так: -gcflags=-m показывает, что убегает, а -benchmem считает реальные выделения.",
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
    "shortEN": "Escape analysis is how the Go compiler decides, at build time, whether a value can live on the stack or must move to the heap. A value stays on the stack unless it might outlive its function, be reachable from the heap, or be too big for the frame. In practice it escapes when you return its address, store it in a global, or share it with another goroutine by reference. Check it with -gcflags=-m and confirm with -benchmem: since Go 1.25, a make([]T, n) that -m reports as not escaping may still allocate on the heap when it needs more than a small stack buffer, 32 bytes by default.",
    "anchorsEN": [
      "compiler decides at build time: stack or heap",
      "stays unless: outlives · reachable from heap · too big",
      "escapes: return &x · global · shared with a goroutine",
      "check with -gcflags=-m; Go 1.25 make([]T, n) → also -benchmem"
    ],
    "jvmEN": "In Java every object goes to the heap unless the JIT proves otherwise. In Go values live on the stack by default and move to the heap only when the compiler cannot prove that the stack is safe.",
    "detailsEN": [
      "Passing a pointer down is safe for stack storage only if the callee does not retain it beyond that lifetime. Conversely, returning &x from a small helper need not allocate at an inlined call site that consumes x locally. SaveGlobal below deliberately retains a pointer.",
      "Interfaces and closures do not automatically allocate. What matters is whether the concrete operation is known, whether captured data is retained, and what the compiler can prove. A goroutine may extend captured data lifetime, but this is not a rule that every closure goes to the heap.",
      "Dynamic make is version-sensitive. Go 1.25 already has a conditional stack-buffer path for non-escaping slices; Go 1.26 release notes describe further cases. A small runtime capacity can use a stack buffer, while a larger capacity falls back to the heap. In 1.25.1 the buffer holds 32 bytes / element size elements, so elements over 32 bytes get none; -N disables the path, and -d=variablemakethreshold changes the size. Escape of the slice can still require heap storage.",
      "There is no universal 64 KiB rule. In Go 1.26.1 the defaults distinguish explicit stack variables (128 KiB) and implicit allocations (64 KiB); alignment, total-frame constraints and flags also matter. These are implementation limits, not language guarantees.",
      "Inspect the actual caller with go build -gcflags=\"-m=2\", then benchmark with -benchmem and profile. A message about the helper body does not by itself describe an inlined copy. If replacing make with a fixed array, validate bounds and preserve ownership; returning its slice can move the array to the heap."
    ],
    "practicalRU": "В примере ReadLocal использует результат сразу, SaveGlobal передаёт адрес функции, которая удерживает его. Sum проверяет диапазон n и реально читает заполненные байты, поэтому пример не сводится к неиспользуемому buf. Проверяй и маленькие, и большие размеры: «не убегает» у динамического make не означает «никогда не выделяет в куче».",
    "code": "package example\n\nvar Saved *int\n\nfunc makeInt(v int) *int  { return &v }\nfunc retain(p *int)       { Saved = p }\nfunc ReadLocal(v int) int { return *makeInt(v) }\nfunc SaveGlobal(v int)    { retain(&v) }\n\nfunc Sum(n int) (int, bool) {\n\tif n < 0 || n > 1024 {\n\t\treturn 0, false\n\t}\n\tbuf := make([]byte, n)\n\tfor i := range buf {\n\t\tbuf[i] = byte(i)\n\t}\n\tsum := 0\n\tfor _, v := range buf {\n\t\tsum += int(v)\n\t}\n\treturn sum, true\n}",
    "shortRU": "Escape analysis — то, как компилятор Go на этапе сборки решает, может ли значение жить на стеке или должно уйти в кучу. Значение остаётся на стеке, если оно не может пережить свою функцию, стать доступным из кучи или оказаться слишком большим для кадра. На практике оно убегает, когда вы возвращаете его адрес, сохраняете его в глобальной переменной или передаёте другой горутине по ссылке. Проверяйте через -gcflags=-m и подтверждайте через -benchmem: с Go 1.25 make([]T, n), о котором -m пишет, что он не убегает, всё равно может выделить память в куче, если ему нужно больше небольшого буфера на стеке — по умолчанию 32 байта.",
    "jvmRU": "В Java каждый объект попадает в кучу, если JIT не докажет обратное. В Go значения по умолчанию живут на стеке и уходят в кучу, только когда компилятор не может доказать, что стек безопасен.",
    "detailsRU": [
      "Передача указателя вниз совместима со стеком лишь если вызываемая функция не сохраняет его дольше нужного времени жизни. И наоборот, return &x из небольшого помощника не обязательно выделяет память в куче в месте встроенного вызова с локальным использованием. Ниже SaveGlobal намеренно сохраняет указатель.",
      "Интерфейс и замыкание не означают автоматическую аллокацию. Важны известность конкретной операции, удержание захваченных данных и то, что может доказать компилятор. Горутина способна продлить время жизни захваченного значения, но не каждое замыкание обязано жить в куче.",
      "Динамический make зависит от версии. В Go 1.25 уже есть условный путь со стековым буфером для неубегающего среза; release notes Go 1.26 описывают дополнительные случаи. Небольшая динамическая capacity может использовать стек, большая — кучу. В 1.25.1 буфер вмещает 32 байта / размер элемента элементов, поэтому элементам больше 32 байт он не достаётся; -N отключает этот путь, а -d=variablemakethreshold меняет размер. Если срез уходит наружу, хранение в куче всё ещё может понадобиться.",
      "Универсального правила 64 KiB нет. В Go 1.26.1 по умолчанию различаются явные переменные стека (128 KiB) и неявные выделения (64 KiB); влияют также выравнивание, ограничения всего кадра и флаги. Это пределы реализации, а не гарантии языка.",
      "Проверяй реальное место вызова через go build -gcflags=\"-m=2\", затем benchmark с -benchmem и профиль. Сообщение о теле помощника не описывает автоматически его встроенную копию. Заменяя make фиксированным массивом, проверяй границы и владение: возврат среза может перенести массив в кучу."
    ],
    "versionNote": "В исходнике Go 1.17 неконстантный размер в HeapAllocReason исключает стековый make. В тегах 1.25.0 и 1.26.1 файл escape/utils.go одинаков и уже содержит гибридный путь; walkMakeSlice проверяет размер во время выполнения. Это не утверждение, что все оптимизации 1.25 и 1.26 одинаковы. Старые toolchain не запускались. Пакет примера использует синтаксис, совместимый с 1.17.",
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
    "shortEN": "Think of Go's heap allocator as storage on three levels. Each P has its own shelf, the mcache; each size class has a shared stockroom, the mcentral, split into scan and noscan; and behind them is the page warehouse, the mheap. Small objects come in spans: runs of pages cut into equal slots of one size. An allocation takes a free slot from its P's mcache without any lock; when that span is full, the mcache swaps it at the mcentral, which gets fresh spans from the mheap. Objects over 32 KiB get their own span straight from the mheap. Noscan objects have no pointers, so the GC never looks inside them, though it still frees them.",
    "anchorsEN": [
      "shelf (mcache per P) → stockroom (mcentral per size class) → warehouse (mheap)",
      "span = pages cut into equal slots",
      "lock-free slot from mcache; full → swap at mcentral → mheap; > 32 KiB → own span",
      "noscan = no pointers: GC skips the contents"
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
    "shortRU": "Аллокатор кучи Go удобно представить как склад из трёх уровней. У каждого P своя полка — mcache; у каждого класса размера общая кладовая — mcentral, отдельно для scan и noscan; а за ними — склад страниц, mheap. Небольшие объекты выдаются спанами: последовательностями страниц, нарезанными на равные ячейки одного размера. Выделение берёт свободную ячейку с полки mcache своего P без блокировок; когда спан заполнен, mcache меняет его в mcentral, а тот берёт свежие спаны у mheap. Объекты больше 32 КиБ получают отдельный спан прямо у mheap. В noscan-объектах нет указателей, поэтому GC внутрь них не заглядывает, хотя освобождает их.",
    "jvmRU": "Это похоже на TLAB в JVM: каждый поток выделяет из своего буфера без блокировок. Разница в том, что JVM сдвигает указатель в непрерывном буфере и потом уплотняет, а Go раздаёт ячейки фиксированного размера из спанов и никогда не перемещает объекты.",
    "detailsRU": [
      "Страница кучи рантайма — 8 KiB, независимо от размера страницы ОС. mspan описывает непрерывную область из одной или нескольких страниц. Span небольших объектов содержит ячейки одинакового размера; классы округляют запрос вверх, поэтому размер объекта и span — разные величины.",
      "mcache принадлежит P, а не горутине. Свободную ячейку его кешированного span можно выделить без блокировки. Пополнение может потребовать sweep и общие структуры; mcentral управляет наборами partial/full и swept/unswept, а не одним простым spinlock на размер. mheap выдаёт области страниц. Возможны также расходы на обнуление и помощь GC.",
      "Подходящие объекты без указателей размером менее 16 байт могут делить блок 16 байт. Классы небольших объектов доходят до 32 KiB, но при выборе пути нужно учитывать метаданные: общий путь mallocgc использует size ≤ 32768−8. Более крупный запрос идёт по пути large object. Это детали версии, а не публичные границы API.",
      "scan/noscan определяется указателями GC внутри выделенного объекта. Байты за []byte или string указателей не содержат, но дескриптор среза/строки содержит указатель на данные. Массив под []string содержит дескрипторы строк, значит, и указатели. В коде Blob не содержит указателей, а Holder содержит.",
      "noscan означает отсутствие обхода указателей внутри объекта. GC всё ещё отмечает его достижимость, учитывает память и может освободить её, когда объект недостижим. Компактные данные и числовые смещения сокращают сканирование, но не делают весь GC O(1) или нулевым: остаются сериализация, метаданные, удержанная capacity и время жизни."
    ],
    "versionNote": "Числа и внутренние пути приведены для Go 1.26.1 обычной сборки; инструментация и специальные пути могут отличаться. В mcentral Go 1.25.0 уже есть наборы partial/full с состоянием sweep. Стековые оптимизации компилятора и аллокатор кучи — разные уровни; noscan не отменяет достижимость. Пример — компилируемые объявления типов, не тест производительности.",
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
    "shortEN": "Go's GC works in two steps: mark what is still in use, then sweep away the rest. Marking starts from the roots, mainly goroutine stacks and globals, and runs alongside your code between two short stop-the-world pauses. It paints objects in three colours: white is not reached yet, grey is reached but not yet scanned, black is done. When nothing grey is left, everything still white is garbage, including unreachable cycles, and sweeping frees it; a write barrier keeps this correct while your code changes pointers, and new objects start black. Go's GC never moves objects and has no generations, so there is no compaction.",
    "anchorsEN": [
      "two steps: mark what is used, sweep the rest",
      "from the roots; concurrent, two short STW pauses",
      "white: not reached · grey: reached, not scanned · black: done",
      "no grey → white is garbage (cycles too); write barrier; new objects black",
      "non-moving, no generations"
    ],
    "jvmEN": "Unlike G1, HotSpot’s default collector, Go’s GC has no young generation, and unlike any HotSpot collector it never moves objects, so there is no compaction. The trade-off is that Go relies on escape analysis to keep short-lived values off the heap in the first place.",
    "detailsEN": [
      "Roots include live pointers in goroutine stacks, globals and runtime structures outside the heap. A reachable object stays alive even if the application no longer needs it. A cycle with no path from any root can be collected: this is tracing, not reference counting.",
      "In the tri-colour model, white means not yet marked, grey means marked with outgoing pointers still to scan, and black means scanned. Colours describe work, not fields in each object. Root jobs and heap scanning can interleave; scanning a stack temporarily stops that goroutine.",
      "First, STW finishes any pending sweep and prepares marking, including enabling the write barrier. Concurrent marking then traces roots and heap pointers; allocating goroutines may assist. Objects allocated during marking are treated as black. Termination must account for outstanding root jobs and buffered work, not just one empty queue.",
      "A second STW transition finishes marking and prepares sweeping. Sweep reclaims unmarked slots in the background and on allocation paths. Scavenging returns unused physical memory to the OS separately; freeing an object does not promise an immediate RSS drop.",
      "Pauses have no fixed duration guarantee. Cost depends on live data, pointer layout, roots, allocation rate and workload. Green Tea improves marking/scanning locality and CPU scalability; it does not turn this into a moving or generational collector."
    ],
    "practicalRU": "На интервью начни с «GC сохраняет достижимое», затем назови фазы. В примере глобальный root удерживает цикл из двух узлов: после GC чтение даёт 42. После удаления последнего пути от корней цикл можно собрать, но точный момент освобождения и падение RSS не обещаем. Для удержания памяти ищи путь от корня: глобальный кеш, живую горутину, срез. Опора: «нашли → просмотрели → освободили»; отдельно объясни, почему кольцо ссылок само себя не удерживает.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\nvar root *Node\n\nfunc makeCycle() {\n\ta, b := &Node{Value: 7}, &Node{Value: 42}\n\ta.Next, b.Next = b, a\n\troot = a\n}\n\nfunc main() {\n\tmakeCycle()\n\truntime.GC()\n\tfmt.Println(root.Next.Value) // 42: reachable through a global\n\troot = nil\n\truntime.GC() // The cycle is now collectible; no RSS promise.\n}",
    "shortRU": "GC в Go работает в два шага: пометить то, что ещё используется, и вымести остальное. Разметка начинается от корней — в основном от стеков горутин и глобальных переменных — и идёт параллельно с вашим кодом между двумя короткими паузами stop-the-world. Она красит объекты в три цвета: белый — ещё не достигнут, серый — достигнут, но не просканирован, чёрный — готов. Когда серых не осталось, всё, что ещё белое, — мусор, включая недостижимые циклы, и sweep его освобождает; барьер записи сохраняет это верным, пока ваш код меняет указатели, а новые объекты сразу чёрные. GC в Go не перемещает объекты и не делит их на поколения, поэтому уплотнения нет.",
    "jvmRU": "В отличие от G1, сборщика HotSpot по умолчанию, у GC Go нет молодого поколения, а в отличие от любого сборщика HotSpot он никогда не перемещает объекты, поэтому уплотнения нет. Цена — Go полагается на escape analysis, чтобы короткоживущие значения вообще не попадали в кучу.",
    "detailsRU": [
      "Корни включают живые указатели в стеках горутин, глобальных переменных и структурах runtime вне кучи. Достижимый объект удерживается, даже если приложению он уже не нужен. Цикл без пути от корней можно собрать: это обход графа, а не подсчёт ссылок.",
      "В трёхцветной модели белый означает «ещё не отмечен», серый — «отмечен, исходящие указатели ещё нужно просмотреть», чёрный — «просмотрен». Цвета описывают работу, а не поля каждого объекта. Обработка корней и объектов кучи может чередоваться; при сканировании стека соответствующая горутина временно останавливается.",
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
    "shortEN": "Two knobs trade memory for GC CPU: GOGC and GOMEMLIMIT. GOGC says how much the heap may grow between cycles, and GOMEMLIMIT says how much memory you would like to stay under. At the default GOGC=100 the heap goal is about twice the live data, plus stacks and globals, so 200 MiB live means a goal near 400 MiB, and the cycle starts earlier so marking finishes by then. GOMEMLIMIT is a soft limit: near it the GC runs more often, but it cannot prevent OOM, because live data cannot be collected. Latency usually comes from mark assists: a goroutine that allocates during marking and runs out of assist credit does some GC work itself before it gets its memory.",
    "anchorsEN": [
      "GOGC: how much the heap may grow · GOMEMLIMIT: how much to stay under",
      "GOGC 100: goal ≈ 2× live (200 → ~400 MiB); cycle starts earlier",
      "GOMEMLIMIT: soft, no OOM guard",
      "latency: mark assists when assist credit runs out"
    ],
    "jvmEN": "Go has no -Xmx: by default the heap simply grows as needed, and GOMEMLIMIT acts as a soft version of it. There is no catchable OutOfMemoryError either: when memory really runs out, the runtime aborts or the OS kills the process.",
    "detailsEN": [
      "A useful four-stage model is mark setup during STW, concurrent marking, mark termination during STW, then concurrent sweeping. Sweep termination precedes setup. Sweeping reclaims dead slots; returning pages to the OS is separate scavenger work. No fixed pause duration is guaranteed.",
      "Mark assists make allocating goroutines contribute tracing work according to allocation debt. This can add request latency. In Go 1.26.1 the background marking target is about 25% of GOMAXPROCS CPU capacity during marking, not a cap on all GC CPU usage.",
      "For estimates, heap goal = live heap + (live heap + roots) × GOGC / 100. With 100 MiB live and 20 MiB roots, GOGC=100 gives 220 MiB, not 200 MiB. The trigger is earlier than the goal; minimums, pacing and the memory limit affect the actual target.",
      "GOMEMLIMIT accounts for runtime memory as MemStats.Sys − MemStats.HeapReleased. This includes more than the heap but excludes C allocations, manually mmap-ed memory and the executable. It is neither process RSS nor a container limit. The runtime adjusts GC and memory release; it may exceed the budget to preserve progress: when the limit is tight, the GC CPU limiter caps GC at about 50% of CPU instead of letting the program stall.",
      "If reachable data cannot fit, collecting more often cannot remove it. Leave measured headroom for memory outside Go and workload spikes. Even with GOGC=off, a finite memory limit can drive GC. A lower limit can increase collection work rather than solve a leak.",
      "sync.Pool caches short-lived objects of one kind, such as buffers, to cut the allocation rate. It has no size and keeps nothing for sure: at each GC its objects move to a victim cache, and the next GC drops them, so Get may return a new object. Reset an object before Put, never pool connections or anything that needs Close, do not copy a Pool after first use, and measure before and after."
    ],
    "practicalRU": "Сначала сравни память runtime, RSS/память контейнера, живую кучу, скорость аллокаций и GC CPU. Затем найди удержание данных и горячие выделения через профили и trace. Для контейнера 4 GiB значение 3600 MiB может быть лишь стартовой гипотезой после оценки резерва; оно не гарантирует отсутствие OOM. Снижай ненужные выделения и ограничивай кеши/конкурентность. sync.Pool рассматривай только для измеренного переиспользования: он не задаёт предел памяти и не гарантирует сохранение объектов. Опора для памяти: «цель — когда начать — что учитывает бюджет».",
    "code": "// Conceptual estimates, not executable Go or an exact pacer trace.\nheapGoal ≈ liveHeap + (liveHeap + roots) * GOGC / 100\n100 MiB + (100 MiB + 20 MiB) * 100 / 100 = 220 MiB\n// Marking starts before the goal; the limit may lower the goal.\nruntimeMemory = MemStats.Sys - MemStats.HeapReleased\n// runtimeMemory != process RSS != container memory usage",
    "shortRU": "Две настройки меняют память на CPU для GC: GOGC и GOMEMLIMIT. GOGC говорит, насколько куча может вырасти между циклами, а GOMEMLIMIT — под какой объём памяти вы хотите уложиться. При значении по умолчанию GOGC=100 цель кучи примерно вдвое больше живых данных, плюс стеки и глобальные переменные, то есть при 200 МиБ живых цель около 400 МиБ, а цикл начинается раньше, чтобы разметка успела завершиться. GOMEMLIMIT — мягкий лимит: рядом с ним GC работает чаще, но от OOM он не защищает, потому что живые данные не собрать. Задержки обычно дают mark assist: горутина, которая выделяет память во время разметки и исчерпала кредит помощи, сама делает часть работы GC и только потом получает память.",
    "jvmRU": "В Go нет -Xmx: по умолчанию куча просто растёт по мере надобности, а GOMEMLIMIT — его мягкий вариант. Нет и OutOfMemoryError, который можно поймать: когда память действительно кончается, рантайм аварийно завершается или процесс убивает ОС.",
    "detailsRU": [
      "Полезная модель из четырёх этапов: подготовка разметки в STW, конкурентная разметка, завершение разметки в STW и конкурентная очистка. Перед подготовкой завершается предыдущая очистка. Sweep освобождает мёртвые ячейки; возврат страниц ОС — отдельная работа scavenger. Фиксированная длительность паузы не гарантируется.",
      "Mark assist заставляет выделяющую память горутину выполнить часть обхода соразмерно долгу за аллокации. Это может увеличить задержку запроса. В Go 1.26.1 цель фоновой разметки — около 25% CPU-мощности GOMAXPROCS во время marking, а не предел всех затрат GC.",
      "Для оценки: цель кучи = живая куча + (живая куча + корни) × GOGC / 100. При 100 MiB живых данных, 20 MiB корней и GOGC=100 получится 220 MiB, а не 200 MiB. Запуск происходит раньше достижения цели; минимумы, pacer и лимит памяти влияют на фактическую цель.",
      "GOMEMLIMIT учитывает память runtime как MemStats.Sys − MemStats.HeapReleased. Это больше, чем одна куча, но сюда не входят C-аллокации, ручной mmap и исполняемый файл. Это не RSS процесса и не лимит контейнера. Runtime регулирует GC и возврат памяти, но может превысить бюджет ради продолжения работы: при тесном лимите ограничитель CPU для GC держит его примерно на 50% CPU, а не даёт программе встать.",
      "Если достижимые данные не помещаются, более частый GC не сможет их удалить. Нужен измеренный запас для памяти вне Go и всплесков нагрузки. Даже при GOGC=off конечный лимит памяти может запускать GC. Снижение лимита способно увеличить работу сборщика вместо устранения утечки.",
      "sync.Pool кеширует короткоживущие объекты одного вида, например буферы, чтобы реже выделять память. Размера у него нет, и ничего он не хранит наверняка: на каждом GC его объекты переходят в кеш-«жертву» (victim cache), а следующий GC их выбрасывает, поэтому Get может вернуть новый объект. Сбрасывай объект перед Put, не клади в пул соединения и всё, что требует Close, не копируй Pool после первого использования и измеряй до и после."
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
      },
      {
        "title": "sync/pool.go: poolCleanup и victim cache — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/sync/pool.go"
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
    "shortEN": "The hybrid write barrier is code the compiler adds to pointer writes outside the stack. While the GC marks, the barrier keeps the running program from hiding a live object. The danger: your code copies the only pointer to an unmarked object into an already scanned object and overwrites the original, so the GC would free a live object. The barrier shades the old target of the write and, while the current stack is grey, the new one too: a deletion and an insertion barrier combined, hence hybrid. So stack writes need no barrier, and each stack is scanned once.",
    "anchorsEN": [
      "barrier = compiler code on non-stack pointer writes, only during marking",
      "only pointer to an unmarked object → into a scanned one, original overwritten → freed",
      "shade the old target + the new while the stack is grey",
      "own stack: no barrier, scanned once"
    ],
    "jvmEN": "Java’s G1 uses a snapshot-at-the-beginning barrier, which matches only the deletion half of Go’s; it needs no insertion half because it scans thread stacks in a stop-the-world pause, while Go scans stacks concurrently. G1 also needs card marking because it is generational and moves objects; Go’s collector does neither.",
    "detailsEN": [
      "Imagine A is already scanned, B is not yet scanned, and B points to an unmarked C. Moving that link from B to A could make a plain concurrent traversal miss C. The barrier records pointer changes so C remains protected even if the collector has passed A and has not reached B.",
      "The hybrid combines deletion shading of the old target with insertion shading of the new target. On paper, insertion shading is needed only while the current stack is grey. The Go 1.26.1 implementation does not test that stack colour for each store: compiler-generated code records relevant old/new pointers in a write-barrier buffer. Safe cases can be eliminated; shading is not necessarily an immediate scan.",
      "This is not heap-only: storing heap pointers into globals also needs protection. The compiler omits barriers for writes it proves target the current stack frame. A store through a pointer passed to a callee may still get a barrier because that pointer could target the heap. Even writing nil may need the deletion part.",
      "The hybrid design removed the need for an end-of-mark STW rescan of stacks in Go 1.8. Ordinary stack scanning still happens, once per cycle, and objects allocated during marking are born black. Barriers are enabled for marking; phase transitions still need STW. Do not confuse this GC mechanism with atomic operations, locks or a CPU memory fence.",
      "Go 1.26.1 uses a non-generational, non-compacting heap collector: it does not divide collection by object age or relocate live heap objects to pack them together. Goroutine stacks can move. Escape analysis and size classes reduce some costs, but do not prove generations unnecessary or fragmentation impossible."
    ],
    "practicalRU": "Проговори по схеме: «A уже прошли, B ещё нет; переносим B → C в A → C; C нельзя потерять». В Go-коде барьер вставляет компилятор — вручную вызывать runtime не нужно. Пример требует разных ненулевых a и b и исключительного доступа к обоим узлам. Для совместного доступа нужна своя синхронизация. sync.Pool используй после измерений: Get не обязан вернуть прежний объект, содержимое может исчезнуть в любой момент; ускорение в 5–10 раз и переиспользование на том же P не гарантируются.",
    "code": "package example\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\n// Move requires distinct, non-nil nodes and exclusive access.\nfunc Move(a, b *Node) {\n\ta.Next = b.Next\n\tb.Next = nil // Deleting a pointer can also need a GC barrier.\n}\n\n// Compiler-generated barriers protect GC, not concurrent callers.\n// White/grey/black states are a teaching model, not observable here.",
    "shortRU": "Гибридный барьер записи — код, который компилятор добавляет к записи указателей вне стека. Пока GC размечает, барьер не даёт работающей программе спрятать живой объект. Опасность: код копирует единственный указатель на неразмеченный объект в уже просканированный объект и затирает исходный, и GC освободил бы живой объект. Барьер красит старую цель записи и, пока стек текущей горутины серый, ещё и новую: это барьер удаления и барьер вставки вместе, отсюда «гибридный». Поэтому запись в стек барьера не требует, а каждый стек сканируется один раз.",
    "jvmRU": "G1 в Java использует барьер snapshot-at-the-beginning — он совпадает только с deletion-половиной барьера Go; insertion-половина G1 не нужна, потому что стеки потоков он сканирует в паузе stop-the-world, а Go сканирует стеки конкурентно. Ещё G1 нужен card marking, потому что он поколенческий и перемещает объекты; сборщик Go не делает ни того, ни другого.",
    "detailsRU": [
      "Представь: A уже просмотрен, B ещё нет, а B ссылается на неотмеченный C. Если перенести эту связь из B в A, простой конкурентный обход может пропустить C. Барьер учитывает изменения указателей и защищает C, даже если сборщик уже прошёл A, но ещё не дошёл до B.",
      "Гибрид сочетает deletion shading старой цели и insertion shading новой. На бумаге новая цель требует shading, только пока текущий стек серый. Реализация Go 1.26.1 не проверяет цвет стека при каждой записи: сгенерированный компилятором код заносит нужные старые/новые указатели в буфер барьера. Доказанно безопасные случаи можно исключить; shading не означает немедленный обход объекта.",
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
    "shortEN": "A slice is only a view onto data stored in an array, not the data itself. Its structure is a pointer to the array, a length and a capacity, and a string is a pointer and a length over immutable bytes. So s[1:3] copies no elements: it is a new view over the same array, and a change through one slice is visible through the other. append writes in place when the resulting length fits in the capacity, and otherwise copies into a new, larger array, so always use the slice that append returns.",
    "anchorsEN": [
      "slice = a view onto an array, not the data",
      "slice = ptr + len + cap; string = ptr + len",
      "s[1:3]: new view, same array, no copy",
      "result fits in cap → in place, else new array"
    ],
    "jvmEN": "A slice combines ArrayList-style growth with subList- or ByteBuffer-style views over a shared array: two slices can share one array, and append may or may not create a new one, so always use the slice that append returns. Go strings are immutable bytes, usually UTF-8, not UTF-16 as Java’s String API.",
    "detailsEN": [
      "On a 64-bit platform, a slice header has a data pointer, len and cap (three words, usually 24 bytes); a string has a data pointer and byte length (two words, usually 16 bytes). These are not portable language constants. len(string) counts bytes, not Unicode code points.",
      "Assigning b := a copies the slice descriptor. Index writes can affect both views. append returns an updated descriptor: it does not change the len stored in a different slice variable. Draw the descriptors separately from their shared array.",
      "a[:len(a):len(a)] restricts the capacity of that view. Appending at least one element must then use a new array, but index writes before that append still share storage. make plus copy creates independent element storage; pointers or nested slices inside the elements can still share their targets.",
      "In Go 1.25 and 1.26 growslice, a request larger than twice the old capacity uses the requested length as a starting capacity. Otherwise small capacities below 256 double; larger ones use a smooth transition towards 1.25×. Allocation rounding can change the final cap. Go 1.17 used a threshold of 1024 and a different transition. None of these formulas is a language guarantee."
    ],
    "practicalRU": "Опора для памяти: len — что видно; cap — место для append; copy — отдельное хранилище элементов. На интервью сначала предскажи общие записи, затем обсуждай формулу роста. Если итоговый размер известен, можно заранее выделить место; число аллокаций измеряй, а не угадывай по cap.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ta := make([]int, 2, 4)\n\ta[0], a[1] = 1, 2\n\tlimited := a[:len(a):len(a)]\n\tlimited[0] = 9\n\tgrown := append(limited, 3)\n\tgrown[0] = 7\n\tindependent := make([]int, len(a))\n\tcopy(independent, a)\n\tindependent[1] = 8\n\tfmt.Println(a, grown, independent)\n}",
    "shortRU": "Срез — лишь окно на данные, которые лежат в массиве, а не сами данные. Его структура — указатель на массив, длина и ёмкость, а строка — указатель и длина над неизменяемыми байтами. Поэтому s[1:3] не копирует элементы: это новое окно на тот же массив, и изменение через один срез видно через другой. append пишет на месте, когда итоговая длина помещается в ёмкость, а иначе копирует в новый, больший массив, поэтому всегда используй срез, который вернул append.",
    "jvmRU": "Срез сочетает рост как у ArrayList с представлениями над общим массивом, как subList или ByteBuffer: два среза могут делить один массив, а append может создать новый, а может и нет, поэтому всегда используй срез, который вернул append. Строки Go — неизменяемые байты, обычно UTF-8, а не UTF-16, как в API строк Java.",
    "detailsRU": [
      "На 64-битной платформе у заголовка среза указатель, len и cap (три машинных слова, обычно 24 байта); у строки указатель и длина в байтах (два слова, обычно 16 байт). Это не переносимые константы языка. len(string) считает байты, а не Unicode-кодовые точки.",
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
    "shortEN": "A Go map is a hash table. Before Go 1.24 it was an array of 2^B buckets of eight slots, with overflow buckets chained when a bucket filled up. The low bits of the hash chose the bucket, and a one-byte tophash filtered candidates before the keys were compared. Past an average load of 6.5 per bucket the map doubled, and the copying, called evacuation, was spread over later writes.",
    "anchorsEN": [
      "2^B buckets × 8 slots + overflow",
      "low bits → bucket; tophash filters",
      "load > 6.5 → double; gradual evacuation"
    ],
    "jvmEN": "Java’s HashMap also uses buckets, but each bucket is a linked list that becomes a tree once it passes eight entries and the table has at least 64 buckets, and resizing copies everything at once. Go’s old map kept eight entries per bucket inline and grew incrementally.",
    "detailsEN": [
      "In the Go 1.17 implementation, low hash bits select one of 2^B primary buckets. Each bucket has eight tophash bytes, grouped keys and values, and an overflow link. Occupied tophash values encode the high hash byte, adjusted to avoid reserved states; a match still needs key equality.",
      "The growth test combines a load threshold of about 6.5 entries per primary bucket with a minimum-entry condition. Too much load doubles the primary bucket count. Too many overflow buckets without excess load instead triggers same-size growth to reorganize chains.",
      "While growing, oldbuckets retains the old storage. growWork evacuates the relevant old bucket and may advance another. Each evacuation includes its overflow chain, and allocating the new bucket array also costs work. Incremental does not mean every mutation has a fixed time bound.",
      "A map index is not addressable under the language rules, so &m[k] is invalid in both old and new maps. For map[K]Struct, read a value, modify the copy, then assign it back. map[K]*Struct allows pointed-to mutation, but shared access still requires synchronization."
    ],
    "practicalRU": "Опора: загрузка → больше бакетов; overflow → возможно прежний размер. Отделяй историческую реализацию от контракта языка. На обычном интервью сначала объясни обновление значения map, затем детали эвакуации.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\n\nfunc main() {\n\tm := map[string]Counter{\"go\": {N: 1}}\n\tv := m[\"go\"]\n\tv.N++\n\tfmt.Println(m[\"go\"].N)\n\tm[\"go\"] = v\n\tfmt.Println(m[\"go\"].N)\n}",
    "shortRU": "Map в Go — хеш-таблица. До Go 1.24 она была массивом из 2^B бакетов по восемь слотов, и когда бакет заполнялся, к нему цеплялись overflow-бакеты. Младшие биты хеша выбирали бакет, а однобайтовый tophash отсеивал кандидатов до сравнения ключей. При средней загрузке больше 6,5 на бакет map удваивалась, а копирование — эвакуация — растягивалось на последующие записи.",
    "jvmRU": "HashMap в Java тоже использует бакеты, но каждый бакет — связный список, который превращается в дерево, когда в нём больше восьми записей и в таблице не меньше 64 бакетов, а при расширении всё копируется сразу. Старая map в Go хранила восемь записей прямо в бакете и росла постепенно.",
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
    "extraSims": [
      {
        "simId": "sim9",
        "step": 4
      }
    ],
    "qEN": "How do Swiss Tables find a key and grow a Go map?",
    "qRU": "Как Swiss Tables находят ключ и расширяют map в Go?",
    "shortEN": "Since Go 1.24 Go maps are built as Swiss Tables. A map hashes the key; a large map first picks a table from its directory by the top bits. In the table, H1, the high bits, picks a starting group and H2, the low 7 bits, is a fingerprint: a lookup compares H2 with a group’s eight control bytes at once, checks only the matching keys and stops at a group with an empty slot. A table doubles up to 1024 slots, then splits.",
    "anchorsEN": [
      "top bits → a table in the directory",
      "H1 → group, H2 → fingerprint",
      "match 8 control bytes at once; an empty slot ends the search",
      "a table doubles to 1024, then splits"
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
    "shortRU": "С Go 1.24 map в Go устроены как Swiss Tables. Map хеширует ключ; большая map сначала выбирает таблицу из своего каталога по старшим битам. В таблице H1 — старшие биты — выбирает стартовую группу, а H2 — младшие 7 бит — служит отпечатком: поиск сравнивает H2 с восемью управляющими байтами группы сразу, проверяет только совпавшие ключи и останавливается на группе с пустым слотом. Таблица удваивается до 1024 слотов, а потом делится.",
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
    "shortEN": "A Go map's table never shrinks: delete and clear remove entries, so whatever they referenced can be collected, but the table keeps its size. That memory stays until the whole map is dropped, so after a spike you copy the live entries into a new map. Iteration order is unspecified and starts at a random place; an entry added during the loop may or may not be visited.",
    "anchorsEN": [
      "delete / clear free entries, not the table",
      "rebuild the map to shrink it",
      "order unspecified; added during range: maybe"
    ],
    "jvmEN": "Like Java’s HashMap, a Go map never shrinks its table on remove or clear. Unlike HashMap, changing a map from the same goroutine while ranging over it is allowed, with no ConcurrentModificationException; a write from another goroutine during iteration, however, is a fatal error that recover cannot catch.",
    "detailsEN": [
      "Separate three layers: entries, table storage, and process RSS. In Go 1.25/1.26, delete and clear can remove references to payloads while keeping table capacity. Payloads are collectible only if no other references retain them; GC and returning memory to the OS are separate events.",
      "In Swiss tables, deleting from a group with an empty slot can leave empty; otherwise a deleted marker preserves the probe path. Tombstones can be reused or pruned during insertion in Go 1.25 and 1.26, and clear resets them. None of these operations promises table shrinking.",
      "Rebuilding a map can reduce retained table storage after a measured spike. The old map becomes collectible only after all references to it disappear. Copying entries is shallow: pointer values and nested slices may still share payloads. Coordinate replacement with readers and writers; do not rebuild periodically without evidence.",
      "The language does not specify map iteration order; two iterations can still happen to produce the same order. Deleting an entry not yet reached prevents it from being produced. An entry added during iteration may be visited or skipped. Nil maps have zero iterations; sort collected keys when a stable order is required."
    ],
    "practicalRU": "Опора: delete убирает запись; clear очищает общую map; присваивание меняет одну переменную. Перед выводом об утечке спроси, кто ещё держит ссылку. Отработай различие на примере и сравни с удержанием массива в q4.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tm := map[string]int{\"go\": 1}\n\talias := m\n\tm = make(map[string]int)\n\tfmt.Println(len(m), len(alias))\n\tclear(alias)\n\tfmt.Println(len(m), len(alias))\n}",
    "shortRU": "Таблица map в Go никогда не уменьшается: delete и clear удаляют записи, поэтому всё, на что они ссылались, можно собрать, но размер таблицы остаётся прежним. Эта память остаётся, пока не отпустят всю map, поэтому после всплеска живые записи копируют в новую map. Порядок обхода не задан и начинается со случайного места; запись, добавленная во время цикла, может встретиться, а может нет.",
    "jvmRU": "Как HashMap в Java, map в Go не уменьшает таблицу при удалении или clear. В отличие от HashMap, менять map из той же горутины во время range можно, без ConcurrentModificationException; а вот запись из другой горутины во время обхода — фатальная ошибка, которую recover не перехватит.",
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
    "shortEN": "A typed nil inside an interface is not really nil. For example, if a function returns a nil *MyError as error, the caller sees err != nil, and success looks like a failure. An interface value is two words, a type word and a data word, and it is nil only when both are nil; here the type word holds *MyError and only the data word is nil. So return a literal nil when there is no error, not a typed nil pointer.",
    "anchorsEN": [
      "return a nil *MyError as error → err != nil",
      "interface = type word + data word",
      "nil only if both are nil",
      "no error → return literal nil"
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
    "shortRU": "Типизированный nil внутри интерфейса — на самом деле не nil. Например, если функция возвращает nil *MyError как error, вызывающий видит err != nil, и успех выглядит как сбой. Значение интерфейса — два слова, слово типа и слово данных, и оно равно nil, только когда nil оба; здесь в слове типа лежит *MyError, и nil только слово данных. Поэтому, когда ошибки нет, возвращай литерал nil, а не типизированный nil-указатель.",
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
    "shortEN": "Say we have a Counter whose Set method has a pointer receiver, and a Setter interface with Set. Calling the method and satisfying the interface follow different rules: c.Set() compiles on a Counter variable, but var s Setter = c does not. The call works because Go rewrites it to (&c).Set(), which needs an addressable value: an element of map[K]Counter or a function result of type Counter cannot do it, while a *Counter needs no address. The assignment fails because interfaces check method sets: Counter's has only its value-receiver methods, *Counter's has both.",
    "anchorsEN": [
      "c.Set() compiles, var s Setter = c does not",
      "call: (&c).Set() needs an address",
      "map[K]Counter, Counter result: no; *Counter: no address needed",
      "interface: method sets — Counter value methods, *Counter both"
    ],
    "jvmEN": "Java has no value receivers: every method sees the object through a reference. In Go, choosing a value or a pointer receiver decides both whether the method can change the receiver and which interfaces the type satisfies.",
    "detailsEN": [
      "Interface satisfaction uses method sets, not call-site convenience. If Set is declared on *Counter, *Counter implements a Setter interface and Counter does not. Store &c when pointer methods are required; a heap-versus-stack decision is irrelevant to this rule.",
      "For an addressable c, c.Set(2) is shorthand for (&c).Set(2). This is a method-call rule. Elements of map[K]Counter and results of type Counter are not addressable, so the shorthand fails there; elements of map[K]*Counter and results of type *Counter are already pointers and need no address.",
      "A value receiver copies the receiver value; a pointer receiver receives a pointer. Copying a struct with slices, maps or pointers is shallow, so a value receiver does not guarantee isolation from the original data.",
      "For map[K]Counter, read a value, modify the copy and store it back. Alternatively store *Counter when shared mutable identity is intended. Neither choice makes concurrent access safe by itself. Embedding adds promoted methods: a struct that embeds *Counter has Set in the method set of the struct value itself, so Outer{} implements Setter. Start with the plain T/*T rule and check embedded fields separately."
    ],
    "practicalRU": "Два отдельных вопроса: «можно вызвать здесь?» и «реализует ли тип интерфейс?». Не объясняй второй автоматическим взятием адреса из первого. Карту методов восстанови на бумаге: T → value; *T → value + pointer.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\ntype Setter interface{ Set(int) }\n\nfunc (c *Counter) Set(n int) { c.N = n }\n\nvar _ Setter = (*Counter)(nil)\n\nfunc main() {\n\tc := Counter{N: 1}\n\tc.Set(2)\n\tvar s Setter = &c\n\ts.Set(3)\n\tfmt.Println(c.N)\n}",
    "shortRU": "Допустим, у нас есть тип Counter, чей метод Set имеет получатель-указатель, и интерфейс Setter с методом Set. Вызов метода и реализация интерфейса подчиняются разным правилам: c.Set() на переменной типа Counter компилируется, а var s Setter = c — нет. Вызов работает, потому что Go переписывает его в (&c).Set(), а для этого нужно адресуемое значение: элемент map[K]Counter или результат функции типа Counter не подходит, а для *Counter адрес не нужен. Присваивание не проходит, потому что интерфейс проверяет наборы методов: у Counter — только методы с получателем-значением, у *Counter — оба вида.",
    "jvmRU": "В Java получателей-значений нет: каждый метод видит объект через ссылку. В Go выбор между значением и указателем в получателе решает и то, может ли метод менять получателя, и то, какие интерфейсы реализует тип.",
    "detailsRU": [
      "Реализация интерфейса проверяется по набору методов, а не по удобству записи вызова. Если Set объявлен у *Counter, интерфейс Setter реализует *Counter, но не Counter. Когда нужны pointer-методы, сохраняй &c; решение стек/куча к этому правилу не относится.",
      "Для адресуемой c вызов c.Set(2) сокращает (&c).Set(2). Это правило вызова метода. Элементы map[K]Counter и результаты типа Counter неадресуемы, поэтому там такая запись не работает; элементы map[K]*Counter и результаты типа *Counter уже указатели, и адрес им не нужен.",
      "Value-ресивер копирует значение ресивера; pointer-ресивер получает указатель. Копия структуры со срезами, map или указателями поверхностная, поэтому value-ресивер не гарантирует изоляции от исходных данных.",
      "Для map[K]Counter нужно прочитать значение, изменить копию и сохранить обратно. Можно хранить *Counter, если нужна общая изменяемая сущность. Ни один вариант сам по себе не делает конкурентный доступ безопасным. Встраивание добавляет продвигаемые методы: у структуры, которая встраивает *Counter, Set есть в наборе методов самого значения структуры, поэтому Outer{} реализует Setter. Начни с простого правила T/*T, а встроенные поля проверяй отдельно."
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
    "shortEN": "defer schedules a call for when the surrounding function returns or panics. So cleanup, such as closing a file or unlocking a mutex, sits right next to the code that needs it. Deferred calls run in last-in, first-out order, and their arguments are evaluated at the defer statement. They run after the results are set, so a deferred closure can still change a named result. A panic unwinds the stack and runs those deferred calls; recover stops it only when called directly in a deferred function of the panicking goroutine, and an unrecovered panic in any goroutine crashes the program.",
    "anchorsEN": [
      "run at exit, LIFO; args evaluated at defer",
      "after results are set → named result can change",
      "recover: directly in defer, same goroutine"
    ],
    "jvmEN": "defer is like finally or try-with-resources, but it is per function, not per block, so a defer inside a loop runs only when the function returns. recover is like catch, but it works only in a deferred function and only for its own goroutine; an uncaught panic in any goroutine kills the whole process.",
    "detailsEN": [
      "Passing x as an argument to a deferred call saves its current value. A deferred closure can instead read or modify an outer variable later. Named result parameters are variables, so a deferred closure can change the result after return expressions have been evaluated and assigned.",
      "Deferred calls belong to the function invocation, not to an iteration of a loop. For per-item resources, use a helper function with its own defer or explicitly release each resource. The immediate problem is lifetime, even if a particular compiler avoids an allocation.",
      "Recovery stops the panic only within the goroutine that is unwinding. The function that deferred the recovering call runs its remaining deferred calls and returns to its caller; execution does not resume at the panicking statement. An ordinary helper called by a deferred function cannot recover on that deferred function’s behalf.",
      "The compiler may use open-coded defers or runtime defer records on the stack or heap. Go 1.26.1 considers the number of defers, escape information, return sites, instrumentation and build options. A short function is not an unconditional promise of open coding, zero allocations or nanosecond overhead.",
      "An unrecovered panic terminates the program. os.Exit skips deferred calls; fatal runtime failures are not ordinary recoverable panics. For expected failures, return errors. Recovering at a deliberate boundary must not silently turn failure into success."
    ],
    "practicalRU": "Опора: «сейчас сохранить аргументы → при return присвоить результат → выполнить defer в обратном порядке → вернуть результат». Сначала объясни эту цепочку без регистров; машинный код проверяй только для конкретной сборки.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc f() (n int) {\n\tn = 1\n\tdefer fmt.Println(\"arg\", n)\n\tdefer func() {\n\t\tn++\n\t\tfmt.Println(\"closure\", n)\n\t}()\n\treturn 2\n}\n\nfunc main() { fmt.Println(\"result\", f()) }",
    "shortRU": "defer откладывает вызов до момента, когда окружающая функция вернётся или запаникует. Поэтому очистка — закрыть файл, отпустить мьютекс — стоит рядом с кодом, которому она нужна. Отложенные вызовы выполняются в порядке «последний пришёл — первый ушёл», а их аргументы вычисляются в момент defer. Они идут после того, как заданы результаты, поэтому отложенное замыкание ещё может изменить именованный результат. Паника раскручивает стек и выполняет эти отложенные вызовы; recover останавливает её, только если вызван напрямую в отложенной функции паникующей горутины, а непойманная паника в любой горутине роняет программу.",
    "jvmRU": "defer похож на finally или try-with-resources, но действует на функцию, а не на блок, поэтому defer внутри цикла выполнится только при выходе из функции. recover похож на catch, но работает только в отложенной функции и только для своей горутины; непойманная паника в любой горутине убивает весь процесс.",
    "detailsRU": [
      "Передача x аргументом отложенного вызова сохраняет его текущее значение. Отложенное замыкание может вместо этого позже читать или менять внешнюю переменную. Именованные результаты — переменные, поэтому замыкание может изменить результат после вычисления и присваивания выражений return.",
      "Отложенный вызов относится к вызову функции, а не к итерации цикла. Для ресурса на одну итерацию используй вспомогательную функцию со своим defer или явное освобождение. Первая проблема — время жизни, даже если компилятор избежал аллокации.",
      "Recover останавливает panic только в раскручиваемой горутине. Функция, отложившая вызов с recover, выполняет оставшиеся defer и возвращается к вызывающему; выполнение не продолжается со строки panic. Обычный helper, вызванный отложенной функцией, не может выполнить recover вместо неё.",
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
    "shortEN": "These are three newer tools for objects you do not want to keep alive or duplicate. Use weak.Pointer to observe an object without keeping it alive, unique.Make to get one canonical handle per distinct value, and runtime.AddCleanup to run a function some time after an object becomes unreachable. They serve different needs: weak caches, cheap equality of repeated values, and a fallback for cleanup. None replaces an explicit Close, because a cleanup may run late or never.",
    "anchorsEN": [
      "weak: observe · unique: one handle · cleanup: after unreachable",
      "caches, cheap equality, fallback",
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
    "shortRU": "Это три новых инструмента для объектов, которые не хочется удерживать или дублировать. weak.Pointer — чтобы смотреть на объект, не удерживая его, unique.Make — чтобы получить один канонический дескриптор на каждое различное значение, runtime.AddCleanup — чтобы запустить функцию через какое-то время после того, как объект стал недостижим. Задачи у них разные: слабые кеши, дешёвое сравнение повторяющихся значений и страховка для очистки. Ни один не заменяет явный Close, потому что очистка может выполниться поздно или никогда.",
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
    "shortEN": "Since Go 1.23 you can range over functions, which is how custom iterators work. A push iterator, iter.Seq, calls yield for each value; range passes the loop body as yield, and when the loop breaks, yield returns false and the iterator must stop. iter.Pull turns it into next and stop, for when you need values one at a time, for example to merge two sequences. If you quit before next reports the end, call stop, usually with defer, or the iterator’s goroutine leaks.",
    "anchorsEN": [
      "iter.Seq calls yield; false → stop",
      "iter.Pull → next, stop",
      "quit early → defer stop()"
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
    "shortRU": "С Go 1.23 range умеет обходить функции — так работают собственные итераторы. Push-итератор, iter.Seq, вызывает yield для каждого значения; range передаёт тело цикла как yield, а когда цикл прерывается, yield возвращает false, и итератор должен остановиться. iter.Pull превращает его в next и stop — когда значения нужны по одному, например чтобы слить две последовательности. Если бросаешь раньше, чем next сообщит о конце, вызови stop, обычно через defer, иначе горутина итератора утечёт.",
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
    "shortEN": "All three became standard in Go 1.25, and each guarantees something narrower than it sounds. On Linux, with go 1.25 or later in the main module's go.mod, the default GOMAXPROCS is the number of CPUs the process may use (its affinity mask), capped at the cgroup CPU limit rounded up. The limit alone never pushes it below 2, and an explicit setting stops automatic updates. synctest’s fake time moves only when every goroutine in the bubble is durably blocked, not on mutexes or I/O. FlightRecorder keeps roughly the last seconds of trace in memory, to save on demand.",
    "anchorsEN": [
      "default: CPUs allowed by affinity, capped at the rounded-up cgroup limit",
      "the limit alone never below 2; an explicit setting stops updates",
      "synctest: time moves when all durably blocked",
      "FlightRecorder: a rolling window, saved on demand"
    ],
    "jvmEN": "The JVM has been container-aware since Java 10, and Java Flight Recorder is the closest analogue to FlightRecorder. For synctest, the closest analogue for a Kotlin developer is runTest from kotlinx-coroutines-test, whose virtual time skips delays; in plain Java you inject a fake Clock.",
    "detailsEN": [
      "Default GOMAXPROCS considers logical CPUs, process affinity and, on Linux, cgroup CPU bandwidth quota. Quota is CPU limit, not CPU request or the number of OS threads. Fractional quota rounds up; the runtime normally keeps at least 2 unless CPU count or affinity is below 2. Defaults and periodic updates depend on GODEBUG and the main module’s language version.",
      "A positive GOMAXPROCS environment value or a GOMAXPROCS(n>0) call selects a manual setting and disables automatic updates. GOMAXPROCS(0) only queries. SetDefaultGOMAXPROCS restores the runtime default and automatic behavior while still respecting GODEBUG. Updating the toolchain alone does not necessarily change an older module’s defaults.",
      "synctest.Test runs a self-contained bubble with fake time. Time advances when all its goroutines are durably blocked; Wait waits for the other goroutines to reach that state. Bubble channels, timers and supported waits matter. Mutex/RWMutex locking, real I/O and syscalls are not durable blocking under this contract. Synctest does not prove correctness or remove every source of flakiness.",
      "FlightRecorder must be started, checked for errors and eventually stopped. WriteTo snapshots recorded trace data and can fail; only one WriteTo may run at a time. Serialize application snapshot requests or handle that error. Tracing overhead depends on workload, so measure it.",
      "MinAge is a retention target rather than “exactly the last N seconds”. MaxBytes takes precedence, is a sizing hint and does not strictly cap snapshot size or total memory overhead. New recordings cannot contain history from before Start. Handle writer/close errors and avoid uncontrolled repeated dumps."
    ],
    "practicalRU": "Не учи три API одной фразой. Спроси отдельно: «кто выбирает параллелизм?», «почему движется тестовое время?», «какую историю успели записать?». Пример проверяет дедлайн искусственным временем; это не ожидание реальной секунды.",
    "code": "package apis\n\nimport (\n\t\"context\"\n\t\"testing\"\n\t\"testing/synctest\"\n\t\"time\"\n)\n\nfunc TestDeadline(t *testing.T) {\n\tsynctest.Test(t, func(t *testing.T) {\n\t\tctx, cancel := context.WithTimeout(context.Background(), time.Second)\n\t\tdefer cancel()\n\t\tif ctx.Err() != nil {\n\t\t\tt.Fatal(\"deadline fired early\")\n\t\t}\n\t\ttime.Sleep(time.Second)\n\t\tsynctest.Wait()\n\t\tif ctx.Err() != context.DeadlineExceeded {\n\t\t\tt.Fatalf(\"got %v\", ctx.Err())\n\t\t}\n\t})\n}",
    "shortRU": "Все три стали стандартными в Go 1.25, и каждый гарантирует меньше, чем кажется по названию. В Linux, если в go.mod главного модуля указано go 1.25 или новее, GOMAXPROCS по умолчанию — число CPU, которые процессу разрешено использовать (маска affinity), но не больше округлённого вверх лимита CPU cgroup. Сам лимит никогда не опускает его ниже 2, а явная настройка отключает автообновления. Поддельное время synctest идёт, только когда все горутины пузыря устойчиво заблокированы, — не на мьютексах и вводе-выводе. FlightRecorder держит в памяти примерно последние секунды трассы, чтобы сохранить их по запросу.",
    "jvmRU": "JVM учитывает контейнер с Java 10, а ближайший аналог FlightRecorder — Java Flight Recorder. Для synctest ближе всего для разработчика на Kotlin runTest из kotlinx-coroutines-test: его виртуальное время пропускает задержки; в чистой Java подставляют поддельный Clock.",
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
    "shortEN": "In Go an error is a value that travels up the call stack, and each layer adds context to it. You wrap it with fmt.Errorf(\"load user: %w\", err): the message gets the context, and the original error stays inside. Higher up, errors.Is asks whether this is a known error, such as ErrNotFound, even when it is wrapped. errors.As asks whether there is an error of a given type inside, such as *QueryError, and hands you the first match so you can read its fields. errors.Join (Go 1.20) combines several errors into one that Is and As can still search.",
    "anchorsEN": [
      "error = a value going up; each layer adds context",
      "fmt.Errorf(\"…: %w\", err): context + cause inside",
      "errors.Is: a known error (ErrNotFound), even wrapped?",
      "errors.As: an error of this type (*QueryError)? → read fields",
      "errors.Join (1.20): several in one, still searchable"
    ],
    "jvmEN": "Unlike Java exceptions, Go errors are ordinary return values: no stack unwinding, no checked exceptions and, by default, no stack trace. Wrapping with %w is like passing a cause to an exception’s constructor, errors.Is and errors.As are like walking getCause() with equals or instanceof, and errors.Join is roughly addSuppressed.",
    "shortRU": "В Go ошибка — это значение, которое поднимается по стеку вызовов, и каждый слой добавляет к ней контекст. Её оборачивают через fmt.Errorf(\"load user: %w\", err): в сообщении появляется контекст, а исходная ошибка остаётся внутри. Выше по стеку errors.Is спрашивает, известная ли это ошибка, например ErrNotFound, даже если она обёрнута. errors.As спрашивает, есть ли внутри ошибка нужного типа, например *QueryError, и отдаёт первую найденную, чтобы прочитать её поля. errors.Join (Go 1.20) объединяет несколько ошибок в одну, в которой Is и As по-прежнему умеют искать.",
    "jvmRU": "В отличие от исключений Java, ошибки Go — обычные возвращаемые значения: без раскрутки стека, без checked-исключений и по умолчанию без stack trace. Обёртка через %w похожа на передачу cause в конструктор исключения, errors.Is и errors.As — на проход по getCause() с equals или instanceof, а errors.Join — примерно addSuppressed.",
    "detailsEN": [
      "Sentinel or typed? A sentinel (var ErrNotFound = errors.New(\"not found\")) names a condition the caller branches on. A typed error, a struct that implements error, carries data such as a field name or a status code. Compare with errors.Is and errors.As rather than == or a type assertion, because those see only the outermost error. A match is not only equality: an error with an Is(target error) bool method can report that it matches ErrNotFound without wrapping it. Go 1.26 adds a generic form, qe, ok := errors.AsType[*QueryError](err).",
      "%w versus %v: with %w the new error has an Unwrap method that returns the original, so Is and As can reach it. With %v the original is only formatted into the text; the chain is cut and errors.Is returns false. Wrapping makes the inner error part of your API, so wrap on purpose.",
      "Add context once per layer, as \"operation subject: cause\" (\"load user 7: …\"). Handle an error once: log it or return it, not both, otherwise one failure is reported several times.",
      "errors.Join returns nil when every argument is nil; otherwise its message joins the messages with newlines and its Unwrap returns []error. errors.Is and errors.As walk that tree depth-first and stop at the first match, so with two *QueryError inside one Join, As returns the first. errors.Unwrap returns nil for it, because errors.Unwrap only calls an Unwrap() error method. fmt.Errorf with several %w verbs (Go 1.20) builds the same kind of multi-error."
    ],
    "detailsRU": [
      "Sentinel или тип? Sentinel (var ErrNotFound = errors.New(\"not found\")) называет условие, по которому вызывающий ветвится. Ошибка-тип — структура, реализующая error, — несёт данные: имя поля, код статуса. Сравнивай через errors.Is и errors.As, а не через == или приведение типа: они видят только внешнюю ошибку. Совпадение — не только равенство: ошибка с методом Is(target error) bool может сообщить, что соответствует ErrNotFound, не оборачивая её. В Go 1.26 появилась обобщённая форма: qe, ok := errors.AsType[*QueryError](err).",
      "%w или %v: с %w у новой ошибки есть метод Unwrap, возвращающий исходную, и Is с As до неё доходят. С %v исходная ошибка только подставляется в текст; цепочка обрывается, и errors.Is возвращает false. Обёртка делает внутреннюю ошибку частью твоего API — оборачивай осознанно.",
      "Добавляй контекст один раз на уровень, в виде «операция объект: причина» («load user 7: …»). Обрабатывай ошибку один раз: либо логируй, либо возвращай, иначе один сбой попадёт в лог несколько раз.",
      "errors.Join возвращает nil, если все аргументы nil; иначе сообщения соединяются переводом строки, а Unwrap возвращает []error. errors.Is и errors.As обходят это дерево в глубину и останавливаются на первом совпадении, поэтому из двух *QueryError внутри одного Join As вернёт первую. errors.Unwrap для неё возвращает nil: он вызывает только метод Unwrap() error. fmt.Errorf с несколькими %w (Go 1.20) создаёт такую же составную ошибку."
    ],
    "practicalRU": "Порядок мысли: кто будет проверять эту ошибку и что ему нужно — условие или данные? Условие — sentinel и errors.Is, данные — тип и errors.As. Контекст — через %w, не %v. Логируй там, где ошибку обрабатывают, а не на каждом уровне.",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"io/fs\"\n\t\"os\"\n)\n\nvar ErrNotFound = errors.New(\"not found\")\n\ntype QueryError struct {\n\tQuery string\n\tErr   error\n}\n\nfunc (e *QueryError) Error() string { return e.Query + \": \" + e.Err.Error() }\nfunc (e *QueryError) Unwrap() error { return e.Err }\n\nfunc main() {\n\terr := fmt.Errorf(\"load user 7: %w\", &QueryError{Query: \"SELECT\", Err: ErrNotFound})\n\tfmt.Println(err)\n\tfmt.Println(errors.Is(err, ErrNotFound))\n\tvar qe *QueryError\n\tfmt.Println(errors.As(err, &qe), qe.Query)\n\n\t_, err = os.Open(\"/no/such/file\")\n\tfmt.Println(errors.Is(err, fs.ErrNotExist))\n\n\tfmt.Printf(\"%q\\n\", errors.Join(errors.New(\"a\"), errors.New(\"b\")).Error())\n}",
    "versionNote": "errors.Is, errors.As, Unwrap и %w — с Go 1.13; errors.Join и несколько %w в одном fmt.Errorf — с Go 1.20; errors.AsType — с Go 1.26. Пример выполнен Go 1.24.7.",
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
    "shortEN": "Every type in Go has a zero value: var n int gives you 0. You get \"\" for strings, false for bools, nil for pointers, slices, maps, channels, funcs and interfaces, and zeroed elements and fields for arrays and structs. Safe: a nil slice works like an empty one for len, range and append, and reading a nil map returns the zero value. Not safe: m[k] = v on a nil map panics, and a nil channel blocks forever on send or receive and panics on close. Good types make the zero value useful: sync.Mutex and strings.Builder work without any setup.",
    "anchorsEN": [
      "var n int = 0; \"\", false; pointer, slice, map, chan, func, interface = nil",
      "safe: nil slice (len, range, append), nil map read",
      "not safe: m[k] = v on a nil map panics",
      "nil channel: send/receive block, close panics",
      "sync.Mutex, strings.Builder: usable at zero"
    ],
    "jvmEN": "In Java a reference field starts as null; in Go many types are usable at their zero value: an empty string instead of null, a ready Mutex or Builder. But writing to a nil map or dereferencing a nil pointer still panics, and Go has no compile-time null safety like Kotlin’s T?: any pointer, slice, map, channel, function or interface may be nil.",
    "shortRU": "У каждого типа в Go есть нулевое значение: var n int даёт 0. У строк нулевое значение — \"\", false у bool, nil у указателей, срезов, map, каналов, функций и интерфейсов, а у массивов и структур обнуляются все элементы и поля. Безопасно: nil-срез работает как пустой для len, range и append, а чтение из nil map возвращает нулевое значение. Небезопасно: m[k] = v в nil map паникует, а nil-канал навсегда блокирует отправку и чтение и паникует при close. Хорошие типы делают нулевое значение полезным: sync.Mutex и strings.Builder работают без настройки.",
    "jvmRU": "В Java поле-ссылка начинается с null; в Go многие типы пригодны в нулевом значении: пустая строка вместо null, готовые Mutex или Builder. Но запись в nil map или разыменование nil-указателя всё равно паникуют, а проверки null на этапе компиляции, как у T? в Kotlin, в Go нет: nil может быть любой указатель, срез, map, канал, функция или интерфейс.",
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
    "shortEN": "A Go string is bytes, not characters. len(s) and s[i] work on bytes, while range decodes UTF-8 and gives each rune, a Unicode code point, with its starting byte index. That is because a string is an immutable sequence of bytes, usually UTF-8. Convert to []rune when you need code points by position, and build strings in a loop with strings.Builder.",
    "anchorsEN": [
      "string = immutable bytes, usually UTF-8",
      "len = bytes; s[i] = a byte",
      "range → runes with byte index",
      "[]rune by position; Builder in loops"
    ],
    "jvmEN": "Java’s String API works in UTF-16: length() counts UTF-16 code units and charAt returns a char. A Go string is bytes: len counts bytes, and code points come from range, []rune or the unicode/utf8 package.",
    "shortRU": "Строка в Go — это байты, а не символы. len(s) и s[i] работают с байтами, а range декодирует UTF-8 и выдаёт руну — кодовую точку Unicode — с индексом её первого байта. Так происходит потому, что строка — неизменяемая последовательность байтов, обычно в UTF-8. []rune нужен, когда кодовые точки требуются по позиции; строку в цикле собирай через strings.Builder.",
    "jvmRU": "API строк Java работает в UTF-16: length() считает кодовые единицы UTF-16, а charAt возвращает char. Строка Go — это байты: len считает байты, а кодовые точки дают range, []rune или пакет unicode/utf8.",
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
    "shortEN": "Both let one piece of code work with many types, but in different ways. Use type parameters when the same algorithm works on many types and the caller's type should come back out, as in Map, Max or Set[T comparable]. Use an interface when different types behave differently behind the same methods and the implementation is chosen at run time, as with io.Reader or a Shape. If one concrete type is enough, use that.",
    "anchorsEN": [
      "type parameters: same algorithm, caller’s type back",
      "interface: different behaviour at run time",
      "Max, Map, Set[T comparable] vs io.Reader",
      "one concrete type is enough? use it"
    ],
    "jvmEN": "Go generics look like Java generics but are not erased: the compiler generates code per GC shape plus a runtime dictionary, so Max[int] works on plain ints, while Java’s List<Integer> boxes because its type arguments must be reference types. And interfaces are satisfied implicitly, without an implements clause.",
    "shortRU": "Оба позволяют одному коду работать со многими типами, но по-разному. Параметры типа — когда один и тот же алгоритм работает для многих типов и вызывающий должен получить свой тип обратно: Map, Max, Set[T comparable]. Интерфейс — когда разные типы ведут себя по-разному за одними методами, а реализация выбирается во время выполнения: io.Reader, Shape. Если хватает одного конкретного типа — используй его.",
    "jvmRU": "Дженерики Go похожи на дженерики Java, но не стираются: компилятор генерирует код на каждую GC shape плюс словарь времени выполнения, поэтому Max[int] работает с обычными int, а List<Integer> в Java упаковывает значения, потому что аргументы типа там должны быть ссылочными. А интерфейсы реализуются неявно, без implements.",
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
    "shortEN": "A package is what you import, a module is what you version. import \"example.com/shop/ledger\" names a package: one directory of .go files compiled together, whose import path is the module path from go.mod plus the directory. A module is a versioned set of packages with a go.mod that declares the module path, the Go version and the dependencies. A package under internal/ can be imported only by code in the tree rooted at the parent of internal, and the go command enforces it.",
    "anchorsEN": [
      "import path = module path + directory",
      "package = one directory",
      "module = versioned packages + go.mod",
      "internal/: only the parent’s tree"
    ],
    "jvmEN": "A module is like a Maven artifact with its own coordinates and versions, and a package is like a Java package but tied to one directory. internal/ is a boundary enforced by the go command, close to a package that a JPMS module does not export.",
    "shortRU": "Пакет — то, что импортируют, модуль — то, что версионируют. import \"example.com/shop/ledger\" называет пакет — один каталог .go-файлов, которые компилируются вместе; его путь импорта — путь модуля из go.mod плюс каталог. Модуль — версионируемый набор пакетов с файлом go.mod, где указаны путь модуля, версия Go и зависимости. Пакет внутри internal/ может импортировать только код из дерева, корень которого — родитель internal; это проверяет команда go.",
    "jvmRU": "Модуль похож на артефакт Maven со своими координатами и версиями, а пакет — на пакет Java, но привязан к одному каталогу. internal/ — граница, которую проверяет команда go; это близко к пакету, который модуль JPMS не экспортирует.",
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
        "title": "cmd/go: internal packages",
        "url": "https://pkg.go.dev/cmd/go#hdr-Internal_packages"
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
    "shortEN": "A table-driven test is the usual Go way to check many inputs with one test function. It lists named cases in a slice of structs and runs each with t.Run, so failures name the case and -run can select one. t.Helper marks a helper so failures point at the caller's line. t.Parallel lets subtests run concurrently after the parent's function returns, so give them only per-case data and register shared teardown with t.Cleanup, not defer.",
    "anchorsEN": [
      "cases in a slice, t.Run for each",
      "t.Helper → the caller’s line",
      "t.Parallel: runs after the parent returns",
      "t.Cleanup, not defer"
    ],
    "jvmEN": "Table-driven tests play the role of JUnit 5 @ParameterizedTest, t.Run is like a dynamic or nested test, and t.Cleanup is like @AfterEach registered from inside the test. There are no assertion functions in the standard library: you compare values and call t.Errorf to continue or t.Fatalf to stop.",
    "shortRU": "Табличный тест — привычный в Go способ проверить много входов одной тестовой функцией. Он перечисляет именованные случаи в срезе структур и запускает каждый через t.Run: в ошибке видно имя случая, а -run выбирает один. t.Helper помечает вспомогательную функцию, и ошибка указывает на строку вызывающего. t.Parallel запускает подтесты параллельно после возврата из функции родителя, поэтому им нужны только свои данные, а общий teardown регистрируют через t.Cleanup, а не defer.",
    "jvmRU": "Табличные тесты играют роль @ParameterizedTest из JUnit 5, t.Run похож на динамический или вложенный тест, а t.Cleanup — на @AfterEach, зарегистрированный изнутри теста. Assert-функций в стандартной библиотеке нет: сравниваешь значения сам и вызываешь t.Errorf, чтобы продолжить, или t.Fatalf, чтобы остановиться.",
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
    "shortEN": "In net/http the server does the concurrency for you. It serves each connection in its own goroutine, and the mux picks a handler by method and path. With HTTP/1.x the handler runs in the connection’s goroutine; with HTTP/2 each request gets its own. r.Context() is cancelled when the client disconnects or ServeHTTP returns, so pass it to every database or HTTP call. Set ReadHeaderTimeout, ReadTimeout, WriteTimeout and IdleTimeout explicitly: with all of them zero, the server never times out a slow client.",
    "anchorsEN": [
      "a goroutine per connection (HTTP/2: per request)",
      "mux by method + path",
      "pass r.Context() downstream",
      "set the four timeouts; all zero = none"
    ],
    "jvmEN": "It resembles a servlet container that runs each request on a thread, but Go uses a goroutine per HTTP/1 connection, or per stream in HTTP/2. Cancellation is explicit through r.Context(), whereas a servlet usually notices a disconnect only when a write throws IOException.",
    "shortRU": "В net/http конкурентность берёт на себя сервер. Он обслуживает каждое соединение в своей горутине, а mux выбирает handler по методу и пути. В HTTP/1.x handler выполняется в горутине соединения, в HTTP/2 каждый запрос получает свою. r.Context() отменяется, когда клиент отключился или ServeHTTP вернулся, поэтому его передают в каждый запрос к базе или другому сервису. ReadHeaderTimeout, ReadTimeout, WriteTimeout и IdleTimeout задают явно: если все они нулевые, сервер никогда не оборвёт медленного клиента.",
    "jvmRU": "Похоже на контейнер сервлетов, где каждый запрос выполняется в потоке, но Go использует горутину на соединение HTTP/1 или на stream в HTTP/2. Отмена явная — через r.Context(), а сервлет обычно узнаёт об отключении клиента, только когда запись бросает IOException.",
    "detailsEN": [
      "One goroutine per connection, not per request: with keep-alive, one connection carries requests one after another (HTTP/1.1), and the same goroutine serves them. A panic in a handler is recovered by the server for that connection only; a panic in a goroutine the handler starts crashes the process.",
      "Routing since Go 1.22: patterns like \"GET /accounts/{id}\" match method and path, r.PathValue(\"id\") reads the wildcard, the more specific pattern wins (/accounts/new over /accounts/{id}), and a path that matches with the wrong method gets 405 with an Allow header.",
      "Context: work started for the request must stop when r.Context() is done. Work that must outlive the response needs its own context, for example context.WithoutCancel (Go 1.21) plus a timeout, and an owner that waits for it on shutdown.",
      "Timeouts: ReadHeaderTimeout protects against slow clients that never finish headers (Slowloris); ReadTimeout covers reading the whole request, WriteTimeout the time until the response is written, IdleTimeout the wait between keep-alive requests. http.TimeoutHandler or a context deadline limits one handler; Shutdown(ctx) drains in-flight requests.",
      "Hedged requests: when one backend is slow at the tail, send the same idempotent request to a second replica after a short delay, take the first response and cancel the rest through a shared ctx; it adds load, so cap it. Timeouts exist for different reasons: a saturated system should fail fast instead of queuing, data can go stale, a stuck dependency must not hold resources, and the client may already be gone. Long work should check ctx between steps so cancellation takes effect."
    ],
    "detailsRU": [
      "Горутина на соединение, а не на запрос: с keep-alive одно соединение несёт запросы один за другим (HTTP/1.1), и их обслуживает та же горутина. Panic в handler сервер перехватывает только для этого соединения; panic в горутине, которую handler запустил, роняет процесс.",
      "Маршрутизация с Go 1.22: шаблоны вида \"GET /accounts/{id}\" учитывают метод и путь, r.PathValue(\"id\") читает подстановку, побеждает более конкретный шаблон (/accounts/new раньше /accounts/{id}), а путь, совпавший с другим методом, получает 405 с заголовком Allow.",
      "Контекст: работа, начатая ради запроса, должна остановиться, когда r.Context() завершён. Работе, которая должна пережить ответ, нужен свой контекст — например, context.WithoutCancel (Go 1.21) с таймаутом — и владелец, который дождётся её при остановке.",
      "Таймауты: ReadHeaderTimeout защищает от клиентов, которые никак не дошлют заголовки (Slowloris); ReadTimeout покрывает чтение всего запроса, WriteTimeout — время до записи ответа, IdleTimeout — ожидание следующего запроса keep-alive. http.TimeoutHandler или дедлайн контекста ограничивает один handler; Shutdown(ctx) дожидается запросов в полёте.",
      "Hedged requests (страхующие запросы): если один бэкенд тормозит на хвосте, тот же идемпотентный запрос через короткую паузу отправляют второй реплике, берут первый ответ, а остальные отменяют через общий ctx; это добавляет нагрузку, поэтому её ограничивают. У таймаутов разные причины: перегруженная система должна быстро отказать, а не копить очередь; данные могут устареть; зависшая зависимость не должна держать ресурсы; клиент мог уже уйти. Долгая работа проверяет ctx между шагами, чтобы отмена срабатывала."
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
      },
      {
        "title": "The Tail at Scale (Dean, Barroso, CACM 2013): hedged requests",
        "url": "https://research.google/pubs/pub40801/"
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
    "shortEN": "Keep HTTP out of the domain. The ledger package returns sentinels and typed errors, and one function at the HTTP boundary maps them with errors.Is and errors.As. Validation becomes 400 with the field, not found 404, and a business rule such as insufficient funds 409 or 422. Everything else is 500 with a generic body, and the real error goes to the log, once.",
    "anchorsEN": [
      "domain returns sentinels and typed errors",
      "one mapping function at the HTTP edge",
      "400 + field · 404 · 409/422 · 500",
      "500: generic body, log once"
    ],
    "jvmEN": "It is the same idea as a Spring @ControllerAdvice that maps exception types to status codes. In Go it is one explicit function, often called from an adapter around handlers of type func(w, r) error, so no handler can forget it; it checks the error with errors.Is and errors.As.",
    "shortRU": "HTTP не должен проникать в домен. Пакет ledger возвращает sentinel-ошибки и типизированные ошибки, а одна функция на границе HTTP переводит их через errors.Is и errors.As. Валидация становится 400 с полем, «не найдено» — 404, бизнес-правило вроде нехватки средств — 409 или 422. Всё остальное — 500 с общим текстом, а настоящая ошибка — в лог, один раз.",
    "jvmRU": "Та же идея, что @ControllerAdvice в Spring, который сопоставляет типам исключений коды статуса. В Go это одна явная функция, которую часто вызывает адаптер вокруг обработчиков вида func(w, r) error, чтобы ни один обработчик её не забыл; ошибку она проверяет через errors.Is и errors.As.",
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
    "shortEN": "In Go you talk to a database through database/sql, and the main object is *sql.DB. It is a connection pool, not a single connection: get it once from sql.Open at startup, share it, since it is safe for concurrent use, and set limits. Pass the request context to every query with QueryContext and ExecContext. Leaks come from objects that hold a connection: a Rows holds one until it is closed, so after checking the query error, defer rows.Close() and check rows.Err() after the loop. A transaction pins one connection: BeginTx(ctx, nil), check the error, defer tx.Rollback(), run every statement on tx, then Commit.",
    "anchorsEN": [
      "sql.Open → *sql.DB = a pool: open once, share, set limits",
      "ctx into every query: QueryContext, ExecContext",
      "check err, then defer rows.Close(); rows.Err()",
      "tx: BeginTx(ctx, nil), defer Rollback, Commit"
    ],
    "jvmEN": "*sql.DB is the pooled DataSource, like HikariCP behind JDBC, not a single Connection. Without try-with-resources, Go relies on defer rows.Close() and defer tx.Rollback(); defer runs at function exit, not at the end of a block, so inside a loop move the body into a helper function.",
    "shortRU": "В Go с базой работают через database/sql, и главный объект — *sql.DB. Это пул соединений, а не одно соединение: его получают один раз через sql.Open при старте, используют везде — он безопасен для одновременного использования — и задают лимиты. Контекст запроса передают в каждое обращение к базе через QueryContext и ExecContext. Утечки возникают из-за объектов, которые держат соединение: Rows держит соединение, пока не вызван rows.Close(), поэтому после проверки ошибки запроса — defer rows.Close(), а после цикла — rows.Err(). Транзакция занимает одно соединение: BeginTx(ctx, nil), проверить ошибку, defer tx.Rollback(), все запросы через tx, в конце Commit.",
    "jvmRU": "*sql.DB — это пул, DataSource вроде HikariCP за JDBC, а не один Connection. Без try-with-resources Go полагается на defer rows.Close() и defer tx.Rollback(); defer срабатывает при выходе из функции, а не в конце блока, поэтому тело цикла выносят во вспомогательную функцию.",
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
    "shortEN": "log/slog is Go's standard structured logger: it writes key-value records that log systems can search. Create one slog.Logger with a JSON handler and a level at startup, add request-scoped attributes such as request_id with With in a middleware, and pass that logger through the request context. Log key-value attributes, not formatted strings. Give sensitive types a LogValue method so they log only safe fields, and log each error once, where it is handled.",
    "anchorsEN": [
      "one slog.Logger: JSON handler, level",
      "With(request_id) in middleware",
      "logger through the request context",
      "LogValue redacts; log errors once"
    ],
    "jvmEN": "slog plays the role of SLF4J with structured arguments, but there is no MDC: Go has no goroutine-local storage, and one request can span many goroutines. So instead of a ThreadLocal you pass a logger, or attributes that a handler reads, through context.Context.",
    "shortRU": "log/slog — стандартный структурный логгер Go: он пишет записи «ключ — значение», по которым системы логов умеют искать. При старте создают один slog.Logger с JSON-обработчиком и уровнем, в middleware добавляют атрибуты запроса вроде request_id через With и передают этот логгер через контекст запроса. Логируют пары ключ-значение, а не отформатированные строки. Чувствительным типам дают метод LogValue, чтобы в лог попадали только безопасные поля, а каждую ошибку логируют один раз — там, где её обрабатывают.",
    "jvmRU": "slog играет роль SLF4J со структурными аргументами, но MDC нет: в Go нет хранилища, привязанного к горутине, а один запрос может идти через много горутин. Поэтому вместо ThreadLocal логгер или атрибуты, которые читает обработчик, передаются через context.Context.",
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
  },
  {
    "id": "c49",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "What do PostgreSQL isolation levels guarantee, and which one do you use for a transfer?",
    "qRU": "Что гарантируют уровни изоляции PostgreSQL и какой выбрать для перевода?",
    "shortEN": "An isolation level decides how much a transaction sees of other transactions' changes. In PostgreSQL's default, Read Committed, two SELECTs in one transaction can return different balances, because each statement gets its own snapshot. Repeatable Read gives the whole transaction one snapshot and fails with SQLSTATE 40001 when it would change or lock a row that another transaction changed and committed after that snapshot; Serializable also catches anomalies such as write skew, with 40001 too. For a transfer, Read Committed with row locks or a guarded UPDATE is enough; at the stricter levels, retry the whole transaction on 40001.",
    "anchorsEN": [
      "Read Committed (default): a snapshot per statement",
      "Repeatable Read: one snapshot; concurrent update → 40001",
      "Serializable: also write skew → 40001",
      "stricter level → retry the whole transaction"
    ],
    "jvmEN": "The levels belong to the database, so they are the same as with JDBC: Connection.setTransactionIsolation there, sql.TxOptions{Isolation: …} in db.BeginTx here. What Spring's @Transactional(isolation = …) plus a retry annotation does for you, Go code does explicitly: a loop that reruns the transaction function on 40001.",
    "shortRU": "Уровень изоляции решает, что транзакция видит из изменений других транзакций. В PostgreSQL на уровне по умолчанию, Read Committed, два SELECT в одной транзакции могут вернуть разные балансы, потому что у каждого запроса свой снимок. Repeatable Read даёт всей транзакции один снимок и падает с SQLSTATE 40001, если она пытается изменить или заблокировать строку, которую другая транзакция изменила и зафиксировала уже после этого снимка; Serializable ловит ещё и аномалии вроде write skew, тоже с 40001. Для перевода хватает Read Committed с блокировкой строк или UPDATE с условием; на строгих уровнях всю транзакцию повторяют при 40001.",
    "jvmRU": "Уровни принадлежат базе, поэтому они те же, что с JDBC: там Connection.setTransactionIsolation, здесь sql.TxOptions{Isolation: …} в db.BeginTx. То, что в Spring делают @Transactional(isolation = …) и аннотация повтора, в Go пишут явно: цикл, который перезапускает функцию транзакции при 40001.",
    "detailsEN": [
      "PostgreSQL implements three distinct levels: Read Uncommitted behaves like Read Committed, so there are no dirty reads at any level. PostgreSQL's Repeatable Read is snapshot isolation and also prevents phantom reads.",
      "In Read Committed, an UPDATE or SELECT … FOR UPDATE that finds a row changed by a concurrent transaction waits for it; if that transaction commits, it re-checks its WHERE clause against the new version of the row. So UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 never overdraws, and RowsAffected = 0 means insufficient funds or no such account.",
      "Lost update: read the balance into Go, compute, then write SET balance = $newValue. Two concurrent transactions both read 100 and both write 80, and one withdrawal disappears. Fix it by computing in SQL, locking with FOR UPDATE, or using Repeatable Read, which turns the second write into a 40001 error.",
      "Write skew: two transactions each read a condition that holds, such as “two doctors are on call”, and each changes a different row, so that together they break it. Repeatable Read allows this; Serializable detects it and fails one of them.",
      "Retry from BEGIN, not a single statement: the snapshot and every read must be redone. Limit the attempts and add backoff. Deadlocks (40P01) are retryable too. With pgx the error is *pgconn.PgError, and its SQLState method returns the code."
    ],
    "detailsRU": [
      "В PostgreSQL реализовано три разных уровня: Read Uncommitted ведёт себя как Read Committed, поэтому «грязного» чтения нет ни на каком уровне. Repeatable Read в PostgreSQL — это snapshot isolation, и фантомного чтения он тоже не допускает.",
      "В Read Committed запрос UPDATE или SELECT … FOR UPDATE, найдя строку, изменённую конкурентной транзакцией, ждёт её; если та зафиксировалась, он заново проверяет своё условие WHERE на новой версии строки. Поэтому UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 никогда не уведёт баланс в минус, а RowsAffected = 0 означает нехватку средств или отсутствие счёта.",
      "Потерянное обновление: прочитать баланс в Go, посчитать и записать SET balance = $newValue. Две конкурентные транзакции обе читают 100 и обе пишут 80 — одно списание пропадает. Исправление: считать в SQL, блокировать через FOR UPDATE или взять Repeatable Read, при котором вторая запись получит ошибку 40001.",
      "Write skew: две транзакции читают условие, которое выполняется, например «дежурят два врача», и каждая меняет свою строку, так что вместе они его нарушают. Repeatable Read это пропускает; Serializable обнаруживает и роняет одну из них.",
      "Повторяют с BEGIN, а не один запрос: снимок и все чтения нужно сделать заново. Число попыток ограничивают и добавляют паузу. Дедлоки (40P01) тоже можно повторять. В pgx ошибка — *pgconn.PgError, а её метод SQLState возвращает код."
    ],
    "practicalRU": "Неделя 6, понедельник: перевод в одной транзакции. Пара к c50: там порядок блокировок, здесь — что видит транзакция и когда её повторять.",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver\n// (for PostgreSQL: github.com/jackc/pgx/v5/stdlib).\npackage store\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"errors\"\n\t\"time\"\n)\n\n// sqlState is implemented by driver errors such as *pgconn.PgError.\ntype sqlState interface{ SQLState() string }\n\n// retryable: serialization failure (40001) or deadlock (40P01).\nfunc retryable(err error) bool {\n\tvar e sqlState\n\treturn errors.As(err, &e) && (e.SQLState() == \"40001\" || e.SQLState() == \"40P01\")\n}\n\n// InTx runs fn in one transaction and reruns it from BEGIN on a retryable error.\nfunc InTx(ctx context.Context, db *sql.DB, iso sql.IsolationLevel, fn func(*sql.Tx) error) error {\n\tfor attempt := 1; ; attempt++ {\n\t\terr := func() error {\n\t\t\ttx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: iso})\n\t\t\tif err != nil {\n\t\t\t\treturn err\n\t\t\t}\n\t\t\tdefer tx.Rollback() // no-op after Commit\n\t\t\tif err := fn(tx); err != nil {\n\t\t\t\treturn err\n\t\t\t}\n\t\t\treturn tx.Commit()\n\t\t}()\n\t\tif err == nil || !retryable(err) || attempt == 3 {\n\t\t\treturn err\n\t\t}\n\t\tselect {\n\t\tcase <-time.After(time.Duration(attempt) * 20 * time.Millisecond):\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\t}\n\t}\n}",
    "versionNote": "Поведение уровней и коды ошибок — документация PostgreSQL 17, глава 13 «Concurrency Control». sql.TxOptions — Go 1.8. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3); для запуска нужен драйвер.",
    "sources": [
      {
        "title": "PostgreSQL: Transaction Isolation",
        "url": "https://www.postgresql.org/docs/current/transaction-iso.html"
      },
      {
        "title": "PostgreSQL: Serialization Failure Handling",
        "url": "https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html"
      },
      {
        "title": "database/sql: TxOptions",
        "url": "https://pkg.go.dev/database/sql#TxOptions"
      }
    ],
    "practice": {
      "kind": "Найди потерянное обновление",
      "promptEN": "Two requests withdraw 20 from a balance of 100 at the same time. Each runs SELECT balance, subtracts in Go and writes UPDATE … SET balance = $1, in Read Committed. What balance can you end up with, and what are two ways to fix it?",
      "promptRU": "Два запроса одновременно списывают 20 с баланса 100. Каждый делает SELECT balance, вычитает в Go и пишет UPDATE … SET balance = $1, уровень Read Committed. Какой баланс может получиться и как это исправить двумя способами?",
      "pointsEN": [
        "Both read 100 and both write 80: one withdrawal is lost.",
        "Fix 1: compute in SQL with a guard: SET balance = balance - 20 WHERE id = $1 AND balance >= 20, then check RowsAffected.",
        "Fix 2: read the balance with SELECT … FOR UPDATE, or use Repeatable Read with a retry on 40001."
      ],
      "pointsRU": [
        "Оба читают 100 и оба пишут 80: одно списание потеряно.",
        "Способ 1: считать в SQL с условием: SET balance = balance - 20 WHERE id = $1 AND balance >= 20, затем проверить RowsAffected.",
        "Способ 2: читать баланс через SELECT … FOR UPDATE или взять Repeatable Read с повтором при 40001."
      ],
      "followUpEN": "Why does the guarded UPDATE not overdraw even in Read Committed?",
      "followUpRU": "Почему UPDATE с условием не уводит баланс в минус даже в Read Committed?"
    }
  },
  {
    "id": "c50",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "How do you transfer money between two accounts safely under concurrency, without deadlocks?",
    "qRU": "Как безопасно перевести деньги между двумя счетами при конкурентных запросах и без дедлоков?",
    "shortEN": "A transfer changes two balances, so it needs one transaction that locks both rows in a stable order. It locks them by ascending account ID with SELECT … FOR UPDATE, then checks the balance and updates both rows. Locking in request order can deadlock: A→B holds A and waits for B while B→A holds B and waits for A; PostgreSQL detects the cycle and aborts one transaction with SQLSTATE 40P01. A stable order removes the cycle; still retry 40P01, and keep the transaction short.",
    "anchorsEN": [
      "one transaction; FOR UPDATE on both rows",
      "lock by ascending ID, not request order",
      "request order → cycle → 40P01",
      "check the balance under the lock; keep it short"
    ],
    "jvmEN": "It is the same rule as ordering synchronized blocks or ReentrantLocks by a stable key in Java, and JPA's PESSIMISTIC_WRITE issues the same SELECT … FOR UPDATE. Go has no @Transactional: the function begins, commits and rolls back the transaction itself.",
    "shortRU": "Перевод меняет два баланса, поэтому нужна одна транзакция, которая блокирует обе строки в постоянном порядке. Она блокирует их по возрастанию ID счёта через SELECT … FOR UPDATE, затем проверяет баланс и обновляет обе строки. Блокировка в порядке запроса может дать дедлок: A→B держит A и ждёт B, а B→A держит B и ждёт A; PostgreSQL находит цикл и прерывает одну транзакцию с SQLSTATE 40P01. Постоянный порядок убирает цикл; 40P01 всё равно повторяют, а транзакцию держат короткой.",
    "jvmRU": "Это то же правило, что упорядочивать блоки synchronized или ReentrantLock по постоянному ключу в Java, а PESSIMISTIC_WRITE в JPA выполняет тот же SELECT … FOR UPDATE. @Transactional в Go нет: функция сама начинает, фиксирует и откатывает транзакцию.",
    "detailsEN": [
      "Without explicit locks: the debit is a guarded UPDATE … WHERE id = $1 AND balance >= $2, and RowsAffected = 0 means roll back. Each UPDATE locks its row, so run the two UPDATEs in ascending ID order too: the credit first when the destination ID is lower.",
      "Hold account locks briefly: no HTTP calls or Kafka sends inside a transaction that holds them, because row locks last until COMMIT. The event goes to an outbox table in the same transaction (c52).",
      "In a double-entry ledger the same transaction inserts two entries, a debit and a credit, so the sum of all entries stays zero; a cached balance column is updated in that transaction too.",
      "PostgreSQL waits deadlock_timeout (1 s by default) before checking for a deadlock, so a cycle costs at least that long before one transaction is aborted. Which one is aborted is not predictable.",
      "The same rule holds for Go mutexes: lock per-account mutexes in ID order, and reject from == to up front, because sync.Mutex is not reentrant. The Go runtime reports a deadlock only when every goroutine is blocked; in a server with other live goroutines the two requests just hang."
    ],
    "detailsRU": [
      "Без явных блокировок: списание — UPDATE с условием … WHERE id = $1 AND balance >= $2, а RowsAffected = 0 означает откат. Каждый UPDATE блокирует свою строку, поэтому и эти два UPDATE выполняют по возрастанию ID: зачисление первым, если ID получателя меньше.",
      "Блокировки счетов держат недолго: никаких HTTP-вызовов и отправок в Kafka внутри транзакции, которая их держит, потому что блокировки строк живут до COMMIT. Событие пишут в таблицу outbox в той же транзакции (c52).",
      "В бухгалтерии двойной записи та же транзакция вставляет две проводки, дебет и кредит, и сумма всех проводок остаётся нулевой; кэшированный столбец баланса обновляют в той же транзакции.",
      "PostgreSQL ждёт deadlock_timeout (по умолчанию 1 с), прежде чем искать дедлок, поэтому цикл стоит минимум столько, пока одну транзакцию не прервут. Какую именно — предсказать нельзя.",
      "Для мьютексов Go правило то же: мьютексы счетов берут по возрастанию ID, а from == to отклоняют сразу, потому что sync.Mutex не реентерабелен. Рантайм Go сообщает о дедлоке, только когда заблокированы все горутины; в сервере с другими живыми горутинами два запроса просто зависнут."
    ],
    "practicalRU": "Неделя 6: перевод в одной транзакции и конкурентный тест на 100 переводов. Практикум W6-1 — тот же порядок блокировок на мьютексах; q41 — дедлок при порядке запроса.",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver.\npackage store\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"errors\"\n)\n\nvar (\n\tErrSameAccount       = errors.New(\"same account\")\n\tErrInvalidAmount     = errors.New(\"amount must be positive\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\nfunc Transfer(ctx context.Context, db *sql.DB, from, to, amount int64) error {\n\tif amount <= 0 {\n\t\treturn ErrInvalidAmount // a negative amount would reverse the transfer\n\t}\n\tif from == to {\n\t\treturn ErrSameAccount\n\t}\n\ttx, err := db.BeginTx(ctx, nil) // Read Committed\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer tx.Rollback()\n\n\t// Lock both rows in ascending ID order, whatever the direction of the transfer.\n\tbalance := map[int64]int64{}\n\tfor _, id := range []int64{min(from, to), max(from, to)} {\n\t\tvar b int64\n\t\tif err := tx.QueryRowContext(ctx, `SELECT balance FROM accounts WHERE id = $1 FOR UPDATE`, id).Scan(&b); err != nil {\n\t\t\treturn err\n\t\t}\n\t\tbalance[id] = b\n\t}\n\tif balance[from] < amount {\n\t\treturn ErrInsufficientFunds\n\t}\n\tif _, err := tx.ExecContext(ctx, `UPDATE accounts SET balance = balance - $1 WHERE id = $2`, amount, from); err != nil {\n\t\treturn err\n\t}\n\tif _, err := tx.ExecContext(ctx, `UPDATE accounts SET balance = balance + $1 WHERE id = $2`, amount, to); err != nil {\n\t\treturn err\n\t}\n\treturn tx.Commit() // a 40P01 here or above is retried by the caller (see c49)\n}",
    "versionNote": "Дедлоки, deadlock_timeout и 40P01 — документация PostgreSQL 17 (разделы Deadlocks и Lock Management). min и max — встроенные функции Go 1.21. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3).",
    "sources": [
      {
        "title": "PostgreSQL: Explicit Locking — Deadlocks",
        "url": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
      },
      {
        "title": "PostgreSQL: SELECT — The Locking Clause",
        "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE"
      },
      {
        "title": "PostgreSQL: deadlock_timeout",
        "url": "https://www.postgresql.org/docs/current/runtime-config-locks.html"
      }
    ],
    "practice": {
      "kind": "Найди цикл",
      "promptEN": "Transfer locks the source account first, then the destination. Requests A→B and B→A arrive together. What happens in PostgreSQL, and what happens to the same code with two sync.Mutex in Go?",
      "promptRU": "Transfer блокирует сначала счёт-источник, потом получателя. Одновременно приходят A→B и B→A. Что произойдёт в PostgreSQL и что — с тем же кодом на двух sync.Mutex в Go?",
      "pointsEN": [
        "Each holds one lock and waits for the other: a cycle.",
        "PostgreSQL checks after deadlock_timeout and aborts one transaction with 40P01; the other completes.",
        "In Go both goroutines block forever, and the runtime reports it only if no goroutine can run. Fix: lock in ascending ID order."
      ],
      "pointsRU": [
        "Каждый держит одну блокировку и ждёт другую: цикл.",
        "PostgreSQL проверяет через deadlock_timeout и прерывает одну транзакцию с 40P01; вторая завершается.",
        "В Go обе горутины блокируются навсегда, и рантайм сообщит об этом, только если ни одна горутина не может работать. Исправление: блокировать по возрастанию ID."
      ],
      "followUpEN": "Why keep retrying 40P01 after you have fixed the lock order?",
      "followUpRU": "Зачем повторять при 40P01, если порядок блокировок уже исправлен?"
    }
  },
  {
    "id": "c51",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "How do you make a payment API idempotent?",
    "qRU": "Как сделать платёжный API идемпотентным?",
    "shortEN": "A client may retry a payment request, and money must not move twice. The client sends an Idempotency-Key, and the server stores it with a fingerprint of the request and the response it returned. A repeat with the same key and payload gets the stored response without moving money again; the same key with a different payload is rejected with 422. Claim the key atomically, with INSERT … ON CONFLICT DO NOTHING on a UNIQUE column in the same transaction as the transfer, never by checking first and inserting later.",
    "anchorsEN": [
      "Idempotency-Key + request fingerprint + stored response",
      "same key, same payload → the stored response",
      "same key, other payload → 422",
      "claim atomically: UNIQUE + ON CONFLICT, same tx"
    ],
    "jvmEN": "No framework gives you this in either world: in Spring you would write the same filter or aspect over a table with a unique constraint. The guarantee comes from the database constraint, not from a synchronized block, because several instances of the service run at once.",
    "shortRU": "Клиент может повторить платёжный запрос, а деньги не должны уйти дважды. Клиент присылает Idempotency-Key, а сервер хранит его вместе с отпечатком запроса и ответом, который вернул. Повтор с тем же ключом и тем же телом получает сохранённый ответ, и деньги второй раз не двигаются; тот же ключ с другим телом отклоняется с 422. Ключ занимают атомарно — INSERT … ON CONFLICT DO NOTHING по столбцу с UNIQUE в той же транзакции, что и перевод, — и никогда не «сначала проверить, потом вставить».",
    "jvmRU": "Ни один фреймворк не даёт этого готовым ни там, ни здесь: в Spring пишут такой же фильтр или аспект над таблицей с уникальным ограничением. Гарантию даёт ограничение в базе, а не блок synchronized, потому что одновременно работают несколько экземпляров сервиса.",
    "detailsEN": [
      "Two identical requests at the same moment: the second INSERT waits on the unique index until the first transaction ends. After a commit it sees the conflict in Read Committed and returns the stored response (at Repeatable Read the INSERT fails with 40001 instead); after a rollback it claims the key itself. If the key is committed separately before the work, as a “processing” row, a concurrent repeat gets 409 instead.",
      "Check-then-insert is the classic bug: both requests SELECT, find nothing and both transfer. No data race is involved, so -race stays silent: it is a race condition in the sense of c2 (q40).",
      "Store business outcomes such as “insufficient funds” as the response, so a repeat gets the same answer. Do not store infrastructure failures: roll back, which releases the key, and let the client retry.",
      "Scope keys per client and expire them, for example after 24 hours. The status codes follow the IETF Idempotency-Key draft: missing key 400, reused key with a different payload 422, a repeat while the original is still processing 409. A stored business answer can also be a 409, so the in-progress one carries Retry-After.",
      "Every side effect of the request belongs in that transaction: the ledger entries, the stored response and the outbox event (c52). Otherwise a retry can repeat one effect and not the other."
    ],
    "detailsRU": [
      "Два одинаковых запроса в один момент: второй INSERT ждёт на уникальном индексе, пока не закончится первая транзакция. После commit он в Read Committed видит конфликт и возвращает сохранённый ответ (в Repeatable Read INSERT вместо этого падает с 40001); после rollback занимает ключ сам. Если ключ фиксируют отдельно до работы, строкой «в обработке», конкурентный повтор получает 409.",
      "«Проверить, потом вставить» — классическая ошибка: оба запроса делают SELECT, ничего не находят и оба переводят. Гонки данных тут нет, поэтому -race молчит: это логическая гонка в смысле c2 (q40).",
      "Бизнес-исходы вроде «недостаточно средств» сохраняют как ответ, чтобы повтор получил тот же ответ. Сбои инфраструктуры не сохраняют: откат освобождает ключ, и клиент повторит.",
      "Ключи ограничивают клиентом и удаляют по сроку, например через 24 часа. Коды — по черновику IETF Idempotency-Key: нет ключа — 400, ключ повторно с другим телом — 422, повтор, пока исходный запрос ещё выполняется, — 409. Сохранённый бизнес-ответ тоже может быть 409, поэтому ответ «ещё выполняется» несёт Retry-After.",
      "Все побочные эффекты запроса — в этой транзакции: проводки, сохранённый ответ и событие в outbox (c52). Иначе повтор может повторить один эффект и не повторить другой."
    ],
    "practicalRU": "Неделя 6, вторник: таблица ключей с UNIQUE и сохранённым ответом. Практикум W6-2 — то же в памяти и в HTTP-обработчике; q40 — окно «проверить, потом вставить».",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver.\npackage store\n\nimport (\n\t\"bytes\"\n\t\"context\"\n\t\"database/sql\"\n\t\"errors\"\n)\n\nvar ErrKeyReused = errors.New(\"idempotency key reused with a different request\") // → 422\n\n// Once claims key in the transaction that does the work. A concurrent request with the\n// same key blocks on the unique index until this transaction commits or rolls back.\n// do returns the response to store; an error rolls back and releases the key.\nfunc Once(ctx context.Context, db *sql.DB, key string, fingerprint []byte,\n\tdo func(*sql.Tx) (status int, body []byte, err error)) (int, []byte, error) {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn 0, nil, err\n\t}\n\tdefer tx.Rollback()\n\n\tres, err := tx.ExecContext(ctx,\n\t\t`INSERT INTO idempotency_keys (key, fingerprint) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, key, fingerprint)\n\tif err != nil {\n\t\treturn 0, nil, err\n\t}\n\tif n, err := res.RowsAffected(); err != nil {\n\t\treturn 0, nil, err\n\t} else if n == 0 { // seen before: replay or reject\n\t\tvar stored []byte\n\t\tvar status int\n\t\tvar body []byte\n\t\terr := tx.QueryRowContext(ctx,\n\t\t\t`SELECT fingerprint, status, body FROM idempotency_keys WHERE key = $1`, key).Scan(&stored, &status, &body)\n\t\tif err != nil {\n\t\t\treturn 0, nil, err\n\t\t}\n\t\tif !bytes.Equal(stored, fingerprint) {\n\t\t\treturn 0, nil, ErrKeyReused\n\t\t}\n\t\treturn status, body, nil\n\t}\n\n\tstatus, body, err := do(tx)\n\tif err != nil {\n\t\treturn 0, nil, err\n\t}\n\tif _, err := tx.ExecContext(ctx,\n\t\t`UPDATE idempotency_keys SET status = $2, body = $3 WHERE key = $1`, key, status, body); err != nil {\n\t\treturn 0, nil, err\n\t}\n\treturn status, body, tx.Commit()\n}",
    "versionNote": "Idempotency-Key — черновик IETF (draft-ietf-httpapi-idempotency-key-header, ещё не RFC). ON CONFLICT — PostgreSQL 9.5+. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3).",
    "sources": [
      {
        "title": "IETF draft: The Idempotency-Key HTTP Header Field",
        "url": "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/"
      },
      {
        "title": "PostgreSQL: INSERT — ON CONFLICT",
        "url": "https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT"
      }
    ],
    "practice": {
      "kind": "Закрой окно",
      "promptEN": "A handler runs SELECT 1 FROM idempotency_keys WHERE key = $1; if there is no row, it transfers and then inserts the key. A mobile client retries after a timeout while the first request is still running. What happens?",
      "promptRU": "Обработчик делает SELECT 1 FROM idempotency_keys WHERE key = $1; если строки нет, переводит деньги и потом вставляет ключ. Мобильный клиент повторяет запрос по таймауту, пока первый ещё выполняется. Что произойдёт?",
      "pointsEN": [
        "Both SELECTs find nothing, so both transfer: a double charge.",
        "-race does not help: there is no data race, only a race condition between two requests.",
        "Fix: INSERT … ON CONFLICT DO NOTHING on a UNIQUE key inside the transfer transaction, then check RowsAffected."
      ],
      "pointsRU": [
        "Оба SELECT ничего не находят, и оба запроса переводят: двойное списание.",
        "-race не поможет: гонки данных нет, есть логическая гонка двух запросов.",
        "Исправление: INSERT … ON CONFLICT DO NOTHING по ключу с UNIQUE внутри транзакции перевода и проверка RowsAffected."
      ],
      "followUpEN": "Which response does the retry get if the first request ended with insufficient funds?",
      "followUpRU": "Какой ответ получит повтор, если первый запрос закончился нехваткой средств?"
    }
  },
  {
    "id": "c52",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What is a transactional outbox, and why not publish to Kafka right after commit?",
    "qRU": "Что такое transactional outbox и почему не публиковать в Kafka сразу после commit?",
    "shortEN": "A service often has to save a transfer and tell other services about it, for example through Kafka. Publishing after commit is a dual write: if the process dies between the commit and the send, the transfer stays and the event is lost. Sending before commit is no better, because it can announce a transfer that then rolls back. The outbox writes the event as a row in the same transaction, so both happen or neither does. A relay then publishes unsent rows and marks them sent; that is at-least-once, so consumers deduplicate by event ID.",
    "anchorsEN": [
      "publish after commit = dual write → lost event",
      "event row in the same transaction",
      "relay: unsent → publish → mark sent",
      "at-least-once → dedupe by event ID"
    ],
    "jvmEN": "The pattern is the same as in Spring projects, which often use Debezium or Spring Modulith's event publication registry for it. @TransactionalEventListener(phase = AFTER_COMMIT) is exactly the dual write the outbox avoids: the listener runs after the commit, and its send can still be lost.",
    "shortRU": "Сервису часто нужно и сохранить перевод, и сообщить о нём другим сервисам, например через Kafka. Публикация после commit — это двойная запись: если процесс упадёт между commit и отправкой, перевод останется, а событие потеряется. Отправлять до commit не лучше: можно объявить перевод, который потом откатится. Outbox записывает событие строкой в той же транзакции, поэтому случается либо всё, либо ничего. Затем relay публикует неотправленные строки и помечает их отправленными; это at-least-once, поэтому потребители отсеивают дубликаты по ID события.",
    "jvmRU": "Паттерн тот же, что в проектах на Spring, где для него часто берут Debezium или реестр публикации событий Spring Modulith. @TransactionalEventListener(phase = AFTER_COMMIT) — ровно та двойная запись, которой outbox избегает: слушатель работает после commit, и его отправка всё равно может потеряться.",
    "detailsEN": [
      "If the relay crashes after the send and before marking the row, it publishes the row again. Kafka's idempotent producer does not help here: it removes duplicates of one send retried by the same producer, and the relay's second send is a new record.",
      "Several relays can share the table with SELECT … ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED: each takes rows the others have not locked. The relay's transaction locks only outbox rows, never accounts, so a slow broker does not block transfers. With several relays, events of one account can leave out of order; when that order matters, run one relay or split the relays by account, and send with the account ID as the Kafka key.",
      "Instead of polling, change data capture such as Debezium reads the outbox inserts from the PostgreSQL write-ahead log.",
      "In Go the relay is one goroutine owned by main: it stops on ctx cancellation, backs off after errors, and shutdown waits for it (c12, c22). Delete or archive sent rows, or the table keeps growing.",
      "The outbox row ID is a natural event ID: put it in a message header, so consumers can skip duplicates (c53)."
    ],
    "detailsRU": [
      "Если relay упадёт после отправки и до пометки строки, он опубликует её снова. Идемпотентный продюсер Kafka тут не поможет: он убирает дубликаты одной отправки, которую повторил тот же продюсер, а вторая отправка relay — новая запись.",
      "Несколько relay могут делить таблицу через SELECT … ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED: каждый берёт строки, которые не заблокировали другие. Транзакция relay блокирует только строки outbox и никогда — счета, поэтому медленный брокер не задерживает переводы. При нескольких relay события одного счёта могут уйти не по порядку; если порядок важен, оставляют один relay или делят relay по счетам и отправляют с ID счёта в качестве ключа Kafka.",
      "Вместо опроса таблицы change data capture, например Debezium, читает вставки в outbox из журнала предзаписи PostgreSQL.",
      "В Go relay — одна горутина, которой владеет main: она останавливается по отмене ctx, после ошибок делает паузу, а при остановке сервиса её дожидаются (c12, c22). Отправленные строки удаляют или архивируют, иначе таблица растёт без конца.",
      "ID строки outbox — готовый ID события: его кладут в заголовок сообщения, чтобы потребители отсеивали дубликаты (c53)."
    ],
    "practicalRU": "Неделя 6, среда: outbox и relay-воркер. Практикум W6-3 — relay с ненадёжным брокером и идемпотентный потребитель; q42 — что теряется при публикации после commit.",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver.\npackage outbox\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"strconv\"\n\t\"time\"\n)\n\n// In the transfer transaction, next to the balance updates:\n//\n//\t_, err = tx.ExecContext(ctx,\n//\t\t`INSERT INTO outbox (account_id, type, payload) VALUES ($1, 'TransferCompleted', $2)`, from, payload)\n\ntype Publish func(ctx context.Context, key string, eventID int64, payload []byte) error\n\n// Relay runs in one goroutine owned by main and returns when ctx is cancelled.\nfunc Relay(ctx context.Context, db *sql.DB, publish Publish) error {\n\ttick := time.NewTicker(500 * time.Millisecond)\n\tdefer tick.Stop()\n\tfor {\n\t\t_ = relayBatch(ctx, db, publish) // on error the same rows are retried on the next tick\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase <-tick.C:\n\t\t}\n\t}\n}\n\nfunc relayBatch(ctx context.Context, db *sql.DB, publish Publish) error {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer tx.Rollback()\n\trows, err := tx.QueryContext(ctx, `SELECT id, account_id, payload FROM outbox\n\t\tWHERE sent_at IS NULL ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED`)\n\tif err != nil {\n\t\treturn err\n\t}\n\ttype event struct {\n\t\tid, account int64\n\t\tpayload     []byte\n\t}\n\tvar batch []event\n\tfor rows.Next() {\n\t\tvar e event\n\t\tif err := rows.Scan(&e.id, &e.account, &e.payload); err != nil {\n\t\t\trows.Close()\n\t\t\treturn err\n\t\t}\n\t\tbatch = append(batch, e)\n\t}\n\tif err := rows.Close(); err != nil {\n\t\treturn err\n\t}\n\tif err := rows.Err(); err != nil {\n\t\treturn err\n\t}\n\tfor _, e := range batch {\n\t\t// The account ID is the Kafka key: with a key-hashing partitioner, one account's events go to one partition.\n\t\tif err := publish(ctx, strconv.FormatInt(e.account, 10), e.id, e.payload); err != nil {\n\t\t\treturn err // stop here to keep the order; already published rows are sent again later\n\t\t}\n\t\tif _, err := tx.ExecContext(ctx, `UPDATE outbox SET sent_at = now() WHERE id = $1`, e.id); err != nil {\n\t\t\treturn err\n\t\t}\n\t}\n\treturn tx.Commit()\n}",
    "versionNote": "SKIP LOCKED — PostgreSQL 9.5+; гарантии доставки Kafka — раздел Message Delivery Semantics документации Kafka. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3).",
    "sources": [
      {
        "title": "microservices.io: Transactional outbox",
        "url": "https://microservices.io/patterns/data/transactional-outbox.html"
      },
      {
        "title": "PostgreSQL: SELECT — The Locking Clause (SKIP LOCKED)",
        "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE"
      },
      {
        "title": "Apache Kafka: Message Delivery Semantics",
        "url": "https://kafka.apache.org/documentation/#semantics"
      }
    ],
    "practice": {
      "kind": "Найди потерю",
      "promptEN": "A handler commits the transfer and then calls producer.Send. The pod is killed right after COMMIT. What do the database and the consumers see, and what do you change?",
      "promptRU": "Обработчик фиксирует перевод, а потом вызывает producer.Send. Под убивают сразу после COMMIT. Что видят база и потребители и что ты изменишь?",
      "pointsEN": [
        "The transfer is committed and the event is never sent: consumers never learn about it.",
        "Returning an error so that the client retries without an idempotency key would move the money twice.",
        "Write the event to an outbox table in the same transaction; a relay publishes it at least once."
      ],
      "pointsRU": [
        "Перевод зафиксирован, событие не отправлено: потребители о нём так и не узнают.",
        "Вернуть ошибку, чтобы клиент повторил без ключа идемпотентности, — значит перевести деньги дважды.",
        "Записать событие в таблицу outbox в той же транзакции; relay опубликует его хотя бы один раз."
      ],
      "followUpEN": "Why can the relay publish an event twice, and who must handle that?",
      "followUpRU": "Почему relay может опубликовать событие дважды и кто должен с этим справиться?"
    }
  },
  {
    "id": "c53",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What delivery guarantee does a Kafka consumer give, and how do you handle duplicates and ordering?",
    "qRU": "Какую гарантию доставки даёт потребитель Kafka и как быть с дубликатами и порядком?",
    "shortEN": "A consumer reads partitions and records how far it got in each as an offset. It gives at-least-once if you commit the offset after processing: a crash or a rebalance between the two replays the messages since the last commit, while committing before processing loses them (at-most-once). So make processing idempotent: store each event ID in the same transaction as its effect and skip IDs already seen. Order holds only within a partition: with a key-hashing partitioner, messages with the same key go to the same partition, and each partition is read by one consumer of the group at a time.",
    "anchorsEN": [
      "commit after processing → at-least-once",
      "commit before → at-most-once: loss",
      "dedupe: event ID + effect in one tx",
      "order per partition; key-hashing partitioner: same key → same partition"
    ],
    "jvmEN": "The semantics are Kafka's own and match what you know from the Java consumer, but Go clients differ in defaults. kafka-go's ReadMessage, in a consumer group (GroupID set), commits the offset when it returns the message, before you process it; use FetchMessage and CommitMessages instead. librdkafka, behind confluent-kafka-go, enables the idempotent producer only with enable.idempotence=true, while the Java producer enables it by default.",
    "shortRU": "Потребитель читает партиции и для каждой отмечает, докуда дочитал, через offset. At-least-once получается, если фиксировать offset после обработки: падение или ребалансировка между ними повторит сообщения с последнего commit, а при фиксации до обработки они вместо этого теряются (at-most-once). Поэтому обработку делают идемпотентной: ID каждого события сохраняют в той же транзакции, что и его результат, и пропускают уже виденные ID. Порядок есть только внутри партиции: если partitioner хеширует ключ, сообщения с одним ключом попадают в одну партицию, а каждую партицию в группе одновременно читает один потребитель.",
    "jvmRU": "Семантику задаёт сама Kafka, и она совпадает с тем, что знаешь по потребителю на Java, но у клиентов Go другие значения по умолчанию. ReadMessage в kafka-go при заданном GroupID фиксирует offset, когда возвращает сообщение, — до обработки; вместо него берут FetchMessage и CommitMessages. librdkafka, на которой построен confluent-kafka-go, включает идемпотентного продюсера только с enable.idempotence=true, а продюсер на Java — по умолчанию.",
    "detailsEN": [
      "A consumer group splits a topic's partitions among its members; with more consumers than partitions, some stay idle. When a member joins, leaves or stops responding, the group rebalances, partitions move with their last committed offset, and uncommitted messages are delivered again.",
      "The default partitioners of the Java client, librdkafka and franz-go hash the key; kafka-go's Writer defaults to round-robin, so set Balancer: &kafka.Hash{} (or kafka.Murmur2Balancer for Java compatibility). One account's events then stay in one partition while the partition count stays the same, and in order if retries cannot reorder them (an idempotent producer, or one request in flight).",
      "Retries: on a transient error, retry with backoff while holding the partition, which keeps the order; after N attempts, send the message to a dead-letter topic with the error, so one poison message does not stop the partition.",
      "The idempotent producer removes duplicates caused by its own retries. Kafka transactions with read_committed consumers give exactly-once from topic to topic; when the effect lands in your database, exactly-once in practice means an idempotent consumer.",
      "Auto-commit can commit messages that were fetched but not yet processed, depending on the client. For payments, commit explicitly after the database transaction with the effect has committed."
    ],
    "detailsRU": [
      "Группа потребителей делит партиции топика между участниками; если потребителей больше, чем партиций, часть простаивает. Когда участник входит, выходит или перестаёт отвечать, группа ребалансируется, партиции переходят к другим вместе с последним зафиксированным offset, и незафиксированные сообщения доставляются снова.",
      "Стандартные partitioner'ы клиента Java, librdkafka и franz-go хешируют ключ; Writer в kafka-go по умолчанию раскладывает сообщения по кругу, поэтому задают Balancer: &kafka.Hash{} (или kafka.Murmur2Balancer для совместимости с Java). Тогда события одного счёта остаются в одной партиции, пока не меняется число партиций, и идут по порядку, если повторы не могут их переставить (идемпотентный продюсер или один запрос в полёте).",
      "Повторы: при временной ошибке повторяют с паузой, не отпуская партицию, — так сохраняется порядок; после N попыток сообщение с описанием ошибки отправляют в dead-letter-топик, чтобы одно «ядовитое» сообщение не остановило партицию.",
      "Идемпотентный продюсер убирает дубликаты от собственных повторов. Транзакции Kafka с потребителями read_committed дают exactly-once из топика в топик; когда результат пишется в твою базу, exactly-once на практике означает идемпотентного потребителя.",
      "Автокоммит, в зависимости от клиента, может зафиксировать сообщения, которые уже получены, но ещё не обработаны. Для платежей offset фиксируют явно — после того как зафиксирована транзакция базы с результатом."
    ],
    "practicalRU": "Неделя 6, четверг: потребитель с идемпотентной обработкой. Практикум W6-3 — потребитель отсеивает дубликаты от relay; q43 — offset зафиксирован до обработки.",
    "code": "// Fragment: compiles with database/sql alone; running it needs a driver.\npackage consumer\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n)\n\n// Handle applies one event at most once: the event ID and its effect commit together.\n// The consumer loop commits the Kafka offset only after Handle returns nil\n// (kafka-go: FetchMessage → Handle → CommitMessages; not ReadMessage, which commits on read).\nfunc Handle(ctx context.Context, db *sql.DB, eventID int64, apply func(*sql.Tx) error) error {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer tx.Rollback()\n\tres, err := tx.ExecContext(ctx,\n\t\t`INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING`, eventID)\n\tif err != nil {\n\t\treturn err\n\t}\n\tn, err := res.RowsAffected()\n\tif err != nil {\n\t\treturn err\n\t}\n\tif n == 0 {\n\t\treturn nil // a duplicate: the effect is already there, commit the offset and move on\n\t}\n\tif err := apply(tx); err != nil {\n\t\treturn err\n\t}\n\treturn tx.Commit()\n}",
    "versionNote": "Семантика доставки — документация Apache Kafka (Message Delivery Semantics); enable.idempotence по умолчанию — ProducerConfig клиента Java и CONFIGURATION.md librdkafka; поведение ReadMessage — README и reader.go segmentio/kafka-go. Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3).",
    "sources": [
      {
        "title": "Apache Kafka: Message Delivery Semantics",
        "url": "https://kafka.apache.org/documentation/#semantics"
      },
      {
        "title": "Apache Kafka: producer config enable.idempotence",
        "url": "https://kafka.apache.org/documentation/#producerconfigs_enable.idempotence"
      },
      {
        "title": "segmentio/kafka-go: Explicit Commits",
        "url": "https://github.com/segmentio/kafka-go#explicit-commits"
      },
      {
        "title": "librdkafka: configuration properties",
        "url": "https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md"
      }
    ],
    "practice": {
      "kind": "Раздели гарантии",
      "promptEN": "A consumer built on kafka-go, in a consumer group, calls ReadMessage and then writes the payment to PostgreSQL. The pod restarts in the middle of the write. Is the payment lost, duplicated, or neither, and what do you change?",
      "promptRU": "Потребитель на kafka-go в группе потребителей вызывает ReadMessage и потом пишет платёж в PostgreSQL. Под перезапускается посреди записи. Платёж потерян, задвоен или ни то ни другое — и что ты изменишь?",
      "pointsEN": [
        "ReadMessage already committed the offset, so after the restart that message is skipped: the payment is lost (at-most-once).",
        "Switch to FetchMessage, apply the effect, then CommitMessages: at-least-once.",
        "Duplicates become possible, so store the event ID with the effect in one transaction."
      ],
      "pointsRU": [
        "ReadMessage уже зафиксировал offset, поэтому после перезапуска это сообщение пропущено: платёж потерян (at-most-once).",
        "Перейти на FetchMessage, применить результат, потом CommitMessages: at-least-once.",
        "Появляются дубликаты, поэтому ID события сохраняют вместе с результатом в одной транзакции."
      ],
      "followUpEN": "Why does the message key matter for this consumer?",
      "followUpRU": "Почему для этого потребителя важен ключ сообщения?"
    }
  },
  {
    "id": "c54",
    "mod": "m8",
    "modName": "8. Data Consistency: Transactions, Idempotency, Outbox, Kafka",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you find and fix a slow query: indexes, EXPLAIN ANALYZE and N+1?",
    "qRU": "Как найти и исправить медленный запрос: индексы, EXPLAIN ANALYZE и N+1?",
    "shortEN": "A slow query is diagnosed from its plan, not by guessing. Run EXPLAIN ANALYZE on the real query: it executes the query and shows the plan with actual times and row counts, so a Seq Scan that reads a large table to return a few rows points to a missing index. For one account's history, newest first, a B-tree index on (account_id, created_at) serves both: equality on account_id leaves that account's rows already ordered by created_at. N+1, one query per row of a list, becomes a join or one query with = ANY($1).",
    "anchorsEN": [
      "EXPLAIN ANALYZE: real plan, real times",
      "Seq Scan for a few rows → missing index",
      "(account_id, created_at): equality on the leading column",
      "N+1 → JOIN or = ANY($1)"
    ],
    "jvmEN": "N+1 is the same problem as lazy loading in Hibernate, where touching a collection in a loop fires one query per entity; in Go it is easier to see, because each query is an explicit call inside the loop. The fix is the same: a join, a batch query, or an explicit fetch.",
    "shortRU": "Медленный запрос разбирают по его плану, а не наугад. Запусти EXPLAIN ANALYZE на настоящем запросе: он выполняет запрос и показывает план с фактическим временем и числом строк, поэтому Seq Scan, который читает большую таблицу ради нескольких строк, указывает на недостающий индекс. Для истории одного счёта, от новых к старым, B-tree-индекс по (account_id, created_at) обслуживает и то и другое: при равенстве по account_id строки этого счёта уже упорядочены по created_at. N+1 — запрос на каждую строку списка — заменяют на JOIN или один запрос с = ANY($1).",
    "jvmRU": "N+1 — та же проблема, что ленивая загрузка в Hibernate, где обращение к коллекции в цикле даёт по запросу на сущность; в Go её проще заметить, потому что каждый запрос — явный вызов внутри цикла. Исправление то же: JOIN, пакетный запрос или явная выборка.",
    "detailsEN": [
      "EXPLAIN alone shows estimates; EXPLAIN ANALYZE runs the statement, so wrap an UPDATE or DELETE in BEGIN … ROLLBACK. Compare estimated and actual rows: a large gap usually means stale statistics, which ANALYZE refreshes.",
      "A multicolumn B-tree index is most efficient when the conditions constrain its leading columns. For WHERE account_id = $1 ORDER BY created_at DESC LIMIT 50, the index (account_id, created_at) is scanned backward and returns rows already in order, without a Sort node.",
      "Every index slows down inserts and updates and takes space, so index the queries you actually run. For deep pages, filter by the last row seen, (created_at, id) < ($2, $3), with an index on (account_id, created_at, id), instead of OFFSET: the rows skipped by OFFSET are still computed inside the server, and created_at alone is not unique.",
      "In Go, N+1 is a loop that calls QueryRowContext per item: latency grows with N, and every call takes a pool connection. With pgx, a []int64 argument binds to a bigint[] parameter, so WHERE id = ANY($1) loads all rows in one round trip.",
      "Count queries per request in logs or traces to catch N+1 before production; a test with 100 items makes it obvious."
    ],
    "detailsRU": [
      "EXPLAIN без ANALYZE показывает оценки; EXPLAIN ANALYZE выполняет запрос, поэтому UPDATE или DELETE оборачивают в BEGIN … ROLLBACK. Сравни оценку и фактическое число строк: большой разрыв обычно означает устаревшую статистику, её обновляет ANALYZE.",
      "Составной B-tree-индекс эффективнее всего, когда условия ограничивают его первые столбцы. Для WHERE account_id = $1 ORDER BY created_at DESC LIMIT 50 индекс (account_id, created_at) читается в обратном порядке и отдаёт строки уже отсортированными, без узла Sort.",
      "Каждый индекс замедляет вставки и обновления и занимает место, поэтому индексируют запросы, которые реально выполняются. Для дальних страниц фильтруют по последней увиденной строке, (created_at, id) < ($2, $3), с индексом (account_id, created_at, id), вместо OFFSET: строки, пропущенные OFFSET, сервер всё равно вычисляет, а один created_at не уникален.",
      "В Go N+1 — цикл, который вызывает QueryRowContext на каждый элемент: задержка растёт с N, и каждый вызов занимает соединение пула. В pgx аргумент []int64 передаётся как параметр bigint[], поэтому WHERE id = ANY($1) загружает все строки за один запрос.",
      "Считай запросы на один HTTP-запрос в логах или трассах, чтобы поймать N+1 до продакшена; тест на 100 элементов делает его очевидным."
    ],
    "practicalRU": "Неделя 6, суббота: индексы и EXPLAIN ANALYZE на истории переводов счёта, поиск N+1.",
    "code": "// Fragment: compiles with database/sql alone; = ANY($1) with a []int64 needs pgx (stdlib).\npackage store\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n)\n\n// History of one account, newest first. Served by:\n//\n//\tCREATE INDEX transfers_account_created ON transfers (account_id, created_at);\n//\tEXPLAIN ANALYZE SELECT ... -- expect an Index Scan Backward, no Sort, no Seq Scan\n\n// Names loads owner names for many accounts in one round trip instead of N.\nfunc Names(ctx context.Context, db *sql.DB, ids []int64) (map[int64]string, error) {\n\trows, err := db.QueryContext(ctx, `SELECT account_id, name FROM owners WHERE account_id = ANY($1)`, ids)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer rows.Close()\n\tnames := make(map[int64]string, len(ids))\n\tfor rows.Next() {\n\t\tvar id int64\n\t\tvar name string\n\t\tif err := rows.Scan(&id, &name); err != nil {\n\t\t\treturn nil, err\n\t\t}\n\t\tnames[id] = name\n\t}\n\treturn names, rows.Err()\n}",
    "versionNote": "EXPLAIN, составные индексы, ORDER BY по индексу и OFFSET — документация PostgreSQL 17 (Using EXPLAIN, Multicolumn Indexes, Indexes and ORDER BY, LIMIT and OFFSET). Передача []int64 без обёртки — pgx v5 stdlib (CheckNamedValue пропускает любые значения). Фрагмент компилируется (go vet на Go 1.24.7 и 1.27.3).",
    "sources": [
      {
        "title": "PostgreSQL: Using EXPLAIN",
        "url": "https://www.postgresql.org/docs/current/using-explain.html"
      },
      {
        "title": "PostgreSQL: Multicolumn Indexes",
        "url": "https://www.postgresql.org/docs/current/indexes-multicolumn.html"
      },
      {
        "title": "PostgreSQL: Indexes and ORDER BY",
        "url": "https://www.postgresql.org/docs/current/indexes-ordering.html"
      },
      {
        "title": "PostgreSQL: LIMIT and OFFSET",
        "url": "https://www.postgresql.org/docs/current/queries-limit.html"
      }
    ],
    "practice": {
      "kind": "Посчитай запросы",
      "promptEN": "A handler loads 50 transfers, then calls QueryRowContext for each to get the counterparty's name. The pool has 10 connections. How many round trips does one request make, and what is the fix?",
      "promptRU": "Обработчик загружает 50 переводов, а потом на каждый вызывает QueryRowContext за именем контрагента. В пуле 10 соединений. Сколько обращений к базе делает один запрос и как это исправить?",
      "pointsEN": [
        "51 round trips: 1 for the list and 50 for the names.",
        "Under load, requests compete for 10 connections, so latency grows with traffic as well as with N.",
        "One query: JOIN the names, or a second query with WHERE id = ANY($1) and a map in Go."
      ],
      "pointsRU": [
        "51 обращение: 1 за списком и 50 за именами.",
        "Под нагрузкой запросы делят 10 соединений, поэтому задержка растёт и с трафиком, и с N.",
        "Один запрос: JOIN с именами или второй запрос с WHERE id = ANY($1) и map в Go."
      ],
      "followUpEN": "What does EXPLAIN ANALYZE show for the history query before and after adding the index?",
      "followUpRU": "Что покажет EXPLAIN ANALYZE для запроса истории до и после добавления индекса?"
    }
  },
  // ==========================================
  // МОДУЛЬ 9: АРХИТЕКТУРА GO-СЕРВИСА — РАСКЛАДКА, DI, REST, gRPC, LONG POLLING, КАНАЛЫ, СТЕК (C57 - C64)
  // ==========================================
  {
    "id": "c57",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you lay out a Go service, and which way should dependencies point?",
    "qRU": "Как разложить Go-сервис по пакетам и куда должны смотреть зависимости?",
    "shortEN": "When a Go service outgrows one file, you decide which package holds what and who may import whom. cmd/ledger/main.go stays thin: it reads config, builds dependencies and starts the server. The rest lives under internal/, split by business area: ledger, transfer. The HTTP handler calls the use case, which calls the domain. The use case declares the small interface it needs, say AccountStore, and the PostgreSQL adapter implements it. Dependencies point inward, and the domain imports nothing from the rest of the service: that is hexagonal architecture. This holds only if a linter or test checks imports.",
    "anchorsEN": [
      "cmd/ledger/main.go is thin: config, wiring, start",
      "internal/, by business area: ledger, transfer",
      "handler → use case → domain",
      "the consumer declares the port (AccountStore), the adapter implements it",
      "domain imports nothing from the service; a linter or an import test keeps it"
    ],
    "jvmEN": "A typical Spring project is split by layer into controller, service and repository packages, and the repository interface comes from the persistence side, often a Spring Data JpaRepository. In Go the use case declares the small interface it calls, and the adapter satisfies it implicitly, with no implements clause, so the adapter never imports the use case. Where a Java team adds ArchUnit rules, a Go team checks imports with a linter or a short test.",
    "detailsEN": [
      "Each executable gets cmd/<binary>/main.go; everything else goes under internal/, and the go command rejects importing it from outside the tree rooted at the parent of internal/: \"use of internal package … not allowed\" (c43). The official layout guide has no pkg/ directory. Put a package outside internal/ only when another module really imports it, because its API then becomes a contract with that module.",
      "Name packages after the business, such as ledger and transfer, not after a layer or a kind of file, such as models, services or utils. Inside an area, the transport (net/http or gRPC handlers) decodes the request, calls one use case and maps errors to status codes (c46); the use case runs one business operation; the domain holds types and rules such as Account.Withdraw; adapters talk to PostgreSQL or an external API. Transport and adapters stay thin and hold no business rules.",
      "Direction: transport → use case → domain, and adapter → domain. The use case declares the port, an interface with only the methods it calls; the adapter returns a concrete type such as *postgres.Store, which satisfies the port without importing the use case. Only main sees both and connects them (c58). This is hexagonal architecture, also called ports and adapters; clean architecture draws the same rule as rings.",
      "How it decays: the domain imports the HTTP package for a DTO or a status code, a utils or common package appears that everything imports, the store starts returning HTTP errors. Go rejects import cycles (\"import cycle not allowed\"), so a wrong import often shows up later as a cycle. Keep the rule with depguard in golangci-lint, with go-arch-lint, or with a short test that parses imports with go/parser and fails on anything outside an allowed list.",
      "A small service does not need this hierarchy: one main package, or main and two or three packages, is fine. Add a port when there is a real second implementation or a slow dependency to fake in tests, not in front of every struct."
    ],
    "practicalRU": "Неделя 5, понедельник: раскладка ledger — cmd/ledger, internal/http, internal/ledger, internal/store; деньги в int64 минорных единиц. Пакет internal/http в файлах, где нужен и net/http, придётся импортировать под другим именем, поэтому его часто называют httpapi. В субботу недели 5 — проговор «Walk me through your project structure and why»: назови направление зависимостей, где объявлены интерфейсы и чем это проверяется в CI.",
    "code": "// Fragment of one module, example.com/m9/c57:\n//\n//\tcmd/ledger/main.go      reads config, wires the packages, starts the server\n//\tinternal/httpapi        transport: JSON in and out, errors to status codes\n//\tinternal/transfer       use case and the port it needs\n//\tinternal/ledger         domain: Account, its rules and errors\n//\tinternal/store/memory   adapter; a PostgreSQL adapter would sit next to it\n\n// internal/ledger/account.go: the domain imports nothing from the service.\npackage ledger\n\nvar (\n\tErrAccountNotFound   = errors.New(\"account not found\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\n// Account holds its balance in minor units (cents).\ntype Account struct {\n\tID      string\n\tBalance int64\n}\n\nfunc (a *Account) Withdraw(amount int64) error {\n\tif amount > a.Balance {\n\t\treturn ErrInsufficientFunds\n\t}\n\ta.Balance -= amount\n\treturn nil\n}\n\nfunc (a *Account) Deposit(amount int64) { a.Balance += amount }\n\n// internal/transfer/service.go: the use case declares the port it needs.\npackage transfer\n\nvar (\n\tErrInvalidAmount = errors.New(\"amount must be positive\")\n\tErrSameAccount   = errors.New(\"cannot transfer to the same account\")\n)\n\n// AccountStore is the port this use case needs, declared here by its consumer.\n// Adapters implement it without importing this package.\ntype AccountStore interface {\n\t// Update loads both accounts, calls fn and saves both atomically if fn returns nil.\n\tUpdate(ctx context.Context, fromID, toID string, fn func(from, to *ledger.Account) error) error\n}\n\ntype Service struct {\n\taccounts AccountStore\n}\n\nfunc NewService(accounts AccountStore) *Service {\n\treturn &Service{accounts: accounts}\n}\n\n// Transfer moves amount minor units from one account to another.\nfunc (s *Service) Transfer(ctx context.Context, fromID, toID string, amount int64) error {\n\tif amount <= 0 {\n\t\treturn ErrInvalidAmount\n\t}\n\tif fromID == toID {\n\t\treturn ErrSameAccount\n\t}\n\treturn s.accounts.Update(ctx, fromID, toID, func(from, to *ledger.Account) error {\n\t\tif err := from.Withdraw(amount); err != nil {\n\t\t\treturn err\n\t\t}\n\t\tto.Deposit(amount)\n\t\treturn nil\n\t})\n}\n\n// internal/store/memory/store.go: an adapter. It imports ledger, not transfer;\n// *Store satisfies transfer.AccountStore implicitly.\npackage memory\n\n// Update changes copies of both accounts and saves them only if fn succeeds,\n// so a failed transfer leaves both balances as they were.\nfunc (s *Store) Update(ctx context.Context, fromID, toID string, fn func(from, to *ledger.Account) error) error {\n\tif err := ctx.Err(); err != nil {\n\t\treturn err\n\t}\n\ts.mu.Lock()\n\tdefer s.mu.Unlock()\n\tfrom, ok := s.accounts[fromID]\n\tif !ok {\n\t\treturn fmt.Errorf(\"account %q: %w\", fromID, ledger.ErrAccountNotFound)\n\t}\n\tto, ok := s.accounts[toID]\n\tif !ok {\n\t\treturn fmt.Errorf(\"account %q: %w\", toID, ledger.ErrAccountNotFound)\n\t}\n\tif err := fn(&from, &to); err != nil {\n\t\treturn err\n\t}\n\ts.accounts[fromID], s.accounts[toID] = from, to\n\treturn nil\n}\n\n// internal/transfer/service_test.go\npackage transfer_test\n\n// The in-memory adapter stands in for the database: same port, no PostgreSQL.\nfunc newService() (*transfer.Service, *memory.Store) {\n\tstore := memory.New(\n\t\tledger.Account{ID: \"alice\", Balance: 1000},\n\t\tledger.Account{ID: \"bob\", Balance: 0},\n\t)\n\treturn transfer.NewService(store), store\n}\n\nfunc balance(t *testing.T, store *memory.Store, id string) int64 {\n\tt.Helper()\n\ta, err := store.Get(context.Background(), id)\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\treturn a.Balance\n}\n\nfunc TestTransfer(t *testing.T) {\n\ttests := []struct {\n\t\tname             string\n\t\tfrom, to         string\n\t\tamount           int64\n\t\twantErr          error\n\t\twantAlice, wantB int64\n\t}{\n\t\t{name: \"moves money\", from: \"alice\", to: \"bob\", amount: 300, wantAlice: 700, wantB: 300},\n\t\t{name: \"insufficient funds\", from: \"alice\", to: \"bob\", amount: 1001, wantErr: ledger.ErrInsufficientFunds, wantAlice: 1000},\n\t\t{name: \"unknown account\", from: \"alice\", to: \"carol\", amount: 1, wantErr: ledger.ErrAccountNotFound, wantAlice: 1000},\n\t\t// … zero, negative and same-account cases\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tsvc, store := newService()\n\t\t\terr := svc.Transfer(context.Background(), tt.from, tt.to, tt.amount)\n\t\t\tif !errors.Is(err, tt.wantErr) {\n\t\t\t\tt.Fatalf(\"Transfer() error = %v, want %v\", err, tt.wantErr)\n\t\t\t}\n\t\t\tif got := balance(t, store, \"alice\"); got != tt.wantAlice {\n\t\t\t\tt.Errorf(\"alice = %d, want %d\", got, tt.wantAlice)\n\t\t\t}\n\t\t\tif got := balance(t, store, \"bob\"); got != tt.wantB {\n\t\t\t\tt.Errorf(\"bob = %d, want %d\", got, tt.wantB)\n\t\t\t}\n\t\t})\n\t}\n}\n",
    "shortRU": "Когда Go-сервис перерастает один файл, нужно решить, какой пакет что содержит и кто кого может импортировать. cmd/ledger/main.go остаётся тонким: читает конфиг, собирает зависимости и запускает сервер. Остальное живёт в internal/, по предметным областям: ledger, transfer. HTTP-обработчик вызывает use case, а тот — домен. Use case объявляет нужный ему маленький интерфейс, например AccountStore, а адаптер PostgreSQL его реализует. Зависимости смотрят внутрь, и домен ничего не импортирует из остального сервиса: это и есть гексагональная архитектура. Это держится, только если импорты проверяет линтер или тест.",
    "jvmRU": "Типичный проект на Spring делится по слоям на пакеты controller, service и repository, а интерфейс репозитория приходит со стороны хранения, часто это JpaRepository из Spring Data. В Go use case сам объявляет маленький интерфейс, который вызывает, а адаптер удовлетворяет ему неявно, без implements, поэтому адаптер никогда не импортирует use case. Там, где Java-команда пишет правила ArchUnit, Go-команда проверяет импорты линтером или коротким тестом.",
    "detailsRU": [
      "У каждого исполняемого файла свой cmd/<binary>/main.go; всё остальное — в internal/, и команда go отклоняет его импорт извне дерева с корнем в родителе internal/: «use of internal package … not allowed» (c43). В официальном руководстве по раскладке каталога pkg/ нет. Пакет кладут вне internal/, только если его действительно импортирует другой модуль: тогда его API становится контрактом с этим модулем.",
      "Пакеты называют по предметной области, например ledger и transfer, а не по слою или виду файлов вроде models, services или utils. Внутри области транспорт (обработчики net/http или gRPC) разбирает запрос, вызывает один use case и переводит ошибки в коды статуса (c46); use case выполняет одну бизнес-операцию; домен держит типы и правила вроде Account.Withdraw; адаптеры ходят в PostgreSQL или во внешний API. Транспорт и адаптеры тонкие и бизнес-правил не содержат.",
      "Направление: транспорт → use case → домен и адаптер → домен. Use case объявляет порт — интерфейс только с теми методами, которые он вызывает; адаптер возвращает конкретный тип вроде *postgres.Store, который удовлетворяет порту, не импортируя use case. Только main видит оба и соединяет их (c58). Это гексагональная архитектура, она же ports and adapters; clean architecture рисует то же правило кольцами.",
      "Как это деградирует: домен импортирует HTTP-пакет ради DTO или кода статуса, появляется пакет utils или common, который импортируют все, store начинает возвращать HTTP-ошибки. Циклы импортов Go запрещает («import cycle not allowed»), поэтому неверный импорт часто всплывает позже как цикл. Правило держат depguard в golangci-lint, go-arch-lint или короткий тест, который разбирает импорты через go/parser и падает на всём, чего нет в списке разрешённых.",
      "Маленькому сервису эта иерархия не нужна: один пакет main или main и два-три пакета — нормально. Порт добавляют, когда есть реальная вторая реализация или медленная зависимость, которую нужно подменить в тестах, а не перед каждой структурой."
    ],
    "versionNote": "Правило internal действует для всех репозиториев с Go 1.5. Сверено на Go 1.24.7 и 1.27.3: проверка internal в команде go (disallowInternal в cmd/go/internal/load/pkg.go) по логике не менялась, тексты ошибок «use of internal package … not allowed» и «import cycle not allowed» — из запуска на обеих версиях. Фикстура (пять пакетов и тест направления импортов): gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "Organizing a Go module: server project",
        "url": "https://go.dev/doc/modules/layout#server-project"
      },
      {
        "title": "Go Code Review Comments: interfaces",
        "url": "https://go.dev/wiki/CodeReviewComments#interfaces"
      },
      {
        "title": "cmd/go: internal packages",
        "url": "https://pkg.go.dev/cmd/go#hdr-Internal_packages"
      },
      {
        "title": "depguard: import allow and deny lists",
        "url": "https://github.com/OpenPeeDeeP/depguard"
      }
    ],
    "practice": {
      "kind": "Найди нарушение направления зависимостей",
      "promptEN": "A teammate made internal/ledger import internal/httpapi to reuse its TransferRequest DTO. internal/httpapi imports internal/transfer, and internal/transfer imports internal/ledger and internal/store/postgres. Now go build fails with \"import cycle not allowed\". What is wrong, and how do you fix it?",
      "promptRU": "Коллега сделал так, что internal/ledger импортирует internal/httpapi ради DTO TransferRequest. internal/httpapi импортирует internal/transfer, а internal/transfer — internal/ledger и internal/store/postgres. Теперь go build падает с «import cycle not allowed». Что не так и как это исправить?",
      "pointsEN": [
        "The domain imports the transport: ledger → httpapi → transfer → ledger is a cycle, and Go rejects it. Even without a cycle, the domain must not know about JSON or HTTP.",
        "Keep the DTO in httpapi: the handler decodes it and passes plain values, the IDs and an int64 amount, to the use case.",
        "transfer importing store/postgres is the second violation: declare AccountStore in transfer, let *postgres.Store satisfy it, connect them in main, and add an import check to CI."
      ],
      "pointsRU": [
        "Домен импортирует транспорт: ledger → httpapi → transfer → ledger — это цикл, и Go его отклоняет. Даже без цикла домен не должен знать о JSON и HTTP.",
        "DTO остаётся в httpapi: обработчик разбирает его и передаёт в use case простые значения — ID и сумму в int64.",
        "Импорт store/postgres из transfer — второе нарушение: объяви AccountStore в transfer, пусть *postgres.Store ему удовлетворяет, соедини их в main и добавь проверку импортов в CI."
      ],
      "followUpEN": "Why can *postgres.Store satisfy transfer.AccountStore without importing the transfer package, and why does that matter here?",
      "followUpRU": "Почему *postgres.Store может удовлетворять transfer.AccountStore, не импортируя пакет transfer, и почему это здесь важно?"
    },
    "quizIds": []
  },
  {
    "id": "c58",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "How do you wire dependencies in a Go service: by hand, with Wire, or with Fx?",
    "qRU": "Как собирать зависимости в Go-сервисе: руками, через Wire или через Fx?",
    "shortEN": "A Go service has to build its database pool, clients, services and handlers in the right order. In Go, dependency injection just means passing them to constructors. One function, the composition root in main or internal/app, calls constructors in order and pushes each resource's close function onto a stack. Wiring by hand is the default even in large services: a missing dependency is a compile error, and the graph reads top to bottom. Wire generates the same function and reports a missing provider during generation. Fx builds the graph at run time with reflection, so errors appear at startup.",
    "anchorsEN": [
      "DI in Go = constructor parameters, no container",
      "composition root: main or internal/app, dependency order, close stack",
      "by hand by default: compile errors, graph reads top to bottom",
      "Wire: generated code, errors during generation",
      "Fx: reflection at run time, errors at startup"
    ],
    "jvmEN": "Spring scans annotations and builds the bean graph at run time with reflection, which is close to Fx; Dagger generates the wiring at compile time, close to Wire. What Spring recommends for required dependencies, constructor injection, is what Go does by hand, and Spring destroying a bean's dependents before the bean is the close stack you write yourself. Most Go services use neither tool.",
    "detailsEN": [
      "The composition root is one function, main or internal/app.New, that calls constructors in dependency order: config, database pool, stores, clients, use cases, handlers, server. Each constructor receives what it needs as parameters and returns a concrete type; no package reaches out for its own dependencies. Tests call the same constructors with fakes.",
      "A long main is the price of wiring by hand. Group the steps into functions such as newStorage(cfg) or newClients(cfg) that return values and close functions, not package-level variables. Pass getenv and the logger in, as LoadConfig(os.Getenv) does, so tests need no os.Setenv.",
      "Wire: you write providers, which are ordinary constructors, and an injector stub that calls wire.Build; the wire command writes wire_gen.go with the same function you would write by hand, and a missing provider stops generation: \"no provider found for …\". A provider may also return a cleanup func(); the generated injector calls it when a later provider fails and returns the combined cleanup otherwise. The repository is now archived and marked no longer maintained.",
      "Fx is built on dig, a reflection-based container. fx.Provide registers constructors, which Fx calls lazily, once each; fx.Invoke registers functions that fx.New runs right away, and Fx builds only what they need; fx.Lifecycle collects OnStart and OnStop hooks, and OnStop hooks run in reverse order. Value groups (group:\"routes\") collect many values of one type, and fx.Module bundles a reusable part. A missing type or a cycle comes back from fx.New as app.Err(), so run fx.ValidateApp in a test.",
      "When to choose: by hand by default; Wire for a large graph that changes rarely; Fx when a platform team ships shared modules such as logging, metrics, config and the server to many services and wants one lifecycle. A homegrown generator that reads annotations in comments is in the same class as Wire.",
      "Anti-patterns. A service locator, a global registry that code asks for what it needs, hides dependencies and fails at run time. A constructor that takes a container of everything with getters lies about what it uses, and every test has to build all of it. An init() that opens connections runs on import, has no context and cannot return an error.",
      "Stopping is the mirror image: close in reverse order of creation, so the server stops first, then the workers and the clients, and the database pool last (c59). If startup fails halfway, close what is already open, as the close stack in the example does."
    ],
    "practicalRU": "Неделя 5: сборка ledger в cmd/ledger — конфиг из переменных окружения, pgxpool, store, сервис, обработчик, сервер и стек закрытия с первого дня. Неделя 8, среда: в README со схемой архитектуры нарисуй граф сборки и объясни, почему без контейнера. На вопрос «а почему не Fx?» — граф маленький, ошибки ловит компилятор, а общий жизненный цикл для многих сервисов не нужен.",
    "code": "// Fragment of internal/app, the composition root (module example.com/m9/c58).\n// openDB, newStore, newRiskClient, newTransferService and newHandler stand in\n// for the real packages: a PostgreSQL pool, a store, an external API client,\n// the use case and the HTTP transport.\npackage app\n\ntype App struct {\n\tHandler http.Handler\n\tcleanup cleanup\n}\n\n// New builds the service in dependency order. If a step fails, it closes\n// what it has already opened, in reverse order, and returns the error.\nfunc New(ctx context.Context, cfg Config, log *slog.Logger) (_ *App, err error) {\n\ta := &App{cleanup: cleanup{log: log}}\n\tdefer func() {\n\t\tif err != nil {\n\t\t\terr = errors.Join(err, a.cleanup.run())\n\t\t}\n\t}()\n\n\tdb, err := openDB(cfg.DSN)\n\tif err != nil {\n\t\treturn nil, fmt.Errorf(\"open db: %w\", err)\n\t}\n\ta.cleanup.push(\"db\", db.Close)\n\n\tst, err := newStore(ctx, db)\n\tif err != nil {\n\t\treturn nil, fmt.Errorf(\"store: %w\", err)\n\t}\n\ta.cleanup.push(\"store\", st.Close)\n\n\trisk, err := newRiskClient(cfg.RiskURL)\n\tif err != nil {\n\t\treturn nil, fmt.Errorf(\"risk client: %w\", err)\n\t}\n\ta.cleanup.push(\"risk\", risk.Close)\n\n\tsvc := newTransferService(st, risk)\n\ta.Handler = newHandler(svc, log)\n\treturn a, nil\n}\n\n// Close releases resources in reverse order of creation. A second call does nothing.\nfunc (a *App) Close() error { return a.cleanup.run() }\n\n// cleanup is a stack of close functions: the last resource opened is closed first,\n// so nothing is closed while a resource built on top of it still uses it.\ntype cleanup struct {\n\tlog   *slog.Logger\n\tsteps []cleanupStep\n}\n\ntype cleanupStep struct {\n\tname  string\n\tclose func() error\n}\n\nfunc (c *cleanup) push(name string, close func() error) {\n\tc.steps = append(c.steps, cleanupStep{name: name, close: close})\n}\n\n// run closes everything, keeps going after an error and returns all errors joined.\nfunc (c *cleanup) run() error {\n\tvar errs []error\n\tfor i := len(c.steps) - 1; i >= 0; i-- {\n\t\ts := c.steps[i]\n\t\tif err := s.close(); err != nil {\n\t\t\terrs = append(errs, fmt.Errorf(\"close %s: %w\", s.name, err))\n\t\t\tcontinue\n\t\t}\n\t\tc.log.Info(\"closed\", \"resource\", s.name)\n\t}\n\tc.steps = nil\n\treturn errors.Join(errs...)\n}\n\n// With RiskURL \"risk.local\" (no scheme) the third step fails. The log, without time:\n//\n//\tlevel=INFO msg=closed resource=store\n//\tlevel=INFO msg=closed resource=db\n//\n// New returns: risk client: URL \"risk.local\" needs a scheme and a host\n\n// app_test.go; newLog returns a logger and the list of resources it saw closed.\nfunc TestNewClosesWhatItOpenedOnError(t *testing.T) {\n\tcancelled, cancel := context.WithCancel(context.Background())\n\tcancel()\n\ttests := []struct {\n\t\tname       string\n\t\tctx        context.Context\n\t\tcfg        Config\n\t\twantErr    string\n\t\twantClosed []string\n\t}{\n\t\t{name: \"step 1, db\", ctx: context.Background(), cfg: Config{DSN: \"postgres://x\", RiskURL: \"http://risk.local\"},\n\t\t\twantErr: \"open db\", wantClosed: nil},\n\t\t{name: \"step 2, store\", ctx: cancelled, cfg: Config{DSN: \"mem://ledger\", RiskURL: \"http://risk.local\"},\n\t\t\twantErr: \"store\", wantClosed: []string{\"db\"}},\n\t\t{name: \"step 3, risk client\", ctx: context.Background(), cfg: Config{DSN: \"mem://ledger\", RiskURL: \"risk.local\"},\n\t\t\twantErr: \"risk client\", wantClosed: []string{\"store\", \"db\"}},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tlog, closed := newLog()\n\t\t\ta, err := New(tt.ctx, tt.cfg, log)\n\t\t\tif err == nil || !strings.HasPrefix(err.Error(), tt.wantErr+\":\") {\n\t\t\t\tt.Fatalf(\"New() error = %v, want prefix %q\", err, tt.wantErr)\n\t\t\t}\n\t\t\tif a != nil {\n\t\t\t\tt.Fatal(\"New() returned an App together with an error\")\n\t\t\t}\n\t\t\tif got := closed(); !slices.Equal(got, tt.wantClosed) {\n\t\t\t\tt.Fatalf(\"closed %q, want %q\", got, tt.wantClosed)\n\t\t\t}\n\t\t})\n\t}\n}\n",
    "shortRU": "Go-сервису нужно создать пул базы данных, клиенты, сервисы и обработчики в правильном порядке. Внедрение зависимостей в Go — это просто передача их в конструкторы. Одна функция, composition root в main или internal/app, вызывает конструкторы по порядку и кладёт функцию закрытия каждого ресурса в стек. Ручная сборка — норма даже в больших сервисах: пропущенная зависимость — ошибка компиляции, а граф читается сверху вниз. Wire генерирует ту же функцию и сообщает о пропущенном провайдере при генерации. Fx строит граф во время выполнения через рефлексию, поэтому его ошибки видны при старте.",
    "jvmRU": "Spring сканирует аннотации и строит граф бинов во время выполнения через рефлексию — это близко к Fx; Dagger генерирует сборку при компиляции — это близко к Wire. То, что Spring советует для обязательных зависимостей, — внедрение через конструктор — Go делает руками, а то, что Spring уничтожает зависимые бины раньше самого бина, — это стек закрытия, который в Go пишешь сам. Большинство Go-сервисов обходятся без обоих инструментов.",
    "detailsRU": [
      "Composition root — одна функция, main или internal/app.New, которая вызывает конструкторы в порядке зависимостей: конфиг, пул базы, store, клиенты, use case, обработчики, сервер. Каждый конструктор получает нужное параметрами и возвращает конкретный тип; ни один пакет не достаёт свои зависимости сам. Тесты вызывают те же конструкторы с фейками.",
      "Длинный main — плата за ручную сборку. Шаги группируют в функции вроде newStorage(cfg) или newClients(cfg), которые возвращают значения и функции закрытия, а не в переменные уровня пакета. getenv и логгер передают параметрами, как в LoadConfig(os.Getenv), чтобы тестам не нужен был os.Setenv.",
      "Wire: ты пишешь провайдеры — обычные конструкторы — и заготовку инжектора с вызовом wire.Build; команда wire пишет wire_gen.go с той же функцией, что ты написал бы руками, а пропущенный провайдер останавливает генерацию: «no provider found for …». Провайдер может вернуть и cleanup-функцию func(); сгенерированный инжектор вызывает её, если следующий провайдер упал, а иначе возвращает общую cleanup-функцию. Репозиторий сейчас архивирован и помечен как больше не поддерживаемый.",
      "Fx построен на dig — контейнере на рефлексии. fx.Provide регистрирует конструкторы, которые Fx вызывает лениво и по одному разу; fx.Invoke регистрирует функции, которые fx.New выполняет сразу, и Fx создаёт только то, что им нужно; fx.Lifecycle собирает хуки OnStart и OnStop, и хуки OnStop выполняются в обратном порядке. Группы значений (group:\"routes\") собирают много значений одного типа, а fx.Module упаковывает переиспользуемую часть. Пропущенный тип или цикл возвращается из fx.New как app.Err(), поэтому fx.ValidateApp запускают в тесте.",
      "Когда что: по умолчанию — руками; Wire — для большого графа, который редко меняется; Fx — когда команда платформы раздаёт многим сервисам общие модули вроде логов, метрик, конфига и сервера и хочет единый жизненный цикл. Свой генератор по аннотациям в комментариях — того же класса, что Wire.",
      "Анти-паттерны. Service locator — глобальный реестр, у которого код сам просит нужное, — прячет зависимости и падает во время выполнения. Конструктор, который принимает «контейнер всего» с геттерами, скрывает, чем пользуется, и каждому тесту приходится собирать его целиком. init(), открывающий соединения, выполняется при импорте, без контекста и не может вернуть ошибку.",
      "Остановка — зеркальное отражение: закрывать в порядке, обратном созданию, — сначала сервер, затем воркеры и клиенты, последним — пул базы (c59). Если старт упал на полпути, закрыть то, что уже открыто, как это делает стек закрытия в примере."
    ],
    "versionNote": "Сверено на Go 1.24.7 и 1.27.3: errors.Join (с Go 1.20) и http.Client.CloseIdleConnections (с Go 1.12) в обеих версиях ведут себя одинаково (исходник errors/join.go отличается только комментарием). Wire и Fx в фикстуре не используются; их поведение сверено по README и guide Wire (репозиторий архивирован, последний push — август 2025) и по документации Fx v1.24.0 (последний релиз на 31.10.2026). Фикстура: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3; вывод в коде — из запуска на обеих версиях.",
    "sources": [
      {
        "title": "Wire User Guide: injectors and cleanup functions",
        "url": "https://github.com/google/wire/blob/main/docs/guide.md"
      },
      {
        "title": "Compile-time Dependency Injection With Go Cloud's Wire (Go blog)",
        "url": "https://go.dev/blog/wire"
      },
      {
        "title": "Package go.uber.org/fx",
        "url": "https://pkg.go.dev/go.uber.org/fx"
      },
      {
        "title": "Package errors: Join",
        "url": "https://pkg.go.dev/errors#Join"
      }
    ],
    "practice": {
      "kind": "Разбери сборку сервиса",
      "promptEN": "NewServer(deps *Container) takes a struct with 14 getters, such as DB(), Kafka(), Config(), Logger() and RiskClient(), and the server uses three of them. Each getter creates its value on the first call. What problems does this cause, and how would you rewrite it?",
      "promptRU": "NewServer(deps *Container) принимает структуру с 14 геттерами — DB(), Kafka(), Config(), Logger(), RiskClient() и другими, — а сервер пользуется тремя из них. Каждый геттер создаёт своё значение при первом вызове. Какие проблемы это создаёт и как бы ты это переписал?",
      "pointsEN": [
        "The signature hides what the server needs: a reader cannot tell, and a test has to build or fake the whole container.",
        "Lazy getters move failures and creation order to run time, and nobody owns closing: a broken broker address shows up on the first request, not at startup.",
        "Rewrite it as NewServer(store, risk, log) with only the three dependencies, behind small interfaces at the consumer where a test needs a fake; the composition root builds them in order and closes them in reverse."
      ],
      "pointsRU": [
        "Сигнатура скрывает, что нужно серверу: читатель этого не видит, а тесту приходится собирать или подменять весь контейнер.",
        "Ленивые геттеры переносят ошибки и порядок создания на время выполнения, а закрытием никто не владеет: неверный адрес брокера всплывёт на первом запросе, а не при старте.",
        "Переписать как NewServer(store, risk, log) только с тремя зависимостями, за маленькими интерфейсами у потребителя там, где тесту нужен фейк; composition root создаёт их по порядку и закрывает в обратном."
      ],
      "followUpEN": "Fx also builds the graph for you. How is it different from this container?",
      "followUpRU": "Fx тоже собирает граф за тебя. Чем он отличается от этого контейнера?"
    },
    "quizIds": []
  },
  {
    "id": "c59",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "What should a Go service do between SIGTERM and exit?",
    "qRU": "Что должен сделать Go-сервис между SIGTERM и выходом?",
    "shortEN": "When Kubernetes stops a pod, the service gets SIGTERM and, by default, thirty seconds before SIGKILL. In that window it must finish its work and lose nothing. signal.NotifyContext turns the signal into a cancelled context; after that, order matters. First the service reports not ready and keeps serving a few seconds, while load balancers stop sending it requests. Then http.Server.Shutdown with a deadline closes the listener and waits for requests in flight. Then the service cancels its workers and consumers and waits for them. It closes resources in reverse order, logs and traces last, and exits non-zero if anything failed.",
    "anchorsEN": [
      "SIGTERM → grace period (30 s) → SIGKILL; NotifyContext cancels ctx",
      "not ready, keep serving a few seconds",
      "Shutdown with a deadline: close the listener, drain requests",
      "cancel workers and consumers, wait for them",
      "close in reverse, telemetry last; exit 1 on failure"
    ],
    "jvmEN": "Spring Boot does most of this for you: graceful shutdown of the embedded server is on by default since 3.4 (server.shutdown=graceful before that), spring.lifecycle.timeout-per-shutdown-phase bounds each phase, SmartLifecycle beans stop phase by phase, and then singletons are destroyed in reverse dependency order. Its Kubernetes guide adds a preStop sleep for the same load-balancer window. In Go nothing is implicit: run spells out the order in one function, which makes it easy to read and easy to get wrong.",
    "detailsEN": [
      "Kubernetes runs the preStop hook, if there is one, sends SIGTERM to process 1 of each container, and at the same time the control plane marks the pod's endpoints as terminating and not ready. Proxies and load balancers learn this with a delay, so new requests can arrive for a few seconds after SIGTERM: hence the pause, in the service or as a preStop sleep. The pause plus the Shutdown deadline must fit into terminationGracePeriodSeconds, or SIGKILL cuts the drain short. /readyz answers 503 during the pause for balancers that probe the pod themselves; liveness keeps answering 200.",
      "errgroup.WithContext ties the parts together: the server, the worker and a stopper that waits on gctx. The first member to return an error cancels gctx, so a failed worker also stops HTTP; g.Wait returns after every member has returned, with the first error. Only then does run close resources, because nothing can use them any more. A member that ignores cancellation keeps Wait from returning, and the pod is killed at the end of the grace period.",
      "Contexts: request contexts come from Server.BaseContext, which is context.Background by default; setting it to the signal context would cancel every request in flight at SIGTERM. Shutdown needs its own deadline: context.WithTimeout(context.WithoutCancel(ctx), d) keeps the values but drops the cancellation (Go 1.21). With the already cancelled signal context, Shutdown returns context.Canceled at once if any request is in flight, without waiting for it; with context.Background() and no timeout it may wait forever. If the deadline passes, srv.Close drops the remaining connections, and the error reaches the exit code.",
      "Workers: one that takes jobs from handlers stops after HTTP has drained (W4-3); an independent Kafka consumer may stop in parallel. Either way the service waits for all of them before closing the pool, and a consumer commits offsets only for processed messages (c53). gRPC: GracefulStop refuses new RPCs and waits for pending ones but takes no context, so run it in a goroutine and call Stop if it has not returned in time. Shutdown does not wait for hijacked connections such as WebSockets; RegisterOnShutdown can notify them.",
      "Typical mistakes: sleeping a few seconds and closing resources without waiting for run to return, so requests fail on a closed pool; stopping the logger or tracer before the HTTP server, so the last requests leave no records; calling Shutdown with the cancelled signal context; exiting 0 after a failure; no ReadTimeout or WriteTimeout (c45), so a client that uploads or reads slowly keeps its request active and the drain runs to the deadline; a shell script that starts the binary without exec, which may never pass SIGTERM on.",
      "Exit code: main calls run and, if it returns an error, logs it and calls os.Exit(1). os.Exit skips deferred calls, so everything that must be closed lives inside run. A clean stop on SIGTERM returns nil and exits 0; a failure exits 1, so restarts, Job status and alerts see it. To log why the service stopped, use context.Cause: in Go 1.27.3 it returns \"terminated signal received\" for SIGTERM on the NotifyContext context, in 1.24.7 only context.Canceled."
    ],
    "practicalRU": "Неделя 8, вторник: graceful shutdown всего сервиса — HTTP, gRPC, relay-воркер и консьюмер (w8-tue-1). Он опирается на практикум W4-3, где порядок «HTTP → воркеры → база» собран для одного сервера; здесь добавляются readiness с паузой, errgroup и код выхода. В w8-sat-4 (liveness и readiness на /healthz и /readyz) проверь, что /readyz отвечает 503 с начала остановки, а /healthz — нет.",
    "code": "// Command service shows the order in which a whole Go service stops:\n// not ready → drain HTTP → stop the worker → close resources in reverse → exit code.\npackage main\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"fmt\"\n\t\"io\"\n\t\"log/slog\"\n\t\"net\"\n\t\"net/http\"\n\t\"os\"\n\t\"os/signal\"\n\t\"sync/atomic\"\n\t\"syscall\"\n\t\"time\"\n\n\t\"golang.org/x/sync/errgroup\"\n)\n\n// Service is what run serves and owns.\ntype Service struct {\n\tHandler http.Handler                    // business routes; run adds GET /readyz\n\tWork    func(ctx context.Context) error // one round of the background worker\n\tTick    time.Duration                   // how often Work runs\n\t// Resources in the order main opened them: telemetry, the DB pool, clients.\n\t// run closes them in reverse, so logs and traces are flushed last.\n\tResources  []io.Closer\n\tDrainDelay time.Duration // time for load balancers to stop sending requests\n\tTimeout    time.Duration // budget for requests in flight\n\tLog        *slog.Logger\n}\n\n// run serves until ctx is done or a part fails, then stops in order.\n// Its error decides the exit code.\nfunc run(ctx context.Context, ln net.Listener, s Service) error {\n\tvar ready atomic.Bool\n\tready.Store(true)\n\tmux := http.NewServeMux()\n\tmux.Handle(\"/\", s.Handler)\n\tmux.HandleFunc(\"GET /readyz\", func(w http.ResponseWriter, r *http.Request) {\n\t\tif !ready.Load() {\n\t\t\thttp.Error(w, \"shutting down\", http.StatusServiceUnavailable)\n\t\t\treturn\n\t\t}\n\t\tio.WriteString(w, \"ok\")\n\t})\n\t// No BaseContext: requests get context.Background, so SIGTERM does not cancel them.\n\t// Server timeouts (c45) stay below Timeout, so a slow client cannot hold the drain.\n\tsrv := &http.Server{\n\t\tHandler:           mux,\n\t\tReadHeaderTimeout: 5 * time.Second,\n\t\tReadTimeout:       10 * time.Second,\n\t\tWriteTimeout:      15 * time.Second,\n\t}\n\n\t// The worker stops after HTTP has drained: a request in flight may still need it.\n\tworkCtx, stopWork := context.WithCancel(context.WithoutCancel(ctx))\n\tdefer stopWork()\n\n\tg, gctx := errgroup.WithContext(ctx)\n\tg.Go(func() error {\n\t\tif err := srv.Serve(ln); !errors.Is(err, http.ErrServerClosed) {\n\t\t\treturn fmt.Errorf(\"serve: %w\", err)\n\t\t}\n\t\treturn nil\n\t})\n\tg.Go(func() error {\n\t\tt := time.NewTicker(s.Tick)\n\t\tdefer t.Stop()\n\t\tfor {\n\t\t\tselect {\n\t\t\tcase <-workCtx.Done():\n\t\t\t\ts.Log.Info(\"worker stopped\")\n\t\t\t\treturn nil\n\t\t\tcase <-t.C:\n\t\t\t\tif err := s.Work(workCtx); err != nil && workCtx.Err() == nil {\n\t\t\t\t\treturn fmt.Errorf(\"worker: %w\", err)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t})\n\tg.Go(func() error {\n\t\t<-gctx.Done() // a signal, or another member of the group failed\n\t\tdefer stopWork()\n\t\tready.Store(false)\n\t\ts.Log.Info(\"not ready\", \"cause\", context.Cause(gctx))\n\t\ttime.Sleep(s.DrainDelay) // a pause for load balancers, not a way to wait for our goroutines\n\n\t\tsctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), s.Timeout)\n\t\tdefer cancel()\n\t\tif err := srv.Shutdown(sctx); err != nil {\n\t\t\tsrv.Close() // out of time: drop the connections that are left\n\t\t\treturn fmt.Errorf(\"http shutdown: %w\", err)\n\t\t}\n\t\ts.Log.Info(\"http drained\")\n\t\treturn nil\n\t})\n\n\terrs := []error{g.Wait()} // every member has returned: nothing uses the resources now\n\tfor i := len(s.Resources) - 1; i >= 0; i-- {\n\t\terrs = append(errs, s.Resources[i].Close())\n\t}\n\treturn errors.Join(errs...)\n}\n\nfunc main() {\n\tctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)\n\tgo func() {\n\t\t<-ctx.Done()\n\t\tstop() // restore the default handling: a second signal kills the process\n\t}()\n\tlog := slog.New(slog.NewJSONHandler(os.Stderr, nil))\n\tln, err := net.Listen(\"tcp\", \":8080\")\n\tif err == nil {\n\t\tlog.Info(\"listening\", \"addr\", ln.Addr().String())\n\t\terr = run(ctx, ln, Service{\n\t\t\tHandler: http.NotFoundHandler(),                     // the real routes\n\t\t\tWork:    func(context.Context) error { return nil }, // e.g. one outbox relay round\n\t\t\tTick:    time.Second,\n\t\t\t// Resources: the trace exporter, the DB pool and clients, in the order main opened them.\n\t\t\tDrainDelay: 5 * time.Second,\n\t\t\tTimeout:    20 * time.Second, // 5 s + 20 s fit into the default 30 s grace period\n\t\t\tLog:        log,\n\t\t})\n\t}\n\tstop()\n\tif err != nil {\n\t\tlog.Error(\"service stopped\", \"err\", err)\n\t\tos.Exit(1) // the platform and alerts must see a failure, not a clean stop\n\t}\n}",
    "shortRU": "Когда Kubernetes останавливает под, сервис получает SIGTERM и по умолчанию тридцать секунд до SIGKILL. За это время он должен доделать начатое и ничего не потерять. signal.NotifyContext превращает сигнал в отмену контекста; дальше важен порядок. Сначала сервис сообщает, что не готов, и ещё несколько секунд обслуживает запросы, пока балансировщики перестают слать ему трафик. Затем http.Server.Shutdown с дедлайном закрывает listener и ждёт запросы в полёте. Затем сервис отменяет воркеры и консьюмеры и дожидается их. Ресурсы он закрывает в обратном порядке, логи и трейсы — последними, и выходит с ненулевым кодом, если что-то упало.",
    "jvmRU": "Spring Boot делает большую часть сам: graceful shutdown встроенного сервера включён по умолчанию с 3.4 (раньше — server.shutdown=graceful), spring.lifecycle.timeout-per-shutdown-phase ограничивает каждую фазу, SmartLifecycle-бины останавливаются по фазам, а затем синглтоны уничтожаются в порядке, обратном зависимостям. Его руководство по Kubernetes добавляет preStop со sleep ради того же окна балансировщиков. В Go ничего не происходит неявно: run выписывает порядок в одной функции — его легко прочитать и легко нарушить.",
    "detailsRU": [
      "Kubernetes выполняет preStop-хук, если он есть, отправляет SIGTERM процессу 1 каждого контейнера, и одновременно control plane помечает endpoints пода как завершающиеся и неготовые. Прокси и балансировщики узнают об этом с задержкой, поэтому ещё несколько секунд после SIGTERM могут приходить новые запросы: отсюда пауза — в сервисе или как preStop со sleep. Пауза плюс дедлайн Shutdown должны уложиться в terminationGracePeriodSeconds, иначе SIGKILL оборвёт дренаж. /readyz во время паузы отвечает 503 — для балансировщиков, которые сами опрашивают под; liveness продолжает отвечать 200.",
      "errgroup.WithContext связывает части: сервер, воркер и «остановщик», который ждёт gctx. Первый участник, вернувший ошибку, отменяет gctx, поэтому упавший воркер останавливает и HTTP; g.Wait возвращается, когда вернулись все участники, с первой ошибкой. Только после этого run закрывает ресурсы: ими уже никто не может пользоваться. Участник, который игнорирует отмену, не даёт Wait вернуться, и под убивают в конце grace period.",
      "Контексты: контексты запросов берутся из Server.BaseContext, по умолчанию это context.Background; если подставить туда контекст сигнала, SIGTERM отменит все запросы в полёте. Shutdown нужен свой дедлайн: context.WithTimeout(context.WithoutCancel(ctx), d) сохраняет values, но убирает отмену (Go 1.21). С уже отменённым контекстом сигнала Shutdown сразу возвращает context.Canceled, если есть запросы в полёте, и не ждёт их; с context.Background() без таймаута может ждать вечно. Если дедлайн истёк, srv.Close обрывает оставшиеся соединения, а ошибка доходит до кода выхода.",
      "Воркеры: тот, что получает задачи от хендлеров, останавливается после дренажа HTTP (W4-3); независимый консьюмер Kafka может останавливаться параллельно. В любом случае сервис дожидается их всех до закрытия пула, а консьюмер коммитит offset только обработанных сообщений (c53). gRPC: GracefulStop отказывает новым RPC и ждёт текущие, но контекста не принимает, поэтому его запускают в горутине и вызывают Stop, если он не вернулся вовремя. Shutdown не ждёт hijacked-соединения вроде WebSocket; уведомить их можно через RegisterOnShutdown.",
      "Типичные ошибки: поспать несколько секунд и закрыть ресурсы, не дождавшись возврата run, — запросы падают на закрытом пуле; остановить логгер или трейсер раньше HTTP-сервера — последние запросы не оставляют записей; вызвать Shutdown с отменённым контекстом сигнала; выйти с кодом 0 после сбоя; не задать ReadTimeout и WriteTimeout (c45) — клиент, который медленно отправляет или читает данные, держит запрос активным, и дренаж длится до дедлайна; shell-скрипт, который запускает бинарник без exec и может так и не передать SIGTERM.",
      "Код выхода: main вызывает run и, если тот вернул ошибку, логирует её и вызывает os.Exit(1). os.Exit не выполняет отложенные вызовы, поэтому всё, что нужно закрыть, живёт внутри run. Чистая остановка по SIGTERM возвращает nil и даёт код 0; сбой даёт 1, и его видят перезапуски, статус Job и алерты. Чтобы записать в лог причину остановки, берут context.Cause: в Go 1.27.3 для SIGTERM на контексте NotifyContext он возвращает «terminated signal received», в 1.24.7 — только context.Canceled."
    ],
    "versionNote": "Сверено по исходникам Go 1.24.7 и 1.27.3: поведение http.Server.Shutdown (закрыть listener и простаивающие соединения, ждать активные, при истёкшем контексте вернуть его ошибку), Server.BaseContext и context.WithoutCancel (с Go 1.21) не изменились. signal.NotifyContext изменился: в 1.24.7 контекст отменяется без причины, в 1.27.3 context.Cause возвращает «terminated signal received» (проверено запуском на обеих версиях). Шаблон «GET /readyz» — Go 1.22; errgroup — golang.org/x/sync v0.19.0, последний выпуск для Go 1.24 (v0.20.0 требует Go 1.25). Фикстура: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "net/http: Server.Shutdown",
        "url": "https://pkg.go.dev/net/http#Server.Shutdown"
      },
      {
        "title": "os/signal: NotifyContext — go1.27.3 (context.Cause names the signal)",
        "url": "https://pkg.go.dev/os/signal@go1.27.3#NotifyContext"
      },
      {
        "title": "os/signal: NotifyContext — go1.24.7",
        "url": "https://pkg.go.dev/os/signal@go1.24.7#NotifyContext"
      },
      {
        "title": "golang.org/x/sync/errgroup",
        "url": "https://pkg.go.dev/golang.org/x/sync/errgroup"
      },
      {
        "title": "Kubernetes: Termination of Pods",
        "url": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination"
      }
    ],
    "practice": {
      "kind": "Найди ошибку в остановке",
      "promptEN": "main starts go srv.ListenAndServe() and go consumer.Run(ctx). On SIGTERM it calls time.Sleep(3 * time.Second), then cancel() for the consumer, then db.Close() and os.Exit(0). What breaks, and how do you fix it?",
      "promptRU": "main запускает go srv.ListenAndServe() и go consumer.Run(ctx). По SIGTERM он делает time.Sleep(3 * time.Second), затем cancel() для консьюмера, затем db.Close() и os.Exit(0). Что сломается и как исправить?",
      "pointsEN": [
        "Nothing stops the server or waits for anyone: a request longer than 3 s and the batch the consumer is finishing after cancel() get \"sql: database is closed\".",
        "os.Exit(0) cuts off responses in progress, skips deferred calls such as flushing logs and spans, and tells the platform the stop was clean even after a failure.",
        "Fix: not ready, a short pause, Shutdown with its own deadline, cancel the consumer and wait for it (errgroup Wait), close in reverse, and exit 1 if run returned an error."
      ],
      "pointsRU": [
        "Сервер никто не останавливает и никого не ждут: запрос дольше 3 с и пакет, который консьюмер доделывает после cancel(), получают «sql: database is closed».",
        "os.Exit(0) обрывает ответы на середине, пропускает отложенные вызовы вроде сброса логов и спанов и сообщает платформе о чистой остановке даже после сбоя.",
        "Исправление: not ready, короткая пауза, Shutdown со своим дедлайном, отмена консьюмера и ожидание его (errgroup Wait), закрытие в обратном порядке и выход с кодом 1, если run вернул ошибку."
      ],
      "followUpEN": "The pause is 10 s, the Shutdown deadline 30 s, and terminationGracePeriodSeconds is left at its default. What happens to a slow request, and what do you change?",
      "followUpRU": "Пауза — 10 с, дедлайн Shutdown — 30 с, а terminationGracePeriodSeconds оставлен по умолчанию. Что будет с медленным запросом и что поменять?"
    },
    "quizIds": []
  },
  {
    "id": "c60",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "How do you build a REST API in Go: hand-written routes or OpenAPI-first code generation, and what goes into middleware?",
    "qRU": "Как строить REST API на Go: маршруты руками или кодогенерация из OpenAPI, и что кладут в middleware?",
    "shortEN": "In Go a REST API is usually net/http handlers behind a router, wrapped in middleware. Since Go 1.22 the standard ServeMux matches method and path, as in GET /accounts/{id}, and r.PathValue reads the id. Routes are written by hand, or spec-first: oapi-codegen or ogen turns the OpenAPI file into types, a server interface and clients, and you implement that interface. Middleware is a function that wraps one handler in another. Request id goes outermost, then logging, then recover, which must answer 500, then rate limits and auth, so the log line shows the 500 with its id.",
    "anchorsEN": [
      "net/http handlers + router + middleware",
      "Go 1.22 ServeMux: GET /accounts/{id}, r.PathValue",
      "by hand or spec-first: oapi-codegen, ogen → types, interface, clients",
      "middleware wraps a handler: request id → logging → recover (500) → limits, auth"
    ],
    "jvmEN": "Spring MVC maps routes with @GetMapping and wraps them in servlet filters and HandlerInterceptors. springdoc generates the spec from the code, which is code-first; openapi-generator generates controller interfaces from the spec, which is spec-first. Go has the same split, but no annotations or classpath scanning: routes are registered in code, and the middleware chain is ordinary function composition, read from the outside in.",
    "detailsEN": [
      "Beyond c45: GET also matches HEAD, so the 405 answer carries Allow: \"GET, HEAD\". {$} matches only the exact path, {rest...} matches the remainder, and registering two conflicting patterns panics at startup. The mux's own 404 and 405 bodies are plain text, not JSON.",
      "Routers: chi keeps the net/http types, so its handlers and middleware are ordinary http.Handler, and it adds route groups, subrouters and a middleware package. echo and gin have their own Context type and their own error handling: an echo handler returns an error, a gin handler records it with c.Error. They are convenient, but the code is tied to the framework.",
      "Spec-first with oapi-codegen: it generates servers for net/http, chi, echo, gin and others; strict-server mode gives each operation typed request and response objects, and a validator middleware built on kin-openapi rejects requests that do not match the spec. ogen generates its own router, validation and JSON encoding without reflection. Generated files are never edited by hand; a CI step that regenerates them and fails on a diff keeps them in sync.",
      "Trade-offs: spec-first gives other teams a contract before the code exists, clients come for free, and the compiler reports an operation you did not implement. The price is code shaped by the generator, for example optional fields as pointers or Opt wrappers, and friction with streaming or unusual endpoints. Code-first gives full control, but a spec generated from comments or written by hand can drift from the code.",
      "Recover: net/http already recovers a handler panic, logs it and closes the connection (over HTTP/2, resets the stream): the client gets no response, over HTTP/1.1 it sees EOF. A recover middleware sends a proper 500 with the request id; if it only logs, the handler returns normally and net/http sends an empty 200. Re-panic http.ErrAbortHandler: it means abort quietly. Once the handler has written the header, the status cannot change, and a panic in a goroutine the handler started is caught by no middleware (c45).",
      "Order, outermost first: request id, so every layer and the log see it; logging and tracing, so they measure everything inside, including the 500 from recover; recover; a rate limit before auth sheds floods cheaply, while a per-user limit needs auth first; a timeout closest to the handler. chi's README uses the same order: RequestID, then Logger, then Recoverer. Domain errors become status codes in one function at the boundary (c46), not in middleware. Accept an incoming X-Request-ID only from your own edge; otherwise generate one, for example with crypto/rand.Text (Go 1.24)."
    ],
    "practicalRU": "Неделя 5, вторник: HTTP на net/http с шаблонами маршрутов Go 1.22 (w5-tue-1, практикум W5-1) и ошибки → коды (w5-tue-2, c46). Цепочка request id → logging → recover — развитие follow-up W5-1 (там request id и логирование): добавь recover и проверь тестами панику и 405, как в примере. Кодогенерацию из OpenAPI стоит попробовать на одном эндпоинте, чтобы сравнивать подходы на интервью по опыту.",
    "code": "// Command accounts is a small REST API on the standard ServeMux (Go 1.22\n// patterns) with a middleware chain: request id → logging → recover.\npackage main\n\nimport (\n\t\"context\"\n\t\"crypto/rand\"\n\t\"encoding/json\"\n\t\"log/slog\"\n\t\"net/http\"\n\t\"os\"\n\t\"runtime/debug\"\n\t\"time\"\n)\n\n// routes registers handlers by method and path; balances are in minor units.\nfunc routes(balances map[string]int64) *http.ServeMux {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /accounts/{id}\", func(w http.ResponseWriter, r *http.Request) {\n\t\tid := r.PathValue(\"id\")\n\t\tbalance, ok := balances[id]\n\t\tif !ok {\n\t\t\twriteJSON(w, http.StatusNotFound, map[string]string{\"error\": \"account not found\"})\n\t\t\treturn\n\t\t}\n\t\twriteJSON(w, http.StatusOK, map[string]any{\"id\": id, \"balance\": balance})\n\t})\n\treturn mux\n}\n\n// withMiddleware lists the layers outermost first. Rate limiting and auth\n// would follow recoverer.\nfunc withMiddleware(h http.Handler, log *slog.Logger) http.Handler {\n\treturn chain(h, requestID, logging(log), recoverer(log))\n}\n\n// chain wraps h so that the first middleware listed is the outermost.\nfunc chain(h http.Handler, mws ...func(http.Handler) http.Handler) http.Handler {\n\tfor i := len(mws) - 1; i >= 0; i-- {\n\t\th = mws[i](h)\n\t}\n\treturn h\n}\n\ntype requestIDKey struct{}\n\n// requestID puts an id into the context for inner layers and into the response for the client.\nfunc requestID(next http.Handler) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tid := rand.Text()\n\t\tw.Header().Set(\"X-Request-ID\", id)\n\t\tnext.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), requestIDKey{}, id)))\n\t})\n}\n\nfunc requestIDFrom(ctx context.Context) string {\n\tid, _ := ctx.Value(requestIDKey{}).(string)\n\treturn id\n}\n\n// logging writes one line per request with the status the inner layers produced.\nfunc logging(log *slog.Logger) func(http.Handler) http.Handler {\n\treturn func(next http.Handler) http.Handler {\n\t\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tstart := time.Now()\n\t\t\tsw := &statusWriter{ResponseWriter: w, status: http.StatusOK}\n\t\t\tnext.ServeHTTP(sw, r)\n\t\t\tlog.Info(\"request\", \"method\", r.Method, \"path\", r.URL.Path, \"status\", sw.status,\n\t\t\t\t\"request_id\", requestIDFrom(r.Context()), \"duration\", time.Since(start))\n\t\t})\n\t}\n}\n\ntype statusWriter struct {\n\thttp.ResponseWriter\n\tstatus int\n\twrote  bool\n}\n\nfunc (s *statusWriter) WriteHeader(code int) {\n\tif !s.wrote {\n\t\ts.status, s.wrote = code, true\n\t}\n\ts.ResponseWriter.WriteHeader(code)\n}\n\nfunc (s *statusWriter) Write(b []byte) (int, error) {\n\ts.wrote = true\n\treturn s.ResponseWriter.Write(b)\n}\n\n// Unwrap lets http.ResponseController reach the original writer.\nfunc (s *statusWriter) Unwrap() http.ResponseWriter { return s.ResponseWriter }\n\n// recoverer turns a panic into a 500 with the request id. Without it, net/http\n// logs the panic and drops the connection (HTTP/2: the stream) with no response.\nfunc recoverer(log *slog.Logger) func(http.Handler) http.Handler {\n\treturn func(next http.Handler) http.Handler {\n\t\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tdefer func() {\n\t\t\t\tv := recover()\n\t\t\t\tif v == nil {\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t\tif v == http.ErrAbortHandler {\n\t\t\t\t\tpanic(v) // the handler asked net/http to abort the response\n\t\t\t\t}\n\t\t\t\tid := requestIDFrom(r.Context())\n\t\t\t\tlog.Error(\"panic\", \"request_id\", id, \"panic\", v, \"stack\", string(debug.Stack()))\n\t\t\t\twriteJSON(w, http.StatusInternalServerError, map[string]string{\"error\": \"internal error\", \"request_id\": id})\n\t\t\t}()\n\t\t\tnext.ServeHTTP(w, r)\n\t\t})\n\t}\n}\n\nfunc writeJSON(w http.ResponseWriter, status int, v any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(v)\n}\n\nfunc main() {\n\tlog := slog.New(slog.NewJSONHandler(os.Stderr, nil))\n\tsrv := &http.Server{\n\t\tAddr:              \"127.0.0.1:8080\",\n\t\tHandler:           withMiddleware(routes(map[string]int64{\"42\": 1050}), log),\n\t\tReadHeaderTimeout: 5 * time.Second,\n\t}\n\tif err := srv.ListenAndServe(); err != nil {\n\t\tlog.Error(\"server stopped\", \"err\", err)\n\t\tos.Exit(1)\n\t}\n}",
    "shortRU": "В Go REST API — это обычно хендлеры net/http за роутером, обёрнутые в middleware. С Go 1.22 стандартный ServeMux сопоставляет метод и путь, как в GET /accounts/{id}, а r.PathValue читает id. Маршруты пишут руками или идут от спеки: oapi-codegen или ogen превращает файл OpenAPI в типы, интерфейс сервера и клиентов, а ты реализуешь этот интерфейс. Middleware — функция, которая оборачивает один хендлер в другой. Request id — самый внешний, за ним логирование, потом recover, который обязан ответить 500, потом лимиты и аутентификация, — тогда строка лога покажет 500 вместе с id.",
    "jvmRU": "Spring MVC сопоставляет маршруты через @GetMapping и оборачивает их фильтрами сервлетов и HandlerInterceptor. springdoc строит спеку по коду — это code-first; openapi-generator генерирует интерфейсы контроллеров по спеке — это spec-first. В Go то же разделение, но без аннотаций и сканирования classpath: маршруты регистрируются в коде, а цепочка middleware — обычная композиция функций, которая читается снаружи внутрь.",
    "detailsRU": [
      "Сверх c45: GET совпадает и с HEAD, поэтому ответ 405 несёт Allow: «GET, HEAD». {$} совпадает только с точным путём, {rest...} — с остатком пути, а регистрация двух конфликтующих шаблонов вызывает panic при старте. Собственные тела ответов 404 и 405 у mux — простой текст, не JSON.",
      "Роутеры: chi сохраняет типы net/http, поэтому его хендлеры и middleware — обычные http.Handler, а сверху он добавляет группы маршрутов, вложенные роутеры и пакет middleware. У echo и gin свой тип Context и своя обработка ошибок: хендлер echo возвращает ошибку, хендлер gin записывает её через c.Error. Это удобно, но код привязан к фреймворку.",
      "Spec-first на oapi-codegen: он генерирует серверы для net/http, chi, echo, gin и других; режим strict-server даёт каждой операции типизированные объекты запроса и ответа, а middleware-валидатор на kin-openapi отклоняет запросы, не соответствующие спеке. ogen генерирует собственный роутер, валидацию и кодирование JSON без рефлексии. Сгенерированные файлы руками не правят; шаг CI, который генерирует их заново и падает на расхождении, держит их в синхроне.",
      "Компромиссы: spec-first даёт другим командам контракт раньше кода, клиенты получаются бесплатно, а компилятор сообщает о нереализованной операции. Цена — код в форме, которую диктует генератор, например необязательные поля как указатели или обёртки Opt, и трудности со стримингом и нестандартными эндпоинтами. Code-first даёт полный контроль, но спека, сгенерированная из комментариев или написанная руками, может разойтись с кодом.",
      "Recover: net/http сам перехватывает panic в хендлере, логирует её и закрывает соединение (по HTTP/2 сбрасывает поток): клиент не получает ответа, по HTTP/1.1 он видит EOF. Middleware recover отправляет нормальный 500 с request id; если он только логирует, хендлер возвращается как обычно, и net/http отправляет пустой 200. http.ErrAbortHandler пробрасывают дальше: это просьба тихо оборвать ответ. Если хендлер уже записал заголовок, статус не поменять, а panic в горутине, которую запустил хендлер, не поймает никакой middleware (c45).",
      "Порядок от внешнего: request id — чтобы его видели все слои и лог; логирование и трейсинг — чтобы они измеряли всё внутри, включая 500 от recover; recover; rate limit до аутентификации дёшево отсекает поток запросов, а лимиту по пользователю аутентификация нужна раньше; таймаут — ближе всех к хендлеру. В README chi тот же порядок: RequestID, затем Logger, затем Recoverer. Ошибки домена превращаются в коды в одной функции на границе (c46), а не в middleware. Входящий X-Request-ID принимают только от своего edge, иначе генерируют свой, например через crypto/rand.Text (Go 1.24)."
    ],
    "versionNote": "Сверено по исходникам Go 1.24.7 и 1.27.3: шаблоны маршрутов с методом и {id}, r.PathValue, ответ 405 с Allow («GET, HEAD» — GET совпадает и с HEAD) и panic при конфликте шаблонов не изменились (routing_tree.go совпадает, код 405 тот же); восстановление panic в net/http с закрытием соединения — тоже. Изменилось: редирект на путь со слешем и на очищенный путь — 301 в 1.24.7, 307 в 1.27.3 (запуск: /accounts → /accounts/ даёт 301 и 307). Шаблоны — Go 1.22, crypto/rand.Text — Go 1.24, http.ResponseController и Unwrap — Go 1.20. Вывод в тексте (EOF у клиента без recover, пустой 200 у recover, который только логирует) — из тестов на настоящем сервере (httptest.NewServer) на обеих версиях. Фикстура: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "Routing Enhancements for Go 1.22",
        "url": "https://go.dev/blog/routing-enhancements"
      },
      {
        "title": "net/http: ServeMux — go1.27.3 (redirect 307)",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/net/http/server.go#L2743"
      },
      {
        "title": "net/http: ServeMux — go1.24.7 (redirect 301)",
        "url": "https://github.com/golang/go/blob/go1.24.7/src/net/http/server.go#L2672"
      },
      {
        "title": "oapi-codegen",
        "url": "https://github.com/oapi-codegen/oapi-codegen"
      },
      {
        "title": "ogen: OpenAPI v3 code generator",
        "url": "https://github.com/ogen-go/ogen"
      },
      {
        "title": "chi: router and middleware",
        "url": "https://github.com/go-chi/chi"
      }
    ],
    "practice": {
      "kind": "Расставь middleware по порядку",
      "promptEN": "Order these from the outermost: auth, recover, logging, request id, rate limit. What do the log and the client see for a panicking request if recover only logs the panic, or if recover is moved outside logging?",
      "promptRU": "Расставь от внешнего к внутреннему: auth, recover, logging, request id, rate limit. Что увидят лог и клиент при панике в хендлере, если recover только логирует панику или если recover вынести наружу logging?",
      "pointsEN": [
        "request id → logging → recover → rate limit → auth: every layer and the log line see the id, and logging records the 500 that recover writes; a per-user limit goes after auth.",
        "A recover that only logs lets the handler return: net/http sends an empty 200, and the access log says 200.",
        "With recover outside logging, the panic skips the code after next.ServeHTTP, so the access log loses exactly the failed request; if recover is also outside request id, the X-Request-ID header still goes out, but the body and the panic log line get an empty id, so the client's id matches no log line."
      ],
      "pointsRU": [
        "request id → logging → recover → rate limit → auth: id видят все слои и строка лога, а logging записывает 500, который пишет recover; лимит по пользователю ставят после auth.",
        "Recover, который только логирует, даёт хендлеру вернуться: net/http отправляет пустой 200, и в журнале запросов тоже 200.",
        "Если recover снаружи logging, panic пропускает код после next.ServeHTTP, и журнал запросов теряет как раз упавший запрос; если recover ещё и снаружи request id, заголовок X-Request-ID всё равно уйдёт, но в теле и в строке лога паники id пустой, и id клиента не найти в логах."
      ],
      "followUpEN": "Which panics can no middleware catch, and what does net/http do with a handler panic when there is no recover at all?",
      "followUpRU": "Какие паники не поймает никакой middleware и что делает net/http с паникой в хендлере, если recover нет вообще?"
    },
    "quizIds": []
  },
  {
    "id": "c61",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "When do you choose gRPC over REST, and what does a production gRPC server in Go need?",
    "qRU": "Когда выбирать gRPC вместо REST и что нужно production gRPC-серверу на Go?",
    "shortEN": "Between services inside one system, teams often choose gRPC; REST with JSON stays for browsers, public APIs and HTTP caching. gRPC is RPC over HTTP/2: protoc or buf generates types, server and client code from a .proto contract. It brings a strict contract, binary messages, streaming and deadlines that follow the call chain. In production the server chains interceptors with grpc.ChainUnaryInterceptor: logs, metrics, panic recovery and auth; grpc-go itself does not recover panics. Errors leave as status codes, and the health service answers balancers. GracefulStop may wait forever on a long stream, so after a timeout Stop cancels the rest.",
    "anchorsEN": [
      "inside the system: gRPC · browsers, public APIs, HTTP caching: REST",
      "HTTP/2 + .proto → protoc or buf → types, server, client",
      "strict contract · binary · streaming · deadline follows the chain",
      "ChainUnaryInterceptor: logs, metrics, recovery, auth (grpc-go does not recover)",
      "status codes · health service · GracefulStop + timeout → Stop cancels the rest"
    ],
    "jvmEN": "grpc-java has the same pieces: ServerInterceptor, StatusRuntimeException, and Spring gRPC or grpc-spring-boot-starter to register interceptors as beans. But an uncaught exception there closes only that call with UNKNOWN, while a panic in grpc-go kills the process. And Java keeps the deadline in a gRPC Context bound to the thread; Go carries it in ctx, so a handler that drops ctx also drops the deadline.",
    "detailsEN": [
      "gRPC fits calls between your own services: a shared contract, many small calls, streaming. REST with JSON fits browsers (there gRPC needs gRPC-Web or a gateway), public APIs, HTTP caching and debugging with curl. Many companies keep internal services on REST with OpenAPI code generation and use gRPC only in places; the choice follows the ecosystem.",
      "Code generation: protoc-gen-go writes the message types, protoc-gen-go-grpc the server interface and the client. The server struct embeds UnimplementedXxxServer, so a method added to the .proto still compiles and answers codes.Unimplemented until it is written. buf adds lint and breaking-change checks for .proto files.",
      "Interceptors wrap every call: grpc.ChainUnaryInterceptor for unary calls, grpc.ChainStreamInterceptor for streams; the first one listed is the outermost. grpc-go does not recover panics, so one panicking handler, unary or stream, kills the process with every running call. The example adds recovery to both chains; put it after logging and metrics, so that they record codes.Internal.",
      "Errors: return status.Error(codes.NotFound, \"payment not found\") for expected cases and status.Error(codes.Internal, \"internal error\") for failures, with the cause in the log. A plain error reaches the client as codes.Unknown with its full text, so SQL leaks out. Structured details, for example errdetails.BadRequest, are added with WithDetails on a *status.Status.",
      "Deadlines: the client's deadline travels as the grpc-timeout header with the remaining time; on the server ctx.Deadline() returns it, and ctx is cancelled when it passes. The handler passes ctx to the database and to outgoing calls, so the whole chain stops together. A client call without a deadline can wait forever.",
      "Health: the service from google.golang.org/grpc/health answers Check and Watch for load balancers and Kubernetes gRPC probes. Before the stop, health.Server.Shutdown switches every service to NOT_SERVING, so traffic moves away. Reflection lets grpcurl list services without the .proto; it is a debugging aid and is often off in production.",
      "Stopping: GracefulStop closes the listeners, takes no new RPCs and waits for running ones, including a stream that never ends. Stop closes the connections and cancels the RPC contexts without waiting for handlers. In grpc-go before v1.85.0, though, a Stop called while GracefulStop is already waiting for handlers blocks on the same lock, so the fallback is bounded only if handlers honour ctx; the example calls go srv.Stop() and returns."
    ],
    "practicalRU": "Неделя 7: proto и генерация, gRPC Transfer и GetBalance (w7-mon-1), интерсепторы и перевод ошибок в статусы (w7-tue-1), проговор «REST vs gRPC» (w7-tue-2). Ошибки домена переводят в коды так же, как в HTTP (c46), дедлайн едет в ctx (c22), а остановку сравни с http.Server.Shutdown (c45) и с порядком остановки всего сервиса (c59, w8-tue-1).",
    "code": "// Needs google.golang.org/grpc v1.80.0; the fixture tests serve it over bufconn.\n// Package grpcserver shows what a production gRPC server needs besides the\n// generated code: panic-recovery interceptors, the standard health service\n// and a graceful stop with a time limit.\npackage grpcserver\n\nimport (\n\t\"context\"\n\t\"log/slog\"\n\t\"runtime/debug\"\n\t\"time\"\n\n\t\"google.golang.org/grpc\"\n\t\"google.golang.org/grpc/codes\"\n\t\"google.golang.org/grpc/health\"\n\thealthpb \"google.golang.org/grpc/health/grpc_health_v1\"\n\t\"google.golang.org/grpc/status\"\n)\n\n// New builds a server with interceptors and registers the health service.\n// Logging, metrics, tracing and auth interceptors go into the same chains;\n// the first one listed is the outermost, so recovery goes after logging and\n// metrics and they record codes.Internal.\nfunc New(log *slog.Logger) (*grpc.Server, *health.Server) {\n\tsrv := grpc.NewServer(\n\t\tgrpc.ChainUnaryInterceptor(RecoverUnary(log)),\n\t\tgrpc.ChainStreamInterceptor(RecoverStream(log)),\n\t)\n\ths := health.NewServer() // the overall status \"\" starts as SERVING\n\thealthpb.RegisterHealthServer(srv, hs)\n\treturn srv, hs\n}\n\n// RecoverUnary turns a panic in a unary handler into codes.Internal. grpc-go\n// does not recover panics itself: without this the whole process crashes.\nfunc RecoverUnary(log *slog.Logger) grpc.UnaryServerInterceptor {\n\treturn func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {\n\t\tdefer func() {\n\t\t\tif p := recover(); p != nil {\n\t\t\t\tresp, err = nil, recovered(ctx, log, info.FullMethod, p)\n\t\t\t}\n\t\t}()\n\t\treturn handler(ctx, req)\n\t}\n}\n\n// RecoverStream does the same for streaming handlers, Health/Watch included.\nfunc RecoverStream(log *slog.Logger) grpc.StreamServerInterceptor {\n\treturn func(srv any, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (err error) {\n\t\tdefer func() {\n\t\t\tif p := recover(); p != nil {\n\t\t\t\terr = recovered(ss.Context(), log, info.FullMethod, p)\n\t\t\t}\n\t\t}()\n\t\treturn handler(srv, ss)\n\t}\n}\n\n// recovered logs the panic value and the stack; the client gets a generic text.\nfunc recovered(ctx context.Context, log *slog.Logger, method string, p any) error {\n\tlog.ErrorContext(ctx, \"panic in handler\", \"method\", method, \"panic\", p, \"stack\", string(debug.Stack()))\n\treturn status.Error(codes.Internal, \"internal error\")\n}\n\n// Shutdown marks the server NOT_SERVING, lets running RPCs finish and, after\n// timeout, starts Stop, which cancels the rest. It returns within timeout and\n// reports whether all RPCs finished in time.\nfunc Shutdown(srv *grpc.Server, hs *health.Server, timeout time.Duration) bool {\n\ths.Shutdown()\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tsrv.GracefulStop() // waits for every running RPC, a long stream included\n\t\tclose(done)\n\t}()\n\tt := time.NewTimer(timeout)\n\tdefer t.Stop()\n\tselect {\n\tcase <-done:\n\t\treturn true\n\tcase <-t.C:\n\t\t// Stop closes the connections and cancels the RPC contexts. Before\n\t\t// grpc-go v1.85.0, a Stop called while GracefulStop waits for handlers\n\t\t// blocks on the server lock until they return, so do not wait for it:\n\t\t// the RPCs end only if their handlers honour ctx.\n\t\tgo srv.Stop()\n\t\treturn false\n\t}\n}",
    "shortRU": "Между сервисами внутри одной системы часто выбирают gRPC; REST с JSON остаётся для браузеров, публичных API и кэширования через HTTP. gRPC — это RPC поверх HTTP/2: protoc или buf генерирует типы, код сервера и клиента из контракта .proto. Он даёт строгий контракт, бинарные сообщения, стриминг и дедлайны, которые идут по цепочке вызовов. В production сервер собирает интерсепторы через grpc.ChainUnaryInterceptor: логи, метрики, восстановление после паники и аутентификация; сам grpc-go паники не перехватывает. Ошибки уходят кодами статуса, а health-сервис отвечает балансерам. GracefulStop может вечно ждать долгий стрим, поэтому после таймаута Stop отменяет остальное.",
    "jvmRU": "В grpc-java те же части: ServerInterceptor, StatusRuntimeException, а Spring gRPC или grpc-spring-boot-starter регистрируют интерсепторы как бины. Но необработанное исключение там закрывает только этот вызов с UNKNOWN, а паника в grpc-go роняет процесс. И дедлайн Java хранит в gRPC Context, привязанном к потоку; в Go он едет в ctx, поэтому обработчик, потерявший ctx, теряет и дедлайн.",
    "detailsRU": [
      "gRPC подходит для вызовов между своими сервисами: общий контракт, много мелких вызовов, стриминг. REST с JSON подходит для браузеров (там gRPC нужен gRPC-Web или шлюз), публичных API, кэширования через HTTP и отладки через curl. Многие компании держат внутренние сервисы на REST с кодогенерацией из OpenAPI и берут gRPC точечно; выбор следует за экосистемой.",
      "Кодогенерация: protoc-gen-go пишет типы сообщений, protoc-gen-go-grpc — интерфейс сервера и клиент. Структура сервера встраивает UnimplementedXxxServer, поэтому метод, добавленный в .proto, всё равно компилируется и отвечает codes.Unimplemented, пока его не написали. buf добавляет линтер и проверку несовместимых изменений для файлов .proto.",
      "Интерсепторы оборачивают каждый вызов: grpc.ChainUnaryInterceptor — unary-вызовы, grpc.ChainStreamInterceptor — стримы; первый в списке — самый внешний. grpc-go не перехватывает паники, поэтому один паникующий обработчик, unary или потоковый, роняет процесс со всеми текущими вызовами. Пример добавляет восстановление в обе цепочки; его ставят после логирования и метрик, чтобы они записали codes.Internal.",
      "Ошибки: для ожидаемых случаев — status.Error(codes.NotFound, \"payment not found\"), для сбоев — status.Error(codes.Internal, \"internal error\"), а причина — в лог. Обычная ошибка доходит до клиента как codes.Unknown с полным текстом, и SQL утекает наружу. Структурированные детали, например errdetails.BadRequest, добавляют методом WithDetails у *status.Status.",
      "Дедлайны: дедлайн клиента едет заголовком grpc-timeout с оставшимся временем; на сервере его возвращает ctx.Deadline(), а когда он наступает, ctx отменяется. Обработчик передаёт ctx в базу и в исходящие вызовы, поэтому вся цепочка останавливается вместе. Вызов клиента без дедлайна может ждать вечно.",
      "Health: сервис из google.golang.org/grpc/health отвечает на Check и Watch для балансеров и gRPC-проб Kubernetes. Перед остановкой health.Server.Shutdown переводит все сервисы в NOT_SERVING, и трафик уходит. Reflection позволяет grpcurl увидеть сервисы без .proto; это помощь в отладке, и в production его часто выключают.",
      "Остановка: GracefulStop закрывает листенеры, не берёт новые RPC и ждёт текущие, включая стрим, который не кончается. Stop закрывает соединения и отменяет контексты RPC, не дожидаясь обработчиков. Но в grpc-go до v1.85.0 Stop, вызванный, пока GracefulStop уже ждёт обработчики, блокируется на той же блокировке, поэтому запасной путь ограничен по времени, только если обработчики соблюдают ctx; пример вызывает go srv.Stop() и возвращается."
    ],
    "versionNote": "Проверено на grpc-go v1.80.0 — последней версии, которой хватает Go 1.24: с v1.81.0 модулю нужен go 1.25, с v1.85.0 — go 1.26; go mod tidy записал в go.mod директиву go 1.24.0. grpc.NewClient — с v1.63.0. В v1.80.0 GracefulStop ждёт обработчики, держа блокировку сервера, и Stop, вызванный в это время, ждёт их же; поэтому Shutdown запускает Stop в горутине и возвращается в срок (тест: обработчик игнорирует ctx, у клиента истёк дедлайн). В v1.85.0 блокировку на время ожидания отпускают. Тест регистрирует ServiceDesc вручную вместо сгенерированного кода и поднимает сервер на bufconn. gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "gRPC: Basics tutorial for Go",
        "url": "https://grpc.io/docs/languages/go/basics/"
      },
      {
        "title": "gRPC: Deadlines",
        "url": "https://grpc.io/docs/guides/deadlines/"
      },
      {
        "title": "gRPC: Status codes and their use",
        "url": "https://grpc.io/docs/guides/status-codes/"
      },
      {
        "title": "grpc-go: Server.GracefulStop",
        "url": "https://pkg.go.dev/google.golang.org/grpc#Server.GracefulStop"
      },
      {
        "title": "grpc-go: package health",
        "url": "https://pkg.go.dev/google.golang.org/grpc/health"
      }
    ],
    "practice": {
      "kind": "Найди утечку деталей",
      "promptEN": "A GetBalance handler ends with return nil, status.Errorf(codes.Internal, \"query failed: %v\", err), where err is a PostgreSQL error carrying the SQL text. What does the client see, what is wrong, and what do you log instead?",
      "promptRU": "Обработчик GetBalance заканчивается return nil, status.Errorf(codes.Internal, \"query failed: %v\", err), а err — ошибка PostgreSQL с текстом SQL. Что видит клиент, что не так и что вместо этого пишут в лог?",
      "pointsEN": [
        "The client gets the driver text: table, column and constraint names, sometimes values from the row — internal details, and with personal data a privacy leak.",
        "Log the error once, with the method and the trace ID, and return status.Error(codes.Internal, \"internal error\"); returning the plain err is no better, it becomes codes.Unknown with the same text.",
        "Map the expected cases to codes: no rows → NotFound, a unique violation → AlreadyExists, a context error → status.FromContextError, which gives DeadlineExceeded or Canceled."
      ],
      "pointsRU": [
        "Клиент получает текст драйвера: имена таблиц, колонок и ограничений, иногда значения из строки — внутренние детали, а с персональными данными ещё и утечку.",
        "Ошибку логируют один раз, с методом и trace ID, а возвращают status.Error(codes.Internal, \"internal error\"); вернуть просто err не лучше — он станет codes.Unknown с тем же текстом.",
        "Ожидаемые случаи переводят в коды: нет строк → NotFound, нарушение уникальности → AlreadyExists, ошибка контекста → status.FromContextError, который даёт DeadlineExceeded или Canceled."
      ],
      "followUpEN": "Which codes may a client retry, and why is retrying Transfer dangerous without an idempotency key?",
      "followUpRU": "Какие коды клиенту можно повторять и почему повтор Transfer без ключа идемпотентности опасен?"
    },
    "quizIds": []
  },
  {
    "id": "c62",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "How do you implement long polling in Go so that thousands of waiting clients don't each hammer the database?",
    "qRU": "Как сделать long polling на Go, чтобы тысячи ждущих клиентов не нагружали базу каждый своим запросом?",
    "shortEN": "A mobile app or another service often waits for a payment to change status. With long polling the server holds the request until the state changes or a soft timeout ends it with changed false, and the client asks again. The client sends the version it has seen, so a newer payment is answered at once. Instead of querying per handler, handlers register in a shared registry; one poller goroutine reads all awaited payments in one query per tick and wakes the requests whose payment changed. Over a per-pod limit the server answers 429; WriteTimeout must exceed the soft timeout.",
    "anchorsEN": [
      "a client waits for a payment status to change",
      "hold until change or soft timeout → changed: false → ask again",
      "seen=N: already newer → answer at once",
      "shared registry + one poller: one query per tick",
      "per-pod limit → 429 · WriteTimeout > soft timeout"
    ],
    "jvmEN": "In Spring MVC a long-poll endpoint returns DeferredResult: the servlet thread goes back to the pool, and another thread completes the response later; a WebAsyncTask or Callable would still hold an executor thread while it waits. In Go a goroutine per request is cheap, so the handler simply blocks in select. Either way only the waiting is cheap: without a shared poller or event source every waiting request turns into its own database loop.",
    "detailsEN": [
      "Choosing the transport: short polling is the simplest, but most requests come back empty and a change waits up to one interval. Long polling is plain HTTP, so it passes balancers, proxies and mobile networks. SSE and WebSocket keep one connection open and push many events; webhooks reverse the direction and suit servers that can accept calls. RFC 6202 calls 30 seconds a safer hold time than longer ones, because intermediaries cut long requests.",
      "The version marker keeps the server stateless and the answer honest: the server compares versions instead of catching the moment of change. A change made before the request registered is still newer than seen, so it is not lost. If a replica lags, the poller reads the old version, the request keeps waiting, and the client never gets old data reported as new.",
      "The registry: Register returns a channel with capacity 1 and a cancel func. Notify sends at most once per waiter and removes it under the mutex, so the send never blocks. The handler waits in select on that channel, a timer and r.Context().Done(); the deferred cancel frees the slot and the entry when the client leaves.",
      "Load: the poller asks for every awaited ID in one query, WHERE id = ANY($1), split into chunks of, say, 1,000 IDs. An event, such as a Kafka message or PostgreSQL LISTEN/NOTIFY, can call Notify right away; a slow poll stays as a safety net for lost events.",
      "Limits and timeouts: the per-pod cap answers 429 with Retry-After before any database read; without it memory, goroutines and connections grow with the clients. http.Server.WriteTimeout runs from the moment the request headers are read, so it must exceed the soft timeout, or the server drops the response and the client sees EOF. http.NewResponseController(w).SetWriteDeadline (Go 1.20) moves the deadline for one route.",
      "Shutdown and herds: http.Server.Shutdown waits for active requests, and a held request stays active up to the soft timeout. On shutdown, answer every waiter with changed false, for example from a channel closed in RegisterOnShutdown, so that clients reconnect to another pod. Add jitter to the soft timeout, so thousands of clients do not come back in the same second."
    ],
    "practicalRU": "Неделя 10, системный дизайн: дизайн 2 «Payments / ledger» (w10-wed-1) — как клиент узнаёт итог перевода, и дизайн 3 «Notification service» (w10-thu-1) — long polling против SSE, WebSocket и вебхуков. Отмена через r.Context() — в c22, таймауты сервера — в c45.",
    "code": "// Fragment of the fixture: the registry, one poller step and the handler.\n// remove, IDs, Len, RunPoller and writeJSON are omitted.\npackage longpoll\n\n// State is what the client sees; Version grows on every change.\ntype State struct {\n\tVersion int64  `json:\"version\"`\n\tStatus  string `json:\"status\"`\n}\n\n// Store reads several payments in one query, for example\n// SELECT id, version, status FROM payments WHERE id = ANY($1).\ntype Store interface {\n\tStates(ctx context.Context, ids []string) (map[string]State, error)\n}\n\nvar ErrTooManyWaiters = errors.New(\"too many waiting requests\")\n\ntype waiter struct {\n\tseen int64\n\tch   chan State\n}\n\n// Waiters is the registry of requests waiting on this pod.\ntype Waiters struct {\n\tmu    sync.Mutex\n\tbyID  map[string]map[*waiter]struct{}\n\tn     int\n\tlimit int\n}\n\nfunc NewWaiters(limit int) *Waiters {\n\treturn &Waiters{byID: make(map[string]map[*waiter]struct{}), limit: limit}\n}\n\n// Register adds a request that has already seen version seen of payment id.\n// The channel (capacity 1) receives one newer state; cancel removes the\n// request and may be called more than once.\nfunc (w *Waiters) Register(id string, seen int64) (<-chan State, func(), error) {\n\tw.mu.Lock()\n\tdefer w.mu.Unlock()\n\tif w.n >= w.limit {\n\t\treturn nil, nil, ErrTooManyWaiters\n\t}\n\twt := &waiter{seen: seen, ch: make(chan State, 1)}\n\tif w.byID[id] == nil {\n\t\tw.byID[id] = make(map[*waiter]struct{})\n\t}\n\tw.byID[id][wt] = struct{}{}\n\tw.n++\n\treturn wt.ch, func() { w.remove(id, wt) }, nil\n}\n\n// Notify wakes and removes the requests that have not seen st yet. Requests\n// that already saw this version, for example from a lagging replica, wait on.\nfunc (w *Waiters) Notify(id string, st State) {\n\tw.mu.Lock()\n\tdefer w.mu.Unlock()\n\tfor wt := range w.byID[id] {\n\t\tif st.Version > wt.seen {\n\t\t\twt.ch <- st // never blocks: the only send, into an empty buffer of 1\n\t\t\tw.removeLocked(id, wt)\n\t\t}\n\t}\n}\n\n// Poll reads every awaited payment with one query and wakes the waiters.\nfunc Poll(ctx context.Context, w *Waiters, store Store) error {\n\tids := w.IDs()\n\tif len(ids) == 0 {\n\t\treturn nil\n\t}\n\tstates, err := store.States(ctx, ids)\n\tif err != nil {\n\t\treturn err\n\t}\n\tfor id, st := range states {\n\t\tw.Notify(id, st)\n\t}\n\treturn nil\n}\n\n// Handler serves GET /payments/{id}/wait?seen=N.\ntype Handler struct {\n\tWaiters     *Waiters\n\tStore       Store\n\tSoftTimeout time.Duration // below the server's WriteTimeout\n\tLog         *slog.Logger\n}\n\ntype waitResponse struct {\n\tChanged bool   `json:\"changed\"`\n\tVersion int64  `json:\"version,omitempty\"`\n\tStatus  string `json:\"status,omitempty\"`\n}\n\nfunc (h *Handler) Routes(mux *http.ServeMux) {\n\tmux.HandleFunc(\"GET /payments/{id}/wait\", h.wait)\n}\n\nfunc (h *Handler) wait(w http.ResponseWriter, r *http.Request) {\n\tid := r.PathValue(\"id\")\n\tseen, err := strconv.ParseInt(r.URL.Query().Get(\"seen\"), 10, 64)\n\tif err != nil || seen < 0 {\n\t\thttp.Error(w, \"seen must be a non-negative integer\", http.StatusBadRequest)\n\t\treturn\n\t}\n\t// Reject before touching the database when the pod is full.\n\tupdates, cancel, err := h.Waiters.Register(id, seen)\n\tif err != nil {\n\t\tw.Header().Set(\"Retry-After\", \"1\")\n\t\thttp.Error(w, err.Error(), http.StatusTooManyRequests)\n\t\treturn\n\t}\n\tdefer cancel()\n\n\tstates, err := h.Store.States(r.Context(), []string{id})\n\tif err != nil {\n\t\tif r.Context().Err() == nil {\n\t\t\th.Log.Error(\"read payment\", \"id\", id, \"err\", err)\n\t\t\thttp.Error(w, \"internal error\", http.StatusInternalServerError)\n\t\t}\n\t\treturn\n\t}\n\tst, ok := states[id]\n\tif !ok {\n\t\thttp.NotFound(w, r)\n\t\treturn\n\t}\n\tif st.Version > seen { // already newer: answer at once\n\t\twriteJSON(w, waitResponse{Changed: true, Version: st.Version, Status: st.Status})\n\t\treturn\n\t}\n\n\ttimer := time.NewTimer(h.SoftTimeout)\n\tdefer timer.Stop()\n\tselect {\n\tcase st := <-updates:\n\t\twriteJSON(w, waitResponse{Changed: true, Version: st.Version, Status: st.Status})\n\tcase <-timer.C:\n\t\twriteJSON(w, waitResponse{Changed: false}) // the client asks again\n\tcase <-r.Context().Done():\n\t\t// The client went away; the deferred cancel removes the registration.\n\t}\n}\n\n// NewServer keeps WriteTimeout above the soft timeout: when WriteTimeout\n// expires first, the server cannot write the response and drops it.\nfunc NewServer(addr string, h http.Handler, softTimeout time.Duration) *http.Server {\n\treturn &http.Server{\n\t\tAddr:              addr,\n\t\tHandler:           h,\n\t\tReadHeaderTimeout: 5 * time.Second,\n\t\tWriteTimeout:      softTimeout + 10*time.Second,\n\t\tIdleTimeout:       60 * time.Second,\n\t}\n}",
    "shortRU": "Мобильное приложение или другой сервис часто ждёт, когда платёж сменит статус. При long polling сервер держит запрос, пока состояние не изменится или мягкий таймаут не завершит его ответом changed false, и клиент спрашивает снова. Клиент присылает версию, которую уже видел, поэтому на более новый платёж сервер отвечает сразу. Вместо запросов из каждого обработчика обработчики регистрируются в общем реестре; одна горутина-поллер одним запросом за такт читает все ожидаемые платежи и будит запросы, чей платёж изменился. Сверх лимита на под сервер отвечает 429, а WriteTimeout должен быть больше мягкого таймаута.",
    "jvmRU": "В Spring MVC эндпоинт long polling возвращает DeferredResult: поток сервлета возвращается в пул, а ответ позже завершает другой поток; WebAsyncTask или Callable всё равно заняли бы поток исполнителя на время ожидания. В Go горутина на запрос дешёвая, поэтому обработчик просто блокируется в select. В обоих случаях дёшево только ожидание: без общего поллера или источника событий каждый ждущий запрос превращается в свой цикл запросов к базе.",
    "detailsRU": [
      "Выбор транспорта: short polling проще всего, но большинство ответов пустые, а изменение ждёт до одного интервала. Long polling — обычный HTTP, поэтому проходит через балансеры, прокси и мобильные сети. SSE и WebSocket держат одно соединение и присылают много событий; вебхуки меняют направление и подходят серверам, которые могут принимать вызовы. RFC 6202 называет 30 секунд более безопасным временем удержания, чем большие значения, потому что промежуточные узлы обрывают долгие запросы.",
      "Маркер версии делает сервер stateless, а ответ честным: сервер сравнивает версии, а не ловит момент изменения. Изменение, случившееся до регистрации запроса, всё равно новее seen, поэтому не теряется. Если реплика отстаёт, поллер читает старую версию, запрос ждёт дальше, и клиент не получит старые данные под видом новых.",
      "Реестр: Register возвращает канал ёмкостью 1 и функцию снятия. Notify отправляет каждому ожидающему не больше одного раза и снимает его под мьютексом, поэтому отправка не блокируется. Обработчик ждёт в select на этом канале, таймере и r.Context().Done(); отложенная функция снятия освобождает место и запись, когда клиент уходит.",
      "Нагрузка: поллер одним запросом спрашивает все ожидаемые ID, WHERE id = ANY($1), разбивая их на пачки, скажем, по 1 000. Событие, например сообщение Kafka или LISTEN/NOTIFY в PostgreSQL, может вызвать Notify сразу; медленный опрос остаётся страховкой на случай потерянных событий.",
      "Лимиты и таймауты: лимит на под отвечает 429 с Retry-After ещё до чтения из базы; без него память, горутины и соединения растут вместе с числом клиентов. http.Server.WriteTimeout отсчитывается с момента чтения заголовков запроса, поэтому должен быть больше мягкого таймаута, иначе сервер сбросит ответ и клиент увидит EOF. http.NewResponseController(w).SetWriteDeadline (Go 1.20) сдвигает дедлайн для одного маршрута.",
      "Остановка и толпа: http.Server.Shutdown ждёт активные запросы, а удерживаемый запрос активен до мягкого таймаута. При остановке всем ожидающим отвечают changed false, например по каналу, закрытому в RegisterOnShutdown, чтобы клиенты переподключились к другому поду. К мягкому таймауту добавляют случайный разброс, чтобы тысячи клиентов не вернулись в одну и ту же секунду."
    ],
    "versionNote": "Шаблоны ServeMux с методом и {id} и r.PathValue — Go 1.22; http.ResponseController — Go 1.20. Описание WriteTimeout, а также шаблоны и сопоставление маршрутов ServeMux в исходниках net/http Go 1.24.7 и 1.27.3 совпадают. Фикстура проверена: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3; при WriteTimeout короче мягкого таймаута клиент на обеих версиях получает EOF.",
    "sources": [
      {
        "title": "RFC 6202: Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP",
        "url": "https://www.rfc-editor.org/rfc/rfc6202"
      },
      {
        "title": "Package net/http: Server (WriteTimeout)",
        "url": "https://pkg.go.dev/net/http#Server"
      },
      {
        "title": "Package net/http: ResponseController.SetWriteDeadline",
        "url": "https://pkg.go.dev/net/http#ResponseController.SetWriteDeadline"
      },
      {
        "title": "Go blog: Routing Enhancements for Go 1.22",
        "url": "https://go.dev/blog/routing-enhancements"
      },
      {
        "title": "MDN: Server-sent events",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events"
      }
    ],
    "practice": {
      "kind": "Оцени нагрузку",
      "promptEN": "5,000 clients wait for a payment status, and each handler runs its own SELECT every 100 ms until the status changes. How many queries per second reach the database, and how do you redesign it?",
      "promptRU": "5 000 клиентов ждут статус платежа, и каждый обработчик сам делает SELECT раз в 100 мс, пока статус не сменится. Сколько запросов в секунду приходит в базу и как это переделать?",
      "pointsEN": [
        "5,000 × 10 = 50,000 SELECTs per second, almost all returning the same row; the load grows with the number of waiting clients, not with the number of changes.",
        "One poller per pod: every 100 ms one query with WHERE id = ANY($1) for all awaited IDs is 10 queries per second per pod; with 10 pods, 100.",
        "Add the first read of every request: with a 20-second soft timeout the 5,000 clients come back about 250 times per second, so 250 single-row reads; the per-pod waiter limit with 429 caps the rest."
      ],
      "pointsRU": [
        "5 000 × 10 = 50 000 SELECT в секунду, и почти все возвращают ту же строку; нагрузка растёт с числом ждущих клиентов, а не с числом изменений.",
        "Один поллер на под: раз в 100 мс один запрос с WHERE id = ANY($1) по всем ожидаемым ID — это 10 запросов в секунду на под; при 10 подах — 100.",
        "Плюс первое чтение каждого запроса: при мягком таймауте 20 секунд 5 000 клиентов возвращаются примерно 250 раз в секунду, то есть 250 чтений одной строки; лимит ожидающих на под и 429 ограничивают остальное."
      ],
      "followUpEN": "How do you wake the waiters on a change without polling at all, and why keep a slow poll anyway?",
      "followUpRU": "Как будить ожидающих при изменении совсем без опроса и зачем всё равно оставить медленный опрос?"
    },
    "quizIds": []
  },
  {
    "id": "c63",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "Which channel patterns do you actually use in a Go service, and who closes each channel?",
    "qRU": "Какие паттерны на каналах реально нужны в Go-сервисе и кто закрывает каждый канал?",
    "shortEN": "A Go service needs a few channel patterns, and each channel has one owner on the sending side. The owner closes it only when receivers must know the end; then their range loops stop. In a worker pool, the producer closes the job channel; whoever waits for workers closes results. Pipeline stages close their outputs when inputs close, and every send sits in a select with ctx.Done(). A semaphore, make(chan struct{}, n), bounds concurrent work; with select and default, a handler answers 429 at once. A signal channel of capacity one merges changes into one wake-up; these two stay open.",
    "anchorsEN": [
      "one owner on the sending side: closes after the last send, only if receivers need the end",
      "pool: producer closes jobs; whoever waits for workers closes results",
      "pipeline: close cascades; every send in a select with ctx.Done()",
      "semaphore make(chan struct{}, n): select + default → 429",
      "signal channel of capacity 1: many changes, one wake-up; both stay open"
    ],
    "jvmEN": "In Java you take these from java.util.concurrent: an ExecutorService with a bounded queue as the pool, a Semaphore for limits, a BlockingQueue between stages. Kotlin coroutines add Channel and structured concurrency: a scope cancels its children and waits for them, and produce closes its channel when the coroutine completes. Go has no built-in structured concurrency: the author decides who owns each goroutine and who closes each channel, and errgroup comes closest to a coroutine scope.",
    "detailsEN": [
      "Ownership. close(ch) records that no more values will be sent: it is a message to receivers, not a cleanup, and a channel nobody closes is collected like any unreachable value. Close only when receivers need to know the end. With several senders none of them closes: a coordinator waits for all of them with a WaitGroup and then closes, or the senders stop by ctx and the channel stays open. A send on a closed channel panics, and so does a second close or closing a nil channel.",
      "Worker pool (practice W3-1). Workers range over the job channel and exit when it is closed and drained; one goroutine calls wg.Wait() and then close(results). Size the pool by the resource behind it: database connections, a partner's rate limit, or the number of live instances of an external system, one worker each. errgroup.WithContext with SetLimit gives the same bound plus cancellation on the first error (W4-1); inside, SetLimit is a buffered channel, and TryGo is a select with default.",
      "Pipeline (go.dev/blog/pipelines, practice W3-2). Closing cascades down: when the source closes, each stage's range ends and it closes its own output. Cancellation goes up: the consumer cancels ctx, and a stage blocked on a send leaves through ctx.Done(). If an input belongs to someone who may never close it, put the receive in the select too. A closed final output does not mean every stage has exited: the owner waits for all of them, for example with errgroup.",
      "Semaphore. A buffered channel is the simplest one; golang.org/x/sync/semaphore adds weights, Acquire(ctx, n), which waits but can be cancelled, and TryAcquire(n), which never waits. In an HTTP handler, rejecting at once is usually better than waiting: a waiting request still holds its goroutine, its memory and the client's timeout, and under overload a queue only adds latency (Little's law, c13). 429 with Retry-After tells the client to back off.",
      "Signal channel. The sender stores the new state first and then tries a non-blocking send; if a signal is already pending, it skips the send, because the receiver will read the state after that signal anyway. So the receiver never misses the latest state, the sender never blocks, and many changes cost one wake-up; intermediate values are skipped. One signal wakes one receiver: give each receiver its own channel. Uses: a config reload, waking the outbox relay before its next tick, cache invalidation. sync.Cond does a similar job (c56) but cannot be a case in a select with ctx.Done().",
      "Common bugs. A goroutine per message without a limit: memory grows with load, and the downstream service gets all of it at once. An unbuffered error channel whose reader has left on a timeout: the goroutine blocks on its send forever (c12); a buffer of one or a select with ctx.Done() fixes it. A stage without ctx.Done() in its select hangs after cancellation. A receiver that closes the channel makes the next send panic."
    ],
    "practicalRU": "Неделя 3: практикум W3-1 (пул воркеров) и W3-2 (конвейер) — тот же контракт закрытия. Неделя 4: W4-1 ParallelFetch — errgroup.WithContext и SetLimit. Неделя 6, среда: relay-воркер outbox — одна горутина, у которой есть владелец, остановка по ctx и ретраи; разбудить его раньше тикера можно сигнальным каналом ёмкостью 1.",
    "code": "// Package chanpatterns shows three channel patterns of a Go service: a signal\n// channel that merges changes, a semaphore that rejects at once, and a\n// pipeline whose stages close their outputs in a cascade.\npackage chanpatterns\n\nimport (\n\t\"context\"\n\t\"net/http\"\n\t\"sync\"\n)\n\n// Latest holds the newest state and wakes one consumer when it changes.\n// Changes made before the consumer wakes up merge into one signal.\ntype Latest[T any] struct {\n\tmu      sync.Mutex\n\tv       T\n\tchanged chan struct{} // capacity 1; never closed, the consumer stops by its ctx\n}\n\nfunc NewLatest[T any](v T) *Latest[T] {\n\treturn &Latest[T]{v: v, changed: make(chan struct{}, 1)}\n}\n\n// Set stores v first and signals second, so a woken consumer reads v or newer.\nfunc (l *Latest[T]) Set(v T) {\n\tl.mu.Lock()\n\tl.v = v\n\tl.mu.Unlock()\n\tselect {\n\tcase l.changed <- struct{}{}:\n\tdefault: // a signal is already pending: the consumer will read v anyway\n\t}\n}\n\nfunc (l *Latest[T]) Changed() <-chan struct{} { return l.changed }\n\nfunc (l *Latest[T]) Get() T {\n\tl.mu.Lock()\n\tdefer l.mu.Unlock()\n\treturn l.v\n}\n\n// Limit lets at most n requests run next at the same time. Request n+1\n// gets 429 at once instead of waiting in a queue it would time out in.\nfunc Limit(n int, next http.Handler) http.Handler {\n\tslots := make(chan struct{}, n)\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tselect {\n\t\tcase slots <- struct{}{}:\n\t\t\tdefer func() { <-slots }()\n\t\t\tnext.ServeHTTP(w, r)\n\t\tdefault:\n\t\t\tw.Header().Set(\"Retry-After\", \"1\")\n\t\t\thttp.Error(w, \"too many requests\", http.StatusTooManyRequests)\n\t\t}\n\t})\n}\n\n// Emit sends items in order. Only Emit sends to its output, so only Emit\n// closes it: after the last item, or as soon as ctx is cancelled.\nfunc Emit[T any](ctx context.Context, items []T) <-chan T {\n\tout := make(chan T)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor _, v := range items {\n\t\t\tselect {\n\t\t\tcase out <- v:\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}\n\n// Map sends f(v) for every v from in and closes its output when in is\n// closed, so closing cascades down the pipeline. The sender of in must\n// close it on cancellation too, as Emit does. The send sits in a select\n// with ctx.Done: without it a stage whose consumer has left hangs forever.\nfunc Map[In, Out any](ctx context.Context, in <-chan In, f func(In) Out) <-chan Out {\n\tout := make(chan Out)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor v := range in {\n\t\t\tselect {\n\t\t\tcase out <- f(v):\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}",
    "shortRU": "Go-сервису хватает нескольких паттернов на каналах, и у каждого канала один владелец на стороне отправки. Владелец закрывает канал, только если читателям нужно узнать о конце; тогда их циклы range останавливаются. В пуле воркеров канал задач закрывает источник, а канал результатов — тот, кто дождался воркеров. Стадии конвейера закрывают свой выход, когда закрылся вход, и каждая отправка стоит в select с ctx.Done(). Семафор make(chan struct{}, n) ограничивает число одновременных работ; с select и default обработчик сразу отвечает 429. Сигнальный канал ёмкостью один склеивает изменения в одно пробуждение; эти два канала не закрывают.",
    "jvmRU": "В Java всё это берут из java.util.concurrent: ExecutorService с ограниченной очередью как пул, Semaphore для лимитов, BlockingQueue между стадиями. Корутины Kotlin добавляют Channel и структурную конкурентность: scope отменяет дочерние корутины и дожидается их, а produce закрывает свой канал, когда корутина завершилась. Встроенной структурной конкурентности в Go нет: автор кода сам решает, кто владеет каждой горутиной и кто закрывает каждый канал, а ближе всего к scope корутин — errgroup.",
    "detailsRU": [
      "Владение. close(ch) фиксирует, что значений больше не будет: это сообщение читателям, а не освобождение ресурса, и канал, который никто не закрыл, собирается сборщиком мусора, как любое недостижимое значение. Закрывай, только если читателям нужно узнать о конце. Если отправителей несколько, не закрывает ни один: координатор дожидается всех через WaitGroup и тогда закрывает, или отправители останавливаются по ctx, а канал остаётся открытым. Отправка в закрытый канал вызывает panic, как и повторный close или close nil-канала.",
      "Пул воркеров (практикум W3-1). Воркеры читают канал задач через range и выходят, когда он закрыт и пуст; одна горутина вызывает wg.Wait(), а потом close(results). Размер пула выбирают по ресурсу за ним: соединения с базой, лимит запросов партнёра или число живых экземпляров внешней системы, по воркеру на каждый. errgroup.WithContext с SetLimit даёт тот же лимит плюс отмену при первой ошибке (W4-1); внутри SetLimit — буферизованный канал, а TryGo — select с default.",
      "Конвейер (go.dev/blog/pipelines, практикум W3-2). Закрытие идёт вниз каскадом: когда закрылся источник, range каждой стадии заканчивается, и она закрывает свой выход. Отмена идёт вверх: потребитель отменяет ctx, и стадия, заблокированная на отправке, выходит через ctx.Done(). Если вход принадлежит тому, кто может его так и не закрыть, приём тоже ставят в select. Закрытый последний выход не значит, что вышли все стадии: владелец дожидается всех, например через errgroup.",
      "Семафор. Проще всего — буферизованный канал; golang.org/x/sync/semaphore добавляет веса, Acquire(ctx, n), который ждёт, но отменяется, и TryAcquire(n), который не ждёт никогда. В HTTP-обработчике сразу отказать обычно лучше, чем ждать: ожидающий запрос всё равно держит горутину, память и таймаут клиента, а при перегрузке очередь только добавляет задержку (закон Литтла, c13). 429 с Retry-After говорит клиенту отступить.",
      "Сигнальный канал. Отправитель сначала сохраняет новое состояние, потом пробует неблокирующую отправку; если сигнал уже ждёт, он отправку пропускает, потому что получатель всё равно прочитает состояние после этого сигнала. Так получатель не пропустит последнее состояние, отправитель не блокируется, а много изменений стоят одного пробуждения; промежуточные значения пропускаются. Один сигнал будит одного получателя: каждому получателю — свой канал. Применения: перечитать конфиг, разбудить relay outbox раньше следующего тика, сбросить кэш. sync.Cond решает похожую задачу (c56), но не может быть веткой select с ctx.Done().",
      "Частые ошибки. Горутина на каждое сообщение без лимита: память растёт с нагрузкой, а нижестоящий сервис получает её всю сразу. Небуферизованный канал ошибок, читатель которого ушёл по таймауту: горутина навсегда зависает на отправке (c12); помогает буфер на один элемент или select с ctx.Done(). Стадия без ctx.Done() в select зависает после отмены. Читатель, закрывший канал, обрекает следующую отправку на panic."
    ],
    "versionNote": "Правила close и отправки в закрытый канал сверены по спецификации Go 1.24.7 и 1.27.3 — они одинаковы. SetLimit и TryGo из golang.org/x/sync/errgroup устроены одинаково в v0.19.0 и v0.24.0. Пример: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3; дженерики — Go 1.18+.",
    "sources": [
      {
        "title": "Go Concurrency Patterns: Pipelines and cancellation",
        "url": "https://go.dev/blog/pipelines"
      },
      {
        "title": "Go specification: Send statements",
        "url": "https://go.dev/ref/spec#Send_statements"
      },
      {
        "title": "Go specification: Close",
        "url": "https://go.dev/ref/spec#Close"
      },
      {
        "title": "Package golang.org/x/sync/errgroup",
        "url": "https://pkg.go.dev/golang.org/x/sync/errgroup"
      },
      {
        "title": "Package golang.org/x/sync/semaphore",
        "url": "https://pkg.go.dev/golang.org/x/sync/semaphore"
      }
    ],
    "practice": {
      "kind": "Найди зависшую горутину",
      "promptEN": "Fetch starts a goroutine that sends the result of call(ctx) into an unbuffered errCh, then selects on errCh and time.After(1 * time.Second). Under load, call takes three seconds. What happens on each timeout, and how do you fix it?",
      "promptRU": "Fetch запускает горутину, которая отправляет результат call(ctx) в небуферизованный errCh, а потом делает select на errCh и time.After(1 * time.Second). Под нагрузкой call идёт три секунды. Что происходит при каждом таймауте и как это исправить?",
      "pointsEN": [
        "Fetch returns a timeout error and nobody reads errCh again; when call finishes, the goroutine blocks on its send forever: one leaked goroutine per timed-out request.",
        "time.After stops only the waiting: call keeps running and holds its connection, because nothing cancelled its ctx.",
        "Fix: make(chan error, 1), so the single send completes, and context.WithTimeout passed into call, so the work stops too; if call respects ctx, the goroutine is not needed: return call(ctx)."
      ],
      "pointsRU": [
        "Fetch возвращает ошибку таймаута, и errCh больше никто не читает; когда call закончится, горутина навсегда зависнет на отправке: одна утёкшая горутина на каждый запрос с таймаутом.",
        "time.After прекращает только ожидание: call продолжает работать и держит соединение, потому что его ctx никто не отменил.",
        "Исправление: make(chan error, 1), чтобы единственная отправка завершилась, и context.WithTimeout, переданный в call, чтобы остановилась и работа; если call соблюдает ctx, горутина вообще не нужна: return call(ctx)."
      ],
      "followUpEN": "How would you find these goroutines in a running service?",
      "followUpRU": "Как найти такие горутины в работающем сервисе?"
    },
    "quizIds": []
  },
  {
    "id": "c64",
    "mod": "m9",
    "modName": "9. Go Service Architecture: Layout, DI, APIs, Concurrency",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "Which libraries make up a typical Go backend service, and why those?",
    "qRU": "Из каких библиотек обычно собирают Go-бэкенд и почему именно из них?",
    "shortEN": "A Go backend is usually not one framework like Spring but a set of small libraries around the standard library. The rule: standard library first, and a dependency only for a concrete need, since each one adds updates and vulnerabilities. A typical set is net/http or chi, pgx with pgxpool, sqlc or a query builder instead of an ORM, goose migrations, slog, OpenTelemetry and Prometheus, and franz-go or sarama for Kafka. Gaps are filled by golang.org/x packages: singleflight merges concurrent cache misses into one load. Choose by maintenance, net/http and context support, API stability and license, and check with govulncheck.",
    "anchorsEN": [
      "no single framework: small libraries around the standard library",
      "standard library first; a dependency only for a concrete need",
      "net/http or chi · pgx + pgxpool · sqlc or a builder, not an ORM · goose · slog · OTel + Prometheus · franz-go or sarama",
      "golang.org/x fills gaps: singleflight merges concurrent misses",
      "choose: maintained, net/http + context, stable API, license, govulncheck"
    ],
    "jvmEN": "In Java and Kotlin the stack comes from Spring Boot: starters for web, data, Kafka and actuator, with versions aligned by the Boot dependency management. In Go each layer is chosen separately and wired by hand in main, so an interviewer asks why this library and not another, and expects the trade-off, not just the name.",
    "detailsEN": [
      "HTTP and API contracts. Since Go 1.22 net/http matches methods and {id} wildcards, so many services need no router (c45). chi stays on net/http: handlers are http.Handler, and middleware is func(http.Handler) http.Handler. Gin and Echo pass their own Context type, which ties every handler to the framework. From an OpenAPI spec, oapi-codegen or ogen generate types and server interfaces; for gRPC, grpc-go with protobuf, and buf to lint the .proto files and run code generation.",
      "PostgreSQL. pgx is a pure Go PostgreSQL driver: pgxpool is its connection pool, and its native interface supports COPY, LISTEN/NOTIFY and batches; pgx/v5/stdlib makes it a database/sql driver where a library needs *sql.DB (c47). On top of it: sqlc generates typed Go code from SQL queries and the schema, and squirrel or goqu build dynamic queries; pgx.CollectRows with RowToStructByName scans rows into structs, the job sqlx is often taken for. sqlx, squirrel and goqu are stable but rarely updated. GORM is less common in payment services: explicit SQL is easier to review and to check with EXPLAIN (c54). Migrations: goose or golang-migrate.",
      "Kafka, Redis, cache. franz-go is written in pure Go and aims to cover every Kafka feature; IBM/sarama is the former Shopify/sarama; segmentio/kafka-go has a simpler API (mind how ReadMessage commits, c53); confluent-kafka-go wraps the C library librdkafka through cgo. Redis: go-redis, github.com/redis/go-redis/v9. In-process cache with eviction and limits: ristretto or ccache. singleflight stops a stampede of identical loads after a miss.",
      "Logs, metrics, resilience. log/slog has been in the standard library since Go 1.21 (c48); zap is older and very fast, and its experimental zapslog package lets slog calls write through zap. Traces and metrics: OpenTelemetry; /metrics: prometheus/client_golang. Retries with exponential backoff and jitter: cenkalti/backoff; rate limits: golang.org/x/time/rate, a token bucket (W4-2); circuit breaker: sony/gobreaker.",
      "Config, tests, money. Config comes from environment variables, read with koanf, or with envconfig, which is small and rarely updated. Tests: testing plus testify for assertions; mocks with go.uber.org/mock (mockgen), the maintained fork after golang/mock was archived in 2023; testcontainers-go starts real PostgreSQL and Kafka in Docker. testing/synctest, for code with timers, is experimental in Go 1.24 and stable from 1.25 (c38). Money: int64 in minor units or shopspring/decimal, never float64; IDs: google/uuid.",
      "How to choose. Look at recent releases and how issues get answered, support for net/http and context.Context, the license, and the major version: from v2 it is part of the import path, as in pgx/v5, so a breaking change comes with a new path. A new release can raise your minimum Go version: golang.org/x/sync v0.20.0 requires Go 1.25. govulncheck narrows its report to vulnerable functions that your code can reach. In the 2025 Go Developer Survey, finding reliable modules was one of the top three frustrations (26%)."
    ],
    "practicalRU": "Неделя 5, среда: pgx/pgxpool и миграции goose или golang-migrate; четверг: slog (c48) и конфиг из переменных окружения. Неделя 8, среда: README с компромиссами — туда же ответы «почему эта библиотека», по две-три фразы на каждую.",
    "code": "// Package cache shows golang.org/x/sync/singleflight filling a gap in the\n// standard library: concurrent cache misses for one key cause one load.\npackage cache\n\nimport (\n\t\"context\"\n\t\"fmt\"\n\t\"sync\"\n\t\"time\"\n\n\t\"golang.org/x/sync/singleflight\"\n)\n\ntype LoadFunc func(ctx context.Context, key string) (int64, error)\n\n// Cache keeps loaded values in memory. It never evicts: in a service that\n// job goes to a library such as ristretto or to Redis.\ntype Cache struct {\n\tload    LoadFunc\n\ttimeout time.Duration\n\tgroup   singleflight.Group\n\n\tmu    sync.Mutex\n\titems map[string]int64\n}\n\nfunc New(load LoadFunc, timeout time.Duration) *Cache {\n\treturn &Cache{load: load, timeout: timeout, items: make(map[string]int64)}\n}\n\n// Get returns the cached value or loads it. Concurrent misses for one key\n// share one load; a caller whose ctx ends stops waiting, and the load goes on.\nfunc (c *Cache) Get(ctx context.Context, key string) (int64, error) {\n\tif v, ok := c.cached(key); ok {\n\t\treturn v, nil\n\t}\n\tch := c.group.DoChan(key, func() (any, error) {\n\t\tif v, ok := c.cached(key); ok { // a load that has just finished stored it\n\t\t\treturn v, nil\n\t\t}\n\t\t// The load is shared, so one caller leaving must not cancel it for the rest.\n\t\tlctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), c.timeout)\n\t\tdefer cancel()\n\t\tv, err := c.load(lctx, key)\n\t\tif err != nil {\n\t\t\treturn nil, err // the current waiters get it; nothing is cached\n\t\t}\n\t\tc.mu.Lock()\n\t\tc.items[key] = v\n\t\tc.mu.Unlock()\n\t\treturn v, nil\n\t})\n\tselect {\n\tcase r := <-ch:\n\t\tif r.Err != nil {\n\t\t\treturn 0, fmt.Errorf(\"load %q: %w\", key, r.Err)\n\t\t}\n\t\treturn r.Val.(int64), nil\n\tcase <-ctx.Done():\n\t\treturn 0, ctx.Err() // ch has a buffer of one, so the load never blocks on us\n\t}\n}\n\nfunc (c *Cache) cached(key string) (int64, bool) {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tv, ok := c.items[key]\n\treturn v, ok\n}",
    "shortRU": "Go-бэкенд обычно собирают не на одном фреймворке вроде Spring, а из небольших библиотек вокруг стандартной. Правило: сначала стандартная библиотека, а зависимость — только под конкретную нужду, потому что каждая добавляет обновления и уязвимости. Типичный набор — net/http или chi, pgx с pgxpool, sqlc или сборщик запросов вместо ORM, миграции goose, slog, OpenTelemetry и Prometheus, franz-go или sarama для Kafka. Пробелы закрывают пакеты golang.org/x: singleflight склеивает одновременные промахи кэша в одну загрузку. Выбирают по сопровождению, совместимости с net/http и context, стабильности API и лицензии и проверяют govulncheck.",
    "jvmRU": "В Java и Kotlin стек задаёт Spring Boot: стартеры web, data, Kafka и actuator, а версии согласует управление зависимостями Boot. В Go каждый слой выбирают отдельно и связывают вручную в main, поэтому интервьюер спрашивает, почему эта библиотека, а не другая, и ждёт компромисса, а не только названия.",
    "detailsRU": [
      "HTTP и контракты API. С Go 1.22 net/http сопоставляет методы и шаблоны {id}, поэтому многим сервисам роутер не нужен (c45). chi остаётся на net/http: обработчики — это http.Handler, а middleware — func(http.Handler) http.Handler. Gin и Echo передают свой тип Context, и каждый обработчик оказывается привязан к фреймворку. По спецификации OpenAPI oapi-codegen или ogen генерируют типы и интерфейсы сервера; для gRPC — grpc-go с protobuf, а buf проверяет .proto-файлы и запускает генерацию кода.",
      "PostgreSQL. pgx — драйвер PostgreSQL на чистом Go: pgxpool — его пул соединений, а нативный интерфейс поддерживает COPY, LISTEN/NOTIFY и пакеты запросов; pgx/v5/stdlib делает его драйвером database/sql там, где библиотеке нужен *sql.DB (c47). Поверх него: sqlc генерирует типизированный код на Go из SQL-запросов и схемы, а squirrel или goqu собирают динамические запросы; pgx.CollectRows с RowToStructByName раскладывает строки в структуры — то, ради чего часто берут sqlx. sqlx, squirrel и goqu стабильны, но обновляются редко. GORM в платёжных сервисах встречается реже: явный SQL проще ревьюить и проверять через EXPLAIN (c54). Миграции — goose или golang-migrate.",
      "Kafka, Redis, кэш. franz-go написан на чистом Go и стремится покрыть все возможности Kafka; IBM/sarama — бывший Shopify/sarama; у segmentio/kafka-go API проще (следи за тем, когда ReadMessage фиксирует offset, c53); confluent-kafka-go — обёртка над C-библиотекой librdkafka через cgo. Redis — go-redis, github.com/redis/go-redis/v9. Кэш в памяти процесса с вытеснением и лимитами — ristretto или ccache. singleflight не даёт лавине одинаковых загрузок начаться после промаха.",
      "Логи, метрики, устойчивость. log/slog входит в стандартную библиотеку с Go 1.21 (c48); zap старше и очень быстрый, а его экспериментальный пакет zapslog позволяет вызовам slog писать через zap. Трассы и метрики — OpenTelemetry; /metrics — prometheus/client_golang. Ретраи с экспоненциальной паузой и джиттером — cenkalti/backoff; лимиты — golang.org/x/time/rate, token bucket (W4-2); circuit breaker — sony/gobreaker.",
      "Конфиг, тесты, деньги. Конфиг берут из переменных окружения через koanf или через envconfig — маленький и редко обновляемый. Тесты: testing плюс testify для проверок; моки — go.uber.org/mock (mockgen), сопровождаемый форк после архивации golang/mock в 2023 году; testcontainers-go поднимает настоящие PostgreSQL и Kafka в Docker. testing/synctest для кода с таймерами в Go 1.24 экспериментальный, а с 1.25 стабильный (c38). Деньги — int64 в минорных единицах или shopspring/decimal, никогда float64; идентификаторы — google/uuid.",
      "Как выбирать. Смотри на свежие релизы и на то, как отвечают на issue, на поддержку net/http и context.Context, на лицензию и на мажорную версию: с v2 она входит в путь импорта, как в pgx/v5, поэтому несовместимое изменение приходит с новым путём. Новый релиз может поднять твою минимальную версию Go: golang.org/x/sync v0.20.0 требует Go 1.25. govulncheck сужает отчёт до уязвимых функций, до которых может дойти твой код. В опросе Go-разработчиков 2025 года поиск надёжных модулей вошёл в тройку главных трудностей (26%)."
    ],
    "versionNote": "log/slog и context.WithoutCancel — Go 1.21. singleflight взят из golang.org/x/sync v0.19.0 — последней версии, совместимой с Go 1.24 (v0.20.0 и новее требуют Go 1.25+); в v0.24.0 код singleflight тот же, только interface{} заменён на any. testing/synctest — эксперимент в Go 1.24 (GOEXPERIMENT=synctest), стабильный пакет с Go 1.25. Пример: gofmt, go vet, go test -race -count=20 на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "Package golang.org/x/sync/singleflight",
        "url": "https://pkg.go.dev/golang.org/x/sync/singleflight"
      },
      {
        "title": "pgx: PostgreSQL driver and toolkit for Go",
        "url": "https://github.com/jackc/pgx"
      },
      {
        "title": "Structured Logging with slog",
        "url": "https://go.dev/blog/slog"
      },
      {
        "title": "Results from the 2025 Go Developer Survey",
        "url": "https://go.dev/blog/survey2025"
      },
      {
        "title": "govulncheck",
        "url": "https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck"
      }
    ],
    "practice": {
      "kind": "Обоснуй выбор",
      "promptEN": "The interviewer asks: \"Why pgx and not GORM?\" and then \"Why slog and not zap?\" Give the arguments, and say when the answer would be the other way round.",
      "promptRU": "Интервьюер спрашивает: «Why pgx and not GORM?», а потом «Why slog and not zap?». Приведи доводы и скажи, когда ответ был бы обратным.",
      "pointsEN": [
        "pgx: every query is SQL you can read in review and check with EXPLAIN, and PostgreSQL types, COPY and LISTEN/NOTIFY are at hand; sqlc can turn the queries into typed code.",
        "GORM would win in a CRUD-heavy admin service with many simple tables, where development speed matters more than control over every query.",
        "slog: standard since Go 1.21, a stable API and no dependency; zap is the answer when the service already uses it or a profile shows logging on a hot path, and zapslog lets slog calls write through zap."
      ],
      "pointsRU": [
        "pgx: каждый запрос — это SQL, который читают на ревью и проверяют через EXPLAIN, а типы PostgreSQL, COPY и LISTEN/NOTIFY под рукой; sqlc превращает запросы в типизированный код.",
        "GORM выиграл бы в CRUD-сервисе для админки с множеством простых таблиц, где скорость разработки важнее контроля над каждым запросом.",
        "slog: стандарт с Go 1.21, стабильный API и ни одной зависимости; zap — ответ, когда сервис уже на нём или профиль показывает логирование на горячем пути, а zapslog позволяет вызовам slog писать через zap."
      ],
      "followUpEN": "How do you check that a new dependency brings no known vulnerability that affects your service?",
      "followUpRU": "Как проверить, что новая зависимость не приносит известной уязвимости, которая затрагивает твой сервис?"
    },
    "quizIds": []
  }
];
