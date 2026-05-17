import { NextRequest, NextResponse } from 'next/server'
import { runVisualReasoningChain } from '@/lib/visual-reasoning'
import type { VisualReasoningStep } from '@/lib/visual-reasoning'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'
  const rl = rateLimit(`${ip}:visual_reason`, RATE_LIMITS.visual_reason.maxRequests, RATE_LIMITS.visual_reason.windowMs)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Demasiadas solicitudes. Intenta en un momento.', retry_after_ms: rl.resetAt - Date.now() },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rl.resetAt) } }
    )
  }

  const { prompt, muapiKey } = await req.json() as { prompt: string; muapiKey: string }
  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      async start(ctrl) {
        const send = (data: unknown) =>
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

        try {
          const chain = await runVisualReasoningChain({
            prompt,
            muapiKey,
            anthropicKey: process.env.ANTHROPIC_API_KEY!,
            onStep: (step: VisualReasoningStep) => send({ type: 'step', step }),
          })
          send({ type: 'complete', chain })
        } catch (err) {
          send({ type: 'error', message: String(err) })
        }
        ctrl.close()
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
  )
}
