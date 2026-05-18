import Anthropic from '@anthropic-ai/sdk'
import { SynthiaMediaClient } from '@/lib/muapi-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const threadContext = new Map<string, Message[]>()

const SYSTEM = `Eres Synthia™, un estudio de IA soberano para creadores latinoamericanos.
Responde siempre en español a menos que el usuario escriba en inglés.
Sé directa, cálida y útil. Máximo 2 párrafos cortos.`

async function anthropicChat(text: string, history: Message[]): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const messages = [...history.slice(-6), { role: 'user' as const, content: text }]
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: SYSTEM,
    messages,
  })
  return res.content[0].type === 'text' ? res.content[0].text : ''
}

async function quickAudit(url: string): Promise<string> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const html = await r.text()
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'Sin título'
    const desc = html.match(/name="description" content="([^"]+)"/i)?.[1]
    const hasMobile = html.includes('viewport')
    const score = [title !== 'Sin título', !!desc, hasMobile].filter(Boolean).length
    return `Auditoría rápida de ${url}\n\nTítulo: ${title.slice(0, 50)}\nDescripción: ${desc ? 'Sí' : 'No'}\nMobile-ready: ${hasMobile ? 'Sí' : 'No'}\nPuntaje básico: ${score}/3\n\nPara un audit completo UDEC de 14 ejes: synthia.app`
  } catch {
    return `No pude acceder a ${url}. Verifica que la URL sea correcta.`
  }
}

export async function handleWhatsAppMessage(from: string, text: string): Promise<{
  type: 'text' | 'image' | 'video'
  content: string
  caption?: string
}> {
  const lower = text.toLowerCase().trim()
  const history = threadContext.get(from) || []

  if (lower === 'hola' || lower === 'hi' || lower === 'hello') {
    return {
      type: 'text',
      content: 'Hola, soy Synthia™. Te ayudo a crear imágenes, videos y contenido con IA.\n\nPuedes decirme:\n"Crea [descripción]" para una imagen\n"Analiza [URL]" para auditar un sitio\n"Ayuda" para ver todo lo que puedo hacer.',
    }
  }

  if (lower === 'ayuda' || lower === 'help') {
    return {
      type: 'text',
      content: 'Comandos:\nCrea [descripción] — genera una imagen\nVideo [descripción] — genera un video\nAnaliza [URL] — audita un sitio web\nScript [producto] — escribe un UGC\nPortafolio — ve tus creaciones\nPlanes — conoce Synthia Pro',
    }
  }

  if (lower.startsWith('crea ') || lower.startsWith('create ')) {
    const prompt = text.slice(lower.startsWith('crea ') ? 5 : 7)
    const muapiKey = process.env.MUAPI_DEFAULT_KEY || ''
    if (!muapiKey) {
      return { type: 'text', content: 'Para crear imágenes necesitas configurar tu llave muapi. Visita synthia.app/settings' }
    }
    const client = new SynthiaMediaClient(muapiKey)
    const url = await client.cinema({ prompt, camera: 'Full-Frame Cine Digital', lens: 'Warm Cinema Prime', aperture: 'f/1.4' })
    return { type: 'image', content: url, caption: `Creado por Synthia™: ${prompt.slice(0, 60)}` }
  }

  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  if (lower.startsWith('analiza ') || urlMatch) {
    const url = urlMatch ? urlMatch[0] : text.slice(8)
    return { type: 'text', content: await quickAudit(url) }
  }

  // Conversational fallback
  const reply = await anthropicChat(text, history)
  threadContext.set(from, [...history, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: reply }].slice(-20))
  return { type: 'text', content: reply }
}
