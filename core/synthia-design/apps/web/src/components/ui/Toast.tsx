'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

const COLORS: Record<ToastType, { bg: string; border: string; text: string; dot: string }> = {
  success: { bg: 'rgba(90,122,82,0.12)', border: 'rgba(90,122,82,0.35)', text: '#5a7a52', dot: '#5a7a52' },
  error:   { bg: 'rgba(232,112,112,0.12)', border: 'rgba(232,112,112,0.35)', text: '#e87070', dot: '#e87070' },
  info:    { bg: 'rgba(196,150,60,0.12)', border: 'rgba(196,150,60,0.35)', text: '#c4963c', dot: '#c4963c' },
}

let externalToast: ((opts: ToastOptions) => void) | null = null

export function useToast() {
  const toast = useCallback((opts: ToastOptions) => {
    externalToast?.(opts)
  }, [])
  return { toast }
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const addToast = useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const duration = opts.duration ?? 4000
    setToasts(prev => [...prev.slice(-4), { id, message: opts.message, type: opts.type ?? 'info', duration }])
    const timer = setTimeout(() => dismiss(id), duration)
    timers.current.set(id, timer)
  }, [dismiss])

  useEffect(() => {
    externalToast = addToast
    return () => { externalToast = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '360px',
      width: 'calc(100vw - 3rem)',
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type]
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              background: 'var(--color-surface)',
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              animation: 'toastIn 0.2s ease',
              lineHeight: 1.4,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: '4px' }} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0, padding: 0 }}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )
      })}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
