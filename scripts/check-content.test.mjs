import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent, validateContent, changedContent, loadPlan, validatePlan, planTaskIds, liquidHazards } from './check-content.mjs';

const current = loadContent(file => readFileSync(new URL('../' + file, import.meta.url), 'utf8'));

test('current repository data passes structural validation', () => {
  assert.deepEqual(validateContent(current), []);
});

const failures = [
  ['duplicate ID', d => { d.cards[1].id = d.cards[0].id; }, /duplicate ID/],
  ['missing collection', d => { delete d.quiz; }, /quiz: expected/],
  ['sparse row serialized as null', d => { d.cheatsheet.push(null); }, /cheatsheet: expected object/],
  ['broken card link', d => { d.quiz[0].cardIds = ['c999']; }, /unknown cards ID/],
  ['broken simulator link', d => { d.cards[0].simId = 'sim999'; }, /unknown simulators ID/],
  ['correct answer out of range', d => { d.quiz[0].correct = d.quiz[0].options.length; }, /correct index/],
  ['non-integer correct answer', d => { d.quiz[0].correct = 1.5; }, /correct index/],
  ['missing options', d => { delete d.quiz[0].options; }, /invalid options/],
  ['empty translation', d => { d.cards.find(c => c.shortRU).shortRU = ''; }, /EN\/RU explanation/],
  ['partial practice', d => { delete d.cards.find(c => c.practice).practice.promptRU; }, /promptRU/],
  ['null simulator step', d => { d.simulators[0].steps[0] = null; }, /expected object/],
  ['partial step answer', d => { delete d.simulators.flatMap(s => s.steps).find(s => s.check).check.answerEN; }, /answerEN/],
];
for (const [name, mutate, expected] of failures) {
  test('rejects ' + name, () => {
    const data = structuredClone(current);
    mutate(data);
    assert.match(validateContent(data).join('\n'), expected);
  });
}

test('diff reports updates, additions, removals and order changes', () => {
  const data = structuredClone(current);
  data.cards[0].shortEN += ' Updated.';
  const removed = data.quiz.pop().id;
  data.quiz.push({ ...data.quiz[0], id: 'q999' });
  data.simulators.reverse();
  data.cheatsheet[0].how += ' Updated.';
  const diff = changedContent(current, data);
  assert.deepEqual(diff.cards.changed, [data.cards[0].id]);
  assert.deepEqual(diff.quiz.changed, ['q999']);
  assert.deepEqual(diff.quiz.removed, [removed]);
  assert.equal(diff.simulators.orderChanged, true);
  assert.deepEqual(diff.simulators.changed, []);
  assert.equal(diff.cheatsheetChanged, true);
});

test('loader fails on invalid JavaScript rather than reporting success', () => {
  assert.throws(() => loadContent(() => 'const = invalid'));
});

const plan = loadPlan(file => readFileSync(new URL('../' + file, import.meta.url), 'utf8'));

test('current plan passes structural validation against site data', () => {
  assert.ok(plan, 'data/plan.js should load');
  assert.deepEqual(validatePlan(plan, current), []);
});

test('missing plan file is optional for older commits', () => {
  assert.equal(loadPlan(() => { throw Error('not in commit'); }), null);
});

const firstTask = p => p.weeks[0].days[0].tasks[0];
const planFailures = [
  ['duplicate task ID', p => { p.weeks[0].days[0].tasks[1].id = firstTask(p).id; }, /duplicate task ID/],
  ['unknown site link', p => { firstTask(p).links = ['c999']; }, /unknown site ID c999/],
  ['unknown quiz link', p => { firstTask(p).links = ['q999']; }, /unknown site ID q999/],
  ['non-https reference', p => { firstTask(p).refs = [{ t: 'x', u: 'http://example.com' }]; }, /https URL/],
  ['unknown LeetCode entry', p => { firstTask(p).lc = 99999; }, /unknown LeetCode/],
  ['unknown talk', p => { firstTask(p).talk = 'nope'; }, /unknown talk/],
  ['acceptance for unknown task', p => { p.acceptance['w99-mon-1'] = { accept: 'x' }; }, /unknown task ID w99-mon-1/],
  ['empty acceptance text', p => { p.acceptance[firstTask(p).id] = { accept: ' ' }; }, /missing accept/],
  ['missing weeks', p => { delete p.weeks; }, /PLAN.weeks/],
  ['model answer for unknown task', p => { p.modelAnswers['w99-mon-1'] = { hook: 'x', en: 'y' }; }, /modelAnswers: unknown task ID w99-mon-1/],
  ['model answer without English text', p => { p.modelAnswers[Object.keys(p.modelAnswers)[0]].en = ''; }, /missing\/empty en/],
];
for (const [name, mutate, expected] of planFailures) {
  test('plan: rejects ' + name, () => {
    const data = structuredClone(plan);
    mutate(data);
    assert.match(validatePlan(data, current).join('\n'), expected);
  });
}

test('plan task IDs are listed in order for progress-compatibility checks', () => {
  const ids = planTaskIds(plan);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids[0], firstTask(plan).id);
});

test('markdown: Liquid hazards are reported outside raw blocks only', () => {
  const files = [
    { name: 'a.md', text: 'Go:\n```go\nps := []P{{1}, {2}}\n```' },
    { name: 'b.md', text: '<!-- {% raw %} -->\nps := []P{{1}, {2}}\n<!-- {% endraw %} -->' },
    { name: 'c.md', text: 'inline {% raw %}{{x}}{% endraw %} then {{y}}' },
    { name: 'd.md', text: 'plain text with { braces }' },
  ];
  assert.deepEqual(liquidHazards(files), ['a.md:3', 'c.md:1']);
});
