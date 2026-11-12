/* global __dirname */
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');

function load(relative) {
  const filename = path.join(__dirname, '..', relative);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  return module.exports;
}
const data = load('data/demo-cases.ts');
const service = load('lib/attempts-service.ts');

test('all session sizes preserve whole cases, unique IDs and ordered questions', () => {
  for (const size of [5, 10, 25]) {
    const cases = data.selectDemoCases(size);
    assert.equal(cases.length, size);
    assert.equal(new Set(cases.map(c => c.caseId)).size, size);
    for (const c of cases) {
      assert.ok(c.referencia);
      assert.deepEqual(c.questions.map(q => q.numero), [1, 2, 3]);
      for (const q of c.questions) {
        assert.ok(['A', 'B', 'C', 'D'].includes(q.opcion_correcta));
        assert.ok([q.opcion_a, q.opcion_b, q.opcion_c, q.opcion_d].every(Boolean));
      }
    }
  }
});

test('scoring handles correct, incorrect and missing answers', () => {
  const cases = data.selectDemoCases(5);
  const answers = {};
  for (const c of cases) {
    answers[`${c.caseId}:q1`] = 'A';
    answers[`${c.caseId}:q2`] = 'D';
  }
  assert.deepEqual(service.calculateExamScore(cases, answers), {
    totalQuestions: 15, totalCorrect: 5, totalIncorrect: 10, percentage: 33,
  });
});

test('save recalculates score, retains references and isolates identity', async () => {
  const cases = data.selectDemoCases(5);
  const answers = Object.fromEntries(cases.flatMap(c => c.questions.map(q => [`${c.caseId}:${q.questionId}`, q.opcion_correcta])));
  const id = await service.saveExamAttempt({userId:'portfolio-demo',caseIds:cases.map(c=>c.caseId),examSize:5,answers,totalCorrect:0,totalIncorrect:99,percentage:0,caseSnapshots:cases});
  const review = await service.fetchAttemptReview(id, 'portfolio-demo');
  assert.equal(review.attempt.percentage, 100);
  assert.equal(review.attempt.totalCorrect, 15);
  assert.ok(review.cases.every(c => c.referencia && c.questions.every(q => q.isCorrect)));
  assert.equal(await service.fetchAttemptReview(id, 'someone-else'), null);
  await service.deleteUserAttempts('portfolio-demo');
  assert.deepEqual(await service.fetchUserAttempts('portfolio-demo'), []);
});
