/**
 * A small fixed-window limiter, in memory.
 *
 * Deliberately not distributed: on serverless this counts per instance, so a
 * determined caller spread across cold starts gets more than `limit`. It exists
 * to stop one signed-in user holding down the generate button and running up an
 * OpenAI bill, which is the actual failure mode here. If this ever needs to be
 * airtight, move the counter into Postgres or Upstash — the call site does not
 * change.
 */

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** Seconds until the window resets. */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  existing.count += 1
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000)

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: limit - existing.count, retryAfter }
}

/** Test helper — drops all counters. */
export function resetRateLimits(): void {
  windows.clear()
}
