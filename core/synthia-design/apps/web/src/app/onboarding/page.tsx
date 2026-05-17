'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROVIDERS, saveKey } from '@/lib/key-manager'
import { autoParseExport, conversationToEntry } from '@/lib/data-import'
import type { ConversationEntry } from '@/lib/data-import'
import { saveBatch } from '@/lib/second-brain/store'

const TEMPLATES = [
  { icon: '📱', label: 'Post de Instagram LATAM', prompt: 'Imagen cuadrada vibrante para Instagram de emprendedora latinoamericana, paleta cálida, tipografía moderna' },
  { icon: '🎬', label: 'Reels de producto', prompt: 'Video vertical dinámico 9:16 mostrando producto con texto animado y música energética' },
  { icon: '🛒', label: 'Foto de producto', prompt: 'Fotografía de producto con fondo de estudio limpio, iluminación profesional, colores brillantes' },
  { icon: '📧', label: 'Banner de email', prompt: 'Banner de email marketing profesional con CTA claro, paleta corporativa y tipografía legible' },
  { icon: '🎨', label: 'Arte conceptual', prompt: 'Arte conceptual cinematográfico con luz dramática, paleta tierra, estética latinoamericana' },
  { icon: '✍️', label: 'Script UGC', prompt: 'Script de video UGC de 60 segundos en español usando framework P.A.S.S. para audiencia LATAM' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [keyValues, setKeyValues] = useState<Record<string, string>>({})
  const [keySaved, setKeySaved] = useState<Record<string, boolean>>({})
  const [importing, setImporting] = useState(false)
  const router = useRouter()

  async function handleSaveKey(id: string) {
    await saveKey(id, keyValues[id] || '')
    setKeySaved(prev => ({ ...prev, [id]: true }))
  }

  const muapiSaved = !!keySaved['muapi']

  async function handleFile(file: File) {
    setImporting(true)
    try {
      const text = await file.text()
      const parsed = autoParseExport(text, file.name)
      const entries = parsed.map(p => 'messages' in p ? conversationToEntry(p as ConversationEntry) : p)
      await saveBatch(entries as Parameters<typeof saveBatch>[0])
    } catch { /* silent */ }
    setImporting(false)
    setStep(3)
  }

  function handleTemplate(prompt: string) {
    localStorage.setItem('synthia_onboarding_complete', 'true')
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)
  }

  function completeOnboarding() {
    localStorage.setItem('synthia_onboarding_complete', 'true')
    router.push('/chat')
  }

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
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ width: '32px', height: '4px', borderRadius: '2px', background: s <= step ? 'var(--color-primary)' : 'var(--color-border)' }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '560px' }}>
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Conecta tus herramientas</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>Tus llaves se guardan solo en tu dispositivo. Synthia nunca las ve.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {PROVIDERS.map(provider => (
                <div key={provider.id} style={{ background: 'var(--color-surface)', border: `1px solid ${keySaved[provider.id] || false ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {provider.label}
                    {provider.required && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-primary)', background: 'rgba(196,150,60,0.15)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>REQUERIDO ★</span>}
                    {(keySaved[provider.id] || false) && <span style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>✓</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="password"
                      value={keyValues[provider.id] || ''}
                      onChange={e => setKeyValues(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={provider.placeholder}
                      style={inputStyle}
                    />
                    <button onClick={() => handleSaveKey(provider.id)} style={{ padding: '0.5rem 0.875rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(2)} disabled={!muapiSaved} style={{ width: '100%', padding: '0.875rem', background: muapiSaved ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>
              Continuar →
            </button>
            <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Omitir por ahora</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Importa tu historial</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>Tu contexto es tu activo más valioso.</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>Trae todo lo que aprendiste en ChatGPT o Claude. Es tuyo.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { id: 'chatgpt', label: 'ChatGPT', desc: 'Exporta desde ChatGPT → Configuración → Exportar datos', icon: '🤖' },
                { id: 'claude', label: 'Claude', desc: 'Exporta desde Claude.ai → Privacy → Export Conversations', icon: '🔮' },
              ].map(src => (
                <label key={src.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  <span style={{ fontSize: '2rem' }}>{src.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{src.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>{src.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {importing && <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>Importando...</p>}

            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '0.875rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>
              Continuar →
            </button>
            <button onClick={() => setStep(3)} style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Omitir por ahora</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Crea tu primera cosa</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>Elige una plantilla para empezar. Puedes personalizarla después.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => handleTemplate(t.prompt)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{t.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>Elegir esta plantilla →</span>
                </button>
              ))}
            </div>

            <button onClick={completeOnboarding} style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              Ir al chat sin plantilla
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
