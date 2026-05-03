'use client';
// src/screens/CircleScreen.jsx
import React, { useEffect, useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip } from './UI';
import { api } from '../lib/api';

const CIRCLE_COLORS = { '1': C.ruby, '2': C.sage, '3': C.teal, '4': C.indigo, '5': C.lavender, '6': C.gold };
const CIRCLES_DEFAULT = [
  { id:'1', name:'Morning Blossoms',   topic:'Balance & Movement',     emoji:'🌸', joined:false },
  { id:'2', name:'Nourish Together',   topic:'Nutrition & Recipes',     emoji:'🥗', joined:false },
  { id:'3', name:'Mind Matters',       topic:'Cognitive Health',        emoji:'🧠', joined:false },
  { id:'4', name:'Travel & Adventure', topic:'Travel after 60',         emoji:'✈️', joined:false },
  { id:'5', name:'Sleep Sisters',      topic:'Sleep & Recovery',        emoji:'🌙', joined:false },
  { id:'6', name:'Giving Back',        topic:'Volunteering & Purpose',  emoji:'🤝', joined:false },
];

export default function CircleScreen({kycVerified,onStartKYC}){
  const [view,setView]=useState("feed");
  const [circles,setCircles]=useState(CIRCLES_DEFAULT);
  const [events,setEvents]=useState([]);
  const [feed,setFeed]=useState([]);
  const [feedCircleId,setFeedCircleId]=useState(null);
  const [newPost,setNewPost]=useState('');
  const [posting,setPosting]=useState(false);

  useEffect(()=>{ (async()=>{
    try { const r = await api.circles.list(); if (r?.circles) setCircles(r.circles.map(c=>({...c,color:CIRCLE_COLORS[c.id]||C.ruby}))); } catch(_){}
    try { const r = await api.circles.getEvents(); if (r?.events) setEvents(r.events); } catch(_){}
  })(); },[]);

  // Pick first joined circle for feed view
  useEffect(()=>{
    const j = circles.find(c=>c.joined);
    if (j) setFeedCircleId(j.id);
  },[circles]);

  useEffect(()=>{ (async()=>{
    if (!feedCircleId) { setFeed([]); return; }
    try { const r = await api.circles.getPosts(feedCircleId); if (r?.posts) setFeed(r.posts); } catch(_){}
  })(); },[feedCircleId]);

  async function handleJoin(id){
    if(!kycVerified){onStartKYC();return;}
    const target = circles.find(c=>c.id===id);
    try {
      if (target?.joined) await api.circles.leave(id);
      else await api.circles.join(id);
      setCircles(cs=>cs.map(c=>c.id===id?{...c,joined:!c.joined}:c));
    } catch (err) {
      alert(err?.message || 'Failed to update circle membership.');
    }
  }

  async function toggleLike(post){
    try {
      const r = await api.circles.likePost(post.id);
      setFeed(fs=>fs.map(p=>p.id===post.id?{...p,liked:r?.liked,likes:(p.likes||0)+(r?.liked?1:-1)}:p));
    } catch(_){}
  }

  async function submitPost(){
    if (!feedCircleId || !newPost.trim()) return;
    setPosting(true);
    try {
      const r = await api.circles.createPost(feedCircleId, { text: newPost.trim() });
      if (r?.post) setFeed(fs=>[{ ...r.post, author: 'You', likes: 0, liked: false }, ...fs]);
      setNewPost('');
    } catch (err) {
      alert(err?.message || 'Failed to post.');
    } finally { setPosting(false); }
  }

  async function handleRsvp(eventId, status){
    try {
      await api.circles.rsvp(eventId, status);
      setEvents(es=>es.map(e=>e.id===eventId?{...e, my_status: status, going: e.going + (status==='going'?1:0)}:e));
    } catch(_){}
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
          {!feedCircleId ? (
            <div style={{background:"white",borderRadius:22,padding:"24px 20px",textAlign:"center",boxShadow:"0 3px 14px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:36,marginBottom:10}}>❋</div>
              <Sans s={{fontSize:F.md,color:C.muted,lineHeight:1.6}}>Join a Circle to see and share posts.</Sans>
            </div>
          ) : (
            <>
              <div style={{background:"white",borderRadius:22,padding:"18px 20px",boxShadow:"0 3px 14px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:"50%",background:C.ruby,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Cormorant Garamond',serif",fontSize:F.xl,fontWeight:700,flexShrink:0}}>M</div>
                <input type="text" value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Share something with your circle…" style={{flex:1,background:C.blush,borderRadius:14,padding:"14px 18px",color:C.slate,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,border:"none",outline:"none"}}/>
                <Btn onClick={submitPost} disabled={posting||!newPost.trim()} s={{padding:"10px 14px",fontSize:F.sm}}>{posting?'…':'Post'}</Btn>
              </div>
              {feed.length===0 && <div style={{background:"white",borderRadius:22,padding:"24px 20px",textAlign:"center",boxShadow:"0 3px 14px rgba(0,0,0,0.06)"}}><Sans s={{fontSize:F.md,color:C.muted}}>Be the first to share in this circle.</Sans></div>}
              {feed.map(p=>{ const ac=CIRCLE_COLORS[p.circle_id]||C.ruby; const av=(p.author||'M')[0].toUpperCase(); const time=new Date(p.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}); return (
                <div key={p.id} style={{background:"white",borderRadius:24,padding:24,boxShadow:"0 3px 14px rgba(0,0,0,0.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                    <div style={{width:48,height:48,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"'Cormorant Garamond',serif",fontSize:F.xl,fontWeight:700,flexShrink:0}}>{av}</div>
                    <div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block"}}>{p.author}</Serif><Sans s={{fontSize:F.sm,color:C.muted}}>{time}</Sans></div>
                    {p.topic&&<Chip color={ac} bg={ac+"15"}>{p.topic}</Chip>}
                  </div>
                  <Sans as="p" s={{fontSize:F.md,color:C.slate,lineHeight:1.8,margin:"0 0 18px"}}>{p.text}</Sans>
                  <div style={{display:"flex",gap:22,paddingTop:14,borderTop:`1px solid ${C.faint}`}}>
                    <button onClick={()=>toggleLike(p)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:p.liked?C.ruby:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontWeight:600,padding:0}}><span style={{fontSize:22}}>{p.liked?"♥":"♡"}</span>{p.likes||0}</button>
                  </div>
                </div>
              );})}
            </>
          )}
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
          {circles.map(c=>{ const color=c.color||CIRCLE_COLORS[c.id]||C.ruby; return (
            <div key={c.id} style={{background:"white",borderRadius:24,padding:"20px 22px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:56,height:56,borderRadius:18,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{c.emoji}</div>
              <div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block",marginBottom:2}}>{c.name}</Serif><Sans s={{fontSize:F.md,color:C.muted,display:"block"}}>{c.topic}</Sans></div>
              <button onClick={()=>handleJoin(c.id)} style={{background:c.joined?C.blush:"transparent",color:c.joined?C.ruby:C.slate,border:`2px solid ${c.joined?C.ruby:C.faint}`,borderRadius:14,padding:"11px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,fontWeight:600,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>
                {!kycVerified?"🔒 Join":(c.joined?"✓ Joined":"Join")}
              </button>
            </div>
          );})}
        </div>
      )}

      {view==="events"&&(
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
          <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:4}}>Upcoming Circle Events</Serif>
          {events.length===0 && <div style={{background:"white",borderRadius:22,padding:"24px 20px",textAlign:"center",boxShadow:"0 3px 14px rgba(0,0,0,0.06)"}}><Sans s={{fontSize:F.md,color:C.muted}}>No upcoming events.</Sans></div>}
          {events.map(ev=>{ const color=C.ruby; const going=ev.my_status==='going'; return (
            <div key={ev.id} style={{background:"white",borderRadius:24,overflow:"hidden",boxShadow:"0 3px 16px rgba(0,0,0,0.06)"}}>
              <div style={{background:color,padding:"13px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Sans s={{color:"white",fontSize:F.sm,letterSpacing:"0.1em",fontWeight:600}}>{(ev.circle||'').toUpperCase()}</Sans><Chip color="white" bg="rgba(255,255,255,0.22)" s={{fontSize:F.sm}}>{ev.going||0}/{ev.total||0} going</Chip></div>
              <div style={{padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}><span style={{fontSize:30,flexShrink:0}}>{ev.icon}</span><div style={{flex:1}}><Serif s={{fontSize:F.lg,color:C.slate,display:"block",marginBottom:5}}>{ev.name}</Serif><Sans s={{fontSize:F.md,color:C.muted}}>📅 {ev.date} · {ev.time}</Sans></div></div>
                {going?<div style={{background:C.sagePale,borderRadius:14,padding:"14px",textAlign:"center"}}><Sans s={{color:C.sage,fontWeight:600,fontSize:F.md}}>✓ You're going!</Sans></div>:<div style={{display:"flex",gap:10}}><Btn onClick={()=>handleRsvp(ev.id,'going')} s={{flex:1,padding:"14px 0",fontSize:F.md,background:color}}>RSVP ✦</Btn><Btn onClick={()=>handleRsvp(ev.id,'maybe')} v="ghost" s={{padding:"14px 18px",fontSize:F.md}}>Maybe</Btn></div>}
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

