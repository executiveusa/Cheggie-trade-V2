'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  thumbnail_url: string | null
  result_url: string
  studio: string | null
  tags: string[]
  remix_count: number
  created_at: string
  user_id: string
  profiles?: { username: string; display_name: string | null }
}

const STUDIOS = ['all', 'image', 'video', 'cinema', 'marketing', 'lipsync']
const STUDIO_COLORS: Record<string, string> = {
  image: '#c4963c', video: '#5a7a52', cinema: '#8b6914', marketing: '#3a6a8a', lipsync: '#7a4a8a',
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState<'newest' | 'remixed'>('newest')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setProjects([])
    setPage(0)
    setHasMore(true)
    loadProjects(0, filter, sort)
  }, [filter, sort])

  async function loadProjects(pageNum: number, studioFilter: string, sortBy: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        studio: studioFilter,
        sort: sortBy,
        page: String(pageNum),
        limit: '12',
      })
      const res = await fetch(`/api/portfolio/list?${params}`)
      const data = await res.json() as { projects: Project[]; hasMore: boolean }
      setProjects(prev => pageNum === 0 ? data.projects : [...prev, ...data.projects])
      setHasMore(data.hasMore)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    loadProjects(nextPage, filter, sort)
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    background: active ? 'var(--color-primary)' : 'var(--color-surface)',
    color: active ? 'var(--color-dark)' : 'var(--color-muted)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    textTransform: 'capitalize' as const,
  })

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)' }}>Portafolio Comunidad</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Creaciones de la comunidad Synthia™</p>
        </div>
        <Link href="/chat" style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}>+ Crear</Link>
      </div>

      {/* Filters */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {STUDIOS.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={pillStyle(filter === s)}>
            {s === 'all' ? 'Todos' : s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setSort('newest')} style={pillStyle(sort === 'newest')}>Más recientes</button>
          <button onClick={() => setSort('remixed')} style={pillStyle(sort === 'remixed')}>Más remixados</button>
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{ padding: '1.5rem 2rem' }}>
        {loading && projects.length === 0 ? (
          <div style={{ columns: '3 240px', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ aspectRatio: i % 3 === 1 ? '4/5' : '1/1', borderRadius: '10px', marginBottom: '1rem', breakInside: 'avoid' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼</div>
            <p>Aún no hay proyectos en esta categoría. ¡Sé el primero en publicar!</p>
          </div>
        ) : (
          <div style={{ columns: '3 240px', gap: '1rem' }}>
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/portfolio/${project.id}`}
                style={{ display: 'block', marginBottom: '1rem', breakInside: 'avoid', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', textDecoration: 'none' }}
              >
                <div style={{ background: '#000', lineHeight: 0 }}>
                  {project.result_url?.match(/\.(mp4|webm)/i) ? (
                    <video src={project.result_url} muted playsInline style={{ width: '100%', objectFit: 'cover', maxHeight: '300px', display: 'block' }} />
                  ) : project.thumbnail_url || project.result_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.thumbnail_url || project.result_url} alt={project.title} style={{ width: '100%', objectFit: 'cover', maxHeight: '300px', display: 'block' }} />
                  ) : (
                    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--color-dark)' }}>🎨</div>
                  )}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{project.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {project.studio && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: STUDIO_COLORS[project.studio] || 'var(--color-primary)', background: `${STUDIO_COLORS[project.studio] || 'var(--color-primary)'}18`, padding: '0.1rem 0.375rem', borderRadius: '3px', textTransform: 'capitalize' }}>
                        {project.studio}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      🔁 {project.remix_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={handleLoadMore} style={{ padding: '0.75rem 2rem', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', fontSize: '0.875rem' }}>
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
