import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  NEVER_PUBLIC,
  PUBLIC_LINK_COLUMNS,
  PUBLIC_PROFILE_COLUMNS,
} from '@/lib/supabase/columns'

/**
 * The public profile path runs on the service-role client, which bypasses row
 * level security entirely. The select list is therefore the only boundary
 * between a table and an anonymous visitor, so it gets asserted rather than
 * trusted to review.
 */

const PUBLIC_FILES = ['app/p/[username]/page.tsx', 'app/p/[username]/opengraph-image.tsx']

function columns(list: string): string[] {
  return list.split(',').map((c) => c.trim())
}

describe('public column allowlists', () => {
  it.each([
    ['profile', PUBLIC_PROFILE_COLUMNS],
    ['link', PUBLIC_LINK_COLUMNS],
  ])('the %s allowlist serves no owner-only column', (_name, list) => {
    for (const forbidden of NEVER_PUBLIC) {
      expect(columns(list)).not.toContain(forbidden)
    }
  })

  it('excludes link.label, which holds the private recipient', () => {
    // createLink defaults label to the recipient when the user leaves it blank,
    // and the dashboard tells them only they can see it.
    expect(columns(PUBLIC_LINK_COLUMNS)).not.toContain('label')
  })

  it('still serves what the public page actually renders', () => {
    const profile = columns(PUBLIC_PROFILE_COLUMNS)
    for (const needed of ['username', 'full_name', 'headline', 'bio', 'skills', 'projects', 'contact']) {
      expect(profile).toContain(needed)
    }
    expect(columns(PUBLIC_LINK_COLUMNS)).toContain('generated_content')
  })

  it('has no duplicate or empty entries', () => {
    for (const list of [PUBLIC_PROFILE_COLUMNS, PUBLIC_LINK_COLUMNS]) {
      const cols = columns(list)
      expect(cols.filter(Boolean)).toHaveLength(cols.length)
      expect(new Set(cols).size).toBe(cols.length)
    }
  })
})

describe('the public path never selects everything', () => {
  it.each(PUBLIC_FILES)('%s uses the allowlist, not select("*")', (file) => {
    const source = readFileSync(file, 'utf8')
    // A select('*') here would serve every column of whatever table it hits,
    // with RLS bypassed. This is the regression that guard exists to catch.
    expect(source).not.toMatch(/\.select\(\s*['"`]\*['"`]\s*\)/)
    expect(source).toContain('PUBLIC_PROFILE_COLUMNS')
    expect(source).toContain('PUBLIC_LINK_COLUMNS')
  })
})

describe('link_targets never reaches the public path', () => {
  it.each(PUBLIC_FILES)('%s does not query link_targets', (file) => {
    // Pasted job postings can carry a recruiter's name or an unlisted role.
    expect(readFileSync(file, 'utf8')).not.toContain('link_targets')
  })
})
