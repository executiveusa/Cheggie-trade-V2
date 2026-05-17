import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    product: string
    pain_point: string
    audience: string
    tone: string
    language: string
  }
  const { product, pain_point, audience, tone, language } = body

  const isEs = language === 'es'

  const systemPrompt = isEs
    ? `Eres un experto en copywriting UGC para marcas latinoamericanas. Escribe scripts de video de 60 segundos usando el framework P.A.S.S. (Problema, Amplificación, Solución, Sistema). Sé directo, auténtico y conversacional. Incluye indicaciones de ritmo y tono para el creador.`
    : `You are a UGC copywriting expert for Latin American brands. Write 60-second video scripts using the P.A.S.S. framework (Problem, Amplification, Solution, System). Be direct, authentic, and conversational. Include pacing and tone notes for the creator.`

  const userPrompt = isEs
    ? `Escribe un script UGC de 60 segundos para:\n\nProducto: ${product}\nPunto de dolor: ${pain_point || 'no especificado'}\nAudiencia: ${audience}\nTono: ${tone}\n\nUsa el framework P.A.S.S. Incluye corchetes con indicaciones [TONO: entusiasta], [PAUSA], etc. Termina con un CTA claro.`
    : `Write a 60-second UGC script for:\n\nProduct: ${product}\nPain point: ${pain_point || 'not specified'}\nAudience: ${audience}\nTone: ${tone}\n\nUse the P.A.S.S. framework. Include brackets with pacing notes [TONE: enthusiastic], [PAUSE], etc. End with a clear CTA.`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return new Response(
    new ReadableStream({
      async start(ctrl) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            ctrl.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        ctrl.close()
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
}
