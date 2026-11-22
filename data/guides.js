// Справочные страницы практикума (#/practice/<guide>[/<section>]) и ссылки на них из плана (links: "g-…").
// Команды и выводы проверены на Go 1.24.7 и 1.27.3 (linux/amd64; arm64 — кросс-компиляцией);
// код тренировки — docs/verification/fixtures/go-prep/.
const GUIDES = {
  "go-prep": {
    title: "Свой репозиторий go-prep: раскладка, команды, CI",
    intro: [
      "Весь код практикума живёт в одном модуле `go-prep`: каждая задача — свой пакет `weekN/<задача>`, рядом — учебные пакеты недель 1, 3 и 4. Так неделя прогоняется одной командой (`go test -race ./week5/...`), свои тесты лежат рядом с тестами практикума, а CI проверяет всё на каждый push.",
      "Проект недель 7–10 (ledger) — отдельный репозиторий: его раскладку задаёт неделя 7. Сайт твой репозиторий не видит: «Проверить на сервере» проверяет код, вставленный на странице задачи."
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
          "Свои тесты — рядом с тестами практикума, в том же пакете (неделя 4: «Покрыть тестами W1-2 и W4-2»).",
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
        title: "4. CI на GitHub Actions (неделя 4, четверг)",
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
        title: "5. Тренировка недели 4: сборка с ассемблером и без",
        paragraphs: [
          "Пакет `week4/asm` и программа `week4/cmd/sumdemo` — файлы ниже. Ассемблер показан для amd64 и arm64 (Mac на Apple Silicon); сборка под чужую архитектуру работает с любого компьютера: `GOARCH=arm64` или `GOARCH=amd64` перед командой.",
          "Флаги компилятора идут через `-gcflags`: без `all=` — только пакетам из командной строки, с `all=` — всем, включая зависимости."
        ],
        files: [
          { name: "asm.go", code: "// Package asm — функции, на которых смотрят ассемблер, встраивание и escape analysis.\npackage asm\n\n// Add складывает два числа: маленькая функция, компилятор её встраивает.\nfunc Add(a, b int) int {\n\treturn a + b\n}\n\n// Sum складывает элементы слайса в цикле.\nfunc Sum(xs []int) int {\n\ttotal := 0\n\tfor _, x := range xs {\n\t\ttotal += x\n\t}\n\treturn total\n}\n\n// NewCounter возвращает указатель на локальную переменную: она уходит в кучу.\nfunc NewCounter() *int {\n\tn := 0\n\treturn &n\n}\n" },
          { name: "asm_test.go", code: "package asm\n\nimport \"testing\"\n\nfunc TestSum(t *testing.T) {\n\tif got := Sum([]int{1, 2, 3}); got != 6 {\n\t\tt.Fatalf(\"Sum = %d, want 6\", got)\n\t}\n\tif got := Add(2, 3); got != 5 {\n\t\tt.Fatalf(\"Add = %d, want 5\", got)\n\t}\n}\n\nfunc BenchmarkSum(b *testing.B) {\n\txs := make([]int, 1000)\n\tfor i := range xs {\n\t\txs[i] = i\n\t}\n\tfor b.Loop() {\n\t\tSum(xs)\n\t}\n}\n" },
          { name: "main.go", code: "// Command sumdemo вызывает asm.Add и asm.Sum: на нём смотрят objdump и встраивание.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"os\"\n\n\t\"github.com/<ник>/go-prep/week4/asm\"\n)\n\nfunc main() {\n\tn := len(os.Args)\n\tfmt.Println(asm.Add(n, 40), asm.Sum([]int{n, 2, 3}))\n}\n" }
        ],
        steps: [
          { cmd: "go build -gcflags=-S ./week4/asm 2>&1 | grep -A3 'asm.Add STEXT'", expect: "amd64: ADDQ BX, AX и RET; arm64: ADD R1, R0, R0 и RET (R30). В заголовке TEXT — NOSPLIT|NOFRAME|ABIInternal.", q: "Где лежат a, b и результат?", a: "В регистрах по внутреннему ABI Go: на amd64 a — AX, b — BX, результат — AX; на arm64 — R0, R1 и R0. Кадр стека не нужен — отсюда NOFRAME (c6 — какие регистры рантайм восстанавливает при переключении горутин)." },
          { cmd: "go build -gcflags='-S -N -l' ./week4/asm 2>&1 | grep -A16 'asm.Add STEXT'", expect: "Пролог PUSHQ BP / MOVQ SP, BP, аргументы сохраняются в кадр (MOVQ AX, a+24(SP)), то же ADDQ BX, AX, результат тоже записывается в кадр, затем эпилог.", q: "Что делают -N и -l и кто так собирает?", a: "-N отключает оптимизации, -l — встраивание: каждая переменная живёт в кадре, и отладчик может её показать. Так собирают для Delve: -gcflags=all='-N -l'." },
          { cmd: "go build -gcflags=-m ./week4/asm", expect: "can inline Add, can inline Sum, can inline NewCounter, xs does not escape, moved to heap: n", q: "Почему n попала в кучу, а xs — нет?", a: "Указатель на n возвращается и переживает функцию — escape analysis переносит n в кучу. Sum только читает xs и не сохраняет её — слайс не убегает (c24)." },
          { cmd: "go build -gcflags=-m ./week4/cmd/sumdemo", expect: "inlining call to asm.Add, inlining call to asm.Sum", q: "Где решается встраивание — в пакете asm или в main?", a: "При компиляции вызывающего пакета: компилятор main подставляет тело Add в место вызова." },
          { cmd: "go build -o bin/sumdemo ./week4/cmd/sumdemo && go tool objdump -s 'asm\\.Add$' bin/sumdemo", expect: "Пусто.", q: "Почему Add нет в бинарнике?", a: "Все вызовы встроены, отдельная функция никому не нужна, и линкер её выбросил." },
          { cmd: "go build -gcflags=-l -o bin/sumdemo ./week4/cmd/sumdemo && go tool objdump -s 'asm\\.Add$' bin/sumdemo", expect: "TEXT …/week4/asm.Add(SB) с ADDQ BX, AX и RET; в main.main — CALL …/asm.Add(SB).", q: "-l без all= действует только на main — почему Add всё равно не встроилась?", a: "Встраивание решает компилятор вызывающего пакета, а это main: ему и запретили. all= нужен, когда флаг должен дойти до всех пакетов — например, -N -l для отладчика." },
          { cmd: "cd week4/asm && GOSSAFUNC=Add go build && cd ../..", expect: "dumped SSA for Add,1 to ./ssa.html — открой файл в браузере.", q: "Что в ssa.html?", a: "Функция на каждом проходе компилятора: от исходника через SSA до машинных инструкций; последний столбец — тот же ассемблер, что дал -S." },
          { cmd: "go test -bench=. -benchmem -run='^$' ./week4/asm", expect: "BenchmarkSum-8  …  ns/op  0 B/op  0 allocs/op (число и суффикс — твои).", q: "Зачем -run='^$'?", a: "Шаблон, которому не подходит ни одно имя: обычные тесты не запускаются, работают только бенчмарки. b.Loop — с Go 1.24." }
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
          { cmd: "go test -cpuprofile cpu.out · go tool pprof -top cpu.out", what: "снять CPU-профиль бенчмарка и посмотреть горячие функции (неделя 6, W6-6)" },
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
      "Справка к неделе 1 (суббота) и неделе 4: как устроен тест в Go, table-driven тест на двух образцах, подтесты и хелперы, ещё три вида тестов и тренировка «сломай и поймай» на своём W1-2. Ответ для интервью коротко — карточка c44, ловушка с `defer` — quiz q35.",
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
          "Ожидаемая ошибка — поле `wantErr error`. `errors.Is(nil, nil)` возвращает true, поэтому одна проверка покрывает и «ошибки нет», и «ждём `ErrDivByZero`». Сначала ошибка через `Fatalf` — при неверной ошибке значение смотреть незачем, потом значение через `Errorf`. Если у ошибки нет sentinel — поле `wantErr bool`, как в тестах W4-4.",
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
  },
  "go-bits": {
    title: "Биты в Go: операторы, сдвиги, маски",
    intro: [
      "Справка к неделе 3: как читать биты, что делают операторы `& | ^ &^` и сдвиги, как маской проверить, поставить, снять и вырезать биты. У каждой строки — биты результата; все результаты — вывод Example-тестов, проверены на Go 1.24.7 и 1.27.3. Диаграмма 9 показывает те же операции по шагам.",
      "Код — пакет `week3/bitops` твоего go-prep, файлы в разделе 8. `go test -v ./week3/bitops` прогоняет примеры и сверяет вывод с комментариями `// Output:`. Читая строку, сначала назови биты результата сам, потом сверь."
    ],
    sections: [
      {
        id: "binary",
        title: "1. Как читать биты",
        paragraphs: [
          "Целое число в памяти — ряд битов. Биты нумеруют справа налево с нуля: у байта (`uint8`) их восемь, от 7 до 0. Бит k стоит 2^k, а число — сумма стоимостей единичных битов: `1011_0110` = 128 + 32 + 16 + 4 + 2 = 182.",
          "Печать: `%b` — двоичная запись, `%08b` — с ведущими нулями до восьми знаков, `%x` и `%o` — шестнадцатеричная и восьмеричная. Литералы: `0b1011_0110`, `0xB6`, `0o266`; подчёркивания между цифрами — с Go 1.13, они только для чтения глазами. В справке биты печатает функция `Bin` — по четыре через подчёркивание."
        ],
        rows: [
          { cmd: "x := uint8(0b1011_0110)", what: "182; Bin(x) = 1011_0110" },
          { cmd: "fmt.Printf(\"%08b %x %o\", x, x, x)", what: "10110110 b6 266" },
          { cmd: "1 << 3", what: "0000_1000 = 8: единица в бите 3" }
        ]
      },
      {
        id: "types",
        title: "2. Типы, переполнение и отрицательные числа",
        paragraphs: [
          "Знаковые `int8`…`int64` и беззнаковые `uint8`…`uint64`; `int` и `uint` — 64 бита на amd64 и arm64; `byte` — это `uint8`, `rune` — `int32`. Беззнаковый байт хранит 0…255, знаковый — −128…127.",
          "Переполнение во время работы не паникует: результат берётся по модулю 2^n, лишние старшие биты отбрасываются. `u := uint8(200); u += 100` даёт 44 (300 − 256), `s := int8(127); s++` — −128. Константы проверяет компилятор: `var b uint8 = 256` не скомпилируется — «overflows», и `uint8(200) + 100` тоже: это константное выражение, а не вычисление над переменной.",
          "Отрицательные числа хранятся в дополнительном коде: −x — это `^x + 1`, все биты наоборот и плюс единица. Поэтому у −1 все биты единичные, а у отрицательного числа старший бит — 1. Одни и те же биты `1011_0110` — это 182 для `uint8` и −74 для `int8`: как их читать, решает тип."
        ],
        rows: [
          { cmd: "u := uint8(200); u += 100", what: "44: 300 не помещается, остаётся 300 − 256" },
          { cmd: "s := int8(127); s++", what: "−128: из максимума — в минимум" },
          { cmd: "int8(-1) как биты", what: "1111_1111" },
          { cmd: "int8(-74) как биты", what: "1011_0110 = ^74 + 1 — те же биты, что у uint8(182)" }
        ]
      },
      {
        id: "operators",
        title: "3. Операторы & | ^ &^ и ^x",
        paragraphs: [
          "Побитовые операторы работают с каждой позицией отдельно. В строках ниже `a = 1100_1010`, `b = 1010_0110`.",
          "`&^` (AND NOT) — оператор Go, которого нет в Java: `a &^ b` снимает в `a` биты, которые стоят в `b`, то есть это `a & ^b`. Унарный `^a` переворачивает все биты; в Java это `~a`, в Kotlin — `a.inv()`.",
          "Приоритет: `&`, `&^`, `<<` и `>>` связывают сильнее, чем `==` и `!=`, поэтому `x&1 == 0` в Go значит `(x&1) == 0`. В C это ловушка — там `&` слабее `==`, а в Java такое выражение без скобок не компилируется. `|` и `^` стоят на уровне `+` и `-`."
        ],
        rows: [
          { cmd: "a & b", what: "1000_0010: единица там, где она в обоих (AND)" },
          { cmd: "a | b", what: "1110_1110: единица там, где она хотя бы в одном (OR)" },
          { cmd: "a ^ b", what: "0110_1100: единица там, где биты разные (XOR)" },
          { cmd: "a &^ b", what: "0100_1000: из a убраны биты b (AND NOT)" },
          { cmd: "^a", what: "0011_0101: все биты a наоборот (NOT)" }
        ]
      },
      {
        id: "shifts",
        title: "4. Сдвиги без маски",
        paragraphs: [
          "`x << n` сдвигает биты влево на n позиций: справа приходят нули, слева биты уходят за край. Пока ничего не ушло, это умножение на 2^n: для `x = uint8(22)` `x << 1` = 44, а `x << 4` = 96, а не 352 — единица бита 4 ушла за край байта. У констант ширины нет: `22 << 4` в константе — 352.",
          "`x >> n` сдвигает вправо — это деление на 2^n с округлением вниз. Слева у беззнакового приходят нули (логический сдвиг), у знакового — копии знакового бита (арифметический): `int8(-74) >> 1` = −37, `>> 4` = −5. Поэтому `-7 >> 1` = −4, а `-7 / 2` = −3: сдвиг округляет вниз, а деление — к нулю.",
          "Сдвиг на ширину типа и больше не паникует: все биты уходят за край, и остаётся 0; только отрицательное знаковое при сдвиге вправо даёт −1. Счётчик сдвига может быть знаковым (с Go 1.13), но отрицательный счётчик во время работы — паника «negative shift amount». Логического `>>>` из Java в Go нет: нужен логический сдвиг знакового — приведи его к беззнаковому, `uint8(s) >> 4`."
        ],
        rows: [
          { cmd: "x := uint8(0b0001_0110)", what: "22" },
          { cmd: "x << 1", what: "0010_1100 = 44: ×2" },
          { cmd: "x << 4", what: "0110_0000 = 96: бит 4 ушёл за край" },
          { cmd: "x >> 1", what: "0000_1011 = 11: ÷2" },
          { cmd: "x >> 3", what: "0000_0010 = 2: остаток отброшен" },
          { cmd: "s := int8(-74); s >> 1", what: "1101_1011 = −37: слева пришла копия знака" },
          { cmd: "s >> 4", what: "1111_1011 = −5" },
          { cmd: "uint8(s) >> 4", what: "0000_1011 = 11: у беззнакового слева нули" },
          { cmd: "-7 >> 1 и -7 / 2", what: "−4 и −3" },
          { cmd: "k := uint(8); x << k, s >> k", what: "0 и −1" }
        ]
      },
      {
        id: "masks",
        title: "5. Маски: сдвиг по маске",
        paragraphs: [
          "Маска — число, в котором единицы стоят ровно в нужных позициях: `1 << k` — один бит k, `0x0F` — младшие четыре, `0xF0` — старшие четыре, `1<<w - 1` — w единиц справа. Маска и оператор дают четыре действия над битом: проверить — `&`, поставить — `|`, снять — `&^`, переключить — `^`. В строках ниже `x = 1011_0110`.",
          "Вырезать поле — сдвиг и маска. «Сначала сдвиг, потом маска»: `(x >> 4) & 0x0F`; «сначала маска, потом сдвиг»: `(x & 0xF0) >> 4`. У беззнакового результат один. У знакового — нет: маску `0xF0` к `int8` даже не применить (240 не помещается в `int8`), а `int8(-74) >> 4` = −5, потому что слева пришли копии знака, и только маска после сдвига оставляет одно поле: `(s >> 4) & 0x0F` = 11. В этом и разница между сдвигом без маски и по маске.",
          "Записать поле: снять старое значение маской и поставить новое — `x &^ m | (v << k) & m`, где `m = (1<<w - 1) << k`. Маска на `v << k` не даёт лишним битам `v` испортить соседние."
        ],
        rows: [
          { cmd: "x & (1 << 2) != 0", what: "true: бит 2 стоит — проверить (Has)" },
          { cmd: "x & (1 << 3) != 0", what: "false: бита 3 нет" },
          { cmd: "x | (1 << 3)", what: "1011_1110: бит 3 поставлен (Set)" },
          { cmd: "x &^ (1 << 2)", what: "1011_0010: бит 2 снят (Clear)" },
          { cmd: "x ^ (1 << 0)", what: "1011_0111: бит 0 переключён (Toggle)" },
          { cmd: "(x >> 4) & 0x0F", what: "0000_1011 = 11: старшие четыре бита — сдвиг, потом маска (Field)" },
          { cmd: "(x & 0xF0) >> 4", what: "0000_1011 = 11: то же — маска, потом сдвиг" },
          { cmd: "SetField(x, 4, 4, 0b0101)", what: "0101_0110: в старшие четыре бита записано 0101" },
          { cmd: "int8(-74) >> 4", what: "1111_1011 = −5: без маски знак размножился" },
          { cmd: "(int8(-74) >> 4) & 0x0F", what: "0000_1011 = 11: по маске — только поле" }
        ]
      },
      {
        id: "tricks",
        title: "6. Приёмы с собеседований",
        paragraphs: [
          "`x & (x-1)` снимает младший единичный бит: вычитание единицы превращает младшую единицу в 0, а нули под ней — в единицы, и AND их убирает. Отсюда подсчёт единиц — по шагу на каждую (LC 191) — и проверка степени двойки `n&(n-1) == 0`: для беззнакового — вместе с `n != 0`, для знакового, как в LC 231, — с `n > 0`, иначе пройдёт и минимальное отрицательное число.",
          "`x & -x` оставляет только младший единичный бит: −x — это `^x + 1`. Получается значение этого бита (2 для x из таблицы), а его номер даёт `bits.TrailingZeros`.",
          "XOR: `a ^ a == 0`, `a ^ 0 == a`, порядок не важен. Пары взаимно уничтожаются, поэтому XOR всех чисел, где каждое встречается дважды, кроме одного, даёт это одно (LC 136); так же ищут пропущенное число (LC 268). Обмен через XOR в Go не нужен: `a, b = b, a`."
        ],
        rows: [
          { cmd: "x & (x-1)", what: "1011_0100: снят младший единичный бит (бит 1)" },
          { cmd: "x & -x", what: "0000_0010: остался только он" },
          { cmd: "x&1 == 0", what: "true: x чётное" },
          { cmd: "isPow2(64), isPow2(96)", what: "true, false: у 64 одна единица, у 96 — две" },
          { cmd: "4 ^ 1 ^ 2 ^ 1 ^ 2", what: "4: пары 1 и 2 сократились" }
        ]
      },
      {
        id: "mathbits",
        title: "7. Пакет math/bits",
        paragraphs: [
          "Не пиши руками то, что есть в `math/bits`. Основные функции — `OnesCount32` и `OnesCount64`, `LeadingZeros`, `TrailingZeros`, `Len`, `RotateLeft` — компилятор заменяет машинными инструкциями: на amd64 — POPCNT (при GOAMD64=v1 с проверкой процессора), BSR или LZCNT, BSF или TZCNT; на arm64 — VCNT и CLZ. 8-битные `OnesCount8`, `Len8` и `Reverse8` на amd64 — поиск по таблице, тоже быстрый. У большинства функций есть варианты для 8, 16, 32 и 64 бит и без числа — для `uint`.",
          "`RotateLeft` с отрицательным k вращает вправо. Для длинной арифметики — `Add64` с переносом, `Sub64` с заёмом и `Mul64`, который возвращает полное 128-битное произведение двумя словами. В строках ниже `x = 1011_0110`; `Reverse8(x)` здесь случайно совпал с `RotateLeft8(x, 1)` — для другого x они разные."
        ],
        rows: [
          { cmd: "bits.OnesCount8(x)", what: "5: столько единиц в x" },
          { cmd: "bits.LeadingZeros8(x)", what: "0: старший бит стоит" },
          { cmd: "bits.TrailingZeros8(x)", what: "1: младшая единица — в бите 1" },
          { cmd: "bits.Len8(x)", what: "8: значащих битов" },
          { cmd: "bits.RotateLeft8(x, 1)", what: "0110_1101: бит 7 переехал в бит 0" },
          { cmd: "bits.RotateLeft8(x, -1)", what: "0101_1011: вращение вправо" },
          { cmd: "bits.Reverse8(x)", what: "0110_1101: биты в обратном порядке" }
        ]
      },
      {
        id: "code",
        title: "8. Код и тренировка",
        paragraphs: [
          "Положи оба файла в `week3/bitops` своего go-prep. Каждый пример заканчивается комментарием `// Output:` — `go test` запускает пример и сравнивает напечатанное с ним построчно."
        ],
        files: [
          { name: "bitops.go", code: "// Package bitops — примеры справки «Биты в Go»: печать битов и маски на байте.\npackage bitops\n\nimport \"fmt\"\n\n// Bin печатает байт группами по четыре бита: 182 → \"1011_0110\".\nfunc Bin(x uint8) string {\n\ts := fmt.Sprintf(\"%08b\", x)\n\treturn s[:4] + \"_\" + s[4:]\n}\n\n// Has сообщает, стоит ли бит k (биты нумеруются справа, с нуля).\nfunc Has(x uint8, k uint) bool { return x&(1<<k) != 0 }\n\n// Set ставит бит k.\nfunc Set(x uint8, k uint) uint8 { return x | (1 << k) }\n\n// Clear снимает бит k.\nfunc Clear(x uint8, k uint) uint8 { return x &^ (1 << k) }\n\n// Toggle переключает бит k.\nfunc Toggle(x uint8, k uint) uint8 { return x ^ (1 << k) }\n\n// Field вырезает w битов, начиная с бита k: сначала сдвиг, потом маска.\nfunc Field(x uint8, k, w uint) uint8 { return (x >> k) & (1<<w - 1) }\n\n// SetField записывает v в w битов, начиная с бита k; остальные биты не меняются.\nfunc SetField(x uint8, k, w uint, v uint8) uint8 {\n\tm := uint8(1<<w-1) << k\n\treturn (x &^ m) | ((v << k) & m)\n}\n" },
          { name: "example_test.go", code: "package bitops\n\nimport (\n\t\"fmt\"\n\t\"math/bits\"\n)\n\nfunc Example_binary() {\n\tx := uint8(0b1011_0110)\n\tfmt.Println(x, Bin(x))\n\tfmt.Printf(\"%08b %x %o\\n\", x, x, x)\n\tfmt.Println(Bin(1 << 3))\n\t// Output:\n\t// 182 1011_0110\n\t// 10110110 b6 266\n\t// 0000_1000\n}\n\nfunc Example_overflow() {\n\tvar u uint8 = 200\n\tu += 100\n\tfmt.Println(\"uint8 200 + 100 =\", u)\n\tvar s int8 = 127\n\ts++\n\tfmt.Println(\"int8 127 + 1 =\", s)\n\tm := int8(-1)\n\tfmt.Println(\"int8 -1 =\", Bin(uint8(m)))\n\tn := int8(-74)\n\tfmt.Println(\"int8 -74 =\", Bin(uint8(n)), \"= ^74 + 1 =\", Bin(^uint8(74)+1))\n\t// Output:\n\t// uint8 200 + 100 = 44\n\t// int8 127 + 1 = -128\n\t// int8 -1 = 1111_1111\n\t// int8 -74 = 1011_0110 = ^74 + 1 = 1011_0110\n}\n\nfunc Example_operators() {\n\ta, b := uint8(0b1100_1010), uint8(0b1010_0110)\n\tfmt.Println(\"a      =\", Bin(a))\n\tfmt.Println(\"b      =\", Bin(b))\n\tfmt.Println(\"a & b  =\", Bin(a&b))\n\tfmt.Println(\"a | b  =\", Bin(a|b))\n\tfmt.Println(\"a ^ b  =\", Bin(a^b))\n\tfmt.Println(\"a &^ b =\", Bin(a&^b))\n\tfmt.Println(\"^a     =\", Bin(^a))\n\t// Output:\n\t// a      = 1100_1010\n\t// b      = 1010_0110\n\t// a & b  = 1000_0010\n\t// a | b  = 1110_1110\n\t// a ^ b  = 0110_1100\n\t// a &^ b = 0100_1000\n\t// ^a     = 0011_0101\n}\n\nfunc Example_shifts() {\n\tx := uint8(0b0001_0110)\n\tfmt.Println(\"x      =\", Bin(x), x)\n\tfmt.Println(\"x << 1 =\", Bin(x<<1), x<<1)\n\tfmt.Println(\"x << 4 =\", Bin(x<<4), x<<4)\n\tfmt.Println(\"x >> 1 =\", Bin(x>>1), x>>1)\n\tfmt.Println(\"x >> 3 =\", Bin(x>>3), x>>3)\n\ts := int8(-74)\n\tfmt.Println(\"s      =\", Bin(uint8(s)), s)\n\tfmt.Println(\"s >> 1 =\", Bin(uint8(s>>1)), s>>1)\n\tfmt.Println(\"s >> 4 =\", Bin(uint8(s>>4)), s>>4)\n\tfmt.Println(\"uint8(s) >> 4 =\", Bin(uint8(s)>>4), uint8(s)>>4)\n\tv := -7\n\tfmt.Println(\"-7 >> 1 =\", v>>1, \"  -7 / 2 =\", v/2)\n\tvar k uint = 8\n\tfmt.Println(\"x << 8 =\", x<<k, \"  s >> 8 =\", s>>k)\n\t// Output:\n\t// x      = 0001_0110 22\n\t// x << 1 = 0010_1100 44\n\t// x << 4 = 0110_0000 96\n\t// x >> 1 = 0000_1011 11\n\t// x >> 3 = 0000_0010 2\n\t// s      = 1011_0110 -74\n\t// s >> 1 = 1101_1011 -37\n\t// s >> 4 = 1111_1011 -5\n\t// uint8(s) >> 4 = 0000_1011 11\n\t// -7 >> 1 = -4   -7 / 2 = -3\n\t// x << 8 = 0   s >> 8 = -1\n}\n\nfunc Example_masks() {\n\tx := uint8(0b1011_0110)\n\tfmt.Println(\"x                =\", Bin(x))\n\tfmt.Println(\"Has(x, 2)        =\", Has(x, 2))\n\tfmt.Println(\"Has(x, 3)        =\", Has(x, 3))\n\tfmt.Println(\"Set(x, 3)        =\", Bin(Set(x, 3)))\n\tfmt.Println(\"Clear(x, 2)      =\", Bin(Clear(x, 2)))\n\tfmt.Println(\"Toggle(x, 0)     =\", Bin(Toggle(x, 0)))\n\tfmt.Println(\"Field(x, 4, 4)   =\", Bin(Field(x, 4, 4)))\n\tfmt.Println(\"(x & 0xF0) >> 4  =\", Bin((x&0xF0)>>4))\n\tfmt.Println(\"SetField(x, 4, 4, 0b0101) =\", Bin(SetField(x, 4, 4, 0b0101)))\n\ts := int8(-74)\n\tfmt.Println(\"s >> 4           =\", Bin(uint8(s>>4)), s>>4)\n\tfmt.Println(\"(s >> 4) & 0x0F  =\", Bin(uint8((s>>4)&0x0F)), (s>>4)&0x0F)\n\t// Output:\n\t// x                = 1011_0110\n\t// Has(x, 2)        = true\n\t// Has(x, 3)        = false\n\t// Set(x, 3)        = 1011_1110\n\t// Clear(x, 2)      = 1011_0010\n\t// Toggle(x, 0)     = 1011_0111\n\t// Field(x, 4, 4)   = 0000_1011\n\t// (x & 0xF0) >> 4  = 0000_1011\n\t// SetField(x, 4, 4, 0b0101) = 0101_0110\n\t// s >> 4           = 1111_1011 -5\n\t// (s >> 4) & 0x0F  = 0000_1011 11\n}\n\nfunc Example_tricks() {\n\tx := uint8(0b1011_0110)\n\tfmt.Println(\"x & (x-1) =\", Bin(x&(x-1)))\n\tfmt.Println(\"x & -x    =\", Bin(x&-x))\n\tfmt.Println(\"x&1 == 0  =\", x&1 == 0)\n\tisPow2 := func(n uint) bool { return n != 0 && n&(n-1) == 0 }\n\tfmt.Println(\"isPow2(64), isPow2(96) =\", isPow2(64), isPow2(96))\n\tsingle := 0\n\tfor _, v := range []int{4, 1, 2, 1, 2} {\n\t\tsingle ^= v\n\t}\n\tfmt.Println(\"4^1^2^1^2 =\", single)\n\t// Output:\n\t// x & (x-1) = 1011_0100\n\t// x & -x    = 0000_0010\n\t// x&1 == 0  = true\n\t// isPow2(64), isPow2(96) = true false\n\t// 4^1^2^1^2 = 4\n}\n\nfunc Example_mathBits() {\n\tx := uint8(0b1011_0110)\n\tfmt.Println(\"OnesCount8     =\", bits.OnesCount8(x))\n\tfmt.Println(\"LeadingZeros8  =\", bits.LeadingZeros8(x))\n\tfmt.Println(\"TrailingZeros8 =\", bits.TrailingZeros8(x))\n\tfmt.Println(\"Len8           =\", bits.Len8(x))\n\tfmt.Println(\"RotateLeft8(x, 1)  =\", Bin(bits.RotateLeft8(x, 1)))\n\tfmt.Println(\"RotateLeft8(x, -1) =\", Bin(bits.RotateLeft8(x, -1)))\n\tfmt.Println(\"Reverse8(x)        =\", Bin(bits.Reverse8(x)))\n\t// Output:\n\t// OnesCount8     = 5\n\t// LeadingZeros8  = 0\n\t// TrailingZeros8 = 1\n\t// Len8           = 8\n\t// RotateLeft8(x, 1)  = 0110_1101\n\t// RotateLeft8(x, -1) = 0101_1011\n\t// Reverse8(x)        = 0110_1101\n}\n" }
        ],
        steps: [
          { cmd: "go test -v ./week3/bitops", expect: "=== RUN   Example_binary\n--- PASS: Example_binary (0.00s)\n… семь примеров, все PASS\nok  github.com/<ник>/go-prep/week3/bitops", q: "Как пример проверяет вывод и что будет, если ты ошибся в ожидании?", a: "go test сравнивает напечатанное с комментарием // Output: построчно. Не совпало — FAIL и два блока, got: и want:. Так каждая строка справки проверена запуском." },
          { cmd: "go test -v -run 'Example_masks' ./week3/bitops", expect: "--- PASS: Example_masks — после того как ты заменишь x на 0b0110_1001 и впишешь в // Output: свои ожидания", q: "Замени в Example_masks x на 0b0110_1001 и до запуска перепиши Output по памяти. Сколько строк угадал?", a: "Для 0110_1001: Has(x, 2) — false, Has(x, 3) — true, Set(x, 3) — 0110_1001, Clear(x, 2) — 0110_1001, Toggle(x, 0) — 0110_1000, Field(x, 4, 4) и (x & 0xF0) >> 4 — 0000_0110, SetField(x, 4, 4, 0b0101) — 0101_1001. Типичные ошибки — забыть, что биты нумеруются справа с нуля, и что Set уже стоящего бита ничего не меняет." }
        ]
      },
      {
        id: "jvm",
        title: "9. Если сравнивать с Java и Kotlin",
        rows: [
          { cmd: "^x", what: "Java ~x, Kotlin x.inv()" },
          { cmd: "a &^ b", what: "Java a & ~b, Kotlin a and b.inv()" },
          { cmd: "x >> n у знакового", what: "Java >>, Kotlin shr — тоже арифметический" },
          { cmd: "uint32(x) >> n", what: "Java >>>, Kotlin ushr — логический; в Go для него нужен беззнаковый тип" },
          { cmd: "uint8 … uint64", what: "в Java нет беззнаковых byte, short, int и long — byte от −128 до 127, беззнаковый только 16-битный char; в Kotlin есть UByte … ULong" },
          { cmd: "x&1 == 0", what: "в Java x & 1 == 0 не компилируется: == связывает сильнее, нужны скобки" }
        ]
      },
      {
        id: "say",
        title: "10. Сказать на интервью",
        paragraphs: [
          "Bitwise operators work on each bit position: AND keeps common bits, OR merges them, XOR keeps the differing ones, and Go adds AND NOT, which clears the bits of the right operand. A mask selects positions: OR sets a bit, AND NOT clears it, XOR toggles it, and AND tests it. A right shift of a signed value copies the sign bit, so I convert to an unsigned type when I need a logical shift. Overflow wraps around instead of panicking."
        ],
        links: [
          { t: "Spec: Arithmetic operators", u: "https://go.dev/ref/spec#Arithmetic_operators" },
          { t: "Spec: Operator precedence", u: "https://go.dev/ref/spec#Operator_precedence" },
          { t: "Spec: Integer overflow", u: "https://go.dev/ref/spec#Integer_overflow" },
          { t: "Spec: Integer literals", u: "https://go.dev/ref/spec#Integer_literals" },
          { t: "Package math/bits", u: "https://pkg.go.dev/math/bits" }
        ]
      }
    ]
  },
  "week3-reviews": {
    title: "Разборы недели 3: чужой код и эталон W1-2",
    intro: [
      "Два разбора на закрепление недель 1–2. Первый — чужой код: он компилируется и проходит `go vet`, но шесть тестов падают; найди ошибки до ответа. Второй — эталон W1-2 и альтернативы: какие решения в нём приняты и когда выбрать другое."
    ],
    sections: [
      {
        id: "code",
        title: "1. Разбор 1: чужой код",
        paragraphs: [
          "Положи `review.go` и `review_test.go` в `week3/review` своего go-prep и запусти тесты. Падают все шесть, а `go vet` молчит: такие ошибки ловят тест и ревью, а не инструменты. Пока разбор не закончен, `go test ./...` в go-prep красный — так и задумано.",
          "Порядок: прочитай код и выпиши подозрения до запуска. Потом бери по одному падающему тесту, называй причину вслух, исправляй и запускай снова: с каждой правкой красных тестов на один меньше. Ответ к шагу открывай после своей попытки."
        ],
        files: [
          { name: "review.go", code: "// Package review — чужой код на разбор недели 3: он компилируется, тесты в review_test.go падают.\n// В нём шесть ошибок из недель 1–2; найди каждую до того, как открыть ответ.\npackage review\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n)\n\n// ErrInsufficient — средств на кошельке меньше, чем просят.\nvar ErrInsufficient = errors.New(\"insufficient funds\")\n\n// Wallet — кошелёк с балансом.\ntype Wallet struct {\n\tID      string\n\tBalance float64\n}\n\n// Withdraw снимает amount, если баланс позволяет.\nfunc (w Wallet) Withdraw(amount float64) error {\n\tif amount > w.Balance {\n\t\treturn fmt.Errorf(\"withdraw %.2f from %s: %v\", amount, w.ID, ErrInsufficient)\n\t}\n\tw.Balance -= amount\n\treturn nil\n}\n\n// IsInsufficient сообщает, что операция отказала из-за нехватки средств.\nfunc IsInsufficient(err error) bool {\n\treturn err == ErrInsufficient\n}\n\n// NotFoundError — кошелька с таким ID нет.\ntype NotFoundError struct{ ID string }\n\nfunc (e *NotFoundError) Error() string { return \"wallet \" + e.ID + \" not found\" }\n\n// Store хранит кошельки по ID.\ntype Store struct {\n\twallets map[string]*Wallet\n}\n\n// NewStore возвращает пустое хранилище.\nfunc NewStore() *Store {\n\treturn &Store{}\n}\n\n// Put сохраняет кошелёк.\nfunc (s *Store) Put(w *Wallet) {\n\ts.wallets[w.ID] = w\n}\n\n// Get возвращает кошелёк или *NotFoundError.\nfunc (s *Store) Get(id string) (*Wallet, error) {\n\tvar nf *NotFoundError\n\tw, ok := s.wallets[id]\n\tif !ok {\n\t\tnf = &NotFoundError{ID: id}\n\t}\n\treturn w, nf\n}\n\n// Safe выполняет f и превращает её панику в ошибку.\nfunc Safe(f func()) (err error) {\n\tdefer func() {\n\t\ttoError(&err)\n\t}()\n\tf()\n\treturn nil\n}\n\nfunc toError(err *error) {\n\tif r := recover(); r != nil {\n\t\t*err = fmt.Errorf(\"recovered: %v\", r)\n\t}\n}\n" },
          { name: "review_test.go", code: "package review\n\nimport (\n\t\"errors\"\n\t\"fmt\"\n\t\"testing\"\n)\n\nfunc TestWithdrawChangesBalance(t *testing.T) {\n\tw := &Wallet{ID: \"A\", Balance: 100}\n\tif err := w.Withdraw(30); err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif w.Balance != 70 {\n\t\tt.Fatalf(\"after Withdraw(30) Balance = %v, want 70\", w.Balance)\n\t}\n}\n\nfunc TestWithdrawErrorWraps(t *testing.T) {\n\tw := &Wallet{ID: \"A\", Balance: 10}\n\tif err := w.Withdraw(30); !errors.Is(err, ErrInsufficient) {\n\t\tt.Fatalf(\"errors.Is(%v, ErrInsufficient) = false\", err)\n\t}\n}\n\nfunc TestIsInsufficientAfterWrapping(t *testing.T) {\n\terr := fmt.Errorf(\"transfer A→B: %w\", ErrInsufficient)\n\tif !IsInsufficient(err) {\n\t\tt.Fatalf(\"IsInsufficient(%v) = false\", err)\n\t}\n}\n\nfunc TestPut(t *testing.T) {\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\tt.Fatalf(\"Put panicked: %v\", r)\n\t\t}\n\t}()\n\tNewStore().Put(&Wallet{ID: \"A\"})\n}\n\nfunc TestGetFound(t *testing.T) {\n\ts := &Store{wallets: map[string]*Wallet{\"A\": {ID: \"A\"}}}\n\tw, err := s.Get(\"A\")\n\tif err != nil || w == nil {\n\t\tt.Fatalf(\"Get(A) = %v, %v, want the wallet and a nil error\", w, err)\n\t}\n}\n\nfunc TestSafeRecovers(t *testing.T) {\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\tt.Fatalf(\"the panic escaped Safe: %v\", r)\n\t\t}\n\t}()\n\tif err := Safe(func() { panic(\"boom\") }); err == nil {\n\t\tt.Fatal(\"Safe returned nil after a panic\")\n\t}\n}\n" }
        ],
        steps: [
          { cmd: "go test -run TestWithdrawChangesBalance ./week3/review", expect: "review_test.go:15: after Withdraw(30) Balance = 100, want 70", q: "Почему баланс не изменился?", a: "Withdraw объявлен на ресивере-значении: метод уменьшает копию кошелька, а не сам кошелёк. Исправление — func (w *Wallet) Withdraw. Метод, который меняет состояние, — на указателе (неделя 1, W1-2)." },
          { cmd: "go test -run TestWithdrawErrorWraps ./week3/review", expect: "review_test.go:22: errors.Is(withdraw 30.00 from A: insufficient funds, ErrInsufficient) = false", q: "Текст ErrInsufficient в ошибке есть — почему errors.Is его не находит?", a: "%v вставляет только текст: в цепочке Unwrap ErrInsufficient нет. Нужен %w (неделя 2)." },
          { cmd: "go test -run TestIsInsufficientAfterWrapping ./week3/review", expect: "review_test.go:29: IsInsufficient(transfer A→B: insufficient funds) = false", q: "IsInsufficient сравнивает с sentinel — что не так?", a: "err == ErrInsufficient ломается после первой обёртки: обёрнутая ошибка — другое значение. Нужен errors.Is(err, ErrInsufficient), он проходит по цепочке (неделя 2)." },
          { cmd: "go test -run TestPut ./week3/review", expect: "review_test.go:36: Put panicked: assignment to entry in nil map", q: "Почему Put паникует?", a: "NewStore возвращает Store с нулевой map: читать из nil map можно, писать — паника. Исправление — wallets: make(map[string]*Wallet) в NewStore (неделя 2, map по спецификации)." },
          { cmd: "go test -run TestGetFound ./week3/review", expect: "review_test.go:46: Get(A) = &{A 0}, <nil>, want the wallet and a nil error", q: "Ошибка печатается как <nil>, но тест считает её не nil. Почему?", a: "Get возвращает переменную типа *NotFoundError: в интерфейсе error лежат тип *NotFoundError и nil-указатель, а такой интерфейс не равен nil (неделя 1, typed nil). fmt вызывает Error() на nil-указателе, метод паникует на e.ID, а fmt перехватывает панику и печатает <nil> — это и сбивает. Исправление: когда кошелёк найден — return w, nil, когда нет — return nil, &NotFoundError{ID: id}." },
          { cmd: "go test -run TestSafeRecovers ./week3/review", expect: "review_test.go:53: the panic escaped Safe: boom", q: "recover в коде есть — почему паника прошла?", a: "recover останавливает панику, только если его вызывает сама отложенная функция. Здесь его вызывает toError, которую вызывает отложенная функция, и recover возвращает nil. Исправление — вызвать recover прямо в отложенной функции: defer func() { if r := recover(); r != nil { err = fmt.Errorf(\"recovered: %v\", r) } }() (неделя 2). Можно и короче: defer toError(&err) — тогда отложенная функция сама toError, и recover в ней работает." }
        ],
        check: "Готово, когда шесть причин названы до ответа, а после шести правок go test ./week3/review зелёный. И седьмое — без теста: Balance float64. Тесты проходят на круглых суммах, но у float64 0.1 + 0.2 = 0.30000000000000004: с Balance 0.30 после Withdraw(0.10) остаётся 0.19999999999999998, и Withdraw(0.20) уже отказывает. Деньги хранят целым числом минорных единиц (W1-1)."
      },
      {
        id: "reference",
        title: "2. Разбор 2: эталон W1-2 и альтернативы",
        paragraphs: [
          "Открой эталон W1-2 (страница задачи, «Эталонное решение») и по каждой строке ниже скажи вслух: почему так и когда выбрал бы другое. На интервью это частый вопрос после задачи: «а если…»."
        ],
        rows: [
          { cmd: "func (a *Account) Deposit(…)", what: "Указатель: метод меняет баланс. Альтернатива — неизменяемый счёт, Deposit возвращает новый Account. Это честно для значений, но Transfer тогда возвращает два новых счёта, и вызывающий может забыть сохранить один." },
          { cmd: "ErrInsufficientFunds — sentinel", what: "Вызывающему достаточно ветвиться по причине. Нужны числа — сколько не хватило — тогда тип *InsufficientFundsError{Need, Have} и errors.As (W2-1); sentinel и тип можно совместить методом Is у типа." },
          { cmd: "fmt.Errorf(\"withdraw %d from %s (balance %d): %w\", …)", what: "Контекст плюс причина в цепочке. Одна обёртка на уровень и лог один раз наверху: если каждый уровень и логирует, и оборачивает, одна ошибка попадёт в лог несколько раз." },
          { cmd: "Transfer: Withdraw, потом Deposit и откат", what: "Откат вручную работает, пока всё в памяти и в одной горутине. В базе — одна транзакция на перевод; в распределённой системе — проводки ledger и outbox (недели 7–10)." },
          { cmd: "Мьютекса нет", what: "Счёт не потокобезопасен. Мьютекс на счёт, а перевод между двумя счетами — блокировки в порядке ID, иначе взаимная блокировка (W8-1)." },
          { cmd: "int64 в минорных единицах", what: "Точно и быстро для сумм одной валюты. Деление и проценты — отдельной функцией с явным правилом остатка (W3-3 Allocate) или десятичным типом." },
          { cmd: "Повтор запроса клиентом", what: "Transfer не идемпотентен: повтор после таймаута спишет деньги дважды. Ключ идемпотентности и сохранённый ответ — W8-2." }
        ],
        check: "Готово, когда по каждой строке есть своя фраза «так, потому что… — иначе, если…» и одна из них проговорена по-английски."
      },
      {
        id: "say",
        title: "3. Как разбирать чужой код на интервью",
        paragraphs: [
          "Сначала контракт: что код обещает вызывающему. Потом изменения состояния — ресиверы, map, общие данные; потом ошибки — оборачивание, сравнение, typed nil; потом паники и ресурсы — defer, recover, закрытие. Каждое замечание — с последствием: «баланс не меняется», «errors.Is перестанет находить причину».",
          "I start with the contract, then look at state changes, error handling and panics. For each finding I name the consequence and a fix: this method has a value receiver, so the balance never changes; this error is formatted with %v, so callers cannot match it with errors.Is."
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
  "g-go-testing-drill": { guide: "go-testing", section: "drill", label: "Тесты в Go: тренировка «сломай и поймай» на W1-2" },
  "g-go-bits": { guide: "go-bits", section: null, label: "Биты в Go: операторы, сдвиги, маски" },
  "g-go-bits-shifts": { guide: "go-bits", section: "shifts", label: "Биты в Go: сдвиги без маски" },
  "g-go-bits-masks": { guide: "go-bits", section: "masks", label: "Биты в Go: маски и сдвиг по маске" },
  "g-go-bits-tricks": { guide: "go-bits", section: "tricks", label: "Биты в Go: приёмы и math/bits" },
  "g-week3-reviews": { guide: "week3-reviews", section: null, label: "Разборы недели 3: чужой код и эталон W1-2" },
  "g-week3-review-1": { guide: "week3-reviews", section: "code", label: "Разбор 1: чужой код с шестью ошибками" },
  "g-week3-review-2": { guide: "week3-reviews", section: "reference", label: "Разбор 2: эталон W1-2 и альтернативы" }
};
