'use client'

import { useEffect, useState, useRef } from 'react'
import type { Task } from '@/lib/tasks-store'

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

const TASK_TYPES = [
  { value: 'site-audit', label: 'Site Audit' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'web-app', label: 'Web Application' },
  { value: 'animation', label: 'Animation / Motion' },
  { value: '3d-asset', label: '3D Asset' },
  { value: '3d-world', label: '3D World (Lyra)' },
  { value: 'copy', label: 'Copy & Narrative' },
  { value: 'brand', label: 'Brand / Identity' },
  { value: 'review', label: 'UDEC Review' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'batch-update', label: 'Batch Design Update' },
]

function StatusBadge({ status }: { status: Task['status'] }) {
  const config = {
    queued: { bg: 'rgba(255,255,255,0.05)', color: C.dim, label: 'Queued' },
    running: { bg: 'rgba(201,169,110,0.12)', color: C.gold, label: 'Running' },
    complete: { bg: 'rgba(110,168,126,0.12)', color: C.success, label: 'Complete' },
    failed: { bg: 'rgba(232,112,112,0.12)', color: C.error, label: 'Failed' },
  }[status]

  return (
    <span style={{
      fontSize: '0.5625rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '0.25rem 0.5625rem',
      borderRadius: '4px',
      background: config.bg,
      color: config.color,
      fontWeight: 400,
    }}>
      {config.label}
    </span>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Task | null>(null)
  const [type, setType] = useState('site-audit')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadTasks()
    pollRef.current = setInterval(loadTasks, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => {
    // Keep selected task updated from latest list
    if (selected) {
      const updated = tasks.find(t => t.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [tasks])

  async function loadTasks() {
    const r = await fetch('/api/tasks')
    const d = await r.json() as { tasks: Task[] }
    setTasks(d.tasks ?? [])
  }

  async function createTask() {
    if (!title) return
    setLoading(true)
    try {
      const r = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${title}. ${description}`, mode: 'classify' }),
      })
      const d = await r.json() as { task?: Task }
      if (d.task) {
        setTasks(prev => [d.task!, ...prev])
        setSelected(d.task!)
        setCreating(false)
        setTitle(''); setDescription(''); setRepoUrl(''); setType('site-audit')
      }
    } finally {
      setLoading(false)
    }
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Studio OS · Tasks</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>
            Task Queue
          </h1>
          <p style={{ color: C.muted, fontSize: '0.875rem' }}>
            {tasks.filter(t => t.status === 'running').length} running ·{' '}
            {tasks.filter(t => t.status === 'queued').length} queued ·{' '}
            {tasks.filter(t => t.status === 'complete').length} complete
          </p>
        </div>
        <button
          onClick={() => setCreating(v => !v)}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '7px',
            background: C.gold,
            color: '#0d0f0e',
            border: 'none',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
          }}
        >
          + New Task
        </button>
      </div>

      {/* Create task form */}
      {creating && (
        <div style={{ background: C.surface, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />
          <p style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 400, marginBottom: '1.25rem' }}>Create New Task</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Task Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '0.625rem 0.875rem', color: C.text, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
              >
                {TASK_TYPES.map(t => <option key={t.value} value={t.value} style={{ background: '#0d0f0e' }}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Brief description of the task"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '0.625rem 0.875rem', color: C.text, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed requirements, context, references..."
              rows={3}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '0.625rem 0.875rem', color: C.text, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={createTask} disabled={loading || !title} style={{ padding: '0.5625rem 1.125rem', borderRadius: '6px', background: title ? C.gold : 'rgba(255,255,255,0.05)', color: title ? '#0d0f0e' : C.dim, border: 'none', fontSize: '0.8125rem', cursor: title ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              {loading ? 'Creating…' : 'Create Task'}
            </button>
            <button onClick={() => setCreating(false)} style={{ padding: '0.5625rem 1rem', borderRadius: '6px', background: 'transparent', color: C.dim, border: `1px solid ${C.border}`, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem' }}>

        {/* Task list */}
        <div>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: C.dim }}>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: C.muted, marginBottom: '0.75rem' }}>No tasks yet</p>
              <p style={{ fontSize: '0.875rem' }}>Create a task to route it through the 12-agent studio network.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelected(task.id === selected?.id ? null : task)}
                  style={{
                    background: selected?.id === task.id ? 'rgba(201,169,110,0.05)' : C.surface,
                    border: `1px solid ${selected?.id === task.id ? 'rgba(201,169,110,0.2)' : C.border}`,
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold }}>{task.type}</span>
                      <span style={{ fontSize: '0.5625rem', color: C.dim }}>→ {task.agent}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                    <p style={{ fontSize: '0.6875rem', color: C.dim, marginTop: '0.125rem' }}>
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <StatusBadge status={task.status} />
                    <button
                      onClick={e => { e.stopPropagation(); deleteTask(task.id) }}
                      style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '0.875rem', padding: '0.25rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task detail */}
        {selected && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', height: 'fit-content', position: 'sticky', top: '1.5rem' }}>
            <div style={{ padding: '1.25rem', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
              <h3 style={{ fontSize: '0.9375rem', color: C.text, fontWeight: 400, marginBottom: '0.25rem' }}>{selected.title}</h3>
              <p style={{ fontSize: '0.75rem', color: C.dim }}>{selected.agent} · {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            {selected.description && (
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '0.75rem', color: C.muted, lineHeight: 1.6 }}>{selected.description}</p>
              </div>
            )}
            <div style={{ padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Output Log</p>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.6875rem', lineHeight: 1.7, color: C.muted, maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selected.output.length > 0
                  ? selected.output.join('\n')
                  : <span style={{ color: C.dim }}>No output yet…</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
