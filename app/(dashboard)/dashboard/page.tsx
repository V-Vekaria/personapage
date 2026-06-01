import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, headline')
    .eq('id', user!.id)
    .single()

  return (
    <div className="relative z-10 p-4 sm:p-6 md:p-8">
      <div className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 sm:p-6 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur">
        <p className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-3">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-white">
          {profile?.headline ? 'Welcome back' : 'Welcome'}{profile?.username ? `, ${profile.username}` : ''}
        </h1>
        <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
          {profile?.headline ?? 'Complete your profile to get started'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <a href="/profile" className="bg-zinc-950/65 border border-zinc-800/90 rounded-lg p-5 hover:border-violet-300/35 hover:bg-zinc-900/75 hover:shadow-[0_0_34px_rgba(124,58,237,0.12)] transition">
          <div className="text-white font-medium text-sm mb-1">Edit Profile</div>
          <div className="text-zinc-400 text-xs leading-relaxed">Add your bio, skills, projects</div>
        </a>
        <a href="/links" className="bg-zinc-950/65 border border-zinc-800/90 rounded-lg p-5 hover:border-violet-300/35 hover:bg-zinc-900/75 hover:shadow-[0_0_34px_rgba(124,58,237,0.12)] transition">
          <div className="text-white font-medium text-sm mb-1">Create Link</div>
          <div className="text-zinc-400 text-xs leading-relaxed">Generate your smart profile link</div>
        </a>
      </div>
    </div>
  )
}
