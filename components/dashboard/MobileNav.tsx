'use client'

import { useState } from 'react'
import { DashboardNavLinks } from './DashboardNavLinks'

interface Props {
  email: string
  displayName: string
  initial: string
  signOutForm: React.ReactNode
}

export function MobileNav({ email, displayName, initial, signOutForm }: Props) {
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
          <div className="md:hidden fixed inset-x-0 top-[53px] z-50 border-b border-violet-300/10 bg-zinc-950 px-4 py-4 shadow-[0_24px_80px_rgba(24,8,45,0.55)] backdrop-blur">
            <DashboardNavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t border-violet-300/10 mt-4 pt-4 px-3">
              <div className="flex items-center gap-3">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-violet-950/60 border border-violet-300/20 text-sm font-medium text-violet-100">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[12px] text-zinc-500 truncate leading-tight mt-0.5">
                    {email}
                  </p>
                </div>
                {signOutForm}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
