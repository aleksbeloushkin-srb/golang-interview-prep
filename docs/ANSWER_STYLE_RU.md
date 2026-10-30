# Как строить короткий ответ (карточки, эталоны плана, talk практикума)

Подход собран по замечаниям пользователя, который слушал озвучку и отвечал вслух на выборку пилота (29–30 октября 2026). Он обязателен для `shortEN`/`shortRU` карточек, `modelAnswers[].en` плана и `talkEN` практикума. Удачные образцы: **c40** («одна из немногих отлично»), c2, c29, c39, c35.

## Порядок

1. **Где мы и о чём речь** — одна короткая фраза простыми словами: в какой ситуации это встречается или что это за вещь. Не абстрактный принцип и не голый код.
   - c2: «Yes, for example in a bank app: two withdrawals can both pass the balance check…»
   - c39: «In Go an error is a value that travels up the call stack, and each layer adds context to it.»
   - c47: «In Go you talk to a database through database/sql, and the main object is *sql.DB.»
   - c34: «Say we have a Counter whose Set method has a pointer receiver, and a Setter interface with Set.»
2. **Что это и какую проблему решает — своими словами.** c28: «The hybrid write barrier is code the compiler adds to pointer writes outside the stack; while the GC marks, it keeps the running program from hiding a live object.»
3. **Устройство** — из чего состоит или как работает. c29: «A slice is only a view onto data… Its structure is a pointer to the array, a length and a capacity…»
4. **Один главный пример в коде** — после рамки, не вместо неё. `s[1:3]`, `var n int`, `c.Set()`.
5. **Ключевые API — каждый отдельной фразой**, с вопросом, на который он отвечает: «errors.Is asks whether…», «errors.As asks whether…».
6. **Условие, меняющее истинность, и следствие** — в конце и в опоре.

## Чего избегать

- Начинать с голого кода или жёсткой конкретики («If Set has a pointer receiver…», «go f() starts…»).
- Начинать с абстрактного правила без привязки («Method sets decide…»).
- Длинного кода в речи: полный синтаксис — на экране; в `SPEECH_FIXES` можно сказать операцию словами, не меняя смысла (`fmt.Errorf("load user: %w", err)` → «fmt dot Errorf and percent w»).
- Разгонять ответ: добавлять одну-две фразы, не больше. Ориентир — 70–100 слов; если вышло больше, сократить повторы, а не рамку.

## Связанные правила

- Точно называть, кто действует: не «an unbuffered send waits», а «a goroutine sending into an unbuffered channel waits until another goroutine receives the value»; не «a nil channel blocks», а «a send or receive on a nil channel blocks the goroutine» (замечание к c13).
- Пишем по-программистски: термины и имена из кода (`var n int`, `m[k] = v`), но после рамки.
- RU повторяет EN по смыслу и порядку; опоры (`anchorsEN`) идут в том же порядке, что и ответ, и подкреплены текстом.
- После правки озвученного текста — пересоздать запись (`node scripts/gen-audio.mjs --week N` или `--cards c2,c7`) и обновить `SPEECH_FIXES`, если правка чтения перестала совпадать.
- Произношение проверять фонемами синтезатора: заглавные слитно читаются по буквам («GO-MAX-PROCS» → «go M-A-X procs», «Ps» → «P-S»); смешанный регистр — словами («Go max procs», «P's»).
