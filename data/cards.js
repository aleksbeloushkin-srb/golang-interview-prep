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
    "shortEN": "A goroutine is a function executing concurrently with other goroutines. The Go runtime schedules goroutines onto OS threads and manages their growable stacks. Goroutines are relatively cheap, but their memory, work and lifetime still need limits.",
    "detailsEN": [
      "Concurrency does not require simultaneous execution. GOMAXPROCS limits how many OS threads can execute user Go code at once; it is not the total number of goroutines or threads.",
      "In the checked runtime, stackMin is 2 KiB, but platform rounding and stack reuse policies matter. A goroutine also needs a descriptor and can retain heap objects. Multiplying its count by 2 KiB is not a process-memory estimate.",
      "Thread stack reservation, committed memory and RSS are different quantities. Neither goroutine switching time nor an OS-thread stack size is a portable constant; measure the workload instead of memorizing nanoseconds.",
      "A go statement provides no join handle. Arrange completion with synchronization and give each goroutine an owner and a way to finish. Returning from main does not wait for other goroutines."
    ],
    "practicalRU": "На сервере отдельно ограничивай выполняемую работу и очередь запросов. Припаркованная горутина не расходует CPU на само ожидание, но её стек и достижимые данные запроса продолжают занимать память.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tfmt.Println(\"work finished\")\n\t\tclose(done)\n\t}()\n\t<-done // Wait for completion; a Sleep would not establish this ordering.\n}",
    "shortRU": "Горутина — это функция, которая выполняется конкурентно с другими горутинами. Рантайм Go распределяет их по потокам ОС и управляет растущими стеками. Горутины сравнительно недороги, но их память, работу и время жизни всё равно нужно ограничивать.",
    "detailsRU": [
      "Конкурентность не требует одновременного исполнения. GOMAXPROCS ограничивает число потоков ОС, одновременно исполняющих пользовательский Go-код; это не общее число горутин или потоков.",
      "В проверенном рантайме stackMin равен 2 КиБ, но важны округление для платформы и политика переиспользования стека. Кроме того, у горутины есть дескриптор, а её ссылки могут удерживать объекты кучи. Число горутин × 2 КиБ не даёт оценку памяти процесса.",
      "Резерв адресного пространства под стек потока, выделенная физическая память и RSS — разные величины. Время переключения горутин и размер стека потока ОС не являются переносимыми константами; измеряй свою нагрузку вместо заучивания наносекунд.",
      "Оператор go не возвращает дескриптор для join. Организуй ожидание через синхронизацию и определи владельца и путь завершения каждой горутины. Возврат из main не ждёт остальные горутины."
    ],
    "practicalEN": "For a server, bound active work and queued requests separately. A parked goroutine uses no CPU for that wait, but its stack and reachable request data can still consume memory.",
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
      }
    ],
    "practice": {
      "kind": "Объясни и измени условие",
      "promptEN": "One hundred thousand goroutines are waiting on channels. Can you predict RSS from that count alone?",
      "promptRU": "Сто тысяч горутин ждут на каналах. Можно ли по одному этому числу предсказать RSS?",
      "pointsEN": [
        "No: include allocated stacks, descriptors, retained data and other runtime/process memory.",
        "Waiting does not imply leaking. Check ownership, a reachable completion path and whether the population keeps growing."
      ],
      "pointsRU": [
        "Нет: нужны выделенные стеки, дескрипторы, удерживаемые данные и остальная память рантайма и процесса.",
        "Ожидание само по себе не означает утечку. Проверь владельца, достижимый путь завершения и рост числа горутин."
      ],
      "followUpEN": "What changes if each waiter retains a 1 MiB request body?",
      "followUpRU": "Что изменится, если каждый ожидающий удерживает тело запроса размером 1 МиБ?"
    }
  },
  {
    id: "c2",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q2: Can a program have a race condition without a data race?",
    qRU: "Может ли в программе быть логическая гонка без гонки данных?",
    shortEN: "A data race is an unsynchronized conflicting access to shared memory: at least one access writes. A race condition is a timing-dependent logic error. Locking individual reads and writes can remove the data race while leaving a check-then-act operation incorrect.",
    shortRU: "Гонка данных — это конфликтующий доступ к общей памяти без нужной синхронизации, когда хотя бы одна операция пишет. Логическая гонка — ошибка, зависящая от порядка событий. Можно защитить каждое чтение и запись отдельно, но всё равно неправильно выполнить проверку и действие.",
    detailsEN: [
      "Synchronization must protect the invariant, not just each field access. A balance check and the matching withdrawal must form one operation; a suitable atomic compare-and-swap loop is another possible design.",
      "The race detector observes executed, instrumented paths. A clean go test -race run is useful evidence, not a proof that every possible execution is safe; it does not diagnose all logical races.",
      "An invalid-memory-address panic does not by itself prove a data race. The runtime detects some conflicting map operations, but its map checks are not a substitute for synchronization or the race detector."
    ],
    detailsRU: [
      "Синхронизация должна защищать инвариант, а не только отдельные обращения к полю. Проверка баланса и соответствующее списание должны быть одной операцией; подходящий цикл compare-and-swap — другой возможный вариант.",
      "Детектор гонок наблюдает выполненные инструментированные пути. Успешный go test -race полезен, но не доказывает безопасность всех возможных исполнений и не выявляет все логические гонки.",
      "Panic с invalid memory address сам по себе не доказывает гонку данных. Рантайм обнаруживает некоторые конфликтующие операции с map, но его проверки не заменяют синхронизацию и детектор гонок."
    ],
    practicalRU: "При ревью спроси: «Какое условие должно оставаться истинным между проверкой и изменением?» Затем проверь, что одна блокировка или другая согласованная операция охватывает весь этот участок. Для теста логической гонки можно явно организовать порядок событий через каналы, не полагаясь на Sleep.",
    versionNote: "Различие гонки данных и логической гонки применимо к Go 1.17, 1.25 и 1.26. Возможности -race зависят также от платформы и реально выполненных путей.",
    sources: [
      {"title": "Go memory model", "url": "https://go.dev/ref/mem"},
      {"title": "Go race detector", "url": "https://go.dev/doc/articles/race_detector"}
    ],
    practice: {
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
    code: `// Pseudocode: Get and Set each lock internally.
// The whole check-and-set is still not atomic.
if cache.Get(key) == nil {
    cache.Set(key, value)
}
// Design one operation, e.g. LoadOrStore, around the required invariant.`,
    quizIds: ["q12", "q13"]
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
    "shortEN": "A go statement evaluates the function and its arguments in the caller, then runs the call in a new goroutine. In the checked runtime, newproc prepares reusable or new goroutine state, initializes a start context and makes the goroutine runnable. Runnable does not mean running.",
    "detailsEN": [
      "newproc uses the system stack g0. newproc1 obtains a dead G from gfget or creates one; stack allocation or reuse depends on the available G and the current stack policy. Reuse is not a promise of zero allocations.",
      "The runtime initializes saved SP/PC state and, on the illustrated amd64 path, a return path through goexit. These are data for a future execution, not the CPU registers of an already running goroutine.",
      "newproc requests runnext placement with runqput(..., true), but runtime conditions can choose an ordinary queue. A scheduler later transitions the G from runnable to running. The language promises neither immediate execution nor FIFO launch order.",
      "The runtime has internal goroutine IDs, but the language exposes no goroutine handle, public current-ID API or operation to kill another goroutine. Use explicit request IDs, cancellation and completion signals; do not parse stack dumps as an identity API."
    ],
    "practicalRU": "Передавай значения явно, если работнику нужен снимок состояния. Замыкание, которое позже читает изменяемое общее состояние, имеет другую семантику и может создать гонку.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvalues := make(chan int)\n\tn := 1\n\tgo func(value int) { values <- value }(n)\n\tn = 2\n\tfmt.Println(<-values, n) // 1 2; no timing assumption.\n}",
    "shortRU": "Оператор go вычисляет функцию и её аргументы в вызывающей горутине, а сам вызов выполняет в новой. В проверенном рантайме newproc подготавливает переиспользуемое или новое состояние горутины, настраивает стартовый контекст и делает её готовой к запуску. Готова — ещё не значит выполняется.",
    "detailsRU": [
      "newproc использует системный стек g0. newproc1 получает завершённую G через gfget или создаёт новую; выделение либо переиспользование стека зависит от найденной G и текущей политики. Переиспользование не обещает ноль выделений.",
      "Рантайм инициализирует сохранённые SP/PC и в показанном amd64-пути — возврат через goexit. Это данные будущего исполнения, а не регистры CPU уже работающей горутины.",
      "newproc запрашивает размещение в runnext через runqput(..., true), но условия рантайма могут привести к обычной очереди. Позже планировщик переводит G из runnable в running. Язык не обещает немедленного исполнения или порядка запуска FIFO.",
      "У рантайма есть внутренние ID горутин, но язык не предоставляет дескриптор горутины, публичный API текущего ID или операцию убийства другой горутины. Используй явные ID запросов, отмену и сигналы завершения; разбор stack dump не заменяет API идентификации."
    ],
    "practicalEN": "Pass values explicitly when the worker needs a snapshot. A closure that reads shared mutable state later has different semantics and may race.",
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
    "shortEN": "A goroutine stack is a runtime-managed memory region for active calls. The runtime uses dedicated stack allocation paths and may move the stack when it grows. MemStats.StackInuse reports memory in stack spans, not the number of bytes currently occupied by live local variables.",
    "detailsEN": [
      "On the checked path, small stacks can use per-P caches and stack free lists; larger stacks use dedicated spans. Saying “the stack is in the heap” hides the difference from ordinary heap-object allocation through mallocgc.",
      "On amd64, RSP points into the currently active stack. The saved g.sched.sp is a resume position, while g.stack.lo/hi describe the allocated region. A register contains an address, not the stack itself.",
      "Unused stack spans can return to the heap. Shrinking a stack, freeing a span and returning physical pages to the OS are different events; none promises an immediate matching RSS drop.",
      "StackSys includes stack memory obtained for the runtime, including some OS-thread stacks, but it does not account for every C stack. ReadMemStats gives process-wide runtime counters, not a per-goroutine allocation report."
    ],
    "practicalRU": "Сравнивай динамику на характерной нагрузке, а в профиле горутин ищи владельцев и места ожидания. Разность двух снимков нельзя называть универсальной ценой одной горутины.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\nfunc main() {\n\tvar stats runtime.MemStats\n\truntime.ReadMemStats(&stats)\n\t// Values depend on the process and workload; these are not RSS or live frames.\n\tfmt.Println(\"stack spans:\", stats.StackInuse, \"bytes\")\n\tfmt.Println(\"goroutines:\", runtime.NumGoroutine())\n}",
    "shortRU": "Стек горутины — область памяти под активные вызовы, которой управляет рантайм. У него есть отдельные пути выделения стеков; при росте стек может перемещаться. MemStats.StackInuse показывает память в спанах стеков, а не число байтов, занятых сейчас живыми локальными переменными.",
    "detailsRU": [
      "В проверенном пути небольшие стеки могут использовать кеши P и списки свободных стеков; более крупные получают отдельные спаны. Фраза «стек лежит в куче» скрывает отличие от выделения обычного объекта через mallocgc.",
      "На amd64 RSP указывает внутрь активного стека. Сохранённый g.sched.sp задаёт позицию продолжения, а g.stack.lo/hi описывают выделенную область. В регистре хранится адрес, а не сам стек.",
      "Неиспользуемые спаны стеков могут вернуться в кучу. Уменьшение стека, освобождение спана и возврат физических страниц ОС — разные события; ни одно не обещает немедленного соответствующего падения RSS.",
      "StackSys включает полученную рантаймом память стеков, в том числе некоторые стеки потоков ОС, но не учитывает каждый стек C. ReadMemStats выдаёт общие счётчики рантайма, а не отчёт о выделениях отдельной горутины."
    ],
    "practicalEN": "Compare trends under a representative workload and inspect goroutine profiles for owners and wait sites. Do not subtract two snapshots and call the result the universal cost of one goroutine.",
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
      "promptEN": "StackInuse is unchanged after a function returns. Does that prove the function leaked memory?",
      "promptRU": "StackInuse не изменился после возврата из функции. Доказывает ли это утечку?",
      "pointsEN": [
        "No. The goroutine may retain allocated stack capacity, and the runtime can cache stack storage.",
        "Inspect repeated growth, ownership and reachability. Stack capacity, live frames and RSS answer different questions."
      ],
      "pointsRU": [
        "Нет. У горутины может сохраниться ёмкость стека, а рантайм может кешировать память стеков.",
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
    "shortEN": "When a stack check detects insufficient space, the runtime can allocate a larger stack, copy active frames and adjust stack pointers using compiler metadata. Ordinary Go pointers remain valid across growth; a stack address is not a permanent numeric identity.",
    "detailsEN": [
      "Stack checks lead through morestack/newstack on the growth path. Not every function has the same prologue: small leaf functions and nosplit code have special rules. A tripped guard can also request preemption, not just allocation.",
      "For normal growth, Go 1.26.1 starts with twice the old size and can double again until the needed frame fits. copystack relocates active frames and uses pointer maps to fix references; channel-related references require coordinated updates too.",
      "Shrinking is a separate operation at safe points. The checked implementation can halve the stack when usage including a safety allowance is below one quarter, subject to minimum size and safety checks. Returning from a call does not itself guarantee shrinking.",
      "The default per-goroutine growth limit is 1 GB on 64-bit systems and 250 MB on 32-bit systems; debug.SetMaxStack changes the limit for future growth. Exceeding it crashes the program. A uintptr is an integer, not a GC-tracked pointer you may keep across arbitrary operations."
    ],
    "practicalRU": "Используй обычные указатели и ограничивай глубину рекурсии. Если в профиле заметно копирование стеков, сначала изучи глубину вызовов и крупные кадры; worker pool не является универсальным лечением роста стека.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc descend(depth int, value *int) int {\n\tvar frame [1024]byte\n\tframe[0] = byte(depth)\n\tif depth == 0 {\n\t\t*value = 42\n\t\treturn 0\n\t}\n\tsum := descend(depth-1, value)\n\treturn sum + int(frame[0]) // Keep frame data live across the call.\n}\n\nfunc main() {\n\tvalue := 0\n\tsum := descend(64, &value)\n\tfmt.Println(value, sum) // 42 2080; not a measurement of stack addresses.\n}",
    "shortRU": "Когда проверка стека обнаруживает нехватку места, рантайм может выделить больший стек, скопировать активные кадры и исправить указатели по метаданным компилятора. Обычные Go-указатели остаются корректными при росте; адрес в стеке не является постоянным числовым идентификатором.",
    "detailsRU": [
      "Путь роста проходит через morestack/newstack. Не у каждой функции одинаковый пролог: у небольших листовых функций и nosplit-кода особые правила. Срабатывание guard может также означать запрос вытеснения, а не только выделение памяти.",
      "Для обычного роста Go 1.26.1 начинает с удвоенного размера и при необходимости удваивает снова, чтобы вместить нужный кадр. copystack переносит активные кадры и исправляет ссылки по картам указателей; ссылки, связанные с каналами, тоже требуют согласованного обновления.",
      "Уменьшение — отдельная операция в безопасных точках. Проверенная реализация может уменьшить стек вдвое, если использование с защитным запасом меньше четверти, с учётом минимального размера и проверок безопасности. Сам возврат из вызова не гарантирует уменьшения.",
      "Стандартный предел роста одной горутины — 1 ГБ на 64-битных системах и 250 МБ на 32-битных; debug.SetMaxStack меняет предел будущего роста. Превышение аварийно завершает программу. uintptr — целое число, а не отслеживаемый GC указатель, который можно сохранять через произвольные операции."
    ],
    "practicalEN": "Use ordinary pointers and keep deep recursion bounded. If stack copying appears in a profile, first examine call depth and large frames; a worker pool is not a universal fix for stack growth.",
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
      "promptEN": "A pointer refers to a caller’s local variable while deeper calls grow the stack. Must application code repair that pointer?",
      "promptRU": "Указатель ссылается на локальную переменную вызывающего, пока вложенные вызовы наращивают стек. Нужно ли приложению исправлять этот указатель?",
      "pointsEN": [
        "No. The runtime and compiler preserve ordinary Go pointer semantics, including during stack relocation.",
        "Do not replace the pointer with a stored uintptr and assume the same safety. Do not infer physical placement from correct output alone."
      ],
      "pointsRU": [
        "Нет. Рантайм и компилятор сохраняют семантику обычных Go-указателей, в том числе при переносе стека.",
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
    "qEN": "Q6: What must the runtime restore to resume a goroutine?",
    "qRU": "Что runtime восстанавливает, чтобы продолжить выполнение горутины?",
    "shortEN": "To resume a goroutine, the runtime restores where its stack is and where execution should continue. On amd64, RSP points into the active stack, RIP identifies the instruction position, and Go uses R14 for the current goroutine. These roles are easier to understand before memorizing assembly instructions.",
    "shortRU": "Чтобы продолжить горутину, runtime восстанавливает положение её стека и место продолжения кода. На amd64 RSP указывает в активный стек, RIP задаёт позицию инструкции, а Go использует R14 для текущей горутины. Сначала полезно понять эти роли, а затем читать ассемблер.",
    "detailsEN": [
      "A register is a small CPU storage location used during execution. RSP is an address, not the stack itself; R14 is a pointer to Go runtime metadata, not the whole goroutine. RIP changes as instructions and control transfers execute.",
      "Each M has a g0 used for system-stack work. In the checked amd64 gogo path, the runtime installs the current G, restores SP, BP and closure context, clears selected saved fields, and jumps to the saved PC. It is not a fixed four-instruction operation.",
      "mcall saves the caller’s continuation and switches to g0 to call a runtime function. g.sched is saved continuation state, not a dump of every CPU register. Switching goroutines is distinct from an OS thread context switch.",
      "Register names and conventions are architecture-dependent. This diagram uses amd64; on arm64 Go uses R28 for the current G. Neither the g0 stack nor every goroutine stack has one universally fixed size."
    ],
    "detailsRU": [
      "Регистр — небольшое хранилище процессора, используемое при выполнении. RSP содержит адрес, а не сам стек; R14 — указатель на данные runtime, а не всю горутину. RIP меняется при выполнении инструкций и переходов.",
      "У каждого M есть g0 для работы на системном стеке. В проверенном пути gogo для amd64 runtime устанавливает текущую G, восстанавливает SP, BP и контекст замыкания, очищает часть сохранённых полей и переходит к сохранённому PC. Это не операция ровно из четырёх инструкций.",
      "mcall сохраняет место продолжения вызывающей стороны и переключается на g0 для вызова функции runtime. g.sched — сохранённое состояние продолжения, а не снимок всех регистров CPU. Переключение горутин отличается от переключения потоков ОС.",
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
    "shortEN": "G is a goroutine, M is an OS thread, and P holds the runtime resources needed to execute user Go code. GOMAXPROCS controls the number of Ps. The runtime can have more threads than Ps, for example when threads are in blocking system calls.",
    "detailsEN": [
      "A P is a runtime object, not a physical CPU or a permanently pinned core. The OS schedules Ms on available CPUs. In the phrase “M:N scheduling”, M and N are generic counts, not the runtime type names.",
      "Each P has a local runnable queue and a separate runnext slot. Global queues, polling, timers and work stealing help distribute work. More runnable goroutines do not automatically create more parallel Go execution.",
      "Go 1.25 introduced container-aware GOMAXPROCS defaults and periodic updates. On Linux the policy considers CPU affinity and cgroup quota as well as logical CPUs. Explicit environment or runtime.GOMAXPROCS settings disable automatic updates; compatibility settings and the module language version matter.",
      "GOMAXPROCS is not an application concurrency limit. Database pools, remote-service limits and request backpressure need their own budgets. With GOMAXPROCS=1, interleavings and data races are still possible."
    ],
    "practicalRU": "Начни со стандартной настройки рантайма, наблюдай throttling и задержки и подбирай значение на реальной нагрузке. Число 2 или количество CPU хоста не является универсальным рецептом для контейнера.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\nfunc main() {\n\t// A non-positive argument queries the setting without changing it.\n\tfmt.Println(\"parallel Go execution limit:\", runtime.GOMAXPROCS(0))\n\t// This is not the number of threads or an external-service concurrency limit.\n}",
    "shortRU": "G — горутина, M — поток ОС, а P содержит ресурсы рантайма для исполнения пользовательского Go-кода. GOMAXPROCS задаёт число P. Потоков может быть больше, чем P, например из-за блокирующих системных вызовов.",
    "detailsRU": [
      "P — объект рантайма, а не физический CPU или навсегда закреплённое ядро. ОС распределяет M по доступным CPU. В выражении «планирование M:N» буквы M и N обозначают количества, а не имена типов рантайма.",
      "У каждого P есть локальная очередь готовых горутин и отдельный слот runnext. Общие очереди, опрос событий, таймеры и перехват работы помогают распределять нагрузку. Больше готовых горутин не означает больше параллельно исполняемого Go-кода.",
      "Go 1.25 ввёл учитывающий контейнеры GOMAXPROCS по умолчанию и периодические обновления. На Linux политика учитывает CPU affinity, квоту cgroup и логические CPU. Явная настройка через окружение или runtime.GOMAXPROCS отключает автообновления; важны настройки совместимости и версия языка модуля.",
      "GOMAXPROCS не ограничивает конкурентность приложения. Пулу БД, обращениям к внешнему сервису и приёму запросов нужны свои бюджеты. При GOMAXPROCS=1 всё ещё возможны чередование операций и гонки данных."
    ],
    "practicalEN": "Start with the runtime default, observe throttling and latency, and tune against actual load. Choosing 2 or the host CPU count is not a universal container prescription.",
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
    "shortEN": "Go can request preemption so other goroutines get a chance to run. Supported platforms have asynchronous preemption as well as checks at safe points. A request is not an immediate switch: the runtime must find a safe place to suspend the current Go execution.",
    "detailsEN": [
      "The checked sysmon/retake implementation uses a 10 ms threshold while observing an unchanged scheduling tick. This is not a strict CPU quantum, a guaranteed latency bound or a statement that sysmon wakes exactly every 10 ms. runnext goroutines can share a tick.",
      "On supported Unix paths, SIGURG is used to interrupt a thread. The handler checks whether the interrupted code is at an asynchronous safe point and can arrange a call to asyncPreempt after resuming. That path saves registers and enters the scheduler; the signal handler does not simply schedule arbitrary Go code.",
      "If the point is unsafe, preemption must wait or retry. runtime code, foreign C execution and platform mechanisms have different constraints. Preempting a goroutine does not cancel its operation or release its locks.",
      "runtime.Gosched yields voluntarily but creates no application-level ordering guarantee. Use channels, locks or other synchronization for ordering, and check cancellation explicitly in long-running application loops."
    ],
    "practicalRU": "В длительном вычислении проверяй ctx.Done на подходящей границе работы. Справедливость планировщика и скорость реакции вашего протокола отмены — разные вопросы.",
    "code": "package main\n\nimport (\n\t\"context\"\n\t\"fmt\"\n)\n\nfunc sum(ctx context.Context, n int) (int, error) {\n\ttotal := 0\n\tfor i := 0; i < n; i++ {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn 0, ctx.Err()\n\t\tdefault:\n\t\t}\n\t\ttotal += i\n\t}\n\treturn total, nil\n}\n\nfunc main() {\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\t_, err := sum(ctx, 100)\n\tfmt.Println(err) // context canceled; the application checks the signal.\n}",
    "shortRU": "Go может запросить вытеснение, чтобы дать шанс другим горутинам. На поддерживаемых платформах есть асинхронное вытеснение и проверки в безопасных точках. Запрос не равен немедленному переключению: рантайм должен найти безопасное место для приостановки Go-кода.",
    "detailsRU": [
      "В проверенной реализации sysmon/retake использует порог 10 мс при наблюдении неизменного тика планировщика. Это не строгий квант CPU, не гарантия задержки и не утверждение, что sysmon просыпается ровно каждые 10 мс. Горутины runnext могут разделять один тик.",
      "В поддерживаемых Unix-путях для прерывания потока используется SIGURG. Обработчик проверяет асинхронную безопасную точку и может подготовить вызов asyncPreempt после возобновления. Этот путь сохраняет регистры и входит в планировщик; обработчик сигнала не начинает просто исполнять произвольный Go-код.",
      "Если точка небезопасна, вытеснение ждёт или повторяется. У кода рантайма, внешнего C-кода и механизмов платформы разные ограничения. Вытеснение горутины не отменяет её операцию и не освобождает блокировки.",
      "runtime.Gosched добровольно уступает исполнение, но не создаёт гарантию порядка событий приложения. Для порядка нужны каналы, блокировки или другая синхронизация, а в длительных циклах приложения отмену нужно проверять явно."
    ],
    "practicalEN": "For a long computation, check ctx.Done at a suitable work boundary. Scheduler fairness and the responsiveness of your cancellation protocol are separate concerns.",
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
    "shortEN": "The scheduler considers several work sources, including local and global queues, network readiness, timers and work on other Ps. A periodic global-queue check helps fairness. Stealing redistributes runnable goroutines; it does not move a goroutine that is currently running.",
    "detailsEN": [
      "In Go 1.26.1, findRunnable handles special work such as GC coordination and timers before parts of ordinary queue selection. The simplified sequence “global, local, poll, steal” is not a complete priority contract.",
      "When schedtick % 61 == 0 and the global queue is observed non-empty, the runtime attempts a fairness check. A tick is not a millisecond or necessarily one goroutine: runnext can inherit the current time slice. The constant 61 is an implementation choice, not a language guarantee.",
      "The checked runqgrab takes ceil(n/2) entries from the head of a victim’s ordinary local queue, using CAS to claim them. Concurrent changes can cause retries. runqsteal returns one of the batch for execution and queues the rest; stealing runnext is a separate possibility when allowed.",
      "For a stable victim queue [A,B,C,D,E], head on the left, the batch is [A,B,C]. runqsteal returns C and queues A,B on the thief; D,E remain on the victim. This is a source-level example under stated assumptions, not a prediction of application output."
    ],
    "practicalRU": "Используй schedtrace для общего снимка и execution trace для временной картины. Один снимок неравных очередей сам по себе не доказывает проблему cgo, безопасной точки или планировщика.",
    "code": "// Source-level model, NOT executable Go and NOT a scheduling guarantee.\n// Assumptions: no concurrent queue changes; ordinary queue, head at left.\n// Before: victim [A B C D E], thief []\n// Grab:   n=5 -> n-n/2=3 -> [A B C]\n// After:  victim [D E], thief [A B], returned for execution: C\n// runnext, timers, concurrent retries and other scheduler work are omitted.",
    "shortRU": "Планировщик рассматривает несколько источников работы: локальные и общую очереди, готовность сети, таймеры и работу других P. Периодическая проверка общей очереди помогает справедливости. Перехват работы перераспределяет готовые горутины, а не перемещает уже исполняющуюся.",
    "detailsRU": [
      "В Go 1.26.1 findRunnable обрабатывает специальную работу, например координацию GC и таймеры, до части обычного выбора очередей. Упрощённая последовательность «общая, локальная, сеть, кража» не является полным контрактом приоритетов.",
      "При schedtick % 61 == 0 и наблюдаемой непустой общей очереди рантайм пробует проверку справедливости. Тик — не миллисекунда и не обязательно одна горутина: runnext может наследовать текущий квант. Константа 61 — выбор реализации, а не гарантия языка.",
      "Проверенный runqgrab берёт ceil(n/2) элементов с головы обычной локальной очереди жертвы и закрепляет их через CAS. Конкурентные изменения могут вызвать повтор. runqsteal возвращает один элемент пачки для исполнения, остальные ставит в очередь; перехват runnext — отдельная возможность, когда она разрешена.",
      "Для неизменной очереди жертвы [A,B,C,D,E] с головой слева пачка равна [A,B,C]. runqsteal возвращает C, а A,B ставит в очередь забирающего P; D,E остаются у жертвы. Это пример по исходникам при заданных условиях, а не предсказание вывода приложения."
    ],
    "practicalEN": "Use schedtrace for a coarse snapshot and execution tracing for timelines. An uneven queue snapshot alone does not prove cgo, a stuck safe point or a scheduler defect.",
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
    "shortEN": "An ordinary pollable network wait can park a goroutine while its thread runs other work. A blocking syscall or foreign call can instead occupy an OS thread. The runtime can make its P available elsewhere so Go work continues; the precise handoff protocol differs between Go 1.25 and 1.26.",
    "detailsEN": [
      "On the standard Unix pollable-socket path, a read that would block waits through the runtime netpoller. There is no dedicated blocked OS thread per waiting socket. This is not a promise about every net.Conn implementation, every file or every platform.",
      "In Go 1.25, ordinary entersyscall detaches M from P and puts P in _Psyscall. The runtime can retake it; a quick return may reclaim it. entersyscallblock explicitly hands off P for a known blocking call. Handoff is not guaranteed at the instant every syscall starts.",
      "In Go 1.26.1, ordinary entersyscall can keep M and P attached while G is in _Gsyscall; _Psyscall is now the unused slot _Psyscall_unused. Retaking uses setBlockOnExitSyscall to hold the G state, validate the links, detach P and then permit return to proceed. Known-blocking and GC paths can give up P sooner.",
      "A returning call needs a P before normal user Go execution resumes. If none is available, the goroutine can become runnable and wait. cgo can occupy threads even while computing rather than waiting; GOMAXPROCS does not cap that foreign CPU work.",
      "A new thread is not necessarily created for each call: idle threads may be reused. Still, unbounded blocking calls can exhaust resources or hit the runtime thread limit (initially 10,000, configurable with debug.SetMaxThreads). Limit operations at their owner, not by assuming a fixed goroutine-to-thread ratio."
    ],
    "practicalRU": "Пример ограничивает вызовы, допущенные через один общий лимитер. Отмена может остановить ожидание допуска; после старта сам callback должен поддерживать отмену. Контекст не прерывает произвольный C-код принудительно.",
    "code": "package admission\n\nimport \"context\"\n\n// Share one Limit across callers. It bounds admitted work, not OS threads.\ntype Limit chan struct{}\n\nfunc (limit Limit) Do(ctx context.Context, work func(context.Context) error) error {\n\tif err := ctx.Err(); err != nil {\n\t\treturn err\n\t}\n\tselect {\n\tcase limit <- struct{}{}:\n\t\tdefer func() { <-limit }()\n\tcase <-ctx.Done():\n\t\treturn ctx.Err()\n\t}\n\tif err := ctx.Err(); err != nil {\n\t\treturn err\n\t}\n\t// Cancellation can race with this call; work must also cooperate.\n\treturn work(ctx)\n}\n\n// Construct with make(Limit, 32); keep it shared and never close it.",
    "shortRU": "Обычное ожидание поллируемой сети может припарковать горутину, пока её поток выполняет другую работу. Блокирующий syscall или внешний вызов может занять поток ОС. Рантайм может передать его P для продолжения Go-работы; точный протокол различается в Go 1.25 и 1.26.",
    "detailsRU": [
      "В стандартном Unix-пути поллируемого сокета чтение, которое заблокировалось бы, ожидает через netpoller рантайма. Отдельный заблокированный поток на каждый ожидающий сокет не нужен. Это не обещание для каждой реализации net.Conn, каждого файла или каждой платформы.",
      "В Go 1.25 обычный entersyscall отсоединяет M от P и переводит P в _Psyscall. Рантайм может забрать P, а быстрый возврат — вернуть его. entersyscallblock явно передаёт P для заведомо блокирующего вызова. Передача не гарантирована в момент начала любого syscall.",
      "В Go 1.26.1 обычный entersyscall может оставить M и P связанными, пока G находится в _Gsyscall; прежний _Psyscall стал неиспользуемым слотом _Psyscall_unused. При изъятии setBlockOnExitSyscall удерживает состояние G, проверяет связи, отсоединяет P и затем разрешает продолжение возврата. Заведомо блокирующий путь и GC могут отдать P раньше.",
      "После возврата нужен P, прежде чем продолжится обычный пользовательский Go-код. Если P нет, горутина может стать runnable и ждать. cgo может занимать потоки даже вычислениями, а не ожиданием; GOMAXPROCS не ограничивает такую работу внешнего кода.",
      "Для каждого вызова необязательно создаётся новый поток: свободные могут переиспользоваться. Но неограниченные блокирующие вызовы способны исчерпать ресурсы или предел потоков рантайма (изначально 10 000, настраивается debug.SetMaxThreads). Ограничивай операции у их владельца, не предполагая фиксированного отношения горутин к потокам."
    ],
    "practicalEN": "The example bounds callbacks admitted through one shared limit. Cancellation can stop waiting for admission; once work starts, the callback must itself cooperate. A context does not forcibly interrupt arbitrary C code.",
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
    "shortEN": "runnext is a single preferred runnable-goroutine slot next to a P’s ordinary local queue. It can reduce scheduling overhead for related goroutines by letting the selected goroutine inherit the current time slice. It is a runtime optimization, not a promise about who runs next.",
    "detailsEN": [
      "With next=true, runqput can replace the current slot using CAS and move the previous occupant to the ordinary queue; queue overflow has its own path. Calling this a one-element LIFO stack hides the displacement into another queue.",
      "runqget checks runnext before the ordinary local queue and reports inheritTime=true for that path. execute then does not increment schedtick. This local preference does not override all other scheduler work or guarantee immediate execution after go or a channel operation.",
      "A chain of goroutines can keep replacing runnext while sharing a tick. sysmon preemption helps prevent monopolizing a P. The slot’s capacity of one is not by itself a fairness proof; the checked runtime disables this optimization without sysmon and can randomize its use in some builds.",
      "Related execution may benefit locality, but neither a hot L1 cache nor a fixed switching time is guaranteed. Correct synchronization must work regardless of whether runnext is used or the goroutine moves to another P."
    ],
    "practicalRU": "Объясняй через «один предпочтительный кандидат, остальные остаются в очереди». Не оправдывай передачу данных без синхронизации предполагаемым порядком runnext.",
    "code": "// Source-level model, NOT executable Go. No concurrent queue changes.\n// Before: runnext=A, ordinary queue=[X Y]\n// runqput(P, B, true), assuming runnext is enabled and the queue has room:\n// After:  runnext=B, ordinary queue=[X Y A]\n// runqget(P) can return B with inheritTime=true.\n// This is a local queue rule, not an application execution-order guarantee.",
    "shortRU": "runnext — отдельный слот для одной предпочтительной готовой горутины рядом с обычной локальной очередью P. Он может снизить накладные расходы для связанных горутин, передав выбранной горутине остаток текущего кванта. Это оптимизация рантайма, а не обещание, кто запустится следующим.",
    "detailsRU": [
      "При next=true runqput может заменить содержимое слота через CAS и перенести прежнего кандидата в обычную очередь; при переполнении есть отдельный путь. Название «LIFO-стек из одного элемента» скрывает перенос в другую очередь.",
      "runqget проверяет runnext раньше обычной локальной очереди и возвращает inheritTime=true для этого пути. execute тогда не увеличивает schedtick. Локальный приоритет не отменяет остальную работу планировщика и не гарантирует немедленный запуск после go или операции с каналом.",
      "Цепочка горутин может снова и снова заменять runnext, разделяя один тик. Вытеснение через sysmon помогает не монополизировать P. Ёмкость в один элемент сама по себе не доказывает справедливость; проверенный рантайм отключает оптимизацию без sysmon и может рандомизировать её использование в некоторых сборках.",
      "Связанное исполнение может выиграть от локальности, но ни горячий L1-кеш, ни фиксированное время переключения не гарантированы. Корректная синхронизация должна работать и без runnext, и при переходе горутины на другой P."
    ],
    "practicalEN": "Explain it with “one preferred candidate, the rest remain queued”. Never use a presumed runnext order to justify an unsynchronized handoff.",
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
    id: "c12",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q12: How would you find and prevent a goroutine leak?",
    qRU: "Как найти утечку горутин и обеспечить их завершение?",
    shortEN: "A goroutine leaks when it outlives the work that needed it and has no effective way to finish. I would identify who owns it, what it can wait for, and how it stops. A context helps only when the work observes cancellation; a buffer does not cancel an operation.",
    shortRU: "Горутина утекает, когда переживает работу, ради которой была запущена, и не имеет работающего пути завершения. Я проверю, кто ею управляет, чего она может ждать и как должна остановиться. Context помогает только при обработке отмены; буфер сам по себе операцию не отменяет.",
    detailsEN: [
      "A common case is one result sent after the caller has left. A one-element buffer lets that single send finish; it does not stop the RPC or make repeated sends safe. Bound concurrency and give long-running work a shutdown path.",
      "A running or blocked goroutine can keep reachable objects alive. Losing the caller's channel variable does not collect the goroutine. A deliberately long-lived service goroutine is not a leak merely because it waits.",
      "Compare goroutine profiles over time and after load subsides. debug=1 gives grouped text stacks; debug=2 gives a stack dump with goroutine states. A stack shows where work is waiting, not by itself why it cannot finish."
    ],
    detailsRU: [
      "Частый случай — отправка единственного результата после ухода вызывающей стороны. Буфер на один элемент позволяет именно этой отправке завершиться; он не останавливает RPC и не делает безопасными повторные отправки. Ограничивай параллелизм и предусматривай остановку длительной работы.",
      "Работающая или заблокированная горутина может удерживать достижимые объекты. Потеря переменной канала у вызывающего кода не уничтожает горутину. Долгоживущая служебная горутина не становится утечкой только потому, что ждёт.",
      "Сравнивай профили горутин во времени и после снижения нагрузки. debug=1 даёт сгруппированные текстовые стеки, debug=2 — дамп со состояниями горутин. Стек показывает место ожидания, но сам по себе не объясняет, почему работа не завершится."
    ],
    practicalRU: "Начни с повторяющихся стеков и проверь владельца каждой горутины: кто прекращает отправку, кто закрывает очередь и кто дожидается завершения. Проверку остановки строй на наблюдаемом завершении работы; один таймаут запроса не означает, что дочерняя работа уже закончилась.",
    versionNote: "В Go 1.25 доступны обычные goroutine-профили. В Go 1.26 профиль goroutineleak включается экспериментом GOEXPERIMENT=goroutineleakprofile; это дополнительная диагностика, не гарантия обнаружения всех утечек.",
    sources: [
      {"title": "Go: pipelines and cancellation", "url": "https://go.dev/blog/pipelines"},
      {"title": "pprof formats — Go 1.26.1", "url": "https://pkg.go.dev/runtime/pprof@go1.26.1#Profile.WriteTo"},
      {"title": "Go 1.26 release notes", "url": "https://go.dev/doc/go1.26"}
    ],
    practice: {
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
    code: `// Function fragment; import "context". work must observe ctx cancellation.
func Await(ctx context.Context, work func(context.Context) error) error {
	result := make(chan error, 1)
	go func() {
		result <- work(ctx) // Exactly one send; it can finish without a receiver.
	}()
	select {
	case err := <-result:
		return err
	case <-ctx.Done():
		return ctx.Err() // Does not wait for work to stop.
	}
}`,
    quizIds: ["q10", "q16"]
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
    "qEN": "Q13: What does a channel buffer change, and what does it not change?",
    "qRU": "Что меняет буфер канала, а что остаётся прежним?",
    "shortEN": "A channel transfers typed values and synchronizes sends with receives. An unbuffered send needs a matching receiver. A buffer lets sends complete while capacity is available, but it does not remove backpressure or make referenced data private to the receiver.",
    "shortRU": "Канал передаёт типизированные значения и синхронизирует отправку с чтением. Небуферизованной отправке нужен получатель. Буфер позволяет отправлять, пока есть место, но не устраняет обратное давление и не делает данные по ссылкам частной копией получателя.",
    "detailsEN": [
      "For an open channel in the checked runtime, a waiting receiver can take a value directly, even if the channel has buffer capacity. Otherwise, a sender uses a free buffer slot or waits. With select and default, an operation that cannot proceed can be skipped instead of waiting.",
      "A send copies the element value. A slice value still refers to its backing array, and a pointer still refers to the same object. Copy the data or agree on ownership and synchronization before either side mutates shared data.",
      "In makechan, the limit below 64 KiB is on one element, not the total buffer. For a nonzero buffer of pointer-free elements, the checked runtime allocates hchan and buffer together; pointer-containing elements use a separately allocated buffer. This layout is not a language guarantee.",
      "Choose capacity from the amount of work allowed in flight. A larger buffer may absorb a burst, but cannot fix a permanently slower consumer. Measure throughput, waiting and retained memory for the actual workload."
    ],
    "detailsRU": [
      "Для открытого канала в проверенной реализации ожидающий получатель может получить значение напрямую, даже если канал имеет буфер. Иначе отправитель использует свободную ячейку или ждёт. В select с default неготовую операцию можно пропустить вместо ожидания.",
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
    id: "c14",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q14: How do nil, open, and closed channels behave?",
    qRU: "Чем отличаются операции с nil-каналом, открытым и закрытым каналом?",
    shortEN: "I separate the channel state from the operation. Sending to or receiving from a nil channel blocks. An open channel may wait for a peer or buffer space. A closed channel still yields buffered values, then zero values with ok=false. Sending to a closed channel, closing it again, or closing nil panics.",
    shortRU: "Сначала разделяю состояние канала и операцию. Отправка и чтение nil-канала блокируются. Для открытого канала может потребоваться получатель, отправитель или место в буфере. Закрытый канал отдаёт оставшиеся значения, затем нулевое значение с ok=false. Отправка в закрытый канал, повторное закрытие и закрытие nil вызывают panic.",
    detailsEN: [
      "For an open unbuffered channel, send and receive rendezvous. For an open buffered channel, send waits when it is full and receive waits when it is empty. A nil-channel case cannot proceed in select, so another case or default can still run.",
      "After close, buffered values are received with ok=true. Only after the buffer is drained does receive return the zero value with ok=false. Closing does not discard buffered data.",
      "Closing makes waiting goroutines eligible to proceed; it does not guarantee when each will run. The owner coordinating all sends should close the channel only after no more sends can occur.",
      "A closed input stays ready. In a select loop, handle ok=false by stopping or setting that input variable to nil. The loop also needs a defined exit when all inputs are disabled."
    ],
    detailsRU: [
      "В открытом небуферизованном канале отправка и чтение встречаются друг с другом. В буферизованном отправка ждёт при полном буфере, чтение — при пустом. Ветка select с nil-каналом не готова, но другие ветки или default могут выполниться.",
      "После close значения из буфера приходят с ok=true. Только после опустошения буфера чтение возвращает нулевое значение и ok=false. Закрытие не выбрасывает накопленные данные.",
      "Закрытие позволяет ожидающим горутинам продолжить работу, но не гарантирует момент запуска каждой из них. Закрывать канал должен владелец, координирующий всех отправителей, когда новых отправок уже не будет.",
      "Закрытый вход остаётся готовым. В цикле select при ok=false нужно завершиться или присвоить этой переменной канала nil. Для случая, когда отключены все входы, также нужен определённый выход из цикла."
    ],
    practicalRU: "Для сигнала завершения удобно закрытие done-канала, но отдельно дождись остановки воркеров, если следующий шаг зависит от неё. Для потока значений всегда различай «пришёл ноль» и «поток закончился» через второй результат чтения.",
    versionNote: "Контракты каналов в этой карточке применимы к Go 1.17, 1.25 и 1.26. Порядок запуска горутин не является частью этих гарантий.",
    sources: [
      {"title": "Go specification: receive", "url": "https://go.dev/ref/spec#Receive_operator"},
      {"title": "Go specification: close", "url": "https://go.dev/ref/spec#Close"},
      {"title": "Go memory model: channels", "url": "https://go.dev/ref/mem#chan"}
    ],
    practice: {
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
    code: `// Function fragment. Both inputs must eventually close, or add cancellation.
func Drain(a, b <-chan int, consume func(int)) {
	for a != nil || b != nil {
		select {
		case v, ok := <-a:
			if !ok {
				a = nil
				continue
			}
			consume(v)
		case v, ok := <-b:
			if !ok {
				b = nil
				continue
			}
			consume(v)
		}
	}
}`
  },
  {
    "id": "c15",
    "mod": "m3",
    "modName": "3. Channels, Select & Sync",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": null,
    "qEN": "Q15: Channels or a mutex — who owns the data, and what must happen together?",
    "qRU": "Канал или мьютекс: кто владеет данными и какие действия должны выполняться вместе?",
    "shortEN": "Use a channel to communicate work, results or lifecycle events. Use a mutex to protect an invariant in shared state. Sending a pointer does not enforce exclusive ownership: the sender and receiver still need an agreement about later access. Choose by the coordination problem, then measure performance.",
    "detailsEN": [
      "A channel send copies its value. A pointer or slice can still refer to shared mutable memory. For an ownership-transfer protocol, the sender stops accessing that memory after handing it over, or both sides synchronize access. The compiler does not enforce this protocol.",
      "A mutex should cover the whole operation: check balance AND withdraw, or look up AND install a missing entry. Locking each field access separately can avoid a data race yet leave a logic race. All accesses to protected mutable state must follow the same protocol.",
      "RWMutex allows concurrent readers, but RLock does not permit writes. A pending writer can block new readers; there is no atomic read-to-write upgrade. Extra bookkeeping can outweigh parallelism for short reads: RWMutex is not automatically faster than Mutex.",
      "Channels compose with select for cancellation and communication. Mutex.Lock has no context parameter and cannot be a select case. An atomic operation covers its specified value, not an arbitrary multi-field invariant; an actor also needs bounded queues and an exit path."
    ],
    "practicalRU": "Начни с инварианта: баланс не должен стать отрицательным. Проверку и изменение держи под одним lock. Универсальной цены в наносекундах и замедления актора в 10 раз нет: измеряй свою нагрузку. Возвращай снимки, а не доступ к изменяемому состоянию после unlock.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tmu      sync.Mutex\n\tbalance int\n}\n\nfunc (a *Account) Withdraw(n int) bool {\n\ta.mu.Lock()\n\tdefer a.mu.Unlock()\n\tif n <= 0 || a.balance < n {\n\t\treturn false\n\t}\n\ta.balance -= n\n\treturn true\n}\nfunc main() {\n\ta := Account{balance: 10}\n\tfmt.Println(a.Withdraw(7), a.Withdraw(7)) // true false\n}",
    "shortRU": "Канал подходит для передачи работы, результатов и событий жизненного цикла. Мьютекс защищает инвариант общего состояния. Отправка указателя не обеспечивает исключительное владение: отправитель и получатель должны договориться о дальнейшем доступе. Выбирай по задаче координации, затем измеряй производительность.",
    "detailsRU": [
      "Отправка в канал копирует значение. Указатель или срез всё ещё может ссылаться на общую изменяемую память. В протоколе передачи владения отправитель прекращает обращаться к ней после передачи либо обе стороны синхронизируют доступ. Компилятор этот протокол не обеспечивает.",
      "Мьютекс должен охватывать целую операцию: проверить баланс И списать, найти И установить отсутствующий элемент. Отдельные блокировки вокруг каждого обращения могут убрать data race, но оставить логическую гонку. Все обращения к защищённому изменяемому состоянию следуют одному протоколу.",
      "RWMutex допускает параллельных читателей, но RLock не разрешает запись. Ожидающий писатель может задержать новых читателей; атомарного повышения read-lock до write-lock нет. Для короткого чтения дополнительные расходы могут перевесить параллелизм: RWMutex не всегда быстрее Mutex.",
      "Каналы сочетаются с select для отмены и обмена. Mutex.Lock не принимает context и не может быть веткой select. Атомарная операция защищает указанное значение, а не произвольный инвариант нескольких полей; актору тоже нужны ограничение очереди и путь завершения."
    ],
    "practicalEN": "Start with the invariant: a balance must not become negative. Keep its check and update under one lock. Do not promise a universal nanosecond cost or a 10× actor slowdown; benchmark the actual workload. Return snapshots rather than exposing mutable state after unlocking.",
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
    "qEN": "Q16: Why does a channel wait queue contain sudog records instead of just goroutines?",
    "qRU": "Зачем очереди канала содержат записи sudog, а не только горутины?",
    "shortEN": "The channel owns the buffer and wait queues. A sudog records one waiting operation and links it to a goroutine. A blocked select may need several such records for one goroutine, so a queue entry and a goroutine are different things.",
    "shortRU": "Канал хранит буфер и очереди ожидания. Sudog описывает одну ожидающую операцию и связывает её с горутиной. Заблокированному select может понадобиться несколько записей для одной горутины, поэтому запись очереди и горутина — разные сущности.",
    "detailsEN": [
      "The checked hchan contains buffer capacity and occupancy, send/receive indices, wait queues, closed state, type information and an internal runtime lock. The lock implementation depends on the platform; it is not a universal synonym for futex.",
      "A channel value refers to the same channel when copied or passed to a function. The checked implementation represents it with a pointer, typically 8 bytes on a 64-bit target. The Go API does not expose hchan fields.",
      "A waiting sudog links the goroutine, the channel and the send/receive storage when needed. A blocking select registers its participating non-nil channel cases; it does not create a new goroutine for each case.",
      "In an ordinary blocked receive, a sender removes the waiter from recvq, transfers the value and makes the receiver runnable. The receiver releases its sudog after it resumes. An allocation profile alone does not prove why many waiters were needed."
    ],
    "detailsRU": [
      "В проверенном hchan находятся ёмкость и заполнение буфера, индексы отправки/чтения, очереди, состояние закрытия, информация о типе и внутренний runtime lock. Реализация блокировки зависит от платформы; она не всегда равнозначна futex.",
      "Копирование значения канала или передача в функцию сохраняет ссылку на тот же канал. В проверенной реализации это указатель, обычно 8 байт на 64-битной платформе. Поля hchan не являются частью Go API.",
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
    "qEN": "Q17: How does a channel safely hand a value to a waiting receiver?",
    "qRU": "Как канал безопасно передаёт значение ожидающему получателю?",
    "shortEN": "The sender transfers the value while holding the channel lock, releases the lock, and makes the receiver runnable. Runnable does not mean already running. Parking and stack copying follow a coordinated protocol so the waiting receiver’s storage stays valid.",
    "shortRU": "Отправитель передаёт значение под блокировкой канала, отпускает её и делает получателя готовым к запуску. Готовность ещё не означает выполнение. Парковка и копирование стека согласованы так, чтобы место для результата оставалось корректным.",
    "detailsEN": [
      "For an open channel, chansend first checks for a waiting receiver under the lock. It can bypass the buffer and copy to the receive destination with sendDirect. The source may be on the stack or heap; a discarded receive needs no destination copy.",
      "When a receive must wait, it registers a sudog and sets parkingOnChan before gopark. On the system-stack parking path, chanparkcommit sets activeStackChans, clears parkingOnChan and then unlocks the channel.",
      "activeStackChans does not permanently pin the stack. Stack copying coordinates with the channels and adjusts sudog pointers. sendDirect uses a type-aware barrier for pointer transfers and avoids preemption between reading the destination pointer and using it. recvDirect is a related direct-transfer path.",
      "After the copy, the sender unlocks before goready. The receiving goroutine later resumes, clears its waiting state and releases its sudog. Neither immediate execution nor a particular CPU cache state is promised."
    ],
    "detailsRU": [
      "Для открытого канала chansend сначала проверяет ожидающего получателя под блокировкой. Значение может пройти мимо буфера к месту результата через sendDirect. Источник может быть на стеке или в куче; при отбрасывании результата копия в место назначения не нужна.",
      "Если чтению нужно ждать, оно регистрирует sudog и устанавливает parkingOnChan перед gopark. На пути парковки через системный стек chanparkcommit устанавливает activeStackChans, снимает parkingOnChan и затем отпускает блокировку.",
      "activeStackChans не закрепляет стек навсегда. Копирование стека согласуется с каналами и поправляет указатели sudog. sendDirect использует барьер с учётом типа для переноса указателей и исключает вытеснение между чтением адреса назначения и его использованием. Есть и связанный путь recvDirect.",
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
    "qEN": "Q18: How does select choose a case, and can cancellation take priority?",
    "qRU": "Как select выбирает готовую ветку и можно ли дать отмене приоритет?",
    "shortEN": "A select runs one ready channel operation. If several are ready, it chooses one uniformly at random. A default branch runs only when none is ready; without it, select waits. A nil channel cannot become ready. Putting cancellation first in the source does not give it priority.",
    "shortRU": "Select выполняет одну готовую операцию с каналом. Если готовы несколько, он выбирает одну равновероятно. Ветка default выполняется только при отсутствии готовых операций; без неё select ждёт. Nil-канал не может стать готовым. Порядок веток в коде не даёт отмене приоритет.",
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
    "qEN": "Q19: Does every select call selectgo, and how does the general path work?",
    "qRU": "Каждый ли select вызывает selectgo и как устроен общий путь?",
    "shortEN": "No. The compiler specializes simple selects: an empty one blocks, a default-only one runs its body, one channel case becomes an ordinary operation, and one channel case plus default becomes a non-blocking probe. Two or more channel cases use selectgo, which separates randomized polling from consistent channel locking.",
    "shortRU": "Нет. Простые select компилятор разбирает отдельно: пустой блокируется, один default выполняет тело, единственная операция становится обычной операцией с каналом, а операция с default — неблокирующей пробой. Две и более операции идут в selectgo, где случайный порядок опроса отделён от согласованного порядка блокировок.",
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
    "qEN": "Q20: What does compare-and-swap do, and why is a separate check and store different?",
    "qRU": "Что делает compare-and-swap и чем отличается от отдельной проверки и записи?",
    "shortEN": "Compare-and-swap means: replace this value only if it still equals the value I expect. The comparison and conditional update are one atomic operation. It returns true if the update happened and false otherwise, so competing goroutines can tell who changed the state.",
    "shortRU": "Compare-and-swap означает: замени это значение, только если оно всё ещё равно ожидаемому. Проверка и условная запись выполняются одной атомарной операцией. Результат true означает успешную замену, false — несовпадение; так конкурирующие горутины узнают, кто изменил состояние.",
    "detailsEN": [
      "Think of three inputs: the location, expected old value and proposed new value. If state starts at 0 and two goroutines each try CAS(0, 1), only one can succeed as long as nothing resets state. A failure does not wait or retry by itself.",
      "Separate atomic Load and Store calls do not make a combined check-and-update atomic. Both callers can load 0 before either stores 1. CAS closes this gap for the one value it operates on; it does not make an entire multi-field algorithm atomic.",
      "Go atomics behave as if in a sequentially consistent order. The checked amd64 implementation uses LOCK CMPXCHG; arm64 has LSE and load/store-exclusive paths. Cache coherence is part of the hardware implementation, not a promise of one latency, one cache-line size or identical instructions on every CPU.",
      "CAS compares the current value, not its history: A → B → A can still match A. A state/version design needs its own correctness argument. Start with a mutex for compound invariants unless an atomic design has a concrete benefit."
    ],
    "detailsRU": [
      "Запомни три входа: место в памяти, ожидаемое старое значение, предлагаемое новое. Если state сначала 0 и две горутины пробуют CAS(0, 1), успешной будет только одна, пока никто не сбрасывает state. Неудачный CAS сам не ждёт и не повторяется.",
      "Отдельные атомарные Load и Store не делают всю проверку с изменением атомарной. Оба участника могут прочитать 0 до первой записи 1. CAS закрывает этот промежуток для одного значения, но не превращает весь алгоритм с несколькими полями в атомарный.",
      "Атомики Go ведут себя как операции в едином последовательном порядке. В проверенной реализации amd64 используется LOCK CMPXCHG; у arm64 есть пути LSE и exclusive load/store. Когерентность кешей относится к аппаратной реализации, а не к гарантии одной задержки, размера cache line или инструкции для всех CPU.",
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
    "qEN": "Q21: How does a mutex acquire, wait and hand off — and what does 1 ms really mean?",
    "qRU": "Как Mutex захватывается, ждёт и передаёт владение — и что на самом деле означает 1 мс?",
    "shortEN": "A Mutex protects shared state through mutual exclusion and synchronization. In the checked runtime, an uncontended Lock first tries a CAS; contention can lead to brief spinning and then parking. Normal mode allows competition, while starvation mode favors waiting goroutines. The 1 ms threshold is an implementation policy, not a maximum wait time.",
    "detailsEN": [
      "The zero value is ready to use. Do not copy a Mutex after first use. Unlock synchronizes before a later successful Lock; a failed TryLock establishes no synchronization and gives no permission to read protected fields.",
      "The public API does not associate a Mutex with a particular goroutine: one goroutine may lock and another unlock under a valid protocol. There is no recursive-lock exception. If the current owner calls Lock again and nobody can unlock, it waits on itself.",
      "In Go 1.25.0/1.26.1, the internal mutex has an int32 state and uint32 semaphore. State includes locked/woken/starving flags and a waiter count. This layout and the CAS fast path are implementation details, not portable timing or size promises.",
      "Spinning eligibility uses runtime heuristics: limited attempts, CPU/P availability and an empty local run queue. It does not inspect an owner goroutine and prove that owner is running. If spinning is unsuitable or unsuccessful, the goroutine can park.",
      "Normal mode: wake a waiter → it competes with arrivals → it may wait again. In the slow path, prolonged waiting beyond the 1 ms threshold can switch the mutex to starvation mode while it is still locked. Unlock then hands ownership to the front waiter. The mode can end when the last waiter runs or its wait was short; none of this bounds scheduling or lock-hold time."
    ],
    "practicalRU": "Ищи конкуренцию через mutex- и block-профили, затем сокращай критические секции или меняй владение. SetMutexProfileFraction(5) задаёт в среднем одно из пяти событий конкуренции за mutex, а не каждый пятый Lock. Профиль показывает конкуренцию, но не доказывает, что сбой вызван starvation mode.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar mu sync.Mutex\n\tmu.Lock()\n\tfmt.Println(mu.TryLock()) // false: already locked\n\tmu.Unlock()\n\tif mu.TryLock() {\n\t\tfmt.Println(\"acquired\")\n\t\tmu.Unlock()\n\t}\n}",
    "shortRU": "Mutex защищает общее состояние взаимным исключением и синхронизацией. В проверенном рантайме свободный Lock сначала пробует CAS; при конкуренции возможны короткое вращение и парковка. Обычный режим допускает соревнование, а starvation mode отдаёт предпочтение ожидающим. Порог 1 мс — политика реализации, а не максимальное время ожидания.",
    "detailsRU": [
      "Нулевое значение готово к работе. После первого использования Mutex нельзя копировать. Unlock синхронизируется с последующим успешным Lock; неуспешный TryLock не создаёт синхронизации и не разрешает читать защищённые поля.",
      "API не привязывает Mutex к определённой горутине: при корректном протоколе одна может захватить его, а другая освободить. Исключения для рекурсивного захвата нет. Если владелец снова вызывает Lock и освободить мьютекс некому, он ждёт самого себя.",
      "В Go 1.25.0/1.26.1 внутренний mutex содержит int32 state и uint32 sema. В state находятся флаги locked/woken/starving и число ожидающих. Эта раскладка и CAS на быстром пути — детали реализации, а не переносимая гарантия размера или времени.",
      "Допуск к spinning основан на эвристиках: ограничении попыток, доступности CPU/P и пустой локальной очереди. Рантайм не проверяет горутину-владельца, чтобы доказать, что она сейчас выполняется. Когда spinning не подходит или не помог, горутина может парковаться.",
      "Обычный режим: разбудили ожидающего → он соревнуется с новыми → может снова ждать. В медленном пути ожидание дольше порога 1 мс может включить starvation mode, пока mutex ещё захвачен. Unlock передаёт владение первому ожидающему. Режим может закончиться у последнего ожидающего или после короткого ожидания; это не ограничивает задержки планировщика и время удержания lock."
    ],
    "practicalEN": "Use mutex and block profiles to locate contention, then shorten critical sections or change ownership. SetMutexProfileFraction(5) requests roughly one in five mutex contention events, not every fifth Lock. A profile is evidence about contention, not proof that starvation mode caused an outage.",
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
    "qEN": "Q22: WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?",
    "qRU": "WaitGroup, Once и Context: кто ждёт, публикует инициализацию и просит отмену?",
    "shortEN": "WaitGroup waits for counted tasks; Once makes callers wait for a single initialization; Context carries cancellation, deadlines and request-scoped values. These are different contracts. Waiting does not serialize workers, cancellation does not join them, and a one-time initializer is not a retry loop.",
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
    "shortRU": "WaitGroup ждёт учтённые задачи; Once заставляет вызывающих дождаться единственной инициализации; Context передаёт отмену, дедлайны и значения запроса. Это разные контракты. Ожидание не сериализует workers, отмена не ждёт их завершения, а однократная инициализация не является циклом повторных попыток.",
    "detailsRU": [
      "WaitGroup: зарегистрируй первую задачу до того, как Wait сможет увидеть нулевой счётчик. С Add/Done обычно вызывай Add до запуска горутины. После первого использования нельзя копировать; новую группу задач начинай только после возврата всех предыдущих Wait. Wait делает завершённую работу видимой ожидающему, но не защищает записи workers друг от друга.",
      "WaitGroup.Go добавлен в Go 1.25. Он регистрирует и запускает задачу: вызывай wg.Go(f), а не go wg.Go(f). Функция не должна паниковать. Go 1.26.1 повторяет перехваченный ненулевой panic без Done, тогда как 1.25.0 использовал defer Done. Это не даёт Wait выпустить main до завершения такого panic; паника callback всё равно нарушает контракт.",
      "История реализации: Go 1.17 использовал три слова uint32 для выровненного 64-битного состояния и семафора. В Go 1.25/1.26 используется atomic.Uint64: старшие 32 бита — задачи, младшая часть — флаг synctest и 31 бит ожидающих. Сначала запоминай контракт, а не вечную раскладку из двух счётчиков.",
      "Once.Do публикует инициализацию только после завершения f. CAS с установкой done до вызова f позволил бы проигравшим вернуться слишком рано. Рекурсивный Do того же Once блокируется навсегда. После panic в f Once считает вызов выполненным: следующие Do не повторят f. Once после использования тоже нельзя копировать.",
      "Отмена — просьба: работа должна проверять Done или использовать API с поддержкой контекста, а владелец при необходимости отдельно ждёт завершения. Вызывай CancelFunc для освобождения связанных ресурсов. Методы Context безопасны при параллельных вызовах; изменяемые объекты в values автоматически не защищаются.",
      "WithoutCancel (Go 1.21+) сохраняет поиск values, но убирает дедлайн, отмену и cause родителя: Done равен nil. При использовании добавь явный таймаут. Это только для осознанно отделённой best-effort работы с владельцем; доставки и остановки вместе с сервисом он не обеспечивает. Обязательному аудиту нужна надёжная передача или завершение до ответа об успехе."
    ],
    "practicalEN": "Ask three questions: who registers and joins the task, who publishes initialized state, and who cancels it? Treat background work as a lifecycle decision. A timeout plus a detached goroutine is not a durable queue.",
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
    "qEN": "Q23: How do stack and heap allocation differ, and how do you compare their cost?",
    "qRU": "Чем отличаются выделения на стеке и в куче и как сравнивать их стоимость?",
    "shortEN": "Local storage can often live in a goroutine stack frame or disappear through optimization. Heap storage has allocator and GC costs. That makes avoiding unnecessary heap allocations useful, but neither taking an address nor returning a pointer proves that a particular call allocates. Check the optimized caller and measure the real workload.",
    "detailsEN": [
      "The language guarantees that a referenced value remains valid, not a storage location. Stack frames hold local state; Go may grow and move a goroutine stack. Values may also stay in registers or be optimized away.",
      "Stack allocation is not universally one instruction or zero GC work: frame setup, initialization and stack growth have costs, and stack pointers are scanned as GC roots. Heap objects need allocation and later reclamation; pointer-free objects avoid scanning their contents, not all GC work.",
      "Value versus pointer is first an API and ownership decision. Copies can cost time; pointers can introduce sharing, indirection and longer lifetimes. Neither is always faster. Inlining and escape analysis can remove an apparent allocation at a call site.",
      "Use compiler diagnostics (-gcflags=\"-m=2\") to understand placement, and benchmarks with -benchmem plus profiles to assess impact. Disabling inlining is a comparison experiment, not a faithful production benchmark."
    ],
    "practicalRU": "Сначала выбери корректное владение данными, затем сравни эквивалентные вызовы под рабочей версией компилятора. Не добавляй глобальный указатель только ради того, чтобы benchmark «не исчез»: это само меняет время жизни объекта. Сохраняй наблюдаемый результат так, чтобы не навязать лишний escape. Опора: «владение → размещение → измерение».",
    "code": "package example\n\ntype User struct{ ID int }\n\nfunc NewUserValue(id int) User { return User{ID: id} }\nfunc NewUser(id int) *User     { return &User{ID: id} }\n\nfunc ReadID(id int) int { return NewUser(id).ID }\n\n// Compare the optimized ReadID caller, not just NewUser in isolation.",
    "shortRU": "Локальные данные часто помещаются в кадре стека горутины или устраняются оптимизацией. У кучи есть расходы аллокатора и GC. Поэтому ненужные выделения в куче полезно сокращать, но ни взятие адреса, ни возврат указателя сами по себе не доказывают аллокацию конкретного вызова. Проверяй оптимизированный вызывающий код и измеряй реальную нагрузку.",
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
    "qEN": "Q24: How does escape analysis choose storage, and how do you verify a particular allocation?",
    "qRU": "Как escape analysis определяет размещение и как проверить конкретное выделение памяти?",
    "shortEN": "Escape analysis follows pointer lifetimes at compile time. A pointer must not outlive its stack storage or be retained in the heap while pointing into that storage. The compiler may inline calls, eliminate objects or choose heap storage for size and other constraints. Syntax alone is not a reliable allocation test.",
    "detailsEN": [
      "Passing a pointer down is safe for stack storage only if the callee does not retain it beyond that lifetime. Conversely, returning &x from a small helper need not allocate at an inlined call site that consumes x locally. SaveGlobal below deliberately retains a pointer.",
      "Interfaces and closures do not automatically allocate. What matters is whether the concrete operation is known, whether captured data is retained, and what the compiler can prove. A goroutine may extend captured data lifetime, but this is not a rule that every closure goes to the heap.",
      "Dynamic make is version-sensitive. Go 1.25 already has a conditional stack-buffer path for non-escaping slices; Go 1.26 release notes describe further cases. A small runtime capacity can use a stack buffer, while a larger capacity falls back to the heap. Escape of the slice can still require heap storage.",
      "There is no universal 64 KiB rule. In Go 1.26.1 the checked defaults distinguish explicit stack variables (128 KiB) and implicit allocations (64 KiB); alignment, total-frame constraints and flags also matter. These are implementation limits, not language guarantees.",
      "Inspect the actual caller with go build -gcflags=\"-m=2\", then benchmark with -benchmem and profile. A message about the helper body does not by itself describe an inlined copy. If replacing make with a fixed array, validate bounds and preserve ownership; returning its slice can move the array to the heap."
    ],
    "practicalRU": "В примере ReadLocal использует результат сразу, SaveGlobal передаёт адрес функции, которая удерживает его. Sum проверяет диапазон n и реально читает заполненные байты, поэтому пример не сводится к неиспользуемому buf. Проверяй и маленькие, и большие размеры: «не убегает» у динамического make не означает «никогда не выделяет в куче».",
    "code": "package example\n\nvar Saved *int\n\nfunc makeInt(v int) *int  { return &v }\nfunc retain(p *int)       { Saved = p }\nfunc ReadLocal(v int) int { return *makeInt(v) }\nfunc SaveGlobal(v int)    { retain(&v) }\n\nfunc Sum(n int) (int, bool) {\n\tif n < 0 || n > 1024 {\n\t\treturn 0, false\n\t}\n\tbuf := make([]byte, n)\n\tfor i := range buf {\n\t\tbuf[i] = byte(i)\n\t}\n\tsum := 0\n\tfor _, v := range buf {\n\t\tsum += int(v)\n\t}\n\treturn sum, true\n}",
    "shortRU": "Escape analysis отслеживает время жизни указателей при компиляции. Указатель не должен пережить своё хранилище в стеке или сохраняться в куче, указывая на это хранилище. Компилятор может встроить вызов, устранить объект или выбрать кучу из-за размера и других ограничений. По одному синтаксису надёжно определить аллокацию нельзя.",
    "detailsRU": [
      "Передача указателя вниз совместима со стеком лишь если вызываемая функция не сохраняет его дольше нужного времени жизни. И наоборот, return &x из небольшого помощника не обязательно выделяет память в куче в месте встроенного вызова с локальным использованием. Ниже SaveGlobal намеренно сохраняет указатель.",
      "Интерфейс и замыкание не означают автоматическую аллокацию. Важны известность конкретной операции, удержание захваченных данных и то, что может доказать компилятор. Горутина способна продлить время жизни захваченного значения, но не каждое замыкание обязано жить в куче.",
      "Динамический make зависит от версии. В Go 1.25 уже есть условный путь со стековым буфером для неубегающего среза; release notes Go 1.26 описывают дополнительные случаи. Небольшая динамическая capacity может использовать стек, большая — кучу. Если срез уходит наружу, хранение в куче всё ещё может понадобиться.",
      "Универсального правила 64 KiB нет. В проверенных настройках Go 1.26.1 различаются явные переменные стека (128 KiB) и неявные выделения (64 KiB); влияют также выравнивание, ограничения всего кадра и флаги. Это пределы реализации, а не гарантии языка.",
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
    "qEN": "Q25: How do mcache, mcentral, mheap and scan/noscan fit together?",
    "qRU": "Как связаны mcache, mcentral, mheap и разделение scan/noscan?",
    "shortEN": "For a small heap allocation, the runtime can take a free slot from a span cached by the current P. If the cache cannot satisfy it, slower paths refill or obtain pages. Pointer-free payloads do not need pointer scanning, but they still occupy memory and must be tracked and reclaimed. A fast path is not a guarantee that every allocation is lock-free.",
    "detailsEN": [
      "In the checked runtime a heap page is 8 KiB, independent of the OS page size. An mspan describes a contiguous run of one or more pages. A small-object span holds equal-sized slots; size classes round requests up, so object size and span size are different.",
      "mcache is owned by a P, not a goroutine. A free slot in its cached span can be allocated without a lock. Refill may need sweeping and shared structures; mcentral manages partial/full, swept/unswept span sets, not one simple spinlock per size. mheap supplies page runs. An allocation can also incur zeroing and GC assist costs.",
      "Eligible pointer-free objects smaller than 16 bytes may share a 16-byte tiny block. Small size classes extend to 32 KiB, but payload routing must include metadata: the checked generic mallocgc path uses size ≤ 32768−8. Larger requests use the large-object path. These are version-specific details, not public API boundaries.",
      "scan/noscan depends on whether the allocated object contains GC pointers. The bytes behind a []byte or string contain no pointers; the slice/string descriptor does contain a data pointer. A []string backing array contains string descriptors and therefore pointers. In the code, Blob is pointer-free but Holder is not.",
      "noscan means no pointer traversal inside that object. The GC still marks its reachability, accounts for it and can reclaim it when unreachable. Compact data and numeric offsets can reduce scanning, but do not make total GC time O(1) or zero; serialization, metadata, retained capacity and lifetime still matter."
    ],
    "practicalRU": "Сравни alloc_space, inuse_space и метрики /gc/scan/heap:bytes и /gc/scan/stack:bytes при одинаковой нагрузке. Разделяй объём выделений, удержание и объём сканируемой памяти. Массив байтов может почти не добавлять pointer scanning и одновременно удерживать много RAM. Нельзя считать разные размеры/схемы хранения честным сравнением только по паузе одного GC. Опора: «размер ячейки → откуда берётся span → есть ли внутри ссылки».",
    "code": "package example\n\ntype Blob [64]byte // The payload has no pointers.\n\ntype Holder struct {\n\tBytes []byte // The descriptor points to a backing array.\n\tText  string // The descriptor points to string bytes.\n}\n\n// A []Holder backing array contains pointers.\n// A []Blob backing array does not; neither is exempt from GC.",
    "shortRU": "Для небольшого объекта кучи runtime может взять свободную ячейку из span в кеше текущего P. Если кеш не справился, более дорогие пути пополняют его или получают страницы. В данных без указателей не нужно искать ссылки, но они занимают память, учитываются и освобождаются. Быстрый путь не означает, что любая аллокация обходится без блокировок.",
    "detailsRU": [
      "В проверенном runtime страница кучи — 8 KiB, независимо от размера страницы ОС. mspan описывает непрерывную область из одной или нескольких страниц. Span небольших объектов содержит ячейки одинакового размера; классы округляют запрос вверх, поэтому размер объекта и span — разные величины.",
      "mcache принадлежит P, а не горутине. Свободную ячейку его кешированного span можно выделить без блокировки. Пополнение может потребовать sweep и общие структуры; mcentral управляет наборами partial/full и swept/unswept, а не одним простым spinlock на размер. mheap выдаёт области страниц. Возможны также расходы на обнуление и помощь GC.",
      "Подходящие объекты без указателей размером менее 16 байт могут делить блок 16 байт. Классы небольших объектов доходят до 32 KiB, но при выборе пути нужно учитывать метаданные: проверенный общий mallocgc использует size ≤ 32768−8. Более крупный запрос идёт по пути large object. Это детали версии, а не публичные границы API.",
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
    "qEN": "Q26: How does Go's GC decide what to keep, and what happens during a collection?",
    "qRU": "Как GC в Go решает, что сохранить, и из каких этапов состоит сборка?",
    "shortEN": "Go traces pointers from roots to find heap objects that must stay alive, then reclaims unmarked objects for reuse. Most marking and sweeping run alongside the program; phase transitions use stop-the-world pauses. Think reachability first, then the white/grey/black model.",
    "detailsEN": [
      "Roots include live pointers in goroutine stacks, globals and runtime structures outside the heap. A reachable object stays alive even if the application no longer needs it. A cycle with no path from any root can be collected: this is tracing, not reference counting.",
      "In the teaching model, white means not yet marked, grey means marked with outgoing pointers still to scan, and black means scanned. Colours describe work, not fields in each object. Root jobs and heap scanning can interleave; scanning a stack temporarily stops that goroutine.",
      "First, STW finishes any pending sweep and prepares marking, including enabling the write barrier. Concurrent marking then traces roots and heap pointers; allocating goroutines may assist. Objects allocated during marking are treated as black. Termination must account for outstanding root jobs and buffered work, not just one empty queue.",
      "A second STW transition finishes marking and prepares sweeping. Sweep reclaims unmarked slots in the background and on allocation paths. Scavenging returns unused physical memory to the OS separately; freeing an object does not promise an immediate RSS drop.",
      "Pauses have no fixed duration guarantee. Cost depends on live data, pointer layout, roots, allocation rate and workload. Green Tea improves marking/scanning locality and CPU scalability; it does not turn this into a moving or generational collector."
    ],
    "practicalRU": "На интервью начни с «GC сохраняет достижимое», затем назови фазы. В примере глобальный root удерживает цикл из двух узлов: после GC чтение даёт 42. После удаления последнего пути от корней цикл можно собрать, но точный момент освобождения и падение RSS не обещаем. Для удержания памяти ищи путь от корня: глобальный кеш, живую горутину, срез. Опора: «нашли → просмотрели → освободили»; отдельно объясни, почему кольцо ссылок само себя не удерживает.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\nvar root *Node\n\nfunc makeCycle() {\n\ta, b := &Node{Value: 7}, &Node{Value: 42}\n\ta.Next, b.Next = b, a\n\troot = a\n}\n\nfunc main() {\n\tmakeCycle()\n\truntime.GC()\n\tfmt.Println(root.Next.Value) // 42: reachable through a global\n\troot = nil\n\truntime.GC() // The cycle is now collectible; no RSS promise.\n}",
    "shortRU": "Go обходит указатели от корней, находит объекты кучи, которые нужно сохранить, и освобождает неотмеченные объекты для повторного использования. Основная разметка и очистка идут вместе с программой; переходы между фазами требуют stop-the-world. Сначала думай о достижимости, затем — о белом, сером и чёрном цветах.",
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
    "qEN": "Q27: How do GC phases, mark assists, GOGC and GOMEMLIMIT affect memory and latency?",
    "qRU": "Как фазы GC, mark assist, GOGC и GOMEMLIMIT влияют на память и задержки?",
    "shortEN": "GOGC sets a heap growth goal; the pacer starts marking early enough to aim for that goal. GOMEMLIMIT is a soft budget for memory managed by Go, not an OOM shield. GC mostly works alongside the program, but brief stop-the-world transitions and allocation assists can still affect latency.",
    "detailsEN": [
      "A useful four-stage model is mark setup during STW, concurrent marking, mark termination during STW, then concurrent sweeping. Sweep termination precedes setup. Sweeping reclaims dead slots; returning pages to the OS is separate scavenger work. No fixed pause duration is guaranteed.",
      "Mark assists make allocating goroutines contribute tracing work according to allocation debt. This can add request latency. In Go 1.26.1 the background marking target is about 25% of GOMAXPROCS CPU capacity during marking, not a cap on all GC CPU usage.",
      "For estimates, heap goal = live heap + (live heap + roots) × GOGC / 100. With 100 MiB live and 20 MiB roots, GOGC=100 gives 220 MiB, not 200 MiB. The trigger is earlier than the goal; minimums, pacing and the memory limit affect the actual target.",
      "GOMEMLIMIT accounts for runtime memory as MemStats.Sys − MemStats.HeapReleased. This includes more than the heap but excludes C allocations, manually mmap-ed memory and the executable. It is neither process RSS nor a container limit. The runtime adjusts GC and memory release; it may exceed the budget to preserve progress.",
      "If reachable data cannot fit, collecting more often cannot remove it. Leave measured headroom for memory outside Go and workload spikes. Even with GOGC=off, a finite memory limit can drive GC. A lower limit can increase collection work rather than solve a leak."
    ],
    "practicalRU": "Сначала сравни память runtime, RSS/память контейнера, живую кучу, скорость аллокаций и GC CPU. Затем найди удержание данных и горячие выделения через профили и trace. Для контейнера 4 GiB значение 3600 MiB может быть лишь стартовой гипотезой после оценки резерва; оно не гарантирует отсутствие OOM. Снижай ненужные выделения и ограничивай кеши/конкурентность. sync.Pool рассматривай только для измеренного переиспользования: он не задаёт предел памяти и не гарантирует сохранение объектов. Опора для памяти: «цель — когда начать — что учитывает бюджет».",
    "code": "// Conceptual estimates, not executable Go or an exact pacer trace.\nheapGoal ≈ liveHeap + (liveHeap + roots) * GOGC / 100\n100 MiB + (100 MiB + 20 MiB) * 100 / 100 = 220 MiB\n// Marking starts before the goal; the limit may lower the goal.\nruntimeMemory = MemStats.Sys - MemStats.HeapReleased\n// runtimeMemory != process RSS != container memory usage",
    "shortRU": "GOGC задаёт цель роста кучи; pacer начинает разметку заранее, чтобы стремиться к этой цели. GOMEMLIMIT — мягкий бюджет памяти под управлением Go, а не защита от любого OOM. GC в основном работает вместе с программой, но переходы stop-the-world и помощь при аллокациях влияют на задержки.",
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
    "qEN": "Q28: What does Go's hybrid write barrier protect, and which pointer writes need it?",
    "qRU": "Что защищает гибридный барьер записи Go и при каких записях указателей он нужен?",
    "shortEN": "The collector scans a graph while the program changes its edges. The hybrid write barrier keeps those changes from hiding reachable objects from the scan. It preserves GC correctness; it does not synchronize application goroutines or make a data race safe.",
    "detailsEN": [
      "Imagine A is already scanned, B is not yet scanned, and B points to an unmarked C. Moving that link from B to A could make a plain concurrent traversal miss C. The barrier records pointer changes so C remains protected even if the collector has passed A and has not reached B.",
      "The hybrid combines deletion shading of the old target with insertion shading of the new target. In the theoretical algorithm, insertion shading is needed while the current stack is grey. The Go 1.26.1 implementation does not test that stack colour for each store: compiler-generated code records relevant old/new pointers in a write-barrier buffer. Safe cases can be eliminated; shading is not necessarily an immediate scan.",
      "This is not heap-only: storing heap pointers into globals also needs protection. The compiler omits barriers for writes it proves target the current stack frame. A store through a pointer passed to a callee may still get a barrier because that pointer could target the heap. Even writing nil may need the deletion part.",
      "The hybrid design removed the need for an end-of-mark STW rescan of stacks in Go 1.8. Ordinary stack scanning still happens. Barriers are enabled for marking; phase transitions still need STW. Do not confuse this GC mechanism with atomic operations, locks or a CPU memory fence.",
      "Go 1.26.1 uses a non-generational, non-compacting heap collector: it does not divide collection by object age or relocate live heap objects to pack them together. Goroutine stacks can move. Escape analysis and size classes reduce some costs, but do not prove generations unnecessary or fragmentation impossible."
    ],
    "practicalRU": "Проговори по схеме: «A уже прошли, B ещё нет; переносим B → C в A → C; C нельзя потерять». В Go-коде барьер вставляет компилятор — вручную вызывать runtime не нужно. Пример требует разных ненулевых a и b и исключительного доступа к обоим узлам. Для совместного доступа нужна своя синхронизация. sync.Pool используй после измерений: Get не обязан вернуть прежний объект, содержимое может исчезнуть в любой момент; ускорение в 5–10 раз и переиспользование на том же P не гарантируются.",
    "code": "package example\n\ntype Node struct {\n\tNext  *Node\n\tValue int\n}\n\n// Move requires distinct, non-nil nodes and exclusive access.\nfunc Move(a, b *Node) {\n\ta.Next = b.Next\n\tb.Next = nil // Deleting a pointer can also need a GC barrier.\n}\n\n// Compiler-generated barriers protect GC, not concurrent callers.\n// White/grey/black states are a teaching model, not observable here.",
    "shortRU": "Сборщик обходит граф, а программа в это время меняет его связи. Гибридный барьер записи не даёт этим изменениям скрыть достижимые объекты от обхода. Он обеспечивает корректность GC, но не синхронизирует горутины приложения и не исправляет data race.",
    "detailsRU": [
      "Представь: A уже просмотрен, B ещё нет, а B ссылается на неотмеченный C. Если перенести эту связь из B в A, простой конкурентный обход может пропустить C. Барьер учитывает изменения указателей и защищает C, даже если сборщик уже прошёл A, но ещё не дошёл до B.",
      "Гибрид сочетает deletion shading старой цели и insertion shading новой. В теоретическом алгоритме новая цель требует shading, пока текущий стек серый. Реализация Go 1.26.1 не проверяет цвет стека при каждой записи: сгенерированный компилятором код заносит нужные старые/новые указатели в буфер барьера. Доказанно безопасные случаи можно исключить; shading не означает немедленный обход объекта.",
      "Это не только куча: запись указателя на объект кучи в глобальную переменную тоже требует защиты. Компилятор убирает барьер, когда доказал запись в текущий кадр стека. Запись через переданный вызываемой функции указатель может получить барьер: такой указатель мог бы вести в кучу. Даже запись nil может требовать deletion-части.",
      "Гибридная схема убрала необходимость повторного сканирования стеков в конце marking во время STW в Go 1.8. Обычное сканирование стеков осталось. Барьеры включены для marking; переходы фаз всё ещё требуют STW. Не путай этот механизм GC с атомиками, блокировками или барьером памяти CPU.",
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
    "qEN": "Q29: What do a slice and a string refer to, and when does append allocate a new backing array?",
    "qRU": "На что ссылаются срез и строка и когда append выделяет новый базовый массив?",
    "shortEN": "A slice is a view of an array: copying the slice does not copy its elements. append reuses that array when capacity is sufficient and allocates a new one otherwise. A string is an immutable sequence of bytes. Exact header sizes and slice growth factors are implementation details.",
    "detailsEN": [
      "In the standard 64-bit runtime layout, a slice has a data pointer, len and cap (three words, usually 24 bytes); a string has a data pointer and byte length (two words, usually 16 bytes). These are not portable language constants. len(string) counts bytes, not Unicode code points.",
      "Assigning b := a copies the slice descriptor. Index writes can affect both views. append returns an updated descriptor: it does not change the len stored in a different slice variable. Draw the descriptors separately from their shared array.",
      "a[:len(a):len(a)] restricts the capacity of that view. Appending at least one element must then use a new array, but index writes before that append still share storage. make plus copy creates independent element storage; pointers or nested slices inside the elements can still share their targets.",
      "For the examined Go 1.25.0 and 1.26.1 growth path, a request larger than twice the old capacity uses the requested length as a starting capacity. Otherwise small capacities below 256 double; larger ones use a smooth transition towards 1.25×. Allocation rounding can change the final cap. Go 1.17 used a threshold of 1024 and a different transition. None of these formulas is a language guarantee."
    ],
    "practicalRU": "Опора для памяти: len — что видно; cap — место для append; copy — отдельное хранилище элементов. На интервью сначала предскажи общие записи, затем обсуждай формулу роста. Если итоговый размер известен, можно заранее выделить место; число аллокаций измеряй, а не угадывай по cap.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ta := make([]int, 2, 4)\n\ta[0], a[1] = 1, 2\n\tlimited := a[:len(a):len(a)]\n\tlimited[0] = 9\n\tgrown := append(limited, 3)\n\tgrown[0] = 7\n\tindependent := make([]int, len(a))\n\tcopy(independent, a)\n\tindependent[1] = 8\n\tfmt.Println(a, grown, independent)\n}",
    "shortRU": "Срез — это представление массива: копирование среза не копирует его элементы. append использует прежний массив, пока хватает capacity, иначе выделяет новый. Строка — неизменяемая последовательность байтов. Точные размеры заголовков и коэффициенты роста относятся к реализации.",
    "detailsRU": [
      "В стандартной реализации на 64-битной платформе у среза указатель, len и cap (три машинных слова, обычно 24 байта); у строки указатель и длина в байтах (два слова, обычно 16 байт). Это не переносимые константы языка. len(string) считает байты, а не Unicode-кодовые точки.",
      "Присваивание b := a копирует дескриптор среза. Запись по индексу может быть видна через оба среза. append возвращает обновлённый дескриптор: len другой переменной он не меняет. Рисуй дескрипторы отдельно от общего массива.",
      "a[:len(a):len(a)] ограничивает capacity этого представления. Добавление хотя бы одного элемента потребует нового массива, но запись по индексу до append всё ещё затрагивает общие данные. make плюс copy отделяет хранилище элементов; указатели или вложенные срезы внутри элементов могут по-прежнему разделять свои данные.",
      "В проверенном пути Go 1.25.0 и 1.26.1 запрос больше удвоенной старой capacity берёт требуемую длину как начальную capacity. Иначе capacity меньше 256 удваивается, а для больших применяется плавный переход к 1.25×. Округление аллокатора может изменить итоговый cap. В Go 1.17 порог был 1024, переход — другим. Ни одна из этих формул не является гарантией языка."
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
    quizIds: ["q12"]
  },
  {
    "id": "c30",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": "sim7",
    "qEN": "Q30: How did classic Go maps use buckets and incremental growth before Swiss Tables?",
    "qRU": "Как классические map до Swiss Tables использовали бакеты и постепенное расширение?",
    "shortEN": "Classic maps used buckets with eight slots and overflow chains. A hash prefix filtered candidates before key comparison. Excess load grew the bucket array; excess overflow could trigger a same-size rebuild. Evacuation spread copying across mutations, but did not guarantee constant insertion latency.",
    "detailsEN": [
      "In the Go 1.17 implementation, low hash bits select one of 2^B primary buckets. Each bucket has eight tophash bytes, grouped keys and values, and an overflow link. Occupied tophash values encode the high hash byte, adjusted to avoid reserved states; a match still needs key equality.",
      "The growth test combines a load threshold of about 6.5 entries per primary bucket with a minimum-entry condition. Too much load doubles the primary bucket count. Too many overflow buckets without excess load instead triggers same-size growth to reorganize chains.",
      "While growing, oldbuckets retains the old storage. growWork evacuates the relevant old bucket and may advance another. Each evacuation includes its overflow chain, and allocating the new bucket array also costs work. Incremental does not mean every mutation has a fixed time bound.",
      "A map index is not addressable under the language rules, so &m[k] is invalid in both old and new maps. For map[K]Struct, read a value, modify the copy, then assign it back. map[K]*Struct allows pointed-to mutation, but shared access still requires synchronization."
    ],
    "practicalRU": "Опора: загрузка → больше бакетов; overflow → возможно прежний размер. Отделяй историческую реализацию от контракта языка. На обычном интервью сначала объясни обновление значения map, затем детали эвакуации.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\n\nfunc main() {\n\tm := map[string]Counter{\"go\": {N: 1}}\n\tv := m[\"go\"]\n\tv.N++\n\tfmt.Println(m[\"go\"].N)\n\tm[\"go\"] = v\n\tfmt.Println(m[\"go\"].N)\n}",
    "shortRU": "Классические map использовали бакеты по восемь слотов и overflow-цепочки. Префикс хеша отбирал кандидатов перед сравнением ключей. Высокая загрузка увеличивала массив бакетов; избыток overflow мог вызвать перестройку того же размера. Эвакуация распределяла перенос между изменениями map, но не гарантировала постоянную задержку вставки.",
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
    "qEN": "Q31: How do Swiss Tables find a key and grow a Go map?",
    "qRU": "Как Swiss Tables находят ключ и расширяют map в Go?",
    "shortEN": "Swiss Tables first filter a group using short hash fingerprints, then compare candidate keys. Go uses groups of eight slots and a directory of bounded-size tables. This reduces some lookup and growth work, but neither a one-cycle lookup nor constant worst-case insertion latency is guaranteed.",
    "detailsEN": [
      "Each group has eight control bytes and eight key/value slots. H2 uses the low seven hash bits; H1 uses the remaining bits for probing. On a 64-bit hash this is a 57/7 split, not a rule for every target. Occupied bytes hold H2, 0x80 means empty and 0xFE means deleted. The keys and values do not have to fit in one cache line.",
      "Metadata matching produces candidate slots, not a final answer. The portable SWAR implementation uses several arithmetic/bitwise operations and may include extra candidates; amd64 has a SIMD intrinsic. Actual key equality decides the match. Hashing, candidate loops and possible later groups still cost work.",
      "After checking candidates in a group, an empty slot ends an unsuccessful search. A deleted marker cannot end it: a key may have been placed farther along the probe sequence. Go uses quadratic group probing, not a linked overflow chain or a simple linear scan of groups.",
      "The single-group small-map representation can hold all eight entries. Tables generally reserve space with a 7/8 load limit, including tombstone accounting. A table grows by doubling up to 1024 slots; beyond that it splits. Directory growth can also be necessary. The bound is on one table, not on the entire map or the latency of an insertion.",
      "Both Go 1.25.0 and 1.26.1 can prune unneeded tombstones before growing, without moving live entries. This is best effort and does not shrink allocated table storage. Measure performance on the actual workload; neither a universal speedup percentage nor a p99 guarantee follows from the design."
    ],
    "practicalRU": "Цепочка для воспроизведения: отпечаток → сравнить ключ → остановиться или продолжить. Проговори её и объясни, почему совпадения H2 недостаточно и чем deleted отличается от empty. В sim7 есть разбор условной группы.",
    "code": "// Teaching trace, not executable Go or actual hashes.\n// Search key: \"go\", chosen H2: 0x2A\n// slot:    0      1       2       3      4      5      6      7\n// ctrl:   2A     19      2A      80     11     80     80     80\n// key:   \"rust\" \"c\"     \"go\"   empty  \"js\"  empty  empty  empty\n// 1. Fingerprints select candidate slots 0 and 2.\n// 2. \"rust\" != \"go\"; \"go\" == \"go\": return slot 2's value.\n// 3. Only if no candidate key matched would empty stop this search.",
    "shortRU": "Swiss Tables сначала отбирают слоты группы по коротким отпечаткам хеша, затем сравнивают ключи кандидатов. Go использует группы по восемь слотов и директорию таблиц ограниченного размера. Это уменьшает часть работы поиска и роста, но не гарантирует поиск за один такт или постоянную задержку любой вставки.",
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
    quizIds: ["q13"]
  },
  {
    "id": "c32",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "base",
    "levelLabel": "🟢 Base (Entry/Mid)",
    "simId": "sim7",
    "qEN": "Q32: What do delete and clear release, and what can you rely on during map iteration?",
    "qRU": "Что освобождают delete и clear и на что можно рассчитывать при обходе map?",
    "shortEN": "Deleting an entry removes the map’s references to its key and value, so otherwise unreachable payloads can be collected. It does not promise to shrink the table. clear empties the existing map; replacing one variable leaves aliases pointing to the old map. Iteration order is unspecified.",
    "detailsEN": [
      "Separate three layers: entries, table storage, and process RSS. In Go 1.25/1.26, delete and clear can remove references to payloads while keeping table capacity. Payloads are collectible only if no other references retain them; GC and returning memory to the OS are separate events.",
      "In Swiss tables, deleting from a group with an empty slot can leave empty; otherwise a deleted marker preserves the probe path. Tombstones can be reused or pruned during insertion in the examined 1.25/1.26 implementation, and clear resets them. None of these operations promises table shrinking.",
      "Rebuilding a map can reduce retained table storage after a measured spike. The old map becomes collectible only after all references to it disappear. Copying entries is shallow: pointer values and nested slices may still share payloads. Coordinate replacement with readers and writers; do not rebuild periodically without evidence.",
      "The language does not specify map iteration order; two iterations can still happen to produce the same order. Deleting an entry not yet reached prevents it from being produced. An entry added during iteration may be visited or skipped. Nil maps have zero iterations; sort collected keys when a stable order is required."
    ],
    "practicalRU": "Опора: delete убирает запись; clear очищает общую map; присваивание меняет одну переменную. Перед выводом об утечке спроси, кто ещё держит ссылку. Отработай различие на примере и сравни с удержанием массива в q4.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tm := map[string]int{\"go\": 1}\n\talias := m\n\tm = make(map[string]int)\n\tfmt.Println(len(m), len(alias))\n\tclear(alias)\n\tfmt.Println(len(m), len(alias))\n}",
    "shortRU": "Удаление записи убирает ссылки map на её ключ и значение, поэтому недостижимые другим путём данные могут быть собраны GC. Сжатие таблицы не обещается. clear очищает существующую map; замена одной переменной оставляет другие ссылки на старую map. Порядок обхода не задан.",
    "detailsRU": [
      "Разделяй три уровня: записи, хранилище таблицы и RSS процесса. В Go 1.25/1.26 delete и clear могут убрать ссылки на данные, сохранив вместимость таблицы. Данные доступны для GC, только если их не удерживают другие ссылки; сборка и возврат памяти ОС — отдельные события.",
      "В Swiss Tables удаление из группы с пустым слотом может оставить empty; иначе deleted сохраняет путь поиска. В проверенной реализации 1.25/1.26 tombstones могут переиспользоваться или очищаться при вставке, а clear их сбрасывает. Ни одна из этих операций не обещает сжатия таблицы.",
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
    "qEN": "Q33: What does an interface value contain, and why can a typed nil make an interface non-nil?",
    "qRU": "Что хранит значение интерфейса и почему типизированный nil может дать ненулевой интерфейс?",
    "shortEN": "An interface value has a dynamic type and a dynamic value. It is nil only when neither is present. A nil *T stored in an interface still supplies the dynamic type *T. Runtime layouts explain the representation, but interface semantics do not depend on a fixed byte size.",
    "detailsEN": [
      "For a basic interface used as a value type, assignment requires the concrete type to implement its methods. A type assertion x.(T) asks about the stored dynamic type; the comma-ok form reports failure without panicking. A successful assertion can still return a nil pointer.",
      "In the examined runtime, an empty interface has a type pointer and a data word; an interface with methods has an itab pointer and a data word. An itab pairs the interface and concrete type with method entry points. This is normally two machine words, or 16 bytes on a 64-bit target, not a portable language constant.",
      "The dynamic itab cache has a common lookup path without locking, but inserting a missing entry takes a lock. Describing the entire cache as lock-free is inaccurate. The compiler can also provide tables statically.",
      "Boxing, allocation and dispatch cost depend on the value, escape analysis, inlining and devirtualization. An interface call need not remain indirect after optimization. Neither an allocation for every conversion nor a blanket zero-allocation promise is correct.",
      "Interface equality can panic when equal dynamic types are not comparable, such as []int. Comparing that interface to nil is still valid. Typed nil, an incomparable dynamic value, and an ordinary nil interface are three different cases."
    ],
    "practicalRU": "Опора: «какой тип внутри → какое значение → что именно сравниваем». При успехе функции, возвращающей error, возвращай nil явно. Для производительности сначала измерь конкретный вызов, а не размер заголовка.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvar p *int\n\tvar x any = p\n\tfmt.Println(x == nil, p == nil)\n\tv, ok := x.(*int)\n\tfmt.Println(ok, v == nil)\n}",
    "shortRU": "У значения интерфейса есть динамический тип и динамическое значение. Интерфейс равен nil, только когда нет ни того, ни другого. Nil-указатель *T внутри интерфейса всё равно задаёт динамический тип *T. Представление рантайма объясняет хранение, но семантика не зависит от фиксированного размера в байтах.",
    "detailsRU": [
      "При присваивании в базовый интерфейс, используемый как тип значения, конкретный тип должен реализовать его методы. Утверждение x.(T) проверяет сохранённый динамический тип; форма comma-ok сообщает о неуспехе без panic. Успешное утверждение типа при этом может вернуть nil-указатель.",
      "В проверенной реализации у пустого интерфейса указатель на тип и слово данных; у интерфейса с методами — указатель на itab и слово данных. Itab связывает интерфейс, конкретный тип и адреса методов. Обычно это два машинных слова, то есть 16 байт на 64-битной платформе, но не переносимая константа языка.",
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
    "qEN": "Q34: How do method sets differ from the shorthand used to call pointer methods?",
    "qRU": "Чем набор методов типа отличается от сокращённой записи вызова pointer-метода?",
    "shortEN": "For a defined non-interface type T, the method set of T contains methods with receiver T; *T also has methods with receiver *T. An addressable variable t can call a pointer method through the shorthand t.M(), but that does not add the method to T’s method set.",
    "detailsEN": [
      "Interface satisfaction uses method sets, not call-site convenience. If Set is declared on *Counter, *Counter implements a Setter interface and Counter does not. Store &c when pointer methods are required; a heap-versus-stack decision is irrelevant to this rule.",
      "For an addressable c, c.Set(2) is shorthand for (&c).Set(2). This is a method-call rule. Map indexes and temporary results are not automatically made addressable, so the same shorthand is not always available.",
      "A value receiver copies the receiver value; a pointer receiver receives a pointer. Copying a struct with slices, maps or pointers is shallow, so a value receiver does not guarantee isolation from the original data.",
      "For map[K]Counter, read a value, modify the copy and store it back. Alternatively store *Counter when shared mutable identity is intended. Neither choice makes concurrent access safe by itself. Embedded methods follow additional promotion rules; start with the simple T/*T distinction."
    ],
    "practicalRU": "Два отдельных вопроса: «можно вызвать здесь?» и «реализует ли тип интерфейс?». Не объясняй второй автоматическим взятием адреса из первого. Карту методов восстанови на бумаге: T → value; *T → value + pointer.",
    "code": "package main\n\nimport \"fmt\"\n\ntype Counter struct{ N int }\ntype Setter interface{ Set(int) }\n\nfunc (c *Counter) Set(n int) { c.N = n }\n\nvar _ Setter = (*Counter)(nil)\n\nfunc main() {\n\tc := Counter{N: 1}\n\tc.Set(2)\n\tvar s Setter = &c\n\ts.Set(3)\n\tfmt.Println(c.N)\n}",
    "shortRU": "Для определённого неинтерфейсного типа T набор методов T содержит методы с ресивером T; у *T дополнительно есть методы с ресивером *T. Адресуемая переменная t может вызвать pointer-метод сокращённо как t.M(), но это не добавляет метод в набор методов T.",
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
    "qEN": "Q35: When do deferred calls run, and where can recover stop a panic?",
    "qRU": "Когда выполняются отложенные вызовы и где recover может остановить panic?",
    "shortEN": "defer evaluates the function and its arguments when reached, then calls it when the surrounding function exits, in reverse registration order. Return values are assigned before deferred calls run. recover must be called directly by a deferred function during a panic in the same goroutine.",
    "detailsEN": [
      "Passing x as an argument to a deferred call saves its current value. A deferred closure can instead read or modify an outer variable later. Named result parameters are variables, so a deferred closure can change the result after return expressions have been evaluated and assigned.",
      "Deferred calls belong to the function invocation, not to an iteration of a loop. For per-item resources, use a helper function with its own defer or explicitly release each resource. The immediate problem is lifetime, even if a particular compiler avoids an allocation.",
      "Recovery stops the panic only within the goroutine that is unwinding. The recovering function returns after its deferred calls; execution does not resume at the panicking statement. An ordinary helper called by a deferred function cannot recover on that deferred function’s behalf.",
      "The compiler may use open-coded defers or runtime defer records on the stack or heap. Go 1.26.1 considers the number of defers, escape information, return sites, instrumentation and build options. A short function is not an unconditional promise of open coding, zero allocations or nanosecond overhead.",
      "An unrecovered panic terminates the program. os.Exit skips deferred calls; fatal runtime failures are not ordinary recoverable panics. For expected failures, return errors. Recovering at a deliberate boundary must not silently turn failure into success."
    ],
    "practicalRU": "Опора: «сейчас сохранить аргументы → при return присвоить результат → выполнить defer в обратном порядке → вернуть результат». Сначала объясни эту цепочку без регистров; машинный код проверяй только для конкретной сборки.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc f() (n int) {\n\tn = 1\n\tdefer fmt.Println(\"arg\", n)\n\tdefer func() {\n\t\tn++\n\t\tfmt.Println(\"closure\", n)\n\t}()\n\treturn 2\n}\n\nfunc main() { fmt.Println(\"result\", f()) }",
    "shortRU": "defer вычисляет функцию и её аргументы при достижении инструкции, а вызывает её при выходе из окружающей функции в обратном порядке регистрации. Возвращаемые значения присваиваются до выполнения defer. recover должен быть вызван непосредственно отложенной функцией во время panic в той же горутине.",
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
    quizIds: ["q19"]
  },
  {
    "id": "c36",
    "mod": "m5",
    "modName": "5. Maps, Interfaces & Go 1.25+",
    "level": "senior",
    "levelLabel": "🟡 Senior (Runtime)",
    "simId": null,
    "qEN": "Q36: When should you use weak pointers, unique handles and runtime cleanups?",
    "qRU": "Когда нужны weak-указатели, unique handles и runtime cleanups?",
    "shortEN": "weak.Pointer observes an object without keeping it alive; unique.Make gives equal values a canonical handle; AddCleanup registers a callback for a later unreachable state. These solve different problems. None replaces explicit resource ownership, and cleanup timing is not guaranteed.",
    "detailsEN": [
      "After the target becomes unreachable, weak.Pointer.Value may return nil; it is not guaranteed eventually to do so. Read Value once and keep the returned strong pointer while using it. runtime.KeepAlive can extend reachability through the last operation that needs the object; it is not a lock.",
      "unique.Make was introduced in Go 1.23. Handles canonicalize comparable values and make repeated equality checks cheap; Make still performs work and may allocate. Handle.Value returns a shallow copy. This is not a claim that the package uses the built-in Swiss map or that every workload becomes faster.",
      "weak and AddCleanup arrived in Go 1.24. AddCleanup’s callback and argument must not retain the target, directly or indirectly. Passing the target itself as arg panics. Go 1.26.1 also checks direct closure captures and pointer arguments into the target allocation; Go 1.25 lacks those extra checks. These are not general graph checks: indirect retention can still prevent cleanup. Automatic cache-key removal remains application work.",
      "Cleanups can become eligible for unreachable cycles and multiple cleanups may attach to one allocation. They have no specified order, may run concurrently, and are not guaranteed before program exit or for every allocation. SetFinalizer still exists; AddCleanup does not promise immediate memory release or solve every retention cycle.",
      "Use explicit Close or another ownership protocol for scarce resources. A cleanup is a fallback; explicit release and callbacks must coordinate to avoid double release and races. Cleanup.Stop prevents a not-yet-queued cleanup but does not wait for an already running one. To guarantee cancellation, keep the target reachable across Stop. Tiny/zero-size allocations and object reachability need care."
    ],
    "practicalRU": "Три вопроса: «наблюдать без удержания?» → weak; «сравнивать повторяющиеся значения?» → unique; «запасное освобождение после потери владельца?» → cleanup. Не строй тест на предположении, что один runtime.GC() обязательно вызовет callback.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n\t\"unique\"\n\t\"weak\"\n)\n\nfunc main() {\n\tobj := &struct{ Value int }{Value: 42}\n\tw := weak.Make(obj)\n\tgot := w.Value()\n\tfmt.Println(got == obj)\n\truntime.KeepAlive(obj)\n\ta := unique.Make(\"go\")\n\tb := unique.Make(string([]byte{'g', 'o'}))\n\tfmt.Println(a == b)\n}",
    "shortRU": "weak.Pointer позволяет ссылаться на объект, не удерживая его живым; unique.Make даёт равным значениям канонический handle; AddCleanup регистрирует callback на будущее состояние недостижимости. Это разные задачи. Ни один механизм не заменяет явного владения ресурсом, а время cleanup не гарантируется.",
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
    "qEN": "Q37: How do push iterators differ from iter.Pull, and when must you call stop?",
    "qRU": "Чем push-итераторы отличаются от iter.Pull и когда нужно вызывать stop?",
    "shortEN": "A push iterator calls yield for each value and must stop when yield returns false. iter.Pull turns that sequence into next and stop functions. If you stop consuming before next reports the end, call stop so the iterator can finish and release its resources.",
    "detailsEN": [
      "iter.Seq[V] is func(yield func(V) bool). A range-over-function loop supplies the loop body as yield; break makes yield return false. The iterator must return instead of calling yield again. The push form does not itself promise zero allocations or a new goroutine.",
      "Pull returns next() (V, bool) and stop(). After exhaustion or stop, next keeps returning the zero value and false. Calling stop repeatedly is allowed. Deferring stop immediately after Pull covers early return, break and panic in the consumer.",
      "Do not call next or stop simultaneously from multiple goroutines. A sequence may also have a single-use contract; the type alone does not guarantee replayability. Panics in the iterator are propagated through next or stop.",
      "Go 1.26.1 implements Pull using an internal coroutine handoff between goroutines. This is a runtime optimization, not a public coroutine API or a fixed nanosecond guarantee. Iterator code may block or run other code; do not infer permanent thread affinity or universal allocation counts from the fast handoff path."
    ],
    "practicalRU": "Опора: push → «получаю через yield»; pull → «запрашиваю next»; ранний выход → stop. На интервью сначала объясни владение завершением, затем внутренний coro. Схема sim1 даёт общий контекст горутин, а не точную трассу iter.Pull.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"iter\"\n)\n\nfunc Backward(s []int) iter.Seq[int] {\n\treturn func(yield func(int) bool) {\n\t\tfor i := len(s) - 1; i >= 0; i-- {\n\t\t\tif !yield(s[i]) {\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}\n}\n\nfunc main() {\n\tnext, stop := iter.Pull(Backward([]int{1, 2, 3}))\n\tdefer stop()\n\tv, ok := next()\n\tfmt.Println(v, ok)\n\tstop()\n\tv, ok = next()\n\tfmt.Println(v, ok)\n}",
    "shortRU": "Push-итератор вызывает yield для каждого значения и должен остановиться, когда yield вернёт false. iter.Pull превращает последовательность в функции next и stop. Если прекращаешь чтение до того, как next сообщил о конце, вызови stop, чтобы итератор завершился и освободил ресурсы.",
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
    "qEN": "Q38: What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?",
    "qRU": "Что именно гарантируют GOMAXPROCS с учётом контейнера, synctest и FlightRecorder?",
    "shortEN": "Go 1.25 added container-aware defaults for CPU parallelism, stable synctest bubbles for concurrent tests, and a rolling execution-trace recorder. Each has conditions: explicit GOMAXPROCS overrides automatic updates, fake time requires durable blocking, and a trace window is not an exact retention promise.",
    "detailsEN": [
      "Default GOMAXPROCS considers logical CPUs, process affinity and, on Linux, cgroup CPU bandwidth quota. Quota is CPU limit, not CPU request or the number of OS threads. Fractional quota rounds up; the examined implementation normally keeps at least 2 unless CPU count or affinity is below 2. Defaults and periodic updates depend on GODEBUG and the main module’s language version.",
      "A positive GOMAXPROCS environment value or a GOMAXPROCS(n>0) call selects a manual setting and disables automatic updates. GOMAXPROCS(0) only queries. SetDefaultGOMAXPROCS restores the runtime default and automatic behavior while still respecting GODEBUG. Updating the toolchain alone does not necessarily change an older module’s defaults.",
      "synctest.Test runs a self-contained bubble with fake time. Time advances when all its goroutines are durably blocked; Wait waits for the other goroutines to reach that state. Bubble channels, timers and supported waits matter. Mutex/RWMutex locking, real I/O and syscalls are not durable blocking under this contract. Synctest does not prove correctness or remove every source of flakiness.",
      "FlightRecorder must be started, checked for errors and eventually stopped. WriteTo snapshots recorded trace data and can fail; only one WriteTo may run at a time. Serialize application snapshot requests or handle that error. Tracing overhead depends on workload, so measure it.",
      "MinAge is a retention target rather than “exactly the last N seconds”. MaxBytes takes precedence, is a sizing hint and does not strictly cap snapshot size or total memory overhead. New recordings cannot contain history from before Start. Handle writer/close errors and avoid uncontrolled repeated dumps."
    ],
    "practicalRU": "Не учи три API одной фразой. Спроси отдельно: «кто выбирает параллелизм?», «почему движется тестовое время?», «какую историю успели записать?». Пример проверяет дедлайн искусственным временем; это не ожидание реальной секунды.",
    "code": "package apis\n\nimport (\n\t\"context\"\n\t\"testing\"\n\t\"testing/synctest\"\n\t\"time\"\n)\n\nfunc TestDeadline(t *testing.T) {\n\tsynctest.Test(t, func(t *testing.T) {\n\t\tctx, cancel := context.WithTimeout(context.Background(), time.Second)\n\t\tdefer cancel()\n\t\tif ctx.Err() != nil {\n\t\t\tt.Fatal(\"deadline fired early\")\n\t\t}\n\t\ttime.Sleep(time.Second)\n\t\tsynctest.Wait()\n\t\tif ctx.Err() != context.DeadlineExceeded {\n\t\t\tt.Fatalf(\"got %v\", ctx.Err())\n\t\t}\n\t})\n}",
    "shortRU": "Go 1.25 добавил настройки CPU-параллелизма с учётом контейнера, стабильный synctest для конкурентных тестов и запись скользящего окна execution trace. У каждого механизма есть условия: явный GOMAXPROCS отключает автообновления, искусственное время требует устойчивой блокировки, а окно trace не обещает точного срока хранения.",
    "detailsRU": [
      "GOMAXPROCS по умолчанию учитывает логические CPU, affinity процесса и, в Linux, cgroup CPU bandwidth quota. Квота — CPU limit, а не CPU request и не число потоков ОС. Дробная квота округляется вверх; проверенная реализация обычно сохраняет минимум 2, кроме случая, когда число CPU или доступность по affinity меньше 2. Начальные значения и автообновления зависят от GODEBUG и языковой версии главного модуля.",
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
  }
];
