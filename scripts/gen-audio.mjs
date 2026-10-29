// Озвучка английских ответов: собирает тексты, вызывает Kokoro (scripts/tts_kokoro.py) и пишет data/audio.js.
//
//   node scripts/gen-audio.mjs --week 1            # карточки, эталонные ответы плана и talk практикума недели 1
//   node scripts/gen-audio.mjs --week 1 --dry-run  # только показать, что будет озвучено и как
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
const SPEECH_FIXES = {
  'plan:w1-wed-1': [['the F-M-T interface with String string', 'the F-M-T interface with a String method that returns a string']]
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
  for (let i = 0; i < args.length; i++) if (args[i] === '--week') weeks.push(Number(args[++i]));
  const dry = args.includes('--dry-run');
  const prune = args.includes('--prune');

  const data = loadContent(read);
  const plan = loadPlan(read);
  const practice = loadPractice(read);
  const manifest = loadManifest();
  const items = weeks.flatMap(n => collectWeek(n, data, plan, practice));
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
