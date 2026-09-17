import { describe, expect, it } from 'vitest'
import { connectLabel, contactHref } from '@/lib/contact'

describe('contactHref', () => {
  it('adds a scheme to a bare host', () => {
    expect(contactHref('linkedin.com/in/someone')).toBe('https://linkedin.com/in/someone')
  })

  it('leaves an existing scheme alone', () => {
    expect(contactHref('https://github.com/someone')).toBe('https://github.com/someone')
  })

  it('turns a bare email into a mailto link', () => {
    expect(contactHref('hello@example.com')).toBe('mailto:hello@example.com')
  })

  it('does not treat a URL containing @ as an email', () => {
    expect(contactHref('example.com/@handle')).toBe('https://example.com/@handle')
  })
})

describe('connectLabel', () => {
  it.each([
    ['linkedin.com/in/someone', 'Connect on LinkedIn'],
    ['https://www.github.com/someone', 'View on GitHub'],
    ['x.com/someone', 'Connect on X'],
    ['bsky.app/profile/someone', 'Connect on Bluesky'],
    ['hello@example.com', 'Send an email'],
  ])('names the destination for %s', (input, expected) => {
    expect(connectLabel(input)).toBe(expected)
  })

  it('falls back to a generic label for unknown hosts', () => {
    expect(connectLabel('example.com')).toBe('Connect')
  })

  it('does not match a lookalike domain', () => {
    // notlinkedin.com must not be read as linkedin.com.
    expect(connectLabel('notlinkedin.com/in/someone')).toBe('Connect')
  })
})
