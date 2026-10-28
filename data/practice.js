// Практикум: задачи с заготовкой, тестами и эталоном. Сгенерировано из docs/verification/fixtures/practice
// (там же эталоны и тесты проверены: go vet, go test -race). scripts/check-content.mjs сверяет код с этими файлами.
const PRACTICE = [
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
