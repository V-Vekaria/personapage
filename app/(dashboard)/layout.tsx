import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-zinc-800 flex flex-col px-3 py-6">
        {/* Logo */}
        <div className="px-3 mb-8">
          <span className="text-white font-semibold text-sm tracking-tight">PersonaPage</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition">
            <span>⬛</span> Dashboard
          </Link>
          <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition">
            <span>👤</span> Profile
          </Link>
          <Link href="/links" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition">
            <span>🔗</span> Links
          </Link>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-2 text-xs text-zinc-600">
          {user.email}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}