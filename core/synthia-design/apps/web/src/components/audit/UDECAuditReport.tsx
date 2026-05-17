'use client'

interface AuditResult {
  url: string
  scores: Record<string, number>
  overall: number
  top_issues: string[]
  quick_wins: string[]
  screenshot_used?: boolean
}

export default function UDECAuditReport({ result }: { result: AuditResult }) {
  const axes = Object.entries(result.scores)
  const overallColor = result.overall >= 8.5 ? '#5a7a52' : result.overall >= 7 ? '#c4963c' : '#e87070'

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const filled = (result.overall / 10) * circumference

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={overallColor} strokeWidth="6"
            strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
          <text x="50" y="45" textAnchor="middle" fill={overallColor} fontSize="16" fontFamily="var(--font-display)" fontWeight="bold">{result.overall.toFixed(1)}</text>
          <text x="50" y="62" textAnchor="middle" fill="var(--color-muted)" fontSize="9" fontFamily="var(--font-mono)">/10 UDEC</text>
        </svg>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--color-text)' }}>Reporte UDEC</div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.08em',
              padding: '0.125rem 0.5rem', borderRadius: '999px',
              background: result.screenshot_used ? 'rgba(90,122,82,0.12)' : 'rgba(196,150,60,0.12)',
              color: result.screenshot_used ? '#5a7a52' : '#c4963c',
              border: `1px solid ${result.screenshot_used ? 'rgba(90,122,82,0.3)' : 'rgba(196,150,60,0.3)'}`,
            }}>
              {result.screenshot_used ? '● Análisis visual' : '◌ Análisis de texto'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{result.url}</div>
        </div>
      </div>

      {/* 14 axes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>14 Ejes de Diseño</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {axes.map(([axis, score]) => {
            const color = score >= 9 ? '#c4963c' : score >= 7 ? '#5a7a52' : score >= 5 ? '#c4963c' : '#e87070'
            return (
              <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '120px', fontSize: '0.75rem', color: 'var(--color-muted)', flexShrink: 0, textAlign: 'right' }}>{axis}</div>
                <div style={{ flex: 1, height: '6px', background: 'var(--color-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, width: '28px', textAlign: 'right', flexShrink: 0 }}>{score.toFixed(1)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Issues and wins */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#e87070', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Problemas principales</div>
          {result.top_issues.map((issue, i) => (
            <div key={i} style={{ padding: '0.625rem', background: 'rgba(232,112,112,0.06)', border: '1px solid rgba(232,112,112,0.15)', borderRadius: '6px', marginBottom: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
              {issue}
              <button style={{ display: 'block', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>Corregir con Synthia™ →</button>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#5a7a52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Ganancias rápidas</div>
          {result.quick_wins.map((win, i) => (
            <div key={i} style={{ padding: '0.625rem', background: 'rgba(90,122,82,0.06)', border: '1px solid rgba(90,122,82,0.15)', borderRadius: '6px', marginBottom: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
              {win}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigator.share?.({ title: `UDEC Audit ${result.overall}/10`, url: window.location.href })}
        style={{ width: '100%', marginTop: '1.25rem', padding: '0.625rem', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
      >
        Compartir reporte
      </button>
    </div>
  )
}
