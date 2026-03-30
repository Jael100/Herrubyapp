'use client';
// src/components/UI.jsx
// Shared primitive components used throughout the app
import React from 'react';
import { C, F } from '../lib/constants';

export const Serif = ({ s, as: T = 'span', ...p }) =>
  <T style={{ fontFamily: "'Cormorant Garamond', serif", ...s }} {...p} />;

export const Sans = ({ s, as: T = 'span', ...p }) =>
  <T style={{ fontFamily: "'DM Sans', sans-serif", ...s }} {...p} />;

export function Chip({ children, color = C.ruby, bg = C.blush, s }) {
  return (
    <span style={{
      display: 'inline-block', borderRadius: 20, padding: '5px 14px',
      background: bg, color, fontSize: F.sm,
      fontFamily: "'DM Sans', sans-serif", fontWeight: 500, ...s,
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, v = 'primary', s, disabled, type = 'button' }) {
  const vs = {
    primary: { background: C.ruby,    color: '#fff', border: 'none' },
    gold:    { background: C.gold,    color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: C.ruby, border: `2px solid ${C.ruby}` },
    soft:    { background: C.blush,   color: C.ruby, border: 'none' },
    white:   { background: 'white',   color: C.ruby, border: 'none' },
    sage:    { background: C.sage,    color: '#fff', border: 'none' },
    dark:    { background: C.slate,   color: '#fff', border: 'none' },
    indigo:  { background: C.indigo,  color: '#fff', border: 'none' },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        borderRadius: 14, cursor: disabled ? 'default' : 'pointer',
        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        padding: '15px 26px', fontSize: F.md,
        transition: 'all 0.18s', opacity: disabled ? 0.45 : 1,
        ...vs[v], ...s,
      }}
    >
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, hint, s }) {
  return (
    <div style={{ marginBottom: 18, ...s }}>
      {label && (
        <Sans s={{ fontSize: F.sm, color: C.muted, letterSpacing: '0.1em', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          {label.toUpperCase()}
        </Sans>
      )}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', border: `2px solid ${C.faint}`, borderRadius: 14,
          padding: '15px 18px', fontFamily: "'DM Sans', sans-serif",
          fontSize: F.md, color: C.slate, outline: 'none',
          background: 'white', boxSizing: 'border-box', transition: 'border 0.2s',
        }}
        onFocus={e => (e.target.style.border = `2px solid ${C.ruby}`)}
        onBlur={e => (e.target.style.border = `2px solid ${C.faint}`)}
      />
      {hint && <Sans s={{ fontSize: F.xs, color: C.muted, display: 'block', marginTop: 6, lineHeight: 1.5 }}>{hint}</Sans>}
    </div>
  );
}

export function Toggle({ val, onToggle, color = C.ruby }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 52, height: 30, borderRadius: 15,
        background: val ? color : '#DDD',
        cursor: 'pointer', transition: 'background 0.25s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: val ? 24 : 3,
        width: 24, height: 24, borderRadius: '50%',
        background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        transition: 'left 0.25s',
      }} />
    </div>
  );
}

export function Spark({ data, color, w = 120, h = 52 }) {
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - mn) / rng) * (h - 10) - 5,
  ]);
  const poly = pts.map(p => p.join(',')).join(' ');
  const area = `${pts[0][0]},${h} ${poly} ${pts[pts.length - 1][0]},${h}`;
  const gid = `g${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={w} height={h} overflow="visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={color} stroke="white" strokeWidth={2.5} />
    </svg>
  );
}

export function StatusBar({ onProfileClick, userInitial }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: C.rubyDeep,
      height: 52, zIndex: 400,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px',
    }}>
      <Sans s={{ color: 'rgba(255,255,255,0.75)', fontSize: F.sm }}>
        {new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
      </Sans>
      <Sans s={{ color: 'rgba(255,255,255,0.9)', fontSize: F.md, fontWeight: 500 }}>♦ Her Ruby</Sans>
      <button
        onClick={onProfileClick}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif",
          fontSize: F.lg, fontWeight: 700, color: 'white',
        }}
      >
        {userInitial}
      </button>
    </div>
  );
}

export function TabBar({ active, onChange }) {
  const TABS = [
    { id: 'body',    icon: '◉', label: 'My Body'  },
    { id: 'program', icon: '◈', label: 'Programs' },
    { id: 'circle',  icon: '❋', label: 'Circle'   },
    { id: 'wallet',  icon: '◆', label: 'Wallet'   },
    { id: 'hub',     icon: '♦', label: 'Hub'      },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: 'white',
      borderTop: `1px solid ${C.faint}`, display: 'flex', zIndex: 300,
      boxShadow: '0 -4px 28px rgba(120,30,30,0.09)',
    }}>
      {TABS.map(t => (
        <button
          key={t.id} onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '12px 0 9px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            color: active === t.id ? C.ruby : '#C0AAAA',
            transition: 'color 0.2s', position: 'relative',
          }}
        >
          {active === t.id && (
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: 38, height: 3, background: C.ruby, borderRadius: 2,
            }} />
          )}
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{
            fontSize: F.xs, fontFamily: "'DM Sans', sans-serif",
            fontWeight: active === t.id ? 600 : 400, letterSpacing: '0.04em',
          }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
