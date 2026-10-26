import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataFiles = ['data/cards.js', 'data/quiz.js', 'data/simulators.js'];

// Only evaluate trusted repository data. VM isolation is not a security boundary.
export function loadContent(read) {
  const context = createContext({});
  for (const file of dataFiles) runInContext(read(file), context, { filename: file, timeout: 1000 });
  return JSON.parse(runInContext('JSON.stringify({cards:CARDS, quiz:QUIZ_QUESTIONS, simulators:SIMULATORS, cheatsheet:CHEATSHEET_ROWS})', context, { timeout: 1000 }));
}

export function validateContent(data) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const texts = value => Array.isArray(value) && value.length > 0 && value.every(text);
  const fields = (object, keys, label) => keys.forEach(key => require(text(object[key]), `${label}: missing/empty ${key}`));
  for (const group of ['cards', 'quiz', 'simulators', 'cheatsheet']) {
    require(Array.isArray(data[group]) && data[group].length > 0, `${group}: expected non-empty array`);
  }
  if (errors.length) return errors;
  const ids = {};
  for (const group of ['cards', 'quiz', 'simulators']) {
    ids[group] = new Set();
    for (const item of data[group]) {
      require(item && typeof item === 'object', `${group}: expected object`);
      if (!item || typeof item !== 'object') continue;
      require(text(item.id) && !ids[group].has(item.id), `${group}: missing or duplicate ID ${item.id}`);
      ids[group].add(item.id);
    }
  }
  if (errors.length) return errors;
  const link = (id, group, label) => require(ids[group].has(id), `${label}: unknown ${group} ID ${id}`);
  for (const c of data.cards) {
    fields(c, ['qEN', 'qRU', 'shortEN', 'mod', 'level'], c.id);
    require(texts(c.detailsEN), `${c.id}: missing detailsEN`);
    if (c.simId != null) link(c.simId, 'simulators', c.id);
    if (c.shortRU !== undefined || c.detailsRU !== undefined) {
      require(text(c.shortRU) && texts(c.detailsRU) && c.detailsRU.length === c.detailsEN?.length, `${c.id}: incomplete EN/RU explanation`);
    }
    if (c.practice !== undefined) {
      const p = c.practice;
      require(p && typeof p === 'object', `${c.id}: invalid practice`);
      if (!p || typeof p !== 'object') continue;
      fields(p, ['kind', 'promptEN', 'promptRU', 'followUpEN', 'followUpRU'], `${c.id}.practice`);
      require(texts(p.pointsEN) && texts(p.pointsRU) && p.pointsEN.length === p.pointsRU.length, `${c.id}: incomplete EN/RU practice points`);
    }
  }
  for (const q of data.quiz) {
    fields(q, ['title', 'en', 'ru', 'code', 'explanationRU', 'speechEN'], q.id);
    require(texts(q.options) && q.options.length >= 2, `${q.id}: invalid options`);
    require(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options?.length, `${q.id}: correct index outside options`);
    if (q.cardIds !== undefined) {
      require(Array.isArray(q.cardIds), `${q.id}: cardIds must be an array`);
      if (Array.isArray(q.cardIds)) q.cardIds.forEach(id => link(id, 'cards', q.id));
    }
  }
  for (const s of data.simulators) {
    fields(s, ['title', 'subtitle', 'cardLabel'], s.id);
    link(s.cardId, 'cards', s.id);
    require(Array.isArray(s.steps) && s.steps.length > 0, `${s.id}: missing steps`);
    if (!Array.isArray(s.steps)) continue;
    s.steps.forEach((step, index) => {
      const label = `${s.id}.steps[${index}]`;
      if (!step || typeof step !== 'object') { errors.push(`${label}: expected object`); return; }
      fields(step, ['title', 'desc'], label);
      if (step.check !== undefined) {
        if (!step.check || typeof step.check !== 'object') { errors.push(`${label}: invalid check`); return; }
        fields(step.check, ['promptEN', 'promptRU', 'answerEN', 'answerRU'], label);
        require(text(step.descEN), `${label}: recall requires descEN`);
      }
    });
  }
  for (const row of data.cheatsheet) {
    if (!row || typeof row !== 'object') { errors.push('cheatsheet: expected object'); continue; }
    fields(row, ['topic', 'how', 'markers'], 'cheatsheet');
    link(row.cardId, 'cards', row.topic);
    if (row.simId != null) link(row.simId, 'simulators', row.topic);
  }
  return errors;
}

export function changedContent(before, after) {
  const result = {};
  for (const group of ['cards', 'quiz', 'simulators']) {
    const old = new Map(before[group].map(item => [item.id, item]));
    const current = new Set(after[group].map(item => item.id));
    result[group] = {
      changed: after[group].filter(item => JSON.stringify(item) !== JSON.stringify(old.get(item.id))).map(item => item.id),
      removed: [...old.keys()].filter(id => !current.has(id)),
      orderChanged: JSON.stringify([...old.keys()]) !== JSON.stringify([...current]),
    };
  }
  result.cheatsheetChanged = JSON.stringify(before.cheatsheet) !== JSON.stringify(after.cheatsheet);
  return result;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 2 && args[0] === '--base')) throw Error('Usage: node scripts/check-content.mjs [--base <commit>]');
  const started = performance.now();
  const read = file => readFileSync(resolve(root, file), 'utf8');
  for (const file of [...dataFiles, 'js/app.js']) execFileSync(process.execPath, ['--check', resolve(root, file)], { stdio: 'pipe' });
  const data = loadContent(read);
  const errors = validateContent(data);
  let base = null, changes = null;
  if (args.length) {
    const git = argv => execFileSync('git', argv, { cwd: root, encoding: 'utf8' });
    base = git(['rev-parse', '--verify', '--end-of-options', `${args[1]}^{commit}`]).trim();
    changes = changedContent(loadContent(file => git(['show', `${base}:${file}`])), data);
    for (const group of ['cards', 'quiz', 'simulators']) {
      if (changes[group].removed.length) errors.push(`${group}: stable IDs removed: ${changes[group].removed.join(', ')}`);
    }
  }
  console.log(JSON.stringify({ ok: errors.length === 0, base, counts: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.length])), changes, errors, durationMs: Math.round(performance.now() - started), scope: 'Syntax and structural checks only; not Go correctness, translation equivalence, UI or automatic review completion.' }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
