'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Layers,
  ChevronRight,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { Profile } from '@/types/database'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText, exact: false },
]

const BOTTOM_NAV = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  profile: Profile | null
  unreadCount?: number
}

export function Sidebar({ profile, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const displayName = profile?.business_name || profile?.full_name || 'My Business'
  const plan = profile?.plan ?? 'free'

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-outline-variant">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-outline-variant shrink-0">
        <span className="flex items-center justify-center size-7 rounded-md bg-ds-secondary shrink-0">
          <Layers className="size-[15px] text-white" strokeWidth={1.75} />
        </span>
        <span className="font-bold text-base tracking-tight text-on-surface">PortalKit</span>
        {plan !== 'free' && (
          <span className={cn(
            'ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
            plan === 'pro' ? 'bg-ds-secondary/10 text-ds-secondary' : 'bg-amber-50 text-amber-700'
          )}>
            {plan}
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-ds-secondary/10 text-ds-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )}
            >
              <item.icon className={cn('size-4 shrink-0', active ? 'text-ds-secondary' : 'text-on-surface-variant group-hover:text-on-surface')} />
              <span>{item.label}</span>
              {item.label === 'Dashboard' && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {active && <ChevronRight className="ml-auto size-3 text-ds-secondary" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 flex flex-col gap-0.5 border-t border-outline-variant pt-3">
        {BOTTOM_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.href, false)
                ? 'bg-ds-secondary/10 text-ds-secondary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Profile row */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg bg-surface-container">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant truncate capitalize">{plan} plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
