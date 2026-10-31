import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { loadContent, validateContent, changedContent, loadPlan, validatePlan, planTaskIds, liquidHazards, loadPractice, validatePractice, validateAudio } from './check-content.mjs';
import { toSpeech, textHash } from './speech-text.mjs';

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
  ['unknown extra diagram', d => { d.cards[0].extraSims = [{ simId: 'sim999', step: 1 }]; }, /extraSims needs another known diagram/],
  ['extra diagram step out of range', d => { d.cards[0].extraSims = [{ simId: 'sim9', step: 99 }]; }, /extraSims step 99 out of range/],
  ['correct answer out of range', d => { d.quiz[0].correct = d.quiz[0].options.length; }, /correct index/],
  ['non-integer correct answer', d => { d.quiz[0].correct = 1.5; }, /correct index/],
  ['missing options', d => { delete d.quiz[0].options; }, /invalid options/],
  ['empty translation', d => { d.cards.find(c => c.shortRU).shortRU = ''; }, /EN\/RU explanation/],
  ['too few anchors', d => { d.cards[0].anchorsEN = ['one', 'two']; }, /anchorsEN/],
  ['Java comparison without translation', d => { const c = d.cards.find(x => x.jvmEN); delete c.jvmRU; }, /Java comparison/],
  ['partial practice', d => { delete d.cards.find(c => c.practice).practice.promptRU; }, /promptRU/],
  ['null simulator step', d => { d.simulators[0].steps[0] = null; }, /expected object/],
  ['board without lanes', d => { d.simulators.flatMap(s => s.steps).find(s => s.board).board = [{ lanes: [] }]; }, /expected lanes/],
  ['board panel with neither lanes nor list', d => { d.simulators.flatMap(s => s.steps).find(s => s.board).board = [{ caption: 'x' }]; }, /expected lanes/],
  ['board slot item without id', d => { const b = d.simulators.flatMap(s => s.steps).find(s => s.board).board; (Array.isArray(b) ? b[0] : b).lanes[0].slots[0].items = [{ flag: 'x' }]; }, /expected label and items/],
  ['predict without board', d => { const st = d.simulators.flatMap(s => s.steps).find(s => !s.board); st.predict = { promptEN: 'x', promptRU: 'y' }; }, /predict requires a board/],
  ['predict without RU prompt', d => { const st = d.simulators.flatMap(s => s.steps).find(s => s.board); st.predict = { promptEN: 'x' }; }, /promptRU/],
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
const practice = loadPractice(file => readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const readFixture = file => { const url = new URL('../' + file, import.meta.url); return existsSync(url) ? readFileSync(url, 'utf8') : null; };

test('current plan passes structural validation against site data', () => {
  assert.ok(plan, 'data/plan.js should load');
  assert.deepEqual(validatePlan(plan, current, practice), []);
});

test('plan: practice links need data/practice.js', () => {
  assert.match(validatePlan(plan, current).join('\n'), /unknown site ID p-/);
});

test('current practice tasks pass validation and match their Go fixtures', () => {
  assert.ok(practice, 'data/practice.js should load');
  assert.deepEqual(validatePractice(practice, current, plan, readFixture), []);
});

const practiceFailures = [
  ['bad ID', p => { p[0].id = 'workerpool'; }, /start with p-/],
  ['duplicate ID', p => { p[1].id = p[0].id; }, /must be unique/],
  ['unknown plan task', p => { p[0].planTasks = ['w99-mon-1']; }, /unknown plan task w99-mon-1/],
  ['unknown site link', p => { p[0].links = ['c999']; }, /unknown site ID c999/],
  ['contract translations of different length', p => { p[0].contractEN.pop(); }, /differ in length/],
  ['solution that differs from the fixture', p => { p[0].files.solution.code += '\n// edited'; }, /files.solution differs/],
  ['missing fixture file', p => { p[0].fixture = 'docs/verification/fixtures/practice/nope'; }, /fixture file .* is missing/],
  ['empty setup command', p => { p[0].setup = ['']; }, /setup must be a non-empty list/],
  ['extra commands that are not a list', p => { p[0].extraRun = 'go build'; }, /extraRun must be a non-empty list/],
];
for (const [name, mutate, expected] of practiceFailures) {
  test('practice: rejects ' + name, () => {
    const data = structuredClone(practice);
    mutate(data);
    assert.match(validatePractice(data, current, plan, readFixture).join('\n'), expected);
  });
}

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
    assert.match(validatePlan(data, current, practice).join('\n'), expected);
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

test('speech text reads Go code the way people say it', () => {
  assert.equal(toSpeech('Wrap with fmt.Errorf and %w.'), 'Wrap with F-M-T dot Error-f and percent w.');
  assert.equal(toSpeech('a sentinel like io.EOF, errors.Join (Go 1.20) combines'), 'a sentinel like I-O dot E-O-F, errors dot Join, Go one 20, combines');
  assert.equal(toSpeech('Go rewrites c.Set() to (&c).Set() when'), 'Go rewrites c dot Set to address of c dot Set when');
  assert.equal(toSpeech('returns a nil *MyError, err != nil'), 'returns a nil pointer to My Error, err not equal to nil');
  assert.equal(toSpeech('0, false, "", nil; -5 is "-0.05 EUR"'), '0, false, empty string, nil; minus 5 is minus 0.05 euros');
  assert.equal(toSpeech('like Kotlin’s T?: any pointer'), "like Kotlin's nullable T: any pointer");
  assert.equal(toSpeech('First sentence. Second one.'), 'First sentence. Second one.');
  assert.equal(toSpeech('an element of map[K]Counter or map[string]*Counter'), 'an element of map of K to Counter or map of string to pointer to Counter');
});

test('audio manifest: files must exist, stale entries are counted, unknown keys rejected', () => {
  const manifest = { voices: { michael: {}, heart: {} }, items: {
    'card:c1:short': { hash: textHash('A'), michael: 'audio/en/a-michael-1.mp3', heart: 'audio/en/a-heart-1.mp3' },
    'card:c2:short': { hash: textHash('old'), michael: 'audio/en/b-michael-1.mp3', heart: 'audio/en/b-heart-1.mp3' },
    'card:c9:short': { hash: textHash('X'), michael: 'audio/en/c-michael-1.mp3', heart: 'audio/en/missing.mp3' }
  } };
  const files = new Set(['audio/en/a-michael-1.mp3', 'audio/en/a-heart-1.mp3', 'audio/en/b-michael-1.mp3', 'audio/en/b-heart-1.mp3', 'audio/en/c-michael-1.mp3']);
  const r = validateAudio(manifest, { 'card:c1:short': 'A', 'card:c2:short': 'new' }, f => files.has(f));
  assert.equal(r.stale, 1);
  assert.deepEqual(r.errors, ['audio card:c9:short: missing audio/en/missing.mp3', 'audio card:c9:short: no such text']);
});
