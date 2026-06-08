'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Plus, Settings, LogOut, User,
  Users, FileText, FolderOpen, ChevronDown,
  ExternalLink, Menu,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile } from '@/types/database'
import { getInitials } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { AddClientModal } from './add-client-modal'
import { CreateProjectModal } from './create-project-modal'
import { NotificationBell } from './notification-drawer'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SECTION_TITLES: [string, string][] = [
  ['/dashboard/settings/billing',       'Billing'],
  ['/dashboard/settings/notifications', 'Notifications'],
  ['/dashboard/settings',               'Settings'],
  ['/dashboard/clients',                'Clients'],
  ['/dashboard/projects',               'Projects'],
  ['/dashboard/invoices',               'Invoices'],
  ['/dashboard/chats',                  'Messages'],
  ['/dashboard/files',                  'Files'],
  ['/dashboard',                        'Dashboard'],
]

const CREATE_ACTIONS = [
  {
    label: 'New Client',
    description: 'Create a client portal',
    icon: Users,
    iconBg: 'bg-ds-secondary/10',
    iconColor: 'text-ds-secondary',
    action: 'modal' as const,
  },
  {
    label: 'New Project',
    description: 'Add work inside a portal',
    icon: FolderOpen,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    action: 'project-modal' as const,
  },
  {
    label: 'New Invoice',
    description: 'Send & collect payment',
    icon: FileText,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/dashboard/invoices',
  },
]

interface DashboardHeaderProps {
  profile: Profile | null
  unreadCount?: number
  sidebarWidth?: number
  onMobileMenuClick?: () => void
}

export function DashboardHeader({ profile, unreadCount = 0, sidebarWidth = 240, onMobileMenuClick }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [addClientOpen, setAddClientOpen]     = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)

  const displayName = profile?.business_name || profile?.full_name || 'My Account'
  const plan = profile?.plan ?? 'free'
  const pageTitle = SECTION_TITLES.find(([path]) => pathname.startsWith(path))?.[1] ?? 'Dashboard'

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth')
    })
  }

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-6"
        style={{
          left: sidebarWidth,
          transition: 'left 220ms cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(198,198,205,0.45)',
        }}
      >
        {/* Mobile hamburger + page title */}
        <div className="flex items-center gap-2.5">
          {onMobileMenuClick && (
            <button
              onClick={onMobileMenuClick}
              className="size-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors -ml-1"
              aria-label="Open menu"
            >
              <Menu className="size-4.5" />
            </button>
          )}
          <p className="text-sm font-semibold text-on-surface">{pageTitle}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* ── Create dropdown ─────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-ds-secondary text-white text-[13px] font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm">
                <Plus className="size-3.5" strokeWidth={2.5} />
                <span>Create</span>
                <ChevronDown className="size-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5" sideOffset={8}>
              {/* Header label */}
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest px-2 pt-1 pb-2">
                Quick create
              </p>

              {CREATE_ACTIONS.map(item => {
                const isModalAction = item.action === 'modal' || item.action === 'project-modal'
                const onClick = item.action === 'modal'
                  ? () => setAddClientOpen(true)
                  : item.action === 'project-modal'
                    ? () => setProjectModalOpen(true)
                    : undefined

                return isModalAction ? (
                  <button
                    key={item.label}
                    onClick={onClick}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-container-low transition-colors group text-left"
                  >
                    <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', item.iconBg)}>
                      <item.icon className={cn('size-4', item.iconColor)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface leading-tight">{item.label}</p>
                      <p className="text-[11px] text-on-surface-variant">{item.description}</p>
                    </div>
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-container-low transition-colors group"
                  >
                    <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', item.iconBg)}>
                      <item.icon className={cn('size-4', item.iconColor)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface leading-tight">{item.label}</p>
                      <p className="text-[11px] text-on-surface-variant">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Bell / Notification drawer ───────── */}
          <NotificationBell unreadCount={unreadCount} />

          {/* ── Profile dropdown ────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-9 pl-1.5 pr-2 rounded-md hover:bg-surface-container transition-colors ml-0.5">
                <Avatar className="size-7 shrink-0">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 p-0 overflow-hidden" sideOffset={8}>
              {/* ── User info header ─────────────────── */}
              <div className="px-4 py-3.5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(0,81,213,0.06) 0%, transparent 100%)' }}>
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-sm bg-ds-secondary/15 text-ds-secondary font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate leading-tight">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                      plan === 'free'
                        ? 'bg-surface-container text-on-surface-variant'
                        : plan === 'pro'
                          ? 'bg-ds-secondary/10 text-ds-secondary'
                          : 'bg-amber-50 text-amber-700'
                    )}>
                      {plan}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="my-0" />

              {/* ── Nav items ────────────────────────── */}
              <div className="p-1.5">
                <DropdownMenuItem asChild className="rounded-md px-3 py-2 gap-3 cursor-pointer">
                  <Link href="/dashboard/settings">
                    <div className="size-7 rounded-md bg-surface-container flex items-center justify-center shrink-0">
                      <User className="size-3.5 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface leading-tight">Profile</p>
                      <p className="text-[11px] text-on-surface-variant">Name, photo, tagline</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-md px-3 py-2 gap-3 cursor-pointer">
                  <Link href="/dashboard/settings/billing">
                    <div className="size-7 rounded-md bg-surface-container flex items-center justify-center shrink-0">
                      <Settings className="size-3.5 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface leading-tight">Settings</p>
                      <p className="text-[11px] text-on-surface-variant">Plan, billing, notifications</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-md px-3 py-2 gap-3 cursor-pointer">
                  <a href="https://docs.portalkit.io" target="_blank" rel="noopener noreferrer">
                    <div className="size-7 rounded-md bg-surface-container flex items-center justify-center shrink-0">
                      <ExternalLink className="size-3.5 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface leading-tight">Documentation</p>
                      <p className="text-[11px] text-on-surface-variant">Guides and references</p>
                    </div>
                  </a>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-0" />

              {/* ── Logout ───────────────────────────── */}
              <div className="p-1.5">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 gap-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <div className="size-7 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="size-3.5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">Log out</p>
                    <p className="text-[11px] text-red-400">End your session</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
      <CreateProjectModal open={projectModalOpen} onOpenChange={setProjectModalOpen} />
    </>
  )
}
