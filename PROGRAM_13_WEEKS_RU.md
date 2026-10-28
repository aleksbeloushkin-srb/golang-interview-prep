# Программа подготовки к интервью Senior Go: 13 недель

<!-- GitHub Pages (Jekyll/Liquid) не должен разбирать фигурные скобки в Go-коде этого файла. --> <!-- {% raw %} -->

Цель: Senior Backend Engineer (Go) · EU-компании с офисом в Сербии или remote CET. Старт 12.10.2026, ~10 ч в неделю: 4 вечера по 1,5 ч и 4 ч в субботу; пятница и воскресенье — резерв. Бюджет — ориентир, а не обещание; внешний результат (оффер) план не гарантирует.

Пометки: *(по желанию)* — не входит в обязательный объём недели; *(на редакции)* — у материала сайта нет списка источников (сейчас таких нет). Опорные английские тексты — редакционные наброски, по рубрике не проверены.

Дату старта можно менять на сайте: «Я начал на этой неделе», сдвиг на неделю, «Сейчас я на неделе N», сброс; неделя всегда начинается в понедельник. Даты ниже — для старта по умолчанию.

Недели 1–5: у каждой обязательной задачи есть критерий «Готово, когда» — самостоятельная попытка до ответа и перенос на изменённое условие; «На сайте пока нет» — упражнение, которое ещё предстоит добавить. Задачи LeetCode без своего критерия: Решено самостоятельно за 30 минут вслух по 4 шагам; названа сложность; подсказка открыта только после попытки; follow-up или изменённое условие объяснено словами.

Этот файл сгенерирован из `data/plan.js` — источника данных раздела [«План 13 недель»](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/plan) на сайте. Правки вносить в `data/plan.js`. Ревизия программы: 2026-10-27b.

## Фазы

| Фаза | Недели |
| --- | --- |
| Go: язык и конкурентность | 1, 2, 3, 4 |
| Проект-портфолио: ledger-сервис | 5, 6, 7, 8 |
| Собеседования и рынок | 9, 10, 11, 12, 13 |

## Обзор

| Нед. | Даты | Тема | Готово, когда |
| --- | --- | --- | --- |
| 1 | 12.10–18.10 | Идиомы Go I: типы, интерфейсы, ошибки | Решены LC 49, 347, 238 и задачи W1-1…W1-6; самопроверка недели проговорена вслух по-английски без подсказок. |
| 2 | 19.10–25.10 | Идиомы Go II: slice, map, строки, generics, тесты | 10 задач «что выведет код» из плана и q1 решены с объяснением; CLI txsum покрыт тестами; LC 3, 15, 739 проговорены. |
| 3 | 26.10–01.11 | Конкурентность I: горутины, каналы, select, sync | W3-1…W3-5 работают под go test -race; на каждый ответ «кто закрывает канал и как горутина завершится» есть одно предложение. |
| 4 | 02.11–08.11 | Конкурентность II и минимум рантайма | 6 эталонных решений пишутся за 20–30 мин; найдена утечка горутины через pprof; пройдены контрольный квиз и виртуальный live coding. |
| 5 | 09.11–15.11 | Проект I: каркас ledger-сервиса | Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском. |
| 6 | 16.11–22.11 | Проект II: транзакции, идемпотентность, outbox → Kafka | Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат. |
| 7 | 23.11–29.11 | Проект III: gRPC, тесты, бенчмарки | Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов. |
| 8 | 30.11–06.12 | Проект IV: production-readiness, CV | Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском. |
| 9 | 07.12–13.12 | Take-home, code review, первая волна откликов | Второе портфолио-репо (API-клиент) с тестами и README; чек-лист ревьюера; 3 разобранных чужих PR; 5–10 откликов волны 1. |
| 10 | 14.12–20.12 | System Design I | 3 дизайна проговорены и записаны; вторая волна откликов отправлена до праздников. |
| 11 | 21.12–27.12 | System Design II: event-driven и предметные дизайны | Ещё 3 дизайна проговорены; на вопрос про exactly-once есть точный ответ без мифов. |
| 12 | 28.12–03.01 | Behavioral, легенда, CV | Истории записаны и проговорены; финальные CV и LinkedIn; список вопросов к компании. |
| 13 | 04.01–10.01 | Моки и пик откликов | 3 мока пройдены; назначены реальные собеседования; после каждого интервью вопросы занесены в журнал. |

## Как проговаривать задачи по-английски

1. **Clarify** — Уточнить условие и входные данные. *Before I start, let me clarify a few things.*
2. **Approach** — Идея решения до кода: brute force, затем лучше. *The brute-force approach would be… We can do better with…*
3. **Complexity** — Время и память. *This runs in O(n) time and O(n) extra space.*
4. **Edge cases & tests** — Что проверить, как тест. *Edge cases: an empty input, a single element… I'd turn these into a table-driven test.*

Если завис: *Let me think out loud for a second.* · *I'm not sure yet, but my first idea is…* · *Let me step back and reconsider.* · *Can I assume…? If not, I'd handle it by…*

## Неделя 1. Идиомы Go I: типы, интерфейсы, ошибки (12.10–18.10)

**Цель:** Писать простой Go без подглядывания и объяснять по-английски, чем Go отличается от Kotlin в типах, ошибках и интерфейсах.

**Готово, когда:** Решены LC 49, 347, 238 и задачи W1-1…W1-6; самопроверка недели проговорена вслух по-английски без подсказок.

### Пн · 90 мин

- [ ] Tour of Go: Basics — packages, variables, functions, flow control, defer — [Tour of Go](https://go.dev/tour/)
  - Готово, когда: Пройдены разделы Basics; без подсказки объясняешь var и := и порядок вызова defer на примере из трёх строк.
- [ ] Завести репозиторий go-prep, go mod init, папка week1
  - Готово, когда: Репозиторий с go.mod; go vet ./... и go test ./... проходят на пакете с одним тестом.
- [ ] LeetCode 49. Group Anagrams + проговор — [LC 49. Group Anagrams](https://leetcode.com/problems/group-anagrams/), проговор: «LC 49. Group Anagrams»

### Вт · 90 мин

- [ ] Tour: pointers, structs, arrays, slices, maps, function values, closures
  - Готово, когда: Пройдены pointers…closures; без подсказки предсказываешь, что выведет замыкание после изменения захваченной переменной.
- [ ] Go by Example от Values до Closures — набрать руками, не копировать — [Go by Example](https://gobyexample.com/)
  - Готово, когда: Примеры набраны и запускаются; по каждому — одна фраза, что он показывает.
- [ ] W1-1 Money: тип в минорных единицах (int64) + валюта, метод String() → «12.50 EUR». Проговор — проговор: «W1-1. Money»
  - Готово, когда: Тесты: 1250 → «12.50 EUR», 5 → «0.05 EUR», ноль и отрицательная сумма; одна фраза по-английски, почему не float64. Изменённое условие: валюта без дробной части или с тремя знаками.

### Ср · 90 мин

- [ ] Tour: methods, interfaces, type assertions, type switches, Stringer, errors
  - Готово, когда: Без подсказки: type switch по ошибке и Stringer на своём типе.
- [ ] Сайт: интерфейсы и receivers — только короткий ответ и «как работает» — [C34](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c34), [C33](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c33)
  - Готово, когда: c33 и c34: ответ вслух по-английски до раскрытия, затем сверка; практика карточек выполнена.
  - На сайте пока нет: Упражнение T/*T на компиляцию: какое присваивание интерфейсу скомпилируется (расширение c34, без новой карточки).
- [ ] W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is) и W1-3 ValidationError (errors.As) — проговор: «W1-2. Account и W1-3. ValidationError»
  - Готово, когда: Тесты: после обёртки %w errors.Is находит ErrInsufficientFunds; errors.As достаёт ValidationError с полем Field. Изменённое условие: два уровня обёртки.
  - На сайте пока нет: Короткие вопросы по %w, errors.Is/As, sentinel vs typed и задача «замени %w на %v — что сломается» (новая тема).
- [ ] LeetCode 347. Top K Frequent Elements + проговор (записать на телефон) — [LC 347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/), проговор: «LC 347. Top K Frequent Elements»

### Чт · 90 мин

- [ ] Ошибки глубже: errors.New, fmt.Errorf("…: %w"), errors.Is/As, sentinel vs typed — [Q20](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q20), [Go blog: Working with Errors in Go 1.13](https://go.dev/blog/go1.13-errors), [package errors](https://pkg.go.dev/errors)
  - Готово, когда: Без подсказки по-английски: чем Is отличается от As, когда sentinel, когда typed error; задача %w → %v объяснена.
  - На сайте пока нет: Та же новая тема ошибок; errors.Join связать с q20 и указать версию 1.20.
- [ ] defer / panic / recover: карточка и три ловушки из quiz — сначала ответить без вариантов — [C35](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c35), [Q2](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q2), [Q3](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q3), [Q5](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5)
  - Готово, когда: q2, q3, q5: ответ до вариантов совпал с разбором по причине; объяснение по-английски. Изменённое условие: q3 с безымянным результатом.
  - На сайте пока нет: Варианты к q3/q5: безымянный результат, panic в другой горутине (расширение c35).
- [ ] Дополнительно: 100 Go Mistakes — разделы Functions and Methods, Error Management *(по желанию)* — [100go.co](https://100go.co/)
- [ ] W1-4 порядок defer и W1-5 SafeDiv (recover → error). Проговор W1-3, W1-5 — проговор: «W1-5. SafeDiv»
  - Готово, когда: Порядок трёх defer предсказан до запуска; SafeDiv возвращает ошибку при делении на ноль без паники наружу. Изменённое условие: panic во вложенной функции.

### Сб · 240 мин

- [ ] W1-6 Method sets: почему значение T не реализует интерфейс с pointer-методом — [C34](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c34), проговор: «W1-6. Method sets»
  - Готово, когда: Без подсказки: почему var _ Notifier = Service{} не компилируется, а &Service{} — да; правило по спецификации и его мотивация.
  - На сайте пока нет: Упражнение T/*T на компиляцию (то же, что для w1-wed-2).
- [ ] Шпаргалка Go vs Kotlin своими словами: nil/zero values, ошибки, struct vs data class, embedding, interfaces, видимость
  - Готово, когда: Таблица своими словами; к каждой строке — пример кода, который ведёт себя иначе, чем в Kotlin.
  - На сайте пока нет: Карточка zero values и nil по типам; вопросы «скомпилируется ли» про embedding и сравнимость ключа map (новые темы).
- [ ] LeetCode 238. Product of Array Except Self + проговор (записать) — [LC 238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/), проговор: «LC 238. Product of Array Except Self»
- [ ] Прочитать по ролям диалог Two Sum, затем решить LC 1 и повторить диалог своими словами — [LC 1. Two Sum](https://leetcode.com/problems/two-sum/), проговор: «LC 1. Two Sum — полный диалог с интервьюером»
  - Готово, когда: Диалог Two Sum повторён своими словами за 5 минут без текста; follow-up про отсортированный массив отвечен.
- [ ] Повторный проговор LC 49 и LC 347 без подсказок
  - Готово, когда: Обе задачи проговорены без подсказок, по 5 минут; запись сделана.
- [ ] Самопроверка недели вслух по-английски (ниже)
  - Готово, когда: Все вопросы самопроверки — ответ по-английски без подсказки; ошибочные отмечены для повтора.

**LeetCode недели:** [1. Two Sum](https://leetcode.com/problems/two-sum/) (Hash map), [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/) (Hash map), [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) (Hash map + buckets), [238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) (Prefix/suffix), [20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) (Stack)

**Проговорить по-английски:**

- *How does error handling in Go differ from exceptions in Kotlin or Java?*
- *What is a zero value and why does it matter?*
- *When do you use a pointer receiver?*
- *Why can a nil pointer returned as an error be non-nil?*
- *Tell me about yourself — version 0, 60–90 seconds.*

**Самопроверка:**

- Zero values у int, string, *T, []T, map[K]V, chan T, error?
- Чем errors.Is отличается от errors.As?
- Когда метод объявлять на pointer receiver?
- Почему nil-указатель, возвращённый как error, даёт err != nil?
- Порядок отложенных вызовов и когда вычисляются их аргументы?

**Материал сайта:**

- [C34 How do method sets differ from the shorthand used to call pointer methods?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c34)
- [C33 What does an interface value contain, and why can a typed nil make an interface non-nil?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c33)
- [Q20 Результат записи отчёта](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q20)
- [C35 When do deferred calls run, and where can recover stop a panic?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c35)
- [Q2 Nil-указатель внутри error](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q2)
- [Q3 Return до завершения defer](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q3)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5)

**Чего пока нет на сайте:**

- На сайте нет карточек по идиомам для JVM-разработчика: ошибки как значения, %w/Is/As, embedding vs наследование, видимость пакетов.
- Нет режима проговора задач (Clarify → Approach → Complexity → Edge) с таймером и самооценкой.

## Неделя 2. Идиомы Go II: slice, map, строки, generics, тесты (19.10–25.10)

**Цель:** Уверенно отвечать на «что выведет код» про slice и map, писать table-driven тесты и простой generic-код, объясняя всё вслух.

**Готово, когда:** 10 задач «что выведет код» из плана и q1 решены с объяснением; CLI txsum покрыт тестами; LC 3, 15, 739 проговорены.

### Пн · 90 мин

- [ ] Slice изнутри: header (ptr, len, cap), рост при append, общий backing array, copy, s[a:b:c] — [C29](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c29), [Go Slices: usage and internals](https://go.dev/blog/slices-intro), [The mechanics of append](https://go.dev/blog/slices)
  - Готово, когда: c29: ответ до раскрытия; объяснено, зачем ограничивать cap в s[a:b:c]. Изменённое условие: append после s[:1:1].
  - На сайте пока нет: Открытые задачи P1, P2, P10 как варианты к c29/q6.
- [ ] Ловушки aliasing и удержания памяти — сначала ответ без вариантов — [Q6](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q6), [Q4](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q4)
  - Готово, когда: q4 и q6: дефект найден до вариантов, исправление предложено (копия или ограничение cap).
- [ ] LeetCode 3. Longest Substring Without Repeating Characters + проговор — [LC 3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/), проговор: «LC 3. Longest Substring Without Repeating Characters»

### Вт · 90 мин

- [ ] Map по спецификации: порядок обхода не задан, запись в nil map — panic, адрес элемента взять нельзя, ключ должен быть сравнимым; map не потокобезопасна. Отдельно: после delete map не уменьшает свою таблицу, но удалённые значения сама больше не удерживает — [C30](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c30), [C32](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c32), [Spec: Map types](https://go.dev/ref/spec#Map_types), [Go maps in action](https://go.dev/blog/maps)
  - Готово, когда: Без подсказки: правила map из спецификации и отличие «таблица не уменьшается» от «удалённые значения map не удерживает»; P3 решена.
  - На сайте пока нет: Открытая задача P3 (nil map) к c30/c32.
- [ ] По желанию: SwissTable в Go 1.24+ — достаточно уметь сказать одну фразу, что изменилось *(по желанию)* — [C31](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c31), [SIM7](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim7)
- [ ] Строки: string vs []byte vs []rune, UTF-8, strings.Builder. Дополнительно: 100 Go Mistakes — Data Types, Strings, Control Structures — [Strings, bytes, runes and characters in Go](https://go.dev/blog/strings), [100go.co](https://100go.co/)
  - Готово, когда: P8 решена до сверки; по-английски: что возвращают len(s), s[i] и range по строке.
  - На сайте пока нет: Новая базовая карточка UTF-8: byte, rune, обход строки.
- [ ] W2-1 Remove(s, i) в двух версиях + тест, показывающий порчу исходного slice. Проговор (записать) — проговор: «W2-1. Remove»
  - Готово, когда: Тест показывает порчу исходного slice наивной версией и независимость версии с копией; объяснено поведение slices.Delete с Go 1.22.

### Ср · 90 мин

- [ ] Generics: type parameters, any, comparable, constraints с ~, cmp.Ordered — [Tutorial: Getting started with generics](https://go.dev/doc/tutorial/generics)
  - Готово, когда: Свой Set[T comparable] компилируется; объяснено, почему ключ map должен быть сравнимым.
- [ ] W2-2 Map/Filter/Reduce и Set[T comparable]; W2-3 та же функция через интерфейс — сравнить — проговор: «W2-3. Generics vs interfaces»
  - Готово, когда: Map/Filter/Reduce с тестами; абзац «generic или интерфейс» с одним контрпримером.
  - На сайте пока нет: Новая карточка generics vs interface с выбором подхода.
- [ ] LeetCode 15. 3Sum + проговор — [LC 15. 3Sum](https://leetcode.com/problems/3sum/), проговор: «LC 15. 3Sum»

### Чт · 90 мин

- [ ] Модули, пакеты, internal/, раскладка cmd/ + internal/
  - Готово, когда: Объяснено, что даёт internal/ и чем пакет отличается от модуля; раскладка cmd/internal — вариант, не стандарт.
  - На сайте пока нет: Карточка модули, пакеты, internal/ (новая тема).
- [ ] Тесты: table-driven, t.Run, t.Helper, t.Parallel, go test -cover, golangci-lint. Learn Go with Tests: 2–3 главы — [package testing](https://pkg.go.dev/testing), [Learn Go with Tests](https://quii.gitbook.io/learn-go-with-tests)
  - Готово, когда: Table-driven тест с t.Run и t.Helper; один параллельный тест на изолированных данных; go test -race проходит.
  - На сайте пока нет: Короткие вопросы по table-driven, t.Helper, t.Parallel (новая тема).
- [ ] Покрыть тестами W1-2 и W2-2
  - Готово, когда: Тесты W1-2 и W2-2 покрывают ошибки и граничные случаи, а не только успешный путь.
- [ ] Проговор «что выведет код» P1–P5: по одной английской фразе-объяснению — проговор: ««Что выведет код»: как объяснять»
  - Готово, когда: P1–P5: вывод назван до сверки, объяснение — одна фраза по-английски.

### Сб · 240 мин

- [ ] «Что выведет код»: P1–P10 из плана и замыкание в цикле — сначала ответ, потом сверка — [Q1](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q1)
  - Готово, когда: 10 задач и q1: вывод до сверки; для P9 объяснена зависимость от версии языка в go.mod.
- [ ] Дополнительно: задачи из банков вопросов собеседований (вторичный материал, ответы сверять с документацией) *(по желанию)* — [39 вопросов (Нияз)](https://t.me/niyaz_golang/758), [ТОП-12 Ozon](https://t.me/niyaz_golang/672)
- [ ] W2-4 CLI txsum: CSV account,amount,currency → балансы; ошибки строк собирать; table-driven тесты парсера — проговор: «W2-4. txsum CLI»
  - Готово, когда: Тесты: валидная строка, пропущенная колонка, нечисловая сумма, неизвестная валюта; ненулевой код выхода при ошибочных строках.
- [ ] LeetCode 739. Daily Temperatures + проговор (записать) — [LC 739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/), проговор: «LC 739. Daily Temperatures»
- [ ] Дополнительно: LC 56 Merge Intervals и LC 146 LRU Cache *(по желанию)* — [LC 146. LRU Cache](https://leetcode.com/problems/lru-cache/), проговор: «LC 146. LRU Cache»
- [ ] Дополнительно: вопросы интервьюера Senior Go с Хабра про slice, map, каналы, ошибки — ответить, потом сверить с документацией *(по желанию)* — [Habr: «Коллеги, вы меня огорчаете»](https://habr.com/ru/articles/521582)
- [ ] Контрольная точка: квиз по идиомам — q1–q6 в режиме «сначала ответ без вариантов» — [Q1](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q1), [Q2](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q2), [Q3](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q3), [Q4](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q4), [Q5](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5), [Q6](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q6)
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

- [C29 What do a slice and a string refer to, and when does append allocate a new backing array?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c29)
- [Q6 Два append и один общий массив](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q6)
- [Q4 16 байт из большого буфера](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q4)
- [C30 How did classic Go maps use buckets and incremental growth before Swiss Tables?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c30)
- [C32 What do delete and clear release, and what can you rely on during map iteration?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c32)
- [C31 How do Swiss Tables find a key and grow a Go map?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c31) *(Deep Dive)*
- [SIM7 Диаграмма 7: map — бакеты, поиск в Swiss Tables и память](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim7)
- [Q1 Три функции после завершения цикла](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q1)
- [Q2 Nil-указатель внутри error](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q2)
- [Q3 Return до завершения defer](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q3)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5)

**Чего пока нет на сайте:**

- Нет быстрого режима «что выведет код» без вариантов ответа (ввести вывод → сверить → объяснение EN).
- Нет карточек по generics и тестированию (table-driven, t.Helper, t.Parallel, -race в CI).

## Неделя 3. Конкурентность I: горутины, каналы, select, sync (26.10–01.11)

**Цель:** Писать worker pool, pipeline и fan-in без гонок и утечек и объяснять по-английски, кто владеет горутиной и кто закрывает канал.

**Готово, когда:** W3-1…W3-5 работают под go test -race; на каждый ответ «кто закрывает канал и как горутина завершится» есть одно предложение.

### Пн · 90 мин

- [ ] Горутины, WaitGroup; горутина vs поток ОС; data race vs race condition — [C1](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c1), [C2](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c2), [The Go Memory Model](https://go.dev/ref/mem), [Data Race Detector](https://go.dev/doc/articles/race_detector)
  - Готово, когда: c1 и c2: ответ по-английски до раскрытия; практика c2 выполнена. Изменённое условие: свой пример логической гонки без data race.
- [ ] Go blog: Pipelines and cancellation — [go.dev/blog/pipelines](https://go.dev/blog/pipelines)
  - Готово, когда: Пересказана схема отмены пайплайна: кто сигнализирует остановку и как каждая стадия завершается.
- [ ] LeetCode 155. Min Stack + проговор — [LC 155. Min Stack](https://leetcode.com/problems/min-stack/)

### Вт · 90 мин

- [ ] Каналы: буфер что меняет и чего не меняет; nil/open/closed; диаграмма передачи значения — [C13](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c13), [C14](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c14), [SIM3](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim3)
  - Готово, когда: Таблица nil/open/closed для отправки, приёма и close — по памяти; шаги sim3 предсказаны до переключения.
- [ ] W3-1 Worker pool: N воркеров, канал задач, канал результатов, отправитель закрывает канал после всех отправок. Проговор — [C12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12), [Q15](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q15), проговор: «W3-1. Worker pool»
  - Готово, когда: Тесты: не больше N одновременных задач, все результаты получены, отмена в середине завершает всех воркеров, медленный потребитель не ведёт к неограниченной памяти; -race чистый.
  - На сайте пока нет: Coding-задание workerpool с контрактом и закрытым эталоном (практикум недели 3).
- [ ] W3-2 Pipeline generator → square → sink с остановкой через context
  - Готово, когда: Тест: отмена или ранний выход потребителя останавливает все стадии; зависших горутин нет.
  - На сайте пока нет: Coding-задание pipeline (практикум недели 3).

### Ср · 90 мин

- [ ] select: выбор ветки, default, отмена — только Base-уровень; задача с запасной веткой — сначала ответ без вариантов — [C18](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c18), [Q22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q22)
  - Готово, когда: c18 и q22: ответ до вариантов; объяснено, почему проверка ctx перед select не даёт строгого приоритета отмены.
- [ ] W3-3 Fan-in merge нескольких каналов с WaitGroup и закрытием выхода
  - Готово, когда: Выход закрывается после закрытия всех входов; отмена прерывает работу; тест на пустой набор входов.
  - На сайте пока нет: Coding-задание fanin (практикум недели 3).
- [ ] Code review без вариантов: найти баг и исправление, потом открыть разбор — [Q12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12), [Q15](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q15), [Q21](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q21)
  - Готово, когда: q12, q15, q21: дефект и исправление названы до вариантов.
  - На сайте пока нет: Режим code review без вариантов ответа (следующий этап).
- [ ] LeetCode 567. Permutation in String + проговор (записать) — [LC 567. Permutation in String](https://leetcode.com/problems/permutation-in-string/)

### Чт · 90 мин

- [ ] sync: Mutex, RWMutex, Once, WaitGroup, atomic; channel vs mutex; CAS — [C15](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c15), [C20](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c20), [C21](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c21), [C22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22), [SIM5](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim5)
  - Готово, когда: c15, c20, c21, c22: ответы до раскрытия; объяснено, почему atomic не защищает составной инвариант.
- [ ] W3-4 Счётчик тремя способами (Mutex, atomic, канал) + бенчмарк. W3-5 SafeCache на map + RWMutex — проговор: «W3-4. Mutex vs atomic vs channel»
  - Готово, когда: Счётчик тремя способами даёт один результат под -race; SafeCache не отдаёт наружу ссылку на защищённые данные; вывод бенчмарка без «всегда быстрее».
  - На сайте пока нет: Coding-задания counter и safecache (практикум недели 3).
- [ ] Ловушки sync: копия WaitGroup, повторный Lock, double-checked locking, указатель из защищённой map — [Q7](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q7), [Q8](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q8), [Q13](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q13), [Q14](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q14)
  - Готово, когда: q7, q8, q13, q14: дефект до вариантов; исправленный код объяснён.

### Сб · 240 мин

- [ ] Прогнать W3-1…W3-5 под go test -race; для каждой горутины записать владельца и путь завершения
  - Готово, когда: Для каждой горутины W3-1…W3-5 записаны владелец и условие завершения; все тесты под -race проходят.
- [ ] Дополнительно: 100 Go Mistakes — Concurrency Foundations *(по желанию)* — [100go.co](https://100go.co/)
- [ ] LeetCode 150. Evaluate Reverse Polish Notation + проговор — [LC 150. Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)
- [ ] Проговор worker pool и «channel vs mutex» по-английски, записать — проговор: «W3-1. Worker pool»
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

- [C1 What is a goroutine, and how does it differ from an OS thread?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c1)
- [C2 Can a program have a race condition without a data race?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c2)
- [C13 What does a channel buffer change, and what does it not change?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c13)
- [C14 How do nil, open, and closed channels behave?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c14)
- [SIM3 Диаграмма 3: Канал — от ожидания до продолжения](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim3)
- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12)
- [Q15 Собрать результаты параллельных вычислений](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q15)
- [C18 How does select choose a case, and can cancellation take priority?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c18)
- [Q22 Чтение с запасной веткой](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q22)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12)
- [Q21 Срез после передачи через канал](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q21)
- [C15 Channels or a mutex — who owns the data, and what must happen together?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c15)
- [C20 What does compare-and-swap do, and why is a separate check and store different?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c20)
- [C21 How does a mutex acquire, wait and hand off — and what does 1 ms really mean?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c21)
- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22)
- [SIM5 Диаграмма 5: CAS — сравнить и заменить одним действием](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim5)
- [Q7 Копия WaitGroup и чужой счётчик](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q7)
- [Q8 Повторный Lock и цикл ожидания](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q8)
- [Q13 Чтения защищены, но проверка устарела](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q13)
- [Q14 Баланс из общей map](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q14)

**Чего пока нет на сайте:**

- Нет практических заданий «напиши паттерн» (worker pool, pipeline, fan-in) с эталонным решением и тестом под -race.
- Нет английских опорных ответов по шагам для практических паттернов, только для карточек-теории.

## Неделя 4. Конкурентность II и минимум рантайма (02.11–08.11)

**Цель:** Писать за 20–30 минут отменяемые конкурентные решения (errgroup, rate limit, graceful shutdown) и на базовом уровне объяснять GMP, GC и escape analysis.

**Готово, когда:** 6 эталонных решений пишутся за 20–30 мин; найдена утечка горутины через pprof; пройдены контрольный квиз и виртуальный live coding.

### Пн · 90 мин

- [ ] context: отмена, таймауты, WithoutCancel; передача ctx в I/O — [C22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22), [Q9](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q9), [Q10](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q10), [package context](https://pkg.go.dev/context)
  - Готово, когда: c22, q9, q10: ответ до раскрытия; объяснено, что отмена контекста не останавливает код, который ctx не проверяет.
- [ ] W4-1 ParallelFetch: errgroup.WithContext + SetLimit, первая ошибка отменяет остальных — [Q16](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q16), [errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup), проговор: «W4-1. ParallelFetch with errgroup»
  - Готово, когда: Тесты: первая ошибка отменяет остальные; SetLimit соблюдается; к возврату все запущенные операции завершены; контекст группы не используется после Wait.
  - На сайте пока нет: Coding-задание parallelfetch (практикум недели 4).
- [ ] LeetCode 200. Number of Islands + проговор — [LC 200. Number of Islands](https://leetcode.com/problems/number-of-islands/)

### Вт · 90 мин

- [ ] select-паттерны и ловушки: errgroup после Wait, eager evaluation, time.After в цикле — [Q16](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q16), [Q17](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q17), [Q11](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q11)
  - Готово, когда: q16, q17, q11: ответ до вариантов; для q11 названо, что изменилось в Go 1.23 и почему важна версия в go.mod.
- [ ] W4-2 Rate limiter token bucket; сравнить с golang.org/x/time/rate. Проговор — [x/time/rate](https://pkg.go.dev/golang.org/x/time/rate), проговор: «W4-2. Rate limiter»
  - Готово, когда: Тесты: отказ сверх лимита, burst, восстановление после паузы; отличие от x/time/rate описано.
  - На сайте пока нет: Coding-задание ratelimit (практикум недели 4).

### Ср · 90 мин

- [ ] Утечки горутин: как найти и предотвратить — [C12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12)
  - Готово, когда: c12: ответ и практика без подсказки. Изменённое условие: утечка при уходе потребителя.
- [ ] W4-3 Graceful shutdown HTTP-сервера: signal.NotifyContext, Shutdown с таймаутом, дренаж фоновых воркеров — [C22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22), [http.Server.Shutdown](https://pkg.go.dev/net/http#Server.Shutdown), [signal.NotifyContext](https://pkg.go.dev/os/signal#NotifyContext), проговор: «W4-3. Graceful shutdown»
  - Готово, когда: Тест: новые запросы не принимаются, работа в полёте завершается, зависимости закрываются после воркеров; таймаут соблюдается.
  - На сайте пока нет: Coding-задание shutdown (практикум недели 4).
- [ ] W4-4 Написать утечку намеренно и найти её goroutine-профилем pprof
  - Готово, когда: Утечка воспроизведена и найдена в goroutine-профиле; исправление подтверждено тестом завершения своих горутин, а не числом NumGoroutine.
  - На сайте пока нет: Упражнение leak (практикум недели 4).
- [ ] LeetCode 102. Binary Tree Level Order Traversal + проговор — [LC 102. Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

### Чт · 90 мин

- [ ] Минимум рантайма для интервью: GMP и GOMAXPROCS, вытеснение, netpoller — короткие ответы — [C7](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c7), [SIM2](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim2), [C8](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c8), [C10](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c10)
  - Готово, когда: c7, c8, c10: ответ по-английски за 30 секунд без деталей реализации; шаги sim2 предсказаны до переключения.
- [ ] Память: стек vs куча, escape analysis, GC на высоком уровне, GOGC/GOMEMLIMIT — [C23](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c23), [C24](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c24), [C26](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c26), [C27](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c27), [SIM6](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim6), [A Guide to the Go Garbage Collector](https://go.dev/doc/gc-guide)
  - Готово, когда: c23, c24, c26, c27: ответы до раскрытия; объяснено, почему GOMEMLIMIT не гарантирует отсутствие OOM.
- [ ] W4-5 Escape analysis: go build -gcflags=-m для трёх функций, объяснить каждую строку вывода
  - Готово, когда: Для трёх функций объяснена каждая строка вывода -gcflags=-m; одна функция изменена так, чтобы переменная осталась на стеке, и это проверено повторно.
  - На сайте пока нет: Упражнение escape (практикум недели 4).
- [ ] По желанию, Deep Dive: стек и регистры, work stealing, runnext, устройство каналов и selectgo, аллокатор, write barrier, weak/unique, итераторы *(по желанию)* — [C3](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c3), [C4](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c4), [C5](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c5), [C6](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c6), [C9](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c9), [C11](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c11), [C16](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c16), [C17](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c17), [C19](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c19), [C25](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c25), [C28](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c28), [C36](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c36), [C37](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c37), [SIM1](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim1), [SIM4](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim4)

### Сб · 240 мин

- [ ] W4-6 Бенчмарк + CPU-профиль на txsum: go test -bench, pprof top/list — [Go Diagnostics](https://go.dev/doc/diagnostics)
  - Готово, когда: Профиль снят; гипотеза проверена изменением и повторным бенчмарком; вывод без обещаний конкретной скорости.
  - На сайте пока нет: Упражнение profile (практикум недели 4).
- [ ] Новое в 1.25+: container-aware GOMAXPROCS, testing/synctest — одна фраза на каждое — [C38](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c38)
  - Готово, когда: c38: по одной фразе про GOMAXPROCS в контейнерах (Linux, Go 1.25) и про synctest, с версиями.
- [ ] LeetCode 98. Validate Binary Search Tree + проговор — [LC 98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
- [ ] Контрольная точка: квиз по конкурентности в режиме «сначала ответ без вариантов» — [Q5](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5), [Q7](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q7), [Q8](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q8), [Q9](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q9), [Q10](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q10), [Q11](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q11), [Q12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12), [Q13](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q13), [Q14](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q14), [Q15](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q15), [Q16](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q16), [Q17](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q17), [Q21](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q21), [Q22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q22)
  - Готово, когда: Все 14 задач: ответ до вариантов; результат первой попытки записан; ошибки — в повтор.
- [ ] Виртуальный live coding (Claude как интервьюер): одна задача на конкурентность, проговор по-английски, разбор
  - Готово, когда: Задача решена вслух за 40 минут; получен разбор; три слабых места записаны.

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

- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22)
- [Q9 Результат после отмены запроса](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q9)
- [Q10 Время жизни запроса и фоновой работы](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q10)
- [Q16 Контекст errgroup после успешного Wait](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q16)
- [Q17 Заполненный канал и сигнал остановки](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q17)
- [Q11 Ожидание следующего сообщения](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q11)
- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12)
- [C7 How do G, M and P relate to GOMAXPROCS?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c7)
- [SIM2 Диаграмма 2: Очереди, вытеснение, перехват работы и ожидание](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim2)
- [C8 How does Go preempt a CPU-bound goroutine?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c8)
- [C10 How do network polling, blocking syscalls and cgo affect G, M and P?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c10)
- [C23 How do stack and heap allocation differ, and how do you compare their cost?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c23)
- [C24 How does escape analysis choose storage, and how do you verify a particular allocation?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c24)
- [C26 How does Go's GC decide what to keep, and what happens during a collection?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c26)
- [C27 How do GC phases, mark assists, GOGC and GOMEMLIMIT affect memory and latency?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c27)
- [SIM6 Диаграмма 6: Аллокатор памяти (mcache / mspan) и Трёхцветный сборщик мусора (Tri-Color GC)](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim6)
- [C3 What happens when Go starts a goroutine?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c3)
- [C4 Where is a goroutine stack allocated, and what does StackInuse measure?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c4)
- [C5 How does a goroutine stack grow, and why do pointers remain valid?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c5) *(Deep Dive)*
- [C6 What must the runtime restore to resume a goroutine?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c6) *(Deep Dive)*
- [C9 How does the scheduler find work and steal from another P?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c9)
- [C11 What is P.runnext, and how does it interact with fairness?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c11) *(Deep Dive)*
- [C16 Why does a channel wait queue contain sudog records instead of just goroutines?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c16)
- [C17 How does a channel safely hand a value to a waiting receiver?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c17) *(Deep Dive)*
- [C19 Does every select call selectgo, and how does the general path work?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c19) *(Deep Dive)*
- [C25 How do mcache, mcentral, mheap and scan/noscan fit together?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c25)
- [C28 What does Go's hybrid write barrier protect, and which pointer writes need it?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c28) *(Deep Dive)*
- [C36 When should you use weak pointers, unique handles and runtime cleanups?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c36)
- [C37 How do push iterators differ from iter.Pull, and when must you call stop?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c37) *(Deep Dive)*
- [SIM1 Диаграмма 1: Кто выполняется, где стек, откуда продолжить](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim1)
- [SIM4 Диаграмма 4: select — от компилятора до пробуждения](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/simulators/sim4)
- [C38 What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c38)
- [Q5 Recover в другой горутине](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q5)
- [Q7 Копия WaitGroup и чужой счётчик](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q7)
- [Q8 Повторный Lock и цикл ожидания](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q8)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12)
- [Q13 Чтения защищены, но проверка устарела](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q13)
- [Q14 Баланс из общей map](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q14)
- [Q15 Собрать результаты параллельных вычислений](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q15)
- [Q21 Срез после передачи через канал](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q21)
- [Q22 Чтение с запасной веткой](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q22)

**Чего пока нет на сайте:**

- Deep Dive-карточки не помечены как «не обязательно для EU-интервью» — легко потратить на них время недель 3–4.
- Нет задач на чтение pprof/trace-вывода и интерпретацию профиля.

## Неделя 5. Проект I: каркас ledger-сервиса (09.11–15.11)

**Цель:** Сервис счетов и переводов работает end-to-end: REST, PostgreSQL через pgx, миграции, структурные логи, Docker Compose.

**Готово, когда:** Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском.

### Пн · 90 мин

- [ ] ADR-001 (EN): scope — счета, переводы, балансы, double-entry; что вне scope
  - Готово, когда: ADR на английском: контекст, решение, альтернативы, последствия; что в scope и вне его.
- [ ] Раскладка: cmd/ledger, internal/http, internal/ledger, internal/store; Money в int64 минорных единицах
  - Готово, когда: Пакет ledger не импортирует net/http и драйвер БД; Money в int64 покрыт тестами.
- [ ] LeetCode 230. Kth Smallest Element in a BST + проговор — [LC 230. Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)

### Вт · 90 мин

- [ ] HTTP на net/http с шаблонами маршрутов Go 1.22+: POST /accounts, POST /transfers, GET /accounts/{id} — [Routing enhancements (Go 1.22)](https://go.dev/blog/routing-enhancements)
  - Готово, когда: Три маршрута работают; тесты через httptest на успешный ответ, 404 и 405.
  - На сайте пока нет: Прикладная карточка: жизненный цикл handler и дедлайны запроса (неделя 5).
- [ ] Валидация входа и ошибки → HTTP-коды через errors.As (из W1-3)
  - Готово, когда: Ошибка валидации → 400 с полем; нехватка средств → выбранный код с записанным обоснованием; неизвестная ошибка → 500 без деталей наружу; тест на каждый случай.
  - На сайте пока нет: Карточка: ошибки домена → HTTP-коды через errors.As.

### Ср · 90 мин

- [ ] PostgreSQL через pgx/v5 и pgxpool; миграции (goose или golang-migrate) — [pgx](https://pkg.go.dev/github.com/jackc/pgx/v5)
  - Готово, когда: Миграции применяются на чистой БД; у пула заданы лимиты и таймаут подключения.
- [ ] Управление ресурсами SQL: defer Rollback, rows.Close, rows.Err, пул соединений — [Q18](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q18), [Q19](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q19)
  - Готово, когда: q18 и q19: ответ до вариантов; в коде проверяются rows.Close и rows.Err, Rollback безопасен после Commit; тест на ошибку посреди итерации.
  - На сайте пока нет: Карточка: пул и ресурсы SQL, граница транзакции.
- [ ] LeetCode 236. Lowest Common Ancestor of a Binary Tree + проговор — [LC 236. Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)

### Чт · 90 мин

- [ ] log/slog в JSON, request id в контексте; конфиг из переменных окружения — [log/slog](https://pkg.go.dev/log/slog)
  - Готово, когда: JSON-логи с request id; секреты не логируются; конфиг из окружения с понятной ошибкой при отсутствии значения.
  - На сайте пока нет: Короткая карточка про slog.
- [ ] Docker Compose: postgres + сервис; healthcheck
  - Готово, когда: docker compose up поднимает сервис после healthcheck БД.

### Сб · 240 мин

- [ ] Перевод end-to-end: создание счетов, перевод, проверка балансов через curl
  - Готово, когда: Сценарий end-to-end и тесты отказов: нехватка средств, несуществующий счёт, повтор запроса; сумма балансов сходится.
- [ ] Проговор по-английски: «Walk me through your project structure and why» — проговор: «Рассказ о структуре проекта»
  - Готово, когда: Запись 3 минуты по-английски: структура, одно решение и его цена, что бы изменил.
- [ ] LeetCode 215. Kth Largest Element in an Array (heap) + проговор — [LC 215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)

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

- [Q18 Ошибка запроса и отложенная очистка](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q18)
- [Q19 Ранний break, defer и занятые соединения](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q19)

**Чего пока нет на сайте:**

- На сайте нет раздела про прикладной бэкенд на Go: net/http, database/sql/pgx, slog, конфигурация.
- Нет шаблона ADR и примеров «как рассказать про проект» по-английски.

## Неделя 6. Проект II: транзакции, идемпотентность, outbox → Kafka (16.11–22.11)

**Цель:** Повтор перевода безопасен, события доходят до Kafka через outbox, инвариант суммы балансов держится под конкурентной нагрузкой.

**Готово, когда:** Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат.

### Пн · 90 мин

- [ ] Уровни изоляции PostgreSQL; перевод в одной транзакции: SELECT … FOR UPDATE в стабильном порядке ID против дедлока — [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [ ] LeetCode 973. K Closest Points to Origin + проговор — [LC 973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

### Вт · 90 мин

- [ ] Идемпотентность: таблица ключей с UNIQUE и сохранённым ответом; другой payload с тем же ключом → ошибка — проговор: «Идемпотентность платежей»
- [ ] Гонка двух одинаковых запросов: атомарная вставка ключа, а не «проверить, потом вставить»

### Ср · 90 мин

- [ ] Transactional outbox: запись события в той же транзакции, что и перевод — проговор: «Transactional outbox»
- [ ] Relay-воркер публикует в Kafka (at-least-once): владелец горутины, остановка, ретраи — [C12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12), [C22](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22)
- [ ] LeetCode 621. Task Scheduler + проговор — [LC 621. Task Scheduler](https://leetcode.com/problems/task-scheduler/)

### Чт · 90 мин

- [ ] Consumer с идемпотентной обработкой; consumer groups, партиции, порядок по ключу — [Apache Kafka documentation](https://kafka.apache.org/documentation/)
- [ ] Docker Compose: добавить Kafka

### Сб · 240 мин

- [ ] Конкурентный тест: 100 параллельных переводов, инвариант суммы, go test -race
- [ ] Проговор: «How do you avoid double spending?» и «Why outbox instead of publishing after commit?» — проговор: «Transactional outbox»
- [ ] LeetCode 435. Non-overlapping Intervals + проговор — [LC 435. Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)

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

- [C12 How would you find and prevent a goroutine leak?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c12)
- [C22 WaitGroup, Once and Context — which one waits, publishes initialization or requests cancellation?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c22)

**Чего пока нет на сайте:**

- Нет материалов по транзакциям, изоляции, идемпотентности и outbox — это ядро финтех-собесов.
- Нет раздела про Kafka для Go-разработчика (партиции, группы, ретраи, DLQ).

## Неделя 7. Проект III: gRPC, тесты, бенчмарки (23.11–29.11)

**Цель:** У сервиса есть gRPC API, интеграционные тесты на настоящих PostgreSQL и Kafka, бенчмарк горячего пути.

**Готово, когда:** Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов.

### Пн · 90 мин

- [ ] proto + генерация (buf или protoc); gRPC Transfer и GetBalance — [gRPC Go quick start](https://grpc.io/docs/languages/go/quickstart/)
- [ ] LeetCode 133. Clone Graph + проговор — [LC 133. Clone Graph](https://leetcode.com/problems/clone-graph/)

### Вт · 90 мин

- [ ] Interceptors: логирование, дедлайн, перевод ошибок в gRPC-статусы
- [ ] Проговор: «REST vs gRPC — when would you choose which?» — проговор: «REST vs gRPC»

### Ср · 90 мин

- [ ] Unit-тесты: table-driven, фейки на границах, без sleep для синхронизации
- [ ] testing/synctest для кода со временем (Go 1.25) — [C38](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c38), [testing/synctest](https://pkg.go.dev/testing/synctest)
- [ ] LeetCode 207. Course Schedule + проговор — [LC 207. Course Schedule](https://leetcode.com/problems/course-schedule/)

### Чт · 90 мин

- [ ] Интеграционные тесты: testcontainers-go для PostgreSQL и Kafka — [testcontainers-go](https://golang.testcontainers.org/)
- [ ] golangci-lint и go test -race в CI

### Сб · 240 мин

- [ ] Бенчмарк горячего пути + allocs/op; если есть аллокации — escape analysis — [C24](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c24)
- [ ] Покрытие: где тестов нет намеренно и почему (записать в README)
- [ ] LeetCode 994. Rotting Oranges + проговор — [LC 994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)

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

- [C38 What do container-aware GOMAXPROCS, synctest and FlightRecorder actually guarantee?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c38)
- [C24 How does escape analysis choose storage, and how do you verify a particular allocation?](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/cards/c24)

**Чего пока нет на сайте:**

- Нет материалов по тестированию на Go и testcontainers.
- Карточка c38 про synctest — единственная точка про тестирование конкурентного кода.

## Неделя 8. Проект IV: production-readiness, CV (30.11–06.12)

**Цель:** Репозиторий можно показать работодателю: наблюдаемость, CI, README с решениями; есть черновик CV на английском.

**Готово, когда:** Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском.

### Пн · 90 мин

- [ ] OpenTelemetry: трассы и метрики для HTTP/gRPC; /healthz и /readyz — [OpenTelemetry Go](https://opentelemetry.io/docs/languages/go/)
- [ ] LeetCode 210. Course Schedule II + проговор — [LC 210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

### Вт · 90 мин

- [ ] Graceful shutdown всего сервиса: HTTP, gRPC, relay-воркер, consumer (из W4-3)
- [ ] GitHub Actions: lint, test -race, build Docker-образа

### Ср · 90 мин

- [ ] README: схема архитектуры, как запустить, 3–5 ADR, компромиссы и что бы сделал дальше
- [ ] LeetCode 684. Redundant Connection (union-find) + проговор — [LC 684. Redundant Connection](https://leetcode.com/problems/redundant-connection/)

### Чт · 90 мин

- [ ] Черновик CV на английском: «Senior backend engineer, Go + Kotlin, fintech»; проект — отдельной строкой со стеком
- [ ] Проверить карьерные страницы целевых компаний: открытые вакансии, требования к локации

### Сб · 240 мин

- [ ] Виртуальный Craft Deep-Dive (Claude как интервьюер): 30 минут вопросов по проекту на английском — проговор: «Craft Deep-Dive по проекту»
- [ ] LeetCode 743. Network Delay Time (Dijkstra) + проговор — [LC 743. Network Delay Time](https://leetcode.com/problems/network-delay-time/)
- [ ] Записать 3 вопроса, на которых запнулся, и дописать ответы в README/заметки

**LeetCode недели:** [210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) (Topological sort), [684. Redundant Connection](https://leetcode.com/problems/redundant-connection/) (Union-find), [743. Network Delay Time](https://leetcode.com/problems/network-delay-time/) (Dijkstra)

**Проговорить по-английски:**

- *What was the hardest design decision in this project, and what would you change?*
- *How would you observe this service in production?*
- *What are the failure modes of your service?*

**Самопроверка:**

- Какие сигналы скажут, что сервис деградирует?
- Что произойдёт при SIGTERM во время перевода?
- Какие 3 компромисса ты сознательно принял?

**Чего пока нет на сайте:**

- Нет тренажёра Craft Deep-Dive: вопросы интервьюера по собственному проекту с follow-up.

## Неделя 9. Take-home, code review, первая волна откликов (07.12–13.12)

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

- [ ] Code review по quiz сайта (≈45 мин): прочитать код задачи и написать комментарии ревьюера до вариантов ответа — [Q4](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q4), [Q10](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q10), [Q12](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12), [Q18](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q18), [Q19](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q19), [Q20](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q20)
- [ ] Собрать чек-лист ревьюера Go (≈45 мин): ошибки, контекст, горутины, ресурсы, тесты, API

### Сб · 240 мин

- [ ] Take-home, финал (≈150 мин): самоаудит по чек-листу, доработка
- [ ] Ещё 1 чужой PR в формате 40 минут
- [ ] Отклики волны 1 (≈30 мин): Luxoft, ZeptoLab и похожие — 5–10
- [ ] Дополнительно: LeetCode 322. Coin Change + проговор (или перенести в резерв) *(по желанию)* — [LC 322. Coin Change](https://leetcode.com/problems/coin-change/)

**LeetCode недели:** [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) (DP), [198. House Robber](https://leetcode.com/problems/house-robber/) (DP), [322. Coin Change](https://leetcode.com/problems/coin-change/) (DP)

**Проговорить по-английски:**

- *Walk me through the decisions in your take-home.*
- *What would you change if you had another day?*
- *How do you give code review feedback that is direct but not harsh?*

**Самопроверка:**

- Какие 5 пунктов ты проверяешь в любом Go-PR первым делом?
- Как ты поступаешь, если в take-home что-то неоднозначно?

**Материал сайта:**

- [Q4 16 байт из большого буфера](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q4)
- [Q10 Время жизни запроса и фоновой работы](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q10)
- [Q12 Общий append или отдельные индексы](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q12)
- [Q18 Ошибка запроса и отложенная очистка](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q18)
- [Q19 Ранний break, defer и занятые соединения](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q19)
- [Q20 Результат записи отчёта](https://aleksbeloushkin-srb.github.io/golang-runtime-prep/#/quiz/q20)

**Чего пока нет на сайте:**

- Нет режима code review: показать фрагмент, дать написать комментарии, затем сравнить с эталонным списком замечаний.
- Quiz сейчас только выбор варианта, а не самостоятельный поиск дефекта.

## Неделя 10. System Design I (14.12–20.12)

**Цель:** По шаблону за 40 минут вести дизайн вслух на английском и в каждом дизайне объяснять, почему Go.

**Готово, когда:** 3 дизайна проговорены и записаны; вторая волна откликов отправлена до праздников.

### Пн · 90 мин

- [ ] Шаблон ответа: requirements → API → data model → high-level → deep dive → bottlenecks → trade-offs — проговор: «Шаблон System Design»
- [ ] LeetCode 300. Longest Increasing Subsequence + проговор — [LC 300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)

### Вт · 90 мин

- [ ] Дизайн 1: Rate limiter на 100K RPS (один инстанс → распределённый) — [Rate limiter 100K RPS (itvector)](https://itvector.io/articles/rate-limiter-100k-rps)

### Ср · 90 мин

- [ ] Дизайн 2: Payments / ledger — на основе своего проекта (идемпотентность, outbox, сверка)
- [ ] LeetCode 139. Word Break + проговор — [LC 139. Word Break](https://leetcode.com/problems/word-break/)

### Чт · 90 мин

- [ ] Дизайн 3: Notification service (каналы доставки, ретраи, дедупликация, приоритеты)
- [ ] Отклики волны 2 до праздников: Topi, Bolt, Zendesk

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

**Чего пока нет на сайте:**

- На сайте нет раздела System Design: шаблон, разобранные дизайны, вопросы интервьюера.
- Нет связки «механизм Go → архитектурное решение» (например, горутины и netpoller → почему Go для I/O-bound сервиса).

## Неделя 11. System Design II: event-driven и предметные дизайны (21.12–27.12)

**Цель:** Уверенно вести дизайн event-driven систем и предметные задачи целевых компаний.

**Готово, когда:** Ещё 3 дизайна проговорены; на вопрос про exactly-once есть точный ответ без мифов.

### Пн · 90 мин

- [ ] Event-driven: Kafka (партиции, порядок, consumer groups), outbox, sagas, ретраи и DLQ — проговор: «Transactional outbox»
- [ ] LeetCode 33. Search in Rotated Sorted Array + проговор — [LC 33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

### Вт · 90 мин

- [ ] Дизайн 4: Dispatch / delivery (назначение курьеров, гео-данные) — под Delivery Hero и Wolt

### Ср · 90 мин

- [ ] Дизайн 5: Inventory с резервированием (Quick Commerce): гонки за остаток, TTL резерва

### Чт · 90 мин

- [ ] Дизайн 6: Multi-tenant SaaS (тикеты, как Zendesk): изоляция арендаторов, шардирование, noisy neighbour

### Сб · 240 мин

- [ ] Повторить один дизайн с нуля за 40 минут и записать
- [ ] 2 повторные задачи LeetCode из слабых тем с проговором

**LeetCode недели:** [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) (Binary search)

**Проговорить по-английски:**

- *How do you guarantee ordering for events of the same account?*
- *What does exactly-once really mean in Kafka-based systems?*
- *How would you isolate tenants in a shared database?*

**Самопроверка:**

- Saga: оркестрация или хореография — когда что?
- Что делать с сообщением, которое стабильно падает в обработке?
- Как избежать overselling при параллельных резервах?

**Чего пока нет на сайте:**

- Нет материалов по event-driven архитектуре и предметным дизайнам целевых компаний.

## Неделя 12. Behavioral, легенда, CV (28.12–03.01)

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
- [ ] 2 повторные задачи LeetCode из слабых тем

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

**Чего пока нет на сайте:**

- Нет банка behavioral-вопросов с шаблоном STAR и тренировкой ответа вслух.

## Неделя 13. Моки и пик откликов (04.01–10.01)

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

### LC 347. Top K Frequent Elements

- **Clarify:** Is k always valid? If two numbers have the same frequency, does the order matter?
- **Approach:** First count frequencies in a map. Then bucket sort: a slice of buckets indexed by frequency, which is at most n. Walk the buckets from the highest frequency and collect k numbers. A min-heap of size k is the alternative.
- **Complexity:** Buckets give O(n) time and O(n) space; the heap is O(n log k).
- **Edge cases & tests:** k equals the number of unique elements; all elements are the same.

### LC 238. Product of Array Except Self

- **Clarify:** Division isn't allowed, right? Can there be zeros?
- **Approach:** Two passes. Left to right I store the product of everything before each index. Right to left I keep a running suffix product and multiply it in. Zeros are handled naturally because I never divide.
- **Complexity:** O(n) time, O(1) extra space besides the output.
- **Edge cases & tests:** One zero; two zeros, where every result is zero; negative numbers.

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

- **Approach:** I store money as int64 minor units, so 12.50 EUR is 1250, because float64 can't represent decimal amounts exactly and rounding errors are unacceptable in payments. String() formats units and cents with the currency code.
- **Edge cases & tests:** Negative amounts, zero, amounts below one euro like 0.05.

### W1-2. Account и W1-3. ValidationError

- **Approach:** Withdraw needs a pointer receiver because it mutates the balance. On insufficient funds I return a sentinel error wrapped with context using %w, so the caller can still check it with errors.Is. ValidationError is a struct that carries the field name; errors.As walks the wrapped chain and extracts it, so the handler can return a 400 with the exact field.
- **Edge cases & tests:** errors.Is compares against a specific value; errors.As matches by type and gives me the value.

### W1-5. SafeDiv

- **Approach:** A deferred function calls recover; if a panic happened, it converts it into an error through a named return value.
- **Edge cases & tests:** In Go panic is for programmer bugs, not control flow. I'd normally check for zero up front; recover belongs at boundaries like HTTP middleware, so one bad request doesn't crash the server.

### W1-6. Method sets

- **Approach:** The method set of T contains only value-receiver methods; the method set of *T contains both. So if Notify has a pointer receiver, only *Service satisfies Notifier, and passing a Service value fails at compile time.
- **Edge cases & tests:** The rule itself comes from the spec. The rationale: an interface holds a copy of the value, so a pointer method called through it would change that copy, not the caller's variable.

### W2-1. Remove

- **Approach:** The order-preserving version is append(s[:i], s[i+1:]...). The catch is that it writes into the same backing array, so the caller's original slice changes too. The fast version swaps in the last element: O(1), but it loses the order.
- **Edge cases & tests:** slices.Delete also modifies the shared backing array, and since Go 1.22 it zeroes the vacated tail elements. If the caller still needs the original, I make an independent copy first, for example with slices.Clone.

### W2-3. Generics vs interfaces

- **Approach:** I use generics when the logic is identical for every type, like Map or a Set. I use an interface when each type behaves differently. Rule of thumb: write the concrete version first and generalize when a second use case appears.

### W2-4. txsum CLI

- **Approach:** I read the CSV with encoding/csv, parse each row into a transaction and aggregate balances in a map keyed by account and currency, using int64 minor units. Bad rows don't stop the run: I collect them with line numbers and report at the end, with a non-zero exit code if any failed.
- **Edge cases & tests:** Table-driven test for the row parser: valid row, missing column, non-numeric amount, unknown currency.

### «Что выведет код»: как объяснять

- P1 slice append into shared array — t has capacity 3, so append writes into the shared backing array and overwrites s[2].
- P3 nil map — reading returns the zero value, but writing panics: assignment to entry in nil map.
- P4 defer order — deferred calls run in LIFO order, and their arguments are evaluated when defer executes.
- P5 named result — return 1 assigns to the named result first, then the deferred function increments it.
- P6 typed nil — the interface holds the type *E with a nil value, so the interface itself isn't nil.
- P9 loop variable — since Go 1.22 each iteration has its own variable; before 1.22 all closures shared one.

### W3-1. Worker pool

- **Clarify:** How many workers? Do results need to keep the input order? What happens if one job fails?
- **Approach:** I start N workers that range over a jobs channel and send to a results channel. The producer closes jobs after the last send; a separate goroutine waits on a WaitGroup for all workers and then closes results, so the consumer's range loop ends. Every goroutine has an owner and a clear exit: the channel closing or ctx.Done().
- **Complexity:** Concurrency is bounded by N, so memory and connections stay predictable under load.
- **Edge cases & tests:** Zero jobs; cancellation in the middle; a slow consumer — that's backpressure, the workers block on send instead of buffering unboundedly.

### W3-4. Mutex vs atomic vs channel

- **Approach:** For a single counter an atomic operation is usually the simplest fit; whether it is faster depends on contention, so I'd compare with a benchmark rather than assume. A mutex is right when the invariant spans several fields. A channel fits when I'm transferring ownership of data or coordinating work, not just protecting a variable.
- **Edge cases & tests:** An atomic protects one value; it doesn't make a check-then-act sequence on two values safe.

### W4-1. ParallelFetch with errgroup

- **Clarify:** Should one failure cancel the rest? Is there a limit on concurrent requests?
- **Approach:** errgroup.WithContext gives me a context that is cancelled on the first error. SetLimit bounds concurrency. Each fetch uses the group's context, so the other requests stop early. Wait returns the first error.
- **Edge cases & tests:** The derived context is cancelled after Wait returns, so it must not be used for work after Wait.

### W4-2. Rate limiter

- **Approach:** For a single instance, a token bucket: tokens refill at a fixed rate up to a burst size; a request takes a token or is rejected or waits. In Go I'd use golang.org/x/time/rate rather than hand-roll it. Across many instances the state must be shared — for example Redis with an atomic script — or each instance gets a share of the global limit.
- **Edge cases & tests:** Burst behaviour; clock skew between instances; what the client sees on rejection — 429 with Retry-After.

### W4-3. Graceful shutdown

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

## Образцы ответов на английском (недели 1–3)

Открывать после своей попытки вслух. *Remember* — одна строка для запоминания; ниже — короткий ответ для интервью. Сверять смысл, а не заучивать дословно.

**w1-mon-1** — Tour of Go: Basics — packages, variables, functions, flow control, defer

<details><summary>Model answer (EN)</summary>

*Remember:* var gives the zero value; := declares and infers; defer runs LIFO.

var x T declares a variable with its zero value and also works at package level. x := expr is a short declaration inside a function: it infers the type and must declare at least one new variable on the left. Deferred calls run when the surrounding function returns, last in, first out, and their arguments are evaluated when the defer statement runs.

</details>

**w1-tue-1** — Tour: pointers, structs, arrays, slices, maps, function values, closures

<details><summary>Model answer (EN)</summary>

*Remember:* A closure captures the variable, not a copy of its value.

A closure refers to the variable itself, so a later change to that variable is visible inside the closure. Since Go 1.22, in modules declaring go 1.22 or later, each loop iteration has its own loop variable, so closures created in a loop no longer share one variable.

</details>

**w1-tue-3** — W1-1 Money: тип в минорных единицах (int64) + валюта, метод String() → «12.50 EUR». Проговор

<details><summary>Model answer (EN)</summary>

*Remember:* Money is integer minor units plus a currency, never float64.

I store money as int64 minor units with a currency code, so 12.50 EUR is 1250. float64 cannot represent most decimal fractions exactly, and rounding errors accumulate in sums. String() splits units and cents: 1250 becomes "12.50 EUR" and 5 becomes "0.05 EUR". The number of minor digits belongs to the currency: JPY has none and some currencies have three, so I don't hard-code 100.

</details>

**w1-wed-1** — Tour: methods, interfaces, type assertions, type switches, Stringer, errors

<details><summary>Model answer (EN)</summary>

*Remember:* A type switch branches on the dynamic type inside an interface.

A type switch inspects the dynamic type stored in an interface value and runs the matching case, with the variable already converted to that type. Stringer is the fmt interface with String() string; fmt uses it for %v and %s, which is how a type controls its printed form.

</details>

**w1-wed-2** — Сайт: интерфейсы и receivers — только короткий ответ и «как работает»

<details><summary>Model answer (EN)</summary>

*Remember:* Interface = type + value; nil only if both are nil. T has value methods, *T has both.

An interface value holds a dynamic type and a value, and it is nil only when both are nil. Returning a nil *MyErr as error therefore gives a non-nil error. The method set of T contains methods with value receivers; the method set of *T contains both value and pointer receivers. So if Notify has a pointer receiver, *Service implements the interface and Service does not. Calling v.Notify() on an addressable variable is only shorthand for (&v).Notify().

</details>

**w1-wed-3** — W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is) и W1-3 ValidationError (errors.As)

<details><summary>Model answer (EN)</summary>

*Remember:* Wrap with %w; Is compares, As extracts.

I wrap errors with fmt.Errorf("withdraw: %w", err) to add context while keeping the cause. errors.Is walks the chain and compares with a sentinel such as ErrInsufficientFunds; errors.As finds the first error of the target type, such as *ValidationError, and lets me read its fields. A test should check both after one and after two levels of wrapping.

</details>

**w1-thu-1** — Ошибки глубже: errors.New, fmt.Errorf("…: %w"), errors.Is/As, sentinel vs typed

<details><summary>Model answer (EN)</summary>

*Remember:* Sentinel for a condition, typed error for data; %v breaks the chain.

I use a sentinel error when callers only branch on a fixed condition, and a typed error when they need details such as the invalid field. With %w the cause stays in the chain; with %v it becomes plain text, so errors.Is and errors.As stop matching. errors.Join, since Go 1.20, combines several errors, and Is and As check each of them.

</details>

**w1-thu-2** — defer / panic / recover: карточка и три ловушки из quiz — сначала ответить без вариантов

<details><summary>Model answer (EN)</summary>

*Remember:* Defer arguments are evaluated at once; deferred closures can change named results.

Deferred calls run in last-in-first-out order when the function returns, but their arguments are evaluated when the defer statement executes. A deferred closure can read and change named results after the return statement has set them; with unnamed results it cannot change the returned value.

</details>

**w1-thu-4** — W1-4 порядок defer и W1-5 SafeDiv (recover → error). Проговор W1-3, W1-5

<details><summary>Model answer (EN)</summary>

*Remember:* recover works only in a deferred call of the panicking goroutine.

recover stops a panic only when it is called directly by a deferred function in the goroutine that is panicking. SafeDiv defers a function that recovers and turns the panic into an error result. A panic in another goroutine is not caught here and crashes the program unless that goroutine recovers it. For expected failures I return errors; panic is for programmer errors.

</details>

**w1-sat-1** — W1-6 Method sets: почему значение T не реализует интерфейс с pointer-методом

<details><summary>Model answer (EN)</summary>

*Remember:* Service lacks pointer-receiver methods in its method set; &Service{} has them.

var _ Notifier = Service{} fails to compile when Notify has a pointer receiver, because the method set of Service does not include it; &Service{} works. The rule comes from the spec. The usual motivation: an interface holds a copy of the value that is not addressable, so a pointer method could not modify the caller's value.

</details>

**w1-sat-2** — Шпаргалка Go vs Kotlin своими словами: nil/zero values, ошибки, struct vs data class, embedding, interfaces, видимость

<details><summary>Model answer (EN)</summary>

*Remember:* Every type has a usable zero value; nil map writes panic; nil channels block.

Every type has a zero value: 0, "", false, nil for pointers, slices, maps, channels, functions and interfaces, and each field zeroed for structs. A nil slice works with len, append and range. A nil map can be read, but writing to it panics. Sending to or receiving from a nil channel blocks forever. Map keys must be comparable, so slices, maps and functions cannot be keys.

</details>

**w2-mon-1** — Slice изнутри: header (ptr, len, cap), рост при append, общий backing array, copy, s[a:b:c]

<details><summary>Model answer (EN)</summary>

*Remember:* A slice is pointer, len, cap over a shared array.

A slice is a descriptor with a pointer, a length and a capacity over an underlying array. Re-slicing shares that array, so a write through one slice is visible through the other. append writes in place while capacity allows and otherwise allocates a new array and copies. s[a:b:c] limits capacity to c-a, so a later append cannot overwrite the original; copy or slices.Clone gives an independent slice.

</details>

**w2-mon-2** — Ловушки aliasing и удержания памяти — сначала ответ без вариантов

<details><summary>Model answer (EN)</summary>

*Remember:* Shared backing array plus spare capacity is the bug.

In both tasks the defect is that two slices share one backing array and append still has spare capacity, so it overwrites data the caller can see. The fix is either an independent copy or a full slice expression that limits capacity, so append must allocate.

</details>

**w2-tue-1** — Map по спецификации: порядок обхода не задан, запись в nil map — panic, адрес элемента взять нельзя, ключ должен быть сравнимым; map не потокобезопасна. Отдельно: после delete map не уменьшает свою таблицу, но удалённые значения сама больше не удерживает

<details><summary>Model answer (EN)</summary>

*Remember:* Map order is unspecified; reading nil is fine, writing nil panics.

Map iteration order is not specified, so code must not depend on it. Reading a missing key returns the zero value; v, ok tells absence from a stored zero. A nil map can be read but not written. Map elements are not addressable, so m[k].f = 1 does not compile for struct values. Concurrent writes need synchronization; the runtime may detect them and crash. Deleting entries does not shrink the table, but deleted values are no longer kept reachable.

</details>

**w2-tue-3** — Строки: string vs []byte vs []rune, UTF-8, strings.Builder. Дополнительно: 100 Go Mistakes — Data Types, Strings, Control Structures

<details><summary>Model answer (EN)</summary>

*Remember:* len counts bytes; range decodes runes.

A string is an immutable sequence of bytes, usually UTF-8. len(s) counts bytes and s[i] returns a byte, not a character. range over a string decodes runes and gives the byte offset of each. To count characters I use utf8.RuneCountInString, and I convert to []rune only when I really need to index by character.

</details>

**w2-tue-4** — W2-1 Remove(s, i) в двух версиях + тест, показывающий порчу исходного slice. Проговор (записать)

<details><summary>Model answer (EN)</summary>

*Remember:* Removing in place changes the caller's array; copy first for independence.

append(s[:i], s[i+1:]...) shifts elements inside the shared array, so the caller's slice sees the change. slices.Delete also modifies the array and, since Go 1.22, zeroes the elements after the new length. If the caller's data must stay intact, I copy first with slices.Clone or build a new slice.

</details>

**w2-wed-1** — Generics: type parameters, any, comparable, constraints с ~, cmp.Ordered

<details><summary>Model answer (EN)</summary>

*Remember:* Set[T comparable] because map keys must be comparable.

A generic Set[T comparable] is a map[T]struct{} with Add, Has and Len. The comparable constraint is required because only comparable types can be map keys. The empty struct value takes no space, so the map stores only keys.

</details>

**w2-wed-2** — W2-2 Map/Filter/Reduce и Set[T comparable]; W2-3 та же функция через интерфейс — сравнить

<details><summary>Model answer (EN)</summary>

*Remember:* Generics for same algorithm over types; interfaces for different behaviour.

I use generics when the algorithm is the same for many types and the caller needs the concrete type back, as in Map, Filter or Reduce. I use an interface when behaviour differs per type and callers depend on methods, for example different storage backends. I don't add type parameters just to avoid writing a small function twice.

</details>

**w2-thu-1** — Модули, пакеты, internal/, раскладка cmd/ + internal/

<details><summary>Model answer (EN)</summary>

*Remember:* Module = versioned set of packages; internal/ limits importers.

A module is a versioned collection of packages defined by go.mod; a package is one directory compiled together. Code under internal/ can be imported only by packages rooted at the parent of that internal directory. cmd/ for binaries and internal/ for private code is a common layout, not a language rule.

</details>

**w2-thu-2** — Тесты: table-driven, t.Run, t.Helper, t.Parallel, go test -cover, golangci-lint. Learn Go with Tests: 2–3 главы

<details><summary>Model answer (EN)</summary>

*Remember:* Named cases with t.Run; t.Helper fixes line numbers; t.Parallel only with isolated data.

Table-driven tests list named cases and run each in t.Run, so a failure shows the case name and one case can be run with -run. t.Helper marks a helper so failures point to the caller's line. t.Parallel runs a test alongside others, so I use it only when cases don't share mutable data. CI runs go test -race.

</details>

**w2-sat-2** — W2-4 CLI txsum: CSV account,amount,currency → балансы; ошибки строк собирать; table-driven тесты парсера

<details><summary>Model answer (EN)</summary>

*Remember:* Validate each line, report all errors, exit non-zero on failure.

txsum reads CSV lines, validates every field and sums amounts per currency in minor units. Invalid lines are reported with their line numbers instead of stopping at the first one, and the program exits with a non-zero code if any line failed. Tests cover a valid line, a missing column, a non-numeric amount and an unknown currency.

</details>

**w3-mon-1** — Горутины, WaitGroup; горутина vs поток ОС; data race vs race condition

<details><summary>Model answer (EN)</summary>

*Remember:* Data race: unsynchronized access with a write. Race condition: timing-dependent logic.

A goroutine is a function running concurrently, scheduled by the Go runtime onto OS threads; it starts with a small growable stack, so a program can have many. A data race is two goroutines accessing the same memory concurrently, at least one writing, without synchronization; the race detector reports it when it happens in a run. A race condition is a logic bug whose result depends on timing. It can exist without a data race, for example a check and an update done under two separate locks.

</details>

**w3-tue-1** — Каналы: буфер что меняет и чего не меняет; nil/open/closed; диаграмма передачи значения

<details><summary>Model answer (EN)</summary>

*Remember:* nil blocks; closed: send panics, receive drains then returns zero, false.

Sending to or receiving from a nil channel blocks forever. Sending on a closed channel panics; receiving from a closed channel returns the remaining buffered values, then the zero value with ok false. Closing a nil or an already closed channel panics. So the side that owns sending closes the channel, once, after the last send.

</details>

**w3-tue-2** — W3-1 Worker pool: N воркеров, канал задач, канал результатов, отправитель закрывает канал после всех отправок. Проговор

<details><summary>Model answer (EN)</summary>

*Remember:* Producer closes jobs; WaitGroup closes results; every blocking step watches ctx.

N workers read from a jobs channel and write to a results channel. The producer closes jobs after the last send. A separate goroutine waits for all workers with a WaitGroup and then closes results, so the consumer's range ends. Every send and receive also selects on ctx.Done, so cancellation or a consumer that stops reading cannot leave goroutines blocked.

</details>

**w3-tue-3** — W3-2 Pipeline generator → square → sink с остановкой через context

<details><summary>Model answer (EN)</summary>

*Remember:* Each stage owns and closes its output; every send selects on ctx.Done.

Each stage reads from its input, writes to an output it owns and closes that output when the input is exhausted. Every send selects on ctx.Done, so if the consumer stops early and cancels, all stages return and no goroutine stays blocked. A test cancels in the middle and checks that every stage has exited.

</details>

**w3-wed-1** — select: выбор ветки, default, отмена — только Base-уровень; задача с запасной веткой — сначала ответ без вариантов

<details><summary>Model answer (EN)</summary>

*Remember:* Random among ready cases; checking ctx first is not priority.

select waits for one of several channel operations; if several are ready, it picks one pseudo-randomly. default makes it non-blocking. Checking ctx.Err() before the select doesn't give cancellation priority, because once inside, a ready data case can still win. The channel operands and send values are evaluated once, before a case is chosen.

</details>

**w3-wed-2** — W3-3 Fan-in merge нескольких каналов с WaitGroup и закрытием выхода

<details><summary>Model answer (EN)</summary>

*Remember:* One forwarder per input; close output after all forwarders finish.

Fan-in starts one goroutine per input that forwards values to a shared output. A WaitGroup tracks the forwarders, and one goroutine closes the output after all of them return. Each forward selects on ctx.Done, so cancellation stops everything, and an empty list of inputs closes the output immediately.

</details>

**w3-thu-1** — sync: Mutex, RWMutex, Once, WaitGroup, atomic; channel vs mutex; CAS

<details><summary>Model answer (EN)</summary>

*Remember:* Atomics protect one variable; invariants across fields need a mutex.

Atomics make single operations on one variable indivisible, but they cannot protect an invariant that spans several values, such as checking a balance and then updating it. For that I hold one Mutex around the check and the update. RWMutex can help when reads dominate, but it is not automatically faster. A Mutex must not be copied after first use.

</details>

**w3-mon-2** — Go blog: Pipelines and cancellation

<details><summary>Model answer (EN)</summary>

*Remember:* Close outputs when done; a done channel or ctx stops every stage.

A pipeline is a series of stages connected by channels; each stage receives from upstream, processes and sends downstream. A stage closes its output when it has sent everything. If the consumer stops early, upstream stages would block forever, so every send also listens to a done channel or ctx.Done, and cancelling it releases all of them.

</details>

**w3-thu-3** — Ловушки sync: копия WaitGroup, повторный Lock, double-checked locking, указатель из защищённой map

<details><summary>Model answer (EN)</summary>

*Remember:* One WaitGroup by pointer; no re-lock; recheck under Lock; copy, don't leak pointers.

Calling Done on a copy of a WaitGroup leaves the original counter unchanged, so Wait blocks; pass *WaitGroup, or use wg.Go in Go 1.25+. Locking a Mutex again from the code that already holds it deadlocks, because Go mutexes are not reentrant. A check under RLock is stale after RUnlock, so check-then-insert must recheck under Lock; that is a logic race even without a data race. Returning a pointer from a protected map lets callers read or change the value after unlock, so I copy the value while holding the lock.

</details>

**w3-sat-1** — Прогнать W3-1…W3-5 под go test -race; для каждой горутины записать владельца и путь завершения

<details><summary>Model answer (EN)</summary>

*Remember:* For every goroutine: who starts it, who stops it, how it ends.

For each goroutine I can name its owner and its exit path: it returns when its input channel is closed, when ctx is cancelled, or when its single task is done, and someone waits for it with a WaitGroup or errgroup. If I can't name the exit path, the goroutine can leak. go test -race finds data races in the paths the tests run, not deadlocks or logic errors.

</details>

**w3-sat-4** — Проговор worker pool и «channel vs mutex» по-английски, записать

<details><summary>Model answer (EN)</summary>

*Remember:* Channels transfer ownership; mutexes protect shared state.

I use channels when work or data moves between goroutines, so ownership passes with the value, as in a worker pool. I use a mutex when several goroutines read and update the same state in place, such as a cache or a counter. The choice is about clarity of ownership; I measure before claiming either is faster.

</details>

**w3-thu-2** — W3-4 Счётчик тремя способами (Mutex, atomic, канал) + бенчмарк. W3-5 SafeCache на map + RWMutex

<details><summary>Model answer (EN)</summary>

*Remember:* Same result three ways; choose by clarity and measured contention; never leak internal state.

A counter with a Mutex, with atomic.Int64 and with a single owner goroutine gives the same result under -race; I choose by clarity and measured contention, not by a general rule. A cache guarded by RWMutex must not return its internal map or slices, because callers would then change shared data outside the lock; it returns copies instead.

</details>

## «Что выведет код» (неделя 2)

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

len считает байты; é (составной символ U+00E9) занимает в UTF-8 два байта, s[1] — первый из них, 0xC3 = 195; рун пять.

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

С Go 1.22 у каждой итерации своя переменная. Если версия языка в go.mod ниже 1.22, все замыкания разделяют одну переменную и печатают 333.

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
