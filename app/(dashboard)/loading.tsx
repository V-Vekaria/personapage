export default function Loading() {
  return (
    <div className="relative z-10 max-w-4xl animate-pulse p-4 sm:p-6 md:p-8" aria-busy="true" aria-label="Loading">
      <div className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-6">
        <div className="mb-3 h-3 w-24 rounded bg-zinc-800" />
        <div className="mb-3 h-7 w-56 rounded bg-zinc-800" />
        <div className="h-4 w-80 max-w-full rounded bg-zinc-900" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5">
            <div className="mb-3 h-3 w-20 rounded bg-zinc-800" />
            <div className="h-8 w-16 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
