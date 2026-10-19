import { useEffect, useMemo, useState } from 'react';
import { TOPICS, INCIDENTS } from './learning-content.js';
import { LEVELS } from './question-bank.js';
import { WAR_ROOM_CATEGORIES, WAR_ROOM_TOTAL } from './war-room-data.js';
import TrainingGame from './TrainingGame.jsx';
import './cyber.css';

const recentEvents = [
  { year: '2025', kind: 'Recent global event', title: 'Operation Talent disrupted Cracked and Nulled',
    summary: 'Authorities from several countries disrupted the Cracked and Nulled cybercrime marketplaces in January 2025. The U.S. Department of Justice said the operation involved partners in Europe and Australia and that the marketplaces affected at least 17 million U.S. victims.',
    lesson: 'Cybercrime is an ecosystem. Credential theft, fraud tools and marketplaces can support many later attacks.', source: 'U.S. Department of Justice', url: 'https://www.justice.gov/opa/pr/cracked-and-nulled-marketplaces-disrupted-international-cyber-operation' },
  { year: '2025', kind: 'Recent global event', title: 'LummaC2 information-stealer infrastructure disrupted',
    summary: 'In May 2025, the U.S. Department of Justice announced court-authorized domain seizures targeting LummaC2 infrastructure. It described coordinated actions with Microsoft intended to disrupt malware used to target people and organizations worldwide.',
    lesson: 'Information-stealing malware can expose passwords, session data and financial information. Updating software and reviewing account access remain practical defenses.', source: 'U.S. Department of Justice', url: 'https://www.justice.gov/opa/pr/justice-department-seizes-domains-behind-major-information-stealing-malware-operation' },
  { year: '2025', kind: 'Recent global event', title: 'BlackSuit ransomware infrastructure disrupted',
    summary: 'In August 2025, the U.S. Department of Justice announced a coordinated disruption of BlackSuit (Royal) ransomware operations, including seizure of servers and domains. The announcement describes collaboration with law-enforcement partners across several countries.',
    lesson: 'Ransomware response needs both prevention and recovery: tested backups, MFA, patching and a rehearsed incident process.', source: 'U.S. Department of Justice', url: 'https://www.justice.gov/opa/pr/justice-department-announces-coordinated-disruption-actions-against-blacksuit-royal' },
  { year: '2025', kind: 'Recent defender guidance', title: 'Play ransomware advisory updated',
    summary: 'CISA, the FBI and the Australian Cyber Security Centre updated their Play ransomware advisory in June 2025 with current observed tactics and indicators. The advisory says the group has affected organizations in North and South America and Europe.',
    lesson: 'Use the basics consistently: patch known exploited weaknesses, protect critical accounts with MFA, maintain offline backups and test recovery.', source: 'CISA / FBI / ASD', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-352a' },
];

const navItems = [
  ['home', 'Home'], ['learn', 'Learn'], ['practice', 'Practice'], ['war-room', 'War Room'], ['history', 'History'], ['progress', 'Progress'],
];

function getSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function Header({ page, go }) {
  return <header className="site-header"><button className="brand" onClick={() => go('home')}><span>◈</span> CyberField</button><nav aria-label="Main navigation">{navItems.map(([id, label]) => <button className={page === id ? 'active' : ''} key={id} onClick={() => go(id)}>{label}</button>)}</nav></header>;
}

function Home({ go }) {
  return <main className="page home-page">
    <section className="hero"><div><p className="kicker">A PRACTICAL CYBERSECURITY LEARNING SPACE</p><h1>Know what to trust.<br/><em>Know what to do next.</em></h1><p className="lead">Learn the concepts, practise decisions in realistic situations, and understand the events that changed cybersecurity around the world.</p><div className="actions"><button className="primary" onClick={() => go('learn')}>Start learning</button><button className="secondary" onClick={() => go('practice')}>Try a scenario</button></div></div><aside className="hero-card"><span className="status-dot"/> Learning path ready <strong>12 topics · 140 practice decisions · 1,600 War Room missions</strong><div className="hero-grid"><span>Learn<br/><b>Understand</b></span><span>Practise<br/><b>Decide</b></span><span>Reflect<br/><b>Improve</b></span></div></aside></section>
    <section className="page-section"><div className="section-heading"><p className="kicker">START HERE</p><h2>Choose the way you want to learn</h2></div><div className="feature-grid">
      <button className="feature-card" onClick={() => go('learn')}><span>01</span><h3>Learn, topic by topic</h3><p>Plain-language lessons, real examples and a practical task for every topic.</p><b>Explore learning →</b></button>
      <button className="feature-card" onClick={() => go('practice')}><span>02</span><h3>Practise your judgment</h3><p>Start friendly, work through subtle cases, then move to professional-level decisions.</p><b>Open practice →</b></button>
      <button className="feature-card" onClick={() => go('war-room')}><span>03</span><h3>Enter the War Room</h3><p>Defender missions that range from guided first steps to complex response planning.</p><b>Choose a mission →</b></button>
    </div></section>
    <section className="callout"><p className="kicker">HISTORY IN CONTEXT</p><h2>Old incidents explain today’s risks.</h2><p>See landmark events alongside recent, sourced global cyber developments and the lessons they still carry.</p><button className="text-button" onClick={() => go('history')}>Explore the timeline →</button></section>
  </main>;
}

function activityFields(topicId, sectionIndex) {
  if (topicId === 'foundations' && sectionIndex === 0) return [
    ['Sensitive data', 'For example: private messages, banking details, health information, or school records.'],
    ['A harmful unauthorized change', 'What could someone alter that would cause harm?'],
    ['What happens during an outage?', 'Describe one thing you could not do if the app stopped working.'],
  ];
  if (topicId === 'foundations' && sectionIndex === 1) return [
    ['Asset', 'What valuable account, information, device or service are you considering?'],
    ['Weakness and possible harm', 'What weakness could be abused, and what could happen?'],
    ['Evidence and urgency', 'What would you need to know before deciding how urgently to act?'],
  ];
  return [['My response', 'Write your own answer, plan or checklist for this activity.']];
}

function PracticalWorkspace({ topicId, sectionIndex, action }) {
  const storageKey = `cyberfield:activity:${topicId}:${sectionIndex}`;
  const fields = activityFields(topicId, sectionIndex);
  const empty = Object.fromEntries(fields.map(([label]) => [label, '']));
  const [answers, setAnswers] = useState(() => getSaved(storageKey, empty));
  const [saved, setSaved] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  function update(label, value) { setAnswers(current => ({ ...current, [label]: value })); setSaved(false); }
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(answers)); setSaved(true); } catch { setSaved(false); } }
  function clear() { setAnswers(empty); try { localStorage.removeItem(storageKey); } catch { /* Keep the cleared draft for this visit. */ } setSaved(false); }
  return <section className="practical workspace">
    <div className="workspace-heading"><div><b>Practical workspace</b><p>{action}</p></div><span>Private to this browser</span></div>
    <p className="workspace-note">Work through this yourself. Do not enter passwords, one-time codes, banking details, or another person’s private information.</p>
    {fields.map(([label, hint]) => <label className="workspace-field" key={label}><b>{label}</b><textarea value={answers[label] || ''} onChange={event => update(label, event.target.value)} placeholder={hint} rows={fields.length > 1 ? 3 : 6}/></label>)}
    <div className="workspace-actions"><button className="primary" onClick={save}>Save my work</button><button className="secondary" onClick={clear}>Clear</button>{saved && <span className="saved">Saved in this browser ✓</span>}</div>
    <button className="workspace-reminder" onClick={() => setShowReminder(current => !current)}>{showReminder ? 'Hide' : 'Show'} a good-answer reminder</button>
    {showReminder && <p className="reminder">A useful response is specific to a real situation, names the risk clearly, and avoids exposing sensitive information. There is no single correct personal answer.</p>}
  </section>;
}

function Learn({ completed, setCompleted }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const topics = TOPICS.filter(topic => JSON.stringify(topic).toLowerCase().includes(query.toLowerCase()));
  const topic = TOPICS.find(item => item.id === selected);
  function toggle(id) { setCompleted(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  if (topic) return <main className="page lesson-page"><button className="back" onClick={() => setSelected(null)}>← All topics</button><p className="kicker">{topic.level} · {topic.sections.length} PRACTICAL LESSONS</p><h1>{topic.icon} {topic.title}</h1><p className="lead">{topic.summary}</p>{topic.sections.map((section, index) => <article className="lesson" key={section.title}><span className="lesson-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.explanation}</p><h3>Examples</h3><ul>{section.examples.map(example => <li key={example}>{example}</li>)}</ul><PracticalWorkspace topicId={topic.id} sectionIndex={index} action={section.action}/></div></article>)}<div className="completion"><div><b>{completed.includes(topic.id) ? 'Topic marked complete' : 'Finished this topic?'}</b><p>Progress is stored only in this browser.</p></div><button className={completed.includes(topic.id) ? 'secondary' : 'primary'} onClick={() => toggle(topic.id)}>{completed.includes(topic.id) ? 'Mark incomplete' : 'Mark complete'}</button></div></main>;
  return <main className="page"><section className="page-intro"><p className="kicker">LEARN</p><h1>Build understanding before you are under pressure.</h1><p className="lead">Every topic ends with a small practical step you can apply to your own accounts, devices or work process.</p><div className="progress-line"><span>{completed.length} of {TOPICS.length} topics completed</span><progress value={completed.length} max={TOPICS.length}/></div><label className="search"><span>Find a topic</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Passwords, phishing, cloud, backups…"/></label></section><section className="topic-grid">{topics.map(topic => <button className="topic-tile" key={topic.id} onClick={() => setSelected(topic.id)}><div><span className="topic-icon">{topic.icon}</span><span className="tag">{completed.includes(topic.id) ? 'Completed' : topic.level}</span></div><h2>{topic.title}</h2><p>{topic.summary}</p><b>{topic.sections.length} lessons · practical included →</b></button>)}</section>{topics.length === 0 && <p className="empty">No topics match that search.</p>}</main>;
}

function Practice({ selected, setSelected }) {
  if (selected) return <TrainingGame level={selected} onBack={() => setSelected(null)}/>;
  return <main className="page"><section className="page-intro"><p className="kicker">PRACTISE</p><h1>Make the call, then see the evidence.</h1><p className="lead">The answer is never just “looks suspicious.” Each scenario gives you the context required to make a fair decision.</p></section><section className="level-grid">{LEVELS.map((level, index) => <button key={level.id} className={`level-card ${level.id}`} onClick={() => setSelected(level.id)}><span>LEVEL 0{index + 1}</span><h2>{level.label}</h2><p>{level.description}</p><strong>{level.id === 'easy' ? 'Clear clues, calm pace' : level.id === 'hard' ? 'Subtle signals, limited comfort' : 'Professional reasoning and trade-offs'}</strong><b>Start {level.label} →</b></button>)}</section><aside className="note"><b>Real-world rule:</b> If you do not have enough evidence, pause and verify through a trusted channel. The practice context is included so every question has a defensible answer.</aside></main>;
}

function WarRoom({ selectedCategory, setSelectedCategory }) {
  const [difficulty, setDifficulty] = useState('All');
  const [mission, setMission] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [result, setResult] = useState(null);
  const category = WAR_ROOM_CATEGORIES.find(item => item.id === selectedCategory);
  const filtered = category?.scenarios.filter(item => difficulty === 'All' || item.difficulty === difficulty) || [];
  const actionIds = new Set(selectedActions);
  function openMission(item) { setMission(item); setSelectedActions([]); setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function submit() { const correct = mission.actions.filter(action => action.correct && actionIds.has(action.id)).length; const wrong = mission.actions.filter(action => !action.correct && actionIds.has(action.id)).length; setResult(correct >= mission.minCorrect && wrong === 0); }
  if (mission) return <main className="page mission-page"><button className="back" onClick={() => setMission(null)}>← Mission list</button><p className="kicker">{category.label} · {mission.difficulty.toUpperCase()} MISSION</p><h1>{mission.title}</h1><div className="mission-brief"><h2>Situation</h2><p>{mission.story}</p><div className="alert"><span>Signal</span><b>{mission.threat.subject}</b><p>{mission.threat.body}</p></div></div><section className="decision"><h2>Choose the actions you would take</h2><p>Select at least {mission.minCorrect} correct actions. Avoid harmful moves.</p>{mission.actions.map(action => <label key={action.id} className={actionIds.has(action.id) ? 'selected' : ''}><input type="checkbox" checked={actionIds.has(action.id)} onChange={() => setSelectedActions(current => current.includes(action.id) ? current.filter(id => id !== action.id) : [...current, action.id])}/><span>{action.text}</span></label>)}<button className="primary" onClick={submit}>Review decision</button>{result !== null && <div className={`mission-result ${result ? 'good' : 'needs-work'}`}><h3>{result ? 'Strong response.' : 'Review the response plan.'}</h3>{mission.actions.filter(action => actionIds.has(action.id) || action.correct).map(action => <p key={action.id}>{action.correct ? '✓' : '×'} {action.feedback}</p>)}</div>}</section></main>;
  if (category) return <main className="page"><button className="back" onClick={() => setSelectedCategory(null)}>← All War Room areas</button><section className="page-intro compact"><p className="kicker">WAR ROOM · {category.label.toUpperCase()}</p><h1>{category.icon} {category.label}</h1><p className="lead">{category.desc}. Choose a path, then make a defensible response.</p></section><div className="filters">{['All', 'Guided', 'Investigative', 'Strategic'].map(item => <button key={item} onClick={() => setDifficulty(item)} className={difficulty === item ? 'active' : ''}>{item}</button>)}</div><p className="mission-count">{filtered.length} missions available</p><section className="mission-list">{filtered.slice(0, 24).map(item => <button key={item.id} onClick={() => openMission(item)}><span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span><h2>{item.title}</h2><p>{item.story}</p><b>{item.timeLimit}s · choose {item.minCorrect}+ actions →</b></button>)}</section><p className="note">Showing the first 24 of {filtered.length}. Choose another difficulty to see a different set of missions.</p></main>;
  return <main className="page"><section className="page-intro"><p className="kicker">WAR ROOM</p><h1>Practise calm, defensible incident response.</h1><p className="lead">{WAR_ROOM_TOTAL.toLocaleString()} defender missions across eight areas. Guided missions help you act; strategic missions make you compare evidence, scope and long-term controls.</p></section><section className="war-grid">{WAR_ROOM_CATEGORIES.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} style={{ '--accent': category.color }}><span>{category.icon}</span><h2>{category.label}</h2><p>{category.desc}</p><b>200 missions · 40 Guided · 80 Investigative · 80 Strategic →</b></button>)}</section></main>;
}

function History() {
  const [filter, setFilter] = useState('All');
  const events = useMemo(() => [...recentEvents, ...INCIDENTS.map(item => ({ ...item, kind: item.year >= 2020 ? 'Modern event' : 'Historical event', summary: item.account, lesson: item.lesson }))].sort((a, b) => Number(b.year) - Number(a.year)), []);
  const visible = events.filter(event => filter === 'All' || event.kind === filter || (filter === 'Nigeria' && event.region === 'Nigeria'));
  return <main className="page"><section className="page-intro"><p className="kicker">HISTORY</p><h1>Events that shaped the way we defend.</h1><p className="lead">A worldwide timeline from early internet incidents to recent global cyber developments. Each entry includes a source and a practical lesson.</p></section><div className="filters">{['All', 'Recent global event', 'Recent defender guidance', 'Historical event', 'Modern event', 'Nigeria'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="timeline">{visible.map(event => <article key={`${event.title}-${event.year}`}><div><b>{event.year}</b><span>{event.kind}</span></div><main><h2>{event.title}</h2><p>{event.summary}</p><div className="lesson-note"><b>Lesson</b><p>{event.lesson}</p></div><a href={event.url} target="_blank" rel="noreferrer">Read source: {event.source} ↗</a></main></article>)}</section></main>;
}

function Progress({ completed }) { return <main className="page"><section className="page-intro"><p className="kicker">YOUR PROGRESS</p><h1>Keep moving forward.</h1><p className="lead">This page tracks the learning topics you mark complete in this browser. It does not claim to measure your real-world security ability.</p></section><section className="progress-card"><span>{completed.length}</span><div><h2>Topics completed</h2><p>{Math.round(completed.length / TOPICS.length * 100)}% of the learning library</p><progress value={completed.length} max={TOPICS.length}/></div></section><section className="next-steps"><h2>Continue with a practical next step</h2>{TOPICS.filter(topic => !completed.includes(topic.id)).slice(0, 4).map(topic => <div key={topic.id}><span>{topic.icon}</span><p><b>{topic.title}</b><br/>{topic.summary}</p></div>)}</section></main>; }

export default function App() {
  const [page, setPage] = useState(() => location.hash.replace('#', '') || 'home');
  const [completed, setCompleted] = useState(() => getSaved('cyberfield:completed-topics', []));
  const [practice, setPractice] = useState(null);
  const [warCategory, setWarCategory] = useState(null);
  function go(next) { setPage(next); location.hash = next; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  useEffect(() => { try { localStorage.setItem('cyberfield:completed-topics', JSON.stringify(completed)); } catch { /* Progress remains available for this visit. */ } }, [completed]);
  useEffect(() => { const sync = () => setPage(location.hash.replace('#', '') || 'home'); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []);
  return <div className="app-shell"><Header page={page} go={go}/>{page === 'home' && <Home go={go}/>} {page === 'learn' && <Learn completed={completed} setCompleted={setCompleted}/>} {page === 'practice' && <Practice selected={practice} setSelected={setPractice}/>} {page === 'war-room' && <WarRoom selectedCategory={warCategory} setSelectedCategory={setWarCategory}/>} {page === 'history' && <History/>} {page === 'progress' && <Progress completed={completed}/>}<footer>CyberField · Learn with care. Verify before you act.</footer></div>;
}
