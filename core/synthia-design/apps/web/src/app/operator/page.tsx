'use client'

import { useState } from 'react'

interface Instance {
  id: string
  domain: string
  country: string
  niche: string
  language: string
  user_count: number
  revenue_cents: number
  created_at: string
}

const NICHE_CONFIGS = [
  { label: 'Puerto Rico', env: 'WL_COUNTRY=PR WL_TAGLINE="Tu IA boricua"' },
  { label: 'Colombia — Emprendedoras', env: 'WL_COUNTRY=CO WL_NICHE=emprendedoras' },
  { label: 'Perú — Creadores', env: 'WL_COUNTRY=PE WL_NICHE=creadores' },
  { label: 'Brasil', env: 'WL_LANGUAGE=pt WL_TAGLINE="Sua IA. Seu negócio."' },
  { label: 'México — Reels', env: 'WL_NICHE=reels WL_TAGLINE="Crea contenido con tu IA"' },
  { label: 'Coaches LATAM', env: 'WL_NICHE=coaches WL_TAGLINE="Tu IA para coaches"' },
  { label: 'Ecommerce LATAM', env: 'WL_NICHE=ecommerce WL_TAGLINE="Vende más con tu IA"' },
]

export default function OperatorPage() {
  const [instances] = useState<Instance[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInstance, setNewInstance] = useState({ domain: '', country: 'MX', niche: 'general', language: 'es' })
  const [copied, setCopied] = useState<string | null>(null)

  function copyConfig(env: string) {
    navigator.clipboard.writeText(env)
    setCopied(env)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)' }}>Panel de Operador</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Gestiona tus instancias white-label de Synthia™</p>
        </div>
        <button onClick={() => setShowAddForm(true)} style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}>
          + Nueva instancia
        </button>
      </div>

      <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
        {/* Instances */}
        {instances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--color-border)', borderRadius: '12px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌎</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Sin instancias todavía</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto' }}>
              Despliega tu primera instancia white-label para un nicho o país específico. Cada cliente te paga a ti, no a Kupuri.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {instances.map(inst => (
              <div key={inst.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{inst.domain}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{inst.country} · {inst.niche} · {inst.language}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>{inst.user_count} usuarios</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>${(inst.revenue_cents / 100).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Niche configs */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Configuraciones pre-built por nicho</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {NICHE_CONFIGS.map(config => (
            <div key={config.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{config.label}</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.625rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {config.env}
              </pre>
              <button
                onClick={() => copyConfig(config.env)}
                style={{ width: '100%', padding: '0.4rem', background: copied === config.env ? 'var(--color-accent)' : 'rgba(196,150,60,0.1)', color: copied === config.env ? 'white' : 'var(--color-primary)', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}
              >
                {copied === config.env ? '✓ Copiado' : 'Copiar config'}
              </button>
            </div>
          ))}
        </div>

        {showAddForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,17,8,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', maxWidth: '480px', width: '100%' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--color-text)', marginBottom: '1.5rem' }}>Nueva instancia</h3>
              {[
                { label: 'Dominio', key: 'domain', placeholder: 'tudominio.com' },
                { label: 'País', key: 'country', placeholder: 'MX' },
                { label: 'Nicho', key: 'niche', placeholder: 'emprendedoras' },
                { label: 'Idioma', key: 'language', placeholder: 'es' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{field.label}</label>
                  <input
                    value={newInstance[field.key as keyof typeof newInstance]}
                    onChange={e => setNewInstance(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: '100%', background: 'var(--color-dark)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', fontSize: '0.875rem' }}>Cancelar</button>
                <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}>Crear instancia</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
