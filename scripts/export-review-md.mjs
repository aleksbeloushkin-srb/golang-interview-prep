#!/usr/bin/env node
// Plain Markdown export of the site content for external reviews (Codex, other AI systems, people).
// Reads data/*.js and writes one readable .md file into exports/ (git-ignored), so nothing lands on the site.
//
//   node scripts/export-review-md.mjs                         everything
//   node scripts/export-review-md.mjs cards sims              chosen sections: links cards sims cheatsheet quiz plan practice
//   node scripts/export-review-md.mjs cards --mod=m3          cards of module 3 only
//   node scripts/export-review-md.mjs cards quiz --only=c12,c15,q10   only these IDs
//   node scripts/export-review-md.mjs sims --from=sim5        diagrams from sim5 on
//   node scripts/export-review-md.mjs plan --week=3           one week of the plan
//   ... --out=exports/my-slice.md                            output path (default: exports/review-<sections>-<date>.md)
//
// On macOS, to copy into a chat: node scripts/export-review-md.mjs sims --from=sim5 --out=exports/s.md && pbcopy < exports/s.md
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SECTIONS = ['links', 'cards', 'sims', 'cheatsheet', 'quiz', 'plan', 'practice'];

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
const chosen = args.filter(a => !a.startsWith('--'));
for (const s of chosen) if (!SECTIONS.includes(s)) { console.error(`unknown section "${s}"; use: ${SECTIONS.join(' ')}`); process.exit(2); }
const want = s => chosen.length === 0 || chosen.includes(s);
const only = flags.only ? new Set(String(flags.only).split(',').map(s => s.trim())) : null;
const keep = id => !only || only.has(id);

const ctx = {};
vm.createContext(ctx);
for (const f of ['data/cards.js', 'data/simulators.js', 'data/quiz.js', 'data/plan.js', 'data/practice.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^const (\w+) =/mg, 'globalThis.$1 ='), ctx);
}
const { CARDS, SIMULATORS, CHEATSHEET_ROWS, QUIZ_QUESTIONS, PLAN, PRACTICE } = ctx;
const version = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/app\.js\?v=(\d+)/) || [])[1] || '?';

// Cheat sheet cells are HTML; turn the few tags used there into Markdown.
const md = s => String(s ?? '')
  .replace(/<code>(.*?)<\/code>/g, '`$1`').replace(/<strong>(.*?)<\/strong>/g, '**$1**').replace(/<[^>]+>/g, '')
  .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
const cell = s => md(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const fence = (code, lang = 'go') => code ? `\n\`\`\`${lang}\n${code}\n\`\`\`\n` : '';
const list = (title, items) => items && items.length ? `\n**${title}**\n${items.map(x => `- ${md(x)}`).join('\n')}\n` : '';
const sources = srcs => srcs && srcs.length ? `\n**Sources:** ${srcs.map(s => `[${s.title}](${s.url})`).join(' · ')}\n` : '';

const out = [];
out.push(`# Go Interview Prep — выгрузка для ревью`);
out.push(`\nСайт v${version}, ${new Date().toISOString().slice(0, 10)}. Карточек ${CARDS.length}, диаграмм ${SIMULATORS.length}, quiz ${QUIZ_QUESTIONS.length}, строк шпаргалки ${CHEATSHEET_ROWS.length}, задач практикума ${PRACTICE.length}, недель плана ${PLAN.weeks.length}.`);
out.push(`Разделы: ${(chosen.length ? chosen : SECTIONS).join(', ')}${flags.mod ? `; модуль ${flags.mod}` : ''}${only ? `; ID ${[...only].join(', ')}` : ''}${flags.from ? `; диаграммы с ${flags.from}` : ''}${flags.week ? `; неделя ${flags.week}` : ''}.`);
out.push(`Сайт: https://aleksbeloushkin-srb.github.io/golang-interview-prep/ · требования к коротким ответам: docs/ANSWER_STYLE_RU.md. Сайт считает текущей версией Go 1.27.3.\n`);

const cards = CARDS.filter(c => keep(c.id) && (!flags.mod || c.mod === flags.mod));

if (want('links')) {
  out.push(`## Связи: карточки, диаграммы, quiz\n`);
  out.push(`| Карточка | Модуль | Уровень | Вопрос | Диаграмма | Ещё диаграммы | Quiz |\n|---|---|---|---|---|---|---|`);
  for (const c of cards) {
    const extra = (c.extraSims || []).map(x => `${x.simId} шаг ${x.step}`).join(', ') || '—';
    const quiz = QUIZ_QUESTIONS.filter(q => (q.cardIds || []).includes(c.id)).map(q => q.id).join(', ') || '—';
    out.push(`| ${c.id} | ${c.mod} | ${c.level} | ${cell(c.qEN)} | ${c.simId || '—'} | ${extra} | ${quiz} |`);
  }
  out.push('');
}

if (want('cards')) {
  out.push(`## Карточки\n`);
  for (const c of cards) {
    out.push(`### ${c.id.toUpperCase()} — ${c.qEN}\n`);
    out.push(`${c.qRU}\n\n${c.modName} · ${c.levelLabel || c.level} · диаграмма: ${c.simId || 'нет'}${(c.extraSims || []).map(x => `, ${x.simId} шаг ${x.step}`).join('')}`);
    out.push(`\n**Short (EN):** ${c.shortEN}\n\n**Коротко (RU):** ${c.shortRU || '—'}`);
    out.push(list('Anchors (EN)', c.anchorsEN));
    if (c.jvmEN) out.push(`**Java/Kotlin (EN):** ${c.jvmEN}\n\n**Java/Kotlin (RU):** ${c.jvmRU}\n`);
    out.push(list('Details (EN)', c.detailsEN));
    out.push(list('Подробнее (RU)', c.detailsRU));
    if (c.practicalRU) out.push(`**На практике:** ${c.practicalRU}\n`);
    out.push(fence(c.code));
    if (c.practice) {
      const p = c.practice;
      out.push(`**Практика (${p.kind}):** ${p.promptEN}\n\n${p.promptRU}`);
      out.push(list('Points (EN)', p.pointsEN));
      out.push(`Follow-up: ${p.followUpEN || '—'}\n`);
    }
    if (c.versionNote) out.push(`**Версии:** ${c.versionNote}\n`);
    out.push(sources(c.sources));
    out.push('---\n');
  }
}

if (want('sims')) {
  out.push(`## Диаграммы\n`);
  const start = flags.from ? Math.max(0, SIMULATORS.findIndex(s => s.id === flags.from)) : 0;
  for (const sim of SIMULATORS.slice(start).filter(s => keep(s.id) || (only && cards.some(c => c.simId === s.id)))) {
    out.push(`### ${sim.id.toUpperCase()} — ${sim.title}\n\n${sim.subtitle}\n\nГлавная карточка: ${sim.cardId}${sim.learningHint ? `\n\n> ${sim.learningHint}` : ''}\n`);
    sim.steps.forEach((st, i) => {
      out.push(`#### Шаг ${i + 1}. ${st.title.replace(/^\d+\.\s*/, '')}\n`);
      if (st.predict) out.push(`**Сначала предскажи (EN):** ${st.predict.promptEN}\n`);
      out.push(`${st.desc}${st.descEN ? `\n\n*EN:* ${st.descEN}` : ''}\n`);
      const panels = Array.isArray(st.board) ? st.board : st.board ? [st.board] : [];
      for (const p of panels) {
        if (p.caption) out.push(`*${md(p.caption)}*`);
        for (const lane of p.lanes || []) {
          const slots = (lane.slots || []).map(s => `${s.label}: ${(s.items || []).map(it => typeof it === 'string' ? it : `${it.g}${it.flag ? ` (${it.flag})` : ''}`).join(', ') || 'пусто'}`).join(' | ');
          out.push(`- **${md(lane.title)}**${lane.state ? ` [${md(lane.state)}]` : ''}: ${md(slots)}${lane.note ? ` — ${md(lane.note)}` : ''}`);
        }
        if (p.list) out.push(`\n**${md(p.list.title || 'Что изменилось')}**${p.list.ordered ? ' (по порядку)' : ''}\n${p.list.items.map((x, j) => `${p.list.ordered ? `${j + 1}.` : '-'} ${md(x)}`).join('\n')}`);
      }
      if (st.check) out.push(`\n**Проверь себя (EN):** ${st.check.promptEN} → ${st.check.answerEN}`);
      out.push('');
    });
    out.push(sources(sim.sources));
    out.push('---\n');
  }
}

if (want('cheatsheet')) {
  out.push(`## Шпаргалка\n\n| Тема | Как работает | Маркеры и границы | Карточка | Диаграмма |\n|---|---|---|---|---|`);
  for (const r of CHEATSHEET_ROWS) if (!only || only.has(r.cardId)) out.push(`| ${cell(r.topic)} | ${cell(r.how)} | ${cell(r.markers)} | ${r.cardId} | ${r.simId || '—'} |`);
  out.push('');
}

if (want('quiz')) {
  out.push(`## Quiz\n`);
  for (const q of QUIZ_QUESTIONS.filter(q => keep(q.id) || (only && (q.cardIds || []).some(id => only.has(id))))) {
    if (flags.mod && !(q.cardIds || []).some(id => cards.some(c => c.id === id))) continue;
    out.push(`### ${q.id.toUpperCase()} — ${q.title}\n\nКарточки: ${(q.cardIds || []).join(', ') || '—'}\n\n${q.ru || ''}${q.en ? `\n\n*EN:* ${q.en}` : ''}`);
    out.push(fence(q.code));
    out.push(q.options.map((o, i) => `${i === q.correct ? '**✓**' : '-'} ${o}`).join('\n'));
    out.push(`\n**Разбор:** ${q.explanationRU}${q.speechEN ? `\n\n**Say it (EN):** ${q.speechEN}` : ''}`);
    if (q.correctedCode) out.push(`\n**Исправленный код:**${fence(q.correctedCode)}`);
    if (q.versionNote) out.push(`**Версии:** ${q.versionNote}\n`);
    out.push(sources(q.sources));
    out.push('---\n');
  }
}

if (want('plan')) {
  out.push(`## План\n`);
  PLAN.weeks.forEach((w, wi) => {
    if (flags.week && Number(flags.week) !== wi + 1) return;
    out.push(`### Неделя ${wi + 1}. ${w.title}\n\n${w.goal || ''}\n`);
    for (const d of w.days) for (const t of d.tasks) {
      if (only && !only.has(t.id)) continue;
      out.push(`- **${t.id}** ${t.text}${t.links && t.links.length ? ` (${t.links.join(', ')})` : ''}${t.optional ? ' — дополнительно' : ''}`);
      const acc = PLAN.acceptance && PLAN.acceptance[t.id];
      if (acc) out.push(`  - Готово, когда: ${acc.accept}`);
      const m = PLAN.modelAnswers && PLAN.modelAnswers[t.id];
      if (m) out.push(`  - Remember: ${m.hook}\n  - Model answer (EN): ${m.en}`);
    }
    out.push('');
  });
}

if (want('practice')) {
  out.push(`## Практикум\n`);
  for (const p of PRACTICE.filter(p => keep(p.id))) {
    out.push(`### ${p.id} — ${p.title} (неделя ${p.week})\n\n${p.goalRU || ''}`);
    out.push(list('Контракт', [].concat(p.contractRU || [])));
    if (p.talkEN) out.push(`\n**Talk (EN):** ${p.talkEN}`);
    out.push(list('Ловушки', p.pitfalls));
    out.push(list('Вопросы', p.followUps));
    out.push('---\n');
  }
}

const tag = chosen.length ? chosen.join('-') : 'all';
const file = path.resolve(ROOT, flags.out ? String(flags.out) : `exports/review-${tag}-${new Date().toISOString().slice(0, 10)}.md`);
fs.mkdirSync(path.dirname(file), { recursive: true });
const text = out.join('\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(file, text);
console.log(`${path.relative(ROOT, file)}: ${text.split('\n').length} lines, ${text.split(/\s+/).length} words, ${Math.round(Buffer.byteLength(text) / 1024)} KiB`);
