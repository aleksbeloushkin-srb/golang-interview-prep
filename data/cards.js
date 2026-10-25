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
    qEN: "Q2: What is the difference between a Data Race and a Race Condition, and how does Go's Race Detector (-race) work?",
    qRU: "В чём разница между Data Race (гонкой данных) и Race Condition (состоянием гонки), и как работает флаг -race?",
    shortEN: "A Data Race occurs when two goroutines access the same memory location concurrently and at least one access is a write without synchronization. A Race Condition is a broader semantic flaw where the correctness of a program depends on the unpredictable timing or ordering of operations (which can happen even WITH mutexes).",
    detailsEN: [
      "Data Race vs. Race Condition: Protecting every variable read/write separately with a mutex eliminates Data Races, but if two operations (e.g., check-then-act on bank balance) are not locked together as one critical section, you still have a logical Race Condition.",
      "Consequences in Go: A concurrent map write causes a fatal runtime crash ( cannot be recovered via recover()), while a data race on slices or interfaces can corrupt internal pointer+length headers, leading to memory corruption.",
      "How -race works (ThreadSanitizer): Compiling with 'go test -race' instruments every memory read and write with shadow memory tracking vector clocks (happens-before relationships). It increases memory usage by 5–10x and slows execution by 2–20x."
    ],
    practicalRU: "Если в продакшене сервис внезапно падает с 'fatal error: concurrent map writes' или странным 'panic: runtime error: invalid memory address' внутри multi-word структур (интерфейс или слайс) — это 100% Data Race. При параллельной записи двух частей интерфейса (itab + data pointer) одна горутина может прочитать itab от нового типа, а указатель data — от старого.",
    code: `// Logical Race Condition WITHOUT a Data Race:
if cache.Get("key") == nil { // locks & unlocks mutex inside Get()
    // Another goroutine might insert "key" right here!
    cache.Set("key", val)    // locks & unlocks mutex inside Set()
}`
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
    id: "c6",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim1",
    qEN: "Q6: How does an OS thread (M) start executing a goroutine and switch CPU registers via g0, runtime.gogo, and runtime.mcall?",
    qRU: "Как физически поток M запускает горутину из очереди и подменяет регистры CPU через стек g0, runtime.gogo и runtime.mcall?",
    shortEN: "Each OS thread (M) runs scheduler logic on a dedicated 8 KB system stack belonging to a special goroutine called g0. When schedule() selects a runnable goroutine G, the assembly function runtime.gogo overwrites R14 with &G, loads G.sched.sp into RSP, and executes an unconditional JMP to G.sched.pc (RIP).",
    detailsEN: [
      "Why g0 Exists: User goroutine stacks are only 2 KB and cannot safely run scheduler, stack-growth, or GC logic without overflowing. Every M has its own g0 with a large OS-allocated stack.",
      "runtime.gobuf (g.sched): Holds the minimal paused context of a goroutine: sp (RSP), pc (RIP), bp (RBP), ctxt (closure pointer RDX), and g (R14).",
      "gogo(&g.sched) [g0 -> G]: Restores R14, RSP, and RBP from gobuf, zeroes out gobuf fields for GC safety, and jumps (JMP) to G's instruction pointer.",
      "mcall(fn) [G -> g0]: The inverse of gogo. Saves the running G's caller PC and RSP into g.sched, switches RSP to g0.sched.sp, and invokes fn(g) on the system stack."
    ],
    practicalRU: "Когда ты анализируешь крэш-дамп (core dump в Delve/GDB) или системный стектрейс при панике в рантайме (например, при Cgo или инвалидном указателе), ты часто видишь 'runtime.systemstack' или 'runtime.mcall'. Понимание разницы между стеком g0 и стеком G позволяет мгновенно понять, упал ли пользовательский код горутины или сам рантайм во время переключения контекста / Cgo-вызова.",
    code: `// src/runtime/asm_amd64.s — runtime.gogo(buf *gobuf)
MOVQ gobuf_g(BX), DX
MOVQ DX, R14            // 1. Load *G into hardware register R14
MOVQ gobuf_sp(BX), SP   // 2. Swap CPU Stack Pointer RSP to G's 2KB heap stack
MOVQ gobuf_bp(BX), BP   // 3. Restore frame pointer RBP
MOVQ gobuf_pc(BX), BX
JMP  BX                 // 4. Jump RIP into goroutine's code!`
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
    qEN: "Q12: What causes Goroutine Leaks in production, and how do you detect and prevent them?",
    qRU: "Из-за чего возникают утечки горутин (Goroutine Leaks) в продакшене и как их находить и предотвращать?",
    shortEN: "A goroutine leak happens when a goroutine blocks forever on a channel, mutex, or I/O operation without a timeout or cancellation path, permanently leaking its 2+ KB stack and any heap objects referenced by its local variables.",
    detailsEN: [
      "Top 3 Causes: 1) Sending to an unbuffered channel when the receiver returned early on an error; 2) Receiving from a channel that is never written to or closed; 3) HTTP/network calls using http.DefaultClient (which has Timeout: 0 — infinite!).",
      "Why GC Cannot Collect Leaked Goroutines: Even if no variable in your code references the channel anymore, the parked goroutine itself is treated as a GC Root (or referenced via hchan/sudog), keeping its entire stack and reachable heap objects alive forever.",
      "Prevention: Always pass context.Context with a timeout, use buffered channels of size 1 for async error reporting ('make(chan error, 1)'), and run goleak in unit tests."
    ],
    practicalRU: "Как за 10 секунд найти утечку горутин на живом сервере: открой текстовый профиль 'curl http://localhost:6060/debug/pprof/goroutine?debug=1'. Рантайм сгруппирует все тысячи зависших горутин по одинаковому стектрейсу: например, '14520 @ chan send [64 minutes]' с точным номером строки файла, где забыли буфер `make(chan error, 1)` или `case <-ctx.Done():`.",
    code: `// Classic Goroutine Leak vs. Fix with 1-Buffered Channel & Context:
errCh := make(chan error, 1) // Buffer of 1 prevents sender leak if caller times out!
go func() {
    errCh <- doSlowRPC(ctx)  // Won't block even if select below already exited on ctx.Done()
}()
select {
case err := <-errCh: return err
case <-ctx.Done():   return ctx.Err()
}`
  },

  // ==========================================
  // МОДУЛЬ 3: КАНАЛЫ (HCHAN), SELECT, CAS И SYNC (Q13 - Q22)
  // ==========================================
  {
    id: "c13",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: "sim2",
    qEN: "Q13: What is a channel in Go, and how do unbuffered and buffered channels differ?",
    qRU: "Что такое канал в Go и чем небуферизованный канал отличается от буферизованного (в коде и в памяти)?",
    shortEN: "A channel is a typed, thread-safe conduit for communication and synchronization between goroutines. Unbuffered channels ('make(chan T)') have zero capacity and enforce synchronous rendezvous (sender blocks until receiver is ready), whereas buffered channels ('make(chan T, N)') decouple senders and receivers using a circular array until the buffer is full or empty.",
    detailsEN: [
      "Unbuffered ('make(chan T)'): Capacity is 0 (no backing array allocated). Every transfer is a direct stack-to-stack memory copy ('sendDirect') accompanied by goroutine parking/waking.",
      "Buffered ('make(chan T, N)'): Allocates a circular buffer of N elements. Senders don't block while qcount < dataqsiz. If element type T contains no pointers and buffer < 64 KB, Go allocates both the hchan header and the buffer in a single contiguous heap block."
    ],
    practicalRU: "Частая ошибка: делать огромный буфер 'make(chan Job, 100000)' «чтобы работало быстрее». На практике небуферизованный или маленький канал часто быстрее при пинг-понге, так как 'sendDirect' копирует данные напрямую из стека в стек без промежуточной записи в массив кучи, а большой буфер раздувает память и скрывает backpressure при падении БД.",
    code: `chSync  := make(chan int)     // Unbuffered: dataqsiz == 0, synchronous stack-to-stack copy
chAsync := make(chan int, 64) // Buffered:   dataqsiz == 64, ring buffer in heap`
  },
  {
    id: "c14",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q14: What happens when you read, write, or close a nil, open, or closed channel? (The Channel Matrix)",
    qRU: "Что происходит при чтении, записи и закрытии nil-канала, открытого и закрытого канала? (Таблица-матрица для собеседования)",
    shortEN: "Operations on a nil channel block forever (except close, which panics). Sending to or closing an already-closed channel panics immediately. Receiving from a closed channel never blocks: it drains any remaining buffered elements and then immediately returns the type's zero value with ok = false.",
    detailsEN: [
      "1. Nil Channel ('var ch chan int'): Send -> Blocks forever (gopark); Receive -> Blocks forever (gopark); Close -> PANIC!",
      "2. Closed Channel: Send -> PANIC ('send on closed channel'); Close -> PANIC ('close of closed channel'); Receive -> Drains buffered items first (val, true), then immediately returns (zeroValue, false) forever without blocking.",
      "3. Why Closing Wakes Everyone: Closing sets hchan.closed = 1 under lock and moves all waiting receivers in recvq (with zero values) and all waiting senders in sendq (to panic) into the runnable state."
    ],
    practicalRU: "Два мощных паттерна в продакшене: 1) Закрытие канала 'close(stopCh)' работает как идеальный Broadcast-сигнал для мгновенного пробуждения 1000 воркеров сразу (так как чтение из закрытого канала никогда не блокируется). 2) Если в цикле с 'select' один из входных каналов закрылся, он начнёт бесконечно возвращать (0, false) на каждой итерации, сжигая 100% CPU! Чтобы динамически «отключить» эту ветку select, достаточно присвоить переменной канала 'ch = nil'.",
    code: `// Disabling a closed channel branch inside a select loop to prevent 100% CPU spin:
for ch1 != nil || ch2 != nil {
    select {
    case v, ok := <-ch1:
        if !ok { ch1 = nil; continue } // setting ch1 = nil disables this case in selectgo!
        process(v)
    case v, ok := <-ch2:
        if !ok { ch2 = nil; continue }
        process(v)
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
    id: "c16",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim2",
    qEN: "Q16: What is inside the runtime.hchan struct, and why do channel wait queues hold runtime.sudog instead of runtime.g?",
    qRU: "Из чего состоит структура канала runtime.hchan и зачем в очередях ожидания лежит обёртка runtime.sudog вместо самой горутины runtime.g?",
    shortEN: "Calling make(chan T) allocates a runtime.hchan struct on the heap (returning a pointer *hchan). It contains a circular buffer (buf), two wait queues (sendq and recvq) of runtime.sudog nodes, and an internal mutex (lock). sudog decouples goroutines from queues so a single goroutine can wait on multiple channels simultaneously inside a select statement.",
    detailsEN: [
      "Reference Semantics: Because make(chan T) returns *hchan under the hood, passing a channel by value to a function only copies an 8-byte pointer.",
      "The 4 Components of hchan: 1) Ring buffer (buf, dataqsiz, qcount, sendx, recvx); 2) Wait queues (sendq, recvq); 3) Runtime mutex (lock); 4) Closed flag and element type metadata.",
      "Why sudog Exists (M:N Relationship): Inside a 3-case 'select', one goroutine G must sit in three different channel wait queues at the same time. Therefore, G cannot be linked directly into one queue; instead, it grabs three 'runtime.sudog' wrappers from P's local cache (acquireSudog), each holding a pointer to G and a pointer ('elem') to the stack variable."
    ],
    practicalRU: "Если в профиле памяти (heap pprof) ты вдруг видишь тысячи аллокаций 'runtime.acquireSudog' — это верный признак того, что огромное число горутин одновременно блокируется на каналах (или в гигантских select), переполняя локальный кеш 'P.sudogcache' процессоров.",
    code: `type hchan struct {
    qcount, dataqsiz uint
    buf              unsafe.Pointer // ring buffer in heap
    sendx, recvx     uint
    recvq, sendq     waitq          // doubly-linked list of *runtime.sudog
    lock             mutex          // internal runtime mutex (futex)
}`
  },
  {
    id: "c17",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim2",
    qEN: "Q17: Walk through channel send/receive under the hood: how do sendDirect (stack-to-stack copy) and gopark(chanparkcommit) work safely?",
    qRU: "Как под капотом работают запись и чтение из канала: почему sendDirect пишет прямо в чужой стек и зачем gopark отпускает мьютекс только на стеке g0?",
    shortEN: "When sending to a channel under hchan.lock, if a receiver is already waiting in recvq, the sender bypasses the ring buffer completely and copies the value directly from its own stack into the parked receiver's stack via sendDirect, then wakes it via goready. If blocking is required, gopark switches to the g0 stack BEFORE unlocking hchan.lock via chanparkcommit to prevent wakeup race conditions.",
    detailsEN: [
      "The 3 Paths of chansend: 1) Waiting receiver in recvq -> sendDirect + goready (puts receiver in P.runnext); 2) Space in buffer -> copy to buf[sendx]; 3) Buffer full -> enqueue sudog in sendq + gopark.",
      "Why sendDirect Needs a GC Barrier: Because sendDirect is the ONLY place in Go where one goroutine writes directly into another goroutine's stack (dst = sg.elem), it explicitly fires 'typeBitsBulkBarrier' before 'memmove' so the tri-color GC tracks transferred pointers, and 'g.activeStackChans' prevents GC from shrinking the receiver's stack mid-copy.",
      "Why gopark Unlocks on g0 (chanparkcommit): If G1 unlocked hchan.lock while still executing on its own stack, another CPU core could immediately dequeue G1's sudog and call gogo(G1) while Core 1 is still using G1's stack! Switching RSP to g0 first makes the handoff 100% race-free."
    ],
    practicalRU: "Обрати внимание: даже при 'sendDirect' данные всегда КОПИРУЮТСЯ по значению через 'memmove(dst, src, size)'. Если передавать по каналу по значению тяжеловесную структуру в 4 КБ (вместо указателя '*BigStruct'), то каждый 'ch <- val' будет копировать 4 КБ под захваченным мьютексом канала 'hchan.lock', блокируя остальные горутины.",
    code: `// src/runtime/chan.go — direct stack-to-stack copy bypassing ring buffer:
func sendDirect(t *_type, sg *sudog, src unsafe.Pointer) {
    dst := sg.elem // address of variable x directly inside parked G1's 2KB stack!
    typeBitsBulkBarrier(t, uintptr(dst), uintptr(src), t.Size_)
    memmove(dst, src, t.Size_)
}`
  },
  {
    id: "c18",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "base",
    levelLabel: "🟢 Base (Entry/Mid)",
    simId: null,
    qEN: "Q18: How does the select statement behave at the code level (multiple ready cases, default, nil channels, and priorities)?",
    qRU: "Как работает оператор select на уровне кода (если готовы сразу несколько веток, как работает default, nil-каналы и как реализовать приоритет одного канала над другим)?",
    shortEN: "A 'select' statement waits on multiple channel operations simultaneously. If multiple cases are ready at the same time, Go chooses one at random with uniform probability. If none are ready, it executes the 'default' branch if present, or blocks until one case becomes ready. Any case with a 'nil' channel is ignored.",
    detailsEN: [
      "Compiler Fast-Paths: 'select {}' blocks forever; a 1-case select compiles to a regular channel op; a 1-case + default compiles to non-blocking 'selectnbrecv'/'selectnbsend'.",
      "Why Random Selection: Prevents starvation when one channel is constantly full.",
      "Implementing Priority in Go: Because 'select' is intentionally fair/random, if you need 'highPriorityCh' to always be drained before 'lowPriorityCh', you use a nested two-level select with a 'default' branch."
    ],
    practicalRU: "Классическая задача на собеседовании и баг в продакшене: у тебя есть воркер с `select { case <-ctx.Done(): return; case job := <-jobs: ... }`. Если очередь `jobs` всегда полна, то даже после отмены `ctx.Done()` рантайм с вероятностью 50% продолжит выбирать ветку `jobs`! Чтобы гарантировать мгновенную остановку (или приоритетный канал), перед основным `select` ставят неблокирующий `select { case <-ctx.Done(): return; default: }`.",
    code: `// Implementing strict priority (always check ctx.Done() or highPrioCh first):
for {
    select {
    case <-ctx.Done():
        return // Guaranteed immediate exit even if jobsCh is 100% full!
    default:
    }
    select {
    case <-ctx.Done():
        return
    case job := <-jobsCh:
        handle(job)
    }
}`
  },
  {
    id: "c19",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "deep",
    levelLabel: "🔴 Deep Dive + Prod Cases",
    simId: "sim2",
    qEN: "Q19: How does runtime.selectgo work under the hood (pollorder, lockorder, and the g.selectDone wakeup race)?",
    qRU: "Как устроен оператор select под капотом (runtime.selectgo: массивы pollorder, lockorder и разрешение гонки пробуждений через g.selectDone)?",
    shortEN: "runtime.selectgo builds two index arrays on the stack: pollorder (a Fisher–Yates shuffle via cheaprandn for fairness) and lockorder (a heap-sort of channel memory addresses to prevent AB-BA deadlocks when locking multiple channels). If parking is required, it enqueues a sudog into every channel, uses atomic g.selectDone.CompareAndSwap(0, 1) so only one channel can wake the goroutine, and unsubscribes remaining sudogs upon waking.",
    detailsEN: [
      "Pass 1 (Lock & Poll): Locks all unique channels in ascending memory address order ('selock(scases, lockorder)') and checks readiness in random 'pollorder'. If one is ready, executes and unlocks immediately.",
      "Pass 2 (Enqueue & Park): Links a separate 'sudog' (with 'isSelect = true') for each case into 'g.waiting', enqueues them into all channels, and calls 'gopark(selparkcommit)' to unlock all channels on g0.",
      "Pass 3 (CAS Arbitration & Cleanup): If two writers hit different branches on two CPU cores at the same nanosecond, both attempt 'sgp.g.selectDone.CompareAndSwap(0, 1)'. Only the winner copies data and wakes G; once awake, G re-locks 'lockorder' and removes its losing sudogs via 'dequeueSudoG'."
    ],
    practicalRU: "В pprof CPU высоконагруженных брокеров сообщений функция 'runtime.selectgo' (и в частности 'selock' / 'sellock') часто светится в топе потребления CPU! Почему? Потому что каждый блокирующий select с 4 каналами захватывает и отпускает 4 мьютекса ТРИЖДЫ за один цикл (при опросе, при парковке и при отписке от 3 неиспользованных каналов). Поэтому объединение событий в один канал работает в разы быстрее, чем select из 10 разных каналов.",
    code: `// Inside waitq.dequeue() — resolving simultaneous select wakeups across CPU cores:
if sgp.isSelect && !sgp.g.selectDone.CompareAndSwap(0, 1) {
    continue // Another CPU core already won CAS(0 -> 1) on another select branch!
}`
  },
  {
    id: "c20",
    mod: "m3",
    modName: "3. Channels, Select & Sync",
    level: "senior",
    levelLabel: "🟡 Senior (Runtime)",
    simId: "sim2",
    qEN: "Q20: How does Compare-And-Swap (CAS) work in Go assembly (LOCK CMPXCHG) and CPU caches (MESI), and what is False Sharing?",
    qRU: "Как работает CAS в Go на уровне ассемблера (LOCK CMPXCHG) и кэш-линий процессора (протокол MESI), и что такое False Sharing?",
    shortEN: "In Go, atomic.CompareAndSwap is a compiler intrinsic that emits a hardware LOCK CMPXCHG instruction on amd64 (or CASAL on ARM64). The CPU core locks the target 64-byte L1/L2 cache line in Exclusive/Modified state via the MESI cache coherency protocol, flushes its store buffer, and atomically updates the value if it matches old.",
    detailsEN: [
      "Hardware Execution: Loads 'old' into EAX and 'new' into ECX. 'LOCK CMPXCHGL CX, 0(BX)' compares EAX with memory, writes ECX if equal, sets the Zero Flag (ZF = 1), and acts as a full memory barrier.",
      "Where Go Runtime Uses CAS: Goroutine status changes (casgstatus), P.runnext, P.runqhead (lock-free Work Stealing), g.selectDone, and the fast-path of sync.Mutex.",
      "The ABA Problem: If a value changes A -> B -> A, CAS succeeds unaware of intermediate mutations (solved with monotonic version counters)."
    ],
    practicalRU: "Практический кейс деградации производительности в 10 раз (False Sharing / Cache-Line Ping-Pong): если у тебя в структуре подряд лежат два атомарных счётчика (`type Metrics struct { reqs atomic.Uint64; errs atomic.Uint64 }`), они попадают в одну и ту же 64-байтную кэш-линию CPU! Когда 16 ядер инкрементят `reqs` и `errs` через LOCK, ядра постоянно инвалидируют кэш L1 друг друга по шине MESI. Лечится выравниванием (padding `[56]byte` или `cpu.CacheLinePad`) либо шардированием счётчиков по ядрам.",
    code: `// Preventing False Sharing across 64-byte CPU cache lines:
type PaddedCounter struct {
    val atomic.Uint64
    _   [56]byte // 8 + 56 = 64 bytes (fits on its own dedicated L1/L2 cache line!)
}`
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
