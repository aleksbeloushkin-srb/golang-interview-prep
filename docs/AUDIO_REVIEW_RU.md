# Приёмка озвучки на слух — неделя 1

Сгенерировано из `data/audio.js` (35 текстов × 2 голоса). Записи проверены только машинно: файлы есть, декодируются, хеш совпадает с текущим текстом. **На слух ни одна запись ещё не принята.**

Как проверять каждую запись (Michael и Heart отдельно):

1. Прослушать, не глядя на экран, и пересказать смысл.
2. Сверить с текстом на экране: API, числа, отрицание, существенное условие.
3. Отметить неестественные паузы, темп, обрезанное начало или конец, ударения в терминах.
4. Если нужна правка — записать точный фрагмент и желаемое чтение в «Комментарий».

Сначала — строки с «риском». Отметки: ✅ принято, ✏️ нужна правка. Правки произношения вносятся в `SPEECH_FIXES` (`scripts/gen-audio.mjs`), пересоздаются только затронутые записи.

| Ключ | Голос | с | Риск | Термины | Числа | Условие слышно | Паузы/темп | Итог | Комментарий |
|---|---|---|---|---|---|---|---|---|---|
| [card:c7:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7) | Michael | 37.9 | `GOMAXPROCS=4`, cgo |  |  |  |  |  |  |
| [card:c7:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7) | Heart | 38.4 | `GOMAXPROCS=4`, cgo |  |  |  |  |  |  |
| [card:c29:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29) | Michael | 23.8 | ArrayList, subList, ByteBuffer |  |  |  |  |  |  |
| [card:c29:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29) | Heart | 23.9 | ArrayList, subList, ByteBuffer |  |  |  |  |  |  |
| [card:c29:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29) | Michael | 35.0 | `s[1:3]` |  |  |  |  |  |  |
| [card:c29:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29) | Heart | 36.0 | `s[1:3]` |  |  |  |  |  |  |
| [card:c33:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Michael | 28.3 | `*MyError`, «err is not nil» |  |  |  |  |  |  |
| [card:c33:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Heart | 28.7 | `*MyError`, «err is not nil» |  |  |  |  |  |  |
| [card:c34:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Michael | 42.5 | `*Counter`, `(&c).Set()`, `map[K]Counter` |  |  |  |  |  |  |
| [card:c34:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Heart | 43.4 | `*Counter`, `(&c).Set()`, `map[K]Counter` |  |  |  |  |  |  |
| [card:c35:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Michael | 40.0 | «directly», «panicking goroutine» |  |  |  |  |  |  |
| [card:c35:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Heart | 41.6 | «directly», «panicking goroutine» |  |  |  |  |  |  |
| [card:c39:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Michael | 26.0 | `getCause`, `addSuppressed` |  |  |  |  |  |  |
| [card:c39:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Heart | 26.5 | `getCause`, `addSuppressed` |  |  |  |  |  |  |
| [card:c39:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Michael | 40.9 | `fmt.Errorf`, `%w`, `io.EOF`, Go 1.20 |  |  |  |  |  |  |
| [card:c39:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Heart | 41.2 | `fmt.Errorf`, `%w`, `io.EOF`, Go 1.20 |  |  |  |  |  |  |
| [card:c40:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Michael | 42.8 | `nil`, пустая строка, длинное перечисление |  |  |  |  |  |  |
| [card:c40:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Heart | 43.9 | `nil`, пустая строка, длинное перечисление |  |  |  |  |  |  |
| [card:c47:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47) | Michael | 47.1 | `*sql.DB`, `BeginTx(ctx, nil)` |  |  |  |  |  |  |
| [card:c47:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47) | Heart | 48.6 | `*sql.DB`, `BeginTx(ctx, nil)` |  |  |  |  |  |  |
| [plan:w1-mon-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/mon) | Michael | 27.4 | `x := expr` |  |  |  |  |  |  |
| [plan:w1-mon-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/mon) | Heart | 28.0 | `x := expr` |  |  |  |  |  |  |
| [plan:w1-tue-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Michael | 36.9 | `for i := range` против `for i = range` |  |  |  |  |  |  |
| [plan:w1-tue-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Heart | 37.2 | `for i := range` против `for i = range` |  |  |  |  |  |  |
| [plan:w1-tue-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Michael | 44.4 | 12.50 EUR, 1250, −0.05 EUR |  |  |  |  |  |  |
| [plan:w1-tue-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Heart | 45.0 | 12.50 EUR, 1250, −0.05 EUR |  |  |  |  |  |  |
| [plan:w1-wed-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 50.0 | `*Service`, `(&v).Notify()`, `map[K]*Service` |  |  |  |  |  |  |
| [plan:w1-wed-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 51.5 | `*Service`, `(&v).Notify()`, `map[K]*Service` |  |  |  |  |  |  |
| [practice:p-deferpanic:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic) | Michael | 29.9 | «same goroutine», 3, 2, 1 |  |  |  |  |  |  |
| [practice:p-deferpanic:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic) | Heart | 30.4 | «same goroutine», 3, 2, 1 |  |  |  |  |  |  |
| [practice:p-money:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money) | Michael | 38.8 | 12.50 EUR, −0.05 EUR |  |  |  |  |  |  |
| [practice:p-money:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money) | Heart | 39.4 | 12.50 EUR, −0.05 EUR |  |  |  |  |  |  |
| [card:c2:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2) | Michael | 13.8 |  |  |  |  |  |  |  |
| [card:c2:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2) | Heart | 13.9 |  |  |  |  |  |  |  |
| [card:c2:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2) | Michael | 32.2 |  |  |  |  |  |  |  |
| [card:c2:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2) | Heart | 33.2 |  |  |  |  |  |  |  |
| [card:c7:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7) | Michael | 16.4 |  |  |  |  |  |  |  |
| [card:c7:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7) | Heart | 17.2 |  |  |  |  |  |  |  |
| [card:c28:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28) | Michael | 22.6 |  |  |  |  |  |  |  |
| [card:c28:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28) | Heart | 23.5 |  |  |  |  |  |  |  |
| [card:c28:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28) | Michael | 37.2 |  |  |  |  |  |  |  |
| [card:c28:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28) | Heart | 38.3 |  |  |  |  |  |  |  |
| [card:c33:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Michael | 14.4 |  |  |  |  |  |  |  |
| [card:c33:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Heart | 15.3 |  |  |  |  |  |  |  |
| [card:c34:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Michael | 15.8 |  |  |  |  |  |  |  |
| [card:c34:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Heart | 16.1 |  |  |  |  |  |  |  |
| [card:c35:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Michael | 21.4 |  |  |  |  |  |  |  |
| [card:c35:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Heart | 21.7 |  |  |  |  |  |  |  |
| [card:c40:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Michael | 24.5 |  |  |  |  |  |  |  |
| [card:c40:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Heart | 25.2 |  |  |  |  |  |  |  |
| [card:c47:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47) | Michael | 23.5 |  |  |  |  |  |  |  |
| [card:c47:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47) | Heart | 23.8 |  |  |  |  |  |  |  |
| [plan:w1-sat-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Michael | 27.4 |  |  |  |  |  |  |  |
| [plan:w1-sat-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Heart | 28.5 |  |  |  |  |  |  |  |
| [plan:w1-sat-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Michael | 38.6 |  |  |  |  |  |  |  |
| [plan:w1-sat-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Heart | 40.1 |  |  |  |  |  |  |  |
| [plan:w1-thu-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 25.3 |  |  |  |  |  |  |  |
| [plan:w1-thu-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 25.4 |  |  |  |  |  |  |  |
| [plan:w1-thu-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 21.8 |  |  |  |  |  |  |  |
| [plan:w1-thu-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 22.1 |  |  |  |  |  |  |  |
| [plan:w1-thu-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 29.7 |  |  |  |  |  |  |  |
| [plan:w1-thu-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 30.8 |  |  |  |  |  |  |  |
| [plan:w1-wed-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 27.5 |  |  |  |  |  |  |  |
| [plan:w1-wed-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 27.6 |  |  |  |  |  |  |  |
| [plan:w1-wed-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 26.3 |  |  |  |  |  |  |  |
| [plan:w1-wed-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 26.4 |  |  |  |  |  |  |  |
| [practice:p-account:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account) | Michael | 33.2 |  |  |  |  |  |  |  |
| [practice:p-account:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account) | Heart | 34.3 |  |  |  |  |  |  |  |
| [practice:p-validation:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation) | Michael | 29.6 |  |  |  |  |  |  |  |
| [practice:p-validation:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation) | Heart | 30.3 |  |  |  |  |  |  |  |

## Что читает синтезатор

Текст для речи отличается от экранного только чтением кода и чисел. Если смысл расходится с экраном — это ошибка, её нужно отметить.

**card:c7:short** (хеш текста `52a3505d`)

> Go max procs limits parallel Go code: with Go max procs set to four, at most four goroutines run Go code at the same moment, because Go max procs is the number of P's, and a P is the right to run Go code. By default it equals the number of logical C-P-U's the process may use, and in the G-M-P model a goroutine, G, runs on an O-S thread, M, only while that thread holds a P. Threads can still outnumber P's, because a thread blocked for long in a system call or in C-Go can lose its P to another thread.

**card:c29:jvm** (хеш текста `5f8119f2`)

> A slice combines Array List style growth with sub-List or Byte Buffer style views over a shared array: two slices can share one array, and append may or may not create a new one, so always use the slice that append returns. Go strings are immutable bytes, usually U-T-F-8, not U-T-F-16 as Java's String A-P-I.

**card:c29:short** (хеш текста `52ee4476`)

> A slice is only a view onto data stored in an array, not the data itself. Its structure is a pointer to the array, a length and a capacity, and a string is a pointer and a length over immutable bytes. So slicing s from one to three copies no elements: it is a new view over the same array, and a change through one slice is visible through the other. append writes in place when the resulting length fits in the capacity, and otherwise copies into a new, larger array, so always use the slice that append returns.

**card:c33:short** (хеш текста `a6be640d`)

> A typed nil inside an interface is not really nil. For example, if a function returns a nil pointer to My Error as error, the caller sees that err is not nil, and success looks like a failure. An interface value is two words, a type word and a data word, and it is nil only when both are nil; here the type word holds pointer to My Error and only the data word is nil. So return a literal nil when there is no error, not a typed nil pointer.

**card:c34:short** (хеш текста `1c250450`)

> Say we have a Counter whose Set method has a pointer receiver, and a Setter interface with Set. Calling the method and satisfying the interface follow different rules: c dot Set compiles on a Counter variable, but var s Setter equals c does not. The call works because Go rewrites it as: take the address of c, then call Set, which needs an addressable value: an element of map of K to Counter or a function result of type Counter cannot do it, while a pointer to Counter needs no address. The assignment fails because interfaces check method sets: Counter's has only its value-receiver methods, the method set of pointer to Counter has both.

**card:c35:short** (хеш текста `f06df0f0`)

> defer schedules a call for when the surrounding function returns or panics, so cleanup such as closing a file or unlocking a mutex sits right next to the code that needs it. Deferred calls run in last-in, first-out order, and their arguments are evaluated at the defer statement. They run after the results are set, so a deferred closure can still change a named result. A panic unwinds the stack and runs those deferred calls; recover stops it only when called directly in a deferred function of the panicking goroutine, and an unrecovered panic in any goroutine crashes the program.

**card:c39:jvm** (хеш текста `50ac7db6`)

> Unlike Java exceptions, Go errors are ordinary return values: no stack unwinding, no checked exceptions and, by default, no stack trace. Wrapping with percent w is like passing a cause to an exception's constructor, errors dot Is and errors dot As are like walking the get-Cause chain with equals or instance-of, and errors dot Join is roughly Java's add-Suppressed.

**card:c39:short** (хеш текста `94843ccb`)

> In Go an error is a value that travels up the call stack, and each layer adds context to it. You wrap it with F-M-T dot Error-f and percent w: the message gets the context, and the original error stays inside. Higher up, errors dot Is asks whether this is a known error, such as Err Not Found, even when it is wrapped. errors dot As asks whether there is an error of a given type inside, such as pointer to Query Error, and hands you the first match so you can read its fields. errors dot Join, Go one 20, combines several errors into one that Is and As can still search.

**card:c40:short** (хеш текста `dc7b71a1`)

> Every type in Go has a zero value: var n int gives you zero, and you get the empty string for strings, false for bools, nil for pointers, slices, maps, channels, funcs and interfaces, and zeroed elements and fields for arrays and structs. Safe: a nil slice works like an empty one for len, range and append, and reading a nil map returns the zero value. Not safe: assigning to a nil map, m of k equals v, panics, and a nil channel blocks forever on send or receive and panics on close. Good types make the zero value useful: sync dot Mutex and strings dot Builder work without any setup.

**card:c47:short** (хеш текста `cf718838`)

> In Go you talk to a database through database/sql, and the main object is a pointer to sql dot D-B. It is a connection pool, not a single connection: get it once from sql dot Open at startup, share it, since it is safe for concurrent use, and set limits. Pass the request context to every query with Query Context and Exec Context. Leaks come from objects that hold a connection: a Rows holds one until it is closed, so after checking the query error, defer rows dot Close and check rows dot Err after the loop. A transaction pins one connection: Begin Tx with ctx and nil, check the error, defer tx dot Rollback, run every statement on tx, then Commit.

**plan:w1-mon-1** (хеш текста `851cb195`)

> Go has two ways to declare a variable: var x T declares one with its zero value and also works at package level. x colon-equals expression is the short declaration, used inside a function: it infers the type and must declare at least one new variable on the left. Deferred calls run when the surrounding function returns, last in, first out, and their arguments are evaluated when the defer statement runs.

**plan:w1-tue-1** (хеш текста `38f74df7`)

> A closure captures a variable, not a copy of its value. So if closures created in a loop all print the same final value, they share one variable, and a later change is visible inside each of them. Since Go one 22, in modules declaring Go one 22 or later, a variable declared by the loop, as in for i colon-equals range, is new in each iteration, so those closures no longer share it. A variable declared before the loop and assigned with for i equals range is still one variable shared by all iterations.

**plan:w1-tue-3** (хеш текста `030d392b`)

> I store money as int sixty-four minor units with a currency code, so twelve euros fifty is stored as one thousand two hundred fifty. float sixty-four cannot represent most decimal fractions exactly, and rounding errors accumulate in sums. String splits major and minor units: one thousand two hundred fifty prints as twelve point five zero E-U-R, and five prints as zero point zero five E-U-R. I format the absolute value and prepend the sign, so minus five prints as minus zero point zero five E-U-R. The number of minor digits belongs to the currency: yen has none and some currencies have three, so I don't hard-code a hundred.

**plan:w1-wed-2** (хеш текста `b4aba892`)

> A typed nil inside an interface is not really nil: returning a nil pointer to My Err as error gives the caller a non-nil error, because an interface value holds a dynamic type and a value and is nil only when both are nil. Service's method set has only its value-receiver methods; the method set of pointer to Service has both. So if Notify has a pointer receiver, pointer to Service implements the interface and Service does not. Calling v dot Notify on a Service variable is only shorthand for taking the address of v, then calling Notify; an element of map of K to Service or a function result of type Service cannot be called that way, while an element of map of K to pointer to Service or a result of type pointer to Service can.

**practice:p-deferpanic:talk** (хеш текста `b4a6387c`)

> Deferred calls run when the function returns, last in, first out, so three defers in a loop run as 3, 2, 1. Safe Div defers a closure that calls recover; if the division panicked, recover returns the panic value and the closure assigns an error to the named err result, so the caller gets an ordinary error. This only works in the same goroutine. For expected failures I would return an error directly; recover is for boundaries such as a request handler.

**practice:p-money:talk** (хеш текста `b61d10ca`)

> I store money as an int sixty-four number of minor units plus a currency code, so twelve euros fifty is one thousand two hundred fifty. Integers keep sums exact, while float sixty-four cannot represent most decimal fractions. String formats the absolute value as whole units and zero-padded minor units, then puts the sign in front, so minus five cents prints as minus zero point zero five E-U-R. The number of decimals belongs to the currency: yen has none and the Bahraini dinar has three, so I look it up instead of hard-coding a hundred.

**card:c2:jvm** (хеш текста `d55f6cf5`)

> Same as in Java: synchronized getters and setters make each call safe but not a check-then-act sequence. You need one lock around both steps, or a compare-and-set loop, just like with Atomic Long.

**card:c2:short** (хеш текста `c88f5462`)

> Yes, for example in a bank app: two withdrawals can both pass the balance check even when every read and write is locked, and that is a race condition without a data race. A race condition is a timing-dependent logic bug; a data race is narrower: unsynchronized access to the same memory with at least one write, which -race can detect. Here the check and the withdrawal take the lock separately, a check-then-act, so they must become one atomic step, for example one critical section.

**card:c7:jvm** (хеш текста `a6d2eb45`)

> Unlike a Java thread-pool size, Go max procs limits neither the number of goroutines nor the number of threads; it limits parallel Go execution. It is closer to the parallelism of the Fork Join Pool that carries Java virtual threads.

**card:c28:jvm** (хеш текста `88dc8fc3`)

> Java's G1 uses a snapshot-at-the-beginning barrier, which matches only the deletion half of Go's; it needs no insertion half because it scans thread stacks in a stop-the-world pause, while Go scans stacks concurrently. G1 also needs card marking because it is generational and moves objects; Go's collector does neither.

**card:c28:short** (хеш текста `7fbb7bbc`)

> The hybrid write barrier is code the compiler adds to pointer writes outside the stack; while the G-C marks, it keeps the running program from hiding a live object. The danger: your code copies the only pointer to an unmarked object into an already scanned object and overwrites the original, so the G-C would free a live object. The barrier shades the old target of the write and, while the current stack is grey, the new one too: a deletion and an insertion barrier combined, hence hybrid. So stack writes need no barrier, and each stack is scanned once.

**card:c33:jvm** (хеш текста `237b35d0`)

> Java has no such trap: a reference is either null or points to an object. In Go an interface carries its dynamic type separately from the value, so a nil pointer of type T and no value at all are different.

**card:c34:jvm** (хеш текста `7587119e`)

> Java has no value receivers: every method sees the object through a reference. In Go, choosing a value or a pointer receiver decides both whether the method can change the receiver and which interfaces the type satisfies.

**card:c35:jvm** (хеш текста `70df987e`)

> defer is like finally or try-with-resources, but it is per function, not per block, so a defer inside a loop runs only when the function returns. recover is like catch, but it works only in a deferred function and only for its own goroutine; an uncaught panic in any goroutine kills the whole process.

**card:c40:jvm** (хеш текста `9ab9a803`)

> In Java a reference field starts as null; in Go many types are usable at their zero value: an empty string instead of null, a ready Mutex or Builder. But writing to a nil map or dereferencing a nil pointer still panics, and Go has no compile-time null safety like Kotlin's nullable T: any pointer, slice, map, channel, function or interface may be nil.

**card:c47:jvm** (хеш текста `774abf85`)

> pointer to sql dot D-B is the pooled Data Source, like Hikari CP behind J-D-B-C, not a single Connection. Without try-with-resources, Go relies on defer rows dot Close and defer tx dot Rollback; defer runs at function exit, not at the end of a block, so inside a loop move the body into a helper function.

**plan:w1-sat-1** (хеш текста `125e4582`)

> It comes down to method sets: var underscore Notifier equals a Service literal fails to compile when Notify has a pointer receiver, because the method set of Service does not include it; address of a Service literal works. The rule comes from the spec. The usual motivation: an interface stores a copy, and that copy is not addressable, so a pointer method would have nothing to point to and could not modify the caller's value.

**plan:w1-sat-2** (хеш текста `6bff937d`)

> Every declared variable starts at its zero value: var n int is zero, var s string is the empty string, var ok bool is false, and a pointer, slice, map, channel, func or interface declared without a value is nil; struct fields are zeroed too. A nil slice works with len, append and range. Reading a nil map returns the zero value, but assigning to it, m of k equals v, panics. Sending to or receiving from a nil channel blocks forever. Map keys must be comparable, so slices, maps and functions cannot be keys.

**plan:w1-thu-1** (хеш текста `9a4045da`)

> I use a sentinel error when callers only branch on a fixed condition, and a typed error when they need details such as the invalid field. With percent w the cause stays in the chain; with percent v it becomes plain text, so errors dot Is and errors dot As stop matching. errors dot Join, since Go one 20, combines several errors, and Is and As check each of them.

**plan:w1-thu-2** (хеш текста `93c596a8`)

> defer schedules cleanup for when the function returns; deferred calls run in last-in-first-out order, but their arguments are evaluated when the defer statement executes. A deferred closure can read and change named results after the return statement has set them; with unnamed results it cannot change the returned value.

**plan:w1-thu-4** (хеш текста `6ceaff76`)

> A panic unwinds the stack and runs deferred calls, and recover stops it only when it is called directly by a deferred function in the goroutine that is panicking. Safe Div defers a function that recovers and turns the panic into an error by assigning to the named err result. A panic in another goroutine is not caught here and crashes the program unless that goroutine recovers it. For expected failures I return errors; panic is for programmer errors.

**plan:w1-wed-1** (хеш текста `90c56110`)

> A type switch branches on the dynamic type stored in an interface: switch v colon-equals x dot type runs the first case whose type matches it; in a case listing exactly one type, v already has that type, otherwise v keeps the type of x. Stringer is the F-M-T interface with a String method that returns a string; F-M-T uses it for percent v and percent s, which is how a type controls its printed form.

**plan:w1-wed-3** (хеш текста `3f00ed4f`)

> I wrap errors with F-M-T dot Error-f, withdraw: percent w, err, to add context while keeping the cause. errors dot Is walks the chain and compares with a sentinel such as Err Insufficient Funds; errors dot As finds the first error of the target type, such as pointer to Validation Error, and lets me read its fields. A test should check both after one and after two levels of wrapping.

**practice:p-account:talk** (хеш текста `b14fd304`)

> Deposit and Withdraw change the account, so they have pointer receivers; with value receivers they would change a copy. Insufficient funds is a sentinel error, because callers only need to branch on that condition. I wrap it with percent w and add the amount and the account, so the message is useful and errors dot Is still finds the cause. Transfer wraps once more, and a test checks that errors dot Is works through both levels and that a failed operation leaves the balances unchanged.

**practice:p-validation:talk** (хеш текста `e40edb65`)

> I return a typed error when the caller needs data, here the name of the invalid field. Validation Error implements error on a pointer receiver, so I return a pointer and the caller uses errors dot As with a pointer to Validation Error target. Register wraps it with percent w, so errors dot As still finds it, even through errors dot Join. When the user is valid I return a literal nil, because a nil pointer stored in an error interface is not a nil error.

