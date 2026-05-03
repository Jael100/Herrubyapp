'use client';
// src/screens/MyBodyScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip, Spark } from './UI';
import { api } from '../lib/api';

const SYMS=[
  {key:"energy",label:"Work Energy",icon:"⚡",color:C.ruby,scale:["Excellent","Very good","Good","Low","Very low","Depleted"],insight:"Low work energy in midlife is often hormonal — estrogen shifts directly affect your mitochondria. Short movement breaks every 90 min are clinically shown to restore focus."},
  {key:"brainfog",label:"Mental Clarity",icon:"🧠",color:C.indigo,scale:["Crystal clear","Sharp","Okay","Some fog","Foggy","Very foggy"],insight:"Menopausal brain fog is caused by fluctuating estrogen affecting acetylcholine. Cognitive exercise and sleep quality are your two strongest levers."},
  {key:"stress",label:"Stress Level",icon:"🌀",color:C.lavender,scale:["Calm","Manageable","Moderate","Elevated","High","Overwhelming"],insight:"Midlife cortisol rises as estrogen drops. Short breathwork (4-7-8 technique) reduces cortisol within minutes."},
  {key:"sleep",label:"Sleep Quality",icon:"🌙",color:C.teal,scale:["Excellent","Very good","Good","Fair","Poor","Very poor"],insight:"Sleep disruption is the most common midlife complaint. Consistent bed times, a cool room (18°C) and limiting alcohol are your highest-impact changes."},
  {key:"hotflash",label:"Hot Flashes",icon:"🌡️",color:C.gold,scale:["None","Mild","Moderate","Frequent","Severe","Very frequent"],insight:"Hot flashes are triggered by dropping estrogen affecting your hypothalamus. Layering clothing and stress management are your most effective daily tools."},
  {key:"mood",label:"Mood & Resilience",icon:"🌸",color:C.sage,scale:["Joyful","Good","Okay","Low","Down","Struggling"],insight:"Mood shifts link directly to serotonin being affected by estrogen changes. Social connection, outdoor light and movement are your fastest natural regulators."},
];
const HIST={
  energy:[[4,3,3,4,3,4,4],[3,3,2,3,3,3,4],[3,2,3,3,4,4,4]],
  brainfog:[[4,4,5,5,4,5,6],[4,5,5,5,6,5,6],[5,5,5,6,6,6,7]],
  stress:[[5,4,4,3,4,3,3],[5,5,4,4,3,4,3],[6,5,5,4,4,3,4]],
  sleep:[[5,6,7,6,7,7,7],[4,5,6,6,7,7,8],[5,5,6,7,7,7,8]],
  hotflash:[[3,4,2,3,1,2,2],[3,3,2,2,2,1,2],[4,3,3,2,2,2,1]],
  mood:[[3,4,4,5,5,5,6],[3,3,4,4,5,5,5],[4,4,5,5,5,6,6]],
};
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Today"];

export default function MyBodyScreen({profile}){
  const name=profile?.name||"Margaret";
  const [today,setToday]=useState({energy:4,brainfog:5,stress:3,sleep:7,hotflash:2,mood:5});
  const [energy,setEnergy]=useState(3);
  const [entered,setEntered]=useState(false);
  const [saving,setSaving]=useState(false);
  const [saveErr,setSaveErr]=useState("");
  const [view,setView]=useState("checkin");
  const [activeKey,setActiveKey]=useState("energy");
  const sym=SYMS.find(s=>s.key===activeKey)||SYMS[0];
  const weekData=HIST[activeKey]?.[0]||[];

  async function saveEntry(){
    setSaving(true); setSaveErr("");
    try {
      await api.body.saveLog({ symptoms: { ...today, work_energy: energy } });
      setEntered(true);
    } catch (err) {
      setSaveErr(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  return(
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(150deg,${C.rubyDeep} 0%,${C.ruby} 60%,#D44 100%)`,padding:"58px 26px 34px",position:"relative",overflow:"hidden"}}>
        {[220,360].map((sz,i)=><div key={i} style={{position:"absolute",width:sz,height:sz,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.07)",top:i===0?-60:-100,right:i===0?-80:-40}}/>)}
        <div style={{position:"relative",zIndex:1}}>
          <Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,letterSpacing:"0.16em",display:"block",marginBottom:8}}>GOOD MORNING</Sans>
          <Serif as="h1" s={{color:"white",fontSize:F.hero,fontWeight:700,display:"block",marginBottom:8}}>{name} ✦</Serif>
          <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,display:"block",marginBottom:16}}>Midlife Vitality Platform · Women 40 and above</Sans>
          {profile?.symptoms?.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>{profile.symptoms.slice(0,3).map(s=><span key={s} style={{background:"rgba(255,255,255,0.18)",color:"white",borderRadius:20,padding:"6px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm}}>{s}</span>)}</div>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["checkin","Daily Check-In"],["trends","My Trends"],["actions","Work Actions"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"white":"rgba(255,255,255,0.15)",color:view===v?C.ruby:"white",border:"none",borderRadius:20,padding:"9px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,cursor:"pointer",fontWeight:view===v?600:400,transition:"all 0.2s"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {view==="checkin"&&!entered&&(
        <div style={{padding:"26px 24px"}}>
          <div style={{background:"white",borderRadius:24,padding:"24px 22px",boxShadow:"0 4px 24px rgba(0,0,0,0.07)",marginBottom:22}}>
            <Sans s={{fontSize:F.sm,color:C.muted,letterSpacing:"0.14em",fontWeight:600,display:"block",marginBottom:18}}>TODAY'S WORK ENERGY</Sans>
            <div style={{display:"flex",gap:10,justifyContent:"space-between",marginBottom:14}}>
              {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setEnergy(n)} style={{flex:1,aspectRatio:"1",borderRadius:14,background:n<=energy?C.ruby:C.parchment,border:`2px solid ${n<=energy?C.ruby:C.faint}`,cursor:"pointer",fontSize:24,transition:"all 0.2s"}}>{n<=energy?"⚡":"○"}</button>)}
            </div>
            <Sans s={{fontSize:F.md,color:C.muted,display:"block",textAlign:"center",lineHeight:1.5}}>{["Very low — rest today 💙","Low — be gentle with yourself","Moderate — steady day ahead","Good energy — you've got this! ✨","Excellent — you're glowing! 🌟"][energy-1]}</Sans>
          </div>
          <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:10}}>How are you doing today?</Serif>
          <Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.65,marginBottom:22}}>Slide each dial to log your symptoms. This builds your personal trend over time.</Sans>
          {SYMS.map(sym=>(
            <div key={sym.key} onClick={()=>setActiveKey(sym.key)} style={{background:"white",borderRadius:22,padding:"22px 22px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:14,border:`2px solid ${activeKey===sym.key?sym.color:"transparent"}`,transition:"border 0.2s",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{sym.icon}</span><Sans s={{fontSize:F.lg,fontWeight:600,color:C.slate}}>{sym.label}</Sans></div>
                <div style={{textAlign:"right"}}><Serif s={{fontSize:F.xxl,color:sym.color,fontWeight:700,lineHeight:1}}>{today[sym.key]}</Serif><Sans s={{fontSize:F.xs,color:C.muted,display:"block"}}>/10</Sans></div>
              </div>
              <Sans s={{fontSize:F.md,color:sym.color,display:"block",marginBottom:12,fontWeight:500}}>{sym.scale[Math.min(Math.round((today[sym.key]/10)*5),5)]}</Sans>
              <div style={{position:"relative",height:12,marginBottom:6}}>
                <div style={{position:"absolute",inset:0,background:C.faint,borderRadius:6}}/>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${today[sym.key]*10}%`,background:sym.color,borderRadius:6,transition:"width 0.2s"}}/>
                <input type="range" min={1} max={10} value={today[sym.key]} onChange={e=>{e.stopPropagation();setToday(t=>({...t,[sym.key]:+e.target.value}));}} onClick={e=>e.stopPropagation()} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",margin:0,height:"100%"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}><Sans s={{fontSize:F.xs,color:C.muted}}>1 — {sym.scale[0]}</Sans><Sans s={{fontSize:F.xs,color:C.muted}}>10 — {sym.scale[5]}</Sans></div>
            </div>
          ))}
          {saveErr&&<div style={{background:"#FEE8E8",borderRadius:12,padding:"12px 16px",marginBottom:12,border:"1px solid #FCA5A5"}}><Sans s={{color:"#B91C1C",fontSize:F.sm}}>{saveErr}</Sans></div>}
          <Btn onClick={saveEntry} disabled={saving} s={{width:"100%",padding:"18px 0",fontSize:F.lg,marginTop:8}}>{saving?'Saving…':"Save Today's Entry ✦"}</Btn>
        </div>
      )}
      {view==="checkin"&&entered&&(
        <div style={{padding:"26px 24px"}}>
          <div style={{background:`linear-gradient(135deg,${C.rubyDeep},#5A1215)`,borderRadius:24,padding:"30px 26px",textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:54,marginBottom:18}}>🌸</div>
            <Serif s={{color:"white",fontSize:F.xxl,display:"block",marginBottom:12}}>Logged, {name}.</Serif>
            <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,display:"block",lineHeight:1.7}}>Today's entry saved. Your trend is updating.</Sans>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {SYMS.map(s=><div key={s.key} style={{background:"white",borderRadius:20,padding:"18px 18px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)"}}><span style={{fontSize:24}}>{s.icon}</span><Serif s={{fontSize:F.xl,color:s.color,fontWeight:700,display:"block",lineHeight:1.2,marginTop:8}}>{today[s.key]}<span style={{fontSize:F.sm,color:C.muted}}>/10</span></Serif><Sans s={{fontSize:F.sm,color:C.muted,marginTop:2}}>{s.label}</Sans></div>)}
          </div>
          <Btn onClick={()=>{setEntered(false);setView("trends");}} v="ghost" s={{width:"100%",padding:"15px 0",fontSize:F.md,marginTop:18}}>View My Trends →</Btn>
        </div>
      )}
      {view==="trends"&&(
        <div style={{padding:"26px 24px"}}>
          <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:18}}>Your Symptom Trends</Serif>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>{SYMS.map(s=><button key={s.key} onClick={()=>setActiveKey(s.key)} style={{display:"flex",alignItems:"center",gap:7,background:activeKey===s.key?s.color:"white",color:activeKey===s.key?"white":C.muted,border:`2px solid ${activeKey===s.key?s.color:C.faint}`,borderRadius:22,padding:"9px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,cursor:"pointer",transition:"all 0.2s",fontWeight:activeKey===s.key?600:400}}>{s.icon} {s.label}</button>)}</div>
          {weekData.length>0&&(
            <div style={{background:"white",borderRadius:24,padding:"24px 22px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div><Serif s={{fontSize:44,color:sym.color,fontWeight:700,display:"block",lineHeight:1}}>{weekData[weekData.length-1]}<span style={{fontSize:F.md,color:C.muted}}>/10</span></Serif><Sans s={{fontSize:F.md,color:C.muted,marginTop:4}}>{sym.label} · This week</Sans></div>
                <Chip color={C.sage} bg={C.sagePale}>↓ Improving</Chip>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100,marginBottom:12}}>{weekData.map((v,i)=>{const isToday=i===weekData.length-1;return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><Sans s={{fontSize:F.xs,color:isToday?sym.color:C.muted,fontWeight:isToday?700:400}}>{v}</Sans><div style={{width:"100%",height:84,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:`${(v/10)*100}%`,background:isToday?sym.color:sym.color+"50",borderRadius:"6px 6px 3px 3px",minHeight:8,transition:"height 1s"}}/></div><Sans s={{fontSize:F.xs,color:isToday?sym.color:C.muted,fontWeight:isToday?600:400}}>{DAYS[i]}</Sans></div>);})}</div>
              <div style={{borderTop:`1px solid ${C.faint}`,paddingTop:16}}>
                <Sans s={{fontSize:F.sm,color:C.muted,display:"block",marginBottom:12}}>3-week comparison</Sans>
                {HIST[activeKey].map((wk,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}><Sans s={{fontSize:F.sm,color:C.muted,width:72,flexShrink:0}}>{i===0?"This wk":i===1?"Last wk":"2 wks ago"}</Sans><Spark data={wk} color={i===0?sym.color:sym.color+"55"} w={170} h={36}/><Sans s={{fontSize:F.md,color:i===0?sym.color:C.muted,fontWeight:i===0?700:400}}>{(wk.reduce((a,b)=>a+b,0)/wk.length).toFixed(1)}</Sans></div>)}
              </div>
            </div>
          )}
          <div style={{background:`linear-gradient(135deg,${sym.color}18,${sym.color}05)`,borderRadius:22,padding:"22px 22px",border:`2px solid ${sym.color}25`,marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><span style={{fontSize:30}}>{sym.icon}</span><Sans s={{fontSize:F.sm,color:sym.color,letterSpacing:"0.14em",fontWeight:600}}>RUBY UNDERSTANDS THIS</Sans></div>
            <Sans s={{fontSize:F.md,color:C.slate,display:"block",lineHeight:1.8}}>{sym.insight}</Sans>
          </div>
        </div>
      )}
      {view==="actions"&&(
        <div style={{padding:"26px 24px"}}>
          <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:6}}>Work Recovery Actions</Serif>
          <Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.65,marginBottom:22}}>Practical actions calibrated to today's check-in.</Sans>
          {[{time:"Right now",icon:"🌬️",title:"90-second breathing reset",desc:"4 counts in · 7 hold · 8 out. Repeat 3×. Lowers cortisol in under 2 minutes.",color:C.lavender,tag:"Stress"},{time:"Next 30 min",icon:"🚶‍♀️",title:"5-minute movement break",desc:"A short walk restores blood flow and clears brain fog significantly.",color:C.sage,tag:"Energy + Focus"},{time:"This afternoon",icon:"💧",title:"Hydration check",desc:"Dehydration by just 2% impairs cognition. Aim for 2L by 3pm.",color:C.teal,tag:"Clarity"},{time:"Tonight",icon:"🌙",title:"Wind-down protocol",desc:"Stop screens 45 min before bed. Keep bedroom at 18°C.",color:C.indigo,tag:"Sleep"},{time:"This week",icon:"📅",title:"Book your lunch-hour session",desc:"Your Energy & Sleep Reset programme has a 45-min lunchtime slot Thursday.",color:C.ruby,tag:"Programme"}].map((a,i)=>(
            <div key={i} style={{background:"white",borderRadius:22,padding:"20px 22px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:14,borderLeft:`4px solid ${a.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:26}}>{a.icon}</span><div><Sans s={{fontSize:F.xs,color:a.color,fontWeight:600,letterSpacing:"0.1em",display:"block"}}>{a.time.toUpperCase()}</Sans><Serif s={{fontSize:F.lg,color:C.slate}}>{a.title}</Serif></div></div>
                <Chip color={a.color} bg={a.color+"15"} s={{flexShrink:0}}>{a.tag}</Chip>
              </div>
              <Sans s={{fontSize:F.md,color:C.muted,lineHeight:1.7}}>{a.desc}</Sans>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

