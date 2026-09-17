import type { NamedCount } from '@/lib/analytics'

interface Props {
  title: string
  caption?: string
  items: NamedCount[]
  emptyText: string
}

/**
 * Ranked magnitude for a handful of named things (referrers, devices).
 *
 * Identity lives in the row label, so every bar is the same hue — colouring by
 * rank would make the palette meaningless the moment the ranking changed.
 */
export function BarList({ title, caption, items, emptyText }: Props) {
  const max = Math.max(...items.map((item) => item.count), 1)
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-white">{title}</figcaption>
      {caption && <p className="mb-5 text-xs text-zinc-500">{caption}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const share = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <li key={item.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-zinc-300">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-zinc-400">
                    {item.count}
                    <span className="ml-1.5 text-zinc-600">{share}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-r-[4px] bg-[#8b5cf6]"
                    style={{ width: `${Math.max((item.count / max) * 100, 2)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </figure>
  )
}
