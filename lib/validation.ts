import { z } from 'zod'
import { CONTEXTS, TONES } from '@/types/database'

/** Shape every generated profile must satisfy before it reaches the database. */
export const generatedContentSchema = z.object({
  headline: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(2000),
  skills: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  cta_text: z.string().trim().min(1).max(400),
})

export const generateRequestSchema = z.object({
  link_id: z.uuid(),
})

export const viewRequestSchema = z.object({
  link_id: z.uuid(),
  referrer: z.string().max(500).nullish(),
  device: z.enum(['mobile', 'desktop']).nullish(),
})

/**
 * A profile typed by someone who has not signed up.
 *
 * Every field is hard-capped. This payload goes straight into a model prompt,
 * so without caps the endpoint would be a free LLM proxy for anyone willing to
 * paste a few thousand words into a "bio" field. The caps are generous for a
 * real profile and useless for anything else.
 */
export const trialProjectSchema = z.object({
  title: z.string().trim().max(120).default(''),
  description: z.string().trim().max(400).default(''),
  tech: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
})

export const trialDraftSchema = z.object({
  full_name: z.string().trim().max(80).default(''),
  headline: z.string().trim().max(160).default(''),
  bio: z.string().trim().max(900).default(''),
  skills: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  projects: z.array(trialProjectSchema).max(3).default([]),
  tone: z.enum(TONES).default('neutral'),
})

export const trialRequestSchema = z.object({
  draft: trialDraftSchema,
  context: z.enum(CONTEXTS),
})

export type TrialDraft = z.infer<typeof trialDraftSchema>

/**
 * The /try draft as the browser stores it, where skills and tech are still the
 * raw comma-separated strings the user typed.
 */
export const storedDraftSchema = z.object({
  full_name: z.string().trim().max(80).default(''),
  headline: z.string().trim().max(160).default(''),
  bio: z.string().trim().max(900).default(''),
  skills: z.string().max(600).default(''),
  tone: z.enum(TONES).default('neutral'),
  project: z
    .object({
      title: z.string().trim().max(120).default(''),
      description: z.string().trim().max(400).default(''),
      tech: z.string().max(300).default(''),
    })
    .default({ title: '', description: '', tech: '' }),
})

/**
 * A link's target: who it is going to, and the posting it should be written
 * against.
 *
 * The description cap is generous for a real job posting and far short of what
 * would make this an interesting way to push arbitrary text into a model. The
 * database enforces the same ceiling independently.
 */
export const linkTargetSchema = z.object({
  recipient: z.string().trim().max(160).default(''),
  source_url: z
    .union([z.url(), z.literal('')])
    .optional()
    .transform((value) => value || null),
  description: z.string().trim().max(12000).default(''),
})

export type LinkTargetInput = z.infer<typeof linkTargetSchema>

/**
 * A read time reported for one view.
 *
 * Anything past a day is nonsense rather than a long read and is rejected;
 * everything below that is clamped to DWELL_CAP_MS by the route, so a browser
 * with a skewed clock costs one capped row rather than a 400.
 */
export const dwellRequestSchema = z.object({
  view_id: z.uuid(),
  ms: z.number().int().min(0).max(86_400_000),
})

export const clickRequestSchema = z.object({
  link_id: z.uuid(),
  target: z.string().trim().min(1).max(40).default('contact'),
  referrer: z.string().max(500).nullish(),
  device: z.enum(['mobile', 'desktop']).nullish(),
})

export const contextSchema = z.enum(CONTEXTS)
export const toneSchema = z.enum(TONES)

/**
 * Usernames become public URLs, so keep them to a boring, unambiguous subset:
 * lowercase letters, digits, hyphens and underscores.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be 30 characters or fewer')
  .regex(
    /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/,
    'Username can only use letters, numbers, hyphens and underscores'
  )

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(200, 'Password is too long')

export const emailSchema = z.email('Enter a valid email address')

/** Reserved so they can never shadow a real or future app route. */
export const RESERVED_USERNAMES = new Set([
  'about', 'admin', 'analytics', 'api', 'app', 'auth', 'blog', 'dashboard',
  'docs', 'help', 'home', 'link', 'links', 'login', 'logout', 'me', 'new',
  'p', 'pricing', 'privacy', 'profile', 'root', 'settings', 'signin', 'signup',
  'static', 'support', 'terms', 'www',
])
