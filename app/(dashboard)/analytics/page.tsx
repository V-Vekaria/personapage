import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { summarise } from '@/lib/analytics'
import { StatTile } from '@/components/analytics/StatTile'
import { DailyViewsChart } from '@/components/analytics/DailyViewsChart'
import { BarList } from '@/components/analytics/BarList'
import { LinkPerformanceTable } from '@/components/analytics/LinkPerformanceTable'
import type { Link as ProfileLink, LinkTarget, LinkView } from '@/types/database'

export const metadata = { title: 'Analytics · PersonaPage' }

// Views change constantly; a cached page would be actively misleading.
export const dynamic = 'force-dynamic'

const cardClass =
  'rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(124,58,237,0.08)] sm:p-6'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<ProfileLink[]>()

  const linkIds = (links ?? []).map((l) => l.id)

  // RLS scopes link_views to links this user owns, so the `in` filter is a
  // narrowing convenience rather than the security boundary.
  const { data: views } = linkIds.length
    ? await supabase
        .from('link_views')
        .select('*')
        .in('link_id', linkIds)
        .order('created_at', { ascending: false })
        .limit(5000)
        .returns<LinkView[]>()
    : { data: [] as LinkView[] }

  const { data: targets } = linkIds.length
    ? await supabase
        .from('link_targets')
        .select('link_id, recipient')
        .in('link_id', linkIds)
        .returns<Pick<LinkTarget, 'link_id' | 'recipient'>[]>()
    : { data: [] as Pick<LinkTarget, 'link_id' | 'recipient'>[] }

  const recipients = new Map(
    (targets ?? []).filter((t) => t.recipient).map((t) => [t.link_id, t.recipient])
  )

  const stats = summarise(views ?? [], links ?? [])

  return (
    <div className="relative z-10 max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/75">Analytics</p>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Counted server-side, per link. No IP addresses and no cookies — a country and a
          desktop/mobile bucket is all that is stored.
        </p>
      </header>

      {!links?.length ? (
        <EmptyState
          title="Nothing to measure yet"
          body="Create your first link and share it — views will show up here."
          href="/links"
          cta="Create a link"
        />
      ) : stats.total === 0 ? (
        <EmptyState
          title="No views yet"
          body="Your links exist but nobody has opened one. Copy a link from the Links page and put it somewhere."
          href="/links"
          cta="Go to links"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Total views" value={stats.total} detail="all time" />
            <StatTile
              label="Last 7 days"
              value={stats.last7}
              trend={stats.trend}
              detail={
                stats.trend === null
                  ? 'first week of data'
                  : `vs ${stats.previous7} the week before`
              }
            />
            <StatTile
              label="Busiest day"
              value={stats.busiestDay?.count ?? 0}
              detail={
                stats.busiestDay
                  ? new Date(`${stats.busiestDay.date}T00:00:00Z`).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'UTC',
                    })
                  : 'no views yet'
              }
            />
          </div>

          <section className={cardClass}>
            <DailyViewsChart days={stats.byDay} />
          </section>

          <section className={cardClass}>
            <LinkPerformanceTable stats={stats.perLink} recipients={recipients} />
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className={cardClass}>
              <BarList
                title="Where views come from"
                caption="Referring site, or direct when there is none"
                items={stats.referrers}
                emptyText="No referrer data yet."
              />
            </section>
            <section className={cardClass}>
              <BarList
                title="Device"
                caption="Screen width at the moment the page loaded"
                items={stats.devices}
                emptyText="No device data yet."
              />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="rounded-lg border border-violet-300/10 bg-zinc-950/55 p-8 text-center">
      <h2 className="text-base font-medium text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
      >
        {cta}
      </Link>
    </div>
  )
}
