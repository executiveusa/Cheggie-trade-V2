import type { Metadata } from 'next'
import { Playfair_Display, DM_Mono, Lato } from 'next/font/google'
import './globals.css'
import { validateServerEnv } from '@/lib/env'
import { ToastProvider } from '@/components/ui/Toast'

validateServerEnv()

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Synthia™ — Tu IA. Tu datos. Tu negocio.',
  description:
    'Synthia™ es tu estudio de IA soberano. Crea imágenes, videos, contenido y más — con tus propias herramientas, tus propios datos.',
  openGraph: {
    title: 'Synthia™ — Tu IA. Tu datos. Tu negocio.',
    description: 'Estudio de IA soberano para creadores latinoamericanos.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmMono.variable} ${lato.variable}`}
      style={{ background: 'var(--color-dark)' }}
    >
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
