'use client'

import { useEffect, useRef } from 'react'

/**
 * Reports one view of a public profile.
 *
 * Fire-and-forget by design: analytics must never delay or break the page it is
 * measuring, so every failure is swallowed. The ref guards against React strict
 * mode running effects twice in development.
 */
export function ViewCapture({ linkId }: { linkId: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link_id: linkId,
        referrer: document.referrer || null,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }),
      keepalive: true,
    }).catch(() => {})
  }, [linkId])

  return null
}
