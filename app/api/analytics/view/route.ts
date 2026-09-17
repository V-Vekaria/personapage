import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { viewRequestSchema } from '@/lib/validation'

/**
 * Records one view of a public profile link.
 *
 * Writes with the service role because the visitor is anonymous by definition,
 * but only after confirming the link actually exists — otherwise the endpoint
 * would happily write rows for any UUID anyone posted at it. No IP address and
 * no user agent is stored; a country code and a desktop/mobile bucket is the
 * whole payload.
 *
 * Responds with the new row's id so the page can report a read time for this
 * view once the visitor leaves — see app/api/analytics/dwell/route.ts.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 })
  }

  const parsed = viewRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // Coarse abuse guard so one visitor cannot inflate a counter by looping.
  const limit = rateLimit(`view:${parsed.data.link_id}`, 60, 60_000)
  if (!limit.allowed) {
    return NextResponse.json({ ok: true, throttled: true })
  }

  const supabase = createAdminClient()

  const { data: link } = await supabase
    .from('links')
    .select('id')
    .eq('id', parsed.data.link_id)
    .single()

  if (!link) return NextResponse.json({ error: 'unknown link' }, { status: 404 })

  // Vercel injects these at the edge; absent everywhere else, which is fine.
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    null

  // The id comes back so the page can report a read time against this exact
  // view later. It identifies one anonymous open and nothing else — holding it
  // lets the visitor amend their own row and reveals nothing about anyone.
  const { data: view, error } = await supabase
    .from('link_views')
    .insert({
      link_id: parsed.data.link_id,
      referrer: parsed.data.referrer || null,
      device: parsed.data.device ?? null,
      country,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to record view:', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: view.id })
}
