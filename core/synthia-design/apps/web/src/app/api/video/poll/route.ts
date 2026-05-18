/**
 * Poll a Replicate prediction by ID.
 * GET /api/video/poll?id=<predictionId>
 */

import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? ''

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN not configured' }, { status: 503 })
  }

  const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    signal: AbortSignal.timeout(10_000),
  })

  if (!r.ok) {
    return NextResponse.json({ error: 'Replicate API error', status: r.status }, { status: r.status })
  }

  const data = await r.json()
  return NextResponse.json({
    predictionId: data.id,
    status: data.status,
    outputUrl: data.output?.[0] ?? data.output ?? null,
    output: data.output,
    logs: data.logs,
    error: data.error,
    createdAt: data.created_at,
    completedAt: data.completed_at,
  })
}
