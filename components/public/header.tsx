'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUser } from '../providers/auth-provider'

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing',  href: '/pricing'  },
  { label: 'About',    href: '/about'    },
] as const

export function Header() {
  const pathname   = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const { user } =  useUser();

  // Transparent-over-dark only on the home page hero
  const isTransparent = !scrolled && pathname === '/'

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Close on route change
  useEffect(() => { closeMobile() }, [pathname, closeMobile])

  // Close when resized to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) closeMobile() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [closeMobile])

  // Scroll-aware background — check initial position on mount
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-sm'
      )}
    >
      {/* ── Main bar ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center justify-center size-8 rounded-md bg-blue-600 shrink-0">
            <Layers className="size-4.5 text-white" strokeWidth={1.75} />
          </span>
          <span
            className={cn(
              'font-bold text-lg tracking-tight transition-colors duration-300',
              isTransparent ? 'text-white' : 'text-on-surface'
            )}
          >
            PortalKit
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-8 flex-1 justify-center"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative py-1 text-base font-medium transition-colors duration-200',
                  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isTransparent
                    ? active ? 'text-white' : 'text-white/70'
                    : active ? 'text-ds-secondary' : 'text-on-surface-variant'
                )}
              >
                {label}
                {active && (
                  <span
                    className={cn(
                      'absolute -bottom-0.5 inset-x-0 h-0.5 rounded-full',
                      isTransparent ? 'bg-white' : 'bg-ds-secondary'
                    )}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              'text-base font-medium',
              isTransparent ? 'text-white/80' : 'text-on-surface-variant'
            )}
          >
            {user ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/auth">Sign in</Link>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            className="text-base bg-ds-secondary text-on-ds-secondary font-semibold px-4"
          >
            <Link href="/auth">Start free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(prev => !prev)}
          className={cn(
            'md:hidden flex items-center justify-center size-9 rounded-md transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isTransparent
              ? 'text-white/80'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          )}
        >
          {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* ── Mobile menu panel ────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-outline-variant bg-surface-container-lowest"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className={cn(
                    'flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors',
                    'border-b border-outline-variant/40',
                    active
                      ? 'text-ds-secondary bg-surface-container-low'
                      : 'text-on-surface hover:bg-surface-container-low'
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full shrink-0',
                      active ? 'bg-ds-secondary' : 'bg-outline-variant'
                    )}
                  />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex flex-col gap-3 px-6 py-5">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center text-base text-on-surface-variant"
            >
              {user ? (
                <Link href="/dashboard">Dashboard</Link>
              ) : (
                <Link href="/auth">Sign in</Link>
              )}
            </Button>
            <Button
              asChild
              className="w-full justify-center text-base bg-ds-secondary text-on-ds-secondary font-semibold"
            >
              <Link href="/auth">Start free — no credit card needed</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
