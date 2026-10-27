const SIMULATORS = [
  // =========================================================================
  // ДИАГРАММА 1: РОЖДЕНИЕ ГОРУТИНЫ, СЛОТ RUNNEXT И РЕГИСТРЫ CPU (GOGO)
  // =========================================================================
  {
    "id": "sim1",
    "title": "Диаграмма 1: Кто выполняется, где стек, откуда продолжить",
    "subtitle": "Упрощённый путь создания и запуска горутины в Go 1.26.1 на amd64. Адреса обозначены символически. Это не снимок всех регистров и не измерение скорости.",
    "cardId": "c6",
    "cardLabel": "Q6: регистры простыми словами →",
    "learningHint": "Три опоры: R14 — указатель на текущую G; RSP — адрес в активном стеке; RIP — позиция инструкции. Регистр хранит значение или адрес, а не весь стек. При сохранении место продолжения записывается как PC. На arm64 имена и соглашения другие.",
    "sources": [
      {
        "title": "Go 1.26.1: ABIInternal",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/abi-internal.md"
      },
      {
        "title": "Go 1.26.1: gogo/mcall",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/asm_amd64.s"
      },
      {
        "title": "Go 1.26.1: newproc1/execute/gfput",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      }
    ],
    "steps": [
      {
        "title": "1. Подготовить G2",
        "desc": "G1 вызывает go doWork(). Runtime выполняет создание на системном стеке g0 и получает структуру G2: переиспользует доступную или выделяет новую. Нужен пригодный стек; его размер не обязан всегда быть ровно 2 КиБ. G2 ещё не выполняет doWork.",
        "descEN": "The runtime prepares G2 on the system-stack path, reusing or allocating goroutine state and a suitable stack. Creating it does not mean doWork has started.",
        "boxes": [
          {
            "title": "Регистры amd64: смысл",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "g0",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке g0",
                "hl": true
              },
              {
                "k": "RIP · какой код",
                "v": "Код newproc1",
                "hl": true
              }
            ]
          },
          {
            "title": "Подготавливаемая G2",
            "rows": [
              {
                "k": "Структура G",
                "v": "Переиспользование либо выделение",
                "hl": true
              },
              {
                "k": "Стек",
                "v": "Выбирается runtime; размер не фиксирован",
                "hl": true
              },
              {
                "k": "Пользовательский код",
                "v": "Ещё не запущен",
                "hl": true
              }
            ]
          }
        ]
      },
      {
        "title": "2. Сохранить стартовый контекст",
        "desc": "В G2.sched подготавливаются SP и PC для запуска doWork. На amd64 создаётся путь возврата через goexit после завершения функции. Это сохранённые данные будущего запуска; активные регистры пока обслуживают runtime на g0.",
        "descEN": "G2 receives saved start state, including its stack position and entry PC. The amd64 return path leads to goexit. Saved state in memory is different from registers currently running the runtime.",
        "boxes": [
          {
            "title": "Регистры amd64: смысл",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "g0",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке g0",
                "hl": true
              },
              {
                "k": "RIP · какой код",
                "v": "Код подготовки G2",
                "hl": true
              }
            ]
          },
          {
            "title": "Данные в G2.sched",
            "rows": [
              {
                "k": "sp",
                "v": "Начальная позиция стека G2",
                "hl": true
              },
              {
                "k": "pc",
                "v": "Точка входа doWork",
                "hl": true
              },
              {
                "k": "Путь завершения",
                "v": "Через runtime.goexit",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Is a saved PC already executing?",
          "promptRU": "Сохранённый PC уже выполняется?",
          "answerEN": "No. It is an address in saved state until control transfers there.",
          "answerRU": "Нет. Это адрес в сохранённом состоянии, пока туда не передано управление."
        }
      },
      {
        "title": "3. Сделать G2 доступной планировщику",
        "desc": "После подготовки G2 становится runnable. Показан путь постановки через runqput с предпочтением runnext: прежний элемент этого слота может перейти в обычную очередь. Это готовность к запуску, без обещания немедленного выполнения или горячего кеша.",
        "descEN": "G2 becomes runnable and is queued. The illustrated path requests runnext placement, potentially displacing the previous entry. This does not promise when or on which CPU G2 will execute.",
        "boxes": [
          {
            "title": "Регистры amd64: смысл",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "g0",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке g0",
                "hl": true
              },
              {
                "k": "RIP · какой код",
                "v": "Код постановки в очередь",
                "hl": true
              }
            ]
          },
          {
            "title": "Очередь и состояние",
            "rows": [
              {
                "k": "G2",
                "v": "RUNNABLE",
                "hl": true
              },
              {
                "k": "runnext",
                "v": "Один слот, не отдельный стек",
                "hl": true
              },
              {
                "k": "Запуск",
                "v": "Следующее решение планировщика",
                "hl": true
              }
            ]
          }
        ]
      },
      {
        "title": "4. Восстановить и перейти",
        "desc": "Когда планировщик выбирает G2, execute переводит её в running, а gogo восстанавливает контекст: текущую G, SP, BP и контекст замыкания, затем переходит к saved PC. JMP меняет поток исполнения; RSP теперь указывает в стек G2. Показаны ключевые действия, не полный листинг.",
        "descEN": "When G2 is selected, execute marks it running and gogo restores its continuation. The stack pointer now addresses G2’s stack, and a jump transfers execution to its saved PC. More runtime bookkeeping is omitted.",
        "boxes": [
          {
            "title": "Регистры amd64: смысл",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "G2",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке G2",
                "hl": true
              },
              {
                "k": "RIP · какой код",
                "v": "doWork после перехода",
                "hl": true
              }
            ]
          },
          {
            "title": "Что меняется",
            "rows": [
              {
                "k": "SP и PC",
                "v": "Где брать кадры и откуда продолжить",
                "hl": true
              },
              {
                "k": "g.sched",
                "v": "Некоторые поля очищаются, не весь объект",
                "hl": true
              },
              {
                "k": "schedtick",
                "v": "Зависит от наследования кванта, не всегда +1",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Why is changing only RIP insufficient?",
          "promptRU": "Почему недостаточно изменить только RIP?",
          "answerEN": "The resumed code also needs its own stack and current-G context.",
          "answerRU": "Продолжаемому коду нужны также его стек и контекст текущей G."
        }
      },
      {
        "title": "5. Завершить G2",
        "desc": "После возврата doWork путь goexit вызывает mcall(goexit0). Выполнение переходит на g0; runtime завершает G2 и возвращается к планированию. Структура G может переиспользоваться; сохранение её стека зависит от размера и политики runtime.",
        "descEN": "After doWork returns, goexit reaches mcall(goexit0) and system-stack cleanup. G2 finishes; its state may be reused. Retaining its stack is a separate runtime policy decision.",
        "boxes": [
          {
            "title": "Регистры amd64: смысл",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "g0",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке g0",
                "hl": true
              },
              {
                "k": "RIP · какой код",
                "v": "goexit0, затем планирование",
                "hl": true
              }
            ]
          },
          {
            "title": "Завершившаяся G2",
            "rows": [
              {
                "k": "Статус",
                "v": "DEAD после очистки",
                "hl": true
              },
              {
                "k": "Структура",
                "v": "Может вернуться в пул",
                "hl": true
              },
              {
                "k": "Стек",
                "v": "Может сохраниться или освободиться",
                "hl": true
              }
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
    "id": "sim3",
    "title": "Диаграмма 3: Канал — от ожидания до продолжения",
    "subtitle": "Один допустимый путь: G1 первой читает из открытого небуферизованного chan int, G2 позже отправляет 42. Обычная операция без select. Runtime Go 1.25.0/1.26.1; планировщик может вставлять другую работу между показанными событиями.",
    "cardId": "c17",
    "cardLabel": "Q17: передача и парковка →",
    "learningHint": "Как запомнить: проследи отдельно значение 42, запись sudog и состояние G1. Перед следующим шагом ответь на вопрос, затем сравни. После всей схемы закрой её и восстанови цепочку своими словами; позже повтори с буфером и с переданным срезом.",
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
        "title": "stack.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      }
    ],
    "steps": [
      {
        "title": "1. Зарегистрировать ожидание",
        "desc": "G1 захватила lock, но значения и отправителя нет. В recvq добавлен sudog со ссылкой на G1 и место результата x. Перед gopark установлен parkingOnChan. Это ещё подготовка к парковке: G1 выполняется, lock остаётся захвачен.",
        "descEN": "The receiver holds the channel lock and finds no value or sender. It registers a sudog and marks that it is about to park. It is still running; the channel has not been unlocked yet.",
        "scene": {
          "sender": "Ещё не отправляет",
          "channel": "recvq: [заявка G1] · cap=0",
          "receiver": "RUNNING · x ещё не получен",
          "transfer": "Передачи значения ещё нет."
        },
        "boxes": [
          {
            "title": "Состояние ожидания",
            "rows": [
              {
                "k": "lock",
                "v": "У G1",
                "hl": true
              },
              {
                "k": "parkingOnChan",
                "v": "true",
                "hl": true
              },
              {
                "k": "activeStackChans",
                "v": "В этом сценарии ещё false",
                "hl": false
              }
            ]
          },
          {
            "title": "Связи",
            "rows": [
              {
                "k": "recvq → sudog",
                "v": "G1 и место x",
                "hl": true
              },
              {
                "k": "sudog → G1",
                "v": "Одна ожидающая операция",
                "hl": false
              },
              {
                "k": "Буфер",
                "v": "Нет ячеек",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Why not unlock before parking is committed?",
          "promptRU": "Почему нельзя просто отпустить lock до завершения протокола парковки?",
          "answerEN": "Another goroutine could transfer a value and ready the receiver before its waiting state is safely established. The parking protocol coordinates this handoff.",
          "answerRU": "Другая горутина могла бы передать значение и подготовить получателя к запуску до безопасного оформления ожидания. Протокол парковки согласует эту передачу управления."
        }
      },
      {
        "title": "2. Безопасно припарковаться",
        "desc": "Путь park_m на системном стеке переводит G1 в waiting. chanparkcommit устанавливает activeStackChans, снимает parkingOnChan и только затем отпускает lock. Теперь копирование стека должно согласовываться с каналом; стек не закреплён навсегда.",
        "descEN": "On the system-stack parking path, the receiver becomes waiting. chanparkcommit sets activeStackChans, clears parkingOnChan and unlocks. Stack copying must now coordinate with the channel; the stack is not permanently pinned.",
        "scene": {
          "sender": "Может подойти к каналу",
          "channel": "recvq: [заявка G1] · lock свободен",
          "receiver": "WAITING · x ещё не получен",
          "transfer": "G1 ждёт; значение 42 ещё не передано."
        },
        "boxes": [
          {
            "title": "Порядок действий",
            "rows": [
              {
                "k": "1. activeStackChans",
                "v": "true",
                "hl": true
              },
              {
                "k": "2. parkingOnChan",
                "v": "false",
                "hl": true
              },
              {
                "k": "3. lock",
                "v": "Отпущен после флагов",
                "hl": true
              }
            ]
          },
          {
            "title": "Что это означает",
            "rows": [
              {
                "k": "Стек G1",
                "v": "Доступ согласуется с каналом",
                "hl": false
              },
              {
                "k": "Поток ОС",
                "v": "Ожидание канала не закрепляет за G1 поток",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does activeStackChans mean the stack can never move?",
          "promptRU": "Значит ли activeStackChans, что стек больше нельзя двигать?",
          "answerEN": "No. The runtime can coordinate with the channel locks and adjust sudog pointers while copying the stack.",
          "answerRU": "Нет. Runtime согласует копирование с блокировками каналов и поправляет указатели sudog."
        }
      },
      {
        "title": "3. Передать значение",
        "desc": "G2 захватывает lock и извлекает sudog G1 из recvq. Для выбранного пути sendDirect копирует 42 в место x, минуя буфер. G1 ещё ждёт. Для int нет переносимых указателей; барьерный помощник учитывает тип, а его наличие не означает работу GC над указателями у каждого значения.",
        "descEN": "The sender locks the channel, removes the receiver’s waiter and copies 42 to the receive destination. The receiver is still waiting. The type-aware transfer supports pointers, but this int contains none.",
        "scene": {
          "sender": "RUNNING · отправляет 42",
          "channel": "recvq: [] · lock у G2",
          "receiver": "WAITING · в месте x уже 42",
          "transfer": "Копирование: G2 → место x у G1. Промежуточного буфера нет."
        },
        "boxes": [
          {
            "title": "Значение и заявка",
            "rows": [
              {
                "k": "Значение",
                "v": "Скопировано в место результата",
                "hl": true
              },
              {
                "k": "sudog",
                "v": "Извлечён, но ещё не освобождён",
                "hl": true
              }
            ]
          },
          {
            "title": "Граница модели",
            "rows": [
              {
                "k": "Источник значения",
                "v": "Не обязан всегда быть на стеке",
                "hl": false
              },
              {
                "k": "Копирование",
                "v": "Это не передача владения объектами по ссылкам",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "The value is copied. Has G1 executed the next statement?",
          "promptRU": "Значение скопировано. Выполнила ли G1 следующую строку?",
          "answerEN": "No. In this snapshot it is still waiting; copying data and running the receiving code are separate events.",
          "answerRU": "Нет. В этом снимке она ещё ждёт: запись данных и выполнение кода получателя — разные события."
        }
      },
      {
        "title": "4. Разрешить запуск",
        "desc": "G2 отпускает lock, затем вызывает goready для G1. G1 становится runnable. На этом снимке планировщик ещё не возобновил её код; такой промежуток может быть очень коротким. Не обещаются немедленный запуск, конкретное ядро или горячий L1.",
        "descEN": "The sender unlocks before making the receiver runnable. This snapshot is before the receiver resumes; the gap may be very short. Readiness does not promise immediate execution or a particular CPU.",
        "scene": {
          "sender": "Отправка завершена",
          "channel": "recvq: [] · lock свободен",
          "receiver": "RUNNABLE · в месте x уже 42",
          "transfer": "Значение уже на месте; теперь G1 разрешено продолжить."
        },
        "boxes": [
          {
            "title": "Два разных события",
            "rows": [
              {
                "k": "goready",
                "v": "Готовность к выполнению",
                "hl": true
              },
              {
                "k": "Запуск G1",
                "v": "Решение планировщика",
                "hl": false
              }
            ]
          },
          {
            "title": "Запись ожидания",
            "rows": [
              {
                "k": "sudog",
                "v": "Ещё связан с возобновляемой операцией",
                "hl": true
              },
              {
                "k": "Освобождение",
                "v": "После продолжения G1",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "What extra event proves that processing after receive is finished?",
          "promptRU": "Какое дополнительное событие подтвердит завершение обработки после чтения?",
          "answerEN": "An explicit acknowledgement after processing, such as closing a separate done channel. Completion of the send alone is not that acknowledgement.",
          "answerRU": "Явное подтверждение после обработки, например закрытие отдельного done-канала. Само завершение отправки таким подтверждением не является."
        }
      },
      {
        "title": "5. Продолжить и освободить запись",
        "desc": "Планировщик возобновляет G1. Путь чтения очищает состояние ожидания, сбрасывает activeStackChans и возвращает sudog через releaseSudog. Затем пользовательский код получает x=42 и может продолжить обработку. Именно это отдельное событие отсутствовало в прежней схеме.",
        "descEN": "When scheduled, the receiver resumes, clears its waiting state and releases its sudog. The receive then completes with x=42, and user code can continue.",
        "scene": {
          "sender": "Может выполнять другую работу",
          "channel": "recvq: [] · заявка освобождена",
          "receiver": "RUNNING · чтение вернуло 42",
          "transfer": "G1 продолжает код после чтения. Обработка 42 ещё может занимать время."
        },
        "boxes": [
          {
            "title": "Завершение ожидания",
            "rows": [
              {
                "k": "waiting / activeStackChans",
                "v": "Очищены для этой операции",
                "hl": true
              },
              {
                "k": "sudog",
                "v": "Возвращён через releaseSudog",
                "hl": true
              }
            ]
          },
          {
            "title": "Восстанови по памяти",
            "rows": [
              {
                "k": "Три события",
                "v": "Копия → готовность → выполнение",
                "hl": true
              },
              {
                "k": "Сравни с буфером",
                "v": "Где окажется значение, если получателя нет?",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Capacity is now 1 and no receiver is waiting. Where can the first sent value go?",
          "promptRU": "Теперь ёмкость 1, а ожидающего получателя нет. Куда может попасть первое значение?",
          "answerEN": "Into the free buffer slot. If a receiver is already waiting, the checked runtime can still transfer directly. Capacity alone does not determine the path.",
          "answerRU": "В свободную ячейку буфера. Если получатель уже ждёт, проверенный runtime всё ещё может передать значение напрямую. Одна ёмкость не определяет путь."
        }
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 4: ОПЕРАТОР SELECT ПОД КАПОТОМ (POLLORDER, LOCKORDER, SELECTDONE)
  // =========================================================================
  {
    "id": "sim4",
    "title": "Диаграмма 4: select — от компилятора до пробуждения",
    "subtitle": "Сначала выбери путь по форме select, затем пройди общий selectgo. Go 1.25/1.26; трасса и адреса условные, порядок событий не гарантирован.",
    "cardId": "c19",
    "cardLabel": "Карточка Q19 (selectgo) →",
    "steps": [
      {
        "title": "1. Какой путь создаёт компилятор?",
        "desc": "Не каждый select вызывает selectgo. Здесь считаем ветки с операциями, а default учитываем отдельно. Имена справа описывают проверенную реализацию компилятора, а не обещание языка.",
        "descEN": "The compiler chooses a path from the shape of the select. Count channel cases separately from default; these helper names are implementation details.",
        "boxes": [],
        "check": {
          "promptRU": "Два чтения, одно из nil-канала, плюс default: какой путь?",
          "promptEN": "Two receives, one using a nil channel, plus default: which path?",
          "answerRU": "Общий selectgo с block=false. Nil исключится из опроса в runtime, но ветки исходника уже определили путь компиляции.",
          "answerEN": "The general selectgo path with block=false. Runtime excludes the nil channel from polling; the source case count determined lowering."
        },
        "routes": [
          {
            "form": "select {}",
            "target": "runtime.block()",
            "note": "Паркует G навсегда; это не активный цикл."
          },
          {
            "form": "select { default: work() }",
            "target": "Тело default",
            "note": "Нет операции с каналом и вызова selectgo."
          },
          {
            "form": "Одна отправка / одно чтение",
            "target": "Обычная операция с каналом",
            "note": "chansend1 или chanrecv1/2; может ждать."
          },
          {
            "form": "Одна операция + default",
            "target": "selectnbsend / selectnbrecv",
            "note": "Проба без ожидания готовности канала."
          },
          {
            "form": "Две и более операции",
            "target": "selectgo(block=true)",
            "note": "Нет готовых → регистрация ожидания и парковка."
          },
          {
            "form": "Две и более операции + default",
            "target": "selectgo(block=false)",
            "note": "Нет готовых → default, без регистрации ожидания."
          }
        ]
      },
      {
        "title": "2. Проба: выбрана ветка ≠ получено значение",
        "desc": "Для чтения с default helper возвращает два флага. selected отвечает за выбор ветки, received становится ok в Go. Закрытый пустой канал готов к чтению, хотя настоящего значения уже нет.",
        "descEN": "The non-blocking receive helper returns selected and received. A closed, drained channel selects the receive with ok=false; this is different from an unavailable receive.",
        "boxes": [
          {
            "title": "Результаты selectnbrecv",
            "rows": [
              {
                "k": "Открытый пустой / nil",
                "v": "selected=false → default",
                "hl": false
              },
              {
                "k": "Есть значение, даже 0",
                "v": "selected=true, received=true",
                "hl": false
              },
              {
                "k": "Закрытый и пустой",
                "v": "selected=true, received=false → case",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Если канал закрыт, но в буфере осталось 7, что вернётся?",
          "promptEN": "What if the channel is closed but still contains 7?",
          "answerRU": "Сначала 7, ok=true; после опустошения — 0, ok=false. Оба чтения выбирают case.",
          "answerEN": "First 7 with ok=true; after draining, 0 with ok=false. Both select the receive case."
        }
      },
      {
        "title": "3. Общий путь: перестановка, опрос и default",
        "desc": "Дальше — три чтения chA, chB, chC в таком порядке исходника. Компилятор размещает их в scases с конца: C, B, A. Runtime строит случайный pollorder и порядок блокировок по адресам. Первый проход ищет готовую операцию.",
        "descEN": "For three receives written A, B, C, the compiler stores cases as C, B, A. Runtime polls in randomized order and locks distinct channels in address order. A ready case proceeds; otherwise default returns immediately if present.",
        "boxes": [
          {
            "title": "Индексы не равны номерам строк",
            "rows": [
              {
                "k": "scases[0]",
                "v": "chC → третья ветка исходника",
                "hl": false
              },
              {
                "k": "scases[1]",
                "v": "chB → вторая ветка",
                "hl": false
              },
              {
                "k": "scases[2]",
                "v": "chA → первая ветка",
                "hl": false
              }
            ]
          },
          {
            "title": "Два порядка",
            "rows": [
              {
                "k": "pollorder (пример)",
                "v": "[1, 0, 2] → B, C, A",
                "hl": false
              },
              {
                "k": "lockorder (адреса условные)",
                "v": "B 0x1000 → C 0x2000 → A 0x3000",
                "hl": false
              }
            ]
          },
          {
            "title": "После опроса",
            "rows": [
              {
                "k": "Есть готовая операция",
                "v": "Выполнить, отпустить блокировки, вернуть индекс",
                "hl": false
              },
              {
                "k": "Ничего нет, есть default",
                "v": "chosen=-1; без sudog и парковки",
                "hl": false
              },
              {
                "k": "Ничего нет, нет default",
                "v": "Перейти к регистрации под теми же блокировками",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Почему default не означает «selectgo не вызывается»?",
          "promptEN": "Why does default not imply that selectgo is skipped?",
          "answerRU": "При двух и более операциях остаётся общий опрос. Default запрещает ожидание готовности, а не вызов selectgo.",
          "answerEN": "With two or more operations the general polling path remains. Default prevents waiting for readiness, not the selectgo call."
        }
      },
      {
        "title": "4. Нет готовых: зарегистрироваться и уснуть",
        "desc": "В нашей трассе нет default и готовых операций. Под уже захваченными блокировками создаются три sudog — по одному на чтение. gopark с selparkcommit отпускает блокировки при парковке. Это ожидание одной горутины сразу в нескольких очередях.",
        "descEN": "With no ready case and no default, selectgo registers one sudog per active case while holding the same locks, then parks and releases the locks.",
        "boxes": [
          {
            "title": "Регистрация G1",
            "rows": [
              {
                "k": "G1.waiting",
                "v": "sudog_B → sudog_C → sudog_A",
                "hl": false
              },
              {
                "k": "recvq каждого канала",
                "v": "Одна запись с g=G1, isSelect=true",
                "hl": false
              },
              {
                "k": "G1.selectDone",
                "v": "0: никто ещё не забрал ожидание",
                "hl": false
              }
            ]
          },
          {
            "title": "После парковки",
            "rows": [
              {
                "k": "G1",
                "v": "_Gwaiting",
                "hl": false
              },
              {
                "k": "Блокировки каналов",
                "v": "Отпущены через selparkcommit",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Был ли второй захват блокировок между опросом и регистрацией?",
          "promptEN": "Were the locks acquired again between polling and registration?",
          "answerRU": "Нет. Опрос и регистрация проходят под одним захватом набора каналов.",
          "answerEN": "No. Polling and registration share one acquisition of the channel set."
        }
      },
      {
        "title": "5. Два отправителя: кто заберёт ожидание?",
        "desc": "W1 пишет в C, W2 — в A. В этом допустимом исходе W1 первым меняет selectDone с 0 на 1 через CAS и передаёт значение G1. W2 извлекает свою запись, проигрывает CAS и ищет другого получателя. CAS не даёт обеим операциям использовать одно ожидание.",
        "descEN": "Two sends compete for the same select waiter. Here W1 wins CAS(0, 1), transfers its value and makes G1 runnable. W2 loses and skips that waiter. Runnable does not mean already running.",
        "boxes": [
          {
            "title": "W1 → chC",
            "rows": [
              {
                "k": "CAS(0, 1)",
                "v": "true: ожидание занято",
                "hl": false
              },
              {
                "k": "После передачи",
                "v": "goready(G1) → runnable",
                "hl": false
              }
            ]
          },
          {
            "title": "W2 → chA",
            "rows": [
              {
                "k": "CAS(0, 1)",
                "v": "false: уже занято",
                "hl": false
              },
              {
                "k": "Дальше",
                "v": "Пропустить sudog_A; искать другого получателя",
                "hl": false
              }
            ]
          },
          {
            "title": "Выбранная запись",
            "rows": [
              {
                "k": "G1.param",
                "v": "sudog_C",
                "hl": false
              },
              {
                "k": "Внутренний индекс C",
                "v": "0, а не номер ветки исходника",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Почему runnable не означает, что G1 уже исполняет тело case?",
          "promptEN": "Why does runnable not mean G1 is already executing the case body?",
          "answerRU": "Планировщик ещё должен запустить G1; затем selectgo завершит очистку и вернёт управление.",
          "answerEN": "The scheduler must run G1, then selectgo must finish cleanup and return."
        }
      },
      {
        "title": "6. Очистить записи и вернуться в нужный case",
        "desc": "G1 возобновляется и снова захватывает каналы в lockorder. Удаляет оставшуюся запись B; C уже извлечена победителем, A — проигравшим. Освобождает все три sudog и блокировки. Компилятор переводит внутренний chosen=0 в третью ветку исходника, chC.",
        "descEN": "After resuming, G1 locks the channels again, removes remaining registrations and releases the sudogs and locks. The compiler maps chosen=0 back to the third source case, chC.",
        "boxes": [
          {
            "title": "Очистка",
            "rows": [
              {
                "k": "B.recvq",
                "v": "Удалить оставшийся sudog_B",
                "hl": false
              },
              {
                "k": "C.recvq и A.recvq",
                "v": "Записи уже извлечены в нашей трассе",
                "hl": false
              },
              {
                "k": "Все три sudog",
                "v": "releaseSudog",
                "hl": false
              }
            ]
          },
          {
            "title": "Возврат",
            "rows": [
              {
                "k": "selectgo",
                "v": "chosen=0, recvOK=true",
                "hl": false
              },
              {
                "k": "Код компилятора",
                "v": "Выбрать исходный case <-chC",
                "hl": false
              },
              {
                "k": "Захваты набора каналов",
                "v": "Два: опрос/регистрация и очистка",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Если победила C, означает ли chosen=0 первую строку select?",
          "promptEN": "If C wins, does chosen=0 mean the first source case?",
          "answerRU": "Нет: это индекс массива runtime. Компилятор хранит соответствие веткам исходника.",
          "answerEN": "No. It indexes the runtime case array; the compiler maps it back to the source case."
        }
      },
      {
        "title": "7. Nil, closed и повтор одного канала",
        "desc": "Nil исключается из опроса. Закрытое чтение готово; выбранная отправка в закрытый канал вызывает panic. Две ветки с одним каналом остаются двумя вариантами выбора, но сам канал блокируется один раз. Default не конкурирует с готовыми операциями.",
        "descEN": "Nil channels are omitted from polling. A closed receive is ready; a selected send on a closed channel panics. Duplicate channel cases remain separate choices, while the channel is locked once. Default is used only if no communication can proceed.",
        "boxes": [
          {
            "title": "Граничные случаи",
            "rows": [
              {
                "k": "Только nil, без default",
                "v": "Ожидание навсегда",
                "hl": false
              },
              {
                "k": "Только nil, с default",
                "v": "Ветка default",
                "hl": false
              },
              {
                "k": "Закрытый send + default",
                "v": "Panic; default не защищает",
                "hl": false
              },
              {
                "k": "Два одинаковых receive case",
                "v": "Одна выбранная ветка, одно чтение",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Закрытая отправка и готовое чтение в одном select: panic неизбежна?",
          "promptEN": "A closed send and a ready receive share a select. Is panic inevitable?",
          "answerRU": "Нет: может быть выбрано чтение. Если выбрана отправка, будет panic.",
          "answerEN": "No. The receive may be selected; selecting the send causes a panic."
        }
      },
      {
        "title": "8. Когда вычисляются выражения?",
        "desc": "Сначала один раз, в порядке исходника, вычисляются каналы и отправляемые значения. Только затем выбирается операция. Левая часть присваивания при чтении вычисляется после выбранного чтения. Default, nil и уже закрытый Done не делают build() ленивым.",
        "descEN": "Channel operands and send values are evaluated once in source order before selection. Receive-assignment destinations are evaluated after a selected receive. Default, nil and an already-closed Done channel do not make build() lazy.",
        "boxes": [
          {
            "title": "До выбора",
            "rows": [
              {
                "k": "case ch <- build():",
                "v": "build() вызовется, даже если выиграет default",
                "hl": false
              },
              {
                "k": "case dst[index()] = <-ch:",
                "v": "ch вычислен; index() ещё не вызван",
                "hl": false
              }
            ]
          },
          {
            "title": "После выбора",
            "rows": [
              {
                "k": "Выбрано чтение",
                "v": "Получить значение → index() → присвоить → тело",
                "hl": false
              },
              {
                "k": "Выбран default",
                "v": "index() из ветки чтения не вызывается",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptRU": "Как сделать подготовку задачи отменяемой?",
          "promptEN": "How can preparing a job support cancellation?",
          "answerRU": "Передай context в саму подготовку и обрабатывай его там. Предварительная проверка помогает при уже видимой отмене, но не даёт строгого приоритета и не отменяет синхронный вызов автоматически.",
          "answerEN": "Pass context into preparation and observe it there. A pre-check handles cancellation already visible then, but gives neither strict priority nor automatic interruption."
        }
      }
    ],
    "learningHint": "Опора: «форма → готовность → ожидание». Сначала посчитай операции с каналами и найди default. Перед раскрытием ответа предскажи следующий шаг, затем объясни причину по-английски.",
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
        "title": "selectgo — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/select.go"
      },
      {
        "title": "Channel helpers — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 5: АТОМИКИ CAS (LOCK CMPXCHG / MESI) И SYNC.MUTEX STARVATION
  // =========================================================================
  {
    "id": "sim5",
    "title": "Диаграмма 5: CAS — сравнить и заменить одним действием",
    "subtitle": "Сначала смысл на одном state, затем пример регистров amd64. Две горутины пробуют переход 0 → 1; никто не возвращает state в 0.",
    "cardId": "c20",
    "cardLabel": "Q20: CAS и его границы →",
    "learningHint": "CAS = Compare-And-Swap. Три входа: адрес, ожидаемое old, предлагаемое new. Результат true/false говорит, выполнена ли замена. Это условная запись, а не обмен двух переменных местами.",
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
      }
    ],
    "steps": [
      {
        "title": "1. Что хотим сделать",
        "desc": "state=0 означает «ещё никто не занял», 1 — «уже занято». G1 и G2 хотят CAS(0, 1): записать 1 только при текущем 0. Успех сообщает, кто получил право действовать. Обычный if с отдельной записью оставляет промежуток для конкурента.",
        "descEN": "Both goroutines want to claim state by replacing 0 with 1. CAS checks and conditionally writes atomically; a separate check followed by a store leaves a race in the decision.",
        "boxes": [
          {
            "title": "Три входа CAS",
            "rows": [
              {
                "k": "Адрес",
                "v": "Место переменной state",
                "hl": true
              },
              {
                "k": "old",
                "v": "0 — ожидаемое значение",
                "hl": true
              },
              {
                "k": "new",
                "v": "1 — предлагаемая замена",
                "hl": true
              }
            ]
          },
          {
            "title": "Правило результата",
            "rows": [
              {
                "k": "Совпало",
                "v": "Записать new, вернуть true",
                "hl": true
              },
              {
                "k": "Не совпало",
                "v": "Не записывать new, вернуть false",
                "hl": true
              },
              {
                "k": "state сейчас",
                "v": "0",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Could both calls succeed without any reset?",
          "promptRU": "Могут ли обе попытки пройти без сброса state?",
          "answerEN": "No. Once one changes 0 to 1, the other no longer matches 0.",
          "answerRU": "Нет. После замены 0 на 1 второй вызов больше не совпадает с ожидаемым 0."
        }
      },
      {
        "title": "2. Первая попытка успешна",
        "desc": "В показанном порядке первой выполняется CAS горутины G1. Текущее значение равно old=0: операция записывает 1 и возвращает true. Сравнение и запись неделимы относительно других атомарных операций; это свойство операции, а не удачный тайминг.",
        "descEN": "In this ordering G1’s CAS sees the expected 0, stores 1 and returns true. The comparison and update are indivisible relative to other atomic operations.",
        "boxes": [
          {
            "title": "G1",
            "rows": [
              {
                "k": "Ожидала",
                "v": "0",
                "hl": true
              },
              {
                "k": "Предлагала",
                "v": "1",
                "hl": true
              },
              {
                "k": "Получила",
                "v": "true",
                "hl": true
              }
            ]
          },
          {
            "title": "Общее состояние",
            "rows": [
              {
                "k": "До CAS",
                "v": "0",
                "hl": true
              },
              {
                "k": "После CAS",
                "v": "1",
                "hl": true
              },
              {
                "k": "G2",
                "v": "Ещё не выполнила свой CAS",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "If G2 ran first instead, would the rule change?",
          "promptRU": "Если бы первой была G2, изменилось бы правило?",
          "answerEN": "No. The winner can differ, but only one succeeds under the stated no-reset condition.",
          "answerRU": "Нет. Победитель может быть другим, но при условии отсутствия сброса успешен только один."
        }
      },
      {
        "title": "3. Вторая попытка не проходит",
        "desc": "G2 всё ещё ожидает old=0, но в state уже 1. CAS возвращает false, не записывая предлагаемое значение. Сам CAS не ставит G2 в очередь, не засыпает до освобождения и не запускает повторную попытку. Это решает вызывающий алгоритм.",
        "descEN": "G2 expects 0 but finds 1, so CAS returns false without the proposed update. Waiting, retrying or giving up is the caller’s policy, not an automatic effect of CAS.",
        "boxes": [
          {
            "title": "G2",
            "rows": [
              {
                "k": "Ожидала",
                "v": "0",
                "hl": true
              },
              {
                "k": "Нашла",
                "v": "1",
                "hl": true
              },
              {
                "k": "Получила",
                "v": "false",
                "hl": true
              }
            ]
          },
          {
            "title": "Что дальше",
            "rows": [
              {
                "k": "state",
                "v": "Остаётся 1",
                "hl": true
              },
              {
                "k": "Повторить?",
                "v": "Только если это предусмотрено алгоритмом",
                "hl": true
              },
              {
                "k": "Гарантия",
                "v": "Один CAS не защищает произвольный набор полей",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Can separate atomic Load and Store calls replace this CAS?",
          "promptRU": "Можно ли заменить этот CAS отдельными атомарными Load и Store?",
          "answerEN": "Not for the same claim guarantee: both goroutines can load 0 before either stores 1.",
          "answerRU": "Для той же гарантии — нет: обе горутины могут прочитать 0 до первой записи 1."
        }
      },
      {
        "title": "4. Как это связано с регистрами",
        "desc": "В показанной 32-битной реализации CAS на amd64 BX хранит адрес, AX — ожидаемое old, CX — новое значение. LOCK CMPXCHGL выполняет атомарное сравнение и условную запись; SETEQ формирует bool из признака равенства. Это конкретный листинг, а не универсальное распределение регистров у любого вызова Go.",
        "descEN": "In this amd64 implementation, BX holds the address, AX the expected value and CX the replacement. LOCK CMPXCHGL performs the atomic operation; SETEQ produces the Boolean result. Other architectures and compiled call sites can differ.",
        "boxes": [
          {
            "title": "Роли в листинге amd64",
            "rows": [
              {
                "k": "BX · куда",
                "v": "Адрес state, не значение state",
                "hl": true
              },
              {
                "k": "AX · с чем сравнить",
                "v": "old, используются младшие 32 бита",
                "hl": true
              },
              {
                "k": "CX · что записать",
                "v": "new, используются младшие 32 бита",
                "hl": true
              }
            ]
          },
          {
            "title": "За пределами листинга",
            "rows": [
              {
                "k": "arm64",
                "v": "LSE CAS или exclusive load/store путь",
                "hl": true
              },
              {
                "k": "Кеши",
                "v": "Не универсальный сценарий «64 байта и один такт»",
                "hl": true
              },
              {
                "k": "Mutex",
                "v": "CAS может быть быстрым путём; ожидание — отдельный протокол",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does CAS success prove the value never changed earlier?",
          "promptRU": "Доказывает ли успех CAS, что значение раньше не менялось?",
          "answerEN": "No. A → B → A can match A again. CAS compares the current value, not its history.",
          "answerRU": "Нет. После A → B → A сравнение с A снова может пройти. CAS проверяет текущее значение, а не историю."
        }
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 6: АЛЛОКАТОР (MCACHE/MSPAN) И ТРЁХЦВЕТНЫЙ GC + WRITE BARRIER
  // =========================================================================
  {
    "id": "sim6",
    "title": "Диаграмма 6: Аллокатор памяти (mcache / mspan) и Трёхцветный сборщик мусора (Tri-Color GC)",
    "subtitle": "От выделения ячейки к достижимости: корни → обход → защита меняющихся ссылок → освобождение. Цвета и граф — учебная модель; отдельные вопросы помогают восстановить её по памяти.",
    "cardId": "c27",
    "cardLabel": "Карточка Q27 (GC, GOGC и мягкий лимит) →",
    "versionNote": "Учебная модель runtime Go 1.26.1, не трасса исполнения. Green Tea: эксперимент в 1.25, по умолчанию в 1.26; организация scanning меняется, достижимость и необходимость барьера остаются. Цель кучи, trigger и мягкий лимит различаются; фиксированной длительности пауз нет.",
    "sources": [
      {
        "title": "GC guide",
        "url": "https://go.dev/doc/gc-guide"
      },
      {
        "title": "Allocator — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/malloc.go"
      },
      {
        "title": "mcentral — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mcentral.go"
      },
      {
        "title": "GC pacer — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go"
      },
      {
        "title": "GC phases — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go"
      },
      {
        "title": "Hybrid barrier — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/mbarrier.go"
      },
      {
        "title": "Compiler write barriers — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssa/writebarrier.go"
      },
      {
        "title": "Green Tea in Go 1.26",
        "url": "https://go.dev/doc/go1.26#runtime"
      }
    ],
    "steps": [
      {
        "title": "1. Размещение → свободная ячейка → пополнение кеша",
        "desc": "Сначала компилятор определяет время жизни: объект может остаться в стеке, в регистрах или исчезнуть после оптимизации. Если нужен объект кучи, быстрый путь берёт свободную ячейку из span текущего P. Когда ячейки закончились, mcentral ищет подходящий span, при необходимости выполняется sweep или запрашиваются страницы у mheap. Это разные пути с разной стоимостью.",
        "descEN": "First the compiler determines lifetimes: storage may be on the stack, in registers or eliminated. For a required heap object, the fast path uses a free slot in the current P’s cached span. Refill may sweep a span or obtain pages from mheap. Pointer-free payloads skip pointer traversal but still need reachability tracking and reclamation.",
        "check": {
          "promptEN": "The cached span is full. Can the next small allocation still be described as always lock-free? Is a string descriptor pointer-free?",
          "promptRU": "В кешированном span закончились ячейки. Можно ли всё ещё обещать следующей небольшой аллокации отсутствие блокировок? А дескриптор строки не содержит указателей?",
          "answerEN": "No to both. Refill can reach shared structures and sweeping. A string descriptor points to bytes; the byte payload is pointer-free, but the descriptor is not.",
          "answerRU": "Нет в обоих случаях. Пополнение может обращаться к общим структурам и sweep. Дескриптор строки указывает на байты: сами байты не содержат ссылок, но дескриптор содержит."
        },
        "boxes": [
          {
            "title": "Откуда берётся место для объекта",
            "rows": [
              {
                "k": "1. mcache текущего P:",
                "v": "Есть свободная ячейка → быстрый путь без блокировки",
                "hl": true
              },
              {
                "k": "2. Ячеек нет → mcentral:",
                "v": "Нужен span нужного класса; возможны sweep и синхронизация",
                "hl": false
              },
              {
                "k": "3. Нужны страницы → mheap:",
                "v": "Выдаёт области страниц; большой объект обходит кеши малых",
                "hl": false
              },
              {
                "k": "Страница ≠ span ≠ объект:",
                "v": "Страница runtime — 8 KiB; span — одна/несколько страниц; малые объекты занимают отдельные ячейки",
                "hl": true
              }
            ]
          },
          {
            "title": "Где искать указатели",
            "rows": [
              {
                "k": "scan:",
                "v": "Например, Holder с полями []byte и string содержит указатели в дескрипторах",
                "hl": false
              },
              {
                "k": "noscan:",
                "v": "Массив байтов за []byte или string не содержит указателей",
                "hl": true
              },
              {
                "k": "Что остаётся GC:",
                "v": "Проверка достижимости, учёт памяти и освобождение; это не «0 ms»",
                "hl": true
              }
            ]
          },
          {
            "title": "Дальше — начало разметки GC",
            "rows": [
              {
                "k": "Триггер запуска:",
                "v": "Pacer выбирает trigger раньше heap goal; учитывает GOGC и мягкий лимит",
                "hl": false
              },
              {
                "k": "Переход STW #1:",
                "v": "Завершение предыдущего sweep и включение write barrier",
                "hl": true
              },
              {
                "k": "Условный граф следующего шага:",
                "v": "A, B, C, D, E пока не размечены; цвета — модель, не трасса",
                "hl": false
              }
            ]
          }
        ]
      },
      {
        "title": "2. Достижимость: корни → A, B → C, D",
        "desc": "После подготовки мир запущен. Корни ведут к A и B; A ведёт к D, B — к C. У E нет пути от корней. В этом учебном снимке A и B найдены, но ещё не просмотрены. Обработка корней и кучи в runtime может чередоваться; при сканировании стека временно останавливается соответствующая горутина.",
        "descEN": "After setup, the program runs alongside GC. Roots point to A and B; A points to D, B to C. E has no path from a root. In this teaching snapshot, A and B are discovered but not yet scanned. Root jobs and heap scanning may interleave; scanning a stack temporarily stops that goroutine.",
        "check": {
          "promptEN": "C is still white but reachable through B. Can it already be treated as garbage?",
          "promptRU": "C ещё белый, но достижим через B. Можно ли уже считать его мусором?",
          "answerEN": "No. White during marking means not yet marked. B is pending work, so its outgoing pointer can still reveal C.",
          "answerRU": "Нет. Белый во время разметки означает «ещё не отмечен». B ещё предстоит просмотреть, и его указатель позволит найти C."
        },
        "boxes": [
          {
            "title": "Связи графа — не порядок исполнения",
            "rows": [
              {
                "k": "Корни → A, B:",
                "v": "Например, живые указатели стеков и globals",
                "hl": true
              },
              {
                "k": "A → D; B → C:",
                "v": "D и C достижимы, хотя ещё белые",
                "hl": true
              },
              {
                "k": "E отдельно:",
                "v": "Нет пути от корня; собственный цикл E → E не спасает",
                "hl": false
              }
            ]
          },
          {
            "title": "Цвет = состояние работы",
            "rows": [
              {
                "k": "Белые: C, D, E",
                "v": "Пока не отмечены; это ещё не готовый список мусора",
                "hl": false
              },
              {
                "k": "Серые: A, B",
                "v": "Найдены, исходящие указатели ждут просмотра",
                "hl": true
              },
              {
                "k": "Чёрные: пока нет",
                "v": "Просмотренные объекты появятся на следующем шаге",
                "hl": false
              }
            ]
          },
          {
            "title": "Что происходит параллельно",
            "rows": [
              {
                "k": "Write barrier включён:",
                "v": "Защищает изменения указателей, включая globals",
                "hl": true
              },
              {
                "k": "Workers и assists:",
                "v": "Фоновая цель ≈25% мощности GOMAXPROCS; assists добавляют работу",
                "hl": false
              },
              {
                "k": "Новые объекты marking:",
                "v": "Считаются чёрными, а не добавляются как обычные белые",
                "hl": false
              }
            ]
          }
        ]
      },
      {
        "title": "3. Перенос связи: почему C нельзя потерять",
        "desc": "GC просмотрел A: A стал чёрным, D — серым; B ещё серый, C белый. Горутина выполняет A.Next = B.Next, затем B.Next = nil. Без барьера обход мог бы пропустить C: A уже прошли, а в B ссылка исчезла. Барьер учитывает вставленную/удалённую ссылку и защищает C. Это возможное чередование в модели, а не воспроизводимая трасса Go.",
        "descEN": "GC has scanned A, making A black and D grey; B is still grey and C white. The program executes A.Next = B.Next, then B.Next = nil. A plain traversal could miss C: it has passed A, and B no longer points to C. Recording the inserted/deleted pointer protects C. This is a possible interleaving in a model, not an observable Go trace.",
        "check": {
          "promptEN": "Why does B.Next = nil matter even though the new value is not a pointer to an object? Does a GC barrier make Move safe for concurrent callers?",
          "promptRU": "Почему важна запись B.Next = nil, хотя новое значение не указывает на объект? Делает ли GC-барьер Move безопасным для конкурентных вызовов?",
          "answerEN": "The deletion part protects the old target C. The barrier serves GC correctness; callers still need exclusive access or application synchronization.",
          "answerRU": "Deletion-часть защищает старую цель C. Барьер нужен для корректности GC; вызывающему коду всё ещё требуется исключительный доступ или своя синхронизация."
        },
        "boxes": [
          {
            "title": "1. До переноса → 2. После переноса",
            "rows": [
              {
                "k": "Было:",
                "v": "A (чёрный) → D; B (серый) → C (белый)",
                "hl": false
              },
              {
                "k": "A.Next = B.Next:",
                "v": "Теперь A → C; старая цель A — D",
                "hl": true
              },
              {
                "k": "B.Next = nil:",
                "v": "Теперь B → nil; старая цель B — C",
                "hl": true
              },
              {
                "k": "Без барьера:",
                "v": "A уже просмотрен, B больше не покажет C",
                "hl": true
              }
            ]
          },
          {
            "title": "3. Что защищает барьер",
            "rows": [
              {
                "k": "Deletion:",
                "v": "Учитывает старые цели D и C до перезаписи",
                "hl": true
              },
              {
                "k": "Insertion:",
                "v": "Учитывает новую цель C; nil не добавляет объект",
                "hl": true
              },
              {
                "k": "После обработки работы:",
                "v": "A чёрный; B, C, D ждут обхода или уже просмотрены; E остаётся белым",
                "hl": false
              },
              {
                "k": "Буферизация:",
                "v": "Учёт указателя не равен немедленному сканированию объекта",
                "hl": false
              }
            ]
          },
          {
            "title": "Граница механизма",
            "rows": [
              {
                "k": "Не только heap:",
                "v": "Запись heap-указателя в global тоже защищается",
                "hl": true
              },
              {
                "k": "Известный текущий стек:",
                "v": "Компилятор может убрать барьер; косвенный адрес может его сохранить",
                "hl": false
              },
              {
                "k": "Не mutex и не atomic:",
                "v": "Гонки приложения требуют отдельной синхронизации",
                "hl": true
              },
              {
                "k": "Вспомни без схемы:",
                "v": "A уже прошли → B ещё нет → связь переносится → C нельзя потерять",
                "hl": false
              }
            ]
          }
        ]
      },
      {
        "title": "4. Mark Termination (STW #2) и фоновая очистка (Concurrent Sweep)",
        "descEN": "After root jobs, scanning and buffered work are complete, runtime enters STW mark termination and disables the barrier when preparing sweep. In this model A, B, C and D are marked; E is not. Sweep reclaims E for reuse. D may have become unreachable in step 3, but its mark keeps it for this cycle: concurrent GC can retain floating garbage.",
        "check": {
          "promptEN": "With 100 MiB live heap, 20 MiB roots and GOGC=100, must GC start at 200 MiB?",
          "promptRU": "При 100 MiB живой кучи, 20 MiB корней и GOGC=100 обязан ли GC начаться на 200 MiB?",
          "answerEN": "No. The simplified goal is 220 MiB; the pacer starts marking earlier. A memory limit may lower the goal, but cannot guarantee that the process avoids OOM.",
          "answerRU": "Нет. Упрощённая цель — 220 MiB; pacer начинает разметку раньше. Лимит памяти может снизить цель, но не гарантирует отсутствие OOM процесса."
        },
        "desc": "После завершения заданий корней, обхода и обработки буферизованной работы runtime переходит в STW mark termination. При подготовке sweep барьер выключается. В нашей модели отмечены A, B, C, D; E не отмечен. Sweep освобождает его ячейку для повторного использования. D мог потерять достижимость на шаге 3, но уже отмечен и переживёт этот цикл: GC не обязан немедленно удалять всё ставшее ненужным.",
        "boxes": [
          {
            "title": "Завершение разметки → очистка",
            "rows": [
              {
                "k": "Фаза 3 (STW #2):",
                "v": "Завершение разметки и служебная работа, затем подготовка sweep",
                "hl": true
              },
              {
                "k": "Фаза 4 (Sweep):",
                "v": "Возврат неотмеченных ячеек фоново и при аллокациях",
                "hl": true
              },
              {
                "k": "Без compaction:",
                "v": "Живые объекты кучи не уплотняются; фрагментация всё же возможна",
                "hl": false
              }
            ]
          },
          {
            "title": "Итог этого цикла",
            "rows": [
              {
                "k": "E не отмечен:",
                "v": "Его ячейку можно переиспользовать после sweep",
                "hl": true
              },
              {
                "k": "A, B, C, D отмечены:",
                "v": "Переживают цикл; D уже мог стать недостижимым",
                "hl": false
              },
              {
                "k": "Следующий цикл:",
                "v": "Достижимость проверяется заново; отмечен ≠ нужен приложению навсегда",
                "hl": true
              }
            ]
          },
          {
            "title": "Расчёт следующей цели (GC Pacer)",
            "rows": [
              {
                "k": "При GOGC = 100:",
                "v": "Цель ≈ live + (live + roots); запуск раньше, не ровно при удвоении",
                "hl": false
              },
              {
                "k": "При GOMEMLIMIT:",
                "v": "Мягкий бюджет Sys − HeapReleased; не RSS и не защита от OOM",
                "hl": true
              },
              {
                "k": "Проверь на числах:",
                "v": "100 MiB live + 20 MiB roots, GOGC=100 → цель 220 MiB; C-память требует отдельного резерва",
                "hl": false
              },
              {
                "k": "Возврат памяти ОС:",
                "v": "Scavenger отдельно освобождает физическую память средствами ОС; падение RSS не гарантировано сразу",
                "hl": false
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 7: УСТРОЙСТВО MAP В GO (CLASSIC HMAP VS GO 1.24+ SWISSTABLES)
  // =========================================================================
  {
    "id": "sim7",
    "title": "Диаграмма 7: map — бакеты, поиск в Swiss Tables и память",
    "subtitle": "Пять шагов: старая схема → метаданные → поиск ключа → рост → удаление. Учебные состояния, не снимок реальных хешей и не обещание задержек.",
    "cardId": "c31",
    "cardLabel": "Карточка Q31 (SwissTables) →",
    "steps": [
      {
        "title": "1. До Swiss Tables: бакет → overflow → эвакуация",
        "desc": "В классической map, показанной по Go 1.17, младшие биты хеша выбирают основной бакет. Tophash отбирает кандидатов, затем сравниваются ключи. Если места не хватает, используются overflow-бакеты. Два основания роста нужно запоминать отдельно.",
        "descEN": "In the classic Go 1.17 map, low hash bits select a primary bucket. Tophash filters candidates before key equality. Overflow buckets provide more slots. Excess load and excess overflow are different reasons to rebuild.",
        "boxes": [
          {
            "title": "Путь поиска / Lookup path",
            "rows": [
              {
                "k": "① Hash → bucket",
                "v": "Младшие B бит → один из 2^B бакетов / low bits select a bucket",
                "hl": false
              },
              {
                "k": "② Tophash → key",
                "v": "8 отпечатков → сравнение ключей кандидатов / compare candidate keys",
                "hl": true
              },
              {
                "k": "③ Overflow",
                "v": "Не нашли → следующий бакет цепочки / follow the chain",
                "hl": false
              }
            ]
          },
          {
            "title": "Два повода перестроить / Two growth triggers",
            "rows": [
              {
                "k": "Много записей / load",
                "v": "Порог около 6.5 на бакет с минимальным числом записей → удвоение",
                "hl": true
              },
              {
                "k": "Много overflow",
                "v": "При допустимой загрузке → перестройка прежнего размера / same-size grow",
                "hl": true
              },
              {
                "k": "Эвакуация / evacuation",
                "v": "growWork переносит нужный бакет и может продвинуть ещё один; вместе с overflow-цепочками",
                "hl": false
              }
            ]
          },
          {
            "title": "Граница модели / Limits",
            "rows": [
              {
                "k": "Постепенно ≠ мгновенно",
                "v": "Перенос цепочек и выделение нового массива требуют времени / work still costs time",
                "hl": false
              },
              {
                "k": "&m[k] недопустимо",
                "v": "Это правило языка и для старых, и для новых map / language rule",
                "hl": false
              },
              {
                "k": "Конкурентные записи",
                "v": "Нужна синхронизация; runtime ловит не все гонки / synchronize shared writes",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does too much overflow always double the bucket count?",
          "promptRU": "Всегда ли избыток overflow удваивает число бакетов?",
          "answerEN": "No. With acceptable load, the classic implementation can rebuild at the same size.",
          "answerRU": "Нет. При допустимой загрузке классическая реализация может перестроить map прежнего размера."
        }
      },
      {
        "title": "2. Swiss group: отпечаток и три состояния слота",
        "desc": "У группы восемь управляющих байтов ctrl и восемь слотов ключ/значение. H2 — короткий отпечаток для отбора кандидатов, H1 задаёт пробирование. Байты метаданных можно проверять вместе, но ключи затем сравниваются отдельно.",
        "descEN": "A group contains eight control bytes and eight key/value slots. H2 is a short fingerprint used to filter candidates; H1 drives probing. Metadata can be matched together, but candidate keys must still be compared.",
        "boxes": [
          {
            "title": "Хеш / Hash",
            "rows": [
              {
                "k": "H2 = low 7 bits",
                "v": "Отпечаток в занятом ctrl / fingerprint in occupied control byte",
                "hl": true
              },
              {
                "k": "H1 = remaining bits",
                "v": "Пробирование групп; старшие биты выбирают таблицу / group probing and table selection",
                "hl": false
              },
              {
                "k": "57 + 7",
                "v": "Для 64-битного хеша, не универсально / for a 64-bit hash only",
                "hl": false
              }
            ]
          },
          {
            "title": "Три состояния / Three states",
            "rows": [
              {
                "k": "Full: 0xxxxxxx",
                "v": "Здесь ключ; H2 помогает выбрать кандидата / occupied, check candidate",
                "hl": true
              },
              {
                "k": "Empty: 0x80",
                "v": "После проверки кандидатов можно завершить поиск / stop after candidate checks",
                "hl": true
              },
              {
                "k": "Deleted: 0xFE",
                "v": "Запись удалена, путь поиска продолжается / preserve the probe path",
                "hl": true
              }
            ]
          },
          {
            "title": "Не перепутай / Distinguish",
            "rows": [
              {
                "k": "8 байтов ctrl",
                "v": "Это только метаданные, не все ключи и значения / metadata only",
                "hl": false
              },
              {
                "k": "SWAR / SIMD",
                "v": "Групповая проверка байтов; не весь поиск за один такт / grouped matching, not one-cycle lookup",
                "hl": false
              },
              {
                "k": "Совпало H2",
                "v": "Кандидат, а не доказательство равенства / candidate, not key equality",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Two keys have the same H2. Are they equal?",
          "promptRU": "У двух ключей одинаковый H2. Равны ли ключи?",
          "answerEN": "Not necessarily. Compare the keys themselves; fingerprints only reduce the number of comparisons.",
          "answerRU": "Не обязательно. Сравни сами ключи: отпечатки лишь сокращают число сравнений."
        }
      },
      {
        "title": "3. Ищем «go»: кандидаты → ключ → результат",
        "desc": "Условный пример: ищем «go» с выбранным H2 = 0x2A. В группе такой отпечаток есть у «rust» и «go». Empty не отменяет проверку кандидатов в этой же группе. Названия языков и отпечатки здесь учебные, не реальные значения хеш-функции Go.",
        "descEN": "Teaching example: look up “go” with a chosen H2 of 0x2A. Both “rust” and “go” have that fingerprint in this group. An empty slot does not bypass candidate checks in the same group. These are illustrative fingerprints, not actual Go hash values.",
        "boxes": [
          {
            "title": "Группа из 8 слотов / Eight-slot group",
            "rows": [
              {
                "k": "0 · H2 2A · rust",
                "v": "Кандидат: rust ≠ go / reject",
                "hl": true
              },
              {
                "k": "1 · H2 19 · c",
                "v": "Не кандидат по H2 / fingerprint differs",
                "hl": false
              },
              {
                "k": "2 · H2 2A · go",
                "v": "Кандидат: go = go → вернуть значение / return value",
                "hl": true
              },
              {
                "k": "3 · 80 · empty",
                "v": "Стоп только если ключ не найден / stop only after no match",
                "hl": false
              },
              {
                "k": "4 · H2 11 · js",
                "v": "Не кандидат по H2 / fingerprint differs",
                "hl": false
              },
              {
                "k": "5, 6, 7 · 80 · empty",
                "v": "Остальные три слота пусты / remaining slots empty",
                "hl": false
              }
            ]
          },
          {
            "title": "Три действия / Three actions",
            "rows": [
              {
                "k": "① Отобрать / filter",
                "v": "Сопоставить H2 с ctrl → кандидаты 0 и 2",
                "hl": false
              },
              {
                "k": "② Сравнить / compare",
                "v": "Проверить ключи: слот 0 не подходит, слот 2 подходит",
                "hl": true
              },
              {
                "k": "③ Решить / decide",
                "v": "Нашли → результат. Не нашли + empty → отсутствует. Иначе → следующая проба",
                "hl": false
              }
            ]
          },
          {
            "title": "Если совпадений ключа нет / No key matches",
            "rows": [
              {
                "k": "Есть empty",
                "v": "Ключ отсутствует / absent",
                "hl": false
              },
              {
                "k": "Только full/deleted",
                "v": "Продолжить квадратичное пробирование групп / continue quadratic probing",
                "hl": true
              },
              {
                "k": "Почему deleted нужен",
                "v": "За удалённым слотом могут быть ранее размещённые ключи / later keys remain reachable",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "If slot 2 stored “java” and all empty slots became deleted, could this group prove absence?",
          "promptRU": "Если в слоте 2 будет «java», а все empty станут deleted, докажет ли эта группа отсутствие ключа?",
          "answerEN": "No. After rejecting both candidate keys, probing must continue because the group has no empty slot. With an empty slot, the unsuccessful search could stop.",
          "answerRU": "Нет. После отклонения обоих кандидатов нужно продолжить пробирование: в группе нет empty. Если бы empty был, неуспешный поиск мог бы завершиться."
        }
      },
      {
        "title": "4. Рост: одна группа → таблица → split",
        "desc": "Малая map может использовать одну группу напрямую. Затем появляется таблица и директория. При нехватке места реализация может очистить ненужные tombstones; если этого мало, таблица растёт, а достигшая предела таблица делится. Директория тоже может потребовать увеличения.",
        "descEN": "A small map can use one group directly, then move to a table and directory. When insertion needs room, the runtime may prune unneeded tombstones. If necessary, a table grows or splits at its size limit; the directory may also grow.",
        "boxes": [
          {
            "title": "Масштаб / Scale",
            "rows": [
              {
                "k": "Одна малая группа",
                "v": "До 8 записей без директории; малый len не доказывает это представление / len alone is insufficient",
                "hl": false
              },
              {
                "k": "Таблица / table",
                "v": "Группы по 8, обычный лимит загрузки 7/8 с учётом tombstones",
                "hl": false
              },
              {
                "k": "Директория / directory",
                "v": "Ссылки на таблицы; это не режим только после 1024 ключей / not only above 1024 keys",
                "hl": false
              }
            ]
          },
          {
            "title": "Пример пути роста / Growth path",
            "rows": [
              {
                "k": "512 → 1024 слота",
                "v": "Если нужна перестройка, таблица удваивается / grow one table",
                "hl": true
              },
              {
                "k": "Предел 1024 слота",
                "v": "Следующая необходимая перестройка → split на две таблицы / split",
                "hl": true
              },
              {
                "k": "Directory may grow",
                "v": "Может удвоиться массив ссылок / pointer array may double",
                "hl": false
              }
            ]
          },
          {
            "title": "Что ограничено / What is bounded",
            "rows": [
              {
                "k": "1024",
                "v": "Слоты одной таблицы, не ключи всей map / slots per table, not map size",
                "hl": false
              },
              {
                "k": "Go 1.25 и 1.26",
                "v": "pruneTombstones есть в обеих версиях / present in both",
                "hl": false
              },
              {
                "k": "Задержки / latency",
                "v": "Нет гарантии O(1) для каждой вставки или фиксированного p99 / measure workload",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "At 7/8 load, must every table immediately split into two?",
          "promptRU": "Обязана ли любая таблица сразу разделиться при загрузке 7/8?",
          "answerEN": "No. Updating an existing key does not add an entry. An insertion may reuse or prune deleted slots; a table below the limit can grow before splitting is needed.",
          "answerRU": "Нет. Обновление существующего ключа не добавляет запись. Вставка может переиспользовать или очистить deleted-слоты; таблица меньше предела может сначала вырасти."
        }
      },
      {
        "title": "5. Память: запись ≠ таблица ≠ RSS",
        "desc": "delete убирает одну запись, clear — все записи в существующей map. Их данные могут стать недостижимыми, но хранилище таблицы не обязано уменьшиться. Замена переменной не очищает map, которую ещё удерживает alias. Это отдельный шаг, чтобы не смешивать поиск и владение памятью.",
        "descEN": "delete removes one entry; clear removes all entries from the existing map. Payloads may become unreachable while table storage stays allocated. Reassigning one variable does not clear a map still held by an alias. Keep lookup mechanics separate from ownership.",
        "boxes": [
          {
            "title": "① Запись / Entry",
            "rows": [
              {
                "k": "delete(m, k)",
                "v": "Убрать ключ и значение, если ключ найден / remove matching entry",
                "hl": false
              },
              {
                "k": "Данные / payload",
                "v": "GC возможен, если других ссылок нет / collectible without other references",
                "hl": true
              },
              {
                "k": "Deleted marker",
                "v": "Служебная метка не обязана удерживать удалённый объект / marker is not payload",
                "hl": false
              }
            ]
          },
          {
            "title": "② Таблица / Table storage",
            "rows": [
              {
                "k": "clear(m)",
                "v": "Очищает общую map, включая вид через alias / aliases observe it",
                "hl": false
              },
              {
                "k": "m = new map",
                "v": "Меняет только m; alias сохраняет старую map / alias retains old map",
                "hl": true
              },
              {
                "k": "Освобождение старой",
                "v": "После исчезновения всех ссылок; копирование значений поверхностное / shallow copy",
                "hl": false
              }
            ]
          },
          {
            "title": "③ Процесс / Process",
            "rows": [
              {
                "k": "len(m) == 0",
                "v": "Не означает нулевой памяти таблицы / does not imply zero table storage",
                "hl": false
              },
              {
                "k": "GC завершился",
                "v": "Не обещает немедленного падения RSS / RSS need not drop immediately",
                "hl": false
              },
              {
                "k": "Когда перестраивать",
                "v": "После профилирования, с согласованным владением / profile and coordinate access",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "After alias := m; m = nil, is the old map necessarily collectible?",
          "promptRU": "После alias := m; m = nil обязательно ли старая map доступна для GC?",
          "answerEN": "No. A still-live alias retains it. Deleting payload references, releasing the table, and reducing RSS are different events.",
          "answerRU": "Нет. Живая alias удерживает её. Удаление ссылок на данные, освобождение таблицы и снижение RSS — разные события."
        }
      }
    ],
    "versionNote": "Классическая схема: Go 1.17. Swiss Tables: Go 1.25.0 и 1.26.1. H2 и ключи в примере подобраны для объяснения; SIMD/SWAR не означает одну инструкцию на весь поиск. noswissmap доступен в 1.25, но переключатель удалён в 1.26.",
    "sources": [
      {
        "title": "Classic map — Go 1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/runtime/map.go"
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
      },
      {
        "title": "Experiments — Go 1.25.0",
        "url": "https://github.com/golang/go/blob/go1.25.0/src/internal/goexperiment/flags.go"
      },
      {
        "title": "Experiments — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/goexperiment/flags.go"
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
    markers: "Ожидающему читателю значение может передаваться напрямую через <code>sendDirect</code>. Сначала копирование, затем <code>goready</code>, позже продолжение получателя и освобождение <code>sudog</code>. Готовность не означает немедленного запуска.",
    cardId: "c17", simId: "sim3"
  },
  {
    topic: "7. Select: компилятор → runtime",
    how: "Пустой → <code>block</code>; только default → тело; одна операция → обычный send/recv; операция + default → <code>selectnb*</code>; несколько операций → <code>selectgo</code>.",
    markers: "В общем пути default задаёт <code>block=false</code>: опрос без регистрации ожидания. Без default обычный путь с парковкой использует два захвата набора каналов и CAS <code>selectDone</code>. <code>selected</code> и receive <code>ok</code> — разные флаги.",
    cardId: "c19", simId: "sim4"
  },
  {
    topic: "8. CAS: условное атомарное обновление",
    how: "<code>CAS(old, new)</code>: сравнить текущее значение с old и условно записать new одной атомарной операцией. Возвращает true/false; ожидание и повтор — отдельная политика.",
    markers: "На amd64 в проверенном пути — <code>LOCK CMPXCHG</code>; arm64 имеет другие пути. Атомарность одного значения не делает весь алгоритм атомарным. Детали Mutex — в карточке Q21.",
    cardId: "c20", simId: "sim5"
  },
  {
    topic: "9. Аллокатор (mcache) и Трёхцветный GC",
    how: "<code>mcache</code> текущего P → пополнение через <code>mcentral</code> → страницы <code>mheap</code>. Только свободная ячейка в кеше даёт быстрый путь без блокировки. <code>noscan</code> исключает обход указателей внутри данных, но не всю работу GC.",
    markers: "STW-переходы без гарантии микросекунд. <code>GOGC</code> задаёт heap goal, pacer начинает раньше. <code>GOMEMLIMIT</code> — мягкий бюджет <code>Sys − HeapReleased</code>, не защита от OOM; <code>Mark Assist</code> может увеличить задержки.",
    cardId: "c28", simId: "sim6"
  },
  {
    topic: "10. Мапы: Classic hmap vs SwissTables (Go 1.24+)",
    how: "В Go 1.25/1.26: группы по 8 слотов, <code>H2</code> отбирает кандидатов, затем сравниваются ключи. Таблицы растут до 1024 слотов, затем делятся; директория тоже может расти.",
    markers: "<strong>Отпечаток → ключ → stop/probe</strong>. Обычный лимит таблиц 7/8, у малой группы возможны 8 записей. <code>delete/clear</code> освобождают ссылки на данные, но не обещают сжатия таблицы или немедленного снижения RSS.",
    cardId: "c31", simId: "sim7"
  },
  {
    topic: "11. Интерфейсы (iface / eface) и Open-Coded Defer",
    how: "Интерфейс хранит динамический тип и значение; два слова в проверенной реализации. <code>defer</code>: сохранить функцию/аргументы → при выходе выполнить в обратном порядке. Реализация зависит от сборки.",
    markers: "Typed nil ≠ nil-интерфейс. Именованный результат задаётся до defer и может быть изменён им. <code>recover</code> действует в той же горутине. Ресурсы с defer в цикле ждут выхода из функции, а не конца итерации.",
    cardId: "c33", simId: null
  },
  {
    topic: "12. API Go 1.23–1.26: владение, тесты и диагностика",
    how: "<code>unique</code> и <code>iter</code> — 1.23; <code>weak</code>/<code>AddCleanup</code> — 1.24; стабильный <code>synctest</code>, <code>FlightRecorder</code> и container-aware defaults — 1.25. Контракты здесь применимы и к 1.26.",
    markers: "Ранний выход из <code>iter.Pull</code> требует <code>stop</code>. Cleanup не обещает срок; fake time требует durable blocking; явный GOMAXPROCS отключает автообновления; размер/возраст trace — не точная гарантия.",
    cardId: "c38", simId: "sim2"
  }
];
