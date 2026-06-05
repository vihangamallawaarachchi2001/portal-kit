'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Layers, FolderOpen, BookOpen, HelpCircle,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen, exact: false },
  { href: '/dashboard/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText, exact: false },
]

interface SidebarProps {
  profile: Profile | null
  unreadCount?: number
}

export function Sidebar({ profile, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const displayName = profile?.business_name || profile?.full_name || 'My Business'
  const plan = profile?.plan ?? 'free'

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth')
    })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-outline-variant">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-outline-variant shrink-0">
        <span className="flex items-center justify-center size-8 rounded-lg bg-ds-secondary shrink-0 shadow-sm">
          <Layers className="size-3.75 text-white" strokeWidth={1.75} />
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
        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                active
                  ? 'bg-ds-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )}
            >
              <item.icon className={cn(
                'size-4 shrink-0 transition-colors',
                active ? 'text-white' : 'text-on-surface-variant group-hover:text-on-surface'
              )} />
              <span>{item.label}</span>
              {item.label === 'Dashboard' && unreadCount > 0 && (
                <span className={cn(
                  'ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-4.5 text-center',
                  active ? 'bg-white/25 text-white' : 'bg-ds-secondary text-white'
                )}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>

              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3 flex flex-col gap-0.5 border-t border-outline-variant pt-3 shrink-0">
        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest px-3 mb-2">
          Support
        </p>

        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            isActive('/dashboard/settings', false)
              ? 'bg-ds-secondary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          )}
        >
          <Settings className="size-4 shrink-0" />
          <span>Settings</span>
        </Link>

        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <BookOpen className="size-4 shrink-0" />
          <span>Guide</span>
        </a>

        <a
          href="mailto:support@portalkit.io"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <HelpCircle className="size-4 shrink-0" />
          <span>Help Center</span>
        </a>

        {/* Profile + logout row */}
        <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-xl bg-surface-container">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px] bg-ds-secondary/15 text-ds-secondary font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant capitalize">{plan} plan</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            title="Log out"
            className="size-6 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-outline-variant/30 hover:text-red-600 transition-colors shrink-0"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
