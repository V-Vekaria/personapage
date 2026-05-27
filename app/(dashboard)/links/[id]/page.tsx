'use client'

import { use, useState } from 'react'
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 hover:text-white text-sm transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-white">Manage Link</h1>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-white text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Generating…' : 'Generate with AI'}
      </button>

      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}

      {!loading && !content && !error && (
        <p className="text-zinc-600 text-sm mt-4">
          Click "Generate with AI" to create a tailored profile for this link's audience.
        </p>
      )}

      {loading && !content && (
        <div className="mt-8 space-y-6 animate-pulse">
          {[['Headline', 'h-5 w-3/4'], ['Summary', 'h-16 w-full'], ['Skills', 'h-8 w-1/2'], ['Call to Action', 'h-5 w-2/3']].map(([label, size]) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-xs text-zinc-600 uppercase tracking-wide mb-3">{label}</div>
              <div className={`bg-zinc-800 rounded ${size}`} />
            </div>
          ))}
        </div>
      )}

      {content && (
        <div className="mt-8 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Headline</h2>
            <p className="text-white font-medium">{content.headline}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Summary</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{content.summary}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {content.skills?.map((s: string) => (
                <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Call to Action</h2>
            <p className="text-zinc-300 text-sm">{content.cta_text}</p>
          </div>
        </div>
      )}
    </div>
  )
}