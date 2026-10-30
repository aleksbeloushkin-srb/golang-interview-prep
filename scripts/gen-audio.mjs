// Озвучка английских ответов: собирает тексты, вызывает Kokoro (scripts/tts_kokoro.py) и пишет data/audio.js.
//
//   node scripts/gen-audio.mjs --week 1            # карточки, эталонные ответы плана и talk практикума недели 1
//   node scripts/gen-audio.mjs --week 1 --dry-run  # только показать, что будет озвучено и как
//   node scripts/gen-audio.mjs --cards c2,c7       # отдельные карточки: короткий ответ и сравнение с Java
//   node scripts/gen-audio.mjs --prune             # удалить файлы, на которые манифест больше не ссылается
//
// Модель (kokoro-v1.0.onnx, voices-v1.0.bin) лежит в .tts/ — папка не в репозитории.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadContent, loadPlan, loadPractice } from './check-content.mjs';
import { textHash, toSpeech } from './speech-text.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(join(root, file), 'utf8');
const ENGINE = 'kokoro-v1.0';
const AUDIO_DIR = 'audio/en';
const MANIFEST = 'data/audio.js';

// Голоса: Michael — основной, Heart — для смены, медленнее.
export const VOICES = {
  michael: { id: 'am_michael', label: 'Michael', speed: 1, lang: 'en-us' },
  heart: { id: 'af_heart', label: 'Heart', speed: 0.85, lang: 'en-us' }
};

// Точечные правки произношения, когда общих правил не хватает: [было в тексте для речи, стало].
// Каждая правка меняет только чтение, не смысл: сверяется с экранным текстом при ревью.
const SPEECH_FIXES = {
  'plan:w1-wed-1': [
    ['switch v colon-equals x., type, runs', 'switch v colon-equals x dot type runs'],
    ['the F-M-T interface with String string', 'the F-M-T interface with a String method that returns a string']
  ],
  'card:c33:short': [['the caller sees err not equal to nil', 'the caller sees that err is not nil']],
  'card:c34:short': [
    ["pointer to Counter's has both", 'the method set of pointer to Counter has both'],
    ['Go rewrites it to address of c dot Set', 'Go rewrites it as: take the address of c, then call Set']
  ],
  'plan:w1-wed-2': [
    ["pointer to Service's has both", 'the method set of pointer to Service has both'],
    ['shorthand for address of v dot Notify', 'shorthand for taking the address of v, then calling Notify']
  ],
  'card:c39:jvm': [
    ['walking get Cause with equals or instanceof', 'walking the get-Cause chain with equals or instance-of'],
    ['errors dot Join is roughly add Suppressed', "errors dot Join is roughly Java's add-Suppressed"]
  ],
  'plan:w1-mon-1': [['x colon-equals expr is a short declaration inside a function', 'x colon-equals expression is the short declaration, used inside a function']],
  'card:c40:short': [
    ['var n int gives you 0, and you get empty string for strings,', 'var n int gives you zero, and you get the empty string for strings,'],
    ['Not safe: m[k] equals v on a nil map panics', 'Not safe: assigning to a nil map, m of k equals v, panics']
  ],
  'plan:w1-sat-2': [
    ['var n int is 0, var s string is empty string, var ok bool is false', 'var n int is zero, var s string is the empty string, var ok bool is false'],
    ['but m[k] equals v panics', 'but assigning to it, m of k equals v, panics']
  ],
  // Пилотная выборка (c2, c7, c28, c29, c47).
  'card:c18:jvm': [['or a N-I-O Selector', 'or an N-I-O Selector']],
  'card:c20:short': [['atomic dot Compare And Swap Int64, address of x, old, new, which returns false', 'atomic dot Compare And Swap Int64, called with the address of x, old and new, which returns false']],
  'card:c39:short': [['You wrap it with F-M-T dot Error-f, load user: percent w, err:', 'You wrap it with F-M-T dot Error-f and percent w:']],
  'card:c7:short': [['with Go max procs=4,', 'with Go max procs set to four,'], ['or in cgo', 'or in C-Go']],
  'card:c29:short': [['s[1:3] copies no elements', 'slicing s from one to three copies no elements']],
  'card:c29:jvm': [['Array List-style growth with sub List- or Byte Buffer-style views', 'Array List style growth with sub-List or Byte Buffer style views']],
  'card:c47:short': [['the main object is pointer to sql dot D-B.', 'the main object is a pointer to sql dot D-B.'], ['Begin Tx, ctx, nil, check the error', 'Begin Tx with ctx and nil, check the error']],
  // Неделя 2: срезы, map, строки, generics, модули — синтаксис словами.
  'card:c30:short': [['2^B buckets', 'two to the power B buckets'], ['a one-byte tophash', 'a one-byte top hash']],
  'card:c41:short': [['len, s, and s[i] work on bytes', 'len of s and s of i work on bytes'], ['Convert to slice of rune', 'Convert to a slice of runes']],
  'card:c42:short': [['as in Map, Max or Set[T comparable]', 'as in Map, Max or a Set of comparable T']],
  'card:c42:jvm': [['so Max[int] works on plain ints', 'so Max of int works on plain ints'], ["while Java's List<Integer> boxes", "while Java's List of Integer boxes"]],
  'card:c43:short': [['import example dot com/shop/ledger names a package', 'import example dot com slash shop slash ledger names a package'], ['one directory of .go files', 'one directory of dot-go files'], ['A package under internal/ can be imported', 'A package under an internal directory can be imported']],
  'card:c43:jvm': [['internal/ is a boundary', 'An internal directory is a boundary']],
  'card:c44:jvm': [['J Unit 5 @Parameterized Test', 'J Unit 5 Parameterized Test'], ['like @After Each registered', 'like After Each registered'], ['t dot Fatalf to stop', 't dot Fatal-f to stop']],
  'plan:w2-mon-1': [['So s[1:3] copies no elements', 'So slicing s from one to three copies no elements'], ['s[a:b:c] limits capacity to c-a; s[a:b:b] leaves no spare capacity, so appending to it must copy into a new array and cannot overwrite s[b:];', 'a full slice expression, s of a, b, c, limits capacity to c minus a; with c equal to b there is no spare capacity, so appending must copy into a new array and cannot overwrite what follows;']],
  'plan:w2-mon-2': [['limit the capacity with a[:len, a:len, a,] so append must allocate', 'limit the capacity with a full slice expression so append must allocate'], ['the whole 100 megabytes array', 'the whole 100-megabyte array']],
  'plan:w2-tue-1': [['so m[k].f equals 1 does not compile', 'so assigning to a field, m of k dot f, does not compile']],
  'plan:w2-tue-3': [['len, héllo, is 6, not 5', 'the length of héllo is 6, not 5'], ['len, s, counts bytes and s[i] returns a byte', 'len of s counts bytes and s of i returns a byte']],
  'plan:w2-tue-4': [['append, s[:i], s[i+1:]..., shifts elements', 'appending the tail after i to the part before i shifts elements']],
  'plan:w2-wed-1': [['a map of T to a struct literal with Add', 'a map from T to an empty struct with Add']],
  'plan:w2-thu-1': [['such as module example dot com/shop', 'such as module example dot com slash shop'], ['Code under internal/ can be imported', 'Code in an internal directory can be imported'], ['cmd/ for binaries and internal/ for private code', 'cmd for binaries and internal for private code']],
  'practice:p-removeslice:talk': [['Removing with append, s[:i], s[i+1:]..., is cheap', 'Removing with append of the part before i and the tail after it is cheap']],
  // Деньги: сумма — словами, вывод String() — как его печатают.
  'plan:w1-tue-3': [
    ['so 12.50 euros is 1250', 'so twelve euros fifty is stored as one thousand two hundred fifty'],
    ['1250 becomes 12.50 euros and 5 becomes 0.05 euros', 'one thousand two hundred fifty prints as twelve point five zero E-U-R, and five prints as zero point zero five E-U-R'],
    ['so minus 5 is minus 0.05 euros', 'so minus five prints as minus zero point zero five E-U-R'],
    ["so I don't hard-code 100", "so I don't hard-code a hundred"]
  ],
  'practice:p-money:talk': [
    ['so 12.50 euros is 1250', 'so twelve euros fifty is one thousand two hundred fifty'],
    ['prints as minus 0.05 euros', 'prints as minus zero point zero five E-U-R'],
    ['instead of hard-coding 100', 'instead of hard-coding a hundred']
  ]
};

export function speechFor(key, text) {
  let s = toSpeech(text);
  for (const [from, to] of SPEECH_FIXES[key] || []) {
    if (!s.includes(from)) throw Error(`${key}: speech fix does not match "${from}"`);
    s = s.replace(from, to);
  }
  return s;
}

// Что озвучивать в неделе N: карточки из задач недели (короткий ответ и сравнение с Java), эталонные ответы плана, talk практикума.
export function collectWeek(n, data, plan, practice) {
  const week = plan.weeks[n - 1];
  if (!week) throw Error(`no week ${n}`);
  const tasks = week.days.flatMap(d => d.tasks);
  const cardIds = new Set(tasks.flatMap(t => [...(t.links || []), ...(t.refs || [])]).filter(id => typeof id === "string" && /^c\d+$/.test(id)));
  const items = [];
  for (const card of data.cards.filter(c => cardIds.has(c.id))) {
    items.push({ key: `card:${card.id}:short`, text: card.shortEN });
    if (card.jvmEN) items.push({ key: `card:${card.id}:jvm`, text: card.jvmEN });
  }
  for (const task of tasks) {
    const model = plan.modelAnswers && plan.modelAnswers[task.id];
    if (model && model.en) items.push({ key: `plan:${task.id}`, text: model.en });
  }
  for (const task of (practice || []).filter(t => t.week === n)) {
    if (task.talkEN) items.push({ key: `practice:${task.id}:talk`, text: task.talkEN });
  }
  return items;
}

// Отдельные карточки вне недели (например, выборка для пилота).
export function collectCards(ids, data) {
  const items = [];
  for (const id of ids) {
    const card = data.cards.find(c => c.id === id);
    if (!card) throw Error(`no card ${id}`);
    items.push({ key: `card:${card.id}:short`, text: card.shortEN });
    if (card.jvmEN) items.push({ key: `card:${card.id}:jvm`, text: card.jvmEN });
  }
  return items;
}

export function fileFor(key, voice, speech) {
  const v = VOICES[voice];
  const h = textHash(`${ENGINE}|${v.id}|${v.speed}|${speech}`);
  return `${AUDIO_DIR}/${key.replace(/:/g, '-')}-${voice}-${h}.mp3`;
}

export function loadManifest() {
  if (!existsSync(join(root, MANIFEST))) return { engine: ENGINE, voices: {}, items: {} };
  const src = read(MANIFEST).replace(/^[\s\S]*?=\s*/, '').replace(/;\s*$/, '');
  return JSON.parse(src);
}

function writeManifest(manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest.items).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const out = { engine: ENGINE, voices: Object.fromEntries(Object.entries(VOICES).map(([k, v]) => [k, { label: v.label, speed: v.speed }])), items: sorted };
  writeFileSync(join(root, MANIFEST), `// Сгенерировано scripts/gen-audio.mjs. hash — FNV-1a исходного текста: кнопка 🔊 показывается, только если он совпадает.\nconst AUDIO = ${JSON.stringify(out, null, 2)};\n`);
}

function main() {
  const args = process.argv.slice(2);
  const weeks = [];
  const cardIds = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--week') weeks.push(Number(args[++i]));
    else if (args[i] === '--cards') cardIds.push(...args[++i].split(',').filter(Boolean));
  }
  const dry = args.includes('--dry-run');
  const prune = args.includes('--prune');

  const data = loadContent(read);
  const plan = loadPlan(read);
  const practice = loadPractice(read);
  const manifest = loadManifest();
  const seen = new Set();
  const items = [...weeks.flatMap(n => collectWeek(n, data, plan, practice)), ...collectCards(cardIds, data)].filter(i => !seen.has(i.key) && seen.add(i.key));
  const jobs = [];
  for (const item of items) {
    const speech = speechFor(item.key, item.text);
    const entry = { hash: textHash(item.text) };
    for (const voice of Object.keys(VOICES)) {
      const file = fileFor(item.key, voice, speech);
      entry[voice] = file;
      if (!existsSync(join(root, file))) jobs.push({ text: speech, voice: VOICES[voice].id, speed: VOICES[voice].speed, lang: VOICES[voice].lang, out: join(root, file) });
    }
    if (dry) console.log(`${item.key}\n  ${speech}\n`);
    // Текст или настройки изменились — прежний файл этого ответа больше не нужен.
    const old = manifest.items[item.key];
    if (!dry && old) for (const voice of Object.keys(VOICES)) if (old[voice] && old[voice] !== entry[voice] && existsSync(join(root, old[voice]))) rmSync(join(root, old[voice]));
    if (!dry) manifest.items[item.key] = entry;
  }
  if (dry) {
    console.log(`${items.length} texts, ${jobs.length} files to generate`);
    return;
  }
  if (jobs.length) {
    mkdirSync(join(root, AUDIO_DIR), { recursive: true });
    const jobFile = join(root, '.tts', 'jobs.json');
    mkdirSync(join(root, '.tts'), { recursive: true });
    writeFileSync(jobFile, JSON.stringify(jobs));
    execFileSync('python3', [join(root, 'scripts', 'tts_kokoro.py'), '--model-dir', join(root, '.tts'), '--jobs', jobFile], { stdio: 'inherit' });
    rmSync(jobFile);
  }
  writeManifest(manifest);
  if (prune) {
    const used = new Set(Object.values(manifest.items).flatMap(e => Object.keys(VOICES).map(v => e[v])));
    for (const name of existsSync(join(root, AUDIO_DIR)) ? readdirSync(join(root, AUDIO_DIR)) : []) {
      if (!used.has(`${AUDIO_DIR}/${name}`)) { rmSync(join(root, AUDIO_DIR, name)); console.log(`removed ${name}`); }
    }
  }
  console.log(`${items.length} texts, ${jobs.length} files generated, manifest: ${Object.keys(manifest.items).length} items`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
