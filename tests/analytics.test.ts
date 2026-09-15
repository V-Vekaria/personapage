import { describe, expect, it } from 'vitest'
import { referrerLabel, summarise } from '@/lib/analytics'
import type { Link, LinkView } from '@/types/database'

const NOW = new Date('2026-03-20T12:00:00.000Z')

function link(id: string, overrides: Partial<Link> = {}): Link {
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
    ...overrides,
  }
}

function view(linkId: string, daysAgo: number, overrides: Partial<LinkView> = {}): LinkView {
  return {
    id: `${linkId}-${daysAgo}-${Math.random()}`,
    link_id: linkId,
    referrer: null,
    country: null,
    device: 'desktop',
    created_at: new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString(),
    ...overrides,
  }
}

describe('referrerLabel', () => {
  it('reports a missing referrer as direct', () => {
    expect(referrerLabel(null)).toBe('Direct')
  })

  it('names the well-known sources', () => {
    expect(referrerLabel('https://www.linkedin.com/feed')).toBe('LinkedIn')
    expect(referrerLabel('https://t.co/abc')).toBe('X / Twitter')
    expect(referrerLabel('https://github.com/x')).toBe('GitHub')
  })

  it('falls back to the bare hostname', () => {
    expect(referrerLabel('https://www.example.org/a/b')).toBe('example.org')
  })

  it('treats an unparseable referrer as direct rather than showing junk', () => {
    expect(referrerLabel('not a url')).toBe('Direct')
  })
})

describe('summarise', () => {
  it('reports zeroes for an account with no views', () => {
    const stats = summarise([], [link('a')], NOW)
    expect(stats.total).toBe(0)
    expect(stats.last7).toBe(0)
    expect(stats.busiestDay).toBeNull()
    expect(stats.perLink).toHaveLength(1)
    expect(stats.perLink[0].total).toBe(0)
  })

  it('splits the current week from the one before it', () => {
    const views = [
      view('a', 1),
      view('a', 2),
      view('a', 3), // 3 in the last 7 days
      view('a', 9),
      view('a', 10), // 2 in the 7 days before that
    ]
    const stats = summarise(views, [link('a')], NOW)

    expect(stats.total).toBe(5)
    expect(stats.last7).toBe(3)
    expect(stats.previous7).toBe(2)
    expect(stats.trend).toBe(50)
  })

  it('returns a null trend when there is no baseline to compare against', () => {
    const stats = summarise([view('a', 1)], [link('a')], NOW)
    expect(stats.trend).toBeNull()
  })

  it('reports a zero trend when both weeks are empty', () => {
    const stats = summarise([view('a', 40)], [link('a')], NOW)
    expect(stats.trend).toBe(0)
  })

  it('fills every day in the window so gaps read as gaps', () => {
    const stats = summarise([view('a', 2)], [link('a')], NOW, 30)
    expect(stats.byDay).toHaveLength(30)
    expect(stats.byDay.filter((d) => d.count > 0)).toHaveLength(1)
    // Oldest first, so the chart reads left to right.
    expect(stats.byDay[0].date < stats.byDay[29].date).toBe(true)
  })

  it('excludes views older than the window from the chart but not from the total', () => {
    const stats = summarise([view('a', 2), view('a', 90)], [link('a')], NOW, 30)
    expect(stats.total).toBe(2)
    expect(stats.byDay.reduce((sum, d) => sum + d.count, 0)).toBe(1)
  })

  it('ranks links by total views', () => {
    const views = [view('a', 1), view('b', 1), view('b', 2), view('b', 3)]
    const stats = summarise(views, [link('a'), link('b')], NOW)

    expect(stats.perLink[0].link.id).toBe('b')
    expect(stats.perLink[0].total).toBe(3)
    expect(stats.perLink[1].total).toBe(1)
  })

  it('keeps a link with no views in the breakdown', () => {
    const stats = summarise([view('a', 1)], [link('a'), link('b')], NOW)
    expect(stats.perLink.map((s) => s.link.id)).toEqual(['a', 'b'])
    expect(stats.perLink[1].total).toBe(0)
  })

  it('groups referrers by source, highest first', () => {
    const views = [
      view('a', 1, { referrer: 'https://linkedin.com/feed' }),
      view('a', 1, { referrer: 'https://www.linkedin.com/in/x' }),
      view('a', 1, { referrer: null }),
    ]
    const stats = summarise(views, [link('a')], NOW)

    expect(stats.referrers[0]).toEqual({ name: 'LinkedIn', count: 2 })
    expect(stats.referrers[1]).toEqual({ name: 'Direct', count: 1 })
  })

  it('buckets devices', () => {
    const views = [
      view('a', 1, { device: 'mobile' }),
      view('a', 1, { device: 'mobile' }),
      view('a', 1, { device: 'desktop' }),
    ]
    const stats = summarise(views, [link('a')], NOW)
    expect(stats.devices).toEqual([
      { name: 'Mobile', count: 2 },
      { name: 'Desktop', count: 1 },
    ])
  })

  it('finds the busiest day', () => {
    const views = [view('a', 3), view('a', 3), view('a', 1)]
    const stats = summarise(views, [link('a')], NOW)
    expect(stats.busiestDay?.count).toBe(2)
  })
})
