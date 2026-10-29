# Приёмка озвучки на слух — неделя 1

Сгенерировано из `data/audio.js` (25 текстов × 2 голоса). Записи проверены только машинно: файлы есть, декодируются, хеш совпадает с текущим текстом. **На слух ни одна запись ещё не принята.**

Как проверять каждую запись (Michael и Heart отдельно):

1. Прослушать, не глядя на экран, и пересказать смысл.
2. Сверить с текстом на экране: API, числа, отрицание, существенное условие.
3. Отметить неестественные паузы, темп, обрезанное начало или конец, ударения в терминах.
4. Если нужна правка — записать точный фрагмент и желаемое чтение в «Комментарий».

Сначала — строки с «риском». Отметки: ✅ принято, ✏️ нужна правка. Правки произношения вносятся в `SPEECH_FIXES` (`scripts/gen-audio.mjs`), пересоздаются только затронутые записи.

| Ключ | Голос | с | Риск | Термины | Числа | Условие слышно | Паузы/темп | Итог | Комментарий |
|---|---|---|---|---|---|---|---|---|---|
| [card:c33:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Michael | 26.0 | `*MyError`, «err is not nil» |  |  |  |  |  |  |
| [card:c33:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Heart | 26.2 | `*MyError`, «err is not nil» |  |  |  |  |  |  |
| [card:c34:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Michael | 34.4 | `*Counter`, `(&c).Set()`, `map[K]Counter` |  |  |  |  |  |  |
| [card:c34:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Heart | 35.3 | `*Counter`, `(&c).Set()`, `map[K]Counter` |  |  |  |  |  |  |
| [card:c35:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Michael | 26.7 | «directly», «panicking goroutine» |  |  |  |  |  |  |
| [card:c35:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Heart | 27.8 | «directly», «panicking goroutine» |  |  |  |  |  |  |
| [card:c39:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Michael | 26.0 | `getCause`, `addSuppressed` |  |  |  |  |  |  |
| [card:c39:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Heart | 26.5 | `getCause`, `addSuppressed` |  |  |  |  |  |  |
| [card:c39:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Michael | 43.0 | `fmt.Errorf`, `%w`, `io.EOF`, Go 1.20 |  |  |  |  |  |  |
| [card:c39:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39) | Heart | 43.5 | `fmt.Errorf`, `%w`, `io.EOF`, Go 1.20 |  |  |  |  |  |  |
| [card:c40:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Michael | 40.8 | `nil`, пустая строка, длинное перечисление |  |  |  |  |  |  |
| [card:c40:short](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Heart | 41.5 | `nil`, пустая строка, длинное перечисление |  |  |  |  |  |  |
| [plan:w1-mon-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/mon) | Michael | 25.7 | `x := expr` |  |  |  |  |  |  |
| [plan:w1-mon-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/mon) | Heart | 26.0 | `x := expr` |  |  |  |  |  |  |
| [plan:w1-tue-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Michael | 35.8 | `for i := range` против `for i = range` |  |  |  |  |  |  |
| [plan:w1-tue-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Heart | 36.5 | `for i := range` против `for i = range` |  |  |  |  |  |  |
| [plan:w1-tue-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Michael | 44.4 | 12.50 EUR, 1250, −0.05 EUR |  |  |  |  |  |  |
| [plan:w1-tue-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/tue) | Heart | 45.0 | 12.50 EUR, 1250, −0.05 EUR |  |  |  |  |  |  |
| [plan:w1-wed-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 47.3 | `*Service`, `(&v).Notify()`, `map[K]*Service` |  |  |  |  |  |  |
| [plan:w1-wed-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 48.6 | `*Service`, `(&v).Notify()`, `map[K]*Service` |  |  |  |  |  |  |
| [practice:p-deferpanic:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic) | Michael | 29.9 | «same goroutine», 3, 2, 1 |  |  |  |  |  |  |
| [practice:p-deferpanic:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic) | Heart | 30.4 | «same goroutine», 3, 2, 1 |  |  |  |  |  |  |
| [practice:p-money:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money) | Michael | 38.8 | 12.50 EUR, −0.05 EUR |  |  |  |  |  |  |
| [practice:p-money:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money) | Heart | 39.4 | 12.50 EUR, −0.05 EUR |  |  |  |  |  |  |
| [card:c33:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Michael | 14.4 |  |  |  |  |  |  |  |
| [card:c33:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33) | Heart | 15.3 |  |  |  |  |  |  |  |
| [card:c34:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Michael | 15.8 |  |  |  |  |  |  |  |
| [card:c34:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34) | Heart | 16.1 |  |  |  |  |  |  |  |
| [card:c35:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Michael | 21.4 |  |  |  |  |  |  |  |
| [card:c35:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35) | Heart | 21.7 |  |  |  |  |  |  |  |
| [card:c40:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Michael | 24.5 |  |  |  |  |  |  |  |
| [card:c40:jvm](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40) | Heart | 25.2 |  |  |  |  |  |  |  |
| [plan:w1-sat-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Michael | 26.0 |  |  |  |  |  |  |  |
| [plan:w1-sat-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Heart | 26.5 |  |  |  |  |  |  |  |
| [plan:w1-sat-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Michael | 35.0 |  |  |  |  |  |  |  |
| [plan:w1-sat-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/sat) | Heart | 36.2 |  |  |  |  |  |  |  |
| [plan:w1-thu-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 25.3 |  |  |  |  |  |  |  |
| [plan:w1-thu-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 25.4 |  |  |  |  |  |  |  |
| [plan:w1-thu-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 20.2 |  |  |  |  |  |  |  |
| [plan:w1-thu-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 20.5 |  |  |  |  |  |  |  |
| [plan:w1-thu-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Michael | 26.9 |  |  |  |  |  |  |  |
| [plan:w1-thu-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/thu) | Heart | 28.5 |  |  |  |  |  |  |  |
| [plan:w1-wed-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 26.1 |  |  |  |  |  |  |  |
| [plan:w1-wed-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 26.5 |  |  |  |  |  |  |  |
| [plan:w1-wed-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Michael | 26.3 |  |  |  |  |  |  |  |
| [plan:w1-wed-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan/w1/wed) | Heart | 26.4 |  |  |  |  |  |  |  |
| [practice:p-account:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account) | Michael | 33.2 |  |  |  |  |  |  |  |
| [practice:p-account:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account) | Heart | 34.3 |  |  |  |  |  |  |  |
| [practice:p-validation:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation) | Michael | 29.6 |  |  |  |  |  |  |  |
| [practice:p-validation:talk](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation) | Heart | 30.3 |  |  |  |  |  |  |  |

## Что читает синтезатор

Текст для речи отличается от экранного только чтением кода и чисел. Если смысл расходится с экраном — это ошибка, её нужно отметить.

**card:c33:short** (хеш текста `e91bd11e`)

> If a function returns a nil pointer to My Error as error, the caller gets a non-nil error: err is not nil, and success looks like a failure. An interface value is two words, a type word and a data word, and it is nil only when both are nil; here the type word holds pointer to My Error and only the data word is nil. So return a literal nil when there is no error, not a typed nil pointer.

**card:c34:short** (хеш текста `5169dc8b`)

> If Set has a pointer receiver, c dot Set compiles on a Counter variable, but var s Setter equals c does not. The call works because Go rewrites it as: take the address of c, then call Set, which needs an addressable value: an element of map of K to Counter or a function result of type Counter cannot do it, while a pointer to Counter needs no address. The assignment fails because interfaces check method sets: Counter's has only its value-receiver methods, the method set of pointer to Counter has both.

**card:c35:short** (хеш текста `0169abc5`)

> Deferred calls run when the surrounding function returns or panics, in last-in, first-out order, and their arguments are evaluated at the defer statement. They run after the results are set, so a deferred closure can still change a named result. recover stops a panic only when called directly in a deferred function of the panicking goroutine, and an unrecovered panic in any goroutine crashes the program.

**card:c39:jvm** (хеш текста `50ac7db6`)

> Unlike Java exceptions, Go errors are ordinary return values: no stack unwinding, no checked exceptions and, by default, no stack trace. Wrapping with percent w is like passing a cause to an exception's constructor, errors dot Is and errors dot As are like walking the get-Cause chain with equals or instance-of, and errors dot Join is roughly Java's add-Suppressed.

**card:c39:short** (хеш текста `2680f6c5`)

> An error starts at a low-level call, for example a query that returns Err Not Found, and each layer passes it up with context: F-M-T dot Error-f, load user 7: percent w, err, keeps the original inside. errors dot Is, of err and Err Not Found, asks: is this exact value anywhere in the chain?, and sentinels like I-O dot E-O-F are checked the same way. errors dot As, of err and address of qe, asks: is there a pointer to Query Error in the chain? and stores it in qe, so you can read its fields. errors dot Join, Go one 20, combines several errors, and Is and As still search each of them.

**card:c40:short** (хеш текста `d6992e43`)

> var n int is zero, var s string is the empty string, var ok bool is false, and a pointer, slice, map, channel, func or interface declared without a value is nil; every array element and struct field is zeroed. A nil slice works like an empty one for len, range and append; reading a nil map returns the zero value, but assigning to it, m of k equals v, panics; sending to or receiving from a nil channel blocks forever, and close panics. Good types make the zero value useful: var mu sync dot Mutex and var b strings dot Builder are ready to use.

**plan:w1-mon-1** (хеш текста `44168530`)

> var x T declares a variable with its zero value and also works at package level. x colon-equals expression is the short declaration, used inside a function: it infers the type and must declare at least one new variable on the left. Deferred calls run when the surrounding function returns, last in, first out, and their arguments are evaluated when the defer statement runs.

**plan:w1-tue-1** (хеш текста `6b9341cf`)

> If closures created in a loop all print the same final value, they share one variable: a closure refers to the variable itself, not a copy, so a later change is visible inside it. Since Go one 22, in modules declaring Go one 22 or later, a variable declared by the loop, as in for i colon-equals range, is new in each iteration, so those closures no longer share it. A variable declared before the loop and assigned with for i equals range is still one variable shared by all iterations.

**plan:w1-tue-3** (хеш текста `030d392b`)

> I store money as int sixty-four minor units with a currency code, so twelve euros fifty is stored as one thousand two hundred fifty. float sixty-four cannot represent most decimal fractions exactly, and rounding errors accumulate in sums. String splits major and minor units: one thousand two hundred fifty prints as twelve point five zero E-U-R, and five prints as zero point zero five E-U-R. I format the absolute value and prepend the sign, so minus five prints as minus zero point zero five E-U-R. The number of minor digits belongs to the currency: yen has none and some currencies have three, so I don't hard-code a hundred.

**plan:w1-wed-2** (хеш текста `6d886797`)

> Returning a nil pointer to My Err as error gives the caller a non-nil error, because an interface value holds a dynamic type and a value and is nil only when both are nil. Service's method set has only its value-receiver methods; the method set of pointer to Service has both. So if Notify has a pointer receiver, pointer to Service implements the interface and Service does not. Calling v dot Notify on a Service variable is only shorthand for taking the address of v, then calling Notify; an element of map of K to Service or a function result of type Service cannot be called that way, while an element of map of K to pointer to Service or a result of type pointer to Service can.

**practice:p-deferpanic:talk** (хеш текста `b4a6387c`)

> Deferred calls run when the function returns, last in, first out, so three defers in a loop run as 3, 2, 1. Safe Div defers a closure that calls recover; if the division panicked, recover returns the panic value and the closure assigns an error to the named err result, so the caller gets an ordinary error. This only works in the same goroutine. For expected failures I would return an error directly; recover is for boundaries such as a request handler.

**practice:p-money:talk** (хеш текста `b61d10ca`)

> I store money as an int sixty-four number of minor units plus a currency code, so twelve euros fifty is one thousand two hundred fifty. Integers keep sums exact, while float sixty-four cannot represent most decimal fractions. String formats the absolute value as whole units and zero-padded minor units, then puts the sign in front, so minus five cents prints as minus zero point zero five E-U-R. The number of decimals belongs to the currency: yen has none and the Bahraini dinar has three, so I look it up instead of hard-coding a hundred.

**card:c33:jvm** (хеш текста `237b35d0`)

> Java has no such trap: a reference is either null or points to an object. In Go an interface carries its dynamic type separately from the value, so a nil pointer of type T and no value at all are different.

**card:c34:jvm** (хеш текста `7587119e`)

> Java has no value receivers: every method sees the object through a reference. In Go, choosing a value or a pointer receiver decides both whether the method can change the receiver and which interfaces the type satisfies.

**card:c35:jvm** (хеш текста `70df987e`)

> defer is like finally or try-with-resources, but it is per function, not per block, so a defer inside a loop runs only when the function returns. recover is like catch, but it works only in a deferred function and only for its own goroutine; an uncaught panic in any goroutine kills the whole process.

**card:c40:jvm** (хеш текста `9ab9a803`)

> In Java a reference field starts as null; in Go many types are usable at their zero value: an empty string instead of null, a ready Mutex or Builder. But writing to a nil map or dereferencing a nil pointer still panics, and Go has no compile-time null safety like Kotlin's nullable T: any pointer, slice, map, channel, function or interface may be nil.

**plan:w1-sat-1** (хеш текста `f621909f`)

> var underscore Notifier equals a Service literal fails to compile when Notify has a pointer receiver, because the method set of Service does not include it; address of a Service literal works. The rule comes from the spec. The usual motivation: an interface stores a copy, and that copy is not addressable, so a pointer method would have nothing to point to and could not modify the caller's value.

**plan:w1-sat-2** (хеш текста `f5349fdf`)

> var n int is zero, var s string is the empty string, var ok bool is false, and a pointer, slice, map, channel, func or interface declared without a value is nil; struct fields are zeroed too. A nil slice works with len, append and range. Reading a nil map returns the zero value, but assigning to it, m of k equals v, panics. Sending to or receiving from a nil channel blocks forever. Map keys must be comparable, so slices, maps and functions cannot be keys.

**plan:w1-thu-1** (хеш текста `9a4045da`)

> I use a sentinel error when callers only branch on a fixed condition, and a typed error when they need details such as the invalid field. With percent w the cause stays in the chain; with percent v it becomes plain text, so errors dot Is and errors dot As stop matching. errors dot Join, since Go one 20, combines several errors, and Is and As check each of them.

**plan:w1-thu-2** (хеш текста `cc5615e8`)

> Deferred calls run in last-in-first-out order when the function returns, but their arguments are evaluated when the defer statement executes. A deferred closure can read and change named results after the return statement has set them; with unnamed results it cannot change the returned value.

**plan:w1-thu-4** (хеш текста `416b4096`)

> recover stops a panic only when it is called directly by a deferred function in the goroutine that is panicking. Safe Div defers a function that recovers and turns the panic into an error by assigning to the named err result. A panic in another goroutine is not caught here and crashes the program unless that goroutine recovers it. For expected failures I return errors; panic is for programmer errors.

**plan:w1-wed-1** (хеш текста `ff1f007d`)

> switch v colon-equals x dot type runs the first case whose type matches the dynamic type stored in the interface x; in a case listing exactly one type, v already has that type, otherwise v keeps the type of x. Stringer is the F-M-T interface with a String method that returns a string; F-M-T uses it for percent v and percent s, which is how a type controls its printed form.

**plan:w1-wed-3** (хеш текста `3f00ed4f`)

> I wrap errors with F-M-T dot Error-f, withdraw: percent w, err, to add context while keeping the cause. errors dot Is walks the chain and compares with a sentinel such as Err Insufficient Funds; errors dot As finds the first error of the target type, such as pointer to Validation Error, and lets me read its fields. A test should check both after one and after two levels of wrapping.

**practice:p-account:talk** (хеш текста `b14fd304`)

> Deposit and Withdraw change the account, so they have pointer receivers; with value receivers they would change a copy. Insufficient funds is a sentinel error, because callers only need to branch on that condition. I wrap it with percent w and add the amount and the account, so the message is useful and errors dot Is still finds the cause. Transfer wraps once more, and a test checks that errors dot Is works through both levels and that a failed operation leaves the balances unchanged.

**practice:p-validation:talk** (хеш текста `e40edb65`)

> I return a typed error when the caller needs data, here the name of the invalid field. Validation Error implements error on a pointer receiver, so I return a pointer and the caller uses errors dot As with a pointer to Validation Error target. Register wraps it with percent w, so errors dot As still finds it, even through errors dot Join. When the user is valid I return a literal nil, because a nil pointer stored in an error interface is not a nil error.

