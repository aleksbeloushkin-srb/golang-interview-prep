// v96: browser check sets follow the 15-week numbering — task IDs, routes #/plan/wN, DOM ids plan-wN-<day>,
// week chips, practice codes, go-prep packages and «Неделя N» by the maps (weeks 3–14 → 4–15). Reads each set
// from the base commit. Ranges from week 1–2 into week 3+ and counts (cards, quiz, tasks, weeks) are listed for a
// hand edit afterwards.
//   node docs/verification/v96/map-browser-checks.mjs [--dry-run]
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, showBase, idMap, codeMap } from './maps.mjs';

const ids = idMap(), codes = codeMap();
const shift = n => (n >= 3 ? n + 1 : n);
const dir = 'docs/verification/browser';
const report = {}, review = [];
for (const name of readdirSync(join(root, dir)).filter(f => /^check-.*\.js$/.test(f))) {
  let base;
  try { base = showBase(`${dir}/${name}`); } catch { continue; } // new in v96
  const n = {};
  const hit = what => { n[what] = (n[what] || 0) + 1; };
  const t = base
    .replace(/\bw\d+-(?:mon|tue|wed|thu|fri|sat|sun)-\d+\b/g, id => { if (!(id in ids)) return id; if (ids[id] !== id) hit('task IDs'); return ids[id]; })
    .replace(/(#\/plan\/w|plan-w|data-plan-week="w|weekId: 'w|weekId: "w)(\d+)\b/g, (m, p, w) => { if (+w >= 3) hit('routes'); return `${p}${shift(+w)}`; })
    .replace(/(["'])w(\d+)\/(mon|tue|wed|thu|fri|sat|sun)\b/g, (m, q, w, d) => { if (+w >= 3) hit('routes'); return `${q}w${shift(+w)}/${d}`; })
    .replace(/\bW\d+-\d+\b/g, c => { if (!(c in codes)) return c; if (codes[c] !== c) hit('codes'); return codes[c]; })
    .replace(/\bweek(\d+)\b/g, (m, w) => { if (+w >= 3) hit('packages'); return `week${shift(+w)}`; })
    .replace(/([Нн]едел[а-яё]*)(\s)(\d+)(?:([–-])(\d+))?/g, (m, word, sp, a, dash, b) => {
      if (b !== undefined && +a < 3 && +b >= 3) review.push(`${name}: «${m}»`);
      if (+a >= 3) hit('week numbers');
      return `${word}${sp}${shift(+a)}${b === undefined ? '' : `${dash}${shift(+b)}`}`;
    });
  for (const m of t.matchAll(/(Карточки \d+|Quiz \d+|\b72\b|\b55\b|\b26\b|\b14 недель|\b197\b|\b198\b|14 weeks|\b14\b)/g)) review.push(`${name}: ${m[0]}`);
  if (t !== base) {
    report[name] = n;
    if (!process.argv.includes('--dry-run')) writeFileSync(join(root, dir, name), t);
  }
}
console.log(JSON.stringify({ report, review: [...new Set(review)] }, null, 1));
