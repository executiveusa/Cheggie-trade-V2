import { NextRequest, NextResponse } from 'next/server'

interface AuditRequest {
  url: string
  name?: string
  email?: string
}

function isValidUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  let body: AuditRequest

  try {
    body = (await req.json()) as AuditRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { url, name, email } = body

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Please enter a valid URL (must start with http:// or https://)' }, { status: 400 })
  }

  // Sanitise optional fields
  const safeName = typeof name === 'string' ? name.slice(0, 200) : undefined
  const safeEmail = typeof email === 'string' ? email.slice(0, 200) : undefined

  // Log the audit request (replace with CRM / email integration as needed)
  console.log('[audit-request]', {
    url,
    name: safeName,
    email: safeEmail,
    ts: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true }, { status: 200 })
}
