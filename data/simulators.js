const SIMULATORS = [
  // =========================================================================
  // ДИАГРАММА 1: РОЖДЕНИЕ ГОРУТИНЫ, СЛОТ RUNNEXT И РЕГИСТРЫ CPU (GOGO)
  // =========================================================================
  {
    "id": "sim1",
    "title": "Диаграмма 1: Кто выполняется, где стек, откуда продолжить",
    "subtitle": "Шесть шагов: аргументы → G и стек → сохранённый контекст → очередь → исполнение → завершение. Модель Go 1.26.1/amd64; адреса символические, скорость не измеряется.",
    "cardId": "c6",
    "cardLabel": "Q6: регистры простыми словами →",
    "learningHint": "Кто — текущая G (R14); где стек — адрес RSP; откуда продолжить — PC, загружаемый в поток инструкций. R14 на g0 и M.curg — не одно и то же: системный стек обслуживает пользовательскую G. На arm64 имена и соглашения другие.",
    "boardLegend": "M1 — поток ОС с процессором P1; R14 — какая G сейчас текущая, RSP — чей стек, RIP — какой код. Рамка и слово «изменилось» отмечают то, что поменялось на этом шаге.",
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
      },
      {
        "title": "Go specification: go statements",
        "url": "https://go.dev/ref/spec#Go_statements"
      },
      {
        "title": "go1.26.1: runtime/stack.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go"
      }
    ],
    "steps": [
      {
        "title": "1. Сначала вычислить аргументы",
        "desc": "G1 выполняет go doWork(n): значение функции и аргументы вычисляются в G1. Затем новая G2 выполнит сам вызов. В показанном примере передаётся копия int; чтение изменяемого n внутри замыкания было бы другой программой.",
        "descEN": "G1 evaluates the function and arguments of go doWork(n). G2 will execute the call later. Passing an int value is different from closing over mutable n.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "RSP · стек",
                    "items": [
                      "стек G1"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "Будущий вызов",
                "slots": [
                  {
                    "label": "Что запустить",
                    "items": [
                      {
                        "g": "doWork(1)",
                        "flag": "копия n"
                      }
                    ]
                  }
                ],
                "note": "G2 ещё не существует."
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": [
                      "G5"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G1 вычисляет doWork и аргумент n: в вызов уйдёт копия 1",
                "Само тело doWork пока не выполняется"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Сейчас работает G1",
            "rows": [
              {
                "k": "R14 · кто",
                "v": "G1",
                "hl": true
              },
              {
                "k": "RSP · где стек",
                "v": "Адрес в стеке G1",
                "hl": true
              },
              {
                "k": "n",
                "v": "1",
                "hl": false
              }
            ]
          },
          {
            "title": "Что получает будущий вызов",
            "rows": [
              {
                "k": "Аргумент int",
                "v": "Копия значения 1",
                "hl": true
              },
              {
                "k": "Тело doWork",
                "v": "Ещё не выполняется",
                "hl": false
              },
              {
                "k": "Порядок",
                "v": "Вычислить → запустить конкурентно",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "If G1 changes n afterwards, which value does G2 receive, and what changes with a pointer argument?",
          "promptRU": "Если G1 затем изменит n, какое значение получит G2 и что изменится при передаче указателя?",
          "answerEN": "The value evaluated in G1 at the go statement; later changes to n do not affect it. A pointer argument would copy the pointer, not the pointed-to data.",
          "answerRU": "Значение, вычисленное в G1 при выполнении оператора go; последующие изменения n на него не влияют. При передаче указателя копируется указатель, а не данные по нему."
        }
      },
      {
        "title": "2. Подготовить G2",
        "desc": "После вычисления аргументов runtime переходит на системный стек g0 и подготавливает G2: переиспользует доступную структуру либо создаёт новую. Нужен пригодный стек; 2 КиБ — базовый минимум реализации, а не неизменный размер каждой горутины. M.curg при этом обозначает обслуживаемую пользовательскую G1, тогда как текущая G на системном стеке — g0.",
        "descEN": "After evaluating arguments, the runtime prepares G2 on g0, reusing or allocating its state and a suitable stack. The 2 KiB baseline is not every goroutine’s fixed size. M.curg still identifies the user G1 being serviced, while the current G on the system stack is g0.",
        "board": [
          {
            "hl": [
              "g0",
              "G2"
            ],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      {
                        "g": "g0",
                        "flag": "системный стек"
                      }
                    ]
                  },
                  {
                    "label": "M.curg",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "RIP · код",
                    "items": [
                      "newproc1"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "state": "подготовка",
                "slots": [
                  {
                    "label": "Структура",
                    "items": [
                      {
                        "g": "G2",
                        "flag": "из пула или новая"
                      }
                    ]
                  },
                  {
                    "label": "Стек",
                    "items": [
                      "новая — 2 КиБ (Linux/amd64); из пула — адаптивный размер, не меньше 2 КиБ"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": [
                      "G5"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Переход на системный стек: R14 = g0, а M.curg по-прежнему G1",
                "G2: свободная структура из пула (gfget) или новая (malg)"
              ]
            }
          }
        ],
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
        ],
        "check": {
          "promptEN": "What is g0, and which goroutine is the new one here?",
          "promptRU": "Что такое g0 и какая горутина здесь новая?",
          "answerEN": "g0 is the thread’s system-stack goroutine; it is not created per go statement. G2 is the new user goroutine.",
          "answerRU": "g0 — системная горутина потока; она не создаётся для каждого оператора go. Новая пользовательская горутина здесь — G2."
        }
      },
      {
        "title": "3. Сохранить стартовый контекст",
        "desc": "В G2.sched подготавливаются SP, PC обёртки, которую компилятор создал для go doWork(n), и контекст с копией n; обёртка вызовет doWork. На amd64 создаётся путь возврата через goexit после завершения функции. Это сохранённые данные будущего запуска; активные регистры пока обслуживают runtime на g0.",
        "descEN": "G2 receives saved start state: its stack position, the entry PC of the compiler-generated wrapper for go doWork(n), and a context holding the copy of n; the wrapper calls doWork. The amd64 return path leads to goexit. Saved state in memory is different from registers currently running the runtime.",
        "board": [
          {
            "hl": [
              "обёртка go-вызова",
              "замыкание с копией n",
              "goexit"
            ],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      "g0"
                    ]
                  },
                  {
                    "label": "RIP · код",
                    "items": [
                      "подготовка G2"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "state": "подготовка",
                "slots": [
                  {
                    "label": "sched.sp",
                    "items": [
                      "вершина стека G2"
                    ]
                  },
                  {
                    "label": "sched.pc",
                    "items": [
                      "обёртка go-вызова"
                    ]
                  },
                  {
                    "label": "sched.ctxt",
                    "items": [
                      "замыкание с копией n"
                    ]
                  },
                  {
                    "label": "Возврат",
                    "items": [
                      "goexit"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": [
                      "G5"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "В G2.sched записаны sp, pc обёртки, которую компилятор создал для go doWork(n), и ctxt — замыкание с копией n",
                "Обёртка вызовет doWork; после её возврата управление уйдёт в goexit",
                "Это данные будущего запуска: регистры CPU всё ещё работают на g0"
              ]
            }
          }
        ],
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
                "v": "Точка входа обёртки, которая вызовет doWork",
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
        "title": "4. Сделать G2 доступной планировщику",
        "desc": "После подготовки G2 становится runnable. Показан путь постановки через runqput с предпочтением runnext: прежний элемент этого слота может перейти в обычную очередь. Это готовность к запуску, без обещания немедленного выполнения или горячего кеша.",
        "descEN": "G2 becomes runnable and is queued. The illustrated path requests runnext placement, potentially displacing the previous entry. This does not promise when or on which CPU G2 will execute.",
        "predict": {
          "promptEN": "G2 is placed into runnext of P1, which already holds G5. Where does G5 go, and does G2 start running right away?",
          "promptRU": "G2 ставят в runnext P1, где уже лежит G5. Куда денется G5 и запустится ли G2 сразу?"
        },
        "board": [
          {
            "hl": [
              "G2",
              "G5"
            ],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      "g0"
                    ]
                  },
                  {
                    "label": "RIP · код",
                    "items": [
                      "runqput"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": [
                      {
                        "g": "G2",
                        "flag": "runnable"
                      }
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3",
                      "G5"
                    ],
                    "queue": true
                  }
                ],
                "note": "Без sysmon (wasm) runnext не используется; в сборках с -race рантайм случайно, с вероятностью 1/2, ставит G в обычную очередь."
              }
            ],
            "list": {
              "items": [
                "G2 → runnext P1 (runqput с next = true)",
                "G5 — прежний кандидат: runnext → хвост runq",
                "G2 готова, но ещё не исполняется"
              ]
            }
          }
        ],
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
                "v": "Позднейшее решение планировщика, не обязательно ближайшее",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "What does the runnable state tell G1 about G2’s completion?",
          "promptRU": "Что состояние runnable говорит G1 о завершении G2?",
          "answerEN": "Nothing: runnable is eligibility for execution. Use explicit synchronization to wait for completion.",
          "answerRU": "Ничего: runnable означает готовность исполняться. Чтобы дождаться завершения, нужна явная синхронизация."
        }
      },
      {
        "title": "5. Восстановить и перейти",
        "desc": "Когда планировщик выбирает G2, execute переводит её в running, а gogo восстанавливает контекст: текущую G, SP, BP и контекст замыкания, затем переходит к saved PC. JMP меняет поток исполнения; RSP теперь указывает в стек G2. Показаны ключевые действия, не полный листинг.",
        "descEN": "When G2 is selected, execute marks it running and gogo restores its continuation. The stack pointer now addresses G2’s stack, and a jump transfers execution to its saved PC. More runtime bookkeeping is omitted.",
        "board": [
          {
            "hl": [
              "G2"
            ],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "RSP · стек",
                    "items": [
                      "стек G2"
                    ]
                  },
                  {
                    "label": "RIP · код",
                    "items": [
                      "обёртка → doWork"
                    ]
                  }
                ],
                "note": "Когда и почему P1 освободился для G2, в примере не показано."
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": []
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3",
                      "G5"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "execute: G2 runnable → running",
                "gogo: R14 = G2, RSP → стек G2, переход (JMP) на сохранённый pc — обёртку, которая вызывает doWork"
              ]
            }
          }
        ],
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
                "v": "Обёртка go-вызова, затем doWork",
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
        "title": "6. Завершить G2",
        "desc": "После возврата doWork путь goexit вызывает mcall(goexit0). Выполнение переходит на g0; runtime завершает G2 и возвращается к планированию. Структура G может переиспользоваться; сохранение её стека зависит от размера и политики runtime.",
        "descEN": "After doWork returns, goexit reaches mcall(goexit0) and system-stack cleanup. G2 finishes; its state may be reused. Retaining its stack is a separate runtime policy decision.",
        "predict": {
          "promptEN": "doWork has returned. What happens to the G2 structure and its stack, and what does M1 run next?",
          "promptRU": "doWork вернулась. Что станет со структурой G2 и её стеком и чем займётся M1?"
        },
        "board": [
          {
            "hl": [
              "G2",
              "g0"
            ],
            "lanes": [
              {
                "kind": "m",
                "title": "M1",
                "tag": "поток, P1",
                "slots": [
                  {
                    "label": "R14 · кто",
                    "items": [
                      "g0"
                    ]
                  },
                  {
                    "label": "RIP · код",
                    "items": [
                      "goexit0 → schedule"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "state": "_Gdead",
                "slots": [
                  {
                    "label": "Структура",
                    "items": [
                      {
                        "g": "G2",
                        "flag": "в пул свободных G"
                      }
                    ]
                  },
                  {
                    "label": "Стек",
                    "items": [
                      "сохранён или освобождён"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P1",
                "slots": [
                  {
                    "label": "runnext",
                    "items": []
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3",
                      "G5"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "doWork вернулась в обёртку → goexit → goexit1 → mcall(goexit0): переход на g0",
                "G2 получает _Gdead; структура идёт в пул, стек — по политике рантайма",
                "M1 на g0 ищет следующую G (schedule)"
              ]
            }
          }
        ],
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
        ],
        "check": {
          "promptEN": "Does returning from doWork guarantee that its stack pages immediately leave RSS?",
          "promptRU": "Гарантирует ли возврат из doWork немедленное удаление страниц её стека из RSS?",
          "answerEN": "No. G reuse, stack retention, span reuse and returning pages to the OS are separate decisions.",
          "answerRU": "Нет. Переиспользование G, сохранение стека, повторное использование спана и возврат страниц ОС — разные решения."
        }
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 2: ПЛАНИРОВЩИК GMP, ВЫТЕСНЕНИЕ (SYSMON) И WORK STEALING
  // =========================================================================
  {
    "id": "sim2",
    "title": "Диаграмма 2: Очереди, вытеснение, перехват работы и ожидание",
    "subtitle": "Одиннадцать учебных кадров, не единая трасса программы. Шаги 2–3 и 4–5 — пары «до → после»; syscall, сеть и GOMAXPROCS — отдельные сценарии; шаг 10 — вся картина и ответ за минуту, шаг 11 — пять частых вопросов и где упрощают. Go 1.26.1 с явным сравнением 1.25.",
    "cardId": "c9",
    "cardLabel": "Q9: поиск и перехват работы →",
    "steps": [
      {
        "title": "1. Несколько источников работы",
        "desc": "P — ресурсы рантайма, M — поток ОС, G — горутина. В findRunnable есть проверки GC, таймеров и другой служебной работы, поэтому это не простая неизменная очередь приоритетов. При schedtick % 61 == 0 и наблюдаемой непустой GRQ рантайм пробует взять глобальную работу для справедливости. Тик не равен миллисекунде; runnext может его наследовать.",
        "descEN": "G is a goroutine, M an OS thread and P the resources needed to run user Go code. The scheduler has several work sources and special runtime work. A schedtick % 61 check can favor global work, but it is not a wall-clock interval or a complete priority contract.",
        "board": [
          {
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "runnext",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3",
                      "G4"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "grq",
                "title": "Глобальная очередь (GRQ)",
                "slots": [
                  {
                    "label": "голова →",
                    "items": [
                      "G5",
                      "G6"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "timer",
                "title": "Таймеры P1",
                "slots": [
                  {
                    "label": "Срок истёк",
                    "items": [
                      "G7"
                    ]
                  }
                ],
                "note": "Сработавший таймер вызывает свою функцию: для time.Sleep она делает спящую G готовой (в runnext P, запустившего таймер); канальный таймер отправляет значение, AfterFunc запускает новую G."
              },
              {
                "kind": "netpoll",
                "title": "netpoller",
                "slots": [
                  {
                    "label": "Готовы после I/O",
                    "items": [
                      "G8"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P2",
                "tag": "M2",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G9"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G10",
                      "G11"
                    ],
                    "queue": true
                  }
                ],
                "note": "Очередь другого P — источник для перехвата."
              }
            ],
            "list": {
              "title": "Где P1 ищет следующую G (findRunnable, Go 1.26.1, упрощённо)",
              "ordered": true,
              "items": [
                "Таймеры P1: запустить сработавшие (например, разбудить G после time.Sleep)",
                "Служебная работа рантайма, например воркер GC",
                "Раз в 61 тик планировщика — GRQ, если она не пуста (справедливость)",
                "runnext, затем runq P1",
                "GRQ",
                "netpoller без ожидания",
                "Перехват у других P"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Источники / Work sources",
            "rows": [
              {
                "k": "Локально",
                "v": "runnext + обычная runq",
                "hl": false
              },
              {
                "k": "Общее",
                "v": "Готовые G в GRQ",
                "hl": false
              },
              {
                "k": "События",
                "v": "Сеть, таймеры, работа других P",
                "hl": false
              }
            ]
          },
          {
            "title": "Проверка справедливости",
            "rows": [
              {
                "k": "Условие",
                "v": "schedtick % 61 == 0 и GRQ не пуста",
                "hl": true
              },
              {
                "k": "Действие",
                "v": "Попытка получить глобальную G",
                "hl": true
              },
              {
                "k": "Не следует",
                "v": "Ровно через 61 мс / 61 горутину",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does a long chain of runnext executions necessarily advance schedtick each time?",
          "promptRU": "Обязательно ли длинная цепочка runnext увеличивает schedtick каждый раз?",
          "answerEN": "No. Inheriting the time slice can keep the same tick; sysmon also helps fairness.",
          "answerRU": "Нет. При наследовании кванта тик может сохраняться; справедливости также помогает sysmon."
        }
      },
      {
        "title": "2. Запросить вытеснение — ещё не переключить",
        "desc": "Отдельный сценарий: G1 исполняется на M1 с P1. Sysmon наблюдает неизменный schedtick; порог forcePreemptNS равен 10 мс в проверенной реализации. Он запрашивает вытеснение. На поддерживаемом Unix-пути используется SIGURG, но точная задержка и успешность этой попытки не гарантированы.",
        "descEN": "In this scenario G1 runs on M1 with P1. Sysmon observes an unchanged scheduling tick and can request preemption using the checked 10 ms threshold. Supported Unix paths use SIGURG. Issuing a request does not mean execution has already switched.",
        "board": [
          {
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "вытеснение запрошено"
                      }
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G2",
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "sysmon",
                "title": "sysmon",
                "tag": "поток без P",
                "slots": [],
                "note": "Видит, что schedtick P1 не менялся ≥ 10 мс, и вызывает preemptone для P1: запрос вытеснения его текущей G (G1)."
              }
            ],
            "list": {
              "items": [
                "sysmon → G1: запрос вытеснения (флаг preempt и stackguard0 = stackPreempt)",
                "sysmon → M1: сигнал SIGURG на поддерживаемом Unix-пути",
                "G1 всё ещё исполняется: запрос ещё не переключение"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "До безопасного переключения",
            "rows": [
              {
                "k": "M1 + P1",
                "v": "Обслуживают G1",
                "hl": false
              },
              {
                "k": "G1",
                "v": "Ещё может исполняться",
                "hl": true
              },
              {
                "k": "Другие G",
                "v": "Не получают гарантию запуска через 10 мс",
                "hl": false
              }
            ]
          },
          {
            "title": "Сигнал / Request",
            "rows": [
              {
                "k": "sysmon",
                "v": "Запросить вытеснение",
                "hl": true
              },
              {
                "k": "Unix",
                "v": "SIGURG — механизм, не квант времени",
                "hl": false
              },
              {
                "k": "Если точка небезопасна",
                "v": "Отложить / повторить",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does receiving SIGURG automatically make every instruction safe to preempt?",
          "promptRU": "Делает ли получение SIGURG любую инструкцию безопасной для вытеснения?",
          "answerEN": "No. The runtime checks whether the interrupted point is safe.",
          "answerRU": "Нет. Рантайм проверяет безопасность прерванной точки."
        }
      },
      {
        "title": "3. Безопасная точка → сохранение → планировщик",
        "desc": "Продолжение шага 2: обработчик обнаружил допустимую точку и подготовил возврат через asyncPreempt. После возобновления этот путь сохраняет регистры и входит в планировщик. В обычном пути уступки G1 становится runnable; следующий выбор зависит от доступной работы. Это не отменяет G1 и не снимает её блокировки.",
        "descEN": "Continuing step 2, the handler found a safe point and arranged asyncPreempt on resumption. That path saves registers and enters the scheduler. In the ordinary yield path G1 becomes runnable; the next selection depends on available work. Preemption neither cancels G1 nor releases its locks.",
        "predict": {
          "promptEN": "G1 has been preempted at a safe point. Where does it go after an ordinary preemption in Go 1.26.1, and what happens to a mutex it holds?",
          "promptRU": "G1 вытеснили в безопасной точке. Куда она попадёт при обычном вытеснении в Go 1.26.1 и что будет с мьютексом, который она держит?"
        },
        "board": [
          {
            "hl": [
              "G1",
              "G2"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      {
                        "g": "G2",
                        "flag": "пример выбора"
                      }
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "grq",
                "title": "Глобальная очередь (GRQ)",
                "slots": [
                  {
                    "label": "голова →",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "runnable"
                      }
                    ],
                    "queue": true
                  }
                ],
                "note": "Go 1.26.1: если вытеснение совпало с остановкой мира (STW — для GC или по другой причине), gopreempt_m кладёт G1 в runnext P1; в Go 1.25 этот путь всегда ведёт в GRQ."
              }
            ],
            "list": {
              "items": [
                "G1: исполнение → GRQ (asyncPreempt → gopreempt_m → globrunqput)",
                "G2: runq P1 → исполнение — один из возможных выборов планировщика",
                "Незавершённая операция и мьютексы остаются за G1"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Переход / Transition",
            "rows": [
              {
                "k": "1. Обработчик",
                "v": "Проверить точку и изменить контекст",
                "hl": false
              },
              {
                "k": "2. После возврата",
                "v": "asyncPreempt: сохранить регистры",
                "hl": true
              },
              {
                "k": "3. Планировщик",
                "v": "G1 снова доступна для исполнения",
                "hl": true
              }
            ]
          },
          {
            "title": "Что сохраняется",
            "rows": [
              {
                "k": "Операция G1",
                "v": "Ещё не завершена",
                "hl": false
              },
              {
                "k": "Mutex у G1",
                "v": "Не отпускается автоматически",
                "hl": false
              },
              {
                "k": "Отмена",
                "v": "Отдельный протокол приложения",
                "hl": true
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Can another goroutine acquire G1’s locked mutex merely because G1 was preempted?",
          "promptRU": "Может ли другая горутина захватить занятый G1 mutex только потому, что G1 вытеснили?",
          "answerEN": "No. Preemption does not unlock it; the program must release the lock correctly.",
          "answerRU": "Нет. Вытеснение не отпускает mutex; программа должна корректно его освободить."
        }
      },
      {
        "title": "4. Перед перехватом: пять готовых G",
        "desc": "Новый сценарий, не продолжение очередей шага 3. P2 ищет работу и рассматривает обычную очередь P1. Для наглядности очередь неизменна на время успешной попытки: [A,B,C,D,E], голова слева; runnext пуст. runqgrab рассчитывает n - n/2 = 3 и через CAS забирает префикс с головы. При конкурирующем изменении нужна повторная проверка.",
        "descEN": "This is a new stable-queue example. P2 considers P1’s ordinary queue [A,B,C,D,E], head on the left, with empty runnext. runqgrab computes n - n/2 = 3 and claims the head prefix with CAS. Concurrent changes can require retrying.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "X"
                    ]
                  },
                  {
                    "label": "runnext",
                    "items": []
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      {
                        "g": "A",
                        "flag": "в пачке"
                      },
                      {
                        "g": "B",
                        "flag": "в пачке"
                      },
                      {
                        "g": "C",
                        "flag": "в пачке"
                      },
                      "D",
                      "E"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P2",
                "tag": "M2",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": []
                  },
                  {
                    "label": "runq · голова →",
                    "items": [],
                    "queue": true
                  }
                ],
                "note": "Своей работы нет → M2 в режиме spinning ищет работу (таких M примерно не больше половины занятых P — эвристика) → перехват у P1."
              }
            ],
            "list": {
              "title": "Что выбрано",
              "items": [
                "Размер пачки: n − ⌊n/2⌋ = 5 − 2 = 3",
                "Пачка берётся с головы: A, B, C",
                "X исполняется и в пачку не входит"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "P1 до / Before",
            "rows": [
              {
                "k": "Обычная очередь",
                "v": "[A B C D E]",
                "hl": true
              },
              {
                "k": "runnext",
                "v": "Пуст",
                "hl": false
              },
              {
                "k": "Уже исполняемая G",
                "v": "Не входит в перехватываемую пачку",
                "hl": false
              }
            ]
          },
          {
            "title": "Выбранная пачка",
            "rows": [
              {
                "k": "Размер",
                "v": "5 − floor(5/2) = 3",
                "hl": true
              },
              {
                "k": "С головы",
                "v": "[A B C]",
                "hl": true
              },
              {
                "k": "P2 до",
                "v": "Обычная очередь пуста",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Why are three taken rather than two?",
          "promptRU": "Почему берутся три, а не две?",
          "answerEN": "The formula rounds half upward: n - floor(n/2). This is a runtime queue policy, not a language rule.",
          "answerRU": "Формула округляет половину вверх: n - floor(n/2). Это политика очереди рантайма, не правило языка."
        }
      },
      {
        "title": "5. После перехвата: одна к исполнению, две в очередь",
        "desc": "Продолжение шага 4: runqsteal возвращает последний элемент взятой пачки, C, для исполнения, а A и B публикует в очереди P2. В P1 остаются D и E. Все пять G учтены, уже работающую G не перемещали. Это модель успешного пути без конкурирующих изменений; выбор жертвы и общее расписание не обещаны.",
        "descEN": "Continuing step 4, runqsteal returns C, the last element of the grabbed batch, for execution. A and B are queued on P2; D and E remain on P1. All five are accounted for. This models a successful stable-queue path, not a guaranteed program schedule.",
        "predict": {
          "promptEN": "P2 has stolen the batch A, B, C. Which G runs on P2 right away, which go to its queue, and what stays on P1?",
          "promptRU": "P2 перехватил пачку A, B, C. Какая G сразу пойдёт на исполнение на P2, какие — в его очередь и что останется у P1?"
        },
        "board": [
          {
            "hl": [
              "A",
              "B",
              "C"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "X"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "D",
                      "E"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P2",
                "tag": "M2",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "C"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "A",
                      "B"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "C — последний в пачке: runq P1 → исполнение на P2",
                "A, B: runq P1 → runq P2",
                "D, E остаются у P1; учтены все пять G"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "P1 после / After",
            "rows": [
              {
                "k": "Обычная очередь",
                "v": "[D E]",
                "hl": true
              },
              {
                "k": "Изъято с головы",
                "v": "A, B, C",
                "hl": false
              }
            ]
          },
          {
            "title": "P2 после / After",
            "rows": [
              {
                "k": "Возвращена для исполнения",
                "v": "C",
                "hl": true
              },
              {
                "k": "Обычная очередь",
                "v": "[A B]",
                "hl": true
              },
              {
                "k": "Проверка количества",
                "v": "2 + 2 + 1 = 5",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Would moving C directly from P1’s running slot be the same operation?",
          "promptRU": "Было бы извлечение C прямо из исполняемого слота P1 той же операцией?",
          "answerEN": "No. This steals runnable queue entries, not a currently running goroutine.",
          "answerRU": "Нет. Здесь забирают готовые элементы очереди, а не исполняющуюся горутину."
        }
      },
      {
        "title": "6. Syscall: различие Go 1.25 и 1.26",
        "desc": "Новый сценарий: G1 входит в обычный runtime-aware syscall на M1. В Go 1.25 связь M–P снимается, а P получает _Psyscall. В Go 1.26.1 обычный вход может сохранить связь M1–P1, а G1 переходит в _Gsyscall; отдельного действующего состояния Psyscall больше нет. Для изъятия P рантайм удерживает состояние G, проверяет связи и безопасно отсоединяет P. Заведомо блокирующий entersyscallblock отдаёт P отдельным путём.",
        "descEN": "In a new syscall scenario, Go 1.25 detaches M from P and marks P _Psyscall. In Go 1.26.1, ordinary entry can retain M–P attachment while G is _Gsyscall. Retaking P holds the G state, validates the links and detaches P safely. The known-blocking entry path gives up P separately.",
        "board": [
          {
            "caption": "Go 1.25 · обычный вход",
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "syscall",
                "title": "M1",
                "tag": "в syscall",
                "slots": [
                  {
                    "label": "G",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "_Gsyscall"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P1",
                "tag": "без M",
                "slots": [
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G2"
                    ],
                    "queue": true
                  }
                ],
                "state": "_Psyscall",
                "note": "sysmon может забрать P1: retake → handoffp."
              }
            ],
            "list": {
              "items": [
                "M1 ↔ P1: связь снята при входе; M1 помнит P1 в m.oldp и при выходе попробует вернуть его",
                "P1 помечен _Psyscall"
              ]
            }
          },
          {
            "caption": "Go 1.26.1 · обычный вход",
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "_Gsyscall"
                      }
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G2"
                    ],
                    "queue": true
                  }
                ],
                "state": "_Prunning",
                "note": "Syscall определяют по состоянию G1, а не P1."
              }
            ],
            "list": {
              "items": [
                "При входе связь M1–P1 сохраняется; разорвать её может sysmon (retake) или остановка мира",
                "Изъятие P: setBlockOnExitSyscall → takeP → resume → handoffp",
                "_Psyscall_unused — бывшее состояние, сейчас не используется"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Go 1.25 · обычный вход",
            "rows": [
              {
                "k": "G1",
                "v": "_Gsyscall",
                "hl": false
              },
              {
                "k": "M1 ↔ P1",
                "v": "Связь снята",
                "hl": true
              },
              {
                "k": "P1",
                "v": "_Psyscall; может быть изъят",
                "hl": true
              }
            ]
          },
          {
            "title": "Go 1.26.1 · обычный вход",
            "rows": [
              {
                "k": "G1",
                "v": "_Gsyscall",
                "hl": false
              },
              {
                "k": "M1 ↔ P1",
                "v": "Может пока сохраниться",
                "hl": true
              },
              {
                "k": "P1",
                "v": "_Prunning; syscall определяют по G",
                "hl": true
              }
            ]
          },
          {
            "title": "Go 1.26.1 · изъятие",
            "rows": [
              {
                "k": "Зафиксировать",
                "v": "setBlockOnExitSyscall",
                "hl": false
              },
              {
                "k": "Передать",
                "v": "takeP → resume → handoffp",
                "hl": true
              },
              {
                "k": "Неиспользуемое имя",
                "v": "_Psyscall_unused",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Can a Go 1.25 diagram labelled _Psyscall be reused unchanged for Go 1.26?",
          "promptRU": "Можно ли без изменений использовать схему 1.25 с _Psyscall для Go 1.26?",
          "answerEN": "No. The ordinary entry and retake protocol changed; distinguish G state from P state.",
          "answerRU": "Нет. Изменились обычный вход и протокол изъятия; различай состояние G и состояние P."
        }
      },
      {
        "title": "7. Syscall вернулся: для Go-кода снова нужен P",
        "desc": "В обеих версиях возврат к обычному Go-коду требует P. Если P можно сохранить или получить, исполнение продолжается. Если P недоступен, G1 может попасть в очередь, а M1 остановиться. Поэтому число M не обязано совпадать с GOMAXPROCS; один syscall также не означает обязательное создание нового M. При cgo внешний код может вычислять, а не только ждать в ядре.",
        "descEN": "In both versions, resuming normal user Go code requires a P. The thread may keep or acquire one. Otherwise G1 can be queued while M1 stops. Thread count need not equal GOMAXPROCS, and a syscall need not create a new thread. Foreign cgo code may compute rather than wait in the kernel.",
        "predict": {
          "promptEN": "G1's system call has returned. What happens if P1 was handed to another thread and no P is free?",
          "promptRU": "Системный вызов G1 завершился. Что будет, если P1 уже отдан другому потоку и свободного P нет?"
        },
        "board": [
          {
            "caption": "P удалось сохранить или получить",
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G2"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G1: syscall завершён → продолжает Go-код на P1"
              ]
            }
          },
          {
            "caption": "Свободного P нет",
            "hl": [
              "G1",
              "G2"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M3",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G2"
                    ]
                  }
                ],
                "note": "P1 уже работает с другим потоком."
              },
              {
                "kind": "grq",
                "title": "Глобальная очередь (GRQ)",
                "slots": [
                  {
                    "label": "голова →",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "runnable"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "m",
                "title": "M1",
                "tag": "без P",
                "slots": [],
                "note": "stopm: поток засыпает до новой работы."
              }
            ],
            "list": {
              "items": [
                "G2: runq P1 → исполнение — P1 отдан потоку M3 (handoffp)",
                "G1 → GRQ: ждёт планирования",
                "M1 останавливается",
                "Поэтому число M не обязано совпадать с GOMAXPROCS: потоков может быть больше",
                "Потоков больше P: блокирующие syscall, cgo, runtime.LockOSThread, поток sysmon; простаивающие M паркуются, а не уничтожаются. debug.SetMaxThreads (по умолчанию 10 000) — предохранитель: при превышении программа аварийно завершается (thread exhaustion)"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Есть P",
            "rows": [
              {
                "k": "G1",
                "v": "Продолжить с P",
                "hl": true
              },
              {
                "k": "M",
                "v": "Может быть прежним",
                "hl": false
              }
            ]
          },
          {
            "title": "Нет доступного P",
            "rows": [
              {
                "k": "G1",
                "v": "Runnable: ждать планирования",
                "hl": true
              },
              {
                "k": "M1",
                "v": "Может остановиться",
                "hl": true
              }
            ]
          },
          {
            "title": "Предел приложения",
            "rows": [
              {
                "k": "Лимитер операций",
                "v": "Отдельно от GOMAXPROCS",
                "hl": true
              },
              {
                "k": "Отмена C-кода",
                "v": "Не обеспечивается одним context",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does a timeout on context forcibly terminate any foreign call?",
          "promptRU": "Завершает ли timeout контекста любой внешний вызов принудительно?",
          "answerEN": "No. The operation or its API must support cancellation; a timeout can only stop waits that observe it.",
          "answerRU": "Нет. Операция или её API должна поддерживать отмену; timeout прекращает лишь ожидания, которые его учитывают."
        }
      },
      {
        "title": "8. Сеть: припарковать G, сохранить поток для работы",
        "desc": "Отдельный стандартный Unix-сценарий поллируемого сокета: чтение пока невозможно, поэтому G1 ждёт через netpoller. M1 с P1 может исполнять другую G; нет отдельного занятого потока на каждый ожидающий сокет. Событие готовности позволяет возобновить G1 и повторить I/O, но не гарантирует немедленного запуска или наличия всех запрошенных байтов. Пользовательская реализация net.Conn может вести себя иначе.",
        "descEN": "For a standard pollable Unix socket, a read that would block parks G1 through netpoll. M1 with P1 can run another G. Readiness permits resumption and an I/O retry; it guarantees neither immediate scheduling nor all requested bytes. A custom net.Conn implementation may behave differently.",
        "predict": {
          "promptEN": "A socket read cannot proceed yet. Does G1 keep thread M1 busy while it waits, and where does G1 go when the socket becomes ready?",
          "promptRU": "Чтение из сокета пока невозможно. Держит ли G1 поток M1 занятым на время ожидания и куда попадёт G1, когда сокет станет готов?"
        },
        "board": [
          {
            "caption": "Чтение пока невозможно",
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "netpoll",
                "title": "netpoller",
                "slots": [
                  {
                    "label": "Ждут",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "чтение fd"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G1: исполнение → ожидание в netpoller (gopark)",
                "M1 и P1 исполняют G2: отдельный поток на сокет не нужен"
              ]
            }
          },
          {
            "caption": "Сокет готов",
            "hl": [
              "G1"
            ],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "grq",
                "title": "Глобальная очередь (GRQ)",
                "slots": [
                  {
                    "label": "голова →",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "runnable"
                      }
                    ],
                    "queue": true
                  }
                ],
                "note": "Пример: событие забрал sysmon — у него нет P, поэтому injectglist кладёт G1 в GRQ и будит свободный P."
              },
              {
                "kind": "netpoll",
                "title": "netpoller",
                "slots": [
                  {
                    "label": "Ждут",
                    "items": []
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G1: netpoller → GRQ (в примере опрос сделал sysmon)",
                "Если опрашивает поток с P в findRunnable, первую готовую G он исполняет сам, остальные кладёт в свою runq или GRQ; к P, на котором G1 уснула, она не привязана",
                "Когда G1 запустится, она повторит Read; данных может быть меньше, чем запрошено"
              ]
            }
          }
        ],
        "boxes": [
          {
            "title": "Ожидание / Waiting",
            "rows": [
              {
                "k": "G1",
                "v": "Waiting в поллируемом I/O",
                "hl": true
              },
              {
                "k": "M1 + P1",
                "v": "Могут выполнять другую G",
                "hl": true
              }
            ]
          },
          {
            "title": "Готовность / Readiness",
            "rows": [
              {
                "k": "Событие",
                "v": "Разрешает возобновить попытку I/O",
                "hl": false
              },
              {
                "k": "G1",
                "v": "Получает возможность продолжить",
                "hl": true
              },
              {
                "k": "Не гарантия",
                "v": "Немедленный запуск / полное сообщение",
                "hl": false
              }
            ]
          }
        ],
        "check": {
          "promptEN": "Does one ready socket event mean Read must return a complete application message?",
          "promptRU": "Означает ли одно событие готовности, что Read вернёт целое сообщение приложения?",
          "answerEN": "No. Readiness and stream framing are separate; handle partial reads and the protocol’s message boundaries.",
          "answerRU": "Нет. Готовность и границы сообщений потока — разные вещи; учитывай частичные чтения и формат протокола."
        }
      },
      {
        "title": "9. GOMAXPROCS в контейнере (Go 1.25+)",
        "desc": "Отдельный сценарий: Linux-контейнер на хосте с 16 логическими CPU, лимит CPU 2,5 (quota/period). При go 1.25 и новее в go.mod рантайм по умолчанию берёт минимум из числа CPU по affinity и лимита, округлённого вверх и не меньше 2: здесь 3. Значит, Go-код одновременно исполняют не больше трёх потоков — по одному на P; потоков M может быть больше (syscall, cgo). Requests в Kubernetes на значение не влияют. sysmon перепроверяет лимит не чаще раза в секунду; явный GOMAXPROCS (переменная окружения или runtime.GOMAXPROCS) отключает автоматическое обновление.",
        "descEN": "A separate scenario: a Linux container on a host with 16 logical CPUs and a CPU limit of 2.5 (quota/period). With go 1.25 or later in go.mod, the default is the minimum of the affinity CPU count and the limit rounded up, but not below 2: here 3. At most three threads execute Go code at once, one per P; there can be more Ms for syscalls or cgo. Kubernetes requests do not affect the value. sysmon rechecks the limit at most once per second; setting GOMAXPROCS explicitly, through the environment or runtime.GOMAXPROCS, disables the automatic updates.",
        "predict": {
          "promptEN": "A container has a CPU limit of 2.5 on a 16-CPU host. What GOMAXPROCS does Go 1.25+ choose by default, and why?",
          "promptRU": "У контейнера лимит CPU 2,5 на хосте с 16 CPU. Какой GOMAXPROCS выберет Go 1.25+ по умолчанию и почему?"
        },
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "Контейнер",
                "tag": "Linux, cgroup",
                "slots": [
                  {
                    "label": "CPU хоста",
                    "items": [
                      "16"
                    ]
                  },
                  {
                    "label": "Лимит CPU",
                    "items": [
                      "2,5"
                    ]
                  }
                ],
                "note": "GOMAXPROCS = min(16, max(⌈2,5⌉, 2)) = 3"
              },
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G4"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P2",
                "tag": "M2",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G2"
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P3",
                "tag": "M3",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G3"
                    ]
                  }
                ]
              },
              {
                "kind": "syscall",
                "title": "M4",
                "tag": "в syscall",
                "slots": [
                  {
                    "label": "G",
                    "items": [
                      {
                        "g": "G5",
                        "flag": "_Gsyscall"
                      }
                    ]
                  }
                ],
                "note": "Потоков больше, чем P: это нормально."
              }
            ],
            "list": {
              "title": "Как получено число P",
              "ordered": true,
              "items": [
                "CPU по affinity: 16",
                "Лимит 2,5 округляется вверх до 3; меньше 2 не бывает",
                "GOMAXPROCS = min(16, 3) = 3",
                "Requests не участвуют; без лимита берётся число CPU; явная настройка отключает автообновление"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "A pod has a CPU request of 1 and a limit of 4 on a 16-CPU node. What GOMAXPROCS does Go 1.25+ choose by default?",
          "promptRU": "У пода request CPU 1 и limit 4 на узле с 16 CPU. Какой GOMAXPROCS выберет Go 1.25+ по умолчанию?",
          "answerEN": "4. The CPU limit (quota) counts, rounded up and at least 2; the request does not.",
          "answerRU": "4. Учитывается лимит (quota), округлённый вверх и не меньше 2; request не учитывается."
        }
      },
      {
        "title": "10. Вся картина и ответ за минуту",
        "desc": "Сводный кадр: все части планировщика на одной схеме. На интервью удобно отвечать в таком порядке: зачем планировщик → G, M, P → очереди и справедливость → перехват → syscall и сеть → вытеснение → GOMAXPROCS. Каждая часть — одно-два предложения и сразу граница: что не гарантируется. Каркас ниже — по-английски, как на интервью.",
        "descEN": "A summary frame with every part of the scheduler on one board. In an interview, answer in this order: why a scheduler → G, M, P → queues and fairness → stealing → syscalls and network → preemption → GOMAXPROCS. Give each part one or two sentences and one boundary: what is not guaranteed. The outline below is in English, as in an interview.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "p",
                "title": "P1",
                "tag": "M1",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "runnext",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [
                      "G3",
                      "G4"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P2",
                "tag": "M2",
                "slots": [
                  {
                    "label": "Исполняется",
                    "items": [
                      "G5"
                    ]
                  },
                  {
                    "label": "runq · голова →",
                    "items": [],
                    "queue": true
                  }
                ],
                "note": "Очередь пуста → перехват у P1."
              },
              {
                "kind": "grq",
                "title": "Глобальная очередь (GRQ)",
                "slots": [
                  {
                    "label": "голова →",
                    "items": [
                      "G6"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "netpoll",
                "title": "netpoller",
                "slots": [
                  {
                    "label": "Ждут",
                    "items": [
                      {
                        "g": "G7",
                        "flag": "сокет"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "syscall",
                "title": "M3",
                "tag": "в syscall",
                "slots": [
                  {
                    "label": "G",
                    "items": [
                      {
                        "g": "G8",
                        "flag": "_Gsyscall"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "sysmon",
                "title": "sysmon",
                "tag": "поток без P",
                "slots": [],
                "note": "Долгий запуск → запрос вытеснения; долгий syscall → забрать P; опрос сети; GOMAXPROCS — не чаще раза в секунду."
              },
              {
                "kind": "other",
                "title": "Ядра CPU",
                "tag": "управляет ОС",
                "slots": [],
                "note": "ОС раскладывает потоки M по ядрам; связь M ↔ ядро не фиксирована. M, заблокированный в syscall, ядро не занимает, но syscall, работающий в ядре, и cgo-код — занимают."
              }
            ],
            "list": {
              "title": "Ответ за минуту (EN)",
              "ordered": true,
              "items": [
                "Why: goroutines are cheap and numerous while OS threads are expensive, so the runtime multiplexes many Gs onto a few Ms (M:N).",
                "GMP: G is a goroutine, M an OS thread, P the right to run Go code; GOMAXPROCS is the number of Ps, so it bounds parallelism, not concurrency.",
                "Queues: each P has runnext and a local run queue of up to 256 Gs; the global queue is checked every 61 scheduler ticks for fairness.",
                "Balancing: an idle P steals half of another P's local queue, taken from the head.",
                "Syscalls and network: a long syscall can lose its P to another thread; a network wait parks the G in the netpoller without holding a thread.",
                "Preemption: since Go 1.14 sysmon asks a goroutine that has run for about 10 ms to yield, using a signal on Unix; it is a request, not an immediate switch.",
                "GOMAXPROCS: since Go 1.25 the default follows the container CPU limit; set it by hand only with a measured reason."
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Without looking: name the seven parts of the one-minute answer in order, each with one boundary.",
          "promptRU": "Не глядя: назови семь частей ответа за минуту по порядку, у каждой — одну границу.",
          "answerEN": "Why (M:N) → GMP → queues and the 61-tick fairness check → stealing half from the head → syscalls can lose P, network waits park in the netpoller → preemption is a request (sysmon, about 10 ms, signal) → GOMAXPROCS follows the container limit since 1.25. Boundary for all: no promised order or timing.",
          "answerRU": "Зачем (M:N) → GMP → очереди и проверка раз в 61 тик → перехват половины с головы → syscall может потерять P, сеть паркует в netpoller → вытеснение — запрос (sysmon, около 10 мс, сигнал) → GOMAXPROCS по лимиту контейнера с 1.25. Общая граница: ни порядок, ни время не обещаны."
        }
      },
      {
        "title": "11. Пять частых вопросов и где упрощают",
        "desc": "Короткие ответы на пять вопросов, которые чаще всего задают про планировщик, и формулировки из популярных объяснений, которые на интервью лучше уточнить. Ответы сверены с исходниками Go 1.26.1; это не цитаты конкретного автора. Сначала ответь сам вслух, потом сверяйся.",
        "descEN": "Short answers to the five most common scheduler questions, and phrasings from popular explanations that are worth making more precise in an interview. The answers were checked against the Go 1.26.1 source; they are not quotes from any particular author. Answer aloud first, then compare.",
        "predict": {
          "promptEN": "Answer aloud before opening: how does the scheduler work, what is GOMAXPROCS, why are there more threads than GOMAXPROCS, what changed in Go 1.14, and how is fairness ensured?",
          "promptRU": "Ответь вслух до раскрытия: как работает планировщик, что такое GOMAXPROCS, почему потоков больше GOMAXPROCS, что изменилось в Go 1.14 и как обеспечивается справедливость?"
        },
        "board": [
          {
            "caption": "Пять вопросов — ответы на английском",
            "list": {
              "title": "Q → A",
              "ordered": true,
              "items": [
                "How does the Go scheduler work? — The runtime multiplexes goroutines (G) onto OS threads (M). A thread needs a P to run Go code, and the number of Ps (GOMAXPROCS) bounds parallelism. Each P has runnext and a local run queue of up to 256 goroutines; a global queue and work stealing balance the load.",
                "What is GOMAXPROCS? — The number of Ps: how many threads may run Go code at the same time, not the number of goroutines, threads or cores. Since Go 1.25 (go 1.25 or later in go.mod) the Linux default is min(available CPUs, max(ceil(limit), 2)).",
                "Why are there more threads than GOMAXPROCS? — Threads blocked in system calls or cgo, and threads locked with runtime.LockOSThread, cannot serve other goroutines, so the runtime starts more Ms to keep Ps busy. If the program needs more threads than debug.SetMaxThreads (10,000 by default), it crashes with \"thread exhaustion\": a safety fuse, not a throttle. The sysmon thread also has no P, and idle threads are parked for reuse.",
                "What changed in Go 1.14? — Asynchronous preemption: sysmon, which existed before, can interrupt a goroutine that has run for about 10 ms by sending SIGURG on Unix. On supported platforms, ordinary loops without calls can now be preempted, so they rarely stall the scheduler or a GC stop (not on wasm or plan9, or with GODEBUG=asyncpreemptoff=1). Side effect: slow system calls return EINTR more often.",
                "How is fairness ensured? — A P mostly runs runnext and its local queue, but every 61 scheduler ticks it checks a non-empty global queue first. Idle Ps steal half of a busy P's queue. runnext shares the current time slice, and sysmon preemption bounds long runs."
              ]
            }
          },
          {
            "caption": "Где упрощают — как сказать точнее",
            "list": {
              "title": "Упрощение → точнее",
              "items": [
                "«P — это ядро» → P — право исполнять Go-код; потоки по ядрам раскладывает ОС, связь M ↔ ядро не фиксирована",
                "«Раз в 61 горутину» → раз в 61 тик планировщика P сначала проверяет GRQ, если она не пуста",
                "«В глобальной очереди неготовые горутины» → там готовые (runnable) G; ждущие — в каналах, таймерах, netpoller",
                "«Сетевой вызов блокирует M, как syscall» → для поллируемых сокетов ожидание паркует G в netpoller, поток свободен (cgo-резолвер DNS, например, держит поток)",
                "«После syscall P вернётся к прежнему M» → M пытается вернуть свой P, затем взять любой свободный; если нет — G идёт в GRQ, а M засыпает (при LockOSThread — ждёт свою G)",
                "«sysmon появился в Go 1.14» → sysmon был и раньше (отбирал P у долгих syscall, запрашивал кооперативное вытеснение); в 1.14 добавилось вытеснение сигналом",
                "«Крадёт ровно половину» → n − ⌊n/2⌋, то есть половину с округлением вверх, с головы очереди",
                "«Потоки никогда не останавливают» → свободный M недолго ищет работу (spinning, примерно не больше половины занятых P) или ждёт в netpoll, потом засыпает (stopm); поток не уничтожается, а ждёт повторного использования",
                "«Стек горутины 2–8 КБ» → новая G стартует с 2 КиБ (Linux), переиспользуемая — с адаптивного размера; стек растёт копированием",
                "«GOMAXPROCS = лимит CPU контейнера» → min(CPU по affinity, max(⌈лимит⌉, 2)); requests не учитываются"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Without looking: why can a Go process have more threads than GOMAXPROCS, and what limits them?",
          "promptRU": "Не глядя: почему у Go-процесса может быть больше потоков, чем GOMAXPROCS, и что их ограничивает?",
          "answerEN": "Threads blocked in syscalls or cgo and threads locked by LockOSThread cannot run other goroutines, so the runtime adds Ms to keep Ps busy; exceeding debug.SetMaxThreads (10,000 by default) crashes the program.",
          "answerRU": "Потоки в syscall или cgo и потоки, закреплённые через LockOSThread, не могут исполнять другие горутины, поэтому рантайм добавляет M, чтобы P не простаивали; при превышении debug.SetMaxThreads (по умолчанию 10 000) программа аварийно завершается."
        }
      }
    ],
    "learningHint": "Не смешивай три перехода: runnable → running; запрос → безопасное вытеснение; занятый M → доступный другому M процессор P. Голова очереди слева. Цвет выделяет изменение, смысл повторяется текстом.",
    "boardLegend": "G — горутина, M — поток ОС, P — право исполнять Go-код (их GOMAXPROCS). Очереди: голова слева. Рамка и слово «изменилось» отмечают фишки, которые сдвинулись на этом шаге.",
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
        "title": "go1.26.1: runtime/runtime2.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/runtime2.go"
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
        "title": "go1.26.1: internal/poll/fd_unix.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/poll/fd_unix.go"
      },
      {
        "title": "go1.26.1: runtime/cgroup_linux.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/cgroup_linux.go"
      }
    ]
  },

  // =========================================================================
  // ДИАГРАММА 3: КАНАЛЫ (HCHAN), SUDOG, GOPARK И ПРЯМОЕ КОПИРОВАНИЕ SENDDIRECT
  // =========================================================================
  {
    "id": "sim3",
    "title": "Диаграмма 3: Канал — ожидание, буфер и close",
    "subtitle": "Шаги 1–5: один допустимый путь — G1 первой читает из открытого небуферизованного chan int, G2 позже отправляет 42 (без select). Шаги 6–9: кольцевой буфер, полный буфер с ждущим отправителем, close и сводная таблица nil / открыт / закрыт. Runtime Go 1.25.0/1.26.1; планировщик может вставлять другую работу между показанными событиями.",
    "cardId": "c17",
    "cardLabel": "Q17: передача и парковка →",
    "boardLegend": "Схема — один допустимый порядок событий, не трасса. Дорожки: отправитель, канал (hchan) и получатель; на шагах 4–5 — ещё P отправителя. Очереди и буфер читаются слева направо. Рамкой выделено то, что изменилось на шаге.",
    "learningHint": "Как запомнить: проследи отдельно значение 42, запись sudog и состояние G1. Перед следующим шагом ответь на вопрос, затем сравни. После шагов 1–5 закрой схему и восстанови цепочку «копия → готовность → запуск»; таблицу шага 9 повтори по памяти через день.",
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
      },
      {
        "title": "proc.go — Go 1.26.1 (goready → runnext)",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      }
    ],
    "steps": [
      {
        "title": "1. Зарегистрировать ожидание",
        "desc": "G1 захватила lock, но значения и отправителя нет. В recvq добавлен sudog со ссылкой на G1 и место результата x. Перед gopark установлен parkingOnChan. Это ещё подготовка к парковке: G1 выполняется, lock остаётся захвачен.",
        "descEN": "The receiver holds the channel lock and finds no value or sender. It registers a sudog and marks that it is about to park. It is still running; the channel has not been unlocked yet.",
        "board": [
          {
            "hl": [
              "sudog G1",
              "parkingOnChan"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "ещё не у канала"
                      }
                    ]
                  },
                  {
                    "label": "значение",
                    "items": []
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 0",
                "slots": [
                  {
                    "label": "lock",
                    "items": [
                      {
                        "g": "G1",
                        "flag": "держит"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [
                      {
                        "g": "sudog G1",
                        "flag": "elem → &x"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "буфер",
                    "items": []
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING"
                      }
                    ]
                  },
                  {
                    "label": "x",
                    "items": [
                      {
                        "g": "?",
                        "flag": "ещё пусто"
                      }
                    ]
                  },
                  {
                    "label": "флаги",
                    "items": [
                      {
                        "g": "parkingOnChan",
                        "flag": "true"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что произошло",
              "items": [
                "G1 берёт lock: отправителя нет, буфера нет",
                "sudog со ссылкой на G1 и адрес x встаёт в recvq",
                "parkingOnChan = true; дальше gopark, lock всё ещё у G1"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "WAITING",
              "activeStackChans",
              "parkingOnChan",
              "свободен"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "может подойти к ch"
                      }
                    ]
                  },
                  {
                    "label": "значение",
                    "items": []
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 0",
                "slots": [
                  {
                    "label": "lock",
                    "items": [
                      {
                        "g": "свободен"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [
                      {
                        "g": "sudog G1",
                        "flag": "elem → &x"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "буфер",
                    "items": []
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "WAITING",
                        "flag": "gopark"
                      }
                    ]
                  },
                  {
                    "label": "x",
                    "items": [
                      {
                        "g": "?",
                        "flag": "ещё пусто"
                      }
                    ]
                  },
                  {
                    "label": "флаги",
                    "items": [
                      {
                        "g": "activeStackChans",
                        "flag": "true"
                      },
                      {
                        "g": "parkingOnChan",
                        "flag": "false"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Порядок в chanparkcommit",
              "items": [
                "park_m на системном стеке: G1 → waiting",
                "activeStackChans = true, затем parkingOnChan = false",
                "Только после этого unlock: теперь G2 может войти"
              ]
            }
          }
        ],
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
        "desc": "G2 захватывает lock и извлекает sudog G1 из recvq. Для выбранного пути sendDirect копирует 42 в место x, минуя буфер. G1 ещё ждёт. В int нет указателей; барьерный помощник учитывает тип, а его наличие не означает работу GC над указателями у каждого значения.",
        "descEN": "The sender locks the channel, removes the receiver’s waiter and copies 42 to the receive destination. The receiver is still waiting. The type-aware transfer supports pointers, but this int contains none.",
        "board": [
          {
            "hl": [
              "42",
              "G2",
              "sudog G1"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING"
                      }
                    ]
                  },
                  {
                    "label": "значение",
                    "items": [
                      {
                        "g": "42",
                        "flag": "копия → x"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 0",
                "slots": [
                  {
                    "label": "lock",
                    "items": [
                      {
                        "g": "G2",
                        "flag": "держит"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "извлечён",
                    "items": [
                      {
                        "g": "sudog G1",
                        "flag": "ещё не освобождён"
                      }
                    ]
                  },
                  {
                    "label": "буфер",
                    "items": []
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "WAITING"
                      }
                    ]
                  },
                  {
                    "label": "x",
                    "items": [
                      {
                        "g": "42",
                        "flag": "записала G2"
                      }
                    ]
                  },
                  {
                    "label": "флаги",
                    "items": [
                      {
                        "g": "activeStackChans",
                        "flag": "true"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что произошло",
              "items": [
                "G2 берёт lock, recvq.dequeue() → sudog G1",
                "sendDirect: 42 копируется прямо в x на стеке G1, буфер не нужен",
                "G1 всё ещё WAITING: код после <-ch не выполнялся"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "RUNNABLE",
              "свободен",
              "G1"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING",
                        "flag": "продолжает"
                      }
                    ]
                  },
                  {
                    "label": "значение",
                    "items": []
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 0",
                "slots": [
                  {
                    "label": "lock",
                    "items": [
                      {
                        "g": "свободен"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "буфер",
                    "items": []
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNABLE",
                        "flag": "goready"
                      }
                    ]
                  },
                  {
                    "label": "x",
                    "items": [
                      {
                        "g": "42"
                      }
                    ]
                  },
                  {
                    "label": "флаги",
                    "items": [
                      {
                        "g": "activeStackChans",
                        "flag": "true"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P, на котором работает G2",
                "slots": [
                  {
                    "label": "текущая",
                    "items": [
                      "G2"
                    ]
                  },
                  {
                    "label": "runnext",
                    "items": [
                      "G1"
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что произошло",
              "items": [
                "G2: unlock(&c.lock), затем goready(G1)",
                "goready → runqput(next = true): обычно G1 попадает в runnext P отправителя; wakep может разбудить простаивающий P",
                "RUNNABLE ≠ RUNNING: момент запуска решает планировщик; G1 может забрать другой P"
              ]
            }
          }
        ],
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
        "desc": "Планировщик возобновляет G1. Путь чтения очищает состояние ожидания, сбрасывает activeStackChans и возвращает sudog через releaseSudog. Затем пользовательский код получает x=42 и может продолжить обработку.",
        "descEN": "When scheduled, the receiver resumes, clears its waiting state and releases its sudog. The receive then completes with x=42, and user code can continue.",
        "board": [
          {
            "hl": [
              "RUNNING",
              "activeStackChans",
              "releaseSudog",
              "G1",
              "ушла с P"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "ушла с P",
                        "flag": "заблокировалась или завершилась"
                      }
                    ]
                  },
                  {
                    "label": "значение",
                    "items": []
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 0",
                "slots": [
                  {
                    "label": "lock",
                    "items": [
                      {
                        "g": "свободен"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "буфер",
                    "items": []
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING"
                      }
                    ]
                  },
                  {
                    "label": "x",
                    "items": [
                      {
                        "g": "42",
                        "flag": "<-ch вернуло"
                      }
                    ]
                  },
                  {
                    "label": "флаги",
                    "items": [
                      {
                        "g": "activeStackChans",
                        "flag": "false"
                      }
                    ]
                  },
                  {
                    "label": "sudog",
                    "items": [
                      {
                        "g": "releaseSudog"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "P",
                "slots": [
                  {
                    "label": "текущая",
                    "items": [
                      "G1"
                    ]
                  },
                  {
                    "label": "runnext",
                    "items": []
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что произошло",
              "items": [
                "G2 ушла с P → планировщик берёт G1 из runnext, и она наследует остаток кванта; если G1 забрал другой P — не наследует",
                "После gopark: waiting = nil, activeStackChans = false, releaseSudog",
                "Цепочка: копия → готовность → запуск"
              ]
            }
          }
        ],
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
          "answerEN": "Into the free buffer slot. If a receiver is waiting, the value always goes directly to it; by the hchan invariant the buffer is then empty. Capacity alone does not determine the path.",
          "answerRU": "В свободную ячейку буфера. Если получатель ждёт, значение всегда передаётся ему напрямую: по инварианту hchan буфер тогда пуст. Одна ёмкость не определяет путь."
        }
      },
      {
        "title": "6. Буфер: кольцо sendx → recvx",
        "desc": "Новый сценарий: ch := make(chan int, 3), получателей нет. G2 отправляет 1, затем 2. Каждая отправка под lock: значение копируется в buf[sendx], sendx сдвигается по кругу, qcount растёт; пока есть место, отправитель не паркуется. Получатель берёт buf[recvx] — порядок FIFO. Инварианты hchan: если qcount > 0, recvq пуста; если qcount < cap, sendq пуста. Поэтому при ждущем получателе буфер пуст, и отправка идёт напрямую, как в шагах 3–4.",
        "descEN": "A new scenario: ch := make(chan int, 3) with no receivers. G2 sends 1, then 2. Each send runs under the lock: the value is copied into buf[sendx], sendx advances around the ring and qcount grows; while there is room the sender never parks. A receiver takes buf[recvx], so the order is FIFO. hchan invariants: if qcount > 0, recvq is empty; if qcount < cap, sendq is empty. So when a receiver is waiting the buffer is empty, and a send goes directly to it, as in steps 3–4.",
        "board": [
          {
            "caption": "После двух отправок",
            "hl": [
              "1",
              "2"
            ],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 3",
                "slots": [
                  {
                    "label": "buf · ячейки 0→2",
                    "items": [
                      {
                        "g": "1",
                        "flag": "recvx = 0"
                      },
                      {
                        "g": "2"
                      },
                      {
                        "g": "—",
                        "flag": "sendx = 2"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "qcount",
                    "items": [
                      {
                        "g": "2"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING",
                        "flag": "не ждала"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Отправка (chansend)",
              "items": [
                "Ждёт получатель в recvq → передать ему напрямую (шаги 3–4)",
                "Иначе есть место (qcount < cap) → buf[sendx] = v, sendx++ по кругу, qcount++",
                "Иначе → sudog в sendq и парковка (как G1 в шагах 1–2)"
              ]
            }
          },
          {
            "caption": "Приём — зеркально",
            "list": {
              "ordered": true,
              "title": "Приём (chanrecv)",
              "items": [
                "Ждёт отправитель в sendq → взять значение с его участием (шаг 7)",
                "Иначе qcount > 0 → v = buf[recvx], ячейка обнуляется, recvx++ по кругу, qcount−−",
                "Иначе → sudog в recvq и парковка"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "The buffer is empty and G1 already waits in recvq. G2 sends 5. Does 5 go into the buffer?",
          "promptRU": "Буфер пуст, а G1 уже ждёт в recvq. G2 отправляет 5. Попадёт ли 5 в буфер?",
          "answerEN": "No. A waiting receiver gets the value directly, bypassing the buffer. That is why qcount > 0 and a waiting receiver never coexist.",
          "answerRU": "Нет. Ждущий получатель получает значение напрямую, минуя буфер. Поэтому qcount > 0 и ждущий получатель одновременно не бывают."
        }
      },
      {
        "title": "7. Полный буфер и ждущий отправитель",
        "desc": "Буфер полон: [1 2 3], recvx = sendx = 0. G3 пыталась отправить 4 и спит в sendq. G1 читает: под lock runtime отдаёт ей голову очереди — 1 из buf[recvx] — и сразу кладёт 4 от G3 в ту же ячейку: в полном буфере голова и хвост — одна ячейка. recvx сдвигается на 1, sendx = recvx, qcount остаётся 3, G3 получает goready. Дальше прочитаются 2, 3, 4: порядок FIFO сохранён. Отдать 4 сразу G1 нельзя — 4 обогнала бы 1, 2 и 3.",
        "descEN": "The buffer is full: [1 2 3], recvx = sendx = 0. G3 tried to send 4 and sleeps in sendq. G1 receives: under the lock the runtime gives it the head of the queue, 1 from buf[recvx], and immediately puts G3's 4 into the same slot, because in a full ring the head and the tail are the same slot. recvx advances by 1, sendx = recvx, qcount stays 3, and G3 is readied. Next reads return 2, 3, 4, so FIFO order holds. Handing 4 straight to G1 would let it overtake 1, 2 and 3.",
        "predict": {
          "promptEN": "The buffer [1 2 3] is full and G3 waits in sendq with 4. G1 receives once. What does G1 get, where does 4 go, and what happens to G3?",
          "promptRU": "Буфер [1 2 3] полон, в sendq ждёт G3 со значением 4. G1 читает один раз. Что получит G1, куда попадёт 4 и что станет с G3?"
        },
        "board": [
          {
            "caption": "До: буфер полон, G3 ждёт",
            "hl": [],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 3",
                "slots": [
                  {
                    "label": "buf · ячейки 0→2",
                    "items": [
                      {
                        "g": "1",
                        "flag": "recvx = sendx = 0"
                      },
                      {
                        "g": "2"
                      },
                      {
                        "g": "3"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "qcount",
                    "items": [
                      {
                        "g": "3"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [
                      {
                        "g": "sudog G3",
                        "flag": "elem → 4 (стек G3)"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "вызывает <-ch"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "caption": "После одного <-ch",
            "hl": [
              "4",
              "1",
              "RUNNABLE",
              "2"
            ],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 3",
                "slots": [
                  {
                    "label": "buf · ячейки 0→2",
                    "items": [
                      {
                        "g": "4",
                        "flag": "хвост, от G3"
                      },
                      {
                        "g": "2",
                        "flag": "recvx = sendx = 1"
                      },
                      {
                        "g": "3"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "qcount",
                    "items": [
                      {
                        "g": "3"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "sendq",
                    "items": [],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 · получатель",
                "slots": [
                  {
                    "label": "получила",
                    "items": [
                      {
                        "g": "1"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G3 · отправитель",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNABLE",
                        "flag": "goready"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что произошло",
              "items": [
                "G1 получает голову: buf[0] = 1",
                "4 от G3 записывается в ту же ячейку buf[0] — теперь это хвост",
                "recvx = 1, sendx = recvx, qcount = 3; G3 → goready",
                "Порядок дальнейших чтений: 2, 3, 4"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why doesn't the runtime hand 4 from G3 directly to G1?",
          "promptRU": "Почему runtime не отдаёт 4 от G3 прямо G1?",
          "answerEN": "FIFO: 1, 2 and 3 were sent earlier and must be received first. A direct handoff happens only when the buffer is empty.",
          "answerRU": "FIFO: 1, 2 и 3 отправлены раньше и должны быть получены первыми. Прямая передача бывает только при пустом буфере."
        }
      },
      {
        "title": "8. close: кто проснётся и что получит",
        "desc": "closechan под lock ставит closed = 1 и собирает всех ждущих: каждому получателю из recvq записывается нулевое значение и ok = false; каждый отправитель из sendq после пробуждения упадёт с panic «send on closed channel». Будит всех goready уже после unlock. Данные в буфере не теряются: чтения после close сначала вернут 7 и 8 с ok = true и только потом 0, false; for range по каналу заканчивается, когда канал закрыт и буфер пуст. По соглашению канал закрывает единственный владелец-отправитель после последней отправки; повторный close и close(nil) — panic.",
        "descEN": "closechan sets closed = 1 under the lock and collects every waiter: each receiver from recvq gets the zero value and ok = false; each sender from sendq panics with \"send on closed channel\" once it wakes. All of them are readied after the unlock. Buffered data is not lost: receives after close return 7 and 8 with ok = true first, and only then 0, false; a for range loop over the channel ends when it is closed and the buffer is empty. By convention the single sending owner closes the channel after its last send; closing twice or closing nil panics.",
        "predict": {
          "promptEN": "G1 and G4 wait in recvq of an empty channel, and close(ch) is called. What do they get? And if 7 and 8 were still buffered, what would three receives after close return?",
          "promptRU": "В recvq пустого канала ждут G1 и G4, вызываем close(ch). Что они получат? А если в буфере ещё 7 и 8 — что вернут три чтения после close?"
        },
        "board": [
          {
            "caption": "Ждут получатели → close(ch)",
            "hl": [
              "closed = 1",
              "0, false"
            ],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch · hchan",
                "slots": [
                  {
                    "label": "closed",
                    "items": [
                      {
                        "g": "closed = 1"
                      }
                    ]
                  },
                  {
                    "label": "recvq",
                    "items": [],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1 и G4 · получатели",
                "slots": [
                  {
                    "label": "G1",
                    "items": [
                      {
                        "g": "0, false",
                        "flag": "RUNNABLE"
                      }
                    ]
                  },
                  {
                    "label": "G4",
                    "items": [
                      {
                        "g": "0, false",
                        "flag": "RUNNABLE"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "closechan",
              "items": [
                "lock; closed = 1",
                "Все sudog из recvq: нулевое значение, ok = false",
                "Все sudog из sendq: при пробуждении — panic",
                "unlock, затем goready каждому"
              ]
            }
          },
          {
            "caption": "В буфере 7 и 8 → close(ch)",
            "hl": [
              "0"
            ],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch · hchan",
                "tag": "cap = 3",
                "slots": [
                  {
                    "label": "buf",
                    "items": [
                      {
                        "g": "7"
                      },
                      {
                        "g": "8"
                      },
                      {
                        "g": "—"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "closed",
                    "items": [
                      {
                        "g": "closed = 1"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "Три чтения после close",
                "slots": [
                  {
                    "label": "v, ok :=",
                    "items": [
                      {
                        "g": "7",
                        "flag": "true"
                      },
                      {
                        "g": "8",
                        "flag": "true"
                      },
                      {
                        "g": "0",
                        "flag": "false"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Сначала остаток буфера, потом нулевое значение и ok = false",
                "for v := range ch завершится после 8"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Who should close a channel, and why not the receiver?",
          "promptRU": "Кто должен закрывать канал и почему не получатель?",
          "answerEN": "The sending side, ideally its single owner: only it knows that no more values will come. If a receiver closes it, a sender that sends afterwards, or is blocked in sendq, panics.",
          "answerRU": "Отправляющая сторона, лучше её единственный владелец: только она знает, что значений больше не будет. Если закроет получатель, отправитель, который отправит после этого или уже ждёт в sendq, упадёт с panic."
        }
      },
      {
        "title": "9. Сводная таблица и ответ за минуту",
        "desc": "Таблица, которую спрашивают на собеседовании: что делают отправка, приём и close с nil, открытым и закрытым каналом. «Блок навсегда» значит: горутина спит, и nil-канал её не разбудит. Если так заблокированы все горутины и ждать больше нечего (нет таймеров, сети и системных вызовов), runtime завершит программу: fatal error: all goroutines are asleep - deadlock!",
        "descEN": "The table interviewers ask for: what send, receive and close do with a nil, an open and a closed channel. \"Blocks forever\" means the goroutine sleeps and nothing on a nil channel will wake it. If every goroutine is blocked like this and nothing else can wake them (no timers, network or system calls), the runtime stops the program with fatal error: all goroutines are asleep - deadlock!",
        "board": [
          {
            "caption": "Операция × состояние канала",
            "hlQuiet": true,
            "hl": [
              "panic",
              "отправка выбрана — panic"
            ],
            "lanes": [
              {
                "kind": "chan",
                "title": "ch <- v (отправка)",
                "slots": [
                  {
                    "label": "nil",
                    "items": [
                      {
                        "g": "блок навсегда"
                      }
                    ]
                  },
                  {
                    "label": "открыт, есть получатель или место",
                    "items": [
                      {
                        "g": "передача или в буфер"
                      }
                    ]
                  },
                  {
                    "label": "открыт, места нет",
                    "items": [
                      {
                        "g": "ждёт в sendq"
                      }
                    ]
                  },
                  {
                    "label": "закрыт",
                    "items": [
                      {
                        "g": "panic"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "<-ch (приём)",
                "slots": [
                  {
                    "label": "nil",
                    "items": [
                      {
                        "g": "блок навсегда"
                      }
                    ]
                  },
                  {
                    "label": "открыт, есть данные или отправитель",
                    "items": [
                      {
                        "g": "v, ok = true"
                      }
                    ]
                  },
                  {
                    "label": "открыт, пусто",
                    "items": [
                      {
                        "g": "ждёт в recvq"
                      }
                    ]
                  },
                  {
                    "label": "закрыт",
                    "items": [
                      {
                        "g": "остаток буфера, затем нулевое значение, false"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "close(ch)",
                "slots": [
                  {
                    "label": "nil",
                    "items": [
                      {
                        "g": "panic"
                      }
                    ]
                  },
                  {
                    "label": "открыт",
                    "items": [
                      {
                        "g": "closed = 1, будит всех ждущих"
                      }
                    ]
                  },
                  {
                    "label": "закрыт",
                    "items": [
                      {
                        "g": "panic"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "select, len и cap",
                "slots": [
                  {
                    "label": "case с nil-каналом",
                    "items": [
                      {
                        "g": "никогда не выбирается"
                      }
                    ]
                  },
                  {
                    "label": "case с закрытым каналом",
                    "items": [
                      {
                        "g": "приём всегда готов: нулевое значение, false"
                      },
                      {
                        "g": "отправка выбрана — panic"
                      }
                    ]
                  },
                  {
                    "label": "default",
                    "items": [
                      {
                        "g": "готовых нет — не ждать"
                      }
                    ]
                  },
                  {
                    "label": "len, cap у nil",
                    "items": [
                      {
                        "g": "0"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "caption": "Ответ за минуту (EN)",
            "list": {
              "ordered": true,
              "title": "Channels",
              "items": [
                "A channel is an hchan: a lock, an optional ring buffer with sendx and recvx, and two queues of waiting sudogs, recvq and sendq.",
                "Send: if a receiver waits, copy the value straight to it and make it runnable; else put it in the buffer if there is room; else park in sendq.",
                "Receive mirrors it; with a full buffer and a waiting sender it takes the head and puts the sender's value at the tail, keeping FIFO.",
                "A woken goroutine is only runnable: goready normally puts it into runnext of the waker's P, and the scheduler decides when it runs.",
                "close wakes every waiter: receivers get the zero value and ok = false, senders panic; buffered values are still delivered.",
                "A nil channel blocks forever, which disables a select case; a receive case on a closed channel is always ready, so set the variable to nil to disable it; closing nil or closing twice panics."
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why is a nil channel useful in select?",
          "promptRU": "Чем nil-канал полезен в select?",
          "answerEN": "A case on a nil channel is never ready, so setting a channel variable to nil disables that case, for example after its source has been closed.",
          "answerRU": "Case с nil-каналом никогда не готов: присвоив переменной канала nil, можно выключить эту ветку — например, после закрытия её источника."
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
    "boardLegend": "Схема — условная трасса: адреса и порядок опроса выбраны для примера. Очереди и массивы читаются слева направо. Рамкой выделено то, что изменилось на шаге.",
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
        "predict": {
          "promptEN": "ch is closed and empty. select { case v, ok := <-ch: …; default: … } — which branch runs, and what are v and ok?",
          "promptRU": "ch закрыт и пуст. select { case v, ok := <-ch: …; default: … } — какая ветка выполнится и чему равны v и ok?"
        },
        "board": [
          {
            "hl": [
              "case, ok = false"
            ],
            "hlLabel": "ловушка",
            "lanes": [
              {
                "kind": "chan",
                "title": "Открытый пустой или nil",
                "slots": [
                  {
                    "label": "selectnbrecv",
                    "items": [
                      {
                        "g": "selected = false"
                      }
                    ]
                  },
                  {
                    "label": "итог",
                    "items": [
                      {
                        "g": "default"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Есть значение (даже 0)",
                "slots": [
                  {
                    "label": "selectnbrecv",
                    "items": [
                      {
                        "g": "selected = true"
                      },
                      {
                        "g": "received = true"
                      }
                    ]
                  },
                  {
                    "label": "итог",
                    "items": [
                      {
                        "g": "case, ok = true"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Закрыт и пуст",
                "slots": [
                  {
                    "label": "selectnbrecv",
                    "items": [
                      {
                        "g": "selected = true"
                      },
                      {
                        "g": "received = false"
                      }
                    ]
                  },
                  {
                    "label": "итог",
                    "items": [
                      {
                        "g": "case, ok = false"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "selected решает, какая ветка: case или default",
                "received становится ok в v, ok := <-ch",
                "Закрытый пустой канал всегда готов: в цикле for + select такая ветка будет выбираться снова и снова — после закрытия присвой каналу nil"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "var",
                "title": "scases (порядок компилятора)",
                "slots": [
                  {
                    "label": "индексы 0→2",
                    "items": [
                      {
                        "g": "C",
                        "flag": "0"
                      },
                      {
                        "g": "B",
                        "flag": "1"
                      },
                      {
                        "g": "A",
                        "flag": "2"
                      }
                    ],
                    "queue": true
                  }
                ],
                "note": "Отправки кладутся с начала массива, чтения — с конца."
              },
              {
                "kind": "var",
                "title": "pollorder (случайный)",
                "slots": [
                  {
                    "label": "обход",
                    "items": [
                      {
                        "g": "B",
                        "flag": "1"
                      },
                      {
                        "g": "C",
                        "flag": "0"
                      },
                      {
                        "g": "A",
                        "flag": "2"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "var",
                "title": "lockorder (по адресу hchan)",
                "slots": [
                  {
                    "label": "захват",
                    "items": [
                      {
                        "g": "B",
                        "flag": "0x1000"
                      },
                      {
                        "g": "C",
                        "flag": "0x2000"
                      },
                      {
                        "g": "A",
                        "flag": "0x3000"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Каналы",
                "slots": [
                  {
                    "label": "chA",
                    "items": [
                      {
                        "g": "пуст"
                      }
                    ]
                  },
                  {
                    "label": "chB",
                    "items": [
                      {
                        "g": "пуст"
                      }
                    ]
                  },
                  {
                    "label": "chC",
                    "items": [
                      {
                        "g": "пуст"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "selectgo, проход 1",
              "items": [
                "Заблокировать все каналы в lockorder; один и тот же канал — один раз",
                "Обойти в pollorder: ждёт отправитель, есть данные в буфере или канал закрыт?",
                "Нашёл → выполнить и вернуть индекс; нет, но есть default → chosen = −1; иначе — регистрация (шаг 4)",
                "Порядок по адресам нужен, чтобы два select с общими каналами не заблокировали друг друга"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "sudog A",
              "sudog B",
              "sudog C",
              "WAITING"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "WAITING",
                        "flag": "selparkcommit"
                      }
                    ]
                  },
                  {
                    "label": "waiting · lockorder",
                    "items": [
                      {
                        "g": "sudog B"
                      },
                      {
                        "g": "sudog C"
                      },
                      {
                        "g": "sudog A"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "selectDone",
                    "items": [
                      {
                        "g": "0"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "chA",
                "slots": [
                  {
                    "label": "recvq",
                    "items": [
                      {
                        "g": "sudog A",
                        "flag": "G1, isSelect"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "chB",
                "slots": [
                  {
                    "label": "recvq",
                    "items": [
                      {
                        "g": "sudog B",
                        "flag": "G1, isSelect"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "chC",
                "slots": [
                  {
                    "label": "recvq",
                    "items": [
                      {
                        "g": "sudog C",
                        "flag": "G1, isSelect"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Проход 2",
              "items": [
                "Под теми же блокировками: по sudog на каждый case, в порядке lockorder",
                "Каждый sudog — в recvq своего канала, isSelect = true",
                "gopark(selparkcommit): блокировки отпускаются уже после перехода G1 в waiting"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "true",
              "false",
              "1",
              "RUNNABLE"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "W1 → chC",
                "slots": [
                  {
                    "label": "CAS selectDone 0 → 1",
                    "items": [
                      {
                        "g": "true",
                        "flag": "успела первой"
                      }
                    ]
                  },
                  {
                    "label": "дальше",
                    "items": [
                      {
                        "g": "значение → G1"
                      },
                      {
                        "g": "goready(G1)"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "W2 → chA",
                "slots": [
                  {
                    "label": "CAS selectDone 0 → 1",
                    "items": [
                      {
                        "g": "false",
                        "flag": "уже занято"
                      }
                    ]
                  },
                  {
                    "label": "дальше",
                    "items": [
                      {
                        "g": "пропустить sudog A"
                      },
                      {
                        "g": "искать другого"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNABLE"
                      }
                    ]
                  },
                  {
                    "label": "selectDone",
                    "items": [
                      {
                        "g": "1"
                      }
                    ]
                  },
                  {
                    "label": "param",
                    "items": [
                      {
                        "g": "sudog C"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Очереди",
                "slots": [
                  {
                    "label": "chA.recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "chB.recvq",
                    "items": [
                      {
                        "g": "sudog B",
                        "flag": "ещё там"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "chC.recvq",
                    "items": [],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Гонка двух отправителей",
              "items": [
                "W1 извлекает sudog C, CAS(selectDone, 0, 1) = true → передаёт значение и будит G1",
                "W2 извлекает sudog A, CAS = false → запись пропущена, W2 ищет другого получателя или ждёт",
                "Одно ожидание select может забрать только одна операция"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "chosen = 0",
              "case <-chC"
            ],
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "статус",
                    "items": [
                      {
                        "g": "RUNNING"
                      }
                    ]
                  },
                  {
                    "label": "второй захват",
                    "items": [
                      {
                        "g": "B"
                      },
                      {
                        "g": "C"
                      },
                      {
                        "g": "A"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Очереди",
                "slots": [
                  {
                    "label": "chB.recvq",
                    "items": [],
                    "queue": true
                  },
                  {
                    "label": "удалён",
                    "items": [
                      {
                        "g": "sudog B",
                        "flag": "dequeueSudoG"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "sudog",
                "slots": [
                  {
                    "label": "releaseSudog",
                    "items": [
                      {
                        "g": "B"
                      },
                      {
                        "g": "C"
                      },
                      {
                        "g": "A"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "var",
                "title": "Результат",
                "slots": [
                  {
                    "label": "selectgo",
                    "items": [
                      {
                        "g": "chosen = 0"
                      },
                      {
                        "g": "recvOK = true"
                      }
                    ]
                  },
                  {
                    "label": "компилятор",
                    "items": [
                      {
                        "g": "case <-chC",
                        "flag": "третья ветка"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Проход 3",
              "items": [
                "Снова lock в lockorder — второй и последний захват набора",
                "Победитель C уже извлечён W1, A — проигравшей W2; из очереди убирается только B",
                "releaseSudog для всех трёх, unlock",
                "chosen = 0 — индекс в scases; компилятор переводит его в case <-chC"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "panic"
            ],
            "hlQuiet": true,
            "lanes": [
              {
                "kind": "other",
                "title": "Только nil-каналы",
                "slots": [
                  {
                    "label": "без default",
                    "items": [
                      {
                        "g": "ждать вечно"
                      }
                    ]
                  },
                  {
                    "label": "с default",
                    "items": [
                      {
                        "g": "default"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Закрытый канал",
                "slots": [
                  {
                    "label": "чтение",
                    "items": [
                      {
                        "g": "готово: 0, false"
                      }
                    ]
                  },
                  {
                    "label": "выбрана отправка",
                    "items": [
                      {
                        "g": "panic"
                      }
                    ]
                  },
                  {
                    "label": "отправка + default",
                    "items": [
                      {
                        "g": "panic",
                        "flag": "default не спасает"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "chan",
                "title": "Один канал в двух case",
                "slots": [
                  {
                    "label": "блокировка",
                    "items": [
                      {
                        "g": "один раз"
                      }
                    ]
                  },
                  {
                    "label": "выбор",
                    "items": [
                      {
                        "g": "одна ветка, одно чтение"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "default и готовые",
                "slots": [
                  {
                    "label": "есть готовая",
                    "items": [
                      {
                        "g": "выбрана готовая"
                      }
                    ]
                  },
                  {
                    "label": "готовых несколько",
                    "items": [
                      {
                        "g": "случайно, по pollorder"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "title": "Правила",
              "items": [
                "nil-канал исключается из опроса и блокировок",
                "Закрытый канал всегда готов: чтение даёт 0, false, выбранная отправка — panic",
                "default выбирается, только если готовых операций нет"
              ]
            }
          }
        ],
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
        "predict": {
          "promptEN": "select { case ch <- build(): …; case dst[index()] = <-in: …; default: … } Nothing is ready and default runs. Which of build() and index() were called?",
          "promptRU": "select { case ch <- build(): …; case dst[index()] = <-in: …; default: … } Готовых нет, выполняется default. Какие из build() и index() были вызваны?"
        },
        "board": [
          {
            "hl": [
              "build()"
            ],
            "hlLabel": "ловушка",
            "lanes": [
              {
                "kind": "var",
                "title": "До выбора: один раз, по порядку исходника",
                "slots": [
                  {
                    "label": "каналы",
                    "items": [
                      {
                        "g": "ch"
                      },
                      {
                        "g": "in"
                      }
                    ]
                  },
                  {
                    "label": "значение отправки",
                    "items": [
                      {
                        "g": "build()",
                        "flag": "вызван всегда"
                      }
                    ]
                  },
                  {
                    "label": "адрес слева от <-",
                    "items": [
                      {
                        "g": "index()",
                        "flag": "ещё не вызван"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "var",
                "title": "После выбора",
                "slots": [
                  {
                    "label": "выбрано чтение",
                    "items": [
                      {
                        "g": "значение → index() → присвоить → тело"
                      }
                    ]
                  },
                  {
                    "label": "выбран default",
                    "items": [
                      {
                        "g": "index() не вызывается"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "build() отработал, даже если победил default или канал nil",
                "Дорогую подготовку выноси из case и делай её отменяемой через context"
              ]
            }
          }
        ],
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
    "subtitle": "Восемь шагов: смысл CAS на одном state и регистры amd64 (1–4; в них state в 0 никто не возвращает), затем CAS-цикл, ABA, порядок памяти и выбор между CAS, atomic и mutex (5–8).",
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
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "значение",
                    "items": [
                      {
                        "g": "0",
                        "flag": "свободно"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "CAS",
                    "items": [
                      "old 0",
                      "new 1"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "CAS",
                    "items": [
                      "old 0",
                      "new 1"
                    ]
                  }
                ]
              }
            ],
            "list": {
              "title": "Правило CAS",
              "items": [
                "CAS(адрес, old, new): если *адрес == old — записать new и вернуть true",
                "иначе ничего не записывать и вернуть false",
                "Сравнение и запись — одно неделимое действие"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [],
            "hlLabel": "изменилось",
            "lanes": [
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "значение",
                    "items": [
                      {
                        "g": "1",
                        "flag": "занято G1",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "CAS(0 → 1)",
                    "items": [
                      {
                        "g": "true",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "CAS",
                    "items": [
                      "ещё не выполнен"
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G1: 0 == 0 → записала 1 и получила true",
                "G2 ещё не выполнила свой CAS"
              ],
              "title": "Результат"
            }
          }
        ],
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
        "board": [
          {
            "hl": [],
            "hlLabel": "результат",
            "lanes": [
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "значение",
                    "items": [
                      {
                        "g": "1",
                        "flag": "занято G1"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "CAS(0 → 1)",
                    "items": [
                      "true"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "CAS(0 → 1)",
                    "items": [
                      {
                        "g": "false",
                        "flag": "нашла 1",
                        "hl": true
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G2 ожидала 0, а нашла 1 → false, ничего не записала",
                "Что делать после false — решает алгоритм: повторить, ждать или сдаться"
              ],
              "title": "Результат"
            }
          }
        ],
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
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "Регистры (amd64, Cas 32 бита)",
                "slots": [
                  {
                    "label": "BX",
                    "items": [
                      "&state"
                    ]
                  },
                  {
                    "label": "AX",
                    "items": [
                      "old = 0"
                    ]
                  },
                  {
                    "label": "CX",
                    "items": [
                      "new = 1"
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "Инструкции",
                "slots": [
                  {
                    "label": "1",
                    "items": [
                      "LOCK CMPXCHGL CX, 0(BX)"
                    ]
                  },
                  {
                    "label": "2",
                    "items": [
                      "SETEQ → bool"
                    ]
                  }
                ],
                "note": "LOCK делает сравнение и запись неделимыми для всех ядер. При неудаче CMPXCHG загружает текущее значение памяти в AX."
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что делает процессор",
              "items": [
                "Сравнить AX с памятью по адресу BX",
                "Равно → записать CX, флаг ZF = 1; не равно → загрузить текущее значение в AX, ZF = 0",
                "SETEQ превращает ZF в результат true/false"
              ]
            }
          }
        ],
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
      },
      {
        "title": "5. CAS-цикл: прочитать → вычислить → CAS → повторить",
        "desc": "Новый сценарий: counter = 5, G1 и G2 одновременно прибавляют 1 через CAS-цикл. Обе прочитали 5 и вычислили 6. CAS G2 прошёл первым: 5 → 6. CAS G1 с old = 5 вернул false — значение уже другое. G1 перечитывает 6, вычисляет 7 и повторяет: 6 → 7. Итог 7 — ни одно увеличение не потеряно. Для простого счётчика то же делает atomic.AddInt64 одной инструкцией (LOCK XADD на amd64).",
        "descEN": "A new scenario: counter = 5, and G1 and G2 both add 1 with a CAS loop. Both read 5 and compute 6. G2's CAS wins first: 5 → 6. G1's CAS with old = 5 returns false because the value has changed. G1 rereads 6, computes 7 and retries: 6 → 7. The result is 7 and no increment is lost. For a plain counter, atomic.AddInt64 does the same in one instruction (LOCK XADD on amd64).",
        "predict": {
          "promptEN": "Both goroutines read 5 and want to write 6. What do their CAS calls return, and what is the final value if G1 retries?",
          "promptRU": "Обе горутины прочитали 5 и хотят записать 6. Что вернут их CAS и каким будет итог, если G1 умеет повторять?"
        },
        "board": [
          {
            "hl": [],
            "hlLabel": "успех",
            "lanes": [
              {
                "kind": "var",
                "title": "counter",
                "slots": [
                  {
                    "label": "было",
                    "items": [
                      "5"
                    ]
                  },
                  {
                    "label": "стало",
                    "items": [
                      {
                        "g": "7",
                        "flag": "итог",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "попытка 1",
                    "items": [
                      {
                        "g": "CAS 5→6",
                        "flag": "true",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "попытка 1",
                    "items": [
                      {
                        "g": "CAS 5→6",
                        "flag": "false"
                      }
                    ]
                  },
                  {
                    "label": "попытка 2",
                    "items": [
                      {
                        "g": "CAS 6→7",
                        "flag": "true",
                        "hl": true
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Порядок",
              "items": [
                "G1 и G2 читают 5, обе вычисляют 6",
                "G2: CAS(5 → 6) = true",
                "G1: CAS(5 → 6) = false → перечитать: 6",
                "G1: CAS(6 → 7) = true; итог 7"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why can a CAS loop waste CPU under heavy contention?",
          "promptRU": "Почему при сильной конкуренции CAS-цикл может тратить CPU впустую?",
          "answerEN": "Every loser repeats the read, the computation and the CAS; with many writers most attempts fail. atomic.Add does the update without a retry loop (on amd64 one LOCK XADD instruction), and a mutex lets waiters sleep after a short spin.",
          "answerRU": "Каждый проигравший повторяет чтение, вычисление и CAS; при многих писателях большинство попыток проваливается. atomic.Add обновляет без цикла повторов (на amd64 — одной инструкцией LOCK XADD), а mutex после короткого спина даёт ждущим уснуть."
        }
      },
      {
        "title": "6. ABA: значение то же, история другая",
        "desc": "Стек без блокировок: top → A → B → C. G1 читает top = A и next = B, но не успевает сделать CAS. G2 снимает A, снимает B и кладёт A обратно: top снова A, но под ним уже C. CAS G1 (A → B) проходит, потому что сравнивает только текущее значение, и делает вершиной B, которого в стеке больше нет. В Go сборщик мусора не освободит узел, пока на него есть ссылка, поэтому use-after-free нет, но логическая ошибка ABA остаётся. Если узлы переиспользуются через free-list или sync.Pool, возвращается и классическая ABA с повторным использованием памяти. Защита: версия в том же слове (например, индекс и счётчик в одном uint64), неизменяемые узлы или mutex.",
        "descEN": "A lock-free stack: top → A → B → C. G1 reads top = A and next = B but has not done its CAS yet. G2 pops A, pops B and pushes A back: top is A again, but now C is below it. G1's CAS (A → B) succeeds because it compares only the current value, and it makes B the top although B is no longer in the stack. In Go the garbage collector does not free a node while it is referenced, so there is no use-after-free, but the logical ABA bug remains. If nodes are reused through a free list or sync.Pool, classic memory-reuse ABA comes back as well. Defences: a version in the same word (for example an index and a counter in one uint64), immutable nodes, or a mutex.",
        "board": [
          {
            "caption": "G1 прочитала и задумалась",
            "hl": [],
            "lanes": [
              {
                "kind": "var",
                "title": "Стек",
                "slots": [
                  {
                    "label": "top →",
                    "items": [
                      "A",
                      "B",
                      "C"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "видела",
                    "items": [
                      "top = A",
                      "next = B"
                    ]
                  }
                ]
              }
            ]
          },
          {
            "caption": "G2: pop A, pop B, push A; затем CAS G1",
            "hl": [
              "B"
            ],
            "hlLabel": "ошибка",
            "lanes": [
              {
                "kind": "var",
                "title": "Стек после G2",
                "slots": [
                  {
                    "label": "top →",
                    "items": [
                      "A",
                      "C"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "var",
                "title": "Стек после CAS G1",
                "slots": [
                  {
                    "label": "top →",
                    "items": [
                      {
                        "g": "B",
                        "flag": "уже снят"
                      },
                      "C"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "G2: снять A, снять B, вернуть A → стек A → C",
                "G1: CAS(top, A → B) = true — top снова был A",
                "Вершина — B, которого в стеке уже нет: структура испорчена"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Does atomic.Pointer instead of uintptr prevent ABA?",
          "promptRU": "Поможет ли atomic.Pointer вместо uintptr избежать ABA?",
          "answerEN": "It prevents use-after-free, because the GC keeps a referenced node alive. It does not prevent logical ABA: CAS still compares only the current pointer.",
          "answerRU": "От use-after-free — да: GC не освободит узел, пока на него есть ссылка. От логической ABA — нет: CAS по-прежнему сравнивает только текущий указатель."
        }
      },
      {
        "title": "7. Порядок памяти: атомарная публикация",
        "desc": "G1 записывает data = 42 обычной записью, затем ready.Store(true). G2 видит ready.Load() == true и читает data. По модели памяти Go все атомарные операции ведут себя так, будто выполнены в одном последовательном порядке, и если атомарная операция B наблюдает результат A, то A «synchronizes before» B. Поэтому G2 гарантированно увидит 42. Если читать ready обычной переменной, это data race и гарантии нет.",
        "descEN": "G1 writes data = 42 with a plain write, then ready.Store(true). G2 sees ready.Load() == true and reads data. In the Go memory model all atomic operations behave as if executed in one sequentially consistent order, and if atomic operation B observes the effect of A, then A synchronizes before B. So G2 is guaranteed to see 42. Reading ready as a plain variable is a data race with no guarantee.",
        "board": [
          {
            "hl": [
              "ready.Store(true)",
              "ready.Load() == true"
            ],
            "hlLabel": "синхронизация",
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "по порядку",
                    "items": [
                      "data = 42",
                      "ready.Store(true)"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "по порядку",
                    "items": [
                      "ready.Load() == true",
                      "data → 42"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "var",
                "title": "Память",
                "slots": [
                  {
                    "label": "data",
                    "items": [
                      "42"
                    ]
                  },
                  {
                    "label": "ready",
                    "items": [
                      "true"
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Внутри G1 запись data идёт до Store",
                "Store(true) synchronizes before Load, который его увидел",
                "Значит, G2 видит data = 42; без атомиков это гонка"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "If G2 reads ready = false, what can it conclude about data?",
          "promptRU": "Если G2 прочитала ready = false, что она может сказать о data?",
          "answerEN": "Nothing: no synchronization happened. It must wait for true (or use a channel or sync.WaitGroup) before reading data.",
          "answerRU": "Ничего: синхронизации не было. Нужно дождаться true (или использовать канал, sync.WaitGroup) и только потом читать data."
        }
      },
      {
        "title": "8. CAS, atomic или mutex: что выбрать",
        "desc": "Сводка шага: когда достаточно одной атомарной операции, когда нужен CAS-цикл, а когда — mutex. И короткий ответ на английском, который можно произнести на интервью за минуту.",
        "descEN": "A summary: when one atomic operation is enough, when a CAS loop is needed, and when to use a mutex, plus a one-minute English answer for an interview.",
        "board": [
          {
            "caption": "Что выбрать",
            "list": {
              "items": [
                "Одно слово (счётчик, флаг, указатель на неизменяемый снимок) → atomic: Add, Load/Store, CompareAndSwap",
                "Переход по условию в одном слове (0 → 1, «первый занял») → CAS",
                "Инвариант из нескольких полей (баланс и история) → mutex: проверка и запись под одной блокировкой",
                "Сильная конкуренция → CAS-цикл крутится и тратит CPU; mutex после короткого спина даёт ждущим уснуть",
                "sync.Mutex сам начинается с CAS(0 → 1): быстрый путь без runtime (диаграмма 8)"
              ]
            }
          },
          {
            "caption": "Ответ за минуту (EN)",
            "list": {
              "ordered": true,
              "title": "CAS",
              "items": [
                "CAS atomically compares a word with an expected value and, only if they match, stores a new one; it returns whether it succeeded.",
                "On amd64 it is LOCK CMPXCHG; the LOCK prefix makes the compare and store indivisible across cores.",
                "Lock-free code wraps CAS in a retry loop: read, compute, CAS, retry on failure.",
                "CAS checks the current value, not its history, so ABA is possible; the GC does not reuse memory that is still referenced, but a free list or sync.Pool brings classic ABA back, and logical ABA remains anyway.",
                "Go atomics are sequentially consistent: an atomic store observed by an atomic load synchronizes before it.",
                "Use atomics for one word; use a mutex when an invariant spans several fields."
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Name two reasons to choose a mutex instead of CAS.",
          "promptRU": "Назови две причины выбрать mutex вместо CAS.",
          "answerEN": "An invariant that spans several fields, and heavy contention: after a short spin, waiters sleep instead of retrying.",
          "answerRU": "Инвариант из нескольких полей и сильная конкуренция: после короткого спина ждущие спят, а не повторяют попытки."
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
    "boardLegend": "Схема — учебная модель, не трасса runtime. Дорожки цветов — множества объектов: белые ещё не отмечены, серые найдены и ждут просмотра, чёрные просмотрены. Рамкой выделено то, что изменилось на шаге.",
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
        "desc": "Сначала компилятор определяет время жизни: объект может остаться в стеке, в регистрах или исчезнуть после оптимизации. Если нужен объект кучи, быстрый путь берёт свободную ячейку из span текущего P. Когда ячейки закончились, mcentral ищет подходящий span, при необходимости выполняется sweep или запрашиваются страницы у mheap. Это разные пути с разной стоимостью. Объекты без указателей GC не просматривает, но их достижимость и освобождение всё равно учитывает.",
        "descEN": "First the compiler determines lifetimes: storage may be on the stack, in registers or eliminated. For a required heap object, the fast path uses a free slot in the current P’s cached span. When its slots run out, mcentral finds a suitable span, sweeping one if needed, or pages are requested from mheap. These paths have different costs. Pointer-free payloads skip pointer traversal but still need reachability tracking and reclamation.",
        "board": [
          {
            "caption": "Путь выделения малого объекта",
            "hl": [
              "свободна"
            ],
            "hlLabel": "сюда",
            "lanes": [
              {
                "kind": "g",
                "title": "Компилятор: escape analysis",
                "slots": [
                  {
                    "label": "не убегает",
                    "items": [
                      {
                        "g": "стек или регистры"
                      }
                    ]
                  },
                  {
                    "label": "убегает",
                    "items": [
                      {
                        "g": "куча → mallocgc"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "p",
                "title": "mcache текущего P",
                "tag": "без блокировки",
                "slots": [
                  {
                    "label": "span класса 48 B",
                    "items": [
                      {
                        "g": "занято"
                      },
                      {
                        "g": "занято"
                      },
                      {
                        "g": "свободна",
                        "flag": "следующая"
                      },
                      {
                        "g": "…"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "tiny: < 16 B без указателей",
                    "items": [
                      {
                        "g": "общий блок 16 B"
                      }
                    ]
                  }
                ],
                "note": "У каждого P свой кеш: по span на класс размера, отдельно для объектов с указателями и без."
              },
              {
                "kind": "other",
                "title": "mcentral класса 48 B",
                "tag": "общий для всех P",
                "slots": [
                  {
                    "label": "есть свободные",
                    "items": [
                      {
                        "g": "span"
                      },
                      {
                        "g": "span"
                      }
                    ]
                  },
                  {
                    "label": "заполнены",
                    "items": [
                      {
                        "g": "span"
                      }
                    ]
                  }
                ],
                "note": "Кеш опустел → берёт span со свободными ячейками; может доделать sweep этого span."
              },
              {
                "kind": "other",
                "title": "mheap",
                "tag": "страницы 8 KiB",
                "slots": [
                  {
                    "label": "свободные страницы",
                    "items": [
                      {
                        "g": "…"
                      }
                    ]
                  },
                  {
                    "label": "объект > ~32 KiB",
                    "items": [
                      {
                        "g": "свой span"
                      }
                    ]
                  }
                ],
                "note": "Нет span → новые страницы; нет страниц → память у ОС."
              }
            ],
            "list": {
              "ordered": true,
              "title": "Путь mallocgc",
              "items": [
                "Свободная ячейка в span из mcache → без блокировок",
                "Ячеек нет → mcentral: span того же класса (sweep, синхронизация)",
                "Нет span → mheap: страницы; нет страниц → у ОС",
                "Больше ~32 KiB → отдельный span сразу из mheap"
              ]
            }
          },
          {
            "caption": "scan и noscan",
            "list": {
              "items": [
                "noscan: байты за []byte и string — GC их не просматривает",
                "scan: структура с указателями (Holder{[]byte, string}) — GC читает её поля",
                "Класс span = размер + признак noscan: объекты с указателями и без лежат в разных span"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [
              "A",
              "B"
            ],
            "hlLabel": "найдено",
            "lanes": [
              {
                "kind": "var",
                "title": "Корни",
                "slots": [
                  {
                    "label": "стек G",
                    "items": [
                      {
                        "g": "→ A"
                      }
                    ]
                  },
                  {
                    "label": "globals",
                    "items": [
                      {
                        "g": "→ B"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "black",
                "title": "Чёрные",
                "tag": "просмотрены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": []
                  }
                ]
              },
              {
                "kind": "grey",
                "title": "Серые",
                "tag": "найдены, ждут просмотра",
                "slots": [
                  {
                    "label": "работа",
                    "items": [
                      {
                        "g": "A"
                      },
                      {
                        "g": "B"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "white",
                "title": "Белые",
                "tag": "ещё не отмечены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "C",
                        "flag": "B → C"
                      },
                      {
                        "g": "D",
                        "flag": "A → D"
                      },
                      {
                        "g": "E",
                        "flag": "E → E, нет пути"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "title": "Связи — граф, а не порядок",
              "items": [
                "Корни → A, B; A → D; B → C",
                "E ссылается сам на себя, но пути от корней нет",
                "Белый во время разметки — «ещё не отмечен», а не «мусор»"
              ]
            }
          }
        ],
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
                "k": "Новые объекты во время marking:",
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
        "predict": {
          "promptEN": "A is black (already scanned), B is grey, C is white and reachable only through B. The program runs A.Next = B.Next; B.Next = nil. Without a write barrier, what goes wrong? What does the barrier record?",
          "promptRU": "A чёрный (уже просмотрен), B серый, C белый и достижим только через B. Программа выполняет A.Next = B.Next; B.Next = nil. Что сломается без барьера записи? Что барьер учтёт?"
        },
        "board": [
          {
            "caption": "До записи",
            "hl": [],
            "lanes": [
              {
                "kind": "black",
                "title": "Чёрные",
                "tag": "просмотрены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "A",
                        "flag": "→ D"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "grey",
                "title": "Серые",
                "tag": "найдены, ждут просмотра",
                "slots": [
                  {
                    "label": "работа",
                    "items": [
                      {
                        "g": "B",
                        "flag": "→ C"
                      },
                      {
                        "g": "D"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "white",
                "title": "Белые",
                "tag": "ещё не отмечены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "C"
                      },
                      {
                        "g": "E"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "caption": "После записи с барьером",
            "hl": [
              "A",
              "B",
              "C"
            ],
            "lanes": [
              {
                "kind": "black",
                "title": "Чёрные",
                "tag": "просмотрены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "A",
                        "flag": "→ C"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "grey",
                "title": "Серые",
                "tag": "найдены, ждут просмотра",
                "slots": [
                  {
                    "label": "работа",
                    "items": [
                      {
                        "g": "B",
                        "flag": "→ nil"
                      },
                      {
                        "g": "D"
                      },
                      {
                        "g": "C",
                        "flag": "учтён барьером"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "white",
                "title": "Белые",
                "tag": "ещё не отмечены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "E"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Что учёл барьер",
              "items": [
                "A.Next = B.Next: старая цель D и новая цель C",
                "B.Next = nil: старая цель C",
                "C серый и будет просмотрен; без барьера остался бы белым и был бы освобождён, хотя A → C"
              ]
            }
          }
        ],
        "check": {
          "promptEN": "Here the insertion half already records C. When does the deletion half (the old target of B.Next = nil) actually save an object? Does the barrier make A.Next = B.Next; B.Next = nil safe for concurrent goroutines?",
          "promptRU": "Здесь C уже учтён insertion-частью. Когда deletion-часть (старая цель при B.Next = nil) действительно спасает объект? Делает ли барьер код A.Next = B.Next; B.Next = nil безопасным для конкурентных горутин?",
          "answerEN": "When the only pointer moves onto an already scanned stack: x := B.Next; B.Next = nil. Stack writes have no barrier and that stack is not rescanned, so recording the old target C is what keeps it alive. The barrier serves GC correctness only; concurrent goroutines still need their own synchronization.",
          "answerRU": "Когда единственный указатель переезжает на уже просканированный стек: x := B.Next; B.Next = nil. У записей в стек нет барьера, и этот стек повторно не сканируется, поэтому C сохраняет именно учёт старой цели. Барьер нужен только для корректности GC; конкурентным горутинам всё равно нужна своя синхронизация."
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
        "board": [
          {
            "caption": "Итог разметки и sweep",
            "hl": [
              "E"
            ],
            "hlLabel": "освобождается",
            "lanes": [
              {
                "kind": "black",
                "title": "Отмечены",
                "tag": "живут этот цикл",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "A"
                      },
                      {
                        "g": "B"
                      },
                      {
                        "g": "C"
                      },
                      {
                        "g": "D",
                        "flag": "мог стать ненужным"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "white",
                "title": "Не отмечены",
                "slots": [
                  {
                    "label": "объекты",
                    "items": [
                      {
                        "g": "E",
                        "flag": "ячейку вернёт sweep"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "Фазы",
                "slots": [
                  {
                    "label": "STW #2",
                    "items": [
                      {
                        "g": "mark termination"
                      }
                    ]
                  },
                  {
                    "label": "барьер",
                    "items": [
                      {
                        "g": "выключен"
                      }
                    ]
                  },
                  {
                    "label": "sweep",
                    "items": [
                      {
                        "g": "фоново и при аллокациях"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "D отмечен и переживёт цикл, даже если ссылок на него уже нет: проверит следующий цикл",
                "Компактирования нет: объекты кучи не двигаются (стеки горутин — двигаются)"
              ]
            }
          },
          {
            "caption": "Pacer: цель следующего цикла",
            "hl": [
              "220 MiB"
            ],
            "hlLabel": "результат",
            "lanes": [
              {
                "kind": "var",
                "title": "Входные данные",
                "slots": [
                  {
                    "label": "отмечено (live)",
                    "items": [
                      {
                        "g": "100 MiB"
                      }
                    ]
                  },
                  {
                    "label": "корни: стеки и globals",
                    "items": [
                      {
                        "g": "20 MiB"
                      }
                    ]
                  },
                  {
                    "label": "GOGC",
                    "items": [
                      {
                        "g": "100"
                      }
                    ]
                  },
                  {
                    "label": "цель кучи",
                    "items": [
                      {
                        "g": "220 MiB"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "items": [
                "Цель = live + (live + корни) × GOGC / 100 = 100 + 120 = 220 MiB",
                "Разметка начинается раньше цели (trigger), чтобы успеть",
                "GOMEMLIMIT — мягкий лимит: может снизить цель, от OOM не защищает"
              ]
            }
          }
        ],
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
    "boardLegend": "Схема — учебная: отпечатки и ключи подобраны для объяснения. Слоты слева направо 0→7. Рамкой выделено то, о чём шаг: путь поиска, кандидаты или изменения.",
    "steps": [
      {
        "title": "1. До Swiss Tables: бакет → overflow → эвакуация",
        "desc": "В классической map, показанной по Go 1.17, младшие биты хеша выбирают основной бакет. Tophash отбирает кандидатов, затем сравниваются ключи. Если места не хватает, используются overflow-бакеты. Два основания роста нужно запоминать отдельно.",
        "descEN": "In the classic Go 1.17 map, low hash bits select a primary bucket. Tophash filters candidates before key equality. Overflow buckets provide more slots. Excess load and excess overflow are different reasons to rebuild.",
        "board": [
          {
            "hl": [
              "b2",
              "of1"
            ],
            "hlLabel": "путь поиска",
            "lanes": [
              {
                "kind": "dir",
                "title": "Массив бакетов",
                "tag": "2^B = 4",
                "slots": [
                  {
                    "label": "бакеты",
                    "items": [
                      "b0",
                      "b1",
                      {
                        "g": "b2",
                        "flag": "младшие B бит хеша"
                      },
                      "b3"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "group",
                "title": "Бакет b2",
                "tag": "8 записей",
                "slots": [
                  {
                    "label": "tophash",
                    "items": [
                      "t0",
                      "t1",
                      "…",
                      "t7"
                    ],
                    "queue": true
                  },
                  {
                    "label": "ключи",
                    "items": [
                      "k0",
                      "k1",
                      "…",
                      "k7"
                    ],
                    "queue": true
                  },
                  {
                    "label": "значения",
                    "items": [
                      "v0",
                      "v1",
                      "…",
                      "v7"
                    ],
                    "queue": true
                  },
                  {
                    "label": "overflow →",
                    "items": [
                      {
                        "g": "of1",
                        "flag": "следующий бакет"
                      }
                    ]
                  }
                ],
                "note": "В классической map ключи и значения бакета лежат отдельными массивами."
              },
              {
                "kind": "other",
                "title": "Рост",
                "slots": [],
                "note": "Средняя загрузка выше 6.5 → удвоение; много overflow при обычной загрузке → перестройка того же размера. Перенос постепенный (growWork)."
              }
            ],
            "list": {
              "ordered": true,
              "title": "Путь поиска (Go 1.17)",
              "items": [
                "Хеш → младшие B бит → бакет b2",
                "tophash отбирает кандидатов, затем сравниваются ключи",
                "Не нашли → следующий overflow-бакет цепочки"
              ]
            }
          }
        ],
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
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "Хеш (64 бита)",
                "slots": [
                  {
                    "label": "H1 · старшие 57",
                    "items": [
                      "таблица и группа"
                    ]
                  },
                  {
                    "label": "H2 · младшие 7",
                    "items": [
                      {
                        "g": "2A",
                        "flag": "отпечаток"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "group",
                "title": "Группа",
                "tag": "8 слотов",
                "slots": [
                  {
                    "label": "ctrl · слоты 0→7",
                    "items": [
                      {
                        "g": "2A",
                        "flag": "full"
                      },
                      {
                        "g": "19",
                        "flag": "full"
                      },
                      {
                        "g": "FE",
                        "flag": "deleted"
                      },
                      {
                        "g": "80",
                        "flag": "empty"
                      },
                      "80",
                      "80",
                      "80",
                      "80"
                    ],
                    "queue": true
                  },
                  {
                    "label": "слоты",
                    "items": [
                      "k:v",
                      "k:v",
                      "—",
                      "—",
                      "—",
                      "—",
                      "—",
                      "—"
                    ],
                    "queue": true
                  }
                ],
                "note": "В Swiss-группе ключ и значение лежат вместе в одном слоте; 8 байтов ctrl идут перед слотами."
              }
            ],
            "list": {
              "title": "Три состояния байта ctrl",
              "items": [
                "Full: 0xxxxxxx — в байте лежит H2 занятого слота",
                "Empty: 0x80 (1000 0000) — слот свободен",
                "Deleted: 0xFE (1111 1110) — tombstone: запись удалена, путь поиска сохраняется",
                "Совпадение H2 — только кандидат; равенство проверяется сравнением ключей"
              ]
            }
          }
        ],
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
        "predict": {
          "promptEN": "We look up \"go\" with H2 = 0x2A. Which slots become candidates, and how does the lookup end?",
          "promptRU": "Ищем «go», H2 = 0x2A. Какие слоты станут кандидатами и чем закончится поиск?"
        },
        "board": [
          {
            "hl": [
              "2A"
            ],
            "hlLabel": "кандидат",
            "lanes": [
              {
                "kind": "var",
                "title": "Ищем",
                "slots": [
                  {
                    "label": "ключ",
                    "items": [
                      "go"
                    ]
                  },
                  {
                    "label": "H2",
                    "items": [
                      "0x2A"
                    ]
                  }
                ]
              },
              {
                "kind": "group",
                "title": "Группа",
                "tag": "8 слотов",
                "slots": [
                  {
                    "label": "ctrl · слоты 0→7",
                    "items": [
                      {
                        "g": "2A",
                        "flag": "rust"
                      },
                      {
                        "g": "19",
                        "flag": "c"
                      },
                      {
                        "g": "2A",
                        "flag": "go"
                      },
                      {
                        "g": "80",
                        "flag": "empty"
                      },
                      {
                        "g": "11",
                        "flag": "js"
                      },
                      "80",
                      "80",
                      "80"
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Три действия",
              "items": [
                "Сопоставить H2 = 2A со всеми 8 байтами ctrl → кандидаты: слоты 0 и 2",
                "Сравнить ключи: rust ≠ go, go = go → вернуть значение",
                "Если бы ключа не было: в группе есть empty → ключа нет; иначе — следующая группа по H1 (смещения 0, 1, 3, 6…)"
              ]
            }
          }
        ],
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
        "board": [
          {
            "caption": "Малая map → таблица",
            "hl": [],
            "lanes": [
              {
                "kind": "group",
                "title": "Малая map",
                "tag": "одна группа, до 8 записей",
                "slots": [
                  {
                    "label": "слоты",
                    "items": [
                      "k1",
                      "k2",
                      "…",
                      "k8"
                    ],
                    "queue": true
                  }
                ],
                "note": "Без директории и таблицы; удалённых слотов в малой map не бывает."
              },
              {
                "kind": "table",
                "title": "Таблица",
                "tag": "группы по 8 слотов",
                "slots": [
                  {
                    "label": "ёмкость",
                    "items": [
                      "512 → 1024 слота"
                    ]
                  }
                ],
                "note": "Загрузка до 7/8; сначала можно убрать tombstones (pruneTombstones), иначе таблица удваивается."
              }
            ],
            "list": {
              "items": [
                "Go 1.26.1: присваивание при 8 записях (даже обновление ключа) → таблица на 16 слотов (директория из одной ссылки); в Go 1.27 обновление существующего ключа рост не вызывает",
                "Таблица до 1024 слотов растёт удвоением"
              ]
            }
          },
          {
            "caption": "Предел 1024 слота: split и директория",
            "hl": [
              "T2",
              "T3"
            ],
            "hlLabel": "после split",
            "lanes": [
              {
                "kind": "dir",
                "title": "Директория",
                "tag": "globalDepth = 2",
                "slots": [
                  {
                    "label": "00",
                    "items": [
                      "T1"
                    ]
                  },
                  {
                    "label": "01",
                    "items": [
                      "T1"
                    ]
                  },
                  {
                    "label": "10",
                    "items": [
                      "T2"
                    ]
                  },
                  {
                    "label": "11",
                    "items": [
                      "T3"
                    ]
                  }
                ],
                "note": "Индекс — старшие биты хеша; несколько записей могут указывать на одну таблицу."
              },
              {
                "kind": "table",
                "title": "T1",
                "tag": "localDepth = 1",
                "slots": []
              },
              {
                "kind": "table",
                "title": "T2 и T3",
                "tag": "localDepth = 2",
                "slots": [
                  {
                    "label": "таблицы",
                    "items": [
                      "T2",
                      "T3"
                    ]
                  }
                ],
                "note": "Получились делением одной таблицы на пределе 1024 слота."
              }
            ],
            "list": {
              "items": [
                "Таблица на пределе 1024 слота делится на две (T2 и T3)",
                "Если localDepth делимой таблицы равен globalDepth, директория удваивается",
                "Каждая таблица растёт отдельно: перестройка затрагивает часть map, а не всю"
              ]
            }
          }
        ],
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
        "board": [
          {
            "caption": "delete(m, \"rust\")",
            "hl": [
              "FE"
            ],
            "lanes": [
              {
                "kind": "group",
                "title": "Группа таблицы map#1",
                "slots": [
                  {
                    "label": "ctrl",
                    "items": [
                      {
                        "g": "FE",
                        "flag": "было rust"
                      },
                      {
                        "g": "2A",
                        "flag": "go"
                      },
                      "19",
                      "11",
                      "2B",
                      "3C",
                      "4D",
                      "5E"
                    ],
                    "queue": true
                  }
                ],
                "note": "В группе таблицы без свободного слота удалённый становится tombstone (FE); если empty есть — сразу empty (80). В малой map — всегда сразу 80. Таблица не сжимается."
              }
            ],
            "list": {
              "items": [
                "Запись удалена: значение недостижимо и может быть собрано GC",
                "Память таблицы остаётся: len(m) уменьшился, ёмкость — нет"
              ]
            }
          },
          {
            "caption": "alias := m; m = make(map…)",
            "hl": [
              "map#2"
            ],
            "lanes": [
              {
                "kind": "var",
                "title": "Ссылки",
                "slots": [
                  {
                    "label": "m",
                    "items": [
                      {
                        "g": "map#2",
                        "flag": "новая"
                      }
                    ]
                  },
                  {
                    "label": "alias",
                    "items": [
                      {
                        "g": "map#1",
                        "flag": "держит старую"
                      }
                    ]
                  }
                ],
                "note": "Старая map освободится, только когда исчезнут все ссылки; RSS может не уменьшиться сразу."
              }
            ],
            "list": {
              "items": [
                "m теперь указывает на новую map",
                "alias удерживает map#1 со всеми записями"
              ]
            }
          }
        ],
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
    "versionNote": "Классическая схема: Go 1.17. Swiss Tables: Go 1.25.0 и 1.26.1. H2 и ключи в примере подобраны для объяснения; SIMD/SWAR не означает одну инструкцию на весь поиск. noswissmap доступен в 1.25, но переключатель удалён в 1.26. Go 1.27.3: малая map не растёт при обновлении существующего ключа; на arm64 поиск H2 считается формулой без ложных срабатываний; GOEXPERIMENT=mapsplitgroup хранит ключи и значения группы отдельными массивами (по умолчанию выключен).",
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
  },
  {
    "id": "sim8",
    "title": "Диаграмма 8: sync.Mutex — быстрый путь, ожидание и режим голодания",
    "subtitle": "Семь шагов по Go 1.26.1 (internal/sync/mutex.go): слово state → быстрый путь → спин → очередь на семафоре → Unlock → режим голодания → ответ за минуту. Учебная модель: тайминги и порядок пробуждения не обещаны.",
    "cardId": "c21",
    "cardLabel": "Q21: мьютекс, ожидание и 1 мс →",
    "boardLegend": "state — одно слово int32: бит 0 — locked (L), бит 1 — woken (W), бит 2 — starving (S), биты с 3 — число ждущих. Биты слева направо: старший → младший. Рамкой выделено то, что изменилось.",
    "sources": [
      {
        "title": "go1.26.1: internal/sync/mutex.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/sync/mutex.go"
      },
      {
        "title": "go1.26.1: sync/mutex.go (документация)",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/mutex.go"
      },
      {
        "title": "go1.26.1: runtime/proc.go (canSpin)",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/proc.go"
      },
      {
        "title": "go1.26.1: runtime/sema.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/sema.go"
      },
      {
        "title": "sync.Mutex — pkg.go.dev",
        "url": "https://pkg.go.dev/sync#Mutex"
      }
    ],
    "steps": [
      {
        "title": "1. Одно слово state: три флага и счётчик",
        "desc": "sync.Mutex (с Go 1.24 — обёртка над internal/sync.Mutex) хранит два 32-битных поля, всего 8 байт: state int32 и sema uint32. В state бит 0 — locked (1), бит 1 — woken (2), бит 2 — starving (4), а биты с 3 и выше — число ждущих горутин. Пример: state = 17 = 0b10001 — мьютекс занят, ждут две горутины. sema — адрес, на котором ждущие спят в семафоре рантайма.",
        "descEN": "A sync.Mutex (since Go 1.24 a wrapper around internal/sync.Mutex) holds two 32-bit fields, 8 bytes in total: state int32 and sema uint32. In state, bit 0 is locked (1), bit 1 is woken (2), bit 2 is starving (4), and bits 3 and up count waiting goroutines. Example: state = 17 = 0b10001 — the mutex is locked and two goroutines wait. sema is the address on which waiters sleep in the runtime semaphore.",
        "board": [
          {
            "hl": [],
            "hlLabel": "установлен",
            "lanes": [
              {
                "kind": "var",
                "title": "state = 17",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L",
                        "hl": true
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "Как читать",
                "slots": [
                  {
                    "label": "locked",
                    "items": [
                      "state & 1 = 1"
                    ]
                  },
                  {
                    "label": "ждущие",
                    "items": [
                      "state >> 3 = 2"
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "sema",
                "slots": [],
                "note": "Очередь ждущих — в семафоре рантайма по адресу &m.sema."
              }
            ],
            "list": {
              "items": [
                "mutexLocked = 1, mutexWoken = 2, mutexStarving = 4",
                "mutexWaiterShift = 3: ждущие = state >> 3",
                "Добавить ждущего: state += 1 << 3"
              ],
              "title": "Константы и операции"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "What is state for a free mutex with no waiters?",
          "promptRU": "Какое значение state у свободного мьютекса без ждущих?",
          "answerEN": "0, which is why the fast path is CAS(0 → 1).",
          "answerRU": "0: поэтому быстрый путь — CAS(0 → 1)."
        }
      },
      {
        "title": "2. Lock: быстрый путь — один CAS(0 → 1)",
        "desc": "Если state = 0, Lock выполняет CompareAndSwapInt32(&state, 0, 1) и сразу возвращается: ни runtime, ни очереди. Эта часть маленькая и встраивается (inline) в вызывающий код. Не вышло — переход в lockSlow. Unlock тоже начинается с быстрого пути: AddInt32(&state, −1); результат 0 значит, будить некого.",
        "descEN": "If state is 0, Lock does CompareAndSwapInt32(&state, 0, 1) and returns at once: no runtime, no queue. This part is small and inlined into the caller. If it fails, lockSlow runs. Unlock also starts with a fast path: AddInt32(&state, −1); a result of 0 means nobody needs waking.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "Lock()",
                    "items": [
                      {
                        "g": "CAS(0 → 1)",
                        "flag": "true",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "было",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "0",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "стало",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L",
                        "hl": true
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Быстрый путь Lock: одна атомарная операция",
                "Быстрый путь Unlock: state − 1 == 0 → готово"
              ],
              "title": "Быстрые пути"
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why doesn't Lock call into the runtime when the mutex is free?",
          "promptRU": "Почему Lock не вызывает runtime, если мьютекс свободен?",
          "answerEN": "Acquiring is one successful CAS; the runtime is needed only for waiting.",
          "answerRU": "Захват — это один успешный CAS; runtime нужен только для ожидания."
        }
      },
      {
        "title": "3. Занято: короткий активный спин",
        "desc": "G2 видит locked = 1. Если мьютекс не в режиме голодания и runtime_canSpin разрешает, G2 немного крутится: до 4 итераций, каждая — procyield(30), то есть 30 инструкций PAUSE на amd64, в надежде, что G1 скоро отпустит. Условия спина: больше одного CPU; GOMAXPROCS больше, чем простаивающие P плюс ищущие работу потоки M плюс один; пустая локальная очередь своего P. Если уже есть спящие ждущие, крутящаяся G2 может поставить woken, чтобы Unlock не будил ещё одного.",
        "descEN": "G2 sees locked = 1. If the mutex is not starving and runtime_canSpin allows it, G2 spins briefly: up to 4 iterations, each procyield(30), that is 30 PAUSE instructions on amd64, hoping G1 releases soon. Spinning requires more than one CPU, GOMAXPROCS greater than idle Ps plus spinning Ms plus one, and an empty local run queue on its own P. If sleeping waiters exist, the spinning G2 may set woken so that Unlock does not wake another one.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "держит",
                    "items": [
                      "мьютекс"
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G2",
                "slots": [
                  {
                    "label": "спин",
                    "items": [
                      "итерации 1–4",
                      "procyield(30)"
                    ]
                  }
                ]
              },
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "было",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "стало",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "1",
                        "flag": "W",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ],
                "note": "Было: locked, один спящий ждущий. G2 поставила woken: «я рядом, не буди других»."
              }
            ],
            "list": {
              "items": [
                "Спин только в нормальном режиме и при runtime_canSpin",
                "До 4 итераций по procyield(30) — PAUSE на amd64",
                "woken ставится, только если есть спящие ждущие"
              ]
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Will a goroutine spin on a mutex when GOMAXPROCS = 1?",
          "promptRU": "Будет ли горутина крутиться на мьютексе при GOMAXPROCS = 1?",
          "answerEN": "No: canSpin requires other running Ps. With one P the holder cannot run and release the mutex while we spin.",
          "answerRU": "Нет: canSpin требует других работающих P. На одном P держатель не может выполниться и отпустить мьютекс, пока мы крутимся."
        }
      },
      {
        "title": "4. Очередь: семафор и сон",
        "desc": "Спин не помог. G2 одним CAS увеличивает счётчик ждущих (+8) и снимает свой флаг woken (−2): 11 → 17. Затем вызывает runtime_SemacquireMutex(&sema): горутина паркуется в очереди семафора и не тратит CPU. Если горутина уже ждала раньше и снова проиграла, она встаёт в начало очереди (LIFO), а не в конец.",
        "descEN": "Spinning did not help. With one CAS G2 adds itself to the waiter count (+8) and clears its own woken bit (−2): 11 → 17. Then it calls runtime_SemacquireMutex(&sema): the goroutine parks in the semaphore queue and uses no CPU. A goroutine that has already waited and lost again goes to the front of the queue (LIFO), not the back.",
        "board": [
          {
            "hl": [
              "G2"
            ],
            "hlLabel": "изменилось",
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "держит",
                    "items": [
                      "мьютекс"
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "sema",
                "slots": [
                  {
                    "label": "очередь · голова →",
                    "items": [
                      "G3",
                      "G2"
                    ],
                    "queue": true
                  }
                ],
                "note": "G3 ждала раньше. Повторно проигравшая горутина встала бы в голову."
              },
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "11 → 17 · ждущих 2",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "0",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Один CAS: ждущих +1 (+8) и woken снят (−2): 11 → 17",
                "G2 спит в семафоре: CPU не тратит",
                "Повторно проигравшая встаёт в голову очереди (queueLifo)"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Does a wait queue mean the mutex is handed out strictly in order?",
          "promptRU": "Раз есть очередь, мьютекс отдаётся строго по порядку?",
          "answerEN": "No. In normal mode a woken goroutine competes with newcomers and may lose.",
          "answerRU": "Нет. В нормальном режиме разбуженная горутина конкурирует с новыми и может проиграть."
        }
      },
      {
        "title": "5. Unlock: разбудить одного, но не отдать",
        "desc": "G1 вызывает Unlock: AddInt32(state, −1) снимает locked. Если осталось ненулевое значение, unlockSlow проверяет: есть ждущие, и никто ещё не разбужен и не захватил мьютекс — тогда CAS уменьшает счётчик ждущих, ставит woken и будит одну горутину из семафора. В нормальном режиме разбуженная G3 не получает мьютекс автоматически: она снова борется за него, и новая горутина G4, уже работающая на CPU, часто успевает первой. Проигравшая G3 возвращается в голову очереди.",
        "descEN": "G1 calls Unlock: AddInt32(state, −1) clears locked. If the result is non-zero, unlockSlow checks that there are waiters and that nobody has been woken or has taken the mutex; then a CAS decrements the waiter count, sets woken and wakes one goroutine from the semaphore. In normal mode the woken G3 does not get the mutex automatically: it competes again, and a new goroutine G4 already running on a CPU often wins. The losing G3 goes back to the front of the queue.",
        "predict": {
          "promptEN": "G1 releases the mutex; G3 is woken, and at the same moment a new G4 arrives. Who gets the mutex?",
          "promptRU": "G1 отпускает мьютекс; G3 разбужена, и одновременно приходит новая G4. Кто получит мьютекс?"
        },
        "board": [
          {
            "hl": [
              "G3",
              "G4"
            ],
            "hlLabel": "соревнуются",
            "lanes": [
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "Unlock()",
                    "items": [
                      "state − 1",
                      "Semrelease: разбудить одного"
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "sema",
                "slots": [
                  {
                    "label": "очередь · голова →",
                    "items": [
                      "G2"
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "Разбужена",
                "slots": [
                  {
                    "label": "G",
                    "items": [
                      {
                        "g": "G3",
                        "flag": "woken"
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "g",
                "title": "Только пришла",
                "slots": [
                  {
                    "label": "G",
                    "items": [
                      {
                        "g": "G4",
                        "flag": "CAS(0 → 1)"
                      }
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Unlock: state − 1; не ноль → unlockSlow",
                "Будит одну горутину, ставит woken, ждущих − 1",
                "G3 и новая G4 соревнуются; часто выигрывает G4 — она уже на CPU",
                "Проигравшая G3 возвращается в голову очереди"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "May a goroutine other than the one that called Lock call Unlock?",
          "promptRU": "Можно ли вызвать Unlock из другой горутины, не той, что делала Lock?",
          "answerEN": "Yes: a locked Mutex is not associated with a goroutine. But unlocking an unlocked mutex is a fatal runtime error, not a recoverable panic.",
          "answerRU": "Да: заблокированный Mutex не привязан к горутине. Но Unlock незаблокированного — фатальная ошибка рантайма, recover не поможет."
        }
      },
      {
        "title": "6. Режим голодания: прямая передача",
        "desc": "Если ждущая горутина не может получить мьютекс дольше 1 мс, она переключает его в режим голодания (starving). Теперь Unlock передаёт владение прямо голове очереди и уступает ей процессор; новые горутины не крутятся и не пытаются захватить мьютекс, даже если он выглядит свободным, а встают в хвост. Режим выключается, когда получившая мьютекс горутина последняя в очереди или ждала меньше 1 мс. Нормальный режим быстрее, режим голодания защищает от долгих хвостовых задержек.",
        "descEN": "If a waiter cannot get the mutex for more than 1 ms, it switches the mutex to starvation mode. Unlock then hands ownership directly to the head of the queue and yields the processor to it; new goroutines do not spin or try to grab the mutex even if it looks free, and queue at the tail. The mode ends when the goroutine that got the mutex is the last waiter or waited less than 1 ms. Normal mode is faster; starvation mode protects against long tail latency.",
        "board": [
          {
            "hl": [
              "G3",
              "G4"
            ],
            "hlLabel": "изменилось",
            "lanes": [
              {
                "kind": "var",
                "title": "state",
                "slots": [
                  {
                    "label": "starving · ждущих 3",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "flag": "S",
                        "hl": true
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "0",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "g",
                "title": "G1",
                "slots": [
                  {
                    "label": "Unlock()",
                    "items": [
                      "Semrelease(handoff = true)"
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "sema",
                "slots": [
                  {
                    "label": "очередь · голова →",
                    "items": [
                      {
                        "g": "G3",
                        "flag": "получает мьютекс"
                      },
                      "G2",
                      {
                        "g": "G4",
                        "flag": "новая — в хвост"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Ждёт дольше 1 мс → starving = 1",
                "Unlock передаёт мьютекс голове очереди напрямую",
                "Новые горутины (G4) не крутятся, встают в хвост и прибавляют себя к счётчику ждущих",
                "state = 28: S и трое ждущих (G3, G2, G4); G3 после пробуждения сама ставит L и вычитает себя (+1 −8)",
                "Выход: последний ждущий или ожидание меньше 1 мс"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Does 1 ms mean Lock never waits longer than 1 ms?",
          "promptRU": "Значит ли 1 мс, что Lock ждёт не дольше 1 мс?",
          "answerEN": "No. It is the threshold for switching modes, not a timeout: Lock waits as long as needed.",
          "answerRU": "Нет. Это порог переключения режима, а не таймаут: Lock ждёт сколько потребуется."
        }
      },
      {
        "title": "7. Ответ за минуту и ловушки",
        "desc": "Сводка: короткий ответ на английском и формулировки, на которых часто ошибаются.",
        "descEN": "A summary: a short English answer and common mistakes.",
        "board": [
          {
            "caption": "Ответ за минуту (EN)",
            "list": {
              "ordered": true,
              "title": "sync.Mutex",
              "items": [
                "A sync.Mutex is 8 bytes: an int32 state with locked, woken and starving bits plus a waiter count, and a uint32 sema.",
                "The Lock fast path is one CAS from 0 to locked; the Unlock fast path is an atomic subtract.",
                "Under contention a goroutine may spin briefly on multicore machines, then sleeps on a runtime semaphore.",
                "In normal mode waiters queue FIFO, but a woken waiter competes with newcomers, so acquisition is not FIFO; this gives better throughput.",
                "If a waiter waits more than 1 ms, starvation mode hands the lock directly to the queue head and newcomers queue at the tail.",
                "A Mutex is not reentrant and not tied to a goroutine; unlocking an unlocked mutex is fatal; do not copy it after first use."
              ]
            }
          },
          {
            "caption": "Ловушки",
            "list": {
              "title": "Упрощение → точнее",
              "items": [
                "«Mutex — очередь FIFO» → строго по очереди только в режиме голодания; в нормальном новички часто обгоняют",
                "«1 мс — таймаут» → порог переключения режима",
                "«Unlock будит всех» → будит одну горутину, и только если никто ещё не разбужен",
                "«Повторный Lock той же горутиной пройдёт» → deadlock: мьютекс не реентерабельный",
                "«Unlock может вызвать только владелец» → в Go Mutex не привязан к горутине",
                "«Unlock без Lock — panic» → фатальная ошибка рантайма, recover не поможет",
                "«Копия мьютекса — та же блокировка» → копия независима, но берёт текущее состояние: копия занятого мьютекса тоже занята; go vet (copylocks) ловит типичные случаи, не все",
                "«TryLock решает гонки» → корректные случаи редки, часто это признак проблемы в дизайне (документация sync)"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why is starvation mode slower than normal mode?",
          "promptRU": "Почему режим голодания медленнее нормального?",
          "answerEN": "Every handoff goes through waking a sleeping goroutine; normal mode lets a running goroutine take the mutex several times in a row without switches.",
          "answerRU": "Каждая передача идёт через пробуждение спящей горутины; нормальный режим позволяет работающей горутине захватывать мьютекс несколько раз подряд без переключений."
        }
      }
    ]
  },
  {
    "id": "sim9",
    "title": "Диаграмма 9: битовые операции — маски, флаги и SWAR в рантайме",
    "subtitle": "Восемь шагов: операции на одном байте → маски → флаги мьютекса → H1/H2 → поиск H2 сразу в 8 байтах → обход битсета → атомарные And/Or → ответ и ловушки. Числа посчитаны; реальные хеши другие.",
    "cardId": "c31",
    "cardLabel": "Карточка Q31 (SwissTables) →",
    "boardLegend": "Биты в строке — старший слева (бит 7 → бит 0); байты map — слоты 0 → 7. Рамкой выделено то, что дало результат.",
    "sources": [
      {
        "title": "Go spec: arithmetic and bitwise operators",
        "url": "https://go.dev/ref/spec#Arithmetic_operators"
      },
      {
        "title": "Go spec: operator precedence",
        "url": "https://go.dev/ref/spec#Operator_precedence"
      },
      {
        "title": "go1.26.1: internal/runtime/maps/group.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/runtime/maps/group.go"
      },
      {
        "title": "go1.27.3: internal/runtime/maps/group.go (arm64 matchH2)",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/internal/runtime/maps/group.go#L161-L178"
      },
      {
        "title": "go1.26.1: internal/sync/mutex.go",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/sync/mutex.go"
      },
      {
        "title": "math/bits",
        "url": "https://pkg.go.dev/math/bits"
      },
      {
        "title": "sync/atomic (And/Or с Go 1.23)",
        "url": "https://pkg.go.dev/sync/atomic"
      }
    ],
    "steps": [
      {
        "title": "1. Шесть операций на одном байте",
        "desc": "a = 0b11001010 (202), b = 0b10100110 (166), тип uint8. & — оба бита 1; | — хотя бы один; ^ — биты разные; &^ (AND NOT, есть в Go) — бит из a, если в b он 0; << и >> сдвигают, а биты, вышедшие за 8, теряются. Унарный ^x в Go — побитовое НЕ.",
        "descEN": "a = 0b11001010 (202), b = 0b10100110 (166), type uint8. & keeps bits set in both; | in either; ^ where they differ; &^ (AND NOT, a Go operator) keeps a's bits that are 0 in b; << and >> shift, and bits pushed past 8 are lost. Unary ^x in Go is bitwise NOT.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "Операнды",
                "slots": [
                  {
                    "label": "a = 202",
                    "items": [
                      {
                        "g": "1"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  },
                  {
                    "label": "b = 166",
                    "items": [
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a & b = 130",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a | b = 238",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a ^ b = 108",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a &^ b = 72",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a << 1 = 148",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "a >> 2 = 50",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "a << 1 = 148: старший бит a ушёл за пределы uint8",
                "^a = 53 (0b00110101) — побитовое НЕ для uint8"
              ],
              "title": "Заметки"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "What is 0b1100 &^ 0b1010?",
          "promptRU": "Чему равно 0b1100 &^ 0b1010?",
          "answerEN": "0b0100: the bits of the first number that are not set in the second.",
          "answerRU": "0b0100: остаются биты первого числа, которых нет во втором."
        }
      },
      {
        "title": "2. Маски и степень двойки",
        "desc": "Если n — степень двойки, x % n == x & (n − 1) для неотрицательного x: маска оставляет младшие биты. Поэтому размеры таблиц в рантайме — степени двойки: смещение группы в map — h1 & lengthMask, без деления. x & (x − 1) сбрасывает младший единичный бит: при x > 0 результат 0 значит, что x — степень двойки. x & −x оставляет только младший единичный бит.",
        "descEN": "If n is a power of two, x % n == x & (n − 1) for non-negative x: the mask keeps the low bits. That is why runtime tables have power-of-two sizes: a map group offset is h1 & lengthMask, with no division. x & (x − 1) clears the lowest set bit: for x > 0 a result of 0 means x is a power of two. x & −x keeps only the lowest set bit.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "x = 45",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "mask = n − 1 (n = 8) = 7",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "hl": true
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "x & mask = 5",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "x & (x − 1) = 44",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "64 & 63 = 0",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "45 % 8 = 45 & 7 = 5",
                "45 & 44 = 44 ≠ 0 → 45 не степень двойки; 64 & 63 = 0 → 64 — степень двойки",
                "maps: смещение группы = h1 & lengthMask (table.go makeProbeSeq)"
              ],
              "title": "Проверка"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Are x % 8 and x & 7 equal for x = −3?",
          "promptRU": "Равны ли x % 8 и x & 7 при x = −3?",
          "answerEN": "No: −3 % 8 = −3 (Go keeps the sign of the dividend), while −3 & 7 = 5. The mask trick holds for non-negative x.",
          "answerRU": "Нет: −3 % 8 = −3 (в Go знак берётся от делимого), а −3 & 7 = 5. Трюк с маской верен для неотрицательных x."
        }
      },
      {
        "title": "3. Флаги в одном слове: state мьютекса",
        "desc": "Проверить флаг: state & mutexLocked != 0. Поставить: state | mutexWoken. Снять: state &^ mutexWoken. Счётчик в старших битах: state >> 3 — число ждущих, state + 1<<3 — добавить ждущего. В Go & связывает сильнее, чем ==, поэтому x&1 == 0 читается как (x&1) == 0 — в отличие от C.",
        "descEN": "Test a flag: state & mutexLocked != 0. Set: state | mutexWoken. Clear: state &^ mutexWoken. A counter in the high bits: state >> 3 is the number of waiters, state + 1<<3 adds one. In Go & binds tighter than ==, so x&1 == 0 means (x&1) == 0, unlike C.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "var",
                "title": "state = 17",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "state | woken = 19",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "1",
                        "flag": "W",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "19 &^ woken = 17",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "ждущие"
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "17 + 1<<3 = 25",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "1",
                        "flag": "ждущие",
                        "hl": true
                      },
                      {
                        "g": "0",
                        "flag": "S"
                      },
                      {
                        "g": "0",
                        "flag": "W"
                      },
                      {
                        "g": "1",
                        "flag": "L"
                      }
                    ],
                    "queue": true
                  }
                ],
                "note": "25 >> 3 = 3 ждущих"
              }
            ],
            "list": {
              "items": [
                "Проверить: state&mutexLocked != 0",
                "Поставить: state |= mutexWoken; снять: state &^= mutexWoken",
                "Счётчик: state >> 3; добавить: state += 1 << 3"
              ],
              "title": "Операции с флагами"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "How do you write \"bit 2 is clear\" in Go without extra parentheses?",
          "promptRU": "Как в Go записать «бит 2 снят» без лишних скобок?",
          "answerEN": "state&4 == 0, because & has higher precedence than ==.",
          "answerRU": "state&4 == 0: у & приоритет выше, чем у ==."
        }
      },
      {
        "title": "4. Хеш на части: H1 и H2",
        "desc": "Swiss map делит 64-битный хеш: H2 = h & 0x7f — младшие 7 бит (отпечаток в байте ctrl), H1 = h >> 7 — остальные 57 (выбор группы). Таблицу в директории выбирают старшие биты: h >> globalShift. Пример на младшем байте хеша 0b10101010 (0xAA): H2 = 0x2A, а бит 7 уходит в H1. Это тот же отпечаток 2A, что на диаграмме 7.",
        "descEN": "A Swiss map splits a 64-bit hash: H2 = h & 0x7f, the low 7 bits (the fingerprint in a ctrl byte), and H1 = h >> 7, the other 57 bits (group selection). The directory picks a table by the high bits: h >> globalShift. Example on the low byte of a hash, 0b10101010 (0xAA): H2 = 0x2A, and bit 7 goes to H1. It is the same 2A fingerprint as in diagram 7.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "младший байт хеша (0xAA) = 170",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "H2 = h & 0x7F (0x2A) = 42",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "H1 = h >> 7",
                "slots": [
                  {
                    "label": "младший бит H1",
                    "items": [
                      {
                        "g": "1",
                        "flag": "бит 7 хеша",
                        "hl": true
                      }
                    ]
                  }
                ],
                "note": "Остальные 56 бит H1 — из старших байтов хеша."
              }
            ],
            "list": {
              "items": [
                "0xAA & 0x7F = 0x2A — отпечаток в ctrl",
                "h >> 7 — H1 для пробирования групп",
                "h >> globalShift — старшие биты для выбора таблицы"
              ],
              "title": "Что куда"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why is the top bit of an occupied ctrl byte always 0?",
          "promptRU": "Почему у занятого байта ctrl старший бит всегда 0?",
          "answerEN": "H2 uses 7 bits (0x00–0x7F), while empty (0x80) and deleted (0xFE) have the top bit set, so a single bit tells them apart from occupied slots.",
          "answerRU": "H2 занимает 7 бит (0x00–0x7F), а у empty (0x80) и deleted (0xFE) старший бит 1 — по одному биту их отличают от занятых."
        }
      },
      {
        "title": "5. SWAR: найти H2 сразу в 8 байтах",
        "desc": "Восемь байтов ctrl читаются как одно uint64 (SWAR — SIMD within a register). Шаг 1: v = ctrl ^ (0x0101…01 × H2) — совпавшие байты становятся 0x00. Шаг 2: (v − 0x0101…01) &^ v & 0x8080…80 — у нулевых байтов появляется старший бит. Итог — маска кандидатов. Пример: ctrl = [2A 19 2A 80 11 80 80 80], H2 = 2A → v = [00 33 00 AA 3B AA AA AA] → результат 0x0000000000800080: кандидаты — слоты 0 и 2. Переносы при вычитании дают редкие ложные срабатывания, но только при настоящем совпадении рядом; ключи всё равно сравниваются. На amd64 вместо этого — SIMD-инструкции.",
        "descEN": "Eight ctrl bytes are read as one uint64 (SWAR — SIMD within a register). Step 1: v = ctrl ^ (0x0101…01 × H2), so matching bytes become 0x00. Step 2: (v − 0x0101…01) &^ v & 0x8080…80 sets the top bit of the zero bytes. The result is a mask of candidates. Example: ctrl = [2A 19 2A 80 11 80 80 80], H2 = 2A → v = [00 33 00 AA 3B AA AA AA] → result 0x0000000000800080: candidates are slots 0 and 2. Borrows in the subtraction cause rare false positives, but only next to a real match, and keys are compared anyway. On amd64 SIMD instructions are used instead.",
        "predict": {
          "promptEN": "ctrl = [2A 19 2A 80 11 80 80 80], H2 = 2A. Which bytes become zero after the XOR, and which slots are candidates?",
          "promptRU": "ctrl = [2A 19 2A 80 11 80 80 80], ищем H2 = 2A. Какие байты станут нулевыми после XOR и какие слоты — кандидаты?"
        },
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "ctrl (слоты 0 → 7)",
                "slots": [
                  {
                    "label": "байты",
                    "items": [
                      {
                        "g": "2A",
                        "flag": "слот 0",
                        "hl": true
                      },
                      {
                        "g": "19",
                        "flag": "слот 1"
                      },
                      {
                        "g": "2A",
                        "flag": "слот 2",
                        "hl": true
                      },
                      {
                        "g": "80",
                        "flag": "слот 3"
                      },
                      {
                        "g": "11",
                        "flag": "слот 4"
                      },
                      {
                        "g": "80",
                        "flag": "слот 5"
                      },
                      {
                        "g": "80",
                        "flag": "слот 6"
                      },
                      {
                        "g": "80",
                        "flag": "слот 7"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "v = ctrl ^ 2A2A…2A",
                "slots": [
                  {
                    "label": "байты",
                    "items": [
                      {
                        "g": "00",
                        "flag": "слот 0",
                        "hl": true
                      },
                      {
                        "g": "33",
                        "flag": "слот 1"
                      },
                      {
                        "g": "00",
                        "flag": "слот 2",
                        "hl": true
                      },
                      {
                        "g": "AA",
                        "flag": "слот 3"
                      },
                      {
                        "g": "3B",
                        "flag": "слот 4"
                      },
                      {
                        "g": "AA",
                        "flag": "слот 5"
                      },
                      {
                        "g": "AA",
                        "flag": "слот 6"
                      },
                      {
                        "g": "AA",
                        "flag": "слот 7"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "(v − 0101…01) &^ v & 8080…80",
                "slots": [
                  {
                    "label": "байты",
                    "items": [
                      {
                        "g": "80",
                        "flag": "слот 0",
                        "hl": true
                      },
                      {
                        "g": "00",
                        "flag": "слот 1"
                      },
                      {
                        "g": "80",
                        "flag": "слот 2",
                        "hl": true
                      },
                      {
                        "g": "00",
                        "flag": "слот 3"
                      },
                      {
                        "g": "00",
                        "flag": "слот 4"
                      },
                      {
                        "g": "00",
                        "flag": "слот 5"
                      },
                      {
                        "g": "00",
                        "flag": "слот 6"
                      },
                      {
                        "g": "00",
                        "flag": "слот 7"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "ordered": true,
              "title": "Две формулы",
              "items": [
                "XOR с повторённым H2 обнуляет совпавшие байты",
                "Вычитание 0x01 в каждом байте даёт 0xFF у нулевых (и из-за заёма — у 0x01 над нулевым: ложный кандидат); &^ v и & 0x80… оставляют их старший бит",
                "Маска 0x800080 → кандидаты: слоты 0 и 2",
                "Go 1.27: на arm64 формула другая — ((^v & 0x7F…) + 0x01…) & (^v & 0x80…), без ложных срабатываний (go1.27.3, group.go:162–166)"
              ]
            },
            "hlLabel": "кандидат"
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "Why does a false positive not break the lookup?",
          "promptRU": "Почему ложное срабатывание не ломает поиск?",
          "answerEN": "The mask yields candidates, not answers: the key in each candidate slot is still compared. False positives are rare and only appear next to a real match.",
          "answerRU": "Маска даёт кандидатов, а не ответ: ключ в слоте всё равно сравнивается. Ложные кандидаты редки и бывают только рядом с настоящим совпадением."
        }
      },
      {
        "title": "6. Обход найденных битов",
        "desc": "Маска 0x800080 содержит кандидатов. bits.TrailingZeros64(b) >> 3 даёт номер первого слота: 7 >> 3 = 0. Затем b &= b − 1 снимает младший единичный бит, и следующий TrailingZeros64 = 23 → слот 2. Цикл заканчивается при b == 0. Так рантайм перебирает только кандидатов, а не все восемь байтов.",
        "descEN": "The mask 0x800080 holds the candidates. bits.TrailingZeros64(b) >> 3 gives the first slot: 7 >> 3 = 0. Then b &= b − 1 clears the lowest set bit, and the next TrailingZeros64 = 23 → slot 2. The loop ends when b == 0. The runtime visits only candidates, not all eight bytes.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "other",
                "title": "Итерация 1",
                "slots": [
                  {
                    "label": "b",
                    "items": [
                      "0x800080"
                    ]
                  },
                  {
                    "label": "TrailingZeros64",
                    "items": [
                      "7"
                    ]
                  },
                  {
                    "label": "слот",
                    "items": [
                      {
                        "g": "0",
                        "flag": "7 >> 3",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "Итерация 2",
                "slots": [
                  {
                    "label": "b &= b − 1",
                    "items": [
                      "0x800000"
                    ]
                  },
                  {
                    "label": "TrailingZeros64",
                    "items": [
                      "23"
                    ]
                  },
                  {
                    "label": "слот",
                    "items": [
                      {
                        "g": "2",
                        "flag": "23 >> 3",
                        "hl": true
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "other",
                "title": "Конец",
                "slots": [
                  {
                    "label": "b &= b − 1",
                    "items": [
                      "0"
                    ]
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "first: TrailingZeros64(b) >> 3 (group.go bitsetFirst)",
                "removeFirst: b & (b − 1)",
                "На amd64 битсет упакован: по биту на слот, сдвиг не нужен"
              ]
            },
            "hlLabel": "слот"
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "What does b & (b − 1) do?",
          "promptRU": "Что делает b & (b − 1)?",
          "answerEN": "It clears the lowest set bit; a loop `for b != 0 { …; b &= b − 1 }` visits every set bit.",
          "answerRU": "Сбрасывает младший единичный бит; цикл «пока b != 0: …; b &= b − 1» обходит все установленные биты."
        }
      },
      {
        "title": "7. Атомарные битовые операции",
        "desc": "С Go 1.23 в sync/atomic есть And и Or (функции AndInt32, OrInt32 и другие, методы Int32.And/Or): атомарно поставить флаг — Or(mask), снять — And(^mask); обе возвращают старое значение. До 1.23 для этого писали CAS-цикл: прочитать, вычислить old | mask, CompareAndSwap, повторить при неудаче. sync.Mutex использует CAS, потому что меняет флаги и счётчик ждущих одним действием.",
        "descEN": "Since Go 1.23 sync/atomic has And and Or (AndInt32, OrInt32 and others, plus Int32.And/Or methods): set a flag atomically with Or(mask), clear it with And(^mask); both return the old value. Before 1.23 this needed a CAS loop: read, compute old | mask, CompareAndSwap, retry on failure. sync.Mutex uses CAS because it changes flags and the waiter count in one step.",
        "board": [
          {
            "hl": [],
            "lanes": [
              {
                "kind": "var",
                "title": "flags (было)",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "flags.Or(0b100) → вернул 1",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1",
                        "hl": true
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      }
                    ],
                    "queue": true
                  }
                ]
              },
              {
                "kind": "other",
                "title": "flags.And(^0b1) → вернул 5",
                "slots": [
                  {
                    "label": "биты 7→0",
                    "items": [
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "1"
                      },
                      {
                        "g": "0"
                      },
                      {
                        "g": "0"
                      }
                    ],
                    "queue": true
                  }
                ]
              }
            ],
            "list": {
              "items": [
                "Or(mask): поставить биты, вернуть старое значение",
                "And(^mask): снять биты",
                "До Go 1.23: CAS-цикл с old | mask или old &^ mask"
              ],
              "title": "Операции"
            },
            "hlQuiet": true
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "How do you clear bit mask atomically?",
          "promptRU": "Как атомарно снять биты mask?",
          "answerEN": "flags.And(^mask) in Go 1.23+, or a CAS loop that writes old &^ mask.",
          "answerRU": "flags.And(^mask) в Go 1.23+ или CAS-цикл, который записывает old &^ mask."
        }
      },
      {
        "title": "8. Ответ за минуту и ловушки",
        "desc": "Сводка: короткие ответы на английском на частые вопросы о битах и формулировки, на которых часто ошибаются.",
        "descEN": "A summary: short English answers to common bit questions and frequent mistakes.",
        "board": [
          {
            "caption": "Короткие ответы (EN)",
            "list": {
              "ordered": true,
              "title": "Q → A",
              "items": [
                "Why are runtime tables sized as powers of two? — So that x % n becomes x & (n − 1), a single AND instead of a division.",
                "How do you check that x > 0 is a power of two? — x & (x − 1) == 0.",
                "What does &^ do? — AND NOT: it clears in x the bits that are set in y.",
                "How does a Swiss map compare H2 against 8 slots at once? — XOR the control word with H2 repeated, then (v − 0x01…) &^ v & 0x80… marks zero bytes; candidates are confirmed by comparing keys.",
                "How do you iterate over set bits? — TrailingZeros finds the lowest one, b &= b − 1 clears it."
              ]
            }
          },
          {
            "caption": "Ловушки",
            "list": {
              "items": [
                "x&1 == 0 в Go — это (x&1) == 0: у & приоритет выше, чем у == (в C наоборот)",
                "^x — побитовое НЕ; ~ в Go означает другое (только в ограничениях дженериков: ~int)",
                "Сдвиг на ширину типа и больше даёт 0 (у отрицательного знакового при >> — −1); это не неопределённое поведение, как в C; go vet (shift) предупредит о заведомо слишком большом сдвиге",
                "Отрицательный счётчик сдвига во время выполнения — panic",
                "Сдвиг знакового вправо арифметический: −8 >> 1 = −4",
                "x % n == x & (n − 1) только для неотрицательных x",
                "Переполнение переменных целых типов циклическое (uint8: 255 + 1 = 0); нетипизированные константы точны (const big = 1 << 100 компилируется), ошибка — у типизированной константы или при преобразовании в тип, где значение не помещается",
                "math/bits: OnesCount, LeadingZeros, TrailingZeros, Len, RotateLeft — компилятор часто заменяет их одной инструкцией"
              ]
            }
          }
        ],
        "boxes": [],
        "check": {
          "promptEN": "var x uint8 = 1. What is x << 8?",
          "promptRU": "var x uint8 = 1. Чему равно x << 8?",
          "answerEN": "0: the shifted-out bit is lost; there is no panic and no undefined behaviour. go vet warns: x (8 bits) too small for shift of 8.",
          "answerRU": "0: вышедший бит теряется; ни паники, ни неопределённого поведения. go vet предупредит: x (8 bits) too small for shift of 8."
        }
      }
    ]
  }
];

const CHEATSHEET_ROWS = [
  {
    "topic": "1. Горутина vs Поток ОС и Стек",
    "how": "Горутина → очередь → исполнение. <code>go</code> вычисляет аргументы у вызывающего; <code>newproc</code> подготавливает G и стек на <code>g0</code>. Готовность к запуску ещё не исполнение.",
    "markers": "Базовый <code>stackMin</code> — 2 КиБ в проверенной реализации; реальный размер и память процесса зависят от нагрузки. Нет универсальной цены переключения в нс.",
    "cardId": "c1",
    "simId": "sim1"
  },
  {
    "topic": "2. Регистры CPU и Переключение (gogo)",
    "how": "На amd64 <code>gogo</code> восстанавливает текущую G, SP, BP и контекст; переход к saved PC продолжает код. <code>mcall</code> переключает на системный стек g0.",
    "markers": "<strong>Кто → где стек → откуда продолжить.</strong> R14 хранит указатель на G, RSP — адрес в стеке, а не весь стек. Это детали amd64, не общий контракт CPU.",
    "cardId": "c6",
    "simId": "sim1"
  },
  {
    "topic": "3. Динамический рост стека (copystack)",
    "how": "Проверка места → <code>morestack/newstack</code> → новый стек → копирование кадров и исправление указателей. Guard также может означать запрос вытеснения.",
    "markers": "Обычный рост начинается с удвоения; крупному кадру может понадобиться больше. Уменьшение — отдельный безопасный путь. Возврат функции не гарантирует shrink или падения RSS.",
    "cardId": "c5",
    "simId": "sim1"
  },
  {
    "topic": "4. Планировщик GMP и слот P.runnext",
    "how": "G — горутина, M — поток ОС, P — ресурсы для Go-кода. <code>runnext</code> — один предпочтительный кандидат рядом с обычной очередью; вытесненный кандидат не теряется.",
    "markers": "Кандидат может наследовать остаток кванта (schedtick не увеличивается). <code>% 61</code> — условная проверка GRQ, не таймер; sysmon помогает справедливости. Кеш и скорость не гарантированы.",
    "cardId": "c11",
    "simId": "sim1"
  },
  {
    "topic": "5. Вытеснение (sysmon), Work Stealing и Syscall",
    "how": "Запрос вытеснения → безопасная точка → сохранение → планировщик. <code>runqgrab</code> забирает <code>ceil(n/2)</code> с головы обычной очереди; конкуренция может потребовать повтор.",
    "markers": "10 мс — порог реализации, не SLA. Syscall: 1.25 использует <code>_Psyscall</code>; 1.26 — состояние G и новый протокол изъятия P. Сетевое ожидание через netpoll — другой путь.",
    "cardId": "c9",
    "simId": "sim2"
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
