'use client'

import { useEffect, useState } from 'react'

const DRAFT_KEY = 'personapage:draft'

/**
 * Carries whatever was typed on /try into the signup form.
 *
 * Someone who has already written their bio in the demo should not be handed an
 * empty profile the moment they create an account — that would make signing up
 * feel like starting over, which is the exact friction the demo exists to
 * remove. The draft rides along in a hidden field and the signup action writes
 * it into the new profile row.
 */
export function DraftCarry() {
  const [draft, setDraft] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY)
      // Cap here as well as server-side: no reason to post a payload that will
      // only be rejected.
      if (stored && stored.length < 8000) setDraft(stored)
    } catch {
      // Storage unavailable. Signup still works, it just starts empty.
    }
  }, [])

  if (!draft) return null

  return (
    <>
      <input type="hidden" name="draft" value={draft} />
      <p className="rounded-lg border border-violet-300/20 bg-violet-950/25 px-4 py-3 text-xs leading-relaxed text-violet-100/85">
        What you wrote in the demo is saved and will be on your profile as soon as you sign up.
      </p>
    </>
  )
}
