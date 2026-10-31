# Реестр источников Go

Сгенерировано из `docs/verification/go-sources.json` командой `node scripts/go-sources.mjs md`; руками не править. Что это и как обновлять — `CLAUDE_HANDOFF_RU.md`, очередь, п. 3.

С выходом новой версии Go: `node scripts/go-sources.mjs diff <старый GOROOT> <новый GOROOT>` печатает факты, у которых изменился исходник, — их и сверять.

Всего утверждений: 195; элементов сайта: 19.

## c1

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/stack.go` | `stackMin` | A goroutine starts with a small stack of at least 2 KiB (stackMin = 2048 on Linux/amd64) that grows on demand. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `newproc1` | The Go runtime, not the OS, creates goroutines: newproc1 reuses a dead G from gfget or allocates one with malg(stackMin) and makes it runnable. | 1.24.7, 1.26.1, 1.27.3 | — |
| jvmEN | `src/runtime/signal_unix.go` | `preemptM` | The runtime can preempt a goroutine in the middle of a loop by signalling its thread (asynchronous preemption). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/debug.go` | `GOMAXPROCS` | GOMAXPROCS limits how many OS threads execute user Go code at once; it is not the number of goroutines or threads. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/stack.go` | `gcComputeStartingStackSize` | A reused goroutine may start with a larger stack sized from the average stack use the GC observed, never below fixedStack. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/runtime2.go` | `g` | Each goroutine has a runtime descriptor, the struct runtime.g. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/runtime2.go` | `g.goid` | The runtime numbers goroutines internally in g.goid; no public API exposes the number. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/traceback.go` | `goroutineheader` | Stack traces print the internal number as "goroutine N". | 1.24.7, 1.26.1, 1.27.3 | — |
| sources | `doc/go_spec.html` | `Go_statements` | A go statement evaluates the function value and arguments in the calling goroutine, runs the call in a new goroutine and returns nothing (spec section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |

## c3

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `doc/go_spec.html` | `Go_statements` | go f(x) evaluates f and x in the calling goroutine and runs the call in a new goroutine (spec section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `newproc` | newproc runs on the system stack, creates the G with newproc1, queues it with runqput(pp, newg, true) and then calls wakep once mainStarted. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/stack.go` | `stackMin` | A newly allocated G gets the minimum stack, 2 KiB on Linux. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/proc.go` | `newproc1` | newproc1 takes a dead G from gfget or creates one with malg(stackMin). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/proc.go` | `gfget` | A reused G whose stack is not startingStackSize gets it freed and a new startingStackSize stack allocated, so reuse does not promise zero allocations. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/stack.go` | `gcComputeStartingStackSize` | The starting size for reused Gs is recomputed at each GC from average scanned stack usage, unless GODEBUG adaptivestackstart=0. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/runtime1.go` | `parseRuntimeDebugVars` | GODEBUG adaptivestackstart is on by default (debug.adaptivestackstart = 1). | 1.26.1, 1.27.3 | symbol renamed only: in 1.24.7 the default is set in parsedebugvars, in 1.26.1+ in parseRuntimeDebugVars; default 1 in all three |
| detailsEN[1] | `src/runtime/proc.go` | `newproc1` | newproc1 sets newg.sched.sp and newg.sched.pc = goexit + PCQuantum before calling gostartcallfn. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/sys_x86.go` | `gostartcall` | On amd64, gostartcall pushes the saved PC (goexit) onto the new stack as the return address and stores fn in sched.pc and the closure in sched.ctxt. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `runqput` | runqput(pp, gp, true) prefers runnext but uses the ordinary queue without sysmon or, randomly, under -race. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `wakep` | After queuing, newproc calls wakep so an idle P can start and steal the new G. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/runtime2.go` | `g.goid` | The runtime has internal goroutine IDs (g.goid) but exposes no public current-ID API. | 1.24.7, 1.26.1, 1.27.3 | — |

## c4

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/stack.go` | `stackalloc` | stackalloc serves small stacks from the per-P mcache.stackcache or stackpool free lists and larger ones from stackLarge or a dedicated span, never through mallocgc. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/mheap.go` | `allocManual` | Stack spans are manually managed spans from allocManual, not swept GC heap objects and not counted in heapInUse. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/stack.go` | `copystack` | A growing stack is copied to a new, larger allocation, so its address changes. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/mstats.go` | `MemStats.StackInuse` | MemStats.StackInuse is bytes in stack spans, not bytes used by live frames. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/mcache.go` | `mcache.stackcache` | The per-P free-stack cache lives in mcache.stackcache, one list per size order. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/runtime2.go` | `gobuf.sp` | g.sched.sp is the saved resume stack pointer. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/runtime2.go` | `stack.lo` | g.stack.lo and g.stack.hi bound the allocated stack region. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/stack.go` | `freeStackSpans` | Unused stack spans are returned to the heap at the end of GC. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/mstats.go` | `MemStats.StackSys` | StackSys is StackInuse plus OS-thread stack memory obtained directly from the OS, and does not count every C stack. | 1.24.7, 1.26.1, 1.27.3 | — |

## c5

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/stack.go` | `newstack` | When the prologue's stack check fails, morestack calls newstack, which allocates a stack at least twice the old size and copies the frames. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/stack.go` | `adjustpointers` | copystack fixes pointers into the old stack using the compiler's stack pointer maps. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/cmd/compile/internal/escape/solve.go` | `outlives` | Escape analysis keeps pointers to stack objects out of the heap, so user heap objects never point into a stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `main` | runtime.main sets maxstacksize to 1000000000 bytes on 64-bit systems and 250000000 on 32-bit systems. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/stack.go` | `newstack` | Growth beyond maxstacksize prints "goroutine stack exceeds N-byte limit" and throws "stack overflow". | 1.24.7, 1.26.1, 1.27.3 | — |
| jvmEN | `src/runtime/stack.go` | `newstack` | Exceeding the stack limit is a fatal throw that cannot be recovered. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/cmd/internal/obj/x86/obj6.go` | `preprocess` | On amd64, small frameless leaf functions and NOSPLIT functions get no stack-split check in the prologue. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/stack.go` | `newstack` | When stackguard0 == stackPreempt, newstack handles a preemption request instead of growing the stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/stack.go` | `newstack` | newstack starts with twice the old size and doubles again until funcMaxSPDelta + stackGuard fits. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/stack.go` | `syncadjustsudogs` | When a G has active channel references, copystack locks the channels and adjusts sudog pointers into the stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/stack.go` | `shrinkstack` | shrinkstack halves the stack only if usage (hi - sp + stackNosplit) is below a quarter, the half is at least fixedStack and isShrinkStackSafe allows it. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/mgcmark.go` | `scanstack` | The GC shrinks stacks while scanning them, or defers it to a synchronous safe point through preemptShrink. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/proc.go` | `main` | The default per-goroutine limit is 1 GB on 64-bit and 250 MB on 32-bit systems. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/stack.go` | `stackalloc` | Stack sizes are powers of two, so the largest stack under the 1000000000-byte default is 2^29 bytes = 512 MiB. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/debug/garbage.go` | `SetMaxStack` | debug.SetMaxStack sets the per-goroutine limit for future growth, returns the previous value, and exceeding it crashes the program. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/unsafe/unsafe.go` | `Pointer` | A uintptr is an integer, not a pointer the GC tracks or adjusts when a stack moves. | 1.24.7, 1.26.1, 1.27.3 | — |

## c6

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/cmd/internal/obj/x86/a.out.go` | `REGG` | On amd64 the current G is in R14 under ABIInternal. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/asm_amd64.s` | `gogo` | gogo stores the G in TLS and R14, restores SP, BP and the closure context, clears those gobuf fields and jumps to the saved PC (assembly TEXT symbol). | 1.24.7, 1.26.1, 1.27.3 | 1.24.7: gogo also loads gobuf.ret into AX and clears it; gobuf.ret was removed in Go 1.25, so 1.26.1/1.27.3 restore only SP, ctxt, BP and PC |
| shortEN | `src/runtime/asm_amd64.s` | `mcall` | mcall saves the caller's PC, SP and BP in g.sched, switches R14 and SP to g0 and calls the scheduler function there (assembly TEXT symbol). | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/runtime2.go` | `m.g0` | Each M has a g0 whose stack is the thread's system stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `execute` | On g0 the scheduler calls execute, which marks the G running and calls gogo(&gp.sched). | 1.24.7, 1.26.1, 1.27.3 | — |
| code | `src/runtime/runtime2.go` | `gobuf` | g.sched is a gobuf holding sp, pc, g, ctxt, lr and bp: continuation state, not every CPU register. | 1.24.7, 1.26.1, 1.27.3 | 1.24.7: gobuf also has a ret field (removed in Go 1.25); 1.26.1 and 1.27.3: sp, pc, g, ctxt, lr, bp |
| detailsEN[1] | `src/runtime/asm_amd64.s` | `gogo` | On amd64, gogo restores SP, BP and the closure context, clears selected gobuf fields and jumps to the saved PC (assembly TEXT symbol). | 1.24.7, 1.26.1, 1.27.3 | 1.24.7: gogo also loads gobuf.ret into AX and clears it; gobuf.ret was removed in Go 1.25, so 1.26.1/1.27.3 restore only SP, ctxt, BP and PC |
| detailsEN[2] | `src/cmd/compile/abi-internal.md` | `Function call argument and result passing` | Go's internal ABI has no callee-save registers, so a voluntary switch at a call needs only the continuation state (Markdown section, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/preempt_amd64.s` | `asyncPreempt` | Asynchronous preemption first saves every register on the goroutine's stack (assembly TEXT symbol). | 1.24.7 | 1.24.7: asyncPreempt saves flags, GP registers and X0-X15 on the goroutine stack (ADJSP $368); 1.26.1+ (since Go 1.26): only flags and GP registers go on the stack (ADJSP $112), vector registers go to p.xRegs.scratch and xRegSave moves them to off-stack gp.xRegs.state |
| detailsEN[2] | `src/runtime/preempt_xreg.go` | `xRegSave` | On amd64, arm64 and loong64, asynchronous preemption saves the vector registers outside the goroutine stack, in per-G state gp.xRegs.state. | 1.26.1, 1.27.3 | absent in 1.24.7: file added in Go 1.26 (also absent in the 1.25.1 tree); before that the vector registers were saved on the goroutine stack |
| detailsEN[3] | `src/cmd/internal/obj/arm64/a.out.go` | `REGG` | On arm64 the current G is in R28. | 1.24.7, 1.26.1, 1.27.3 | — |

## sim1

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| steps[0].desc | `doc/go_spec.html` | `Go_statements` | G1 evaluates the function value and arguments of go doWork(n); the new goroutine runs the call (spec section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[0].board | `src/runtime/proc.go` | `runqput` | runnext is a single slot: a new G from go takes it, and the previous occupant moves to the tail of the local runq. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[1].desc | `src/runtime/asm_amd64.s` | `systemstack` | systemstack switches R14 and SP to g0 while m.curg still points to the user G (assembly TEXT symbol). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[1].board | `src/runtime/proc.go` | `newproc1` | G2 comes from the free pool (gfget) or is newly allocated (malg). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[1].board | `src/runtime/stack.go` | `gcComputeStartingStackSize` | A new G gets 2 KiB on Linux/amd64; a pooled G gets the adaptive starting size, never below 2 KiB. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[2].desc | `src/cmd/compile/internal/typecheck/stmt.go` | `normalizeGoDeferCall` | For go doWork(n) the compiler evaluates n in the caller and wraps the call in a generated closure (main.main.gowrap1) that holds the copy. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[2].desc | `src/runtime/sys_x86.go` | `gostartcall` | On amd64, goexit is pushed as the wrapper's return address; sched.pc becomes the wrapper entry and sched.ctxt the closure. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[3].board | `src/runtime/proc.go` | `runqput` | Without sysmon (wasm) runnext is not used; under -race the runtime puts the G in the ordinary queue with probability 1/2. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[4].desc | `src/runtime/proc.go` | `execute` | execute moves the G from runnable to running and calls gogo. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[4].desc | `src/runtime/asm_amd64.s` | `gogo` | gogo restores the current G, SP, BP and closure context, then jumps to the saved PC (assembly TEXT symbol). | 1.24.7, 1.26.1, 1.27.3 | 1.24.7: gogo also loads gobuf.ret into AX and clears it; gobuf.ret was removed in Go 1.25, so 1.26.1/1.27.3 restore only SP, ctxt, BP and PC |
| steps[4].boxes | `src/runtime/proc.go` | `execute` | schedtick is incremented only when the time slice is not inherited. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[5].desc | `src/runtime/proc.go` | `goexit1` | After the function returns, goexit calls goexit1, which calls mcall(goexit0) to switch to g0. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[5].board | `src/runtime/proc.go` | `gdestroy` | goexit0 calls gdestroy, which sets _Gdead and calls gfput, and then calls schedule. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[5].board | `src/runtime/proc.go` | `gfput` | gfput puts the dead G into the free pool and frees its stack if it is not startingStackSize. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[6].check | `src/runtime/stack.go` | `newstack` | On overflow the runtime prints "goroutine stack exceeds 1000000000-byte limit" and throws "stack overflow"; growth at least doubles the stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[6].check | `src/runtime/stack.go` | `shrinkstack` | The GC can shrink an underused stack. | 1.24.7, 1.26.1, 1.27.3 | — |

## q1

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/cmd/compile/internal/noder/writer.go` | `distinctVars` | Per-iteration loop variables apply when the file's Go version is at least go1.22; older language versions share one variable. | 1.24.7, 1.26.1, 1.27.3 | — |
| ru | `src/cmd/go/internal/gover/toolchain.go` | `TooNewError` | A module declaring go 1.25 or go 1.26 needs a toolchain at least that new; with GOTOOLCHAIN=local, Go 1.24.7 refuses to build it. | 1.26.1, 1.27.3 | 1.24.7 cannot build a module that declares go 1.25 or 1.26 (go.mod requires go >= 1.25); with go 1.22-1.24 in go.mod it prints the same 0, 1, 2 |
| sources | `doc/go_spec.html` | `For_clause` | Since Go 1.22 each iteration of a for clause has its own variable; before, iterations shared one (spec section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |
| sources | `doc/go_mem.html` | `chan` | Closing a channel is synchronized before a receive that returns because the channel is closed (memory model section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |
| sources | `src/sync/waitgroup.go` | `Wait` | WaitGroup.Wait blocks until the counter reaches zero; it ensures completion, not order. | 1.24.7, 1.26.1, 1.27.3 | — |

## q15

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/sync/waitgroup.go` | `Wait` | Wait blocks until every Done; a sender blocked on a full buffer never calls Done, so reading only after Wait hangs. | 1.24.7, 1.26.1, 1.27.3 | — |
| versionNote | `src/sync/waitgroup.go` | `Go` | WaitGroup.Go(func()) exists from Go 1.25 (api/go1.25.txt); the example uses only Add, Done and Wait, which exist from Go 1.0. | 1.26.1, 1.27.3 | WaitGroup.Go is absent in 1.24.7 and present in 1.26.1 and 1.27.3, whose docs recommend it over Add/Done; Add, Done and Wait are in all three |
| explanationRU | `src/runtime/chan.go` | `chansend` | A send on a full buffered channel blocks until a receiver frees a slot. | 1.24.7, 1.26.1, 1.27.3 | — |
| sources | `doc/go_spec.html` | `Close` | close does not wait for the buffer to drain; receives return the remaining values, then zero values (spec section id, not a Go declaration). | 1.24.7, 1.26.1, 1.27.3 | — |

## c7

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/proc.go` | `procresize` | GOMAXPROCS is the number of Ps: procresize keeps exactly gomaxprocs Ps, and a G runs Go code on an M only while that M holds a P. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `schedinit` | By default GOMAXPROCS equals the number of logical CPUs the process may use (sched_getaffinity count). | 1.24.7 | 1.26.1 and 1.27.3: with go >= 1.25 in go.mod on Linux the default is defaultGOMAXPROCS = min(affinity CPUs, max(ceil(cgroup quota/period), 2)), so it can be below the CPUs the process may use; 1.24.7: always the affinity count. |
| shortEN | `src/runtime/proc.go` | `retake` | A thread blocked for long in a system call or cgo can lose its P: sysmon retakes the P and hands it off (handoffp). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/runtime2.go` | `p.runnext` | Each P has a separate one-slot runnext in addition to its local queue. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/runtime2.go` | `p.runq` | Each P has a local run queue of 256 entries. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/cgroup_linux.go` | `defaultGOMAXPROCS` | Since Go 1.25 the Linux default GOMAXPROCS considers the affinity CPU count and the cgroup CPU quota. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |
| detailsEN[2] | `src/runtime/proc.go` | `sysmonUpdateGOMAXPROCS` | Since Go 1.25 sysmon periodically recomputes the default GOMAXPROCS and applies changes unless it was set explicitly. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |
| detailsEN[2] | `src/runtime/debug.go` | `GOMAXPROCS` | Setting GOMAXPROCS by environment variable or runtime.GOMAXPROCS sets customGOMAXPROCS and disables automatic updates. | 1.26.1, 1.27.3 | 1.24.7: runtime.GOMAXPROCS only changes the value; there are no automatic updates to disable. |
| detailsEN[2] | `src/internal/godebugs/table.go` | `All` | containermaxprocs and updatemaxprocs are GODEBUG settings with Changed: 25, Old: "0", so the module language version (go 1.24 and below) restores the old behaviour. | 1.26.1, 1.27.3 | 1.24.7: the table has neither setting. |
| code | `src/runtime/debug.go` | `GOMAXPROCS` | runtime.GOMAXPROCS(n) with n < 1 returns the current value without changing it. | 1.24.7, 1.26.1, 1.27.3 | — |
| practice.pointsEN[1] | `src/runtime/cgocall.go` | `cgocall` | A cgo call runs foreign code between entersyscall and exitsyscall, so its P can be retaken and the foreign CPU work is not capped by GOMAXPROCS. | 1.24.7, 1.26.1, 1.27.3 | — |

## c8

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/proc.go` | `forcePreemptNS` | sysmon requests preemption after a goroutine has run about 10 ms (forcePreemptNS = 10 ms) on the same schedtick. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/signal_unix.go` | `sigPreempt` | On Unix the asynchronous preemption signal is SIGURG. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/signal_unix.go` | `preemptM` | preemptM sends sigPreempt to the M running the goroutine (at most one pending signal). | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/signal_unix.go` | `doSigPreempt` | The SIGURG handler checks wantAsyncPreempt and isAsyncSafePoint and only then injects a call to asyncPreempt. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/proc.go` | `retake` | retake compares pp.schedtick with sysmontick.schedtick and calls preemptone after forcePreemptNS; goroutines run via runnext share one schedtick. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/proc.go` | `preemptone` | Cooperative preemption sets gp.preempt and gp.stackguard0 = stackPreempt; preemptM is added only when preemptMSupported and GODEBUG asyncpreemptoff=0. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/stack.go` | `newstack` | A prologue stack check that sees stackPreempt enters newstack, which calls gopreempt_m (or preemptPark) instead of growing the stack. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/preempt.go` | `asyncPreempt2` | After asyncPreempt saves registers, asyncPreempt2 enters the scheduler through gopreempt_m (or preemptPark for a suspend request). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/signal_unix.go` | `sigPreempt` | Since Go 1.14 the runtime sends SIGURG to running threads, so slow syscalls made directly can see EINTR more often. | 1.24.7, 1.26.1, 1.27.3 | — |
| versionNote | `src/runtime/os_wasm.go` | `preemptMSupported` | Asynchronous preemption depends on the platform: preemptMSupported is false on wasm (and on plan9, src/runtime/os_plan9.go). | 1.24.7, 1.26.1, 1.27.3 | — |
| versionNote | `src/runtime/preempt.go` | `asyncPreempt2` | Asynchronous preemption (preempt.go) exists since Go 1.14; the go1.13 tag has no preempt.go. | 1.24.7, 1.26.1, 1.27.3 | — |

## c9

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/proc.go` | `findRunnable` | findRunnable looks at timers and GC work, the every-61st-tick global G, runnext and the local queue, a global batch, non-blocking netpoll, then steals from other Ps. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `globrunqget` | Every 61st tick (schedtick % 61 == 0) with a non-empty global queue findRunnable takes exactly one G from it before the local queue. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/proc.go` | `findRunnable` | findRunnable handles timers, the trace reader and GC worker scheduling before ordinary queue selection, so “global, local, poll, steal” is not a full priority contract (same in all three, not only 1.26.1). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/proc.go` | `globrunqgetbatch` | With an empty local queue findRunnable takes a batch from the global queue (globrunqgetbatch): at most len(runq)/2 = 128 and at most size/gomaxprocs + 1; it runs the first and queues the rest locally. | 1.26.1, 1.27.3 | 1.24.7: no globrunqgetbatch; globrunqget(pp, 0) applies the same limits and runqputs the rest, and the 61-tick path calls globrunqget(pp, 1). Behaviour is the same, only the function name and signature differ (globrunqgetbatch exists since 1.25.0). |
| detailsEN[1] | `src/runtime/proc.go` | `execute` | execute increments schedtick only when inheritTime is false, so the runnext path inherits the time slice. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `runqgrab` | runqgrab takes n - n/2 entries from the head of the victim’s runq and commits with CAS on runqhead, retrying on concurrent changes; runnext is taken only when stealRunNextG. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `runqsteal` | runqsteal returns the last grabbed G for execution and publishes the rest in the thief’s runq. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `stealWork` | Stealing runnext (and running another P’s timers) is attempted only on the last of four steal passes. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[3] | `src/runtime/proc.go` | `runqsteal` | For a stable victim queue [A,B,C,D,E] the batch is [A,B,C]; runqsteal returns C and queues A,B; D,E stay. | 1.24.7, 1.26.1, 1.27.3 | — |
| jvmEN | `src/runtime/proc.go` | `runqget` | A P consumes its local queue FIFO from the head, after checking runnext first. | 1.24.7, 1.26.1, 1.27.3 | — |
| code | `src/runtime/proc.go` | `runqgrab` | n = 5 gives n - n/2 = 3 entries taken from the head. | 1.24.7, 1.26.1, 1.27.3 | — |
| practice.pointsEN[0] | `src/runtime/proc.go` | `runqgrab` | Five runnable Gs: the thief takes three from the head (n - n/2 with integer division). | 1.24.7, 1.26.1, 1.27.3 | — |

## c10

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/internal/poll/fd_unix.go` | `Read` | On a pollable fd, a read that gets EAGAIN waits through pd.waitRead (the netpoller) instead of blocking the thread. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/netpoll.go` | `netpollblock` | The waiting goroutine is parked (gopark) on the pollDesc; no OS thread is held per waiting socket. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `handoffp` | A retaken P is given to another M (startm) only if there is work; otherwise it goes to the idle list. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `retake` | During a long syscall or cgo call sysmon takes the thread’s P (after at least one sysmon tick) and hands it off. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/proc.go` | `reentersyscall` | In Go 1.25 (and 1.24) ordinary entersyscall detaches M from P, records m.oldp and puts P in _Psyscall. | 1.24.7 | 1.24.7 (and 1.25.0): reentersyscall clears pp.m/m.p, stores m.oldp and sets P to _Psyscall; 1.26.1 and 1.27.3: M and P stay attached, only G goes to _Gsyscall and _Psyscall is renamed _Psyscall_unused. |
| detailsEN[1] | `src/runtime/runtime2.go` | `_Psyscall` | _Psyscall is a live P state while a G is in an ordinary syscall. | 1.24.7 | 1.26.1 and 1.27.3: the constant is _Psyscall_unused and no P enters it. |
| detailsEN[1] | `src/runtime/proc.go` | `exitsyscallfast` | A quick return may reclaim the old P: exitsyscallfast CASes oldp from _Psyscall to _Pidle and rewires it. | 1.24.7 | 1.26.1 and 1.27.3: exitsyscallfast is gone; exitsyscall keeps a still-attached P, otherwise exitsyscallTryGetP(oldp) reclaims it through setBlockOnExitSyscall/takeP. |
| detailsEN[1] | `src/runtime/proc.go` | `entersyscallblock` | entersyscallblock hands off the P immediately for a known-blocking call (handoffp(releasep())). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/runtime2.go` | `_Psyscall_unused` | Since Go 1.26 _Psyscall is the defunct slot _Psyscall_unused. | 1.26.1, 1.27.3 | 1.24.7: the constant is _Psyscall and is the live syscall state. |
| detailsEN[2] | `src/runtime/proc.go` | `reentersyscall` | Since Go 1.26 ordinary entersyscall keeps M and P attached and only switches G to _Gsyscall. | 1.26.1, 1.27.3 | 1.24.7 (and 1.25.0): reentersyscall clears pp.m/m.p, stores m.oldp and sets P to _Psyscall; 1.26.1 and 1.27.3: M and P stay attached, only G goes to _Gsyscall and _Psyscall is renamed _Psyscall_unused. |
| detailsEN[2] | `src/runtime/proc.go` | `setBlockOnExitSyscall` | Retaking takes the G’s scan bit in _Gsyscall, validates the G–M–P links, then takeP, resume and handoffp. | 1.26.1, 1.27.3 | 1.24.7: absent; retake CASes the P from _Psyscall to _Pidle. |
| detailsEN[2] | `src/runtime/proc.go` | `retake` | retake looks only at _Prunning Ps and detects a syscall from the G state. | 1.26.1, 1.27.3 | 1.24.7: retake checks P status _Prunning or _Psyscall. |
| detailsEN[2] | `src/runtime/proc.go` | `entersyscallHandleGCWait` | If a stop-the-world is pending at syscall entry, the P is given up immediately (GC path). | 1.26.1, 1.27.3 | 1.24.7: entersyscall_gcwait moves the already-detached _Psyscall P to _Pgcstop. |
| detailsEN[3] | `src/runtime/proc.go` | `exitsyscall` | A returning syscall needs a P before user Go code resumes; with none free the G becomes runnable on the global queue and the M stops (stopm) or waits if locked (no-P path: exitsyscall0 in 1.24.7, exitsyscallNoP in 1.26.1/1.27.3). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[4] | `src/runtime/proc.go` | `checkmcount` | Exceeding sched.maxmcount crashes with “thread exhaustion”. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[4] | `src/runtime/debug/garbage.go` | `SetMaxThreads` | The thread limit starts at 10,000 and is changed with debug.SetMaxThreads (API since Go 1.2). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[4] | `src/runtime/proc.go` | `stopm` | Idle Ms are parked on the idle list (mput) and reused, not created per call. | 1.24.7, 1.26.1, 1.27.3 | — |
| practice.pointsEN[0] | `src/runtime/proc.go` | `exitsyscall` | After a retake with no free P the G is queued and the M stops; it may resume on another M. | 1.24.7, 1.26.1, 1.27.3 | — |

## c11

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/proc.go` | `newproc` | The go statement puts the new G into runnext (runqput with next=true). | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/proc.go` | `ready` | Waking a goroutine (goready → ready) puts it into runnext of the waking P. | 1.24.7, 1.26.1, 1.27.3 | — |
| shortEN | `src/runtime/chan.go` | `send` | A channel send to a waiting receiver wakes it with goready. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/proc.go` | `runqput` | With next=true runqput CAS-replaces runnext and moves the previous occupant to the ordinary queue; a full queue goes to runqputslow. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/proc.go` | `runqget` | runqget checks runnext before the local queue and returns inheritTime=true for it. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[1] | `src/runtime/proc.go` | `execute` | execute does not increment schedtick when inheritTime is true. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `haveSysmon` | runqput disables the runnext optimization when there is no sysmon (wasm). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `randomizeScheduler` | In race builds runqput randomly skips runnext (randomizeScheduler = raceenabled). | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/proc.go` | `retake` | sysmon preempts a chain of runnext goroutines that share one schedtick. | 1.24.7, 1.26.1, 1.27.3 | — |

## c12

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| shortEN | `src/runtime/pprof/pprof.go` | `lockProfiles` | Since Go 1.27 the goroutineleak profile is a built-in profile. | 1.27.3 | 1.26.1: registered only when built with GOEXPERIMENT=goroutineleakprofile. 1.24.7: no goroutineleak profile and no leak-detection GC. |
| shortEN | `src/runtime/mgc.go` | `isMaybeRunnable` | Leak detection reports goroutines blocked on channel operations/select, sync.Mutex/RWMutex, sync.WaitGroup or sync.Cond whose primitive the GC finds unreachable. | 1.26.1, 1.27.3 | 1.24.7: no goroutineleak profile and no leak-detection GC. |
| shortEN | `src/runtime/mgc.go` | `isMaybeRunnable` | Other waits, for example I/O in the netpoller, are treated as maybe runnable and never reported as leaked. | 1.26.1, 1.27.3 | 1.24.7: no goroutineleak profile and no leak-detection GC. |
| shortEN | `src/runtime/pprof/pprof.go` | `writeGoroutine` | Leaks the profile cannot see remain visible as a growing stack group in the ordinary goroutine profile. | 1.24.7, 1.26.1, 1.27.3 | — |
| jvmEN | `src/runtime/runtime2.go` | `g.goid` | Goroutines have internal IDs (g.goid, printed in tracebacks) but no exported API returns them. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[0] | `src/runtime/chan.go` | `chansend` | A send into a channel with free buffer space completes without a receiver. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/runtime/pprof/pprof.go` | `writeGoroutine` | goroutine profile: debug=1 gives grouped text stacks, debug=2 a full stack dump with goroutine states. | 1.24.7, 1.26.1, 1.27.3 | — |
| detailsEN[2] | `src/internal/goexperiment/flags.go` | `Flags.GoroutineLeakProfile` | In Go 1.26 the goroutineleak profile is gated by GOEXPERIMENT=goroutineleakprofile. | 1.26.1 | 1.27.3: the experiment flag is removed (GOEXPERIMENT=goroutineleakprofile is “unknown”), the profile is always available; 1.24.7: absent. |
| detailsEN[2] | `src/net/http/pprof/pprof.go` | `profileDescriptions` | net/http/pprof lists and serves /debug/pprof/goroutineleak when the profile exists. | 1.26.1, 1.27.3 | 1.26.1: description added in init only with the experiment; 1.27.3: unconditional; 1.24.7: absent. |
| detailsEN[2] | `src/runtime/mgc.go` | `findGoroutineLeaks` | Goroutines blocked on primitives that no maybe-runnable goroutine can reach are marked _Gleaked and can never wake up. | 1.26.1, 1.27.3 | 1.27.3 additionally keeps the main goroutine blocked in select{} out of the report (1.26.1 reports it); 1.24.7: no goroutineleak profile and no leak-detection GC. |
| versionNote | `src/runtime/mgc.go` | `isMaybeRunnable` | A primitive reachable from a global variable is marked, so a goroutine blocked on it is not reported (leaks through globals can be missed). | 1.26.1, 1.27.3 | 1.24.7: no goroutineleak profile and no leak-detection GC. |
| code | `src/runtime/chan.go` | `chansend` | With make(chan error, 1) the single send completes even after the caller has returned. | 1.24.7, 1.26.1, 1.27.3 | — |

## sim2

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| steps[0].desc | `src/runtime/proc.go` | `findRunnable` | findRunnable checks GC, timers and other runtime work before ordinary queues; with schedtick % 61 == 0 and a non-empty GRQ it takes one G first; a GRQ batch only when the local queue is empty. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[0].board[0].lanes[2].note | `src/runtime/time.go` | `goroutineReady` | A fired time.Sleep timer readies the sleeping G via goready → ready(next=true), i.e. into runnext of the P that ran the timer. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[0].board[0].list | `src/runtime/proc.go` | `findRunnable` | Order: timers, GC worker, 61-tick GRQ G, runnext + runq, GRQ batch, netpoll(0), stealing (same in all three; the list title says only Go 1.26.1). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[0].board[0].list.items[4] | `src/runtime/proc.go` | `globrunqgetbatch` | GRQ batch: at most half the local queue (128) and the per-P share; the first runs, the rest go to runq. | 1.26.1, 1.27.3 | 1.24.7: same limits inside globrunqget(pp, 0); globrunqgetbatch exists since 1.25.0. |
| steps[1].desc | `src/runtime/proc.go` | `forcePreemptNS` | sysmon requests preemption when schedtick has not changed for 10 ms (forcePreemptNS). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[1].board[0].lanes[1].note | `src/runtime/proc.go` | `preemptone` | sysmon calls preemptone for P1, which sets gp.preempt and stackguard0 = stackPreempt for its current G. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[1].board[0].list.items[1] | `src/runtime/signal_unix.go` | `sigPreempt` | On supported Unix paths the request is delivered with SIGURG. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[2].board[0].lanes[1].note | `src/runtime/proc.go` | `goschedImpl` | Since Go 1.26 a preempted G is put into runnext of its P when a stop-the-world is pending (sched.gcwaiting); otherwise it goes to the GRQ. | 1.26.1, 1.27.3 | 1.24.7 (and 1.25.0): goschedImpl always puts the preempted G on the GRQ (globrunqput). |
| steps[2].board[0].list.items[0] | `src/runtime/proc.go` | `gopreempt_m` | Ordinary async preemption: asyncPreempt → gopreempt_m → goschedImpl → globrunqput. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[3].desc | `src/runtime/proc.go` | `runqgrab` | runqgrab computes n - n/2 = 3 and claims the head prefix with CAS; concurrent changes cause a retry. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[3].board[0].lanes[1].note | `src/runtime/proc.go` | `findRunnable` | An M starts spinning to steal only while 2*nmspinning < gomaxprocs - npidle (about half of the busy Ps). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[4].desc | `src/runtime/proc.go` | `runqsteal` | runqsteal returns the last element of the grabbed batch (C) and queues A and B on P2. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[5].desc | `src/runtime/proc.go` | `reentersyscall` | Old protocol (“Go 1.25”): ordinary syscall entry detaches M from P and marks P _Psyscall. | 1.24.7 | 1.24.7 (and 1.25.0): reentersyscall clears pp.m/m.p, stores m.oldp and sets P to _Psyscall; 1.26.1 and 1.27.3: M and P stay attached, only G goes to _Gsyscall and _Psyscall is renamed _Psyscall_unused. |
| steps[5].board[0].list.items[0] | `src/runtime/runtime2.go` | `m.oldp` | The M remembers its P in m.oldp across a syscall and tries to get it back first on exit. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[5].board[1].list.items[1] | `src/runtime/proc.go` | `setBlockOnExitSyscall` | New protocol (“Go 1.26.1”): P stays _Prunning, the syscall is seen from G’s _Gsyscall, retake runs setBlockOnExitSyscall → takeP → resume → handoffp. | 1.26.1, 1.27.3 | 1.24.7: absent; retake CASes the _Psyscall P to _Pidle. |
| steps[5].board[1].list.items[0] | `src/runtime/proc.go` | `stopTheWorldWithSema` | A stop-the-world can also detach the P from a G in a syscall (through setBlockOnExitSyscall). | 1.26.1, 1.27.3 | 1.24.7: stopTheWorldWithSema CASes _Psyscall Ps to _Pgcstop. |
| steps[5].board[1].list.items[2] | `src/runtime/runtime2.go` | `_Psyscall_unused` | _Psyscall_unused is the former state and is no longer used. | 1.26.1, 1.27.3 | 1.24.7: the live constant is _Psyscall. |
| steps[6].desc | `src/runtime/proc.go` | `exitsyscall` | Resuming user Go code after a syscall requires a P; without one G1 goes to the GRQ and M1 stops (stopm), or waits if locked. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[6].board[1].list.items[4] | `src/runtime/proc.go` | `checkmcount` | More than debug.SetMaxThreads (default 10,000, sched.maxmcount) threads crashes the program with “thread exhaustion”. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[7].board[1].lanes[1].note | `src/runtime/proc.go` | `injectglist` | Without a P (sysmon), injectglist puts the ready Gs on the GRQ and starts idle Ps. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[7].board[1].list.items[1] | `src/runtime/proc.go` | `findRunnable` | A thread with a P that polls in findRunnable runs the first ready G itself and injects the rest (local runq or GRQ). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[8].desc | `src/runtime/cgroup_linux.go` | `adjustCgroupGOMAXPROCS` | Default = min(affinity CPUs, max(ceil(quota/period), 2)): limit 2.5 on 16 CPUs gives 3; request does not count. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |
| steps[8].desc | `src/runtime/proc.go` | `sysmon` | sysmon rechecks the default at most once per second (lastgomaxprocs + 1e9), only when updatemaxprocs is on. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |
| steps[8].desc | `src/internal/godebugs/table.go` | `All` | The container-aware default needs go 1.25 or later in go.mod (containermaxprocs/updatemaxprocs Changed: 25). | 1.26.1, 1.27.3 | 1.24.7: settings absent. |
| steps[8].desc | `src/runtime/debug.go` | `GOMAXPROCS` | An explicit GOMAXPROCS (environment or runtime.GOMAXPROCS) disables automatic updates. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |
| steps[9].board[0].list.items[2] | `src/runtime/runtime2.go` | `p.runq` | Each P has a local run queue of up to 256 Gs. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[9].board[0].lanes[5].note | `src/runtime/proc.go` | `sysmon` | sysmon requests preemption of long runs, retakes Ps from long syscalls, polls the network and updates GOMAXPROCS at most once per second. | 1.26.1, 1.27.3 | 1.24.7: sysmon has no GOMAXPROCS update (the other three duties are the same). |
| steps[10].board[0].list.items[3] | `src/runtime/proc.go` | `preemptone` | Async preemption is skipped with GODEBUG=asyncpreemptoff=1 or when preemptMSupported is false (wasm, plan9). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[10].board[1].list.items[8] | `src/runtime/stack.go` | `stackMin` | A brand-new G gets a 2 KiB stack (malg(stackMin)); a reused G gets startingStackSize (adaptive, adaptivestackstart=1 by default). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[10].board[1].list.items[8] | `src/runtime/proc.go` | `gfget` | gfget reallocates a reused G’s stack at startingStackSize when its size differs. | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[10].board[1].list.items[4] | `src/runtime/proc.go` | `exitsyscall` | After a syscall the M first tries its old P, then any idle P; otherwise G goes to the GRQ and the M sleeps (or waits for its G when locked). | 1.24.7, 1.26.1, 1.27.3 | — |
| steps[10].board[1].list.items[9] | `src/runtime/cgroup_linux.go` | `adjustCgroupGOMAXPROCS` | GOMAXPROCS default = min(affinity CPUs, max(ceil(limit), 2)); requests are ignored. | 1.26.1, 1.27.3 | 1.24.7: no container-aware default (no cgroup_linux.go, no containermaxprocs/updatemaxprocs); GOMAXPROCS defaults to the affinity CPU count and is never updated automatically. |

## q9

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/runtime/chan.go` | `chansend` | A send on an unbuffered channel with no receiver parks the sender forever; a one-element buffer lets the single send complete (ran on 1.24.7 and 1.27.3). | 1.24.7, 1.26.1, 1.27.3 | — |
| explanationRU | `src/runtime/proc.go` | `gopark` | A channel wait parks the G; it does not hold an OS thread. | 1.24.7, 1.26.1, 1.27.3 | — |

## q10

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/net/http/request.go` | `Context` | For incoming server requests the context is canceled when the connection closes, the HTTP/2 request is canceled, or ServeHTTP returns (doc unchanged; httptest run on 1.24.7 and 1.27.3). | 1.24.7, 1.26.1, 1.27.3 | — |
| explanationRU | `src/context/context.go` | `WithoutCancel` | WithoutCancel keeps values, has no deadline, Err or cause, and its Done channel is nil (API since Go 1.21, api/go1.21.txt). | 1.24.7, 1.26.1, 1.27.3 | — |

## q16

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/context/context.go` | `Canceled` | After the derived context is canceled, ctx.Err() reports context.Canceled. | 1.24.7, 1.26.1, 1.27.3 | — |
| explanationRU | `src/cmd/compile/internal/types2/assignments.go` | `shortVarDecl` | g, ctx := in the function body redeclares the parameter ctx in the same block and assigns to it (no new shadowing variable). | 1.24.7, 1.26.1, 1.27.3 | — |

## q17

| Поле | Исходник | Символ | Факт | Проверено | Различия |
|---|---|---|---|---|---|
| explanationRU | `src/cmd/compile/internal/walk/order.go` | `stmt` | In a select, every send value is evaluated into a temporary before a case is chosen (program prints “cancelled” and 1 on 1.24.7 and 1.27.3). | 1.24.7, 1.26.1, 1.27.3 | — |
| explanationRU | `src/cmd/compile/internal/walk/select.go` | `walkSelectCases` | Zero-case, one-case and default selects are lowered without selectgo, with the same evaluation order. | 1.24.7, 1.26.1, 1.27.3 | — |
