'use client'

import { useState, useRef, useEffect } from 'react'

export default function LipSyncPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const audioCtx = new AudioContext()
    fetch(audioUrl)
      .then(r => r.arrayBuffer())
      .then(buf => audioCtx.decodeAudioData(buf))
      .then(decoded => {
        const data = decoded.getChannelData(0)
        const width = canvasRef.current!.width
        const height = canvasRef.current!.height
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#2a3a2a'
        const step = Math.ceil(data.length / width)
        for (let i = 0; i < width; i++) {
          const sample = Math.abs(data[i * step] || 0)
          const barHeight = sample * height
          ctx.fillRect(i, (height - barHeight) / 2, 1, barHeight)
        }
      })
      .catch(() => { /* ignore */ })
  }, [audioUrl])

  async function handleSync() {
    if (!videoUrl || !audioUrl) return
    setGenerating(true)
    setError('')
    const key = JSON.parse(localStorage.getItem('synthia_provider_keys') || '{}').muapi || ''
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'lipsync', params: { video_url: videoUrl, audio_url: audioUrl }, muapiKey: key }),
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

  const dropZoneStyle: React.CSSProperties = {
    border: '1px dashed var(--color-accent)',
    borderRadius: '10px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    background: 'var(--color-surface)',
    flex: 1,
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '2rem' }}>Lip Sync Studio</h2>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div onClick={() => videoRef.current?.click()} style={dropZoneStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{videoUrl ? '✓ Video cargado' : 'Arrastra tu video'}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>MP4</div>
          <input ref={videoRef} type="file" accept="video/mp4,video/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]
            if (f) setVideoUrl(URL.createObjectURL(f))
          }} />
          {videoUrl && <video src={videoUrl} style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '6px' }} muted />}
        </div>

        <div onClick={() => audioRef.current?.click()} style={dropZoneStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎙</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{audioUrl ? '✓ Audio cargado' : 'Arrastra tu audio'}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>MP3 / WAV</div>
          <input ref={audioRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]
            if (f) setAudioUrl(URL.createObjectURL(f))
          }} />
        </div>
      </div>

      {audioUrl && (
        <canvas ref={canvasRef} width={600} height={60} style={{ width: '100%', height: '60px', background: 'var(--color-dark)', borderRadius: '6px', marginBottom: '1rem' }} />
      )}

      {error && <p style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}

      <button
        onClick={handleSync}
        disabled={!videoUrl || !audioUrl || generating}
        style={{ width: '100%', padding: '0.875rem', background: videoUrl && audioUrl && !generating ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}
      >
        {generating ? 'Sincronizando...' : 'Sincronizar labios'}
      </button>

      {resultUrl && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Resultado</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>ORIGINAL</div>
              <video src={videoUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>SINCRONIZADO</div>
              <video src={resultUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
              <a href={resultUrl} download style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', textAlign: 'center', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700 }}>↓ Descargar sincronizado</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
