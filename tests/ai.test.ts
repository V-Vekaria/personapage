import { describe, expect, it } from 'vitest'
import { generateFallbackContent, rankSkills } from '@/lib/ai/fallback'
import { buildPrompt } from '@/lib/ai/prompt'
import { CONTEXT_CONFIG } from '@/lib/ai/context-config'
import { generatedContentSchema } from '@/lib/validation'
import { CONTEXTS } from '@/types/database'
import type { Profile } from '@/types/database'

const profile: Profile = {
  id: 'user-1',
  username: 'vishnu',
  full_name: 'Vishnu Vekaria',
  contact: 'linkedin.com/in/vishnu',
  headline: 'Computing systems student building AI products',
  bio: 'I build full-stack products end to end.',
  skills: ['TypeScript', 'React', 'Product strategy', 'PostgreSQL', 'System design', 'Figma'],
  projects: [
    { title: 'PersonaPage', description: 'One profile, many audiences.', tech: ['Next.js', 'Supabase'] },
  ],
  tone: 'neutral',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('rankSkills', () => {
  it('surfaces hinted skills first', () => {
    const ranked = rankSkills(['Figma', 'TypeScript', 'Design'], ['typescript'], 3)
    expect(ranked[0]).toBe('TypeScript')
  })

  it('preserves the original order among equally relevant skills', () => {
    expect(rankSkills(['A', 'B', 'C'], [], 3)).toEqual(['A', 'B', 'C'])
  })

  it('caps the result at the limit', () => {
    expect(rankSkills(['A', 'B', 'C', 'D', 'E', 'F'], [])).toHaveLength(5)
  })

  it('never invents a skill that was not supplied', () => {
    const ranked = rankSkills(['A'], ['typescript', 'react'])
    expect(ranked).toEqual(['A'])
  })

  it('handles an empty skill list', () => {
    expect(rankSkills([], ['typescript'])).toEqual([])
  })
})

describe('generateFallbackContent', () => {
  it.each(CONTEXTS)('produces schema-valid content for %s with no API key', (context) => {
    const content = generateFallbackContent(profile, context)
    expect(generatedContentSchema.safeParse(content).success).toBe(true)
  })

  it('is deterministic', () => {
    expect(generateFallbackContent(profile, 'networking')).toEqual(
      generateFallbackContent(profile, 'networking')
    )
  })

  it('writes genuinely different content per audience', () => {
    const ctas = new Set(CONTEXTS.map((c) => generateFallbackContent(profile, c).cta_text))
    expect(ctas.size).toBe(CONTEXTS.length)
  })

  it('orders skills differently for a recruiter than for an investor', () => {
    const job = generateFallbackContent(profile, 'job_application').skills
    const investor = generateFallbackContent(profile, 'investor').skills
    expect(job).not.toEqual(investor)
  })

  it('only ever shows skills the user actually claimed', () => {
    const claimed = new Set(profile.skills)
    for (const context of CONTEXTS) {
      for (const skill of generateFallbackContent(profile, context).skills) {
        expect(claimed.has(skill)).toBe(true)
      }
    }
  })

  it('still produces valid content for a nearly empty profile', () => {
    const sparse: Profile = { ...profile, full_name: null, headline: null, bio: null, skills: [], projects: [] }
    const content = generateFallbackContent(sparse, 'general')
    expect(generatedContentSchema.safeParse(content).success).toBe(true)
    expect(content.headline).toContain('vishnu')
  })

  it('mentions the first project when there is one', () => {
    expect(generateFallbackContent(profile, 'investor').summary).toContain('PersonaPage')
  })
})

describe('buildPrompt', () => {
  it('includes the profile facts the model must not contradict', () => {
    const prompt = buildPrompt(profile, 'job_application')
    expect(prompt).toContain('Vishnu Vekaria')
    expect(prompt).toContain('PersonaPage')
    expect(prompt).toContain('Next.js, Supabase')
    expect(prompt).toContain(CONTEXT_CONFIG.job_application.audience)
  })

  it('forbids invented claims', () => {
    expect(buildPrompt(profile, 'general')).toContain('Never invent metrics')
  })

  it('says something specific about projects when there are none', () => {
    const prompt = buildPrompt({ ...profile, projects: [] }, 'general')
    expect(prompt).toContain('None provided')
  })

  it('drops project rows with a blank title', () => {
    const prompt = buildPrompt(
      { ...profile, projects: [{ title: '   ', description: 'ghost', tech: [] }] },
      'general'
    )
    expect(prompt).not.toContain('ghost')
  })

  it('changes the tone instruction with the profile tone', () => {
    expect(buildPrompt({ ...profile, tone: 'casual' }, 'general')).toContain('conversational')
    expect(buildPrompt({ ...profile, tone: 'formal' }, 'general')).toContain('professional and precise')
  })

  it('produces a distinct prompt per audience', () => {
    const prompts = new Set(CONTEXTS.map((c) => buildPrompt(profile, c)))
    expect(prompts.size).toBe(CONTEXTS.length)
  })
})
