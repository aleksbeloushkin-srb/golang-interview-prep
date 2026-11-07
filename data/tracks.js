// Треки (#/practice/<трек>[/<ката>]): тема целиком, шаг за шагом — чтобы пройти её подряд
// или быстро вспомнить перед собеседованием. Ката описана только здесь: день плана ссылается
// на неё (links: ["k2-5"]), полные задачи с фикстурами — в data/practice.js. Отметки — у задач
// плана; шаг показывает ✓, если отмечена задача плана, которая на него ссылается. Шаг, которого
// нет в днях плана, называет свой резерв (whenRU). Ссылка на блок ("k1") только ведёт к нему. Код review — дословно из
// docs/verification/fixtures/channels/review/review.go; там же тесты, которые показывают ошибку.
const TRACKS = {
  "track-channels": {
    title: "Трек: каналы и context",
    reviewFixture: "docs/verification/fixtures/channels/review/review.go",
    intro: [
      "Каналы, `select`, `context` и утечки горутин — от аксиом до крупных паттернов, в том порядке, в котором их удобно строить: каждый следующий шаг собирается из предыдущих. Те же каты стоят в днях плана недель 4–12; здесь они подряд, чтобы пройти тему целиком или быстро вспомнить её перед собеседованием.",
      "Видео — после своей попытки. Материал: skill issue, «Полный разбор каналов» и серия роликов после него; В. Балун, «Паттерны использования каналов в Go». Где видео ошибается, ката говорит, как на самом деле."
    ],
    rules: [
      ["Без подсказок", "пиши с чистого листа; видео и конспект — после"],
      ["На время", "20–30 минут; fan-in — 10 минут"],
      ["Вслух по-английски", "Clarify → Approach → Complexity → Edge cases & tests"],
      ["Готово, когда", "`go test -race` зелёный; таймауты и отмена проверены в `testing/synctest` (Go 1.25+); на вопрос «кто закрывает канал и как завершится каждая горутина» есть по одному предложению"],
      ["Утечки в synctest", "`synctest.Test` роняет тест, если горутина пузыря зависла навсегда на канале пузыря, `select`, `sync.Cond`, `WaitGroup` или `time.Sleep`; зависшая на `sync.Mutex`, вводе-выводе или чужом канале тест не роняет, а вешает до `-timeout`. Время в пузыре идёт, только пока жива его главная горутина: если работа ещё спит, в конце теста досыпай дольше неё (`time.Sleep`; в Go 1.27 — `synctest.Sleep`, он ещё и ждёт, пока все уснут)"],
      ["Вариация", "после решения — одно изменённое условие из шага"]
    ],
    versions: [
      ["Профиль `goroutineleak`", "в 1.26 — эксперимент (`GOEXPERIMENT=goroutineleakprofile`), в 1.27 — по умолчанию"],
      ["`testing/synctest`", "в 1.24 — эксперимент, с 1.25 — стабильный пакет; в 1.27 — `synctest.Sleep`: досыпает и ждёт, пока все в пузыре уснут"],
      ["`sync.WaitGroup.Go`", "с 1.25; на 1.24 — `Add(1)` и `defer Done()`"],
      ["`time.After` и `Timer` в цикле", "с 1.23 при `go 1.23`+ в go.mod таймер без ссылок собирает GC и без `Stop`, а канал таймера синхронный: совет «не вызывай `time.After` в цикле» больше не про утечку; на 1.23–1.26 модуль со старой директивой живёт по-старому, в 1.27 настройку `asynctimerchan` удалили — новое поведение у всех"],
      ["Переменная цикла", "при `go 1.22`+ в go.mod своя на каждую итерацию: копия `v := v` перед `go` не нужна; модуль с `go 1.21` и на новом тулчейне живёт по-старому"],
      ["Генератор", "с 1.23 вместо горутины с каналом часто лучше итератор `iter.Seq` — без горутины и без утечки"]
    ],
    blocks: [
      {
        id: "k1",
        title: "Блок 1. Микропаттерны",
        refs: [
          { t: "Cheney: Channel Axioms", u: "https://dave.cheney.net/2014/03/19/channel-axioms" },
          { t: "Kennedy: The Behavior Of Channels", u: "https://www.ardanlabs.com/blog/2017/10/the-behavior-of-channels.html" }
        ],
        steps: [
          {
            id: "k1-1", label: "К1.1", title: "Таблица аксиом по памяти: 3 состояния × 3 операции", minutes: 5, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "9 клеток без ошибок; сказано, что компилятор и `go vet` молчат про отправку в nil-канал, а рантайм сообщает deadlock, только когда спят все горутины: в сервисе такая отправка молча висит навсегда — это утечка",
            variation: "буферизованный канал после `close`: сначала оставшиеся значения, потом нулевое и `ok == false`",
            links: ["c14", "sim3"],
            refs: [{ t: "skill issue: аксиомы, 24:30", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=1470s" }]
          },
          {
            id: "k1-2", label: "К1.2", title: "Буфер: когда он нужен. Задача squares и `signal.Notify`", minutes: 15,
            whenRU: "резерв недели 4 (вс), обязательно",
            doneWhen: "объяснено, что буфер не ускоряет медленного потребителя — устойчивую скорость задаёт самая медленная сторона, буфер лишь сглаживает всплески — и прячет ошибки синхронизации, пока не заполнится; у буфера 0, 1 и N — каждому своя причина",
            variation: "`signal.Notify` с буфером 1 против `signal.NotifyContext`: при полном буфере сигнал теряется, а не ждёт",
            links: ["c13", "q45", "c59"],
            refs: [{ t: "skill issue: канал с буфером", u: "https://www.youtube.com/watch?v=schHoROb21g" }]
          },
          {
            id: "k1-3", label: "К1.3", title: "Генератор `writer() <-chan int`", minutes: 5, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "между `make` и `return` нет ничего блокирующего; канал закрывает сам генератор",
            variation: "вернуть `chan int` — теперь читатель может закрыть канал",
            refs: [{ t: "skill issue: генератор, 39:30", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=2370s" }]
          },
          {
            id: "k1-4", label: "К1.4", title: "Два писателя в один канал", minutes: 10, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "закрывает только горутина-закрыватель после `wg.Wait()`; `-race -count=100` зелёный",
            variation: "ноль писателей: канал всё равно закрывается",
            refs: [{ t: "skill issue: несколько писателей, 40:30", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=2430s" }]
          },
          {
            id: "k1-5", label: "К1.5", title: "Writer → Doubler → Reader", minutes: 15, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "в `synctest` 10 значений по 500 мс проходят ровно за 5 с виртуального времени; стадия закрывает свой выход, а не вход",
            variation: "Doubler в 3 горутинах — порядок теряется",
            links: ["p-pipeline"],
            refs: [{ t: "skill issue: pipeline, 48:00", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=2880s" }]
          },
          {
            id: "k1-6", label: "К1.6", title: "M писателей и N читателей на одном канале", minutes: 10, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "сумма у читателей равна отправленному; объяснено, почему это не широковещание: каждое значение достаётся одному читателю",
            variation: "широковещание через `close`",
            refs: [{ t: "skill issue: M:N, 51:00", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=3060s" }]
          }
        ]
      },
      {
        id: "k2",
        title: "Блок 2. select, context, утечки",
        refs: [
          { t: "Ajmani: Pipelines and cancellation", u: "https://go.dev/blog/pipelines" },
          { t: "Cheney: Never start a goroutine without knowing how it will stop", u: "https://dave.cheney.net/2016/12/22/never-start-a-goroutine-without-knowing-how-it-will-stop" },
          { t: "testing/synctest", u: "https://pkg.go.dev/testing/synctest" },
          { t: "go.uber.org/goleak", u: "https://pkg.go.dev/go.uber.org/goleak" }
        ],
        steps: [
          {
            id: "k2-1", label: "К2.1", title: "`select` с двумя готовыми каналами и `default`", minutes: 10, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "на 1000 прогонах встречаются обе ветки: среди готовых выбор случаен, порядок в коде приоритета не даёт",
            variation: "`default` в цикле без паузы — busy loop",
            links: ["c18", "q22", "sim4"]
          },
          {
            id: "k2-2", label: "К2.2", title: "Таймаут тремя способами: `time.After`, `Timer`, `context.WithTimeout`", minutes: 10,
            whenRU: "резерв недели 4 (вс), обязательно",
            doneWhen: "в `synctest` выход ровно в срок; объяснено, что `ctx.Done()` закрывается и будит всех ждущих, а `Timer.C` отправляет одно значение одному получателю и не закрывается",
            variation: "пять горутин ждут один `Timer.C` — просыпается одна",
            links: ["c18", "q11"],
            refs: [{ t: "skill issue: After, Timer, context, 57:00", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=3420s" }]
          },
          {
            id: "k2-3", label: "К2.3", title: "`for-select` читателя: до закрытия или отмены", minutes: 10, optional: true,
            whenRU: "резерв недели 4 (вс), если недели 3–4 дались с трудом",
            doneWhen: "выходит в обоих случаях; без проверки `ok` после закрытия — бесконечный цикл на нулевых значениях",
            variation: "приоритет отмены: проверка `ctx.Err()` до `select` сужает окно, но строгого приоритета не даёт",
            links: ["c18"],
            refs: [{ t: "skill issue: for-select, 62:30", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=3750s" }]
          },
          {
            id: "k2-4", label: "К2.4", title: "Писатель с отменой и три правила против утечек", minutes: 15,
            whenRU: "резерв недели 4 (вс), обязательно",
            doneWhen: "получил результат — выйди; неисправимая ошибка — выйди; отменили — выйди; `defer close(out)`; в `synctest` нет зависших горутин; объяснено, почему пустая ветка `case <-ctx.Done():` без `return` писателя не останавливает (в видео так)",
            variation: "забытый писатель (не закрыл канал) и забытый читатель (ушёл раньше)",
            links: ["c22", "c12"],
            refs: [
              { t: "skill issue: писатель в select, 64:00", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=3840s" },
              { t: "skill issue: утечки горутин", u: "https://www.youtube.com/watch?v=yZrGRU4mmBE" }
            ]
          },
          {
            id: "k2-5", label: "К2.5", title: "Обёртка с таймаутом: три версии", minutes: 20,
            doneWhen: "три версии: `close(done)` и `time.After` перестают ждать, но работу не прерывают; небуферизованный канал результата — горутина висит навсегда; `ctx` и буфер 1 — без утечек",
            variation: "функция принимает `ctx`: кооперативная работа останавливается сама",
            links: ["p-timeout", "c22", "c12"],
            refs: [{ t: "skill issue: обёртка с таймаутом, 65:30", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=3930s" }]
          },
          {
            id: "k2-6", label: "К2.6", title: "«Финальный босс»: `processParallel(in, out, 5)` за 5 с", minutes: 30,
            doneWhen: "`processParallel` сразу возвращается и сама закрывает `out`; прогон укладывается в 5 с при любом рандоме; тест на утечки зелёный: `synctest.Test`, в конце досыпать дольше самой долгой работы (`time.Sleep(10 * time.Second)`) — тогда зависшие навсегда горутины роняют тест, а спящие успевают доспать; или профиль `goroutineleak` показывает `total 0`. Отправитель `in` в тесте тоже должен завершиться: после дедлайна `processParallel` его не читает — дочитай `in` (`for range in {}`) или пусть отправитель слушает `ctx`",
            variation: "`goleak.VerifyNone(t)` годится, только если `processData` принимает `ctx`: иначе горутины, которые ещё спят (до 9 с), он посчитает утечкой",
            links: ["p-workerpool", "c12", "c22"],
            refs: [
              { t: "skill issue: условие, 68:00", u: "https://www.youtube.com/watch?v=k-1OEYl7N8Q&t=4080s" },
              { t: "skill issue: «Самая сложная задача» — разбор", u: "https://www.youtube.com/watch?v=wZCLVt_5-4c" }
            ],
            review: [
              {
                title: "«Решение без утечек»: processData и воркер",
                question: "Воркер ждёт в одном `select` результат `<-processData(ctx, v)` и `<-ctx.Done()`. Таймаут 5 с, пять воркеров. Что останется висеть после прогона и почему? Как исправить одной строкой?",
                answer: "По таймауту воркер может уйти по своей ветке `ctx.Done()`, а вторая горутина `processData` в это время шлёт результат — обычно `outVal{err: errTimeout}` — в небуферизованный `out`, который больше никто не прочитает. Висит до пяти горутин, по одной на воркер: кто успеет первым в момент дедлайна, не задано. Исправление одной строкой — `make(chan outVal, 1)`: отправка тогда не блокируется ни в одной ветке. Убрать отправку из ветки `ctx.Done()` мало: если работа кончилась одновременно с дедлайном, горутина выберет `<-done` и повиснет на `out <- outVal{val: v * 2}`. Попутно: `errTimeout` подменяет причину — вернуть `ctx.Err()`.",
                code: "func processData(ctx context.Context, v int) chan outVal {\n\tdone := make(chan struct{})\n\tout := make(chan outVal)\n\tgo func() {\n\t\ttime.Sleep(time.Duration(rand.IntN(10)) * time.Second)\n\t\tclose(done)\n\t}()\n\tgo func() {\n\t\tselect {\n\t\tcase <-done:\n\t\t\tout <- outVal{val: v * 2}\n\t\tcase <-ctx.Done():\n\t\t\tout <- outVal{err: errTimeout}\n\t\t}\n\t}()\n\treturn out\n}"
              }
            ]
          },
          {
            id: "k2-7", label: "К2.7", title: "Одна утечка — три детектора", minutes: 20,
            doneWhen: "одна и та же утечка поймана `goleak.VerifyNone`, профилем `goroutineleak` и `synctest`; названо, чего каждый не видит: goleak — только горутины, живые в конце теста, и ложно ловит ещё спящие; `goroutineleak` — не видит горутин на канале, достижимом из глобальной переменной; `synctest` — только горутины своего пузыря и только на операциях, которые он считает «прочной» блокировкой (не мьютекс и не ввод-вывод)",
            variation: "`-race` молчит: утечка — не гонка данных",
            links: ["p-leak", "c12", "c38"],
            refs: [{ t: "skill issue: goleak, 16:00", u: "https://www.youtube.com/watch?v=yZrGRU4mmBE&t=960s" }]
          }
        ]
      },
      {
        id: "k3",
        title: "Блок 3. Крупные паттерны",
        refs: [
          { t: "Mills: Rethinking Classical Concurrency Patterns", u: "https://www.youtube.com/watch?v=5zXAHh5tJqQ" },
          { t: "golang.org/x/sync/errgroup", u: "https://pkg.go.dev/golang.org/x/sync/errgroup" },
          { t: "golang.org/x/sync/semaphore", u: "https://pkg.go.dev/golang.org/x/sync/semaphore" },
          { t: "Cox-Buday: Concurrency in Go, код книги", u: "https://github.com/kat-co/concurrency-in-go-src" }
        ],
        steps: [
          {
            id: "k3-1", label: "К3.1", title: "Fan-in на время", minutes: 10,
            doneWhen: "`Merge(ctx, ins...)` с чистого листа за 10 минут; пустой список закрывает выход сразу; отмена завершает все горутины",
            variation: "когда fan-in не нужен: продюсеры свои — пусть пишут в один канал, а закроет его закрыватель",
            links: ["p-fanin", "sim3"],
            refs: [
              { t: "Балун: fan-in, 00:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE" },
              { t: "skill issue: fan-in за 3:40, 01:30", u: "https://www.youtube.com/watch?v=vMGCm0HvBgI&t=90s" }
            ]
          },
          {
            id: "k3-2", label: "К3.2", title: "Fan-out по ключу", minutes: 25,
            doneWhen: "значения с одним ключом всегда идут в один выход и в порядке поступления (как партиции Kafka); медленный получатель тормозит всех — или отбрасывается, по выбору. Термин: у Балуна fan-out — маршрутизация в один из N каналов, у skill issue и Cox-Buday — N стадий читают один вход; на собеседовании уточни, о каком смысле речь",
            variation: "медленный получатель отбрасывается: `select` с `default` и счётчик потерь",
            links: ["p-fanout"],
            refs: [
              { t: "Балун: fan-out, 03:30", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=210s" },
              { t: "skill issue: fan-out, 14:30", u: "https://www.youtube.com/watch?v=vMGCm0HvBgI&t=870s" }
            ]
          },
          {
            id: "k3-o1", label: "устно", title: "Fan-out/fan-in против пула", oral: true,
            whenRU: "устно, в ту же субботу, что К3.2",
            doneWhen: "для однородной стадии связка сводится к пулу с лишними N горутинами и каналами; оправдана при привязке к ключу, воркере с состоянием, разных стадиях. Замер в видео — без бенчмарка",
            variation: "проверить цифрами: Exercism, Parallel Letter Frequency",
            refs: [{ t: "skill issue: «самый переоценённый паттерн», 06:30", u: "https://www.youtube.com/watch?v=vMGCm0HvBgI&t=390s" }]
          },
          {
            id: "k3-3", label: "К3.3", title: "Tee", minutes: 25,
            doneWhen: "три версии: книжная на nil-каналах (2 выхода), N выходов с горутиной на выход и WaitGroup на значение, с отменой; объяснено, почему «быстрый» tee теряет порядок",
            variation: "когда tee не нужен: потребители — функции, хватит одного `range` и двух вызовов",
            links: ["p-tee"],
            refs: [
              { t: "Балун: tee, 07:30", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=450s" },
              { t: "skill issue: tee", u: "https://www.youtube.com/watch?v=73PNUwxShoQ" }
            ],
            review: [
              {
                title: "Tee на nil-каналах, копия внутри цикла",
                question: "Это книжный трюк с nil-каналами, но строка с копией стоит не там. Что получат читатели?",
                answer: "Копия живёт одну итерацию внутреннего цикла, поэтому `out1 = nil` теряется: на втором проходе тот же выход снова может получить то же значение, а другой — не получить его вовсе. Быстрый читатель видит повторы, медленный — пропуски. Копия должна стоять до внутреннего цикла, один раз на значение.",
                code: "func TeeShadow(ctx context.Context, in <-chan int) (<-chan int, <-chan int) {\n\tout1, out2 := make(chan int), make(chan int)\n\tgo func() {\n\t\tdefer close(out1)\n\t\tdefer close(out2)\n\t\tfor v := range in {\n\t\t\tfor range 2 {\n\t\t\t\tout1, out2 := out1, out2\n\t\t\t\tselect {\n\t\t\t\tcase <-ctx.Done():\n\t\t\t\t\treturn\n\t\t\t\tcase out1 <- v:\n\t\t\t\t\tout1 = nil\n\t\t\t\tcase out2 <- v:\n\t\t\t\t\tout2 = nil\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}()\n\treturn out1, out2\n}"
              },
              {
                title: "«Быстрый» tee: горутина на значение",
                question: "Медленный читатель больше не тормозит быстрого. Что сломалось?",
                answer: "Порядок: на один выход отправку ждут несколько горутин, и какая отправит первой, не задано. Ещё две вещи: читатель ушёл — его горутины висят навсегда (отмены нет), и число горутин не ограничено. Если потребителям нужна независимая скорость, это уже pub/sub с буфером и политикой переполнения, а не tee.",
                code: "func TeeFast(in <-chan int, n int) []chan int {\n\touts := make([]chan int, n)\n\twgs := make([]sync.WaitGroup, n)\n\tfor i := range outs {\n\t\touts[i] = make(chan int)\n\t}\n\tgo func() {\n\t\tdefer func() {\n\t\t\tfor i := range outs {\n\t\t\t\tgo func() {\n\t\t\t\t\twgs[i].Wait()\n\t\t\t\t\tclose(outs[i])\n\t\t\t\t}()\n\t\t\t}\n\t\t}()\n\t\tfor v := range in {\n\t\t\tfor i := range outs {\n\t\t\t\twgs[i].Add(1)\n\t\t\t\tgo func() {\n\t\t\t\t\tdefer wgs[i].Done()\n\t\t\t\t\touts[i] <- v\n\t\t\t\t}()\n\t\t\t}\n\t\t}\n\t}()\n\treturn outs\n}"
              }
            ]
          },
          {
            id: "k3-o2", label: "устно", title: "Transformer, filter, generator", oral: true,
            whenRU: "устно, вместе с К3.4 в прогоне блока 5",
            doneWhen: "каждый — генератор с входом: создать выход, вернуть, обрабатывать и закрыть в горутине; генератор с Go 1.23 — часто итератор `iter.Seq`",
            refs: [{ t: "Балун: transformer и filter, 10:30", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=630s" }]
          },
          {
            id: "k3-4", label: "К3.4", title: "Pipeline с отменой", minutes: 25,
            whenRU: "только в прогоне блока 5: это повтор W3-2",
            doneWhen: "ранний уход потребителя останавливает все стадии",
            links: ["p-pipeline"],
            refs: [{ t: "Балун: pipeline, 15:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=900s" }]
          },
          {
            id: "k3-5", label: "К3.5", title: "Ограничение работы в полёте: пул, семафор, `SetLimit`", minutes: 30,
            doneWhen: "одна задача W3-1 в трёх формах — классический пул; семафор на `chan struct{}` со слотом до `go`; `errgroup.SetLimit` — и все три проходят тесты W3-1. Названа позиция Mills: работу ограничивают семафором, а не пулом простаивающих воркеров (сегодня то же даёт `errgroup.SetLimit`); стадия, которая живёт до закрытия входа, — нормальна",
            variation: "пропуск вместо ожидания: `select` с `default`, `TryGo`, `TryAcquire`; пул ресурсов с идентичностью — канал ресурсов",
            sayEN: "Here's a classic worker pool: N goroutines range over one jobs channel, the producer closes it, and a goroutine closes the results after `wg.Wait()`. In production I'd usually bound in-flight work instead of keeping idle workers: a semaphore — a buffered `chan struct{}` acquired before `go` — or `errgroup.WithContext` with `SetLimit`: `Wait` returns the first error, and the group's context is cancelled so the other tasks can stop if they watch it. A fixed pool still makes sense when each worker owns something, like a connection.",
            links: ["p-workerpool", "p-parallelfetch"],
            refs: [
              { t: "Балун: семафор, 34:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=2040s" },
              { t: "skill issue: worker pool и семафор", u: "https://www.youtube.com/watch?v=aS9YV6JpZTc" }
            ]
          },
          {
            id: "k3-6", label: "К3.6", title: "Остановка: done-канал и `Shutdown`", minutes: 25,
            doneWhen: "`Shutdown` отменяет и дожидается; повторный вызов безопасен (`sync.Once`)",
            variation: "сравнить с `ctx` и `WaitGroup`",
            links: ["p-shutdown", "c59"],
            refs: [{ t: "Балун: done channel, 23:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=1380s" }]
          },
          {
            id: "k3-7", label: "К3.7", title: "Or-done: разбор чужого кода", minutes: 15,
            doneWhen: "найдена ошибка: отправка без `select` с отменой; своя версия проходит `go test -race -run OrDone` задачи «Tee и or-done»",
            links: ["p-tee"],
            refs: [{ t: "Балун: or-done, 26:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=1560s" }],
            review: [
              {
                title: "Or-done",
                question: "Читатель отменил контекст и ушёл. Что станет с горутиной?",
                answer: "Если она уже взяла значение, то висит на `out <- v` навсегда: отправка ждёт читателя, а его нет. Отправка тоже должна стоять в `select` с `<-ctx.Done()`.",
                code: "func OrDone(ctx context.Context, in <-chan int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tdefer close(out)\n\t\tfor {\n\t\t\tselect {\n\t\t\tcase <-ctx.Done():\n\t\t\t\treturn\n\t\t\tcase v, ok := <-in:\n\t\t\t\tif !ok {\n\t\t\t\t\treturn\n\t\t\t\t}\n\t\t\t\tout <- v\n\t\t\t}\n\t\t}\n\t}()\n\treturn out\n}"
              }
            ]
          },
          {
            id: "k3-o3", label: "устно", title: "Or-channel, bridge, barrier, promise/future, singleflight", oral: true,
            whenRU: "устно, рядом с К3.7 (неделя 9)",
            doneWhen: "для каждого — когда нужен и чем заменить: or-channel — `context` с отменой; future — горутина и канал с буфером 1 или `errgroup`; singleflight — `golang.org/x/sync/singleflight`; barrier — `sync.WaitGroup` или `errgroup.Wait`; bridge обычно не нужен — читатель сам делает вложенный `range`",
            refs: [{ t: "Балун: or-channel и дальше, 28:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=1680s" }]
          },
          {
            id: "k3-8", label: "К3.8", title: "Errgroup на каналах", minutes: 25,
            doneWhen: "свой `Group` на каналах и `sync.Once`: `Go`, `Wait`, первая ошибка, отмена остальных через `ctx`; сравнить с `x/sync/errgroup`",
            variation: "паника в задаче: `errgroup` её не ловит и в `Wait` не передаёт — процесс падает; своя версия — решить и сказать почему",
            links: ["p-parallelfetch", "q16"],
            refs: [{ t: "Балун: errgroup, 45:00", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=2700s" }]
          },
          {
            id: "k3-9", label: "К3.9", title: "Rate limiter: leaky bucket против token bucket", minutes: 25,
            doneWhen: "leaky и token bucket на каналах; отказ против ожидания; сказано, что лимитер на каналах работает только в одном процессе",
            variation: "сравнить с W4-2 и `golang.org/x/time/rate`",
            links: ["p-ratelimit"],
            refs: [{ t: "Балун: rate limiter, 50:30", u: "https://www.youtube.com/watch?v=luQlkud-jKE&t=3030s" }]
          }
        ]
      },
      {
        id: "k4",
        title: "Блок 4. Приёмы из эталонного кода",
        refs: [{ t: "Cheney: Curious channels", u: "https://dave.cheney.net/2013/04/30/curious-channels" }],
        steps: [
          {
            id: "k4-1", label: "К4.1", title: "nil-канал выключает ветку `select`", oral: true,
            doneWhen: "по коду `Worker.Run` объяснено, зачем `stopClaim = nil` и чем это лучше флага: закрытый канал готов всегда, nil — никогда",
            refs: [{ t: "Pinkponies Bank: taskqueue/worker.go, Run", u: "https://github.com/aleksbeloushkin-srb/pinkponies-bank/blob/v1/internal/platform/taskqueue/worker.go#L109-L171" }]
          },
          {
            id: "k4-2", label: "К4.2", title: "Схлопывающийся сигнал: `make(chan struct{}, 1)` и неблокирующая отправка", oral: true,
            doneWhen: "тест: 100 сигналов, отправленных, пока воркер занят, будят его один раз; отправители не блокируются",
            refs: [{ t: "Pinkponies Bank: taskqueue/postgres.go, signal", u: "https://github.com/aleksbeloushkin-srb/pinkponies-bank/blob/v1/internal/platform/taskqueue/postgres.go#L35-L50" }]
          }
        ]
      },
      {
        id: "k5",
        title: "Блок 5. Прогон на время",
        refs: [{ t: "loong/go-concurrency-exercises", u: "https://github.com/loong/go-concurrency-exercises" }],
        steps: [
          {
            id: "k5-1", label: "К5", title: "Обязательные каты подряд, вслух",
            doneWhen: "К2.5, К2.6, К3.1, К3.2, К3.3, К3.4, К3.5, К3.6, К3.8, К3.9 — по 20–30 минут (К3.1 — 10), вслух по-английски, без подсказок; две первые — в субботу недели 12, остальные — в воскресный резерв до мока 1",
            variation: "тренажёр с готовыми тестами — loong/go-concurrency-exercises"
          }
        ]
      }
    ]
  }
};
