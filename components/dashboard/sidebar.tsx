'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, FileText, Settings,
  LogOut, Layers, FolderOpen, BookOpen, LifeBuoy, Zap,
  ChevronLeft, ChevronRight, MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const NAV = [
  { href: '/dashboard',          label: 'Dashboard', icon: LayoutDashboard, exact: true,  badge: false },
  { href: '/dashboard/projects', label: 'Projects',  icon: FolderOpen,      exact: false, badge: false },
  { href: '/dashboard/clients',  label: 'Clients',   icon: Users,           exact: false, badge: false },
  { href: '/dashboard/chats',    label: 'Chats',     icon: MessageSquare,   exact: false, badge: true  },
  { href: '/dashboard/invoices', label: 'Invoices',  icon: FileText,        exact: false, badge: false },
]

interface SidebarProps {
  profile: Profile | null
  unreadCount?: number
  clientCount?: number
  collapsed?: boolean
  onToggle?: () => void
}

/* Animated label — clips to 0 width when collapsed */
function Label({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        maxWidth: collapsed ? 0 : 160,
        opacity: collapsed ? 0 : 1,
        transition: 'max-width 220ms cubic-bezier(0.4,0,0.2,1), opacity 160ms',
      }}
      className="text-sm font-medium"
    >
      {children}
    </span>
  )
}

export function Sidebar({
  profile, unreadCount = 0, clientCount = 0, collapsed = true, onToggle,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const displayName = profile?.business_name || profile?.full_name || 'My Business'
  const plan = profile?.plan ?? 'free'

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth')
    })
  }

  const itemCls = (active: boolean) =>
    cn(
      'flex items-center rounded-md transition-all group',
      collapsed ? 'justify-center p-2 w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2.5 w-full',
      active
        ? 'bg-ds-secondary text-white'
        : 'text-slate-400 hover:bg-white/6 hover:text-white',
    )

  return (
    <TooltipProvider delayDuration={280}>
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col"
        style={{
          background: '#0b1527',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          width: collapsed ? 64 : 240,
          transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* ── Floating toggle button — sits outside the sidebar right edge ── */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-4.5 z-50 size-6 rounded-full bg-white border border-outline-variant/60 shadow-md flex items-center justify-center text-on-surface-variant hover:text-ds-secondary hover:border-ds-secondary/40 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="size-3" />
            : <ChevronLeft className="size-3" />}
        </button>

        {/* ── Logo ──────────────────────────────────── */}
        <div
          className="flex items-center h-14 shrink-0 px-3 gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span
            className="flex items-center justify-center size-8 rounded-md bg-ds-secondary shrink-0"
            style={{ boxShadow: '0 0 16px rgba(0,81,213,0.5)' }}
          >
            <Layers className="size-3.5 text-white" strokeWidth={1.75} />
          </span>

          <span
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: collapsed ? 0 : 110,
              opacity: collapsed ? 0 : 1,
              transition: 'max-width 220ms cubic-bezier(0.4,0,0.2,1), opacity 160ms',
            }}
            className="font-bold text-[15px] tracking-tight text-white"
          >
            PortalKit
          </span>

          {!collapsed && plan !== 'free' && (
            <span className={cn(
              'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0',
              plan === 'pro' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-400/20 text-amber-300',
            )}>
              {plan}
            </span>
          )}
        </div>

        {/* ── Main nav ──────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-0.5">
          {!collapsed && (
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-2.5 whitespace-nowrap"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Menu
            </p>
          )}

          {NAV.map(item => {
            const active = isActive(item.href, item.exact)
            const showBadge = item.badge && unreadCount > 0
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={itemCls(active)}
                    style={active ? { boxShadow: '0 4px 12px rgba(0,81,213,0.35)' } : undefined}
                  >
                    {/* Icon — with optional dot indicator when collapsed */}
                    <div className="relative shrink-0">
                      <item.icon
                        className={cn(
                          'transition-colors',
                          collapsed ? 'size-4.5' : 'size-4',
                          active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300',
                        )}
                      />
                      {collapsed && showBadge && (
                        <span className="absolute -top-1 -right-1.5 min-w-4 h-4 rounded-full bg-ds-secondary text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none">
                          {unreadCount > 99 ? '99' : unreadCount}
                        </span>
                      )}
                    </div>
                    <Label collapsed={collapsed}>{item.label}</Label>
                    {!collapsed && showBadge && (
                      <span className={cn(
                        'ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-4.5 text-center',
                        active ? 'bg-white/25 text-white' : 'bg-ds-secondary text-white',
                      )}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={14}>
                    {item.label}{showBadge ? ` · ${unreadCount} unread` : ''}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* ── Bottom section ────────────────────────── */}
        <div
          className="px-3 pb-4 pt-4 flex flex-col gap-0.5 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {!collapsed && (
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-2.5 whitespace-nowrap"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Support
            </p>
          )}

          {[
            { href: '/dashboard/settings', icon: Settings, label: 'Settings', isLink: true },
          ].map(item => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={itemCls(isActive(item.href, false))}
                >
                  <item.icon className={cn('shrink-0', collapsed ? 'size-4.5' : 'size-4')} />
                  <Label collapsed={collapsed}>{item.label}</Label>
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right" sideOffset={14}>{item.label}</TooltipContent>}
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://docs.portalkit.io"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center rounded-md transition-all text-slate-400 hover:bg-white/6 hover:text-white',
                  collapsed ? 'justify-center p-2 w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2.5 w-full',
                )}
              >
                <BookOpen className={cn('shrink-0', collapsed ? 'size-4.5' : 'size-4')} />
                <Label collapsed={collapsed}>Guide</Label>
              </a>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" sideOffset={14}>Guide</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="mailto:support@portalkit.io"
                className={cn(
                  'flex items-center rounded-md transition-all text-slate-400 hover:bg-white/6 hover:text-white',
                  collapsed ? 'justify-center p-2 w-10 h-10 mx-auto' : 'gap-2.5 px-3 py-2.5 w-full',
                )}
              >
                <LifeBuoy className={cn('shrink-0', collapsed ? 'size-4.5' : 'size-4')} />
                <Label collapsed={collapsed}>Help Center</Label>
              </a>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" sideOffset={14}>Help Center</TooltipContent>}
          </Tooltip>

          {/* Upgrade — free plan */}
          {plan === 'free' && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/settings/billing"
                    className="flex items-center justify-center w-10 h-10 mx-auto rounded-md mt-1 mb-1 transition-all hover:brightness-110 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,81,213,0.25), rgba(124,58,237,0.15))',
                      border: '1px solid rgba(0,81,213,0.3)',
                    }}
                  >
                    <Zap className="size-3.5 text-amber-400 fill-amber-400" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={14}>Upgrade to Pro</TooltipContent>
              </Tooltip>
            ) : (
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
                    <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider whitespace-nowrap">Free Plan</span>
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
                  <p className="text-[10px] whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {clientCount}/1 client{clientCount === 1 ? ' limit reached' : ' used'}
                  </p>
                </div>
              </Link>
            )
          )}

          {/* Profile */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex items-center justify-center w-10 h-10 mx-auto mt-1 rounded-md hover:bg-white/6 transition-all"
                  title="Log out"
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-ds-secondary/20 text-blue-300 font-bold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={14}>{displayName} · Log out</TooltipContent>
            </Tooltip>
          ) : (
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
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
