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
// Design one operation, e.g. LoadOrStore, around the required invariant.`
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
}`
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
    id: "c15",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q15: Channels vs. Mutexes — when should you use a channel and when should you use a sync.Mutex?",
    qRU: "Каналы против Мьютексов — когда в Go нужно использовать каналы, а когда sync.Mutex?",
    shortEN: "Use channels when passing ownership of data, distributing work across pipelines, or coordinating lifecycle/timeouts with 'select' and 'context.Context'. Use 'sync.Mutex' (or 'sync.RWMutex' / atomics) when protecting internal state, caches, or counters inside a struct where ownership does not change.",
    detailsEN: [
      "Use Channels For: 1) Transferring data ownership between goroutines; 2) Worker pools, fan-in/fan-out pipelines; 3) Waiting on multiple events with timeouts via 'select' (note: you CANNOT put a sync.Mutex inside a select statement!).",
      "Use Mutex / Atomic For: 1) In-memory caches (map + RWMutex), metrics, counters, or struct fields; 2) Critical sections requiring ultra-low latency (an uncontended sync.Mutex takes ~15 ns via a single CAS, whereas a channel operation acquires an internal lock AND copies data)."
    ],
    practicalRU: "В высоконагруженных сервисах (например, LFU/LRU-кешах в памяти) попытка заменить sync.RWMutex на горутину-актор с каналом убивает пропускную способность на чтение в 10–20 раз: канал сериализует все запросы через один мьютекс 'hchan.lock', тогда как шардрованный RWMutex позволяет десяткам ядер читать параллельно.",
    code: `// Rule of thumb:
// 1. Coordinating goroutines / timeouts / pipelines -> chan + select
// 2. Protecting struct state / in-memory cache      -> sync.Mutex / sync.RWMutex`
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
    id: "c21",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q21: How does sync.Mutex work under the hood (Fast-path CAS, Spinning, and Normal vs. Starvation Mode)?",
    qRU: "Как устроен sync.Mutex под капотом (быстрый путь через CAS, активное вращение spinning и два режима: Normal vs. Starvation Mode 1ms)?",
    shortEN: "A sync.Mutex is an 8-byte struct (a 32-bit state word encoding Locked, Woken, Starving flags plus waiter count, and a 32-bit semaphore). It first attempts a single user-space CAS. On contention, it spins briefly if the owner is running on another CPU core, then parks via runtime_Semacquire. To balance throughput and tail latency, it switches between Normal Mode and Starvation Mode (if any waiter waits > 1 ms).",
    detailsEN: [
      "Fast Path (Uncontended): A single 'atomic.CompareAndSwapInt32(&m.state, 0, mutexLocked)' instruction in user space (~15 ns).",
      "Active Spinning: Before going to sleep, an arriving goroutine spins for ~4 iterations (30 PAUSE instructions each) ONLY if the machine is multicore and the local P queue is empty.",
      "Normal Mode (High Throughput): Newly arriving goroutines on the CPU race against freshly woken goroutines from the semaphore queue. Running goroutines usually win because they are already on the CPU (great throughput, risk of tail latency).",
      "Starvation Mode (> 1 ms wait): If a woken goroutine fails to acquire the lock for over 1 ms, the mutex flips the 'mutexStarving' bit. Unlocking now hands ownership DIRECTLY to the first waiter at the head of the FIFO queue (no spinning, zero tail-latency starvation)."
    ],
    practicalRU: "В продакшене для расследования тормозов на мьютексах включают профиль блокировок: 'runtime.SetMutexProfileFraction(5)' и снимают 'pprof/mutex'. Если на каком-то мьютексе висят десятки горутин дольше 1 мс, он переходит в Starvation Mode, отключает оптимизацию горячего ядра и резко снижает общую пропускную способность сервиса.",
    code: `// Enabling Mutex contention profiling in production (samples 1 out of 5 events):
runtime.SetMutexProfileFraction(5)
// Then inspect via: go tool pprof http://localhost:6060/debug/pprof/mutex`
  },
  {
    id: "c22",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q22: How do sync.WaitGroup, sync.Once, and context.Context work under the hood (and what are their classic pitfalls)?",
    qRU: "Как устроены внутри sync.WaitGroup, sync.Once и context.Context (и какие классические баги с ними случаются)?",
    shortEN: "sync.WaitGroup packs two 32-bit counters (active tasks + waiting goroutines) into a single 64-bit atomic uint64 plus a semaphore. sync.Once uses an atomic 'done' flag paired with a mutex so concurrent callers block until the initialization function finishes. context.Context forms an immutable parent-to-child tree where cancellation propagates downward by closing a lazily allocated 'done' channel.",
    detailsEN: [
      "sync.WaitGroup Internals & Pitfall: Packs counter (high 32 bits) and waiter count (low 32 bits) into one atomic.Uint64 for single-CAS updates. Pitfall: always call 'wg.Add(1)' BEFORE 'go fn()', and never pass WaitGroup by value (copying breaks the atomic state).",
      "sync.Once Pitfall: Why not just 'atomic.CompareAndSwap(0, 1)' without a mutex? Because if G1 wins CAS and takes 50ms to initialize a DB client, G2 would see CAS fail and immediately return an uninitialized nil DB client! sync.Once uses 'atomic.Load' on the fast path (~1 ns) and 'Mutex' on the slow path so G2 waits until G1 finishes.",
      "context.Context Internals: 'cancelCtx' stores a 'map[canceler]struct{}' of child contexts under a mutex and a 'done atomic.Value' channel. Calling 'cancel()' closes 'done', cancels all children recursively, and detaches itself from the parent."
    ],
    practicalRU: "Частый баг с контекстом в продакшене: когда внутри HTTP-хендлера запускают фоновую задачу в горутине (например, отправку события в Kafka или аудит в БД) и передают туда 'r.Context()'. Как только HTTP-ответ отдан клиенту (через 5 мс), net/http автоматически отменяет 'r.Context()', и фоновая запись в БД падает с 'context canceled'! Для фоновых задач в Go 1.21+ нужно использовать 'context.WithoutCancel(r.Context())' с отдельным таймаутом.",
    code: `// Safe background task inside an HTTP handler (Go 1.21+):
// Detaches from HTTP request cancellation while keeping trace IDs/values!
bgCtx, cancel := context.WithTimeout(context.WithoutCancel(r.Context()), 5*time.Second)
go func() {
    defer cancel()
    saveAuditLog(bgCtx)
}()`
  },

  // ==========================================
  // МОДУЛЬ 4: ПАМЯТЬ, АЛЛОКАТОР И СБОРЩИК МУСОРА (Q23 - Q28)
  // ==========================================
  {
    id: "c23",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim3",
    qEN: "Q23: Stack vs. Heap allocation in Go — why is stack allocation so much faster?",
    qRU: "Стек против Кучи (Stack vs. Heap) в Go — почему выделение памяти на стеке в десятки раз быстрее и дешевле, чем в куче?",
    shortEN: "Stack allocation and deallocation cost just a single CPU instruction (moving the RSP stack pointer register up or down) and require zero Garbage Collector involvement. Heap allocation requires finding a free memory slot in the allocator and later scanning and sweeping that object during Garbage Collection.",
    detailsEN: [
      "Zero Synchronization: Each goroutine owns its stack exclusively — no locks or atomics needed.",
      "Zero GC Overhead: Variables on the stack are automatically reclaimed the instant the function executes RET. Only pointers living on the stack need to be scanned as GC roots.",
      "L1 Cache Locality: The top of the stack (RSP) is almost guaranteed to sit in the CPU core's L1 cache."
    ],
    practicalRU: "В Go передача небольшой структуры по значению (`func process(u User)`) почти всегда работает БЫСТРЕЕ, чем передача по указателю (`func process(u *User)`): структура копируется прямо на горячем стеке за пару наносекунд, тогда как указатель часто заставляет переменную сбежать в хип и нагружает сборщик мусора.",
    code: `// Faster (stays on stack, 0 allocs/op):
func createUserValue() User { return User{ID: 1} }

// Slower (escapes to heap, 1 alloc/op, tracked by GC):
func createUserPtr() *User  { return &User{ID: 1} }`
  },
  {
    id: "c24",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim3",
    qEN: "Q24: What is Escape Analysis in Go (-gcflags='-m'), and what are the 5 main reasons a variable escapes to the heap?",
    qRU: "Что такое Escape Analysis в Go (-gcflags='-m') и каковы 5 главных причин побега переменной в кучу?",
    shortEN: "Escape Analysis is a compile-time static analysis that determines whether a variable's lifetime is provably confined to its function stack frame. If the compiler cannot prove the variable won't be referenced after the function returns (or if it is too large), it allocates the variable on the shared heap.",
    detailsEN: [
      "The Golden Rule (Sharing Down vs. Sharing Up): Passing a pointer DOWN into a callee stays on the stack. Returning a pointer UP ('return &x') always escapes to the heap.",
      "Top 5 Escape Triggers: 1) Returning a pointer or storing it in a heap/global struct ('Sharing Up'); 2) Passing a value to an interface method (e.g., 'fmt.Println(x)' or 'any') because dynamic dispatch via 'itab' hides whether the implementation keeps the pointer; 3) Capturing a variable by reference inside a closure or 'go func()'; 4) Slices with runtime-variable size ('make([]byte, n)') or objects > 64 KB; 5) Sending a pointer into a channel or storing pointers in a slice/map."
    ],
    practicalRU: "Как ускорить горячий путь (hot path) в продакшене: запусти 'go build -gcflags=\"-m=2\"'. Часто оказывается, что обычный логгер вида 'log.Debugf(\"id=%d\", id)' заставляет переменную 'id' убегать в хип (боксинг в `any`), даже если уровень DEBUG выключен! Или 'make([]byte, size)' убегает в хип, потому что компилятор не знает верхнюю границу `size`. Если выделить буфер константного размера `var buf [1024]byte` на стеке и взять срез `buf[:size]`, аллокации в хипе падают в 0.",
    code: `// Optimization trick to avoid heap escape for dynamic slices <= 1KB:
func parseFast(n int) {
    var stackBuf [1024]byte // allocated on stack (0 heap allocs!)
    buf := stackBuf[:n]     // use slice backed by stack array
    _ = buf
}`
  },
  {
    id: "c25",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q25: How does the Go Memory Allocator work under the hood (mspan, mcache, mcentral, mheap, and size classes)?",
    qRU: "Как устроен аллокатор памяти в Go под капотом (иерархия mspan, mcache, mcentral, mheap и классы размеров)?",
    shortEN: "Inspired by Google's TCMalloc, Go's allocator divides memory into 8 KB pages grouped into 'mspan' objects of ~68 fixed size classes, and caches spans across a 3-tier hierarchy: per-P 'mcache' (lock-free), shared 'mcentral' (spinlock per size class), and global 'mheap'.",
    detailsEN: [
      "3 Object Size Categories: 1) Tiny (< 16 B, no pointers): packed together into a single 16-byte slot in P.mcache; 2) Small (16 B to 32 KB): allocated lock-free from the current P's 'mcache' using the matching size-class 'mspan'; 3) Large (> 32 KB): allocated directly from the global 'mheap'.",
      "Zero Lock Contention on Fast Path: Because every logical processor P owns its own 'mcache' and only one goroutine runs on P at a time, small heap allocations require ZERO mutex locks!",
      "scan vs. noscan Spans: Go separates 'mspan' blocks into 'scan' (objects containing pointers) and 'noscan' (pure data like []byte or strings without pointers). The GC completely skips scanning inside 'noscan' spans!"
    ],
    practicalRU: "Колоссальный лайфхак для высоконагруженных кешей в Go (BigCache / FreeCache / VictoriaMetrics): если хранить в `map[string]*User` 10 миллионов структур с указателями, они попадут в `scan`-спаны, и сборщик мусора на каждом цикле будет обходить все 10 млн объектов, вызывая дикие скачки CPU и латентности. Но если сериализовать данные в один большой срез `[]byte` и хранить смещения `map[uint64]uint32` (без указателей!) — память попадёт в `noscan mspan`, и время сканирования GC упадёт до 0 миллисекунд!",
    code: `// Why map[uint64]uint32 is invisible to GC scanning (noscan mspan):
// ❌ map[string]*User -> 'scan' mspan: GC scans millions of pointers every cycle!
// ✅ []byte + map[uint64]uint32 -> 'noscan' mspan: O(1) GC overhead regardless of size!`
  },
  {
    id: "c26",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim3",
    qEN: "Q26: How does Go's Garbage Collector work at a high level (Tri-Color Mark-and-Sweep)?",
    qRU: "Как на базовом уровне работает сборщик мусора (GC) в Go (трёхцветный алгоритм Дейкстры)?",
    shortEN: "Go uses a concurrent, tri-color mark-and-sweep garbage collector that runs in parallel with user goroutines to keep Stop-The-World (STW) pauses under a millisecond. It classifies heap objects into three colors — White (unvisited), Grey (visited, children pending), and Black (visited, children scanned) — and sweeps remaining White objects after marking completes.",
    detailsEN: [
      "White Set: All heap objects start White. Any object still White at the end of the Mark phase is unreachable garbage.",
      "Grey Set (Work Queue): GC roots (goroutine stacks and global variables) are scanned first; heap objects they point to are painted Grey.",
      "Black Set (Live Objects): Background GC workers pop a Grey object, paint all White objects it references Grey, and paint the object itself Black. Once no Grey objects remain, all White objects are reclaimed."
    ],
    practicalRU: "В отличие от старых GC в Java, где пауза Stop-The-World зависела от общего размера кучи, в Go пауза STW (~10–100 мкс) нужна только для включения/выключения Write Barrier. Но стоимость фазы Concurrent Mark напрямую зависит от КОЛИЧЕСТВА живых указателей в куче.",
    code: `// Tri-Color Graph Traversal:
// [Roots: Stacks + Globals] -> paint direct targets GREY
// While GREY set is not empty:
//   Pop obj from GREY -> paint its WHITE children GREY -> paint obj BLACK
// Sweep all remaining WHITE slots back to mspan free lists.`
  },
  {
    id: "c27",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim3",
    qEN: "Q27: What are the 4 phases of a Go GC cycle, what is Mark Assist, and how do GOGC and GOMEMLIMIT control GC?",
    qRU: "Каковы 4 фазы цикла GC в Go, что такое Mark Assist и как GOGC и GOMEMLIMIT управляют частотой сборок?",
    shortEN: "A GC cycle runs in 4 phases: Mark Setup (STW #1), Concurrent Mark (using ~25% CPU plus Mark Assist), Mark Termination (STW #2), and Concurrent Sweep. Collection is triggered by the GC Pacer based on GOGC (default 100% heap doubling) and GOMEMLIMIT (soft memory cap introduced in Go 1.19).",
    detailsEN: [
      "4 Phases: 1) Mark Setup (STW #1, enables Write Barrier); 2) Concurrent Mark (background workers use 25% of GOMAXPROCS); 3) Mark Termination (STW #2, disables Write Barrier); 4) Concurrent Sweep (reclaims white mspan slots lazily).",
      "What is Mark Assist: If user goroutines allocate memory faster than background GC workers can mark the heap, the runtime forces the allocating goroutine itself to pause its business logic and help scan objects ('gcAssistAlloc') as backpressure.",
      "GOGC vs. GOMEMLIMIT: GOGC=100 triggers GC when the heap doubles relative to the previous live heap. GOMEMLIMIT sets a soft ceiling on total Go runtime memory to prevent container OOM kills."
    ],
    practicalRU: "Два важнейших продакшен-кейса: 1) Если у твоего пода в K8s лимит памяти 4 ГБ, а живая куча выросла до 2.5 ГБ, то при дефолтном `GOGC=100` следующий GC запустится только на 5 ГБ — и Linux OOM Killer убьёт под! Всегда выставляй `GOMEMLIMIT=3600MiB` (85–90% от лимита контейнера). 2) Если в pprof или `go tool trace` твои HTTP-хендлеры проводят много времени в `runtime.gcAssistAlloc` (Mark Assist) — значит, сервис аллоцирует память быстрее, чем GC успевает её размечать (помогает `sync.Pool`).",
    code: `// Production Kubernetes deployment best practice (for a 4GiB container limit):
// Env vars:
// GOGC=100
// GOMEMLIMIT=3600MiB  <-- Prevents OOM kill when live heap exceeds 50% of container RAM!
// GODEBUG=gctrace=1   <-- Logs every GC cycle duration, STW pauses, and heap size`
  },
  {
    id: "c28",
    mod: "m4",
    modName: "4. Memory, Allocator & GC",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim3",
    qEN: "Q28: Why does Go's GC need a Hybrid Write Barrier, and why is Go's GC non-generational and non-compacting?",
    qRU: "Зачем сборщику мусора Go нужен Гибридный барьер записи (Hybrid Write Barrier) и почему GC в Go непоколенческий и без дефрагментации?",
    shortEN: "During Concurrent Mark, user goroutines mutate heap pointers simultaneously with GC workers. The compiler-injected Hybrid Write Barrier intercepts every heap pointer write ('*slot = ptr') and shades both the overwritten and new target objects Grey so a White object can never be hidden behind an already-scanned Black object. Go omits generations and compaction because Escape Analysis keeps short-lived objects on the stack and TCMalloc-style size classes prevent fragmentation.",
    detailsEN: [
      "The Lost Object Problem: If a goroutine attaches a White object C to an already-scanned Black object A ('A.next = C') and deletes the link from Grey object B ('B.next = nil'), the GC would never reach C and would free a live object!",
      "Hybrid Write Barrier (Go 1.8+): Combines Yuasa's deletion barrier (shades the old pointer '*slot' Grey) and Dijkstra's insertion barrier (shades the new pointer 'ptr' Grey). Crucially, it is ONLY active on the heap — stack pointer writes have zero write-barrier overhead, and stacks never need to be re-scanned during STW #2!",
      "Why Non-Generational & Non-Compacting: In Java, all objects allocate on the heap, requiring a Young Generation. In Go, Escape Analysis puts short-lived objects on the stack for free. And size-class 'mspan' allocation avoids external fragmentation without costly stop-the-world memory compaction."
    ],
    practicalRU: "Как `sync.Pool` спасает от нагрузки на GC и Write Barrier: буферы, взятые из `sync.Pool`, переиспользуются между запросами на одном и том же процессоре `P` (внутри `sync.Pool` массив `local` привязан к каждому `P` без локов!) и очищаются только при срабатывании GC. Это позволяет снизить аллокации и работу Write Barrier в JSON-парсерах и сетевых прокси в 5–10 раз.",
    code: `// Compiler-injected Hybrid Write Barrier on every heap pointer assignment (*slot = ptr):
func writePointer(slot *unsafe.Pointer, ptr unsafe.Pointer) {
    if writeBarrier.enabled {
        shade(*slot) // Yuasa deletion barrier: shade old target Grey
        shade(ptr)   // Dijkstra insertion barrier: shade new target Grey
    }
    *slot = ptr
}`
  },
// ==========================================
  // МОДУЛЬ 5: МАПЫ (SWISSTABLES), ИНТЕРФЕЙСЫ, DEFER И GO 1.24–1.25+ (Q29 - Q38)
  // ==========================================
  {
    id: "c29",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q29: How are slices and strings represented in memory, and how does slice growth (runtime.growslice) work?",
    qRU: "Как в памяти устроены срезы (slice) и строки (string), и по какой формуле растёт capacity при append (runtime.growslice)?",
    shortEN: "A string is an immutable 16-byte header (pointer + len), while a slice is a 24-byte header (pointer to backing array + len + cap). When append() exceeds capacity, runtime.growslice allocates a new array: doubling (2x) for small slices (< 256 elements) and transitioning smoothly to ~1.25x + 192 for larger slices, rounded up to the nearest allocator size class.",
    detailsEN: [
      "Header Layout (64-bit): 'runtime.stringStruct' = {str unsafe.Pointer, len int} (16 bytes). 'runtime.slice' = {array unsafe.Pointer, len int, cap int} (24 bytes).",
      "Smooth Growth Formula (Go 1.18+): If oldCap < 256, newCap = 2 * oldCap. If oldCap >= 256, it grows in a loop: 'newCap += (newCap + 3*256) / 4' (approaching 1.25x growth with a smooth transition).",
      "Size-Class Rounding (roundupsize): After computing newCap, 'growslice' asks the memory allocator for the exact 'mspan' size class (e.g., 32, 48, 64, 80 bytes) and sets the final cap to fill the entire span so zero bytes are wasted!"
    ],
    practicalRU: "Почему `s := []int{1, 2}; s = append(s, 3, 4, 5)` даёт `cap(s) == 6`, а не `4` или `8`? Потому что 5 элементов по 8 байт требуют 40 байт, а ближайший класс размера в аллокаторе Go (`mspan`) — 48 байт (`48 / 8 = 6` элементов)! А для экстремальной оптимизации конвертации `string <-> []byte` без аллокаций в горячих путях используют `unsafe.String(unsafe.SliceData(b), len(b))`.",
    code: `// src/runtime/slice.go — nextslicecap growth formula (Go 1.18+):
func nextslicecap(newLen, oldCap int) int {
    newcap := oldCap
    doublecap := newcap + newcap
    if newLen > doublecap { return newLen }
    const threshold = 256
    if oldCap < threshold { return doublecap }
    for {
        newcap += (newcap + 3*threshold) >> 2 // ~1.25x smooth growth
        if uint(newcap) >= uint(newLen) { break }
    }
    return newcap
}`
  },
  {
    id: "c30",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim7",
    qEN: "Q30: How did the classic Go map (hmap / bmap before Go 1.24) work under the hood, and how did incremental evacuation work?",
    qRU: "Как была устроена классическая мапа в Go (hmap / bmap до Go 1.24), зачем был массив tophash[8] и как работала инкрементальная эвакуация?",
    shortEN: "Classic Go maps used a header struct ('runtime.hmap') pointing to an array of $2^B$ buckets ('bmap'). Each bucket held up to 8 key-value pairs, prefixed by an 8-byte 'tophash' array storing the top 8 bits of each key's hash. When load factor exceeded 6.5 (or too many overflow buckets accumulated), Go allocated a 2x bucket array and evacuated 1–2 old buckets incrementally on every write or delete.",
    detailsEN: [
      "Bucket Layout (bmap): 8 'tophash' bytes, followed by 8 keys packed together, then 8 values packed together (to eliminate struct alignment padding!), and an 'overflow' pointer.",
      "Hash Split: Low B bits select the bucket index; top 8 bits are compared against 'tophash[0..7]' before doing expensive key equality checks.",
      "2 Triggers for Growth: 1) Load factor > 6.5 elements/bucket -> doubles bucket count ($B+1$); 2) Too many overflow buckets (from mass additions + deletions) with load factor <= 6.5 -> Same-Size Grow to compact overflow chains.",
      "Incremental Evacuation: To avoid latency spikes on huge maps, Go never rehashes the whole map at once. Instead, 'oldbuckets' keeps the old array, and every 'mapassign'/'mapdelete' evacuates up to 2 buckets into X/Y split targets until finished."
    ],
    practicalRU: "Классический вопрос на собеседовании: почему нельзя взять адрес элемента мапы (`p := &m[\"key\"]` — ошибка компиляции)? Потому что при следующей записи в мапу может начаться инкрементальная эвакуация бакета (или сплит группы в SwissTable), ключ с значением физически переедут в новый блок памяти, и указатель `p` превратился бы в висячую ссылку (dangling pointer)!",
    code: `// Classic bmap memory layout (keys and values grouped to avoid padding):
// +-------------------+-------------------+---------------------+----------+
// | tophash [8]uint8  | keys [8]KeyType   | values [8]ValueType | overflow |
// +-------------------+-------------------+---------------------+----------+`
  },
  {
    id: "c31",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim7",
    qEN: "Q31: How do SwissTable maps work in Go 1.24+ under the hood (ctrl metadata bytes, H1/H2 hash split, SIMD/SWAR probing, and Split-Table growth)?",
    qRU: "Как устроены новые мапы на базе SwissTables в Go 1.24+ (управляющее 64-битное слово ctrl, H1/H2 хеш, побитовый поиск за 1 такт и разбиение таблиц)?",
    shortEN: "Starting in Go 1.24, the built-in map was replaced by a SwissTable implementation featuring open addressing, 8-slot groups with a 64-bit control word ('ctrl'), SIMD/SWAR bitmask probing (checking all 8 slots in parallel without branches), and Extendible Hashing (splitting large maps into independent 1024-entry sub-tables so growth never rehashes the entire map at once).",
    detailsEN: [
      "57/7 Hash Split (H1 & H2): The 64-bit hash is split into H1 (top 57 bits — selects the table and starting group) and H2 (bottom 7 bits — stored inside the control byte as a fingerprint).",
      "Group & 64-bit Control Word (ctrl): Each group holds 8 key-value slots and one 8-byte 'ctrl' metadata word (1 byte per slot: '0b10000000' = Empty, '0b11111110' = Deleted/Tombstone, or '0b0xxxxxxx' = 7-bit H2 hash). No overflow pointer chains!",
      "SWAR / SIMD Parallel Lookup: To find a key, Go broadcasts its 7-bit H2 across a 64-bit word and compares it against all 8 'ctrl' bytes in a SINGLE bitwise operation (or SIMD instruction), yielding a bitmask of matching slots.",
      "Extendible Hashing (Directory of Tables): To preserve O(1) worst-case insertion latency without stop-the-world rehashing, a large SwissMap uses a top-level directory pointing to independent sub-tables (each capped at 1024 slots). When one sub-table hits 7/8 (87.5%) load factor, ONLY that single 1024-slot table splits into two!"
    ],
    practicalRU: "В продакшене переход на SwissTables в Go 1.24–1.25+ даёт ускорение операций с `map` до **30–60%** и экономит память за счёт более высокого максимального заполнения (**87.5% = 7/8** против ~81% = 6.5/8 у старой мапы) и полного отказа от аллокаций отдельных `overflow`-бакетов.",
    code: `// SwissTable Group in Go 1.24+ (internal/runtime/maps):
type group struct {
    ctrl uint64     // 8 control bytes: [Empty(0x80) | Deleted(0xFE) | 0b0 + 7-bit H2]
    slots [8]slot   // 8 {key, elem} pairs contiguous in a single CPU cache line!
}
// Parallel lookup matches all 8 slots in 1 register operation without a loop!`
  },
  {
    id: "c32",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim7",
    qEN: "Q32: Why does deleting keys from a Go map NOT free memory (Map Memory Leak), and why is map iteration order randomized?",
    qRU: "Почему удаление всех ключей через delete(m, k) или clear(m) НЕ уменьшает память мапы в куче, и почему порядок обхода range по мапе случайный?",
    shortEN: "Deleting keys from a map marks slots as empty/tombstones (so they can be reused by future inserts), but never shrinks the allocated bucket/group array in the heap. To actually release memory back to the GC after a spike, you must copy remaining keys into a new map or replace the map reference. Map iteration starts at a random offset to prevent developers from relying on hash order.",
    detailsEN: [
      "The Peak-Map Memory Leak: If a global cache map grows to 5 million entries (consuming ~300 MB) and you later call 'delete(m, k)' on all 5 million keys (or 'clear(m)'), 'len(m)' becomes 0, but the underlying 300 MB table array remains allocated forever!",
      "Tombstones in SwissTables: In Go 1.24+, deleting a key from a group that was once full leaves a 'Deleted (0xFE)' tombstone so linear probing chains aren't broken; tombstones are only cleared on rehash/split.",
      "Randomized Iteration: 'mapiterinit' uses 'cheaprandn()' to pick a random starting table/bucket and a random slot offset so code never depends on hash function internals."
    ],
    practicalRU: "Реальный продакшен-инцидент: сервис хранит активные сессии в `var sessions = make(map[string]Session)`. Во время ночной DDoS-атаки в мапу набилось 10 млн сессий (2 ГБ RAM). Утром сессии протухли и были удалены через `delete(sessions, id)` — в метриках `len(sessions) == 100`, но процесс продолжает жрать 2 ГБ RAM! Лечится периодическим пересозданием: раз в час создавать `newMap := make(map[string]Session, len(oldMap))`, копировать живые ключи и подменять ссылку.",
    code: `// Reclaiming heap memory from a shrunken map in production:
func compactMap[K comparable, V any](old map[K]V) map[K]V {
    fresh := make(map[K]V, len(old))
    for k, v := range old {
        fresh[k] = v
    }
    return fresh // old huge bucket array can now be collected by GC!
}`
  },
  {
    id: "c33",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q33: How do empty interfaces (eface / any) and non-empty interfaces (iface) work under the hood (itab caching & dynamic dispatch)?",
    qRU: "Чем внутри рантайма различаются пустой интерфейс (eface / any) и интерфейс с методами (iface), и как работает кэш таблиц методов itab?",
    shortEN: "Both interface types are 16-byte (2-word) structs on 64-bit systems. An empty interface ('runtime.eface' / 'any') stores a direct type metadata pointer ('*_type') and a 'data' pointer. A non-empty interface ('runtime.iface') stores an '*itab' pointer (which pairs the interface type, concrete type, and a virtual function table 'fun') and a 'data' pointer.",
    detailsEN: [
      "eface (interface{} / any): '{_type *abi.Type, data unsafe.Pointer}'. Used when there are no methods.",
      "iface (interface with methods): '{tab *itab, data unsafe.Pointer}'. The 'itab' struct is 32+ bytes and ends with a variable-length array 'fun [1]uintptr' holding function pointers for every method of the interface, sorted alphabetically.",
      "Global itab Hash Table: Computing whether a concrete type implements an interface takes O(M + N) comparisons of sorted method lists, so Go caches computed '*itab' structs in a global lock-free hash table ('itabTable').",
      "Zero-Allocation Optimization: Assigning small integers (0..255 via 'staticuint64s'), booleans, empty strings, or already-pointer types into an interface does NOT allocate on the heap!"
    ],
    practicalRU: "Почему вызов метода через интерфейс (`reader.Read(p)`) медленнее прямого вызова метода структуры? Во-первых, это косвенный переход по адресу из памяти `CALL 24(AX)` (`itab.fun[0]`), но главное — компилятор часто не может заинлайнить вызов через интерфейс, а без инлайнинга буфер `p` не проходит Escape Analysis и убегает в кучу (если только не сработает PGO — Profile-Guided Optimization, девиртуализирующий горячий интерфейс).",
    code: `// src/runtime/runtime2.go — 16-byte interface headers:
type eface struct { // empty interface: any / interface{}
    _type *_type
    data  unsafe.Pointer
}
type iface struct { // interface with methods: io.Reader, error
    tab  *itab          // caches concrete type + method pointers fun[0..N]
    data unsafe.Pointer
}`
  },
  {
    id: "c34",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q34: Value Receiver vs. Pointer Receiver — why does a pointer type (*T) implement an interface with value receivers, but a value type (T) does NOT implement an interface with pointer receivers?",
    qRU: "Таблица ресиверов (Value vs. Pointer Receiver): почему указатель *T реализует интерфейс с value-методами, но значение T НЕ реализует интерфейс с pointer-методами?",
    shortEN: "The method set of a value type 'T' includes ONLY methods declared with a value receiver '(t T)', whereas the method set of a pointer type '*T' includes BOTH '(t T)' and '(t *T)' methods. A value stored inside an interface is not addressable, and copying it would silently discard any mutations made by a pointer receiver.",
    detailsEN: [
      "The Method Set Matrix: Value 'T' -> only '(T)' methods. Pointer '*T' -> both '(T)' and '(*T)' methods.",
      "Why Normal Calls Work ('u.SetName()' on value 'u'): If 'u' is a local variable on the stack, it is addressable, so the compiler automatically rewrites 'u.SetName()' as '(&u).SetName()' as syntactic sugar.",
      "Why Interface Assignment Fails ('var s Setter = u'): Values packed inside an interface ('iface.data') are treated as non-addressable copies. If Go allowed calling a pointer method on an interface holding a value 'T', the method would mutate a temporary copy and lose all changes!"
    ],
    practicalRU: "Смежная ловушка с мапами: `m := map[int]User{1: {Name: \"Alex\"}}`. Попытка вызвать pointer-метод `m[1].SetName(\"Bob\")` или изменить поле `m[1].Name = \"Bob\"` не скомпилируется (`cannot call pointer method on m[1]`), потому что элементы мапы неадресуемы из-за переездов бакетов!",
    code: `type Speaker interface { Speak() }
type Dog struct{}
func (d *Dog) Speak() {} // Pointer receiver!

// var s Speaker = Dog{}  // ❌ COMPILE ERROR: Dog does not implement Speaker (Speak has pointer receiver)
var s Speaker = &Dog{}    // ✅ OK: *Dog method set includes both (Dog) and (*Dog)`
  },
  {
    id: "c35",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q35: How do defer, panic, and recover work under the hood (Open-Coded Defers, g._defer, and gopanic stack unwinding)?",
    qRU: "Как работают defer, panic и recover под капотом (Open-Coded Defers через битовую маску, список g._defer и раскрутка стека в gopanic)?",
    shortEN: "Modern Go (1.14+) compiles most 'defer' statements into zero-allocation Open-Coded Defers: the compiler stores deferred closures in local stack variables, sets a 1-bit flag in a stack bitmask ('deferBits') when each defer is reached, and emits inline calls right before 'RET'. Only defers inside loops fall back to linked-list nodes on 'g._defer'.",
    detailsEN: [
      "3 Strategies for defer: 1) Open-Coded Defer (default if <= 8 defers and not in a loop): ~1 ns overhead, inlined directly into function epilogue via a 'deferBits' byte on the stack; 2) Stack-allocated '_defer' (if > 8 defers); 3) Heap-allocated '_defer' (ONLY if 'defer' is placed inside a 'for' loop!).",
      "Argument Evaluation Rule: Function arguments to 'defer fn(x)' are evaluated EAGERLY at the moment the 'defer' statement is registered, NOT when the surrounding function returns!",
      "How panic & recover Work: 'gopanic' walks the current goroutine's 'g._defer' chain (and scans stack frames for open-coded defers). If a deferred function calls 'gorecover()', it sets 'p.recovered = true' and uses 'mcall(recovery)' -> 'gogo' to jump RSP/RIP back to the normal return path of the recovering function!"
    ],
    practicalRU: "В продакшене `defer mu.Unlock()` на горячем пути стоит практически 0 наносекунд благодаря Open-Coded Defers. Но если написать `for _, file := range files { f, _ := os.Open(file); defer f.Close() }` — компилятор отключит Open-Coded Defer, аллоцирует тысячи структур `_defer` в куче и не закроет ни один файловый дескриптор до конца всей функции, вызвав `too many open files`!",
    code: `// How the compiler transforms Open-Coded Defer (zero allocations, ~1ns):
// defer mu.Unlock() compiles into:
//   deferBits |= 1 << 0        // set bit 0 on stack
//   ... function body ...
//   if deferBits & (1<<0) != 0 {
//       deferBits &^= 1 << 0
//       mu.Unlock()            // direct call in epilogue before RET!
//   }`
  },
  {
    id: "c36",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: null,
    qEN: "Q36: What are weak.Pointer, unique.Make, and runtime.AddCleanup in Go 1.24–1.25+, and why did AddCleanup replace runtime.SetFinalizer?",
    qRU: "Как работают новые пакеты weak.Pointer, unique.Make и runtime.AddCleanup в Go 1.24–1.25+, и почему старый runtime.SetFinalizer считается устаревшим?",
    shortEN: "Go 1.24+ introduced 'weak.Pointer[T]' (8-byte indirection blocks that automatically return nil once the target object is collected without preventing GC), 'unique.Make[T]' (global concurrent string/value interning for O(1) pointer comparison), and 'runtime.AddCleanup' (which fixes SetFinalizer's memory leaks on cyclic graphs and doesn't resurrect objects for a second GC cycle).",
    detailsEN: [
      "weak.Pointer[T]: Points to a tiny 8-byte indirection word in the runtime rather than the object directly. When GC sweeps the object, it atomically zeroes the indirection word so all copies of the weak pointer yield 'nil' on '.Value()' simultaneously.",
      "unique.Make[T] (Canonicalization): Interns comparable values in a global concurrent SwissMap backed by weak pointers + cleanup hooks. Comparing two 'unique.Handle[string]' values compares a single pointer in O(1) time instead of byte-by-byte string comparison.",
      "Why runtime.AddCleanup Beats SetFinalizer: 1) 'SetFinalizer' resurrects the object for an extra full GC cycle; 'AddCleanup' frees the object immediately and passes a separate 'arg' value to the cleanup callback; 2) 'SetFinalizer' permanently leaks cyclic references; 'AddCleanup' handles cycles safely; 3) Multiple cleanups can be attached to the same pointer."
    ],
    practicalRU: "В продакшене комбинация `weak.Pointer[T]` + `runtime.AddCleanup` впервые позволяет писать в Go самоочищающиеся in-memory кеши (Memory-Sensitive Caches) и пулы соединений: как только начинается нехватка памяти и срабатывает GC, неиспользуемые элементы кеша автоматически собираются сборщиком мусора, а `AddCleanup` сам удаляет пустые ключи из мапы!",
    code: `// Modern Go 1.24–1.25+ resource cleanup & weak pointer usage:
wp := weak.Make(heavyObj) // does NOT prevent GC from collecting heavyObj!

runtime.AddCleanup(heavyObj, func(fd int) {
    syscall.Close(fd)     // runs after heavyObj is collected; never resurrects heavyObj!
}, heavyObj.fileDescriptor)`
  },
  {
    id: "c37",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim1",
    qEN: "Q37: How do Go 1.23–1.25+ iterators (iter.Seq, iter.Pull) and internal runtime coroutines (runtime.newcoro / coroswitch) work under the hood?",
    qRU: "Как устроены итераторы в Go (iter.Seq / iter.Pull) и как работают внутренние корутины рантайма (runtime.newcoro / coroswitch) в обход очередей планировщика?",
    shortEN: "Push iterators ('iter.Seq[V]') are zero-allocation higher-order functions 'func(yield func(V) bool)' where the loop body is compiled into a 'yield' closure. Pull iterators ('iter.Pull') invert control using a dedicated runtime primitive — internal coroutines ('runtime.coro') — which perform direct 1-to-1 context switches ('coroswitch') between two goroutines on the same OS thread M, completely bypassing the P run queues!",
    detailsEN: [
      "Push Iterator (iter.Seq): 'for v := range mySeq' compiles the loop body into a 'yield(v) bool' function. Returning 'false' from 'yield' corresponds to 'break'.",
      "The Problem with Pull Iterators (iter.Pull): If 'next()' used standard channels between two goroutines, every iteration would go through 'hchan.lock' -> 'goready' -> 'P.runnext' -> 'schedule()', costing ~150–300 ns per element.",
      "Direct Coroutine Handoff (runtime.coroswitch): To make 'iter.Pull' fast, the Go runtime introduced 'runtime.coro' (a locked goroutine pair in status '_Gwaiting'). Calling 'coroswitch' on thread M swaps '_Grunning' directly from caller G1 to iterator G2 on the exact same M and P via 'gogo' in ~25 ns without touching 'LRQ', 'runnext', or 'schedule()'!"
    ],
    practicalRU: "Знание разницы между `iter.Seq` (Push) и `iter.Pull` (Pull) критично на код-ревью: обычный `for x := range SliceBackward(s)` через `iter.Seq` инлайнится компилятором и работает со скоростью обычного цикла `for` (0 аллокаций). А вот `next, stop := iter.Pull(seq)` аллоцирует в куче отдельную корутину со стеком 2 КБ и требует обязательного `defer stop()`, иначе корутина утечёт!",
    code: `// Push iterator (iter.Seq) — 0 allocations, inlined by compiler:
func Backward[E any](s []E) iter.Seq[E] {
    return func(yield func(E) bool) {
        for i := len(s) - 1; i >= 0; i-- {
            if !yield(s[i]) { return } // false means caller executed 'break'
        }
    }
}`
  },
  {
    id: "c38",
    mod: "m5",
    modName: "5. Maps, Interfaces & Go 1.25+",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim2",
    qEN: "Q38: What changed in Go 1.25+ regarding container-aware GOMAXPROCS (cgroups v1/v2), synctest, and runtime flight recording?",
    qRU: "Что нового появилось в рантайме Go 1.25+ (нативный учёт лимитов контейнера cgroups для GOMAXPROCS, пакет testing/synctest и Flight Recorder)?",
    shortEN: "Go 1.25+ natively makes GOMAXPROCS container-aware by reading Linux cgroup v1/v2 CPU bandwidth quotas (cpu.max) at startup and dynamically adjusting P count if container limits change at runtime. It also introduces 'testing/synctest' (isolated concurrency bubbles with fake virtualized clocks) and 'runtime/trace.FlightRecorder' for low-overhead ring-buffer tracing in production.",
    detailsEN: [
      "Container-Aware GOMAXPROCS (Go 1.25+): Previously, 'runtime.NumCPU()' read host core count, forcing everyone in Kubernetes to import 'uber-go/automaxprocs'. Go 1.25+ inspects '/sys/fs/cgroup/cpu.max' directly and periodically updates GOMAXPROCS if K8s Vertical Pod Autoscaler changes CPU limits live.",
      "testing/synctest (Virtual Time Bubbles): Runs concurrent test code inside an isolated 'bubble'. Once all goroutines inside the bubble are durably blocked (on channels, mutexes, or 'time.Sleep'), the runtime automatically advances the virtual clock to the next timer in 0 nanoseconds — making 10-second timeout tests finish in microseconds with zero flakiness!",
      "trace.FlightRecorder: Continuously records the last N seconds/megabytes of execution traces in a ring buffer in RAM (~1% CPU overhead) so you can dump a full 'go tool trace' snapshot ONLY when an HTTP request exceeds your p99 SLA."
    ],
    practicalRU: "`trace.FlightRecorder` — настоящая киллер-фича для отладки редких фризов в продакшене: раньше нельзя было держать `runtime/trace` включённым постоянно из-за гигабайтов данных. Теперь сервис держит в памяти кольцевой буфер последних 5 секунд трейса и сбрасывает его на диск ТОЛЬКО в тот момент, когда конкретный запрос в middleware превысил 500 мс!",
    code: `// Go 1.25+ FlightRecorder: dump runtime trace ONLY when a request is slow!
fr := trace.NewFlightRecorder(trace.FlightRecorderConfig{MinAge: 5 * time.Second})
fr.Start()

if time.Since(start) > 500*time.Millisecond {
    f, _ := os.Create("slow_spike.trace")
    fr.WriteTo(f) // dumps the exact last 5 seconds of GMP/GC/Syscall activity!
}`
  }
];
