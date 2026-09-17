import type { Metadata, Viewport } from 'next'
import { siteUrl } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'PersonaPage — one link for every room you walk into',
    template: '%s · PersonaPage',
  },
  description:
    'One master profile with tailored versions for recruiters, networking, collaborators and clients. Build it once, share the version that fits the conversation.',
  applicationName: 'PersonaPage',
  openGraph: {
    type: 'website',
    siteName: 'PersonaPage',
    title: 'PersonaPage — one link for every room you walk into',
    description:
      'Build one profile, share the version that fits the conversation. Tailored public pages for recruiters, collaborators, investors and events.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonaPage — one link for every room you walk into',
    description: 'Build one profile, share the version that fits the conversation.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}
