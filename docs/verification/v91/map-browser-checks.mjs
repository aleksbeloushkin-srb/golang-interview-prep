// v91: browser check sets follow the 14-week numbering — task IDs, routes #/plan/wN, DOM ids plan-wN-<day>,
// week chips, practice codes, go-prep packages and «Неделя N» by the maps. Reads each set from the base commit.
// Sets whose subject is week 1–2 itself are edited by hand afterwards (see the v91 journal entry).
//   node docs/verification/v91/map-browser-checks.mjs [--dry-run]
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, showBase, idMap, codeMap } from './maps.mjs';

const ids = idMap(), codes = codeMap();
const shift = n => (n >= 2 ? n + 1 : n);
const dir = 'docs/verification/browser';
const report = {};
for (const name of readdirSync(join(root, dir)).filter(f => /^check-.*\.js$/.test(f))) {
  let base;
  try { base = showBase(`${dir}/${name}`); } catch { continue; } // new in v91
  const n = {};
  const hit = what => { n[what] = (n[what] || 0) + 1; };
  const t = base
    .replace(/\bw\d+-(?:mon|tue|wed|thu|fri|sat|sun)-\d+\b/g, id => { if (!(id in ids)) return id; if (ids[id] !== id) hit('task IDs'); return ids[id]; })
    .replace(/(#\/plan\/w|plan-w|data-plan-week="w|weekId: 'w|weekId: "w)(\d+)\b/g, (m, p, w) => { if (+w >= 2) hit('routes'); return `${p}${shift(+w)}`; })
    .replace(/(["'])w(\d+)\/(mon|tue|wed|thu|fri|sat|sun)\b/g, (m, q, w, d) => { if (+w >= 2) hit('routes'); return `${q}w${shift(+w)}/${d}`; })
    .replace(/\bW\d+-\d+\b/g, c => { if (!(c in codes)) return c; if (codes[c] !== c) hit('codes'); return codes[c]; })
    .replace(/\bweek(\d+)\b/g, (m, w) => { if (+w >= 2) hit('packages'); return `week${shift(+w)}`; })
    .replace(/([Нн]едел[а-яё]*)(\s)(\d+)(?:([–-])(\d+))?/g, (m, word, sp, a, dash, b) => {
      if (+a >= 2) hit('week numbers');
      return `${word}${sp}${shift(+a)}${b === undefined ? '' : `${dash}${shift(+b)}`}`;
    });
  if (t !== base) {
    report[name] = n;
    if (!process.argv.includes('--dry-run')) writeFileSync(join(root, dir, name), t);
  }
}
console.log(JSON.stringify(report, null, 1));
