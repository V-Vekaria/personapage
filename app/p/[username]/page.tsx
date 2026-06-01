import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ViewCapture } from '@/components/public/ViewCapture'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

type Project = {
  title: string
  description: string
  tech?: string[]
}

function connectLabel(contact: string): string {
  try {
    const url = contact.startsWith('http') ? contact : 'https://' + contact
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('linkedin.com')) return 'Connect on LinkedIn'
    if (host.includes('twitter.com') || host.includes('x.com')) return 'Connect on X'
    if (host.includes('github.com')) return 'View on GitHub'
    if (host.includes('instagram.com')) return 'Connect on Instagram'
    if (host.includes('facebook.com')) return 'Connect on Facebook'
    if (host.includes('bsky.app')) return 'Connect on Bluesky'
    if (host.includes('threads.net')) return 'Connect on Threads'
    if (host.includes('behance.net')) return 'View on Behance'
    if (host.includes('dribbble.com')) return 'View on Dribbble'
    return 'Connect'
  } catch {
    return 'Connect'
  }
}

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ link?: string }>
}

function contactHref(contact: string): string {
  return contact.startsWith('http') ? contact : 'https://' + contact
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} - PersonaPage`,
    description: `Professional profile for ${username}`,
  }
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { link: slug } = await searchParams

  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) notFound()

  let activeLink = null

  if (slug) {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', profile.id)
      .single()
    activeLink = data
  } else {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    activeLink = data
  }

  const skills: string[] = profile.skills ?? []
  const projects: Project[] = profile.projects ?? []
  const generatedContent = activeLink?.generated_content
  const contact = profile.contact as string | null

  return (
    <ProfileShell>
      {activeLink && <ViewCapture linkId={activeLink.id} />}

      <HeroCard
        label={slug ? 'Tailored profile' : 'Public profile'}
        name={profile.full_name || username}
        headline={generatedContent?.headline || profile.headline || 'Building things.'}
        intro={generatedContent?.summary || profile.bio}
        ctaHref={contact ? contactHref(contact) : undefined}
        ctaLabel={contact ? connectLabel(contact) : undefined}
      />

      {(generatedContent?.summary || profile.bio) && (
        <Section title="About">
          <p className="text-zinc-300 leading-relaxed break-words">
            {generatedContent?.summary || profile.bio}
          </p>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <ProjectCard key={`${project.title}-${index}`} project={project} />
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <TagList items={skills} />
        </Section>
      )}

      <Section title="Get in touch">
        <p className="text-zinc-300 text-sm leading-relaxed mb-4">
          {generatedContent?.cta_text || 'Open to opportunities and conversations.'}
        </p>
        {contact && (
          <ProfileButton href={contactHref(contact)}>
            {connectLabel(contact)}
          </ProfileButton>
        )}
      </Section>

      <ProfileFooter />
    </ProfileShell>
  )
}

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-4 top-10 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2),transparent_68%)] blur-3xl" aria-hidden />
        <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-14">
          {children}
        </main>
      </div>
    </div>
  )
}

function HeroCard({
  label,
  name,
  headline,
  intro,
  ctaHref,
  ctaLabel,
}: {
  label: string
  name: string
  headline: string
  intro?: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <header className="mb-6 sm:mb-8 rounded-lg border border-violet-300/15 bg-zinc-950/75 p-5 sm:p-7 shadow-[0_24px_80px_rgba(24,8,45,0.55),0_0_42px_rgba(124,58,237,0.14)] backdrop-blur">
      <div className="mb-5 inline-flex rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
        {label}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white break-words">
        {name}
      </h1>
      <p className="mt-3 text-base sm:text-lg leading-relaxed text-violet-100/90 break-words">
        {headline}
      </p>
      {intro && (
        <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-300 break-words">
          {intro}
        </p>
      )}
      {ctaHref && ctaLabel && (
        <div className="mt-6">
          <ProfileButton href={ctaHref}>{ctaLabel}</ProfileButton>
        </div>
      )}
    </header>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 sm:mb-8 rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 sm:p-6 shadow-[0_0_34px_rgba(124,58,237,0.08)]">
      <h2 className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-zinc-800/90 bg-zinc-900/65 p-4 sm:p-5 transition hover:border-violet-300/30">
      <h3 className="text-white font-medium mb-2">{project.title}</h3>
      <p className="text-zinc-300/85 text-sm leading-relaxed mb-4">{project.description}</p>
      {project.tech && project.tech.length > 0 && <TagList items={project.tech} />}
    </article>
  )
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="text-xs bg-violet-950/40 border border-violet-300/15 text-violet-50/85 px-2.5 py-1 rounded-full">
          {item}
        </span>
      ))}
    </div>
  )
}

function ProfileButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-white to-violet-100 px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
    >
      {children}
    </a>
  )
}

function ProfileFooter() {
  return (
    <footer className="border-t border-violet-300/10 pt-6">
      <a href="/" className="text-xs text-zinc-500 hover:text-violet-100 transition">
        Built with PersonaPage
      </a>
    </footer>
  )
}
