import Link from 'next/link'

const links = [
  { href: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { href: '/profile', icon: '👤', label: 'Profile' },
  { href: '/links', icon: '🔗', label: 'Links' },
] as const

const linkClass =
  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition'

interface Props {
  onNavigate?: () => void
}

export function DashboardNavLinks({ onNavigate }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, icon, label }) => (
        <Link key={href} href={href} className={linkClass} onClick={onNavigate}>
          <span>{icon}</span> {label}
        </Link>
      ))}
    </nav>
  )
}
