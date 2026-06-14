'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Paperclip, FileText, MessageSquare, CalendarDays, CalendarCheck } from 'lucide-react'
import type { PortalFeatures } from '@/lib/validations'

const ALL_TABS = [
  { href: '',            label: 'Overview',   icon: LayoutGrid,    feature: null           },
  { href: '/files',      label: 'Files',      icon: Paperclip,     feature: 'files'        },
  { href: '/invoices',   label: 'Invoices',   icon: FileText,      feature: 'invoices'     },
  { href: '/milestones', label: 'Milestones', icon: CalendarCheck, feature: 'milestones'   },
  { href: '/meetings',   label: 'Meetings',   icon: CalendarDays,  feature: 'meetings'     },
  { href: '/messages',   label: 'Messages',   icon: MessageSquare, feature: 'messages'     },
] as const

export function PortalTabBar({
  slug,
  dark,
  features,
}: {
  slug: string
  dark?: boolean
  features?: PortalFeatures | null
}) {
  const pathname = usePathname()
  const base = `/p/${slug}`

  const tabs = features
    ? ALL_TABS.filter(t => t.feature === null || features[t.feature as keyof PortalFeatures] !== false)
    : ALL_TABS

  return (
    <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide">
      {tabs.map(tab => {
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
