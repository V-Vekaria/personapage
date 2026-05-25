import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

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
      <aside className="w-56 border-r border-zinc-800 flex flex-col px-3 py-6">
        <div className="px-3 mb-8">
          <span className="text-white font-semibold text-sm tracking-tight">PersonaPage</span>
        </div>

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

        <div className="border-t border-zinc-800 pt-4 px-3 space-y-2">
          <p className="text-xs text-zinc-600 truncate">{user.email}</p>
          <form action={signOut}>
            <button type="submit" className="text-xs text-zinc-500 hover:text-red-400 transition">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}