/**
 * The read-time endpoint, exercised rather than read.
 *
 * Supabase is stubbed to a small fake that records the update it was asked to
 * make. What is under test is the endpoint's own logic — that it parses a
 * text/plain beacon, refuses a payload it cannot trust, clamps a number above
 * the cap instead of dropping it, and keeps the longest report for a view.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DWELL_CAP_MS } from '@/lib/dwell'

const VIEW_ID = '11111111-1111-4111-8111-111111111111'

/** What the stubbed database currently holds, and what it was asked to write. */
const db: { view: { id: string; dwell_ms: number | null } | null; updated: number | null } = {
  view: null,
  updated: null,
}

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: db.view, error: null }),
        }),
      }),
      update: (values: { dwell_ms: number }) => ({
        eq: async () => {
          db.updated = values.dwell_ms
          return { error: null }
        },
      }),
    }),
  }),
}))

const { POST } = await import('@/app/api/analytics/dwell/route')

/** A beacon, as the browser actually sends it: text/plain, no JSON header. */
function beacon(body: string): Request {
  return new Request('http://localhost/api/analytics/dwell', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body,
  })
}

beforeEach(() => {
  db.view = { id: VIEW_ID, dwell_ms: null }
  db.updated = null
})

describe('POST /api/analytics/dwell', () => {
  it('accepts a sendBeacon payload despite the text/plain content type', async () => {
    const response = await POST(beacon(JSON.stringify({ view_id: VIEW_ID, ms: 45_000 })))

    expect(response.status).toBe(200)
    expect(db.updated).toBe(45_000)
  })

  it('rejects a body that is not JSON at all', async () => {
    const response = await POST(beacon('not json'))

    expect(response.status).toBe(400)
    expect(db.updated).toBeNull()
  })

  it('rejects a payload that does not name a real view', async () => {
    const response = await POST(beacon(JSON.stringify({ view_id: 'nope', ms: 1_000 })))

    expect(response.status).toBe(400)
    expect(db.updated).toBeNull()
  })

  it('refuses to write against a view id that does not exist', async () => {
    db.view = null
    const response = await POST(beacon(JSON.stringify({ view_id: VIEW_ID, ms: 1_000 })))

    expect(response.status).toBe(404)
    expect(db.updated).toBeNull()
  })

  it('clamps an impossible duration to the cap rather than storing it', async () => {
    await POST(beacon(JSON.stringify({ view_id: VIEW_ID, ms: 86_000_000 })))

    expect(db.updated).toBe(DWELL_CAP_MS)
  })

  it('keeps the longest report when a second beacon arrives', async () => {
    db.view = { id: VIEW_ID, dwell_ms: 30_000 }
    await POST(beacon(JSON.stringify({ view_id: VIEW_ID, ms: 180_000 })))

    expect(db.updated).toBe(180_000)
  })

  it('leaves a longer stored read alone when a shorter one is replayed', async () => {
    db.view = { id: VIEW_ID, dwell_ms: 180_000 }
    const response = await POST(beacon(JSON.stringify({ view_id: VIEW_ID, ms: 5_000 })))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ unchanged: true })
    expect(db.updated).toBeNull()
  })
})
