'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Paperclip, FileText, MessageSquare } from 'lucide-react'

const TABS = [
  { href: '',          label: 'Overview',  icon: LayoutGrid },
  { href: '/files',    label: 'Files',     icon: Paperclip },
  { href: '/invoices', label: 'Invoices',  icon: FileText },
  { href: '/messages', label: 'Messages',  icon: MessageSquare },
]

export function PortalTabBar({ slug }: { slug: string }) {
  const pathname = usePathname()
  const base = `/p/${slug}`

  return (
    <nav className="flex max-w-4xl mx-auto px-6 gap-0.5 -mb-px overflow-x-auto">
      {TABS.map(tab => {
        const href = `${base}${tab.href}`
        const exact = tab.href === ''
        const active = exact ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              active
                ? 'border-ds-secondary text-ds-secondary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
