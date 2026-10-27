# Проверки порции 12: interfaces, defer и современные API

Изолированный модуль, минимальная языковая версия 1.25 из-за synctest. Фактический запуск: **Go 1.26.1 darwin/arm64**. Сайт по-прежнему статический, npm и сборки нет.

Из этого каталога:

```sh
go test -race -count=1 -v ./...
go vet ./...
go run ./c33
go run ./c34
go run ./c35
go run ./c36
go run ./c37
go run ./q2
go run ./q2-fixed
go run ./q3
go run -race ./q5-fixed
```

| Пример | Ожидаемый stdout |
|---|---|
| c33 | `false true`, затем `true true` |
| c34 | `3` |
| c35 | `closure 3`, затем `arg 1`, затем `result 3` |
| c36 | `true`, затем `true` |
| c37 | `3 true`, затем `0 false` |
| q2 / q2-fixed | `false` / `true` |
| q3 | `1` |
| q5-fixed | `sender recovered: send on closed channel` |

c38 сохранена как `deadline_test.go` и исполняется через go test. time.Sleep внутри synctest продвигает искусственные часы, не задаёт ненадёжный реальный порядок.

Отдельные **намеренно ошибочные** случаи:

```sh
go run ./q5
go build -o /tmp/go-prep-negative-value ./testdata/value-method
go build -o /tmp/go-prep-negative-map ./testdata/map-method
```

q5 должна завершить отдельный процесс с `panic: send on closed channel`; recover в main не должен сработать. Две сборки должны отвергнуть соответственно отсутствие pointer-метода в наборе Counter и вызов pointer-метода у неадресуемого индекса map. Каталог testdata не входит в обычный `go test ./...`.

`contracts_test.go`: типизированный nil/несравнимый динамический тип; LIFO и изменения именованного результата; прямой и косвенный recover; weak при живом объекте; unique равных/различных значений; запрет arg == ptr и дополнительные проверки Go 1.26.1 у AddCleanup (прямой захват замыканием и указатель внутрь аллокации); ранний stop и panic итератора; lifecycle/ошибки writer у FlightRecorder. Тесты не обещают eventual cleanup, nil после одного GC, нулевые аллокации или фиксированное окно trace.

Linux-cgroup default и обновления GOMAXPROCS сверены по исходникам, **не проверены исполнением на Linux**. Go 1.17/1.25 не запускались. TestCleanupDirectRetentionGuardsGo126 намеренно проверяет детали 1.26.1 и не рассчитан на 1.25. Наличие `go 1.25` в go.mod не означает прогон этим toolchain.

Из корня сайта, после запуска HTTP-сервера и временного Chrome с CDP 9228:

```sh
node docs/verification/fixtures/go-apis-browser.mjs --output /tmp/apis-target.json
```

Сценарий проверяет шесть карточек, три quiz, ссылки, Wiki/шпаргалку, раскрытые состояния, клавиатуру, 320/390/430/1440 px и удвоение фактических размеров шрифтов. Скриншоты `/private/tmp/apis-*.png` нужно просматривать отдельно. Проверка схем планировщика этим сценарием не закрывается. После работы остановить сервер и Chrome.
