#!/usr/bin/env node
// Inventory of Go version mentions in site data: every "go1.N[.M]" and "Go 1.N[.M]" with item and field.
//   node scripts/go-versions.mjs                 counts by version and by kind
//   node scripts/go-versions.mjs --version go1.26.1 [--json out.json]   list the places for one version
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadData(root = ROOT) {
  const ctx = {};
  vm.createContext(ctx);
  for (const f of ['data/cards.js', 'data/quiz.js', 'data/simulators.js', 'data/plan.js', 'data/practice.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^const (\w+) =/mg, 'globalThis.$1 ='), ctx);
  }
  return ctx;
}

export function mentions(ctx) {
  const items = [
    ...ctx.CARDS.map(c => ['card', c.id, c]),
    ...ctx.QUIZ_QUESTIONS.map(q => ['quiz', q.id, q]),
    ...ctx.SIMULATORS.map(s => ['sim', s.id, s]),
    ...ctx.CHEATSHEET_ROWS.map((r, i) => ['cheat', `row${i + 1}`, r]),
    ...ctx.PRACTICE.map(p => ['practice', p.id, p]),
  ];
  const rows = [];
  const walk = (kind, id, field, v) => {
    if (typeof v === 'string') {
      for (const m of v.matchAll(/go1\.\d+(?:\.\d+)?|Go 1\.\d+(?:\.\d+)?/g)) {
        rows.push({ kind, id, field, version: m[0].replace(/^Go /, 'go'), text: v.slice(Math.max(0, m.index - 50), m.index + 60).replace(/\n/g, ' ') });
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(kind, id, `${field}[${i}]`, x));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(kind, id, field ? `${field}.${k}` : k, x);
  };
  for (const [kind, id, obj] of items) walk(kind, id, '', obj);
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const rows = mentions(loadData());
  const want = args.includes('--version') ? args[args.indexOf('--version') + 1] : null;
  if (!want) {
    const count = key => rows.reduce((acc, r) => ({ ...acc, [key(r)]: (acc[key(r)] || 0) + 1 }), {});
    console.log(`mentions: ${rows.length}`);
    console.log('by minor version:', JSON.stringify(count(r => r.version.replace(/^(go1\.\d+).*/, '$1'))));
    console.log('exact go1.N.M:', JSON.stringify(count(r => (/^go1\.\d+\.\d+$/.test(r.version) ? r.version : 'other'))));
  } else {
    const list = rows.filter(r => r.version === want || r.version.startsWith(want + '.'));
    if (args.includes('--json')) fs.writeFileSync(args[args.indexOf('--json') + 1], JSON.stringify(list, null, 1));
    const items = new Set(list.map(r => r.id));
    console.log(`${want}: ${list.length} places in ${items.size} items`);
    for (const r of list) console.log(`${r.kind}\t${r.id}\t${r.field}\t${r.text}`);
  }
}
