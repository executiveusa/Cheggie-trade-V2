'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Conversation {
  id: string
  title: string
  updatedAt: string
}

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/studios/image', label: 'Estudios', icon: '🎨' },
  { href: '/brain', label: 'Segunda Mente', icon: '🧠' },
  { href: '/portfolio', label: 'Portafolio', icon: '🖼' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
]

interface SidebarProps {
  conversationId: string
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
}

export default function Sidebar({ conversationId, onNewConversation, onSelectConversation }: SidebarProps) {
  const pathname = usePathname()
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('synthia_conversations')
    if (stored) {
      try {
        setConversations(JSON.parse(stored))
      } catch {
        setConversations([])
      }
    }
  }, [conversationId])

  return (
    <aside style={{
      width: '240px',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-primary)', lineHeight: 1 }}>S</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', letterSpacing: '0.12em' }}>SYNTHIA</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.5rem 0' }}>
        {NAV_ITEMS.map(item => {
          const active = pathname?.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              color: active ? 'var(--color-text)' : 'var(--color-muted)',
              background: active ? 'rgba(196,150,60,0.08)' : 'transparent',
              borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontFamily: 'var(--font-body)',
              transition: 'background 0.15s, color 0.15s',
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Conversations */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
        <div style={{ padding: '0.75rem 1rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Conversaciones</span>
          <button
            onClick={onNewConversation}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            + Nueva
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 0.5rem 0.5rem' }}>
          {conversations.slice(0, 10).map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 0.5rem',
                fontSize: '0.8125rem',
                color: conv.id === conversationId ? 'var(--color-text)' : 'var(--color-muted)',
                background: conv.id === conversationId ? 'rgba(196,150,60,0.08)' : 'transparent',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '2px',
              }}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-dark)', flexShrink: 0 }}>S</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Usuario</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>FREE</div>
        </div>
      </div>
    </aside>
  )
}
