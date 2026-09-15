import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Everything behind auth, plus the API. Tailored links carry their own
      // noindex in page metadata, since only the query string distinguishes them.
      disallow: ['/dashboard', '/profile', '/links', '/analytics', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
