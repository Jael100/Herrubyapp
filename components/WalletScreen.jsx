'use client';
// src/screens/WalletScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Chip, Input } from './UI';
import { useWallet } from '../lib/WalletContext';
import { api } from '../lib/api';
// ── WALLET ────────────────────────────────────────────────────────────────────
const WALLET_ITEMS=[{id:"w1",name:"Brain & Body Vitality — 6 weeks",icon:"🧠",color:C.teal,credits:4,price:180,cat:"Programme"},{id:"w2",name:"Energy & Sleep Reset — 4 weeks",icon:"🌙",color:C.indigo,credits:3,price:140,cat:"Programme"},{id:"w3",name:"Lunch-Hour Strength Class (×4)",icon:"⚖️",color:C.ruby,credits:2,price:80,cat:"Sessions"},{id:"w4",name:"Executive Women's Walking Group (×8)",icon:"🚶‍♀️",color:C.sage,credits:2,price:60,cat:"Experiences"},{id:"w5",name:"Anti-Inflammatory Cooking Class",icon:"🥗",color:C.sage,credits:1,price:38,cat:"Experiences"},{id:"w6",name:"Solo Travel Confidence Workshop",icon:"✈️",color:C.gold,credits:1,price:0,cat:"Learning"},{id:"w7",name:"1-on-1 Wellness Coaching Session",icon:"💬",color:C.lavender,credits:2,price:120,cat:"Coaching"},{id:"w8",name:"Style & Confidence Workshop",icon:"✨",color:C.gold,credits:1,price:25,cat:"Experiences"}];
const CREDIT_PACKS=[{id:"p1",credits:5,price:100,label:"Starter",desc:"Try a programme or 2 experiences",popular:false},{id:"p2",credits:10,price:180,label:"Monthly",desc:"Full month of sessions & content",popular:true},{id:"p3",credits:20,price:320,label:"Quarterly",desc:"Best value — 3 months",popular:false}];


export default function WalletScreen(){
  const { balance, transactions, refresh, addCredits, deductCredits } = useWallet();
  const [wView,setWView]=useState("overview");
  const [redeemed,setRedeemed]=useState({});
  const [showTopUp,setShowTopUp]=useState(false);
  const [showGift,setShowGift]=useState(false);
  const [localTx,setLocalTx]=useState([]);
  const [selPkg,setSelPkg]=useState(null);
  const [topupDone,setTopupDone]=useState(false);
  const [topupLoading,setTopupLoading]=useState(false);
  const [giftEmail,setGiftEmail]=useState("");
  const [giftPkg,setGiftPkg]=useState(null);
  const [giftMsg,setGiftMsg]=useState("");
  const [giftSent,setGiftSent]=useState(false);
  const [giftLoading,setGiftLoading]=useState(false);
  const [giftCode,setGiftCode]=useState("");
  // Redeem gift code state
  const [redeemCode,setRedeemCode]=useState("");
  const [redeemLoading,setRedeemLoading]=useState(false);
  const [redeemResult,setRedeemResult]=useState(null);
  const [redeemError,setRedeemError]=useState("");

  async function handleTopUp() {
    if (!selPkg) return;
    setTopupLoading(true);
    try {
      const result = await api.wallet.initiateTopup(selPkg.id);
      if (result?.mode === 'stripe' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result?.ok) {
        addCredits(selPkg.credits, {date:"Today",desc:`Top-up: ${selPkg.label} (${selPkg.credits} credits)`,credits:+selPkg.credits,icon:"💳",color:C.indigo});
        setTopupDone(true);
        refresh();
      }
    } catch (err) {
      alert(err.message || 'Top-up failed. Please try again.');
    }
    setTopupLoading(false);
  }

  async function handleGiftSend() {
    if (!giftEmail || !giftPkg) return;
    setGiftLoading(true);
    try {
      const result = await api.wallet.sendGift({
        recipientEmail: giftEmail,
        credits: giftPkg.credits,
        message: giftMsg,
      });
      if (result.ok) {
        setGiftCode(result.code || '');
        deductCredits(giftPkg.credits);
        setGiftSent(true);
        refresh();
      }
    } catch (err) {
      alert(err.message || 'Gift send failed. Please try again.');
    }
    setGiftLoading(false);
  }

  async function handleRedeem() {
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    setRedeemError("");
    setRedeemResult(null);
    try {
      const result = await api.wallet.redeemGift(redeemCode.trim());
      setRedeemResult(result);
      addCredits(result.credits, {date:"Today",desc:`Gift redeemed: ${result.credits} credits`,credits:+result.credits,icon:"🎁",color:C.sage});
      refresh();
    } catch (err) {
      setRedeemError(err.message || 'Invalid or already redeemed code.');
    }
    setRedeemLoading(false);
  }

  if(showTopUp){return(
    <div style={{position:"fixed",inset:0,background:"rgba(20,10,10,0.65)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setShowTopUp(false);setTopupDone(false);setSelPkg(null);}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.cream,borderRadius:"28px 28px 0 0",width:"100%",maxWidth:430,padding:"30px 26px 54px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:48,height:5,background:"#DDD",borderRadius:3,margin:"0 auto 24px"}}/>
        {!topupDone?<div>
          <Serif as="h3" s={{fontSize:F.xxl,color:C.slate,display:"block",marginBottom:8}}>Top Up Wallet</Serif>
          <Sans s={{fontSize:F.md,color:C.muted,display:"block",marginBottom:22}}>Credits never expire. Roll over month to month.</Sans>
          {CREDIT_PACKS.map(pkg=><div key={pkg.id} onClick={()=>setSelPkg(pkg)} style={{background:"white",borderRadius:18,padding:"18px 20px",border:`2px solid ${selPkg?.id===pkg.id?C.ruby:C.faint}`,marginBottom:12,cursor:"pointer",transition:"all 0.2s",position:"relative"}}>
            {pkg.popular&&<div style={{position:"absolute",top:-1,right:14,background:C.ruby,color:"white",borderRadius:"0 0 10px 10px",padding:"3px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:F.xs,fontWeight:600}}>BEST VALUE</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Sans s={{fontSize:F.lg,color:C.slate,fontWeight:600,display:"block",marginBottom:2}}>{pkg.label} — {pkg.credits} credits</Sans><Sans s={{fontSize:F.sm,color:C.sage}}>= ${pkg.credits*20} value</Sans></div><Serif s={{fontSize:F.xxl,color:C.ruby,fontWeight:700}}>${pkg.price}</Serif></div>
          </div>)}
          <Btn onClick={handleTopUp} disabled={!selPkg||topupLoading} s={{width:"100%",padding:"17px 0",fontSize:F.lg,marginTop:8}}>{topupLoading?'Processing…':selPkg?`Pay $${selPkg.price} ✦`:"Select a Package"}</Btn>
        </div>:<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:56,marginBottom:20}}>✦</div><Serif s={{fontSize:F.xxl,color:C.slate,display:"block",marginBottom:10}}>Credits added!</Serif><Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.7,marginBottom:22}}>{selPkg?.credits} credits added. New balance: <strong>{balance} credits</strong></Sans><Btn onClick={()=>{setShowTopUp(false);setTopupDone(false);setSelPkg(null);}} s={{width:"100%",padding:"16px 0",fontSize:F.lg}}>Done ✦</Btn></div>}
      </div>
    </div>
  );}

  if(showGift){return(
    <div style={{position:"fixed",inset:0,background:"rgba(20,10,10,0.65)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setShowGift(false);setGiftSent(false);setGiftCode("");}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.cream,borderRadius:"28px 28px 0 0",width:"100%",maxWidth:430,padding:"30px 26px 54px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:48,height:5,background:"#DDD",borderRadius:3,margin:"0 auto 24px"}}/>
        {!giftSent?<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}><span style={{fontSize:36}}>🎁</span><div><Serif as="h3" s={{fontSize:F.xxl,color:C.slate,display:"block"}}>Send a Wellness Gift</Serif><Sans s={{fontSize:F.md,color:C.muted}}>Give someone you love the gift of Her Ruby</Sans></div></div>
          <Input label="Recipient's email" type="email" value={giftEmail} onChange={setGiftEmail} placeholder="e.g. mum@email.com"/>
          <Sans s={{fontSize:F.sm,color:C.muted,letterSpacing:"0.12em",fontWeight:600,display:"block",marginBottom:14}}>CHOOSE AN AMOUNT</Sans>
          {CREDIT_PACKS.map(pkg=><div key={pkg.id} onClick={()=>setGiftPkg(pkg)} style={{background:"white",borderRadius:16,padding:"16px 18px",border:`2px solid ${giftPkg?.id===pkg.id?C.ruby:C.faint}`,marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s"}}><Sans s={{fontSize:F.md,color:C.slate,fontWeight:giftPkg?.id===pkg.id?600:400}}>{pkg.label} — {pkg.credits} credits</Sans><Serif s={{fontSize:F.xl,color:C.ruby,fontWeight:700}}>${pkg.price}</Serif></div>)}
          <div style={{marginTop:8,marginBottom:20}}><Sans s={{fontSize:F.sm,color:C.muted,letterSpacing:"0.12em",fontWeight:600,display:"block",marginBottom:8}}>PERSONAL MESSAGE (optional)</Sans><textarea value={giftMsg} onChange={e=>setGiftMsg(e.target.value)} placeholder="e.g. Mum — this is for you. You deserve to feel amazing. 💕" rows={3} style={{width:"100%",border:`2px solid ${C.faint}`,borderRadius:14,padding:"14px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:F.md,color:C.slate,resize:"none",outline:"none",background:"white",boxSizing:"border-box",lineHeight:1.6}}/></div>
          <Btn onClick={handleGiftSend} disabled={!giftEmail||!giftPkg||giftLoading} s={{width:"100%",padding:"16px 0",fontSize:F.lg,background:C.gold}}>{giftLoading?'Sending…':`Send Gift ${giftPkg?'$'+giftPkg.price:''} ✦`}</Btn>
          {balance < (giftPkg?.credits||0) && giftPkg && <Sans s={{fontSize:F.sm,color:C.ruby,display:"block",textAlign:"center",marginTop:10}}>You need {(giftPkg.credits - balance)} more credits. <span onClick={()=>{setShowGift(false);setShowTopUp(true);}} style={{fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>Top up first.</span></Sans>}
        </div>:<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:56,marginBottom:20}}>🎁</div><Serif s={{fontSize:F.xxl,color:C.slate,display:"block",marginBottom:12}}>Gift sent!</Serif><Sans s={{fontSize:F.md,color:C.muted,display:"block",lineHeight:1.8,marginBottom:22}}>{giftEmail} will receive their {giftPkg?.label} by email with a redemption code. What a beautiful thing to do. 💕</Sans>{giftCode&&<div style={{background:C.blush,borderRadius:14,padding:"14px 18px",marginBottom:20}}><Sans s={{fontSize:F.sm,color:C.muted,display:"block",marginBottom:4}}>Gift code:</Sans><Sans s={{fontSize:F.xl,color:C.ruby,fontWeight:700,letterSpacing:"0.1em"}}>{giftCode}</Sans></div>}<Btn onClick={()=>{setShowGift(false);setGiftSent(false);setGiftCode("");}} s={{width:"100%",padding:"16px 0",fontSize:F.lg}}>Done ✦</Btn></div>}
      </div>
    </div>
  );}

  return(
    <div style={{paddingBottom:90}}>
      <div style={{background:`linear-gradient(150deg,${C.rubyDeep},${C.ruby})`,padding:"58px 26px 28px",position:"relative",overflow:"hidden"}}>
        {[200,320].map((sz,i)=><div key={i} style={{position:"absolute",width:sz,height:sz,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.07)",top:i===0?-50:-80,right:i===0?-60:-30}}/>)}
        <div style={{position:"relative",zIndex:1}}>
          <Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,letterSpacing:"0.16em",display:"block",marginBottom:8}}>YOUR WELLNESS BUDGET</Sans>
          <Serif as="h1" s={{color:"white",fontSize:F.hero,fontWeight:700,display:"block",marginBottom:6}}>Wellness Wallet</Serif>
          <Sans s={{color:"rgba(255,255,255,0.8)",fontSize:F.md,display:"block",marginBottom:22}}>Fund yourself · Accept a gift · Use employer credits</Sans>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:22,padding:"22px 22px",border:"1px solid rgba(255,255,255,0.2)",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,display:"block",marginBottom:6}}>AVAILABLE CREDITS</Sans><Serif s={{color:"white",fontSize:52,fontWeight:700,lineHeight:1,display:"block"}}>{balance}</Serif><Sans s={{color:"rgba(255,255,255,0.65)",fontSize:F.sm}}>= ${balance*20} of value</Sans></div>
              <div style={{textAlign:"right"}}><Sans s={{color:"rgba(255,255,255,0.7)",fontSize:F.sm,display:"block",marginBottom:4}}>FUNDING</Sans><div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 14px"}}><Sans s={{color:"white",fontSize:F.sm,fontWeight:600}}>💼 Employer + Self</Sans></div></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowTopUp(true)} style={{flex:1,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"10px 0",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,fontWeight:600,cursor:"pointer"}}>+ Top Up</button>
              <button onClick={()=>setShowGift(true)} style={{flex:1,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"10px 0",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,fontWeight:600,cursor:"pointer"}}>🎁 Send Gift</button>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>{[["overview","How it works"],["redeem","Redeem"],["history","History"]].map(([v,l])=><button key={v} onClick={()=>setWView(v)} style={{background:wView===v?"white":"rgba(255,255,255,0.15)",color:wView===v?C.ruby:"white",border:"none",borderRadius:20,padding:"9px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:F.sm,cursor:"pointer",fontWeight:wView===v?600:400,transition:"all 0.2s"}}>{l}</button>)}</div>
        </div>
      </div>

      {wView==="overview"&&<div style={{padding:"22px 24px"}}>
        {/* Gift Code Redemption Card */}
        <div style={{background:"white",borderRadius:22,padding:"22px 22px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:20,border:`2px solid ${C.goldLight}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <span style={{fontSize:24}}>🎁</span>
            <Serif s={{fontSize:F.xl,color:C.slate,fontWeight:700}}>Have a gift code?</Serif>
          </div>
          <div style={{display:"flex",gap:10}}>
            <input
              type="text" value={redeemCode} onChange={e=>setRedeemCode(e.target.value.toUpperCase())}
              placeholder="RUBY-XXXX-XXXX"
              style={{flex:1,padding:"13px 16px",border:`2px solid ${C.faint}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:F.md,color:C.slate,outline:"none",background:"#FAFAFA",letterSpacing:"0.08em",fontWeight:600}}
            />
            <Btn onClick={handleRedeem} disabled={!redeemCode.trim()||redeemLoading} s={{padding:"13px 20px",fontSize:F.sm}}>{redeemLoading?'...':'Redeem'}</Btn>
          </div>
          {redeemError&&<Sans s={{fontSize:F.sm,color:C.ruby,display:"block",marginTop:10}}>{redeemError}</Sans>}
          {redeemResult&&<div style={{background:C.sagePale,borderRadius:12,padding:"12px 16px",marginTop:12}}>
            <Sans s={{fontSize:F.md,color:C.sage,fontWeight:600}}>+{redeemResult.credits} credits added to your wallet!</Sans>
            {redeemResult.message&&<Sans s={{fontSize:F.sm,color:C.muted,display:"block",marginTop:6,fontStyle:"italic"}}>"{redeemResult.message}"</Sans>}
          </div>}
        </div>

        {[{icon:"💳",title:"Fund your wallet",desc:"Buy credits yourself, receive them as a gift, or have your employer allocate them.",color:C.ruby},{icon:"◆",title:"1 credit = $20 of value",desc:"Use credits across programmes, experiences, coaching and workshops.",color:C.gold},{icon:"🎁",title:"Give the gift of wellness",desc:"Buy credits for a friend or loved one. They get a gift email.",color:C.sage},{icon:"💼",title:"Ask your employer",desc:"Many Canadian companies fund Her Ruby as a benefit. Share our HR one-pager.",color:C.indigo}].map((s,i)=><div key={i} style={{background:"white",borderRadius:20,padding:"18px 20px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}><div style={{width:48,height:48,borderRadius:16,background:s.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{s.icon}</div><div><Sans s={{fontSize:F.lg,fontWeight:600,color:C.slate,display:"block",marginBottom:4}}>{s.title}</Sans><Sans s={{fontSize:F.md,color:C.muted,lineHeight:1.65}}>{s.desc}</Sans></div></div>)}
        <Btn onClick={()=>setShowTopUp(true)} s={{width:"100%",padding:"16px 0",fontSize:F.lg,marginTop:8}}>Top Up My Wallet ✦</Btn>
      </div>}

      {wView==="redeem"&&<div style={{padding:"22px 24px"}}>
        <div style={{background:C.goldPale,borderRadius:18,padding:"14px 18px",border:`1.5px solid ${C.goldLight}`,marginBottom:20,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:24}}>💡</span><Sans s={{fontSize:F.md,color:C.slate,lineHeight:1.65}}><strong>{balance} credits.</strong> Each = $20. <span onClick={()=>setShowTopUp(true)} style={{color:C.ruby,fontWeight:600,cursor:"pointer"}}>Top up here.</span></Sans></div>
        {["Programme","Sessions","Experiences","Learning","Coaching"].map(cat=>{
          const items=WALLET_ITEMS.filter(w=>w.cat===cat);if(!items.length)return null;
          return <div key={cat} style={{marginBottom:24}}><Serif as="h3" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:14}}>{cat}</Serif>{items.map(item=>{const canAfford=balance>=item.credits,done=redeemed[item.id];return <div key={item.id} style={{background:"white",borderRadius:20,padding:"18px 20px",boxShadow:"0 3px 14px rgba(0,0,0,0.05)",marginBottom:12,display:"flex",alignItems:"center",gap:14,opacity:canAfford?1:0.6}}><div style={{width:52,height:52,borderRadius:16,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{item.icon}</div><div style={{flex:1}}><Serif s={{fontSize:F.md,color:C.slate,display:"block",marginBottom:6}}>{item.name}</Serif><div style={{display:"flex",gap:8,alignItems:"center"}}><Chip color={item.color} bg={item.color+"15"}>{item.credits} credit{item.credits>1?"s":""}</Chip><Sans s={{fontSize:F.sm,color:C.muted}}>= ${item.credits*20}</Sans></div></div>{done?<div style={{background:C.sagePale,borderRadius:12,padding:"10px 14px",flexShrink:0}}><Sans s={{color:C.sage,fontWeight:600,fontSize:F.sm}}>✓ Redeemed</Sans></div>:<Btn onClick={()=>{if(canAfford){setRedeemed(r=>({...r,[item.id]:true}));deductCredits(item.credits);setLocalTx(h=>[{date:"Today",desc:item.name,credits:-item.credits,icon:item.icon,color:item.color},...h]);}else setShowTopUp(true);}} s={{padding:"11px 18px",fontSize:F.sm,flexShrink:0,background:canAfford?item.color:C.ruby}}>{canAfford?"Redeem":"Top Up"}</Btn>}</div>;})}</div>;
        })}
      </div>}

      {wView==="history"&&(()=>{const allTx=[...localTx,...(transactions||[])];return <div style={{padding:"22px 24px"}}>
        <Serif as="h2" s={{fontSize:F.xl,color:C.slate,display:"block",marginBottom:18}}>Credit History</Serif>
        {allTx.length === 0 && <div style={{textAlign:"center",padding:"40px 0"}}><span style={{fontSize:48,display:"block",marginBottom:16}}>📋</span><Sans s={{fontSize:F.md,color:C.muted}}>No transactions yet. Top up or redeem a gift code to get started.</Sans></div>}
        {allTx.map((t,i)=><div key={i} style={{background:"white",borderRadius:18,padding:"16px 20px",boxShadow:"0 2px 10px rgba(0,0,0,0.04)",marginBottom:12,display:"flex",alignItems:"center",gap:14}}><div style={{width:46,height:46,borderRadius:14,background:(t.color||C.ruby)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon||"◆"}</div><div style={{flex:1}}><Sans s={{fontSize:F.xs,color:C.muted,display:"block",marginBottom:3}}>{t.date}</Sans><Sans s={{fontSize:F.md,color:C.slate}}>{t.desc}</Sans></div><Serif s={{fontSize:F.xl,fontWeight:700,color:t.credits>0?C.sage:C.ruby,flexShrink:0}}>{t.credits>0?"+":""}{t.credits}</Serif></div>)}
      </div>;})()}
    </div>
  );
}
