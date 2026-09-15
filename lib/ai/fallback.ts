import { CONTEXT_CONFIG } from './context-config'
import { rankSkillsAgainstTarget, type GenerationTarget } from './target'
import type { Context, GeneratedContent, Profile } from '@/types/database'

/**
 * Writes a tailored profile without calling any model.
 *
 * This exists so the project runs with zero API keys — clone it, point it at a
 * Supabase project, and every feature works. It is deterministic: the same
 * profile and context always produce the same output, which also makes it
 * testable in a way an API call is not.
 *
 * It is genuinely audience-aware (skill ordering, sentence order, and CTA all
 * change per context) but it is a template writer, not a model. The UI says so
 * wherever its output is shown.
 */

/**
 * Orders skills by how well they match this audience's hints, keeping the
 * user's original order as the tie-breaker so the result stays stable.
 */
export function rankSkills(skills: string[], hints: string[], limit = 5): string[] {
  return skills
    .map((skill, index) => {
      const lower = skill.toLowerCase()
      const matched = hints.some((hint) => lower.includes(hint))
      return { skill, index, rank: matched ? 0 : 1 }
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.skill)
}

export function generateFallbackContent(
  profile: Profile,
  context: Context,
  target?: GenerationTarget | null
): GeneratedContent {
  const config = CONTEXT_CONFIG[context] ?? CONTEXT_CONFIG.general
  const name = profile.full_name || profile.username

  // With a posting to work from, let it decide which skills lead. Without one,
  // fall back to the audience's generic hints. Either way this is a reordering
  // of what the user claimed — nothing is added.
  const skills = target?.description
    ? rankSkillsAgainstTarget(profile.skills ?? [], target.description, config.fallback.skillHints)
    : rankSkills(profile.skills ?? [], config.fallback.skillHints)
  const firstProject = (profile.projects ?? []).find((p) => p.title?.trim())

  return {
    headline: config.fallback.headline(name, profile.headline ?? ''),
    summary: config.fallback.summary(
      name,
      profile.bio ?? '',
      skills.slice(0, 3),
      firstProject?.title
    ),
    skills,
    cta_text: config.fallback.cta,
  }
}
