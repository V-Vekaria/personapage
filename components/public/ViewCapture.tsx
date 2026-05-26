'use client'

import { useEffect, useRef } from 'react'

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
    }).catch(() => {})
    // Never block the page if analytics fails
  }, [linkId])

  return null
}