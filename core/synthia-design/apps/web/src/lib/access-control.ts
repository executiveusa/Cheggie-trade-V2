export type UserTier = 'free' | 'starter' | 'pro' | 'operator'

const TIER_LEVEL: Record<UserTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  operator: 3,
}

export function hasRequiredTier(currentTier: string | null | undefined, required: UserTier): boolean {
  const normalized = (currentTier ?? 'free') as UserTier
  const current = TIER_LEVEL[normalized] ?? TIER_LEVEL.free
  return current >= TIER_LEVEL[required]
}
