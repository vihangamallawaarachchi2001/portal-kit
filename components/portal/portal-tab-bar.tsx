'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Paperclip, FileText, MessageSquare, CalendarDays, CalendarCheck } from 'lucide-react'

const TABS = [
  { href: '',            label: 'Overview',  icon: LayoutGrid },
  { href: '/files',      label: 'Files',     icon: Paperclip },
  { href: '/invoices',   label: 'Invoices',  icon: FileText },
  { href: '/milestones', label: 'Milestones', icon: CalendarCheck },
  { href: '/meetings',   label: 'Meetings',   icon: CalendarDays },
  { href: '/messages',   label: 'Messages',  icon: MessageSquare },
]

export function PortalTabBar({ slug, dark }: { slug: string; dark?: boolean }) {
  const pathname = usePathname()
  const base = `/p/${slug}`

  return (
    <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide">
      {TABS.map(tab => {
        const href = `${base}${tab.href}`
        const exact = tab.href === ''
        const active = exact ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
              dark
                ? active
                  ? 'border-white text-white'
                  : 'border-transparent text-white/55 hover:text-white/85 hover:border-white/30'
                : active
                  ? 'border-ds-secondary text-ds-secondary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
            )}
          >
            <tab.icon className="size-3.5 shrink-0" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
