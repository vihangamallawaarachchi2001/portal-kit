'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutGrid, Paperclip, FileText, CalendarDays, CalendarCheck, SlidersHorizontal } from 'lucide-react'
import type { WorkspacePermissions } from '@/lib/workspace'

const TABS: { suffix: string; label: string; Icon: React.ElementType; permKey?: keyof WorkspacePermissions | 'owner' }[] = [
  { suffix: '',                 label: 'Overview',        Icon: LayoutGrid },
  { suffix: '/files',           label: 'Files',           Icon: Paperclip,        permKey: 'files' },
  { suffix: '/invoices',        label: 'Invoices',        Icon: FileText,         permKey: 'invoices' },
  { suffix: '/milestones',      label: 'Milestones',      Icon: CalendarCheck,    permKey: 'projects' },
  { suffix: '/meetings',        label: 'Meetings',        Icon: CalendarDays,     permKey: 'projects' },
  { suffix: '/portal-settings', label: 'Portal Settings', Icon: SlidersHorizontal, permKey: 'owner' },
]

export function ClientTabBar({
  clientId,
  dark = false,
  isOwner = true,
  permissions,
}: {
  clientId: string
  dark?: boolean
  isOwner?: boolean
  permissions?: WorkspacePermissions
}) {
  const pathname = usePathname()

  const visibleTabs = TABS.filter(tab => {
    if (!tab.permKey) return true
    if (tab.permKey === 'owner') return isOwner
    if (!permissions) return true
    return permissions[tab.permKey]
  })

  return (
    <nav className="flex items-center -mb-px overflow-x-auto">
      {visibleTabs.map(tab => {
        const href     = `/dashboard/clients/${clientId}${tab.suffix}`
        const isActive = tab.suffix === ''
          ? pathname === href
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.suffix}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0',
              dark
                ? isActive
                  ? 'text-white border-white font-semibold'
                  : 'text-white/55 border-transparent hover:text-white/85 hover:border-white/25'
                : isActive
                  ? 'text-ds-secondary border-ds-secondary font-semibold'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/50',
            )}
          >
            <tab.Icon className="size-3.5 shrink-0" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
