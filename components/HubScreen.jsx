'use client';
// src/screens/HubScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip } from './UI';
import { api } from '../lib/api';
// ── KNOWLEDGE HUB ─────────────────────────────────────────────────────────────
const HUB_CATS=[
  {id:"career",label:"Career & Performance",icon:"💼",color:"#9B2226",live:[{title:"Managing Brain Fog at Work During Menopause",host:"Dr. Sarah Kim",date:"Tue Mar 25 · 12:00 PM",partner:null},{title:"Burnout, Boundaries & Bouncing Back",host:"Diane Cole, Executive Coach",date:"Thu Mar 27 · 12:00 PM",partner:null}],library:[{title:"Hormone Impacts on Cognition at Work",type:"Article",time:"8 min"},{title:"Energy Management for Professionals",type:"Video",time:"18 min"},{title:"Negotiating Flexible Work",type:"Guide",time:"PDF"}]},
  {id:"health",label:"Health & Medical",icon:"🏥",color:C.ruby,live:[{title:"Osteoporosis: What Every Woman Must Know",host:"Dr. Sarah Kim",date:"Thu Mar 20 · 7:00 PM",partner:"Osteoporosis Canada"},{title:"Heart Disease in Women",host:"Dr. James Osei",date:"Mon Mar 24 · 6:00 PM",partner:null}],library:[{title:"Shingles & RSV Prevention After 60",type:"Video",time:"12 min",partner:"GSK"},{title:"Pelvic Floor Health",type:"Guide",time:"PDF"},{title:"Menopause Management Options",type:"Article",time:"8 min"}]},
  {id:"nutrition",label:"Nutrition & Body",icon:"🥦",color:C.sage,live:[{title:"Foods for Bone Strength After Menopause",host:"Clare Obuya, Dietitian",date:"Wed Mar 26 · 5:30 PM",partner:null}],library:[{title:"Anti-Inflammatory Diet for Joint Pain",type:"Guide",time:"PDF"},{title:"Protein Needs for Women Over 60",type:"Article",time:"6 min"},{title:"Nutrition for Hot Flashes",type:"Video",time:"14 min"}]},
  {id:"mental",label:"Mind & Emotions",icon:"🌱",color:C.teal,live:[{title:"Coping with Loneliness After 60",host:"Dr. Priya Nair",date:"Tue Mar 25 · 5:00 PM",partner:null}],library:[{title:"Anxiety & Mood After Menopause",type:"Video",time:"14 min"},{title:"Finding Purpose After Retirement",type:"Article",time:"7 min"},{title:"Grief and Loss",type:"Guide",time:"PDF"}]},
  {id:"finance",label:"Financial Planning",icon:"💰",color:C.gold,live:[{title:"Retirement Income: Making Your Money Last",host:"CFP Maria Santos",date:"Wed Mar 26 · 6:30 PM",partner:"TD Bank"}],library:[{title:"Estate Planning Basics",type:"Video",time:"18 min",partner:"RBC"},{title:"Avoiding Scams and Fraud",type:"Guide",time:"PDF"},{title:"Downsizing Decisions",type:"Article",time:"6 min"}]},
];
export default function HubScreen(){
  const [openCat,setOpenCat]=useState("career");
  const [view,setView]=useState("live");
  const [saved,setSaved]=useState({});
  const [registered,setRegistered]=useState({});
  return(
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(150deg,${C.rubyDeep},${C.ruby})`,padding:"58px 26px 24px"}}>
        <Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,letterSpacing:"0.16em",display:"block",marginBottom:8}}>EXPERT-LED CONTENT</Sans>
        <Serif as="h1" s={{color:"white",fontSize:F.hero,fontWeight:700,display:"block",marginBottom:6}}>Knowledge Hub</Serif>
        <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,display:"block",marginBottom:20}}>Live sessions & on-demand library</Sans>
        <div style={{display:"flex",gap:8}}>{["live","library"].map(v=><button key={v} onClick={()=>setView(v)} style={{background:view===v?"white":"rgba(255,255,255,0.15)",color:view===v?C.ruby:"white",border:"none",borderRadius:22,padding:"10px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,cursor:"pointer",fontWeight:view===v?600:400,transition:"all 0.2s"}}>{{live:"🔴  Live Sessions",library:"📚  On-Demand"}[v]}</button>)}</div>
      </div>
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:`linear-gradient(135deg,${C.rubyDeep},#5A1215)`,borderRadius:22,padding:"20px 22px",display:"flex",gap:14,alignItems:"flex-start",marginBottom:6}}><span style={{fontSize:28,flexShrink:0}}>✦</span><div><Sans s={{color:"rgba(255,255,255,0.6)",fontSize:F.xs,letterSpacing:"0.14em",fontWeight:600,display:"block",marginBottom:6}}>PERSONALISED FOR YOU</Sans><Sans s={{color:"white",fontSize:F.md,lineHeight:1.75}}>Based on your logs, the <strong>Career & Performance</strong> lunchtime sessions are your highest-impact next step.</Sans></div></div>
        {HUB_CATS.map(cat=>{
          const isOpen=openCat===cat.id,content=view==="live"?cat.live:cat.library;
          return(
            <div key={cat.id} style={{background:"white",borderRadius:24,overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.06)",border:`2px solid ${isOpen?cat.color:"transparent"}`,transition:"border 0.25s"}}>
              <button onClick={()=>setOpenCat(isOpen?null:cat.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"20px 22px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                <div style={{width:52,height:52,borderRadius:18,background:cat.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{cat.icon}</div>
                <div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block"}}>{cat.label}</Serif><Sans s={{fontSize:F.md,color:C.muted}}>{content.length} {view==="live"?"live sessions":"resources"}</Sans></div>
                <span style={{color:C.muted,fontSize:24,transition:"transform 0.2s",display:"block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>⌄</span>
              </button>
              {isOpen&&<div style={{borderTop:`1px solid ${C.faint}`,padding:"4px 22px 22px"}}>
                {view==="live"&&content.map((s,i)=><div key={i} style={{paddingTop:18,borderTop:i>0?`1px solid ${C.faint}`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}><Serif s={{fontSize:F.lg,color:C.slate,flex:1}}>{s.title}</Serif>{s.partner&&<Chip color={C.gold} bg={C.goldPale} s={{fontSize:F.xs,flexShrink:0}}>{s.partner}</Chip>}</div>
                  <Sans s={{fontSize:F.md,color:C.muted,display:"block",marginBottom:10}}>With {s.host}</Sans>
                  <Chip color={cat.color} bg={cat.color+"15"} s={{marginBottom:16}}>📅 {s.date}</Chip><br/>
                  {registered[cat.id+i]?<div style={{background:C.sagePale,borderRadius:12,padding:"13px 18px",marginTop:10,textAlign:"center"}}><Sans s={{color:C.sage,fontWeight:600,fontSize:F.md}}>✓ Registered</Sans></div>:<Btn onClick={async()=>{const cid=cat.id+i; try{await api.hub.register(cid);}catch(_){} setRegistered(r=>({...r,[cid]:true}));}} s={{padding:"12px 24px",fontSize:F.md,background:cat.color,marginTop:10}}>Register Free →</Btn>}
                </div>)}
                {view==="library"&&content.map((item,i)=><div key={i} style={{paddingTop:18,borderTop:i>0?`1px solid ${C.faint}`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}><Chip color={cat.color} bg={cat.color+"15"}>{item.type}</Chip><Sans s={{fontSize:F.sm,color:C.muted}}>{item.time}</Sans>{item.partner&&<Chip color={C.gold} bg={C.goldPale} s={{fontSize:F.xs}}>{item.partner}</Chip>}</div><Serif s={{fontSize:F.lg,color:C.slate,display:"block"}}>{item.title}</Serif></div>
                    <button onClick={async()=>{const cid=cat.id+i; const next=!saved[cid]; try{ if(next) await api.hub.save(cid); else await api.hub.unsave(cid); }catch(_){} setSaved(sv=>({...sv,[cid]:next}));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:26,color:saved[cat.id+i]?C.ruby:"#DDD",flexShrink:0,paddingTop:4}}>{saved[cat.id+i]?"♥":"♡"}</button>
                  </div>
                  <button style={{marginTop:16,background:cat.color,color:"white",border:"none",borderRadius:12,padding:"12px 22px",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontWeight:600,cursor:"pointer"}}>{item.type==="Video"?"▶  Watch Now":item.type==="Guide"?"📥  Download":"Read Now →"}</button>
                </div>)}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

