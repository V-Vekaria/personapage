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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : (user.email ?? '').split('@')[0]

  const initial = displayName[0]?.toUpperCase() ?? '?'

  const signOutForm = (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Sign out"
        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-violet-950/35 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
        </svg>
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] text-white flex flex-col md:flex-row">
      <MobileNav email={user.email ?? ''} displayName={displayName} initial={initial} signOutForm={signOutForm} />

      <aside className="hidden md:flex w-56 shrink-0 border-r border-violet-300/10 bg-zinc-950/60 flex-col px-3 py-6 backdrop-blur">
        <div className="px-3 mb-8">
          <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight">
            PersonaPage
          </Link>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <DashboardNavLinks />
        </div>

        <div className="border-t border-violet-300/10 pt-4 px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-violet-950/60 border border-violet-300/20 text-sm font-medium text-violet-100">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white leading-tight">
                {displayName}
              </p>
              <p className="text-[12px] text-zinc-500 truncate leading-tight mt-0.5">
                {user.email}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-violet-950/35 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 min-w-0 overflow-auto">
        <div className="pointer-events-none absolute inset-x-6 top-8 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_68%)] blur-3xl" aria-hidden />
        {children}
      </main>
    </div>
  )
}
