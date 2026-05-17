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
  amber: '#d4956a',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
  borderRadius: '7px', padding: '0.625rem 0.875rem', color: C.text,
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

type ConnStatus = { status: string; model?: string; description?: string; latestVersion?: string; error?: string } | null

const EXAMPLE_PROMPTS = [
  'Cinematic aerial shot of an ancient city at sunrise, golden light on marble columns, slow dolly backward',
  'A lone figure walks through a neon-lit Tokyo street in rain, reflections shimmering on wet pavement',
  'Time-lapse of storm clouds building over a desert mesa, lightning in the distance, dust rising',
  'Underwater coral reef teeming with fish, shafts of light filtering through turquoise water',
]

export default function VideoPage() {
  const [connStatus, setConnStatus] = useState<ConnStatus>(null)
  const [testing, setTesting] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p')
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9')
  const [motionMode, setMotionMode] = useState<'normal' | 'fast'>('normal')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    setTesting(true)
    try {
      const r = await fetch('/api/video')
      const d = await r.json()
      setConnStatus(d)
    } catch (e) {
      setConnStatus({ status: 'error', error: String(e) })
    } finally {
      setTesting(false)
    }
  }

  async function generate() {
    if (!prompt.trim()) return
    setGenerating(true); setError(''); setResult(null); setPolling(false)

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt, duration, resolution, aspectRatio, motionMode,
          imageUrl: imageUrl.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Generation failed'); return }

      setResult(data)

      // If prediction is still processing, poll for completion
      if (data.status === 'processing' || data.status === 'starting') {
        setPolling(true)
        await pollPrediction(data.predictionId as string, data.urls?.get as string)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
      setPolling(false)
    }
  }

  async function pollPrediction(predictionId: string, pollUrl?: string) {
    const url = pollUrl || `https://api.replicate.com/v1/predictions/${predictionId}`
    const maxAttempts = 40 // 2 min max
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const r = await fetch(`/api/video/poll?id=${predictionId}`)
        if (!r.ok) continue
        const d = await r.json()
        setResult(d)
        if (d.status === 'succeeded' || d.status === 'failed' || d.status === 'canceled') {
          break
        }
      } catch { /* keep polling */ }
    }
  }

  const statusColor = !connStatus ? C.dim
    : connStatus.status === 'ok' ? C.success
    : connStatus.status === 'not_configured' ? C.amber
    : C.error

  const videoOutput = result?.outputUrl as string | undefined
    || (Array.isArray(result?.output) ? (result.output as string[])[0] : undefined)

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.625rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Studio OS · Video
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 300, color: C.text, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
          Seedance Video
        </h1>
        <p style={{ color: C.muted, fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '600px' }}>
          Cinematic video generation by ByteDance Seedance 1.0 — text-to-video and image-to-video.
          Physics-accurate motion, lip-sync, and photorealistic output.
        </p>
      </div>

      {/* Connection status bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px',
        padding: '0.875rem 1.25rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, boxShadow: connStatus?.status === 'ok' ? `0 0 8px ${C.success}66` : 'none', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.8125rem', color: C.text, marginBottom: '0.125rem' }}>
              ByteDance Seedance 1.0 — Replicate API
            </p>
            <p style={{ fontSize: '0.6875rem', color: C.dim, fontFamily: 'monospace' }}>
              bytedance/seedance-1-0
            </p>
          </div>
          {connStatus?.latestVersion && (
            <span style={{ fontSize: '0.625rem', color: C.dim, fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
              v{connStatus.latestVersion.slice(0, 8)}…
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {connStatus?.status === 'not_configured' && (
            <p style={{ fontSize: '0.75rem', color: C.amber }}>
              Set REPLICATE_API_TOKEN in .env.local
            </p>
          )}
          {connStatus?.status === 'ok' && (
            <p style={{ fontSize: '0.75rem', color: C.success }}>Connected</p>
          )}
          {connStatus?.status === 'error' && (
            <p style={{ fontSize: '0.75rem', color: C.error }}>Connection failed</p>
          )}
          <button
            onClick={testConnection} disabled={testing}
            style={{
              padding: '0.4375rem 0.875rem', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
              color: C.muted, fontSize: '0.75rem', fontFamily: 'inherit',
              opacity: testing ? 0.5 : 1,
            }}
          >
            {testing ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

        {/* Generation form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Prompt */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)' }} />
            <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Prompt</p>

            <textarea
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Cinematic aerial shot of an ancient city at sunrise, golden light on marble columns, slow dolly backward…"
              rows={4} style={{ ...inputStyle, resize: 'vertical' }}
            />

            {/* Example prompts */}
            <div style={{ marginTop: '0.875rem' }}>
              <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Examples</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => setPrompt(p)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '0.25rem 0', color: C.dim, fontSize: '0.75rem', fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.dim)}
                  >
                    → {p.length > 80 ? p.slice(0, 80) + '…' : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image URL (optional) */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Image-to-Video (optional)</p>
            <input
              value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://... (starting frame for image-to-video mode)"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.6875rem', color: C.dim, marginTop: '0.375rem' }}>
              Provide a URL to use Seedance in image-to-video mode. Leave blank for text-to-video.
            </p>
          </div>

          {/* Settings */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Generation Settings</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Duration</label>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {[3, 5].map(d => (
                    <button key={d} onClick={() => setDuration(d)} style={{
                      flex: 1, padding: '0.4375rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8125rem',
                      background: duration === d ? C.goldDim : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${duration === d ? 'rgba(201,169,110,0.25)' : C.border}`,
                      color: duration === d ? C.gold : C.muted,
                    }}>{d}s</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Resolution</label>
                <select value={resolution} onChange={e => setResolution(e.target.value as typeof resolution)} style={{ ...inputStyle, padding: '0.4375rem 0.875rem' }}>
                  {(['480p', '720p', '1080p'] as const).map(r => <option key={r} value={r} style={{ background: '#0d0f0e' }}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Aspect Ratio</label>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {(['16:9', '9:16', '1:1'] as const).map(a => (
                    <button key={a} onClick={() => setAspectRatio(a)} style={{
                      flex: 1, padding: '0.4375rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem',
                      background: aspectRatio === a ? C.goldDim : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${aspectRatio === a ? 'rgba(201,169,110,0.25)' : C.border}`,
                      color: aspectRatio === a ? C.gold : C.muted,
                    }}>{a}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Motion</label>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {(['normal', 'fast'] as const).map(m => (
                    <button key={m} onClick={() => setMotionMode(m)} style={{
                      flex: 1, padding: '0.4375rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', textTransform: 'capitalize',
                      background: motionMode === m ? C.goldDim : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${motionMode === m ? 'rgba(201,169,110,0.25)' : C.border}`,
                      color: motionMode === m ? C.gold : C.muted,
                    }}>{m}</button>
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
            disabled={!prompt.trim() || generating || connStatus?.status !== 'ok'}
            style={{
              padding: '0.875rem 2rem', borderRadius: '8px', border: 'none',
              cursor: (!prompt.trim() || generating || connStatus?.status !== 'ok') ? 'not-allowed' : 'pointer',
              background: (!prompt.trim() || generating || connStatus?.status !== 'ok') ? 'rgba(255,255,255,0.05)' : C.gold,
              color: (!prompt.trim() || generating || connStatus?.status !== 'ok') ? C.dim : '#0d0f0e',
              fontSize: '0.9375rem', fontFamily: 'inherit', letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            }}
          >
            {generating ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin2 0.8s linear infinite' }} />
                {polling ? 'Rendering…' : 'Queuing…'}
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                  <polygon points="3,1 14,7.5 3,14" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                </svg>
                Generate Video
              </>
            )}
          </button>
          <style>{`@keyframes spin2 { to { transform: rotate(360deg); }}`}</style>
        </div>

        {/* Output panel */}
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '2rem' }}>
            {result && (videoOutput || result.predictionId) ? (
              <>
                {videoOutput ? (
                  <video src={videoOutput} controls autoPlay loop muted playsInline style={{ width: '100%', display: 'block', aspectRatio: aspectRatio.replace(':', '/'), objectFit: 'cover', background: '#000' }} />
                ) : (
                  <div style={{ aspectRatio: aspectRatio.replace(':', '/'), background: '#080a09', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', border: `2px solid rgba(201,169,110,0.2)`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin2 0.8s linear infinite' }} />
                    <p style={{ fontSize: '0.75rem', color: C.dim }}>
                      {result.status === 'starting' ? 'Starting…' : result.status === 'processing' ? 'Rendering…' : String(result.status)}
                    </p>
                  </div>
                )}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Result</p>
                    <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '3px', background: result.status === 'succeeded' ? 'rgba(110,168,126,0.1)' : C.goldDim, color: result.status === 'succeeded' ? C.success : C.gold }}>
                      {String(result.status ?? 'queued')}
                    </span>
                  </div>
                  {result.predictionId != null && (
                    <p style={{ fontSize: '0.6875rem', color: C.dim, fontFamily: 'monospace', marginBottom: '0.375rem', wordBreak: 'break-all' }}>
                      ID: {String(result.predictionId)}
                    </p>
                  )}
                  {videoOutput && (
                    <a href={videoOutput} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: C.gold, textDecoration: 'none' }}>
                      ↓ Download video
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: '1.5rem 1.25rem' }}>
                <p style={{ fontSize: '0.6875rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Seedance 1.0</p>
                {[
                  { label: 'Model', value: 'bytedance/seedance-1-0' },
                  { label: 'Provider', value: 'Replicate API' },
                  { label: 'Modes', value: 'Text-to-video · Image-to-video' },
                  { label: 'Output', value: '480p / 720p / 1080p MP4' },
                  { label: 'Duration', value: '3s or 5s' },
                  { label: 'Features', value: 'Physics · Lip-sync · Cinematic' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: C.dim }}>{label}</span>
                    <span style={{ fontSize: '0.75rem', color: C.muted, textAlign: 'right', fontFamily: label === 'Model' || label === 'Provider' ? 'monospace' : 'inherit' }}>{value}</span>
                  </div>
                ))}

                {connStatus?.status === 'not_configured' && (
                  <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(212,149,106,0.08)', border: '1px solid rgba(212,149,106,0.2)', borderRadius: '7px' }}>
                    <p style={{ fontSize: '0.75rem', color: C.amber, marginBottom: '0.375rem' }}>API key required</p>
                    <p style={{ fontSize: '0.6875rem', color: C.dim, lineHeight: 1.5 }}>
                      Add REPLICATE_API_TOKEN to .env.local<br/>
                      Get key: replicate.com/account/api-tokens
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
