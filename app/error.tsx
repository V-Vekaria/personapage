'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] px-4 text-white">
      <div className="max-w-md text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">Error</p>
        <h1 className="text-2xl font-semibold tracking-tight">Something broke</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This one is on us. Trying again usually works — if it does not, the error reference below
          will help track it down.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-zinc-600">ref: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
