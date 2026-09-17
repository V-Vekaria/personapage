import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { summarise } from '@/lib/analytics'
import { StatTile } from '@/components/analytics/StatTile'
import { publicLinkUrl } from '@/lib/site'
import { CopyButton } from '@/components/ui/CopyButton'
import type { Link as ProfileLink, LinkClick, LinkView, Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<ProfileLink[]>()

  const linkIds = (links ?? []).map((l) => l.id)
  const { data: views } = linkIds.length
    ? await supabase
        .from('link_views')
        .select('*')
        .in('link_id', linkIds)
        .limit(5000)
        .returns<LinkView[]>()
    : { data: [] as LinkView[] }

  const { data: clicks } = linkIds.length
    ? await supabase
        .from('link_clicks')
        .select('*')
        .in('link_id', linkIds)
        .limit(5000)
        .returns<LinkClick[]>()
    : { data: [] as LinkClick[] }

  const stats = summarise(views ?? [], links ?? [], new Date(), 30, clicks ?? [])
  const steps = nextSteps(profile, links ?? [])
  const topLink = stats.perLink.find((s) => s.total > 0)
  const username = profile?.username ?? ''

  return (
    <div className="relative z-10 max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/75">Dashboard</p>
        <h1 className="text-2xl font-semibold text-white">
          {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Welcome'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {profile?.headline || 'Fill in your profile and PersonaPage can start writing from it.'}
        </p>
      </header>

      {steps.length > 0 && (
        <section className="mb-8 rounded-lg border border-violet-300/15 bg-violet-950/20 p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-medium text-white">Finish setting up</h2>
          <p className="mb-4 text-xs text-zinc-400">
            {steps.length} {steps.length === 1 ? 'thing' : 'things'} left before your links are worth sharing.
          </p>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={step.href} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-300/25 bg-violet-950/50 text-[11px] text-violet-100">
                  {i + 1}
                </span>
                <Link href={step.href} className="text-zinc-300 transition hover:text-white">
                  {step.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total views" value={stats.total} detail="across all links" />
        <StatTile
          label="Last 7 days"
          value={stats.last7}
          trend={stats.trend}
          detail={stats.trend === null ? 'first week of data' : `vs ${stats.previous7} prior`}
        />
        <StatTile
          label="Contact clicks"
          value={stats.clicks}
          detail={
            stats.clickRate === null
              ? `${(links ?? []).filter((l) => l.is_active).length} links live`
              : `${stats.clickRate}% of views reached out`
          }
        />
      </div>

      {topLink && (
        <section className="mb-8 rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 sm:p-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">
            Most opened link
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/links/${topLink.link.id}`} className="text-sm text-white hover:underline">
                {topLink.link.label || topLink.link.context}
              </Link>
              <p className="mt-1 text-xs text-zinc-500">
                {topLink.total} {topLink.total === 1 ? 'view' : 'views'} · {topLink.last7} in the last 7 days
                {topLink.clicks > 0 && (
                  <span className="text-emerald-300/85">
                    {' '}· {topLink.clicks} reached out
                  </span>
                )}
              </p>
            </div>
            {username && <CopyButton value={publicLinkUrl(username, topLink.link.slug)} />}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickAction href="/profile" title="Edit profile" body="Your bio, skills and projects" />
        <QuickAction href="/links" title="Manage links" body="One per audience you talk to" />
        <QuickAction href="/analytics" title="Analytics" body="Who is actually opening them" />
      </div>
    </div>
  )
}

/** The shortest path from an empty account to a link worth sending someone. */
function nextSteps(profile: Profile | null, links: ProfileLink[]) {
  const steps: { label: string; href: string }[] = []

  if (!profile?.full_name?.trim()) {
    steps.push({ label: 'Add your name, so pages are not headed by your username', href: '/profile' })
  }
  if (!profile?.headline?.trim() && !profile?.bio?.trim()) {
    steps.push({ label: 'Write a headline or bio — this is what the AI writes from', href: '/profile' })
  }
  if (!(profile?.projects ?? []).some((p) => p.title?.trim())) {
    steps.push({ label: 'Add at least one project', href: '/profile' })
  }
  if (!profile?.contact?.trim()) {
    steps.push({ label: 'Add a contact link, or visitors have no way to reach you', href: '/profile' })
  }
  if (links.length === 0) {
    steps.push({ label: 'Create your first link', href: '/links' })
  } else if (!links.some((l) => l.generated_content)) {
    steps.push({ label: 'Generate tailored content for a link', href: `/links/${links[0].id}` })
  }

  return steps
}

function QuickAction({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-800/90 bg-zinc-950/65 p-5 transition hover:border-violet-300/35 hover:bg-zinc-900/75 hover:shadow-[0_0_34px_rgba(124,58,237,0.12)]"
    >
      <div className="mb-1 text-sm font-medium text-white">{title}</div>
      <div className="text-xs leading-relaxed text-zinc-400">{body}</div>
    </Link>
  )
}
