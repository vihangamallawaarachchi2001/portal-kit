'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie_consent_given'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable (e.g. private browsing with strict settings)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/60 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="flex-1 text-[13px] text-on-surface-variant leading-relaxed">
          PortalKit uses cookies to keep you signed in and to understand how people use the product.{' '}
          <Link href="/cookies" className="text-ds-secondary underline underline-offset-2 hover:text-ds-secondary/80 transition-colors">
            Cookie policy
          </Link>
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accept}
            className="h-8 px-4 rounded-md bg-ds-secondary text-white text-[13px] font-semibold hover:bg-ds-secondary/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={accept}
            className="h-8 px-3 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
