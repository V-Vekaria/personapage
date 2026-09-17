interface Props {
  success?: string
  error?: string
}

/** The success/error strip every dashboard page shows after a server action. */
export function StatusBanner({ success, error }: Props) {
  if (!success && !error) return null

  return (
    <div className="mt-4 space-y-2">
      {success && (
        <p
          role="status"
          className="rounded-lg border border-emerald-700/70 bg-emerald-950/70 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-800/80 bg-red-950/80 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  )
}
