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
