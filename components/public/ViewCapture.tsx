'use client'

import { useEffect, useRef } from 'react'
import { DwellTimer, shouldReport } from '@/lib/dwell'

/**
 * Reports one view of a public profile, and how long it was read for.
 *
 * Fire-and-forget by design: analytics must never delay or break the page it is
 * measuring, so every failure is swallowed.
 *
 * Read time counts only the time the tab was actually visible. Without that,
 * a page left open in a background tab overnight would report eight hours and
 * every median built on the column would be fiction. Hidden time is excluded,
 * not merely capped.
 */
export function ViewCapture({ linkId }: { linkId: string }) {
  const viewId = useRef<string | null>(null)
  const posted = useRef(false)

  // The view itself, once. The ref guards against React strict mode running
  // effects twice in development, which would otherwise double-count.
  useEffect(() => {
    if (posted.current) return
    posted.current = true

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link_id: linkId,
        referrer: document.referrer || null,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }),
      keepalive: true,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { id?: string } | null) => {
        viewId.current = body?.id ?? null
      })
      .catch(() => {})
  }, [linkId])

  // Read time. Deliberately not guarded by the ref above: this effect owns
  // listeners, so it has to re-attach them whenever it re-runs or strict mode's
  // cleanup would leave the page unmeasured in development.
  useEffect(() => {
    const timer = new DwellTimer(document.visibilityState === 'visible', Date.now())
    let reported = 0

    function report() {
      const ms = timer.elapsed(Date.now())
      if (!viewId.current || !shouldReport(ms, reported)) return
      reported = ms

      const payload = JSON.stringify({ view_id: viewId.current, ms })
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/dwell', payload)
          return
        }
        // Older browsers: keepalive gets the same survive-the-unload behaviour.
        fetch('/api/analytics/dwell', {
          method: 'POST',
          body: payload,
          keepalive: true,
        }).catch(() => {})
      } catch {
        // Nothing to do. The visit still happened and the view is already saved.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        timer.hide(Date.now())
        // Reported here as well as on pagehide because mobile browsers freeze
        // and discard backgrounded tabs without ever firing an unload event.
        report()
      } else {
        timer.show(Date.now())
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', report)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', report)
      report()
    }
  }, [])

  return null
}
