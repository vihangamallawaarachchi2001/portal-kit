'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { DashboardHeader } from './dashboard-header'
import { UpgradeNudge } from './upgrade-nudge'
import { ProfileNudges } from './profile-nudges'
import { Toaster } from '@/components/ui/sonner'
import { Profile } from '@/types/database'

const W_EXPANDED = 240
const W_COLLAPSED = 64

interface DashboardShellProps {
  profile: Profile | null
  unreadCount: number
  clientCount: number
  children: React.ReactNode
}

export function DashboardShell({ profile, unreadCount, clientCount, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pk-sidebar')
    if (stored !== null) setCollapsed(stored === '1')

    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function toggle() {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => {
        const next = !prev
        localStorage.setItem('pk-sidebar', next ? '1' : '0')
        return next
      })
    }
  }

  const sw = collapsed ? W_COLLAPSED : W_EXPANDED
  const contentMargin = isMobile ? 0 : sw

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        profile={profile}
        unreadCount={unreadCount}
        clientCount={clientCount}
        collapsed={isMobile ? false : collapsed}
        onToggle={toggle}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ marginLeft: contentMargin, transition: 'margin-left 220ms cubic-bezier(0.4,0,0.2,1)' }}
      >
        <DashboardHeader
          profile={profile}
          unreadCount={unreadCount}
          sidebarWidth={contentMargin}
          onMobileMenuClick={isMobile ? toggle : undefined}
        />
        <main className="flex-1 pt-14 min-h-screen">
          {profile && (
            <ProfileNudges
              businessName={profile.business_name}
              avatarUrl={profile.avatar_url}
              stripeConnected={profile.stripe_connect_onboarded}
              stripeSkipped={profile.stripe_onboarding_skipped ?? false}
            />
          )}
          {children}
        </main>
      </div>

      {profile?.plan === 'free' && <UpgradeNudge />}
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
