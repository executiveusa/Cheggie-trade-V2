'use client'

import { useEffect, useState, useRef } from 'react'
import type { ConnectedRepo } from '@/lib/tasks-store'

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

function Input({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          borderRadius: '6px',
          padding: '0.625rem 0.875rem',
          color: C.text,
          fontSize: '0.875rem',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

type ScanResult = {
  filesScanned: number
  violations: Array<{ file: string; pattern: string; severity: string }>
}

export default function ReposPage() {
  const [repos, setRepos] = useState<ConnectedRepo[]>([])
  const [adding, setAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [branch, setBranch] = useState('main')
  const [loading, setLoading] = useState(false)
  const [scanResults, setScanResults] = useState<Record<string, ScanResult>>({})
  const [scanning, setScanning] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  useEffect(() => { loadRepos() }, [])

  async function loadRepos() {
    const r = await fetch('/api/repos')
    const d = await r.json() as { repos: ConnectedRepo[] }
    setRepos(d.repos ?? [])
  }

  async function addRepo() {
    if (!url) return
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token: token || undefined, branch }),
      })
      const d = await r.json() as { repo?: ConnectedRepo; error?: string }
      if (!r.ok) { setError(d.error ?? 'Failed to add repo'); return }
      setRepos(prev => [d.repo!, ...prev])
      setUrl(''); setToken(''); setBranch('main'); setAdding(false)
    } finally {
      setLoading(false)
    }
  }

  async function scanRepo(id: string) {
    setScanning(prev => ({ ...prev, [id]: true }))
    try {
      const r = await fetch(`/api/repos?id=${id}`, { method: 'PUT' })
      const d = await r.json() as ScanResult & { repo?: ConnectedRepo }
      setScanResults(prev => ({ ...prev, [id]: d }))
      if (d.repo) setRepos(prev => prev.map(repo => repo.id === id ? d.repo! : repo))
    } finally {
      setScanning(prev => ({ ...prev, [id]: false }))
    }
  }

  async function removeRepo(id: string) {
    await fetch(`/api/repos?id=${id}`, { method: 'DELETE' })
    setRepos(prev => prev.filter(r => r.id !== id))
    setScanResults(prev => { const c = { ...prev }; delete c[id]; return c })
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Studio OS · Repositories</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>
            Repository Manager
          </h1>
          <p style={{ color: C.muted, fontSize: '0.875rem' }}>
            Connect GitHub repos · Scan for design violations · Batch-apply standards
          </p>
        </div>
        <button
          onClick={() => setAdding(v => !v)}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '7px',
            background: C.gold,
            color: '#0d0f0e',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 400,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            fontFamily: 'inherit',
          }}
        >
          + Connect Repo
        </button>
      </div>

      {/* Add Repo form */}
      {adding && (
        <div style={{
          background: C.surface,
          border: `1px solid rgba(201,169,110,0.2)`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />
          <p style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 400, marginBottom: '1.25rem' }}>Connect GitHub Repository</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Input label="GitHub URL" value={url} onChange={setUrl} placeholder="https://github.com/owner/repo" />
            <Input label="Branch" value={branch} onChange={setBranch} placeholder="main" />
            <Input label="Token (optional)" value={token} onChange={setToken} placeholder="ghp_..." type="password" />
          </div>
          {error && <p style={{ color: C.error, fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={addRepo}
              disabled={loading || !url}
              style={{
                padding: '0.5625rem 1.125rem',
                borderRadius: '6px',
                background: url ? C.gold : 'rgba(255,255,255,0.05)',
                color: url ? '#0d0f0e' : C.dim,
                border: 'none',
                fontSize: '0.8125rem',
                cursor: url ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Connecting…' : 'Connect'}
            </button>
            <button
              onClick={() => { setAdding(false); setError('') }}
              style={{ padding: '0.5625rem 1rem', borderRadius: '6px', background: 'transparent', color: C.dim, border: `1px solid ${C.border}`, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Repo list */}
      {repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: C.dim }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', marginBottom: '0.75rem', color: C.muted }}>No repos connected</p>
          <p style={{ fontSize: '0.875rem' }}>Connect a GitHub repo to scan for design violations and apply standards.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {repos.map(repo => {
            const result = scanResults[repo.id]
            const isScanning = scanning[repo.id]
            return (
              <div key={repo.id} style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {/* Repo header */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ color: C.dim, flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M7 3v4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      <h3 style={{ fontSize: '0.9375rem', color: C.text, fontWeight: 400 }}>{repo.owner}/{repo.name}</h3>
                      <span style={{ fontSize: '0.625rem', color: C.dim, background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                        {repo.branch}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: C.dim }}>
                      Added {new Date(repo.addedAt).toLocaleDateString()} ·
                      {repo.lastScanned ? ` Scanned ${new Date(repo.lastScanned).toLocaleDateString()}` : ' Never scanned'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {repo.violations > 0 && (
                      <span style={{ fontSize: '0.75rem', color: C.error, background: 'rgba(232,112,112,0.1)', padding: '0.25rem 0.625rem', borderRadius: '4px' }}>
                        {repo.violations} violations
                      </span>
                    )}
                    {repo.violations === 0 && repo.lastScanned && (
                      <span style={{ fontSize: '0.75rem', color: C.success, background: 'rgba(110,168,126,0.1)', padding: '0.25rem 0.625rem', borderRadius: '4px' }}>
                        ✓ Clean
                      </span>
                    )}
                    <button
                      onClick={() => scanRepo(repo.id)}
                      disabled={isScanning}
                      style={{
                        padding: '0.4375rem 0.875rem',
                        borderRadius: '5px',
                        background: 'transparent',
                        color: isScanning ? C.dim : C.gold,
                        border: `1px solid ${isScanning ? C.border : 'rgba(201,169,110,0.3)'}`,
                        fontSize: '0.75rem',
                        cursor: isScanning ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {isScanning ? 'Scanning…' : 'Scan'}
                    </button>
                    <button
                      onClick={() => removeRepo(repo.id)}
                      style={{ padding: '0.4375rem 0.75rem', borderRadius: '5px', background: 'transparent', color: C.dim, border: `1px solid ${C.border}`, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scan results */}
                {result && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '1rem 1.5rem' }}>
                    <p style={{ fontSize: '0.6875rem', color: C.dim, marginBottom: '0.75rem' }}>
                      Scanned {result.filesScanned} files · {result.violations.length} violations found
                    </p>
                    {result.violations.length === 0 ? (
                      <p style={{ fontSize: '0.8125rem', color: C.success }}>✓ No design violations detected</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {result.violations.map((v, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                            <span style={{ fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.4rem', borderRadius: '3px', flexShrink: 0, marginTop: '1px', background: v.severity === 'error' ? 'rgba(232,112,112,0.1)' : 'rgba(232,192,112,0.1)', color: v.severity === 'error' ? C.error : C.warning }}>
                              {v.severity}
                            </span>
                            <div>
                              <p style={{ fontSize: '0.75rem', color: C.muted }}>{v.pattern}</p>
                              <p style={{ fontSize: '0.6875rem', color: C.dim, fontFamily: 'monospace' }}>{v.file}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {repos.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.75rem' }}>Batch actions across all repos:</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Apply design laws', 'Fix scroll listeners', 'Remove banned fonts', 'Add reduced-motion guards'].map(action => (
              <button key={action} style={{
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                background: 'transparent',
                color: C.dim,
                border: `1px solid ${C.border}`,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
