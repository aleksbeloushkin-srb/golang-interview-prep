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
  },
  "go-testing": {
    title: "Тесты в Go: table-driven, подтесты, тренировка",
    intro: [
      "Справка к неделе 1 (суббота) и неделе 3: как устроен тест в Go, table-driven тест на двух образцах, подтесты и хелперы, ещё три вида тестов и тренировка «сломай и поймай» на своём W1-2. Ответ для интервью коротко — карточка c44, ловушка с `defer` — quiz q35.",
      "Образцы — пакет `week1/calc` твоего go-prep, рядом с `calc.go` и `calc_test.go` из понедельника. Код и выводы проверены на Go 1.24.7 и 1.27.3; время и числа бенчмарка у тебя будут свои."
    ],
    sections: [
      {
        id: "basics",
        title: "1. Как устроен тест",
        paragraphs: [
          "Тест — функция `func TestXxx(t *testing.T)` в файле `_test.go` рядом с кодом. Такие файлы собирает только `go test`, в обычную сборку они не попадают. После `Test` — не строчная буква: `Testdiv` `go test` не соберёт, встроенная в него проверка vet ответит «malformed name» (с Go 1.24; раньше такая функция молча не запускалась).",
          "Библиотеки утверждений в стандартной библиотеке нет: проверка — обычный `if`, а сообщение строят по шаблону «вызов = что получили, want что ждали»: `Div(-7, 2) = -4, want -3`. По такой строке ошибку понятно, не открывая тест. В JUnit порядок обратный: `assertEquals(expected, actual)`.",
          "`t.Errorf` отмечает провал и идёт дальше — видно все расхождения за один прогон. `t.Fatalf` останавливает тест — когда дальше проверять бессмысленно, например функция вернула ошибку вместо значения. `Fatal` вызывают только из горутины самого теста; вызов из горутины, которую тест запустил, ловит полный `go vet`, а встроенный в `go test` — нет.",
          "Тест в `package calc` видит неэкспортированное. Файл в той же папке с `package calc_test` — внешний пакет: видит только экспортированное, как пользователь пакета (так написан `example_test.go` в разделе 5).",
          "Сравнение: `==` — для сравнимых типов; срезы и map — `slices.Equal` и `maps.Equal` (справка «Типы Go»), вложенные структуры — `reflect.DeepEqual`. Ошибки — через `errors.Is` и `errors.As`, не по тексту: текст бывает одинаковым, а цепочка — разной (раздел 6, мутант 1).",
          "Если сравнивать с JUnit: `@ParameterizedTest` — table-driven тест, `@BeforeEach` и `@AfterEach` — хелпер и `t.Cleanup`, `@Disabled` и `assumeTrue` — `t.Skip`: пропуск решается во время выполнения."
        ]
      },
      {
        id: "table",
        title: "2. Table-driven тест. Образец 1: значения и ошибки",
        paragraphs: [
          "Table-driven тест — один тест на много случаев. Случаи — срез структур: имя, вход, ожидание; цикл запускает каждый случай подтестом через `t.Run`. Новый случай — одна строка таблицы, в провале видно его имя, а `-run` перезапускает один случай.",
          "Ожидаемая ошибка — поле `wantErr error`. `errors.Is(nil, nil)` возвращает true, поэтому одна проверка покрывает и «ошибки нет», и «ждём `ErrDivByZero`». Сначала ошибка через `Fatalf` — при неверной ошибке значение смотреть незачем, потом значение через `Errorf`. Если у ошибки нет sentinel — поле `wantErr bool`, как в тестах W3-4.",
          "Положи `div.go` и `div_test.go` в `week1/calc`. Шаг 3 — с поломкой: в `div.go` замени `a / b` на `int(math.Floor(float64(a) / float64(b)))` и добавь импорт `math`; после шага верни как было."
        ],
        files: [
          { name: "div.go", code: "package calc\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\n// ErrDivByZero — sentinel: вызывающий проверяет его через errors.Is.\nvar ErrDivByZero = errors.New(\"division by zero\")\n\n// Div делит a на b с отбрасыванием дробной части к нулю, как оператор / в Go.\nfunc Div(a, b int) (int, error) {\n\tif b == 0 {\n\t\treturn 0, fmt.Errorf(\"div %d by %d: %w\", a, b, ErrDivByZero)\n\t}\n\treturn a / b, nil\n}\n" },
          { name: "div_test.go", code: "package calc\n\nimport (\n\t\"errors\"\n\t\"testing\"\n)\n\nfunc TestDiv(t *testing.T) {\n\ttests := []struct {\n\t\tname    string\n\t\ta, b    int\n\t\twant    int\n\t\twantErr error\n\t}{\n\t\t{name: \"exact\", a: 10, b: 2, want: 5},\n\t\t{name: \"drops the fraction\", a: 7, b: 2, want: 3},\n\t\t{name: \"negative rounds toward zero\", a: -7, b: 2, want: -3},\n\t\t{name: \"by zero\", a: 1, b: 0, wantErr: ErrDivByZero},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\tgot, err := Div(tt.a, tt.b)\n\t\t\tif !errors.Is(err, tt.wantErr) {\n\t\t\t\tt.Fatalf(\"Div(%d, %d) error = %v, want %v\", tt.a, tt.b, err, tt.wantErr)\n\t\t\t}\n\t\t\tif got != tt.want {\n\t\t\t\tt.Errorf(\"Div(%d, %d) = %d, want %d\", tt.a, tt.b, got, tt.want)\n\t\t\t}\n\t\t})\n\t}\n}\n" }
        ],
        steps: [
          { cmd: "go test -v -run TestDiv ./week1/calc", expect: "=== RUN   TestDiv\n=== RUN   TestDiv/exact\n=== RUN   TestDiv/drops_the_fraction\n=== RUN   TestDiv/negative_rounds_toward_zero\n=== RUN   TestDiv/by_zero\n--- PASS: TestDiv (0.00s) и под ним четыре --- PASS по случаям", q: "Откуда подчёркивания в именах подтестов?", a: "t.Run заменяет пробелы в имени на _. В -run имя подтеста пишут с подчёркиваниями; пробел тоже сработает — шаблон проходит ту же замену." },
          { cmd: "go test -v -run 'TestDiv/by_zero' ./week1/calc", expect: "=== RUN   TestDiv\n=== RUN   TestDiv/by_zero\n--- PASS: TestDiv (0.00s)\n    --- PASS: TestDiv/by_zero (0.00s)", q: "Как -run выбирает подтест и что запустит -run Div?", a: "Шаблон делится по / на уровни: первая часть — регулярное выражение для имени теста, вторая — для подтеста. Без ^ и $ совпадение ищется в любом месте имени, а -run выбирает и тесты, и примеры, и fuzz-тесты: -run Div запустит TestDiv, ExampleDiv и затравки FuzzDiv из раздела 5." },
          { cmd: "go test -run TestDiv ./week1/calc", expect: "--- FAIL: TestDiv (0.00s)\n    --- FAIL: TestDiv/negative_rounds_toward_zero (0.00s)\n        div_test.go:27: Div(-7, 2) = -4, want -3\nFAIL", q: "Почему упал только отрицательный случай?", a: "Оператор / в Go отбрасывает дробь к нулю: -7 / 2 = -3, как в Java и Kotlin. Floor округляет вниз, до -4; на положительных числах разницы нет. Отрицательные и граничные случаи в таблице для этого и нужны. Верни a / b." }
        ]
      },
      {
        id: "subtests",
        title: "3. Образец 2: таблица-map, t.Parallel и хелпер",
        paragraphs: [
          "Таблица бывает и map: имя случая — ключ, повторить имя нельзя. Порядок обхода map меняется от запуска к запуску, поэтому скрытая зависимость случаев друг от друга рано или поздно проявится — не в каждом прогоне.",
          "`t.Parallel()` ставит подтест на паузу (`PAUSE` в выводе `-v`) до конца функции родителя, потом подтесты идут одновременно (`CONT`). Каждому подтесту — только свои данные: с Go 1.22 у каждой итерации цикла своя `tt`, копия `tt := tt` нужна при директиве `go` ниже 1.22 в go.mod.",
          "`defer` в родителе срабатывает раньше параллельных подтестов, `t.Cleanup` — после них: общий ресурс закрывают через `t.Cleanup` (quiz q35).",
          "`checkClamp` — хелпер: принимает `t` первым параметром и сам сообщает о провале. `t.Helper()` переносит строку в сообщении на место вызова: провал указывает на код теста, а не внутрь хелпера. Какой случай упал, говорит имя подтеста — `TestClamp/above`. `clamp.go` использует встроенные `min` и `max` (Go 1.21).",
          "Шаг 2 — с поломкой: у случая `\"above\"` поставь `want: 11`, прогони, затем удали строку `t.Helper()` и прогони ещё раз; после шага верни как было."
        ],
        files: [
          { name: "clamp.go", code: "package calc\n\n// Clamp возвращает x, прижатое к отрезку [lo, hi]; ожидается lo <= hi.\nfunc Clamp(x, lo, hi int) int {\n\treturn min(max(x, lo), hi)\n}\n" },
          { name: "clamp_test.go", code: "package calc\n\nimport \"testing\"\n\nfunc TestClamp(t *testing.T) {\n\ttests := map[string]struct {\n\t\tx, lo, hi, want int\n\t}{\n\t\t\"inside\":        {x: 5, lo: 0, hi: 10, want: 5},\n\t\t\"below\":         {x: -3, lo: 0, hi: 10, want: 0},\n\t\t\"above\":         {x: 42, lo: 0, hi: 10, want: 10},\n\t\t\"on the edge\":   {x: 10, lo: 0, hi: 10, want: 10},\n\t\t\"empty segment\": {x: 7, lo: 3, hi: 3, want: 3},\n\t}\n\tfor name, tt := range tests {\n\t\tt.Run(name, func(t *testing.T) {\n\t\t\tt.Parallel()\n\t\t\tcheckClamp(t, tt.x, tt.lo, tt.hi, tt.want)\n\t\t})\n\t}\n}\n\n// checkClamp — хелпер: t.Helper переносит строку падения в место вызова.\nfunc checkClamp(t *testing.T, x, lo, hi, want int) {\n\tt.Helper()\n\tif got := Clamp(x, lo, hi); got != want {\n\t\tt.Errorf(\"Clamp(%d, %d, %d) = %d, want %d\", x, lo, hi, got, want)\n\t}\n}\n" }
        ],
        steps: [
          { cmd: "go test -v -run TestClamp ./week1/calc", expect: "=== RUN и === PAUSE по каждому случаю, затем === CONT по каждому, --- PASS: TestClamp (0.00s) и под ним пять --- PASS; порядок случаев от запуска к запуску разный", q: "Почему порядок подтестов меняется?", a: "Порядок обхода map не задан, а параллельные подтесты выполняются одновременно и заканчиваются в любом порядке. Тест не должен зависеть от порядка случаев." },
          { cmd: "go test -run TestClamp ./week1/calc", expect: "С t.Helper(): --- FAIL: TestClamp/above и clamp_test.go:18: Clamp(42, 0, 10) = 10, want 11 — строка вызова checkClamp в теле подтеста. Без него: clamp_test.go:26 — строка t.Errorf внутри checkClamp.", q: "Какая строка полезнее и почему?", a: "Строка вызова: она в коде теста. Если хелпер зовут из нескольких мест — несколько проверок подряд или разные тесты, как newAccount в разделе 7, — она показывает, какой вызов упал; строка внутри хелпера одна на все вызовы. В таблице вызов один на все случаи, и случай называет имя подтеста." }
        ]
      },
      {
        id: "helpers",
        title: "4. Что ещё даёт testing.T",
        paragraphs: [
          "Самое нужное на каждый день; в скобках — версия Go, с которой метод есть."
        ],
        rows: [
          { cmd: "t.Helper()", what: "строка провала — у вызывающего, а не внутри хелпера (1.9)" },
          { cmd: "t.Cleanup(f)", what: "f выполнится после теста и всех его подтестов; несколько функций — в обратном порядке, последняя добавленная первой (1.14)" },
          { cmd: "t.TempDir()", what: "свой временный каталог, удаляется после теста и его подтестов (1.15)" },
          { cmd: "t.Setenv(k, v)", what: "переменная окружения на время теста; с t.Parallel несовместим — тест падает с паникой (1.17)" },
          { cmd: "t.Context()", what: "контекст теста, отменяется перед функциями t.Cleanup (1.24)" },
          { cmd: "t.Chdir(dir)", what: "рабочий каталог на время теста; с t.Parallel тоже несовместим (1.24)" },
          { cmd: "t.Skip(\"причина\")", what: "пропустить тест: нет внешней зависимости или testing.Short() при go test -short" },
          { cmd: "t.Log(…)", what: "печатается при -v или если тест упал" },
          { cmd: "func TestMain(m *testing.M)", what: "общая подготовка всего пакета; m.Run() запускает тесты. С Go 1.15 os.Exit(m.Run()) писать не нужно" },
          { cmd: "go test -shuffle=on ./...", what: "тесты верхнего уровня в случайном порядке: ловит зависимость от порядка (1.17)" }
        ]
      },
      {
        id: "kinds",
        title: "5. Ещё три вида: Example, Benchmark, Fuzz",
        paragraphs: [
          "`ExampleDiv` — пример и тест сразу. `go test` запускает его и сравнивает напечатанное с комментарием `// Output:` (пробелы по краям не важны); без комментария пример только компилируется. На pkg.go.dev он попадает в документацию `Div`. Имя связывает пример с идентификатором: на `ExampleDvi` встроенный vet ответит «refers to unknown identifier» (тоже с Go 1.24). Файл — во внешнем пакете `calc_test`, в импорте — твой путь модуля.",
          "`BenchmarkDiv` с циклом `for b.Loop()` (Go 1.24): подготовка до цикла в замер не входит, а вызовы внутри цикла компилятор не выбросит. До 1.24 писали `for i := 0; i < b.N; i++`, и о том, чтобы результат не выбросили, заботился автор. Бенчмарки идут только с флагом `-bench`.",
          "`FuzzDiv` проверяет свойство на входах, которые подбирает Go (с 1.18). Затравки из `f.Add` идут подтестами при каждом `go test` (`FuzzDiv/seed#1`). С `-fuzz` Go генерирует новые входы, найденный провал сохраняет в `testdata/fuzz/FuzzDiv/` и дальше прогоняет его в каждом `go test`. Фаззер находит быстро, но не всё: `Div` как `int(float64(a) / float64(b))` верна до 2^53 и ошибается дальше, например на `Div(1<<53+1, 1)`; за 30 с наш прогон такой вход не нашёл — целые фаззер меняет небольшими шагами от затравок. Такие границы пишут в таблицу руками.",
          "Шаг 3 — с поломкой: в `Div` перед делением добавь `if b < 0 { b = -b }` (потерян знак делителя). Таблица и затравки отрицательный делитель не проверяют, обычный `go test` останется зелёным. После шага верни как было."
        ],
        files: [
          { name: "example_test.go", code: "package calc_test\n\nimport (\n\t\"fmt\"\n\n\t\"github.com/<ник>/go-prep/week1/calc\"\n)\n\nfunc ExampleDiv() {\n\tq, err := calc.Div(7, 2)\n\tfmt.Println(q, err)\n\t_, err = calc.Div(1, 0)\n\tfmt.Println(err)\n\t// Output:\n\t// 3 <nil>\n\t// div 1 by 0: division by zero\n}\n" },
          { name: "bench_test.go", code: "package calc\n\nimport \"testing\"\n\nfunc BenchmarkDiv(b *testing.B) {\n\tfor b.Loop() {\n\t\tDiv(1_000_003, 7)\n\t}\n}\n" },
          { name: "fuzz_test.go", code: "package calc\n\nimport (\n\t\"errors\"\n\t\"testing\"\n)\n\n// FuzzDiv проверяет свойство, а не пример: q*b + a%b == a для любых a и b != 0.\nfunc FuzzDiv(f *testing.F) {\n\tf.Add(7, 2)\n\tf.Add(-7, 2)\n\tf.Add(1, 0)\n\tf.Fuzz(func(t *testing.T, a, b int) {\n\t\tq, err := Div(a, b)\n\t\tif b == 0 {\n\t\t\tif !errors.Is(err, ErrDivByZero) {\n\t\t\t\tt.Fatalf(\"Div(%d, 0) error = %v, want ErrDivByZero\", a, err)\n\t\t\t}\n\t\t\treturn\n\t\t}\n\t\tif err != nil || q*b+a%b != a {\n\t\t\tt.Fatalf(\"Div(%d, %d) = %d, %v\", a, b, q, err)\n\t\t}\n\t})\n}\n" }
        ],
        steps: [
          { cmd: "go test -v -run ExampleDiv ./week1/calc", expect: "=== RUN   ExampleDiv\n--- PASS: ExampleDiv (0.00s)", q: "Что будет, если в // Output: заменить 3 на 3.5?", a: "--- FAIL: ExampleDiv и два блока, got: и want:, — напечатанное и ожидаемое. Пример проверяет документацию: она не устареет молча." },
          { cmd: "go test -bench=Div -benchmem -run='^$' ./week1/calc", expect: "BenchmarkDiv-12   604828929   2.035 ns/op   0 B/op   0 allocs/op (числа — твои)", q: "Зачем -run='^$' и что значит -12?", a: "-run выбирает тесты; ^$ не совпадает ни с одним именем, поэтому идут только бенчмарки. -12 — GOMAXPROCS на время прогона, сколько потоков одновременно выполняют Go-код (при 1 суффикса нет). По умолчанию — число логических процессоров, доступных процессу; с Go 1.25 на Linux учитывается и лимит CPU в cgroup (карточка c7)." },
          { cmd: "go test -run '^$' -fuzz=FuzzDiv -fuzztime=30s ./week1/calc", expect: "--- FAIL: FuzzDiv (0.02s)\n    --- FAIL: FuzzDiv (0.00s)\n        fuzz_test.go:22: Div(80, -43) = 1, <nil>\n    Failing input written to testdata/fuzz/FuzzDiv/0191a6f2fffab736\n    To re-run:\n    go test -run=FuzzDiv/0191a6f2fffab736\nFAIL — вход и имя файла у тебя свои; у нас нашлось меньше чем за секунду", q: "Что изменилось для обычного go test?", a: "Найденный вход лежит в testdata/fuzz/FuzzDiv/ и идёт в каждом go test подтестом FuzzDiv/<имя файла>: тест красный, пока не вернёшь знак. Файл коммитят вместе с исправлением. -fuzz работает только на одном пакете: с ./... Go ответит cannot use -fuzz flag with multiple packages." }
        ]
      },
      {
        id: "drill",
        title: "6. Тренировка: сломай и поймай (W1-2)",
        paragraphs: [
          "Тест хорош, если падает на неверном коде. Проверь это на своём W1-2: в `week1/account` go-prep — твоё решение и `account_test.go` со страницы задачи. Мутанты 1 и 2 — ошибки из «Частых ошибок» на странице задачи, мутант 3 — ошибка на границе. Каждый внеси, прогони тесты, верни как было.",
          "Мутант 1 — в `Withdraw` `%w` заменить на `%v`. Мутант 2 — `Deposit` на ресивере-значении: `func (a Account) Deposit`. Мутант 3 — в `Withdraw` условие нехватки `amount > a.balance` заменить на `amount >= a.balance`; если условие у тебя записано иначе — сломай так, чтобы снять ровно весь баланс стало нельзя.",
          "Первые два мутанта тесты ловят. Третий — нет: напиши на него `TestWithdraw` таблицей сам, образец — в разделе 7."
        ],
        steps: [
          { cmd: "go test ./week1/account", expect: "Мутант 1:\n--- FAIL: TestInsufficientFundsIsWrapped (0.00s)\n    account_test.go:40: errors.Is(withdraw 500 from A (balance 100): insufficient funds, ErrInsufficientFunds) = false\n--- FAIL: TestTwoLevelsOfWrapping (0.00s)", q: "Текст ошибки прежний. Почему упали два теста?", a: "%v вставляет в сообщение только текст: в цепочке Unwrap больше нет ErrInsufficientFunds, и errors.Is её не находит — ни у Withdraw, ни через обёртку Transfer. Поэтому ошибки проверяют через errors.Is, а не по тексту." },
          { cmd: "go vet ./week1/account && go test ./week1/account", expect: "Мутант 2: vet молчит; FAIL у пяти тестов, первый — TestDepositWithdraw: account_test.go:16: withdraw 300 from A (balance 0): insufficient funds", q: "Почему не возразили ни компилятор, ни vet?", a: "Метод на ресивере-значении — законный Go: Deposit пополняет копию и возвращает nil. Ошибку видно только по балансу после вызова — его и проверяют тесты." },
          { cmd: "go test -cover ./week1/account", expect: "Мутант 3: ok и то же покрытие, что без мутанта (у эталона — coverage: 88.2% of statements).", q: "Тесты зелёные, покрытие прежнее. Мутант безобиден?", a: "Нет: снять ровно весь баланс теперь нельзя. Строка с условием выполняется, но ни один тест не снимает ровно баланс. Покрытие считает выполненные операторы (statements), а не проверенные случаи. Нужен случай на границе — таблица TestWithdraw." },
          { cmd: "go test -race -run TestWithdraw ./week1/account", expect: "С мутантом 3:\n--- FAIL: TestWithdraw (0.00s)\n    --- FAIL: TestWithdraw/whole_balance (0.00s)\n        withdraw_test.go:35: Withdraw(100) with balance 100: error = withdraw 100 from A (balance 100): insufficient funds, want <nil>\nНомер строки в твоём файле — свой. Без мутанта — ok.", q: "Ловит ли TestWithdraw мутанты 1 и 2?", a: "Да: с мутантом 1 падает случай one_more_than_the_balance — ошибка есть, но errors.Is её не находит; с мутантом 2 — все три: счёт из хелпера остаётся пустым. Проверь сам." }
        ],
        check: "Готово, когда без подсказки: какой тест ловит каждый мутант и почему; почему зелёные тесты и прежнее покрытие не доказывают, что код верен; что такое table-driven тест — по-английски одной фразой."
      },
      {
        id: "withdraw",
        title: "7. Образец 3: TestWithdraw и хелпер newAccount",
        paragraphs: [
          "Открывай после своей попытки. Таблица — границы: часть баланса, ровно баланс, на единицу больше. Нулевую и отрицательную сумму уже проверяет `TestInvalidAmounts`. Хелпер `newAccount` создаёт счёт с балансом и при сбое останавливает тест через `t.Fatalf`; с `t.Helper()` строка провала укажет на вызов.",
          "Файл — `week1/account/withdraw_test.go`, рядом с тестами практикума."
        ],
        files: [
          { name: "withdraw_test.go", code: "package account\n\nimport (\n\t\"errors\"\n\t\"testing\"\n)\n\n// newAccount — хелпер: счёт A с начальным балансом; падение покажет строку вызова.\nfunc newAccount(t *testing.T, balance int64) *Account {\n\tt.Helper()\n\ta := &Account{ID: \"A\"}\n\tif err := a.Deposit(balance); err != nil {\n\t\tt.Fatalf(\"Deposit(%d): %v\", balance, err)\n\t}\n\treturn a\n}\n\nfunc TestWithdraw(t *testing.T) {\n\ttests := []struct {\n\t\tname        string\n\t\tbalance     int64\n\t\tamount      int64\n\t\twantErr     error\n\t\twantBalance int64\n\t}{\n\t\t{name: \"part of the balance\", balance: 100, amount: 30, wantBalance: 70},\n\t\t{name: \"whole balance\", balance: 100, amount: 100, wantBalance: 0},\n\t\t{name: \"one more than the balance\", balance: 100, amount: 101, wantErr: ErrInsufficientFunds, wantBalance: 100},\n\t}\n\tfor _, tt := range tests {\n\t\tt.Run(tt.name, func(t *testing.T) {\n\t\t\ta := newAccount(t, tt.balance)\n\t\t\terr := a.Withdraw(tt.amount)\n\t\t\tif !errors.Is(err, tt.wantErr) {\n\t\t\t\tt.Fatalf(\"Withdraw(%d) with balance %d: error = %v, want %v\", tt.amount, tt.balance, err, tt.wantErr)\n\t\t\t}\n\t\t\tif got := a.Balance(); got != tt.wantBalance {\n\t\t\t\tt.Errorf(\"balance after Withdraw(%d) = %d, want %d\", tt.amount, got, tt.wantBalance)\n\t\t\t}\n\t\t})\n\t}\n}\n" }
        ]
      },
      {
        id: "say",
        title: "8. Сказать на интервью",
        paragraphs: [
          "In Go I write table-driven tests: a slice of named cases with inputs and expected results, and a loop that runs each case as a subtest with t.Run. Adding a case is one line, a failure names the case, and go test -run reruns just that case. I use t.Errorf to report and continue, t.Fatalf when the test cannot go on, t.Helper in helpers and t.Cleanup for shared teardown. I check errors with errors.Is, not by their text, and I make sure a test fails on a broken implementation."
        ],
        links: [
          { t: "Go wiki: TableDrivenTests", u: "https://go.dev/wiki/TableDrivenTests" },
          { t: "Package testing", u: "https://pkg.go.dev/testing" },
          { t: "Go blog: Using Subtests and Sub-benchmarks", u: "https://go.dev/blog/subtests" },
          { t: "Code Review Comments: Useful Test Failures", u: "https://go.dev/wiki/CodeReviewComments#useful-test-failures" },
          { t: "cmd/go: флаги тестов", u: "https://pkg.go.dev/cmd/go#hdr-Testing_flags" },
          { t: "Go blog: Testable Examples", u: "https://go.dev/blog/examples" },
          { t: "Go blog: More predictable benchmarking with testing.B.Loop", u: "https://go.dev/blog/testing-b-loop" },
          { t: "Tutorial: Getting started with fuzzing", u: "https://go.dev/doc/tutorial/fuzz" }
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
  "g-go-types": { guide: "go-types", section: null, label: "Типы Go: что сравнимо и что может быть ключом map" },
  "g-go-testing": { guide: "go-testing", section: null, label: "Тесты в Go: table-driven, подтесты, тренировка" },
  "g-go-testing-table": { guide: "go-testing", section: "table", label: "Тесты в Go: table-driven тест — образец" },
  "g-go-testing-drill": { guide: "go-testing", section: "drill", label: "Тесты в Go: тренировка «сломай и поймай» на W1-2" }
};
