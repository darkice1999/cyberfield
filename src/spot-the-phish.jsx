import { useState, useEffect, useRef } from "react";
import { LEVELS } from "./question-bank.js";
import TrainingGame from "./TrainingGame.jsx";
import { LearningLibrary, CyberHistory } from "./Learning.jsx";
import { WAR_ROOM_CATEGORIES, WAR_ROOM_TOTAL } from "./war-room-data.js";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');`;

// ─── GLOBAL RESPONSIVE CSS ────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{margin:0;padding:0;overflow-x:hidden;}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 8px #00ffcc44}50%{box-shadow:0 0 20px #00ffcc88}}
  .fadeIn{animation:fadeIn 0.3s ease forwards;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:#0a0e1a;}
  ::-webkit-scrollbar-thumb{background:#1e2a4a;border-radius:2px;}
  input,button,select,textarea{font-family:'Syne',sans-serif;}
  @media(min-width:601px){.bottom-nav{display:none!important;}}
  @media(max-width:600px){
    .hide-mobile{display:none!important;}
    .stack-mobile{flex-direction:column!important;}
    .full-mobile{width:100%!important;}
    .wrap-mobile{flex-wrap:wrap!important;}
    .small-pad{padding:0.85rem!important;}
    .sm-text{font-size:0.75rem!important;}
  }
`;

// ─── EMAIL DATA ───────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS=[
  {q:"What is phishing?",options:["A fishing sport","A cyberattack using deceptive messages to steal info","A network scanning tool","A type of firewall"],answer:1,explanation:"Phishing uses social engineering to impersonate trusted entities and trick victims into revealing sensitive info."},
  {q:"Which URL is most suspicious?",options:["https://paypal.com/login","https://www.google.com","https://paypa1-secure.tk/verify","https://github.com/settings"],answer:2,explanation:"'.tk' is a free domain abused by scammers. 'paypa1' swaps 'l' for '1' — classic typosquatting."},
  {q:"What is 'spear phishing'?",options:["Mass emails to thousands","Targeted phishing using personal details about the victim","Phishing via SMS","Phishing via phone"],answer:1,explanation:"Spear phishing uses personal info (name, employer, colleagues) to appear highly convincing."},
  {q:"What should you do when an email urgently demands you click a link?",options:["Click immediately","Hover to check the real URL, then verify independently","Forward to all contacts","Reply and ask if real"],answer:1,explanation:"Hover over links to preview the real destination. Navigate to the site yourself — never click suspicious links."},
  {q:"What is 'vishing'?",options:["Phishing via video","Voice phishing — scams over phone calls","Phishing via SMS","Phishing using fake websites"],answer:1,explanation:"Vishing uses phone calls where attackers impersonate banks, tech support, or government agencies."},
  {q:"A legitimate bank will NEVER ask for:",options:["Your account balance","Your full password","Transaction history","Last 4 digits of your card"],answer:1,explanation:"Banks never ask for full passwords, PINs, or complete card numbers via email."},
  {q:"What does HTTPS guarantee?",options:["Site is 100% safe","Connection is encrypted but doesn't guarantee the site isn't malicious","Government approved","No malware"],answer:1,explanation:"HTTPS encrypts the connection, but phishing sites can also use HTTPS. Always check the domain."},
  {q:"What is a 'homograph attack'?",options:["Identical mass emails","Using lookalike characters from other alphabets in domain names","Cloning a real website","Spoofing an email sender name"],answer:1,explanation:"Homograph attacks replace letters with visually identical characters from other scripts (Cyrillic 'а' vs Latin 'a')."},
];

// ─── WAR ROOM SCENARIOS (8 THREAT CATEGORIES) ────────────────────────────────
// ─── AI HELPERS ───────────────────────────────────────────────────────────────
async function askAI(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
      system:`You are CyberFish AI, a friendly expert cybersecurity tutor inside the 'Spot the Phish' platform. Help students learn about phishing, social engineering, ransomware, web attacks, and all cybersecurity topics. Keep answers under 200 words, be encouraging, use simple analogies. No excessive markdown.`,
      messages})
  });
  if (!res.ok) throw new Error("AI service unavailable");
  const data = await res.json();
  return data.content?.map(b=>b.text||"").join("")||"Sorry, connection error. Try again!";
}

async function generateEndlessEmail(count, difficulty) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,
      system:`You generate realistic phishing training emails for a cybersecurity education platform. Return ONLY valid JSON — no markdown, no backticks.`,
      messages:[{role:"user",content:`Generate email #${count} for phishing training. Difficulty: ${difficulty}. Randomly choose isPhishing true or false (60% phishing, 40% legit). Return exact JSON:
{"from":"sender@domain.com","subject":"subject","body":"body with \\n newlines","isPhishing":true,"redFlags":[{"text":"description","type":"domain"}],"explanation":"2-3 sentence explanation"}
Make it unique, educational, vary brands and attack techniques.`}]
    })
  });
  if (!res.ok) throw new Error("AI service unavailable");
  const data = await res.json();
  const text = data.content?.map(b=>b.text||"").join("")||"{}";
  const email = JSON.parse(text.replace(/```json|```/g,"").trim());
  if (!email || typeof email.from !== "string" || typeof email.subject !== "string" || typeof email.body !== "string" || typeof email.isPhishing !== "boolean" || typeof email.explanation !== "string" || !Array.isArray(email.redFlags)) throw new Error("Invalid scenario");
  return email;
}

// ─── STYLES (mobile-first) ────────────────────────────────────────────────────
const C = {
  bg:"#0a0e1a", surface:"#111827", surfaceAlt:"#0d1528",
  border:"#1e2a4a", borderAlt:"#2a3550",
  text:"#e8eaf6", muted:"#8892b0", faint:"#c8d0e0",
  green:"#00ffcc", orange:"#ff8800", red:"#ff4444",
  purple:"#cc44ff", blue:"#44aaff", yellow:"#ffcc00",
  pink:"#ff6699", cyan:"#00ccff", teal:"#00cc88",
};

const S = {
  app:{fontFamily:"'Syne',sans-serif",minHeight:"100vh",background:C.bg,color:C.text},
  nav:{background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`,padding:"0 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:"54px",position:"sticky",top:0,zIndex:200},
  logo:{fontFamily:"'Space Mono',monospace",fontSize:"0.9rem",color:C.green,fontWeight:700,whiteSpace:"nowrap"},
  section:{maxWidth:"820px",margin:"0 auto",padding:"0 1rem 4rem"},
  card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"1rem"},
  btn:(v="primary",full=false)=>({
    background:v==="primary"?C.green:v==="danger"?C.red:v==="orange"?C.orange:v==="purple"?C.purple:v==="ghost"?"transparent":C.surface,
    color:v==="primary"?C.bg:C.text,
    border:v==="ghost"?`1px solid ${C.border}`:"none",
    padding:"0.6rem 1.2rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,
    fontFamily:"'Syne',sans-serif",transition:"all 0.18s",letterSpacing:"0.02em",
    width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",
  }),
  tag:(type)=>{
    const c={domain:C.red,urgency:C.orange,request:C.purple,link:C.red,deception:C.orange,tone:C.yellow,process:C.blue}[type]||"#888";
    return{display:"inline-block",background:`${c}20`,color:c,border:`1px solid ${c}44`,fontSize:"0.62rem",padding:"0.15rem 0.4rem",borderRadius:"4px",marginRight:"0.35rem",fontFamily:"'Space Mono',monospace"};
  },
  mono:{fontFamily:"'Space Mono',monospace"},
  pill:(color)=>({display:"inline-block",background:`${color}20`,border:`1px solid ${color}44`,color:color,fontSize:"0.65rem",padding:"0.2rem 0.55rem",borderRadius:"100px",fontFamily:"'Space Mono',monospace",letterSpacing:"0.04em"}),
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function ProgressBar({pct,color=C.green,height=5}){
  return <div style={{height,background:C.border,borderRadius:3,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.max(0,Math.min(100,pct))}%`,background:color,transition:"width 0.5s ease",borderRadius:3}}/>
  </div>;
}

function EmailViewer({email,onAnswer}){
  const [showFlags,setShowFlags]=useState(false);
  const [ans,setAns]=useState(null);
  function handle(v){setAns(v);onAnswer&&onAnswer(v,email.isPhishing);}
  const ok=ans!==null?ans===email.isPhishing:null;
  return <div style={{...S.card,marginBottom:"1rem",padding:0,overflow:"hidden"}} className="fadeIn">
    <div style={{background:C.surfaceAlt,padding:"0.9rem 1rem",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"flex-start",marginBottom:"0.3rem"}}>
        <div style={{width:"26px",height:"26px",background:C.border,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",flexShrink:0}}>📧</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:"0.65rem",color:C.muted}}>From</div>
          <div style={{fontSize:"0.75rem",color:C.text,...S.mono,wordBreak:"break-all"}}>{email.from}</div>
        </div>
      </div>
      <div style={{fontSize:"0.85rem",fontWeight:700,color:"#fff",lineHeight:1.3}}>{email.subject}</div>
    </div>
    <div style={{padding:"1rem",fontFamily:"'Space Mono',monospace",fontSize:"0.72rem",lineHeight:1.9,color:C.faint,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{email.body}</div>
    {ans===null?(
      <div style={{padding:"0.85rem 1rem",borderTop:`1px solid ${C.border}`,display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
        <button style={{...S.btn("danger"),flex:1,minWidth:"120px"}} onClick={()=>handle(true)}>🎣 PHISHING</button>
        <button style={{...S.btn("ghost"),flex:1,minWidth:"120px"}} onClick={()=>handle(false)}>✅ LEGITIMATE</button>
      </div>
    ):(
      <div style={{padding:"0.85rem 1rem",borderTop:`1px solid ${C.border}`}}>
        <div style={{background:ok?"#00ffcc15":"#ff444415",border:`1px solid ${ok?"#00ffcc44":"#ff444444"}`,borderRadius:"8px",padding:"0.85rem"}}>
          <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:"0.3rem"}}>{ok?"🎯 Correct!":"❌ Incorrect"}{" — "}<span style={{color:email.isPhishing?C.red:C.green}}>{email.isPhishing?"Phishing email":"Legitimate email"}</span></div>
          <div style={{fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>{email.explanation}</div>
        </div>
        {email.isPhishing&&email.redFlags?.length>0&&<div style={{marginTop:"0.6rem"}}>
          <button style={{...S.btn("ghost"),fontSize:"0.7rem",padding:"0.3rem 0.7rem"}} onClick={()=>setShowFlags(!showFlags)}>{showFlags?"▲ Hide":"▼ Show"} Red Flags ({email.redFlags.length})</button>
          {showFlags&&<div style={{marginTop:"0.6rem"}}>{email.redFlags.map((f,i)=>(
            <div key={i} style={{display:"flex",gap:"0.4rem",alignItems:"flex-start",marginBottom:"0.4rem"}}>
              <span style={{color:C.red,flexShrink:0,fontSize:"0.8rem"}}>⚠️</span>
              <span style={{fontSize:"0.74rem",color:C.faint,lineHeight:1.5}}><span style={S.tag(f.type)}>{f.type?.toUpperCase()}</span>{f.text}</span>
            </div>
          ))}</div>}
        </div>}
      </div>
    )}
  </div>;
}

// ─── GAME SECTION ─────────────────────────────────────────────────────────────
// ─── ENDLESS MODE ─────────────────────────────────────────────────────────────
function EndlessMode({onBack}){
  const [count,setCount]=useState(0);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [best,setBest]=useState(0);
  const [email,setEmail]=useState(null);
  const [error,setError]=useState(false);
  const [loading,setLoading]=useState(false);
  const [answered,setAnswered]=useState(false);
  const [diff,setDiff]=useState("medium");
  const [started,setStarted]=useState(false);
  // Ref tracks true count so async loadNext never reads stale closure value
  const countRef=useRef(0);

  async function loadNext(){
    setLoading(true);setAnswered(false);setEmail(null);setError(false);
    countRef.current+=1;
    const n=countRef.current;
    try{const e=await generateEndlessEmail(n,diff);e.id=`e-${n}`;setEmail(e);setCount(n);}
    catch{setError(true);}
    setLoading(false);
  }
  function handleAnswer(u,t){
    setAnswered(true);
    if(u===t){const pts=diff==="easy"?10:diff==="medium"?20:35;setScore(s=>s+pts);const ns=streak+1;setStreak(ns);if(ns>best)setBest(ns);}
    else setStreak(0);
  }
  const xp=score;
  const lvl=xp<100?"Rookie":xp<250?"Analyst":xp<500?"Investigator":xp<800?"Specialist":"Expert";
  const lvlColor=xp<100?C.muted:xp<250?C.green:xp<500?C.blue:xp<800?C.orange:C.red;

  if(!started)return(
    <div style={S.section}><div style={{textAlign:"center",paddingTop:"2rem"}} className="fadeIn">
      <div style={{fontSize:"2.5rem",marginBottom:"0.6rem"}}>∞</div>
      <h2 style={{fontSize:"1.6rem",fontWeight:800,marginBottom:"0.4rem"}}>Endless Mode</h2>
      <p style={{color:C.muted,fontSize:"0.85rem",marginBottom:"1.25rem",lineHeight:1.7}}>Optional AI practice generates new scenarios when the AI service is connected. For reviewed questions with guaranteed counts and no repeats, use Game.</p>
      <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {["easy","medium","hard"].map(d=><button key={d} onClick={()=>setDiff(d)} style={{...S.btn(diff===d?"primary":"ghost"),textTransform:"capitalize"}}>{d}</button>)}
      </div>
      <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
        <button style={{...S.btn(),flex:1}} onClick={()=>{setStarted(true);loadNext();}}>Start Endless →</button>
        <button style={{...S.btn("ghost"),flex:1}} onClick={onBack}>← Back</button>
      </div>
    </div></div>
  );

  return <div style={S.section}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.85rem",flexWrap:"wrap",gap:"0.4rem"}}>
      <button style={{...S.btn("ghost"),padding:"0.3rem 0.65rem",fontSize:"0.7rem"}} onClick={onBack}>← Exit</button>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:"0.7rem",color:C.muted,...S.mono}}>#{count}</span>
        <span style={S.pill(C.green)}>{score} XP</span>
        {streak>=2&&<span style={S.pill(C.orange)}>🔥 {streak}</span>}
        <span style={{color:lvlColor,fontSize:"0.7rem",fontWeight:700}}>{lvl}</span>
      </div>
    </div>
    {loading&&<div style={{...S.card,textAlign:"center",padding:"2.5rem 1rem"}}>
      <div style={{fontSize:"1.8rem",marginBottom:"0.5rem",display:"inline-block",animation:"spin 1s linear infinite"}}>⚙️</div>
      <div style={{color:C.muted,fontSize:"0.82rem"}}>AI generating scenario...</div>
    </div>}
    {error&&!loading&&<div style={S.card} role="alert"><h2>AI practice is unavailable</h2><p style={{color:C.muted,marginBottom:"1rem"}}>Try again later, or use the 140 reviewed Game scenarios. This attempt has not changed your score.</p><button style={S.btn()} onClick={loadNext}>Retry</button></div>}
    {email&&!loading&&<>
      <EmailViewer key={email.id} email={email} onAnswer={handleAnswer}/>
      {answered&&<div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
        <button style={{...S.btn(),flex:1}} onClick={loadNext}>Next ∞</button>
        <span style={{fontSize:"0.72rem",color:C.muted}}>Best: {best} 🔥</span>
      </div>}
    </>}
  </div>;
}

// ─── WAR ROOM ─────────────────────────────────────────────────────────────────
function WarRoom({onBack}){
  const [view,setView]=useState("lobby"); // lobby | catList | briefing | battle | result
  const [selCat,setSelCat]=useState(null);
  const [selScen,setSelScen]=useState(null);
  const [scenarioQuery,setScenarioQuery]=useState("");
  const [difficulty,setDifficulty]=useState("All");
  const [page,setPage]=useState(0);
  const [timeLeft,setTimeLeft]=useState(0);
  const [selected,setSelected]=useState([]);
  const [won,setWon]=useState(false);
  const timerRef=useRef(null);

  // Cleanup timer on unmount to prevent memory leaks
  useEffect(()=>{ return ()=>{ clearInterval(timerRef.current); }; },[]);

  function pickCat(cat){setSelCat(cat);setScenarioQuery("");setDifficulty("All");setPage(0);setView("catList");}
  function pickScen(scen){setSelScen(scen);setSelected([]);setTimeLeft(scen.timeLimit);setView("briefing");}

  function startBattle(){
    setView("battle");
    const gameEndedRef={current:false};
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          // Use setTimeout to call endGame outside the state updater
          if(!gameEndedRef.current){
            gameEndedRef.current=true;
            setTimeout(()=>endGame(false),0);
          }
          return 0;
        }
        return t-1;
      });
    },1000);
  }

  function endGame(playerWon){clearInterval(timerRef.current);setWon(playerWon);setView("result");}

  function toggleAction(action){
    const has=selected.find(s=>s.id===action.id);
    setSelected(s=>has?s.filter(x=>x.id!==action.id):[...s,action]);
  }

  function submit(){
    clearInterval(timerRef.current);
    const correctChosen=selected.filter(a=>a.correct).length;
    const wrongChosen=selected.filter(a=>!a.correct).length;
    const allowedWrong=selScen.wrongAllowed??0;
    endGame(correctChosen>=selScen.minCorrect&&wrongChosen<=allowedWrong);
  }

  const timerPct=selScen?(timeLeft/selScen.timeLimit)*100:100;
  const timerColor=timerPct>50?C.green:timerPct>25?C.orange:C.red;

  // LOBBY — category grid
  if(view==="lobby")return(
    <div style={S.section} className="fadeIn">
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.3rem",flexWrap:"wrap"}}>
        <h2 style={{fontSize:"1.3rem",fontWeight:800,margin:0}}>⚔️ War Room</h2>
      </div>
      <p style={{color:C.muted,fontSize:"0.8rem",marginBottom:"0.75rem",lineHeight:1.6}}>8 defensive categories · {WAR_ROOM_TOTAL.toLocaleString()} unique missions. Start guided, then move into investigative and strategic scenarios.</p>
      <div style={{background:`${C.orange}15`,border:`1px solid ${C.orange}44`,borderRadius:"8px",padding:"0.7rem 0.9rem",marginBottom:"1.25rem",fontSize:"0.75rem",color:C.orange}}>
        ⏱️ Every mission is defensive training. Guided missions teach the first response; strategic missions require evidence, scope and trade-offs.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"0.65rem",marginBottom:"1rem"}}>
        {WAR_ROOM_CATEGORIES.map(cat=>(
          <button key={cat.id} onClick={()=>pickCat(cat)} style={{background:C.surface,border:`1px solid ${cat.color}33`,borderRadius:"12px",padding:"1rem",textAlign:"left",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{fontSize:"1.6rem",marginBottom:"0.5rem"}}>{cat.icon}</div>
            <div style={{fontWeight:700,fontSize:"0.82rem",color:cat.color,marginBottom:"0.2rem"}}>{cat.label}</div>
            <div style={{color:C.muted,fontSize:"0.7rem",lineHeight:1.4,marginBottom:"0.5rem"}}>{cat.desc}</div>
            <span style={S.pill(cat.color)}>{cat.scenarios.length} missions</span>
          </button>
        ))}
      </div>
      <button style={{...S.btn("ghost"),width:"100%"}} onClick={onBack}>← Back to Home</button>
    </div>
  );

  // CATEGORY scenario list
  if(view==="catList"&&selCat)return(
    <div style={S.section} className="fadeIn">
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem"}}>
        <button style={{...S.btn("ghost"),padding:"0.3rem 0.65rem",fontSize:"0.7rem"}} onClick={()=>setView("lobby")}>← Back</button>
        <span style={{fontSize:"1.2rem"}}>{selCat.icon}</span>
        <span style={{fontWeight:700,color:selCat.color}}>{selCat.label}</span>
      </div>
      <p style={{fontSize:"0.75rem",color:C.muted,lineHeight:1.6,marginBottom:"0.8rem"}}>Choose a mission. Guided = clear first steps; Investigative = correlate evidence; Strategic = weigh containment, scope and long-term controls.</p>
      <div style={{display:"flex",gap:"0.45rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
        {["All","Guided","Investigative","Strategic"].map(level=><button key={level} onClick={()=>{setDifficulty(level);setPage(0);}} style={{...S.btn(difficulty===level?"primary":"ghost"),padding:"0.35rem 0.55rem",fontSize:"0.68rem"}}>{level}</button>)}
      </div>
      <label style={{display:"block",fontSize:"0.7rem",color:C.muted,marginBottom:"0.35rem"}} htmlFor="war-room-search">Find a mission</label>
      <input id="war-room-search" value={scenarioQuery} onChange={e=>{setScenarioQuery(e.target.value);setPage(0);}} placeholder="Search by threat or response..." style={{width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"0.65rem",color:C.text,marginBottom:"0.75rem"}} />
      {(()=>{
        const filtered=selCat.scenarios.filter(s=>(difficulty==="All"||s.difficulty===difficulty)&&`${s.title} ${s.story}`.toLowerCase().includes(scenarioQuery.toLowerCase().trim()));
        const pageSize=12, pages=Math.max(1,Math.ceil(filtered.length/pageSize)), safePage=Math.min(page,pages-1), visible=filtered.slice(safePage*pageSize,(safePage+1)*pageSize);
        return <><div style={{fontSize:"0.7rem",color:C.muted,marginBottom:"0.65rem"}}>{filtered.length} matching missions · Page {safePage+1} of {pages}</div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
        {visible.map(scen=>(
          <button key={scen.id} onClick={()=>pickScen(scen)} style={{...S.card,textAlign:"left",cursor:"pointer",border:`1px solid ${selCat.color}33`,transition:"all 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem",gap:"0.5rem"}}>
              <div style={{fontWeight:700,fontSize:"0.92rem",lineHeight:1.3}}>{scen.title}</div>
              <div style={{display:"flex",gap:"0.3rem",flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <span style={S.pill(scen.badgeColor)}>{scen.badge}</span>
                <span style={S.pill(selCat.color)}>{scen.difficulty}</span>
                <span style={S.pill(C.orange)}>{scen.timeLimit}s</span>
              </div>
            </div>
            <div style={{color:C.muted,fontSize:"0.77rem",lineHeight:1.5}}>{scen.story}</div>
          </button>
        ))}
      </div>{!visible.length&&<div style={{...S.card,color:C.muted,fontSize:"0.78rem"}}>No mission matches that filter.</div>}
      <div style={{display:"flex",justifyContent:"space-between",gap:"0.5rem",marginTop:"1rem"}}><button disabled={safePage===0} style={{...S.btn("ghost"),opacity:safePage===0?0.45:1}} onClick={()=>setPage(p=>Math.max(0,p-1))}>← Previous</button><button disabled={safePage+1>=pages} style={{...S.btn("ghost"),opacity:safePage+1>=pages?0.45:1}} onClick={()=>setPage(p=>Math.min(pages-1,p+1))}>Next →</button></div></>;
      })()}
    </div>
  );

  // BRIEFING
  if(view==="briefing"&&selScen)return(
    <div style={S.section} className="fadeIn">
      <div style={{...S.card,marginBottom:"1rem",border:`1px solid ${selScen.badgeColor}44`}}>
        <div style={{fontSize:"1rem",fontWeight:800,marginBottom:"0.65rem",lineHeight:1.3}}>{selScen.title}</div>
        <div style={{color:C.faint,fontSize:"0.82rem",lineHeight:1.7,marginBottom:"0.85rem"}}>{selScen.story}</div>
        {selScen.threat&&(
          <div style={{background:C.surfaceAlt,border:`1px solid ${C.red}33`,borderRadius:"8px",padding:"0.85rem",marginBottom:"0.85rem"}}>
            <div style={{fontSize:"0.65rem",color:C.red,...S.mono,marginBottom:"0.4rem",letterSpacing:"0.05em"}}>THREAT INTERCEPT</div>
            <div style={{fontSize:"0.7rem",color:C.muted,marginBottom:"0.2rem"}}>From: <span style={{color:C.text,...S.mono,wordBreak:"break-all"}}>{selScen.threat.from}</span></div>
            <div style={{fontSize:"0.7rem",color:C.muted,marginBottom:"0.5rem"}}>Subject: <span style={{color:C.text}}>{selScen.threat.subject}</span></div>
            <div style={{...S.mono,fontSize:"0.68rem",color:C.faint,whiteSpace:"pre-wrap",lineHeight:1.75,wordBreak:"break-word"}}>{selScen.threat.body}</div>
          </div>
        )}
        <div style={{background:`${C.border}66`,borderRadius:"8px",padding:"0.75rem",fontSize:"0.75rem",color:C.muted}}>
          <strong style={{color:C.text}}>Mission:</strong> Select all correct defensive actions. Need ≥{selScen.minCorrect} correct, zero wrong moves. You have <strong style={{color:C.orange}}>{selScen.timeLimit}s.</strong>
        </div>
      </div>
      <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
        <button style={{...S.btn("primary"),flex:1}} onClick={startBattle}>🛡️ Start Defence</button>
        <button style={{...S.btn("ghost"),flex:1}} onClick={()=>setView("catList")}>← Back</button>
      </div>
    </div>
  );

  // BATTLE
  if(view==="battle"&&selScen)return(
    <div style={S.section}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem",gap:"0.5rem"}}>
        <div style={{fontSize:"0.82rem",fontWeight:700,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selScen.title}</div>
        <div style={{background:`${timerColor}20`,border:`1px solid ${timerColor}44`,borderRadius:"8px",padding:"0.3rem 0.75rem",...S.mono,fontSize:"1rem",fontWeight:700,color:timerColor,flexShrink:0,animation:timerPct<20?"shake 0.5s infinite":"none"}}>
          {timeLeft}s
        </div>
      </div>
      <ProgressBar pct={timerPct} color={timerColor} height={6}/>
      <div style={{...S.card,marginTop:"0.75rem",marginBottom:"0.85rem",padding:"0.75rem",fontSize:"0.75rem",color:C.muted}}>
        🛡️ Select all correct defensive actions. No wrong moves. Submit before time runs out.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
        {selScen.actions.map(action=>{
          const isSel=!!selected.find(s=>s.id===action.id);
          return <button key={action.id} onClick={()=>toggleAction(action)} style={{background:isSel?`${C.green}15`:C.surface,border:`1px solid ${isSel?C.green+"44":C.border}`,borderRadius:"10px",padding:"0.75rem",textAlign:"left",cursor:"pointer",fontSize:"0.8rem",color:isSel?C.green:C.faint,transition:"all 0.18s",display:"flex",gap:"0.5rem",alignItems:"flex-start"}}>
            <span style={{flexShrink:0,fontSize:"1rem"}}>{isSel?"☑️":"☐"}</span>
            <span style={{lineHeight:1.5}}>{action.text}</span>
          </button>;
        })}
      </div>
      <button style={{...S.btn("primary"),width:"100%"}} onClick={submit}>
        🛡️ Submit Defence
      </button>
    </div>
  );

  // RESULT
  if(view==="result"&&selScen)return(
    <div style={S.section} className="fadeIn">
      <div style={{textAlign:"center",padding:"1rem 0 1.5rem"}}>
        {won?(
          <>
            <div style={{fontSize:"3.5rem",marginBottom:"0.6rem",animation:"bounce 0.6s ease"}}>🛡️</div>
            <h2 style={{fontSize:"1.7rem",fontWeight:800,color:C.green,marginBottom:"0.4rem"}}>You Saved the Day!!!</h2>
            <p style={{color:C.faint,fontSize:"0.85rem",lineHeight:1.7,maxWidth:"440px",margin:"0 auto 1.25rem"}}>Outstanding. Your quick thinking neutralized the threat. In a real organization, your response would have prevented a major incident.</p>
          </>
        ):(
          <>
            <div style={{fontSize:"3.5rem",marginBottom:"0.6rem"}}>💥</div>
            <h2 style={{fontSize:"1.5rem",fontWeight:800,color:C.red,marginBottom:"0.4rem"}}>Try Again...</h2>
            <p style={{color:C.faint,fontSize:"0.85rem",lineHeight:1.7,maxWidth:"440px",margin:"0 auto 0.5rem"}}>But in the real world, this would be a great disaster.</p>
            <p style={{color:C.muted,fontSize:"0.78rem",lineHeight:1.6,maxWidth:"440px",margin:"0 auto 1.25rem"}}>Breaches, ransomware, data theft, and financial fraud can follow a single failed response. Every second has consequences.</p>
          </>
        )}
      </div>
      <div style={{...S.card,marginBottom:"1rem"}}>
        <div style={{fontSize:"0.7rem",color:C.muted,marginBottom:"0.65rem",...S.mono,letterSpacing:"0.05em"}}>ACTION BREAKDOWN</div>
        {selScen.actions.map(action=>{
          const was=selected.find(s=>s.id===action.id);
          const missed=action.correct&&!was;
          if(!was&&!missed)return null;
          return <div key={action.id} style={{padding:"0.6rem",background:was&&action.correct?"#00ffcc08":missed?"#ff880008":"#ff444408",border:`1px solid ${was&&action.correct?"#00ffcc22":missed?"#ff880022":"#ff444422"}`,borderRadius:"7px",marginBottom:"0.4rem"}}>
            <div style={{fontSize:"0.74rem",color:was&&action.correct?C.green:missed?C.orange:C.red,marginBottom:was&&action.correct?"0.2rem":"0"}}>{action.feedback}</div>
            {was&&action.correct&&<div style={{fontSize:"0.67rem",color:C.muted}}>+{action.points} pts</div>}
            {missed&&<div style={{fontSize:"0.68rem",color:C.muted,marginTop:"0.2rem"}}>Missed: {action.text}</div>}
          </div>;
        })}
      </div>
      <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
        <button style={{...S.btn(),flex:1}} onClick={()=>{setSelected([]);setTimeLeft(selScen.timeLimit);setView("briefing");}}>Try Again ↺</button>
        <button style={{...S.btn("ghost"),flex:1}} onClick={()=>setView("catList")}>← Scenarios</button>
        <button style={{...S.btn("ghost"),flex:1}} onClick={()=>setView("lobby")}>← Categories</button>
      </div>
    </div>
  );
  return null;
}

// ─── QUIZ HELPERS (extracted to keep QuizSection complexity low) ──────────────
function getOptionColors(show, isSel, isOk) {
  if (show && isOk)          return { bg:"#00ffcc15", bdr:"#00ffcc44", col:C.green };
  if (show && isSel && !isOk) return { bg:"#ff444415", bdr:"#ff444444", col:C.red };
  return { bg:C.surfaceAlt, bdr:C.border, col:C.faint };
}

function getOptionSuffix(show, isSel, isOk) {
  if (show && isOk)           return " ✅";
  if (show && isSel && !isOk) return " ❌";
  return "";
}

function QuizOption({ opt, idx, sel, answer, onPick }) {
  const show  = sel !== null;
  const isSel = sel === idx;
  const isOk  = idx === answer;
  const { bg, bdr, col } = getOptionColors(show, isSel, isOk);
  const suffix = getOptionSuffix(show, isSel, isOk);
  const letter = String.fromCharCode(65 + idx);

  const btnStyle = {
    background: bg,
    border: `1px solid ${bdr}`,
    color: col,
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
    textAlign: "left",
    cursor: sel === null ? "pointer" : "default",
    fontSize: "0.8rem",
    fontFamily: "'Syne',sans-serif",
    transition: "all 0.18s",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    lineHeight: 1.4,
  };

  const letterStyle = {
    ...S.mono,
    fontSize: "0.65rem",
    opacity: 0.5,
    flexShrink: 0,
    paddingTop: "1px",
  };

  function handleClick() {
    if (sel === null) onPick(idx);
  }

  return (
    <button key={idx} onClick={handleClick} style={btnStyle}>
      <span style={letterStyle}>{letter}</span>
      <span>{opt}{suffix}</span>
    </button>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizSection() {
  const [qi, setQi]   = useState(0);
  const [sc, setSc]   = useState(0);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[qi];
  const total = QUIZ_QUESTIONS.length;
  const isLast = qi + 1 >= total;

  function handlePick(i) {
    setSel(i);
    if (i === q.answer) setSc(s => s + 1);
  }

  function handleNext() {
    if (isLast) {
      setDone(true);
    } else {
      setQi(i => i + 1);
      setSel(null);
    }
  }

  function handleRetake() {
    setQi(0); setSc(0); setSel(null); setDone(false);
  }

  if (done) {
    const pct = Math.round((sc / total) * 100);
    const emoji = pct >= 80 ? "🧠" : pct >= 50 ? "📖" : "💡";
    return (
      <div style={S.section}>
        <div style={{ textAlign:"center", padding:"2rem 0" }} className="fadeIn">
          <div style={{ fontSize:"3rem", marginBottom:"0.6rem" }}>{emoji}</div>
          <h2 style={{ fontSize:"1.6rem", fontWeight:800 }}>Quiz Complete!</h2>
          <div style={{ fontSize:"2.2rem", color:C.green, ...S.mono, marginBottom:"0.3rem" }}>{pct}%</div>
          <div style={{ color:C.muted, marginBottom:"1.25rem" }}>{sc}/{total} correct</div>
          <button style={{ ...S.btn(), width:"100%" }} onClick={handleRetake}>Retake Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.section}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <h2 style={{ fontSize:"1.1rem", fontWeight:700, margin:0 }}>🧠 Knowledge Quiz</h2>
        <span style={{ ...S.mono, fontSize:"0.72rem", color:C.muted }}>{qi+1}/{total}</span>
      </div>
      <ProgressBar pct={(qi / total) * 100} height={4} />
      <div style={{ ...S.card, marginTop:"1rem" }} className="fadeIn">
        <div style={{ fontSize:"0.9rem", fontWeight:600, lineHeight:1.5, marginBottom:"1rem" }}>{q.q}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.45rem" }}>
          {q.options.map((opt, i) => (
            <QuizOption
              key={i}
              opt={opt}
              idx={i}
              sel={sel}
              answer={q.answer}
              onPick={handlePick}
            />
          ))}
        </div>
        {sel !== null && (
          <>
            <div style={{ marginTop:"0.75rem", padding:"0.75rem", background:C.surfaceAlt, borderRadius:"8px", fontSize:"0.74rem", color:C.muted, lineHeight:1.6 }}>
              💡 {q.explanation}
            </div>
            <button
              style={{ ...S.btn(), marginTop:"0.75rem", width:"100%" }}
              onClick={handleNext}
            >
              {isLast ? "See Results 🏁" : "Next →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TIPS ─────────────────────────────────────────────────────────────────────
// ─── AI CHATBOT ───────────────────────────────────────────────────────────────
function AIChatBot(){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 Hey! I'm CyberFish AI. Ask me anything about cybersecurity — phishing, ransomware, SQL injection, social engineering, anything!"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function send(){
    if(!input.trim()||loading)return;
    const msg={role:"user",content:input.trim()};
    const next=[...msgs,msg];
    setMsgs(next);setInput("");setLoading(true);
    try{const reply=await askAI(next.map(m=>({role:m.role,content:m.content})));setMsgs(m=>[...m,{role:"assistant",content:reply}]);}
    catch{setMsgs(m=>[...m,{role:"assistant",content:"The AI coach is unavailable right now. The Learn library and reviewed Game scenarios are available without AI."}]);}
    setLoading(false);
  }

  return(
    <div style={{position:"fixed",bottom:"84px",right:"1rem",zIndex:300}}>
      {open&&(
        <div style={{background:"#0d1120",border:`1px solid ${C.border}`,borderRadius:"14px",width:"min(320px,calc(100vw - 2rem))",maxHeight:"460px",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 16px 50px rgba(0,0,0,0.6)",marginBottom:"0.5rem"}}>
          <div style={{background:C.surface,padding:"0.75rem 1rem",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
              <div style={{width:"7px",height:"7px",background:C.green,borderRadius:"50%"}}/>
              <span style={{fontSize:"0.78rem",fontWeight:700,color:C.green,...S.mono}}>CyberFish AI</span>
            </div>
            <button aria-label="Close AI coach" onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"1.1rem",lineHeight:1}}>×</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.6rem",minHeight:"160px",maxHeight:"260px"}}>
            {msgs.map((m,i)=><div key={i} style={{background:m.role==="user"?"#00ffcc20":"#1e2a4a",border:`1px solid ${m.role==="user"?"#00ffcc33":"#2a3550"}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"0.5rem 0.75rem",fontSize:"0.75rem",lineHeight:1.6,color:m.role==="user"?C.green:C.faint,alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%"}}>{m.content}</div>)}
            {loading&&<div style={{background:"#1e2a4a",borderRadius:"12px 12px 12px 4px",padding:"0.5rem 0.75rem",fontSize:"0.75rem",color:C.muted,alignSelf:"flex-start",animation:"pulse 1s infinite"}}>Thinking...</div>}
            <div ref={ref}/>
          </div>
          <div style={{display:"flex",gap:"0.4rem",padding:"0.65rem 0.85rem",borderTop:`1px solid ${C.border}`}}>
            <input aria-label="Message to AI coach" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about cybersecurity..." style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:"6px",padding:"0.45rem 0.65rem",color:C.text,fontSize:"0.74rem",fontFamily:"'Syne',sans-serif",outline:"none"}}/>
            <button aria-label="Send message" onClick={send} disabled={loading} style={{...S.btn(),padding:"0.45rem 0.7rem",fontSize:"0.7rem",opacity:loading?0.6:1}}>↑</button>
          </div>
          <div style={{padding:"0.4rem 0.85rem 0.6rem",display:"flex",flexWrap:"wrap",gap:"0.25rem",borderTop:`1px solid ${C.border}`}}>
            {["Spear phishing?","How to check URLs?","What is 2FA?","What is DMARC?","SQL injection?"].map(q=>(
              <button key={q} onClick={()=>setInput(q)} style={{background:C.surface,border:"none",color:C.muted,borderRadius:"100px",padding:"0.2rem 0.5rem",fontSize:"0.62rem",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>{q}</button>
            ))}
          </div>
        </div>
      )}
      <button aria-label={open?"Close AI coach":"Open AI coach"} aria-expanded={open} onClick={()=>setOpen(o=>!o)} style={{...S.btn(),width:"48px",height:"48px",borderRadius:"50%",padding:0,fontSize:"1.2rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 18px ${C.green}44`,marginLeft:"auto"}}>🤖</button>
    </div>
  );
}

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────────────────────
function BottomNav({tab,setTab,setGameLevel}){
  const items=[["home","🏠","Home"],["game","🎮","Game"],["endless","∞","Endless"],["avd","⚔️","War"],["quiz","🧠","Quiz"],["tips","📚","Learn"],["history","🕰️","History"]];
  return(
    <div className="bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:C.surfaceAlt,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:150,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {items.map(([id,icon,label])=>(
        <button key={id} onClick={()=>{setTab(id);setGameLevel(null);}} style={{flex:1,background:"none",border:"none",padding:"0.55rem 0.1rem 0.4rem",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem",color:tab===id?C.green:C.muted,transition:"color 0.15s",minWidth:0}}>
          <span style={{fontSize:"1.1rem",lineHeight:1}}>{icon}</span>
          <span style={{fontSize:"0.58rem",fontFamily:"'Syne',sans-serif",fontWeight:tab===id?700:400,letterSpacing:"0.02em"}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("home");
  const [gameLevel,setGameLevel]=useState(null);


  function nav(t){setTab(t);setGameLevel(null);window.scrollTo({top:0,behavior:"instant"});}

  return(
    <>
      <style>{FONT}{GLOBAL_CSS}</style>
      <div style={{...S.app,paddingBottom:"70px"}}>
        {/* Desktop top nav */}
        <nav style={S.nav}>
          <div style={S.logo}>🎣 spot-the-phish</div>
          <div style={{display:"flex",gap:"0.2rem",flexWrap:"wrap"}} className="hide-mobile">
            {[["home","Home"],["game","🎮 Game"],["endless","∞ Endless"],["avd","⚔️ War Room"],["quiz","🧠 Quiz"],["tips","📚 Learn"],["history","🕰️ History"]].map(([id,label])=>(
              <button key={id} onClick={()=>nav(id)} style={{background:tab===id?"#00ffcc22":"transparent",border:tab===id?"1px solid #00ffcc44":"1px solid transparent",color:tab===id?C.green:C.muted,padding:"0.28rem 0.65rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.73rem",fontFamily:"'Syne',sans-serif",fontWeight:600,transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
        </nav>

        {/* HOME */}
        {tab==="home"&&(
          <div className="fadeIn">
            <div style={{padding:"2.5rem 1rem 1.5rem",textAlign:"center",maxWidth:"600px",margin:"0 auto"}}>
              <div style={{display:"inline-block",background:"#00ffcc15",border:"1px solid #00ffcc33",color:C.green,fontSize:"0.65rem",...S.mono,padding:"0.25rem 0.7rem",borderRadius:"100px",marginBottom:"1rem",letterSpacing:"0.05em"}}>🛡️ CYBERSECURITY TRAINING PLATFORM</div>
              <h1 style={{fontSize:"clamp(1.6rem,6vw,3rem)",fontWeight:800,lineHeight:1.1,margin:"0 0 0.85rem",background:`linear-gradient(135deg,#fff 0%,${C.green} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Can You Spot the Phish?</h1>
              <p style={{color:C.muted,fontSize:"0.85rem",lineHeight:1.7,margin:"0 0 1.5rem"}}>Learn cybersecurity in depth. Practice realistic scenarios. Explore lessons from Nigeria and around the world.</p>
              <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>
                <button style={{...S.btn(),padding:"0.7rem 1.5rem"}} onClick={()=>nav("game")}>Start Training →</button>
                <button style={{...S.btn("ghost"),padding:"0.7rem 1.5rem"}} onClick={()=>nav("avd")}>⚔️ War Room</button>
              </div>
            </div>
            <div style={{maxWidth:"820px",margin:"0 auto",padding:"0 1rem 1.5rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"0.65rem",marginBottom:"1.25rem"}}>
                {[{icon:"📧",l:"3 Difficulty Levels",d:"20 Easy, 40 Hard and 80 Very Hard scenarios with evidence"},{icon:"📚",l:"Detailed Learning Notes",d:"12 topics, 36 subtopics and 108 practical examples."},{icon:"⚔️",l:"War Room",d:"1,600 defensive missions across 8 categories."},{icon:"🌍",l:"Cybersecurity History",d:"Nigerian and international incidents, sources and lessons."}].map((item,i)=>(
                  <div key={i} style={S.card}>
                    <div style={{fontSize:"1.3rem",marginBottom:"0.4rem"}}>{item.icon}</div>
                    <div style={{fontWeight:700,marginBottom:"0.2rem",fontSize:"0.82rem"}}>{item.l}</div>
                    <div style={{color:C.muted,fontSize:"0.72rem",lineHeight:1.5}}>{item.d}</div>
                  </div>
                ))}
              </div>
              <div style={{...S.card,border:`1px solid ${C.green}22`,textAlign:"center"}}>
                <div style={{...S.mono,fontSize:"0.65rem",color:C.green,letterSpacing:"0.1em",marginBottom:"0.35rem"}}>LEARN · PRACTICE · VERIFY</div>
                <div style={{fontSize:"1.6rem",fontWeight:800,marginBottom:"0.2rem"}}>140</div>
                <div style={{color:C.muted,fontSize:"0.78rem"}}>distinct training scenarios. Build your judgment with evidence, explanations and real incident lessons.</div>
              </div>
            </div>
          </div>
        )}

        {/* GAME */}
        {tab==="game"&&!gameLevel&&(
          <main className="academy">
            <header className="academy-heading"><div className="eyebrow">140 DISTINCT SCENARIOS · NO AI REQUIRED</div><h1>Choose your challenge</h1><p>Easy teaches with clear, plain-language clues. Hard removes the comfort of obvious hints. Very Hard uses professional workflows, identity controls and incident-response judgment.</p></header>
            <div className="topic-grid">
              {LEVELS.map(level => <button className="topic-card" key={level.id} onClick={()=>setGameLevel(level.id)}><div className="eyebrow" style={{color:level.color}}>TRAINING LEVEL</div><h2>{level.label}</h2><p>{level.description}</p><span className="topic-meta">Start or resume →</span></button>)}
            </div>
            <div className="lesson-card"><h2>Learn at your own pace</h2><p>Each level contains its own unique questions, shuffled once per attempt. Your answers and position are saved in this browser so you can leave and resume. Questions are not repeated within an attempt or copied between levels.</p><p>The supplied context makes each answer decidable. In a real situation with insufficient evidence, pause and verify instead of guessing. Replay is available after completing a level.</p><button className="academy-button secondary" onClick={()=>nav("tips")}>Read the learning notes →</button></div>
          </main>
        )}
        {tab==="game"&&gameLevel&&<TrainingGame key={gameLevel} level={gameLevel} onBack={()=>setGameLevel(null)}/>}

        {tab==="endless"&&<EndlessMode onBack={()=>nav("home")}/>}
        {tab==="avd"&&<WarRoom onBack={()=>nav("home")}/>}
        {tab==="quiz"&&<QuizSection/>}
        {tab==="tips"&&<LearningLibrary/>}
        {tab==="history"&&<CyberHistory/>}

        <AIChatBot/>
        <BottomNav tab={tab} setTab={nav} setGameLevel={setGameLevel}/>
      </div>
    </>
  );
}
