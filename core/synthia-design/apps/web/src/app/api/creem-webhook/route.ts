import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { simpleTokenEqual } from './verify'

const PLEDGE_PCT = 0.02

export async function POST(req: NextRequest) {
  const secret = process.env.CREEM_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const sig = req.headers.get('creem-signature') || ''
  if (!simpleTokenEqual(sig, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as {
    event: string
    data: {
      amount: number
      customer_email: string
      product_id: string
      customer_id: string
    }
  }
  const { event, data } = body

  if (event === 'payment.succeeded') {
    const amountCents: number = data.amount
    const pledgeCents = Math.floor(amountCents * PLEDGE_PCT)

    const tierMap: Record<string, string> = {
      [process.env.CREEM_STARTER_ID || 'UNSET_STARTER']: 'starter',
      [process.env.CREEM_PRO_ID || 'UNSET_PRO']: 'pro',
      [process.env.CREEM_OPERATOR_ID || 'UNSET_OPERATOR']: 'operator',
    }
    const tier = tierMap[data.product_id] || 'starter'

    console.log(
      `[SYNTHIA PLEDGE] $${(amountCents / 100).toFixed(2)} sale → $${(pledgeCents / 100).toFixed(2)} to LATAM fund | tier: ${tier} | email: ${data.customer_email}`
    )

    try {
      const admin = adminClient()

      // Prefer matching by creem_customer_id (avoids listing all users)
      let userId: string | null = null
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('creem_customer_id', data.customer_id)
        .single()

      if (existingProfile) {
        userId = existingProfile.id as string
      } else {
        const { data: users } = await admin.auth.admin.listUsers()
        const user = users?.users?.find(u => u.email === data.customer_email)
        userId = user?.id ?? null
      }

      if (userId) {
        await admin.from('profiles').upsert({
          id: userId,
          tier,
          creem_customer_id: data.customer_id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        console.log(`[SYNTHIA] Provisioned tier "${tier}" for user ${userId}`)
      } else {
        console.warn(`[SYNTHIA] No user found for ${data.customer_email} — manual provisioning needed`)
      }
    } catch (err) {
      console.error('[CREEM WEBHOOK] Provisioning error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
