'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label = 'Copy link', className }: Props) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setFailed(false)
    } catch {
      // Clipboard access is blocked in some embedded browsers; say so rather
      // than showing a success state that did not happen.
      setFailed(true)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ??
        'inline-flex items-center gap-1.5 rounded-md border border-violet-300/20 bg-violet-950/25 px-3 py-1.5 text-xs text-violet-100 transition hover:border-violet-300/40 hover:text-white'
      }
    >
      {failed ? 'Copy failed' : copied ? 'Copied' : label}
    </button>
  )
}
