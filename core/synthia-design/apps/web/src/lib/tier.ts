import { createServerSupabaseClient } from '@/lib/supabase/server'

export type Tier = 'free' | 'starter' | 'pro' | 'operator'

export const TIER_LIMITS = {
  free:     { images_per_month: 5,        videos_per_month: 0,        brain_entries: 50        },
  starter:  { images_per_month: 100,      videos_per_month: 10,       brain_entries: 500       },
  pro:      { images_per_month: 500,      videos_per_month: 50,       brain_entries: 5000      },
  operator: { images_per_month: Infinity, videos_per_month: Infinity, brain_entries: Infinity  },
} as const satisfies Record<Tier, { images_per_month: number; videos_per_month: number; brain_entries: number }>

type Resource = 'images_per_month' | 'videos_per_month'

export async function getTier(userId: string): Promise<Tier> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single()
    return (data?.tier as Tier) || 'free'
  } catch {
    return 'free'
  }
}

export async function checkLimit(
  userId: string,
  resource: Resource
): Promise<{ allowed: boolean; used: number; limit: number; tier: Tier }> {
  const tier = await getTier(userId)
  const limit = TIER_LIMITS[tier][resource]

  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, tier }
  }

  const supabase = await createServerSupabaseClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const studioFilter = resource === 'images_per_month'
    ? ['image', 'cinema', 'marketing']
    : ['video', 'lipsync']

  const { count } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('studio', studioFilter)
    .gte('created_at', startOfMonth.toISOString())

  const used = count ?? 0
  return { allowed: used < limit, used, limit, tier }
}

export async function recordGeneration(params: {
  userId: string
  tool: string
  prompt?: string
  resultUrl: string
  model?: string
}) {
  const supabase = await createServerSupabaseClient()
  await supabase.from('generations').insert({
    user_id: params.userId,
    studio: params.tool,
    model: params.model,
    prompt: params.prompt,
    result_url: params.resultUrl,
  })
}
