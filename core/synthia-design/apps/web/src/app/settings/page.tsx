'use client'

import { useState, useEffect } from 'react'
import { PROVIDERS, saveKey, getKey, removeKey, maskKey } from '@/lib/key-manager'

export default function SettingsPage() {
  const [tab, setTab] = useState('keys')
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [testResult, setTestResult] = useState<Record<string, boolean | null>>({})

  useEffect(() => {
    async function loadKeys() {
      const loaded: Record<string, string> = {}
      const existing: Record<string, string> = {}
      for (const p of PROVIDERS) {
        const val = await getKey(p.id)
        loaded[p.id] = ''
        if (val) existing[p.id] = val
      }
      setKeys(loaded)
      setSavedKeys(existing)
    }
    loadKeys()
  }, [])

  async function handleSaveKey(id: string) {
    if (!keys[id].trim()) return
    await saveKey(id, keys[id].trim())
    setSavedKeys(prev => ({ ...prev, [id]: keys[id].trim() }))
    setKeys(prev => ({ ...prev, [id]: '' }))
    setSaved(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2000)
  }

  function handleRemoveKey(id: string) {
    removeKey(id)
    setSavedKeys(prev => { const n = { ...prev }; delete n[id]; return n })
    setKeys(prev => ({ ...prev, [id]: '' }))
    setTestResult(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  async function handleTestKey(id: string, value: string) {
    setTesting(prev => ({ ...prev, [id]: true }))
    setTestResult(prev => ({ ...prev, [id]: null }))
    try {
      if (id === 'muapi') {
        const { SynthiaMediaClient } = await import('@/lib/muapi-client')
        const client = new SynthiaMediaClient(value)
        const ok = await client.validateConnection()
        setTestResult(prev => ({ ...prev, [id]: ok }))
      } else if (id === 'anthropic') {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }) })
        setTestResult(prev => ({ ...prev, [id]: res.ok }))
      } else {
        setTestResult(prev => ({ ...prev, [id]: true }))
      }
    } catch {
      setTestResult(prev => ({ ...prev, [id]: false }))
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }))
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    color: active ? 'var(--color-primary)' : 'var(--color-muted)',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  })

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'var(--color-dark)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8125rem',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)' }}>Configuración</h1>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {[
          { id: 'keys', label: 'Mis Llaves API' },
          { id: 'profile', label: 'Perfil' },
          { id: 'export', label: 'Exportar datos' },
          { id: 'plan', label: 'Plan' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '2rem 1.5rem', maxWidth: '640px' }}>
        {tab === 'keys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(90,122,82,0.08)', border: '1px solid rgba(90,122,82,0.2)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              🔒 Tus llaves se guardan solo en este dispositivo. Synthia nunca las recibe en nuestros servidores.
            </div>

            {PROVIDERS.map(provider => {
              const hasSaved = !!savedKeys[provider.id]
              const tr = testResult[provider.id]
              return (
                <div key={provider.id} style={{ background: 'var(--color-surface)', border: `1px solid ${hasSaved ? 'rgba(90,122,82,0.4)' : 'var(--color-border)'}`, borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {provider.label}
                        {provider.required && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-primary)', background: 'rgba(196,150,60,0.15)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>REQUERIDO</span>}
                        {hasSaved && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: '#5a7a52', background: 'rgba(90,122,82,0.12)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>GUARDADO</span>}
                      </div>
                      <a href={provider.docs} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Obtener llave →</a>
                    </div>
                    {hasSaved && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleTestKey(provider.id, savedKeys[provider.id])}
                          disabled={testing[provider.id]}
                          style={{ fontSize: '0.75rem', color: tr === true ? '#5a7a52' : tr === false ? '#e87070' : 'var(--color-muted)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                        >
                          {testing[provider.id] ? '...' : tr === true ? '✓ Válida' : tr === false ? '✗ Error' : 'Probar'}
                        </button>
                        <button onClick={() => handleRemoveKey(provider.id)} style={{ fontSize: '0.75rem', color: 'rgba(220,80,80,0.7)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Revocar</button>
                      </div>
                    )}
                  </div>

                  {hasSaved ? (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.5rem 0.75rem', borderRadius: '6px', letterSpacing: '0.05em' }}>
                      {maskKey(savedKeys[provider.id])}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="password"
                        value={keys[provider.id] || ''}
                        onChange={e => setKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSaveKey(provider.id)}
                        placeholder={provider.placeholder}
                        style={inputStyle}
                      />
                      <button onClick={() => handleSaveKey(provider.id)} style={{ padding: '0.5rem 0.875rem', background: saved[provider.id] ? '#5a7a52' : 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-body)', flexShrink: 0, cursor: 'pointer' }}>
                        {saved[provider.id] ? '✓' : 'Guardar'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Conecta tu cuenta de Supabase para guardar tu perfil.</p>
            {[
              { label: 'Nombre visible', placeholder: 'Tu nombre' },
              { label: 'Usuario', placeholder: '@username', mono: true },
              { label: 'Número de WhatsApp', placeholder: '+52...' },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{field.label}</label>
                <input placeholder={field.placeholder} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontFamily: field.mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }} />
              </div>
            ))}
          </div>
        )}

        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Exportar Segunda Mente', href: '/brain/export', desc: 'Todas tus conversaciones e importaciones en JSON' },
              { label: 'Exportar generaciones', href: '#', desc: 'Historial de imágenes y videos generados en CSV' },
            ].map(action => (
              <div key={action.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{action.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{action.desc}</div>
                </div>
                <a href={action.href} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>↓ Exportar</a>
              </div>
            ))}

            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgb(220,80,80)', marginBottom: '0.5rem' }}>Zona de peligro</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>Eliminar tu cuenta borra todos tus datos permanentemente. Escribe ELIMINAR para confirmar.</p>
              <input placeholder="ELIMINAR" style={{ width: '100%', background: 'var(--color-dark)', border: '1px solid rgba(220,80,80,0.3)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'rgb(220,80,80)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem' }} />
              <button disabled style={{ width: '100%', padding: '0.625rem', background: 'rgba(220,80,80,0.1)', color: 'rgba(220,80,80,0.5)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>Eliminar cuenta</button>
            </div>
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.25rem 0.625rem', borderRadius: '4px', letterSpacing: '0.08em' }}>PLAN ACTUAL: FREE</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                2% de cada pago apoya proyectos eco y alfabetización IA en LATAM — automáticamente.
              </p>
              <a href="/pricing" style={{ display: 'block', width: '100%', padding: '0.75rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 700, textAlign: 'center' }}>
                Ver planes y actualizar →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
