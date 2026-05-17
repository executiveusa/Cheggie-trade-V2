import type { SecondBrainEntry } from '@/lib/data-import'
import { createClient } from '@/lib/supabase/client'

const DB_NAME = 'synthia-second-brain'
const DB_VERSION = 1
const STORE_NAME = 'entries'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('source', 'source', { unique: false })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('updated_at', 'updated_at', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveEntry(entry: SecondBrainEntry): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function saveBatch(entries: SecondBrainEntry[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    entries.forEach(e => store.put(e))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllEntries(): Promise<SecondBrainEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result as SecondBrainEntry[])
    req.onerror = () => reject(req.error)
  })
}

export async function searchEntries(query: string): Promise<SecondBrainEntry[]> {
  const all = await getAllEntries()
  const q = query.toLowerCase()
  return all.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.content.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q))
  )
}

export async function getStats(): Promise<{ total: number; sources: Record<string, number>; types: Record<string, number> }> {
  const all = await getAllEntries()
  const sources: Record<string, number> = {}
  const types: Record<string, number> = {}
  all.forEach(e => {
    sources[e.source] = (sources[e.source] || 0) + 1
    types[e.type] = (types[e.type] || 0) + 1
  })
  return { total: all.length, sources, types }
}

export async function exportAll(): Promise<string> {
  const all = await getAllEntries()
  return JSON.stringify(all, null, 2)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Cloud sync ───────────────────────────────────────────────

export async function syncToCloud(userId: string): Promise<{ synced: number; errors: number }> {
  const supabase = createClient()
  const entries = await getAllEntries()
  let synced = 0
  let errors = 0

  const BATCH = 50
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH).map(e => ({
      id: e.id,
      user_id: userId,
      type: e.type,
      title: e.title,
      content: e.content,
      source: e.source,
      tags: e.tags,
      is_public: false,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }))
    const { error } = await supabase.from('brain_entries').upsert(batch, { onConflict: 'id' })
    if (error) { errors += batch.length } else { synced += batch.length }
  }

  return { synced, errors }
}

export async function syncFromCloud(userId: string): Promise<{ loaded: number }> {
  const supabase = createClient()
  const local = await getAllEntries()
  const newestLocal = local.reduce((max, e) => e.updated_at > max ? e.updated_at : max, '1970-01-01T00:00:00Z')

  const { data, error } = await supabase
    .from('brain_entries')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', newestLocal)
    .order('updated_at', { ascending: true })

  if (error || !data?.length) return { loaded: 0 }

  const remoteEntries: SecondBrainEntry[] = data.map(r => ({
    id: r.id as string,
    type: r.type as SecondBrainEntry['type'],
    title: r.title as string,
    content: r.content as string,
    source: r.source as string,
    tags: (r.tags as string[]) || [],
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }))

  await saveBatch(remoteEntries)
  return { loaded: remoteEntries.length }
}

let syncTimer: ReturnType<typeof setInterval> | null = null

export function startAutoSync(userId: string, intervalMs = 30000): () => void {
  if (syncTimer) clearInterval(syncTimer)

  const run = async () => {
    try {
      await syncToCloud(userId)
      await syncFromCloud(userId)
    } catch { /* silent — sync is best-effort */ }
  }

  run()
  syncTimer = setInterval(run, intervalMs)

  return () => {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null }
  }
}

