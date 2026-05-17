'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/studio-config'

const C = {
  border: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.025)',
  gold: '#c9a96e',
  text: '#f0ede6',
  muted: '#8a8780',
  dim: '#5a5855',
  success: '#6ea87e',
}

const AGENT_STATUS_LIVE: Record<string, { status: 'active' | 'idle'; lastTask: string; tasksRun: number }> = {
  concierge: { status: 'idle', lastTask: 'Routed 3 briefs to Architect', tasksRun: 147 },
  librarian: { status: 'idle', lastTask: 'Retrieved motion doctrine', tasksRun: 89 },
  architect: { status: 'active', lastTask: 'Drafting Kupuri v4 brief', tasksRun: 52 },
  frontend: { status: 'active', lastTask: 'Building 3 landing variations', tasksRun: 203 },
  copy: { status: 'idle', lastTask: 'Q2 newsletter copy complete', tasksRun: 76 },
  motion: { status: 'idle', lastTask: 'Cinematic flythrough rendered', tasksRun: 41 },
  spatial: { status: 'idle', lastTask: 'Lyra world.ksplat exported', tasksRun: 28 },
  reviewer: { status: 'active', lastTask: 'UDEC audit in progress', tasksRun: 194 },
  refactor: { status: 'idle', lastTask: 'Component dedup pass', tasksRun: 33 },
  packaging: { status: 'idle', lastTask: 'Client bundle packaged', tasksRun: 61 },
  memory: { status: 'idle', lastTask: 'Indexed 12 new patterns', tasksRun: 119 },
  ops: { status: 'idle', lastTask: 'Daily health check passed', tasksRun: 365 },
}

export default function AgentsPage() {
  const activeCount = Object.values(AGENT_STATUS_LIVE).filter(s => s.status === 'active').length

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px' }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Studio OS · Agents
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 300,
          color: C.text,
          letterSpacing: '-0.01em',
          marginBottom: '0.375rem',
        }}>
          Agent Network
        </h1>
        <p style={{ color: C.muted, fontSize: '0.875rem' }}>
          {activeCount} active · {12 - activeCount} idle · 0 offline
        </p>
      </div>

      {/* Class legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { label: 'Active', color: C.success },
          { label: 'Idle', color: C.dim },
          { label: 'Ralphy-class (Frontend)', color: '#6ea87e' },
          { label: 'Aurora-class (Motion)', color: '#d4916e' },
          { label: 'Blender-class (3D)', color: '#6ea8a8' },
          { label: 'Lena-class (Review)', color: C.gold },
          { label: 'Bass-class (Copy)', color: '#b87db8' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.6875rem', color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {AGENTS.map(agent => {
          const live = AGENT_STATUS_LIVE[agent.id]
          const isActive = live?.status === 'active'
          return (
            <div key={agent.id} style={{
              background: C.surface,
              border: `1px solid ${isActive ? 'rgba(110,168,126,0.2)' : C.border}`,
              borderRadius: '10px',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(110,168,126,0.5), transparent)',
                }} />
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      background: isActive ? C.success : C.dim,
                      boxShadow: isActive ? `0 0 6px ${C.success}99` : 'none',
                    }} />
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: C.text,
                      letterSpacing: '0.02em',
                    }}>
                      {agent.name}
                    </h3>
                  </div>
                  {agent.class && (
                    <span style={{
                      fontSize: '0.5625rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      background: 'rgba(201,169,110,0.08)',
                      color: C.gold,
                    }}>
                      {agent.class}
                    </span>
                  )}
                </div>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  background: isActive ? C.success : '#2a2825',
                }} />
              </div>

              {/* Role */}
              <p style={{ fontSize: '0.6875rem', color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {agent.role}
              </p>

              {/* Scope */}
              <p style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                {agent.scope}
              </p>

              {/* I/O */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '0.5rem 0.625rem' }}>
                  <p style={{ fontSize: '0.5625rem', color: '#3a3835', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Input</p>
                  <p style={{ fontSize: '0.6875rem', color: C.dim, lineHeight: 1.4 }}>{agent.inputs}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '0.5rem 0.625rem' }}>
                  <p style={{ fontSize: '0.5625rem', color: '#3a3835', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Output</p>
                  <p style={{ fontSize: '0.6875rem', color: C.dim, lineHeight: 1.4 }}>{agent.outputs}</p>
                </div>
              </div>

              {/* Stats + last task */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.625rem', color: '#3a3835' }}>Last: {live?.lastTask ?? '—'}</p>
                </div>
                <span style={{ fontSize: '0.6875rem', color: C.dim }}>{live?.tasksRun ?? 0} runs</span>
              </div>

              {/* Invoke button */}
              <Link href={`/dashboard/command?agent=${agent.id}`} style={{
                display: 'block',
                marginTop: '0.75rem',
                padding: '0.5rem',
                borderRadius: '5px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: C.dim,
                border: `1px solid ${C.border}`,
                transition: 'all 150ms ease',
              }}>
                Invoke →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
