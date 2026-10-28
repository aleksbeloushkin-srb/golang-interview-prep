# Практикум недель 1–4 — эталоны и тесты

Источник кода для раздела `#/practice` (данные — `data/practice.js`; `scripts/check-content.mjs` сверяет их с файлами здесь). В каждом каталоге: эталон `<task>.go`, тесты `<task>_test.go`, заготовка `starter.go.txt`.

```bash
go vet ./... && go test -race -count=1 ./...
```

Проверено Go 1.24.7 (linux/amd64); код совместим с Go 1.25+. Тесты отлавливают типичные ошибки (проверено мутациями: пул без ограничения, воркер без отмены, `close` в каждом отправителе, nil-вход в fan-in, счётчик без блокировки, кеш без копий, нарушенный инвариант; для недель 1–2 — `%v` вместо `%w` в account и validation, `LineError` без `Unwrap`, знак через `%` в money, ресивер-значение у Deposit).

Недели 1–2: `money` (W1-1), `account` (W1-2), `validation` (W1-3), `deferpanic` (W1-4, W1-5), `removeslice` (W2-1), `generics` (W2-2, W2-3), `txsum` (W2-4). Неделя 3: `workerpool`, `pipeline`, `fanin`, `counter`, `safecache`. Неделя 4: `ratelimit` (W4-2), `shutdown` (W4-3), `leak` (W4-4), `escape` (W4-5), `txprof` (W4-6, заготовка — решение W2-4); W4-1 `parallelfetch` — в соседнем модуле `../practice-errgroup`, потому что ему нужен `golang.org/x/sync`.

Особенности недели 4: тест `leak` намеренно оставляет две горутины `FirstLeaky` до конца тестового бинарника — это демонстрация утечки; `escape` и `txprof` проверяют число аллокаций через `testing.AllocsPerRun` (проходит и с `-race` на Go 1.24.7); строки `-gcflags=-m` в задаче W4-5 сняты с Go 1.24.7.
