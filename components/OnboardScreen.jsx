'use client';
// src/screens/OnboardScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn } from './UI';

const STEPS = [
  { key:'age',       type:'choice', q:"What's your age range?",              opts:["45–50","51–55","56–60","61–65","66+"] },
  { key:'context',   type:'choice', q:"Which best describes you?",            opts:["Working full-time","Working part-time","Career transition","Recently retired","Other"] },
  { key:'menopause', type:'choice', q:"What stage of menopause are you in?", opts:["Perimenopause","Menopause","Post-menopause","Not sure / prefer not to say"] },
  { key:'goals',     type:'multi',  q:"What matters most right now?",         hint:"Choose all that apply", opts:["Sustain energy at work","Reduce burnout","Improve sleep & focus","Build confidence","Stay physically strong","Navigate what's next"] },
  { key:'symptoms',  type:'multi',  q:"Any symptoms affecting your day-to-day?", hint:"We'll personalise your experience", opts:["Brain fog at work","Hot flashes","Joint pain","Fatigue","Sleep issues","Mood & stress"] },
];

export default function OnboardScreen({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [multi, setMulti]     = useState([]);
  const [saving, setSaving]   = useState(false);
  const cur = STEPS[step];
  const progress = (step + 1) / (STEPS.length + 1);

  async function choose(val) {
    const next = { ...answers, [cur.key]: val };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 260);
    } else {
      await finish(next);
    }
  }

  function toggleMulti(v) {
    setMulti(m => m.includes(v) ? m.filter(x => x !== v) : [...m, v]);
  }

  async function confirmMulti() {
    const next = { ...answers, [cur.key]: multi };
    setAnswers(next);
    if (step < STEPS.length - 1) { setMulti([]); setStep(s => s + 1); }
    else await finish(next);
  }

  async function finish(finalAnswers) {
    setSaving(true);
    const payload = {
      age_range: finalAnswers.age,
      work_context: finalAnswers.context,
      menopause_stage: finalAnswers.menopause,
      goals: finalAnswers.goals || [],
      tracked_symptoms: finalAnswers.symptoms || [],
    };
    await onComplete(payload);
    setSaving(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:C.cream, display:'flex', flexDirection:'column' }}>
      <div style={{ background:`linear-gradient(135deg,${C.rubyDeep},${C.ruby})`, padding:'58px 28px 34px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
          {step > 0 && <button onClick={() => setStep(s => s-1)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:12, width:44, height:44, color:'white', fontSize:22, cursor:'pointer' }}>←</button>}
          <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.2)', borderRadius:4 }}>
            <div style={{ height:'100%', width:`${progress*100}%`, background:'white', borderRadius:4, transition:'width 0.4s' }}/>
          </div>
        </div>
        <Serif as="h2" s={{ color:'white', fontSize:32, fontWeight:600, lineHeight:1.3, display:'block' }}>{cur.q}</Serif>
        {cur.hint && <Sans s={{ color:'rgba(255,255,255,0.7)', fontSize:F.md, display:'block', marginTop:8 }}>{cur.hint}</Sans>}
      </div>

      <div style={{ flex:1, padding:'32px 26px' }}>
        {cur.type === 'choice' && (
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {cur.opts.map(opt => (
              <button key={opt} onClick={() => choose(opt)} style={{ background:answers[cur.key]===opt?C.ruby:'white', color:answers[cur.key]===opt?'white':C.slate, border:`2px solid ${answers[cur.key]===opt?C.ruby:C.faint}`, borderRadius:14, padding:'18px 22px', textAlign:'left', fontFamily:"'DM Sans',sans-serif", fontSize:F.lg, cursor:'pointer', transition:'all 0.2s' }}>
                {opt}
              </button>
            ))}
          </div>
        )}
        {cur.type === 'multi' && (
          <div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:32 }}>
              {cur.opts.map(opt => {
                const sel = multi.includes(opt);
                return (
                  <button key={opt} onClick={() => toggleMulti(opt)} style={{ background:sel?C.ruby:'white', color:sel?'white':C.slate, border:`2px solid ${sel?C.ruby:C.faint}`, borderRadius:30, padding:'13px 22px', fontFamily:"'DM Sans',sans-serif", fontSize:F.md, cursor:'pointer', transition:'all 0.2s' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            <Btn onClick={confirmMulti} disabled={multi.length === 0 || saving} s={{ width:'100%', padding:'17px 0', fontSize:F.lg }}>
              {saving ? 'Saving…' : 'Continue →'}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
