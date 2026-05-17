'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { autoParseExport, conversationToEntry } from '@/lib/data-import'
import type { SecondBrainEntry, ConversationEntry } from '@/lib/data-import'
import { saveBatch, getAllEntries, searchEntries, getStats, startAutoSync } from '@/lib/second-brain/store'
import ImportInstructionsModal from '@/components/brain/ImportInstructionsModal'
import EntrySlideOver from '@/components/brain/EntrySlideOver'
import { createClient } from '@/lib/supabase/client'

function useSyncStatus() {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [tier, setTier] = useState<string>('free')

  useEffect(() => {
    const supabase = createClient()
    let stopSync: (() => void) | null = null

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
      const userTier = (profile?.tier as string) || 'free'
      setTier(userTier)

      if (userTier !== 'free') {
        stopSync = startAutoSync(user.id, 30000)
        setLastSync(new Date())
        const interval = setInterval(() => setLastSync(new Date()), 30000)
        return () => clearInterval(interval)
      }
    })

    return () => { stopSync?.() }
  }, [])

  return { lastSync, tier }
}

function formatSyncTime(date: Date | null): string {
  if (!date) return ''
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 10) return 'Ahora mismo'
  if (secs < 60) return `Hace ${secs}s`
  const mins = Math.floor(secs / 60)
  return `Hace ${mins} min`
}

export default function BrainPage() {
  const [entries, setEntries] = useState<SecondBrainEntry[]>([])
  const [stats, setStats] = useState<{ total: number; sources: Record<string, number>; types: Record<string, number> } | null>(null)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<SecondBrainEntry[]>([])
  const [importing, setImporting] = useState(false)
  const [importCount, setImportCount] = useState(0)
  const [pendingEntries, setPendingEntries] = useState<SecondBrainEntry[]>([])
  const [showModal, setShowModal] = useState<'chatgpt' | 'claude' | 'notion' | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<SecondBrainEntry | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { lastSync, tier } = useSyncStatus()

  const loadData = useCallback(async () => {
    const [all, s] = await Promise.all([getAllEntries(), getStats()])
    setEntries(all)
    setFiltered(all)
    setStats(s)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(entries)
      return
    }
    const timer = setTimeout(async () => {
      const results = await searchEntries(search)
      setFiltered(results)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, entries])

  async function handleFile(file: File) {
    const text = await file.text()
    const parsed = autoParseExport(text, file.name)
    const asEntries: SecondBrainEntry[] = parsed.map(p => {
      if ('messages' in p) return conversationToEntry(p as ConversationEntry)
      return p as SecondBrainEntry
    })
    setPendingEntries(asEntries)
    setImportCount(asEntries.length)
  }

  async function confirmImport() {
    setImporting(true)
    await saveBatch(pendingEntries)
    setPendingEntries([])
    setImportCount(0)
    await loadData()
    setImporting(false)
  }

  const dateStr = entries.length > 0
    ? new Date(Math.max(...entries.map(e => new Date(e.updated_at).getTime()))).toLocaleDateString()
    : '—'

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)' }}>Tu Segunda Mente</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>Tu contexto es tu activo más valioso</p>
        </div>
        <a
          href="/brain/export"
          style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '6px', fontSize: '0.8125rem' }}
        >
          ↓ Exportar todo
        </a>
      </div>

      {/* Stats bar */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)' }}>{stats?.total || 0}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>entradas</span>
        </div>
        {stats && Object.entries(stats.sources).map(([src, count]) => (
          <div key={src} style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
            <span style={{ color: 'var(--color-text)', textTransform: 'capitalize' }}>{src}</span> {count}
          </div>
        ))}
        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: 'auto' }}>Última importación: {dateStr}</div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 0, minHeight: 'calc(100dvh - 140px)' }}>
        {/* Left panel */}
        <div style={{ borderRight: '1px solid var(--color-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            style={{ border: '1px dashed var(--color-accent)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--color-surface)' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.25rem' }}>Arrastra tu export aquí</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>ChatGPT, Claude o Notion · .json o .md</div>
          </div>
          <input ref={fileRef} type="file" accept=".json,.md,.zip" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          {importCount > 0 && (
            <div style={{ padding: '1rem', background: 'rgba(90,122,82,0.1)', border: '1px solid rgba(90,122,82,0.3)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '0.75rem' }}>Detectadas <strong>{importCount}</strong> entradas</div>
              <button onClick={confirmImport} disabled={importing} style={{ width: '100%', padding: '0.625rem', background: 'var(--color-accent)', color: 'white', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700 }}>
                {importing ? 'Importando...' : `Importar ${importCount} entradas`}
              </button>
            </div>
          )}

          {/* Source shortcuts */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['chatgpt', 'claude', 'notion'] as const).map(src => (
              <button key={src} onClick={() => setShowModal(src)} style={{ flex: 1, padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'capitalize' }}>
                {src}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en tu segunda mente..."
              style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.625rem 0.875rem 0.625rem 2.25rem', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          {search && <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{filtered.length} resultados</div>}
        </div>

        {/* Entry list */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100dvh - 140px)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Tu segunda mente está vacía. Importa tus datos de ChatGPT o Claude para empezar.
              </p>
            </div>
          ) : (
            filtered.map(entry => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-primary)', background: 'rgba(196,150,60,0.1)', padding: '0.1rem 0.375rem', borderRadius: '3px', textTransform: 'capitalize' }}>{entry.source}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {entry.content.slice(0, 120)}
                  </p>
                  <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {entry.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--color-muted)', background: 'var(--color-dark)', padding: '0.1rem 0.375rem', borderRadius: '3px' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.25rem' }}>
                  {new Date(entry.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && <ImportInstructionsModal source={showModal} onClose={() => setShowModal(null)} />}
      {selectedEntry && (
        <EntrySlideOver
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={id => { setEntries(prev => prev.filter(e => e.id !== id)); setSelectedEntry(null) }}
        />
      )}

      {/* Sync status footer */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: 'var(--color-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}>
        {tier === 'free' ? (
          <a href="/pricing?upgrade=1" style={{ color: '#c4963c', textDecoration: 'none' }}>
            ↑ Sincronización en la nube disponible en Starter →
          </a>
        ) : lastSync ? (
          <>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5a7a52', display: 'inline-block' }} />
            Sincronizado {formatSyncTime(lastSync)}
          </>
        ) : null}
      </div>
    </div>
  )
}
