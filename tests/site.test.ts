import { afterEach, describe, expect, it } from 'vitest'
import { publicLinkUrl, siteUrl } from '@/lib/site'

const original = { ...process.env }
afterEach(() => {
  process.env = { ...original }
})

describe('siteUrl', () => {
  it('prefers an explicit setting', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://personapage.app'
    expect(siteUrl()).toBe('https://personapage.app')
  })

  it('strips a trailing slash so URLs never double up', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://personapage.app/'
    expect(siteUrl()).toBe('https://personapage.app')
  })

  it('falls back to the Vercel host', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_VERCEL_URL
    process.env.VERCEL_URL = 'personapage-app.vercel.app'
    expect(siteUrl()).toBe('https://personapage-app.vercel.app')
  })

  it('falls back to localhost when nothing is configured', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_VERCEL_URL
    delete process.env.VERCEL_URL
    expect(siteUrl()).toBe('http://localhost:3000')
  })
})

describe('publicLinkUrl', () => {
  it('builds the shareable URL', () => {
    expect(publicLinkUrl('vishnu', 'vishnu-networking-ab12cd', 'https://example.com')).toBe(
      'https://example.com/p/vishnu?link=vishnu-networking-ab12cd'
    )
  })

  it('escapes values so a slug can never break out of the query string', () => {
    expect(publicLinkUrl('a b', 'c&d=e', 'https://example.com')).toBe(
      'https://example.com/p/a%20b?link=c%26d%3De'
    )
  })
})
