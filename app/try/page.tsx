import Link from 'next/link'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { decodeTrial, remainingTrials, TRIAL_COOKIE, TRIAL_LIMIT } from '@/lib/trial'
import { isOpenAIConfigured } from '@/lib/ai'
import { TryStudio } from './TryStudio'

export const metadata: Metadata = {
  title: 'Try it — no account',
  description:
    'Write one set of facts about yourself and see them turned into a profile for a recruiter, a collaborator, or an investor. No sign-up.',
}

// The remaining-credits figure comes from a cookie, so this cannot be static.
export const dynamic = 'force-dynamic'

export default async function TryPage() {
  const cookieStore = await cookies()
  const remaining = remainingTrials(decodeTrial(cookieStore.get(TRIAL_COOKIE)?.value))

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <Link href="/" className="font-semibold tracking-tight text-white">
          PersonaPage
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-300 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-white to-violet-100 px-4 py-2 text-sm font-medium text-zinc-950 shadow-[0_0_24px_rgba(124,58,237,0.2)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.32)]"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-8 sm:pb-24">
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_68%)] blur-3xl"
          aria-hidden
        />

        <header className="relative z-10 mb-8 max-w-2xl pt-6 sm:pt-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-950/30 px-3 py-1.5 text-xs text-violet-100/80">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.85)]" aria-hidden />
            {TRIAL_LIMIT} free generations, no account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            See it work before you sign up.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            The details below are already filled in — press Generate and watch the same facts get
            rewritten for a different room. Swap in your own whenever you like.
          </p>
        </header>

        <div className="relative z-10">
          <TryStudio initialRemaining={remaining} aiConfigured={isOpenAIConfigured()} />
        </div>
      </main>
    </div>
  )
}
