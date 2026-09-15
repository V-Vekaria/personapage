'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { CONTEXTS, CONTEXT_LABELS } from '@/types/database'
import type { Context, GeneratedContent, Tone } from '@/types/database'

/**
 * The anonymous demo.
 *
 * Prefilled on purpose. Someone arriving from a CV link will not type a bio
 * before deciding whether the product is interesting, so the first generation
 * is one click away and the fields are there to be edited afterwards.
 *
 * Results are kept per audience so the second generation can be shown beside
 * the first. That side-by-side is the actual product argument — one set of
 * facts, written three different ways — and it cannot be made with a single
 * result on screen.
 */

const SAMPLE = {
  full_name: 'Sam Okafor',
  headline: 'Final-year CS student, building things that ship',
  bio: "I like problems where the hard part is the system design, not the framework. Most of what I have built started as something I needed myself and then turned out to be useful to other people.",
  skills: 'TypeScript, React, Node.js, PostgreSQL, System design, Docker',
  project: {
    title: 'Trackpoint',
    description:
      'Self-hosted uptime monitor for small teams. Checks endpoints on a schedule, groups incidents so one outage is not forty alerts, and posts to Slack.',
    tech: 'Go, PostgreSQL, React',
  },
}

/** localStorage key read by the signup page to prefill a new account. */
const DRAFT_KEY = 'personapage:draft'

interface Props {
  initialRemaining: number
  aiConfigured: boolean
}

export function TryStudio({ initialRemaining, aiConfigured }: Props) {
  const [draft, setDraft] = useState(SAMPLE)
  const [tone, setTone] = useState<Tone>('neutral')
  const [context, setContext] = useState<Context>('job_application')
  const [results, setResults] = useState<Partial<Record<Context, GeneratedContent>>>({})
  const [remaining, setRemaining] = useState(initialRemaining)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exhausted, setExhausted] = useState(initialRemaining <= 0)
  const [usedFallback, setUsedFallback] = useState(false)

  const generated = useMemo(
    () => CONTEXTS.filter((value) => results[value]),
    [results]
  )
  const current = results[context]

  const update = useCallback((patch: Partial<typeof SAMPLE>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  function persistDraft() {
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          full_name: draft.full_name,
          headline: draft.headline,
          bio: draft.bio,
          skills: draft.skills,
          tone,
          project: draft.project,
        })
      )
    } catch {
      // Private browsing blocks storage. The demo still works; only the
      // signup prefill is lost, which is not worth an error message.
    }
  }

  async function generate() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/try', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          draft: {
            full_name: draft.full_name,
            headline: draft.headline,
            bio: draft.bio,
            tone,
            skills: draft.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            projects: draft.project.title
              ? [
                  {
                    title: draft.project.title,
                    description: draft.project.description,
                    tech: draft.project.tech
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                ]
              : [],
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Generation failed.')
        if (data.exhausted) setExhausted(true)
        if (typeof data.remaining === 'number') setRemaining(data.remaining)
        return
      }

      setResults((prev) => ({ ...prev, [context]: data.content }))
      setRemaining(data.remaining)
      setUsedFallback(data.source === 'fallback')
      if (data.remaining <= 0) setExhausted(true)
      persistDraft()
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {/* Inputs ----------------------------------------------------------- */}
      <section className="rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-white">Your details</h2>
          <button
            type="button"
            onClick={() => {
              setDraft({ full_name: '', headline: '', bio: '', skills: '', project: { title: '', description: '', tech: '' } })
              setResults({})
            }}
            className="text-xs text-zinc-500 transition hover:text-violet-100"
          >
            Clear and use my own
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Name" id="t-name">
            <input
              id="t-name"
              value={draft.full_name}
              onChange={(e) => update({ full_name: e.target.value })}
              className={inputClass}
              placeholder="Your name"
              maxLength={80}
            />
          </Field>

          <Field label="Headline" id="t-headline">
            <input
              id="t-headline"
              value={draft.headline}
              onChange={(e) => update({ headline: e.target.value })}
              className={inputClass}
              placeholder="What you do, in one line"
              maxLength={160}
            />
          </Field>

          <Field label="About you" id="t-bio">
            <textarea
              id="t-bio"
              value={draft.bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="A few sentences. What you build, and why."
              maxLength={900}
            />
          </Field>

          <Field label="Skills" id="t-skills" hint="Comma separated">
            <input
              id="t-skills"
              value={draft.skills}
              onChange={(e) => update({ skills: e.target.value })}
              className={inputClass}
              placeholder="TypeScript, React, PostgreSQL"
            />
          </Field>

          <fieldset className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <legend className="px-1 text-xs text-violet-200/70">One project</legend>
            <div className="space-y-3">
              <input
                value={draft.project.title}
                onChange={(e) => update({ project: { ...draft.project, title: e.target.value } })}
                className={inputClass}
                placeholder="Project name"
                aria-label="Project name"
                maxLength={120}
              />
              <textarea
                value={draft.project.description}
                onChange={(e) => update({ project: { ...draft.project, description: e.target.value } })}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="What does it do?"
                aria-label="Project description"
                maxLength={400}
              />
              <input
                value={draft.project.tech}
                onChange={(e) => update({ project: { ...draft.project, tech: e.target.value } })}
                className={inputClass}
                placeholder="Tech used"
                aria-label="Project tech"
              />
            </div>
          </fieldset>

          <div>
            <span className="mb-2 block text-sm text-zinc-300">Tone</span>
            <div className="flex flex-wrap gap-2">
              {(['casual', 'neutral', 'formal'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  aria-pressed={tone === value}
                  className={chipClass(tone === value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Output ----------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-medium text-white">Who is reading it?</h2>
          <p className="mb-4 text-xs leading-relaxed text-zinc-500">
            Same facts above. Pick a room and see what changes.
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {CONTEXTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setContext(value)}
                aria-pressed={context === value}
                className={chipClass(context === value)}
              >
                {CONTEXT_LABELS[value]}
                {results[value] && <span className="ml-1.5 text-emerald-300" aria-hidden>✓</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={loading || exhausted}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin text-zinc-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Writing…' : current ? 'Regenerate' : 'Generate'}
            </button>

            {!exhausted && (
              <span className="text-xs text-zinc-500">
                {remaining} free {remaining === 1 ? 'generation' : 'generations'} left · no account
              </span>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-800/80 bg-red-950/80 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {usedFallback && !aiConfigured && (
            <p className="mt-4 text-xs leading-relaxed text-yellow-200/80">
              This instance has no OpenAI key configured, so the offline template writer produced
              this. It is deliberately audience-aware, but it is not a model.
            </p>
          )}
        </div>

        {generated.length > 1 && (
          <div className="rounded-lg border border-violet-300/15 bg-violet-950/20 px-4 py-3">
            <p className="text-xs leading-relaxed text-violet-100/85">
              You have {generated.length} versions now. Switch between{' '}
              {generated.map((value) => CONTEXT_LABELS[value]).join(', ')} above — the facts never
              changed, only what leads.
            </p>
          </div>
        )}

        {current ? (
          <ProfilePreview name={draft.full_name || 'You'} label={CONTEXT_LABELS[context]} content={current} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
            <p className="text-sm text-zinc-400">
              {exhausted
                ? 'Your free generations are used up.'
                : 'Press Generate to see this profile written for the selected audience.'}
            </p>
          </div>
        )}

        {exhausted && <SignupPrompt />}
      </section>
    </div>
  )
}

function ProfilePreview({
  name,
  label,
  content,
}: {
  name: string
  label: string
  content: GeneratedContent
}) {
  return (
    <article className="rounded-lg border border-violet-300/15 bg-zinc-950/75 p-5 shadow-[0_24px_80px_rgba(24,8,45,0.5),0_0_42px_rgba(124,58,237,0.14)] backdrop-blur sm:p-7">
      <p className="mb-5 inline-flex rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
        {label}
      </p>
      <h3 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">{name}</h3>
      <p className="mt-3 break-words text-base leading-relaxed text-violet-100/90">{content.headline}</p>
      <p className="mt-5 break-words text-sm leading-relaxed text-zinc-300">{content.summary}</p>

      {content.skills.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">Skills</p>
          <div className="flex flex-wrap gap-2">
            {content.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-violet-300/15 bg-violet-950/40 px-2.5 py-1 text-xs text-violet-50/85"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-violet-300/10 pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">Get in touch</p>
        <p className="text-sm leading-relaxed text-zinc-300">{content.cta_text}</p>
      </div>
    </article>
  )
}

function SignupPrompt() {
  return (
    <div className="rounded-lg border border-violet-300/20 bg-[linear-gradient(135deg,rgba(39,39,42,0.9),rgba(76,29,149,0.28),rgba(24,24,27,0.92))] p-6 text-center">
      <h3 className="text-base font-medium text-white">Keep this?</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-300">
        An account gives each version its own shareable link, keeps them editable, and counts who
        opens them. What you typed here comes with you.
      </p>
      <Link
        href="/signup"
        className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.24)] transition hover:from-white hover:to-fuchsia-100"
      >
        Create your page
      </Link>
    </div>
  )
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string
  id: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white transition placeholder:text-zinc-600 focus:border-violet-300/35 focus:outline-none focus:ring-1 focus:ring-violet-300/35'

function chipClass(active: boolean): string {
  return `rounded-full border px-3 py-1.5 text-xs capitalize transition ${
    active
      ? 'border-violet-300/45 bg-violet-400/15 text-white'
      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-violet-300/25 hover:text-violet-100'
  }`
}
