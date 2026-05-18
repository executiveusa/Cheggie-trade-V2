'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/studios/image', label: 'Imagen' },
  { href: '/studios/video', label: 'Video' },
  { href: '/studios/cinema', label: 'Cine' },
  { href: '/studios/marketing', label: 'Marketing' },
  { href: '/studios/lipsync', label: 'Lip Sync' },
  { href: '/studios/workflow', label: 'Flujos' },
]

export default function StudiosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeTab = TABS.find(t => pathname?.startsWith(t.href))

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>Synthia™</Link>
        <span style={{ color: 'var(--color-border)', fontSize: '0.75rem' }}>›</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>Estudios</span>
        {activeTab && (
          <>
            <span style={{ color: 'var(--color-border)', fontSize: '0.75rem' }}>›</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-primary)', letterSpacing: '0.08em' }}>{activeTab.label}</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', display: 'flex', background: 'var(--color-surface)' }}>
        {TABS.map(tab => {
          const active = pathname?.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} style={{
              padding: '0.875rem 1.25rem',
              fontSize: '0.875rem',
              color: active ? 'var(--color-primary)' : 'var(--color-muted)',
              borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}>
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}
