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
  ['home', 'Home'], ['learn', 'Learn'], ['videos', 'Watch'], ['practice', 'Practice'], ['war-room', 'War Room'], ['history', 'History'], ['progress', 'Progress'],
];

const videoResources = [
  { id: 'google-certificate', title: 'Google Cybersecurity Certificate', provider: 'Google / Coursera', type: 'Guided course', level: 'Beginner', icon: 'fa-graduation-cap', topics: ['foundations', 'phishing', 'social', 'identity', 'malware', 'networks', 'applications', 'cloud', 'data', 'response', 'nigeria', 'advanced'], description: 'A structured cybersecurity learning path covering risks, Linux, SQL, SIEM, IDS and incident response.', url: 'https://grow.google/certificates/cybersecurity/' },
  { id: 'grow-google', title: 'Landing Jobs in Cybersecurity', provider: 'Grow with Google', type: 'YouTube video', level: 'Beginner', icon: 'fa-circle-play', topics: ['foundations', 'advanced'], description: 'An official introduction to the Google Cybersecurity Certificate and entry-level cybersecurity careers.', url: 'https://www.youtube.com/watch?v=8GTqd0j8RNY' },
  { id: 'openlearn', title: 'Introduction to Cyber Security: Stay Safe Online', provider: 'The Open University', type: 'Free course', level: 'Beginner', icon: 'fa-book-open', topics: ['foundations', 'phishing', 'social', 'identity', 'data', 'nigeria'], description: 'A free English-language introduction to protecting your digital life at home and at work.', url: 'https://www.open.edu/openlearn/digital-computing/introduction-cyber-security-stay-safe-online/content-section-0' },
  { id: 'cisa-scenarios', title: 'Cybersecurity Scenarios', provider: 'CISA', type: 'Practical scenarios', level: 'Intermediate', icon: 'fa-shield-halved', topics: ['phishing', 'malware', 'networks', 'applications', 'cloud', 'response', 'advanced'], description: 'Defensive exercises and scenario materials for phishing, ransomware, insider threats and incident response.', url: 'https://www.cisa.gov/resources-tools/resources/cybersecurity-scenarios' },
];

const topicIcons = {
  foundations: 'fa-shield-halved', phishing: 'fa-fish', social: 'fa-user-secret', identity: 'fa-key',
  malware: 'fa-bug', networks: 'fa-network-wired', applications: 'fa-code', cloud: 'fa-cloud',
  data: 'fa-folder-tree', response: 'fa-triangle-exclamation', nigeria: 'fa-building-columns', advanced: 'fa-flask',
};

function FontAwesomeIcon({ name, className = '' }) {
  return <i className={`fa-solid ${name} ${className}`} aria-hidden="true" />;
}

function getSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function Header({ page, go }) {
  const [open, setOpen] = useState(false);
  function navigate(id) { go(id); setOpen(false); }
  return <header className="site-header mobile-nav"><button className="brand" onClick={() => navigate('home')}><span>◈</span> CyberField</button><button className="menu-toggle" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen(current => !current)}><FontAwesomeIcon name={open ? 'fa-xmark' : 'fa-bars'} /></button><nav className={open ? 'open' : ''} aria-label="Main navigation">{navItems.map(([id, label]) => <button className={page === id ? 'active' : ''} key={id} onClick={() => navigate(id)}>{label}</button>)}</nav></header>;
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

function VideoCard({ resource }) {
  return <article className="video-card"><div className="video-card-top"><FontAwesomeIcon name={resource.icon} className="video-icon"/><div><span>{resource.type}</span><b>{resource.level}</b></div></div><h3>{resource.title}</h3><p className="video-provider">{resource.provider}</p><p>{resource.description}</p><a href={resource.url} target="_blank" rel="noreferrer">Open resource <FontAwesomeIcon name="fa-arrow-up-right-from-square"/></a></article>;
}

function WatchPanel({ topicId }) {
  const resources = videoResources.filter(resource => resource.topics.includes(topicId)).slice(0, 2);
  return <section className="watch-panel"><div className="watch-heading"><div><p className="kicker">WATCH</p><h2>Prefer learning by video?</h2><p>Use these trusted English-language resources before moving to the practical activity.</p></div><FontAwesomeIcon name="fa-circle-play"/></div><div className="video-mini-grid">{resources.map(resource => <VideoCard key={resource.id} resource={resource}/>)}</div></section>;
}

function Videos() {
  return <main className="page"><section className="page-intro"><p className="kicker">VIDEO LIBRARY</p><h1>Watch, understand, then practise.</h1><p className="lead">A small collection of trusted English-language courses, videos and defender resources. Each opens on the provider’s own site in a new tab.</p></section><section className="video-grid">{videoResources.map(resource => <VideoCard key={resource.id} resource={resource}/>)}</section><aside className="note"><b>How to use this library:</b> Choose a beginner resource before Step 1, then use the topic-specific Watch suggestions as you move through the guided learning path.</aside></main>;
}

function Learn({ completed, setCompleted }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const topics = TOPICS.filter(topic => JSON.stringify(topic).toLowerCase().includes(query.toLowerCase()));
  const topic = TOPICS.find(item => item.id === selected);
  const topicIndex = topic ? TOPICS.findIndex(item => item.id === topic.id) : -1;
  const nextTopic = topicIndex >= 0 ? TOPICS[topicIndex + 1] : null;
  const isUnlocked = item => {
    const index = TOPICS.findIndex(topicItem => topicItem.id === item.id);
    return index === 0 || completed.includes(TOPICS[index - 1].id);
  };
  function complete(id) { setCompleted(current => current.includes(id) ? current : [...current, id]); }
  if (topic) return <main className="page lesson-page"><button className="back" onClick={() => setSelected(null)}>← Learning path</button><p className="kicker">STEP {topicIndex + 1} OF {TOPICS.length} · {topic.level} · {topic.sections.length} PRACTICAL LESSONS</p><h1 className="lesson-title"><FontAwesomeIcon name={topicIcons[topic.id]} /> {topic.title}</h1><p className="lead">{topic.summary}</p><section className="learn-choice-bar"><span><b>01</b> Read the lesson</span><span><b>02</b> Watch a resource</span><span><b>03</b> Complete the practice</span></section><WatchPanel topicId={topic.id}/>{topic.sections.map((section, index) => <article className="lesson" key={section.title}><span className="lesson-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.explanation}</p><h3>Examples</h3><ul>{section.examples.map(example => <li key={example}>{example}</li>)}</ul><PracticalWorkspace topicId={topic.id} sectionIndex={index} action={section.action}/></div></article>)}<div className="completion"><div><b>{completed.includes(topic.id) ? 'Topic completed' : 'Ready to unlock the next step?'}</b><p>{nextTopic ? `Completing this unlocks Step ${topicIndex + 2}: ${nextTopic.title}.` : 'You have reached the end of the learning path.'}</p></div><button disabled={completed.includes(topic.id)} className={completed.includes(topic.id) ? 'secondary' : 'primary'} onClick={() => complete(topic.id)}>{completed.includes(topic.id) ? 'Completed ✓' : 'Complete and continue'}</button></div></main>;
  return <main className="page"><section className="page-intro"><p className="kicker">GUIDED LEARNING PATH</p><h1>Learn cybersecurity one step at a time.</h1><p className="lead">Start with the foundations. Finish each topic and its practical work to unlock the next step, so every skill builds on the one before it.</p><div className="progress-line"><span>{completed.length} of {TOPICS.length} steps completed</span><progress value={completed.length} max={TOPICS.length}/></div><label className="search"><span>Search the learning path</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Passwords, phishing, cloud, backups…"/></label></section><section className="topic-grid path-grid">{topics.map(topicItem => { const index = TOPICS.findIndex(item => item.id === topicItem.id); const unlocked = isUnlocked(topicItem); const done = completed.includes(topicItem.id); return <button disabled={!unlocked} className={`topic-tile ${unlocked ? '' : 'locked'}`} key={topicItem.id} onClick={() => setSelected(topicItem.id)}><div><FontAwesomeIcon name={topicIcons[topicItem.id]} className="topic-icon"/><span className="tag">{done ? 'Completed' : unlocked ? `Step ${index + 1}` : <><FontAwesomeIcon name="fa-lock"/> Locked</>}</span></div><h2>{topicItem.title}</h2><p>{unlocked ? topicItem.summary : `Complete Step ${index}: ${TOPICS[index - 1].title} to unlock this topic.`}</p><b>{unlocked ? `${topicItem.sections.length} lessons · practical included →` : 'Follow the path to continue'}</b></button>; })}</section>{topics.length === 0 && <p className="empty">No topics match that search.</p>}</main>;
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
  if (category) return <main className="page"><button className="back" onClick={() => setSelectedCategory(null)}>← All War Room areas</button><section className="page-intro compact"><p className="kicker">WAR ROOM · {category.label.toUpperCase()}</p><h1 className="lesson-title"><FontAwesomeIcon name={category.icon} /> {category.label}</h1><p className="lead">{category.desc}. Choose a path, then make a defensible response.</p></section><div className="filters">{['All', 'Guided', 'Investigative', 'Strategic'].map(item => <button key={item} onClick={() => setDifficulty(item)} className={difficulty === item ? 'active' : ''}>{item}</button>)}</div><p className="mission-count">{filtered.length} missions available</p><section className="mission-list">{filtered.slice(0, 24).map(item => <button key={item.id} onClick={() => openMission(item)}><span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span><h2>{item.title}</h2><p>{item.story}</p><b>{item.timeLimit}s · choose {item.minCorrect}+ actions →</b></button>)}</section><p className="note">Showing the first 24 of {filtered.length}. Choose another difficulty to see a different set of missions.</p></main>;
  return <main className="page"><section className="page-intro"><p className="kicker">WAR ROOM</p><h1>Practise calm, defensible incident response.</h1><p className="lead">{WAR_ROOM_TOTAL.toLocaleString()} defender missions across eight areas. Guided missions help you act; strategic missions make you compare evidence, scope and long-term controls.</p></section><section className="war-grid">{WAR_ROOM_CATEGORIES.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} style={{ '--accent': category.color }}><FontAwesomeIcon name={category.icon} className="war-icon"/><h2>{category.label}</h2><p>{category.desc}</p><b>200 missions · 40 Guided · 80 Investigative · 80 Strategic →</b></button>)}</section></main>;
}

function History() {
  const [filter, setFilter] = useState('All');
  const events = useMemo(() => [...recentEvents, ...INCIDENTS.map(item => ({ ...item, kind: item.year >= 2020 ? 'Modern event' : 'Historical event', summary: item.account, lesson: item.lesson }))].sort((a, b) => Number(b.year) - Number(a.year)), []);
  const visible = events.filter(event => filter === 'All' || event.kind === filter || (filter === 'Nigeria' && event.region === 'Nigeria'));
  return <main className="page"><section className="page-intro"><p className="kicker">HISTORY</p><h1>Events that shaped the way we defend.</h1><p className="lead">A worldwide timeline from early internet incidents to recent global cyber developments. Each entry includes a source and a practical lesson.</p></section><div className="filters">{['All', 'Recent global event', 'Recent defender guidance', 'Historical event', 'Modern event', 'Nigeria'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="timeline">{visible.map(event => <article key={`${event.title}-${event.year}`}><div><b>{event.year}</b><span>{event.kind}</span></div><main><h2>{event.title}</h2><p>{event.summary}</p><div className="lesson-note"><b>Lesson</b><p>{event.lesson}</p></div><a href={event.url} target="_blank" rel="noreferrer">Read source: {event.source} ↗</a></main></article>)}</section></main>;
}

function Progress({ completed }) { return <main className="page"><section className="page-intro"><p className="kicker">YOUR PROGRESS</p><h1>Keep moving forward.</h1><p className="lead">This page tracks the learning topics you mark complete in this browser. It does not claim to measure your real-world security ability.</p></section><section className="progress-card"><span>{completed.length}</span><div><h2>Topics completed</h2><p>{Math.round(completed.length / TOPICS.length * 100)}% of the learning library</p><progress value={completed.length} max={TOPICS.length}/></div></section><section className="next-steps"><h2>Continue with a practical next step</h2>{TOPICS.filter(topic => !completed.includes(topic.id)).slice(0, 4).map(topic => <div key={topic.id}><FontAwesomeIcon name={topicIcons[topic.id]} className="next-icon"/><p><b>{topic.title}</b><br/>{topic.summary}</p></div>)}</section></main>; }

export default function App() {
  const [page, setPage] = useState(() => location.hash.replace('#', '') || 'home');
  const [completed, setCompleted] = useState(() => getSaved('cyberfield:completed-topics', []));
  const [practice, setPractice] = useState(null);
  const [warCategory, setWarCategory] = useState(null);
  function go(next) { setPage(next); location.hash = next; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  useEffect(() => { try { localStorage.setItem('cyberfield:completed-topics', JSON.stringify(completed)); } catch { /* Progress remains available for this visit. */ } }, [completed]);
  useEffect(() => { const sync = () => setPage(location.hash.replace('#', '') || 'home'); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []);
  return <div className="app-shell"><Header page={page} go={go}/>{page === 'home' && <Home go={go}/>} {page === 'learn' && <Learn completed={completed} setCompleted={setCompleted}/>} {page === 'videos' && <Videos/>} {page === 'practice' && <Practice selected={practice} setSelected={setPractice}/>} {page === 'war-room' && <WarRoom selectedCategory={warCategory} setSelectedCategory={setWarCategory}/>} {page === 'history' && <History/>} {page === 'progress' && <Progress completed={completed}/>}<footer>CyberField · Learn with care. Verify before you act.</footer></div>;
}
