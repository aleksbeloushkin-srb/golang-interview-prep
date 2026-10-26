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
    id: "sim4",
    title: "Диаграмма 4: Оператор select под капотом (pollorder, lockorder и атомарная гонка g.selectDone)",
    subtitle: "Учебная трасса получения из трёх разных небуферизованных каналов в Go 1.25/1.26. Адреса условные; показан один допустимый исход, без гарантии времени ожидания.",
    cardId: "c19",
    cardLabel: "Карточка Q19 (selectgo) →",
    steps: [
      {
        title: "1. Генерация pollorder (Shuffle) и lockorder (HeapSort)",
        desc: "Горутина G1 входит в select по 3 каналам: chA (0x3000), chB (0x1000), chC (0x2000). На стеке строятся два массива: случайный pollorder (без гарантии максимального времени ожидания) и отсортированный по адресам памяти lockorder (против AB-BA дедлока мьютексов).",
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
        desc: "Под блокировками, уже захваченными перед первым проходом, регистрируются 3 sudog через acquireSudog: по одному в recvq каждого канала. Они также связаны в G1.waiting. gopark(selparkcommit) отпускает блокировки при парковке; повторного захвата между опросом и регистрацией нет.",
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
              { k: "Гонка пробуждений:", v: "Операции могут конкурировать за одну G1", hl: false }
            ]
          }
        ]
      },
      {
        title: "3. Гонка пробуждений на 2 ядрах: CAS по флагу G1.selectDone",
        desc: "В этом сценарии W1 и W2 конкурируют за ожидающую G1. W1 первым выполняет успешный CAS selectDone (0 → 1), передаёт значение и делает G1 runnable. W2 извлекает sudog_A, проигрывает CAS и продолжает искать другого получателя. Выбор W1 здесь иллюстративный.",
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
              { k: "Результат CAS(0, 1):", v: "FALSE (другая операция уже забрала G1)", hl: true },
              { k: "Действие W2:", v: "Пропускает sudog_A, ищет другого читателя", hl: false },
              { k: "Безопасность стека G1:", v: "Двойная запись предотвращена!", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Проход 3: Пробуждение G1 и очистка лишних sudog",
        desc: "После возобновления G1 повторно захватывает каналы через sellock в порядке lockorder. Она удаляет оставшиеся регистрации: sudog_B ещё в очереди, а sudog_A в этом сценарии уже извлечён проигравшим W2. Затем releaseSudog освобождает все три записи, selunlock отпускает блокировки, и select возвращает case 2.",
        boxes: [
          {
            title: "Проснувшаяся горутина G1",
            rows: [
              { k: "Захват локов:", v: "sellock по lockorder (chB → chC → chA)", hl: false },
              { k: "Победившая ветка:", v: "case 2 (определена по G1.param == sudog_C)", hl: true },
              { k: "Кеш P.sudogcache:", v: "Все 3 sudog возвращены через releaseSudog", hl: true }
            ]
          },
          {
            title: "Очистка очередей каналов (dequeueSudoG)",
            rows: [
              { k: "chB.recvq (0x1000):", v: "sudog_B вырезан из двусвязного списка!", hl: true },
              { k: "chC.recvq (0x2000):", v: "Уже извлечён писателем W1", hl: false },
              { k: "chA.recvq (0x3000):", v: "Уже извлечён W2; удалять повторно не нужно", hl: true }
            ]
          },
          {
            title: "Завершение selectgo",
            rows: [
              { k: "Отпускание локов:", v: "selunlock в обратном порядке", hl: false },
              { k: "Возврат из selectgo:", v: "return casi = 2, recvOK = true", hl: true },
              { k: "Накладные расходы:", v: "2 захвата набора каналов: опрос/регистрация и очистка", hl: false }
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
  },
  // =========================================================================
  // ДИАГРАММА 7: УСТРОЙСТВО MAP В GO (CLASSIC HMAP VS GO 1.24+ SWISSTABLES)
  // =========================================================================
  {
    id: "sim7",
    title: "Диаграмма 7: Устройство map в Go — Классическая hmap против новой SwissTable (Go 1.24–1.25+)",
    subtitle: "От бакетов bmap с цепочками overflow и инкрементальной эвакуацией к группам SwissTable с 64-битной маской ctrl, H1/H2 хешем и SIMD/SWAR-поиском за 1 такт.",
    cardId: "c31",
    cardLabel: "Карточка Q31 (SwissTables) →",
    steps: [
      {
        title: "1. Классическая мапа (до Go 1.24): bmap[8], tophash и overflow",
        desc: "В классической hmap младшие B бит хеша выбирают бакет (bmap на 8 ключей и 8 значений). Старшие 8 бит сравниваются в цикле с массивом tophash[8]. При коллизиях аллоцируются дополнительные overflow-бакеты по указателю, а при заполнении > 6.5 (81%) начинается инкрементальная эвакуация.",
        boxes: [
          {
            title: "Структура бакета bmap (8 слотов)",
            rows: [
              { k: "tophash [8]uint8:", v: "Старшие 8 бит хеша (проверка в цикле)", hl: false },
              { k: "Упаковка в памяти:", v: "8 ключей подряд, затем 8 значений подряд", hl: true },
              { k: "Указатель overflow:", v: "Цепочка дополнительных bmap в хипе", hl: true }
            ]
          },
          {
            title: "Минусы классической схемы",
            rows: [
              { k: "Поиск в бакете:", v: "Последовательный обход 8 байт tophash", hl: false },
              { k: "Overflow-цепочки:", v: "Лишние аллокации и промахи L1 кеша (Pointer Chasing)", hl: true },
              { k: "Max Load Factor:", v: "6.5 / 8 = 81.25% (дальше удвоение всей мапы)", hl: false }
            ]
          },
          {
            title: "Инкрементальная эвакуация",
            rows: [
              { k: "При росте (2^B → 2^(B+1)):", v: "Старый массив хранится в hmap.oldbuckets", hl: false },
              { k: "На каждый write/delete:", v: "Переносится по 1–2 бакета в новые X/Y бакеты", hl: true },
              { k: "Конкурентная запись:", v: "Флаг hashWriting → fatal error (не ловится recover!)", hl: false }
            ]
          }
        ]
      },
      {
        title: "2. Новая мапа SwissTable (Go 1.24+): H1/H2 хеш и Группа с 64-битным ctrl",
        desc: "В SwissTable 64-битный хеш ключа делится на H1 (старшие 57 бит — выбор группы) и H2 (младшие 7 бит — отпечаток ключа). Каждая группа содержит 8 пар {key, elem} и одно 64-битное управляющее слово ctrl (по 1 байту метаданных на каждый из 8 слотов). Никаких указателей overflow больше нет!",
        boxes: [
          {
            title: "Разбиение 64-битного хеша ключа",
            rows: [
              { k: "H1 (старшие 57 бит):", v: "Выбирает подтаблицу и стартовую группу", hl: true },
              { k: "H2 (младшие 7 бит):", v: "Хранится прямо в байте ctrl[i] (0b0xxxxxxx)", hl: true },
              { k: "Вероятность ложного совпадения:", v: "Всего 1 / 128 (0.78%)!", hl: false }
            ]
          },
          {
            title: "Управляющее слово ctrl (uint64 = 8 байт)",
            rows: [
              { k: "Пустой слот (Empty):", v: "0b10000000 (0x80) — старший бит = 1", hl: true },
              { k: "Удалённый (Deleted):", v: "0b11111110 (0xFE) — Tombstone (могильный камень)", hl: true },
              { k: "Занятый слот (Full):", v: "0b0xxxxxxx — старший бит 0 + 7 бит хеша H2", hl: true }
            ]
          },
          {
            title: "Преимущества в кэше процессора",
            rows: [
              { k: "Локальность L1 Cache:", v: "Все 8 мета-байт ctrl лежат в одном регистре uint64", hl: true },
              { k: "Overflow-указатели:", v: "ОТСУТСТВУЮТ (открытая адресация / probing)", hl: false },
              { k: "Max Load Factor:", v: "7 / 8 = 87.5% (экономия памяти!)", hl: true }
            ]
          }
        ]
      },
      {
        title: "3. Магия SIMD / SWAR: параллельная проверка всех 8 слотов за 1 операцию!",
        desc: "Чтобы найти ключ в группе SwissTable, процессор НЕ крутит цикл из 8 итераций! Он размножает 7-битный хеш H2 на все 8 байт 64-битного регистра (0x0101010101010101 * H2) и за ОДНУ побитовую операцию (SWAR / SIMD) сравнивает его со словом ctrl, сразу получая битовую маску совпавших слотов!",
        boxes: [
          {
            title: "Побитовый поиск в 64-битном регистре (SWAR)",
            rows: [
              { k: "Шаг 1 (Broadcast H2):", v: "Тиражируем ищем. H2 (например, 0x2A) в 8 байт uint64", hl: true },
              { k: "Шаг 2 (XOR с ctrl):", v: "В совпавших байтах получаются нули 0x00!", hl: true },
              { k: "Шаг 3 (Bitmask + TrailingZeros):", v: "Инструкция CTZ сразу даёт индекс слота (0..7)!", hl: true }
            ]
          },
          {
            title: "Что если в группе слот не найден?",
            rows: [
              { k: "Проверка Empty (0x80):", v: "Маска пустых слотов тоже находится за 1 такт", hl: true },
              { k: "Если есть Empty (0x80):", v: "Ключа в мапе 100% нет → мгновенный выход!", hl: true },
              { k: "Если все 8 слотов Full/Deleted:", v: "Шагаем к следующей группе в том же массиве", hl: false }
            ]
          },
          {
            title: "Выигрыш в производительности",
            rows: [
              { k: "Ускорение чтения/записи:", v: "На 30–60% быстрее классической hmap", hl: true },
              { k: "Предсказатель переходов CPU:", v: "Нет ветвлений (branchless) при поиске в группе", hl: false },
              { k: "Удаление delete(m, k):", v: "Ставит Empty (если есть пустые) или Tombstone 0xFE", hl: false }
            ]
          }
        ]
      },
      {
        title: "4. Масштабирование без фризов: Extendible Hashing (Директория подтаблиц по 1024)",
        desc: "В обычной SwissTable (C++ abseil) при росте приходится рехешировать ВСЮ таблицу целиком, что в Go вызвало бы паузы на миллионах ключей. Поэтому в Go 1.24+ применили Extendible Hashing: большая мапа состоит из директории указателей на независимые таблицы максимум по 1024 элемента! При переполнении делится ТОЛЬКО одна 1024-элементная подтаблица!",
        boxes: [
          {
            title: "Архитектура большой SwissMap в Go",
            rows: [
              { k: "Маленькая мапа (<= 8 ключей):", v: "Всего 1 группа напрямую без директории!", hl: false },
              { k: "Большая мапа (> 1024 ключей):", v: "Директория dirPtr → массив независимых Table", hl: true },
              { k: "Лимит одной Table:", v: "Максимум 1024 слота (128 групп по 8)", hl: true }
            ]
          },
          {
            title: "Локальный сплит (Split вместо полного Rehash)",
            rows: [
              { k: "Когда Table заполнена на 7/8:", v: "Рехешируется ТОЛЬКО эта таблица из 1024 элементов!", hl: true },
              { k: "Как она делится:", v: "Раздваивается на две новые Table (Left и Right)", hl: true },
              { k: "Латентность вставки (p99):", v: "Строгий O(1) — максимум 1024 ключа за один сплит!", hl: true }
            ]
          },
          {
            title: "Важное правило для продакшена",
            rows: [
              { k: "Сжимается ли директория при delete?:", v: "НЕТ! Мапа по-прежнему не отдаёт память назад", hl: true },
              { k: "Как освободить память пиковой мапы:", v: "Создать новую мапу и скопировать живые ключи", hl: false },
              { k: "Флаг отката (если нужен старый код):", v: "GOEXPERIMENT=noswissmap при компиляции", hl: false }
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
    markers: "Ожидающему читателю значение может передаваться напрямую через <code>sendDirect</code>. Сначала копирование, затем <code>goready</code>, позже продолжение получателя и освобождение <code>sudog</code>. Готовность не означает немедленного запуска.",
    cardId: "c17", simId: "sim3"
  },
  {
    topic: "7. Оператор select (runtime.selectgo)",
    how: "Массивы <code>pollorder</code> и <code>lockorder</code> на стеке. Подписка через цепочку <code>g.waiting</code> из <code>sudog</code> с флагом <code>isSelect = true</code>.",
    markers: "<code>pollorder</code> — случайный опрос без гарантии срока ожидания. <code>lockorder</code> — согласованный порядок блокировок. В обычном блокирующем пути Go 1.25/1.26: два захвата набора каналов, арбитраж через <code>selectDone.CompareAndSwap(0, 1)</code>.",
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
    how: "Классы размеров <code>mspan</code> (<code>scan</code> vs <code>noscan</code>) в локальном <code>P.mcache</code> без локов. Конкурентный <strong>трёхцветный Mark-and-Sweep GC</strong> с <strong>Hybrid Write Barrier</strong>.",
    markers: "2 паузы STW (&lt;100 мкс), до 25% CPU на разметку + <code>Mark Assist</code>, управляется <strong><code>GOGC=100</code></strong> и <strong><code>GOMEMLIMIT</code></strong>.",
    cardId: "c28", simId: "sim6"
  },
  ,
  {
    topic: "10. Мапы: Classic hmap vs SwissTables (Go 1.24+)",
    how: "В Go 1.24+ группы по 8 слотов с 64-битным словом метаданных <code>ctrl</code> (7-битный хеш <code>H2</code>) + директория подтаблиц по 1024 элемента (Extendible Hashing).",
    markers: "Параллельный поиск 8 слотов за <strong>1 побитовую операцию (SWAR/SIMD)</strong>. Заполнение до <strong>87.5% (7/8)</strong>. При <code>delete</code> память НЕ сжимается.",
    cardId: "c31", simId: "sim7"
  },
  {
    topic: "11. Интерфейсы (iface / eface) и Open-Coded Defer",
    how: "16 байт: <code>eface{_type, data}</code> и <code>iface{tab *itab, data}</code>. Одиночные <code>defer</code> инлайнятся в эпилог функции через битовую маску <code>deferBits</code> на стеке.",
    markers: "Интерфейс <code>== nil</code> только если <strong>оба слова равны nil</strong>. <code>defer</code> в цикле <code>for</code> аллоцируется в хипе и течёт до выхода из функции.",
    cardId: "c33", simId: null
  },
  {
    topic: "12. Новинки Go 1.24–1.25+ (weak, unique, synctest, coro)",
    how: "<code>weak.Pointer</code> + <code>runtime.AddCleanup</code> (вместо <code>SetFinalizer</code>), корутины <code>runtime.coro</code> для <code>iter.Pull</code> и нативный <code>GOMAXPROCS</code> по cgroups v2.",
    markers: "<code>coroswitch</code> переключает <code>G1 ↔ G2</code> за ~25 нс в обход очередей <code>P</code>. <code>FlightRecorder</code> пишет кольцевой трейс последних секунд.",
    cardId: "c38", simId: "sim2"
  }
];
