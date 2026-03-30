'use client';
// src/screens/KYCScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn } from './UI';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

function MockUpload({ label, icon, uploaded, onUpload }) {
  return (
    <div onClick={() => onUpload(true)}
      style={{ border: `2px dashed ${uploaded ? C.sage : C.faint}`, borderRadius: 20, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: uploaded ? C.sagePale : 'white', transition: 'all 0.25s' }}>
      {uploaded ? (
        <div><div style={{ fontSize: 48, marginBottom: 12 }}>✓</div><Sans s={{ fontSize: F.lg, color: C.sage, fontWeight: 600, display: 'block' }}>Uploaded</Sans><Sans s={{ fontSize: F.sm, color: C.muted, display: 'block', marginTop: 4 }}>Tap to replace</Sans></div>
      ) : (
        <div><div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div><Sans s={{ fontSize: F.lg, color: C.slate, fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</Sans><Sans s={{ fontSize: F.sm, color: C.muted, display: 'block' }}>Tap to upload or take a photo</Sans></div>
      )}
    </div>
  );
}

export default function KYCScreen({ onComplete, onSkip }) {
  const { user } = useAuth();
  const [step,        setStep]        = useState(0);
  const [frontDone,   setFrontDone]   = useState(false);
  const [backDone,    setBackDone]    = useState(false);
  const [selfieDone,  setSelfieDone]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await api.kyc.submit(new FormData()); // real impl attaches files
    } catch (_) { /* non-blocking for demo */ }
    setTimeout(() => { setSubmitting(false); setStep(5); }, 1800);
  }

  const progressPct = step === 0 ? 0 : (step / 5) * 100;

  const stepContent = [
    // 0 – Why
    <div key="why" style={{ padding: '28px 26px' }}>
      <div style={{ background: `linear-gradient(135deg,${C.rubyDeep},#5A1215)`, borderRadius: 22, padding: '28px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
        <Serif s={{ color: 'white', fontSize: F.xxl, display: 'block', marginBottom: 12 }}>Why we verify your identity</Serif>
        <Sans s={{ color: 'rgba(255,255,255,0.82)', fontSize: F.md, display: 'block', lineHeight: 1.8 }}>Her Ruby Circles and paid programmes are verified, women-only spaces. A one-time identity check protects every member.</Sans>
      </div>
      {[
        { icon: '👩‍👩‍👧', title: 'Women-only guarantee', desc: 'Verification ensures every member is who they say they are — keeping this a safe, trusted space.' },
        { icon: '🛡️', title: 'Preventing abuse & misuse', desc: 'Circles discuss personal health and life transitions. Verified identity prevents bad actors from entering.' },
        { icon: '🔐', title: 'PIPEDA compliant', desc: 'Your ID is encrypted, used only for verification, never stored as a readable image, and never shared.' },
        { icon: '✦', title: 'One-time only', desc: 'Verify once — it takes under 2 minutes and you never repeat it. Unlocks Circles and paid programmes.' },
      ].map((r, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 18, padding: '18px 20px', boxShadow: '0 3px 14px rgba(0,0,0,0.05)', marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: C.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
          <div><Sans s={{ fontSize: F.md, color: C.slate, fontWeight: 600, display: 'block', marginBottom: 4 }}>{r.title}</Sans><Sans s={{ fontSize: F.sm, color: C.muted, lineHeight: 1.65 }}>{r.desc}</Sans></div>
        </div>
      ))}
      <Btn onClick={() => setStep(1)} s={{ width: '100%', padding: '17px 0', fontSize: F.lg, marginTop: 8 }}>Start Verification ✦</Btn>
      <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: C.muted, fontFamily: "'DM Sans',sans-serif", fontSize: F.md, cursor: 'pointer', padding: '14px 0', marginTop: 8 }}>Verify later — browse other features</button>
    </div>,

    // 1 – ID Front
    <div key="front" style={{ padding: '28px 26px' }}>
      <Serif as="h2" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 8 }}>Upload your ID — Front</Serif>
      <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.65, marginBottom: 20 }}>We accept a <strong>driver's licence</strong>, passport, or provincial ID. Make sure all four corners are visible and text is clear.</Sans>
      <MockUpload label="Front of ID / Licence" icon="🪪" uploaded={frontDone} onUpload={setFrontDone} />
      <div style={{ background: C.goldPale, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.goldLight}`, margin: '18px 0', display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <Sans s={{ fontSize: F.sm, color: C.slate, lineHeight: 1.65 }}>Ensure the photo is well-lit, not blurry, and your full name and date of birth are readable.</Sans>
      </div>
      <Btn onClick={() => setStep(2)} disabled={!frontDone} s={{ width: '100%', padding: '16px 0', fontSize: F.lg }}>Continue →</Btn>
    </div>,

    // 2 – ID Back
    <div key="back" style={{ padding: '28px 26px' }}>
      <Serif as="h2" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 8 }}>Upload your ID — Back</Serif>
      <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.65, marginBottom: 20 }}>The back of your licence or ID. The magnetic stripe or barcode must be visible.</Sans>
      <MockUpload label="Back of ID / Licence" icon="🪪" uploaded={backDone} onUpload={setBackDone} />
      <Btn onClick={() => setStep(3)} disabled={!backDone} s={{ width: '100%', padding: '16px 0', fontSize: F.lg, marginTop: 18 }}>Continue →</Btn>
    </div>,

    // 3 – Selfie
    <div key="selfie" style={{ padding: '28px 26px' }}>
      <Serif as="h2" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 8 }}>Take a quick selfie</Serif>
      <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.65, marginBottom: 20 }}>A single photo of your face in good lighting — matched against your ID to confirm identity.</Sans>
      <MockUpload label="Face photo" icon="🤳" uploaded={selfieDone} onUpload={setSelfieDone} />
      <div style={{ background: C.indigoPale, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.indigo}30`, margin: '18px 0', display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔐</span>
        <Sans s={{ fontSize: F.sm, color: C.slate, lineHeight: 1.65 }}>Your selfie is compared to your ID then immediately deleted. We never store biometric data.</Sans>
      </div>
      <Btn onClick={() => setStep(4)} disabled={!selfieDone} s={{ width: '100%', padding: '16px 0', fontSize: F.lg }}>Continue →</Btn>
    </div>,

    // 4 – Review & Submit
    <div key="review" style={{ padding: '28px 26px' }}>
      <Serif as="h2" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 8 }}>Review & submit</Serif>
      <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.65, marginBottom: 22 }}>Confirm your documents are ready to submit.</Sans>
      {[{ label: 'ID Front', done: frontDone, icon: '🪪' }, { label: 'ID Back', done: backDone, icon: '🪪' }, { label: 'Selfie', done: selfieDone, icon: '🤳' }].map((d, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 24 }}>{d.icon}</span>
          <Sans s={{ flex: 1, fontSize: F.md, color: C.slate, fontWeight: 500 }}>{d.label}</Sans>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: d.done ? C.sage : '#EDD8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>{d.done ? '✓' : '!'}</div>
        </div>
      ))}
      <div style={{ background: C.parchment, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.faint}`, marginBottom: 22, marginTop: 8 }}>
        <Sans s={{ fontSize: F.sm, color: C.muted, lineHeight: 1.7 }}>
          🔒 By submitting you agree to our <span style={{ color: C.ruby, fontWeight: 600 }}>Identity Verification Policy</span>. Documents are encrypted in transit, processed by our PIPEDA-compliant partner, and deleted within 24 hours.
        </Sans>
      </div>
      <Btn onClick={submit} disabled={submitting} s={{ width: '100%', padding: '17px 0', fontSize: F.lg }}>
        {submitting ? 'Submitting securely…' : 'Submit for Verification ✦'}
      </Btn>
    </div>,

    // 5 – Done
    <div key="done" style={{ padding: '28px 26px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 22 }}>🌸</div>
      <Serif s={{ fontSize: F.xxl, color: C.slate, display: 'block', marginBottom: 12 }}>Verification submitted!</Serif>
      <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.75, marginBottom: 24 }}>Your identity is being reviewed — usually <strong>under 5 minutes</strong>. You'll be notified when approved.</Sans>
      <div style={{ background: C.sagePale, borderRadius: 16, padding: '16px 18px', border: `1px solid ${C.sage}40`, marginBottom: 22, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 24 }}>✓</span>
        <Sans s={{ fontSize: F.md, color: C.sage, fontWeight: 500 }}>Your data is encrypted and protected under PIPEDA</Sans>
      </div>
      <Btn onClick={onComplete} s={{ width: '100%', padding: '17px 0', fontSize: F.lg }}>Continue to Her Ruby ✦</Btn>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: `linear-gradient(135deg,${C.rubyDeep},${C.ruby})`, padding: '52px 26px 24px' }}>
        {step > 0 && step < 5 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 42, height: 42, color: 'white', fontSize: 20, cursor: 'pointer', marginBottom: 18 }}>←</button>
        )}
        {step > 0 && step < 5 && (
          <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'white', borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        )}
        <Sans s={{ color: 'rgba(255,255,255,0.7)', fontSize: F.xs, letterSpacing: '0.16em', fontWeight: 600, display: 'block', marginBottom: 6 }}>
          {step === 0 ? 'CIRCLE & PROGRAMME ACTIVATION' : `STEP ${step} OF 4`}
        </Sans>
        <Serif as="h1" s={{ color: 'white', fontSize: 28, fontWeight: 700, display: 'block' }}>Identity Verification</Serif>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>{stepContent[step]}</div>
    </div>
  );
}
