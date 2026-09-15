import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
