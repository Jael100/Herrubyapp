'use client';
// src/screens/CircleScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip } from './UI';
import { api } from '../lib/api';

const CIRCLES=[
  {id:1,name:"Morning Blossoms",topic:"Balance & Movement",members:12,emoji:"🌸",color:C.ruby},
  {id:2,name:"Nourish Together",topic:"Nutrition & Recipes",members:8,emoji:"🥗",color:C.sage},
  {id:3,name:"Mind Matters",topic:"Cognitive Health",members:15,emoji:"🧠",color:C.teal},
  {id:4,name:"Travel & Adventure",topic:"Travel after 60",members:10,emoji:"✈️",color:C.indigo},
  {id:5,name:"Sleep Sisters",topic:"Sleep & Recovery",members:6,emoji:"🌙",color:C.lavender},
  {id:6,name:"Giving Back",topic:"Volunteering & Purpose",members:9,emoji:"🤝",color:C.gold},
];
const FEED=[
  {circle:"Morning Blossoms",author:"Diane",av:"D",ac:C.ruby,time:"2h ago",text:"Did the balance exercises at home — first time in months I didn't hold the countertop. Tiny win but HUGE! 🎉",likes:11,topic:"Balance",replies:4},
  {circle:"Mind Matters",author:"Carol",av:"C",ac:C.teal,time:"4h ago",text:"The memory garden session — I remembered all 12 words! Dr Nair said I'm in the top third of the group.",likes:18,topic:"Cognitive",replies:6},
  {circle:"Morning Blossoms",author:"Ruth",av:"R",ac:C.gold,time:"1d ago",text:"Reminder: outdoor walk Saturday at Gage Park, 9am. Helen and I will save spots at the café after. 🌿",likes:9,topic:"Social",replies:3},
];
const CEVENTS=[
  {name:"Gage Park Morning Walk",circle:"Morning Blossoms",date:"Sat Mar 15",time:"9:00 AM",going:8,total:15,icon:"🚶‍♀️",color:C.ruby,avs:["D","H","C","R"]},
  {name:"Book Discussion — March",circle:"Mind Matters",date:"Wed Mar 19",time:"4:00 PM",going:5,total:12,icon:"📚",color:C.teal,avs:["C","P","M"]},
  {name:"Spring Potluck Lunch",circle:"Nourish Together",date:"Sun Mar 23",time:"12:00 PM",going:6,total:10,icon:"🥘",color:C.sage,avs:["B","J","N","S"]},
];

export default function CircleScreen({kycVerified,onStartKYC}){
  const [view,setView]=useState("feed");
  const [liked,setLiked]=useState({});
  const [joined,setJoined]=useState({1:true,3:true});
  const [rsvp,setRsvp]=useState({});

  // KYC gate shown when user tries to join a circle
  function handleJoin(id){
    if(!kycVerified){onStartKYC();return;}
    setJoined(j=>({...j,[id]:!j[id]}));
  }

  return(
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(150deg,${C.rubyDeep},${C.ruby})`,padding:"58px 26px 24px"}}>
        <Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,letterSpacing:"0.16em",display:"block",marginBottom:8}}>WOMEN-ONLY · VERIFIED SPACE</Sans>
        <Serif as="h1" s={{color:"white",fontSize:F.hero,fontWeight:700,display:"block",marginBottom:6}}>Ruby Circle</Serif>
        {!kycVerified&&(
          <div style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>🔒</span>
            <div style={{flex:1}}><Sans s={{color:"white",fontSize:F.sm,fontWeight:600,display:"block"}}>Verify your identity to join Circles</Sans><Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.xs}}>One-time · 2 minutes · Keeps this space safe</Sans></div>
            <button onClick={onStartKYC} style={{background:"white",border:"none",borderRadius:10,padding:"7px 14px",color:C.ruby,fontFamily:"'DM Sans',sans-serif",fontSize:F.xs,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Verify →</button>
          </div>
        )}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
          {[["feed","Community Feed"],["circles","My Circles"],["events","Events & RSVP"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{flexShrink:0,background:view===v?"white":"rgba(255,255,255,0.15)",color:view===v?C.ruby:"white",border:"none",borderRadius:22,padding:"10px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,cursor:"pointer",fontWeight:view===v?600:400,transition:"all 0.2s",whiteSpace:"nowrap"}}>{l}</button>)}
        </div>
      </div>

      {view==="feed"&&(
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"white",borderRadius:22,padding:"18px 20px",boxShadow:"0 3px 14px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:C.ruby,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Cormorant Garamond',serif",fontSize:F.xl,fontWeight:700,flexShrink:0}}>M</div>
            <div style={{flex:1,background:C.blush,borderRadius:14,padding:"14px 18px",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontStyle:"italic"}}>Share something with your circle…</div>
          </div>
          {FEED.map((p,i)=>(
            <div key={i} style={{background:"white",borderRadius:24,padding:24,boxShadow:"0 3px 14px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:p.ac,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Cormorant Garamond',serif",fontSize:F.xl,fontWeight:700,flexShrink:0}}>{p.av}</div>
                <div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block"}}>{p.author}</Serif><Sans s={{fontSize:F.sm,color:C.muted}}>{p.circle} · {p.time}</Sans></div>
                <Chip color={p.ac} bg={p.ac+"15"}>{p.topic}</Chip>
              </div>
              <Sans as="p" s={{fontSize:F.md,color:C.slate,lineHeight:1.8,margin:"0 0 18px"}}>{p.text}</Sans>
              <div style={{display:"flex",gap:22,paddingTop:14,borderTop:`1px solid ${C.faint}`}}>
                <button onClick={()=>setLiked(l=>({...l,[i]:!l[i]}))} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:liked[i]?C.ruby:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontWeight:600,padding:0}}><span style={{fontSize:22}}>{liked[i]?"♥":"♡"}</span>{p.likes+(liked[i]?1:0)}</button>
                <button style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,padding:0}}>💬 {p.replies}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view==="circles"&&(
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:14}}>
          {!kycVerified&&(
            <div style={{background:`linear-gradient(135deg,${C.rubyDeep},#5A1215)`,borderRadius:20,padding:"20px 20px",display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:28,flexShrink:0}}>🔒</span>
              <div style={{flex:1}}>
                <Serif s={{color:"white",fontSize:F.xl,display:"block",marginBottom:6}}>Verify to join Circles</Serif>
                <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,lineHeight:1.65,marginBottom:14}}>Her Ruby Circles are women-only spaces. A quick identity check keeps every member safe and this space trusted.</Sans>
                <Btn onClick={onStartKYC} v="white" s={{padding:"12px 22px",fontSize:F.md}}>Verify My Identity ✦</Btn>
              </div>
            </div>
          )}
          {CIRCLES.map(c=>(
            <div key={c.id} style={{background:"white",borderRadius:24,padding:"20px 22px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:56,height:56,borderRadius:18,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{c.emoji}</div>
              <div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block",marginBottom:2}}>{c.name}</Serif><Sans s={{fontSize:F.md,color:C.muted,display:"block"}}>{c.topic}</Sans><Sans s={{fontSize:F.sm,color:C.muted}}>{c.members} members</Sans></div>
              <button onClick={()=>handleJoin(c.id)} style={{background:joined[c.id]?C.blush:"transparent",color:joined[c.id]?C.ruby:C.slate,border:`2px solid ${joined[c.id]?C.ruby:C.faint}`,borderRadius:14,padding:"11px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontWeight:600,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>
                {!kycVerified?"🔒 Join":(joined[c.id]?"✓ Joined":"Join")}
              </button>
            </div>
          ))}
        </div>
      )}

      {view==="events"&&(
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
          <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:4}}>Upcoming Circle Events</Serif>
          {CEVENTS.map((ev,i)=>(
            <div key={i} style={{background:"white",borderRadius:24,overflow:"hidden",boxShadow:"0 3px 16px rgba(0,0,0,0.06)"}}>
              <div style={{background:ev.color,padding:"13px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Sans s={{color:"white",fontSize:F.sm,letterSpacing:"0.1em",fontWeight:600}}>{ev.circle.toUpperCase()}</Sans><Chip color="white" bg="rgba(255,255,255,0.22)" s={{fontSize:F.sm}}>{ev.going}/{ev.total} going</Chip></div>
              <div style={{padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}><span style={{fontSize:30,flexShrink:0}}>{ev.icon}</span><div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block",marginBottom:5}}>{ev.name}</Serif><Sans s={{fontSize:F.md,color:C.muted}}>📅 {ev.date} · {ev.time}</Sans></div></div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:18}}>{ev.avs.slice(0,4).map((l,j)=><div key={j} style={{width:36,height:36,borderRadius:"50%",background:[C.ruby,C.gold,C.teal,C.indigo][j%4],display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Cormorant Garamond',serif",fontSize:F.md,fontWeight:700,border:"2px solid white",marginLeft:j>0?-10:0}}>{l}</div>)}{ev.going>4&&<Sans s={{fontSize:F.sm,color:C.muted,marginLeft:8}}>+{ev.going-4} more</Sans>}</div>
                {rsvp[i]?<div style={{background:C.sagePale,borderRadius:14,padding:"14px",textAlign:"center"}}><Sans s={{color:C.sage,fontWeight:600,fontSize:F.md}}>✓ You're going!</Sans></div>:<div style={{display:"flex",gap:10}}><Btn onClick={()=>setRsvp(r=>({...r,[i]:true}))} s={{flex:1,padding:"14px 0",fontSize:F.md,background:ev.color}}>RSVP ✦</Btn><Btn v="ghost" s={{padding:"14px 18px",fontSize:F.md}}>Maybe</Btn></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

