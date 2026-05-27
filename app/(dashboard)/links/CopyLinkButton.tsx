'use client'

import { useState } from 'react'

export function CopyLinkButton({ username, slug }: { username: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/p/${username}?link=${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
    >
      {copied ? '✓ Copied' : 'Copy Link'}
    </button>
  )
}