'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createClient()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!supabase) throw new Error('Supabase no disponible')
      if (tab === 'signup') {
        if (password !== confirm) throw new Error('Las contraseñas no coinciden')
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        router.push('/onboarding')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        router.push('/chat')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/chat` } })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '2.5rem',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(90,122,82,0.06) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2.5rem', color: 'var(--color-primary)', lineHeight: 1 }}>Synthia™</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.15em', marginTop: '0.375rem' }}>TU IA. TUS DATOS. TU NEGOCIO.</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
          {(['signin', 'signup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', color: tab === t ? 'var(--color-primary)' : 'var(--color-muted)', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', fontFamily: 'var(--font-body)' }}>
              {t === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="tu@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
          </div>
          {tab === 'signup' && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Confirmar contraseña</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>
          )}

          {error && <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            {loading ? '...' : tab === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>o</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <button onClick={handleGoogle} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9375rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', fontFamily: 'var(--font-body)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.5 }}>
          Tus datos son tuyos. Siempre puedes exportarlos.
        </p>
      </div>
    </div>
  )
}
