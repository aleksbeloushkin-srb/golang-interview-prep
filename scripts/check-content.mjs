import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { textHash } from './speech-text.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataFiles = ['data/cards.js', 'data/quiz.js', 'data/simulators.js'];
const planFile = 'data/plan.js';
const practiceFile = 'data/practice.js';

// Only evaluate trusted repository data. VM isolation is not a security boundary.
export function loadContent(read) {
  const context = createContext({});
  for (const file of dataFiles) runInContext(read(file), context, { filename: file, timeout: 1000 });
  return JSON.parse(runInContext('JSON.stringify({cards:CARDS, quiz:QUIZ_QUESTIONS, simulators:SIMULATORS, cheatsheet:CHEATSHEET_ROWS})', context, { timeout: 1000 }));
}

// data/plan.js is optional: older commits do not have it. Returns null when absent.
export function loadPlan(read) {
  let source;
  try { source = read(planFile); } catch { return null; }
  const context = createContext({});
  runInContext(source, context, { filename: planFile, timeout: 1000 });
  return JSON.parse(runInContext('JSON.stringify(PLAN)', context, { timeout: 1000 }));
}

// data/practice.js is optional as well. Returns null when absent.
export function loadPractice(read) {
  let source;
  try { source = read(practiceFile); } catch { return null; }
  const context = createContext({});
  runInContext(source, context, { filename: practiceFile, timeout: 1000 });
  return JSON.parse(runInContext('JSON.stringify(PRACTICE)', context, { timeout: 1000 }));
}

export function planTaskIds(plan) {
  return (plan?.weeks || []).flatMap(week => (week?.days || []).flatMap(day => (day?.tasks || []).map(task => task?.id)));
}

export function validatePlan(plan, data, practice = null) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  require(isObject(plan) && Array.isArray(plan.weeks) && plan.weeks.length > 0, 'plan: expected PLAN.weeks');
  if (errors.length) return errors;
  for (const key of ['leetcodeIndex', 'talks', 'acceptance']) require(plan[key] === undefined || isObject(plan[key]), `plan: ${key} must be an object`);
  if (errors.length) return errors;
  const site = { c: new Set(data.cards.map(c => c.id)), q: new Set(data.quiz.map(q => q.id)), sim: new Set(data.simulators.map(s => s.id)), p: new Set((practice || []).map(p => p?.id)) };
  const siteHas = id => text(id) && (id.startsWith('sim') ? site.sim : id.startsWith('p-') ? site.p : id.startsWith('c') ? site.c : id.startsWith('q') ? site.q : new Set()).has(id);
  const weekIds = new Set(), taskIds = new Set();
  plan.weeks.forEach((week, w) => {
    const label = `plan.weeks[${w}]`;
    if (!isObject(week)) { errors.push(`${label}: expected object`); return; }
    require(text(week.id) && !weekIds.has(week.id), `${label}: missing or duplicate week ID ${week.id}`);
    weekIds.add(week.id);
    fields(week, ['title', 'goal', 'done'], `${label}`);
    require(Array.isArray(week.days) && week.days.length > 0, `${label}: missing days`);
    (Array.isArray(week.days) ? week.days : []).forEach((day, d) => {
      const dayLabel = `${label}.days[${d}]`;
      if (!isObject(day) || !Array.isArray(day.tasks) || !day.tasks.length) { errors.push(`${dayLabel}: expected tasks`); return; }
      require(text(day.label), `${dayLabel}: missing label`);
      for (const task of day.tasks) {
        if (!isObject(task)) { errors.push(`${dayLabel}: expected task object`); continue; }
        require(text(task.id) && !taskIds.has(task.id), `${dayLabel}: missing or duplicate task ID ${task.id}`);
        taskIds.add(task.id);
        require(text(task.text), `${task.id}: missing text`);
        for (const id of task.links || []) require(siteHas(id), `${task.id}: unknown site ID ${id}`);
        for (const ref of task.refs || []) require(text(ref?.t) && /^https:\/\//.test(ref?.u || ''), `${task.id}: reference needs title and https URL`);
        if (task.lc !== undefined) require(Boolean(plan.leetcodeIndex?.[task.lc]), `${task.id}: unknown LeetCode ${task.lc}`);
        if (task.talk !== undefined) require(Boolean(plan.talks?.[task.talk]), `${task.id}: unknown talk ${task.talk}`);
      }
    });
  });
  for (const [id, entry] of Object.entries(plan.acceptance || {})) {
    require(taskIds.has(id), `plan.acceptance: unknown task ID ${id}`);
    require(isObject(entry) && text(entry.accept), `plan.acceptance.${id}: missing accept`);
    if (isObject(entry) && entry.exercise !== undefined) require(text(entry.exercise), `plan.acceptance.${id}: empty exercise`);
  }
  require(plan.modelAnswers === undefined || isObject(plan.modelAnswers), 'plan: modelAnswers must be an object');
  for (const [id, entry] of Object.entries(isObject(plan.modelAnswers) ? plan.modelAnswers : {})) {
    require(taskIds.has(id), `plan.modelAnswers: unknown task ID ${id}`);
    fields(isObject(entry) ? entry : {}, ['hook', 'en'], `plan.modelAnswers.${id}`);
  }
  for (const item of plan.predict || []) fields(item || {}, ['id', 'code', 'output', 'why'], `plan.predict ${item?.id}`);
  return errors;

  function fields(object, keys, label) { keys.forEach(key => require(text(object[key]), `${label}: missing/empty ${key}`)); }
}

// GitHub Pages runs Markdown through Jekyll/Liquid: `{{` or `{%` outside a raw block breaks the build
// (for example Go code like []P{{1}}). Returns file:line entries for such text.
export function liquidHazards(files) {
  const found = [];
  for (const { name, text } of files) {
    const lines = text.split('\n');
    let raw = false;
    lines.forEach((line, index) => {
      let rest = line;
      for (;;) {
        if (raw) {
          const end = rest.search(/\{%-?\s*endraw\s*-?%\}/);
          if (end < 0) return;
          rest = rest.slice(end).replace(/^\{%-?\s*endraw\s*-?%\}/, '');
          raw = false;
        }
        const start = rest.search(/\{%-?\s*raw\s*-?%\}/);
        const head = start < 0 ? rest : rest.slice(0, start);
        if (/\{\{|\{%/.test(head)) { found.push(`${name}:${index + 1}`); return; }
        if (start < 0) return;
        rest = rest.slice(start).replace(/^\{%-?\s*raw\s*-?%\}/, '');
        raw = true;
      }
    });
  }
  return found;
}

// Схема шага: панель или массив панелей с дорожками, слотами и фишками.
export function validateBoard(board, label) {
  const errors = [];
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const panels = Array.isArray(board) ? board : [board];
  if (!panels.length) return [`${label}.board: empty`];
  panels.forEach((panel, p) => {
    const at = `${label}.board[${p}]`;
    // Панель — схема (lanes) или только список (например, вопросы и ответы); пустая панель — ошибка.
    const hasList = isObject(panel) && isObject(panel.list);
    if (!isObject(panel) || (panel.lanes === undefined ? !hasList : !Array.isArray(panel.lanes) || (!panel.lanes.length && !hasList))) { errors.push(`${at}: expected lanes`); return; }
    const lanes = panel.lanes || [];
    if (panel.hl !== undefined && !(Array.isArray(panel.hl) && panel.hl.every(text))) errors.push(`${at}: hl must be a list of IDs`);
    if (panel.hlLabel !== undefined && !text(panel.hlLabel)) errors.push(`${at}: hlLabel must be text`);
    if (panel.hlQuiet !== undefined && typeof panel.hlQuiet !== 'boolean') errors.push(`${at}: hlQuiet must be boolean`);
    if (panel.list !== undefined && !(isObject(panel.list) && Array.isArray(panel.list.items) && panel.list.items.every(text))) errors.push(`${at}: list.items must be text`);
    lanes.forEach((lane, l) => {
      if (!isObject(lane) || !text(lane.title) || !Array.isArray(lane.slots)) { errors.push(`${at}.lanes[${l}]: expected title and slots`); return; }
      lane.slots.forEach((slot, s) => {
        const ok = isObject(slot) && text(slot.label) && Array.isArray(slot.items)
          && slot.items.every(item => text(item) || (isObject(item) && text(item.g)));
        if (!ok) errors.push(`${at}.lanes[${l}].slots[${s}]: expected label and items`);
      });
    });
  });
  return errors;
}

// Practice tasks: text fields, links, and code that must match the verified Go fixtures
// (readFixture returns a file's text, or null when the file does not exist).
export function validatePractice(practice, data, plan, readFixture) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const texts = value => Array.isArray(value) && value.length > 0 && value.every(text);
  if (!Array.isArray(practice) || !practice.length) return ['practice: expected non-empty PRACTICE array'];
  const site = new Set([...data.cards, ...data.quiz, ...data.simulators].map(item => item.id));
  const taskIds = new Set(planTaskIds(plan));
  const ids = new Set();
  practice.forEach((task, i) => {
    if (!task || typeof task !== 'object') { errors.push(`practice[${i}]: expected object`); return; }
    const label = task.id || `practice[${i}]`;
    require(typeof task.id === 'string' && /^p-[a-z0-9-]+$/.test(task.id) && !ids.has(task.id), `${label}: ID must be unique and start with p-`);
    ids.add(task.id);
    for (const key of ['code', 'title', 'titleEN', 'goalRU', 'talkEN']) require(text(task[key]), `${label}: missing/empty ${key}`);
    require(Number.isInteger(task.week) && task.week > 0, `${label}: week must be a positive integer`);
    for (const key of ['contractRU', 'contractEN', 'hints', 'pitfalls', 'followUps']) require(texts(task[key]), `${label}: ${key} must be a non-empty list of texts`);
    require(task.contractRU?.length === task.contractEN?.length, `${label}: contractRU and contractEN differ in length`);
    require(Array.isArray(task.planTasks) && task.planTasks.length > 0, `${label}: planTasks must list plan task IDs`);
    for (const id of task.planTasks || []) require(!plan || taskIds.has(id), `${label}: unknown plan task ${id}`);
    for (const id of task.links || []) require(site.has(id), `${label}: unknown site ID ${id}`);
    for (const ref of task.refs || []) require(text(ref?.t) && /^https:\/\//.test(ref?.u || ''), `${label}: reference needs title and https URL`);
    for (const key of ['setup', 'extraRun']) if (task[key] !== undefined) require(texts(task[key]), `${label}: ${key} must be a non-empty list of commands`);
    if (task.invariantsRU !== undefined) require(texts(task.invariantsRU) && task.invariantsRU.length === 3, `${label}: invariantsRU must be exactly 3 texts`);
    for (const kind of ['starter', 'tests', 'solution']) {
      const file = task.files?.[kind];
      require(file && /^[a-z0-9_]+\.go$/.test(file.name || '') && text(file.code), `${label}: files.${kind} needs a .go name and code`);
    }
    if (task.fixture && readFixture && task.files) {
      const expected = { solution: task.files.solution?.name, tests: task.files.tests?.name, starter: 'starter.go.txt' };
      for (const [kind, name] of Object.entries(expected)) {
        const source = readFixture(`${task.fixture}/${name}`);
        if (source === null) errors.push(`${label}: fixture file ${task.fixture}/${name} is missing`);
        else require(source.replace(/\n+$/, '') === task.files[kind]?.code, `${label}: files.${kind} differs from ${task.fixture}/${name}`);
      }
    }
  });
  return errors;
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
    // Extra diagrams a card links to, each opened at a given step (1-based): [{ simId, step }].
    if (c.extraSims !== undefined) {
      require(Array.isArray(c.extraSims) && c.extraSims.length > 0, `${c.id}: extraSims must be a non-empty list`);
      for (const x of Array.isArray(c.extraSims) ? c.extraSims : []) {
        const sim = data.simulators.find(s => s.id === x?.simId);
        require(sim && x.simId !== c.simId, `${c.id}: extraSims needs another known diagram, got ${x?.simId}`);
        require(sim && Number.isInteger(x.step) && x.step >= 1 && x.step <= sim.steps.length, `${c.id}: extraSims step ${x?.step} out of range`);
      }
    }
    if (c.anchorsEN !== undefined) require(texts(c.anchorsEN) && c.anchorsEN.length >= 3 && c.anchorsEN.length <= 5, `${c.id}: anchorsEN must list 3–5 anchors`);
    if (c.jvmEN !== undefined || c.jvmRU !== undefined) require(text(c.jvmEN) && text(c.jvmRU), `${c.id}: incomplete EN/RU Java comparison`);
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
      if (step.board !== undefined) errors.push(...validateBoard(step.board, label));
      if (step.formula !== undefined) {
        require(typeof step.formula === 'string' && step.formula.trim() && step.formula.length <= 100, `${label}: formula must be a non-empty string of at most 100 characters`);
        require(step.board !== undefined, `${label}: formula is shown inside the board, so the step needs a board`);
      }
      if (step.predict !== undefined) {
        if (!step.predict || typeof step.predict !== 'object') errors.push(`${label}: invalid predict`);
        else fields(step.predict, ['promptEN', 'promptRU'], `${label}.predict`);
        require(step.board !== undefined, `${label}: predict requires a board to reveal`);
      }
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

// data/audio.js: каждая запись ссылается на существующий mp3 в audio/en/; устаревшие (текст изменился) считаются отдельно —
// страница их не показывает, но их стоит перегенерировать.
export function validateAudio(manifest, texts, fileExists) {
  const errors = [];
  let stale = 0;
  const voices = Object.keys(manifest?.voices || {});
  if (!voices.length) errors.push('audio: no voices');
  for (const [key, entry] of Object.entries(manifest?.items || {})) {
    if (!/^[0-9a-f]{8}$/.test(entry?.hash || '')) errors.push(`audio ${key}: bad hash`);
    for (const voice of voices) {
      const file = entry?.[voice];
      if (typeof file !== 'string' || !/^audio\/en\/[\w.-]+\.mp3$/.test(file)) errors.push(`audio ${key}: bad ${voice} file`);
      else if (!fileExists(file)) errors.push(`audio ${key}: missing ${file}`);
    }
    if (!Object.hasOwn(texts, key)) errors.push(`audio ${key}: no such text`);
    else if (textHash(texts[key]) !== entry.hash) stale++;
  }
  return { errors, stale, items: Object.keys(manifest?.items || {}).length };
}

// Тексты, которые можно озвучить: ключ — как в data/audio.js.
export function speakableTexts(data, plan, practice) {
  const out = {};
  for (const card of data.cards) {
    out[`card:${card.id}:short`] = card.shortEN;
    if (card.jvmEN) out[`card:${card.id}:jvm`] = card.jvmEN;
  }
  for (const [id, model] of Object.entries(plan?.modelAnswers || {})) if (model?.en) out[`plan:${id}`] = model.en;
  for (const task of practice || []) if (task.talkEN) out[`practice:${task.id}:talk`] = task.talkEN;
  return out;
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
  const hasPlan = existsSync(resolve(root, planFile));
  const hasPractice = existsSync(resolve(root, practiceFile));
  const scripts = [...dataFiles, 'js/app.js', ...(existsSync(resolve(root, 'data/audio.js')) ? ['data/audio.js', 'js/audio.js'] : []), ...(hasPlan ? [planFile, 'js/plan-view.js'] : []), ...(hasPractice ? [practiceFile, 'js/practice-view.js'] : [])];
  for (const file of scripts) execFileSync(process.execPath, ['--check', resolve(root, file)], { stdio: 'pipe' });
  const data = loadContent(read);
  const errors = validateContent(data);
  const plan = hasPlan ? loadPlan(read) : null;
  const practice = hasPractice ? loadPractice(read) : null;
  if (plan && !errors.length) errors.push(...validatePlan(plan, data, practice));
  if (practice && !errors.length) errors.push(...validatePractice(practice, data, plan, file => existsSync(resolve(root, file)) ? read(file) : null));
  const markdown = execFileSync('git', ['ls-files', '-z', '--', '*.md'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const hazards = liquidHazards(markdown.map(name => ({ name, text: read(name) })));
  if (hazards.length) errors.push(`markdown: Liquid syntax outside {% raw %} breaks GitHub Pages: ${hazards.join(', ')}`);
  let audio = null;
  if (existsSync(resolve(root, 'data/audio.js'))) {
    const context = createContext({});
    runInContext(read('data/audio.js'), context, { filename: 'data/audio.js', timeout: 1000 });
    const manifest = JSON.parse(runInContext('JSON.stringify(AUDIO)', context, { timeout: 1000 }));
    audio = validateAudio(manifest, speakableTexts(data, plan, practice), file => existsSync(resolve(root, file)));
    errors.push(...audio.errors);
  }
  let base = null, changes = null;
  if (args.length) {
    const git = argv => execFileSync('git', argv, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    base = git(['rev-parse', '--verify', '--end-of-options', `${args[1]}^{commit}`]).trim();
    changes = changedContent(loadContent(file => git(['show', `${base}:${file}`])), data);
    for (const group of ['cards', 'quiz', 'simulators']) {
      if (changes[group].removed.length) errors.push(`${group}: stable IDs removed: ${changes[group].removed.join(', ')}`);
    }
    // Plan task IDs are progress keys in go_prep_plan_v1; removing one silently drops a saved mark.
    const basePlan = loadPlan(file => git(['show', `${base}:${file}`]));
    if (basePlan) {
      const current = new Set(planTaskIds(plan));
      changes.planRemoved = planTaskIds(basePlan).filter(id => !current.has(id));
      if (changes.planRemoved.length) errors.push(`plan: stable task IDs removed: ${changes.planRemoved.join(', ')}`);
    }
    const basePractice = loadPractice(file => git(['show', `${base}:${file}`]));
    if (basePractice) {
      const current = new Set((practice || []).map(task => task.id));
      changes.practiceRemoved = basePractice.map(task => task.id).filter(id => !current.has(id));
      if (changes.practiceRemoved.length) errors.push(`practice: stable IDs removed: ${changes.practiceRemoved.join(', ')}`);
    }
  }
  console.log(JSON.stringify({ ok: errors.length === 0, base, counts: { ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.length])), ...(plan ? { planWeeks: plan.weeks.length, planTasks: planTaskIds(plan).length, planAcceptance: Object.keys(plan.acceptance || {}).length } : {}), ...(practice ? { practiceTasks: practice.length } : {}), ...(audio ? { audioItems: audio.items, audioStale: audio.stale } : {}) }, changes, errors, durationMs: Math.round(performance.now() - started), scope: 'Syntax and structural checks only; not Go correctness, translation equivalence, UI or automatic review completion.' }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
