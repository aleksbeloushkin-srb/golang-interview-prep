const CARDS = [
  {
    id: "c1",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    simId: "sim1",
    qEN: "Q1: What is a goroutine (both in code and in the runtime) and how is it created?",
    qRU: "Что такое горутина на уровне кода и на уровне рантайма, и как она создаётся?",
    shortEN: "At the code level, a goroutine is a concurrently executing function or closure launched with the 'go' keyword with no user-accessible handle or ID. At the runtime level, it is a lightweight user-space thread represented by a runtime.g struct with a 2 KB stack allocated on the heap.",
    detailsEN: [
      "Syntactic Abstraction: 'go fn()' returns nothing — there is no Thread object, Future, or goroutine ID in user space.",
      "Under the Hood (runtime.newproc): The compiler translates 'go fn()' into runtime.newproc(funcval), switching to the OS thread's g0 system stack.",
      "Initialization: Grabs a runtime.g from P.gFree (or allocates a new G + 2 KB heap stack), pushes runtime.goexit as a fake return address at the stack bottom, populates g.sched (gobuf), and places G into P.runnext."
    ],
    code: `// src/runtime/proc.go
func newproc(fn *funcval) {
    gp := getg()
    pc := getcallerpc()
    systemstack(func() {
        newg := newproc1(fn, gp, pc) // prepares G & 2KB stack on g0
        pp := getg().m.p.ptr()
        runqput(pp, newg, true)      // puts newg into P.runnext (LIFO slot)
    })
}`
  },
  {
    id: "c2",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    simId: null,
    qEN: "Q2: Why did Go designers intentionally omit a goroutine ID or handle in user code?",
    qRU: "Почему создатели Go намеренно не дали горутинам ID или объект-дескриптор в коде?",
    shortEN: "To prevent Thread-Local Storage (TLS) abuse and unsafe external termination. Killing a goroutine forcibly from outside would leave mutexes locked, shared memory corrupted, and resources leaked.",
    detailsEN: [
      "No Thread-Local Storage (TLS): Prevents libraries from secretly coupling state to a specific execution thread ID.",
      "Safe Cooperative Cancellation: Instead of an external .kill() or .stop() method, Go enforces explicit lifecycle management through channels and context.Context."
    ],
    code: `// Explicit cooperative cancellation instead of thread.kill():
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
go func(ctx context.Context) {
    select {
    case <-ctx.Done():
        return // clean exit, defers run, locks released
    }
}(ctx)`
  },
  {
    id: "c3",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    simId: "sim1",
    qEN: "Q3: Where does a goroutine live in memory, and how does dynamic stack growth (morestack / copystack) work?",
    qRU: "Где горутина живёт в памяти и как работает динамическое расширение стека (morestack / copystack)?",
    shortEN: "Both runtime.g and its contiguous 2 KB stack live on the process heap. Every non-leaf function prologue compares the CPU's RSP register against g.stackguard0. On overflow, runtime.morestack switches to g0, allocates a 2x larger heap block (copystack), copies frames, and shifts internal stack pointers.",
    detailsEN: [
      "Prologue Check: Stacks grow downward (from stack.hi to stack.lo). If RSP <= g.stackguard0, the prologue jumps to runtime.morestack.",
      "Doubling on g0 (copystack): Allocates a contiguous heap block 2x the size (up to 1 GB on 64-bit) and copies bytes via memmove.",
      "Pointer Adjustment (adjustpointers): Uses compiler-generated stack bitmaps to find any pointer on the stack pointing into [old.lo, old.hi) and shifts it by delta = new.hi - old.hi.",
      "Shrinking: During GC, if a stack uses less than 25% of its capacity, GC shrinks it by half."
    ],
    code: `// Compiler-inserted function prologue (amd64):
CMPQ SP, 16(R14)       // compare RSP against g.stackguard0 (R14 holds *g)
JLS  morestack_noctxt  // if RSP <= stackguard0 -> switch to g0 & grow stack`
  },
  {
    id: "c4",
    mod: "m1",
    modName: "1. Goroutines & Stack",
    simId: "sim1",
    qEN: "Q4: How does an OS thread (M) actually start executing a goroutine and switch CPU registers (mcall vs. gogo)?",
    qRU: "Как поток ОС начинает исполнять горутину и как физически подменяются регистры процессора (mcall / gogo)?",
    shortEN: "Each OS thread (M) runs the scheduler on a dedicated system stack (g0). Once schedule() picks a goroutine, runtime.gogo switches from g0 to G in ~10-20ns by loading G into R14, G.sched.sp into the CPU's RSP register, and jumping (JMP) directly to G.sched.pc (RIP).",
    detailsEN: [
      "Minimal Context (runtime.gobuf): Because switches happen at function boundaries in user space, Go only saves SP, PC, BP, and R14 (no kernel trap or SIMD state dump).",
      "runtime.gogo(&g.sched) [g0 -> G]: Loads *g into R14, overwrites RSP with G's 2 KB heap stack address, and executes JMP to load the function address into RIP.",
      "runtime.mcall(fn) [G -> g0]: Saves G's current PC/RSP into g.sched, switches RSP to g0's stack, and runs scheduler logic.",
      "The runtime.goexit Trick: When the goroutine's entry function finishes and executes RET, the CPU pops the fake return address runtime.goexit from the bottom of the stack, which calls mcall(goexit0) to recycle G into P.gFree."
    ],
    code: `// src/runtime/asm_amd64.s — runtime.gogo(buf *gobuf)
MOVQ gobuf_g(BX), DX
MOVQ DX, R14            // 1. Set current goroutine register R14 = *G
MOVQ gobuf_sp(BX), SP   // 2. Swap Stack Pointer RSP to G's 2KB heap stack!
MOVQ gobuf_bp(BX), BP   // 3. Restore frame pointer RBP
MOVQ gobuf_pc(BX), BX
JMP  BX                 // 4. Load G's PC into RIP and start executing!`
  },
  {
    id: "c5",
    mod: "m2",
    modName: "2. GMP Scheduler",
    simId: "sim1",
    qEN: "Q5: How does the Go GMP scheduler model work?",
    qRU: "Как устроена модель планировщика GMP в Go?",
    shortEN: "Go uses an M:N scheduler that multiplexes M goroutines (G) onto N OS kernel threads (M) across at most GOMAXPROCS logical processors (P).",
    detailsEN: [
      "G (Goroutine): Holds the heap stack, saved registers (gobuf), and atomicstatus (_Grunnable, _Grunning, _Gwaiting, _Gsyscall).",
      "M (Machine): OS kernel thread containing its own g0 system stack.",
      "P (Processor): Logical scheduling context (count = GOMAXPROCS) holding a lock-free 256-element Local Run Queue (LRQ), a 1-slot LIFO runnext, and a per-P mcache for lock-free small heap allocations."
    ],
    code: `// M must acquire a P to execute Go code:
// [ M (OS Thread) ] <---> [ P (GOMAXPROCS) ] ---> [ G (Running) ]
//                                            ---> [ runnext (1-slot LIFO) ]
//                                            ---> [ LRQ (256-slot FIFO) ]`
  },
  {
    id: "c6",
    mod: "m2",
    modName: "2. GMP Scheduler",
    simId: "sim1",
    qEN: "Q6: Why does each processor (P) have a 1-element LIFO slot (runnext) alongside its 256-element FIFO queue?",
    qRU: "Зачем у каждого процессора P есть одноэлементный LIFO-стек (runnext) перед обычной FIFO-очередью на 256 горутин?",
    shortEN: "P.runnext is a single-slot high-priority LIFO queue designed to maximize L1/L2 CPU cache locality for newly created or newly unblocked goroutines without starving older tasks.",
    detailsEN: [
      "L1/L2 Cache Locality: When G1 spawns G2 (newproc) or wakes G2 on a channel (goready), the memory G2 will touch is already hot in the current CPU core's L1/L2 cache.",
      "No Starvation Compromise: A full LIFO stack would starve older goroutines. With a 1-slot LIFO, placing a new goroutine into P.runnext via atomic CAS displaces any previous occupant into the tail of the 256-element FIFO queue (runq)."
    ],
    code: `// src/runtime/proc.go — inside runqput(pp *p, gp *g, next bool)
oldnext := pp.runnext
if pp.runnext.cas(oldnext, guintptr(unsafe.Pointer(gp))) {
    if oldnext == 0 { return }
    gp = oldnext.ptr() // displaced old goroutine goes to FIFO runq[256]
}`
  },
  {
    id: "c7",
    mod: "m2",
    modName: "2. GMP Scheduler",
    simId: null,
    qEN: "Q7: How does goroutine preemption work in Go (Cooperative vs. Asynchronous)?",
    qRU: "Как в планировщике Go работает вытеснение горутин (кооперативное и асинхронное)?",
    shortEN: "Since Go 1.14, the scheduler uses hybrid preemption combining cooperative preemption (at channel/I/O blocks and function prologues) with asynchronous signal-based preemption via sysmon and SIGURG.",
    detailsEN: [
      "Cooperative Preemption: Voluntary switches on channel operations, mutexes, I/O, or function prologues when g.stackguard0 is poisoned with stackPreempt.",
      "Asynchronous Preemption: Prevents tight CPU loops ('for {}') from starving the runtime. The background sysmon thread (which runs without a P) detects any goroutine running for > 10 ms and sends a SIGURG signal to its OS thread (M).",
      "Signal Handler: Interrupts M, saves G's registers, parks the preempted G into the Global Run Queue (GRQ), and schedules the next goroutine."
    ],
    code: `// Asynchronous Preemption Flow (Go 1.14+):
// G runs > 10ms -> sysmon sends SIGURG to M -> M saves RIP/RSP ->
// G moves to Global Run Queue (GRQ) -> M runs next G from P's queue`
  },
  {
    id: "c8",
    mod: "m2",
    modName: "2. GMP Scheduler",
    simId: null,
    qEN: "Q8: How does Work Stealing work, and how do blocking syscalls differ from network I/O?",
    qRU: "Как работает кража задач (Work Stealing) и чем блокирующий syscall отличается от сетевого ввода-вывода через netpoller?",
    shortEN: "In runtime.findrunnable, P checks GRQ every 61st tick, then its own runnext/LRQ, GRQ, netpoller, and finally steals half of a random P's LRQ via lock-free CAS. Network I/O parks only G inside netpoller, whereas blocking syscalls hand P off to another OS thread.",
    detailsEN: [
      "1/61 Fairness Rule: Every 61st tick (P.schedtick % 61 == 0), P checks the Global Run Queue (GRQ) first so two local goroutines cannot starve the GRQ.",
      "Work Stealing: Picks a random P and atomically steals 50% of its LRQ from the tail using lock-free CAS on runqhead.",
      "Network I/O (netpoller): Uses epoll/kqueue/IOCP. G is parked (_Gwaiting) while M and P never block in the OS kernel.",
      "Blocking syscall (P Handoff): M1 blocks in the kernel with G (_Gsyscall) and detaches P (_Psyscall). sysmon hands P off to another thread M2 so local queues keep running."
    ],
    code: `// Lookup order in runtime.findrunnable():
// 1. Every 61st tick -> Global Run Queue (GRQ)
// 2. Local P.runnext -> Local P.runq[256] (LRQ)
// 3. Global Run Queue (GRQ) -> 4. Network Poller (netpoller)
// 5. Work Stealing: steal 50% from a random victim P's LRQ`
  },
  {
    id: "c9",
    mod: "m3",
    modName: "3. Channels, Select & CAS",
    simId: "sim2",
    qEN: "Q9: What is inside runtime.hchan, and why do wait queues hold runtime.sudog instead of runtime.g?",
    qRU: "Как устроена структура канала runtime.hchan и зачем очереди хранят обёртку sudog вместо самой горутины runtime.g?",
    shortEN: "Calling make(chan T) allocates a runtime.hchan struct on the heap (returning *hchan), which contains a circular buffer (buf), sendq/recvq wait queues of runtime.sudog structs, and an internal mutex (lock). sudog enables an M:N relationship so one goroutine can wait on multiple channels simultaneously inside a select.",
    detailsEN: [
      "Ring Buffer: buf pointer, dataqsiz (capacity), qcount (current items), sendx and recvx indices.",
      "Why sudog: A single goroutine in a select statement must enqueue itself into several different channels at once. Each branch gets its own sudog (from P's sudogcache) pointing to the same *g and the stack variable address (elem).",
      "Mutex-Protected: Channels are NOT lock-free; operations acquire hchan.lock (backed by OS futex)."
    ],
    code: `type hchan struct {
    qcount, dataqsiz uint
    buf              unsafe.Pointer // ring buffer in heap
    sendx, recvx     uint
    recvq, sendq     waitq          // doubly-linked list of *sudog
    lock             mutex          // internal runtime mutex
}`
  },
  {
    id: "c10",
    mod: "m3",
    modName: "3. Channels, Select & CAS",
    simId: "sim2",
    qEN: "Q10: Walk through channel send/receive (gopark, sendDirect, and the nil/closed channel matrix).",
    qRU: "Как работают отправка и чтение из канала (gopark, прямое копирование sendDirect и таблица поведения nil/закрытых каналов)?",
    shortEN: "Under hchan.lock, sending executes one of three paths: direct stack-to-stack copy (sendDirect) if a receiver is waiting in recvq, copying into the ring buffer, or parking via gopark(chanparkcommit).",
    detailsEN: [
      "Direct Stack-to-Stack Copy (sendDirect): If recvq has a waiting sudog, the sender copies data straight from its own stack into the parked receiver's stack (sg.elem) via memmove + typeBitsBulkBarrier, completely bypassing hchan.buf, then calls goready (putting the receiver into P.runnext).",
      "Why gopark unlocks on g0 (chanparkcommit): A blocking goroutine switches RSP to the g0 stack BEFORE releasing hchan.lock so another thread cannot wake and resume G while it is still running on its own stack.",
      "Nil vs. Closed Matrix: Send/Receive on nil channel blocks forever; Send/Close on closed channel panics; Receive on closed channel drains buffer then returns (zero-value, false)."
    ],
    code: `// Direct copy from sender's stack to parked receiver's stack:
func sendDirect(t *_type, sg *sudog, src unsafe.Pointer) {
    dst := sg.elem // address of variable right on parked G1's stack!
    typeBitsBulkBarrier(t, uintptr(dst), uintptr(src), t.Size_)
    memmove(dst, src, t.Size_)
}`
  },
  {
    id: "c11",
    mod: "m3",
    modName: "3. Channels, Select & CAS",
    simId: "sim2",
    qEN: "Q11: How does the select statement (runtime.selectgo) work under the hood?",
    qRU: "Как устроен оператор select под капотом (pollorder, lockorder, цепочка sudog и гонка пробуждений selectDone)?",
    shortEN: "runtime.selectgo allocates two stack arrays: pollorder (a Fisher-Yates random shuffle to prevent starvation) and lockorder (a heap-sort of channel memory addresses to prevent AB-BA deadlocks). If no channel is ready, it enqueues a sudog into every channel, arbitrates concurrent wakeups via atomic g.selectDone.CompareAndSwap(0, 1), and unsubscribes losing sudogs upon waking.",
    detailsEN: [
      "pollorder (Fairness): Randomly shuffles non-nil cases via cheaprandn so ready channels are picked uniformly.",
      "lockorder (Deadlock Avoidance): Sorts *hchan pointers by ascending memory address before locking all channels (selock), preventing AB-BA deadlocks between concurrent selects.",
      "Wakeup Race (g.selectDone): When parked in multiple channels, competing writers must win g.selectDone.CompareAndSwap(0, 1) to claim the wakeup. Once awakened, G re-locks all channels and removes its unused sudogs."
    ],
    code: `// Inside waitq.dequeue() — resolving simultaneous select wakeups:
if sgp.isSelect && !sgp.g.selectDone.CompareAndSwap(0, 1) {
    continue // another CPU core already woke this goroutine on another case!
}`
  },
  {
    id: "c12",
    mod: "m3",
    modName: "3. Channels, Select & CAS",
    simId: "sim2",
    qEN: "Q12: How does Compare-And-Swap (CAS) work in Go assembly and CPU caches, and where is it used?",
    qRU: "Как работает CAS в Go на уровне ассемблера и кешей процессора, и где он применяется в рантайме?",
    shortEN: "atomic.CompareAndSwap is a compiler intrinsic that emits a single hardware instruction: LOCK CMPXCHG on x86-64. The CPU locks the 64-byte L1/L2 cache line in Exclusive/Modified state via the MESI coherency protocol, flushes the store buffer, and atomically swaps the value if *ptr == old.",
    detailsEN: [
      "Assembly (LOCK CMPXCHGL): Compares accumulator EAX (old) with memory 0(BX). If equal, writes ECX (new) into memory and sets Zero Flag ZF = 1; otherwise copies memory into EAX and clears ZF = 0.",
      "Where Go Runtime Uses CAS: 1) Goroutine status transitions (casgstatus), 2) P.runnext and P.runqhead (lock-free Work Stealing), 3) select wakeup race (g.selectDone), 4) sync.Mutex / runtime.mutex fast-path, 5) sysmon P handoff.",
      "Trade-offs: Heavy contention causes L1 cache-line ping-pong across cores; susceptible to the ABA problem unless paired with monotonic counters."
    ],
    code: `// src/internal/runtime/atomic/asm_amd64.s
TEXT ·Cas(SB), NOSPLIT, $0-17
    MOVQ ptr+0(FP), BX
    MOVL old+8(FP), AX       // EAX = expected old value
    MOVL new+12(FP), CX      // ECX = new value
    LOCK
    CMPXCHGL CX, 0(BX)       // MESI cache-line lock + atomic compare & swap
    SETEQ ret+16(FP)         // return ZF (1 = true, 0 = false)
    RET`
  },
  {
    id: "c13",
    mod: "m4",
    modName: "4. Escape Analysis & GC",
    simId: "sim3",
    qEN: "Q13: What is Escape Analysis in Go, and what causes a variable to escape to the heap?",
    qRU: "Что такое Escape Analysis в Go и в каких случаях переменная убегает в хип?",
    shortEN: "Escape Analysis is a compile-time static analysis (-gcflags='-m') that allocates variables on the goroutine's fast stack if the compiler can prove their lifetime does not outlive the function frame and their size is bounded; otherwise, they escape to the shared heap.",
    detailsEN: [
      "Sharing Down vs. Sharing Up: Passing a pointer down to a helper function stays on the stack. Returning a pointer up ('return &x') always escapes to the heap because the frame is destroyed on RET.",
      "Common Escape Triggers: 1) Returning pointers up, 2) Interface method calls (e.g., fmt.Println) due to dynamic dispatch via itab, 3) Variables captured by closures or goroutines, 4) Slices with runtime-determined size make([]T, n) or objects > 64 KB."
    ],
    code: `// Sharing Down -> Stays on Stack:
func main() { x := 42; printPtr(&x) }

// Sharing Up -> Escapes to Heap (go build -gcflags="-m"):
func newInt() *int { x := 42; return &x } // moved to heap: x`
  },
  {
    id: "c14",
    mod: "m4",
    modName: "4. Escape Analysis & GC",
    simId: "sim3",
    qEN: "Q14: How does Go's Tri-Color Mark-and-Sweep GC and Hybrid Write Barrier work?",
    qRU: "Как устроен трёхцветный сборщик мусора (GC) в Go и зачем нужен Гибридный барьер записи?",
    shortEN: "Go uses a concurrent, tri-color (White/Grey/Black), non-generational, non-compacting garbage collector tuned for sub-millisecond pause latency. During Concurrent Mark, a compiler-injected Hybrid Write Barrier shades mutated heap pointers Grey so live objects are never accidentally swept.",
    detailsEN: [
      "Why Non-Generational & Non-Compacting: Escape Analysis already keeps short-lived objects on stacks (replacing a Young Gen), and TCMalloc-style size classes (mspan/mcache) prevent fragmentation without moving objects.",
      "Tri-Color Invariant: White = unvisited candidates for collection; Grey = live objects waiting to have their children scanned; Black = scanned live objects (never point directly to White).",
      "The 4 Phases: 1) Mark Setup (STW #1, enables Write Barrier), 2) Concurrent Mark (~25% GOMAXPROCS CPU + Mark Assist), 3) Mark Termination (STW #2, disables Write Barrier), 4) Concurrent Sweep.",
      "Pacing: Triggered by GOGC (default 100% heap doubling), GOMEMLIMIT (soft memory limit since Go 1.19), or sysmon every 2 minutes."
    ],
    code: `// Pseudo-code of compiler-injected Hybrid Write Barrier during Concurrent Mark:
func writePointer(slot *unsafe.Pointer, ptr unsafe.Pointer) {
    if writeBarrier.enabled {
        shade(*slot) // shade old target Grey (Yuasa deletion barrier)
        shade(ptr)   // shade new target Grey (Dijkstra insertion barrier)
    }
    *slot = ptr
}`
  }
];
