import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  /** Small supporting line under the number. */
  detail?: string
  /** Week-over-week percentage. Null means there is no baseline to compare to. */
  trend?: number | null
}

export function StatTile({ label, value, detail, trend }: Props) {
  return (
    <div className="rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-violet-200/65">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-white">{value}</p>
      {(detail || typeof trend === 'number') && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          {typeof trend === 'number' && (
            <span className={trend >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%{' '}
            </span>
          )}
          {detail}
        </p>
      )}
    </div>
  )
}
