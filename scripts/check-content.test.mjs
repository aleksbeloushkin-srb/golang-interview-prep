import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent, validateContent, changedContent } from './check-content.mjs';

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
