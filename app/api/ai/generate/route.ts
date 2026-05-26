import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

    const { link_id } = await req.json()
    if (!link_id) return NextResponse.json({ error: 'MISSING_LINK_ID' }, { status: 400 })

    // Get link
    const { data: link } = await supabase
      .from('links')
      .select('*')
      .eq('id', link_id)
      .eq('user_id', user.id)
      .single()

    if (!link) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'NO_PROFILE' }, { status: 400 })

    // Build prompt
    const prompt = buildPrompt(profile, link.context)

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional profile writer. Return only valid JSON, no markdown, no backticks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const raw = completion.choices[0].message.content ?? ''

    let generated
    try {
      generated = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'PARSE_FAILED' }, { status: 422 })
    }

    // Save to link
    await supabase
      .from('links')
      .update({ generated_content: generated })
      .eq('id', link_id)

    return NextResponse.json({ content: generated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

function buildPrompt(profile: any, context: string): string {
  return `
You are writing a professional profile page for ${profile.username}.

PROFILE DATA:
- Headline: ${profile.headline ?? 'Not provided'}
- Bio: ${profile.bio ?? 'Not provided'}
- Skills: ${profile.skills?.join(', ') ?? 'Not provided'}
- Tone: ${profile.tone ?? 'neutral'}

CONTEXT: This profile is for "${context.replace('_', ' ')}"

Generate a profile tailored for this context. Return JSON in this exact shape:
{
  "headline": "A punchy one-line headline for this context",
  "summary": "2-3 sentence summary tailored to this context",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "cta": "A call-to-action sentence e.g. Open to new opportunities"
}

Rules:
- Match the tone: ${profile.tone ?? 'neutral'}
- For job_application: professional, achievement-focused
- For networking: warm, conversational, approachable  
- For investor: confident, vision-focused, traction-oriented
- For conference: expertise-forward, thought-leadership
- For general: balanced, clear
`
}