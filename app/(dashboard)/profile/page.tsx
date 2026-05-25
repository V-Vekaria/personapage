import { createClient } from '@/lib/supabase/server'
import { saveProfile } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">This is what the AI uses to generate your links</p>

        {params.success && (
          <div className="mt-4 px-4 py-3 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 text-sm">
            Profile saved ✓
          </div>
        )}
        {params.error && (
          <div className="mt-4 px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
            {params.error}
          </div>
        )}
      </div>

      <form action={saveProfile} className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Headline</label>
          <input
            name="headline"
            defaultValue={profile?.headline ?? ''}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
            placeholder="e.g. CS student building AI products"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ''}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition resize-none"
            placeholder="Tell us about yourself, your background, what you're working on..."
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Skills</label>
          <input
            name="skills"
            defaultValue={profile?.skills?.join(', ') ?? ''}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
            placeholder="React, TypeScript, Next.js, Python, AI/ML"
          />
          <p className="text-zinc-600 text-xs mt-1">Comma separated</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-3">Tone</label>
          <div className="flex gap-3">
            {['casual', 'neutral', 'formal'].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={t}
                  defaultChecked={profile?.tone === t || (!profile?.tone && t === 'neutral')}
                  className="accent-white"
                />
                <span className="text-sm text-zinc-400 capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-white text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 hover:bg-zinc-100 transition"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}