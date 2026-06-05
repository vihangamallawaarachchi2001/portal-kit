'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { DashboardHeader } from './dashboard-header'
import { UpgradeNudge } from './upgrade-nudge'
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

  useEffect(() => {
    const stored = localStorage.getItem('pk-sidebar')
    if (stored !== null) setCollapsed(stored === '1')
  }, [])

  function toggle() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('pk-sidebar', next ? '1' : '0')
      return next
    })
  }

  const sw = collapsed ? W_COLLAPSED : W_EXPANDED

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        profile={profile}
        unreadCount={unreadCount}
        clientCount={clientCount}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ marginLeft: sw, transition: 'margin-left 220ms cubic-bezier(0.4,0,0.2,1)' }}
      >
        <DashboardHeader profile={profile} unreadCount={unreadCount} sidebarWidth={sw} />
        <main className="flex-1 pt-14 min-h-screen">{children}</main>
      </div>
      {profile?.plan === 'free' && <UpgradeNudge />}
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
