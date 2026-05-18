'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Synthia] Unhandled error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-dark)',
      padding: '2rem',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'var(--color-surface)',
        border: '1px solid rgba(232,112,112,0.25)',
        borderRadius: '16px',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: '#e87070', marginBottom: '0.75rem' }}>
          Algo salió mal
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-muted)',
          background: 'var(--color-dark)',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          wordBreak: 'break-all',
          textAlign: 'left',
          lineHeight: 1.5,
        }}>
          {error.message || 'Error desconocido'}
          {error.digest && <div style={{ marginTop: '0.375rem', opacity: 0.6 }}>digest: {error.digest}</div>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.625rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'var(--color-dark)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            style={{
              padding: '0.625rem 1.5rem',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
