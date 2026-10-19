import { QUESTION_BANK, shuffledQuestions } from './question-bank.js';

export const BANK_VERSION = 'reviewed-140-v1';
export const sessionKey = level => `spot-the-phish:${BANK_VERSION}:${level}`;
export function newSession(level) {
  return { order: shuffledQuestions(level).map(q => q.id), answers: [], cursor: 0, completed: false };
}
export function validSession(value, level) {
  const bank = QUESTION_BANK[level];
  if (!value || !bank || !Array.isArray(value.order) || !Array.isArray(value.answers)) return false;
  const ids = new Set(bank.map(q => q.id));
  if (value.order.length !== bank.length || new Set(value.order).size !== bank.length || value.order.some(id => !ids.has(id))) return false;
  if (!Number.isInteger(value.cursor) || value.cursor < 0 || value.cursor >= bank.length || typeof value.completed !== 'boolean') return false;
  if (value.answers.length < value.cursor || value.answers.length > value.cursor + 1) return false;
  if (value.completed && value.answers.length !== bank.length) return false;
  return value.answers.every((a, i) => a && a.id === value.order[i] && typeof a.choice === 'boolean');
}
export function readSession(level) {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey(level)));
    if (validSession(value, level)) return value;
  } catch { /* A blocked store or stale record must not prevent training. */ }
  return newSession(level);
}
export function answerSession(session, choice) {
  if (session.completed || session.answers[session.cursor] || typeof choice !== 'boolean') return session;
  return { ...session, answers: [...session.answers, { id: session.order[session.cursor], choice }] };
}
export function advanceSession(session) {
  if (session.completed || !session.answers[session.cursor]) return session;
  return session.cursor + 1 === session.order.length
    ? { ...session, completed: true }
    : { ...session, cursor: session.cursor + 1 };
}
