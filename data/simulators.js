const SIM1_DATA = [
  {
    title: "Шаг 1: go doWork() → newproc1 на стеке g0",
    desc: "Горутина G1 вызывает go doWork(). Управление через systemstack переключается на 8 КБ системный стек потока g0. На стеке g0 из пула P.gFree берётся структура G2 со стеком 2 КБ в хипе.",
    r14: "g0 (системная горутина)", rsp: "0x7fff_8000 (стек g0)", rip: "runtime.newproc1",
    runnext: "G_old (предыдущая)", runq: "[ G3, G4 ] (2 шт.)", gfree: "Извлечена G2",
    gstatus: "_Gdead → _Grunnable", gobuf: "Инициализация...", bottom: "Запись runtime.goexit"
  },
  {
    title: "Шаг 2: Подготовка gobuf и трюка с goexit",
    desc: "На самое дно 2 КБ стека G2 (0xc000_17f0) записывается фейковый адрес возврата runtime.goexit. В структуру G2.sched (gobuf) сохраняются будущий RSP (0xc000_17f0) и будущий RIP (адрес функции doWork).",
    r14: "g0 (системная горутина)", rsp: "0x7fff_8000 (стек g0)", rip: "runtime.newproc1",
    runnext: "G_old", runq: "[ G3, G4 ]", gfree: "Пуст",
    gstatus: "_Grunnable", gobuf: "{sp: 0xc00017f0, pc: doWork}", bottom: "*0xc00017f0 = &runtime.goexit"
  },
  {
    title: "Шаг 3: Постановка в LIFO-слот P.runnext (CAS)",
    desc: "Вызывается runqput(P, G2, true). Атомарный CAS ставит свежую G2 в приоритетный LIFO-слот P.runnext (ради горячего кеша L1/L2 ядра), а вытесненная G_old уходит в хвост FIFO-очереди P.runq[256].",
    r14: "g0 (системная горутина)", rsp: "0x7fff_8000 (стек g0)", rip: "runtime.runqput",
    runnext: "G2 (приоритет L1 cache!)", runq: "[ G3, G4, G_old ]", gfree: "Пуст",
    gstatus: "_Grunnable", gobuf: "{sp: 0xc00017f0, pc: doWork}", bottom: "&runtime.goexit"
  },
  {
    title: "Шаг 4: Ассемблерный прыжок runtime.gogo (Подмена регистров)",
    desc: "Планировщик вызывает schedule() → execute(G2) → runtime.gogo(&G2.sched). За 4 инструкции ассемблера в R14 загружается &G2, в RSP загружается адрес 2 КБ буфера в куче (0xc000_17f0), а JMP перебрасывает RIP в код doWork!",
    r14: "G2 (0xc000_0400)", rsp: "0xc000_17f0 (2 КБ стек в хипе!)", rip: "main.doWork (ваш код)",
    runnext: "Пусто (0)", runq: "[ G3, G4, G_old ]", gfree: "Пуст",
    gstatus: "_Grunning", gobuf: "Очищен (в регистрах CPU)", bottom: "&runtime.goexit"
  },
  {
    title: "Шаг 5: Завершение функции RET → goexit → mcall на g0",
    desc: "Функция doWork выполняет инструкцию RET. Процессор снимает со дна стека подложенный адрес runtime.goexit! Вызывается mcall(goexit0): RSP возвращается на стек g0, а G2 со своим 2 КБ стеком кладётся обратно в пул P.gFree.",
    r14: "g0 (возврат в планировщик)", rsp: "0x7fff_8000 (стек g0)", rip: "runtime.goexit0 → schedule()",
    runnext: "Пусто (0)", runq: "[ G3, G4, G_old ]", gfree: "G2 возвращена в пул!",
    gstatus: "_Gdead (в пуле gFree)", gobuf: "Сброшен", bottom: "Готов к переиспользованию"
  }
];

const SIM2_DATA = [
  {
    title: "Шаг 1: G1 читает из пустого канала (Упаковка в sudog)",
    desc: "G1 выполняет x := <-ch. Захватывается hchan.lock. Так как канал пуст, G1 берёт из кеша процессора структуру sudog, записывает в sudog.elem прямой адрес своей стековой переменной &x (0x17e0) и ставит sudog в очередь hchan.recvq.",
    g1state: "_Grunning (захватила лок)", g1var: "x = 0 (ждёт по адресу 0x17e0)", seldone: "0 (свободна)",
    lock: "ЗАХВАЧЕН (горутиной G1)", recvq: "[ sudog(G1, elem=0x17e0) ]", buf: "Пуст (qcount = 0)",
    g2action: "Ещё не подошла", copy: "Нет", runnext: "Пусто"
  },
  {
    title: "Шаг 2: Безопасная парковка gopark(chanparkcommit) на стеке g0",
    desc: "Чтобы другой поток не разбудил G1 до сохранения её регистров, G1 вызывает gopark: сначала через mcall(park_m) сохраняет RSP/RIP в G1.sched и переходит на стек g0, и ТОЛЬКО на стеке g0 вызывает chanparkcommit, отпуская hchan.lock!",
    g1state: "_Gwaiting (запаркована)", g1var: "x = 0 [адрес 0x17e0 в sudog]", seldone: "0 (ожидает CAS)",
    lock: "СВОБОДЕН (отпущен на g0!)", recvq: "[ sudog(G1, elem=0x17e0) ]", buf: "Пуст",
    g2action: "Подходит к каналу ch <- 42", copy: "Ожидание писателя", runnext: "Поток M1 взял другую задачу"
  },
  {
    title: "Шаг 3: Гонка в select (CAS по G1.selectDone) и sendDirect",
    desc: "Писатель G2 выполняет ch <- 42, захватывает hchan.lock и достаёт sudog из recvq. Выигрывает атомарный G1.selectDone.CompareAndSwap(0, 1) и вызывает sendDirect: memmove копирует число 42 НАПРЯМУЮ из стека G2 в стек спящей G1 (по адресу 0x17e0) в обход буфера!",
    g1state: "_Gwaiting (в стек пишут!)", g1var: "x = 42 (скопировано напрямую!)", seldone: "1 (CAS выигран писателем G2!)",
    lock: "ЗАХВАЧЕН (писателем G2)", recvq: "Пуста (sudog извлечён)", buf: "Обойдён (не использовался!)",
    g2action: "Выполняет sendDirect (memmove)", copy: "Стек G2 → Стек G1 (0x17e0)", runnext: "Пусто"
  },
  {
    title: "Шаг 4: Пробуждение goready(G1) и постановка в P.runnext",
    desc: "Писатель G2 отпускает hchan.lock и вызывает goready(G1). Статус G1 меняется на _Grunnable, и она помещается в приоритетный LIFO-слот P.runnext. Если это был select, проснувшаяся G1 по списку lockorder удаляет свои лишние sudog из остальных каналов.",
    g1state: "_Grunnable (разбужена!)", g1var: "x = 42 (готова к работе)", seldone: "Сброшен в 0 после пробуждения",
    lock: "СВОБОДЕН", recvq: "Пуста", buf: "Пуст",
    g2action: "Продолжает работу", copy: "Завершено (0 аллокаций)", runnext: "G1 (запустится следующей!)"
  }
];

const SIM3_DATA = [
  {
    title: "Фаза 1: Escape Analysis (Компиляция) и Mark Setup (STW #1)",
    desc: "На этапе компиляции переменные без возврата указателя наверх (Sharing Down) остались на стеке. В хипе вырос объём памяти (GOGC=100). Короткая пауза Stop-The-World #1 (~20 мкс) включает Hybrid Write Barrier. Все объекты в куче пока Белые.",
    phase: "1. Mark Setup (STW #1)", wb: "ВКЛЮЧЁН (перехватывает *slot = ptr)", roots: "Готовы к сканированию",
    white: "Объекты A, B, C, D, E (все)", grey: "Пусто", black: "Пусто"
  },
  {
    title: "Фаза 2: Сканирование корней (Roots → Grey)",
    desc: "Мир снова запущен! Горутины работают параллельно с GC. Сборщик мусора сканирует корни (стеки горутин и глобальные переменные) и красит все объекты хипа, на которые есть прямые ссылки из стеков (A и B), в Серый цвет.",
    phase: "2. Concurrent Mark (Старт)", wb: "АКТИВЕН", roots: "Стек указывает на A и B",
    white: "C, D, E (непосещённые)", grey: "A, B (в очереди на обход)", black: "Пусто"
  },
  {
    title: "Фаза 3: Конкурентная разметка и срабатывание Write Barrier",
    desc: "Воркеры GC (25% CPU) берут Серые A и B, красят их в Чёрный, а их детей (C и D) — в Серый. В этот момент горутина перекидывает ссылку на объект D: срабатывает Hybrid Write Barrier и удерживает D в Сером цвете, не давая GC потерять живой объект!",
    phase: "2. Concurrent Mark + Write Barrier", wb: "СРАБОТАЛ: затенил изменённый указатель в Серый", roots: "Просканированы",
    white: "E (недостижимый мусор)", grey: "C, D (проверяются дочерние ссылки)", black: "A, B (полностью проверены)"
  },
  {
    title: "Фаза 4: Mark Termination (STW #2) и Concurrent Sweep",
    desc: "Серых объектов больше не осталось! Короткая пауза STW #2 выключает Write Barrier. Все живые объекты (A, B, C, D) стали Чёрными. Оставшийся Белым объект E фоново очищается на этапе Concurrent Sweep (возвращается в mspan без дефрагментации).",
    phase: "3 & 4. Mark Termination → Sweep", wb: "ВЫКЛЮЧЕН", roots: "Чисты",
    white: "Объект E → ОСВОБОЖДЁН в mspan!", grey: "Пусто (0)", black: "A, B, C, D (сохранены, станут Белыми к следующему циклу)"
  }
];

const CHEATSHEET_ROWS = [
  {
    topic: "1. Горутина и Стек",
    how: "<code>go fn()</code> → <code>runtime.newproc</code> на стеке <code>g0</code>. Структура <code>runtime.g</code> + стек в хипе. На дно стека кладётся адрес возврата <code>runtime.goexit</code>.",
    markers: "Стек от <strong>2 КБ</strong> до <strong>1 ГБ</strong>. В коде нет ID/handle. Уменьшается в 2 раза при загрузке &lt; 25%.",
    cardId: "c1", simId: "sim1"
  },
  {
    topic: "2. Регистры и Переключение",
    how: "Контекст хранится в <code>g.sched</code> (<code>gobuf</code>). <code>runtime.gogo</code> грузит <code>&G</code> в <code>R14</code>, стек в <code>RSP</code> и делает <code>JMP</code> в <code>RIP</code>. Обратно на <code>g0</code> — через <code>mcall</code>.",
    markers: "Занимает <strong>~10–20 нс</strong> в user space (против 1–2 мкс у потоков ОС).",
    cardId: "c4", simId: "sim1"
  },
  {
    topic: "3. Расширение стека",
    how: "Пролог функции сравнивает <code>RSP</code> с <code>g.stackguard0</code> → <code>morestack</code> (на <code>g0</code>) → <code>copystack</code> → <code>adjustpointers</code>.",
    markers: "Удвоение <strong>2x</strong> в хипе. Внутренние указатели сдвигаются на <code>Δ = new.hi - old.hi</code> по битовой карте стека.",
    cardId: "c3", simId: "sim1"
  },
  {
    topic: "4. Планировщик GMP и runnext",
    how: "Мультиплексирование M:N. У каждого <code>P</code> (<code>GOMAXPROCS</code>) есть <code>LRQ[256]</code> и приоритетный 1-слотовый LIFO <code>runnext</code>.",
    markers: "<code>runnext</code> держит данные в горячем <strong>L1/L2 кеше CPU</strong>. Каждый <strong>61-й тик</strong> проверяется <code>GRQ</code>.",
    cardId: "c6", simId: "sim1"
  },
  {
    topic: "5. Вытеснение и Work Stealing",
    how: "Гибридное: кооперативное (<code>stackPreempt</code>) + асинхронное через поток <code>sysmon</code>. Пустой <code>P</code> крадёт задачи через <code>runqgrab</code>.",
    markers: "Квота <strong>10 мс</strong> → сигнал <strong><code>SIGURG</code></strong> → отправка в <code>GRQ</code>. Крадётся ровно <strong>50%</strong> чужой <code>LRQ</code> через <code>CAS</code>.",
    cardId: "c7", simId: null
  },
  {
    topic: "6. Канал (hchan) и sendDirect",
    how: "<code>*runtime.hchan</code> в хипе: кольцевой <code>buf</code>, очереди <code>sendq</code>/<code>recvq</code> из <code>sudog</code> и мьютекс <code>lock</code>. Парковка через <code>gopark(chanparkcommit)</code>.",
    markers: "Если ждёт читатель — прямое копирование <strong>из стека в стек</strong> (<code>sendDirect</code> + <code>typeBitsBulkBarrier</code>) в обход буфера.",
    cardId: "c10", simId: "sim2"
  },
  {
    topic: "7. Оператор select",
    how: "<code>runtime.selectgo</code>: массивы <code>pollorder</code> и <code>lockorder</code> на стеке. Подписка через цепочку <code>g.waiting</code> из <code>sudog</code>.",
    markers: "<code>pollorder</code> (Фишер—Йетс против голодания), <code>lockorder</code> (сортировка адресов <code>*hchan</code> против AB-BA дедлока), гонка пробуждений через <code>g.selectDone.CompareAndSwap(0, 1)</code>.",
    cardId: "c11", simId: "sim2"
  },
  {
    topic: "8. Атомики и CAS",
    how: "Интринсик компилятора → ассемблер <code>LOCK CMPXCHGL</code> (на amd64).",
    markers: "Блокирует <strong>64-байтную кэш-линию L1/L2</strong> по протоколу <strong>MESI</strong> и сбрасывает Store Buffer.",
    cardId: "c12", simId: "sim2"
  },
  {
    topic: "9. Escape Analysis и GC",
    how: "<code>-gcflags=\"-m\"</code> (Sharing Down = стек, Sharing Up = хип). Конкурентный <strong>трёхцветный Mark-and-Sweep GC</strong> с <strong>Hybrid Write Barrier</strong>.",
    markers: "2 паузы STW (&lt;100 мкс), до 25% CPU на разметку, управляется <strong><code>GOGC=100</code></strong> и <strong><code>GOMEMLIMIT</code></strong>.",
    cardId: "c14", simId: "sim3"
  }
];
