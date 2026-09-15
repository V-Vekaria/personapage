import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CopyButton } from '@/components/ui/CopyButton'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { publicLinkUrl } from '@/lib/site'
import { isOpenAIConfigured } from '@/lib/ai'
import { CONTEXTS, CONTEXT_LABELS } from '@/types/database'
import type { Link as ProfileLink } from '@/types/database'
import { saveGeneratedContent, toggleLinkActive, updateLinkDetails } from '../actions'
import { GenerateButton } from './GenerateButton'
import { DeleteLinkForm } from './DeleteLinkForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}

const inputClass =
  'w-full rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white transition placeholder:text-zinc-600 focus:border-violet-300/35 focus:outline-none focus:ring-1 focus:ring-violet-300/35'
const labelClass = 'mb-1.5 block text-sm text-zinc-300'
const cardClass =
  'rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(124,58,237,0.08)] sm:p-6'

export default async function ManageLinkPage({ params, searchParams }: Props) {
  const { id } = await params
  const { success, error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single<ProfileLink>()

  if (!link) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? ''
  const url = username ? publicLinkUrl(username, link.slug) : ''
  const content = link.generated_content
  const viewCount = await countViews(id)

  return (
    <div className="relative z-10 max-w-3xl p-4 sm:p-6 md:p-8">
      <header className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur sm:p-6">
        <Link href="/links" className="mb-4 inline-block text-sm text-violet-100/80 transition hover:text-white">
          ← All links
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-violet-200/75">
              {CONTEXT_LABELS[link.context] ?? link.context}
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {link.label || CONTEXT_LABELS[link.context] || 'Untitled link'}
            </h1>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs ${
              link.is_active
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400'
            }`}
          >
            {link.is_active ? 'Live' : 'Paused'}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          {viewCount === null
            ? 'Views unavailable'
            : `${viewCount} ${viewCount === 1 ? 'view' : 'views'} so far`}
        </p>

        <StatusBanner success={success} error={error} />
      </header>

      {/* Public URL --------------------------------------------------------- */}
      <section className={`${cardClass} mb-6`}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">
          Public URL
        </h2>
        {url ? (
          <>
            <p className="mb-4 break-all rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 font-mono text-xs text-zinc-300">
              {url}
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={url} />
              <a
                href={`/p/${username}?link=${link.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-violet-300/20 bg-violet-950/25 px-3 py-1.5 text-xs text-violet-100 transition hover:border-violet-300/40 hover:text-white"
              >
                Open page
              </a>
            </div>
            {!content && (
              <p className="mt-4 text-xs leading-relaxed text-yellow-200/80">
                This URL works already, but it will show your raw profile until you generate
                tailored content below.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-yellow-200/85">
            Add a username on your <Link href="/profile" className="underline">profile</Link> to
            get a public URL.
          </p>
        )}
      </section>

      {/* Tailored content --------------------------------------------------- */}
      <section className={`${cardClass} mb-6`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xs font-medium uppercase tracking-widest text-violet-200/70">
            Tailored content
          </h2>
          {!isOpenAIConfigured() && (
            <span className="text-xs text-zinc-500">No OPENAI_API_KEY — using template writer</span>
          )}
        </div>

        <p className="mb-5 text-sm leading-relaxed text-zinc-400">
          Written for {CONTEXT_LABELS[link.context]?.toLowerCase() ?? 'this audience'}. Generate a
          draft, then edit it by hand — what you save here is exactly what visitors see.
        </p>

        <GenerateButton linkId={link.id} hasContent={Boolean(content)} />

        <form
          action={saveGeneratedContent}
          // Re-key on the content so a regeneration resets these inputs
          // instead of leaving stale values in an uncontrolled form.
          key={JSON.stringify(content)}
          className="mt-6 space-y-5 border-t border-violet-300/10 pt-6"
        >
          <input type="hidden" name="link_id" value={link.id} />

          <div>
            <label className={labelClass} htmlFor="headline">Headline</label>
            <input
              id="headline"
              name="headline"
              defaultValue={content?.headline ?? ''}
              className={inputClass}
              placeholder="Generate a draft, or write your own"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              rows={4}
              defaultValue={content?.summary ?? ''}
              className={`${inputClass} resize-none`}
              placeholder="Two or three sentences aimed at this audience"
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="skills">Skills shown</label>
            <input
              id="skills"
              name="skills"
              defaultValue={content?.skills?.join(', ') ?? ''}
              className={inputClass}
              placeholder="Comma separated, most relevant first"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Ordered for this audience. Leave blank to fall back to your full profile list.
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="cta_text">Call to action</label>
            <input
              id="cta_text"
              name="cta_text"
              defaultValue={content?.cta_text ?? ''}
              className={inputClass}
              placeholder="One sentence — what should they do next?"
              required
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
          >
            Save content
          </button>
        </form>
      </section>

      {/* Details ------------------------------------------------------------ */}
      <section className={`${cardClass} mb-6`}>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-violet-200/70">
          Details
        </h2>
        <form action={updateLinkDetails} className="space-y-4">
          <input type="hidden" name="link_id" value={link.id} />

          <div>
            <label className={labelClass} htmlFor="label">Label</label>
            <input
              id="label"
              name="label"
              defaultValue={link.label}
              className={inputClass}
              placeholder="e.g. Google SWE application"
            />
            <p className="mt-1 text-xs text-zinc-500">Only you see this — it keeps your list readable.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="context">Audience</label>
            <select id="context" name="context" defaultValue={link.context} className={inputClass}>
              {CONTEXTS.map((value) => (
                <option key={value} value={value}>
                  {CONTEXT_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Changing this does not rewrite existing content — regenerate to apply it.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-lg border border-violet-300/25 bg-violet-950/30 px-5 py-2.5 text-sm text-violet-100 transition hover:border-violet-300/45 hover:text-white"
          >
            Save details
          </button>
        </form>
      </section>

      {/* Danger zone -------------------------------------------------------- */}
      <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/50 p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Link status
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <form action={toggleLinkActive}>
            <input type="hidden" name="link_id" value={link.id} />
            <input type="hidden" name="is_active" value={String(!link.is_active)} />
            <button
              type="submit"
              className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-300/35 hover:text-white"
            >
              {link.is_active ? 'Pause this link' : 'Make it live again'}
            </button>
          </form>
          <DeleteLinkForm linkId={link.id} label={link.label || CONTEXT_LABELS[link.context]} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          Pausing keeps the link and its history but stops it being picked as your default page.
        </p>
      </section>
    </div>
  )
}

/** Returns null rather than 0 when the count cannot be read, so the UI can say so. */
async function countViews(linkId: string): Promise<number | null> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('link_views')
    .select('id', { count: 'exact', head: true })
    .eq('link_id', linkId)

  return error ? null : (count ?? 0)
}
