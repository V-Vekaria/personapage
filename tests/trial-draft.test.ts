import { describe, expect, it } from 'vitest'
import { storedDraftSchema, trialRequestSchema } from '@/lib/validation'

describe('trialRequestSchema', () => {
  const draft = {
    full_name: 'Sam Okafor',
    headline: 'Engineer',
    bio: 'I build things.',
    skills: ['TypeScript'],
    projects: [{ title: 'Trackpoint', description: 'Uptime monitor', tech: ['Go'] }],
    tone: 'neutral' as const,
  }

  it('accepts a well-formed request', () => {
    expect(trialRequestSchema.safeParse({ draft, context: 'job_application' }).success).toBe(true)
  })

  it('rejects an unknown context', () => {
    expect(trialRequestSchema.safeParse({ draft, context: 'wedding' }).success).toBe(false)
  })

  it('caps the bio so the endpoint cannot be used as a free LLM proxy', () => {
    const result = trialRequestSchema.safeParse({
      draft: { ...draft, bio: 'x'.repeat(901) },
      context: 'general',
    })
    expect(result.success).toBe(false)
  })

  it('caps the number of skills', () => {
    const result = trialRequestSchema.safeParse({
      draft: { ...draft, skills: Array.from({ length: 16 }, (_, i) => `skill-${i}`) },
      context: 'general',
    })
    expect(result.success).toBe(false)
  })

  it('caps the number of projects', () => {
    const result = trialRequestSchema.safeParse({
      draft: { ...draft, projects: Array.from({ length: 4 }, () => draft.projects[0]) },
      context: 'general',
    })
    expect(result.success).toBe(false)
  })

  it('fills in defaults for an otherwise empty draft', () => {
    const result = trialRequestSchema.safeParse({ draft: {}, context: 'general' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.draft.skills).toEqual([])
    expect(result.success && result.data.draft.tone).toBe('neutral')
  })
})

describe('storedDraftSchema', () => {
  it('parses what the browser stores', () => {
    const parsed = storedDraftSchema.safeParse({
      full_name: 'Sam',
      headline: 'Engineer',
      bio: 'Hello',
      skills: 'TypeScript, Go',
      tone: 'casual',
      project: { title: 'Trackpoint', description: 'Monitor', tech: 'Go, React' },
    })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.skills).toBe('TypeScript, Go')
  })

  it('supplies an empty project when one is absent', () => {
    const parsed = storedDraftSchema.safeParse({ full_name: 'Sam' })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.project.title).toBe('')
  })

  it('rejects an oversized skills string', () => {
    expect(storedDraftSchema.safeParse({ skills: 'x'.repeat(601) }).success).toBe(false)
  })

  it('rejects a tone outside the allowed set', () => {
    expect(storedDraftSchema.safeParse({ tone: 'aggressive' }).success).toBe(false)
  })
})
