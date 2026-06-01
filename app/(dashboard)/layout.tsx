import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNavLinks } from '@/components/dashboard/DashboardNavLinks'
import { MobileNav } from '@/components/dashboard/MobileNav'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const signOutForm = (
    <form action={signOut} className="px-3">
      <button type="submit" className="text-xs text-zinc-500 hover:text-red-400 transition">
        Sign out
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <MobileNav email={user.email ?? ''} signOutForm={signOutForm} />

      <aside className="hidden md:flex w-56 shrink-0 border-r border-zinc-800 flex-col px-3 py-6">
        <div className="px-3 mb-8">
          <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight">
            PersonaPage
          </Link>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <DashboardNavLinks />
        </div>

        <div className="border-t border-zinc-800 pt-4 px-3 space-y-2">
          <p className="text-xs text-zinc-600 truncate">{user.email}</p>
          {signOutForm}
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
