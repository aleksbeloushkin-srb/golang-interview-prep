// v96: inserts the new week 3 «Биты и закрепление» into the data files, after renumber.mjs has shifted weeks 3–14.
// Texts — week3-content.mjs and week3-guides.mjs; code of practice tasks and guides — fixtures, byte for byte.
// Every insertion point must match exactly once; a rerun on already changed files refuses.
//   node docs/verification/v96/renumber.mjs && node docs/verification/v96/add-week3.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { WEEK3_PLAN, W3_TUE_5, ACCEPTANCE, MODEL_ANSWERS, LEETCODE, TALKS_LC, TALKS_W, PRACTICE, PLAN_TASKS_ADD, QUIZ, CARD } from './week3-content.mjs';
import { GO_BITS, REVIEWS, GUIDE_LINKS_ADD } from './week3-guides.mjs';
import { BASE } from './maps.mjs';

const root = new URL('../../../', import.meta.url);
const path = p => new URL(p, root);
const read = p => readFileSync(path(p), 'utf8');
// Files renumber.mjs does not write are taken from the base commit, so a rerun of both scripts gives the same result.
const fromBase = p => execFileSync('git', ['show', `${BASE}:${p}`], { cwd: path('.').pathname, encoding: 'utf8', maxBuffer: 64 << 20 });
const write = (p, t) => writeFileSync(path(p), t);
const J = JSON.stringify;

function once(text, from, to, where) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw Error(`${where}: expected exactly one «${from.slice(0, 80)}», found ${n}`);
  return text.replace(from, () => to);
}
const before = (text, anchor, insert, where) => once(text, anchor, insert + anchor, where);

/* ------------------------------- data/plan.js ------------------------------- */

const taskLine = t => {
  const parts = [`id: ${J(t.id)}`, `text: ${J(t.text)}`];
  if (t.links) parts.push(`links: [${t.links.map(J).join(', ')}]`);
  if (t.lc) parts.push(`lc: ${t.lc}`);
  if (t.talk) parts.push(`talk: ${J(t.talk)}`);
  if (t.optional) parts.push('optional: true');
  return `{ ${parts.join(', ')} }`;
};

function plan() {
  const file = 'data/plan.js';
  let t = read(file);
  if (t.includes('id: "w3-mon-4"')) throw Error('plan: week 3 is already there');
  // w3-tue-5 comes back from the base plan: required now, with a shorter time.
  const baseLine = execFileSync('git', ['show', `${BASE}:${file}`], { cwd: path('.').pathname, encoding: 'utf8' })
    .split('\n').find(l => l.includes('{ id: "w3-tue-5",')).trim().replace(/,$/, '');
  const tue5 = once(once(baseLine, ', optional: true', '', 'w3-tue-5 optional'), W3_TUE_5.from, W3_TUE_5.to, 'w3-tue-5 time');
  const day = d => `        {
          label: ${J(d.label)}, minutes: ${d.minutes}, tasks: [
${d.tasks.map(x => `            ${x === 'w3-tue-5' ? tue5 : taskLine(x)}`).join(',\n')}
          ]
        }`;
  const w = WEEK3_PLAN;
  const week = `    // ───────────────────────────── НЕДЕЛЯ 3 ─────────────────────────────
    {
      id: ${J(w.id)},
      title: ${J(w.title)},
      goal: ${J(w.goal)},
      done: ${J(w.done)},
      days: [
${w.days.map(day).join(',\n')}
      ],
      leetcode: [${w.leetcode.join(', ')}],
      english: [
${w.english.map(s => `        ${J(s)}`).join(',\n')}
      ],
      selfCheck: [
${w.selfCheck.map(s => `        ${J(s)}`).join(',\n')}
      ],
      gaps: []
    },

`;
  t = before(t, '    // ───────────────────────────── НЕДЕЛЯ 4 ─────────────────────────────', week, 'week 3');

  // LeetCode index: numeric keys in ascending order.
  for (const [n, e] of Object.entries(LEETCODE)) {
    if (new RegExp(`^    ${n}: \\{`, 'm').test(t)) throw Error(`leetcodeIndex ${n} exists`);
    const region = t.slice(t.indexOf('  leetcodeIndex: {'), t.indexOf('\n  },', t.indexOf('  leetcodeIndex: {')));
    const next = [...region.matchAll(/^    (\d+): \{/gm)].map(m => Number(m[1])).find(k => k > Number(n));
    const line = `    ${n}: { title: ${J(e.title)}, slug: ${J(e.slug)}, pattern: ${J(e.pattern)}, key: ${J(e.key)} },\n`;
    if (next === undefined) throw Error(`leetcodeIndex: no key after ${n}`);
    t = before(t, `    ${next}: {`, line, `leetcodeIndex ${n}`);
  }

  // Talks: LeetCode ones after LC 238, the practice ones before W4-1.
  const talk = (key, x) => `    ${/^[a-z0-9]+$/.test(key) ? key : J(key)}: {
${Object.entries(x).map(([k, v]) => `      ${k}: ${J(v)}`).join(',\n')}
    },
`;
  t = before(t, '    lc3: {', Object.entries(TALKS_LC).map(([k, x]) => talk(k, x)).join(''), 'talks LC');
  t = before(t, '    "w4-1": {', Object.entries(TALKS_W).map(([k, x]) => talk(k, x)).join(''), 'talks W3');

  // Acceptance: a group of week 3 before week 4.
  const acc = Object.entries(ACCEPTANCE).map(([id, a]) => `    ${J(id)}: { accept: ${J(a)} },\n`).join('');
  t = before(t, '    "w4-mon-1": { accept:', `${acc}\n`, 'acceptance');

  // Model answers: a group of week 3 before week 4.
  const model = Object.entries(MODEL_ANSWERS).map(([id, m]) => `    ${J(id)}: {
      hook: ${J(m.hook)},
      en: ${J(m.en)}
    },
`).join('');
  t = before(t, '    "w4-mon-1": {\n      hook:', `${model}\n`, 'modelAnswers');

  // Repeat of W1-2 tests in week 4: new cases, not the drill of week 1.
  t = once(t, '{ id: "w4-thu-3", text: "Покрыть тестами W1-2 и W4-2 — в go-prep, рядом с тестами практикума"',
    '{ id: "w4-thu-3", text: "Тесты на новых случаях: W1-2 — закрытый счёт и валюта из недель 2–3 (тренировку недели 1 не повторять) и W4-2 — в go-prep, рядом с тестами практикума"', 'w4-thu-3 text');
  t = once(t, '"w4-thu-3": { accept: "Тесты W1-2 и W4-2 покрывают ошибки и граничные случаи, а не только успешный путь;',
    '"w4-thu-3": { accept: "Тесты W1-2 и W4-2 покрывают ошибки и граничные случаи, а не только успешный путь: у W1-2 — закрытый счёт и чужая валюта таблицей;', 'w4-thu-3 accept');
  write(file, t);
}

/* ----------------------------- data/practice.js ------------------------------ */

function practice() {
  const file = 'data/practice.js';
  let t = read(file);
  if (t.includes('"id": "p-perm"')) throw Error('practice: week 3 tasks are already there');
  const entries = PRACTICE.map(p => {
    const code = name => read(`${p.fixture}/${name}`).replace(/\n+$/, '');
    const task = {
      id: p.id, code: p.code, week: p.week, title: p.title, titleEN: p.titleEN, goalRU: p.goalRU,
      contractRU: p.contractRU, contractEN: p.contractEN, planTasks: p.planTasks, links: p.links, hints: p.hints,
      talkEN: p.talkEN, pitfalls: p.pitfalls, followUps: p.followUps, fixture: p.fixture,
      files: {
        starter: { name: p.names.starter, code: code('starter.go.txt') },
        tests: { name: p.names.tests, code: code(p.names.tests) },
        solution: { name: p.names.solution, code: code(p.names.solution) }
      }
    };
    return JSON.stringify(task, null, 2).split('\n').map(l => `  ${l}`).join('\n');
  }).join(',\n');
  // After W2-2/W2-3 (deferpanic), before W4-1 (removeslice).
  t = once(t, '  {\n    "id": "p-removeslice",', `${entries},\n  {\n    "id": "p-removeslice",`, 'practice order');
  // The test of W6-6 named its code in a comment; it said W4-6 since v91. No code in the comment any more.
  t = once(t, '// The goal of W4-6:', '// The goal of the task:', 'p-profile test comment');
  for (const [id, add] of Object.entries(PLAN_TASKS_ADD)) {
    const start = t.indexOf(`    "id": "${id}",`);
    const m = /"planTasks": \[\n((?:      "[^"]+",?\n)+)    \]/.exec(t.slice(start));
    if (start < 0 || !m) throw Error(`planTasks of ${id}`);
    const ids = [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]);
    const next = `"planTasks": [\n${[...ids, ...add].map(x => `      "${x}"`).join(',\n')}\n    ]`;
    t = t.slice(0, start) + t.slice(start).replace(m[0], () => next);
  }
  write(file, t);
}

/* --------------------------------- data/guides.js ---------------------------- */

const js = (value, indent) => {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.every(v => typeof v === 'string')) return `[\n${value.map(v => `${pad}  ${J(v)}`).join(',\n')}\n${pad}]`;
    return `[\n${value.map(v => `${pad}  ${js(v, indent + 2)}`).join(',\n')}\n${pad}]`;
  }
  if (value && typeof value === 'object') {
    if (Object.values(value).every(v => typeof v === 'string')) return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${J(v)}`).join(', ')} }`;
    return `{\n${Object.entries(value).map(([k, v]) => `${pad}  ${k}: ${js(v, indent + 2)}`).join(',\n')}\n${pad}}`;
  }
  return J(value);
};

function guides() {
  const file = 'data/guides.js';
  let t = read(file);
  if (t.includes('"go-bits"')) throw Error('guides: already there');
  const withModule = g => JSON.parse(JSON.stringify(g).replaceAll('github.com/you/', 'github.com/<ник>/'));
  const end = '\n};\n\n// Ссылки из плана: id → страница справки и раздел.';
  t = once(t, end, `,\n  "go-bits": ${js(withModule(GO_BITS), 2)},\n  "week3-reviews": ${js(withModule(REVIEWS), 2)}${end}`, 'guides end');
  const lastLink = t.slice(t.lastIndexOf('\n  "g-'), t.lastIndexOf('\n};'));
  const links = GUIDE_LINKS_ADD.map(([id, guide, section, label]) => `  ${J(id)}: { guide: ${J(guide)}, section: ${section === null ? 'null' : J(section)}, label: ${J(label)} }`).join(',\n');
  t = once(t, `${lastLink}\n};`, `${lastLink},\n${links}\n};`, 'guide links');
  write(file, t);
}

/* ---------------------------- quiz, cards, site code -------------------------- */

function quiz() {
  const file = 'data/quiz.js';
  let t = fromBase(file);
  if (t.includes('"id": "q56"')) throw Error('quiz: already there');
  const entries = QUIZ.map(q => JSON.stringify(q, null, 2).split('\n').map(l => `  ${l}`).join('\n')).join(',\n');
  t = once(t, '\n  }\n];\n', `\n  },\n  // =========================================================================\n  // НЕДЕЛЯ 3: БИТЫ (Q56 - Q58)\n  // =========================================================================\n${entries}\n];\n`, 'quiz end');
  write(file, t);
}

function cards() {
  const file = 'data/cards.js';
  let t = read(file);
  if (t.includes('"id": "c73"')) throw Error('cards: already there');
  const src = t;
  const c44 = src.slice(src.indexOf('    "id": "c44",'));
  const field = name => JSON.parse(new RegExp(`"${name}": ("[^"]*")`).exec(c44)[1]);
  const card = {
    id: CARD.id, mod: CARD.mod, modName: field('modName'), level: 'base', levelLabel: field('levelLabel'), simId: CARD.simId,
    qEN: CARD.qEN, qRU: CARD.qRU, shortEN: CARD.shortEN, anchorsEN: CARD.anchorsEN, jvmEN: CARD.jvmEN, shortRU: CARD.shortRU,
    jvmRU: CARD.jvmRU, detailsEN: CARD.detailsEN, detailsRU: CARD.detailsRU, practicalRU: CARD.practicalRU, code: CARD.code,
    versionNote: CARD.versionNote, sources: CARD.sources, practice: CARD.practice, quizIds: CARD.quizIds
  };
  const entry = JSON.stringify(card, null, 2).split('\n').map(l => `  ${l}`).join('\n');
  // Module 6 keeps its cards together: c73 right after c65, before c45.
  t = once(t, '  {\n    "id": "c45",', `${entry},\n  {\n    "id": "c45",`, 'cards order');
  write(file, t);
}

function site() {
  let file = 'index.html';
  let t = fromBase(file);
  t = once(t, 'onclick="setFilter(\'m6\')">6. Идиомы: ошибки, типы, тесты (7)</button>', 'onclick="setFilter(\'m6\')">6. Идиомы: ошибки, типы, тесты (8)</button>', 'm6 chip');
  t = once(t, '<!-- ПРОГРАММА 14 НЕДЕЛЬ: заполняется js/plan-view.js из data/plan.js -->', '<!-- ПРОГРАММА 15 НЕДЕЛЬ: заполняется js/plan-view.js из data/plan.js -->', 'plan comment');
  t = once(t, 'aria-label="План подготовки на 14 недель"', 'aria-label="План подготовки на 15 недель"', 'plan label');
  if (t.split('?v=95').length !== 20) throw Error('index.html: expected 19 ?v=95');
  t = t.replaceAll('?v=95', '?v=96');
  write(file, t);
  file = 'js/practice-view.js';
  t = read(file);
  t = once(t, '  add(1, "calc/          ← первый тест");\n', '  add(1, "calc/          ← первый тест");\n  add(3, "bitops/        ← справка «Биты в Go»");\n', 'tree bitops');
  write(file, t);
}

/* ------------------------------- speech fixes --------------------------------- */

// Symbols read badly aloud: the page keeps them, the recording says them in words (gen-audio.mjs, SPEECH_FIXES).
const SPEECH = {
  'card:c73:short': [
    ['Go works on each bit position: & keeps common bits, | merges them, ^ keeps the differing ones, and &^, A-N-D N-O-T, clears the bits of the right operand.', 'Go works on each bit position: and keeps common bits, or merges them, x-or keeps the differing ones, and the and-not operator clears the bits of the right operand.'],
    ['A mask picks positions: x | 1<<k sets bit k, x &^, 1<<k, clears it, x&, 1<<k, not equal to 0 tests it.', 'A mask picks positions: x or one shifted left by k sets bit k, x and-not that mask clears it, and x and the mask, not equal to zero, tests it.'],
    ['so minus 7 >> 1 is minus 4', 'so minus seven shifted right by one is minus four']
  ],
  'card:c73:jvm': [
    ['Java writes N-O-T as ~x and has no A-N-D N-O-T: a & ~b.', 'Java writes not as a tilde before x and has no and-not: it writes a and tilde b.'],
    ["Java's >> is arithmetic like Go's on signed types, and >>> is a logical shift; Go has no >>>, you convert", "Java's right shift is arithmetic like Go's on signed types, and the triple right shift is a logical shift; Go has no triple shift, you convert"],
    ['In Java, x & 1 equals 0 does not compile without parentheses; in Go it means, x & 1, equals 0.', 'In Java, x and 1 equals 0 does not compile without parentheses; in Go it means x and 1, compared with 0.']
  ],
  'plan:w3-mon-4': [
    ['the byte 1011_0110 reads as', 'the byte 1 0 1 1, 0 1 1 0 reads as'],
    ["A-N-D keeps common bits, O-R merges them, X-O-R keeps differing bits, and Go's A-N-D N-O-T clears", "And keeps common bits, or merges them, x-or keeps differing bits, and Go's and-not clears"]
  ],
  'plan:w3-tue-6': [
    ['O-R sets a bit, A-N-D N-O-T clears it, X-O-R toggles it, and A-N-D tests it', 'or sets a bit, and-not clears it, x-or toggles it, and an and tests it']
  ],
  'plan:w3-sat-14': [
    ['a &^ b clears in a the bits set in b; it equals a & ^b, while a ^ b would also set', 'a and-not b clears in a the bits set in b; it equals a and the inverse of b, while a x-or b would also set'],
    ['when n &, n-1, is zero', 'when n and n minus one is zero'],
    ['mask with 0x0F', 'mask with hex zero F']
  ],
  'practice:p-perm:talk': [
    ['and 1 << iota gives these values', 'and one shifted left by iota gives these values'],
    ['A set of rights is a bitwise O-R.', 'A set of rights is a bitwise or.'],
    ['Has checks p & q equals q', 'Has checks that p and q equals q'],
    ['Remove uses A-N-D N-O-T, p &^ q, which clears', 'Remove uses and-not, which clears'],
    ['X-O-R would add', 'x-or would add']
  ],
  'practice:p-bitset:talk': [
    ['sets the bit with O-R; Remove clears it with A-N-D N-O-T', 'sets the bit with or; Remove clears it with and-not']
  ]
};

function speech() {
  const file = 'scripts/gen-audio.mjs';
  let t = read(file);
  if (t.includes("'card:c73:short'")) throw Error('gen-audio: speech fixes are already there');
  const entries = Object.entries(SPEECH).map(([key, pairs]) => `  ${J(key).replaceAll('"', "'")}: [\n${pairs.map(([a, b]) => `    [${J(a)}, ${J(b)}]`).join(',\n')}\n  ],\n`).join('');
  t = once(t, 'const SPEECH_FIXES = {\n', `const SPEECH_FIXES = {\n${entries}`, 'speech fixes');
  write(file, t);
}

/* ------------------------------------ docs ------------------------------------ */

function docs() {
  const file = 'docs/verification/fixtures/go-prep/README.md';
  let t = read(file);
  t = once(t, '(неделя 4; до v91 — неделя 2, `week2/`)', '(неделя 4; до v96 — неделя 3, до v91 — неделя 2)', 'go-prep README asm');
  t = once(t, '`example_test.go`, `bench_test.go`, `fuzz_test.go`.', '`example_test.go`, `bench_test.go`, `fuzz_test.go`. С v96 в `week3/bitops` — примеры справки «Биты в Go» (`#/practice/go-bits`): `bitops.go` и `example_test.go` с семью Example, вывод которых — строки справки (`docs/verification/v96/check-week3.mjs`). Код разбора 1 недели 3 специально падает на тестах и лежит отдельно — `../review-week3/`.', 'go-prep README bitops');
  write(file, t);
}

plan();
practice();
guides();
quiz();
cards();
site();
speech();
docs();
console.log('week 3 added');
