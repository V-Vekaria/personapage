import { describe, expect, it } from 'vitest'
import {
  decodeTrial,
  encodeTrial,
  remainingTrials,
  spendTrial,
  TRIAL_LIMIT,
  TRIAL_MAX_AGE_SECONDS,
} from '@/lib/trial'

describe('trial cookie', () => {
  it('round-trips a state', () => {
    const state = { used: 2, startedAt: Date.now() }
    expect(decodeTrial(encodeTrial(state))).toEqual(state)
  })

  it('returns null for a missing cookie', () => {
    expect(decodeTrial(undefined)).toBeNull()
    expect(decodeTrial(null)).toBeNull()
    expect(decodeTrial('')).toBeNull()
  })

  it('returns null for a cookie with no signature', () => {
    expect(decodeTrial('eyJ1c2VkIjowfQ')).toBeNull()
  })

  it('rejects a tampered payload', () => {
    const encoded = encodeTrial({ used: 3, startedAt: Date.now() })
    const [, signature] = encoded.split('.')
    // Someone editing the count to get their credits back.
    const forgedPayload = Buffer.from(JSON.stringify({ used: 0, startedAt: Date.now() })).toString(
      'base64url'
    )
    expect(decodeTrial(`${forgedPayload}.${signature}`)).toBeNull()
  })

  it('rejects a tampered signature', () => {
    const encoded = encodeTrial({ used: 1, startedAt: Date.now() })
    const [payload] = encoded.split('.')
    expect(decodeTrial(`${payload}.notavalidsignature`)).toBeNull()
  })

  it('rejects an unsigned but well-formed payload', () => {
    const payload = Buffer.from(JSON.stringify({ used: 0, startedAt: Date.now() })).toString(
      'base64url'
    )
    expect(decodeTrial(payload)).toBeNull()
  })

  it('rejects a cookie older than the maximum age', () => {
    const stale = { used: 1, startedAt: Date.now() - (TRIAL_MAX_AGE_SECONDS + 60) * 1000 }
    expect(decodeTrial(encodeTrial(stale))).toBeNull()
  })

  it('rejects a payload missing required fields', () => {
    const payload = Buffer.from(JSON.stringify({ used: 1 })).toString('base64url')
    // Sign it properly so only the shape is wrong.
    const signed = encodeTrial({ used: 1, startedAt: Date.now() })
    const [, signature] = signed.split('.')
    expect(decodeTrial(`${payload}.${signature}`)).toBeNull()
  })

  it('rejects a negative count rather than granting extra credits', () => {
    expect(decodeTrial(encodeTrial({ used: -5, startedAt: Date.now() }))).toBeNull()
  })

  it('clamps a count above the limit instead of erroring', () => {
    const decoded = decodeTrial(encodeTrial({ used: 99, startedAt: Date.now() }))
    expect(decoded?.used).toBe(TRIAL_LIMIT)
  })
})

describe('a rejected cookie', () => {
  /**
   * Worth stating outright: rejecting a cookie hands the visitor a full
   * allowance, not an empty one, because a rejected cookie is indistinguishable
   * from a first visit. Clearing cookies therefore resets the trial. That is
   * accepted — the cookie is the UX counter, and the per-IP rate limit in
   * app/api/ai/try/route.ts is what actually bounds cost.
   */
  it('is treated as a first visit, not as an exhausted one', () => {
    expect(remainingTrials(decodeTrial('garbage.signature'))).toBe(TRIAL_LIMIT)
  })
})

describe('remainingTrials', () => {
  it('gives a new visitor the full allowance', () => {
    expect(remainingTrials(null)).toBe(TRIAL_LIMIT)
  })

  it('counts down', () => {
    expect(remainingTrials({ used: 1, startedAt: Date.now() })).toBe(TRIAL_LIMIT - 1)
  })

  it('never goes below zero', () => {
    expect(remainingTrials({ used: TRIAL_LIMIT + 10, startedAt: Date.now() })).toBe(0)
  })
})

describe('spendTrial', () => {
  it('starts a window on first use', () => {
    const now = 1_700_000_000_000
    expect(spendTrial(null, now)).toEqual({ used: 1, startedAt: now })
  })

  it('increments without moving the start, so the window cannot be extended by using it', () => {
    const startedAt = 1_700_000_000_000
    const next = spendTrial({ used: 1, startedAt }, startedAt + 500_000)
    expect(next).toEqual({ used: 2, startedAt })
  })

  it('exhausts the allowance after exactly TRIAL_LIMIT uses', () => {
    let state = spendTrial(null)
    for (let i = 1; i < TRIAL_LIMIT; i++) state = spendTrial(state)
    expect(remainingTrials(state)).toBe(0)
  })
})
