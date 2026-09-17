import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ViewCapture } from '@/components/public/ViewCapture'
import { ContactLink } from '@/components/public/ContactLink'
import { connectLabel, contactHref } from '@/lib/contact'
import { siteUrl } from '@/lib/site'
import { CONTEXT_LABELS } from '@/types/database'
import type { Link as ProfileLink, Profile, Project } from '@/types/database'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ link?: string }>
}

/**
 * Loads the profile and the link being viewed.
 *
 * Uses the service-role client because visitors are anonymous, and reads only
 * intentionally public data. Shared by the page and its metadata so a request
 * does not resolve the same rows twice under different rules.
 */
async function loadProfilePage(username: string, slug?: string) {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, contact, headline, bio, skills, projects, tone, created_at, updated_at')
    .ilike('username', username)
    .maybeSingle<Profile>()

  if (!profile) return null

  // Explicit columns, never '*'. The public path must not be one refactor away
  // from serving a pasted job description to the internet.
  const query = supabase
    .from('links')
    .select('id, user_id, context, label, slug, generated_content, is_active, created_at, updated_at')
    .eq('user_id', profile.id)

  const { data: link } = slug
    ? await query.eq('slug', slug).maybeSingle<ProfileLink>()
    : await query
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<ProfileLink>()

  return { profile, link: link ?? null }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { username } = await params
  const { link: slug } = await searchParams
  const data = await loadProfilePage(username, slug)

  if (!data) {
    return { title: 'Profile not found · PersonaPage', robots: { index: false, follow: false } }
  }

  const { profile, link } = data
  const name = profile.full_name || profile.username
  const content = link?.generated_content
  const title = `${name} · PersonaPage`
  const description =
    content?.summary ||
    profile.bio ||
    content?.headline ||
    profile.headline ||
    `The profile of ${name}.`

  const path = slug
    ? `/p/${encodeURIComponent(profile.username)}?link=${encodeURIComponent(slug)}`
    : `/p/${encodeURIComponent(profile.username)}`

  return {
    metadataBase: new URL(siteUrl()),
    title,
    // Social cards truncate hard — keep the useful half above the fold.
    description: description.slice(0, 200),
    alternates: { canonical: path },
    openGraph: {
      type: 'profile',
      title,
      description: description.slice(0, 200),
      url: path,
      siteName: 'PersonaPage',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 200),
    },
    // A tailored link is meant for one conversation, not for a search index.
    robots: slug ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { link: slug } = await searchParams

  const data = await loadProfilePage(username, slug)
  if (!data) notFound()

  const { profile, link } = data
  const content = link?.generated_content
  const skills = content?.skills?.length ? content.skills : (profile.skills ?? [])
  const projects: Project[] = profile.projects ?? []
  const contact = profile.contact?.trim() || null

  const badge = link
    ? (CONTEXT_LABELS[link.context] ?? 'Profile')
    : 'Profile'

  return (
    <ProfileShell>
      {link && <ViewCapture linkId={link.id} />}

      <header className="mb-6 rounded-lg border border-violet-300/15 bg-zinc-950/75 p-5 shadow-[0_24px_80px_rgba(24,8,45,0.55),0_0_42px_rgba(124,58,237,0.14)] backdrop-blur sm:mb-8 sm:p-7">
        <p className="mb-5 inline-flex rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
          {badge}
        </p>
        <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {profile.full_name || profile.username}
        </h1>
        <p className="mt-3 break-words text-base leading-relaxed text-violet-100/90 sm:text-lg">
          {content?.headline || profile.headline || 'Building things.'}
        </p>
        {(content?.summary || profile.bio) && (
          <p className="mt-5 max-w-2xl break-words text-sm leading-relaxed text-zinc-300 sm:text-base">
            {content?.summary || profile.bio}
          </p>
        )}
        {contact && (
          <div className="mt-6">
            <ContactLink href={contactHref(contact)} linkId={link?.id}>
              {connectLabel(contact)}
            </ContactLink>
          </div>
        )}
      </header>

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <article
                key={`${project.title}-${index}`}
                className="rounded-lg border border-zinc-800/90 bg-zinc-900/65 p-4 transition hover:border-violet-300/30 sm:p-5"
              >
                <h3 className="mb-2 font-medium text-white">{project.title}</h3>
                {project.description && (
                  <p className="mb-4 text-sm leading-relaxed text-zinc-300/85">{project.description}</p>
                )}
                {project.tech && project.tech.length > 0 && <TagList items={project.tech} />}
              </article>
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
        <p className="mb-4 text-sm leading-relaxed text-zinc-300">
          {content?.cta_text || 'Open to opportunities and conversations.'}
        </p>
        {contact && (
          <ContactLink href={contactHref(contact)} linkId={link?.id}>
            {connectLabel(contact)}
          </ContactLink>
        )}
      </Section>

      <footer className="border-t border-violet-300/10 pt-6">
        <NextLink href="/" className="text-xs text-zinc-500 transition hover:text-violet-100">
          Built with PersonaPage
        </NextLink>
      </footer>
    </ProfileShell>
  )
}

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] text-white">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-x-4 top-10 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2),transparent_68%)] blur-3xl"
          aria-hidden
        />
        <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">{children}</main>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 rounded-lg border border-violet-300/10 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(124,58,237,0.08)] sm:mb-8 sm:p-6">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-violet-200/75">{title}</h2>
      {children}
    </section>
  )
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-violet-300/15 bg-violet-950/40 px-2.5 py-1 text-xs text-violet-50/85"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
