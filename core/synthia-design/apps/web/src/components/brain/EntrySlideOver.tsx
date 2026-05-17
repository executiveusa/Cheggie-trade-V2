'use client'

import { useState } from 'react'
import type { SecondBrainEntry } from '@/lib/data-import'
import { deleteEntry } from '@/lib/second-brain/store'

interface EntrySlideOverProps {
  entry: SecondBrainEntry
  onClose: () => void
  onDelete: (id: string) => void
  onSendToChat?: (summary: string) => void
}

export default function EntrySlideOver({ entry, onClose, onDelete, onSendToChat }: EntrySlideOverProps) {
  const [tags, setTags] = useState<string[]>(entry.tags)
  const [tagInput, setTagInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    await deleteEntry(entry.id)
    onDelete(entry.id)
    onClose()
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  const isConversation = entry.type === 'conversation'
  const messages = isConversation
    ? entry.content.split('\n\n').map(line => {
        const match = line.match(/^\[(user|assistant)\]: (.+)$/s)
        return match ? { role: match[1], content: match[2] } : null
      }).filter(Boolean)
    : []

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,17,8,0.6)' }} />
      <div style={{ position: 'relative', width: 'min(480px, 100vw)', background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{entry.source} · {entry.type}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3 }}>{entry.title}</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-muted)', fontSize: '1.25rem', flexShrink: 0 }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
          {isConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {messages.map((msg, i) => msg && (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>{msg.role}</span>
                  <div style={{ maxWidth: '85%', padding: '0.625rem 0.875rem', borderRadius: '8px', background: msg.role === 'user' ? 'rgba(196,150,60,0.1)' : 'var(--color-dark)', fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {entry.content}
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem' }}>
            {tags.map(tag => (
              <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-primary)', background: 'rgba(196,150,60,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {tag}
                <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Agregar etiqueta..." style={{ flex: 1, background: 'var(--color-dark)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.375rem 0.625rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', outline: 'none' }} />
            <button onClick={addTag} style={{ padding: '0.375rem 0.625rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>+</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.625rem' }}>
          {onSendToChat && (
            <button onClick={() => onSendToChat(entry.title + ': ' + entry.content.slice(0, 200))} style={{ flex: 1, padding: '0.625rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700 }}>
              Enviar al chat
            </button>
          )}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ padding: '0.625rem 0.875rem', border: '1px solid rgba(220,80,80,0.3)', color: 'rgba(220,80,80,0.7)', borderRadius: '6px', fontSize: '0.8125rem' }}>
              Eliminar
            </button>
          ) : (
            <button onClick={handleDelete} style={{ padding: '0.625rem 0.875rem', background: 'rgba(220,80,80,0.15)', color: 'rgb(220,80,80)', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700 }}>
              ¿Confirmar?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
