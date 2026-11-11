// v91: checks that the 14-week renumbering is complete and consistent.
// 1. No retired task ID or practice code is left in the data, scripts, fixtures and browser sets.
// 2. Everything that pointed to a task points to its new ID: practice planTasks, audio keys, model answers,
//    acceptance, track katas, talks; task texts are the old texts up to numbers, except the hand-edited ones.
// 3. Every plan task that practice, track or audio refers to exists; codes match the week of the task.
//   node docs/verification/v91/check-map.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { root, showBase, idMap, codeMap, MODEL_MOVED, NEW_TASKS, basePlan, basePractice } from './maps.mjs';
import { loadPlan, loadPractice, loadTracks, planTaskIds } from '../../../scripts/check-content.mjs';

const read = file => readFileSync(join(root, file), 'utf8');
const errors = [];
const fail = message => errors.push(message);
const ids = idMap(), codes = codeMap();
const plan = loadPlan(read), practice = loadPractice(read), tracks = loadTracks(read);
const oldPlan = basePlan(), oldPractice = basePractice();
const taskIds = new Set(planTaskIds(plan));
const tasks = new Map(plan.weeks.flatMap(w => w.days.flatMap(d => d.tasks.map(t => [t.id, { ...t, week: Number(w.id.slice(1)), day: d.label }]))));
const oldTasks = new Map(oldPlan.weeks.flatMap(w => w.days.flatMap(d => d.tasks.map(t => [t.id, t]))));
const newCodes = new Set(['W1-3', ...practice.flatMap(t => t.code.split(/,\s*/))]);
const retiredIds = [...oldTasks.keys()].filter(id => !taskIds.has(id));
const retiredCodes = Object.keys(codes).filter(code => !newCodes.has(code));
// Texts changed by hand in v91 (the rest must equal the old text up to numbers).
const EDITED = new Set(['w1-wed-3', 'w2-wed-1', 'w2-sat-2', 'w2-tue-2']);
const EDITED_ACCEPT = new Set(['w1-wed-3', 'w2-thu-1', 'w3-thu-1']);
const noDigits = s => s.replace(/\d+/g, '#');

/* 1. Retired IDs and codes. */
const scanned = [
  ...['data/plan.js', 'data/practice.js', 'data/cards.js', 'data/quiz.js', 'data/simulators.js', 'data/guides.js', 'data/tracks.js', 'data/audio.js', 'index.html'],
  ...readdirSync(join(root, 'js')).filter(f => f.endsWith('.js')).map(f => `js/${f}`),
  ...readdirSync(join(root, 'scripts')).filter(f => /\.(m?js|cjs)$/.test(f)).map(f => `scripts/${f}`),
  ...readdirSync(join(root, 'docs/verification/browser')).filter(f => f.endsWith('.js')).map(f => `docs/verification/browser/${f}`)
];
const fixtureFiles = dir => readdirSync(join(root, dir), { withFileTypes: true }).flatMap(e => e.isDirectory() ? fixtureFiles(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
scanned.push(...fixtureFiles('docs/verification/fixtures').filter(f => /\.(go|txt)$/.test(f)));
// Allowed: the declared map itself, an old record in check-v91 (old marks must not show), and the server-side tests of
// p-profile (backend task JSON keeps them as they are; see the v91 journal entry).
const allowed = (file, token, line) =>
  (file === 'data/plan.js' && /^\s+"w\d+-\w+-\d+": "w/.test(line)) ||
  (file === 'data/audio.js' && /"audio\/en\/plan-/.test(line)) || // recordings keep their file names (v91: MP3 untouched)
  (file === 'docs/verification/browser/check-v91.js' && token === 'w13-sat-3') ||
  (token === 'W4-6' && line.includes('The goal of W4-6') && ['docs/verification/fixtures/practice/txprof/txprof_test.go', 'data/practice.js'].includes(file)) ||
  (file === 'scripts/check-content.test.mjs' && /w99-|w1-mon-9/.test(token));
const scan = { files: 0, hits: 0 };
for (const file of scanned) {
  scan.files++;
  read(file).split('\n').forEach((line, i) => {
    for (const token of line.match(/\bw\d+-(?:mon|tue|wed|thu|fri|sat|sun)-\d+\b|\bW\d+-\d+\b/g) || []) {
      const retired = retiredIds.includes(token) || retiredCodes.includes(token);
      if (retired && !allowed(file, token, line)) { scan.hits++; fail(`${file}:${i + 1}: retired ${token}`); }
      if (/^w/.test(token) && !taskIds.has(token) && !retired && !allowed(file, token, line)) fail(`${file}:${i + 1}: unknown task ${token}`);
      if (/^W/.test(token) && !newCodes.has(token) && !retired) fail(`${file}:${i + 1}: unknown code ${token}`);
    }
  });
}

/* 2. Everything follows the map. */
for (const [old, task] of oldTasks) {
  const now = tasks.get(ids[old]);
  if (!now) { fail(`task ${old} → ${ids[old]}: missing`); continue; }
  if (!EDITED.has(now.id) && noDigits(now.text) !== noDigits(task.text)) fail(`task ${old} → ${now.id}: text differs beyond numbers`);
  if (now.lc !== task.lc) fail(`task ${now.id}: lc changed`);
  const oldLinks = (task.links || []).join(), newLinks = (now.links || []).join();
  if (oldLinks !== newLinks && now.id !== 'w1-wed-3') fail(`task ${now.id}: links changed ${oldLinks} → ${newLinks}`);
  if (task.talk) {
    const want = /^w\d+-\d+$/.test(task.talk) ? codes[task.talk.toUpperCase()].toLowerCase() : task.talk;
    if (now.talk !== want) fail(`task ${now.id}: talk ${task.talk} → ${now.talk}, want ${want}`);
  }
  if (Boolean(task.optional) !== Boolean(now.optional) && !['w2-wed-1', 'w2-sat-2'].includes(now.id)) fail(`task ${now.id}: optional changed`);
}
for (const id of NEW_TASKS) if (!tasks.has(id)) fail(`new task ${id} missing`);
for (const id of NEW_TASKS) if (!plan.acceptance[id]) fail(`new task ${id}: no «Готово, когда»`);
for (const [old, entry] of Object.entries(oldPlan.acceptance)) {
  const now = plan.acceptance[ids[old]];
  if (!now) fail(`acceptance ${old} → ${ids[old]}: missing`);
  else if (!EDITED_ACCEPT.has(ids[old]) && noDigits(now.accept) !== noDigits(entry.accept)) fail(`acceptance ${old} → ${ids[old]}: text differs beyond numbers`);
}
for (const [old, entry] of Object.entries(oldPlan.modelAnswers)) {
  const id = MODEL_MOVED[old] || ids[old];
  const now = plan.modelAnswers[id];
  if (!now || now.hook !== entry.hook || now.en !== entry.en) fail(`model answer ${old} → ${id}: missing or changed`);
}
for (const [id, renamed] of Object.entries(plan.renamedTaskIds || {})) if (ids[id] !== renamed) fail(`renamedTaskIds ${id}: ${renamed}, map says ${ids[id]}`);
const changed = Object.entries(ids).filter(([a, b]) => a !== b);
if (changed.length !== Object.keys(plan.renamedTaskIds || {}).length) fail(`renamedTaskIds lists ${Object.keys(plan.renamedTaskIds || {}).length}, map changes ${changed.length}`);

// Audio: same entries under the new keys, the files untouched.
const audioOf = src => { const c = createContext({}); runInContext(src, c); return runInContext('AUDIO', c).items; };
const oldAudio = audioOf(showBase('data/audio.js')), audio = audioOf(read('data/audio.js'));
for (const [key, entry] of Object.entries(oldAudio)) {
  const m = /^plan:(.+)$/.exec(key);
  const next = m ? `plan:${MODEL_MOVED[m[1]] || ids[m[1]]}` : key;
  if (JSON.stringify(audio[next]) !== JSON.stringify(entry)) fail(`audio ${key} → ${next}: entry differs`);
}
if (Object.keys(audio).length !== Object.keys(oldAudio).length) fail('audio: number of entries changed');
for (const key of Object.keys(audio)) {
  const m = /^plan:(.+)$/.exec(key);
  if (m && !(taskIds.has(m[1]) && plan.modelAnswers[m[1]])) fail(`audio ${key}: no such task or model answer`);
}

// Practice: code, week, plan tasks.
const PLAN_TASKS = { 'p-money': ['w1-tue-3', 'w1-sat-8'], 'p-account': ['w1-wed-3', 'w2-wed-2', 'w3-thu-3'], 'p-validation': ['w2-mon-2', 'w2-wed-3'], 'p-deferpanic': ['w2-tue-2', 'w2-wed-4'] };
for (const old of oldPractice) {
  const now = practice.find(t => t.id === old.id);
  const wantCode = old.code.split(/,\s*/).map(c => codes[c]).join(', ');
  if (now.code !== wantCode) fail(`${old.id}: code ${now.code}, want ${wantCode}`);
  const weeks = [...new Set(now.code.split(/,\s*/).map(c => Number(/^W(\d+)-/.exec(c)[1])))];
  if (weeks.length !== 1 || weeks[0] !== now.week) fail(`${old.id}: code ${now.code} is not week ${now.week}`);
  const want = PLAN_TASKS[old.id] || old.planTasks.map(id => ids[id]);
  if (now.planTasks.join() !== want.join()) fail(`${old.id}: planTasks ${now.planTasks}, want ${want}`);
  const main = tasks.get(now.planTasks[0]);
  if (!main || main.week !== now.week) fail(`${old.id}: first plan task ${now.planTasks[0]} is not in week ${now.week}`);
  for (const id of now.planTasks) if (!taskIds.has(id)) fail(`${old.id}: unknown plan task ${id}`);
  for (const kind of ['starter', 'solution']) {
    const named = (now.files[kind].code.match(/practice tasks? (W\d+-\d+)(?: and (W\d+-\d+))?/) || []).slice(1).filter(Boolean).join(', ');
    if (named !== now.code) fail(`${old.id}: ${kind} names ${named}, code is ${now.code}`);
  }
}

// Plan tasks that open with a code link the practice task of that code.
for (const task of tasks.values()) {
  const first = /^(W\d+-\d+)\b/.exec(task.text);
  if (!first || first[1] === 'W1-3') continue;
  const linked = (task.links || []).filter(id => id.startsWith('p-')).map(id => practice.find(p => p.id === id).code.split(/,\s*/)).flat();
  if (!linked.includes(first[1])) fail(`${task.id}: text starts with ${first[1]}, links ${linked.join() || 'no practice task'}`);
  if (Number(first[1].slice(1).split('-')[0]) !== task.week) fail(`${task.id}: ${first[1]} in week ${task.week}`);
}

// Track katas: the same steps are linked from the mapped tasks.
const kataLinks = p => { const m = new Map(); p.weeks.forEach(w => w.days.forEach(d => d.tasks.forEach(t => (t.links || []).filter(id => /^k\d/.test(id)).forEach(id => m.set(id, [...(m.get(id) || []), t.id]))))); return m; };
const oldKatas = kataLinks(oldPlan), newKatas = kataLinks(plan);
for (const [kata, list] of oldKatas) if (list.map(id => ids[id]).join() !== (newKatas.get(kata) || []).join()) fail(`kata ${kata}: ${list} → ${newKatas.get(kata)}`);
const trackSteps = new Set(Object.values(tracks).flatMap(t => t.blocks.flatMap(b => [b.id, ...b.steps.map(s => s.id)])));
for (const kata of newKatas.keys()) if (!trackSteps.has(kata)) fail(`kata ${kata}: not in the track`);

console.log(JSON.stringify({
  ok: errors.length === 0,
  tasks: { before: oldTasks.size, after: tasks.size, renamed: changed.length, kept: oldTasks.size - changed.length, new: NEW_TASKS.length, retiredIds: retiredIds.length },
  codes: { renamed: Object.entries(codes).filter(([a, b]) => a !== b).length, retired: retiredCodes },
  scanned: scan.files, errors
}, null, 2));
if (errors.length) process.exitCode = 1;
