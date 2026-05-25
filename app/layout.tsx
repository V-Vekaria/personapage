import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PersonaPage',
  description: 'Your adaptive professional identity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}