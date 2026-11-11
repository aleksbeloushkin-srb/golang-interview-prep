// Справочные страницы практикума (#/practice/<guide>[/<section>]) и ссылки на них из плана (links: "g-…").
// Команды и выводы проверены на Go 1.24.7 и 1.27.3 (linux/amd64; arm64 — кросс-компиляцией);
// код тренировки — docs/verification/fixtures/go-prep/.
const GUIDES = {
  "go-prep": {
    title: "Свой репозиторий go-prep: раскладка, команды, CI",
    intro: [
      "Весь код практикума живёт в одном модуле `go-prep`: каждая задача — свой пакет `weekN/<задача>`, рядом — учебные пакеты недель 1 и 3. Так неделя прогоняется одной командой (`go test -race ./week4/...`), свои тесты лежат рядом с тестами практикума, а CI проверяет всё на каждый push.",
      "Проект недель 6–9 (ledger) — отдельный репозиторий: его раскладку задаёт неделя 6. Сайт твой репозиторий не видит: «Проверить на сервере» проверяет код, вставленный на странице задачи."
    ],
    sections: [
      {
        id: "setup",
        title: "1. Завести (неделя 1, понедельник)",
        paragraphs: [
          "Нужен Go 1.27: `brew install go` или установщик с https://go.dev/dl/. Проверка — `go version`, ожидается `go version go1.27.x darwin/arm64` (на Intel — `darwin/amd64`). Редактор — с gopls: VS Code с расширением Go или GoLand.",
          "Путь модуля — будущий адрес на GitHub. `go mod init` записывает в go.mod версию твоего Go (например, `go 1.27.3`): это минимальная версия для сборки, и от неё зависят возможности языка. Эталоны практикума проверены на Go 1.24.7 и 1.27.3. Где лежат сам Go, кэши и установленные команды — раздел 7.",
          "Команды ниже — по порядку. Замени `<ник>` на свой ник на GitHub: в zsh угловые скобки без замены дают «no such file or directory». Между `mkdir -p week1/hello week1/calc` и `go vet` положи файлы ниже: main.go — в week1/hello, calc.go и calc_test.go — в week1/calc."
        ],
        code: {
          label: "Команды: завести go-prep",
          text: "mkdir go-prep && cd go-prep\ngit init\ngo mod init github.com/<ник>/go-prep\nmkdir -p week1/hello week1/calc\nprintf 'bin/\\n' > .gitignore\ngo vet ./...\ngo test ./...\ngit add . && git commit -m \"go-prep: week1 hello and calc\""
        },
        files: [
          { name: "main.go", code: "// Command hello — первая программа модуля go-prep.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hello, go-prep\")\n}\n" },
          { name: "calc.go", code: "// Package calc — первый пакет с тестом в go-prep.\npackage calc\n\n// Add возвращает сумму a и b.\nfunc Add(a, b int) int {\n\treturn a + b\n}\n" },
          { name: "calc_test.go", code: "package calc\n\nimport \"testing\"\n\nfunc TestAdd(t *testing.T) {\n\tif got := Add(2, 3); got != 5 {\n\t\tt.Fatalf(\"Add(2, 3) = %d, want 5\", got)\n\t}\n}\n" }
        ]
      },
      {
        id: "layout",
        title: "2. Раскладка: по пакету на задачу",
        paragraphs: [
          "Задачу практикума кладёшь в её папку и запускаешь там же; файлы заготовки и тестов — со страницы задачи, имя пакета в них уже совпадает с папкой. Зависимость (`go get`) добавляется в общий go.mod один раз.",
          "Свои тесты — рядом с тестами практикума, в том же пакете (неделя 3: «Покрыть тестами W1-2 и W3-2»).",
          "В командах ниже: перед первым `go test` положи в папку money.go и money_test.go со страницы задачи. `./week1/...` — вся неделя, `./...` — весь go-prep, то же делает CI."
        ],
        tree: true,
        code: {
          label: "Команды: задача практикума в go-prep",
          text: "cd go-prep\nmkdir -p week1/money && cd week1/money\ngo test -race -count=1 .\ncd ../..\ngo test -race ./week1/...\ngo test -race ./..."
        }
      },
      {
        id: "drill1",
        title: "3. Тренировка недели 1: запуск, сборка, тесты",
        paragraphs: ["Из корня go-prep. Сначала скажи, что увидишь, потом запусти; ответ на вопрос — после своей попытки."],
        steps: [
          { cmd: "go run ./week1/hello", expect: "hello, go-prep", q: "Где бинарник после go run?", a: "Не рядом с кодом: go run собирает во временный каталог и запускает, а с Go 1.24 ещё и хранит исполняемый файл в кэше сборки, чтобы повторный запуск был быстрее. Свой файл — go build -o." },
          { cmd: "go build -o bin/hello ./week1/hello && ./bin/hello", expect: "hello, go-prep; файл bin/hello остаётся (bin/ — в .gitignore).", q: "Что даст go build ./week1/calc — пакет без main?", a: "Скомпилирует пакет и выбросит результат: это только проверка, что пакет собирается. Файла не будет." },
          { cmd: "go vet ./...", expect: "Ничего не печатает, если всё чисто.", q: "Что ловит vet, чего не ловит компилятор?", a: "Код, который компилируется, но почти наверняка ошибочен: неверные глаголы Printf (printf), мьютекс, скопированный по значению (copylocks), невызванный cancel от context.WithCancel (lostcancel), недостижимый код (unreachable)." },
          { cmd: "go test ./...", expect: "ok  github.com/<ник>/go-prep/week1/calc  0.002s (время — твоё)\n?   github.com/<ник>/go-prep/week1/hello  [no test files]", q: "Запусти ещё раз: откуда (cached) и как его обойти?", a: "Ни код, ни тесты не менялись, поэтому go test показывает прошлый результат из кэша. Заново — go test -count=1." },
          { cmd: "go test -v -run TestAdd ./week1/calc", expect: "=== RUN   TestAdd\n--- PASS: TestAdd (0.00s)", q: "-run принимает имя или шаблон?", a: "Регулярное выражение по имени теста; подтест выбирается через /: -run 'TestAdd/negative'." },
          { cmd: "go test -race -count=1 ./...", expect: "Те же ok, без WARNING: DATA RACE.", q: "Почему -race — в тестах и CI, а не в проде?", a: "Детектор заметно замедляет программу и увеличивает память, и находит гонки только на путях, которые реально выполнились. Поэтому его гоняют на тестах конкурентного кода и в CI." },
          { cmd: "go test -cover ./week1/calc", expect: "ok  …/week1/calc  0.003s  coverage: 100.0% of statements (время — твоё)", q: "Что значит 100%?", a: "Каждый оператор выполнился хотя бы раз. Это не значит, что проверены граничные случаи: покрытие — не качество тестов." },
          { cmd: "go list ./...", expect: "github.com/<ник>/go-prep/week1/calc\ngithub.com/<ник>/go-prep/week1/hello", q: "Что значит ./...?", a: "Текущий каталог и все пакеты под ним. Пропускаются testdata, vendor, каталоги на _ и . и вложенные модули (свой go.mod)." }
        ],
        check: "Готово, когда без подсказки: чем go run отличается от go build; что такое ./...; откуда (cached) и зачем -count=1; чем пакет отличается от модуля (c43)."
      },
      {
        id: "ci",
        title: "4. CI на GitHub Actions (неделя 3, четверг)",
        paragraphs: [
          "Положи файл в `.github/workflows/ci.yml` и запушь на GitHub: на каждый push и pull request проверка запускается на той версии Go, что записана в go.mod. Результат — зелёная или красная отметка у коммита.",
          "Версии действий — как в их README на ноябрь 2026. Если линтер пишет, что собран более старой версией Go, чем в go.mod, закрепи более новую `version` или временно убери шаг линтера."
        ],
        files: [
          { name: "ci.yml", code: "name: ci\n\non:\n  push:\n  pull_request:\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-go@v6\n        with:\n          go-version-file: go.mod\n      - run: go vet ./...\n      - run: go test -race -count=1 ./...\n      - uses: golangci/golangci-lint-action@v9\n        with:\n          version: latest\n" }
        ],
        check: "Готово, когда: в go-prep на GitHub у последнего коммита зелёная отметка; намеренно сломанный тест делает её красной."
      },
      {
        id: "asm",
        title: "5. Тренировка недели 3: сборка с ассемблером и без",
        paragraphs: [
          "Пакет `week3/asm` и программа `week3/cmd/sumdemo` — файлы ниже. Ассемблер показан для amd64 и arm64 (Mac на Apple Silicon); сборка под чужую архитектуру работает с любого компьютера: `GOARCH=arm64` или `GOARCH=amd64` перед командой.",
          "Флаги компилятора идут через `-gcflags`: без `all=` — только пакетам из командной строки, с `all=` — всем, включая зависимости."
        ],
        files: [
          { name: "asm.go", code: "// Package asm — функции, на которых смотрят ассемблер, встраивание и escape analysis.\npackage asm\n\n// Add складывает два числа: маленькая функция, компилятор её встраивает.\nfunc Add(a, b int) int {\n\treturn a + b\n}\n\n// Sum складывает элементы слайса в цикле.\nfunc Sum(xs []int) int {\n\ttotal := 0\n\tfor _, x := range xs {\n\t\ttotal += x\n\t}\n\treturn total\n}\n\n// NewCounter возвращает указатель на локальную переменную: она уходит в кучу.\nfunc NewCounter() *int {\n\tn := 0\n\treturn &n\n}\n" },
          { name: "asm_test.go", code: "package asm\n\nimport \"testing\"\n\nfunc TestSum(t *testing.T) {\n\tif got := Sum([]int{1, 2, 3}); got != 6 {\n\t\tt.Fatalf(\"Sum = %d, want 6\", got)\n\t}\n\tif got := Add(2, 3); got != 5 {\n\t\tt.Fatalf(\"Add = %d, want 5\", got)\n\t}\n}\n\nfunc BenchmarkSum(b *testing.B) {\n\txs := make([]int, 1000)\n\tfor i := range xs {\n\t\txs[i] = i\n\t}\n\tfor b.Loop() {\n\t\tSum(xs)\n\t}\n}\n" },
          { name: "main.go", code: "// Command sumdemo вызывает asm.Add и asm.Sum: на нём смотрят objdump и встраивание.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"os\"\n\n\t\"github.com/<ник>/go-prep/week3/asm\"\n)\n\nfunc main() {\n\tn := len(os.Args)\n\tfmt.Println(asm.Add(n, 40), asm.Sum([]int{n, 2, 3}))\n}\n" }
        ],
        steps: [
          { cmd: "go build -gcflags=-S ./week3/asm 2>&1 | grep -A3 'asm.Add STEXT'", expect: "amd64: ADDQ BX, AX и RET; arm64: ADD R1, R0, R0 и RET (R30). В заголовке TEXT — NOSPLIT|NOFRAME|ABIInternal.", q: "Где лежат a, b и результат?", a: "В регистрах по внутреннему ABI Go: на amd64 a — AX, b — BX, результат — AX; на arm64 — R0, R1 и R0. Кадр стека не нужен — отсюда NOFRAME (c6 — какие регистры рантайм восстанавливает при переключении горутин)." },
          { cmd: "go build -gcflags='-S -N -l' ./week3/asm 2>&1 | grep -A16 'asm.Add STEXT'", expect: "Пролог PUSHQ BP / MOVQ SP, BP, аргументы сохраняются в кадр (MOVQ AX, a+24(SP)), то же ADDQ BX, AX, результат тоже записывается в кадр, затем эпилог.", q: "Что делают -N и -l и кто так собирает?", a: "-N отключает оптимизации, -l — встраивание: каждая переменная живёт в кадре, и отладчик может её показать. Так собирают для Delve: -gcflags=all='-N -l'." },
          { cmd: "go build -gcflags=-m ./week3/asm", expect: "can inline Add, can inline Sum, can inline NewCounter, xs does not escape, moved to heap: n", q: "Почему n попала в кучу, а xs — нет?", a: "Указатель на n возвращается и переживает функцию — escape analysis переносит n в кучу. Sum только читает xs и не сохраняет её — слайс не убегает (c24)." },
          { cmd: "go build -gcflags=-m ./week3/cmd/sumdemo", expect: "inlining call to asm.Add, inlining call to asm.Sum", q: "Где решается встраивание — в пакете asm или в main?", a: "При компиляции вызывающего пакета: компилятор main подставляет тело Add в место вызова." },
          { cmd: "go build -o bin/sumdemo ./week3/cmd/sumdemo && go tool objdump -s 'asm\\.Add$' bin/sumdemo", expect: "Пусто.", q: "Почему Add нет в бинарнике?", a: "Все вызовы встроены, отдельная функция никому не нужна, и линкер её выбросил." },
          { cmd: "go build -gcflags=-l -o bin/sumdemo ./week3/cmd/sumdemo && go tool objdump -s 'asm\\.Add$' bin/sumdemo", expect: "TEXT …/week3/asm.Add(SB) с ADDQ BX, AX и RET; в main.main — CALL …/asm.Add(SB).", q: "-l без all= действует только на main — почему Add всё равно не встроилась?", a: "Встраивание решает компилятор вызывающего пакета, а это main: ему и запретили. all= нужен, когда флаг должен дойти до всех пакетов — например, -N -l для отладчика." },
          { cmd: "cd week3/asm && GOSSAFUNC=Add go build && cd ../..", expect: "dumped SSA for Add,1 to ./ssa.html — открой файл в браузере.", q: "Что в ssa.html?", a: "Функция на каждом проходе компилятора: от исходника через SSA до машинных инструкций; последний столбец — тот же ассемблер, что дал -S." },
          { cmd: "go test -bench=. -benchmem -run='^$' ./week3/asm", expect: "BenchmarkSum-8  …  ns/op  0 B/op  0 allocs/op (число и суффикс — твои).", q: "Зачем -run='^$'?", a: "Шаблон, которому не подходит ни одно имя: обычные тесты не запускаются, работают только бенчмарки. b.Loop — с Go 1.24." }
        ],
        check: "Готово, когда без подсказки: где Add держит аргументы на amd64 и arm64; что делают -N и -l и когда они нужны; почему встроенной функции может не быть в бинарнике; чем -gcflags отличается от -gcflags=all=."
      },
      {
        id: "ref",
        title: "6. Справка: команды",
        rows: [
          { cmd: "go mod init <путь>", what: "создать модуль: go.mod с путём и версией Go" },
          { cmd: "go get <модуль>@<версия>", what: "добавить или обновить зависимость (go.mod и go.sum)" },
          { cmd: "go mod tidy", what: "привести go.mod и go.sum к импортам: добавить нужное, убрать лишнее" },
          { cmd: "go run ./путь", what: "собрать и запустить, без файла рядом с кодом" },
          { cmd: "go build ./... · go build -o bin/x ./cmd/x", what: "проверить сборку · сохранить бинарник" },
          { cmd: "go vet ./...", what: "найти подозрительный, но компилируемый код" },
          { cmd: "go test ./...", what: "тесты; -v — подробно, -run <regexp> — выбрать, -count=1 — без кэша, -race — детектор гонок, -cover — покрытие" },
          { cmd: "go test -bench=. -benchmem -run='^$'", what: "только бенчмарки, с аллокациями" },
          { cmd: "go test -cpuprofile cpu.out · go tool pprof -top cpu.out", what: "снять CPU-профиль бенчмарка и посмотреть горячие функции (неделя 5, W5-6)" },
          { cmd: "go build -gcflags=-S | -m | '-N -l'", what: "ассемблер · решения о встраивании и куче · без оптимизаций и встраивания" },
          { cmd: "go tool objdump -s <regexp> <бинарник>", what: "дизассемблировать функции из готового бинарника" },
          { cmd: "GOSSAFUNC=<функция> go build", what: "ssa.html — функция на каждом проходе компилятора" },
          { cmd: "GOOS=linux GOARCH=arm64 go build", what: "собрать под другую систему или архитектуру" },
          { cmd: "go env GOVERSION GOOS GOARCH", what: "версия Go и платформа по умолчанию" },
          { cmd: "go version -m <бинарник>", what: "с какой версией Go и какими модулями собран бинарник" }
        ],
        links: [
          { t: "Tutorial: Create a Go module", u: "https://go.dev/doc/tutorial/create-module" },
          { t: "Organizing a Go module (раскладка)", u: "https://go.dev/doc/modules/layout" },
          { t: "Go Modules Reference", u: "https://go.dev/ref/mod" },
          { t: "cmd/go: все команды и флаги тестов", u: "https://pkg.go.dev/cmd/go" },
          { t: "cmd/compile: флаги компилятора", u: "https://pkg.go.dev/cmd/compile" },
          { t: "Data Race Detector", u: "https://go.dev/doc/articles/race_detector" },
          { t: "Diagnostics: профили и трассировка", u: "https://go.dev/doc/diagnostics" },
          { t: "A Quick Guide to Go's Assembler", u: "https://go.dev/doc/asm" },
          { t: "GitHub Actions: Building and testing Go", u: "https://docs.github.com/en/actions/tutorials/build-and-test-code/go" },
          { t: "golangci-lint", u: "https://golangci-lint.run/" }
        ]
      },
      {
        id: "env",
        title: "7. Где живёт Go: GOROOT, GOPATH и кэши",
        paragraphs: [
          "GOROOT — установленный Go: компилятор, команда `go` и исходники стандартной библиотеки. `go` находит его сам по своему расположению, задавать вручную не нужно. Несколько версий рядом — нормально: запускается та, чья `bin` стоит в PATH первой (например, `~/sdk/go1.27.3/bin`).",
          "GOPATH с модулями — не место для кода: модуль лежит где угодно (модули по умолчанию с Go 1.16). По умолчанию это `~/go`, и в нём два каталога: `pkg/mod` — кэш скачанных модулей (только для чтения) и `bin` — сюда `go install` кладёт команды, если не задан GOBIN. Добавь `$(go env GOPATH)/bin` в PATH, чтобы установленные утилиты запускались по имени.",
          "Кэш сборки — отдельно: `go env GOCACHE` (на macOS `~/Library/Caches/go-build`), отсюда `(cached)` в выводе `go test`. Нужную модулю версию Go задаёт строка `go` в go.mod: при `GOTOOLCHAIN=auto` (по умолчанию, с Go 1.21) более старый `go` сам скачает нужный тулчейн.",
          "Версии: с Go 1.27 `go env GOBIN` показывает, куда `go install` положит команду, даже если GOBIN не задан; до 1.27 — пустую строку. Для интервью: GOPATH mode включается только при `GO111MODULE=off` или при `auto` вне модуля; кэш модулей — не vendor: vendor лежит в репозитории, кэш — на машине."
        ],
        rows: [
          { cmd: "go env GOROOT GOPATH", what: "где установлен Go и где GOPATH" },
          { cmd: "go env GOMODCACHE GOCACHE", what: "кэш модулей и кэш сборки" },
          { cmd: "go env GOBIN", what: "куда go install кладёт команды (с 1.27 — и без заданного GOBIN)" },
          { cmd: "go install <модуль>/cmd/<имя>@latest", what: "собрать и установить утилиту в GOPATH/bin или GOBIN" },
          { cmd: "go clean -modcache · go clean -cache", what: "очистить кэш модулей · кэш сборки" },
          { cmd: "go env -w GOBIN=<путь> · go env -u GOBIN", what: "записать настройку · сбросить её (файл — go env GOENV)" }
        ],
        links: [
          { t: "How to Write Go Code", u: "https://go.dev/doc/code" },
          { t: "Go toolchains (GOTOOLCHAIN)", u: "https://go.dev/doc/toolchain" },
          { t: "Managing Go installations", u: "https://go.dev/doc/manage-install" },
          { t: "cmd/go: GOPATH environment variable", u: "https://pkg.go.dev/cmd/go#hdr-GOPATH_environment_variable" }
        ]
      }
    ]
  },
  "go-types": {
    title: "Типы Go: что сравнимо и что может быть ключом map",
    intro: [
      "Сводка к неделе 1: какие типы сравниваются через ==, что может быть ключом map и где сравнение компилируется, но падает при выполнении. Каждое утверждение проверено запуском на Go 1.24.7 и 1.27.3."
    ],
    sections: [
      {
        id: "kinds",
        title: "1. Сравнимые и несравнимые типы",
        paragraphs: [
          "Сравнимость — свойство типа, а не значения: компилятор решает, разрешён ли ==. Составной тип сравним, только если сравнимо всё, из чего он состоит."
        ],
        rows: [
          { cmd: "bool, числа, string", what: "сравнимы; < и > есть у целых и вещественных чисел и у строк (cmp.Ordered), у complex и bool — нет: operator < not defined on complex128" },
          { cmd: "*T, chan T", what: "сравнимы по идентичности: равны, если указывают на одну и ту же переменную или созданы одним make, а также если оба nil. Указатели на разные переменные нулевого размера (struct{}, [0]int) могут оказаться и равны, и не равны — спецификация этого не задаёт" },
          { cmd: "интерфейсы (any, error)", what: "сравнимы: равны, если совпадают динамический тип и значение; any(1) == any(1.0) — false, типы разные" },
          { cmd: "[N]T", what: "сравним, если сравним T; сравнение поэлементное" },
          { cmd: "struct", what: "сравнима, если сравнимы все поля, включая неэкспортированные: struct containing []int cannot be compared" },
          { cmd: "[]T, map[K]V, func", what: "несравнимы, == только с nil: slice can only be compared to nil; содержимое сравнивают slices.Equal, maps.Equal, bytes.Equal" }
        ]
      },
      {
        id: "keys",
        title: "2. Ключи map",
        paragraphs: [
          "Ключом может быть только сравнимый тип: map[[]int]int не компилируется — invalid map key type []int. Составные ключи — массив и структура: счётчик букв [26]int в LC 49 и struct{ From, To string } вместо склейки строк через разделитель.",
          "Ключ-интерфейс компилируется всегда, но запись значения несравнимого динамического типа роняет программу: m[any([]int{1})] = 1 даёт panic: runtime error: hash of unhashable type []int.",
          "Ключ-указатель различает адреса, а не содержимое: одинаковые значения по разным указателям — разные ключи. У float-ключей NaN != NaN: каждая запись с NaN создаёт новый элемент, найти его по ключу нельзя; +0 и -0 — один ключ."
        ],
        code: {
          label: "Ключ-массив: группировка анаграмм (LC 49)",
          text: "groups := map[[26]int][]string{}\nfor _, word := range words {\n\tvar count [26]int\n\tfor _, r := range word {\n\t\tcount[r-'a']++\n\t}\n\tgroups[count] = append(groups[count], word)\n}"
        }
      },
      {
        id: "runtime",
        title: "3. Компилируется, но падает или удивляет",
        paragraphs: [
          "Интерфейсы сравниваются по динамическим значениям: any([]int{1}) == any([]int{1}) компилируется и паникует — comparing uncomparable type []int.",
          "Typed nil: var p *int; var i any = p — i == nil даёт false, потому что у интерфейса есть тип *int (карточка C33).",
          "time.Time сравнивают методом Equal, а не ==: == учитывает зону и показания монотонных часов. У времени с ними, например t := time.Now(), t == t.Round(0) — false, потому что Round(0) их убирает; t.Equal(t.Round(0)) — true."
        ]
      },
      {
        id: "generics",
        title: "4. comparable в generics",
        paragraphs: [
          "Ограничение comparable разрешает == в generic-коде: func Index[T comparable](xs []T, x T) int. С Go 1.20 ему удовлетворяют и интерфейсы, например any: Eq[any](a, b) компилируется, но при несравнимом динамическом значении паникует так же, как обычное сравнение интерфейсов. Для < и > нужен cmp.Ordered (с Go 1.21)."
        ]
      },
      {
        id: "say",
        title: "5. Сказать на интервью",
        paragraphs: [
          "Slices, maps and functions are not comparable, so they can't be map keys; arrays and structs are comparable when their elements or fields are. An interface key compiles, but panics at run time if the dynamic value isn't comparable. NaN never equals itself, so it's a useless key, and time values are compared with Equal, not with ==."
        ],
        links: [
          { t: "Spec: Comparison operators", u: "https://go.dev/ref/spec#Comparison_operators" },
          { t: "Spec: Map types", u: "https://go.dev/ref/spec#Map_types" },
          { t: "Go blog: All your comparable types (Go 1.20)", u: "https://go.dev/blog/comparable" },
          { t: "slices.Equal", u: "https://pkg.go.dev/slices#Equal" },
          { t: "maps.Equal", u: "https://pkg.go.dev/maps#Equal" },
          { t: "time.Time.Equal", u: "https://pkg.go.dev/time#Time.Equal" }
        ]
      }
    ]
  }
};

// Ссылки из плана: id → страница справки и раздел.
const GUIDE_LINKS = {
  "g-go-prep": { guide: "go-prep", section: null, label: "Свой репозиторий go-prep: раскладка, команды, CI" },
  "g-go-prep-ci": { guide: "go-prep", section: "ci", label: "go-prep: CI на GitHub Actions" },
  "g-go-prep-asm": { guide: "go-prep", section: "asm", label: "go-prep: тренировка — сборка с ассемблером и без" },
  "g-go-types": { guide: "go-types", section: null, label: "Типы Go: что сравнимо и что может быть ключом map" }
};
