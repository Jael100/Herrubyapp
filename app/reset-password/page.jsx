'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { C, F } from '../../lib/constants';
import { Serif, Sans, Btn, Input } from '../../components/UI';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function submit() {
    setErr('');
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})`, padding: '56px 26px 32px' }}>
        <Serif as="h1" s={{ color: 'white', fontSize: 32, fontWeight: 700, display: 'block' }}>Set new password</Serif>
        <Sans s={{ color: 'rgba(255,255,255,0.75)', fontSize: F.md, display: 'block', marginTop: 6 }}>Choose a strong password for your account</Sans>
      </div>
      <div style={{ flex: 1, padding: '32px 26px' }}>
        {done ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>✓</div>
            <Serif s={{ fontSize: F.xxl, color: C.slate, display: 'block', marginBottom: 10 }}>Password updated</Serif>
            <Sans s={{ fontSize: F.md, color: C.muted, display: 'block', lineHeight: 1.7, marginBottom: 24 }}>You can now sign in with your new password.</Sans>
            <Btn onClick={() => { window.location.href = '/'; }} s={{ padding: '14px 28px', fontSize: F.md }}>Continue →</Btn>
          </div>
        ) : !ready ? (
          <Sans s={{ color: C.muted, fontSize: F.md }}>Verifying recovery link…</Sans>
        ) : (
          <div>
            <Input label="New password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" hint="Use a mix of letters, numbers and symbols" />
            <Input label="Confirm new password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter your password" />
            {err && (
              <div style={{ background: '#FEE8E8', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #FCA5A5' }}>
                <Sans s={{ color: '#B91C1C', fontSize: F.sm }}>{err}</Sans>
              </div>
            )}
            <Btn onClick={submit} disabled={loading} s={{ width: '100%', padding: '17px 0', fontSize: F.lg }}>
              {loading ? 'Updating…' : 'Update password ✦'}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
