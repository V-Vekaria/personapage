'use client'

import { useState } from 'react'
import { DashboardNavLinks } from './DashboardNavLinks'

interface Props {
  email: string
  signOutForm: React.ReactNode
}

export function MobileNav({ email, signOutForm }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="md:hidden flex items-center justify-between border-b border-violet-300/10 bg-zinc-950/80 px-4 py-3 shrink-0 backdrop-blur">
        <span className="text-white font-semibold text-sm tracking-tight">PersonaPage</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-2 -mr-2 text-zinc-300 hover:text-white rounded-lg hover:bg-violet-950/35 transition"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {open && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 z-40 bg-black/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="md:hidden fixed inset-x-0 top-[53px] z-50 border-b border-violet-300/10 bg-zinc-950/95 px-4 py-4 shadow-[0_24px_80px_rgba(24,8,45,0.55)] backdrop-blur">
            <DashboardNavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t border-violet-300/10 mt-4 pt-4 space-y-2">
              <p className="text-xs text-zinc-600 truncate px-3">{email}</p>
              {signOutForm}
            </div>
          </div>
        </>
      )}
    </>
  )
}
