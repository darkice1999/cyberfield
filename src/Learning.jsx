import { useState } from 'react';
import { TOPICS, INCIDENTS, READING } from './learning-content.js';
import './learning.css';

function readCompleted() {
  try {
    const value = JSON.parse(localStorage.getItem('spot-the-phish:reading-v1'));
    return Array.isArray(value) ? value.filter(id => TOPICS.some(t => t.id === id)) : [];
  } catch { return []; }
}

export function LearningLibrary() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState(readCompleted);
  const [saveError, setSaveError] = useState(false);
  const topic = TOPICS.find(t => t.id === selected);
  const query = search.toLowerCase().trim();
  const visible = TOPICS.filter(t => JSON.stringify(t).toLowerCase().includes(query));

  function toggleRead(id) {
    const next = completed.includes(id) ? completed.filter(x => x !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem('spot-the-phish:reading-v1', JSON.stringify(next)); setSaveError(false); }
    catch { setSaveError(true); }
  }
  function openTopic(id) { setSelected(id); window.scrollTo({ top: 0, behavior: 'instant' }); }

  if (topic) {
    const next = TOPICS[TOPICS.indexOf(topic) + 1];
    return <main className="academy">
      <button className="academy-button secondary" onClick={() => openTopic(null)}>← All topics</button>
      <header className="academy-heading">
        <div className="eyebrow">{topic.level} · 3 subtopics · 9 examples</div>
        <h1><span aria-hidden="true">{topic.icon}</span> {topic.title}</h1>
        <p>{topic.summary}</p>
      </header>
      <nav className="topic-jumps" aria-label="In this topic">
        {topic.sections.map((s, i) => <a key={s.title} href={`#lesson-${topic.id}-${i}`}>{i + 1}. {s.title}</a>)}
      </nav>
      {topic.sections.map((s, i) => <section className="lesson-card" key={s.title} id={`lesson-${topic.id}-${i}`}>
        <div className="eyebrow">Subtopic {i + 1} / {topic.sections.length}</div>
        <h2>{s.title}</h2>
        <p className="lesson-explanation">{s.explanation}</p>
        <h3>Examples in practice</h3>
        <ol className="example-list">{s.examples.map(ex => <li key={ex}>{ex}</li>)}</ol>
        <div className="takeaway"><strong>Put it into practice</strong><p>{s.action}</p></div>
      </section>)}
      {READING.some(r => r.topics.includes(topic.id)) && <aside className="lesson-card sources">
        <h2>Further reading</h2><p>Use these references to explore the topic beyond the original explanations and fictional examples in this library.</p>
        {READING.filter(r => r.topics.includes(topic.id)).map(r => <a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a>)}
      </aside>}
      <div className="academy-actions">
        <button className="academy-button" aria-pressed={completed.includes(topic.id)} onClick={() => toggleRead(topic.id)}>{completed.includes(topic.id) ? '✓ Topic marked as read' : 'Mark topic as read'}</button>
        {next && <button className="academy-button secondary" onClick={() => openTopic(next.id)}>Next: {next.title} →</button>}
      </div>
      <p className="save-status" role="status">{saveError ? 'Reading progress stays in this visit; this browser could not save it.' : 'Reading progress is saved on this browser. Marking a topic read is not an assessment.'}</p>
    </main>;
  }

  return <main className="academy">
    <header className="academy-heading">
      <div className="eyebrow">THE CYBERSECURITY LIBRARY</div>
      <h1>Understand the threat.<br/><span>Build better habits.</span></h1>
      <p>Detailed notes from everyday account safety to cloud security, with practical examples and clear actions for each subtopic.</p>
    </header>
    <div className="academy-stats"><div><strong>12</strong><span>Topics</span></div><div><strong>36</strong><span>Subtopics</span></div><div><strong>108</strong><span>Examples</span></div><div><strong>{completed.length}/12</strong><span>Marked as read</span></div></div>
    <label className="search-label" htmlFor="topic-search">Find a topic, term or example</label>
    <input className="academy-search" id="topic-search" type="search" placeholder="Try: OTP, ransomware, BVN, cloud, backups…" value={search} onChange={e => setSearch(e.target.value)}/>
    <p className="save-status" role="status">{visible.length} topic{visible.length === 1 ? '' : 's'} found · Start with Foundations, or choose what you need.</p>
    <div className="topic-grid">{visible.map((t) => <button className="topic-card" key={t.id} onClick={() => openTopic(t.id)}>
      <div className="topic-card-top"><span aria-hidden="true">{t.icon}</span><span className="topic-level">{completed.includes(t.id) ? '✓ Read' : t.level}</span></div>
      <h2>{t.title}</h2><p>{t.summary}</p><span className="topic-meta">3 subtopics · 9 examples <span aria-hidden="true">↗</span></span>
    </button>)}</div>
    {!visible.length && <div className="lesson-card"><h2>No matching topics</h2><p>Try a broader term such as “password”, “network” or “fraud”.</p><button className="academy-button secondary" onClick={() => setSearch('')}>Clear search</button></div>}
  </main>;
}

export function CyberHistory() {
  const [region, setRegion] = useState('All');
  const [search, setSearch] = useState('');
  const incidents = INCIDENTS.filter(i => (region === 'All' || i.region === region) && JSON.stringify(i).toLowerCase().includes(search.toLowerCase().trim())).sort((a, b) => a.year - b.year);
  return <main className="academy">
    <header className="academy-heading"><div className="eyebrow">LESSONS FROM REAL EVENTS</div><h1>Cybersecurity history</h1><p>Nigerian and international case studies. Understand what is documented, what impact followed and what we can learn.</p></header>
    <div className="history-intro">The Nigeria collection includes an incident at a Nigerian institution and two Nigeria-linked international cases. Dates distinguish incidents from later court outcomes. Lessons and discussion prompts are our educational interpretation.</div>
    <div className="filter-row" role="group" aria-label="Filter cases by location">{['All', 'Nigeria', 'International'].map(r => <button className={`academy-button ${region === r ? '' : 'secondary'}`} key={r} aria-pressed={r === region} onClick={() => setRegion(r)}>{r === 'Nigeria' ? '🇳🇬 Nigeria' : r === 'International' ? '🌍 International' : 'All cases'}</button>)}</div>
    <label className="search-label" htmlFor="history-search">Search cases</label><input className="academy-search" id="history-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by incident, year or lesson…"/>
    <p className="save-status" role="status">{incidents.length} case{incidents.length === 1 ? '' : 's'} · Oldest to newest</p>
    <div className="timeline">{incidents.map(i => <article className="lesson-card history-card" key={i.id}>
      <div className="history-year">{i.year}</div><div className="eyebrow">{i.region} · {i.tag}</div><h2>{i.title}</h2><p className="case-date">{i.date}</p>
      <h3>What happened</h3><p>{i.account}</p><h3>Why it mattered</h3><p>{i.impact}</p>
      <div className="takeaway"><strong>Lesson for today</strong><p>{i.lesson}</p></div>
      <details className="discussion"><summary>Think it through</summary><p>{i.reflection}</p></details>
      <a className="case-source" href={i.url} target="_blank" rel="noreferrer">Source: {i.source} ↗</a>
    </article>)}</div>
    {!incidents.length && <div className="lesson-card"><h2>No matching cases</h2><p>Try another search term or choose All cases.</p></div>}
  </main>;
}
