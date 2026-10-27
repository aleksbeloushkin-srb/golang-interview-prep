const QUIZ_QUESTIONS = [
  // =========================================================================
  // ЧАСТЬ 1: ЛОВУШКИ ЯЗЫКА И РАНТАЙМА (Q1 - Q8)
  // =========================================================================
  {
    "id": "q1",
    "title": "Задача 1: Три функции после завершения цикла",
    "ru": "В модуле с go 1.25 или go 1.26 что напечатает программа? Что изменится при старой семантике цикла до Go 1.22?",
    "en": "In a module declaring go 1.25 or go 1.26, what does this program print? How would pre-Go 1.22 loop semantics change the result?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tstart := make(chan struct{})\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 3; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\t<-start\n\t\t\tfmt.Println(i)\n\t\t}()\n\t}\n\tclose(start)\n\twg.Wait()\n}",
    "options": [
      "0, 1, 2 строго по порядку: WaitGroup заставляет горутины завершаться в порядке их создания.",
      "3, 3, 3 во всех версиях: закрытие start заменяет сохранённые значения i итоговым значением цикла.",
      "Могут отсутствовать строки: WaitGroup ждёт только запуск функций, но не завершение их печати.",
      "Будет deadlock: закрытие start освобождает только одну горутину, остальные продолжают ждать.",
      "По одному 0, 1 и 2 в любом порядке; при старой семантике все три строки содержат 3.",
      "По одному 0, 1 и 2 во всех версиях: каждый вызов go автоматически копирует переменные замыкания."
    ],
    "correct": 4,
    "explanationRU": "В Go 1.25/1.26 с соответствующей версией языка модуль печатает 0, 1 и 2 по одному разу, в произвольном порядке. Переменная i объявлена через := в заголовке for: начиная с семантики Go 1.22 у каждой итерации своя переменная. WaitGroup обеспечивает завершение всех трёх горутин, но не порядок печати. При старой семантике все замыкания используют одну i. Именно в этом примере они читают её только после close(start), когда цикл уже довёл i до 3, поэтому получится 3, 3, 3 без гонки на i. Без такого барьера прежний пример с Sleep не гарантировал ни эти значения, ни завершение печати и мог содержать data race. Семантика переменной сама по себе не обещает конкретного размещения в куче. Для самопроверки: объяви i до цикла и используй for i = 0; ... — тогда при сохранённом барьере все три строки будут 3 и в новой версии. Ниже явная передача аргумента сохраняет значения итераций и при старой семантике.",
    "speechEN": "It prints 0, 1 and 2 once each, in any order. With Go 1.22 or later language semantics, a loop variable declared with := is separate for each iteration. WaitGroup ensures completion, not ordering. Under the old semantics all closures share i, but this example makes them wait until the loop finishes, so all print 3 without racing on i. Declaring i outside the loop and using = would also share one variable today. Passing i as an argument makes the intended per-call value explicit across these versions.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tstart := make(chan struct{})\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 3; i++ {\n\t\twg.Add(1)\n\t\tgo func(value int) {\n\t\t\tdefer wg.Done()\n\t\t\t<-start\n\t\t\tfmt.Println(value)\n\t\t}(i)\n\t}\n\tclose(start)\n\twg.Wait()\n}",
    "versionNote": "Семантика итераций изменилась в Go 1.22 и зависит от версии языка пакета, обычно заданной go.mod. Для Go 1.25/1.26 здесь одинаковый результат. Форма с аргументом совместима и с Go 1.17. Тесты выполнены Go 1.26.1; старые правила дополнительно проверены режимом языка go1.17 текущего компилятора, не запуском toolchain 1.17.",
    "sources": [
      {
        "title": "Go 1.22: language changes",
        "url": "https://go.dev/doc/go1.22#language"
      },
      {
        "title": "Loop-variable semantics and go.mod",
        "url": "https://go.dev/blog/loopvar-preview"
      },
      {
        "title": "Specification: for clause",
        "url": "https://go.dev/ref/spec#For_clause"
      },
      {
        "title": "Memory model: channel synchronization",
        "url": "https://go.dev/ref/mem#chan"
      },
      {
        "title": "sync.WaitGroup — Go 1.26.1",
        "url": "https://pkg.go.dev/sync@go1.26.1#WaitGroup"
      }
    ],
    "cardIds": [
      "c2"
    ]
  },
  {
    "id": "q2",
    "title": "Задача 2: Nil-указатель внутри error",
    "ru": "Что напечатает программа? Что именно осталось внутри err после возврата p?",
    "en": "What does the program print? What does err contain after returning p?",
    "code": "package main\n\nimport \"fmt\"\n\ntype MyError struct{}\n\nfunc (*MyError) Error() string { return \"boom\" }\n\nfunc returnsError() error {\n\tvar p *MyError\n\treturn p\n}\n\nfunc main() { fmt.Println(returnsError() == nil) }",
    "options": [
      "true: nil-указатель всегда превращается в nil-интерфейс.",
      "Panic: у nil-ресивера нельзя объявить метод Error.",
      "false: в error сохранён динамический тип *MyError.",
      "true: error при сравнении учитывает только значение указателя.",
      "false: Go автоматически создаёт ненулевой объект MyError.",
      "Ошибка компиляции: *MyError не реализует error."
    ],
    "correct": 2,
    "explanationRU": "Выведется false. Возврат p в error сохраняет динамический тип *MyError и значение nil. Это не nil-интерфейс: у него тип уже есть. Для успешного результата нужно вернуть nil явно, как в исправленном варианте. Метод Error у nil-ресивера не вызывается этим сравнением; его отдельный вызов здесь вернул бы boom, потому что тело не разыменовывает ресивер. Опора: сначала спроси «какой динамический тип?», затем «какое значение?».",
    "speechEN": "It prints false. Returning p as error stores the dynamic type *MyError together with a nil pointer value. The interface itself is therefore non-nil. Return nil explicitly to represent success, as in the corrected version. The equality check does not call Error. Calling that method separately would return boom here because its body does not dereference the receiver. A nil receiver does not by itself imply a panic.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\nfunc returnsError() error { return nil }\n\nfunc main() { fmt.Println(returnsError() == nil) }",
    "versionNote": "Семантика одинакова в Go 1.17, 1.25 и 1.26; для ответа не нужны конкретная архитектура, размер iface или аллокация.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      }
    ],
    "cardIds": [
      "c33",
      "c34"
    ]
  },
  {
    "id": "q3",
    "title": "Задача 3: Return до завершения defer",
    "ru": "Что напечатает программа? Когда result получает 0 и когда увеличивается?",
    "en": "What does the program print? When is result assigned zero, and when is it incremented?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc f() (result int) {\n\tdefer func() { result++ }()\n\treturn 0\n}\n\nfunc main() { fmt.Println(f()) }",
    "options": [
      "0: return завершает функцию до отложенных вызовов.",
      "1: return задаёт результат, затем defer меняет его.",
      "0: замыкание сохраняет копию result при регистрации.",
      "Ошибка компиляции: defer не может менять именованный результат.",
      "1 только при выключенных оптимизациях компилятора.",
      "Panic: result уже недоступен при выполнении defer."
    ],
    "correct": 1,
    "explanationRU": "Выведется 1. Сначала return 0 присваивает 0 именованному результату result. Затем выполняется отложенное замыкание и увеличивает эту переменную до 1. После defer функция возвращает её итоговое значение. Это порядок языка, а не обещание конкретного стекового слота, регистра или open-coded реализации. Если передать result параметром int в отложенную функцию и менять только этот параметр, меняется копия: именованный результат останется 0.",
    "speechEN": "It prints 1. The return statement first assigns zero to the named result variable. The deferred closure then increments that same variable, and the function returns its final value. This is a language rule, independent of registers, stack slots or whether the compiler uses open-coded defers. Passing result as an int argument to the deferred function would instead give it a copy; incrementing only that parameter would leave the named result at zero.",
    "versionNote": "Порядок присваивания результата и defer одинаков в Go 1.17, 1.25 и 1.26. Пример корректен и не нуждается в исправлении; вариант с параметром — отдельная задача на перенос.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      }
    ],
    "cardIds": [
      "c35"
    ]
  },
  {
    "id": "q4",
    "title": "Задача 4: 16 байт из большого буфера",
    "ru": "Go 1.25/1.26, памяти для аллокации достаточно. Что напечатает программа? Почему сохранённый header влияет на сборку массива? Поможет ли замена на buf[:16:16], если нужны независимые 16 байт?",
    "en": "With Go 1.25/1.26 and enough memory for the allocation, what does this program print? How does keeping header affect collection of the array? Would buf[:16:16] give us 16 independent bytes?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n)\n\nvar header []byte\n\nfunc readHeader() []byte {\n\tbuf := make([]byte, 100<<20) // 100 MiB\n\tcopy(buf, \"0123456789ABCDEF\")\n\treturn buf[:16]\n}\n\nfunc main() {\n\theader = readHeader()\n\truntime.GC()\n\tfmt.Println(len(header), cap(header), string(header))\n}",
    "options": [
      "После GC остаются только 16 байт: сборщик освобождает часть массива за len, сохраняя прежнее значение cap.",
      "Возврат []byte по значению копирует 16 байт в отдельный массив; исходные 100 MiB больше не удерживаются.",
      "Только buf[:16:16] освобождает большой массив: capacity становится 16, поэтому GC отрезает остаток.",
      "Сохранённый header удерживает массив 100 MiB; cap-limit не копирует данные. Независимый префикс даёт копирование.",
      "Байты относятся к noscan, поэтому массив нельзя собрать даже после удаления всех ссылок на него.",
      "После header = nil вызов runtime.GC() гарантированно уменьшит RSS процесса ровно на 100 MiB."
    ],
    "correct": 3,
    "explanationRU": "Программа печатает 16 104857600 0123456789ABCDEF. Глобальный header сохраняет ссылку на исходный массив: возврат среза копирует дескриптор, а не байты. 100<<20 — это 100 MiB. Пока массив достижим, GC не может освободить его хвост по len. Он учитывает выделенный объект; один span малых объектов при этом содержит много отдельных ячеек. Это нежелательное удержание памяти, а не вечная неспособность GC освободить массив. buf[:16:16] задаёт len=cap=16, но всё ещё разделяет данные: header[0] меняет общий массив. Append с добавлением хотя бы одного байта к такому полному срезу потребует другого массива; само ограничение cap ничего не копирует. bytes.Clone(buf[:16]) создаёт независимые байты; точная capacity копии не обещана. Для Go 1.17 подходит out := make([]byte, 16); copy(out, buf[:16]). Если других ссылок нет, исходный массив после копирования можно собрать, но это не обещает немедленного падения RSS. noscan исключает обход указателей внутри байтов, а не сборку массива. Исправленный пример печатает 16 0123456789ABCDEF и всё ещё временно выделяет 100 MiB; если реально нужен только заголовок, лучше сразу читать нужные 16 байт. Самопроверка: после buf[:16:16] изменение header[0] видно через buf? Да. После Clone? Нет. Опора: «len — вижу, cap — могу расширить, copy — отделяю».",
    "speechEN": "It prints 16 104857600 0123456789ABCDEF. The global header keeps the original 100 MiB array reachable. Returning a slice copies its descriptor, not its bytes; GC cannot reclaim just the part beyond len. A small-object span can contain many separate objects, so an object is not the same thing as a span. Restricting the slice to buf[:16:16] changes capacity but still shares the array: writing header[0] changes the original bytes. Appending at least one byte to that full slice needs another array. To detach the prefix, I would use bytes.Clone or make plus copy. Clone does not promise an exact capacity. Once no references remain, the original array can be collected; that does not guarantee an immediate RSS drop. Pointer-free data is still collectible. The fixed example prints 16 0123456789ABCDEF, but still temporarily allocates the large buffer. If only a header is needed, I would read those 16 bytes directly. To check my understanding: an indexed write is shared before copying and independent afterwards.",
    "correctedCode": "package main\n\nimport (\n\t\"bytes\"\n\t\"fmt\"\n\t\"runtime\"\n)\n\nvar header []byte\n\nfunc readHeader() []byte {\n\tbuf := make([]byte, 100<<20) // 100 MiB\n\tcopy(buf, \"0123456789ABCDEF\")\n\treturn bytes.Clone(buf[:16]) // Independent bytes, Go 1.20+.\n}\n\nfunc main() {\n\theader = readHeader()\n\truntime.GC()\n\tfmt.Println(len(header), string(header))\n}",
    "versionNote": "В Go 1.25 и 1.26 ответ одинаков: Green Tea не меняет семантику slice/copy и не освобождает хвост достижимого массива. bytes.Clone доступен с Go 1.20; для 1.17 используй make+copy. Исполнение проверено Go 1.26.1; это не запуск toolchain 1.17/1.25. Размер дескриптора и точный RSS не являются частью ответа.",
    "sources": [
      {
        "title": "Specification: slices share their underlying array; full slice capacity",
        "url": "https://go.dev/ref/spec#Slice_expressions"
      },
      {
        "title": "bytes.Clone: copy, capacity and version — Go 1.26.1",
        "url": "https://pkg.go.dev/bytes@go1.26.1#Clone"
      },
      {
        "title": "Go slices: retaining a large array through a small slice",
        "url": "https://go.dev/blog/slices-intro"
      },
      {
        "title": "Go 1.20: bytes.Clone introduced",
        "url": "https://go.dev/doc/go1.20#bytes"
      },
      {
        "title": "GC guide: tracing and physical memory",
        "url": "https://go.dev/doc/gc-guide"
      }
    ],
    "cardIds": [
      "c25",
      "c26",
      "c29"
    ]
  },
  {
    "id": "q5",
    "title": "Задача 5: Recover в другой горутине",
    "ru": "Перехватит ли main панику отправителя? После запуска main ждёт done; при panic отправитель до close(done) не доходит.",
    "en": "Can main recover the sender’s panic? main waits for done; the sender cannot reach close(done) after the send panics.",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\tfmt.Println(\"main recovered:\", r)\n\t\t}\n\t}()\n\tch := make(chan int)\n\tclose(ch)\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tch <- 42\n\t\tclose(done)\n\t}()\n\t<-done\n}",
    "options": [
      "main перехватит panic через унаследованный defer.",
      "Неперехваченный panic дочерней горутины завершит программу.",
      "Отправка в закрытый канал будет ждать получателя.",
      "Завершится только дочерняя горутина, процесс продолжит работу.",
      "main перехватит panic, если GOMAXPROCS равен 1.",
      "Эту панику нельзя перехватить даже внутри отправителя."
    ],
    "correct": 1,
    "explanationRU": "Программа завершится из-за неперехваченного panic: отправка в закрытый канал вызывает обычную панику, а defer с recover в main принадлежит другой горутине. Получение из done не даёт main просто завершить процесс раньше попытки отправки; Sleep для порядка не нужен. В исправленном учебном варианте recover вызывается непосредственно отложенной функцией самого отправителя, затем закрывается done и main продолжает работу. Это показывает область recover, но не исправляет ошибку владения каналом в рабочем приложении: отправитель не должен посылать после закрытия.",
    "speechEN": "The program terminates with an unrecovered panic. Sending on a closed channel causes an ordinary panic, but main’s deferred recover belongs to another goroutine. Waiting on done prevents main from returning before the send attempt; no sleep is used to establish order. The corrected teaching variant recovers directly in a deferred function of the sender, then closes done so main can continue. This demonstrates recovery scope; the application-level fix is still to coordinate senders and channel closure.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan int)\n\tclose(ch)\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tdefer close(done)\n\t\tdefer func() {\n\t\t\tif r := recover(); r != nil {\n\t\t\t\tfmt.Println(\"sender recovered:\", r)\n\t\t\t}\n\t\t}()\n\t\tch <- 42\n\t}()\n\t<-done\n}",
    "versionNote": "Основная семантика одинакова в Go 1.17, 1.25 и 1.26. Исходный пример намеренно завершает процесс с ошибкой; проверять его нужно отдельным процессом. Вариант с recover учебный, не рекомендация подавлять ошибки канала.",
    "sources": [
      {
        "title": "Language specification — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "Panic unwinding — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/panic.go"
      }
    ],
    "cardIds": [
      "c35",
      "c14"
    ]
  },
  {
    "id": "q6",
    "title": "Задача 6: Два append и один общий массив",
    "ru": "Предскажи вывод. Какие дескрипторы меняются и где обе операции записывают данные?",
    "en": "Predict the output. Which slice descriptors change, and where do both appends write?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ta := make([]int, 2, 4)\n\ta[0], a[1] = 1, 2\n\tb := append(a, 3)\n\tc := append(a, 4)\n\tfmt.Println(b[2], c[2])\n}",
    "options": [
      "3 4: каждый append копирует исходные элементы.",
      "3 3: второй append сохраняет прежнее значение.",
      "4 4: оба append записывают в один слот массива.",
      "Паника: индекс 2 выходит за длину b и c.",
      "Вывод зависит от случайного порядка операций.",
      "Код не компилируется без присваивания обратно в a."
    ],
    "correct": 2,
    "explanationRU": "Выведется 4 4. У a длина 2 и capacity 4. Первый append записывает 3 в слот 2 общего массива и возвращает b длины 3, но длина a остаётся 2. Второй append снова пишет в слот 2, теперь 4; это видно и через b. В исправлении каждый append получает a[:len(a):len(a)], поэтому для нового элемента нужен отдельный массив и вывод становится 3 4. Само ограничение cap не копирует данные: запись по существующему индексу до append всё ещё общая. Для независимого хранилища сразу нужны make и copy (либо подходящий Clone). Опора: два дескриптора могут вести в один массив.",
    "speechEN": "It prints 4 4. The first append writes 3 into index 2 of the shared array and returns b with length 3. It does not change a’s length, which is still 2. The second append therefore writes 4 into the same index, and b observes that overwrite. In the corrected version, each append receives a view whose capacity equals its length, forcing separate storage for the added element and producing 3 4. Limiting capacity alone does not copy existing elements: index writes before append still share storage. Use make and copy, or an appropriate Clone, when independent element storage is required immediately.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ta := make([]int, 2, 4)\n\ta[0], a[1] = 1, 2\n\tb := append(a[:len(a):len(a)], 3)\n\tc := append(a[:len(a):len(a)], 4)\n\tfmt.Println(b[2], c[2])\n}",
    "versionNote": "Этот вывод и исправление применимы к Go 1.17, 1.25 и 1.26. Точная capacity новых массивов не нужна для ответа и не гарантируется языком.",
    "sources": [
      {
        "title": "Go 1.26.1 language specification",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      }
    ],
    "cardIds": [
      "c29",
      "c25"
    ]
  },
  {
    id: "q7",
    title: "Задача 7: Передача sync.WaitGroup по значению (Copying Sync Primitives)",
    ru: "Что произойдёт при запуске этого кода и как устроена структура sync.WaitGroup внутри?",
    en: "What happens when this code runs, and how is sync.WaitGroup laid out in memory?",
    code: `func worker(wg sync.WaitGroup) {
    defer wg.Done()
    println("working...")
}

func main() {
    var wg sync.WaitGroup
    wg.Add(1)
    go worker(wg)
    wg.Wait()
}`,
    options: [
      "Выведет 'working...' и успешно завершится, так как внутри sync.WaitGroup, как и внутри канала или мапы, хранится скрытый указатель *runtime.waitGroup на общую структуру в хипе",
      "Упадёт с паникой 'sync: WaitGroup is copied after first use' в момент вызова wg.Done(), так как рантайм проверяет адрес структуры через встроенный детектор копирования",
      "Напечатает 'working...', после чего упадёт с 'fatal error: all goroutines are asleep - deadlock!': WaitGroup хранит 64-битный атомарный счётчик прямо по значению, поэтому worker уменьшает локальную копию на своём стеке, а main вечно спит на оригинале",
      "Завершится мгновенно, даже не дождавшись печати 'working...', поскольку при копировании WaitGroup в новую горутину старшие 32 бита счётчика задач автоматически сбрасываются в 0",
      "Фоновый монитор sysmon через 10 мс обнаружит, что на семафоре оригинального wg нет активных воркеров, и принудительно разбудит горутину main сигналом SIGURG",
      "Код не скомпилируется, так как компилятор Go (начиная с версии 1.20) включает проверку анализатора go vet copylocks прямо в этап сборки бинаря"
    ],
    correct: 2,
    explanationRU: "Обрати внимание на популярное заблуждение в вариантах №2 и №6: у sync.Mutex и sync.WaitGroup НЕТ рантайм-детектора копирования (такой детектор copyChecker есть только у sync.Cond!), и компилятор позволяет собрать этот код без ошибок (ругается только статический линтер go vet). Поскольку WaitGroup хранит свой atomic.Uint64 счётчик прямо внутри структуры по значению, горутина worker делает Done() на своей копии, а main навсегда засыпает в wg.Wait() -> фатальный дедлок!",
    speechEN: "It prints 'working...' and crashes with 'fatal error: all goroutines are asleep - deadlock!'. Unlike channels or maps, 'sync.WaitGroup' stores its 64-bit atomic state word (packing the task counter and waiter count) inline by value. Passing 'wg' by value copies the counter onto the worker's stack, so 'main' blocks forever on the original instance."
  },
  {
    id: "q8",
    title: "Задача 8: Рекурсивный захват sync.Mutex в одной горутине (Non-Reentrant Mutex)",
    ru: "Как поведёт себя sync.Mutex при повторном вызове Lock() из той же самой горутины и почему?",
    en: "What happens when the same goroutine calls Lock() twice on a sync.Mutex, and why did Go design Mutex this way?",
    code: `type SafeCounter struct {
    mu sync.Mutex
    v  int
}

func (c *SafeCounter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.v++
    c.Log() // внутри вызывает c.mu.Lock() ещё раз в том же стеке вызовов!
}

func (c *SafeCounter) Log() {
    c.mu.Lock()
    defer c.mu.Unlock()
    println(c.v)
}`,
    options: [
      "Успешно выведет 1: рантайм читает указатель текущей горутины из аппаратного регистра R14, видит совпадение владельца мьютекса и увеличивает внутренний счётчик рекурсивных захватов",
      "Произойдёт мгновенный Deadlock: sync.Mutex в Go намеренно НЕ является реентерабельным и состоит всего из 8 байт (state + sema) без хранения владельца; повторный Lock() видит бит mutexLocked=1 и паркует горутину в ожидание самой себя",
      "Через 1 миллисекунду ожидания мьютекс перейдёт в режим голодания (Starvation Mode), принудительно сбросит старый захват и передаст управление методу Log()",
      "Вызовет панику времени выполнения 'sync: unlock of unlocked mutex / recursive lock detected', которую можно перехватить через recover()",
      "Второй вызов c.mu.Lock() покрутится 4 итерации в активном цикле spinning (PAUSE) и, увидев тот же стек g0, пропустит блокировку без ошибки",
      "Дедлок произойдёт только при GOMAXPROCS=1, а на многоядерной системе планировщик перенесёт вызов Log() на свободный поток M2 через механизм Work Stealing"
    ],
    correct: 1,
    explanationRU: "Создатели Go (Расс Кокс) намеренно отказались от рекурсивных (reentrant) мьютексов: мьютекс должен защищать инварианты структуры данных. Когда метод Inc() уже изменил поле c.v++, инвариант временно нарушен, и если вызвать другой публичный метод Log(), который снова берёт Lock(), это признак плохой архитектуры. Физически sync.Mutex — это всего два поля int32 (state и sema), он понятия не имеет, какая горутина его захватила, и повторный Lock() гарантированно вешает горутину в дедлок.",
    speechEN: "It deadlocks immediately. Go's 'sync.Mutex' is strictly non-reentrant by design and consists of just 8 bytes ('state' int32 and 'sema' uint32) with no owner goroutine tracking. When 'Log()' calls 'Lock()' a second time on the same call stack, it sees 'mutexLocked == 1' and parks the goroutine on the semaphore, waiting forever for itself to call 'Unlock()'."
  },

  // =========================================================================
  // ЧАСТЬ 2: БОЕВОЙ CODE REVIEW — КОНТЕКСТЫ, ГОНКИ И КЭШИ (Q9 - Q14)
  // =========================================================================
  {
    id: "q9",
    title: "Задача 9: Результат после отмены запроса",
    ru: "Хендлер уже вернулся по ctx.Done(). RPC затем завершился. Что произойдёт с дочерней горутиной и что исправляет буфер на один элемент?",
    en: "The handler has already returned through ctx.Done(), and the RPC then finishes. What happens to the child goroutine, and what does a one-element buffer fix?",
    code: `// Fragment: Req, Resp and doSlowRPC are application-defined.
func handleRequest(ctx context.Context, req Req) (Resp, error) {
    ch := make(chan Resp)
    go func() {
        ch <- doSlowRPC(req)
    }()

    select {
    case res := <-ch:
        return res, nil
    case <-ctx.Done():
        return Resp{}, ctx.Err()
    }
}`,
    options: [
      "Горутина завершится: при выходе хендлера рантайм закрывает локальный канал и принимает последнее значение.",
      "Отправка вызовет panic: отсутствие получателя означает, что канал автоматически стал закрытым.",
      "Горутина зависнет на отправке. Буфер на один результат устранит это ожидание, но не отменит сам RPC.",
      "Буфер на один элемент решит обе проблемы: освободит отправителя и автоматически отменит медленный RPC.",
      "Горутина удержит поток ОС до появления читателя, поэтому здесь обязательно нужен отдельный пул потоков.",
      "Канал и горутина будут собраны GC: локальная переменная ch больше не доступна завершившемуся хендлеру."
    ],
    correct: 2,
    explanationRU: "Отправитель останется ждать: хендлер ушёл, а другого читателя у этого небуферизованного канала нет. Буфер на один элемент достаточен для единственной отправки результата. Он не отменяет RPC; для этого нужно передать context в поддерживающую отмену операцию. Если операция игнорирует отмену или не возвращается, горутина всё ещё может жить дольше запроса. Также стоит ограничить число одновременных вызовов. Ожидание на канале само по себе не закрепляет за горутиной отдельный поток ОС.",
    speechEN: "The sender remains blocked because the handler has returned and nobody else receives from this unbuffered channel. A one-element buffer lets this single result be sent. It does not cancel the RPC, so I would also propagate context to an operation that supports cancellation and bound concurrency. A channel wait does not by itself occupy a dedicated OS thread.",
    versionNote: "Предпосылка задачи — хендлер уже выбрал отмену. Если обе ветки готовы до выбора select, результат недетерминирован. Основной вывод одинаков для Go 1.17, 1.25 и 1.26.",
    sources: [
      {"title": "Go pipelines: stopping short", "url": "https://go.dev/blog/pipelines"},
      {"title": "context.Context — Go 1.26.1", "url": "https://pkg.go.dev/context@go1.26.1#Context"}
    ]
  },
  {
    id: "q10",
    title: "Задача 10: Отмена фонового аудита при выходе из HTTP-хендлера (Request Context Lifecycle)",
    ru: "Почему этот код асинхронной отправки аудита/S3 в HTTP-хендлере стабильно ломается в продакшене?",
    en: "Why does this asynchronous background task inside an HTTP handler consistently fail in production, and how do you fix it in Go 1.21+?",
    code: `func HandleOrder(w http.ResponseWriter, r *http.Request) {
    order := parseOrder(r)
    
    // Отправляем событие аудита асинхронно, чтобы не задерживать ответ клиенту:
    go func(ctx context.Context) {
        if err := sendAuditToKafka(ctx, order); err != nil {
            log.Errorf("audit failed: %v", err) // Постоянно сыпет "context canceled"!
        }
    }(r.Context())

    w.WriteHeader(http.StatusCreated)
}`,
    options: [
      "Контекст r.Context() привязан к локальному хранилищу потока (TLS) текущего воркера net/http, и при переключении горутины на другой процессор P он теряет авторизационные заголовки",
      "Сервер стандартной библиотеки net/http автоматически вызывает cancel() для r.Context() сразу после возврата из хендлера ServeHTTP; поэтому фоновая горутина получает отменённый контекст ещё до отправки пакета в сеть (фикс: context.WithoutCancel(r.Context()))",
      "Передача r.Context() по значению в анонимную горутину вызывает гонку данных (Data Race) на внутренней мапе дочерних контекстов cancelCtx.children",
      "После вызова w.WriteHeader(http.StatusCreated) сборщик мусора немедленно очищает буфер запроса r, обнуляя все поля структуры order внутри дочерней горутины",
      "Метод r.Context() по умолчанию имеет жёсткий хардкод-таймаут в 10 миллисекунд внутри рантайма Go, которого не хватает для сетевого похода в Kafka",
      "Фоновая горутина попадает в глобальную очередь GRQ с низким приоритетом и не получает процессорного времени до тех пор, пока клиент не закроет TCP-соединение"
    ],
    correct: 1,
    explanationRU: "По контракту пакета net/http жизненный цикл r.Context() строго ограничен временем работы самого HTTP-хендлера: как только функция HandleOrder доходит до конца и отдаёт 201 Created, сервер вызывает cancel() на контексте запроса. Если в фоне нужно сохранить значения из контекста (trace_id, user_id для логов), но отвязаться от отмены HTTP-запроса, в Go 1.21+ используют context.WithoutCancel(r.Context()) в паре со своим context.WithTimeout.",
    speechEN: "The 'net/http' server automatically cancels 'r.Context()' the instant the 'ServeHTTP' handler returns. Because the handler exits immediately after spawning the goroutine, 'sendAuditToKafka' receives an already-canceled context. The idiomatic Go 1.21+ fix is 'context.WithoutCancel(r.Context())' wrapped with a dedicated 'context.WithTimeout'."
  },
  {
    "id": "q11",
    "title": "Задача 11: Ожидание следующего сообщения",
    "ru": "Go 1.25/1.26, go.mod ≥ 1.23, стандартная новая семантика таймеров. idle > 0, handle возвращается. Обязательно ли заменять time.After ради GC? Что измеряет этот таймаут и когда полезно переиспользование?",
    "en": "With Go 1.25/1.26, go.mod ≥ 1.23 and the new timer semantics, must time.After be replaced for GC safety? Assume idle > 0 and handle returns. What does this timeout measure, and when is reuse useful?",
    "code": "package example\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"time\"\n)\n\nvar ErrIdle = errors.New(\"idle timeout\")\n\nfunc Consume(ctx context.Context, in <-chan int, idle time.Duration, handle func(int)) error {\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase value, ok := <-in:\n\t\t\tif !ok {\n\t\t\t\treturn nil\n\t\t\t}\n\t\t\thandle(value)\n\t\tcase <-time.After(idle):\n\t\t\treturn ErrIdle\n\t\t}\n\t}\n}",
    "options": [
      "Всегда нужен NewTimer: даже в новой семантике недостижимый After удерживается до истечения срока.",
      "Таймаут ограничивает время всей Consume: новое сообщение не начинает очередной интервал ожидания.",
      "GC может собрать забытый таймер; переиспользование выбирают по измерениям. Это таймаут ожидания.",
      "Каждый After создаёт горутину, поэтому достаточно добавить WaitGroup для освобождения таймеров.",
      "Вызов After вычисляется лишь при выборе его ветки, поэтому частые сообщения не создают таймеры.",
      "После закрытия in цикл всегда ждёт idle: чтение закрытого канала заблокировано до таймера."
    ],
    "correct": 2,
    "explanationRU": "Нет, ради сборки мусора обязательной замены больше нет: при новой семантике GC может собрать недостижимый таймер до срабатывания. Но time.After вычисляется при каждом входе в select и создаёт новый таймер; в горячем цикле стоимость проверяют benchmark/профилем. NewTimer с Reset может уменьшить выделения, а не исправить любую программу автоматически. Здесь таймаут отсчитывает очередное ожидание после предыдущего handle, а не срок всей функции и не время выполнения handle. Проверка ok завершает чтение закрытого входа; context позволяет прекратить ожидание, но не прерывает сам handle. Если готовы несколько веток, отмена не имеет автоматического приоритета. Ниже вариант с одним таймером: Reset после обработки начинает новый интервал. Для новой семантики перед Reset не нужно Stop/drain; defer Stop явно прекращает ненужное ожидание при выходе. До Go 1.23 или при asynctimerchan=1 действуют старые правила удержания и возможного старого значения в канале. Для самопроверки: как задать общий срок всей операции? Создать context с deadline вне цикла и передавать его также в отменяемую обработку.",
    "speechEN": "No. With the new semantics, GC can reclaim an unreachable timer before it fires. Each select still evaluates time.After, so I would measure allocation costs before reusing a timer. This is a fresh wait timeout after each handler call, not an overall deadline or a limit on the handler itself. The code handles channel closure and cancellation while waiting. In the reusable version, Reset starts the next wait and cannot leave a stale value under the new semantics. Cancellation does not automatically win when another case is ready. An overall deadline belongs outside the loop and must also reach cancellable work.",
    "correctedCode": "package example\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"time\"\n)\n\nvar ErrIdle = errors.New(\"idle timeout\")\n\nfunc Consume(ctx context.Context, in <-chan int, idle time.Duration, handle func(int)) error {\n\ttimer := time.NewTimer(idle)\n\tdefer timer.Stop()\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase value, ok := <-in:\n\t\t\tif !ok {\n\t\t\t\treturn nil\n\t\t\t}\n\t\t\thandle(value)\n\t\t\ttimer.Reset(idle)\n\t\tcase <-timer.C:\n\t\t\treturn ErrIdle\n\t\t}\n\t}\n}",
    "versionNote": "Go 1.25 и 1.26 используют одинаковый описанный контракт: новая семантика по умолчанию при go ≥ 1.23 в модуле main; GODEBUG=asynctimerchan=1 возвращает старую, =0 включает новую. Пример с Reset рассчитан на новую. Для Go 1.17 нужны старые правила Stop/drain с учётом состояния и единственного получателя; слепое «если !Stop, то читать канал» может зависнуть после уже прочитанного значения. Это функции пакета; ctx, вход и handle передаёт вызывающий код. AfterFunc имеет другой контракт и здесь не рассматривается.",
    "sources": [
      {
        "title": "time.After / NewTimer / Reset — Go 1.26.1",
        "url": "https://pkg.go.dev/time@go1.26.1#After"
      },
      {
        "title": "Go 1.23 timer changes: go.mod and GODEBUG",
        "url": "https://go.dev/wiki/Go123Timer"
      },
      {
        "title": "Specification: evaluation of select operands",
        "url": "https://go.dev/ref/spec#Select_statements"
      },
      {
        "title": "time: timer implementation — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/time/sleep.go"
      }
    ],
    "cardIds": [
      "c18",
      "c27"
    ]
  },
  {
    id: "q12",
    title: "Задача 12: Конкурентный append в общий слайс (Concurrent Slice Append & Lost Updates)",
    ru: "Разработчик решил не ставить мьютекс вокруг append, полагая, что в худшем случае произойдёт лишняя аллокация. Что случится на самом деле?",
    en: "Why is concurrent append() to a shared slice a critical bug? Explain what happens to the 24-byte slice header and backing array.",
    code: `func ProcessBatch(items []int) []int {
    var results []int
    var wg sync.WaitGroup

    for _, item := range items {
        wg.Add(1)
        go func(v int) {
            defer wg.Done()
            results = append(results, v*2) // Конкурентный append без синхронизации!
        }(item)
    }
    wg.Wait()
    return results
}`,
    options: [
      "Рантайм упадёт с неперехватываемой фатальной ошибкой 'fatal error: concurrent slice writes', аналогично встроенной защите от конкурентной записи в мапу",
      "Никаких данных не потеряется: функция runtime.growslice использует атомарный CAS на поле capacity, поэтому конкурирующие горутины просто выделят чуть больше памяти в хипе",
      "Тяжёлый Data Race на 24-байтовом заголовке results {ptr, len, cap} и ячейках массива: горутины читают один и тот же старый индекс len, затирают результаты друг друга (потеря данных), а при одновременном росте могут записать ptr от одного массива, а len/cap от другого (повреждение памяти и паника)",
      "Поскольку переменная results объявлена локально внутри функции ProcessBatch, она остаётся на стеке горутины, и каждая дочерняя горутина безопасно модифицирует свою копию стека",
      "Горутины выстроятся в безопасную очередь благодаря Гибридному барьеру записи (Hybrid Write Barrier), который сериализует обновление указателя ptr при каждом вызове append",
      "Проблема возникнет только если исходный срез items содержит более 256 элементов (когда формула роста меняется с 2x на 1.25x), а на малых размерах всё атомарно"
    ],
    correct: 2,
    explanationRU: "В отличие от мап (где рантайм проверяет флаг hashWriting и роняет процесс), у слайсов нет проверки на конкурентную запись! При вызове results = append(results, x) без мьютекса происходят две беды: 1) две горутины одновременно читают len=5, пишут свои значения в одну и ту же ячейку results[5] и обе ставят len=6 (один результат бесследно пропал); 2) 24-байтовая структура {ptr, len, cap} не может обновиться атомарно за одну 64-битную инструкцию CPU (возможен torn write, когда ptr уже указывает на новый массив, а cap прочитался от старого!). Правильный фикс без мьютекса: заранее создать results := make([]int, len(items)) и в каждой горутине писать строго в свой индекс results[i] = v*2.",
    speechEN: "This is a severe Data Race causing lost updates and potential memory corruption. Updating the 24-byte slice header '{ptr, len, cap}' is not atomic: multiple goroutines read the same 'len', overwrite each other's elements at the same index, and can tear the 3-word header during reallocations. Fix it with a mutex, or pre-allocate 'make([]int, len(items))' and assign each goroutine its own distinct index 'results[i] = v*2'."
  },
  {
    id: "q13",
    title: "Задача 13: Сломанный Double-Checked Locking при работе с sync.RWMutex (TOCTOU Race)",
    ru: "В чём архитектурная ошибка этого кэша при холодном старте под высокой конкурентной нагрузкой?",
    en: "What concurrency flaw (Time-Of-Check to Time-Of-Use / Cache Stampede) exists in this RWMutex pattern, and how do you fix it?",
    code: `func (c *Cache) GetClient(endpoint string) *Client {
    c.mu.RLock()
    cli, ok := c.clients[endpoint]
    c.mu.RUnlock()
    if ok {
        return cli
    }

    c.mu.Lock()
    defer c.mu.Unlock()
    // Сразу создаём клиент и кладём в мапу:
    cli = dialNewGRPCClient(endpoint)
    c.clients[endpoint] = cli
    return cli
}`,
    options: [
      "Вызов c.mu.Lock() сразу после c.mu.RUnlock() в одной и той же горутине приводит к взаимной блокировке (Deadlock) при переходе мьютекса в режим голодания Starvation Mode",
      "Классическая гонка Check-then-Act (TOCTOU): если 100 горутин одновременно запросят новый endpoint, все 100 пройдут RLock(), увидят ok == false, а затем по очереди войдут в Lock() и 100 раз подряд вызовут тяжёлый dialNewGRPCClient, затирая старые соединения в мапе (фикс: повторная проверка if cli, ok := c.clients[endpoint]; ok внутри Lock() или singleflight)",
      "Поскольку чтение из мапы c.clients[endpoint] под RLock() происходит параллельно из нескольких горутин, новая SwissTable в Go 1.24+ выбросит fatal error: concurrent map read and map write",
      "Конструкция defer c.mu.Unlock() удерживает эксклюзивную блокировку записи даже после возврата из функции GetClient, блокируя все последующие чтения RLock()",
      "Между строчками c.mu.RUnlock() и if ok значение локальной переменной ok на стеке горутины может быть изменено другой горутиной, захватившей c.mu.Lock()",
      "Никакой ошибки нет: в Go при вызове c.mu.RUnlock() рантайм автоматически бронирует слот апгрейда блокировки до эксклюзивного Lock() для текущей горутины"
    ],
    correct: 1,
    explanationRU: "В Go нет атомарной операции 'Upgrade RLock to Lock'. В микросекундный промежуток между RUnlock() и захватом эксклюзивного Lock() десятки других горутин успевают проскочить первую проверку (или уже стоят в очереди на Lock()). Когда первая горутина создаст соединение и отпустит Lock(), вторая горутина войдёт в Lock() и БЕЗ повторной проверки мапы снова создаст новый gRPC-клиент поверх первого (утечка сокетов и шторм подключений). Обязательно нужна повторная проверка (Double-Checked Locking) сразу после c.mu.Lock(), а чтобы не держать мьютекс на время долгого сетевого dial — используют пакет golang.org/x/sync/singleflight.",
    speechEN: "This is a classic Time-Of-Check to Time-Of-Use (TOCTOU) race. Between 'RUnlock()' and acquiring 'Lock()', dozens of concurrent goroutines can miss the cache simultaneously. They will then queue up on 'Lock()' and one by one call 'dialNewGRPCClient', leaking connections and overwriting the map entry. You must re-check 'if cli, ok := c.clients[endpoint]; ok' after acquiring 'Lock()', or use 'singleflight.Group' so you don't hold the mutex during network I/O."
  },
  {
    "id": "q14",
    "title": "Задача 14: Баланс из общей map",
    "ru": "Account с ключом 1 существует, состав map не меняется. Достаточна ли синхронизация двух горутин? Как исправить доступ к Balance?",
    "en": "Account 1 exists and the map entries do not change. Is access from these two goroutines synchronized correctly? How would you fix access to Balance?",
    "code": "package main\n\nimport \"sync\"\n\ntype Account struct{ Balance int64 }\n\nvar (\n\tmu       sync.RWMutex\n\taccounts = map[int]*Account{1: {Balance: 100}}\n)\n\nfunc AddFunds() {\n\tmu.Lock()\n\taccounts[1].Balance++\n\tmu.Unlock()\n}\n\nfunc ReadBalance() int64 {\n\tmu.RLock()\n\tacc := accounts[1]\n\tmu.RUnlock()\n\treturn acc.Balance\n}\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\twg.Add(2)\n\tgo func() {\n\t\tdefer wg.Done()\n\t\tfor n := 0; n < 1000; n++ {\n\t\t\tAddFunds()\n\t\t}\n\t}()\n\tgo func() {\n\t\tdefer wg.Done()\n\t\tfor n := 0; n < 1000; n++ {\n\t\t\t_ = ReadBalance()\n\t\t}\n\t}()\n\twg.Wait()\n}",
    "options": [
      "Достаточна: после чтения указателя под RLock все поля объекта защищены до возврата ReadBalance.",
      "Достаточна: WaitGroup упорядочивает обращения к Balance, даже когда сами функции идут параллельно.",
      "Недостаточна: Balance читается после RUnlock. Значение нужно скопировать, пока RLock ещё удерживается.",
      "Недостаточна: нужно копировать указатель acc ещё раз после RUnlock; так у чтения будет свой Account.",
      "Недостаточна: только ReadBalance нужно перевести на atomic.LoadInt64, оставив обычную запись под Lock.",
      "Недостаточна: нужно заменить RLock на Lock только вокруг поиска указателя, а Balance читать после Unlock."
    ],
    "correct": 2,
    "explanationRU": "Нет: обе функции обращаются к одной Balance, но ReadBalance читает её уже после RUnlock. Получение указателя под блокировкой не продлевает защиту последующего доступа к объекту. WaitGroup ждёт завершения, но не упорядочивает эти чтения и записи между собой. Исправление — скопировать значение Balance под RLock и вернуть копию. Если возвращаешь весь Account, копировать его поля тоже нужно под блокировкой; поля-ссылки при такой копии остаются общими. Альтернатива для отдельного счётчика — согласованно использовать атомарные операции для всех конкурентных доступов: одна атомарная загрузка вместе с обычной записью не исправляет гонку. В примере аккаунт заранее создан, поэтому обсуждаем гонку, а не nil dereference. Запуск с -race помогает обнаружить выполненный конфликт; отсутствие сообщения в отдельном прогоне не доказывает корректность. Для самопроверки: защищает ли полученную копию указателя замена RLock на Lock, если чтение поля всё равно осталось после Unlock? Нет.",
    "speechEN": "No. The map lookup is protected, but ReadBalance accesses the shared Balance field after releasing the read lock. That access can race with AddFunds. I would copy the balance while holding RLock and return the copied value. Copying a pointer does not copy the account, and WaitGroup only waits for completion. An atomic alternative requires consistent atomic access on both the read and write paths; changing only the reader is insufficient. If I return a struct snapshot, I must also account for any shared reference fields.",
    "correctedCode": "package main\n\nimport \"sync\"\n\ntype Account struct{ Balance int64 }\n\nvar (\n\tmu       sync.RWMutex\n\taccounts = map[int]*Account{1: {Balance: 100}}\n)\n\nfunc AddFunds() {\n\tmu.Lock()\n\taccounts[1].Balance++\n\tmu.Unlock()\n}\n\nfunc ReadBalance() int64 {\n\tmu.RLock()\n\tacc := accounts[1]\n\tbalance := acc.Balance\n\tmu.RUnlock()\n\treturn balance\n}\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\twg.Add(2)\n\tgo func() {\n\t\tdefer wg.Done()\n\t\tfor n := 0; n < 1000; n++ {\n\t\t\tAddFunds()\n\t\t}\n\t}()\n\tgo func() {\n\t\tdefer wg.Done()\n\t\tfor n := 0; n < 1000; n++ {\n\t\t\t_ = ReadBalance()\n\t\t}\n\t}()\n\twg.Wait()\n}",
    "versionNote": "Контракт блокировок применим к Go 1.17/1.25/1.26; примеры проверены Go 1.26.1 с -race. atomic.Int64 доступен с Go 1.19; для 1.17 есть функции sync/atomic над int64. Ни один атомарный вариант здесь не смешивается с обычными конкурентными доступами.",
    "sources": [
      {
        "title": "sync.RWMutex — Go 1.26.1",
        "url": "https://pkg.go.dev/sync@go1.26.1#RWMutex"
      },
      {
        "title": "The Go memory model",
        "url": "https://go.dev/ref/mem"
      },
      {
        "title": "Race detector",
        "url": "https://go.dev/doc/articles/race_detector"
      },
      {
        "title": "sync/atomic — Go 1.26.1",
        "url": "https://pkg.go.dev/sync/atomic@go1.26.1"
      }
    ],
    "cardIds": [
      "c2",
      "c20",
      "c21"
    ]
  },

  // =========================================================================
  // ЧАСТЬ 3: БОЕВОЙ CODE REVIEW — ПАЙПЛАЙНЫ, ERRGROUP, БД И DEFER (Q15 - Q20)
  // =========================================================================
  {
    "id": "q15",
    "title": "Задача 15: Собрать результаты параллельных вычислений",
    "ru": "Вызови RunAll для шести чисел. Других читателей out нет. Завершится ли функция? Как сохранить буфер размера 5 и получить все результаты?",
    "en": "Call RunAll with six numbers and no other receiver on out. Will it return? How can it collect every result while keeping capacity 5?",
    "code": "// Function fragment; import \"sync\".\nfunc RunAll(tasks []int) []int {\n\tout := make(chan int, 5)\n\tvar wg sync.WaitGroup\n\tfor _, task := range tasks {\n\t\twg.Add(1)\n\t\tgo func(n int) {\n\t\t\tdefer wg.Done()\n\t\t\tout <- n * n\n\t\t}(task)\n\t}\n\twg.Wait()\n\tclose(out)\n\tvar results []int\n\tfor value := range out {\n\t\tresults = append(results, value)\n\t}\n\treturn results\n}",
    "options": [
      "Функция завершится: Wait сам читает значения из out, когда счётчик перестаёт уменьшаться.",
      "Функция зависнет при close: закрытие непустого канала ждёт, пока буфер будет полностью прочитан.",
      "Функция завершится: шестая отправка автоматически расширит буфер и освободит последнюю горутину.",
      "Функция вызовет panic: Wait нельзя вызывать после Add, пока дочерние горутины ещё выполняются.",
      "Функция зависнет: отправитель ждёт чтения, а читатель ждёт Done. Нужно читать параллельно с ожиданием.",
      "Функция вернёт пять значений: range перестанет читать, как только изначально заполненный буфер опустеет."
    ],
    "correct": 4,
    "explanationRU": "Получается цикл ожидания: RunAll ждёт Done всех горутин; хотя бы одна из шести не может закончить отправку в буфер на пять мест; чтение начинается только после Wait. В исправлении отдельный координатор ждёт завершения отправителей и закрывает out, пока вызывающая горутина читает результаты. Порядок результатов не гарантирован. Буфер len(tasks) тоже достаточен для ровно одной отправки на задачу, но расходует память на всю пачку и связывает корректность с этим условием. Здесь по горутине на задачу — это не ограниченный пул; лимит параллелизма и отмена нужны отдельно для длительной работы. Закрытие не ждёт опустошения буфера, а range читает оставшиеся значения до конца.",
    "speechEN": "RunAll waits for every sender, but a sender needs buffer space that only RunAll can free. I would receive results while a separate coordinator waits and closes the channel after all senders finish. This removes the wait cycle. Result order is unspecified, and the example still launches one goroutine per task.",
    "correctedCode": "// Function fragment; import \"sync\".\nfunc RunAll(tasks []int) []int {\n\tout := make(chan int, 5)\n\tvar wg sync.WaitGroup\n\tfor _, task := range tasks {\n\t\twg.Add(1)\n\t\tgo func(n int) {\n\t\t\tdefer wg.Done()\n\t\t\tout <- n * n\n\t\t}(task)\n\t}\n\tgo func() {\n\t\twg.Wait()\n\t\tclose(out)\n\t}()\n\tvar results []int\n\tfor value := range out {\n\t\tresults = append(results, value)\n\t}\n\treturn results\n}",
    "versionNote": "Пример использует API, доступный в Go 1.17, 1.25 и 1.26. Аргумент n передаётся явно: результат не зависит от изменения loop variables в Go 1.22. Завершение проверяется без Sleep.",
    "sources": [
      {
        "title": "Go pipelines: fan-out, fan-in",
        "url": "https://go.dev/blog/pipelines"
      },
      {
        "title": "sync.WaitGroup — Go 1.26.1",
        "url": "https://pkg.go.dev/sync@go1.26.1#WaitGroup"
      },
      {
        "title": "Go specification: close",
        "url": "https://go.dev/ref/spec#Close"
      }
    ],
    "cardIds": [
      "c13",
      "c14",
      "c12"
    ]
  },
  {
    id: "q16",
    title: "Задача 16: Ловушка контекста errgroup.WithContext после вызова g.Wait()",
    ru: "Обе параллельные задачи в errgroup отработали успешно (err == nil). Почему же следующая строчка saveOrderToDB(ctx) всегда падает с ошибкой context canceled?",
    en: "Both concurrent tasks in errgroup succeed with nil error. Why does saveOrderToDB(ctx) right below g.Wait() always fail with 'context canceled'?",
    code: `func ProcessCheckout(ctx context.Context, id int) error {
    // Затеняем (shadowing) входной ctx дочерним контекстом errgroup:
    g, ctx := errgroup.WithContext(ctx)

    g.Go(func() error { return checkInventory(ctx, id) })
    g.Go(func() error { return chargeCard(ctx, id) })

    if err := g.Wait(); err != nil {
        return err
    }

    // Обе задачи успешны! Сохраняем итоговый заказ в БД:
    return saveOrderToDB(ctx, id) // Всегда возвращает "context canceled"!
}`,
    options: [
      "Внутренние методы checkInventory и chargeCard автоматически закрывают переданный им контекст после чтения тела HTTP-ответа",
      "Метод g.Wait() внутри пакета x/sync/errgroup в блоке defer ВСЕГДА вызывает cancel() для своего дочернего контекста — не только при первой ошибке, но и при полностью успешном завершении всех горутин! Из-за затенения переменной ctx в saveOrderToDB передаётся уже мёртвый контекст (фикс: называть переменную g, gCtx := errgroup.WithContext(ctx))",
      "Пакет errgroup использует контекст с жестким дефолтным дедлайном 100 мс, который истекает к моменту завершения g.Wait()",
      "Драйвер базы данных в saveOrderToDB проверяет счётчик ссылок на контекст и отклоняет контексты, которые уже использовались в нескольких горутинах одновременно",
      "После вызова g.Wait() срабатывает сборщик мусора и закрывает канал ctx.Done() через финализатор runtime.AddCleanup",
      "Ошибка возникает потому, что в errgroup не был вызван метод g.SetLimit(), без которого контекст переходит в состояние отмены"
    ],
    correct: 1,
    explanationRU: "Один из самых коварных багов на продакшене из-за случайного затенения переменной (variable shadowing `g, ctx := errgroup.WithContext(ctx)`). Если заглянуть в исходники `golang.org/x/sync/errgroup`, то метод `Wait()` в самом конце делает `if g.cancel != nil { g.cancel() }`, чтобы гарантированно освободить ресурсы дочернего контекста. Поэтому ПОСЛЕ выхода из `g.Wait()` контекст, возвращённый из `errgroup.WithContext`, ВСЕГДА отменён (даже если ошибок не было!). Никогда не перезаписывай родительский `ctx` — называй дочерний контекст `gCtx` и используй его только внутри `g.Go(...)`.",
    speechEN: "Inside 'x/sync/errgroup', 'g.Wait()' unconditionally calls 'g.cancel()' before returning—even when all goroutines succeed with zero errors—to prevent context leaks. Because line 3 shadowed the parent 'ctx' variable ('g, ctx := errgroup.WithContext(ctx)'), 'saveOrderToDB(ctx)' receives an already-canceled context! Always name the group's context 'gCtx' and pass the original parent 'ctx' to downstream calls after 'g.Wait()'."
  },
  {
    "id": "q17",
    "title": "Задача 17: Заполненный канал и сигнал остановки",
    "ru": "Что напечатает программа? Когда вызывается build()?",
    "en": "What does this program print, and when is build() called?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tout := make(chan int, 1)\n\tout <- 7\n\tdone := make(chan struct{})\n\tclose(done)\n\tcalls := 0\n\tbuild := func() int { calls++; return 42 }\n\tselect {\n\tcase out <- build():\n\t\tfmt.Println(\"sent\")\n\tcase <-done:\n\t\tfmt.Println(\"cancelled\")\n\t}\n\tfmt.Println(calls)\n}",
    "options": [
      "cancelled, затем 0: сначала выбирается готовая ветка, потом вычисляются только её выражения.",
      "cancelled, затем 1: отправляемое значение вычисляется до выбора, хотя отправка не готова.",
      "sent, затем 1: вычисление build() резервирует место и вытесняет старое значение из буфера.",
      "cancelled или sent, затем 1: наличие двух веток делает обе операции готовыми к выбору.",
      "Программа зависнет: заполненная отправка блокирует проверку следующей ветки с done.",
      "Будет panic: закрытый done нельзя читать внутри select одновременно с отправкой."
    ],
    "correct": 1,
    "explanationRU": "Программа печатает cancelled и 1. Канал out заполнен, а закрытый done готов к чтению. Но build() вычисляется один раз до выбора ветки, поэтому calls увеличивается. Это правило языка для всех форм select; вызов selectgo нужен не всегда. Default и nil-канал также не откладывают вычисление отправляемого значения. Для долгой подготовки передай context в саму функцию и обрабатывай отмену внутри неё. Предварительный ctx.Err() помогает при уже видимой отмене, но не закрывает гонку с последующей работой. Если подготовка читает задачу из БД, сохранность зависит от транзакции и протокола подтверждения: нельзя автоматически объявлять любую прочитанную задачу потерянной.",
    "speechEN": "It prints cancelled and then 1. The send cannot proceed because out is full, while the closed done channel is ready to receive. However, build runs before case selection, so calls is incremented. This evaluation rule applies even to specialized select paths. For expensive preparation, I would pass context into the operation itself and define how reserved work is acknowledged or returned on cancellation.",
    "versionNote": "Правило вычисления операндов действует в Go 1.17, 1.25 и 1.26. Полная программа проверена на Go 1.26.1; старые toolchain не запускались.",
    "sources": [
      {
        "title": "Go specification: select",
        "url": "https://go.dev/ref/spec#Select_statements"
      },
      {
        "title": "Compiler select lowering — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/walk/select.go"
      }
    ],
    "cardIds": [
      "c18",
      "c19"
    ]
  },
  {
    "id": "q18",
    "title": "Задача 18: Ошибка запроса и отложенная очистка",
    "ru": "BeginTx успешен, единственный ExecContext возвращает ошибку, ctx не отменён. Вызовет ли показанный defer tx.Rollback() и как исправить очистку?",
    "en": "BeginTx succeeds, the single ExecContext call fails, and ctx is not cancelled. Will this defer call tx.Rollback(), and how would you fix the cleanup?",
    "code": "package example\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n)\n\nfunc UpdateStatus(ctx context.Context, db *sql.DB, id int64, status string) error {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer func(e error) {\n\t\tif e != nil {\n\t\t\t_ = tx.Rollback()\n\t\t}\n\t}(err)\n\n\t_, err = tx.ExecContext(ctx,\n\t\t\"UPDATE tasks SET status = $1 WHERE id = $2\", status, id)\n\tif err != nil {\n\t\treturn err\n\t}\n\treturn tx.Commit()\n}",
    "options": [
      "Да: при выходе из функции аргумент err вычислится повторно и передаст в defer ошибку запроса.",
      "Да: параметр e автоматически ссылается на внешнюю err, поэтому присваивание изменит оба значения.",
      "Нет: ошибка ExecContext запрещает вызывать Rollback; незавершённую транзакцию нужно оставить пулу.",
      "Нет: аргумент err сохранён как nil при регистрации defer. После BeginTx нужен defer tx.Rollback().",
      "Нет: Rollback разрешён только после вызова Commit; перед возвратом ошибки сначала нужен Commit.",
      "Да: defer выполняется между ExecContext и проверкой if, поэтому ошибка уже обработана до return."
    ],
    "correct": 3,
    "explanationRU": "Этот defer не вызовет Rollback: после успешного BeginTx переменная err равна nil, и именно это значение сразу передаётся как будущий аргумент e. Позднее присваивание ошибки запроса не меняет сохранённый аргумент. Для очистки зарегистрируй defer tx.Rollback() сразу после успешного BeginTx; затем проверяй ошибку запроса и возвращай результат Commit. После успешного Commit отложенный Rollback возвращает sql.ErrTxDone и не откатывает зафиксированные изменения. Это попытка корректно завершить транзакцию, а не гарантия успешного отката при любой ошибке драйвера. Нельзя говорить «никакого rollback никогда»: при отмене контекста BeginTx пакет database/sql может выполнить rollback сам. Полагаться на будущую отмену вместо явной очистки не нужно. Ошибка Commit также должна быть возвращена вызывающему коду; её нельзя превращать в успех или обещание автоматического восстановления. Для самопроверки: что изменится, если заменить defer func(e error) {...}(err) на замыкание без аргумента, читающее внешнюю err? Оно увидит позднее значение, но безусловная регистрация Rollback проще покрывает ранние выходы.",
    "speechEN": "This defer skips Rollback because err is nil when the deferred call is registered, and that nil value is saved as e. The later query error does not update the saved argument. I would defer tx.Rollback immediately after a successful BeginTx, check the query error and return the result of Commit. After a successful commit, Rollback returns sql.ErrTxDone without undoing it. The claim is about this deferred callback: cancelling the transaction context can also cause database/sql to roll back. Cleanup can fail, so I would not describe a deferred rollback as a guarantee of successful database recovery.",
    "correctedCode": "package example\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n)\n\nfunc UpdateStatus(ctx context.Context, db *sql.DB, id int64, status string) error {\n\ttx, err := db.BeginTx(ctx, nil)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer tx.Rollback()\n\n\t_, err = tx.ExecContext(ctx,\n\t\t\"UPDATE tasks SET status = $1 WHERE id = $2\", status, id)\n\tif err != nil {\n\t\treturn err\n\t}\n\treturn tx.Commit()\n}",
    "versionNote": "Правило defer одинаково для Go 1.17/1.25/1.26. Это компилируемый пакет с функцией, не самостоятельная программа: вызывающий код передаёт открытый *sql.DB; SQL использует PostgreSQL-параметры $1/$2. Тесты Go 1.26.1 проверяют database/sql с управляемым тестовым драйвером; реальная PostgreSQL в этой порции не запускалась.",
    "sources": [
      {
        "title": "Specification: defer statements",
        "url": "https://go.dev/ref/spec#Defer_statements"
      },
      {
        "title": "Executing transactions",
        "url": "https://go.dev/doc/database/execute-transactions"
      },
      {
        "title": "sql.DB.BeginTx — Go 1.26.1",
        "url": "https://pkg.go.dev/database/sql@go1.26.1#DB.BeginTx"
      },
      {
        "title": "sql.Tx — Go 1.26.1",
        "url": "https://pkg.go.dev/database/sql@go1.26.1#Tx"
      },
      {
        "title": "Tx.awaitDone / Commit / Rollback — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/database/sql/sql.go"
      }
    ],
    "cardIds": [
      "c35"
    ]
  },
  {
    id: "q19",
    title: "Задача 19: Исчерпание пула соединений sql.DB из-за defer в цикле и раннего выхода",
    ru: "Почему эта функция пакетной выгрузки зависает на 26-й странице при настройке пула БД db.SetMaxOpenConns(25)?",
    en: "With db.SetMaxOpenConns(25), why does this paginated query function hang forever on page 26?",
    code: `func ExportAllUsers(ctx context.Context, db *sql.DB) error {
    for page := 0; page < 100; page++ {
        rows, err := db.QueryContext(ctx, "SELECT id, email FROM users LIMIT 100 OFFSET $1", page*100)
        if err != nil {
            return err
        }
        defer rows.Close() // <--- Внутри цикла for!

        for rows.Next() {
            // Если нашли нужного пользователя — переходим к проверке следующей страницы:
            if checkStopOnPage(rows) {
                break // Выходим из внутреннего цикла rows.Next() раньше конца!
            }
        }
    }
    return nil
}`,
    options: [
      "Метод db.QueryContext открывает отдельную транзакцию на каждый вызов, которая требует явного вызова db.Commit() в конце итерации",
      "Комбинация двух факторов: 1) при раннем выходе по break из цикла rows.Next() курсор не дочитывается до EOF (когда database/sql закрывает rows автоматически); 2) вызов defer rows.Close() находится внутри цикла for по страницам, поэтому структуры _defer копятся в куче и НЕ выполняются до выхода из всей функции ExportAllUsers! На 26-й итерации все 25 соединений пула оказываются заблокированы открытыми rows (фикс: вынести тело итерации в отдельную функцию или закрывать rows.Close() явно в конце итерации)",
      "Драйвер базы данных блокируется из-за того, что аргумент page*100 передаётся в QueryContext без предварительной подготовки выражения db.Prepare()",
      "При вызове break внутри вложенного цикла for rows.Next() компилятор Go автоматически пропускает регистрацию defer rows.Close() на текущей итерации",
      "Пул sql.DB в Go не умеет переиспользовать TCP-соединения внутри одной и той же горутины без переключения контекста планировщика",
      "На 26-й странице срабатывает лимит вложенности Open-Coded Defers (максимум 25 штук на функцию), и рантайм блокирует горутину"
    ],
    correct: 1,
    explanationRU: "Тонкий нюанс работы пакета `database/sql`: если цикл `for rows.Next()` дошёл до самого конца и вернул `false` по причине EOF, библиотека `database/sql` сама автоматически закрывает `rows` и возвращает соединение в пул (даже если `defer rows.Close()` ещё не сработал!). Но как только в коде появляется ранний `break` (или ошибка сканирования), `rows` остаётся открытым и держит физическое TCP-соединение занятым. А поскольку `defer rows.Close()` написан внутри цикла `for page`, ни один из отложенных вызовов не сработает до завершения всех 100 страниц! На 26-й странице все 25 коннектов из `MaxOpenConns(25)` висят занятыми, и 26-й `QueryContext` вечно ждёт свободного коннекта у самого себя!",
    speechEN: "Two things combine to cause a connection pool deadlock: first, breaking early out of 'for rows.Next()' prevents 'database/sql' from auto-closing 'rows' at EOF, leaving the underlying DB connection checked out; second, 'defer rows.Close()' is inside the 'for page' loop, so it won't execute until all 100 pages finish! On iteration 26, all 25 connections in 'MaxOpenConns(25)' are held by unclosed 'rows' from previous iterations, and 'QueryContext' blocks forever waiting for a free connection."
  },
  {
    id: "q20",
    title: "Задача 20: Результат записи отчёта",
    ru: "Write вернул nil, но последующий Close вернул ошибку. Что вернёт эта функция и как сохранить обе ошибки?",
    en: "Write returned nil, but the later Close returned an error. What does this function return, and how would you preserve both errors?",
    code: `// Intentionally faulty function fragment; import "os".
func WriteReport(path string, payload []byte) error {
    f, err := os.Create(path)
    if err != nil {
        return err
    }
    defer f.Close()

    _, err = f.Write(payload)
    return err
}`,
    options: [
      "Вернёт ошибку Close: отложенный вызов завершится до выхода, и его результат автоматически заменит nil.",
      "Вернёт nil. Достаточно перенести Close перед return: обработка его ошибки нужна только для сетевых файлов.",
      "Вернёт nil. Нужно вернуть только ошибку Close, потому что после закрытия ошибка Write уже не имеет значения.",
      "Вернёт nil. Следует убрать defer: отложенное закрытие выполняется после того, как вызывающий код получил результат.",
      "Вернёт nil: ошибка Close потеряна. Именованный err и errors.Join позволяют сохранить обе ошибки.",
      "Вернёт nil. Вызов Sync после Write автоматически включит ошибку будущего Close в возвращаемый результат."
    ],
    correct: 4,
    explanationRU: "Функция вернёт nil: результат f.Close() нигде не используется. Defer выполняется до завершения функции, но сам по себе не меняет возвращаемую ошибку. В исправлении ниже именованный результат err получает ошибку Write, а отложенная функция объединяет её с ошибкой Close через errors.Join. Это сохраняет обе причины, если ошиблись оба вызова. У разных обёрток разный контракт: bufio.Writer требует Flush, csv.Writer — Flush и затем Error, gzip.Writer — Close. Закрытие os.File не заменяет Sync, когда требуется сохранение данных на устойчивом носителе; для атомарной замены файла нужен отдельный протокол.",
    speechEN: "This function returns nil because it discards the error from Close. The deferred call runs before the function finishes, but its result does not automatically replace the return value. I would use a named error result and join the write and close errors in a deferred closure. For bufio.Writer I must check Flush; for csv.Writer I must call Flush and then check Error; gzip.Writer has its own Close. Closing os.File does not replace Sync when durable storage is required, and atomic file replacement needs a separate protocol.",
    correctedCode: `package report

import (
	"errors"
	"os"
)

// WriteReport reports write and close errors; it does not promise durable storage.
func WriteReport(path string, payload []byte) (err error) {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func() {
		err = errors.Join(err, f.Close())
	}()
	_, err = f.Write(payload)
	return err
}`,
    versionNote: "errors.Join доступен с Go 1.20, подходит для 1.25/1.26. В Go 1.17 можно сохранить ошибку Write и вернуть Close только при err == nil; для сохранения обеих нужна собственная составная ошибка.",
    sources: [
      {"title": "os.File.Close / Sync", "url": "https://pkg.go.dev/os@go1.26.1#File.Close"},
      {"title": "errors.Join", "url": "https://pkg.go.dev/errors@go1.26.1#Join"},
      {"title": "bufio.Writer.Flush", "url": "https://pkg.go.dev/bufio@go1.26.1#Writer.Flush"},
      {"title": "csv.Writer.Flush / Error", "url": "https://pkg.go.dev/encoding/csv@go1.26.1#Writer.Flush"},
      {"title": "gzip.Writer.Close", "url": "https://pkg.go.dev/compress/gzip@go1.26.1#Writer.Close"}
    ]
  },
  {
    "id": "q21",
    "title": "Задача 21: Срез после передачи через канал",
    "ru": "Что напечатает программа? Как передать снимок элементов, чтобы последующее изменение values не меняло полученные данные?",
    "en": "What does this program print? How can it send a snapshot whose elements are unaffected by later changes to values?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan []int, 1)\n\tvalues := []int{1, 2}\n\tch <- values\n\tvalues[0] = 9\n\treceived := <-ch\n\tfmt.Println(received[0])\n}",
    "options": [
      "1: канал копирует все элементы массива, поэтому изменение values относится только к исходному срезу.",
      "9: копия среза ссылается на тот же массив. Для снимка нужно скопировать элементы в отдельный массив.",
      "1: завершённая отправка замораживает массив до чтения, поэтому запись values[0] откладывается.",
      "Недетерминированно 1 или 9: само наличие канала заставляет runtime выполнять запись и чтение параллельно.",
      "Panic при записи 9: после отправки среза канал автоматически запрещает отправителю доступ к массиву.",
      "0: после отправки рантайм очищает исходный массив, чтобы один буфер не удерживал память другого."
    ],
    "correct": 1,
    "explanationRU": "Программа печатает 9. Все действия здесь последовательны в одной горутине: гонки данных нет. Канал копирует значение среза, а оба значения среза ссылаются на один массив. Чтобы сохранить снимок, скопируй элементы до изменения исходника, например make+copy. Это достаточно для []int; если элементы сами содержат ссылки, такая копия не становится автоматически глубокой. В конкурентной версии изменение исходного массива во время его копирования также требует синхронизации. Альтернатива — передать владение по договорённости и не изменять данные до возврата владения.",
    "speechEN": "It prints 9. Sending a slice copies the slice value, not its backing array, so both slices still refer to the same elements. There is no data race in this single-goroutine program. For an independent snapshot of these integers, I would copy the elements before sending, or define an ownership protocol for concurrent use.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan []int, 1)\n\tvalues := []int{1, 2}\n\tsnapshot := make([]int, len(values))\n\tcopy(snapshot, values)\n\tch <- snapshot\n\tvalues[0] = 9\n\treceived := <-ch\n\tfmt.Println(received[0])\n}",
    "versionNote": "Контракты срезов и передачи значений применимы к Go 1.17, 1.25 и 1.26. make+copy совместим с этими версиями; полный пример не требует внешних библиотек.",
    "sources": [
      {
        "title": "Go specification: representation of values",
        "url": "https://go.dev/ref/spec#Representation_of_values"
      },
      {
        "title": "Go specification: send statements",
        "url": "https://go.dev/ref/spec#Send_statements"
      },
      {
        "title": "Go specification: copy",
        "url": "https://go.dev/ref/spec#Appending_and_copying_slices"
      }
    ],
    "cardIds": [
      "c13"
    ]
  },
  {
    "id": "q22",
    "title": "Задача 22: Чтение с запасной веткой",
    "ru": "Что напечатает этот select? Перейдёт ли он в default при ok=false?",
    "en": "What does this select print? Does ok=false cause the default branch to run?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan int)\n\tclose(ch)\n\tselect {\n\tcase value, ok := <-ch:\n\t\tfmt.Println(value, ok)\n\tdefault:\n\t\tfmt.Println(\"default\")\n\t}\n}",
    "options": [
      "default: отсутствие значения делает чтение неготовым, даже если канал уже закрыт.",
      "0 true: чтение выбрано, поэтому переменная ok обязательно содержит true.",
      "Panic: чтение закрытого канала запрещено так же, как отправка в закрытый канал.",
      "0 false: закрытое чтение готово; ok сообщает, получено ли ранее отправленное значение.",
      "Случайно default или 0 false: default конкурирует наравне с готовым чтением.",
      "Программа зависнет: небуферизованный канал всегда требует живого отправителя."
    ],
    "correct": 3,
    "explanationRU": "Вывод — 0 false. Закрытый опустошённый канал готов к чтению: возвращается нулевое значение типа и ok=false. Default нужен только при отсутствии готовых операций. Компилятор Go 1.26.1 использует selectnbrecv: его selected=true выбирает case, а received=false записывается в ok. Эти флаги отвечают на разные вопросы. Если перед закрытием в буфере осталось значение, сначала вернётся оно с ok=true. Если ch=nil, чтение не готово и выполнится default.",
    "speechEN": "It prints zero and false. Receiving from a closed, drained channel is ready, so the receive case runs. The ok value tells us whether a value sent before closure was received; it does not tell us whether the case was selected. Internally, the non-blocking receive helper returns selected=true and received=false. A nil channel would instead lead to default.",
    "versionNote": "Семантика применима к Go 1.17/1.25/1.26. Имя helper и его флаги сверены по Go 1.26.1; программа выполнена на этой версии.",
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
        "title": "Channel helpers — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "cardIds": [
      "c14",
      "c18",
      "c19"
    ]
  }
];
