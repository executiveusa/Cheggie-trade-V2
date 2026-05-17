'use client'

import { useState, useRef } from 'react'

const BG_STYLES = ['Studio', 'Lifestyle', 'Minimalist', 'Nature', 'Urban', 'Abstract']
const LIGHTING = ['Studio', 'Natural', 'Dramatic', 'Soft']
const VOICES = [
  { id: 'mx', label: 'México' },
  { id: 'co', label: 'Colombia' },
  { id: 'ar', label: 'Argentina' },
  { id: 'es', label: 'España' },
  { id: 'pr', label: 'Puerto Rico' },
]
const AUDIENCES = ['emprendedoras', 'creadores', 'coaches', 'ecommerce']
const TONES = ['auténtico', 'profesional', 'divertido', 'emocional']

export default function MarketingStudioPage() {
  const [tab, setTab] = useState('product')
  const [productUrl, setProductUrl] = useState('')
  const [bgStyle, setBgStyle] = useState('Studio')
  const [lighting, setLighting] = useState('Studio')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')

  // Avatar tab
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState('mx')

  // UGC Script tab
  const [product, setProduct] = useState('')
  const [painPoint, setPainPoint] = useState('')
  const [audience, setAudience] = useState('emprendedoras')
  const [tone, setTone] = useState('auténtico')
  const [language, setLanguage] = useState<'ES' | 'EN'>('ES')
  const [ugcScript, setUgcScript] = useState('')
  const [ugcGenerating, setUgcGenerating] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  async function handleProductGenerate() {
    if (!productUrl) return
    setGenerating(true)
    setError('')
    const key = JSON.parse(localStorage.getItem('synthia_provider_keys') || '{}').muapi || ''
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'marketing', params: { product_image_url: productUrl, style: bgStyle.toLowerCase(), prompt: `${bgStyle} background, ${lighting} lighting, professional product photography` }, muapiKey: key }),
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

  async function handleUGCScript() {
    if (!product.trim()) return
    setUgcGenerating(true)
    setUgcScript('')
    try {
      const res = await fetch('/api/ugc-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, pain_point: painPoint, audience, tone, language: language.toLowerCase() }),
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setUgcScript(text)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setUgcGenerating(false)
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    color: active ? 'var(--color-primary)' : 'var(--color-muted)',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  })

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem',
    background: active ? 'var(--color-primary)' : 'var(--color-surface)',
    color: active ? 'var(--color-dark)' : 'var(--color-muted)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer',
  })

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1.5rem' }}>Marketing Studio</h2>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <button onClick={() => setTab('product')} style={tabStyle(tab === 'product')}>Foto de Producto</button>
        <button onClick={() => setTab('avatar')} style={tabStyle(tab === 'avatar')}>Avatar con Voz</button>
        <button onClick={() => setTab('ugc')} style={tabStyle(tab === 'ugc')}>Script UGC</button>
      </div>

      {tab === 'product' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Imagen del producto *</label>
            <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-muted)', background: productUrl ? 'var(--color-surface)' : 'transparent', position: 'relative', overflow: 'hidden' }}>
              {productUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={productUrl} alt="Product" style={{ maxHeight: '130px', objectFit: 'contain' }} />
              ) : 'Arrastra tu imagen de producto aquí'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files?.[0]
              if (f) setProductUrl(URL.createObjectURL(f))
            }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fondo</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {BG_STYLES.map(s => <button key={s} onClick={() => setBgStyle(s)} style={pillStyle(bgStyle === s)}>{s}</button>)}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Iluminación</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {LIGHTING.map(l => <button key={l} onClick={() => setLighting(l)} style={pillStyle(lighting === l)}>{l}</button>)}
            </div>
          </div>

          {error && <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem' }}>{error}</p>}
          <button onClick={handleProductGenerate} disabled={!productUrl || generating} style={{ padding: '0.875rem', background: productUrl && !generating ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>
            {generating ? 'Generando...' : 'Generar foto de producto'}
          </button>

          {resultUrl && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Product result" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
            </div>
          )}
        </div>
      )}

      {tab === 'avatar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(196,150,60,0.08)', border: '1px solid rgba(196,150,60,0.2)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
            Agrega tu llave ElevenLabs en Configuración para activar voces con acento latino.
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Script</label>
            <textarea value={script} onChange={e => setScript(e.target.value)} rows={4} placeholder="Escribe el guión aquí..." style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', outline: 'none', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Voz</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {VOICES.map(v => <button key={v.id} onClick={() => setVoice(v.id)} style={pillStyle(voice === v.id)}>{v.label}</button>)}
            </div>
          </div>
          <button disabled style={{ padding: '0.875rem', background: 'var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)' }}>Generar avatar con voz (requiere ElevenLabs)</button>
        </div>
      )}

      {tab === 'ugc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Producto / Servicio</label>
            <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Nombre de tu producto..." style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Punto de dolor principal</label>
            <input value={painPoint} onChange={e => setPainPoint(e.target.value)} placeholder="En una frase..." style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Audiencia</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {AUDIENCES.map(a => <button key={a} onClick={() => setAudience(a)} style={pillStyle(audience === a)}>{a}</button>)}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tono</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {TONES.map(t => <button key={t} onClick={() => setTone(t)} style={pillStyle(tone === t)}>{t}</button>)}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Idioma</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['ES', 'EN'] as const).map(l => <button key={l} onClick={() => setLanguage(l)} style={pillStyle(language === l)}>{l}</button>)}
              </div>
            </div>
          </div>
          <button onClick={handleUGCScript} disabled={!product.trim() || ugcGenerating} style={{ padding: '0.875rem', background: product.trim() && !ugcGenerating ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>
            {ugcGenerating ? 'Escribiendo script...' : 'Generar Script UGC'}
          </button>
          {ugcScript && (
            <div style={{ position: 'relative' }}>
              <textarea value={ugcScript} readOnly rows={12} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical' }} />
              <button onClick={() => navigator.clipboard.writeText(ugcScript)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.6875rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', padding: '0.25rem 0.5rem', background: 'var(--color-dark)', borderRadius: '4px' }}>Copiar</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
