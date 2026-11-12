// v94: inserts the "Тесты в Go" guide into data/guides.js. File code comes from the fixtures byte for byte
// (go-prep/week1/calc and v94/drill), the module path github.com/you → github.com/<ник> as on the go-prep page.
// One-off: run once from the repository root, `node docs/verification/v94/add-guide.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const calc = name => ({ name, code: read(`docs/verification/fixtures/go-prep/week1/calc/${name}`).replaceAll('github.com/you/', 'github.com/<ник>/') });

const guide = {
  title: 'Тесты в Go: table-driven, подтесты, тренировка',
  intro: [
    'Справка к неделе 1 (суббота) и неделе 3: как устроен тест в Go, table-driven тест на двух образцах, подтесты и хелперы, ещё три вида тестов и тренировка «сломай и поймай» на своём W1-2. Ответ для интервью коротко — карточка c44, ловушка с `defer` — quiz q35.',
    'Образцы — пакет `week1/calc` твоего go-prep, рядом с `calc.go` и `calc_test.go` из понедельника. Код и выводы проверены на Go 1.24.7 и 1.27.3; время и числа бенчмарка у тебя будут свои.'
  ],
  sections: [
    {
      id: 'basics',
      title: '1. Как устроен тест',
      paragraphs: [
        'Тест — функция `func TestXxx(t *testing.T)` в файле `_test.go` рядом с кодом. Такие файлы собирает только `go test`, в обычную сборку они не попадают. После `Test` — не строчная буква: `Testdiv` `go test` не соберёт, встроенная в него проверка vet ответит «malformed name» (с Go 1.24; раньше такая функция молча не запускалась).',
        'Библиотеки утверждений в стандартной библиотеке нет: проверка — обычный `if`, а сообщение строят по шаблону «вызов = что получили, want что ждали»: `Div(-7, 2) = -4, want -3`. По такой строке ошибку понятно, не открывая тест. В JUnit порядок обратный: `assertEquals(expected, actual)`.',
        '`t.Errorf` отмечает провал и идёт дальше — видно все расхождения за один прогон. `t.Fatalf` останавливает тест — когда дальше проверять бессмысленно, например функция вернула ошибку вместо значения. `Fatal` вызывают только из горутины самого теста; вызов из горутины, которую тест запустил, ловит полный `go vet`, а встроенный в `go test` — нет.',
        'Тест в `package calc` видит неэкспортированное. Файл в той же папке с `package calc_test` — внешний пакет: видит только экспортированное, как пользователь пакета (так написан `example_test.go` в разделе 5).',
        'Сравнение: `==` — для сравнимых типов; срезы и map — `slices.Equal` и `maps.Equal` (справка «Типы Go»), вложенные структуры — `reflect.DeepEqual`. Ошибки — через `errors.Is` и `errors.As`, не по тексту: текст бывает одинаковым, а цепочка — разной (раздел 6, мутант 1).',
        'Если сравнивать с JUnit: `@ParameterizedTest` — table-driven тест, `@BeforeEach` и `@AfterEach` — хелпер и `t.Cleanup`, `@Disabled` и `assumeTrue` — `t.Skip`: пропуск решается во время выполнения.'
      ]
    },
    {
      id: 'table',
      title: '2. Table-driven тест. Образец 1: значения и ошибки',
      paragraphs: [
        'Table-driven тест — один тест на много случаев. Случаи — срез структур: имя, вход, ожидание; цикл запускает каждый случай подтестом через `t.Run`. Новый случай — одна строка таблицы, в провале видно его имя, а `-run` перезапускает один случай.',
        'Ожидаемая ошибка — поле `wantErr error`. `errors.Is(nil, nil)` возвращает true, поэтому одна проверка покрывает и «ошибки нет», и «ждём `ErrDivByZero`». Сначала ошибка через `Fatalf` — при неверной ошибке значение смотреть незачем, потом значение через `Errorf`. Если у ошибки нет sentinel — поле `wantErr bool`, как в тестах W3-4.',
        'Положи `div.go` и `div_test.go` в `week1/calc`. Шаг 3 — с поломкой: в `div.go` замени `a / b` на `int(math.Floor(float64(a) / float64(b)))` и добавь импорт `math`; после шага верни как было.'
      ],
      files: [calc('div.go'), calc('div_test.go')],
      steps: [
        {
          cmd: 'go test -v -run TestDiv ./week1/calc',
          expect: '=== RUN   TestDiv\n=== RUN   TestDiv/exact\n=== RUN   TestDiv/drops_the_fraction\n=== RUN   TestDiv/negative_rounds_toward_zero\n=== RUN   TestDiv/by_zero\n--- PASS: TestDiv (0.00s) и под ним четыре --- PASS по случаям',
          q: 'Откуда подчёркивания в именах подтестов?',
          a: 't.Run заменяет пробелы в имени на _. В -run имя подтеста пишут с подчёркиваниями; пробел тоже сработает — шаблон проходит ту же замену.'
        },
        {
          cmd: "go test -v -run 'TestDiv/by_zero' ./week1/calc",
          expect: '=== RUN   TestDiv\n=== RUN   TestDiv/by_zero\n--- PASS: TestDiv (0.00s)\n    --- PASS: TestDiv/by_zero (0.00s)',
          q: 'Как -run выбирает подтест и что запустит -run Div?',
          a: 'Шаблон делится по / на уровни: первая часть — регулярное выражение для имени теста, вторая — для подтеста. Без ^ и $ совпадение ищется в любом месте имени, а -run выбирает и тесты, и примеры, и fuzz-тесты: -run Div запустит TestDiv, ExampleDiv и затравки FuzzDiv из раздела 5.'
        },
        {
          cmd: 'go test -run TestDiv ./week1/calc',
          expect: '--- FAIL: TestDiv (0.00s)\n    --- FAIL: TestDiv/negative_rounds_toward_zero (0.00s)\n        div_test.go:27: Div(-7, 2) = -4, want -3\nFAIL',
          q: 'Почему упал только отрицательный случай?',
          a: 'Оператор / в Go отбрасывает дробь к нулю: -7 / 2 = -3, как в Java и Kotlin. Floor округляет вниз, до -4; на положительных числах разницы нет. Отрицательные и граничные случаи в таблице для этого и нужны. Верни a / b.'
        }
      ]
    },
    {
      id: 'subtests',
      title: '3. Образец 2: таблица-map, t.Parallel и хелпер',
      paragraphs: [
        'Таблица бывает и map: имя случая — ключ, повторить имя нельзя. Порядок обхода map меняется от запуска к запуску, поэтому скрытая зависимость случаев друг от друга рано или поздно проявится — не в каждом прогоне.',
        '`t.Parallel()` ставит подтест на паузу (`PAUSE` в выводе `-v`) до конца функции родителя, потом подтесты идут одновременно (`CONT`). Каждому подтесту — только свои данные: с Go 1.22 у каждой итерации цикла своя `tt`, копия `tt := tt` нужна при директиве `go` ниже 1.22 в go.mod.',
        '`defer` в родителе срабатывает раньше параллельных подтестов, `t.Cleanup` — после них: общий ресурс закрывают через `t.Cleanup` (quiz q35).',
        '`checkClamp` — хелпер: принимает `t` первым параметром и сам сообщает о провале. `t.Helper()` переносит строку в сообщении на место вызова: провал указывает на код теста, а не внутрь хелпера. Какой случай упал, говорит имя подтеста — `TestClamp/above`. `clamp.go` использует встроенные `min` и `max` (Go 1.21).',
        'Шаг 2 — с поломкой: у случая `"above"` поставь `want: 11`, прогони, затем удали строку `t.Helper()` и прогони ещё раз; после шага верни как было.'
      ],
      files: [calc('clamp.go'), calc('clamp_test.go')],
      steps: [
        {
          cmd: 'go test -v -run TestClamp ./week1/calc',
          expect: '=== RUN и === PAUSE по каждому случаю, затем === CONT по каждому, --- PASS: TestClamp (0.00s) и под ним пять --- PASS; порядок случаев от запуска к запуску разный',
          q: 'Почему порядок подтестов меняется?',
          a: 'Порядок обхода map не задан, а параллельные подтесты выполняются одновременно и заканчиваются в любом порядке. Тест не должен зависеть от порядка случаев.'
        },
        {
          cmd: 'go test -run TestClamp ./week1/calc',
          expect: 'С t.Helper(): --- FAIL: TestClamp/above и clamp_test.go:18: Clamp(42, 0, 10) = 10, want 11 — строка вызова checkClamp в теле подтеста. Без него: clamp_test.go:26 — строка t.Errorf внутри checkClamp.',
          q: 'Какая строка полезнее и почему?',
          a: 'Строка вызова: она в коде теста. Если хелпер зовут из нескольких мест — несколько проверок подряд или разные тесты, как newAccount в разделе 7, — она показывает, какой вызов упал; строка внутри хелпера одна на все вызовы. В таблице вызов один на все случаи, и случай называет имя подтеста.'
        }
      ]
    },
    {
      id: 'helpers',
      title: '4. Что ещё даёт testing.T',
      paragraphs: ['Самое нужное на каждый день; в скобках — версия Go, с которой метод есть.'],
      rows: [
        { cmd: 't.Helper()', what: 'строка провала — у вызывающего, а не внутри хелпера (1.9)' },
        { cmd: 't.Cleanup(f)', what: 'f выполнится после теста и всех его подтестов; несколько функций — в обратном порядке, последняя добавленная первой (1.14)' },
        { cmd: 't.TempDir()', what: 'свой временный каталог, удаляется после теста и его подтестов (1.15)' },
        { cmd: 't.Setenv(k, v)', what: 'переменная окружения на время теста; с t.Parallel несовместим — тест падает с паникой (1.17)' },
        { cmd: 't.Context()', what: 'контекст теста, отменяется перед функциями t.Cleanup (1.24)' },
        { cmd: 't.Chdir(dir)', what: 'рабочий каталог на время теста; с t.Parallel тоже несовместим (1.24)' },
        { cmd: 't.Skip("причина")', what: 'пропустить тест: нет внешней зависимости или testing.Short() при go test -short' },
        { cmd: 't.Log(…)', what: 'печатается при -v или если тест упал' },
        { cmd: 'func TestMain(m *testing.M)', what: 'общая подготовка всего пакета; m.Run() запускает тесты. С Go 1.15 os.Exit(m.Run()) писать не нужно' },
        { cmd: 'go test -shuffle=on ./...', what: 'тесты верхнего уровня в случайном порядке: ловит зависимость от порядка (1.17)' }
      ]
    },
    {
      id: 'kinds',
      title: '5. Ещё три вида: Example, Benchmark, Fuzz',
      paragraphs: [
        '`ExampleDiv` — пример и тест сразу. `go test` запускает его и сравнивает напечатанное с комментарием `// Output:` (пробелы по краям не важны); без комментария пример только компилируется. На pkg.go.dev он попадает в документацию `Div`. Имя связывает пример с идентификатором: на `ExampleDvi` встроенный vet ответит «refers to unknown identifier» (тоже с Go 1.24). Файл — во внешнем пакете `calc_test`, в импорте — твой путь модуля.',
        '`BenchmarkDiv` с циклом `for b.Loop()` (Go 1.24): подготовка до цикла в замер не входит, а вызовы внутри цикла компилятор не выбросит. До 1.24 писали `for i := 0; i < b.N; i++`, и о том, чтобы результат не выбросили, заботился автор. Бенчмарки идут только с флагом `-bench`.',
        '`FuzzDiv` проверяет свойство на входах, которые подбирает Go (с 1.18). Затравки из `f.Add` идут подтестами при каждом `go test` (`FuzzDiv/seed#1`). С `-fuzz` Go генерирует новые входы, найденный провал сохраняет в `testdata/fuzz/FuzzDiv/` и дальше прогоняет его в каждом `go test`. Фаззер находит быстро, но не всё: `Div` как `int(float64(a) / float64(b))` верна до 2^53 и ошибается дальше, например на `Div(1<<53+1, 1)`; за 30 с наш прогон такой вход не нашёл — целые фаззер меняет небольшими шагами от затравок. Такие границы пишут в таблицу руками.',
        'Шаг 3 — с поломкой: в `Div` перед делением добавь `if b < 0 { b = -b }` (потерян знак делителя). Таблица и затравки отрицательный делитель не проверяют, обычный `go test` останется зелёным. После шага верни как было.'
      ],
      files: [calc('example_test.go'), calc('bench_test.go'), calc('fuzz_test.go')],
      steps: [
        {
          cmd: 'go test -v -run ExampleDiv ./week1/calc',
          expect: '=== RUN   ExampleDiv\n--- PASS: ExampleDiv (0.00s)',
          q: 'Что будет, если в // Output: заменить 3 на 3.5?',
          a: '--- FAIL: ExampleDiv и два блока, got: и want:, — напечатанное и ожидаемое. Пример проверяет документацию: она не устареет молча.'
        },
        {
          cmd: "go test -bench=Div -benchmem -run='^$' ./week1/calc",
          expect: 'BenchmarkDiv-12   604828929   2.035 ns/op   0 B/op   0 allocs/op (числа — твои)',
          q: "Зачем -run='^$' и что значит -12?",
          a: '-run выбирает тесты; ^$ не совпадает ни с одним именем, поэтому идут только бенчмарки. -12 — GOMAXPROCS на время прогона, сколько потоков одновременно выполняют Go-код (при 1 суффикса нет). По умолчанию — число логических процессоров, доступных процессу; с Go 1.25 на Linux учитывается и лимит CPU в cgroup (карточка c7).'
        },
        {
          cmd: "go test -run '^$' -fuzz=FuzzDiv -fuzztime=30s ./week1/calc",
          expect: '--- FAIL: FuzzDiv (0.02s)\n    --- FAIL: FuzzDiv (0.00s)\n        fuzz_test.go:22: Div(80, -43) = 1, <nil>\n    Failing input written to testdata/fuzz/FuzzDiv/0191a6f2fffab736\n    To re-run:\n    go test -run=FuzzDiv/0191a6f2fffab736\nFAIL — вход и имя файла у тебя свои; у нас нашлось меньше чем за секунду',
          q: 'Что изменилось для обычного go test?',
          a: 'Найденный вход лежит в testdata/fuzz/FuzzDiv/ и идёт в каждом go test подтестом FuzzDiv/<имя файла>: тест красный, пока не вернёшь знак. Файл коммитят вместе с исправлением. -fuzz работает только на одном пакете: с ./... Go ответит cannot use -fuzz flag with multiple packages.'
        }
      ]
    },
    {
      id: 'drill',
      title: '6. Тренировка: сломай и поймай (W1-2)',
      paragraphs: [
        'Тест хорош, если падает на неверном коде. Проверь это на своём W1-2: в `week1/account` go-prep — твоё решение и `account_test.go` со страницы задачи. Мутанты 1 и 2 — ошибки из «Частых ошибок» на странице задачи, мутант 3 — ошибка на границе. Каждый внеси, прогони тесты, верни как было.',
        'Мутант 1 — в `Withdraw` `%w` заменить на `%v`. Мутант 2 — `Deposit` на ресивере-значении: `func (a Account) Deposit`. Мутант 3 — в `Withdraw` условие нехватки `amount > a.balance` заменить на `amount >= a.balance`; если условие у тебя записано иначе — сломай так, чтобы снять ровно весь баланс стало нельзя.',
        'Первые два мутанта тесты ловят. Третий — нет: напиши на него `TestWithdraw` таблицей сам, образец — в разделе 7.'
      ],
      steps: [
        {
          cmd: 'go test ./week1/account',
          expect: 'Мутант 1:\n--- FAIL: TestInsufficientFundsIsWrapped (0.00s)\n    account_test.go:40: errors.Is(withdraw 500 from A (balance 100): insufficient funds, ErrInsufficientFunds) = false\n--- FAIL: TestTwoLevelsOfWrapping (0.00s)',
          q: 'Текст ошибки прежний. Почему упали два теста?',
          a: '%v вставляет в сообщение только текст: в цепочке Unwrap больше нет ErrInsufficientFunds, и errors.Is её не находит — ни у Withdraw, ни через обёртку Transfer. Поэтому ошибки проверяют через errors.Is, а не по тексту.'
        },
        {
          cmd: 'go vet ./week1/account && go test ./week1/account',
          expect: 'Мутант 2: vet молчит; FAIL у пяти тестов, первый — TestDepositWithdraw: account_test.go:16: withdraw 300 from A (balance 0): insufficient funds',
          q: 'Почему не возразили ни компилятор, ни vet?',
          a: 'Метод на ресивере-значении — законный Go: Deposit пополняет копию и возвращает nil. Ошибку видно только по балансу после вызова — его и проверяют тесты.'
        },
        {
          cmd: 'go test -cover ./week1/account',
          expect: 'Мутант 3: ok и то же покрытие, что без мутанта (у эталона — coverage: 88.2% of statements).',
          q: 'Тесты зелёные, покрытие прежнее. Мутант безобиден?',
          a: 'Нет: снять ровно весь баланс теперь нельзя. Строка с условием выполняется, но ни один тест не снимает ровно баланс. Покрытие считает выполненные операторы (statements), а не проверенные случаи. Нужен случай на границе — таблица TestWithdraw.'
        },
        {
          cmd: 'go test -race -run TestWithdraw ./week1/account',
          expect: 'С мутантом 3:\n--- FAIL: TestWithdraw (0.00s)\n    --- FAIL: TestWithdraw/whole_balance (0.00s)\n        withdraw_test.go:35: Withdraw(100) with balance 100: error = withdraw 100 from A (balance 100): insufficient funds, want <nil>\nНомер строки в твоём файле — свой. Без мутанта — ok.',
          q: 'Ловит ли TestWithdraw мутанты 1 и 2?',
          a: 'Да: с мутантом 1 падает случай one_more_than_the_balance — ошибка есть, но errors.Is её не находит; с мутантом 2 — все три: счёт из хелпера остаётся пустым. Проверь сам.'
        }
      ],
      check: 'Готово, когда без подсказки: какой тест ловит каждый мутант и почему; почему зелёные тесты и прежнее покрытие не доказывают, что код верен; что такое table-driven тест — по-английски одной фразой.'
    },
    {
      id: 'withdraw',
      title: '7. Образец 3: TestWithdraw и хелпер newAccount',
      paragraphs: [
        'Открывай после своей попытки. Таблица — границы: часть баланса, ровно баланс, на единицу больше. Нулевую и отрицательную сумму уже проверяет `TestInvalidAmounts`. Хелпер `newAccount` создаёт счёт с балансом и при сбое останавливает тест через `t.Fatalf`; с `t.Helper()` строка провала укажет на вызов.',
        'Файл — `week1/account/withdraw_test.go`, рядом с тестами практикума.'
      ],
      files: [{ name: 'withdraw_test.go', code: read('docs/verification/v94/drill/withdraw_test.go') }]
    },
    {
      id: 'say',
      title: '8. Сказать на интервью',
      paragraphs: [
        'In Go I write table-driven tests: a slice of named cases with inputs and expected results, and a loop that runs each case as a subtest with t.Run. Adding a case is one line, a failure names the case, and go test -run reruns just that case. I use t.Errorf to report and continue, t.Fatalf when the test cannot go on, t.Helper in helpers and t.Cleanup for shared teardown. I check errors with errors.Is, not by their text, and I make sure a test fails on a broken implementation.'
      ],
      links: [
        { t: 'Go wiki: TableDrivenTests', u: 'https://go.dev/wiki/TableDrivenTests' },
        { t: 'Package testing', u: 'https://pkg.go.dev/testing' },
        { t: 'Go blog: Using Subtests and Sub-benchmarks', u: 'https://go.dev/blog/subtests' },
        { t: 'Code Review Comments: Useful Test Failures', u: 'https://go.dev/wiki/CodeReviewComments#useful-test-failures' },
        { t: 'cmd/go: флаги тестов', u: 'https://pkg.go.dev/cmd/go#hdr-Testing_flags' },
        { t: 'Go blog: Testable Examples', u: 'https://go.dev/blog/examples' },
        { t: 'Go blog: More predictable benchmarking with testing.B.Loop', u: 'https://go.dev/blog/testing-b-loop' },
        { t: 'Tutorial: Getting started with fuzzing', u: 'https://go.dev/doc/tutorial/fuzz' }
      ]
    }
  ]
};

// Same layout as the rest of data/guides.js: unquoted keys, JSON strings, two-space indent.
const js = (value, indent) => {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.every(v => typeof v === 'string')) return `[\n${value.map(v => `${pad}  ${JSON.stringify(v)}`).join(',\n')}\n${pad}]`;
    return `[\n${value.map(v => `${pad}  ${js(v, indent + 2)}`).join(',\n')}\n${pad}]`;
  }
  if (value && typeof value === 'object') {
    const flat = Object.values(value).every(v => typeof v === 'string');
    if (flat) return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')} }`;
    return `{\n${Object.entries(value).map(([k, v]) => `${pad}  ${k}: ${js(v, indent + 2)}`).join(',\n')}\n${pad}}`;
  }
  return JSON.stringify(value);
};

const file = new URL('data/guides.js', root);
let src = readFileSync(file, 'utf8');
const end = '\n};\n\n// Ссылки из плана: id → страница справки и раздел.';
if (src.split(end).length !== 2) throw new Error('guides.js: end of GUIDES not found exactly once');
if (src.includes('"go-testing"')) throw new Error('guides.js: go-testing is already there');
src = src.replace(end, () => `,\n  "go-testing": ${js(guide, 2)}${end}`); // a function: the text has $' (-run='^$')
const lastLink = '  "g-go-types": { guide: "go-types", section: null, label: "Типы Go: что сравнимо и что может быть ключом map" }\n};';
if (src.split(lastLink).length !== 2) throw new Error('guides.js: GUIDE_LINKS end not found');
src = src.replace(lastLink, () => lastLink.replace('\n};', ',\n') + [
  '  "g-go-testing": { guide: "go-testing", section: null, label: "Тесты в Go: table-driven, подтесты, тренировка" },',
  '  "g-go-testing-table": { guide: "go-testing", section: "table", label: "Тесты в Go: table-driven тест — образец" },',
  '  "g-go-testing-drill": { guide: "go-testing", section: "drill", label: "Тесты в Go: тренировка «сломай и поймай» на W1-2" }',
  '};'
].join('\n'));
writeFileSync(file, src);
console.log('go-testing added:', guide.sections.length, 'sections');
