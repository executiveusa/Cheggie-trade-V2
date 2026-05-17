'use client'

import type { VisualReasoningStep } from '@/lib/visual-reasoning'

interface ReasoningTimelineProps {
  steps: VisualReasoningStep[]
  isStreaming: boolean
}

const SEVERITY_COLORS = { low: '#c4963c', medium: '#d4956a', high: '#e87070' }
const TYPE_LABELS: Record<string, string> = {
  generate: 'Generando',
  inspect: 'Inspeccionando',
  critique: 'Analizando calidad',
  revise: 'Revisando prompt',
  accept: 'Aceptado',
}

function QualityGauge({ score }: { score: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filled = (score / 10) * circumference
  const color = score >= 7.5 ? '#5a7a52' : score >= 5 ? '#c4963c' : '#e87070'

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <circle cx="26" cy="26" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={radius} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="26" y="30" textAnchor="middle" fill={color} fontSize="11" fontFamily="var(--font-mono)" fontWeight="bold">
        {score.toFixed(1)}
      </text>
    </svg>
  )
}

export default function ReasoningTimeline({ steps, isStreaming }: ReasoningTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {steps.map((step, idx) => (
        <div key={idx} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
          {/* Step header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.1rem 0.375rem', borderRadius: '3px' }}>
              {step.step}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: step.type === 'accept' ? 'var(--color-accent)' : step.type === 'generate' ? 'var(--color-primary)' : 'var(--color-muted)' }}>
              {TYPE_LABELS[step.type] || step.type}
            </span>
            {step.quality_score != null && <QualityGauge score={step.quality_score} />}
          </div>

          {/* Image */}
          {step.image_url && (step.type === 'generate' || step.type === 'accept' || step.type === 'critique') && (
            <div style={{ lineHeight: 0, position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.image_url} alt={`Step ${step.step}`} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
              {step.type === 'accept' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,17,8,0.4)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
                </div>
              )}
            </div>
          )}

          {/* Observations */}
          {step.observations.length > 0 && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {step.observations.map((obs, i) => (
                  <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>·</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {step.issues && step.issues.length > 0 && (
            <div style={{ padding: '0 1rem 0.75rem' }}>
              {step.issues.map((issue, i) => (
                <div key={i} style={{ padding: '0.5rem 0.625rem', background: 'var(--color-dark)', borderLeft: `2px solid ${SEVERITY_COLORS[issue.severity]}`, borderRadius: '0 6px 6px 0', marginBottom: '0.375rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text)', marginBottom: '0.125rem' }}><strong>{issue.region}</strong>: {issue.issue}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Fix: {issue.fix}</div>
                </div>
              ))}
            </div>
          )}

          {/* Revised prompt */}
          {step.revised_prompt && (
            <div style={{ padding: '0 1rem 0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.5rem 0.75rem', borderRadius: '6px', lineHeight: 1.5 }}>
                → {step.revised_prompt}
              </div>
            </div>
          )}
        </div>
      ))}

      {isStreaming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          Synthia está razonando...
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
