import { beforeEach, describe, expect, it } from 'vitest'
import { rateLimit, resetRateLimits } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(resetRateLimits)

  it('allows up to the limit', () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit('k', 3, 60_000).allowed).toBe(true)
    }
  })

  it('blocks the call after the limit', () => {
    for (let i = 0; i < 3; i++) rateLimit('k', 3, 60_000)
    const result = rateLimit('k', 3, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('counts each key separately, so one user cannot block another', () => {
    for (let i = 0; i < 3; i++) rateLimit('user-a', 3, 60_000)
    expect(rateLimit('user-a', 3, 60_000).allowed).toBe(false)
    expect(rateLimit('user-b', 3, 60_000).allowed).toBe(true)
  })

  it('reports the remaining budget', () => {
    expect(rateLimit('k', 3, 60_000).remaining).toBe(2)
    expect(rateLimit('k', 3, 60_000).remaining).toBe(1)
  })

  it('starts a fresh window once the old one expires', async () => {
    expect(rateLimit('k', 1, 1).allowed).toBe(true)
    expect(rateLimit('k', 1, 1).allowed).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(rateLimit('k', 1, 1).allowed).toBe(true)
  })
})
