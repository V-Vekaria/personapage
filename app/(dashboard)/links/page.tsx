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

  // Fetch profile to get the real username (not hardcoded)
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

  return (
    <div className="p-8 max-w-2xl">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Links</h1>
        <p className="text-zinc-400 text-sm mt-1">Each link is a smart profile page for a different context</p>

        {/* Success / Error feedback */}
        {params.success && (
          <div className="mt-4 px-4 py-3 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 text-sm">
            Link created ✓
          </div>
        )}
        {params.error && (
          <div className="mt-4 px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
            {params.error}
          </div>
        )}

        {/* Warn if no username set — copied links will 404 */}
        {!username && (
          <div className="mt-4 px-4 py-3 bg-yellow-950 border border-yellow-800 rounded-lg text-yellow-400 text-sm">
            ⚠️ Your profile has no username set. Go to Profile and add one so your links work.
          </div>
        )}
      </div>

      {/* ── Create new link form ── */}
      <form action={createLink} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-medium text-white mb-4">Create new link</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Context</label>
            <select
              name="context_type"
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
            >
              <option value="job_application">Job Application</option>
              <option value="networking">Networking</option>
              <option value="investor">Investor Pitch</option>
              <option value="conference">Conference / Event</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Label <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              name="label"
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
              placeholder="e.g. Google SWE application"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-white text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 hover:bg-zinc-100 transition"
        >
          Create link
        </button>
      </form>

      {/* ── Links list ── */}
      <div className="space-y-3">
        {!links?.length && (
          <p className="text-zinc-600 text-sm">No links yet — create your first one above.</p>
        )}
        {links?.map((link) => (
          <div key={link.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">{link.label || link.context}</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  persona.page/{username}/{link.slug}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-600 capitalize">
                  {link.context.replace('_', ' ')}
                </span>
                {/* Only show copy if AI has been generated */}
                {link.generated_content
                  ? <CopyLinkButton username={username} slug={link.slug} />
                  : <span className="text-xs text-yellow-600">Generate AI first</span>
                }
                <a href={`/links/${link.id}`} className="text-xs text-zinc-400 hover:text-white transition">
                  Manage →
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}