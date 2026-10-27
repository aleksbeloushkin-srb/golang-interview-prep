const CARDS = [
  // ==========================================
  // МОДУЛЬ 1: ГОРУТИНЫ, СТЕК И РЕГИСТРЫ CPU (Q1 - Q6)
  // ==========================================
  {
    id: "c1",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim1",
    qEN: "Q1: What is a goroutine and how does it differ from an OS thread?",
    qRU: "Что такое горутина простыми словами и чем она отличается от потока операционной системы (OS Thread)?",
    shortEN: "A goroutine is a lightweight user-space execution thread managed entirely by the Go runtime scheduler rather than the OS kernel. Unlike OS threads, goroutines start with a tiny 2 KB stack, grow dynamically, and switch context in user space in ~10–20 nanoseconds.",
    detailsEN: [
      "Stack Size: OS threads have a fixed 1–8 MB stack allocated with guard pages; goroutines start with just 2 KB on the heap and grow/shrink dynamically up to 1 GB.",
      "Context Switching Speed: OS thread switches require a kernel trap (~1–2 microseconds) saving all CPU/SIMD registers; goroutines switch cooperatively in user space (~10–20 nanoseconds) saving only 3–4 registers (SP, PC, BP, R14).",
      "Scheduling (M:N): Thousands of goroutines are multiplexed onto a handful of OS threads equal to GOMAXPROCS.",
      "Identity: Goroutines have no user-accessible thread ID or handle in code."
    ],
    practicalRU: "В продакшене ты можешь спокойно создать 100 000 горутин под входящие соединения (это займёт всего ~200 МБ RAM), тогда как 100 000 потоков ОС (по 2 МБ) потребовали бы 200 ГБ и уронили сервер по OOM или забили бы ядро переключениями контекста.",
    code: `// Memory footprint comparison:
// 100,000 OS Threads * 2 MB   = ~200 GB Virtual Memory (OOM)
// 100,000 Goroutines * 2 KB   = ~200 MB Heap Memory (Runs effortlessly)`
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
    id: "c3",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim1",
    qEN: "Q3: How is a goroutine created under the hood (runtime.newproc) and why does it have no ID or handle in code?",
    qRU: "Как создаётся горутина под капотом (runtime.newproc) и почему у неё нет ID или объекта-дескриптора в коде?",
    shortEN: "In code, 'go fn()' is a concurrently executing function call that returns no handle. The compiler translates it into runtime.newproc(funcval), which switches to the g0 system stack, pulls or allocates a runtime.g struct with a 2 KB stack, initializes g.sched (gobuf), and places it into P.runnext.",
    detailsEN: [
      "Why No ID/Handle: Go designers omitted goroutine IDs to prevent Thread-Local Storage (TLS) abuse and unsafe external .kill() calls that would leave mutexes locked and memory corrupted. Cancellation is strictly cooperative via context.Context.",
      "Reuse via gFree Pool: runtime.newproc1 first checks the processor's local P.gFree pool (and global sched.gFree) for a dead goroutine to reuse its existing 2 KB stack without hitting the heap allocator.",
      "The goexit Stack Trick: newproc1 pushes the address of runtime.goexit at the very bottom of the new stack so when fn() finishes and executes RET, the CPU automatically jumps into goexit."
    ],
    practicalRU: "Благодаря пулу P.gFree создание короткоживущих горутин в Go почти не нагружает аллокатор памяти: если горутина завершилась, не вырастив стек, следующая строчка 'go fn()' мгновенно переиспользует её структуру runtime.g и 2 КБ стек за 0 аллокаций в куче.",
    code: `// src/runtime/proc.go
func newproc(fn *funcval) {
    gp := getg()
    pc := getcallerpc()
    systemstack(func() {
        newg := newproc1(fn, gp, pc) // grabs G from P.gFree or allocates 2KB on g0
        pp := getg().m.p.ptr()
        runqput(pp, newg, true)      // places newg into P.runnext (LIFO slot)
    })
}`
  },
  {
    id: "c4",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim1",
    qEN: "Q4: Where does a goroutine live in memory? Why is its stack allocated on the heap, and how does the CPU treat it as a stack?",
    qRU: "Где горутина физически живёт в памяти? Почему её стек выделяется в куче (хипе), но работает как стек процессора?",
    shortEN: "Physically, both the runtime.g descriptor and the goroutine's 2 KB contiguous stack are allocated in the process heap by Go's memory allocator. However, to the CPU core, any memory address loaded into the hardware Stack Pointer register (RSP) behaves as the active call stack.",
    detailsEN: [
      "Logical Stack vs. Physical Heap: OS threads have stacks allocated by the OS kernel in virtual memory segments. Because Go manages potentially millions of resizable goroutine stacks in user space, it allocates those 2 KB buffers inside its own heap spans.",
      "Hardware Mechanics: When the scheduler switches to a goroutine, it loads the top address of that 2 KB heap buffer into the CPU's RSP register. From that cycle on, PUSH, POP, CALL, RET, and local variable offsets operate at full hardware stack speed."
    ],
    practicalRU: "В дампах памяти pprof (--inuse_space) ты можешь заметить расхождение между 'heap_inuse' и 'stack_inuse'. Память под стеки горутин выделяется из того же mheap рантайма, но учитывается отдельно в runtime.MemStats.StackInuse. Если сервис держит 200 000 спящих горутин, которые в пике раздували стек до 64 КБ, память не вернётся ОС до срабатывания GC shrinkstack.",
    code: `// Checking stack memory usage in production via runtime.MemStats:
var m runtime.MemStats
runtime.ReadMemStats(&m)
// m.StackInuse -> bytes currently used by goroutine stacks (carved from heap)`
  },
  {
    id: "c5",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim1",
    qEN: "Q5: How does dynamic stack growth and shrinking (morestack, copystack, adjustpointers) work under the hood?",
    qRU: "Как работает динамическое расширение и сжатие стека горутины (morestack, copystack) и что происходит с указателями на стек?",
    shortEN: "Every non-leaf function prologue compares the CPU's RSP register against g.stackguard0. If stack space is exhausted, it jumps to runtime.morestack on the g0 stack, allocates a new contiguous block twice the size (copystack), copies existing stack frames via memmove, shifts internal stack pointers by delta, and resumes execution.",
    detailsEN: [
      "Compiler Prologue Check: Stacks grow downward (from stack.hi to stack.lo). If RSP <= g.stackguard0, the function calls runtime.morestack_noctxt.",
      "Doubling on g0 (copystack): Switches to the M's g0 stack, sets status to _Gcopystack, allocates a 2x larger contiguous block (2 KB -> 4 KB -> 8 KB, up to 1 GB on 64-bit), and copies active frames.",
      "Adjusting Stack Pointers (adjustpointers): Using compiler-generated stack bitmaps, the runtime finds every pointer on the stack pointing into the old stack range [old.lo, old.hi) and adds the offset delta = new.hi - old.hi.",
      "Stack Shrinking: During Concurrent Mark in GC, if a goroutine uses less than 25% (1/4) of its stack, GC shrinks it by half (down to 2 KB)."
    ],
    practicalRU: "Практический кейс (Hot Split / Stack Copy Storm): если в горячем цикле воркер постоянно вызывает глубокую цепочку функций, раздувая стек с 2 КБ до 32 КБ, а потом засыпает на канале и во время GC стек сжимается обратно — в CPU pprof ты увидишь 15–20% времени в 'runtime.newstack' и 'runtime.copystack'. Лечится переиспользованием воркеров из пула вместо постоянного пересоздания горутин.",
    code: `// Compiler-inserted function prologue on amd64:
CMPQ SP, 16(R14)       // compare RSP against g.stackguard0 (R14 holds *g)
JLS  morestack_noctxt  // if RSP <= stackguard0 -> switch to g0 & double stack`
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
    id: "c7",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim1",
    qEN: "Q7: How does the Go GMP scheduler model work, and what is GOMAXPROCS?",
    qRU: "Из чего состоит модель планировщика GMP в Go и за что отвечает GOMAXPROCS?",
    shortEN: "The Go scheduler uses three core entities — G (Goroutine), M (Machine / OS thread), and P (Logical Processor) — to multiplex M goroutines onto N OS threads. GOMAXPROCS controls the exact number of logical processors (P), which limits how many OS threads can simultaneously execute Go user code.",
    detailsEN: [
      "G (Goroutine): The task to execute, containing its stack, instruction pointer, and scheduling state.",
      "M (Machine): A real OS kernel thread managed by the operating system.",
      "P (Processor): A logical resource/context (count = GOMAXPROCS) that holds a lock-free Local Run Queue (LRQ of 256 goroutines) and a per-P memory cache (mcache). An M must hold a P to run Go code ( though M can run blocked syscalls without a P)."
    ],
    practicalRU: "Классическая проблема продакшена в Kubernetes: если под запущен на 64-ядерной ноде с лимитом CPU в 2 ядра (CFS quota = 2000m), стандартный runtime.NumCPU() вернёт 64 и создаст 64 структуры P! Потоки начнут конкурировать, сжигая всю квоту за пару миллисекунд и уходя в жестокий CPU Throttling (рост p99 latency в 10 раз). Решение — библиотекой uber-go/automaxprocs (или нативно в Go 1.25+) выставлять GOMAXPROCS по лимиту cgroups контейнера.",
    code: `// Always align GOMAXPROCS with container cgroup CPU limits in Kubernetes:
// If Node has 64 cores but K8s pod limit is 2 CPU:
// GOMAXPROCS=64 -> massive CFS CPU throttling!
// GOMAXPROCS=2  -> optimal scheduling with zero lock contention.`
  },
  {
    id: "c8",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q8: How does goroutine preemption work in Go (Cooperative vs. Asynchronous via sysmon & SIGURG)?",
    qRU: "Как в планировщике Go работает вытеснение горутин (кооперативное против асинхронного через sysmon и сигнал SIGURG)?",
    shortEN: "Since Go 1.14, Go uses hybrid preemption: cooperative preemption at blocking operations and function prologues (stackPreempt), combined with asynchronous signal-based preemption where the background sysmon thread sends a SIGURG signal to any OS thread running the same goroutine for more than 10 ms.",
    detailsEN: [
      "Cooperative Preemption: Voluntary switches at channel operations, mutex locks, network I/O, or function prologues when the runtime poisons g.stackguard0 with stackPreempt.",
      "Asynchronous Preemption (Go 1.14+): Solves tight loops with no function calls (e.g., heavy math or 'for {}'). The background sysmon thread (running without a P) scans P statuses every 20us–10ms.",
      "SIGURG Mechanics: If a goroutine runs for > 10 ms (forcePreemptNS), sysmon sends an OS signal SIGURG to its thread M. The kernel invokes Go's signal handler (asyncPreempt), which saves all CPU registers on the stack, moves the preempted G to the Global Run Queue (GRQ), and schedules the next goroutine."
    ],
    practicalRU: "Почему в отладчике GDB/Delve или при запуске strace на Go-бинаре постоянно мелькают сигналы 'SIGURG (Urgent I/O condition)'? Новички думают, что это сетевая ошибка, а на самом деле это штатная работа асинхронного вытеснения sysmon! Также: если внутри цикла есть инлайненные функции без safepoints или Cgo-вызов, SIGURG не сможет вытеснить C-код — это может задержать фазу STW сборщика мусора.",
    code: `// Asynchronous Preemption Timeline:
// [G1 tight loop > 10ms] -> [sysmon detects P1] -> [kill(M1, SIGURG)]
// -> [asyncPreempt saves registers] -> [G1 pushed to GRQ] -> [M1 runs G2]`
  },
  {
    id: "c9",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q9: How does the Go scheduler find runnable goroutines (runtime.findrunnable) and how does Work Stealing work?",
    qRU: "В каком порядке планировщик ищет работу (runtime.findrunnable), зачем нужно правило 61-го тика и как работает кража задач (Work Stealing)?",
    shortEN: "In runtime.findrunnable, a processor P checks the Global Run Queue (GRQ) every 61st tick for fairness, then checks its local runnext and LRQ, then the GRQ, then the network poller (netpoller), and finally steals half of the runnable goroutines from a randomly chosen processor's LRQ using lock-free CAS.",
    detailsEN: [
      "1/61 Fairness Rule (schedtick % 61 == 0): Every 61st scheduler tick, P checks the GRQ before its local queue. Without this, two local goroutines ping-ponging over a channel would monopolize P forever and starve the GRQ. (61 is chosen because it is prime, avoiding harmonic collisions with queue sizes).",
      "Lookup Sequence: 1) 1/61 GRQ check -> 2) P.runnext & P.runq[256] (lock-free) -> 3) GRQ (under mutex, grabs a batch) -> 4) netpoller -> 5) Work Stealing.",
      "Work Stealing (runqsteal): P iterates over all other Ps in a randomized order (up to 4 passes) and atomically steals 50% of the victim's LRQ from its tail via CAS (and checks the victim's runnext on the final pass)."
    ],
    practicalRU: "Как увидеть перекос планировщика в продакшене: запусти бинарь с переменной окружения 'GODEBUG=schedtrace=1000'. Каждую секунду рантайм будет печатать в лог строку состояния: 'runqueue=0 [12 0 0 0]'. Если глобальная очередь огромная или у одного P очередь забита, а остальные 0 — значит, горутины заблокированы в Cgo/syscall или нет точек переключения.",
    code: `// Run in production/staging to inspect scheduler queues every 1000ms:
// GODEBUG=schedtrace=1000 ./myservice
// Output: SCHED 1004ms: gomaxprocs=4 idleprocs=1 threads=8 spinningthreads=1 runqueue=2 [4 0 2 0]`
  },
  {
    id: "c10",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q10: How does Go handle network I/O (netpoller) vs. blocking system calls (syscall handoff) and Cgo?",
    qRU: "Чем обработка сетевого ввода-вывода (netpoller) отличается от блокирующих системных вызовов (syscall handoff) и Cgo?",
    shortEN: "Network I/O is multiplexed asynchronously via the OS epoll/kqueue/IOCP inside Go's netpoller: only the goroutine (G) parks in _Gwaiting while M and P keep running other tasks. In contrast, a blocking syscall or Cgo call blocks the underlying OS thread (M1) in the kernel, so the runtime detaches P (_Psyscall) and hands it off to another OS thread (M2).",
    detailsEN: [
      "Network Poller (netpoller): All Go net.Conn sockets are opened non-blocking. When read/write returns EAGAIN, G calls gopark and waits inside the epoll/kqueue structure. Zero OS threads are blocked.",
      "Blocking Syscall & Cgo (Handoff): File I/O on Linux (without io_uring) and Cgo calls block the OS thread M1. Before entering the syscall, G sets status to _Gsyscall and detaches P into _Psyscall.",
      "sysmon Retake: If the syscall takes longer than ~20 microseconds (or immediately in entersyscallblock), sysmon retakes P via CAS and assigns it to an idle M2 (or spawns a new OS thread) so P's local queue continues executing.",
      "Exiting Syscall: When M1 wakes up, it tries to re-acquire its old P or any free P; if none are free, it puts G into the Global Run Queue (GRQ) and M1 goes to the idle thread pool."
    ],
    practicalRU: "Реальный кейс падения сервера ('cgo / disk I/O thread explosion'): если сервис вызывает медленную C-библиотеку через Cgo или читает с зависшего NFS-диска из 15 000 горутин одновременно, для КАЖДОЙ заблокированной горутины рантайм создаст отдельный поток ОС (M)! При превышении лимита в 10 000 потоков (debug.SetMaxThreads) рантайм мгновенно убьёт процесс с 'runtime: program exceeds 10000-thread limit'. Решение: всегда ограничивать параллелизм к диску и Cgo семафором (буферизованным каналом или worker pool).",
    code: `// Limiting concurrent Cgo or blocking Disk I/O to prevent OS thread explosion:
var cgoSem = make(chan struct{}, 32) // max 32 OS threads blocked in Cgo at once

func CallCLibrary() {
    cgoSem <- struct{}{}
    defer func() { <-cgoSem }()
    C.heavy_blocking_c_function()
}`
  },
  {
    id: "c11",
    mod: "m2",
    modName: "2. GMP Scheduler",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim1",
    qEN: "Q11: Why does each processor (P) have a 1-element LIFO slot (runnext) alongside its 256-element FIFO queue (runq)?",
    qRU: "Зачем у каждого процессора P есть одноэлементный LIFO-стек (runnext) перед обычной FIFO-очередью на 256 горутин?",
    shortEN: "P.runnext is a single-slot high-priority LIFO queue designed to maximize L1/L2 CPU cache locality for newly spawned or channel-unblocked goroutines without starving older tasks in the FIFO queue.",
    detailsEN: [
      "L1/L2 Cache Locality: When G1 spawns G2 (newproc) or unblocks G2 on a channel (goready), the data G2 is about to process is currently hot in the CPU core's L1/L2 cache (~1 ns access). Running G2 immediately avoids costly L3/RAM cache misses.",
      "Why Capacity is Strictly 1: A multi-element LIFO stack would cause starvation of older goroutines at the bottom. With a 1-slot LIFO, placing a new goroutine into P.runnext via atomic CAS displaces any previous occupant into the tail of the 256-element FIFO ring buffer (runq)."
    ],
    practicalRU: "В высоконагруженных пайплайнах (где горутина A читает из сокета и кидает структуру в канал горутине B) слот P.runnext позволяет передавать управление от A к B на том же самом ядре CPU за ~15 нс с горячим L1-кешем. Именно поэтому в Go пайплайн на каналах часто работает быстрее, чем очередь с воркерами на разных ядрах, перекидывающих кэш-линии между сокетами CPU.",
    code: `// src/runtime/proc.go — inside runqput(pp *p, gp *g, next bool)
oldnext := pp.runnext
if pp.runnext.cas(oldnext, guintptr(unsafe.Pointer(gp))) {
    if oldnext == 0 { return }
    gp = oldnext.ptr() // displaced old goroutine goes fairly to FIFO runq[256]
}`
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
