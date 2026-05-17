'use client'

import { useState } from 'react'

const MODES = [
  { id: 'text', label: 'Texto a Video', models: ['kling-v1.6', 'wan-t2v', 'hunyuan-video', 'cogvideox', 'luma-dream-machine'] },
  { id: 'image', label: 'Imagen a Video', models: ['kling-image', 'wan-i2v', 'stable-video-diffusion'] },
  { id: 'video', label: 'Video a Video', models: [] },
]
const DURATIONS = [5, 10, 15]
const ASPECTS = ['16:9', '9:16', '1:1']

export default function VideoStudioPage() {
  const [mode, setMode] = useState('text')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(MODES[0].models[0])
  const [duration, setDuration] = useState(5)
  const [aspect, setAspect] = useState('16:9')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')

  const activeMode = MODES.find(m => m.id === mode)!

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError('')
    setResultUrl('')
    const key = JSON.parse(localStorage.getItem('synthia_provider_keys') || '{}').muapi || ''
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'video', params: { model, prompt, duration, aspect_ratio: aspect }, muapiKey: key }),
      })
      const data = await res.json() as { result_url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Error')
      setResultUrl(data.result_url || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setGenerating(false)
    }
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    background: active ? 'var(--color-primary)' : 'var(--color-surface)',
    color: active ? 'var(--color-dark)' : 'var(--color-muted)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    cursor: 'pointer',
  })

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1.5rem' }}>Video</h2>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setModel(m.models[0] || '') }} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: mode === m.id ? 'var(--color-primary)' : 'var(--color-muted)', borderBottom: mode === m.id ? '2px solid var(--color-primary)' : '2px solid transparent', fontFamily: 'var(--font-body)' }}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'video' ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)', background: 'var(--color-surface)', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>Próximamente</span>
          <p style={{ marginTop: '1rem', color: 'var(--color-muted)', fontSize: '0.875rem' }}>Video a Video estará disponible pronto</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe tu video..."
              style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Modelo</label>
            <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }}>
              {activeMode.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Duración</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {DURATIONS.map(d => <button key={d} onClick={() => setDuration(d)} style={pillStyle(duration === d)}>{d}s</button>)}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Proporción</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {ASPECTS.map(a => <button key={a} onClick={() => setAspect(a)} style={pillStyle(aspect === a)}>{a}</button>)}
              </div>
            </div>
          </div>

          {error && <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem' }}>{error}</p>}

          <button onClick={handleGenerate} disabled={!prompt.trim() || generating} style={{ padding: '0.875rem', background: prompt.trim() && !generating ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            {generating ? 'Generando...' : 'Crear video'}
          </button>

          {resultUrl && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <video src={resultUrl} controls preload="metadata" loop style={{ width: '100%', maxHeight: '400px', display: 'block' }} />
              <div style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                <a href={resultUrl} download style={{ flex: 1, padding: '0.5rem', textAlign: 'center', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>↓ Descargar MP4</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
