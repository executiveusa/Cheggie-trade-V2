import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username}'s AI Portfolio | Synthia™`,
    description: `Creaciones de @${username} con Synthia™`,
    openGraph: {
      title: `@${username}'s AI Portfolio | Synthia™`,
      description: `Ve el portafolio de IA de @${username} — creado con Synthia™`,
      type: 'profile',
    },
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <nav style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/portfolio" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>← Portafolio</Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-dark)', flexShrink: 0 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              {username}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.1em' }}>@{username}</div>
          </div>
        </div>

        {/* Empty state */}
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼</div>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>Aún no hay proyectos públicos.</p>
          <Link href="/pricing" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}>
            Crear tu portafolio con Synthia™ →
          </Link>
        </div>
      </div>
    </div>
  )
}
