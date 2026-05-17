/**
 * Video Generation API
 * Supports: ByteDance Seedance 1.0 via Replicate API
 *
 * GET  /api/video         — connection test
 * POST /api/video         — generate video from text or image+text
 */

import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? ''

// ByteDance Seedance 1.0 on Replicate
// https://replicate.com/bytedance/seedance-1-0
const SEEDANCE_MODEL = 'bytedance/seedance-1-0'
const REPLICATE_BASE = 'https://api.replicate.com/v1'

interface VideoGenRequest {
  provider?: 'seedance'
  prompt: string
  imageUrl?: string          // optional starting image for image-to-video
  duration?: number          // seconds (3 or 5 for Seedance 1.0)
  resolution?: '480p' | '720p' | '1080p'
  aspectRatio?: '16:9' | '9:16' | '1:1'
  motionMode?: 'normal' | 'fast'
  seed?: number
}

async function replicatePredict(model: string, input: Record<string, unknown>) {
  const createRes = await fetch(`${REPLICATE_BASE}/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',   // wait up to 60s for result inline
    },
    body: JSON.stringify({ input }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({ detail: createRes.statusText }))
    throw { status: createRes.status, detail: err }
  }

  return createRes.json()
}

export async function GET() {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({
      status: 'not_configured',
      provider: 'replicate',
      model: SEEDANCE_MODEL,
      error: 'REPLICATE_API_TOKEN environment variable is not set',
      setup: 'Get your token at https://replicate.com/account/api-tokens',
    }, { status: 503 })
  }

  // Test Replicate connectivity — fetch model metadata
  try {
    const r = await fetch(`${REPLICATE_BASE}/models/${SEEDANCE_MODEL}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      signal: AbortSignal.timeout(8000),
    })

    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return NextResponse.json({
        status: 'error',
        provider: 'replicate',
        model: SEEDANCE_MODEL,
        httpStatus: r.status,
        detail: err,
      }, { status: r.status })
    }

    const meta = await r.json()
    return NextResponse.json({
      status: 'ok',
      provider: 'replicate',
      model: SEEDANCE_MODEL,
      modelName: meta.name ?? SEEDANCE_MODEL,
      description: meta.description ?? 'ByteDance Seedance 1.0 — cinematic text-to-video & image-to-video',
      latestVersion: meta.latest_version?.id ?? null,
      visibility: meta.visibility ?? 'public',
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      provider: 'replicate',
      model: SEEDANCE_MODEL,
      error: String(e?.message ?? e),
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: VideoGenRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    prompt,
    imageUrl,
    duration = 5,
    resolution = '720p',
    aspectRatio = '16:9',
    motionMode = 'normal',
    seed,
  } = body

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'REPLICATE_API_TOKEN is not configured' },
      { status: 503 }
    )
  }

  // Build Seedance 1.0 input
  // Docs: https://replicate.com/bytedance/seedance-1-0
  const input: Record<string, unknown> = {
    prompt,
    duration,
    resolution,
    aspect_ratio: aspectRatio,
    motion_mode: motionMode,
  }

  if (imageUrl) {
    input.image = imageUrl  // image-to-video mode
  }
  if (seed !== undefined) {
    input.seed = seed
  }

  try {
    const prediction = await replicatePredict(SEEDANCE_MODEL, input)

    return NextResponse.json({
      provider: 'replicate',
      model: SEEDANCE_MODEL,
      predictionId: prediction.id,
      status: prediction.status,
      // If prediction completed inline (Prefer: wait)
      outputUrl: prediction.output ?? null,
      urls: prediction.urls ?? null,
      logs: prediction.logs ?? null,
      prompt,
      input,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Seedance generation failed', detail: e?.detail ?? String(e) },
      { status: e?.status ?? 500 }
    )
  }
}
