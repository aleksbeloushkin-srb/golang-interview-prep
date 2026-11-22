// v96: program of 15 weeks — a new week 3 «Биты и закрепление» is inserted, the old weeks 3–14 become 4–15.
// Old → new maps for plan task IDs and practice codes, built from the base commit (v95), so they do not depend
// on the working tree.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPlan, loadPractice, planTaskIds } from '../../../scripts/check-content.mjs';

export const BASE = '0468fd9';
export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const showBase = file => execFileSync('git', ['show', `${BASE}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });

// The bits task with diagram 9 stays in week 3: it becomes part of the new week.
export const STAYS = new Set(['w3-tue-5']);

export function mapTaskId(id) {
  const m = /^w(\d+)-(mon|tue|wed|thu|fri|sat|sun)-(\d+)$/.exec(id);
  if (!m) throw Error(`not a task ID: ${id}`);
  const week = Number(m[1]);
  return week < 3 || STAYS.has(id) ? id : `w${week + 1}-${m[2]}-${m[3]}`;
}

export function mapCode(code) {
  const m = /^W(\d+)-(\d+)$/.exec(code);
  if (!m) throw Error(`not a practice code: ${code}`);
  const week = Number(m[1]);
  return week < 3 ? code : `W${week + 1}-${m[2]}`;
}

export function basePlan() { return loadPlan(showBase); }
export function basePractice() { return loadPractice(showBase); }

export function idMap() {
  return Object.fromEntries(planTaskIds(basePlan()).map(id => [id, mapTaskId(id)]));
}

export function codeMap() {
  const codes = new Set(['W1-3']); // W1-3 method sets: a plan task with a talk, no practice task
  for (const task of basePractice()) for (const code of task.code.split(/,\s*/)) codes.add(code);
  return Object.fromEntries([...codes].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map(c => [c, mapCode(c)]));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const ids = idMap();
  const changed = Object.entries(ids).filter(([a, b]) => a !== b);
  console.log(JSON.stringify({ base: BASE, tasks: Object.keys(ids).length, changed: changed.length, kept: Object.keys(ids).length - changed.length, codes: codeMap() }, null, 2));
  const targets = Object.values(ids);
  if (new Set(targets).size !== targets.length) throw Error('ID map is not one-to-one');
}
