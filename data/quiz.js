const QUIZ_QUESTIONS = [
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
      "Паника времени выполнения (fatal error)"
    ],
    correct: 1,
    explanationRU: "До Go 1.22 переменная цикла i создавалась один раз на весь цикл for, и замыкания захватывали указатель на одну и ту же переменную в куче (которая к моменту запуска горутин уже доходила до 3). Начиная с Go 1.22+, компилятор создаёт новую переменную i на каждую итерацию цикла, поэтому выведется 0, 1, 2 (в порядке, зависящем от планировщика).",
    speechEN: "Before Go 1.22, the loop variable 'i' had per-loop scope and escaped to the heap as a single shared variable, printing '3, 3, 3'. Since Go 1.22, loop variables have per-iteration scope, so each goroutine captures its own copy, printing '0, 1, 2' in non-deterministic order."
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
      "Ошибка компиляции"
    ],
    correct: 1,
    explanationRU: "Под капотом непустой интерфейс (runtime.iface) состоит из двух 8-байтовых указателей: tab (указатель на itab с типом *MyError и методами) и data (указатель на значение = nil). Сравнение err == nil возвращает true ТОЛЬКО если оба поля равны нулю (tab == nil && data == nil). Так как tab заполнен типом *MyError, интерфейс не равен nil!",
    speechEN: "Under the hood, a Go interface is a two-word struct (runtime.iface): an 'itab' pointer (holding type metadata) and a 'data' pointer. When we return a typed nil pointer '*MyError', 'data' is nil, but 'itab' points to '*MyError'. An interface equals nil ONLY when both words are nil, so 'err == nil' evaluates to false."
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
      "Неопределённое поведение",
      "Ошибка компиляции"
    ],
    correct: 1,
    explanationRU: "Инструкция return 0 в Go не является одной атомарной командой — компилятор разворачивает её в 3 шага: 1) присвоить result = 0; 2) выполнить все зарегистрированные функции defer (замыкание захватывает result по ссылке и увеличивает его до 1); 3) выполнить ассемблерную инструкцию возврата RET. В итоге вернётся 1.",
    speechEN: "In Go, 'return 0' compiles into three steps: first, it assigns 0 to the named return slot 'result' on the stack; second, it runs deferred functions (which captures 'result' by reference and increments it to 1); third, it executes the assembly RET instruction, returning 1."
  },
  {
    id: "q4",
    title: "Задача 4: Скрытая утечка памяти через саб-слайс (Sub-slice Leak)",
    ru: "Почему эта функция приводит к утечке 100 МБ в хипе и как это исправить?",
    en: "Why does this function cause a 100 MB memory leak in the heap, and what is the idiomatic fix?",
    code: `func readHeader() []byte {
    buf := make([]byte, 100*1024*1024) // 100 MB
    // ... читаем данные в buf ...
    return buf[:16] // возвращаем только первые 16 байт заголовка
}`,
    options: [
      "Утечки нет: GC освободит неиспользуемый хвост массива",
      "Заголовок среза buf[:16] продолжает ссылаться на весь 100 МБ массив в хипе, не давая GC его собрать",
      "Произойдёт копирование стека (copystack)",
      "Сработает паника выхода за границы capacity"
    ],
    correct: 1,
    explanationRU: "Срез (runtime.slice) — это 24-байтовая структура {ptr, len: 16, cap: 104857600}. Поле ptr продолжает указывать на единый непрерывный блок памяти (mspan) на 100 МБ в куче. Сборщик мусора Go не умеет освобождать кусок массива: пока жив заголовок buf[:16], все 100 МБ считаются Чёрным (живым) объектом. Решение: bytes.Clone(buf[:16]) или явный make + copy.",
    speechEN: "A slice header holds a pointer to the underlying backing array on the heap. Slicing 'buf[:16]' creates a new header pointing to the exact same 100 MB memory block. Because Go's GC marks whole allocations rather than partial spans, the entire 100 MB array stays alive until the 16-byte slice is unreachable. Fix it using 'bytes.Clone(buf[:16])' or 'copy' into a new slice."
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
      "Нет: recover() ловит панику только на стеке СВОЕЙ горутины. Процесс упадёт целиком с fatal panic!",
      "Запись в закрытый канал просто вернёт false без паники",
      "Горутина тихо завершится, а main продолжит работу"
    ],
    correct: 1,
    explanationRU: "У каждой горутины свой собственный стек вызовов и своя цепочка отложенных вызовов (g._defer). Когда ch <- 42 вызывает gopanic(), рантайм раскручивает стек ТОЛЬКО текущей дочерней горутины. Не найдя в ней recover(), рантайм вызывает fatalpanic() и аварийно завершает весь ОС-процесс (exit code 2).",
    speechEN: "No, the entire process crashes. Each goroutine has its own isolated call stack and its own linked list of deferred functions ('g._defer'). When 'ch <- 42' triggers 'gopanic', the runtime only unwinds that specific goroutine's stack. Since it has no local deferred 'recover()', the runtime terminates the whole OS process."
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
      "Паника времени выполнения"
    ],
    correct: 1,
    explanationRU: "Так как у слайса a запас ёмкости cap = 4 (при len = 2), вызов b := append(a, 3) НЕ выделяет новый массив в хипе, а записывает 3 в ячейку базового массива по индексу 2. Но в самом заголовке a длина осталась len = 2! Поэтому следующий вызов c := append(a, 4) пишет число 4 в ТУ ЖЕ САМУЮ ячейку по индексу 2 общего массива, затирая тройку в слайсе b! Выведется: 4 4.",
    speechEN: "It prints '4 4'. Because slice 'a' has length 2 and capacity 4, 'append(a, 3)' mutates index 2 of the shared backing array in place without allocating a new array. However, 'a' itself still has length 2! When 'append(a, 4)' runs next, it overwrites the exact same index 2 in the shared backing array, mutating 'b[2]' to 4."
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
      "fatal error: all goroutines are asleep - deadlock! (wg передан по значению)",
      "Паника: sync: negative WaitGroup counter",
      "Сработает автоматически за счёт указателя внутри WaitGroup"
    ],
    correct: 1,
    explanationRU: "Структура sync.WaitGroup хранит 64-битный атомарный счётчик и семафор прямо внутри себя (без скрытого указателя на хип, как у канала). При передаче wg в функцию worker по значению создаётся полная копия счётчика! Вызов wg.Done() уменьшает копию на стеке worker, а оригинальный wg в main() остаётся со счётчиком 1 и вечно ждёт в wg.Wait() -> дедлок!",
    speechEN: "It crashes with a fatal deadlock. Unlike channels or maps (which are pointer wrappers), 'sync.WaitGroup' and 'sync.Mutex' store their atomic state word and semaphore inline by value. Passing 'wg' by value copies the counter, so 'wg.Done()' decrements the local copy while 'main' blocks forever on the original WaitGroup."
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
    c.Log() // внутри вызывает c.mu.Lock() ещё раз в той же горутине!
}

func (c *SafeCounter) Log() {
    c.mu.Lock()
    defer c.mu.Unlock()
    println(c.v)
}`,
    options: [
      "Успешно выведет 1, так как это одна и та же горутина",
      "Моментальный Deadlock! sync.Mutex в Go НЕ реентерабелен и не знает владельца",
      "Вызовет панику 'double lock'",
      "Второй Lock() будет проигнорирован"
    ],
    correct: 1,
    explanationRU: "В отличие от synchronized / ReentrantLock в Java, sync.Mutex в Go намеренно НЕ хранит указатель или ID горутины-владельца (помнишь: у горутин вообще нет ID!). Для мьютекса повторный вызов Lock() из той же самой горутины выглядит как попытка захватить уже закрытый лок (mutexLocked == 1), поэтому горутина паркует саму себя через Semacquire навечно!",
    speechEN: "It deadlocks immediately. Unlike Java's ReentrantLock, Go's 'sync.Mutex' is strictly non-reentrant and has no concept of an owner goroutine. Because 'm.state' only tracks whether the lock bit is set, calling 'Lock()' a second time on the same call stack causes the goroutine to block waiting for itself to call 'Unlock()'."
  }
];
