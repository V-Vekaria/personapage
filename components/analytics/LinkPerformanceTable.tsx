import Link from 'next/link'
import { CONTEXT_LABELS } from '@/types/database'
import type { LinkStats } from '@/lib/analytics'
import { formatReadTime } from '@/lib/dwell'

/**
 * Per-link totals. This is a table because it is a table — several measures per
 * row, sortable by eye, and every number readable exactly. The inline bar is a
 * reading aid on top of the number, not a replacement for it.
 */
export function LinkPerformanceTable({
  stats,
  recipients,
  readSamples = 0,
}: {
  stats: LinkStats[]
  /** Link id to recipient, for links aimed at someone specific. */
  recipients?: Map<string, string>
  /**
   * How many views across all links carry a read time. Used only to decide
   * whether the read column is worth explaining yet.
   */
  readSamples?: number
}) {
  const max = Math.max(...stats.map((s) => s.total), 1)

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-white">Views by link</figcaption>
      <p className="mb-5 text-xs text-zinc-500">
        {recipients?.size ? 'Who opened which link' : 'Which version of you people are actually opening'}
        {readSamples > 0 &&
          ' · read time is the median of the visits that reported one, counting only the time the tab was visible'}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500">
              <th scope="col" className="pb-2 pr-3 font-medium">Link</th>
              <th scope="col" className="pb-2 pr-3 text-right font-medium">7 days</th>
              <th scope="col" className="pb-2 pr-3 text-right font-medium">Views</th>
              <th scope="col" className="pb-2 pr-3 text-right font-medium">Read</th>
              <th scope="col" className="pb-2 text-right font-medium">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(({ link, total, last7, clicks, clickRate, firstOpenedAt, hoursToFirstOpen, daysOpened, medianDwellMs }) => (
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
                  {firstOpenedAt && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      {describeFirstOpen(hoursToFirstOpen)}
                      {daysOpened > 1 && ` · opened on ${daysOpened} separate days`}
                    </p>
                  )}
                </td>
                <td className="py-3 pr-3 text-right align-top tabular-nums text-zinc-400">{last7}</td>
                <td className="py-3 pr-3 text-right align-top tabular-nums font-medium text-white">{total}</td>
                <td className="py-3 pr-3 text-right align-top tabular-nums">
                  {medianDwellMs === null ? (
                    // Not "0s". Nobody reported a read time for this link, which
                    // is a different thing from everybody leaving instantly.
                    <span className="text-zinc-600">—</span>
                  ) : (
                    <span className="text-zinc-300">{formatReadTime(medianDwellMs)}</span>
                  )}
                </td>
                <td className="py-3 text-right align-top tabular-nums">
                  <span className={clicks > 0 ? 'font-medium text-emerald-300' : 'text-zinc-600'}>
                    {clicks}
                  </span>
                  {clickRate !== null && total > 0 && (
                    <span className="ml-1.5 text-xs text-zinc-600">{clickRate}%</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

/**
 * Turns hours-to-first-open into something a person reads without doing
 * arithmetic. "Opened within the hour" says more than "0.4".
 */
function describeFirstOpen(hours: number | null): string {
  if (hours === null) return 'Opened'
  if (hours < 1) return 'Opened within the hour'
  if (hours < 24) return `Opened after ${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `Opened after ${days} ${days === 1 ? 'day' : 'days'}`
}
