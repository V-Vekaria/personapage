import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
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
      <section className="relative overflow-hidden max-w-5xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <ParticleBackground />
        <div className="relative z-10">
          <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-1.5 text-xs leading-snug text-zinc-400 mb-8 max-w-full">
            <span className="w-1.5 h-1.5 shrink-0 bg-emerald-400 rounded-full" aria-hidden />
            Demo prepared for London Tech Week networking
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-balance mb-6">
            One profile link.
            <br />
            <span className="text-zinc-500">Different versions for different people.</span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            PersonaPage helps students, builders, freelancers, and early-career professionals create one
            master profile and generate tailored versions for recruiters, networking contacts,
            collaborators, or clients.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-zinc-950 font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition text-center"
            >
              Create your page
            </Link>
            <Link
              href="/p/vishnu?link=vishnu-conference-dqcs"
              className="inline-flex w-full sm:w-auto items-center justify-center text-sm text-zinc-400 hover:text-white transition py-2 sm:py-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              See an example
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-10">
          How it works
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Build your master profile',
              description:
                'Add your bio, skills, projects, links, and goals once. This becomes the source profile PersonaPage works from.',
            },
            {
              step: '02',
              title: 'Choose the audience',
              description:
                'Select the context — recruiter, event contact, collaborator, or client. PersonaPage uses AI to adapt the profile for that audience.',
            },
            {
              step: '03',
              title: 'Share the right version',
              description:
                'Copy the tailored link and send a profile that matches the conversation instead of using the same generic bio everywhere.',
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
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-balance mb-3">
            Build one profile. Share the right version.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            For students, builders, freelancers, and early-career professionals who need a flexible
            professional profile for different opportunities.
          </p>
          <Link
            href="/signup"
            className="inline-flex bg-white text-zinc-950 font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition"
          >
            Create your page
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-4 sm:px-8 py-6 max-w-5xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-zinc-600">PersonaPage</span>
        <span className="text-xs text-zinc-600 leading-snug">
          Demo prepared for London Tech Week networking
        </span>
      </footer>

    </div>
  )
}