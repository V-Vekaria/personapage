import { createClient } from '@/lib/supabase/server'
import { createLink } from './actions'
import { CopyLinkButton } from './CopyLinkButton'

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const username = profile?.username ?? ''
  const inputClass =
    'w-full bg-zinc-900/80 border border-violet-300/10 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-300/35 focus:border-violet-300/35 transition'

  return (
    <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl">
      <div className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 sm:p-6 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur">
        <p className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-3">
          Links
        </p>
        <h1 className="text-2xl font-semibold text-white">Links</h1>
        <p className="text-zinc-300 text-sm mt-2">Each link is a smart profile page for a different context</p>

        {params.success && (
          <div className="mt-4 px-4 py-3 bg-emerald-950/70 border border-emerald-700/70 rounded-lg text-emerald-300 text-sm">
            Link created
          </div>
        )}
        {params.error && (
          <div className="mt-4 px-4 py-3 bg-red-950/80 border border-red-800/80 rounded-lg text-red-300 text-sm">
            {params.error}
          </div>
        )}

        {!username && (
          <div className="mt-4 px-4 py-3 bg-yellow-950/70 border border-yellow-700/70 rounded-lg text-yellow-200 text-sm">
            Your profile has no username set. Go to Profile and add one so your links work.
          </div>
        )}
      </div>

      <form action={createLink} className="bg-zinc-950/60 border border-violet-300/10 rounded-lg p-5 sm:p-6 mb-8 shadow-[0_0_34px_rgba(124,58,237,0.08)]">
        <h2 className="text-sm font-medium text-white mb-4">Create new link</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">Context</label>
            <select
              name="context_type"
              className={inputClass}
            >
              <option value="job_application">Job Application</option>
              <option value="networking">Networking</option>
              <option value="investor">Investor Pitch</option>
              <option value="conference">Conference / Event</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">
              Label <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              name="label"
              className={inputClass}
              placeholder="e.g. Google SWE application"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 shadow-[0_0_30px_rgba(124,58,237,0.22)] hover:from-white hover:to-fuchsia-100 transition"
        >
          Create link
        </button>
      </form>

      <div className="space-y-3">
        {!links?.length && (
          <div className="rounded-lg border border-violet-300/10 bg-zinc-950/50 p-5 text-zinc-400 text-sm">
            No links yet - create your first one above.
          </div>
        )}
        {links?.map((link) => (
          <div key={link.id} className="bg-zinc-950/60 border border-zinc-800/90 rounded-lg p-5 transition hover:border-violet-300/30 hover:shadow-[0_0_28px_rgba(124,58,237,0.1)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-white text-sm font-medium">{link.label || link.context}</div>
                <div className="text-zinc-500 text-xs mt-1 break-all">
                  /p/{username}?link={link.slug}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-xs text-violet-100/75 capitalize rounded-full border border-violet-300/15 bg-violet-950/25 px-2.5 py-1">
                  {link.context.replace('_', ' ')}
                </span>
                {link.generated_content
                  ? <CopyLinkButton username={username} slug={link.slug} />
                  : <span className="text-xs text-yellow-300/80">Generate AI first</span>
                }
                <a href={`/links/${link.id}`} className="text-xs text-violet-100 hover:text-white transition">
                  Manage
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
