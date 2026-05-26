import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ViewCapture } from '@/components/public/ViewCapture'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — PersonaPage`,
    description: `Professional profile for ${username}`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Find the profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // 2. Get their first active link
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const primaryLink = links?.[0]

  // Parse data
  const skills: string[] = profile.skills ?? []
  const projects: any[] = profile.projects ?? []
  const generatedContent = primaryLink?.generated_content

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Analytics capture — invisible */}
      {primaryLink && <ViewCapture linkId={primaryLink.id} />}

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {profile.full_name || username}
          </h1>
          <p className="text-zinc-300 text-lg leading-relaxed">
            {generatedContent?.headline || profile.headline || 'Building things.'}
          </p>
        </div>

        {/* About */}
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

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Projects
            </h2>
            <div className="space-y-6">
              {projects.map((project: any, i: number) => (
                <div
                  key={i}
                  className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50"
                >
                  <h3 className="text-white font-medium mb-1">{project.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                    {project.description}
                  </p>
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t: string, j: number) => (
                        <span
                          key={j}
                          className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                        >
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

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mb-16">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Get in touch
          </h2>
          <p className="text-zinc-300 text-sm">
            {generatedContent?.cta_text || 'Open to opportunities and conversations.'}
          </p>
        </div>

        {/* Footer — growth loop */}
        <div className="border-t border-zinc-800 pt-6">
          <a
            href="/"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition"
          >
            Built with PersonaPage
          </a>
        </div>

      </div>
    </div>
  )
}