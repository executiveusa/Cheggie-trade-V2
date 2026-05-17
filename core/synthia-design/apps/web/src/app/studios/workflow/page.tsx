'use client'

import { useState } from 'react'

interface WorkflowDef {
  id: string
  icon: string
  title: string
  description: string
  time: string
  inputLabel: string
  inputPlaceholder: string
  steps: string[]
}

const WORKFLOWS: WorkflowDef[] = [
  {
    id: 'content30',
    icon: '📅',
    title: '30 Días de Contenido',
    description: 'Genera 30 ideas de post + 5 posts completos para redes sociales',
    time: '~5 min',
    inputLabel: 'Describe tu producto o marca',
    inputPlaceholder: 'Ej: Tienda de moda sostenible para mujeres LATAM',
    steps: ['Analizando tu marca...', 'Generando 30 ideas de contenido...', 'Escribiendo 5 posts completos...', 'Compilando calendario editorial...'],
  },
  {
    id: 'launchkit',
    icon: '🚀',
    title: 'Kit de Lanzamiento',
    description: 'Hero image + 3 creativos publicitarios listos para lanzar',
    time: '~8 min',
    inputLabel: 'Nombre y descripción del producto',
    inputPlaceholder: 'Ej: CursoFluir — meditación guiada para emprendedoras',
    steps: ['Creando hero image principal...', 'Generando creativo 1 — awareness...', 'Generando creativo 2 — conversión...', 'Generando creativo 3 — retargeting...'],
  },
  {
    id: 'brand',
    icon: '🎨',
    title: 'Identidad de Marca',
    description: '4 conceptos de logo + paleta de colores + pairing tipográfico',
    time: '~6 min',
    inputLabel: 'Nombre de marca y valores',
    inputPlaceholder: 'Ej: Raíz — bienestar ancestral, moderno, femenino',
    steps: ['Analizando valores de marca...', 'Generando concepto 1...', 'Generando concepto 2...', 'Generando conceptos 3 y 4...', 'Creando paleta y tipografía...'],
  },
  {
    id: 'ugc',
    icon: '📹',
    title: 'Campaña UGC',
    description: '5 scripts UGC + imágenes de avatar para cada uno',
    time: '~10 min',
    inputLabel: 'Describe tu producto',
    inputPlaceholder: 'Ej: Suplemento natural para energía sin cafeína',
    steps: ['Analizando producto...', 'Escribiendo script 1...', 'Escribiendo scripts 2-5...', 'Generando avatares matching...'],
  },
  {
    id: 'newsletter',
    icon: '📧',
    title: 'Newsletter Semanal',
    description: 'Outline + 3 secciones escritas para tu newsletter',
    time: '~4 min',
    inputLabel: '3 temas de esta semana (separados por coma)',
    inputPlaceholder: 'Ej: productividad IA, herramientas gratis, caso de éxito',
    steps: ['Estructurando newsletter...', 'Escribiendo sección 1...', 'Escribiendo sección 2...', 'Escribiendo sección 3...', 'Finalizando...'],
  },
]

export default function WorkflowStudioPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [running, setRunning] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, string>>({})

  async function runWorkflow(wf: WorkflowDef) {
    setRunning(wf.id)
    setStepIndex(0)
    setCompleted([])

    for (let i = 0; i < wf.steps.length; i++) {
      setStepIndex(i)
      await new Promise(r => setTimeout(r, 1500))
      setCompleted(prev => [...prev, wf.steps[i]])
    }

    if (wf.id === 'content30' || wf.id === 'newsletter') {
      const input = inputs[wf.id] || ''
      try {
        const res = await fetch('/api/ugc-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: input, pain_point: '', audience: 'emprendedoras', tone: 'auténtico', language: 'es' }),
        })
        if (res.body) {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let text = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            text += decoder.decode(value, { stream: true })
            setResults(prev => ({ ...prev, [wf.id]: text }))
          }
        }
      } catch { /* silent */ }
    }

    setRunning(null)
    setStepIndex(wf.steps.length)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Workflow Studio</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem' }}>Flujos automatizados que encadenan múltiples generaciones</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {WORKFLOWS.map(wf => (
          <div key={wf.id} style={{ background: 'var(--color-surface)', border: `1px solid ${activeWorkflow === wf.id ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div
              onClick={() => setActiveWorkflow(activeWorkflow === wf.id ? null : wf.id)}
              style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>{wf.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{wf.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{wf.time}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>{wf.description}</p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '1.25rem', flexShrink: 0 }}>{activeWorkflow === wf.id ? '▲' : '▼'}</span>
            </div>

            {activeWorkflow === wf.id && (
              <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{wf.inputLabel}</label>
                  <input
                    value={inputs[wf.id] || ''}
                    onChange={e => setInputs(prev => ({ ...prev, [wf.id]: e.target.value }))}
                    placeholder={wf.inputPlaceholder}
                    style={{ width: '100%', background: 'var(--color-dark)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                {(running === wf.id || completed.length > 0 && running !== wf.id) && (
                  <div style={{ marginBottom: '1rem' }}>
                    {wf.steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0', fontSize: '0.8125rem' }}>
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${completed.includes(step) ? 'var(--color-accent)' : stepIndex === i && running === wf.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: completed.includes(step) ? 'var(--color-accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', color: completed.includes(step) ? 'white' : 'transparent', flexShrink: 0 }}>✓</span>
                        <span style={{ color: completed.includes(step) ? 'var(--color-text)' : stepIndex === i && running === wf.id ? 'var(--color-primary)' : 'var(--color-muted)' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results[wf.id] && (
                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <textarea value={results[wf.id]} readOnly rows={8} style={{ width: '100%', background: 'var(--color-dark)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', lineHeight: 1.6, resize: 'vertical' }} />
                  </div>
                )}

                <button
                  onClick={() => runWorkflow(wf)}
                  disabled={!inputs[wf.id]?.trim() || running === wf.id}
                  style={{ width: '100%', padding: '0.75rem', background: inputs[wf.id]?.trim() && running !== wf.id ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 700 }}
                >
                  {running === wf.id ? 'Ejecutando...' : 'Ejecutar flujo'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
