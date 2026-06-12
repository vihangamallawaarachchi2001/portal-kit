'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '../providers/auth-provider'
import { logout } from '@/app/auth/action'

const NAV_LINKS = [
  { label: 'Platform',   href: '/platform'  },
  { label: 'About',      href: '/about'     },
  { label: 'Developers', href: '/docs'     },
  { label: 'Pricing',    href: '/pricing'  },
] as const

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useUser()
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => { await logout() })
  }

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => { closeMobile() }, [pathname, closeMobile])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) closeMobile() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [closeMobile])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">

      {/* ── Main bar ─────────────────────────────────────── */}
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">

        {/* Left: logo + nav links */}
        <div className="flex items-center gap-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex items-center justify-center size-8 rounded-md bg-blue-600 shrink-0">
              <Layers className="size-4.5 text-white" strokeWidth={1.75} />
            </span>
            <span className="font-bold text-lg tracking-tight text-gray-900">PortalKit</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors py-1',
                    active
                      ? 'text-[#0051D5] font-semibold border-b-2 border-[#0051D5]'
                      : 'text-gray-600 hover:text-[#0051D5]'
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-gray-900 hover:text-[#0051D5] transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-2.5 text-sm font-medium text-gray-900 hover:text-[#0051D5] transition-colors"
            >
              Log In
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              disabled={pending}
              className="bg-[#0051D5] text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {pending ? 'Signing out…' : 'Sign out'}
            </button>
          ) : (
            <Link
              href="/auth"
              className="bg-[#0051D5] text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-200"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden flex items-center justify-center size-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
            onClick={closeMobile}
          />
          <div id="mobile-menu" className="md:hidden border-t border-gray-200 bg-white relative z-50">
            <nav className="flex flex-col">
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className={cn(
                      'px-6 py-4 text-sm font-medium border-b border-gray-100 transition-colors',
                      active
                        ? 'text-[#0051D5] bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex flex-col gap-3 px-6 py-5">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="w-full text-center px-5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { closeMobile(); handleSignOut() }}
                    disabled={pending}
                    className="w-full text-center bg-[#0051D5] text-white px-6 py-2.5 rounded text-sm font-medium disabled:opacity-60"
                  >
                    {pending ? 'Signing out…' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={closeMobile}
                    className="w-full text-center px-5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth"
                    onClick={closeMobile}
                    className="w-full text-center bg-[#0051D5] text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
