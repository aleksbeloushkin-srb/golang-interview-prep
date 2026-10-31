// Builds docs/AUDIO_REVIEW_RU.md: the listening checklist for every recording in data/audio.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadManifest, speechFor } from './gen-audio.mjs';
import { loadContent, loadPlan, loadPractice, speakableTexts } from './check-content.mjs';
// Run from anywhere: node scripts/audio-review.mjs (needs ffprobe).
const root = fileURLToPath(new URL('..', import.meta.url));
const read = f => readFileSync(root + f, 'utf8');
const data = loadContent(read), plan = loadPlan(read), practice = loadPractice(read);
const texts = speakableTexts(data, plan, practice);
const m = loadManifest();
const SITE = 'https://aleksbeloushkin-srb.github.io/golang-interview-prep/';
const RISK = {
  'card:c34:short': '`*Counter`, `(&c).Set()`, `map[K]Counter`',
  'plan:w1-wed-2': '`*Service`, `(&v).Notify()`, `map[K]*Service`',
  'card:c39:short': '`fmt.Errorf`, `%w`, `io.EOF`, Go 1.20',
  'card:c39:jvm': '`getCause`, `addSuppressed`',
  'plan:w1-mon-1': '`x := expr`',
  'plan:w1-tue-3': '12.50 EUR, 1250, −0.05 EUR',
  'practice:p-money:talk': '12.50 EUR, −0.05 EUR',
  'card:c40:short': '`nil`, пустая строка, длинное перечисление',
  'card:c33:short': '`*MyError`, «err is not nil»',
  'card:c35:short': '«directly», «panicking goroutine»',
  'practice:p-deferpanic:talk': '«same goroutine», 3, 2, 1',
  'plan:w1-tue-1': '`for i := range` против `for i = range`',
  'card:c7:short': '`GOMAXPROCS=4`, cgo',
  'card:c29:short': '`s[1:3]`',
  'card:c29:jvm': 'ArrayList, subList, ByteBuffer',
  'card:c47:short': '`*sql.DB`, `BeginTx(ctx, nil)`',
  'card:c17:short': '`recvq`, `goready`, `sendDirect`',
  'card:c20:short': '`CompareAndSwapInt64(&x, old, new)`',
  'card:c21:short': '1 ms → «one millisecond»',
  'card:c23:short': '`-gcflags=-m`, `-benchmem`',
  'card:c25:short': 'mcache, mcentral, mheap, 32 KiB, noscan',
  'card:c27:short': 'GOGC, GOMEMLIMIT, 200/400 MiB, OOM',
  'card:c27:jvm': '`-Xmx`',
  'card:c30:short': '`2^B`, tophash, 6.5',
  'card:c41:short': '`len(s)`, `s[i]`, `[]rune`',
  'card:c43:short': 'import path, `.go`, `internal/`',
  'plan:w2-mon-1': '`s[1:3]`, `s[a:b:c]`',
  'plan:w2-mon-2': '`a[:len(a):len(a)]`, 100 MiB',
  'plan:w2-tue-3': '`len("héllo")`, `utf8.RuneCountInString`',
  'card:c2:short': '`-race` → «dash race»',
  'plan:w2-thu-2': '`-race` → «dash race»',
  'plan:w3-thu-2': '`-race` → «dash race»',
  'plan:w3-sat-1': '`go test -race`, errgroup',
  'plan:w3-mon-2': '`gen → square → print` → «then»',
  'card:c12:short': 'I/O, `go.uber.org/goleak` → «Uber\'s go-leak library»',
  'card:c12:jvm': 'IDs → «I-D\'s», pprof',
  'practice:p-counter:talk': 'I/O',
  'card:c55:short': 'Coffman, livelock, «hold and wait»',
  'card:c55:jvm': 'jstack, «all goroutines are asleep - deadlock!», TryLock',
  'card:c56:short': '`c.L`, Wait/Signal/Broadcast',
  'card:c56:jvm': '`newCondition()`, signalAll, «spurious wakeups»',
  'card:c15:short': 'hchan, confinement'
};
const link = key => {
  const [kind, id] = key.split(':');
  if (kind === 'card') return `${SITE}#/cards/${id}`;
  if (kind === 'practice') return `${SITE}#/practice/${id}`;
  const [w, d] = id.split('-');
  return `${SITE}#/plan/${w}/${d}`;
};
const dur = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', root + f], { encoding: 'utf8' })).toFixed(1);
const keys = Object.keys(m.items).sort((a, b) => (RISK[b] ? 1 : 0) - (RISK[a] ? 1 : 0) || a.localeCompare(b, 'en', { numeric: true }));
let out = `# Приёмка озвучки на слух — недели 1–3

Сгенерировано из \`data/audio.js\` (${keys.length} текстов × 2 голоса). Записи проверены только машинно: файлы есть, декодируются, хеш совпадает с текущим текстом. **На слух ни одна запись ещё не принята.**

Как проверять каждую запись (Michael и Heart отдельно):

1. Прослушать, не глядя на экран, и пересказать смысл.
2. Сверить с текстом на экране: API, числа, отрицание, существенное условие.
3. Отметить неестественные паузы, темп, обрезанное начало или конец, ударения в терминах.
4. Если нужна правка — записать точный фрагмент и желаемое чтение в «Комментарий».

Сначала — строки с «риском». Отметки: ✅ принято, ✏️ нужна правка. Правки произношения вносятся в \`SPEECH_FIXES\` (\`scripts/gen-audio.mjs\`), пересоздаются только затронутые записи.

| Ключ | Голос | с | Риск | Термины | Числа | Условие слышно | Паузы/темп | Итог | Комментарий |
|---|---|---|---|---|---|---|---|---|---|
`;
for (const key of keys) {
  for (const voice of Object.keys(m.voices)) {
    const e = m.items[key];
    out += `| [${key}](${link(key)}) | ${m.voices[voice].label} | ${dur(e[voice])} | ${RISK[key] || ''} |  |  |  |  |  |  |\n`;
  }
}
out += `\n## Что читает синтезатор\n\nТекст для речи отличается от экранного только чтением кода и чисел. Если смысл расходится с экраном — это ошибка, её нужно отметить.\n\n`;
for (const key of keys) out += `**${key}** (хеш текста \`${m.items[key].hash}\`)\n\n> ${speechFor(key, texts[key])}\n\n`;
writeFileSync(root + 'docs/AUDIO_REVIEW_RU.md', out);
console.log('rows', keys.length * 2);
