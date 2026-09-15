'use client'

import { useState } from 'react'

interface Props {
  defaultRecipient?: string
  defaultSourceUrl?: string
  defaultDescription?: string
  /** Start expanded when a target already exists. */
  defaultOpen?: boolean
}

const inputClass =
  'w-full rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white transition placeholder:text-zinc-600 focus:border-violet-300/35 focus:outline-none focus:ring-1 focus:ring-violet-300/35'

/**
 * Who a link is for, and the posting it should be written against.
 *
 * Collapsed by default so creating a plain link stays a two-field job. The
 * character counter is there because the posting is capped — better to see the
 * ceiling than to hit it on submit.
 */
export function TargetFields({
  defaultRecipient = '',
  defaultSourceUrl = '',
  defaultDescription = '',
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen || Boolean(defaultRecipient || defaultDescription))
  const [description, setDescription] = useState(defaultDescription)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-zinc-800 px-4 py-3 text-left text-sm text-zinc-400 transition hover:border-violet-300/30 hover:text-violet-100"
      >
        + Aim this at someone specific
        <span className="mt-0.5 block text-xs text-zinc-600">
          Paste a job posting and it gets written against that, not a generic audience
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-violet-300/15 bg-violet-950/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Aimed at</p>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
            The posting decides what gets emphasised. It never adds anything you have not claimed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          Hide
        </button>
      </div>

      <div>
        <label htmlFor="recipient" className="mb-1.5 block text-sm text-zinc-300">
          Who is it for?
        </label>
        <input
          id="recipient"
          name="recipient"
          defaultValue={defaultRecipient}
          className={inputClass}
          placeholder="e.g. Stripe — Backend Engineer"
          maxLength={160}
        />
      </div>

      <div>
        <label htmlFor="source_url" className="mb-1.5 block text-sm text-zinc-300">
          Link to the posting <span className="text-zinc-500">(optional)</span>
        </label>
        <input
          id="source_url"
          name="source_url"
          type="url"
          defaultValue={defaultSourceUrl}
          className={inputClass}
          placeholder="https://…"
        />
      </div>

      <div>
        <label htmlFor="target_description" className="mb-1.5 block text-sm text-zinc-300">
          Paste the job description <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="target_description"
          name="target_description"
          rows={7}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
          placeholder="Paste the whole posting. Requirements, responsibilities, all of it — the more it says, the better the ordering gets."
          maxLength={12000}
        />
        <div className="mt-1 flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">Only you ever see this. It is never on the public page.</span>
          <span className={description.length > 11000 ? 'text-amber-300' : 'text-zinc-600'}>
            {description.length.toLocaleString()} / 12,000
          </span>
        </div>
      </div>
    </div>
  )
}
