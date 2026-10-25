const QUIZ_QUESTIONS = [
  // --- Предыдущие 8 базовых задач (Q1 - Q8) ---
  {
    id: "q1",
    title: "Задача 1: Замыкание в цикле и горутины (Loop Variable Capture)",
    ru: "Что выведет этот код и почему? (И что изменилось в Go 1.22+?)",
    en: "What does this code print, and what changed in Go 1.22+ regarding loop variable scope?",
    code: `for i := 0; i < 3; i++ {
    go func() {
        println(i)
    }()
}
time.Sleep(time.Millisecond)`,
    options: [
      "0, 1, 2 (в произвольном порядке переключения планировщика)",
      "3, 3, 3 (до Go 1.22) / 0, 1, 2 в произвольном порядке (начиная с Go 1.22+)",
      "0, 0, 0 всегда",
      "Паника времени выполнения (Data Race)",
      "Компилятор выдаст ошибку использования неинициализированной переменной",
      "Программа зависнет в дедлоке из-за отсутствия синхронизации"
    ],
    correct: 1,
    explanationRU: "До Go 1.22 переменная цикла i создавалась один раз на весь цикл for, и замыкания захватывали указатель на одну и ту же переменную в куче (к моменту старта горутин i уже равнялась 3). Начиная с Go 1.22+, компилятор создаёт новую переменную i на каждую итерацию.",
    speechEN: "Before Go 1.22, the loop variable 'i' was shared across iterations, printing '3, 3, 3'. Since Go 1.22, loop variables have per-iteration scope, safely printing '0, 1, 2'."
  },
  {
    id: "q2",
    title: "Задача 2: Классическая ловушка интерфейса (Typed nil != nil)",
    ru: "Что выведет функция main() при проверке err == nil и почему?",
    en: "What does main() print when checking err == nil? Explain the 2-word interface structure (itab + data).",
    code: `type MyError struct{}
func (*MyError) Error() string { return "boom" }

func returnsError() error {
    var p *MyError = nil
    return p // Возвращаем типизированный nil-указатель как интерфейс error
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
      "Выведет 'err is nil'",
      "Выведет 'err IS NOT nil!' (интерфейс НЕ равен nil)",
      "Паника времени выполнения (nil pointer dereference)",
      "Ошибка компиляции: несовпадение типов возвращаемого значения",
      "Программа завершится с Segmentation Fault",
      "Компилятор автоматически приведёт тип к чистому nil"
    ],
    correct: 1,
    explanationRU: "Интерфейс в Go — это два слова (itab + data). При возврате typed nil поле tab заполняется метаданными *MyError, а data равна nil. Интерфейс равен nil только если оба слова нулевые.",
    speechEN: "An interface in Go is a two-word descriptor (itab + data). A typed nil pointer fills the itab slot while leaving data nil. An interface equals nil only when both words are zero."
  },
  {
    id: "q3",
    title: "Задача 3: Именованный return и модификация в defer",
    ru: "Какое число вернёт вызов функции f() и как именно выполняется return?",
    en: "What integer value does f() return? Explain the exact execution order of return and defer.",
    code: `func f() (result int) {
    defer func() {
        result++
    }()
    return 0
}`,
    options: [
      "0",
      "1",
      "2",
      "Неопределённое поведение из-за гонки стека",
      "Ошибка компиляции: дублирование возврата",
      "Возвратит 0, так как defer выполняется до return"
    ],
    correct: 1,
    explanationRU: "return 0 записывает 0 в result. Затем defer инкрементирует result до 1. RET возвращает измененное значение 1.",
    speechEN: "The 'return 0' statement assigns 0 to 'result'. Then the deferred closure increments it to 1 before RET executes."
  },
  {
    id: "q4",
    title: "Задача 4: Скрытая утечка памяти через саб-слайс (Sub-slice Leak)",
    ru: "Почему эта функция приводит к утечке 100 МБ в хипе и как это исправить?",
    en: "Why does this function cause a 100 MB memory leak in the heap, and how do you fix it?",
    code: `func readHeader() []byte {
    buf := make([]byte, 100*1024*1024) // 100 MB
    // ... читаем данные в buf ...
    return buf[:16] // возвращаем только первые 16 байт заголовка
}`,
    options: [
      "Утечки нет: GC освободит неиспользуемый хвост массива",
      "Заголовок среза buf[:16] продолжает ссылаться на весь 100 МБ массив в хипе, удерживая его",
      "Произойдёт паника переполнения стека аллокатора",
      "Компилятор автоматически обрежет базовый массив до 16 байт",
      "Сработает Escape Analysis, и массив будет выделен на стеке",
      "Ошибка компиляции: возвращается локальный массив функции"
    ],
    correct: 1,
    explanationRU: "Срез указывает на базовый массив в хипе. Пока жив заголовок buf[:16], весь блок в 100 МБ удерживается сборщиком мусора.",
    speechEN: "The slice header points to the underlying 100 MB array on the heap, preventing the GC from reclaiming it."
  },
  {
    id: "q5",
    title: "Задача 5: Паника в дочерней горутине и recover()",
    ru: "Поймает ли этот recover() панику записи в закрытый канал?",
    en: "Will this recover() catch the panic from the spawned goroutine? What happens to the process?",
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
      "Да, выведет 'recovered: send on closed channel'",
      "Нет: recover() ловит панику только на стеке СВОЕЙ горутины. Процесс упадёт целиком!",
      "Запись в закрытый канал тихо вернёт false без паники",
      "Горутина тихо завершится, а main продолжит работу без ошибок",
      "Сработает встроенный рантайм-восстановитель Go",
      "Компилятор перехватит панику в блок defer функции main"
    ],
    correct: 1,
    explanationRU: "Каждая горутина имеет свой изолированный стек. recover() работает только в рамках текущей горутины.",
    speechEN: "Each goroutine has an isolated call stack. recover() only catches panics on the current goroutine's stack; otherwise the process crashes."
  },
  {
    id: "q6",
    title: "Задача 6: Append и разделение базового массива (Slice Aliasing Trap)",
    ru: "Что выведет этот код в консоль и почему?",
    en: "What does this code output? Explain how slice capacity affects append()",
    code: `func main() {
    a := make([]int, 2, 4) // len = 2, cap = 4: [0, 0]
    a[0], a[1] = 1, 2

    b := append(a, 3) // len = 3, cap = 4
    c := append(a, 4) // len = 3, cap = 4

    println(b[2], c[2])
}`,
    options: [
      "3 4",
      "4 4 (вызов append(a, 4) перезаписал третий элемент слайса b!)",
      "3 3",
      "Паника времени выполнения из-за выхода за cap",
      "0 0",
      "1 2"
    ],
    correct: 1,
    explanationRU: "Ёмкость cap=4 позволила append(a, 3) записать значение прямо в общий массив без аллокации. Повторный append(a, 4) перезаписал тот же индекс 2.",
    speechEN: "Because capacity is 4, both appends mutate index 2 of the shared backing array in place, so b[2] gets overwritten to 4."
  },
  {
    id: "q7",
    title: "Задача 7: Передача sync.WaitGroup или sync.Mutex по значению",
    ru: "Что произойдёт при запуске этого кода?",
    en: "What happens when this code runs, and why must sync primitives never be copied by value?",
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
      "Выведет 'working...' и штатно завершится",
      "fatal error: all goroutines are asleep - deadlock!",
      "Паника: sync: negative WaitGroup counter",
      "Сработает автоматически за счёт скрытого указателя внутри WaitGroup",
      "Компилятор выдаст ошибку передачи синхропримитива по значению",
      "Программа скомпилируется, но завершится с exit code 1"
    ],
    correct: 1,
    explanationRU: "sync.WaitGroup хранит состояние по значению. Передача копирует счётчик, поэтому main вечно ждет на оригинальном wg -> deadlock.",
    speechEN: "Passing wg by value copies the internal counter. main blocks forever on the original WaitGroup, causing a deadlock."
  },
  {
    id: "q8",
    title: "Задача 8: Захват мьютекса и рекурсивный вызов (Non-Reentrant Mutex)",
    ru: "Является ли sync.Mutex в Go реентерабельным (reentrant)? Что сделает этот код?",
    en: "Is Go's sync.Mutex reentrant? What happens when a goroutine locks the same mutex twice?",
    code: `type SafeCounter struct {
    mu sync.Mutex
    v  int
}

func (c *SafeCounter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.v++
    c.Log() // вызывает c.mu.Lock() ещё раз в той же горутине!
}

func (c *SafeCounter) Log() {
    c.mu.Lock()
    defer c.mu.Unlock()
    println(c.v)
}`,
    options: [
      "Успешно выведет 1, так как это одна и та же горутина",
      "Моментальный Deadlock! sync.Mutex в Go НЕ реентерабелен",
      "Вызовет панику времени выполнения 'double lock'",
      "Второй Lock() будет проигнорирован рантаймом",
      "Компилятор автоматически разблокирует мьютекс перед входом в Log",
      "Программа упадёт по тайм-ауту через 30 секунд"
    ],
    correct: 1,
    explanationRU: "sync.Mutex не хранит ID владельца. Повторный Lock() в той же горутине приводит к вечному блокированию (deadlock).",
    speechEN: "Go's sync.Mutex is non-reentrant. Locking it twice in the same goroutine causes an immediate deadlock."
  },

  // =========================================================================
  // НОВЫЕ БОЕВЫЕ ЗАДАЧИ НА CODE REVIEW (Q9 - Q14)
  // =========================================================================
  {
    id: "q9",
    title: "Задача 9: Утечка горутины при таймауте RPC-вызова (Unbuffered Channel Leak)",
    ru: "Какой баг скрыт в этом хендлере при срабатывании контекста по таймауту?",
    en: "What concurrency bug occurs here when ctx times out before doSlowRPC finishes?",
    code: `func handleRequest(ctx context.Context, req Req) (Resp, error) {
    ch := make(chan Resp) // Небуферизованный канал!
    go func() {
        ch <- doSlowRPC(req)
    }()

    select {
    case res := <-ch:
        return res, nil
    case <-ctx.Done():
        return Resp{}, ctx.Err() // Ошибка таймаута, выходим раньше!
    }
}`,
    options: [
      "Никаких проблем, горутина завершится вместе с хендлером",
      "Утечка горутины: дочерняя горутина навсегда зависнет в sudog sendq, ожидая читателя",
      "Паника записи в закрытый канал",
      "Утечка дескриптора сокета в операционной системе",
      "Утечка памяти в стеке дочерней горутины (stack overflow)",
      "Сработает Garbage Collector и принудительно убьёт зависшую горутину"
    ],
    correct: 1,
    explanationRU: "Канал небуферизованный. При таймауте select возвращает ошибку, а горутина вечно ждет в ch <- doSlowRPC. Решение — make(chan Resp, 1).",
    speechEN: "The channel is unbuffered. When ctx times out, handleRequest exits, while the background goroutine blocks forever on ch <- resp, leaking its stack and state."
  },
  {
    id: "q10",
    title: "Задача 10: Преждевременная отмена контекста в фоне (Premature Cancellation)",
    ru: "Почему эта фоновая задача в горутине гарантированно завершится с ошибкой?",
    en: "Why does this background goroutine task fail immediately after the HTTP handler returns?",
    code: `func HandleUpload(w http.ResponseWriter, r *http.Request) {
    file, header := parseMultipart(r)
    
    // Запускаем асинхронную загрузку в S3 в фоне
    go func(ctx context.Context) {
        err := uploadToS3(ctx, file, header.Filename)
        if err != nil { log.Error(err) }
    }(r.Context())

    w.WriteHeader(http.StatusOK) // Отдали ответ клиенту
}`,
    options: [
      "Всё работает правильно, файл загрузится в фоне",
      "net/http автоматически отменяет r.Context() при завершении ServeHTTP, прерывая загрузку",
      "Возникает Data Race на объекте ResponseWriter",
      "Файл удалится из multipart-буфера сразу после ответа",
      "Возникает паника переполнения очереди P.runnext",
      "Сборщик мусора удалит переменную file до завершения горутины"
    ],
    correct: 1,
    explanationRU: "Сервер net/http отменяет r.Context() сразу по возврату из хендлера. Для фоновых задач нужно использовать context.WithoutCancel(r.Context()).",
    speechEN: "net/http cancels r.Context() as soon as ServeHTTP returns. Passing r.Context() directly to a background goroutine causes immediate cancellation. Use context.WithoutCancel."
  },
  {
    id: "q11",
    title: "Задача 11: Ловушка time.After внутри бесконечного цикла select",
    ru: "Какой критический дефект производительности скрыт в этом цикле воркера?",
    en: "What severe performance defect is caused by time.After inside this infinite select loop?",
    code: `func Worker(ch <-chan Event) {
    for {
        select {
        case ev := <-ch:
            process(ev)
        case <-time.After(30 * time.Second):
            metrics.IncIdleTimeout()
        }
    }
}`,
    options: [
      "Никаких проблем, таймер очищается сборщиком мусора на каждой итерации",
      "На каждой итерации аллоцируется новый таймер и канал в куче, создавая колоссальную нагрузку на GC",
      "Таймер сработает ровно один раз и больше никогда не вызовется",
      "Возникает дедлок планировщика GMP",
      "Утечка потоков ОС (M leak)",
      "Ошибка компиляции: time.After нельзя использовать внутри select"
    ],
    correct: 1,
    explanationRU: "time.After создает новый timer и канал на каждой итерации. При высокой интенсивности это приводит к миллионам аллокаций и фризам GC.",
    speechEN: "time.After creates a new timer and channel allocation on every single loop iteration, putting massive pressure on the heap and GC."
  },
  {
    id: "q12",
    title: "Задача 12: Конкурентный append в общий слайс (Slice Data Race)",
    ru: "Что произойдет при параллельном вызове append() из нескольких горутин в слайс?",
    en: "What happens when multiple goroutines call append() concurrently on a shared slice?",
    code: `var results []int

func Worker(ids []int, wg *sync.WaitGroup) {
    defer wg.Done()
    for _, id := range ids {
        val := compute(id)
        results = append(results, val) // Без мьютекса!
    }
}`,
    options: [
      "Всё запишется корректно, так как слайсы в Go потокобезопасны",
      "Data Race на заголовке слайса (ptr, len, cap) и перезапись данных в памяти",
      "Компилятор автоматически добавит мьютекс под капотом",
      "Слайс увеличит capacity в 10 раз быстрее обычного",
      "Программа упадёт с паникой 'concurrent map writes'",
      "Значения запишутся в обратном порядке"
    ],
    correct: 1,
    explanationRU: "Заголовок слайса (24 байта) не защищен. Гонка приводит к потере данных, перезаписи элементов и повреждению памяти.",
    speechEN: "The slice header is not thread-safe. Concurrent appends cause data races, lost writes, and memory corruption."
  },
  {
    id: "q13",
    title: "Задача 13: Окно уязвимости в RWMutex (TOCTOU / Check-then-Act Race)",
    ru: "Какой архитектурный баг допущен в этой логике кэширования под RWMutex?",
    en: "What concurrency flaw (Check-then-Act / TOCTOU) is present in this cache lookup?",
    code: `func GetOrCreate(key string) *Data {
    mu.RLock()
    if val, ok := cache[key]; ok {
        mu.RUnlock()
        return val
    }
    mu.RUnlock()

    mu.Lock()
    defer mu.Unlock()
    // Между RUnlock и Lock много горутин могли пройти первую проверку!
    val := expensiveLoad(key)
    cache[key] = val
    return val
}`,
    options: [
      "Всё работает идеально и быстро благодаря RWMutex",
      "Гонка типа Check-then-Act: несколько горутин одновременно создадут дорогие объекты и перезапишут кэш",
      "Deadlock между RLock и Lock",
      "Паника одновременной записи в мапу",
      "Утечка мьютекса (Mutex Leak)",
      "Ошибка компиляции: перекрытие лока"
    ],
    correct: 1,
    explanationRU: "Между освобождением чтения и захватом записи есть микросекундное окно, где десятки горутин дублируют тяжёлую загрузку.",
    speechEN: "There is a race window between RUnlock and Lock where multiple goroutines concurrently trigger expensiveLoad, defeating the cache."
  },
  {
    id: "q14",
    title: "Задача 14: Возврат указателя из мапы под RWMutex (Unprotected Field Race)",
    ru: "Почему этот код содержит опасный Data Race, несмотря на использование RWMutex?",
    en: "Why does this code cause a Data Race despite using RWMutex correctly?",
    code: `type User struct { Balance int }
var ( mu sync.RWMutex; db = make(map[int]*User) )

func GetBalance(id int) int {
    mu.RLock()
    user := db[id] // Защитили чтение мапы
    mu.RUnlock()
    
    return user.Balance // Читаем поле структуры снаружи мьютекса!
}`,
    options: [
      "Никакого race нет, мапа и структура защищены",
      "Data Race: RWMutex защитил хеш-таблицу мапы, но поле user.Balance читается снаружи лока, пока другая горутина под mu.Lock() меняет его",
      "Указатель user может стать nil из-за сборщика мусора",
      "Ошибка компиляции: доступ к полям структуры по указателю запрещен",
      "Паника 'concurrent map read'",
      "Мьютекс не поддерживает чтение указателей"
    ],
    correct: 1,
    explanationRU: "Мьютекс защитил только саму мапу, но не память внутри структуры User. Одновременное чтение и запись user.Balance — чистый Data Race.",
    speechEN: "The mutex protects the map structure itself, not the User struct fields. Reading user.Balance outside the lock while another thread writes to it causes a Data Race."
  }
];
