import { CONTEXT_CONFIG } from './context-config'
import { renderTargetSection, type GenerationTarget } from './target'
import type { Context, Profile, Project } from '@/types/database'

/** Renders projects as a readable block so the model can cite specific work. */
function projectBlock(projects: Project[]): string {
  const real = projects.filter((p) => p.title?.trim())
  if (real.length === 0) return '  None provided'

  return real
    .map((p) =>
      [
        `  Project: ${p.title}`,
        p.description ? `  What it does: ${p.description}` : null,
        p.tech?.length ? `  Tech: ${p.tech.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n\n')
}

function toneInstruction(tone: string): string {
  if (tone === 'casual') return 'conversational and approachable'
  if (tone === 'formal') return 'professional and precise'
  return 'balanced — clear but not stiff'
}

export function buildPrompt(
  profile: Profile,
  context: Context,
  target?: GenerationTarget | null
): string {
  const name = profile.full_name || profile.username
  const config = CONTEXT_CONFIG[context] ?? CONTEXT_CONFIG.general
  const targetSection = target ? renderTargetSection(target) : ''

  return `You are writing a professional profile page for ${name}.

AUDIENCE: ${config.audience}

WHAT TO EMPHASISE FOR THIS AUDIENCE:
${config.emphasis}

PROFILE DATA (ground truth — never invent or modify these facts):
Name: ${name}
Headline: ${profile.headline ?? 'Not provided'}
Bio: ${profile.bio ?? 'Not provided'}
Skills: ${(profile.skills ?? []).join(', ') || 'Not provided'}
Tone preference: ${profile.tone ?? 'neutral'}

Projects:
${projectBlock(profile.projects ?? [])}
${targetSection}

RULES:
- Never invent metrics, companies, technologies, or claims not present above
- Never rename or paraphrase project titles or technology names
- The headline and summary must feel genuinely different from a generic profile — they should speak directly to what this specific audience cares about
- Tone: ${toneInstruction(profile.tone)}
- CTA guidance: ${config.ctaGuide}
- Skills: reorder from the provided list to surface the most relevant ones first for this audience — do not add new skills

Return this JSON and nothing else:
{
  "headline": "One sentence that positions ${name} specifically for ${config.audience}",
  "summary": "2-3 sentences written for ${config.audience} — what they care about, what makes ${name} relevant to them",
  "skills": ["top 5 skills from the provided list, reordered for this audience"],
  "cta_text": "One call-to-action sentence tailored for ${config.audience}"
}`
}

export const SYSTEM_PROMPT =
  'You are a professional profile writer. You write audience-specific professional profiles. Always return valid JSON matching the exact schema requested.'
