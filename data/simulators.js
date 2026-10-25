const SIMULATORS = [
  // =========================================================================
  // ДИАГРАММА 1: РОЖДЕНИЕ ГОРУТИНЫ, СЛОТ RUNNEXT И РЕГИСТРЫ CPU (GOGO)
  // =========================================================================
  {
    id: "sim1",
    title: "Диаграмма 1: От go fn() до регистров CPU (newproc → P.runnext → runtime.gogo)",
    subtitle: "Как создаётся горутина на системном стеке g0, зачем нужен 1-слотовый LIFO runnext и как подменяются регистры R14, RSP и RIP.",
    cardId: "c6",
    cardLabel: "Карточка Q6 (g0 & gogo) →",
    steps: [
      {
        title: "1. go doWork() → newproc1 на стеке g0",
        desc: "Горутина G1 вызывает go doWork(). Через systemstack управление переключается на 8 КБ системный стек потока g0. На стеке g0 из локального пула P.gFree берётся структура G2 со стеком 2 КБ в хипе.",
        boxes: [
          {
            title: "Регистры ядра CPU (Поток M)",
            rows: [
              { k: "R14 (curg):", v: "g0 (системная горутина)", hl: true },
              { k: "RSP (Stack Ptr):", v: "0x7fff_8000 (стек g0)", hl: true },
              { k: "RIP (Instr Ptr):", v: "runtime.newproc1", hl: false }
            ]
          },
          {
            title: "Очереди процессора P",
            rows: [
              { k: "P.runnext (LIFO 1):", v: "G_old (предыдущая)", hl: false },
              { k: "P.runq[256] (FIFO):", v: "[ G3, G4 ] (2 шт.)", hl: false },
              { k: "P.gFree (Пул G):", v: "Взята свободная G2", hl: true }
            ]
          },
          {
            title: "Стек горутины G2 в хипе (2 КБ)",
            rows: [
              { k: "G2.atomicstatus:", v: "_Gdead → _Grunnable", hl: true },
              { k: "G2.sched (gobuf):", v: "Инициализация...", hl: false },
              { k: "Дно стека [0x17f0]:", v: "Подготовка кадра", hl: false }
            ]
          }
        ]
      },
      {
        title: "2. Сборка gobuf и трюк с goexit",
        desc: "На самое дно 2 КБ стека G2 (0xc000_17f0) записывается фейковый адрес возврата runtime.goexit. В структуру G2.sched (gobuf) сохраняются будущий RSP (0xc000_17f0) и будущий RIP (адрес функции doWork).",
        boxes: [
          {
            title: "Регистры ядра CPU (Поток M)",
            rows: [
              { k: "R14 (curg):", v: "g0", hl: false },
              { k: "RSP (Stack Ptr):", v: "0x7fff_8000 (стек g0)", hl: false },
              { k: "RIP (Instr Ptr):", v: "runtime.newproc1", hl: false }
            ]
          },
          {
            title: "Очереди процессора P",
            rows: [
              { k: "P.runnext (LIFO 1):", v: "G_old", hl: false },
              { k: "P.runq[256] (FIFO):", v: "[ G3, G4 ]", hl: false },
              { k: "P.gFree (Пул G):", v: "Пуст", hl: false }
            ]
          },
          {
            title: "Стек горутины G2 в хипе (2 КБ)",
            rows: [
              { k: "G2.atomicstatus:", v: "_Grunnable", hl: false },
              { k: "G2.sched (gobuf):", v: "{sp: 0xc00017f0, pc: doWork}", hl: true },
              { k: "Дно стека [0x17f0]:", v: "*0xc00017f0 = &runtime.goexit", hl: true }
            ]
          }
        ]
      },
      {
        title: "3. Вытеснение в LIFO-слот P.runnext",
        desc: "Вызывается runqput(P, G2, true). Атомарный CAS ставит свежую G2 в приоритетный LIFO-слот P.runnext (ради горячего кеша L1/L2 ядра), а вытесненная G_old уходит в хвост FIFO-очереди P.runq[256].",
        boxes: [
          {
            title: "Регистры ядра CPU (Поток M)",
            rows: [
              { k: "R14 (curg):", v: "g0", hl: false },
              { k: "RSP (Stack Ptr):", v: "0x7fff_8000 (стек g0)", hl: false },
              { k: "RIP (Instr Ptr):", v: "runtime.runqput", hl: false }
            ]
          },
          {
            title: "Очереди процессора P",
            rows: [
              { k: "P.runnext (LIFO 1):", v: "G2 (приоритет L1 cache!)", hl: true },
              { k: "P.runq[256] (FIFO):", v: "[ G3, G4, G_old ]", hl: true },
              { k: "P.gFree (Пул G):", v: "Пуст", hl: false }
            ]
          },
          {
            title: "Стек горутины G2 в хипе (2 КБ)",
            rows: [
              { k: "G2.atomicstatus:", v: "_Grunnable (первая на старт)", hl: false },
              { k: "G2.sched (gobuf):", v: "{sp: 0xc00017f0, pc: doWork}", hl: false },
              { k: "Дно стека [0x17f0]:", v: "&runtime.goexit", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Ассемблер runtime.gogo (Подмена RSP/RIP)",
        desc: "Планировщик вызывает schedule() → execute(G2) → runtime.gogo(&G2.sched). За 4 инструкции ассемблера в R14 загружается &G2, в RSP загружается адрес 2 КБ буфера в куче (0xc000_17f0), а JMP перебрасывает RIP в код doWork!",
        boxes: [
          {
            title: "Регистры ядра CPU (Поток M)",
            rows: [
              { k: "R14 (curg):", v: "G2 (0xc000_0400)", hl: true },
              { k: "RSP (Stack Ptr):", v: "0xc000_17f0 (2 КБ стек в хипе!)", hl: true },
              { k: "RIP (Instr Ptr):", v: "main.doWork (ваш код!)", hl: true }
            ]
          },
          {
            title: "Очереди процессора P",
            rows: [
              { k: "P.runnext (LIFO 1):", v: "Пусто (G2 забрана на ядро)", hl: false },
              { k: "P.runq[256] (FIFO):", v: "[ G3, G4, G_old ]", hl: false },
              { k: "P.schedtick:", v: "Увеличен на +1", hl: false }
            ]
          },
          {
            title: "Стек горутины G2 в хипе (2 КБ)",
            rows: [
              { k: "G2.atomicstatus:", v: "_Grunning", hl: true },
              { k: "G2.sched (gobuf):", v: "Очищен (живёт в регистрах CPU)", hl: false },
              { k: "Дно стека [0x17f0]:", v: "&runtime.goexit", hl: false }
            ]
          }
        ]
      },
      {
        title: "5. Выход RET → goexit → mcall обратно на g0",
        desc: "Функция doWork завершается инструкцией RET. Процессор снимает со дна стека подложенный адрес runtime.goexit! Вызывается mcall(goexit0): RSP возвращается на стек g0, а G2 со своим 2 КБ стеком кладётся обратно в пул P.gFree.",
        boxes: [
          {
            title: "Регистры ядра CPU (Поток M)",
            rows: [
              { k: "R14 (curg):", v: "g0 (возврат в планировщик)", hl: true },
              { k: "RSP (Stack Ptr):", v: "0x7fff_8000 (стек g0)", hl: true },
              { k: "RIP (Instr Ptr):", v: "runtime.goexit0 → schedule()", hl: false }
            ]
          },
          {
            title: "Очереди процессора P",
            rows: [
              { k: "P.runnext (LIFO 1):", v: "Пусто", hl: false },
              { k: "P.runq[256] (FIFO):", v: "Берём следующую G3...", hl: false },
              { k: "P.gFree (Пул G):", v: "G2 возвращена в пул (0 аллокаций!)", hl: true }
            ]
          },
          {
            title: "Стек горутины G2 в хипе (2 КБ)",
            rows: [
              { k: "G2.atomicstatus:", v: "_Gdead", hl: true },
              { k: "G2.sched (gobuf):", v: "Сброшен", hl: false },
              { k: "Дно стека [0x17f0]:", v: "Готов к переиспользованию", hl: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 2: ПЛАНИРОВЩИК GMP, ВЫТЕСНЕНИЕ (SYSMON) И WORK STEALING
  // =========================================================================
  {
    id: "sim2",
    title: "Диаграмма 2: Планировщик GMP, вытеснение (sysmon / SIGURG), Work Stealing и Syscall Handoff",
    subtitle: "Правило каждого 61-го тика, асинхронное вытеснение через 10 мс, кража 50% очереди у соседнего процессора P и отсоединение P при системном вызове.",
    cardId: "c9",
    cardLabel: "Карточка Q9 (Work Stealing) →",
    steps: [
      {
        title: "1. Опрос очередей и правило 61-го тика",
        desc: "Процессор P1 выполняет G1 (в его очереди LRQ лежат ещё 6 горутин: G2–G7). Чтобы локальные горутины не заморили голодом глобальную очередь GRQ, ровно на каждый 61-й тик (schedtick % 61 == 0) процессор обязан сначала взять задачу из GRQ.",
        boxes: [
          {
            title: "Процессор P1 (Поток M1)",
            rows: [
              { k: "На ядре (M1.curg):", v: "G1 (_Grunning)", hl: false },
              { k: "P1.runq (LRQ):", v: "[ G2, G3, G4, G5, G6, G7 ] (6 шт.)", hl: false },
              { k: "P1.schedtick:", v: "61 → Проверка GRQ первой!", hl: true }
            ]
          },
          {
            title: "Глобальные ресурсы рантайма",
            rows: [
              { k: "Глобальная GRQ:", v: "[ G9 ] (защищена мьютексом)", hl: true },
              { k: "netpoller (epoll):", v: "0 готовых событий", hl: false },
              { k: "Фоновый sysmon:", v: "Сканирует время работы G", hl: false }
            ]
          },
          {
            title: "Процессор P2 (Поток M2)",
            rows: [
              { k: "На ядре (M2.curg):", v: "G8 (завершается)", hl: false },
              { k: "P2.runq (LRQ):", v: "Пусто (0 горутин)", hl: false },
              { k: "Статус P2:", v: "_Prunning", hl: false }
            ]
          }
        ]
      },
      {
        title: "2. Асинхронное вытеснение (sysmon + SIGURG)",
        desc: "Горутина G1 на P1 крутит тяжёлый цикл for {} дольше 10 мс без вызовов функций. Фоновый поток sysmon (живёт без P) замечает превышение квоты 10 мс и посылает потоку M1 сигнал ОС SIGURG. G1 снимается с ядра и отправляется в глобальную очередь GRQ!",
        boxes: [
          {
            title: "Процессор P1 (Поток M1)",
            rows: [
              { k: "Сигнал ядра:", v: "Получен SIGURG → asyncPreempt!", hl: true },
              { k: "На ядре (M1.curg):", v: "Переключён на G2 из LRQ", hl: true },
              { k: "P1.runq (LRQ):", v: "[ G3, G4, G5, G6, G7, G_new ] (6 шт.)", hl: false }
            ]
          },
          {
            title: "Глобальные ресурсы рантайма",
            rows: [
              { k: "Глобальная GRQ:", v: "[ G1 (вытеснена!) ]", hl: true },
              { k: "netpoller (epoll):", v: "Пусто", hl: false },
              { k: "Фоновый sysmon:", v: "Отправил SIGURG потоку M1 (>10ms)", hl: true }
            ]
          },
          {
            title: "Процессор P2 (Поток M2)",
            rows: [
              { k: "На ядре (M2.curg):", v: "Пусто (ищет работу в findrunnable)", hl: false },
              { k: "P2.runq (LRQ):", v: "Пусто (0 горутин)", hl: false },
              { k: "Статус P2:", v: "Поиск задач...", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Кража задач (Work Stealing — 50% очереди)",
        desc: "Процессор P2 остался без работы: проверил свою LRQ, проверил GRQ и netpoller — везде пусто. P2 выбирает случайного соседа (P1, у которого 6 горутин) и через lock-free CAS (runqgrab) атомарно крадёт РОВНО ПОЛОВИНУ его очереди (3 горутины)!",
        boxes: [
          {
            title: "Процессор P1 (Жертва кражи)",
            rows: [
              { k: "На ядре (M1.curg):", v: "G2 (_Grunning)", hl: false },
              { k: "P1.runq (LRQ):", v: "[ G3, G4, G5 ] (осталось 3 из 6)", hl: true },
              { k: "Синхронизация:", v: "CAS по индексу P1.runqhead", hl: false }
            ]
          },
          {
            title: "Механизм кражи (runqsteal)",
            rows: [
              { k: "Украдено у P1:", v: "3 горутины (50% хвоста LRQ)", hl: true },
              { k: "Блокировки:", v: "0 мьютексов (Lock-Free CAS!)", hl: true },
              { k: "Фоновый sysmon:", v: "Нагрузка сбалансирована", hl: false }
            ]
          },
          {
            title: "Процессор P2 (Вор — снова в работе)",
            rows: [
              { k: "На ядре (M2.curg):", v: "Запустил украденную G6!", hl: true },
              { k: "P2.runq (LRQ):", v: "[ G7, G_new ] (ещё 2 в очереди)", hl: true },
              { k: "Статус P2:", v: "_Prunning", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Блокирующий Syscall (Handoff _Psyscall) против netpoller",
        desc: "Горутина G2 на потоке M1 делает блокирующий системный вызов (или Cgo). Поток M1 застревает в ядре ОС! Чтобы очередь P1 не простаивала, P1 переводится в _Psyscall, отвязывается от M1 и передаётся свободному потоку M3 (Handoff).",
        boxes: [
          {
            title: "Поток M1 (Заблокирован в ядре ОС)",
            rows: [
              { k: "Горутина G2:", v: "_Gsyscall (ждёт диск / Cgo)", hl: true },
              { k: "Связь с P1:", v: "ОТВЯЗАН (M1 блокирован без P)", hl: true },
              { k: "При выходе:", v: "Вернёт G2 на свободный P или в GRQ", hl: false }
            ]
          },
          {
            title: "Передача процессора P1 (Handoff)",
            rows: [
              { k: "Статус P1:", v: "_Psyscall → захвачен потоком M3!", hl: true },
              { k: "Поток M3 + P1:", v: "Продолжает выполнять [ G3, G4, G5 ]", hl: true },
              { k: "Сетевой I/O (G8):", v: "Ждёт в netpoller (_Gwaiting) без потери M!", hl: false }
            ]
          },
          {
            title: "Процессор P2 (Поток M2)",
            rows: [
              { k: "На ядре (M2.curg):", v: "Работает штатно", hl: false },
              { k: "Лимит потоков M:", v: "До 10 000 потоков ОС (SetMaxThreads)", hl: false },
              { k: "Статус P2:", v: "_Prunning", hl: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 3: КАНАЛЫ (HCHAN), SUDOG, GOPARK И ПРЯМОЕ КОПИРОВАНИЕ SENDDIRECT
  // =========================================================================
  {
    id: "sim3",
    title: "Диаграмма 3: Каналы (hchan), парковка sudog на g0 и прямое копирование между стеками (sendDirect)",
    subtitle: "Почему горутина оборачивается в sudog, зачем gopark отпускает мьютекс канала только на стеке g0 и как писатель копирует байты прямо в стек читателя.",
    cardId: "c17",
    cardLabel: "Карточка Q17 (sendDirect) →",
    steps: [
      {
        title: "1. Читатель G1 вызывает x := <-ch (Упаковка в sudog)",
        desc: "Горутина G1 захватывает мьютекс канала hchan.lock. Буфер пуст, писателей нет. G1 берёт из кеша P структуру sudog, записывает в sudog.elem прямой адрес своей стековой переменной &x (0x17e0) и кладёт sudog в очередь hchan.recvq.",
        boxes: [
          {
            title: "Читатель G1 (Стек 0xc000_1000)",
            rows: [
              { k: "Статус G1:", v: "_Grunning (держит hchan.lock)", hl: false },
              { k: "Переменная x [0x17e0]:", v: "x = 0 (адрес передан в sudog.elem)", hl: true },
              { k: "G1.activeStackChans:", v: "true (запрет GC двигать стек!)", hl: true }
            ]
          },
          {
            title: "Канал runtime.hchan (в хипе)",
            rows: [
              { k: "hchan.lock (futex):", v: "ЗАХВАЧЕН (горутиной G1)", hl: true },
              { k: "hchan.recvq (*sudog):", v: "[ sudog{g: G1, elem: 0x17e0} ]", hl: true },
              { k: "Кольцевой буфер buf:", v: "Пуст (qcount = 0)", hl: false }
            ]
          },
          {
            title: "Писатель G2 и Процессор P",
            rows: [
              { k: "Писатель G2:", v: "Ещё не подошёл к каналу", hl: false },
              { k: "Копирование памяти:", v: "Нет", hl: false },
              { k: "Слот P.runnext:", v: "Пусто", hl: false }
            ]
          }
        ]
      },
      {
        title: "2. Безопасная парковка gopark(chanparkcommit) на стеке g0",
        desc: "Чтобы другой поток не разбудил G1 до того, как она сохранит свои регистры RSP/RIP, G1 вызывает gopark: сначала через mcall(park_m) переходит на системный стек g0, меняет статус на _Gwaiting, и ТОЛЬКО на стеке g0 вызывает chanparkcommit, отпуская hchan.lock!",
        boxes: [
          {
            title: "Читатель G1 (Запаркована)",
            rows: [
              { k: "Статус G1:", v: "_Gwaiting (снята с потока M)", hl: true },
              { k: "G1.sched (gobuf):", v: "RSP и RIP безопасно сохранены", hl: true },
              { k: "Переменная x [0x17e0]:", v: "Ждёт записи в спящем стеке", hl: false }
            ]
          },
          {
            title: "Канал runtime.hchan (в хипе)",
            rows: [
              { k: "hchan.lock (futex):", v: "СВОБОДЕН (отпущен со стека g0!)", hl: true },
              { k: "hchan.recvq (*sudog):", v: "[ sudog{g: G1, elem: 0x17e0} ]", hl: false },
              { k: "Кольцевой буфер buf:", v: "Пуст", hl: false }
            ]
          },
          {
            title: "Писатель G2 и Процессор P",
            rows: [
              { k: "Поток M1:", v: "Ушёл выполнять другую горутину", hl: false },
              { k: "Писатель G2:", v: "Выполняет ch <- 42", hl: true },
              { k: "Слот P.runnext:", v: "Пусто", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Прямое копирование из стека в стек (sendDirect)",
        desc: "Писатель G2 захватывает hchan.lock, видит спящий sudog в recvq и вызывает sendDirect! Срабатывает барьер записи GC (typeBitsBulkBarrier), и memmove копирует число 42 напрямую из стека G2 по адресу sudog.elem (0x17e0) прямо в стек спящей G1 в обход буфера канала!",
        boxes: [
          {
            title: "Читатель G1 (Стек 0xc000_1000)",
            rows: [
              { k: "Статус G1:", v: "_Gwaiting (в её стек пишет G2!)", hl: false },
              { k: "Переменная x [0x17e0]:", v: "x = 42 (скопировано напрямую!)", hl: true },
              { k: "Барьер GC:", v: "typeBitsBulkBarrier выполнен", hl: true }
            ]
          },
          {
            title: "Канал runtime.hchan (в хипе)",
            rows: [
              { k: "hchan.lock (futex):", v: "ЗАХВАЧЕН (писателем G2)", hl: false },
              { k: "hchan.recvq (*sudog):", v: "Пусто (sudog извлечён)", hl: true },
              { k: "Кольцевой буфер buf:", v: "ОБОЙДЁН (0 лишних копирований!)", hl: true }
            ]
          },
          {
            title: "Писатель G2 (Стек 0xc000_2000)",
            rows: [
              { k: "Действие G2:", v: "sendDirect(sg.elem, &val, 8)", hl: true },
              { k: "Траектория memmove:", v: "Стек G2 [0x27e0] → Стек G1 [0x17e0]", hl: true },
              { k: "Слот P.runnext:", v: "Готовится принять G1", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Пробуждение goready(G1) в приоритетный слот P.runnext",
        desc: "Писатель G2 отпускает hchan.lock и вызывает goready(G1). На стеке g0 статус G1 меняется с _Gwaiting на _Grunnable, и она помещается в приоритетный LIFO-слот P.runnext, чтобы запуститься следующей с горячим кешем L1!",
        boxes: [
          {
            title: "Читатель G1 (Разбужена)",
            rows: [
              { k: "Статус G1:", v: "_Grunnable (готова к запуску!)", hl: true },
              { k: "Переменная x [0x17e0]:", v: "x = 42 (уже в кеше L1 ядра)", hl: true },
              { k: "sudog:", v: "Возвращён в кеш P.sudogcache", hl: false }
            ]
          },
          {
            title: "Канал runtime.hchan (в хипе)",
            rows: [
              { k: "hchan.lock (futex):", v: "СВОБОДЕН", hl: false },
              { k: "hchan.recvq (*sudog):", v: "Пусто", hl: false },
              { k: "Кольцевой буфер buf:", v: "Пуст", hl: false }
            ]
          },
          {
            title: "Писатель G2 и Процессор P",
            rows: [
              { k: "Писатель G2:", v: "Продолжает работу без блокировки", hl: false },
              { k: "Вызов рантайма:", v: "goready(G1) → runqput(P, G1, true)", hl: true },
              { k: "Слот P.runnext:", v: "G1 (встала первой в очередь!)", hl: true }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 4: ОПЕРАТОР SELECT ПОД КАПОТОМ (POLLORDER, LOCKORDER, SELECTDONE)
  // =========================================================================
  {
    id: "sim4",
    title: "Диаграмма 4: Оператор select под капотом (pollorder, lockorder и атомарная гонка g.selectDone)",
    subtitle: "Как runtime.selectgo избегает голодания каналов, предотвращает AB-BA дедлок мьютексов и разрешает одновременное пробуждение на разных ядрах.",
    cardId: "c19",
    cardLabel: "Карточка Q19 (selectgo) →",
    steps: [
      {
        title: "1. Генерация pollorder (Shuffle) и lockorder (HeapSort)",
        desc: "Горутина G1 входит в select по 3 каналам: chA (0x3000), chB (0x1000), chC (0x2000). На стеке строятся два массива: случайный pollorder (через Фишера—Йетса против голодания) и отсортированный по адресам памяти lockorder (против AB-BA дедлока мьютексов).",
        boxes: [
          {
            title: "Стек горутины G1 (selectgo)",
            rows: [
              { k: "Ветки scases[3]:", v: "case 0: chA, case 1: chB, case 2: chC", hl: false },
              { k: "pollorder (случайный):", v: "[ case 1 (chB), case 2 (chC), case 0 (chA) ]", hl: true },
              { k: "lockorder (по адресам):", v: "[ chB (0x1000), chC (0x2000), chA (0x3000) ]", hl: true }
            ]
          },
          {
            title: "Мьютексы каналов в Хипе",
            rows: [
              { k: "1-й лок (0xc000_1000):", v: "chB.lock — захвачен первым", hl: true },
              { k: "2-й лок (0xc000_2000):", v: "chC.lock — захвачен вторым", hl: true },
              { k: "3-й лок (0xc000_3000):", v: "chA.lock — захвачен третьим", hl: true }
            ]
          },
          {
            title: "Проход 1 (Опрос готовности)",
            rows: [
              { k: "Порядок проверки:", v: "Проверяем chB → затем chC → затем chA", hl: false },
              { k: "Результат опроса:", v: "Все 3 канала пусты, ветки default нет", hl: false },
              { k: "Решение:", v: "Переход к парковке во всех 3 каналах", hl: true }
            ]
          }
        ]
      },
      {
        title: "2. Проход 2: Подписка на все 3 канала (цепочка g.waiting)",
        desc: "Из кеша P берутся 3 отдельных структуры sudog (с флагом isSelect = true), связываются в список G1.waiting и ставятся в очереди recvq всех трёх каналов. Вызывается gopark(selparkcommit), отпускающий все 3 мьютекса на стеке g0.",
        boxes: [
          {
            title: "Спящая горутина G1",
            rows: [
              { k: "Статус G1:", v: "_Gwaiting (спит сразу в 3 каналах!)", hl: true },
              { k: "Список G1.waiting:", v: "sudog_B → sudog_C → sudog_A", hl: true },
              { k: "Атомик G1.selectDone:", v: "0 (никто ещё не разбудил)", hl: false }
            ]
          },
          {
            title: "Очереди каналов (мьютексы отпущены)",
            rows: [
              { k: "chB.recvq (0x1000):", v: "[ sudog_B {g: G1, isSelect: true} ]", hl: true },
              { k: "chC.recvq (0x2000):", v: "[ sudog_C {g: G1, isSelect: true} ]", hl: true },
              { k: "chA.recvq (0x3000):", v: "[ sudog_A {g: G1, isSelect: true} ]", hl: true }
            ]
          },
          {
            title: "Внешние события",
            rows: [
              { k: "Ядро CPU 1:", v: "Писатель W1 готовит запись в chC", hl: false },
              { k: "Ядро CPU 2:", v: "Писатель W2 готовит запись в chA", hl: false },
              { k: "Гонка пробуждений:", v: "Оба придут в одну наносекунду!", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Гонка пробуждений на 2 ядрах: CAS по флагу G1.selectDone",
        desc: "В одну и ту же наносекунду Писатель W1 пишет в chC, а Писатель W2 пишет в chA! Оба видят isSelect = true и выполняют атомарный G1.selectDone.CompareAndSwap(0, 1). Писатель W1 выигрывает CAS (0 → 1), копирует данные и будит G1, а W2 проигрывает и игнорирует sudog_A!",
        boxes: [
          {
            title: "Арбитраж гонки (G1.selectDone)",
            rows: [
              { k: "Операция на 2 ядрах:", v: "G1.selectDone.CompareAndSwap(0, 1)", hl: true },
              { k: "Новое значение:", v: "1 (выиграна ровно одна ветка!)", hl: true },
              { k: "Победивший sudog:", v: "G1.param = &sudog_C (ветка case 2)", hl: true }
            ]
          },
          {
            title: "Ядро 1: Писатель W1 в канал chC",
            rows: [
              { k: "Результат CAS(0, 1):", v: "TRUE (Победа!)", hl: true },
              { k: "Передача данных:", v: "Выполняет sendDirect в стек G1", hl: true },
              { k: "Пробуждение:", v: "Вызывает goready(G1)", hl: false }
            ]
          },
          {
            title: "Ядро 2: Писатель W2 в канал chA",
            rows: [
              { k: "Результат CAS(0, 1):", v: "FALSE (Опоздал — G1 уже разбужена!)", hl: true },
              { k: "Действие W2:", v: "Пропускает sudog_A, ищет другого читателя", hl: false },
              { k: "Безопасность стека G1:", v: "Двойная запись предотвращена!", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Проход 3: Пробуждение G1 и очистка лишних sudog",
        desc: "Разбуженная G1 снова захватывает мьютексы всех 3 каналов строго в порядке lockorder (selock), вырезает свои неиспользованные sudog_B и sudog_A из очередей chB и chA (dequeueSudoG), возвращает все 3 sudog в кеш P и выполняет код победившего case 2!",
        boxes: [
          {
            title: "Проснувшаяся горутина G1",
            rows: [
              { k: "Захват локов:", v: "selock по lockorder (chB → chC → chA)", hl: false },
              { k: "Победившая ветка:", v: "case 2 (определена по G1.param == sudog_C)", hl: true },
              { k: "Кеш P.sudogcache:", v: "Все 3 sudog возвращены через releaseSudog", hl: true }
            ]
          },
          {
            title: "Очистка очередей каналов (dequeueSudoG)",
            rows: [
              { k: "chB.recvq (0x1000):", v: "sudog_B вырезан из двусвязного списка!", hl: true },
              { k: "chC.recvq (0x2000):", v: "Уже извлечён писателем W1", hl: false },
              { k: "chA.recvq (0x3000):", v: "sudog_A вырезан из двусвязного списка!", hl: true }
            ]
          },
          {
            title: "Завершение selectgo",
            rows: [
              { k: "Отпускание локов:", v: "sellock в обратном порядке", hl: false },
              { k: "Возврат из selectgo:", v: "return casi = 2, recvOK = true", hl: true },
              { k: "Накладные расходы:", v: "3 цикла selock/sellock на 1 блокирующий select", hl: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 5: АТОМИКИ CAS (LOCK CMPXCHG / MESI) И SYNC.MUTEX STARVATION
  // =========================================================================
  {
    id: "sim5",
    title: "Диаграмма 5: Аппаратный CAS (LOCK CMPXCHG / протокол MESI) и режимы sync.Mutex",
    subtitle: "Как два ядра процессора конкурируют за 64-байтную кэш-линию L1 при выполнении CAS и как sync.Mutex переключается между Normal и Starvation Mode (1 мс).",
    cardId: "c20",
    cardLabel: "Карточка Q20 (CAS & Mutex) →",
    steps: [
      {
        title: "1. Одновременное чтение в регистры EAX двух ядер",
        desc: "Два потока на Ядре 1 и Ядре 2 одновременно читают переменную state = 0. В обоих ядрах в аккумулятор EAX загружается expected old = 0, а 64-байтная кэш-линия L1 находится в разделяемом статусе Shared (S) по протоколу MESI.",
        boxes: [
          {
            title: "Ядро CPU 1 (Поток M1)",
            rows: [
              { k: "Регистр EAX (old):", v: "0 (ожидаемое значение)", hl: false },
              { k: "Регистр ECX (new):", v: "1 (хочет записать 1)", hl: false },
              { k: "Кэш-линия L1 (MESI):", v: "Shared (S) — чтение разрешено всем", hl: true }
            ]
          },
          {
            title: "Память и Шина когерентности",
            rows: [
              { k: "Адрес переменной:", v: "0xc000_0800 (64-байтная кэш-линия)", hl: false },
              { k: "Текущее значение:", v: "state = 0", hl: true },
              { k: "Шина MESI:", v: "Спокойна", hl: false }
            ]
          },
          {
            title: "Ядро CPU 2 (Поток M2)",
            rows: [
              { k: "Регистр EAX (old):", v: "0 (ожидаемое значение)", hl: false },
              { k: "Регистр ECX (new):", v: "1 (хочет записать 1)", hl: false },
              { k: "Кэш-линия L1 (MESI):", v: "Shared (S)", hl: true }
            ]
          }
        ]
      },
      {
        title: "2. Ядро 1 выполняет LOCK CMPXCHG (Инвалидация кеша Ядра 2)",
        desc: "Ядро 1 на наносекунду раньше выполняет инструкцию LOCK CMPXCHGL CX, (BX). Префикс LOCK переводит 64-байтную кэш-линию Ядра 1 в монопольный статус Modified (M), посылает сигнал Invalidate в кеш Ядра 2, сравнивает EAX (0) == state (0), записывает 1 и ставит флаг нуля ZF = 1!",
        boxes: [
          {
            title: "Ядро CPU 1 (Победитель гонки CAS)",
            rows: [
              { k: "Инструкция:", v: "LOCK CMPXCHGL CX, 0(BX)", hl: true },
              { k: "Сравнение и Флаг ZF:", v: "EAX (0) == Mem (0) → ZF = 1 (TRUE!)", hl: true },
              { k: "Кэш-линия L1 (MESI):", v: "Modified (M) — монопольное владение!", hl: true }
            ]
          },
          {
            title: "Память и Шина когерентности",
            rows: [
              { k: "Сигнал по шине:", v: "Invalidate → сбросить кэш-линию Ядра 2!", hl: true },
              { k: "Новое значение:", v: "state = 1 (обновлено атомарно)", hl: true },
              { k: "Store Buffer:", v: "Принудительно сброшен (Full Memory Fence)", hl: false }
            ]
          },
          {
            title: "Ядро CPU 2 (Кеш инвалидирован)",
            rows: [
              { k: "Регистр EAX (old):", v: "Всё ещё держит старый 0", hl: false },
              { k: "Кэш-линия L1 (MESI):", v: "Invalid (I) — данные устарели!", hl: true },
              { k: "Статус:", v: "Ждёт чтения актуальной кэш-линии от Ядра 1", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Отказ CAS на Ядре 2 (ZF = 0) и переход к Spinning",
        desc: "Ядро 2 подтягивает обновлённую кэш-линию (state = 1) и выполняет свой LOCK CMPXCHG. Процессор видит, что EAX (0) != state (1): запись отменяется, в EAX копируется 1, а флаг нуля сбрасывается в ZF = 0 (CAS вернул false).",
        boxes: [
          {
            title: "Ядро CPU 1 (Владелец ресурса)",
            rows: [
              { k: "Действие M1:", v: "Выполняет критическую секцию кода", hl: false },
              { k: "Задержка:", v: "Быстрый путь занял ~15 наносекунд", hl: false },
              { k: "Кэш-линия L1:", v: "Shared (отдана для чтения Ядру 2)", hl: false }
            ]
          },
          {
            title: "Результат CMPXCHG на Ядре 2",
            rows: [
              { k: "Проверка:", v: "EAX (0) != Mem (1) → Проигрыш!", hl: true },
              { k: "Флаг нуля ZF:", v: "ZF = 0 → SETEQ возвращает false", hl: true },
              { k: "Проблема False Sharing:", v: "Частые LOCK бьют по кэш-линии всех ядер", hl: false }
            ]
          },
          {
            title: "Ядро CPU 2 (Реакция sync.Mutex)",
            rows: [
              { k: "Шаг 1 (Spinning):", v: "Крутит 4 итерации по 30 инструкций PAUSE", hl: true },
              { k: "Шаг 2 (Семафор):", v: "Если лок не освободился → runtime_Semacquire", hl: false },
              { k: "Парковка:", v: "Уходит в gopark в дерево ожидания semtable", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. sync.Mutex: Normal Mode против Starvation Mode (> 1 мс)",
        desc: "В Normal Mode разбуженная из очереди горутина соревнуется за CAS с новыми горутинами, которые уже крутятся на ядрах CPU (и часто проигрывает). Если любая горутина прождала в очереди > 1 мс, мьютекс включает Starvation Mode: теперь Unlock передаёт лок НАПРЯМУЮ первой горутине из очереди!",
        boxes: [
          {
            title: "Normal Mode (По умолчанию)",
            rows: [
              { k: "При Unlock():", v: "Будит ждущую G1, но лок открыт для всех", hl: false },
              { k: "Кто выигрывает CAS:", v: "Новая G2 на горячем CPU обгоняет G1!", hl: true },
              { k: "Плюс / Минус:", v: "Макс. пропускная способность / риск хвостов p99", hl: false }
            ]
          },
          {
            title: "Триггер переключения (Порог 1 мс)",
            rows: [
              { k: "Условие:", v: "Ждущая горутина G1 не смогла взять лок > 1 мс", hl: true },
              { k: "Бит состояния:", v: "m.state |= mutexStarving (бит голодания)", hl: true },
              { k: "Spinning (вращение):", v: "Полностью ОТКЛЮЧАЕТСЯ для новых горутин", hl: true }
            ]
          },
          {
            title: "Starvation Mode (Режим голодания)",
            rows: [
              { k: "При Unlock():", v: "Прямая передача лока (Handoff) горутине G1!", hl: true },
              { k: "Новые горутины:", v: "Не делают CAS, сразу встают в хвост FIFO", hl: true },
              { k: "Выход в Normal Mode:", v: "Когда очередь пуста или ожидание < 1 мс", hl: false }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 6: АЛЛОКАТОР (MCACHE/MSPAN) И ТРЁХЦВЕТНЫЙ GC + WRITE BARRIER
  // =========================================================================
  {
    id: "sim6",
    title: "Диаграмма 6: Аллокатор памяти (mcache / mspan) и Трёхцветный сборщик мусора (Tri-Color GC)",
    subtitle: "Выделение памяти без локов из локального кеша P.mcache, классы scan vs noscan и 4 фазы трёхцветной разметки с Гибридным барьером записи.",
    cardId: "c28",
    cardLabel: "Карточка Q28 (GC & Write Barrier) →",
    steps: [
      {
        title: "1. Escape Analysis и Lock-Free аллокация через P.mcache",
        desc: "Переменные без возврата указателя наверх остались на стеке. Для сбежавших в хип объектов до 32 КБ горутина берёт свободную ячейку из локального кеша своего процессора P.mcache (разбитого на ~68 классов размеров mspan) — БЕЗ единого мьютекса!",
        boxes: [
          {
            title: "Иерархия аллокатора Go (TCMalloc)",
            rows: [
              { k: "1. P.mcache (на каждом P):", v: "Lock-Free выделение объектов < 32 КБ!", hl: true },
              { k: "2. mcentral (общий):", v: "Выдаёт новые 8 КБ спаны в mcache под спинлоком", hl: false },
              { k: "3. mheap (глобальный):", v: "Аллокация крупных объектов > 32 КБ и стеков", hl: false }
            ]
          },
          {
            title: "Классы спанов: scan против noscan",
            rows: [
              { k: "scan mspan:", v: "Объекты с указателями (GC обязан их сканировать)", hl: false },
              { k: "noscan mspan:", v: "[]byte, строки, числа без указателей", hl: true },
              { k: "Оптимизация GC:", v: "GC вообще НЕ заходит внутрь noscan спанов!", hl: true }
            ]
          },
          {
            title: "Старт цикла GC: Mark Setup (STW #1)",
            rows: [
              { k: "Триггер запуска:", v: "Куча удвоилась (GOGC=100) или GOMEMLIMIT", hl: false },
              { k: "Пауза STW #1 (~20 мкс):", v: "Включается Hybrid Write Barrier", hl: true },
              { k: "Цвета объектов в хипе:", v: "Все объекты A, B, C, D, E стартуют Белыми", hl: false }
            ]
          }
        ]
      },
      {
        title: "2. Concurrent Mark: Сканирование корней (Roots → Grey)",
        desc: "Мир снова запущен! Пользовательские горутины работают параллельно с воркерами GC (занимающими 25% ядер GOMAXPROCS). GC сканирует корни (стеки горутин и глобальные переменные) и красит все объекты хипа, на которые есть ссылки со стеков (A и B), в Серый цвет.",
        boxes: [
          {
            title: "Статус мира и Корни сканирования",
            rows: [
              { k: "Текущая фаза:", v: "2. Concurrent Mark (параллельно с кодом)", hl: true },
              { k: "Hybrid Write Barrier:", v: "АКТИВЕН (следит за записью указателей в хипе)", hl: false },
              { k: "Корни (Стеки + Globals):", v: "Найдены ссылки на объекты A и B", hl: true }
            ]
          },
          {
            title: "Трёхцветный граф объектов в Хипе",
            rows: [
              { k: "Белые (Непосещённые):", v: "Объекты C, D, E", hl: false },
              { k: "Серые (Очередь обхода):", v: "Объекты A, B (покрашены из корней!)", hl: true },
              { k: "Чёрные (Проверенные):", v: "Пока пусто", hl: false }
            ]
          },
          {
            title: "Контроль скорости аллокаций",
            rows: [
              { k: "Воркеры GC:", v: "Используют ~25% времени GOMAXPROCS", hl: false },
              { k: "Mark Assist:", v: "Если горутина мусорит быстро → сама красит граф", hl: true },
              { k: "Стеки горутин:", v: "Сжимаются в 2 раза, если заняты менее чем на 25%", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Обход графа и защита через Hybrid Write Barrier",
        desc: "GC берёт Серые A и B, красит их в Чёрный, а их детей (C и D) — в Серый. В этот момент работающая горутина перекидывает указатель на Белый/Серый объект D внутрь уже Чёрного объекта A! Срабатывает Hybrid Write Barrier и принудительно затеняет объект в Серый цвет, спасая его от удаления!",
        boxes: [
          {
            title: "Срабатывание Hybrid Write Barrier",
            rows: [
              { k: "Действие горутины:", v: "Перезапись указателя в куче (*slot = ptr)", hl: true },
              { k: "Барьер Юасы (Deletion):", v: "Красит затираемый старый указатель *slot в Серый", hl: true },
              { k: "Барьер Дейкстры (Insertion):", v: "Красит новый целевой указатель ptr в Серый", hl: true }
            ]
          },
          {
            title: "Трёхцветный граф объектов в Хипе",
            rows: [
              { k: "Белые (Кандидаты в мусор):", v: "Объект E (на него больше нет ссылок)", hl: false },
              { k: "Серые (Очередь обхода):", v: "Объекты C, D (удержаны барьером записи!)", hl: true },
              { k: "Чёрные (Проверенные):", v: "Объекты A, B", hl: true }
            ]
          },
          {
            title: "Почему стекам не нужен барьер записи?",
            rows: [
              { k: "Запись на стек:", v: "Работает на полной скорости без Write Barrier!", hl: true },
              { k: "Инвариант стека:", v: "Новые объекты со стека красятся барьером в хипе", hl: false },
              { k: "Выигрыш:", v: "Не нужно повторно сканировать стеки на STW #2!", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Mark Termination (STW #2) и фоновая очистка (Concurrent Sweep)",
        desc: "Серых объектов больше не осталось! Короткая пауза STW #2 (~10–50 мкс) выключает Write Barrier. Живые объекты (A, B, C, D) стали Чёрными, а оставшийся Белым недостижимый объект E фоново возвращается в битовую карту свободных ячеек mspan без дефрагментации памяти.",
        boxes: [
          {
            title: "Завершение цикла GC",
            rows: [
              { k: "Фаза 3 (STW #2):", v: "Mark Termination — выключает Write Barrier", hl: true },
              { k: "Фаза 4 (Sweep):", v: "Фоновый возврат Белых ячеек в пул mspan", hl: true },
              { k: "Дефрагментация (Compaction):", v: "НЕТ (классы размеров mspan не дробят память)", hl: false }
            ]
          },
          {
            title: "Итог в Хипе после сборки",
            rows: [
              { k: "Удалено (Бывшие Белые):", v: "Объект E → ячейка памяти свободна!", hl: true },
              { k: "Серые:", v: "Пусто (0)", hl: false },
              { k: "Выжившие (Бывшие Чёрные):", v: "A, B, C, D → сбрасываются в Белый для след. GC", hl: true }
            ]
          },
          {
            title: "Расчёт следующей цели (GC Pacer)",
            rows: [
              { k: "При GOGC = 100:", v: "Следующий GC при росте живой кучи в 2 раза", hl: false },
              { k: "При GOMEMLIMIT:", v: "Запустит GC раньше, если близко к OOM контейнера", hl: true },
              { k: "Возврат памяти ОС:", v: "Фоновый scavenger возвращает страницы через madvise", hl: false }
            ]
          }
        ]
      }
    ]
  }
];

const CHEATSHEET_ROWS = [
  {
    topic: "1. Горутина vs Поток ОС и Стек",
    how: "<code>go fn()</code> → <code>runtime.newproc</code> на стеке <code>g0</code>. Структура <code>runtime.g</code> + стек в хипе. На дно стека кладётся адрес возврата <code>runtime.goexit</code>.",
    markers: "Стек от <strong>2 КБ</strong> до <strong>1 ГБ</strong> (у треда ОС 1–8 МБ). Переключение ~15 нс против 1–2 мкс.",
    cardId: "c1", simId: "sim1"
  },
  {
    topic: "2. Регистры CPU и Переключение (gogo)",
    how: "Контекст хранится в <code>g.sched</code> (<code>gobuf</code>). <code>runtime.gogo</code> грузит <code>&G</code> в <code>R14</code>, стек в <code>RSP</code> и делает <code>JMP</code> в <code>RIP</code>. Обратно на <code>g0</code> — через <code>mcall</code>.",
    markers: "Занимает <strong>~10–20 нс</strong> в user space на границе вызова функции без обращения к ядру ОС.",
    cardId: "c6", simId: "sim1"
  },
  {
    topic: "3. Динамический рост стека (copystack)",
    how: "Пролог функции сравнивает <code>RSP</code> с <code>g.stackguard0</code> → <code>morestack</code> (на <code>g0</code>) → <code>copystack</code> → <code>adjustpointers</code>.",
    markers: "Удвоение <strong>2x</strong> в хипе. Внутренние указатели сдвигаются на <code>Δ = new.hi - old.hi</code> по битовой карте стека.",
    cardId: "c5", simId: "sim1"
  },
  {
    topic: "4. Планировщик GMP и слот P.runnext",
    how: "Мультиплексирование M:N. У каждого <code>P</code> (<code>GOMAXPROCS</code>) есть <code>LRQ[256]</code> и приоритетный 1-слотовый LIFO <code>runnext</code>.",
    markers: "<code>runnext</code> держит данные в горячем <strong>L1/L2 кеше CPU</strong>. Каждый <strong>61-й тик</strong> проверяется <code>GRQ</code>.",
    cardId: "c11", simId: "sim1"
  },
  {
    topic: "5. Вытеснение (sysmon), Work Stealing и Syscall",
    how: "Гибридное вытеснение: <code>stackPreempt</code> + сигнал <code>SIGURG</code> от <code>sysmon</code>. Пустой <code>P</code> крадёт задачи через <code>runqsteal</code>. В <code>syscall</code> отдаёт <code>_Psyscall</code> другому потоку <code>M</code>.",
    markers: "Квота <strong>10 мс</strong> → <strong><code>SIGURG</code></strong> → отправка в <code>GRQ</code>. Крадётся ровно <strong>50%</strong> чужой <code>LRQ</code> через <code>CAS</code>.",
    cardId: "c9", simId: "sim2"
  },
  {
    topic: "6. Канал (hchan), sudog и sendDirect",
    how: "<code>*runtime.hchan</code> в хипе: кольцевой <code>buf</code>, очереди <code>sendq</code>/<code>recvq</code> из <code>sudog</code> и мьютекс <code>lock</code>. Парковка через <code>gopark(chanparkcommit)</code> на <code>g0</code>.",
    markers: "Если ждёт читатель — прямое копирование <strong>из стека в стек</strong> (<code>sendDirect</code> + <code>typeBitsBulkBarrier</code>) в обход буфера.",
    cardId: "c17", simId: "sim3"
  },
  {
    topic: "7. Оператор select (runtime.selectgo)",
    how: "Массивы <code>pollorder</code> и <code>lockorder</code> на стеке. Подписка через цепочку <code>g.waiting</code> из <code>sudog</code> с флагом <code>isSelect = true</code>.",
    markers: "<code>pollorder</code> (Фишер—Йетс против голодания), <code>lockorder</code> (сортировка адресов <code>*hchan</code> против AB-BA дедлока), гонка пробуждений через <code>g.selectDone.CompareAndSwap(0, 1)</code>.",
    cardId: "c19", simId: "sim4"
  },
  {
    topic: "8. Атомики CAS (MESI) и sync.Mutex",
    how: "Интринсик компилятора → <code>LOCK CMPXCHGL</code>. В <code>sync.Mutex</code>: быстрый CAS → 4 итерации spinning (PAUSE) → семафор.",
    markers: "Блокирует <strong>64-байтную кэш-линию L1/L2</strong> по протоколу <strong>MESI</strong>. При ожидании <strong>&gt; 1 мс</strong> мьютекс переходит в <strong>Starvation Mode</strong>.",
    cardId: "c21", simId: "sim5"
  },
  {
    topic: "9. Аллокатор (mcache) и Трёхцветный GC",
    how: "Классы размеров <code>mspan</code> (<code>scan</code> vs <code>noscan</code>) в локальном <code>P.mcache</code> без локов. Конкурентный <strong>трёхцветный Mark-and-Sweep GC</strong> с <strong>Hybrid Write Barrier</strong>.",
    markers: "2 паузы STW (&lt;100 мкс), до 25% CPU на разметку + <code>Mark Assist</code>, управляется <strong><code>GOGC=100</code></strong> и <strong><code>GOMEMLIMIT</code></strong>.",
    cardId: "c28", simId: "sim6"
  }
];
