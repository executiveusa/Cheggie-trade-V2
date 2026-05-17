'use client'

interface GenerationHistoryItem {
  url: string
  tool: string
  timestamp: number
}

interface ContextPanelProps {
  isGenerating: boolean
  history: GenerationHistoryItem[]
}

export default function ContextPanel({ isGenerating, history }: ContextPanelProps) {
  return (
    <aside style={{
      width: '320px',
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Contexto</span>
      </div>

      {isGenerating && (
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>Synthia está trabajando...</span>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ padding: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Generaciones recientes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {history.slice(0, 8).map((item, i) => (
              <div key={i} style={{ aspectRatio: '1', background: 'var(--color-dark)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                {item.url.match(/\.(mp4|webm)/i) ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5rem',
                  color: 'var(--color-primary)',
                  background: 'rgba(10,17,8,0.8)',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  letterSpacing: '0.06em',
                }}>
                  {item.tool}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isGenerating && history.length === 0 && (
        <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✨</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
            Tus generaciones aparecerán aquí
          </p>
        </div>
      )}
    </aside>
  )
}
