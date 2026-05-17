'use client'

import { useState, useRef } from 'react'

const MODELS = ['flux-dev', 'flux-pro', 'sdxl-lightning', 'ideogram-v3', 'kandinsky-3', 'stable-cascade']
const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4']

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showNegative, setShowNegative] = useState(false)
  const [model, setModel] = useState(MODELS[0])
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [seed, setSeed] = useState<number | ''>('')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState('')

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
        body: JSON.stringify({
          tool: 'image',
          params: { model, prompt, aspect_ratio: aspectRatio, ...(imageUrl ? { image_url: imageUrl } : {}), ...(seed !== '' ? { seed } : {}) },
          muapiKey: key,
        }),
      })
      const data = await res.json() as { result_url?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Error')
      setResultUrl(data.result_url || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    outline: 'none',
    resize: 'vertical',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)' }}>Imagen</h2>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe tu imagen..."
            style={{ ...inputStyle, minHeight: '80px' }}
          />
        </div>

        <button onClick={() => setShowNegative(!showNegative)} style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
          {showNegative ? '▼' : '▶'} Prompt negativo
        </button>
        {showNegative && (
          <textarea
            value={negativePrompt}
            onChange={e => setNegativePrompt(e.target.value)}
            rows={2}
            placeholder="Lo que NO quieres..."
            style={inputStyle}
          />
        )}

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Modelo</label>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Proporción</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ASPECT_RATIOS.map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  background: aspectRatio === ar ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: aspectRatio === ar ? 'var(--color-dark)' : 'var(--color-muted)',
                  border: `1px solid ${aspectRatio === ar ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Seed</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={seed}
              onChange={e => setSeed(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Aleatorio"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={() => setSeed(Math.floor(Math.random() * 1000000))} style={{ padding: '0.5rem 0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', color: 'var(--color-muted)' }}>🎲</button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Imagen a imagen</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-muted)', background: imageUrl ? 'var(--color-surface)' : 'transparent' }}
          >
            {imageUrl ? '✓ Imagen cargada' : 'Arrastra una imagen o haz clic'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]
            if (f) setImageUrl(URL.createObjectURL(f))
          }} />
        </div>

        {error && <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem' }}>{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: prompt.trim() && !generating ? 'var(--color-primary)' : 'var(--color-border)',
            color: 'var(--color-dark)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
          }}
        >
          {generating ? 'Creando...' : 'Crear imagen'}
        </button>
      </div>

      {/* Output */}
      <div style={{ minHeight: '400px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {generating ? (
          <div style={{ textAlign: 'center' }}>
            <div className="shimmer" style={{ width: '100%', height: '400px', position: 'absolute', inset: 0 }} />
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)', position: 'relative', zIndex: 1 }}>Synthia está creando tu imagen...</p>
          </div>
        ) : resultUrl ? (
          <div style={{ width: '100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Generated" style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block' }} />
            <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
              <a href={resultUrl} download style={{ flex: 1, padding: '0.625rem', textAlign: 'center', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.875rem' }}>↓ Descargar</a>
              <button style={{ flex: 1, padding: '0.625rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700 }}>Publicar</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '2rem', opacity: 0.4 }}>
            {['🎨', '🖼', '✨', '🎭'].map((icon, i) => (
              <div key={i} style={{ background: 'var(--color-dark)', borderRadius: '8px', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{icon}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
