import { describe, expect, it } from 'vitest'
import { generateSlug, slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Vishnu Vekaria')).toBe('vishnu-vekaria')
  })

  it('collapses runs of punctuation into a single hyphen', () => {
    expect(slugify('a!!!  b')).toBe('a-b')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --hello--  ')).toBe('hello')
  })

  it('returns an empty string when nothing survives', () => {
    expect(slugify('!!!')).toBe('')
  })
})

describe('generateSlug', () => {
  it('joins username, context and a random suffix', () => {
    const slug = generateSlug('vishnu', 'job_application', () => 0)
    expect(slug).toBe('vishnu-job-application-aaaaaa')
  })

  it('produces a URL-safe slug for every context', () => {
    for (const context of ['job_application', 'networking', 'general'] as const) {
      expect(generateSlug('Some User', context)).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('varies between calls so two links never collide by construction', () => {
    const slugs = new Set(Array.from({ length: 50 }, () => generateSlug('vishnu', 'networking')))
    expect(slugs.size).toBe(50)
  })

  it('drops an empty username rather than emitting a leading hyphen', () => {
    expect(generateSlug('!!!', 'general', () => 0)).toBe('general-aaaaaa')
  })
})
