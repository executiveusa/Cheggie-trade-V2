'use client'

import { useState, type FormEvent } from 'react'

export default function AuditForm() {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), name: name.trim(), email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Something went wrong')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          background: 'rgba(201,169,110,0.08)',
          border: '1px solid rgba(201,169,110,0.3)',
          borderRadius: '12px',
          padding: '2.5rem 3rem',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(201,169,110,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.5rem',
          }}
        >
          ✓
        </div>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.75rem',
            fontWeight: 300,
            color: '#f0ede6',
            marginBottom: '0.75rem',
          }}
        >
          Audit request received.
        </p>
        <p style={{ color: '#8a8780', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          We&rsquo;ll review your site and send back detailed findings within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* URL — required */}
      <div>
        <label
          htmlFor="audit-url"
          style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8780', marginBottom: '0.5rem' }}
        >
          Your website URL
        </label>
        <input
          id="audit-url"
          type="url"
          required
          placeholder="https://yoursite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '0.875rem 1.25rem',
            color: '#f0ede6',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 300ms ease',
            fontFamily: 'var(--font-dm-sans)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Name + Email — optional */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label
            htmlFor="audit-name"
            style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8780', marginBottom: '0.5rem' }}
          >
            Name <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            id="audit-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.875rem 1.25rem',
              color: '#f0ede6',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color 300ms ease',
              fontFamily: 'var(--font-dm-sans)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>
        <div>
          <label
            htmlFor="audit-email"
            style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8780', marginBottom: '0.5rem' }}
          >
            Email <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            id="audit-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.875rem 1.25rem',
              color: '#f0ede6',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color 300ms ease',
              fontFamily: 'var(--font-dm-sans)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {errorMsg && (
        <p style={{ color: '#e87070', fontSize: '0.875rem' }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          marginTop: '0.5rem',
          background: '#c9a96e',
          color: '#0d0f0e',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem 2.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          transition: 'background 200ms ease, opacity 200ms ease',
          fontFamily: 'var(--font-dm-sans)',
          width: '100%',
        }}
        onMouseEnter={(e) => { if (status !== 'loading') (e.target as HTMLButtonElement).style.background = '#d4b47a' }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#c9a96e' }}
      >
        {status === 'loading' ? 'Requesting audit…' : 'Get My Free Audit'}
      </button>

      <p style={{ color: '#5a5855', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.25rem' }}>
        No commitment. Delivered within 24 hours.
      </p>
    </form>
  )
}
