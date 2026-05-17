import { NextRequest, NextResponse } from 'next/server'
import { SynthiaMediaClient } from '@/lib/muapi-client'
import { checkLimit, recordGeneration } from '@/lib/tier'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const VIDEO_TOOLS = new Set(['video', 'lipsync'])

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    tool: string
    params: Record<string, unknown>
    muapiKey?: string
  }
  const { tool, params, muapiKey } = body

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'
  const rl = rateLimit(`${ip}:generate`, RATE_LIMITS.generate.maxRequests, RATE_LIMITS.generate.windowMs)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Demasiadas solicitudes. Intenta en un momento.', retry_after_ms: rl.resetAt - Date.now() },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rl.resetAt) } }
    )
  }

  // Identify user for metering
  let userId: string | null = null
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch { /* anon allowed — metering skipped */ }

  // Check usage limits for authenticated users
  if (userId) {
    const resource = VIDEO_TOOLS.has(tool) ? 'videos_per_month' : 'images_per_month'
    const limit = await checkLimit(userId, resource)
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: `Alcanzaste tu límite de ${resource === 'videos_per_month' ? 'videos' : 'imágenes'} este mes (${limit.used}/${limit.limit}). Actualiza tu plan para continuar.`,
          used: limit.used,
          limit: limit.limit,
          tier: limit.tier,
        },
        { status: 429 }
      )
    }
  }

  const key = muapiKey || process.env.MUAPI_DEFAULT_KEY || ''
  if (!key) {
    return NextResponse.json(
      { error: 'no_key', message: 'No tienes una llave de muapi configurada. Ve a Configuración para agregar una.' },
      { status: 400 }
    )
  }

  const client = new SynthiaMediaClient(key)
  let resultUrl: string

  try {
    switch (tool) {
      case 'image':
        resultUrl = await client.image(params as Parameters<typeof client.image>[0])
        break
      case 'video':
        resultUrl = await client.video(params as Parameters<typeof client.video>[0])
        break
      case 'cinema':
        resultUrl = await client.cinema(params as Parameters<typeof client.cinema>[0])
        break
      case 'marketing':
        resultUrl = await client.marketing(params as Parameters<typeof client.marketing>[0])
        break
      case 'lipsync':
        resultUrl = await client.lipSync(params.video_url as string, params.audio_url as string)
        break
      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
    }

    // Record generation for usage metering
    if (userId) {
      await recordGeneration({
        userId,
        tool,
        prompt: (params.prompt as string) || undefined,
        resultUrl,
        model: (params.model as string) || undefined,
      })
    }

    return NextResponse.json({ result_url: resultUrl, tool })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json(
      { error: 'generation_failed', message: `No pude generar el contenido. ${msg}. Verifica tu llave de muapi en Configuración.` },
      { status: 500 }
    )
  }
}
