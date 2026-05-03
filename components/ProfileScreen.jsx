'use client';
// src/screens/ProfileScreen.jsx
import React, { useState } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn, Input, Toggle } from './UI';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ user, profile, onBack, onSignOut, onUpdate }) {
  const [section, setSection] = useState('profile');
  const [name, setName]       = useState(profile?.name || user?.user_metadata?.full_name || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [phone, setPhone]     = useState(profile?.phone || '');
  const [saved, setSaved]     = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew]         = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg]         = useState('');
  const [pwErr, setPwErr]         = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  async function updatePassword() {
    setPwErr(''); setPwMsg('');
    if (pwNew.length < 8) { setPwErr('New password must be at least 8 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwErr("New passwords don't match."); return; }
    setPwLoading(true);
    if (pwCurrent && user?.email) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pwCurrent });
      if (signInErr) { setPwLoading(false); setPwErr('Current password is incorrect.'); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setPwMsg('Password updated.');
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
  }

  async function deleteAccount() {
    setDeleteError(''); setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      await supabase.auth.signOut();
      onSignOut();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const [notifs, setNotifs] = useState({
    session_reminders: profile?.notification_prefs?.session_reminders ?? true,
    circle_activity:   profile?.notification_prefs?.circle_activity   ?? true,
    hub_live:          profile?.notification_prefs?.hub_live           ?? true,
    wallet_updates:    profile?.notification_prefs?.wallet_updates     ?? true,
    weekly_summary:    profile?.notification_prefs?.weekly_summary     ?? true,
    marketing_emails:  profile?.notification_prefs?.marketing_emails   ?? false,
    push_enabled:      profile?.notification_prefs?.push_enabled       ?? true,
  });

  const initial = (name || user?.email || 'U')[0].toUpperCase();

  async function saveProfile() {
    await onUpdate({ name, phone, notification_prefs: notifs });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleNotif(key) {
    setNotifs(n => ({ ...n, [key]: !n[key] }));
  }

  const SECTIONS = [
    { id:'profile',       icon:'👤', label:'Profile'       },
    { id:'notifications', icon:'🔔', label:'Notifications' },
    { id:'privacy',       icon:'🔒', label:'Privacy'       },
    { id:'security',      icon:'🛡️', label:'Security'      },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.cream, display:'flex', flexDirection:'column' }}>

      {/* Sign-out confirm overlay */}
      {signOutConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(20,10,10,0.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 26px' }}>
          <div style={{ background:C.cream, borderRadius:24, padding:'32px 28px', width:'100%', maxWidth:380, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:16 }}>👋</div>
            <Serif s={{ fontSize:F.xl, color:C.slate, display:'block', marginBottom:10 }}>Sign out?</Serif>
            <Sans s={{ fontSize:F.md, color:C.muted, display:'block', lineHeight:1.65, marginBottom:26 }}>Your data and progress will be waiting when you return.</Sans>
            <Btn onClick={onSignOut} s={{ width:'100%', padding:'15px 0', fontSize:F.lg, marginBottom:12 }}>Yes, sign out</Btn>
            <Btn onClick={() => setSignOutConfirm(false)} v="ghost" s={{ width:'100%', padding:'15px 0', fontSize:F.lg }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Delete account confirm overlay */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(20,10,10,0.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 26px' }}>
          <div style={{ background:C.cream, borderRadius:24, padding:'32px 28px', width:'100%', maxWidth:380, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:16 }}>🗑️</div>
            <Serif s={{ fontSize:F.xl, color:'#B91C1C', display:'block', marginBottom:10 }}>Delete your account?</Serif>
            <Sans s={{ fontSize:F.md, color:C.muted, display:'block', lineHeight:1.65, marginBottom:20 }}>This permanently deletes your profile, wallet, transactions, and any gift codes you've created. This cannot be undone.</Sans>
            {deleteError && (
              <div style={{ background:'#FEE8E8', borderRadius:12, padding:'10px 14px', marginBottom:14, border:'1px solid #FCA5A5' }}>
                <Sans s={{ color:'#B91C1C', fontSize:F.sm }}>{deleteError}</Sans>
              </div>
            )}
            <Btn onClick={deleteAccount} disabled={deleteLoading} s={{ width:'100%', padding:'15px 0', fontSize:F.lg, marginBottom:12, background:'#B91C1C' }}>{deleteLoading ? 'Deleting…' : 'Yes, delete forever'}</Btn>
            <Btn onClick={() => { setDeleteConfirm(false); setDeleteError(''); }} v="ghost" s={{ width:'100%', padding:'15px 0', fontSize:F.lg }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.rubyDeep},${C.ruby})`, padding:'52px 26px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:12, width:40, height:40, color:'white', fontSize:18, cursor:'pointer', flexShrink:0 }}>←</button>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:'white', flexShrink:0 }}>
            {initial}
          </div>
          <div>
            <Serif s={{ color:'white', fontSize:F.xl, fontWeight:700, display:'block' }}>{name || 'My Account'}</Serif>
            <Sans s={{ color:'rgba(255,255,255,0.7)', fontSize:F.sm }}>{user?.email}</Sans>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{ flexShrink:0, background:section===s.id?'white':'rgba(255,255,255,0.15)', color:section===s.id?C.ruby:'white', border:'none', borderRadius:20, padding:'8px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:F.sm, cursor:'pointer', fontWeight:section===s.id?600:400, transition:'all 0.2s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
              <span style={{ fontSize:13 }}>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, padding:'24px 26px', overflowY:'auto', paddingBottom:40 }}>

        {/* ── PROFILE ── */}
        {section === 'profile' && (
          <div>
            <Serif as="h2" s={{ fontSize:F.xl, color:C.slate, display:'block', marginBottom:20 }}>Your Profile</Serif>
            <Input label="Full name"     value={name}  onChange={setName}  placeholder="Your full name" />
            <Input label="Email address" type="email"  value={email} onChange={setEmail} placeholder="your@email.com" />
            <Input label="Phone number"  type="tel"    value={phone} onChange={setPhone} placeholder="+1 (416) 555-0100" hint="Used only for session reminders if enabled" />
            {saved && (
              <div style={{ background:C.sagePale, borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontSize:18 }}>✓</span>
                <Sans s={{ color:C.sage, fontWeight:600, fontSize:F.md }}>Profile updated successfully</Sans>
              </div>
            )}
            <Btn onClick={saveProfile} s={{ width:'100%', padding:'16px 0', fontSize:F.lg, marginBottom:28 }}>Save Changes ✦</Btn>
            <div style={{ borderTop:`1px solid ${C.faint}`, paddingTop:24 }}>
              <Sans s={{ fontSize:F.sm, color:C.muted, letterSpacing:'0.12em', fontWeight:600, display:'block', marginBottom:14 }}>ACCOUNT</Sans>
              {[
                { icon:'👋', label:'Sign out', action:() => setSignOutConfirm(true), danger:false },
                { icon:'🗑️', label:'Delete my account', action:() => setDeleteConfirm(true), danger:true },
              ].map((item,i) => (
                <button key={i} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'white', border:`1.5px solid ${item.danger?'#FCA5A5':C.faint}`, borderRadius:16, cursor:'pointer', textAlign:'left', marginBottom:12 }}>
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <Sans s={{ flex:1, fontSize:F.md, color:item.danger?'#B91C1C':C.slate, fontWeight:500 }}>{item.label}</Sans>
                  <span style={{ color:item.danger?'#FCA5A5':C.muted, fontSize:18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === 'notifications' && (
          <div>
            <Serif as="h2" s={{ fontSize:F.xl, color:C.slate, display:'block', marginBottom:8 }}>Notifications</Serif>
            <Sans s={{ fontSize:F.md, color:C.muted, display:'block', lineHeight:1.65, marginBottom:24 }}>Control how and when Her Ruby reaches you.</Sans>

            <div style={{ background:`linear-gradient(135deg,${C.rubyDeep},#5A1215)`, borderRadius:20, padding:'20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:14 }}>
              <div>
                <Sans s={{ color:'white', fontSize:F.md, fontWeight:600, display:'block', marginBottom:4 }}>Push Notifications</Sans>
                <Sans s={{ color:'rgba(255,255,255,0.7)', fontSize:F.sm }}>Receive real-time alerts on your device</Sans>
              </div>
              <Toggle val={notifs.push_enabled} onToggle={() => toggleNotif('push_enabled')} color={C.sage} />
            </div>

            {[
              { key:'session_reminders', icon:'📅', label:'Session Reminders',  desc:'1 hour before every booked session' },
              { key:'circle_activity',   icon:'❋', label:'Circle Activity',    desc:'New posts and replies in your Circles' },
              { key:'hub_live',          icon:'🔴', label:'Live Session Alerts', desc:'When a registered Knowledge Hub session is starting' },
              { key:'wallet_updates',    icon:'◆', label:'Wallet Updates',      desc:'Credits received, redeemed, or expiring soon' },
              { key:'weekly_summary',    icon:'📊', label:'Weekly Summary',      desc:'Your health trends and programme highlights' },
              { key:'marketing_emails',  icon:'💌', label:'Her Ruby Updates',    desc:'New programmes, experiences and platform news' },
            ].map(n => (
              <div key={n.key} style={{ background:'white', borderRadius:18, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', marginBottom:12, display:'flex', alignItems:'center', gap:14, opacity:(notifs.push_enabled||n.key==='marketing_emails')?1:0.5 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:C.blush, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{n.icon}</div>
                <div style={{ flex:1 }}>
                  <Sans s={{ fontSize:F.md, color:C.slate, fontWeight:600, display:'block', marginBottom:2 }}>{n.label}</Sans>
                  <Sans s={{ fontSize:F.sm, color:C.muted }}>{n.desc}</Sans>
                </div>
                <Toggle val={notifs[n.key]} onToggle={() => toggleNotif(n.key)} />
              </div>
            ))}
            <Btn onClick={saveProfile} s={{ width:'100%', padding:'15px 0', fontSize:F.md, marginTop:8 }}>Save Preferences ✦</Btn>
          </div>
        )}

        {/* ── PRIVACY ── */}
        {section === 'privacy' && (
          <div>
            <Serif as="h2" s={{ fontSize:F.xl, color:C.slate, display:'block', marginBottom:8 }}>Privacy</Serif>
            <Sans s={{ fontSize:F.md, color:C.muted, display:'block', lineHeight:1.65, marginBottom:22 }}>Her Ruby is committed to PIPEDA compliance. Your health data belongs to you.</Sans>
            {[
              { icon:'🔐', title:'Health data encryption',       desc:'All symptom logs, trends and body data are encrypted at rest using AES-256.' },
              { icon:'🚫', title:'Never sold to third parties',  desc:'Your personal and health data is never sold, rented or shared with advertisers.' },
              { icon:'👁️', title:'Employer data — anonymised',   desc:"If employer-funded, your employer sees only anonymised group metrics. Never individual data." },
              { icon:'🇨🇦', title:'Stored in Canada',            desc:'All data is stored on Canadian servers in compliance with PIPEDA and provincial health privacy laws.' },
            ].map((p,i) => (
              <div key={i} style={{ background:'white', borderRadius:18, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', marginBottom:12, display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:14, background:C.indigoPale, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{p.icon}</div>
                <div>
                  <Sans s={{ fontSize:F.md, color:C.slate, fontWeight:600, display:'block', marginBottom:4 }}>{p.title}</Sans>
                  <Sans s={{ fontSize:F.sm, color:C.muted, lineHeight:1.65 }}>{p.desc}</Sans>
                </div>
              </div>
            ))}
            <Btn v="ghost" s={{ width:'100%', padding:'14px 0', fontSize:F.md, marginTop:8 }}>Download My Data →</Btn>
          </div>
        )}

        {/* ── SECURITY ── */}
        {section === 'security' && (
          <div>
            <Serif as="h2" s={{ fontSize:F.xl, color:C.slate, display:'block', marginBottom:20 }}>Security</Serif>
            <Input label="Current password"     type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="Enter current password (optional for OAuth users)" />
            <Input label="New password"          type="password" value={pwNew}     onChange={setPwNew}     placeholder="Min. 8 characters" />
            <Input label="Confirm new password"  type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="Re-enter new password" />
            {pwErr && (
              <div style={{ background:'#FEE8E8', borderRadius:12, padding:'12px 16px', marginBottom:16, border:'1px solid #FCA5A5' }}>
                <Sans s={{ color:'#B91C1C', fontSize:F.sm }}>{pwErr}</Sans>
              </div>
            )}
            {pwMsg && (
              <div style={{ background:C.sagePale, borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontSize:18 }}>✓</span>
                <Sans s={{ color:C.sage, fontWeight:600, fontSize:F.md }}>{pwMsg}</Sans>
              </div>
            )}
            <Btn onClick={updatePassword} disabled={pwLoading} s={{ width:'100%', padding:'16px 0', fontSize:F.lg, marginBottom:28 }}>{pwLoading ? 'Updating…' : 'Update Password ✦'}</Btn>
            <div style={{ borderTop:`1px solid ${C.faint}`, paddingTop:20 }}>
              <Sans s={{ fontSize:F.sm, color:C.muted, letterSpacing:'0.12em', fontWeight:600, display:'block', marginBottom:14 }}>TWO-FACTOR AUTHENTICATION</Sans>
              <div style={{ background:'white', borderRadius:18, padding:'18px 20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:C.sagePale, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📱</div>
                <div style={{ flex:1 }}>
                  <Sans s={{ fontSize:F.md, color:C.slate, fontWeight:600, display:'block', marginBottom:2 }}>SMS Authentication</Sans>
                  <Sans s={{ fontSize:F.sm, color:C.muted }}>Add an extra layer of security</Sans>
                </div>
                <Btn v="soft" s={{ padding:'9px 16px', fontSize:F.sm }}>Enable</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
