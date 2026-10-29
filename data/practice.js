// Практикум: задачи с заготовкой, тестами и эталоном. Сгенерировано из docs/verification/fixtures/practice
// (там же эталоны и тесты проверены: go vet, go test -race). scripts/check-content.mjs сверяет код с этими файлами.
const PRACTICE = [
  {
    "id": "p-money",
    "code": "W1-1",
    "week": 1,
    "title": "Money: сумма в минорных единицах",
    "titleEN": "Money in minor units",
    "goalRU": "Хранить деньги целым числом минорных единиц с кодом валюты и печатать их через String() с нужным числом знаков после точки.",
    "contractRU": [
      "Money{Minor: 1250, Currency: \"EUR\"} печатается как «12.50 EUR», 5 — как «0.05 EUR», 0 — как «0.00 USD».",
      "Отрицательная сумма: знак перед числом, «-12.50 EUR» и «-0.05 EUR».",
      "Число знаков зависит от валюты: JPY — без дробной части («1250 JPY»), BHD — три знака («1.250 BHD»), остальные — два.",
      "Money реализует fmt.Stringer, поэтому fmt.Println и %v печатают ту же строку.",
      "Никакого float64 ни в хранении, ни в форматировании."
    ],
    "contractEN": [
      "Money{Minor: 1250, Currency: \"EUR\"} prints as \"12.50 EUR\", 5 as \"0.05 EUR\", 0 as \"0.00 USD\".",
      "A negative amount gets the sign in front: \"-12.50 EUR\" and \"-0.05 EUR\".",
      "The number of decimals depends on the currency: JPY has none (\"1250 JPY\"), BHD has three (\"1.250 BHD\"), the rest have two.",
      "Money implements fmt.Stringer, so fmt.Println and %v print the same string.",
      "No float64, neither for storage nor for formatting."
    ],
    "planTasks": [
      "w1-tue-3"
    ],
    "links": [
      "c40"
    ],
    "hints": [
      "Целая часть — Minor / 100, дробная — Minor % 100. Как напечатать 5 как «05»? Посмотри на %02d в fmt.",
      "Для -5 деление даёт 0 и -5, и получится «0.-5». Отдели знак: работай с модулем числа, а «-» добавь в начало.",
      "Число знаков храни в таблице map[string]int по валюте; для неизвестной валюты — 2. Ширину поля можно передать аргументом: %0*d."
    ],
    "talkEN": "I store money as an int64 number of minor units plus a currency code, so 12.50 euros is 1250. Integers keep sums exact, while float64 cannot represent most decimal fractions. String formats the absolute value as whole units and zero-padded minor units, then puts the sign in front, so minus five cents prints as -0.05 EUR. The number of decimals belongs to the currency: yen has none and the Bahraini dinar has three, so I look it up instead of hard-coding 100.",
    "pitfalls": [
      "float64 для денег → 0.1 + 0.2 != 0.3, ошибки копятся в суммах.",
      "%d без нулей слева → «0.5 EUR» вместо «0.05 EUR».",
      "Знак через % → «0.-5 EUR» и «-12.-50 EUR».",
      "Делитель 100 зашит в код → JPY и BHD печатаются неверно."
    ],
    "followUps": [
      "Добавь Add(other Money) (Money, error): разные валюты — ошибка, а не молчаливое сложение.",
      "Раздели 100.00 EUR на три части без потери цента: 33.34, 33.33, 33.33.",
      "Что будет с Minor = math.MinInt64 и почему его нельзя просто умножить на -1?"
    ],
    "fixture": "docs/verification/fixtures/practice/money",
    "files": {
      "starter": {
        "name": "money.go",
        "code": "// Package money: practice task W1-1. Replace the TODO with your solution.\npackage money\n\n// Money is an amount in minor units (cents) plus an ISO currency code.\ntype Money struct {\n\tMinor    int64\n\tCurrency string\n}\n\n// String formats the amount with the currency's number of decimals:\n// 1250 EUR → \"12.50 EUR\", -5 EUR → \"-0.05 EUR\", 1250 JPY → \"1250 JPY\", 1250 BHD → \"1.250 BHD\".\n// Currencies other than JPY (0 decimals) and BHD (3 decimals) use 2 decimals.\nfunc (m Money) String() string {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "money_test.go",
        "code": "package money\n\nimport \"testing\"\n\nfunc TestString(t *testing.T) {\n\ttests := []struct {\n\t\tname string\n\t\tin   Money\n\t\twant string\n\t}{\n\t\t{\"whole and cents\", Money{1250, \"EUR\"}, \"12.50 EUR\"},\n\t\t{\"only cents\", Money{5, \"EUR\"}, \"0.05 EUR\"},\n\t\t{\"zero\", Money{0, \"USD\"}, \"0.00 USD\"},\n\t\t{\"negative\", Money{-1250, \"EUR\"}, \"-12.50 EUR\"},\n\t\t{\"negative below one\", Money{-5, \"EUR\"}, \"-0.05 EUR\"},\n\t\t{\"no minor units\", Money{1250, \"JPY\"}, \"1250 JPY\"},\n\t\t{\"three decimals\", Money{1250, \"BHD\"}, \"1.250 BHD\"},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tif got := tt.in.String(); got != tt.want {\n\t\t\t\tt.Errorf(\"String() = %q, want %q\", got, tt.want)\n\t\t\t}\n\t\t})\n\t}\n}\n\n// Money implements fmt.Stringer, so %v and Println use String.\nfunc TestStringer(t *testing.T) {\n\tvar _ interface{ String() string } = Money{}\n}"
      },
      "solution": {
        "name": "money.go",
        "code": "// Package money is the reference solution for practice task W1-1.\npackage money\n\nimport \"fmt\"\n\n// Money is an amount in minor units (cents) plus an ISO currency code.\n// Integers keep sums exact; float64 cannot represent 0.10 exactly.\ntype Money struct {\n\tMinor    int64\n\tCurrency string\n}\n\n// digits is the number of minor-unit digits per currency; unknown codes use 2.\nvar digits = map[string]int{\"JPY\": 0, \"BHD\": 3}\n\nfunc pow10(n int) int64 {\n\tp := int64(1)\n\tfor range n {\n\t\tp *= 10\n\t}\n\treturn p\n}\n\n// String formats the amount with the currency's number of decimals: 1250 EUR → \"12.50 EUR\".\nfunc (m Money) String() string {\n\td, ok := digits[m.Currency]\n\tif !ok {\n\t\td = 2\n\t}\n\tsign := \"\"\n\tv := m.Minor\n\tif v < 0 {\n\t\tsign = \"-\"\n\t\tv = -v // note: math.MinInt64 cannot be negated; amounts here are far smaller\n\t}\n\tif d == 0 {\n\t\treturn fmt.Sprintf(\"%s%d %s\", sign, v, m.Currency)\n\t}\n\tunit := pow10(d)\n\treturn fmt.Sprintf(\"%s%d.%0*d %s\", sign, v/unit, d, v%unit, m.Currency)\n}"
      }
    }
  },
  {
    "id": "p-account",
    "code": "W1-2",
    "week": 1,
    "title": "Account: pointer receiver и sentinel-ошибка",
    "titleEN": "Account with a sentinel error",
    "goalRU": "Счёт с Deposit, Withdraw и Transfer: методы меняют состояние, а нехватка средств — sentinel-ошибка, которую errors.Is находит через две обёртки.",
    "contractRU": [
      "Deposit и Withdraw с суммой 0 или меньше возвращают ошибку и не меняют баланс.",
      "Withdraw больше баланса возвращает ошибку, обёрнутую через %w вокруг ErrInsufficientFunds; в тексте есть сумма и счёт; баланс не меняется.",
      "Ошибка не равна самой ErrInsufficientFunds: у неё есть контекст, но errors.Is её находит.",
      "Transfer добавляет второй уровень контекста «transfer A→B: …»; при ошибке балансы обоих счетов прежние.",
      "Методы меняют счёт, поэтому ресивер — указатель."
    ],
    "contractEN": [
      "Deposit and Withdraw with an amount of 0 or less return an error and leave the balance unchanged.",
      "Withdrawing more than the balance returns an error that wraps ErrInsufficientFunds with %w; the message names the amount and the account; the balance does not change.",
      "The error is not ErrInsufficientFunds itself: it carries context, yet errors.Is finds it.",
      "Transfer adds a second level of context, \"transfer A→B: …\"; on failure both balances stay as they were.",
      "The methods change the account, so the receiver is a pointer."
    ],
    "planTasks": [
      "w1-wed-3",
      "w2-thu-3"
    ],
    "links": [
      "c39",
      "q29",
      "c34"
    ],
    "hints": [
      "Сначала проверь сумму, потом баланс, и только затем меняй состояние: при любой ошибке баланс должен остаться прежним.",
      "fmt.Errorf(\"withdraw %d from %s (balance %d): %w\", …, ErrInsufficientFunds) — контекст плюс причина в цепочке.",
      "Transfer оборачивает ошибку Withdraw ещё раз через %w. Если Deposit на втором счёте не удался, деньги нужно вернуть на первый."
    ],
    "talkEN": "Deposit and Withdraw change the account, so they have pointer receivers; with value receivers they would change a copy. Insufficient funds is a sentinel error, because callers only need to branch on that condition. I wrap it with %w and add the amount and the account, so the message is useful and errors.Is still finds the cause. Transfer wraps once more, and a test checks that errors.Is works through both levels and that a failed operation leaves the balances unchanged.",
    "pitfalls": [
      "Ресивер-значение → Deposit меняет копию, баланс вызывающего не растёт.",
      "%v вместо %w → errors.Is перестаёт находить ErrInsufficientFunds.",
      "Сравнение err == ErrInsufficientFunds → ломается после первой обёртки.",
      "Баланс меняется до проверки → после ошибки состояние уже испорчено."
    ],
    "followUps": [
      "Сделай счёт безопасным для нескольких горутин: где нужен sync.Mutex и почему Transfer между двумя счетами может дать deadlock?",
      "Добавь ErrAccountClosed и проверь, что errors.Is различает обе причины.",
      "Верни из Withdraw ошибку-тип с полями Need и Have — что изменится у вызывающего?"
    ],
    "fixture": "docs/verification/fixtures/practice/account",
    "files": {
      "starter": {
        "name": "account.go",
        "code": "// Package account: practice task W1-2. Replace each TODO with your solution.\npackage account\n\nimport \"errors\"\n\n// ErrInsufficientFunds is a sentinel: callers check the condition with errors.Is.\nvar ErrInsufficientFunds = errors.New(\"insufficient funds\")\n\n// Account balance is in minor units.\ntype Account struct {\n\tID      string\n\tbalance int64\n}\n\n// TODO: choose the receiver for each method: they change the account.\n\nfunc (a *Account) Balance() int64 { return a.balance }\n\n// Deposit adds amount; it must be positive.\nfunc (a *Account) Deposit(amount int64) error {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Withdraw takes amount if the balance allows it; otherwise it returns an error\n// that wraps ErrInsufficientFunds and says which amount and account.\nfunc (a *Account) Withdraw(amount int64) error {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Transfer moves amount between accounts. Its error starts with\n// \"transfer A→B: \" and still matches ErrInsufficientFunds with errors.Is.\nfunc Transfer(from, to *Account, amount int64) error {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "account_test.go",
        "code": "package account\n\nimport (\n\t\"errors\"\n\t\"strings\"\n\t\"testing\"\n)\n\nfunc TestDepositWithdraw(t *testing.T) {\n\ta := &Account{ID: \"A\"}\n\tif err := a.Deposit(1000); err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif err := a.Withdraw(300); err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif got := a.Balance(); got != 700 {\n\t\tt.Fatalf(\"Balance() = %d, want 700\", got)\n\t}\n}\n\nfunc TestInvalidAmounts(t *testing.T) {\n\ta := &Account{ID: \"A\"}\n\tfor _, amount := range []int64{0, -5} {\n\t\tif err := a.Deposit(amount); err == nil {\n\t\t\tt.Errorf(\"Deposit(%d) succeeded, want an error\", amount)\n\t\t}\n\t\tif err := a.Withdraw(amount); err == nil {\n\t\t\tt.Errorf(\"Withdraw(%d) succeeded, want an error\", amount)\n\t\t}\n\t}\n}\n\nfunc TestInsufficientFundsIsWrapped(t *testing.T) {\n\ta := &Account{ID: \"A\"}\n\ta.Deposit(100)\n\terr := a.Withdraw(500)\n\tif !errors.Is(err, ErrInsufficientFunds) {\n\t\tt.Fatalf(\"errors.Is(%v, ErrInsufficientFunds) = false\", err)\n\t}\n\tif err == ErrInsufficientFunds {\n\t\tt.Fatal(\"the error has no context; wrap it with %w and add the amount and account\")\n\t}\n\tif !strings.Contains(err.Error(), \"500\") {\n\t\tt.Fatalf(\"error %q does not mention the amount\", err)\n\t}\n\tif a.Balance() != 100 {\n\t\tt.Fatalf(\"a failed withdrawal changed the balance to %d\", a.Balance())\n\t}\n}\n\nfunc TestTwoLevelsOfWrapping(t *testing.T) {\n\tfrom, to := &Account{ID: \"A\"}, &Account{ID: \"B\"}\n\tfrom.Deposit(100)\n\terr := Transfer(from, to, 500)\n\tif !errors.Is(err, ErrInsufficientFunds) {\n\t\tt.Fatalf(\"errors.Is through two levels = false for %v\", err)\n\t}\n\tif !strings.HasPrefix(err.Error(), \"transfer A→B: withdraw 500 from A\") {\n\t\tt.Fatalf(\"unexpected message %q\", err)\n\t}\n\tif from.Balance() != 100 || to.Balance() != 0 {\n\t\tt.Fatalf(\"balances changed: %d and %d\", from.Balance(), to.Balance())\n\t}\n}"
      },
      "solution": {
        "name": "account.go",
        "code": "// Package account is the reference solution for practice task W1-2.\npackage account\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\n// ErrInsufficientFunds is a sentinel: callers check the condition with errors.Is.\nvar ErrInsufficientFunds = errors.New(\"insufficient funds\")\n\n// Account balance is in minor units. Methods change the account, so they use a pointer receiver.\ntype Account struct {\n\tID      string\n\tbalance int64\n}\n\nfunc (a *Account) Balance() int64 { return a.balance }\n\n// Deposit adds amount; it must be positive.\nfunc (a *Account) Deposit(amount int64) error {\n\tif amount <= 0 {\n\t\treturn fmt.Errorf(\"deposit %d to %s: amount must be positive\", amount, a.ID)\n\t}\n\ta.balance += amount\n\treturn nil\n}\n\n// Withdraw takes amount if the balance allows it. The error wraps\n// ErrInsufficientFunds with %w, so errors.Is still finds it.\nfunc (a *Account) Withdraw(amount int64) error {\n\tif amount <= 0 {\n\t\treturn fmt.Errorf(\"withdraw %d from %s: amount must be positive\", amount, a.ID)\n\t}\n\tif amount > a.balance {\n\t\treturn fmt.Errorf(\"withdraw %d from %s (balance %d): %w\", amount, a.ID, a.balance, ErrInsufficientFunds)\n\t}\n\ta.balance -= amount\n\treturn nil\n}\n\n// Transfer moves amount between accounts and adds a second level of context.\nfunc Transfer(from, to *Account, amount int64) error {\n\tif err := from.Withdraw(amount); err != nil {\n\t\treturn fmt.Errorf(\"transfer %s→%s: %w\", from.ID, to.ID, err)\n\t}\n\tif err := to.Deposit(amount); err != nil {\n\t\tfrom.balance += amount // undo; a real ledger would use a transaction\n\t\treturn fmt.Errorf(\"transfer %s→%s: %w\", from.ID, to.ID, err)\n\t}\n\treturn nil\n}"
      }
    }
  },
  {
    "id": "p-validation",
    "code": "W1-3",
    "week": 1,
    "title": "ValidationError и errors.As",
    "titleEN": "A typed validation error",
    "goalRU": "Вернуть ошибку-тип с полем, которое вызывающий достаёт через errors.As даже после двух уровней обёртки.",
    "contractRU": [
      "*ValidationError печатается как «invalid <field>: <reason>».",
      "Validate проверяет email (должен содержать @) и возраст (не меньше 18) и возвращает *ValidationError для первого неверного поля.",
      "Для корректного пользователя Validate и Register возвращают обычный nil, а не nil-указатель *ValidationError.",
      "Register добавляет контекст через %w; errors.As достаёт *ValidationError с верным Field.",
      "errors.As работает и через второй уровень — errors.Join с другой ошибкой."
    ],
    "contractEN": [
      "*ValidationError prints as \"invalid <field>: <reason>\".",
      "Validate checks the email (must contain @) and the age (at least 18) and returns a *ValidationError for the first invalid field.",
      "For a valid user, Validate and Register return a plain nil, not a nil *ValidationError.",
      "Register adds context with %w; errors.As extracts the *ValidationError with the right Field.",
      "errors.As also works through a second level: errors.Join with another error."
    ],
    "planTasks": [
      "w1-wed-3"
    ],
    "links": [
      "c39",
      "c33",
      "q2"
    ],
    "hints": [
      "Error() объявлен на *ValidationError, поэтому возвращай &ValidationError{…}, а в errors.As передавай адрес переменной типа *ValidationError.",
      "Не заводи переменную var ve *ValidationError и не возвращай её как error, если ошибок нет: интерфейс с типом и nil-указателем не равен nil (C33, q2).",
      "Register: if err := Validate(u); err != nil { return fmt.Errorf(\"register %q: %w\", u.Email, err) }."
    ],
    "talkEN": "I return a typed error when the caller needs data, here the name of the invalid field. ValidationError implements error on a pointer receiver, so I return a pointer and the caller uses errors.As with a *ValidationError target. Register wraps it with %w, so errors.As still finds it, even through errors.Join. When the user is valid I return a literal nil, because a nil pointer stored in an error interface is not a nil error.",
    "pitfalls": [
      "Возврат nil-указателя *ValidationError как error → err != nil у корректного пользователя.",
      "Приведение err.(*ValidationError) вместо errors.As → не работает после обёртки.",
      "errors.As(err, ve) без & → panic: target must be a non-nil pointer.",
      "%v в Register → цепочка оборвана, errors.As ничего не находит."
    ],
    "followUps": [
      "Собери все ошибки полей, а не только первую: errors.Join или срез — что удобнее вызывающему?",
      "Добавь метод Is(target error) bool, чтобы errors.Is(err, ErrInvalid) находил любую ошибку валидации.",
      "Преобразуй *ValidationError в HTTP 400 с именем поля (это будет на неделе 5)."
    ],
    "fixture": "docs/verification/fixtures/practice/validation",
    "files": {
      "starter": {
        "name": "validation.go",
        "code": "// Package validation: practice task W1-3. Replace each TODO with your solution.\npackage validation\n\n// ValidationError is a typed error: it carries data the caller can read with errors.As.\ntype ValidationError struct {\n\tField  string\n\tReason string\n}\n\n// Error formats \"invalid <field>: <reason>\".\nfunc (e *ValidationError) Error() string {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\ntype User struct {\n\tEmail string\n\tAge   int\n}\n\n// Validate returns a *ValidationError for the first invalid field:\n// email must contain \"@\", age must be at least 18. A valid user gives nil.\nfunc Validate(u User) error {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Register wraps Validate's error with context, keeping it reachable by errors.As.\nfunc Register(u User) error {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "validation_test.go",
        "code": "package validation\n\nimport (\n\t\"errors\"\n\t\"testing\"\n)\n\nfunc TestValid(t *testing.T) {\n\tif err := Register(User{Email: \"a@b.c\", Age: 30}); err != nil {\n\t\tt.Fatalf(\"got %v, want nil\", err)\n\t}\n\t// A nil *ValidationError stored in error would not be == nil.\n\tif err := Validate(User{Email: \"a@b.c\", Age: 30}); err != nil {\n\t\tt.Fatalf(\"Validate returned a non-nil error %#v for a valid user\", err)\n\t}\n}\n\nfunc TestAsExtractsField(t *testing.T) {\n\ttests := []struct {\n\t\tname  string\n\t\tuser  User\n\t\tfield string\n\t}{\n\t\t{\"bad email\", User{Email: \"nope\", Age: 30}, \"email\"},\n\t\t{\"too young\", User{Email: \"a@b.c\", Age: 12}, \"age\"},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\terr := Register(tt.user)\n\t\t\tvar ve *ValidationError\n\t\t\tif !errors.As(err, &ve) {\n\t\t\t\tt.Fatalf(\"errors.As found no *ValidationError in %v\", err)\n\t\t\t}\n\t\t\tif ve.Field != tt.field {\n\t\t\t\tt.Fatalf(\"Field = %q, want %q\", ve.Field, tt.field)\n\t\t\t}\n\t\t})\n\t}\n}\n\nfunc TestTwoLevelsOfWrapping(t *testing.T) {\n\terr := Register(User{Email: \"nope\", Age: 30})\n\touter := errors.Join(errors.New(\"batch item 3\"), err) // another layer, Go 1.20+\n\tvar ve *ValidationError\n\tif !errors.As(outer, &ve) || ve.Field != \"email\" {\n\t\tt.Fatalf(\"errors.As through two levels failed for %v\", outer)\n\t}\n}"
      },
      "solution": {
        "name": "validation.go",
        "code": "// Package validation is the reference solution for practice task W1-3.\npackage validation\n\nimport (\n\t\"fmt\"\n\t\"strings\"\n)\n\n// ValidationError is a typed error: it carries data the caller can read with errors.As.\ntype ValidationError struct {\n\tField  string\n\tReason string\n}\n\nfunc (e *ValidationError) Error() string {\n\treturn fmt.Sprintf(\"invalid %s: %s\", e.Field, e.Reason)\n}\n\ntype User struct {\n\tEmail string\n\tAge   int\n}\n\n// Validate returns a *ValidationError for the first invalid field.\n// It returns a plain nil when the user is valid — never a nil *ValidationError,\n// which would make a non-nil error interface.\nfunc Validate(u User) error {\n\tif !strings.Contains(u.Email, \"@\") {\n\t\treturn &ValidationError{Field: \"email\", Reason: \"must contain @\"}\n\t}\n\tif u.Age < 18 {\n\t\treturn &ValidationError{Field: \"age\", Reason: \"must be at least 18\"}\n\t}\n\treturn nil\n}\n\n// Register adds context with %w, so callers can still reach the ValidationError.\nfunc Register(u User) error {\n\tif err := Validate(u); err != nil {\n\t\treturn fmt.Errorf(\"register %q: %w\", u.Email, err)\n\t}\n\treturn nil\n}"
      }
    }
  },
  {
    "id": "p-deferpanic",
    "code": "W1-4, W1-5",
    "week": 1,
    "title": "Порядок defer и SafeDiv",
    "titleEN": "Defer order and SafeDiv",
    "goalRU": "Показать порядок отложенных вызовов и превратить panic при делении на ноль в обычную ошибку.",
    "contractRU": [
      "DeferOrder откладывает три вызова в цикле и возвращает порядок, в котором они выполнились: [3 2 1].",
      "SafeDiv(7, 2) возвращает 3 и nil.",
      "SafeDiv(1, 0) не паникует наружу: возвращает 0 и ошибку, в тексте которой есть «divide by zero».",
      "Результат меняется в отложенной функции, поэтому результаты именованные."
    ],
    "contractEN": [
      "DeferOrder defers three calls in a loop and returns the order they ran in: [3 2 1].",
      "SafeDiv(7, 2) returns 3 and nil.",
      "SafeDiv(1, 0) does not let the panic escape: it returns 0 and an error whose text contains \"divide by zero\".",
      "The deferred function changes the results, so the results are named."
    ],
    "planTasks": [
      "w1-thu-4"
    ],
    "links": [
      "c35",
      "q3",
      "q31",
      "q32"
    ],
    "hints": [
      "Отложенные вызовы выполняются после return, в обратном порядке. Если результат назван — func DeferOrder() (order []int) — отложенная функция может дописывать в него.",
      "recover() возвращает не nil только внутри отложенной функции во время паники. Там же присвой err = fmt.Errorf(\"…: %v\", r).",
      "Деление на ноль для целых — panic во время выполнения, а не ошибка компиляции, если делитель — переменная."
    ],
    "talkEN": "Deferred calls run when the function returns, last in, first out, so three defers in a loop run as 3, 2, 1. SafeDiv defers a closure that calls recover; if the division panicked, recover returns the panic value and the closure assigns an error to the named err result, so the caller gets an ordinary error. This only works in the same goroutine. For expected failures I would return an error directly; recover is for boundaries such as a request handler.",
    "pitfalls": [
      "recover вызван не в отложенной функции → всегда nil, паника идёт дальше.",
      "Безымянные результаты → отложенная функция не может изменить возвращаемую ошибку (q31).",
      "Паника в другой горутине → этот recover её не поймает, программа упадёт (q5, q32).",
      "В модуле с go ниже 1.22 переменная цикла общая, и замыкания в DeferOrder увидят 4 4 4."
    ],
    "followUps": [
      "Перенеси деление во вложенную функцию на два уровня глубже — ловит ли recover панику оттуда?",
      "Передай i аргументом: defer func(n int) { … }(i) — когда вычисляется аргумент?",
      "Почему http.Server восстанавливается после паники в handler, а паника в горутине, запущенной из handler, роняет процесс?"
    ],
    "note": "DeferOrder рассчитан на Go 1.22+: у каждой итерации цикла своя переменная i. go mod init, запущенный Go 1.22 или новее, записывает в go.mod версию не ниже 1.22, так что всё совпадёт.",
    "fixture": "docs/verification/fixtures/practice/deferpanic",
    "files": {
      "starter": {
        "name": "deferpanic.go",
        "code": "// Package deferpanic: practice tasks W1-4 and W1-5. Replace each TODO with your solution.\npackage deferpanic\n\n// DeferOrder appends 1, 2, 3 to the result with three deferred calls made in that order\n// and returns what they produced. Predict the result before running the test.\nfunc DeferOrder() (order []int) {\n\t// TODO: a loop with defer\n\tpanic(\"TODO\")\n}\n\n// SafeDiv returns a / b. Division by zero must give an error, not a panic.\n// Do not check b == 0 directly: let the runtime panic and recover from it.\nfunc SafeDiv(a, b int) (q int, err error) {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "deferpanic_test.go",
        "code": "package deferpanic\n\nimport (\n\t\"slices\"\n\t\"strings\"\n\t\"testing\"\n)\n\nfunc TestDeferOrder(t *testing.T) {\n\tif got := DeferOrder(); !slices.Equal(got, []int{3, 2, 1}) {\n\t\tt.Fatalf(\"DeferOrder() = %v, want [3 2 1]\", got)\n\t}\n}\n\nfunc TestSafeDiv(t *testing.T) {\n\tq, err := SafeDiv(7, 2)\n\tif err != nil || q != 3 {\n\t\tt.Fatalf(\"SafeDiv(7, 2) = %d, %v; want 3, nil\", q, err)\n\t}\n}\n\nfunc TestSafeDivByZero(t *testing.T) {\n\tq, err := SafeDiv(1, 0) // must not panic: the test would crash\n\tif err == nil {\n\t\tt.Fatal(\"got nil error for division by zero\")\n\t}\n\tif q != 0 {\n\t\tt.Fatalf(\"q = %d, want 0 with an error\", q)\n\t}\n\tif !strings.Contains(err.Error(), \"divide by zero\") {\n\t\tt.Fatalf(\"error %q should mention the runtime panic\", err)\n\t}\n}"
      },
      "solution": {
        "name": "deferpanic.go",
        "code": "// Package deferpanic is the reference solution for practice tasks W1-4 and W1-5.\npackage deferpanic\n\nimport \"fmt\"\n\n// DeferOrder records the order in which three deferred calls run.\n// Deferred calls run last-in, first-out, so the result is [3 2 1].\nfunc DeferOrder() (order []int) {\n\tfor i := 1; i <= 3; i++ {\n\t\tdefer func() { order = append(order, i) }() // Go 1.22+: each iteration has its own i\n\t}\n\treturn nil\n}\n\n// SafeDiv returns a / b, turning a panic into an error. The deferred function\n// can set err because err is a named result.\nfunc SafeDiv(a, b int) (q int, err error) {\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\terr = fmt.Errorf(\"safediv %d/%d: %v\", a, b, r)\n\t\t}\n\t}()\n\treturn divide(a, b), nil\n}\n\n// divide panics on b == 0: the runtime raises \"integer divide by zero\".\nfunc divide(a, b int) int { return a / b }"
      }
    }
  },
  {
    "id": "p-removeslice",
    "code": "W2-1",
    "week": 2,
    "title": "Remove: на месте и с копией",
    "titleEN": "Remove in place or with a copy",
    "goalRU": "Удалить элемент из среза двумя способами и тестом показать, что удаление на месте меняет массив вызывающего.",
    "contractRU": [
      "RemoveInPlace(s, i) возвращает срез без s[i], сдвигая хвост в том же массиве; исходный срез вызывающего после этого — [1 3 4 4] для [1 2 3 4] и i = 1.",
      "RemoveCopy(s, i) возвращает новый срез; исходный не меняется, и запись в результат его не задевает.",
      "Удаление единственного и последнего элемента работает в обеих версиях.",
      "Тест фиксирует поведение slices.Delete: с Go 1.22 хвост после новой длины обнуляется — [1 3 4 0]."
    ],
    "contractEN": [
      "RemoveInPlace(s, i) returns the slice without s[i] by shifting the tail inside the same array; the caller's original slice then reads [1 3 4 4] for [1 2 3 4] and i = 1.",
      "RemoveCopy(s, i) returns a new slice; the original stays the same, and writing to the result does not touch it.",
      "Removing the only element and the last element works in both versions.",
      "A test pins down slices.Delete: since Go 1.22 it zeroes the elements past the new length, giving [1 3 4 0]."
    ],
    "planTasks": [
      "w2-tue-4"
    ],
    "links": [
      "c29",
      "q6"
    ],
    "hints": [
      "append(s[:i], s[i+1:]...) пишет в тот же массив: у s[:i] хватает ёмкости.",
      "Для независимой копии выдели новый массив: make([]int, 0, len(s)-1), затем два append.",
      "Почему исходный срез оканчивается на 4 4? Его длина не изменилась, а последний элемент никто не перезаписал."
    ],
    "talkEN": "Removing with append(s[:i], s[i+1:]...) is cheap because it shifts the tail inside the same backing array, but the caller's slice shares that array, so it now sees shifted values and a stale duplicate at the end. If the caller's data must stay intact, I allocate a new slice and copy the two parts. slices.Delete also works in place, and since Go 1.22 it zeroes the tail, which helps the garbage collector when elements are pointers.",
    "pitfalls": [
      "Считать, что append(s[:i], s[i+1:]...) создаёт новый срез → порча данных вызывающего.",
      "Забыть, что длина исходного среза не меняется → «лишний» последний элемент.",
      "Удаление из среза указателей без обнуления хвоста → объекты удерживаются в памяти (до Go 1.22 для slices.Delete)."
    ],
    "followUps": [
      "Удали все элементы, подходящие под условие, за один проход без лишних выделений (slices.DeleteFunc).",
      "Сделай Remove обобщённым: func Remove[T any](s []T, i int) []T.",
      "Что изменится, если вызывающий передал s[:2:2]?"
    ],
    "fixture": "docs/verification/fixtures/practice/removeslice",
    "files": {
      "starter": {
        "name": "removeslice.go",
        "code": "// Package removeslice: practice task W2-1. Replace each TODO with your solution.\npackage removeslice\n\n// RemoveInPlace removes s[i] by shifting the tail left inside the same backing array.\nfunc RemoveInPlace(s []int, i int) []int {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// RemoveCopy returns a new slice without s[i] and leaves s untouched.\nfunc RemoveCopy(s []int, i int) []int {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "removeslice_test.go",
        "code": "package removeslice\n\nimport (\n\t\"slices\"\n\t\"testing\"\n)\n\nfunc TestRemoveInPlaceChangesCallerArray(t *testing.T) {\n\torig := []int{1, 2, 3, 4}\n\tgot := RemoveInPlace(orig, 1)\n\tif !slices.Equal(got, []int{1, 3, 4}) {\n\t\tt.Fatalf(\"got %v, want [1 3 4]\", got)\n\t}\n\t// Same backing array: the caller's slice now reads 1 3 4 4.\n\tif !slices.Equal(orig, []int{1, 3, 4, 4}) {\n\t\tt.Fatalf(\"orig = %v, want [1 3 4 4]: in-place removal shifts the shared array\", orig)\n\t}\n}\n\nfunc TestRemoveCopyKeepsCallerArray(t *testing.T) {\n\torig := []int{1, 2, 3, 4}\n\tgot := RemoveCopy(orig, 1)\n\tif !slices.Equal(got, []int{1, 3, 4}) {\n\t\tt.Fatalf(\"got %v, want [1 3 4]\", got)\n\t}\n\tif !slices.Equal(orig, []int{1, 2, 3, 4}) {\n\t\tt.Fatalf(\"orig changed to %v\", orig)\n\t}\n\tgot[0] = 100\n\tif orig[0] != 1 {\n\t\tt.Fatal(\"result shares memory with the original\")\n\t}\n}\n\nfunc TestEdges(t *testing.T) {\n\tfor _, remove := range []func([]int, int) []int{RemoveInPlace, RemoveCopy} {\n\t\tif got := remove([]int{7}, 0); len(got) != 0 {\n\t\t\tt.Fatalf(\"removing the only element gave %v\", got)\n\t\t}\n\t\tif got := remove([]int{1, 2, 3}, 2); !slices.Equal(got, []int{1, 2}) {\n\t\t\tt.Fatalf(\"removing the last element gave %v\", got)\n\t\t}\n\t}\n}\n\n// slices.Delete (Go 1.21) works in place too; since Go 1.22 it also zeroes the\n// elements past the new length, so the stale duplicate is gone.\nfunc TestSlicesDeleteZeroesTail(t *testing.T) {\n\torig := []int{1, 2, 3, 4}\n\tgot := slices.Delete(orig, 1, 2)\n\tif !slices.Equal(got, []int{1, 3, 4}) || !slices.Equal(orig, []int{1, 3, 4, 0}) {\n\t\tt.Fatalf(\"got %v, orig %v; want [1 3 4] and [1 3 4 0]\", got, orig)\n\t}\n}"
      },
      "solution": {
        "name": "removeslice.go",
        "code": "// Package removeslice is the reference solution for practice task W2-1.\npackage removeslice\n\n// RemoveInPlace removes s[i] by shifting the tail left inside the same backing\n// array. It is cheap, but the caller's slice changes: its elements move and its\n// last element is left as a duplicate.\nfunc RemoveInPlace(s []int, i int) []int {\n\treturn append(s[:i], s[i+1:]...)\n}\n\n// RemoveCopy returns a new slice without s[i] and leaves s untouched.\nfunc RemoveCopy(s []int, i int) []int {\n\tout := make([]int, 0, len(s)-1)\n\tout = append(out, s[:i]...)\n\treturn append(out, s[i+1:]...)\n}"
      }
    }
  },
  {
    "id": "p-generics",
    "code": "W2-2, W2-3",
    "week": 2,
    "title": "Generics: Map, Filter, Reduce, Set и Max против интерфейса",
    "titleEN": "Generic helpers versus an interface",
    "goalRU": "Написать обобщённые Map, Filter, Reduce и Set[T comparable], а затем один и тот же «выбор лучшего» — через параметр типа и через интерфейс.",
    "contractRU": [
      "Map, Filter и Reduce работают для любых типов элементов; для пустого входа Map и Filter возвращают пустой результат, Reduce — начальное значение.",
      "Set[T comparable]: NewSet, Add, Has, Len, Remove, Each; повторный Add не увеличивает Len.",
      "Max[T cmp.Ordered] возвращает наибольший элемент и true, для пустого среза — нулевое значение и false; для type Celsius float64 возвращает Celsius.",
      "Best([]Ranker) выбирает значение с наибольшим Score() среди разных типов в одном срезе; для пустого среза — nil и false."
    ],
    "contractEN": [
      "Map, Filter and Reduce work for any element types; for empty input Map and Filter return an empty result and Reduce returns the initial value.",
      "Set[T comparable]: NewSet, Add, Has, Len, Remove, Each; adding the same value twice does not increase Len.",
      "Max[T cmp.Ordered] returns the largest element and true, and for an empty slice the zero value and false; for type Celsius float64 it returns a Celsius.",
      "Best([]Ranker) picks the value with the highest Score() among different types in one slice; for an empty slice it returns nil and false."
    ],
    "planTasks": [
      "w2-wed-1",
      "w2-wed-2",
      "w2-thu-3"
    ],
    "links": [
      "c42",
      "c40"
    ],
    "hints": [
      "Set хранит map[T]struct{}: пустая структура не занимает места. Ключом map может быть только comparable-тип — отсюда ограничение.",
      "Map[T, U any] — два параметра типа: вход и выход. Reduce[T, A any] — элемент и аккумулятор.",
      "Max сравнивает через < или встроенный max (Go 1.21), поэтому нужен cmp.Ordered, а не any.",
      "Best принимает []Ranker: в одном срезе лежат разные типы, и каждый сам решает, что такое Score."
    ],
    "talkEN": "Map, Filter, Reduce and Max are the same algorithm for many types, so type parameters fit: the compiler checks the types and the caller gets its own type back, for example Max of Celsius values returns a Celsius. Set needs a comparable constraint because its elements are map keys. Best is the interface version: the slice holds different types, and each type decides what its score is, chosen at run time. Same algorithm over types means generics; different behaviour behind one method means an interface.",
    "pitfalls": [
      "Max[T any] → не компилируется: для any нет операции <.",
      "Set без NewSet и с nil map внутри → panic при первом Add.",
      "Interface{} вместо параметра типа → приведения типов и потеря проверок компилятора.",
      "Обобщать, когда есть один вызывающий с одним типом → лишняя сложность."
    ],
    "followUps": [
      "Добавь Union и Intersect для Set — что вернуть: новый Set или изменить существующий?",
      "Сделай Each через итератор Go 1.23: func (s *Set[T]) All() iter.Seq[T].",
      "Почему Set[[]int] не компилируется, а Set[[2]int] — да?"
    ],
    "fixture": "docs/verification/fixtures/practice/generics",
    "files": {
      "starter": {
        "name": "generics.go",
        "code": "// Package generics: practice tasks W2-2 and W2-3. Replace each TODO with your solution.\npackage generics\n\nimport \"cmp\"\n\nfunc Map[T, U any](xs []T, f func(T) U) []U { panic(\"TODO\") }\n\nfunc Filter[T any](xs []T, keep func(T) bool) []T { panic(\"TODO\") }\n\n// Reduce folds xs into an accumulator that starts at init.\nfunc Reduce[T, A any](xs []T, init A, f func(A, T) A) A { panic(\"TODO\") }\n\n// Set holds unique values. Why must T be comparable?\ntype Set[T comparable] struct {\n\tm map[T]struct{}\n}\n\nfunc NewSet[T comparable](items ...T) *Set[T] { panic(\"TODO\") }\n\nfunc (s *Set[T]) Add(v T)        { panic(\"TODO\") }\nfunc (s *Set[T]) Has(v T) bool   { panic(\"TODO\") }\nfunc (s *Set[T]) Len() int       { panic(\"TODO\") }\nfunc (s *Set[T]) Remove(v T)     { panic(\"TODO\") }\nfunc (s *Set[T]) Each(f func(T)) { panic(\"TODO\") }\n\n// W2-3: the same \"maximum\" two ways.\n\n// Max returns the largest element of any ordered type; ok is false for an empty slice.\nfunc Max[T cmp.Ordered](xs []T) (T, bool) { panic(\"TODO\") }\n\n// Ranker is the interface way: each type decides what its score is.\ntype Ranker interface {\n\tScore() int\n}\n\n// Best returns the element with the highest Score; ok is false for an empty slice.\nfunc Best(xs []Ranker) (Ranker, bool) { panic(\"TODO\") }"
      },
      "tests": {
        "name": "generics_test.go",
        "code": "package generics\n\nimport (\n\t\"slices\"\n\t\"strconv\"\n\t\"testing\"\n)\n\nfunc TestMapFilterReduce(t *testing.T) {\n\tnums := []int{1, 2, 3, 4, 5}\n\tstrs := Map(nums, strconv.Itoa)\n\tif !slices.Equal(strs, []string{\"1\", \"2\", \"3\", \"4\", \"5\"}) {\n\t\tt.Fatalf(\"Map = %v\", strs)\n\t}\n\teven := Filter(nums, func(n int) bool { return n%2 == 0 })\n\tif !slices.Equal(even, []int{2, 4}) {\n\t\tt.Fatalf(\"Filter = %v\", even)\n\t}\n\tsum := Reduce(nums, 0, func(acc, n int) int { return acc + n })\n\tif sum != 15 {\n\t\tt.Fatalf(\"Reduce = %d\", sum)\n\t}\n\tjoined := Reduce(strs, \"\", func(acc, s string) string { return acc + s })\n\tif joined != \"12345\" {\n\t\tt.Fatalf(\"Reduce to string = %q\", joined)\n\t}\n}\n\nfunc TestEmptyInputs(t *testing.T) {\n\tif got := Map([]int(nil), strconv.Itoa); len(got) != 0 {\n\t\tt.Fatalf(\"Map(nil) = %v\", got)\n\t}\n\tif got := Filter([]int(nil), func(int) bool { return true }); len(got) != 0 {\n\t\tt.Fatalf(\"Filter(nil) = %v\", got)\n\t}\n\tif got := Reduce([]int(nil), 7, func(a, n int) int { return a + n }); got != 7 {\n\t\tt.Fatalf(\"Reduce(nil) = %d, want the initial value\", got)\n\t}\n}\n\nfunc TestSet(t *testing.T) {\n\ts := NewSet(\"go\", \"kotlin\", \"go\")\n\tif s.Len() != 2 || !s.Has(\"go\") || s.Has(\"java\") {\n\t\tt.Fatalf(\"unexpected set state: len %d\", s.Len())\n\t}\n\ts.Remove(\"go\")\n\tif s.Has(\"go\") || s.Len() != 1 {\n\t\tt.Fatal(\"Remove did not remove\")\n\t}\n\ttype point struct{ X, Y int } // comparable struct: fine as a key\n\tps := NewSet(point{1, 2}, point{1, 2})\n\tif ps.Len() != 1 {\n\t\tt.Fatalf(\"equal structs counted twice: %d\", ps.Len())\n\t}\n}\n\ntype player struct {\n\tname  string\n\tscore int\n}\n\nfunc (p player) Score() int { return p.score }\n\ntype team []player\n\nfunc (t team) Score() int {\n\ttotal := 0\n\tfor _, p := range t {\n\t\ttotal += p.score\n\t}\n\treturn total\n}\n\nfunc TestMaxAndBest(t *testing.T) {\n\tif m, ok := Max([]float64{1.5, -2, 9.25}); !ok || m != 9.25 {\n\t\tt.Fatalf(\"Max = %v, %v\", m, ok)\n\t}\n\tif m, ok := Max([]string{\"b\", \"c\", \"a\"}); !ok || m != \"c\" {\n\t\tt.Fatalf(\"Max strings = %v, %v\", m, ok)\n\t}\n\tif _, ok := Max([]int{}); ok {\n\t\tt.Fatal(\"Max of empty slice reported ok\")\n\t}\n\t// Different concrete types in one slice: only the interface version can do this.\n\tb, ok := Best([]Ranker{player{\"ann\", 7}, team{{\"bob\", 3}, {\"cy\", 5}}, player{\"dan\", 2}})\n\tif !ok || b.Score() != 8 {\n\t\tt.Fatalf(\"Best = %v, %v\", b, ok)\n\t}\n}"
      },
      "solution": {
        "name": "generics.go",
        "code": "// Package generics is the reference solution for practice tasks W2-2 and W2-3.\npackage generics\n\nimport \"cmp\"\n\n// Map, Filter and Reduce work for any element types; the compiler checks them.\n\nfunc Map[T, U any](xs []T, f func(T) U) []U {\n\tout := make([]U, 0, len(xs))\n\tfor _, x := range xs {\n\t\tout = append(out, f(x))\n\t}\n\treturn out\n}\n\nfunc Filter[T any](xs []T, keep func(T) bool) []T {\n\tvar out []T\n\tfor _, x := range xs {\n\t\tif keep(x) {\n\t\t\tout = append(out, x)\n\t\t}\n\t}\n\treturn out\n}\n\nfunc Reduce[T, A any](xs []T, init A, f func(A, T) A) A {\n\tacc := init\n\tfor _, x := range xs {\n\t\tacc = f(acc, x)\n\t}\n\treturn acc\n}\n\n// Set needs comparable elements because they become map keys.\ntype Set[T comparable] struct {\n\tm map[T]struct{}\n}\n\nfunc NewSet[T comparable](items ...T) *Set[T] {\n\ts := &Set[T]{m: make(map[T]struct{}, len(items))}\n\tfor _, it := range items {\n\t\ts.Add(it)\n\t}\n\treturn s\n}\n\nfunc (s *Set[T]) Add(v T)      { s.m[v] = struct{}{} }\nfunc (s *Set[T]) Has(v T) bool { _, ok := s.m[v]; return ok }\nfunc (s *Set[T]) Len() int     { return len(s.m) }\nfunc (s *Set[T]) Remove(v T)   { delete(s.m, v) }\nfunc (s *Set[T]) Each(f func(T)) {\n\tfor v := range s.m {\n\t\tf(v)\n\t}\n}\n\n// W2-3: the same \"maximum\" two ways.\n\n// Max works on any ordered type: same algorithm, different types.\nfunc Max[T cmp.Ordered](xs []T) (T, bool) {\n\tvar zero T\n\tif len(xs) == 0 {\n\t\treturn zero, false\n\t}\n\tm := xs[0]\n\tfor _, x := range xs[1:] {\n\t\tm = max(m, x)\n\t}\n\treturn m, true\n}\n\n// Ranker is the interface way: each type decides what \"better\" means.\ntype Ranker interface {\n\tScore() int\n}\n\n// Best works with values of different types in one slice, chosen at run time.\nfunc Best(xs []Ranker) (Ranker, bool) {\n\tif len(xs) == 0 {\n\t\treturn nil, false\n\t}\n\tb := xs[0]\n\tfor _, x := range xs[1:] {\n\t\tif x.Score() > b.Score() {\n\t\t\tb = x\n\t\t}\n\t}\n\treturn b, true\n}"
      }
    }
  },
  {
    "id": "p-txsum",
    "code": "W2-4",
    "week": 2,
    "title": "CLI txsum: суммы из CSV",
    "titleEN": "txsum: totals from CSV",
    "goalRU": "Посчитать суммы по счёту и валюте из строк account,amount,currency, собрать все ошибочные строки с номерами и вернуть код выхода как у CLI.",
    "contractRU": [
      "ParseAmount: «12.50» → 1250, «12.5» → 1250, «12» → 1200, «-3.10» → -310; больше двух знаков после точки, пустая строка, «abc», «1.», «.5» — ошибка с причиной ErrAmount.",
      "Sum суммирует корректные строки по ключу {Account, Currency}; пустые строки и заголовок account,amount,currency пропускаются.",
      "Ошибочная строка пропускается, а в срез ошибок попадает *LineError с номером строки; errors.Is видит причину: ErrColumns, ErrAmount или ErrCurrency (известны EUR, USD, RSD).",
      "Run пишет итоги в stdout, отсортированные по счёту и валюте («alice EUR 12.00»), ошибки — в stderr по одной на строку и возвращает 1, если были ошибки, иначе 0."
    ],
    "contractEN": [
      "ParseAmount: \"12.50\" → 1250, \"12.5\" → 1250, \"12\" → 1200, \"-3.10\" → -310; more than two decimals, an empty string, \"abc\", \"1.\" or \".5\" is an error with cause ErrAmount.",
      "Sum adds up valid lines per {Account, Currency} key; blank lines and the header account,amount,currency are skipped.",
      "A bad line is skipped and a *LineError with its line number goes into the error slice; errors.Is sees the cause: ErrColumns, ErrAmount or ErrCurrency (EUR, USD and RSD are known).",
      "Run writes totals to stdout sorted by account and currency (\"alice EUR 12.00\"), errors to stderr one per line, and returns 1 if there were errors, 0 otherwise."
    ],
    "planTasks": [
      "w2-sat-2"
    ],
    "links": [
      "c39",
      "c44",
      "c41"
    ],
    "hints": [
      "strings.Cut(s, \".\") делит сумму на целую и дробную части. Дополни дробную нулями до двух знаков и разбери «целая+дробная» через strconv.ParseInt.",
      "LineError нужен метод Unwrap() error, иначе errors.Is не увидит причину внутри.",
      "Порядок обхода map не задан: собери ключи в срез и отсортируй slices.SortFunc перед печатью.",
      "Run принимает io.Reader и io.Writer, а main — это os.Exit(Run(os.Stdin, os.Stdout, os.Stderr)): так CLI тестируется без процессов."
    ],
    "talkEN": "I parse amounts into integer minor units, never floats, and reject anything with more than two decimals. Each bad line becomes a LineError with the line number, and its Unwrap method lets errors.Is find the cause, so tests can check both. I don't stop at the first error: the user sees every bad line in one run, and the exit code is non-zero if any line failed. Run takes a reader and two writers, so the whole CLI is tested with strings and buffers, and output is sorted because map order is not specified.",
    "pitfalls": [
      "strconv.ParseFloat и умножение на 100 → 0.29 превращается в 28.",
      "Остановка на первой ошибке → пользователь исправляет файл по одной строке.",
      "LineError без Unwrap → errors.Is(err, ErrAmount) возвращает false.",
      "Печать прямо из обхода map → порядок строк меняется от запуска к запуску, тест нестабилен.",
      "os.Exit внутри логики → её нельзя протестировать и отложенные вызовы не выполнятся."
    ],
    "followUps": [
      "Прими кавычки и запятые внутри полей: перейди на encoding/csv — что изменится в тестах?",
      "Добавь флаг -currency EUR, который фильтрует вывод (пакет flag).",
      "Обработай файл в 10 ГБ: что в решении уже потоковое, а что растёт с размером входа?"
    ],
    "fixture": "docs/verification/fixtures/practice/txsum",
    "files": {
      "starter": {
        "name": "txsum.go",
        "code": "// Package txsum: practice task W2-4. Sum transactions from CSV lines\n// \"account,amount,currency\" per account and currency. Replace each TODO.\npackage txsum\n\nimport (\n\t\"errors\"\n\t\"io\"\n)\n\nvar (\n\tErrColumns  = errors.New(\"want 3 columns: account,amount,currency\")\n\tErrAmount   = errors.New(\"amount must be a number with at most 2 decimals\")\n\tErrCurrency = errors.New(\"unknown currency\") // known: EUR, USD, RSD\n)\n\n// LineError says which input line failed (lines count from 1, including the header).\ntype LineError struct {\n\tLine int\n\tErr  error\n}\n\n// Error formats \"line 5: <cause>\".\nfunc (e *LineError) Error() string { panic(\"TODO\") }\n\n// Unwrap returns the cause, so errors.Is and errors.As look inside.\nfunc (e *LineError) Unwrap() error { panic(\"TODO\") }\n\ntype Key struct{ Account, Currency string }\n\n// ParseAmount turns \"12.50\", \"12.5\", \"12\" or \"-3.10\" into minor units (1250, 1250, 1200, -310).\n// Anything else, including three decimals, is an error wrapping ErrAmount.\nfunc ParseAmount(s string) (int64, error) { panic(\"TODO\") }\n\n// Sum adds up every valid line and reports every bad line (skipping it).\n// Blank lines and the header \"account,amount,currency\" are ignored.\nfunc Sum(r io.Reader) (map[Key]int64, []error) { panic(\"TODO\") }\n\n// Run is the CLI: \"account CUR 12.50\" lines sorted by account then currency to\n// stdout, one error per line to stderr, exit code 1 if any line was bad, else 0.\nfunc Run(stdin io.Reader, stdout, stderr io.Writer) int { panic(\"TODO\") }"
      },
      "tests": {
        "name": "txsum_test.go",
        "code": "package txsum\n\nimport (\n\t\"bytes\"\n\t\"errors\"\n\t\"strings\"\n\t\"testing\"\n)\n\nfunc TestParseAmount(t *testing.T) {\n\ttests := []struct {\n\t\tin      string\n\t\twant    int64\n\t\twantErr bool\n\t}{\n\t\t{\"12.50\", 1250, false},\n\t\t{\"12.5\", 1250, false},\n\t\t{\"12\", 1200, false},\n\t\t{\"0.05\", 5, false},\n\t\t{\"-3.10\", -310, false},\n\t\t{\"1.234\", 0, true},\n\t\t{\"abc\", 0, true},\n\t\t{\"\", 0, true},\n\t\t{\"1.\", 0, true},\n\t\t{\".5\", 0, true},\n\t\t{\"1.-5\", 0, true},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.in, func(t *testing.T) {\n\t\t\tgot, err := ParseAmount(tt.in)\n\t\t\tif (err != nil) != tt.wantErr || got != tt.want {\n\t\t\t\tt.Fatalf(\"ParseAmount(%q) = %d, %v; want %d, error %v\", tt.in, got, err, tt.want, tt.wantErr)\n\t\t\t}\n\t\t\tif err != nil && !errors.Is(err, ErrAmount) {\n\t\t\t\tt.Fatalf(\"error %v does not wrap ErrAmount\", err)\n\t\t\t}\n\t\t})\n\t}\n}\n\nconst input = `account,amount,currency\nalice,10.00,EUR\nbob,5,USD\nalice,2.50,EUR\ncarol,7.00\ndave,ten,EUR\nerin,1.00,GBP\n\nalice,-0.50,EUR\n`\n\nfunc TestSumCollectsAllErrors(t *testing.T) {\n\ttotals, errs := Sum(strings.NewReader(input))\n\tif got := totals[Key{\"alice\", \"EUR\"}]; got != 1200 {\n\t\tt.Errorf(\"alice EUR = %d, want 1200\", got)\n\t}\n\tif got := totals[Key{\"bob\", \"USD\"}]; got != 500 {\n\t\tt.Errorf(\"bob USD = %d, want 500\", got)\n\t}\n\tif len(totals) != 2 {\n\t\tt.Errorf(\"got %d totals, want 2: bad lines must be skipped\", len(totals))\n\t}\n\twant := []struct {\n\t\tline  int\n\t\tcause error\n\t}{{5, ErrColumns}, {6, ErrAmount}, {7, ErrCurrency}}\n\tif len(errs) != len(want) {\n\t\tt.Fatalf(\"got %d errors %v, want %d\", len(errs), errs, len(want))\n\t}\n\tfor i, w := range want {\n\t\tvar le *LineError\n\t\tif !errors.As(errs[i], &le) || le.Line != w.line {\n\t\t\tt.Errorf(\"error %d = %v, want a *LineError for line %d\", i, errs[i], w.line)\n\t\t}\n\t\tif !errors.Is(errs[i], w.cause) {\n\t\t\tt.Errorf(\"error %d = %v, want cause %v\", i, errs[i], w.cause)\n\t\t}\n\t}\n}\n\nfunc TestRun(t *testing.T) {\n\tvar out, errOut bytes.Buffer\n\tif code := Run(strings.NewReader(input), &out, &errOut); code != 1 {\n\t\tt.Fatalf(\"exit code %d, want 1 with bad lines\", code)\n\t}\n\tif want := \"alice EUR 12.00\\nbob USD 5.00\\n\"; out.String() != want {\n\t\tt.Fatalf(\"stdout %q, want %q\", out.String(), want)\n\t}\n\tif lines := strings.Count(errOut.String(), \"\\n\"); lines != 3 {\n\t\tt.Fatalf(\"stderr has %d lines, want 3:\\n%s\", lines, errOut.String())\n\t}\n\n\tout.Reset()\n\terrOut.Reset()\n\tif code := Run(strings.NewReader(\"zed,-1.50,RSD\\n\"), &out, &errOut); code != 0 {\n\t\tt.Fatalf(\"exit code %d for valid input, want 0; stderr: %s\", code, errOut.String())\n\t}\n\tif out.String() != \"zed RSD -1.50\\n\" {\n\t\tt.Fatalf(\"stdout %q\", out.String())\n\t}\n}"
      },
      "solution": {
        "name": "txsum.go",
        "code": "// Package txsum is the reference solution for practice task W2-4:\n// sum transactions from CSV lines \"account,amount,currency\" per account and currency.\npackage txsum\n\nimport (\n\t\"bufio\"\n\t\"errors\"\n\t\"fmt\"\n\t\"io\"\n\t\"slices\"\n\t\"strconv\"\n\t\"strings\"\n)\n\nvar (\n\tErrColumns  = errors.New(\"want 3 columns: account,amount,currency\")\n\tErrAmount   = errors.New(\"amount must be a number with at most 2 decimals\")\n\tErrCurrency = errors.New(\"unknown currency\")\n)\n\nvar currencies = map[string]bool{\"EUR\": true, \"USD\": true, \"RSD\": true}\n\n// LineError says which input line failed; Unwrap lets errors.Is see the cause.\ntype LineError struct {\n\tLine int\n\tErr  error\n}\n\nfunc (e *LineError) Error() string { return fmt.Sprintf(\"line %d: %v\", e.Line, e.Err) }\nfunc (e *LineError) Unwrap() error { return e.Err }\n\ntype Key struct{ Account, Currency string }\n\n// ParseAmount turns \"12.50\", \"12.5\", \"12\" or \"-3.10\" into minor units.\nfunc ParseAmount(s string) (int64, error) {\n\twhole, frac, hasDot := strings.Cut(s, \".\")\n\tif whole == \"\" || whole == \"-\" || (hasDot && (frac == \"\" || len(frac) > 2)) {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tfor len(frac) < 2 {\n\t\tfrac += \"0\"\n\t}\n\tif strings.HasPrefix(frac, \"-\") || strings.HasPrefix(frac, \"+\") {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tminor, err := strconv.ParseInt(whole+frac, 10, 64)\n\tif err != nil {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\treturn minor, nil\n}\n\n// Sum adds up every valid line. Bad lines are skipped and reported, all of them,\n// so one run shows every problem in the file. Blank lines and a header are ignored.\nfunc Sum(r io.Reader) (map[Key]int64, []error) {\n\ttotals := make(map[Key]int64)\n\tvar errs []error\n\tsc := bufio.NewScanner(r)\n\tfor n := 1; sc.Scan(); n++ {\n\t\tline := strings.TrimSpace(sc.Text())\n\t\tif line == \"\" || (n == 1 && line == \"account,amount,currency\") {\n\t\t\tcontinue\n\t\t}\n\t\tcols := strings.Split(line, \",\")\n\t\tif len(cols) != 3 {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\taccount, amount, currency := strings.TrimSpace(cols[0]), strings.TrimSpace(cols[1]), strings.TrimSpace(cols[2])\n\t\tif account == \"\" {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\tminor, err := ParseAmount(amount)\n\t\tif err != nil {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: err})\n\t\t\tcontinue\n\t\t}\n\t\tif !currencies[currency] {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: fmt.Errorf(\"%q: %w\", currency, ErrCurrency)})\n\t\t\tcontinue\n\t\t}\n\t\ttotals[Key{account, currency}] += minor\n\t}\n\tif err := sc.Err(); err != nil {\n\t\terrs = append(errs, fmt.Errorf(\"read input: %w\", err))\n\t}\n\treturn totals, errs\n}\n\n// Run is the whole CLI: totals to stdout sorted by account and currency, errors to\n// stderr, exit code 1 if any line was bad. main is just os.Exit(Run(os.Stdin, os.Stdout, os.Stderr)).\nfunc Run(stdin io.Reader, stdout, stderr io.Writer) int {\n\ttotals, errs := Sum(stdin)\n\tkeys := make([]Key, 0, len(totals))\n\tfor k := range totals {\n\t\tkeys = append(keys, k)\n\t}\n\tslices.SortFunc(keys, func(a, b Key) int {\n\t\tif c := strings.Compare(a.Account, b.Account); c != 0 {\n\t\t\treturn c\n\t\t}\n\t\treturn strings.Compare(a.Currency, b.Currency)\n\t})\n\tfor _, k := range keys {\n\t\tv := totals[k]\n\t\tsign := \"\"\n\t\tif v < 0 {\n\t\t\tsign, v = \"-\", -v\n\t\t}\n\t\tfmt.Fprintf(stdout, \"%s %s %s%d.%02d\\n\", k.Account, k.Currency, sign, v/100, v%100)\n\t}\n\tfor _, err := range errs {\n\t\tfmt.Fprintln(stderr, err)\n\t}\n\tif len(errs) > 0 {\n\t\treturn 1\n\t}\n\treturn 0\n}"
      }
    }
  },
  {
    "id": "p-workerpool",
    "code": "W3-1",
    "week": 3,
    "title": "Worker pool с отменой",
    "titleEN": "Worker pool with cancellation",
    "goalRU": "Обработать поток задач фиксированным числом горутин, отдать результаты и корректно остановиться — по закрытию канала задач или по отмене.",
    "contractRU": [
      "workers < 1 считается как 1; одновременно выполняется не больше workers вызовов fn.",
      "Каждая задача из jobs даёт ровно один результат, пока ctx не отменён; порядок результатов не важен.",
      "Канал результатов закрывает Process — после остановки последнего воркера.",
      "Воркеры останавливаются, когда jobs закрыт и прочитан или когда ctx отменён — даже если jobs так и не закроют.",
      "Пока результаты никто не читает, воркеры ждут, а не копят результаты в памяти.",
      "jobs принадлежит вызывающему: Process его не закрывает."
    ],
    "contractEN": [
      "workers < 1 means 1; at most workers calls of fn run at the same time.",
      "Every job from jobs yields exactly one result unless ctx is cancelled; result order does not matter.",
      "Process closes the results channel after the last worker has stopped.",
      "Workers stop when jobs is closed and drained, or when ctx is done — even if jobs is never closed.",
      "While nobody reads the results, workers wait instead of piling up results in memory.",
      "The caller owns jobs: Process never closes it."
    ],
    "planTasks": [
      "w3-tue-2",
      "w3-sat-1",
      "w3-sat-4"
    ],
    "links": [
      "c12",
      "c13",
      "c18",
      "c22",
      "q15"
    ],
    "hints": [
      "Сколько горутин отправляют в results? Значит, кто из них может его закрыть? Нужен один «закрывающий», который ждёт всех воркеров через sync.WaitGroup.",
      "Воркер ждёт сразу двух событий — новой задачи и отмены: select с <-ctx.Done() и job, ok := <-jobs. ok == false — задачи кончились.",
      "Отправка результата тоже может зависнуть навсегда, если потребитель ушёл: отправляй в select вместе с <-ctx.Done().",
      "wg.Add — до запуска горутин, а не внутри них. В Go 1.25+ есть wg.Go(func), он сам делает Add и Done."
    ],
    "talkEN": "I start a fixed number of workers, so concurrency is bounded by construction. Each worker selects on the jobs channel and ctx.Done, and it sends its result in a select with ctx.Done as well, so it never blocks forever on a channel; fn itself must respect ctx. Only the pool sends on the results channel, so only the pool closes it: one extra goroutine waits on a WaitGroup for all workers and then closes results. The caller owns the jobs channel and closes it. Backpressure comes for free: with an unbuffered results channel, a slow consumer simply makes the workers wait.",
    "pitfalls": [
      "close(results) в каждом воркере → panic: close of closed channel.",
      "wg.Add внутри горутины → Wait может вернуться раньше, чем воркер начал работу.",
      "Отправка результата без select → после отмены воркер навсегда заблокирован: утечка горутины.",
      "Горутина на каждую задачу вместо N воркеров → параллелизм не ограничен.",
      "Закрыть jobs внутри пула не даст компилятор: <-chan J только для чтения — сигнатура закрепляет владение. С chan J это был бы panic у отправителя."
    ],
    "followUps": [
      "Верни ошибку первой упавшей задачи и отмени остальные (errgroup.WithContext и SetLimit из golang.org/x/sync).",
      "Сохрани порядок результатов таким же, как у задач.",
      "Сделай results с буфером workers — что изменится в тесте на медленного потребителя?"
    ],
    "fixture": "docs/verification/fixtures/practice/workerpool",
    "files": {
      "starter": {
        "name": "workerpool.go",
        "code": "// Package workerpool: practice task W3-1. Replace the TODO with your solution.\npackage workerpool\n\nimport \"context\"\n\n// Process runs fn for every job from jobs using at most workers goroutines\n// and sends each result to the returned channel.\n//\n// Contract:\n//   - workers < 1 is treated as 1;\n//   - Process closes the returned channel after all workers have stopped;\n//   - workers stop when jobs is closed and drained, or when ctx is done;\n//   - while nobody reads the results, workers block instead of piling up results;\n//   - the caller owns jobs and closes it; Process never closes jobs.\nfunc Process[J, R any](ctx context.Context, workers int, jobs <-chan J, fn func(context.Context, J) R) <-chan R {\n\t// TODO: start the workers; close the results channel after all of them stop.\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "workerpool_test.go",
        "code": "package workerpool\n\nimport (\n\t\"context\"\n\t\"runtime\"\n\t\"slices\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\n// feed sends 0..n-1 and closes jobs; it stops early when ctx is done.\nfunc feed(ctx context.Context, n int) <-chan int {\n\tjobs := make(chan int)\n\tgo func() {\n\t\tdefer close(jobs)\n\t\tfor i := range n {\n\t\t\tselect {\n\t\t\tcase jobs <- i:\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn jobs\n}\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// collect reads results until the channel is closed; a pool that never closes it fails instead of hanging.\nfunc collect[R any](t *testing.T, results <-chan R) []R {\n\tt.Helper()\n\tvar got []R\n\ttimeout := time.After(5 * time.Second)\n\tfor {\n\t\tselect {\n\t\tcase r, ok := <-results:\n\t\t\tif !ok {\n\t\t\t\treturn got\n\t\t\t}\n\t\t\tgot = append(got, r)\n\t\tcase <-timeout:\n\t\t\tt.Fatalf(\"results channel is not closed; received %d values\", len(got))\n\t\t}\n\t}\n}\n\nfunc TestAllJobsProcessed(t *testing.T) {\n\tctx := context.Background()\n\tgot := collect(t, Process(ctx, 4, feed(ctx, 100), func(_ context.Context, n int) int { return n * 2 }))\n\tslices.Sort(got)\n\tif len(got) != 100 {\n\t\tt.Fatalf(\"got %d results, want 100\", len(got))\n\t}\n\tfor i, v := range got {\n\t\tif v != i*2 {\n\t\t\tt.Fatalf(\"result %d = %d, want %d\", i, v, i*2)\n\t\t}\n\t}\n}\n\nfunc TestNoJobs(t *testing.T) {\n\tctx := context.Background()\n\tif got := collect(t, Process(ctx, 3, feed(ctx, 0), func(_ context.Context, n int) int { return n })); len(got) != 0 {\n\t\tt.Fatalf(\"got %v, want no results\", got)\n\t}\n}\n\nfunc TestWorkersBelowOneMeansOne(t *testing.T) {\n\tctx := context.Background()\n\tif got := collect(t, Process(ctx, 0, feed(ctx, 3), func(_ context.Context, n int) int { return n })); len(got) != 3 {\n\t\tt.Fatalf(\"got %d results, want 3\", len(got))\n\t}\n}\n\nfunc TestAtMostNConcurrentCalls(t *testing.T) {\n\tconst workers = 3\n\tctx, cancel := context.WithCancel(context.Background())\n\tdefer cancel()\n\tvar active, peak atomic.Int32\n\trelease := make(chan struct{})\n\tfn := func(_ context.Context, n int) int {\n\t\tcur := active.Add(1)\n\t\tfor p := peak.Load(); cur > p && !peak.CompareAndSwap(p, cur); p = peak.Load() {\n\t\t}\n\t\t<-release\n\t\tactive.Add(-1)\n\t\treturn n\n\t}\n\tresults := Process(ctx, workers, feed(ctx, 20), fn)\n\twaitUntil(t, \"all workers busy\", func() bool { return active.Load() >= workers })\n\t// An observation window: a pool without a limit would start more calls here.\n\ttime.Sleep(50 * time.Millisecond)\n\tclose(release)\n\tif got := collect(t, results); len(got) != 20 {\n\t\tt.Fatalf(\"got %d results, want 20\", len(got))\n\t}\n\tif p := peak.Load(); p > workers {\n\t\tt.Fatalf(\"peak concurrency %d, want at most %d\", p, workers)\n\t}\n}\n\nfunc TestSlowConsumerBoundsWork(t *testing.T) {\n\tconst workers = 4\n\tctx, cancel := context.WithCancel(context.Background())\n\tdefer cancel()\n\tvar calls atomic.Int32\n\tresults := Process(ctx, workers, feed(ctx, 1000), func(_ context.Context, n int) int {\n\t\tcalls.Add(1)\n\t\treturn n\n\t})\n\tif cap(results) > workers {\n\t\tt.Fatalf(\"results buffer of %d: a slow consumer should make workers wait, not fill a large buffer\", cap(results))\n\t}\n\twaitUntil(t, \"workers started\", func() bool { return calls.Load() >= workers })\n\t// Observation windows: nobody reads results, so the work must stop growing.\n\ttime.Sleep(50 * time.Millisecond)\n\tfirst := int(calls.Load())\n\ttime.Sleep(50 * time.Millisecond)\n\tif again := int(calls.Load()); again != first {\n\t\tt.Fatalf(\"work keeps growing without a reader: %d, then %d jobs processed\", first, again)\n\t}\n\t// Each blocked worker holds one finished result, plus the buffer, plus at most\n\t// one value in flight in a forwarding goroutine, if the design has one.\n\tif limit := workers + cap(results) + 1; first > limit {\n\t\tt.Fatalf(\"%d jobs processed without a reader, want at most %d\", first, limit)\n\t}\n\tcancel()\n\tcollect(t, results)\n}\n\nfunc TestCancelStopsEverything(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tresults := Process(ctx, 4, feed(ctx, 1_000_000), func(_ context.Context, n int) int { return n })\n\tfor range 5 {\n\t\t<-results\n\t}\n\tcancel()\n\tcollect(t, results)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\n// The consumer cancels and stops reading. A worker blocked on sending its\n// result must notice the cancellation, otherwise it leaks.\nfunc TestCancelWithoutReading(t *testing.T) {\n\tconst workers = 3\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tvar calls atomic.Int32\n\tresults := Process(ctx, workers, feed(ctx, 1000), func(_ context.Context, n int) int {\n\t\tcalls.Add(1)\n\t\treturn n\n\t})\n\twaitUntil(t, \"every worker to finish a job\", func() bool { return calls.Load() >= workers })\n\tcancel()\n\twaitUntil(t, \"goroutines to exit while nobody reads\", func() bool { return runtime.NumGoroutine() <= before })\n\tcollect(t, results) // closed; a buffered design may still hold values\n}\n\n// The caller may cancel without ever closing jobs: workers must still stop.\nfunc TestCancelWithOpenJobs(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tjobs := make(chan int) // never closed, nobody sends\n\tresults := Process(ctx, 2, jobs, func(_ context.Context, n int) int { return n })\n\tcancel()\n\tcollect(t, results)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}"
      },
      "solution": {
        "name": "workerpool.go",
        "code": "// Package workerpool is the reference solution for practice task W3-1.\npackage workerpool\n\nimport (\n\t\"context\"\n\t\"sync\"\n)\n\n// Process runs fn for every job from jobs using at most workers goroutines\n// and sends each result to the returned channel.\n//\n// Contract:\n//   - workers < 1 is treated as 1;\n//   - Process closes the returned channel after all workers have stopped;\n//   - workers stop when jobs is closed and drained, or when ctx is done;\n//   - while nobody reads the results, workers block instead of piling up results;\n//   - the caller owns jobs and closes it; Process never closes jobs.\nfunc Process[J, R any](ctx context.Context, workers int, jobs <-chan J, fn func(context.Context, J) R) <-chan R {\n\tif workers < 1 {\n\t\tworkers = 1\n\t}\n\tresults := make(chan R)\n\tvar wg sync.WaitGroup\n\twg.Add(workers)\n\tfor range workers {\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tfor {\n\t\t\t\tselect {\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\tcase job, ok := <-jobs:\n\t\t\t\t\tif !ok {\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t\tr := fn(ctx, job)\n\t\t\t\t\tselect {\n\t\t\t\t\tcase results <- r:\n\t\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}()\n\t}\n\t// Only Process sends to results, so only Process closes it: after the last worker exits.\n\tgo func() {\n\t\twg.Wait()\n\t\tclose(results)\n\t}()\n\treturn results\n}"
      }
    }
  },
  {
    "id": "p-pipeline",
    "code": "W3-2",
    "week": 3,
    "title": "Pipeline с остановкой по context",
    "titleEN": "Pipeline with cancellation",
    "goalRU": "Собрать конвейер generate → square → sum, в котором отмена или ранний уход потребителя останавливает все стадии без зависших горутин.",
    "contractRU": [
      "Generate и Square запускают по одной горутине и сами закрывают свой выход; Sum работает в горутине вызывающего.",
      "Generate(ctx, nums...) отправляет числа по порядку и закрывает выход после последнего или при отмене.",
      "Square(ctx, in) отправляет n*n и закрывает выход, когда in закрыт или ctx отменён — даже если in никто не закроет.",
      "Sum(ctx, in) возвращает сумму, когда in закрыт; при отмене — 0 и ctx.Err(), даже если in к этому моменту тоже закрыт.",
      "Потребитель, который уходит раньше, сообщает об этом отменой ctx."
    ],
    "contractEN": [
      "Generate and Square each start one goroutine and close their own output; Sum runs in the caller's goroutine.",
      "Generate(ctx, nums...) sends the numbers in order and closes its output after the last one or on cancellation.",
      "Square(ctx, in) sends n*n and closes its output when in is closed or ctx is done — even if nobody ever closes in.",
      "Sum(ctx, in) returns the total once in is closed; on cancellation it returns 0 and ctx.Err().",
      "A consumer that leaves early says so by cancelling ctx."
    ],
    "planTasks": [
      "w3-tue-3",
      "w3-sat-1"
    ],
    "links": [
      "c12",
      "c13",
      "c14",
      "c18"
    ],
    "refs": [
      {
        "t": "Go Concurrency Patterns: Pipelines and cancellation",
        "u": "https://go.dev/blog/pipelines"
      }
    ],
    "hints": [
      "Кто закрывает выход стадии? Та горутина, которая в него пишет: defer close(out) первой строкой горутины.",
      "Каждая отправка и каждое ожидание входа — в select с <-ctx.Done().",
      "for n := range in удобен, но не замечает отмену, пока ждёт следующего значения.",
      "Закрытый in в Sum — ещё не «поток кончился»: при отмене Square тоже закрывает выход. Перед возвратом суммы проверь ctx.Err()."
    ],
    "talkEN": "Generate and Square each own their output channel: each starts one goroutine, defers closing the output, and returns the channel; Sum runs in the caller's goroutine. Every send and every receive sits in a select with ctx.Done, so when the consumer cancels, every stage returns and closes its output, and nothing stays blocked. Closing flows downstream; cancellation reaches all stages through the shared context. Because cancellation also closes the channels, Sum checks ctx.Err when its input closes: a closed channel with a live context is a finished stream, otherwise the run was aborted.",
    "pitfalls": [
      "Стадия без отмены: потребитель ушёл — генератор навсегда заблокирован на отправке.",
      "Закрыть выход стадии со стороны потребителя не даст компилятор: стадии возвращают <-chan int. С chan int это был бы panic у отправителя — закрывает только отправитель.",
      "Sum возвращает сумму, как только in закрылся → при отмене иногда частичный итог без ошибки: отмена закрывает и in.",
      "Большой буфер вместо отмены лишь откладывает утечку."
    ],
    "followUps": [
      "Добавь стадию, которая может вернуть ошибку, и останови весь конвейер (errgroup).",
      "Распараллель Square на 3 воркера и объедини их выходы — это задача W3-3."
    ],
    "fixture": "docs/verification/fixtures/practice/pipeline",
    "files": {
      "starter": {
        "name": "pipeline.go",
        "code": "// Package pipeline: practice task W3-2. Replace each TODO with your solution.\npackage pipeline\n\nimport \"context\"\n\n// Generate sends nums one by one on the returned channel.\n// It closes the channel after the last value or as soon as ctx is done.\nfunc Generate(ctx context.Context, nums ...int) <-chan int {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Square sends n*n for every n received from in.\n// It closes its output when in is closed or ctx is done, even if in is never closed.\nfunc Square(ctx context.Context, in <-chan int) <-chan int {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Sum adds up every value from in until in is closed.\n// If ctx is done first, it returns 0 and ctx.Err().\nfunc Sum(ctx context.Context, in <-chan int) (int, error) {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "pipeline_test.go",
        "code": "package pipeline\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"runtime\"\n\t\"testing\"\n\t\"time\"\n)\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// sumWithin fails instead of hanging when a stage never closes its output.\nfunc sumWithin(t *testing.T, ctx context.Context, in <-chan int) (int, error) {\n\tt.Helper()\n\ttype result struct {\n\t\ttotal int\n\t\terr   error\n\t}\n\tdone := make(chan result, 1)\n\tgo func() {\n\t\ttotal, err := Sum(ctx, in)\n\t\tdone <- result{total, err}\n\t}()\n\tselect {\n\tcase r := <-done:\n\t\treturn r.total, r.err\n\tcase <-time.After(5 * time.Second):\n\t\tt.Fatal(\"Sum did not return: some stage never closed its output\")\n\t\treturn 0, nil\n\t}\n}\n\nfunc TestPipelineSum(t *testing.T) {\n\tctx := context.Background()\n\ttotal, err := sumWithin(t, ctx, Square(ctx, Generate(ctx, 1, 2, 3, 4)))\n\tif err != nil || total != 30 {\n\t\tt.Fatalf(\"got %d, %v; want 30, nil\", total, err)\n\t}\n}\n\nfunc TestEmptyInput(t *testing.T) {\n\tctx := context.Background()\n\ttotal, err := sumWithin(t, ctx, Square(ctx, Generate(ctx)))\n\tif err != nil || total != 0 {\n\t\tt.Fatalf(\"got %d, %v; want 0, nil\", total, err)\n\t}\n}\n\nfunc TestConsumerLeavesEarly(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tnums := make([]int, 10_000)\n\tfor i := range nums {\n\t\tnums[i] = i\n\t}\n\tsquares := Square(ctx, Generate(ctx, nums...))\n\tfor range 3 {\n\t\t<-squares\n\t}\n\t// An observation window, not synchronization: by now every stage is blocked on\n\t// its next send, so a send without a select on ctx.Done would never return.\n\ttime.Sleep(20 * time.Millisecond)\n\tcancel() // the consumer stops reading and says so\n\twaitUntil(t, \"all stages to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\nfunc TestSquareStopsWithForeignInput(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tin := make(chan int) // not ours: nobody will ever close it\n\tout := Square(ctx, in)\n\tcancel()\n\tselect {\n\tcase _, ok := <-out:\n\t\tif ok {\n\t\t\tt.Fatal(\"unexpected value after cancel\")\n\t\t}\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"Square did not close its output after cancel\")\n\t}\n\twaitUntil(t, \"Square to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\nfunc TestSumCancelled(t *testing.T) {\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\tin := make(chan int) // never closed\n\tif total, err := sumWithin(t, ctx, in); total != 0 || !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"got %d, %v; want 0, context.Canceled\", total, err)\n\t}\n}\n\n// Cancellation closes the upstream channels too, so Sum may see a closed input\n// and a done context at the same time: it must report the cancellation, never a\n// partial total with a nil error.\nfunc TestSumCancelledMidStream(t *testing.T) {\n\tfor range 100 {\n\t\tctx, cancel := context.WithCancel(context.Background())\n\t\tin := make(chan int)\n\t\ttype result struct {\n\t\t\ttotal int\n\t\t\terr   error\n\t\t}\n\t\tdone := make(chan result, 1)\n\t\tgo func() {\n\t\t\ttotal, err := Sum(ctx, in)\n\t\t\tdone <- result{total, err}\n\t\t}()\n\t\tin <- 5\n\t\tcancel()\n\t\tclose(in)\n\t\tselect {\n\t\tcase r := <-done:\n\t\t\tif r.total != 0 || !errors.Is(r.err, context.Canceled) {\n\t\t\t\tt.Fatalf(\"got %d, %v; want 0, context.Canceled\", r.total, r.err)\n\t\t\t}\n\t\tcase <-time.After(5 * time.Second):\n\t\t\tt.Fatal(\"Sum did not return\")\n\t\t}\n\t}\n}"
      },
      "solution": {
        "name": "pipeline.go",
        "code": "// Package pipeline is the reference solution for practice task W3-2.\npackage pipeline\n\nimport \"context\"\n\n// Generate sends nums one by one on the returned channel.\n// It closes the channel after the last value or as soon as ctx is done.\nfunc Generate(ctx context.Context, nums ...int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor _, n := range nums {\n\t\t\tselect {\n\t\t\tcase out <- n:\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}\n\n// Square sends n*n for every n received from in.\n// It closes its output when in is closed or ctx is done, even if in is never closed.\nfunc Square(ctx context.Context, in <-chan int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor {\n\t\t\tselect {\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\tcase n, ok := <-in:\n\t\t\t\tif !ok {\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t\tselect {\n\t\t\t\tcase out <- n * n:\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}\n\n// Sum adds up every value from in until in is closed.\n// If ctx is done, it returns 0 and ctx.Err(), even when in has closed too:\n// upstream stages close their outputs on cancellation as well.\nfunc Sum(ctx context.Context, in <-chan int) (int, error) {\n\ttotal := 0\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn 0, ctx.Err()\n\t\tcase n, ok := <-in:\n\t\t\tif !ok {\n\t\t\t\t// A closed input may be the result of the same cancellation.\n\t\t\t\tif err := ctx.Err(); err != nil {\n\t\t\t\t\treturn 0, err\n\t\t\t\t}\n\t\t\t\treturn total, nil\n\t\t\t}\n\t\t\ttotal += n\n\t\t}\n\t}\n}"
      }
    }
  },
  {
    "id": "p-fanin",
    "code": "W3-3",
    "week": 3,
    "title": "Fan-in: слияние каналов",
    "titleEN": "Fan-in: merging channels",
    "goalRU": "Объединить несколько входных каналов в один и закрыть выход ровно тогда, когда закрыты все входы.",
    "contractRU": [
      "Merge пересылает каждое значение каждого входа в выходной канал; порядок между входами не важен.",
      "Выход закрывается после закрытия всех входов или после отмены ctx.",
      "Merge не закрывает входы: они принадлежат своим отправителям.",
      "Без входов выход закрывается сразу; nil-вход игнорируется — он никогда не закроется."
    ],
    "contractEN": [
      "Merge forwards every value from every input to the output; order across inputs does not matter.",
      "The output is closed after all inputs are closed, or after ctx is done.",
      "Merge never closes the inputs: they belong to their senders.",
      "With no inputs the output closes at once; a nil input is ignored because it never closes."
    ],
    "planTasks": [
      "w3-wed-2",
      "w3-sat-1"
    ],
    "links": [
      "c13",
      "c14",
      "c18",
      "c22",
      "sim3"
    ],
    "hints": [
      "По горутине на вход; все они пишут в один out — значит, ни одна из них не может закрыть out.",
      "Отдельная горутина: wg.Wait(), затем close(out).",
      "Почему nil-вход опасен? Чтение из nil-канала блокирует навсегда, и WaitGroup не дождётся этой горутины, пока ctx не отменён."
    ],
    "talkEN": "One goroutine per input forwards values to a shared output. Because several goroutines send on the output, none of them may close it; a separate goroutine waits on a WaitGroup and closes the output once every forwarder has returned. A forwarder returns when its input is closed or the context is done. Merge never closes the inputs because it does not own them, and it skips nil inputs, which would block forever.",
    "pitfalls": [
      "close(out) в каждой пересылающей горутине → panic: close of closed channel или send on closed channel.",
      "wg.Add внутри горутины → close может случиться раньше первой пересылки.",
      "Один select по всем входам без отключения закрытых (присвоить nil) → горячий цикл на закрытом канале."
    ],
    "followUps": [
      "Сделай Merge двух входов без горутин на вход: один select-цикл, закрытый вход отключается присваиванием nil.",
      "reflect.Select для произвольного числа входов — когда это оправдано?"
    ],
    "fixture": "docs/verification/fixtures/practice/fanin",
    "files": {
      "starter": {
        "name": "fanin.go",
        "code": "// Package fanin: practice task W3-3. Replace the TODO with your solution.\npackage fanin\n\nimport \"context\"\n\n// Merge forwards every value from all inputs to the returned channel.\n// It closes the output after all inputs are closed, or after ctx is done.\n// Merge never closes the inputs: they belong to their senders. A nil input\n// never delivers and is never closed, so Merge ignores it.\nfunc Merge[T any](ctx context.Context, inputs ...<-chan T) <-chan T {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "fanin_test.go",
        "code": "package fanin\n\nimport (\n\t\"context\"\n\t\"runtime\"\n\t\"slices\"\n\t\"testing\"\n\t\"time\"\n)\n\nfunc source(values ...int) <-chan int {\n\tch := make(chan int)\n\tgo func() {\n\t\tdefer close(ch)\n\t\tfor _, v := range values {\n\t\t\tch <- v\n\t\t}\n\t}()\n\treturn ch\n}\n\nfunc collect[T any](t *testing.T, out <-chan T) []T {\n\tt.Helper()\n\tvar got []T\n\ttimeout := time.After(5 * time.Second)\n\tfor {\n\t\tselect {\n\t\tcase v, ok := <-out:\n\t\t\tif !ok {\n\t\t\t\treturn got\n\t\t\t}\n\t\t\tgot = append(got, v)\n\t\tcase <-timeout:\n\t\t\tt.Fatalf(\"output is not closed; received %d values\", len(got))\n\t\t}\n\t}\n}\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\nfunc TestMergeAll(t *testing.T) {\n\tctx := context.Background()\n\tgot := collect(t, Merge(ctx, source(1, 2, 3), source(10, 20), source(100)))\n\tslices.Sort(got)\n\tif want := []int{1, 2, 3, 10, 20, 100}; !slices.Equal(got, want) {\n\t\tt.Fatalf(\"got %v, want %v\", got, want)\n\t}\n}\n\nfunc TestNoInputs(t *testing.T) {\n\tif got := collect(t, Merge[int](context.Background())); len(got) != 0 {\n\t\tt.Fatalf(\"got %v, want nothing\", got)\n\t}\n}\n\nfunc TestNilInputIgnored(t *testing.T) {\n\tvar never chan int\n\tgot := collect(t, Merge(context.Background(), never, source(7)))\n\tif !slices.Equal(got, []int{7}) {\n\t\tt.Fatalf(\"got %v, want [7]\", got)\n\t}\n}\n\nfunc TestOutputClosedOnlyAfterAllInputs(t *testing.T) {\n\tctx := context.Background()\n\ta := make(chan int)\n\tb := make(chan int)\n\tout := Merge(ctx, a, b)\n\tclose(a)\n\t// b is still open, so out must still deliver values from b.\n\tgo func() { b <- 42 }()\n\tselect {\n\tcase v, ok := <-out:\n\t\tif !ok || v != 42 {\n\t\t\tt.Fatalf(\"got %d, %v; want 42, true: output closed too early?\", v, ok)\n\t\t}\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"value from the open input did not arrive\")\n\t}\n\tclose(b)\n\tif got := collect(t, out); len(got) != 0 {\n\t\tt.Fatalf(\"unexpected values %v\", got)\n\t}\n}\n\nfunc TestCancelWithOpenInputs(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\ta := make(chan int) // never closed\n\tb := make(chan int) // never closed\n\tout := Merge(ctx, a, b)\n\tcancel()\n\tcollect(t, out)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\n// The consumer cancels and stops reading. A forwarder blocked on sending to\n// the output must notice the cancellation, otherwise it leaks.\nfunc TestCancelWithoutReading(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\ta := make(chan int, 1) // open: only cancellation can stop the forwarders\n\tb := make(chan int, 1)\n\ta <- 1\n\tb <- 2\n\tout := Merge(ctx, a, b)\n\t// A design with one goroutine per input takes both values; a single-goroutine\n\t// design takes one. Either way a value is now waiting to be sent to out.\n\twaitUntil(t, \"Merge to take a value\", func() bool { return len(a)+len(b) < 2 })\n\tcancel()\n\twaitUntil(t, \"goroutines to exit while nobody reads\", func() bool { return runtime.NumGoroutine() <= before })\n\tcollect(t, out)\n}"
      },
      "solution": {
        "name": "fanin.go",
        "code": "// Package fanin is the reference solution for practice task W3-3.\npackage fanin\n\nimport (\n\t\"context\"\n\t\"sync\"\n)\n\n// Merge forwards every value from all inputs to the returned channel.\n// It closes the output after all inputs are closed, or after ctx is done.\n// Merge never closes the inputs: they belong to their senders. A nil input\n// never delivers and is never closed, so Merge ignores it.\nfunc Merge[T any](ctx context.Context, inputs ...<-chan T) <-chan T {\n\tout := make(chan T)\n\tvar wg sync.WaitGroup\n\tfor _, in := range inputs {\n\t\tif in == nil {\n\t\t\tcontinue\n\t\t}\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tfor {\n\t\t\t\tselect {\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\tcase v, ok := <-in:\n\t\t\t\t\tif !ok {\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t\tselect {\n\t\t\t\t\tcase out <- v:\n\t\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}()\n\t}\n\t// Several goroutines send to out, so none of them may close it: one closer waits for all.\n\tgo func() {\n\t\twg.Wait()\n\t\tclose(out)\n\t}()\n\treturn out\n}"
      }
    }
  },
  {
    "id": "p-counter",
    "code": "W3-4",
    "week": 3,
    "title": "Счётчик тремя способами",
    "titleEN": "A counter three ways",
    "goalRU": "Сделать один и тот же счётчик через mutex, atomic и горутину-владельца с каналами; убедиться, что все дают одинаковый результат под -race, и сравнить их бенчмарком без поспешных выводов.",
    "contractRU": [
      "Inc и Value безопасны при вызове из многих горутин; после всех Inc значение точное.",
      "MutexCounter — sync.Mutex; AtomicCounter — atomic.Int64; ChanCounter — значение принадлежит одной горутине, остальные общаются с ней через каналы.",
      "Close у ChanCounter останавливает горутину-владельца; после Close счётчик не используют.",
      "Бенчмарк запускай с разным -cpu и записывай цифры без вывода «X всегда быстрее»."
    ],
    "contractEN": [
      "Inc and Value are safe to call from many goroutines; after all Inc calls the value is exact.",
      "MutexCounter uses sync.Mutex; AtomicCounter uses atomic.Int64; ChanCounter gives the value to one goroutine, and others talk to it over channels.",
      "ChanCounter.Close stops the owner goroutine; the counter is not used after Close.",
      "Run the benchmark with different -cpu values and record the numbers without concluding that X is always faster."
    ],
    "planTasks": [
      "w3-thu-2",
      "w3-sat-1"
    ],
    "links": [
      "c15",
      "c20",
      "c21",
      "sim5",
      "sim8"
    ],
    "hints": [
      "atomic.Int64 (Go 1.19+) не нужно инициализировать; копировать его после использования нельзя — счётчики живут по указателю.",
      "У ChanCounter один select-цикл: запрос Inc, запрос значения (с каналом для ответа) и done.",
      "Inc у ChanCounter возвращается, когда владелец принял запрос, — поэтому следующий Value увидит изменение."
    ],
    "talkEN": "For a single number, an atomic add is the simplest and usually the cheapest. A mutex is the general tool, and I need it as soon as an invariant spans more than one field. The channel version gives the state to one owner goroutine and serializes access through messages; it is the most expensive per operation here, but the pattern pays off when the owner does more than count, for example batching or I/O. All three are correct under the race detector; which one is faster depends on contention and the number of CPUs, so I measure instead of assuming.",
    "pitfalls": [
      "Value без блокировки у MutexCounter — гонка данных, даже если «только читаю».",
      "Копирование MutexCounter или AtomicCounter по значению — копия независима; go vet (copylocks) предупредит.",
      "Забыть Close у ChanCounter — горутина-владелец живёт до конца программы."
    ],
    "followUps": [
      "Добавь Reset(), возвращающий старое значение, и пару count+sum для среднего — где хватает atomic (Swap), а где нужен Mutex?",
      "Счётчики по ключам: map и Mutex против sync.Map — что когда?"
    ],
    "note": "Пример одного запуска (2 vCPU, Go 1.24.7, -benchtime=200ms): mutex ≈ 28 нс, atomic ≈ 19 нс, канал ≈ 390 нс на операцию. На другой машине и с другим -cpu цифры будут другими.",
    "fixture": "docs/verification/fixtures/practice/counter",
    "files": {
      "starter": {
        "name": "counter.go",
        "code": "// Package counter: practice task W3-4. One counter, three ways to make it\n// safe for concurrent use. Replace each TODO with your solution.\npackage counter\n\nimport (\n\t\"sync\"\n\t\"sync/atomic\"\n)\n\n// Counter is safe for concurrent use. Close releases resources;\n// the counter must not be used after Close.\ntype Counter interface {\n\tInc()\n\tValue() int64\n\tClose()\n}\n\n// MutexCounter guards the value with a mutex.\ntype MutexCounter struct {\n\tmu sync.Mutex\n\tn  int64\n}\n\nfunc NewMutexCounter() Counter { return &MutexCounter{} }\n\nfunc (c *MutexCounter) Inc()         { panic(\"TODO\") }\nfunc (c *MutexCounter) Value() int64 { panic(\"TODO\") }\nfunc (c *MutexCounter) Close()       {}\n\n// AtomicCounter uses one atomic word.\ntype AtomicCounter struct {\n\tn atomic.Int64\n}\n\nfunc NewAtomicCounter() Counter { return &AtomicCounter{} }\n\nfunc (c *AtomicCounter) Inc()         { panic(\"TODO\") }\nfunc (c *AtomicCounter) Value() int64 { panic(\"TODO\") }\nfunc (c *AtomicCounter) Close()       {}\n\n// ChanCounter gives the value to one owner goroutine; others talk to it over channels.\ntype ChanCounter struct {\n\t// TODO: channels to the owner goroutine\n}\n\n// NewChanCounter starts the owner goroutine.\nfunc NewChanCounter() Counter {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\nfunc (c *ChanCounter) Inc()         { panic(\"TODO\") }\nfunc (c *ChanCounter) Value() int64 { panic(\"TODO\") }\n\n// Close stops the owner goroutine.\nfunc (c *ChanCounter) Close() { panic(\"TODO\") }"
      },
      "tests": {
        "name": "counter_test.go",
        "code": "package counter\n\nimport (\n\t\"runtime\"\n\t\"sync\"\n\t\"testing\"\n\t\"time\"\n)\n\nvar impls = []struct {\n\tname string\n\tnew  func() Counter\n}{\n\t{\"mutex\", NewMutexCounter},\n\t{\"atomic\", NewAtomicCounter},\n\t{\"channel\", NewChanCounter},\n}\n\nfunc TestConcurrentInc(t *testing.T) {\n\tconst goroutines, perG = 50, 1000\n\tfor _, impl := range impls {\n\t\tt.Run(impl.name, func(t *testing.T) {\n\t\t\tc := impl.new()\n\t\t\tdefer c.Close()\n\t\t\tvar wg sync.WaitGroup\n\t\t\tstop := make(chan struct{})\n\t\t\treaderDone := make(chan struct{})\n\t\t\tgo func() { // reads race with writes unless Value synchronizes too\n\t\t\t\tdefer close(readerDone)\n\t\t\t\tvar last int64\n\t\t\t\tfor {\n\t\t\t\t\tselect {\n\t\t\t\t\tcase <-stop:\n\t\t\t\t\t\treturn\n\t\t\t\t\tdefault:\n\t\t\t\t\t}\n\t\t\t\t\tv := c.Value()\n\t\t\t\t\tif v < last {\n\t\t\t\t\t\tt.Errorf(\"Value() went back from %d to %d\", last, v)\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t\tlast = v\n\t\t\t\t}\n\t\t\t}()\n\t\t\twg.Add(goroutines)\n\t\t\tfor range goroutines {\n\t\t\t\tgo func() {\n\t\t\t\t\tdefer wg.Done()\n\t\t\t\t\tfor range perG {\n\t\t\t\t\t\tc.Inc()\n\t\t\t\t\t}\n\t\t\t\t}()\n\t\t\t}\n\t\t\twg.Wait()\n\t\t\tclose(stop)\n\t\t\t<-readerDone\n\t\t\tif got := c.Value(); got != goroutines*perG {\n\t\t\t\tt.Fatalf(\"Value() = %d, want %d\", got, goroutines*perG)\n\t\t\t}\n\t\t})\n\t}\n}\n\nfunc TestCloseStopsOwnerGoroutine(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tc := NewChanCounter()\n\tc.Inc()\n\tif got := c.Value(); got != 1 {\n\t\tt.Fatalf(\"Value() = %d, want 1\", got)\n\t}\n\tc.Close()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor runtime.NumGoroutine() > before {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatal(\"owner goroutine is still running after Close\")\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// Compare on your machine, with different -cpu values. The numbers depend on\n// the CPU count and contention; they do not prove that one way is always faster.\nfunc BenchmarkInc(b *testing.B) {\n\tfor _, impl := range impls {\n\t\tb.Run(impl.name, func(b *testing.B) {\n\t\t\tc := impl.new()\n\t\t\tdefer c.Close()\n\t\t\tb.RunParallel(func(pb *testing.PB) {\n\t\t\t\tfor pb.Next() {\n\t\t\t\t\tc.Inc()\n\t\t\t\t}\n\t\t\t})\n\t\t})\n\t}\n}"
      },
      "solution": {
        "name": "counter.go",
        "code": "// Package counter is the reference solution for practice task W3-4:\n// one counter, three ways to make it safe for concurrent use.\npackage counter\n\nimport (\n\t\"sync\"\n\t\"sync/atomic\"\n)\n\n// Counter is safe for concurrent use. Close releases resources;\n// the counter must not be used after Close.\ntype Counter interface {\n\tInc()\n\tValue() int64\n\tClose()\n}\n\n// MutexCounter guards the value with a mutex.\ntype MutexCounter struct {\n\tmu sync.Mutex\n\tn  int64\n}\n\nfunc NewMutexCounter() Counter { return &MutexCounter{} }\n\nfunc (c *MutexCounter) Inc() {\n\tc.mu.Lock()\n\tc.n++\n\tc.mu.Unlock()\n}\n\nfunc (c *MutexCounter) Value() int64 {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\treturn c.n\n}\n\nfunc (c *MutexCounter) Close() {}\n\n// AtomicCounter uses one atomic word: enough when the state is a single number.\ntype AtomicCounter struct {\n\tn atomic.Int64\n}\n\nfunc NewAtomicCounter() Counter { return &AtomicCounter{} }\n\nfunc (c *AtomicCounter) Inc()         { c.n.Add(1) }\nfunc (c *AtomicCounter) Value() int64 { return c.n.Load() }\nfunc (c *AtomicCounter) Close()       {}\n\n// ChanCounter gives the value to one owner goroutine; others talk to it over channels.\ntype ChanCounter struct {\n\tinc  chan struct{}\n\tget  chan chan int64\n\tdone chan struct{}\n}\n\nfunc NewChanCounter() Counter {\n\tc := &ChanCounter{\n\t\tinc:  make(chan struct{}),\n\t\tget:  make(chan chan int64),\n\t\tdone: make(chan struct{}),\n\t}\n\tgo c.loop()\n\treturn c\n}\n\nfunc (c *ChanCounter) loop() {\n\tvar n int64 // only this goroutine touches n\n\tfor {\n\t\tselect {\n\t\tcase <-c.inc:\n\t\t\tn++\n\t\tcase reply := <-c.get:\n\t\t\treply <- n\n\t\tcase <-c.done:\n\t\t\treturn\n\t\t}\n\t}\n}\n\n// Inc returns after the owner has received the request, so a later Value sees it.\nfunc (c *ChanCounter) Inc() { c.inc <- struct{}{} }\n\nfunc (c *ChanCounter) Value() int64 {\n\treply := make(chan int64)\n\tc.get <- reply\n\treturn <-reply\n}\n\n// Close stops the owner goroutine.\nfunc (c *ChanCounter) Close() { close(c.done) }"
      }
    }
  },
  {
    "id": "p-safecache",
    "code": "W3-5",
    "week": 3,
    "title": "SafeCache: инвариант под RWMutex",
    "titleEN": "SafeCache: an invariant under RWMutex",
    "goalRU": "Сделать кеш, безопасный для конкурентного использования, который держит составной инвариант и не выпускает наружу ссылки на свои данные.",
    "contractRU": [
      "Set, Get, Delete, Len, Bytes, Snapshot безопасны при вызове из многих горутин.",
      "Инвариант: Bytes() всегда равен сумме len(Value) по всем записям; он меняется под той же блокировкой, что и map.",
      "Get и Snapshot возвращают копии: изменение результата не меняет кеш.",
      "Set копирует входные срезы: изменения у вызывающего после Set не попадают в кеш.",
      "Чтения — под RLock, изменения — под Lock."
    ],
    "contractEN": [
      "Set, Get, Delete, Len, Bytes and Snapshot are safe to call from many goroutines.",
      "Invariant: Bytes() always equals the sum of len(Value) over all items; it changes under the same lock as the map.",
      "Get and Snapshot return copies: changing a result does not change the cache.",
      "Set copies the input slices: changes the caller makes after Set do not reach the cache.",
      "Reads take RLock, changes take Lock."
    ],
    "planTasks": [
      "w3-thu-2",
      "w3-thu-3",
      "w3-sat-1"
    ],
    "links": [
      "c15",
      "c21",
      "q13",
      "q14"
    ],
    "hints": [
      "Срез — это заголовок с указателем на общий массив. Вернуть сохранённый Item как есть — значит отдать память кеша без блокировки.",
      "slices.Clone копирует элементы; строки неизменяемы, поэтому для []string достаточно копии среза.",
      "Копию входа сделай до Lock — под блокировкой меньше работы.",
      "Set существующего ключа: сначала вычти размер старого значения."
    ],
    "talkEN": "The cache keeps a map and a byte total that must always agree, so both change under the same lock, and readers take a read lock. The subtle part is aliasing: an item holds slices, and a slice shares its backing array. If Get returned the stored item, a caller could modify cache memory without any lock, which is a data race and silently changes cached data behind the lock. So I copy on the way in and on the way out. RWMutex pays off only when reads dominate and read sections are long enough to outweigh its extra cost; otherwise a plain Mutex is as fast or faster, so I'd benchmark.",
    "pitfalls": [
      "Вернуть сохранённый Item без копии → гонка данных, когда вызывающий его меняет.",
      "Менять map под RLock → гонка: RLock разрешает только чтение.",
      "Обновлять bytes вне блокировки → читатели видят временно ложный инвариант.",
      "Повысить RLock до Lock нельзя: отпусти RLock, возьми Lock и перепроверь состояние."
    ],
    "followUps": [
      "Добавь TTL: записи истекают — кто и когда их удаляет?",
      "Ограничь Bytes сверху и вытесняй самые старые записи (LRU)."
    ],
    "fixture": "docs/verification/fixtures/practice/safecache",
    "files": {
      "starter": {
        "name": "safecache.go",
        "code": "// Package safecache: practice task W3-5. Replace each TODO with your solution.\npackage safecache\n\nimport \"sync\"\n\n// Item is a cached value. Its slices are mutable: decide what the cache must\n// do so that callers never share memory with it.\ntype Item struct {\n\tValue []byte\n\tTags  []string\n}\n\n// Cache is safe for concurrent use.\n//\n// Invariant, kept under one lock: bytes == sum of len(Value) over all items.\ntype Cache struct {\n\tmu    sync.RWMutex\n\titems map[string]Item\n\tbytes int\n}\n\nfunc New() *Cache {\n\treturn &Cache{items: make(map[string]Item)}\n}\n\nfunc (c *Cache) Set(key string, it Item)     { panic(\"TODO\") }\nfunc (c *Cache) Get(key string) (Item, bool) { panic(\"TODO\") }\nfunc (c *Cache) Delete(key string) bool      { panic(\"TODO\") }\nfunc (c *Cache) Len() int                    { panic(\"TODO\") }\nfunc (c *Cache) Bytes() int                  { panic(\"TODO\") } // total length of all values\nfunc (c *Cache) Snapshot() map[string]Item   { panic(\"TODO\") } // a deep copy of all items"
      },
      "tests": {
        "name": "safecache_test.go",
        "code": "package safecache\n\nimport (\n\t\"fmt\"\n\t\"math/rand/v2\"\n\t\"sync\"\n\t\"testing\"\n)\n\nfunc TestGetReturnsCopy(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"xyz\"), Tags: []string{\"t1\"}})\n\tit, _ := c.Get(\"a\")\n\tit.Value[0] = '!'\n\tit.Tags[0] = \"changed\"\n\tagain, _ := c.Get(\"a\")\n\tif string(again.Value) != \"xyz\" || again.Tags[0] != \"t1\" {\n\t\tt.Fatalf(\"cache changed through a returned item: %q %v\", again.Value, again.Tags)\n\t}\n}\n\nfunc TestSetCopiesInput(t *testing.T) {\n\tc := New()\n\tv := []byte(\"abc\")\n\ttags := []string{\"t1\"}\n\tc.Set(\"a\", Item{Value: v, Tags: tags})\n\tv[0] = '!'\n\ttags[0] = \"changed\"\n\tit, _ := c.Get(\"a\")\n\tif string(it.Value) != \"abc\" || it.Tags[0] != \"t1\" {\n\t\tt.Fatalf(\"cache changed through the caller's slices: %q %v\", it.Value, it.Tags)\n\t}\n}\n\nfunc TestSnapshotIsIndependent(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"one\"), Tags: []string{\"t1\"}})\n\tsnap := c.Snapshot()\n\tsnap[\"a\"].Value[0] = '!'\n\tsnap[\"a\"].Tags[0] = \"changed\"\n\tdelete(snap, \"a\")\n\tif it, ok := c.Get(\"a\"); !ok || string(it.Value) != \"one\" || it.Tags[0] != \"t1\" {\n\t\tt.Fatalf(\"cache changed through a snapshot: %q %v %v\", it.Value, it.Tags, ok)\n\t}\n}\n\nfunc TestDeleteMissing(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"1234\")})\n\tif c.Delete(\"missing\") {\n\t\tt.Fatal(\"Delete of a missing key reported true\")\n\t}\n\tif c.Bytes() != 4 || c.Len() != 1 {\n\t\tt.Fatalf(\"Bytes=%d Len=%d, want 4 and 1\", c.Bytes(), c.Len())\n\t}\n}\n\nfunc TestBytesInvariantUnderConcurrency(t *testing.T) {\n\tc := New()\n\tvar wg sync.WaitGroup\n\tfor g := range 8 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tr := rand.New(rand.NewPCG(uint64(g), 1))\n\t\t\tfor range 2000 {\n\t\t\t\tkey := fmt.Sprint(r.IntN(50))\n\t\t\t\tswitch r.IntN(5) {\n\t\t\t\tcase 0:\n\t\t\t\t\tc.Set(key, Item{Value: make([]byte, r.IntN(100))})\n\t\t\t\tcase 1:\n\t\t\t\t\tc.Delete(key)\n\t\t\t\tcase 2: // readers must lock too, or -race reports them\n\t\t\t\t\t_, _ = c.Len(), c.Bytes()\n\t\t\t\tcase 3:\n\t\t\t\t\tfor _, it := range c.Snapshot() {\n\t\t\t\t\t\t_ = len(it.Value)\n\t\t\t\t\t}\n\t\t\t\tdefault:\n\t\t\t\t\tif it, ok := c.Get(key); ok && len(it.Value) > 0 {\n\t\t\t\t\t\tit.Value[0] = 1 // must not race with the cache\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}()\n\t}\n\twg.Wait()\n\tsum := 0\n\tfor _, it := range c.Snapshot() {\n\t\tsum += len(it.Value)\n\t}\n\tif got := c.Bytes(); got != sum {\n\t\tt.Fatalf(\"Bytes() = %d, but values add up to %d\", got, sum)\n\t}\n}"
      },
      "solution": {
        "name": "safecache.go",
        "code": "// Package safecache is the reference solution for practice task W3-5.\npackage safecache\n\nimport (\n\t\"maps\"\n\t\"slices\"\n\t\"sync\"\n)\n\n// Item is a cached value. Its slices are mutable, so the cache copies them\n// on the way in and on the way out: callers never share memory with the cache.\ntype Item struct {\n\tValue []byte\n\tTags  []string\n}\n\nfunc (it Item) clone() Item {\n\treturn Item{Value: slices.Clone(it.Value), Tags: slices.Clone(it.Tags)}\n}\n\n// Cache is safe for concurrent use.\n//\n// Invariant, kept under one lock: bytes == sum of len(Value) over all items.\ntype Cache struct {\n\tmu    sync.RWMutex\n\titems map[string]Item\n\tbytes int\n}\n\nfunc New() *Cache {\n\treturn &Cache{items: make(map[string]Item)}\n}\n\nfunc (c *Cache) Set(key string, it Item) {\n\tit = it.clone() // copy before taking the lock: the caller may change its slices later\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tif old, ok := c.items[key]; ok {\n\t\tc.bytes -= len(old.Value)\n\t}\n\tc.items[key] = it\n\tc.bytes += len(it.Value)\n}\n\nfunc (c *Cache) Get(key string) (Item, bool) {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\tit, ok := c.items[key]\n\tif !ok {\n\t\treturn Item{}, false\n\t}\n\treturn it.clone(), true\n}\n\nfunc (c *Cache) Delete(key string) bool {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\told, ok := c.items[key]\n\tif !ok {\n\t\treturn false\n\t}\n\tdelete(c.items, key)\n\tc.bytes -= len(old.Value)\n\treturn true\n}\n\nfunc (c *Cache) Len() int {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\treturn len(c.items)\n}\n\n// Bytes returns the total length of all values.\nfunc (c *Cache) Bytes() int {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\treturn c.bytes\n}\n\n// Snapshot returns a deep copy of all items.\nfunc (c *Cache) Snapshot() map[string]Item {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\tout := make(map[string]Item, len(c.items))\n\tfor k, it := range maps.All(c.items) {\n\t\tout[k] = it.clone()\n\t}\n\treturn out\n}"
      }
    }
  },
  {
    "id": "p-parallelfetch",
    "code": "W4-1",
    "week": 4,
    "title": "ParallelFetch: errgroup с лимитом",
    "titleEN": "ParallelFetch with errgroup",
    "goalRU": "Скачать список адресов параллельно, но не больше limit одновременно; первая ошибка отменяет остальных, а результаты идут в порядке адресов.",
    "contractRU": [
      "limit < 1 считается как 1; одновременно выполняется не больше limit вызовов fetch.",
      "Без ошибок Fetch возвращает тела в порядке urls; пустой список — пустой результат.",
      "Первая ошибка отменяет контекст, который получают остальные вызовы, и новые вызовы после неё не начинаются.",
      "Fetch возвращает первую ошибку (с адресом в тексте) только после того, как все начатые вызовы вернулись.",
      "Если родительский ctx отменён — ошибка ctx.Err()."
    ],
    "contractEN": [
      "limit < 1 means 1; at most limit calls of fetch run at the same time.",
      "Without errors Fetch returns the bodies in the order of urls; an empty list gives an empty result.",
      "The first error cancels the context the other calls receive, and no new calls start after it.",
      "Fetch returns the first error, with the URL in its text, only after every started call has returned.",
      "If the parent ctx is cancelled, the error is ctx.Err()."
    ],
    "setup": [
      "go get golang.org/x/sync@v0.18.0   # работает с Go 1.24+; на Go 1.26+ можно @latest"
    ],
    "planTasks": [
      "w4-mon-2"
    ],
    "links": [
      "q16",
      "c22",
      "c18"
    ],
    "refs": [
      {
        "t": "golang.org/x/sync/errgroup",
        "u": "https://pkg.go.dev/golang.org/x/sync/errgroup"
      }
    ],
    "hints": [
      "errgroup.WithContext(ctx) даёт группу и gctx: gctx отменяется при первой ошибке. Передавай в fetch именно gctx.",
      "g.SetLimit(limit) — и g.Go сам ждёт свободного места. Это и есть ограничение параллельности, отдельный семафор не нужен.",
      "Порядок: заранее выдели bodies := make([]string, len(urls)) — каждая горутина пишет только свой индекс, блокировка не нужна.",
      "«Новые вызовы не начинаются»: проверяй gctx.Err() в цикле перед g.Go и в самой горутине — она могла ждать места, пока группа уже упала."
    ],
    "talkEN": "I use errgroup.WithContext with SetLimit. SetLimit bounds concurrency, and Go blocks until a slot is free. The group's context is cancelled on the first error, so I pass it to every fetch and check it before starting new work, which means no new calls after a failure. Wait returns the first error only after all started goroutines have returned, so nothing outlives Fetch. Results keep their order because each goroutine writes only its own index of a preallocated slice. After Wait, the group's context is done, so I never use it again.",
    "pitfalls": [
      "Передать в fetch родительский ctx вместо gctx → первая ошибка не отменяет остальных.",
      "Собирать результаты через append из горутин → гонка данных и потерянный порядок.",
      "Использовать gctx после Wait → он уже отменён, любой вызов с ним сразу получит ошибку.",
      "Горутина на каждый адрес без SetLimit → тысяча одновременных запросов."
    ],
    "followUps": [
      "Верни все ошибки, а не первую: чем заменить errgroup?",
      "Добавь таймаут на каждый вызов отдельно (context.WithTimeout внутри горутины).",
      "Сделай то же без x/sync: семафор на канале, WaitGroup и sync.Once для первой ошибки."
    ],
    "note": "Нужен модуль golang.org/x/sync. Последние выпуски требуют новых версий Go (v0.24 — Go 1.26); v0.18.0 работает с Go 1.24 и проверен здесь. Если go get пишет про более новый Go — укажи версию явно.",
    "fixture": "docs/verification/fixtures/practice-errgroup/parallelfetch",
    "files": {
      "starter": {
        "name": "parallelfetch.go",
        "code": "// Package parallelfetch: practice task W4-1. Replace the TODO with your solution.\n// Suggested tool: golang.org/x/sync/errgroup (WithContext, SetLimit, Go, Wait).\npackage parallelfetch\n\nimport \"context\"\n\n// Fetch calls fetch for every URL, with at most limit calls running at a time\n// (limit < 1 means 1), and returns the bodies in the order of urls.\n//\n// The first error cancels the context passed to the other calls, no new calls\n// start after it, and Fetch returns that error only after every started call\n// has returned.\nfunc Fetch(ctx context.Context, urls []string, limit int, fetch func(context.Context, string) (string, error)) ([]string, error) {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "parallelfetch_test.go",
        "code": "package parallelfetch\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"slices\"\n\t\"strings\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\nvar errBoom = errors.New(\"boom\")\n\nfunc TestAllSucceedInOrder(t *testing.T) {\n\turls := []string{\"a\", \"b\", \"c\", \"d\", \"e\"}\n\tgot, err := Fetch(context.Background(), urls, 2, func(_ context.Context, u string) (string, error) {\n\t\treturn strings.ToUpper(u), nil\n\t})\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif want := []string{\"A\", \"B\", \"C\", \"D\", \"E\"}; !slices.Equal(got, want) {\n\t\tt.Fatalf(\"got %v, want %v\", got, want)\n\t}\n}\n\nfunc TestEmpty(t *testing.T) {\n\tgot, err := Fetch(context.Background(), nil, 3, func(context.Context, string) (string, error) {\n\t\tt.Fatal(\"fetch must not be called\")\n\t\treturn \"\", nil\n\t})\n\tif err != nil || len(got) != 0 {\n\t\tt.Fatalf(\"got %v, %v; want empty, nil\", got, err)\n\t}\n}\n\nfunc TestLimit(t *testing.T) {\n\tconst limit = 3\n\tvar active, peak atomic.Int32\n\t_, err := Fetch(context.Background(), make([]string, 30), limit, func(context.Context, string) (string, error) {\n\t\tcur := active.Add(1)\n\t\tfor p := peak.Load(); cur > p && !peak.CompareAndSwap(p, cur); p = peak.Load() {\n\t\t}\n\t\ttime.Sleep(time.Millisecond) // keep calls overlapping\n\t\tactive.Add(-1)\n\t\treturn \"\", nil\n\t})\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif p := peak.Load(); p > limit {\n\t\tt.Fatalf(\"peak concurrency %d, want at most %d\", p, limit)\n\t}\n}\n\nfunc TestFirstErrorCancelsOthersAndWaitsForThem(t *testing.T) {\n\tvar active atomic.Int32\n\turls := []string{\"slow1\", \"slow2\", \"bad\", \"slow3\"}\n\tdone := make(chan struct{})\n\tvar got []string\n\tvar err error\n\tgo func() {\n\t\tdefer close(done)\n\t\tgot, err = Fetch(context.Background(), urls, 4, func(ctx context.Context, u string) (string, error) {\n\t\t\tactive.Add(1)\n\t\t\tdefer active.Add(-1)\n\t\t\tif u == \"bad\" {\n\t\t\t\treturn \"\", errBoom\n\t\t\t}\n\t\t\t<-ctx.Done() // a well-behaved call stops when its context is cancelled\n\t\t\treturn \"\", ctx.Err()\n\t\t})\n\t}()\n\tselect {\n\tcase <-done:\n\tcase <-time.After(5 * time.Second):\n\t\tt.Fatal(\"Fetch did not return: the error did not cancel the other calls\")\n\t}\n\tif !errors.Is(err, errBoom) || got != nil {\n\t\tt.Fatalf(\"got %v, %v; want nil and an error wrapping errBoom\", got, err)\n\t}\n\tif a := active.Load(); a != 0 {\n\t\tt.Fatalf(\"%d calls still running after Fetch returned\", a)\n\t}\n}\n\nfunc TestNoNewCallsAfterError(t *testing.T) {\n\tvar calls atomic.Int32\n\turls := []string{\"bad\", \"a\", \"b\", \"c\", \"d\"}\n\t_, err := Fetch(context.Background(), urls, 1, func(_ context.Context, u string) (string, error) {\n\t\tcalls.Add(1)\n\t\tif u == \"bad\" {\n\t\t\treturn \"\", errBoom\n\t\t}\n\t\treturn u, nil\n\t})\n\tif !errors.Is(err, errBoom) {\n\t\tt.Fatalf(\"got %v, want errBoom\", err)\n\t}\n\tif c := calls.Load(); c != 1 {\n\t\tt.Fatalf(\"%d calls made, want 1: no new calls after the first error\", c)\n\t}\n}\n\nfunc TestParentCancel(t *testing.T) {\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\t_, err := Fetch(ctx, []string{\"a\", \"b\"}, 2, func(ctx context.Context, u string) (string, error) {\n\t\treturn u, ctx.Err()\n\t})\n\tif !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"got %v, want context.Canceled\", err)\n\t}\n}"
      },
      "solution": {
        "name": "parallelfetch.go",
        "code": "// Package parallelfetch is the reference solution for practice task W4-1.\npackage parallelfetch\n\nimport (\n\t\"context\"\n\t\"fmt\"\n\n\t\"golang.org/x/sync/errgroup\"\n)\n\n// Fetch calls fetch for every URL, with at most limit calls running at a time\n// (limit < 1 means 1), and returns the bodies in the order of urls.\n//\n// The first error cancels the context passed to the other calls, no new calls\n// start after it, and Fetch returns that error only after every started call\n// has returned.\nfunc Fetch(ctx context.Context, urls []string, limit int, fetch func(context.Context, string) (string, error)) ([]string, error) {\n\tif limit < 1 {\n\t\tlimit = 1\n\t}\n\tg, gctx := errgroup.WithContext(ctx)\n\tg.SetLimit(limit)\n\tbodies := make([]string, len(urls))\n\tfor i, url := range urls {\n\t\tif gctx.Err() != nil {\n\t\t\tbreak // a call already failed or ctx is done: do not start more\n\t\t}\n\t\tg.Go(func() error { // blocks while limit calls are running\n\t\t\tif err := gctx.Err(); err != nil {\n\t\t\t\treturn err // the group failed while this call waited for a free slot\n\t\t\t}\n\t\t\tbody, err := fetch(gctx, url)\n\t\t\tif err != nil {\n\t\t\t\treturn fmt.Errorf(\"fetch %s: %w\", url, err)\n\t\t\t}\n\t\t\tbodies[i] = body // each goroutine writes only its own index\n\t\t\treturn nil\n\t\t})\n\t}\n\tif err := g.Wait(); err != nil {\n\t\treturn nil, err\n\t}\n\tif err := ctx.Err(); err != nil {\n\t\treturn nil, err // cancelled before every URL was started\n\t}\n\treturn bodies, nil\n}"
      }
    }
  },
  {
    "id": "p-ratelimit",
    "code": "W4-2",
    "week": 4,
    "title": "Rate limiter: token bucket",
    "titleEN": "Token bucket rate limiter",
    "goalRU": "Ограничить частоту событий: не больше rate в секунду в среднем и до burst подряд, с неблокирующим Allow и ожидающим Wait.",
    "contractRU": [
      "Новый лимитер полон: сразу разрешает burst событий, следующее — отказ.",
      "Токены восполняются со скоростью rate в секунду, но не больше burst, сколько бы ни прошло времени.",
      "Allow не блокирует: true и минус токен, если он есть; иначе false.",
      "Wait ждёт токен и возвращает nil или ctx.Err(), если ctx отменён раньше.",
      "Безопасен для многих горутин: при одновременных Allow разрешений не больше, чем токенов.",
      "NewWithClock принимает функцию времени, чтобы тесты не зависели от часов."
    ],
    "contractEN": [
      "A new limiter is full: it allows burst events at once and denies the next one.",
      "Tokens refill at rate per second, but never above burst, however long the pause.",
      "Allow never blocks: true and one token less if a token is there, otherwise false.",
      "Wait waits for a token and returns nil, or ctx.Err() if ctx is done first.",
      "Safe for many goroutines: concurrent Allow calls never grant more than the tokens available.",
      "NewWithClock takes a time function, so tests do not depend on the real clock."
    ],
    "planTasks": [
      "w4-tue-2"
    ],
    "links": [
      "c15",
      "c21"
    ],
    "refs": [
      {
        "t": "golang.org/x/time/rate",
        "u": "https://pkg.go.dev/golang.org/x/time/rate"
      }
    ],
    "hints": [
      "Не нужна горутина-тикер: храни tokens и время последнего пересчёта, а при каждом вызове добавляй elapsed × rate, но не больше burst.",
      "tokens — float64: за 5 мс при rate 100 набегает полтокена.",
      "Wait: под блокировкой посчитай, сколько ждать до целого токена, отпусти блокировку и жди в select с ctx.Done() и таймером.",
      "time.NewTimer и Stop при отмене, а не time.After в цикле: так таймер не живёт после выхода (до Go 1.23 он ещё и держал память)."
    ],
    "talkEN": "A token bucket holds up to burst tokens and refills at rate per second. I don't run a ticker goroutine; I store the token count and the time of the last refill, and on every call I add the tokens earned since then, capped at burst. Allow takes a token if there is one and never blocks. Wait computes how long until the next whole token, sleeps without holding the lock, in a select with ctx.Done, and tries again. The state is behind one mutex, so concurrent callers never get more than the tokens available. In production I would use golang.org/x/time/rate, which also offers Reserve and WaitN.",
    "pitfalls": [
      "Целочисленные токены → при малом интервале восполнение округляется в ноль и лимитер «залипает».",
      "Нет верхней границы → после долгой паузы приходит шквал запросов.",
      "Спать в Wait под блокировкой → все остальные вызовы стоят.",
      "Wait без ctx → отменённый запрос всё равно ждёт токен."
    ],
    "followUps": [
      "Добавь AllowN(n) и Reserve() — как в x/time/rate.",
      "Сделай лимитер на каждого клиента: map[string]*Limiter — и подумай, когда удалять неактивных.",
      "Чем token bucket отличается от фиксированного окна и скользящего лога?"
    ],
    "fixture": "docs/verification/fixtures/practice/ratelimit",
    "files": {
      "starter": {
        "name": "ratelimit.go",
        "code": "// Package ratelimit: practice task W4-2. A token bucket rate limiter.\n// Replace each TODO with your solution.\npackage ratelimit\n\nimport (\n\t\"context\"\n\t\"time\"\n)\n\n// Limiter allows events at rate tokens per second with bursts of up to burst events.\n// It starts full. It is safe for concurrent use.\ntype Limiter struct {\n\t// TODO: fields; remember that several goroutines call Allow at once\n}\n\n// New returns a limiter that uses the real clock.\nfunc New(rate float64, burst int) *Limiter {\n\treturn NewWithClock(rate, burst, time.Now)\n}\n\n// NewWithClock lets tests control time. rate must be > 0 and burst >= 1.\nfunc NewWithClock(rate float64, burst int, now func() time.Time) *Limiter {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Allow reports whether one event may happen now, and takes a token if so.\nfunc (l *Limiter) Allow() bool {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Wait blocks until a token is available or ctx is done.\nfunc (l *Limiter) Wait(ctx context.Context) error {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "ratelimit_test.go",
        "code": "package ratelimit\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"sync\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\n// fakeClock is moved by hand, so Allow tests do not depend on real time.\ntype fakeClock struct {\n\tmu sync.Mutex\n\tt  time.Time\n}\n\nfunc (c *fakeClock) Now() time.Time {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\treturn c.t\n}\n\nfunc (c *fakeClock) Advance(d time.Duration) {\n\tc.mu.Lock()\n\tc.t = c.t.Add(d)\n\tc.mu.Unlock()\n}\n\nfunc newFake(rate float64, burst int) (*Limiter, *fakeClock) {\n\tclock := &fakeClock{t: time.Unix(1_700_000_000, 0)}\n\treturn NewWithClock(rate, burst, clock.Now), clock\n}\n\nfunc allowN(l *Limiter, n int) int {\n\tok := 0\n\tfor range n {\n\t\tif l.Allow() {\n\t\t\tok++\n\t\t}\n\t}\n\treturn ok\n}\n\nfunc TestBurstThenDeny(t *testing.T) {\n\tl, _ := newFake(10, 3)\n\tif got := allowN(l, 5); got != 3 {\n\t\tt.Fatalf(\"allowed %d of 5 at once, want burst 3\", got)\n\t}\n}\n\nfunc TestRefillAtRate(t *testing.T) {\n\tl, clock := newFake(10, 3) // one token every 100 ms\n\tallowN(l, 3)\n\tclock.Advance(99 * time.Millisecond)\n\tif l.Allow() {\n\t\tt.Fatal(\"allowed before a whole token was earned\")\n\t}\n\tclock.Advance(time.Millisecond)\n\tif !l.Allow() {\n\t\tt.Fatal(\"denied after 100 ms at 10 tokens per second\")\n\t}\n\tif l.Allow() {\n\t\tt.Fatal(\"allowed a second event with one earned token\")\n\t}\n}\n\nfunc TestLongPauseCapsAtBurst(t *testing.T) {\n\tl, clock := newFake(10, 3)\n\tallowN(l, 3)\n\tclock.Advance(time.Hour)\n\tif got := allowN(l, 10); got != 3 {\n\t\tt.Fatalf(\"allowed %d after a long pause, want burst 3\", got)\n\t}\n}\n\nfunc TestConcurrentAllowNeverExceedsBurst(t *testing.T) {\n\tl, _ := newFake(1, 50) // the clock does not move: only the initial 50 tokens exist\n\tvar allowed atomic.Int32\n\tvar wg sync.WaitGroup\n\tfor range 20 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tfor range 100 {\n\t\t\t\tif l.Allow() {\n\t\t\t\t\tallowed.Add(1)\n\t\t\t\t}\n\t\t\t}\n\t\t}()\n\t}\n\twg.Wait()\n\tif got := allowed.Load(); got != 50 {\n\t\tt.Fatalf(\"allowed %d events, want exactly 50\", got)\n\t}\n}\n\nfunc TestWaitGetsTokens(t *testing.T) {\n\tl := New(200, 1) // real clock: a token every 5 ms\n\tstart := time.Now()\n\tfor range 3 {\n\t\tif err := l.Wait(context.Background()); err != nil {\n\t\t\tt.Fatal(err)\n\t\t}\n\t}\n\t// The first token is there at once; the next two need about 10 ms in total.\n\tif elapsed := time.Since(start); elapsed < 8*time.Millisecond {\n\t\tt.Fatalf(\"3 waits took %v; the limiter did not wait for tokens\", elapsed)\n\t}\n}\n\nfunc TestWaitHonoursCancel(t *testing.T) {\n\tl := New(0.001, 1) // the next token is ~17 minutes away\n\tl.Allow()\n\tctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)\n\tdefer cancel()\n\tdone := make(chan error, 1)\n\tgo func() { done <- l.Wait(ctx) }()\n\tselect {\n\tcase err := <-done:\n\t\tif !errors.Is(err, context.DeadlineExceeded) {\n\t\t\tt.Fatalf(\"got %v, want context.DeadlineExceeded\", err)\n\t\t}\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"Wait ignored the context deadline\")\n\t}\n}"
      },
      "solution": {
        "name": "ratelimit.go",
        "code": "// Package ratelimit is the reference solution for practice task W4-2:\n// a token bucket rate limiter.\npackage ratelimit\n\nimport (\n\t\"context\"\n\t\"sync\"\n\t\"time\"\n)\n\n// Limiter allows events at rate tokens per second with bursts of up to burst events.\n// It starts full. It is safe for concurrent use.\ntype Limiter struct {\n\tmu     sync.Mutex\n\trate   float64 // tokens added per second\n\tburst  float64 // bucket capacity\n\ttokens float64\n\tlast   time.Time\n\tnow    func() time.Time\n}\n\n// New returns a limiter that uses the real clock.\nfunc New(rate float64, burst int) *Limiter {\n\treturn NewWithClock(rate, burst, time.Now)\n}\n\n// NewWithClock lets tests control time. rate must be > 0 and burst >= 1.\nfunc NewWithClock(rate float64, burst int, now func() time.Time) *Limiter {\n\tif rate <= 0 || burst < 1 {\n\t\tpanic(\"ratelimit: rate must be > 0 and burst >= 1\")\n\t}\n\treturn &Limiter{rate: rate, burst: float64(burst), tokens: float64(burst), last: now(), now: now}\n}\n\n// refill adds the tokens earned since the last call. Callers hold mu.\nfunc (l *Limiter) refill() time.Time {\n\tnow := l.now()\n\tif elapsed := now.Sub(l.last); elapsed > 0 {\n\t\tl.tokens = min(l.burst, l.tokens+elapsed.Seconds()*l.rate)\n\t\tl.last = now\n\t}\n\treturn now\n}\n\n// Allow reports whether one event may happen now, and takes a token if so.\nfunc (l *Limiter) Allow() bool {\n\tl.mu.Lock()\n\tdefer l.mu.Unlock()\n\tl.refill()\n\tif l.tokens >= 1 {\n\t\tl.tokens--\n\t\treturn true\n\t}\n\treturn false\n}\n\n// Wait blocks until a token is available or ctx is done.\nfunc (l *Limiter) Wait(ctx context.Context) error {\n\tfor {\n\t\tl.mu.Lock()\n\t\tl.refill()\n\t\tif l.tokens >= 1 {\n\t\t\tl.tokens--\n\t\t\tl.mu.Unlock()\n\t\t\treturn nil\n\t\t}\n\t\t// Time until the next whole token; computed under the lock, slept without it.\n\t\tdelay := time.Duration((1 - l.tokens) / l.rate * float64(time.Second))\n\t\tl.mu.Unlock()\n\n\t\ttimer := time.NewTimer(delay)\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\ttimer.Stop()\n\t\t\treturn ctx.Err()\n\t\tcase <-timer.C:\n\t\t}\n\t}\n}"
      }
    }
  },
  {
    "id": "p-shutdown",
    "code": "W4-3",
    "week": 4,
    "title": "Graceful shutdown: HTTP, воркеры, зависимость",
    "titleEN": "Graceful shutdown in the right order",
    "goalRU": "Остановить сервис по сигналу так, чтобы запросы в полёте завершились, воркеры доделали работу, а база закрылась последней — и всё уложилось в таймаут.",
    "contractRU": [
      "Run обслуживает HTTP на ln, пока ctx не отменён (в main ctx — от signal.NotifyContext).",
      "После отмены: новые соединения не принимаются сразу, запросы в полёте завершаются (http.Server.Shutdown).",
      "Воркеры получают отмену только после того, как HTTP-запросы завершены: запрос в полёте ещё может отдать им работу. Run ждёт их выхода.",
      "Close вызывается последним и ровно один раз — даже после таймаута или ошибки Serve.",
      "Весь shutdown укладывается в Timeout; если нет — ошибка, для которой errors.Is(err, context.DeadlineExceeded), оставшиеся соединения закрываются принудительно.",
      "Если Serve упал сам, Run возвращает эту ошибку и всё равно выполняет остановку."
    ],
    "contractEN": [
      "Run serves HTTP on ln until ctx is done (in main, ctx comes from signal.NotifyContext).",
      "After that, new connections are refused at once and in-flight requests finish (http.Server.Shutdown).",
      "Workers are cancelled only after the HTTP requests have finished, because a request in flight may still hand them work. Run waits for them to exit.",
      "Close is called last and exactly once, even after a timeout or a Serve error.",
      "The whole shutdown fits in Timeout; otherwise the error satisfies errors.Is(err, context.DeadlineExceeded) and remaining connections are closed by force.",
      "If Serve fails on its own, Run returns that error and still shuts down."
    ],
    "planTasks": [
      "w4-wed-2"
    ],
    "links": [
      "c22",
      "c12"
    ],
    "refs": [
      {
        "t": "http.Server.Shutdown",
        "u": "https://pkg.go.dev/net/http#Server.Shutdown"
      },
      {
        "t": "signal.NotifyContext",
        "u": "https://pkg.go.dev/os/signal#NotifyContext"
      },
      {
        "t": "context.WithoutCancel",
        "u": "https://pkg.go.dev/context#WithoutCancel"
      }
    ],
    "hints": [
      "srv.Serve(ln) — в отдельной горутине, его ошибку — в канал с буфером 1. Главная горутина ждёт select: ctx.Done или ошибка Serve.",
      "Контекст воркеров не должен отменяться вместе с ctx: context.WithCancel(context.WithoutCancel(ctx)) (Go 1.21+), а cancel — после Shutdown.",
      "Один контекст с таймаутом на всю остановку: его же получают Shutdown и ожидание воркеров. Если Shutdown вернул ошибку — srv.Close().",
      "После Shutdown Serve возвращает http.ErrServerClosed — это не ошибка, её не надо возвращать.",
      "Ждать воркеров с таймаутом: wg.Wait() в горутине, которая закрывает done, и select на done и ctx.Done()."
    ],
    "talkEN": "On SIGTERM, signal.NotifyContext cancels the root context. I call Shutdown with a timeout: it closes the listener, so new connections are refused, and waits for in-flight requests. Only then do I cancel the workers, because a request that is still running may hand them a job; their context is derived with WithoutCancel so the signal alone doesn't stop them. I wait for the workers within the same deadline and close the database last, after nothing can use it. If the deadline passes, I force-close the connections and report an error that wraps DeadlineExceeded. The order is the point: stop intake, drain, then release dependencies.",
    "pitfalls": [
      "srv.Close() вместо Shutdown → запросы в полёте обрываются.",
      "Отменить воркеров вместе с сигналом → запрос в полёте блокируется, отдавая работу, и Shutdown висит до таймаута.",
      "Закрыть базу до выхода воркеров → воркер получает «database is closed» посреди работы.",
      "Shutdown с context.Background() → остановка может висеть бесконечно.",
      "Считать http.ErrServerClosed ошибкой → каждый штатный shutdown выглядит как сбой."
    ],
    "followUps": [
      "Kubernetes: после SIGTERM под ещё несколько секунд получает трафик. Добавь readiness, который сразу отвечает 503, и паузу перед Shutdown.",
      "Shutdown не ждёт hijacked-соединения (WebSocket): как закрыть их — RegisterOnShutdown?",
      "Перепиши на errgroup: Serve, воркеры и ожидание сигнала как члены одной группы."
    ],
    "fixture": "docs/verification/fixtures/practice/shutdown",
    "files": {
      "starter": {
        "name": "shutdown.go",
        "code": "// Package shutdown: practice task W4-3. Replace the TODO with your solution.\npackage shutdown\n\nimport (\n\t\"context\"\n\t\"net\"\n\t\"net/http\"\n\t\"time\"\n)\n\n// App is an HTTP service with background workers and one dependency, such as\n// a database, that the handlers and workers use.\ntype App struct {\n\tHandler http.Handler\n\t// Workers run until their context is done; each finishes its current job first.\n\tWorkers []func(ctx context.Context)\n\t// Close releases the dependency. Run calls it once, last.\n\tClose func() error\n\t// Timeout is the budget for the whole shutdown.\n\tTimeout time.Duration\n}\n\n// Run serves HTTP on ln until ctx is done, then shuts down in order:\n// HTTP (no new connections, in-flight requests finish) → workers → Close.\n//\n// In main:\n//\n//\tctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)\n//\tdefer stop()\n//\tln, err := net.Listen(\"tcp\", \":8080\")\n//\t...\n//\terr = app.Run(ctx, ln)\nfunc (a *App) Run(ctx context.Context, ln net.Listener) error {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "shutdown_test.go",
        "code": "package shutdown\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"io\"\n\t\"net\"\n\t\"net/http\"\n\t\"slices\"\n\t\"sync\"\n\t\"testing\"\n\t\"time\"\n)\n\n// events is a goroutine-safe log of what happened, in order.\ntype events struct {\n\tmu   sync.Mutex\n\tlist []string\n}\n\nfunc (e *events) add(s string) {\n\te.mu.Lock()\n\tdefer e.mu.Unlock()\n\te.list = append(e.list, s)\n}\n\nfunc (e *events) all() []string {\n\te.mu.Lock()\n\tdefer e.mu.Unlock()\n\treturn slices.Clone(e.list)\n}\n\nfunc listen(t *testing.T) net.Listener {\n\tt.Helper()\n\tln, err := net.Listen(\"tcp\", \"127.0.0.1:0\")\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\treturn ln\n}\n\n// start runs app in the background; the returned channel delivers Run's result.\nfunc start(app *App, ctx context.Context, ln net.Listener) <-chan error {\n\tdone := make(chan error, 1)\n\tgo func() { done <- app.Run(ctx, ln) }()\n\treturn done\n}\n\n// wait fails instead of hanging when Run does not return.\nfunc wait(t *testing.T, done <-chan error) error {\n\tt.Helper()\n\tselect {\n\tcase err := <-done:\n\t\treturn err\n\tcase <-time.After(5 * time.Second):\n\t\tt.Fatal(\"Run did not return\")\n\t\treturn nil\n\t}\n}\n\n// waitRefused waits until the server stops accepting new connections:\n// the sign that shutdown has begun.\nfunc waitRefused(t *testing.T, addr string) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor {\n\t\tconn, err := net.Dial(\"tcp\", addr)\n\t\tif err != nil {\n\t\t\treturn\n\t\t}\n\t\tconn.Close()\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatal(\"still accepting new connections after shutdown began\")\n\t\t}\n\t\ttime.Sleep(5 * time.Millisecond)\n\t}\n}\n\nfunc get(url string) (string, error) {\n\tresp, err := http.Get(url)\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\tdefer resp.Body.Close()\n\tb, err := io.ReadAll(resp.Body)\n\treturn string(b), err\n}\n\nfunc TestServesThenStops(t *testing.T) {\n\tvar closes events\n\tapp := &App{\n\t\tHandler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, \"ok\") }),\n\t\tClose:   func() error { closes.add(\"close\"); return nil },\n\t\tTimeout: 2 * time.Second,\n\t}\n\tln := listen(t)\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := start(app, ctx, ln)\n\tif body, err := get(\"http://\" + ln.Addr().String()); err != nil || body != \"ok\" {\n\t\tt.Fatalf(\"GET = %q, %v; want ok\", body, err)\n\t}\n\tcancel()\n\tif err := wait(t, done); err != nil {\n\t\tt.Fatalf(\"Run = %v, want nil\", err)\n\t}\n\tif got := closes.all(); len(got) != 1 {\n\t\tt.Fatalf(\"Close called %d times, want once\", len(got))\n\t}\n}\n\n// A request in flight finishes; new connections are refused meanwhile.\nfunc TestInFlightRequestFinishes(t *testing.T) {\n\tstarted, release := make(chan struct{}), make(chan struct{})\n\tapp := &App{\n\t\tHandler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tclose(started)\n\t\t\t<-release\n\t\t\tio.WriteString(w, \"done\")\n\t\t}),\n\t\tTimeout: 3 * time.Second,\n\t}\n\tln := listen(t)\n\taddr := ln.Addr().String()\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := start(app, ctx, ln)\n\n\ttype reply struct {\n\t\tbody string\n\t\terr  error\n\t}\n\treplies := make(chan reply, 1)\n\tgo func() {\n\t\tbody, err := get(\"http://\" + addr)\n\t\treplies <- reply{body, err}\n\t}()\n\t<-started\n\tcancel()\n\twaitRefused(t, addr)\n\tselect {\n\tcase err := <-done:\n\t\tt.Fatalf(\"Run returned %v while a request was still in flight\", err)\n\tdefault:\n\t}\n\n\tclose(release)\n\tif r := <-replies; r.err != nil || r.body != \"done\" {\n\t\tt.Fatalf(\"in-flight request got %q, %v; want done\", r.body, r.err)\n\t}\n\tif err := wait(t, done); err != nil {\n\t\tt.Fatalf(\"Run = %v, want nil\", err)\n\t}\n}\n\n// Order: the request finishes, the worker still takes its job, then the\n// worker stops, and the dependency closes last.\nfunc TestShutdownOrder(t *testing.T) {\n\tvar log events\n\tjobs := make(chan string)\n\tstarted, release := make(chan struct{}), make(chan struct{})\n\tapp := &App{\n\t\tHandler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tclose(started)\n\t\t\t<-release\n\t\t\tjobs <- \"job from request\" // a worker must still be there to take it\n\t\t\tlog.add(\"request done\")\n\t\t}),\n\t\tWorkers: []func(context.Context){func(ctx context.Context) {\n\t\t\tfor {\n\t\t\t\tselect {\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\tlog.add(\"worker stopped\")\n\t\t\t\t\treturn\n\t\t\t\tcase j := <-jobs:\n\t\t\t\t\tlog.add(\"worker did \" + j)\n\t\t\t\t}\n\t\t\t}\n\t\t}},\n\t\tClose:   func() error { log.add(\"dependency closed\"); return nil },\n\t\tTimeout: 3 * time.Second,\n\t}\n\tln := listen(t)\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := start(app, ctx, ln)\n\tgo get(\"http://\" + ln.Addr().String())\n\t<-started\n\tcancel()\n\twaitRefused(t, ln.Addr().String()) // shutdown has begun; the request is still in flight\n\tclose(release)\n\tif err := wait(t, done); err != nil {\n\t\tt.Fatalf(\"Run = %v, want nil\", err)\n\t}\n\tgot := log.all()\n\tidx := func(s string) int { return slices.Index(got, s) }\n\tif idx(\"worker did job from request\") < 0 {\n\t\tt.Fatalf(\"the job from the in-flight request was lost: %v\", got)\n\t}\n\tif idx(\"worker stopped\") < idx(\"worker did job from request\") {\n\t\tt.Fatalf(\"worker stopped before taking the job: %v\", got)\n\t}\n\tif got[len(got)-1] != \"dependency closed\" || idx(\"dependency closed\") != len(got)-1 {\n\t\tt.Fatalf(\"dependency must close last and once: %v\", got)\n\t}\n}\n\n// A request that never finishes: Run gives up after Timeout, reports it,\n// and still closes the dependency.\nfunc TestTimeout(t *testing.T) {\n\tstarted, release := make(chan struct{}), make(chan struct{})\n\tt.Cleanup(func() { close(release) })\n\tvar log events\n\tapp := &App{\n\t\tHandler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tclose(started)\n\t\t\t<-release\n\t\t}),\n\t\tClose:   func() error { log.add(\"dependency closed\"); return nil },\n\t\tTimeout: 100 * time.Millisecond,\n\t}\n\tln := listen(t)\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := start(app, ctx, ln)\n\tgo get(\"http://\" + ln.Addr().String())\n\t<-started\n\tbegan := time.Now()\n\tcancel()\n\terr := wait(t, done)\n\tif !errors.Is(err, context.DeadlineExceeded) {\n\t\tt.Fatalf(\"Run = %v, want an error that wraps context.DeadlineExceeded\", err)\n\t}\n\tif took := time.Since(began); took > 2*time.Second {\n\t\tt.Fatalf(\"Run took %v with a 100ms timeout\", took)\n\t}\n\tif got := log.all(); !slices.Equal(got, []string{\"dependency closed\"}) {\n\t\tt.Fatalf(\"dependency not closed after a timeout: %v\", got)\n\t}\n}\n\n// A worker that ignores cancellation also counts against the timeout.\nfunc TestStuckWorker(t *testing.T) {\n\trelease := make(chan struct{})\n\tt.Cleanup(func() { close(release) })\n\tapp := &App{\n\t\tHandler: http.NotFoundHandler(),\n\t\tWorkers: []func(context.Context){func(context.Context) { <-release }},\n\t\tTimeout: 100 * time.Millisecond,\n\t}\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := start(app, ctx, listen(t))\n\tcancel()\n\tif err := wait(t, done); !errors.Is(err, context.DeadlineExceeded) {\n\t\tt.Fatalf(\"Run = %v, want an error that wraps context.DeadlineExceeded\", err)\n\t}\n}\n\n// If serving fails, Run reports it and still cleans up.\nfunc TestServeError(t *testing.T) {\n\tln := listen(t)\n\tln.Close() // Serve fails at once\n\tvar log events\n\tapp := &App{\n\t\tHandler: http.NotFoundHandler(),\n\t\tClose:   func() error { log.add(\"dependency closed\"); return nil },\n\t\tTimeout: time.Second,\n\t}\n\terr := wait(t, start(app, context.Background(), ln))\n\tif err == nil {\n\t\tt.Fatal(\"Run = nil, want the Serve error\")\n\t}\n\tif got := log.all(); len(got) != 1 {\n\t\tt.Fatalf(\"dependency closed %d times, want once\", len(got))\n\t}\n}"
      },
      "solution": {
        "name": "shutdown.go",
        "code": "// Package shutdown is the reference solution for practice task W4-3:\n// graceful shutdown of an HTTP server with background workers and a dependency.\npackage shutdown\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"fmt\"\n\t\"net\"\n\t\"net/http\"\n\t\"sync\"\n\t\"time\"\n)\n\n// App is an HTTP service with background workers and one dependency, such as\n// a database, that the handlers and workers use.\ntype App struct {\n\tHandler http.Handler\n\t// Workers run until their context is done; each finishes its current job first.\n\tWorkers []func(ctx context.Context)\n\t// Close releases the dependency. Run calls it once, last.\n\tClose func() error\n\t// Timeout is the budget for the whole shutdown.\n\tTimeout time.Duration\n}\n\n// Run serves HTTP on ln until ctx is done, then shuts down in order:\n//  1. stop accepting connections and let in-flight requests finish;\n//  2. only then stop the workers, because a request may still hand them work,\n//     and wait for them;\n//  3. close the dependency last.\n//\n// In main, ctx comes from signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM).\nfunc (a *App) Run(ctx context.Context, ln net.Listener) error {\n\tsrv := &http.Server{Handler: a.Handler, ReadHeaderTimeout: 5 * time.Second}\n\n\t// Workers must outlive ctx until the HTTP side has drained, so their context\n\t// keeps ctx's values but not its cancellation (Go 1.21+).\n\tworkCtx, stopWorkers := context.WithCancel(context.WithoutCancel(ctx))\n\tdefer stopWorkers()\n\tvar wg sync.WaitGroup\n\tfor _, work := range a.Workers {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\twork(workCtx)\n\t\t}()\n\t}\n\n\tserveErr := make(chan error, 1)\n\tgo func() { serveErr <- srv.Serve(ln) }()\n\n\tvar errs []error\n\tserved := false\n\tselect {\n\tcase <-ctx.Done():\n\tcase err := <-serveErr: // Serve failed before anyone asked to stop\n\t\tserved = true\n\t\terrs = append(errs, fmt.Errorf(\"serve: %w\", err))\n\t}\n\n\tsctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), a.Timeout)\n\tdefer cancel()\n\n\t// 1. Close the listener, then wait for in-flight requests to finish.\n\tif err := srv.Shutdown(sctx); err != nil {\n\t\tsrv.Close() // out of time: drop the remaining connections\n\t\terrs = append(errs, fmt.Errorf(\"http shutdown: %w\", err))\n\t}\n\tif !served {\n\t\t// Serve returns ErrServerClosed as soon as Shutdown closes the listener.\n\t\tif err := <-serveErr; !errors.Is(err, http.ErrServerClosed) {\n\t\t\terrs = append(errs, fmt.Errorf(\"serve: %w\", err))\n\t\t}\n\t}\n\n\t// 2. No handler can hand out work any more: stop the workers and wait for them.\n\tstopWorkers()\n\tdone := make(chan struct{})\n\tgo func() {\n\t\twg.Wait()\n\t\tclose(done)\n\t}()\n\tselect {\n\tcase <-done:\n\tcase <-sctx.Done():\n\t\terrs = append(errs, fmt.Errorf(\"workers: %w\", sctx.Err()))\n\t}\n\n\t// 3. The dependency goes last, even after a timeout: the process is exiting.\n\tif a.Close != nil {\n\t\tif err := a.Close(); err != nil {\n\t\t\terrs = append(errs, fmt.Errorf(\"close: %w\", err))\n\t\t}\n\t}\n\treturn errors.Join(errs...)\n}"
      }
    }
  },
  {
    "id": "p-leak",
    "code": "W4-4",
    "week": 4,
    "title": "Утечка горутин: написать, найти профилем, исправить",
    "titleEN": "A goroutine leak: write it, find it, fix it",
    "goalRU": "Намеренно написать утечку, увидеть её в goroutine-профиле и исправить так, чтобы тест подтвердил: собственных горутин не осталось.",
    "contractRU": [
      "FirstLeaky опрашивает все бэкенды в горутинах и возвращает первый ответ; канал без буфера — проигравшие горутины навсегда блокируются на отправке.",
      "Тест находит утечку по goroutine-профилю: две горутины в leak.FirstLeaky.func1 в состоянии [chan send], и они не исчезают.",
      "First возвращает первый ответ без утечки: после возврата в профиле нет ни одной горутины из First.",
      "First отменяет медленные бэкенды, когда ответ уже есть; бэкенд, который ctx не слушает, всё равно может отправить ответ и выйти.",
      "Без бэкендов — ErrNoBackends; если ctx отменён раньше ответа — ctx.Err()."
    ],
    "contractEN": [
      "FirstLeaky queries every backend in a goroutine and returns the first answer; with an unbuffered channel the losing goroutines block forever on their send.",
      "A test finds the leak in the goroutine profile: two goroutines in leak.FirstLeaky.func1, state [chan send], and they never go away.",
      "First returns the first answer without leaking: after it returns, the profile has no goroutine from First.",
      "First cancels slow backends once it has an answer; a backend that ignores ctx can still send its answer and exit.",
      "With no backends it returns ErrNoBackends; if ctx is done before any answer, ctx.Err()."
    ],
    "extraRun": [
      "go test -run FirstLeaky -v .   # утечка в тесте",
      "# в сервисе: import _ \"net/http/pprof\", затем",
      "curl 'http://localhost:6060/debug/pprof/goroutine?debug=1'"
    ],
    "planTasks": [
      "w4-wed-3",
      "w4-wed-1"
    ],
    "links": [
      "c12",
      "q16",
      "q15"
    ],
    "refs": [
      {
        "t": "runtime/pprof",
        "u": "https://pkg.go.dev/runtime/pprof"
      },
      {
        "t": "net/http/pprof",
        "u": "https://pkg.go.dev/net/http/pprof"
      }
    ],
    "hints": [
      "Утечка — это горутина без пути завершения: здесь отправка в канал, который больше никто не читает.",
      "pprof.Lookup(\"goroutine\").WriteTo(w, 1) группирует одинаковые стеки: строка «3 @ … leak.FirstLeaky.func1» — три одинаковые горутины. С debug=2 видно состояние: goroutine 8 [chan send].",
      "Исправлений два, и они дополняют друг друга: буфер на len(backends) — опоздавшим есть куда отправить; cancel при возврате — медленные бэкенды заканчивают раньше.",
      "Почему не NumGoroutine? Он считает и чужие горутины — рантайма, тестового фреймворка, HTTP keep-alive, — поэтому число скачет. Профиль показывает, чьи это горутины."
    ],
    "talkEN": "A goroutine leaks when it has no way to finish: here the losers block forever sending to a channel that nobody reads after the first answer. In a service I would see it in the goroutine profile from net/http/pprof: with debug=1 identical stacks are grouped, and a count that keeps growing in FirstLeaky.func1 points straight at the send. The fix is a buffered channel with room for every answer, so late goroutines can send and exit, plus cancelling the context on return, so slow backends stop early. I verify the fix by checking that no goroutine from First is left in the profile, not by comparing NumGoroutine.",
    "pitfalls": [
      "Только cancel без буфера → бэкенд, который не слушает ctx, всё равно навсегда блокируется на отправке.",
      "Только буфер без cancel → утечки нет, но медленные бэкенды работают зря до конца.",
      "Проверять исправление через runtime.NumGoroutine → тест нестабилен из-за чужих горутин.",
      "Закрыть канал ответов после первого ответа → panic: send on closed channel у опоздавших."
    ],
    "followUps": [
      "Верни первый успешный ответ, пропуская ошибки, — и ошибку, если упали все.",
      "Найди ту же утечку библиотекой go.uber.org/goleak в TestMain: что она проверяет и чем отличается от профиля?",
      "Go 1.26: профиль goroutineleak с GOEXPERIMENT=goroutineleakprofile; в Go 1.27 — без эксперимента. Какие утечки он находит, а какие нет?"
    ],
    "fixture": "docs/verification/fixtures/practice/leak",
    "files": {
      "starter": {
        "name": "leak.go",
        "code": "// Package leak: practice task W4-4. Replace each TODO with your solution.\npackage leak\n\nimport (\n\t\"context\"\n\t\"errors\"\n)\n\n// Backend answers one query. A well-behaved backend returns early when ctx is done.\ntype Backend func(ctx context.Context) string\n\nvar ErrNoBackends = errors.New(\"leak: no backends\")\n\n// FirstLeaky asks every backend in its own goroutine and returns the first answer.\n// Write it the naive way, with an unbuffered channel: it leaks on purpose.\nfunc FirstLeaky(ctx context.Context, backends ...Backend) string {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// First does the same without leaking, returns ErrNoBackends for no backends\n// and ctx.Err() if ctx is done before any answer.\nfunc First(ctx context.Context, backends ...Backend) (string, error) {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "leak_test.go",
        "code": "package leak\n\nimport (\n\t\"bytes\"\n\t\"context\"\n\t\"errors\"\n\t\"runtime/pprof\"\n\t\"strings\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\n// goroutinesIn counts live goroutines whose stack contains fn. It reads the\n// goroutine profile — the same data as /debug/pprof/goroutine?debug=2 — so it\n// counts only our goroutines, unlike runtime.NumGoroutine, which also counts\n// the runtime's, the test framework's and other tests' goroutines.\nfunc goroutinesIn(fn string) int {\n\tvar buf bytes.Buffer\n\tpprof.Lookup(\"goroutine\").WriteTo(&buf, 2)\n\tn := 0\n\tfor _, g := range strings.Split(buf.String(), \"\\n\\n\") {\n\t\tif strings.Contains(g, fn) {\n\t\t\tn++\n\t\t}\n\t}\n\treturn n\n}\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\nfunc answer(s string) Backend { return func(context.Context) string { return s } }\n\n// slow ignores ctx: it answers after d no matter what.\nfunc slow(s string, d time.Duration) Backend {\n\treturn func(context.Context) string { time.Sleep(d); return s }\n}\n\n// polite answers after d unless ctx is done first; it counts cancellations.\nfunc polite(d time.Duration, cancelled *atomic.Int32) Backend {\n\treturn func(ctx context.Context) string {\n\t\tselect {\n\t\tcase <-time.After(d):\n\t\t\treturn \"slow\"\n\t\tcase <-ctx.Done():\n\t\t\tcancelled.Add(1)\n\t\t\treturn \"cancelled\"\n\t\t}\n\t}\n}\n\n// The leak, found the way you would find it in a service: two goroutines per\n// call stay blocked on a send in FirstLeaky's closure. They stay leaked for the\n// rest of this test binary; that is the point of the demonstration.\nfunc TestFirstLeakyLeaks(t *testing.T) {\n\tconst fn = \"leak.FirstLeaky.func\"\n\tbefore := goroutinesIn(fn)\n\tgot := FirstLeaky(context.Background(), answer(\"fast\"), slow(\"a\", 10*time.Millisecond), slow(\"b\", 10*time.Millisecond))\n\tif got != \"fast\" {\n\t\tt.Fatalf(\"got %q, want fast\", got)\n\t}\n\twaitUntil(t, \"the two losers to finish their work\", func() bool { return goroutinesIn(fn) == before+2 })\n\ttime.Sleep(50 * time.Millisecond) // an observation window: they never go away\n\tif n := goroutinesIn(fn); n != before+2 {\n\t\tt.Fatalf(\"%d leaked goroutines, want %d\", n-before, 2)\n\t}\n}\n\nfunc TestFirstReturnsFastestAndLeavesNothing(t *testing.T) {\n\tconst fn = \"leak.First.func\"\n\tvar cancelled atomic.Int32\n\tstart := time.Now()\n\tgot, err := First(context.Background(), polite(time.Second, &cancelled), answer(\"fast\"), polite(time.Second, &cancelled))\n\tif err != nil || got != \"fast\" {\n\t\tt.Fatalf(\"got %q, %v; want fast, nil\", got, err)\n\t}\n\twaitUntil(t, \"slow backends to see the cancellation\", func() bool { return cancelled.Load() == 2 })\n\twaitUntil(t, \"First's goroutines to exit\", func() bool { return goroutinesIn(fn) == 0 })\n\tif took := time.Since(start); took > 500*time.Millisecond {\n\t\tt.Fatalf(\"took %v: slow backends were not told to stop\", took)\n\t}\n}\n\n// Even a backend that ignores ctx must not leak: its late send has room.\nfunc TestImpoliteBackendDoesNotLeak(t *testing.T) {\n\tconst fn = \"leak.First.func\"\n\tgot, err := First(context.Background(), answer(\"fast\"), slow(\"late\", 20*time.Millisecond))\n\tif err != nil || got != \"fast\" {\n\t\tt.Fatalf(\"got %q, %v; want fast, nil\", got, err)\n\t}\n\twaitUntil(t, \"the late goroutine to send and exit\", func() bool { return goroutinesIn(fn) == 0 })\n}\n\nfunc TestParentCancelled(t *testing.T) {\n\tconst fn = \"leak.First.func\"\n\tvar cancelled atomic.Int32\n\tctx, cancel := context.WithCancel(context.Background())\n\ttime.AfterFunc(10*time.Millisecond, cancel)\n\t_, err := First(ctx, polite(time.Second, &cancelled), polite(time.Second, &cancelled))\n\tif !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"err = %v, want context.Canceled\", err)\n\t}\n\twaitUntil(t, \"First's goroutines to exit\", func() bool { return goroutinesIn(fn) == 0 })\n}\n\nfunc TestNoBackends(t *testing.T) {\n\tif _, err := First(context.Background()); !errors.Is(err, ErrNoBackends) {\n\t\tt.Fatalf(\"err = %v, want ErrNoBackends\", err)\n\t}\n}"
      },
      "solution": {
        "name": "leak.go",
        "code": "// Package leak is the reference solution for practice task W4-4:\n// a goroutine leak written on purpose, found with the goroutine profile, and fixed.\npackage leak\n\nimport (\n\t\"context\"\n\t\"errors\"\n)\n\n// Backend answers one query. A well-behaved backend returns early when ctx is done.\ntype Backend func(ctx context.Context) string\n\n// ErrNoBackends is returned by First when there is nobody to ask.\nvar ErrNoBackends = errors.New(\"leak: no backends\")\n\n// FirstLeaky returns the first answer — and leaks on purpose: the channel is\n// unbuffered and nobody reads after the first answer, so every slower backend's\n// goroutine blocks forever on its send. In a goroutine profile they show up as\n// \"[chan send]\" in leak.FirstLeaky.func1, and their number grows with each call.\nfunc FirstLeaky(ctx context.Context, backends ...Backend) string {\n\tanswers := make(chan string)\n\tfor _, b := range backends {\n\t\tgo func() { answers <- b(ctx) }()\n\t}\n\treturn <-answers\n}\n\n// First returns the first answer without leaking:\n//   - the channel has room for every answer, so late goroutines can send and exit;\n//   - cancelling the derived ctx on return tells slow backends to stop early;\n//   - if the caller's ctx is done first, First returns ctx.Err().\nfunc First(ctx context.Context, backends ...Backend) (string, error) {\n\tif len(backends) == 0 {\n\t\treturn \"\", ErrNoBackends\n\t}\n\tctx, cancel := context.WithCancel(ctx)\n\tdefer cancel()\n\tanswers := make(chan string, len(backends))\n\tfor _, b := range backends {\n\t\tgo func() { answers <- b(ctx) }()\n\t}\n\tselect {\n\tcase a := <-answers:\n\t\treturn a, nil\n\tcase <-ctx.Done():\n\t\treturn \"\", ctx.Err()\n\t}\n}"
      }
    }
  },
  {
    "id": "p-escape",
    "code": "W4-5",
    "week": 4,
    "title": "Escape analysis: прочитать -gcflags=-m и убрать аллокации",
    "titleEN": "Escape analysis: read -m and stop allocating",
    "goalRU": "Прочитать вывод go build -gcflags=-m построчно, понять, почему значение уходит в кучу, и изменить две функции так, чтобы они не выделяли память.",
    "contractRU": [
      "NewPoint и MakePoint — для чтения: NewPoint выделяет память один раз за вызов, MakePoint — ни разу.",
      "SumFirst складывает не больше первых 64 значений и не выделяет память.",
      "AppendID дописывает «id-<n>» в dst и не выделяет память, если в dst хватает места.",
      "Результаты функций не меняются; число аллокаций проверяет testing.AllocsPerRun."
    ],
    "contractEN": [
      "NewPoint and MakePoint are for reading: NewPoint allocates once per call, MakePoint never.",
      "SumFirst adds up at most the first 64 values and does not allocate.",
      "AppendID appends \"id-<n>\" to dst and does not allocate when dst has room.",
      "The results stay the same; testing.AllocsPerRun checks the number of allocations."
    ],
    "extraRun": [
      "go build -gcflags=-m .",
      "go test -run Allocations -v ."
    ],
    "planTasks": [
      "w4-thu-3",
      "w4-thu-2"
    ],
    "links": [
      "c23",
      "c24",
      "sim6"
    ],
    "refs": [
      {
        "t": "Go FAQ: stack or heap?",
        "u": "https://go.dev/doc/faq#stack_or_heap"
      },
      {
        "t": "Go blog: Allocating on the stack (Go 1.25–1.26)",
        "u": "https://go.dev/blog/allocation-optimizations"
      }
    ],
    "hints": [
      "Вывод заготовки на Go 1.24.7: «moved to heap: p» — переменная живёт дольше вызова; «xs does not escape» — срез только читается; «make([]int, min(len(xs), 64)) escapes to heap» — размер не константа; «n escapes to heap» — n упаковывается в интерфейс для Sprintf; «leaking param: dst to result» — dst уходит в результат, где он будет жить, решает вызывающий.",
      "На Go 1.25+ строка про make читается иначе: «does not escape». Компилятор держит на стеке буфер на 32 байта, а 50 чисел (400 байт) в него не помещаются, и память всё равно берётся из кучи во время выполнения. Поэтому мерило — AllocsPerRun, а не текст -m.",
      "Размер make, известный только во время выполнения, обычно ведёт в кучу. Массив var buf [64]int имеет постоянный размер и остаётся на стеке.",
      "Откуда аллокации AppendID: новая строка, которую возвращает Sprintf, и на Go 1.24 ещё упаковка n в interface (на Go 1.27 остаётся одна). strconv.AppendInt пишет цифры прямо в dst.",
      "«can inline» — тоже строка вывода: после встраивания escape analysis смотрит на код уже в месте вызова, и результат может отличаться."
    ],
    "talkEN": "go build -gcflags=-m reports the compiler's escape-analysis decisions, and -benchmem shows the allocations that actually happen. A value escapes when it may outlive the function, for example when I return its address, store it in something long-lived, or put it in an interface that escapes; a make whose size is known only at run time usually goes to the heap, apart from small sizes that Go 1.25 can keep in a stack buffer. Here a constant-size array kept the scratch buffer on the stack, and strconv.AppendInt into the caller's buffer removed both allocations of fmt.Sprintf. I confirm with testing.AllocsPerRun or -benchmem, because -m can say \"does not escape\" while a larger run-time size still allocates.",
    "pitfalls": [
      "Считать, что указатель всегда значит кучу → после встраивания &p может остаться на стеке.",
      "Оптимизировать без измерения → -m показывает решения компилятора, а не то, что это узкое место.",
      "Полагаться на текст -m как на стабильный контракт → между версиями он меняется: с Go 1.25 маленький (до 32 байт) срез непостоянного размера может оказаться на стеке, с Go 1.26 — и срез, растущий через append.",
      "Возвращать срез, указывающий на локальный массив → массив уйдёт в кучу, выигрыша не будет."
    ],
    "followUps": [
      "Запусти с -gcflags='-m -m': что добавилось в объяснениях?",
      "Сделай SumFirst для любого числа значений без аллокаций — нужна ли тогда копия вообще?",
      "Почему sync.Pool помогает, когда избежать кучи нельзя, и чем он опасен?"
    ],
    "note": "Вывод -m сверен на Go 1.24.7 и 1.27.3: текст отличается (например, строка про make), а TestAllocations проходит на обеих версиях. Ориентируйся на тест.",
    "fixture": "docs/verification/fixtures/practice/escape",
    "files": {
      "starter": {
        "name": "escape.go",
        "code": "// Package escape: practice task W4-5. Run go build -gcflags=-m . and\n// go test -run Allocations -v, explain every line of the -m output, then change\n// SumFirst and AppendID so that they stop allocating. Keep their results.\npackage escape\n\nimport \"fmt\"\n\ntype Point struct{ X, Y int }\n\n// NewPoint and MakePoint are here to read, not to change: compare their -m lines.\nfunc NewPoint(x, y int) *Point {\n\tp := Point{X: x, Y: y}\n\treturn &p\n}\n\nfunc MakePoint(x, y int) Point {\n\treturn Point{X: x, Y: y}\n}\n\n// SumFirst adds up to the first 64 values.\n// TODO: the scratch buffer goes to the heap. Why? Keep it on the stack.\nfunc SumFirst(xs []int) int {\n\tbuf := make([]int, min(len(xs), 64))\n\tn := copy(buf, xs)\n\ttotal := 0\n\tfor _, v := range buf[:n] {\n\t\ttotal += v\n\t}\n\treturn total\n}\n\n// AppendID appends \"id-<n>\" to dst.\n// TODO: it allocates on every call (twice on Go 1.24, once on Go 1.27).\n// Where do the allocations come from? Make it allocation-free.\nfunc AppendID(dst []byte, n int) []byte {\n\treturn append(dst, fmt.Sprintf(\"id-%d\", n)...)\n}"
      },
      "tests": {
        "name": "escape_test.go",
        "code": "package escape\n\nimport (\n\t\"slices\"\n\t\"testing\"\n)\n\n// Package-level sinks keep results alive, so the compiler cannot drop the calls.\nvar (\n\tsinkPtr   *Point\n\tsinkPoint Point\n\tsinkInt   int\n\tsinkBytes []byte\n)\n\nfunc TestResults(t *testing.T) {\n\tif p := NewPoint(1, 2); *p != (Point{1, 2}) {\n\t\tt.Fatalf(\"NewPoint = %v\", *p)\n\t}\n\tif p := MakePoint(3, 4); p != (Point{3, 4}) {\n\t\tt.Fatalf(\"MakePoint = %v\", p)\n\t}\n\txs := make([]int, 100)\n\tfor i := range xs {\n\t\txs[i] = 1\n\t}\n\tif got := SumFirst(xs); got != 64 {\n\t\tt.Fatalf(\"SumFirst(100 ones) = %d, want 64\", got)\n\t}\n\tif got := SumFirst([]int{1, 2, 3}); got != 6 {\n\t\tt.Fatalf(\"SumFirst([1 2 3]) = %d, want 6\", got)\n\t}\n\tif got := string(AppendID([]byte(\"user \"), 4096)); got != \"user id-4096\" {\n\t\tt.Fatalf(\"AppendID = %q\", got)\n\t}\n}\n\n// testing.AllocsPerRun counts heap allocations per call: the observable side\n// of escape analysis. Compare with go build -gcflags=-m.\nfunc TestAllocations(t *testing.T) {\n\txs := slices.Repeat([]int{1}, 50)\n\tdst := make([]byte, 0, 64)\n\ttests := []struct {\n\t\tname string\n\t\tf    func()\n\t\twant float64\n\t}{\n\t\t{\"NewPoint: the value outlives the call\", func() { sinkPtr = NewPoint(1, 2) }, 1},\n\t\t{\"MakePoint: returned by value\", func() { sinkPoint = MakePoint(1, 2) }, 0},\n\t\t{\"SumFirst: constant-size buffer\", func() { sinkInt = SumFirst(xs) }, 0},\n\t\t{\"AppendID: into a buffer with room\", func() { sinkBytes = AppendID(dst[:0], 123456) }, 0},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tif got := testing.AllocsPerRun(100, tt.f); got != tt.want {\n\t\t\t\tt.Fatalf(\"%v allocations per call, want %v\", got, tt.want)\n\t\t\t}\n\t\t})\n\t}\n}"
      },
      "solution": {
        "name": "escape.go",
        "code": "// Package escape is the reference solution for practice task W4-5:\n// read `go build -gcflags=-m` output and keep values on the stack.\npackage escape\n\nimport \"strconv\"\n\ntype Point struct{ X, Y int }\n\n// NewPoint returns a pointer to a local variable. The variable outlives the\n// call, so the compiler moves it to the heap: \"moved to heap: p\".\nfunc NewPoint(x, y int) *Point {\n\tp := Point{X: x, Y: y}\n\treturn &p\n}\n\n// MakePoint returns a copy. Nothing outlives the call: no allocation.\nfunc MakePoint(x, y int) Point {\n\treturn Point{X: x, Y: y}\n}\n\n// SumFirst adds up to the first 64 values. The scratch buffer has a constant\n// size and never leaves the function, so it stays on the stack.\nfunc SumFirst(xs []int) int {\n\tvar buf [64]int\n\tn := copy(buf[:], xs)\n\ttotal := 0\n\tfor _, v := range buf[:n] {\n\t\ttotal += v\n\t}\n\treturn total\n}\n\n// AppendID appends \"id-<n>\" to dst. strconv.AppendInt writes digits straight\n// into dst; fmt.Sprintf would box n in an interface and build a new string.\nfunc AppendID(dst []byte, n int) []byte {\n\tdst = append(dst, \"id-\"...)\n\treturn strconv.AppendInt(dst, int64(n), 10)\n}"
      }
    }
  },
  {
    "id": "p-profile",
    "code": "W4-6",
    "week": 4,
    "title": "Бенчмарк и профиль: txsum под pprof",
    "titleEN": "Benchmark and profile txsum",
    "goalRU": "Снять CPU- и memory-профиль бенчмарка txsum, найти, что выделяет память на каждой строке, изменить это и сравнить бенчмарк до и после.",
    "contractRU": [
      "Заготовка — решение W2-4 без изменений; все его тесты должны продолжать проходить.",
      "После изменения Sum выделяет не больше одной аллокации на корректную строку (плюс небольшая константа) — это проверяет TestAllocsPerLine.",
      "BenchmarkSum запускается с -benchmem; цифры до и после записаны.",
      "Вывод формулируется как «на этой машине и этих данных», без обещаний конкретной скорости."
    ],
    "contractEN": [
      "The starter is the W2-4 solution, unchanged; all its tests must keep passing.",
      "After the change Sum makes at most one allocation per valid line, plus a small constant; TestAllocsPerLine checks this.",
      "BenchmarkSum runs with -benchmem; the numbers before and after are written down.",
      "The conclusion says \"on this machine and this data\", without promising a specific speed-up."
    ],
    "extraRun": [
      "go test -run xxx -bench=Sum -benchmem -count=5 -cpuprofile cpu.out -memprofile mem.out .",
      "go tool pprof -top cpu.out",
      "go tool pprof -sample_index=alloc_space -list 'txprof.Sum' mem.out"
    ],
    "planTasks": [
      "w4-sat-1"
    ],
    "links": [
      "c26",
      "c27",
      "c41"
    ],
    "refs": [
      {
        "t": "Diagnostics: profiling",
        "u": "https://go.dev/doc/diagnostics#profiling"
      },
      {
        "t": "testing: benchmarks",
        "u": "https://pkg.go.dev/testing#hdr-Benchmarks"
      }
    ],
    "hints": [
      "Начни с -benchmem: allocs/op показывает, что на 10 000 строк приходится около 20 000 аллокаций, то есть две на строку.",
      "Memory-профиль с -sample_index=alloc_space и -list 'txprof.Sum' показывает строки исходника: большая часть памяти — strings.Split, остальное — sc.Text().",
      "strings.Cut возвращает подстроки исходной строки и ничего не выделяет; три поля — два вызова Cut и проверка, что запятых больше нет.",
      "В CPU-профиле сверху хеширование строк map (aeshashbody): ключ — две строки на каждую строку входа. Это следующая гипотеза, но сначала проверь первую."
    ],
    "talkEN": "I start from a benchmark with -benchmem, so I measure before I change anything. The memory profile, listed by source line, showed that most allocations came from strings.Split, which builds a new slice for every line, and the rest from Scanner.Text. I replaced Split with two strings.Cut calls, which return substrings without allocating, kept all the old tests green, and the benchmark went from two allocations per line to one on my machine. I compare several runs, ideally with benchstat, and I describe the result for this data rather than promising a fixed speed-up.",
    "pitfalls": [
      "Оптимизировать без бенчмарка «до» → нечем подтвердить гипотезу.",
      "Один прогон бенчмарка → шум принимается за эффект; нужен -count и сравнение, например benchstat.",
      "Сломать поведение ради скорости → строка из четырёх колонок должна по-прежнему давать ErrColumns.",
      "Профилировать с -race → инструментирование искажает и время, и аллокации."
    ],
    "followUps": [
      "Дойди до нуля аллокаций на строку: sc.Bytes() и интернирование имён счетов через map[string]string (поиск m[string(b)] не выделяет память).",
      "Сравни результаты с benchstat (golang.org/x/perf/cmd/benchstat): какой разброс у твоих цифр?",
      "Попробуй PGO: go test -pgo=cpu.out -bench=Sum -benchmem — изменилось ли что-нибудь и почему эффект может быть нулевым?"
    ],
    "note": "Пример одного запуска (2 vCPU, Go 1.24.7, 10 000 строк): до — около 20 000 allocs/op и 645 КБ/op, после — около 10 000 allocs/op и 165 КБ/op. На другой машине цифры другие; сравнивай свои «до» и «после».",
    "fixture": "docs/verification/fixtures/practice/txprof",
    "files": {
      "starter": {
        "name": "txprof.go",
        "code": "// Package txprof: practice task W4-6. This is the W2-4 solution, unchanged:\n// sum transactions from CSV lines \"account,amount,currency\" per account and currency.\n// Run the benchmark with a CPU and a memory profile, find what allocates on\n// every line, change it, and compare the benchmark before and after.\n// The W2-4 tests must keep passing; TestAllocsPerLine fails until you are done.\npackage txprof\n\nimport (\n\t\"bufio\"\n\t\"errors\"\n\t\"fmt\"\n\t\"io\"\n\t\"slices\"\n\t\"strconv\"\n\t\"strings\"\n)\n\nvar (\n\tErrColumns  = errors.New(\"want 3 columns: account,amount,currency\")\n\tErrAmount   = errors.New(\"amount must be a number with at most 2 decimals\")\n\tErrCurrency = errors.New(\"unknown currency\")\n)\n\nvar currencies = map[string]bool{\"EUR\": true, \"USD\": true, \"RSD\": true}\n\n// LineError says which input line failed; Unwrap lets errors.Is see the cause.\ntype LineError struct {\n\tLine int\n\tErr  error\n}\n\nfunc (e *LineError) Error() string { return fmt.Sprintf(\"line %d: %v\", e.Line, e.Err) }\nfunc (e *LineError) Unwrap() error { return e.Err }\n\ntype Key struct{ Account, Currency string }\n\n// ParseAmount turns \"12.50\", \"12.5\", \"12\" or \"-3.10\" into minor units.\nfunc ParseAmount(s string) (int64, error) {\n\twhole, frac, hasDot := strings.Cut(s, \".\")\n\tif whole == \"\" || whole == \"-\" || (hasDot && (frac == \"\" || len(frac) > 2)) {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tfor len(frac) < 2 {\n\t\tfrac += \"0\"\n\t}\n\tif strings.HasPrefix(frac, \"-\") || strings.HasPrefix(frac, \"+\") {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tminor, err := strconv.ParseInt(whole+frac, 10, 64)\n\tif err != nil {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\treturn minor, nil\n}\n\n// Sum adds up every valid line. Bad lines are skipped and reported, all of them,\n// so one run shows every problem in the file. Blank lines and a header are ignored.\nfunc Sum(r io.Reader) (map[Key]int64, []error) {\n\ttotals := make(map[Key]int64)\n\tvar errs []error\n\tsc := bufio.NewScanner(r)\n\tfor n := 1; sc.Scan(); n++ {\n\t\tline := strings.TrimSpace(sc.Text())\n\t\tif line == \"\" || (n == 1 && line == \"account,amount,currency\") {\n\t\t\tcontinue\n\t\t}\n\t\tcols := strings.Split(line, \",\")\n\t\tif len(cols) != 3 {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\taccount, amount, currency := strings.TrimSpace(cols[0]), strings.TrimSpace(cols[1]), strings.TrimSpace(cols[2])\n\t\tif account == \"\" {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\tminor, err := ParseAmount(amount)\n\t\tif err != nil {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: err})\n\t\t\tcontinue\n\t\t}\n\t\tif !currencies[currency] {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: fmt.Errorf(\"%q: %w\", currency, ErrCurrency)})\n\t\t\tcontinue\n\t\t}\n\t\ttotals[Key{account, currency}] += minor\n\t}\n\tif err := sc.Err(); err != nil {\n\t\terrs = append(errs, fmt.Errorf(\"read input: %w\", err))\n\t}\n\treturn totals, errs\n}\n\n// Run is the whole CLI: totals to stdout sorted by account and currency, errors to\n// stderr, exit code 1 if any line was bad. main is just os.Exit(Run(os.Stdin, os.Stdout, os.Stderr)).\nfunc Run(stdin io.Reader, stdout, stderr io.Writer) int {\n\ttotals, errs := Sum(stdin)\n\tkeys := make([]Key, 0, len(totals))\n\tfor k := range totals {\n\t\tkeys = append(keys, k)\n\t}\n\tslices.SortFunc(keys, func(a, b Key) int {\n\t\tif c := strings.Compare(a.Account, b.Account); c != 0 {\n\t\t\treturn c\n\t\t}\n\t\treturn strings.Compare(a.Currency, b.Currency)\n\t})\n\tfor _, k := range keys {\n\t\tv := totals[k]\n\t\tsign := \"\"\n\t\tif v < 0 {\n\t\t\tsign, v = \"-\", -v\n\t\t}\n\t\tfmt.Fprintf(stdout, \"%s %s %s%d.%02d\\n\", k.Account, k.Currency, sign, v/100, v%100)\n\t}\n\tfor _, err := range errs {\n\t\tfmt.Fprintln(stderr, err)\n\t}\n\tif len(errs) > 0 {\n\t\treturn 1\n\t}\n\treturn 0\n}"
      },
      "tests": {
        "name": "txprof_test.go",
        "code": "package txprof\n\nimport (\n\t\"bytes\"\n\t\"errors\"\n\t\"fmt\"\n\t\"strings\"\n\t\"testing\"\n)\n\nfunc TestParseAmount(t *testing.T) {\n\ttests := []struct {\n\t\tin      string\n\t\twant    int64\n\t\twantErr bool\n\t}{\n\t\t{\"12.50\", 1250, false},\n\t\t{\"12.5\", 1250, false},\n\t\t{\"12\", 1200, false},\n\t\t{\"0.05\", 5, false},\n\t\t{\"-3.10\", -310, false},\n\t\t{\"1.234\", 0, true},\n\t\t{\"abc\", 0, true},\n\t\t{\"\", 0, true},\n\t\t{\"1.\", 0, true},\n\t\t{\".5\", 0, true},\n\t\t{\"1.-5\", 0, true},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.in, func(t *testing.T) {\n\t\t\tgot, err := ParseAmount(tt.in)\n\t\t\tif (err != nil) != tt.wantErr || got != tt.want {\n\t\t\t\tt.Fatalf(\"ParseAmount(%q) = %d, %v; want %d, error %v\", tt.in, got, err, tt.want, tt.wantErr)\n\t\t\t}\n\t\t\tif err != nil && !errors.Is(err, ErrAmount) {\n\t\t\t\tt.Fatalf(\"error %v does not wrap ErrAmount\", err)\n\t\t\t}\n\t\t})\n\t}\n}\n\nconst input = `account,amount,currency\nalice,10.00,EUR\nbob,5,USD\nalice,2.50,EUR\ncarol,7.00\ndave,ten,EUR\nerin,1.00,GBP\n\nalice,-0.50,EUR\n`\n\nfunc TestSumCollectsAllErrors(t *testing.T) {\n\ttotals, errs := Sum(strings.NewReader(input))\n\tif got := totals[Key{\"alice\", \"EUR\"}]; got != 1200 {\n\t\tt.Errorf(\"alice EUR = %d, want 1200\", got)\n\t}\n\tif got := totals[Key{\"bob\", \"USD\"}]; got != 500 {\n\t\tt.Errorf(\"bob USD = %d, want 500\", got)\n\t}\n\tif len(totals) != 2 {\n\t\tt.Errorf(\"got %d totals, want 2: bad lines must be skipped\", len(totals))\n\t}\n\twant := []struct {\n\t\tline  int\n\t\tcause error\n\t}{{5, ErrColumns}, {6, ErrAmount}, {7, ErrCurrency}}\n\tif len(errs) != len(want) {\n\t\tt.Fatalf(\"got %d errors %v, want %d\", len(errs), errs, len(want))\n\t}\n\tfor i, w := range want {\n\t\tvar le *LineError\n\t\tif !errors.As(errs[i], &le) || le.Line != w.line {\n\t\t\tt.Errorf(\"error %d = %v, want a *LineError for line %d\", i, errs[i], w.line)\n\t\t}\n\t\tif !errors.Is(errs[i], w.cause) {\n\t\t\tt.Errorf(\"error %d = %v, want cause %v\", i, errs[i], w.cause)\n\t\t}\n\t}\n}\n\nfunc TestRun(t *testing.T) {\n\tvar out, errOut bytes.Buffer\n\tif code := Run(strings.NewReader(input), &out, &errOut); code != 1 {\n\t\tt.Fatalf(\"exit code %d, want 1 with bad lines\", code)\n\t}\n\tif want := \"alice EUR 12.00\\nbob USD 5.00\\n\"; out.String() != want {\n\t\tt.Fatalf(\"stdout %q, want %q\", out.String(), want)\n\t}\n\tif lines := strings.Count(errOut.String(), \"\\n\"); lines != 3 {\n\t\tt.Fatalf(\"stderr has %d lines, want 3:\\n%s\", lines, errOut.String())\n\t}\n\n\tout.Reset()\n\terrOut.Reset()\n\tif code := Run(strings.NewReader(\"zed,-1.50,RSD\\n\"), &out, &errOut); code != 0 {\n\t\tt.Fatalf(\"exit code %d for valid input, want 0; stderr: %s\", code, errOut.String())\n\t}\n\tif out.String() != \"zed RSD -1.50\\n\" {\n\t\tt.Fatalf(\"stdout %q\", out.String())\n\t}\n}\n\n// input builds n valid lines for three accounts and two currencies.\nfunc benchInput(n int) string {\n\tvar b strings.Builder\n\tb.WriteString(\"account,amount,currency\\n\")\n\taccounts := []string{\"alice\", \"bob\", \"carol\"}\n\tcurrencies := []string{\"EUR\", \"USD\"}\n\tfor i := range n {\n\t\tfmt.Fprintf(&b, \"%s,%d.%02d,%s\\n\", accounts[i%3], i%1000, i%100, currencies[i%2])\n\t}\n\treturn b.String()\n}\n\nfunc TestSumBenchInput(t *testing.T) {\n\ttotals, errs := Sum(strings.NewReader(benchInput(600)))\n\tif len(errs) != 0 || len(totals) != 6 {\n\t\tt.Fatalf(\"got %d totals and errors %v; want 6 totals, no errors\", len(totals), errs)\n\t}\n}\n\n// The goal of W4-6: at most one allocation per valid line (the line's text),\n// plus a small constant for the scanner and the map.\nfunc TestAllocsPerLine(t *testing.T) {\n\tconst lines = 1000\n\tinput := benchInput(lines)\n\tallocs := testing.AllocsPerRun(20, func() {\n\t\tSum(strings.NewReader(input))\n\t})\n\tif perLine := allocs / lines; perLine > 1.05 {\n\t\tt.Fatalf(\"%.2f allocations per line (%v per call), want at most about 1\", perLine, allocs)\n\t}\n}\n\n// go test -bench=Sum -benchmem -cpuprofile cpu.out -memprofile mem.out\nfunc BenchmarkSum(b *testing.B) {\n\tinput := benchInput(10_000)\n\tb.SetBytes(int64(len(input)))\n\tb.ReportAllocs()\n\tfor b.Loop() {\n\t\tSum(strings.NewReader(input))\n\t}\n}"
      },
      "solution": {
        "name": "txprof.go",
        "code": "// Package txprof is the reference solution for practice task W4-6: the W2-4\n// txsum code after profiling. The profile showed strings.Split allocating a\n// []string for every line; three strings.Cut calls find the same fields\n// without allocating. Everything else is unchanged, and the W2-4 tests pass.\npackage txprof\n\nimport (\n\t\"bufio\"\n\t\"errors\"\n\t\"fmt\"\n\t\"io\"\n\t\"slices\"\n\t\"strconv\"\n\t\"strings\"\n)\n\nvar (\n\tErrColumns  = errors.New(\"want 3 columns: account,amount,currency\")\n\tErrAmount   = errors.New(\"amount must be a number with at most 2 decimals\")\n\tErrCurrency = errors.New(\"unknown currency\")\n)\n\nvar currencies = map[string]bool{\"EUR\": true, \"USD\": true, \"RSD\": true}\n\n// LineError says which input line failed; Unwrap lets errors.Is see the cause.\ntype LineError struct {\n\tLine int\n\tErr  error\n}\n\nfunc (e *LineError) Error() string { return fmt.Sprintf(\"line %d: %v\", e.Line, e.Err) }\nfunc (e *LineError) Unwrap() error { return e.Err }\n\ntype Key struct{ Account, Currency string }\n\n// ParseAmount turns \"12.50\", \"12.5\", \"12\" or \"-3.10\" into minor units.\nfunc ParseAmount(s string) (int64, error) {\n\twhole, frac, hasDot := strings.Cut(s, \".\")\n\tif whole == \"\" || whole == \"-\" || (hasDot && (frac == \"\" || len(frac) > 2)) {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tfor len(frac) < 2 {\n\t\tfrac += \"0\"\n\t}\n\tif strings.HasPrefix(frac, \"-\") || strings.HasPrefix(frac, \"+\") {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\tminor, err := strconv.ParseInt(whole+frac, 10, 64)\n\tif err != nil {\n\t\treturn 0, fmt.Errorf(\"%q: %w\", s, ErrAmount)\n\t}\n\treturn minor, nil\n}\n\n// Sum adds up every valid line. Bad lines are skipped and reported, all of them,\n// so one run shows every problem in the file. Blank lines and a header are ignored.\nfunc Sum(r io.Reader) (map[Key]int64, []error) {\n\ttotals := make(map[Key]int64)\n\tvar errs []error\n\tsc := bufio.NewScanner(r)\n\tfor n := 1; sc.Scan(); n++ {\n\t\tline := strings.TrimSpace(sc.Text())\n\t\tif line == \"\" || (n == 1 && line == \"account,amount,currency\") {\n\t\t\tcontinue\n\t\t}\n\t\t// strings.Cut returns substrings of line: no []string per line, unlike strings.Split.\n\t\taccount, rest, ok1 := strings.Cut(line, \",\")\n\t\tamount, currency, ok2 := strings.Cut(rest, \",\")\n\t\tif !ok1 || !ok2 || strings.Contains(currency, \",\") {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\taccount, amount, currency = strings.TrimSpace(account), strings.TrimSpace(amount), strings.TrimSpace(currency)\n\t\tif account == \"\" {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: ErrColumns})\n\t\t\tcontinue\n\t\t}\n\t\tminor, err := ParseAmount(amount)\n\t\tif err != nil {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: err})\n\t\t\tcontinue\n\t\t}\n\t\tif !currencies[currency] {\n\t\t\terrs = append(errs, &LineError{Line: n, Err: fmt.Errorf(\"%q: %w\", currency, ErrCurrency)})\n\t\t\tcontinue\n\t\t}\n\t\ttotals[Key{account, currency}] += minor\n\t}\n\tif err := sc.Err(); err != nil {\n\t\terrs = append(errs, fmt.Errorf(\"read input: %w\", err))\n\t}\n\treturn totals, errs\n}\n\n// Run is the whole CLI: totals to stdout sorted by account and currency, errors to\n// stderr, exit code 1 if any line was bad. main is just os.Exit(Run(os.Stdin, os.Stdout, os.Stderr)).\nfunc Run(stdin io.Reader, stdout, stderr io.Writer) int {\n\ttotals, errs := Sum(stdin)\n\tkeys := make([]Key, 0, len(totals))\n\tfor k := range totals {\n\t\tkeys = append(keys, k)\n\t}\n\tslices.SortFunc(keys, func(a, b Key) int {\n\t\tif c := strings.Compare(a.Account, b.Account); c != 0 {\n\t\t\treturn c\n\t\t}\n\t\treturn strings.Compare(a.Currency, b.Currency)\n\t})\n\tfor _, k := range keys {\n\t\tv := totals[k]\n\t\tsign := \"\"\n\t\tif v < 0 {\n\t\t\tsign, v = \"-\", -v\n\t\t}\n\t\tfmt.Fprintf(stdout, \"%s %s %s%d.%02d\\n\", k.Account, k.Currency, sign, v/100, v%100)\n\t}\n\tfor _, err := range errs {\n\t\tfmt.Fprintln(stderr, err)\n\t}\n\tif len(errs) > 0 {\n\t\treturn 1\n\t}\n\treturn 0\n}"
      }
    }
  },
  {
    "id": "p-accountsapi",
    "code": "W5-1",
    "week": 5,
    "title": "HTTP API счетов на стандартном ServeMux",
    "titleEN": "Accounts HTTP API on ServeMux",
    "goalRU": "Сделать маршруты POST /accounts и GET /accounts/{id} на net/http с шаблонами Go 1.22 и проверить их через httptest: 201, 404, 405, 400.",
    "contractRU": [
      "POST /accounts с {\"owner\": \"...\"} → 201, заголовок Location: /accounts/{id}, тело — счёт в JSON с нулевым балансом.",
      "GET /accounts/{id} → 200 со счётом или 404 с {\"error\": \"...\"}.",
      "Другие методы на этих путях → 405 с заголовком Allow (это делает ServeMux, если в шаблоне указан метод).",
      "Неверный JSON, данные после JSON-объекта, пустой owner, лишнее поле или пустое тело → 400 с {\"error\": \"...\"}; для пустого owner — ещё \"field\": \"owner\".",
      "Тело запроса ограничено 1 МБ; все ответы — Content-Type: application/json, заголовки выставлены до WriteHeader."
    ],
    "contractEN": [
      "POST /accounts with {\"owner\": \"...\"} → 201, a Location: /accounts/{id} header, and the account as JSON with a zero balance.",
      "GET /accounts/{id} → 200 with the account, or 404 with {\"error\": \"...\"}.",
      "Other methods on these paths → 405 with an Allow header (ServeMux does this when the pattern has a method).",
      "Invalid JSON, data after the JSON object, an empty owner, an unknown field or an empty body → 400 with {\"error\": \"...\"}; for an empty owner also \"field\": \"owner\".",
      "The request body is limited to 1 MB; every response is Content-Type: application/json, with headers set before WriteHeader."
    ],
    "planTasks": [
      "w5-tue-1"
    ],
    "links": [
      "c45",
      "q36",
      "q37"
    ],
    "refs": [
      {
        "t": "net/http: ServeMux patterns",
        "u": "https://pkg.go.dev/net/http#hdr-Patterns-ServeMux"
      },
      {
        "t": "net/http/httptest",
        "u": "https://pkg.go.dev/net/http/httptest"
      }
    ],
    "hints": [
      "mux.HandleFunc(\"GET /accounts/{id}\", …) и r.PathValue(\"id\"): метод в шаблоне — и 405 с Allow ServeMux отдаёт сам.",
      "json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)) и dec.DisallowUnknownFields(): лишнее поле вроде \"balance\" — это ошибка клиента, а не тихо проигнорированное значение.",
      "Порядок записи ответа: сначала Header().Set, потом WriteHeader, потом тело. Заголовок после WriteHeader не отправится — тест смотрит rec.Result().Header, то есть то, что ушло клиенту.",
      "После записи ошибки — return. Иначе handler допишет второй ответ в то же тело (q36)."
    ],
    "talkEN": "I use the standard ServeMux with Go 1.22 patterns: the method in the pattern gives me 405 with an Allow header for free, and PathValue reads the id. Handlers decode JSON through MaxBytesReader with unknown fields disallowed, validate, and return right after writing an error. One small writeJSON helper sets Content-Type before WriteHeader. The store is an interface, so the tests run the real handler through httptest with an in-memory fake and check status codes, headers and JSON bodies.",
    "pitfalls": [
      "Нет return после ошибки → два ответа в одном теле.",
      "Content-Type после WriteHeader → клиент получает text/plain.",
      "Шаблон без метода (\"/accounts/{id}\") → DELETE доходит до handler, а не получает 405.",
      "Нет ограничения тела → клиент может заставить сервер читать гигабайты.",
      "Проверять rec.Header() вместо rec.Result().Header → тест не видит, что заголовок опоздал."
    ],
    "followUps": [
      "Добавь GET /accounts?owner=… с фильтром и пустым списком [] вместо null.",
      "Оберни mux в middleware, которое ставит X-Request-ID и логирует метод, путь, код и время.",
      "Сделай POST /accounts идемпотентным по заголовку Idempotency-Key (это тема недели 6)."
    ],
    "fixture": "docs/verification/fixtures/practice/accountsapi",
    "files": {
      "starter": {
        "name": "accountsapi.go",
        "code": "// Package accountsapi: practice task W5-1. Replace the TODO with your solution.\npackage accountsapi\n\nimport \"net/http\"\n\ntype Account struct {\n\tID      string `json:\"id\"`\n\tOwner   string `json:\"owner\"`\n\tBalance int64  `json:\"balance\"` // minor units\n}\n\n// Store is what the handlers need; the ledger package or a test fake implements it.\ntype Store interface {\n\tCreate(owner string) Account\n\tGet(id string) (Account, bool)\n}\n\n// NewHandler returns the routes:\n//\n//\tPOST /accounts        {\"owner\": \"...\"} → 201 + Location, the account as JSON\n//\tGET  /accounts/{id}   → 200 with the account, 404 if unknown\n//\n// Other methods on these paths must get 405. Errors are JSON: {\"error\": \"...\"}.\nfunc NewHandler(s Store) http.Handler {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "accountsapi_test.go",
        "code": "package accountsapi\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strings\"\n\t\"sync\"\n\t\"testing\"\n)\n\n// memStore is a small fake: enough for the handlers, no database.\ntype memStore struct {\n\tmu   sync.Mutex\n\tnext int\n\tbyID map[string]Account\n}\n\nfunc (m *memStore) Create(owner string) Account {\n\tm.mu.Lock()\n\tdefer m.mu.Unlock()\n\tif m.byID == nil {\n\t\tm.byID = map[string]Account{}\n\t}\n\tm.next++\n\ta := Account{ID: fmt.Sprint(m.next), Owner: owner}\n\tm.byID[a.ID] = a\n\treturn a\n}\n\nfunc (m *memStore) Get(id string) (Account, bool) {\n\tm.mu.Lock()\n\tdefer m.mu.Unlock()\n\ta, ok := m.byID[id]\n\treturn a, ok\n}\n\nfunc do(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {\n\tt.Helper()\n\trec := httptest.NewRecorder()\n\th.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))\n\treturn rec\n}\n\nfunc decode(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {\n\tt.Helper()\n\t// Result().Header is what was sent: headers set after WriteHeader are not in it.\n\tif ct := rec.Result().Header.Get(\"Content-Type\"); ct != \"application/json\" {\n\t\tt.Fatalf(\"Content-Type = %q, want application/json\", ct)\n\t}\n\tvar v map[string]any\n\tif err := json.Unmarshal(rec.Body.Bytes(), &v); err != nil {\n\t\tt.Fatalf(\"body is not JSON: %q\", rec.Body.String())\n\t}\n\treturn v\n}\n\nfunc TestCreateAndGet(t *testing.T) {\n\th := NewHandler(&memStore{})\n\trec := do(t, h, \"POST\", \"/accounts\", `{\"owner\":\"alice\"}`)\n\tif rec.Code != http.StatusCreated {\n\t\tt.Fatalf(\"POST /accounts = %d, want 201\", rec.Code)\n\t}\n\tcreated := decode(t, rec)\n\tif created[\"owner\"] != \"alice\" || created[\"id\"] == \"\" || created[\"balance\"] != 0.0 {\n\t\tt.Fatalf(\"created = %v\", created)\n\t}\n\tif loc := rec.Result().Header.Get(\"Location\"); loc != \"/accounts/\"+created[\"id\"].(string) {\n\t\tt.Fatalf(\"Location = %q\", loc)\n\t}\n\trec = do(t, h, \"GET\", \"/accounts/\"+created[\"id\"].(string), \"\")\n\tif rec.Code != http.StatusOK || decode(t, rec)[\"owner\"] != \"alice\" {\n\t\tt.Fatalf(\"GET = %d %s\", rec.Code, rec.Body)\n\t}\n}\n\nfunc TestNotFound(t *testing.T) {\n\trec := do(t, NewHandler(&memStore{}), \"GET\", \"/accounts/999\", \"\")\n\tif rec.Code != http.StatusNotFound || decode(t, rec)[\"error\"] == nil {\n\t\tt.Fatalf(\"got %d %s, want 404 with a JSON error\", rec.Code, rec.Body)\n\t}\n}\n\nfunc TestWrongMethodIs405(t *testing.T) {\n\th := NewHandler(&memStore{})\n\trec := do(t, h, \"DELETE\", \"/accounts/1\", \"\")\n\tif rec.Code != http.StatusMethodNotAllowed || !strings.Contains(rec.Result().Header.Get(\"Allow\"), \"GET\") {\n\t\tt.Fatalf(\"DELETE /accounts/1 = %d Allow=%q, want 405 with Allow: GET\", rec.Code, rec.Header().Get(\"Allow\"))\n\t}\n\tif rec := do(t, h, \"GET\", \"/accounts\", \"\"); rec.Code != http.StatusMethodNotAllowed {\n\t\tt.Fatalf(\"GET /accounts = %d, want 405\", rec.Code)\n\t}\n}\n\nfunc TestBadInput(t *testing.T) {\n\th := NewHandler(&memStore{})\n\tfor name, body := range map[string]string{\n\t\t\"not JSON\":      `owner=alice`,\n\t\t\"empty owner\":   `{\"owner\":\"  \"}`,\n\t\t\"unknown field\": `{\"owner\":\"alice\",\"balance\":1000000}`,\n\t\t\"empty body\":    ``,\n\t\t\"trailing data\": `{\"owner\":\"alice\"} garbage`,\n\t\t\"two objects\":   `{\"owner\":\"alice\"}{\"owner\":\"bob\"}`,\n\t} {\n\t\trec := do(t, h, \"POST\", \"/accounts\", body)\n\t\tif rec.Code != http.StatusBadRequest || decode(t, rec)[\"error\"] == nil {\n\t\t\tt.Errorf(\"%s: got %d %s, want 400 with a JSON error\", name, rec.Code, rec.Body)\n\t\t}\n\t}\n\tif rec := do(t, h, \"POST\", \"/accounts\", \"{\\\"owner\\\":\\\"alice\\\"}\\n\"); rec.Code != http.StatusCreated {\n\t\tt.Errorf(\"trailing whitespace: got %d, want 201\", rec.Code)\n\t}\n\tif rec := do(t, h, \"POST\", \"/accounts\", `{\"owner\":\"\"}`); decode(t, rec)[\"field\"] != \"owner\" {\n\t\tt.Fatalf(\"an empty owner should name the field: %s\", rec.Body)\n\t}\n}\n\nfunc TestBodyIsLimited(t *testing.T) {\n\tbig := `{\"owner\":\"` + strings.Repeat(\"a\", 2<<20) + `\"}`\n\tif rec := do(t, NewHandler(&memStore{}), \"POST\", \"/accounts\", big); rec.Code != http.StatusBadRequest {\n\t\tt.Fatalf(\"a 2 MB body got %d, want 400\", rec.Code)\n\t}\n}"
      },
      "solution": {
        "name": "accountsapi.go",
        "code": "// Package accountsapi is the reference solution for practice task W5-1:\n// HTTP routes for accounts on the standard ServeMux (Go 1.22+ patterns).\npackage accountsapi\n\nimport (\n\t\"encoding/json\"\n\t\"io\"\n\t\"net/http\"\n\t\"strings\"\n)\n\ntype Account struct {\n\tID      string `json:\"id\"`\n\tOwner   string `json:\"owner\"`\n\tBalance int64  `json:\"balance\"` // minor units\n}\n\n// Store is what the handlers need; the ledger package or a test fake implements it.\ntype Store interface {\n\tCreate(owner string) Account\n\tGet(id string) (Account, bool)\n}\n\n// maxBody limits request bodies; a client cannot make the server read gigabytes.\nconst maxBody = 1 << 20\n\n// NewHandler returns the routes:\n//\n//\tPOST /accounts        {\"owner\": \"...\"} → 201 + Location, the account as JSON\n//\tGET  /accounts/{id}   → 200 with the account, 404 if unknown\n//\n// Other methods on these paths get 405 from ServeMux.\nfunc NewHandler(s Store) http.Handler {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"POST /accounts\", func(w http.ResponseWriter, r *http.Request) {\n\t\tvar in struct {\n\t\t\tOwner string `json:\"owner\"`\n\t\t}\n\t\tdec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBody))\n\t\tdec.DisallowUnknownFields()\n\t\t// One JSON object and nothing after it: \"{...} garbage\" or a second object is a bad request.\n\t\tif err := dec.Decode(&in); err != nil || dec.Decode(&struct{}{}) != io.EOF {\n\t\t\twriteJSON(w, http.StatusBadRequest, map[string]string{\"error\": \"body must be JSON like {\\\"owner\\\": \\\"...\\\"}\"})\n\t\t\treturn\n\t\t}\n\t\tif strings.TrimSpace(in.Owner) == \"\" {\n\t\t\twriteJSON(w, http.StatusBadRequest, map[string]string{\"error\": \"owner must not be empty\", \"field\": \"owner\"})\n\t\t\treturn\n\t\t}\n\t\tacc := s.Create(in.Owner)\n\t\tw.Header().Set(\"Location\", \"/accounts/\"+acc.ID)\n\t\twriteJSON(w, http.StatusCreated, acc)\n\t})\n\tmux.HandleFunc(\"GET /accounts/{id}\", func(w http.ResponseWriter, r *http.Request) {\n\t\tacc, ok := s.Get(r.PathValue(\"id\"))\n\t\tif !ok {\n\t\t\twriteJSON(w, http.StatusNotFound, map[string]string{\"error\": \"account not found\"})\n\t\t\treturn\n\t\t}\n\t\twriteJSON(w, http.StatusOK, acc)\n\t})\n\treturn mux\n}\n\n// writeJSON sets the headers before the status: after WriteHeader they are ignored.\nfunc writeJSON(w http.ResponseWriter, status int, v any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(v)\n}"
      }
    }
  },
  {
    "id": "p-httperr",
    "code": "W5-2",
    "week": 5,
    "title": "Ошибки домена → HTTP-коды",
    "titleEN": "Domain errors to HTTP status codes",
    "goalRU": "Перевести ошибки домена в коды ответа в одном месте: валидация — 400 с полем, «не найдено» — 404, нехватка средств — 409, остальное — 500 без деталей и с одной записью в логе.",
    "contractRU": [
      "Status распознаёт обёрнутые ошибки (в том числе через errors.Join): *ValidationError → 400, ErrNotFound → 404, ErrInsufficientFunds → 409, остальное → 500.",
      "Write отвечает JSON: для 400 — {\"error\": причина, \"field\": поле}, для 404 и 409 — понятный текст.",
      "Для 500 тело не раскрывает причину (ни текста драйвера, ни адресов), а ошибка пишется в лог ровно одной записью; ошибки клиента не логируются.",
      "TransferHandler: неверный JSON или данные после него → 400 с field \"body\", amount ≤ 0 → 400 с field \"amount\" и Ledger не вызывается; Ledger получает контекст запроса; успех → 200 {\"status\": \"ok\"}."
    ],
    "contractEN": [
      "Status recognises wrapped errors (errors.Join too): *ValidationError → 400, ErrNotFound → 404, ErrInsufficientFunds → 409, anything else → 500.",
      "Write answers with JSON: for 400, {\"error\": reason, \"field\": field}; for 404 and 409, a clear message.",
      "For a 500 the body reveals nothing about the cause (no driver text, no addresses), and the error is logged as exactly one record; client errors are not logged.",
      "TransferHandler: invalid JSON or data after it → 400 with field \"body\", amount ≤ 0 → 400 with field \"amount\" without calling the Ledger; the Ledger gets the request's context; success → 200 {\"status\": \"ok\"}."
    ],
    "planTasks": [
      "w5-tue-2"
    ],
    "links": [
      "c46",
      "c39",
      "q39",
      "c48"
    ],
    "refs": [
      {
        "t": "RFC 9457: Problem Details",
        "u": "https://www.rfc-editor.org/rfc/rfc9457"
      }
    ],
    "hints": [
      "errors.Is для sentinel-ошибок, errors.As для *ValidationError — оба проходят по всей цепочке, включая errors.Join.",
      "Цель errors.As — указатель на тот тип, у которого метод Error: var ve *ValidationError. С var ve ValidationError будет panic (q39).",
      "Тело 500 строй из http.StatusText(500), а не из err.Error(): в тексте ошибки драйвера бывают адреса и SQL.",
      "Логируй в одном месте — в ветке 500 внутри Write. Ошибки клиента не требуют внимания дежурного и только засоряют лог."
    ],
    "talkEN": "The domain returns sentinel and typed errors and knows nothing about HTTP. One function at the boundary maps them with errors.Is and errors.As, so wrapped errors still match: validation becomes 400 with the field, not found 404, insufficient funds 409, because the request conflicts with the current balance. Anything else is a 500 with a generic body; the real error is logged once, there, with the request context, and never shown to the client. Validation that the handler can do itself, like a positive amount, happens before calling the ledger.",
    "pitfalls": [
      "err == ErrNotFound → после первой обёртки %w перестаёт совпадать.",
      "err.Error() в теле 500 → наружу уходят SQL, адреса, имена таблиц.",
      "Логировать каждую ошибку, включая 4xx → лог зашумлён, настоящие сбои теряются.",
      "context.Background() вместо r.Context() → запрос к базе не отменится, когда клиент ушёл."
    ],
    "followUps": [
      "Перейди на RFC 9457: Content-Type application/problem+json и поля type, title, status, detail.",
      "Добавь ErrAccountClosed — сколько мест в коде пришлось изменить? Должно быть одно.",
      "Что вернуть, если r.Context() отменён посреди перевода: 499, 503 или ничего — и почему?"
    ],
    "fixture": "docs/verification/fixtures/practice/httperr",
    "files": {
      "starter": {
        "name": "httperr.go",
        "code": "// Package httperr: practice task W5-2. Replace each TODO with your solution.\npackage httperr\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"log/slog\"\n\t\"net/http\"\n)\n\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\ntype ValidationError struct{ Field, Reason string }\n\nfunc (e *ValidationError) Error() string { return \"invalid \" + e.Field + \": \" + e.Reason }\n\ntype Ledger interface {\n\tTransfer(ctx context.Context, from, to string, amount int64) error\n}\n\n// Status maps an error (possibly wrapped) to an HTTP status code.\nfunc Status(err error) int {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Write sends err as JSON {\"error\": ..., \"field\": ...}; a 500 hides the cause and logs it once.\nfunc Write(w http.ResponseWriter, log *slog.Logger, err error) {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// TransferHandler handles POST /transfers {\"from\",\"to\",\"amount\"}.\nfunc TransferHandler(l Ledger, log *slog.Logger) http.HandlerFunc {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "httperr_test.go",
        "code": "package httperr\n\nimport (\n\t\"bytes\"\n\t\"context\"\n\t\"encoding/json\"\n\t\"errors\"\n\t\"fmt\"\n\t\"log/slog\"\n\t\"net/http/httptest\"\n\t\"strings\"\n\t\"testing\"\n)\n\n// fakeLedger returns a prepared error and records the call.\ntype fakeLedger struct {\n\terr   error\n\tcalls int\n}\n\nfunc (f *fakeLedger) Transfer(ctx context.Context, from, to string, amount int64) error {\n\tf.calls++\n\treturn f.err\n}\n\nfunc newLog() (*slog.Logger, *bytes.Buffer) {\n\tvar buf bytes.Buffer\n\treturn slog.New(slog.NewJSONHandler(&buf, nil)), &buf\n}\n\nfunc post(t *testing.T, l Ledger, log *slog.Logger, body string) (int, map[string]string) {\n\tt.Helper()\n\trec := httptest.NewRecorder()\n\tTransferHandler(l, log).ServeHTTP(rec, httptest.NewRequest(\"POST\", \"/transfers\", strings.NewReader(body)))\n\t// Result().Header is what was sent: headers set after WriteHeader are not in it.\n\tif ct := rec.Result().Header.Get(\"Content-Type\"); ct != \"application/json\" {\n\t\tt.Fatalf(\"Content-Type = %q\", ct)\n\t}\n\tvar out map[string]string\n\tif err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {\n\t\tt.Fatalf(\"body is not JSON: %q\", rec.Body.String())\n\t}\n\treturn rec.Code, out\n}\n\nfunc TestStatusMapsWrappedErrors(t *testing.T) {\n\tfor _, tt := range []struct {\n\t\terr  error\n\t\twant int\n\t}{\n\t\t{fmt.Errorf(\"transfer: %w\", &ValidationError{\"amount\", \"must be positive\"}), 400},\n\t\t{fmt.Errorf(\"transfer A→B: %w\", ErrNotFound), 404},\n\t\t{fmt.Errorf(\"transfer A→B: %w\", ErrInsufficientFunds), 409},\n\t\t{errors.Join(errors.New(\"audit\"), fmt.Errorf(\"debit: %w\", ErrInsufficientFunds)), 409},\n\t\t{errors.New(\"pq: connection refused\"), 500},\n\t} {\n\t\tif got := Status(tt.err); got != tt.want {\n\t\t\tt.Errorf(\"Status(%v) = %d, want %d\", tt.err, got, tt.want)\n\t\t}\n\t}\n}\n\nfunc TestTransferOK(t *testing.T) {\n\tlog, buf := newLog()\n\tcode, body := post(t, &fakeLedger{}, log, `{\"from\":\"a\",\"to\":\"b\",\"amount\":500}`)\n\tif code != 200 || body[\"status\"] != \"ok\" || buf.Len() != 0 {\n\t\tt.Fatalf(\"got %d %v, log %q\", code, body, buf)\n\t}\n}\n\nfunc TestClientErrorsAreExplainedAndNotLogged(t *testing.T) {\n\tfor name, tt := range map[string]struct {\n\t\tledgerErr error\n\t\tbody      string\n\t\tcode      int\n\t\tfield     string\n\t}{\n\t\t\"bad JSON\":            {nil, `{`, 400, \"body\"},\n\t\t\"data after the JSON\": {nil, `{\"from\":\"a\",\"to\":\"b\",\"amount\":5} garbage`, 400, \"body\"},\n\t\t\"zero amount\":         {nil, `{\"from\":\"a\",\"to\":\"b\",\"amount\":0}`, 400, \"amount\"},\n\t\t\"unknown account\":     {fmt.Errorf(\"transfer: %w\", ErrNotFound), `{\"from\":\"a\",\"to\":\"x\",\"amount\":5}`, 404, \"\"},\n\t\t\"insufficient funds\":  {fmt.Errorf(\"transfer: %w\", ErrInsufficientFunds), `{\"from\":\"a\",\"to\":\"b\",\"amount\":5}`, 409, \"\"},\n\t} {\n\t\tlog, buf := newLog()\n\t\tcode, body := post(t, &fakeLedger{err: tt.ledgerErr}, log, tt.body)\n\t\tif code != tt.code || body[\"error\"] == \"\" || body[\"field\"] != tt.field {\n\t\t\tt.Errorf(\"%s: got %d %v, want %d with field %q\", name, code, body, tt.code, tt.field)\n\t\t}\n\t\tif buf.Len() != 0 {\n\t\t\tt.Errorf(\"%s: a client error was logged: %s\", name, buf)\n\t\t}\n\t}\n}\n\nfunc TestInvalidAmountDoesNotReachTheLedger(t *testing.T) {\n\tlog, _ := newLog()\n\tl := &fakeLedger{}\n\tpost(t, l, log, `{\"from\":\"a\",\"to\":\"b\",\"amount\":-5}`)\n\tif l.calls != 0 {\n\t\tt.Fatal(\"the ledger was called with an invalid amount\")\n\t}\n}\n\nfunc TestInternalErrorIsHiddenAndLoggedOnce(t *testing.T) {\n\tlog, buf := newLog()\n\tcode, body := post(t, &fakeLedger{err: errors.New(\"pq: connection refused to 10.0.3.7\")}, log, `{\"from\":\"a\",\"to\":\"b\",\"amount\":5}`)\n\tif code != 500 {\n\t\tt.Fatalf(\"code = %d, want 500\", code)\n\t}\n\tif strings.Contains(body[\"error\"], \"pq\") || strings.Contains(body[\"error\"], \"10.0.3.7\") {\n\t\tt.Fatalf(\"the 500 body leaks the cause: %v\", body)\n\t}\n\tif n := strings.Count(buf.String(), \"\\n\"); n != 1 || !strings.Contains(buf.String(), \"10.0.3.7\") {\n\t\tt.Fatalf(\"want exactly one log record with the cause, got %d:\\n%s\", n, buf)\n\t}\n}\n\nfunc TestTransferUsesTheRequestContext(t *testing.T) {\n\tlog, _ := newLog()\n\tvar seen context.Context\n\tl := ledgerFunc(func(ctx context.Context) error { seen = ctx; return nil })\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\trec := httptest.NewRecorder()\n\treq := httptest.NewRequest(\"POST\", \"/transfers\", strings.NewReader(`{\"from\":\"a\",\"to\":\"b\",\"amount\":5}`)).WithContext(ctx)\n\tTransferHandler(l, log).ServeHTTP(rec, req)\n\tif seen == nil || seen.Err() == nil {\n\t\tt.Fatal(\"the ledger did not get the request's context\")\n\t}\n}\n\ntype ledgerFunc func(ctx context.Context) error\n\nfunc (f ledgerFunc) Transfer(ctx context.Context, from, to string, amount int64) error { return f(ctx) }"
      },
      "solution": {
        "name": "httperr.go",
        "code": "// Package httperr is the reference solution for practice task W5-2: domain\n// errors become HTTP responses in one place, without leaking internals.\npackage httperr\n\nimport (\n\t\"context\"\n\t\"encoding/json\"\n\t\"errors\"\n\t\"io\"\n\t\"log/slog\"\n\t\"net/http\"\n)\n\n// Domain errors. In the project they live in the ledger package, which does\n// not import net/http; the mapping below is the only place that knows both.\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\ntype ValidationError struct{ Field, Reason string }\n\nfunc (e *ValidationError) Error() string { return \"invalid \" + e.Field + \": \" + e.Reason }\n\n// Ledger is the domain operation the handler calls.\ntype Ledger interface {\n\tTransfer(ctx context.Context, from, to string, amount int64) error\n}\n\n// Status maps an error to an HTTP status code. Insufficient funds is 409\n// Conflict: the request is valid but conflicts with the current balance.\nfunc Status(err error) int {\n\tvar ve *ValidationError\n\tswitch {\n\tcase errors.As(err, &ve):\n\t\treturn http.StatusBadRequest\n\tcase errors.Is(err, ErrNotFound):\n\t\treturn http.StatusNotFound\n\tcase errors.Is(err, ErrInsufficientFunds):\n\t\treturn http.StatusConflict\n\tdefault:\n\t\treturn http.StatusInternalServerError\n\t}\n}\n\n// Write sends err as JSON. Client errors say what was wrong; a 500 says\n// nothing about the cause, and only a 500 is logged, once, with the details.\nfunc Write(w http.ResponseWriter, log *slog.Logger, err error) {\n\tstatus := Status(err)\n\tbody := map[string]string{\"error\": http.StatusText(status)}\n\tvar ve *ValidationError\n\tswitch {\n\tcase errors.As(err, &ve):\n\t\tbody = map[string]string{\"error\": ve.Reason, \"field\": ve.Field}\n\tcase status == http.StatusNotFound:\n\t\tbody[\"error\"] = ErrNotFound.Error()\n\tcase status == http.StatusConflict:\n\t\tbody[\"error\"] = ErrInsufficientFunds.Error()\n\tdefault:\n\t\tlog.Error(\"request failed\", \"err\", err)\n\t}\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(body)\n}\n\n// TransferHandler handles POST /transfers {\"from\",\"to\",\"amount\"}.\nfunc TransferHandler(l Ledger, log *slog.Logger) http.HandlerFunc {\n\treturn func(w http.ResponseWriter, r *http.Request) {\n\t\tvar in struct {\n\t\t\tFrom   string `json:\"from\"`\n\t\t\tTo     string `json:\"to\"`\n\t\t\tAmount int64  `json:\"amount\"`\n\t\t}\n\t\tdec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))\n\t\t// One JSON object and nothing after it: \"{...} garbage\" or a second object is a bad request.\n\t\tif err := dec.Decode(&in); err != nil || dec.Decode(&struct{}{}) != io.EOF {\n\t\t\tWrite(w, log, &ValidationError{Field: \"body\", Reason: \"must be JSON like {\\\"from\\\", \\\"to\\\", \\\"amount\\\"}\"})\n\t\t\treturn\n\t\t}\n\t\tif in.Amount <= 0 {\n\t\t\tWrite(w, log, &ValidationError{Field: \"amount\", Reason: \"must be positive\"})\n\t\t\treturn\n\t\t}\n\t\tif err := l.Transfer(r.Context(), in.From, in.To, in.Amount); err != nil {\n\t\t\tWrite(w, log, err)\n\t\t\treturn\n\t\t}\n\t\tw.Header().Set(\"Content-Type\", \"application/json\")\n\t\tjson.NewEncoder(w).Encode(map[string]string{\"status\": \"ok\"})\n\t}\n}"
      }
    }
  },
  {
    "id": "p-transfers",
    "code": "W6-1",
    "week": 6,
    "title": "Параллельные переводы: порядок блокировок и инвариант",
    "titleEN": "Concurrent transfers: lock order and the invariant",
    "goalRU": "Перевод между счетами в памяти, который выдерживает 100 параллельных горутин: сумма балансов не меняется, баланс не уходит в минус, встречные переводы не дают дедлока, а Total видит согласованный снимок.",
    "contractRU": [
      "Transfer: amount ≤ 0 → ErrInvalidAmount, from == to → ErrSameAccount, неизвестный счёт → ошибка, которую errors.Is сопоставляет с ErrNotFound.",
      "Нехватка средств → ошибка с ErrInsufficientFunds, балансы не меняются; проверка баланса — под блокировками обоих счетов.",
      "Встречные переводы A→B и B→A одновременно не приводят к дедлоку: блокировки берутся в одном порядке — по возрастанию ID.",
      "Total — согласованный снимок: никогда не видит перевод наполовину; Balance возвращает баланс одного счёта.",
      "Тесты проходят с go test -race; при дедлоке тест падает по таймауту, а не зависает."
    ],
    "contractEN": [
      "Transfer: amount ≤ 0 → ErrInvalidAmount, from == to → ErrSameAccount, an unknown account → an error that errors.Is matches with ErrNotFound.",
      "Insufficient funds → an error matching ErrInsufficientFunds, balances unchanged; the balance check happens under the locks of both accounts.",
      "Opposite transfers A→B and B→A at the same time do not deadlock: locks are always taken in one order, by ascending ID.",
      "Total is a consistent snapshot that never sees a transfer half done; Balance returns one account's balance.",
      "The tests pass with go test -race; a deadlock fails the test by timeout instead of hanging it."
    ],
    "planTasks": [
      "w6-mon-1",
      "w6-sat-1"
    ],
    "links": [
      "c50",
      "c49",
      "q41",
      "c21"
    ],
    "refs": [
      {
        "t": "PostgreSQL: Explicit Locking — Deadlocks",
        "u": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
      },
      {
        "t": "sync: Mutex",
        "u": "https://pkg.go.dev/sync#Mutex"
      }
    ],
    "hints": [
      "Мьютекс на каждый счёт, а не один на весь Ledger: иначе переводы между разными парами счетов ждут друг друга.",
      "Порядок блокировок не должен зависеть от направления перевода: first, second := src, dst; если to < from — поменять местами.",
      "Проверку баланса делай после того, как взял обе блокировки. Проверка до блокировки — то же «проверить, потом сделать», что в q40. Balance тоже читает под блокировкой счёта.",
      "Total: возьми блокировки всех счетов в том же порядке, посчитай сумму, отпусти. По одному счёту за раз — и снимок увидит деньги «в пути».",
      "from == to отклоняй сразу: sync.Mutex не реентерабелен, второй Lock той же горутины повиснет."
    ],
    "talkEN": "Each account has its own mutex, so transfers between different pairs run in parallel. A transfer locks both accounts in ascending ID order, whatever its direction; with request order, A to B and B to A each hold one lock and wait for the other forever. The balance is checked under both locks, so two transfers cannot spend the same money. Total locks every account in the same order, so it never sees money in flight. The test runs a hundred goroutines under the race detector and fails by timeout if anything deadlocks. In PostgreSQL I do the same with SELECT FOR UPDATE in ID order, and still retry 40P01.",
    "pitfalls": [
      "Блокировки в порядке from, to → встречные переводы зависают навсегда.",
      "Проверка баланса до блокировки → несколько переводов тратят одни и те же деньги, баланс уходит в минус.",
      "Один мьютекс на весь Ledger → корректно, но все переводы идут по очереди.",
      "Total по одному счёту за раз → сумма «плавает», пока идут переводы.",
      "Тест без таймаута → при дедлоке он висит до общего лимита go test вместо понятного сообщения."
    ],
    "followUps": [
      "Переведи Ledger на PostgreSQL: SELECT … FOR UPDATE в порядке ID и повтор при 40P01 (c49, c50).",
      "Добавь перевод «одному получателю от многих» (fan-in): что изменится в порядке блокировок?",
      "Как доказать, что тест действительно ловит дедлок? Поменяй порядок блокировок и посмотри, что он скажет."
    ],
    "fixture": "docs/verification/fixtures/practice/transfers",
    "files": {
      "starter": {
        "name": "transfers.go",
        "code": "// Package transfers: practice task W6-1. Replace each TODO with your solution.\npackage transfers\n\nimport (\n\t\"errors\"\n\t\"maps\"\n\t\"slices\"\n\t\"sync\"\n)\n\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrSameAccount       = errors.New(\"same account\")\n\tErrInvalidAmount     = errors.New(\"amount must be positive\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\ntype account struct {\n\tmu      sync.Mutex\n\tbalance int64\n}\n\n// Ledger holds the accounts created by New; the set of accounts never changes afterwards,\n// so the map itself needs no lock.\ntype Ledger struct {\n\taccounts map[int64]*account\n\tids      []int64 // ascending\n}\n\n// New creates a ledger with the given opening balances.\nfunc New(balances map[int64]int64) *Ledger {\n\tl := &Ledger{accounts: make(map[int64]*account, len(balances))}\n\tfor id, b := range balances {\n\t\tl.accounts[id] = &account{balance: b}\n\t}\n\tl.ids = slices.Sorted(maps.Keys(l.accounts))\n\treturn l\n}\n\n// Transfer moves amount from one account to another as one step.\n//\n// Contract:\n//   - amount <= 0 → ErrInvalidAmount; from == to → ErrSameAccount;\n//   - an unknown account → an error that errors.Is matches with ErrNotFound;\n//   - not enough money → an error matching ErrInsufficientFunds, balances unchanged;\n//   - transfers in opposite directions at the same time must not deadlock;\n//   - the sum of all balances never changes and no balance goes below zero.\nfunc (l *Ledger) Transfer(from, to, amount int64) error {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Balance returns the current balance of one account (ErrNotFound for an unknown ID).\nfunc (l *Ledger) Balance(id int64) (int64, error) {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Total returns the sum of all balances as one consistent snapshot:\n// it must never see a transfer half done.\nfunc (l *Ledger) Total() int64 {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "transfers_test.go",
        "code": "package transfers\n\nimport (\n\t\"errors\"\n\t\"math/rand/v2\"\n\t\"sync\"\n\t\"testing\"\n\t\"time\"\n)\n\n// finishWithin fails the test instead of hanging when the work deadlocks.\nfunc finishWithin(t *testing.T, d time.Duration, work func()) {\n\tt.Helper()\n\tdone := make(chan struct{})\n\tgo func() {\n\t\tdefer close(done)\n\t\twork()\n\t}()\n\tselect {\n\tcase <-done:\n\tcase <-time.After(d):\n\t\tt.Fatalf(\"not finished in %v: a deadlock? (lock order must not depend on the transfer direction)\", d)\n\t}\n}\n\nfunc balance(t *testing.T, l *Ledger, id int64) int64 {\n\tt.Helper()\n\tb, err := l.Balance(id)\n\tif err != nil {\n\t\tt.Fatalf(\"Balance(%d): %v\", id, err)\n\t}\n\treturn b\n}\n\nfunc TestTransferMovesMoney(t *testing.T) {\n\tl := New(map[int64]int64{1: 100, 2: 50})\n\tif err := l.Transfer(1, 2, 30); err != nil {\n\t\tt.Fatalf(\"Transfer: %v\", err)\n\t}\n\tif got := balance(t, l, 1); got != 70 {\n\t\tt.Errorf(\"balance 1 = %d, want 70\", got)\n\t}\n\tif got := balance(t, l, 2); got != 80 {\n\t\tt.Errorf(\"balance 2 = %d, want 80\", got)\n\t}\n\tif got := l.Total(); got != 150 {\n\t\tt.Errorf(\"Total = %d, want 150\", got)\n\t}\n}\n\nfunc TestTransferErrors(t *testing.T) {\n\tl := New(map[int64]int64{1: 100, 2: 50})\n\tcases := []struct {\n\t\tname             string\n\t\tfrom, to, amount int64\n\t\twant             error\n\t}{\n\t\t{\"zero amount\", 1, 2, 0, ErrInvalidAmount},\n\t\t{\"negative amount\", 1, 2, -5, ErrInvalidAmount},\n\t\t{\"same account\", 1, 1, 10, ErrSameAccount},\n\t\t{\"unknown source\", 9, 2, 10, ErrNotFound},\n\t\t{\"unknown destination\", 1, 9, 10, ErrNotFound},\n\t\t{\"insufficient funds\", 2, 1, 51, ErrInsufficientFunds},\n\t}\n\tfor _, tc := range cases {\n\t\tt.Run(tc.name, func(t *testing.T) {\n\t\t\tvar err error\n\t\t\tfinishWithin(t, 2*time.Second, func() { err = l.Transfer(tc.from, tc.to, tc.amount) })\n\t\t\tif !errors.Is(err, tc.want) {\n\t\t\t\tt.Fatalf(\"Transfer(%d, %d, %d) = %v, want errors.Is %v\", tc.from, tc.to, tc.amount, err, tc.want)\n\t\t\t}\n\t\t})\n\t}\n\tif t.Failed() {\n\t\treturn // a hung transfer may still hold a lock: reading balances would hang too\n\t}\n\tif balance(t, l, 1) != 100 || balance(t, l, 2) != 50 {\n\t\tt.Errorf(\"a failed transfer changed balances: %d, %d\", balance(t, l, 1), balance(t, l, 2))\n\t}\n\tif _, err := l.Balance(9); !errors.Is(err, ErrNotFound) {\n\t\tt.Errorf(\"Balance(9) = %v, want ErrNotFound\", err)\n\t}\n}\n\n// Opposite directions at the same time: with locks taken in request order this deadlocks.\nfunc TestOppositeTransfersDoNotDeadlock(t *testing.T) {\n\tl := New(map[int64]int64{1: 1000, 2: 1000})\n\tfinishWithin(t, 5*time.Second, func() {\n\t\tvar wg sync.WaitGroup\n\t\tfor i := range 100 {\n\t\t\twg.Add(1)\n\t\t\tgo func() {\n\t\t\t\tdefer wg.Done()\n\t\t\t\tfor range 200 {\n\t\t\t\t\tif i%2 == 0 {\n\t\t\t\t\t\t_ = l.Transfer(1, 2, 1)\n\t\t\t\t\t} else {\n\t\t\t\t\t\t_ = l.Transfer(2, 1, 1)\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}()\n\t\t}\n\t\twg.Wait()\n\t})\n\tif got := l.Total(); got != 2000 {\n\t\tt.Fatalf(\"Total = %d, want 2000\", got)\n\t}\n}\n\n// 100 goroutines transfer random amounts between 10 accounts while another goroutine\n// keeps checking the total. The sum never changes and no balance goes below zero.\nfunc TestConcurrentTransfersKeepTheInvariant(t *testing.T) {\n\tconst accounts, opening = 10, 100\n\tbalances := make(map[int64]int64, accounts)\n\tfor id := range int64(accounts) {\n\t\tbalances[id+1] = opening\n\t}\n\tl := New(balances)\n\twant := int64(accounts * opening)\n\n\tstop := make(chan struct{})\n\ttotals := make(chan int64, 1)\n\tgo func() {\n\t\tbad := want\n\t\tdefer func() { totals <- bad }()\n\t\tfor {\n\t\t\tselect {\n\t\t\tcase <-stop:\n\t\t\t\treturn\n\t\t\tdefault:\n\t\t\t}\n\t\t\tif got := l.Total(); got != want {\n\t\t\t\tbad = got\n\t\t\t\treturn\n\t\t\t}\n\t\t\tfor id := range int64(accounts) {\n\t\t\t\tif b, err := l.Balance(id + 1); err != nil || b < 0 {\n\t\t\t\t\tbad = -1\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}()\n\n\tvar ok, refused int64\n\tvar mu sync.Mutex\n\tfinishWithin(t, 10*time.Second, func() {\n\t\tvar wg sync.WaitGroup\n\t\tfor g := range 100 {\n\t\t\twg.Add(1)\n\t\t\tgo func() {\n\t\t\t\tdefer wg.Done()\n\t\t\t\tr := rand.New(rand.NewPCG(uint64(g), 42))\n\t\t\t\tfor range 100 {\n\t\t\t\t\tfrom, to := r.Int64N(accounts)+1, r.Int64N(accounts)+1\n\t\t\t\t\tif from == to {\n\t\t\t\t\t\tcontinue\n\t\t\t\t\t}\n\t\t\t\t\terr := l.Transfer(from, to, r.Int64N(60)+1)\n\t\t\t\t\tmu.Lock()\n\t\t\t\t\tswitch {\n\t\t\t\t\tcase err == nil:\n\t\t\t\t\t\tok++\n\t\t\t\t\tcase errors.Is(err, ErrInsufficientFunds):\n\t\t\t\t\t\trefused++\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tmu.Unlock()\n\t\t\t\t\t\tt.Errorf(\"unexpected error: %v\", err)\n\t\t\t\t\t\treturn\n\t\t\t\t\t}\n\t\t\t\t\tmu.Unlock()\n\t\t\t\t}\n\t\t\t}()\n\t\t}\n\t\twg.Wait()\n\t})\n\tclose(stop)\n\tif got := <-totals; got != want {\n\t\tt.Errorf(\"Total during the transfers = %d, want %d: Total saw a half-done transfer\", got, want)\n\t}\n\tif got := l.Total(); got != want {\n\t\tt.Errorf(\"Total after = %d, want %d\", got, want)\n\t}\n\tfor id := range int64(accounts) {\n\t\tif b := balance(t, l, id+1); b < 0 {\n\t\t\tt.Errorf(\"account %d went negative: %d (balance checked before taking the locks?)\", id+1, b)\n\t\t}\n\t}\n\tt.Logf(\"transfers: %d done, %d refused for insufficient funds\", ok, refused)\n}\n\n// Many withdrawals race for the same money: exactly as many succeed as the balance allows.\nfunc TestNoOverdraftUnderContention(t *testing.T) {\n\tfor round := range 200 {\n\t\tl := New(map[int64]int64{1: 100, 2: 0})\n\t\tstart := make(chan struct{})\n\t\tvar wg sync.WaitGroup\n\t\tvar mu sync.Mutex\n\t\tsucceeded := 0\n\t\tfor range 32 {\n\t\t\twg.Add(1)\n\t\t\tgo func() {\n\t\t\t\tdefer wg.Done()\n\t\t\t\t<-start\n\t\t\t\tif l.Transfer(1, 2, 10) == nil {\n\t\t\t\t\tmu.Lock()\n\t\t\t\t\tsucceeded++\n\t\t\t\t\tmu.Unlock()\n\t\t\t\t}\n\t\t\t}()\n\t\t}\n\t\tclose(start)\n\t\twg.Wait()\n\t\tif b := balance(t, l, 1); succeeded != 10 || b != 0 {\n\t\t\tt.Fatalf(\"round %d: %d transfers of 10 succeeded from a balance of 100, balance now %d; want 10 and 0\", round, succeeded, b)\n\t\t}\n\t}\n}"
      },
      "solution": {
        "name": "transfers.go",
        "code": "// Package transfers is the reference solution for practice task W6-1: concurrent\n// transfers between in-memory accounts, with per-account locks taken in ID order.\npackage transfers\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"maps\"\n\t\"slices\"\n\t\"sync\"\n)\n\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrSameAccount       = errors.New(\"same account\")\n\tErrInvalidAmount     = errors.New(\"amount must be positive\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\ntype account struct {\n\tmu      sync.Mutex\n\tbalance int64\n}\n\n// Ledger holds the accounts created by New; the set of accounts never changes afterwards,\n// so the map itself needs no lock.\ntype Ledger struct {\n\taccounts map[int64]*account\n\tids      []int64 // ascending: the one lock order for every operation\n}\n\n// New creates a ledger with the given opening balances.\nfunc New(balances map[int64]int64) *Ledger {\n\tl := &Ledger{accounts: make(map[int64]*account, len(balances))}\n\tfor id, b := range balances {\n\t\tl.accounts[id] = &account{balance: b}\n\t}\n\tl.ids = slices.Sorted(maps.Keys(l.accounts))\n\treturn l\n}\n\n// Transfer moves amount from one account to another as one step: no other\n// operation sees the money in neither or in both accounts.\nfunc (l *Ledger) Transfer(from, to, amount int64) error {\n\tif amount <= 0 {\n\t\treturn ErrInvalidAmount\n\t}\n\tif from == to {\n\t\treturn ErrSameAccount // sync.Mutex is not reentrant: locking it twice would hang\n\t}\n\tsrc, ok := l.accounts[from]\n\tif !ok {\n\t\treturn fmt.Errorf(\"transfer from %d: %w\", from, ErrNotFound)\n\t}\n\tdst, ok := l.accounts[to]\n\tif !ok {\n\t\treturn fmt.Errorf(\"transfer to %d: %w\", to, ErrNotFound)\n\t}\n\n\t// Lock in ascending ID order, whatever the direction: A→B and B→A cannot wait on each other.\n\tfirst, second := src, dst\n\tif to < from {\n\t\tfirst, second = dst, src\n\t}\n\tfirst.mu.Lock()\n\tdefer first.mu.Unlock()\n\tsecond.mu.Lock()\n\tdefer second.mu.Unlock()\n\n\t// The check happens under both locks, so nobody can spend the same money in between.\n\tif src.balance < amount {\n\t\treturn fmt.Errorf(\"transfer %d from %d: %w\", amount, from, ErrInsufficientFunds)\n\t}\n\tsrc.balance -= amount\n\tdst.balance += amount\n\treturn nil\n}\n\n// Balance returns the current balance of one account.\nfunc (l *Ledger) Balance(id int64) (int64, error) {\n\ta, ok := l.accounts[id]\n\tif !ok {\n\t\treturn 0, fmt.Errorf(\"balance of %d: %w\", id, ErrNotFound)\n\t}\n\ta.mu.Lock()\n\tdefer a.mu.Unlock()\n\treturn a.balance, nil\n}\n\n// Total returns the sum of all balances as one consistent snapshot. It locks every\n// account in the same ascending order as Transfer, so it never sees a transfer half done.\nfunc (l *Ledger) Total() int64 {\n\tvar sum int64\n\tfor _, id := range l.ids {\n\t\tl.accounts[id].mu.Lock()\n\t}\n\tfor _, id := range l.ids {\n\t\tsum += l.accounts[id].balance\n\t}\n\tfor _, id := range slices.Backward(l.ids) {\n\t\tl.accounts[id].mu.Unlock()\n\t}\n\treturn sum\n}"
      }
    }
  },
  {
    "id": "p-idempotency",
    "code": "W6-2",
    "week": 6,
    "title": "Идемпотентный перевод: ключ, отпечаток и сохранённый ответ",
    "titleEN": "Idempotent transfer: key, fingerprint and stored response",
    "goalRU": "Хранилище ключей идемпотентности и HTTP-обработчик POST /transfers: повтор с тем же ключом возвращает сохранённый ответ без второго перевода, другой запрос с тем же ключом — 422, повтор во время выполнения — 409, сбой инфраструктуры не сохраняется.",
    "contractRU": [
      "Store.Do выполняет fn не больше одного раза на ключ: ключ занимается в той же критической секции, что и поиск; fn не выполняется под блокировкой.",
      "Тот же ключ и отпечаток после завершения → сохранённый ответ без вызова fn; во время выполнения → ErrInProgress сразу; другой отпечаток → ErrKeyReused; ошибка fn освобождает ключ.",
      "Handler: нет Idempotency-Key → 400; неверный JSON, лишнее поле или что-то, кроме пробелов, после JSON-объекта → 400, перевод не выполняется, ключ не расходуется; отпечаток — SHA-256 разобранного запроса, поэтому пробелы и порядок полей не важны.",
      "Успех → 201 {\"status\":\"done\"}; ErrInsufficientFunds (обёрнутая) → 409 {\"error\":\"insufficient funds\"} и сохраняется; любая другая ошибка → 500 без деталей и не сохраняется.",
      "Ключ с другим телом → 422, даже пока первый запрос выполняется; повтор во время выполнения → 409 с Retry-After (сохранённый ответ 409 — без него); ledger получает r.Context()."
    ],
    "contractEN": [
      "Store.Do runs fn at most once per key: the key is claimed in the same critical section as the lookup, and fn never runs under the lock.",
      "Same key and fingerprint after completion → the stored response without calling fn; while running → ErrInProgress at once; another fingerprint → ErrKeyReused; an error from fn releases the key.",
      "Handler: no Idempotency-Key → 400; invalid JSON, an unknown field or anything but whitespace after the JSON object → 400, without a transfer and without using up the key; the fingerprint is SHA-256 of the decoded request, so spacing and field order do not matter.",
      "Success → 201 {\"status\":\"done\"}; ErrInsufficientFunds (wrapped) → 409 {\"error\":\"insufficient funds\"}, stored; any other error → 500 without details, not stored.",
      "A key reused with another body → 422, even while the first is still running; a repeat while it runs → 409 with Retry-After (a stored 409 has none); the ledger gets r.Context()."
    ],
    "planTasks": [
      "w6-tue-1",
      "w6-tue-2"
    ],
    "links": [
      "c51",
      "q40",
      "c46",
      "c2"
    ],
    "refs": [
      {
        "t": "IETF draft: The Idempotency-Key HTTP Header Field",
        "u": "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/"
      },
      {
        "t": "PostgreSQL: INSERT — ON CONFLICT",
        "u": "https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT"
      }
    ],
    "hints": [
      "В Do под одной блокировкой: найти ключ, и если его нет — сразу вставить запись «в работе». Разжать блокировку между поиском и вставкой — это q40. Для найденного ключа сначала сравни отпечаток, потом смотри, завершён ли запрос.",
      "fn вызывай после Unlock: иначе все запросы с любыми ключами ждут одну медленную операцию.",
      "Поля записи читай и пиши только под блокировкой: проверка done и чтение resp из другой горутины без неё — гонка данных.",
      "Отпечаток: json.Marshal разобранной структуры, затем sha256.Sum256. Хешировать сырое тело нельзя — повтор с другими пробелами получит 422.",
      "Нехватка средств — бизнес-ответ, его сохраняют; ошибка базы — нет: удали ключ, чтобы повтор выполнил перевод."
    ],
    "talkEN": "The client sends an Idempotency-Key with each transfer. The store claims the key atomically: the lookup and the insert of an in-progress entry happen under one lock, so two concurrent requests cannot both decide the key is new. The transfer itself runs outside the lock. A repeat with the same key and the same request gets the stored response; the fingerprint is a hash of the decoded request, so whitespace does not matter. The same key with a different body gets 422, and a repeat while the first is still running gets 409 with Retry-After. Business outcomes like insufficient funds are stored; infrastructure failures release the key so a retry can run. In PostgreSQL the claim is an insert with on conflict do nothing in the transfer's transaction.",
    "pitfalls": [
      "Проверить ключ, отпустить блокировку, потом вставить → два одновременных запроса оба переводят деньги.",
      "fn под блокировкой хранилища → один медленный перевод останавливает все остальные ключи.",
      "Хеш сырого тела → повтор с другим форматированием получает 422.",
      "Сохранять 500 → после восстановления базы клиент навсегда получает ошибку по этому ключу.",
      "Повтор ждёт завершения первого запроса вместо 409 → горутины копятся под нагрузкой."
    ],
    "followUps": [
      "Перенеси Store в PostgreSQL: таблица idempotency_keys с UNIQUE, INSERT … ON CONFLICT DO NOTHING в транзакции перевода (c51).",
      "Добавь срок жизни ключей: что вернуть, если ключ уже удалён по сроку, а клиент повторил запрос?",
      "Ключи от разных клиентов совпали. Как ограничить пространство ключей клиентом?"
    ],
    "fixture": "docs/verification/fixtures/practice/idempotency",
    "files": {
      "starter": {
        "name": "idempotency.go",
        "code": "// Package idempotency: practice task W6-2. Replace each TODO with your solution.\npackage idempotency\n\nimport (\n\t\"context\"\n\t\"encoding/json\"\n\t\"errors\"\n\t\"net/http\"\n\t\"sync\"\n)\n\nvar (\n\tErrKeyReused         = errors.New(\"idempotency key reused with a different request\")\n\tErrInProgress        = errors.New(\"a request with this idempotency key is still in progress\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\n// Response is what the handler sent for a key; a repeat gets exactly the same.\ntype Response struct {\n\tStatus int\n\tBody   []byte\n}\n\ntype entry struct {\n\tfingerprint [32]byte\n\tdone        bool\n\tresp        Response\n}\n\n// Store remembers, for each key, the request fingerprint and the response.\ntype Store struct {\n\tmu   sync.Mutex\n\tkeys map[string]*entry\n}\n\nfunc NewStore() *Store { return &Store{keys: make(map[string]*entry)} }\n\n// Do runs fn at most once per key.\n//\n// Contract:\n//   - a new key: claim it, run fn, store and return its response;\n//   - same key, same fingerprint, finished: return the stored response without calling fn;\n//   - same key, same fingerprint, still running: ErrInProgress at once (do not wait);\n//   - same key, other fingerprint: ErrKeyReused;\n//   - fn returns an error: release the key, so a retry runs fn again;\n//   - two concurrent calls must never both treat the key as new; fn must not run under the lock.\nfunc (s *Store) Do(key string, fingerprint [32]byte, fn func() (Response, error)) (Response, error) {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Transferer moves money; it is the ledger of week 5 reduced to one method.\ntype Transferer interface {\n\tTransfer(ctx context.Context, from, to string, amount int64) error\n}\n\ntype transferRequest struct {\n\tFrom   string `json:\"from\"`\n\tTo     string `json:\"to\"`\n\tAmount int64  `json:\"amount\"`\n}\n\nfunc jsonResponse(status int, v any) Response {\n\tbody, _ := json.Marshal(v)\n\treturn Response{Status: status, Body: body}\n}\n\nfunc write(w http.ResponseWriter, r Response) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(r.Status)\n\tw.Write(r.Body)\n}\n\n// Handler serves POST /transfers with an Idempotency-Key header.\n//\n// Contract:\n//   - no Idempotency-Key → 400; invalid JSON, an unknown field or anything but whitespace after\n//     the JSON object → 400; none of them calls the ledger or uses up the key;\n//   - the fingerprint is SHA-256 of the decoded request, so other spacing or field order is the same request;\n//   - success → 201 {\"status\":\"done\"}; ErrInsufficientFunds (wrapped) → 409 {\"error\":\"insufficient funds\"},\n//     stored like a success; any other ledger error → 500 without details, not stored;\n//   - key reused with another payload → 422; same key while the first is running → 409 with Retry-After;\n//   - the ledger gets r.Context().\nfunc Handler(store *Store, ledger Transferer) http.Handler {\n\t// TODO\n\tpanic(\"TODO\")\n}"
      },
      "tests": {
        "name": "idempotency_test.go",
        "code": "package idempotency\n\nimport (\n\t\"context\"\n\t\"crypto/sha256\"\n\t\"errors\"\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strings\"\n\t\"sync\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\n// fakeLedger counts calls; err is returned for the next calls until changed.\ntype fakeLedger struct {\n\tmu      sync.Mutex\n\tcalls   int\n\terr     error\n\tentered chan struct{} // if set, receives once per call before the call waits on release\n\trelease chan struct{} // if set, every call waits for it\n\tctxSeen context.Context\n}\n\nfunc (f *fakeLedger) Transfer(ctx context.Context, from, to string, amount int64) error {\n\tf.mu.Lock()\n\tf.calls++\n\tf.ctxSeen = ctx\n\terr := f.err\n\tentered, release := f.entered, f.release\n\tf.mu.Unlock()\n\tif entered != nil {\n\t\tentered <- struct{}{}\n\t}\n\tif release != nil {\n\t\t<-release\n\t}\n\treturn err\n}\n\nfunc (f *fakeLedger) Calls() int {\n\tf.mu.Lock()\n\tdefer f.mu.Unlock()\n\treturn f.calls\n}\n\nfunc post(h http.Handler, key, body string) *httptest.ResponseRecorder {\n\treq := httptest.NewRequest(http.MethodPost, \"/transfers\", strings.NewReader(body))\n\tif key != \"\" {\n\t\treq.Header.Set(\"Idempotency-Key\", key)\n\t}\n\trec := httptest.NewRecorder()\n\th.ServeHTTP(rec, req)\n\treturn rec\n}\n\nconst transfer = `{\"from\":\"A\",\"to\":\"B\",\"amount\":500}`\n\nfunc TestRepeatReturnsStoredResponseWithoutSecondTransfer(t *testing.T) {\n\tledger := &fakeLedger{}\n\th := Handler(NewStore(), ledger)\n\tfirst := post(h, \"k1\", transfer)\n\tif first.Code != http.StatusCreated {\n\t\tt.Fatalf(\"first: status %d %s, want 201\", first.Code, first.Body)\n\t}\n\tsecond := post(h, \"k1\", transfer)\n\tif second.Code != first.Code || second.Body.String() != first.Body.String() {\n\t\tt.Fatalf(\"repeat: %d %s, want the stored %d %s\", second.Code, second.Body, first.Code, first.Body)\n\t}\n\tif ledger.Calls() != 1 {\n\t\tt.Fatalf(\"ledger called %d times, want 1: a repeat must not move money again\", ledger.Calls())\n\t}\n\tif post(h, \"k2\", transfer).Code != http.StatusCreated || ledger.Calls() != 2 {\n\t\tt.Fatalf(\"a new key must run a new transfer (calls = %d)\", ledger.Calls())\n\t}\n}\n\nfunc TestSameRequestWithOtherFormattingIsARepeat(t *testing.T) {\n\tledger := &fakeLedger{}\n\th := Handler(NewStore(), ledger)\n\tpost(h, \"k\", transfer)\n\trec := post(h, \"k\", \"{ \\\"amount\\\": 500,\\n  \\\"to\\\": \\\"B\\\", \\\"from\\\": \\\"A\\\" }\")\n\tif rec.Code != http.StatusCreated || ledger.Calls() != 1 {\n\t\tt.Fatalf(\"same fields, other spacing and order: %d %s, calls %d; want the stored 201 and 1 call\", rec.Code, rec.Body, ledger.Calls())\n\t}\n}\n\nfunc TestKeyReusedWithOtherPayloadIs422(t *testing.T) {\n\tledger := &fakeLedger{}\n\th := Handler(NewStore(), ledger)\n\tpost(h, \"k\", transfer)\n\trec := post(h, \"k\", `{\"from\":\"A\",\"to\":\"B\",\"amount\":900}`)\n\tif rec.Code != http.StatusUnprocessableEntity {\n\t\tt.Fatalf(\"other amount, same key: %d %s, want 422\", rec.Code, rec.Body)\n\t}\n\tif ledger.Calls() != 1 {\n\t\tt.Fatalf(\"ledger called %d times, want 1\", ledger.Calls())\n\t}\n}\n\nfunc TestBadRequests(t *testing.T) {\n\tledger := &fakeLedger{}\n\th := Handler(NewStore(), ledger)\n\tif rec := post(h, \"\", transfer); rec.Code != http.StatusBadRequest {\n\t\tt.Errorf(\"no Idempotency-Key: %d, want 400\", rec.Code)\n\t}\n\tif rec := post(h, \"k\", `{\"from\":`); rec.Code != http.StatusBadRequest {\n\t\tt.Errorf(\"broken JSON: %d, want 400\", rec.Code)\n\t}\n\tif rec := post(h, \"k\", `{\"from\":\"A\",\"to\":\"B\",\"amount\":5,\"admin\":true}`); rec.Code != http.StatusBadRequest {\n\t\tt.Errorf(\"unknown field: %d, want 400\", rec.Code)\n\t}\n\tfor name, body := range map[string]string{\n\t\t\"garbage after the object\": transfer + ` garbage`,\n\t\t\"a second object\":          transfer + ` {\"unexpected\":true}`,\n\t\t\"a second transfer\":        transfer + transfer,\n\t} {\n\t\tif rec := post(h, \"k\", body); rec.Code != http.StatusBadRequest {\n\t\t\tt.Errorf(\"%s: %d, want 400\", name, rec.Code)\n\t\t}\n\t}\n\tif ledger.Calls() != 0 {\n\t\tt.Fatalf(\"ledger called %d times for bad requests, want 0\", ledger.Calls())\n\t}\n\tif rec := post(h, \"k\", transfer+\" \\n\\t \"); rec.Code != http.StatusCreated {\n\t\tt.Fatalf(\"a bad request must not use up the key, and trailing whitespace is fine: %d %s\", rec.Code, rec.Body)\n\t}\n}\n\nfunc TestBusinessOutcomeIsStoredInfrastructureFailureIsNot(t *testing.T) {\n\tledger := &fakeLedger{err: fmt.Errorf(\"debit A: %w\", ErrInsufficientFunds)}\n\th := Handler(NewStore(), ledger)\n\tfirst := post(h, \"poor\", transfer)\n\tledger.mu.Lock()\n\tledger.err = nil\n\tledger.mu.Unlock()\n\tsecond := post(h, \"poor\", transfer)\n\tif second.Header().Get(\"Retry-After\") != \"\" {\n\t\tt.Errorf(\"a stored final answer must not carry Retry-After: that header marks \\\"still in progress\\\"\")\n\t}\n\tif first.Code != http.StatusConflict || second.Code != http.StatusConflict || second.Body.String() != first.Body.String() || ledger.Calls() != 1 {\n\t\tt.Fatalf(\"insufficient funds: first %d %s, repeat %d %s, calls %d; want the same stored 409 and 1 call\",\n\t\t\tfirst.Code, first.Body, second.Code, second.Body, ledger.Calls())\n\t}\n\n\tledger.mu.Lock()\n\tledger.err = errors.New(\"pq: connection refused\")\n\tledger.mu.Unlock()\n\tfailed := post(h, \"flaky\", transfer)\n\tif failed.Code != http.StatusInternalServerError || strings.Contains(failed.Body.String(), \"pq:\") {\n\t\tt.Fatalf(\"infrastructure failure: %d %s, want 500 without details\", failed.Code, failed.Body)\n\t}\n\tledger.mu.Lock()\n\tledger.err = nil\n\tledger.mu.Unlock()\n\tretry := post(h, \"flaky\", transfer)\n\tif retry.Code != http.StatusCreated || ledger.Calls() != 3 {\n\t\tt.Fatalf(\"retry after a 500: %d %s, calls %d; want 201 and a second attempt\", retry.Code, retry.Body, ledger.Calls())\n\t}\n}\n\nfunc TestLedgerGetsTheRequestContext(t *testing.T) {\n\tledger := &fakeLedger{}\n\th := Handler(NewStore(), ledger)\n\ttype ctxKey struct{}\n\treq := httptest.NewRequest(http.MethodPost, \"/transfers\", strings.NewReader(transfer))\n\treq = req.WithContext(context.WithValue(req.Context(), ctxKey{}, \"request\"))\n\treq.Header.Set(\"Idempotency-Key\", \"ctx\")\n\th.ServeHTTP(httptest.NewRecorder(), req)\n\tif ledger.ctxSeen == nil || ledger.ctxSeen.Value(ctxKey{}) != \"request\" {\n\t\tt.Fatal(\"the ledger must get r.Context(), so the transfer stops when the client goes away\")\n\t}\n}\n\n// 20 identical requests while the first is still running: exactly one transfer;\n// the others get 409 at once, and a later repeat gets the stored 201.\nfunc TestConcurrentDuplicatesTransferOnce(t *testing.T) {\n\tledger := &fakeLedger{entered: make(chan struct{}, 1), release: make(chan struct{})}\n\th := Handler(NewStore(), ledger)\n\n\tfirstDone := make(chan *httptest.ResponseRecorder)\n\tgo func() { firstDone <- post(h, \"same\", transfer) }()\n\tselect {\n\tcase <-ledger.entered:\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"the first request never reached the ledger\")\n\t}\n\n\t// Another body with the same key is rejected even while the first is still running.\n\tif rec := post(h, \"same\", `{\"from\":\"A\",\"to\":\"B\",\"amount\":1}`); rec.Code != http.StatusUnprocessableEntity {\n\t\tclose(ledger.release)\n\t\tt.Fatalf(\"other body, same key, while in progress: %d %s, want 422 (compare the fingerprint first)\", rec.Code, rec.Body)\n\t}\n\n\tvar conflicts, others atomic.Int32\n\tvar wg sync.WaitGroup\n\tfor range 19 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\trec := post(h, \"same\", transfer)\n\t\t\tif rec.Code == http.StatusConflict && rec.Header().Get(\"Retry-After\") != \"\" {\n\t\t\t\tconflicts.Add(1)\n\t\t\t} else {\n\t\t\t\tothers.Add(1)\n\t\t\t}\n\t\t}()\n\t}\n\twaited := make(chan struct{})\n\tgo func() { wg.Wait(); close(waited) }()\n\tselect {\n\tcase <-waited:\n\tcase <-time.After(2 * time.Second):\n\t\tclose(ledger.release)\n\t\tt.Fatal(\"duplicates waited for the first request instead of answering 409 at once (or fn runs under the lock)\")\n\t}\n\tclose(ledger.release)\n\tfirst := <-firstDone\n\n\tif first.Code != http.StatusCreated {\n\t\tt.Fatalf(\"first: %d %s, want 201\", first.Code, first.Body)\n\t}\n\tif conflicts.Load() != 19 || others.Load() != 0 {\n\t\tt.Fatalf(\"while in progress: %d answered 409 with Retry-After, %d otherwise; want 19 and 0\", conflicts.Load(), others.Load())\n\t}\n\tif ledger.Calls() != 1 {\n\t\tt.Fatalf(\"ledger called %d times, want exactly 1\", ledger.Calls())\n\t}\n\tif rec := post(h, \"same\", transfer); rec.Code != http.StatusCreated || rec.Body.String() != first.Body.String() {\n\t\tt.Fatalf(\"repeat after completion: %d %s, want the stored 201\", rec.Code, rec.Body)\n\t}\n}\n\n// The same guarantee without HTTP: 50 calls released at once, in 100 rounds,\n// run fn once per key (claiming must be part of the same critical section as the lookup).\nfunc TestStoreDoRunsOncePerKey(t *testing.T) {\n\ts := NewStore()\n\tfp := sha256.Sum256([]byte(\"req\"))\n\tfor round := range 100 {\n\t\tkey := fmt.Sprintf(\"k%d\", round)\n\t\tvar runs atomic.Int32\n\t\tstart := make(chan struct{})\n\t\tvar wg sync.WaitGroup\n\t\tfor range 50 {\n\t\t\twg.Add(1)\n\t\t\tgo func() {\n\t\t\t\tdefer wg.Done()\n\t\t\t\t<-start\n\t\t\t\tresp, err := s.Do(key, fp, func() (Response, error) {\n\t\t\t\t\truns.Add(1)\n\t\t\t\t\ttime.Sleep(time.Millisecond)\n\t\t\t\t\treturn Response{Status: 201, Body: []byte(\"ok\")}, nil\n\t\t\t\t})\n\t\t\t\tif err != nil && !errors.Is(err, ErrInProgress) {\n\t\t\t\t\tt.Errorf(\"Do: %v\", err)\n\t\t\t\t}\n\t\t\t\tif err == nil && (resp.Status != 201 || string(resp.Body) != \"ok\") {\n\t\t\t\t\tt.Errorf(\"Do returned %v\", resp)\n\t\t\t\t}\n\t\t\t}()\n\t\t}\n\t\tclose(start)\n\t\twg.Wait()\n\t\tif runs.Load() != 1 {\n\t\t\tt.Fatalf(\"round %d: fn ran %d times for one key, want 1\", round, runs.Load())\n\t\t}\n\t}\n\tif _, err := s.Do(\"k0\", sha256.Sum256([]byte(\"other\")), nil); !errors.Is(err, ErrKeyReused) {\n\t\tt.Fatalf(\"other fingerprint: %v, want ErrKeyReused\", err)\n\t}\n}"
      },
      "solution": {
        "name": "idempotency.go",
        "code": "// Package idempotency is the reference solution for practice task W6-2: an\n// Idempotency-Key store and an HTTP handler that runs a transfer at most once per key.\npackage idempotency\n\nimport (\n\t\"context\"\n\t\"crypto/sha256\"\n\t\"encoding/json\"\n\t\"errors\"\n\t\"io\"\n\t\"net/http\"\n\t\"sync\"\n)\n\nvar (\n\tErrKeyReused         = errors.New(\"idempotency key reused with a different request\")\n\tErrInProgress        = errors.New(\"a request with this idempotency key is still in progress\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\n// Response is what the handler sent for a key; a repeat gets exactly the same.\ntype Response struct {\n\tStatus int\n\tBody   []byte\n}\n\ntype entry struct {\n\tfingerprint [32]byte\n\tdone        bool\n\tresp        Response\n}\n\n// Store remembers, for each key, the request fingerprint and the response.\ntype Store struct {\n\tmu   sync.Mutex\n\tkeys map[string]*entry\n}\n\nfunc NewStore() *Store { return &Store{keys: make(map[string]*entry)} }\n\n// Do runs fn at most once per key. The key is claimed atomically, under the same lock\n// as the lookup, so two concurrent calls cannot both decide that the key is new.\nfunc (s *Store) Do(key string, fingerprint [32]byte, fn func() (Response, error)) (Response, error) {\n\ts.mu.Lock()\n\tif e, ok := s.keys[key]; ok {\n\t\tdefer s.mu.Unlock()\n\t\tswitch {\n\t\tcase e.fingerprint != fingerprint:\n\t\t\treturn Response{}, ErrKeyReused\n\t\tcase !e.done:\n\t\t\treturn Response{}, ErrInProgress\n\t\tdefault:\n\t\t\treturn e.resp, nil\n\t\t}\n\t}\n\te := &entry{fingerprint: fingerprint}\n\ts.keys[key] = e\n\ts.mu.Unlock()\n\n\tresp, err := fn() // never under the lock: fn is slow, and other keys must not wait for it\n\n\ts.mu.Lock()\n\tdefer s.mu.Unlock()\n\tif err != nil {\n\t\tdelete(s.keys, key) // nothing to replay: release the key so that a retry runs fn again\n\t\treturn Response{}, err\n\t}\n\te.resp, e.done = resp, true\n\treturn resp, nil\n}\n\n// Transferer moves money; it is the ledger of week 5 reduced to one method.\ntype Transferer interface {\n\tTransfer(ctx context.Context, from, to string, amount int64) error\n}\n\ntype transferRequest struct {\n\tFrom   string `json:\"from\"`\n\tTo     string `json:\"to\"`\n\tAmount int64  `json:\"amount\"`\n}\n\nfunc jsonResponse(status int, v any) Response {\n\tbody, _ := json.Marshal(v)\n\treturn Response{Status: status, Body: body}\n}\n\nfunc write(w http.ResponseWriter, r Response) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(r.Status)\n\tw.Write(r.Body)\n}\n\n// Handler serves POST /transfers with an Idempotency-Key header.\nfunc Handler(store *Store, ledger Transferer) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tkey := r.Header.Get(\"Idempotency-Key\")\n\t\tif key == \"\" {\n\t\t\twrite(w, jsonResponse(http.StatusBadRequest, map[string]string{\"error\": \"Idempotency-Key header is required\"}))\n\t\t\treturn\n\t\t}\n\t\tvar req transferRequest\n\t\tdec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))\n\t\tdec.DisallowUnknownFields()\n\t\t// One JSON object and nothing after it: \"{...} garbage\" or a second object is invalid too.\n\t\t// Checked before Do, so a bad request neither runs the transfer nor uses up the key.\n\t\tif err := dec.Decode(&req); err != nil || dec.Decode(&struct{}{}) != io.EOF {\n\t\t\twrite(w, jsonResponse(http.StatusBadRequest, map[string]string{\"error\": \"invalid JSON body\"}))\n\t\t\treturn\n\t\t}\n\t\t// Fingerprint of the decoded request, not of the raw bytes: the same JSON with\n\t\t// other spacing or field order is the same request.\n\t\tcanonical, _ := json.Marshal(req)\n\t\tfingerprint := sha256.Sum256(canonical)\n\n\t\tresp, err := store.Do(key, fingerprint, func() (Response, error) {\n\t\t\terr := ledger.Transfer(r.Context(), req.From, req.To, req.Amount)\n\t\t\tswitch {\n\t\t\tcase err == nil:\n\t\t\t\treturn jsonResponse(http.StatusCreated, map[string]string{\"status\": \"done\"}), nil\n\t\t\tcase errors.Is(err, ErrInsufficientFunds):\n\t\t\t\t// A business outcome: stored, so a repeat gets the same answer.\n\t\t\t\treturn jsonResponse(http.StatusConflict, map[string]string{\"error\": \"insufficient funds\"}), nil\n\t\t\tdefault:\n\t\t\t\treturn Response{}, err // an infrastructure failure: not stored\n\t\t\t}\n\t\t})\n\t\tswitch {\n\t\tcase errors.Is(err, ErrKeyReused):\n\t\t\twrite(w, jsonResponse(http.StatusUnprocessableEntity, map[string]string{\"error\": ErrKeyReused.Error()}))\n\t\tcase errors.Is(err, ErrInProgress):\n\t\t\tw.Header().Set(\"Retry-After\", \"1\")\n\t\t\twrite(w, jsonResponse(http.StatusConflict, map[string]string{\"error\": ErrInProgress.Error()}))\n\t\tcase err != nil:\n\t\t\twrite(w, jsonResponse(http.StatusInternalServerError, map[string]string{\"error\": http.StatusText(http.StatusInternalServerError)}))\n\t\tdefault:\n\t\t\twrite(w, resp)\n\t\t}\n\t})\n}"
      }
    }
  },
  {
    "id": "p-outbox",
    "code": "W6-3",
    "week": 6,
    "title": "Outbox и relay: at-least-once и идемпотентный потребитель",
    "titleEN": "Outbox and relay: at-least-once and an idempotent consumer",
    "goalRU": "Перевод пишет событие в outbox в той же «транзакции», relay публикует события через ненадёжный брокер в порядке ID и ровно с теми гарантиями, которые даёт at-least-once, а потребитель применяет каждое событие один раз.",
    "contractRU": [
      "DB.Transfer под одной блокировкой проверяет счёт и сумму (ErrInvalidAmount, ErrNotFound, ErrInsufficientFunds через %w), переводит деньги и добавляет событие со следующим ID; при ошибке нет ни перевода, ни события.",
      "Relay.Run опрашивает outbox раз в Interval (0 → 10 мс) пачками по Batch (0 → 100), публикует с ключом — ID отправителя — и помечает событие отправленным только после успешного Publish.",
      "При ошибке Publish пачка останавливается, и при следующем опросе первым идёт это же событие: первое появление событий у брокера — в порядке ID.",
      "Relay не держит блокировку базы во время Publish; после отмены ctx Run быстро возвращает ctx.Err() и больше ничего не публикует.",
      "Consumer.Handle применяет событие один раз на ID, в том числе при одновременных дубликатах; Sent возвращает сумму отправленного счётом."
    ],
    "contractEN": [
      "DB.Transfer, under one lock, validates the account and the amount (ErrInvalidAmount, ErrNotFound, ErrInsufficientFunds via %w), moves the money and appends the event with the next ID; on an error there is neither a transfer nor an event.",
      "Relay.Run polls the outbox every Interval (0 → 10 ms) in batches of Batch (0 → 100), publishes with the sender's ID as the key, and marks an event sent only after Publish succeeded.",
      "On a Publish error the batch stops, and the next poll starts with the same event: the first arrival of events at the broker follows ID order.",
      "The relay never holds the database lock during Publish; after ctx is cancelled, Run returns ctx.Err() promptly and publishes nothing more.",
      "Consumer.Handle applies an event once per ID, also for concurrent duplicates; Sent returns the amount an account sent."
    ],
    "planTasks": [
      "w6-wed-1",
      "w6-wed-2",
      "w6-thu-1"
    ],
    "links": [
      "c52",
      "c53",
      "q42",
      "q43",
      "c12",
      "c22"
    ],
    "refs": [
      {
        "t": "microservices.io: Transactional outbox",
        "u": "https://microservices.io/patterns/data/transactional-outbox.html"
      },
      {
        "t": "Apache Kafka: Message Delivery Semantics",
        "u": "https://kafka.apache.org/documentation/#semantics"
      }
    ],
    "hints": [
      "Transfer: всё — проверки, изменение балансов, nextID++ и append в outbox — под одним db.mu. Это и есть «одна транзакция».",
      "Relay: DB.Unsent копирует строки и отпускает блокировку; Publish вызывай уже без неё, а после успеха — DB.MarkSent.",
      "Ошибка Publish → return из пачки, а не continue: иначе следующее событие уйдёт раньше неудачного, и порядок сломается.",
      "Цикл Run: опрос, потом select на ctx.Done() и тикере. Передавай ctx в Publish, чтобы отмена прерывала и зависшую отправку.",
      "Потерянное подтверждение (брокер сохранил, но вернул ошибку) даёт повторную отправку — это нормально для at-least-once; дубликаты отсеивает Consumer по ID."
    ],
    "talkEN": "The transfer and its event are written in one transaction, so there is never a transfer without an event or an event without a transfer. A relay goroutine polls the outbox, publishes unsent events in ID order with the sender's account as the key, and marks an event sent only after the broker acknowledged it. If a send fails, it stops the batch and retries that event first, so the order holds. A lost acknowledgement makes it send the event again, so delivery is at-least-once, and the consumer deduplicates by event ID; in a real service the ID and the effect commit in one transaction. The relay never holds the database during a network call, and it stops when its context is cancelled.",
    "pitfalls": [
      "Пометить отправленным до Publish → при сбое отправки событие теряется навсегда.",
      "continue вместо return после ошибки → событие уходит позже следующих, порядок по счёту ломается.",
      "Publish под блокировкой базы → медленный брокер останавливает все переводы.",
      "Потребитель без проверки ID → дубликат от relay списывает или зачисляет деньги второй раз.",
      "Run без select на ctx.Done() → горутина relay живёт после остановки сервиса."
    ],
    "followUps": [
      "Перенеси outbox в PostgreSQL: SELECT … FOR UPDATE SKIP LOCKED и два relay — что станет с порядком событий одного счёта (c52)?",
      "Добавь dead-letter: после N неудачных попыток событие откладывается, а остальные идут дальше. Чем это плохо для порядка?",
      "Как удалять отправленные строки, чтобы outbox не рос бесконечно?"
    ],
    "fixture": "docs/verification/fixtures/practice/outbox",
    "files": {
      "starter": {
        "name": "outbox.go",
        "code": "// Package outbox: practice task W6-3. Replace each TODO with your solution.\npackage outbox\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"sync\"\n\t\"time\"\n)\n\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrInvalidAmount     = errors.New(\"amount must be positive\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\n// Event is what the relay publishes after a transfer.\ntype Event struct {\n\tID     int64 // outbox row ID: consumers deduplicate by it\n\tFrom   int64\n\tTo     int64\n\tAmount int64\n}\n\ntype row struct {\n\tev   Event\n\tsent bool\n}\n\n// DB is an in-memory database: holding mu is one transaction.\ntype DB struct {\n\tmu       sync.Mutex\n\tbalances map[int64]int64\n\toutbox   []row // in ID order\n\tnextID   int64\n}\n\nfunc NewDB(balances map[int64]int64) *DB {\n\tdb := &DB{balances: make(map[int64]int64, len(balances))}\n\tfor id, b := range balances {\n\t\tdb.balances[id] = b\n\t}\n\treturn db\n}\n\n// Transfer moves the money and appends the event to the outbox in one transaction:\n// either both happen or neither does.\nfunc (db *DB) Transfer(from, to, amount int64) (Event, error) {\n\t// TODO: validate (ErrInvalidAmount, ErrNotFound, ErrInsufficientFunds, wrapped with %w),\n\t// move the money, assign the next ID and append the event, all while holding db.mu.\n\tpanic(\"TODO\")\n}\n\n// Balance returns an account's balance.\nfunc (db *DB) Balance(id int64) int64 {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\treturn db.balances[id]\n}\n\n// Unsent returns up to limit unsent events in ID order, as a copy.\nfunc (db *DB) Unsent(limit int) []Event {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tvar out []Event\n\tfor _, r := range db.outbox {\n\t\tif len(out) == limit {\n\t\t\tbreak\n\t\t}\n\t\tif !r.sent {\n\t\t\tout = append(out, r.ev)\n\t\t}\n\t}\n\treturn out\n}\n\n// MarkSent marks one event as published.\nfunc (db *DB) MarkSent(id int64) {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tfor i := range db.outbox {\n\t\tif db.outbox[i].ev.ID == id {\n\t\t\tdb.outbox[i].sent = true\n\t\t\treturn\n\t\t}\n\t}\n}\n\n// Pending counts events that are not marked sent yet.\nfunc (db *DB) Pending() int {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tn := 0\n\tfor _, r := range db.outbox {\n\t\tif !r.sent {\n\t\t\tn++\n\t\t}\n\t}\n\treturn n\n}\n\n// Publisher sends one event to the broker; key selects the partition.\ntype Publisher interface {\n\tPublish(ctx context.Context, key string, ev Event) error\n}\n\n// Relay publishes outbox events. It runs in one goroutine owned by the caller.\ntype Relay struct {\n\tDB       *DB\n\tPub      Publisher\n\tInterval time.Duration // pause between polls; 0 means 10 ms\n\tBatch    int           // events per poll; 0 means 100\n}\n\n// Run publishes unsent events in ID order until ctx is done, then returns ctx.Err().\n//\n// Contract:\n//   - poll every Interval (0 → 10 ms), up to Batch events per poll (0 → 100);\n//   - publish with the sender's account ID as the key;\n//   - mark an event sent only after Publish succeeded; on an error stop the batch,\n//     so that this event goes first on the next poll (order of first delivery = ID order);\n//   - never hold the database lock while Publish runs;\n//   - return promptly after ctx is cancelled and publish nothing afterwards.\nfunc (r *Relay) Run(ctx context.Context) error {\n\t// TODO\n\tpanic(\"TODO\")\n}\n\n// Consumer applies each event at most once, by event ID.\ntype Consumer struct {\n\tmu   sync.Mutex\n\tseen map[int64]bool\n\tsent map[int64]int64 // money sent per account, according to the applied events\n}\n\nfunc NewConsumer() *Consumer {\n\treturn &Consumer{seen: make(map[int64]bool), sent: make(map[int64]int64)}\n}\n\n// Handle applies ev unless an event with the same ID was applied before.\n// A duplicate is not an error: the consumer just acknowledges it again.\nfunc (c *Consumer) Handle(ev Event) error {\n\t// TODO: apply the event once per ID; it may arrive many times, also concurrently.\n\tpanic(\"TODO\")\n}\n\n// Sent returns how much an account sent according to the applied events.\nfunc (c *Consumer) Sent(account int64) int64 {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\treturn c.sent[account]\n}"
      },
      "tests": {
        "name": "outbox_test.go",
        "code": "package outbox\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"strconv\"\n\t\"sync\"\n\t\"testing\"\n\t\"time\"\n)\n\n// broker is a fake Kafka: every 3rd call fails before storing (the send failed),\n// every 5th call stores the event and still returns an error (the acknowledgement was lost).\ntype broker struct {\n\tmu    sync.Mutex\n\tcalls int\n\tlog   []Event\n\tkeys  []string\n}\n\nvar errBroker = errors.New(\"broker: timeout\")\n\nfunc (b *broker) Publish(ctx context.Context, key string, ev Event) error {\n\tb.mu.Lock()\n\tdefer b.mu.Unlock()\n\tb.calls++\n\tswitch {\n\tcase b.calls%3 == 0:\n\t\treturn errBroker\n\tcase b.calls%5 == 0:\n\t\tb.log = append(b.log, ev)\n\t\tb.keys = append(b.keys, key)\n\t\treturn errBroker\n\t}\n\tb.log = append(b.log, ev)\n\tb.keys = append(b.keys, key)\n\treturn nil\n}\n\nfunc (b *broker) snapshot() ([]Event, []string, int) {\n\tb.mu.Lock()\n\tdefer b.mu.Unlock()\n\treturn append([]Event(nil), b.log...), append([]string(nil), b.keys...), b.calls\n}\n\nfunc waitFor(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(5 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\nfunc startRelay(t *testing.T, r *Relay) (stop func() error) {\n\tt.Helper()\n\tctx, cancel := context.WithCancel(context.Background())\n\tdone := make(chan error, 1)\n\tgo func() { done <- r.Run(ctx) }()\n\treturn func() error {\n\t\tcancel()\n\t\tselect {\n\t\tcase err := <-done:\n\t\t\treturn err\n\t\tcase <-time.After(time.Second):\n\t\t\tt.Fatal(\"Run did not return within 1s after cancel\")\n\t\t\treturn nil\n\t\t}\n\t}\n}\n\nfunc TestTransferWritesTheEventInTheSameTransaction(t *testing.T) {\n\tdb := NewDB(map[int64]int64{1: 100, 2: 0})\n\tev, err := db.Transfer(1, 2, 30)\n\tif err != nil {\n\t\tt.Fatalf(\"Transfer: %v\", err)\n\t}\n\tif ev.ID == 0 || ev.From != 1 || ev.To != 2 || ev.Amount != 30 {\n\t\tt.Fatalf(\"event = %+v\", ev)\n\t}\n\tif db.Pending() != 1 || db.Balance(1) != 70 || db.Balance(2) != 30 {\n\t\tt.Fatalf(\"pending %d, balances %d/%d; want 1 event, 70/30\", db.Pending(), db.Balance(1), db.Balance(2))\n\t}\n\tfor _, bad := range []struct {\n\t\tfrom, to, amount int64\n\t\twant             error\n\t}{{1, 2, 500, ErrInsufficientFunds}, {1, 9, 5, ErrNotFound}, {1, 2, 0, ErrInvalidAmount}} {\n\t\tif _, err := db.Transfer(bad.from, bad.to, bad.amount); !errors.Is(err, bad.want) {\n\t\t\tt.Errorf(\"Transfer(%d, %d, %d) = %v, want %v\", bad.from, bad.to, bad.amount, err, bad.want)\n\t\t}\n\t}\n\tif db.Pending() != 1 || db.Balance(1) != 70 {\n\t\tt.Fatalf(\"a failed transfer wrote an event or moved money: pending %d, balance %d\", db.Pending(), db.Balance(1))\n\t}\n}\n\n// Transfers keep coming while a flaky broker loses sends and acknowledgements.\n// Every event reaches the broker, in ID order of first arrival, keyed by the sender;\n// duplicates happen, and the idempotent consumer applies each event once.\nfunc TestRelayDeliversAtLeastOnceInOrder(t *testing.T) {\n\tdb := NewDB(map[int64]int64{1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 1000})\n\tb := &broker{}\n\tstop := startRelay(t, &Relay{DB: db, Pub: b, Interval: time.Millisecond, Batch: 7})\n\n\tvar mu sync.Mutex\n\tvar events []Event\n\tvar wg sync.WaitGroup\n\tfor g := range 10 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tfor i := range 10 {\n\t\t\t\tfrom := int64(g%5 + 1)\n\t\t\t\tto := int64((g+i)%5 + 1)\n\t\t\t\tif from == to {\n\t\t\t\t\tto = from%5 + 1\n\t\t\t\t}\n\t\t\t\tev, err := db.Transfer(from, to, 1)\n\t\t\t\tif err != nil {\n\t\t\t\t\tt.Errorf(\"Transfer: %v\", err)\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t\tmu.Lock()\n\t\t\t\tevents = append(events, ev)\n\t\t\t\tmu.Unlock()\n\t\t\t}\n\t\t}()\n\t}\n\twg.Wait()\n\twaitFor(t, \"relay publishes every event\", func() bool { return db.Pending() == 0 })\n\tif err := stop(); !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"Run returned %v, want context.Canceled\", err)\n\t}\n\n\tlog, keys, _ := b.snapshot()\n\tfirst := map[int64]bool{}\n\tvar order []int64\n\tfor i, ev := range log {\n\t\tif keys[i] != strconv.FormatInt(ev.From, 10) {\n\t\t\tt.Fatalf(\"event %d published with key %q, want the sender %d\", ev.ID, keys[i], ev.From)\n\t\t}\n\t\tif !first[ev.ID] {\n\t\t\tfirst[ev.ID] = true\n\t\t\torder = append(order, ev.ID)\n\t\t}\n\t}\n\tif len(first) != len(events) {\n\t\tt.Fatalf(\"broker got %d distinct events, want %d: an event was lost (marked sent before Publish succeeded?)\", len(first), len(events))\n\t}\n\tfor i := 1; i < len(order); i++ {\n\t\tif order[i] < order[i-1] {\n\t\t\tt.Fatalf(\"event %d reached the broker before event %d: a failed event must be retried before later ones\", order[i], order[i-1])\n\t\t}\n\t}\n\tif len(log) == len(events) {\n\t\tt.Fatalf(\"no duplicates despite lost acknowledgements: is an event marked sent when Publish returns an error?\")\n\t}\n\n\tc := NewConsumer()\n\tfor _, ev := range log {\n\t\tif err := c.Handle(ev); err != nil {\n\t\t\tt.Fatalf(\"Handle: %v\", err)\n\t\t}\n\t}\n\twant := map[int64]int64{}\n\tfor _, ev := range events {\n\t\twant[ev.From] += ev.Amount\n\t}\n\tfor account, sent := range want {\n\t\tif got := c.Sent(account); got != sent {\n\t\t\tt.Errorf(\"consumer: account %d sent %d, want %d (%d messages for %d events: duplicates applied twice?)\", account, got, sent, len(log), len(events))\n\t\t}\n\t}\n}\n\n// blockingBroker blocks every Publish until the context is cancelled.\ntype blockingBroker struct {\n\tmu      sync.Mutex\n\tcalls   int\n\tstarted chan struct{}\n}\n\nfunc (b *blockingBroker) Publish(ctx context.Context, key string, ev Event) error {\n\tb.mu.Lock()\n\tb.calls++\n\tb.mu.Unlock()\n\tselect {\n\tcase b.started <- struct{}{}:\n\tdefault:\n\t}\n\t<-ctx.Done()\n\treturn ctx.Err()\n}\n\n// The relay must not hold the database while it waits for the broker, and it must stop on cancel.\nfunc TestSlowBrokerDoesNotBlockTransfersAndRunStops(t *testing.T) {\n\tdb := NewDB(map[int64]int64{1: 100, 2: 0})\n\tif _, err := db.Transfer(1, 2, 1); err != nil {\n\t\tt.Fatal(err)\n\t}\n\tb := &blockingBroker{started: make(chan struct{}, 1)}\n\tstop := startRelay(t, &Relay{DB: db, Pub: b, Interval: time.Millisecond})\n\tselect {\n\tcase <-b.started:\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"relay never called Publish\")\n\t}\n\n\tdone := make(chan error, 1)\n\tgo func() { _, err := db.Transfer(1, 2, 1); done <- err }()\n\tselect {\n\tcase err := <-done:\n\t\tif err != nil {\n\t\t\tt.Fatalf(\"Transfer: %v\", err)\n\t\t}\n\tcase <-time.After(time.Second):\n\t\tt.Fatal(\"Transfer waited for the broker: the relay must not hold the database lock during Publish\")\n\t}\n\n\tif err := stop(); !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"Run returned %v, want context.Canceled\", err)\n\t}\n\tb.mu.Lock()\n\tcalls := b.calls\n\tb.mu.Unlock()\n\ttime.Sleep(20 * time.Millisecond)\n\tb.mu.Lock()\n\tdefer b.mu.Unlock()\n\tif b.calls != calls {\n\t\tt.Fatalf(\"Publish called after Run returned: %d → %d calls\", calls, b.calls)\n\t}\n\tif db.Pending() != 2 {\n\t\tt.Fatalf(\"pending = %d, want 2: nothing was acknowledged\", db.Pending())\n\t}\n}\n\nfunc TestConsumerIsSafeForConcurrentDuplicates(t *testing.T) {\n\tc := NewConsumer()\n\tev := Event{ID: 7, From: 1, To: 2, Amount: 10}\n\tvar wg sync.WaitGroup\n\tfor range 50 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tif err := c.Handle(ev); err != nil {\n\t\t\t\tt.Errorf(\"Handle: %v\", err)\n\t\t\t}\n\t\t}()\n\t}\n\twg.Wait()\n\tif got := c.Sent(1); got != 10 {\n\t\tt.Fatalf(\"50 copies of one event: sent = %d, want 10\", got)\n\t}\n}"
      },
      "solution": {
        "name": "outbox.go",
        "code": "// Package outbox is the reference solution for practice task W6-3: a transactional\n// outbox in memory, a relay that publishes at least once, and an idempotent consumer.\npackage outbox\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"fmt\"\n\t\"strconv\"\n\t\"sync\"\n\t\"time\"\n)\n\nvar (\n\tErrNotFound          = errors.New(\"account not found\")\n\tErrInvalidAmount     = errors.New(\"amount must be positive\")\n\tErrInsufficientFunds = errors.New(\"insufficient funds\")\n)\n\n// Event is what the relay publishes after a transfer.\ntype Event struct {\n\tID     int64 // outbox row ID: consumers deduplicate by it\n\tFrom   int64\n\tTo     int64\n\tAmount int64\n}\n\ntype row struct {\n\tev   Event\n\tsent bool\n}\n\n// DB is an in-memory database: holding mu is one transaction.\ntype DB struct {\n\tmu       sync.Mutex\n\tbalances map[int64]int64\n\toutbox   []row // in ID order\n\tnextID   int64\n}\n\nfunc NewDB(balances map[int64]int64) *DB {\n\tdb := &DB{balances: make(map[int64]int64, len(balances))}\n\tfor id, b := range balances {\n\t\tdb.balances[id] = b\n\t}\n\treturn db\n}\n\n// Transfer moves the money and appends the event to the outbox in one transaction:\n// either both happen or neither does.\nfunc (db *DB) Transfer(from, to, amount int64) (Event, error) {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tif amount <= 0 {\n\t\treturn Event{}, ErrInvalidAmount\n\t}\n\tsrc, ok := db.balances[from]\n\tif !ok {\n\t\treturn Event{}, fmt.Errorf(\"transfer from %d: %w\", from, ErrNotFound)\n\t}\n\tif _, ok := db.balances[to]; !ok {\n\t\treturn Event{}, fmt.Errorf(\"transfer to %d: %w\", to, ErrNotFound)\n\t}\n\tif src < amount {\n\t\treturn Event{}, fmt.Errorf(\"transfer %d from %d: %w\", amount, from, ErrInsufficientFunds)\n\t}\n\tdb.balances[from] -= amount\n\tdb.balances[to] += amount\n\tdb.nextID++\n\tev := Event{ID: db.nextID, From: from, To: to, Amount: amount}\n\tdb.outbox = append(db.outbox, row{ev: ev})\n\treturn ev, nil\n}\n\n// Balance returns an account's balance.\nfunc (db *DB) Balance(id int64) int64 {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\treturn db.balances[id]\n}\n\n// Unsent returns up to limit unsent events in ID order, as a copy.\nfunc (db *DB) Unsent(limit int) []Event {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tvar out []Event\n\tfor _, r := range db.outbox {\n\t\tif len(out) == limit {\n\t\t\tbreak\n\t\t}\n\t\tif !r.sent {\n\t\t\tout = append(out, r.ev)\n\t\t}\n\t}\n\treturn out\n}\n\n// MarkSent marks one event as published.\nfunc (db *DB) MarkSent(id int64) {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tfor i := range db.outbox {\n\t\tif db.outbox[i].ev.ID == id {\n\t\t\tdb.outbox[i].sent = true\n\t\t\treturn\n\t\t}\n\t}\n}\n\n// Pending counts events that are not marked sent yet.\nfunc (db *DB) Pending() int {\n\tdb.mu.Lock()\n\tdefer db.mu.Unlock()\n\tn := 0\n\tfor _, r := range db.outbox {\n\t\tif !r.sent {\n\t\t\tn++\n\t\t}\n\t}\n\treturn n\n}\n\n// Publisher sends one event to the broker; key selects the partition.\ntype Publisher interface {\n\tPublish(ctx context.Context, key string, ev Event) error\n}\n\n// Relay publishes outbox events. It runs in one goroutine owned by the caller.\ntype Relay struct {\n\tDB       *DB\n\tPub      Publisher\n\tInterval time.Duration // pause between polls; 0 means 10 ms\n\tBatch    int           // events per poll; 0 means 100\n}\n\n// Run publishes unsent events in ID order until ctx is done, then returns ctx.Err().\n// An event is marked sent only after Publish succeeded, so delivery is at-least-once:\n// a lost acknowledgement makes the relay send the event again.\nfunc (r *Relay) Run(ctx context.Context) error {\n\tinterval, batch := r.Interval, r.Batch\n\tif interval <= 0 {\n\t\tinterval = 10 * time.Millisecond\n\t}\n\tif batch <= 0 {\n\t\tbatch = 100\n\t}\n\ttick := time.NewTicker(interval)\n\tdefer tick.Stop()\n\tfor {\n\t\tr.publishBatch(ctx, batch)\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase <-tick.C:\n\t\t}\n\t}\n}\n\nfunc (r *Relay) publishBatch(ctx context.Context, batch int) {\n\t// Unsent copies the rows and releases the lock: Publish is a network call, and\n\t// transfers must not wait for the broker.\n\tfor _, ev := range r.DB.Unsent(batch) {\n\t\tif ctx.Err() != nil {\n\t\t\treturn\n\t\t}\n\t\t// The sender's account is the key: with a key-hashing partitioner its events go to one partition.\n\t\tif err := r.Pub.Publish(ctx, strconv.FormatInt(ev.From, 10), ev); err != nil {\n\t\t\treturn // stop the batch to keep the order; this event goes first on the next poll\n\t\t}\n\t\tr.DB.MarkSent(ev.ID)\n\t}\n}\n\n// Consumer applies each event at most once, by event ID.\ntype Consumer struct {\n\tmu   sync.Mutex\n\tseen map[int64]bool\n\tsent map[int64]int64 // money sent per account, according to the applied events\n}\n\nfunc NewConsumer() *Consumer {\n\treturn &Consumer{seen: make(map[int64]bool), sent: make(map[int64]int64)}\n}\n\n// Handle applies ev unless an event with the same ID was applied before.\n// A duplicate is not an error: the consumer just acknowledges it again.\nfunc (c *Consumer) Handle(ev Event) error {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tif c.seen[ev.ID] {\n\t\treturn nil\n\t}\n\t// In a real service the ID and the effect commit in one database transaction.\n\tc.seen[ev.ID] = true\n\tc.sent[ev.From] += ev.Amount\n\treturn nil\n}\n\n// Sent returns how much an account sent according to the applied events.\nfunc (c *Consumer) Sent(account int64) int64 {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\treturn c.sent[account]\n}"
      }
    }
  }
];
