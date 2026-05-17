'use client'

import { useState } from 'react'

const C = {
  border: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.025)',
  gold: '#c9a96e',
  goldDim: 'rgba(201,169,110,0.08)',
  text: '#f0ede6',
  muted: '#8a8780',
  dim: '#5a5855',
  success: '#6ea87e',
  error: '#e87070',
}

const AGENT_CLASSES = [
  { value: 'Ralphy-class', label: 'Ralphy-class — Frontend Builder' },
  { value: 'Aurora-class', label: 'Aurora-class — Motion & Video' },
  { value: 'Blender-class', label: 'Blender-class — 3D & Spatial' },
  { value: 'Lena-class', label: 'Lena-class — Design Reviewer' },
  { value: 'Bass-class', label: 'Bass-class — Copy & Narrative' },
  { value: 'custom', label: 'Custom — Define your own role' },
]

const ALL_SKILLS = [
  { id: '3d-world-SKILL.md',           label: '3D World Generation',     badge: 'Lyra + HY-WorldPlay',  color: '#6ea87e' },
  { id: 'hy-worldplay-SKILL.md',        label: 'HY-WorldPlay (Tencent)',  badge: 'HuggingFace',          color: '#6ea87e' },
  { id: 'seedance-video-SKILL.md',      label: 'Seedance Video',          badge: 'ByteDance / Replicate', color: '#c9a96e' },
  { id: 'motion-SKILL.md',              label: 'Motion & Animation',      badge: 'GSAP / Framer',        color: '#c9a96e' },
  { id: 'kupuri-frontend-SKILL.md',     label: 'Kupuri Frontend',         badge: 'Next.js / React',      color: '#8a8780' },
  { id: 'design-principles-SKILL.md',   label: 'Design Principles',       badge: 'Core',                 color: '#8a8780' },
  { id: 'color-psychology-SKILL.md',    label: 'Color Psychology',        badge: 'Brand',                color: '#8a8780' },
  { id: 'brand-SKILL.md',               label: 'Brand Systems',           badge: 'Identity',             color: '#8a8780' },
  { id: 'luxury-psychology-SKILL.md',   label: 'Luxury Psychology',       badge: 'Premium',              color: '#8a8780' },
  { id: 'pass-framework-SKILL.md',      label: 'PASS Framework',          badge: 'Strategy',             color: '#8a8780' },
  { id: 'behavioral-design-laws-SKILL.md', label: 'Behavioral Design',   badge: 'UX',                   color: '#8a8780' },
  { id: 'udec-scorer-SKILL.md',         label: 'UDEC Scorer',             badge: 'Quality Gate',         color: '#c9a96e' },
  { id: 'land-the-plane-SKILL.md',      label: 'Land the Plane',          badge: 'Delivery',             color: '#8a8780' },
]

type SpawnResult = {
  agentId: string
  agentName: string
  spawnedAt: string
  files: Record<string, string>
  endpoints: Record<string, string>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
        {label} {required && <span style={{ color: C.gold }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${C.border}`,
  borderRadius: '7px',
  padding: '0.625rem 0.875rem',
  color: C.text,
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
}

export default function SpawnPage() {
  const [step, setStep] = useState<'form' | 'spawning' | 'done'>('form')
  const [result, setResult] = useState<SpawnResult | null>(null)
  const [activeFile, setActiveFile] = useState('soul.md')
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  // Form state
  const [agentName, setAgentName] = useState('')
  const [agentClass, setAgentClass] = useState('custom')
  const [role, setRole] = useState('')
  const [scope, setScope] = useState('')
  const [mission, setMission] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [teamEmail, setTeamEmail] = useState('')
  const [teamChannel, setTeamChannel] = useState('')
  const [githubOrg, setGithubOrg] = useState('')
  const [domain, setDomain] = useState('')
  const [vpsHost, setVpsHost] = useState('')
  const [model, setModel] = useState('claude-opus-4-7')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['udec-scorer-SKILL.md', 'design-principles-SKILL.md', '3d-world-SKILL.md'])

  function toggleSkill(skill: string) {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  async function handleSpawn() {
    if (!role || !teamEmail || !mission) { setError('Role, team email, and mission are required.'); return }
    setError(''); setStep('spawning')

    try {
      const res = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, agentClass, role, scope, mission, teamLead, teamEmail, teamChannel, githubOrg, domain, vpsHost, model, skills: selectedSkills }),
      })
      const data = await res.json() as SpawnResult & { error?: string }
      if (!res.ok) { setError(data.error ?? 'Spawn failed'); setStep('form'); return }
      setResult(data)
      setStep('done')
    } catch (err) {
      setError(String(err)); setStep('form')
    }
  }

  function copyFile(key: string, content: string) {
    navigator.clipboard.writeText(content)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  function downloadAll() {
    if (!result) return
    Object.entries(result.files).forEach(([name, content]) => {
      const blob = new Blob([content], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
    })
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Studio OS · Spawn
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
          Spawn Agent Clone
        </h1>
        <p style={{ color: C.muted, fontSize: '0.9375rem', maxWidth: '580px', lineHeight: 1.6 }}>
          Create an exact clone of this agent with an empty soul — grounded only in the Emerald Tablets.
          The clone ships with its own dashboard, FastAPI, MCP endpoints, and Hostinger deploy pipeline.
        </p>
      </div>

      {/* Architecture note */}
      <div style={{ background: C.goldDim, border: `1px solid rgba(201,169,110,0.15)`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
          <circle cx="8" cy="8" r="7" stroke="#c9a96e" strokeWidth="1.2"/>
          <path d="M8 5v3M8 10v1" stroke="#c9a96e" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <p style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.gold }}>Built on HERMES + Claude claude-opus-4-7.</strong>{' '}
          Spawned agents inherit the HERMES execution layer and the Emerald Tablets.
          Their soul file begins empty — only the 7 tablets and basic operating instructions are pre-loaded.
          The receiving team completes the soul before first deploy.
        </p>
      </div>

      {step === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Identity */}
            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />
              <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>01 — Agent Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Agent Name">
                  <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. CYNTHIA-ALPHA" style={inputStyle} />
                </Field>
                <Field label="Agent Class">
                  <select value={agentClass} onChange={e => setAgentClass(e.target.value)} style={{ ...inputStyle }}>
                    {AGENT_CLASSES.map(c => <option key={c.value} value={c.value} style={{ background: '#0d0f0e' }}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Primary Role" required>
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Build cinematic landing pages" style={inputStyle} />
                </Field>
                <Field label="Scope">
                  <input value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. HTML/CSS/JS only, no DB" style={inputStyle} />
                </Field>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Field label="Mission Statement" required>
                  <textarea value={mission} onChange={e => setMission(e.target.value)} placeholder="What does this agent serve? What problem does it solve for the team?" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>
            </section>

            {/* Team */}
            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>02 — Team</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Team Lead">
                  <input value={teamLead} onChange={e => setTeamLead(e.target.value)} placeholder="Name" style={inputStyle} />
                </Field>
                <Field label="Team Email" required>
                  <input type="email" value={teamEmail} onChange={e => setTeamEmail(e.target.value)} placeholder="team@company.com" style={inputStyle} />
                </Field>
                <Field label="Slack / Channel">
                  <input value={teamChannel} onChange={e => setTeamChannel(e.target.value)} placeholder="#design-agents" style={inputStyle} />
                </Field>
                <Field label="GitHub Org">
                  <input value={githubOrg} onChange={e => setGithubOrg(e.target.value)} placeholder="yourorg" style={inputStyle} />
                </Field>
              </div>
            </section>

            {/* Deployment */}
            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>03 — Deployment</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Domain">
                  <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="agent.yourcompany.com" style={inputStyle} />
                </Field>
                <Field label="Hostinger VPS Host">
                  <input value={vpsHost} onChange={e => setVpsHost(e.target.value)} placeholder="123.45.67.89" style={inputStyle} />
                </Field>
                <Field label="AI Model">
                  <select value={model} onChange={e => setModel(e.target.value)} style={{ ...inputStyle }}>
                    {['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'].map(m => (
                      <option key={m} value={m} style={{ background: '#0d0f0e' }}>{m}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* Skills */}
            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>04 — Skills Registry</p>
              <p style={{ fontSize: '0.75rem', color: C.dim, marginBottom: '1rem' }}>Emerald Tablets + DESIGN_LAWS always included.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {ALL_SKILLS.map(skill => {
                  const active = selectedSkills.includes(skill.id)
                  return (
                    <label key={skill.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer',
                      padding: '0.4375rem 0.625rem', borderRadius: '6px',
                      background: active ? 'rgba(255,255,255,0.025)' : 'transparent',
                      transition: 'background 120ms ease',
                    }}>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleSkill(skill.id)}
                        style={{ accentColor: C.gold, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.8125rem', color: active ? C.text : C.dim, flex: 1 }}>
                        {skill.label}
                      </span>
                      <span style={{ fontSize: '0.5625rem', color: skill.color, background: `${skill.color}15`, padding: '0.15rem 0.4rem', borderRadius: '3px', letterSpacing: '0.06em', flexShrink: 0 }}>
                        {skill.badge}
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>

            {error && (
              <p style={{ color: C.error, fontSize: '0.875rem', padding: '0.75rem 1rem', background: 'rgba(232,112,112,0.08)', borderRadius: '7px', border: `1px solid rgba(232,112,112,0.2)` }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSpawn}
              disabled={!role || !teamEmail || !mission}
              style={{
                padding: '0.875rem 2rem',
                borderRadius: '8px',
                background: (role && teamEmail && mission) ? C.gold : 'rgba(255,255,255,0.05)',
                color: (role && teamEmail && mission) ? '#0d0f0e' : C.dim,
                border: 'none',
                fontSize: '0.9375rem',
                fontWeight: 400,
                cursor: (role && teamEmail && mission) ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Spawn Agent Clone
            </button>
          </div>

          {/* Info panel */}
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem', position: 'sticky', top: '2rem' }}>
              <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>What you get</p>
              {[
                { icon: '📄', title: 'soul.md', desc: 'Emerald Tablets + your configuration. The agent\'s philosophical core.' },
                { icon: '🐳', title: 'docker-compose.yml', desc: 'Full stack: Next.js dashboard + FastAPI + nginx + certbot SSL.' },
                { icon: '🚀', title: 'deploy.sh', desc: 'One-command SSH deploy to any Hostinger VPS.' },
                { icon: '📖', title: 'SETUP.md', desc: 'Step-by-step setup guide with API examples.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: C.text, fontFamily: 'monospace', marginBottom: '0.2rem' }}>{item.title}</p>
                    <p style={{ fontSize: '0.75rem', color: C.dim, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
              <div style={{ height: '1px', background: C.border, margin: '1rem 0' }} />
              <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Endpoints (after deploy)</p>
              {['Dashboard /dashboard', 'FastAPI /api/docs', 'MCP /mcp/sse', 'Health /api/health'].map(e => (
                <p key={e} style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.375rem', fontFamily: 'monospace' }}>{e}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'spawning' && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: `2px solid rgba(201,169,110,0.2)`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1.5rem' }} />
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: C.text, marginBottom: '0.5rem' }}>Spawning agent…</p>
          <p style={{ color: C.dim, fontSize: '0.875rem' }}>Generating soul file · Building docker config · Writing deploy pipeline</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {step === 'done' && result && (
        <div>
          {/* Success header */}
          <div style={{ background: 'rgba(110,168,126,0.06)', border: '1px solid rgba(110,168,126,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success, boxShadow: `0 0 8px ${C.success}88` }} />
                <p style={{ fontSize: '0.875rem', color: C.success, fontWeight: 400 }}>Agent spawned successfully</p>
              </div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: C.text }}>{result.agentName}</p>
              <p style={{ fontSize: '0.75rem', color: C.dim, fontFamily: 'monospace', marginTop: '0.125rem' }}>ID: {result.agentId} · {new Date(result.spawnedAt).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={downloadAll} style={{ padding: '0.5625rem 1.125rem', borderRadius: '7px', background: C.gold, color: '#0d0f0e', border: 'none', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                ↓ Download All Files
              </button>
              <button onClick={() => { setStep('form'); setResult(null) }} style={{ padding: '0.5625rem 1rem', borderRadius: '7px', background: 'transparent', color: C.dim, border: `1px solid ${C.border}`, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Spawn Another
              </button>
            </div>
          </div>

          {/* Endpoints */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {Object.entries(result.endpoints).map(([key, url]) => (
              <div key={key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.875rem 1rem' }}>
                <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{key}</p>
                <p style={{ fontSize: '0.75rem', color: C.muted, fontFamily: 'monospace', wordBreak: 'break-all' }}>{url}</p>
              </div>
            ))}
          </div>

          {/* File viewer */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* File tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
              {Object.keys(result.files).map(fname => (
                <button
                  key={fname}
                  onClick={() => setActiveFile(fname)}
                  style={{
                    padding: '0.75rem 1.125rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeFile === fname ? C.gold : 'transparent'}`,
                    color: activeFile === fname ? C.text : C.dim,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px',
                    transition: 'all 120ms ease',
                  }}
                >
                  {fname}
                </button>
              ))}
            </div>

            {/* File content */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => copyFile(activeFile, result.files[activeFile])}
                style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  padding: '0.375rem 0.75rem', borderRadius: '5px',
                  background: copied[activeFile] ? 'rgba(110,168,126,0.15)' : 'rgba(255,255,255,0.05)',
                  color: copied[activeFile] ? C.success : C.dim,
                  border: `1px solid ${C.border}`, fontSize: '0.6875rem',
                  cursor: 'pointer', fontFamily: 'inherit', zIndex: 1,
                }}
              >
                {copied[activeFile] ? '✓ Copied' : 'Copy'}
              </button>
              <pre style={{
                margin: 0, padding: '1.25rem', overflowX: 'auto', overflowY: 'auto',
                maxHeight: '480px', fontSize: '0.6875rem', lineHeight: 1.75,
                color: C.muted, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                background: 'rgba(0,0,0,0.2)',
              }}>
                {result.files[activeFile]}
              </pre>
            </div>
          </div>

          {/* Deploy instructions */}
          <div style={{ marginTop: '1.5rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Next Steps</p>
            {[
              `1. Download all files (button above)`,
              `2. Set: ANTHROPIC_API_KEY + CYNTHIA_API_KEY + SSL_EMAIL in your environment`,
              `3. Run: chmod +x deploy.sh && ./deploy.sh`,
              `4. Send SETUP.md + CYNTHIA_API_KEY to ${result.agentId.toLowerCase()}@team`,
              `5. Agent dashboard live at: ${result.endpoints.dashboard}`,
            ].map((step, i) => (
              <p key={i} style={{ fontSize: '0.8125rem', color: C.muted, fontFamily: i >= 2 ? 'monospace' : 'inherit', marginBottom: '0.375rem' }}>{step}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
