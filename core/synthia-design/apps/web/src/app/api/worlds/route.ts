/**
 * 3D World Generation API
 * Supports: tencent/HY-WorldPlay (HuggingFace Inference API)
 *
 * GET  /api/worlds        — connection test for all providers
 * POST /api/worlds        — generate a 3D world from image + prompt
 */

import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY ?? ''
const HY_WORLDPLAY_MODEL = 'tencent/HY-WorldPlay'
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co/models'

interface WorldGenRequest {
  provider: 'hy-worldplay' | 'lyra'
  prompt: string
  imageUrl?: string          // base64 data URI or URL
  imageBase64?: string       // raw base64 PNG/JPG
  trajectory?: 'orbit' | 'dolly' | 'flythrough'
  numFrames?: number
  width?: number
  height?: number
}

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test HY-WorldPlay (HuggingFace)
  if (HF_TOKEN) {
    try {
      const r = await fetch(`${HF_INFERENCE_BASE}/${HY_WORLDPLAY_MODEL}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        signal: AbortSignal.timeout(8000),
      })
      const body = await r.json().catch(() => ({}))
      results['hy-worldplay'] = {
        ok: r.status !== 401 && r.status !== 403,
        status: r.status,
        model: HY_WORLDPLAY_MODEL,
        provider: 'huggingface',
        detail: body,
      }
    } catch (e) {
      results['hy-worldplay'] = { ok: false, error: String(e), model: HY_WORLDPLAY_MODEL }
    }
  } else {
    results['hy-worldplay'] = { ok: false, error: 'HF_TOKEN not set', model: HY_WORLDPLAY_MODEL }
  }

  // Lyra is a local pipeline — always report config status
  results['lyra'] = {
    ok: true,
    provider: 'local-pipeline',
    note: 'NVIDIA Lyra runs locally — see studio/doctrine/3d-world-SKILL.md for setup',
    repo: 'https://github.com/nv-tlabs/lyra',
  }

  const allOk = Object.values(results).some((r: any) => r.ok)
  return NextResponse.json({ status: allOk ? 'ok' : 'degraded', providers: results })
}

export async function POST(req: NextRequest) {
  let body: WorldGenRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { provider = 'hy-worldplay', prompt, imageBase64, imageUrl } = body

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  if (provider === 'hy-worldplay') {
    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: 'HF_TOKEN environment variable is required for HY-WorldPlay' },
        { status: 503 }
      )
    }

    // HuggingFace Inference API — image-to-video (3D world output)
    // HY-WorldPlay accepts inputs via the standard HF Inference format
    const payload: Record<string, unknown> = { inputs: prompt }

    if (imageBase64) {
      // Pass image as base64 in inputs
      payload.inputs = { image: imageBase64, prompt }
    } else if (imageUrl) {
      payload.inputs = { image: imageUrl, prompt }
    }

    const hfRes = await fetch(`${HF_INFERENCE_BASE}/${HY_WORLDPLAY_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120_000), // 2min — model can be cold
    })

    if (!hfRes.ok) {
      const err = await hfRes.json().catch(() => ({ message: hfRes.statusText }))
      return NextResponse.json(
        { error: 'HY-WorldPlay API error', detail: err, status: hfRes.status },
        { status: hfRes.status }
      )
    }

    // Response is binary video/3D data — return as base64
    const contentType = hfRes.headers.get('content-type') ?? 'application/octet-stream'
    const buffer = await hfRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    return NextResponse.json({
      provider: 'hy-worldplay',
      model: HY_WORLDPLAY_MODEL,
      contentType,
      outputBase64: base64,
      outputDataUrl: `data:${contentType};base64,${base64}`,
      prompt,
    })
  }

  if (provider === 'lyra') {
    return NextResponse.json({
      provider: 'lyra',
      note: 'Lyra runs as a local Python pipeline — not callable via this API endpoint.',
      instructions: 'See studio/doctrine/3d-world-SKILL.md for the full 4-stage CLI pipeline.',
      repo: 'https://github.com/nv-tlabs/lyra',
      prompt,
    })
  }

  return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
}
