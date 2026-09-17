import type { Context } from '@/types/database'

/**
 * Per-audience configuration. This is what makes each generated profile
 * genuinely different rather than just differently worded — the audience, what
 * to lead with, and what the call to action should feel like all change.
 */
export interface ContextConfig {
  /** Who is reading this page. */
  audience: string
  /** What the writer should lead with for this audience. */
  emphasis: string
  /** The shape the call to action should take. */
  ctaGuide: string
  /** Used by the offline fallback writer when no API key is configured. */
  fallback: {
    headline: (name: string, headline: string) => string
    summary: (name: string, bio: string, topSkills: string[], projectTitle?: string) => string
    cta: string
    /** Skills matching these hints get surfaced first for this audience. */
    skillHints: string[]
  }
}

const list = (items: string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

export const CONTEXT_CONFIG: Record<Context, ContextConfig> = {
  job_application: {
    audience: 'a recruiter or hiring manager evaluating candidates',
    emphasis:
      'Lead with technical depth and shipped work. Surface specific technologies, frameworks, and measurable outcomes. Order skills by engineering relevance. Projects should highlight what was built, the technical challenge, and the result. Make it clear this person can do the job.',
    ctaGuide:
      'Open to new engineering roles — direct and professional. e.g. "Open to full-time roles in [area] — happy to chat."',
    fallback: {
      headline: (name, headline) => headline || `${name} — engineer, shipping production software`,
      summary: (name, bio, topSkills, projectTitle) =>
        [
          bio,
          topSkills.length ? `Works primarily in ${list(topSkills)}.` : '',
          projectTitle ? `Most recently built ${projectTitle}.` : '',
        ]
          .filter(Boolean)
          .join(' ') || `${name} builds software end to end.`,
      cta: 'Open to new engineering roles — happy to talk through any of this work in detail.',
      skillHints: ['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'react', 'next', 'node', 'sql', 'postgres', 'aws'],
    },
  },

  networking: {
    audience: 'a peer, collaborator, or potential co-founder at a tech event or online community',
    emphasis:
      'Warm and human. Lead with what you are currently working on and what excites you. Show genuine curiosity and collaborative energy. Projects should feel like things you care about, not things on a CV. Sound like a person, not a job application.',
    ctaGuide:
      'Casual and inviting. e.g. "Always up for a good tech conversation — reach out on LinkedIn." or "Let\'s build something together."',
    fallback: {
      headline: (name, headline) => headline || `${name} — building things, usually several at once`,
      summary: (name, bio, topSkills, projectTitle) =>
        [
          bio,
          projectTitle ? `Currently spending most evenings on ${projectTitle}.` : '',
          topSkills.length ? `Happiest working with ${list(topSkills)}.` : '',
        ]
          .filter(Boolean)
          .join(' ') || `${name} likes building things with other people.`,
      cta: "Always up for a good conversation about what you're building — reach out any time.",
      skillHints: ['react', 'next', 'design', 'product', 'ai', 'ml', 'open source', 'community'],
    },
  },

  investor: {
    audience: 'an investor or startup founder evaluating you as a founder or builder',
    emphasis:
      'Lead with product thinking and builder mentality. Highlight any traction, users, or real-world outcomes. Frame projects in terms of problems solved and markets addressed, not just features built. Convey ownership, decisiveness, and vision. Show you ship.',
    ctaGuide:
      'Confident and curious. e.g. "Open to conversations about what I\'m building next." or "Reach out if you\'re interested in what\'s possible here."',
    fallback: {
      headline: (name, headline) => headline || `${name} — builder, ships product end to end`,
      summary: (name, bio, topSkills, projectTitle) =>
        [
          projectTitle ? `Building ${projectTitle}.` : '',
          bio,
          topSkills.length ? `Takes products from problem to production across ${list(topSkills)}.` : '',
        ]
          .filter(Boolean)
          .join(' ') || `${name} builds and ships products.`,
      cta: "Open to conversations about what I'm building next.",
      skillHints: ['product', 'system design', 'architecture', 'ai', 'ml', 'growth', 'full-stack', 'fullstack'],
    },
  },

  conference: {
    audience: 'attendees at a tech conference or professional meetup',
    emphasis:
      'Expertise-forward. Position this person as a practitioner with genuine depth who has shipped real things and has real opinions. Lead with their area of expertise. Surface the most technically interesting projects. Think thought leadership, not job hunting.',
    ctaGuide:
      'Find me at the event or connect after. e.g. "Find me at the conference — always happy to swap notes on [topic]."',
    fallback: {
      headline: (name, headline) => headline || `${name} — practitioner, not a spectator`,
      summary: (name, bio, topSkills, projectTitle) =>
        [
          topSkills.length ? `Works deep in ${list(topSkills)}.` : '',
          bio,
          projectTitle ? `Happy to go into the weeds on ${projectTitle}.` : '',
        ]
          .filter(Boolean)
          .join(' ') || `${name} builds and talks about software.`,
      cta: 'Find me at the event — always happy to swap notes.',
      skillHints: ['architecture', 'system design', 'distributed', 'performance', 'ai', 'ml', 'security', 'infrastructure'],
    },
  },

  general: {
    audience: 'anyone who opens this link',
    emphasis:
      'Balanced, clear, and readable. Introduce the person, what they build, and what they care about. Not too technical, not too vague. Projects and skills in reasonable proportion. Approachable.',
    ctaGuide: 'Open and friendly. e.g. "Open to opportunities and conversations — let\'s connect."',
    fallback: {
      headline: (name, headline) => headline || `${name}`,
      summary: (name, bio, topSkills, projectTitle) =>
        [
          bio,
          projectTitle ? `Built ${projectTitle}.` : '',
          topSkills.length ? `Works with ${list(topSkills)}.` : '',
        ]
          .filter(Boolean)
          .join(' ') || `${name} builds things on the internet.`,
      cta: "Open to opportunities and conversations — let's connect.",
      skillHints: [],
    },
  },
}
