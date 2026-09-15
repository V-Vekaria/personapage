import type { DayBucket } from '@/lib/analytics'

/**
 * Daily view counts as a column chart.
 *
 * One series, so there is no legend — the caption names it. Labels are
 * selective (first, peak, last) rather than one per column, and the raw
 * numbers are always reachable through the table below for anyone who cannot
 * read the bars.
 */
export function DailyViewsChart({ days }: { days: DayBucket[] }) {
  const max = Math.max(...days.map((d) => d.count), 1)
  const peakIndex = days.reduce((best, day, i) => (day.count > days[best].count ? i : best), 0)
  const total = days.reduce((sum, day) => sum + day.count, 0)

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-white">Views per day</figcaption>
      <p className="mb-5 text-xs text-zinc-500">
        Last {days.length} days · {total} {total === 1 ? 'view' : 'views'}
      </p>

      <div className="relative">
        {/* Recessive gridlines — present for reading off magnitude, not for decoration. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-white/5" />
          ))}
        </div>

        <div className="relative flex h-40 items-end gap-[2px]" role="presentation">
          {days.map((day) => {
            const height = day.count === 0 ? 0 : Math.max((day.count / max) * 100, 4)
            return (
              <div key={day.date} className="group relative flex h-full flex-1 items-end">
                {/* Zero days still get a baseline tick so gaps read as gaps. */}
                <div
                  className={
                    day.count === 0
                      ? 'h-px w-full rounded-t-[4px] bg-white/10'
                      : 'w-full rounded-t-[4px] bg-[#8b5cf6] transition group-hover:bg-[#a78bfa]'
                  }
                  style={day.count === 0 ? undefined : { height: `${height}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-violet-300/20 bg-zinc-950 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block">
                  <span className="font-medium tabular-nums">{day.count}</span>{' '}
                  {day.count === 1 ? 'view' : 'views'}
                  <span className="ml-1.5 text-zinc-400">{formatDate(day.date)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
        <span>{formatDate(days[0].date)}</span>
        {max > 1 && (
          <span className="text-violet-200/70">
            peak {days[peakIndex].count} on {formatDate(days[peakIndex].date)}
          </span>
        )}
        <span>{formatDate(days[days.length - 1].date)}</span>
      </div>

      <details className="mt-4 group">
        <summary className="cursor-pointer text-xs text-zinc-500 transition hover:text-violet-100">
          View as table
        </summary>
        <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-zinc-950 text-zinc-500">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Date</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Views</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {days
                .filter((day) => day.count > 0)
                .reverse()
                .map((day) => (
                  <tr key={day.date} className="border-t border-zinc-900">
                    <td className="px-3 py-1.5">{formatDate(day.date)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{day.count}</td>
                  </tr>
                ))}
              {total === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-3 text-zinc-500">No views in this window.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
