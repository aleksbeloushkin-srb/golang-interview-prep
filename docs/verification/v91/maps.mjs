// v91: program of 14 weeks — week 1 is stretched over two. Old → new maps for plan task IDs and
// practice codes, built from the base commit (v90), so they do not depend on the working tree.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPlan, loadPractice, planTaskIds } from '../../../scripts/check-content.mjs';

export const BASE = '7d0c60f';
export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const showBase = file => execFileSync('git', ['show', `${BASE}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });

// Tasks that leave week 1 for week 2 get IDs by their new place; w2-tue-1 (Map) moves to Thursday of week 2.
const MOVED = {
  'w1-thu-1': 'w2-mon-1', // errors in depth
  'w1-thu-2': 'w2-tue-1', // defer, panic, recover: c35, q3, q5, q31, q32
  'w1-thu-4': 'w2-tue-2', // W2-2 defer order and W2-3 SafeDiv
  'w1-thu-3': 'w2-tue-3', // 100 Go Mistakes (optional)
  'w1-wed-4': 'w2-wed-1', // LC 347
  'w1-sat-2': 'w2-sat-1', // Go vs Kotlin table
  'w1-sat-3': 'w2-sat-2', // LC 238
  'w1-sat-6': 'w2-sat-4', // self-check of both weeks, with its model answer
  'w1-sat-7': 'w2-sat-5', // Tell me about yourself v0
  'w2-tue-1': 'w2-thu-1'  // Map by the spec
};

// New tasks of v91 (not in the base plan).
export const NEW_TASKS = ['w1-sat-8', 'w1-sat-9', 'w1-sat-10', 'w2-mon-2', 'w2-wed-2', 'w2-wed-3', 'w2-wed-4', 'w2-sat-3'];

// The model answer of w1-wed-3 names *ValidationError: it moves with W2-1 ValidationError, not with Account.
export const MODEL_MOVED = { 'w1-wed-3': 'w2-mon-2' };

export function mapTaskId(id) {
  if (MOVED[id]) return MOVED[id];
  const m = /^w(\d+)-(mon|tue|wed|thu|fri|sat|sun)-(\d+)$/.exec(id);
  if (!m) throw Error(`not a task ID: ${id}`);
  const week = Number(m[1]);
  return week === 1 ? id : `w${week + 1}-${m[2]}-${m[3]}`;
}

// Practice codes: by the week where the task is done and its order there.
const CODE_MOVED = { 'W1-3': 'W2-1', 'W1-4': 'W2-2', 'W1-5': 'W2-3', 'W1-6': 'W1-3' };
export function mapCode(code) {
  if (CODE_MOVED[code]) return CODE_MOVED[code];
  const m = /^W(\d+)-(\d+)$/.exec(code);
  if (!m) throw Error(`not a practice code: ${code}`);
  const week = Number(m[1]);
  return week === 1 ? code : `W${week + 1}-${m[2]}`;
}

export function basePlan() { return loadPlan(showBase); }
export function basePractice() { return loadPractice(showBase); }

export function idMap() {
  return Object.fromEntries(planTaskIds(basePlan()).map(id => [id, mapTaskId(id)]));
}

// Every code used by the base data: practice codes plus W1-6 (method sets, plan only).
export function codeMap() {
  const codes = new Set(['W1-6']);
  for (const task of basePractice()) for (const code of task.code.split(/,\s*/)) codes.add(code);
  return Object.fromEntries([...codes].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map(c => [c, mapCode(c)]));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const ids = idMap();
  const changed = Object.entries(ids).filter(([a, b]) => a !== b);
  console.log(JSON.stringify({ base: BASE, tasks: Object.keys(ids).length, changed: changed.length, kept: Object.keys(ids).length - changed.length, newTasks: NEW_TASKS, codes: codeMap() }, null, 2));
  const targets = Object.values(ids);
  if (new Set(targets).size !== targets.length) throw Error('ID map is not one-to-one');
  for (const id of NEW_TASKS) if (targets.includes(id)) throw Error(`new task ${id} collides with a mapped ID`);
}
