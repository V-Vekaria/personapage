/**
 * Read time — the shared constants, kept apart from lib/validation.ts so the
 * public profile page can import the cap without pulling zod into the browser
 * bundle for one number.
 */

/**
 * The ceiling on a single reported read time, in milliseconds.
 *
 * The number comes from the visitor's own browser, so it needs a ceiling or one
 * crafted request could claim a view lasted a year and poison every median
 * built on the column. Thirty minutes is far longer than anyone spends on a
 * one-screen profile, so no real read is clipped by it. The same bound is a
 * CHECK constraint in 0005_link_dwell.sql — this is the friendly half of it.
 */
export const DWELL_CAP_MS = 1_800_000

/** Below this, a reported number is noise rather than a read. */
export const MIN_REPORTABLE_DWELL_MS = 1000

/**
 * Milliseconds as a person would say them out loud: "8s", "1m 20s", "4m".
 *
 * Seconds are dropped past ten minutes because at that length they are false
 * precision, and dropped when they are zero because "3m 0s" reads as broken.
 */
export function formatReadTime(ms: number): string {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  if (minutes >= 10 || remainder === 0) return `${minutes}m`
  return `${minutes}m ${remainder}s`
}

/**
 * Whether a read time is worth sending, given what was already sent.
 *
 * Both halves of this earn their place, and the second was found by driving a
 * real browser rather than by reading the code: navigating away fires
 * `visibilitychange` and then `pagehide` about a millisecond apart, so a naive
 * "send anything larger than last time" sends two beacons and does two database
 * writes for every single visit. Requiring a further whole second of reading
 * collapses that pair into one, while still letting a visitor who comes back
 * and reads more be counted.
 *
 * With `alreadyReported` starting at zero, the same condition is the floor for
 * the first report: a visit too short to mean anything is never sent at all.
 */
export function shouldReport(ms: number, alreadyReported: number): boolean {
  return ms >= alreadyReported + MIN_REPORTABLE_DWELL_MS
}

/**
 * Visible-time bookkeeping for one page visit.
 *
 * Lives here, apart from the component that drives it, because this is the part
 * most likely to be wrong and the part a browser is needed to exercise. Pulled
 * out, it is ordinary arithmetic with `now` passed in, so every case below can
 * be tested without a browser at all.
 *
 * Only visible time counts. A page left open in a background tab overnight must
 * not report eight hours, and capping alone would still report thirty minutes.
 */
export class DwellTimer {
  private accumulated = 0
  private visibleSince: number | null

  constructor(visible: boolean, now: number) {
    this.visibleSince = visible ? now : null
  }

  /** The tab went away. Bank what was visible and stop the clock. */
  hide(now: number): void {
    if (this.visibleSince === null) return
    // Date.now() can step backwards when the system clock is corrected. A
    // negative segment would silently shorten the total, so floor it.
    this.accumulated += Math.max(now - this.visibleSince, 0)
    this.visibleSince = null
  }

  /** The tab came back. Start the clock again, without double-counting. */
  show(now: number): void {
    if (this.visibleSince === null) this.visibleSince = now
  }

  /** Total visible milliseconds so far, capped. */
  elapsed(now: number): number {
    const live = this.visibleSince === null ? 0 : Math.max(now - this.visibleSince, 0)
    return Math.min(this.accumulated + live, DWELL_CAP_MS)
  }
}
