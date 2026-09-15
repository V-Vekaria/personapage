import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { generateProfileContent, GenerationError, isOpenAIConfigured } from '@/lib/ai'
import { rateLimit } from '@/lib/rate-limit'
import { trialRequestSchema } from '@/lib/validation'
import {
  decodeTrial,
  encodeTrial,
  remainingTrials,
  spendTrial,
  TRIAL_COOKIE,
  TRIAL_LIMIT,
  TRIAL_MAX_AGE_SECONDS,
} from '@/lib/trial'
import type { Profile } from '@/types/database'

/**
 * Generation for visitors without an account.
 *
 * Nothing is written to the database. The draft arrives in the request, the
 * content goes back in the response, and that is the whole lifecycle — so a
 * stranger trying the product leaves no rows behind and hands over no personal
 * data before deciding whether to sign up.
 *
 * Two independent limits apply. The signed cookie gives each visitor
 * TRIAL_LIMIT generations and is the number the UI shows. The IP rate limit is
 * the one that actually bounds cost, because a cookie can always be cleared.
 */

/** Per IP per hour. Above the trial limit so a shared office NAT stays usable. */
const IP_LIMIT = 12
const IP_WINDOW_MS = 60 * 60 * 1000

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const state = decodeTrial(cookieStore.get(TRIAL_COOKIE)?.value)
  const remaining = remainingTrials(state)

  if (remaining <= 0) {
    return NextResponse.json(
      {
        error: `That is your ${TRIAL_LIMIT} free generations. Create an account to keep going — it saves what you have written.`,
        remaining: 0,
        exhausted: true,
      },
      { status: 402 }
    )
  }

  const ip = rateLimit(`try:${clientIp(request)}`, IP_LIMIT, IP_WINDOW_MS)
  if (!ip.allowed) {
    return NextResponse.json(
      { error: 'Too many generations from this network. Try again a bit later.', remaining },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.', remaining }, { status: 400 })
  }

  const parsed = trialRequestSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return NextResponse.json(
      {
        error: issue ? `${issue.path.join('.') || 'Input'}: ${issue.message}` : 'Invalid input.',
        remaining,
      },
      { status: 400 }
    )
  }

  const { draft, context } = parsed.data

  const hasSubstance =
    Boolean(draft.headline) ||
    Boolean(draft.bio) ||
    draft.skills.length > 0 ||
    draft.projects.some((project) => project.title)

  if (!hasSubstance) {
    return NextResponse.json(
      {
        error: 'Add a headline, a bio, or a few skills first — there is nothing to work from yet.',
        remaining,
      },
      { status: 400 }
    )
  }

  // A Profile shaped well enough for the generator, belonging to nobody.
  const profile: Profile = {
    id: 'trial',
    username: 'you',
    full_name: draft.full_name || null,
    contact: null,
    headline: draft.headline || null,
    bio: draft.bio || null,
    skills: draft.skills,
    projects: draft.projects,
    tone: draft.tone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  let result
  try {
    result = await generateProfileContent(profile, context)
  } catch (error) {
    if (error instanceof GenerationError) {
      console.error(`Trial generation failed (${error.code}):`, error.message)
      return NextResponse.json(
        {
          error:
            error.code === 'PROVIDER_ERROR'
              ? 'The model provider did not respond. Try again in a moment.'
              : 'The model returned something unusable. Try again.',
          remaining,
        },
        { status: 502 }
      )
    }
    console.error('Unexpected trial generation failure:', error)
    return NextResponse.json({ error: 'Something went wrong.', remaining }, { status: 500 })
  }

  // Only spend a credit once there is something to show for it.
  const next = spendTrial(state)
  const response = NextResponse.json({
    content: result.content,
    source: result.source,
    ai_configured: isOpenAIConfigured(),
    remaining: remainingTrials(next),
  })

  response.cookies.set(TRIAL_COOKIE, encodeTrial(next), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TRIAL_MAX_AGE_SECONDS,
  })

  return response
}
