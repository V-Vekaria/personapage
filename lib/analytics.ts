import type { Link, LinkView } from '@/types/database'

export interface DayBucket {
  /** YYYY-MM-DD in UTC. */
  date: string
  count: number
}

export interface NamedCount {
  name: string
  count: number
}

export interface LinkStats {
  link: Link
  total: number
  last7: number
}

export interface AnalyticsSummary {
  total: number
  last7: number
  previous7: number
  /** Percentage change week over week, or null when there is no baseline. */
  trend: number | null
  byDay: DayBucket[]
  perLink: LinkStats[]
  referrers: NamedCount[]
  devices: NamedCount[]
  busiestDay: DayBucket | null
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000)
}

/**
 * Collapses a referrer URL to something a human wants to read in a table.
 * Anything unparseable is treated as direct rather than shown raw, since a
 * malformed referrer tells the reader nothing.
 */
export function referrerLabel(referrer: string | null): string {
  if (!referrer) return 'Direct'
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (!host) return 'Direct'
    if (host.includes('linkedin')) return 'LinkedIn'
    if (host === 't.co' || host.includes('twitter') || host.includes('x.com')) return 'X / Twitter'
    if (host.includes('github')) return 'GitHub'
    if (host.includes('google')) return 'Google'
    if (host.includes('instagram')) return 'Instagram'
    if (host.includes('facebook')) return 'Facebook'
    if (host.includes('reddit')) return 'Reddit'
    return host
  } catch {
    return 'Direct'
  }
}

function tally(values: string[]): NamedCount[] {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Turns raw view rows into everything the analytics page renders.
 *
 * Pure on purpose: `now` is injected rather than read from the clock so the
 * bucketing is testable and so server and client agree on the window.
 */
export function summarise(
  views: LinkView[],
  links: Link[],
  now: Date = new Date(),
  windowDays = 30
): AnalyticsSummary {
  const sevenDaysAgo = daysAgo(now, 7)
  const fourteenDaysAgo = daysAgo(now, 14)

  const viewsWithin = (from: Date, to?: Date) =>
    views.filter((v) => {
      const at = new Date(v.created_at)
      return at >= from && (to ? at < to : true)
    })

  const recent = viewsWithin(sevenDaysAgo)
  const previous = viewsWithin(fourteenDaysAgo, sevenDaysAgo)

  // Pre-fill every day in the window so the chart shows real gaps as gaps.
  const buckets = new Map<string, number>()
  for (let i = windowDays - 1; i >= 0; i--) {
    buckets.set(dayKey(daysAgo(now, i)), 0)
  }
  for (const view of views) {
    const key = dayKey(new Date(view.created_at))
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const byDay: DayBucket[] = [...buckets.entries()].map(([date, count]) => ({ date, count }))

  const recentByLink = new Map<string, number>()
  for (const view of recent) {
    recentByLink.set(view.link_id, (recentByLink.get(view.link_id) ?? 0) + 1)
  }
  const totalByLink = new Map<string, number>()
  for (const view of views) {
    totalByLink.set(view.link_id, (totalByLink.get(view.link_id) ?? 0) + 1)
  }

  const perLink: LinkStats[] = links
    .map((link) => ({
      link,
      total: totalByLink.get(link.id) ?? 0,
      last7: recentByLink.get(link.id) ?? 0,
    }))
    .sort((a, b) => b.total - a.total || a.link.label.localeCompare(b.link.label))

  const trend =
    previous.length === 0
      ? recent.length > 0
        ? null
        : 0
      : Math.round(((recent.length - previous.length) / previous.length) * 100)

  const busiestDay = byDay.reduce<DayBucket | null>(
    (best, day) => (day.count > 0 && (!best || day.count > best.count) ? day : best),
    null
  )

  return {
    total: views.length,
    last7: recent.length,
    previous7: previous.length,
    trend,
    byDay,
    perLink,
    referrers: tally(views.map((v) => referrerLabel(v.referrer))).slice(0, 8),
    devices: tally(views.map((v) => (v.device === 'mobile' ? 'Mobile' : 'Desktop'))),
    busiestDay,
  }
}
