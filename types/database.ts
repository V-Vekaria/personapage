/**
 * Shapes returned by Supabase. These mirror supabase/migrations/0001_init.sql —
 * if you change a column there, change it here too.
 */

export const CONTEXTS = [
  'job_application',
  'networking',
  'investor',
  'conference',
  'general',
] as const

export type Context = (typeof CONTEXTS)[number]

export const CONTEXT_LABELS: Record<Context, string> = {
  job_application: 'Job application',
  networking: 'Networking',
  investor: 'Investor pitch',
  conference: 'Conference / event',
  general: 'General',
}

export const TONES = ['casual', 'neutral', 'formal'] as const
export type Tone = (typeof TONES)[number]

export interface Project {
  title: string
  description: string
  tech: string[]
}

export interface Profile {
  id: string
  username: string
  full_name: string | null
  contact: string | null
  headline: string | null
  bio: string | null
  skills: string[]
  projects: Project[]
  tone: Tone
  created_at: string
  updated_at: string
}

/** What the AI (or the offline fallback) produces for one link. */
export interface GeneratedContent {
  headline: string
  summary: string
  skills: string[]
  cta_text: string
}

export interface Link {
  id: string
  user_id: string
  context: Context
  label: string
  slug: string
  generated_content: GeneratedContent | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Who a link is aimed at, and the posting it was written against.
 *
 * Stored apart from `Link` because `Link` is public and this is not — see
 * supabase/migrations/0002_link_targets.sql.
 */
export interface LinkTarget {
  link_id: string
  recipient: string
  source_url: string | null
  description: string
  created_at: string
  updated_at: string
}

/** One outbound click on a public profile — the conversion event. */
export interface LinkClick {
  id: string
  link_id: string
  target: string
  referrer: string | null
  country: string | null
  device: 'mobile' | 'desktop' | null
  created_at: string
}

export interface LinkView {
  id: string
  link_id: string
  referrer: string | null
  country: string | null
  device: 'mobile' | 'desktop' | null
  /**
   * How long the page was visible during this view, in milliseconds.
   *
   * Null for most rows and that is expected — the beacon carrying it is best
   * effort and browsers drop it. Anything reading this must treat a missing
   * value as "not measured", never as zero.
   */
  dwell_ms: number | null
  created_at: string
}

export function isContext(value: string): value is Context {
  return (CONTEXTS as readonly string[]).includes(value)
}
