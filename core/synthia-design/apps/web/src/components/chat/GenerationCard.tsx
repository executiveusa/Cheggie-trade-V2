'use client'

import { useState } from 'react'

interface GenerationCardProps {
  resultUrl: string
  tool: string
  prompt?: string
}

const STUDIO_COLORS: Record<string, string> = {
  image: '#c4963c',
  video: '#5a7a52',
  cinema: '#8b6914',
  marketing: '#3a6a8a',
  lipsync: '#7a4a8a',
  workflow: '#4a6a3a',
}

export default function GenerationCard({ resultUrl, tool, prompt }: GenerationCardProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const isVideo = resultUrl.match(/\.(mp4|webm|mov)/i)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `synthia-${tool}-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`
    a.click()
  }

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '520px',
    }}>
      {/* Studio badge */}
      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: STUDIO_COLORS[tool] || 'var(--color-primary)',
          background: `${STUDIO_COLORS[tool] || 'var(--color-primary)'}18`,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
        }}>
          {tool}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)' }}>Synthia™</span>
      </div>

      {/* Output */}
      <div style={{ position: 'relative', background: '#000', lineHeight: 0 }}>
        {isVideo ? (
          <video
            src={resultUrl}
            controls
            preload="metadata"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resultUrl}
            alt={prompt || 'Generated content'}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block', borderRadius: 0 }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {prompt && (
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textAlign: 'left', fontFamily: 'var(--font-body)' }}
          >
            {showPrompt ? '▼' : '▶'} {showPrompt ? 'Ocultar prompt' : 'Ver prompt'}
          </button>
        )}
        {showPrompt && prompt && (
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--color-muted)',
            background: 'var(--color-dark)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {prompt}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
            }}
          >
            ↓ Descargar
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.75rem',
              background: 'var(--color-primary)',
              color: 'var(--color-dark)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
            }}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  )
}
