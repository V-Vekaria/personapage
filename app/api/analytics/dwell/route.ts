import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { DWELL_CAP_MS } from '@/lib/dwell'
import { dwellRequestSchema } from '@/lib/validation'

/**
 * Records how long a public profile was actually read.
 *
 * Attaches to an existing view rather than creating a row of its own, so the
 * view row already proves the link exists — no lookup against `links` is needed
 * the way the view and click endpoints need one.
 *
 * Called through navigator.sendBeacon while the page is being left, so the
 * request must survive the unload and must never delay it.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    // sendBeacon sends text/plain, so parse the raw body rather than trusting
    // a content type, exactly as the click endpoint does.
    body = JSON.parse(await request.text())
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 })
  }

  const parsed = dwellRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // A page can report several times — once when the tab is hidden, again when
  // it is finally closed — so this allows more attempts than the view endpoint
  // while still bounding a loop.
  const limit = rateLimit(`dwell:${parsed.data.view_id}`, 20, 60_000)
  if (!limit.allowed) {
    return NextResponse.json({ ok: true, throttled: true })
  }

  const supabase = createAdminClient()

  const { data: view } = await supabase
    .from('link_views')
    .select('id, dwell_ms')
    .eq('id', parsed.data.view_id)
    .single()

  if (!view) return NextResponse.json({ error: 'unknown view' }, { status: 404 })

  // Clamp rather than reject: a browser with a skewed clock should cost one
  // capped row, not a lost measurement.
  const ms = Math.min(parsed.data.ms, DWELL_CAP_MS)

  // Keep the longest report for a view. A visitor who hides the tab at thirty
  // seconds and closes it at three minutes read it for three minutes, and the
  // second beacon is the one that knows that. Read-then-write races only when
  // two beacons for the same view land at once, where the worst outcome is
  // keeping the smaller of two numbers — acceptable for a median.
  if (view.dwell_ms !== null && view.dwell_ms >= ms) {
    return NextResponse.json({ ok: true, unchanged: true })
  }

  const { error } = await supabase
    .from('link_views')
    .update({ dwell_ms: ms })
    .eq('id', parsed.data.view_id)

  if (error) {
    console.error('Failed to record read time:', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
