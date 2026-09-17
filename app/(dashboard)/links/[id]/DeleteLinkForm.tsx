'use client'

import { deleteLink } from '../actions'

/**
 * Deleting a link breaks every copy of that URL already in the wild, so it
 * asks first rather than relying on an undo that does not exist.
 */
export function DeleteLinkForm({ linkId, label }: { linkId: string; label: string }) {
  return (
    <form
      action={deleteLink}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Delete "${label}"? Anyone who already has this URL will get a 404. This cannot be undone.`
        )
        if (!ok) event.preventDefault()
      }}
    >
      <input type="hidden" name="link_id" value={linkId} />
      <button
        type="submit"
        className="rounded-lg border border-red-900/70 bg-red-950/40 px-4 py-2 text-sm text-red-300 transition hover:border-red-700 hover:bg-red-950/70 hover:text-red-200"
      >
        Delete link
      </button>
    </form>
  )
}
