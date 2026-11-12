# Программа подготовки к интервью Senior Go: 14 недель

<!-- GitHub Pages (Jekyll/Liquid) не должен разбирать фигурные скобки в Go-коде этого файла. --> <!-- {% raw %} -->

Цель: Senior Backend Engineer (Go) · EU-компании с офисом в Сербии или remote CET. Старт 09.11.2026, ~10 ч в неделю: 4 вечера по 1,5 ч и 4 ч в субботу; пятница и воскресенье — резерв (в неделях с рабочей пятницей резерв — воскресенье). Бюджет — ориентир, а не обещание; внешний результат (оффер) план не гарантирует.

Пометки: *(по желанию)* — не входит в обязательный объём недели; *(на редакции)* — у материала сайта нет списка источников; *(Deep Dive)* — глубина рантайма, не обязательна для интервью. Опорные английские тексты — редакционные наброски, по рубрике не проверены.

Дату старта можно менять на сайте: «Я начал на этой неделе», сдвиг на неделю, «Сейчас я на неделе N», сброс; неделя всегда начинается в понедельник. Даты ниже — для старта по умолчанию.

«Готово, когда» — самостоятельная попытка до ответа и перенос на изменённое условие; у каты — критерий из трека; «На сайте пока нет» — упражнение, которое ещё предстоит добавить. Задачи LeetCode без своего критерия: Решено самостоятельно за 30 минут вслух по 4 шагам; названа сложность; подсказка открыта только после попытки; follow-up или изменённое условие объяснено словами.

Этот файл сгенерирован `node scripts/program-md.mjs` из `data/plan.js` — источника данных раздела [«План 14 недель»](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/plan) на сайте. Правки вносить в `data/plan.js`, затем пересобрать файл. Ревизия программы: 2026-11-11.

## Фазы

| Фаза | Недели |
| --- | --- |
| Go: язык и конкурентность | 1, 2, 3, 4, 5 |
| Проект-портфолио: ledger-сервис | 6, 7, 8, 9 |
| Собеседования и рынок | 10, 11, 12, 13, 14 |

## Обзор

| Нед. | Даты | Тема | Готово, когда |
| --- | --- | --- | --- |
| 1 | 09.11–15.11 | Идиомы Go I: типы, методы, интерфейсы | Решены LC 49 и LC 1 (на leetcode.com, на Go). W1-1 и W1-2 лежат в go-prep, и go test -race ./week1/... проходит; W1-3 объяснён вслух; вариации Money и typed nil сделаны; свой TestWithdraw ловит мутанта с >= в Withdraw. Самопроверка по типам и интерфейсам проговорена вслух по-английски без подсказок. |
| 2 | 16.11–22.11 | Идиомы Go I: ошибки, defer и panic, повторение | W2-1…W2-3 лежат в go-prep, и go test -race ./week2/... проходит; вариации среды сделаны; решены LC 347 и LC 238, LC 1 повторена без текста. Самопроверка недели проговорена вслух по-английски без подсказок; рассказ о себе, версия 0, записан. |
| 3 | 23.11–29.11 | Идиомы Go II: slice, map, строки, generics, тесты | 10 задач «что выведет код» из плана и q1 решены с объяснением; CLI txsum покрыт тестами; LC 3, 15, 739 проговорены; CI в go-prep зелёный, тренировка с ассемблером пройдена. |
| 4 | 30.11–06.12 | Конкурентность I: горутины, каналы, select, sync | W4-1…W4-5 работают под go test -race (в go-prep: ./week4/...); на каждый ответ «кто закрывает канал и как горутина завершится» есть одно предложение. |
| 5 | 07.12–13.12 | Конкурентность II и минимум рантайма | 6 эталонных решений пишутся за 20–30 мин; найдена утечка горутины через pprof; пройдены контрольный квиз и виртуальный live coding («финальный босс» с тестом на утечки); go test -race ./week5/... в go-prep зелёный. |
| 6 | 14.12–20.12 | Проект I: каркас ledger-сервиса | Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском; каты К2.5 и К2.7 решены на время, тесты зелёные. |
| 7 | 21.12–27.12 | Проект II: транзакции, идемпотентность, outbox → Kafka | Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат; каты К3.1 и К3.2 решены на время, тесты зелёные. |
| 8 | 28.12–03.01 | Проект III: gRPC, тесты, бенчмарки | Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов; каты К3.5 и К3.8 решены на время, тесты зелёные. |
| 9 | 04.01–10.01 | Проект IV: production-readiness, CV | Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском; каты К3.6 и К3.9 решены на время, тесты зелёные. |
| 10 | 11.01–17.01 | Take-home, code review, первая волна откликов | Второе портфолио-репо (API-клиент) с тестами и README; чек-лист ревьюера; 3 разобранных чужих PR; 5–10 откликов волны 1. |
| 11 | 18.01–24.01 | System Design I | 3 дизайна проговорены и записаны; вторая волна откликов отправлена до праздников. |
| 12 | 25.01–31.01 | System Design II: event-driven и предметные дизайны | Ещё 3 дизайна проговорены; на вопрос про exactly-once есть точный ответ без мифов. |
| 13 | 01.02–07.02 | Behavioral, легенда, CV | Истории записаны и проговорены; финальные CV и LinkedIn; список вопросов к компании. |
| 14 | 08.02–14.02 | Моки и пик откликов | 3 мока пройдены; назначены реальные собеседования; после каждого интервью вопросы занесены в журнал. |

## Как проговаривать задачи по-английски

1. **Clarify** — Уточнить условие и входные данные. *Before I start, let me clarify a few things.*
2. **Approach** — Идея до кода: сначала brute force, затем как улучшить. *The brute-force approach would be… We can do better with…*
3. **Complexity** — Время и память. *This runs in O(n) time and O(n) extra space.*
4. **Edge cases & tests** — Граничные случаи и как они лягут в тест. *Edge cases: an empty input, a single element… I'd turn these into a table-driven test.*

Если завис: *Let me think out loud for a second.* · *I'm not sure yet, but my first idea is…* · *Let me step back and reconsider.* · *Can I assume…? If not, I'd handle it by…*

## Неделя 1. Идиомы Go I: типы, методы, интерфейсы (09.11–15.11)

**Цель:** Писать простой Go без подглядывания и объяснять по-английски, чем Go отличается от Kotlin в типах, методах и интерфейсах.

**Готово, когда:** Решены LC 49 и LC 1 (на leetcode.com, на Go). W1-1 и W1-2 лежат в go-prep, и go test -race ./week1/... проходит; W1-3 объяснён вслух; вариации Money и typed nil сделаны; свой TestWithdraw ловит мутанта с >= в Withdraw. Самопроверка по типам и интерфейсам проговорена вслух по-английски без подсказок.

### Пн · 90 мин

- [ ] Tour of Go: Basics — packages, variables, functions, flow control, defer — [Tour of Go](https://go.dev/tour/)
  - Готово, когда: Пройдены уроки «Packages, variables, and functions» и «Flow control statements»; без подсказки объясняешь var и := и порядок вызова defer на примере из трёх строк.
- [ ] Завести свой репозиторий go-prep: один модуль на весь практикум; сегодня — week1/hello и week1/calc, дальше по пакету на задачу; тренировка команд go run, build, vet, test — [Справка: Свой репозиторий go-prep: раскладка, команды, CI](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep), [C43](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c43)
  - Готово, когда: В корне go-prep проходят go vet ./... и go test -race ./...; есть week1/hello и week1/calc с тестом. Тренировка недели 1 пройдена: без подсказки — чем go run отличается от go build, что такое ./..., откуда (cached) и зачем -count=1; чем пакет отличается от модуля (c43).
- [ ] LeetCode 49. Group Anagrams + проговор — [LC 49. Group Anagrams](https://leetcode.com/problems/group-anagrams/), проговор: «LC 49. Group Anagrams»

### Вт · 90 мин

- [ ] Tour: pointers, structs, arrays, slices, maps, function values, closures; что сравнимо и что может быть ключом map — справка — [Справка: Типы Go: что сравнимо и что может быть ключом map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-types), [Tour: More types](https://go.dev/tour/moretypes/1)
  - Готово, когда: Пройдены pointers…closures; без подсказки предсказываешь, что выведет замыкание после изменения захваченной переменной.
- [ ] Go by Example от Values до Closures — набрать руками, не копировать — [Go by Example](https://gobyexample.com/)
  - Готово, когда: Примеры набраны и запускаются; по каждому — одна фраза, что он показывает.
- [ ] W1-1 Money: тип в минорных единицах (int64) + валюта, метод String() → «12.50 EUR». Проговор — [W1-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money), проговор: «W1-1. Money»
  - Готово, когда: Тесты практикума зелёные: 1250 → «12.50 EUR», 5 → «0.05 EUR», ноль, отрицательные суммы, JPY и BHD; одна фраза по-английски, почему не float64. Изменённое условие: Add(other Money) (Money, error) — при разных валютах ошибка, а не сложение.

### Ср · 90 мин

- [ ] Tour: methods, interfaces, type assertions, type switches, Stringer, errors (упражнения Readers, rot13Reader и Images — по желанию) — [C39](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39), [Tour: Methods and interfaces](https://go.dev/tour/methods/1)
  - Готово, когда: Без подсказки: type switch по ошибке и Stringer на своём типе; для обёрнутых ошибок — errors.As, а не type switch.
- [ ] Карточки c33 и c34 — «Коротко по-английски», «Как это работает» и практика без вариантов ответа; quiz q2 и q28 — [C34](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34), [C33](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33), [Q2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2), [Q28](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q28)
  - Готово, когда: c33 и c34: ответ вслух по-английски до раскрытия, затем сверка; практика карточек выполнена. q2 (nil-указатель внутри error) и q28 (T и *T: какое присваивание интерфейсу скомпилируется) — ответ до вариантов.

### Чт · 90 мин

- [ ] W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is). Проговор — [W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account), [C39](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39), [Q29](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q29), проговор: «W1-2. Account»
  - Готово, когда: Тесты W1-2 зелёные: успешный перевод, нехватка средств через две обёртки, после ошибки балансы прежние. Без подсказки: почему ресивер — указатель и почему err == ErrInsufficientFunds перестаёт работать после %w, а errors.Is — нет; проговор W1-2 — вслух по шагам. Изменённое условие — в среду недели 2: ErrAccountClosed.

### Сб · 240 мин

- [ ] W1-3 Method sets: почему значение T не реализует интерфейс с pointer-методом — [C34](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34), [Q28](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q28), проговор: «W1-3. Method sets»
  - Готово, когда: Без подсказки: почему var _ Notifier = Service{} не компилируется, а &Service{} — да; правило по спецификации и его мотивация.
- [ ] Тесты в Go (≈40 мин): справка «Тесты в Go», разделы 1–3 — table-driven тест на двух образцах, подтесты и -run, хелпер; затем тренировка «сломай и поймай» на своём W1-2: два мутанта тесты ловят, третий нет — допиши TestWithdraw таблицей. Разделы 4–5 (методы testing.T; Example, Benchmark, Fuzz) — по желанию — [Справка: Тесты в Go: table-driven, подтесты, тренировка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing), [Справка: Тесты в Go: тренировка «сломай и поймай» на W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing/drill), [W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account), [C44](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c44)
  - Готово, когда: Мутанты 1 и 2 объяснены своими словами: какой тест упал и почему; TestWithdraw — таблица с t.Run, падает на мутанте 3 и проходит на верном решении под -race. По-английски одной фразой: что такое table-driven тест.
- [ ] Повторение — вариация Money (≈30 мин): Add(other Money) (Money, error) — при разных валютах ошибка, а не сложение; тест на обе ветки рядом с тестами W1-1 — [W1-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money), [Справка: Тесты в Go: table-driven тест — образец](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing/table)
  - Готово, когда: Add складывает суммы одной валюты, а при разных валютах возвращает ошибку и нулевую Money без сложения; table-driven тест на обе ветки и на отрицательную сумму проходит под -race. По-английски одной фразой: почему ошибка, а не молчаливое сложение.
- [ ] Вариация typed nil (≈15 мин): своя ошибка *NotFoundError с методом Error на указателе; функция объявляет var e *NotFoundError и возвращает её как error — до запуска сказать, что даст err == nil, затем исправить возврат — [C33](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33), [Q2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2)
  - Готово, когда: До запуска сказано, что err == nil даёт false, и объяснено по-английски через «динамический тип и значение»: в интерфейсе тип *NotFoundError и nil-указатель. После исправления — return nil литералом — err == nil даёт true.
- [ ] Прочитать по ролям диалог Two Sum, затем решить LC 1 и повторить диалог своими словами — [LC 1. Two Sum](https://leetcode.com/problems/two-sum/), проговор: «LC 1. Two Sum — полный диалог с интервьюером»
  - Готово, когда: LC 1 решён без подсказки; диалог Two Sum повторён своими словами за 5 минут без текста; follow-up про отсортированный массив отвечен.
- [ ] Повторный проговор LC 49 без подсказок — тренажёр «Проговорить с таймером» у задачи понедельника; почему массив [26]int годится в ключ map — [Справка: Типы Go: что сравнимо и что может быть ключом map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-types)
  - Готово, когда: LC 49 проговорена без подсказок за 5 минут; запись сделана.
- [ ] Самопроверка по типам и интерфейсам вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы
  - Готово, когда: Все вопросы обоих блоков — ответ по-английски без подсказки, до минуты на вопрос; ошибочные отмечены для повтора.

**LeetCode недели:** [1. Two Sum](https://leetcode.com/problems/two-sum/) (Hash map), [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/) (Hash map)

**Проговорить по-английски:**

- *What is a zero value and why does it matter?*
- *When do you use a pointer receiver?*
- *Why doesn't a value of type T implement an interface whose method has a pointer receiver?*
- *Why can returning a nil pointer as an error give the caller a non-nil error?*

**Самопроверка:**

- Какие нулевые значения у int, string, *T, []T, map[K]V, chan T и error?
- Когда метод объявлять на pointer receiver?
- Почему var _ Notifier = Service{} не компилируется, если Notify объявлен на *Service?
- Почему nil-указатель, возвращённый как error, даёт err != nil?

**Материал сайта:**

- [Справка: Свой репозиторий go-prep: раскладка, команды, CI](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep)
- [C43 What is the difference between a module and a package, and what does an internal directory enforce?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c43)
- [Справка: Типы Go: что сравнимо и что может быть ключом map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-types)
- [Практикум W1-1 Money: сумма в минорных единицах](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-money)
- [C39 How do you add context to an error, and when do you use errors.Is, errors.As and errors.Join?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39)
- [C34 How do method sets differ from the shorthand used to call pointer methods?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c34)
- [C33 What does an interface value contain, and why can a typed nil make an interface non-nil?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33)
- [Q2 Nil-указатель внутри error](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2)
- [Q28 Pointer-метод, интерфейс и элемент map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q28)
- [Практикум W1-2 Account: pointer receiver и sentinel-ошибка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account)
- [Q29 %v вместо %w](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q29)
- [Справка: Тесты в Go: table-driven, подтесты, тренировка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing)
- [Справка: Тесты в Go: тренировка «сломай и поймай» на W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing/drill)
- [C44 How do you write a table-driven test, and what do t.Run, t.Helper, t.Parallel and t.Cleanup change?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c44)
- [Справка: Тесты в Go: table-driven тест — образец](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing/table)

## Неделя 2. Идиомы Go I: ошибки, defer и panic, повторение (16.11–22.11)

**Цель:** Объяснять по-английски ошибки как значения (sentinel и typed, %w, Is и As), defer, panic и recover и проверить неделю 1 на изменённых условиях.

**Готово, когда:** W2-1…W2-3 лежат в go-prep, и go test -race ./week2/... проходит; вариации среды сделаны; решены LC 347 и LC 238, LC 1 повторена без текста. Самопроверка недели проговорена вслух по-английски без подсказок; рассказ о себе, версия 0, записан.

### Пн · 90 мин

- [ ] Ошибки глубже: errors.New, fmt.Errorf("…: %w"), errors.Is/As, sentinel vs typed — [C39](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39), [Q29](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q29), [Q30](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q30), [Q20](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q20), [Go blog: Working with Errors in Go 1.13](https://go.dev/blog/go1.13-errors), [package errors](https://pkg.go.dev/errors)
  - Готово, когда: Без подсказки по-английски: чем Is отличается от As, когда sentinel, когда typed error; q29 (%w → %v), q30 (errors.Join, Go 1.20) и q20 (ошибка Close) объяснены до вариантов.
- [ ] W2-1 ValidationError: ошибка-тип с полем, errors.As через две обёртки, для корректного пользователя — обычный nil. Проговор — [W2-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation), проговор: «W2-1. ValidationError»
  - Готово, когда: Тесты W2-1 зелёные, включая два уровня обёртки, границу возраста и порядок полей; errors.As достаёт *ValidationError с верным Field; для корректного пользователя — обычный nil. Проговор W2-1 — вслух по шагам.

### Вт · 90 мин

- [ ] defer / panic / recover: карточка c35, ловушки q3 и q5 из quiz и их вариации q31 и q32 — отвечать до просмотра вариантов ответа — [C35](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35), [Q3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q3), [Q5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5), [Q31](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q31), [Q32](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q32)
  - Готово, когда: q3, q5, q31, q32: ответ до вариантов совпал с разбором и по результату, и по причине; объяснение по-английски; названо, чем q31 (безымянный результат) отличается от q3, а q32 (recover в своей горутине) — от q5.
- [ ] W2-2 порядок defer и W2-3 SafeDiv (recover → error). Проговор W2-3; без текста повторить проговор W2-1 из понедельника — [W2-2, W2-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic), проговор: «W2-3. SafeDiv»
  - Готово, когда: Порядок трёх defer предсказан до запуска; SafeDiv(1, 0) возвращает 0 и ошибку без паники наружу. Изменённое условие: деление на два вызова глубже, затем в отдельной горутине — объяснено, почему в первом случае recover ловит панику, а во втором нет.
- [ ] Дополнительно: 100 Go Mistakes — разделы Functions and Methods, Error Management *(по желанию)* — [100go.co](https://100go.co/)

### Ср · 90 мин

- [ ] LeetCode 347. Top K Frequent Elements + проговор (записать на телефон) — [LC 347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/), проговор: «LC 347. Top K Frequent Elements»
- [ ] Вариация на зачёт (≈20 мин): ErrAccountClosed в W1-2 — закрытый счёт отклоняет Deposit и Withdraw; через Transfer, после двух обёрток, errors.Is отличает его от нехватки средств — [W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account), [C39](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39)
  - Готово, когда: Тест: перевод с закрытого счёта и на закрытый — errors.Is(err, ErrAccountClosed) истинно, а errors.Is(err, ErrInsufficientFunds) ложно, при нехватке средств — наоборот; после отказа балансы прежние, в том числе когда Deposit отказал уже после Withdraw. По-английски: почему sentinel, а не сравнение текста ошибки.
- [ ] Вариация на зачёт (≈10 мин): typed nil — в W2-1 вернуть nil *ValidationError через error; до запуска сказать, что увидит вызывающий, затем исправить возврат — [W2-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation), [C33](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33), [Q2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2)
  - Готово, когда: До запуска сказано, что для корректного пользователя err != nil и почему: в интерфейсе тип *ValidationError и nil-указатель; TestValid это ловит. Исправление — return nil литералом, тесты W2-1 снова зелёные.
- [ ] Вариация на зачёт (≈10 мин): defer — значение параметром против захвата переменной замыканием; изменить переменную после defer и предсказать вывод, затем — что вернёт return с именованным и с безымянным результатом. Если LC 347 заняла больше часа — эту вариацию перенести в резерв недели — [C35](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35), [Q31](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q31), [W2-2, W2-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic)
  - Готово, когда: До запуска предсказано: аргумент defer вычисляется в момент defer, замыкание читает переменную при выходе, вызовы идут в обратном порядке; отложенное замыкание меняет именованный результат после return, а безымянный — нет. Предсказание совпало с запуском.

### Чт · 90 мин

- [ ] Map по спецификации: порядок обхода не задан, запись в nil map — panic, адрес элемента взять нельзя, ключ должен быть сравнимым; map не потокобезопасна. Отдельно: после delete map не уменьшает свою таблицу, но удалённые значения сама больше не удерживает — [C32](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c32), [C40](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40), [Q33](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q33), [Spec: Map types](https://go.dev/ref/spec#Map_types), [Go maps in action](https://go.dev/blog/maps)
  - Готово, когда: Без подсказки: правила map из спецификации и отличие «таблица не уменьшается» от «удалённые значения map не удерживает»; до запуска сказано, что вернёт чтение из nil map и что сделает запись в неё; q33 — до вариантов.

### Сб · 240 мин

- [ ] Шпаргалка Go vs Kotlin своими словами: nil/zero values, ошибки, struct vs data class, embedding, interfaces, видимость — [C40](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40), [C65](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c65), [Q33](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q33), [Q34](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q34), [Q52](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q52)
  - Готово, когда: Таблица своими словами; к каждой строке — пример кода, который ведёт себя иначе, чем в Kotlin. c40 и c65 — ответ до раскрытия; q33 (ключ map), q34 и q52 (встраивание) — до вариантов.
- [ ] LeetCode 238. Product of Array Except Self + проговор (записать) — [LC 238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/), проговор: «LC 238. Product of Array Except Self»
- [ ] Повтор LC 1 без текста (≈15 мин): решить Two Sum с чистого листа и проговорить по 4 шагам, диалог не открывать; follow-up про отсортированный массив — своими словами
  - Готово, когда: LC 1 решена заново без подсказки и проговорена за 5 минут без текста; follow-up про отсортированный массив — два указателя — объяснён; запись сделана.
- [ ] Самопроверка недели вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы
  - Готово, когда: Все вопросы обоих блоков, кроме Tell me about yourself (это отдельная задача), — ответ по-английски без подсказки, до минуты на вопрос; ошибочные отмечены для повтора.
- [ ] Tell me about yourself, версия 0 (≈15 мин): 60–90 секунд по-английски — кто ты, чем силён, почему Go; записать — проговор: «Why Go»
  - Готово, когда: Запись 60–90 секунд без чтения с листа: роль, один результат с числом, почему Go.

**LeetCode недели:** [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) (Hash map + buckets), [238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) (Prefix/suffix)

**Проговорить по-английски:**

- *How does error handling in Go differ from exceptions in Kotlin or Java?*
- *What is a zero value and why does it matter?*
- *When do you use a pointer receiver?*
- *Why can returning a nil pointer as an error give the caller a non-nil error?*
- *Tell me about yourself — version 0, 60–90 seconds.*

**Самопроверка:**

- Какие нулевые значения у int, string, *T, []T, map[K]V, chan T и error?
- Чем errors.Is отличается от errors.As?
- Когда метод объявлять на pointer receiver?
- Почему nil-указатель, возвращённый как error, даёт err != nil?
- В каком порядке выполняются отложенные вызовы и когда вычисляются их аргументы?

**Материал сайта:**

- [C39 How do you add context to an error, and when do you use errors.Is, errors.As and errors.Join?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c39)
- [Q29 %v вместо %w](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q29)
- [Q30 errors.Join и errors.Unwrap](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q30)
- [Q20 Результат записи отчёта](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q20)
- [Практикум W2-1 ValidationError и errors.As](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-validation)
- [C35 When do deferred calls run, and where can recover stop a panic?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c35)
- [Q3 Return до завершения defer](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q3)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5)
- [Q31 Defer и безымянный результат](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q31)
- [Q32 Recover в своей горутине и nil map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q32)
- [Практикум W2-2, W2-3 Порядок defer и SafeDiv](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-deferpanic)
- [Практикум W1-2 Account: pointer receiver и sentinel-ошибка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account)
- [C33 What does an interface value contain, and why can a typed nil make an interface non-nil?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c33)
- [Q2 Nil-указатель внутри error](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2)
- [C32 What do delete and clear release, and what can you rely on during map iteration?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c32)
- [C40 What is the zero value of each kind of type, and which nil values are safe to use?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c40)
- [Q33 Какой тип может быть ключом map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q33)
- [C65 How does embedding differ from inheritance, and what trap does it set for a Java or Kotlin developer?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c65)
- [Q34 Встраивание и неоднозначный метод](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q34)
- [Q52 «Переопределённый» метод и встраивание](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q52)

## Неделя 3. Идиомы Go II: slice, map, строки, generics, тесты (23.11–29.11)

**Цель:** Уверенно отвечать на «что выведет код» про slice и map, писать table-driven тесты и простой generic-код, объясняя всё вслух.

**Готово, когда:** 10 задач «что выведет код» из плана и q1 решены с объяснением; CLI txsum покрыт тестами; LC 3, 15, 739 проговорены; CI в go-prep зелёный, тренировка с ассемблером пройдена.

### Пн · 90 мин

- [ ] Slice изнутри: header (ptr, len, cap), рост при append, общий backing array, copy, s[a:b:c] — [C29](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29), [Go Slices: usage and internals](https://go.dev/blog/slices-intro), [The mechanics of append](https://go.dev/blog/slices)
  - Готово, когда: c29: ответ до раскрытия; объяснено, зачем ограничивать cap в s[a:b:c]. Изменённое условие: append после s[:1:1]. P1, P2 и P10 из блока «Что выведет код» (ниже на этой странице) решены до сверки.
- [ ] Ловушки aliasing и удержания памяти — сначала ответ без вариантов — [Q6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q6), [Q4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q4)
  - Готово, когда: q4 и q6: дефект найден до вариантов. q6 — исправление копией или ограничением cap; q4 — только копией: ограничение cap большой массив не освобождает.
- [ ] LeetCode 3. Longest Substring Without Repeating Characters + проговор — [LC 3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/), проговор: «LC 3. Longest Substring Without Repeating Characters»

### Вт · 90 мин

- [ ] По желанию: SwissTable в Go 1.24+ — достаточно уметь сказать одну фразу, что изменилось *(по желанию)* — [C30](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c30), [C31](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c31), [SIM7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim7)
- [ ] Строки: string vs []byte vs []rune, UTF-8, strings.Builder. Дополнительно: 100 Go Mistakes — Data Types, Strings, Control Structures — [C41](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c41), [Strings, bytes, runes and characters in Go](https://go.dev/blog/strings), [100go.co](https://100go.co/)
  - Готово, когда: P8 решена до сверки; c41 — ответ до раскрытия; по-английски: что возвращают len(s), s[i] и range по строке.
- [ ] W3-1 Remove(s, i) в двух версиях + тест, показывающий порчу исходного slice. Проговор (записать) — [W3-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-removeslice), проговор: «W3-1. Remove»
  - Готово, когда: Тест показывает порчу исходного slice наивной версией и независимость версии с копией; объяснено поведение slices.Delete с Go 1.22.
- [ ] Битовые операции (≈30 мин): диаграмма 9 — &, |, ^, &^, сдвиги, маски степени двойки, приоритет & и ==; ответы вслух до раскрытия *(по желанию)* — [SIM9](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim9)

### Ср · 90 мин

- [ ] Generics: type parameters, any, comparable, constraints с ~, cmp.Ordered; в Go 1.27 — generic-методы (у метода свои параметры типа; у методов интерфейса — нет, и generic-метод не может реализовать метод интерфейса) — [C42](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c42), [W3-2, W3-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-generics), [Tutorial: Getting started with generics](https://go.dev/doc/tutorial/generics)
  - Готово, когда: Свой Set[T comparable] компилируется; объяснено, почему ключ map должен быть сравнимым.
- [ ] W3-2 Map/Filter/Reduce и Set[T comparable]; W3-3 та же функция через интерфейс — сравнить — [W3-2, W3-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-generics), [C42](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c42), проговор: «W3-3. Generics vs interfaces»
  - Готово, когда: Map/Filter/Reduce с тестами; абзац «generic или интерфейс» с одним контрпримером; практика c42 выполнена.
- [ ] LeetCode 15. 3Sum + проговор — [LC 15. 3Sum](https://leetcode.com/problems/3sum/), проговор: «LC 15. 3Sum»

### Чт · 120 мин

- [ ] Модули, пакеты, internal/, раскладка cmd/ + internal/; задачи недель 1–3 — пакетами в своём go-prep — [C43](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c43), [Справка: Свой репозиторий go-prep: раскладка, команды, CI](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep)
  - Готово, когда: c43: ответ до раскрытия; объяснено, что даёт internal/ и чем пакет отличается от модуля; раскладка cmd/internal — вариант, не стандарт. В go-prep задачи недель 1–3 лежат в week1/, week2/ и week3/, go test ./... из корня проходит.
- [ ] Тесты: table-driven, t.Run, t.Helper, t.Parallel, go test -cover, golangci-lint; в go-prep — CI на GitHub Actions: vet, test -race, golangci-lint. Learn Go with Tests: 2–3 главы — [C44](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c44), [Q35](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q35), [Справка: go-prep: CI на GitHub Actions](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep/ci), [Справка: Тесты в Go: table-driven, подтесты, тренировка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing), [package testing](https://pkg.go.dev/testing), [Learn Go with Tests](https://quii.gitbook.io/learn-go-with-tests)
  - Готово, когда: Table-driven тест с t.Run и t.Helper; один параллельный тест на изолированных данных; go test -race проходит; q35 (t.Parallel и defer) — до вариантов, исправление через t.Cleanup. CI в go-prep зелёный; намеренно сломанный тест делает его красным.
- [ ] Покрыть тестами W1-2 и W3-2 — в go-prep, рядом с тестами практикума — [W1-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account), [W3-2, W3-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-generics)
  - Готово, когда: Тесты W1-2 и W3-2 покрывают ошибки и граничные случаи, а не только успешный путь; go test -cover ./week1/account ./week3/generics показывает покрытие.
- [ ] Проговор «что выведет код» P1–P5: по одной английской фразе-объяснению — проговор: ««Что выведет код»: как объяснять»
  - Готово, когда: P1–P5: вывод назван до сверки, объяснение — одна фраза по-английски.
- [ ] Тренировка (≈30 мин): сборка с ассемблером и без — -gcflags=-S, '-N -l', -m, go tool objdump, GOSSAFUNC, бенчмарк с -benchmem — [Справка: go-prep: тренировка — сборка с ассемблером и без](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep/asm), [C6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c6), [C24](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24)
  - Готово, когда: Без подсказки: где Add держит аргументы на amd64 и arm64; что делают -N и -l и когда они нужны; почему встроенной функции может не быть в бинарнике; чем -gcflags отличается от -gcflags=all=.

### Сб · 240 мин

- [ ] «Что выведет код»: P1–P10 из плана и замыкание в цикле — сначала ответ, потом сверка — [Q1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q1)
  - Готово, когда: 10 задач и q1: вывод до сверки; для P9 объяснена зависимость от версии языка в go.mod.
- [ ] Дополнительно: задачи из банков вопросов собеседований (вторичный материал, ответы сверять с документацией) *(по желанию)* — [39 вопросов (Нияз)](https://t.me/niyaz_golang/758), [ТОП-12 Ozon](https://t.me/niyaz_golang/672)
- [ ] W3-4 CLI txsum: CSV account,amount,currency → балансы; ошибки строк собирать; table-driven тесты парсера — [W3-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-txsum), проговор: «W3-4. txsum CLI»
  - Готово, когда: Тесты: валидная строка, пропущенная колонка, нечисловая сумма, неизвестная валюта; ненулевой код выхода при ошибочных строках.
- [ ] LeetCode 739. Daily Temperatures + проговор (записать) — [LC 739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/), проговор: «LC 739. Daily Temperatures»
- [ ] Дополнительно: LC 56 Merge Intervals и LC 146 LRU Cache *(по желанию)* — [LC 146. LRU Cache](https://leetcode.com/problems/lru-cache/), проговор: «LC 146. LRU Cache»
- [ ] Дополнительно: вопросы интервьюера Senior Go с Хабра про slice, map, каналы, ошибки — ответить, потом сверить с документацией *(по желанию)* — [Habr: «Коллеги, вы меня огорчаете»](https://habr.com/ru/articles/521582)
- [ ] Контрольная точка: квиз по идиомам — q1–q6 в режиме «сначала ответ без вариантов». q1, q2, q3, q6 — те же ловушки, что P9, P6, P5 и P1–P2 из первой задачи дня, но в виде рабочего кода: проверка, что понял, а не запомнил ответ; q4 и q5 — новые — [Q1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q1), [Q2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2), [Q3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q3), [Q4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q4), [Q5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5), [Q6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q6)
  - Готово, когда: q1–q6: ответ до вариантов, причина названа верно не меньше чем в 5 из 6; ошибки — в повтор.

**LeetCode недели:** [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) (Sliding window), [15. 3Sum](https://leetcode.com/problems/3sum/) (Two pointers), [739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) (Monotonic stack), [56. Merge Intervals](https://leetcode.com/problems/merge-intervals/) (Intervals), [146. LRU Cache](https://leetcode.com/problems/lru-cache/) (Design: map + list)

**Проговорить по-английски:**

- *How does append work and when does it reallocate?*
- *Are Go maps safe for concurrent use?*
- *When would you use generics, and when would you avoid them?*
- *How do you structure tests in Go?*
- *Tell me about yourself — version 1, with one concrete story and a number.*

**Самопроверка:**

- Что происходит при append, когда len == cap? И когда len < cap?
- Почему нельзя написать &m["k"]?
- Три способа безопасно использовать map из нескольких горутин?
- Чем []byte(s) отличается от []rune(s), что возвращает len(s)?
- Как выглядит table-driven тест и зачем t.Helper()?

**Материал сайта:**

- [C29 What do a slice and a string refer to, and when does append allocate a new backing array?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c29)
- [Q6 Два append и один общий массив](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q6)
- [Q4 16 байт из большого буфера](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q4)
- [C30 How did classic Go maps use buckets and incremental growth before Swiss Tables?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c30)
- [C31 How do Swiss Tables find a key and grow a Go map?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c31) *(Deep Dive)*
- [SIM7 Диаграмма 7: map — бакеты, поиск в Swiss Tables и память](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim7)
- [C41 What do len, indexing and range return for a Go string, and when do you need []rune?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c41)
- [Практикум W3-1 Remove: на месте и с копией](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-removeslice)
- [SIM9 Диаграмма 9: битовые операции — маски, флаги и SWAR в рантайме](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim9)
- [C42 When do you choose generics, and when an interface?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c42)
- [Практикум W3-2, W3-3 Generics: Map, Filter, Reduce, Set и Max против интерфейса](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-generics)
- [C43 What is the difference between a module and a package, and what does an internal directory enforce?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c43)
- [Справка: Свой репозиторий go-prep: раскладка, команды, CI](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep)
- [C44 How do you write a table-driven test, and what do t.Run, t.Helper, t.Parallel and t.Cleanup change?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c44)
- [Q35 Параллельные подтесты и defer](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q35)
- [Справка: go-prep: CI на GitHub Actions](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep/ci)
- [Справка: Тесты в Go: table-driven, подтесты, тренировка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-testing)
- [Практикум W1-2 Account: pointer receiver и sentinel-ошибка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-account)
- [Справка: go-prep: тренировка — сборка с ассемблером и без](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/go-prep/asm)
- [C6 What must the runtime restore to resume a goroutine?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c6) *(Deep Dive)*
- [C24 How does escape analysis choose storage, and how do you verify a particular allocation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24)
- [Q1 Три функции после завершения цикла](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q1)
- [Практикум W3-4 CLI txsum: суммы из CSV](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-txsum)
- [Q2 Nil-указатель внутри error](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q2)
- [Q3 Return до завершения defer](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q3)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5)

**Чего пока нет на сайте:**

- В quiz «Сначала свой ответ» и в «Что выведет код» ответ пишется своими словами и автоматически не сверяется.

## Неделя 4. Конкурентность I: горутины, каналы, select, sync (30.11–06.12)

**Цель:** Писать worker pool, pipeline и fan-in без гонок и утечек и объяснять по-английски, кто владеет горутиной и кто закрывает канал.

**Готово, когда:** W4-1…W4-5 работают под go test -race (в go-prep: ./week4/...); на каждый ответ «кто закрывает канал и как горутина завершится» есть одно предложение.

### Пн · 90 мин

- [ ] Горутины, WaitGroup; горутина vs поток ОС; data race vs race condition — [C1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c1), [C2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2), [The Go Memory Model](https://go.dev/ref/mem), [Data Race Detector](https://go.dev/doc/articles/race_detector)
  - Готово, когда: c1 и c2: ответ по-английски до раскрытия; практика c2 выполнена. Изменённое условие: свой пример логической гонки без data race.
- [ ] Go blog: Pipelines and cancellation — [go.dev/blog/pipelines](https://go.dev/blog/pipelines)
  - Готово, когда: Пересказана схема отмены пайплайна: кто сигнализирует остановку и как каждая стадия завершается.
- [ ] LeetCode 155. Min Stack + проговор — [LC 155. Min Stack](https://leetcode.com/problems/min-stack/)

### Вт · 90 мин

- [ ] Каналы: буфер что меняет и чего не меняет (закон Литтла); nil/open/closed; диаграмма передачи значения — [C13](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c13), [C14](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c14), [SIM3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim3), [Q45](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q45)
  - Готово, когда: Таблица nil/open/closed для отправки, приёма и close — по памяти; шаги sim3 предсказаны до переключения.
- [ ] W4-1 Worker pool: N воркеров, канал задач, канал результатов, отправитель закрывает канал после всех отправок. Проговор — [W4-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool), [C12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12), [Q15](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q15), [C63](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63), проговор: «W4-1. Worker pool»
  - Готово, когда: Тесты: не больше N одновременных задач, все результаты получены, отмена в середине завершает всех воркеров, медленный потребитель не ведёт к неограниченной памяти; -race чистый.
- [ ] W4-2 Pipeline generator → square → sink с остановкой через context — [W4-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-pipeline), [C63](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63)
  - Готово, когда: Тест: отмена или ранний выход потребителя останавливает все стадии; зависших горутин нет.

### Ср · 90 мин

- [ ] select: выбор ветки, default, отмена — только Base-уровень; задача с запасной веткой — сначала ответ без вариантов — [C18](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c18), [Q22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q22)
  - Готово, когда: c18 и q22: ответ до вариантов; объяснено, почему проверка ctx перед select не даёт строгого приоритета отмены.
- [ ] W4-3 Fan-in merge нескольких каналов с WaitGroup и закрытием выхода — [W4-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanin)
  - Готово, когда: Выход закрывается после закрытия всех входов; отмена прерывает работу; тест на пустой набор входов.
- [ ] Code review без вариантов: на вкладке quiz включить «Сначала свой ответ», записать баг и исправление, потом открыть варианты и разбор — [Q12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12), [Q15](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q15), [Q21](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q21)
  - Готово, когда: q12, q15, q21 в режиме «Сначала свой ответ» (вкладка quiz): дефект и исправление записаны до вариантов и совпали с разбором по причине.
- [ ] LeetCode 567. Permutation in String + проговор (записать) — [LC 567. Permutation in String](https://leetcode.com/problems/permutation-in-string/)

### Чт · 90 мин

- [ ] sync: Mutex, RWMutex, Once, WaitGroup, Cond, atomic; channel vs mutex — дерево решения (диаграмма 12); CAS — диаграммы 5 (CAS) и 8 (Mutex) с ответами вслух — [C15](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c15), [C20](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c20), [C21](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c21), [C22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22), [C56](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c56), [SIM12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim12), [SIM5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim5), [SIM8](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim8)
  - Готово, когда: c15, c20, c21, c22, c56: ответы до раскрытия; объяснено, почему atomic не защищает составной инвариант и почему Wait вызывают в цикле.
- [ ] W4-4 Счётчик тремя способами (Mutex, atomic, канал) + бенчмарк. W4-5 SafeCache на map + RWMutex — [W4-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-counter), [W4-5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-safecache), проговор: «W4-4. Mutex vs atomic vs channel»
  - Готово, когда: Счётчик тремя способами даёт один результат под -race; SafeCache не отдаёт наружу ссылку на защищённые данные; вывод бенчмарка без «всегда быстрее».
- [ ] Ловушки sync: копия WaitGroup, повторный Lock, double-checked locking, указатель из защищённой map; deadlock, livelock и starvation (диаграмма 11); Cond: Signal вместо Broadcast, if вместо for — [Q7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q7), [Q8](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q8), [Q13](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q13), [Q14](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q14), [C55](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c55), [SIM11](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim11), [Q44](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q44), [Q46](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q46), [Q47](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q47)
  - Готово, когда: q7, q8, q13, q14, q44, q46, q47: дефект до вариантов; исправленный код объяснён. c55: ответ до раскрытия, названы четыре условия Коффмана и какое ломает порядок блокировок.

### Сб · 240 мин

- [ ] Прогнать W4-1…W4-5 в go-prep: go test -race ./week4/...; для каждой горутины записать владельца и путь завершения — [W4-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool), [W4-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-pipeline), [W4-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanin), [W4-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-counter), [W4-5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-safecache)
  - Готово, когда: Для каждой горутины W4-1…W4-5 записаны владелец и условие завершения; все тесты под -race проходят.
- [ ] Дополнительно: 100 Go Mistakes — Concurrency Foundations *(по желанию)* — [100go.co](https://100go.co/)
- [ ] LeetCode 150. Evaluate Reverse Polish Notation + проговор — [LC 150. Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)
- [ ] Проговор worker pool и «channel vs mutex» по-английски, записать — проговор: «W4-1. Worker pool»
  - Готово, когда: Запись 3–5 минут: worker pool по 4 шагам и выбор mutex или channel на примере.
- [ ] Самопроверка недели вслух
  - Готово, когда: Вопросы самопроверки — по-английски без подсказки.

**LeetCode недели:** [155. Min Stack](https://leetcode.com/problems/min-stack/) (Stack), [567. Permutation in String](https://leetcode.com/problems/permutation-in-string/) (Sliding window), [150. Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) (Stack)

**Проговорить по-английски:**

- *How does a goroutine differ from an OS thread?*
- *Can a program have a race condition without a data race?*
- *What does a channel buffer change, and what does it not change?*
- *Who should close a channel, and why?*
- *When would you choose a mutex over a channel?*

**Самопроверка:**

- Что произойдёт при чтении/записи/закрытии nil, открытого и закрытого канала?
- Почему закрывает канал отправитель, а не получатель?
- Как ограничить число одновременно работающих горутин?
- Чем atomic не заменяет mutex для составного инварианта?
- Как бы ты проверил отсутствие гонок в CI?

**Материал сайта:**

- [C1 What is a goroutine, and how does it differ from an OS thread?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c1)
- [C2 Can a program have a race condition without a data race?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2)
- [C13 What does a channel buffer change, and what does it not change?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c13)
- [C14 How do nil, open, and closed channels behave?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c14)
- [SIM3 Диаграмма 3: Канал — ожидание, буфер и close](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim3)
- [Q45 большой буфер и закон Литтла](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q45)
- [Практикум W4-1 Worker pool с отменой](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool)
- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12)
- [Q15 Собрать результаты параллельных вычислений](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q15)
- [C63 Which channel patterns do you actually use in a Go service, and who closes each channel?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63)
- [Практикум W4-2 Pipeline с остановкой по context](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-pipeline)
- [C18 How does select choose a case, and can cancellation take priority?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c18)
- [Q22 Чтение с запасной веткой](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q22)
- [Практикум W4-3 Fan-in: слияние каналов](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanin)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12)
- [Q21 Срез после передачи через канал](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q21)
- [C15 Channels or a mutex — who owns the data, and what must happen together?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c15)
- [C20 What does compare-and-swap do, and why is a separate check and store different?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c20)
- [C21 How does a mutex acquire, wait and hand off — and what does 1 ms really mean?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c21)
- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22)
- [C56 What is sync.Cond for, and why must Wait sit in a loop?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c56)
- [SIM12 Диаграмма 12: Канал, мьютекс или одна горутина — дерево решения](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim12)
- [SIM5 Диаграмма 5: CAS — сравнить и заменить одним действием](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim5)
- [SIM8 Диаграмма 8: sync.Mutex — быстрый путь, ожидание и режим голодания](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim8)
- [Практикум W4-4 Счётчик тремя способами](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-counter)
- [Практикум W4-5 SafeCache: инвариант под RWMutex](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-safecache)
- [Q7 Копия WaitGroup и чужой счётчик](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q7)
- [Q8 Повторный Lock и цикл ожидания](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q8)
- [Q13 Чтения защищены, но проверка устарела](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q13)
- [Q14 Баланс из общей map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q14)
- [C55 Deadlock, livelock, starvation — how do they differ, and how do you prevent a deadlock?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c55)
- [SIM11 Диаграмма 11: Deadlock, livelock и starvation — кто кого ждёт](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim11)
- [Q44 TryLock и вежливый отступ](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q44)
- [Q46 Signal вместо Broadcast](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q46)
- [Q47 if вместо for вокруг Wait](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q47)

## Неделя 5. Конкурентность II и минимум рантайма (07.12–13.12)

**Цель:** Писать за 20–30 минут отменяемые конкурентные решения (errgroup, rate limit, graceful shutdown) и на базовом уровне объяснять GMP, GC и escape analysis.

**Готово, когда:** 6 эталонных решений пишутся за 20–30 мин; найдена утечка горутины через pprof; пройдены контрольный квиз и виртуальный live coding («финальный босс» с тестом на утечки); go test -race ./week5/... в go-prep зелёный.

### Пн · 90 мин

- [ ] context: отмена, таймауты, WithoutCancel; передача ctx в I/O — [C22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22), [Q9](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q9), [Q10](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q10), [C72](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c72), [package context](https://pkg.go.dev/context)
  - Готово, когда: c22, q9, q10: ответ до раскрытия; объяснено, что отмена контекста не останавливает код, который ctx не проверяет.
- [ ] W5-1 ParallelFetch: errgroup.WithContext + SetLimit, первая ошибка отменяет остальных — [W5-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-parallelfetch), [Q16](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q16), [C63](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63), [errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup), проговор: «W5-1. ParallelFetch with errgroup»
  - Готово, когда: Тесты: первая ошибка отменяет остальные; SetLimit соблюдается; к возврату все запущенные операции завершены; контекст группы не используется после Wait.
- [ ] LeetCode 200. Number of Islands + проговор — [LC 200. Number of Islands](https://leetcode.com/problems/number-of-islands/)

### Вт · 90 мин

- [ ] select-паттерны и ловушки: errgroup после Wait, eager evaluation, time.After в цикле — [Q16](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q16), [Q17](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q17), [Q11](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q11)
  - Готово, когда: q16, q17, q11: ответ до вариантов; для q11 названо, что изменилось в Go 1.23 и почему важна версия в go.mod.
- [ ] W5-2 Rate limiter token bucket; сравнить с golang.org/x/time/rate. Проговор — [W5-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-ratelimit), [x/time/rate](https://pkg.go.dev/golang.org/x/time/rate), проговор: «W5-2. Rate limiter»
  - Готово, когда: Тесты: отказ сверх лимита, burst, восстановление после паузы; отличие от x/time/rate описано.

### Ср · 90 мин

- [ ] Утечки горутин: как найти и предотвратить — [W5-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-leak), [C12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12)
  - Готово, когда: c12: ответ и практика без подсказки. Изменённое условие: утечка при уходе потребителя.
- [ ] W5-3 Graceful shutdown HTTP-сервера: signal.NotifyContext, Shutdown с таймаутом, дренаж фоновых воркеров — [W5-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-shutdown), [C22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22), [http.Server.Shutdown](https://pkg.go.dev/net/http#Server.Shutdown), [signal.NotifyContext](https://pkg.go.dev/os/signal#NotifyContext), проговор: «W5-3. Graceful shutdown»
  - Готово, когда: Тест: новые запросы не принимаются, работа в полёте завершается, зависимости закрываются после воркеров; таймаут соблюдается.
- [ ] W5-4 Написать утечку намеренно и найти её goroutine-профилем pprof — [W5-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-leak)
  - Готово, когда: Утечка воспроизведена и найдена в goroutine-профиле; исправление подтверждено тестом завершения своих горутин, а не числом NumGoroutine.
- [ ] LeetCode 102. Binary Tree Level Order Traversal + проговор — [LC 102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

### Чт · 90 мин

- [ ] Минимум рантайма для интервью: GMP и GOMAXPROCS, вытеснение, netpoller — короткие ответы; диаграмма 2 до шага 10 «ответ за минуту» — [C7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7), [SIM2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim2), [C8](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c8), [C10](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c10)
  - Готово, когда: c7, c8, c10: ответ по-английски за 30 секунд без деталей реализации; шаги sim2 предсказаны до переключения; ответ за минуту по шагу 10 — вслух, без подсказки, в его порядке; пять частых вопросов шага 11 — ответ до раскрытия.
- [ ] Память: стек vs куча, escape analysis, GC на высоком уровне, GOGC/GOMEMLIMIT — [W5-5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-escape), [C23](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c23), [C24](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24), [C26](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c26), [C27](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c27), [SIM6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim6), [A Guide to the Go Garbage Collector](https://go.dev/doc/gc-guide)
  - Готово, когда: c23, c24, c26, c27: ответы до раскрытия; объяснено, почему GOMEMLIMIT не гарантирует отсутствие OOM.
- [ ] W5-5 Escape analysis: go build -gcflags=-m для трёх функций, объяснить каждую строку вывода — [W5-5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-escape)
  - Готово, когда: Для трёх функций объяснена каждая строка вывода -gcflags=-m; одна функция изменена так, чтобы переменная осталась на стеке, и это проверено повторно.
- [ ] По желанию, Deep Dive: стек и регистры, work stealing, runnext, устройство каналов и selectgo, аллокатор, write barrier, weak/unique, итераторы *(по желанию)* — [C3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c3), [C4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c4), [C5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c5), [C6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c6), [C9](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c9), [C11](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c11), [C16](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c16), [C17](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c17), [C19](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c19), [C25](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c25), [C28](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28), [C36](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c36), [C37](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c37), [SIM1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim1), [SIM4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim4)

### Сб · 240 мин

- [ ] W5-6 Бенчмарк + CPU-профиль на txsum: go test -bench, pprof top/list — [W5-6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-profile), [Go Diagnostics](https://go.dev/doc/diagnostics)
  - Готово, когда: Профиль снят; гипотеза проверена изменением и повторным бенчмарком; вывод без обещаний конкретной скорости.
- [ ] Новое в 1.25+: container-aware GOMAXPROCS, testing/synctest — одна фраза на каждое — [C38](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c38)
  - Готово, когда: c38: по одной фразе про GOMAXPROCS в контейнерах (Linux, Go 1.25) и про synctest, с версиями.
- [ ] LeetCode 98. Validate Binary Search Tree + проговор — [LC 98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
- [ ] Контрольная точка: квиз по конкурентности в режиме «сначала ответ без вариантов» — [Q5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5), [Q7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q7), [Q8](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q8), [Q9](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q9), [Q10](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q10), [Q11](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q11), [Q12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12), [Q13](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q13), [Q14](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q14), [Q15](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q15), [Q16](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q16), [Q17](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q17), [Q21](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q21), [Q22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q22)
  - Готово, когда: Все 14 задач: ответ до вариантов; результат первой попытки записан; ошибки — в повтор.
- [ ] Виртуальный live coding (Claude как интервьюер): «финальный босс» — processParallel(in, out, 5) за 5 с с тестом на утечки; проговор по-английски, разбор. В воскресный резерв — каты блоков 1–2 трека (К1.2, К2.2, К2.4 обязательно) — [К2.6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-6), [W4-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool), [Блок 1. Микропаттерны](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k1), [Блок 2. select, context, утечки](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2)
  - Готово, когда: «Финальный босс» решён вслух за 40 минут, тест на утечки зелёный (что это значит — в шаге К2.6); получен разбор; три слабых места записаны.

**LeetCode недели:** [200. Number of Islands](https://leetcode.com/problems/number-of-islands/) (Grid DFS/BFS), [102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) (BFS), [98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) (Tree DFS)

**Проговорить по-английски:**

- *How do you cancel a group of goroutines when one of them fails?*
- *How would you implement a rate limiter in a single instance, and across many instances?*
- *How would you find and prevent a goroutine leak?*
- *Explain the GMP model in 30 seconds.*
- *Why might a variable escape to the heap, and how do you check it?*

**Самопроверка:**

- Что гарантирует и чего не гарантирует отмена context для уже запущенной работы?
- Чем errgroup.WithContext отличается от WaitGroup?
- Порядок действий при graceful shutdown сервиса с фоновыми воркерами?
- Что ограничивает GOMAXPROCS и почему потоков ОС может быть больше?
- Что задаёт GOGC и чего не гарантирует GOMEMLIMIT?

**Материал сайта:**

- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22)
- [Q9 Результат после отмены запроса](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q9)
- [Q10 Время жизни запроса и фоновой работы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q10)
- [C72 What do you put into a context.Context in a Go service, and what do you keep out of it?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c72)
- [Практикум W5-1 ParallelFetch: errgroup с лимитом](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-parallelfetch)
- [Q16 Контекст errgroup после успешного Wait](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q16)
- [C63 Which channel patterns do you actually use in a Go service, and who closes each channel?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63)
- [Q17 Заполненный канал и сигнал остановки](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q17)
- [Q11 Ожидание следующего сообщения](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q11)
- [Практикум W5-2 Rate limiter: token bucket](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-ratelimit)
- [Практикум W5-4 Утечка горутин: написать, найти профилем, исправить](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-leak)
- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12)
- [Практикум W5-3 Graceful shutdown: HTTP, воркеры, зависимость](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-shutdown)
- [C7 How do G, M and P relate to GOMAXPROCS?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7)
- [SIM2 Диаграмма 2: Очереди, вытеснение, перехват работы и ожидание](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim2)
- [C8 How does Go preempt a CPU-bound goroutine?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c8)
- [C10 How do network polling, blocking syscalls and cgo affect G, M and P?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c10)
- [Практикум W5-5 Escape analysis: прочитать -gcflags=-m и убрать аллокации](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-escape)
- [C23 How do stack and heap allocation differ, and how do you compare their cost?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c23)
- [C24 How does escape analysis choose storage, and how do you verify a particular allocation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24)
- [C26 How does Go's GC decide what to keep, and what happens during a collection?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c26)
- [C27 How do GC phases, mark assists, GOGC and GOMEMLIMIT affect memory and latency?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c27)
- [SIM6 Диаграмма 6: Аллокатор памяти (mcache / mspan) и Трёхцветный сборщик мусора (Tri-Color GC)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim6)
- [C3 What happens when Go starts a goroutine?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c3)
- [C4 Where is a goroutine stack allocated, and what does StackInuse measure?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c4)
- [C5 How does a goroutine stack grow, and why do pointers remain valid?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c5) *(Deep Dive)*
- [C6 What must the runtime restore to resume a goroutine?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c6) *(Deep Dive)*
- [C9 How does the scheduler find work and steal from another P?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c9)
- [C11 What is P.runnext, and how does it interact with fairness?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c11) *(Deep Dive)*
- [C16 Why does a channel wait queue contain sudog records instead of just goroutines?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c16)
- [C17 How does a channel safely hand a value to a waiting receiver?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c17) *(Deep Dive)*
- [C19 Does every select call selectgo, and how does the general path work?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c19) *(Deep Dive)*
- [C25 How do mcache, mcentral, mheap and scan/noscan fit together?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c25)
- [C28 What does Go's hybrid write barrier protect, and which pointer writes need it?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c28) *(Deep Dive)*
- [C36 When should you use weak pointers, unique handles and runtime cleanups?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c36)
- [C37 How do push iterators differ from iter.Pull, and when must you call stop?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c37) *(Deep Dive)*
- [SIM1 Диаграмма 1: Кто выполняется, где стек, откуда продолжить](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim1)
- [SIM4 Диаграмма 4: select — от компилятора до пробуждения](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim4)
- [Практикум W5-6 Бенчмарк и профиль: txsum под pprof](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-profile)
- [C38 What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c38)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q5)
- [Q7 Копия WaitGroup и чужой счётчик](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q7)
- [Q8 Повторный Lock и цикл ожидания](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q8)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12)
- [Q13 Чтения защищены, но проверка устарела](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q13)
- [Q14 Баланс из общей map](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q14)
- [Q15 Собрать результаты параллельных вычислений](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q15)
- [Q21 Срез после передачи через канал](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q21)
- [Q22 Чтение с запасной веткой](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q22)
- [Ката К2.6 · «Финальный босс»: processParallel(in, out, 5) за 5 с](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-6)
- [Практикум W4-1 Worker pool с отменой](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool)
- [Трек: Блок 1. Микропаттерны](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k1)
- [Трек: Блок 2. select, context, утечки](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2)

**Чего пока нет на сайте:**

- Deep Dive-карточки не помечены как «не обязательно для EU-интервью» — легко потратить на них время недель 4–5.
- Нет задачи на чтение trace-вывода (go tool trace); профиль pprof разбирается в «Бенчмарк и профиль» и «Утечка горутин».

## Неделя 6. Проект I: каркас ledger-сервиса (14.12–20.12)

**Цель:** Сервис счетов и переводов работает end-to-end: REST, PostgreSQL через pgx, миграции, структурные логи, Docker Compose.

**Готово, когда:** Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском; каты К2.5 и К2.7 решены на время, тесты зелёные.

### Пн · 90 мин

- [ ] ADR-001 (EN): scope — счета, переводы, балансы, double-entry; что вне scope
  - Готово, когда: ADR на английском: контекст, решение, альтернативы, последствия; что в scope и вне его.
- [ ] Раскладка: cmd/ledger, internal/http, internal/ledger, internal/store; Money в int64 минорных единицах — [C57](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c57), [C58](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c58), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference)
  - Готово, когда: Пакет ledger не импортирует net/http и драйвер БД; Money в int64 покрыт тестами.
- [ ] LeetCode 230. Kth Smallest Element in a BST + проговор — [LC 230. Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)

### Вт · 90 мин

- [ ] HTTP на net/http с шаблонами маршрутов Go 1.22+: POST /accounts, POST /transfers, GET /accounts/{id}; JSON — в Go 1.27 encoding/json работает поверх json/v2 (строже к невалидному UTF-8 и повторяющимся именам в v2) — [W6-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-accountsapi), [C45](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c45), [SIM10](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim10), [Q36](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q36), [Q37](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q37), [C60](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c60), [Routing enhancements (Go 1.22)](https://go.dev/blog/routing-enhancements), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference)
  - Готово, когда: Три маршрута работают; тесты через httptest на успешный ответ, 404 и 405. c45 и диаграмма 10 — ответ до раскрытия; q36 и q37 — до вариантов.
- [ ] Валидация входа и ошибки → HTTP-коды через errors.As (из W2-1) — [W6-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-httperr), [C46](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c46), [Q39](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q39)
  - Готово, когда: Ошибка валидации → 400 с полем; нехватка средств → выбранный код с записанным обоснованием; неизвестная ошибка → 500 без деталей наружу; тест на каждый случай. c46 — ответ до раскрытия; q39 — до вариантов.

### Ср · 90 мин

- [ ] PostgreSQL через pgx/v5 и pgxpool; миграции (goose или golang-migrate) — [C64](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c64), [pgx](https://pkg.go.dev/github.com/jackc/pgx/v5)
  - Готово, когда: Миграции применяются на чистой БД; у пула заданы лимиты и таймаут подключения.
- [ ] Управление ресурсами SQL: defer Rollback, rows.Close, rows.Err, пул соединений — [C47](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47), [Q18](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q18), [Q19](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q19)
  - Готово, когда: q18 и q19: ответ до вариантов; в коде проверяются rows.Close и rows.Err, Rollback безопасен после Commit; тест на ошибку посреди итерации. c47 — ответ до раскрытия.
- [ ] LeetCode 236. Lowest Common Ancestor of a Binary Tree + проговор — [LC 236. Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)

### Чт · 90 мин

- [ ] log/slog в JSON, request id в контексте; конфиг из переменных окружения — [C48](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c48), [Q38](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q38), [C71](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c71), [log/slog](https://pkg.go.dev/log/slog)
  - Готово, когда: JSON-логи с request id; секреты не логируются; конфиг из окружения с понятной ошибкой при отсутствии значения. c48 — ответ до раскрытия; q38 — до вариантов.
- [ ] Docker Compose: postgres + сервис; healthcheck
  - Готово, когда: docker compose up поднимает сервис после healthcheck БД.

### Пт · 45 мин

- [ ] LeetCode 215. Kth Largest Element in an Array (heap) + проговор — [LC 215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)

### Сб · 240 мин

- [ ] Перевод end-to-end: создание счетов, перевод, проверка балансов через curl
  - Готово, когда: Сценарий end-to-end и тесты отказов: нехватка средств, несуществующий счёт, повтор запроса; сумма балансов сходится.
- [ ] Проговор по-английски: «Walk me through your project structure and why» — [C57](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c57), проговор: «Рассказ о структуре проекта»
  - Готово, когда: Запись 3 минуты по-английски: структура, одно решение и его цена, что бы изменил.
- [ ] Ката К2.5 (20 мин): обёртка с таймаутом — три версии, утечку находит тест — [К2.5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-5), [W6-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-timeout)
  - Готово, когда: три версии: `close(done)` и `time.After` перестают ждать, но работу не прерывают; небуферизованный канал результата — горутина висит навсегда; `ctx` и буфер 1 — без утечек
- [ ] Ката К2.7 (20 мин): одна утечка — три детектора: goleak, профиль goroutineleak, synctest — [К2.7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-7), [W5-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-leak)
  - Готово, когда: одна и та же утечка поймана `goleak.VerifyNone`, профилем `goroutineleak` и `synctest`; названо, чего каждый не видит: goleak — только горутины, живые в конце теста, и ложно ловит ещё спящие; `goroutineleak` — не видит горутин на канале, достижимом из глобальной переменной; `synctest` — только горутины своего пузыря и только на операциях, которые он считает «прочной» блокировкой (не мьютекс и не ввод-вывод)

**LeetCode недели:** [230. Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) (Tree DFS), [236. Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) (Tree DFS), [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) (Heap)

**Проговорить по-английски:**

- *Walk me through the structure of your service.*
- *Why int64 minor units instead of float64 for money?*
- *How do you map domain errors to HTTP status codes?*

**Самопроверка:**

- Где в коде граница транзакции и кто её открывает?
- Что будет с соединением, если забыть rows.Close?
- Почему бизнес-логика не зависит от net/http?

**Материал сайта:**

- [C57 How do you lay out a Go service, and which way should dependencies point?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c57)
- [C58 How do you wire dependencies in a Go service: by hand, with Wire, or with Fx?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c58)
- [Практикум W6-1 HTTP API счетов на стандартном ServeMux](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-accountsapi)
- [C45 What happens to a request inside net/http, and which deadlines should a Go HTTP server set?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c45)
- [SIM10 Диаграмма 10: HTTP-запрос в net/http — горутина, контекст, shutdown](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim10)
- [Q36 http.Error без return](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q36)
- [Q37 Маршруты Go 1.22 и 405](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q37)
- [C60 How do you build a REST API in Go: hand-written routes or OpenAPI-first code generation, and what goes into middleware?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c60)
- [Практикум W6-2 Ошибки домена → HTTP-коды](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-httperr)
- [C46 How do you turn domain errors into HTTP status codes without leaking internals?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c46)
- [Q39 errors.As с целью-значением](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q39)
- [C64 Which libraries make up a typical Go backend service, and why those?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c64)
- [C47 What is *sql.DB, and how do you keep connections and transactions from leaking?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c47)
- [Q18 Ошибка запроса и отложенная очистка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q18)
- [Q19 Ранний break, defer и занятые соединения](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q19)
- [C48 How do you log with log/slog in a service, and how do you keep secrets out of logs?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c48)
- [Q38 Пароль в структурном логе](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q38)
- [C71 Where do you redact sensitive data in a Go service's logs, so that a new field or a new route cannot leak it?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c71)
- [Ката К2.5 · Обёртка с таймаутом: три версии](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-5)
- [Практикум W6-3 Обёртка с таймаутом](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-timeout)
- [Ката К2.7 · Одна утечка — три детектора](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k2-7)
- [Практикум W5-4 Утечка горутин: написать, найти профилем, исправить](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-leak)

**Чего пока нет на сайте:**

- Нет шаблона ADR и примеров «как рассказать про проект» по-английски.

## Неделя 7. Проект II: транзакции, идемпотентность, outbox → Kafka (21.12–27.12)

**Цель:** Повтор перевода безопасен, события доходят до Kafka через outbox, инвариант суммы балансов держится под конкурентной нагрузкой.

**Готово, когда:** Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат; каты К3.1 и К3.2 решены на время, тесты зелёные.

### Пн · 90 мин

- [ ] Уровни изоляции PostgreSQL; перевод в одной транзакции: SELECT … FOR UPDATE в стабильном порядке ID против дедлока — [C49](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c49), [C50](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c50), [W7-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-transfers), [C67](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c67), [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
  - Готово, когда: Перевод — одна транзакция: обе строки блокируются SELECT … FOR UPDATE по возрастанию ID, баланс проверяется под блокировкой, 40001 и 40P01 повторяются с BEGIN. c49 и c50 — ответ до раскрытия; W7-1 проходит go test -race.
- [ ] LeetCode 973. K Closest Points to Origin + проговор — [LC 973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

### Вт · 90 мин

- [ ] Идемпотентность: таблица ключей с UNIQUE и сохранённым ответом; другой payload с тем же ключом → ошибка — [C51](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c51), [W7-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-idempotency), [C68](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c68), проговор: «Идемпотентность платежей»
  - Готово, когда: Таблица idempotency_keys: ключ с UNIQUE, отпечаток запроса, сохранённые статус и тело; повтор возвращает сохранённый ответ, другой payload с тем же ключом — 422. c51 — ответ до раскрытия; W7-2 проходит go test -race.
- [ ] Гонка двух одинаковых запросов: атомарная вставка ключа, а не «проверить, потом вставить» — [Q40](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q40), [W7-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-idempotency), [C2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2)
  - Готово, когда: Тест: два одинаковых запроса одновременно — один перевод. Ключ занимается INSERT … ON CONFLICT DO NOTHING в транзакции перевода; объяснено, почему -race молчит при «проверить, потом вставить». q40 — до вариантов.

### Ср · 90 мин

- [ ] Transactional outbox: запись события в той же транзакции, что и перевод — [C52](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c52), [Q42](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q42), [W7-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-outbox), [C66](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c66), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference), проговор: «Transactional outbox»
  - Готово, когда: Событие пишется в outbox в той же транзакции, что и перевод; при откате нет ни перевода, ни события. c52 — ответ до раскрытия; q42 — до вариантов.
- [ ] Relay-воркер публикует в Kafka (at-least-once): владелец горутины, остановка, ретраи — [W7-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-outbox), [C52](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c52), [C12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12), [C22](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22), [C63](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63), [C66](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c66), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference)
  - Готово, когда: Relay — одна горутина с владельцем: останавливается по ctx, после ошибки повторяет то же событие, отправленным помечает только после подтверждения; при остановке сервиса её дожидаются. W7-3 проходит go test -race.
- [ ] LeetCode 621. Task Scheduler + проговор — [LC 621. Task Scheduler](https://leetcode.com/problems/task-scheduler/)

### Чт · 90 мин

- [ ] Consumer с идемпотентной обработкой; consumer groups, партиции, порядок по ключу — [C53](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c53), [Q43](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q43), [W7-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-outbox), [Apache Kafka documentation](https://kafka.apache.org/documentation/)
  - Готово, когда: Потребитель фиксирует offset после обработки; ID события и результат — в одной транзакции; дубликат не меняет данные (тест); ключ сообщения — ID счёта. c53 — ответ до раскрытия; q43 — до вариантов.
- [ ] Docker Compose: добавить Kafka
  - Готово, когда: docker compose up поднимает Kafka и сервис; relay публикует событие перевода, потребитель его читает.

### Пт · 45 мин

- [ ] LeetCode 435. Non-overlapping Intervals + проговор — [LC 435. Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)

### Сб · 240 мин

- [ ] Конкурентный тест: 100 параллельных переводов, инвариант суммы, go test -race — [W7-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-transfers), [Q41](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q41), [C50](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c50)
  - Готово, когда: 100 параллельных переводов: сумма балансов неизменна, отрицательных балансов нет, -race чистый, встречные переводы не дают дедлока. q41 — до вариантов.
- [ ] Проговор: «How do you avoid double spending?» и «Why outbox instead of publishing after commit?» — [C51](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c51), [C52](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c52), проговор: «Transactional outbox»
  - Готово, когда: Две записи по 2 минуты по-английски: идемпотентность (ключ, отпечаток, атомарный захват) и outbox (двойная запись, at-least-once, дедупликация).
- [ ] Индексы PostgreSQL (≈45 мин): B-tree и составной индекс, EXPLAIN ANALYZE на запросе истории переводов счёта; найти и убрать N+1 — [C54](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c54), [PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html), [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
  - Готово, когда: Для запроса истории счёта — EXPLAIN ANALYZE до и после составного индекса (account_id, created_at); найден и убран N+1. c54 — ответ до раскрытия.
- [ ] Ката К3.1 (10 мин): fan-in на время — Merge(ctx, ins...) с чистого листа — [К3.1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-1), [W4-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanin)
  - Готово, когда: `Merge(ctx, ins...)` с чистого листа за 10 минут; пустой список закрывает выход сразу; отмена завершает все горутины
- [ ] Ката К3.2 (25 мин): fan-out по ключу — как партиции Kafka этой недели — [К3.2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-2), [W7-4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanout)
  - Готово, когда: значения с одним ключом всегда идут в один выход и в порядке поступления (как партиции Kafka); медленный получатель тормозит всех — или отбрасывается, по выбору. Термин: у Балуна fan-out — маршрутизация в один из N каналов, у skill issue и Cox-Buday — N стадий читают один вход; на собеседовании уточни, о каком смысле речь

**LeetCode недели:** [973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) (Heap), [621. Task Scheduler](https://leetcode.com/problems/task-scheduler/) (Greedy / heap), [435. Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/) (Greedy intervals)

**Проговорить по-английски:**

- *How do you make a payment API idempotent?*
- *Why use a transactional outbox?*
- *What delivery guarantee does your consumer have, and how do you handle duplicates?*
- *How do you prevent deadlocks when two transfers lock the same accounts?*

**Самопроверка:**

- Что произойдёт, если процесс упадёт между commit и публикацией в Kafka без outbox?
- Почему exactly-once на уровне бизнес-эффекта достигается идемпотентностью потребителя?
- Какой уровень изоляции выбран для перевода и почему?

**Материал сайта:**

- [C49 What do PostgreSQL isolation levels guarantee, and which one do you use for a transfer?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c49)
- [C50 How do you transfer money between two accounts safely under concurrency, without deadlocks?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c50)
- [Практикум W7-1 Параллельные переводы: порядок блокировок и инвариант](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-transfers)
- [C67 How do you run one transaction across several repositories in Go, and what breaks with a connection pooler and advisory locks?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c67)
- [C51 How do you make a payment API idempotent?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c51)
- [Практикум W7-2 Идемпотентный перевод: ключ, отпечаток и сохранённый ответ](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-idempotency)
- [C68 A call to a payment provider timed out. Did the payment fail, and how do you make such a call safe to repeat?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c68)
- [Q40 проверить ключ, потом списать](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q40)
- [C2 Can a program have a race condition without a data race?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c2)
- [C52 What is a transactional outbox, and why not publish to Kafka right after commit?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c52)
- [Q42 публикация после commit](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q42)
- [Практикум W7-3 Outbox и relay: at-least-once и идемпотентный потребитель](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-outbox)
- [C66 How do you build a task queue on PostgreSQL for a Go service, and when do you move to Kafka?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c66)
- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c12)
- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c22)
- [C63 Which channel patterns do you actually use in a Go service, and who closes each channel?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63)
- [C53 What delivery guarantee does a Kafka consumer give, and how do you handle duplicates and ordering?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c53)
- [Q43 offset зафиксирован до обработки](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q43)
- [Q41 встречные переводы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q41)
- [C54 How do you find and fix a slow query: indexes, EXPLAIN ANALYZE and N+1?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c54)
- [Ката К3.1 · Fan-in на время](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-1)
- [Практикум W4-3 Fan-in: слияние каналов](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanin)
- [Ката К3.2 · Fan-out по ключу](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-2)
- [Практикум W7-4 Fan-out по ключу](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-fanout)

**Чего пока нет на сайте:**

- Нет диаграммы «перевод → outbox → Kafka → потребитель»: путь события пока только в карточках c52, c53 и задаче W7-3.
- Практикум недели работает в памяти; PostgreSQL и Kafka в Docker Compose проверяются только в своём проекте.

## Неделя 8. Проект III: gRPC, тесты, бенчмарки (28.12–03.01)

**Цель:** У сервиса есть gRPC API, интеграционные тесты на настоящих PostgreSQL и Kafka, бенчмарк горячего пути.

**Готово, когда:** Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов; каты К3.5 и К3.8 решены на время, тесты зелёные.

### Пн · 90 мин

- [ ] proto + генерация (buf или protoc); gRPC Transfer и GetBalance — [C61](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61), [gRPC Go quick start](https://grpc.io/docs/languages/go/quickstart/)
- [ ] LeetCode 133. Clone Graph + проговор — [LC 133. Clone Graph](https://leetcode.com/problems/clone-graph/)

### Вт · 90 мин

- [ ] Interceptors: логирование, дедлайн, перевод ошибок в gRPC-статусы — [C61](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61)
- [ ] Проговор: «REST vs gRPC — when would you choose which?» — [C61](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61), [C60](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c60), проговор: «REST vs gRPC»

### Ср · 90 мин

- [ ] Unit-тесты: table-driven, фейки на границах, без sleep для синхронизации
- [ ] testing/synctest для кода со временем (Go 1.25) — [C38](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c38), [testing/synctest](https://pkg.go.dev/testing/synctest)
- [ ] LeetCode 207. Course Schedule + проговор — [LC 207. Course Schedule](https://leetcode.com/problems/course-schedule/)

### Чт · 90 мин

- [ ] Интеграционные тесты: testcontainers-go для PostgreSQL и Kafka — [testcontainers-go](https://golang.testcontainers.org/)
- [ ] golangci-lint и go test -race в CI

### Пт · 45 мин

- [ ] LeetCode 994. Rotting Oranges + проговор — [LC 994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)

### Сб · 240 мин

- [ ] Бенчмарк горячего пути + allocs/op; если есть аллокации — escape analysis — [C24](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24)
- [ ] Покрытие: где тестов нет намеренно и почему (записать в README)
- [ ] Ката К3.5 (30 мин): ограничение работы в полёте — задача W4-1 пулом, семафором и errgroup.SetLimit — [К3.5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-5), [W4-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool)
  - Готово, когда: одна задача W4-1 в трёх формах — классический пул; семафор на `chan struct{}` со слотом до `go`; `errgroup.SetLimit` — и все три проходят тесты W4-1. Названа позиция Mills: работу ограничивают семафором, а не пулом простаивающих воркеров (сегодня то же даёт `errgroup.SetLimit`); стадия, которая живёт до закрытия входа, — нормальна
- [ ] Ката К3.8 (25 мин): errgroup на каналах и sync.Once; сравнить с x/sync/errgroup — [К3.8](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-8), [W5-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-parallelfetch)
  - Готово, когда: свой `Group` на каналах и `sync.Once`: `Go`, `Wait`, первая ошибка, отмена остальных через `ctx`; сравнить с `x/sync/errgroup`

**LeetCode недели:** [133. Clone Graph](https://leetcode.com/problems/clone-graph/) (Graph DFS/BFS), [207. Course Schedule](https://leetcode.com/problems/course-schedule/) (Topological sort), [994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) (Multi-source BFS)

**Проговорить по-английски:**

- *REST vs gRPC — when would you choose which?*
- *How do you test code that talks to a database?*
- *How do you test time-dependent concurrent code without sleeps?*

**Самопроверка:**

- Что тестируется unit-тестом, а что только интеграционным?
- Как дедлайн клиента gRPC доходит до запроса в PostgreSQL?
- Что показал бенчмарк и какой вывод ты из него сделал?

**Материал сайта:**

- [C61 When do you choose gRPC over REST, and what does a production gRPC server in Go need?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61)
- [C60 How do you build a REST API in Go: hand-written routes or OpenAPI-first code generation, and what goes into middleware?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c60)
- [C38 What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c38)
- [C24 How does escape analysis choose storage, and how do you verify a particular allocation?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c24)
- [Ката К3.5 · Ограничение работы в полёте: пул, семафор, SetLimit](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-5)
- [Практикум W4-1 Worker pool с отменой](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-workerpool)
- [Ката К3.8 · Errgroup на каналах](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-8)
- [Практикум W5-1 ParallelFetch: errgroup с лимитом](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-parallelfetch)

**Чего пока нет на сайте:**

- Нет разобранного интеграционного теста на testcontainers-go: в c64 библиотека только названа.

## Неделя 9. Проект IV: production-readiness, CV (04.01–10.01)

**Цель:** Репозиторий можно показать работодателю: наблюдаемость, CI, README с решениями; есть черновик CV на английском.

**Готово, когда:** Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском; каты К3.6 и К3.9 решены на время, тесты зелёные.

### Пн · 90 мин

- [ ] OpenTelemetry: трассы и метрики для HTTP/gRPC; /healthz и /readyz — [OpenTelemetry Go](https://opentelemetry.io/docs/languages/go/)
- [ ] LeetCode 210. Course Schedule II + проговор — [LC 210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

### Вт · 90 мин

- [ ] Graceful shutdown всего сервиса: HTTP, gRPC, relay-воркер, consumer (из W5-3) — [C59](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c59), [C63](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63), [C61](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference)
- [ ] GitHub Actions: lint, test -race, build Docker-образа

### Ср · 90 мин

- [ ] README: схема архитектуры, как запустить, 3–5 ADR, компромиссы и что бы сделал дальше — [C58](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c58), [C64](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c64), [C71](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c71)
- [ ] LeetCode 684. Redundant Connection (union-find) + проговор — [LC 684. Redundant Connection](https://leetcode.com/problems/redundant-connection/)

### Чт · 90 мин

- [ ] Черновик CV на английском: «Senior backend engineer, Go + Kotlin, fintech»; проект — отдельной строкой со стеком
- [ ] Проверить карьерные страницы целевых компаний: открытые вакансии, требования к локации
- [ ] Ключевые слова из 5 целевых вакансий в CV (≈20 мин): стек, домен, уровень — только то, что реально делал; так CV проходит автоматический отбор (ATS)
- [ ] «Tell me about yourself» v1 (≈15 мин): 60–90 секунд по-английски — кто ты, чем силён, почему Go и эта компания; записать *(по желанию)*

### Пт · 45 мин

- [ ] LeetCode 743. Network Delay Time (Dijkstra) + проговор — [LC 743. Network Delay Time](https://leetcode.com/problems/network-delay-time/)

### Сб · 240 мин

- [ ] Виртуальный Craft Deep-Dive (Claude как интервьюер): 30 минут вопросов по проекту на английском; среди них — два о каналах в эталонном коде: К4.1 и К4.2 — [К4.1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k4-1), [К4.2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k4-2), проговор: «Craft Deep-Dive по проекту»
- [ ] Записать 3 вопроса, на которых запнулся, и дописать ответы в README/заметки
- [ ] Kubernetes-минимум для Go-сервиса (≈60 мин): Deployment и Service; liveness/readiness на /healthz и /readyz; requests/limits и как лимит CPU задаёт GOMAXPROCS (Go 1.25+); SIGTERM → graceful shutdown в terminationGracePeriodSeconds — [C7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7), [SIM2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim2), [C59](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c59), [Kubernetes: Pod lifecycle и завершение](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), [Kubernetes: liveness/readiness/startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), [Kubernetes: requests и limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [ ] Ката К3.6 (25 мин): остановка — done-канал и Shutdown, повторный вызов безопасен — [К3.6](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-6), [W5-3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-shutdown)
  - Готово, когда: `Shutdown` отменяет и дожидается; повторный вызов безопасен (`sync.Once`)
- [ ] Ката К3.9 (25 мин): rate limiter — leaky bucket против token bucket — [К3.9](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-9), [W5-2](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-ratelimit)
  - Готово, когда: leaky и token bucket на каналах; отказ против ожидания; сказано, что лимитер на каналах работает только в одном процессе

**LeetCode недели:** [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) (Topological sort), [684. Redundant Connection](https://leetcode.com/problems/redundant-connection/) (Union-find), [743. Network Delay Time](https://leetcode.com/problems/network-delay-time/) (Dijkstra)

**Проговорить по-английски:**

- *What was the hardest design decision in this project, and what would you change?*
- *How would you observe this service in production?*
- *What are the failure modes of your service?*

**Самопроверка:**

- Какие сигналы скажут, что сервис деградирует?
- Что произойдёт при SIGTERM во время перевода?
- Какие 3 компромисса ты сознательно принял?

**Материал сайта:**

- [C59 What should a Go service do between SIGTERM and exit?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c59)
- [C63 Which channel patterns do you actually use in a Go service, and who closes each channel?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c63)
- [C61 When do you choose gRPC over REST, and what does a production gRPC server in Go need?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c61)
- [C58 How do you wire dependencies in a Go service: by hand, with Wire, or with Fx?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c58)
- [C64 Which libraries make up a typical Go backend service, and why those?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c64)
- [C71 Where do you redact sensitive data in a Go service's logs, so that a new field or a new route cannot leak it?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c71)
- [Ката К4.1 · nil-канал выключает ветку select](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k4-1)
- [Ката К4.2 · Схлопывающийся сигнал: make(chan struct{}, 1) и неблокирующая отправка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k4-2)
- [C7 How do G, M and P relate to GOMAXPROCS?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c7)
- [SIM2 Диаграмма 2: Очереди, вытеснение, перехват работы и ожидание](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators/sim2)
- [Ката К3.6 · Остановка: done-канал и Shutdown](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-6)
- [Практикум W5-3 Graceful shutdown: HTTP, воркеры, зависимость](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-shutdown)
- [Ката К3.9 · Rate limiter: leaky bucket против token bucket](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-9)
- [Практикум W5-2 Rate limiter: token bucket](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-ratelimit)

**Чего пока нет на сайте:**

- Нет тренажёра Craft Deep-Dive: вопросы интервьюера по собственному проекту с follow-up.

## Неделя 10. Take-home, code review, первая волна откликов (11.01–17.01)

**Цель:** Сделать take-home в формате EU-компаний и уверенно ревьюить чужой Go-код за 40 минут.

**Готово, когда:** Второе портфолио-репо (API-клиент) с тестами и README; чек-лист ревьюера; 3 разобранных чужих PR; 5–10 откликов волны 1.

### Пн · 90 мин

- [ ] Take-home, часть 1 (≈90 мин): Go-клиент к REST API (create/fetch/delete, ошибки, ретраи, контекст) в формате задания Form3. Общий таймбокс 5–6 ч
- [ ] Дополнительно: LeetCode 70. Climbing Stairs + проговор *(по желанию)* — [LC 70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)

### Вт · 90 мин

- [ ] Take-home, часть 2 (≈90 мин): тесты, README с решениями, без лишних зависимостей

### Ср · 90 мин

- [ ] Code review (≈80 мин): 2 чужих Go-PR по 40 минут, комментарии письменно на английском — [Google: code review practices](https://google.github.io/eng-practices/review/), [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [ ] Дополнительно: LeetCode 198. House Robber + проговор *(по желанию)* — [LC 198. House Robber](https://leetcode.com/problems/house-robber/)

### Чт · 90 мин

- [ ] Code review по quiz сайта (≈45 мин): прочитать код задачи и написать комментарии ревьюера до вариантов ответа — [Q4](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q4), [Q10](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q10), [Q12](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12), [Q18](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q18), [Q19](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q19), [Q20](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q20)
- [ ] Собрать чек-лист ревьюера Go (≈45 мин): ошибки, контекст, горутины, ресурсы, тесты, API

### Сб · 240 мин

- [ ] Take-home, финал (≈150 мин): самоаудит по чек-листу, доработка
- [ ] Ещё 1 чужой PR в формате 40 минут — код с каналами из трека: tee с копией внутри цикла и «быстрый» tee (К3.3), or-done без select (К3.7), «решение без утечек» финального босса (К2.6) — [К3.3](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-3), [К3.7](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-7), [W10-1](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-tee)
- [ ] Отклики волны 1 (≈30 мин): Luxoft, ZeptoLab и похожие — 5–10
- [ ] Дополнительно: LeetCode 322. Coin Change + проговор (или перенести в резерв) *(по желанию)* — [LC 322. Coin Change](https://leetcode.com/problems/coin-change/)
- [ ] Таблица воронки (≈15 мин): отклик → ответ → скрининг → техинтервью → оффер; раз в неделю смотреть, где теряешься: мало ответов — менять CV и позиционирование, а не только число откликов

**LeetCode недели:** [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) (DP), [198. House Robber](https://leetcode.com/problems/house-robber/) (DP), [322. Coin Change](https://leetcode.com/problems/coin-change/) (DP)

**Проговорить по-английски:**

- *Walk me through the decisions in your take-home.*
- *What would you change if you had another day?*
- *How do you give code review feedback that is direct but not harsh?*

**Самопроверка:**

- Какие 5 пунктов ты проверяешь в любом Go-PR первым делом?
- Как ты поступаешь, если в take-home что-то неоднозначно?

**Материал сайта:**

- [Q4 16 байт из большого буфера](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q4)
- [Q10 Время жизни запроса и фоновой работы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q10)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q12)
- [Q18 Ошибка запроса и отложенная очистка](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q18)
- [Q19 Ранний break, defer и занятые соединения](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q19)
- [Q20 Результат записи отчёта](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz/q20)
- [Ката К3.3 · Tee](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-3)
- [Ката К3.7 · Or-done: разбор чужого кода](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k3-7)
- [Практикум W10-1 Tee и or-done](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/p-tee)

**Чего пока нет на сайте:**

- Нет режима code review целого PR со списком эталонных замечаний: пока есть quiz «Сначала свой ответ» и фрагменты чужого кода с закрытым разбором в треке «Каналы и context».

## Неделя 11. System Design I (18.01–24.01)

**Цель:** По шаблону за 40 минут вести дизайн вслух на английском и в каждом дизайне объяснять, почему Go.

**Готово, когда:** 3 дизайна проговорены и записаны; вторая волна откликов отправлена до праздников.

### Пн · 90 мин

- [ ] Шаблон ответа: requirements → API → data model → high-level → deep dive → bottlenecks → trade-offs — проговор: «Шаблон System Design»
- [ ] LeetCode 300. Longest Increasing Subsequence + проговор — [LC 300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)

### Вт · 90 мин

- [ ] Дизайн 1: Rate limiter на 100K RPS (один инстанс → распределённый) — [C69](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c69), [Rate limiter 100K RPS (itvector)](https://itvector.io/articles/rate-limiter-100k-rps)

### Ср · 90 мин

- [ ] Дизайн 2: Payments / ledger — на основе своего проекта (идемпотентность, outbox, сверка) — [C62](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c62), [C68](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c68), [C70](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c70), [Pinkponies Bank: платёжный сервис (GitHub)](https://github.com/aleksbeloushkin-srb/go-payments-reference), [Pinkponies Bank: банк из трёх сервисов (GitHub)](https://github.com/aleksbeloushkin-srb/pinkponies-bank)
- [ ] LeetCode 139. Word Break + проговор — [LC 139. Word Break](https://leetcode.com/problems/word-break/)

### Чт · 90 мин

- [ ] Дизайн 3: Notification service (каналы доставки, ретраи, дедупликация, приоритеты) — [C62](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c62), [C69](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c69), [Pinkponies Bank: банк из трёх сервисов (GitHub)](https://github.com/aleksbeloushkin-srb/pinkponies-bank)
- [ ] Отклики волны 2 до праздников: Topi, Bolt, Zendesk
- [ ] Рефералы: 3 контакта в целевых компаниях через LinkedIn и сообщества — коротко, с конкретной вакансией *(по желанию)*

### Сб · 240 мин

- [ ] Виртуальный System Design (Claude как интервьюер) по одному из трёх дизайнов, 45 минут
- [ ] Переслушать запись: где не назвал компромисс или не спросил требования
- [ ] LeetCode 62. Unique Paths + проговор — [LC 62. Unique Paths](https://leetcode.com/problems/unique-paths/)

**LeetCode недели:** [300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) (DP / binary search), [139. Word Break](https://leetcode.com/problems/word-break/) (DP), [62. Unique Paths](https://leetcode.com/problems/unique-paths/) (DP)

**Проговорить по-английски:**

- *Before I start, can I clarify the functional and non-functional requirements?*
- *Let me start with a simple design and then scale it.*
- *The main trade-off here is consistency versus availability…*
- *Why would Go be a good fit for this service?*

**Самопроверка:**

- Какие 3 вопроса по требованиям ты задаёшь всегда?
- Где в твоём дизайне единая точка отказа?
- Как бы ты оценил нагрузку на хранилище по числу запросов?

**Материал сайта:**

- [C69 How do you cache data in a Go service without a stampede or stale reads, and what does a Redis lock really guarantee?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c69)
- [C62 How do you implement long polling in Go so that thousands of waiting clients don't each hammer the database?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c62)
- [C68 A call to a payment provider timed out. Did the payment fail, and how do you make such a call safe to repeat?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c68)
- [C70 When do you need a workflow engine such as Temporal, and when is a task queue with periodic polling enough?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c70) *(Deep Dive)*

**Чего пока нет на сайте:**

- На сайте нет раздела System Design: шаблон, разобранные дизайны, вопросы интервьюера.
- Нет связки «механизм Go → архитектурное решение» (например, горутины и netpoller → почему Go для I/O-bound сервиса).

## Неделя 12. System Design II: event-driven и предметные дизайны (25.01–31.01)

**Цель:** Уверенно вести дизайн event-driven систем и предметные задачи целевых компаний.

**Готово, когда:** Ещё 3 дизайна проговорены; на вопрос про exactly-once есть точный ответ без мифов.

### Пн · 90 мин

- [ ] Event-driven: Kafka (партиции, порядок, consumer groups), outbox, sagas, ретраи и DLQ — [C70](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c70), [C66](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c66), [Pinkponies Bank: банк из трёх сервисов (GitHub)](https://github.com/aleksbeloushkin-srb/pinkponies-bank), проговор: «Transactional outbox»
- [ ] LeetCode 33. Search in Rotated Sorted Array + проговор — [LC 33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

### Вт · 90 мин

- [ ] Дизайн 4: Dispatch / delivery (назначение курьеров, гео-данные) — под Delivery Hero и Wolt

### Ср · 90 мин

- [ ] Дизайн 5: Inventory с резервированием (Quick Commerce): гонки за остаток, TTL резерва — [C69](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c69)

### Чт · 90 мин

- [ ] Дизайн 6: Multi-tenant SaaS (тикеты, как Zendesk): изоляция арендаторов, шардирование, noisy neighbour

### Сб · 240 мин

- [ ] Повторить один дизайн с нуля за 40 минут и записать
- [ ] 2 повторные задачи LeetCode из слабых тем с проговором
- [ ] Проговор «Kafka vs RabbitMQ: when would you choose which?» — журнал с партициями и хранением против брокера очередей с маршрутизацией и подтверждениями *(по желанию)* — [Apache Kafka: документация](https://kafka.apache.org/documentation/), [RabbitMQ: queues](https://www.rabbitmq.com/docs/queues)

**LeetCode недели:** [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) (Binary search)

**Проговорить по-английски:**

- *How do you guarantee ordering for events of the same account?*
- *What does exactly-once really mean in Kafka-based systems?*
- *How would you isolate tenants in a shared database?*

**Самопроверка:**

- Saga: оркестрация или хореография — когда что?
- Что делать с сообщением, которое стабильно падает в обработке?
- Как избежать overselling при параллельных резервах?

**Материал сайта:**

- [C70 When do you need a workflow engine such as Temporal, and when is a task queue with periodic polling enough?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c70) *(Deep Dive)*
- [C66 How do you build a task queue on PostgreSQL for a Go service, and when do you move to Kafka?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c66)
- [C69 How do you cache data in a Go service without a stampede or stale reads, and what does a Redis lock really guarantee?](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards/c69)

**Чего пока нет на сайте:**

- Нет материалов по предметным дизайнам целевых компаний.

## Неделя 13. Behavioral, легенда, CV (01.02–07.02)

**Цель:** 8 STAR-историй и рассказ о себе звучат естественно по-английски; CV и LinkedIn готовы.

**Готово, когда:** Истории записаны и проговорены; финальные CV и LinkedIn; список вопросов к компании.

### Пн · 90 мин

- [ ] STAR-истории 1–4: инцидент в проде, конфликт/несогласие, ownership, неопределённость — проговор: «STAR»
- [ ] LeetCode 981. Time Based Key-Value Store + проговор — [LC 981. Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/)

### Вт · 90 мин

- [ ] STAR-истории 5–8: менторство, дедлайн, кросс-командная работа, ошибка и вывод — проговор: «STAR»

### Ср · 90 мин

- [ ] «Why Go / why move from JVM?» и «Tell me about yourself» v2 — проговор: «Why Go»
- [ ] Deep-dive по финтех-опыту без NDA-деталей: что можно говорить, что обобщить

### Чт · 90 мин

- [ ] Финал CV и LinkedIn; позиционирование «Go + Kotlin backend, fintech»
- [ ] Вопросы к компании: команда, on-call, процесс релизов, рост

### Сб · 240 мин

- [ ] Прогон всех историй вслух с записью, сократить каждую до 2 минут
- [ ] Прогон на время, часть 1: каты К2.5 и К2.6 вслух, по 20–30 мин; остальные восемь — в воскресный резерв до мока 1 — [К5](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k5-1)
  - Готово, когда: К2.5, К2.6, К3.1, К3.2, К3.3, К3.4, К3.5, К3.6, К3.8, К3.9 — по 20–30 минут (К3.1 — 10), вслух по-английски, без подсказок; две первые — в субботу недели 13, остальные — в воскресный резерв до мока 1

**LeetCode недели:** [981. Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/) (Map + binary search)

**Проговорить по-английски:**

- *Tell me about a production incident you handled.*
- *Tell me about a time you disagreed with a technical decision.*
- *Why are you moving to Go?*
- *What would you do differently in your last project?*

**Самопроверка:**

- В каждой истории есть число или измеримый результат?
- Видна ли в истории твоя роль, а не только команды?
- Хватает ли 2 минут на историю?

**Материал сайта:**

- [Ката К5 · Обязательные каты подряд, вслух](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice/track-channels/k5-1)

**Чего пока нет на сайте:**

- Нет банка behavioral-вопросов с шаблоном STAR и тренировкой ответа вслух.

## Неделя 14. Моки и пик откликов (08.02–14.02)

**Цель:** Пройти полный цикл интервью в тренировочном режиме и выйти на реальные собеседования.

**Готово, когда:** 3 мока пройдены; назначены реальные собеседования; после каждого интервью вопросы занесены в журнал.

### Пн · 90 мин

- [ ] Мок 1: live coding (Pramp, interviewing.io или знакомые) — [Pramp](https://www.pramp.com/), [interviewing.io](https://interviewing.io/)
- [ ] LeetCode 1396. Design Underground System + проговор — [LC 1396. Design Underground System](https://leetcode.com/problems/design-underground-system/)

### Вт · 90 мин

- [ ] Мок 2: System Design

### Ср · 90 мин

- [ ] Полный виртуальный собес по плану Delivery Hero: coding + design + hiring manager + bar raiser

### Чт · 90 мин

- [ ] Мок 3: behavioral + Craft Deep-Dive
- [ ] Отклики волны 3: Delivery Hero, Wolt (с релокацией)

### Сб · 240 мин

- [ ] Журнал интервью: после каждого реального собеса записать вопросы и где запнулся; добавить их на сайт
- [ ] Вилки и переговоры: подготовить диапазон и ответ на вопрос о зарплатных ожиданиях
- [ ] 2 задачи LeetCode на время (45 минут, вслух)

**LeetCode недели:** [1396. Design Underground System](https://leetcode.com/problems/design-underground-system/) (Design: maps)

**Проговорить по-английски:**

- *What are your salary expectations?*
- *Do you have any questions for us?*
- *Is there anything you would like to add?*

**Самопроверка:**

- Какие темы чаще всего вызывали заминку на моках?
- Что из этого вернуть в повторение на следующей неделе?

**Чего пока нет на сайте:**

- Нет журнала реальных интервью, связанного с повторением тем на сайте.

## Опорные тексты для проговора

### LC 1. Two Sum — полный диалог с интервьюером

> **Interviewer:** Given an array of integers and a target, return the indices of two numbers that add up to the target.
>
> **You:** Before I start, a few questions. Is there always exactly one solution? Can I use the same element twice? Can the numbers be negative?
>
> **Interviewer:** Exactly one solution, no reuse, and yes, negatives are possible.
>
> **You:** The brute-force approach checks every pair, which is O(n²). We can do better with a hash map from value to index. For each number I compute the complement and check whether I've already seen it. If yes, I return both indices; if not, I store the current number.
>
> **You:** I check the complement first and only then insert the current value. That ordering is what prevents using the same element twice.
>
> **Interviewer:** What's the complexity?
>
> **You:** O(n) time, since map lookups are O(1) on average, and O(n) extra space.
>
> **Interviewer:** How would you test it?
>
> **You:** Small example: [2, 7, 11, 15] with target 9 returns [0, 1]. In a table-driven test I'd add negative numbers, duplicates like [3, 3] with target 6, and the pair at the very end.
>
> **Interviewer:** What if the array were sorted?
>
> **You:** Then two pointers, one at each end, give O(1) extra space: move the left pointer if the sum is too small, the right one if too large.

### LC 49. Group Anagrams

- **Clarify:** Are the strings lowercase English letters only? Does the output order matter?
- **Approach:** Anagrams share the same letter counts, so I build a key per word and group words in a map from key to list. In Go a [26]int array is comparable, so I can use it directly as a map key — no string building needed.
- **Complexity:** O(n · k) time, where k is the average word length, and O(n · k) space.
- **Edge cases & tests:** An empty string is a valid group of its own; a single word gives one group.
- **Follow-up:** What if the strings can contain any Unicode letters? — A [26]int key no longer works. I'd sort the runes of each word and use the sorted string as the key, which costs O(k log k) per word.

### LC 347. Top K Frequent Elements

- **Clarify:** Is k always valid? If two numbers have the same frequency, does the order matter?
- **Approach:** First count frequencies in a map. Then bucket sort: a slice of buckets indexed by frequency, which is at most n. Walk the buckets from the highest frequency and collect k numbers. A min-heap of size k is the alternative.
- **Complexity:** Buckets give O(n) time and O(n) space; the heap is O(n log k).
- **Edge cases & tests:** k equals the number of unique elements; all elements are the same.
- **Follow-up:** What if k is much smaller than the number of distinct values? — A min-heap of size k keeps only the best candidates: O(n log k) time and O(k) extra space on top of the counts.

### LC 238. Product of Array Except Self

- **Clarify:** Division isn't allowed, right? Can there be zeros?
- **Approach:** Two passes. Left to right I store the product of everything before each index. Right to left I keep a running suffix product and multiply it in. Zeros are handled naturally because I never divide.
- **Complexity:** O(n) time, O(1) extra space besides the output.
- **Edge cases & tests:** One zero; two zeros, where every result is zero; negative numbers.
- **Follow-up:** What if division were allowed? — Dividing the total product works only without zeros: with one zero only that index is non-zero, with two zeros everything is zero, so prefix and suffix products stay simpler.

### LC 3. Longest Substring Without Repeating Characters

- **Clarify:** Is the input ASCII, or should I handle Unicode runes? In Go that matters because indexing a string works on bytes.
- **Approach:** Sliding window. I keep the last index of each character. When I see a repeat inside the window, I move the left edge just past its previous position, and update the best length at each step.
- **Complexity:** O(n) time; space is O(min(n, alphabet size)).
- **Edge cases & tests:** An empty string; all characters the same; the whole string unique.

### LC 15. 3Sum

- **Clarify:** Should I return unique triplets only? Does the order matter?
- **Approach:** Sort the array. Fix the first element, then run two pointers on the rest: if the sum is too small move left forward, if too large move right back. Skip equal neighbours to avoid duplicate triplets.
- **Complexity:** O(n²) time; sorting is O(n log n) and doesn't change that. O(1) extra space besides the output.
- **Edge cases & tests:** Fewer than three elements; all zeros; many duplicates.

### LC 739. Daily Temperatures

- **Clarify:** Should days with no warmer day get 0?
- **Approach:** A monotonic stack of indices with decreasing temperatures. For each day, while today is warmer than the day on top of the stack, I pop it and record the distance. Then I push today.
- **Complexity:** Each index is pushed and popped once, so O(n) time and O(n) space.
- **Edge cases & tests:** Strictly decreasing temperatures, where every answer is zero; equal temperatures.

### LC 146. LRU Cache

- **Clarify:** Should Get and Put both be O(1)? On Put with an existing key, do I update it and mark it as most recent?
- **Approach:** A hash map plus a doubly linked list. The map gives O(1) access to the node; the list keeps the usage order, most recent at the front. Get moves the node to the front; Put inserts or updates at the front and evicts the tail when over capacity. In Go, container/list gives me the list, so the map holds *list.Element.
- **Complexity:** O(1) for both operations; O(capacity) space.
- **Edge cases & tests:** Capacity 1; Put on an existing key; Get on a missing key returns -1.
- **Follow-up:** How would you make it thread-safe? — A sync.Mutex. Even Get mutates the list, so an RWMutex doesn't help much. Under high contention I'd shard the cache by key hash.

### W1-1. Money

- **Approach:** I store money as int64 minor units, so 12.50 EUR is 1250, because float64 can't represent decimal amounts exactly and rounding errors are unacceptable in payments. String() formats whole and minor units with the number of decimals defined by the currency, plus the currency code.
- **Edge cases & tests:** Negative amounts, zero, amounts below one euro like 0.05.

### W1-2. Account

- **Approach:** Withdraw needs a pointer receiver because it mutates the balance. On insufficient funds I return a sentinel error wrapped with context using %w, so the caller can still check it with errors.Is.
- **Edge cases & tests:** A zero or negative amount, withdrawing exactly the balance or one unit more, and a successful transfer that keeps the total. Each is a row in a table-driven test. Rolling the money back matters only once Deposit can fail, for example on a closed account.
- **Follow-up:** Why not compare err == ErrInsufficientFunds? — After wrapping, err is a different value; errors.Is walks the chain and still finds the sentinel.

### W1-3. Method sets

- **Approach:** The method set of T contains only value-receiver methods; the method set of *T contains both. So if Notify has a pointer receiver, only *Service satisfies Notifier, and passing a Service value fails at compile time.
- **Edge cases & tests:** An element of map[string]Service cannot call Notify at all, and a struct that embeds *Service does satisfy Notifier.
- **Follow-up:** Why does the spec have this rule? — The usual rationale: the interface stores a copy that is not addressable, so a pointer method would have nothing to point to and could not change the caller's value.

### W2-1. ValidationError

- **Approach:** ValidationError is a struct that carries the field name; errors.As walks the wrapped chain and extracts it, so the handler can return a 400 with the exact field.
- **Edge cases & tests:** A valid user gets a literal nil, not a nil *ValidationError; when both fields are invalid, the email error comes first; errors.As still works through errors.Join.
- **Follow-up:** How do errors.Is and errors.As differ? — errors.Is compares against a specific value; errors.As matches by type and gives me the value.

### W2-3. SafeDiv

- **Approach:** A deferred function calls recover; if a panic happened, it converts it into an error through a named return value.
- **Edge cases & tests:** b equal to zero, a normal division like 7 / 2, and a panic two calls deeper, which recover still catches in the same goroutine.
- **Follow-up:** Would you use recover like this in production? — In Go panic is for programmer bugs, not control flow. I'd normally check for zero up front; recover belongs at boundaries like HTTP middleware, so one bad request doesn't crash the server.

### W3-1. Remove

- **Approach:** The order-preserving version is append(s[:i], s[i+1:]...). The catch is that it writes into the same backing array, so the caller's original slice changes too. The fast version swaps in the last element: O(1), but it loses the order.
- **Edge cases & tests:** slices.Delete also modifies the shared backing array, and since Go 1.22 it zeroes the vacated tail elements. If the caller still needs the original, I make an independent copy first, for example with slices.Clone.

### W3-3. Generics vs interfaces

- **Approach:** I use generics when the logic is identical for every type, like Map or a Set. I use an interface when each type behaves differently. Rule of thumb: write the concrete version first and generalize when a second use case appears.

### W3-4. txsum CLI

- **Approach:** I read the CSV with encoding/csv, parse each row into a transaction and aggregate balances in a map keyed by account and currency, using int64 minor units. Bad rows don't stop the run: I collect them with line numbers and report at the end, with a non-zero exit code if any failed.
- **Edge cases & tests:** Table-driven test for the row parser: valid row, missing column, non-numeric amount, unknown currency.

### «Что выведет код»: как объяснять

- P1 slice append into shared array — t has capacity 3, so append writes into the shared backing array and overwrites s[2].
- P3 nil map — reading returns the zero value, but writing panics: assignment to entry in nil map.
- P4 defer order — deferred calls run in LIFO order, and their arguments are evaluated when defer executes.
- P5 named result — return 1 assigns to the named result first, then the deferred function increments it.
- P6 typed nil — the interface holds the type *E with a nil value, so the interface itself isn't nil.
- P9 loop variable — since Go 1.22 a variable declared by the loop (:=) is new in each iteration; before 1.22, or with for i = range over an existing variable, all closures share one.

### W4-1. Worker pool

- **Clarify:** How many workers? Do results need to keep the input order? What happens if one job fails?
- **Approach:** I start N workers that range over a jobs channel and send to a results channel. The producer closes jobs after the last send; a separate goroutine waits on a WaitGroup for all workers and then closes results, so the consumer's range loop ends. Every goroutine has an owner and a clear exit: the channel closing or ctx.Done().
- **Complexity:** Concurrency is bounded by N, so memory and connections stay predictable under load.
- **Edge cases & tests:** Zero jobs; cancellation in the middle; a slow consumer — that's backpressure, the workers block on send instead of buffering unboundedly.

### W4-4. Mutex vs atomic vs channel

- **Approach:** For a single counter an atomic operation is usually the simplest fit; whether it is faster depends on contention, so I'd compare with a benchmark rather than assume. A mutex is right when the invariant spans several fields. A channel fits when I'm transferring ownership of data or coordinating work, not just protecting a variable.
- **Edge cases & tests:** An atomic protects one value; it doesn't make a check-then-act sequence on two values safe.

### W5-1. ParallelFetch with errgroup

- **Clarify:** Should one failure cancel the rest? Is there a limit on concurrent requests?
- **Approach:** errgroup.WithContext gives me a context that is cancelled on the first error. SetLimit bounds concurrency. Each fetch uses the group's context, so the other requests stop early. Wait returns the first error.
- **Edge cases & tests:** The derived context is cancelled after Wait returns, so it must not be used for work after Wait.

### W5-2. Rate limiter

- **Approach:** For a single instance, a token bucket: tokens refill at a fixed rate up to a burst size; a request takes a token or is rejected or waits. In Go I'd use golang.org/x/time/rate rather than hand-roll it. Across many instances the state must be shared — for example Redis with an atomic script — or each instance gets a share of the global limit.
- **Edge cases & tests:** Burst behaviour; clock skew between instances; what the client sees on rejection — 429 with Retry-After.

### W5-3. Graceful shutdown

- **Approach:** signal.NotifyContext gives me a context cancelled on SIGTERM. I stop accepting new requests with server.Shutdown and a timeout, cancel background workers through their context, and wait for them with a WaitGroup or errgroup before closing the database pool.
- **Edge cases & tests:** Shutdown order matters: stop intake first, drain in-flight work, then close dependencies. Kubernetes gives a grace period, so the timeout must fit inside it.

### Рассказ о структуре проекта

- **Approach:** cmd/ledger holds the wiring: config, logger, database pool and servers. internal/ledger is the domain — accounts, transfers and the rules — with no dependency on HTTP or SQL. internal/store implements persistence with pgx, and internal/http and internal/grpc are thin adapters. That keeps the domain testable with simple fakes.

### Идемпотентность платежей

- **Clarify:** Single process or several instances? How long do we keep keys? What if the same key comes with a different payload?
- **Approach:** The client sends an idempotency key. In the same transaction as the transfer I insert the key with a unique constraint and store the response. A retry with the same key returns the stored response; the same key with a different payload is rejected as a client error.
- **Edge cases & tests:** Two identical requests arriving at once: the unique constraint makes one insert win, so check-then-insert races are avoided.

### Transactional outbox

- **Approach:** Publishing to Kafka after the commit can fail, and then the event is lost. With an outbox I write the event to a table in the same transaction as the business change. A relay publishes pending rows and marks them sent. Delivery becomes at-least-once, so consumers must be idempotent.
- **Edge cases & tests:** Ordering per account: use the account ID as the Kafka key so its events land in one partition. That alone is not enough: the relay must publish rows in order, and producer retries must not reorder messages (idempotent producer). Each of these needs its own check.

### REST vs gRPC

- **Approach:** gRPC suits internal service-to-service calls: a typed contract, code generation, HTTP/2 streaming and deadlines that propagate. REST with JSON is better for public APIs and browsers, where tooling and readability matter more than efficiency.

### Craft Deep-Dive по проекту

- Start with the problem and constraints, then the design, then one decision you'd change.
- For each decision: the options, why this one, what it costs.
- Be honest about limits: what isn't tested, what wouldn't scale and why.

### Шаблон System Design

- Requirements: functional, then non-functional — scale, latency, consistency.
- API: main endpoints or events.
- Data model: entities, keys, where the data lives.
- High-level design: components and data flow.
- Deep dive: the one or two hardest parts.
- Bottlenecks and failures: what breaks first and how we notice.
- Trade-offs: what we chose and what we gave up.

### STAR

- Situation — one or two sentences of context.
- Task — what you were responsible for.
- Action — what you did, in first person, with technical detail.
- Result — a number or a concrete outcome, plus what you learned.

### Why Go

- **Approach:** I've built payment systems on the JVM for years. I'm moving to Go because I value its simplicity and explicitness — errors as values, a small language, fast builds — and its concurrency model fits I/O-heavy backend services. Many fintech and platform teams in Europe build in Go, and I've been practicing on a ledger service with the same problems I solve at work.

## Образцы ответов на английском (недели 1, 2, 3, 4, 6, 7)

Открывать после своей попытки вслух. *Remember* — одна строка для запоминания; ниже — короткий ответ для интервью. Сверять смысл, а не заучивать дословно.

**w1-mon-1** (неделя 1) — Tour of Go: Basics — packages, variables, functions, flow control, defer

<details><summary>Model answer (EN)</summary>

*Remember:* var x T gives the zero value; := declares and infers; defer runs LIFO.

Go has two ways to declare a variable: var x T declares one with its zero value and also works at package level. x := expr is a short declaration inside a function: it infers the type and must declare at least one new variable on the left. Deferred calls run when the surrounding function returns, last in, first out, and their arguments are evaluated when the defer statement runs.

</details>

**w1-tue-1** (неделя 1) — Tour: pointers, structs, arrays, slices, maps, function values, closures; что сравнимо и что может быть ключом map — справка

<details><summary>Model answer (EN)</summary>

*Remember:* A closure captures the variable, not a copy of its value.

A closure captures a variable, not a copy of its value. So if closures created in a loop all print the same final value, they share one variable, and a later change is visible inside each of them. Since Go 1.22, in modules declaring go 1.22 or later, a variable declared by the loop, as in for i := range, is new in each iteration, so those closures no longer share it. A variable declared before the loop and assigned with for i = range is still one variable shared by all iterations.

</details>

**w1-tue-3** (неделя 1) — W1-1 Money: тип в минорных единицах (int64) + валюта, метод String() → «12.50 EUR». Проговор

<details><summary>Model answer (EN)</summary>

*Remember:* Money is integer minor units plus a currency, never float64.

I store money as int64 minor units with a currency code, so 12.50 EUR is 1250. float64 cannot represent most decimal fractions exactly, and rounding errors accumulate in sums. String() splits major and minor units: 1250 becomes "12.50 EUR" and 5 becomes "0.05 EUR". I format the absolute value and prepend the sign, so -5 is "-0.05 EUR". The number of minor digits belongs to the currency: JPY has none and some currencies have three, so I don't hard-code 100.

</details>

**w1-wed-1** (неделя 1) — Tour: methods, interfaces, type assertions, type switches, Stringer, errors (упражнения Readers, rot13Reader и Images — по желанию)

<details><summary>Model answer (EN)</summary>

*Remember:* A type switch branches on the dynamic type inside an interface.

A type switch branches on the dynamic type stored in an interface: switch v := x.(type) runs the first case whose type matches it; in a case listing exactly one type, v already has that type, otherwise v keeps the type of x. Stringer is the fmt interface with String() string; fmt uses it for %v and %s, which is how a type controls its printed form.

</details>

**w1-wed-2** (неделя 1) — Карточки c33 и c34 — «Коротко по-английски», «Как это работает» и практика без вариантов ответа; quiz q2 и q28

<details><summary>Model answer (EN)</summary>

*Remember:* Interface = type + value; nil only if both are nil. Service has value methods, *Service has both.

A typed nil inside an interface is not really nil: returning a nil *MyErr as error gives the caller a non-nil error, because an interface value holds a dynamic type and a value and is nil only when both are nil. Service's method set has only its value-receiver methods; *Service's has both. So if Notify has a pointer receiver, *Service implements the interface and Service does not. Calling v.Notify() on a Service variable is only shorthand for (&v).Notify(); an element of map[K]Service or a function result of type Service cannot be called that way, while an element of map[K]*Service or a result of type *Service can.

</details>

**w1-sat-1** (неделя 1) — W1-3 Method sets: почему значение T не реализует интерфейс с pointer-методом

<details><summary>Model answer (EN)</summary>

*Remember:* Service lacks pointer-receiver methods in its method set; &Service{} has them.

It comes down to method sets: var _ Notifier = Service{} fails to compile when Notify has a pointer receiver, because the method set of Service does not include it; &Service{} works. The rule comes from the spec. The usual motivation: an interface stores a copy, and that copy is not addressable, so a pointer method would have nothing to point to and could not modify the caller's value.

</details>

**w1-sat-10** (неделя 1) — Самопроверка по типам и интерфейсам вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы

<details><summary>Model answer (EN)</summary>

*Remember:* Zero values are usable; pointer receiver to mutate or avoid copies; T lacks pointer methods; typed nil is not nil.

Zero values: 0 for int, "" for string, and nil for *T, []T, map[K]V, chan T and error. I use a pointer receiver when the method changes the receiver, or when the struct is large or must not be copied, for example because it holds a sync.Mutex; then I keep all methods of the type on pointers. If Notify has a pointer receiver, the method set of Service does not include it, so var _ Notifier = Service{} fails to compile, while &Service{} works. A nil *MyErr returned as error is not nil, because the interface stores the type *MyErr; it is nil only when both type and value are nil.

</details>

**w2-mon-1** (неделя 2) — Ошибки глубже: errors.New, fmt.Errorf("…: %w"), errors.Is/As, sentinel vs typed

<details><summary>Model answer (EN)</summary>

*Remember:* Sentinel for a condition, typed error for data; %v breaks the chain.

I use a sentinel error when callers only branch on a fixed condition, and a typed error when they need details such as the invalid field. With %w the cause stays in the chain; with %v it becomes plain text, so errors.Is and errors.As stop matching. errors.Join, since Go 1.20, combines several errors, and Is and As check each of them.

</details>

**w2-mon-2** (неделя 2) — W2-1 ValidationError: ошибка-тип с полем, errors.As через две обёртки, для корректного пользователя — обычный nil. Проговор

<details><summary>Model answer (EN)</summary>

*Remember:* Wrap with %w; Is compares, As extracts.

I wrap errors with fmt.Errorf("withdraw: %w", err) to add context while keeping the cause. errors.Is walks the chain and compares with a sentinel such as ErrInsufficientFunds; errors.As finds the first error of the target type, such as *ValidationError, and lets me read its fields. A test should check both after one and after two levels of wrapping.

</details>

**w2-tue-1** (неделя 2) — defer / panic / recover: карточка c35, ловушки q3 и q5 из quiz и их вариации q31 и q32 — отвечать до просмотра вариантов ответа

<details><summary>Model answer (EN)</summary>

*Remember:* Defer arguments are evaluated immediately; deferred closures can change named results.

defer schedules cleanup for when the function returns; deferred calls run in last-in-first-out order, but their arguments are evaluated when the defer statement executes. A deferred closure can read and change named results after the return statement has set them; with unnamed results it cannot change the returned value.

</details>

**w2-tue-2** (неделя 2) — W2-2 порядок defer и W2-3 SafeDiv (recover → error). Проговор W2-3; без текста повторить проговор W2-1 из понедельника

<details><summary>Model answer (EN)</summary>

*Remember:* recover works only in a deferred call of the panicking goroutine.

A panic unwinds the stack and runs deferred calls, and recover stops it only when it is called directly by a deferred function in the goroutine that is panicking. SafeDiv defers a function that recovers and turns the panic into an error by assigning to the named err result. A panic in another goroutine is not caught here and crashes the program unless that goroutine recovers it. For expected failures I return errors; panic is for programmer errors.

</details>

**w2-thu-1** (неделя 2) — Map по спецификации: порядок обхода не задан, запись в nil map — panic, адрес элемента взять нельзя, ключ должен быть сравнимым; map не потокобезопасна. Отдельно: после delete map не уменьшает свою таблицу, но удалённые значения сама больше не удерживает

<details><summary>Model answer (EN)</summary>

*Remember:* Map order is unspecified; reading nil is fine, writing nil panics.

A Go map is a built-in hash table with a few rules worth knowing. Iteration order is not specified, so code must not depend on it. Reading a missing key returns the zero value; v, ok tells absence from a stored zero. A nil map can be read but not written. Map elements are not addressable, so m[k].f = 1 does not compile for struct values. Any concurrent access where at least one goroutine writes needs synchronization; the runtime may detect it and stop with a fatal error. Deleting entries does not shrink the table, but deleted values are no longer kept reachable.

</details>

**w2-sat-1** (неделя 2) — Шпаргалка Go vs Kotlin своими словами: nil/zero values, ошибки, struct vs data class, embedding, interfaces, видимость

<details><summary>Model answer (EN)</summary>

*Remember:* For the zero-values row: var x T is ready — 0, "", false or nil; nil map writes panic, nil channels block.

Every declared variable starts at its zero value: var n int is 0, var s string is "", var ok bool is false, and a pointer, slice, map, channel, func or interface declared without a value is nil; struct fields are zeroed too. A nil slice works with len, append and range. Reading a nil map returns the zero value, but m[k] = v panics. Sending to or receiving from a nil channel blocks forever. Map keys must be comparable, so slices, maps and functions cannot be keys.

</details>

**w2-sat-4** (неделя 2) — Самопроверка недели вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы

<details><summary>Model answer (EN)</summary>

*Remember:* Zero values are usable; Is compares, As extracts; pointer receiver to mutate or avoid copies; defer is LIFO.

Zero values: 0 for int, "" for string, and nil for *T, []T, map[K]V, chan T and error. errors.Is checks whether the chain contains a specific value, such as a sentinel; errors.As finds the first error of a given type and lets me read its fields. I use a pointer receiver when the method changes the receiver, or when the struct is large or must not be copied, for example because it holds a sync.Mutex; then I keep all methods of the type on pointers. A nil *MyErr returned as error is not nil, because the interface stores the type *MyErr; it is nil only when both type and value are nil. Deferred calls run last in, first out when the function returns, and their arguments are evaluated when the defer statement runs.

</details>

**w3-mon-1** (неделя 3) — Slice изнутри: header (ptr, len, cap), рост при append, общий backing array, copy, s[a:b:c]

<details><summary>Model answer (EN)</summary>

*Remember:* A slice is pointer, len, cap over a shared array.

A slice is only a view onto an underlying array: a descriptor with a pointer, a length and a capacity. So s[1:3] copies no elements, and because re-slicing shares the array, a write through one slice is visible through the other. append writes in place when the resulting length fits in the capacity and otherwise allocates a new array and copies. s[a:b:c] limits capacity to c-a; s[a:b:b] leaves no spare capacity, so appending to it must copy into a new array and cannot overwrite s[b:]; copy or slices.Clone gives an independent slice.

</details>

**w3-mon-2** (неделя 3) — Ловушки aliasing и удержания памяти — сначала ответ без вариантов

<details><summary>Model answer (EN)</summary>

*Remember:* Aliasing: limit cap or copy. Retention: only a copy frees the array.

Both traps come from slices sharing one array. The first is aliasing: two appends to the same slice with spare capacity write into the same slot, so the second overwrites the first; limit the capacity with a[:len(a):len(a)] so append must allocate, or copy. The second is retention: a 16-byte slice keeps the whole 100 MiB array reachable, and only a copy, such as bytes.Clone or make plus copy, lets the array be collected.

</details>

**w3-tue-3** (неделя 3) — Строки: string vs []byte vs []rune, UTF-8, strings.Builder. Дополнительно: 100 Go Mistakes — Data Types, Strings, Control Structures

<details><summary>Model answer (EN)</summary>

*Remember:* len counts bytes; range decodes runes.

Strings are bytes, not characters: len("héllo") is 6, not 5, because a string is an immutable sequence of bytes, usually UTF-8, and é takes two of them. len(s) counts bytes and s[i] returns a byte, not a character. range over a string decodes runes and gives the byte offset of each. To count runes (code points) I use utf8.RuneCountInString, and I convert to []rune only when I really need to index by code point.

</details>

**w3-tue-4** (неделя 3) — W3-1 Remove(s, i) в двух версиях + тест, показывающий порчу исходного slice. Проговор (записать)

<details><summary>Model answer (EN)</summary>

*Remember:* Removing in place changes the caller's array; copy first for independence.

Removing in place changes the caller's data: append(s[:i], s[i+1:]...) shifts elements inside the shared array, so the caller's slice sees the change. slices.Delete also modifies the array and, since Go 1.22, zeroes the elements after the new length. If the caller's data must stay intact, I copy first with slices.Clone or build a new slice.

</details>

**w3-wed-1** (неделя 3) — Generics: type parameters, any, comparable, constraints с ~, cmp.Ordered; в Go 1.27 — generic-методы (у метода свои параметры типа; у методов интерфейса — нет, и generic-метод не может реализовать метод интерфейса)

<details><summary>Model answer (EN)</summary>

*Remember:* Set[T comparable] because map keys must be comparable.

Generics let one type work for many element types: a generic Set[T comparable] is a map[T]struct{} with Add, Has and Len. The comparable constraint is required because only comparable types can be map keys. The empty struct value takes no space, so the map stores only keys.

</details>

**w3-wed-2** (неделя 3) — W3-2 Map/Filter/Reduce и Set[T comparable]; W3-3 та же функция через интерфейс — сравнить

<details><summary>Model answer (EN)</summary>

*Remember:* Generics for same algorithm over types; interfaces for different behaviour.

Generics and interfaces both let code work with many types, but differently. I use generics when the algorithm is the same for many types and the caller needs the concrete type back, as in Map, Filter or Reduce. I use an interface when behaviour differs per type and callers depend on methods, for example different storage backends. I don't add type parameters just to avoid writing a small function twice.

</details>

**w3-thu-1** (неделя 3) — Модули, пакеты, internal/, раскладка cmd/ + internal/; задачи недель 1–3 — пакетами в своём go-prep

<details><summary>Model answer (EN)</summary>

*Remember:* Module = versioned set of packages; internal/ limits importers.

A module is the unit of versioning and a package the unit of compilation: go.mod declares the module path, such as module example.com/shop, and a package is one directory compiled together. Code under internal/ can be imported only by packages in the tree rooted at the parent of that internal directory. cmd/ for binaries and internal/ for private code is a common layout, not a language rule.

</details>

**w3-thu-2** (неделя 3) — Тесты: table-driven, t.Run, t.Helper, t.Parallel, go test -cover, golangci-lint; в go-prep — CI на GitHub Actions: vet, test -race, golangci-lint. Learn Go with Tests: 2–3 главы

<details><summary>Model answer (EN)</summary>

*Remember:* Named cases with t.Run; t.Helper fixes line numbers; t.Parallel only with isolated data.

A table-driven test is the usual Go way to check many inputs with one test function: it lists named cases and runs each in t.Run, so a failure shows the case name and one case can be run with -run. t.Helper marks a helper so failures point to the caller's line. t.Parallel runs a test alongside others, so I use it only when cases don't share mutable data. CI runs go test -race.

</details>

**w3-sat-2** (неделя 3) — W3-4 CLI txsum: CSV account,amount,currency → балансы; ошибки строк собирать; table-driven тесты парсера

<details><summary>Model answer (EN)</summary>

*Remember:* Validate each line, report all errors, exit non-zero on failure.

txsum is a small CLI that totals transactions from a CSV file: it reads the lines, validates every field and sums amounts per account and currency in minor units. Invalid lines are reported with their line numbers instead of stopping at the first one, and the program exits with a non-zero code if any line failed. Tests cover a valid line, a missing column, a non-numeric amount and an unknown currency.

</details>

**w4-mon-1** (неделя 4) — Горутины, WaitGroup; горутина vs поток ОС; data race vs race condition

<details><summary>Model answer (EN)</summary>

*Remember:* Data race: unsynchronized access with a write. Race condition: timing-dependent logic.

In Go, concurrent work runs in goroutines, which the Go runtime schedules onto a few OS threads. go f() starts one with a small growable stack, so a program can run many; a WaitGroup lets the caller wait for them. Running them together can cause two different bugs. A data race is unsynchronized access to the same memory from two goroutines, at least one writing; the race detector reports it when a run hits it. A race condition is a timing-dependent logic bug, possible without a data race: a check and an update in two separate critical sections.

</details>

**w4-tue-1** (неделя 4) — Каналы: буфер что меняет и чего не меняет (закон Литтла); nil/open/closed; диаграмма передачи значения

<details><summary>Model answer (EN)</summary>

*Remember:* nil blocks forever; a buffer only absorbs bursts; closed: send panics, receive drains, then zero, false.

A channel behaves differently depending on its state: nil, open or closed. A goroutine that sends to or receives from a nil channel blocks forever. On an open unbuffered channel, a sender waits for a receiver; with a buffer, it waits only when the buffer is full. A buffer only absorbs bursts: if receivers are slower on average, it fills up anyway. Sending on a closed channel panics; receiving drains the buffered values, then returns the zero value with ok false. Closing a nil or closed channel panics, so the sending side closes it, once, after the last send.

</details>

**w4-tue-2** (неделя 4) — W4-1 Worker pool: N воркеров, канал задач, канал результатов, отправитель закрывает канал после всех отправок. Проговор

<details><summary>Model answer (EN)</summary>

*Remember:* Producer closes jobs; WaitGroup closes results; every blocking step watches ctx.

A worker pool keeps concurrency bounded: N workers read jobs from one channel and write results to another. The producer closes jobs after the last send. A separate goroutine waits for all workers with a WaitGroup and then closes results, so the consumer's range loop ends. Workers and the producer select on ctx.Done at every send and receive, so cancelling ctx releases all of them; a consumer that stops early must cancel.

</details>

**w4-tue-3** (неделя 4) — W4-2 Pipeline generator → square → sink с остановкой через context

<details><summary>Model answer (EN)</summary>

*Remember:* Each stage owns and closes its output; every send selects on ctx.Done.

The pipeline has three stages, generator, square and sink, and stops through a context. Generator and square each own their output and close it when they return. Every send sits in a select with ctx.Done, so if the consumer stops early and cancels, all stages return and no goroutine stays blocked. A test cancels in the middle and checks that every stage has exited.

</details>

**w4-wed-1** (неделя 4) — select: выбор ветки, default, отмена — только Base-уровень; задача с запасной веткой — сначала ответ без вариантов

<details><summary>Model answer (EN)</summary>

*Remember:* Random among ready cases; checking ctx first is not priority.

In Go, select lets one goroutine wait on several channel operations at once. If several cases are ready, it picks one pseudo-randomly, so there is no priority between them. A default case makes the select non-blocking. Checking ctx.Err() before the select doesn't give cancellation priority either, because once inside, a ready data case can still win. The channel operands and send values are evaluated once, before a case is chosen.

</details>

**w4-wed-2** (неделя 4) — W4-3 Fan-in merge нескольких каналов с WaitGroup и закрытием выхода

<details><summary>Model answer (EN)</summary>

*Remember:* One forwarder per input; close output after all forwarders finish.

Fan-in merges several channels into one: one goroutine per input forwards its values to a shared output. A WaitGroup tracks the forwarders, and one more goroutine closes the output after all of them return. Each forwarder selects on ctx.Done, so cancellation stops everything, and with no inputs the output closes immediately. Fan-out is the other half: I run several copies of a stage only when it is slow and the order of its results does not matter, because merging loses the order.

</details>

**w4-thu-1** (неделя 4) — sync: Mutex, RWMutex, Once, WaitGroup, Cond, atomic; channel vs mutex — дерево решения (диаграмма 12); CAS — диаграммы 5 (CAS) и 8 (Mutex) с ответами вслух

<details><summary>Model answer (EN)</summary>

*Remember:* Atomics protect one variable; invariants across fields need a mutex; Cond.Wait goes in a for loop.

The sync packages cover shared memory, and the choice depends on how much state must stay consistent. An atomic makes one operation on one variable indivisible, such as atomic.AddInt64 on a counter, and one balance can also use a CompareAndSwap loop. But a transfer between two accounts touches two balances: with two separate atomic adds, another goroutine can see the money missing in between. That invariant needs a lock around the whole check and update. With Cond, a goroutine calls Wait in a for loop, because the condition may no longer hold when Wait returns.

</details>

**w4-mon-2** (неделя 4) — Go blog: Pipelines and cancellation

<details><summary>Model answer (EN)</summary>

*Remember:* Close outputs when done; a done channel or ctx stops every stage.

A pipeline is a chain of stages connected by channels, such as gen → square → print. The first stage only sends, the last only receives, and each middle stage is a goroutine that receives from upstream, processes the value and sends it downstream. A stage closes its output when it has sent everything, so the next stage's range loop ends. If the consumer stops early, upstream stages would block forever on their sends, so every send sits in a select with done or ctx.Done; closing done or cancelling ctx frees them all.

</details>

**w4-thu-3** (неделя 4) — Ловушки sync: копия WaitGroup, повторный Lock, double-checked locking, указатель из защищённой map; deadlock, livelock и starvation (диаграмма 11); Cond: Signal вместо Broadcast, if вместо for

<details><summary>Model answer (EN)</summary>

*Remember:* One WaitGroup by pointer; no re-lock; recheck under Lock; copy, don't leak pointers.

Most sync bugs come from a few traps, and each has a simple fix. Calling Done on a copy of a WaitGroup leaves the original counter unchanged, so Wait blocks; pass a pointer, or use wg.Go in Go 1.25+. A goroutine that locks a Mutex it already holds deadlocks, because Go mutexes are not reentrant. A check under RLock is stale after RUnlock, so check-then-insert must recheck under Lock. A pointer returned from a protected map lets callers change the value after unlock, so I copy the value while holding the lock.

</details>

**w4-sat-1** (неделя 4) — Прогнать W4-1…W4-5 в go-prep: go test -race ./week4/...; для каждой горутины записать владельца и путь завершения

<details><summary>Model answer (EN)</summary>

*Remember:* For every goroutine: who starts it, who stops it, how it ends.

Before I call concurrent code done, I check every goroutine's lifecycle. For each one I name its owner and its exit path. It returns when its input channel is closed, when ctx is cancelled, or when its single task is done, and someone waits for it with a WaitGroup or errgroup. If I can't name the exit path, the goroutine can leak. go test -race finds data races only in the paths the tests run; it does not find deadlocks or logic errors.

</details>

**w4-sat-4** (неделя 4) — Проговор worker pool и «channel vs mutex» по-английски, записать

<details><summary>Model answer (EN)</summary>

*Remember:* Channels transfer ownership; mutexes protect shared state.

Channels and mutexes solve different problems, so I choose by who owns the data. I use a channel when work or data moves between goroutines and ownership passes with the value, as in a worker pool. I use a mutex when several goroutines read and update the same state in place, such as a cache or a counter. Either way the goal is clear ownership; I measure before claiming either is faster.

</details>

**w4-thu-2** (неделя 4) — W4-4 Счётчик тремя способами (Mutex, atomic, канал) + бенчмарк. W4-5 SafeCache на map + RWMutex

<details><summary>Model answer (EN)</summary>

*Remember:* Same result three ways; choose by clarity and measured contention; never leak internal state.

A counter and a cache both hold shared state, but the cache adds an aliasing trap. A counter built with a Mutex, with atomic.Int64 or with one owner goroutine gives the same result under -race. So I choose by clarity and measured contention, not by a general rule. A cache guarded by an RWMutex must not return its internal map or slices, because callers would then change shared data outside the lock; it returns copies instead.

</details>

**w6-tue-1** (неделя 6) — HTTP на net/http с шаблонами маршрутов Go 1.22+: POST /accounts, POST /transfers, GET /accounts/{id}; JSON — в Go 1.27 encoding/json работает поверх json/v2 (строже к невалидному UTF-8 и повторяющимся именам в v2)

<details><summary>Model answer (EN)</summary>

*Remember:* One goroutine per connection; r.Context() ends when the client leaves or the handler returns; four timeouts, zero means none.

net/http serves each connection in its own goroutine and runs the handler there; Go 1.22 patterns match method and path, give 405 with Allow, and r.PathValue reads the id. I pass r.Context() to every downstream call, because it is cancelled when the client disconnects and after the handler returns. On http.Server I set ReadHeaderTimeout and IdleTimeout, usually ReadTimeout and WriteTimeout, since zero means no limit. Tests go through httptest against the real handler.

</details>

**w6-tue-2** (неделя 6) — Валидация входа и ошибки → HTTP-коды через errors.As (из W2-1)

<details><summary>Model answer (EN)</summary>

*Remember:* Domain errors in, status codes out — in one function; 500 hides the cause and logs it once.

The domain returns sentinel and typed errors and doesn't import net/http. One function at the HTTP boundary maps them with errors.Is and errors.As, so wrapped errors still match: validation to 400 with the field, not found to 404, insufficient funds to 409. Anything else is a 500 with a generic body, and the real error is logged once with the request id. errors.As needs a pointer to the type that implements error.

</details>

**w6-wed-2** (неделя 6) — Управление ресурсами SQL: defer Rollback, rows.Close, rows.Err, пул соединений

<details><summary>Model answer (EN)</summary>

*Remember:* *sql.DB is a pool: defer rows.Close, check rows.Err, defer tx.Rollback, everything on tx.

*sql.DB is a connection pool, not one connection: I get it once from sql.Open, with limits on open and idle connections. Every Rows holds a connection until it is closed, so after checking the query error I defer rows.Close() and check rows.Err() after the loop. A transaction pins one connection: I begin it with the request context, defer Rollback, which is a no-op after Commit, and run every statement on tx, not on db.

</details>

**w6-thu-1** (неделя 6) — log/slog в JSON, request id в контексте; конфиг из переменных окружения

<details><summary>Model answer (EN)</summary>

*Remember:* One JSON logger, request_id via With in middleware, LogValue for secrets, log errors once.

I create one slog logger with a JSON handler at startup, and a middleware adds request_id with With and puts that logger into the request context. I log key-value attributes, not formatted strings. Types with secrets get a LogValue method, so passwords and tokens never reach the log, and each error is logged once, where it is handled.

</details>

**w7-mon-1** (неделя 7) — Уровни изоляции PostgreSQL; перевод в одной транзакции: SELECT … FOR UPDATE в стабильном порядке ID против дедлока

<details><summary>Model answer (EN)</summary>

*Remember:* Read Committed + FOR UPDATE in ID order; retry 40001 and 40P01 from BEGIN.

PostgreSQL defaults to Read Committed, where each statement sees its own snapshot. For a transfer I open one transaction, lock both account rows with SELECT FOR UPDATE in ascending ID order, check the balance under the lock and update both rows. A stable lock order means opposite transfers cannot deadlock. Repeatable Read or Serializable would also work, but then I must retry the whole transaction on serialization failures, SQLSTATE 40001; deadlocks, 40P01, are retried too.

</details>

**w7-tue-1** (неделя 7) — Идемпотентность: таблица ключей с UNIQUE и сохранённым ответом; другой payload с тем же ключом → ошибка

<details><summary>Model answer (EN)</summary>

*Remember:* Key + request fingerprint + stored response; same key, other body → 422.

A client may retry a payment, so it sends an Idempotency-Key that makes the retry safe. I store the key in a table with a unique constraint, together with a hash of the request and the response I returned. A repeat with the same key and the same request gets the stored response, and no money moves again. The same key with a different body is rejected with 422. Business outcomes like insufficient funds are stored too; infrastructure failures are rolled back, so the client can retry.

</details>

**w7-tue-2** (неделя 7) — Гонка двух одинаковых запросов: атомарная вставка ключа, а не «проверить, потом вставить»

<details><summary>Model answer (EN)</summary>

*Remember:* Claim the key atomically: INSERT … ON CONFLICT DO NOTHING in the transfer's transaction.

Check-then-insert fails under concurrency: both requests check, find nothing and both transfer. There is no data race, so the race detector stays silent. I claim the key with INSERT ON CONFLICT DO NOTHING on a unique column, in the same transaction as the transfer. A concurrent duplicate blocks on the unique index until the first transaction ends; in Read Committed it then sees the conflict and returns the stored response, or claims the key if the first one rolled back.

</details>

**w7-wed-1** (неделя 7) — Transactional outbox: запись события в той же транзакции, что и перевод

<details><summary>Model answer (EN)</summary>

*Remember:* Event row in the same transaction; a relay publishes; at-least-once.

Publishing after commit is a dual write: if the process dies between the commit and the send, the event is lost, and sending first can announce a transfer that then rolls back. So I insert the event into an outbox table in the same transaction as the transfer: either both are committed or neither is. A relay publishes the rows later, so delivery is at-least-once, and consumers must deduplicate.

</details>

**w7-wed-2** (неделя 7) — Relay-воркер публикует в Kafka (at-least-once): владелец горутины, остановка, ретраи

<details><summary>Model answer (EN)</summary>

*Remember:* One owned goroutine: poll, publish in order, mark after the ack, stop on ctx.

The relay moves events from the outbox table to Kafka; it is one goroutine started and stopped by main. It polls unsent rows in ID order, publishes each with the account ID as the key, and marks a row sent only after the broker acknowledged it. On an error it stops the batch and retries the same row after a pause, which keeps per-account order. It returns when its context is cancelled, and shutdown waits for it. A lost acknowledgement means a duplicate, which the consumer handles.

</details>

**w7-thu-1** (неделя 7) — Consumer с идемпотентной обработкой; consumer groups, партиции, порядок по ключу

<details><summary>Model answer (EN)</summary>

*Remember:* Commit the offset after the effect; dedupe by event ID; order per partition.

My consumer is at-least-once: it commits the offset only after the effect is committed in the database. A crash or a rebalance in between replays messages, so the handler stores the event ID in the same transaction as the effect and skips IDs it has seen. Ordering is per partition: events are keyed by account ID and the producer hashes the key, so one account's events stay in one partition, and within a group each partition is read by one consumer at a time.

</details>

**w7-sat-1** (неделя 7) — Конкурентный тест: 100 параллельных переводов, инвариант суммы, go test -race

<details><summary>Model answer (EN)</summary>

*Remember:* Per-account locks in ID order; check under the lock; 100 goroutines under -race.

Each account has its own lock, and a transfer takes both locks in ascending ID order, so opposite transfers cannot deadlock. The balance is checked under the locks, so two transfers cannot spend the same money. The test starts a hundred goroutines doing random transfers under the race detector, checks that the total never changes and that no balance goes negative, and fails by timeout if something hangs.

</details>

**w7-sat-4** (неделя 7) — Индексы PostgreSQL (≈45 мин): B-tree и составной индекс, EXPLAIN ANALYZE на запросе истории переводов счёта; найти и убрать N+1

<details><summary>Model answer (EN)</summary>

*Remember:* EXPLAIN ANALYZE; composite index (account_id, created_at); N+1 → one query.

I run EXPLAIN ANALYZE on the real query: it shows the plan with actual times and row counts. For an account's history, newest first, a sequential scan over all transfers points to a missing index, so I add a B-tree index on account_id and created_at, and the plan becomes an index scan without a sort. N+1 is one query per row of a list; I replace it with a join or one query with id = ANY of an array.

</details>

## «Что выведет код» (неделя 3)

**P1**

```go
s := []int{1, 2, 3}
t := s[:2]
t = append(t, 99)
fmt.Println(s)
```

<details><summary>Ответ</summary>

`[1 2 99]` — t has capacity 3, so append writes into the shared backing array and overwrites s[2].

У t ёмкость 3, поэтому append пишет в общий массив и перезаписывает s[2].

</details>

**P2**

```go
s := make([]int, 0, 1)
a := append(s, 1)
b := append(s, 2)
fmt.Println(a[0], b[0])
```

<details><summary>Ответ</summary>

`2 2` — Both appends reuse the same array of capacity 1, so the second write overwrites the first.

Оба append используют один массив ёмкостью 1; вторая запись перезаписывает первую.

</details>

**P3**

```go
var m map[string]int
fmt.Println(m["x"], len(m))
m["x"] = 1
```

<details><summary>Ответ</summary>

`0 0, then panic` — Reading a nil map returns the zero value, but writing to it panics: assignment to entry in nil map.

Чтение из nil map возвращает нулевое значение, а запись вызывает panic: assignment to entry in nil map.

</details>

**P4**

```go
for i := 0; i < 3; i++ {
    defer fmt.Print(i)
}
```

<details><summary>Ответ</summary>

`210` — Deferred calls run in LIFO order, and their arguments are evaluated when defer executes.

Отложенные вызовы выполняются в обратном порядке, а их аргументы вычисляются в момент выполнения defer.

</details>

**P5**

```go
func f() (x int) {
    defer func() { x++ }()
    return 1
}

func main() {
    fmt.Println(f())
}
```

<details><summary>Ответ</summary>

`2` — return 1 assigns to the named result x first, then the deferred function increments it.

return 1 сначала присваивает значение именованному результату x, затем отложенная функция его увеличивает.

</details>

**P6**

```go
type E struct{}

func (*E) Error() string { return "e" }

func g() error {
    var p *E
    return p
}

func main() {
    fmt.Println(g() == nil)
}
```

<details><summary>Ответ</summary>

`false` — The interface holds the type *E with a nil value, so the interface itself isn't nil.

В интерфейсе лежит тип *E с нулевым указателем, поэтому сам интерфейс не равен nil.

</details>

**P7**

```go
type P struct{ v int }
ps := []P{{1}, {2}}
for _, p := range ps {
    p.v = 10
}
fmt.Println(ps)
```

<details><summary>Ответ</summary>

`[{1} {2}]` — The range variable is a copy of each element; to modify the slice, use the index.

Переменная range — копия элемента; чтобы изменить срез, нужно обращаться по индексу.

</details>

**P8**

```go
s := "héllo"
fmt.Println(len(s), s[1], len([]rune(s)))
```

<details><summary>Ответ</summary>

`6 195 5` — len counts bytes; the precomposed é (U+00E9) takes two bytes in UTF-8, s[1] is its first byte 0xC3 = 195; there are five runes.

len считает байты; é (готовый, предкомпонованный символ U+00E9) занимает в UTF-8 два байта, s[1] — первый из них, 0xC3 = 195; рун пять.

</details>

**P9**

```go
var fs []func()
for i := 0; i < 3; i++ {
    fs = append(fs, func() { fmt.Print(i) })
}
for _, f := range fs {
    f()
}
```

<details><summary>Ответ</summary>

`012` — Since Go 1.22 each loop iteration has its own variable. With language version below 1.22 in go.mod (or -lang=go1.21) all closures share one variable and print 333.

С Go 1.22 у каждой итерации своя переменная. Если версия языка в go.mod ниже 1.22 (или сборка с -gcflags=-lang=go1.21), все замыкания разделяют одну переменную и печатают 333.

*Версия:* Зависит от версии языка модуля, а не только от установленного toolchain.

</details>

**P10**

```go
a := [3]int{1, 2, 3}
b := a
b[0] = 100
fmt.Println(a[0])
```

<details><summary>Ответ</summary>

`1` — Arrays are values in Go, so assignment copies the whole array, unlike a slice.

Массивы в Go — значения: присваивание копирует весь массив, в отличие от среза.

</details>

<!-- {% endraw %} -->
