'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', icon: '◧', label: 'Dashboard' },
  { href: '/profile', icon: '◔', label: 'Profile' },
  { href: '/links', icon: '◎', label: 'Links' },
  { href: '/analytics', icon: '◫', label: 'Analytics' },
] as const

interface Props {
  onNavigate?: () => void
}

export function DashboardNavLinks({ onNavigate }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? 'bg-violet-950/45 text-white ring-1 ring-violet-300/20'
                : 'text-zinc-300 hover:bg-violet-950/35 hover:text-white hover:ring-1 hover:ring-violet-300/15'
            }`}
          >
            <span className={active ? 'text-violet-200' : 'text-violet-200/70'} aria-hidden>
              {icon}
            </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
