'use client'

import { useState } from 'react'
import { SKILLS, DESIGN_LAWS, ANTI_PATTERNS, UDEC_AXES } from '@/lib/studio-config'

const C = {
  border: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.025)',
  gold: '#c9a96e',
  text: '#f0ede6',
  muted: '#8a8780',
  dim: '#5a5855',
  success: '#6ea87e',
  error: '#e87070',
  warning: '#e8c070',
}

const TABS = ['Skills', 'Design Laws', 'UDEC Axes', 'Anti-Patterns'] as const
type Tab = typeof TABS[number]

const DOMAIN_COLORS: Record<string, string> = {
  '3D / Spatial': '#6ea8a8',
  'Motion': '#d4916e',
  'Frontend': C.success,
  'Design': '#8fb8d4',
  'Brand': '#b87db8',
  'Strategy': C.muted,
  'Copy': '#b87db8',
  'UX': '#8fb8d4',
  'Quality': C.gold,
  'Delivery': C.dim,
  'Philosophy': C.gold,
}

export default function StandardsPage() {
  const [tab, setTab] = useState<Tab>('Skills')

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Studio OS · Standards</p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>
          Design Standards Library
        </h1>
        <p style={{ color: C.muted, fontSize: '0.875rem' }}>
          12 skill files · 14 design laws · UDEC 14-axis quality framework · Anti-pattern registry
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${C.border}`, marginBottom: '2rem' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? C.gold : 'transparent'}`,
              color: tab === t ? C.text : C.dim,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
              transition: 'all 150ms ease',
              marginBottom: '-1px',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Skills tab */}
      {tab === 'Skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {SKILLS.map(skill => (
            <div key={skill.id} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', bottom: 0, background: DOMAIN_COLORS[skill.domain] ?? C.dim, borderRadius: '10px 0 0 10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                <h3 style={{ fontSize: '0.9375rem', color: C.text, fontWeight: 400, lineHeight: 1.3 }}>{skill.name}</h3>
                <span style={{
                  fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '0.2rem 0.5rem', borderRadius: '3px', flexShrink: 0, marginLeft: '0.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: DOMAIN_COLORS[skill.domain] ?? C.dim,
                }}>
                  {skill.domain}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.55, marginBottom: '0.875rem' }}>{skill.description}</p>
              <div>
                <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Triggers</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {skill.triggers.slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: '0.5625rem', padding: '0.1875rem 0.4rem', borderRadius: '3px', background: 'rgba(255,255,255,0.03)', color: C.dim, border: `1px solid ${C.border}` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.6875rem', color: C.dim, fontFamily: 'monospace' }}>studio/doctrine/{skill.file}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Design Laws tab */}
      {tab === 'Design Laws' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            {DESIGN_LAWS.map((law, i) => (
              <div key={law.n} style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: '1.25rem',
                padding: '1.25rem 1.5rem',
                borderBottom: i < DESIGN_LAWS.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.125rem', color: C.gold, paddingTop: '0.125rem' }}>
                  {String(law.n).padStart(2, '0')}
                </span>
                <div>
                  <h3 style={{ fontSize: '0.875rem', color: C.text, fontWeight: 400, marginBottom: '0.375rem' }}>{law.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.55 }}>{law.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UDEC Axes tab */}
      {tab === 'UDEC Axes' && (
        <div>
          <div style={{ background: 'rgba(201,169,110,0.05)', border: `1px solid rgba(201,169,110,0.15)`, borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.6 }}>
              <strong style={{ color: C.gold }}>UDEC 8.5 floor.</strong> All 14 axes are scored 1–10 and weighted.{' '}
              <strong style={{ color: C.error }}>MOT (Motion) and ACC (Accessibility) are BLOCKERS</strong> — scoring below 7.0 on either axis triggers a full rebuild. No overrides.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {UDEC_AXES.map(axis => (
              <div key={axis.id} style={{
                background: axis.blocker ? 'rgba(232,112,112,0.04)' : C.surface,
                border: `1px solid ${axis.blocker ? 'rgba(232,112,112,0.2)' : C.border}`,
                borderRadius: '8px',
                padding: '1rem 1.125rem',
                position: 'relative',
              }}>
                {axis.blocker && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(232,112,112,0.15)', padding: '0.2rem 0.5rem', borderRadius: '0 8px 0 5px' }}>
                    <span style={{ fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.error }}>BLOCKER</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.1em', color: axis.blocker ? C.error : C.gold }}>
                    {axis.id}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: C.dim }}>×{axis.weight}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 400 }}>{axis.name}</p>
                {axis.blocker && (
                  <p style={{ fontSize: '0.6875rem', color: C.error, marginTop: '0.375rem' }}>Min 7.0 required</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anti-Patterns tab */}
      {tab === 'Anti-Patterns' && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          {ANTI_PATTERNS.map((ap, i) => (
            <div key={ap.id} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: i < ANTI_PATTERNS.length - 1 ? `1px solid ${C.border}` : 'none',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '0.5625rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: ap.severity === 'error' ? 'rgba(232,112,112,0.1)' : 'rgba(232,192,112,0.1)',
                color: ap.severity === 'error' ? C.error : C.warning,
                textAlign: 'center',
                alignSelf: 'start',
                marginTop: '2px',
              }}>
                {ap.severity}
              </span>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: C.gold, marginBottom: '0.25rem' }}>{ap.id}</p>
                <p style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.5 }}>{ap.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
