import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_BANK, shuffledQuestions } from '../src/question-bank.js';
import { TOPICS, INCIDENTS } from '../src/learning-content.js';
import { newSession, validSession, answerSession, advanceSession, readSession } from '../src/training-state.js';
import { WAR_ROOM_CATEGORIES, WAR_ROOM_TOTAL } from '../src/war-room-data.js';

test('exact counts and no duplicate scenarios across levels', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(QUESTION_BANK).map(([k, v]) => [k, v.length])), { easy: 20, hard: 40, veryHard: 80 });
  const all = Object.values(QUESTION_BANK).flat();
  for (const field of ['id', 'subject', 'body', 'context']) assert.equal(new Set(all.map(q => q[field].trim().toLowerCase())).size, 140, field);
  for (const q of all) {
    assert.equal(typeof q.isPhishing, 'boolean');
    for (const field of ['from', 'subject', 'body', 'context', 'explanation']) assert.ok(q[field].length > 10, `${q.id}: ${field}`);
  }
});

test('shuffling preserves the complete bank without replacements', () => {
  for (const [level, bank] of Object.entries(QUESTION_BANK)) {
    const original = bank.map(q => q.id);
    for (let i = 0; i < 10; i++) assert.deepEqual(shuffledQuestions(level).map(q => q.id).sort(), [...original].sort());
    assert.deepEqual(bank.map(q => q.id), original);
  }
});

for (const level of Object.keys(QUESTION_BANK)) {
  test(`${level}: complete the level, reject double answers and restore saved progress`, () => {
    let state = newSession(level);
    assert.equal(advanceSession(state), state);
    for (let i = 0; i < QUESTION_BANK[level].length; i++) {
      assert.equal(state.cursor, i);
      const current = QUESTION_BANK[level].find(q => q.id === state.order[i]);
      state = answerSession(state, current.isPhishing);
      assert.equal(answerSession(state, !current.isPhishing), state);
      state = JSON.parse(JSON.stringify(state));
      assert.ok(validSession(state, level));
      state = advanceSession(state);
      assert.ok(validSession(state, level));
    }
    assert.equal(state.completed, true);
    assert.equal(state.answers.length, QUESTION_BANK[level].length);
    assert.equal(new Set(state.answers.map(a => a.id)).size, QUESTION_BANK[level].length);
    assert.equal(advanceSession(state), state);
    assert.equal(answerSession(state, false), state);
  });
}

test('reject stale and corrupt saved sessions', () => {
  const good = newSession('easy');
  assert.ok(validSession(good, 'easy'));
  assert.equal(validSession(good, 'hard'), false);
  assert.equal(validSession({ ...good, order: Array(20).fill(good.order[0]) }, 'easy'), false);
  assert.equal(validSession({ ...good, cursor: 20 }, 'easy'), false);
  assert.equal(validSession({ ...good, completed: true }, 'easy'), false);
  assert.equal(validSession({ ...good, answers: [{ id: 'missing', choice: true }] }, 'easy'), false);
  assert.equal(validSession(null, 'easy'), false);
});

test('blocked browser storage falls back to a complete new attempt', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  try { assert.ok(validSession(readSession('veryHard'), 'veryHard')); }
  finally { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else delete globalThis.localStorage; }
});

test('detailed notes, three examples per subtopic and sourced history for both regions', () => {
  assert.equal(TOPICS.length, 12);
  assert.equal(TOPICS.flatMap(t => t.sections).length, 36);
  assert.equal(TOPICS.flatMap(t => t.sections).flatMap(s => s.examples).length, 108);
  for (const topic of TOPICS) for (const s of topic.sections) {
    assert.ok(s.explanation.split(/\s+/).length >= 55, s.title);
    assert.equal(s.examples.length, 3);
    assert.ok(s.action.length > 30);
  }
  assert.equal(INCIDENTS.filter(i => i.region === 'Nigeria').length, 3);
  assert.equal(INCIDENTS.filter(i => i.region === 'International').length, 4);
  for (const i of INCIDENTS) {
    assert.ok(i.url.startsWith('https://'));
    for (const f of ['account', 'impact', 'lesson', 'reflection', 'date', 'source']) assert.ok(i[f]);
  }
});

test('War Room has 200 distinct defensive missions per category', () => {
  assert.equal(WAR_ROOM_CATEGORIES.length, 8);
  assert.equal(WAR_ROOM_TOTAL, 1600);
  for (const category of WAR_ROOM_CATEGORIES) {
    assert.equal(category.scenarios.length, 200, category.label);
    assert.equal(new Set(category.scenarios.map(s => s.id)).size, 200, `${category.label} ids`);
    assert.equal(new Set(category.scenarios.map(s => s.title)).size, 200, `${category.label} titles`);
    assert.deepEqual(new Set(category.scenarios.map(s => s.difficulty)), new Set(['Guided', 'Investigative', 'Strategic']));
    for (const scenario of category.scenarios) {
      assert.equal(scenario.isAttacker, false);
      assert.ok(scenario.actions.length >= 4);
      assert.ok(scenario.actions.filter(a => a.correct).length >= scenario.minCorrect);
    }
  }
});
