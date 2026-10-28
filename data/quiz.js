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
      "c15"
    ]
  },

  // =========================================================================
  // ЧАСТЬ 2: БОЕВОЙ CODE REVIEW — КОНТЕКСТЫ, ГОНКИ И КЭШИ (Q9 - Q14)
  // =========================================================================
  {
    id: "q9",
    cardIds: ["c12", "c13", "c10"],
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
    "versionNote": "WithoutCancel добавлен в Go 1.21, доступен в 1.25/1.26. Исправленный синхронный пример не требует этого API и применим к 1.17. В тесте используется настоящий httptest.Server, не прямой вызов handler.",
    "sources": [
      {
        "title": "Request.Context — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/net/http/request.go"
      },
      {
        "title": "Context — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/context/context.go"
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
    "versionNote": "errgroup — внешний модуль golang.org/x/sync, здесь проверена v0.20.0, а не «версия из Go 1.26». Примеры исполнялись на Go 1.26.1; для старого Go выбирают совместимую версию модуля.",
    "sources": [
      {
        "title": "errgroup — v0.20.0",
        "url": "https://github.com/golang/sync/blob/v0.20.0/errgroup/errgroup.go"
      },
      {
        "title": "Context — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/src/context/context.go"
      },
      {
        "title": "Short variable declarations — go1.26.1",
        "url": "https://github.com/golang/go/blob/go1.26.1/doc/go_spec.html"
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
    cardIds: ["c35"],
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
