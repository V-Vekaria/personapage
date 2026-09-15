/**
 * Canonical origin for absolute URLs (social cards, copy-link buttons).
 * Prefers an explicit setting, then Vercel's injected host, then localhost.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`

  return 'http://localhost:3000'
}

/** The public URL for one tailored link. */
export function publicLinkUrl(username: string, slug: string, origin = siteUrl()): string {
  return `${origin}/p/${encodeURIComponent(username)}?link=${encodeURIComponent(slug)}`
}
