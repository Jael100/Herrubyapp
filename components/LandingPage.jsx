'use client';
// src/screens/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { C, F } from '../lib/constants';
import { Serif, Sans, Btn } from './UI';

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(253,249,246,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.faint}` : 'none',
        transition: 'all 0.3s',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        <Serif s={{ fontSize: 26, fontWeight: 700, color: scrolled ? C.rubyDeep : C.white }}>
          ♦ Her Ruby
        </Serif>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {['Features', 'How It Works', 'Pricing', 'For Employers'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={{
                color: scrolled ? C.muted : 'rgba(255,255,255,0.85)',
                textDecoration: 'none', fontSize: F.md, fontWeight: 500,
                display: window.innerWidth < 640 ? 'none' : 'block',
              }}
            >{item}</a>
          ))}
          <button onClick={onSignIn} style={{
            background: 'none', border: `1.5px solid ${scrolled ? C.ruby : 'rgba(255,255,255,0.6)'}`,
            borderRadius: 12, padding: '8px 18px', cursor: 'pointer',
            color: scrolled ? C.ruby : 'white',
            fontFamily: "'DM Sans', sans-serif", fontSize: F.sm, fontWeight: 600,
          }}>Sign In</button>
          <Btn onClick={onGetStarted} s={{ padding: '9px 20px', fontSize: F.sm }}>
            Get Started ✦
          </Btn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        background: `linear-gradient(150deg, ${C.rubyDeep} 0%, ${C.ruby} 55%, #D44 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Decorative circles */}
        {[320, 500, 680].map((sz, i) => (
          <div key={i} style={{
            position: 'absolute', width: sz, height: sz, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
        ))}

        <div className="float" style={{ fontSize: 64, marginBottom: 24, position: 'relative', zIndex: 1 }}>♦</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '6px 16px', marginBottom: 28,
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: 14 }}>🇨🇦</span>
            <Sans s={{ color: 'rgba(255,255,255,0.9)', fontSize: F.sm, fontWeight: 500 }}>
              Built for Canadian women · PIPEDA compliant
            </Sans>
          </div>

          <Serif as="h1" s={{
            color: 'white', fontSize: 'clamp(38px, 6vw, 72px)',
            fontWeight: 700, lineHeight: 1.15, display: 'block',
            marginBottom: 24,
          }}>
            Sustain your energy,<br />
            confidence & performance<br />
            <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>through midlife.</span>
          </Serif>

          <Sans s={{
            color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.75, display: 'block', marginBottom: 44, maxWidth: 560, margin: '0 auto 44px',
          }}>
            Her Ruby helps women in her midlife navigate menopause, burnout and life transitions —
            with programmes, community, expert knowledge and a wellness wallet funded by you or your employer.
          </Sans>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={onGetStarted} v="white" s={{ padding: '17px 36px', fontSize: F.lg, borderRadius: 16 }}>
              Start Free Today ✦
            </Btn>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: 16, padding: '17px 36px', color: 'white',
                fontFamily: "'DM Sans', sans-serif", fontSize: F.lg, fontWeight: 600, cursor: 'pointer',
              }}>
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[['2,400+', 'Women helped'], ['94%', 'Report more energy'], ['4.9★', 'Average rating']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <Serif s={{ color: 'white', fontSize: 32, fontWeight: 700, display: 'block' }}>{val}</Serif>
                <Sans s={{ color: 'rgba(255,255,255,0.7)', fontSize: F.sm }}>{label}</Sans>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 5%', background: C.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Sans s={{ color: C.ruby, fontSize: F.sm, fontWeight: 600, letterSpacing: '0.18em', display: 'block', marginBottom: 12 }}>
              FOUR PILLARS
            </Sans>
            <Serif as="h2" s={{ fontSize: 'clamp(32px, 4vw, 52px)', color: C.slate, fontWeight: 700, display: 'block', marginBottom: 16 }}>
              Everything you need to thrive
            </Serif>
            <Sans s={{ fontSize: F.lg, color: C.muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.7, display: 'block' }}>
              Not a diet app. Not generic wellness. A complete ecosystem designed specifically for midlife women.
            </Sans>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 24, padding: '32px 28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${f.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <Serif as="h3" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 10 }}>{f.title}</Serif>
                <Sans s={{ fontSize: F.md, color: C.muted, lineHeight: 1.75 }}>{f.desc}</Sans>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 5%', background: C.parchment }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Serif as="h2" s={{ fontSize: 'clamp(30px, 4vw, 50px)', color: C.slate, fontWeight: 700, display: 'block', marginBottom: 14 }}>
              How Her Ruby works
            </Serif>
            <Sans s={{ fontSize: F.lg, color: C.muted, display: 'block', lineHeight: 1.7 }}>
              From first sign-up to your first transformation — in four steps.
            </Sans>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 28, alignItems: 'flex-start',
                background: 'white', borderRadius: 22, padding: '28px 28px',
                boxShadow: '0 3px 16px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Serif s={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{i + 1}</Serif>
                </div>
                <div>
                  <Serif as="h3" s={{ fontSize: F.xl, color: C.slate, display: 'block', marginBottom: 8 }}>{s.title}</Serif>
                  <Sans s={{ fontSize: F.md, color: C.muted, lineHeight: 1.75 }}>{s.desc}</Sans>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 5%', background: `linear-gradient(135deg, ${C.rubyDeep}, #5A1215)` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <Sans s={{ color: 'rgba(255,255,255,0.65)', fontSize: F.sm, fontWeight: 600, letterSpacing: '0.18em', display: 'block', marginBottom: 16 }}>
            REAL WOMEN, REAL RESULTS
          </Sans>
          <div style={{ minHeight: 220, position: 'relative' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                position: i === 0 ? 'relative' : 'absolute', inset: 0,
                opacity: activeTestimonial === i ? 1 : 0,
                transition: 'opacity 0.6s',
                pointerEvents: activeTestimonial === i ? 'auto' : 'none',
              }}>
                <Serif s={{ color: 'white', fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.6, display: 'block', fontStyle: 'italic', marginBottom: 24 }}>
                  "{t.quote}"
                </Serif>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: 'white',
                  }}>{t.name[0]}</div>
                  <div style={{ textAlign: 'left' }}>
                    <Sans s={{ color: 'white', fontSize: F.md, fontWeight: 600, display: 'block' }}>{t.name}</Sans>
                    <Sans s={{ color: 'rgba(255,255,255,0.65)', fontSize: F.sm }}>{t.role}</Sans>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                style={{
                  width: i === activeTestimonial ? 28 : 10, height: 10,
                  borderRadius: 5, background: i === activeTestimonial ? 'white' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.4s',
                }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 5%', background: C.cream }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Serif as="h2" s={{ fontSize: 'clamp(30px, 4vw, 50px)', color: C.slate, fontWeight: 700, display: 'block', marginBottom: 14 }}>
              Simple, transparent pricing
            </Serif>
            <Sans s={{ fontSize: F.lg, color: C.muted, display: 'block', lineHeight: 1.7 }}>
              Start free. Add credits when you're ready. Or ask your employer.
            </Sans>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {PRICING.map((p, i) => (
              <div key={i} style={{
                background: p.featured ? `linear-gradient(135deg, ${C.rubyDeep}, ${C.ruby})` : 'white',
                borderRadius: 24, padding: '36px 28px',
                boxShadow: p.featured ? '0 16px 48px rgba(184,41,47,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
                position: 'relative', transform: p.featured ? 'scale(1.04)' : 'none',
              }}>
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: C.gold, color: 'white', borderRadius: 20, padding: '4px 16px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: F.xs, fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>{p.badge}</div>
                )}
                <Serif s={{ fontSize: F.xl, color: p.featured ? 'white' : C.slate, display: 'block', marginBottom: 8 }}>{p.name}</Serif>
                <div style={{ marginBottom: 20 }}>
                  <Serif s={{ fontSize: 44, color: p.featured ? 'white' : C.ruby, fontWeight: 700, lineHeight: 1 }}>{p.price}</Serif>
                  {p.sub && <Sans s={{ fontSize: F.sm, color: p.featured ? 'rgba(255,255,255,0.7)' : C.muted, display: 'block', marginTop: 4 }}>{p.sub}</Sans>}
                </div>
                <div style={{ borderTop: `1px solid ${p.featured ? 'rgba(255,255,255,0.2)' : C.faint}`, paddingTop: 20, marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                      <span style={{ color: p.featured ? 'rgba(255,255,255,0.9)' : C.sage, fontSize: 16, flexShrink: 0 }}>✓</span>
                      <Sans s={{ fontSize: F.sm, color: p.featured ? 'rgba(255,255,255,0.85)' : C.muted, lineHeight: 1.5 }}>{f}</Sans>
                    </div>
                  ))}
                </div>
                <Btn
                  onClick={onGetStarted}
                  v={p.featured ? 'white' : 'primary'}
                  s={{ width: '100%', padding: '14px 0', fontSize: F.md }}
                >
                  {p.cta}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR EMPLOYERS ── */}
      <section id="for-employers" style={{ padding: '100px 5%', background: C.parchment }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Sans s={{ color: C.gold, fontSize: F.sm, fontWeight: 600, letterSpacing: '0.18em', display: 'block', marginBottom: 12 }}>
              FOR HR & PEOPLE TEAMS
            </Sans>
            <Serif as="h2" s={{ fontSize: 'clamp(28px, 3.5vw, 46px)', color: C.slate, fontWeight: 700, display: 'block', marginBottom: 16, lineHeight: 1.2 }}>
              Your midlife women employees are a retention risk. Her Ruby fixes that.
            </Serif>
            <Sans s={{ fontSize: F.md, color: C.muted, lineHeight: 1.8, display: 'block', marginBottom: 28 }}>
              Menopause and midlife transitions cost Canadian employers an estimated $3.5B annually in lost productivity and turnover. Her Ruby is a targeted, measurable solution — not a generic EAP.
            </Sans>
            {['Reduced absenteeism & presenteeism', 'Higher retention of experienced talent', 'Measurable wellbeing improvements', 'Positive employer brand & D&I outcomes', 'Anonymous aggregate HR dashboard'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.sagePale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>✓</div>
                <Sans s={{ fontSize: F.md, color: C.slate }}>{item}</Sans>
              </div>
            ))}
            <Btn v="gold" s={{ marginTop: 24, padding: '14px 28px', fontSize: F.md }}>
              Request Corporate Demo →
            </Btn>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <Sans s={{ fontSize: F.sm, color: C.muted, letterSpacing: '0.14em', fontWeight: 600, display: 'block', marginBottom: 20 }}>
                ANONYMOUS HR DASHBOARD
              </Sans>
              {[
                { label: 'Participation Rate', value: '80%', color: C.ruby },
                { label: 'Avg Wellbeing Improvement', value: '+34%', color: C.sage },
                { label: 'Energy Score', value: '7.1 / 10', color: C.indigo },
                { label: 'Retention Signal', value: 'High ↑', color: C.gold },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? `1px solid ${C.faint}` : 'none' }}>
                  <Sans s={{ fontSize: F.md, color: C.muted }}>{m.label}</Sans>
                  <Serif s={{ fontSize: F.xl, color: m.color, fontWeight: 700 }}>{m.value}</Serif>
                </div>
              ))}
              <Sans s={{ fontSize: F.xs, color: C.muted, display: 'block', marginTop: 14, lineHeight: 1.5 }}>
                🔒 No personal health data ever shared. PIPEDA compliant.
              </Sans>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 5%', background: `linear-gradient(150deg, ${C.rubyDeep}, ${C.ruby})`, textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>♦</div>
          <Serif as="h2" s={{ color: 'white', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, display: 'block', marginBottom: 20, lineHeight: 1.2 }}>
            Your Ruby is waiting for you.
          </Serif>
          <Sans s={{ color: 'rgba(255,255,255,0.82)', fontSize: F.lg, lineHeight: 1.8, display: 'block', marginBottom: 40 }}>
            Join 2,400+ Canadian women who are reclaiming their energy, confidence and performance through midlife.
          </Sans>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={onGetStarted} v="white" s={{ padding: '17px 36px', fontSize: F.lg, borderRadius: 16 }}>
              Create Free Account ✦
            </Btn>
            <button onClick={onSignIn}
              style={{
                background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: 16, padding: '17px 36px', color: 'white',
                fontFamily: "'DM Sans', sans-serif", fontSize: F.lg, fontWeight: 600, cursor: 'pointer',
              }}>
              Already a member? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.slate, padding: '48px 5%', color: 'rgba(255,255,255,0.6)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Serif s={{ color: 'white', fontSize: F.xl, display: 'block', marginBottom: 8 }}>♦ Her Ruby</Serif>
            <Sans s={{ fontSize: F.sm, lineHeight: 1.7, maxWidth: 260 }}>
              Midlife Women's Vitality Platform<br />
              Built in Canada 🇨🇦 · PIPEDA Compliant
            </Sans>
          </div>
          {[
            { title: 'Platform', links: ['My Body', 'Programmes', 'Ruby Circle', 'Wellness Wallet', 'Knowledge Hub'] },
            { title: 'Company', links: ['About', 'For Employers', 'Partners', 'Blog', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'ID Verification Policy', 'PIPEDA Statement'] },
          ].map(col => (
            <div key={col.title}>
              <Sans s={{ color: 'white', fontSize: F.sm, fontWeight: 600, display: 'block', marginBottom: 14 }}>{col.title}</Sans>
              {col.links.map(l => (
                <a key={l} href="#" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: F.sm, marginBottom: 8 }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Sans s={{ fontSize: F.xs }}>© 2025 Her Ruby Inc. All rights reserved.</Sans>
          <Sans s={{ fontSize: F.xs }}>Made with ♥ for women navigating midlife</Sans>
        </div>
      </footer>
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '◉', title: 'My Body', color: '#B8292F', desc: 'Track energy, brain fog, stress and sleep. Get plain-language explanations of what\'s happening hormonally — and what to do about it.' },
  { icon: '◈', title: 'Programmes & Experiences', color: '#B8862A', desc: 'Book signature 1–6 week programmes, social outings, creative workshops and outdoor experiences — all designed for women in her midlife.' },
  { icon: '❋', title: 'Ruby Circle', color: '#5E8C61', desc: 'Join small, verified, women-only circles organised by interest and life stage. Real connection, not social media noise.' },
  { icon: '◆', title: 'Wellness Wallet', color: '#5C6BC0', desc: 'Fund your wellness with credits from your employer, a self top-up, or a gift from a loved one. Redeemable across the whole platform.' },
  { icon: '♦', title: 'Knowledge Hub', color: '#27AE8F', desc: 'Live expert sessions and on-demand content covering menopause, career performance, financial planning, nutrition and more.' },
  { icon: '🔒', title: 'Safe & Verified', color: '#9B7EC8', desc: 'Identity verification keeps Her Ruby a trusted women-only space. Your data stays encrypted, private and stored in Canada.' },
];

const HOW_STEPS = [
  { title: 'Create your account', desc: 'Sign up with email, Google or Apple ID in under 60 seconds. No credit card required.' },
  { title: 'Tell us about you', desc: 'A short 5-question personalisation sets your goals, symptoms and life stage — so every recommendation is relevant to you.' },
  { title: 'Verify your identity (once)', desc: 'A quick 2-minute ID check unlocks Circles and paid programmes. This keeps every member safe and the community trusted.' },
  { title: 'Start your journey', desc: 'Book your first session, join a Circle, log today\'s energy — or browse the Hub. Your Ruby is waiting.' },
];

const TESTIMONIALS = [
  { quote: 'I was running on empty for two years. Her Ruby gave me language for what was happening and a community who actually got it. My energy score went from 3 to 7 in six weeks.', name: 'Margaret T.', role: 'Senior Director, 58 · Toronto' },
  { quote: 'My employer funds my credits through their wellness benefit. I\'ve attended 12 sessions and my brain fog has basically disappeared. My manager noticed before I did.', name: 'Diane L.', role: 'Project Manager, 52 · Ontario' },
  { quote: 'I was sceptical about another "wellness app." This is different. The women in my Circle have become real friends. We walk together on Saturdays now.', name: 'Carol S.', role: 'Recently Retired, 64 · Mississauga' },
];

const PRICING = [
  {
    name: 'Explorer', price: 'Free', sub: 'No credit card needed', featured: false,
    features: ['My Body symptom tracker', 'Knowledge Hub browsing', 'Join 1 Circle (verified)', 'Browse all programmes'],
    cta: 'Start Free ✦',
  },
  {
    name: 'Monthly', price: '$180', sub: '10 credits · $18/credit', featured: true, badge: 'Most Popular',
    features: ['Everything in Explorer', '10 wellness credits ($200 value)', 'Book programmes & experiences', 'Wellness Wallet access', 'All Circles unlocked', 'Priority session booking'],
    cta: 'Get Started ✦',
  },
  {
    name: 'Quarterly', price: '$320', sub: '20 credits · $16/credit', featured: false,
    features: ['Everything in Monthly', '20 wellness credits ($400 value)', 'Best per-credit value', 'Credits never expire'],
    cta: 'Best Value ✦',
  },
];
