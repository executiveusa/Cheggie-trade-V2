'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Task } from '@/lib/tasks-store'

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: '#0d0f0e',
  surface: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.07)',
  gold: '#c9a96e',
  goldDim: 'rgba(201,169,110,0.1)',
  text: '#f0ede6',
  muted: '#8a8780',
  dim: '#5a5855',
  success: '#6ea87e',
  error: '#e87070',
  warning: '#e8c070',
}

const ACTIVITY_FEED = [
  { agent: 'LENA', action: 'Scored querencia-v3 landing', score: 9.1, ts: '2m ago', type: 'review' },
  { agent: 'RALPHY', action: 'Built 3 landing variations for Kupuri', ts: '14m ago', type: 'build' },
  { agent: 'BLENDER', action: 'Exported world.ksplat (12.4 MB)', ts: '31m ago', type: '3d' },
  { agent: 'AURORA', action: 'Rendered cinematic flythrough (180 frames)', ts: '45m ago', type: 'motion' },
  { agent: 'OPS', action: 'Daily health check passed — 0 stale jobs', ts: '1h ago', type: 'ops' },
  { agent: 'CONCIERGE', action: 'Routed 3 new briefs to Experience Architect', ts: '2h ago', type: 'routing' },
]

const AGENT_STATUS = [
  { name: 'CONCIERGE', status: 'idle', lastTask: 'Routed brief → Architect', ts: '2h ago' },
  { name: 'LIBRARIAN', status: 'idle', lastTask: 'Retrieved motion doctrine', ts: '3h ago' },
  { name: 'ARCHITECT', status: 'active', lastTask: 'Drafting Kupuri v4 brief', ts: 'now' },
  { name: 'RALPHY', status: 'active', lastTask: 'Building 3 HTML variations', ts: 'now' },
  { name: 'BASS', status: 'idle', lastTask: 'Newsletter copy for Q2', ts: '4h ago' },
  { name: 'AURORA', status: 'idle', lastTask: 'Flythrough render complete', ts: '45m ago' },
  { name: 'BLENDER', status: 'idle', lastTask: 'Lyra world export done', ts: '31m ago' },
  { name: 'LENA', status: 'active', lastTask: 'UDEC audit in progress', ts: 'now' },
  { name: 'REFACTOR', status: 'idle', lastTask: 'Deduped component registry', ts: '1d ago' },
  { name: 'PACKAGING', status: 'idle', lastTask: 'Client bundle prepared', ts: '2d ago' },
  { name: 'MEMORY', status: 'idle', lastTask: 'Indexed 12 new patterns', ts: '6h ago' },
  { name: 'OPS', status: 'idle', lastTask: 'Daily health check passed', ts: '1h ago' },
]

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${accent ? 'rgba(201,169,110,0.2)' : C.border}`,
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
        }} />
      )}
      <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 300, color: accent ? C.gold : C.text, fontFamily: 'var(--font-cormorant)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.375rem' }}>{sub}</p>}
    </div>
  )
}

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    review: C.gold,
    build: C.success,
    '3d': '#6ea8a8',
    motion: '#d4916e',
    ops: C.muted,
    routing: C.dim,
  }
  return (
    <div style={{
      width: '6px', height: '6px', borderRadius: '50%',
      background: colors[type] ?? C.muted, flexShrink: 0, marginTop: '5px',
    }} />
  )
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => {
        setTasks(d.tasks ?? [])
        setActiveCount((d.tasks ?? []).filter((t: Task) => t.status === 'running').length)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Studio OS · Overview
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 300,
          color: C.text,
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}>
          Design Command Center
        </h1>
        <p style={{ color: C.muted, fontSize: '0.875rem', marginTop: '0.375rem' }}>
          12 agents · Lyra 3D worlds · OpenClaw routing · UDEC 8.5 floor
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard label="Active Tasks" value={activeCount || tasks.filter(t => t.status === 'running').length || 3} sub="in the pipeline" accent />
        <StatCard label="Agents Online" value={AGENT_STATUS.filter(a => a.status !== 'offline').length} sub="12 total" />
        <StatCard label="Avg UDEC" value="9.1" sub="floor: 8.5" />
        <StatCard label="Design Laws" value="14" sub="all enforced" />
        <StatCard label="Skills" value="12" sub="doctrine files" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/dashboard/command', label: 'New Command', primary: true },
            { href: '/dashboard/tasks', label: 'View Tasks', primary: false },
            { href: '/dashboard/repos', label: 'Scan Repos', primary: false },
            { href: '/dashboard/standards', label: 'Browse Standards', primary: false },
          ].map(({ href, label, primary }) => (
            <Link key={href} href={href} style={{
              padding: '0.5rem 1.125rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              letterSpacing: '0.04em',
              fontWeight: primary ? 400 : 300,
              background: primary ? C.gold : 'transparent',
              color: primary ? '#0d0f0e' : C.muted,
              border: primary ? 'none' : `1px solid ${C.border}`,
              transition: 'all 150ms ease',
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Agent Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Agent Network
            </p>
            <Link href="/dashboard/agents" style={{ fontSize: '0.75rem', color: C.gold, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
            {AGENT_STATUS.map(agent => (
              <div key={agent.name} style={{
                background: C.surface,
                border: `1px solid ${agent.status === 'active' ? 'rgba(110,168,126,0.25)' : C.border}`,
                borderRadius: '8px',
                padding: '0.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                    background: agent.status === 'active' ? C.success : C.dim,
                    boxShadow: agent.status === 'active' ? `0 0 5px ${C.success}88` : 'none',
                  }} />
                  <span style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', color: C.text, fontWeight: 400 }}>{agent.name}</span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: C.dim, lineHeight: 1.4, marginBottom: '0.25rem' }}>{agent.lastTask}</p>
                <p style={{ fontSize: '0.5625rem', color: '#3a3835' }}>{agent.ts}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Activity
            </p>
          </div>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} style={{
                padding: '0.875rem 1rem',
                borderBottom: i < ACTIVITY_FEED.length - 1 ? `1px solid ${C.border}` : 'none',
                display: 'flex',
                gap: '0.75rem',
              }}>
                <ActivityDot type={item.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', color: C.gold, fontWeight: 400 }}>{item.agent}</span>
                    {'score' in item && (
                      <span style={{ fontSize: '0.6875rem', color: C.success, flexShrink: 0 }}>UDEC {item.score}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: C.muted, lineHeight: 1.4, marginTop: '0.1rem' }}>{item.action}</p>
                  <p style={{ fontSize: '0.5625rem', color: '#3a3835', marginTop: '0.25rem' }}>{item.ts}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent tasks */}
          {tasks.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                Recent Tasks
              </p>
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: C.text }}>{task.title}</p>
                    <p style={{ fontSize: '0.625rem', color: C.dim, marginTop: '0.125rem' }}>{task.agent}</p>
                  </div>
                  <span style={{
                    fontSize: '0.5625rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: task.status === 'complete' ? 'rgba(110,168,126,0.1)' : task.status === 'failed' ? 'rgba(232,112,112,0.1)' : 'rgba(201,169,110,0.1)',
                    color: task.status === 'complete' ? C.success : task.status === 'failed' ? C.error : C.gold,
                  }}>{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: '0.6875rem', color: '#2a2825' }}>
          Cynthia Studio OS v2.0 · Powered by NVIDIA Lyra + OpenClaw routing · UDEC 8.5 quality floor · 14 design laws enforced
        </p>
      </div>
    </div>
  )
}
