import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppClient } from '@/lib/whatsapp/client'
import { handleWhatsAppMessage } from '@/lib/whatsapp/dispatch'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{
              id: string
              from: string
              text?: { body: string }
              type: string
            }>
          }
        }>
      }>
    }

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message || message.type !== 'text' || !message.text?.body) {
      return NextResponse.json({ ok: true })
    }

    const from = message.from
    const text = message.text.body

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    const token = process.env.WHATSAPP_ACCESS_TOKEN || ''

    if (!phoneNumberId || !token) {
      console.warn('[WhatsApp] Missing phone number ID or token')
      return NextResponse.json({ ok: true })
    }

    const client = new WhatsAppClient(phoneNumberId, token)
    const response = await handleWhatsAppMessage(from, text)

    if (response.type === 'image') {
      await client.sendImage(from, response.content, response.caption)
    } else {
      await client.sendText(from, response.content)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WhatsApp webhook error]', err)
    return NextResponse.json({ ok: true })
  }
}
