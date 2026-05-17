'use client'

import { useEffect, useRef, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > lastScrollY.current && y > 200)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 2.5rem',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(13,15,14,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'background 400ms ease, backdrop-filter 400ms ease, border-color 400ms ease, transform 300ms ease',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      {/* Wordmark */}
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.25rem',
          fontWeight: 400,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#f0ede6',
          textDecoration: 'none',
        }}
      >
        CYNTHIA
      </a>

      {/* Desktop nav */}
      <div
        style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center',
        }}
        className="hidden md:flex"
      >
        {['Work', 'Process', 'Studio'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              color: '#8a8780',
              textDecoration: 'none',
              fontSize: '0.875rem',
              letterSpacing: '0.06em',
              transition: 'color 200ms ease',
            }}
            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#f0ede6' }}
            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = '#8a8780' }}
          >
            {item}
          </a>
        ))}
        <a
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: '#8a8780',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            letterSpacing: '0.06em',
            padding: '0.5rem 0.875rem',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = '#c9a96e'
            el.style.borderColor = 'rgba(201,169,110,0.3)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = '#8a8780'
            el.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
            <rect x="7" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
            <rect x="1" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
            <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
          </svg>
          Studio OS
        </a>
        <a
          href="#audit"
          style={{
            color: '#0d0f0e',
            background: '#c9a96e',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'background 200ms ease',
          }}
          onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.background = '#d4b47a' }}
          onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.background = '#c9a96e' }}
        >
          Free Audit
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          color: '#f0ede6',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
        className="flex md:hidden"
        aria-label="Toggle menu"
      >
        <span style={{ width: '22px', height: '1px', background: 'currentColor', display: 'block', transition: 'transform 200ms ease', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
        <span style={{ width: '22px', height: '1px', background: 'currentColor', display: 'block', opacity: menuOpen ? 0 : 1, transition: 'opacity 200ms ease' }} />
        <span style={{ width: '22px', height: '1px', background: 'currentColor', display: 'block', transition: 'transform 200ms ease', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: 'rgba(13,15,14,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {['Work', 'Process', 'Studio'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#8a8780', textDecoration: 'none', fontSize: '1rem', letterSpacing: '0.06em' }}
            >
              {item}
            </a>
          ))}
          <a
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{ color: '#c9a96e', textDecoration: 'none', fontSize: '0.9375rem', letterSpacing: '0.06em' }}
          >
            Studio OS →
          </a>
          <a
            href="#audit"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'inline-block',
              color: '#0d0f0e',
              background: '#c9a96e',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Free Audit
          </a>
        </div>
      )}
    </nav>
  )
}
