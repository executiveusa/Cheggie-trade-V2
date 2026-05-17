import Link from 'next/link'

const TEMPLATES = [
  { category: 'Redes Sociales', icon: '📱', title: 'Post de Instagram', title_en: 'Instagram Post', prompt: 'Imagen cuadrada vibrante para Instagram con paleta profesional' },
  { category: 'Redes Sociales', icon: '🎬', title: 'Reels LATAM', title_en: 'LATAM Reels', prompt: 'Video vertical dinámico para redes sociales 9:16' },
  { category: 'Redes Sociales', icon: '✍️', title: 'Carrusel educativo', title_en: 'Educational Carousel', prompt: 'Diseño de carrusel educativo con paleta profesional' },
  { category: 'Redes Sociales', icon: '🎙', title: 'Quote visual', title_en: 'Visual Quote', prompt: 'Cita motivacional con tipografía elegante y fondo oscuro' },
  { category: 'Negocios', icon: '🛒', title: 'Foto de producto', title_en: 'Product Photo', prompt: 'Fotografía de producto con iluminación de estudio profesional' },
  { category: 'Negocios', icon: '📊', title: 'Anuncio publicitario', title_en: 'Ad Creative', prompt: 'Creativo publicitario con llamada a la acción clara' },
  { category: 'Negocios', icon: '🧑‍💼', title: 'Avatar corporativo', title_en: 'Corporate Avatar', prompt: 'Avatar profesional con fondo corporativo limpio' },
  { category: 'Negocios', icon: '📧', title: 'Banner de email', title_en: 'Email Banner', prompt: 'Banner para email marketing con diseño profesional' },
  { category: 'Creatividad', icon: '🎨', title: 'Arte conceptual', title_en: 'Concept Art', prompt: 'Arte conceptual cinematográfico con iluminación dramática' },
  { category: 'Creatividad', icon: '🌄', title: 'Paisaje cinematográfico', title_en: 'Cinematic Landscape', prompt: 'Paisaje épico con luz dorada al atardecer, formato 16:9' },
  { category: 'Creatividad', icon: '🎭', title: 'Retrato artístico', title_en: 'Artistic Portrait', prompt: 'Retrato artístico con iluminación rembrandt y bokeh suave' },
  { category: 'Creatividad', icon: '🦋', title: 'Abstracto texturizado', title_en: 'Textured Abstract', prompt: 'Arte abstracto con texturas orgánicas y paleta tierra' },
]

const STATS = [
  { value: '200+', label: 'modelos de IA' },
  { value: '6', label: 'estudios creativos' },
  { value: '∞', label: 'tus datos, siempre tuyos' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-dark)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      {/* Nav */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: 'var(--color-dark)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-primary)' }}>S</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.15em' }}>SYNTHIA™</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Ver planes</Link>
          <Link href="/chat" style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'var(--color-dark)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}>
            Empezar →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 5rem)', color: 'var(--color-primary)', lineHeight: 1, marginBottom: '1.5rem' }}>
          Synthia™
        </h1>
        <p style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', color: 'var(--color-muted)', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          Tu IA. Tu datos. Tu negocio.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding: '0.5rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '999px', display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-primary)' }}>{s.value}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/chat" style={{ padding: '0.875rem 2rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '1rem', fontWeight: 700 }}>
            Empezar gratis
          </Link>
          <Link href="/pricing" style={{ padding: '0.875rem 2rem', border: '1px solid var(--color-border)', color: 'var(--color-muted)', borderRadius: '8px', fontSize: '1rem' }}>
            Ver planes
          </Link>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-muted)', opacity: 0.7 }}>Sin tarjeta. Sin suscripción. Tus datos son tuyos.</p>
      </section>

      {/* Templates */}
      <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.75rem', color: 'var(--color-text)', marginBottom: '2rem', textAlign: 'center' }}>
          Empieza con una plantilla
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {TEMPLATES.map((t, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.category}</span>
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)', fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.4, flex: 1 }}>{t.prompt.slice(0, 60)}...</div>
              <Link
                href={`/chat?prompt=${encodeURIComponent(t.prompt)}`}
                style={{ padding: '0.5rem 0.875rem', background: 'rgba(196,150,60,0.1)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.8125rem', textAlign: 'center', fontWeight: 600 }}
              >
                Probar →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', marginTop: '4rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
          2% de cada venta apoya proyectos eco y alfabetización IA en LATAM
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em', opacity: 0.6 }}>
          Kupuri Media™ × The Pauli Effect™
        </p>
      </footer>
    </div>
  )
}
