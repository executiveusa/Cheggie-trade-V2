interface WindowEntry {
  timestamps: number[]
  lastCleanup: number
}

const windows = new Map<string, WindowEntry>()

const CLEANUP_INTERVAL = 60_000

function cleanup(key: string, windowMs: number, now: number) {
  const entry = windows.get(key)
  if (!entry) return
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)
  entry.lastCleanup = now
  if (entry.timestamps.length === 0) windows.delete(key)
}

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  let entry = windows.get(key)

  if (!entry) {
    entry = { timestamps: [], lastCleanup: now }
    windows.set(key, entry)
  }

  if (now - entry.lastCleanup > CLEANUP_INTERVAL) {
    cleanup(key, windowMs, now)
    entry = windows.get(key) ?? { timestamps: [], lastCleanup: now }
    if (!windows.has(key)) windows.set(key, entry)
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  const resetAt = entry.timestamps.length > 0
    ? entry.timestamps[0] + windowMs
    : now + windowMs

  if (entry.timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAt,
  }
}

export const RATE_LIMITS = {
  chat:          { maxRequests: 20, windowMs: 60_000 },
  generate:      { maxRequests: 10, windowMs: 60_000 },
  visual_reason: { maxRequests: 5,  windowMs: 60_000 },
  udec_audit:    { maxRequests: 10, windowMs: 60_000 },
} as const
