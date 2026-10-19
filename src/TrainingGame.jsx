import { useState, useEffect, useRef } from 'react';
import { QUESTION_BANK, LEVELS } from './question-bank.js';
import { readSession, newSession, sessionKey, answerSession, advanceSession } from './training-state.js';
import './learning.css';

export default function TrainingGame({ level, onBack }) {
  const [session, setSession] = useState(() => readSession(level));
  const saveStatus = useRef(null);
  const [review, setReview] = useState('mistakes');
  const heading = useRef(null);
  const info = LEVELS.find(l => l.id === level);
  const levelGuidance = {
    easy: 'Friendly learning mode: read the plain-language message and context. Look for the clear clue, then use the explanation to learn.',
    hard: 'Hard mode: clues are deliberately subtle. Read the full message and known context closely; do not rely on logos, urgency or a familiar name.',
    veryHard: 'Professional mode: assess identity, permissions, trusted-service abuse, scope and independent evidence. Treat it like a real security decision.',
  };
  const bank = QUESTION_BANK[level];
  const questions = new Map(bank.map(q => [q.id, q]));
  const current = questions.get(session.order[session.cursor]);
  const answer = session.answers[session.cursor];
  const score = session.answers.filter(a => a.choice === questions.get(a.id).isPhishing).length;
  const total = bank.length;
  const pct = Math.round(score / total * 100);

  useEffect(() => {
    let message;
    try { localStorage.setItem(sessionKey(level), JSON.stringify(session)); message = 'Progress saved on this browser. You can leave and resume.'; }
    catch { message = 'Progress is available during this visit only; browser storage is unavailable.'; }
    if (saveStatus.current) saveStatus.current.textContent = message;
  }, [session, level]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [session.cursor, session.completed]);

  function next() { setSession(advanceSession); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function restart() { setSession(newSession(level)); window.scrollTo({ top: 0, behavior: 'instant' }); }

  if (session.completed) {
    const shown = session.answers.filter(a => review === 'all' || a.choice !== questions.get(a.id).isPhishing);
    return <main className="academy">
      <header className="academy-heading result-heading"><div className="eyebrow">{info.label} · TRAINING COMPLETE</div><h1 ref={heading} tabIndex={-1}>{pct === 100 ? 'Every scenario solved.' : 'Your review starts here.'}</h1><div className="result-score">{score}<span> / {total}</span></div><p>{pct}% correct. Review the evidence behind each decision, then put it into practice.</p></header>
      <div className="academy-actions"><button className="academy-button" onClick={onBack}>Choose another level</button><button className="academy-button secondary" onClick={restart}>Replay this level</button></div>
      <p className="save-status">Replay deliberately resets this level and reshuffles the same {total} unique scenarios. No question repeats within an attempt.</p>
      <div className="filter-row" role="group" aria-label="Review filter">{[['mistakes', 'Review mistakes'], ['all', 'Review all answers']].map(([id, label]) => <button key={id} className={`academy-button ${review === id ? '' : 'secondary'}`} aria-pressed={review === id} onClick={() => setReview(id)}>{label}</button>)}</div>
      {!shown.length && <div className="takeaway"><strong>No mistakes in this attempt.</strong><p>Choose “Review all answers” to revisit the explanations.</p></div>}
      {shown.map(a => { const q = questions.get(a.id); return <article className="lesson-card" key={a.id}><div className="eyebrow">{a.choice === q.isPhishing ? '✓ Correct' : 'Review this decision'}</div><h2>{q.subject}</h2><p>You chose: <strong>{a.choice ? 'Phishing / scam' : 'Legitimate'}</strong> · Answer: <strong>{q.isPhishing ? 'Phishing / scam' : 'Legitimate'}</strong></p><p className="review-evidence"><strong>Known context:</strong> {q.context}</p><div className="takeaway"><strong>Why this answer</strong><p>{q.explanation}</p></div></article>; })}
      <p className="save-status" role="status" ref={saveStatus}>Saving progress…</p>
    </main>;
  }

  return <main className="academy training">
    <div className="training-top"><button className="academy-button secondary" onClick={onBack}>← Levels</button><span className="level-badge" style={{ color: info.color }}>{info.label}</span><span className="question-count">{session.cursor + 1} / {total}</span></div>
    <header className="training-heading"><div className="eyebrow">{info.label.toUpperCase()} · READ · VERIFY · DECIDE</div><h1 ref={heading} tabIndex={-1}>Would you trust this message?</h1><p>{levelGuidance[level]} The domains and scenarios below are fictional training material.</p></header>
    <div className="training-progress"><span>{session.answers.length} answered</span><span>{score} correct</span></div><progress aria-label="Questions answered" value={session.answers.length} max={total}/>
    <article className="message-card"><div className="message-header"><span className="eyebrow">MESSAGE {session.cursor + 1}</span><p className="message-from"><strong>From / claimed sender:</strong> {current.from}</p><h2>{current.subject}</h2></div><p className="message-body">{current.body}</p></article>
    <section className="evidence-card"><h2>🔎 Known context</h2><p>{current.context}</p></section>
    {!answer ? <div className="answer-buttons"><button className="academy-button danger" onClick={() => setSession(s => answerSession(s, true))}>🎣 Phishing / scam</button><button className="academy-button secondary" onClick={() => setSession(s => answerSession(s, false))}>✓ Legitimate</button></div> : <section className={`answer-feedback ${answer.choice === current.isPhishing ? 'correct' : 'incorrect'}`} aria-live="polite"><h2>{answer.choice === current.isPhishing ? '✓ Correct' : 'Not quite'} — {current.isPhishing ? 'Phishing / scam' : 'Legitimate'}</h2><p>{current.explanation}</p><button className="academy-button" onClick={next}>{session.cursor + 1 === total ? 'See results and review →' : 'Next scenario →'}</button></section>}
    <p className="save-status" role="status" ref={saveStatus}>Saving progress…</p>
  </main>;
}
