import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getTier, TIER_LIMITS } from '@/lib/tier'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are Synthia, a sovereign personal AI studio for Latin American creators.
Speak Spanish by default. Switch to English if the user does.
You are warm, direct, knowledgeable — a creative director who knows their business.

When the user wants to generate something, reply ONLY with valid JSON on a single line:
{"tool":"image","params":{"prompt":"...","aspect_ratio":"16:9","model":"flux-dev"}}
{"tool":"video","params":{"prompt":"...","model":"kling","duration":10}}
{"tool":"cinema","params":{"prompt":"...","camera":"Full-Frame Cine Digital","lens":"Compact Anamorphic","aperture":"f/1.4"}}
{"tool":"marketing","params":{"product_image_url":"...","style":"lifestyle","prompt":"..."}}
{"tool":"lipsync","params":{"video_url":"...","audio_url":"..."}}
{"tool":"brain_search","query":"..."}

For everything else, respond conversationally. Max 3 short paragraphs.
Always end with a specific actionable next step.
Never say you cannot do something. Find a way.`

const CHAT_LIMITS: Record<string, number> = {
  free: 20,
  starter: 200,
  pro: 1000,
  operator: Infinity,
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'
  const rl = rateLimit(`${ip}:chat`, RATE_LIMITS.chat.maxRequests, RATE_LIMITS.chat.windowMs)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Demasiadas solicitudes. Intenta en un momento.', retry_after_ms: rl.resetAt - Date.now() },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rl.resetAt) },
      }
    )
  }

  const body = await req.json() as { messages: Array<{ role: 'user' | 'assistant'; content: string }> }
  const { messages } = body

  // Soft chat limit check per tier
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const tier = await getTier(user.id)
      const limit = CHAT_LIMITS[tier] ?? 20
      if (limit !== Infinity && messages.filter(m => m.role === 'user').length > limit) {
        return NextResponse.json(
          { error: 'limit_reached', message: `Alcanzaste el límite de mensajes del plan ${tier}. Actualiza tu plan para continuar.` },
          { status: 429 }
        )
      }
    }
  } catch { /* non-blocking — proceed even if tier check fails */ }

  void TIER_LIMITS

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM,
    messages,
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
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.resetAt),
      },
    }
  )
}
