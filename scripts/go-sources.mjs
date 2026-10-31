#!/usr/bin/env node
// Registry of Go source facts behind the site's version-sensitive claims: docs/verification/go-sources.json.
// Each entry ties a claim on the site (item + field) to a symbol in the Go tree, so a new Go release can be
// rechecked by symbol instead of being researched again.
//
//   node scripts/go-sources.mjs check <GOROOT>               every symbol still exists in its file
//   node scripts/go-sources.mjs diff <OLD_GOROOT> <NEW_GOROOT> symbols whose definition changed → recheck those facts
//   node scripts/go-sources.mjs md                           regenerate docs/GO_SOURCES_RU.md from the JSON
//
// Entry: { item, field, file, symbol, fact, verified: ["1.24.7", "1.26.1", "1.27.3"], differs: null | "how versions differ" }
// file is relative to GOROOT (e.g. "src/runtime/proc.go"); symbol is a func, method, type, const, var or
// "Type.field"; in .s files an assembly function, in .html a section id (spec, memory model), in .md a heading.
// Never a line number: lines move between releases.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = path.join(ROOT, 'docs/verification/go-sources.json');
const MD = path.join(ROOT, 'docs/GO_SOURCES_RU.md');

export function loadRegistry(file = REGISTRY) {
  const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(entries)) throw Error('go-sources.json: expected an array');
  entries.forEach((e, i) => {
    for (const k of ['item', 'field', 'file', 'symbol', 'fact']) {
      if (typeof e[k] !== 'string' || !e[k].trim()) throw Error(`go-sources.json[${i}]: missing ${k}`);
    }
    if (!Array.isArray(e.verified) || !e.verified.length) throw Error(`go-sources.json[${i}]: missing verified versions`);
  });
  return entries;
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Text of a declaration, or null. The file extension picks the syntax:
//   .go       funcs and methods, types, consts/vars (also inside grouped blocks), Type.field;
//   .s        every TEXT block of the symbol (runtime·gogo and gogo<> both count) up to the next TEXT/DATA/GLOBL;
//   .html     the section of an element with id="symbol" up to the next heading (spec, memory model);
//   .md       the section under a heading with exactly this text, up to the next heading.
export function definition(src, symbol, file = '.go') {
  if (file.endsWith('.s')) {
    const re = new RegExp(`^TEXT\\s+(?:\\w*·)?${esc(symbol)}(?:<[^>]*>)?\\(SB\\)`, 'gm');
    const parts = [...src.matchAll(re)].map(m => {
      const rest = src.slice(m.index + 1);
      const end = rest.search(/\n(?=TEXT |DATA |GLOBL |#)|\n\n(?=\/\/)/);
      return src.slice(m.index, end === -1 ? undefined : m.index + 1 + end);
    });
    return parts.length ? parts.join('\n') : null;
  }
  if (file.endsWith('.html')) {
    const m = new RegExp(`<h[1-6][^>]*\\bid="${esc(symbol)}"`).exec(src);
    if (!m) return null;
    const end = src.slice(m.index + 1).search(/<h[1-6][\s>]/);
    return src.slice(m.index, end === -1 ? undefined : m.index + 1 + end);
  }
  if (file.endsWith('.md')) {
    const m = new RegExp(`^#+\\s+${esc(symbol)}\\s*$`, 'm').exec(src);
    if (!m) return null;
    const end = src.slice(m.index + 1).search(/\n#+\s/);
    return src.slice(m.index, end === -1 ? undefined : m.index + 1 + end);
  }
  const block = start => {
    const end = src.indexOf('\n}', start);
    return src.slice(start, end === -1 ? undefined : end + 2);
  };
  if (symbol.includes('.')) {
    const [type, field] = symbol.split('.');
    const t = definition(src, type, file);
    if (!t) return null;
    const line = t.split('\n').find(l => new RegExp(`^\\s*${esc(field)}\\b`).test(l));
    return line ? line.trim() : null;
  }
  let m = new RegExp(`^func (\\([^)]*\\)\\s*)?${esc(symbol)}\\b`, 'm').exec(src);
  if (m) return block(m.index);
  m = new RegExp(`^type ${esc(symbol)}\\b`, 'm').exec(src);
  if (m) {
    const line = src.slice(m.index, src.indexOf('\n', m.index));
    return line.trimEnd().endsWith('{') ? block(m.index) : line;
  }
  m = new RegExp(`^(?:const |var |\\t)${esc(symbol)}\\b[^\\n]*`, 'm').exec(src);
  return m ? m[0].trim() : null;
}

function read(goroot, file) {
  try { return fs.readFileSync(path.join(goroot, file), 'utf8'); } catch { return null; }
}

// A symbol that is absent in a version the entry does not list under verified (added later, renamed) is expected.
function check(goroot) {
  const entries = loadRegistry();
  const version = (read(goroot, 'VERSION') || '').split('\n')[0].replace(/^go/, '');
  let missing = 0, expected = 0;
  for (const e of entries) {
    const src = read(goroot, e.file);
    if (src && definition(src, e.symbol, e.file)) continue;
    if (version && !e.verified.includes(version)) { expected++; continue; }
    missing++;
    console.log(`MISSING ${e.item} ${e.file} ${e.symbol} — ${e.fact}`);
  }
  const found = entries.length - missing - expected;
  console.log(`${found}/${entries.length} symbols found in ${goroot}${expected ? `; ${expected} absent as expected (not verified on ${version})` : ''}`);
  return missing ? 1 : 0;
}

function diff(oldRoot, newRoot) {
  const entries = loadRegistry();
  const seen = new Set();
  let changed = 0;
  for (const e of entries) {
    const key = `${e.file}#${e.symbol}`;
    const a = read(oldRoot, e.file), b = read(newRoot, e.file);
    const da = a && definition(a, e.symbol, e.file), db = b && definition(b, e.symbol, e.file);
    if (da === db && da) continue;
    changed++;
    const what = !db ? 'gone' : !da ? 'new' : 'changed';
    if (!seen.has(key)) console.log(`\n${what.toUpperCase()} ${key}`);
    seen.add(key);
    console.log(`  recheck ${e.item} ${e.field}: ${e.fact}`);
  }
  console.log(`\n${changed}/${entries.length} facts to recheck (${oldRoot} → ${newRoot})`);
  return 0;
}

function md() {
  const entries = loadRegistry();
  const byItem = new Map();
  for (const e of entries) byItem.set(e.item, [...(byItem.get(e.item) || []), e]);
  const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  let out = `# Реестр источников Go\n\nСгенерировано из \`docs/verification/go-sources.json\` командой \`node scripts/go-sources.mjs md\`; руками не править. Что это и как обновлять — \`CLAUDE_HANDOFF_RU.md\`, очередь, п. 3.\n\nС выходом новой версии Go: \`node scripts/go-sources.mjs diff <старый GOROOT> <новый GOROOT>\` печатает факты, у которых изменился исходник, — их и сверять.\n\nВсего утверждений: ${entries.length}; элементов сайта: ${byItem.size}.\n`;
  for (const [item, list] of byItem) {
    out += `\n## ${item}\n\n| Поле | Исходник | Символ | Факт | Проверено | Различия |\n|---|---|---|---|---|---|\n`;
    for (const e of list) out += `| ${cell(e.field)} | \`${cell(e.file)}\` | \`${cell(e.symbol)}\` | ${cell(e.fact)} | ${e.verified.join(', ')} | ${cell(e.differs || '—')} |\n`;
  }
  fs.writeFileSync(MD, out);
  console.log(`${MD}: ${entries.length} facts, ${byItem.size} items`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, a, b] = process.argv.slice(2);
  const code = cmd === 'check' && a ? check(a) : cmd === 'diff' && a && b ? diff(a, b) : cmd === 'md' ? md()
    : (console.error('usage: go-sources.mjs check <GOROOT> | diff <OLD> <NEW> | md'), 2);
  process.exit(code);
}
