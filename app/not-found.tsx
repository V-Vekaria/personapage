import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] px-4 text-white">
      <div className="max-w-md text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/70">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The profile or link you are looking for was never created, or it has since been deleted.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
        >
          Back to PersonaPage
        </Link>
      </div>
    </div>
  )
}
