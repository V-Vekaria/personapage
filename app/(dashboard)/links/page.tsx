import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CopyButton } from '@/components/ui/CopyButton'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { publicLinkUrl } from '@/lib/site'
import { CONTEXTS, CONTEXT_LABELS } from '@/types/database'
import type { Link as ProfileLink } from '@/types/database'
import { createLink } from './actions'

const inputClass =
  'w-full rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white transition placeholder:text-zinc-600 focus:border-violet-300/35 focus:outline-none focus:ring-1 focus:ring-violet-300/35'

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user!.id)
    .single()

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .returns<ProfileLink[]>()

  const username = profile?.username ?? ''

  return (
    <div className="relative z-10 max-w-3xl p-4 sm:p-6 md:p-8">
      <header className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/75">Links</p>
        <h1 className="text-2xl font-semibold text-white">Links</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Each link is the same profile written for a different room.
        </p>

        <StatusBanner success={success} error={error} />

        {!username && (
          <p className="mt-4 rounded-lg border border-yellow-700/70 bg-yellow-950/70 px-4 py-3 text-sm text-yellow-200">
            Your profile has no username, so links have nowhere to point. Add one on your{' '}
            <Link href="/profile" className="underline">profile</Link>.
          </p>
        )}
      </header>

      <form
        action={createLink}
        className="mb-8 rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(124,58,237,0.08)] sm:p-6"
      >
        <h2 className="mb-4 text-sm font-medium text-white">Create a new link</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="context_type" className="mb-1.5 block text-sm text-zinc-300">
              Who is this for?
            </label>
            <select id="context_type" name="context_type" className={inputClass}>
              {CONTEXTS.map((value) => (
                <option key={value} value={value}>
                  {CONTEXT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="label" className="mb-1.5 block text-sm text-zinc-300">
              Label <span className="text-zinc-500">(optional)</span>
            </label>
            <input id="label" name="label" className={inputClass} placeholder="e.g. Google SWE application" />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
        >
          Create link
        </button>
      </form>

      <div className="space-y-3">
        {!links?.length && (
          <p className="rounded-lg border border-violet-300/10 bg-zinc-950/50 p-5 text-sm text-zinc-400">
            No links yet — create your first one above.
          </p>
        )}

        {links?.map((link) => (
          <article
            key={link.id}
            className="rounded-lg border border-zinc-800/90 bg-zinc-950/60 p-5 transition hover:border-violet-300/30 hover:shadow-[0_0_28px_rgba(124,58,237,0.1)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-white">
                    {link.label || CONTEXT_LABELS[link.context] || link.context}
                  </h3>
                  {!link.is_active && (
                    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400">
                      Paused
                    </span>
                  )}
                </div>
                <p className="mt-1 break-all font-mono text-xs text-zinc-500">
                  /p/{username}?link={link.slug}
                </p>
                {!link.generated_content && (
                  <p className="mt-2 text-xs text-yellow-300/80">
                    Not generated yet — shows your raw profile
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-violet-300/15 bg-violet-950/25 px-2.5 py-1 text-xs text-violet-100/75">
                  {CONTEXT_LABELS[link.context] ?? link.context}
                </span>
                {username && <CopyButton value={publicLinkUrl(username, link.slug)} />}
                <Link
                  href={`/links/${link.id}`}
                  className="text-xs text-violet-100 transition hover:text-white"
                >
                  Manage
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
