// v91: applies the 14-week renumbering to the data files, fixtures and audio keys.
// Reads every file from the base commit (maps.mjs, BASE) and writes the result, so a rerun gives the same output.
// Mechanical part: plan task IDs, practice codes, talk keys, week numbers in texts, go-prep packages — by maps.
// Layout part: weeks 1 and 2 by the approved table (docs/go-interview/V91-TASK.md of the user), each edit
// checked to match exactly once.
//   node docs/verification/v91/renumber.mjs [--dry-run]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BASE, root, showBase, idMap, codeMap, MODEL_MOVED, basePractice } from './maps.mjs';

const dry = process.argv.includes('--dry-run');
const ids = idMap();
const codes = codeMap();
const stats = {};
const count = (file, what, n = 1) => { stats[file] = stats[file] || {}; stats[file][what] = (stats[file][what] || 0) + n; };

// Exactly one occurrence of `from` in `text`.
function once(text, from, to, where) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw Error(`${where}: expected exactly one «${from.slice(0, 80)}», found ${n}`);
  return text.replace(from, () => to);
}

const DAYS = 'mon|tue|wed|thu|fri|sat|sun';
const mapIds = (text, file) => text.replace(new RegExp(`\\bw\\d+-(?:${DAYS})-\\d+\\b`, 'g'), id => {
  if (!(id in ids)) throw Error(`${file}: unknown task ID ${id}`);
  if (ids[id] !== id) count(file, 'task IDs');
  return ids[id];
});
const mapCodes = (text, file) => text.replace(/\bW\d+-\d+\b/g, code => {
  if (!(code in codes)) throw Error(`${file}: unknown practice code ${code}`);
  if (codes[code] !== code) count(file, 'codes');
  return codes[code];
});
const mapTalkKeys = (text, file) => text.replace(/"w(\d+)-(\d+)"/g, (m, a, b) => {
  const code = `W${a}-${b}`;
  if (!(code in codes)) throw Error(`${file}: unknown talk key ${m}`);
  count(file, 'talk keys');
  return `"${codes[code].toLowerCase()}"`;
});
const shift = n => (n >= 2 ? n + 1 : n);
// «неделя 5», «недели 3–4», «нед. 8»: weeks 2–13 become 3–14. A range that starts in week 1 needs a hand edit.
const shiftRuWeeks = (text, file) => text.replace(/([Нн]едел[а-яё]*|нед\.)(\s?)(\d+)(?:(\s?[–-]\s?)(\d+))?/g, (m, word, sp, a, dash, b) => {
  const from = Number(a), to = b === undefined ? null : Number(b);
  if (to !== null && from === 1 && to >= 2) throw Error(`${file}: «${m}» starts in week 1 — edit it by hand first`);
  if (from >= 2) count(file, 'week numbers');
  return `${word}${sp}${shift(from)}${to === null ? '' : `${dash}${shift(to)}`}`;
});
const shiftEnWeeks = (text, file) => text.replace(/\b([Ww]eeks?)(\s)(\d+)\b/g, (m, word, sp, a) => {
  if (Number(a) >= 2) count(file, 'week numbers');
  return `${word}${sp}${shift(Number(a))}`;
});
// go-prep packages: weekN/ follows its week; W2-1 ValidationError and W2-2/W2-3 deferpanic move from week1 to week2.
const shiftPackages = (text, file) => text
  .replace(/\bweek1\/(validation|deferpanic)\b/g, (m, pkg) => { count(file, 'packages'); return `week2/${pkg}`; })
  .replace(/\bweek(\d+)\b/g, (m, a) => { if (Number(a) >= 2) count(file, 'packages'); return `week${shift(Number(a))}`; });
const texts = (text, file) => shiftPackages(shiftEnWeeks(shiftRuWeeks(mapCodes(text, file), file), file), file);

// Hand-edited text that the week rule must not touch: held as a token until the maps are done.
const HELD = [];
const hold = (t, from, to, where) => once(t, from, `\u0000${HELD.push(to) - 1}\u0000`, where);
const release = t => t.replace(/\u0000(\d+)\u0000/g, (m, i) => HELD[Number(i)]);

const outputs = new Map();
const put = (file, text) => outputs.set(file, text);

/* ------------------------------- data/plan.js ------------------------------- */

function plan() {
  const file = 'data/plan.js';
  let t = showBase(file);
  // Hand edits that the week rule cannot decide (ranges from week 1), on the base text.
  t = hold(t, 'задачи недель 1–2 — пакетами в своём go-prep', 'задачи недель 1–3 — пакетами в своём go-prep', 'w3-thu-1 text');
  t = hold(t, 'В go-prep задачи недель 1–2 лежат в week1/ и week2/, go test ./... из корня проходит.', 'В go-prep задачи недель 1–3 лежат в week1/, week2/ и week3/, go test ./... из корня проходит.', 'w3-thu-1 accept');
  t = once(t, '// ─────────────── КРИТЕРИИ ПРИЁМКИ НЕДЕЛЬ 1–5 ───────────────', '// ─────────────── КРИТЕРИИ ПРИЁМКИ НЕДЕЛЬ 1–7 ───────────────', 'acceptance banner');
  t = once(t, '// ─────────────── ОБРАЗЦЫ ОТВЕТОВ НА АНГЛИЙСКОМ (НЕДЕЛИ 1–3, 5–6) ───────────────', '// ─────────────── ОБРАЗЦЫ ОТВЕТОВ НА АНГЛИЙСКОМ (НЕДЕЛИ 1–4, 6–7) ───────────────', 'modelAnswers banner');
  // Mechanical maps.
  t = mapIds(t, file);
  t = mapTalkKeys(t, file);
  t = release(texts(t, file));
  // Week IDs: wN of the old weeks 2–13 become w3…w14 (routes #/plan/wN follow them).
  t = t.replace(/^      id: "w(\d+)",$/gm, (m, n) => { if (Number(n) >= 2) count(file, 'week IDs'); return `      id: "w${shift(Number(n))}",`; });
  for (let w = 13; w >= 2; w--) t = once(t, `// ───────────────────────────── НЕДЕЛЯ ${w} ─────────────────────────────`, `// ───────────────────────────── НЕДЕЛЯ ${w + 1} ─────────────────────────────`, `banner ${w}`);
  // Header, revision, phases.
  t = once(t, '// Программа подготовки к офферу Senior Go в EU-компании: 13 недель, ~10 ч в неделю.', '// Программа подготовки к офферу Senior Go в EU-компании: 14 недель, ~10 ч в неделю.', 'header');
  t = once(t, 'revision: "2026-11-08",', 'revision: "2026-11-11",', 'revision');
  t = once(t, '// не переиспользовать старые.\n', '// не переиспользовать старые. Исключение — перенумерация v91 (renamedTaskIds ниже): её принял пользователь.\n', 'header IDs');
  t = once(t, '{ id: "go", title: "Go: язык и конкурентность", weeks: [1, 2, 3, 4] },', '{ id: "go", title: "Go: язык и конкурентность", weeks: [1, 2, 3, 4, 5] },', 'phase go');
  t = once(t, '{ id: "project", title: "Проект-портфолио: ledger-сервис", weeks: [5, 6, 7, 8] },', '{ id: "project", title: "Проект-портфолио: ledger-сервис", weeks: [6, 7, 8, 9] },', 'phase project');
  t = once(t, '{ id: "interview", title: "Собеседования и рынок", weeks: [9, 10, 11, 12, 13] }', '{ id: "interview", title: "Собеседования и рынок", weeks: [10, 11, 12, 13, 14] }', 'phase interview');
  t = layout(t, file);
  t = renamedTaskIds(t);
  put(file, t);
}

// Task line by ID: tasks are one line each.
function taskLine(t, id) {
  const lines = t.split('\n').filter(line => line.includes(`{ id: "${id}",`));
  if (lines.length !== 1) throw Error(`task ${id}: ${lines.length} lines`);
  return lines[0];
}

function layout(t, file) {
  const t0 = t;
  const line = id => taskLine(t0, id).trim().replace(/,$/, '');
  const edit = (id, from, to) => once(line(id), from, to, `task ${id}`);

  // Thursday of week 1: Account alone (ID w1-wed-3 keeps the user's mark); ValidationError moves to week 2.
  const account = edit('w1-wed-3', 'W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is) и W2-1 ValidationError (errors.As)", links: ["p-account", "p-validation", "c39", "q29"]',
    'W1-2 Account (Deposit/Withdraw на pointer receiver, sentinel ErrInsufficientFunds, %w, errors.Is). Проговор", links: ["p-account", "c39", "q29"]');
  const lc347 = edit('w2-wed-1', 'LeetCode 347. Top K Frequent Elements + проговор (записать на телефон) — резерв недели: пятница или воскресенье", optional: true,', 'LeetCode 347. Top K Frequent Elements + проговор (записать на телефон)",');
  const lc238 = edit('w2-sat-2', 'LeetCode 238. Product of Array Except Self + проговор (записать) — резерв недели: пятница или воскресенье", optional: true,', 'LeetCode 238. Product of Array Except Self + проговор (записать)",');
  const deferTask = edit('w2-tue-2', 'без текста повторить проговор W2-1 из среды', 'без текста повторить проговор W2-1 из понедельника');

  const week1 = `    // ───────────────────────────── НЕДЕЛЯ 1 ─────────────────────────────
    {
      id: "w1",
      title: "Идиомы Go I: типы, методы, интерфейсы",
      goal: "Писать простой Go без подглядывания и объяснять по-английски, чем Go отличается от Kotlin в типах, методах и интерфейсах.",
      done: "Решены LC 49 и LC 1 (на leetcode.com, на Go). W1-1 и W1-2 лежат в go-prep, и go test -race ./week1/... проходит; W1-3 объяснён вслух; вариации Money и typed nil сделаны. Самопроверка по типам и интерфейсам проговорена вслух по-английски без подсказок.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            ${line('w1-mon-1')},
            ${line('w1-mon-2')},
            ${line('w1-mon-3')}
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            ${line('w1-tue-1')},
            ${line('w1-tue-2')},
            ${line('w1-tue-3')}
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            ${line('w1-wed-1')},
            ${line('w1-wed-2')}
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            ${account}
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            ${line('w1-sat-1')},
            { id: "w1-sat-8", text: "Повторение — вариация Money (≈30 мин): Add(other Money) (Money, error) — при разных валютах ошибка, а не сложение; тест на обе ветки рядом с тестами W1-1", links: ["p-money"] },
            { id: "w1-sat-9", text: "Вариация typed nil (≈15 мин): своя ошибка *NotFoundError с методом Error на указателе; функция объявляет var e *NotFoundError и возвращает её как error — до запуска сказать, что даст err == nil, затем исправить возврат", links: ["c33", "q2"] },
            ${line('w1-sat-4')},
            ${line('w1-sat-5')},
            { id: "w1-sat-10", text: "Самопроверка по типам и интерфейсам вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы" }
          ]
        }
      ],
      leetcode: [1, 49],
      english: [
        "What is a zero value and why does it matter?",
        "When do you use a pointer receiver?",
        "Why doesn't a value of type T implement an interface whose method has a pointer receiver?",
        "Why can returning a nil pointer as an error give the caller a non-nil error?"
      ],
      selfCheck: [
        "Какие нулевые значения у int, string, *T, []T, map[K]V, chan T и error?",
        "Когда метод объявлять на pointer receiver?",
        "Почему var _ Notifier = Service{} не компилируется, если Notify объявлен на *Service?",
        "Почему nil-указатель, возвращённый как error, даёт err != nil?"
      ],
      gaps: []
    },

    // ───────────────────────────── НЕДЕЛЯ 2 ─────────────────────────────
    {
      id: "w2",
      title: "Идиомы Go I: ошибки, defer и panic, повторение",
      goal: "Объяснять по-английски ошибки как значения (sentinel и typed, %w, Is и As), defer, panic и recover и проверить неделю 1 на изменённых условиях.",
      done: "W2-1…W2-3 лежат в go-prep, и go test -race ./week2/... проходит; вариации среды сделаны; решены LC 347 и LC 238, LC 1 повторена без текста. Самопроверка недели проговорена вслух по-английски без подсказок; рассказ о себе, версия 0, записан.",
      days: [
        {
          label: "Пн", minutes: 90, tasks: [
            ${line('w2-mon-1')},
            { id: "w2-mon-2", text: "W2-1 ValidationError: ошибка-тип с полем, errors.As через две обёртки, для корректного пользователя — обычный nil. Проговор", links: ["p-validation"], talk: "w2-1" }
          ]
        },
        {
          label: "Вт", minutes: 90, tasks: [
            ${line('w2-tue-1')},
            ${deferTask},
            ${line('w2-tue-3')}
          ]
        },
        {
          label: "Ср", minutes: 90, tasks: [
            ${lc347},
            { id: "w2-wed-2", text: "Вариация на зачёт (≈20 мин): ErrAccountClosed в W1-2 — закрытый счёт отклоняет Deposit и Withdraw; через Transfer, после двух обёрток, errors.Is отличает его от нехватки средств", links: ["p-account", "c39"] },
            { id: "w2-wed-3", text: "Вариация на зачёт (≈10 мин): typed nil — в W2-1 вернуть nil *ValidationError через error; до запуска сказать, что увидит вызывающий, затем исправить возврат", links: ["p-validation", "c33", "q2"] },
            { id: "w2-wed-4", text: "Вариация на зачёт (≈10 мин): defer — значение параметром против захвата переменной замыканием; изменить переменную после defer и предсказать вывод, затем — что вернёт return с именованным и с безымянным результатом", links: ["c35", "q31", "p-deferpanic"] }
          ]
        },
        {
          label: "Чт", minutes: 90, tasks: [
            ${line('w2-thu-1')}
          ]
        },
        {
          label: "Сб", minutes: 240, tasks: [
            ${line('w2-sat-1')},
            ${lc238},
            { id: "w2-sat-3", text: "Повтор LC 1 без текста (≈15 мин): решить Two Sum с чистого листа и проговорить по 4 шагам, диалог не открывать; follow-up про отсортированный массив — своими словами" },
            ${line('w2-sat-4')},
            ${line('w2-sat-5')}
          ]
        }
      ],
      leetcode: [347, 238],
      english: [
        "How does error handling in Go differ from exceptions in Kotlin or Java?",
        "What is a zero value and why does it matter?",
        "When do you use a pointer receiver?",
        "Why can returning a nil pointer as an error give the caller a non-nil error?",
        "Tell me about yourself — version 0, 60–90 seconds."
      ],
      selfCheck: [
        "Какие нулевые значения у int, string, *T, []T, map[K]V, chan T и error?",
        "Чем errors.Is отличается от errors.As?",
        "Когда метод объявлять на pointer receiver?",
        "Почему nil-указатель, возвращённый как error, даёт err != nil?",
        "В каком порядке выполняются отложенные вызовы и когда вычисляются их аргументы?"
      ],
      gaps: []
    },
`;
  // Map by the spec leaves Tuesday of week 3 (it is on Thursday of week 2 now).
  t = once(t, `${taskLine(t0, 'w2-thu-1')}\n`, '', 'w2-thu-1 out of week 3');
  // The old week 1 block: from its banner to the next banner (now НЕДЕЛЯ 3).
  const start = t.indexOf('    // ───────────────────────────── НЕДЕЛЯ 1 ─────────────────────────────');
  const end = t.indexOf('    // ───────────────────────────── НЕДЕЛЯ 3 ─────────────────────────────');
  if (start < 0 || end < start) throw Error('week 1 block not found');
  const oldWeek1 = t.slice(start, end);
  // Week 1 of the base had exactly these lists; check before replacing them.
  for (const phrase of ['"How does error handling in Go differ from exceptions in Kotlin or Java?"', '"В каком порядке выполняются отложенные вызовы и когда вычисляются их аргументы?"', 'leetcode: [1, 49, 347, 238],']) once(oldWeek1, phrase, phrase, 'old week 1');
  t = t.slice(0, start) + week1 + '\n' + t.slice(end);
  // Every task line from the old week 1 is placed again, exactly once.
  for (const id of ['w1-mon-1', 'w1-mon-2', 'w1-mon-3', 'w1-tue-1', 'w1-tue-2', 'w1-tue-3', 'w1-wed-1', 'w1-wed-2', 'w1-wed-3', 'w1-sat-1', 'w1-sat-4', 'w1-sat-5',
    'w2-mon-1', 'w2-tue-1', 'w2-tue-2', 'w2-tue-3', 'w2-wed-1', 'w2-sat-1', 'w2-sat-2', 'w2-sat-4', 'w2-sat-5', 'w2-thu-1']) taskLine(t, id);

  t = acceptance(t);
  t = talks(t);
  t = modelAnswers(t);
  return t;
}

// Region between two markers, split into entries that start with `    "<id>": {`.
function region(t, from, to) {
  const start = t.indexOf(from), end = t.indexOf(to, start);
  if (start < 0 || end < 0) throw Error(`region ${from}`);
  return { start: start + from.length, end, body: t.slice(start + from.length, end) };
}

function acceptance(t) {
  const r = region(t, '  acceptance: {\n', '\n  },\n\n  // ─────────────── ОБРАЗЦЫ');
  const lines = r.body.split('\n');
  const get = id => {
    const found = lines.filter(l => l.startsWith(`    "${id}": {`));
    if (found.length !== 1) throw Error(`acceptance ${id}: ${found.length}`);
    lines.splice(lines.indexOf(found[0]), 1);
    return found[0].replace(/,$/, '');
  };
  const take = ids => ids.map(get);
  const [mon1, mon2, tue1, tue2, tue3, wed1, wed2, account, sat1, sat4, sat5] = take(['w1-mon-1', 'w1-mon-2', 'w1-tue-1', 'w1-tue-2', 'w1-tue-3', 'w1-wed-1', 'w1-wed-2', 'w1-wed-3', 'w1-sat-1', 'w1-sat-4', 'w1-sat-5']);
  const [w2mon1, w2tue1, w2tue2, w2sat1, w2sat4, w2sat5, map] = take(['w2-mon-1', 'w2-tue-1', 'w2-tue-2', 'w2-sat-1', 'w2-sat-4', 'w2-sat-5', 'w2-thu-1']);
  once(account, 'Тесты W1-2 и W2-1 зелёные, включая два уровня обёртки; errors.As достаёт *ValidationError с верным Field. Изменённое условие: добавить ErrAccountClosed — errors.Is различает обе причины.', '', 'w1-wed-3 accept (base)');
  const newAccount = '    "w1-wed-3": { accept: "Тесты W1-2 зелёные: успешный перевод, нехватка средств через две обёртки, после ошибки балансы прежние. Без подсказки: почему ресивер — указатель и почему err == ErrInsufficientFunds перестаёт работать после %w, а errors.Is — нет; проговор W1-2 — вслух по шагам. Изменённое условие — в среду недели 2: ErrAccountClosed." }';
  const newMap = once(map, 'P3 (ниже на этой странице) решена; q33 — до вариантов.', 'до запуска сказано, что вернёт чтение из nil map и что сделает запись в неё; q33 — до вариантов.', 'w2-thu-1 accept');
  const week1 = [mon1, mon2, tue1, tue2, tue3, wed1, wed2, newAccount, sat1,
    '    "w1-sat-8": { accept: "Add складывает суммы одной валюты, а при разных валютах возвращает ошибку и нулевую Money без сложения; table-driven тест на обе ветки и на отрицательную сумму проходит под -race. По-английски одной фразой: почему ошибка, а не молчаливое сложение." }',
    '    "w1-sat-9": { accept: "До запуска сказано, что err == nil даёт false, и объяснено по-английски через «динамический тип и значение»: в интерфейсе тип *NotFoundError и nil-указатель. После исправления — return nil литералом — err == nil даёт true." }',
    sat4, sat5,
    '    "w1-sat-10": { accept: "Все вопросы обоих блоков — ответ по-английски без подсказки, до минуты на вопрос; ошибочные отмечены для повтора." }'];
  const week2 = [w2mon1,
    '    "w2-mon-2": { accept: "Тесты W2-1 зелёные, включая два уровня обёртки, границу возраста и порядок полей; errors.As достаёт *ValidationError с верным Field; для корректного пользователя — обычный nil. Проговор W2-1 — вслух по шагам." }',
    w2tue1, w2tue2,
    '    "w2-wed-2": { accept: "Тест: перевод с закрытого счёта и на закрытый — errors.Is(err, ErrAccountClosed) истинно, а errors.Is(err, ErrInsufficientFunds) ложно, при нехватке средств — наоборот; после отказа балансы прежние, в том числе когда Deposit отказал уже после Withdraw. По-английски: почему sentinel, а не сравнение текста ошибки." }',
    '    "w2-wed-3": { accept: "До запуска сказано, что для корректного пользователя err != nil и почему: в интерфейсе тип *ValidationError и nil-указатель; TestValid это ловит. Исправление — return nil литералом, тесты W2-1 снова зелёные." }',
    '    "w2-wed-4": { accept: "До запуска предсказано: аргумент defer вычисляется в момент defer, замыкание читает переменную при выходе, вызовы идут в обратном порядке; отложенное замыкание меняет именованный результат после return, а безымянный — нет. Предсказание совпало с запуском." }',
    newMap, w2sat1,
    '    "w2-sat-3": { accept: "LC 1 решена заново без подсказки и проговорена за 5 минут без текста; follow-up про отсортированный массив — два указателя — объяснён; запись сделана." }',
    w2sat4, w2sat5];
  // What is left of the old week 1 group is the blank line before week 3.
  const firstW3 = lines.findIndex(l => l.startsWith('    "w3-'));
  if (lines.slice(0, firstW3).some(l => l.trim())) throw Error(`acceptance: left in week 1 group: ${lines.slice(0, firstW3).join(' | ')}`);
  const body = [...week1.map(l => `${l},`), '', ...week2.map(l => `${l},`), ...lines.slice(firstW3 - 1)].join('\n');
  return t.slice(0, r.start) + body + t.slice(r.end);
}

function talks(t) {
  const r = region(t, '  talks: {\n', '\n  },\n\n  // ─────────────── КРИТЕРИИ');
  const entries = r.body.split(/\n(?=    (?:"[^"]+"|[a-z0-9]+): \{)/);
  const find = key => {
    const i = entries.findIndex(e => e.startsWith(`    "${key}": {`));
    if (i < 0) throw Error(`talk ${key}`);
    return i;
  };
  let account = entries[find('w1-2')];
  account = once(account, 'title: "W1-2. Account и W2-1. ValidationError",', 'title: "W1-2. Account",', 'talk w1-2 title');
  account = once(account, ', so the caller can still check it with errors.Is. ValidationError is a struct that carries the field name; errors.As walks the wrapped chain and extracts it, so the handler can return a 400 with the exact field.",', ', so the caller can still check it with errors.Is.",', 'talk w1-2 approach');
  account = once(account, 'followUp: "How do errors.Is and errors.As differ? — errors.Is compares against a specific value; errors.As matches by type and gives me the value."', 'followUp: "Why not compare err == ErrInsufficientFunds? — After wrapping, err is a different value; errors.Is walks the chain and still finds the sentinel."', 'talk w1-2 follow-up');
  entries[find('w1-2')] = account;
  const validation = `    "w2-1": {
      title: "W2-1. ValidationError",
      approach: "ValidationError is a struct that carries the field name; errors.As walks the wrapped chain and extracts it, so the handler can return a 400 with the exact field.",
      edge: "A valid user gets a literal nil, not a nil *ValidationError; when both fields are invalid, the email error comes first; errors.As still works through errors.Join.",
      followUp: "How do errors.Is and errors.As differ? — errors.Is compares against a specific value; errors.As matches by type and gives me the value."
    },`;
  // Order by week: method sets (W1-3) right after W1-2, then W2-1, then SafeDiv (W2-3).
  const methodSets = entries.splice(find('w1-3'), 1)[0];
  entries.splice(find('w1-2') + 1, 0, methodSets, validation);
  return t.slice(0, r.start) + entries.join('\n') + t.slice(r.end);
}

function modelAnswers(t) {
  const r = region(t, '  modelAnswers: {\n', '\n  },\n\n  // ───────────────────────');
  const entries = r.body.split(/\n(?=    "[^"]+": \{)/);
  const take = key => {
    const i = entries.findIndex(e => e.startsWith(`    "${key}": {`));
    if (i < 0) throw Error(`model answer ${key}`);
    return entries.splice(i, 1)[0].replace(/\n+$/, '').replace(/,$/, '');
  };
  const firstW1 = entries.findIndex(e => e.startsWith('    "w1-mon-1": {'));
  const w1 = ['w1-mon-1', 'w1-tue-1', 'w1-tue-3', 'w1-wed-1', 'w1-wed-2', 'w1-sat-1'].map(take);
  const validation = take('w1-wed-3').replace('    "w1-wed-3": {', `    "${MODEL_MOVED['w1-wed-3']}": {`);
  const w2 = [take('w2-mon-1'), validation, take('w2-tue-1'), take('w2-tue-2'), take('w2-thu-1'), take('w2-sat-1'), take('w2-sat-4')];
  const selfCheck = `    "w1-sat-10": {
      hook: "Zero values are usable; pointer receiver to mutate or avoid copies; T lacks pointer methods; typed nil is not nil.",
      en: "Zero values: 0 for int, \\"\\" for string, and nil for *T, []T, map[K]V, chan T and error. I use a pointer receiver when the method changes the receiver, or when the struct is large or must not be copied, for example because it holds a sync.Mutex; then I keep all methods of the type on pointers. If Notify has a pointer receiver, the method set of Service does not include it, so var _ Notifier = Service{} fails to compile, while &Service{} works. A nil *MyErr returned as error is not nil, because the interface stores the type *MyErr; it is nil only when both type and value are nil."
    }`;
  const left = entries.filter(e => /^    "w[12]-/.test(e));
  if (left.length) throw Error(`model answers of weeks 1–2 left in place: ${left.map(e => e.slice(0, 20)).join(', ')}`);
  const group = list => list.map(e => `${e},`).join('\n');
  entries.splice(firstW1, 0, `${group([...w1, selfCheck])}\n\n${group(w2)}\n`);
  // The group that was week 1 ended with a blank line; the week 3 group follows.
  return t.slice(0, r.start) + entries.join('\n').replace(/\n{3,}/g, '\n\n') + t.slice(r.end);
}

// The map old → new, in the data: check-content tells a renumbering from a silently lost mark by it.
function renamedTaskIds(t) {
  const changed = Object.entries(ids).filter(([a, b]) => a !== b);
  const byWeek = new Map();
  for (const [a, b] of changed) {
    const w = /^w(\d+)-/.exec(a)[1];
    byWeek.set(w, [...(byWeek.get(w) || []), `"${a}": "${b}"`]);
  }
  const rows = [...byWeek.values()].map(pairs => `    ${pairs.join(', ')}`).join(',\n');
  const block = `  // Перенумерация 11.11.2026 (v91): неделя 1 растянута на две, бывшие недели 2–13 стали 3–14.
  // Старый ID задачи → новый. Отметки по старым ID сайт не переносит (решение пользователя); запись нужна
  // check-content, чтобы отличить перенумерацию от молча потерянной отметки.
  renamedTaskIds: {
${rows}
  },

  phases: [`;
  return once(t, '  phases: [', block, 'renamedTaskIds');
}

/* ------------------------------ data/practice.js ----------------------------- */

// Plan tasks of the practice tasks that weeks 1–2 changed, in plan order: the mapped old ones plus the variations.
// p-validation now serves W2-1 on Monday of week 2 (w1-wed-3 is Account only).
const PLAN_TASKS_SET = {
  'p-money': ['w1-tue-3', 'w1-sat-8'],
  'p-account': ['w1-wed-3', 'w2-wed-2', 'w3-thu-3'],
  'p-validation': ['w2-mon-2', 'w2-wed-3'],
  'p-deferpanic': ['w2-tue-2', 'w2-wed-4']
};

function practice() {
  const file = 'data/practice.js';
  let src = showBase(file);
  const blocks = basePractice().map(task => ({ task, start: src.indexOf(`    "id": "${task.id}",`) }));
  const fixtures = [];
  for (let i = blocks.length - 1; i >= 0; i--) {
    const { task, start } = blocks[i];
    const end = i + 1 < blocks.length ? blocks[i + 1].start : src.length;
    let block = src.slice(start, end);
    const label = `${file} ${task.id}`;
    const week = ['p-validation', 'p-deferpanic'].includes(task.id) ? 2 : shift(task.week);
    block = once(block, `"week": ${task.week},`, `"week": ${week},`, `${label} week`);
    const mapped = task.planTasks.map(id => ids[id]);
    const planTasks = PLAN_TASKS_SET[task.id] || mapped;
    if (task.id !== 'p-validation' && !mapped.every(id => planTasks.includes(id))) throw Error(`${label}: planTasks lost ${mapped}`);
    count(file, 'task IDs', task.planTasks.filter(id => ids[id] !== id).length);
    block = once(block, `"planTasks": ${JSON.stringify(task.planTasks, null, 2).replace(/\n/g, '\n    ')}`, `"planTasks": ${JSON.stringify(planTasks, null, 2).replace(/\n/g, '\n    ')}`, `${label} planTasks`);
    // Every other string, except the tests: the server runs them as they are (backend task JSON).
    const leaves = [];
    const walk = (value, path) => {
      if (typeof value === 'string') leaves.push([path, value]);
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, [...path, k]);
    };
    walk(task, []);
    for (const [path, value] of leaves) {
      const key = path.join('.');
      if (key === 'files.tests.code' || key === 'id' || key.startsWith('planTasks.') || key === 'fixture') continue;
      const next = key === 'code' ? value.split(/,\s*/).map(c => mapCode(c, label)).join(', ') : texts(value, file);
      if (next === value) continue;
      block = once(block, JSON.stringify(value), JSON.stringify(next), `${label} ${key}`);
      if (key === 'files.starter.code' || key === 'files.solution.code') fixtures.push({ task, kind: key.split('.')[1], code: next });
    }
    src = src.slice(0, start) + block + src.slice(end);
  }
  put(file, src);
  // Fixture files are the source of the code on the site: the same text, byte for byte.
  for (const { task, kind, code } of fixtures) {
    const name = kind === 'starter' ? 'starter.go.txt' : task.files.solution.name;
    const path = `${task.fixture}/${name}`;
    const base = showBase(path);
    const next = texts(base, path);
    if (next.replace(/\n+$/, '') !== code) throw Error(`${path}: fixture and practice.js differ after the maps`);
    put(path, next);
  }
}
const mapCode = (code, where) => {
  if (!(code in codes)) throw Error(`${where}: unknown code ${code}`);
  if (codes[code] !== code) count('data/practice.js', 'codes');
  return codes[code];
};

/* ------------------------- cards, tracks, guides, audio ---------------------- */

function plainData() {
  for (const file of ['data/cards.js', 'data/tracks.js']) put(file, texts(mapIds(showBase(file), file), file));
  const file = 'data/guides.js';
  let t = showBase(file);
  t = once(t, 'каждая задача — свой пакет `weekN/<задача>`, рядом — учебные пакеты недель 1–2.', 'каждая задача — свой пакет `weekN/<задача>`, рядом — учебные пакеты недель 1 и 3.', 'guides intro');
  put(file, texts(t, file));
}

function audio() {
  const file = 'data/audio.js';
  const src = showBase(file);
  const manifest = JSON.parse(src.replace(/^[\s\S]*?=\s*/, '').replace(/;\s*$/, ''));
  const items = {};
  for (const [key, entry] of Object.entries(manifest.items)) {
    let next = key;
    const m = /^plan:(.+)$/.exec(key);
    if (m) {
      if (!(m[1] in ids)) throw Error(`${file}: unknown task ${m[1]}`);
      next = `plan:${MODEL_MOVED[m[1]] || ids[m[1]]}`;
      if (next !== key) count(file, 'keys');
    }
    if (items[next]) throw Error(`${file}: two entries for ${next}`);
    items[next] = entry; // files stay as they are: their names keep the old key, the hash is of the text
  }
  const sorted = Object.fromEntries(Object.entries(items).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const header = src.slice(0, src.indexOf('const AUDIO = '));
  put(file, `${header}const AUDIO = ${JSON.stringify({ ...manifest, items: sorted }, null, 2)};\n`);
}

/* ---------------------------- fixtures and scripts --------------------------- */

function fixtures() {
  for (const path of ['docs/verification/fixtures/channels/workerpool-alt/group/workerpool.go', 'docs/verification/fixtures/channels/workerpool-alt/sem/workerpool.go', 'docs/verification/fixtures/channels/review/review.go']) put(path, texts(showBase(path), path));
  // go-prep: the assembler drill is in week 3 now (git mv week2 → week3 is done separately).
  put('docs/verification/fixtures/go-prep/week3/cmd/sumdemo/main.go', texts(showBase('docs/verification/fixtures/go-prep/week2/cmd/sumdemo/main.go'), 'go-prep main.go'));
  for (const name of ['asm.go', 'asm_test.go']) put(`docs/verification/fixtures/go-prep/week3/asm/${name}`, showBase(`docs/verification/fixtures/go-prep/week2/asm/${name}`));
}

function scripts() {
  // Speech fixes and listening risks are keyed by plan task ID.
  for (const file of ['scripts/gen-audio.mjs', 'scripts/audio-review.mjs']) {
    let t = showBase(file).replace(/'plan:(w\d+-(?:mon|tue|wed|thu|fri|sat|sun)-\d+)'/g, (m, id) => {
      if (!(id in ids)) throw Error(`${file}: unknown task ${id}`);
      const next = MODEL_MOVED[id] || ids[id];
      if (next !== id) count(file, 'keys');
      return `'plan:${next}'`;
    });
    if (file === 'scripts/audio-review.mjs') t = once(t, 'let out = `# Приёмка озвучки на слух — недели 1–3', 'let out = `# Приёмка озвучки на слух — недели 1–4', 'audio-review title');
    if (file === 'scripts/gen-audio.mjs') t = keepRecordings(t);
    put(file, t);
  }
}

// gen-audio names a file by its key; after a key is renamed the recording is still right (same text, voice and
// speech hash), so it is kept instead of being generated again and the old file removed.
function keepRecordings(t) {
  t = once(t, `    const entry = { hash: textHash(item.text) };
    for (const voice of Object.keys(VOICES)) {
      const file = fileFor(item.key, voice, speech);
      entry[voice] = file;
      if (!existsSync(join(root, file))) jobs.push(`, `    const entry = { hash: textHash(item.text) };
    const old = manifest.items[item.key];
    for (const voice of Object.keys(VOICES)) {
      const file = fileFor(item.key, voice, speech);
      // A renamed key (v91: plan task IDs) keeps its recording: the same voice and speech hash under the old name.
      const kept = old?.[voice] && old[voice].endsWith(file.slice(file.lastIndexOf(\`-\${voice}-\`))) && existsSync(join(root, old[voice])) ? old[voice] : null;
      entry[voice] = kept || file;
      if (!kept && !existsSync(join(root, file))) jobs.push(`, 'gen-audio keep');
  t = once(t, `    // Текст или настройки изменились — прежний файл этого ответа больше не нужен.
    const old = manifest.items[item.key];
`, `    // Текст или настройки изменились — прежний файл этого ответа больше не нужен.
`, 'gen-audio old');
  return t;
}

plan();
practice();
plainData();
audio();
fixtures();
scripts();

for (const [file, text] of outputs) {
  if (!dry) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
}
console.log(JSON.stringify({ base: BASE, written: dry ? 0 : outputs.size, files: [...outputs.keys()], stats }, null, 2));
