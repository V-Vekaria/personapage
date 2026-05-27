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

    // Get link (must belong to this user)
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

    // Call OpenAI with json_object mode — guarantees parseable JSON back
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a professional profile writer. You write audience-specific professional profiles. Always return valid JSON matching the exact schema requested.',
        },
        {
          role: 'user',
          content: buildPrompt(profile, link.context),
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

    // Save to link — surface errors instead of silently swallowing them
    const { error: saveError } = await supabase
      .from('links')
      .update({ generated_content: generated })
      .eq('id', link_id)

    if (saveError) {
      console.error('Failed to save generated content:', saveError)
      return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ content: generated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

// Per-context configuration — defines the audience, what to emphasise, and what the CTA should feel like.
// This is what makes each generated profile actually different, not just differently worded.
const CONTEXT_CONFIG: Record<string, {
  audience: string
  emphasis: string
  ctaGuide: string
}> = {
  job_application: {
    audience: 'a recruiter or hiring manager evaluating candidates',
    emphasis:
      'Lead with technical depth and shipped work. Surface specific technologies, frameworks, and measurable outcomes. Order skills by engineering relevance. Projects should highlight what was built, the technical challenge, and the result. Make it clear this person can do the job.',
    ctaGuide: 'Open to new engineering roles — direct and professional. e.g. "Open to full-time roles in [area] — happy to chat."',
  },
  networking: {
    audience: 'a peer, collaborator, or potential co-founder at a tech event or online community',
    emphasis:
      'Warm and human. Lead with what you are currently working on and what excites you. Show genuine curiosity and collaborative energy. Projects should feel like things you care about, not things on a CV. Sound like a person, not a job application.',
    ctaGuide: 'Casual and inviting. e.g. "Always up for a good tech conversation — reach out on LinkedIn." or "Let\'s build something together."',
  },
  investor: {
    audience: 'an investor or startup founder evaluating you as a founder or builder',
    emphasis:
      'Lead with product thinking and builder mentality. Highlight any traction, users, or real-world outcomes. Frame projects in terms of problems solved and markets addressed, not just features built. Convey ownership, decisiveness, and vision. Show you ship.',
    ctaGuide: 'Confident and curious. e.g. "Open to conversations about what I\'m building next." or "Reach out if you\'re interested in what\'s possible here."',
  },
  conference: {
    audience: 'attendees at a tech conference or professional meetup',
    emphasis:
      'Expertise-forward. Position this person as a practitioner with genuine depth who has shipped real things and has real opinions. Lead with their area of expertise. Surface the most technically interesting projects. Think thought leadership, not job hunting.',
    ctaGuide: 'Find me at the event or connect after. e.g. "Find me at the conference — always happy to swap notes on [topic]."',
  },
  general: {
    audience: 'anyone who opens this link',
    emphasis:
      'Balanced, clear, and readable. Introduce the person, what they build, and what they care about. Not too technical, not too vague. Projects and skills in reasonable proportion. Approachable.',
    ctaGuide: 'Open and friendly. e.g. "Open to opportunities and conversations — let\'s connect."',
  },
}

function buildPrompt(profile: any, context: string): string {
  const name = profile.full_name || profile.username
  const config = CONTEXT_CONFIG[context] ?? CONTEXT_CONFIG.general

  // Format projects as a readable block so the AI can reference specific work
  const projects = (profile.projects ?? []).filter((p: any) => p.title?.trim())
  const projectBlock = projects.length > 0
    ? projects.map((p: any) => [
        `  Project: ${p.title}`,
        p.description ? `  What it does: ${p.description}` : null,
        p.tech?.length ? `  Tech: ${p.tech.join(', ')}` : null,
      ].filter(Boolean).join('\n')).join('\n\n')
    : '  None provided'

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
${projectBlock}

RULES:
- Never invent metrics, companies, technologies, or claims not present above
- Never rename or paraphrase project titles or technology names
- The headline and summary must feel genuinely different from a generic profile — they should speak directly to what this specific audience cares about
- Tone: ${profile.tone === 'casual' ? 'conversational and approachable' : profile.tone === 'formal' ? 'professional and precise' : 'balanced — clear but not stiff'}
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
