'use client'

import type { ReactNode } from 'react'

interface Props {
  href: string
  linkId?: string
  children: ReactNode
}

/**
 * The outbound contact button, with click recording attached.
 *
 * Uses sendBeacon rather than fetch: the browser is about to navigate away, and
 * a normal request can be cancelled mid-flight when that happens. sendBeacon is
 * queued by the browser and delivered regardless, without holding up the
 * navigation — which matters because the click is the conversion event and
 * losing it is worse than losing a view.
 *
 * Every failure is swallowed. A profile page must never break because analytics
 * did.
 */
export function ContactLink({ href, linkId, children }: Props) {
  function record() {
    if (!linkId) return

    try {
      const payload = JSON.stringify({
        link_id: linkId,
        target: 'contact',
        referrer: document.referrer || null,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/click', payload)
        return
      }

      // Older browsers: keepalive gets the same survive-the-unload behaviour.
      fetch('/api/analytics/click', { method: 'POST', body: payload, keepalive: true }).catch(
        () => {}
      )
    } catch {
      // Nothing to do — the click still goes through.
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={record}
      onAuxClick={record}
      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-white to-violet-100 px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-[0_0_30px_rgba(124,58,237,0.22)] transition hover:from-white hover:to-fuchsia-100"
    >
      {children}
    </a>
  )
}
