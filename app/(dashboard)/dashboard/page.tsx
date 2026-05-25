import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, headline')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Welcome back{profile?.username ? `, ${profile.username}` : ''}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {profile?.headline ?? 'Complete your profile to get started'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <a href="/profile" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition">
          <div className="text-white font-medium text-sm mb-1">Edit Profile</div>
          <div className="text-zinc-500 text-xs">Add your bio, skills, projects</div>
        </a>
        <a href="/links" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition">
          <div className="text-white font-medium text-sm mb-1">Create Link</div>
          <div className="text-zinc-500 text-xs">Generate your smart profile link</div>
        </a>
      </div>
    </div>
  )
}