import type { Context } from '@/types/database'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomSuffix(length = 6, random: () => number = Math.random): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)]
  }
  return out
}

/** Strips a string down to what is safe to put in a URL path. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Builds a link slug. The random suffix makes the URL unguessable-ish and keeps
 * collisions rare; callers still retry on the unique constraint, because "rare"
 * is not "never".
 */
export function generateSlug(
  username: string,
  context: Context,
  random: () => number = Math.random
): string {
  return [slugify(username), slugify(context), randomSuffix(6, random)]
    .filter(Boolean)
    .join('-')
}
