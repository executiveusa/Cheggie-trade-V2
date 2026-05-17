'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    exact: true,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/repos',
    label: 'Repositories',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 2h10M2 7h10M2 12h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="11" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/agents',
    label: 'Agents',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/tasks',
    label: 'Tasks',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M1 3h12M1 7h8M1 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/standards',
    label: 'Standards',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5H5.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/command',
    label: 'Command',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M1 3h12v8H1z" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4 7l2 1.5L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/worlds',
    label: '3D Worlds',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
        <ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1.5 7h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/video',
    label: 'Seedance Video',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <rect x="1" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M9 5.5l4-2v7l-4-2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/spawn',
    label: 'Spawn Agent',
    exact: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7 4v6M4 7h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#0d0f0e', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.012)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        zIndex: 100,
        overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.0625rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#f0ede6',
              marginBottom: '0.2rem',
            }}>CYNTHIA</p>
          </Link>
          <p style={{ fontSize: '0.625rem', color: '#3a3835', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Studio OS · v2.0
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 1.25rem' }} />

        {/* Nav */}
        <nav style={{ padding: '0.875rem 0.625rem', flex: 1 }}>
          <p style={{ fontSize: '0.5625rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3a3835', padding: '0 0.625rem', marginBottom: '0.5rem' }}>
            Navigation
          </p>
          {NAV.map(({ href, label, exact, icon }) => {
            const active = exact ? pathname === href : (pathname?.startsWith(href) && !(exact && pathname !== href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5625rem 0.625rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: active ? '#f0ede6' : '#5a5855',
                  background: active ? 'rgba(201,169,110,0.08)' : 'transparent',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.01em',
                  marginBottom: '1px',
                  transition: 'all 120ms ease',
                  position: 'relative',
                }}
              >
                <span style={{ color: active ? '#c9a96e' : 'currentColor', flexShrink: 0 }}>
                  {icon}
                </span>
                <span>{label}</span>
                {active && (
                  <div style={{
                    position: 'absolute',
                    right: '0.625rem',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#c9a96e',
                  }} />
                )}
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0.75rem 0' }} />

          {/* Quick links */}
          <p style={{ fontSize: '0.5625rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3a3835', padding: '0 0.625rem', marginBottom: '0.5rem' }}>
            Studio
          </p>
          {[
            { href: 'https://github.com/nv-tlabs/lyra', label: 'Lyra Repo' },
            { href: 'https://github.com/openclaw/openclaw', label: 'OpenClaw' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.625rem',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#3a3835',
                fontSize: '0.75rem',
                marginBottom: '1px',
                transition: 'color 120ms ease',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M1 9L9 1M9 1H4M9 1v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {label}
            </a>
          ))}
        </nav>

        {/* System status */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6ea87e', boxShadow: '0 0 6px #6ea87e88' }} />
            <span style={{ fontSize: '0.6875rem', color: '#5a5855', letterSpacing: '0.04em' }}>System online</span>
          </div>
          <p style={{ fontSize: '0.5625rem', color: '#2a2825', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Lyra · HY-WorldPlay · Seedance · UDEC 8.5
          </p>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100dvh',
        overflow: 'auto',
        position: 'relative',
      }}>
        {children}
      </main>
    </div>
  )
}
