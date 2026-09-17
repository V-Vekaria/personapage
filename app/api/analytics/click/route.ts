import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { clickRequestSchema } from '@/lib/validation'

/**
 * Records one outbound click on a public profile.
 *
 * Same shape and same privacy rules as the view endpoint: written with the
 * service role because the visitor is anonymous, but only after confirming the
 * link exists, and storing no IP address and no user agent.
 *
 * Called through navigator.sendBeacon, so the request survives the page being
 * left and never delays the navigation it is measuring.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    // sendBeacon sends text/plain, so this is parsed from the raw body rather
    // than relying on a JSON content type.
    body = JSON.parse(await request.text())
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 })
  }

  const parsed = clickRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // Coarse abuse guard, matching the view endpoint.
  const limit = rateLimit(`click:${parsed.data.link_id}`, 60, 60_000)
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

  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    null

  const { error } = await supabase.from('link_clicks').insert({
    link_id: parsed.data.link_id,
    target: parsed.data.target,
    referrer: parsed.data.referrer || null,
    device: parsed.data.device ?? null,
    country,
  })

  if (error) {
    console.error('Failed to record click:', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
