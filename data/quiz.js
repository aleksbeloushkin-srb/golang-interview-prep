const QUIZ_QUESTIONS = [
  // =========================================================================
  // ЧАСТЬ 1: ЛОВУШКИ ЯЗЫКА И РАНТАЙМА (Q1 - Q8)
  // =========================================================================
  {
    id: "q1",
    title: "Задача 1: Замыкание в цикле и горутины (Loop Variable Capture)",
    ru: "Что выведет этот код и как изменилось поведение компилятора в Go 1.22+?",
    en: "What does this code print, and how did the compiler's Escape Analysis & variable binding change in Go 1.22+?",
    code: `for i := 0; i < 3; i++ {
    go func() {
        println(i)
    }()
}
time.Sleep(time.Millisecond)`,
    options: [
      "Во всех версиях Go выведет 0, 1, 2 в строгом порядке создания, так как новые горутины последовательно ставятся в FIFO-очередь P.runq[256]",
      "До Go 1.22 переменная i аллоцировалась один раз в хипе на весь цикл (обычно выводилось 3, 3, 3); начиная с Go 1.22+ создаётся отдельная копия i на каждую итерацию (выведет 0, 1, 2 в произвольном порядке)",
      "До Go 1.22 происходила паника concurrent read/write, а в Go 1.22+ компилятор автоматически оборачивает чтение захваченных переменных цикла в атомарный LoadAcq",
      "Во всех версиях Go выведет 2, 1, 0, поскольку слот P.runnext работает по принципу LIFO и запускает последнюю созданную горутину первой на горячем кеше L1",
      "Начиная с Go 1.22+ компилятор запрещает захват счётчика цикла по ссылке и передаёт i как скрытый аргумент в runtime.newproc прямо на стек g0 без побега в хип",
      "Выведет 3, 3, 3 даже в Go 1.25+, потому что правило новой области видимости работает только для циклов for-range по слайсам и мапам, но не для классического трёхкомпонентного цикла for"
    ],
    correct: 1,
    explanationRU: "До Go 1.22 переменная i имела область видимости всего цикла, сбегала в кучу в единственном экземпляре, и все 3 горутины читали её адрес после завершения цикла (получая 3, 3, 3). Начиная с Go 1.22+, семантика языка изменилась — и для range, и для классического for создаётся новая переменная на каждую итерацию (печатает 0, 1, 2 в порядке планировщика).",
    speechEN: "Before Go 1.22, the loop variable 'i' was allocated once per loop on the heap, so all closures shared the same pointer and typically printed '3, 3, 3' (with a data race). Since Go 1.22+, both 'for-range' and standard 3-clause 'for' loops bind a fresh variable per iteration, safely printing '0, 1, 2' in scheduler order."
  },
  {
    id: "q2",
    title: "Задача 2: Классическая ловушка интерфейса (Typed nil != nil)",
    ru: "Что выведет функция main() при проверке err == nil и как это устроено в памяти?",
    en: "What does main() print when checking err == nil? Explain the internal 16-byte runtime.iface layout.",
    code: `type MyError struct{}
func (*MyError) Error() string { return "boom" }

func returnsError() error {
    var p *MyError = nil
    return p // Возвращаем типизированный nil-указатель через интерфейс error
}

func main() {
    err := returnsError()
    if err == nil {
        println("err is nil")
    } else {
        println("err IS NOT nil!")
    }
}`,
    options: [
      "Выведет 'err is nil', так как компилятор Go на этапе Escape Analysis видит нулевой указатель data == nil и автоматически зануляет заголовок интерфейса runtime.iface",
      "Вызовет панику nil pointer dereference в момент возврата из returnsError(), так как рантайм пытается вычислить виртуальную таблицу методов itab.fun[0] у нулевого указателя",
      "Выведет 'err IS NOT nil!', так как 16-байтовая структура runtime.iface содержит два поля (tab, data): при возврате p поле tab заполняется дескриптором типа *MyError, а интерфейс равен nil только когда оба поля равны нулю",
      "Выведет 'err is nil', потому что интерфейс error является особым встроенным типом в рантайме, который при сравнении с nil проверяет только второй 8-байтовый указатель data",
      "Выведет 'err IS NOT nil!', потому что при упаковке указателя в интерфейс рантайм аллоцирует в куче пустую структуру MyError{} размером 0 байт по адресу runtime.zerobase",
      "Код не скомпилируется, так как метод Error() объявлен на поинтер-ресивере (*MyError), а нулевой указатель не имеет валидного набора методов в таблице itabTable"
    ],
    correct: 2,
    explanationRU: "Под капотом непустой интерфейс (runtime.iface) состоит из двух 8-байтовых слов: указателя на таблицу метаданных типа и методов (tab *itab) и указателя на сами данные (data unsafe.Pointer). Когда мы возвращаем var p *MyError = nil, в поле tab записывается адрес itab для типа *MyError, а в поле data — nil. Поскольку tab != nil, проверка err == nil возвращает false!",
    speechEN: "It prints 'err IS NOT nil!'. Under the hood, 'error' is a 16-byte 'runtime.iface' struct containing two pointers: 'tab' (*itab) and 'data'. Returning a typed nil pointer '*MyError' populates 'tab' with '*MyError' metadata while setting 'data' to nil. Because an interface equals nil ONLY when both words are zero, 'err == nil' is false."
  },
  {
    id: "q3",
    title: "Задача 3: Именованный return и модификация в defer",
    ru: "Какое число вернёт вызов функции f() и в каком порядке выполняются инструкции на стеке?",
    en: "What integer value does f() return? Explain the exact compilation sequence of named returns and open-coded defers.",
    code: `func f() (result int) {
    defer func() {
        result++
    }()
    return 0
}`,
    options: [
      "Вернёт 0, так как выражение return 0 сначала копирует константу 0 в регистр возврата RAX, и только после этого выполняет отложенную функцию над локальной переменной стека",
      "Вернёт 1: инструкция return 0 сначала записывает 0 в зарезервированный слот именованного возврата result на стеке, затем выполняется замыкание defer (захватившее result по адресу и инкрементирующее его до 1), и только после этого вызывается RET",
      "Вернёт 0, поскольку аргументы и возвращаемые значения при Open-Coded Defer фиксируются в момент регистрации строчки defer в начале функции",
      "Приведёт к ошибке компиляции: в Go запрещено изменять именованные возвращаемые параметры внутри анонимных функций defer без явного указания return внутри самого defer",
      "Вернёт 1, но только если отключены оптимизации компилятора (-gcflags='-N'), а при стандартной сборке инлайнер выбросит модификацию после return как мёртвый код",
      "Вызовет утечку памяти на стеке, так как захват возвращаемого слота result в замыкание заставляет компилятор перенести весь стековый кадр функции f() в кучу"
    ],
    correct: 1,
    explanationRU: "В Go команда return X не является одной машинной инструкцией. Компилятор разворачивает её в три последовательных шага: 1) записать значение 0 в переменную возврата result; 2) выполнить все активные функции defer (замыкание обращается к result по указателю и меняет его с 0 на 1); 3) выполнить пустой возврат RET, читая актуальное значение result (1).",
    speechEN: "It returns 1. In Go, 'return 0' is compiled into three distinct steps: first, it assigns 0 to the named return slot 'result'; second, it executes the inline open-coded defer closure (which captures 'result' by reference and increments it to 1); third, it executes the assembly RET instruction."
  },
  {
    id: "q4",
    title: "Задача 4: Скрытая утечка памяти через саб-слайс (Sub-slice Memory Retention)",
    ru: "Почему эта функция приводит к скрытой утечке 100 МБ в куче и как это правильно исправить?",
    en: "Why does this function cause a 100 MB memory retention leak in the heap, and what is the idiomatic fix?",
    code: `func readHeader() []byte {
    buf := make([]byte, 100*1024*1024) // 100 MB
    // ... читаем пакет из сокета в buf ...
    return buf[:16] // возвращаем только первые 16 байт заголовка
}`,
    options: [
      "Никакой утечки нет: на фазе Concurrent Sweep сборщик мусора Go видит, что длина среза len=16, и освобождает неиспользуемые страницы mspan после 16-го байта",
      "При возврате среза buf[:16] срабатывает runtime.copystack, который пытается скопировать все 100 МБ в стек вызывающей функции и вызывает панику превышения лимита 1 ГБ",
      "Утечка возникает только потому, что не использовано трёхэлементное выражение среза buf[:16:16]; если ограничить capacity до 16, сборщик мусора сразу освободит оставшиеся 99.9 МБ",
      "Возвращённый 24-байтовый заголовок среза {ptr, len: 16, cap: 100MB} продолжает указывать на единый 100-мегабайтный блок памяти в mheap; так как GC в Go маркирует аллокации целиком, все 100 МБ останутся в памяти (лечится через bytes.Clone(buf[:16]))",
      "Массив на 100 МБ попадает в категорию noscan mspan (так как []byte не содержит указателей), а объекты из noscan спанов вообще никогда не удаляются сборщиком мусора до завершения процесса",
      "При выходе из функции сработает Hybrid Write Barrier, который переведёт массив buf в Чёрный список корней навечно из-за смены размера возвращаемого среза"
    ],
    correct: 3,
    explanationRU: "Обрати внимание на частый миф в варианте №3: даже если написать buf[:16:16] (ограничив capacity до 16), это защитит только от перезаписи при последующем append, но НЕ освободит 100 МБ! Аллокатор Go выделяет и освобождает неделимые блоки памяти (mspan). Пока хотя бы один указатель ссылается на начало этого блока, весь 100-мегабайтный объект считается достижимым. Единственное лечение — скопировать 16 байт в новый срез через bytes.Clone(buf[:16]) или make+copy.",
    speechEN: "The returned 24-byte slice header still points to the base address of the 100 MB heap allocation. Because Go's allocator tracks whole memory spans rather than byte ranges (even if you cap it with 'buf[:16:16]'), the GC must keep the entire 100 MB block alive. The fix is to copy the 16 bytes into a fresh allocation via 'bytes.Clone(buf[:16])'."
  },
  {
    id: "q5",
    title: "Задача 5: Паника в дочерней горутине и область действия recover()",
    ru: "Что произойдёт при запуске этой программы и сработает ли recover() в main?",
    en: "Will the deferred recover() in main catch the panic from the child goroutine? Explain how gopanic unwinds stacks.",
    code: `func main() {
    defer func() {
        if r := recover(); r != nil {
            println("recovered:", r)
        }
    }()

    ch := make(chan int)
    close(ch)

    go func() {
        ch <- 42 // Запись в закрытый канал
    }()
    time.Sleep(time.Second)
}`,
    options: [
      "Выведет 'recovered: send on closed channel', так как дочерняя горутина наследует цепочку отложенных вызовов родительской горутины через указатель gp.parentDefer",
      "Процесс аварийно упадёт целиком: у каждой горутины свой изолированный стек и свой список g._defer; когда ch <- 42 вызывает gopanic, рантайм раскручивает стек только дочерней горутины, не находит в ней recover() и вызывает fatalpanic()",
      "Никакой паники не будет: так как в канале ch нет ожидающих читателей в очереди recvq, запись в закрытый небуферизованный канал просто блокирует дочернюю горутину в gopark",
      "Паника из фоновой горутины автоматически перехватывается системной горутиной g0 на текущем потоке M, которая тихо завершает дочернюю горутину и возвращает её в пул P.gFree",
      "Сработает recover() в main, но только если запущен ровно один логический процессор GOMAXPROCS=1, когда обе горутины делят один системный поток M",
      "Запись в закрытый канал вызывает фатальную ошибку рантайма (runtime.throw, как при конкурентной записи в мапу), которую вообще невозможно перехватить через recover() даже внутри самой дочерней горутины"
    ],
    correct: 1,
    explanationRU: "Важное отличие (вариант №6 — популярная ловушка!): запись в закрытый канал вызывает обычную панику (gopanic), которую МОЖНО поймать через recover(), но ТОЛЬКО внутри той же самой горутины, где она произошла! Так как в нашей дочерней горутине своего defer + recover() нет, а gopanic просматривает цепочку g._defer исключительно текущей структуры runtime.g, неперехваченная паника роняет весь ОС-процесс.",
    speechEN: "The entire OS process crashes. While 'send on closed channel' is a regular recoverable panic (unlike concurrent map writes which call unrecoverable 'runtime.throw'), each goroutine has its own isolated stack and 'g._defer' chain. 'gopanic' only unwinds the crashing goroutine's stack, misses 'main's recover(), and terminates the program."
  },
  {
    id: "q6",
    title: "Задача 6: Мутация общего базового массива при append (Slice Aliasing Trap)",
    ru: "Что выведет этот код в консоль и как избежать взаимного затирания элементов?",
    en: "What does this code output? Explain how shared backing arrays behave during append() and how Full Slice Expressions fix it.",
    code: `func main() {
    a := make([]int, 2, 4) // len = 2, cap = 4
    a[0], a[1] = 1, 2

    b := append(a, 3)
    c := append(a, 4)

    println(b[2], c[2])
}`,
    options: [
      "Выведет '3 4', так как каждый вызов встроенной функции append() по спецификации Go создаёт независимую копию среза в локальном кеше P.mcache",
      "Выведет '3 3', потому что первый вызов append(a, 3) атомарно помечает 3-ю ячейку базового массива как занятую в заголовке исходного слайса a",
      "Выведет '4 4': поскольку у слайса a есть свободный запас ёмкости (len=2 < cap=4), оба вызова append пишут по индексу 2 в один и тот же базовый массив без реаллокации, и второй вызов затирает b[2] четвёркой (лечится через a[:2:2])",
      "Вызовет панику index out of range [2] with length 2, так как базовый слайс a имеет длину 2 и не разрешает обращение к индексу 2 в производных срезах без явного реслайсинга",
      "Выведет '4 4' только на одноядерном процессоре, а при GOMAXPROCS > 1 произойдёт реаллокация через runtime.growslice из-за выравнивания классов размеров mspan",
      "Компилятор выдаст предупреждение Escape Analysis и принудительно скопирует массив a на стек для каждого нового присваивания b и c"
    ],
    correct: 2,
    explanationRU: "Так как у слайса a длина 2, а ёмкость 4, вызов b := append(a, 3) кладёт тройку в ячейку с индексом 2 того же самого базового массива и возвращает новый заголовок {ptr, len: 3, cap: 4}. Но в самом заголовке a поле len по-прежнему равно 2! Поэтому следующий вызов c := append(a, 4) снова видит свободное место по индексу 2 и записывает туда 4 поверх тройки! Чтобы защититься от этого при передаче срезов, используют полное выражение среза с тремя индексами: a[:2:2] (ограничивает cap равным len, заставляя append выделить новый массив).",
    speechEN: "It prints '4 4'. Because slice 'a' has 'len=2' and 'cap=4', 'append(a, 3)' writes 3 into index 2 of the shared backing array in place. However, 'a.len' remains 2 on the stack! When 'append(a, 4)' runs next, it writes 4 into the exact same index 2 of the shared array, overwriting 'b[2]'. You can prevent this using a full slice expression 'a[:2:2]' to cap capacity at length."
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
    id: "q11",
    title: "Задача 11: Ловушка time.After внутри высокочастотного цикла select",
    ru: "Какую проблему с памятью и сборщиком мусора создаёт этот паттерн при потоке 50 000 сообщений в секунду?",
    en: "What memory and GC issue does time.After cause inside a high-throughput select loop, and what changed in Go 1.23+?",
    code: `func ConsumeStream(ch <-chan Message) {
    for {
        select {
        case msg := <-ch:
            handle(msg)
        case <-time.After(time.Minute):
            log.Warn("stream idle for 1 minute")
        }
    }
}`,
    options: [
      "Функция time.After внутри select переводит текущий процессор P в статус _Psyscall на каждую итерации, порождая тысячи системных потоков ОС для ожидания аппаратного таймера",
      "При каждом срабатывании ветки case msg := <-ch старый таймер автоматически переиспользуется рантаймом из локального пула P.timerPool без каких-либо аллокаций",
      "На КАЖДОЙ итерации цикла вызов time.After(time.Minute) аллоцирует в куче новую структуру time.Timer и новый канал: до Go 1.23 они вообще не могли быть собраны GC до истечения полной минуты (вызывая OOM), а в Go 1.23+ собираются GC, но всё равно создают 50 000 мусорных аллокаций в секунду (фикс: time.NewTimer + timer.Reset)",
      "Вызов time.After захватывает глобальный мьютекс всех таймеров рантайма sched.timerLock на всё время выполнения функции handle(msg), сериализуя работу всех ядер CPU",
      "Через 61 итерацию цикла планировщик Go принудительно выберет ветку <-time.After(time.Minute) по правилу честности 61-го тика, даже если минута ещё не прошла",
      "Компилятор Go распознаёт паттерн select с time.After и автоматически выносит инициализацию таймера за пределы цикла for на этапе оптимизации SSA"
    ],
    correct: 2,
    explanationRU: "Отличный маркер знания современных версий Go на собеседовании: на каждом круге цикла for аргументы веток case вычисляются заново, поэтому time.After создаёт в хипе новый таймер и канал. До Go 1.23 активный таймер хранился в куче таймеров процессора P (P.timers) и удерживал ссылку на канал до самого срабатывания (при 50k RPS за минуту накапливалось 3 миллиона живых таймеров -> OOM!). В Go 1.23+ сборщик мусора научили удалять недостижимые таймеры сразу, но 50 000 бесполезных аллокаций в секунду никуда не делись, поэтому в циклах всегда используют time.NewTimer + timer.Reset.",
    speechEN: "Every loop iteration evaluates 'time.After(time.Minute)' anew, allocating a fresh 'time.Timer' and 'hchan' on the heap. Before Go 1.23, unstopped timers stayed referenced in the runtime's timer heap until they fired, causing catastrophic OOMs under high RPS. While Go 1.23+ allows GC to collect unreferenced timers early, it still creates massive allocation churn—so you should hoist 'time.NewTimer' outside the loop and call 'timer.Reset'."
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
    id: "q14",
    title: "Задача 14: Гонка данных при возврате указателя из защищённой мапы (Pointer Escape from Mutex)",
    ru: "Все обращения к мапе db обёрнуты в RWMutex. Почему детектор гонок (-race) всё равно бьёт тревогу в продакшене?",
    en: "All map accesses are properly guarded by sync.RWMutex. Why does the Race Detector (-race) still report a data race here?",
    code: `type Account struct { Balance int64 }

var (
    mu sync.RWMutex
    db = map[int]*Account{}
)

func AddFunds(id int, amount int64) {
    mu.Lock()
    db[id].Balance += amount
    mu.Unlock()
}

func ReadBalance(id int) int64 {
    mu.RLock()
    acc := db[id]
    mu.RUnlock()
    return acc.Balance // Читаем поле после RUnlock()!
}`,
    options: [
      "Это ложное срабатывание детектора -race (false positive), так как 64-битное чтение int64 на архитектуре amd64 всегда является атомарным на уровне процессора",
      "При вызове db[id].Balance += amount внутри мапы происходит эвакуация бакета SwissTable, из-за чего адрес структуры Account в куче меняется на лету",
      "Чистый Data Race на поле acc.Balance: мьютекс защитил только чтение самого указателя *Account из хеш-таблицы мапы, но в функции ReadBalance чтение поля acc.Balance происходит УЖЕ ПОСЛЕ вызова mu.RUnlock(), одновременно с записью db[id].Balance += amount в другой горутине!",
      "Ошибка возникает потому, что в AddFunds используется обычный Lock(), который не инвалидирует кэш-линии ядер, читавших мапу через RLock()",
      "В Go запрещено хранить указатели на структуры в качестве значений мапы при использовании RWMutex из-за работы Гибридного барьера записи сборщика мусора",
      "Гонка данных происходит на ключе id, так как он передаётся в обе функции без захвата мьютекса"
    ],
    correct: 2,
    explanationRU: "Одна из самых частых ошибок в реальных микросервисах: разработчики защищают мьютексом саму мапу (map[int]*Account), возвращают из функции указатель *Account, отпускают мьютекс и начинают читать/менять поля этой структуры в хендлере. Мьютекс защищает только то, что выполняется МЕЖДУ Lock и Unlock! Как только сделан RUnlock(), горутина в ReadBalance читает область памяти acc.Balance без всякой защиты, пока AddFunds меняет ту же самую ячейку памяти под Lock(). Решение: прочитать val := acc.Balance ДО вызова RUnlock() (или возвращать структуру Account по значению / использовать atomic.Int64 для поля Balance).",
    speechEN: "The RWMutex only protects the map lookup itself, not the heap struct pointed to by '*Account' once the lock is released! In 'ReadBalance', 'acc.Balance' is dereferenced AFTER 'mu.RUnlock()', racing directly against 'db[id].Balance += amount' in 'AddFunds'. To fix this, read 'bal := db[id].Balance' BEFORE calling 'mu.RUnlock()', return 'Account' by value, or make 'Balance' an 'atomic.Int64'."
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
    id: "q17",
    title: "Задача 17: Жадное вычисление выражений в ветках select (Eager Evaluation in Select Send)",
    ru: "Почему функция fetchNextJobFromDB() вызывается на каждой итерации и тормозит сервис, даже когда канал workerCh полностью забит и воркеры заняты?",
    en: "Why is fetchNextJobFromDB() executed even when workerCh is completely full and unable to accept a message?",
    code: `func Dispatcher(ctx context.Context, workerCh chan<- Job) {
    for {
        select {
        case <-ctx.Done():
            return
        case workerCh <- fetchNextJobFromDB(): // Долгий синхронный запрос в БД!
            log.Info("job dispatched")
        }
    }
}`,
    options: [
      "Планировщик Go сначала резервирует пустой слот в кольцевом буфере workerCh и только после этого вызывает fetchNextJobFromDB() внутри мьютекса канала",
      "По спецификации Go все выражения справа от оператора отправки в канал (а также сами каналы) во ВСЕХ ветках case вычисляются синхронно ДО входа в runtime.selectgo! Поэтому fetchNextJobFromDB() вызывается безусловно перед каждой проверкой готовности workerCh, блокируя даже проверку <-ctx.Done() (и теряя вычитанную из БД задачу при отмене контекста!)",
      "Функция fetchNextJobFromDB() вызывается лениво только тогда, когда в очереди workerCh.recvq появляется свободный sudog читателя, но из-за бага в драйвере БД соединение не закрывается",
      "Ветка отправки в канал внутри select всегда имеет более высокий приоритет в массиве pollorder, чем ветка чтения из <-ctx.Done()",
      "Компилятор Go выносит вызов fetchNextJobFromDB() в отдельную фоновую горутину для каждой итерации select, создавая утечку горутин",
      "Проблема возникает только для небуферизованных каналов workerCh, а при буфере > 0 компилятор откладывает вызов функции до освобождения места"
    ],
    correct: 1,
    explanationRU: "Золотое правило оператора select в Go: перед тем как вызвать runtime.selectgo (который проверит, готов ли канал workerCh принять данные или сработал ли ctx.Done()), компилятор обязан вычислить все каналы и ВСЕ отправляемые значения (правую часть `ch <- expr`) сверху вниз! В результате: 1) даже если все воркеры заняты или контекст уже отменён, мы синхронно идём в БД; 2) если пока мы ждали в select, сработал `<-ctx.Done()`, то уже вычитанный из БД `Job` просто выбрасывается в мусор и теряется!",
    speechEN: "In Go, all channel expressions and all right-hand-side values in 'send' cases ('workerCh <- expr') are evaluated EAGERLY from top to bottom BEFORE entering 'runtime.selectgo'! As a result, 'fetchNextJobFromDB()' runs unconditionally on every loop iteration even if 'workerCh' is blocked, and if 'ctx.Done()' wins the select, the fetched DB job is silently dropped and lost!"
  },
  {
    id: "q18",
    title: "Задача 18: Ранняя оценка аргументов в defer при откате транзакции БД (Eager Defer Argument Trap)",
    ru: "Почему в этом коде при ошибке во втором SQL-запросе транзакция НИКОГДА не откатывается (tx.Rollback не вызывается)?",
    en: "Why does tx.Rollback() NEVER execute when the second SQL query fails with an error?",
    code: `func TransferMoney(ctx context.Context, db *sql.DB) error {
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    // Пытаемся откатить транзакцию при ошибке при выходе из функции:
    defer func(e error) {
        if e != nil {
            _ = tx.Rollback()
        }
    }(err) // <--- Внимание на аргумент!

    if _, err = tx.ExecContext(ctx, "UPDATE accounts SET bal = bal - 100 WHERE id = 1"); err != nil {
        return err
    }
    return tx.Commit()
}`,
    options: [
      "Метод tx.ExecContext возвращает ошибку в новую затенённую переменную err, не меняя внешнюю переменную функции",
      "Аргументы вызова функции в операторе defer вычисляются НЕМЕДЛЕННО в момент регистрации строчки defer! В этой точке err равен nil (так как db.BeginTx прошёл успешно), поэтому на стек отложенного вызова копируется e = nil, и условие if e != nil при выходе никогда не выполнится (фикс: просто defer tx.Rollback() или замыкание без аргументов с именованным (err error))",
      "В стандартной библиотеке database/sql метод tx.Rollback() нельзя вызывать внутри анонимной функции defer из-за привязки транзакции к контексту горутины",
      "Open-Coded Defer в Go 1.14+ игнорирует аргументы типа интерфейса error, если они не были инициализированы константой",
      "При вызове return err компилятор освобождает соединение tx обратно в пул sql.DB до запуска цепочки отложенных вызовов defer",
      "Ошибка возникает потому, что переменная err не передана в замыкание по указателю (*error)"
    ],
    correct: 1,
    explanationRU: "Два важнейших правила для продакшен-работы с БД в Go: 1) Аргументы любой функции, стоящей после ключевого слова `defer fn(arg)`, вычисляются в ту самую микросекунду, когда процессор проходит строчку `defer` (а тогда `err` после `BeginTx` был равен `nil`!). 2) В Go вообще не нужно городить условие `if err != nil` вокруг роллбэка: идиоматический паттерн — написать сразу после `BeginTx` одну строчку `defer tx.Rollback()`. Если функция дойдёт до конца и сделает `tx.Commit()`, последующий вызов `tx.Rollback()` в `defer` просто мгновенно вернёт `sql.ErrTxDone` (безопасный no-op), зато при любой ошибке или панике транзакция гарантированно откатится!",
    speechEN: "Function arguments passed to a 'defer' statement are evaluated EAGERLY at the moment 'defer' is scheduled, not when the surrounding function returns! At line 11, 'err' from 'BeginTx' is strictly 'nil', so 'e' is permanently captured as 'nil' and 'tx.Rollback()' never runs—leaking the DB transaction lock! The idiomatic Go fix is simply 'defer tx.Rollback()' right after 'BeginTx' (which is a safe no-op if 'tx.Commit()' succeeds first)."
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
  }
];
