import Link from 'next/link'
import { CONTEXT_LABELS } from '@/types/database'
import type { LinkStats } from '@/lib/analytics'

/**
 * Per-link totals. This is a table because it is a table — several measures per
 * row, sortable by eye, and every number readable exactly. The inline bar is a
 * reading aid on top of the number, not a replacement for it.
 */
export function LinkPerformanceTable({
  stats,
  recipients,
}: {
  stats: LinkStats[]
  /** Link id to recipient, for links aimed at someone specific. */
  recipients?: Map<string, string>
}) {
  const max = Math.max(...stats.map((s) => s.total), 1)

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-white">Views by link</figcaption>
      <p className="mb-5 text-xs text-zinc-500">
        {recipients?.size ? 'Who opened which link' : 'Which version of you people are actually opening'}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500">
              <th scope="col" className="pb-2 pr-3 font-medium">Link</th>
              <th scope="col" className="pb-2 pr-3 text-right font-medium">7 days</th>
              <th scope="col" className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(({ link, total, last7 }) => (
              <tr key={link.id} className="border-b border-zinc-900/80 last:border-0">
                <td className="py-3 pr-3">
                  <Link
                    href={`/links/${link.id}`}
                    className="text-zinc-200 transition hover:text-white"
                  >
                    {link.label || CONTEXT_LABELS[link.context] || link.context}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {recipients?.get(link.id) && recipients.get(link.id) !== link.label ? (
                      <span className="text-xs text-violet-100/70">{recipients.get(link.id)}</span>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {CONTEXT_LABELS[link.context] ?? link.context}
                      </span>
                    )}
                    {!link.is_active && <span className="text-xs text-zinc-600">· paused</span>}
                  </div>
                  <div className="mt-2 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-r-[4px] bg-[#8b5cf6]"
                      style={{ width: `${total === 0 ? 0 : Math.max((total / max) * 100, 2)}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 pr-3 text-right align-top tabular-nums text-zinc-400">{last7}</td>
                <td className="py-3 text-right align-top tabular-nums font-medium text-white">{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
