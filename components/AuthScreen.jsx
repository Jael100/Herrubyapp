'use client';
// src/screens/AuthScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Input } from './UI';
import {
  signUpWithEmail, signInWithEmail,
  signInWithGoogle, signInWithApple, resetPassword,
} from '../lib/supabase';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('welcome'); // welcome | login | signup | forgot
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [confirm, setConfirm]   = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);
  const [signupSent, setSignupSent]   = useState(false);
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState('');

  function clearErr() { setErr(''); }

  // ── Email signup ──────────────────────────────────────────────────────────
  async function doSignup() {
    clearErr();
    if (!name.trim()) { setErr('Please enter your name.'); return; }
    if (!email)       { setErr('Please enter your email.'); return; }
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setLoading('signup');
    const { data, error } = await signUpWithEmail({ name: name.trim(), email, password });
    setLoading('');
    if (error) { setErr(error.message); return; }
    if (data.session) {
      onAuthSuccess(data.user);
    } else if (data.user) {
      setSignupSent(true);
    }
  }

  // ── Email login ───────────────────────────────────────────────────────────
  async function doLogin() {
    clearErr();
    if (!email || !password) { setErr('Please enter your email and password.'); return; }
    setLoading('login');
    const { data, error } = await signInWithEmail({ email, password });
    setLoading('');
    if (error) { setErr('Invalid email or password.'); return; }
    if (data.user) onAuthSuccess(data.user);
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function doGoogle() {
    clearErr();
    setLoading('google');
    const { error } = await signInWithGoogle();
    setLoading('');
    if (error) setErr(error.message);
    // Supabase redirects — onAuthSuccess called via AuthContext listener
  }

  // ── Apple OAuth ───────────────────────────────────────────────────────────
  async function doApple() {
    clearErr();
    setLoading('apple');
    const { error } = await signInWithApple();
    setLoading('');
    if (error) setErr(error.message);
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async function doForgot() {
    clearErr();
    if (!forgotEmail) { setErr('Please enter your email address.'); return; }
    setLoading('forgot');
    await resetPassword(forgotEmail);
    setLoading('');
    setForgotSent(true);
  }

  // ── Social sign-in buttons ────────────────────────────────────────────────
  function SocialButtons() {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: C.faint }} />
          <Sans s={{ fontSize: F.sm, color: C.muted }}>or continue with</Sans>
          <div style={{ flex: 1, height: 1, background: C.faint }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {/* Google */}
          <button onClick={doGoogle} disabled={!!loading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '13px 16px', background: 'white',
              border: `2px solid ${C.faint}`, borderRadius: 14, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 500,
              color: C.slate, transition: 'border 0.2s',
              opacity: loading === 'google' ? 0.6 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.border = `2px solid #4285F4`}
            onMouseLeave={e => e.currentTarget.style.border = `2px solid ${C.faint}`}
          >
            {/* Google SVG logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading === 'google' ? 'Connecting…' : 'Google'}
          </button>

          {/* Apple */}
          <button onClick={doApple} disabled={!!loading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '13px 16px', background: 'white',
              border: `2px solid ${C.faint}`, borderRadius: 14, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 500,
              color: C.slate, transition: 'border 0.2s',
              opacity: loading === 'apple' ? 0.6 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.border = `2px solid #000`}
            onMouseLeave={e => e.currentTarget.style.border = `2px solid ${C.faint}`}
          >
            {/* Apple SVG logo */}
            <svg width="18" height="20" viewBox="0 0 814 1000">
              <path fill="#000" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.3-156.9-110.1-83.2-150.4-83.2-207.6c0-197 136.6-301.9 272.1-301.9 65 0 119.1 42.6 159.6 42.6 39 0 100.1-45 170.3-45 27.5 0 127.5 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            {loading === 'apple' ? 'Connecting…' : 'Apple'}
          </button>
        </div>
      </div>
    );
  }

  // ── WELCOME SCREEN ────────────────────────────────────────────────────────
  if (mode === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${C.rubyDeep} 0%, ${C.ruby} 55%, #D44 100%)` }} />
        {[280, 430, 580].map((sz, i) => (
          <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.09)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 40px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}>♦</div>
          <Serif as="h1" s={{ fontSize: 52, color: 'white', fontWeight: 700, lineHeight: 1.2, display: 'block', marginBottom: 16 }}>Her Ruby</Serif>
          <Sans s={{ fontSize: F.lg, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, display: 'block', maxWidth: 320, margin: '0 auto 40px' }}>
            Midlife Vitality Platform for women 40 and above
          </Sans>
          {/* OAuth buttons on welcome screen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto', width: '100%' }}>
            <button onClick={doGoogle}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 24px', background: 'white', border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 600, color: C.slate }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button onClick={doApple}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 24px', background: 'black', border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 600, color: 'white' }}>
              <svg width="18" height="20" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.3-156.9-110.1-83.2-150.4-83.2-207.6c0-197 136.6-301.9 272.1-301.9 65 0 119.1 42.6 159.6 42.6 39 0 100.1-45 170.3-45 27.5 0 127.5 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>
              Continue with Apple
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              <Sans s={{ fontSize: F.sm, color: 'rgba(255,255,255,0.6)' }}>or</Sans>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            </div>
            <Btn onClick={() => setMode('signup')} v="white" s={{ width: '100%', padding: '16px 0', fontSize: F.md, borderRadius: 16 }}>
              Sign Up with Email ✦
            </Btn>
            <button onClick={() => setMode('login')}
              style={{ background: 'none', border: '2px solid rgba(255,255,255,0.45)', borderRadius: 16, padding: '16px 0', color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px 32px' }}>
          <Sans s={{ fontSize: F.xs, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            By continuing you agree to our Terms of Service and Privacy Policy.<br />
            Your data is encrypted and stored in Canada 🇨🇦
          </Sans>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})`, padding: '56px 26px 32px' }}>
          <button onClick={() => { setMode('login'); clearErr(); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 42, height: 42, color: 'white', fontSize: 20, cursor: 'pointer', marginBottom: 18 }}>←</button>
          <Serif as="h1" s={{ color: 'white', fontSize: 32, fontWeight: 700, display: 'block' }}>Reset Password</Serif>
          <Sans s={{ color: 'rgba(255,255,255,0.75)', fontSize: F.md, display: 'block', marginTop: 6 }}>We'll send a reset link to your email</Sans>
        </div>
        <div style={{ flex: 1, padding: '32px 26px' }}>
          {!forgotSent ? (
            <div>
              <Input label="Email address" type="email" value={forgotEmail} onChange={setForgotEmail} placeholder="your@email.com" />
              {err && <ErrBox msg={err} />}
              <Btn onClick={doForgot} disabled={loading === 'forgot'} s={{ width: '100%', padding: '16px 0', fontSize: F.lg }}>
                {loading === 'forgot' ? 'Sending…' : 'Send Reset Link →'}
              </Btn>
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>📧</div>
              <Serif s={{ fontSize: F.xxl, color: C.slate, display: 'block', marginBottom: 10 }}>Check your inbox</Serif>
              <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.7, marginBottom: 24 }}>Reset link sent to <strong>{forgotEmail}</strong></Sans>
              <Btn onClick={() => { setMode('login'); setForgotSent(false); }} v="ghost" s={{ padding: '14px 28px', fontSize: F.md }}>Back to Sign In</Btn>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SIGNUP CONFIRMATION (email verification required) ─────────────────────
  if (mode === 'signup' && signupSent) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})`, padding: '56px 26px 32px' }}>
          <Serif as="h1" s={{ color: 'white', fontSize: 32, fontWeight: 700, display: 'block' }}>Almost there</Serif>
          <Sans s={{ color: 'rgba(255,255,255,0.75)', fontSize: F.md, display: 'block', marginTop: 6 }}>Confirm your email to finish signing up</Sans>
        </div>
        <div style={{ flex: 1, padding: '32px 26px', textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>📧</div>
          <Serif s={{ fontSize: F.xxl, color: C.slate, display: 'block', marginBottom: 10 }}>Check your inbox</Serif>
          <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.7, marginBottom: 24 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </Sans>
          <Btn onClick={() => { setMode('login'); setSignupSent(false); setPass(''); setConfirm(''); }} v="ghost" s={{ padding: '14px 28px', fontSize: F.md }}>
            Back to Sign In
          </Btn>
        </div>
      </div>
    );
  }

  // ── LOGIN / SIGNUP ────────────────────────────────────────────────────────
  const isLogin = mode === 'login';
  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})`, padding: '56px 26px 32px' }}>
        <button onClick={() => { setMode('welcome'); clearErr(); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, width: 42, height: 42, color: 'white', fontSize: 20, cursor: 'pointer', marginBottom: 18 }}>←</button>
        <Serif as="h1" s={{ color: 'white', fontSize: 32, fontWeight: 700, display: 'block', marginBottom: 6 }}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </Serif>
        <Sans s={{ color: 'rgba(255,255,255,0.75)', fontSize: F.md, display: 'block' }}>
          {isLogin ? 'Sign in to your Her Ruby account' : 'Your midlife vitality journey starts here'}
        </Sans>
      </div>
      <div style={{ flex: 1, padding: '32px 26px', overflowY: 'auto' }}>
        {/* Social auth first */}
        <SocialButtons />

        {/* Email form */}
        {!isLogin && <Input label="Full name" value={name} onChange={setName} placeholder="e.g. Margaret Chen" />}
        <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
        <Input label="Password" type="password" value={password} onChange={setPass} placeholder={isLogin ? 'Your password' : 'Min. 8 characters'} hint={!isLogin ? 'Use a mix of letters, numbers and symbols' : undefined} />
        {!isLogin && <Input label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter your password" />}

        {err && <ErrBox msg={err} />}

        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -10 }}>
            <button onClick={() => { setMode('forgot'); clearErr(); }} style={{ background: 'none', border: 'none', color: C.ruby, fontFamily: "'DM Sans', sans-serif", fontSize: F.sm, cursor: 'pointer', fontWeight: 500 }}>
              Forgot password?
            </button>
          </div>
        )}

        <Btn onClick={isLogin ? doLogin : doSignup} disabled={!!loading} s={{ width: '100%', padding: '17px 0', fontSize: F.lg, marginBottom: 20 }}>
          {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign In ✦' : 'Create Account ✦')}
        </Btn>

        <div style={{ textAlign: 'center', borderTop: `1px solid ${C.faint}`, paddingTop: 20 }}>
          <Sans s={{ fontSize: F.md, color: C.muted }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </Sans>
          <button onClick={() => { setMode(isLogin ? 'signup' : 'login'); clearErr(); }} style={{ background: 'none', border: 'none', color: C.ruby, fontFamily: "'DM Sans', sans-serif", fontSize: F.md, fontWeight: 600, cursor: 'pointer' }}>
            {isLogin ? 'Create one →' : 'Sign in →'}
          </button>
        </div>

        {!isLogin && (
          <Sans s={{ fontSize: F.xs, color: C.muted, display: 'block', textAlign: 'center', marginTop: 20, lineHeight: 1.65 }}>
            By creating an account you agree to Her Ruby's Terms of Service and Privacy Policy. Your health data is encrypted and stored in Canada 🇨🇦
          </Sans>
        )}
      </div>
    </div>
  );
}

function ErrBox({ msg }) {
  return (
    <div style={{ background: '#FEE8E8', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #FCA5A5' }}>
      <Sans s={{ color: '#B91C1C', fontSize: F.sm }}>{msg}</Sans>
    </div>
  );
}
