'use client';
// src/screens/ProgramsScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip } from './UI';
import { useWallet } from '../lib/WalletContext';
import { api } from '../lib/api';
// ── PROGRAMS ──────────────────────────────────────────────────────────────────
const PROG_CATS=["All","Signature Programs","Wellness","Creative","Social","Outdoor","Learning","Confidence"];
const SCHEDULE_FILTERS=["Any time","Lunchtime (12–2pm)","After work (5pm+)","Weekend","Short (30–45 min)"];
const ALL_EVENTS=[
  {id:"rsl",cat:"Signature Programs",name:"Reclaim Strength & Balance",icon:"⚖️",color:C.ruby,intensity:"Gentle–Moderate",weeks:6,price:180,desc:"Functional strength, balance drills, posture correction and fall prevention.",outcomes:["Sit-to-stand","Walking confidence","Reduced stiffness"],next:"Mon Mar 17 · 10:00 AM",spots:4,host:"Sarah Chen, Physiotherapist"},
  {id:"esr",cat:"Signature Programs",name:"Energy & Sleep Reset",icon:"🌙",color:C.indigo,intensity:"Gentle",weeks:4,price:140,desc:"Gentle cardio, breathwork, sleep hygiene coaching and evening routines.",outcomes:["Better sleep","More daytime energy","Calmer nervous system"],next:"Wed Mar 19 · 2:00 PM",spots:6,host:"Dr. Priya Nair"},
  {id:"bbv",cat:"Signature Programs",name:"Brain & Body Vitality",icon:"🧠",color:C.teal,intensity:"Moderate",weeks:6,price:180,desc:"Dual-task exercises, rhythm, coordination drills and problem-solving games.",outcomes:["Sharper cognition","Better coordination","Improved mood"],next:"Thu Mar 20 · 11:00 AM",spots:3,host:"Dr. Amanda Koh"},
  {id:"cr",cat:"Signature Programs",name:"Confidence & Rediscovery",icon:"✨",color:C.gold,intensity:"Social",weeks:5,price:150,desc:"Goal-setting, group reflection, assertiveness and trying new things safely.",outcomes:["Clearer self-identity","New social bonds"],next:"Fri Mar 21 · 3:00 PM",spots:5,host:"Lisa Brooks"},
  {id:"pm",cat:"Signature Programs",name:"Pain & Mobility Support",icon:"🦵",color:C.sage,intensity:"Very Gentle",weeks:6,price:160,desc:"For women with arthritis or recovering from injury.",outcomes:["Reduced pain","More mobile joints"],next:"Tue Mar 18 · 9:30 AM",spots:7,host:"Dr. Mei Zhang"},
  {id:"wl1",cat:"Wellness",name:"Tai Chi in the Park",icon:"🌿",color:C.sage,price:15,desc:"Outdoor balance and mindfulness at Gage Park.",next:"Sat Mar 22 · 9:00 AM",spots:12,host:"Min Li"},
  {id:"cr1",cat:"Creative",name:"Watercolour Workshop",icon:"🎨",color:C.lavender,price:28,desc:"Beginner-friendly painting. All supplies included.",next:"Tue Mar 25 · 1:00 PM",spots:10,host:"Angela Morris"},
  {id:"cr2",cat:"Creative",name:"Anti-Inflammatory Cooking",icon:"🥗",color:C.sage,price:38,desc:"Cook meals proven to reduce joint inflammation.",next:"Sun Mar 23 · 2:00 PM",spots:6,host:"Chef Dionne Wallace"},
  {id:"sc1",cat:"Social",name:"Ontario Lunch Club",icon:"☕",color:C.ruby,price:0,desc:"Monthly lunch at a local restaurant.",next:"Fri Mar 28 · 12:00 PM",spots:15,host:"Her Ruby"},
  {id:"out1",cat:"Outdoor",name:"Nordic Walking Clinic",icon:"🚶‍♀️",color:C.sage,price:15,desc:"Low-impact full-body walk using poles.",next:"Sat Mar 22 · 9:00 AM",spots:8,host:"Certified NW Instructor"},
  {id:"le1",cat:"Learning",name:"Smartphone Safety Workshop",icon:"📱",color:C.indigo,price:0,desc:"Avoid scams, use apps safely.",next:"Thu Mar 27 · 2:00 PM",spots:20,host:"Digital Literacy Canada"},
  {id:"le2",cat:"Learning",name:"Solo Travel Confidence",icon:"✈️",color:C.gold,price:0,desc:"Plan and enjoy solo travel safely.",next:"Thu Mar 27 · 6:00 PM",spots:20,host:"Linda Marsh"},
];
function PayModal({event,onClose,onConfirm,walletBalance=0,onUseCredits}){
  const [method,setMethod]=useState(null);
  const [paid,setPaid]=useState(false);
  if(!event)return null;
  const isFree=event.price===0;
  const creditsNeeded=Math.ceil(event.price/20);
  const canPayWithWallet=walletBalance>=creditsNeeded&&event.price>0;
  const total=(event.price*1.13).toFixed(2);
  function handlePay(){if(method==="wallet"&&onUseCredits)onUseCredits(creditsNeeded);setPaid(true);}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(20,10,10,0.65)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.cream,borderRadius:"28px 28px 0 0",width:"100%",maxWidth:430,padding:"30px 26px 54px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{width:48,height:5,background:"#DDD",borderRadius:3,margin:"0 auto 26px"}}/>
        {!paid?(
          <div>
            <Serif as="h3" s={{fontSize:F.xxl,color:C.slate,display:"block",marginBottom:6}}>{event.name}</Serif>
            <Sans s={{fontSize:F.md,color:C.muted,display:"block",marginBottom:22}}>{event.next}</Sans>
            <div style={{background:"white",borderRadius:20,padding:"20px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:22}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:isFree?0:12}}><Sans s={{fontSize:F.md,color:C.slate}}>Session fee</Sans><Sans s={{fontSize:F.md,color:C.slate,fontWeight:600}}>{isFree?"Free":"$"+event.price}</Sans></div>
              {!isFree&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><Sans s={{fontSize:F.md,color:C.muted}}>HST (13%)</Sans><Sans s={{fontSize:F.md,color:C.muted}}>${(event.price*0.13).toFixed(2)}</Sans></div><div style={{borderTop:`1px solid ${C.faint}`,paddingTop:14,display:"flex",justifyContent:"space-between"}}><Sans s={{fontSize:F.lg,color:C.slate,fontWeight:600}}>Total</Sans><Serif s={{fontSize:F.xl,color:C.ruby,fontWeight:700}}>${total} CAD</Serif></div></div>}
            </div>
            {!isFree&&(
              <div>
                <Sans s={{fontSize:F.sm,color:C.muted,letterSpacing:"0.12em",fontWeight:600,display:"block",marginBottom:14}}>PAYMENT METHOD</Sans>
                {canPayWithWallet&&(
                  <button onClick={()=>setMethod("wallet")} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:method==="wallet"?C.blush:"white",border:`2px solid ${method==="wallet"?C.ruby:C.faint}`,borderRadius:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>
                    <div style={{width:40,height:40,borderRadius:12,background:method==="wallet"?C.ruby:C.parchment,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>◆</div>
                    <div style={{flex:1}}><Sans s={{fontSize:F.md,color:C.slate,fontWeight:method==="wallet"?600:400,display:"block"}}>Wellness Wallet</Sans><Sans s={{fontSize:F.sm,color:C.sage}}>Use {creditsNeeded} credits — {walletBalance-creditsNeeded} remaining</Sans></div>
                    {method==="wallet"&&<span style={{color:C.ruby,fontSize:F.lg}}>✓</span>}
                  </button>
                )}
                {[{id:"card",label:"Credit / Debit Card",icon:"💳"},{id:"apple",label:"Apple Pay",icon:"🍎"},{id:"google",label:"Google Pay",icon:"🔵"}].map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:method===m.id?C.blush:"white",border:`2px solid ${method===m.id?C.ruby:C.faint}`,borderRadius:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>
                    <span style={{fontSize:24}}>{m.icon}</span><Sans s={{fontSize:F.md,color:C.slate,fontWeight:method===m.id?600:400,flex:1}}>{m.label}</Sans>{method===m.id&&<span style={{color:C.ruby,fontSize:F.lg}}>✓</span>}
                  </button>
                ))}
                {method==="card"&&<div style={{background:"white",borderRadius:14,padding:"18px",border:`2px solid ${C.faint}`,marginBottom:18}}><input placeholder="Card number" style={{width:"100%",border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,color:C.slate,marginBottom:14,background:"transparent",display:"block"}}/><div style={{display:"flex",gap:14}}><input placeholder="MM / YY" style={{flex:1,border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,color:C.slate,background:"transparent"}}/><input placeholder="CVV" style={{width:80,border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,color:C.slate,background:"transparent"}}/></div></div>}
              </div>
            )}
            <Btn onClick={handlePay} disabled={!isFree&&!method} s={{width:"100%",padding:"17px 0",fontSize:F.lg,marginTop:8}} v={isFree?"sage":method==="wallet"?"gold":"primary"}>
              {isFree?"Reserve Free Spot ✦":method==="wallet"?`Pay with ${creditsNeeded} Credits ✦`:`Pay $${total} ✦`}
            </Btn>
            <Sans s={{fontSize:F.sm,color:C.muted,display:"block",textAlign:"center",marginTop:14}}>🔒 Secure · Cancel up to 24 hrs before</Sans>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:60,marginBottom:22}}>🎉</div>
            <Serif s={{fontSize:F.xxl,color:C.slate,display:"block",marginBottom:12}}>You're booked!</Serif>
            <Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.8,marginBottom:26}}>{event.name}<br/>{event.next}<br/><br/>Confirmation sent. Reminder 1 hour before.</Sans>
            <Btn onClick={()=>{onConfirm(event.id);onClose();}} s={{width:"100%",padding:"17px 0",fontSize:F.lg}}>Done ✦</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
export default function ProgramsScreen({kycVerified=false,onStartKYC}){
  const { balance: walletBalance, deductCredits: onUseCredits } = useWallet();
  const [cat,setCat]=useState("All");
  const [schedule,setSchedule]=useState("Any time");
  const [expanded,setExpanded]=useState(null);
  const [payEvent,setPayEvent]=useState(null);
  const [booked,setBooked]=useState({});
  const visible=cat==="All"?ALL_EVENTS:ALL_EVENTS.filter(e=>e.cat===cat);

  function handleBook(ev,e){
    e.stopPropagation();
    if(!ev.price||ev.price===0){setPayEvent(ev);return;}
    // Paid events require KYC — verify once, unlocked everywhere
    if(!kycVerified&&onStartKYC){onStartKYC();return;}
    setPayEvent(ev);
  }

  return(
    <div style={{paddingBottom:90}}>
      {payEvent&&<PayModal event={payEvent} onClose={()=>setPayEvent(null)} onConfirm={id=>setBooked(b=>({...b,[id]:true}))} walletBalance={walletBalance} onUseCredits={onUseCredits}/>}
      <div style={{background:`linear-gradient(150deg,${C.rubyDeep},${C.ruby})`,padding:"58px 26px 26px"}}>
        <Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,letterSpacing:"0.16em",display:"block",marginBottom:8}}>DISCOVER & BOOK</Sans>
        <Serif as="h1" s={{color:"white",fontSize:F.hero,fontWeight:700,display:"block",marginBottom:6}}>My Program</Serif>
        <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,display:"block",marginBottom:16}}>In-person · digital · employer-funded</Sans>
        <div style={{overflowX:"auto",display:"flex",gap:8,paddingBottom:8}}>{PROG_CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{flexShrink:0,background:cat===c?"white":"rgba(255,255,255,0.15)",color:cat===c?C.ruby:"white",border:"none",borderRadius:22,padding:"10px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,cursor:"pointer",fontWeight:cat===c?600:400,transition:"all 0.2s",whiteSpace:"nowrap"}}>{c}</button>)}</div>
        <div style={{overflowX:"auto",display:"flex",gap:8,paddingBottom:4,marginTop:8}}>{SCHEDULE_FILTERS.map(f=><button key={f} onClick={()=>setSchedule(f)} style={{flexShrink:0,background:schedule===f?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.08)",color:schedule===f?C.rubyDeep:"rgba(255,255,255,0.8)",border:`1px solid ${schedule===f?"transparent":"rgba(255,255,255,0.25)"}`,borderRadius:20,padding:"7px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:F.xs,cursor:"pointer",fontWeight:schedule===f?600:400,transition:"all 0.2s",whiteSpace:"nowrap"}}>🕐 {f}</button>)}</div>
      </div>
      <div style={{padding:"18px 24px"}}>
        {/* KYC notice — shown only when not verified, disappears once done */}
        {!kycVerified&&(
          <div style={{background:`linear-gradient(135deg,${C.rubyDeep},#5A1215)`,borderRadius:20,padding:"18px 20px",marginBottom:16,display:"flex",gap:14,alignItems:"flex-start"}}>
            <span style={{fontSize:26,flexShrink:0}}>🔒</span>
            <div style={{flex:1}}>
              <Sans s={{color:"white",fontSize:F.md,fontWeight:600,display:"block",marginBottom:4}}>Verify your identity to book paid sessions</Sans>
              <Sans s={{color:"rgba(255,255,255,0.75)",fontSize:F.sm,lineHeight:1.65,display:"block",marginBottom:12}}>Free sessions are open to all. Paid programmes require a one-time ID check — keeping Her Ruby a safe, trusted space for every woman.</Sans>
              <Btn onClick={onStartKYC} v="white" s={{padding:"10px 18px",fontSize:F.sm}}>Verify Now — 2 min ✦</Btn>
            </div>
          </div>
        )}
        {kycVerified&&(
          <div style={{background:C.sagePale,borderRadius:16,padding:"12px 16px",marginBottom:16,border:`1px solid ${C.sage}40`,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>✓</span>
            <Sans s={{fontSize:F.md,color:C.sage,fontWeight:500}}>Identity verified — all sessions unlocked</Sans>
          </div>
        )}
        {visible.map(ev=>{
          const open=expanded===ev.id,isBooked=booked[ev.id],isFree=ev.price===0;
          return(
            <div key={ev.id} onClick={()=>setExpanded(open?null:ev.id)} style={{background:"white",borderRadius:24,boxShadow:open?`0 10px 40px ${ev.color}25`:"0 3px 16px rgba(0,0,0,0.06)",overflow:"hidden",cursor:"pointer",border:`2px solid ${open?ev.color:"transparent"}`,transition:"all 0.3s",marginBottom:14}}>
              <div style={{background:ev.color,padding:"13px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{ev.icon}</span><Sans s={{color:"white",fontSize:F.sm,letterSpacing:"0.1em",fontWeight:600}}>{ev.cat.toUpperCase()}</Sans></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>{ev.weeks&&<Chip color="white" bg="rgba(255,255,255,0.22)" s={{fontSize:F.xs}}>{ev.weeks} wks</Chip>}{ev.intensity&&<Chip color="white" bg="rgba(255,255,255,0.22)" s={{fontSize:F.xs}}>{ev.intensity}</Chip>}</div>
              </div>
              <div style={{padding:"20px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><Serif s={{fontSize:F.xl,color:C.slate,display:"block",flex:1,marginRight:12}}>{ev.name}</Serif><Serif s={{fontSize:F.xl,color:isFree?C.sage:C.ruby,fontWeight:700,flexShrink:0}}>{isFree?"Free":"$"+ev.price}</Serif></div>
                <Sans s={{fontSize:F.md,color:C.muted,display:"block",marginBottom:10}}>📅 {ev.next} · {ev.spots} spots</Sans>
                {open&&<div>
                  <Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.75,marginBottom:14}}>{ev.desc}</Sans>
                  {ev.outcomes&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{ev.outcomes.map(o=><Chip key={o} color={ev.color} bg={ev.color+"15"}>{o}</Chip>)}</div>}
                  <Sans s={{fontSize:F.sm,color:C.muted,display:"block",marginBottom:16}}>Hosted by <strong style={{color:C.slate}}>{ev.host}</strong></Sans>
                  {isBooked?(
                    <div style={{background:C.sagePale,borderRadius:14,padding:"15px",textAlign:"center"}}><Sans s={{color:C.sage,fontWeight:600,fontSize:F.lg}}>✓ Booked! Reminder set.</Sans></div>
                  ):(
                    <div>
                      {!isFree&&!kycVerified&&(
                        <div style={{background:C.parchment,borderRadius:12,padding:"11px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"center",border:`1px solid ${C.faint}`}}>
                          <span style={{fontSize:16}}>🔒</span>
                          <Sans s={{fontSize:F.sm,color:C.muted,lineHeight:1.5}}>Paid sessions require a one-time identity check to keep Her Ruby safe</Sans>
                        </div>
                      )}
                      <Btn onClick={e=>handleBook(ev,e)} s={{width:"100%",padding:"16px 0",fontSize:F.lg,background:ev.color}}>
                        {isFree?"Reserve Free Spot ✦":!kycVerified?"Verify Identity & Book ✦":"Book & Pay ✦"}
                      </Btn>
                    </div>
                  )}
                </div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

