import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/server'
import { PUBLIC_LINK_COLUMNS, PUBLIC_PROFILE_COLUMNS } from '@/lib/supabase/columns'
import type { Link as ProfileLink, Profile } from '@/types/database'

export const runtime = 'nodejs'
export const alt = 'PersonaPage profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The social preview card for a public profile.
 *
 * This is the first thing anyone sees when a link is pasted into Slack,
 * LinkedIn or iMessage, so it renders the real name and headline rather than a
 * generic logo.
 *
 * Note: OG images are fetched by crawlers without the query string, so this
 * shows the profile's default link, not the tailored one. That is the right
 * trade-off — a card that leaked "investor pitch" into a group chat would be
 * worse than a slightly generic one.
 */
export default async function Image({ params }: { params: { username: string } }) {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .ilike('username', params.username)
    .maybeSingle<Profile>()

  const { data: link } = profile
    ? await supabase
        .from('links')
        .select(PUBLIC_LINK_COLUMNS)
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<ProfileLink>()
    : { data: null }

  const name = profile?.full_name || profile?.username || params.username
  const headline =
    link?.generated_content?.headline || profile?.headline || 'Professional profile'
  const skills = (
    link?.generated_content?.skills?.length ? link.generated_content.skills : profile?.skills ?? []
  ).slice(0, 5)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'linear-gradient(140deg, #09090b 0%, #1c1030 55%, #09090b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#c4b5fd',
            }}
          />
          <div style={{ fontSize: 24, color: '#c4b5fd', letterSpacing: 2 }}>PERSONAPAGE</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              color: '#ddd6fe',
              lineHeight: 1.35,
              // ImageResponse has no ellipsis support, so cut the string itself.
              maxWidth: 940,
            }}
          >
            {headline.length > 120 ? `${headline.slice(0, 117)}…` : headline}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {skills.map((skill) => (
            <div
              key={skill}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '1px solid rgba(196,181,253,0.28)',
                background: 'rgba(124,58,237,0.18)',
                color: '#ede9fe',
                fontSize: 24,
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
