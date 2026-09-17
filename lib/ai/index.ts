import OpenAI from 'openai'
import { generatedContentSchema } from '@/lib/validation'
import { generateFallbackContent } from './fallback'
import { buildPrompt, SYSTEM_PROMPT } from './prompt'
import type { GenerationTarget } from './target'
import type { Context, GeneratedContent, Profile } from '@/types/database'

export type GenerationSource = 'openai' | 'fallback'

export interface GenerationResult {
  content: GeneratedContent
  /** Which writer produced this, so the UI can be honest about it. */
  source: GenerationSource
}

export class GenerationError extends Error {
  constructor(
    message: string,
    readonly code: 'PARSE_FAILED' | 'INVALID_SHAPE' | 'PROVIDER_ERROR'
  ) {
    super(message)
    this.name = 'GenerationError'
  }
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

/**
 * Produces audience-tailored profile content.
 *
 * Uses OpenAI when a key is configured and falls back to the deterministic
 * template writer when it is not, so the app never hard-fails on a missing key.
 * A configured key that errors is a real error — we surface it rather than
 * quietly downgrading, because silently serving template output when the user
 * is paying for a model would be worse than an error message.
 */
export async function generateProfileContent(
  profile: Profile,
  context: Context,
  target?: GenerationTarget | null
): Promise<GenerationResult> {
  if (!isOpenAIConfigured()) {
    return { content: generateFallbackContent(profile, context, target), source: 'fallback' }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1'

  let raw: string
  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(profile, context, target) },
      ],
    })
    raw = completion.choices[0]?.message?.content ?? ''
  } catch (error) {
    throw new GenerationError(
      error instanceof Error ? error.message : 'Model request failed',
      'PROVIDER_ERROR'
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new GenerationError('Model did not return valid JSON', 'PARSE_FAILED')
  }

  const result = generatedContentSchema.safeParse(parsed)
  if (!result.success) {
    throw new GenerationError('Model returned an unexpected shape', 'INVALID_SHAPE')
  }

  // Never let the model introduce a skill the user did not claim.
  const claimed = new Set((profile.skills ?? []).map((s) => s.toLowerCase()))
  const skills = result.data.skills.filter((s) => claimed.has(s.toLowerCase()))

  return {
    content: {
      ...result.data,
      skills: skills.length > 0 ? skills : (profile.skills ?? []).slice(0, 5),
    },
    source: 'openai',
  }
}

export { generateFallbackContent } from './fallback'
export { buildPrompt } from './prompt'
export { CONTEXT_CONFIG } from './context-config'
export { rankSkillsAgainstTarget, toGenerationTarget } from './target'
export type { GenerationTarget } from './target'
