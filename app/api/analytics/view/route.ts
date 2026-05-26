import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { link_id, referrer, device } = await request.json()

    if (!link_id) {
      return NextResponse.json({ error: 'missing link_id' }, { status: 400 })
    }

    const supabase = await createClient()

    await supabase.from('link_views').insert({
      link_id,
      referrer: referrer || null,
      country: null, // add Vercel geo headers later
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}