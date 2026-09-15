const KNOWN_HOSTS: [match: string, label: string][] = [
  ['linkedin.com', 'Connect on LinkedIn'],
  ['twitter.com', 'Connect on X'],
  ['x.com', 'Connect on X'],
  ['github.com', 'View on GitHub'],
  ['instagram.com', 'Connect on Instagram'],
  ['facebook.com', 'Connect on Facebook'],
  ['bsky.app', 'Connect on Bluesky'],
  ['threads.net', 'Connect on Threads'],
  ['behance.net', 'View on Behance'],
  ['dribbble.com', 'View on Dribbble'],
  ['youtube.com', 'Watch on YouTube'],
  ['medium.com', 'Read on Medium'],
]

/** Turns a bare contact string into something clickable. */
export function contactHref(contact: string): string {
  const trimmed = contact.trim()
  if (trimmed.includes('@') && !trimmed.includes('/')) return `mailto:${trimmed}`
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** Names the destination so the button says where it goes. */
export function connectLabel(contact: string): string {
  const trimmed = contact.trim()
  if (trimmed.includes('@') && !trimmed.includes('/')) return 'Send an email'

  try {
    const host = new URL(contactHref(trimmed)).hostname.replace(/^www\./, '')
    const known = KNOWN_HOSTS.find(([match]) => host === match || host.endsWith(`.${match}`))
    return known ? known[1] : 'Connect'
  } catch {
    return 'Connect'
  }
}
