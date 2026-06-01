'use client'

import { use, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export default function ManageLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: id }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setContent(data.content)
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl">
      <div className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 sm:p-6 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="text-violet-100/80 hover:text-white text-sm transition mb-4"
        >
          Back
        </button>
        <p className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-3">
          Links
        </p>
        <h1 className="text-2xl font-semibold text-white">Manage Link</h1>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 shadow-[0_0_30px_rgba(124,58,237,0.22)] hover:from-white hover:to-fuchsia-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Generating...' : 'Generate with AI'}
      </button>

      {error && (
        <p className="text-red-300 text-sm mt-4 rounded-lg border border-red-800/80 bg-red-950/80 px-4 py-3">{error}</p>
      )}

      {!loading && !content && !error && (
        <p className="text-zinc-400 text-sm mt-4 rounded-lg border border-violet-300/10 bg-zinc-950/50 px-4 py-3">
          Click "Generate with AI" to create a tailored profile for this link's audience.
        </p>
      )}

      {loading && !content && (
        <div className="mt-8 space-y-6 animate-pulse">
          {[['Headline', 'h-5 w-3/4'], ['Summary', 'h-16 w-full'], ['Skills', 'h-8 w-1/2'], ['Call to Action', 'h-5 w-2/3']].map(([label, size]) => (
            <div key={label} className="bg-zinc-950/60 border border-violet-300/10 rounded-lg p-6">
              <div className="text-xs text-violet-200/60 uppercase tracking-wide mb-3">{label}</div>
              <div className={`bg-zinc-800 rounded ${size}`} />
            </div>
          ))}
        </div>
      )}

      {content && (
        <div className="mt-8 space-y-6">
          <PreviewCard title="Headline">
            <p className="text-white font-medium">{content.headline}</p>
          </PreviewCard>
          <PreviewCard title="Summary">
            <p className="text-zinc-300 text-sm leading-relaxed">{content.summary}</p>
          </PreviewCard>
          <PreviewCard title="Skills">
            <div className="flex flex-wrap gap-2">
              {content.skills?.map((s: string) => (
                <span key={s} className="bg-violet-950/40 border border-violet-300/15 text-violet-50/85 text-xs px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </PreviewCard>
          <PreviewCard title="Call to Action">
            <p className="text-zinc-300 text-sm">{content.cta_text}</p>
          </PreviewCard>
        </div>
      )}
    </div>
  )
}

function PreviewCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-zinc-950/60 border border-violet-300/10 rounded-lg p-6 shadow-[0_0_28px_rgba(124,58,237,0.08)]">
      <h2 className="text-xs text-violet-200/70 uppercase tracking-wide mb-2">{title}</h2>
      {children}
    </div>
  )
}
