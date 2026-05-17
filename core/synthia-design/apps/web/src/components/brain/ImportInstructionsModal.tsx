'use client'

interface ImportInstructionsModalProps {
  source: 'chatgpt' | 'claude' | 'notion'
  onClose: () => void
}

const INSTRUCTIONS = {
  chatgpt: {
    title: 'Exportar desde ChatGPT',
    steps: [
      'Abre ChatGPT en tu navegador',
      'Ve a tu foto de perfil → Configuración',
      'Haz clic en "Exportar datos"',
      'Confirma el proceso — recibirás un email',
      'Descarga el archivo ZIP del email',
      'Extrae el ZIP y encuentra el archivo conversations.json',
      'Arrastra conversations.json aquí',
    ],
  },
  claude: {
    title: 'Exportar desde Claude',
    steps: [
      'Abre Claude.ai en tu navegador',
      'Ve a tu perfil → Privacy',
      'Haz clic en "Export Conversations"',
      'Espera el email de confirmación de Anthropic',
      'Descarga el archivo JSON del email',
      'Arrastra el archivo JSON aquí',
    ],
  },
  notion: {
    title: 'Exportar desde Notion',
    steps: [
      'Abre Notion y ve a Configuración',
      'Haz clic en "Workspace" → "Exportar contenido"',
      'Selecciona formato Markdown & CSV',
      'Incluye subpáginas si quieres',
      'Descarga el ZIP exportado',
      'Extrae el ZIP y arrastra los archivos .md aquí',
    ],
  },
}

export default function ImportInstructionsModal({ source, onClose }: ImportInstructionsModalProps) {
  const info = INSTRUCTIONS[source]

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,17,8,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--color-text)' }}>{info.title}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-muted)', fontSize: '1.25rem' }}>×</button>
        </div>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {info.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', background: 'rgba(196,150,60,0.1)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.5 }}>{step}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose} style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: 'var(--color-primary)', color: 'var(--color-dark)', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 700 }}>Entendido</button>
      </div>
    </div>
  )
}
