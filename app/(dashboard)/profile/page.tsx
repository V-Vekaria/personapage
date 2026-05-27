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

  // Fetch the current user's profile from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Default to one empty project slot if no projects saved yet
  const projects: { title: string; description: string; tech: string[] }[] =
    profile?.projects ?? [{ title: '', description: '', tech: [] }]

  return (
    <div className="p-8 max-w-2xl">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">This is what the AI uses to generate your links</p>

        {/* Success / Error feedback */}
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

        {/* ── Identity: Full Name + Contact ── */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-1.5">Full Name</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
              placeholder="e.g. Vishnu Vekaria"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-1.5">Contact / LinkedIn</label>
            <input
              name="contact"
              defaultValue={profile?.contact ?? ''}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
              placeholder="linkedin.com/in/yourname"
            />
          </div>
        </div>

        {/* ── Headline ── */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Headline</label>
          <input
            name="headline"
            defaultValue={profile?.headline ?? ''}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
            placeholder="e.g. CS student building AI products"
          />
        </div>

        {/* ── Bio ── */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ''}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* ── Skills ── */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Skills</label>
          <input
            name="skills"
            defaultValue={profile?.skills?.join(', ') ?? ''}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
            placeholder="React, TypeScript, Next.js, Python"
          />
          <p className="text-zinc-600 text-xs mt-1">Comma separated</p>
        </div>

        {/* ── Projects ── */}
        <div>
          <label className="block text-sm text-zinc-400 mb-3">Projects</label>
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                {/* Project name */}
                <input
                  name="project_title"
                  defaultValue={project.title}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
                  placeholder="Project name e.g. PersonaPage"
                />
                {/* Project description */}
                <textarea
                  name="project_description"
                  defaultValue={project.description}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition resize-none"
                  placeholder="What does it do? What problem does it solve?"
                />
                {/* Tech stack — comma separated */}
                <input
                  name="project_tech"
                  defaultValue={project.tech?.join(', ')}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
                  placeholder="Tech used e.g. Next.js, Supabase, OpenAI"
                />
              </div>
            ))}
          </div>
          <p className="text-zinc-600 text-xs mt-2">Add your key projects — the AI uses these to tailor your profile</p>
        </div>

        {/* ── Tone ── */}
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

        {/* ── Submit ── */}
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