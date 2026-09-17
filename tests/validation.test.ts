import { describe, expect, it } from 'vitest'
import {
  generatedContentSchema,
  passwordSchema,
  RESERVED_USERNAMES,
  usernameSchema,
  viewRequestSchema,
} from '@/lib/validation'

describe('usernameSchema', () => {
  it.each(['vishnu', 'v-v', 'user_123', 'abc'])('accepts %s', (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(true)
  })

  it('lowercases and trims', () => {
    expect(usernameSchema.parse('  VishNu  ')).toBe('vishnu')
  })

  it.each([
    ['ab', 'too short'],
    ['-vishnu', 'leading hyphen'],
    ['vishnu-', 'trailing hyphen'],
    ['vish nu', 'contains a space'],
    ['vishnu!', 'contains punctuation'],
    ['a'.repeat(31), 'too long'],
  ])('rejects %s (%s)', (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(false)
  })

  it('reserves names that would shadow app routes', () => {
    for (const name of ['login', 'dashboard', 'api', 'analytics']) {
      expect(RESERVED_USERNAMES.has(name)).toBe(true)
    }
  })
})

describe('passwordSchema', () => {
  it('requires at least 8 characters', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false)
    expect(passwordSchema.safeParse('longenough').success).toBe(true)
  })
})

describe('generatedContentSchema', () => {
  const valid = {
    headline: 'A headline',
    summary: 'A summary.',
    skills: ['TypeScript'],
    cta_text: 'Get in touch.',
  }

  it('accepts well-formed content', () => {
    expect(generatedContentSchema.safeParse(valid).success).toBe(true)
  })

  it('defaults a missing skills array to empty rather than failing', () => {
    const parsed = generatedContentSchema.safeParse({ ...valid, skills: undefined })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.skills).toEqual([])
  })

  it('rejects an empty headline, which would render as a blank page heading', () => {
    expect(generatedContentSchema.safeParse({ ...valid, headline: '   ' }).success).toBe(false)
  })

  it('rejects a summary long enough to break the layout', () => {
    expect(generatedContentSchema.safeParse({ ...valid, summary: 'x'.repeat(2001) }).success).toBe(false)
  })
})

describe('viewRequestSchema', () => {
  it('requires a UUID link_id, so arbitrary ids cannot create rows', () => {
    expect(viewRequestSchema.safeParse({ link_id: 'not-a-uuid' }).success).toBe(false)
    expect(
      viewRequestSchema.safeParse({ link_id: '123e4567-e89b-12d3-a456-426614174000' }).success
    ).toBe(true)
  })

  it('rejects a device value outside the two buckets', () => {
    const result = viewRequestSchema.safeParse({
      link_id: '123e4567-e89b-12d3-a456-426614174000',
      device: 'watch',
    })
    expect(result.success).toBe(false)
  })
})
