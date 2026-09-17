'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  linkId: string
  hasContent: boolean
}

export function GenerateButton({ linkId, hasContent }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<'openai' | 'fallback' | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function generate() {
    setLoading(true)
    setError('')
    setSource(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Generation failed.')
        return
      }

      setSource(data.source ?? null)
      // The saved content lives on the server; pull it back so the editor
      // below re-renders with the new values.
      startTransition(() => router.refresh())
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin text-zinc-600" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Writing…' : hasContent ? 'Regenerate' : 'Generate with AI'}
        </button>

        {source === 'fallback' && (
          <span className="text-xs leading-relaxed text-yellow-200/85">
            Written by the offline template writer — set OPENAI_API_KEY for model output.
          </span>
        )}
        {source === 'openai' && (
          <span className="text-xs text-emerald-300/85">Generated. Edit anything below.</span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-800/80 bg-red-950/80 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
