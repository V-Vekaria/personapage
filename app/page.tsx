import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
        <span className="text-white font-semibold tracking-tight">PersonaPage</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium px-4 py-2 rounded-lg shadow-[0_0_24px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.32)] transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden max-w-5xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <ParticleBackground />
        <div className="absolute inset-x-4 top-12 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_68%)] blur-3xl" aria-hidden />
        <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)] lg:items-center">
          <div>
            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-violet-950/30 border border-violet-400/20 rounded-2xl px-3 py-1.5 text-xs leading-snug text-violet-100/80 mb-8 max-w-full shadow-[0_0_28px_rgba(124,58,237,0.12)]">
              <span className="w-1.5 h-1.5 shrink-0 bg-violet-300 rounded-full shadow-[0_0_12px_rgba(196,181,253,0.85)]" aria-hidden />
              Demo prepared for London Tech Week networking
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-balance mb-6">
              One link for
              <br />
              <span className="bg-gradient-to-r from-violet-100 via-fuchsia-200 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(167,139,250,0.18)]">
                every room you walk into.
              </span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
              The side project, the client work, the thing you're raising for — you don't
              pitch them the same way in person, so why does your link? Build one profile,
              share the version that fits the conversation.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium px-6 py-3 rounded-lg hover:from-white hover:to-fuchsia-100 transition text-center shadow-[0_0_30px_rgba(124,58,237,0.24)] hover:shadow-[0_0_38px_rgba(124,58,237,0.36)]"
              >
                Create your page
              </Link>
              <Link
                href="/p/vishnu?link=vishnu-conference-dqcs"
                className="inline-flex w-full sm:w-auto items-center justify-center text-sm text-violet-100 bg-violet-950/35 border border-violet-400/25 px-6 py-3 rounded-lg hover:bg-violet-900/45 hover:border-violet-300/40 hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                See a live version
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative rounded-lg border border-violet-300/15 bg-zinc-950/75 p-5 shadow-[0_24px_80px_rgba(24,8,45,0.6),0_0_40px_rgba(124,58,237,0.16)] backdrop-blur">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-400/5" aria-hidden />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 border-b border-violet-200/10 pb-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-white">Vishnu Vekaria</div>
                    <div className="mt-1 text-xs leading-relaxed text-zinc-400">
                      Computing Systems Student
                    </div>
                  </div>
                  <div className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">
                    Recruiter view
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3">
                    <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-violet-100/70">
                      Focus areas
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.65)]" aria-hidden />
                        Full-stack projects
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.65)]" aria-hidden />
                        AI product demos
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.65)]" aria-hidden />
                        Backend/API experience
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex rounded-lg bg-gradient-to-r from-violet-200 to-white px-3 py-2 text-xs font-medium text-zinc-950">
                    Tailored profile ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        <p className="text-xs font-medium text-violet-200/70 uppercase tracking-widest mb-10">
          How it works
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Build your master profile',
              description:
                'Add your projects, skills, links, and goals once. That\'s the source everything else is generated from — you maintain one thing, not five.',
            },
            {
              step: '02',
              title: 'Pick the room',
              description:
                'Recruiter, collaborator, client, investor. Tell PersonaPage who\'s looking and it adapts what you lead with — reordering your work, reframing your bio, surfacing what matters to that person.',
            },
            {
              step: '03',
              title: 'Share the right version',
              description:
                'Copy the link and hand over a profile built for the conversation you\'re actually having — not the same generic bio you send everyone.',
            },
          ].map((item) => (
            <div key={item.step} className="bg-zinc-950/70 border border-zinc-800/90 rounded-lg p-6 transition hover:border-violet-300/35 hover:bg-zinc-900/80 hover:shadow-[0_0_34px_rgba(124,58,237,0.13)]">
              <div className="text-xs text-violet-200 font-mono mb-4">{item.step}</div>
              <h3 className="text-zinc-50 font-medium mb-2">{item.title}</h3>
              <p className="text-zinc-300/85 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        <div className="bg-[linear-gradient(135deg,rgba(39,39,42,0.9),rgba(76,29,149,0.24),rgba(24,24,27,0.92))] border border-violet-300/15 rounded-lg p-6 sm:p-10 text-center shadow-[0_0_46px_rgba(124,58,237,0.12)]">
          <h2 className="text-xl sm:text-2xl font-semibold text-balance mb-3">
            Different room. Different link. Same you.
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Built for people who wear multiple hats and need their profile to keep up —
            builders shipping side projects, taking client work, and networking all at once.
          </p>
          <Link
            href="/signup"
            className="inline-flex bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium px-6 py-3 rounded-lg hover:from-white hover:to-fuchsia-100 transition shadow-[0_0_30px_rgba(124,58,237,0.24)]"
          >
            Create your page
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-300/10 px-4 sm:px-8 py-6 max-w-5xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-zinc-600">PersonaPage</span>
        <span className="text-xs text-zinc-600 leading-snug">
          Demo prepared for London Tech Week networking
        </span>
      </footer>

    </div>
  )
}
