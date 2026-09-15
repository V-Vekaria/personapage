import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateProfileContent,
  GenerationError,
  isOpenAIConfigured,
  toGenerationTarget,
} from '@/lib/ai'
import { rateLimit } from '@/lib/rate-limit'
import { generateRequestSchema } from '@/lib/validation'
import { isContext } from '@/types/database'
import type { Link, LinkTarget, Profile } from '@/types/database'

/** Generations allowed per user per hour. Each one costs real money. */
const LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000

function fail(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return fail('You need to sign in first.', 401)

  const limit = rateLimit(`generate:${user.id}`, LIMIT, WINDOW_MS)
  if (!limit.allowed) {
    return fail(
      `That is ${LIMIT} generations in an hour — give it ${Math.ceil(limit.retryAfter / 60)} minutes.`,
      429,
      { retry_after: limit.retryAfter }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return fail('Malformed request.', 400)
  }

  const parsed = generateRequestSchema.safeParse(body)
  if (!parsed.success) return fail('A valid link_id is required.', 400)

  // Scoping to user_id is what stops anyone generating against someone
  // else's link by guessing an id.
  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('id', parsed.data.link_id)
    .eq('user_id', user.id)
    .single<Link>()

  if (!link) return fail('Link not found.', 404)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) return fail('Set up your profile before generating.', 400)

  const hasSubstance =
    Boolean(profile.headline?.trim()) ||
    Boolean(profile.bio?.trim()) ||
    (profile.skills ?? []).length > 0 ||
    (profile.projects ?? []).length > 0

  if (!hasSubstance) {
    return fail('Add a headline, bio, skills or a project first — there is nothing to work from yet.', 400)
  }

  const context = isContext(link.context) ? link.context : 'general'

  // RLS keeps this to targets on links this user owns, so a missing row means
  // "no target set", not "not allowed to see it".
  const { data: targetRow } = await supabase
    .from('link_targets')
    .select('*')
    .eq('link_id', link.id)
    .maybeSingle<LinkTarget>()

  const target = toGenerationTarget(targetRow)

  let result
  try {
    result = await generateProfileContent(profile, context, target)
  } catch (error) {
    if (error instanceof GenerationError) {
      console.error(`Generation failed (${error.code}):`, error.message)
      return fail(
        error.code === 'PROVIDER_ERROR'
          ? 'The model provider did not respond. Try again in a moment.'
          : 'The model returned something unusable. Try generating again.',
        502
      )
    }
    console.error('Unexpected generation failure:', error)
    return fail('Something went wrong generating this profile.', 500)
  }

  const { error: saveError } = await supabase
    .from('links')
    .update({ generated_content: result.content })
    .eq('id', link.id)
    .eq('user_id', user.id)

  if (saveError) {
    console.error('Failed to save generated content:', saveError)
    return fail('Generated the profile but could not save it.', 500)
  }

  return NextResponse.json({
    content: result.content,
    source: result.source,
    targeted: Boolean(target),
    ai_configured: isOpenAIConfigured(),
    remaining: limit.remaining,
  })
}
