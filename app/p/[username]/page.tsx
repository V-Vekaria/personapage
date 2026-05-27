import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ViewCapture } from '@/components/public/ViewCapture'
import type { Metadata } from 'next'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — PersonaPage`,
    description: `Professional profile for ${username}`,
  }
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { link: slug } = await searchParams
  const supabase = createAdminClient()

  // ── 1. Find profile by username ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) notFound()

  // ── 2. Load the specific link if slug provided, else fall back to first active link ──
  let activeLink = null

  if (slug) {
    // Visitor came via a shared link — load that link's AI content
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', profile.id)
      .single()
    activeLink = data
  } else {
    // No slug — show default (first active link)
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

  // ── 3. Parse profile data ──
  const skills: string[] = profile.skills ?? []
  const projects: any[] = profile.projects ?? []
  const generatedContent = activeLink?.generated_content // AI-generated content for this link

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Analytics — invisible component that records this page view */}
      {activeLink && <ViewCapture linkId={activeLink.id} />}

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* ── Header: Name + AI headline ── */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {profile.full_name || username}
          </h1>
          <p className="text-zinc-300 text-lg leading-relaxed">
            {generatedContent?.headline || profile.headline || 'Building things.'}
          </p>
        </div>

        {/* ── About: AI summary or raw bio ── */}
        {(generatedContent?.summary || profile.bio) && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              About
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              {generatedContent?.summary || profile.bio}
            </p>
          </div>
        )}

        {/* ── Projects ── */}
        {projects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Projects
            </h2>
            <div className="space-y-6">
              {projects.map((project: any, i: number) => (
                <div key={i} className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
                  <h3 className="text-white font-medium mb-1">{project.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-3">{project.description}</p>
                  {/* Tech stack tags */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t: string, j: number) => (
                        <span key={j} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <span key={i} className="text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Get in Touch: AI CTA + contact link ── */}
        <div className="mb-16">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Get in touch
          </h2>
          <p className="text-zinc-300 text-sm mb-3">
            {generatedContent?.cta_text || 'Open to opportunities and conversations.'}
          </p>
          {/* Show connect button if user has set a contact URL */}
          {profile.contact && (
            <a
              href={profile.contact.startsWith('http') ? profile.contact : 'https://' + profile.contact}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition"
            >
              {connectLabel(profile.contact)} →
            </a>
          )}
        </div>

        {/* ── Footer: Growth loop ── */}
        <div className="border-t border-zinc-800 pt-6">
          <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition">
            Built with PersonaPage
          </a>
        </div>

      </div>
    </div>
  )
}