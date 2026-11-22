// v96: shifts the old weeks 3–14 to 4–15 in the data files, fixtures, audio keys and site code.
// Reads every file from the base commit (maps.mjs, BASE) and writes the result, so a rerun gives the same output.
// The new week 3 «Биты и закрепление» is added afterwards by add-week3.mjs; until then w3-tue-5 (bits, diagram 9)
// is taken out of its old place (now Tuesday of week 4).
//   node docs/verification/v96/renumber.mjs [--dry-run]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BASE, root, showBase, idMap, codeMap, basePractice } from './maps.mjs';

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
  if (codes[code] !== code) count(file, 'talk keys');
  return `"${codes[code].toLowerCase()}"`;
});
const shift = n => (n >= 3 ? n + 1 : n);
// «неделя 5», «недели 6–9», «нед. 8»: weeks 3–14 become 4–15. A range from week 1 or 2 into week 3+ needs a hand edit.
const shiftRuWeeks = (text, file) => text.replace(/([Нн]едел[а-яё]*|нед\.)(\s?)(\d+)(?:(\s?[–-]\s?)(\d+))?/g, (m, word, sp, a, dash, b) => {
  const from = Number(a), to = b === undefined ? null : Number(b);
  if (to !== null && from < 3 && to >= 3) throw Error(`${file}: «${m}» spans the new week 3 — edit it by hand first`);
  if (from >= 3) count(file, 'week numbers');
  return `${word}${sp}${shift(from)}${to === null ? '' : `${dash}${shift(to)}`}`;
});
const shiftEnWeeks = (text, file) => text.replace(/\b([Ww]eeks?)(\s)(\d+)\b/g, (m, word, sp, a) => {
  if (Number(a) >= 3) count(file, 'week numbers');
  return `${word}${sp}${shift(Number(a))}`;
});
const shiftPackages = (text, file) => text.replace(/\bweek(\d+)\b/g, (m, a) => {
  if (Number(a) >= 3) count(file, 'packages');
  return `week${shift(Number(a))}`;
});
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
  t = hold(t, 'задачи недель 1–3 — пакетами в своём go-prep', 'задачи недель 1–4 — пакетами в своём go-prep', 'w4-thu-1 text');
  t = hold(t, 'задачи недель 1–3 лежат в week1/, week2/ и week3/', 'задачи недель 1–4 лежат в week1/, week2/, week3/ и week4/', 'w4-thu-1 accept');
  t = hold(t, '// ─────────────── КРИТЕРИИ ПРИЁМКИ НЕДЕЛЬ 1–7 ───────────────', '// ─────────────── КРИТЕРИИ ПРИЁМКИ НЕДЕЛЬ 1–8 ───────────────', 'acceptance banner');
  t = hold(t, '// ─────────────── ОБРАЗЦЫ ОТВЕТОВ НА АНГЛИЙСКОМ (НЕДЕЛИ 1–4, 6–7) ───────────────', '// ─────────────── ОБРАЗЦЫ ОТВЕТОВ НА АНГЛИЙСКОМ (НЕДЕЛИ 1–5, 7–8) ───────────────', 'modelAnswers banner');
  t = hold(t, '// не переиспользовать старые. Исключение — перенумерация v91 (renamedTaskIds ниже): её принял пользователь.',
    '// не переиспользовать старые. Исключение — перенумерации v91 и v96 (renamedTaskIds ниже): их принял пользователь.', 'header IDs');
  t = hold(t, '// Программа подготовки к офферу Senior Go в EU-компании: 14 недель, ~10 ч в неделю.', '// Программа подготовки к офферу Senior Go в EU-компании: 15 недель, ~10 ч в неделю.', 'header');
  // The renaming map of v91 is replaced below; its comment names weeks 2–13.
  const r = region(t, '  // Перенумерация 11.11.2026 (v91)', '  phases: [');
  t = t.slice(0, r.start - '  // Перенумерация 11.11.2026 (v91)'.length) + '\u0001RENAMED\u0001\n' + t.slice(r.end);
  t = mapIds(t, file);
  t = mapTalkKeys(t, file);
  t = release(texts(t, file));
  t = t.replace(/^      id: "w(\d+)",$/gm, (m, n) => { if (Number(n) >= 3) count(file, 'week IDs'); return `      id: "w${shift(Number(n))}",`; });
  for (let w = 14; w >= 3; w--) t = once(t, `// ───────────────────────────── НЕДЕЛЯ ${w} ─────────────────────────────`, `// ───────────────────────────── НЕДЕЛЯ ${w + 1} ─────────────────────────────`, `banner ${w}`);
  t = once(t, 'revision: "2026-11-11",', 'revision: "2026-11-22",', 'revision');
  t = once(t, '{ id: "go", title: "Go: язык и конкурентность", weeks: [1, 2, 3, 4, 5] },', '{ id: "go", title: "Go: язык и конкурентность", weeks: [1, 2, 3, 4, 5, 6] },', 'phase go');
  t = once(t, '{ id: "project", title: "Проект-портфолио: ledger-сервис", weeks: [6, 7, 8, 9] },', '{ id: "project", title: "Проект-портфолио: ledger-сервис", weeks: [7, 8, 9, 10] },', 'phase project');
  t = once(t, '{ id: "interview", title: "Собеседования и рынок", weeks: [10, 11, 12, 13, 14] }', '{ id: "interview", title: "Собеседования и рынок", weeks: [11, 12, 13, 14, 15] }', 'phase interview');
  // w3-tue-5 leaves Tuesday of the old week 3; add-week3.mjs puts it into the new week 3.
  const bits = t.split('\n').filter(line => line.includes('{ id: "w3-tue-5",'));
  if (bits.length !== 1) throw Error(`w3-tue-5: ${bits.length} lines`);
  t = once(t, `${bits[0]}\n`, '', 'w3-tue-5 out of week 4');
  t = once(t, '\u0001RENAMED\u0001\n', renamedBlock(), 'renamedTaskIds');
  put(file, t);
}

// Region from a marker to the next marker.
function region(t, from, to) {
  const start = t.indexOf(from), end = t.indexOf(to, start);
  if (start < 0 || end < 0) throw Error(`region ${from}`);
  return { start: start + from.length, end, body: t.slice(start + from.length, end) };
}

// The map old → new, in the data: check-content tells a renumbering from a silently lost mark by it. The map of v91
// explained the change from v90; check-content compares with the previous release, so only v96 stays.
function renamedBlock() {
  const changed = Object.entries(ids).filter(([a, b]) => a !== b);
  const byWeek = new Map();
  for (const [a, b] of changed) {
    const w = /^w(\d+)-/.exec(a)[1];
    byWeek.set(w, [...(byWeek.get(w) || []), `"${a}": "${b}"`]);
  }
  const rows = [...byWeek.values()].map(pairs => `    ${pairs.join(', ')}`).join(',\n');
  return `  // Перенумерация 22.11.2026 (v96): новая неделя 3 «Биты и закрепление», бывшие недели 3–14 стали 4–15
  // (w3-tue-5 — биты и диаграмма 9 — осталась в неделе 3). Старый ID задачи → новый. Отметки по старым ID сайт
  // не переносит (решение пользователя); запись нужна check-content, чтобы отличить перенумерацию от молча
  // потерянной отметки. Перенумерация v91 (неделя 1 растянута на две) — в истории git.
  renamedTaskIds: {
${rows}
  },

`;
}

/* ------------------------------ data/practice.js ----------------------------- */

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
    if (shift(task.week) !== task.week) block = once(block, `"week": ${task.week},`, `"week": ${shift(task.week)},`, `${label} week`);
    const planTasks = task.planTasks.map(id => ids[id]);
    count(file, 'task IDs', task.planTasks.filter(id => ids[id] !== id).length);
    if (planTasks.join() !== task.planTasks.join()) {
      block = once(block, `"planTasks": ${JSON.stringify(task.planTasks, null, 2).replace(/\n/g, '\n    ')}`, `"planTasks": ${JSON.stringify(planTasks, null, 2).replace(/\n/g, '\n    ')}`, `${label} planTasks`);
    }
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
  for (const { task, kind, code } of fixtures) {
    const name = kind === 'starter' ? 'starter.go.txt' : task.files.solution.name;
    const path = `${task.fixture}/${name}`;
    const next = texts(showBase(path), path);
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
  t = hold(t, 'рядом — учебные пакеты недель 1 и 3.', 'рядом — учебные пакеты недель 1, 3 и 4.', 'guides intro');
  put(file, release(texts(mapIds(t, file), file)));
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
      next = `plan:${ids[m[1]]}`;
      if (next !== key) count(file, 'keys');
    }
    if (items[next]) throw Error(`${file}: two entries for ${next}`);
    items[next] = entry; // files stay as they are: their names keep the old key, the hash is of the text
  }
  const sorted = Object.fromEntries(Object.entries(items).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  const header = src.slice(0, src.indexOf('const AUDIO = '));
  put(file, `${header}const AUDIO = ${JSON.stringify({ ...manifest, items: sorted }, null, 2)};\n`);
}

/* ------------------------ site code, fixtures and scripts --------------------- */

function siteCode() {
  let file = 'js/plan-view.js';
  let t = showBase(file);
  t = once(t, 'week.id === "w3" ? planPredictBlock() : null, // «Что выведет код» — неделя slice и map', 'week.id === "w4" ? planPredictBlock() : null, // «Что выведет код» — неделя slice и map', 'predict week');
  t = once(t, '// Раздел #/plan: программа на 14 недель с отметками выполнения.', '// Раздел #/plan: программа на 15 недель с отметками выполнения.', 'plan-view header');
  put(file, t);
  file = 'js/practice-view.js';
  t = showBase(file);
  t = once(t, '// Дерево раскладки go-prep: учебные пакеты недель 1 и 3 и задачи практикума по неделям.', '// Дерево раскладки go-prep: учебные пакеты недель 1, 3 и 4 и задачи практикума по неделям.', 'tree comment');
  t = once(t, '  add(3, "asm/           ← ассемблер");\n  add(3, "cmd/sumdemo/   ← objdump");', '  add(4, "asm/           ← ассемблер");\n  add(4, "cmd/sumdemo/   ← objdump");', 'tree asm');
  put(file, t);
}

function fixtures() {
  for (const path of ['docs/verification/fixtures/channels/workerpool-alt/group/workerpool.go', 'docs/verification/fixtures/channels/workerpool-alt/sem/workerpool.go', 'docs/verification/fixtures/channels/review/review.go', 'docs/verification/fixtures/go-prep/README.md']) {
    put(path, texts(showBase(path), path));
  }
  // go-prep: the assembler drill is in week 4 now (the old week3/ files are removed separately).
  put('docs/verification/fixtures/go-prep/week4/cmd/sumdemo/main.go', texts(showBase('docs/verification/fixtures/go-prep/week3/cmd/sumdemo/main.go'), 'go-prep main.go'));
  for (const name of ['asm.go', 'asm_test.go']) put(`docs/verification/fixtures/go-prep/week4/asm/${name}`, texts(showBase(`docs/verification/fixtures/go-prep/week3/asm/${name}`), `go-prep ${name}`));
}

function scripts() {
  // Speech fixes and listening risks are keyed by plan task ID.
  for (const file of ['scripts/gen-audio.mjs', 'scripts/audio-review.mjs']) {
    let t = showBase(file).replace(/'plan:(w\d+-(?:mon|tue|wed|thu|fri|sat|sun)-\d+)'/g, (m, id) => {
      if (!(id in ids)) throw Error(`${file}: unknown task ${id}`);
      if (ids[id] !== id) count(file, 'keys');
      return `'plan:${ids[id]}'`;
    });
    if (file === 'scripts/audio-review.mjs') t = once(t, 'let out = `# Приёмка озвучки на слух — недели 1–4', 'let out = `# Приёмка озвучки на слух — недели 1–5', 'audio-review title');
    put(file, t);
  }
}

plan();
practice();
plainData();
audio();
siteCode();
fixtures();
scripts();

for (const [file, text] of outputs) {
  if (!dry) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
}
console.log(JSON.stringify({ base: BASE, written: dry ? 0 : outputs.size, files: [...outputs.keys()], stats }, null, 2));
