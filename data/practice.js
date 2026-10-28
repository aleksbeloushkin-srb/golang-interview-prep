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
    "talkEN": "I start a fixed number of workers, so concurrency is bounded by construction. Each worker selects on the jobs channel and ctx.Done, and it sends its result in a select with ctx.Done as well, so it can never block forever. Only the pool sends on the results channel, so only the pool closes it: one extra goroutine waits on a WaitGroup for all workers and then closes results. The caller owns the jobs channel and closes it. Backpressure comes for free: with an unbuffered results channel, a slow consumer simply makes the workers wait.",
    "pitfalls": [
      "close(results) в каждом воркере → panic: close of closed channel.",
      "wg.Add внутри горутины → Wait может вернуться раньше, чем воркер начал работу.",
      "Отправка результата без select → после отмены воркер навсегда заблокирован: утечка горутины.",
      "Горутина на каждую задачу вместо N воркеров → параллелизм не ограничен.",
      "Закрыть jobs внутри пула → канал закрывает не владелец; panic у отправителя."
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
        "code": "package workerpool\n\nimport (\n\t\"context\"\n\t\"runtime\"\n\t\"slices\"\n\t\"sync/atomic\"\n\t\"testing\"\n\t\"time\"\n)\n\n// feed sends 0..n-1 and closes jobs; it stops early when ctx is done.\nfunc feed(ctx context.Context, n int) <-chan int {\n\tjobs := make(chan int)\n\tgo func() {\n\t\tdefer close(jobs)\n\t\tfor i := range n {\n\t\t\tselect {\n\t\t\tcase jobs <- i:\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn jobs\n}\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// collect reads results until the channel is closed; a pool that never closes it fails instead of hanging.\nfunc collect[R any](t *testing.T, results <-chan R) []R {\n\tt.Helper()\n\tvar got []R\n\ttimeout := time.After(5 * time.Second)\n\tfor {\n\t\tselect {\n\t\tcase r, ok := <-results:\n\t\t\tif !ok {\n\t\t\t\treturn got\n\t\t\t}\n\t\t\tgot = append(got, r)\n\t\tcase <-timeout:\n\t\t\tt.Fatalf(\"results channel is not closed; received %d values\", len(got))\n\t\t}\n\t}\n}\n\nfunc TestAllJobsProcessed(t *testing.T) {\n\tctx := context.Background()\n\tgot := collect(t, Process(ctx, 4, feed(ctx, 100), func(_ context.Context, n int) int { return n * 2 }))\n\tslices.Sort(got)\n\tif len(got) != 100 {\n\t\tt.Fatalf(\"got %d results, want 100\", len(got))\n\t}\n\tfor i, v := range got {\n\t\tif v != i*2 {\n\t\t\tt.Fatalf(\"result %d = %d, want %d\", i, v, i*2)\n\t\t}\n\t}\n}\n\nfunc TestNoJobs(t *testing.T) {\n\tctx := context.Background()\n\tif got := collect(t, Process(ctx, 3, feed(ctx, 0), func(_ context.Context, n int) int { return n })); len(got) != 0 {\n\t\tt.Fatalf(\"got %v, want no results\", got)\n\t}\n}\n\nfunc TestWorkersBelowOneMeansOne(t *testing.T) {\n\tctx := context.Background()\n\tif got := collect(t, Process(ctx, 0, feed(ctx, 3), func(_ context.Context, n int) int { return n })); len(got) != 3 {\n\t\tt.Fatalf(\"got %d results, want 3\", len(got))\n\t}\n}\n\nfunc TestAtMostNConcurrentCalls(t *testing.T) {\n\tconst workers = 3\n\tctx, cancel := context.WithCancel(context.Background())\n\tdefer cancel()\n\tvar active, peak atomic.Int32\n\trelease := make(chan struct{})\n\tfn := func(_ context.Context, n int) int {\n\t\tcur := active.Add(1)\n\t\tfor p := peak.Load(); cur > p && !peak.CompareAndSwap(p, cur); p = peak.Load() {\n\t\t}\n\t\t<-release\n\t\tactive.Add(-1)\n\t\treturn n\n\t}\n\tresults := Process(ctx, workers, feed(ctx, 20), fn)\n\twaitUntil(t, \"all workers busy\", func() bool { return active.Load() == workers })\n\t// An observation window: a pool without a limit would start more calls here.\n\ttime.Sleep(50 * time.Millisecond)\n\tclose(release)\n\tif got := collect(t, results); len(got) != 20 {\n\t\tt.Fatalf(\"got %d results, want 20\", len(got))\n\t}\n\tif p := peak.Load(); p > workers {\n\t\tt.Fatalf(\"peak concurrency %d, want at most %d\", p, workers)\n\t}\n}\n\nfunc TestSlowConsumerBoundsWork(t *testing.T) {\n\tconst workers = 4\n\tctx, cancel := context.WithCancel(context.Background())\n\tdefer cancel()\n\tvar calls atomic.Int32\n\tresults := Process(ctx, workers, feed(ctx, 1000), func(_ context.Context, n int) int {\n\t\tcalls.Add(1)\n\t\treturn n\n\t})\n\twaitUntil(t, \"workers started\", func() bool { return calls.Load() >= workers })\n\ttime.Sleep(50 * time.Millisecond) // nobody reads results\n\t// Each blocked worker holds one finished result, plus whatever the buffer holds.\n\tif c, limit := int(calls.Load()), workers+cap(results); c > limit {\n\t\tt.Fatalf(\"%d jobs processed without a reader, want at most %d\", c, limit)\n\t}\n\tcancel()\n\tcollect(t, results)\n}\n\nfunc TestCancelStopsEverything(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tresults := Process(ctx, 4, feed(ctx, 1_000_000), func(_ context.Context, n int) int { return n })\n\tfor range 5 {\n\t\t<-results\n\t}\n\tcancel()\n\tcollect(t, results)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\n// The caller may cancel without ever closing jobs: workers must still stop.\nfunc TestCancelWithOpenJobs(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tjobs := make(chan int) // never closed, nobody sends\n\tresults := Process(ctx, 2, jobs, func(_ context.Context, n int) int { return n })\n\tcancel()\n\tcollect(t, results)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}"
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
      "Каждая стадия запускает одну горутину и сама закрывает свой выходной канал.",
      "Generate(ctx, nums...) отправляет числа по порядку и закрывает выход после последнего или при отмене.",
      "Square(ctx, in) отправляет n*n и закрывает выход, когда in закрыт или ctx отменён — даже если in никто не закроет.",
      "Sum(ctx, in) возвращает сумму, когда in закрыт; при отмене — 0 и ctx.Err().",
      "Потребитель, который уходит раньше, сообщает об этом отменой ctx."
    ],
    "contractEN": [
      "Each stage starts one goroutine and closes its own output channel.",
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
      "for n := range in удобен, но не замечает отмену, пока ждёт следующего значения."
    ],
    "talkEN": "Each stage owns its output channel: it starts one goroutine, defers closing the output, and returns the channel. Every send and every receive sits in a select with ctx.Done, so when the consumer cancels, every stage returns and closes its output, and nothing stays blocked. Closing flows downstream; cancellation reaches all stages through the shared context. Sum tells a finished stream, which is a closed channel, from an aborted one, which is ctx.Err.",
    "pitfalls": [
      "Стадия без отмены: потребитель ушёл — генератор навсегда заблокирован на отправке.",
      "Потребитель закрывает входной канал стадии → panic у отправителя: закрывает только отправитель.",
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
        "code": "package pipeline\n\nimport (\n\t\"context\"\n\t\"errors\"\n\t\"runtime\"\n\t\"testing\"\n\t\"time\"\n)\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// sumWithin fails instead of hanging when a stage never closes its output.\nfunc sumWithin(t *testing.T, ctx context.Context, in <-chan int) (int, error) {\n\tt.Helper()\n\ttype result struct {\n\t\ttotal int\n\t\terr   error\n\t}\n\tdone := make(chan result, 1)\n\tgo func() {\n\t\ttotal, err := Sum(ctx, in)\n\t\tdone <- result{total, err}\n\t}()\n\tselect {\n\tcase r := <-done:\n\t\treturn r.total, r.err\n\tcase <-time.After(5 * time.Second):\n\t\tt.Fatal(\"Sum did not return: some stage never closed its output\")\n\t\treturn 0, nil\n\t}\n}\n\nfunc TestPipelineSum(t *testing.T) {\n\tctx := context.Background()\n\ttotal, err := sumWithin(t, ctx, Square(ctx, Generate(ctx, 1, 2, 3, 4)))\n\tif err != nil || total != 30 {\n\t\tt.Fatalf(\"got %d, %v; want 30, nil\", total, err)\n\t}\n}\n\nfunc TestEmptyInput(t *testing.T) {\n\tctx := context.Background()\n\ttotal, err := sumWithin(t, ctx, Square(ctx, Generate(ctx)))\n\tif err != nil || total != 0 {\n\t\tt.Fatalf(\"got %d, %v; want 0, nil\", total, err)\n\t}\n}\n\nfunc TestConsumerLeavesEarly(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tnums := make([]int, 10_000)\n\tfor i := range nums {\n\t\tnums[i] = i\n\t}\n\tsquares := Square(ctx, Generate(ctx, nums...))\n\tfor range 3 {\n\t\t<-squares\n\t}\n\tcancel() // the consumer stops reading and says so\n\twaitUntil(t, \"all stages to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\nfunc TestSquareStopsWithForeignInput(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\tin := make(chan int) // not ours: nobody will ever close it\n\tout := Square(ctx, in)\n\tcancel()\n\tselect {\n\tcase _, ok := <-out:\n\t\tif ok {\n\t\t\tt.Fatal(\"unexpected value after cancel\")\n\t\t}\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"Square did not close its output after cancel\")\n\t}\n\twaitUntil(t, \"Square to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}\n\nfunc TestSumCancelled(t *testing.T) {\n\tctx, cancel := context.WithCancel(context.Background())\n\tcancel()\n\tin := make(chan int) // never closed\n\tif _, err := sumWithin(t, ctx, in); !errors.Is(err, context.Canceled) {\n\t\tt.Fatalf(\"got %v, want context.Canceled\", err)\n\t}\n}"
      },
      "solution": {
        "name": "pipeline.go",
        "code": "// Package pipeline is the reference solution for practice task W3-2.\npackage pipeline\n\nimport \"context\"\n\n// Generate sends nums one by one on the returned channel.\n// It closes the channel after the last value or as soon as ctx is done.\nfunc Generate(ctx context.Context, nums ...int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor _, n := range nums {\n\t\t\tselect {\n\t\t\tcase out <- n:\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}\n\n// Square sends n*n for every n received from in.\n// It closes its output when in is closed or ctx is done, even if in is never closed.\nfunc Square(ctx context.Context, in <-chan int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor {\n\t\t\tselect {\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\tcase n, ok := <-in:\n\t\t\t\tif !ok {\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t\tselect {\n\t\t\t\tcase out <- n * n:\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}\n\n// Sum adds up every value from in until in is closed.\n// If ctx is done first, it returns 0 and ctx.Err().\nfunc Sum(ctx context.Context, in <-chan int) (int, error) {\n\ttotal := 0\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn 0, ctx.Err()\n\t\tcase n, ok := <-in:\n\t\t\tif !ok {\n\t\t\t\treturn total, nil\n\t\t\t}\n\t\t\ttotal += n\n\t\t}\n\t}\n}"
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
      "Почему nil-вход опасен? Чтение из nil-канала блокирует навсегда, и WaitGroup никогда не дождётся этой горутины."
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
        "code": "package fanin\n\nimport (\n\t\"context\"\n\t\"runtime\"\n\t\"slices\"\n\t\"testing\"\n\t\"time\"\n)\n\nfunc source(values ...int) <-chan int {\n\tch := make(chan int)\n\tgo func() {\n\t\tdefer close(ch)\n\t\tfor _, v := range values {\n\t\t\tch <- v\n\t\t}\n\t}()\n\treturn ch\n}\n\nfunc collect[T any](t *testing.T, out <-chan T) []T {\n\tt.Helper()\n\tvar got []T\n\ttimeout := time.After(5 * time.Second)\n\tfor {\n\t\tselect {\n\t\tcase v, ok := <-out:\n\t\t\tif !ok {\n\t\t\t\treturn got\n\t\t\t}\n\t\t\tgot = append(got, v)\n\t\tcase <-timeout:\n\t\t\tt.Fatalf(\"output is not closed; received %d values\", len(got))\n\t\t}\n\t}\n}\n\nfunc waitUntil(t *testing.T, what string, cond func() bool) {\n\tt.Helper()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor !cond() {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatalf(\"timed out waiting for: %s\", what)\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\nfunc TestMergeAll(t *testing.T) {\n\tctx := context.Background()\n\tgot := collect(t, Merge(ctx, source(1, 2, 3), source(10, 20), source(100)))\n\tslices.Sort(got)\n\tif want := []int{1, 2, 3, 10, 20, 100}; !slices.Equal(got, want) {\n\t\tt.Fatalf(\"got %v, want %v\", got, want)\n\t}\n}\n\nfunc TestNoInputs(t *testing.T) {\n\tif got := collect(t, Merge[int](context.Background())); len(got) != 0 {\n\t\tt.Fatalf(\"got %v, want nothing\", got)\n\t}\n}\n\nfunc TestNilInputIgnored(t *testing.T) {\n\tvar never chan int\n\tgot := collect(t, Merge(context.Background(), never, source(7)))\n\tif !slices.Equal(got, []int{7}) {\n\t\tt.Fatalf(\"got %v, want [7]\", got)\n\t}\n}\n\nfunc TestOutputClosedOnlyAfterAllInputs(t *testing.T) {\n\tctx := context.Background()\n\ta := make(chan int)\n\tb := make(chan int)\n\tout := Merge(ctx, a, b)\n\tclose(a)\n\t// b is still open, so out must still deliver values from b.\n\tgo func() { b <- 42 }()\n\tselect {\n\tcase v, ok := <-out:\n\t\tif !ok || v != 42 {\n\t\t\tt.Fatalf(\"got %d, %v; want 42, true: output closed too early?\", v, ok)\n\t\t}\n\tcase <-time.After(2 * time.Second):\n\t\tt.Fatal(\"value from the open input did not arrive\")\n\t}\n\tclose(b)\n\tif got := collect(t, out); len(got) != 0 {\n\t\tt.Fatalf(\"unexpected values %v\", got)\n\t}\n}\n\nfunc TestCancelWithOpenInputs(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tctx, cancel := context.WithCancel(context.Background())\n\ta := make(chan int) // never closed\n\tb := make(chan int) // never closed\n\tout := Merge(ctx, a, b)\n\tcancel()\n\tcollect(t, out)\n\twaitUntil(t, \"goroutines to exit\", func() bool { return runtime.NumGoroutine() <= before })\n}"
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
      "Добавь Add(n) и Reset() — где atomic перестаёт хватать?",
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
        "code": "package counter\n\nimport (\n\t\"runtime\"\n\t\"sync\"\n\t\"testing\"\n\t\"time\"\n)\n\nvar impls = []struct {\n\tname string\n\tnew  func() Counter\n}{\n\t{\"mutex\", NewMutexCounter},\n\t{\"atomic\", NewAtomicCounter},\n\t{\"channel\", NewChanCounter},\n}\n\nfunc TestConcurrentInc(t *testing.T) {\n\tconst goroutines, perG = 50, 1000\n\tfor _, impl := range impls {\n\t\tt.Run(impl.name, func(t *testing.T) {\n\t\t\tc := impl.new()\n\t\t\tdefer c.Close()\n\t\t\tvar wg sync.WaitGroup\n\t\t\twg.Add(goroutines)\n\t\t\tfor range goroutines {\n\t\t\t\tgo func() {\n\t\t\t\t\tdefer wg.Done()\n\t\t\t\t\tfor range perG {\n\t\t\t\t\t\tc.Inc()\n\t\t\t\t\t}\n\t\t\t\t}()\n\t\t\t}\n\t\t\twg.Wait()\n\t\t\tif got := c.Value(); got != goroutines*perG {\n\t\t\t\tt.Fatalf(\"Value() = %d, want %d\", got, goroutines*perG)\n\t\t\t}\n\t\t})\n\t}\n}\n\nfunc TestCloseStopsOwnerGoroutine(t *testing.T) {\n\tbefore := runtime.NumGoroutine()\n\tc := NewChanCounter()\n\tc.Inc()\n\tif got := c.Value(); got != 1 {\n\t\tt.Fatalf(\"Value() = %d, want 1\", got)\n\t}\n\tc.Close()\n\tdeadline := time.Now().Add(2 * time.Second)\n\tfor runtime.NumGoroutine() > before {\n\t\tif time.Now().After(deadline) {\n\t\t\tt.Fatal(\"owner goroutine is still running after Close\")\n\t\t}\n\t\ttime.Sleep(time.Millisecond)\n\t}\n}\n\n// Compare on your machine, with different -cpu values. The numbers depend on\n// the CPU count and contention; they do not prove that one way is always faster.\nfunc BenchmarkInc(b *testing.B) {\n\tfor _, impl := range impls {\n\t\tb.Run(impl.name, func(b *testing.B) {\n\t\t\tc := impl.new()\n\t\t\tdefer c.Close()\n\t\t\tb.RunParallel(func(pb *testing.PB) {\n\t\t\t\tfor pb.Next() {\n\t\t\t\t\tc.Inc()\n\t\t\t\t}\n\t\t\t})\n\t\t})\n\t}\n}"
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
    "talkEN": "The cache keeps a map and a byte total that must always agree, so both change under the same lock, and readers take a read lock. The subtle part is aliasing: an item holds slices, and a slice shares its backing array. If Get returned the stored item, a caller could modify cache memory without any lock, which is a data race and breaks the invariant. So I copy on the way in and on the way out. A read-write mutex helps only when reads dominate; under heavy writes a plain mutex can be just as good.",
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
        "code": "package safecache\n\nimport (\n\t\"fmt\"\n\t\"math/rand/v2\"\n\t\"sync\"\n\t\"testing\"\n)\n\nfunc TestGetReturnsCopy(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"xyz\"), Tags: []string{\"t1\"}})\n\tit, _ := c.Get(\"a\")\n\tit.Value[0] = '!'\n\tit.Tags[0] = \"changed\"\n\tagain, _ := c.Get(\"a\")\n\tif string(again.Value) != \"xyz\" || again.Tags[0] != \"t1\" {\n\t\tt.Fatalf(\"cache changed through a returned item: %q %v\", again.Value, again.Tags)\n\t}\n}\n\nfunc TestSetCopiesInput(t *testing.T) {\n\tc := New()\n\tv := []byte(\"abc\")\n\ttags := []string{\"t1\"}\n\tc.Set(\"a\", Item{Value: v, Tags: tags})\n\tv[0] = '!'\n\ttags[0] = \"changed\"\n\tit, _ := c.Get(\"a\")\n\tif string(it.Value) != \"abc\" || it.Tags[0] != \"t1\" {\n\t\tt.Fatalf(\"cache changed through the caller's slices: %q %v\", it.Value, it.Tags)\n\t}\n}\n\nfunc TestSnapshotIsIndependent(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"one\")})\n\tsnap := c.Snapshot()\n\tsnap[\"a\"].Value[0] = '!'\n\tdelete(snap, \"a\")\n\tif it, ok := c.Get(\"a\"); !ok || string(it.Value) != \"one\" {\n\t\tt.Fatalf(\"cache changed through a snapshot: %q %v\", it.Value, ok)\n\t}\n}\n\nfunc TestDeleteMissing(t *testing.T) {\n\tc := New()\n\tc.Set(\"a\", Item{Value: []byte(\"1234\")})\n\tif c.Delete(\"missing\") {\n\t\tt.Fatal(\"Delete of a missing key reported true\")\n\t}\n\tif c.Bytes() != 4 || c.Len() != 1 {\n\t\tt.Fatalf(\"Bytes=%d Len=%d, want 4 and 1\", c.Bytes(), c.Len())\n\t}\n}\n\nfunc TestBytesInvariantUnderConcurrency(t *testing.T) {\n\tc := New()\n\tvar wg sync.WaitGroup\n\tfor g := range 8 {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tr := rand.New(rand.NewPCG(uint64(g), 1))\n\t\t\tfor range 2000 {\n\t\t\t\tkey := fmt.Sprint(r.IntN(50))\n\t\t\t\tswitch r.IntN(3) {\n\t\t\t\tcase 0:\n\t\t\t\t\tc.Set(key, Item{Value: make([]byte, r.IntN(100))})\n\t\t\t\tcase 1:\n\t\t\t\t\tc.Delete(key)\n\t\t\t\tdefault:\n\t\t\t\t\tif it, ok := c.Get(key); ok && len(it.Value) > 0 {\n\t\t\t\t\t\tit.Value[0] = 1 // must not race with the cache\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}()\n\t}\n\twg.Wait()\n\tsum := 0\n\tfor _, it := range c.Snapshot() {\n\t\tsum += len(it.Value)\n\t}\n\tif got := c.Bytes(); got != sum {\n\t\tt.Fatalf(\"Bytes() = %d, but values add up to %d\", got, sum)\n\t}\n}"
      },
      "solution": {
        "name": "safecache.go",
        "code": "// Package safecache is the reference solution for practice task W3-5.\npackage safecache\n\nimport (\n\t\"maps\"\n\t\"slices\"\n\t\"sync\"\n)\n\n// Item is a cached value. Its slices are mutable, so the cache copies them\n// on the way in and on the way out: callers never share memory with the cache.\ntype Item struct {\n\tValue []byte\n\tTags  []string\n}\n\nfunc (it Item) clone() Item {\n\treturn Item{Value: slices.Clone(it.Value), Tags: slices.Clone(it.Tags)}\n}\n\n// Cache is safe for concurrent use.\n//\n// Invariant, kept under one lock: bytes == sum of len(Value) over all items.\ntype Cache struct {\n\tmu    sync.RWMutex\n\titems map[string]Item\n\tbytes int\n}\n\nfunc New() *Cache {\n\treturn &Cache{items: make(map[string]Item)}\n}\n\nfunc (c *Cache) Set(key string, it Item) {\n\tit = it.clone() // copy before taking the lock: the caller may change its slices later\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tif old, ok := c.items[key]; ok {\n\t\tc.bytes -= len(old.Value)\n\t}\n\tc.items[key] = it\n\tc.bytes += len(it.Value)\n}\n\nfunc (c *Cache) Get(key string) (Item, bool) {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\tit, ok := c.items[key]\n\tif !ok {\n\t\treturn Item{}, false\n\t}\n\treturn it.clone(), true\n}\n\nfunc (c *Cache) Delete(key string) bool {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\told, ok := c.items[key]\n\tif !ok {\n\t\treturn false\n\t}\n\tdelete(c.items, key)\n\tc.bytes -= len(old.Value)\n\treturn true\n}\n\nfunc (c *Cache) Len() int {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\treturn len(c.items)\n}\n\n// Bytes returns the total length of all values.\nfunc (c *Cache) Bytes() int {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\treturn c.bytes\n}\n\n// Snapshot returns a deep copy of all items.\nfunc (c *Cache) Snapshot() map[string]Item {\n\tc.mu.RLock()\n\tdefer c.mu.RUnlock()\n\tout := make(map[string]Item, len(c.items))\n\tfor k, it := range maps.All(c.items) {\n\t\tout[k] = it.clone()\n\t}\n\treturn out\n}"
      }
    }
  }
];
