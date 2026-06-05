'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutGrid, Paperclip, FileText, MessageSquare } from 'lucide-react'

const TABS = [
  { suffix: '',          label: 'Overview',  Icon: LayoutGrid    },
  { suffix: '/files',    label: 'Files',     Icon: Paperclip     },
  { suffix: '/invoices', label: 'Invoices',  Icon: FileText      },
  { suffix: '/messages', label: 'Messages',  Icon: MessageSquare },
]

export function ClientTabBar({ clientId, unreadMessages = 0 }: { clientId: string; unreadMessages?: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center -mb-px">
      {TABS.map(tab => {
        const href    = `/dashboard/clients/${clientId}${tab.suffix}`
        const isActive = tab.suffix === ''
          ? pathname === href
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.suffix}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all',
              isActive
                ? 'text-ds-secondary border-ds-secondary font-semibold'
                : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/50'
            )}
          >
            <tab.Icon className="size-3.5" />
            {tab.label}
            {tab.label === 'Messages' && unreadMessages > 0 && (
              <span className="ml-0.5 text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5 min-w-4.5 text-center leading-none">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
