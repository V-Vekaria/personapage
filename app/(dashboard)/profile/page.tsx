import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBanner } from '@/components/ui/StatusBanner'
import { TONES } from '@/types/database'
import type { Profile } from '@/types/database'
import { saveProfile } from './actions'
import { ProjectsEditor } from './ProjectsEditor'

const inputClass =
  'w-full rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-white transition placeholder:text-zinc-600 focus:border-violet-300/35 focus:outline-none focus:ring-1 focus:ring-violet-300/35'
const labelClass = 'mb-1.5 block text-sm text-zinc-300'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { success, error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return (
    <div className="relative z-10 max-w-3xl p-4 sm:p-6 md:p-8">
      <header className="mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/65 p-5 shadow-[0_0_42px_rgba(124,58,237,0.1)] backdrop-blur sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-200/75">Profile</p>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          One source of truth. Every tailored link is written from what is on this page — nothing
          else is invented.
        </p>
        <StatusBanner success={success} error={error} />
      </header>

      <form
        action={saveProfile}
        className="space-y-6 rounded-lg border border-violet-300/10 bg-zinc-950/55 p-5 shadow-[0_0_34px_rgba(124,58,237,0.08)] sm:p-6"
      >
        <div>
          <label className={labelClass} htmlFor="username">Username</label>
          <div className="flex items-center rounded-lg border border-violet-300/10 bg-zinc-900/80 px-3 py-2.5 transition focus-within:border-violet-300/35 focus-within:ring-1 focus-within:ring-violet-300/35">
            <span className="mr-1 shrink-0 text-sm text-violet-100/55">/p/</span>
            <input
              id="username"
              name="username"
              defaultValue={profile?.username ?? ''}
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              placeholder="yourname"
              autoComplete="off"
            />
          </div>
          <p className="mt-1 text-xs text-yellow-200/70">
            This is your public URL. Changing it breaks every link you have already shared.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className={labelClass} htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              className={inputClass}
              placeholder="e.g. Vishnu Vekaria"
            />
          </div>
          <div className="flex-1">
            <label className={labelClass} htmlFor="contact">Contact</label>
            <input
              id="contact"
              name="contact"
              defaultValue={profile?.contact ?? ''}
              className={inputClass}
              placeholder="linkedin.com/in/yourname"
            />
            <p className="mt-1 text-xs text-zinc-500">A profile URL or an email address.</p>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="headline">Headline</label>
          <input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ''}
            className={inputClass}
            placeholder="e.g. CS student building AI products"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile?.bio ?? ''}
            className={`${inputClass} resize-none`}
            placeholder="What you build, and why. A few sentences is plenty."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="skills">Skills</label>
          <input
            id="skills"
            name="skills"
            defaultValue={profile?.skills?.join(', ') ?? ''}
            className={inputClass}
            placeholder="React, TypeScript, Next.js, Python"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Comma separated. Each link reorders these for its own audience.
          </p>
        </div>

        <ProjectsEditor initial={profile?.projects ?? []} />

        <fieldset>
          <legend className="mb-3 block text-sm text-zinc-300">Tone</legend>
          <div className="flex flex-wrap gap-4">
            {TONES.map((tone) => (
              <label key={tone} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="tone"
                  value={tone}
                  defaultChecked={(profile?.tone ?? 'neutral') === tone}
                  className="accent-violet-300"
                />
                <span className="text-sm capitalize text-zinc-300">{tone}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-white to-violet-100 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}
