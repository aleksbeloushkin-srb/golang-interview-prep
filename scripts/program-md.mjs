// Builds PROGRAM_14_WEEKS_RU.md — the program as one Markdown file — from data/plan.js and the materials it links to.
//   node scripts/program-md.mjs            # writes the file
//   node scripts/program-md.mjs --stdout   # prints it
import { readFileSync, writeFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const OUT = 'PROGRAM_14_WEEKS_RU.md';
const SITE = 'https://aleksbeloushkin-srb.github.io/golang-interview-prep/';
const context = createContext({});
for (const file of ['data/cards.js', 'data/quiz.js', 'data/simulators.js', 'data/plan.js', 'data/practice.js', 'data/guides.js', 'data/tracks.js']) {
  runInContext(readFileSync(root + file, 'utf8'), context, { filename: file });
}
const { CARDS, QUIZ_QUESTIONS, SIMULATORS, PLAN, PRACTICE, GUIDE_LINKS, TRACKS } = runInContext('({ CARDS, QUIZ_QUESTIONS, SIMULATORS, PLAN, PRACTICE, GUIDE_LINKS, TRACKS })', context);

const DAY_OFFSET = { 'Пн': 0, 'Вт': 1, 'Ср': 2, 'Чт': 3, 'Пт': 4, 'Сб': 5, 'Вс': 6 };
const date = (weekIndex, offset) => {
  const [y, m, d] = PLAN.defaultStart.split('-').map(Number);
  const at = new Date(y, m - 1, d + weekIndex * 7 + offset);
  return `${String(at.getDate()).padStart(2, '0')}.${String(at.getMonth() + 1).padStart(2, '0')}`;
};
const weekDates = i => `${date(i, 0)}–${date(i, 6)}`;
const leetcodeUrl = n => `https://leetcode.com/problems/${PLAN.leetcodeIndex[n].slug}/`;

function kata(id) {
  for (const [trackId, track] of Object.entries(TRACKS)) {
    for (const block of track.blocks) {
      if (block.id === id) return { trackId, block, step: null };
      const step = block.steps.find(s => s.id === id);
      if (step) return { trackId, block, step };
    }
  }
  return null;
}

// A site link: short label for a task line, long label for the week's material list.
function siteItem(id) {
  if (/^k\d/.test(id)) {
    const found = kata(id);
    const url = `${SITE}#/practice/${found.trackId}/${id}`;
    return found.step
      ? { short: found.step.label, long: `Ката ${found.step.label} · ${found.step.title.replace(/`/g, '')}`, url }
      : { short: found.block.title, long: `Трек: ${found.block.title}`, url };
  }
  if (id.startsWith('g-')) {
    const link = GUIDE_LINKS[id];
    return { short: `Справка: ${link.label}`, long: `Справка: ${link.label}`, url: `${SITE}#/practice/${link.guide}${link.section ? `/${link.section}` : ''}` };
  }
  if (id.startsWith('sim')) {
    const sim = SIMULATORS.find(s => s.id === id);
    return { short: id.toUpperCase(), long: `${id.toUpperCase()} ${sim.title}`, url: `${SITE}#/simulators/${id}` };
  }
  if (id.startsWith('p-')) {
    const task = PRACTICE.find(p => p.id === id);
    return { short: task.code, long: `Практикум ${task.code} ${task.title}`, url: `${SITE}#/practice/${id}` };
  }
  if (id.startsWith('c')) {
    const card = CARDS.find(c => c.id === id);
    return { short: id.toUpperCase(), long: `${id.toUpperCase()} ${card.qEN.replace(/^Q\d+:\s*/, '')}`, url: `${SITE}#/cards/${id}`, deep: card.level === 'deep', unreviewed: !(card.sources && card.sources.length) };
  }
  const quiz = QUIZ_QUESTIONS.find(q => q.id === id);
  return { short: id.toUpperCase(), long: `${id.toUpperCase()} ${quiz.title.replace(/^Задача \d+:\s*/, '')}`, url: `${SITE}#/quiz/${id}`, unreviewed: !(quiz.sources && quiz.sources.length) };
}

function kataDoneWhen(task) {
  const katas = (task.links || []).filter(id => /^k\d+-/.test(id));
  return katas.length === 1 ? kata(katas[0]).step.doneWhen : '';
}

function taskLines(task) {
  const parts = [
    ...(task.links || []).map(id => { const item = siteItem(id); return `[${item.short}](${item.url})`; }),
    ...(task.lc ? [`[LC ${task.lc}. ${PLAN.leetcodeIndex[task.lc].title}](${leetcodeUrl(task.lc)})`] : []),
    ...(task.refs || []).map(ref => `[${ref.t}](${ref.u})`),
    ...(task.talk ? [`проговор: «${PLAN.talks[task.talk].title}»`] : [])
  ];
  const lines = [`- [ ] ${task.text}${task.optional ? ' *(по желанию)*' : ''}${parts.length ? ` — ${parts.join(', ')}` : ''}`];
  const entry = PLAN.acceptance[task.id];
  const accept = entry ? entry.accept : (!task.lc && kataDoneWhen(task));
  if (accept) lines.push(`  - Готово, когда: ${accept}`);
  if (entry && entry.exercise) lines.push(`  - На сайте пока нет: ${entry.exercise}`);
  return lines;
}

function week(w, i) {
  const out = [`## Неделя ${i + 1}. ${w.title} (${weekDates(i)})`, '', `**Цель:** ${w.goal}`, '', `**Готово, когда:** ${w.done}`, ''];
  for (const day of w.days) {
    out.push(`### ${day.label} · ${day.minutes} мин`, '');
    for (const task of day.tasks) out.push(...taskLines(task));
    out.push('');
  }
  if (w.leetcode?.length) out.push(`**LeetCode недели:** ${w.leetcode.map(n => `[${n}. ${PLAN.leetcodeIndex[n].title}](${leetcodeUrl(n)}) (${PLAN.leetcodeIndex[n].pattern})`).join(', ')}`, '');
  if (w.english?.length) out.push('**Проговорить по-английски:**', '', ...w.english.map(q => `- *${q}*`), '');
  if (w.selfCheck?.length) out.push('**Самопроверка:**', '', ...w.selfCheck.map(q => `- ${q}`), '');
  const ids = [...new Set(w.days.flatMap(d => d.tasks.flatMap(t => t.links || [])))];
  if (ids.length) {
    out.push('**Материал сайта:**', '', ...ids.map(id => {
      const item = siteItem(id);
      return `- [${item.long}](${item.url})${item.deep ? ' *(Deep Dive)*' : ''}${item.unreviewed ? ' *(на редакции)*' : ''}`;
    }), '');
  }
  if (w.gaps?.length) out.push('**Чего пока нет на сайте:**', '', ...w.gaps.map(g => `- ${g}`), '');
  return out;
}

function talk(t) {
  const out = [`### ${t.title}`, ''];
  if (t.dialog) out.push(t.dialog.map(([who, line]) => `> **${who}:** ${line}`).join('\n>\n'), '');
  const steps = [['Clarify', t.clarify], ['Approach', t.approach], ['Complexity', t.complexity], ['Edge cases & tests', t.edge], ['Follow-up', t.followUp]].filter(([, text]) => text);
  if (steps.length) out.push(...steps.map(([label, text]) => `- **${label}:** ${text}`), '');
  if (t.lines) out.push(...t.lines.map(line => `- ${line}`), '');
  return out;
}

const tasks = new Map(PLAN.weeks.flatMap(w => w.days.flatMap(d => d.tasks)).map(t => [t.id, t]));
const weekOf = id => PLAN.weeks.findIndex(w => w.days.some(d => d.tasks.some(t => t.id === id))) + 1;
const modelIds = Object.keys(PLAN.modelAnswers).sort((a, b) => weekOf(a) - weekOf(b));
const modelWeeks = [...new Set(modelIds.map(weekOf))];
const predictWeek = PLAN.weeks.findIndex(w => w.id === 'w3') + 1;

const lines = [
  `# Программа подготовки к интервью Senior Go: ${PLAN.weeks.length} недель`,
  '',
  '<!-- GitHub Pages (Jekyll/Liquid) не должен разбирать фигурные скобки в Go-коде этого файла. --> <!-- {% raw %} -->',
  '',
  `Цель: ${PLAN.target}. Старт ${date(0, 0)}.${PLAN.defaultStart.slice(0, 4)}, ~${PLAN.hoursPerWeek} ч в неделю: 4 вечера по 1,5 ч и 4 ч в субботу; пятница и воскресенье — резерв (в неделях с рабочей пятницей резерв — воскресенье). Бюджет — ориентир, а не обещание; внешний результат (оффер) план не гарантирует.`,
  '',
  'Пометки: *(по желанию)* — не входит в обязательный объём недели; *(на редакции)* — у материала сайта нет списка источников; *(Deep Dive)* — глубина рантайма, не обязательна для интервью. Опорные английские тексты — редакционные наброски, по рубрике не проверены.',
  '',
  'Дату старта можно менять на сайте: «Я начал на этой неделе», сдвиг на неделю, «Сейчас я на неделе N», сброс; неделя всегда начинается в понедельник. Даты ниже — для старта по умолчанию.',
  '',
  `«Готово, когда» — самостоятельная попытка до ответа и перенос на изменённое условие; у каты — критерий из трека; «На сайте пока нет» — упражнение, которое ещё предстоит добавить. Задачи LeetCode без своего критерия: ${PLAN.lcAccept}`,
  '',
  `Этот файл сгенерирован \`node scripts/program-md.mjs\` из \`data/plan.js\` — источника данных раздела [«План ${PLAN.weeks.length} недель»](${SITE}#/plan) на сайте. Правки вносить в \`data/plan.js\`, затем пересобрать файл. Ревизия программы: ${PLAN.revision}.`,
  '',
  '## Фазы',
  '',
  '| Фаза | Недели |',
  '| --- | --- |',
  ...PLAN.phases.map(p => `| ${p.title} | ${p.weeks.join(', ')} |`),
  '',
  '## Обзор',
  '',
  '| Нед. | Даты | Тема | Готово, когда |',
  '| --- | --- | --- | --- |',
  ...PLAN.weeks.map((w, i) => `| ${i + 1} | ${weekDates(i)} | ${w.title} | ${w.done} |`),
  '',
  '## Как проговаривать задачи по-английски',
  '',
  ...PLAN.talkSteps.map((s, i) => `${i + 1}. **${s.en}** — ${s.ru}. *${s.phrase}*`),
  '',
  `Если завис: ${PLAN.stuckPhrases.map(p => `*${p}*`).join(' · ')}`,
  '',
  ...PLAN.weeks.flatMap(week),
  '## Опорные тексты для проговора',
  '',
  ...Object.values(PLAN.talks).flatMap(talk),
  `## Образцы ответов на английском (недели ${modelWeeks.join(', ')})`,
  '',
  'Открывать после своей попытки вслух. *Remember* — одна строка для запоминания; ниже — короткий ответ для интервью. Сверять смысл, а не заучивать дословно.',
  '',
  ...modelIds.flatMap(id => [
    `**${id}** (неделя ${weekOf(id)}) — ${tasks.get(id).text}`,
    '',
    '<details><summary>Model answer (EN)</summary>',
    '',
    `*Remember:* ${PLAN.modelAnswers[id].hook}`,
    '',
    PLAN.modelAnswers[id].en,
    '',
    '</details>',
    ''
  ]),
  `## «Что выведет код» (неделя ${predictWeek})`,
  '',
  ...PLAN.predict.flatMap(p => [
    `**${p.id.toUpperCase()}**`,
    '',
    '```go',
    p.code,
    '```',
    '',
    '<details><summary>Ответ</summary>',
    '',
    `\`${p.output}\` — ${p.why}`,
    '',
    ...(p.whyRU ? [p.whyRU, ''] : []),
    ...(p.version ? [`*Версия:* ${p.version}.`, ''] : []),
    '</details>',
    ''
  ]),
  '<!-- {% endraw %} -->',
  ''
];

const text = lines.join('\n');
if (process.argv.includes('--stdout')) process.stdout.write(text);
else {
  writeFileSync(root + OUT, text);
  console.log(`${OUT}: ${lines.length} lines, ${PLAN.weeks.length} weeks, ${tasks.size} tasks`);
}
