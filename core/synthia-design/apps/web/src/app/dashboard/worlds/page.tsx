'use client'

import { useState, useEffect } from 'react'

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
  bg: '#0d0f0e',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
  borderRadius: '7px', padding: '0.625rem 0.875rem', color: C.text,
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

type ConnectionStatus = { ok?: boolean; error?: string; model?: string; status?: number; detail?: unknown } | null

export default function WorldsPage() {
  const [status, setStatus] = useState<Record<string, ConnectionStatus>>({})
  const [provider, setProvider] = useState<'hy-worldplay' | 'lyra'>('hy-worldplay')
  const [prompt, setPrompt] = useState('')
  const [imageBase64, setImageBase64] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [trajectory, setTrajectory] = useState<'orbit' | 'dolly' | 'flythrough'>('orbit')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/worlds').then(r => r.json()).then(d => setStatus(d.providers ?? {}))
  }, [])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      setImageBase64(dataUrl.split(',')[1] ?? '')
    }
    reader.readAsDataURL(file)
  }

  async function generate() {
    if (!prompt.trim()) return
    setGenerating(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, prompt, imageBase64: imageBase64 || undefined, trajectory }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Generation failed'); return }
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  const hyStatus = status['hy-worldplay']
  const lyraStatus = status['lyra']

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Studio OS · 3D Worlds
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
          3D World Generation
        </h1>
        <p style={{ color: C.muted, fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '600px' }}>
          Generate explorable 3D worlds from a single image + prompt.
          Powered by Tencent HY-WorldPlay and the NVIDIA Lyra pipeline.
        </p>
      </div>

      {/* Provider status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
        {[
          {
            key: 'hy-worldplay',
            name: 'HY-WorldPlay',
            org: 'Tencent',
            model: 'tencent/HY-WorldPlay',
            desc: 'Image-to-3D world generation. 3D-consistent scene synthesis.',
            badge: 'HuggingFace Inference',
            s: hyStatus,
          },
          {
            key: 'lyra',
            name: 'NVIDIA Lyra',
            org: 'NVIDIA',
            model: 'nv-tlabs/lyra',
            desc: 'Local pipeline: video diffusion → 3DGS → browser delivery.',
            badge: 'Local Pipeline',
            s: lyraStatus,
          },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setProvider(p.key as typeof provider)}
            style={{
              background: provider === p.key ? C.goldDim : C.surface,
              border: `1px solid ${provider === p.key ? 'rgba(201,169,110,0.3)' : C.border}`,
              borderRadius: '12px', padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: C.text, marginBottom: '0.125rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.6875rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.org}</p>
              </div>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', marginTop: '3px', flexShrink: 0,
                background: p.s == null ? C.dim : p.s.ok ? C.success : C.error,
                boxShadow: p.s?.ok ? `0 0 8px ${C.success}66` : 'none',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: C.muted, lineHeight: 1.5, marginBottom: '0.75rem' }}>{p.desc}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.625rem', color: C.gold, background: C.goldDim, padding: '0.2rem 0.5rem', borderRadius: '3px', letterSpacing: '0.08em' }}>{p.badge}</span>
              <span style={{ fontSize: '0.625rem', color: C.dim, fontFamily: 'monospace', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>{p.model}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Generation form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />
            <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>World Seed</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  Prompt <span style={{ color: C.gold }}>*</span>
                </label>
                <textarea
                  value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="A coastal village at golden hour, ancient stone buildings draped in vines, cinematic depth…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  Seed Image (optional)
                </label>
                <div
                  onClick={() => document.getElementById('img-upload')?.click()}
                  style={{
                    border: `1px dashed ${imagePreview ? 'rgba(201,169,110,0.3)' : C.border}`,
                    borderRadius: '8px', padding: '1.25rem', cursor: 'pointer', textAlign: 'center',
                    background: imagePreview ? 'rgba(201,169,110,0.04)' : 'rgba(255,255,255,0.01)',
                    transition: 'all 150ms ease',
                    position: 'relative', overflow: 'hidden', minHeight: '100px',
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="seed" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '5px', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.5rem', display: 'block', color: C.dim }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p style={{ fontSize: '0.75rem', color: C.dim }}>Click to upload a seed image</p>
                      <p style={{ fontSize: '0.625rem', color: C.dim, marginTop: '0.25rem' }}>PNG / JPG · 1024×576 recommended</p>
                    </>
                  )}
                </div>
                <input id="img-upload" type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} style={{ display: 'none' }} />
                {imagePreview && (
                  <button onClick={() => { setImagePreview(''); setImageBase64('') }} style={{ fontSize: '0.6875rem', color: C.dim, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.375rem', padding: 0 }}>
                    Remove image
                  </button>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  Camera Trajectory
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['orbit', 'dolly', 'flythrough'] as const).map(t => (
                    <button key={t} onClick={() => setTrajectory(t)} style={{
                      flex: 1, padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.75rem', textTransform: 'capitalize',
                      background: trajectory === t ? C.goldDim : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${trajectory === t ? 'rgba(201,169,110,0.25)' : C.border}`,
                      color: trajectory === t ? C.gold : C.muted,
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p style={{ color: C.error, fontSize: '0.875rem', padding: '0.75rem 1rem', background: 'rgba(232,112,112,0.08)', borderRadius: '7px', border: '1px solid rgba(232,112,112,0.2)' }}>
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={!prompt.trim() || generating}
            style={{
              padding: '0.875rem 2rem', borderRadius: '8px', border: 'none', cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
              background: (!prompt.trim() || generating) ? 'rgba(255,255,255,0.05)' : C.gold,
              color: (!prompt.trim() || generating) ? C.dim : '#0d0f0e',
              fontSize: '0.9375rem', fontFamily: 'inherit', letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            }}
          >
            {generating ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating world…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                  <path d="M7.5 1.5 L13.5 7.5 L7.5 13.5 M1.5 7.5 L13.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Generate 3D World
              </>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>

        {/* Side info / result */}
        <div>
          {result ? (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.success, boxShadow: `0 0 8px ${C.success}66` }} />
                <span style={{ fontSize: '0.8125rem', color: C.success }}>World generated</span>
              </div>

              {result.outputDataUrl != null && (
                <video
                  src={result.outputDataUrl as string} autoPlay loop muted playsInline controls
                  style={{ width: '100%', display: 'block', maxHeight: '260px', objectFit: 'cover' }}
                />
              )}

              <div style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Output</p>
                <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.375rem' }}>
                  <span style={{ color: C.dim }}>Provider:</span> {result.provider as string}
                </p>
                <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.375rem' }}>
                  <span style={{ color: C.dim }}>Model:</span> {result.model as string}
                </p>
                {result.contentType != null && (
                  <p style={{ fontSize: '0.75rem', color: C.muted }}>
                    <span style={{ color: C.dim }}>Format:</span> {result.contentType as string}
                  </p>
                )}
                {result.note != null && (
                  <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.75rem', lineHeight: 1.5 }}>{result.note as string}</p>
                )}
                {result.outputDataUrl != null && (
                  <a
                    href={result.outputDataUrl as string}
                    download={`world-${Date.now()}.mp4`}
                    style={{ display: 'inline-block', marginTop: '0.875rem', fontSize: '0.75rem', color: C.gold, textDecoration: 'none' }}
                  >
                    ↓ Download output
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem', position: 'sticky', top: '2rem' }}>
              <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Pipeline</p>

              {[
                { n: '01', label: 'Scene Seed', desc: 'Image + text prompt + camera trajectory' },
                { n: '02', label: 'World Generation', desc: 'HY-WorldPlay or Lyra: multi-view synthesis' },
                { n: '03', label: '3D Reconstruction', desc: 'Depth estimation → Gaussian Splatting' },
                { n: '04', label: 'Web Delivery', desc: 'PLY/KSPLAT → Three.js gsplat viewer' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: '0.5625rem', color: C.gold, fontFamily: 'monospace', marginTop: '1px', flexShrink: 0 }}>{s.n}</span>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: C.text, marginBottom: '0.125rem' }}>{s.label}</p>
                    <p style={{ fontSize: '0.6875rem', color: C.dim, lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}

              <div style={{ height: '1px', background: C.border, margin: '1rem 0' }} />
              <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Trajectory modes</p>
              {[
                { t: 'Orbit', d: '360° sweep around scene center' },
                { t: 'Dolly', d: 'Cinematic push-in (Hitchcock zoom)' },
                { t: 'Flythrough', d: 'Spline-based first-person path' },
              ].map(t => (
                <p key={t.t} style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.375rem' }}>
                  <span style={{ color: C.text }}>{t.t}</span> — {t.d}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
