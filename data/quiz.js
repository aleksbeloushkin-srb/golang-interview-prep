const QUIZ_QUESTIONS = [
  // =========================================================================
  // ЧАСТЬ 1: ЛОВУШКИ ЯЗЫКА И РАНТАЙМА (Q1 - Q8)
  // =========================================================================
  {
    "id": "q1",
    "title": "Задача 1: Три функции после завершения цикла",
    "ru": "В модуле с go 1.22 или новее что напечатает программа? Что изменится при старой семантике цикла до Go 1.22?",
    "en": "In a module declaring go 1.22 or later, what does this program print? How would pre-Go 1.22 loop semantics change the result?",
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
    "explanationRU": "В Go 1.22+ с соответствующей версией языка модуль печатает 0, 1 и 2 по одному разу, в произвольном порядке. Переменная i объявлена через := в заголовке for: начиная с семантики Go 1.22 у каждой итерации своя переменная. WaitGroup обеспечивает завершение всех трёх горутин, но не порядок печати. При старой семантике все замыкания используют одну i. Именно в этом примере они читают её только после close(start), когда цикл уже довёл i до 3, поэтому получится 3, 3, 3 без гонки на i. Без такого барьера прежний пример с Sleep не гарантировал ни эти значения, ни завершение печати и мог содержать data race. Семантика переменной сама по себе не обещает конкретного размещения в куче. Для самопроверки: объяви i до цикла и используй for i = 0; ... — тогда при сохранённом барьере все три строки будут 3 и в новой версии. Ниже явная передача аргумента сохраняет значения итераций и при старой семантике.",
    "speechEN": "It prints 0, 1 and 2 once each, in any order. With Go 1.22 or later language semantics, a loop variable declared with := is separate for each iteration. WaitGroup ensures completion, not ordering. Under the old semantics all closures share i, but this example makes them wait until the loop finishes, so all print 3 without racing on i. Declaring i outside the loop and using = would also share one variable today. Passing i as an argument makes the intended per-call value explicit across these versions.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tstart := make(chan struct{})\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 3; i++ {\n\t\twg.Add(1)\n\t\tgo func(value int) {\n\t\t\tdefer wg.Done()\n\t\t\t<-start\n\t\t\tfmt.Println(value)\n\t\t}(i)\n\t}\n\tclose(start)\n\twg.Wait()\n}",
    "versionNote": "Семантика итераций изменилась в Go 1.22 и зависит от версии языка пакета, обычно заданной go.mod. Для go 1.22 и новее результат одинаковый. Форма с аргументом совместима и с Go 1.17. Проверено toolchain Go 1.24.7 и 1.27.3; старые правила — строкой go 1.17 или go 1.21 в go.mod, без запуска toolchain 1.17.",
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
        "title": "sync.WaitGroup — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#WaitGroup"
      }
    ],
    "cardIds": [
      "c2",
      "c3"
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
    "id": "q7",
    "title": "Задача 7: Копия WaitGroup и чужой счётчик",
    "ru": "Что произойдёт в этой отдельной программе? Чей счётчик уменьшит worker?",
    "en": "What happens in this standalone program? Whose task counter does worker decrement?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc worker(wg sync.WaitGroup) { defer wg.Done(); fmt.Println(\"working\") }\nfunc main() {\n\tvar wg sync.WaitGroup\n\twg.Add(1)\n\tgo worker(wg)\n\twg.Wait()\n}",
    "options": [
      "Копия ссылается на общий счётчик: программа завершится.",
      "Компилятор запретит копирование WaitGroup.",
      "worker уменьшит копию; main останется ждать оригинал, и эта программа завершится fatal deadlock.",
      "Во время копирования счётчик оригинала сбросится.",
      "Каждая копия автоматически вызывает panic о копировании.",
      "Планировщик отменит ожидание после 10 мс."
    ],
    "correct": 2,
    "explanationRU": "worker напечатает working и вызовет Done на своей копии. У оригинала после Add остаётся одна задача, поэтому Wait не завершается; в этой отдельной программе рантайм обнаруживает общий deadlock. Это не обычный panic для recover. WaitGroup после первого использования нельзя копировать: noCopy помогает go vet, но не запрещает сборку и не обеспечивает универсальный детектор копирования во время исполнения. В большом сервисе ошибка может выглядеть как зависшая горутина, без общего fatal deadlock. Передай *WaitGroup либо используй wg.Go в Go 1.25+. Для запоминания: один счётчик → регистрация → Done на том же объекте → Wait.",
    "speechEN": "worker prints working and calls Done on a copy. The original still has one outstanding task, so main never completes Wait; this standalone program ends with a runtime deadlock failure, not a recoverable panic. A WaitGroup must not be copied after first use. noCopy helps go vet; it neither makes copying a compiler error nor guarantees runtime copy detection. In a server the same mistake may leave one goroutine stuck without a process-wide deadlock. Pass *WaitGroup, or use wg.Go in Go 1.25+. Think: one counter, register, finish on that same object, then join.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc worker(wg *sync.WaitGroup) { defer wg.Done(); fmt.Println(\"working\") }\nfunc main() {\n\tvar wg sync.WaitGroup\n\twg.Add(1)\n\tgo worker(&wg)\n\twg.Wait()\n}",
    "versionNote": "Основные контракты применимы к Go 1.17, 1.25 и 1.26; детали реализации не являются причиной корректности. Исходный пример намеренно ошибочный; go vet должен сообщить copylocks. Раскладка 1.17 и 1.25/1.26 различается — см. c22.",
    "sources": [
      {
        "title": "WaitGroup — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/waitgroup.go"
      },
      {
        "title": "WaitGroup — go1.17",
        "url": "https://github.com/golang/go/blob/go1.17/src/sync/waitgroup.go"
      }
    ],
    "cardIds": [
      "c22"
    ]
  },
  {
    "id": "q8",
    "title": "Задача 8: Повторный Lock и цикл ожидания",
    "ru": "Inc держит Mutex и вызывает Log, который берёт тот же Mutex. Откуда появится Unlock?",
    "en": "Inc holds a Mutex and calls Log, which locks it again. What could reach Unlock?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Counter struct {\n\tmu sync.Mutex\n\tn  int\n}\n\nfunc (c *Counter) Inc() {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tc.n++\n\tc.Log()\n}\nfunc (c *Counter) Log() {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tfmt.Println(c.n)\n}\nfunc main() { var c Counter; c.Inc() }",
    "options": [
      "Mutex распознает владельца и разрешит повторный Lock.",
      "Второй Lock ждёт освобождения, но первый Unlock отложен до возврата Inc: программа застрянет.",
      "Starvation mode через 1 мс принудительно освободит Mutex.",
      "Второй Lock немедленно вызовет перехватываемый panic.",
      "Сборщик мусора освободит Mutex после парковки.",
      "GOMAXPROCS > 1 устранит цикл ожидания."
    ],
    "correct": 1,
    "explanationRU": "Зависимость замыкается: Inc держит lock → Log ждёт lock → Unlock выполнится только после возврата Log и выхода из Inc. Mutex не реентерабелен; дополнительный P не меняет эту зависимость. В данной отдельной программе возникает fatal deadlock. Не нужно объяснять это точным размером структуры, «мгновенной» парковкой или нарушением инварианта самим n++: причина — недостижимый Unlock. Исправление возвращает снимок под lock, а печатает снаружи. При параллельных вызовах порядок печати снимков может отличаться от порядка изменений; если важен порядок событий, его нужно проектировать отдельно. Альтернатива — private helper с явно оговорённым уже удерживаемым lock.",
    "speechEN": "The dependency cycle is: Inc holds the lock, Log waits for it, and Unlock can only run after Log returns and Inc exits. Mutex is not reentrant; adding another P does not break that cycle. This standalone program ends with a fatal deadlock. No exact struct size or immediate-parking claim is needed to explain it. The fix returns a snapshot under the lock and prints outside it. With concurrent callers, printed snapshots need not follow update order; ordered events need their own protocol. Another design is a private helper whose contract requires the lock to be held.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Counter struct {\n\tmu sync.Mutex\n\tn  int\n}\n\nfunc (c *Counter) Inc() int {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tc.n++\n\treturn c.n\n}\nfunc main() {\n\tvar c Counter\n\tsnapshot := c.Inc()\n\tfmt.Println(snapshot) // 1; printing is outside the lock\n}",
    "versionNote": "Основные контракты применимы к Go 1.17, 1.25 и 1.26; детали реализации не являются причиной корректности.",
    "sources": [
      {
        "title": "Mutex contract — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/mutex.go"
      }
    ],
    "cardIds": [
      "c21",
      "c15",
      "c55"
    ]
  },

  // =========================================================================
  // ЧАСТЬ 2: БОЕВОЙ CODE REVIEW — КОНТЕКСТЫ, ГОНКИ И КЭШИ (Q9 - Q14)
  // =========================================================================
  {
    "id": "q9",
    "cardIds": [
      "c12",
      "c13",
      "c10"
    ],
    "title": "Задача 9: Результат после отмены запроса",
    "ru": "Хендлер уже вернулся по ctx.Done(). RPC затем завершился. Что произойдёт с дочерней горутиной и что исправляет буфер на один элемент?",
    "en": "The handler has already returned through ctx.Done(), and the RPC then finishes. What happens to the child goroutine, and what does a one-element buffer fix?",
    "code": "// Fragment: Req, Resp and doSlowRPC are application-defined.\nfunc handleRequest(ctx context.Context, req Req) (Resp, error) {\n    ch := make(chan Resp)\n    go func() {\n        ch <- doSlowRPC(req)\n    }()\n\n    select {\n    case res := <-ch:\n        return res, nil\n    case <-ctx.Done():\n        return Resp{}, ctx.Err()\n    }\n}",
    "options": [
      "Горутина завершится: при выходе хендлера рантайм закрывает локальный канал и принимает последнее значение.",
      "Отправка вызовет panic: отсутствие получателя означает, что канал автоматически стал закрытым.",
      "Горутина зависнет на отправке. Буфер на один результат устранит это ожидание, но не отменит сам RPC.",
      "Буфер на один элемент решит обе проблемы: освободит отправителя и автоматически отменит медленный RPC.",
      "Горутина удержит поток ОС до появления читателя, поэтому здесь обязательно нужен отдельный пул потоков.",
      "Канал и горутина будут собраны GC: локальная переменная ch больше не доступна завершившемуся хендлеру."
    ],
    "correct": 2,
    "explanationRU": "Отправитель останется ждать: хендлер ушёл, а другого читателя у этого небуферизованного канала нет. Буфер на один элемент достаточен для единственной отправки результата. Он не отменяет RPC; для этого нужно передать context в поддерживающую отмену операцию. Если операция игнорирует отмену или не возвращается, горутина всё ещё может жить дольше запроса. Также стоит ограничить число одновременных вызовов. Ожидание на канале само по себе не закрепляет за горутиной отдельный поток ОС.",
    "speechEN": "The sender remains blocked because the handler has returned and nobody else receives from this unbuffered channel. A one-element buffer lets this single result be sent. It does not cancel the RPC, so I would also propagate context to an operation that supports cancellation and bound concurrency. A channel wait does not by itself occupy a dedicated OS thread.",
    "versionNote": "Предпосылка — хендлер уже выбрал отмену. Если обе ветки готовы до выбора select, результат недетерминирован. Вывод не менялся (Go 1.24.7, 1.26.1 и 1.27.3).",
    "sources": [
      {
        "title": "Go pipelines: stopping short",
        "url": "https://go.dev/blog/pipelines"
      },
      {
        "title": "context.Context — Go 1.27.3",
        "url": "https://pkg.go.dev/context@go1.27.3#Context"
      }
    ]
  },
  {
    "id": "q10",
    "title": "Задача 10: Время жизни запроса и фоновой работы",
    "ru": "send учитывает отмену контекста; report допускает параллельные вызовы. Что гарантировано после возврата серверного handler, а что зависит от расписания?",
    "en": "send honors context cancellation; report supports concurrent calls. What is guaranteed after the server handler returns, and what depends on scheduling?",
    "code": "package audit\n\nimport (\n\t\"context\"\n\t\"net/http\"\n)\n\nfunc Handler(send func(context.Context) error, report func(error)) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tgo func(ctx context.Context) {\n\t\t\tif err := send(ctx); err != nil {\n\t\t\t\treport(err)\n\t\t\t}\n\t\t}(r.Context())\n\t\tw.WriteHeader(http.StatusAccepted)\n\t})\n}",
    "options": [
      "WriteHeader немедленно отменяет контекст запроса.",
      "После возврата ServeHTTP сервер отменяет контекст; send может успеть завершиться раньше либо столкнуться с отменой.",
      "Контекст нельзя безопасно передать другой горутине.",
      "WithoutCancel сам добавляет таймаут и гарантирует доставку аудита.",
      "Контекст теряет values после переноса горутины на другой P.",
      "Фоновая горутина автоматически переживает завершение процесса."
    ],
    "correct": 1,
    "explanationRU": "Входящий request context отменяется при возврате ServeHTTP, а также может отмениться раньше из-за отключения клиента или отмены HTTP/2. Сам WriteHeader не равен возврату handler. Фоновая send может успеть, поэтому «всегда падает ещё до отправки» неверно. Исправление зависит от требования: здесь выбран контракт «успешный ответ после успешной send», поэтому работа выполняется внутри handler. Для обязательного асинхронного аудита нужна надёжная передача в очередь/outbox, а не просто go. Для допустимой best-effort задачи можно отдельно организовать владельца, остановку сервиса, WithoutCancel и новый WithTimeout; WithoutCancel сохраняет values, но удаляет дедлайн/отмену/cause родителя и имеет nil Done. Отделённый контекст не гарантирует доставку и может удерживать значения запроса.",
    "speechEN": "The server cancels an incoming request context when ServeHTTP returns; client disconnect or HTTP/2 cancellation may cancel it earlier. Calling WriteHeader is not the same as returning. The background send may finish first, so failure before any send is not guaranteed. The fix depends on the requirement: this variant promises success only after send succeeds, and therefore performs it inside the handler. Mandatory asynchronous audit needs a durable queue or outbox handoff, not just go. An intentionally best-effort detached task needs an owner, shutdown handling, WithoutCancel and a fresh timeout. WithoutCancel preserves value lookup but removes the parent deadline, cancellation and cause; Done is nil. Detachment does not guarantee delivery and may retain request values.",
    "correctedCode": "package audit\n\nimport (\n\t\"context\"\n\t\"net/http\"\n)\n\n// Policy: report success only after send succeeds.\nfunc Handler(send func(context.Context) error) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tif err := send(r.Context()); err != nil {\n\t\t\thttp.Error(w, \"audit failed\", http.StatusInternalServerError)\n\t\t\treturn\n\t\t}\n\t\tw.WriteHeader(http.StatusNoContent)\n\t})\n}",
    "versionNote": "WithoutCancel — с Go 1.21; поведение не менялось, проверено на Go 1.24.7, 1.26.1 и 1.27.3. Синхронному исправлению этот API не нужен. В тесте — настоящий httptest.Server, не прямой вызов handler.",
    "sources": [
      {
        "title": "Request.Context — go1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/net/http/request.go"
      },
      {
        "title": "Context — go1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/context/context.go"
      }
    ],
    "cardIds": [
      "c12",
      "c22"
    ]
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
    "versionNote": "Go 1.25 и 1.26 используют одинаковый описанный контракт: новая семантика по умолчанию при go ≥ 1.23 в модуле main; GODEBUG=asynctimerchan=1 возвращает старую, =0 включает новую. Пример с Reset рассчитан на новую. Для Go 1.17 нужны старые правила Stop/drain с учётом состояния и единственного получателя; слепое «если !Stop, то читать канал» может зависнуть после уже прочитанного значения. Это функции пакета; ctx, вход и handle передаёт вызывающий код. AfterFunc имеет другой контракт и здесь не рассматривается. В Go 1.27 настройка asynctimerchan удалена: каналы пакета time всегда синхронные, а GODEBUG=asynctimerchan=1 или 2 в окружении завершает программу при старте.",
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
    "id": "q12",
    "title": "Задача 12: Общий append или отдельные индексы",
    "ru": "При двух и более workers где возникает гонка? Устраняет ли её Wait в конце?",
    "en": "With two or more workers, where is the race? Does waiting at the end prevent it?",
    "code": "package batch\n\nimport \"sync\"\n\nfunc ProcessBatch(items []int) []int {\n\tvar results []int\n\tvar wg sync.WaitGroup\n\tfor _, item := range items {\n\t\twg.Add(1)\n\t\tgo func(v int) {\n\t\t\tdefer wg.Done()\n\t\t\tresults = append(results, v*2)\n\t\t}(item)\n\t}\n\twg.Wait()\n\treturn results\n}",
    "options": [
      "Wait сериализует все операции append.",
      "Заранее выделенная capacity сделает общий append безопасным.",
      "Workers конфликтуют на общей переменной results; возможны потерянные записи и повреждение составного значения.",
      "Есть гарантированная runtime-ошибка concurrent slice writes.",
      "Барьер GC сериализует изменения заголовка среза.",
      "Гонка возможна только после достижения len == 256."
    ],
    "correct": 2,
    "explanationRU": "Wait ждёт завершения, но не упорядочивает workers между собой. Они читают и перезаписывают общую переменную results; при общей backing array могут конфликтовать и элементы. Возможны потерянные обновления и несогласованное составное значение; конкретный вывод или panic не гарантированы. Заголовок в обычной реализации состоит из трёх машинных слов, а не всегда из 24 байт. Даже make([]int, 0, len(items)) не защищает общие len/указатель и позицию записи. Исправленный вариант заранее задаёт длину, назначает отдельный индекс каждому worker, не меняет заголовок и читает результат после Wait; порядок соответствует входу. Предполагается отсутствие посторонних записей в items/results. Для большого входа нужен ограниченный пул, а не неограниченное число горутин. Проверка -race помогает обнаружить конфликт, но не доказывает все исполнения.",
    "speechEN": "Wait joins workers; it does not serialize them. They read and overwrite the shared results variable and may also write the same backing-array element. Lost updates and inconsistent multiword values are possible; no particular output or panic is guaranteed. A typical slice header has three machine words, not a portable size of 24 bytes. Reserving capacity still leaves the shared length and write position unprotected. The fix allocates the final length, assigns each worker a distinct index, never changes the shared header, and reads after Wait. It preserves input order, assuming no external mutation of inputs or outputs. Large inputs need bounded concurrency. The race detector can reveal the conflict but does not prove every execution.",
    "correctedCode": "package batch\n\nimport \"sync\"\n\nfunc ProcessBatch(items []int) []int {\n\tresults := make([]int, len(items))\n\tvar wg sync.WaitGroup\n\tfor i, item := range items {\n\t\twg.Add(1)\n\t\tgo func(index, v int) {\n\t\t\tdefer wg.Done()\n\t\t\tresults[index] = v * 2\n\t\t}(i, item)\n\t}\n\twg.Wait()\n\treturn results\n}",
    "versionNote": "Основные контракты применимы к Go 1.17, 1.25 и 1.26; детали реализации не являются причиной корректности. Явная передача index/v подходит и для семантики циклов до Go 1.22. Исходник намеренно содержит гонку.",
    "sources": [
      {
        "title": "Go memory model — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_mem.html"
      },
      {
        "title": "WaitGroup — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/waitgroup.go"
      }
    ],
    "cardIds": [
      "c2",
      "c15",
      "c22",
      "c29"
    ]
  },
  {
    "id": "q13",
    "title": "Задача 13: Чтения защищены, но проверка устарела",
    "ru": "Все обращения к clients защищены одним RWMutex. Почему для одного ключа всё равно можно создать несколько клиентов?",
    "en": "Every clients access uses the same RWMutex. Why can one key still get several client creations?",
    "code": "package cache\n\nimport \"sync\"\n\ntype Client struct{ Endpoint string }\ntype Cache struct {\n\tmu        sync.RWMutex\n\tclients   map[string]*Client   // initialized before use\n\tnewClient func(string) *Client // teaching model: cannot fail\n}\n\nfunc (c *Cache) Get(endpoint string) *Client {\n\tc.mu.RLock()\n\tcli, ok := c.clients[endpoint]\n\tc.mu.RUnlock()\n\tif ok {\n\t\treturn cli\n\t}\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tcli = c.newClient(endpoint)\n\tc.clients[endpoint] = cli\n\treturn cli\n}",
    "options": [
      "Параллельные чтения map под RLock запрещены.",
      "Несколько вызовов могут увидеть отсутствие ключа, затем по очереди создать клиента без повторной проверки.",
      "RUnlock резервирует право повысить блокировку до Lock.",
      "Любой переход RUnlock → Lock вызывает deadlock.",
      "defer Unlock выполняется только после завершения программы.",
      "-race обязательно обнаружит эту логическую ошибку."
    ],
    "correct": 1,
    "explanationRU": "Два вызова могут увидеть miss до первой записи. После RUnlock знание об отсутствии устарело: второй получает Lock после первого, но создаёт ещё одного клиента. Обращения к map защищены, поэтому это логическая гонка, а не обязательно data race. Не все 100 вызовов обязательно увидят miss; точное число зависит от расписания. Повторная проверка под Lock делает проверку и установку единой операцией. В учебном исправлении создание остаётся под общим lock: медленный dial будет задерживать и другие ключи. Для дорогого создания можно использовать singleflight на ключ вместе с синхронизированным кэшем и повторной проверкой внутри функции группы. singleflight объединяет только совпавшие по времени вызовы и не хранит готовый кэш. Возможная утечка ресурсов зависит от владения/Close: она не следует автоматически из любой перезаписи указателя.",
    "speechEN": "Two callers can both observe a miss before the first insertion. After RUnlock, absence is stale information: the second caller acquires Lock later but creates another client anyway. The map accesses are protected, so this is a logic race, not necessarily a data race. Not every concurrent caller must miss; the exact count depends on scheduling. Rechecking under Lock makes the decision and insertion one operation. The teaching fix keeps construction under a global lock, so a slow dial also delays other keys. For expensive construction, combine per-key singleflight with a synchronized cache and a second lookup inside the grouped function. singleflight deduplicates overlapping calls; it is not a persistent cache. Resource leakage depends on ownership and Close policy, not merely on overwriting any pointer.",
    "correctedCode": "package cache\n\nimport \"sync\"\n\ntype Client struct{ Endpoint string }\ntype Cache struct {\n\tmu        sync.RWMutex\n\tclients   map[string]*Client   // initialized before use\n\tnewClient func(string) *Client // teaching model: cannot fail\n}\n\nfunc (c *Cache) Get(endpoint string) *Client {\n\tc.mu.RLock()\n\tcli, ok := c.clients[endpoint]\n\tc.mu.RUnlock()\n\tif ok {\n\t\treturn cli\n\t}\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tif cli, ok := c.clients[endpoint]; ok {\n\t\treturn cli\n\t}\n\tcli = c.newClient(endpoint)\n\tc.clients[endpoint] = cli\n\treturn cli\n}",
    "versionNote": "Основные контракты применимы к Go 1.17, 1.25 и 1.26; детали реализации не являются причиной корректности. newClient здесь упрощён: реальное создание требует обработки ошибок и политики закрытия. x/sync имеет отдельную версию от Go.",
    "sources": [
      {
        "title": "RWMutex — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/sync/rwmutex.go"
      },
      {
        "title": "Go memory model — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_mem.html"
      },
      {
        "title": "singleflight — v0.20.0",
        "url": "https://github.com/golang/sync/blob/v0.20.0/singleflight/singleflight.go"
      }
    ],
    "cardIds": [
      "c2",
      "c15",
      "c21",
      "c31"
    ]
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
    "versionNote": "Add/Done/Wait — с Go 1.0, проверено на Go 1.24.7, 1.26.1 и 1.27.3; wg.Go — с Go 1.25. Аргумент n передаётся явно: результат не зависит от изменения loop variables в Go 1.22.",
    "sources": [
      {
        "title": "Go pipelines: fan-out, fan-in",
        "url": "https://go.dev/blog/pipelines"
      },
      {
        "title": "sync.WaitGroup — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#WaitGroup"
      },
      {
        "title": "Go specification: close",
        "url": "https://go.dev/ref/spec#Close"
      }
    ],
    "cardIds": [
      "c13",
      "c14",
      "c12",
      "c1"
    ]
  },
  {
    "id": "q16",
    "title": "Задача 16: Контекст errgroup после успешного Wait",
    "ru": "check и load возвращают nil. Каков ctx.Err() внутри save и какой контекст нужен следующему этапу?",
    "en": "check and load return nil. What does ctx.Err() report inside save, and which context should the next phase use?",
    "code": "package checkout\n\nimport (\n\t\"context\"\n\t\"golang.org/x/sync/errgroup\"\n)\n\nfunc Process(ctx context.Context, check, load, save func(context.Context) error) error {\n\tg, ctx := errgroup.WithContext(ctx)\n\tg.Go(func() error { return check(ctx) })\n\tg.Go(func() error { return load(ctx) })\n\tif err := g.Wait(); err != nil {\n\t\treturn err\n\t}\n\treturn save(ctx)\n}",
    "options": [
      "Wait сохраняет контекст живым, если не было ошибок.",
      "Контекст группы отменён к возврату Wait; следующий этап должен использовать исходный parent, если его жизненный цикл ещё подходит.",
      "Без SetLimit контекст отменяется сразу при создании группы.",
      "Wait отменяет parent и все соседние группы.",
      "Контекст истекает по встроенному таймауту 100 мс.",
      "Отмена возникает из-за финализатора сборщика мусора."
    ],
    "correct": 1,
    "explanationRU": "WithContext отменяет дочерний контекст при первой ошибке задачи или при первом возврате Wait, даже успешном. Поэтому внутри save(ctx) ctx.Err() равен context.Canceled; фактический результат save зависит от того, как функция учитывает отмену. В этом конкретном коде g, ctx := не создаёт скрывающую переменную в новом блоке: параметр ctx переиспользуется в том же блоке функции и перезаписывается. Имя gCtx сохраняет parent для следующего этапа. Parent тоже может быть отменён или иметь истёкший дедлайн, так что исправление не обещает успеха save. Wait ждёт возврата всех функций; отмена не убивает горутину и не отменяет уже выполненные внешние эффекты.",
    "speechEN": "WithContext cancels the derived context on the first task error or when the first Wait returns, including success. Thus ctx.Err() inside save reports context.Canceled; whether save itself fails depends on how it handles cancellation. In this exact function, g, ctx := reuses and overwrites the ctx parameter in the same function block rather than shadowing it in a nested block. Naming the child gCtx preserves the parent for the next phase. The parent can still be canceled or expired, so this fix does not promise save will succeed. Wait waits for all functions to return; cancellation neither kills goroutines nor rolls back external side effects.",
    "correctedCode": "package checkout\n\nimport (\n\t\"context\"\n\t\"golang.org/x/sync/errgroup\"\n)\n\nfunc Process(ctx context.Context, check, load, save func(context.Context) error) error {\n\tg, gCtx := errgroup.WithContext(ctx)\n\tg.Go(func() error { return check(gCtx) })\n\tg.Go(func() error { return load(gCtx) })\n\tif err := g.Wait(); err != nil {\n\t\treturn err\n\t}\n\treturn save(ctx)\n}",
    "versionNote": "errgroup — модуль golang.org/x/sync, не часть Go. v0.20.0 требует Go 1.25+, на Go 1.24 — v0.19.0 с тем же errgroup.go. Проверено на Go 1.24.7 (v0.19.0) и 1.27.3 (v0.20.0).",
    "sources": [
      {
        "title": "errgroup — v0.20.0",
        "url": "https://github.com/golang/sync/blob/v0.20.0/errgroup/errgroup.go"
      },
      {
        "title": "Context — go1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/context/context.go"
      },
      {
        "title": "Short variable declarations — go1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/doc/go_spec.html"
      }
    ],
    "cardIds": [
      "c22",
      "c12",
      "c10"
    ]
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
    "versionNote": "Правило вычисления операндов не менялось: программа проверена на Go 1.24.7 и 1.27.3, спецификация — на 1.24.7, 1.26.1 и 1.27.3.",
    "sources": [
      {
        "title": "Go specification: select",
        "url": "https://go.dev/ref/spec#Select_statements"
      },
      {
        "title": "Compiler select lowering — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/cmd/compile/internal/walk/select.go"
      }
    ],
    "cardIds": [
      "c18",
      "c19",
      "c8"
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
    "id": "q19",
    "title": "Задача 19: Ранний break, defer и занятые соединения",
    "ru": "Пул ограничен 25 соединениями. Если предыдущие страницы оставили 25 незакрытых Rows, чего ждёт следующий QueryContext? Обязан ли это быть именно 26-й запрос?",
    "en": "The pool allows 25 connections. If earlier pages left 25 Rows open, what does the next QueryContext wait for? Must the 26th request always block?",
    "code": "package pages\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n)\n\nfunc VisitPages(ctx context.Context, db *sql.DB, stop func(int64) bool) error {\n\tfor page := 0; page < 100; page++ {\n\t\trows, err := db.QueryContext(ctx,\n\t\t\t\"SELECT id FROM users ORDER BY id LIMIT 100 OFFSET $1\", page*100)\n\t\tif err != nil {\n\t\t\treturn err\n\t\t}\n\t\tdefer rows.Close()\n\t\tfor rows.Next() {\n\t\t\tvar id int64\n\t\t\tif err := rows.Scan(&id); err != nil {\n\t\t\t\treturn err\n\t\t\t}\n\t\t\tif stop(id) {\n\t\t\t\tbreak\n\t\t\t}\n\t\t}\n\t\tif err := rows.Err(); err != nil {\n\t\t\treturn err\n\t\t}\n\t}\n\treturn nil\n}",
    "options": [
      "Каждый QueryContext требует последующего db.Commit().",
      "Открытые Rows удерживают соединения, а defer ждёт выхода из VisitPages; следующий запрос может ждать свободное соединение или отмену контекста.",
      "Любой defer в цикле гарантированно блокирует именно 26-ю итерацию.",
      "break автоматически закрывает Rows и отменяет все defer.",
      "Проблему исправит увеличение лимита до 100, независимо от числа запросов.",
      "QueryContext не поддерживает ожидание пула с контекстом."
    ],
    "correct": 1,
    "explanationRU": "defer привязан к вызову функции, а не к итерации. Ранний break не закрывает Rows; если Next ещё не достиг конца последнего набора результатов, соединение остаётся занятым. Когда все разрешённые соединения заняты, QueryContext может ждать возврата соединения; отмена или дедлайн контекста позволяют прекратить ожидание. «Всегда навечно на странице 26» неверно: нужны 25 удерживаемых Rows, отсутствие освобождения и отмены. Если Next дошёл до конца и дальнейших result sets нет, Rows закрываются автоматически. Исправление ограничивает жизнь Rows вспомогательной функцией: её defer выполняется до следующей страницы, включая break и Scan-ошибку. Проверяем Scan, Rows.Err и Close; errors.Join сохраняет обе ошибки, если они возникли вместе.",
    "speechEN": "A defer belongs to a function call, not a loop iteration. An early break does not close Rows; before exhaustion of the final result set, the connection remains occupied. If every permitted connection is in use, QueryContext can wait for one to return; cancellation or a deadline can end the wait. Blocking forever on exactly page 26 requires 25 retained Rows and no release or cancellation. Exhausting the final result set closes Rows automatically. The fix bounds each Rows lifetime with a helper whose defer runs before the next page, including on break or Scan error. It checks Scan, Rows.Err and Close; errors.Join retains both errors if they occur together.",
    "correctedCode": "package pages\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"errors\"\n)\n\nfunc VisitPages(ctx context.Context, db *sql.DB, stop func(int64) bool) error {\n\tfor page := 0; page < 100; page++ {\n\t\tif err := visitPage(ctx, db, page, stop); err != nil {\n\t\t\treturn err\n\t\t}\n\t}\n\treturn nil\n}\nfunc visitPage(ctx context.Context, db *sql.DB, page int, stop func(int64) bool) (err error) {\n\trows, err := db.QueryContext(ctx,\n\t\t\"SELECT id FROM users ORDER BY id LIMIT 100 OFFSET $1\", page*100)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer func() { err = errors.Join(err, rows.Close()) }()\n\tfor rows.Next() {\n\t\tvar id int64\n\t\tif err := rows.Scan(&id); err != nil {\n\t\t\treturn err\n\t\t}\n\t\tif stop(id) {\n\t\t\tbreak\n\t\t}\n\t}\n\treturn rows.Err()\n}",
    "versionNote": "Семантика defer и владения Rows применима к 1.17/1.25/1.26. Исправление с errors.Join требует Go 1.20+. SQL использует PostgreSQL-подобный $1; тест проверяет реальный database/sql с управляемым driver, не работу PostgreSQL или согласованность пагинации.",
    "sources": [
      {
        "title": "database/sql — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/database/sql/sql.go"
      },
      {
        "title": "Defer statements — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
      },
      {
        "title": "errors.Join — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/errors/join.go"
      }
    ],
    "cardIds": [
      "c35",
      "c22"
    ]
  },
  {
    id: "q20",
    cardIds: ["c35", "c39"],
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
  },
  // =========================================================================
  // ЧАСТЬ 4: MUTEX, БИТЫ, КАНАЛЫ И SELECT (Q23 - Q27)
  // =========================================================================
  {
    "id": "q23",
    "title": "Задача 23: Мьютекс в методе со значением",
    "ru": "Что напечатает программа? Что сообщит go vet?",
    "en": "What does the program print? What does go vet report?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Counter struct {\n\tmu sync.Mutex\n\tn  int\n}\n\nfunc (c Counter) Inc() {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tc.n++\n}\n\nfunc main() {\n\tvar c Counter\n\tc.Inc()\n\tc.Inc()\n\tfmt.Println(c.n)\n}",
    "options": [
      "2: Lock и Unlock защищают поле n, поэтому оба увеличения сохраняются.",
      "0: метод получает копию Counter вместе с мьютексом; увеличивается поле копии.",
      "Deadlock: второй вызов Inc ждёт мьютекс, оставшийся захваченным в копии.",
      "Panic: копировать sync.Mutex запрещено во время выполнения.",
      "Ошибка компиляции: тип с sync.Mutex нельзя передавать по значению.",
      "1: первый вызов меняет оригинал, второй — копию."
    ],
    "correct": 1,
    "explanationRU": "Вывод — 0. У Inc получатель по значению: при каждом вызове копируется весь Counter, вместе с mu и n. Блокируется и увеличивается копия, оригинал не меняется. Компилятор это разрешает, runtime не проверяет; go vet (copylocks) сообщает: «Inc passes lock by value». Deadlock нет: копия берёт текущее состояние мьютекса, здесь свободное; копия занятого мьютекса была бы занятой. Исправление — получатель-указатель func (c *Counter) Inc(), тогда вывод 2. Тип с мьютексом передают и хранят по указателю.",
    "speechEN": "It prints 0. Inc has a value receiver, so every call copies the whole Counter, including the mutex and n; the copy is locked and incremented, and the original stays at zero. Neither the compiler nor the runtime stops this, but go vet's copylocks check reports that Inc passes a lock by value. With a pointer receiver it prints 2.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Counter struct {\n\tmu sync.Mutex\n\tn  int\n}\n\nfunc (c *Counter) Inc() {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tc.n++\n}\n\nfunc main() {\n\tvar c Counter\n\tc.Inc()\n\tc.Inc()\n\tfmt.Println(c.n)\n}",
    "versionNote": "Семантика получателя по значению не менялась с Go 1.0. Программа, исправление и go vet выполнены Go 1.24.7: вывод 0, после исправления 2.",
    "sources": [
      {
        "title": "sync.Mutex: must not be copied after first use",
        "url": "https://pkg.go.dev/sync#Mutex"
      },
      {
        "title": "go vet: copylocks",
        "url": "https://pkg.go.dev/golang.org/x/tools/go/analysis/passes/copylock"
      },
      {
        "title": "Go specification: method declarations",
        "url": "https://go.dev/ref/spec#Method_declarations"
      }
    ],
    "cardIds": [
      "c21"
    ]
  },
  {
    "id": "q24",
    "title": "Задача 24: Unlock без Lock и recover",
    "ru": "Что напечатает программа? Поможет ли recover в отложенной функции?",
    "en": "What does the program print? Does recover in the deferred function help?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tdefer func() {\n\t\tfmt.Println(\"recovered:\", recover())\n\t}()\n\tvar mu sync.Mutex\n\tmu.Unlock()\n\tfmt.Println(\"after unlock\")\n}",
    "options": [
      "after unlock: Unlock свободного мьютекса ничего не делает.",
      "recovered: sync: unlock of unlocked mutex — отложенная функция перехватила panic.",
      "after unlock, затем recovered: <nil>.",
      "fatal error: sync: unlock of unlocked mutex и код завершения 2; отложенная функция не выполняется.",
      "Программа зависнет: Unlock ждёт, пока кто-нибудь вызовет Lock.",
      "Ошибка компиляции: go build проверяет парность Lock и Unlock."
    ],
    "correct": 3,
    "explanationRU": "Вывод — «fatal error: sync: unlock of unlocked mutex» и трассировка, код завершения 2. Быстрый путь Unlock вычитает бит locked, получает ненулевой результат, и unlockSlow видит, что locked не был установлен. Вызывается fatal, а не panic: такую ошибку recover не перехватывает, отложенные функции не выполняются, процесс завершается сразу. Так runtime не продолжает работу с испорченным состоянием мьютекса. Правило: Unlock — только после своего Lock, обычно defer mu.Unlock() сразу за Lock. Разблокировать из другой горутины можно, но Lock перед этим обязателен.",
    "speechEN": "It prints fatal error: sync: unlock of unlocked mutex, and the process exits with status 2. Unlocking an unlocked mutex is a fatal runtime error, not a panic, so recover cannot catch it and deferred functions do not run. Pair every Unlock with a Lock, usually with defer right after Lock.",
    "versionNote": "В Go 1.17 здесь вызывался throw, в Go 1.26.1 — fatal (internal/sync/mutex.go:203–205); оба не перехватываются recover. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "internal/sync/mutex.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/internal/sync/mutex.go"
      },
      {
        "title": "sync.Mutex.Unlock: run-time error if not locked",
        "url": "https://pkg.go.dev/sync#Mutex.Unlock"
      },
      {
        "title": "Go specification: handling panics",
        "url": "https://go.dev/ref/spec#Handling_panics"
      }
    ],
    "cardIds": [
      "c21"
    ]
  },
  {
    "id": "q25",
    "title": "Задача 25: Приоритет & и переполнение uint8",
    "ru": "Что напечатает программа? Почему -7 % 4 и -7 & 3 различаются?",
    "en": "What does the program print? Why do -7 % 4 and -7 & 3 differ?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tx := 6\n\tif x&1 == 0 {\n\t\tfmt.Println(\"even\")\n\t} else {\n\t\tfmt.Println(\"odd\")\n\t}\n\tvar b uint8 = 200\n\tb += 100\n\tfmt.Println(b, -7%4, -7&3)\n}",
    "options": [
      "odd, затем 44 -3 1: как в C, == связывает сильнее, чем &.",
      "even, затем 44 -3 1.",
      "even, затем 300 -3 -3.",
      "Ошибка компиляции: x&1 нельзя сравнивать с 0 без скобок.",
      "even, затем panic: переполнение при b += 100.",
      "even, затем 44 1 1: для степени двойки % и & совпадают всегда."
    ],
    "correct": 1,
    "explanationRU": "Вывод: even, затем 44 -3 1. В Go у & тот же приоритет, что у * (5), у == — 3, поэтому x&1 == 0 — это (x&1) == 0; в C наоборот. uint8 переполняется циклически: 200 + 100 = 300, 300 − 256 = 44, паники нет. Остаток берёт знак делимого: -7 % 4 = -3. А -7 & 3 работает с битами дополнительного кода: …11111001 & 011 = 001, то есть 1. Поэтому x % 4 и x & 3 гарантированно совпадают только при x ≥ 0; при отрицательном x — лишь если x кратно 4. Для n, не являющегося степенью двойки, замена % на & неверна вовсе.",
    "speechEN": "It prints even, then 44 -3 1. In Go, & binds tighter than ==, so x&1 == 0 means (x&1) == 0, the opposite of C. uint8 arithmetic wraps, so 300 becomes 44. The remainder takes the sign of the dividend, so -7 % 4 is -3, while -7 & 3 works on two's-complement bits and gives 1. For a power-of-two n, x % n equals x & (n-1) for every non-negative x; for negative x they differ unless x is a multiple of n.",
    "versionNote": "Правила спецификации не менялись с Go 1.0. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: operator precedence",
        "url": "https://go.dev/ref/spec#Operator_precedence"
      },
      {
        "title": "Go specification: arithmetic operators",
        "url": "https://go.dev/ref/spec#Arithmetic_operators"
      },
      {
        "title": "Go specification: integer overflow",
        "url": "https://go.dev/ref/spec#Integer_overflow"
      }
    ]
  },
  {
    "id": "q26",
    "title": "Задача 26: Закрытый буферизованный канал и range",
    "ru": "Что напечатает программа? Что происходит с буфером при close?",
    "en": "What does the program print? What happens to the buffer on close?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan int, 3)\n\tch <- 1\n\tch <- 2\n\tclose(ch)\n\tfor v := range ch {\n\t\tfmt.Print(v, \" \")\n\t}\n\tv, ok := <-ch\n\tfmt.Println(v, ok)\n}",
    "options": [
      "0 false: после close значения из буфера теряются, range сразу завершается.",
      "1 2 0 false: range отдаёт остаток буфера и заканчивается; следующее чтение — нулевое значение и ok=false.",
      "1 2, затем panic: чтение из закрытого канала.",
      "1 2 0 true: значение 0 считается полученным.",
      "Программа зависнет: range ждёт новых значений.",
      "Panic при close: в буфере остались непрочитанные значения."
    ],
    "correct": 1,
    "explanationRU": "Вывод: 1 2 0 false. close не стирает буфер: чтения сначала забирают оставшиеся значения с ok=true. range по каналу заканчивается, когда канал закрыт и буфер пуст. Следующее чтение не блокируется и сразу возвращает нулевое значение и ok=false. Закрывать канал с непустым буфером можно; panic дают только отправка в закрытый канал, повторный close и close(nil). В runtime chanrecv при closed = 1 сначала смотрит qcount: пока он больше нуля, значение берётся из buf[recvx].",
    "speechEN": "It prints 1 2 0 false. Closing a channel does not discard buffered values: receives drain them first with ok true, and range stops once the channel is closed and empty. After that, a receive returns the zero value with ok false immediately. Only sending on a closed channel, closing it twice, or closing nil panics.",
    "versionNote": "Семантика спецификации; путь runtime сверен с chan.go Go 1.26.1 (chanrecv). Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: close",
        "url": "https://go.dev/ref/spec#Close"
      },
      {
        "title": "Go specification: receive operator",
        "url": "https://go.dev/ref/spec#Receive_operator"
      },
      {
        "title": "Go specification: for statements with range clause",
        "url": "https://go.dev/ref/spec#For_range"
      },
      {
        "title": "chan.go — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "cardIds": [
      "c13",
      "c14"
    ]
  },
  {
    "id": "q27",
    "title": "Задача 27: Выражение в ветке отправки select",
    "ru": "Что напечатает программа? Вызовется ли build(), если выиграет default?",
    "en": "What does the program print? Is build() called if default wins?",
    "code": "package main\n\nimport \"fmt\"\n\nfunc build() int {\n\tfmt.Println(\"build\")\n\treturn 1\n}\n\nfunc main() {\n\tvar ch chan int\n\tselect {\n\tcase ch <- build():\n\t\tfmt.Println(\"sent\")\n\tdefault:\n\t\tfmt.Println(\"default\")\n\t}\n}",
    "options": [
      "default: при nil-канале ветка пропускается целиком, build() не вызывается.",
      "build, затем default: отправляемое значение вычисляется до выбора ветки.",
      "build, затем sent: отправка в nil-канал внутри select проходит сразу.",
      "Panic: отправка в nil-канал.",
      "Программа зависнет: отправка в nil-канал блокирует навсегда, default не поможет.",
      "Ошибка компиляции: в select нельзя использовать nil-канал."
    ],
    "correct": 1,
    "explanationRU": "Вывод: build, затем default. При входе в select канал и отправляемое значение каждой ветки вычисляются ровно один раз, в порядке исходника, и только потом выбирается операция. Поэтому build() отработает, даже если победит default. Отправка в nil-канал никогда не готова: select с одной операцией и default компилируется в selectnbsend, а chansend для nil сразу возвращает false — выполняется default. Без default горутина заблокировалась бы навсегда; в этой программе runtime завершил бы её с fatal error: all goroutines are asleep - deadlock! Дорогую подготовку с побочными эффектами выноси из case и делай отменяемой через context.",
    "speechEN": "It prints build, then default. On entering select, the channel and the value to send in every case are evaluated exactly once, in source order, before any case is chosen. So build runs even though default wins. A send on a nil channel is never ready, so with nothing else ready the default branch runs.",
    "versionNote": "Порядок вычисления — правило спецификации select. Программа выполнена Go 1.24.7.",
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
        "title": "chan.go (chansend, selectnbsend) — Go 1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/runtime/chan.go"
      }
    ],
    "cardIds": [
      "c18",
      "c19"
    ]
  },
  // =========================================================================
  // ЧАСТЬ 5: ИДИОМЫ НЕДЕЛЬ 1–2 — МЕТОДЫ, ОШИБКИ, DEFER, MAP, ВСТРАИВАНИЕ, ТЕСТЫ (Q28 - Q35)
  // =========================================================================
  {
    "id": "q28",
    "title": "Задача 28: Pointer-метод, интерфейс и элемент map",
    "ru": "Программа компилируется и печатает «hi a» дважды. Какие из закомментированных строк (3) и (4) скомпилируются, если их раскомментировать?",
    "en": "The program compiles and prints \"hi a\" twice. Which of the commented lines (3) and (4) would compile if uncommented?",
    "code": "package main\n\nimport \"fmt\"\n\ntype Notifier interface{ Notify() string }\n\ntype Service struct{ name string }\n\nfunc (s *Service) Notify() string { return \"hi \" + s.name }\n\nfunc main() {\n\ts := Service{name: \"a\"}\n\tfmt.Println(s.Notify()) // (1)\n\tvar n Notifier = &s     // (2)\n\tfmt.Println(n.Notify())\n\t// var x Notifier = s          // (3)\n\tm := map[string]Service{\"a\": s}\n\t// fmt.Println(m[\"a\"].Notify()) // (4)\n\t_ = m\n}",
    "options": [
      "Обе: Go сам возьмёт адрес s и m[\"a\"], как в строке (1).",
      "Только (3): при присваивании интерфейсу значение получает pointer-методы.",
      "Только (4): элемент map адресуем, а интерфейсу нужен именно указатель.",
      "Ни одна: Service не реализует Notifier, а элемент map неадресуем.",
      "Обе скомпилируются, но (3) упадёт с panic: nil pointer dereference.",
      "Ни одна, и строка (1) на самом деле тоже не должна компилироваться."
    ],
    "correct": 3,
    "explanationRU": "Ни одна. Строка (1) работает, потому что s адресуема: s.Notify() — сокращение для (&s).Notify(). Но в наборе методов Service нет Notify с pointer-ресивером, поэтому (3) — ошибка «Service does not implement Notifier (method Notify has pointer receiver)». В (4) элемент map неадресуем, взять &m[\"a\"] нельзя: «cannot call pointer method Notify on Service». Исправления: в интерфейс класть &s; в map хранить *Service или сначала скопировать элемент в переменную.",
    "speechEN": "Neither compiles. Line one works because s is addressable, so the call is shorthand for (&s).Notify. But the method set of Service does not include a pointer-receiver method, so a Service value does not implement Notifier. And a map element is not addressable, so you cannot call a pointer method on m[\"a\"]. Put &s in the interface, or store *Service in the map.",
    "versionNote": "Правила наборов методов и адресуемости одинаковы во всех версиях Go. Сообщения компилятора — из Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: method sets",
        "url": "https://go.dev/ref/spec#Method_sets"
      },
      {
        "title": "Go specification: address operators",
        "url": "https://go.dev/ref/spec#Address_operators"
      },
      {
        "title": "Go specification: calls",
        "url": "https://go.dev/ref/spec#Calls"
      }
    ],
    "cardIds": [
      "c34"
    ]
  },
  {
    "id": "q29",
    "title": "Задача 29: %v вместо %w",
    "ru": "Что напечатает программа? Почему текст ошибки одинаковый, а результат errors.Is — нет?",
    "en": "What does the program print? Why is the error text the same while errors.Is differs?",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\nvar ErrNotFound = errors.New(\"not found\")\n\nfunc find() error { return fmt.Errorf(\"find user 7: %v\", ErrNotFound) }\n\nfunc main() {\n\terr := find()\n\tfmt.Println(err)\n\tfmt.Println(errors.Is(err, ErrNotFound))\n\terr = fmt.Errorf(\"find user 7: %w\", ErrNotFound)\n\tfmt.Println(errors.Is(err, ErrNotFound), errors.Unwrap(err) == ErrNotFound)\n}",
    "options": [
      "find user 7: not found, true, true true — %v и %w одинаково сохраняют цепочку.",
      "find user 7: not found, false, true true.",
      "find user 7: not found, false, false false — %w работает только в errors.Join.",
      "not found, true, true false.",
      "find user 7: not found, false, true false — Unwrap возвращает обёртку целиком.",
      "Ошибка компиляции: %w нельзя смешивать с текстом в Errorf."
    ],
    "correct": 1,
    "explanationRU": "%v лишь подставляет текст ошибки: у новой ошибки нет Unwrap, и errors.Is не находит ErrNotFound — false. С %w fmt.Errorf создаёт ошибку, чей Unwrap возвращает ErrNotFound: errors.Is — true, errors.Unwrap(err) == ErrNotFound — true. Текст в обоих случаях одинаковый, поэтому ошибку видно только при проверке. Исправление — %w везде, где вызывающему нужно распознать причину.",
    "speechEN": "It prints the message, then false, then true true. With %v the original error is only formatted into the text, so the chain is cut and errors.Is fails. With %w the new error wraps the original: Unwrap returns it and errors.Is finds it. The text looks identical either way, which is why this bug hides so well.",
    "correctedCode": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\nvar ErrNotFound = errors.New(\"not found\")\n\nfunc find() error { return fmt.Errorf(\"find user 7: %w\", ErrNotFound) }\n\nfunc main() {\n\terr := find()\n\tfmt.Println(err)\n\tfmt.Println(errors.Is(err, ErrNotFound))\n\terr = fmt.Errorf(\"find user 7: %w\", ErrNotFound)\n\tfmt.Println(errors.Is(err, ErrNotFound), errors.Unwrap(err) == ErrNotFound)\n}",
    "versionNote": "%w и errors.Is — с Go 1.13. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "fmt.Errorf",
        "url": "https://pkg.go.dev/fmt#Errorf"
      },
      {
        "title": "Package errors",
        "url": "https://pkg.go.dev/errors"
      },
      {
        "title": "Working with Errors in Go 1.13",
        "url": "https://go.dev/blog/go1.13-errors"
      }
    ],
    "cardIds": [
      "c39"
    ]
  },
  {
    "id": "q30",
    "title": "Задача 30: errors.Join и errors.Unwrap",
    "ru": "Что напечатает программа? Что вернёт errors.Unwrap для объединённой ошибки?",
    "en": "What does the program print? What does errors.Unwrap return for a joined error?",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\nfunc main() {\n\terrA := errors.New(\"a\")\n\terrB := errors.New(\"b\")\n\terr := errors.Join(errA, nil, errB)\n\tfmt.Printf(\"%q\\n\", err.Error())\n\tfmt.Println(errors.Is(err, errB))\n\tfmt.Println(errors.Join(nil, nil) == nil)\n\tfmt.Println(errors.Unwrap(err) == nil)\n}",
    "options": [
      "\"a; b\", true, false, false.",
      "\"a\\nb\", true, true, true.",
      "\"a\\nb\", false, true, false — errors.Is смотрит только первую ошибку.",
      "\"a\\n<nil>\\nb\", true, false, false.",
      "\"a\\nb\", true, false, false — Join(nil, nil) возвращает пустую, но не nil ошибку.",
      "panic: nil среди аргументов errors.Join."
    ],
    "correct": 1,
    "explanationRU": "errors.Join пропускает nil и соединяет сообщения переводом строки (%q показывает его как \\n). errors.Is ищет во всех ветках — true. Join только из nil возвращает nil — true. А errors.Unwrap вызывает лишь метод Unwrap() error; у объединённой ошибки метод Unwrap() []error, поэтому errors.Unwrap возвращает nil — true. Обходить ветки нужно через errors.Is и errors.As или приведение к interface{ Unwrap() []error }.",
    "speechEN": "It prints \"a\\nb\" and then true three times. Join drops nil errors and joins the messages with newlines, and errors.Is searches every branch. Joining only nils returns nil. But errors.Unwrap returns nil, because a joined error's Unwrap returns a slice, and errors.Unwrap only calls the single-error form.",
    "versionNote": "errors.Join — Go 1.20. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "errors.Join",
        "url": "https://pkg.go.dev/errors#Join"
      },
      {
        "title": "Go 1.20 release notes: wrapping multiple errors",
        "url": "https://go.dev/doc/go1.20#errors"
      }
    ],
    "cardIds": [
      "c39"
    ]
  },
  {
    "id": "q31",
    "title": "Задача 31: Defer и безымянный результат",
    "ru": "Что напечатает программа? Чем f отличается от g? (Вариант к задаче 3.)",
    "en": "What does the program print? How does f differ from g? (A variant of task 3.)",
    "code": "package main\n\nimport \"fmt\"\n\nfunc f() int {\n\tx := 0\n\tdefer func() { x++ }()\n\treturn x\n}\n\nfunc g() (x int) {\n\tdefer func() { x++ }()\n\treturn x\n}\n\nfunc main() {\n\tfmt.Println(f(), g())\n}",
    "options": [
      "1 1: defer всегда меняет возвращаемое значение.",
      "0 0: defer выполняется до return.",
      "0 1.",
      "1 0.",
      "0 1, но только если в go.mod go 1.22 или новее.",
      "Ошибка компиляции: x в f не используется после defer."
    ],
    "correct": 2,
    "explanationRU": "В f оператор return x копирует текущее значение x (0) в безымянный результат, и только потом выполняется defer: он увеличивает локальную x, но результат уже записан — 0. В g результат именованный: return x присваивает его самому себе, затем отложенная функция увеличивает именно результат — 1. Изменить возвращаемое значение из defer можно только через именованный результат.",
    "speechEN": "It prints 0 1. In f, return copies x into an unnamed result before the deferred function runs, so incrementing x afterwards changes nothing. In g the result is named, so the deferred closure increments the result itself. That is the only way a deferred call can change a return value.",
    "versionNote": "Порядок return и defer не менялся. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: defer statements",
        "url": "https://go.dev/ref/spec#Defer_statements"
      },
      {
        "title": "Go specification: return statements",
        "url": "https://go.dev/ref/spec#Return_statements"
      }
    ],
    "cardIds": [
      "c35"
    ]
  },
  {
    "id": "q32",
    "title": "Задача 32: Recover в своей горутине и nil map",
    "ru": "Что напечатает программа? Дойдёт ли main до последней строки? (Вариант к задаче 5.)",
    "en": "What does the program print? Does main reach its last line? (A variant of task 5.)",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\twg.Add(1)\n\tgo func() {\n\t\tdefer wg.Done()\n\t\tdefer func() {\n\t\t\tif r := recover(); r != nil {\n\t\t\t\tfmt.Println(\"recovered:\", r)\n\t\t\t}\n\t\t}()\n\t\tvar m map[string]int\n\t\tfmt.Println(m[\"x\"], len(m))\n\t\tm[\"x\"] = 1\n\t\tfmt.Println(\"unreachable\")\n\t}()\n\twg.Wait()\n\tfmt.Println(\"main continues\")\n}",
    "options": [
      "0 0, затем программа падает: recover в горутине не работает.",
      "0 0, recovered: assignment to entry in nil map, main continues.",
      "panic сразу на m[\"x\"]: читать из nil map запрещено.",
      "0 0, main continues — в горутинах panic молча игнорируется.",
      "0 0, recovered: …, unreachable, main continues.",
      "Deadlock: после panic wg.Done уже не вызовется."
    ],
    "correct": 1,
    "explanationRU": "Чтение из nil map и len возвращают нули. Запись в nil map вызывает panic «assignment to entry in nil map». Panic разворачивает стек этой горутины и выполняет её отложенные вызовы в обратном порядке: сначала функция с recover останавливает панику, затем wg.Done. Строка unreachable не выполняется, а main печатает «main continues». В задаче 5 recover был в main и не мог поймать панику другой горутины: recover работает только в отложенном вызове той горутины, где паника произошла.",
    "speechEN": "It prints 0 0, then recovered: assignment to entry in nil map, then main continues. Reading a nil map is fine, writing to it panics. The panic unwinds only this goroutine and runs its deferred calls in reverse order: the recover stops the panic, then wg.Done runs. recover works only in a deferred call of the panicking goroutine, which is why main could not catch it in task 5.",
    "versionNote": "Семантика panic, recover и nil map не менялась. Программа выполнена Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: handling panics",
        "url": "https://go.dev/ref/spec#Handling_panics"
      },
      {
        "title": "Go specification: map types",
        "url": "https://go.dev/ref/spec#Map_types"
      }
    ],
    "cardIds": [
      "c35",
      "c40"
    ]
  },
  {
    "id": "q33",
    "title": "Задача 33: Какой тип может быть ключом map",
    "ru": "Строки (3) и (4) закомментированы. Что произойдёт при запуске программы как есть и что скажет компилятор, если раскомментировать (3) и (4)?",
    "en": "Lines (3) and (4) are commented out. What happens when the program runs as is, and what does the compiler say if (3) and (4) are uncommented?",
    "code": "package main\n\nimport \"fmt\"\n\ntype Point struct{ X, Y int }\n\ntype Tagged struct {\n\tName string\n\tTags []string\n}\n\nvar a map[Point]int   // (1)\nvar b map[[2]int]bool // (2)\n// var c map[[]int]bool // (3)\n// var d map[Tagged]int // (4)\nvar e = map[any]int{} // (5)\n\nfunc main() {\n\tfmt.Println(len(a), len(b))\n\te[Point{1, 2}] = 1\n\te[[]int{1}] = 2 // (6)\n\tfmt.Println(len(e))\n}",
    "options": [
      "Печатает 0 0, затем 2; (3) и (4) компилируются.",
      "Печатает 0 0, затем panic: hash of unhashable type []int; (3) и (4) — ошибки «invalid map key type».",
      "Ошибка компиляции уже в (5): map[any] не принимает срезы.",
      "Печатает 0 0, затем 2; (3) не компилируется, а (4) компилируется: Tagged сравнивается по Name.",
      "panic уже на len(a): a — nil map.",
      "Печатает 0 0 и 1: срез как ключ any молча пропускается."
    ],
    "correct": 1,
    "explanationRU": "Ключ map должен быть сравнимого типа. [2]int и Point (все поля сравнимы) подходят; []int — нет, и структура Tagged с полем []string тоже несравнима, поэтому компилятор отвергает (3) и (4): «invalid map key type». С ключом any проверка переносится на время выполнения: e[Point{1, 2}] работает, а e[[]int{1}] вызывает panic «hash of unhashable type []int». len у nil map равен 0.",
    "speechEN": "It prints 0 0 and then panics with hash of unhashable type []int. Map keys must be comparable: arrays and structs of comparable fields are fine, slices are not, and a struct with a slice field is not comparable either, so lines three and four are compile errors. With interface keys the check moves to run time, which is why the []int key panics.",
    "versionNote": "Правила сравнимости не менялись. Программа и сообщения компилятора — Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: map types",
        "url": "https://go.dev/ref/spec#Map_types"
      },
      {
        "title": "Go specification: comparison operators",
        "url": "https://go.dev/ref/spec#Comparison_operators"
      }
    ],
    "cardIds": [
      "c40",
      "c32"
    ]
  },
  {
    "id": "q34",
    "title": "Задача 34: Встраивание и неоднозначный метод",
    "ru": "Что напечатает программа? Что будет, если раскомментировать строку (*)?",
    "en": "What does the program print? What happens if line (*) is uncommented?",
    "code": "package main\n\nimport \"fmt\"\n\ntype Logger struct{}\n\nfunc (Logger) Log() string { return \"logger\" }\n\ntype Auditor struct{}\n\nfunc (Auditor) Log() string { return \"auditor\" }\n\ntype Service struct {\n\tLogger\n\tAuditor\n}\n\ntype Handler struct {\n\tLogger\n}\n\nfunc (Handler) Log() string { return \"handler\" }\n\nfunc main() {\n\th := Handler{}\n\tfmt.Println(h.Log(), h.Logger.Log())\n\ts := Service{}\n\tfmt.Println(s.Auditor.Log())\n\t// fmt.Println(s.Log()) // (*)\n}",
    "options": [
      "logger logger, auditor; (*) печатает logger — побеждает первое встроенное поле.",
      "handler logger, auditor; (*) — ошибка компиляции: ambiguous selector s.Log.",
      "handler handler, auditor; (*) печатает auditor.",
      "Ошибка компиляции уже в объявлении Service: два встроенных метода Log.",
      "handler logger, auditor; (*) — panic во время выполнения.",
      "logger logger, auditor; (*) — ошибка компиляции."
    ],
    "correct": 1,
    "explanationRU": "Метод внешнего типа затеняет продвинутый метод встроенного: h.Log() — «handler», а h.Logger.Log() явно вызывает встроенный. В Service два встроенных поля на одной глубине дают метод Log, поэтому селектор s.Log неоднозначен. Сам тип Service объявлен корректно — ошибка возникает только при обращении s.Log, и Service не реализует interface{ Log() string }. Встраивание продвигает поля и методы, но это не наследование: виртуального переопределения нет.",
    "speechEN": "It prints handler logger, then auditor. An outer method shadows the promoted one, and you can still call the embedded method explicitly. With two embedded types at the same depth, s.Log is ambiguous, so uncommenting that line is a compile error, while declaring Service is fine. Embedding promotes fields and methods; it is not inheritance, and there is no virtual dispatch.",
    "versionNote": "Правила продвижения и селекторов не менялись. Программа и сообщение компилятора — Go 1.24.7.",
    "sources": [
      {
        "title": "Go specification: struct types: promoted fields and methods",
        "url": "https://go.dev/ref/spec#Struct_types"
      },
      {
        "title": "Go specification: selectors",
        "url": "https://go.dev/ref/spec#Selectors"
      }
    ],
    "cardIds": [
      "c34"
    ]
  },
  {
    "id": "q35",
    "title": "Задача 35: Параллельные подтесты и defer",
    "ru": "Это файл теста. Что покажет go test -v и почему?",
    "en": "This is a test file. What does go test -v report, and why?",
    "code": "package db\n\nimport (\n\t\"sync\"\n\t\"testing\"\n)\n\ntype fakeDB struct {\n\tmu     sync.Mutex\n\tclosed bool\n}\n\nfunc (d *fakeDB) Close() { d.mu.Lock(); d.closed = true; d.mu.Unlock() }\n\nfunc (d *fakeDB) Query() bool {\n\td.mu.Lock()\n\tdefer d.mu.Unlock()\n\treturn !d.closed\n}\n\nfunc TestQueries(t *testing.T) {\n\tdb := &fakeDB{}\n\tdefer db.Close()\n\tfor _, name := range []string{\"a\", \"b\"} {\n\t\tt.Run(name, func(t *testing.T) {\n\t\t\tt.Parallel()\n\t\t\tif !db.Query() {\n\t\t\t\tt.Error(\"database already closed\")\n\t\t\t}\n\t\t})\n\t}\n}",
    "options": [
      "PASS: подтесты выполняются до выхода из TestQueries, а defer — после.",
      "FAIL в обоих подтестах: «database already closed» — defer родителя сработал раньше параллельных подтестов.",
      "Гонка данных под -race: fakeDB никак не защищён.",
      "FAIL только в одном подтесте — второй успевает до Close.",
      "PASS, но только с флагом -parallel 1.",
      "Deadlock: t.Parallel ждёт родителя, а родитель — подтесты."
    ],
    "correct": 1,
    "explanationRU": "t.Parallel ставит подтест на паузу (в выводе -v — PAUSE) до возврата из функции родителя; затем подтесты продолжаются (CONT). Defer родителя срабатывает при этом возврате — раньше подтестов, поэтому оба видят закрытую базу. Исправление: t.Cleanup(db.Close) — cleanup выполняется после завершения теста и всех его подтестов. -race здесь ничего не покажет: доступ защищён mutex, ошибка логическая.",
    "speechEN": "Both subtests fail with database already closed. A parallel subtest pauses until its parent's function returns, and the parent's defer runs at exactly that moment, before the subtests continue. Register the teardown with t.Cleanup instead: it runs after the test and all its subtests have finished.",
    "correctedCode": "package db\n\nimport (\n\t\"sync\"\n\t\"testing\"\n)\n\ntype fakeDB struct {\n\tmu     sync.Mutex\n\tclosed bool\n}\n\nfunc (d *fakeDB) Close() { d.mu.Lock(); d.closed = true; d.mu.Unlock() }\n\nfunc (d *fakeDB) Query() bool {\n\td.mu.Lock()\n\tdefer d.mu.Unlock()\n\treturn !d.closed\n}\n\nfunc TestQueries(t *testing.T) {\n\tdb := &fakeDB{}\n\tt.Cleanup(db.Close) // runs after all subtests\n\tfor _, name := range []string{\"a\", \"b\"} {\n\t\tt.Run(name, func(t *testing.T) {\n\t\t\tt.Parallel()\n\t\t\tif !db.Query() {\n\t\t\t\tt.Error(\"database already closed\")\n\t\t\t}\n\t\t})\n\t}\n}",
    "versionNote": "t.Cleanup — с Go 1.14; поведение t.Parallel одинаково в Go 1.17–1.27. Проверено go test -v на Go 1.24.7.",
    "sources": [
      {
        "title": "testing.T.Parallel",
        "url": "https://pkg.go.dev/testing#T.Parallel"
      },
      {
        "title": "testing.T.Cleanup",
        "url": "https://pkg.go.dev/testing#T.Cleanup"
      },
      {
        "title": "Using Subtests and Sub-benchmarks",
        "url": "https://go.dev/blog/subtests"
      }
    ],
    "cardIds": [
      "c44"
    ]
  },
  // =========================================================================
  // ЧАСТЬ 6: СЕРВИС НЕДЕЛИ 5 — HANDLER, МАРШРУТЫ, ЛОГИ, ERRORS.AS (Q36 - Q39)
  // =========================================================================
  {
    "id": "q36",
    "title": "Задача 36: http.Error без return",
    "ru": "Что получит клиент на GET /accounts/abc? Какой код ответа, какой Content-Type и какое тело?",
    "en": "What does the client get for GET /accounts/abc: which status, Content-Type and body?",
    "code": "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n\t\"io\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strconv\"\n)\n\nfunc getAccount(w http.ResponseWriter, r *http.Request) {\n\tid, err := strconv.Atoi(r.PathValue(\"id\"))\n\tif err != nil {\n\t\thttp.Error(w, \"bad id\", http.StatusBadRequest)\n\t}\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tjson.NewEncoder(w).Encode(map[string]int{\"id\": id})\n}\n\nfunc main() {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /accounts/{id}\", getAccount)\n\tsrv := httptest.NewServer(mux)\n\tdefer srv.Close()\n\n\tresp, err := http.Get(srv.URL + \"/accounts/abc\")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tbody, _ := io.ReadAll(resp.Body)\n\tresp.Body.Close()\n\tfmt.Printf(\"%d %s\\n%q\\n\", resp.StatusCode, resp.Header.Get(\"Content-Type\"), body)\n}",
    "options": [
      "400, text/plain, тело «bad id\\n» — http.Error завершает handler.",
      "400, text/plain, тело «bad id\\n{\"id\":0}\\n».",
      "200, application/json, тело {\"id\":0} — последний заголовок побеждает.",
      "400, application/json, тело «bad id\\n{\"id\":0}\\n».",
      "500: сервер ловит повторную запись в ответ.",
      "Ошибка компиляции: после http.Error нужен return."
    ],
    "correct": 1,
    "explanationRU": "http.Error только пишет ответ: ставит Content-Type text/plain, вызывает WriteHeader(400) и пишет текст. Handler продолжает работу: Header().Set после отправленных заголовков ничего не меняет, а Encode дописывает JSON в то же тело. Клиент получает 400, text/plain и «bad id» вместе с {\"id\":0}. Исправление — return сразу после http.Error (так же после любого раннего ответа).",
    "speechEN": "The client gets 400 with text/plain and a body that has both \"bad id\" and the JSON. http.Error writes the response but doesn't stop the handler, so the code keeps going: the late header change is ignored because headers are already sent, and the JSON is appended to the body. Always return right after writing an error.",
    "correctedCode": "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n\t\"io\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strconv\"\n)\n\nfunc getAccount(w http.ResponseWriter, r *http.Request) {\n\tid, err := strconv.Atoi(r.PathValue(\"id\"))\n\tif err != nil {\n\t\thttp.Error(w, \"bad id\", http.StatusBadRequest)\n\t\treturn\n\t}\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tjson.NewEncoder(w).Encode(map[string]int{\"id\": id})\n}\n\nfunc main() {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /accounts/{id}\", getAccount)\n\tsrv := httptest.NewServer(mux)\n\tdefer srv.Close()\n\n\tresp, err := http.Get(srv.URL + \"/accounts/abc\")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tbody, _ := io.ReadAll(resp.Body)\n\tresp.Body.Close()\n\tfmt.Printf(\"%d %s\\n%q\\n\", resp.StatusCode, resp.Header.Get(\"Content-Type\"), body)\n}",
    "versionNote": "Шаблон с {id} и r.PathValue — Go 1.22. Программа выполнена Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "net/http: Error",
        "url": "https://pkg.go.dev/net/http#Error"
      },
      {
        "title": "net/http: ResponseWriter",
        "url": "https://pkg.go.dev/net/http#ResponseWriter"
      }
    ],
    "cardIds": [
      "c45",
      "c46"
    ]
  },
  {
    "id": "q37",
    "title": "Задача 37: Маршруты Go 1.22 и 405",
    "ru": "Что напечатает программа? Обрати внимание на /accounts/new и на запрос без id.",
    "en": "What does the program print? Look at /accounts/new and at the request without an id.",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n)\n\nfunc main() {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /accounts/{id}\", func(w http.ResponseWriter, r *http.Request) {\n\t\tfmt.Fprint(w, \"account \"+r.PathValue(\"id\"))\n\t})\n\tmux.HandleFunc(\"GET /accounts/new\", func(w http.ResponseWriter, r *http.Request) {\n\t\tfmt.Fprint(w, \"new-account form\")\n\t})\n\tmux.HandleFunc(\"POST /accounts\", func(w http.ResponseWriter, r *http.Request) {\n\t\tw.WriteHeader(http.StatusCreated)\n\t})\n\n\tfor _, req := range []struct{ method, path string }{\n\t\t{\"GET\", \"/accounts/new\"},\n\t\t{\"GET\", \"/accounts/42\"},\n\t\t{\"DELETE\", \"/accounts/42\"},\n\t\t{\"GET\", \"/accounts\"},\n\t} {\n\t\trec := httptest.NewRecorder()\n\t\tmux.ServeHTTP(rec, httptest.NewRequest(req.method, req.path, nil))\n\t\tfmt.Printf(\"%s %s → %d %q allow=%q\\n\", req.method, req.path, rec.Code, rec.Body.String(), rec.Header().Get(\"Allow\"))\n\t}\n}",
    "options": [
      "new → «account new»; 42 → 200; DELETE → 404; GET /accounts → 404.",
      "new → «new-account form»; 42 → 200; DELETE → 405, Allow: GET, HEAD; GET /accounts → 405, Allow: POST.",
      "new → «new-account form»; 42 → 200; DELETE → 404; GET /accounts → 404.",
      "Паника при регистрации: /accounts/new и /accounts/{id} конфликтуют.",
      "new → «account new»; 42 → 200; DELETE → 405; GET /accounts → 405.",
      "new → «new-account form»; 42 → 200; DELETE → 405, Allow: GET; GET /accounts → 200."
    ],
    "correct": 1,
    "explanationRU": "С Go 1.22 побеждает более конкретный шаблон: /accounts/new конкретнее /accounts/{id}, поэтому это не конфликт. Если путь совпал с шаблоном, но метод другой, ServeMux отвечает 405 и перечисляет разрешённые методы в Allow; шаблон GET разрешает и HEAD. GET /accounts совпадает по пути только с POST /accounts — снова 405 с Allow: POST.",
    "speechEN": "The new-account form wins over the wildcard because the more specific pattern takes precedence. DELETE on an account gets 405 with Allow: GET, HEAD, since a GET pattern also serves HEAD, and GET on /accounts gets 405 with Allow: POST. Since Go 1.22 the standard mux does method routing, so many services don't need a router library.",
    "versionNote": "Методы и подстановки в шаблонах ServeMux — Go 1.22 (в модуле с go 1.22+). Программа выполнена Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "net/http: ServeMux",
        "url": "https://pkg.go.dev/net/http#ServeMux"
      },
      {
        "title": "Routing Enhancements for Go 1.22",
        "url": "https://go.dev/blog/routing-enhancements"
      }
    ],
    "cardIds": [
      "c45"
    ]
  },
  {
    "id": "q38",
    "title": "Задача 38: Пароль в структурном логе",
    "ru": "Что окажется в логе? Как исправить так, чтобы новое поле структуры не утекло случайно?",
    "en": "What ends up in the log? How do you fix it so that a new struct field does not leak by accident?",
    "code": "package main\n\nimport (\n\t\"log/slog\"\n\t\"os\"\n)\n\ntype Login struct {\n\tUser     string\n\tPassword string\n}\n\nfunc main() {\n\tlog := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{\n\t\tReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {\n\t\t\tif a.Key == slog.TimeKey {\n\t\t\t\treturn slog.Attr{} // drop the time so the output is stable\n\t\t\t}\n\t\t\treturn a\n\t\t},\n\t}))\n\tin := Login{User: \"aleks\", Password: \"hunter2\"}\n\tlog.Info(\"login attempt\", \"request_id\", \"r-1\", \"input\", in)\n}",
    "options": [
      "Только msg и request_id: slog не логирует структуры.",
      "{\"input\":{\"User\":\"aleks\",\"Password\":\"hunter2\"}} — пароль в логе.",
      "Пароль заменён на ***: JSONHandler скрывает поля с именем Password.",
      "{\"input\":\"{aleks hunter2}\"} — структура как строка %v.",
      "Ошибка выполнения: JSONHandler не умеет логировать структуры.",
      "{\"input\":{}} — неэкспортируемые поля не пишутся."
    ],
    "correct": 1,
    "explanationRU": "JSONHandler кодирует структуру как обычный JSON: все экспортируемые поля, включая Password. slog ничего не маскирует сам. Надёжное исправление — метод LogValue() slog.Value у типа Login, который возвращает только безопасные поля: он действует везде, где тип попадает в лог, и новое поле не появится, пока его не добавят осознанно. Вариант попроще — логировать в месте вызова только \"user\", in.User.",
    "speechEN": "The password goes straight into the log: the JSON handler encodes every exported field and slog does not redact anything. I give the type a LogValue method that returns only safe fields, so wherever the type is logged it's redacted, and a new field stays hidden until someone adds it on purpose.",
    "correctedCode": "package main\n\nimport (\n\t\"log/slog\"\n\t\"os\"\n)\n\ntype Login struct {\n\tUser     string\n\tPassword string\n}\n\n// LogValue controls how a Login is logged: the password never leaves the process.\nfunc (l Login) LogValue() slog.Value {\n\treturn slog.GroupValue(slog.String(\"user\", l.User))\n}\n\nfunc main() {\n\tlog := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{\n\t\tReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {\n\t\t\tif a.Key == slog.TimeKey {\n\t\t\t\treturn slog.Attr{} // drop the time so the output is stable\n\t\t\t}\n\t\t\treturn a\n\t\t},\n\t}))\n\tin := Login{User: \"aleks\", Password: \"hunter2\"}\n\tlog.Info(\"login attempt\", \"request_id\", \"r-1\", \"input\", in)\n}",
    "versionNote": "log/slog и LogValuer — Go 1.21. Программа выполнена Go 1.24.7 и 1.27.3; время убрано через ReplaceAttr.",
    "sources": [
      {
        "title": "log/slog: LogValuer",
        "url": "https://pkg.go.dev/log/slog#LogValuer"
      },
      {
        "title": "Package log/slog",
        "url": "https://pkg.go.dev/log/slog"
      }
    ],
    "cardIds": [
      "c48"
    ]
  },
  {
    "id": "q39",
    "title": "Задача 39: errors.As с целью-значением",
    "ru": "Что напечатает программа? Что скажет go vet?",
    "en": "What does the program print? What does go vet say?",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"net/http\"\n)\n\ntype ValidationError struct{ Field string }\n\nfunc (e *ValidationError) Error() string { return \"invalid \" + e.Field }\n\nvar ErrNotFound = errors.New(\"not found\")\n\nfunc status(err error) int {\n\tvar ve ValidationError\n\tif errors.As(err, &ve) {\n\t\treturn http.StatusBadRequest\n\t}\n\tif errors.Is(err, ErrNotFound) {\n\t\treturn http.StatusNotFound\n\t}\n\treturn http.StatusInternalServerError\n}\n\nfunc main() {\n\tdefer func() { fmt.Println(\"recovered:\", recover()) }()\n\terr := fmt.Errorf(\"create account: %w\", &ValidationError{Field: \"owner\"})\n\tfmt.Println(status(err))\n}",
    "options": [
      "400: errors.As находит ValidationError в цепочке.",
      "500: значение и указатель — разные типы, совпадения нет.",
      "recovered: errors: *target must be interface or implement error.",
      "404: ошибка не валидационная, срабатывает errors.Is.",
      "Ошибка компиляции: &ve не реализует error.",
      "400, но только если убрать обёртку fmt.Errorf."
    ],
    "correct": 2,
    "explanationRU": "Error объявлен на *ValidationError, поэтому сам тип ValidationError интерфейс error не реализует. errors.As проверяет цель во время выполнения и паникует: «errors: *target must be interface or implement error». Компилятор это пропускает, а go vet (проверка errorsas) сообщает: second argument to errors.As must be a non-nil pointer to either a type that implements error, or to any interface type. Исправление — var ve *ValidationError; тогда status вернёт 400.",
    "speechEN": "It panics: the error method is on the pointer type, so a ValidationError value doesn't implement error, and errors.As rejects that target at run time. The compiler accepts it, but go vet flags it. The target must be a pointer to the type that implements error, here a pointer to *ValidationError; then the function returns 400.",
    "correctedCode": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"net/http\"\n)\n\ntype ValidationError struct{ Field string }\n\nfunc (e *ValidationError) Error() string { return \"invalid \" + e.Field }\n\nvar ErrNotFound = errors.New(\"not found\")\n\nfunc status(err error) int {\n\tvar ve *ValidationError\n\tif errors.As(err, &ve) {\n\t\treturn http.StatusBadRequest\n\t}\n\tif errors.Is(err, ErrNotFound) {\n\t\treturn http.StatusNotFound\n\t}\n\treturn http.StatusInternalServerError\n}\n\nfunc main() {\n\tdefer func() { fmt.Println(\"recovered:\", recover()) }()\n\terr := fmt.Errorf(\"create account: %w\", &ValidationError{Field: \"owner\"})\n\tfmt.Println(status(err))\n}",
    "versionNote": "errors.As — Go 1.13. Программа и сообщение go vet — Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "errors: As",
        "url": "https://pkg.go.dev/errors#As"
      },
      {
        "title": "go vet: errorsas",
        "url": "https://pkg.go.dev/golang.org/x/tools/go/analysis/passes/errorsas"
      }
    ],
    "cardIds": [
      "c46",
      "c39"
    ]
  },
  {
    "id": "q40",
    "title": "Задача 40: проверить ключ, потом списать",
    "ru": "Клиент повторил запрос по таймауту: два одинаковых запроса с одним ключом идемпотентности пришли одновременно. Что напечатает программа и что скажет go run -race?",
    "en": "The client retried after a timeout: two identical requests with the same idempotency key arrive at once. What does the program print, and what does go run -race report?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\n// Keys remembers idempotency keys; every method takes the lock.\ntype Keys struct {\n\tmu   sync.Mutex\n\tseen map[string]bool\n}\n\nfunc (k *Keys) Seen(key string) bool {\n\tk.mu.Lock()\n\tdefer k.mu.Unlock()\n\treturn k.seen[key]\n}\n\nfunc (k *Keys) Mark(key string) {\n\tk.mu.Lock()\n\tdefer k.mu.Unlock()\n\tk.seen[key] = true\n}\n\nfunc main() {\n\tkeys := &Keys{seen: map[string]bool{}}\n\tbalance, charges := 100, 0\n\tvar mu sync.Mutex\n\tvar checked sync.WaitGroup // both requests passed the check: the window is open\n\tchecked.Add(2)\n\tvar wg sync.WaitGroup\n\tfor range 2 { // the client retried after a timeout: same key, same request\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tif keys.Seen(\"order-42\") {\n\t\t\t\treturn\n\t\t\t}\n\t\t\tchecked.Done()\n\t\t\tchecked.Wait()\n\t\t\tmu.Lock()\n\t\t\tbalance -= 30\n\t\t\tcharges++\n\t\t\tmu.Unlock()\n\t\t\tkeys.Mark(\"order-42\")\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Println(\"charges:\", charges, \"balance:\", balance)\n}",
    "options": [
      "charges: 1 balance: 70 — второй запрос видит ключ и выходит.",
      "charges: 2 balance: 40, и -race молчит: гонки данных нет, есть логическая гонка.",
      "charges: 2 balance: 40, и -race сообщает DATA RACE на map seen.",
      "Дедлок: checked.Wait() ждёт вечно.",
      "Результат случайный: 1 или 2 списания, -race находит гонку на balance.",
      "Ошибка компиляции: range по числу."
    ],
    "correct": 1,
    "explanationRU": "Каждый метод Keys берёт мьютекс, поэтому гонки данных нет и -race молчит. Но «проверить» (Seen) и «отметить» (Mark) — две отдельные критические секции, и между ними окно: оба запроса проходят проверку, и деньги списываются дважды. WaitGroup checked лишь делает это окно гарантированным; в сервере оно возникает при любом повторе, пока первый запрос ещё работает. Исправление — занять ключ атомарно: проверка и отметка в одной критической секции (Claim), а в базе — INSERT … ON CONFLICT DO NOTHING по UNIQUE-ключу в транзакции перевода. Тогда программа печатает charges: 1 balance: 70.",
    "speechEN": "It charges twice and the race detector stays silent. Every method takes the lock, so there is no data race, but checking the key and marking it are two separate critical sections, and both requests pass the check before either marks it. That is a race condition. Claim the key atomically: check and mark under one lock, or in the database insert the key with on conflict do nothing in the same transaction as the transfer.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\n// Keys remembers idempotency keys; Claim checks and marks in one critical section.\ntype Keys struct {\n\tmu   sync.Mutex\n\tseen map[string]bool\n}\n\n// Claim reports whether the key was new and marks it, atomically.\nfunc (k *Keys) Claim(key string) bool {\n\tk.mu.Lock()\n\tdefer k.mu.Unlock()\n\tif k.seen[key] {\n\t\treturn false\n\t}\n\tk.seen[key] = true\n\treturn true\n}\n\nfunc main() {\n\tkeys := &Keys{seen: map[string]bool{}}\n\tbalance, charges := 100, 0\n\tvar mu sync.Mutex\n\tvar wg sync.WaitGroup\n\tfor range 2 { // the client retried after a timeout: same key, same request\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tif !keys.Claim(\"order-42\") {\n\t\t\t\treturn // a repeat: answer with the stored response\n\t\t\t}\n\t\t\tmu.Lock()\n\t\t\tbalance -= 30\n\t\t\tcharges++\n\t\t\tmu.Unlock()\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Println(\"charges:\", charges, \"balance:\", balance)\n}",
    "versionNote": "range по целому числу — Go 1.22. Программа выполнена с -race на Go 1.24.7 и 1.27.3: charges: 2 balance: 40 без отчёта о гонке; исправленная — charges: 1 balance: 70.",
    "sources": [
      {
        "title": "IETF draft: The Idempotency-Key HTTP Header Field",
        "url": "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/"
      },
      {
        "title": "PostgreSQL: INSERT — ON CONFLICT",
        "url": "https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT"
      }
    ],
    "cardIds": [
      "c51",
      "c2"
    ]
  },
  {
    "id": "q41",
    "title": "Задача 41: встречные переводы",
    "ru": "Два перевода идут одновременно: A→B и B→A. Что произойдёт при go run? И что изменится, если запустить с -race?",
    "en": "Two transfers run at once: A→B and B→A. What happens with go run? What changes when you run it with -race?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tID      int\n\tmu      sync.Mutex\n\tbalance int\n}\n\nfunc transfer(from, to *Account, amount int, locked *sync.WaitGroup) {\n\tfrom.mu.Lock()\n\tdefer from.mu.Unlock()\n\tlocked.Done()\n\tlocked.Wait() // both transfers hold their first lock: the bad interleaving, made certain\n\tto.mu.Lock()\n\tdefer to.mu.Unlock()\n\tfrom.balance -= amount\n\tto.balance += amount\n}\n\nfunc main() {\n\ta := &Account{ID: 1, balance: 100}\n\tb := &Account{ID: 2, balance: 100}\n\tvar locked, wg sync.WaitGroup\n\tlocked.Add(2)\n\twg.Add(2)\n\tgo func() { defer wg.Done(); transfer(a, b, 10, &locked) }()\n\tgo func() { defer wg.Done(); transfer(b, a, 20, &locked) }()\n\twg.Wait()\n\tfmt.Println(a.balance, b.balance)\n}",
    "options": [
      "Напечатает 110 90: мьютексы просто сериализуют переводы.",
      "Напечатает 90 110.",
      "go run: fatal error: all goroutines are asleep - deadlock!; с -race в наших запусках программа зависала без сообщения.",
      "Паника: unlock of unlocked mutex.",
      "Go сам прерывает одну горутину, как PostgreSQL прерывает транзакцию с 40P01.",
      "-race сообщает DATA RACE на balance."
    ],
    "correct": 2,
    "explanationRU": "Каждый перевод сначала берёт мьютекс своего счёта-источника: первый держит A и ждёт B, второй держит B и ждёт A — цикл. WaitGroup locked только делает это чередование гарантированным. Рантайм Go распознаёт дедлок, лишь когда спят все горутины; здесь main ждёт в wg.Wait(), поэтому go run падает с «all goroutines are asleep». В наших запусках с -race (Go 1.24.7 и 1.27.3) программа не падала, а зависала, а в сервере с живыми горутинами завис бы только этот запрос. PostgreSQL в той же ситуации через deadlock_timeout прерывает одну транзакцию с 40P01. Исправление — брать блокировки в постоянном порядке, по возрастанию ID; тогда программа печатает 110 90.",
    "speechEN": "It deadlocks. Each transfer locks its source account first, so one holds A and waits for B while the other holds B and waits for A. Go reports this only because every goroutine is asleep; under the race detector the program just hung in our runs, and in a server it would hang silently. PostgreSQL would abort one transaction with 40P01. The fix is to lock accounts in a stable order, by ascending ID, whatever the direction of the transfer.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tID      int\n\tmu      sync.Mutex\n\tbalance int\n}\n\nfunc transfer(from, to *Account, amount int) {\n\t// Lock in ascending ID order, whatever the direction of the transfer.\n\tfirst, second := from, to\n\tif to.ID < from.ID {\n\t\tfirst, second = to, from\n\t}\n\tfirst.mu.Lock()\n\tdefer first.mu.Unlock()\n\tsecond.mu.Lock()\n\tdefer second.mu.Unlock()\n\tfrom.balance -= amount\n\tto.balance += amount\n}\n\nfunc main() {\n\ta := &Account{ID: 1, balance: 100}\n\tb := &Account{ID: 2, balance: 100}\n\tvar wg sync.WaitGroup\n\twg.Add(2)\n\tgo func() { defer wg.Done(); transfer(a, b, 10) }()\n\tgo func() { defer wg.Done(); transfer(b, a, 20) }()\n\twg.Wait()\n\tfmt.Println(a.balance, b.balance)\n}",
    "versionNote": "Go 1.24.7 и 1.27.3: без -race — fatal error: all goroutines are asleep - deadlock!, с -race — зависание до таймаута (проверено с timeout 10 с); исправленная программа печатает 110 90.",
    "sources": [
      {
        "title": "PostgreSQL: Explicit Locking — Deadlocks",
        "url": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
      },
      {
        "title": "sync: Mutex",
        "url": "https://pkg.go.dev/sync#Mutex"
      }
    ],
    "cardIds": [
      "c50",
      "c21",
      "c55"
    ]
  },
  {
    "id": "q42",
    "title": "Задача 42: публикация после commit",
    "ru": "Обработчик фиксирует перевод, потом публикует событие; первая отправка в Kafka упала по таймауту, клиент повторяет запрос. Что напечатает программа?",
    "en": "The handler commits the transfer, then publishes the event; the first send to Kafka times out, and the client retries. What does the program print?",
    "code": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\ntype DB struct{ balance, transfers int }\n\n// CommitTransfer is the committed database transaction.\nfunc (db *DB) CommitTransfer(amount int) {\n\tdb.balance -= amount\n\tdb.transfers++\n}\n\ntype Broker struct {\n\tevents []string\n\tfail   int // how many sends time out\n}\n\nfunc (b *Broker) Publish(event string) error {\n\tif b.fail > 0 {\n\t\tb.fail--\n\t\treturn errors.New(\"kafka: timeout\")\n\t}\n\tb.events = append(b.events, event)\n\treturn nil\n}\n\n// handle commits the transfer, then publishes the event: two separate writes.\nfunc handle(db *DB, b *Broker, amount int) error {\n\tdb.CommitTransfer(amount)\n\tif err := b.Publish(fmt.Sprintf(\"TransferCompleted %d\", amount)); err != nil {\n\t\treturn fmt.Errorf(\"publish: %w\", err) // → 500, and the client retries\n\t}\n\treturn nil\n}\n\nfunc main() {\n\tdb := &DB{balance: 100}\n\tb := &Broker{fail: 1}\n\tfor range 3 { // the client retries until it gets a success\n\t\tif handle(db, b, 20) == nil {\n\t\t\tbreak\n\t\t}\n\t}\n\tfmt.Println(\"balance:\", db.balance, \"transfers:\", db.transfers, \"events:\", len(b.events))\n}",
    "options": [
      "balance: 80 transfers: 1 events: 1",
      "balance: 60 transfers: 2 events: 1",
      "balance: 60 transfers: 2 events: 2",
      "balance: 80 transfers: 1 events: 0",
      "balance: 40 transfers: 3 events: 1",
      "balance: 100 transfers: 0 events: 0 — ошибка откатывает перевод."
    ],
    "correct": 1,
    "explanationRU": "Commit и отправка — две независимые записи (dual write). Первая попытка зафиксировала перевод, отправка упала, клиент получил ошибку и повторил — второй перевод зафиксирован и опубликован. Итог: деньги списаны дважды, а событий одно. Если бы процесс упал сразу после commit, событие потерялось бы совсем. Исправление — outbox: событие пишется в той же транзакции, что и перевод, запрос отвечает успехом после commit, а relay публикует событие с повторами (at-least-once). Повтор клиента дополнительно закрывает ключ идемпотентности (c51). Исправленная программа печатает balance: 80 transfers: 1 events: 1.",
    "speechEN": "Balance 60, two transfers, one event. Committing and publishing are two separate writes: the first attempt committed the money and failed to send, so the client retried and the money moved again. If the process had crashed after the commit, the event would be lost instead. Write the event to an outbox table in the same transaction, answer after the commit, and let a relay publish it with retries.",
    "correctedCode": "package main\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\ntype DB struct {\n\tbalance, transfers int\n\toutbox             []string // unsent events\n}\n\n// CommitTransfer is one database transaction: the money and the event together.\nfunc (db *DB) CommitTransfer(amount int) {\n\tdb.balance -= amount\n\tdb.transfers++\n\tdb.outbox = append(db.outbox, fmt.Sprintf(\"TransferCompleted %d\", amount))\n}\n\ntype Broker struct {\n\tevents []string\n\tfail   int // how many sends time out\n}\n\nfunc (b *Broker) Publish(event string) error {\n\tif b.fail > 0 {\n\t\tb.fail--\n\t\treturn errors.New(\"kafka: timeout\")\n\t}\n\tb.events = append(b.events, event)\n\treturn nil\n}\n\n// handle answers as soon as the transaction commits; Kafka is not on the request path.\nfunc handle(db *DB, amount int) error {\n\tdb.CommitTransfer(amount)\n\treturn nil\n}\n\n// relay publishes unsent events and retries until the broker accepts them.\nfunc relay(db *DB, b *Broker) {\n\tfor len(db.outbox) > 0 {\n\t\tif b.Publish(db.outbox[0]) != nil {\n\t\t\tcontinue // a real relay waits before the next attempt\n\t\t}\n\t\tdb.outbox = db.outbox[1:]\n\t}\n}\n\nfunc main() {\n\tdb := &DB{balance: 100}\n\tb := &Broker{fail: 1}\n\tfor range 3 {\n\t\tif handle(db, 20) == nil {\n\t\t\tbreak\n\t\t}\n\t}\n\trelay(db, b)\n\tfmt.Println(\"balance:\", db.balance, \"transfers:\", db.transfers, \"events:\", len(b.events))\n}",
    "versionNote": "Программа и исправленный вариант выполнены на Go 1.24.7 и 1.27.3.",
    "sources": [
      {
        "title": "microservices.io: Transactional outbox",
        "url": "https://microservices.io/patterns/data/transactional-outbox.html"
      },
      {
        "title": "Apache Kafka: Message Delivery Semantics",
        "url": "https://kafka.apache.org/documentation/#semantics"
      }
    ],
    "cardIds": [
      "c52",
      "c51"
    ]
  },
  {
    "id": "q43",
    "title": "Задача 43: offset зафиксирован до обработки",
    "ru": "Потребитель фиксирует offset при чтении, а под убивают посреди обработки pay-3. После перезапуска он продолжает с зафиксированного offset. Что напечатает программа?",
    "en": "The consumer commits the offset when it reads a message, and the pod is killed while processing pay-3. After the restart it continues from the committed offset. What does the program print?",
    "code": "package main\n\nimport \"fmt\"\n\n// One partition and the offset our consumer group has committed.\nvar partition = []string{\"pay-1\", \"pay-2\", \"pay-3\", \"pay-4\", \"pay-5\"}\nvar committed int\n\nvar crashed bool\n\n// process stores the payment; the pod is killed in the middle of pay-3, once.\nfunc process(msg string, done *[]string) bool {\n\tif msg == \"pay-3\" && !crashed {\n\t\tcrashed = true\n\t\treturn false // the effect was not stored\n\t}\n\t*done = append(*done, msg)\n\treturn true\n}\n\n// consume starts from the committed offset, like a restarted consumer.\nfunc consume(done *[]string) {\n\tfor off := committed; off < len(partition); off++ {\n\t\tcommitted = off + 1 // committed on read, like kafka-go's ReadMessage in a group\n\t\tif !process(partition[off], done) {\n\t\t\treturn // the process dies here\n\t\t}\n\t}\n}\n\nfunc main() {\n\tvar done []string\n\tconsume(&done) // the first run crashes on pay-3\n\tconsume(&done) // after the restart\n\tfmt.Println(done)\n}",
    "options": [
      "[pay-1 pay-2 pay-3 pay-4 pay-5]",
      "[pay-1 pay-2 pay-4 pay-5]",
      "[pay-1 pay-2 pay-3 pay-3 pay-4 pay-5]",
      "[pay-1 pay-2]",
      "[pay-1 pay-2 pay-1 pay-2 pay-3 pay-4 pay-5]",
      "Паника: индекс вне диапазона."
    ],
    "correct": 1,
    "explanationRU": "Offset pay-3 зафиксирован до того, как платёж сохранён, поэтому после перезапуска потребитель начинает с pay-4: pay-3 потерян, это at-most-once. Так ведёт себя ReadMessage в kafka-go при группе потребителей и автокоммит, который фиксирует полученное, но не обработанное. Исправление — фиксировать offset после того, как результат сохранён (FetchMessage → обработка → CommitMessages): тогда это at-least-once, программа печатает все пять платежей, а падение между записью и commit даст дубликат, который отсеивают по ID события в той же транзакции (c53).",
    "speechEN": "pay-3 is lost: the offset was committed when the message was read, before the payment was stored, so the restarted consumer starts at pay-4. That is at-most-once. kafka-go's ReadMessage behaves like this in a consumer group. Commit after the effect is stored, with FetchMessage and CommitMessages: that gives at-least-once, and duplicates are handled by storing the event ID with the effect.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\n// One partition and the offset our consumer group has committed.\nvar partition = []string{\"pay-1\", \"pay-2\", \"pay-3\", \"pay-4\", \"pay-5\"}\nvar committed int\n\nvar crashed bool\n\n// process stores the payment; the pod is killed in the middle of pay-3, once.\nfunc process(msg string, done *[]string) bool {\n\tif msg == \"pay-3\" && !crashed {\n\t\tcrashed = true\n\t\treturn false // the effect was not stored\n\t}\n\t*done = append(*done, msg)\n\treturn true\n}\n\n// consume commits only after the effect is stored (kafka-go: FetchMessage, then CommitMessages).\nfunc consume(done *[]string) {\n\tfor off := committed; off < len(partition); off++ {\n\t\tif !process(partition[off], done) {\n\t\t\treturn // the process dies here; the offset still points at pay-3\n\t\t}\n\t\tcommitted = off + 1\n\t}\n}\n\nfunc main() {\n\tvar done []string\n\tconsume(&done)\n\tconsume(&done)\n\tfmt.Println(done)\n}",
    "versionNote": "Программа и исправленный вариант выполнены на Go 1.24.7 и 1.27.3. Поведение ReadMessage — README и reader.go segmentio/kafka-go.",
    "sources": [
      {
        "title": "Apache Kafka: Message Delivery Semantics",
        "url": "https://kafka.apache.org/documentation/#semantics"
      },
      {
        "title": "segmentio/kafka-go: Explicit Commits",
        "url": "https://github.com/segmentio/kafka-go#explicit-commits"
      }
    ],
    "cardIds": [
      "c53"
    ]
  },
  {
    "id": "q44",
    "title": "Задача 44: TryLock и вежливый отступ",
    "ru": "Перевод больше не ждёт вторую блокировку: если TryLock не удался, он отпускает первую, ждёт 1 мс и пробует снова. Сто пар встречных переводов идут одновременно. Какое условие deadlock это ломает и что всё ещё может пойти не так?",
    "en": "The transfer no longer waits for its second lock: if TryLock fails, it releases the first one, sleeps 1 ms and tries again. A hundred pairs of opposite transfers run at once. Which deadlock condition does this break, and what can still go wrong?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n\t\"time\"\n)\n\ntype Account struct {\n\tID      int\n\tmu      sync.Mutex\n\tBalance int\n}\n\n// transfer never waits while holding a lock: if the second lock is\n// busy, it releases the first one, backs off and tries again.\nfunc transfer(from, to *Account, amount int) (retries int) {\n\tfor {\n\t\tfrom.mu.Lock()\n\t\tif to.mu.TryLock() {\n\t\t\tfrom.Balance -= amount\n\t\t\tto.Balance += amount\n\t\t\tto.mu.Unlock()\n\t\t\tfrom.mu.Unlock()\n\t\t\treturn retries\n\t\t}\n\t\tfrom.mu.Unlock()\n\t\tretries++\n\t\ttime.Sleep(time.Millisecond) // the same back-off for everyone\n\t}\n}\n\nfunc main() {\n\ta := &Account{ID: 1, Balance: 100}\n\tb := &Account{ID: 2, Balance: 100}\n\tvar wg sync.WaitGroup\n\tfor range 100 {\n\t\twg.Add(2)\n\t\tgo func() { defer wg.Done(); transfer(a, b, 1) }()\n\t\tgo func() { defer wg.Done(); transfer(b, a, 1) }()\n\t}\n\twg.Wait()\n\tfmt.Println(a.Balance, b.Balance)\n}",
    "options": [
      "Deadlock остаётся: обе горутины навсегда засыпают в Lock.",
      "Deadlock невозможен: ломается удержание с ожиданием. Но горутины могут отступать и повторять в такт — livelock; обычно их разводит случайность тайминга, а гарантирует прогресс единый порядок блокировок.",
      "Deadlock невозможен: ломается взаимное исключение, потому что TryLock не блокирует.",
      "Data race на Balance: -race сообщит о гонке.",
      "Через 1 мс мьютекс переходит в режим голодания и сам разводит горутины, поэтому проблем нет."
    ],
    "correct": 1,
    "explanationRU": "Горутина больше не ждёт, держа блокировку: при отказе TryLock она отпускает первую, поэтому удержание с ожиданием сломано и deadlock невозможен. Но две горутины могут снова и снова брать каждая свою первую блокировку, получать отказ на второй и отступать на одно и то же время — это livelock: обе заняты, прогресса нет. На практике их обычно разводит случайность тайминга, и программа печатает 100 100, но гарантии нет. Надёжное исправление — единый порядок блокировок (по возрастанию ID): он ломает циклическое ожидание, и повторять не нужно. Режим голодания мьютекса здесь не поможет: он упорядочивает только тех, кто ждёт в Lock, а отказывает здесь TryLock, который в очередь не встаёт (в режиме голодания он всегда возвращает false).",
    "speechEN": "No deadlock: the goroutine never waits while holding a lock, so hold and wait is broken. But both goroutines can keep taking their first lock, failing on the second and backing off for the same time, in step: that's a livelock. Timing luck usually breaks the tie, but nothing guarantees it. One lock order, by ascending ID, removes the cycle, so nobody needs to retry.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\ntype Account struct {\n\tID      int\n\tmu      sync.Mutex\n\tBalance int\n}\n\n// transfer locks both accounts in ascending ID order, so two\n// opposite transfers can never wait for each other in a cycle.\nfunc transfer(from, to *Account, amount int) {\n\tif from == to {\n\t\treturn // sync.Mutex is not reentrant\n\t}\n\tfirst, second := from, to\n\tif to.ID < from.ID {\n\t\tfirst, second = to, from\n\t}\n\tfirst.mu.Lock()\n\tdefer first.mu.Unlock()\n\tsecond.mu.Lock()\n\tdefer second.mu.Unlock()\n\tfrom.Balance -= amount\n\tto.Balance += amount\n}\n\nfunc main() {\n\ta := &Account{ID: 1, Balance: 100}\n\tb := &Account{ID: 2, Balance: 100}\n\tvar wg sync.WaitGroup\n\tfor range 100 {\n\t\twg.Add(2)\n\t\tgo func() { defer wg.Done(); transfer(a, b, 1) }()\n\t\tgo func() { defer wg.Done(); transfer(b, a, 1) }()\n\t}\n\twg.Wait()\n\tfmt.Println(a.Balance, b.Balance)\n}",
    "versionNote": "Программа и исправленный вариант выполнены на Go 1.24.7 и 1.27.3 (в том числе с -race): обе печатают 100 100. TryLock — с Go 1.18; for range по числу — с Go 1.22.",
    "sources": [
      {
        "title": "sync.Mutex.TryLock — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#Mutex.TryLock"
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 1: livelock",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
      }
    ],
    "cardIds": [
      "c55",
      "c21"
    ]
  },
  {
    "id": "q45",
    "title": "Задача 45: большой буфер и закон Литтла",
    "ru": "Модель с шагом 50 мс: производитель предлагает 120 задач в секунду, потребитель успевает 100. Буфер канала — 100 или 10 000. Что напечатает программа?",
    "en": "A model in 50 ms ticks: the producer offers 120 jobs a second, the consumer finishes 100. The channel buffer holds 100 or 10,000. What does the program print?",
    "code": "package main\n\nimport \"fmt\"\n\n// A model in 50 ms ticks: the producer offers 6 jobs a tick (120/s),\n// the consumer finishes 5 (100/s). A full buffer blocks the producer.\nfunc run(capacity int) (perSec, queued int) {\n\tqueue := 0\n\tfor tick := 1; tick <= 20_000; tick++ { // 1000 seconds\n\t\tqueue += min(6, capacity-queue) // the producer fills free slots\n\t\tdone := min(queue, 5)           // the consumer takes up to 5\n\t\tqueue -= done\n\t\tif tick > 20_000-20 { // count the last second\n\t\t\tperSec += done\n\t\t}\n\t}\n\treturn perSec, queue\n}\n\nfunc main() {\n\tfor _, capacity := range []int{100, 10_000} {\n\t\tperSec, queued := run(capacity)\n\t\twait := float64(queued) / float64(perSec) // Little's law: W = L / λ\n\t\tfmt.Printf(\"cap %d: %d jobs/s, %d queued, wait %.2f s\\n\", capacity, perSec, queued, wait)\n\t}\n}",
    "options": [
      "cap 100: 100 jobs/s, 95 queued, wait 0.95 s | cap 10000: 120 jobs/s, 0 queued, wait 0.00 s",
      "cap 100: 100 jobs/s, 95 queued, wait 0.95 s | cap 10000: 100 jobs/s, 9995 queued, wait 99.95 s",
      "cap 100: 120 jobs/s, 0 queued, wait 0.00 s | cap 10000: 120 jobs/s, 0 queued, wait 0.00 s",
      "cap 100: 100 jobs/s, 95 queued, wait 0.95 s | cap 10000: 110 jobs/s, 5000 queued, wait 45.45 s"
    ],
    "correct": 1,
    "explanationRU": "Большой буфер не поднимает устойчивую пропускную способность: в обоих случаях 100 задач в секунду — столько успевает самая медленная стадия. Буфер лишь копит очередь: за первые ~500 с он заполняется, и производитель снова блокируется. По закону Литтла L = λW время ожидания W = L / λ: 95 / 100 ≈ 0,95 с против 9995 / 100 ≈ 100 с. То есть большой буфер добавил каждой задаче почти 100 секунд задержки и ничего не дал пропускной способности. Помогает только ускорение медленной стадии: в исправленном варианте два потребителя, и обе ёмкости дают 120 задач в секунду без очереди. Буфер полезен для всплесков, пакетной обработки и на входе конвейера, а не против постоянно медленного потребителя.",
    "speechEN": "Both capacities give 100 jobs a second, the speed of the slowest stage. The bigger buffer only holds a longer queue: by Little's law, wait equals queue length over throughput, so about one second versus about a hundred. A buffer decouples stages and absorbs bursts; it doesn't raise throughput. To go faster, speed up the slowest stage, for example with a second consumer.",
    "correctedCode": "package main\n\nimport \"fmt\"\n\n// A model in 50 ms ticks: the producer offers 6 jobs a tick (120/s),\n// two consumers finish 5 each (200/s). A full buffer blocks the producer.\nfunc run(capacity int) (perSec, queued int) {\n\tqueue := 0\n\tfor tick := 1; tick <= 20_000; tick++ { // 1000 seconds\n\t\tqueue += min(6, capacity-queue) // the producer fills free slots\n\t\tdone := min(queue, 10)          // two consumers take up to 10\n\t\tqueue -= done\n\t\tif tick > 20_000-20 { // count the last second\n\t\t\tperSec += done\n\t\t}\n\t}\n\treturn perSec, queue\n}\n\nfunc main() {\n\tfor _, capacity := range []int{100, 10_000} {\n\t\tperSec, queued := run(capacity)\n\t\twait := float64(queued) / float64(perSec) // Little's law: W = L / λ\n\t\tfmt.Printf(\"cap %d: %d jobs/s, %d queued, wait %.2f s\\n\", capacity, perSec, queued, wait)\n\t}\n}",
    "versionNote": "Это модель очереди с дискретным шагом, а не замер каналов; выполнена на Go 1.24.7 и 1.27.3. Встроенная min — с Go 1.21, разделители _ в числах — с Go 1.13.",
    "sources": [
      {
        "title": "Little's law — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Little%27s_law"
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 4: Queuing",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
      }
    ],
    "cardIds": [
      "c13"
    ]
  },
  {
    "id": "q46",
    "title": "Задача 46: Signal вместо Broadcast",
    "ru": "Три воркера ждут флага ready на sync.Cond. Главная горутина ставит ready = true и вызывает Signal. Что напечатает программа?",
    "en": "Three workers wait on a sync.Cond for the ready flag. The main goroutine sets ready = true and calls Signal. What does the program print?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar mu sync.Mutex\n\tcond := sync.NewCond(&mu)\n\tready := false\n\n\tvar parked, done sync.WaitGroup\n\tfor range 3 {\n\t\tparked.Add(1)\n\t\tdone.Add(1)\n\t\tgo func() {\n\t\t\tdefer done.Done()\n\t\t\tmu.Lock()\n\t\t\tparked.Done()\n\t\t\tfor !ready {\n\t\t\t\tcond.Wait()\n\t\t\t}\n\t\t\tmu.Unlock()\n\t\t\tfmt.Println(\"worker started\")\n\t\t}()\n\t}\n\tparked.Wait()\n\tmu.Lock() // succeeds only when all three workers sit in Wait\n\tready = true\n\tmu.Unlock()\n\tcond.Signal()\n\tdone.Wait()\n}",
    "options": [
      "Три строки worker started, затем программа завершается.",
      "Одна строка worker started, затем fatal error: all goroutines are asleep - deadlock!",
      "Ничего: Signal до Wait теряется, сразу deadlock.",
      "Одна строка worker started, затем программа завершается: остальные воркеры увидят ready при следующей проверке.",
      "Data race на ready: -race сообщит о гонке."
    ],
    "correct": 1,
    "explanationRU": "parked.Wait и mu.Lock гарантируют, что все три воркера уже сидят в Wait: блокировку main получает, только когда Wait её отпустил. Signal будит одного ждущего; он снова берёт mu, видит ready и печатает worker started. Двое других так и спят: сами они ready не проверят — их должен разбудить Signal или Broadcast. main ждёт в done.Wait, все горутины заблокированы, и рантайм завершает процесс с fatal error: all goroutines are asleep - deadlock! (код выхода 2). Изменение важно всем ждущим, поэтому нужен Broadcast; гонки данных нет — ready меняется и читается под mu.",
    "speechEN": "Signal wakes only one of the three waiting workers. It prints worker started; the other two keep sleeping, because nothing wakes them to check ready again. Main blocks in Wait on the WaitGroup, every goroutine is blocked, and the runtime stops with: all goroutines are asleep, deadlock. A change that matters to every waiter needs Broadcast.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\nfunc main() {\n\tvar mu sync.Mutex\n\tcond := sync.NewCond(&mu)\n\tready := false\n\n\tvar parked, done sync.WaitGroup\n\tfor range 3 {\n\t\tparked.Add(1)\n\t\tdone.Add(1)\n\t\tgo func() {\n\t\t\tdefer done.Done()\n\t\t\tmu.Lock()\n\t\t\tparked.Done()\n\t\t\tfor !ready {\n\t\t\t\tcond.Wait()\n\t\t\t}\n\t\t\tmu.Unlock()\n\t\t\tfmt.Println(\"worker started\")\n\t\t}()\n\t}\n\tparked.Wait()\n\tmu.Lock() // succeeds only when all three workers sit in Wait\n\tready = true\n\tmu.Unlock()\n\tcond.Broadcast()\n\tdone.Wait()\n}",
    "versionNote": "Выполнено на Go 1.24.7 и 1.27.3: исходная программа печатает одну строку и падает с кодом 2, исправленная — три строки. Под -race проверка deadlock в рантайме не срабатывает: исходная программа печатает одну строку и просто висит. for range по числу — с Go 1.22.",
    "sources": [
      {
        "title": "sync.Cond.Signal и Broadcast — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#Cond.Broadcast"
      },
      {
        "title": "sync/cond.go — Go 1.27.3",
        "url": "https://github.com/golang/go/blob/go1.27.3/src/sync/cond.go"
      }
    ],
    "cardIds": [
      "c56"
    ]
  },
  {
    "id": "q47",
    "title": "Задача 47: if вместо for вокруг Wait",
    "ru": "Два потребителя ждут в Get, в очередь кладут один элемент и вызывают Broadcast. Что произойдёт?",
    "en": "Two consumers wait in Get; one item is added to the queue and Broadcast is called. What happens?",
    "code": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n\t\"sync\"\n)\n\ntype Queue struct {\n\tmu      sync.Mutex\n\tcond    *sync.Cond\n\titems   []int\n\twaiting int\n}\n\nfunc (q *Queue) Get() int {\n\tq.mu.Lock()\n\tdefer q.mu.Unlock()\n\tif len(q.items) == 0 {\n\t\tq.waiting++\n\t\tq.cond.Wait()\n\t\tq.waiting--\n\t}\n\tv := q.items[0]\n\tq.items = q.items[1:]\n\treturn v\n}\n\nfunc main() {\n\tq := &Queue{}\n\tq.cond = sync.NewCond(&q.mu)\n\tvar wg sync.WaitGroup\n\tfor range 2 {\n\t\twg.Add(1)\n\t\tgo func() { defer wg.Done(); fmt.Println(\"got\", q.Get()) }()\n\t}\n\tfor { // wait until both consumers sit in Wait\n\t\tq.mu.Lock()\n\t\tif q.waiting == 2 {\n\t\t\tbreak\n\t\t}\n\t\tq.mu.Unlock()\n\t\truntime.Gosched()\n\t}\n\tq.items = append(q.items, 1) // one item...\n\tq.mu.Unlock()\n\tq.cond.Broadcast() // ...but both consumers wake up\n\twg.Wait()\n}",
    "options": [
      "Оба потребителя напечатают got 1.",
      "Один напечатает got 1, второй снова уснёт в Wait, и программа зависнет.",
      "Второй потребитель паникует: index out of range [0] with length 0 (строка got 1 от первого может успеть напечататься).",
      "Один напечатает got 1, второй — got 0.",
      "fatal error: all goroutines are asleep - deadlock! ещё до Broadcast."
    ],
    "correct": 2,
    "explanationRU": "Broadcast будит обоих. Первый, кто снова взял блокировку, забирает единственный элемент. Второй выходит из Wait, но из-за if условие не перепроверяет и читает q.items[0] из пустого среза — паника index out of range [0] with length 0. Успеет ли напечататься got 1 от первого, зависит от расписания. Wait всегда вызывают в цикле for: пока разбуженная горутина ждёт блокировку, состояние может измениться. В исправленном варианте цикл, флаг closed и Close с Broadcast: один потребитель получает элемент, второй видит закрытие и выходит без паники и без утечки.",
    "speechEN": "Broadcast wakes both consumers. The first one to relock takes the only item. The second returns from Wait, but because of the if it doesn't recheck, reads items at index zero of an empty slice and panics. Always call Wait in a for loop: the state can change before the woken goroutine gets the lock. For shutdown, set a closed flag and Broadcast, so every waiter wakes and exits.",
    "correctedCode": "package main\n\nimport (\n\t\"fmt\"\n\t\"runtime\"\n\t\"sync\"\n)\n\ntype Queue struct {\n\tmu      sync.Mutex\n\tcond    *sync.Cond\n\titems   []int\n\twaiting int\n\tclosed  bool\n}\n\n// Get returns false once the queue is closed and empty.\nfunc (q *Queue) Get() (int, bool) {\n\tq.mu.Lock()\n\tdefer q.mu.Unlock()\n\tfor len(q.items) == 0 && !q.closed { // check again after every wake-up\n\t\tq.waiting++\n\t\tq.cond.Wait()\n\t\tq.waiting--\n\t}\n\tif len(q.items) == 0 {\n\t\treturn 0, false\n\t}\n\tv := q.items[0]\n\tq.items = q.items[1:]\n\treturn v, true\n}\n\nfunc (q *Queue) Close() {\n\tq.mu.Lock()\n\tq.closed = true\n\tq.mu.Unlock()\n\tq.cond.Broadcast() // every waiter must see the new state\n}\n\nfunc main() {\n\tq := &Queue{}\n\tq.cond = sync.NewCond(&q.mu)\n\tvar wg sync.WaitGroup\n\tresults := make(chan bool, 2)\n\tfor range 2 {\n\t\twg.Add(1)\n\t\tgo func() { defer wg.Done(); _, ok := q.Get(); results <- ok }()\n\t}\n\tfor {\n\t\tq.mu.Lock()\n\t\tif q.waiting == 2 {\n\t\t\tbreak\n\t\t}\n\t\tq.mu.Unlock()\n\t\truntime.Gosched()\n\t}\n\tq.items = append(q.items, 1)\n\tq.mu.Unlock()\n\tq.cond.Broadcast()\n\tq.Close()\n\twg.Wait()\n\tclose(results)\n\tgot := 0\n\tfor ok := range results {\n\t\tif ok {\n\t\t\tgot++\n\t\t}\n\t}\n\tfmt.Println(\"items received:\", got, \"consumers that saw close:\", 2-got)\n}",
    "versionNote": "Выполнено на Go 1.24.7 и 1.27.3: исходная программа паникует с кодом 2 (строка got 1 печатается не всегда), исправленная печатает items received: 1 consumers that saw close: 1.",
    "sources": [
      {
        "title": "sync.Cond.Wait — Go 1.27.3",
        "url": "https://pkg.go.dev/sync@go1.27.3#Cond.Wait"
      },
      {
        "title": "Concurrency in Go (K. Cox-Buday, O'Reilly, 2017), гл. 3: Cond",
        "url": "https://www.oreilly.com/library/view/-/9781491941294/"
      }
    ],
    "cardIds": [
      "c56"
    ]
  }
];
