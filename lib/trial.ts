import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Trial accounting for visitors who have not signed up.
 *
 * The count lives in a signed, httpOnly cookie. Signing stops casual editing —
 * it does not stop someone clearing cookies or opening a private window, and it
 * is not meant to. The cookie is the UX layer ("2 generations left"); the IP
 * rate limit in the route is what actually caps cost. Treating a client-held
 * counter as a security boundary would be a mistake, so it isn't one.
 */

export const TRIAL_COOKIE = 'pp_trial'
export const TRIAL_LIMIT = 3
/** Long enough that a returning visitor keeps their remaining credits. */
export const TRIAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export interface TrialState {
  used: number
  /** First use, epoch ms. Kept so an old cookie can be aged out. */
  startedAt: number
}

/**
 * Signing key. Falls back to the service-role key, which is already a
 * server-only secret, so running this project needs no extra configuration.
 * Set TRIAL_SECRET if you would rather the two were not related.
 */
function secret(): string {
  return (
    process.env.TRIAL_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    // Only reached in a dev environment with nothing configured. A predictable
    // key here costs nothing, because there is nothing to protect yet.
    'personapage-development-only'
  )
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  // timingSafeEqual throws on a length mismatch, which is itself an inequality.
  return left.length === right.length && timingSafeEqual(left, right)
}

export function encodeTrial(state: TrialState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** Returns null for anything missing, malformed, forged or expired. */
export function decodeTrial(cookie: string | undefined | null): TrialState | null {
  if (!cookie) return null

  const separator = cookie.lastIndexOf('.')
  if (separator <= 0) return null

  const payload = cookie.slice(0, separator)
  const signature = cookie.slice(separator + 1)
  if (!safeEqual(signature, sign(payload))) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof parsed !== 'object' || parsed === null) return null

    const { used, startedAt } = parsed as Record<string, unknown>
    if (typeof used !== 'number' || typeof startedAt !== 'number') return null
    if (!Number.isFinite(used) || !Number.isFinite(startedAt)) return null
    if (used < 0 || startedAt <= 0) return null

    if (Date.now() - startedAt > TRIAL_MAX_AGE_SECONDS * 1000) return null

    // Clamp rather than reject: a cookie signed by an older, larger limit is
    // the visitor's good luck, not a reason to error.
    return { used: Math.min(Math.floor(used), TRIAL_LIMIT), startedAt }
  } catch {
    return null
  }
}

export function remainingTrials(state: TrialState | null): number {
  return Math.max(TRIAL_LIMIT - (state?.used ?? 0), 0)
}

/** The state to store after one generation is spent. */
export function spendTrial(state: TrialState | null, now = Date.now()): TrialState {
  return state
    ? { used: state.used + 1, startedAt: state.startedAt }
    : { used: 1, startedAt: now }
}
