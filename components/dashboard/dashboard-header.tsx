'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Plus, Bell, Settings, LogOut, User,
  Users, FileText, FolderOpen, ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile } from '@/types/database'
import { getInitials } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { AddClientModal } from './add-client-modal'
import Link from 'next/link'

const SECTION_TITLES: [string, string][] = [
  ['/dashboard/settings/billing', 'Billing'],
  ['/dashboard/settings/notifications', 'Notifications'],
  ['/dashboard/settings', 'Settings'],
  ['/dashboard/clients', 'Clients'],
  ['/dashboard/projects', 'Projects'],
  ['/dashboard/invoices', 'Invoices'],
  ['/dashboard', 'Dashboard'],
]

interface DashboardHeaderProps {
  profile: Profile | null
  unreadCount?: number
}

export function DashboardHeader({ profile, unreadCount = 0 }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [addClientOpen, setAddClientOpen] = useState(false)

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
        className="fixed top-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-sm border-b border-outline-variant flex items-center justify-between px-6"
        style={{ left: '240px' }}
      >
        <h2 className="text-sm font-semibold text-on-surface">{pageTitle}</h2>

        <div className="flex items-center gap-1">
          {/* Create dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm">
                <Plus className="size-3.5" strokeWidth={2.5} />
                <span>Create</span>
                <ChevronDown className="size-3 opacity-75" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-[11px] text-on-surface-variant font-medium">Quick actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAddClientOpen(true)}>
                <Users className="size-4 mr-2.5 text-on-surface-variant" />
                New Client
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/clients">
                  <FolderOpen className="size-4 mr-2.5 text-on-surface-variant" />
                  New Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices">
                  <FileText className="size-4 mr-2.5 text-on-surface-variant" />
                  New Invoice
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications bell */}
          <button className="relative size-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ml-1">
            <Bell className="size-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-ds-secondary ring-2 ring-white" />
            )}
          </button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-9 pl-2 pr-2 rounded-lg hover:bg-surface-container transition-colors ml-0.5">
                <Avatar className="size-7 shrink-0">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-outline-variant">
                <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-xs text-on-surface-variant capitalize">{plan} plan</p>
              </div>
              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <User className="size-4 mr-2.5 text-on-surface-variant" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/billing">
                    <Settings className="size-4 mr-2.5 text-on-surface-variant" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="size-4 mr-2.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
    </>
  )
}
