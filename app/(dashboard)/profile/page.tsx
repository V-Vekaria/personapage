import { createClient } from '@/lib/supabase/server'
import { saveProfile } from './actions'
import { ProjectsEditor } from './ProjectsEditor'

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

  const projects: { title: string; description: string; tech: string[] }[] =
    profile?.projects ?? []

  const inputClass =
    'w-full bg-zinc-900/80 border border-violet-300/10 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-300/35 focus:border-violet-300/35 transition'
  const labelClass = 'block text-sm text-zinc-300 mb-1.5'

  return (
    <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl">
      <div className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 sm:p-6 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur">
        <p className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-3">
          Profile
        </p>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-zinc-300 text-sm mt-2">This is what the AI uses to generate your links</p>

        {params.success && (
          <div className="mt-4 px-4 py-3 bg-emerald-950/70 border border-emerald-700/70 rounded-lg text-emerald-300 text-sm">
            Profile saved
          </div>
        )}
        {params.error && (
          <div className="mt-4 px-4 py-3 bg-red-950/80 border border-red-800/80 rounded-lg text-red-300 text-sm">
            {params.error}
          </div>
        )}
      </div>

      <form action={saveProfile} className="space-y-6 rounded-lg border border-violet-300/10 bg-zinc-950/55 p-5 sm:p-6 shadow-[0_0_34px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={labelClass}>Full Name</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              className={inputClass}
              placeholder="e.g. Vishnu Vekaria"
            />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Contact / LinkedIn</label>
            <input
              name="contact"
              defaultValue={profile?.contact ?? ''}
              className={inputClass}
              placeholder="linkedin.com/in/yourname"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Headline</label>
          <input
            name="headline"
            defaultValue={profile?.headline ?? ''}
            className={inputClass}
            placeholder="e.g. CS student building AI products"
          />
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ''}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className={labelClass}>Skills</label>
          <input
            name="skills"
            defaultValue={profile?.skills?.join(', ') ?? ''}
            className={inputClass}
            placeholder="React, TypeScript, Next.js, Python"
          />
          <p className="text-zinc-500 text-xs mt-1">Comma separated</p>
        </div>

        <ProjectsEditor initial={projects} />

        <div>
          <label className="block text-sm text-zinc-300 mb-3">Tone</label>
          <div className="flex flex-wrap gap-3">
            {['casual', 'neutral', 'formal'].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={t}
                  defaultChecked={profile?.tone === t || (!profile?.tone && t === 'neutral')}
                  className="accent-violet-200"
                />
                <span className="text-sm text-zinc-300 capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium text-sm rounded-lg px-5 py-2.5 shadow-[0_0_30px_rgba(124,58,237,0.22)] hover:from-white hover:to-fuchsia-100 transition"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}
