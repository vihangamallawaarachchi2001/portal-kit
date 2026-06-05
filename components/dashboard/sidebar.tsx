'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, FileText, Settings,
  LogOut, Layers, FolderOpen, BookOpen, LifeBuoy, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',          label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/projects', label: 'Projects',  icon: FolderOpen,      exact: false },
  { href: '/dashboard/clients',  label: 'Clients',   icon: Users,           exact: false },
  { href: '/dashboard/invoices', label: 'Invoices',  icon: FileText,        exact: false },
]

interface SidebarProps {
  profile: Profile | null
  unreadCount?: number
  clientCount?: number
}

export function Sidebar({ profile, unreadCount = 0, clientCount = 0 }: SidebarProps) {
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
    <aside
      className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col"
      style={{ background: '#0b1527', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 h-14 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="flex items-center justify-center size-8 rounded-md bg-ds-secondary shadow-lg shrink-0" style={{ boxShadow: '0 0 16px rgba(0,81,213,0.5)' }}>
          <Layers className="size-3.75 text-white" strokeWidth={1.75} />
        </span>
        <span className="font-bold text-[15px] tracking-tight text-white">PortalKit</span>
        {plan !== 'free' && (
          <span className={cn(
            'ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
            plan === 'pro' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-400/20 text-amber-300'
          )}>
            {plan}
          </span>
        )}
      </div>

      {/* ── Main nav ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-2.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Menu
        </p>

        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all group',
                active
                  ? 'bg-ds-secondary text-white'
                  : 'text-slate-400 hover:bg-white/6 hover:text-white'
              )}
              style={active ? { boxShadow: '0 4px 12px rgba(0,81,213,0.35)' } : undefined}
            >
              <item.icon className={cn('size-4 shrink-0 transition-colors', active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
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

      {/* ── Bottom section ───────────────────────────── */}
      <div
        className="px-3 pb-4 pt-4 flex flex-col gap-0.5 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-2.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Support
        </p>

        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
            isActive('/dashboard/settings', false)
              ? 'bg-ds-secondary text-white'
              : 'text-slate-400 hover:bg-white/6 hover:text-white'
          )}
        >
          <Settings className="size-4 shrink-0" />
          <span>Settings</span>
        </Link>

        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-white/6 hover:text-white transition-all"
        >
          <BookOpen className="size-4 shrink-0" />
          <span>Guide</span>
        </a>

        <a
          href="mailto:support@portalkit.io"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-white/6 hover:text-white transition-all"
        >
          <LifeBuoy className="size-4 shrink-0" />
          <span>Help Center</span>
        </a>

        {/* ── Upgrade card (free plan only) ───────────── */}
        {plan === 'free' && (
          <Link
            href="/dashboard/settings/billing"
            className="group flex flex-col gap-2 p-3 rounded-md mb-1 mt-1 transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, rgba(0,81,213,0.25) 0%, rgba(124,58,237,0.15) 100%)',
              border: '1px solid rgba(0,81,213,0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Free Plan</span>
              </div>
              <span className="text-[10px] font-semibold text-ds-secondary-container group-hover:text-white transition-colors">
                Upgrade →
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min((clientCount / 1) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {clientCount}/1 client{clientCount === 1 ? ' limit reached' : clientCount === 0 ? ' used' : ' used'}
              </p>
            </div>
          </Link>
        )}

        {/* ── Profile row ──────────────────────────────── */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 mt-2 rounded-md"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px] bg-ds-secondary/20 text-blue-300 font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white/90 truncate leading-tight">{displayName}</p>
            <p className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan} plan</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            title="Log out"
            className="size-7 rounded-md flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors hover:bg-white/6 shrink-0"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
