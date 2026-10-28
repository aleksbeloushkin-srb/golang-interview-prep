# Практикум недель 1–3 — эталоны и тесты

Источник кода для раздела `#/practice` (данные — `data/practice.js`; `scripts/check-content.mjs` сверяет их с файлами здесь). В каждом каталоге: эталон `<task>.go`, тесты `<task>_test.go`, заготовка `starter.go.txt`.

```bash
go vet ./... && go test -race -count=1 ./...
```

Проверено Go 1.24.7 (linux/amd64); код совместим с Go 1.25+. Тесты отлавливают типичные ошибки (проверено мутациями: пул без ограничения, воркер без отмены, `close` в каждом отправителе, nil-вход в fan-in, счётчик без блокировки, кеш без копий, нарушенный инвариант; для недель 1–2 — `%v` вместо `%w` в account и validation, `LineError` без `Unwrap`, знак через `%` в money, ресивер-значение у Deposit).

Недели 1–2: `money` (W1-1), `account` (W1-2), `validation` (W1-3), `deferpanic` (W1-4, W1-5), `removeslice` (W2-1), `generics` (W2-2, W2-3), `txsum` (W2-4). Неделя 3: `workerpool`, `pipeline`, `fanin`, `counter`, `safecache`.
