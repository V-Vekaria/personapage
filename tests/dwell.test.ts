import { describe, expect, it } from 'vitest'
import {
  DWELL_CAP_MS,
  DwellTimer,
  MIN_REPORTABLE_DWELL_MS,
  formatReadTime,
  shouldReport,
} from '@/lib/dwell'
import { dwellRequestSchema } from '@/lib/validation'
import { summarise } from '@/lib/analytics'
import type { Link, LinkView } from '@/types/database'

const NOW = new Date('2026-03-20T12:00:00.000Z')
const VIEW_ID = '11111111-1111-4111-8111-111111111111'

function link(id: string): Link {
  return {
    id,
    user_id: 'user-1',
    context: 'networking',
    label: id,
    slug: `slug-${id}`,
    generated_content: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

function view(linkId: string, dwellMs: number | null): LinkView {
  return {
    id: `${linkId}-${Math.random()}`,
    link_id: linkId,
    referrer: null,
    country: null,
    device: 'desktop',
    dwell_ms: dwellMs,
    created_at: new Date(NOW.getTime() - 86_400_000).toISOString(),
  }
}

describe('formatReadTime', () => {
  it('reads out loud the way a person would say it', () => {
    expect(formatReadTime(0)).toBe('0s')
    expect(formatReadTime(8_400)).toBe('8s')
    expect(formatReadTime(59_400)).toBe('59s')
    expect(formatReadTime(60_000)).toBe('1m')
    expect(formatReadTime(80_000)).toBe('1m 20s')
    expect(formatReadTime(180_000)).toBe('3m')
  })

  it('drops seconds past ten minutes rather than implying that precision', () => {
    expect(formatReadTime(632_000)).toBe('10m')
    expect(formatReadTime(DWELL_CAP_MS)).toBe('30m')
  })

  it('never renders a bare zero-second remainder', () => {
    // "3m 0s" reads as a bug rather than a round number.
    for (let ms = 60_000; ms <= 600_000; ms += 1_000) {
      expect(formatReadTime(ms)).not.toMatch(/ 0s$/)
    }
  })
})

describe('dwellRequestSchema', () => {
  it('accepts a plain report', () => {
    expect(dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: 42_000 }).success).toBe(true)
  })

  it('rejects anything that is not a view id', () => {
    expect(dwellRequestSchema.safeParse({ view_id: 'not-a-uuid', ms: 1000 }).success).toBe(false)
    expect(dwellRequestSchema.safeParse({ ms: 1000 }).success).toBe(false)
  })

  it('rejects impossible durations rather than storing them', () => {
    expect(dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: -1 }).success).toBe(false)
    expect(dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: 1.5 }).success).toBe(false)
    expect(dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: '60000' }).success).toBe(false)
    // Past a day is nonsense, not a long read.
    expect(dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: 86_400_001 }).success).toBe(false)
  })

  it('accepts values above the cap so the route can clamp them', () => {
    // A skewed clock should cost one capped row, not a rejected measurement.
    const parsed = dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: DWELL_CAP_MS + 60_000 })
    expect(parsed.success).toBe(true)
    expect(Math.min(parsed.data!.ms, DWELL_CAP_MS)).toBe(DWELL_CAP_MS)
  })

  it('keeps the smallest reportable read', () => {
    expect(
      dwellRequestSchema.safeParse({ view_id: VIEW_ID, ms: MIN_REPORTABLE_DWELL_MS }).success
    ).toBe(true)
  })
})

describe('summarise read times', () => {
  it('takes the middle value, not the mean, so one long tab cannot dominate', () => {
    const views = [
      view('a', 10_000),
      view('a', 20_000),
      view('a', 30_000),
      view('a', 40_000),
      view('a', DWELL_CAP_MS),
    ]
    const stats = summarise(views, [link('a')], NOW)

    // The mean here is 6m 12s, which describes none of these five visits.
    expect(stats.medianDwellMs).toBe(30_000)
    expect(formatReadTime(stats.medianDwellMs!)).toBe('30s')
  })

  it('averages the two middle values on an even sample', () => {
    const stats = summarise([view('a', 10_000), view('a', 30_000)], [link('a')], NOW)
    expect(stats.medianDwellMs).toBe(20_000)
  })

  it('leaves unmeasured views out of the sample instead of counting them as zero', () => {
    const views = [view('a', null), view('a', null), view('a', 60_000)]
    const stats = summarise(views, [link('a')], NOW)

    expect(stats.total).toBe(3)
    expect(stats.readSamples).toBe(1)
    // Counting the two nulls as zero would report 0s and claim nobody read it.
    expect(stats.medianDwellMs).toBe(60_000)
  })

  it('reports null rather than zero when nothing has been measured', () => {
    const stats = summarise([view('a', null)], [link('a')], NOW)
    expect(stats.medianDwellMs).toBeNull()
    expect(stats.readSamples).toBe(0)
    expect(stats.perLink[0].medianDwellMs).toBeNull()
  })

  it('keeps each link’s read times to itself', () => {
    const views = [view('a', 10_000), view('b', 200_000), view('b', 200_000)]
    const stats = summarise(views, [link('a'), link('b')], NOW)
    const byId = new Map(stats.perLink.map((s) => [s.link.id, s]))

    expect(byId.get('a')!.medianDwellMs).toBe(10_000)
    expect(byId.get('a')!.readSamples).toBe(1)
    expect(byId.get('b')!.medianDwellMs).toBe(200_000)
    expect(byId.get('b')!.readSamples).toBe(2)
  })

  it('ignores a negative duration rather than dragging the median below zero', () => {
    const stats = summarise([view('a', -5_000), view('a', 30_000)], [link('a')], NOW)
    expect(stats.readSamples).toBe(1)
    expect(stats.medianDwellMs).toBe(30_000)
  })
})

describe('DwellTimer', () => {
  const T0 = 1_000_000

  it('counts time while the tab is visible', () => {
    const timer = new DwellTimer(true, T0)
    expect(timer.elapsed(T0 + 30_000)).toBe(30_000)
  })

  it('stops counting the moment the tab is hidden', () => {
    const timer = new DwellTimer(true, T0)
    timer.hide(T0 + 10_000)

    // An hour passes in a background tab and the total does not move.
    expect(timer.elapsed(T0 + 3_600_000)).toBe(10_000)
  })

  it('resumes without crediting the time spent hidden', () => {
    const timer = new DwellTimer(true, T0)
    timer.hide(T0 + 10_000)
    timer.show(T0 + 3_600_000)

    // Ten seconds read, an hour in the background, five more seconds read.
    expect(timer.elapsed(T0 + 3_605_000)).toBe(15_000)
  })

  it('does not start counting for a tab that was never visible', () => {
    const timer = new DwellTimer(false, T0)
    expect(timer.elapsed(T0 + 60_000)).toBe(0)
  })

  it('ignores a repeated show rather than restarting the clock', () => {
    const timer = new DwellTimer(true, T0)
    // Some browsers fire visibilitychange more than once for one transition.
    timer.show(T0 + 20_000)
    expect(timer.elapsed(T0 + 30_000)).toBe(30_000)
  })

  it('ignores a repeated hide rather than banking the gap twice', () => {
    const timer = new DwellTimer(true, T0)
    timer.hide(T0 + 10_000)
    timer.hide(T0 + 50_000)
    expect(timer.elapsed(T0 + 60_000)).toBe(10_000)
  })

  it('caps a genuinely endless visit', () => {
    const timer = new DwellTimer(true, T0)
    expect(timer.elapsed(T0 + 86_400_000)).toBe(DWELL_CAP_MS)
  })

  it('survives the system clock stepping backwards', () => {
    const timer = new DwellTimer(true, T0)
    // NTP corrects the clock mid-visit. A negative segment would shorten the
    // total; it must be floored instead.
    expect(timer.elapsed(T0 - 5_000)).toBe(0)
    timer.hide(T0 - 5_000)
    timer.show(T0)
    expect(timer.elapsed(T0 + 12_000)).toBe(12_000)
  })
})

describe('shouldReport', () => {
  it('stays quiet for a visit too short to mean anything', () => {
    expect(shouldReport(0, 0)).toBe(false)
    expect(shouldReport(999, 0)).toBe(false)
    expect(shouldReport(MIN_REPORTABLE_DWELL_MS, 0)).toBe(true)
  })

  it('sends one beacon per visit, not two', () => {
    // Navigating away fires visibilitychange and pagehide about a millisecond
    // apart. Both call report; only the first may send.
    const first = 2507
    expect(shouldReport(first, 0)).toBe(true)
    expect(shouldReport(first + 1, first)).toBe(false)
  })

  it('still counts a visitor who comes back and reads more', () => {
    expect(shouldReport(30_000, 2_000)).toBe(true)
  })

  it('needs a whole further second before speaking again', () => {
    expect(shouldReport(2_999, 2_000)).toBe(false)
    expect(shouldReport(3_000, 2_000)).toBe(true)
  })

  it('never re-sends a number that went backwards', () => {
    // The timer is capped, so repeated reports at the cap must go quiet.
    expect(shouldReport(DWELL_CAP_MS, DWELL_CAP_MS)).toBe(false)
  })
})
