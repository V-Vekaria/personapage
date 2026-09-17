/**
 * Column allowlists for the public profile path.
 *
 * The public page and its OG image run on the service-role client, which
 * bypasses row level security completely. That makes the select list the only
 * thing standing between a table and an anonymous visitor, so these are
 * declared once, named, and asserted in tests rather than retyped at each call
 * site where a `select('*')` could quietly creep back in.
 *
 * Anything a visitor does not need must not appear here.
 */

/**
 * Deliberately excludes nothing sensitive — everything on a profile is content
 * the user chose to publish. Listed explicitly anyway so a future column is
 * opt-in rather than automatically served.
 */
export const PUBLIC_PROFILE_COLUMNS =
  'id, username, full_name, contact, headline, bio, skills, projects, tone, created_at, updated_at'

/**
 * Excludes `label`. The label defaults to the recipient when the user leaves it
 * blank, so it holds private targeting text ("Stripe — Backend Engineer"), and
 * the dashboard promises the user that only they can see it. The public page
 * has never rendered it.
 */
export const PUBLIC_LINK_COLUMNS =
  'id, user_id, context, slug, generated_content, is_active, created_at, updated_at'

/** Columns that must never be served on the public path, whatever the table. */
export const NEVER_PUBLIC = ['label', 'description', 'recipient', 'source_url'] as const
