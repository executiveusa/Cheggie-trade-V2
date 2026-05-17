import Link from 'next/link'
import type { Metadata } from 'next'

// Static fallback — real data would come from Supabase
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Proyecto ${id} | Portafolio Synthia™`,
    description: 'Creado con Synthia™ — tu estudio de IA soberano',
    openGraph: {
      title: `Proyecto AI Portfolio | Synthia™`,
      description: 'Crea esto y mucho más con tu propia Synthia™',
      type: 'website',
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      {/* Nav */}
      <nav style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/portfolio" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>← Portafolio</Link>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Placeholder — in production, fetch project from Supabase */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ height: '400px', background: 'var(--color-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎨</div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Proyecto {id.slice(0, 8)}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem' }}>Creado con Synthia™</p>

        {/* Remix CTA */}
        <div style={{ padding: '1.5rem', background: 'rgba(196,150,60,0.08)', border: '1px solid rgba(196,150,60,0.2)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Crea esto (y mucho más) con tu propia Synthia™
          </p>
          <Link
            href={`/chat`}
            style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}
          >
            🔁 Remix esto con Synthia™
          </Link>
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>O <Link href="/pricing" style={{ color: 'var(--color-primary)' }}>instala tu propio Synthia™</Link> para crear sin límites</p>
        </div>
      </div>
    </div>
  )
}
