'use client'

import { useState } from 'react'

const CAMERAS = ['Full-Frame Cine Digital', 'Studio Digital S35', 'Grand Format 70mm Film', 'Modular 8K Digital', 'Classic 16mm Film', 'Premium Large Format Digital']
const LENSES = ['Compact Anamorphic', 'Classic Anamorphic', 'Warm Cinema Prime', 'Premium Modern Prime', 'Halation Diffusion', 'Creative Tilt Lens', 'Extreme Macro', '70s Cinema Prime']
const APERTURES = [
  { value: 'f/1.4', label: 'f/1.4', desc: 'Bokeh cremoso' },
  { value: 'f/4', label: 'f/4', desc: 'Equilibrado' },
  { value: 'f/11', label: 'f/11', desc: 'Foco profundo' },
]
const PRESETS = [
  { label: 'Hora Dorada LATAM', prompt: 'Golden hour light over a tropical Latin American city, warm orange sky, colonial architecture, palm trees swaying' },
  { label: 'Noir Urbano', prompt: 'Urban noir scene at night, rain-slicked streets, neon reflections, lone figure in shadows, moody atmosphere' },
  { label: 'Retrato Luz Natural', prompt: 'Natural window light portrait, diffused soft illumination, warm tones, intimate emotional moment' },
  { label: 'Movimiento Abstracto', prompt: 'Abstract motion blur, vibrant color streaks, kinetic energy, long exposure, artistic movement' },
]

export default function CinemaStudioPage() {
  const [prompt, setPrompt] = useState('')
  const [camera, setCamera] = useState(CAMERAS[0])
  const [lens, setLens] = useState(LENSES[0])
  const [focal, setFocal] = useState(35)
  const [aperture, setAperture] = useState('f/1.4')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')
  const [visualReasoning, setVisualReasoning] = useState(false)

  const assembledPrompt = [prompt, `shot on ${camera}`, `with ${lens}`, `${focal}mm`, aperture, 'cinematic, professional color grade, 4K'].filter(Boolean).join(', ')

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
        body: JSON.stringify({ tool: 'cinema', params: { prompt, camera, lens, focal, aperture }, muapiKey: key }),
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

  return (
    <div style={{ maxWidth: '960px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Cinema Studio</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem' }}>El estudio que enseña cinematografía mientras crea</p>

      {/* Section 1: Scene */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>La Escena</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setPrompt(p.prompt)} style={{ padding: '0.875rem', background: 'var(--color-surface)', border: `1px solid ${prompt === p.prompt ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '8px', textAlign: 'left', cursor: 'pointer', color: prompt === p.prompt ? 'var(--color-primary)' : 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={4}
          placeholder="Describe la escena cinematográfica..."
          style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', outline: 'none', resize: 'vertical' }}
        />
      </section>

      {/* Section 2: Camera */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Configuración de Cámara</h3>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cuerpo de Cámara</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {CAMERAS.map(c => (
              <button key={c} onClick={() => setCamera(c)} style={{ padding: '0.625rem', background: camera === c ? 'rgba(196,150,60,0.15)' : 'var(--color-surface)', border: `1px solid ${camera === c ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '8px', fontSize: '0.75rem', color: camera === c ? 'var(--color-primary)' : 'var(--color-muted)', cursor: 'pointer', textAlign: 'left' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lente</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {LENSES.map(l => (
              <button key={l} onClick={() => setLens(l)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: lens === l ? 'var(--color-primary)' : 'var(--color-surface)', color: lens === l ? 'var(--color-dark)' : 'var(--color-muted)', border: `1px solid ${lens === l ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Distancia focal: <span style={{ color: 'var(--color-primary)' }}>{focal}mm</span></label>
          <input type="range" min={8} max={85} value={focal} onChange={e => setFocal(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
            {[8, 14, 24, 35, 50, 85].map(v => <span key={v}>{v}</span>)}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Apertura</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {APERTURES.map(a => (
              <button key={a.value} onClick={() => setAperture(a.value)} style={{ flex: 1, padding: '0.75rem', background: aperture === a.value ? 'rgba(196,150,60,0.15)' : 'var(--color-surface)', border: `1px solid ${aperture === a.value ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: aperture === a.value ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: '0.25rem' }}>{a.label}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Preview */}
      <section>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Vista Previa del Prompt</h3>

        <div style={{ position: 'relative', background: 'var(--color-dark)', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
          {assembledPrompt || 'El prompt aparecerá aquí...'}
          <button
            onClick={() => navigator.clipboard.writeText(assembledPrompt)}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.6875rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', background: 'var(--color-surface)', borderRadius: '4px' }}
          >
            Copiar
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            <input type="checkbox" checked={visualReasoning} onChange={e => setVisualReasoning(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
            Modo razonamiento visual
          </label>
          <span title="Synthia genera, inspecciona y critica su propio trabajo hasta alcanzar un puntaje de calidad de 7.5/10" style={{ cursor: 'help', fontSize: '0.75rem', color: 'var(--color-muted)' }}>ℹ</span>
        </div>

        {error && <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          style={{ width: '100%', padding: '0.875rem', background: prompt.trim() && !generating ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}
        >
          {generating ? 'Capturando escena...' : 'Capturar escena'}
        </button>

        {resultUrl && (
          <div style={{ marginTop: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Cinema result" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }} />
            <div style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem' }}>
              <a href={resultUrl} download style={{ flex: 1, padding: '0.5rem', textAlign: 'center', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>↓ Descargar</a>
              <button style={{ flex: 1, padding: '0.5rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700 }}>Publicar</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
