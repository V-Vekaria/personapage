import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-5xl mx-auto">
        <span className="text-white font-semibold tracking-tight">PersonaPage</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-white text-zinc-950 font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden max-w-5xl mx-auto px-8 pt-20 pb-24">
        <ParticleBackground />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Built for London Tech Week
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-6">
            One profile.
            <br />
            <span className="text-zinc-500">Every room you walk into.</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-xl leading-relaxed mb-10">
            PersonaPage generates a different version of your professional profile for every context —
            recruiters, investors, conference networking. One link, tailored by AI.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-zinc-950 font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition"
            >
              Create your page →
            </Link>
            <Link
              href="/p/vishnu?link=vishnu-conference-dqcs"
              className="text-sm text-zinc-400 hover:text-white transition"
              target="_blank"
            >
              See an example ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-10">
          How it works
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Fill your profile',
              description: 'Add your bio, skills, and projects once. This is your master profile.',
            },
            {
              step: '02',
              title: 'Create a link',
              description: 'Choose a context — conference, investor, recruiter. AI generates a tailored version.',
            },
            {
              step: '03',
              title: 'Share it',
              description: 'Copy the link and share it. The person you send it to sees a profile built for them.',
            },
          ].map((item) => (
            <div key={item.step} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-xs text-zinc-600 font-mono mb-4">{item.step}</div>
              <h3 className="text-white font-medium mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-semibold mb-3">Ready to stand out?</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Built for people who wear multiple hats and need a different link for every room they walk into.
          </p>
          <Link
            href="/signup"
            className="inline-flex bg-white text-zinc-950 font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-8 py-6 max-w-5xl mx-auto flex items-center justify-between">
        <span className="text-xs text-zinc-600">PersonaPage</span>
        <span className="text-xs text-zinc-600">Built for London Tech Week 2026</span>
      </footer>

    </div>
  )
}